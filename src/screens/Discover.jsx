import { useState, useEffect, useMemo } from 'react';
import * as I from '../icons.jsx';
import { useApp } from '../store.jsx';
import { api } from '../lib/api.js';
import { CityCard } from '../components.jsx';

const GROUPS = ['Tier 1','Tier 2','Tier 3'];
const REGIONS = ['North India','South India','West India','East India','Central India','Northeast India'];
const TAGS = ['heritage','food','beach','shopping','temple','gateway','desert','adventure','lake','hill','palace','spiritual'];

const TOURS = [
  { id: 'golden-triangle', title: 'Golden Triangle', cities: ['delhi','jaipur','agra'], desc: 'Delhi → Agra → Jaipur — Mughal to Rajput heritage' },
  { id: 'rajasthan', title: 'Rajasthan Heritage', cities: ['udaipur','jodhpur','jaisalmer','jaipur'], desc: 'Lake palaces to desert camps — October-March best' },
  { id: 'south-temple', title: 'South Temple Trail', cities: ['madurai','mysuru','chennai'], desc: 'Dravidian temples, palaces, coastal culture' },
  { id: 'himalayan', title: 'Himalayan Gateway', cities: ['rishikesh','shimla','manali'], desc: 'Yoga, toy train, valleys — March-June & Sep-Nov' },
  { id: 'beach-coast', title: 'Coastal & Beach', cities: ['goa','puri','visakhapatnam','kochi'], desc: 'Arabian Sea to Bay of Bengal' },
];

function nowInIST() {
  try { return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }); } catch { return new Date().toLocaleTimeString(); }
}

