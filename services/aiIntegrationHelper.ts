/**
 * Quick Integration Helper for Enhanced AI
 * Add these snippets to your geminiService.ts
 */

// ==================== STEP 1: IMPORTS ====================
// Add to top of geminiService.ts:

import {
    FARE_DATA,
    TRAFFIC_PATTERNS,
    BUS_TYPES,
    TRAVEL_TIPS,
    FAQ_DATABASE,
    SEASONAL_INFO,
    EMERGENCY_INFO
} from './enhancedAIData';

import {
    enhanceResponseWithOnlineData,
    learningSystem,
    fetchWeatherData,
    getSmartSuggestions,
    getWeatherRecommendations
} from './onlineLearningService';

// ==================== STEP 2: INITIALIZATION ====================
// Add once when service loads:

// Initialize learning system on app start
learningSystem.loadFromStorage();

// ==================== STEP 3: FAQ QUICK ANSWER ====================
// Add at start of askGeminiRoute function (before other checks):

export const askGeminiRoute = async (
    userQuery: string,
    _userApiKey?: string,
    chatHistory: ChatMessage[] = []
): Promise<string> => {

    const query = userQuery.trim();
    const lowerQuery = query.toLowerCase();
    const isBn = /[\u0980-\u09FF]/.test(query);

    // === NEW: Check FAQ Database First ===
    const faqChecks = {
        'metro timing': lowerQuery.includes('metro') && (lowerQuery.includes('time') || lowerQuery.includes('timing') || lowerQuery.includes('সময়')),
        'bus fare': lowerQuery.includes('fare') || lowerQuery.includes('ভাড়া') && !lowerQuery.includes('metro'),
        'best time to travel': lowerQuery.includes('best time') || lowerQuery.includes('peak') || lowerQuery.includes('সেরা সময়')
    };

    for (const [key, condition] of Object.entries(faqChecks)) {
        if (condition && FAQ_DATABASE[key]) {
            const faqResponse = FAQ_DATABASE[key][isBn ? 'bn' : 'en'];
            // Still enhance with online data
            return await enhanceResponseWithOnlineData(faqResponse, query, isBn ? 'bn' : 'en');
        }
    }

    // ... continue with your existing logic ...
};

// ==================== STEP 4: TRAFFIC-AWARE RESPONSES ====================
// Add to route planning responses:

function addTrafficContext(response: string, isBn: boolean): string {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    // Morning peak
    if (hour >= 8 && hour <= 10) {
        const delay = TRAFFIC_PATTERNS.dhaka.peakHours.morning.delayFactor;
        response += isBn
            ? `\n\n⏰ **সকালের পিক আওয়ার!** স্বাভাবিকের চেয়ে ${delay}x বেশি সময় লাগতে পারে।`
            : `\n\n⏰ **Morning Peak Hour!** Expect ${delay}x normal travel time.`;
    }

    // Evening peak
    if (hour >= 17 && hour <= 20) {
        const delay = TRAFFIC_PATTERNS.dhaka.peakHours.evening.delayFactor;
        response += isBn
            ? `\n\n🌆 **সন্ধ্যার পিক আওয়ার!** স্বাভাবিকের চেয়ে ${delay}x বেশি সময় লাগবে। মেট্রো দ্রুততম।`
            : `\n\n🌆 **Evening Peak Hour!** Expect ${delay}x normal time. Metro is fastest.`;
    }

    // Friday
    if (day === 5) {
        response += isBn
            ? `\n\n🕌 **শুক্রবার:** মেট্রো বন্ধ। শুধু বাস সার্ভিস চলছে।`
            : `\n\n🕌 **Friday:** Metro closed. Only bus services available.`;
    }

    return response;
}

// Usage: response = addTrafficContext(response, isBn);

// ==================== STEP 5: BUS TYPE INFO ====================
// When showing bus routes, add bus type details:

function addBusTypeInfo(busType: string, isBn: boolean): string {
    const typeInfo = BUS_TYPES[busType as keyof typeof BUS_TYPES];
    if (!typeInfo) return '';

    return isBn
        ? `\n**ধরন:** ${typeInfo.bnName}\n**সুবিধা:** ${typeInfo.features.join(', ')}\n**ভাড়া রেঞ্জ:** ৳${typeInfo.avgFare}`
        : `\n**Type:** ${typeInfo.fullName}\n**Features:** ${typeInfo.features.join(', ')}\n**Fare Range:** ৳${typeInfo.avgFare}`;
}

// ==================== STEP 6: SEASONAL RECOMMENDATIONS ====================
// For tourist destination queries:

function addSeasonalAdvice(destination: string, isBn: boolean): string {
    const month = new Date().getMonth(); // 0-11
    let season: keyof typeof SEASONAL_INFO = 'winter';

    if (month >= 3 && month <= 9) season = 'summer';
    else if (month >= 5 && month <= 8) season = 'monsoon';
    else season = 'winter';

    const info = SEASONAL_INFO[season];
    const tips = info.considerations.slice(0, 3).join('\n- ');

    return isBn
        ? `\n\n🌍 **মৌসুমিক পরামর্শ:**\n- ${tips}`
        : `\n\n🌍 **Seasonal Advice:**\n- ${tips}`;
}

