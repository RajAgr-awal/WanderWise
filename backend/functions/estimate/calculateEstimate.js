/**
 * 4.3 calculateEstimate (callable)
 * Pure server-side cost calculation. The client never computes the authoritative
 * total — this is the single source of truth for both the single-city setup screen
 * and the multi-city route builder.
 */
const { onCall } = require('firebase-functions/v2/https');
const { db } = require('../lib/firebase');
const { requireAuth, requireTier, requireInt, HttpsError } = require('../lib/errors');

/**
 * Shared internal helper, also imported by generateItinerary and buildRoute so
 * that every code path produces an identical number.
 * @param {Array<{cityId:string, days:number}>} legs
 */
async function computeEstimate(legs, budgetTier) {
  const ids = [...new Set(legs.map((l) => l.cityId))];
  const snaps = await db.getAll(...ids.map((id) => db.collection('cities').doc(id)));
  const byId = new Map();
  snaps.forEach((s) => {
    if (!s.exists) throw new HttpsError('not-found', `City "${s.id}" does not exist.`);
    byId.set(s.id, s.data());
  });

  const breakdown = legs.map((leg) => {
    const city = byId.get(leg.cityId);
    const perDay = city.pricePerDay?.[budgetTier];
    if (typeof perDay !== 'number') {
      throw new HttpsError('failed-precondition', `City "${leg.cityId}" has no ${budgetTier} price.`);
    }
    return {
      cityId: leg.cityId,
      cityName: city.name,
      days: leg.days,
      perDayCost: perDay,
      subtotal: perDay * leg.days,
    };
  });

  const durationDays = breakdown.reduce((s, b) => s + b.days, 0);
  const estimatedTotal = breakdown.reduce((s, b) => s + b.subtotal, 0);

  return {
    breakdown,
    durationDays,
    estimatedTotal,
    perDayCost: durationDays ? Math.round(estimatedTotal / durationDays) : 0,
    budgetTier,
    currency: 'INR',
  };
}

exports.computeEstimate = computeEstimate;

exports.calculateEstimate = onCall({ cors: true }, async (request) => {
  requireAuth(request);
  const { cityIds, cityId, durationDays, budgetTier, legs } = request.data || {};
  const tier = requireTier(budgetTier);

  // Accepts three shapes: single city, city list + total days, or explicit legs.
  let normalised;
  if (Array.isArray(legs) && legs.length) {
    normalised = legs.map((l) => ({
      cityId: String(l.cityId),
      days: requireInt(l.days, 'legs[].days', { min: 1, max: 30 }),
    }));
  } else {
    const ids = Array.isArray(cityIds) && cityIds.length ? cityIds : [cityId].filter(Boolean);
    if (!ids.length) throw new HttpsError('invalid-argument', 'Provide cityId, cityIds or legs.');
    const total = requireInt(durationDays, 'durationDays', { min: 1, max: 60 });
    // Even split, remainder to the earliest cities.
    const base = Math.floor(total / ids.length);
    const extra = total % ids.length;
    normalised = ids.map((id, i) => ({ cityId: String(id), days: base + (i < extra ? 1 : 0) }))
      .filter((l) => l.days > 0);
  }

  return computeEstimate(normalised, tier);
});
