/**
 * Integration tests for the callable Cloud Functions.
 *
 * The real handler code is executed against an in-memory Firestore double and the
 * seed dataset, so request validation, auth checks, Firestore reads/writes and
 * response shapes are all covered without needing the JDK-21 emulator.
 *
 * Run: node --test scripts/functions.test.js
 */
const { test, before, describe } = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const { Firestore, FieldValue } = require('./fakeFirestore');
const seed = require('../seed/data.js');

// ---- install the double before any function module is required ------------
const store = new Firestore();
const deletedAuthUsers = [];
const storageFiles = new Map();

const fakeAdmin = {
  apps: [{}],
  initializeApp: () => {},
  firestore: Object.assign(() => store, { FieldValue }),
  auth: () => ({ deleteUser: async (uid) => { deletedAuthUsers.push(uid); } }),
  storage: () => ({
    bucket: () => ({
      getFiles: async ({ prefix }) => [
        [...storageFiles.keys()].filter((k) => k.startsWith(prefix))
          .map((k) => ({ name: k, delete: async () => storageFiles.delete(k) })),
      ],
    }),
  }),
};

const origResolve = Module._resolveFilename;
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'firebase-admin') return fakeAdmin;
  if (request === 'firebase-admin/app') return { initializeApp: () => {}, getApps: () => [{}] };
  if (request === 'firebase-admin/firestore') return { getFirestore: () => store, FieldValue };
  return origLoad.apply(this, arguments);
};

// Load functions AFTER the stub is installed.
const { getDiscoverFeed } = require('../functions/discover/getDiscoverFeed');
const { getCityDetail } = require('../functions/discover/getCityDetail');
const { calculateEstimate } = require('../functions/estimate/calculateEstimate');
const { generateItinerary } = require('../functions/itinerary/generateItinerary');
const { buildRoute } = require('../functions/itinerary/buildRoute');
const { getTripMap } = require('../functions/itinerary/getTripMap');
const { getMyTrips } = require('../functions/trips/getMyTrips');
const { getTripDetailTab } = require('../functions/trips/getTripDetailTab');
const { updateTripSlot } = require('../functions/trips/updateTripSlot');
const { ensureUserProfile } = require('../functions/account/onUserCreate');
const { deleteAccount } = require('../functions/account/deleteAccount');
const { getStaticContent } = require('../functions/content/getStaticContent');
const { chatWithLocalGuide } = require('../functions/chat/chatWithLocalGuide');

const UID = 'user_test_1';
const auth = { uid: UID, token: { email: 'raj@example.com', name: 'Raj', auth_time: Date.now() / 1000 } };

/** Invoke a v2 callable's handler directly. */
const call = (fn, data, authOverride) =>
  fn.run({ data, auth: authOverride === undefined ? auth : authOverride, rawRequest: {} });

const expectError = async (promise, codeFragment) => {
  try {
    await promise;
    assert.fail('expected the call to throw');
  } catch (err) {
    assert.match(`${err.code || ''} ${err.message}`, codeFragment);
    return err;
  }
};

before(async () => {
  // Seed the in-memory catalog.
  const load = async (col, docs) => {
    for (const { id, ...fields } of docs) await store.collection(col).doc(id).set(fields);
  };
  await load('cities', seed.cities);
  await load('curatedTours', seed.curatedTours);
  await load('pois', seed.pois);
  await load('restaurants', seed.restaurants);
  await load('stays', seed.stays);
  await load('transportOptions', seed.transportOptions);
  await load('markets', seed.markets);
  await load('staticContent', seed.staticContent.map((d) => ({ ...d, lastUpdated: FieldValue.serverTimestamp() })));
});

// ---------------------------------------------------------------- auth gate
describe('auth', () => {
  test('callables reject unauthenticated requests', async () => {
    await expectError(call(getDiscoverFeed, {}, null), /unauthenticated/);
    await expectError(call(getMyTrips, {}, null), /unauthenticated/);
    await expectError(call(generateItinerary, { cityIds: ['jaipur'], durationDays: 2, budgetTier: 'mid' }, null), /unauthenticated/);
  });

  test('getStaticContent is deliberately public (signup consent line)', async () => {
    const res = await call(getStaticContent, { docId: 'privacyPolicy' }, null);
    assert.strictEqual(res.title, 'Privacy Policy');
  });

  test('ensureUserProfile creates the user doc once, idempotently', async () => {
    const first = await call(ensureUserProfile, { name: 'Raj' });
    assert.strictEqual(first.created, true);
    assert.strictEqual(first.email, 'raj@example.com');
    const second = await call(ensureUserProfile, { name: 'Raj' });
    assert.strictEqual(second.created, false);
    assert.strictEqual(store.countAt('users'), 1);
  });
});

