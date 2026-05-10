// Daily Journey Tracker Service
// Tracks user's location throughout the day and builds a journey history

export interface JourneyPoint {
    id: string;
    timestamp: number;
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
}

export interface JourneyStop {
    id: string;
    location: JourneyPoint;
    arrivalTime: number;
    departureTime?: number;
    duration: number; // milliseconds
    address: string;
    isSignificant: boolean; // Stayed > 5 minutes
}

export interface DailyJourney {
    date: string; // YYYY-MM-DD
    startTime: number;
    endTime: number;
    points: JourneyPoint[];
    stops: JourneyStop[];
    totalDistance: number; // kilometers
    totalDuration: number; // milliseconds
}

// Configuration
const TRACKING_CONFIG = {
    minDistanceChange: 50, // meters
    minTimeGap: 30000, // 30 seconds
    stopThreshold: 5 * 60 * 1000, // 5 minutes
    stopRadius: 100, // meters
    maxDaysToKeep: 7,
};

// Storage keys
const STORAGE_KEYS = {
    TODAY_JOURNEY: 'dhaka_commute_today_journey',
    JOURNEY_HISTORY: 'dhaka_commute_journey_history',
    LAST_RESET: 'dhaka_commute_last_reset',
};

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Generate unique ID
 */
function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current journey for today
 */
export function getTodayJourney(): DailyJourney | null {
    try {
        // Check if we need to reset (new day)
        checkAndResetIfNewDay();

        const stored = localStorage.getItem(STORAGE_KEYS.TODAY_JOURNEY);
        if (!stored) return null;

        return JSON.parse(stored);
    } catch (error) {
        return null;
    }
}

/**
 * Initialize a new journey for today
 */
function initializeTodayJourney(): DailyJourney {
    const journey: DailyJourney = {
        date: getTodayDateString(),
        startTime: Date.now(),
        endTime: Date.now(),
        points: [],
        stops: [],
        totalDistance: 0,
        totalDuration: 0,
    };

    localStorage.setItem(STORAGE_KEYS.TODAY_JOURNEY, JSON.stringify(journey));
    localStorage.setItem(STORAGE_KEYS.LAST_RESET, Date.now().toString());

    return journey;
}

/**
 * Check if it's a new day and reset if needed
 */
function checkAndResetIfNewDay(): void {
    const lastReset = localStorage.getItem(STORAGE_KEYS.LAST_RESET);
    const currentJourney = localStorage.getItem(STORAGE_KEYS.TODAY_JOURNEY);

    if (!currentJourney) {
        initializeTodayJourney();
        return;
    }

    const journey: DailyJourney = JSON.parse(currentJourney);
    const today = getTodayDateString();

    // If journey date doesn't match today, archive and reset
    if (journey.date !== today) {
        archiveJourney(journey);
        initializeTodayJourney();
    }
}

/**
 * Archive old journey to history
 */
function archiveJourney(journey: DailyJourney): void {
    try {
        const historyStr = localStorage.getItem(STORAGE_KEYS.JOURNEY_HISTORY);
        const history: DailyJourney[] = historyStr ? JSON.parse(historyStr) : [];

        // Add today's journey
        history.push(journey);

        // Keep only last N days
        const filtered = history
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, TRACKING_CONFIG.maxDaysToKeep);

        localStorage.setItem(STORAGE_KEYS.JOURNEY_HISTORY, JSON.stringify(filtered));
    } catch (error) {
    }
}

/**
 * Add a new location point to today's journey
 */
