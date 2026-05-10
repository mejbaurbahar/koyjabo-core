import { STATIONS } from '../constants';

// TomTom API Configuration
// API keys are loaded from environment variables for security
const TOMTOM_API_KEYS = [
    import.meta.env.VITE_TOMTOM_API_KEY_1 || '',
    import.meta.env.VITE_TOMTOM_API_KEY_2 || ''
].filter(key => key.length > 0);

// Fallback to empty array if no keys provided
// This will cause traffic data to gracefully fail without breaking the app
let currentKeyIndex = 0;

function getTomTomApiKey(): string {
    if (TOMTOM_API_KEYS.length === 0) {
        return '';
    }
    return TOMTOM_API_KEYS[currentKeyIndex];
}

function switchToNextKey() {
    currentKeyIndex = (currentKeyIndex + 1) % TOMTOM_API_KEYS.length;
}

// Traffic congestion levels
export type TrafficLevel = 'free' | 'moderate' | 'heavy' | 'severe';

// Cache for traffic data to avoid excessive API calls
interface TrafficCache {
    data: Map<string, TrafficLevel>;
    timestamp: number;
}

const trafficCache: TrafficCache = {
    data: new Map(),
    timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch real-time traffic data from TomTom API
async function fetchTomTomTraffic(lat: number, lng: number): Promise<TrafficLevel | null> {
    try {
        const apiKey = getTomTomApiKey();

        // TomTom Traffic Flow Segment Data API
        const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lng}&unit=KMPH&key=${apiKey}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.status === 403) {
            // API key limit reached, switch to next key
            switchToNextKey();
            return null;
        }

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (!data.flowSegmentData) {
            return null;
        }

        const flowData = data.flowSegmentData;
        const currentSpeed = flowData.currentSpeed || 0;
        const freeFlowSpeed = flowData.freeFlowSpeed || 50;
        const confidence = flowData.confidence || 0.5;

        // Log for verification

        // Calculate speed ratio (how much slower than free flow)
        const speedRatio = currentSpeed / freeFlowSpeed;

        // Determine traffic level based on speed ratio
        // Only trust the data if confidence is reasonable
        if (confidence < 0.1) {
            return 'free'; // Default to free flow if low confidence
        }

        if (speedRatio >= 0.8) return 'free';      // 80%+ of free flow speed
        if (speedRatio >= 0.5) return 'moderate';  // 50-80% of free flow speed
        if (speedRatio >= 0.3) return 'heavy';     // 30-50% of free flow speed
        return 'severe';                            // <30% of free flow speed

    } catch (error) {
        return 'free'; // Default to free flow on error
    }
}

// Get traffic level with API ONLY
export async function getTrafficLevel(stationId: string, currentTime: Date = new Date()): Promise<TrafficLevel> {
    const station = STATIONS[stationId];
    if (!station) {
        return 'free';
    }

    // Try to get from API
    const apiLevel = await fetchTomTomTraffic(station.lat, station.lng);

    return apiLevel || 'free';
}

// Get traffic level for a segment (synchronous version for rendering)
export function getSegmentTrafficLevel(
    fromStationId: string,
    toStationId: string,
    currentTime: Date = new Date()
): TrafficLevel {
    // Check cache first
    const cacheKey = `${fromStationId}-${toStationId}`;
    const now = Date.now();

    if (now - trafficCache.timestamp < CACHE_DURATION && trafficCache.data.has(cacheKey)) {
        return trafficCache.data.get(cacheKey)!;
    }

    // If no cache, return 'free' (Green) immediately while fetching
    // This prevents the "loading" state

    // Fetch real data in background
    const fromStation = STATIONS[fromStationId];
    const toStation = STATIONS[toStationId];

    if (fromStation && toStation) {
        const midLat = (fromStation.lat + toStation.lat) / 2;
        const midLng = (fromStation.lng + toStation.lng) / 2;

        fetchTomTomTraffic(midLat, midLng).then(apiLevel => {
            if (apiLevel) {
                // Only update if it's NOT free (to avoid unnecessary re-renders if it stays green)
                // Actually, we should update always to keep cache fresh, but for UI stability:
                trafficCache.data.set(cacheKey, apiLevel);
                trafficCache.timestamp = Date.now();
            }
        });
    }

    return 'free'; // Default to Green
}

// Get color for traffic level
export function getTrafficColor(level: TrafficLevel | null): string {
    if (!level) return '#34A853'; // Default to Green

    switch (level) {
        case 'free':
            return '#34A853'; // Green
        case 'moderate':
            return '#FBBC04'; // Yellow/Orange
        case 'heavy':
            return '#EA4335'; // Red
        case 'severe':
            return '#9C27B0'; // Dark Red/Purple
        default:
            return '#34A853'; // Default Green
    }
}

// Get human-readable traffic description
export function getTrafficDescription(level: TrafficLevel | null): string {
    if (!level) return 'Free flow';

    switch (level) {
        case 'free':
            return 'Free flow';
        case 'moderate':
            return 'Moderate traffic';
        case 'heavy':
            return 'Heavy traffic';
        case 'severe':
            return 'Severe congestion';
        default:
            return 'Free flow';
    }
}

// Get estimated delay multiplier based on traffic
export function getDelayMultiplier(level: TrafficLevel | null): number {
    if (!level) return 1.0;

    switch (level) {
        case 'free':
            return 1.0;
        case 'moderate':
            return 1.3;
        case 'heavy':
            return 1.8;
        case 'severe':
            return 2.5;
        default:
            return 1.0;
    }
}

// Prefetch traffic data for a route
export async function prefetchRouteTraffic(stationIds: string[]): Promise<void> {
    const promises = stationIds.map(async (stationId, idx) => {
        if (idx === stationIds.length - 1) return;

        const fromId = stationId;
        const toId = stationIds[idx + 1];
        const cacheKey = `${fromId}-${toId}`;

        const fromStation = STATIONS[fromId];
        const toStation = STATIONS[toId];

        if (fromStation && toStation) {
            const midLat = (fromStation.lat + toStation.lat) / 2;
            const midLng = (fromStation.lng + toStation.lng) / 2;

            const level = await fetchTomTomTraffic(midLat, midLng);
            if (level) {
                trafficCache.data.set(cacheKey, level);
                trafficCache.timestamp = Date.now();
            }
        }
    });

    await Promise.all(promises);
}
