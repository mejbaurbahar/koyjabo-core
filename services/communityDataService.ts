/**
 * Community Data Service
 * Handles read/write for all community-driven features:
 * bus ratings, traffic reports, bus location reports, trip reminders, bus photos.
 * All writes go to the private koyjabo data repo via the Cloudflare proxy.
 * All reads require an authenticated user.
 */

const PROXY = (import.meta.env.VITE_API_PROXY as string | undefined)
  || 'https://koyjabo-auth-proxy.mejbaur-bahar.workers.dev';

export function getAuthUser(): { id: string; displayName: string; username: string } | null {
  try {
    const s = localStorage.getItem('koyjabo_auth_session');
    if (!s) return null;
    const u = JSON.parse(s)?.user;
    return u?.id ? { id: u.id, displayName: u.displayName ?? '', username: u.username ?? '' } : null;
  } catch { return null; }
}

async function repoGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${PROXY}/gh?r=d&p=${encodeURIComponent(path)}&_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.status === 404) return null; // file doesn't exist yet — normal for new entries
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text) as T;
  } catch { return null; }
}

async function repoDelete(path: string, message?: string): Promise<boolean> {
  const user = getAuthUser();
  try {
    const res = await fetch(`${PROXY}/gh`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        action: 'delete-data',
        userId: user?.id || 'anonymous',
        data: JSON.stringify({ path, message: message || `delete: ${path}` }),
      }),
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => ({})) as { success?: boolean };
    return json.success === true;
  } catch { return false; }
}

async function repoPut(path: string, content: unknown, message?: string): Promise<boolean> {
  const user = getAuthUser();
  try {
    const res = await fetch(`${PROXY}/gh`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        action: 'save-data',
        userId: user?.id || 'anonymous',
        data: JSON.stringify({ path, content, message: message || `community: ${path}` }),
      }),
    });
    return res.ok;
  } catch { return false; }
}

const today = () => new Date().toISOString().split('T')[0];

// ── Bus Ratings ───────────────────────────────────────────────────────────────

export interface BusRating {
  userId: string;
  displayName: string;
  busId: string;
  stars: number;       // 1–5
  comment: string;
  timestamp: number;
}

export interface BusRatingSummary {
  busId: string;
  average: number;
  count: number;
  ratings: BusRating[];
}

export async function getBusRatings(busId: string): Promise<BusRatingSummary | null> {
  return repoGet<BusRatingSummary>(`data/ratings/${busId}.json`);
}

export async function submitBusRating(busId: string, stars: number, comment: string): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const normalizedComment = (comment ?? '').trim();
  // Keep comment optional while ensuring persistence never rejects empty payloads.
  const persistedComment = normalizedComment.length > 0 ? normalizedComment : ' ';
  const existing = await getBusRatings(busId) || { busId, average: 0, count: 0, ratings: [] };
  const filtered = existing.ratings.filter(r => r.userId !== user.id);
  const newRating: BusRating = { userId: user.id, displayName: user.displayName, busId, stars, comment: persistedComment, timestamp: Date.now() };
  const ratings = [...filtered, newRating];
  const average = ratings.length ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length : 0;
  return repoPut(`data/ratings/${busId}.json`, { busId, average: Math.round(average * 10) / 10, count: ratings.length, ratings }, `rating: ${busId}`);
}

export async function deleteBusRating(busId: string): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const existing = await getBusRatings(busId);
  if (!existing) return false;

  const ratings = existing.ratings.filter(r => r.userId !== user.id);
  const average = ratings.length ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length : 0;
  return repoPut(
    `data/ratings/${busId}.json`,
    { busId, average: Math.round(average * 10) / 10, count: ratings.length, ratings },
    `rating-delete: ${busId}`
  );
}

// ── Train Ratings ─────────────────────────────────────────────────────────────

