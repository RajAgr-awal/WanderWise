# WanderWise — Product Requirements Document (for v0 build)

## 1. Product Summary
WanderWise is a mobile-first AI travel companion that turns a destination, duration, and budget into a ready, day-by-day trip itinerary — and then acts as a local guide throughout the trip. It covers itinerary generation, curated tour packages, a custom multi-city route builder, and destination-specific guidance across culture, food, stay, transport, and markets.

**Visual language:** Dark theme (near-black background), warm gold/amber accent color for primary CTAs and active states, high-contrast white/light-gray text, card-based layouts with rounded corners, destination photography as hero backgrounds.

## 2. Platform & Navigation
Mobile app (portrait). Bottom navigation bar with 3 tabs, persistent across the app:
1. **Discover** — home/explore
2. **My Trips** — trip history
3. **Profile** — account & settings

## 3. Screen-by-Screen Requirements

### 3.1 Auth
- **Welcome back (Sign in):** app logo/wordmark, "Welcome back" headline, tagline ("Sign in to plan your next escape"), Email field, Password field (with show/hide), "Forgot password?" link, primary "Sign in" button, divider "OR", secondary "Create new account" button.
- **Create account:** Full name, Email, Password (min. 8 chars, show/hide), consent line ("By signing up you agree to our Terms and Privacy Policy"), primary "Create account" button, "Already have an account? Sign in" link.

### 3.2 Discover (Home)
Top: app logo. Greeting: "Hello, [Name]" + subtext ("Where will we wander next?"). Search bar: "Search destinations…".

Sections (vertically stacked, horizontally scrollable card rows):
1. **Explore India Tour** — label shows city count (e.g., "20 cities"). City cards with photo, country tag, city name, one-line description, price/day. Cities: Jaipur, Delhi, Mumbai, Goa, Udaipur, Varanasi, Agra, Kolkata, Kerala, Kashmir, Chennai, Mysuru, Pushkar, Ahmedabad, Jagannath Puri (Puri), Pune, Hyderabad, Darjeeling, Shimla, Leh (Ladakh), Kochi (Alleppey).
2. **"Design your own tour"** — standalone CTA card ("Pick your cities, set days, get a live cost & time estimate") linking to the route builder.
3. **Curated Tours** — label shows route count. Cards with cover photo, region tag, route name, city sequence, duration, "Plan tour" CTA. Routes:
   - Golden Triangle — Delhi, Agra, Jaipur
   - Rajasthan Royals — Jaipur, Udaipur, Pushkar
   - Spiritual North — Delhi, Varanasi, Kashmir
   - Beaches & Backwaters — Kerala, Goa
   - Hill Stations & Nature — Kashmir, Shimla, Leh (Ladakh), Darjeeling
4. **Around the World** — international city cards (photo, country tag, name, price/day). Cities: Bangkok (Thailand), Hong Kong (China), London (UK), Istanbul (Turkey), Dubai (UAE), Makkah (Saudi Arabia), Antalya (Turkey), Paris (France), Kuala Lumpur (Malaysia).
5. **Suggestions (For Future)** — teaser row, same card style, non-bookable/"coming soon" state: London, Los Angeles, New York City, Paris, Melbourne, Tokyo, Toronto, Sydney, Chicago, Birmingham.
6. **Seasonal spotlight** — auto-rotating/ever-changing slide cycling through cities, recommending the best time/season to visit each.
7. **Your Trips** — recap strip at the bottom of Discover showing the user's past itineraries (mirrors My Trips).

### 3.3 Trip Setup (on selecting a city)
Hero section: destination photo as background, country tag (top-left, e.g., "INDIA"), city name (large), one-line description, "Best time" + "Language(s)" row below.

Controls:
- **Duration** — slider/stepper to choose number of days.
- **Budget tier** — 3 segmented options: $ Budget / $$ Mid / $$$ Luxury, each showing price/day.
- **Estimated Total** — live-updating total cost + per-day cost, based on duration × budget tier.
- **Generate Itinerary** — primary CTA.

### 3.4 Generated Itinerary
Day-by-day cards. Each day contains time-of-day slots:
- **Morning / Afternoon / Evening / Night** — each slot: place name, category tag (e.g., Heritage, Experience), one-line description, price (or "Free"), star rating badge top-right (e.g., ★4.7).
- **Lunch / Dinner** slots: restaurant name, area tag, one-line description, "Must try: [dish]", price for two.
- Each item has a checkbox so the user can include/exclude it from their plan.

