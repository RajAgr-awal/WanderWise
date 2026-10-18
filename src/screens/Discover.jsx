import { useState, useEffect } from 'react';
import * as I from '../icons.jsx';
import { useApp } from '../store.jsx';
import { ProvenanceBadge, PartnerLinks, FactRow } from '../components.jsx';
import { API_BASE } from '../lib/api.js';

/**
 * Discover — scaffold empty state
 * Job: given who you are, where you are and what time it is → most meaningful next choice.
 * Scaffold shows the shape, honest badges, time-aware hints, and partner hand-offs.
 */

function nowInIST() {
  try {
    return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return new Date().toLocaleTimeString(); }
}

export default function Discover() {
  const { push, health } = useApp();
  const [time, setTime] = useState(nowInIST());
  const [locStatus, setLocStatus] = useState('tap to share location');

  useEffect(() => {
    const t = setInterval(() => setTime(nowInIST()), 60_000);
    return () => clearInterval(t);
  }, []);

  const examplePlace = {
    id: 'jaipur-hawa-mahal-example',
    name: 'Hawa Mahal — example record',
    city: 'Jaipur',
    what: 'Five-storey honeycomb facade built for royal women to observe street life unseen.',
    why: 'Best at first light when the east-facing lattice glows.',
    when: { openingHours: null, closedDays: null, bestTime: null },
    cost: { amount: null, currency: null, basis: null },
    duration: { minMinutes: null, maxMinutes: null },
    etiquette: null,
    safety: ['Carry water — facade faces direct sun by 10am'],
    accessibility: null,
    backupPlaceId: null,
    provenance: { sourceType: null, confidence: 'low', lastCheckedAt: null, verified: false },
    partnerLinks: {
      maps: 'https://maps.google.com/?q=Hawa+Mahal+Jaipur',
      reviews: 'https://www.tripadvisor.com/Search?q=Hawa+Mahal',
      booking: null,
    },
  };

  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 28 }}>
        <span className="wordmark">WanderWise · India-first</span>
        <h1 style={{ fontSize: 32, marginTop: 8 }}>What should<br />you do <span className="gold">now?</span></h1>
        <p className="sub" style={{ marginTop: 8 }}>
          Not a booking site. Not a generic generator. Your in-destination companion — built around hour, heat, rest and meal times.
        </p>

        {/* Time-aware bar */}
        <div className="card" style={{ marginTop: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span className="iconCirc"><I.IClock size={20} /></span>
          <span style={{ flex: 1 }}>
            <span className="label gold" style={{ display: 'block' }}>Time-aware</span>
            <span style={{ fontWeight: 700 }}>{time} IST</span>
            <span className="tiny" style={{ display: 'block' }}>Plans shift with heat · opening days · rest</span>
          </span>
          <span className="tiny gold" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Pace: balanced</span>
        </div>

        {/* Location / persona */}
        <div className="row" style={{ marginTop: 12, gap: 10 }}>
          <button className="card" style={{ flex: 1, textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center' }}
            onClick={() => {
              if (!navigator.geolocation) { setLocStatus('geolocation not available'); return; }
              setLocStatus('locating…');
              navigator.geolocation.getCurrentPosition(
                (p) => setLocStatus(`${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}`),
                () => setLocStatus('permission denied — we work offline anyway'),
                { enableHighAccuracy: false, timeout: 8000 }
              );
            }}>
            <I.IPin size={18} color="var(--gold)" />
            <span style={{ flex: 1 }}>
              <span className="label" style={{ display: 'block' }}>Where you are</span>
              <span className="tiny">{locStatus}</span>
            </span>
          </button>
          <button className="card" style={{ flex: '0 0 auto', padding: '14px 16px' }} onClick={() => push({ type: 'place', placeId: examplePlace.id, keepTabs: false })}>
            <span className="label gold">Scaffold</span>
            <span style={{ display: 'block', fontWeight: 700, marginTop: 2 }}>See example depth →</span>
          </button>
        </div>

        {/* Backend health */}
        <div style={{ marginTop: 12 }}>
          <span className="tiny">API: {API_BASE} · </span>
          <span className="tiny" style={{ color: health?.status === 'ok' ? '#5bbd7a' : 'var(--muted)' }}>
            {health ? `${health.status} · v${health.version || 'scaffold'}` : 'checking…'}
          </span>
        </div>

        {/* Scaffold next-choice card — honest, depth template */}
        <div className="section">
          <div className="sectionHead">
            <span className="label gold">Scaffold preview — not real data</span>
            <span className="tiny gold">Next prompt wires API</span>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 140, background: 'linear-gradient(135deg,#1a1a1a,#2a2310)', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
              <span style={{ textAlign: 'center', padding: 20 }}>
                <span style={{ display: 'block', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)' }}>Depth template</span>
                <span style={{ display: 'block', marginTop: 6, fontWeight: 700, color: 'var(--text)' }}>{examplePlace.name}</span>
                <span className="tiny" style={{ display: 'block', marginTop: 4 }}>{examplePlace.city} · {examplePlace.what}</span>
              </span>
            </div>
            <div style={{ padding: 16 }}>
              <div className="between" style={{ marginBottom: 12 }}>
                <ProvenanceBadge provenance={examplePlace.provenance} />
                <span className="tiny">Backup: not yet known</span>
              </div>

              <FactRow label="What" value={examplePlace.what} />
              <FactRow label="Why" value={examplePlace.why} />
              <FactRow label="When (opening hours / closed days / best time)" value={examplePlace.when.openingHours || examplePlace.when.bestTime || null} />
              <FactRow label="Cost" value={examplePlace.cost.amount != null ? `${examplePlace.cost.amount} ${examplePlace.cost.currency}` : null} />
              <FactRow label="Duration" value={examplePlace.duration.minMinutes ? `${examplePlace.duration.minMinutes}–${examplePlace.duration.maxMinutes} min` : null} />
              <FactRow label="Etiquette" value={examplePlace.etiquette ? examplePlace.etiquette.join(' · ') : null} />
              <FactRow label="Safety" value={examplePlace.safety ? examplePlace.safety.join(' · ') : null} />
              <FactRow label="Accessibility" value={examplePlace.accessibility ? `${examplePlace.accessibility.wheelchair} — ${examplePlace.accessibility.notes}` : null} />
              <div className="provenance">
                <strong>Provenance:</strong> <span className="tiny">{examplePlace.provenance.sourceType || 'unknown source'} · confidence {examplePlace.provenance.confidence} · not yet field-checked</span>
                <div className="tiny" style={{ marginTop: 6 }}>Nothing is labelled “verified” unless a human curator confirmed it on site. Missing means null.</div>
              </div>

              <PartnerLinks {...examplePlace.partnerLinks} />

              <button className="btn soft" style={{ marginTop: 16 }} onClick={() => push({ type: 'place', placeId: examplePlace.id })}>
                Open full place page <I.IArrow size={16} />
              </button>
            </div>
          </div>

          <div className="card" style={{ marginTop: 14, borderStyle: 'dashed' }}>
            <div className="label">What’s next for the scaffold</div>
            <ul className="sub" style={{ margin: '8px 0 0', paddingLeft: 18, color: '#c9c9c9' }}>
              <li>Wire <code>/api/discover?lat=&lng=&time=&persona=</code> to real ranking (heat / rest / meal / opening days)</li>
              <li>Replace example card with your city’s curated places — each field keeps provenance</li>
              <li>Offline: next choice + essentials + emergency numbers cached for no-signal roaming</li>
            </ul>
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
