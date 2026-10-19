import { useEffect, useState } from 'react';
import * as I from '../icons.jsx';
import { api } from '../lib/api.js';

export default function DataQuality() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(()=>{
    api.dataQuality().then(setData).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  },[]);

  if (loading) return <div className="screen pad" style={{ paddingTop: 40 }}><div className="spin"/><p className="tiny" style={{ marginTop: 12 }}>Loading data quality…</p></div>;
  if (err) return <div className="screen pad" style={{ paddingTop: 40 }}><p style={{ color:'#ff8a8a'}}>{err}</p></div>;

  const q = data;
  const log = q.import_log;

  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 28 }}>
        <span className="wordmark">WanderWise · Admin</span>
        <h1 style={{ fontSize: 28, marginTop: 8 }}>Data quality</h1>
        <p className="sub" style={{ marginTop: 8 }}>Honest data: missing = null, never fabricate, low confidence until field-checked. {q.honest_note}</p>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="label gold">Counts</div>
          <div style={{ marginTop: 10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {Object.entries(q.counts).map(([k,v])=>(
              <div key={k} style={{ background:'#1e1e1e', borderRadius:12, padding:12, textAlign:'center' }}>
                <div className="label">{k}</div>
                <div style={{ fontSize:22, fontWeight:800, marginTop:4 }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="tiny" style={{ marginTop:10, color:'var(--muted)'}}>30 cities · no duplicate slugs · idempotent re-run changes nothing · {q.counts.cities} cities verified low / never verified</div>
        </div>

        <div className="card" style={{ marginTop: 12, border: q.needs_review_count>0 ? '1px solid #3a2a2a' : '1px solid #2a2a2a' }}>
          <div className="between"><span className="label" style={{ color: q.needs_review_count>0 ? '#ff8a8a':'var(--gold)'}}>Needs review · {q.needs_review_count}</span><span className="badge muted">{q.needs_review_count} places</span></div>
          {q.needs_review.length===0 ? <p className="tiny" style={{ marginTop:8, color:'var(--muted)'}}>No places need review — all are kind=place.</p> : (
            <div style={{ marginTop: 10, display:'grid', gap:8 }}>
              {q.needs_review.map(p=>(
                <div key={p.id} className="card" style={{ padding:10, background:'#1a1a0a' }}>
                  <div className="label">{p.name} · {p.city_slug}</div>
                  <div className="tiny" style={{ marginTop:4 }}><strong>{p.kind}</strong> — {p.reason}</div>
                  <details style={{ marginTop:6 }}><summary className="tiny gold">Why this needs review?</summary><p className="tiny" style={{ marginTop:6, color:'#c9c9c9'}}>{p.reason}</p></details>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="label gold">Import log · {log?.generatedAt ? new Date(log.generatedAt).toLocaleString('en-IN') : '—'}</div>
          <div className="tiny" style={{ marginTop: 8 }}>Source: {log?.source_label} · Cities {log?.cities} · Places {log?.places} · Re-run idempotent</div>
          <div style={{ marginTop: 12 }}>
            <div className="label">Merges · {log?.merges?.length || 0}</div>
            {log?.merges?.length===0 ? <p className="tiny" style={{ color:'var(--muted)', marginTop:6}}>No merges.</p> : (
              <ul className="tiny" style={{ marginTop:6, paddingLeft:16, color:'#c9c9c9'}}>
                {log.merges.map((m,i)=>(
                  <li key={i}><strong>{m.city}</strong> — {m.type}: {Array.isArray(m.from)? m.from.join(' + ') : m.from} → {m.to} — {m.reason}</li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="label">Needs review from import · {log?.needs_review?.length||0}</div>
            <ul className="tiny" style={{ marginTop:6, paddingLeft:16, color:'#c9c9c9'}}>
              {(log?.needs_review||[]).map((n,i)=> <li key={i}>{n.city}: <strong>{n.name}</strong> ({n.kind}) — {n.reason}</li>)}
            </ul>
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="label">Warnings · {log?.warnings?.length||0}</div>
            {log?.warnings?.length===0 ? <p className="tiny" style={{ color:'var(--muted)', marginTop:6}}>No warnings.</p> : <ul className="tiny" style={{ marginTop:6, paddingLeft:16}}>{log.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul>}
          </div>
        </div>

        <div className="card" style={{ marginTop: 12, borderStyle:'dashed' }}>
          <div className="label">Honest-data contract</div>
          <ul className="tiny" style={{ marginTop:8, paddingLeft:16, color:'#c9c9c9'}}>
            <li>Never fabricate prices, hours, ratings, coordinates — missing = null</li>
            <li>Every city/place has data_confidence: low, source_label: editorial import v1, last_checked: null, verified: false</li>
            <li>Main POIs classified: place | area | market | event | activity | day_trip | route — non-place kinds get needs_review</li>
            <li>Day trips end with “day trip” suffix → kind day_trip</li>
            <li>Within-city deduplication: Golden Temple/Harmandir Sahib, Law Garden duplicate, Puducherry/Pondicherry, market∩POI→single market</li>
            <li>Best months parsed from best_season: October–March → [10,11,12,1,2,3]; two ranges handled</li>
            <li>Weather risks & permit notes from Master Season/Permit table</li>
            <li>Rhythm {`{morning, afternoon, evening, night}`} from Master Local Rhythm</li>
            <li>Nearby destinations: slugs where city exists, else free text</li>
            <li>Idempotent seed: merge by slug, never overwrite non-null with null</li>
          </ul>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