Example (Jaipur, Day 1):
- Morning: Amber Fort (Heritage) — "Hilltop sandstone & marble fort with Sheesh Mahal mirror palace." ₹[fee] · ★4.7
- Afternoon: Hawa Mahal (Heritage) — one-line description · ₹[fee] · ★4.5
- Lunch: Laxmi Misthan Bhandar (LMB), Johari Bazaar — "Iconic 1727 sweet shop and thali joint." Must try: Dal Baati Churma · ₹800 for two
- Evening: Johari Bazaar (Gems & Traditional Jewelry) — one-line description · Free
- Night: Dinner at Laxmi Misthan Bhandar

### 3.5 Trip Detail Tabs
Within an active/generated trip, a sub-nav bar: **Itinerary | Culture | Food | Stay | Transport | Market**
- **Itinerary** — the generated day-by-day plan (3.4).
- **Culture** — brief write-up on the city's culture, origin, and history.
- **Food** — local delicacies and must-try dishes, each with the best spot to get them.
- **Stay** — recommended accommodations, filtered/sorted by budget tier and proximity to planned stops.
- **Transport** — recommended ways to move between stops, weighed by cost and time (e.g., metro, auto-rickshaw, taxi, rail).
- **Market** — recommended local markets/craft bazaars for souvenirs and local art.
- **Map** (accessible from trip detail) — city map with the user's stops pinned, distances between spots, a suggested visiting order, and best time to visit each.

A floating **"Ask your local guide"** action is available throughout the trip view, opening the AI chat (see 3.6).

### 3.6 AI Local Guide (Chat)
Chat interface scoped to the active trip/city. Empty state: "Ask your local guide" + example prompts ("What's the best route near Shibuya?", "How do I get from the airport to my hotel?"). Standard chat input with send button.

### 3.7 Design Your Own Tour (Multi-City Route Builder)
"Build a route" screen:
- Running list of added cities/legs, each with its own duration (days) and running cost, and a remove action.
- "You might also add" recommended cities.
- "Browse all cities" — searchable/filterable list (India + international).
- Budget tier selector ($/$$/$$$) applied across the route.
- Summary bar: total time + total estimated cost.
- Actions: **Create my tour** (generates the multi-city itinerary) and **Save as template** (stores the route for reuse).

### 3.8 My Trips
List/grid of the user's past and current trips (itineraries), each entry showing destination(s), dates/duration, and a thumbnail — tapping opens that trip's detail view (3.5).

### 3.9 Profile
- Top: app logo.
- Profile card: name, profile photo, email, "Edit" action.
- **Account** — "My Templates": saved custom tour combinations/routes (from 3.7) for reuse, in their saved order.
- **Privacy Policy** — data collected, how it's used, third parties, user rights, security, contact.
- **Terms & Services** — service description and terms of use.
- **Contact Support** — support/emergency contact info.
- **Logout** button.
- **Delete Account** action (destructive, needs confirmation).

## 4. Core Data Model (for mock/sample data)
- **City**: id, name, country, tags, hero image, one-line description, best time to visit, languages, price/day by tier (budget/mid/luxury)
- **Tour (curated)**: id, name, region, cities[], duration, cover image
- **Route (custom)**: id, cities[] (each with days, cost), budget tier, total time, total cost
- **Itinerary**: tripId, city/cities, duration, budget tier, days[] → slots[] (time period, place, category, description, price, rating)
- **Place/POI**: name, category, description, price or "Free", rating
- **Restaurant**: name, area, description, must-try dish, price for two
- **Stay option**: name, price tier, distance from planned stops
- **Transport option**: mode, cost range, time estimate
- **Market**: name, specialty (crafts/textiles/jewelry/etc.)
- **User**: name, email, profile photo, saved templates[], trip history[]

## 5. Out of Scope for v0 (initial build)
- Real payment/booking integrations
- Live backend/auth (use mock data and local state)
- Real-time chat AI backend (UI + placeholder responses acceptable)

## 6. Success Criteria for the v0 Build
- All screens in Section 3 are implemented with the described components and sample data.
- Navigation matches: bottom tabs (Discover/My Trips/Profile) + in-trip sub-tabs (Itinerary/Culture/Food/Stay/Transport/Market).
- Dark theme with gold/amber accents applied consistently.
- Fully responsive on mobile viewport widths.
