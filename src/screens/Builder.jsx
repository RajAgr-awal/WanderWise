import { useMemo, useState } from 'react';
import * as I from '../icons.jsx';
import { Modal, Segmented } from '../components.jsx';
import { useApp } from '../store.jsx';
import { CITIES, cityById, money, generateItinerary, transitHours } from '../data.js';

const MAX = 10;

export default function Builder({ preset }) {
  const { pop, replace, saveTrip, templates, setTemplates, notify } = useApp();
  const [legs, setLegs] = useState(preset?.legs || []);
  const [tier, setTier] = useState(preset?.tier || 'mid');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [tName, setTName] = useState('');
  const [tNotes, setTNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const add = (id) => {
    if (legs.length >= MAX || legs.find((l) => l.cityId === id)) return;
    setLegs([...legs, { cityId: id, days: 2 }]);
  };
  const remove = (id) => setLegs(legs.filter((l) => l.cityId !== id));
  const setDays = (id, d) => setLegs(legs.map((l) => (l.cityId === id ? { ...l, days: d } : l)));

  const totals = useMemo(() => {
    const days = legs.reduce((s, l) => s + l.days, 0);
    const cost = legs.reduce((s, l) => s + cityById(l.cityId).pricePerDay[tier] * l.days, 0);
    let transit = 0;
    for (let i = 1; i < legs.length; i++) transit += transitHours(legs[i - 1].cityId, legs[i].cityId);
    return { days, cost, transit };
  }, [legs, tier]);

  const chosen = legs.map((l) => l.cityId);
  const suggestions = CITIES.filter((c) => !c.isComingSoon && !chosen.includes(c.id))
    .filter((c) => !legs.length || c.country === cityById(legs[legs.length - 1].cityId).country)
    .slice(0, 6);
  const all = CITIES.filter((c) => !c.isComingSoon && !chosen.includes(c.id))
    .filter((c) => !q.trim() || (c.name + c.country).toLowerCase().includes(q.toLowerCase()));

  const create = () => {
    setBusy(true);
    setTimeout(() => {
      const trip = {
        id: 'trip_' + Date.now(),
        type: 'multi-city',
        title: legs.length === 1 ? cityById(legs[0].cityId).name : `${cityById(legs[0].cityId).name} + ${legs.length - 1} more`,
        cityIds: chosen,
        durationDays: totals.days,
        budgetTier: tier,
        estimatedTotal: totals.cost,
        perDayCost: Math.round(totals.cost / Math.max(1, totals.days)),
        days: generateItinerary(chosen, totals.days, tier),
        excluded: [],
        createdAt: Date.now(),
      };
      saveTrip(trip);
      replace({ type: 'trip', tripId: trip.id });
    }, 900);
  };

  const saveTemplate = () => {
    if (!tName.trim()) return;
    setTemplates([...templates, { id: 't_' + Date.now(), name: tName.trim(), notes: tNotes.trim(), legs, tier, createdAt: Date.now() }]);
    setModal(false); setTName(''); setTNotes('');
    notify('Template saved');
  };

  if (busy) {
    return (
      <div className="screen noTabs" style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" /><p className="sub" style={{ marginTop: 20 }}>Building your multi-city route…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen noTabs" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', padding: 0 }}>
      <div className="chatHead">
        <button onClick={pop} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--card)', display: 'grid', placeItems: 'center' }}>
          <I.IBack size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <span className="label gold">Design your tour</span>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Build a route</div>
        </div>
        <span className="quota"><I.ISpark size={14} />{legs.length}/{MAX}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 0' }}>
        <div className="pad">
          <span className="label gold">Your route</span>
          <div style={{ marginTop: 12 }}>
            {!legs.length && (
              <div style={{ border: '1.5px dashed var(--line2)', borderRadius: 18, padding: '34px 20px', textAlign: 'center' }}>
                <I.ISpark size={26} color="var(--gold)" />
                <h3 style={{ marginTop: 10 }}>Add your first city</h3>
                <p className="tiny" style={{ marginTop: 6 }}>Tap any suggestion below or browse the full list.</p>
              </div>
            )}
            {legs.map((l, i) => {
              const c = cityById(l.cityId);
              return (
                <div className="card" key={l.cityId} style={{ marginBottom: 10 }}>
                  <div className="row">
                    <span className="pinDot">{i + 1}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 17 }}>{c.name}</span>
                      <span className="tiny">{c.country}</span>
                    </span>
                    <b style={{ fontSize: 14 }}>{l.days}d</b>
                    <button onClick={() => remove(l.cityId)}
                      style={{ color: 'var(--danger)', padding: 6, borderRadius: 8, background: 'rgba(224,82,82,.1)' }}>
                      <I.ITrash size={18} />
                    </button>
                  </div>
                  <input type="range" min="1" max="10" value={l.days} style={{ marginTop: 14 }}
                    onChange={(e) => setDays(l.cityId, +e.target.value)} />
                  <div className="tiny gold" style={{ marginTop: 8, fontWeight: 700 }}>
                    {money(c.pricePerDay[tier] * l.days)} <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>({money(c.pricePerDay[tier])}/day)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="label gold row" style={{ gap: 8, margin: '26px 0 12px' }}><I.IDollar size={16} /> Budget tier</div>
          <Segmented value={tier} onChange={setTier} />
        </div>

        {!!suggestions.length && (
          <div className="section">
            <div className="sectionHead">
              <span className="label gold row" style={{ gap: 8 }}>
                <I.ISpark size={14} /> {legs.length ? 'You might also add' : 'Popular starting points'}
              </span>
            </div>
            <div className="hscroll">
              {suggestions.map((c) => (
                <div key={c.id} className="card row" style={{ width: 250, gap: 12 }}>
                  <img src={c.hero} alt="" width={46} height={46} style={{ borderRadius: 10, objectFit: 'cover' }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700 }}>{c.name}</span>
                    <span className="tiny" style={{ display: 'block' }}>{c.country}</span>
                    <span className="tiny gold" style={{ fontWeight: 700 }}>{money(c.pricePerDay[tier])}/day</span>
                  </span>
                  <button onClick={() => add(c.id)}
                    style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold)', color: '#111', display: 'grid', placeItems: 'center' }}>
                    <I.IPlus size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section pad">
          <span className="label gold">Browse all cities</span>
          <div className="inputWrap" style={{ margin: '12px 0 14px' }}>
            <I.ISearch size={18} color="#7a7a7a" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by city or country..." />
          </div>
          {all.map((c) => (
            <div className="listRow" key={c.id}>
              <img src={c.hero} alt="" width={46} height={46} style={{ borderRadius: 10, objectFit: 'cover' }} />
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 700 }}>{c.name}</span>
                <span className="tiny">{c.country}</span>
                <span className="tiny gold" style={{ display: 'block', fontWeight: 700 }}>{money(c.pricePerDay[tier])}/day</span>
              </span>
              <button onClick={() => add(c.id)}
                style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold)', color: '#111', display: 'grid', placeItems: 'center' }}>
                <I.IPlus size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--line)', background: 'var(--bg)', padding: '14px 22px calc(16px + env(safe-area-inset-bottom))' }}>
        <div className="row" style={{ marginBottom: 14 }}>
          <span style={{ flex: 1 }}>
            <span className="label row" style={{ gap: 6 }}><I.IClock size={13} /> Time</span>
            <b>{totals.days ? `${totals.days}d${totals.transit ? ` + ~${totals.transit}h transit` : ''}` : '—'}</b>
          </span>
          <span style={{ width: 1, height: 34, background: 'var(--line)' }} />
          <span style={{ flex: 1, paddingLeft: 16 }}>
            <span className="label row" style={{ gap: 6 }}><I.IWallet size={13} /> Est. total</span>
            <b className="gold">{totals.cost ? money(totals.cost) : '—'}</b>
          </span>
        </div>
        <button className="btn" disabled={!legs.length} onClick={create}>
          <I.IArrow size={18} /> {legs.length ? 'Create my tour' : 'Add a city to start'}
        </button>
        <button className="btn soft" style={{ marginTop: 10 }} disabled={!legs.length} onClick={() => setModal(true)}>
          <I.IBookmark size={17} /> Save as template
        </button>
      </div>

      {modal && (
        <Modal title="Save as template" icon={<I.IBookmark size={20} color="var(--gold)" />} onClose={() => setModal(false)}>
          <p className="sub" style={{ marginBottom: 18 }}>Give this route a name so you can reuse or share it later.</p>
          <span className="label">Name</span>
          <div className="inputWrap" style={{ margin: '9px 0 18px' }}>
            <input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="e.g. Rajasthan honeymoon" />
          </div>
          <span className="label">Notes (optional)</span>
          <textarea style={{ marginTop: 9 }} value={tNotes} onChange={(e) => setTNotes(e.target.value)}
            placeholder="A short description for future you..." />
          <div className="row" style={{ gap: 14, marginTop: 22 }}>
            <button className="btn ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn" onClick={saveTemplate} disabled={!tName.trim()}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
