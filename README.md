# WanderWise — AI-Native Mobile Travel Companion 🌍✨

> **"Curated like a local, structured by algorithms, verified against real ground truth."**

---

### 🌐 Access & Downloads
* 🔗 **Live Web Application:** **[https://rajagr-awal.github.io/WanderWise/](https://rajagr-awal.github.io/WanderWise/)**
* 📱 **Android APK Download (<100MB):** **[Download WanderWise.apk](https://github.com/RajAgr-awal/WanderWise/releases/tag/latest-apk)**

[![Deploy to GitHub Pages](https://github.com/RajAgr-awal/WanderWise/actions/workflows/deploy.yml/badge.svg)](https://github.com/RajAgr-awal/WanderWise/actions/workflows/deploy.yml)
[![Build Android APK](https://github.com/RajAgr-awal/WanderWise/actions/workflows/build-apk.yml/badge.svg)](https://github.com/RajAgr-awal/WanderWise/actions/workflows/build-apk.yml)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20First-gold)](https://rajagr-awal.github.io/WanderWise/)
[![Android APK](https://img.shields.io/badge/Android-APK%20(~10MB)-green)](https://github.com/RajAgr-awal/WanderWise/releases/tag/latest-apk)
[![Firebase Backend](https://img.shields.io/badge/Backend-Firebase%202nd%20Gen-orange)](https://rajagr-awal.github.io/WanderWise/)

---

## 🚀 Key Features

* **⚡ Instant Day-by-Day Itineraries:** Generates structured morning, lunch, afternoon, evening, dinner, and night plans tailored to budget tiers (*Budget, Mid, Luxury*).
* **🛡️ Zero-Hallucination Pipeline:** Claude API acts strictly as an intelligent sequencer over curated, ground-truth database candidates. Real prices, ratings, and locations are re-attached server-side.
* **🧭 6 In-Trip Deep-Dive Dimensions:**
  * **Culture & History:** Architectural notes, origin stories, and regional traditions.
  * **Food & Delicacies:** Local signature dishes and vetted restaurants with "Price for Two".
  * **Stay Options:** Lodging filtered and ranked strictly by selected budget tier.
  * **Local Transport:** Pragmatic modes (metro, auto, cab, rail) with fare ranges and travel times.
  * **Markets & Bazaars:** Souvenir hubs, craft markets, and haggling guidance.
  * **Route Map:** Visual stop sequence with nearest-neighbor route sequencing and distance matrix.
* **🤖 Grounded AI Local Guide (RAG Chat):** 24/7 AI chat grounded in the user's active itinerary, budget constraints, and verified city documentation.
* **🗺️ "Design Your Own Tour" (Route Builder):** Custom multi-city routing with automatic transit calculations and template saving.
* **📲 Serverless Offline Sharing & Exporting:**
  * **URL Hash Sharing:** Encodes itineraries into short, compressed URL fragment tokens (`#t=...`) that rebuild locally without server dependency.
  * **Zero-Dep PDF Export:** Clean, printable PDF 1.4 day-by-day travel plan.
  * **Calendar Sync (.ics):** RFC 5545 calendar file with 30-minute reminder alarms.
  * **Offline HTML Guide:** Self-contained single-file travel guide opening with zero connectivity.
  * **PWA Offline Mode:** Service Worker caching app shell and destination photos for low-bandwidth roaming.

---

## 🛠️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT 19 FRONTEND (Vite)                 │
│  - Mobile-First Vanilla CSS Design System (Dark/Gold theme) │
│  - Offline PWA Service Worker (sw.js) & Zero-Dep Exporters  │
│  - Client SDK Seam (wanderwiseApi.js)                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS Callable
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             FIREBASE CLOUD FUNCTIONS (2nd Gen)              │
│  - Region: asia-south1 (Mumbai) | Node.js 20                │
│  - 14 Serverless Callables & Auth Triggers                  │
└───────────────────┬─────────────────────┬───────────────────┘
                    │                     │
                    ▼                     ▼
┌───────────────────────────────────┐  ┌──────────────────────┐
│       CLOUD FIRESTORE DATABASE    │  │ ANTHROPIC CLAUDE API │
│  - Cities, POIs, Stays, Restos    │  │ - JSON-constrained   │
│  - Users, Trips, Templates, Chats │  │   Sequencing Engine  │
└───────────────────────────────────┘  └──────────────────────┘
```

---

## 📦 Project Structure

```
.
├── public/                    # PWA manifest, service worker (sw.js), icons, offline fallback
├── src/
│   ├── api/                   # wanderwiseApi.js (Firebase client SDK seam)
│   ├── lib/                   # share.js, exporters.js, pwa.js, firebase.js
│   ├── screens/               # Discover, TripSetup, TripDetail, Trips, Builder, Chat, Profile, Auth, ShareExport
│   ├── components.jsx         # UI primitives (Cards, Modals, Segmented pickers, Ratings)
│   ├── data.js                # Curated baseline dataset & offline fallbacks
│   ├── icons.jsx              # Vector icon set
│   ├── store.jsx              # Application state context & sync
│   └── styles.css             # Vanilla CSS design system
├── backend/
│   ├── functions/             # 14 Cloud Functions (discover, estimate, itinerary, chat, trips, account, content)
│   ├── seed/                  # Seeder script & catalog generator (38 cities, 40 POIs, etc.)
│   ├── scripts/               # Automated unit & integration test suites
│   ├── firestore.rules        # Security rules
│   ├── firestore.indexes.json # Composite indexes
│   └── storage.rules          # Cloud Storage access rules
└── vite.config.js             # Vite build & automated service worker asset precache plugin
```

---

## 🏃 Getting Started Locally

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run production build
npm run build
```

### 2. Backend & Test Suite
```bash
cd backend/functions
npm install
cd ..

# Run all 73 automated tests (30 logic + 43 integration tests)
node --test scripts/logic.test.js scripts/functions.test.js
```

---

## 📄 License
MIT License. Built for Smart India Hackathon (SIH).
