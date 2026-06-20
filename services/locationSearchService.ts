/**
 * Comprehensive Bangladesh Location Search Service
 * Data: 14,642 locations from OpenStreetMap (ODbL license)
 * Lazy-loads /bd-locations.json on first use
 */

export interface CompactLocation {
  id: string;
  n: string;     // English name
  b: string;     // Bengali name
  a: string[];   // aliases
  lat: number | null;
  lng: number | null;
  c: string;     // category
  cf: number;    // confidence 0-100
}

export interface LocationResult {
  id: string;
  name: string;
  bnName: string;
  lat: number | null;
  lng: number | null;
  category: string;
  confidence: number;
  score: number;
}

const CATEGORY_LABELS: Record<string, { en: string; bn: string }> = {
  railway_station: { en: 'Railway Station', bn: 'রেলওয়ে স্টেশন' },
  bus_stop: { en: 'Bus Stop', bn: 'বাস স্টপ' },
  airport: { en: 'Airport', bn: 'বিমানবন্দর' },
  ferry_terminal: { en: 'Launch/Ferry Terminal', bn: 'লঞ্চ/ফেরি ঘাট' },
  division: { en: 'Division', bn: 'বিভাগ' },
  district: { en: 'District', bn: 'জেলা' },
  upazila: { en: 'Upazila', bn: 'উপজেলা' },
  city: { en: 'City', bn: 'শহর' },
  town: { en: 'Town', bn: 'শহর' },
  village: { en: 'Village', bn: 'গ্রাম' },
  suburb: { en: 'Area', bn: 'এলাকা' },
  neighbourhood: { en: 'Neighbourhood', bn: 'এলাকা' },
  hospital: { en: 'Hospital', bn: 'হাসপাতাল' },
  university: { en: 'University', bn: 'বিশ্ববিদ্যালয়' },
  marketplace: { en: 'Market', bn: 'বাজার' },
};

// ── State ────────────────────────────────────────────────────────────────────

let _locations: CompactLocation[] | null = null;
let _loadPromise: Promise<CompactLocation[]> | null = null;

// ── Loader ───────────────────────────────────────────────────────────────────

async function loadLocations(): Promise<CompactLocation[]> {
  if (_locations) return _locations;
  if (_loadPromise) return _loadPromise;

  _loadPromise = fetch('/bd-locations.json')
    .then(r => r.json())
    .then((data: CompactLocation[]) => {
      _locations = data;
      console.log(`[LocationSearch] Loaded ${data.length} locations`);
      return data;
    })
    .catch(err => {
      console.warn('[LocationSearch] Failed to load bd-locations.json:', err.message);
      _loadPromise = null;
      return [] as CompactLocation[];
    });

  return _loadPromise;
}

// Preload in background (call early in app init)
export function preloadLocations() {
  loadLocations();
}

// ── Search ───────────────────────────────────────────────────────────────────

function scoreMatch(item: CompactLocation, q: string, qBn: string): number {
  const nLower = item.n.toLowerCase();
  let score = 0;

  // Exact match
  if (nLower === q || item.b === qBn) return 1000;

  // Starts-with
  if (nLower.startsWith(q)) score += 300;
  else if (item.b.startsWith(qBn || q)) score += 280;

  // Contains
  else if (nLower.includes(q)) score += 150;
  else if (item.b.includes(qBn || q)) score += 140;

  // Alias match
  else if (item.a.some(a => a.toLowerCase().includes(q))) score += 80;

  if (score === 0) return 0;

  // Boost by category priority
  const categoryBoost: Record<string, number> = {
    district: 40, division: 45, upazila: 35,
    railway_station: 30, bus_stop: 20, airport: 50, ferry_terminal: 25,
    city: 35, town: 20, suburb: 10, neighbourhood: 8, village: 5,
  };
  score += (categoryBoost[item.c] || 5);

  // Boost by confidence
  score += (item.cf || 75) * 0.2;

  return score;
}

export async function searchLocations(query: string, limit = 20): Promise<LocationResult[]> {
  if (!query.trim()) return [];
  const locs = await loadLocations();
  const q = query.toLowerCase().trim();
  const qBn = query.trim(); // Bengali search (keep original case)

  const scored: { item: CompactLocation; score: number }[] = [];

  for (const item of locs) {
    const score = scoreMatch(item, q, qBn);
    if (score > 0) scored.push({ item, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item, score }) => ({
      id: item.id,
      name: item.n,
      bnName: item.b,
      lat: item.lat ?? null,
      lng: item.lng ?? null,
      category: item.c,
      confidence: (item.cf || 75) / 100,
      score,
    }));
}

// Synchronous search on cached data (returns empty if not loaded yet)
export function searchLocationsSync(query: string, limit = 15): LocationResult[] {
  if (!_locations || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const qBn = query.trim();

  const scored: { item: CompactLocation; score: number }[] = [];
  for (const item of _locations) {
    const score = scoreMatch(item, q, qBn);
    if (score > 0) scored.push({ item, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item, score }) => ({
      id: item.id,
      name: item.n,
      bnName: item.b,
      lat: item.lat ?? null,
      lng: item.lng ?? null,
      category: item.c,
      confidence: (item.cf || 75) / 100,
      score,
    }));
}

// Get category display label
export function getCategoryLabel(category: string, lang: 'en' | 'bn' = 'en'): string {
  const labels = CATEGORY_LABELS[category];
  return labels ? labels[lang] : category;
}

// Find nearest locations to a coordinate
export async function findNearestLocations(
  lat: number, lng: number, radiusKm = 2, limit = 10
): Promise<LocationResult[]> {
  const locs = await loadLocations();

  function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  return locs
    .filter(l => l.lat && l.lng)
    .map(l => ({ l, d: haversineKm(lat, lng, l.lat!, l.lng!) }))
    .filter(({ d }) => d <= radiusKm)
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map(({ l }) => ({
      id: l.id, name: l.n, bnName: l.b,
      lat: l.lat!, lng: l.lng!,
      category: l.c, confidence: (l.cf || 75) / 100, score: 0,
    }));
}

// Resolve a location string to lat/lng (useful for routing)
export async function resolveToCoords(query: string): Promise<{ lat: number; lng: number; name: string } | null> {
  const results = await searchLocations(query, 1);
  const r = results[0];
  if (r?.lat && r?.lng) return { lat: r.lat, lng: r.lng, name: r.name || r.bnName };
  return null;
}
