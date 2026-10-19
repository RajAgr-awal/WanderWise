import { useEffect, useState, useCallback } from 'react';

/**
 * PWA helpers — offline-first scaffold.
 * Itinerary, essentials and emergency numbers must work offline.
 */
export function usePwa() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferred, setDeferred] = useState(null);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const a = () => setOnline(true);
    const b = () => setOnline(false);
    window.addEventListener('online', a);
    window.addEventListener('offline', b);
    return () => { window.removeEventListener('online', a); window.removeEventListener('offline', b); };
  }, []);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferred(e); setCanInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'UPDATE_READY') setUpdateReady(true);
    });
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferred(null);
    setCanInstall(false);
  }, [deferred]);

  const applyUpdate = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((r) => r?.waiting?.postMessage({ type: 'SKIP_WAITING' }));
      window.location.reload();
    }
  }, []);

  return { online, installed, canInstall, install, updateReady, applyUpdate };
}

export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
}