// ---------------------------------------------------------------- discover
describe('getDiscoverFeed', () => {
  test('returns every PRD section in one payload', async () => {
    const feed = await call(getDiscoverFeed, {});
    for (const key of ['exploreIndia', 'aroundTheWorld', 'comingSoon', 'curatedTours', 'seasonalSpotlight', 'yourTrips']) {
      assert.ok(Array.isArray(feed[key]), `${key} missing`);
    }
    assert.ok(feed.exploreIndia.length >= 20, 'expected the full India city list');
    assert.ok(feed.exploreIndia.every((c) => !c.isInternational && !c.isComingSoon));
    assert.ok(feed.aroundTheWorld.every((c) => c.isInternational && !c.isComingSoon));
    assert.ok(feed.comingSoon.every((c) => c.isComingSoon));
    assert.strictEqual(feed.curatedTours.length, 5);
  });

  test('curated tours are joined to readable city names', async () => {
    const feed = await call(getDiscoverFeed, {});
    const gt = feed.curatedTours.find((t) => t.id === 'golden-triangle');
    assert.deepStrictEqual(gt.cityNames, ['Delhi', 'Agra', 'Jaipur']);
  });

  test('seasonal spotlight only contains in-season cities', async () => {
    const feed = await call(getDiscoverFeed, {});
    assert.ok(feed.seasonalSpotlight.length > 0);
    for (const s of feed.seasonalSpotlight) assert.ok(s.cityId && s.reason);
  });
});

describe('getCityDetail', () => {
  test('returns hero fields plus top-rated highlights', async () => {
    const city = await call(getCityDetail, { cityId: 'jaipur' });
    assert.strictEqual(city.name, 'Jaipur');
    assert.strictEqual(city.bestTimeToVisit, 'October to March');
    assert.deepStrictEqual(city.languages, ['Hindi', 'English']);
    assert.strictEqual(typeof city.pricePerDay.mid, 'number');
    assert.ok(city.highlights.length > 0);
    // highlights are ordered by rating desc
    const ratings = city.highlights.map((h) => h.rating);
    assert.deepStrictEqual(ratings, [...ratings].sort((a, b) => b - a));
  });

  test('rejects unknown and not-yet-bookable cities', async () => {
    await expectError(call(getCityDetail, { cityId: 'atlantis' }), /not-found/);
    await expectError(call(getCityDetail, { cityId: 'tokyo' }), /failed-precondition/);
  });
});

// ---------------------------------------------------------------- estimate
describe('calculateEstimate', () => {
  test('single city: perDay x days', async () => {
    const jaipur = seed.cities.find((c) => c.id === 'jaipur');
    const res = await call(calculateEstimate, { cityId: 'jaipur', durationDays: 5, budgetTier: 'mid' });
    assert.strictEqual(res.estimatedTotal, jaipur.pricePerDay.mid * 5);
    assert.strictEqual(res.perDayCost, jaipur.pricePerDay.mid);
    assert.strictEqual(res.durationDays, 5);
  });

  test('multi-city legs sum correctly', async () => {
    const res = await call(calculateEstimate, {
      legs: [{ cityId: 'delhi', days: 2 }, { cityId: 'agra', days: 3 }], budgetTier: 'budget',
    });
    const delhi = seed.cities.find((c) => c.id === 'delhi').pricePerDay.budget;
    const agra = seed.cities.find((c) => c.id === 'agra').pricePerDay.budget;
    assert.strictEqual(res.estimatedTotal, delhi * 2 + agra * 3);
    assert.strictEqual(res.durationDays, 5);
    assert.strictEqual(res.breakdown.length, 2);
  });

  test('tiers are strictly increasing in cost', async () => {
    const q = (tier) => call(calculateEstimate, { cityId: 'jaipur', durationDays: 3, budgetTier: tier });
    const [b, m, l] = await Promise.all([q('budget'), q('mid'), q('luxury')]);
    assert.ok(b.estimatedTotal < m.estimatedTotal);
    assert.ok(m.estimatedTotal < l.estimatedTotal);
  });

  test('validates its arguments', async () => {
    await expectError(call(calculateEstimate, { cityId: 'jaipur', durationDays: 5, budgetTier: 'platinum' }), /invalid-argument/);
    await expectError(call(calculateEstimate, { cityId: 'jaipur', durationDays: 0, budgetTier: 'mid' }), /invalid-argument/);
    await expectError(call(calculateEstimate, { budgetTier: 'mid' }), /invalid-argument/);
    await expectError(call(calculateEstimate, { cityId: 'nowhere', durationDays: 2, budgetTier: 'mid' }), /not-found/);
  });
});

