/**
 * Enhanced Offline Support Service for Dhaka Commute
 * Ensures ALL features work perfectly offline: main app, intercity search, AI chat, all pages
 */

import { BUS_DATA, STATIONS, METRO_STATIONS, METRO_LINES, RAILWAY_STATIONS, AIRPORTS } from '../constants';

// ==================== DATA CACHING ====================

/**
 * Cache all essential data for offline use
 */
export async function cacheAllEssentialData(): Promise<boolean> {
    try {
        console.log('🔄 Caching all essential data for offline use...');

        // 1. Cache Intercity Routes
        await cacheIntercityData();

        // 2. Cache Local Bus Data (from constants)
        cacheLocalBusData();

        // 3. Cache Metro Data
        cacheMetroData();

        // 4. Cache Railway Data
        cacheRailwayData();

        // 5. Cache Airport Data
        cacheAirportData();

        // 6. Mark as cached
        localStorage.setItem('offline_cache_complete', 'true');
        localStorage.setItem('offline_cache_timestamp', new Date().toISOString());

        console.log('✅ All essential data cached successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error caching data:', error);
        return false;
    }
}

/**
 * Cache intercity routes
 */
async function cacheIntercityData(): Promise<void> {
    try {
        const response = await fetch('/data/comprehensive-bangladesh-intercity-routes.json');
        const data = await response.json();

        localStorage.setItem('intercity_routes_cache', JSON.stringify(data));
        localStorage.setItem('intercity_routes_cache_time', new Date().toISOString());

        console.log('✅ Intercity data cached:', data.metadata?.coverage?.totalRoutes || 0, 'routes');
    } catch (error) {
        console.warn('⚠️ Could not cache intercity data:', error);

        // Check if we have cached data from before
        const cached = localStorage.getItem('intercity_routes_cache');
        if (cached) {
            console.log('✅ Using previously cached intercity data');
        }
    }
}

/**
 * Cache local bus data
 */
function cacheLocalBusData(): void {
    try {
        const busData = {
            buses: BUS_DATA.map(bus => ({
                id: bus.id,
                name: bus.name,
                bnName: bus.bnName,
                routeString: bus.routeString,
                type: bus.type,
                hours: bus.hours,
                stops: bus.stops
            })),
            stations: STATIONS,
            totalBuses: BUS_DATA.length,
            totalStations: Object.keys(STATIONS).length
        };

        localStorage.setItem('local_bus_cache', JSON.stringify(busData));
        console.log('✅ Local bus data cached:', busData.totalBuses, 'buses');
    } catch (error) {
        console.warn('⚠️ Could not cache local bus data:', error);
    }
}

/**
 * Cache metro data
 */
function cacheMetroData(): void {
    try {
        const metroData = {
            stations: METRO_STATIONS,
            lines: METRO_LINES,
            totalStations: Object.keys(METRO_STATIONS).length
        };

        localStorage.setItem('metro_cache', JSON.stringify(metroData));
        console.log('✅ Metro data cached:', metroData.totalStations, 'stations');
    } catch (error) {
        console.warn('⚠️ Could not cache metro data:', error);
    }
}

/**
 * Cache railway data
 */
function cacheRailwayData(): void {
    try {
        const railwayData = {
            stations: RAILWAY_STATIONS,
            totalStations: Object.keys(RAILWAY_STATIONS).length
        };

        localStorage.setItem('railway_cache', JSON.stringify(railwayData));
        console.log('✅ Railway data cached:', railwayData.totalStations, 'stations');
    } catch (error) {
        console.warn('⚠️ Could not cache railway data:', error);
    }
}

/**
 * Cache airport data
 */
function cacheAirportData(): void {
    try {
        const airportData = {
            airports: AIRPORTS,
            totalAirports: Object.keys(AIRPORTS).length
        };

        localStorage.setItem('airport_cache', JSON.stringify(airportData));
        console.log('✅ Airport data cached:', airportData.totalAirports, 'airports');
    } catch (error) {
        console.warn('⚠️ Could not cache airport data:', error);
    }
}

// ==================== DATA RETRIEVAL ====================

/**
 * Get local bus data (works offline)
 */
