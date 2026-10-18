import * as I from '../icons.jsx';
import { ProvenanceBadge, FactRow, PartnerLinks } from '../components.jsx';

/**
 * PlaceDetail — empty scaffold that shows the depth contract
 * Every place must answer: what, why, when, cost, duration, etiquette, safety, accessibility, backup
 */

export default function PlaceDetail({ placeId, onBack }) {
  // Scaffold: no API fetch yet — show the honest template. Next prompt wires /api/places/:id
  const place = {
    id: placeId || 'scaffold',
    name: 'Example: Hawa Mahal, Jaipur',
    city: 'Jaipur', state: 'Rajasthan',
    what: 'Five-storey honeycomb facade built for royal women to observe street life unseen.',
    why: 'Best at first light when the east-facing lattice glows; a symbol of Jaipur’s planned-city heritage.',
    when: { openingHours: null, closedDays: null, bestTime: null },
    cost: { amount: null, currency: null, basis: null },
    duration: { minMinutes: null, maxMinutes: null },
    etiquette: null,
    safety: ['Carry water — facade faces direct sun by 10am'],
    accessibility: null,
    backupPlaceId: 'city-palace-jaipur',
    provenance: { sourceType: null, confidence: 'low', lastCheckedAt: null, verified: false },
    partnerLinks: {
      maps: 'https://maps.google.com/?q=Hawa+Mahal+Jaipur',
      reviews: 'https://www.tripadvisor.com/Search?q=Hawa+Mahal',
      booking: null,
    },
  };

  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 16 }}>
        <button onClick={onBack} className="row" style={{ color: 'var(--gold)', fontWeight: 700 }}>
          <I.IBack size={18} /> Back
        </button>
      </div>

      <div style={{ marginTop: 16, height: 200, background: 'linear-gradient(135deg,#1a1a1a,#2a2310)', display: 'grid', placeItems: 'center' }}>
        <span className="tiny" style={{ color: 'var(--muted)' }}>Hero image — null until curator uploads</span>
      </div>

      <div className="pad" style={{ marginTop: 16 }}>
        <span className="kicker">{place.city} · {place.state}</span>
        <h1 style={{ fontSize: 32, marginTop: 4 }}>{place.name}</h1>
        <div style={{ marginTop: 10 }}>
          <ProvenanceBadge provenance={place.provenance} />
        </div>
        <p className="tiny" style={{ marginTop: 8 }}>ID: {place.id} · Honest data: missing = null, never fabricated. Next prompt fetches real data from <code>/api/places/:id</code>.</p>
      </div>

      <div className="pad" style={{ marginTop: 22 }}>
        <div className="card">
          <FactRow label="What" value={place.what} />
          <FactRow label="Why visit now" value={place.why} />
          <FactRow label="When" value={place.when.openingHours || place.when.bestTime || null} />
          <FactRow label="Cost" value={place.cost.amount != null ? `${place.cost.amount} ${place.cost.currency}` : null} />
          <FactRow label="Duration" value={place.duration.minMinutes ? `${place.duration.minMinutes}–${place.duration.maxMinutes} min` : null} />
          <FactRow label="Etiquette" value={place.etiquette ? place.etiquette.join(' · ') : null} />
          <FactRow label="Safety" value={place.safety ? place.safety.join(' · ') : null} />
          <FactRow label="Accessibility" value={place.accessibility ? `${place.accessibility.wheelchair}` : null} />
          <FactRow label="Backup option" value={place.backupPlaceId ? place.backupPlaceId : null} />
          <div className="provenance">
            <span className="tiny">Provenance · {place.provenance.confidence} · {place.provenance.lastCheckedAt || 'not yet field-checked'} — Nothing labelled “verified” unless a human curator confirmed on site.</span>
          </div>
        </div>

        <PartnerLinks {...place.partnerLinks} />

        <div className="card" style={{ marginTop: 14, borderStyle: 'dashed' }}>
          <span className="label">Scaffold note</span>
          <p className="sub" style={{ marginTop: 8, color: '#c9c9c9' }}>
            This is the depth template. Time-aware logic (hour, opening days, heat, rest, meal) and real provenance will be wired when <code>/api/places</code> goes live.
          </p>
        </div>
      </div>
    </div>
  );
}
