import { useState } from 'react';
import * as I from '../icons.jsx';
import { useApp } from '../store.jsx';

export default function Profile() {
  const { user, setUser, notify, health } = useApp();
  const [name, setName] = useState(user?.displayName || '');

  const isGuest = !user || user.uid?.startsWith('guest_') || user.guest === true;

  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 28 }}>
        <span className="wordmark">WanderWise</span>
        <h1 style={{ fontSize: 32 }}>Profile</h1>
        <p className="sub" style={{ marginTop: 6 }}>Guests can use the app without signing in; sign-in adds cross-device sync.</p>

        <div className="card" style={{ marginTop: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
          <span className="iconCirc" style={{ width: 56, height: 56, flex: '0 0 56px' }}><I.IUser size={24} /></span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontWeight: 800, fontSize: 18 }}>{user?.displayName || user?.name || 'Guest traveller'}</span>
            <span className="tiny" style={{ display: 'block' }}>{user?.email || 'Guest mode — no sign-in required'}</span>
            <span className="badge muted" style={{ marginTop: 8 }}>{isGuest ? 'Guest — local only' : 'Signed in — sync enabled'}</span>
          </span>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <span className="label gold">How sign-in works</span>
          <p className="sub" style={{ marginTop: 8, color: '#c9c9c9' }}>
            You can explore places, build a day plan and view essentials entirely offline as a guest.
            Signing in only adds cross-device sync and backup — it never locks features behind a login.
          </p>
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            {!isGuest ? (
              <button className="btn ghost" onClick={() => { setUser(null); notify('Signed out — you’re now a guest'); }}>
                <I.ILogout size={18} /> Sign out
              </button>
            ) : (
              <>
                <div className="inputWrap">
                  <I.IUser size={18} color="#6e6e6e" />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (guest)" />
                </div>
                <button className="btn" onClick={() => {
                  const n = name.trim() || 'Traveller';
                  setUser({ uid: `guest_${Date.now()}`, displayName: n, name: n, guest: true });
                  notify(`Welcome, ${n} — guest mode`);
                }}>
                  Continue as guest
                </button>
                <button className="btn ghost" onClick={() => notify('Auth sync — coming next prompt (Firebase / REST)')}>
                  Sign in to sync across devices
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <span className="label">Preferences (time-aware)</span>
          <div className="card" style={{ marginTop: 10 }}>
            <div className="between"><span style={{ fontWeight: 600 }}>Pace</span><span className="badge gold">balanced</span></div>
            <p className="tiny" style={{ marginTop: 8 }}>Relaxed · balanced · intense — controls duration, rest stops and meal timing in day plans. Scaffold default: balanced.</p>
            <div className="between" style={{ marginTop: 12 }}><span className="tiny">Language</span><span className="tiny">English · Hindi (next)</span></div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <span className="label">Health</span>
          <p className="tiny" style={{ marginTop: 8, wordBreak: 'break-all' }}>
            API: {health ? `${health.status} · ${health.version || 'scaffold'} · ${health.time || ''}` : 'checking…'}
          </p>
          {health?.dataStatus && <p className="tiny" style={{ marginTop: 6 }}>{health.dataStatus}</p>}
          <div className="row" style={{ marginTop: 12, gap: 10 }}>
            <a href="/api/health" target="_blank" rel="noreferrer" className="btn soft sm">Open /api/health ↗</a>
            <span className="tiny">Env-driven, no secrets</span>
          </div>
        </div>

        <p className="tiny" style={{ textAlign: 'center', marginTop: 28 }}>WanderWise scaffold v0.1.0 · depth · honest data · partners</p>
      </div>
    </div>
  );
}
