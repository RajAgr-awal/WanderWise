#!/usr/bin/env node
/**
 * WanderWise — idempotent seed script (scaffold)
 *
 * Honest-data rules:
 * - Never fabricate price / hours / rating / coordinates. Missing = null.
 * - Every place carries provenance: sourceType, confidence, lastCheckedAt, verified.
 * - "verified" is false until a human curator confirms on site.
 *
 * Idempotency: upsert by id — running twice produces the same result, no duplicates.
 *
 * Modes:
 *   File mode (default, no DB required): writes to backend/seed/.seed-output.json
 *     node backend/seed/seed.js
 *     node backend/seed/seed.js --wipe   (overwrite)
 *
 *   Firestore mode (when FIRESTORE_EMULATOR_HOST or GOOGLE_APPLICATION_CREDENTIALS set):
 *     FIRESTORE_EMULATOR_HOST=localhost:8080 node backend/seed/seed.js
 *     GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node backend/seed/seed.js --project <id>
 *
 * Env: all via process.env — see backend/.env.example
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_PATH = path.join(__dirname, 'data', 'honest-sample.json');
const OUTPUT_PATH = path.join(__dirname, '.seed-output.json');

function loadSample() {
  const raw = fs.readFileSync(SAMPLE_PATH, 'utf8');
  return JSON.parse(raw);
}

function isFirestoreConfigured() {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

async function seedFirestore(sample) {
  // Lazy require so scaffold works without firebase-admin installed
  const { initializeApp, getApps, cert } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');

  const projectId =
    process.env.GCLOUD_PROJECT ||
    (process.argv.includes('--project') ? process.argv[process.argv.indexOf('--project') + 1] : null) ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    'wanderwise-scaffold';

  if (!getApps().length) {
    const saPath = path.resolve(__dirname, '../serviceAccount.json');
    if (!process.env.FIRESTORE_EMULATOR_HOST && fs.existsSync(saPath)) {
      const sa = require(saPath);
      initializeApp({ credential: cert(sa), projectId: sa.project_id || projectId });
    } else {
      initializeApp({ projectId });
    }
  }
  const db = getFirestore();
  try { db.settings({ ignoreUndefinedProperties: true }); } catch {}

  const collections = {
    places: sample.places || [],
    cities: sample.cities || [],
    curatorChecks: sample.curatorChecks || [],
  };

  if (process.argv.includes('--wipe')) {
    console.log('  --wipe: existing docs will be overwritten by id (no delete needed for idempotency)');
  }

  for (const [col, docs] of Object.entries(collections)) {
    let batch = db.batch();
    let count = 0;
    for (const doc of docs) {
      const { id, ...fields } = doc;
      if (!id) continue;
      batch.set(db.collection(col).doc(id), fields, { merge: true });
      count++;
      if (count % 400 === 0) { await batch.commit(); batch = db.batch(); }
    }
    await batch.commit();
    console.log(`  /${col}: ${docs.length} upserted (idempotent)`);
  }
  console.log(`\nFirestore seed complete → project "${projectId}"`);
}

function seedFile(sample) {
  const wipe = process.argv.includes('--wipe');
  let existing = null;
  if (fs.existsSync(OUTPUT_PATH) && !wipe) {
    try { existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8')); } catch { existing = null; }
  }

  // Idempotent merge by id — if same id exists, new overwrites old
  const mergeById = (a = [], b = []) => {
    const map = new Map();
    for (const d of a) map.set(d.id, d);
    for (const d of b) map.set(d.id, d);
    return [...map.values()];
  };

  const next = existing && !wipe ? {
    places: mergeById(existing.places, sample.places),
    cities: mergeById(existing.cities, sample.cities),
    curatorChecks: mergeById(existing.curatorChecks, sample.curatorChecks),
    meta: { lastSeedAt: new Date().toISOString(), idempotent: true, mode: 'file' },
  } : {
    places: sample.places,
    cities: sample.cities,
    curatorChecks: sample.curatorChecks,
    meta: { lastSeedAt: new Date().toISOString(), idempotent: true, mode: 'file' },
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(next, null, 2));
  console.log('File seed complete →', OUTPUT_PATH);
  console.log(`  ${next.places.length} places · ${next.cities.length} cities · ${next.curatorChecks.length} checks`);
  console.log('  Idempotent: run again and counts stay the same (upsert by id).');
  if (!wipe && existing) console.log('  (used merge — pass --wipe to overwrite)');
}

async function main() {
  console.log('[WanderWise] Seed — honest data, idempotent, env-driven');
  const sample = loadSample();
  console.log(`  Sample: ${sample.places.length} places, ${sample.cities.length} cities from ${path.relative(process.cwd(), SAMPLE_PATH)}`);

  if (isFirestoreConfigured()) {
    console.log('  Mode: Firestore (env detected)');
    await seedFirestore(sample);
  } else {
    console.log('  Mode: file (no Firestore env — set FIRESTORE_EMULATOR_HOST or GOOGLE_APPLICATION_CREDENTIALS for DB)');
    seedFile(sample);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
