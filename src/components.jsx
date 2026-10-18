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

export function ProvenanceBadge({ provenance }) {
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
