/**
 * Unit tests for the pure logic inside the Cloud Functions — the parts worth
 * testing without spinning up the emulator: day allocation, the deterministic
 * itinerary fallback, hydration, the Claude response validator, haversine and
 * nearest-neighbour ordering, and the seed data's integrity.
 *
 * Run: node --test scripts/logic.test.js
 */
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const seed = require('../seed/data.js');
const { haversine, nearestNeighbourOrder, pathLength } = require('../functions/lib/distance.js');
const { extractJson } = require('../functions/lib/claudeClient.js');

// generateItinerary pulls in firebase-admin at require time, so load its internals
// only if the dependency tree is installed; otherwise re-implement nothing and skip.
let itin = null;
try {
  itin = require('../functions/itinerary/generateItinerary.js')._internal;
} catch (_) { /* firebase-admin not installed in this environment */ }

// ---------------------------------------------------------------- seed data
test('seed: every POI references a real city', () => {
  const cityIds = new Set(seed.cities.map((c) => c.id));
  for (const p of seed.pois) {
    assert.ok(cityIds.has(p.cityId), `POI ${p.id} references unknown city ${p.cityId}`);
  }
});

test('seed: every restaurant, stay, transport and market references a real city', () => {
  const cityIds = new Set(seed.cities.map((c) => c.id));
  for (const list of [seed.restaurants, seed.stays, seed.transportOptions, seed.markets]) {
    for (const doc of list) {
      assert.ok(cityIds.has(doc.cityId), `${doc.id} references unknown city ${doc.cityId}`);
    }
  }
});

test('seed: curated tours reference real, bookable cities', () => {
  const byId = new Map(seed.cities.map((c) => [c.id, c]));
  for (const t of seed.curatedTours) {
    for (const id of t.cityIds) {
      const city = byId.get(id);
      assert.ok(city, `tour ${t.id} references unknown city ${id}`);
      assert.ok(!city.isComingSoon, `tour ${t.id} includes coming-soon city ${id}`);
    }
  }
});

test('seed: document ids are unique per collection', () => {
  for (const [name, list] of Object.entries(seed)) {
    if (!Array.isArray(list)) continue;
    const ids = list.map((d) => d.id);
    assert.strictEqual(new Set(ids).size, ids.length, `duplicate ids in ${name}`);
  }
});

test('seed: every bookable city has all three price tiers', () => {
  for (const c of seed.cities) {
    for (const tier of ['budget', 'mid', 'luxury']) {
      assert.strictEqual(typeof c.pricePerDay[tier], 'number',
        `${c.id} missing ${tier} price`);
    }
    assert.ok(c.pricePerDay.budget < c.pricePerDay.mid, `${c.id}: budget >= mid`);
    assert.ok(c.pricePerDay.mid < c.pricePerDay.luxury, `${c.id}: mid >= luxury`);
  }
});

test('seed: launch cities have enough POIs to fill a multi-day trip', () => {
  const launch = ['jaipur', 'delhi', 'agra'];
  for (const id of launch) {
    const n = seed.pois.filter((p) => p.cityId === id).length;
    assert.ok(n >= 4, `${id} has only ${n} POIs — need >= 4 to fill a day`);
    const r = seed.restaurants.filter((x) => x.cityId === id).length;
    assert.ok(r >= 2, `${id} has only ${r} restaurants — need >= 2 for lunch+dinner`);
  }
});

test('seed: static content covers all three required docs', () => {
  const ids = seed.staticContent.map((d) => d.id).sort();
  assert.deepStrictEqual(ids, ['contactSupport', 'privacyPolicy', 'termsOfService']);
});

// ---------------------------------------------------------------- distance
test('haversine: known distance Delhi -> Agra is ~180 km', () => {
  const d = haversine({ lat: 28.6139, lng: 77.2090 }, { lat: 27.1767, lng: 78.0081 });
  assert.ok(d > 170 && d < 195, `expected ~180 km, got ${d.toFixed(1)}`);
});

test('haversine: identical points are zero, missing coords are safe', () => {
  assert.strictEqual(haversine({ lat: 1, lng: 1 }, { lat: 1, lng: 1 }), 0);
  assert.strictEqual(haversine(null, { lat: 1, lng: 1 }), 0);
});

