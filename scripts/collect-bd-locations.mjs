/**
 * Bangladesh Location Data Collector
 * Sources: OpenStreetMap (Overpass API), Wikidata, Public admin datasets
 * License: ODbL (OSM), CC0 (Wikidata)
 * Rate limit: max 1 req/sec per Nominatim ToS, no limit on Overpass
 *
 * Usage: node scripts/collect-bd-locations.mjs
 * Output: data/collected/
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../data/collected');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

import http from 'http';

function overpassPost(ql) {
  return new Promise((resolve, reject) => {
    const body = `data=${encodeURIComponent(ql)}`;
    const options = {
      hostname: 'overpass-api.de',
      path: '/api/interpreter',
      method: 'POST',
      timeout: 120000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'KoyJabo-BD-Collector/1.0 (bangladesh transport app; mejbaur@markopolo.ai)',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Overpass parse error: ${data.slice(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Overpass timeout')); });
    req.write(body);
    req.end();
  });
}

async function overpassQuery(ql) {
  const result = await overpassPost(ql);
  if (!result.elements) throw new Error(`Overpass error: ${JSON.stringify(result).slice(0, 200)}`);
  return result;
}

// Bangladesh ISO code area for precise boundary filtering
const BD_AREA_QL = `area["ISO3166-1"="BD"][admin_level=2]->.bd;`;

// Transliterate common Bengali name patterns to Latin (best-effort)
function latinFromBengali(bn) {
  if (!bn) return '';
  // If already has Latin chars, return as-is
  if (/[a-zA-Z]/.test(bn)) return bn;
  return ''; // No transliteration without a proper library
}

function cleanName(name) {
  if (!name) return '';
  return name
    .replace(/\s+(রেল|রেলওয়ে|রেলস্টেশন|স্টেশন|Station|Stn|Rly\.?|Railway)\s*/gi, ' ')
    .replace(/\s+Ghat$/i, ' Ghat')
    .trim();
}

function saveJson(filename, data) {
  const fp = path.join(OUT_DIR, filename);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
  console.log(`  ✓ Saved ${filename} (${Array.isArray(data) ? data.length : Object.keys(data).length} records)`);
}

// ── 1. Railway Stations ───────────────────────────────────────────────────────

async function collectRailwayStations() {
  console.log('\n[1] Collecting Bangladesh Railway stations from OSM...');
  const ql = `[out:json][timeout:60];
${BD_AREA_QL}
(
  node["railway"="station"](area.bd);
  node["railway"="halt"](area.bd);
  node["railway"="stop"](area.bd);
);
out body;`;

  const data = await overpassQuery(ql);
  const stations = data.elements
    .filter(e => e.lat && e.lon)
    .map(e => ({
      id: `osm_rail_${e.id}`,
      osmId: e.id,
      name: cleanName(e.tags?.['name:en'] || e.tags?.name || ''),
      bnName: cleanName(e.tags?.['name:bn'] || ''),
      lat: e.lat,
      lng: e.lon,
      type: e.tags?.railway || 'station',
      operator: e.tags?.operator || '',
      source: 'osm',
      sourceUrl: `https://www.openstreetmap.org/node/${e.id}`,
      confidence: e.tags?.['name:en'] && e.tags?.['name:bn'] ? 0.95 : 0.80,
      needsReview: !e.tags?.['name:en'] && !e.tags?.name,
    }))
    .filter(s => s.name || s.bnName); // skip unnamed

  console.log(`  Found ${stations.length} railway stations/halts`);
  saveJson('railway-stations-osm.json', stations);
  return stations;
}

// ── 2. Bus Stations & Terminals ────────────────────────────────────────────────

async function collectBusTerminals() {
  console.log('\n[2] Collecting bus stations and terminals from OSM...');
  const ql = `[out:json][timeout:60];
${BD_AREA_QL}
(
  node["amenity"="bus_station"](area.bd);
  node["highway"="bus_stop"](area.bd);
  node["amenity"="bus_stop"](area.bd);
  way["amenity"="bus_station"](area.bd);
);
out center body;`;

  const data = await overpassQuery(ql);
  const stops = data.elements
    .filter(e => (e.lat && e.lon) || (e.center?.lat && e.center?.lon))
    .map(e => ({
      id: `osm_bus_${e.id}`,
      osmId: e.id,
      name: e.tags?.['name:en'] || e.tags?.name || '',
      bnName: e.tags?.['name:bn'] || '',
      lat: e.lat || e.center?.lat,
      lng: e.lon || e.center?.lon,
      type: e.tags?.amenity || e.tags?.highway || 'bus_stop',
      source: 'osm',
      sourceUrl: `https://www.openstreetmap.org/${e.type || 'node'}/${e.id}`,
      confidence: e.tags?.name ? 0.85 : 0.60,
      needsReview: !e.tags?.name,
    }))
    .filter(s => s.name || s.bnName);

  console.log(`  Found ${stops.length} bus stops/terminals`);
  saveJson('bus-stops-osm.json', stops);
  return stops;
}

