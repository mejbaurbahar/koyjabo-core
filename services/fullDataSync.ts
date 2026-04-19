/**
 * Full Data Sync — keeps ALL platform data mirrored in the private GitHub
 * data repo so nothing is ever lost.
 *
 * Syncs:
 *   data/transport/   → bus routes, metro stations, train routes, intercity fares
 *   data/ai/          → learned answers, location aliases, learning stats
 *   data/chat/{uid}/  → per-user (or anonymous) chat session history
 *
 * Strategy:
 *   • On startup: pull from repo → merge into localStorage (non-destructive)
 *   • Periodic:   push localStorage → repo every PUSH_INTERVAL ms
 *   • Triggered:  after new chat message or after AI learns a new answer
 */

import { BUS_DATA, METRO_STATIONS, STATIONS } from '../constants';
import { BD_TRAIN_ROUTES, TRAIN_STATIONS } from '../data/bangladeshTrainData';
import { getAllSessions } from './chatHistoryManager';
import { responseCache, aliasLearner, getLearningStats, queryStore } from './aiLearning';

// ── Constants ─────────────────────────────────────────────────────────────────

const PUSH_INTERVAL_MS = 10 * 60 * 1000;      // push to repo every 10 min
const TRANSPORT_VERSION = '2026-04-19';        // bump when transport data changes

const SYNC_META_KEY = 'kj_sync_meta';

interface SyncMeta {
  lastPush: number;
  lastPull: number;
  transportVersion: string;
}

// ── Low-level helpers ─────────────────────────────────────────────────────────

async function repoGet<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`/api/gh?r=d&p=${encodeURIComponent(path)}`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    return r.json() as Promise<T>;
  } catch { return null; }
}

async function repoPut(path: string, content: unknown): Promise<boolean> {
  try {
    const r = await fetch('/api/gh-data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content }),
      signal: AbortSignal.timeout(12000),
    });
    return r.ok;
  } catch { return false; }
}

function readMeta(): SyncMeta {
  try { return JSON.parse(localStorage.getItem(SYNC_META_KEY) ?? '{}'); } catch { return {} as SyncMeta; }
}

function writeMeta(patch: Partial<SyncMeta>): void {
  try { localStorage.setItem(SYNC_META_KEY, JSON.stringify({ ...readMeta(), ...patch })); } catch { /* quota */ }
}

function getAuthUserId(): string | null {
  try {
    const s = localStorage.getItem('koyjabo_auth_session');
    return s ? JSON.parse(s)?.user?.id ?? null : null;
  } catch { return null; }
}

// ── Transport data export ─────────────────────────────────────────────────────

function buildBusExport() {
  return {
    version: TRANSPORT_VERSION,
    count: BUS_DATA.length,
    routes: BUS_DATA.map(b => ({
      id: b.id ?? b.name,
      name: b.name,
      bnName: b.bnName ?? '',
      routeString: b.routeString,
      stops: b.stops,
    })),
  };
}

function buildMetroExport() {
  return {
    version: TRANSPORT_VERSION,
    line: 'MRT-6',
    timing: { weekday: { first: '07:10', last: '20:40' }, friday: 'Closed' },
    stations: Object.values(METRO_STATIONS).map(s => ({
      id: s.id,
      name: s.name,
      bnName: s.bnName,
      lat: s.lat,
      lng: s.lng,
      zone: (s as unknown as Record<string, string>).zone ?? '',
    })),
  };
}

function buildTrainExport() {
  return {
    version: TRANSPORT_VERSION,
    stationCount: Object.keys(TRAIN_STATIONS).length,
    routeCount: BD_TRAIN_ROUTES.length,
    stations: Object.values(TRAIN_STATIONS).map(s => ({
      id: s.id, name: s.name, bnName: s.bnName, lat: s.lat, lng: s.lng,
    })),
    routes: BD_TRAIN_ROUTES.map(r => ({
      id: r.id, name: r.name, bnName: r.bnName, number: r.number,
      type: r.type, from: r.from, to: r.to, stops: r.stops,
      dhakaDepart: r.dhakaDepart, returnDepart: r.returnDepart,
      distanceKm: r.distanceKm, offDay: r.offDay,
      fare: r.fare,
    })),
  };
}