test('nearestNeighbourOrder: visits every point exactly once', () => {
  const pts = seed.pois.filter((p) => p.cityId === 'jaipur');
  const order = nearestNeighbourOrder(pts, 0);
  assert.strictEqual(order.length, pts.length);
  assert.strictEqual(new Set(order).size, pts.length);
  assert.strictEqual(order[0], 0);
});

test('nearestNeighbourOrder: never longer than the unoptimised path', () => {
  const pts = seed.pois.filter((p) => p.cityId === 'delhi');
  const optimised = nearestNeighbourOrder(pts, 0).map((i) => pts[i]);
  assert.ok(pathLength(optimised) <= pathLength(pts) + 0.001);
});

// ---------------------------------------------------------------- claude lib
test('extractJson: unwraps fenced markdown', () => {
  assert.deepStrictEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
});

test('extractJson: ignores prose around the object', () => {
  assert.deepStrictEqual(extractJson('Sure! {"days":[]} Hope that helps.'), { days: [] });
});

test('extractJson: handles braces inside strings', () => {
  assert.deepStrictEqual(extractJson('{"n":"a } b","k":2}'), { n: 'a } b', k: 2 });
});

test('extractJson: throws when there is no JSON', () => {
  assert.throws(() => extractJson('no json here'));
});

