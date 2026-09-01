/** Shared validation + auth helpers for callable functions. */
const { HttpsError } = require('firebase-functions/v2/https');

/** Every callable in this codebase requires a signed-in user. */
function requireAuth(request) {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'You must be signed in.');
  return uid;
}

function requireString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpsError('invalid-argument', `"${field}" must be a non-empty string.`);
  }
  return value.trim();
}

function requireInt(value, field, { min = 1, max = 365 } = {}) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new HttpsError('invalid-argument', `"${field}" must be an integer between ${min} and ${max}.`);
  }
  return n;
}

const BUDGET_TIERS = ['budget', 'mid', 'luxury'];

function requireTier(value, field = 'budgetTier') {
  if (!BUDGET_TIERS.includes(value)) {
    throw new HttpsError('invalid-argument', `"${field}" must be one of ${BUDGET_TIERS.join(', ')}.`);
  }
  return value;
}

function requireArray(value, field, { min = 1, max = 10 } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    throw new HttpsError('invalid-argument', `"${field}" must be an array of ${min}-${max} items.`);
  }
  return value;
}

module.exports = { HttpsError, requireAuth, requireString, requireInt, requireTier, requireArray, BUDGET_TIERS };
