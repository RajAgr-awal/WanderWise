/**
 * GET /api/health
 * Clean REST health-check — no secrets, no DB required.
 * Returns status, version, time, and dependency checks.
 */

const pkg = (() => {
  try { return require('../../package.json'); } catch { return { version: '0.1.0-scaffold' }; }
})();

let rootPkg = { version: '0.1.0-scaffold' };
try { rootPkg = require('../../../package.json'); } catch {}

function healthHandler(req, res) {
  const now = new Date().toISOString();
  res.json({
    status: 'ok',
    service: 'wanderwise-api',
    version: pkg.version || rootPkg.version || '0.1.0-scaffold',
    time: now,
    uptimeSec: Math.floor(process.uptime()),
    env: process.env.NODE_ENV || 'development',
    checks: {
      server: 'up',
      // Future: db, firebase, etc. — add here without breaking contract
      // Example: db: dbReady ? 'up' : 'not-configured'
    },
    // Honest data principle: scaffold has no curated places yet
    dataStatus: 'scaffold — no curated places; missing means null',
  });
}

module.exports = { healthHandler };