// ---------------------------------------------------------------- itinerary
describe('generateItinerary', () => {
  let trip;

  test('generates a persisted, fully hydrated itinerary', async () => {
    trip = await call(generateItinerary, { cityIds: ['jaipur'], durationDays: 3, budgetTier: 'budget' });
    assert.ok(trip.tripId);
    assert.strictEqual(trip.status, 'generated');
    assert.strictEqual(trip.durationDays, 3);
    assert.strictEqual(trip.itinerary.days.length, 3);

    const saved = await store.collection(`users/${UID}/trips`).doc(trip.tripId).get();
    assert.ok(saved.exists, 'trip was not written to Firestore');
    assert.strictEqual(saved.data().budgetTier, 'budget');
  });

  test('server-side total matches calculateEstimate exactly', async () => {
    const est = await call(calculateEstimate, { cityId: 'jaipur', durationDays: 3, budgetTier: 'budget' });
    assert.strictEqual(trip.estimatedTotal, est.estimatedTotal);
    assert.strictEqual(trip.perDayCost, est.perDayCost);
  });

  test('every slot references a real catalog doc with trusted price data', async () => {
    const poiIds = new Set(seed.pois.map((p) => p.id));
    const restIds = new Set(seed.restaurants.map((r) => r.id));
    for (const day of trip.itinerary.days) {
      assert.ok(day.slots.length > 0);
      for (const slot of day.slots) {
        if (slot.refType === 'poi') {
          assert.ok(poiIds.has(slot.refId), `hallucinated poi ${slot.refId}`);
          const src = seed.pois.find((p) => p.id === slot.refId);
          assert.strictEqual(slot.price, src.price);
          assert.strictEqual(slot.rating, src.rating);
        } else {
          assert.ok(restIds.has(slot.refId), `hallucinated restaurant ${slot.refId}`);
          const src = seed.restaurants.find((r) => r.id === slot.refId);
          assert.strictEqual(slot.priceForTwo, src.priceForTwo);
        }
        assert.strictEqual(slot.checked, true);
      }
    }
  });

  test('days are numbered continuously and in chronological slot order', async () => {
    assert.deepStrictEqual(trip.itinerary.days.map((d) => d.dayNumber), [1, 2, 3]);
    const order = ['morning', 'afternoon', 'lunch', 'evening', 'dinner', 'night'];
    for (const day of trip.itinerary.days) {
      const idx = day.slots.map((s) => order.indexOf(s.period));
      assert.deepStrictEqual(idx, [...idx].sort((a, b) => a - b));
    }
  });

  test('multi-city trip allocates days across all cities', async () => {
    const multi = await call(generateItinerary, {
      cityIds: ['delhi', 'agra', 'jaipur'], durationDays: 6, budgetTier: 'mid', type: 'curated',
    });
    assert.strictEqual(multi.itinerary.days.length, 6);
    assert.deepStrictEqual(multi.perCityDays, { delhi: 2, agra: 2, jaipur: 2 });
    const cityOrder = [...new Set(multi.itinerary.days.map((d) => d.cityId))];
    assert.deepStrictEqual(cityOrder, ['delhi', 'agra', 'jaipur'], 'cities must stay in travel order');
  });

  test('rejects invalid input and unseeded cities', async () => {
    await expectError(call(generateItinerary, { cityIds: [], durationDays: 3, budgetTier: 'mid' }), /invalid-argument/);
    await expectError(call(generateItinerary, { cityIds: ['jaipur'], durationDays: 99, budgetTier: 'mid' }), /invalid-argument/);
    await expectError(call(generateItinerary, { cityIds: ['tokyo'], durationDays: 2, budgetTier: 'mid' }), /failed-precondition|not-found/);
  });
});

