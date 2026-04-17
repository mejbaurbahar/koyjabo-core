/**
 * Train Service — 100% offline, powered by local BD_TRAIN_ROUTES data.
 * All functions are synchronous under the hood but keep async signatures
 * so TrainSearch.tsx requires no changes.
 */

import { BD_TRAIN_ROUTES, TRAIN_STATIONS, BDTrainRoute } from '../data/bangladeshTrainData';

// ==================== TYPES ====================

export interface TrainClass {
    AC_B?: string;
    AC_SEAT?: string;
    AC_CHAIR?: string;
    S_CHAIR?: string;
    SHOVAN?: string;
    SNIGDHA?: string;
    SHULOV?: string;
    F_SEAT?: string;
    F_BERTH?: string;
}

export interface Train {
    trainNumber: string;
    trainName: string;
    type: 'Intercity' | 'Mail/Express' | 'Commuter' | 'Local' | 'Shuttle' | 'Express';
    route: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    frequency: string;
    classes: string[];
    offDays: string;
    stops?: string[];
    fare?: string;
    category?: string;
    searchDate?: string;
}

export interface TrainSearchResponse {
    from: string;
    to: string;
    date: string;
    totalResults: number;
    trains: Train[];
    bookingURL: string;
    note: string;
}

export interface TrainDetailsResponse {
    train: Train;
    bookingURL: string;
}

export interface IntercityTrainsResponse {
    totalCount: number;
    trains: Train[];
    lastUpdated: string;
}

export interface StationTrainsResponse {
    station: string;
    totalTrains: number;
    trains: Train[];
}

export interface TrainStatistics {
    metadata: {
        totalTrains: number;
        intercityTrains: number;
        mailExpressTrains: number;
        commuterTrains: number;
        localShuttleTrains: number;
        totalStations: number;
        totalRouteKm: number;
    };
    zones: {
        eastern: { name: string; routeKm: number; gauge: string; divisions: string[] };
        western: { name: string; routeKm: number; gauge: string; divisions: string[] };
    };
    majorStations: string[];
    bookingSources: {
        official: string;
        mobileApp: string;
        methods: string[];
        advanceBooking: string;
    };
    lastUpdated: string;
}

export interface SuggestionsResponse {
    query: string;
    suggestions: string[];
}

export interface PopularRoutesResponse {
    routes: {
        [key: string]: {
            from: string;
            to: string;
            trainCount: number;
            trains: Train[];
        };
    };
    totalRoutes: number;
}

export interface ChatTrainResponse {
    from: string;
    to: string;
    totalTrains: number;
    response: string;
    rawData: Train[];
    bookingURL: string;
}

// ==================== LOCAL HELPERS ====================

function normalize(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '');
}

/** All unique station name strings (English + Bengali) */
const ALL_STATION_NAMES: string[] = (() => {
    const names = new Set<string>();
    Object.values(TRAIN_STATIONS).forEach(s => {
        names.add(s.name);
        if (s.bnName) names.add(s.bnName);
    });
    return Array.from(names).sort();
})();

/** Resolve a free-text station query to a station id */
function resolveStation(query: string): string | null {
    const q = normalize(query);
    if (!q) return null;
    // Exact id match
    if (TRAIN_STATIONS[q]) return q;
    // Match by normalized name
    for (const [id, st] of Object.entries(TRAIN_STATIONS)) {
        if (normalize(st.name) === q || normalize(st.bnName || '') === q) return id;
    }
    // Partial match (name contains query or query contains name)
    for (const [id, st] of Object.entries(TRAIN_STATIONS)) {
        const en = normalize(st.name);
        const bn = normalize(st.bnName || '');
        if (en.includes(q) || q.includes(en) || bn.includes(q) || q.includes(bn)) return id;
    }
    return null;
}