// ── 3. Airports ───────────────────────────────────────────────────────────────

async function collectAirports() {
  console.log('\n[3] Collecting airports from OSM...');
  const ql = `[out:json][timeout:30];
${BD_AREA_QL}
(
  node["aeroway"="aerodrome"](area.bd);
  way["aeroway"="aerodrome"](area.bd);
  relation["aeroway"="aerodrome"](area.bd);
);
out center body;`;

  const data = await overpassQuery(ql);
  const airports = data.elements
    .filter(e => (e.lat && e.lon) || (e.center?.lat && e.center?.lon))
    .map(e => ({
      id: `osm_airport_${e.id}`,
      osmId: e.id,
      name: e.tags?.['name:en'] || e.tags?.name || '',
      bnName: e.tags?.['name:bn'] || '',
      iata: e.tags?.iata || '',
      icao: e.tags?.icao || '',
      lat: e.lat || e.center?.lat,
      lng: e.lon || e.center?.lon,
      type: e.tags?.aerodrome || 'aerodrome',
      source: 'osm',
      sourceUrl: `https://www.openstreetmap.org/node/${e.id}`,
      confidence: 0.97,
    }));

  console.log(`  Found ${airports.length} airports/aerodromes`);
  saveJson('airports-osm.json', airports);
  return airports;
}

// ── 4. Ferry Terminals & Launch Ghats ─────────────────────────────────────────

async function collectFerryTerminals() {
  console.log('\n[4] Collecting ferry terminals and launch ghats from OSM...');
  const ql = `[out:json][timeout:30];
${BD_AREA_QL}
(
  node["amenity"="ferry_terminal"](area.bd);
  node["waterway"="dock"](area.bd);
  node["ferry"="yes"](area.bd);
  way["amenity"="ferry_terminal"](area.bd);
);
out center body;`;

  const data = await overpassQuery(ql);
  const terminals = data.elements
    .filter(e => (e.lat && e.lon) || (e.center?.lat && e.center?.lon))
    .map(e => ({
      id: `osm_ferry_${e.id}`,
      osmId: e.id,
      name: e.tags?.['name:en'] || e.tags?.name || '',
      bnName: e.tags?.['name:bn'] || '',
      lat: e.lat || e.center?.lat,
      lng: e.lon || e.center?.lon,
      type: 'ferry_terminal',
      source: 'osm',
      sourceUrl: `https://www.openstreetmap.org/node/${e.id}`,
      confidence: e.tags?.name ? 0.88 : 0.65,
    }));

  console.log(`  Found ${terminals.length} ferry terminals/ghats`);
  saveJson('ferry-terminals-osm.json', terminals);
  return terminals;
}

// ── 5. Administrative Divisions (Division → District → Upazila) ──────────────

async function collectAdminDivisions() {
  console.log('\n[5] Collecting administrative divisions from OSM...');
  const results = { divisions: [], districts: [], upazilas: [] };

  const levels = [
    { key: 'divisions', level: 4, label: 'Division' },
    { key: 'districts', level: 5, label: 'District' },
    { key: 'upazilas', level: 6, label: 'Upazila/Thana' },
  ];

  for (const { key, level, label } of levels) {
    await sleep(2000);
    try {
      // Use bbox for relations to avoid area filter overhead
      const ql = `[out:json][timeout:60];
relation["boundary"="administrative"]["admin_level"="${level}"](20.59,88.01,26.65,92.68);
out tags;`;
      const data = await overpassQuery(ql);
      results[key] = data.elements.map(e => ({
        osmId: e.id,
        name: e.tags?.['name:en'] || e.tags?.name || '',
        bnName: e.tags?.['name:bn'] || '',
        level,
        source: 'osm',
      })).filter(e => e.name || e.bnName);
      console.log(`  ${label}: ${results[key].length}`);
    } catch (err) {
      console.log(`  ⚠ ${label} query failed: ${err.message?.slice(0, 100)}`);
    }
  }

  saveJson('admin-divisions.json', results);
  return results;
}

// ── 6. Towns, Cities, Villages ────────────────────────────────────────────────

async function collectPlaces() {
  console.log('\n[6] Collecting towns, cities, villages from OSM...');
  const ql = `[out:json][timeout:60];
${BD_AREA_QL}
(
  node["place"~"city|town|village|hamlet|suburb|neighbourhood|quarter"](area.bd);
);
out body;`;

  const data = await overpassQuery(ql);
  const places = data.elements
    .filter(e => e.lat && e.lon)
    .map(e => ({
      id: `osm_place_${e.id}`,
      osmId: e.id,
      name: e.tags?.['name:en'] || e.tags?.name || '',
      bnName: e.tags?.['name:bn'] || '',
      lat: e.lat,
      lng: e.lon,
      placeType: e.tags?.place,
      population: e.tags?.population ? parseInt(e.tags.population) : null,
      source: 'osm',
      confidence: e.tags?.['name:en'] ? 0.90 : 0.75,
    }))
    .filter(p => p.name || p.bnName);

  console.log(`  Found ${places.length} places (cities/towns/villages)`);
  saveJson('places-osm.json', places);
  return places;
}

