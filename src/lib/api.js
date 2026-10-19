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
  getPlace: (id) => request(`/api/places/${id}`),
  discover: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/api/discover${q ? `?${q}` : ''}`);
  },
  getCities: (params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/api/cities${q ? `?${q}` : ''}`);
  },
  getCity: (slug) => request(`/api/cities/${slug}`),
  getCityPlaces: (slug, params) => {
    const q = new URLSearchParams(params || {}).toString();
    return request(`/api/cities/${slug}/places${q ? `?${q}` : ''}`);
  },
  dataQuality: () => request('/api/data-quality'),
  importLog: () => request('/api/import-log'),
  patchPlace: (id, body) => request(`/api/places/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const API_BASE = BASE;
