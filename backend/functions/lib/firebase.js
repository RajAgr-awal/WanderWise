/** Single Admin SDK initialisation shared by every function. */
const admin = require('firebase-admin');
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

if (!getApps().length) initializeApp();

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db, FieldValue };
