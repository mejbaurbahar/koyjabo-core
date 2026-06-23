/**
 * Enhanced Travel AI — smart intent detection, fuzzy matching,
 * distance/fare estimation, multi-modal comparison, and route planning.
 * 100% offline — no external API calls.
 */

import { DISTRICT_COORDINATES } from '../intercity/constants';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TravelMode = 'bus' | 'train' | 'flight' | 'launch' | 'metro' | 'any';
export type Language = 'en' | 'bn';

export interface TravelIntent {
  type: 'route' | 'fare' | 'schedule' | 'comparison' | 'recommendation' | 'planning' | 'distance' | 'duration' | 'unknown';
  from?: string;
  to?: string;
  mode: TravelMode;
  preferences: {
    ac: boolean | null;
    budget: 'low' | 'mid' | 'high' | null;
    speed: boolean | null;  // true = user wants fast
    comfort: boolean | null;
  };
  language: Language;
  raw: string;
}

export interface FareEstimate {
  mode: TravelMode;
  min: number;
  max: number;
  unit: string;
  notes: string;
}

export interface RouteOption {
  mode: TravelMode;
  duration: string;
  fare: FareEstimate;
  comfort: number; // 1-5
  availability: 'high' | 'medium' | 'low';
  notes: string;
}

// ── Location aliases ──────────────────────────────────────────────────────────

