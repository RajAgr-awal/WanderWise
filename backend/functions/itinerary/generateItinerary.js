/**
 * 4.4 generateItinerary (callable) — the core feature.
 *
 * Design note: Claude *selects and sequences* from a curated candidate list, it never
 * invents places. Prices, ratings and categories are re-attached server-side from the
 * source Firestore docs after the model responds, so no hallucinated number can reach
 * the UI (spec §4.4 step 5).
 */
const { onCall } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { db, FieldValue } = require('../lib/firebase');
const { requireAuth, requireTier, requireInt, requireArray, HttpsError } = require('../lib/errors');
const { computeEstimate } = require('../estimate/calculateEstimate');
const claude = require('../lib/claudeClient');

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

const POI_PERIODS = ['morning', 'afternoon', 'evening', 'night'];
const FOOD_PERIODS = ['lunch', 'dinner'];
const ALL_PERIODS = ['morning', 'afternoon', 'lunch', 'evening', 'dinner', 'night'];

/** Split a total day count across cities, remainder to the earliest legs. */
function allocateDays(cityIds, durationDays, provided) {
  if (provided && typeof provided === 'object') {
    const legs = cityIds.map((id) => ({ cityId: id, days: Number(provided[id]) || 0 }));
    const sum = legs.reduce((s, l) => s + l.days, 0);
    if (sum !== durationDays) {
      throw new HttpsError('invalid-argument',
        `perCityDays sums to ${sum} but durationDays is ${durationDays}.`);
    }
    return legs.filter((l) => l.days > 0);
  }
  const base = Math.floor(durationDays / cityIds.length);
  const extra = durationDays % cityIds.length;
  return cityIds
    .map((id, i) => ({ cityId: id, days: base + (i < extra ? 1 : 0) }))
    .filter((l) => l.days > 0);
}

async function loadCandidates(cityIds) {
  const [citySnaps, poiSnap, restSnap] = await Promise.all([
    db.getAll(...cityIds.map((id) => db.collection('cities').doc(id))),
    db.collection('pois').where('cityId', 'in', cityIds.slice(0, 10)).get(),
    db.collection('restaurants').where('cityId', 'in', cityIds.slice(0, 10)).get(),
  ]);

  const cities = new Map();
  citySnaps.forEach((s) => {
    if (!s.exists) throw new HttpsError('not-found', `City "${s.id}" does not exist.`);
    cities.set(s.id, { id: s.id, ...s.data() });
  });

  const pois = poiSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const restaurants = restSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  for (const id of cityIds) {
    if (!pois.some((p) => p.cityId === id)) {
      throw new HttpsError('failed-precondition',
        `No POIs seeded for "${id}". Run the seed script before generating itineraries.`);
    }
  }
  return { cities, pois, restaurants };
}

function buildPrompt({ legs, cities, pois, restaurants, budgetTier, durationDays }) {
  const cityBlocks = legs.map((leg) => {
    const city = cities.get(leg.cityId);
    const cityPois = pois.filter((p) => p.cityId === leg.cityId);
    const cityRests = restaurants.filter((r) => r.cityId === leg.cityId);
    return [
      `## ${city.name} (cityId: ${city.id}) — ${leg.days} day(s)`,
      `Description: ${city.description}`,
      '',
      'ATTRACTIONS (choose morning/afternoon/evening/night slots from these only):',
      ...cityPois.map((p) =>
        `- poiId=${p.id} | ${p.name} | category=${p.category} | price=${p.price} | rating=${p.rating}`),
      '',
      'RESTAURANTS (choose lunch/dinner slots from these only):',
      ...cityRests.map((r) =>
        `- restaurantId=${r.id} | ${r.name} | area=${r.area} | mustTry=${r.mustTryDish} | priceForTwo=${r.priceForTwo}`),
    ].join('\n');
  }).join('\n\n');

  return [
    `Plan a ${durationDays}-day trip on a "${budgetTier}" budget.`,
    '',
    'City allocation, in travel order:',
    ...legs.map((l, i) => `${i + 1}. ${cities.get(l.cityId).name} — days ${l.days}`),
    '',
    cityBlocks,
    '',
    'RULES',
    '- Use ONLY the ids listed above. Never invent a place.',
    '- Do not repeat the same poiId on more than one day unless the trip is longer than the POI list.',
    '- Group geographically sensible stops on the same day; do not zig-zag across the city.',
    '- A "budget" trip should favour free/low-cost POIs and cheap restaurants; "luxury" the reverse.',
    '- Every day must contain exactly these six periods: morning, afternoon, lunch, evening, dinner, night.',
    '- lunch and dinner must reference a restaurantId; the other four must reference a poiId.',
    '- dayNumber runs 1..' + durationDays + ' continuously across all cities.',
    '',
    'Return JSON of exactly this shape:',
    '{"days":[{"dayNumber":1,"cityId":"jaipur","slots":[{"period":"morning","refType":"poi","refId":"poi_xyz"}]}]}',
  ].join('\n');
}