// ── 7. Key POIs: Hospitals, Universities, Markets, Landmarks ──────────────────

async function collectPOIs() {
  console.log('\n[7] Collecting POIs (hospitals, universities, markets) from OSM...');

  // Split into multiple queries to avoid timeout
  const queries = [
    { type: 'hospital', ql: `node["amenity"~"hospital|clinic"](area.bd)` },
    { type: 'university', ql: `node["amenity"~"university|college|school"](area.bd)` },
    { type: 'market', ql: `node["amenity"~"marketplace|shopping_centre|mall"](area.bd)` },
    { type: 'landmark', ql: `node["tourism"~"attraction|museum|monument|viewpoint"](area.bd)` },
  ];

  const allPOIs = [];
  for (const q of queries) {
    await sleep(1500);
    try {
      const ql = `[out:json][timeout:45];
${BD_AREA_QL}
(${q.ql};);
out body;`;
      const data = await overpassQuery(ql);
      const items = data.elements
        .filter(e => e.lat && e.lon && (e.tags?.name || e.tags?.['name:bn']))
        .map(e => ({
          id: `osm_poi_${e.id}`,
          osmId: e.id,
          name: e.tags?.['name:en'] || e.tags?.name || '',
          bnName: e.tags?.['name:bn'] || '',
          lat: e.lat,
          lng: e.lon,
          category: q.type,
          source: 'osm',
          confidence: 0.85,
        }));
      console.log(`  ${q.type}: ${items.length}`);
      allPOIs.push(...items);
    } catch (e) {
      console.log(`  ⚠ ${q.type} query failed: ${e.message}`);
    }
  }

  saveJson('pois-osm.json', allPOIs);
  return allPOIs;
}

// ── 8. Post Offices ────────────────────────────────────────────────────────────

async function collectPostOffices() {
  console.log('\n[8] Collecting post offices from OSM...');
  const ql = `[out:json][timeout:45];
${BD_AREA_QL}
node["amenity"="post_office"](area.bd);
out body;`;

  const data = await overpassQuery(ql);
  const posts = data.elements
    .filter(e => e.lat && e.lon)
    .map(e => ({
      id: `osm_post_${e.id}`,
      osmId: e.id,
      name: e.tags?.['name:en'] || e.tags?.name || '',
      bnName: e.tags?.['name:bn'] || '',
      postalCode: e.tags?.postal_code || e.tags?.['addr:postcode'] || '',
      lat: e.lat,
      lng: e.lon,
      source: 'osm',
      confidence: 0.85,
    }))
    .filter(p => p.name || p.bnName);

  console.log(`  Found ${posts.length} post offices`);
  saveJson('post-offices-osm.json', posts);
  return posts;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Bangladesh Location Data Collector ===');
  console.log('Source: OpenStreetMap via Overpass API');
  console.log('License: ODbL (https://www.openstreetmap.org/copyright)\n');

  const results = {};

  try {
    results.railways = await collectRailwayStations();
    await sleep(2000);

    results.buses = await collectBusTerminals();
    await sleep(2000);

    results.airports = await collectAirports();
    await sleep(2000);

    results.ferries = await collectFerryTerminals();
    await sleep(2000);

    results.admin = await collectAdminDivisions();
    await sleep(2000);

    results.places = await collectPlaces();
    await sleep(2000);

    results.pois = await collectPOIs();
    await sleep(2000);

    results.postOffices = await collectPostOffices();

    // Coverage summary
    const summary = {
      collectedAt: new Date().toISOString(),
      source: 'OpenStreetMap Overpass API',
      license: 'ODbL',
      counts: {
        railwayStations: results.railways.length,
        busStopsTerminals: results.buses.length,
        airports: results.airports.length,
        ferryTerminals: results.ferries.length,
        divisions: results.admin.divisions.length,
        districts: results.admin.districts.length,
        upazilas: results.admin.upazilas.length,
        places: results.places.length,
        pois: results.pois.length,
        postOffices: results.postOffices.length,
      }
    };
    saveJson('collection-summary.json', summary);

    console.log('\n=== Collection Complete ===');
    console.log(JSON.stringify(summary.counts, null, 2));
    console.log(`\nData saved to: ${OUT_DIR}`);
    console.log('\nNext step: node scripts/process-bd-locations.mjs');

  } catch (err) {
    console.error('Collection failed:', err.message);
    process.exit(1);
  }
}

main();