const LOCATION_ALIASES: Record<string, string> = {
  // Banglish → canonical
  'dhaka': 'Dhaka', 'daka': 'Dhaka', 'dhaca': 'Dhaka', 'dhakar': 'Dhaka',
  'ctg': 'Chattogram', 'chittagong': 'Chattogram', 'chittagram': 'Chattogram',
  'chattagram': 'Chattogram', 'chottogram': 'Chattogram', 'cg': 'Chattogram',
  'sylhet': 'Sylhet', 'silet': 'Sylhet', 'sillet': 'Sylhet',
  'rajshahi': 'Rajshahi', 'rajsahi': 'Rajshahi', 'rshahi': 'Rajshahi',
  'khulna': 'Khulna', 'kulna': 'Khulna',
  'barishal': 'Barishal', 'barisal': 'Barishal', 'barsal': 'Barishal', 'brishal': 'Barishal',
  'rangpur': 'Rangpur', 'rngpur': 'Rangpur',
  'mymensingh': 'Mymensingh', 'maimansingh': 'Mymensingh', 'mymenshing': 'Mymensingh',
  'coxsbazar': "Cox's Bazar", 'coxs': "Cox's Bazar", 'cox': "Cox's Bazar",
  'coxbazar': "Cox's Bazar", 'coksbazar': "Cox's Bazar",
  'comilla': 'Cumilla', 'cumilla': 'Cumilla', 'comila': 'Cumilla',
  'bogra': 'Bogura', 'bogura': 'Bogura', 'bogora': 'Bogura',
  'jessore': 'Jashore', 'jashore': 'Jashore', 'jashor': 'Jashore',
  'benapole': 'Benapole', 'benapool': 'Benapole',
  'kushtia': 'Kushtia', 'kustia': 'Kushtia',
  'dinajpur': 'Dinajpur', 'dinajpore': 'Dinajpur',
  'pabna': 'Pabna', 'paabna': 'Pabna',
  'faridpur': 'Faridpur', 'faridpore': 'Faridpur',
  'noakhali': 'Noakhali', 'noakhaly': 'Noakhali', 'noakali': 'Noakhali',
  'chandpur': 'Chandpur', 'chanpur': 'Chandpur',
  'brahmanbaria': 'Brahmanbaria', 'brahmonbaria': 'Brahmanbaria', 'b.baria': 'Brahmanbaria',
  'tangail': 'Tangail', 'tangayal': 'Tangail',
  'sirajganj': 'Sirajganj', 'sirajgunj': 'Sirajganj',
  'gazipur': 'Gazipur', 'gazipour': 'Gazipur',
  'narayanganj': 'Narayanganj', 'narayangonj': 'Narayanganj', 'naryanganj': 'Narayanganj',
  'narsingdi': 'Narsingdi', 'narsindi': 'Narsingdi',
  'bandarban': 'Bandarban', 'bandorban': 'Bandarban', 'bandarbon': 'Bandarban',
  'rangamati': 'Rangamati', 'rangamathi': 'Rangamati',
  'khagrachhari': 'Khagrachari', 'khagrachari': 'Khagrachari',
  'panchagarh': 'Panchagarh', 'panchagar': 'Panchagarh',
  'thakurgaon': 'Thakurgaon', 'thakurgaoun': 'Thakurgaon',
  'munshiganj': 'Munshiganj', 'munshigonj': 'Munshiganj',
  'manikganj': 'Manikganj', 'manikgunj': 'Manikganj',
  'gopalganj': 'Gopalganj', 'gopalgonj': 'Gopalganj',
  'madaripur': 'Madaripur', 'madaripore': 'Madaripur',
  'shariatpur': 'Shariatpur', 'sariatpur': 'Shariatpur',
  'lakshmipur': 'Lakshmipur', 'laxmipur': 'Lakshmipur',
  'bhola': 'Bhola', 'bola': 'Bhola',
  'patuakhali': 'Patuakhali', 'pothuakhali': 'Patuakhali',
  'barguna': 'Barguna', 'borguna': 'Barguna',
  'pirojpur': 'Pirojpur', 'perojpur': 'Pirojpur',
  'bagerhat': 'Bagerhat',
  'narail': 'Narail', 'naral': 'Narail',
  'meherpur': 'Meherpur', 'mehrpur': 'Meherpur',
  'kurigram': 'Kurigram', 'kurigramm': 'Kurigram',
  'gaibandha': 'Gaibandha', 'gaibanda': 'Gaibandha',
  'lalmonirhat': 'Lalmonirhat', 'lalmonierhat': 'Lalmonirhat',
  'nilphamari': 'Nilphamari', 'nilphomari': 'Nilphamari',
  'joypurhat': 'Joypurhat', 'joipurhat': 'Joypurhat',
  'naogaon': 'Naogaon', 'naugaon': 'Naogaon',
  'chapainawabganj': 'Chapainawabganj', 'nawabganj': 'Chapainawabganj', 'chapai': 'Chapainawabganj',
  'natore': 'Natore', 'nathor': 'Natore',
  'habiganj': 'Habiganj', 'habigonj': 'Habiganj',
  'sunamganj': 'Sunamganj', 'sunamgunj': 'Sunamganj',
  'moulvibazar': 'Moulvibazar', 'srimangal': 'Moulvibazar',
  'srimangol': 'Moulvibazar', 'sreemangal': 'Moulvibazar',
  'jamalpur': 'Jamalpur', 'jamalpore': 'Jamalpur',
  'sherpur': 'Sherpur', 'sharpur': 'Sherpur',
  'netrokona': 'Netrokona', 'netrokhona': 'Netrokona',
  'kishoreganj': 'Kishoreganj', 'kishoregonj': 'Kishoreganj',
  'sundarbans': 'Khulna', 'sundarban': 'Khulna',
  'st.martin': "Saint Martin's Island", 'stmartin': "Saint Martin's Island", 'saintmartin': "Saint Martin's Island",
  'teknaf': 'Cox\'s Bazar', 'inani': "Cox's Bazar", 'himchari': "Cox's Bazar",
  'jaflong': 'Sylhet', 'ratargul': 'Sylhet', 'bichnakandi': 'Sylhet',
  'nilgiri': 'Bandarban', 'nafakum': 'Bandarban',
  'kuakata': 'Patuakhali',
  'maowa': 'Munshiganj', 'paturia': 'Manikganj', 'aricha': 'Manikganj',
  'kamlapur': 'Dhaka', 'kamalapur': 'Dhaka', 'airport': 'Dhaka',
  'sadarghat': 'Dhaka', 'mohakhali': 'Dhaka', 'gabtoli': 'Dhaka',
  // Bengali transliterations
  'ঢাকা': 'Dhaka', 'চট্টগ্রাম': 'Chattogram', 'সিলেট': 'Sylhet',
  'রাজশাহী': 'Rajshahi', 'খুলনা': 'Khulna', 'বরিশাল': 'Barishal',
  'রংপুর': 'Rangpur', 'ময়মনসিংহ': 'Mymensingh', 'কক্সবাজার': "Cox's Bazar",
  'কুমিল্লা': 'Cumilla', 'ফেনী': 'Feni', 'বগুড়া': 'Bogura',
  'যশোর': 'Jashore', 'কুষ্টিয়া': 'Kushtia', 'দিনাজপুর': 'Dinajpur',
  'পাবনা': 'Pabna', 'ফরিদপুর': 'Faridpur', 'নোয়াখালী': 'Noakhali',
  'চাঁদপুর': 'Chandpur', 'ব্রাহ্মণবাড়িয়া': 'Brahmanbaria', 'নাটোর': 'Natore',
  'টাঙ্গাইল': 'Tangail', 'সিরাজগঞ্জ': 'Sirajganj', 'নওগাঁ': 'Naogaon',
  'চাঁপাইনবাবগঞ্জ': 'Chapainawabganj', 'গাজীপুর': 'Gazipur',
  'নারায়ণগঞ্জ': 'Narayanganj', 'নরসিংদী': 'Narsingdi',
  'বান্দরবান': 'Bandarban', 'রাঙ্গামাটি': 'Rangamati', 'খাগড়াছড়ি': 'Khagrachari',
  'পঞ্চগড়': 'Panchagarh', 'ঠাকুরগাঁও': 'Thakurgaon', 'মুন্সীগঞ্জ': 'Munshiganj',
  'মানিকগঞ্জ': 'Manikganj', 'গোপালগঞ্জ': 'Gopalganj', 'মাদারীপুর': 'Madaripur',
  'শরীয়তপুর': 'Shariatpur', 'লক্ষ্মীপুর': 'Lakshmipur', 'ভোলা': 'Bhola',
  'পটুয়াখালী': 'Patuakhali', 'বরগুনা': 'Barguna', 'পিরোজপুর': 'Pirojpur',
  'ঝালকাঠি': 'Jhalokati', 'বাগেরহাট': 'Bagerhat', 'নড়াইল': 'Narail',
  'মেহেরপুর': 'Meherpur', 'চুয়াডাঙ্গা': 'Chuadanga', 'মাগুরা': 'Magura',
  'ঝিনাইদহ': 'Jhenaidah', 'রাজবাড়ী': 'Rajbari', 'জামালপুর': 'Jamalpur',
  'শেরপুর': 'Sherpur', 'নেত্রকোণা': 'Netrokona', 'কিশোরগঞ্জ': 'Kishoreganj',
  'সুনামগঞ্জ': 'Sunamganj', 'হবিগঞ্জ': 'Habiganj', 'মৌলভীবাজার': 'Moulvibazar',
  'নীলফামারী': 'Nilphamari', 'গাইবান্ধা': 'Gaibandha', 'কুড়িগ্রাম': 'Kurigram',
  'লালমনিরহাট': 'Lalmonirhat', 'জয়পুরহাট': 'Joypurhat', 'সাতক্ষীরা': 'Satkhira',
  'কুয়াকাটা': 'Patuakhali', 'বেনাপোল': 'Benapole',
};