// ==================== STEP 7: EMERGENCY INFO ====================
// Add for safety queries:

if (lowerQuery.includes('emergency') || lowerQuery.includes('help') ||
    lowerQuery.includes('hospital') || lowerQuery.includes('জরুরি')) {

    const emergencyResponse = isBn
        ? `🚨 **জরুরি নম্বর:**\n` +
        `- পুলিশ/অ্যাম্বুলেন্স/ফায়ার: **${EMERGENCY_INFO.numbers.police}**\n` +
        `- ট্রাফিক পুলিশ: **${EMERGENCY_INFO.numbers.trafficPolice}**\n` +
        `- রেলওয়ে: **${EMERGENCY_INFO.numbers.railway}**\n\n` +
        `🏥 **হাসপাতাল:** ${EMERGENCY_INFO.hospitals.dhaka.slice(0, 3).join(', ')}`
        : `🚨 **Emergency Numbers:**\n` +
        `- Police/Ambulance/Fire: **${EMERGENCY_INFO.numbers.police}**\n` +
        `- Traffic Police: **${EMERGENCY_INFO.numbers.trafficPolice}**\n` +
        `- Railway: **${EMERGENCY_INFO.numbers.railway}**\n\n` +
        `🏥 **Hospitals:** ${EMERGENCY_INFO.hospitals.dhaka.slice(0, 3).join(', ')}`;

    return emergencyResponse;
}

// ==================== STEP 8: TRAVEL TIPS ====================
// Add at end of responses for general queries:

function addTravelTips(query: string, isBn: boolean): string {
    const isIntercity = query.toLowerCase().match(/(cox|sylhet|chittagong|চট্টগ্রাম|সিলেট|কক্স)/);
    const tips = isIntercity
        ? TRAVEL_TIPS.intercity[isBn ? 'bn' : 'en']
        : TRAVEL_TIPS.general[isBn ? 'bn' : 'en'];

    const randomTips = tips.sort(() => 0.5 - Math.random()).slice(0, 3);

    return isBn
        ? `\n\n💡 **ট্রাভেল টিপস:**\n- ${randomTips.join('\n- ')}`
        : `\n\n💡 **Travel Tips:**\n- ${randomTips.join('\n- ')}`;
}

// ==================== STEP 9: FINAL ENHANCEMENT ====================
// At the very end of askGeminiRoute, before returning:

export const askGeminiRoute = async (...args): Promise<string> => {
    // ... all your existing logic ...

    let finalResponse = responseParts.join('\n\n');

    // === NEW: Add traffic context ===
    finalResponse = addTrafficContext(finalResponse, isBn);

    // === NEW: Add random travel tip (1 in 3 chance) ===
    if (Math.random() < 0.33) {
        finalResponse += addTravelTips(query, isBn);
    }

    // === NEW: Enhance with online data (weather, smart suggestions) ===
    if (navigator.onLine) {
        try {
            finalResponse = await enhanceResponseWithOnlineData(
                finalResponse,
                query,
                isBn ? 'bn' : 'en'
            );
        } catch (error) {
            // Fails silently, returns base response
        }
    }

    // === NEW: Log query for learning ===
    learningSystem.logQuery(query, true);

    return finalResponse;
};

// ==================== STEP 10: EXAMPLE USAGE ====================

/*
EXAMPLE 1: User asks "Farmgate to Mirpur"

Before Enhancement:
"🚌 Routes from Farmgate to Mirpur:
- Bus 10: Farmgate → Mirpur
- Fare: ৳25"

After Enhancement:
"🚌 Routes from Farmgate to Mirpur:
- Bus 10: Farmgate → Mirpur
- Fare: ৳25

⏰ Evening Peak Hour! Expect 2.5x normal time.
💡 Metro is fastest during peak hours.

💡 Travel Tips:
- Keep small change for bus fare
- Peak hours: 8-10 AM, 5-8 PM - expect delays"
*/

/*
EXAMPLE 2: User asks "Cox's Bazar trip"

Before Enhancement:
"🏖️ Cox's Bazar:
Bus: Green Line (10-12 hours, ৳1200-2500)"

After Enhancement:
"🏖️ Cox's Bazar:
Bus: Green Line (10-12 hours, ৳1200-2500)

🌤️ Weather in Cox's Bazar: 32°C, sunny
💡 Perfect beach weather!

🌍 Seasonal Advice:
- Best season: Nov-March (avoid monsoon)
- Carry sunscreen, hats, swimwear
- Book hotels in advance during peak season

💡 Travel Tips:
- Book online for better prices
- Night buses recommended for long distances"
*/

// ==================== QUICK CHECKLIST ====================
/*
✅ Import enhanced data and online service
✅ Initialize learning system
✅ Add FAQ quick answers
✅ Add traffic context to responses
✅ Include bus type information
✅ Add seasonal recommendations
✅ Include emergency info when needed
✅ Add random travel tips
✅ Enhance with online data
✅ Log queries for learning
*/

export default {
    addTrafficContext,
    addBusTypeInfo,
    addSeasonalAdvice,
    addTravelTips
};
