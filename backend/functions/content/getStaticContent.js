/**
 * 4.10 getStaticContent (callable)
 * Legal copy lives in Firestore so it can change without a client release.
 */
const { onCall } = require('firebase-functions/v2/https');
const { db } = require('../lib/firebase');
const { requireString, HttpsError } = require('../lib/errors');

const ALLOWED = ['privacyPolicy', 'termsOfService', 'contactSupport'];

exports.getStaticContent = onCall({ cors: true }, async (request) => {
  // Deliberately no auth requirement: these pages must be reachable from the
  // signup consent line before an account exists.
  const docId = requireString(request.data?.docId, 'docId');
  if (!ALLOWED.includes(docId)) {
    throw new HttpsError('invalid-argument', `docId must be one of ${ALLOWED.join(', ')}.`);
  }
  const snap = await db.collection('staticContent').doc(docId).get();
  if (!snap.exists) throw new HttpsError('not-found', `Content "${docId}" not seeded.`);
  const d = snap.data();
  return { id: snap.id, title: d.title, body: d.body, lastUpdated: d.lastUpdated?.toMillis?.() ?? null };
});