// ── Distance calculation ──────────────────────────────────────────────────────

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateDistanceKm(from: string, to: string): number | null {
  const c1 = DISTRICT_COORDINATES[from];
  const c2 = DISTRICT_COORDINATES[to];
  if (!c1 || !c2) return null;
  // Add ~15% road factor over straight-line distance
  return Math.round(haversineKm(c1[0], c1[1], c2[0], c2[1]) * 1.15);
}

// ── Fare estimation ───────────────────────────────────────────────────────────

const SPEED_KMH: Record<TravelMode, number> = {
  bus: 50, train: 65, flight: 600, launch: 25, metro: 40, any: 50
};

const FARE_RATE: Record<TravelMode, { min: number; max: number }> = {
  bus: { min: 1.5, max: 3.0 },
  train: { min: 0.8, max: 2.8 },
  flight: { min: 10, max: 20 },
  launch: { min: 1.2, max: 3.5 },
  metro: { min: 5, max: 8 },
  any: { min: 1.5, max: 3.0 },
};

const COMFORT: Record<TravelMode, number> = {
  flight: 5, train: 4, launch: 3, bus: 3, metro: 4, any: 3
};

export function estimateFares(distKm: number): Record<TravelMode, FareEstimate> {
  const modes: TravelMode[] = ['bus', 'train', 'flight', 'launch'];
  const result = {} as Record<TravelMode, FareEstimate>;
  for (const mode of modes) {
    const r = FARE_RATE[mode];
    const baseMin = Math.round(distKm * r.min / 10) * 10;
    const baseMax = Math.round(distKm * r.max / 10) * 10;
    result[mode] = {
      mode,
      min: Math.max(baseMin, mode === 'flight' ? 2500 : mode === 'launch' ? 250 : mode === 'train' ? 150 : 100),
      max: Math.max(baseMax, mode === 'flight' ? 5000 : mode === 'launch' ? 800 : mode === 'train' ? 500 : 400),
      unit: '৳',
      notes: mode === 'flight' ? 'One-way, advance booking' : mode === 'launch' ? 'Deck to cabin class' : mode === 'train' ? 'Shuvan to AC Berth' : 'Non-AC to AC',
    };
  }
  return result;
}

