/**
 * Google Maps Places API Collector
 * Requires: GOOGLE_MAPS_API_KEY environment variable
 * Terms: https://developers.google.com/maps/terms
 *
 * Usage: GOOGLE_MAPS_API_KEY=your_key node scripts/collect-google-maps.mjs
 *
 * Collects additional Bangladesh locations that OSM may not cover:
 * - Shopping malls
 * - Hospitals with exact names
 * - Specific bus counters
 * - Popular landmarks
 *
 * Cost estimate: ~100 Place Search API calls = ~$0.20 at standard pricing
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error('ERROR: Set GOOGLE_MAPS_API_KEY environment variable');
  console.error('Get a key at: https://console.cloud.google.com/');
  console.error('Enable: Places API, Maps JavaScript API');
  process.exit(1);
}

const OUT_DIR = path.join(__dirname, '../data/collected');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000 }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Search categories and locations to query
const QUERIES = [
  // Bus counters in Dhaka
  { q: 'Gabtoli bus terminal Dhaka', lat: 23.7835, lng: 90.3438 },
  { q: 'Sayedabad bus terminal Dhaka', lat: 23.7161, lng: 90.4284 },
  { q: 'Mohakhali bus terminal Dhaka', lat: 23.7779, lng: 90.3975 },
  { q: 'Kamalapur railway station Dhaka', lat: 23.7333, lng: 90.4265 },
  // Hospitals
  { q: 'Dhaka Medical College Hospital', lat: 23.7261, lng: 90.4054 },
  { q: 'Square Hospital Dhaka', lat: 23.7570, lng: 90.3760 },
  // Universities
  { q: 'Dhaka University', lat: 23.7289, lng: 90.3943 },
  { q: 'BUET Dhaka', lat: 23.7262, lng: 90.3926 },
  { q: 'North South University Dhaka', lat: 23.8144, lng: 90.4244 },
  // Shopping
  { q: 'Bashundhara City Mall Dhaka', lat: 23.7509, lng: 90.3925 },
  { q: 'Jamuna Future Park Dhaka', lat: 23.8085, lng: 90.4267 },
];

async function searchNearby(query, lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=5000&key=${API_KEY}`;
  return get(url);
}

async function main() {
  console.log('=== Google Maps Places Collector ===');
  console.log('API Key:', API_KEY.slice(0, 10) + '...');
  
  const results = [];
  
  for (const q of QUERIES) {
    await sleep(200); // Respect rate limits
    try {
      const data = await searchNearby(q.q, q.lat, q.lng);
      if (data.status !== 'OK') {
        console.log(`  ⚠ ${q.q}: ${data.status}`);
        continue;
      }
      const places = data.results.slice(0, 3).map(p => ({
        id: `gm_${p.place_id}`,
        name: p.name,
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
        address: p.formatted_address,
        types: p.types,
        source: 'google_maps',
        confidence: 0.95,
      }));
      results.push(...places);
      console.log(`  ✓ ${q.q}: ${places.length} results`);
    } catch(err) {
      console.log(`  ✗ ${q.q}: ${err.message}`);
    }
  }
  
  const outFile = path.join(OUT_DIR, 'google-maps-places.json');
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} places to ${outFile}`);
  console.log('Run process-bd-locations.mjs to integrate.');
}

main().catch(e => { console.error(e); process.exit(1); });
