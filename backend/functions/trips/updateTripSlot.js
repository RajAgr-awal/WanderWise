/**
 * Supporting callable: toggle an itinerary item's checkbox.
 * The PRD requires per-item include/exclude; routing it through a function keeps
 * the recalculated "selected spend" trustworthy and the trip doc consistent.
 */
const { onCall } = require('firebase-functions/v2/https');
const { db, FieldValue } = require('../lib/firebase');
const { requireAuth, requireString, HttpsError } = require('../lib/errors');

exports.updateTripSlot = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const tripId = requireString(request.data?.tripId, 'tripId');
  const refId = requireString(request.data?.refId, 'refId');
  const dayNumber = Number(request.data?.dayNumber);
  const checked = Boolean(request.data?.checked);

  const ref = db.collection('users').doc(uid).collection('trips').doc(tripId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'Trip not found.');
    const trip = snap.data();

    let found = false;
    const days = (trip.itinerary?.days || []).map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        slots: (day.slots || []).map((s) => {
          if (s.refId !== refId) return s;
          found = true;
          return { ...s, checked };
        }),
      };
    });
    if (!found) throw new HttpsError('not-found', `Slot "${refId}" not found on day ${dayNumber}.`);

    // Recompute the activity/food spend for the items still ticked.
    let selectedSpend = 0;
    days.forEach((day) => (day.slots || []).forEach((s) => {
      if (s.checked === false) return;
      selectedSpend += s.refType === 'poi' ? (s.price || 0) : (s.priceForTwo || 0);
    }));

    tx.update(ref, {
      'itinerary.days': days,
      selectedSpend,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { tripId, refId, dayNumber, checked, selectedSpend };
  });
});