export function estimateDuration(distKm: number, mode: TravelMode): string {
  const speed = SPEED_KMH[mode] || 50;
  const hours = distKm / speed;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60 / 15) * 15;
  if (h === 0) return `~${m} min`;
  if (m === 0) return `~${h} hr`;
  return `~${h} hr ${m} min`;
}

// ── Fuzzy location matcher ────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

const ALL_DISTRICTS = Object.keys(DISTRICT_COORDINATES);

export function fuzzyMatchLocation(word: string): string | null {
  const lower = word.toLowerCase().trim();

  // Direct alias lookup first
  if (LOCATION_ALIASES[lower]) return LOCATION_ALIASES[lower];
  if (LOCATION_ALIASES[word]) return LOCATION_ALIASES[word];

  // Exact canonical match
  const exact = ALL_DISTRICTS.find(d => d.toLowerCase() === lower);
  if (exact) return exact;

  // Prefix match (e.g. "sylh" → "Sylhet")
  if (lower.length >= 4) {
    const prefix = ALL_DISTRICTS.find(d => d.toLowerCase().startsWith(lower));
    if (prefix) return prefix;
  }

  // Levenshtein fuzzy match (max 2 edits for names ≥6 chars)
  if (lower.length >= 5) {
    let best: string | null = null;
    let bestDist = 999;
    for (const d of ALL_DISTRICTS) {
      const dist = levenshtein(lower, d.toLowerCase());
      const maxEdits = d.length >= 8 ? 2 : 1;
      if (dist < bestDist && dist <= maxEdits) {
        bestDist = dist;
        best = d;
      }
    }
    if (best) return best;
  }

  return null;
}

// ── Intent classifier ─────────────────────────────────────────────────────────

