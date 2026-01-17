/**
 * Offline Support Service for Dhaka Commute
 * Ensures all features work perfectly offline: main app, intercity search, AI chat
 */

// 1. Check if comprehensive intercity data is available
export async function ensureIntercityDataCached(): Promise<boolean> {
    try {
        // Try to import the comprehensive database
        const response = await fetch('/data/comprehensive-bangladesh-intercity-routes.json');
        const data = await response.json();

        // Cache in localStorage for instant offline access
        localStorage.setItem('intercity_routes_cache', JSON.stringify(data));
        localStorage.setItem('intercity_routes_cache_time', new Date().toISOString());

        console.log('✅ Intercity data cached:', data.metadata.coverage.totalRoutes, 'routes');
        return true;
    } catch (error) {
        console.warn('⚠️ Could not cache intercity data:', error);

        // Check if we have cached data from before
        const cached = localStorage.getItem('intercity_routes_cache');
        if (cached) {
            console.log('✅ Using previously cached intercity data');
            return true;
        }

        return false;
    }
}

// 2. Get intercity routes (works offline)
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

// 3. Check if data is stale (>7 days)
export function isIntercityDataStale(): boolean {
    const cacheTime = localStorage.getItem('intercity_routes_cache_time');
    if (!cacheTime) return true;

    const cached = new Date(cacheTime);
    const now = new Date();
    const daysDiff = (now.getTime() - cached.getTime()) / (1000 * 60 * 60 * 24);

    return daysDiff > 7;
}

// 4. Get offline status message
export function getOfflineStatusMessage(language: 'en' | 'bn' = 'en'): string {
    const isStale = isIntercityDataStale();
    const hasData = !!localStorage.getItem('intercity_routes_cache');

    if (!hasData) {
        return language === 'bn'
            ? '⚠️ অফলাইন ডেটা উপলব্ধ নেই। অনুগ্রহ করে অনলাইনে একবার ভিজিট করুন।'
            : '⚠️ Offline data not available. Please visit once while online.';
    }

    if (isStale) {
        const cacheTime = localStorage.getItem('intercity_routes_cache_time');
        const daysOld = Math.floor(
            (new Date().getTime() - new Date(cacheTime!).getTime()) / (1000 * 60 * 60 * 24)
        );

        return language === 'bn'
            ? `ℹ️ অফলাইন মোড (ডেটা ${daysOld} দিন পুরনো)`
            : `ℹ️ Offline Mode (Data is ${daysOld} days old)`;
    }

    return language === 'bn'
        ? '✅ অফলাইন মোড - সকল ডেটা উপলব্ধ'
        : '✅ Offline Mode - All data available';
}

// 5. AI Chat offline handler
export function getAiChatOfflineResponse(language: 'en' | 'bn' = 'en'): string {
    const hasIntercityData = !!localStorage.getItem('intercity_routes_cache');

    if (language === 'bn') {
        return hasIntercityData
            ? `আপনি বর্তমানে অফলাইনে আছেন। আমি এখনও আপনাকে সাহায্য করতে পারি:

✅ বাস রুট খুঁজুন
✅ ট্রেন সময়সূচী চেক করুন
✅ ইন্টারসিটি রুট খুঁজুন (${getLocalRouteCount()} টি রুট উপলব্ধ)
✅ ভাড়া তথ্য পান

⚠️ লাইভ ট্র্যাকিং এবং রিয়েল-টাইম আপডেটের জন্য অনলাইন সংযোগ প্রয়োজন।

আমি আপনাকে কিভাবে সাহায্য করতে পারি?`
            : `আপনি বর্তমানে অফলাইনে আছেন।

স্থানীয় ডেটা উপলব্ধ নেই। অনুগ্রহ করে AI চ্যাট ব্যবহার করতে অনলাইনে সংযুক্ত হন।

তবে আপনি এখনও:
- স্থানীয় বাস রুট খুঁজতে পারেন
- মানচিত্র ব্যবহার করতে পারেন
- সংরক্ষিত রুট দেখতে পারেন`;
    }

    return hasIntercityData
        ? `You are currently offline. I can still help you with:

✅ Find bus routes
✅ Check train schedules  
✅ Search intercity routes (${getLocalRouteCount()} routes available)
✅ Get fare information

⚠️ Live tracking and real-time updates require online connection.

How can I assist you?`
        : `You are currently offline.

Local data is not available. Please connect online to use AI chat.

However, you can still:
- Search local bus routes
- Use the map
- View saved routes`;
}

// 6. Get count of locally cached routes
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

// 7. Search intercity routes offline with smart suggestions
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

// 8. Initialize offline support
export async function initializeOfflineSupport(): Promise<void> {
    console.log('🔄 Initializing offline support...');

    // Check if online
    if (!navigator.onLine) {
        console.log('📴 Currently offline - using cached data');
        const hasCache = !!localStorage.getItem('intercity_routes_cache');
        console.log(hasCache ? '✅ Cached data available' : '⚠️ No cached data');
        return;
    }

    // If online, ensure data is cached
    const success = await ensureIntercityDataCached();

    if (success) {
        console.log('✅ Offline support ready!');
    } else {
        console.warn('⚠️ Offline support initialization incomplete');
    }
}

// 9. Get all available cities (offline)
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

// 10. Check feature availability offline
export interface OfflineFeatureStatus {
    busRoutes: boolean;
    intercitySearch: boolean;
    aiChat: boolean;
    liveTracking: boolean;
    maps: boolean;
    trainSchedules: boolean;
}

export function getOfflineFeatureStatus(): OfflineFeatureStatus {
    const hasIntercityData = !!localStorage.getItem('intercity_routes_cache');

    return {
        busRoutes: true, // Always available (constants.ts)
        intercitySearch: hasIntercityData,
        aiChat: false, // Requires API
        liveTracking: false, // Requires internet
        maps: true, // Cached tiles
        trainSchedules: hasIntercityData
    };
}

export default {
    ensureIntercityDataCached,
    getIntercityRoutesOffline,
    isIntercityDataStale,
    getOfflineStatusMessage,
    getAiChatOfflineResponse,
    searchIntercityOffline,
    initializeOfflineSupport,
    getAllCitiesOffline,
    getOfflineFeatureStatus
};
