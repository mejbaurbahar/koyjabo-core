/**
 * AI Integration Helper — Enhanced response utilities
 * These helpers can be applied on top of askGeminiRoute responses.
 */

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
  getSmartSuggestions,
  getWeatherRecommendations
} from './onlineLearningService';

import { ChatMessage } from '../types';
import { askGeminiRoute as _askGeminiRoute } from './geminiService';

// Initialize learning system on module load
learningSystem.loadFromStorage();

// ── Traffic context ──────────────────────────────────────────────────────────

export function addTrafficContext(response: string, isBn: boolean): string {
  const hour = new Date().getHours();
  const day = new Date().getDay();

  if (hour >= 8 && hour <= 10) {
    const delay = TRAFFIC_PATTERNS.dhaka.peakHours.morning.delayFactor;
    response += isBn
      ? `\n\n⏰ **সকালের পিক আওয়ার!** স্বাভাবিকের চেয়ে ${delay}x বেশি সময় লাগতে পারে।`
      : `\n\n⏰ **Morning Peak Hour!** Expect ${delay}x normal travel time.`;
  }

  if (hour >= 17 && hour <= 20) {
    const delay = TRAFFIC_PATTERNS.dhaka.peakHours.evening.delayFactor;
    response += isBn
      ? `\n\n🌆 **সন্ধ্যার পিক আওয়ার!** স্বাভাবিকের চেয়ে ${delay}x বেশি সময় লাগবে। মেট্রো দ্রুততম।`
      : `\n\n🌆 **Evening Peak Hour!** Expect ${delay}x normal time. Metro is fastest.`;
  }

  if (day === 5) {
    response += isBn
      ? `\n\n🕌 **শুক্রবার:** মেট্রো বন্ধ। শুধু বাস সার্ভিস চলছে।`
      : `\n\n🕌 **Friday:** Metro closed. Only bus services available.`;
  }

  return response;
}

// ── Bus type info ────────────────────────────────────────────────────────────

export function addBusTypeInfo(busType: string, isBn: boolean): string {
  const typeInfo = BUS_TYPES[busType as keyof typeof BUS_TYPES];
  if (!typeInfo) return '';
  return isBn
    ? `\n**ধরন:** ${typeInfo.bnName}\n**সুবিধা:** ${typeInfo.features.join(', ')}\n**ভাড়া রেঞ্জ:** ৳${typeInfo.avgFare}`
    : `\n**Type:** ${typeInfo.fullName}\n**Features:** ${typeInfo.features.join(', ')}\n**Fare Range:** ৳${typeInfo.avgFare}`;
}

// ── Seasonal advice ──────────────────────────────────────────────────────────

export function addSeasonalAdvice(_destination: string, isBn: boolean): string {
  const month = new Date().getMonth();
  let season: keyof typeof SEASONAL_INFO = 'winter';
  if (month >= 5 && month <= 8) season = 'monsoon';
  else if (month >= 3 && month <= 9) season = 'summer';

  const info = SEASONAL_INFO[season];
  const tips = info.considerations.slice(0, 3).join('\n- ');
  return isBn
    ? `\n\n🌍 **মৌসুমিক পরামর্শ:**\n- ${tips}`
    : `\n\n🌍 **Seasonal Advice:**\n- ${tips}`;
}

// ── Travel tips ──────────────────────────────────────────────────────────────

export function addTravelTips(query: string, isBn: boolean): string {
  const isIntercity = query.toLowerCase().match(/(cox|sylhet|chittagong|চট্টগ্রাম|সিলেট|কক্স)/);
  const tips = isIntercity
    ? TRAVEL_TIPS.intercity[isBn ? 'bn' : 'en']
    : TRAVEL_TIPS.general[isBn ? 'bn' : 'en'];

  const randomTips = [...tips].sort(() => 0.5 - Math.random()).slice(0, 3);
  return isBn
    ? `\n\n💡 **ট্রাভেল টিপস:**\n- ${randomTips.join('\n- ')}`
    : `\n\n💡 **Travel Tips:**\n- ${randomTips.join('\n- ')}`;
}

// ── Emergency info ───────────────────────────────────────────────────────────

export function buildEmergencyResponse(isBn: boolean): string {
  return isBn
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
}

// ── Enhanced askGeminiRoute wrapper ─────────────────────────────────────────

export const askGeminiRouteEnhanced = async (
  userQuery: string,
  userApiKey?: string,
  chatHistory: ChatMessage[] = []
): Promise<string> => {
  const query = userQuery.trim();
  const lowerQuery = query.toLowerCase();
  const isBn = /[\u0980-\u09FF]/.test(query);

  // Check for emergency queries first
  if (
    lowerQuery.includes('emergency') || lowerQuery.includes('help') ||
    lowerQuery.includes('hospital') || lowerQuery.includes('জরুরি')
  ) {
    return buildEmergencyResponse(isBn);
  }

  // Check FAQ database
  const faqChecks: Record<string, boolean> = {
    'metro timing': lowerQuery.includes('metro') && (lowerQuery.includes('time') || lowerQuery.includes('timing') || lowerQuery.includes('সময়')),
    'bus fare': (lowerQuery.includes('fare') || lowerQuery.includes('ভাড়া')) && !lowerQuery.includes('metro'),
    'best time to travel': lowerQuery.includes('best time') || lowerQuery.includes('peak') || lowerQuery.includes('সেরা সময়'),
  };

  for (const [key, condition] of Object.entries(faqChecks)) {
    if (condition && FAQ_DATABASE[key]) {
      const faqResponse = FAQ_DATABASE[key][isBn ? 'bn' : 'en'];
      return await enhanceResponseWithOnlineData(faqResponse, query, isBn ? 'bn' : 'en');
    }
  }

  // Delegate to main service
  let finalResponse = await _askGeminiRoute(userQuery, userApiKey, chatHistory);

  // Enrich with traffic context
  finalResponse = addTrafficContext(finalResponse, isBn);

  // Add travel tips occasionally
  if (Math.random() < 0.33) {
    finalResponse += addTravelTips(query, isBn);
  }

  // Enhance with online data
  if (navigator.onLine) {
    try {
      finalResponse = await enhanceResponseWithOnlineData(finalResponse, query, isBn ? 'bn' : 'en');
    } catch {
      // Silent fallback
    }
  }

  learningSystem.logQuery(query, true);
  return finalResponse;
};

export default {
  addTrafficContext,
  addBusTypeInfo,
  addSeasonalAdvice,
  addTravelTips,
  buildEmergencyResponse,
};