export interface TrainRating {
  userId: string;
  displayName: string;
  trainId: string;
  trainName: string;
  stars: number;       // 1–5
  comment: string;
  timestamp: number;
}

export interface TrainRatingSummary {
  trainId: string;
  trainName: string;
  average: number;
  count: number;
  ratings: TrainRating[];
}

export async function getTrainRatings(trainId: string): Promise<TrainRatingSummary | null> {
  return repoGet<TrainRatingSummary>(`data/train-ratings/${trainId}.json`);
}

export async function submitTrainRating(trainId: string, trainName: string, stars: number, comment: string): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const normalizedComment = (comment ?? '').trim();
  // Keep comment optional while ensuring persistence never rejects empty payloads.
  const persistedComment = normalizedComment.length > 0 ? normalizedComment : ' ';
  const existing = await getTrainRatings(trainId) || { trainId, trainName, average: 0, count: 0, ratings: [] };
  const filtered = existing.ratings.filter(r => r.userId !== user.id);
  const newRating: TrainRating = { userId: user.id, displayName: user.displayName, trainId, trainName, stars, comment: persistedComment, timestamp: Date.now() };
  const ratings = [...filtered, newRating];
  const average = ratings.length ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length : 0;
  return repoPut(
    `data/train-ratings/${trainId}.json`,
    { trainId, trainName, average: Math.round(average * 10) / 10, count: ratings.length, ratings },
    `train-rating: ${trainId}`
  );
}

export async function deleteTrainRating(trainId: string): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const existing = await getTrainRatings(trainId);
  if (!existing) return false;

  const ratings = existing.ratings.filter(r => r.userId !== user.id);
  const average = ratings.length ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length : 0;
  return repoPut(
    `data/train-ratings/${trainId}.json`,
    { trainId, trainName: existing.trainName, average: Math.round(average * 10) / 10, count: ratings.length, ratings },
    `train-rating-delete: ${trainId}`
  );
}

// ── Traffic / Delay Reports ───────────────────────────────────────────────────

export interface TrafficReport {
  id: string;
  userId: string;
  displayName: string;
  location: string;
  busId?: string;
  busName?: string;
  type: 'heavy_traffic' | 'accident' | 'road_block' | 'bus_delayed' | 'bus_cancelled';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: number;
  upvotes: string[]; // userId[]
}

export interface DailyTrafficReports {
  date: string;
  reports: TrafficReport[];
}

const TRAFFIC_CACHE_KEY = 'kj_traffic_cache';

export async function getTodayTrafficReports(): Promise<TrafficReport[]> {
  try {
    const data = await repoGet<DailyTrafficReports>(`data/traffic/${today()}.json`);
    if (data?.reports) {
      localStorage.setItem(TRAFFIC_CACHE_KEY, JSON.stringify({ date: today(), reports: data.reports }));
      return data.reports;
    }
  } catch { /* fall through to cache */ }
  try {
    const cached = localStorage.getItem(TRAFFIC_CACHE_KEY);
    if (cached) {
      const parsed: DailyTrafficReports = JSON.parse(cached);
      if (parsed.date === today()) return parsed.reports;
    }
  } catch { /* ignore */ }
  return [];
}

export async function submitTrafficReport(
  location: string,
  type: TrafficReport['type'],
  severity: TrafficReport['severity'],
  description: string,
  busId?: string,
  busName?: string,
): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const existing = await repoGet<DailyTrafficReports>(`data/traffic/${today()}.json`) || { date: today(), reports: [] };
  const report: TrafficReport = {
    id: crypto.randomUUID(),
    userId: user.id, displayName: user.displayName,
    location, busId, busName, type, severity, description,
    timestamp: Date.now(), upvotes: [],
  };
  existing.reports.unshift(report);
  if (existing.reports.length > 200) existing.reports = existing.reports.slice(0, 200);
  return repoPut(`data/traffic/${today()}.json`, existing, `traffic: ${location}`);
}

