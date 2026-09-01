# WanderWise v0 — Prototype Export

## What's in here

| File | Use |
|---|---|
| `WanderWise-prototype.html` | **Single self-contained file.** Open in any browser — no server, no install. All CSS/JS inlined. |
| `wanderwise-web/` | Static production build (`index.html` + `assets/`). Drop onto Netlify, Vercel, Firebase Hosting, S3, or any static host. |
| `WanderWise-source.zip` | Full React + Vite source code. |

## Running it

**Fastest:** double-click `WanderWise-prototype.html`.

**Static host:** deploy the `wanderwise-web/` folder as-is.

**Source:**
```bash
unzip WanderWise-source.zip && cd wanderwise
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
```

## Notes
- Destination photos load from Unsplash, so the prototype needs internet for imagery. Everything else works offline.
- Auth is mocked: any valid-format email + an 8-character password signs you in.
- Trips, templates, chats and profile persist in browser `localStorage` (key `wanderwise.v1`). Clearing site data resets the app.

## Source layout
```
src/
  data.js         All mock content — cities, POIs, restaurants, stays,
                  transport, markets + the itinerary generator.
                  Shaped to match the Firestore collections in the
                  backend spec, so swapping in Firebase is a data-layer change.
  store.jsx       Global state, navigation stack, localStorage persistence.
  components.jsx  Shared UI primitives.
  icons.jsx       Inline SVG icon set (no icon dependency).
  styles.css      Dark + gold design tokens and all component styles.
  screens/        Auth, Discover, TripSetup, TripDetail, Chat, Builder,
                  Trips, Profile.
```

## Screens implemented (PRD §3)
Auth · Discover (6 sections + search) · Trip Setup · Itinerary ·
Culture / Food / Stay / Transport / Markets / Map tabs ·
AI Local Guide chat · Route Builder + Save as template ·
My Trips · Profile (templates, privacy, terms, support, delete account)
