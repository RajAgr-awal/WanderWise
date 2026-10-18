import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// BASE lets the same source build for a domain root or sub-path (GitHub Pages: BASE=/wanderwise/ npm run build).
const base = process.env.BASE || './';

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
    manifest: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: { host: '0.0.0.0', port: 5173, allowedHosts: true },
});