/** Convert a BDTrainRoute to the Train interface used by TrainSearch */
function bdRouteToTrain(route: BDTrainRoute, fromId?: string): Train {
    const fromName = TRAIN_STATIONS[route.from]?.name ?? route.from;
    const toName = TRAIN_STATIONS[route.to]?.name ?? route.to;

    // Determine departure/arrival based on direction
    const isForward = !fromId || route.from === fromId || route.stops.indexOf(fromId) <= route.stops.indexOf(route.to);
    const depart = isForward ? route.dhakaDepart : route.returnDepart;
    const arrive = isForward ? route.destinationArrive : route.dhakaArrive;

    // Compute rough duration
    function minutesDiff(t1: string, t2: string): number {
        const [h1, m1] = t1.split(':').map(Number);
        const [h2, m2] = t2.split(':').map(Number);
        let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff < 0) diff += 24 * 60;
        return diff;
    }
    const mins = minutesDiff(depart, arrive);
    const duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;

    const classes: string[] = ['SHOVAN'];
    if (route.fare.shuvanChair > 0) classes.push('S_CHAIR');
    if (route.fare.snigdha > 0) classes.push('SNIGDHA');
    if (route.fare.firstClassBerth) classes.push('F_BERTH');
    if (route.fare.acBerth) classes.push('AC_B');

    const typeMap: Record<string, Train['type']> = {
        Express: 'Intercity',
        Intercity: 'Intercity',
        Mail: 'Mail/Express',
        Local: 'Local',
    };

    return {
        trainNumber: route.number,
        trainName: route.name,
        type: typeMap[route.type] ?? 'Intercity',
        route: `${fromName} → ${toName}`,
        from: fromName,
        to: toName,
        departureTime: depart,
        arrivalTime: arrive,
        duration,
        frequency: route.offDay ? `Daily except ${route.offDay}` : 'Daily',
        classes,
        offDays: route.offDay || 'None',
        stops: route.stops.map(id => TRAIN_STATIONS[id]?.name ?? id),
        fare: `৳${route.fare.shuvan}+`,
    };
}

// ==================== SERVICE ====================

