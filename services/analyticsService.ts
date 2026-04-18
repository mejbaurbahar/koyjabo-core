// Analytics Service - Tracks user activity and global statistics
// History data: localStorage (per-user key) + synced to private GitHub repo
// Global stats (visits): stored in GitHub koyjabo repo, updated via GitHub Actions

export interface UserHistory {
    busSearches: BusSearchRecord[];
    routeSearches: RouteSearchRecord[];
    intercitySearches: IntercitySearchRecord[];
    trainSearches: TrainSearchRecord[];
    mostUsedBuses: Record<string, number>; // busId -> count
    mostUsedRoutes: Record<string, number>; // "from-to" -> count
    mostUsedIntercity: Record<string, number>; // "from-to" -> count
    mostUsedTrains: Record<string, number>; // trainId -> count
    todayBuses: string[]; // busIds searched today
    todayRoutes: string[]; // routes searched today
    todayIntercity: string[]; // intercity routes searched today
    todayTrains: string[]; // trainIds viewed today
    lastResetDate: string; // ISO date string for daily reset
}

export interface BusSearchRecord {
    busId: string;
    busName: string;
    timestamp: number;
    date: string; // YYYY-MM-DD
}

export interface RouteSearchRecord {
    from: string;
    to: string;
    timestamp: number;
    date: string; // YYYY-MM-DD
}

export interface IntercitySearchRecord {
    from: string;
    to: string;
    transportType: string; // 'bus', 'train', 'flight', 'combined'
    timestamp: number;
    date: string; // YYYY-MM-DD
}

export interface TrainSearchRecord {
    trainId: string;
    trainName: string;
    trainNumber: string;
    from: string; // station name
    to: string;   // station name
    timestamp: number;
    date: string; // YYYY-MM-DD
}

export interface GlobalStats {
    totalVisits: number;
    todayVisits: number;
    activeUsers: number; // Not tracked in real-time; kept for UI compat
    uniqueVisitors: number;
    locations?: Record<string, { count: number }>;
    lastUpdated?: number;
}

// ── Storage keys ──────────────────────────────────────────────────────────────
const ANON_HISTORY_KEY = 'dhaka_commute_user_history';
const GLOBAL_STATS_KEY = 'dhaka_commute_global_stats';
const VISITOR_ID_KEY   = 'dhaka_commute_visitor_id';

// Current logged-in user ID — set by AuthContext on login/logout
let _currentUserId: string | null = null;

/** Call this when a user logs in or out so history uses their own storage key. */
export const setHistoryUser = (userId: string | null): void => {
    _currentUserId = userId;
};

const getHistoryKey = (): string =>
    _currentUserId ? `koyjabo_history_${_currentUserId}` : ANON_HISTORY_KEY;

/** Load externally-fetched history into the current user's localStorage slot. */
export const loadHistoryData = (data: Partial<UserHistory>): void => {
    try {
        const current = getUserHistory();
        const merged: UserHistory = {
            ...current,
            busSearches:       data.busSearches       ?? current.busSearches,
            routeSearches:     data.routeSearches     ?? current.routeSearches,
            intercitySearches: data.intercitySearches ?? current.intercitySearches,
            mostUsedBuses:     data.mostUsedBuses     ?? current.mostUsedBuses,
            mostUsedRoutes:    data.mostUsedRoutes    ?? current.mostUsedRoutes,
            mostUsedIntercity: data.mostUsedIntercity ?? current.mostUsedIntercity,
        };
        localStorage.setItem(getHistoryKey(), JSON.stringify(merged));
    } catch {
        // best-effort
    }
};

// ── Server proxy endpoints (token/repo never in browser) ─────────────────────
const PROXY = '/api/gh';
const STATS_PATH = 'data/stats/global.json';

// ── Date helper ───────────────────────────────────────────────────────────────
const getTodayDate = (): string => new Date().toISOString().split('T')[0];

// ── Visitor ID ────────────────────────────────────────────────────────────────
const getVisitorId = (): string => {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
        id = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
};

// ── Local stats cache ─────────────────────────────────────────────────────────
export const getGlobalStats = (): GlobalStats => {
    try {
        const stored = localStorage.getItem(GLOBAL_STATS_KEY);
        if (!stored) {
            return { totalVisits: 0, todayVisits: 0, activeUsers: 0, uniqueVisitors: 0, lastUpdated: Date.now() };
        }
        const stats: GlobalStats = JSON.parse(stored);
        // If cached todayDate is stale, reset todayVisits
        const cached = stats as GlobalStats & { todayDate?: string };
        if (cached.todayDate && cached.todayDate !== getTodayDate()) {
            stats.todayVisits = 0;
        }
        return stats;
    } catch {
        return { totalVisits: 0, todayVisits: 0, activeUsers: 0, uniqueVisitors: 0, lastUpdated: Date.now() };
    }
};

const saveGlobalStats = (stats: GlobalStats): void => {
    try {
        localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(stats));
        window.dispatchEvent(new CustomEvent('globalStatsUpdated', { detail: stats }));
    } catch {
        // ignore
    }
};

