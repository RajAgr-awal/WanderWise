import { useState } from 'react';
import * as I from '../icons.jsx';
import { Modal, InfoPage, Empty } from '../components.jsx';
import { useApp } from '../store.jsx';
import { cityById, money } from '../data.js';
import { authApi, api } from '../api/wanderwiseApi.js';

const PRIVACY = [
  { h: 'What we collect', p: 'Your name, email address and the trips, templates and chat messages you create in WanderWise. We do not collect payment data — v0 has no booking or payments.' },
  { h: 'How we use it', p: 'To generate and store your itineraries, personalise recommendations, and answer your Local Guide questions. We do not sell your data or use it for advertising.' },
  { h: 'Third parties', p: 'Itinerary generation and the AI Local Guide are powered by the Claude API (Anthropic). Trip content you submit is sent to that service to produce a response. Authentication, database and file storage run on Google Firebase.' },
  { h: 'Your rights', p: 'You can edit your name, export or delete individual trips, and permanently delete your account and all associated data from this screen at any time.' },
  { h: 'Security', p: 'Data is encrypted in transit and at rest. Access to your documents is restricted to your authenticated account through Firebase security rules and App Check.' },
  { h: 'Contact', p: 'Questions about your data: privacy@wanderwise.app' },
];

const TERMS = [
  { h: 'The service', p: 'WanderWise provides AI-assisted travel itineraries, curated tour suggestions and destination guidance. It is a planning aid, not a travel agency.' },
  { h: 'Accuracy', p: 'Prices, opening hours, ratings and travel times are estimates that change frequently. Always confirm with the venue or operator before you rely on them.' },
  { h: 'Acceptable use', p: 'One account per person. Do not scrape, resell or automate access to the service, and do not use the Local Guide to generate unlawful content.' },
  { h: 'AI-generated content', p: 'Itineraries and chat answers are machine-generated and may contain errors. You are responsible for verifying anything safety- or money-critical.' },
  { h: 'Liability', p: 'WanderWise is provided "as is". We are not liable for losses arising from travel decisions made using the app.' },
  { h: 'Changes', p: 'We may update these terms; continued use after an update constitutes acceptance.' },
];

const SUPPORT = [
  { h: 'Email support', p: 'help@wanderwise.app — we reply within one business day.' },
  { h: 'In-app', p: 'Use the Local Guide chat for destination questions; use email for account, billing or bug reports.' },
  { h: 'Emergency numbers (India)', p: 'Unified emergency helpline: 112 · Police: 100 · Ambulance: 108 · Tourist helpline: 1363 (toll-free, multilingual, 24×7).' },
  { h: 'Lost documents abroad', p: 'Contact your nearest embassy or consulate first, then file a local police report — most insurers require both.' },
];

const ProfileRow = ({ icon, label, onClick, danger }) => (
  <button className="listRow" onClick={onClick} style={danger ? { borderColor: 'rgba(224,82,82,.35)', color: 'var(--danger)' } : undefined}>
    <span style={{ color: danger ? 'var(--danger)' : 'var(--gold)' }}>{icon}</span>
    <span style={{ flex: 1, fontWeight: 600 }}>{label}</span>
    <I.IChevron size={16} color="var(--muted2)" />
  </button>
);

