/**
 * §3 Auth — deleteAccount (callable).
 *
 * Irreversible, exactly as the in-app Privacy Policy states:
 *  1. recursive delete of /users/{uid} and every subcollection
 *  2. delete the Storage folder /users/{uid}/
 *  3. delete the Firebase Auth record
 *
 * Order matters: Firestore and Storage first, Auth last — if a step fails the user
 * can still authenticate and retry rather than being orphaned.
 */
const { onCall } = require('firebase-functions/v2/https');
const { admin, db } = require('../lib/firebase');
const { requireAuth, HttpsError } = require('../lib/errors');

exports.deleteAccount = onCall({ cors: true, timeoutSeconds: 300 }, async (request) => {
  const uid = requireAuth(request);

  // Require a recent sign-in for a destructive action (token issued < 10 minutes ago).
  const authTime = request.auth.token?.auth_time;
  if (authTime && Date.now() / 1000 - authTime > 600) {
    throw new HttpsError('failed-precondition',
      'Please sign in again before deleting your account.');
  }

  const summary = { trips: 0, templates: 0, chatMessages: 0, storageFiles: 0 };

  // 1. Firestore — recursive delete handles all nested subcollections.
  const userRef = db.collection('users').doc(uid);
  const tripsSnap = await userRef.collection('trips').get();
  summary.trips = tripsSnap.size;
  for (const trip of tripsSnap.docs) {
    const msgs = await trip.ref.collection('chatMessages').count().get();
    summary.chatMessages += msgs.data().count;
  }
  summary.templates = (await userRef.collection('templates').count().get()).data().count;

  await db.recursiveDelete(userRef);

  // 2. Storage.
  try {
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({ prefix: `users/${uid}/` });
    summary.storageFiles = files.length;
    await Promise.all(files.map((f) => f.delete().catch(() => null)));
  } catch (err) {
    console.error('Storage cleanup failed for', uid, err);
  }

  // 3. Auth record — last.
  await admin.auth().deleteUser(uid);

  console.log('Account deleted', uid, summary);
  return { deleted: true, uid, summary };
});
