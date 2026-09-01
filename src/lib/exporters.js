/**
 * Export helpers — PDF, .ics calendar and a self-contained offline HTML guide.
 *
 * All three are generated in the browser with zero dependencies, so they work
 * offline and keep the static deploy tiny.
 *
 * The PDF is written as raw PDF 1.4 bytes (no jsPDF). We only need text, rules
 * and filled rectangles, which is a few hundred lines of PDF operators — far
 * cheaper than shipping a ~300 KB library into a travel app people use on data.
 */

import { cityById, money, TIER_LABEL } from '../data.js';

// ============================================================ shared helpers
const pad = (n) => String(n).padStart(2, '0');

export function tripDates(trip) {
  const start = trip.startDate ? new Date(trip.startDate) : new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: trip.durationDays }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

const download = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
};

export const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

/** Items the traveller has kept ticked. */
const activeItems = (trip) =>
  trip.days.map((d) => ({
    ...d,
    items: d.items.filter((it) => !(trip.excluded || []).includes(it.id)),
  }));

// ============================================================ 1. PDF
//
// Minimal PDF writer. WinAnsi text, Helvetica family, with page breaks.

const PAGE_W = 595.28;   // A4 points
const PAGE_H = 841.89;
const MARGIN = 48;

/** Escape a string for a PDF literal and drop characters WinAnsi can't show. */
function pdfEscape(s) {
  return String(s)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/₹/g, 'Rs.')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

// Helvetica advance widths (1/1000 em) for the printable ASCII range — needed for
// accurate word wrapping.
const W_REG = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const W_BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];

const charWidth = (ch, bold) => {
  const c = ch.charCodeAt(0);
  if (c < 32 || c > 126) return bold ? 556 : 556;
  return (bold ? W_BOLD : W_REG)[c - 32];
};

const textWidth = (text, size, bold) => {
  let w = 0;
  for (const ch of text) w += charWidth(ch, bold);
  return (w / 1000) * size;
};

function wrapText(text, size, bold, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (textWidth(test, size, bold) <= maxWidth) { line = test; continue; }
    if (line) lines.push(line);
    // Break a single over-long word.
    if (textWidth(word, size, bold) > maxWidth) {
      let chunk = '';
      for (const ch of word) {
        if (textWidth(chunk + ch, size, bold) > maxWidth) { lines.push(chunk); chunk = ch; }
        else chunk += ch;
      }
      line = chunk;
    } else line = word;
  }
  if (line) lines.push(line);
  return lines;
}

