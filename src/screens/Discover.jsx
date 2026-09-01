import { useEffect, useMemo, useState } from 'react';
import * as I from '../icons.jsx';
import { CityCard } from '../components.jsx';
import { useApp } from '../store.jsx';
import { CITIES, CURATED_TOURS, SEASONAL, cityById, money } from '../data.js';

function Head({ label, meta }) {
  return (
    <div className="sectionHead">
      <span className="label gold">{label}</span>
      {meta && <span className="tiny gold" style={{ fontWeight: 700 }}>{meta}</span>}
    </div>
  );
}

export default function Discover() {
  const { user, push, trips } = useApp();
  const [q, setQ] = useState('');
  const [spot, setSpot] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSpot((s) => (s + 1) % SEASONAL.length), 5000);
    return () => clearInterval(t);
  }, []);

  const india = CITIES.filter((c) => !c.isInternational);
  const intl = CITIES.filter((c) => c.isInternational && !c.isComingSoon);
  const soon = CITIES.filter((c) => c.isComingSoon);

  const results = useMemo(() => {
    if (!q.trim()) return null;
    const s = q.toLowerCase();
    return CITIES.filter((c) => c.name.toLowerCase().includes(s) || c.country.toLowerCase().includes(s));
  }, [q]);

  const open = (city) => push({ type: 'setup', cityId: city.id });
  const sc = SEASONAL[spot];
  const scCity = cityById(sc.cityId);

  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 44 }}>
        <span className="wordmark">Wanderwise</span>
        <h1 style={{ fontSize: 34, marginTop: 8 }}>Hello, {user?.name || 'traveller'}.</h1>
        <p className="sub">Where shall we wander next?</p>
      </div>

      <div className="searchWrap" style={{ marginTop: 22 }}>
        <div className="inputWrap">
          <I.ISearch size={20} color="#7a7a7a" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search destinations..." />
        </div>
      </div>

      {results ? (
        <div className="pad" style={{ marginTop: 22 }}>
          <span className="label">{results.length} result{results.length !== 1 && 's'}</span>
          <div style={{ marginTop: 12 }}>
            {results.map((c) => (
              <button key={c.id} className="listRow" disabled={c.isComingSoon}
                onClick={() => open(c)} style={{ opacity: c.isComingSoon ? 0.5 : 1 }}>
                <img src={c.hero} alt="" width={52} height={52}
                  style={{ borderRadius: 12, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  <div className="tiny">{c.country}</div>
                </div>
                <span className="gold tiny" style={{ fontWeight: 700 }}>
                  {c.isComingSoon ? 'Soon' : `${money(c.pricePerDay.budget)}/day`}
                </span>
              </button>
            ))}
            {!results.length && <p className="sub">No destinations match “{q}”.</p>}
          </div>
        </div>
      ) : (
        <>
          <div className="section">
            <Head label="Explore India Tour" meta={`${india.length} cities`} />
            <div className="hscroll">
              {india.map((c) => <CityCard key={c.id} city={c} onClick={() => open(c)} />)}
            </div>
          </div>

          <div className="section">
            <button className="ctaCard" onClick={() => push({ type: 'builder' })}>
              <span className="iconCirc"><I.ISpark size={24} /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: 17 }}>Design your own tour</span>
                <span className="tiny" style={{ display: 'block', marginTop: 3 }}>
                  Pick your cities, set days, get a live cost &amp; time estimate.
                </span>
              </span>
              <I.IArrow size={22} color="var(--gold)" />
            </button>
          </div>

          <div className="section">
            <Head label="Curated Tours" meta={`${CURATED_TOURS.length} routes`} />
            <div className="hscroll">
              {CURATED_TOURS.map((t) => (
                <div key={t.id} className="tourCard">
                  <img src={t.cover} alt="" loading="lazy" />
                  <div className="scrim" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.15) 35%,rgba(0,0,0,.93))' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18 }}>
                    <span className="label gold">{t.region}</span>
                    <h3 style={{ fontSize: 24, margin: '6px 0 4px' }}>{t.name}</h3>
                    <p className="tiny" style={{ color: '#c9c9c9', marginBottom: 14 }}>
                      {t.cityIds.map((c) => cityById(c)?.name).join(' · ')}
                    </p>
                    <div className="between">
                      <b style={{ fontSize: 14 }}>{t.durationDays} days</b>
                      <button className="btn soft sm" onClick={() => push({ type: 'tour', tourId: t.id })}>
                        Plan tour <I.IArrow size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <Head label="Around the World" meta={`${intl.length} cities`} />
            <div className="hscroll">
              {intl.map((c) => <CityCard key={c.id} city={c} onClick={() => open(c)} />)}
            </div>
          </div>

          <div className="section">
            <Head label="Seasonal spotlight" meta="Updates weekly" />
            <div className="pad">
              <button className="card fadeIn" key={sc.cityId}
                onClick={() => open(scCity)}
                style={{ display: 'flex', gap: 16, alignItems: 'center', width: '100%', textAlign: 'left', padding: 14 }}>
                <img src={scCity.hero} alt="" width={78} height={78}
                  style={{ borderRadius: 14, objectFit: 'cover', flex: '0 0 78px' }} />
                <span style={{ flex: 1 }}>
                  <span className="label gold" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <I.ISun size={13} /> {sc.season}
                  </span>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: 18, margin: '4px 0 3px' }}>{scCity.name}</span>
                  <span className="tiny" style={{ display: 'block' }}>{sc.line}</span>
                </span>
              </button>
              <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 12 }}>
                {SEASONAL.map((_, i) => (
                  <span key={i} style={{
                    width: i === spot ? 18 : 6, height: 6, borderRadius: 3,
                    background: i === spot ? 'var(--gold)' : 'var(--line2)', transition: 'width .3s',
                  }} />
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <Head label="Suggestions (For Future)" meta="Coming soon" />
            <div className="hscroll">
              {soon.map((c) => <CityCard key={c.id} city={c} />)}
            </div>
          </div>

          <div className="section">
            <Head label="Your Trips" meta={trips.length ? `${trips.length} saved` : undefined} />
            {trips.length ? (
              <div className="hscroll">
                {trips.slice(0, 6).map((t) => {
                  const c = cityById(t.cityIds[0]);
                  return (
                    <button key={t.id} className="card" style={{ width: 230, textAlign: 'left' }}
                      onClick={() => push({ type: 'trip', tripId: t.id })}>
                      <img src={c?.hero} alt="" style={{ width: '100%', height: 96, objectFit: 'cover', borderRadius: 10 }} />
                      <div style={{ fontWeight: 700, marginTop: 10 }}>{t.title}</div>
                      <div className="tiny">{t.durationDays} days · {money(t.estimatedTotal)}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="pad sub" style={{ fontSize: 13 }}>
                No trips yet — generate an itinerary and it will show up here.
              </p>
            )}
          </div>
        </>
      )}
      <div style={{ height: 30 }} />
    </div>
  );
}
