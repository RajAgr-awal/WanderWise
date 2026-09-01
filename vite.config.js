import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// BASE lets the same source build for a domain root (Netlify/Vercel/Firebase) or a
// sub-path (GitHub Pages: BASE=/wanderwise/ npm run build).
const base = process.env.BASE || './';

/**
 * Injects the real hashed build output into the service worker's precache list.
 *
 * Without this the JS/CSS bundles are only cached opportunistically — and on a
 * first visit the worker isn't controlling the page yet, so those requests never
 * reach it. The app shell would then 504 on the first offline reload. Stamping the
 * manifest (and a content hash as the cache version) fixes that and guarantees a
 * new deploy invalidates the old cache.
 */
function swPrecache() {
  return {
    name: 'ww-sw-precache',
    apply: 'build',
    closeBundle() {
      const dist = resolve(process.cwd(), 'dist');
      const swPath = resolve(dist, 'sw.js');
      if (!existsSync(swPath)) return;

      const manifestPath = resolve(dist, '.vite/manifest.json');
      let assets = [];
      if (existsSync(manifestPath)) {
        const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
        assets = Object.values(m).flatMap((e) => [e.file, ...(e.css || [])]);
      }
      const urls = [...new Set(assets)].map((f) => `./${f}`);

      let sw = readFileSync(swPath, 'utf8');
      sw = sw.replace('/*__BUILD_ASSETS__*/', urls.map((u) => JSON.stringify(u)).join(', '));

      // Cache version derived from the bundle names, so each deploy busts the cache.
      const version = urls.join('|').replace(/[^a-zA-Z0-9]/g, '').slice(-16) || Date.now().toString(36);
      sw = sw.replace("const CACHE_VERSION = 'v1'", `const CACHE_VERSION = 'v1-${version}'`);

      writeFileSync(swPath, sw);
      console.log(`  sw.js precache: ${urls.length} build assets, version v1-${version}`);
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), swPrecache()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2020',
    manifest: true,          // needed by swPrecache
  },
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 5173, allowedHosts: true },
});
