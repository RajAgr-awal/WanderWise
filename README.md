# WanderWise — India-first in-destination travel companion 🇮🇳

> **Given who you are, where you are and what time it is, tell you the most meaningful and practical next choice.**

WanderWise is **NOT** a booking site and **NOT** a generic itinerary generator. It is an in-destination companion that helps you decide what to do *now* — around opening hours, heat, rest, meal times and pace.

Live preview (scaffold): `npm run dev` → http://localhost:5173

---

## Product Principles (applied to every decision)

1. **Depth over breadth** — every place answers: *what, why, when, cost, duration, etiquette, safety, accessibility, backup option*.
2. **Honest data** — nothing is "verified" unless a human curator confirmed it on site. Every fact shows `sourceType`, `confidence` (low/medium/high) and `lastCheckedAt` (or `"not yet field-checked"`).
3. **Time-aware** — plans are built around the *hour of day*, opening days, heat, rest, meal times and pace, not just distance.
4. **Partners, not competitors** — navigation → Google Maps, reviews → Tripadvisor, bookings → MakeMyTrip via plain labelled links. We never rebuild maps/reviews/booking, never scrape or copy their content.
5. **Offline-first** — itinerary, essentials and emergency numbers must work with no connection (PWA).

---

## Short Plan

### Screens (scaffold)

| Tab / Stack | Screen | Purpose (empty in scaffold) |
|---|---|---|
| **Discover** | `Discover` / `Now` | Time-aware next choice: who you are + where you are + time → one recommendation. Shows honest confidence badges. |
| — | `PlaceDetail` | Depth template: what / why / when / cost / duration / etiquette / safety / accessibility / backup. Partner handoff links. |
| **My Trips** | `MyTrips` | Offline itinerary, essentials, emergency numbers. Works without connection. |
| **Profile** | `Profile` | Guest mode by default; sign-in adds cross-device sync. No paywall to use the app. |

Stack overlays (not tabs): `PlaceDetail`, `TripDay`, `Essentials`, `Emergency`.

Desktop: responsive, mobile-first, centred **430px phone shell** on large screens.

### Data Collections

> All price / hours / rating / coordinate fields are **nullable**. Missing = `null`, never fabricated. `confidence` defaults to `low` until field-checked.

**`places`** — core India-first POIs
```js
{
  id, slug, name, city, state, country:"India",
  location: { lat: number|null, lng: number|null },
  category, // heritage | nature | food | market | spiritual | ...
  what: string|null, why: string|null,
  when: { openingHours: string|null, closedDays: string[]|null, bestTime: string|null },
  cost: { amount: number|null, currency:"INR"|null, basis: string|null }, // e.g. "per person"
  duration: { minMinutes: number|null, maxMinutes: number|null },
  etiquette: string[]|null, safety: string[]|null,
  accessibility: { wheelchair: string|null, notes: string|null }|null,
  backupPlaceId: string|null,
  provenance: { sourceType: "fieldCheck"|"officialSite"|"phoneCall"|"community"|null, confidence:"low"|"medium"|"high", lastCheckedAt: ISODate|null, verified: boolean, verifiedBy: string|null },
  heroImage: string|null,
  partnerLinks: { maps: string|null, reviews: string|null, booking: string|null }
}
```

**`cities`**
```js
{ id, name, state, heroImage, description, emergencyNumbers: { police, ambulance, touristHelpline } }
```

**`users`**
```js
{ id, email, displayName, createdAt, lastSeenAt }
```

**`trips`** (offline-cacheable)
```js
{
  id, userId: string|null, // null = guest local-only
  title, cityId, persona: { pace:"relaxed"|"balanced"|"intense", interests: string[] },
  days: [{ date, slots:[{ timeOfDay, placeId, backupPlaceId }] }],
  essentials: { water, heat, restStops },
  createdAt, offlineCachedAt
}
```

**`curatorChecks`** (audit trail for "verified")
```js
{ id, placeId, curatorId, checkedAt, notes, photos: string[] }
```

### Endpoints (REST — clean, versioned)