export async function upvoteTrafficReport(reportId: string): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const existing = await repoGet<DailyTrafficReports>(`data/traffic/${today()}.json`);
  if (!existing) return false;
  const report = existing.reports.find(r => r.id === reportId);
  if (!report) return false;
  if (!report.upvotes.includes(user.id)) report.upvotes.push(user.id);
  return repoPut(`data/traffic/${today()}.json`, existing, `upvote: ${reportId}`);
}

// ── Bus Live Location Reports ─────────────────────────────────────────────────

export interface BusLocationReport {
  userId: string;
  busId: string;
  busName: string;
  stopId: string;
  stopName: string;
  timestamp: number;
  heading?: string;
}

export interface BusLocationData {
  busId: string;
  lastUpdated: number;
  reports: BusLocationReport[];
}

export async function getBusLiveLocation(busId: string): Promise<BusLocationData | null> {
  const data = await repoGet<BusLocationData>(`data/bus-locations/${busId}.json`);
  if (!data) return null;
  const tenMinAgo = Date.now() - 10 * 60 * 1000;
  data.reports = data.reports.filter(r => r.timestamp > tenMinAgo);
  return data;
}

export async function reportBusLocation(
  busId: string, busName: string, stopId: string, stopName: string, heading?: string,
): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const existing = await repoGet<BusLocationData>(`data/bus-locations/${busId}.json`) || { busId, lastUpdated: 0, reports: [] };
  const tenMinAgo = Date.now() - 10 * 60 * 1000;
  const filtered = existing.reports.filter(r => r.timestamp > tenMinAgo && r.userId !== user.id);
  const report: BusLocationReport = { userId: user.id, busId, busName, stopId, stopName, timestamp: Date.now(), heading };
  return repoPut(`data/bus-locations/${busId}.json`, { busId, lastUpdated: Date.now(), reports: [...filtered, report] }, `location: ${busName}`);
}

// ── Trip Reminders ────────────────────────────────────────────────────────────

export interface TripReminder {
  id: string;
  userId: string;
  label: string;
  busId?: string;
  busName?: string;
  fromStop?: string;
  toStop?: string;
  days: number[];   // 0=Sun..6=Sat
  time: string;     // HH:MM
  minutesBefore: number;
  enabled: boolean;
  createdAt: number;
}

const REMINDERS_KEY = 'kj_trip_reminders';

export function getLocalReminders(): TripReminder[] {
  try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) ?? '[]'); } catch { return []; }
}

export function saveLocalReminders(reminders: TripReminder[]): void {
  try { localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders)); } catch { /* quota */ }
}

export async function syncReminders(): Promise<void> {
  const user = getAuthUser();
  if (!user) return;
  const local = getLocalReminders();
  await repoPut(`data/reminders/${user.id}.json`, { userId: user.id, reminders: local, updatedAt: Date.now() }, 'reminders sync');
}

export async function pullReminders(): Promise<void> {
  const user = getAuthUser();
  if (!user) return;
  const remote = await repoGet<{ reminders: TripReminder[] }>(`data/reminders/${user.id}.json`);
  if (!remote?.reminders?.length) return;
  const local = getLocalReminders();
  const localIds = new Set(local.map(r => r.id));
  const merged = [...local, ...remote.reminders.filter(r => !localIds.has(r.id))];
  saveLocalReminders(merged);
}

// ── Bus Photos ────────────────────────────────────────────────────────────────

export interface BusPhoto {
  id: string;
  userId: string;
  displayName: string;
  busId: string;
  busName: string;
  caption: string;
  dataUrl: string;   // base64 — kept small (max 300KB after compress)
  timestamp: number;
}

export interface BusPhotoCollection {
  busId: string;
  photos: BusPhoto[];
}

export async function getBusPhotos(busId: string): Promise<BusPhoto[]> {
  const data = await repoGet<BusPhotoCollection>(`data/photos/${busId}.json`);
  return data?.photos ?? [];
}

