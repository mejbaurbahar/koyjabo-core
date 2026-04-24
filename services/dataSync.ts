/**
 * Data Sync Service — backs up and restores transport data to/from
 * the private GitHub data repository via the Cloudflare Worker proxy.
 *
 * Data is always available offline from the bundled TypeScript files.
 * This service optionally syncs runtime-editable JSON overrides.
 */

const SYNC_KEY = 'koyjabo_data_sync';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface SyncMeta {
  lastSynced: number;
  version: string;
}

interface SyncResult {
  success: boolean;
  message: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROXY = (import.meta.env.VITE_API_PROXY as string | undefined)
  || 'https://koyjabo-auth-proxy.mejbaur-bahar.workers.dev';

async function ghGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${PROXY}/gh?r=d&p=${encodeURIComponent(path)}`);
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

async function ghPut(path: string, content: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${PROXY}/gh`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        action: 'save-data',
        userId: 'system',
        data: JSON.stringify({ path, content, message: `Data sync: ${path}` }),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function getCacheMeta(): SyncMeta | null {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCacheMeta(meta: SyncMeta): void {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(meta));
  } catch {
    // ignore storage quota issues
  }
}

function isCacheStale(): boolean {
  const meta = getCacheMeta();
  if (!meta) return true;
  return Date.now() - meta.lastSynced > CACHE_TTL;
}

// ── Data version check ────────────────────────────────────────────────────────

/**
 * Check if the remote data repo has a newer data version.
 * Returns the remote version string, or null if unavailable.
 */
export async function checkRemoteVersion(): Promise<string | null> {
  const manifest = await ghGet<{ version: string; updatedAt: string }>('data/transport/manifest.json');
  return manifest?.version ?? null;
}

// ── Override loading ──────────────────────────────────────────────────────────

/**
 * Load a named data override from GitHub (e.g. fare updates, new routes).
 * Falls back to null if network unavailable.
 */
export async function loadDataOverride<T>(name: string): Promise<T | null> {
  if (!isCacheStale()) {
    try {
      const cached = localStorage.getItem(`koyjabo_data_${name}`);
      if (cached) return JSON.parse(cached) as T;
    } catch {
      // ignore
    }
  }

  const data = await ghGet<T>(`data/transport/${name}.json`);
  if (data) {
    try {
      localStorage.setItem(`koyjabo_data_${name}`, JSON.stringify(data));
      setCacheMeta({ lastSynced: Date.now(), version: String(Date.now()) });
    } catch {
      // ignore
    }
  }
  return data;
}

// ── Export helpers (run once to seed the data repo) ───────────────────────────

/**
 * Export bundled transport data to the GitHub data repo.
 * Call this from an admin/dev action to seed or update the remote data.
 */