function buildStationsExport() {
  return {
    version: TRANSPORT_VERSION,
    count: Object.keys(STATIONS).length,
    stations: Object.values(STATIONS).map(s => ({
      id: s.id, name: s.name, bnName: s.bnName ?? '',
      lat: s.lat, lng: s.lng,
    })),
  };
}

function buildManifest(files: string[]) {
  return {
    version: TRANSPORT_VERSION,
    updatedAt: new Date().toISOString(),
    files,
    description: 'KoyJabo platform data — auto-synced from app',
    counts: {
      busRoutes: BUS_DATA.length,
      trainRoutes: BD_TRAIN_ROUTES.length,
      trainStations: Object.keys(TRAIN_STATIONS).length,
      metroStations: Object.keys(METRO_STATIONS).length,
      dhakaStations: Object.keys(STATIONS).length,
    },
  };
}

// ── AI learning data ──────────────────────────────────────────────────────────

function buildAILearningExport() {
  return {
    version: new Date().toISOString(),
    learnedAnswers: responseCache.getAll(),
    aliases: aliasLearner.getAll(),
    stats: getLearningStats(),
  };
}

// ── Chat history ──────────────────────────────────────────────────────────────

function buildChatExport() {
  const sessions = getAllSessions();
  return {
    version: new Date().toISOString(),
    sessionCount: sessions.length,
    sessions: sessions.map(s => ({
      id: s.id,
      createdAt: s.createdAt,
      lastUpdated: s.lastUpdated,
      messageCount: s.messages.length,
      messages: s.messages,
    })),
  };
}

// ── Pull: repo → localStorage ─────────────────────────────────────────────────

async function pullAILearning(): Promise<void> {
  const remote = await repoGet<ReturnType<typeof buildAILearningExport>>('data/ai/learning.json');
  if (!remote) return;

  // Merge learned answers (remote fills gaps in local)
  const localAnswers = responseCache.getAll();
  const localKeys = new Set(localAnswers.map(a => a.key));
  for (const ra of remote.learnedAnswers ?? []) {
    if (!localKeys.has(ra.key)) {
      responseCache.set(ra.key, ra.answer, ra.confidence, ra.sources, ra.triggerCount);
    }
  }

  // Merge aliases (remote fills gaps in local)
  const localAliasMap = new Map(aliasLearner.getAll().map(a => [a.raw, a]));
  for (const ra of remote.aliases ?? []) {
    if (!localAliasMap.has(ra.raw)) {
      aliasLearner.record(ra.raw, ra.canonical);
    }
  }
}

async function pullChatHistory(userId: string): Promise<void> {
  const path = `data/chat/${userId}/sessions.json`;
  const remote = await repoGet<ReturnType<typeof buildChatExport>>(path);
  if (!remote?.sessions?.length) return;

  // Merge: add remote sessions missing locally
  const local = getAllSessions();
  const localIds = new Set(local.map(s => s.id));
  const toAdd = remote.sessions.filter(s => !localIds.has(s.id));
  if (toAdd.length === 0) return;

  const merged = [...local, ...toAdd]
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-50); // keep last 50
  try {
    localStorage.setItem('dhaka_commute_chat_history', JSON.stringify(merged));
  } catch { /* quota */ }
}

// ── Push: localStorage → repo ─────────────────────────────────────────────────

export async function pushAILearning(): Promise<boolean> {
  const data = buildAILearningExport();
  if (!data.learnedAnswers.length && !data.aliases.length) return true; // nothing to push
  return repoPut('data/ai/learning.json', data);
}

export async function pushChatHistory(userId?: string): Promise<boolean> {
  const uid = userId ?? getAuthUserId();
  if (!uid) {
    // Anonymous: still back up under 'anonymous' key
    return repoPut('data/chat/anonymous/sessions.json', buildChatExport());
  }
  return repoPut(`data/chat/${uid}/sessions.json`, buildChatExport());
}

