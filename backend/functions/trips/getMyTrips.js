/**
 * 4.9 getMyTrips (callable)
 * Powers the My Trips list and the "Your Trips" recap strip on Discover.
 */
const { onCall } = require('firebase-functions/v2/https');
const { db } = require('../lib/firebase');
const { requireAuth } = require('../lib/errors');

exports.getMyTrips = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const limit = Math.min(Number(request.data?.limit) || 50, 100);

  const snap = await db.collection('users').doc(uid).collection('trips')
    .orderBy('createdAt', 'desc').limit(limit).get();

  if (snap.empty) return { trips: [] };

  // Join hero images in one batch.
  const cityIds = [...new Set(snap.docs.flatMap((d) => d.data().cityIds || []))];
  const citySnaps = cityIds.length
    ? await db.getAll(...cityIds.map((id) => db.collection('cities').doc(id)))
    : [];
  const heroById = new Map(citySnaps.filter((s) => s.exists).map((s) => [s.id, s.data()]));

  const trips = snap.docs.map((doc) => {
    const d = doc.data();
    const first = heroById.get(d.cityIds?.[0]);
    const totalSlots = (d.itinerary?.days || []).reduce((s, day) => s + (day.slots?.length || 0), 0);
    return {
      id: doc.id,
      type: d.type,
      title: d.title,
      cityIds: d.cityIds || [],
      cityNames: (d.cityIds || []).map((id) => heroById.get(id)?.name).filter(Boolean),
      durationDays: d.durationDays,
      budgetTier: d.budgetTier,
      estimatedTotal: d.estimatedTotal,
      perDayCost: d.perDayCost,
      status: d.status,
      heroImageUrl: first?.heroImageUrl || null,
      totalSlots,
      createdAt: d.createdAt?.toMillis?.() ?? null,
    };
  });

  return { trips };
});
