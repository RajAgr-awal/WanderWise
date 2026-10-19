import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const KEY = 'wanderwise.scaffold.v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = (o) => localStorage.setItem(KEY, JSON.stringify(o));

export function AppProvider({ children }) {
  const saved = load();
  const [user, setUser] = useState(saved.user || null); // null = guest (no sign-in required)
  const [nav, setNav] = useState({ tab: 'discover', stack: [] });
  const [toast, setToast] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => { save({ user }); }, [user]);

  useEffect(() => {
    // Fire health check once — shows backend wiring without blocking UI
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    fetch(`${base.replace(/\/$/, '')}/api/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', note: 'backend not running — start with npm run dev:server' }));
  }, []);

  const notify = useCallback((m) => { setToast(m); setTimeout(() => setToast(null), 2200); }, []);
  const push = useCallback((view) => setNav((n) => ({ ...n, stack: [...n.stack, view] })), []);
  const pop = useCallback(() => setNav((n) => ({ ...n, stack: n.stack.slice(0, -1) })), []);
  const reset = useCallback((tab) => setNav({ tab, stack: [] }), []);

  const value = useMemo(() => ({
    user, setUser, nav, push, pop, reset, toast, notify, health,
  }), [user, nav, toast, notify, health, push, pop, reset]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
