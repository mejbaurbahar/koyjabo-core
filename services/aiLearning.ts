/**
 * AI Learning Engine
 *
 * Every query the user sends is logged with its quality signal.
 * The engine mines these logs to detect patterns that the base AI
 * consistently fails on, then synthesises and caches answers so the
 * next user who asks the same thing gets a real answer.
 *
 * "Training" here means: observe → detect failure → synthesise answer → cache.
 * No external API — 100% local, persisted in localStorage.
 */

import { classifyIntent, estimateDistanceKm, buildRouteOptions, estimateDuration, estimateFares, fuzzyMatchLocation } from './travelAI';
import { getOfflineIntercityData } from '../intercity/offlineService';

const _PROXY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_PROXY)
  || 'https://koyjabo-auth-proxy.mejbaur-bahar.workers.dev';

function _getUid(): string {
  try { return JSON.parse(localStorage.getItem('koyjabo_auth_session') ?? '{}')?.user?.id || 'anonymous'; }
  catch { return 'anonymous'; }
}

function _sendQueryRecord(query: string, response: string, intentType: string, quality: string, lang: string): void {
  fetch(`${_PROXY}/gh`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestId: crypto.randomUUID(),
      action: 'record-query',
      userId: _getUid(),
      data: JSON.stringify({ query, response, intent: intentType, quality, lang }),
    }),
  }).catch(() => {});
}

// ── Storage keys ──────────────────────────────────────────────────────────────