| Method | Path | Auth | Status | Purpose |
|---|---|---|---|---|
| `GET` | `/api/health` | no | **live** | Health check — returns status, version, time, checks |
| `GET` | `/api/places/:id` | no | planned | Single place with full depth fields + provenance |
| `GET` | `/api/discover?lat=&lng=&time=&persona=` | no | planned | Time-aware next choice |
| `POST` | `/api/trips` | optional | planned | Create offline-cacheable trip |
| `GET` | `/api/trips/:id` | optional | planned | Trip + essentials + emergency numbers |
| `GET` | `/api/cities` | no | planned | City list for offline shell |
| `POST` | `/api/curator/checks` | curator | planned | Mark field-checked |

All keys via env vars (see `.env.example` and `backend/.env.example`). No secrets in code.

---

## Scaffold — what is built now

This prompt delivers **only**:

- [x] Design tokens: dark theme `#0a0a0a` bg, `#151515` cards, `#e0c250` gold, `#9a9a9a` muted, `16px` radius, pill buttons
- [x] Responsive shell — centred 430px on desktop, full-width on mobile
- [x] Bottom tab bar: **Discover · My Trips · Profile** (guests can use without sign-in)
- [x] Empty screens with honest-data placeholders (no fabricated prices/hours/ratings/coords)
- [x] Health-check endpoint `GET /api/health`
- [x] Idempotent seed script (`backend/seed/seed.js`) — safe to run twice
- [x] PWA shell: manifest + offline fallback + service worker precache of itinerary/essentials/emergency numbers
- [ ] Full data, itinerary engine, auth sync — **next prompts**

> Nothing is labelled "verified" in scaffold. Every fact card shows `provenance` badge.

---

## Tech & UX

- **Frontend:** React 19 + Vite, vanilla CSS design system, PWA (service worker `public/sw.js`)
- **Backend (scaffold):** Express REST (`backend/src/server.js`) — `GET /api/health`
- **Old Firebase functions** remain in `backend/functions/` for reference but are not the scaffold path; new REST layer is in `backend/src/`
- **Offline-first:** itinerary, essentials, emergency numbers cached; `offline.html` fallback
- **Partners:** plain labelled links only — e.g. `Open in Google Maps`, `Read reviews on Tripadvisor`, `Check availability on MakeMyTrip`

### Environment variables

Root `.env.example`:
```
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_EMULATORS=false
```

Backend `backend/.env.example`:
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
# add keys as needed — never commit real values
```

All keys are read from `process.env` / `import.meta.env` — no hard-coded secrets.

### Idempotent seed

```bash
# from repo root
npm run seed        # or: node backend/seed/seed.js
# run twice → same result, no duplicates (upsert by id)
```

See `backend/seed/seed.js` — honest sample with `null` for unknown fields, `confidence: low`, `lastCheckedAt: null`.

---

## Getting started

```bash
npm install
npm run dev          # frontend on http://localhost:5173 (host 0.0.0.0, allowedHosts true)
# in another shell
npm run dev:server   # backend on http://localhost:3001 (GET /api/health)

# production build
npm run build
npm run preview

# tests (when added)
npm test
```

Vite proxies `/api` → `http://localhost:3001` in dev (see `vite.config.js`).

---

## Offline-first (PWA)

- `public/manifest.webmanifest` — `display: standalone`, `background_color #0a0a0a`
- `public/sw.js` — precaches shell + itinerary/essentials/emergency numbers; `offline.html` for navigations
- `public/offline.html` — shown when no connection; still shows cached trips

---

## Honest data contract

- Missing price/hours/rating/coordinates → `null` in API and UI shows "Not yet known"
- Confidence badge on every fact: `low` (default) / `medium` / `high` + `sourceType` + `lastCheckedAt`
- "Verified" badge appears **only** if `provenance.verified === true` (curator `checkedAt` within 12 months)

---

## Defaults chosen for scaffold

- Default city for demo: **Jaipur** (India-first) — but no fabricated hours/prices; all nullable
- Default persona: `pace: balanced`, guest mode (no sign-in required)
- Time-aware uses device local time; falls back to IST (`Asia/Kolkata`)
- Partner links are plain text buttons, not embedded maps/reviews
- Seed is file-based (`backend/seed/data/honest-sample.json`) so it works without DB; swap to Firestore/Mongo later

---

## Next prompt will add

- Real `places` collection with curator workflow
- `GET /api/discover` time-aware ranking (heat/rest/meal/openingDays)
- `PlaceDetail` depth template wired to API
- Auth sync (guest → signed-in migration)

---

*Built mobile-first. Depth over breadth. Partners, not competitors.*
