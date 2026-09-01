# WanderWise — Firebase Backend Specification

This document specifies everything needed to build WanderWise's backend on **Firebase**: which services to use, the full data model, every Cloud Function with its inputs/outputs and working logic, security rules, storage layout, and how each app feature (from the PRD) is powered end to end.

---

## 1. Firebase Services Used

| Service | Purpose |
|---|---|
| **Firebase Authentication** | Email/password sign-up & sign-in, session management, account deletion |
| **Cloud Firestore** | Primary database — users, cities, tours, routes, trips/itineraries, chat, templates |
| **Cloud Storage for Firebase** | Destination photos, POI images, user profile photos |
| **Cloud Functions (2nd gen)** | All server-side logic: itinerary generation, cost calculation, AI Local Guide chat, account lifecycle |
| **Firebase App Check** | Blocks unauthorized clients from calling Functions/Firestore directly |
| **Firebase Hosting** (optional) | Serves the web build / marketing site if needed |
| **Firebase Extensions: Trigger Email / Delete User Data** | Cleanup on account deletion, transactional emails (password reset confirmation, etc.) |

**External dependency:** Cloud Functions call the **Claude API** (Anthropic) for itinerary generation and the AI Local Guide chat — Firebase hosts the app logic and data; Claude provides the generation/reasoning layer, exactly as noted in the app's own Privacy Policy screen.

---

## 2. Firestore Data Model

```
/users/{userId}
  name, email, photoUrl, createdAt
  homeCurrency

/cities/{cityId}
  name, country, tags[], heroImageUrl, description
  bestTimeToVisit, languages[]
  pricePerDay: { budget, mid, luxury }
  culture: { history, originText }
  isInternational: bool
  isComingSoon: bool          // for "Suggestions (For Future)" row

/curatedTours/{tourId}
  name, region, cityIds[], durationDays, coverImageUrl

/pois/{poiId}                 // Points of interest (attractions)
  cityId, name, category, description, price, rating, imageUrl, lat, lng

/restaurants/{restaurantId}
  cityId, name, area, description, mustTryDish, priceForTwo, lat, lng

/stays/{stayId}
  cityId, name, priceTier, distanceFromCenterKm, imageUrl

/transportOptions/{optionId}
  cityId, mode, costRange, timeEstimate

/markets/{marketId}
  cityId, name, specialty, description, imageUrl

/users/{userId}/trips/{tripId}
  type: "single-city" | "multi-city" | "curated"
  cityIds[], durationDays, budgetTier, estimatedTotal, perDayCost
  status: "generated" | "draft"
  createdAt
  itinerary: {
    days: [
      { dayNumber, slots: [
          { period: "morning"|"afternoon"|"evening"|"night"|"lunch"|"dinner",
            refType: "poi"|"restaurant", refId, checked: bool }
      ]}
    ]
  }

/users/{userId}/templates/{templateId}
  name, cityIds[], perCityDays{}, budgetTier, totalTime, totalCost, createdAt

/users/{userId}/trips/{tripId}/chatMessages/{messageId}
  role: "user" | "assistant", text, createdAt

/staticContent/{docId}        // "privacyPolicy" | "termsOfService" | "contactSupport"
  title, body, lastUpdated
```

---

## 3. Authentication

- **Sign up:** `createUserWithEmailAndPassword` → on success, a Cloud Function trigger (`onUserCreate`) writes the initial `/users/{userId}` document (name, email, empty templates/trip history).
- **Sign in:** `signInWithEmailAndPassword`; "Forgot password" uses Firebase's built-in password-reset email.
- **Delete Account:** client calls a callable Function `deleteAccount` (never deletes client-side only) which:
  1. Deletes all Firestore docs under `/users/{userId}` (trips, templates, chat messages) via a recursive delete.
  2. Deletes the Storage folder `/users/{userId}/`.
  3. Deletes the Firebase Auth user record.
  This matches the "Delete Account" action in Profile (irreversible, as stated in the in-app Privacy Policy).

---

## 4. Cloud Functions — one per feature

### 4.1 `getDiscoverFeed` (callable)
**Powers:** Discover home screen.
**Logic:** Reads `/cities` (filtered by `isInternational=false` for "Explore India Tour", `true` for "Around the World", `isComingSoon=true` for "Suggestions (For Future)"), `/curatedTours`, and a seasonal-rotation pick (current month → best-time-matched cities). Returns one combined payload so the client makes a single request on app load.

### 4.2 `getCityDetail` (callable)
**Input:** `cityId`
**Powers:** Trip setup hero screen (name, description, best time, languages, price/day per tier).

### 4.3 `calculateEstimate` (callable)
**Input:** `cityId(s)`, `durationDays`, `budgetTier`
**Logic:** Pure calculation — `pricePerDay[budgetTier] × durationDays` (summed across cities for multi-city routes). Powers the live-updating "Estimated Total" on both the single-city setup screen and the route builder.