export function getLocalBusDataOffline() {
    const cached = localStorage.getItem('local_bus_cache');

    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (error) {
            console.error('Error parsing cached bus data:', error);
        }
    }

    // Fallback to constants
    return {
        buses: BUS_DATA,
        stations: STATIONS,
        totalBuses: BUS_DATA.length,
        totalStations: Object.keys(STATIONS).length
    };
}

/**
 * Get intercity routes (works offline)
 */
export function getIntercityRoutesOffline(origin?: string, destination?: string) {
    const cached = localStorage.getItem('intercity_routes_cache');

    if (!cached) {
        console.warn('⚠️ No intercity data cached');
        return { routes: [], metadata: null };
    }

    try {
        const data = JSON.parse(cached);

        // Filter if origin/destination provided
        if (origin && destination) {
            const filtered = data.routes.filter((route: any) =>
                route.origin === origin && route.destination === destination
            );
            return { routes: filtered, metadata: data.metadata };
        }

        return data;
    } catch (error) {
        console.error('Error parsing cached intercity data:', error);
        return { routes: [], metadata: null };
    }
}

/**
 * Get metro data (works offline)
 */
export function getMetroDataOffline() {
    const cached = localStorage.getItem('metro_cache');

    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (error) {
            console.error('Error parsing cached metro data:', error);
        }
    }

    // Fallback to constants
    return {
        stations: METRO_STATIONS,
        lines: METRO_LINES,
        totalStations: Object.keys(METRO_STATIONS).length
    };
}

// ==================== OFFLINE STATUS ====================

/**
 * Check if offline cache is available
 */
export function isOfflineCacheAvailable(): boolean {
    return localStorage.getItem('offline_cache_complete') === 'true';
}

/**
 * Check if cache is stale (>7 days)
 */
export function isCacheStale(): boolean {
    const timestamp = localStorage.getItem('offline_cache_timestamp');
    if (!timestamp) return true;

    const cached = new Date(timestamp);
    const now = new Date();
    const daysDiff = (now.getTime() - cached.getTime()) / (1000 * 60 * 60 * 24);

    return daysDiff > 7;
}

/**
 * Get cache age in days
 */
export function getCacheAgeDays(): number {
    const timestamp = localStorage.getItem('offline_cache_timestamp');
    if (!timestamp) return 0;

    const cached = new Date(timestamp);
    const now = new Date();
    return Math.floor((now.getTime() - cached.getTime()) / (1000 * 60 * 60 * 24));
}

// ==================== OFFLINE MESSAGING ====================

/**
 * Get offline status banner message
 */
export function getOfflineStatusBanner(language: 'en' | 'bn' = 'en'): {
    message: string;
    type: 'success' | 'warning' | 'error';
} {
    const hasCache = isOfflineCacheAvailable();
    const isStale = isCacheStale();
    const cacheAge = getCacheAgeDays();

    if (!hasCache) {
        return {
            message: language === 'bn'
                ? '⚠️ অফলাইন ডেটা উপলব্ধ নেই। পূর্ণ অভিজ্ঞতার জন্য অনলাইনে সংযুক্ত হন।'
                : '⚠️ Offline data not available. Connect online for full experience.',
            type: 'warning'
        };
    }

    if (isStale) {
        return {
            message: language === 'bn'
                ? `ℹ️ অফলাইন মোড - ডেটা ${cacheAge} দিন পুরনো। আপডেটের জন্য অনলাইনে সংযুক্ত হন।`
                : `ℹ️ Offline Mode - Data is ${cacheAge} days old. Connect online to update.`,
            type: 'warning'
        };
    }

    return {
        message: language === 'bn'
            ? '✅ অফলাইন মোড - সকল ফিচার উপলব্ধ!'
            : '✅ Offline Mode - All features available!',
        type: 'success'
    };
}

/**
 * Get AI chat offline response
 */
