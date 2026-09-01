/**
 * Trip sharing — encodes a trip into a URL that needs no server.
 *
 * Key idea: the catalog (cities, POIs, restaurants) is bundled into the app, and
 * `generateItinerary` is deterministic. So a share link only needs the *inputs*
 * (cities, duration, tier) plus which items were unticked — the recipient's copy
 * of the app rebuilds the identical itinerary locally. That keeps links short
 * enough to paste into WhatsApp and works with a purely static deploy.
 *
 * Payload is deflate-compressed (native CompressionStream) then base64url'd, with
 * a plain-base64 fallback for older browsers. Everything lives in the URL fragment
 * (#t=...) so the trip data is never sent to the server in a request.
 */

import { generateItinerary, cityById } from '../data.js';

const VERSION = 1;

// ---- base64url helpers -----------------------------------------------------
const toB64Url = (bytes) => {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64Url = (str) => {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const hasCompression = () =>
  typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

async function deflate(text) {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function inflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).text();
}

// ---- compact trip representation -------------------------------------------
/** Trip -> minimal shareable object. */
export function toPayload(trip) {
  return {
    v: VERSION,
    t: trip.title,
    c: trip.cityIds,
    d: trip.durationDays,
    b: trip.budgetTier,
    y: trip.type,
    x: trip.excluded || [],       // unticked slot ids
    n: trip.notes || undefined,
    a: trip.sharedBy || undefined, // author display name
    // Per-leg day split and the authoritative total. The route builder prices each
    // leg separately, which differs from a naive average × days, so we carry the
    // real numbers rather than re-deriving them and drifting.
    g: trip.legDays || undefined,
    m: typeof trip.estimatedTotal === 'number' ? trip.estimatedTotal : undefined,
  };
}

/** Minimal object -> full trip, rebuilt from the bundled catalog. */
export function fromPayload(p, { id } = {}) {
  if (!p || p.v !== VERSION) throw new Error('This link was made with a different app version.');
  if (!Array.isArray(p.c) || !p.c.length) throw new Error('Link is missing its destinations.');
  for (const cityId of p.c) {
    if (!cityById(cityId)) throw new Error(`This link references an unknown city ("${cityId}").`);
  }
  const durationDays = Number(p.d) || 1;
  // Prefer the author's authoritative total; fall back to the single-city formula.
  const avgPerDay = Math.round(
    p.c.reduce((s, cid) => s + cityById(cid).pricePerDay[p.b], 0) / p.c.length
  );
  const estimatedTotal = typeof p.m === 'number' ? p.m : avgPerDay * durationDays;
  const perDay = Math.round(estimatedTotal / Math.max(1, durationDays));
  return {
    id: id || 'shared_' + Math.random().toString(36).slice(2, 10),
    type: p.y || (p.c.length > 1 ? 'multi-city' : 'single-city'),
    title: p.t || cityById(p.c[0]).name,
    cityIds: p.c,
    durationDays,
    budgetTier: p.b,
    estimatedTotal: perDay * durationDays,
    perDayCost: perDay,
    days: generateItinerary(p.c, durationDays, p.b),
    excluded: p.x || [],
    notes: p.n || '',
    sharedBy: p.a || null,
    isShared: true,
    createdAt: Date.now(),
  };
}

// ---- encode / decode --------------------------------------------------------
export async function encodeTrip(trip) {
  const json = JSON.stringify(toPayload(trip));
  if (hasCompression()) {
    try { return 'z' + toB64Url(await deflate(json)); } catch { /* fall through */ }
  }
  return 'p' + toB64Url(new TextEncoder().encode(json));
}

export async function decodeTrip(token) {
  if (!token || token.length < 2) throw new Error('Empty share link.');
  const mode = token[0];
  const body = fromB64Url(token.slice(1));
  let json;
  if (mode === 'z') {
    if (!hasCompression()) throw new Error('This browser cannot read compressed links.');
    json = await inflate(body);
  } else if (mode === 'p') {
    json = new TextDecoder().decode(body);
  } else {
    throw new Error('Unrecognised link format.');
  }
  return fromPayload(JSON.parse(json));
}

/** Build the full shareable URL for a trip. */
export async function buildShareUrl(trip, { author } = {}) {
  const token = await encodeTrip({ ...trip, sharedBy: author || trip.sharedBy });
  const base = `${location.origin}${location.pathname}`;
  return `${base}#t=${token}`;
}

/** Read a share token out of the current URL, if present. */
export function readShareToken() {
  const hash = location.hash || '';
  const m = hash.match(/[#&]t=([^&]+)/);
  return m ? m[1] : null;
}

export function clearShareToken() {
  if (location.hash.includes('t=')) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

// ---- templates --------------------------------------------------------------
export async function encodeTemplate(tpl) {
  const json = JSON.stringify({
    v: VERSION, k: 'tpl', n: tpl.name, o: tpl.notes || '',
    l: tpl.legs.map((l) => [l.cityId, l.days]), b: tpl.tier, a: tpl.sharedBy || undefined,
  });
  if (hasCompression()) {
    try { return 'z' + toB64Url(await deflate(json)); } catch { /* noop */ }
  }
  return 'p' + toB64Url(new TextEncoder().encode(json));
}

export async function decodeTemplate(token) {
  const mode = token[0];
  const body = fromB64Url(token.slice(1));
  const json = mode === 'z' ? await inflate(body) : new TextDecoder().decode(body);
  const p = JSON.parse(json);
  if (p.k !== 'tpl') throw new Error('Not a template link.');
  const legs = p.l.map(([cityId, days]) => ({ cityId, days }));
  for (const l of legs) {
    if (!cityById(l.cityId)) throw new Error(`Unknown city "${l.cityId}" in template.`);
  }
  return {
    id: 'tpl_' + Math.random().toString(36).slice(2, 10),
    name: p.n, notes: p.o, legs, tier: p.b, sharedBy: p.a || null, createdAt: Date.now(),
  };
}

/** Copy text, falling back to a temporary textarea when the API is blocked. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch { return false; }
  }
}

/** Native share sheet where available (mobile), else copy. */
export async function shareUrl({ title, text, url }) {
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return 'shared'; }
    catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
  }
  return (await copyText(url)) ? 'copied' : 'failed';
}