// ── GitHub reads ──────────────────────────────────────────────────────────────

/** Fetch global stats via server-side proxy (token/repo names stay on server). */
export const fetchGlobalStats = async (): Promise<void> => {
    try {
        const res = await fetch(
            `${PROXY}?r=d&p=${encodeURIComponent(STATS_PATH)}`,
            { credentials: 'same-origin', signal: AbortSignal.timeout(6000) }
        );
        if (!res.ok) return;
        const ghStats = await res.json() as GlobalStats & { todayDate?: string };
        // Reset todayVisits if the date has changed
        if (ghStats.todayDate && ghStats.todayDate !== getTodayDate()) {
            ghStats.todayVisits = 0;
        }
        const today = getTodayDate();
        // Only reset todayVisits if todayDate is explicitly set AND differs from today
        // If todayDate is missing, trust the stored todayVisits value
        const todayVisitsValue =
            ghStats.todayDate && ghStats.todayDate !== today
                ? 0
                : (ghStats.todayVisits || 0);
        const merged: GlobalStats = {
            totalVisits:    Math.max(ghStats.totalVisits || 0, getGlobalStats().totalVisits || 0),
            todayVisits:    todayVisitsValue,
            activeUsers:    0,
            uniqueVisitors: ghStats.uniqueVisitors || 0,
            lastUpdated:    Date.now()
        };
        saveGlobalStats(merged);
    } catch {
        // silently fail — cached data is used
    }
};

// ── Visit recording (fire-and-forget via GitHub Actions) ──────────────────────

/** Record this browser session as a visit. Called once per session. */
export const incrementVisitCount = async (): Promise<void> => {
    const SESSION_KEY = 'dhaka_commute_session_init';
    if (sessionStorage.getItem(SESSION_KEY)) {
        return;
    }
    sessionStorage.setItem(SESSION_KEY, 'true');

    // Fetch current stats from GitHub first (non-blocking)
    fetchGlobalStats().catch(() => {});

    // Fire-and-forget via proxy (no token in browser)
    const visitorId = getVisitorId();
    fetch(PROXY, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            requestId: crypto.randomUUID(),
            action: 'record-visit',
            email: '',
            passwordHash: '',
            userId: '',
            data: JSON.stringify({ visitorId }),
        }),
    }).catch(() => {}); // Non-critical, ignore errors
};

// ── User history ──────────────────────────────────────────────────────────────

export const getUserHistory = (): UserHistory => {
    try {
        const stored = localStorage.getItem(getHistoryKey());
        if (!stored) {
            return {
                busSearches: [], routeSearches: [], intercitySearches: [], trainSearches: [],
                mostUsedBuses: {}, mostUsedRoutes: {}, mostUsedIntercity: {}, mostUsedTrains: {},
                todayBuses: [], todayRoutes: [], todayIntercity: [], todayTrains: [],
                lastResetDate: getTodayDate()
            };
        }

        const history: UserHistory = JSON.parse(stored);

        // Reset today's data if it's a new day
        const today = getTodayDate();
        if (history.lastResetDate !== today) {
            history.todayBuses = [];
            history.todayRoutes = [];
            history.todayIntercity = [];
            history.todayTrains = [];
            history.lastResetDate = today;
            localStorage.setItem(getHistoryKey(), JSON.stringify(history));
        }

        // Safety: ensure all fields exist for older data
        if (!history.mostUsedBuses)     history.mostUsedBuses = {};
        if (!history.mostUsedRoutes)    history.mostUsedRoutes = {};
        if (!history.mostUsedIntercity) history.mostUsedIntercity = {};
        if (!history.mostUsedTrains)    history.mostUsedTrains = {};
        if (!history.busSearches)       history.busSearches = [];
        if (!history.routeSearches)     history.routeSearches = [];
        if (!history.intercitySearches) history.intercitySearches = [];
        if (!history.trainSearches)     history.trainSearches = [];
        if (!history.todayBuses)        history.todayBuses = [];
        if (!history.todayRoutes)       history.todayRoutes = [];
        if (!history.todayIntercity)    history.todayIntercity = [];
        if (!history.todayTrains)       history.todayTrains = [];

        return history;
    } catch {
        return {
            busSearches: [], routeSearches: [], intercitySearches: [], trainSearches: [],
            mostUsedBuses: {}, mostUsedRoutes: {}, mostUsedIntercity: {}, mostUsedTrains: {},
            todayBuses: [], todayRoutes: [], todayIntercity: [], todayTrains: [],
            lastResetDate: getTodayDate()
        };
    }
};

const saveUserHistory = (history: UserHistory): void => {
    try {
        localStorage.setItem(getHistoryKey(), JSON.stringify(history));
    } catch {
        // ignore
    }
};

export const trackBusSearch = (busId: string, busName: string): void => {
    const history = getUserHistory();
    const today = getTodayDate();
    history.busSearches.push({ busId, busName, timestamp: Date.now(), date: today });
    history.mostUsedBuses[busId] = (history.mostUsedBuses[busId] || 0) + 1;
    if (!history.todayBuses.includes(busId)) history.todayBuses.push(busId);
    if (history.busSearches.length > 100) history.busSearches = history.busSearches.slice(-100);
    saveUserHistory(history);
};