export default function Profile() {
  const { user, setUser, templates, setTemplates, trips, setTrips, setChats, push, notify } = useApp();
  const [page, setPage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [confirmDel, setConfirmDel] = useState(false);

  if (page === 'privacy') return <InfoPage title="Privacy Policy" sections={PRIVACY} onBack={() => setPage(null)} />;
  if (page === 'terms') return <InfoPage title="Terms of Service" sections={TERMS} onBack={() => setPage(null)} />;
  if (page === 'support') return <InfoPage title="Contact Support" sections={SUPPORT} onBack={() => setPage(null)} />;

  if (page === 'templates') {
    return (
      <div className="screen fadeIn">
        <div className="pad" style={{ paddingTop: 30 }}>
          <button onClick={() => setPage(null)} className="row gold" style={{ marginBottom: 18 }}>
            <I.IBack size={18} /> Back
          </button>
          <h1 style={{ fontSize: 32 }}>My Templates</h1>
          <p className="sub" style={{ marginBottom: 24 }}>Saved routes, in the order you saved them.</p>
          {!templates.length && (
            <Empty icon={<I.IBookmark size={28} color="var(--gold)" />} title="No templates yet"
              text="Build a route in “Design your own tour” and tap Save as template." />
          )}
          {templates.map((t) => (
            <div className="card" key={t.id} style={{ marginBottom: 12 }}>
              <div className="between">
                <h3>{t.name}</h3>
                <button onClick={() => setTemplates(templates.filter((x) => x.id !== t.id))} style={{ color: 'var(--danger)' }}>
                  <I.ITrash size={18} />
                </button>
              </div>
              {t.notes && <p className="sub" style={{ fontSize: 14, marginTop: 6 }}>{t.notes}</p>}
              <p className="tiny" style={{ marginTop: 8 }}>
                {t.legs.map((l) => `${cityById(l.cityId).name} ${l.days}d`).join(' → ')}
              </p>
              <div className="between" style={{ marginTop: 12 }}>
                <span className="tiny gold" style={{ fontWeight: 700 }}>
                  {money(t.legs.reduce((s, l) => s + cityById(l.cityId).pricePerDay[t.tier] * l.days, 0))} · {t.tier}
                </span>
                <button className="btn soft sm" onClick={() => push({ type: 'builder', preset: { legs: t.legs, tier: t.tier } })}>
                  Reuse route
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="pad" style={{ paddingTop: 44 }}>
        <span className="wordmark">Wanderwise</span>
        <h1 style={{ fontSize: 34 }}>Profile</h1>

        <div className="card row" style={{ marginTop: 20, gap: 16, padding: 18 }}>
          <span className="iconCirc" style={{ width: 58, height: 58, flex: '0 0 58px' }}><I.IUser size={26} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 21, fontWeight: 700 }}>{user?.name}</span>
            <span className="tiny" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</span>
            <button className="gold tiny" style={{ fontWeight: 700, marginTop: 4 }}
              onClick={() => { setName(user?.name || ''); setEditing(true); }}>Tap to edit name</button>
          </span>
        </div>

        <div className="row" style={{ gap: 10, marginTop: 14 }}>
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <div className="gold" style={{ fontSize: 24, fontWeight: 800 }}>{trips.length}</div>
            <div className="tiny">Trips</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <div className="gold" style={{ fontSize: 24, fontWeight: 800 }}>{templates.length}</div>
            <div className="tiny">Templates</div>
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <span className="label" style={{ display: 'block', marginBottom: 12 }}>Mobile App</span>
          <a
            href="https://github.com/RajAgr-awal/WanderWise/releases/download/latest-apk/WanderWise.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="card row"
            style={{ padding: 14, gap: 14, textDecoration: 'none', color: 'inherit' }}
          >
            <span className="iconCirc" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>
              <I.ISpark size={20} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Download Android App (APK)</div>
              <div className="tiny">v1.0.0 · ~10 MB · Offline-Ready Native App</div>
            </div>
            <I.IArrow size={18} color="var(--gold)" />
          </a>
        </div>

        <div style={{ marginTop: 30 }}>
          <span className="label" style={{ display: 'block', marginBottom: 12 }}>Account</span>
          <ProfileRow icon={<I.IBookmark size={20} />} label="My Templates" onClick={() => setPage('templates')} />
          <ProfileRow icon={<I.IShield size={20} />} label="Privacy Policy" onClick={() => setPage('privacy')} />
          <ProfileRow icon={<I.IDoc size={20} />} label="Terms of Service" onClick={() => setPage('terms')} />
          <ProfileRow icon={<I.IPhone size={20} />} label="Contact Support" onClick={() => setPage('support')} />
        </div>

        <div style={{ marginTop: 30 }}>
          <span className="label" style={{ display: 'block', marginBottom: 12 }}>Session</span>
          <ProfileRow icon={<I.ILogout size={20} />} label="Log out" onClick={async () => {
            try { await authApi.signOut(); } catch (_) {}
            setUser(null);
          }} />
        </div>

        <div style={{ marginTop: 30 }}>
          <span className="label" style={{ display: 'block', marginBottom: 12, color: 'var(--danger)' }}>Danger zone</span>
          <ProfileRow icon={<I.ITrash size={20} />} label="Delete account" danger onClick={() => setConfirmDel(true)} />
        </div>

        <p className="tiny" style={{ textAlign: 'center', marginTop: 34 }}>WanderWise v1.0.0</p>
      </div>

      {editing && (
        <Modal title="Edit name" icon={<I.IUser size={20} color="var(--gold)" />} onClose={() => setEditing(false)}>
          <div className="inputWrap" style={{ margin: '16px 0 20px' }}>
            <I.IUser size={20} color="#7a7a7a" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="row" style={{ gap: 14 }}>
            <button className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn" onClick={() => { setUser({ ...user, name: name.trim() || user.name }); setEditing(false); notify('Name updated'); }}>Save</button>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Delete account" icon={<I.ITrash size={20} color="var(--danger)" />} onClose={() => setConfirmDel(false)}>
          <p className="sub" style={{ margin: '10px 0 22px' }}>
            This permanently removes your profile, {trips.length} trip{trips.length !== 1 && 's'}, {templates.length} template{templates.length !== 1 && 's'} and all chat history. This cannot be undone.
          </p>
          <div className="row" style={{ gap: 14 }}>
            <button className="btn ghost" onClick={() => setConfirmDel(false)}>Cancel</button>
            <button className="btn danger" onClick={async () => {
              try {
                await api.deleteAccount();
              } catch (_) {}
              setTrips([]); setTemplates([]); setChats({});
              try { await authApi.signOut(); } catch (_) {}
              setUser(null);
            }}>
              Delete forever
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