// Transport export runs in chunks to avoid blocking the main thread
export async function pushTransportData(): Promise<{ pushed: number; failed: number }> {
  const tasks: Array<[string, unknown]> = [
    ['data/transport/bus-routes.json', buildBusExport()],
    ['data/transport/metro-stations.json', buildMetroExport()],
    ['data/transport/train-routes.json', buildTrainExport()],
    ['data/transport/dhaka-stations.json', buildStationsExport()],
  ];

  let pushed = 0, failed = 0;
  for (const [path, data] of tasks) {
    const ok = await repoPut(path, data);
    ok ? pushed++ : failed++;
    await new Promise(r => setTimeout(r, 300)); // small delay between writes
  }

  // Write manifest last
  const files = tasks.map(([p]) => p.split('/').pop()!);
  const manifestOk = await repoPut('data/transport/manifest.json', buildManifest(files));
  manifestOk ? pushed++ : failed++;

  if (pushed > 0) writeMeta({ transportVersion: TRANSPORT_VERSION });
  return { pushed, failed };
}

// ── Full push (all data) ──────────────────────────────────────────────────────

export async function pushAll(): Promise<void> {
  const uid = getAuthUserId();
  await Promise.allSettled([
    pushAILearning(),
    pushChatHistory(uid ?? undefined),
  ]);
  writeMeta({ lastPush: Date.now() });
}

// ── Full pull (all data) ──────────────────────────────────────────────────────

export async function pullAll(): Promise<void> {
  const uid = getAuthUserId();
  await Promise.allSettled([
    pullAILearning(),
    uid ? pullChatHistory(uid) : Promise.resolve(),
  ]);
  writeMeta({ lastPull: Date.now() });
}

// ── Transport first-time export ───────────────────────────────────────────────

/**
 * Export transport data to the data repo.
 * Only runs when the stored version doesn't match TRANSPORT_VERSION.
 * Safe to call on every startup — skips if already up to date.
 */
export async function ensureTransportDataInRepo(): Promise<void> {
  const meta = readMeta();
  if (meta.transportVersion === TRANSPORT_VERSION) return; // already current

  // Run in background — don't block startup
  setTimeout(async () => {
    const result = await pushTransportData();
    if (result.pushed > 0) writeMeta({ transportVersion: TRANSPORT_VERSION });
  }, 5000);
}

// ── Periodic sync ─────────────────────────────────────────────────────────────

let _syncTimer: ReturnType<typeof setInterval> | null = null;

export function startPeriodicSync(): void {
  if (_syncTimer) return;
  _syncTimer = setInterval(() => { pushAll(); }, PUSH_INTERVAL_MS);

  // Also push on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => { pushAll(); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') pushAll();
    });
  }
}

export function stopPeriodicSync(): void {
  if (_syncTimer) { clearInterval(_syncTimer); _syncTimer = null; }
}

// ── Debounced triggers ────────────────────────────────────────────────────────

let _chatDebounce: ReturnType<typeof setTimeout> | null = null;
let _aiDebounce: ReturnType<typeof setTimeout> | null = null;

/** Call after each new chat message */
export function triggerChatSync(userId?: string): void {
  if (_chatDebounce) clearTimeout(_chatDebounce);
  _chatDebounce = setTimeout(() => {
    pushChatHistory(userId).catch(() => { /* silent */ });
  }, 4000); // 4 s debounce
}

/** Call after AI learns a new answer */
export function triggerAISync(): void {
  if (_aiDebounce) clearTimeout(_aiDebounce);
  _aiDebounce = setTimeout(() => {
    pushAILearning().catch(() => { /* silent */ });
  }, 3000);
}

// ── Init (call once on app startup) ──────────────────────────────────────────

export async function initDataSync(userId?: string): Promise<void> {
  // Pull remote data into local (fills gaps — non-destructive)
  await pullAll();

  // Ensure transport data is in the repo (runs in background)
  ensureTransportDataInRepo();

  // Start periodic push
  startPeriodicSync();
}
