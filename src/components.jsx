import { useState } from 'react';
import * as I from './icons.jsx';
import { money } from './data.js';

export function Field({ label, icon, value, onChange, placeholder, type = 'text', reveal }) {
  const [show, setShow] = useState(false);
  const t = reveal ? (show ? 'text' : 'password') : type;
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="inputWrap">
        {icon}
        <input type={t} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} />
        {reveal && (
          <button type="button" onClick={() => setShow(!show)} style={{ color: 'var(--muted)' }}>
            {show ? <I.IEyeOff size={22} /> : <I.IEye size={22} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function CityCard({ city, tier = 'budget', onClick, width }) {
  const soon = city.isComingSoon;
  return (
    <button className="cityCard" style={width ? { width } : undefined}
      onClick={soon ? undefined : onClick} disabled={soon}>
      <img src={city.hero} alt={city.name} loading="lazy" />
      <div className="scrim" />
      {soon && <span className="soonBadge">Coming soon</span>}
      <div className="body">
        <span className="label gold">{city.country}</span>
        <h3>{city.name}</h3>
        <p>{city.description}</p>
        <span className="gold" style={{ fontWeight: 700, fontSize: 14 }}>
          {money(city.pricePerDay[tier])}/day
        </span>
      </div>
    </button>
  );
}

export function Rating({ value }) {
  if (!value) return null;
  return (
    <span className="row" style={{ gap: 5, color: 'var(--gold)', fontSize: 13, fontWeight: 700 }}>
      <I.IStar size={14} />{value}
    </span>
  );
}

export function Segmented({ value, onChange, city, options = ['budget', 'mid', 'luxury'] }) {
  const label = { budget: 'Budget', mid: 'Mid', luxury: 'Luxury' };
  const sym = { budget: '$', mid: '$$', luxury: '$$$' };
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o} className={value === o ? 'on' : ''} onClick={() => onChange(o)}>
          <div className="s1">{sym[o]}</div>
          <div className="s2">{label[o]}</div>
          {city && <div className="s3">{money(city.pricePerDay[o])}/day</div>}
        </button>
      ))}
    </div>
  );
}

export function Modal({ title, icon, onClose, children }) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ marginBottom: 6 }}>
          {icon}<h2 style={{ margin: 0 }}>{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ icon, title, text }) {
  return (
    <div className="empty">
      <div className="iconCirc" style={{ margin: '0 auto 18px', width: 72, height: 72 }}>{icon}</div>
      <h2>{title}</h2>
      <p className="sub" style={{ maxWidth: 300, margin: '0 auto' }}>{text}</p>
    </div>
  );
}

export function InfoPage({ title, sections, onBack }) {
  return (
    <div className="screen noTabs fadeIn">
      <div className="pad" style={{ paddingTop: 24 }}>
        <button onClick={onBack} className="row" style={{ color: 'var(--gold)', marginBottom: 18 }}>
          <I.IBack size={18} /> Back
        </button>
        <h1 style={{ fontSize: 32 }}>{title}</h1>
        {sections.map((s) => (
          <div key={s.h} style={{ marginTop: 26 }}>
            <span className="label gold">{s.h}</span>
            <p className="sub" style={{ marginTop: 8, color: '#c9c9c9' }}>{s.p}</p>
          </div>
        ))}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
