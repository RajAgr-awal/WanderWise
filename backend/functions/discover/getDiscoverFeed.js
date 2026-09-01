/**
 * 4.1 getDiscoverFeed (callable)
 * Powers the entire Discover home screen in one round trip.
 */
const { onCall } = require('firebase-functions/v2/https');
const { db } = require('../lib/firebase');
const { requireAuth } = require('../lib/errors');

// Month index (0-11) -> cities whose bestTimeToVisit covers it.
const MONTHS = ['january','february','march','april','may','june',
  'july','august','september','october','november','december'];

/** Parse "October to March" / "March to May, October to November" into month indices. */
function monthsCovered(bestTime = '') {
  const out = new Set();
  const ranges = bestTime.toLowerCase().split(',');
  for (const range of ranges) {
    const m = range.match(/(\w+)\s+to\s+(\w+)/);
    if (m) {
      const a = MONTHS.indexOf(m[1].trim());
      const b = MONTHS.indexOf(m[2].trim());
      if (a === -1 || b === -1) continue;
      let i = a;
      // walk forward, wrapping across the year boundary
      for (let guard = 0; guard < 12; guard++) {
        out.add(i);
        if (i === b) break;
        i = (i + 1) % 12;
      }
    } else {
      MONTHS.forEach((name, idx) => { if (range.includes(name)) out.add(idx); });
    }
  }
  return out;
}

const publicCity = (doc) => {
  const d = doc.data();
  return {
    id: doc.id,
    name: d.name,
    country: d.country,
    tags: d.tags || [],
    heroImageUrl: d.heroImageUrl,
    description: d.description,
    bestTimeToVisit: d.bestTimeToVisit,
    languages: d.languages || [],
    pricePerDay: d.pricePerDay,
    isInternational: !!d.isInternational,
    isComingSoon: !!d.isComingSoon,
  };
};

exports.getDiscoverFeed = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);

  const [citiesSnap, toursSnap, tripsSnap] = await Promise.all([
    db.collection('cities').get(),
    db.collection('curatedTours').get(),
    db.collection('users').doc(uid).collection('trips')
      .orderBy('createdAt', 'desc').limit(6).get(),
  ]);

  const cities = citiesSnap.docs.map(publicCity);

  const exploreIndia = cities.filter((c) => !c.isInternational && !c.isComingSoon);
  const aroundTheWorld = cities.filter((c) => c.isInternational && !c.isComingSoon);
  const comingSoon = cities.filter((c) => c.isComingSoon);

  // Seasonal rotation: cities in season this month, deterministically shuffled by
  // day-of-year so the strip changes as the month progresses.
  const now = new Date();
  const month = now.getUTCMonth();
  const dayOfYear = Math.floor((now - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86400000);
  const inSeason = cities
    .filter((c) => !c.isComingSoon && monthsCovered(c.bestTimeToVisit).has(month))
    .sort((a, b) => a.id.localeCompare(b.id));
  const seasonalSpotlight = inSeason
    .map((c, i) => inSeason[(i + dayOfYear) % inSeason.length])
    .slice(0, 5)
    .map((c) => ({
      cityId: c.id,
      name: c.name,
      heroImageUrl: c.heroImageUrl,
      bestTimeToVisit: c.bestTimeToVisit,
      reason: `${c.name} is at its best right now — ${c.bestTimeToVisit.toLowerCase()}.`,
    }));

  const curatedTours = toursSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name,
      region: d.region,
      cityIds: d.cityIds || [],
      cityNames: (d.cityIds || []).map((id) => cities.find((c) => c.id === id)?.name).filter(Boolean),
      durationDays: d.durationDays,
      coverImageUrl: d.coverImageUrl,
    };
  });

  const yourTrips = tripsSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      title: d.title,
      cityIds: d.cityIds,
      durationDays: d.durationDays,
      budgetTier: d.budgetTier,
      estimatedTotal: d.estimatedTotal,
      heroImageUrl: cities.find((c) => c.id === d.cityIds?.[0])?.heroImageUrl || null,
      createdAt: d.createdAt?.toMillis?.() ?? null,
    };
  });

  return {
    exploreIndia,
    aroundTheWorld,
    comingSoon,
    curatedTours,
    seasonalSpotlight,
    yourTrips,
    counts: {
      india: exploreIndia.length,
      international: aroundTheWorld.length,
      curatedTours: curatedTours.length,
    },
  };
});