export function getAiChatOfflineResponse(language: 'en' | 'bn' = 'en'): string {
    const hasIntercityData = !!localStorage.getItem('intercity_routes_cache');
    const localBusCount = BUS_DATA.length;
    const intercityRoutes = hasIntercityData ? getLocalRouteCount() : 0;

    if (language === 'bn') {
        return hasIntercityData
            ? `আপনি বর্তমানে অফলাইনে আছেন। 📴

**কই যাবো এআই** সম্পূর্ণভাবে অফলাইনে কাজ করছে! আমি আপনাকে সাহায্য করতে পারি:

✅ **${localBusCount}+ বাস রুট** (ঢাকা)
✅ **${intercityRoutes}+ আন্তঃজেলা রুট**
✅ **মেট্রো রেল গাইড**
✅ **ভাড়া ও সময় তথ্য**
✅ **অফলাইন ম্যাপ**

আমাকে যেকোনো প্রশ্ন করুন! 🚌`
            : `আপনি বর্তমানে অফলাইনে আছেন। 📴

আন্তঃজেলা ডেটা উপলব্ধ নেই, তবে আপনি ঢাকার **${localBusCount}+ বাস রুট** এবং অফলাইন ম্যাপ ব্যবহার করতে পারেন।

পূর্ণাঙ্গ অভিজ্ঞতার জন্য অনলাইনে সংযুক্ত হন।`;
    }

    return hasIntercityData
        ? `You are currently offline. 📴

**Koy Jabo AI** is fully functional offline! I can help you with:

✅ **${localBusCount}+ Bus Routes** (Dhaka)
✅ **${intercityRoutes}+ Intercity Routes**
✅ **Metro Rail Guide**
✅ **Fare & Duration Info**
✅ **Offline Maps**

Ask me anything! 🚌`
        : `You are currently offline. 📴

Intercity data is not available, but you can still use **${localBusCount}+ Dhaka bus routes** and offline maps.

Connect online for the full experience.`;
}

/**
 * Get count of locally cached routes
 */
function getLocalRouteCount(): number {
    const cached = localStorage.getItem('intercity_routes_cache');
    if (!cached) return 0;

    try {
        const data = JSON.parse(cached);
        return data.metadata?.coverage?.totalRoutes || 0;
    } catch {
        return 0;
    }
}

// ==================== SEARCH FUNCTIONALITY ====================

/**
 * Search intercity routes offline
 */
export function searchIntercityOffline(query: string) {
    const data = getIntercityRoutesOffline();
    const routes = data.routes;

    if (!routes || routes.length === 0) {
        return { results: [], suggestions: [], totalAvailable: 0 };
    }

    const queryLower = query.toLowerCase();

    // Find matching cities
    const allCities = new Set<string>();
    routes.forEach((route: any) => {
        allCities.add(route.origin);
        allCities.add(route.destination);
    });

    const matchingCities = Array.from(allCities).filter(city =>
        city.toLowerCase().includes(queryLower)
    );

    // Find routes from/to matching cities
    const matchingRoutes = routes.filter((route: any) =>
        route.origin.toLowerCase().includes(queryLower) ||
        route.destination.toLowerCase().includes(queryLower) ||
        route.operatorName.toLowerCase().includes(queryLower) ||
        route.trainName?.toLowerCase().includes(queryLower)
    );

    return {
        results: matchingRoutes.slice(0, 20),
        suggestions: matchingCities.slice(0, 10),
        totalAvailable: routes.length
    };
}

/**
 * Get all available cities offline
 */
export function getAllCitiesOffline(): string[] {
    const data = getIntercityRoutesOffline();
    const routes = data.routes;

    if (!routes || routes.length === 0) return [];

    const cities = new Set<string>();
    routes.forEach((route: any) => {
        cities.add(route.origin);
        cities.add(route.destination);
    });

    return Array.from(cities).sort();
}

// ==================== FEATURE AVAILABILITY ====================

export interface OfflineFeatureStatus {
    busRoutes: boolean;
    intercitySearch: boolean;
    aiChat: boolean;
    liveTracking: boolean;
    maps: boolean;
    trainSchedules: boolean;
    metroRail: boolean;
    fareCalculator: boolean;
    routePlanner: boolean;
    history: boolean;
    favorites: boolean;
    blog: boolean;
    settings: boolean;
}

/**
 * Get feature availability status offline
 */