const MODE_KEYWORDS: Record<TravelMode, string[]> = {
  bus: ['bus', 'বাস', 'coach', 'paribahan', 'poribohan', 'শ্যামলী', 'হানিফ', 'সোহাগ', 'greenline', 'green line', 'hanif', 'shyamoli'],
  train: ['train', 'ট্রেন', 'railway', 'রেলওয়ে', 'express', 'kamalapur', 'কমলাপুর', 'tren', 'trein'],
  flight: ['flight', 'বিমান', 'plane', 'fly', 'ফ্লাইট', 'air', 'airways', 'airline', 'airport', 'এয়ার'],
  launch: ['launch', 'লঞ্চ', 'ferry', 'boat', 'নৌকা', 'জাহাজ', 'sadarghat', 'সদরঘাট', 'ship'],
  metro: ['metro', 'মেট্রো', 'mrt', 'uttara', 'motijheel', 'উত্তরা', 'মতিঝিল'],
  any: [],
};

function detectMode(lower: string): TravelMode {
  for (const [mode, kws] of Object.entries(MODE_KEYWORDS) as [TravelMode, string[]][]) {
    if (mode === 'any') continue;
    if (kws.some(kw => lower.includes(kw))) return mode;
  }
  return 'any';
}

const INTENT_PATTERNS = {
  fare: /(fare|ভাড়া|vara|cost|price|কত|kotai|koyta|taka|টাকা|মূল্য|দাম)/,
  comparison: /(vs|versus|better|faster|compare|নাকি|বা|or|কোনটা|which|best way|সেরা)/,
  recommendation: /(suggest|recommend|best|optimal|সেরা|ভালো|ভালো উপায়|কোনটা ভালো|which is better)/,
  planning: /(plan|itinerary|tour|trip plan|schedule trip|ট্যুর প্ল্যান|পরিকল্পনা)/,
  distance: /(distance|কতদূর|কত কিমি|km|kilometer|দূরত্ব|দূরে|কিলোমিটার)/,
  duration: /(time|how long|কত সময়|সময়|কতক্ষণ|ঘণ্টা|hours|minutes|মিনিট)/,
  schedule: /(time|schedule|depart|arrive|ছাড়ে|পৌঁছায়|টাইম|সময়সূচি|কখন)/,
  route: /(route|how|go|reach|jabo|যাব|কিভাবে|যেতে|পৌঁছাতে|path|রাস্তা)/,
};

function detectIntentType(lower: string): TravelIntent['type'] {
  if (INTENT_PATTERNS.comparison.test(lower)) return 'comparison';
  if (INTENT_PATTERNS.recommendation.test(lower)) return 'recommendation';
  if (INTENT_PATTERNS.planning.test(lower)) return 'planning';
  if (INTENT_PATTERNS.distance.test(lower)) return 'distance';
  if (INTENT_PATTERNS.duration.test(lower)) return 'duration';
  if (INTENT_PATTERNS.fare.test(lower)) return 'fare';
  if (INTENT_PATTERNS.schedule.test(lower)) return 'schedule';
  if (INTENT_PATTERNS.route.test(lower)) return 'route';
  return 'unknown';
}

// Tokenize a query and extract location mentions (handles multi-word names)
// Returns locations sorted by their FIRST occurrence in the query, so positional
// order is preserved: "X to Y" always yields [X, Y], never [Y, X].
function extractLocations(query: string): string[] {
  const lower = query.toLowerCase();
  const found: string[] = [];

  // Try multi-word matches first ("cox's bazar", "st. martin")
  for (const [alias, canonical] of Object.entries(LOCATION_ALIASES)) {
    if (lower.includes(alias) && !found.includes(canonical)) {
      found.push(canonical);
    }
  }
  // Try canonical names
  for (const d of ALL_DISTRICTS) {
    if (lower.includes(d.toLowerCase()) && !found.includes(d)) {
      found.push(d);
    }
  }
  // Try individual tokens with fuzzy matching
  const tokens = lower.split(/[\s,\/→→⟶\-]+/);
  for (const token of tokens) {
    if (token.length < 3) continue;
    const matched = fuzzyMatchLocation(token);
    if (matched && !found.includes(matched)) {
      found.push(matched);
    }
  }

  const unique = [...new Set(found)];

  // Sort by first occurrence position in the lowercased query so that
  // "Benapole to Dhaka" → [Benapole, Dhaka] and "Dhaka to Benapole" → [Dhaka, Benapole].
  unique.sort((a, b) => {
    const posA = lower.indexOf(a.toLowerCase());
    const posB = lower.indexOf(b.toLowerCase());
    return (posA < 0 ? 99999 : posA) - (posB < 0 ? 99999 : posB);
  });

  return unique;
}