export function addJourneyPoint(
    latitude: number,
    longitude: number,
    accuracy: number
): void {
    try {
        let journey = getTodayJourney();
        if (!journey) {
            journey = initializeTodayJourney();
        }

        const lastPoint = journey.points[journey.points.length - 1];

        // Check if we should add this point
        if (lastPoint) {
            const timeSinceLastPoint = Date.now() - lastPoint.timestamp;
            const distanceFromLast = calculateDistance(
                lastPoint.latitude,
                lastPoint.longitude,
                latitude,
                longitude
            ) * 1000; // Convert to meters

            // Skip if too soon or too close
            if (
                timeSinceLastPoint < TRACKING_CONFIG.minTimeGap ||
                distanceFromLast < TRACKING_CONFIG.minDistanceChange
            ) {
                return;
            }

            // Update total distance
            journey.totalDistance += distanceFromLast / 1000; // km
        }

        // Create new point
        const point: JourneyPoint = {
            id: generateId(),
            timestamp: Date.now(),
            latitude,
            longitude,
            accuracy,
        };

        journey.points.push(point);
        journey.endTime = Date.now();
        journey.totalDuration = journey.endTime - journey.startTime;

        // Detect stops
        detectAndUpdateStops(journey);

        // Save
        localStorage.setItem(STORAGE_KEYS.TODAY_JOURNEY, JSON.stringify(journey));

    } catch (error) {
    }
}

/**
 * Detect stops (when user stays in one place for a while)
 */
function detectAndUpdateStops(journey: DailyJourney): void {
    if (journey.points.length < 2) return;

    const recentPoints = journey.points.slice(-10); // Last 10 points
    const latestPoint = recentPoints[recentPoints.length - 1];

    // Check if we're at a stop (within stopRadius of previous points)
    const nearbyPoints = recentPoints.filter((p) => {
        const distance =
            calculateDistance(p.latitude, p.longitude, latestPoint.latitude, latestPoint.longitude) *
            1000;
        return distance < TRACKING_CONFIG.stopRadius;
    });

    if (nearbyPoints.length >= 3) {
        // Stayed in same area for multiple points
        const firstPoint = nearbyPoints[0];
        const duration = latestPoint.timestamp - firstPoint.timestamp;

        // Check if this is a new stop or updating existing one
        const lastStop = journey.stops[journey.stops.length - 1];

        if (lastStop && !lastStop.departureTime) {
            // Update existing stop
            lastStop.departureTime = latestPoint.timestamp;
            lastStop.duration = lastStop.departureTime - lastStop.arrivalTime;
            lastStop.isSignificant = lastStop.duration >= TRACKING_CONFIG.stopThreshold;
        } else if (duration >= TRACKING_CONFIG.stopThreshold) {
            // Create new significant stop
            const stop: JourneyStop = {
                id: generateId(),
                location: firstPoint,
                arrivalTime: firstPoint.timestamp,
                duration: duration,
                address: 'Loading...', // Will be geocoded later
                isSignificant: true,
            };

            journey.stops.push(stop);
        }
    } else if (journey.stops.length > 0) {
        // Mark departure from last stop
        const lastStop = journey.stops[journey.stops.length - 1];
        if (!lastStop.departureTime) {
            lastStop.departureTime = latestPoint.timestamp;
            lastStop.duration = lastStop.departureTime - lastStop.arrivalTime;
        }
    }
}

/**
 * Get journey history (past days)
 */
export function getJourneyHistory(): DailyJourney[] {
    try {
        const historyStr = localStorage.getItem(STORAGE_KEYS.JOURNEY_HISTORY);
        return historyStr ? JSON.parse(historyStr) : [];
    } catch (error) {
        return [];
    }
}

/**
 * Clear today's journey (manual reset)
 */
export function clearTodayJourney(): void {
    const journey = getTodayJourney();
    if (journey) {
        archiveJourney(journey);
    }
    initializeTodayJourney();
}

/**
 * Clear all journey history
 */
export function clearAllJourneys(): void {
    localStorage.removeItem(STORAGE_KEYS.TODAY_JOURNEY);
    localStorage.removeItem(STORAGE_KEYS.JOURNEY_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.LAST_RESET);
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}min`;
    } else {
        return 'Just now';
    }
}

/**
 * Format distance in human-readable format
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)} km`;
}
