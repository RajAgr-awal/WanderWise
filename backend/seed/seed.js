#!/usr/bin/env node
/**
 * Seed script (spec §7).
 *
 * Populates /cities, /curatedTours, /pois, /restaurants, /stays,
 * /transportOptions, /markets and /staticContent. generateItinerary and
 * chatWithLocalGuide both depend on this data existing — without it there is
 * nothing to ground the AI against.
 *
 * Usage
 *   Emulator:  FIRESTORE_EMULATOR_HOST=localhost:8080 GCLOUD_PROJECT=wanderwise-dev node seed/seed.js
 *   Live:      GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node seed/seed.js --project wanderwise-prod
 *
 * Flags
 *   --wipe    delete existing catalog docs before writing
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const data = require('./data');

const projectId = process.env.GCLOUD_PROJECT
  || (process.argv.indexOf('--project') !== -1 ? process.argv[process.argv.indexOf('--project') + 1] : null)
  || 'webappwarnderer';

if (!getApps().length) {
  const saPath = path.resolve(__dirname, '../serviceAccount.json');
  if (!process.env.FIRESTORE_EMULATOR_HOST && fs.existsSync(saPath)) {
    const serviceAccount = require(saPath);
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId,
    });
  } else {
    initializeApp({ projectId });
  }
}
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const COLLECTIONS = ['cities', 'curatedTours', 'pois', 'restaurants', 'stays', 'transportOptions', 'markets', 'staticContent'];

async function wipe() {
  for (const name of COLLECTIONS) {
    const snap = await db.collection(name).get();
    if (snap.empty) continue;
    let batch = db.batch();
    let n = 0;
    for (const doc of snap.docs) {
      batch.delete(doc.ref);
      if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
    }
    await batch.commit();
    console.log(`  wiped ${snap.size} from /${name}`);
  }
}

/** Commit an array of {id, ...fields} into a collection in chunks of 400. */
async function writeAll(collection, docs) {
  let batch = db.batch();
  let n = 0;
  for (const doc of docs) {
    const { id, ...fields } = doc;
    batch.set(db.collection(collection).doc(id), fields, { merge: true });
    if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
  await batch.commit();
  console.log(`  /${collection}: ${docs.length} docs`);
}

async function main() {
  console.log(`Seeding project "${projectId}"` +
    (process.env.FIRESTORE_EMULATOR_HOST ? ` (emulator ${process.env.FIRESTORE_EMULATOR_HOST})` : ' (LIVE)'));

  if (process.argv.includes('--wipe')) {
    console.log('Wiping catalog collections...');
    await wipe();
  }

  await writeAll('cities', data.cities);
  await writeAll('curatedTours', data.curatedTours);
  await writeAll('pois', data.pois);
  await writeAll('restaurants', data.restaurants);
  await writeAll('stays', data.stays);
  await writeAll('transportOptions', data.transportOptions);
  await writeAll('markets', data.markets);

  const now = FieldValue.serverTimestamp();
  await writeAll('staticContent', data.staticContent.map((d) => ({ ...d, lastUpdated: now })));

  console.log('\nSeed complete.');
  console.log(`  ${data.cities.length} cities · ${data.pois.length} POIs · ${data.restaurants.length} restaurants`);
  console.log(`  ${data.stays.length} stays · ${data.transportOptions.length} transport · ${data.markets.length} markets`);
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
