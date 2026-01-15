// API Key Manager - Usage Tracking Only
// API keys are now managed on the backend
// This only tracks client-side usage limits

interface UsageRecord {
    aiChatCount: number;
    intercitySearchCount: number;
    lastResetDate: string;
    deviceId: string;
}

const USAGE_LIMITS = {
    AI_CHAT_PER_DAY: Infinity,
    INTERCITY_SEARCH_PER_DAY: Infinity
};

const STORAGE_KEYS = {
    USAGE_RECORD: 'dhaka_commute_api_usage',
    DEVICE_ID: 'dhaka_commute_device_id'
};

// Generate a unique device fingerprint
const generateDeviceFingerprint = (): string => {
    const navigator = window.navigator;
    const screen = window.screen;

    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage,
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return 'DEV_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
};

// Get or create device ID
export const getDeviceId = (): string => {
    let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);

    if (!deviceId) {
        deviceId = generateDeviceFingerprint();
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }

    return deviceId;
};

// Get today's date string
const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

// Get usage record for current device
export const getUsageRecord = (): UsageRecord => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.USAGE_RECORD);
        const today = getTodayDate();
        const deviceId = getDeviceId();

        if (!stored) {
            return {
                aiChatCount: 0,
                intercitySearchCount: 0,
                lastResetDate: today,
                deviceId
            };
        }

        const record: UsageRecord = JSON.parse(stored);

        // Reset counts if it's a new day
        if (record.lastResetDate !== today) {
            record.aiChatCount = 0;
            record.intercitySearchCount = 0;
            record.lastResetDate = today;
            localStorage.setItem(STORAGE_KEYS.USAGE_RECORD, JSON.stringify(record));
        }

        return record;
    } catch (e) {
        console.error('Error loading usage record:', e);
        return {
            aiChatCount: 0,
            intercitySearchCount: 0,
            lastResetDate: getTodayDate(),
            deviceId: getDeviceId()
        };
    }
};

// Save usage record
const saveUsageRecord = (record: UsageRecord): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.USAGE_RECORD, JSON.stringify(record));
    } catch (e) {
        console.error('Error saving usage record:', e);
    }
};

// Check if user can use AI Chat
export const canUseAiChat = (): boolean => {
    const record = getUsageRecord();
    return record.aiChatCount < USAGE_LIMITS.AI_CHAT_PER_DAY;
};

// Check if user can use Intercity Search
export const canUseIntercitySearch = (): boolean => {
    const record = getUsageRecord();
    return record.intercitySearchCount < USAGE_LIMITS.INTERCITY_SEARCH_PER_DAY;
};

// Track AI Chat usage (call this after successful API call)
export const trackAiChatUsage = (): void => {
    const record = getUsageRecord();
    record.aiChatCount += 1;
    saveUsageRecord(record);
};

// Track Intercity Search usage (call this after successful API call)
export const trackIntercitySearchUsage = (): void => {
    const record = getUsageRecord();
    record.intercitySearchCount += 1;
    saveUsageRecord(record);
};

// Get remaining uses for today
export const getRemainingUses = (): { aiChat: number; intercitySearch: number } => {
    const record = getUsageRecord();
    return {
        aiChat: Math.max(0, USAGE_LIMITS.AI_CHAT_PER_DAY - record.aiChatCount),
        intercitySearch: Math.max(0, USAGE_LIMITS.INTERCITY_SEARCH_PER_DAY - record.intercitySearchCount)
    };
};

// Get total usage statistics
export const getTotalUsageStats = (): {
    totalAiChatToday: number;
    totalIntercitySearchToday: number;
    deviceId: string;
} => {
    const record = getUsageRecord();
    return {
        totalAiChatToday: record.aiChatCount,
        totalIntercitySearchToday: record.intercitySearchCount,
        deviceId: record.deviceId
    };
};

// Get time until reset (for UI display)
export const getTimeUntilReset = (): string => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
};
