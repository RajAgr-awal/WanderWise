/**
 * Share & Export sheet for a trip, plus the "shared trip" import banner.
 */
import { useEffect, useState } from 'react';
import * as I from '../icons.jsx';
import { Modal } from '../components.jsx';
import { useApp } from '../store.jsx';
import { buildShareUrl, copyText, shareUrl } from '../lib/share.js';
import {
  exportTripPdf, exportTripIcs, exportOfflineGuide, exportTripJson,
} from '../lib/exporters.js';
import { precacheImages } from '../lib/pwa.js';
import { cityById, money } from '../data.js';

function Action({ icon, title, subtitle, onClick, busy, done }) {
  return (
    <button className="listRow" onClick={onClick} disabled={busy}
      style={{ opacity: busy ? 0.6 : 1, alignItems: 'flex-start' }}>
      <span style={{ color: done ? '#5bbd7a' : 'var(--gold)', marginTop: 2 }}>
        {done ? <I.ICheck size={20} /> : icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 700 }}>{title}</span>
        <span className="tiny" style={{ display: 'block', marginTop: 2, whiteSpace: 'normal' }}>
          {busy ? 'Working…' : subtitle}
        </span>
      </span>
      <I.IChevron size={16} color="var(--muted2)" />
    </button>
  );
}

export default function ShareExport({ trip, onClose }) {
  const { user, notify } = useApp();
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(null);
  const [done, setDone] = useState({});
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    buildShareUrl(trip, { author: user?.name })
      .then((u) => { if (alive) setUrl(u); })
      .catch((e) => { if (alive) setErr(e.message); });
    return () => { alive = false; };
  }, [trip, user]);

  const mark = (key) => {
    setDone((d) => ({ ...d, [key]: true }));
    setTimeout(() => setDone((d) => ({ ...d, [key]: false })), 2200);
  };

  const run = async (key, fn, successMsg) => {
    setBusy(key);
    setErr('');
    try {
      await fn();
      mark(key);
      if (successMsg) notify(successMsg);
    } catch (e) {
      setErr(e.message || 'That did not work.');
    } finally {
      setBusy(null);
    }
  };

  const onShare = () => run('share', async () => {
    const res = await shareUrl({
      title: `${trip.title} — WanderWise`,
      text: `My ${trip.durationDays}-day ${trip.title} itinerary`,
      url,
    });
    if (res === 'copied') notify('Link copied to clipboard');
    else if (res === 'failed') throw new Error('Could not share or copy the link.');
  });

  const onSaveOffline = () => run('offline', async () => {
    const urls = trip.cityIds.map((c) => cityById(c)?.hero).filter(Boolean);
    const res = await precacheImages(urls);
    notify(res.count ? `${res.count} photo${res.count > 1 ? 's' : ''} saved offline` : 'Offline cache updated');
  });

  return (
    <Modal title="Share & export" icon={<I.IShare size={20} color="var(--gold)" />} onClose={onClose}>
      <p className="sub" style={{ margin: '4px 0 18px' }}>
        {trip.title} · {trip.durationDays} days · {money(trip.estimatedTotal)}
      </p>

      {err && <p className="err" style={{ marginTop: 0 }}>{err}</p>}

      <span className="label">Share link</span>
      <div className="inputWrap" style={{ margin: '9px 0 8px', borderRadius: 14 }}>
        <I.ILink size={18} color="#7a7a7a" />
        <input readOnly value={url || 'Preparing link…'} onFocus={(e) => e.target.select()}
          style={{ fontSize: 13 }} />
      </div>
      <p className="tiny" style={{ marginBottom: 16 }}>
        The whole itinerary travels inside the link — no account needed to open it.
      </p>

      <div className="row" style={{ gap: 10, marginBottom: 22 }}>
        <button className="btn soft" disabled={!url} onClick={onShare}>
          <I.IShare size={17} /> Share
        </button>
        <button className="btn" disabled={!url}
          onClick={() => run('copy', async () => {
            if (!(await copyText(url))) throw new Error('Clipboard blocked by the browser.');
            notify('Link copied');
          })}>
          {done.copy ? <I.ICheck size={17} /> : <I.ICopy size={17} />} Copy
        </button>
      </div>

      <span className="label" style={{ display: 'block', marginBottom: 10 }}>Export</span>

      <Action icon={<I.IDoc size={20} />} title="PDF itinerary"
        subtitle="Print-ready day-by-day plan with prices"
        busy={busy === 'pdf'} done={done.pdf}
        onClick={() => run('pdf', () => exportTripPdf(trip, { author: user?.name }), 'PDF downloaded')} />

      <Action icon={<I.ICal size={20} />} title="Add to calendar (.ics)"
        subtitle="Every stop as an event with a 30-min reminder — Google, Apple or Outlook"
        busy={busy === 'ics'} done={done.ics}
        onClick={() => run('ics', () => exportTripIcs(trip), 'Calendar file downloaded')} />

      <Action icon={<I.IDownload size={20} />} title="Offline guide (HTML)"
        subtitle="One self-contained file that opens with no signal"
        busy={busy === 'guide'} done={done.guide}
        onClick={() => run('guide', () => exportOfflineGuide(trip, { author: user?.name }), 'Offline guide downloaded')} />

      <Action icon={<I.ICloudOff size={20} />} title="Save photos for offline"
        subtitle="Cache this trip's images so the app looks right without data"
        busy={busy === 'offline'} done={done.offline}
        onClick={onSaveOffline} />

      <Action icon={<I.IBookmark size={20} />} title="Backup as JSON"
        subtitle="Raw trip data you can re-import later"
        busy={busy === 'json'} done={done.json}
        onClick={() => run('json', () => exportTripJson(trip), 'Backup downloaded')} />

      <button className="btn ghost" style={{ marginTop: 18 }} onClick={onClose}>Done</button>
    </Modal>
  );
}

/** Banner shown when the app is opened via a share link. */
export function SharedTripBanner({ trip, onSave, onDismiss }) {
  return (
    <div className="card fadeIn" style={{
      margin: '0 22px 18px', borderColor: 'var(--gold-dim)',
      background: 'linear-gradient(120deg,rgba(224,194,80,.15),rgba(224,194,80,.04))',
    }}>
      <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <span className="iconCirc" style={{ width: 42, height: 42, flex: '0 0 42px' }}>
          <I.IShare size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="label gold">Shared with you</span>
          <div style={{ fontWeight: 700, fontSize: 17, margin: '3px 0' }}>{trip.title}</div>
          <p className="tiny" style={{ margin: 0 }}>
            {trip.sharedBy ? `${trip.sharedBy} shared ` : 'Someone shared '}
            a {trip.durationDays}-day plan · {money(trip.estimatedTotal)}
          </p>
        </div>
      </div>
      <div className="row" style={{ gap: 10, marginTop: 14 }}>
        <button className="btn ghost sm" style={{ flex: 1 }} onClick={onDismiss}>Dismiss</button>
        <button className="btn sm" style={{ flex: 1 }} onClick={onSave}>
          <I.IPlus size={16} /> Save to My Trips
        </button>
      </div>
    </div>
  );
}
