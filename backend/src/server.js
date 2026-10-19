/**
 * WanderWise backend entry — starts Express if run directly.
 * Also exports createApp for tests / serverless wrappers.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
require('dotenv').config(); // also backend/.env

const { createApp } = require('./app');

const PORT = Number(process.env.PORT || 3001);
const app = createApp();

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WanderWise] REST scaffold listening on http://0.0.0.0:${PORT}`);
    console.log(`  GET http://localhost:${PORT}/api/health`);
    console.log(`  CORS_ORIGIN=${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  });
}

module.exports = app;