export async function exportTransportDataToRepo(): Promise<SyncResult> {
  const results: boolean[] = [];

  // Export fare overrides
  const fareOverrides = {
    version: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
    intercityFares: {
      'Dhaka-Chattogram': { bus: { min: 450, max: 1200 }, train: { min: 220, max: 1600 }, flight: { min: 2500, max: 8000 } },
      'Dhaka-Sylhet': { bus: { min: 500, max: 1300 }, train: { min: 250, max: 1800 }, flight: { min: 2800, max: 7000 } },
      'Dhaka-Khulna': { bus: { min: 600, max: 1500 }, train: { min: 300, max: 2000 }, launch: { min: 400, max: 1500 } },
      "Dhaka-Cox's Bazar": { bus: { min: 800, max: 2000 }, train: { min: 350, max: 2200 }, flight: { min: 3000, max: 9000 } },
      'Dhaka-Rajshahi': { bus: { min: 500, max: 1200 }, train: { min: 220, max: 1600 }, flight: { min: 2500, max: 7000 } },
      'Dhaka-Rangpur': { bus: { min: 600, max: 1500 }, train: { min: 300, max: 1800 } },
      'Dhaka-Barishal': { bus: { min: 500, max: 1200 }, launch: { min: 400, max: 1500 }, flight: { min: 2500, max: 6000 } },
      'Dhaka-Mymensingh': { bus: { min: 120, max: 300 }, train: { min: 80, max: 350 } },
      'Dhaka-Cumilla': { bus: { min: 150, max: 400 }, train: { min: 100, max: 450 } },
      'Dhaka-Bogura': { bus: { min: 400, max: 900 }, train: { min: 200, max: 900 } },
      'Dhaka-Dinajpur': { bus: { min: 500, max: 1200 }, train: { min: 280, max: 1200 } },
      'Dhaka-Jashore': { bus: { min: 500, max: 1200 }, train: { min: 250, max: 1100 }, flight: { min: 2500, max: 6000 } },
    }
  };

  const manifest = {
    version: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
    files: ['fare-overrides', 'metro-schedule', 'bus-operators'],
    description: 'KoyJabo transport data — auto-synced from app bundle',
  };

  const metroSchedule = {
    version: '2024-01',
    line: 'MRT-6',
    weekday: { first: '07:10', last: '20:40', frequency: '10 min peak, 15 min off-peak' },
    friday: 'Closed',
    holiday: { first: '07:10', last: '20:00', frequency: '15-20 min' },
    fares: [
      { from: 'Uttara North', to: 'Motijheel', fare: 100 },
      { from: 'Uttara North', to: 'Agargaon', fare: 60 },
      { from: 'Mirpur 10', to: 'Motijheel', fare: 60 },
      { from: 'Farmgate', to: 'Motijheel', fare: 30 },
    ]
  };

  const busOperators = {
    version: '2024-01',
    intercityOperators: [
      { name: 'Green Line', routes: ['Dhaka-Chattogram', 'Dhaka-Cox\'s Bazar', 'Dhaka-Sylhet'], type: 'AC', booking: 'Online + Counter' },
      { name: 'Hanif Enterprise', routes: ['Dhaka-Chattogram', 'Dhaka-Rajshahi', 'Dhaka-Khulna'], type: 'AC/Non-AC', booking: 'Counter' },
      { name: 'Shyamoli NR', routes: ['Dhaka-All major districts'], type: 'AC/Non-AC', booking: 'Counter' },
      { name: 'Shohagh Paribahan', routes: ['Dhaka-Sylhet', 'Dhaka-Chattogram'], type: 'AC', booking: 'Online + Counter' },
      { name: 'Ena Transport', routes: ['Dhaka-Sylhet', 'Dhaka-Mymensingh'], type: 'AC/Non-AC', booking: 'Counter' },
      { name: 'TR Travels', routes: ['Dhaka-Cox\'s Bazar', 'Dhaka-Chattogram'], type: 'AC', booking: 'Online + Counter' },
      { name: 'S Alam', routes: ['Dhaka-Chattogram', 'Dhaka-Cox\'s Bazar', 'Dhaka-Sylhet'], type: 'AC/Non-AC', booking: 'Counter' },
      { name: 'Saintmartin', routes: ['Dhaka-Cox\'s Bazar'], type: 'AC', booking: 'Counter' },
      { name: 'Soudia', routes: ['Dhaka-Cox\'s Bazar', 'Dhaka-Chattogram'], type: 'AC', booking: 'Counter' },
    ]
  };

  results.push(await ghPut('data/transport/manifest.json', manifest));
  results.push(await ghPut('data/transport/fare-overrides.json', fareOverrides));
  results.push(await ghPut('data/transport/metro-schedule.json', metroSchedule));
  results.push(await ghPut('data/transport/bus-operators.json', busOperators));

  const succeeded = results.filter(Boolean).length;
  return {
    success: succeeded > 0,
    message: `Exported ${succeeded}/${results.length} data files to repository`,
  };
}

// ── Fare override loader ──────────────────────────────────────────────────────

interface Routefare { min: number; max: number }
interface FareOverrides {
  intercityFares: Record<string, Record<string, Routefare>>;
}

let _fareOverrides: FareOverrides | null = null;

export async function getFareOverrides(): Promise<FareOverrides | null> {
  if (_fareOverrides) return _fareOverrides;
  const data = await loadDataOverride<FareOverrides>('fare-overrides');
  if (data) _fareOverrides = data;
  return data;
}

/**
 * Look up an exact fare from the remote overrides.
 * Returns null if no override exists (fall back to estimation).
 */
export async function lookupExactFare(from: string, to: string, mode: string): Promise<Routefare | null> {
  const overrides = await getFareOverrides();
  if (!overrides) return null;

  const key = `${from}-${to}`;
  const keyRev = `${to}-${from}`;
  const route = overrides.intercityFares[key] ?? overrides.intercityFares[keyRev];
  if (!route) return null;

  return route[mode.toLowerCase()] ?? null;
}