// ---------------------------------------------------------------- route builder
describe('buildRoute', () => {
  test('estimate action returns legs, transits, totals and suggestions', async () => {
    const res = await call(buildRoute, {
      legs: [{ cityId: 'delhi', days: 2 }, { cityId: 'agra', days: 2 }], budgetTier: 'budget',
    });
    assert.strictEqual(res.legs.length, 2);
    assert.strictEqual(res.transits.length, 1);
    assert.ok(res.transits[0].km > 150 && res.transits[0].km < 220, 'Delhi->Agra should be ~180km');
    assert.strictEqual(res.totals.days, 4);
    assert.ok(res.totals.estimatedTotal > 0);
    assert.ok(res.suggestions.length > 0);
    assert.ok(res.suggestions.every((s) => !['delhi', 'agra'].includes(s.cityId)),
      'suggestions must exclude cities already on the route');
  });

  test('rejects duplicate cities and over-long routes', async () => {
    await expectError(call(buildRoute, {
      legs: [{ cityId: 'delhi', days: 1 }, { cityId: 'delhi', days: 1 }], budgetTier: 'mid',
    }), /only appear once/);
    await expectError(call(buildRoute, {
      legs: Array.from({ length: 11 }, () => ({ cityId: 'delhi', days: 1 })), budgetTier: 'mid',
    }), /invalid-argument/);
  });

  test('rejects coming-soon cities', async () => {
    await expectError(call(buildRoute, { legs: [{ cityId: 'tokyo', days: 2 }], budgetTier: 'mid' }),
      /not bookable/);
  });

  test('saveTemplate persists to /users/{uid}/templates', async () => {
    const res = await call(buildRoute, {
      action: 'saveTemplate', name: 'Golden run', notes: 'for winter',
      legs: [{ cityId: 'delhi', days: 2 }, { cityId: 'jaipur', days: 3 }], budgetTier: 'mid',
    });
    assert.ok(res.templateId);
    assert.strictEqual(res.totalTime, 5);
    const saved = await store.collection(`users/${UID}/templates`).doc(res.templateId).get();
    assert.strictEqual(saved.data().name, 'Golden run');
    assert.deepStrictEqual(saved.data().perCityDays, { delhi: 2, jaipur: 3 });
  });

  test('create action produces a real multi-city trip', async () => {
    const res = await call(buildRoute, {
      action: 'create',
      legs: [{ cityId: 'agra', days: 2 }, { cityId: 'jaipur', days: 2 }], budgetTier: 'budget',
    });
    assert.ok(res.tripId);
    assert.strictEqual(res.type, 'multi-city');
    assert.strictEqual(res.itinerary.days.length, 4);
  });
});

