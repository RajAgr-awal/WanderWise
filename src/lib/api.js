/**
 * WanderWise REST client — single seam for the scaffold.
 * Uses VITE_API_BASE_URL (env) — no hard-coded host.
 * Guests work without auth; sign-in adds cross-device sync (future).
 */

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

async function request(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('/api/health'),
  // Planned (scaffold returns 501 until next prompt)
  getPlace: (id) => request(`/api/places/${id}`),
  discover: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/api/discover${q ? `?${q}` : ''}`);
  },
  getCities: () => request('/api/cities'),
};

export const API_BASE = BASE;
