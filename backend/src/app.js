/**
 * WanderWise — Express app (scaffold)
 * Clean REST, env-driven, idempotent seed.
 * Principles: no fabricated data, honest provenance, partners not competitors.
 */
const express = require('express');
const cors = require('cors');
const { healthHandler } = require('./routes/health');

function createApp() {
  const app = express();

  // Allow preview hosts (Arena) and localhost — scaffold must work in sandbox
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin && corsOrigin !== '*') {
    app.use(cors({ origin: corsOrigin, credentials: true }));
  } else {
    // Default: reflect any origin (needed for https://{port}-{sandbox}.e2b.app preview)
    app.use(cors({ origin: true, credentials: true }));
  }
  app.use(express.json({ limit: '1mb' }));

  // Health — the only live endpoint in scaffold
  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler); // alias

  // Planned routes — return 501 so frontend can show "coming next"
  const planned = [
    '/api/places',
    '/api/places/:id',
    '/api/discover',
    '/api/trips',
    '/api/trips/:id',
    '/api/cities',
  ];
  planned.forEach((p) => {
    app.all(p, (req, res) => {
      res.status(501).json({
        status: 'not-implemented',
        message: `Scaffold: ${p} is planned — see README Short Plan. Next prompt will implement it.`,
        planned: true,
      });
    });
  });

  // 404 for everything else
  app.use((req, res) => {
    res.status(404).json({ status: 'not-found', path: req.path });
  });

  return app;
}

module.exports = { createApp };