// ---------------------------------------------------------------- itinerary
if (itin) {
  const jaipurPois = seed.pois.filter((p) => p.cityId === 'jaipur');
  const jaipurRests = seed.restaurants.filter((r) => r.cityId === 'jaipur');
  const cities = new Map(seed.cities.map((c) => [c.id, c]));

  test('allocateDays: splits evenly with remainder to earliest legs', () => {
    assert.deepStrictEqual(itin.allocateDays(['a', 'b', 'c'], 7),
      [{ cityId: 'a', days: 3 }, { cityId: 'b', days: 2 }, { cityId: 'c', days: 2 }]);
  });

  test('allocateDays: single city takes all days', () => {
    assert.deepStrictEqual(itin.allocateDays(['jaipur'], 5), [{ cityId: 'jaipur', days: 5 }]);
  });

  test('allocateDays: rejects perCityDays that does not sum to durationDays', () => {
    assert.throws(() => itin.allocateDays(['a', 'b'], 5, { a: 2, b: 2 }), /sums to 4/);
  });

  test('allocateDays: honours an explicit valid allocation', () => {
    assert.deepStrictEqual(itin.allocateDays(['a', 'b'], 5, { a: 4, b: 1 }),
      [{ cityId: 'a', days: 4 }, { cityId: 'b', days: 1 }]);
  });

  test('fallbackPlan: produces one entry per day with all six periods', () => {
    const plan = itin.fallbackPlan({
      legs: [{ cityId: 'jaipur', days: 3 }],
      pois: jaipurPois, restaurants: jaipurRests,
    });
    assert.strictEqual(plan.days.length, 3);
    for (const day of plan.days) {
      const periods = day.slots.map((s) => s.period);
      assert.deepStrictEqual(periods,
        ['morning', 'afternoon', 'lunch', 'evening', 'dinner', 'night']);
    }
  });

  test('fallbackPlan: numbers days continuously across a multi-city route', () => {
    const plan = itin.fallbackPlan({
      legs: [{ cityId: 'delhi', days: 2 }, { cityId: 'agra', days: 2 }],
      pois: seed.pois, restaurants: seed.restaurants,
    });
    assert.deepStrictEqual(plan.days.map((d) => d.dayNumber), [1, 2, 3, 4]);
    assert.deepStrictEqual(plan.days.map((d) => d.cityId), ['delhi', 'delhi', 'agra', 'agra']);
  });

  test('fallbackPlan: only references real ids from the candidate set', () => {
    const plan = itin.fallbackPlan({
      legs: [{ cityId: 'jaipur', days: 4 }], pois: jaipurPois, restaurants: jaipurRests,
    });
    const poiIds = new Set(jaipurPois.map((p) => p.id));
    const restIds = new Set(jaipurRests.map((r) => r.id));
    for (const day of plan.days) {
      for (const s of day.slots) {
        const pool = s.refType === 'poi' ? poiIds : restIds;
        assert.ok(pool.has(s.refId), `unknown ${s.refType} ${s.refId}`);
      }
    }
  });

  test('hydrate: attaches trusted price/rating from source docs, not the model', () => {
    const plan = { days: [{ dayNumber: 1, cityId: 'jaipur', slots: [
      { period: 'morning', refType: 'poi', refId: jaipurPois[0].id },
      { period: 'lunch', refType: 'restaurant', refId: jaipurRests[0].id },
    ] }] };
    const out = itin.hydrate(plan, { pois: jaipurPois, restaurants: jaipurRests, cities });
    const [poiSlot, foodSlot] = out.days[0].slots;
    assert.strictEqual(poiSlot.price, jaipurPois[0].price);
    assert.strictEqual(poiSlot.rating, jaipurPois[0].rating);
    assert.strictEqual(foodSlot.priceForTwo, jaipurRests[0].priceForTwo);
    assert.strictEqual(foodSlot.mustTryDish, jaipurRests[0].mustTryDish);
    assert.strictEqual(out.days[0].cityName, 'Jaipur');
    assert.strictEqual(poiSlot.checked, true);
  });

  test('hydrate: sorts slots into chronological period order', () => {
    const plan = { days: [{ dayNumber: 1, cityId: 'jaipur', slots: [
      { period: 'night', refType: 'poi', refId: jaipurPois[1].id },
      { period: 'morning', refType: 'poi', refId: jaipurPois[0].id },
      { period: 'lunch', refType: 'restaurant', refId: jaipurRests[0].id },
    ] }] };
    const out = itin.hydrate(plan, { pois: jaipurPois, restaurants: jaipurRests, cities });
    assert.deepStrictEqual(out.days[0].slots.map((s) => s.period),
      ['morning', 'lunch', 'night']);
  });

  const validator = () => itin.makeValidator({
    durationDays: 2,
    poiIds: new Set(jaipurPois.map((p) => p.id)),
    restIds: new Set(jaipurRests.map((r) => r.id)),
  });

  test('validator: accepts a well-formed plan', () => {
    const plan = itin.fallbackPlan({
      legs: [{ cityId: 'jaipur', days: 2 }], pois: jaipurPois, restaurants: jaipurRests,
    });
    assert.strictEqual(validator()(plan), null);
  });

  test('validator: rejects a hallucinated poiId', () => {
    const plan = { days: [
      { dayNumber: 1, cityId: 'jaipur', slots: [{ period: 'morning', refType: 'poi', refId: 'poi_fake_taj' }] },
      { dayNumber: 2, cityId: 'jaipur', slots: [{ period: 'morning', refType: 'poi', refId: jaipurPois[0].id }] },
    ] };
    assert.match(validator()(plan), /unknown poiId/);
  });

  test('validator: rejects the wrong number of days', () => {
    const plan = { days: [{ dayNumber: 1, cityId: 'jaipur', slots: [
      { period: 'morning', refType: 'poi', refId: jaipurPois[0].id }] }] };
    assert.match(validator()(plan), /Expected 2 days/);
  });

  test('validator: rejects an unknown period', () => {
    const plan = { days: [
      { dayNumber: 1, cityId: 'jaipur', slots: [{ period: 'brunch', refType: 'poi', refId: jaipurPois[0].id }] },
      { dayNumber: 2, cityId: 'jaipur', slots: [{ period: 'morning', refType: 'poi', refId: jaipurPois[0].id }] },
    ] };
    assert.match(validator()(plan), /unknown period/);
  });

  test('validator: rejects a malformed payload', () => {
    assert.match(validator()({}), /days" array missing/);
  });

  test('buildPrompt: includes real ids and forbids invention', () => {
    const prompt = itin.buildPrompt({
      legs: [{ cityId: 'jaipur', days: 2 }],
      cities, pois: jaipurPois, restaurants: jaipurRests,
      budgetTier: 'budget', durationDays: 2,
    });
    assert.ok(prompt.includes(jaipurPois[0].id));
    assert.ok(prompt.includes('Never invent a place'));
    assert.ok(prompt.includes('budget'));
  });
}
