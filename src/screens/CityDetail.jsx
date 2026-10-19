import { useEffect, useState } from 'react';
import * as I from '../icons.jsx';
import { useApp } from '../store.jsx';
import { ProvenanceBadge, MonthStrip } from '../components.jsx';
import { api } from '../lib/api.js';

export default function CityDetail({ slug, onBack }) {
  const { push } = useApp();
  const [city, setCity] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getCity(slug),
      api.getCityPlaces(slug)
    ]).then(([c, p]) => {
      setCity(c.data);
      setPlaces(p.data);
      setLoading(false);
    }).catch(e => {
      setErr(e.message);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="screen pad" style={{ paddingTop: 40 }}><div className="spin" /> <p className="tiny" style={{ marginTop: 12 }}>Loading {slug}…</p></div>;
  if (err) return <div className="screen pad" style={{ paddingTop: 40 }}><button onClick={onBack} className="row" style={{ color: 'var(--gold)', fontWeight: 700 }}><I.IBack size={18}/> Back</button><p style={{ marginTop: 20, color: '#ff8a8a' }}>{err}</p></div>;
  if (!city) return <div className="screen pad">Not found</div>;

  const hasHero = !!city.hero_image_url;
  const topPlaces = places.filter(p => p.kind === 'place');
  const grouped = {};
  for (const p of topPlaces) {
    const cat = p.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }
  const neighbourhoods = city.stay_areas;
  const markets = city.markets;
  const dishes = city.dishes;
  const transport = city.transport_options;
  const nearby = city.nearby_destinations;

  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 16 }}>
        <button onClick={onBack} className="row" style={{ color: 'var(--gold)', fontWeight: 700 }}><I.IBack size={18}/> Back · {city.region}</button>
      </div>

      {/* Hero */}
      <div style={{ marginTop: 16, height: 220, background: hasHero ? `url(${city.hero_image_url}) center/cover` : 'linear-gradient(135deg,#1a1a1a,#2a2310)', display: 'grid', placeItems: 'center', position: 'relative' }}>
        {!hasHero && <span className="tiny" style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>Hero image — null until curator uploads<br/><span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 22, display: 'block', marginTop: 8 }}>{city.name}</span><span className="tiny">{city.city_type}</span></span>}
        {hasHero && <span className="badge gold" style={{ position: 'absolute', bottom: 12, left: 12 }}>{city.name}</span>}
      </div>

      <div className="pad" style={{ marginTop: 16 }}>
        <span className="kicker">{city.state_ut} · {city.city_type}</span>
        <h1 style={{ fontSize: 32, marginTop: 4 }}>{city.name}</h1>
        <p className="sub" style={{ marginTop: 8 }}>{city.core_identity}</p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge gold">{city.editorial_group} #{city.rank_in_group}</span>
          <span className="badge muted">{city.region}</span>
          {(city.weather_risks||[]).map(w => <span key={w} className="badge" style={{ background: '#2a1a1a', color: '#ff8a8a', border: '1px solid #3a2a2a', fontSize: 11 }}>⚠ {w}</span>)}
          {city.permit_note && <span className="badge" style={{ background: '#1a2a3a', color: '#8ac8ff', border: '1px solid #2a3a4a', fontSize: 11 }}>Permit: {city.permit_note}</span>}
        </div>
        <div style={{ marginTop: 12 }}>
          <ProvenanceBadge city={city} />
          {!city.verified && <span className="tiny" style={{ marginLeft: 8, color: 'var(--muted)' }}>· low confidence · {city.source_label} · never verified</span>}
        </div>

        {/* 12-month strip */}
        <div className="card" style={{ marginTop: 20 }}>
          <MonthStrip best_months={city.best_months} best_text={city.best_season_text} />
        </div>

        {/* Rhythm */}
        <div className="card" style={{ marginTop: 12 }}>
          <div className="label gold" style={{ marginBottom: 10 }}>Local rhythm — time-aware</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><span className="label">Morning</span><div style={{ fontWeight: 700, fontSize: 13 }}>{city.rhythm?.morning || '—'}</div></div>
            <div><span className="label">Afternoon</span><div style={{ fontWeight: 700, fontSize: 13 }}>{city.rhythm?.afternoon || '—'}</div></div>
            <div><span className="label">Evening</span><div style={{ fontWeight: 700, fontSize: 13 }}>{city.rhythm?.evening || '—'}</div></div>
            <div><span className="label">Night</span><div style={{ fontWeight: 700, fontSize: 13 }}>{city.rhythm?.night || '—'}</div></div>
          </div>
          <div className="tiny" style={{ marginTop: 10, color: 'var(--muted)' }}>Pace: balanced — plans shift with heat · opening days · rest · meal times. Offline-first essentials cached.</div>
        </div>

        {/* Top places */}
        <div className="section" style={{ marginTop: 22 }}>
          <div className="sectionHead">
            <span className="label gold">Top places · {topPlaces.length} · kind=place grouped by category</span>
            <span className="tiny gold">{places.filter(p=>p.needs_review).length} needs review</span>
          </div>
          {Object.keys(grouped).length === 0 && <p className="tiny" style={{ color: 'var(--muted)', marginTop: 8 }}>No places yet — data confidence low, awaiting curation.</p>}
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat} style={{ marginTop: 16 }}>
              <div className="label" style={{ marginBottom: 8 }}>{cat} · {list.length}</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {list.map(p => (
                  <div key={p.id} className="card" style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="iconCirc" style={{ width: 40, height: 40, flex: '0 0 40px' }}><I.IMap size={18}/></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                      <span className="tiny" style={{ color: 'var(--muted)' }}>{p.category} · {p.kind} {p.needs_review && <span style={{ color: '#ff8a8a' }}>· needs review: {p.review_reason}</span>}</span>
                    </span>
                    <button className="btn sm" onClick={() => push({ type: 'place', placeId: p.id })}>Open</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Needs review list */}
          {places.filter(p=>p.needs_review).length > 0 && (
            <div className="card" style={{ marginTop: 16, borderStyle: 'dashed', background: '#1a1a0a' }}>
              <div className="label" style={{ color: '#ff8a8a' }}>Needs curator review</div>
              <ul className="tiny" style={{ marginTop: 8, paddingLeft: 16, color: '#c9c9c9' }}>
                {places.filter(p=>p.needs_review).map(p => <li key={p.id}><strong>{p.name}</strong> ({p.kind}): {p.review_reason}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Neighbourhoods */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="label gold">Neighbourhoods — where to stay</div>
          {neighbourhoods ? (
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              <div><span className="label">Budget</span><div className="tiny" style={{ color: 'var(--text)', marginTop: 4 }}>{neighbourhoods.budget_text} → areas: {(neighbourhoods.areas_budget||neighbourhoods.areas||[]).join(' · ') || '—'}</div></div>
              <div><span className="label">Mid</span><div className="tiny" style={{ color: 'var(--text)', marginTop: 4 }}>{neighbourhoods.mid_text} → {(neighbourhoods.areas_mid||[]).join(' · ') || '—'}</div></div>
              <div><span className="label">Premium</span><div className="tiny" style={{ color: 'var(--text)', marginTop: 4 }}>{neighbourhoods.premium_text} → {(neighbourhoods.areas_premium||[]).join(' · ') || '—'}</div></div>
              <div className="tiny" style={{ marginTop: 6, color: 'var(--muted)' }}>All areas parsed from editorial where_to_stay sentences. Honest — no invented prices.</div>
            </div>
          ) : <span className="nullVal">Not yet known</span>}
        </div>

        {/* Food */}
        <div className="card" style={{ marginTop: 12 }}>
          <div className="label">Food anchors</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(dishes||[]).map(d => <span key={d.id} className="badge" style={{ background: '#1a2a1a', border: '1px solid #2a3a2a', color: '#9ad09a' }}>{d.name}</span>)}
          </div>
          {(!dishes || dishes.length===0) && <span className="nullVal">Not yet known</span>}
        </div>

        {/* Markets */}
        <div className="card" style={{ marginTop: 12 }}>
          <div className="label">Markets — kind=market (if in both main_pois & markets → single market)</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(markets||[]).map(m => <span key={m.id} className="badge muted">{m.name}</span>)}
          </div>
        </div>

        {/* Transport */}
        <div className="card" style={{ marginTop: 12 }}>
          <div className="label">Getting there & around</div>
          <div style={{ marginTop: 8 }}>
            <div className="tiny"><strong>Airport:</strong> {city.airport || <span className="nullVal">Not yet known</span>}</div>
            <div className="tiny"><strong>Rail:</strong> {city.rail || <span className="nullVal">Not yet known</span>}</div>
            <div className="tiny"><strong>Metro:</strong> {city.metro || <span className="nullVal">Not yet known</span>}</div>
            <div className="tiny"><strong>City:</strong> {city.city_transport || <span className="nullVal">Not yet known</span>}</div>
            <div className="tiny"><strong>Nearby:</strong> {city.nearby_transport || <span className="nullVal">Not yet known</span>}</div>
          </div>
          <details style={{ marginTop: 10 }}>
            <summary className="tiny gold" style={{ cursor: 'pointer' }}>Master transport list — {transport.length} options</summary>
            <ul className="tiny" style={{ marginTop: 8, paddingLeft: 16, color: '#c9c9c9' }}>
              {transport.map(t => <li key={t.id}>{t.text} ({t.kind}/{t.mode})</li>)}
            </ul>
          </details>
          <p className="tiny" style={{ marginTop: 8, color: 'var(--muted)' }}>Lat/Lng null until curator geotags. Offline: your itinerary + emergency numbers cached.</p>
        </div>

        {/* Nearby */}
        <div className="card" style={{ marginTop: 12 }}>
          <div className="label">Nearby destinations</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(nearby||[]).map(n => {
              const isSlug = ['delhi','mumbai','bengaluru','chennai','hyderabad','kolkata','ahmedabad','pune','jaipur','goa','lucknow','varanasi','agra','amritsar','chandigarh','kochi','coimbatore','indore','bhopal','visakhapatnam','udaipur','jodhpur','jaisalmer','mysuru','madurai','rishikesh','shimla','manali','puri','guwahati'].includes(n.toLowerCase());
              return <span key={n} className="badge" style={{ background: isSlug ? 'var(--gold)' : '#1e1e1e', color: isSlug ? '#0a0a0a' : 'var(--text)', cursor: isSlug ? 'pointer' : 'default', fontWeight: isSlug ? 700 : 400 }} onClick={() => isSlug && push({ type: 'city', slug: n.toLowerCase() })}>{n}{isSlug ? ' ↗' : ''}</span>;
            })}
          </div>
          <div className="tiny" style={{ marginTop: 6, color: 'var(--muted)' }}>Slugs link to cities that exist; else free text.</div>
        </div>

        {/* Seasonal */}
        {city.seasonal_overlays?.length > 0 && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="label">Seasonal overlays</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {city.seasonal_overlays.map(s => <span key={s} className="badge gold">{s}</span>)}
            </div>
          </div>
        )}

        {/* CTA */}
        <button className="btn" style={{ marginTop: 18, height: 52, width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}>
          Plan trip to {city.name} <I.IArrow size={16}/>
        </button>
        <p className="tiny" style={{ marginTop: 8, textAlign: 'center', color: 'var(--muted)' }}>Depth · honest data · time-aware · partners not competitors · offline-first</p>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
