import { useEffect, useRef, useState } from 'react';
import * as I from '../icons.jsx';
import { useApp } from '../store.jsx';
import { cityById, RESTAURANTS, STAYS, TRANSPORT, MARKETS, POIS, money, GUIDE_REPLIES } from '../data.js';

const QUOTA = 20;

function answer(q, city, trip) {
  const s = q.toLowerCase();
  const name = city.name;
  const rests = RESTAURANTS.filter((r) => r.cityId === city.id);
  const stays = STAYS.filter((r) => r.cityId === city.id);
  const trans = TRANSPORT.filter((r) => r.cityId === city.id);
  const mkts = MARKETS.filter((r) => r.cityId === city.id);
  const pois = POIS.filter((r) => r.cityId === city.id);

  if (/eat|food|restaurant|dinner|lunch|dish|breakfast/.test(s) && rests.length) {
    const budget = rests.filter((r) => r.priceForTwo <= 1000);
    const fancy = rests.filter((r) => r.priceForTwo > 2500);
    return [
      budget[0] && `For a budget meal in ${name}, **${budget[0].name}** (${budget[0].area}) is the pick — ${budget[0].description.toLowerCase()} Must try the ${budget[0].mustTry}, about ₹${budget[0].priceForTwo} for two.`,
      rests[1] && `A solid mid-range option is **${rests[1].name}** in ${rests[1].area} — ${rests[1].mustTry} is what people go for (₹${rests[1].priceForTwo} for two).`,
      fancy[0] && `If you want to splurge one night, **${fancy[0].name}** is worth it: ${fancy[0].description.toLowerCase()} Around ₹${fancy[0].priceForTwo} for two.`,
      trip && `You've budgeted ${money(trip.estimatedTotal)} across ${trip.durationDays} days, so keep the splurge for your final night.`,
    ].filter(Boolean).join('\n\n');
  }
  if (/stay|hotel|hostel|sleep|accommodation/.test(s) && stays.length) {
    return stays.map((st) => `**${st.name}** (${st.tier}, ${st.type}) in ${st.area} — ${money(st.pricePerNight)}/night.`).join('\n\n')
      + `\n\nFor your ${trip?.budgetTier || 'chosen'} tier I'd book the ${stays.find((x) => x.tier === (trip?.budgetTier || 'mid'))?.name || stays[0].name}.`;
  }
  if (/get around|transport|metro|taxi|auto|airport|train|travel/.test(s) && trans.length) {
    return `Moving around ${name}:\n\n` + trans.map((t) => `**${t.mode}** — ${t.costRange}, roughly ${t.timeEstimate}. ${t.note}`).join('\n\n');
  }
  if (/shop|market|souvenir|buy|gift/.test(s) && mkts.length) {
    return mkts.map((m) => `**${m.name}** — ${m.specialty}. ${m.bestFor} Haggling is expected; start at about 40% of the asking price.`).join('\n\n');
  }
  if (/see|do|visit|attraction|sight|places/.test(s) && pois.length) {
    return `Top of the list in ${name}:\n\n` + pois.slice(0, 4).map((p) => `**${p.name}** (${p.category}) — ${p.description} ${p.price ? `₹${p.price}` : 'Free'} · ★${p.rating}`).join('\n\n');
  }
  if (/weather|when|season|best time/.test(s)) {
    return `The best window for ${name} is **${city.bestTime}**. Outside that, mornings are still workable — start by 7am and keep afternoons for indoor sights.`;
  }
  if (/cost|budget|money|cheap|expensive/.test(s)) {
    return `${name} runs roughly ${money(city.pricePerDay.budget)}/day on a budget, ${money(city.pricePerDay.mid)}/day mid-range and ${money(city.pricePerDay.luxury)}/day for luxury — that's stay, food and local transport, not intercity travel.`;
  }
  return GUIDE_REPLIES[Math.floor(Math.random() * GUIDE_REPLIES.length)](name);
}

function render(text) {
  return text.split('\n').map((line, i) => (
    <div key={i} style={{ minHeight: line ? undefined : 10 }}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith('**')
          ? <b key={j}>{part.slice(2, -2)}</b>
          : <span key={j}>{part}</span>)}
    </div>
  ));
}

export default function Chat({ cityId, tripId }) {
  const { pop, chats, setChats, trips } = useApp();
  const city = cityById(cityId);
  const trip = trips.find((t) => t.id === tripId);
  const key = tripId || cityId;
  const msgs = chats[key] || [];
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length, typing]);

  const used = msgs.filter((m) => m.role === 'user').length;
  const left = Math.max(0, QUOTA - used);

  const send = async (q) => {
    const question = (q ?? text).trim();
    if (!question || !left) return;
    setText('');
    const next = [...msgs, { role: 'user', text: question }];
    setChats((c) => ({ ...c, [key]: next }));
    setTyping(true);

    try {
      // Try Cloud Function (Claude AI) first
      const res = await api.chatWithLocalGuide({ cityId, tripId, message: question });
      if (res?.reply) {
        setTyping(false);
        setChats((c) => ({ ...c, [key]: [...next, { role: 'ai', text: res.reply }] }));
        return;
      }
    } catch (e) {
      console.warn('[Chat] Cloud chatWithLocalGuide fallback to local knowledge base:', e);
    }

    // Fallback to local guide knowledge base
    setTimeout(() => {
      setTyping(false);
      setChats((c) => ({ ...c, [key]: [...next, { role: 'ai', text: answer(question, city, trip) }] }));
    }, 600);
  };

  const examples = [
    `What's the best street food in ${city.name}?`,
    'How do I get around cheaply?',
    'Where should I stay?',
  ];

  return (
    <div className="screen noTabs" style={{ display: 'flex', flexDirection: 'column', padding: 0, height: '100dvh' }}>
      <div className="chatHead">
        <button className="row" onClick={pop} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--card)', justifyContent: 'center' }}>
          <I.IBack size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <span className="label gold">Local guide</span>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{city.name}</div>
        </div>
        <span className="quota"><I.ISpark size={14} />{left}/{QUOTA}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 20px' }}>
        {!msgs.length && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div className="iconCirc" style={{ width: 78, height: 78, margin: '0 auto 20px' }}><I.ISpark size={30} /></div>
            <h2>Ask your local guide</h2>
            <p className="sub" style={{ maxWidth: 320, margin: '0 auto 26px' }}>
              Try: “What's the best street food here?” or “How do I get from the airport to my hotel?”
            </p>
            {examples.map((e) => (
              <button key={e} className="listRow" onClick={() => send(e)} style={{ textAlign: 'left' }}>
                <I.ISpark size={18} color="var(--gold)" />
                <span style={{ flex: 1, fontSize: 14 }}>{e}</span>
                <I.IChevron size={16} color="var(--muted2)" />
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={'msg ' + (m.role === 'user' ? 'me' : 'ai')}>{render(m.text)}</div>
        ))}
        {typing && <div className="msg ai" style={{ color: 'var(--muted)' }}>Thinking…</div>}
        <div ref={endRef} />
      </div>

      <div className="chatInput">
        <div className="inputWrap">
          <input value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={left ? 'Ask anything...' : 'Daily question limit reached'} disabled={!left} />
        </div>
        <button className="sendBtn" onClick={() => send()} disabled={!left}><I.ISend size={20} /></button>
      </div>
    </div>
  );
}