export function classifyIntent(query: string): TravelIntent {
  const lower = query.toLowerCase();
  const isBn = /[\u0980-\u09FF]/.test(query);
  const locations = extractLocations(query);

  // Nav-intent detection: "how to go X", "route to X", "X jabo", "reach X" etc.
  // In these patterns the named place is ALWAYS the destination, never the origin.
  // When we detect this and only one location was found, assign it to `to` (from = GPS context).
  const isNavToIntent = locations.length === 1 &&
    /\b(how\s+(?:to\s+)?(?:go|get|reach)|route\s+to|reach|go\s+to|want\s+to\s+go|directions?\s+to|jabo|jaite|jete|jite|kivabe|kemne|যাব|যেতে|যাবো|কিভাবে|কেমনে)\b/i.test(lower);

  return {
    type: detectIntentType(lower),
    from: isNavToIntent ? undefined : locations[0],
    to: isNavToIntent ? locations[0] : locations[1],
    mode: detectMode(lower),
    preferences: {
      ac: lower.includes('ac') || lower.includes('এসি') ? true
        : lower.includes('non ac') || lower.includes('নন এসি') ? false : null,
      budget: lower.match(/(cheap|budget|কম দামে|সস্তা|সস্তায)/) ? 'low'
        : lower.match(/(luxury|বিলাস|comfortable|আরামদায়ক)/) ? 'high' : null,
      speed: lower.match(/(fast|quick|দ্রুত|তাড়াতাড়ি|fastest)/) ? true : null,
      comfort: lower.match(/(comfort|আরাম|আরামদায়ক)/) ? true : null,
    },
    language: isBn ? 'bn' : 'en',
    raw: query,
  };
}

// ── Route comparison ──────────────────────────────────────────────────────────

interface ModeAvailability {
  bus: boolean; train: boolean; flight: boolean; launch: boolean;
}

// Rough connectivity matrix (from offlineService)
const DISTRICT_CONNECTIVITY: Record<string, ModeAvailability> = {
  'Dhaka': { bus: true, train: true, flight: true, launch: true },
  'Chattogram': { bus: true, train: true, flight: true, launch: true },
  'Sylhet': { bus: true, train: true, flight: true, launch: false },
  'Rajshahi': { bus: true, train: true, flight: true, launch: false },
  'Khulna': { bus: true, train: true, flight: false, launch: true },
  'Barishal': { bus: true, train: false, flight: true, launch: true },
  'Rangpur': { bus: true, train: true, flight: false, launch: false },
  'Mymensingh': { bus: true, train: true, flight: false, launch: false },
  "Cox's Bazar": { bus: true, train: true, flight: true, launch: true },
  'Jashore': { bus: true, train: true, flight: true, launch: false },
  'Bogura': { bus: true, train: true, flight: false, launch: false },
  'Cumilla': { bus: true, train: true, flight: false, launch: false },
  'Dinajpur': { bus: true, train: true, flight: false, launch: false },
  'Moulvibazar': { bus: true, train: true, flight: false, launch: false },
  'Chandpur': { bus: true, train: true, flight: false, launch: true },
  'Bhola': { bus: true, train: false, flight: false, launch: true },
  'Patuakhali': { bus: true, train: false, flight: false, launch: true },
};

function getModeAvailability(district: string): ModeAvailability {
  return DISTRICT_CONNECTIVITY[district] ?? { bus: true, train: false, flight: false, launch: false };
}