class PdfDoc {
  constructor() {
    this.pages = [];
    this.ops = [];
    this.y = PAGE_H - MARGIN;
  }
  _newPage() {
    this.pages.push(this.ops.join('\n'));
    this.ops = [];
    this.y = PAGE_H - MARGIN;
  }
  ensure(space) {
    if (this.y - space < MARGIN + 24) this._newPage();
  }
  rect(x, y, w, h, [r, g, b]) {
    this.ops.push(`${r} ${g} ${b} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }
  line(x1, y1, x2, y2, [r, g, b], width = 0.7) {
    this.ops.push(`${r} ${g} ${b} RG ${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }
  text(str, x, y, { size = 10, bold = false, color = [0.1, 0.1, 0.1] } = {}) {
    const font = bold ? '/F2' : '/F1';
    const [r, g, b] = color;
    this.ops.push(`BT ${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEscape(str)}) Tj ET`);
  }
  /** Wrapped paragraph; returns height consumed. */
  para(str, x, width, { size = 10, bold = false, color = [0.25, 0.25, 0.25], leading = 1.35 } = {}) {
    const lines = wrapText(str, size, bold, width);
    for (const ln of lines) {
      this.ensure(size * leading);
      this.y -= size * leading;
      this.text(ln, x, this.y, { size, bold, color });
    }
    return lines.length * size * leading;
  }
  build(title) {
    this.pages.push(this.ops.join('\n'));
    const objects = [];
    const pageCount = this.pages.length;
    const kids = [];
    // 1 catalog, 2 pages node, 3 F1, 4 F2, then per page: content + page obj
    for (let i = 0; i < pageCount; i++) kids.push(`${5 + i * 2 + 1} 0 R`);

    objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
    objects[2] = `<< /Type /Pages /Count ${pageCount} /Kids [${kids.join(' ')}] >>`;
    objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;
    objects[4] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`;
    objects[5] = `<< /Title (${pdfEscape(title)}) /Producer (WanderWise) /Creator (WanderWise) >>`;

    this.pages.forEach((content, i) => {
      const contentObj = 5 + i * 2 + 1 - 1 + 1; // 6, 8, 10...
      const cIdx = 6 + i * 2;
      const pIdx = 7 + i * 2;
      objects[cIdx] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
      objects[pIdx] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${cIdx} 0 R >>`;
    });

    // Fix the Kids array now that indices are known.
    objects[2] = `<< /Type /Pages /Count ${pageCount} /Kids [${
      this.pages.map((_, i) => `${7 + i * 2} 0 R`).join(' ')}] >>`;

    let pdf = '%PDF-1.4\n';
    const offsets = [];
    for (let i = 1; i < objects.length; i++) {
      if (!objects[i]) continue;
      offsets[i] = pdf.length;
      pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
    }
    const xrefPos = pdf.length;
    const maxObj = objects.length;
    pdf += `xref\n0 ${maxObj}\n0000000000 65535 f \n`;
    for (let i = 1; i < maxObj; i++) {
      pdf += offsets[i]
        ? `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
        : `0000000000 65535 f \n`;
    }
    pdf += `trailer\n<< /Size ${maxObj} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
    return new Blob([pdf], { type: 'application/pdf' });
  }
}

const GOLD = [0.78, 0.68, 0.28];
const DARK = [0.11, 0.11, 0.11];
const GREY = [0.42, 0.42, 0.42];

export function exportTripPdf(trip, { author } = {}) {
  const doc = new PdfDoc();
  const contentW = PAGE_W - MARGIN * 2;
  const dates = tripDates(trip);
  const days = activeItems(trip);

  // ---- cover header
  doc.rect(0, PAGE_H - 132, PAGE_W, 132, [0.06, 0.06, 0.06]);
  doc.text('WANDERWISE', MARGIN, PAGE_H - 46, { size: 9, bold: true, color: GOLD });
  doc.text(trip.title, MARGIN, PAGE_H - 78, { size: 26, bold: true, color: [1, 1, 1] });
  const sub = `${trip.durationDays} days  ·  ${TIER_LABEL[trip.budgetTier]}  ·  ` +
              `${money(trip.estimatedTotal)} estimated`;
  doc.text(sub, MARGIN, PAGE_H - 98, { size: 10, color: [0.75, 0.75, 0.75] });
  doc.text(trip.cityIds.map((c) => cityById(c)?.name).filter(Boolean).join('  >  '),
    MARGIN, PAGE_H - 116, { size: 9, color: GOLD });
  doc.y = PAGE_H - 132 - 26;

  if (author) {
    doc.text(`Shared by ${author}`, MARGIN, doc.y, { size: 9, color: GREY });
    doc.y -= 18;
  }

  // ---- per-day sections
  days.forEach((day, idx) => {
    doc.ensure(92);
    doc.y -= 12;

    const date = dates[idx];
    const dateStr = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    doc.rect(MARGIN, doc.y - 5, contentW, 24, [0.96, 0.94, 0.86]);
    doc.text(`DAY ${day.day}`, MARGIN + 9, doc.y + 2, { size: 11, bold: true, color: [0.35, 0.29, 0.05] });
    const cityName = cityById(day.cityId)?.name || '';
    doc.text(`${cityName}  ·  ${dateStr}`,
      MARGIN + 68, doc.y + 2, { size: 9.5, color: [0.4, 0.36, 0.2] });
    doc.y -= 20;

    day.items.forEach((item) => {
      doc.ensure(58);
      doc.y -= 15;
      doc.text(item.slot.toUpperCase(), MARGIN, doc.y, { size: 7.5, bold: true, color: GOLD });

      const priceStr = item.priceLabel || '';
      const pw = textWidth(priceStr, 9.5, true);
      doc.text(priceStr, PAGE_W - MARGIN - pw, doc.y, { size: 9.5, bold: true, color: DARK });

      doc.y -= 14;
      doc.text(item.name, MARGIN, doc.y, { size: 12.5, bold: true, color: DARK });

      if (item.rating) {
        const nameW = textWidth(item.name, 12.5, true);
        doc.text(`* ${item.rating}`, MARGIN + nameW + 8, doc.y, { size: 8.5, color: GOLD });
      }
      if (item.tag) {
        doc.y -= 11;
        doc.text(item.tag, MARGIN, doc.y, { size: 8.5, color: GREY });
      }
      if (item.description) {
        doc.para(item.description, MARGIN, contentW, { size: 9, color: [0.3, 0.3, 0.3] });
      }
      if (item.mustTry) {
        doc.para(`Must try: ${item.mustTry}`, MARGIN, contentW, { size: 9, bold: true, color: [0.35, 0.29, 0.05] });
      }
      doc.y -= 5;
      doc.line(MARGIN, doc.y, PAGE_W - MARGIN, doc.y, [0.9, 0.9, 0.9], 0.5);
    });
  });

  // ---- practical info
  const city = cityById(trip.cityIds[0]);
  if (city) {
    doc.ensure(120);
    doc.y -= 24;
    doc.text('PRACTICAL INFORMATION', MARGIN, doc.y, { size: 10, bold: true, color: GOLD });
    doc.y -= 6;
    doc.para(`Best time to visit: ${city.bestTime}`, MARGIN, contentW, { size: 9.5 });
    doc.para(`Languages: ${city.languages.join(', ')}`, MARGIN, contentW, { size: 9.5 });
    doc.para(`Emergency (India): 112 unified  ·  Police 100  ·  Ambulance 108  ·  Tourist helpline 1363`,
      MARGIN, contentW, { size: 9.5 });
    doc.para('Prices are estimates and change frequently. Confirm with the venue before you travel.',
      MARGIN, contentW, { size: 8.5, color: GREY });
  }

  const blob = doc.build(trip.title);
  download(blob, `wanderwise-${slugify(trip.title)}.pdf`);
  return blob;
}

// ============================================================ 2. .ics calendar
//
// RFC 5545. One VEVENT per itinerary item, with per-slot default times.

const SLOT_TIMES = {
  Morning: [9, 0, 2.5], Afternoon: [14, 0, 2.5], Lunch: [12, 30, 1.5],
  Evening: [17, 30, 2], Dinner: [20, 0, 1.5], Night: [20, 0, 2],
};

const icsEscape = (s) => String(s)
  .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,')
  .replace(/\r?\n/g, '\\n');

/**
 * Fold lines at 75 *octets* per RFC 5545 §3.1.
 *
 * The limit is bytes, not characters, so '₹' (3 bytes) and '·' (2 bytes) count
 * for more than one. We also must never split a multi-byte UTF-8 sequence across
 * a fold, or the calendar client renders mojibake.
 */
const fold = (line) => {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;

  const out = [];
  let current = '';
  let bytes = 0;
  let limit = 75; // continuation lines start with a space, so their budget is 74 + 1

  for (const ch of line) {           // iterate by code point, never by UTF-16 unit
    const size = enc.encode(ch).length;
    if (bytes + size > limit) {
      out.push(current);
      current = ch;
      bytes = size;
      limit = 74;                    // subsequent lines are prefixed with ' '
    } else {
      current += ch;
      bytes += size;
    }
  }
  if (current) out.push(current);
  return out[0] + out.slice(1).map((l) => '\r\n ' + l).join('');
};

const icsLocal = (d) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

const icsUtc = (d) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T` +
  `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

export function buildIcs(trip) {
  const dates = tripDates(trip);
  const stamp = icsUtc(new Date());
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//WanderWise//Trip Itinerary//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(trip.title)} — WanderWise`,
    'X-WR-TIMEZONE:Asia/Kolkata',
  ];

