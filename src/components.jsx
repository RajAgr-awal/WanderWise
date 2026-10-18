import * as I from './icons.jsx';

export function Field({ label, icon, value, onChange, placeholder, type = 'text', reveal }) {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="inputWrap">
        {icon}
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export function Empty({ icon, title, text, action }) {
  return (
    <div className="empty">
      <div className="iconCirc" style={{ margin: '0 auto 18px', width: 72, height: 72 }}>{icon}</div>
      <h2>{title}</h2>
      <p className="sub" style={{ maxWidth: 320, margin: '0 auto' }}>{text}</p>
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

export function ProvenanceBadge({ provenance, city }) {
  // Support both legacy provenance and city data_confidence
  if (city) {
    const conf = city.data_confidence || city.confidence || 'low';
    const label = city.source_label || city.sourceLabel || 'WanderWise editorial import v1';
    const verified = city.verified;
    if (verified) return <span className="badge gold">✓ Verified · {conf}</span>;
    return <span className="badge muted">{label} · {conf} · not yet verified</span>;
  }
  if (!provenance) {
    return <span className="badge muted">Not yet field-checked · low</span>;
  }
  const { confidence = 'low', sourceType, lastCheckedAt, verified } = provenance;
  if (verified) {
    return <span className="badge gold">✓ Verified · {confidence} · {lastCheckedAt ? new Date(lastCheckedAt).toLocaleDateString('en-IN') : '—'}</span>;
  }
  const src = sourceType || 'unknown source';
  const date = lastCheckedAt ? new Date(lastCheckedAt).toLocaleDateString('en-IN') : 'not yet field-checked';
  return <span className="badge muted">{src} · {confidence} · {date}</span>;
}

export function FactRow({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: value == null ? 'var(--muted2)' : 'var(--text)' }}>
        {value == null || value === '' ? <span className="nullVal">Not yet known</span> : value}
      </div>
    </div>
  );
}

export function PartnerLinks({ maps, reviews, booking }) {
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="label gold" style={{ marginBottom: 12 }}>Partners — not competitors</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {maps && <a href={maps} target="_blank" rel="noopener noreferrer" className="btn soft" style={{ height: 46 }}>Open in Google Maps ↗</a>}
        {reviews && <a href={reviews} target="_blank" rel="noopener noreferrer" className="btn ghost" style={{ height: 46 }}>Read reviews on Tripadvisor ↗</a>}
        {booking && <a href={booking} target="_blank" rel="noopener noreferrer" className="btn ghost" style={{ height: 46 }}>Check availability on MakeMyTrip ↗</a>}
        {!maps && !reviews && !booking && <p className="tiny">No partner links yet — curator will add when verified.</p>}
      </div>
      <p className="tiny" style={{ marginTop: 10 }}>We never scrape or copy their content. Plain labelled hand-offs only.</p>
    </div>
  );
}

export function CityCard({ city, onClick }) {
  const hasHero = city.hero_image_url;
  return (
    <button onClick={onClick} className="card cityCard" style={{ padding: 0, overflow: 'hidden', textAlign: 'left', width: '100%' }}>
      <div style={{ height: 120, background: hasHero ? `url(${city.hero_image_url}) center/cover` : 'linear-gradient(135deg,#1a1a1a,#2a2310)', display: 'grid', placeItems: 'center', position: 'relative' }}>
        {!hasHero && <span className="tiny" style={{ color: 'var(--muted)', padding: 12, textAlign: 'center' }}>{city.core_identity.slice(0,80)}…</span>}
        <span className="badge gold" style={{ position: 'absolute', top: 10, left: 10, fontSize: 10 }}>{city.editorial_group} · #{city.rank_in_group}</span>
        {city.good_this_month && <span className="badge" style={{ position: 'absolute', top: 10, right: 10, background: '#1a3a1a', color: '#5bbd7a', border: '1px solid #2a5a2a', fontSize: 10 }}>● Good this month</span>}
      </div>
      <div style={{ padding: 12 }}>
        <div className="between">
          <span className="kicker">{city.region} · {city.city_type}</span>
          <span className="tiny" style={{ color: 'var(--gold)' }}>{city.best_season_text}</span>
        </div>
        <h3 style={{ fontSize: 18, marginTop: 4 }}>{city.name}</h3>
        <p className="tiny" style={{ marginTop: 4, color: 'var(--muted)', lineHeight: 1.4 }}>{city.core_identity}</p>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {city.app_tags.slice(0,4).map(t => <span key={t} className="badge muted" style={{ fontSize: 10 }}>{t}</span>)}
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <ProvenanceBadge city={city} />
        </div>
      </div>
    </button>
  );
}

export function MonthStrip({ best_months, best_text }) {
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const full = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div>
      <div className="label" style={{ marginBottom: 8 }}>Best season: {best_text} · 12-month strip</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {months.map((m,i) => {
          const n = i+1;
          const isBest = (best_months||[]).includes(n);
          return (
            <div key={i} title={`${full[i]} ${isBest ? ' — Best season' : ''}`} style={{
              flex: 1, height: 36, borderRadius: 8, display: 'grid', placeItems: 'center',
              background: isBest ? 'var(--gold)' : '#1e1e1e',
              color: isBest ? '#0a0a0a' : 'var(--muted)',
              fontWeight: isBest ? 800 : 500,
              fontSize: 13,
              border: isBest ? '1px solid #e0c250' : '1px solid #2a2a2a'
            }}>{m}</div>
          );
        })}
      </div>
      <div className="tiny" style={{ marginTop: 6, color: 'var(--muted)' }}>Gold = best months from editorial best_season. Current month highlighted via Good this month.</div>
    </div>
  );
}