export function buildRouteOptions(from: string, to: string): RouteOption[] {
  const distKm = estimateDistanceKm(from, to);
  if (!distKm) return [];

  const fares = estimateFares(distKm);
  const fromConn = getModeAvailability(from);
  const toConn = getModeAvailability(to);

  const modes: TravelMode[] = ['bus', 'train', 'flight', 'launch'];
  return modes
    .filter(m => fromConn[m as keyof ModeAvailability] && toConn[m as keyof ModeAvailability])
    .map(m => ({
      mode: m,
      duration: estimateDuration(distKm, m),
      fare: fares[m],
      comfort: COMFORT[m],
      availability: m === 'bus' ? 'high' : m === 'train' ? 'medium' : m === 'flight' ? 'medium' : 'low',
      notes: m === 'bus' ? 'Multiple operators, frequent departures'
        : m === 'train' ? 'Book advance online at shohoz.com'
          : m === 'flight' ? 'Biman/US-Bangla/Novoair'
            : 'Sadarghat terminal, evening departure',
    }));
}

// ── Response generators ───────────────────────────────────────────────────────

const MODE_EMOJI: Record<TravelMode, string> = {
  bus: '🚌', train: '🚂', flight: '✈️', launch: '🚢', metro: '🚇', any: '🗺️'
};

const MODE_BN: Record<TravelMode, string> = {
  bus: 'বাস', train: 'ট্রেন', flight: 'বিমান', launch: 'লঞ্চ', metro: 'মেট্রো', any: 'যেকোনো'
};

export function generateDistanceResponse(from: string, to: string, lang: Language): string {
  const dist = estimateDistanceKm(from, to);
  if (!dist) return '';
  const toName = lang === 'bn' ? (LOCATION_ALIASES[to.toLowerCase()] || to) : to;
  const fromName = lang === 'bn' ? (LOCATION_ALIASES[from.toLowerCase()] || from) : from;
  return lang === 'bn'
    ? `📏 **${fromName} → ${toName} দূরত্ব:** আনুমানিক **${dist} কিমি** (সড়কপথে)`
    : `📏 **${from} → ${to} Distance:** Approximately **${dist} km** (by road)`;
}

export function generateComparisonResponse(from: string, to: string, lang: Language): string {
  const options = buildRouteOptions(from, to);
  if (options.length === 0) return '';

  const dist = estimateDistanceKm(from, to)!;
  const header = lang === 'bn'
    ? `🗺️ **${from} → ${to}** (${dist} কিমি) — পরিবহন তুলনা:\n\n`
    : `🗺️ **${from} → ${to}** (${dist} km) — Transport Comparison:\n\n`;

  const rows = options.map(o => {
    const emoji = MODE_EMOJI[o.mode];
    const modeName = lang === 'bn' ? MODE_BN[o.mode] : o.mode.charAt(0).toUpperCase() + o.mode.slice(1);
    const fareStr = `৳${o.fare.min.toLocaleString()}-${o.fare.max.toLocaleString()}`;
    const comfort = '⭐'.repeat(o.comfort);
    return lang === 'bn'
      ? `${emoji} **${modeName}** — ⏱️ ${o.duration} | 💰 ${fareStr} | ${comfort} | ${o.notes}`
      : `${emoji} **${modeName}** — ⏱️ ${o.duration} | 💰 ${fareStr} | ${comfort} | ${o.notes}`;
  });

  // Best recommendation
  const fastest = options.reduce((a, b) => {
    const parseH = (s: string) => parseFloat(s.replace('~', '').replace(' hr', '').replace(' min', ''));
    return parseH(a.duration) < parseH(b.duration) ? a : b;
  });
  const cheapest = options.reduce((a, b) => a.fare.min < b.fare.min ? a : b);

  const rec = lang === 'bn'
    ? `\n💡 **সুপারিশ:** ${MODE_EMOJI[fastest.mode]} **${MODE_BN[fastest.mode]}** — সবচেয়ে দ্রুত | 💰 ${MODE_EMOJI[cheapest.mode]} **${MODE_BN[cheapest.mode]}** — সবচেয়ে সাশ্রয়ী`
    : `\n💡 **Recommendation:** ${MODE_EMOJI[fastest.mode]} **${fastest.mode}** — Fastest | 💰 ${MODE_EMOJI[cheapest.mode]} **${cheapest.mode}** — Most affordable`;

  return header + rows.join('\n') + rec;
}