export const trainService = {

    async searchTrains(from: string, to: string, _date?: string): Promise<TrainSearchResponse> {
        const fromId = resolveStation(from);
        const toId = resolveStation(to);

        if (!fromId || !toId) {
            return {
                from, to,
                date: _date ?? '',
                totalResults: 0,
                trains: [],
                bookingURL: 'https://eticket.railway.gov.bd',
                note: 'Station not found. Try e.g. "Dhaka", "Chittagong", "Sylhet".',
            };
        }

        const results = BD_TRAIN_ROUTES.filter(r => {
            const idx = (id: string) => r.stops.indexOf(id);
            return idx(fromId) !== -1 && idx(toId) !== -1 && idx(fromId) < idx(toId);
        });

        return {
            from: TRAIN_STATIONS[fromId]?.name ?? from,
            to: TRAIN_STATIONS[toId]?.name ?? to,
            date: _date ?? '',
            totalResults: results.length,
            trains: results.map(r => bdRouteToTrain(r, fromId)),
            bookingURL: 'https://eticket.railway.gov.bd',
            note: 'Data from local offline database.',
        };
    },

    async getAllIntercity(): Promise<IntercityTrainsResponse> {
        const trains = BD_TRAIN_ROUTES.map(r => bdRouteToTrain(r));
        return {
            totalCount: trains.length,
            trains,
            lastUpdated: '2026',
        };
    },

    async getTrainDetails(identifier: string): Promise<TrainDetailsResponse | null> {
        const q = identifier.toLowerCase();
        const route = BD_TRAIN_ROUTES.find(r =>
            r.number === identifier ||
            r.name.toLowerCase().includes(q) ||
            r.id.includes(q)
        );
        if (!route) return null;
        return { train: bdRouteToTrain(route), bookingURL: 'https://eticket.railway.gov.bd' };
    },

    async getFromStation(station: string): Promise<StationTrainsResponse> {
        const stId = resolveStation(station);
        const trains = stId
            ? BD_TRAIN_ROUTES.filter(r => r.stops.includes(stId)).map(r => bdRouteToTrain(r, stId))
            : [];
        return {
            station: stId ? (TRAIN_STATIONS[stId]?.name ?? station) : station,
            totalTrains: trains.length,
            trains,
        };
    },

    async getStatistics(): Promise<TrainStatistics> {
        return {
            metadata: {
                totalTrains: BD_TRAIN_ROUTES.length,
                intercityTrains: BD_TRAIN_ROUTES.filter(r => r.type === 'Intercity' || r.type === 'Express').length,
                mailExpressTrains: BD_TRAIN_ROUTES.filter(r => r.type === 'Mail').length,
                commuterTrains: 0,
                localShuttleTrains: BD_TRAIN_ROUTES.filter(r => r.type === 'Local').length,
                totalStations: Object.keys(TRAIN_STATIONS).length,
                totalRouteKm: 2877,
            },
            zones: {
                eastern: { name: 'Eastern Zone', routeKm: 1334, gauge: 'Meter', divisions: ['Dhaka', 'Chattogram', 'Sylhet'] },
                western: { name: 'Western Zone', routeKm: 1543, gauge: 'Broad', divisions: ['Rajshahi', 'Khulna', 'Rangpur'] },
            },
            majorStations: ['Dhaka (Kamalapur)', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Rangpur'],
            bookingSources: {
                official: 'https://eticket.railway.gov.bd',
                mobileApp: 'Rail Sheba App',
                methods: ['Online', 'Counter', 'Mobile App'],
                advanceBooking: '10 days in advance',
            },
            lastUpdated: '2026',
        };
    },

    async getSuggestions(query: string): Promise<SuggestionsResponse> {
        if (query.length < 2) return { query, suggestions: [] };
        const q = query.toLowerCase();
        const suggestions = ALL_STATION_NAMES
            .filter(n => n.toLowerCase().includes(q))
            .slice(0, 8);
        return { query, suggestions };
    },

    async getPopularRoutes(): Promise<PopularRoutesResponse> {
        const pairs: [string, string][] = [
            ['kamalapur', 'chattogram'],
            ['kamalapur', 'sylhet'],
            ['kamalapur', 'rajshahi'],
            ['kamalapur', 'khulna'],
            ['kamalapur', 'rangpur'],
        ];

        const routes: PopularRoutesResponse['routes'] = {};
        for (const [fromId, toId] of pairs) {
            const trains = BD_TRAIN_ROUTES.filter(r => {
                const idx = (id: string) => r.stops.indexOf(id);
                return idx(fromId) !== -1 && idx(toId) !== -1 && idx(fromId) < idx(toId);
            }).map(r => bdRouteToTrain(r, fromId));

            const key = `${fromId}-${toId}`;
            routes[key] = {
                from: TRAIN_STATIONS[fromId]?.name ?? fromId,
                to: TRAIN_STATIONS[toId]?.name ?? toId,
                trainCount: trains.length,
                trains,
            };
        }

        return { routes, totalRoutes: pairs.length };
    },

    async getChatTrainInfo(from: string, to: string): Promise<ChatTrainResponse> {
        const res = await trainService.searchTrains(from, to);
        const lines = res.trains.slice(0, 5).map(t =>
            `🚂 ${t.trainName} (#${t.trainNumber}) — ছাড়ে ${t.departureTime}, পৌঁছায় ${t.arrivalTime} (${t.duration})`
        );
        const response = res.totalResults > 0
            ? `${from} থেকে ${to}: ${res.totalResults}টি ট্রেন পাওয়া গেছে।\n\n${lines.join('\n')}`
            : `দুঃখিত, ${from} থেকে ${to} সরাসরি কোনো ট্রেন পাওয়া যায়নি।`;

        return {
            from: res.from,
            to: res.to,
            totalTrains: res.totalResults,
            response,
            rawData: res.trains,
            bookingURL: 'https://eticket.railway.gov.bd',
        };
    },
};

// ==================== HELPER FUNCTIONS ====================

export function formatDuration(duration: string): string { return duration; }

export function getClassDisplay(classCode: string): string {
    const classNames: Record<string, string> = {
        AC_B: 'AC Berth', AC_SEAT: 'AC Seat', AC_CHAIR: 'AC Chair',
        S_CHAIR: 'Snigdha Chair', SHOVAN: 'Shovan', SNIGDHA: 'Snigdha',
        SHULOV: 'Shulov', F_SEAT: 'First Seat', F_BERTH: 'First Berth',
    };
    return classNames[classCode] || classCode;
}

export function getTrainTypeIcon(type: string): string {
    const icons: Record<string, string> = {
        Intercity: '🚄', 'Mail/Express': '🚂', Commuter: '🚃', Local: '🚆', Shuttle: '🚈', Express: '🚄',
    };
    return icons[type] || '🚂';
}

export function isValidBookingDate(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 10);
    return date >= today && date <= maxDate;
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateBengali(dateString: string): string {
    return new Date(dateString).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default trainService;