function makeValidator({ durationDays, poiIds, restIds }) {
  return (data) => {
    if (!data || !Array.isArray(data.days)) return 'Top-level "days" array missing.';
    if (data.days.length !== durationDays) {
      return `Expected ${durationDays} days, received ${data.days.length}.`;
    }
    for (const day of data.days) {
      if (!Number.isInteger(day.dayNumber)) return 'A day is missing an integer dayNumber.';
      if (!Array.isArray(day.slots) || !day.slots.length) return `Day ${day.dayNumber} has no slots.`;
      for (const slot of day.slots) {
        if (!ALL_PERIODS.includes(slot.period)) {
          return `Day ${day.dayNumber}: unknown period "${slot.period}".`;
        }
        if (slot.refType === 'poi' && !poiIds.has(slot.refId)) {
          return `Day ${day.dayNumber}: unknown poiId "${slot.refId}".`;
        }
        if (slot.refType === 'restaurant' && !restIds.has(slot.refId)) {
          return `Day ${day.dayNumber}: unknown restaurantId "${slot.refId}".`;
        }
        if (!['poi', 'restaurant'].includes(slot.refType)) {
          return `Day ${day.dayNumber}: refType must be "poi" or "restaurant".`;
        }
      }
    }
    return null;
  };
}

/**
 * Deterministic fallback used when ANTHROPIC_API_KEY is absent (emulator/CI) or the
 * model fails twice. Guarantees the feature degrades to a usable itinerary rather
 * than an error screen.
 */
function fallbackPlan({ legs, pois, restaurants }) {
  const days = [];
  let dayNumber = 1;
  for (const leg of legs) {
    const cityPois = pois.filter((p) => p.cityId === leg.cityId)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const cityRests = restaurants.filter((r) => r.cityId === leg.cityId);
    for (let d = 0; d < leg.days; d++) {
      const slots = [];
      POI_PERIODS.forEach((period, i) => {
        const poi = cityPois[(d * POI_PERIODS.length + i) % cityPois.length];
        if (poi) slots.push({ period, refType: 'poi', refId: poi.id });
      });
      FOOD_PERIODS.forEach((period, i) => {
        const r = cityRests[(d * FOOD_PERIODS.length + i) % Math.max(1, cityRests.length)];
        if (r) slots.push({ period, refType: 'restaurant', refId: r.id });
      });
      const order = ALL_PERIODS;
      slots.sort((a, b) => order.indexOf(a.period) - order.indexOf(b.period));
      days.push({ dayNumber: dayNumber++, cityId: leg.cityId, slots });
    }
  }
  return { days };
}

