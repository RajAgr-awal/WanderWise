const express = require('express');
const { getData, persistPlaces } = require('../lib/data');
const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../lib/data');

const router = express.Router();

// GET /api/data-quality — counts, needs_review, import log
router.get('/data-quality', (req, res) => {
  const { cities, places, dishes, markets, stay_areas, transport_options, importLog, dataQuality } = getData();
  const needsReview = places.filter(p => p.needs_review);
  // Also from importLog
  res.json({
    status: 'ok',
    counts: {
      cities: cities.length,
      places: places.length,
      dishes: dishes.length,
      markets: markets.length,
      stay_areas: stay_areas.length,
      transport_options: transport_options.length,
      place_intel: 0,
    },
    needs_review: needsReview.map(p => ({ id: p.id, city_slug: p.city_slug, name: p.name, kind: p.kind, reason: p.review_reason })),
    needs_review_count: needsReview.length,
    import_log: importLog,
    data_quality: dataQuality,
    honest_note: 'Never fabricate place data. Missing means null. Data confidence low, never verified until field-checked.',
  });
});

// GET /api/admin/places — list all places with needs_review filter
router.get('/places', (req, res) => {
  const { places } = getData();
  const { needs_review } = req.query;
  let result = places;
  if (needs_review !== undefined) {
    const v = needs_review === 'true' || needs_review === '1';
    result = result.filter(p => p.needs_review === v);
  }
  res.json({ status: 'ok', count: result.length, data: result });
});

// PATCH /api/places/:id — admin update
router.patch('/places/:id', (req, res) => {
  const { id } = req.params;
  const patch = req.body;
  const { getData } = require('../lib/data');
  const data = getData();
  const idx = data.places.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ status: 'not-found', message: `Place ${id} not found` });

  const allowed = ['needs_review','review_reason','kind','category','tags','description','name','verified','data_confidence'];
  const place = data.places[idx];
  let changed = false;
  for (const k of allowed) {
    if (patch[k] !== undefined) {
      place[k] = patch[k];
      changed = true;
    }
  }
  if (!changed) return res.status(400).json({ status: 'bad-request', message: 'No updatable fields provided', allowed });

  // Persist
  persistPlaces(data.places);

  // Also append to curator_audit
  const auditFile = path.join(DATA_DIR, 'curator_audit.json');
  let audit = [];
  if (fs.existsSync(auditFile)) {
    try { audit = JSON.parse(fs.readFileSync(auditFile,'utf8')); } catch { audit = []; }
  }
  audit.push({
    at: new Date().toISOString(),
    place_id: id,
    patch,
    actor: req.headers['x-admin'] || 'admin',
  });
  fs.writeFileSync(auditFile, JSON.stringify(audit, null, 2));

  res.json({ status: 'ok', data: place });
});

// GET /api/import-log
router.get('/import-log', (req, res) => {
  const { importLog } = getData();
  if (!importLog) return res.status(404).json({ status: 'not-found', message: 'No import log' });
  res.json({ status: 'ok', data: importLog });
});

module.exports = router;
