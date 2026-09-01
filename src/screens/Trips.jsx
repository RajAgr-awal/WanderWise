import * as I from '../icons.jsx';
import { Empty } from '../components.jsx';
import { useApp } from '../store.jsx';
import { cityById, money, TIER_LABEL } from '../data.js';

export default function Trips() {
  const { trips, push, deleteTrip } = useApp();
  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 44 }}>
        <h1 style={{ fontSize: 34 }}>My Trips</h1>
        <p className="sub" style={{ marginBottom: 24 }}>
          {trips.length ? `${trips.length} itinerar${trips.length === 1 ? 'y' : 'ies'} saved.` : 'Your generated itineraries live here.'}
        </p>

        {!trips.length && (
          <Empty icon={<I.IMap size={30} color="var(--gold)" />} title="No trips yet"
            text="Pick a destination on Discover or design your own multi-city route to get started." />
        )}

        {trips.map((t) => {
          const c = cityById(t.cityIds[0]);
          const d = new Date(t.createdAt);
          return (
            <div key={t.id} className="card" style={{ marginBottom: 14, padding: 0, overflow: 'hidden' }}>
              <button onClick={() => push({ type: 'trip', tripId: t.id })} style={{ width: '100%', textAlign: 'left', display: 'block' }}>
                <div style={{ position: 'relative', height: 150 }}>
                  <img src={c?.hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.85))' }} />
                  <div style={{ position: 'absolute', left: 16, bottom: 12 }}>
                    <span className="label gold">{t.type.replace('-', ' ')}</span>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>{t.title}</div>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div className="tiny">{t.cityIds.map((x) => cityById(x)?.name).join(' · ')}</div>
                  <div className="between" style={{ marginTop: 10 }}>
                    <span className="tiny">{t.durationDays} days · {TIER_LABEL[t.budgetTier]} · saved {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <b className="gold">{money(t.estimatedTotal)}</b>
                  </div>
                </div>
              </button>
              <button onClick={() => deleteTrip(t.id)}
                style={{ width: '100%', padding: '12px 0', borderTop: '1px solid var(--line)', color: 'var(--danger)', fontSize: 13, fontWeight: 600 }}>
                Delete trip
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
