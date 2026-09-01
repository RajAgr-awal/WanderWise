/**
 * Converts the prototype's mock dataset (wanderwise/src/data.js) into the exact
 * Firestore document shapes from backend spec §2, and writes seed/data.js.
 *
 * Run: node scripts/buildSeedData.mjs
 */
import { writeFileSync } from 'node:fs';
import { CITIES, CURATED_TOURS, POIS, RESTAURANTS, STAYS, TRANSPORT, MARKETS, FOOD_SPECIALTIES }
  from '../../src/data.js';

const slug = (s) => s.toLowerCase()
  .replace(/[()'’.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Approximate city-centre coordinates so haversine/map features have real data.
const COORDS = {
  jaipur: [26.9124, 75.7873], delhi: [28.6139, 77.2090], mumbai: [19.0760, 72.8777],
  goa: [15.2993, 74.1240], udaipur: [24.5854, 73.7125], varanasi: [25.3176, 82.9739],
  agra: [27.1767, 78.0081], kolkata: [22.5726, 88.3639], kerala: [9.4981, 76.3388],
  kashmir: [34.0837, 74.7973], chennai: [13.0827, 80.2707], mysuru: [12.2958, 76.6394],
  pushkar: [26.4899, 74.5511], ahmedabad: [23.0225, 72.5714], puri: [19.8135, 85.8312],
  pune: [18.5204, 73.8567], hyderabad: [17.3850, 78.4867], darjeeling: [27.0360, 88.2627],
  shimla: [31.1048, 77.1734], leh: [34.1526, 77.5771], kochi: [9.9312, 76.2673],
  bangkok: [13.7563, 100.5018], hongkong: [22.3193, 114.1694], london: [51.5074, -0.1278],
  istanbul: [41.0082, 28.9784], dubai: [25.2048, 55.2708], makkah: [21.3891, 39.8579],
  antalya: [36.8969, 30.7133], paris: [48.8566, 2.3522], kl: [3.1390, 101.6869],
  la: [34.0522, -118.2437], nyc: [40.7128, -74.0060], melbourne: [-37.8136, 144.9631],
  tokyo: [35.6762, 139.6503], toronto: [43.6532, -79.3832], sydney: [-33.8688, 151.2093],
  chicago: [41.8781, -87.6298], birmingham: [52.4862, -1.8904],
};

// Known POI coordinates; anything unlisted is jittered off the city centre so the
// map view still renders a sensible spread.
const POI_COORDS = {
  'Amber Fort': [26.9855, 75.8513], 'Hawa Mahal': [26.9239, 75.8267],
  'City Palace': [26.9255, 75.8236], 'Jantar Mantar': [26.9247, 75.8246],
  'Johari Bazaar': [26.9196, 75.8253], 'Nahargarh Fort': [26.9374, 75.8153],
  'Chokhi Dhani': [26.7583, 75.8394], 'Panna Meena ka Kund': [26.9885, 75.8494],
  'Red Fort': [28.6562, 77.2410], 'Qutub Minar': [28.5245, 77.1855],
  "Humayun's Tomb": [28.5933, 77.2507], 'India Gate': [28.6129, 77.2295],
  'Lotus Temple': [28.5535, 77.2588], 'Jama Masjid': [28.6507, 77.2334],
  'Hauz Khas Village': [28.5535, 77.1943], 'Akshardham': [28.6127, 77.2773],
  'Taj Mahal': [27.1751, 78.0421], 'Agra Fort': [27.1795, 78.0211],
  'Mehtab Bagh': [27.1799, 78.0421], 'Fatehpur Sikri': [27.0937, 77.6679],
  'Itmad-ud-Daulah': [27.1929, 78.0308],
  'City Palace Udaipur': [24.5760, 73.6832], 'Lake Pichola Boat Ride': [24.5714, 73.6800],
  'Saheliyon ki Bari': [24.6017, 73.6890],
  'Dashashwamedh Ghat': [25.3067, 83.0104], 'Sarnath': [25.3811, 83.0244],
  'Sunrise Boat Ride': [25.3090, 83.0107],
  'Gateway of India': [18.9220, 72.8347], 'Elephanta Caves': [18.9633, 72.9315],
  'Marine Drive': [18.9438, 72.8230],
  'Dal Lake Shikara': [34.1183, 74.8580], 'Gulmarg Gondola': [34.0484, 74.3805],
  'Pangong Tso': [33.7554, 78.6740], 'Thiksey Monastery': [34.0556, 77.6664],
  'Basilica of Bom Jesus': [15.5009, 73.9116], 'Palolem Beach': [15.0100, 74.0233],
  'Dudhsagar Falls': [15.3144, 74.3143],
  'Alleppey Backwaters': [9.4981, 76.3388], 'Fort Kochi': [9.9658, 76.2422],
  'Munnar Tea Estates': [10.0889, 77.0595],
  'Victoria Memorial': [22.5448, 88.3426], 'Howrah Bridge': [22.5851, 88.3468],
  'Dakshineswar Kali Temple': [22.6547, 88.3576], 'College Street': [22.5744, 88.3630],
  'Indian Museum': [22.5579, 88.3512],
  'Kapaleeshwarar Temple': [13.0336, 80.2699], 'Marina Beach': [13.0500, 80.2824],
  'Fort St. George': [13.0797, 80.2874], 'Mahabalipuram Shore Temple': [12.6169, 80.1994],
  'Mysore Palace': [12.3052, 76.6552], 'Chamundi Hill': [12.2753, 76.6703],
  'Devaraja Market': [12.3088, 76.6515],
  'Pushkar Lake': [26.4893, 74.5524], 'Brahma Temple': [26.4878, 74.5517],
  'Savitri Temple Viewpoint': [26.4856, 74.5361],
  'Sabarmati Ashram': [23.0605, 72.5801], 'Adalaj Stepwell': [23.1667, 72.5800],
  'Sidi Saiyyed Mosque': [23.0280, 72.5815], 'Manek Chowk': [23.0248, 72.5888],
};

const jitter = (base, key, i) => {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 1000;
  return [base[0] + ((h % 100) - 50) / 900, base[1] + (((h * 7) % 100) - 50) / 900];
};

const cities = CITIES.map((c) => {
  const [lat, lng] = COORDS[c.id] || [0, 0];
  return {
    id: c.id,
    name: c.name,
    country: c.country,
    tags: c.tags || [],
    heroImageUrl: c.hero,
    description: c.description,
    bestTimeToVisit: c.bestTime,
    languages: c.languages,
    pricePerDay: c.pricePerDay,
    culture: { history: c.culture || '', originText: c.culture || '' },
    delicacies: (FOOD_SPECIALTIES[c.id] || []).map((f) => ({
      dish: f.dish, bestPlace: f.where, note: f.note,
    })),
    isInternational: !!c.isInternational,
    isComingSoon: !!c.isComingSoon,
    lat, lng,
  };
});

const curatedTours = CURATED_TOURS.map((t) => ({
  id: t.id, name: t.name, region: t.region, cityIds: t.cityIds,
  durationDays: t.durationDays, coverImageUrl: t.cover,
}));

const pois = POIS.map((p, i) => {
  const coord = POI_COORDS[p.name] || jitter(COORDS[p.cityId] || [0, 0], p.name, i);
  return {
    id: `poi_${p.cityId}_${slug(p.name)}`,
    cityId: p.cityId, name: p.name, category: p.category, description: p.description,
    price: p.price, rating: p.rating, imageUrl: null, lat: coord[0], lng: coord[1],
  };
});

const restaurants = RESTAURANTS.map((r, i) => {
  const coord = jitter(COORDS[r.cityId] || [0, 0], r.name, i);
  return {
    id: `rest_${r.cityId}_${slug(r.name)}`,
    cityId: r.cityId, name: r.name, area: r.area, description: r.description,
    mustTryDish: r.mustTry, priceForTwo: r.priceForTwo, lat: coord[0], lng: coord[1],
  };
});

const stays = STAYS.map((s, i) => {
  const coord = jitter(COORDS[s.cityId] || [0, 0], s.name, i);
  const centre = COORDS[s.cityId] || [0, 0];
  const dLat = (coord[0] - centre[0]) * 111;
  const dLng = (coord[1] - centre[1]) * 111 * Math.cos((centre[0] * Math.PI) / 180);
  return {
    id: `stay_${s.cityId}_${slug(s.name)}`,
    cityId: s.cityId, name: s.name, priceTier: s.tier, type: s.type, area: s.area,
    pricePerNight: s.pricePerNight,
    distanceFromCenterKm: Math.round(Math.hypot(dLat, dLng) * 10) / 10,
    imageUrl: null, lat: coord[0], lng: coord[1],
  };
});

// Numeric rank fields let getTripDetailTab sort by cost or speed.
const parseCost = (s) => {
  const nums = (s.match(/\d[\d,]*/g) || []).map((n) => Number(n.replace(/,/g, '')));
  return nums.length ? Math.min(...nums) : 9999;
};
const parseTime = (s) => {
  const nums = (s.match(/\d+/g) || []).map(Number);
  if (/hour/.test(s)) return (nums[0] || 1) * 60;
  return nums.length ? Math.min(...nums) : 999;
};

const transportOptions = TRANSPORT.map((t, i) => ({
  id: `trans_${t.cityId}_${slug(t.mode)}`,
  cityId: t.cityId, mode: t.mode, costRange: t.costRange, timeEstimate: t.timeEstimate,
  note: t.note, costRankInr: parseCost(t.costRange), timeRankMinutes: parseTime(t.timeEstimate),
}));

const markets = MARKETS.map((m) => ({
  id: `market_${m.cityId}_${slug(m.name)}`,
  cityId: m.cityId, name: m.name, specialty: m.specialty,
  description: `Best for ${m.bestFor}`, hagglingExpected: m.haggle !== false, imageUrl: null,
}));

const staticContent = [
  {
    id: 'privacyPolicy',
    title: 'Privacy Policy',
    body: [
      '## What we collect',
      'Your name, email address and the trips, templates and chat messages you create in WanderWise. We do not collect payment data.',
      '## How we use it',
      'To generate and store your itineraries, personalise recommendations, and answer your Local Guide questions. We do not sell your data or use it for advertising.',
      '## Third parties',
      'Itinerary generation and the AI Local Guide are powered by the Claude API (Anthropic). Trip content you submit is sent to that service to produce a response. Authentication, database and file storage run on Google Firebase.',
      '## Your rights',
      'You can edit your name, delete individual trips, and permanently delete your account and all associated data from the Profile screen at any time.',
      '## Security',
      'Data is encrypted in transit and at rest. Access is restricted to your authenticated account through Firebase security rules and App Check.',
      '## Contact',
      'privacy@wanderwise.app',
    ].join('\n\n'),
  },
  {
    id: 'termsOfService',
    title: 'Terms of Service',
    body: [
      '## The service',
      'WanderWise provides AI-assisted travel itineraries, curated tour suggestions and destination guidance. It is a planning aid, not a travel agency.',
      '## Accuracy',
      'Prices, opening hours, ratings and travel times are estimates that change frequently. Always confirm with the venue or operator.',
      '## Acceptable use',
      'One account per person. Do not scrape, resell or automate access to the service.',
      '## AI-generated content',
      'Itineraries and chat answers are machine-generated and may contain errors. Verify anything safety- or money-critical.',
      '## Liability',
      'WanderWise is provided "as is". We are not liable for losses arising from travel decisions made using the app.',
    ].join('\n\n'),
  },
  {
    id: 'contactSupport',
    title: 'Contact Support',
    body: [
      '## Email support',
      'help@wanderwise.app — we reply within one business day.',
      '## In-app',
      'Use the Local Guide chat for destination questions; use email for account or bug reports.',
      '## Emergency numbers (India)',
      'Unified emergency helpline: 112 · Police: 100 · Ambulance: 108 · Tourist helpline: 1363 (toll-free, multilingual, 24×7).',
      '## Lost documents abroad',
      'Contact your nearest embassy or consulate first, then file a local police report — most insurers require both.',
    ].join('\n\n'),
  },
];

const out = `/**
 * AUTO-GENERATED by scripts/buildSeedData.mjs — do not edit by hand.
 * Source of truth: wanderwise/src/data.js (the prototype's curated dataset).
 * Shapes match backend spec §2.
 */
module.exports = ${JSON.stringify(
  { cities, curatedTours, pois, restaurants, stays, transportOptions, markets, staticContent },
  null, 2)};
`;

writeFileSync(new URL('../seed/data.js', import.meta.url), out);
console.log(`seed/data.js written — ${cities.length} cities, ${pois.length} pois, ${restaurants.length} restaurants, ${stays.length} stays, ${transportOptions.length} transport, ${markets.length} markets`);
