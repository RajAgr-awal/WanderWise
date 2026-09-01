/**
 * 4.8 getTripMap (callable)
 * Pins every POI in the itinerary, computes pairwise haversine distances and
 * returns a nearest-neighbour visiting order plus best-time notes.
 */
const { onCall } = require('firebase-functions/v2/https');
const { db } = require('../lib/firebase');
const { requireAuth, requireString, HttpsError } = require('../lib/errors');
const { haversine, nearestNeighbourOrder, pathLength } = require('../lib/distance');

const BEST_TIME_BY_PERIOD = {
  morning: 'Best before 10am — cooler and far less crowded.',
  afternoon: 'Midday works; seek shade between 1–3pm.',
  evening: 'Golden hour — best light for photographs.',
  night: 'Evening visit; check closing time before you go.',
  lunch: 'Arrive by 12:30pm to avoid the queue.',
  dinner: 'Book ahead for 8pm on weekends.',
};

exports.getTripMap = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const tripId = requireString(request.data?.tripId, 'tripId');
  const cityFilter = request.data?.cityId ? String(request.data.cityId) : null;

  const tripSnap = await db.collection('users').doc(uid).collection('trips').doc(tripId).get();
  if (!tripSnap.exists) throw new HttpsError('not-found', 'Trip not found.');
  const trip = tripSnap.data();

  // Collect unique, checked stops that have coordinates.
  const seen = new Set();
  const stops = [];
  for (const day of trip.itinerary?.days || []) {
    if (cityFilter && day.cityId !== cityFilter) continue;
    for (const slot of day.slots || []) {
      if (slot.checked === false) continue;
      if (slot.lat == null || slot.lng == null) continue;
      const key = `${slot.refType}:${slot.refId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      stops.push({
        refId: slot.refId,
        refType: slot.refType,
        name: slot.name,
        category: slot.category || slot.area || null,
        dayNumber: day.dayNumber,
        period: slot.period,
        lat: slot.lat,
        lng: slot.lng,
        bestTimeToVisit: BEST_TIME_BY_PERIOD[slot.period] || null,
      });
    }
  }

  if (!stops.length) {
    return { stops: [], order: [], totalDistanceKm: 0, legs: [], bounds: null };
  }

  const order = nearestNeighbourOrder(stops, 0);
  const ordered = order.map((i, idx) => ({ ...stops[i], visitOrder: idx + 1 }));

  const legs = [];
  for (let i = 1; i < ordered.length; i++) {
    legs.push({
      fromRefId: ordered[i - 1].refId,
      toRefId: ordered[i].refId,
      fromName: ordered[i - 1].name,
      toName: ordered[i].name,
      distanceKm: Math.round(haversine(ordered[i - 1], ordered[i]) * 10) / 10,
    });
  }

  const lats = stops.map((s) => s.lat);
  const lngs = stops.map((s) => s.lng);

  return {
    stops: ordered,
    order: ordered.map((s) => s.refId),
    legs,
    totalDistanceKm: Math.round(pathLength(ordered) * 10) / 10,
    bounds: {
      north: Math.max(...lats), south: Math.min(...lats),
      east: Math.max(...lngs), west: Math.min(...lngs),
      center: { lat: (Math.max(...lats) + Math.min(...lats)) / 2,
                lng: (Math.max(...lngs) + Math.min(...lngs)) / 2 },
    },
  };
});
