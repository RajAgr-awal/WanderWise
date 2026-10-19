import { useEffect, useState } from 'react';
import * as I from './icons.jsx';
import { useApp } from './store.jsx';
import { usePwa } from './lib/pwa.js';
import Discover from './screens/Discover.jsx';
import MyTrips from './screens/MyTrips.jsx';
import Profile from './screens/Profile.jsx';
import PlaceDetail from './screens/PlaceDetail.jsx';
import CityDetail from './screens/CityDetail.jsx';
import DataQuality from './screens/DataQuality.jsx';

const TABS = [
  { id: 'discover', label: 'Discover', icon: I.ICompass },
  { id: 'trips', label: 'My Trips', icon: I.IMap },
  { id: 'profile', label: 'Profile', icon: I.IUser },
];

function StatusBar({ pwa, health }) {
  const { online, updateReady, applyUpdate } = pwa;
  if (!online) {
    return (
      <div className="statusStrip offline">
        <I.IWifiOff size={15} /> Offline — showing your saved itinerary & emergency numbers
      </div>
    );
  }
  if (updateReady) {
    return (
      <button className="statusStrip update" onClick={applyUpdate}>
        <I.IRefresh size={15} /> A new version is ready — tap to update
      </button>
    );
  }
  if (health && health.status !== 'ok') {
    return (
      <div className="statusStrip offline" title={JSON.stringify(health)}>
        <I.IClock size={14} /> Backend: {health.status} — {health.note || 'run npm run dev:server'}
      </div>
    );
  }
  return null;
}

export default function App() {
  const { user, nav, reset, push, pop, toast, health } = useApp();
  const pwa = usePwa();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 700);
    return () => clearTimeout(t);
  }, []);

  const top = nav.stack[nav.stack.length - 1];
  let view;
  if (top?.type === 'place') view = <PlaceDetail placeId={top.placeId} onBack={pop} />;
  else if (top?.type === 'city') view = <CityDetail slug={top.slug} onBack={pop} />;
  else if (top?.type === 'data-quality') view = <DataQuality />;
  else if (nav.tab === 'trips') view = <MyTrips />;
  else if (nav.tab === 'profile') view = <Profile />;
  else view = <Discover />;

  const showTabs = !top || top?.keepTabs;

  if (showSplash) {
    return (
      <div className="shell" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 32 }}>
        <span className="wordmark" style={{ fontSize: 13 }}>WanderWise</span>
        <h1 style={{ fontSize: 34, marginTop: 10 }}>India-first<br /><span className="gold">in-destination</span><br />companion</h1>
        <p className="sub" style={{ marginTop: 12, maxWidth: 300 }}>Given who you are, where you are and what time it is — the most meaningful next choice.</p>
        <div className="spin" style={{ marginTop: 36 }} />
        <p className="tiny" style={{ marginTop: 16 }}>30 cities · 332 places · honest data · offline-first</p>
      </div>
    );
  }

  return (
    <div className="shell">
      <StatusBar pwa={pwa} health={health} />

      {pwa.canInstall && !pwa.installed && showTabs && (
        <div className="installBar fadeIn">
          <span className="iconCirc" style={{ width: 40, height: 40, flex: '0 0 40px' }}>
            <I.IPhoneAdd size={19} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>Install WanderWise</span>
            <span className="tiny" style={{ display: 'block' }}>Works offline — itinerary & emergency numbers</span>
          </span>
          <button className="btn sm" onClick={pwa.install}>Install</button>
          <button aria-label="Dismiss" style={{ color: 'var(--muted2)', padding: 6 }} onClick={() => {}}>
            ✕
          </button>
        </div>
      )}

      {view}

      {showTabs && (
        <nav className="tabbar" aria-label="Primary">
          {TABS.map((t) => (
            <button key={t.id} className={nav.tab === t.id ? 'on' : ''} onClick={() => reset(t.id)}>
              <t.icon size={22} />{t.label}
            </button>
          ))}
          <button onClick={() => push({ type: 'data-quality' })} style={{ position: 'absolute', right: 12, top: -36, background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 20, padding: '6px 10px', color: 'var(--gold)', fontSize: 11, fontWeight: 700 }}>● Data quality</button>
        </nav>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