export async function submitBusPhoto(busId: string, busName: string, caption: string, dataUrl: string): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const existing = await repoGet<BusPhotoCollection>(`data/photos/${busId}.json`) || { busId, photos: [] };
  const photo: BusPhoto = { id: crypto.randomUUID(), userId: user.id, displayName: user.displayName, busId, busName, caption, dataUrl, timestamp: Date.now() };
  existing.photos.unshift(photo);
  if (existing.photos.length > 50) existing.photos = existing.photos.slice(0, 50);
  return repoPut(`data/photos/${busId}.json`, existing, `photo: ${busName}`);
}

export async function deleteBusPhoto(busId: string, photoId: string): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const existing = await repoGet<BusPhotoCollection>(`data/photos/${busId}.json`);
  if (!existing) return false;
  const before = existing.photos.length;
  existing.photos = existing.photos.filter(p => !(p.id === photoId && p.userId === user.id));
  if (existing.photos.length === before) return false; // photo not found or not owned by user
  if (existing.photos.length === 0) {
    return repoPut(`data/photos/${busId}.json`, { busId, photos: [] }, `photo-delete-all: ${busId}`);
  }
  return repoPut(`data/photos/${busId}.json`, existing, `photo-delete: ${photoId}`);
}

// ── Seat Availability helper (external links) ─────────────────────────────────

export function buildSeatAvailabilityLinks(trainName: string, trainNumber: string) {
  const encoded = encodeURIComponent(trainName);
  return {
    railwayGov: `https://eticket.railway.gov.bd/`,
    shohoz: `https://www.shohoz.com/booking/train/search?from=Dhaka&to=&date=${today()}`,
    seatplan: `https://seatplan.net/train/${encodeURIComponent(trainNumber || trainName)}`,
    label: trainName,
  };
}

// ── Train Photos ──────────────────────────────────────────────────────────────

export interface TrainPhoto {
  id: string;
  userId: string;
  displayName: string;
  trainId: string;
  trainName: string;
  caption: string;
  dataUrl: string;   // base64 — kept small (max 300KB after compress)
  timestamp: number;
}

export interface TrainPhotoCollection {
  trainId: string;
  photos: TrainPhoto[];
}

export async function getTrainPhotos(trainId: string): Promise<TrainPhoto[]> {
  const data = await repoGet<TrainPhotoCollection>(`data/train-photos/${trainId}.json`);
  return data?.photos ?? [];
}

export async function submitTrainPhoto(trainId: string, trainName: string, caption: string, dataUrl: string): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const existing = await repoGet<TrainPhotoCollection>(`data/train-photos/${trainId}.json`) || { trainId, photos: [] };
  const photo: TrainPhoto = { id: crypto.randomUUID(), userId: user.id, displayName: user.displayName, trainId, trainName, caption, dataUrl, timestamp: Date.now() };
  existing.photos.unshift(photo);
  if (existing.photos.length > 50) existing.photos = existing.photos.slice(0, 50);
  return repoPut(`data/train-photos/${trainId}.json`, existing, `train-photo: ${trainName}`);
}

export async function deleteTrainPhoto(trainId: string, photoId: string): Promise<boolean> {
  const user = getAuthUser();
  if (!user) return false;
  const existing = await repoGet<TrainPhotoCollection>(`data/train-photos/${trainId}.json`);
  if (!existing) return false;
  const before = existing.photos.length;
  existing.photos = existing.photos.filter(p => !(p.id === photoId && p.userId === user.id));
  if (existing.photos.length === before) return false;
  if (existing.photos.length === 0) {
    return repoPut(`data/train-photos/${trainId}.json`, { trainId, photos: [] }, `train-photo-delete-all: ${trainId}`);
  }
  return repoPut(`data/train-photos/${trainId}.json`, existing, `train-photo-delete: ${photoId}`);
}