### 4.4 `generateItinerary` (callable) — the core feature
**Input:** `cityIds[]`, `durationDays`, `budgetTier`, per-city day allocation (for multi-city)
**Logic:**
1. Fetch candidate `pois`, `restaurants` for the given city/cities from Firestore.
2. Build a structured prompt to the **Claude API** containing: city context, duration, budget tier, and the candidate POI/restaurant list (so the model selects and sequences from real, curated data rather than inventing places).
3. Request structured JSON output: an array of days, each with morning/afternoon/evening/night slots (POI reference) and lunch/dinner slots (restaurant reference).
4. Validate the returned JSON against the expected schema; on failure, retry once with a stricter format instruction.
5. Write the result to `/users/{userId}/trips/{tripId}.itinerary` and return it to the client.
**Output:** the day-by-day itinerary object described in Section 2, ready to render as itinerary cards with rating/price/category already attached from the source POI docs (so no hallucinated prices or ratings reach the UI).

### 4.5 `buildRoute` (callable)
**Powers:** "Design your own tour" / route builder.
**Input:** ordered list of `{cityId, days}` legs, `budgetTier`
**Logic:** Validates each city exists, computes running total time and cost via `calculateEstimate` per leg, returns "you might also add" suggestions (cities in the same region not yet in the route). On "Create my tour," calls `generateItinerary` across all legs in sequence. On "Save as template," writes to `/users/{userId}/templates`.

### 4.6 `chatWithLocalGuide` (callable)
**Input:** `tripId`, user `message`
**Logic:** Retrieval-augmented generation — pulls the trip's itinerary, city culture/food/transport docs as grounding context, appends the running chat history from `/users/{userId}/trips/{tripId}/chatMessages`, and calls the Claude API scoped strictly to that context (so answers stay grounded in the traveler's actual trip/budget, not generic web knowledge). Persists both the user message and assistant reply to Firestore.

### 4.7 `getTripDetailTab` (callable)
**Input:** `tripId`, `tab` (culture | food | stay | transport | market)
**Logic:** Returns the relevant Firestore documents for the trip's city — `culture` field from `/cities`, joined `/restaurants`, `/stays`, `/transportOptions`, `/markets` filtered by `cityId` and (for stay/transport) sorted by proximity to the itinerary's POI coordinates and the trip's budget tier.

### 4.8 `getTripMap` (callable)
**Input:** `tripId`
**Logic:** Collects lat/lng for every POI in the itinerary, computes pairwise distances (haversine), returns an ordered visiting sequence (nearest-neighbor route optimization) plus best-time-to-visit notes pulled from each POI doc.

### 4.9 `getMyTrips` (callable)
Reads `/users/{userId}/trips` ordered by `createdAt desc` — powers My Trips list and the "Your Trips" recap strip on Discover.

### 4.10 `getStaticContent` (callable)
**Input:** `docId` (privacyPolicy | termsOfService | contactSupport)
Returns the content doc for the Profile screen's static pages — kept in Firestore (not hardcoded) so legal copy can be updated without a client release.

---

## 5. Firestore Security Rules (summary)

```
- /users/{userId}: read/write only if request.auth.uid == userId
- /users/{userId}/trips/**: read/write only if request.auth.uid == userId
- /users/{userId}/templates/**: read/write only if request.auth.uid == userId
- /cities, /curatedTours, /pois, /restaurants, /stays, /transportOptions, /markets, /staticContent:
    public read, write denied from client (managed via admin SDK / seed scripts only)
```
All writes to user-owned subcollections that affect cost/itinerary data go through **callable Cloud Functions**, not direct client writes — this stops a client from writing a fake "generated" itinerary or tampering with estimated totals.

---

## 6. Cloud Storage Layout

```
/cities/{cityId}/hero.jpg
/pois/{poiId}/photo.jpg
/users/{userId}/profile.jpg
```
Public read for `/cities/**` and `/pois/**`; `/users/**` readable/writable only by the owning user.

---

## 7. Seed Data Requirement

Before any itinerary can be generated, `/cities`, `/pois`, `/restaurants`, `/stays`, `/transportOptions`, and `/markets` must be pre-populated (via an admin seed script) for at least the initial launch cities — this is the "curated POI dataset" the feasibility slide references. `generateItinerary` and `chatWithLocalGuide` both depend on this data existing; without it there is nothing to ground the AI against.

## 8. Suggested Cloud Functions Project Structure

```
/functions
  index.js                  // exports all callables
  /discover   → getDiscoverFeed.js, getCityDetail.js
  /estimate   → calculateEstimate.js
  /itinerary  → generateItinerary.js, buildRoute.js, getTripMap.js
  /chat       → chatWithLocalGuide.js
  /trips      → getMyTrips.js, getTripDetailTab.js
  /account    → onUserCreate.js, deleteAccount.js
  /content    → getStaticContent.js
  /lib        → claudeClient.js (shared Claude API wrapper), distance.js (haversine helper)
```

## 9. Environment / Secrets

Store via `firebase functions:secrets:set`:
- `ANTHROPIC_API_KEY`
No other third-party keys are required for the core flow described here (maps rendering can use a client-side maps SDK key managed separately from this backend).
