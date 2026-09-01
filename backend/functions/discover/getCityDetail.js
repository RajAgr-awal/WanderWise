/**
 * 4.2 getCityDetail (callable) — powers the Trip Setup hero screen.
 */
const { onCall } = require('firebase-functions/v2/https');
const { db } = require('../lib/firebase');
const { requireAuth, requireString, HttpsError } = require('../lib/errors');

exports.getCityDetail = onCall({ cors: true }, async (request) => {
  requireAuth(request);
  const cityId = requireString(request.data?.cityId, 'cityId');

  const snap = await db.collection('cities').doc(cityId).get();
  if (!snap.exists) throw new HttpsError('not-found', `City "${cityId}" does not exist.`);

  const d = snap.data();
  if (d.isComingSoon) {
    throw new HttpsError('failed-precondition', `${d.name} is not bookable yet.`);
  }

  // A small POI preview so the setup screen can show what the trip will contain.
  const poisSnap = await db.collection('pois')
    .where('cityId', '==', cityId)
    .orderBy('rating', 'desc')
    .limit(5)
    .get();

  return {
    id: snap.id,
    name: d.name,
    country: d.country,
    description: d.description,
    heroImageUrl: d.heroImageUrl,
    bestTimeToVisit: d.bestTimeToVisit,
    languages: d.languages || [],
    pricePerDay: d.pricePerDay,
    tags: d.tags || [],
    highlights: poisSnap.docs.map((p) => ({
      id: p.id, name: p.data().name, category: p.data().category, rating: p.data().rating,
    })),
  };
});