/** Re-attach trusted server-side data to the model's id-only selection. */
function hydrate(plan, { pois, restaurants, cities }) {
  const poiById = new Map(pois.map((p) => [p.id, p]));
  const restById = new Map(restaurants.map((r) => [r.id, r]));

  return {
    days: plan.days
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map((day) => ({
        dayNumber: day.dayNumber,
        cityId: day.cityId,
        cityName: cities.get(day.cityId)?.name || null,
        slots: day.slots
          .sort((a, b) => ALL_PERIODS.indexOf(a.period) - ALL_PERIODS.indexOf(b.period))
          .map((slot) => {
            const base = { period: slot.period, refType: slot.refType, refId: slot.refId, checked: true };
            if (slot.refType === 'poi') {
              const p = poiById.get(slot.refId);
              return { ...base, name: p.name, category: p.category, description: p.description,
                price: p.price, rating: p.rating, imageUrl: p.imageUrl || null,
                lat: p.lat ?? null, lng: p.lng ?? null };
            }
            const r = restById.get(slot.refId);
            return { ...base, name: r.name, area: r.area, description: r.description,
              mustTryDish: r.mustTryDish, priceForTwo: r.priceForTwo,
              lat: r.lat ?? null, lng: r.lng ?? null };
          }),
      })),
  };
}

exports.generateItinerary = onCall(
  { cors: true, secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 120, memory: '512MiB' },
  async (request) => {
    const uid = requireAuth(request);
    const data = request.data || {};

    const cityIds = requireArray(data.cityIds, 'cityIds', { min: 1, max: 10 }).map(String);
    const durationDays = requireInt(data.durationDays, 'durationDays', { min: 1, max: 30 });
    const budgetTier = requireTier(data.budgetTier);
    const legs = allocateDays(cityIds, durationDays, data.perCityDays);

    const { cities, pois, restaurants } = await loadCandidates(cityIds);
    const estimate = await computeEstimate(legs, budgetTier);

    let plan;
    let generatedBy = 'claude';
    if (claude.isConfigured()) {
      try {
        plan = await claude.requestJson({
          system: 'You are an expert Indian travel planner. You select and sequence real, ' +
                  'pre-vetted places from a supplied catalog. You respond with JSON only.',
          prompt: buildPrompt({ legs, cities, pois, restaurants, budgetTier, durationDays }),
          validate: makeValidator({
            durationDays,
            poiIds: new Set(pois.map((p) => p.id)),
            restIds: new Set(restaurants.map((r) => r.id)),
          }),
          maxTokens: 8192,
        });
      } catch (err) {
        console.error('Claude itinerary generation failed, using deterministic fallback', err);
        plan = fallbackPlan({ legs, pois, restaurants });
        generatedBy = 'fallback';
      }
    } else {
      plan = fallbackPlan({ legs, pois, restaurants });
      generatedBy = 'fallback';
    }

    const itinerary = hydrate(plan, { pois, restaurants, cities });

    const tripRef = data.tripId
      ? db.collection('users').doc(uid).collection('trips').doc(String(data.tripId))
      : db.collection('users').doc(uid).collection('trips').doc();

    const title = data.title
      || (legs.length === 1
        ? cities.get(legs[0].cityId).name
        : `${cities.get(legs[0].cityId).name} + ${legs.length - 1} more`);

    const trip = {
      type: data.type || (cityIds.length > 1 ? 'multi-city' : 'single-city'),
      title,
      cityIds,
      perCityDays: Object.fromEntries(legs.map((l) => [l.cityId, l.days])),
      durationDays,
      budgetTier,
      estimatedTotal: estimate.estimatedTotal,
      perDayCost: estimate.perDayCost,
      costBreakdown: estimate.breakdown,
      status: 'generated',
      generatedBy,
      itinerary,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await tripRef.set(trip, { merge: true });

    return { tripId: tripRef.id, ...trip, createdAt: Date.now(), updatedAt: Date.now() };
  }
);

// Exported for unit tests.
exports._internal = { allocateDays, fallbackPlan, hydrate, makeValidator, buildPrompt };