  activeItems(trip).forEach((day) => {
    const base = dates[day.day - 1];
    const cityName = cityById(day.cityId)?.name || '';
    day.items.forEach((item, i) => {
      const [h, m, durH] = SLOT_TIMES[item.slot] || [10 + i, 0, 2];
      const start = new Date(base);
      start.setHours(h, m, 0, 0);
      const end = new Date(start.getTime() + durH * 3600 * 1000);

      const desc = [
        item.description,
        item.mustTry ? `Must try: ${item.mustTry}` : '',
        item.priceLabel ? `Approx cost: ${item.priceLabel}` : '',
        item.rating ? `Rating: ${item.rating}/5` : '',
        '', `Day ${day.day} · ${item.slot} · Planned with WanderWise`,
      ].filter(Boolean).join('\n');

      lines.push(
        'BEGIN:VEVENT',
        `UID:${trip.id}-${item.id}@wanderwise.app`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${icsLocal(start)}`,
        `DTEND:${icsLocal(end)}`,
        fold(`SUMMARY:${icsEscape(item.name)}`),
        fold(`DESCRIPTION:${icsEscape(desc)}`),
        fold(`LOCATION:${icsEscape([item.tag, cityName].filter(Boolean).join(', '))}`),
        `CATEGORIES:${icsEscape(item.slot)}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY',
        fold(`DESCRIPTION:${icsEscape(item.name)} in 30 minutes`), 'END:VALARM',
        'END:VEVENT',
      );
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function exportTripIcs(trip) {
  const blob = new Blob([buildIcs(trip)], { type: 'text/calendar;charset=utf-8' });
  download(blob, `wanderwise-${slugify(trip.title)}.ics`);
  return blob;
}

// ============================================================ 3. offline guide
//
// A single self-contained HTML file: inline CSS, no network requests. Works from
// a phone's Files app with zero signal.

export function buildOfflineGuide(trip, { author } = {}) {
  const dates = tripDates(trip);
  const days = activeItems(trip);
  const city = cityById(trip.cityIds[0]);
  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const dayHtml = days.map((day, idx) => `
    <section class="day">
      <div class="dayhead"><span class="num">${day.day}</span>
        <div><h2>Day ${day.day}</h2>
        <p class="muted">${esc(cityById(day.cityId)?.name || '')} · ${
          dates[idx].toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div>
      </div>
      ${day.items.map((it) => `
        <article class="item">
          <div class="row"><span class="slot">${esc(it.slot)}</span>
            ${it.rating ? `<span class="rate">★ ${it.rating}</span>` : ''}</div>
          <h3>${esc(it.name)}</h3>
          <p class="tag">${esc(it.tag || '')}</p>
          <p>${esc(it.description || '')}</p>
          ${it.mustTry ? `<p class="must">Must try: ${esc(it.mustTry)}</p>` : ''}
          <p class="price">${esc(it.priceLabel || '')}</p>
        </article>`).join('')}
    </section>`).join('');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(trip.title)} — WanderWise offline guide</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#0a0a0a;color:#f0f0f0;font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
.wrap{max-width:680px;margin:0 auto;padding:0 20px 60px}
header{background:#111;margin:0 -20px 24px;padding:34px 20px;border-bottom:1px solid #262626}
.brand{color:#e0c250;font-size:11px;font-weight:800;letter-spacing:.3em}
h1{font-size:32px;margin:10px 0 6px;letter-spacing:-.02em}
.muted{color:#9a9a9a;font-size:13px;margin:0}
.badge{display:inline-block;background:rgba(224,194,80,.13);border:1px solid #8a7530;color:#e0c250;
  padding:5px 12px;border-radius:99px;font-size:12px;font-weight:700;margin-top:12px}
.day{margin-top:34px}
.dayhead{display:flex;gap:14px;align-items:center;margin-bottom:14px}
.num{width:36px;height:36px;flex:0 0 36px;border-radius:50%;background:#e0c250;color:#111;
  display:grid;place-items:center;font-weight:800}
h2{font-size:20px;margin:0}
.item{background:#151515;border:1px solid #242424;border-radius:14px;padding:15px;margin-bottom:11px}
.row{display:flex;justify-content:space-between;align-items:center}
.slot{color:#e0c250;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.rate{color:#e0c250;font-size:12px;font-weight:700}
h3{font-size:18px;margin:6px 0 2px}
.tag{color:#6e6e6e;font-size:12px;margin:0 0 7px}
.item p{margin:0 0 5px;color:#c4c4c4;font-size:14px}
.must{color:#f0f0f0!important;font-weight:600}
.price{color:#e0c250!important;font-weight:700;margin-top:8px!important}
.info{background:#151515;border:1px solid #242424;border-radius:14px;padding:18px;margin-top:34px}
.info h2{font-size:15px;color:#e0c250;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px}
.info dt{color:#9a9a9a;font-size:12px;margin-top:10px}
.info dd{margin:2px 0 0;font-size:14px}
footer{text-align:center;color:#5a5a5a;font-size:12px;margin-top:40px}
@media print{body{background:#fff;color:#000}.item,.info{background:#fff;border-color:#ddd}
  header{background:#fff;color:#000}h1{color:#000}.item p{color:#333}}
</style></head><body><div class="wrap">
<header>
  <div class="brand">WANDERWISE</div>
  <h1>${esc(trip.title)}</h1>
  <p class="muted">${trip.durationDays} days · ${esc(TIER_LABEL[trip.budgetTier])} · ${
    esc(money(trip.estimatedTotal))} estimated</p>
  <p class="muted">${esc(trip.cityIds.map((c) => cityById(c)?.name).filter(Boolean).join(' → '))}</p>
  ${author ? `<p class="muted">Shared by ${esc(author)}</p>` : ''}
  <span class="badge">Works offline — no signal needed</span>
</header>
${dayHtml}
<div class="info">
  <h2>Practical information</h2>
  <dl>
    <dt>Best time to visit</dt><dd>${esc(city?.bestTime || '—')}</dd>
    <dt>Languages</dt><dd>${esc(city?.languages.join(', ') || '—')}</dd>
    <dt>Emergency numbers (India)</dt>
    <dd>112 unified · Police 100 · Ambulance 108 · Tourist helpline 1363</dd>
    <dt>Note</dt><dd>Prices are estimates and change frequently. Confirm before you travel.</dd>
  </dl>
</div>
<footer>Generated by WanderWise on ${new Date().toLocaleDateString('en-IN')}</footer>
</div></body></html>`;
}

export function exportOfflineGuide(trip, opts) {
  const blob = new Blob([buildOfflineGuide(trip, opts)], { type: 'text/html;charset=utf-8' });
  download(blob, `wanderwise-${slugify(trip.title)}-offline.html`);
  return blob;
}

// ============================================================ 4. JSON backup
export function exportTripJson(trip) {
  const blob = new Blob([JSON.stringify(trip, null, 2)], { type: 'application/json' });
  download(blob, `wanderwise-${slugify(trip.title)}.json`);
  return blob;
}
