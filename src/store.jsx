import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { authApi, api } from './api/wanderwiseApi.js';
import { readShareToken, decodeTrip, decodeTemplate, clearShareToken } from './lib/share.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const KEY = 'wanderwise.v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };

export function AppProvider({ children }) {
  const saved = load();
  const [user, setUser] = useState(saved.user || undefined);
  const [trips, setTrips] = useState(saved.trips || []);
  const [templates, setTemplates] = useState(saved.templates || []);
  const [chats, setChats] = useState(saved.chats || {});
  const [nav, setNav] = useState({ tab: 'discover', stack: [] });
  const [toast, setToast] = useState(null);

  // Incoming shared trip or template waiting for user confirmation
  const [incoming, setIncoming] = useState(null);
  const [incomingError, setIncomingError] = useState(null);

  // Real Firebase Auth session with fallback to saved local session
  useEffect(() => authApi.watchUser(async (fbUser) => {
    if (fbUser) {
      const profile = { uid: fbUser.uid, name: fbUser.displayName || fbUser.email.split('@')[0], email: fbUser.email };
      setUser(profile);
      try {
        const feed = await api.getMyTrips();
        if (feed?.trips) setTrips(feed.trips);
      } catch (e) {
        console.warn('getMyTrips failed — showing cached trips', e);
      }
    } else {
      const currentSaved = load();
      if (!currentSaved.user) {
        setUser(null);
      }
    }
  }), []);

  // Inspect URL for shared trip or template token on load
  useEffect(() => {
    const token = readShareToken();
    if (!token) return;

    (async () => {
      try {
        const trip = await decodeTrip(token);
        setIncoming({ kind: 'trip', data: trip });
      } catch (e1) {
        try {
          const tpl = await decodeTemplate(token);
          setIncoming({ kind: 'template', data: tpl });
        } catch {
          setIncomingError(e1.message || 'Could not open this share link.');
          clearShareToken();
        }
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ user, trips, templates, chats }));
  }, [user, trips, templates, chats]);

  const notify = useCallback((m) => { setToast(m); setTimeout(() => setToast(null), 2200); }, []);

  const push = useCallback((view) => setNav((n) => ({ ...n, stack: [...n.stack, view] })), []);
  const pop = useCallback(() => setNav((n) => ({ ...n, stack: n.stack.slice(0, -1) })), []);
  const reset = useCallback((tab) => setNav({ tab, stack: [] }), []);
  const replace = useCallback((view) => setNav((n) => ({ ...n, stack: [...n.stack.slice(0, -1), view] })), []);

  const saveTrip = useCallback((trip) => {
    setTrips((t) => {
      const i = t.findIndex((x) => x.id === trip.id);
      if (i >= 0) { const n = [...t]; n[i] = trip; return n; }
      return [trip, ...t];
    });
  }, []);
  const deleteTrip = useCallback((id) => setTrips((t) => t.filter((x) => x.id !== id)), []);

  const acceptIncoming = useCallback(() => {
    if (!incoming) return null;
    clearShareToken();
    if (incoming.kind === 'trip') {
      const t = incoming.data;
      saveTrip(t);
      setIncoming(null);
      return { kind: 'trip', id: t.id };
    }
    if (incoming.kind === 'template') {
      const tpl = incoming.data;
      setTemplates((cur) => [tpl, ...cur.filter((x) => x.id !== tpl.id)]);
      setIncoming(null);
      return { kind: 'template', id: tpl.id };
    }
    return null;
  }, [incoming, saveTrip]);

  const dismissIncoming = useCallback(() => {
    setIncoming(null);
    clearShareToken();
  }, []);

  const value = useMemo(() => ({
    user, setUser, trips, saveTrip, deleteTrip, setTrips,
    templates, setTemplates, chats, setChats,
    nav, push, pop, reset, replace, toast, notify,
    incoming, incomingError, acceptIncoming, dismissIncoming,
  }), [
    user, trips, templates, chats, nav, push, pop, reset, replace, toast, notify,
    saveTrip, deleteTrip, incoming, incomingError, acceptIncoming, dismissIncoming,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
