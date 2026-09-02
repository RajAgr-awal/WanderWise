/**
 * WanderWise service worker — offline-first for travellers on bad data.
 *
 * Strategy per resource type:
 *  - app shell (HTML/JS/CSS): stale-while-revalidate, so the app opens instantly
 *    and quietly updates in the background.
 *  - navigations: network-first with a cached-shell fallback, so a share link
 *    still resolves offline (the trip is encoded in the URL fragment).
 *  - destination photos: cache-first with an LRU cap, because they're immutable
 *    and by far the heaviest thing to re-download on roaming data.
 *
 * Bumping CACHE_VERSION invalidates every old cache on the next activate.
 */

const CACHE_VERSION = 'v1-indexDZX7G28kcss';
const SHELL_CACHE = `ww-shell-${CACHE_VERSION}`;
const IMAGE_CACHE = `ww-img-${CACHE_VERSION}`;
const MAX_IMAGES = 120;

// Same-origin assets that make the app usable with no network at all.
const SHELL_ASSETS = ['./', './index.html', './manifest.webmanifest', './offline.html', "./assets/index-BeVhHDN4.js", "./assets/index-DZX7G28k.css"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      // addAll is atomic — one 404 would abort the install, so add individually.
      .then((cache) => Promise.allSettled(SHELL_ASSETS.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== IMAGE_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/** Trim a cache to a maximum entry count, oldest first. */
async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  for (const key of keys.slice(0, keys.length - max)) await cache.delete(key);
}

const isImage = (request, url) =>
  request.destination === 'image' || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // ---- navigations: network first, fall back to the cached shell -----------
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(SHELL_CACHE);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(SHELL_CACHE);
        return (await cache.match('./index.html'))
          || (await cache.match('./'))
          || (await cache.match('./offline.html'))
          || new Response('<h1>Offline</h1><p>Open WanderWise once with a connection.</p>',
              { headers: { 'Content-Type': 'text/html' }, status: 503 });
      }
    })());
    return;
  }

  // ---- images: cache first, with an LRU cap -------------------------------
  if (isImage(request, url)) {
    event.respondWith((async () => {
      const cache = await caches.open(IMAGE_CACHE);
      const hit = await cache.match(request);
      if (hit) return hit;
      try {
        const res = await fetch(request);
        // Opaque cross-origin responses are still worth caching for display.
        if (res && (res.ok || res.type === 'opaque')) {
          await cache.put(request, res.clone());
          trimCache(IMAGE_CACHE, MAX_IMAGES);
        }
        return res;
      } catch {
        // 1x1 transparent GIF keeps layout intact when a photo can't load.
        return new Response(
          Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
            (c) => c.charCodeAt(0)),
          { headers: { 'Content-Type': 'image/gif' } }
        );
      }
    })());
    return;
  }

  // ---- same-origin assets: stale-while-revalidate -------------------------
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => { if (res && res.ok) cache.put(request, res.clone()); return res; })
        .catch(() => null);
      return cached || (await network) || new Response('', { status: 504 });
    })());
  }
});

// Let the page trigger an immediate update, and report cache size for Settings.
self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  if (type === 'SKIP_WAITING') self.skipWaiting();

  if (type === 'CACHE_STATUS') {
    event.waitUntil((async () => {
      const [shell, images] = await Promise.all([caches.open(SHELL_CACHE), caches.open(IMAGE_CACHE)]);
      const [shellKeys, imageKeys] = await Promise.all([shell.keys(), images.keys()]);
      let usage = null;
      if (navigator.storage?.estimate) {
        try { usage = (await navigator.storage.estimate()).usage; } catch { /* noop */ }
      }
      event.source?.postMessage({
        type: 'CACHE_STATUS',
        shell: shellKeys.length, images: imageKeys.length, usage, version: CACHE_VERSION,
      });
    })());
  }

  if (type === 'CLEAR_IMAGE_CACHE') {
    event.waitUntil(caches.delete(IMAGE_CACHE).then(() =>
      event.source?.postMessage({ type: 'IMAGE_CACHE_CLEARED' })));
  }

  // Warm the cache with a trip's photos before the traveller loses signal.
  if (type === 'PRECACHE_URLS' && Array.isArray(event.data.urls)) {
    event.waitUntil((async () => {
      const cache = await caches.open(IMAGE_CACHE);
      let done = 0;
      await Promise.allSettled(event.data.urls.map(async (u) => {
        try {
          if (await cache.match(u)) { done++; return; }
          const res = await fetch(u, { mode: 'no-cors' });
          if (res) { await cache.put(u, res.clone()); done++; }
        } catch { /* skip */ }
      }));
      await trimCache(IMAGE_CACHE, MAX_IMAGES);
      event.source?.postMessage({ type: 'PRECACHE_DONE', count: done, total: event.data.urls.length });
    })());
  }
});
