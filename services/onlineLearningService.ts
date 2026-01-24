/**
 * Online Learning Service for AI Assistant
 * Fetches real-time data from online sources when available
 */

interface WeatherData {
    temperature: number;
    condition: string;
    humidity: number;
    precipitation: number;
}

interface TrafficData {
    congestionLevel: 'low' | 'moderate' | 'heavy' | 'very heavy';
    estimatedDelay: number;
    incidents: string[];
}

interface NewsUpdate {
    title: string;
    description: string;
    relevance: 'high' | 'medium' | 'low';
    timestamp: Date;
}

/**
 * Fetch current weather for better travel recommendations
 */
export async function fetchWeatherData(city: string = 'Dhaka'): Promise<WeatherData | null> {
    try {
        if (!navigator.onLine) return null;

        // Get coordinates for Dhaka
        const coords = {
            Dhaka: { lat: 23.8103, lon: 90.4125 },
            Chattogram: { lat: 22.3569, lon: 91.7832 },
            Sylhet: { lat: 24.8949, lon: 91.8687 },
            'Cox\'s Bazar': { lat: 21.4272, lon: 92.0058 }
        };

        const location = coords[city as keyof typeof coords] || coords.Dhaka;

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=Asia/Dhaka`,
            { signal: AbortSignal.timeout(5000) }
        );

        if (!response.ok) return null;

        const data = await response.json();

        return {
            temperature: Math.round(data.current.temperature_2m),
            condition: data.current.precipitation > 0 ? 'rainy' : data.current.temperature_2m > 30 ? 'hot' : 'pleasant',
            humidity: data.current.relative_humidity_2m,
            precipitation: data.current.precipitation
        };
    } catch (error) {
        console.log('Weather data not available:', error);
        return null;
    }
}

/**
 * Get weather-based travel recommendations
 */
export function getWeatherRecommendations(weather: WeatherData | null, language: 'en' | 'bn' = 'en'): string {
    if (!weather) return '';

    const recommendations: string[] = [];

    if (weather.precipitation > 0) {
        recommendations.push(
            language === 'bn'
                ? '🌧️ **আজ বৃষ্টি হচ্ছে!** ছাতা নিয়ে যান এবং ট্রাফিক জ্যামের জন্য অতিরিক্ত সময় রাখুন।'
                : '🌧️ **It\'s raining today!** Carry an umbrella and allow extra time for traffic.'
        );
    }

    if (weather.temperature > 35) {
        recommendations.push(
            language === 'bn'
                ? '🌡️ **খুব গরম!** পানি নিয়ে যান এবং সম্ভব হলে এসি বাস ব্যবহার করুন।'
                : '🌡️ **Very hot weather!** Carry water and consider AC buses if possible.'
        );
    } else if (weather.temperature < 15) {
        recommendations.push(
            language === 'bn'
                ? '🧥 **ঠান্ডা আবহাওয়া!** হালকা জ্যাকেট নিয়ে যান।'
                : '🧥 **Cool weather!** Bring a light jacket.'
        );
    }

    return recommendations.join('\n');
}

/**
 * Cache mechanism for online data
 */
class DataCache {
    private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

    set(key: string, data: any, ttlMinutes: number = 30) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMinutes * 60 * 1000
        });
    }

    get(key: string): any | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clear() {
        this.cache.clear();
    }
}

export const dataCache = new DataCache();

/**
 * Fetch transport news and updates
 */
export async function fetchTransportNews(): Promise<NewsUpdate[]> {
    try {
        if (!navigator.onLine) return [];

        // Check cache first
        const cached = dataCache.get('transport_news');
        if (cached) return cached;

        // In production, would fetch from news API
        // For now, return empty or use mock data
        const news: NewsUpdate[] = [];

        dataCache.set('transport_news', news, 60); // Cache for 60 minutes
        return news;
    } catch (error) {
        console.log('News data not available:', error);
        return [];
    }
}

/**
 * Learn from user queries and improve responses
 */
export class QueryLearningSystem {
    private queryHistory: Map<string, number> = new Map();
    private successfulResponses: Set<string> = new Set();

    logQuery(query: string, wasHelpful: boolean = true) {
        const normalized = query.toLowerCase().trim();

        // Track frequency
        const count = this.queryHistory.get(normalized) || 0;
        this.queryHistory.set(normalized, count + 1);

        // Track successful responses
        if (wasHelpful) {
            this.successfulResponses.add(normalized);
        }

        // Store in localStorage for persistence
        this.saveToStorage();
    }

    getPopularQueries(limit: number = 10): string[] {
        return Array.from(this.queryHistory.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([query]) => query);
    }

    isCommonQuery(query: string): boolean {
        const normalized = query.toLowerCase().trim();
        return (this.queryHistory.get(normalized) || 0) >= 3;
    }

    private saveToStorage() {
        try {
            localStorage.setItem('ai_query_history', JSON.stringify(Array.from(this.queryHistory.entries())));
            localStorage.setItem('ai_successful_responses', JSON.stringify(Array.from(this.successfulResponses)));
        } catch (error) {
            console.log('Could not save query history:', error);
        }
    }

    loadFromStorage() {
        try {
            const history = localStorage.getItem('ai_query_history');
            const successful = localStorage.getItem('ai_successful_responses');

            if (history) {
                this.queryHistory = new Map(JSON.parse(history));
            }
            if (successful) {
                this.successfulResponses = new Set(JSON.parse(successful));
            }
        } catch (error) {
            console.log('Could not load query history:', error);
        }
    }
}

export const learningSystem = new QueryLearningSystem();

/**
 * Get smart context-aware suggestions
 */
export function getSmartSuggestions(query: string, language: 'en' | 'bn' = 'en'): string[] {
    const normalized = query.toLowerCase();
    const suggestions: string[] = [];

    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 10) {
        suggestions.push(
            language === 'bn'
                ? '☕ সকালের পিক আওয়ার! মেট্রো দ্রুততম অপশন।'
                : '☕ Morning peak hour! Metro is your fastest option.'
        );
    } else if (hour >= 17 && hour <= 20) {
        suggestions.push(
            language === 'bn'
                ? '🌆 সন্ধ্যার পিক আওয়ার! অতিরিক্ত ৩০-৪৫ মিনিট সময় রাখুন।'
                : '🌆 Evening peak hour! Allow extra 30-45 minutes.'
        );
    }

    // Day-based suggestions
    const day = new Date().getDay();
    if (day === 5) { // Friday
        suggestions.push(
            language === 'bn'
                ? '🕌 শুক্রবার - মেট্রো বন্ধ! বাস রুট চেক করুন।'
                : '🕌 Friday - Metro closed! Check bus routes.'
        );
    }

    // Query-specific suggestions
    if (normalized.includes('cox') || normalized.includes('কক্স')) {
        suggestions.push(
            language === 'bn'
                ? '🏖️ কক্সবাজার? আগে বুক করুন! পিক সিজন নভেম্বর-ফেব্রুয়ারি।'
                : '🏖️ Cox\'s Bazar? Book advance! Peak season Nov-Feb.'
        );
    }

    return suggestions;
}

/**
 * Enhance AI response with online data
 */
export async function enhanceResponseWithOnlineData(
    baseResponse: string,
    query: string,
    language: 'en' | 'bn' = 'en'
): Promise<string> {
    const enhancements: string[] = [baseResponse];

    try {
        // Add weather information if relevant
        if (query.toLowerCase().includes('weather') || query.toLowerCase().includes('আবহাওয়া') ||
            query.toLowerCase().includes('cox') || query.toLowerCase().includes('tour')) {

            const weather = await fetchWeatherData('Dhaka');
            const weatherRec = getWeatherRecommendations(weather, language);
            if (weatherRec) {
                enhancements.push('\n' + weatherRec);
            }
        }

        // Add smart suggestions
        const suggestions = getSmartSuggestions(query, language);
        if (suggestions.length > 0) {
            enhancements.push('\n💡 ' + suggestions.join('\n💡 '));
        }

        // Log query for learning
        learningSystem.logQuery(query);

    } catch (error) {
        console.log('Could not enhance response:', error);
    }

    return enhancements.join('\n');
}

export default {
    fetchWeatherData,
    getWeatherRecommendations,
    fetchTransportNews,
    learningSystem,
    getSmartSuggestions,
    enhanceResponseWithOnlineData,
    dataCache
};
