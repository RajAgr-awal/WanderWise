/**
 * WanderWise — honest data schema (scaffold)
 * No fabricated prices / hours / ratings / coordinates. Missing = null.
 * Every fact shows sourceType, confidence, lastCheckedAt (or "not yet field-checked").
 */

// Provenance for every field set
export const Provenance = {
  sourceType: null, // "fieldCheck" | "officialSite" | "phoneCall" | "community" | null
  confidence: 'low', // low | medium | high
  lastCheckedAt: null, // ISO string or null => "not yet field-checked"
  verified: false, // true only if curator confirmed on site within 12 months
  verifiedBy: null,
};

// Place shape — India-first
export const PlaceFields = {
  id: 'string',
  slug: 'string',
  name: 'string',
  city: 'string', state: 'string', country: 'India',
  location: { lat: 'number|null', lng: 'number|null' },
  category: 'heritage|nature|food|market|spiritual|...',
  what: 'string|null',
  why: 'string|null',
  when: { openingHours: 'string|null', closedDays: 'string[]|null', bestTime: 'string|null' },
  cost: { amount: 'number|null', currency: 'INR|null', basis: 'string|null' },
  duration: { minMinutes: 'number|null', maxMinutes: 'number|null' },
  etiquette: 'string[]|null',
  safety: 'string[]|null',
  accessibility: '{ wheelchair: string|null, notes: string|null }|null',
  backupPlaceId: 'string|null',
  provenance: 'Provenance',
  heroImage: 'string|null',
  partnerLinks: { maps: 'string|null', reviews: 'string|null', booking: 'string|null' },
};

// Helper to format provenance badge
export function provenanceLabel(p) {
  if (!p) return 'Not yet field-checked · confidence: low';
  if (p.verified) return `Verified · ${p.confidence} · ${p.lastCheckedAt || 'not yet field-checked'}`;
  const date = p.lastCheckedAt ? new Date(p.lastCheckedAt).toLocaleDateString('en-IN') : 'not yet field-checked';
  const src = p.sourceType || 'unknown source';
  return `${src} · ${p.confidence} · ${date}`;
}

export function isVerified(p) {
  return Boolean(p && p.verified && p.lastCheckedAt);
}
