import { useMemo, useState } from 'react';
import * as I from '../icons.jsx';
import { Rating } from '../components.jsx';
import { useApp } from '../store.jsx';
import ShareExport from './ShareExport.jsx';
import {
  cityById, money, RESTAURANTS, STAYS, TRANSPORT, MARKETS, FOOD_SPECIALTIES, TIER_LABEL, buildHotelLinks,
} from '../data.js';

const TABS = [
  { id: 'itinerary', label: 'Itinerary', icon: I.IList },
  { id: 'culture', label: 'Culture', icon: I.IBank },
  { id: 'food', label: 'Food', icon: I.IFood },
  { id: 'stay', label: 'Stay', icon: I.IBed },
  { id: 'transport', label: 'Transport', icon: I.ITrain },
  { id: 'markets', label: 'Markets', icon: I.IBag },
  { id: 'map', label: 'Map', icon: I.IPin },
];

export default function TripDetail({ tripId }) {
  const { trips, saveTrip, pop, push } = useApp();
  const trip = trips.find((t) => t.id === tripId);
  const [tab, setTab] = useState('itinerary');
  const [cityFocus, setCityFocus] = useState(0);
  const [sharing, setSharing] = useState(false);

  const toggle = (id) => {
    if (!trip) return;
    const excl = trip.excluded || [];
    const next = excl.includes(id) ? excl.filter((x) => x !== id) : [...excl, id];
    saveTrip({ ...trip, excluded: next });
  };

  const activeTotal = useMemo(() => {
    if (!trip) return 0;
    const excl = trip.excluded || [];
    let sum = 0;
    trip.days.forEach((d) => d.items.forEach((it) => { if (!excl.includes(it.id)) sum += it.price || 0; }));
    return sum;
  }, [trip]);

  const excluded = trip?.excluded || [];

  if (!trip) return <div className="empty">Trip not found.</div>;
  const city = cityById(trip.cityIds[Math.min(cityFocus, trip.cityIds.length - 1)]);

  return (
    <div className="screen noTabs fadeIn">
      <div style={{ position: 'relative', height: 300 }}>
        <img src={city.hero} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,.1) 45%,var(--bg))' }} />
        <button className="backBtn" onClick={pop}><I.IBack size={20} /></button>
        <button className="backBtn" style={{ left: 'auto', right: 20 }} onClick={() => setSharing(true)}>
          <I.IShare size={20} />
        </button>
        <div style={{ position: 'absolute', left: 22, right: 22, bottom: 14 }}>
          <span className="label gold">{city.country}</span>
          <h1 style={{ fontSize: 40, margin: '2px 0 4px' }}>{trip.title}</h1>
          <p className="sub">
            {trip.durationDays} days · {money(trip.estimatedTotal)} · {TIER_LABEL[trip.budgetTier].toLowerCase()}
          </p>
        </div>
      </div>

      <div className="chips" style={{ marginTop: 4 }}>
        {TABS.map((t) => (
          <button key={t.id} className={'chip' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}>
            <t.icon size={16} />{t.label}
          </button>
        ))}
      </div>

      {trip.cityIds.length > 1 && tab !== 'itinerary' && (
        <div className="chips" style={{ marginTop: 12 }}>
          {trip.cityIds.map((id, i) => (
            <button key={id} className={'chip' + (cityFocus === i ? ' on' : '')} onClick={() => setCityFocus(i)}>
              {cityById(id).name}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        {tab === 'itinerary' && <Itinerary trip={trip} excluded={excluded} toggle={toggle} activeTotal={activeTotal} />}
        {tab === 'culture' && <Culture city={city} />}
        {tab === 'food' && <Food city={city} />}
        {tab === 'stay' && <Stay city={city} tier={trip.budgetTier} />}
        {tab === 'transport' && <Transport city={city} />}
        {tab === 'markets' && <Markets city={city} />}
        {tab === 'map' && <MapTab trip={trip} city={city} excluded={excluded} />}
      </div>

      <div style={{ height: 110 }} />
      <button className="fab" style={{ bottom: 28 }}
        onClick={() => push({ type: 'chat', cityId: city.id, tripId: trip.id })}>
        <I.ISpark size={26} />
      </button>
      {sharing && <ShareExport trip={trip} onClose={() => setSharing(false)} />}
    </div>
  );
}

function Itinerary({ trip, excluded, toggle, activeTotal }) {
  return (
    <>
      <div className="pad">
        <div className="card between" style={{ background: 'rgba(224,194,80,.07)', borderColor: 'var(--gold-dim)' }}>
          <span>
            <span className="label">Selected items</span>
            <div className="gold" style={{ fontSize: 22, fontWeight: 800 }}>{money(activeTotal)}</div>
          </span>
          <span className="tiny" style={{ textAlign: 'right', maxWidth: 150 }}>
            Activity &amp; food spend for the items you've ticked.
          </span>
        </div>
      </div>
      {trip.days.map((d) => (
        <div key={d.day}>
          <div className="dayHead">
            <span className="dayNum">{d.day}</span>
            <h2 style={{ margin: 0 }}>Day {d.day}</h2>
            {trip.cityIds.length > 1 && <span className="tiny" style={{ marginLeft: 'auto' }}>{cityById(d.cityId).name}</span>}
          </div>
          {d.items.map((it) => {
            const off = excluded.includes(it.id);
            return (
              <div className="slotRow" key={it.id}>
                <button className={'check' + (off ? '' : ' on')} onClick={() => toggle(it.id)}>
                  {!off && <I.ICheck size={16} />}
                </button>
                <div className={'slotCard' + (off ? ' off' : '')}>
                  <div className="between">
                    <span className="label gold">{it.slot}</span>
                    <Rating value={it.rating} />
                  </div>
                  <div className="name">{it.name}</div>
                  <div className="tiny" style={{ marginBottom: 6 }}>{it.tag}</div>
                  <p className="sub" style={{ fontSize: 14 }}>{it.description}</p>
                  {it.mustTry && <p style={{ fontSize: 14, margin: '8px 0 0' }}>Must try: {it.mustTry}</p>}
                  <div className="gold" style={{ fontWeight: 700, marginTop: 10 }}>{it.priceLabel}</div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

function Culture({ city }) {
  return (
    <div className="pad">
      <div className="card">
        <span className="label gold">Origin &amp; history</span>
        <p style={{ color: '#cfcfcf', marginTop: 10, marginBottom: 0 }}>{city.culture || 'Culture notes coming soon for this city.'}</p>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <span className="label gold">Languages</span>
        <p style={{ marginTop: 8, marginBottom: 0 }}>{city.languages.join(' · ')}</p>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <span className="label gold">Best time to visit</span>
        <p style={{ marginTop: 8, marginBottom: 0 }}>{city.bestTime}</p>
      </div>
    </div>
  );
}

function Food({ city }) {
  const specials = FOOD_SPECIALTIES[city.id] || [];
  const rests = RESTAURANTS.filter((r) => r.cityId === city.id);
  return (
    <div className="pad">
      {!!specials.length && (
        <>
          <span className="label gold">Local delicacies</span>
          <div style={{ marginTop: 12, marginBottom: 24 }}>
            {specials.map((s) => (
              <div className="card" key={s.dish} style={{ marginBottom: 10 }}>
                <h3>{s.dish}</h3>
                <p className="sub" style={{ fontSize: 14, margin: '4px 0 8px' }}>{s.note}</p>
                <span className="gold tiny" style={{ fontWeight: 700 }}>Best at {s.where}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <span className="label gold">Where to eat</span>
      <div style={{ marginTop: 12 }}>
        {rests.map((r) => (
          <div className="card" key={r.name} style={{ marginBottom: 12 }}>
            <span className="label gold">{r.area}</span>
            <h3 style={{ fontSize: 21, margin: '5px 0 4px' }}>{r.name}</h3>
            <p className="sub" style={{ fontSize: 14 }}>{r.description}</p>
            <div className="between" style={{ marginTop: 10 }}>
              <span style={{ fontSize: 14 }}>Must try: {r.mustTry}</span>
              <b className="gold">₹{r.priceForTwo} for two</b>
            </div>
          </div>
        ))}
        {!rests.length && <p className="sub">Restaurant picks coming soon for {city.name}.</p>}
      </div>
    </div>
  );
}

function Stay({ city, tier }) {
  const stays = STAYS.filter((s) => s.cityId === city.id);
  const order = { budget: 0, mid: 1, luxury: 2 };
  const sorted = [...stays].sort((a, b) =>
    Math.abs(order[a.tier] - order[tier]) - Math.abs(order[b.tier] - order[tier]));
  return (
    <div className="pad">
      {sorted.map((s) => {
        const links = buildHotelLinks(s.name, city.name);
        return (
          <div className="card" key={s.name} style={{ marginBottom: 12, borderColor: s.tier === tier ? 'var(--gold-dim)' : 'var(--line)' }}>
            <div className="between">
              <span className="label gold">{s.tier} · {s.type}</span>
              <div className="gold" style={{ fontWeight: 700 }}>{money(s.pricePerNight)}/night</div>
            </div>
            <h3 style={{ fontSize: 22, margin: '6px 0 3px' }}>{s.name}</h3>
            <p className="sub" style={{ fontSize: 14 }}>{s.area}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: 999,
                    background: 'var(--card2)',
                    border: '1px solid var(--line2)',
                    color: 'var(--text)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    textDecoration: 'none',
                  }}
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        );
      })}
      {!sorted.length && <p className="sub">Stay options coming soon for {city.name}.</p>}
    </div>
  );
}

function Transport({ city }) {
  const opts = TRANSPORT.filter((t) => t.cityId === city.id);
  return (
    <div className="pad">
      {opts.map((t) => (
        <div className="card" key={t.mode} style={{ marginBottom: 12 }}>
          <div className="between">
            <h3>{t.mode}</h3>
            <span className="gold" style={{ fontWeight: 700, fontSize: 14 }}>{t.costRange}</span>
          </div>
          <div className="row tiny" style={{ gap: 6, marginTop: 6 }}><I.IClock size={13} /> {t.timeEstimate}</div>
          <p className="sub" style={{ fontSize: 14, marginTop: 8 }}>{t.note}</p>
        </div>
      ))}
      {!opts.length && <p className="sub">Transport guidance coming soon for {city.name}.</p>}
    </div>
  );
}

function Markets({ city }) {
  const ms = MARKETS.filter((m) => m.cityId === city.id);
  return (
    <div className="pad">
      {ms.map((m) => (
        <div className="card" key={m.name} style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 22 }}>{m.name}</h3>
          <span className="label gold" style={{ display: 'block', margin: '6px 0' }}>{m.specialty}</span>
          <p className="sub" style={{ fontSize: 14 }}>Best for {m.bestFor}</p>
          {m.haggle && <p style={{ color: '#d9a441', fontSize: 14, margin: '8px 0 0' }}>Haggling expected</p>}
        </div>
      ))}
      {!ms.length && <p className="sub">Market picks coming soon for {city.name}.</p>}
    </div>
  );
}

// Schematic map: deterministic pseudo-positions so stops are laid out consistently.
function MapTab({ trip, city, excluded }) {
  const stops = [];
  trip.days.forEach((d) => {
    if (d.cityId !== city.id) return;
    d.items.forEach((it) => {
      if (excluded.includes(it.id)) return;
      if (!stops.find((s) => s.name === it.name)) stops.push({ ...it, day: d.day });
    });
  });
  const pos = (name, i) => {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 10000;
    return { x: 12 + ((h % 76)), y: 12 + (((h * 7) % 72)) };
  };
  const pts = stops.map((s, i) => ({ ...s, ...pos(s.name, i) }));

  return (
    <>
      <div className="mapWrap" style={{ position: 'relative', height: 340 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="g" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0H0V10" fill="none" stroke="#1b2029" strokeWidth=".4" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#g)" />
          <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke="var(--gold)" strokeWidth=".6" strokeDasharray="2 1.6" opacity=".7" />
        </svg>
        {pts.map((p, i) => (
          <div className="pin" key={p.id} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <span className="pinDot">{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="pad" style={{ marginTop: 18 }}>
        <span className="label gold">Suggested visiting order</span>
        <div style={{ marginTop: 12 }}>
          {pts.map((p, i) => (
            <div className="listRow" key={p.id}>
              <span className="pinDot" style={{ flex: '0 0 26px' }}>{i + 1}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 700 }}>{p.name}</span>
                <span className="tiny">Day {p.day} · {p.slot} · best {p.slot === 'Morning' ? 'before 10am' : p.slot === 'Evening' ? 'at golden hour' : 'mid-afternoon'}</span>
              </span>
              <span className="tiny gold">{i === 0 ? 'start' : `~${(1.2 + i * 0.8).toFixed(1)} km`}</span>
            </div>
          ))}
          {!pts.length && <p className="sub">Tick some itinerary items to see them pinned here.</p>}
        </div>
      </div>
    </>
  );
}