// ---------------------------------------------------------------- trip detail
describe('trip detail tabs & map', () => {
  let tripId;
  before(async () => {
    const t = await call(generateItinerary, { cityIds: ['jaipur'], durationDays: 3, budgetTier: 'budget' });
    tripId = t.tripId;
  });

  test('culture tab returns the city write-up', async () => {
    const res = await call(getTripDetailTab, { tripId, tab: 'culture' });
    assert.ok(res.culture.history.length > 50);
    assert.strictEqual(res.cityName, 'Jaipur');
  });

  test('food tab flags restaurants already in the plan', async () => {
    const res = await call(getTripDetailTab, { tripId, tab: 'food' });
    assert.ok(res.restaurants.length > 0);
    assert.ok(res.restaurants.some((r) => r.inYourPlan), 'expected at least one planned restaurant');
    assert.ok(res.delicacies.length > 0, 'Jaipur should have seeded delicacies');
  });

  test('stay tab ranks the trip budget tier first', async () => {
    const res = await call(getTripDetailTab, { tripId, tab: 'stay' });
    assert.strictEqual(res.stays[0].priceTier, 'budget');
    assert.ok(res.stays[0].matchesBudget);
    assert.ok(res.stays.every((s) => s.distanceFromPlanKm !== undefined));
  });

  test('transport tab sorts cheapest-first for a budget trip', async () => {
    const res = await call(getTripDetailTab, { tripId, tab: 'transport' });
    const costs = res.options.map((o) => o.costRankInr);
    assert.deepStrictEqual(costs, [...costs].sort((a, b) => a - b));
  });

  test('market tab returns the city bazaars', async () => {
    const res = await call(getTripDetailTab, { tripId, tab: 'market' });
    assert.ok(res.markets.length >= 3);
    assert.ok(res.markets.every((m) => m.cityId === 'jaipur'));
  });

  test('rejects an unknown tab or a trip the user does not own', async () => {
    await expectError(call(getTripDetailTab, { tripId, tab: 'weather' }), /invalid-argument/);
    await expectError(
      call(getTripDetailTab, { tripId, tab: 'food' }, { uid: 'someone_else', token: {} }), /not-found/);
  });

  test('getTripMap returns an ordered, deduplicated stop list', async () => {
    const res = await call(getTripMap, { tripId });
    assert.ok(res.stops.length > 0);
    const ids = res.stops.map((s) => s.refId);
    assert.strictEqual(new Set(ids).size, ids.length, 'stops must be deduplicated');
    assert.deepStrictEqual(res.stops.map((s) => s.visitOrder),
      res.stops.map((_, i) => i + 1));
    assert.strictEqual(res.legs.length, res.stops.length - 1);
    assert.ok(res.totalDistanceKm >= 0);
    assert.ok(res.bounds.center.lat > 26 && res.bounds.center.lat < 28, 'centre should be near Jaipur');
    assert.ok(res.stops.every((s) => s.bestTimeToVisit));
  });

  test('updateTripSlot toggles a checkbox and recomputes selected spend', async () => {
    const before = await store.collection(`users/${UID}/trips`).doc(tripId).get();
    const target = before.data().itinerary.days[0].slots.find((s) => s.refType === 'poi' && s.price > 0);

    const res = await call(updateTripSlot, {
      tripId, dayNumber: 1, refId: target.refId, checked: false,
    });
    assert.strictEqual(res.checked, false);

    const after = await store.collection(`users/${UID}/trips`).doc(tripId).get();
    const slot = after.data().itinerary.days[0].slots.find((s) => s.refId === target.refId);
    assert.strictEqual(slot.checked, false);

    // Total of every still-ticked item.
    let expected = 0;
    after.data().itinerary.days.forEach((d) => d.slots.forEach((s) => {
      if (s.checked === false) return;
      expected += s.refType === 'poi' ? (s.price || 0) : (s.priceForTwo || 0);
    }));
    assert.strictEqual(res.selectedSpend, expected);
  });

  test('a stop unchecked on every day disappears from the map', async () => {
    const trip = (await store.collection(`users/${UID}/trips`).doc(tripId).get()).data();

    // A POI may legitimately recur across days when the catalog is smaller than the
    // number of slots; the map should keep pinning it while ANY occurrence is ticked.
    const occurrences = new Map();
    trip.itinerary.days.forEach((d) => d.slots.forEach((s) => {
      if (!occurrences.has(s.refId)) occurrences.set(s.refId, []);
      occurrences.get(s.refId).push({ dayNumber: d.dayNumber, checked: s.checked !== false });
    }));

    const partiallyUnchecked = [...occurrences.entries()]
      .find(([, o]) => o.some((x) => !x.checked) && o.some((x) => x.checked));
    if (partiallyUnchecked) {
      const mapNow = await call(getTripMap, { tripId });
      assert.ok(mapNow.stops.some((x) => x.refId === partiallyUnchecked[0]),
        'a stop still ticked on another day must remain pinned');
    }

    // Now untick every remaining occurrence of one POI and confirm it drops off.
    const [refId, occ] = [...occurrences.entries()].find(([id]) => id.startsWith('poi_'));
    for (const o of occ) {
      await call(updateTripSlot, { tripId, dayNumber: o.dayNumber, refId, checked: false });
    }
    const after = await call(getTripMap, { tripId });
    assert.ok(!after.stops.some((x) => x.refId === refId),
      'a stop unchecked everywhere must not be pinned');
  });

  test('updateTripSlot rejects an unknown slot', async () => {
    await expectError(call(updateTripSlot, { tripId, dayNumber: 1, refId: 'poi_nope', checked: false }), /not-found/);
  });
});

