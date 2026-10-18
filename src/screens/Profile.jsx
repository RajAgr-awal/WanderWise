import { useState } from 'react';
import * as I from '../icons.jsx';
import { useApp } from '../store.jsx';

const TRAVEL_STYLES = ['Balanced','First time','Food explorer','Solo woman','Senior','Accessibility','Family','Budget','Photographer','Pilgrim','Slow'];

export default function Profile() {
  const { user, setUser, notify, health } = useApp();
  const [name, setName] = useState(user?.displayName || '');
  const [homeCity, setHomeCity] = useState(user?.homeCity || '');
  const [languages, setLanguages] = useState(user?.languages || 'English');
  const [diet, setDiet] = useState(user?.diet || '');
  const [mobility, setMobility] = useState(user?.mobility || '');
  const [travellingWith, setTravellingWith] = useState(user?.travellingWith || '');
  const [budgetTier, setBudgetTier] = useState(user?.budgetTier || 'mid');
  const [travelStyle, setTravelStyle] = useState(user?.travelStyle || 'Balanced');

  const isGuest = !user || user.guest === true || (user.uid && user.uid.startsWith('guest_'));

  const save = () => {
    const u = {
      ...(user||{}),
      displayName: name.trim() || 'Traveller',
      name: name.trim() || 'Traveller',
      homeCity: homeCity.trim(),
      languages: languages.split(',').map(s=>s.trim()).filter(Boolean),
      diet,
      mobility,
      travellingWith,
      budgetTier,
      travelStyle,
      updatedAt: new Date().toISOString(),
    };
    setUser(u);
    notify('Profile saved locally — will merge on sign-in');
  };

  const exportData = () => {
    const data = { user, exportedAt: new Date().toISOString(), trips: [] };
    try { data.trips = JSON.parse(localStorage.getItem('wanderwise.trips')||'[]'); } catch {}
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`wanderwise-export-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
    notify('Exported — privacy: no gender/health data stored');
  };

  const deleteData = () => {
    if (!confirm('Delete all local guest data? This cannot be undone.')) return;
    localStorage.removeItem('wanderwise.scaffold.v1');
    localStorage.removeItem('wanderwise.trips');
    setUser(null);
    notify('Local data deleted — guest profile cleared');
  };

  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 28 }}>
        <span className="wordmark">WanderWise</span>
        <h1 style={{ fontSize: 32 }}>Profile</h1>
        <p className="sub" style={{ marginTop: 6 }}>Guests can use the app without signing in; sign-in adds cross-device sync. TravelStyle is a <strong>mode</strong>, not identity — e.g. Solo woman adjusts safety, timing, transport tips.</p>

        <div className="card" style={{ marginTop: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
          <span className="iconCirc" style={{ width: 56, height: 56, flex: '0 0 56px' }}><I.IUser size={24} /></span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontWeight: 800, fontSize: 18 }}>{user?.displayName || 'Guest traveller'}</span>
            <span className="tiny" style={{ display: 'block' }}>{user?.email || 'Guest mode — no sign-in required · local persistence'}</span>
            <span className="badge muted" style={{ marginTop: 8 }}>{isGuest ? 'Guest — local only · will merge on signup' : 'Signed in — sync enabled'}</span>
          </span>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <span className="label gold">Traveller profile — edit & save locally</span>
          <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
            <div className="field">
              <span className="label">Display name</span>
              <div className="inputWrap"><I.IUser size={18} color="#6e6e6e"/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (guest)" /></div>
            </div>
            <div className="field">
              <span className="label">Home city</span>
              <div className="inputWrap"><I.IPin size={18} color="#6e6e6e"/><input value={homeCity} onChange={e=>setHomeCity(e.target.value)} placeholder="e.g. Delhi" /></div>
            </div>
            <div className="field">
              <span className="label">Languages (comma separated)</span>
              <div className="inputWrap"><I.ICompass size={18} color="#6e6e6e"/><input value={languages} onChange={e=>setLanguages(e.target.value)} placeholder="English, Hindi, Tamil" /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div className="field"><span className="label">Diet</span><div className="inputWrap"><input value={diet} onChange={e=>setDiet(e.target.value)} placeholder="Veg / Jain / Non-veg" /></div></div>
              <div className="field"><span className="label">Mobility</span><div className="inputWrap"><input value={mobility} onChange={e=>setMobility(e.target.value)} placeholder="Steps OK / Wheelchair" /></div></div>
            </div>
            <div className="field"><span className="label">Travelling with</span><div className="inputWrap"><input value={travellingWith} onChange={e=>setTravellingWith(e.target.value)} placeholder="Solo / Family / Friends" /></div></div>
            <div className="field"><span className="label">Budget tier</span><div style={{ display:'flex', gap:6, marginTop:4 }}>{['budget','mid','premium'].map(b=> <button key={b} onClick={()=>setBudgetTier(b)} className="badge" style={{ background: budgetTier===b?'var(--gold)':'#1e1e1e', color: budgetTier===b?'#0a0a0a':'var(--muted)', border:'1px solid #2a2a2a', cursor:'pointer', textTransform:'capitalize' }}>{b}</button>)}</div></div>
            <div className="field"><span className="label">Travel style — single select (mode, not identity)</span><div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:6 }}>{TRAVEL_STYLES.map(s=> <button key={s} onClick={()=>setTravelStyle(s)} className="badge" style={{ background: travelStyle===s?'var(--gold)':'#1e1e1e', color: travelStyle===s?'#0a0a0a':'var(--muted)', border:'1px solid #2a2a2a', cursor:'pointer', fontSize:11, fontWeight: travelStyle===s?800:500 }}>{s}</button>)}</div><span className="tiny" style={{ marginTop:6, display:'block', color:'var(--muted)'}}>Solo woman = safety/timing/transport mode — we never ask gender/health. Privacy-first.</span></div>
            <button className="btn" onClick={save}>Save profile (local)</button>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <button className="btn ghost" onClick={exportData}>Export my data ↓</button>
              <button className="btn ghost" onClick={deleteData} style={{ color:'#ff8a8a', borderColor:'#3a2a2a' }}>Delete local data</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <span className="label gold">Auth — guest → signed in (merge)</span>
          <p className="sub" style={{ marginTop: 8, color:'#c9c9c9'}}>Guests persist locally. On signup (email+pwd or Google), guest trips merge. No feature is locked behind login.</p>
          <div style={{ display:'grid', gap:10, marginTop:12 }}>
            {!isGuest ? (
              <button className="btn ghost" onClick={()=>{ setUser(null); notify('Signed out — now guest'); }}><I.ILogout size={18}/> Sign out</button>
            ) : (
              <>
                <button className="btn" onClick={()=>{
                  const n = name.trim()||'Traveller';
                  const guestTrips = (()=>{ try{ return JSON.parse(localStorage.getItem('wanderwise.trips')||'[]')}catch{ return [] }})();
                  setUser({ uid:`guest_${Date.now()}`, displayName:n, name:n, guest:true, homeCity, languages: languages.split(',').map(s=>s.trim()), budgetTier, travelStyle, guestTripsToMerge: guestTrips });
                  notify(`Welcome, ${n} — guest mode (local)`);
                }}>Continue as guest</button>
                <button className="btn ghost" onClick={()=>notify('Auth: Email+pwd & Google — next prompt wires Firebase/Auth REST. Guest trips will merge on signup.')}>Sign in with Google / Email (next)</button>
                <div className="tiny" style={{ textAlign:'center', color:'var(--muted)'}}>We never store gender or health data. Export/delete anytime.</div>
              </>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <span className="label">Health</span>
          <p className="tiny" style={{ marginTop: 8, wordBreak:'break-all'}}>API: {health ? `${health.status} · ${health.version||'scaffold'} · ${health.time||''}`:'checking…'}</p>
          {health?.dataStatus && <p className="tiny" style={{ marginTop:6}}>{health.dataStatus}</p>}
          <div className="row" style={{ marginTop:12, gap:10}}><a href="/api/health" target="_blank" rel="noreferrer" className="btn soft sm">Open /api/health ↗</a><span className="tiny">Env-driven, no secrets</span></div>
        </div>

        <p className="tiny" style={{ textAlign:'center', marginTop:28}}>WanderWise v0.1.0 · depth · honest data · partners · offline-first · 30 cities</p>
      </div>
    </div>
  );
}
