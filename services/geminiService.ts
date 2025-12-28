import { BUS_DATA, METRO_STATIONS, STATIONS } from '../constants';
import { canUseAiChat, trackAiChatUsage } from './apiKeyManager';

// Backend API Configuration
const BACKEND_API_URL = 'https://koyjabo-backend.onrender.com';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

// Helper to construct knowledge base from local constants
const constructKnowledgeBase = (): string => {
  let context = "IMPORTANT SYSTEM CONTEXT: You are KoyJabo AI. Use the following REAL-TIME DHAKA TRANSPORT DATA to answer the user's question. Do not hallucinate routes. Only use the buses/metro listed below.\n\n";

  // Add Metro Rail Data
  context += "--- METRO RAIL (MRT LINE 6) ---\n";
  context += "Route: Uttara North to Motijheel.\n";
  context += "Stations: Uttara North, Uttara Center, Uttara South, Pallabi, Mirpur 11, Mirpur 10, Kazipara, Shewrapara, Agargaon, Bijoy Sarani, Farmgate, Karwan Bazar, Shahbag, Dhaka University, Secretariat, Motijheel.\n";
  context += "Timing: 7:10 AM - 8:40 PM (Friday closed currently or check updates).\n\n";

  // Add Bus Data (Summarized to save tokens)
  context += "--- DHAKA LOCAL BUSES ---\n";
  const busSummaries = BUS_DATA.map(bus => {
    // Resolve stop IDs to full English names
    const resolvedStops = bus.stops.map(stopId => {
      const station = STATIONS[stopId];
      return station ? station.name : stopId;
    }).join(', ');

    return `- ${bus.name} (${bus.type}): ${bus.routeString}. Stops: ${resolvedStops}`;
  }).join('\n');
  context += busSummaries;

  context += "\n\nEnd of Transport Data. Now answer the USER QUESTION based on this data.\n";
  return context;
};

export const askGeminiRoute = async (userQuery: string, _userApiKey?: string, chatHistory: ChatMessage[] = []): Promise<string> => {
  // Note: userApiKey parameter is now ignored since we use backend API

  // Check usage limit before making API call
  if (!canUseAiChat()) {
    return "ERROR_DAILY_LIMIT";
  }

  try {
    // Prepare Chat History Context (keep it minimal - only last 2 messages)
    const historyContext = chatHistory.length > 0
      ? chatHistory.slice(-2).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
      : '';

    // ✅ SHORT SYSTEM INSTRUCTION (instead of entire knowledge base)
    // The AI already knows about Dhaka transport from its training data!
    const systemInstruction = `You are a helpful Dhaka transport expert. Answer questions about:
- Dhaka Metro Rail (MRT Line 6): Uttara North to Motijheel
- Local buses and their routes
- Best ways to travel between locations in Dhaka
- Provide accurate, practical information
- Respond in the same language as the question (Bengali or English)`;

    // Build the prompt with only user question + minimal history
    const userPrompt = historyContext
      ? `${historyContext}\n\nCurrent question: ${userQuery}`
      : userQuery;

    console.log('📡 Calling Backend AI Chat API...');
    console.log(`📊 Estimated prompt size: ~${userPrompt.length} characters`);

    // Create abort controller for timeout (120 seconds for 8 retries with exponential backoff)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          systemInstruction: systemInstruction
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle 400 Bad Request (Prompt Too Large)
      if (response.status === 400) {
        try {
          const errorData = await response.json();
          if (errorData.error === 'Prompt Too Large') {
            return `⚠️ Message Too Long\n\n${errorData.message}\n\nTip: Try asking a simpler, shorter question.`;
          }
          return `⚠️ ${errorData.message || 'Invalid request. Please try rephrasing your question.'}`;
        } catch {
          return "⚠️ Invalid request. Please try rephrasing your question.";
        }
      }

      // Handle rate limiting (backend)
      if (response.status === 429) {
        return "ERROR_DAILY_LIMIT";
      }

      // Handle payload too large
      if (response.status === 413) {
        return "⚠️ Your message is too long. Please try a shorter question.";
      }

      // Handle server errors
      if (response.status === 500) {
        return "⚠️ Service Temporarily Unavailable\n\nOur AI service is experiencing issues. Please try again in a few minutes.";
      }

      // Handle service overload - backend tried 8 times but still failed
      if (response.status === 503) {
        try {
          const errorData = await response.json();
          const retryAfter = errorData.retryAfter || 30;

          return `🔄 Service Overloaded\n\nThe AI service is experiencing very high demand right now. Our system tried 8 times with smart delays but couldn't complete your request.\n\n⏱️ Please wait ${retryAfter} seconds and try again.\n\nTip: Early morning (2-6 AM) usually has better availability.`;
        } catch {
          return "🔄 Service Overloaded\n\nThe AI service is experiencing very high demand right now. Please wait 30-60 seconds and try again.";
        }
      }

      // Handle 403 Forbidden (Origin/IP Blocking)
      if (response.status === 403) {
        return "🌐 Service Access Restricted\n\nThe server is currently restricting access from your location or browser. Our team is working on resolving this server-side configuration issue. Please try again later.";
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.result || "Sorry, I couldn't process that request.";

      // Track usage after successful response
      trackAiChatUsage();

      console.log('✅ API response received');
      return text;

    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (fetchError.name === 'AbortError') {
        return "⏱️ Request Timeout\n\nThe request took more than 2 minutes to complete. The AI service is likely experiencing extreme load right now.\n\nPlease try again later, preferably during off-peak hours (2-6 AM).";
      }

      // Silence expected 403 errors in console
      if (fetchError.message?.includes('403')) {
        return "🌐 Service Access Restricted\n\nThe server is currently restricting access. Please try again later.";
      }

      throw fetchError;
    }

  } catch (error: any) {
    if (import.meta.env.DEV && !error.message?.includes('403')) {
      console.error("❌ API Error:", error);
    }

    const errorMsg = error.message || 'Unknown error';

    // Network errors
    if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('Failed to fetch')) {
      return "🌐 Connection Error\n\nCouldn't reach the server. Please check your internet connection and try again.";
    }

    return "⚠️ Something went wrong. Please try again in a moment.";
  }
};