export const trackRouteSearch = (from: string, to: string): void => {
    const history = getUserHistory();
    const today = getTodayDate();
    const routeKey = `${from}-${to}`;
    history.routeSearches.push({ from, to, timestamp: Date.now(), date: today });
    history.mostUsedRoutes[routeKey] = (history.mostUsedRoutes[routeKey] || 0) + 1;
    if (!history.todayRoutes.includes(routeKey)) history.todayRoutes.push(routeKey);
    if (history.routeSearches.length > 100) history.routeSearches = history.routeSearches.slice(-100);
    saveUserHistory(history);
};

export const trackIntercitySearch = (from: string, to: string, transportType: string): void => {
    const history = getUserHistory();
    const today = getTodayDate();
    const routeKey = `${from}-${to}`;
    history.intercitySearches = history.intercitySearches || [];
    history.intercitySearches.push({ from, to, transportType, timestamp: Date.now(), date: today });
    history.mostUsedIntercity = history.mostUsedIntercity || {};
    history.mostUsedIntercity[routeKey] = (history.mostUsedIntercity[routeKey] || 0) + 1;
    history.todayIntercity = history.todayIntercity || [];
    if (!history.todayIntercity.includes(routeKey)) history.todayIntercity.push(routeKey);
    if (history.intercitySearches.length > 100) history.intercitySearches = history.intercitySearches.slice(-100);
    saveUserHistory(history);
};

export const trackTrainSearch = (
    trainId: string, trainName: string, trainNumber: string,
    from: string, to: string
): void => {
    const history = getUserHistory();
    const today = getTodayDate();
    history.trainSearches = history.trainSearches || [];
    history.mostUsedTrains = history.mostUsedTrains || {};
    history.todayTrains = history.todayTrains || [];
    history.trainSearches.push({ trainId, trainName, trainNumber, from, to, timestamp: Date.now(), date: today });
    history.mostUsedTrains[trainId] = (history.mostUsedTrains[trainId] || 0) + 1;
    if (!history.todayTrains.includes(trainId)) history.todayTrains.push(trainId);
    if (history.trainSearches.length > 100) history.trainSearches = history.trainSearches.slice(-100);
    saveUserHistory(history);
};

export const getMostUsedBuses = (limit: number = 5): Array<{ busId: string; count: number }> => {
    const history = getUserHistory();
    return Object.entries(history.mostUsedBuses || {})
        .map(([busId, count]) => ({ busId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
};

export const getMostUsedRoutes = (limit: number = 5): Array<{ from: string; to: string; count: number }> => {
    const history = getUserHistory();
    return Object.entries(history.mostUsedRoutes || {})
        .map(([routeKey, count]) => {
            const [from, to] = routeKey.split('-');
            return { from, to, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
};

export const getTodayBusSearches = (): string[] => getUserHistory().todayBuses;

export const getTodayRouteSearches = (): Array<{ from: string; to: string }> =>
    getUserHistory().todayRoutes.map(routeKey => {
        const [from, to] = routeKey.split('-');
        return { from, to };
    });

export const clearUserHistory = (): void => {
    localStorage.removeItem(getHistoryKey());
};

export const getRecentBusSearches = (limit: number = 10): BusSearchRecord[] =>
    getUserHistory().busSearches.slice(-limit).reverse();

export const getRecentRouteSearches = (limit: number = 10): RouteSearchRecord[] =>
    getUserHistory().routeSearches.slice(-limit).reverse();

export const getRecentIntercitySearches = (limit: number = 10): IntercitySearchRecord[] => {
    const history = getUserHistory();
    return (history.intercitySearches || []).slice(-limit).reverse();
};

export const getRecentTrainSearches = (limit: number = 10): TrainSearchRecord[] => {
    const history = getUserHistory();
    return (history.trainSearches || []).slice(-limit).reverse();
};

export const getMostUsedTrains = (limit: number = 5): Array<{ trainId: string; trainName: string; count: number }> => {
    const history = getUserHistory();
    return Object.entries(history.mostUsedTrains || {})
        .map(([trainId, count]) => {
            const record = (history.trainSearches || []).find(r => r.trainId === trainId);
            return { trainId, trainName: record?.trainName || trainId, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
};

// ── Cross-tab / cross-component stat sync ─────────────────────────────────────

export const subscribeToGlobalStats = (callback: (stats: GlobalStats) => void): () => void => {
    const handler = (event: Event) => {
        const customEvent = event as CustomEvent<GlobalStats>;
        callback(customEvent.detail);
    };
    window.addEventListener('globalStatsUpdated', handler);
    return () => window.removeEventListener('globalStatsUpdated', handler);
};

export const initStorageListener = (callback: () => void): () => void => {
    const handler = (e: StorageEvent) => {
        if (e.key === GLOBAL_STATS_KEY) callback();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
};
