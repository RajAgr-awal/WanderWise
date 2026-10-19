const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../seed/data');

function loadJson(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.data) return parsed.data;
    return parsed;
  } catch (e) {
    console.error(`[data] failed to load ${name}:`, e.message);
    return [];
  }
}

function loadAll() {
  return {
    cities: loadJson('cities'),
    places: loadJson('places'),
    dishes: loadJson('dishes'),
    markets: loadJson('markets'),
    stay_areas: loadJson('stay_areas'),
    transport_options: loadJson('transport_options'),
    place_intel: loadJson('place_intel'),
    importLog: (() => { try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR,'import-log.json'),'utf8')); } catch { return null; }})(),
    dataQuality: (() => { try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR,'data-quality.json'),'utf8')); } catch { return null; }})(),
  };
}

let cache = null;
let cacheMtime = 0;

function getData() {
  // Simple cache with file mtime check
  try {
    const stat = fs.statSync(path.join(DATA_DIR, 'cities.json'));
    if (cache && stat.mtimeMs === cacheMtime) return cache;
    cache = loadAll();
    cacheMtime = stat.mtimeMs;
    return cache;
  } catch {
    if (!cache) cache = loadAll();
    return cache;
  }
}

function persistPlaces(places) {
  const file = path.join(DATA_DIR, 'places.json');
  fs.writeFileSync(file, JSON.stringify(places, null, 2));
  // invalidate cache
  cache = null;
}

module.exports = { getData, loadJson, persistPlaces, DATA_DIR };
