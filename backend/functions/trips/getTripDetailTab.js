/**
 * 4.7 getTripDetailTab (callable)
 * Serves the Culture | Food | Stay | Transport | Market sub-tabs.
 * Stay and Transport are ranked against the trip's budget tier and the
 * geographic centre of the itinerary's POIs.
 */
const { onCall } = require('firebase-functions/v2/https');
const { db } = require('../lib/firebase');
const { requireAuth, requireString, HttpsError } = require('../lib/errors');
const { haversine } = require('../lib/distance');

const TABS = ['culture', 'food', 'stay', 'transport', 'market'];
const TIER_ORDER = { budget: 0, mid: 1, luxury: 2 };

/** Centroid of the trip's plotted POIs for a given city. */
function itineraryCentre(trip, cityId) {
  const pts = [];
  for (const day of trip.itinerary?.days || []) {
    if (day.cityId !== cityId) continue;
    for (const slot of day.slots || []) {
      if (slot.lat != null && slot.lng != null) pts.push({ lat: slot.lat, lng: slot.lng });
    }
  }
  if (!pts.length) return null;
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
  };
}

exports.getTripDetailTab = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const tripId = requireString(request.data?.tripId, 'tripId');
  const tab = requireString(request.data?.tab, 'tab').toLowerCase();
  if (!TABS.includes(tab)) {
    throw new HttpsError('invalid-argument', `tab must be one of ${TABS.join(', ')}.`);
  }

  const tripSnap = await db.collection('users').doc(uid).collection('trips').doc(tripId).get();
  if (!tripSnap.exists) throw new HttpsError('not-found', 'Trip not found.');
  const trip = tripSnap.data();

  const cityId = request.data?.cityId ? String(request.data.cityId) : trip.cityIds[0];
  if (!trip.cityIds.includes(cityId)) {
    throw new HttpsError('invalid-argument', `City "${cityId}" is not part of this trip.`);
  }

  const citySnap = await db.collection('cities').doc(cityId).get();
  if (!citySnap.exists) throw new HttpsError('not-found', 'City not found.');
  const city = citySnap.data();

  if (tab === 'culture') {
    return {
      tab, cityId, cityName: city.name,
      culture: city.culture || {},
      bestTimeToVisit: city.bestTimeToVisit,
      languages: city.languages || [],
    };
  }

  if (tab === 'food') {
    const snap = await db.collection('restaurants').where('cityId', '==', cityId).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Surface the ones already booked into the itinerary first.
    const planned = new Set();
    (trip.itinerary?.days || []).forEach((day) =>
      (day.slots || []).forEach((s) => { if (s.refType === 'restaurant') planned.add(s.refId); }));
    items.sort((a, b) => (planned.has(b.id) ? 1 : 0) - (planned.has(a.id) ? 1 : 0)
      || a.priceForTwo - b.priceForTwo);
    return {
      tab, cityId, cityName: city.name,
      delicacies: city.delicacies || [],
      restaurants: items.map((r) => ({ ...r, inYourPlan: planned.has(r.id) })),
    };
  }

  if (tab === 'stay') {
    const centre = itineraryCentre(trip, cityId);
    const snap = await db.collection('stays').where('cityId', '==', cityId).get();
    const items = snap.docs.map((d) => {
      const s = { id: d.id, ...d.data() };
      const distance = centre && s.lat != null ? haversine(centre, s) : null;
      return {
        ...s,
        distanceFromPlanKm: distance != null ? Math.round(distance * 10) / 10 : null,
        matchesBudget: s.priceTier === trip.budgetTier,
      };
    });
    // Rank by tier proximity first, then distance from the planned stops (spec §4.7).
    items.sort((a, b) => {
      const t = Math.abs(TIER_ORDER[a.priceTier] - TIER_ORDER[trip.budgetTier])
              - Math.abs(TIER_ORDER[b.priceTier] - TIER_ORDER[trip.budgetTier]);
      if (t !== 0) return t;
      return (a.distanceFromPlanKm ?? 99) - (b.distanceFromPlanKm ?? 99);
    });
    return { tab, cityId, cityName: city.name, budgetTier: trip.budgetTier, stays: items };
  }

  if (tab === 'transport') {
    const snap = await db.collection('transportOptions').where('cityId', '==', cityId).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Budget travellers see cheapest first; luxury sees fastest first.
    items.sort((a, b) => trip.budgetTier === 'luxury'
      ? (a.timeRankMinutes ?? 999) - (b.timeRankMinutes ?? 999)
      : (a.costRankInr ?? 9999) - (b.costRankInr ?? 9999));
    return { tab, cityId, cityName: city.name, budgetTier: trip.budgetTier, options: items };
  }

  // market
  const snap = await db.collection('markets').where('cityId', '==', cityId).get();
  return {
    tab, cityId, cityName: city.name,
    markets: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
});
