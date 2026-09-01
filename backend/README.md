# WanderWise — Firebase Backend

Full implementation of `WanderWise_Firebase_Backend_Spec.md`. Every service, function,
rule and seed requirement in that document is built here.

**Status:** 73 automated tests passing (30 logic + 43 function integration).

---

## 1. Layout

```
backend/
├── firebase.json              Emulator + deploy config
├── .firebaserc                Project aliases
├── firestore.rules            Security rules (spec §5)
├── firestore.indexes.json     Composite indexes for every query used
├── storage.rules              Storage rules (spec §6)
├── functions/
│   ├── index.js               Exports all 14 callables/triggers
│   ├── discover/              getDiscoverFeed, getCityDetail
│   ├── estimate/              calculateEstimate (+ shared computeEstimate)
│   ├── itinerary/             generateItinerary, buildRoute, getTripMap
│   ├── chat/                  chatWithLocalGuide
│   ├── trips/                 getMyTrips, getTripDetailTab, updateTripSlot
│   ├── account/               onUserCreate, ensureUserProfile, deleteAccount
│   ├── content/               getStaticContent
│   └── lib/                   claudeClient, distance, firebase, errors
├── seed/
│   ├── seed.js                Seeder (spec §7)
│   └── data.js                Generated catalog — 38 cities, 40 POIs, 20 restaurants,
│                              16 stays, 14 transport options, 12 markets, 3 legal docs
├── scripts/
│   ├── buildSeedData.mjs      Regenerates seed/data.js from the prototype dataset
│   ├── fakeFirestore.js       In-memory Firestore double for tests
│   ├── logic.test.js          30 unit tests
│   └── functions.test.js      43 integration tests
└── client/
    └── wanderwiseApi.js       Client SDK — the seam between the React app and Firebase
```

---

## 2. API surface

| Function | Type | Powers |
|---|---|---|
| `getDiscoverFeed` | callable | All 7 Discover sections in one request |
| `getCityDetail` | callable | Trip Setup hero |
| `calculateEstimate` | callable | Live "Estimated Total" |
| `generateItinerary` | callable | **Core** — Claude-planned day-by-day itinerary |
| `buildRoute` | callable | Route builder: `estimate` / `create` / `saveTemplate` |
| `getTripMap` | callable | Map pins, nearest-neighbour order, distances |
| `chatWithLocalGuide` | callable | RAG chat grounded in the user's trip |
| `getMyTrips` | callable | My Trips + Discover recap strip |
| `getTripDetailTab` | callable | Culture / Food / Stay / Transport / Market |
| `updateTripSlot` | callable | Itinerary checkboxes + recomputed spend |
| `onUserCreate` | blocking trigger | Writes `/users/{uid}` on sign-up |
| `ensureUserProfile` | callable | Idempotent profile repair |
| `deleteAccount` | callable | Firestore → Storage → Auth cascade |
| `getStaticContent` | callable | Privacy / Terms / Support copy |

---

## 3. Local development

```bash
cd backend/functions && npm install
cd .. && npm install --save-dev firebase-tools

# Run the test suite (no emulator or JDK needed)
node --test scripts/logic.test.js
node --test scripts/functions.test.js

# Emulator (needs JDK 21+)
npx firebase emulators:start
# then, in another shell:
FIRESTORE_EMULATOR_HOST=localhost:8080 GCLOUD_PROJECT=wanderwise-dev node seed/seed.js
```

Regenerate the catalog after editing the prototype's dataset:

```bash
node scripts/buildSeedData.mjs
```

---

## 4. Deploying

```bash
firebase use --add                                   # pick/create your project
firebase functions:secrets:set ANTHROPIC_API_KEY     # spec §9
firebase deploy --only firestore:rules,firestore:indexes,storage
firebase deploy --only functions
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node seed/seed.js --project <id>
```

Functions deploy to **asia-south1** (Mumbai). Change `setGlobalOptions` in
`functions/index.js` if your users are elsewhere — and update the region in
`client/wanderwiseApi.js` to match.

---

## 5. Design decisions worth knowing

**Claude never invents places.** `generateItinerary` sends Claude a candidate list of
real POI/restaurant ids from Firestore and asks it only to *select and sequence*. The
response is validated against that id set, and prices/ratings/categories are re-attached
server-side from the source documents afterwards. A hallucinated id fails validation and
triggers one stricter retry; if that fails too, a deterministic ranked-by-rating planner
takes over. **No hallucinated price or rating can reach the UI.**

**Costs are server-authoritative.** `computeEstimate` is shared by `calculateEstimate`,
`generateItinerary` and `buildRoute`, so all three always agree. Clients cannot create
trip documents directly — the rules deny `create` on `/users/{uid}/trips`, so totals
can't be forged.

**Chat is retrieval-augmented and scoped.** `chatWithLocalGuide` builds context from the
user's own itinerary, budget and the city's curated docs, and instructs the model to
answer only from that data. A 20/question daily quota matches the counter in the UI.

**Deletion is irreversible and ordered.** Firestore recursive delete → Storage prefix
delete → Auth record last, so a partial failure leaves the user able to retry rather than
orphaned. Requires a sign-in within the last 10 minutes.

**Graceful degradation.** If `ANTHROPIC_API_KEY` is unset, itinerary generation falls
back to the deterministic planner instead of erroring — the emulator and CI work with no
API key or spend.

---

## 6. Testing without JDK 21

The Firebase emulator now requires JDK 21, which wasn't available in this environment.
`scripts/fakeFirestore.js` is an in-memory Firestore double implementing the subset the
functions use (queries, `in`/`>=` filters, `orderBy`, `count`, `getAll`, batches,
transactions, `recursiveDelete`). The **real handler code** runs against it, so auth
gates, validation, Firestore reads/writes and response shapes are genuinely exercised.
Once you have JDK 21, `npx firebase emulators:start` runs the same functions unchanged.

---

## 7. Wiring the prototype up

1. `npm install firebase` in the app.
2. Copy `client/wanderwiseApi.js` to `src/api/`.
3. Add to `.env`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_RECAPTCHA_SITE_KEY=...
   ```
4. Replace the mock calls in `src/store.jsx` and the screens with `api.*` equivalents.
   The response shapes were designed to match what the components already render, so
   this is mostly deleting local computation rather than reshaping data.
