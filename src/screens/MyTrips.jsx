import * as I from '../icons.jsx';
import { Empty } from '../components.jsx';

export default function MyTrips() {
  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 28 }}>
        <span className="wordmark">Offline-first</span>
        <h1 style={{ fontSize: 32 }}>My Trips</h1>
        <p className="sub" style={{ marginTop: 8 }}>Your itinerary, essentials and emergency numbers — must work with no connection (PWA).</p>

        <div className="card" style={{ marginTop: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span className="iconCirc"><I.ICloudOff size={20} /></span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontWeight: 700 }}>Works offline</span>
            <span className="tiny">Itinerary · essentials · emergency numbers are cached for low-signal roaming.</span>
          </span>
          <span className="badge gold">PWA</span>
        </div>

        <div style={{ marginTop: 22 }}>
          <Empty
            icon={<I.IMap size={28} color="var(--gold)" />}
            title="No trips yet — scaffold"
            text="In the full app, trips are built time-aware: around opening hours, heat, rest, meal times and your pace. They’re saved for offline use."
            action={<button className="btn soft sm">Next prompt: create a day plan →</button>}
          />
        </div>

        <div className="section">
          <div className="sectionHead">
            <span className="label gold">Emergency numbers — offline</span>
            <span className="tiny">Always cached</span>
          </div>
          <div className="pad" style={{ padding: 0 }}>
            <div className="card">
              <div className="between" style={{ marginBottom: 12 }}>
                <span className="label">India</span><span className="badge gold">112 unified</span>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { k: 'Unified emergency', v: '112' },
                  { k: 'Police', v: '100' },
                  { k: 'Ambulance', v: '108' },
                  { k: 'Tourist helpline (24×7)', v: '1363' },
                ].map((r) => (
                  <div key={r.k} className="between" style={{ padding: '10px 12px', background: 'var(--card2)', borderRadius: 12 }}>
                    <span style={{ fontWeight: 600 }}>{r.k}</span>
                    <a href={`tel:${r.v}`} className="gold" style={{ fontWeight: 800 }}>{r.v}</a>
                  </div>
                ))}
              </div>
              <p className="tiny" style={{ marginTop: 10 }}>This card is part of the offline shell — available even with no connection.</p>
            </div>
          </div>
        </div>

        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}