export function generateFareResponse(from: string, to: string, mode: TravelMode, lang: Language): string {
  const dist = estimateDistanceKm(from, to);
  if (!dist) return '';
  const fares = estimateFares(dist);
  const f = fares[mode === 'any' ? 'bus' : mode];
  const modeName = lang === 'bn' ? MODE_BN[mode === 'any' ? 'bus' : mode] : (mode === 'any' ? 'Bus' : mode.charAt(0).toUpperCase() + mode.slice(1));
  return lang === 'bn'
    ? `💰 **${from} → ${to} ${modeName} ভাড়া:**\nআনুমানিক **৳${f.min.toLocaleString()} - ৳${f.max.toLocaleString()}**\n*(${f.notes})*\n📏 দূরত্ব: ${dist} কিমি`
    : `💰 **${from} → ${to} ${modeName} Fare:**\nEstimated **৳${f.min.toLocaleString()} - ৳${f.max.toLocaleString()}**\n*(${f.notes})*\n📏 Distance: ${dist} km`;
}

export function generateDurationResponse(from: string, to: string, mode: TravelMode, lang: Language): string {
  const dist = estimateDistanceKm(from, to);
  if (!dist) return '';
  const effectiveMode = mode === 'any' ? 'bus' : mode;
  const dur = estimateDuration(dist, effectiveMode);
  const modeName = lang === 'bn' ? MODE_BN[effectiveMode] : effectiveMode.charAt(0).toUpperCase() + effectiveMode.slice(1);
  return lang === 'bn'
    ? `⏱️ **${from} → ${to} ${modeName}ে সময়:** ${dur}\n*(${dist} কিমি, ট্রাফিক পরিস্থিতি অনুযায়ী কম-বেশি হতে পারে)*`
    : `⏱️ **${from} → ${to} by ${modeName}:** ${dur}\n*(${dist} km, may vary with traffic conditions)*`;
}

// ── Smart response builder (main entry point) ─────────────────────────────────

export function buildSmartResponse(query: string): string {
  const intent = classifyIntent(query);
  const { from, to, mode, type, language: lang } = intent;

  if (!from && !to) return '';

  // Single location — provide overview
  if (from && !to) {
    const dist = estimateDistanceKm('Dhaka', from);
    const dur = dist ? estimateDuration(dist, 'bus') : null;
    return lang === 'bn'
      ? `📍 **${from}:** ঢাকা থেকে ${dist ? `${dist} কিমি দূরে` : ''}${dur ? `, বাসে ${dur}` : ''}। রুট জানতে লিখুন "ঢাকা থেকে ${from}"`
      : `📍 **${from}:** ${dist ? `${dist} km from Dhaka` : ''}${dur ? `, ~${dur} by bus` : ''}. Type "Dhaka to ${from}" for full route info.`;
  }

  if (!from || !to) return '';

  switch (type) {
    case 'comparison': return generateComparisonResponse(from, to, lang);
    case 'fare': return generateFareResponse(from, to, mode, lang);
    case 'duration': return generateDurationResponse(from, to, mode, lang);
    case 'distance': return generateDistanceResponse(from, to, lang);
    default: {
      // Route intent — build comparison + distance as fallback
      const comp = generateComparisonResponse(from, to, lang);
      return comp || generateDistanceResponse(from, to, lang);
    }
  }
}