const KEYS = {
  queryLog: 'kj_ai_query_log',
  learnedAnswers: 'kj_ai_learned',
  aliasMap: 'kj_ai_aliases',
  stats: 'kj_ai_stats',
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type Quality = 'good' | 'weak' | 'fallback';
type Lang = 'en' | 'bn';

interface QueryRecord {
  id: string;
  query: string;
  normalised: string;
  timestamp: number;
  intent: string;
  locations: string[];
  mode: string;
  lang: Lang;
  quality: Quality;
  responseLen: number;
}

interface LearnedAnswer {
  key: string;           // canonical cache key (sorted locations + intent)
  answer: { en: string; bn: string };
  confidence: number;    // 0-1
  learnedAt: number;
  hits: number;          // times this answer was served
  triggerCount: number;  // how many failures triggered synthesis
  sources: string[];
}

interface AliasRecord {
  raw: string;
  canonical: string;
  count: number;
}

interface LearningStats {
  totalQueries: number;
  goodCount: number;
  weakCount: number;
  fallbackCount: number;
  learnedAnswerCount: number;
  learnedAnswerHits: number;
  lastTrainingRun: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[\u0980-\u09FF]/g, c => c).trim().replace(/\s+/g, ' ');
}

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function safeWrite(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

// ── Quality assessor ──────────────────────────────────────────────────────────

export function assessQuality(response: string): Quality {
  const r = response.trim();
  // Explicit fallback markers
  if (
    r.includes("🤔") ||
    r.includes("couldn't understand") ||
    r.includes("বুঝতে পারছি না") ||
    r.includes("I couldn't determine") ||
    r.includes("আমার কাছে") && r.includes("নেই") ||
    r.length < 80
  ) return 'fallback';

  // Weak: short or no transport-specific content
  const hasRoute = /🚌|🚂|✈️|🚢|🚇|৳|km|কিমি|ভাড়া|fare|route|রুট/.test(r);
  if (!hasRoute || r.length < 180) return 'weak';

  return 'good';
}

// ── Query store ───────────────────────────────────────────────────────────────

const MAX_LOG = 500; // sliding window

class QueryStore {
  private records: QueryRecord[] = [];
  private loaded = false;

  load(): void {
    if (this.loaded) return;
    this.records = safeRead<QueryRecord[]>(KEYS.queryLog, []);
    this.loaded = true;
  }

  log(query: string, response: string): QueryRecord {
    this.load();
    const intent = classifyIntent(query);
    const quality = assessQuality(response);

    const record: QueryRecord = {
      id: simpleHash(normalise(query) + String(Date.now())),
      query,
      normalised: normalise(query),
      timestamp: Date.now(),
      intent: intent.type,
      locations: [intent.from, intent.to].filter(Boolean) as string[],
      mode: intent.mode,
      lang: intent.language,
      quality,
      responseLen: response.length,
    };

    this.records.push(record);
    // Keep last MAX_LOG
    if (this.records.length > MAX_LOG) this.records = this.records.slice(-MAX_LOG);
    safeWrite(KEYS.queryLog, this.records);

    this._updateStats(quality);
    return record;
  }

  getAll(): QueryRecord[] {
    this.load();
    return this.records;
  }

  // Return all records where the same locations appear
  getByLocations(loc1: string, loc2: string): QueryRecord[] {
    this.load();
    return this.records.filter(r =>
      r.locations.includes(loc1) && r.locations.includes(loc2)
    );
  }

  // Count how many fallbacks exist for this location pair
  fallbackCount(loc1: string, loc2: string): number {
    return this.getByLocations(loc1, loc2).filter(r => r.quality === 'fallback').length;
  }

  private _updateStats(quality: Quality): void {
    const s = safeRead<LearningStats>(KEYS.stats, {
      totalQueries: 0, goodCount: 0, weakCount: 0, fallbackCount: 0,
      learnedAnswerCount: 0, learnedAnswerHits: 0, lastTrainingRun: 0,
    });
    s.totalQueries++;
    s[`${quality}Count`]++;
    safeWrite(KEYS.stats, s);
  }
}

export const queryStore = new QueryStore();

// ── Alias learner ─────────────────────────────────────────────────────────────

class AliasLearner {
  private aliases: Map<string, AliasRecord> = new Map();
  private loaded = false;

  load(): void {
    if (this.loaded) return;
    const raw = safeRead<AliasRecord[]>(KEYS.aliasMap, []);
    for (const r of raw) this.aliases.set(r.raw, r);
    this.loaded = true;
  }

  // Record a successful fuzzy match so we skip fuzzy next time
  record(rawToken: string, canonical: string): void {
    this.load();
    const key = normalise(rawToken);
    const existing = this.aliases.get(key);
    if (existing) { existing.count++; }
    else { this.aliases.set(key, { raw: key, canonical, count: 1 }); }
    safeWrite(KEYS.aliasMap, Array.from(this.aliases.values()));
  }

  // Instant lookup — no fuzzy needed
  lookup(token: string): string | null {
    this.load();
    return this.aliases.get(normalise(token))?.canonical ?? null;
  }

  getAll(): AliasRecord[] {
    this.load();
    return Array.from(this.aliases.values()).sort((a, b) => b.count - a.count);
  }
}

export const aliasLearner = new AliasLearner();

// ── Response cache (learned answers) ─────────────────────────────────────────

class ResponseCache {
  private cache: Map<string, LearnedAnswer> = new Map();
  private loaded = false;

  load(): void {
    if (this.loaded) return;
    const raw = safeRead<LearnedAnswer[]>(KEYS.learnedAnswers, []);
    for (const r of raw) this.cache.set(r.key, r);
    this.loaded = true;
  }

  get(key: string, lang: Lang): string | null {
    this.load();
    const entry = this.cache.get(key);
    if (!entry) return null;
    entry.hits++;
    this._persist();
    return lang === 'bn' ? entry.answer.bn : entry.answer.en;
  }

  set(key: string, answer: { en: string; bn: string }, confidence: number, sources: string[], triggerCount: number): void {
    this.load();
    const existing = this.cache.get(key);
    const entry: LearnedAnswer = {
      key,
      answer,
      confidence,
      learnedAt: Date.now(),
      hits: existing?.hits ?? 0,
      triggerCount,
      sources,
    };
    this.cache.set(key, entry);
    this._persist();

    const s = safeRead<LearningStats>(KEYS.stats, {
      totalQueries: 0, goodCount: 0, weakCount: 0, fallbackCount: 0,
      learnedAnswerCount: 0, learnedAnswerHits: 0, lastTrainingRun: Date.now(),
    });
    s.learnedAnswerCount = this.cache.size;
    s.lastTrainingRun = Date.now();
    safeWrite(KEYS.stats, s);
  }

  has(key: string): boolean {
    this.load();
    return this.cache.has(key);
  }

  getAll(): LearnedAnswer[] {
    this.load();
    return Array.from(this.cache.values());
  }

  private _persist(): void {
    safeWrite(KEYS.learnedAnswers, Array.from(this.cache.values()));
  }
}

export const responseCache = new ResponseCache();

// ── Cache key builder ─────────────────────────────────────────────────────────

function buildCacheKey(loc1: string, loc2: string, intent: string): string {
  const sorted = [loc1, loc2].sort().join('→');
  return `${sorted}|${intent}`;
}

// ── Answer synthesiser ────────────────────────────────────────────────────────

function synthesiseRouteAnswer(from: string, to: string): { en: string; bn: string } | null {
  const dist = estimateDistanceKm(from, to);
  if (!dist) return null;

  const options = buildRouteOptions(from, to);
  if (options.length === 0) return null;

  // Try to get real intercity data too
  const intercityEn = getOfflineIntercityData(from, to, 'en').result;
  const intercityBn = getOfflineIntercityData(from, to, 'bn').result;
  const hasRealData = intercityEn && !intercityEn.includes('No direct') && intercityEn.length > 100;

  const modeLine = (lang: 'en' | 'bn') => options.map(o => {
    const emojiMap: Record<string, string> = { bus: '🚌', train: '🚂', flight: '✈️', launch: '🚢' };
    const nameEn = o.mode.charAt(0).toUpperCase() + o.mode.slice(1);
    const nameBn: Record<string, string> = { bus: 'বাস', train: 'ট্রেন', flight: 'বিমান', launch: 'লঞ্চ' };
    const fareStr = `৳${o.fare.min.toLocaleString()}-${o.fare.max.toLocaleString()}`;
    return lang === 'en'
      ? `${emojiMap[o.mode]} **${nameEn}** — ${o.duration} | ${fareStr}`
      : `${emojiMap[o.mode]} **${nameBn[o.mode] ?? nameEn}** — ${o.duration} | ${fareStr}`;
  }).join('\n');

  if (hasRealData) {
    return {
      en: intercityEn,
      bn: intercityBn,
    };
  }

  return {
    en: `🗺️ **${from} → ${to}** (~${dist} km)\n\n${modeLine('en')}\n\n📍 *Estimated fares — book at shohoz.com or counter*`,
    bn: `🗺️ **${from} → ${to}** (~${dist} কিমি)\n\n${modeLine('bn')}\n\n📍 *আনুমানিক ভাড়া — shohoz.com বা কাউন্টার থেকে বুক করুন*`,
  };
}

// ── Pattern miner (runs asynchronously after response) ───────────────────────

const TRAIN_THRESHOLD = 3; // failures before synthesising

function mineAndLearn(record: QueryRecord): void {
  if (record.locations.length < 2) return;
  const [loc1, loc2] = record.locations;

  // Already have a cached answer?
  const key = buildCacheKey(loc1, loc2, record.intent);
  if (responseCache.has(key)) return;

  const failCount = queryStore.fallbackCount(loc1, loc2);
  if (failCount < TRAIN_THRESHOLD) return;

  // Synthesise an answer
  const answer = synthesiseRouteAnswer(loc1, loc2);
  if (!answer) return;

  responseCache.set(key, answer, Math.min(0.5 + failCount * 0.1, 0.95), ['travelAI', 'intercityData'], failCount);
}

// ── Context detector (rephrasing = prior answer was bad) ─────────────────────

class ContextTracker {
  private lastQuery: { query: string; ts: number } | null = null;
  private readonly REPHRASE_WINDOW = 45_000; // 45 sec

  check(query: string): boolean {
    const now = Date.now();
    const isRephrase = !!(
      this.lastQuery &&
      now - this.lastQuery.ts < this.REPHRASE_WINDOW &&
      this.lastQuery.query !== normalise(query) &&
      // Shares at least one word (likely same topic)
      normalise(query).split(' ').some(w => w.length > 3 && this.lastQuery!.query.includes(w))
    );
    this.lastQuery = { query: normalise(query), ts: now };
    return isRephrase;
  }
}

export const contextTracker = new ContextTracker();

// ── Main public API ───────────────────────────────────────────────────────────

/**
 * Check if the learning cache has an answer for this query.
 * Call BEFORE the main AI logic to serve cached learned answers instantly.
 */
export function checkLearnedAnswer(query: string): string | null {
  const intent = classifyIntent(query);
  if (!intent.from || !intent.to) return null;

  const key = buildCacheKey(intent.from, intent.to, intent.type);
  return responseCache.get(key, intent.language);
}

/**
 * Record a query + its response, then asynchronously mine for patterns.
 * Call AFTER building the response (non-blocking).
 */
export function recordAndLearn(query: string, response: string): void {
  const record = queryStore.log(query, response);

  // Detect rephrase: downgrade previous record quality if user rephrased
  if (contextTracker.check(query) && record.quality === 'fallback') {
    // The previous query was likely also unsatisfying — already logged
  }

  // Learn from aliases resolved by fuzzy matcher
  const intent = classifyIntent(query);
  const tokens = query.toLowerCase().split(/[\s,→\-\/]+/);
  for (const token of tokens) {
    if (token.length < 4) continue;
    const resolved = fuzzyMatchLocation(token);
    if (resolved && resolved.toLowerCase() !== token) {
      aliasLearner.record(token, resolved);
    }
  }

  // Mine patterns asynchronously (don't block response path)
  setTimeout(() => {
    mineAndLearn(record);
    _sendQueryRecord(query, response, intent.type || 'travel', record.quality, record.lang);
  }, 0);
}

// ── Stats / diagnostics ───────────────────────────────────────────────────────

export function getLearningStats(): LearningStats & { learnedAnswerCount: number } {
  const s = safeRead<LearningStats>(KEYS.stats, {
    totalQueries: 0, goodCount: 0, weakCount: 0, fallbackCount: 0,
    learnedAnswerCount: 0, learnedAnswerHits: 0, lastTrainingRun: 0,
  });
  s.learnedAnswerCount = responseCache.getAll().length;
  s.learnedAnswerHits = responseCache.getAll().reduce((sum, a) => sum + a.hits, 0);
  return s;
}

export function getTopFailedPatterns(limit = 10): { locations: string[]; count: number }[] {
  const all = queryStore.getAll().filter(r => r.quality === 'fallback' && r.locations.length >= 2);
  const counts: Record<string, { locations: string[]; count: number }> = {};
  for (const r of all) {
    const k = r.locations.slice(0, 2).sort().join('→');
    if (!counts[k]) counts[k] = { locations: r.locations.slice(0, 2), count: 0 };
    counts[k].count++;
  }
  return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, limit);
}

export function getTopLearnedAnswers(limit = 10): LearnedAnswer[] {
  return responseCache.getAll().sort((a, b) => b.hits - a.hits).slice(0, limit);
}

export function getTopAliases(limit = 20): AliasRecord[] {
  return aliasLearner.getAll().slice(0, limit);
}

/**
 * Force-run pattern mining on all stored fallback records.
 * Useful on app start to warm up the cache from previous sessions.
 */
export function warmUpCache(): void {
  const fallbacks = queryStore.getAll().filter(r => r.quality === 'fallback' && r.locations.length >= 2);
  for (const r of fallbacks) mineAndLearn(r);
}
