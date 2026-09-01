import { useState } from 'react';
import * as I from '../icons.jsx';
import { Segmented } from '../components.jsx';
import { useApp } from '../store.jsx';
import { cityById, generateItinerary, money, CURATED_TOURS } from '../data.js';
import { api } from '../api/wanderwiseApi.js';

export default function TripSetup({ cityId, tourId }) {
  const { pop, replace, saveTrip } = useApp();
  const tour = tourId ? CURATED_TOURS.find((t) => t.id === tourId) : null;
  const cityIds = tour ? tour.cityIds : [cityId];
  const city = cityById(cityIds[0]);
  const [days, setDays] = useState(tour?.durationDays || 5);
  const [tier, setTier] = useState('mid');
  const [busy, setBusy] = useState(false);

  const perDay = Math.round(
    cityIds.reduce((s, id) => s + (cityById(id)?.pricePerDay?.[tier] || 2500), 0) / cityIds.length
  );
  const total = perDay * days;

  const generate = async () => {
    setBusy(true);
    try {
      // Try Cloud Function first
      const payload = {
        durationDays: days,
        budgetTier: tier,
        ...(tour ? { tourId: tour.id } : { cityId: cityIds[0] }),
      };
      const res = await api.generateItinerary(payload);
      if (res?.trip) {
        saveTrip(res.trip);
        replace({ type: 'trip', tripId: res.trip.id });
        return;
      }
    } catch (e) {
      console.warn('[TripSetup] Cloud generateItinerary fallback to local:', e);
    }

    // Fallback to fast local generation
    setTimeout(() => {
      const trip = {
        id: 'trip_' + Date.now(),
        type: tour ? 'curated' : 'single-city',
        title: tour ? tour.name : city.name,
        cityIds, durationDays: days, budgetTier: tier,
        estimatedTotal: total, perDayCost: perDay,
        days: generateItinerary(cityIds, days, tier),
        excluded: [],
        createdAt: Date.now(),
      };
      saveTrip(trip);
      replace({ type: 'trip', tripId: trip.id });
    }, 700);
  };

  if (busy) {
    return (
      <div className="screen noTabs" style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" />
          <p className="sub" style={{ marginTop: 20 }}>Curating your {days}-day plan…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen noTabs fadeIn" style={{ paddingBottom: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
        <div style={{ position: 'relative', height: 470 }}>
          <img src={city.hero} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,0) 40%,rgba(10,10,10,.4))' }} />
          <button className="backBtn" onClick={pop}><I.IBack size={20} /></button>
        </div>

        <div className="pad" style={{ marginTop: -170, position: 'relative' }}>
          <div className="card" style={{ padding: 22, background: '#131313' }}>
            <span className="label gold">{tour ? tour.region : city.country}</span>
            <h1 style={{ fontSize: 40, margin: '4px 0 6px' }}>{tour ? tour.name : city.name}</h1>
            <p className="sub">{tour ? tour.cityIds.map((c) => cityById(c).name).join(' · ') : city.description}</p>

            <div style={{ display: 'flex', gap: 20, borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', margin: '20px 0', padding: '18px 0' }}>
              <div style={{ flex: 1 }}>
                <span className="label">Best time</span>
                <div style={{ marginTop: 4 }}>{city.bestTime}</div>
              </div>
              <div style={{ flex: 1 }}>
                <span className="label">Language</span>
                <div style={{ marginTop: 4 }}>{city.languages.join(', ')}</div>
              </div>
            </div>

            <div className="between" style={{ marginBottom: 12 }}>
              <span className="label gold row" style={{ gap: 8 }}><I.ICal size={16} /> Duration</span>
              <b>{days} day{days > 1 && 's'}</b>
            </div>
            <input type="range" min="1" max="21" value={days} onChange={(e) => setDays(+e.target.value)} />

            <div className="label gold row" style={{ gap: 8, margin: '26px 0 12px' }}>
              <I.IDollar size={16} /> Budget tier
            </div>
            <Segmented value={tier} onChange={setTier} city={city} />

            <div className="card" style={{ marginTop: 22, background: 'rgba(224,194,80,.07)', borderColor: 'var(--gold-dim)' }}>
              <span className="label">Estimated total</span>
              <div className="gold" style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.02em', margin: '4px 0 2px' }}>
                {money(total)}
              </div>
              <span className="tiny">~{money(perDay)} per day</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 22px calc(18px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
        <button className="btn" onClick={generate}>Generate Itinerary</button>
      </div>
    </div>
  );
}
