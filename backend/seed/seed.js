#!/usr/bin/env node
// WanderWise idempotent seed — runs import.js for 30 cities
console.log('[seed] running idempotent import (30 cities)…');
require('./import.js');
const fs=require('fs'), path=require('path');
try {
  const cities=JSON.parse(fs.readFileSync(path.join(__dirname,'data/cities.json'),'utf8'));
  const places=JSON.parse(fs.readFileSync(path.join(__dirname,'data/places.json'),'utf8'));
  const out=path.join(__dirname,'.seed-output.json');
  fs.writeFileSync(out, JSON.stringify({ cities:cities.length, places:places.length, at:new Date().toISOString(), source:'editorial v1'}, null,2));
  console.log(`[seed] .seed-output.json: ${cities.length} cities, ${places.length} places`);
} catch(e){ console.log('[seed] done', e.message)}
