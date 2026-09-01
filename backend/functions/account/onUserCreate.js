/**
 * §3 Auth — onUserCreate trigger.
 *
 * Gen-2 Cloud Functions no longer expose the legacy auth.user().onCreate() trigger,
 * so this is implemented two ways:
 *  1. `onUserCreated` — Identity Platform blocking trigger (preferred; runs before
 *     the user's first token is issued).
 *  2. `ensureUserProfile` — idempotent callable the client invokes right after
 *     sign-up. Safe to call repeatedly; a no-op once the doc exists.
 */
const { beforeUserCreated } = require('firebase-functions/v2/identity');
const { onCall } = require('firebase-functions/v2/https');
const { db, FieldValue } = require('../lib/firebase');
const { requireAuth } = require('../lib/errors');

async function writeProfile(uid, { name, email, photoUrl }) {
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  if (snap.exists) return { created: false, ...snap.data() };

  const profile = {
    name: name || (email ? email.split('@')[0] : 'Traveller'),
    email: email || null,
    photoUrl: photoUrl || null,
    homeCurrency: 'INR',
    createdAt: FieldValue.serverTimestamp(),
  };
  await ref.set(profile);
  return { created: true, ...profile };
}

// Blocking trigger — fires on every new Firebase Auth account.
exports.onUserCreate = beforeUserCreated(async (event) => {
  const user = event.data;
  try {
    await writeProfile(user.uid, {
      name: user.displayName,
      email: user.email,
      photoUrl: user.photoURL,
    });
  } catch (err) {
    // Never block sign-up because of a profile write; the callable below repairs it.
    console.error('onUserCreate profile write failed', err);
  }
  return {};
});

// Idempotent safety net the client calls after createUserWithEmailAndPassword.
exports.ensureUserProfile = onCall({ cors: true }, async (request) => {
  const uid = requireAuth(request);
  const token = request.auth.token || {};
  const result = await writeProfile(uid, {
    name: request.data?.name || token.name,
    email: token.email,
    photoUrl: token.picture,
  });
  return { uid, ...result, createdAt: Date.now() };
});

exports._internal = { writeProfile };
