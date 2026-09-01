/**
 * 4.6 chatWithLocalGuide (callable)
 *
 * Retrieval-augmented generation strictly scoped to the traveller's own trip:
 * the grounding context is their itinerary, budget and the city's curated
 * culture/food/stay/transport/market docs. The model is instructed not to answer
 * from generic world knowledge, so advice stays consistent with what the app shows.
 */
const { onCall } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { db, FieldValue } = require('../lib/firebase');
const { requireAuth, requireString, HttpsError } = require('../lib/errors');
const claude = require('../lib/claudeClient');

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

const DAILY_QUOTA = 20;      // matches the "20/20" counter in the UI
const HISTORY_LIMIT = 12;    // turns of context sent to the model
const MAX_MESSAGE_LEN = 1000;

const INR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

async function buildGroundingContext(trip) {
  const cityIds = trip.cityIds || [];
  const [citySnaps, restSnap, staySnap, transSnap, marketSnap] = await Promise.all([
    db.getAll(...cityIds.map((id) => db.collection('cities').doc(id))),
    db.collection('restaurants').where('cityId', 'in', cityIds.slice(0, 10)).get(),
    db.collection('stays').where('cityId', 'in', cityIds.slice(0, 10)).get(),
    db.collection('transportOptions').where('cityId', 'in', cityIds.slice(0, 10)).get(),
    db.collection('markets').where('cityId', 'in', cityIds.slice(0, 10)).get(),
  ]);

  const lines = [];

  lines.push('# THE TRAVELLER\'S TRIP');
  lines.push(`Title: ${trip.title}`);
  lines.push(`Duration: ${trip.durationDays} days · Budget tier: ${trip.budgetTier}`);
  lines.push(`Total budget: ${INR(trip.estimatedTotal)} (about ${INR(trip.perDayCost)}/day)`);
  lines.push('');

  lines.push('# THEIR DAY-BY-DAY PLAN');
  for (const day of trip.itinerary?.days || []) {
    lines.push(`Day ${day.dayNumber} (${day.cityName || day.cityId}):`);
    for (const slot of day.slots || []) {
      const mark = slot.checked === false ? '[removed by traveller] ' : '';
      const price = slot.refType === 'poi'
        ? (slot.price ? INR(slot.price) : 'Free')
        : `${INR(slot.priceForTwo)} for two`;
      lines.push(`  - ${slot.period}: ${mark}${slot.name} (${price})`);
    }
  }
  lines.push('');

  citySnaps.forEach((s) => {
    if (!s.exists) return;
    const c = s.data();
    lines.push(`# ${c.name.toUpperCase()} — REFERENCE DATA`);
    lines.push(`Best time to visit: ${c.bestTimeToVisit}`);
    lines.push(`Languages: ${(c.languages || []).join(', ')}`);
    lines.push(`Price per day: budget ${INR(c.pricePerDay?.budget)}, mid ${INR(c.pricePerDay?.mid)}, luxury ${INR(c.pricePerDay?.luxury)}`);
    if (c.culture?.history) lines.push(`Culture: ${c.culture.history}`);
    lines.push('');
  });

  const group = (snap, title, fmt) => {
    if (snap.empty) return;
    lines.push(`# ${title}`);
    snap.docs.forEach((d) => lines.push('- ' + fmt(d.data())));
    lines.push('');
  };

  group(restSnap, 'RESTAURANTS AVAILABLE',
    (r) => `${r.name} (${r.area}) — ${r.description} Must try: ${r.mustTryDish}. ${INR(r.priceForTwo)} for two.`);
  group(staySnap, 'STAYS AVAILABLE',
    (s) => `${s.name} — ${s.priceTier} tier, ${INR(s.pricePerNight)}/night, ${s.distanceFromCenterKm ?? '?'} km from centre.`);
  group(transSnap, 'TRANSPORT OPTIONS',
    (t) => `${t.mode} — ${t.costRange}, ${t.timeEstimate}. ${t.note || ''}`);
  group(marketSnap, 'MARKETS',
    (m) => `${m.name} — ${m.specialty}. ${m.description || ''}`);

  return lines.join('\n');
}

const SYSTEM = `You are WanderWise's AI Local Guide — a warm, specific, practical local expert.

STRICT RULES:
- Answer ONLY from the reference data supplied in the user message. It is the app's curated dataset.
- Never invent a restaurant, hotel, price or attraction that is not in that data. If something is not covered, say so plainly and suggest the closest thing that IS in the data.
- Always respect the traveller's stated budget tier and total budget. Flag it when a suggestion would blow their budget.
- Reference their actual itinerary where relevant ("already on your Day 2").
- Prices in Indian rupees using the ₹ symbol.
- Be concise: 2-4 short paragraphs. Use **bold** for place names. No headings.`;

exports.chatWithLocalGuide = onCall(
  { cors: true, secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 60 },
  async (request) => {
    const uid = requireAuth(request);
    const tripId = requireString(request.data?.tripId, 'tripId');
    const message = requireString(request.data?.message, 'message').slice(0, MAX_MESSAGE_LEN);

    const tripRef = db.collection('users').doc(uid).collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    if (!tripSnap.exists) throw new HttpsError('not-found', 'Trip not found.');
    const trip = tripSnap.data();

    const messagesRef = tripRef.collection('chatMessages');

    // Daily quota (matches the 20/20 counter in the UI).
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    const todaySnap = await messagesRef
      .where('role', '==', 'user')
      .where('createdAt', '>=', since)
      .count()
      .get();
    const used = todaySnap.data().count;
    if (used >= DAILY_QUOTA) {
      throw new HttpsError('resource-exhausted',
        `You've used all ${DAILY_QUOTA} guide questions for today. The limit resets at midnight UTC.`);
    }

    // Persist the user turn first so it is never lost if generation fails.
    await messagesRef.add({ role: 'user', text: message, createdAt: FieldValue.serverTimestamp() });

    const historySnap = await messagesRef.orderBy('createdAt', 'desc').limit(HISTORY_LIMIT).get();
    const history = historySnap.docs
      .map((d) => d.data())
      .reverse()
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

    const context = await buildGroundingContext(trip);

    let reply;
    if (claude.isConfigured()) {
      try {
        // Fold the grounding context into the newest user turn.
        const messages = [...history];
        messages[messages.length - 1] = {
          role: 'user',
          content: `${context}\n\n---\n\nTRAVELLER'S QUESTION: ${message}`,
        };
        reply = await claude.requestText({ system: SYSTEM, messages, maxTokens: 900 });
      } catch (err) {
        console.error('Claude chat failed', err);
        reply = "I'm having trouble reaching my knowledge service right now. " +
                'Please try that question again in a moment.';
      }
    } else {
      reply = 'The Local Guide needs ANTHROPIC_API_KEY configured. ' +
              'Set it with: firebase functions:secrets:set ANTHROPIC_API_KEY';
    }

    const assistantDoc = await messagesRef.add({
      role: 'assistant', text: reply, createdAt: FieldValue.serverTimestamp(),
    });

    return {
      messageId: assistantDoc.id,
      reply,
      quota: { used: used + 1, limit: DAILY_QUOTA, remaining: DAILY_QUOTA - used - 1 },
    };
  }
);

exports._internal = { buildGroundingContext, DAILY_QUOTA };
