const express = require('express');
const { getData, persistPlaces } = require('../lib/data');

const router = express.Router();

// GET /api/cities?group=Tier 1&region=North India&tag=heritage&month=10&search=delhi
router.get('/', (req, res) => {
  const { cities } = getData();
  let result = [...cities];

  const { group, region, tag, month, search, q } = req.query;
  const s = (search || q || '').toLowerCase().trim();

  if (group) {
    // allow Tier 1, Tier1, Tier 1 etc.
    const g = group.toLowerCase().replace(/\s+/g, ' ').trim();
    result = result.filter(c => c.editorial_group.toLowerCase() === g || c.editorial_group.toLowerCase().replace(/\s+/g,'') === g.replace(/\s+/g,''));
  }
  if (region) {
    const r = region.toLowerCase().trim();
    result = result.filter(c => c.region.toLowerCase() === r);
  }
  if (tag) {
    const t = tag.toLowerCase().trim();
    result = result.filter(c => (c.app_tags || []).some(at => at.toLowerCase() === t));
  }
  if (month) {
    const m = parseInt(month, 10);
    if (!isNaN(m) && m >=1 && m <=12) {
      result = result.filter(c => (c.best_months || []).includes(m));
    }
  }
  if (s) {
    result = result.filter(c => 
      c.name.toLowerCase().includes(s) ||
      c.state_ut.toLowerCase().includes(s) ||
      c.core_identity.toLowerCase().includes(s) ||
      (c.city_type && c.city_type.toLowerCase().includes(s)) ||
      (c.app_tags || []).some(t => t.toLowerCase().includes(s))
    );
  }

  // Sort by rank_in_group then name
  result.sort((a,b) => {
    if (a.editorial_group !== b.editorial_group) return a.editorial_group.localeCompare(b.editorial_group);
    if (a.rank_in_group !== b.rank_in_group) return a.rank_in_group - b.rank_in_group;
    return a.name.localeCompare(b.name);
  });

  const nowMonth = new Date().getMonth()+1;
  // Annotate Good this month if month filter not applied: we can add field goodThisMonth
  const annotated = result.map(c => ({
    ...c,
    good_this_month: (c.best_months || []).includes(nowMonth),
    good_right_now: (c.best_months || []).includes(nowMonth), // alias
  }));

  res.json({
    status: 'ok',
    count: annotated.length,
    total: cities.length,
    monthNow: nowMonth,
    data: annotated,
  });
});

// GET /api/cities/:slug
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const { cities, dishes, markets, stay_areas, transport_options } = getData();
  const city = cities.find(c => c.slug === slug.toLowerCase());
  if (!city) return res.status(404).json({ status: 'not-found', message: `City ${slug} not found`, slug });

  // Enrich with related collections
  const cityDishes = dishes.filter(d => d.city_slug === slug);
  const cityMarkets = markets.filter(m => m.city_slug === slug);
  const cityStay = stay_areas.find(s => s.city_slug === slug) || null;
  const cityTransport = transport_options.filter(t => t.city_slug === slug);

  res.json({
    status: 'ok',
    data: {
      ...city,
      dishes: cityDishes,
      markets: cityMarkets,
      stay_areas: cityStay,
      transport_options: cityTransport,
    }
  });
});

// GET /api/cities/:slug/places
router.get('/:slug/places', (req, res) => {
  const { slug } = req.params;
  const { cities, places } = getData();
  const city = cities.find(c => c.slug === slug.toLowerCase());
  if (!city) return res.status(404).json({ status: 'not-found', message: `City ${slug} not found` });

  const { kind, category, needs_review } = req.query;
  let result = places.filter(p => p.city_slug === slug.toLowerCase());
  if (kind) result = result.filter(p => p.kind === kind);
  if (category) result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (needs_review !== undefined) {
    const v = needs_review === 'true' || needs_review === '1';
    result = result.filter(p => p.needs_review === v);
  }

  res.json({
    status: 'ok',
    city: city.name,
    slug,
    count: result.length,
    data: result,
  });
});

module.exports = router;

// Also expose utility for updating places (admin)
function updatePlace(id, patch) {
  const { places } = (() => {
    const { getData } = require('../lib/data');
    return getData();
  })();
  const idx = places.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const allowed = ['needs_review','review_reason','kind','category','tags','description'];
  for (const k of allowed) {
    if (patch[k] !== undefined) places[idx][k] = patch[k];
  }
  persistPlaces(places);
  return places[idx];
}
module.exports.updatePlace = updatePlace;
