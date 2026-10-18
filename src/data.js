/**
 * WanderWise — scaffold data (honest)
 * No fabricated prices/hours/ratings/coordinates. Missing = null.
 * Real data will come from /api/places — this file only holds the schema + empty fallback.
 *
 * For the honest sample, see backend/seed/data/honest-sample.json
 */

export const MONEY = (n) =>
  n == null ? 'Not yet known' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// Empty collections — API will populate. Scaffold shows "Not yet known" UI, not fake data.
export const CITIES = [];
export const PLACES = [];
export const CURATED_TOURS = [];
export const SEASONAL = [];

// Helpers (keep signatures so existing components don't break during scaffold)
export const cityById = () => null;
export const money = MONEY;
export const TIER_LABEL = { budget: 'Budget', mid: 'Mid-range', luxury: 'Luxury' };
