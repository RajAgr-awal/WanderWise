/**
 * PWA glue: service-worker registration, install prompt, online/offline state
 * and cache controls. Kept framework-agnostic; consumed via usePwa().
 */

import { useEffect, useState, useCallback } from 'react';

let deferredPrompt = null;
const installListeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();               // suppress the mini-infobar; we show our own CTA
    deferredPrompt = e;
    installListeners.forEach((fn) => fn(true));
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installListeners.forEach((fn) => fn(false));
  });
}

export function registerServiceWorker({ onUpdate } = {}) {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  // The SW must sit at the app's scope root; import.meta.env.BASE_URL handles
  // sub-path deploys such as GitHub Pages.
  const base = import.meta.env.BASE_URL || '/';
  return navigator.serviceWorker.register(`${base}sw.js`, { scope: base })
    .then((reg) => {
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          // A new worker is waiting only if one was already controlling the page.
          if (sw.state === 'installed' && navigator.serviceWorker.controller) onUpdate?.(reg);
        });
      });
      return reg;
    })
    .catch((err) => { console.warn('SW registration failed', err); return null; });
}

/** Ask the SW to cache a list of image URLs before the user loses signal. */
export function precacheImages(urls) {
  return new Promise((resolve) => {
    const sw = navigator.serviceWorker?.controller;
    if (!sw || !urls?.length) return resolve({ count: 0, total: urls?.length || 0 });
    const onMsg = (e) => {
      if (e.data?.type === 'PRECACHE_DONE') {
        navigator.serviceWorker.removeEventListener('message', onMsg);
        resolve(e.data);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMsg);
    sw.postMessage({ type: 'PRECACHE_URLS', urls: [...new Set(urls)].filter(Boolean) });
    setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', onMsg);
      resolve({ count: 0, total: urls.length, timedOut: true });
    }, 30000);
  });
}

export function getCacheStatus() {
  return new Promise((resolve) => {
    const sw = navigator.serviceWorker?.controller;
    if (!sw) return resolve(null);
    const onMsg = (e) => {
      if (e.data?.type === 'CACHE_STATUS') {
        navigator.serviceWorker.removeEventListener('message', onMsg);
        resolve(e.data);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMsg);
    sw.postMessage({ type: 'CACHE_STATUS' });
    setTimeout(() => resolve(null), 3000);
  });
}

export function clearImageCache() {
  return new Promise((resolve) => {
    const sw = navigator.serviceWorker?.controller;
    if (!sw) return resolve(false);
    const onMsg = (e) => {
      if (e.data?.type === 'IMAGE_CACHE_CLEARED') {
        navigator.serviceWorker.removeEventListener('message', onMsg);
        resolve(true);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMsg);
    sw.postMessage({ type: 'CLEAR_IMAGE_CACHE' });
    setTimeout(() => resolve(false), 3000);
  });
}

export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

/** React hook exposing everything the UI needs. */
export function usePwa() {
  const [online, setOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(Boolean(deferredPrompt));
  const [updateReady, setUpdateReady] = useState(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);

    const listener = (v) => setCanInstall(v);
    installListeners.add(listener);

    registerServiceWorker({ onUpdate: (reg) => setUpdateReady(reg) });

    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      installListeners.delete(listener);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return 'unavailable';
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setCanInstall(false);
    if (outcome === 'accepted') setInstalled(true);
    return outcome;
  }, []);

  const applyUpdate = useCallback(() => {
    if (!updateReady?.waiting) return;
    updateReady.waiting.postMessage({ type: 'SKIP_WAITING' });
    // Reload once the new worker takes control.
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
  }, [updateReady]);

  return { online, canInstall, install, installed, updateReady: Boolean(updateReady), applyUpdate };
}
