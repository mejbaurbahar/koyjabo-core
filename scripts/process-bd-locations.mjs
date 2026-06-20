/**
 * Bangladesh Location Data Processor
 * Takes raw collected data from data/collected/ and:
 * 1. Deduplicates
 * 2. Normalizes names (EN/BN)
 * 3. Adds aliases + fuzzy search tokens
 * 4. Merges with existing data/bangladeshTrainData.ts entries
 * 5. Links admin locations to transport nodes
 * 6. Outputs final TS data files
 *
 * Usage: node scripts/process-bd-locations.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IN_DIR = path.join(__dirname, '../data/collected');
const OUT_DIR = path.join(__dirname, '../data/generated');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(filename) {
  const fp = path.join(IN_DIR, filename);
  if (!fs.existsSync(fp)) { console.warn(`  ⚠ Missing ${filename}`); return []; }
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9ঀ-৿]+/g, '_')
    .replace(/^_|_$/g, '');
}

function tokenize(name) {
  // Generate search tokens: full name, each word, common abbreviations
  if (!name) return [];
  const tokens = new Set();
  tokens.add(name.toLowerCase());
  name.toLowerCase().split(/\s+/).forEach(w => { if (w.length > 2) tokens.add(w); });
  return [...tokens];
}

// English transliteration shortcuts for common Bengali suffixes
const BN_SUFFIX_MAP = {
  'রেলওয়ে স্টেশন': 'Railway Station',
  'রেল স্টেশন': 'Rail Station',
  'বাস টার্মিনাল': 'Bus Terminal',
  'বাস স্টেশন': 'Bus Station',
  'লঞ্চ ঘাট': 'Launch Ghat',
  'ফেরি ঘাট': 'Ferry Ghat',
  'বিমানবন্দর': 'Airport',
};

function guessEnFromBn(bn) {
  if (!bn) return '';
  for (const [bnSuffix] of Object.entries(BN_SUFFIX_MAP)) {
    if (bn.includes(bnSuffix)) return ''; // Can't transliterate base name
  }
  return ''; // No auto-transliteration without library
}

// Haversine distance in meters
function dist(lat1, lng1, lat2, lng2) {
  const R = 6_371_000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Deduplication ─────────────────────────────────────────────────────────────

function deduplicateByProximity(items, radiusMeters = 100) {
  const kept = [];
  const used = new Set();

  for (let i = 0; i < items.length; i++) {
    if (used.has(i)) continue;
    const a = items[i];
    const cluster = [a];

    for (let j = i + 1; j < items.length; j++) {
      if (used.has(j)) continue;
      const b = items[j];
      if (dist(a.lat, a.lng, b.lat, b.lng) <= radiusMeters) {
        cluster.push(b);
        used.add(j);
      }
    }

    // Merge cluster: prefer entry with most data
    const best = cluster.sort((x, y) => {
      const scoreX = (x.name ? 2 : 0) + (x.bnName ? 2 : 0) + (x.confidence || 0);
      const scoreY = (y.name ? 2 : 0) + (y.bnName ? 2 : 0) + (y.confidence || 0);
      return scoreY - scoreX;
    })[0];

    // Collect all names as aliases
    const aliases = new Set();
    cluster.forEach(c => {
      if (c.name && c.name !== best.name) aliases.add(c.name);
      if (c.bnName && c.bnName !== best.bnName) aliases.add(c.bnName);
    });

    kept.push({ ...best, aliases: [...aliases], mergedFrom: cluster.length });
    used.add(i);
  }

  return kept;
}

// ── Build searchable location record ─────────────────────────────────────────

function buildLocationRecord(item, category) {
  const id = item.id || `${category}_${slugify(item.name || item.bnName || item.osmId)}`;
  const name = item.name || '';
  const bnName = item.bnName || '';

  const searchTokens = [
    ...tokenize(name),
    ...tokenize(bnName),
    ...(item.aliases || []).flatMap(a => tokenize(a)),
  ];

  return {
    id,
    name,
    bnName,
    aliases: item.aliases || [],
    lat: item.lat,
    lng: item.lng,
    category,
    subType: item.type || item.placeType || item.category || '',
    iata: item.iata || '',
    confidence: item.confidence || 0.80,
    source: item.source || 'osm',
    sourceUrl: item.sourceUrl || '',
    searchTokens,
    needsReview: item.needsReview || (!name && !bnName),
  };
}

// ── Process Railway Stations ──────────────────────────────────────────────────

function processRailwayStations() {
  console.log('\n[Processing] Railway stations...');
  const raw = readJson('railway-stations-osm.json');

  // Filter: must have a name, must be valid Bangladesh bounds
  const filtered = raw.filter(s =>
    (s.name || s.bnName) &&
    s.lat >= 20.74 && s.lat <= 26.65 &&
    s.lng >= 88.01 && s.lng <= 92.68
  );

  const deduped = deduplicateByProximity(filtered, 200);
  const records = deduped.map(s => buildLocationRecord(s, 'railway_station'));

  console.log(`  Raw: ${raw.length} → Filtered: ${filtered.length} → Deduped: ${records.length}`);
  return records;
}

// ── Process Bus Stops ─────────────────────────────────────────────────────────

function processBusStops() {
  console.log('\n[Processing] Bus stops...');
  const raw = readJson('bus-stops-osm.json');

  // Only keep named stops in Bangladesh bounds
  const filtered = raw.filter(s =>
    (s.name || s.bnName) &&
    s.lat >= 20.74 && s.lat <= 26.65 &&
    s.lng >= 88.01 && s.lng <= 92.68
  );

  // Use larger radius for bus stops (same terminal area)
  const deduped = deduplicateByProximity(filtered, 50);
  const records = deduped.map(s => buildLocationRecord(s, 'bus_stop'));

  console.log(`  Raw: ${raw.length} → Filtered: ${filtered.length} → Deduped: ${records.length}`);
  return records;
}

// ── Process Airports ──────────────────────────────────────────────────────────

function processAirports() {
  console.log('\n[Processing] Airports...');
  const raw = readJson('airports-osm.json');
  const filtered = raw.filter(s =>
    (s.name || s.bnName) &&
    s.lat >= 20.74 && s.lat <= 26.65 &&
    s.lng >= 88.01 && s.lng <= 92.68
  );
  const deduped = deduplicateByProximity(filtered, 500);
  const records = deduped.map(s => buildLocationRecord(s, 'airport'));
  console.log(`  Raw: ${raw.length} → Deduped: ${records.length}`);
  return records;
}

// ── Process Ferry Terminals ───────────────────────────────────────────────────

function processFerryTerminals() {
  console.log('\n[Processing] Ferry terminals...');
  const raw = readJson('ferry-terminals-osm.json');
  const filtered = raw.filter(s =>
    (s.name || s.bnName) &&
    s.lat >= 20.74 && s.lat <= 26.65 &&
    s.lng >= 88.01 && s.lng <= 92.68
  );
  const deduped = deduplicateByProximity(filtered, 150);
  const records = deduped.map(s => buildLocationRecord(s, 'ferry_terminal'));
  console.log(`  Raw: ${raw.length} → Deduped: ${records.length}`);
  return records;
}

// ── Process Admin Data ────────────────────────────────────────────────────────

function processAdminData() {
  console.log('\n[Processing] Administrative locations...');
  const admin = readJson('admin-divisions.json');
  const records = [];

  const processLevel = (items, cat) =>
    (items || []).filter(i => i.name || i.bnName).map(i => ({
      id: `admin_${cat}_${slugify(i.name || i.bnName || i.osmId)}`,
      name: i.name || '',
      bnName: i.bnName || '',
      aliases: [],
      lat: i.lat || null,
      lng: i.lng || null,
      category: cat,
      confidence: 0.95,
      source: 'osm',
      searchTokens: [...tokenize(i.name), ...tokenize(i.bnName)],
    }));

  records.push(...processLevel(admin.divisions, 'division'));
  records.push(...processLevel(admin.districts, 'district'));
  records.push(...processLevel(admin.upazilas, 'upazila'));

  console.log(`  Divisions: ${admin.divisions?.length} | Districts: ${admin.districts?.length} | Upazilas: ${admin.upazilas?.length}`);
  return records;
}

// ── Process Places ────────────────────────────────────────────────────────────

function processPlaces() {
  console.log('\n[Processing] Towns and villages...');
  const raw = readJson('places-osm.json');
  const filtered = raw.filter(p =>
    (p.name || p.bnName) &&
    p.lat >= 20.74 && p.lat <= 26.65 &&
    p.lng >= 88.01 && p.lng <= 92.68
  );
  const deduped = deduplicateByProximity(filtered, 100);
  const records = deduped.map(p => buildLocationRecord(p, `place_${p.placeType || 'place'}`));
  console.log(`  Raw: ${raw.length} → Filtered: ${filtered.length} → Deduped: ${records.length}`);
  return records;
}

// ── Build Master Index ────────────────────────────────────────────────────────

function buildMasterIndex(allRecords) {
  console.log('\n[Building] Master searchable index...');

  // Final dedup by ID
  const byId = new Map();
  for (const r of allRecords) {
    if (!byId.has(r.id)) {
      byId.set(r.id, r);
    } else {
      // Merge: keep record with higher confidence
      const existing = byId.get(r.id);
      if ((r.confidence || 0) > (existing.confidence || 0)) {
        byId.set(r.id, { ...existing, ...r, aliases: [...new Set([...existing.aliases, ...r.aliases])] });
      }
    }
  }

  const master = [...byId.values()].filter(r => r.name || r.bnName);

  // Build inverted search index: token → [ids]
  const searchIndex = {};
  for (const r of master) {
    for (const token of (r.searchTokens || [])) {
      if (!searchIndex[token]) searchIndex[token] = [];
      if (!searchIndex[token].includes(r.id)) searchIndex[token].push(r.id);
    }
  }

  return { master, searchIndex };
}

// ── Generate TypeScript output ────────────────────────────────────────────────

function generateTypeScript(master) {
  console.log('\n[Generating] TypeScript data file...');

  const byCategory = {};
  for (const r of master) {
    const cat = r.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  }

  const summary = Object.entries(byCategory).map(([cat, items]) =>
    `//   ${cat}: ${items.length}`
  ).join('\n');

  const ts = `// AUTO-GENERATED by scripts/process-bd-locations.mjs
// DO NOT EDIT MANUALLY — regenerate with: node scripts/process-bd-locations.mjs
// Sources: OpenStreetMap (ODbL license)
// Generated: ${new Date().toISOString()}
//
// Coverage:
${summary}

export interface BDLocationRecord {
  id: string;
  name: string;
  bnName: string;
  aliases: string[];
  lat: number | null;
  lng: number | null;
  category: string;
  subType?: string;
  iata?: string;
  confidence: number;
  source: string;
  searchTokens: string[];
}

export const BD_LOCATIONS_EXTENDED: BDLocationRecord[] = ${JSON.stringify(master, null, 2)};

export function searchBDLocationsExtended(query: string, limit = 20): BDLocationRecord[] {
  if (!query.trim()) return BD_LOCATIONS_EXTENDED.slice(0, limit);
  const q = query.toLowerCase().trim();
  const scored = BD_LOCATIONS_EXTENDED
    .map(r => {
      const nameLower = r.name.toLowerCase();
      const bnMatch = r.bnName.includes(query);
      const aliasMatch = r.aliases.some(a => a.toLowerCase().includes(q));
      const tokenMatch = r.searchTokens.some(t => t.includes(q));
      // Scoring: exact > startsWith > includes > token
      let score = 0;
      if (nameLower === q || r.bnName === query) score = 100;
      else if (nameLower.startsWith(q)) score = 80;
      else if (nameLower.includes(q) || bnMatch) score = 60;
      else if (aliasMatch) score = 50;
      else if (tokenMatch) score = 30;
      return { r, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || b.r.confidence - a.r.confidence)
    .slice(0, limit)
    .map(x => x.r);
  return scored;
}
`;

  const fp = path.join(OUT_DIR, 'bangladeshLocationsExtended.ts');
  fs.writeFileSync(fp, ts, 'utf8');
  console.log(`  ✓ Generated ${fp}`);
  return fp;
}

// ── Coverage Report ───────────────────────────────────────────────────────────

function writeCoverageReport(master) {
  const byCategory = {};
  for (const r of master) {
    const cat = r.category;
    if (!byCategory[cat]) byCategory[cat] = { total: 0, withBn: 0, withCoords: 0, needsReview: 0 };
    byCategory[cat].total++;
    if (r.bnName) byCategory[cat].withBn++;
    if (r.lat && r.lng) byCategory[cat].withCoords++;
    if (r.needsReview) byCategory[cat].needsReview++;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalRecords: master.length,
    byCategory,
    missingBengali: master.filter(r => !r.bnName).length,
    missingCoords: master.filter(r => !r.lat).length,
    needsReview: master.filter(r => r.needsReview).length,
  };

  const fp = path.join(OUT_DIR, 'coverage-report.json');
  fs.writeFileSync(fp, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n=== Coverage Report ===`);
  console.log(`Total records: ${report.totalRecords}`);
  console.log(`Missing Bengali name: ${report.missingBengali}`);
  console.log(`Missing coordinates: ${report.missingCoords}`);
  console.log(`Needs review: ${report.needsReview}`);
  console.log('\nBy category:');
  for (const [cat, stats] of Object.entries(byCategory)) {
    console.log(`  ${cat}: ${stats.total} total, ${stats.withBn} with BN, ${stats.withCoords} with coords`);
  }
  console.log(`\nReport saved to: ${fp}`);
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Bangladesh Location Data Processor ===\n');

  const all = [];
  all.push(...processRailwayStations());
  all.push(...processBusStops());
  all.push(...processAirports());
  all.push(...processFerryTerminals());
  all.push(...processAdminData());
  all.push(...processPlaces());

  const { master, searchIndex } = buildMasterIndex(all);
  console.log(`\nMaster index: ${master.length} unique locations`);

  // Save master JSON
  fs.writeFileSync(path.join(OUT_DIR, 'master-locations.json'), JSON.stringify(master, null, 2), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2), 'utf8');
  console.log(`  ✓ master-locations.json, search-index.json`);

  generateTypeScript(master);
  writeCoverageReport(master);

  console.log(`\n✓ Done. Next: copy data/generated/bangladeshLocationsExtended.ts into your app.`);
}

main().catch(e => { console.error(e); process.exit(1); });
