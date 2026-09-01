/**
 * 4.5 buildRoute (callable) — powers "Design your own tour".
 *
 * Three actions on one endpoint:
 *   estimate  (default) — validate legs, return running totals + suggestions
 *   create             — hand off to generateItinerary across all legs
 *   saveTemplate       — persist the route to /users/{uid}/templates
 */
const { onCall } = require('firebase-functions/v2/https');
const { db, FieldValue } = require('../lib/firebase');
const { requireAuth, requireTier, requireInt, requireArray, requireString, HttpsError } = require('../lib/errors');
const { computeEstimate } = require('../estimate/calculateEstimate');
const { haversine } = require('../lib/distance');

const MAX_LEGS = 10;

/** Rough transit time between two cities: haversine / assumed mode speed. */
function transitEstimate(a, b) {
  if (!a?.lat || !b?.lat) return { km: null, hours: a?.country === b?.country ? 4 : 8 };
  const km = haversine(a, b);
  // <300 km assume road/rail at ~55 km/h; beyond that assume a flight + 3h overhead.
  const hours = km <= 300 ? km / 55 : km / 700 + 3;
  return { km: Math.round(km), hours: Math.round(hours * 10) / 10 };
}

exports.buildRoute = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const data = request.data || {};
  const action = data.action || 'estimate';
  const budgetTier = requireTier(data.budgetTier);

  const rawLegs = requireArray(data.legs, 'legs', { min: 1, max: MAX_LEGS });
  const legs = rawLegs.map((l) => ({
    cityId: requireString(l.cityId, 'legs[].cityId'),
    days: requireInt(l.days, 'legs[].days', { min: 1, max: 30 }),
  }));

  const uniqueIds = new Set(legs.map((l) => l.cityId));
  if (uniqueIds.size !== legs.length) {
    throw new HttpsError('invalid-argument', 'A city may only appear once in a route.');
  }

  // Validate every city exists and is bookable.
  const citySnaps = await db.getAll(...legs.map((l) => db.collection('cities').doc(l.cityId)));
  const cities = new Map();
  citySnaps.forEach((s) => {
    if (!s.exists) throw new HttpsError('not-found', `City "${s.id}" does not exist.`);
    const d = s.data();
    if (d.isComingSoon) throw new HttpsError('failed-precondition', `${d.name} is not bookable yet.`);
    cities.set(s.id, { id: s.id, ...d });
  });

  const estimate = await computeEstimate(legs, budgetTier);

  // Transit legs between consecutive cities.
  const transits = [];
  for (let i = 1; i < legs.length; i++) {
    const a = cities.get(legs[i - 1].cityId);
    const b = cities.get(legs[i].cityId);
    const t = transitEstimate(a, b);
    transits.push({ fromCityId: a.id, toCityId: b.id, fromName: a.name, toName: b.name, ...t });
  }
  const transitHours = Math.round(transits.reduce((s, t) => s + t.hours, 0) * 10) / 10;

  if (action === 'saveTemplate') {
    const name = requireString(data.name, 'name');
    const ref = db.collection('users').doc(uid).collection('templates').doc();
    const template = {
      name,
      notes: typeof data.notes === 'string' ? data.notes.slice(0, 500) : '',
      cityIds: legs.map((l) => l.cityId),
      perCityDays: Object.fromEntries(legs.map((l) => [l.cityId, l.days])),
      budgetTier,
      totalTime: estimate.durationDays,
      transitHours,
      totalCost: estimate.estimatedTotal,
      createdAt: FieldValue.serverTimestamp(),
    };
    await ref.set(template);
    return { templateId: ref.id, ...template, createdAt: Date.now() };
  }

  if (action === 'create') {
    // Delegate to the shared generator so multi-city trips go through identical logic.
    const { generateItinerary } = require('./generateItinerary');
    const inner = await generateItinerary.run({
      auth: request.auth,
      data: {
        cityIds: legs.map((l) => l.cityId),
        durationDays: estimate.durationDays,
        perCityDays: Object.fromEntries(legs.map((l) => [l.cityId, l.days])),
        budgetTier,
        type: 'multi-city',
      },
    });
    return inner;
  }

  // Default: estimate + "you might also add" suggestions.
  const lastCity = cities.get(legs[legs.length - 1].cityId);
  const suggestionSnap = await db.collection('cities')
    .where('isComingSoon', '==', false)
    .limit(60)
    .get();

  const suggestions = suggestionSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((c) => !uniqueIds.has(c.id))
    .map((c) => ({
      ...c,
      _score: (c.country === lastCity.country ? 0 : 1000) + (c.lat ? haversine(lastCity, c) : 500),
    }))
    .sort((a, b) => a._score - b._score)
    .slice(0, 6)
    .map((c) => ({
      cityId: c.id,
      name: c.name,
      country: c.country,
      heroImageUrl: c.heroImageUrl,
      pricePerDay: c.pricePerDay[budgetTier],
      approxDistanceKm: c.lat ? Math.round(haversine(lastCity, c)) : null,
    }));

  return {
    legs: estimate.breakdown,
    transits,
    totals: {
      days: estimate.durationDays,
      transitHours,
      estimatedTotal: estimate.estimatedTotal,
      perDayCost: estimate.perDayCost,
      currency: 'INR',
    },
    suggestions,
    limits: { maxLegs: MAX_LEGS, used: legs.length },
  };
});