export default function Discover() {
  const { push, health } = useApp();
  const [time, setTime] = useState(nowInIST());
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('');
  const [region, setRegion] = useState('');
  const [tag, setTag] = useState('');
  const [goodMonth, setGoodMonth] = useState(false);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [locStatus, setLocStatus] = useState('tap to share location');

  useEffect(() => { const t=setInterval(()=>setTime(nowInIST()),60000); return()=>clearInterval(t); }, []);

  const monthNow = new Date().getMonth()+1;

  const fetchCities = async (over={}) => {
    setLoading(true); setErr(null);
    const params = {};
    const g = over.group!==undefined? over.group: group;
    const r = over.region!==undefined? over.region: region;
    const tg = over.tag!==undefined? over.tag: tag;
    const gm = over.goodMonth!==undefined? over.goodMonth: goodMonth;
    const qq = over.q!==undefined? over.q: q;
    if (g) params.group=g;
    if (r) params.region=r;
    if (tg) params.tag=tg;
    if (gm) params.month=String(monthNow);
    if (qq) params.q=qq;
    try {
      const res = await api.getCities(params);
      setCities(res.data);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  useEffect(()=>{ fetchCities({}); }, []);

  useEffect(()=> {
    const t = setTimeout(()=> fetchCities({}), 350);
    return ()=>clearTimeout(t);
  }, [q]);

  const onChip = (type,val, setter,cur) => {
    const next = cur===val? '': val;
    setter(next);
    fetchCities({ [type]: next });
  };

  const toggleGood = () => {
    const next = !goodMonth;
    setGoodMonth(next);
    fetchCities({ goodMonth: next });
  };

  const goodCount = useMemo(()=> cities.filter(c=>c.good_this_month).length, [cities]);

  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 28 }}>
        <span className="wordmark">WanderWise · India-first</span>
        <h1 style={{ fontSize: 32, marginTop: 8 }}>What should<br/>you do <span className="gold">now?</span></h1>
        <p className="sub" style={{ marginTop: 8 }}>Not a booking site. Your in-destination companion — built around hour, heat, rest and meal times.</p>

        <div className="card" style={{ marginTop: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span className="iconCirc"><I.IClock size={20}/></span>
          <span style={{ flex: 1 }}><span className="label gold" style={{ display:'block'}}>Time-aware</span><span style={{ fontWeight: 700 }}>{time} IST</span><span className="tiny" style={{ display:'block'}}>Plans shift with heat · opening days · rest</span></span>
          <span className="tiny gold" style={{ fontWeight: 700 }}>Pace: balanced</span>
        </div>

        <div className="row" style={{ marginTop: 12, gap: 10 }}>
          <button className="card" style={{ flex: 1, textAlign:'left', display:'flex', gap:10, alignItems:'center'}} onClick={()=>{
            if(!navigator.geolocation){ setLocStatus('geolocation not available'); return; }
            setLocStatus('locating…');
            navigator.geolocation.getCurrentPosition(p=> setLocStatus(`${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}`), ()=> setLocStatus('permission denied — we work offline anyway'), { enableHighAccuracy:false, timeout:8000 });
          }}>
            <I.IPin size={18} color="var(--gold)"/><span style={{ flex:1}}><span className="label" style={{ display:'block'}}>Where you are</span><span className="tiny">{locStatus}</span></span>
          </button>
          <span className="tiny gold" style={{ alignSelf:'center', fontWeight:700 }}>{cities.length} cities · {goodCount} good this month</span>
        </div>

        {/* Search */}
        <div style={{ marginTop: 16, position:'relative' }}>
          <I.ISearch size={18} color="var(--muted)" style={{ position:'absolute', left:14, top:14 }}/>
          <input
            value={q} onChange={e=> setQ(e.target.value)}
            placeholder="Search cities, state, core identity, tags…"
            style={{ width:'100%', height:46, borderRadius:14, border:'1px solid #2a2a2a', background:'#151515', color:'var(--text)', paddingLeft:42, paddingRight:14, fontSize:14, outline:'none' }}
          />
        </div>

        {/* Chips */}
        <div style={{ marginTop: 12, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <span className="label">Filters</span>
          {GROUPS.map(g => <button key={g} onClick={()=>onChip('group',g,setGroup,group)} className="badge" style={{ background: group===g? 'var(--gold)':'#1e1e1e', color: group===g? '#0a0a0a':'var(--muted)', border:'1px solid #2a2a2a', cursor:'pointer', fontWeight: group===g?800:500 }}>{g}</button>)}
        </div>
        <div style={{ marginTop: 8, display:'flex', gap:6, flexWrap:'wrap' }}>
          {REGIONS.map(r => <button key={r} onClick={()=>onChip('region',r,setRegion,region)} className="badge" style={{ background: region===r? 'var(--gold)':'#1e1e1e', color: region===r? '#0a0a0a':'var(--muted)', border:'1px solid #2a2a2a', cursor:'pointer', fontSize:11 }}>{r}</button>)}
        </div>
        <div style={{ marginTop: 8, display:'flex', gap:6, flexWrap:'wrap' }}>
          {TAGS.map(t => <button key={t} onClick={()=>onChip('tag',t,setTag,tag)} className="badge" style={{ background: tag===t? 'var(--gold)':'#1e1e1e', color: tag===t? '#0a0a0a':'var(--muted)', border:'1px solid #2a2a2a', cursor:'pointer', fontSize:11 }}>{t}</button>)}
          <button onClick={toggleGood} className="badge" style={{ background: goodMonth? '#1a3a1a':'#1e1e1e', color: goodMonth? '#5bbd7a':'var(--muted)', border:`1px solid ${goodMonth?'#2a5a2a':'#2a2a2a'}`, cursor:'pointer', fontWeight: goodMonth?800:500 }}>● Good this month ({new Date().toLocaleString('en-IN',{month:'long'})})</button>
          {(group||region||tag||goodMonth||q) && <button onClick={()=>{ setGroup(''); setRegion(''); setTag(''); setGoodMonth(false); setQ(''); fetchCities({ group:'', region:'', tag:'', goodMonth:false, q:'' }); }} className="badge" style={{ background:'#2a1a1a', color:'#ff8a8a', border:'1px solid #3a2a2a', cursor:'pointer' }}>Clear</button>}
        </div>

        {/* Health */}
        <div style={{ marginTop: 12 }}><span className="tiny">API: {health?.status==='ok' ? '● live' : '● scaffold'} · {health?.version || '0.1.0'} · </span><span className="tiny" style={{ color: health?.status==='ok' ? '#5bbd7a':'var(--muted)'}}>{health ? `${health.status} · 30 cities` : 'checking…'}</span></div>

        {/* Curated tours */}
        <div className="section">
          <div className="sectionHead"><span className="label gold">Curated tours</span><span className="tiny gold">Partners not competitors</span></div>
          <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:6, scrollbarWidth:'none'}}>
            {TOURS.map(t => (
              <button key={t.id} className="card" style={{ minWidth: 220, flex:'0 0 220px', textAlign:'left' }} onClick={()=> {
                // filter to those cities
                // For demo, just show first city
                const slug = t.cities[0];
                push({ type:'city', slug });
              }}>
                <span className="label gold">{t.title}</span>
                <span style={{ display:'block', fontWeight:700, marginTop:6, fontSize:14 }}>{t.desc}</span>
                <span className="tiny" style={{ display:'block', marginTop:8, color:'var(--muted)'}}>{t.cities.join(' → ')}</span>
                <span className="tiny gold" style={{ display:'block', marginTop:8}}>Open →</span>
              </button>
            ))}
          </div>
        </div>

        {/* Good right now */}
        <div className="section">
          <div className="sectionHead"><span className="label">Good right now · {new Date().toLocaleString('en-IN',{month:'long'})}</span><span className="tiny">{goodCount} cities</span></div>
          {loading ? <div className="spin" style={{ margin:'20px auto'}}/> : err ? <p className="tiny" style={{ color:'#ff8a8a'}}>{err}</p> : (
            <div style={{ display:'grid', gap:12 }}>
              {cities.filter(c=>c.good_this_month).slice(0,3).map(city => (
                <CityCard key={city.slug} city={city} onClick={()=> push({ type:'city', slug: city.slug })}/>
              ))}
              {cities.filter(c=>c.good_this_month).length===0 && <p className="tiny" style={{ color:'var(--muted)'}}>No city is best this month with current filters — try clearing filters.</p>}
            </div>
          )}
        </div>

        {/* Weekend gateways */}
        <div className="section">
          <div className="sectionHead"><span className="label">Weekend gateways</span><span className="tiny gold">From Delhi/Mumbai/Bengaluru</span></div>
          <div style={{ display:'grid', gap:12 }}>
            {cities.filter(c=> ['jaipur','agra','udaipur','goa','pune','mysuru','rishikesh','shimla'].includes(c.slug)).slice(0,4).map(city => (
              <CityCard key={city.slug} city={city} onClick={()=> push({ type:'city', slug: city.slug })}/>
            ))}
          </div>
        </div>

        {/* All cities */}
        <div className="section">
          <div className="sectionHead"><span className="label gold">All cities · {cities.length}/30</span><span className="tiny gold">{group||'All tiers'} · {region||'All regions'}</span></div>
          {loading ? <div className="spin" style={{ margin:'20px auto'}}/> : (
            <div style={{ display:'grid', gap:12 }}>
              {cities.map(city => <CityCard key={city.slug} city={city} onClick={()=> push({ type:'city', slug: city.slug })}/>)}
              {cities.length===0 && <div className="card" style={{ textAlign:'center', padding:24 }}><span className="label">No results</span><p className="tiny" style={{ marginTop:8}}>Try different filters or search.</p></div>}
            </div>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