// ---------------------------------------------------------------- my trips
describe('getMyTrips', () => {
  test('lists the user trips newest-first with joined hero images', async () => {
    const res = await call(getMyTrips, {});
    assert.ok(res.trips.length >= 4);
    const times = res.trips.map((t) => t.createdAt ?? 0);
    assert.deepStrictEqual(times, [...times].sort((a, b) => b - a));
    for (const t of res.trips) {
      assert.ok(t.title && t.durationDays > 0);
      assert.ok(t.cityNames.length > 0);
      assert.ok(t.heroImageUrl, 'hero image should be joined from /cities');
      assert.ok(t.totalSlots > 0);
    }
  });

  test('scopes strictly to the calling user', async () => {
    const res = await call(getMyTrips, {}, { uid: 'stranger', token: {} });
    assert.deepStrictEqual(res.trips, []);
  });
});

// ---------------------------------------------------------------- chat
describe('chatWithLocalGuide', () => {
  let tripId;
  before(async () => {
    const t = await call(generateItinerary, { cityIds: ['jaipur'], durationDays: 3, budgetTier: 'budget' });
    tripId = t.tripId;
  });

  test('persists both turns and reports the remaining quota', async () => {
    const res = await call(chatWithLocalGuide, { tripId, message: 'Where should I eat?' });
    assert.ok(res.reply.length > 0);
    assert.strictEqual(res.quota.limit, 20);
    assert.strictEqual(res.quota.used, 1);
    assert.strictEqual(res.quota.remaining, 19);

    const msgs = await store.collection(`users/${UID}/trips/${tripId}/chatMessages`).get();
    assert.strictEqual(msgs.size, 2);
    const roles = msgs.docs.map((d) => d.data().role).sort();
    assert.deepStrictEqual(roles, ['assistant', 'user']);
  });

  test('grounding context contains the traveller budget and real venues', async () => {
    const { _internal } = require('../functions/chat/chatWithLocalGuide');
    const trip = (await store.collection(`users/${UID}/trips`).doc(tripId).get()).data();
    const ctx = await _internal.buildGroundingContext(trip);
    assert.match(ctx, /THE TRAVELLER'S TRIP/);
    assert.match(ctx, /Budget tier: budget/);
    assert.match(ctx, /RESTAURANTS AVAILABLE/);
    assert.match(ctx, /TRANSPORT OPTIONS/);
    assert.match(ctx, /Laxmi Misthan Bhandar/);
    assert.match(ctx, /₹/);
  });

  test('rejects an empty message and a foreign trip', async () => {
    await expectError(call(chatWithLocalGuide, { tripId, message: '   ' }), /invalid-argument/);
    await expectError(call(chatWithLocalGuide, { tripId: 'nope', message: 'hi' }), /not-found/);
  });
});

// ---------------------------------------------------------------- content
describe('getStaticContent', () => {
  test('serves all three legal documents', async () => {
    for (const id of ['privacyPolicy', 'termsOfService', 'contactSupport']) {
      const res = await call(getStaticContent, { docId: id });
      assert.strictEqual(res.id, id);
      assert.ok(res.body.length > 100);
    }
  });

  test('rejects an arbitrary docId', async () => {
    await expectError(call(getStaticContent, { docId: 'secretAdminDoc' }), /invalid-argument/);
  });

  test('privacy policy discloses the Claude dependency', async () => {
    const res = await call(getStaticContent, { docId: 'privacyPolicy' });
    assert.match(res.body, /Claude API \(Anthropic\)/);
  });
});

// ---------------------------------------------------------------- deletion
describe('deleteAccount', () => {
  test('removes Firestore data, storage files and the auth record', async () => {
    storageFiles.set(`users/${UID}/profile.jpg`, 'x');
    assert.ok(store.countAt(`users/${UID}/trips`) > 0, 'precondition: user has trips');

    const res = await call(deleteAccount, {});
    assert.strictEqual(res.deleted, true);
    assert.ok(res.summary.trips > 0);
    assert.ok(res.summary.chatMessages > 0);
    assert.strictEqual(res.summary.storageFiles, 1);

    assert.strictEqual(store.countAt(`users/${UID}/trips`), 0);
    assert.strictEqual(store.countAt(`users/${UID}/templates`), 0);
    assert.strictEqual(store.countAt('users'), 0);
    assert.strictEqual(storageFiles.size, 0);
    assert.deepStrictEqual(deletedAuthUsers, [UID]);
  });

  test('requires a recent sign-in', async () => {
    const stale = { uid: 'stale_user', token: { auth_time: Date.now() / 1000 - 3600 } };
    await expectError(call(deleteAccount, {}, stale), /failed-precondition/);
  });
});
