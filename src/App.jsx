import { useEffect, useState } from 'react';
import * as I from './icons.jsx';
import { useApp } from './store.jsx';
import { usePwa } from './lib/pwa.js';
import Landing from './screens/Landing.jsx';
import Auth from './screens/Auth.jsx';
import Discover from './screens/Discover.jsx';
import Trips from './screens/Trips.jsx';
import Profile from './screens/Profile.jsx';
import TripSetup from './screens/TripSetup.jsx';
import TripDetail from './screens/TripDetail.jsx';
import Builder from './screens/Builder.jsx';
import Chat from './screens/Chat.jsx';
import { SharedTripBanner } from './screens/ShareExport.jsx';

const TABS = [
  { id: 'discover', label: 'Discover', icon: I.ICompass },
  { id: 'trips', label: 'My Trips', icon: I.IMap },
  { id: 'profile', label: 'Profile', icon: I.IUser },
];

/** Slim status strip: offline warning, update prompt, install CTA. */
function StatusBar({ pwa }) {
  const { online, updateReady, applyUpdate } = pwa;
  if (!online) {
    return (
      <div className="statusStrip offline">
        <I.IWifiOff size={15} /> Offline — showing your saved trips
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
  return null;
}

export default function App() {
  const {
    user, nav, reset, toast, incoming, incomingError,
    acceptIncoming, dismissIncoming, push, pop, notify, setUser,
  } = useApp();
  const pwa = usePwa();
  const [authView, setAuthView] = useState(false);
  const [dismissedInstall, setDismissedInstall] = useState(
    () => localStorage.getItem('ww.installDismissed') === '1'
  );

  // Surface an unreadable share link once, then clear it.
  useEffect(() => {
    if (incomingError) notify(incomingError);
  }, [incomingError, notify]);

  if (user === undefined) return <div className="shell" />; // auth state resolving
  if (!user) {
    return (
      <div className="shell">
        {authView ? (
          <div>
            <div className="pad" style={{ paddingTop: 20 }}>
              <button className="row" style={{ gap: 6, color: 'var(--gold)', fontWeight: 700 }} onClick={() => setAuthView(false)}>
                <I.IBack size={18} /> Back to Overview
              </button>
            </div>
            <Auth />
          </div>
        ) : (
          <Landing
            onStart={() => setUser({ uid: 'guest_' + Date.now(), name: 'Traveler', email: 'guest@wanderwise.app' })}
            onAuth={() => setAuthView(true)}
            onGuest={() => setUser({ uid: 'guest_' + Date.now(), name: 'Traveler', email: 'guest@wanderwise.app' })}
          />
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  const top = nav.stack[nav.stack.length - 1];
  let view;
  if (top?.type === 'about') view = (
    <div>
      <div className="pad" style={{ paddingTop: 20 }}>
        <button className="row" style={{ gap: 6, color: 'var(--gold)', fontWeight: 700 }} onClick={pop}>
          <I.IBack size={18} /> Back
        </button>
      </div>
      <Landing onStart={pop} onAuth={pop} onGuest={pop} />
    </div>
  );
  else if (top?.type === 'setup') view = <TripSetup cityId={top.cityId} />;
  else if (top?.type === 'tour') view = <TripSetup tourId={top.tourId} />;
  else if (top?.type === 'trip') view = <TripDetail tripId={top.tripId} />;
  else if (top?.type === 'builder') view = <Builder preset={top.preset} />;
  else if (top?.type === 'chat') view = <Chat cityId={top.cityId} tripId={top.tripId} />;
  else if (nav.tab === 'trips') view = <Trips />;
  else if (nav.tab === 'profile') view = <Profile />;
  else view = <Discover />;

  const showTabs = !top;
  const showInstall = pwa.canInstall && !pwa.installed && !dismissedInstall && showTabs;

  const acceptShared = () => {
    const res = acceptIncoming();
    if (res?.kind === 'trip') {
      reset('trips');
      push({ type: 'trip', tripId: res.id });
      notify('Trip saved to My Trips');
    } else if (res?.kind === 'template') {
      notify('Template saved to your profile');
    }
  };

  return (
    <div className="shell">
      <StatusBar pwa={pwa} />

      {/* A shared trip waiting to be accepted floats above the current tab. */}
      {incoming && showTabs && (
        <div style={{ paddingTop: 16 }}>
          <SharedTripBanner
            trip={incoming.kind === 'trip' ? incoming.data : {
              title: incoming.data.name,
              durationDays: incoming.data.legs.reduce((s, l) => s + l.days, 0),
              estimatedTotal: 0,
              sharedBy: incoming.data.sharedBy,
            }}
            onSave={acceptShared}
            onDismiss={dismissIncoming}
          />
        </div>
      )}

      {view}

      {showInstall && (
        <div className="installBar fadeIn">
          <span className="iconCirc" style={{ width: 40, height: 40, flex: '0 0 40px' }}>
            <I.IPhoneAdd size={19} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>Install WanderWise</span>
            <span className="tiny" style={{ display: 'block' }}>Works offline while you travel</span>
          </span>
          <button className="btn sm" style={{ width: 'auto' }} onClick={pwa.install}>Install</button>
          <button aria-label="Dismiss" style={{ color: 'var(--muted2)', padding: 6 }}
            onClick={() => { setDismissedInstall(true); localStorage.setItem('ww.installDismissed', '1'); }}>
            ✕
          </button>
        </div>
      )}

      {showTabs && (
        <nav className="tabbar">
          {TABS.map((t) => (
            <button key={t.id} className={nav.tab === t.id ? 'on' : ''} onClick={() => reset(t.id)}>
              <t.icon size={22} />{t.label}
            </button>
          ))}
        </nav>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