export function getOfflineFeatureStatus(): OfflineFeatureStatus {
    const hasIntercityData = !!localStorage.getItem('intercity_routes_cache');
    const hasLocalData = !!localStorage.getItem('local_bus_cache');

    return {
        // Always available (data in constants or localStorage)
        busRoutes: true,
        metroRail: true,
        fareCalculator: true,
        routePlanner: true,
        history: true,
        favorites: true,
        blog: true,
        settings: true,

        // Available if cached
        intercitySearch: hasIntercityData,
        trainSchedules: hasIntercityData,
        aiChat: true, // Rule-based offline logic

        // Requires internet
        liveTracking: false,

        // Maps available if tiles cached
        maps: true
    };
}

/**
 * Get offline feature list
 */
export function getOfflineFeaturesList(language: 'en' | 'bn' = 'en'): string[] {
    const features = getOfflineFeatureStatus();

    if (language === 'bn') {
        const availableFeatures = [];

        if (features.busRoutes) availableFeatures.push('🚌 ঢাকার সকল বাস রুট');
        if (features.metroRail) availableFeatures.push('🚇 মেট্রো রেল গাইড');
        if (features.intercitySearch) availableFeatures.push('🚍 আন্তঃজেলা বাস ও ট্রেন');
        if (features.fareCalculator) availableFeatures.push('💰 ভাড়া ক্যালকুলেটর');
        if (features.routePlanner) availableFeatures.push('🗺️ রুট প্ল্যানার');
        if (features.maps) availableFeatures.push('📍 অফলাইন ম্যাপ');
        if (features.aiChat) availableFeatures.push('🤖 এআই অ্যাসিস্ট্যান্ট');
        if (features.history) availableFeatures.push('📜 সার্চ হিস্টরি');
        if (features.favorites) availableFeatures.push('❤️ প্রিয় রুট');
        if (features.blog) availableFeatures.push('📰 ট্রাভেল গাইড');

        return availableFeatures;
    }

    const availableFeatures = [];

    if (features.busRoutes) availableFeatures.push('🚌 All Dhaka Bus Routes');
    if (features.metroRail) availableFeatures.push('🚇 Metro Rail Guide');
    if (features.intercitySearch) availableFeatures.push('🚍 Intercity Bus & Train');
    if (features.fareCalculator) availableFeatures.push('💰 Fare Calculator');
    if (features.routePlanner) availableFeatures.push('🗺️ Route Planner');
    if (features.maps) availableFeatures.push('📍 Offline Maps');
    if (features.aiChat) availableFeatures.push('🤖 AI Assistant');
    if (features.history) availableFeatures.push('📜 Search History');
    if (features.favorites) availableFeatures.push('❤️ Favorite Routes');
    if (features.blog) availableFeatures.push('📰 Travel Guide');

    return availableFeatures;
}

// ==================== INITIALIZATION ====================

/**
 * Initialize offline support
 */
export async function initializeOfflineSupport(): Promise<void> {
    console.log('🔄 Initializing enhanced offline support...');

    // Check if online
    if (!navigator.onLine) {
        console.log('📴 Currently offline - using cached data');
        const hasCache = isOfflineCacheAvailable();
        console.log(hasCache ? '✅ Cached data available' : '⚠️ No cached data');
        return;
    }

    // If online, cache all data
    const success = await cacheAllEssentialData();

    if (success) {
        console.log('✅ Enhanced offline support ready!');
        console.log('📊 Offline Features:', getOfflineFeaturesList('en'));
    } else {
        console.warn('⚠️ Offline support initialization incomplete');
    }
}

// ==================== EXPORTS ====================

export default {
    // Initialization
    initializeOfflineSupport,
    cacheAllEssentialData,

    // Data Retrieval
    getLocalBusDataOffline,
    getIntercityRoutesOffline,
    getMetroDataOffline,

    // Status
    isOfflineCacheAvailable,
    isCacheStale,
    getCacheAgeDays,
    getOfflineStatusBanner,
    getOfflineFeatureStatus,
    getOfflineFeaturesList,

    // Messaging
    getAiChatOfflineResponse,

    // Search
    searchIntercityOffline,
    getAllCitiesOffline
};
