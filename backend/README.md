# WanderWise — Backend (scaffold)

**Scaffold status:** `GET /api/health` live. All other routes are planned and return `501` until next prompt.

This folder previously held a Firebase Functions implementation (see `functions/` for reference). The new product principles require a **clean REST layer, env-driven, honest data, idempotent seed** — that lives in `src/` and `seed/` here.

## Layout

```
backend/
├── src/
│   ├── server.js          Express entry (0.0.0.0:3001)
│   ├── app.js             createApp() — CORS, JSON, routes
│   └── routes/health.js   GET /api/health
├── seed/
│   ├── seed.js            Idempotent seed (file or Firestore)
│   └── data/honest-sample.json  Honest sample — null for unknown fields
├── functions/             Legacy Firebase Functions (reference only)
├── firebase.json, firestore.*  Legacy Firebase config (not used in scaffold)
└── .env.example           All keys via env
```

## Endpoints

| Method | Path | Status |
|---|---|---|
| `GET` | `/api/health` | ✅ live |
| `GET` | `/api/places/:id` | ⏳ planned → 501 |
| `GET` | `/api/discover?lat=&lng=&time=&persona=` | ⏳ planned |
| `POST` | `/api/trips` | ⏳ planned |
| `GET` | `/api/cities` | ⏳ planned |

Health response:
```json
{
  "status": "ok",
  "service": "wanderwise-api",
  "version": "0.1.0",
  "time": "2026-10-18T18:30:08.131Z",
  "uptimeSec": 2,
  "env": "development",
  "checks": { "server": "up" },
  "dataStatus": "scaffold — no curated places; missing means null"
}
```

## Run

```bash
# from repo root
npm run dev:server          # http://localhost:3001
# or
node backend/src/server.js  # same
# or
npm --prefix backend run dev

# check
curl http://localhost:3001/api/health | jq .
```

Frontend proxies `/api` → `http://localhost:3001` in dev (see `vite.config.js`). Set `VITE_API_BASE_URL` to override.

## Seed — idempotent & honest

```bash
npm run seed                 # file mode → backend/seed/.seed-output.json
node backend/seed/seed.js --wipe   # overwrite

# Firestore mode (when env set)
FIRESTORE_EMULATOR_HOST=localhost:8080 node backend/seed/seed.js
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node backend/seed/seed.js --project wanderwise-prod
```

Rules:
- Never fabricate price / hours / rating / coordinates — missing = `null`
- Every place has `provenance: { sourceType, confidence, lastCheckedAt, verified }`
- `verified` is `false` until human curator confirms on site
- Seed is upsert-by-`id` — run twice → no duplicates

Sample: `seed/data/honest-sample.json` (2 places, 2 cities, all nullable).

## Env

See `../.env.example` and `./.env.example`. Never commit real keys. All via `process.env`.

```
PORT=3001
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=
```

## Legacy Firebase

`functions/`, `firebase.json`, `firestore.rules` etc. remain for reference but are **not** the scaffold path. Next prompt will decide whether to keep Firebase as sync layer or migrate fully to REST.

