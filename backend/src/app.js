/**
 * WanderWise — Express app
 * REST env, idempotent seed, honest data.
 */
const express = require('express');
const cors = require('cors');
const { healthHandler } = require('./routes/health');
const citiesRouter = require('./routes/cities');
const adminRouter = require('./routes/admin');

function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin && corsOrigin !== '*') {
    app.use(cors({ origin: corsOrigin, credentials: true }));
  } else {
    app.use(cors({ origin: true, credentials: true }));
  }
  app.use(express.json({ limit: '1mb' }));

  // Health
  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // City APIs
  app.use('/api/cities', citiesRouter);
  // Place admin (PATCH /api/places/:id is under admin router)
  // Mount admin routes for data-quality and import log
  app.use('/api', adminRouter);
  // Also expose /api/admin prefix alias
  app.use('/api/admin', adminRouter);

  // Legacy planned routes — keep trips etc as 501
  const planned = [
    '/api/discover',
    '/api/trips',
    '/api/trips/:id',
  ];
  planned.forEach((p) => {
    app.all(p, (req, res) => {
      res.status(501).json({
        status: 'not-implemented',
        message: `Scaffold: ${p} is planned — see README Short Plan.`,
        planned: true,
      });
    });
  });

  // 404
  app.use((req, res) => {
    res.status(404).json({ status: 'not-found', path: req.path });
  });

  return app;
}

module.exports = { createApp };
