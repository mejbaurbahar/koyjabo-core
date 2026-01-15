import { BUS_DATA, METRO_STATIONS, STATIONS } from '../constants';
import { getOfflineIntercityData } from '../intercity/offlineService';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

// Major locations for intent detection
const MAJOR_LOCATIONS = [
  "Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh",
  "Cox's Bazar", "Cumilla", "Feni", "Bogura", "Jashore", "Benapole", "Kushtia", "Satkhira",
  "Dinajpur", "Pabna", "Faridpur", "Noakhali", "Chandpur", "Brahmanbaria", "Natore",
  "Tangail", "Sirajganj", "Naogaon", "Chapainawabganj", "Gazipur", "Narayanganj",
  "Narsingdi", "Bandarban", "Rangamati", "Khagrachari", "Panchagarh", "Thakurgaon"
];

// --- HELPER FUNCTIONS ---

// Normalize text for search
const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

const findBusRoute = (start: string, end: string): string => {
  const s = normalize(start);
  const e = normalize(end);

  const foundBuses = BUS_DATA.filter(bus => {
    const stops = bus.stops.map(st => normalize(st));
    const startIdx = stops.findIndex(stop => stop.includes(s) || s.includes(stop));
    const endIdx = stops.findIndex(stop => stop.includes(e) || e.includes(stop));
    return startIdx !== -1 && endIdx !== -1;
  });

  if (foundBuses.length === 0) return "";

  const busNames = foundBuses.map(b => b.name).slice(0, 3).join(", ");
  return `🚌 **Bus Route:** You can take **${busNames}** to go from ${start} to ${end}.`;
};

const findMetroRoute = (query: string): string => {
  const lowerQuery = normalize(query);
  const stations = Object.values(METRO_STATIONS || {}) as any[]; // Assuming structure

  // If constants.ts structure is different, we fallback to hardcoded list for safety
  const MRT_STATIONS = [
    "Uttara North", "Uttara Center", "Uttara South", "Pallabi", "Mirpur 11", "Mirpur 10",
    "Kazipara", "Shewrapara", "Agargaon", "Bijoy Sarani", "Farmgate", "Karwan Bazar",
    "Shahbag", "Dhaka University", "Secretariat", "Motijheel"
  ];

  const foundStations = MRT_STATIONS.filter(st => lowerQuery.includes(normalize(st)));

  if (foundStations.length >= 2) {
    const s1 = foundStations[0];
    const s2 = foundStations[1];
    return `🚇 **Metro Rail:** Yes, you can travel between **${s1}** and **${s2}** using MRT Line 6. Timing: 7:10 AM - 8:40 PM (Friday Closed).`;
  }

  return `🚇 **Metro Rail (MRT Line 6):** Runs from Uttara North to Motijheel.\n\n**Stations:** ${MRT_STATIONS.join(", ")}.\n**Timing:** 7:10 AM - 8:40 PM.`;
};

const findIntercityRoute = (query: string): string => {
  const lowerQuery = normalize(query);

  // Find mention of districts
  // We sort by length desc to match "Cox's Bazar" before "Cox" if needed, though normalize handles it
  const foundDistricts = MAJOR_LOCATIONS.filter(d => lowerQuery.includes(normalize(d)));

  // Remove duplicates (e.g. if query has "Dhaka to Dhaka")
  const uniqueDistricts = [...new Set(foundDistricts)];

  if (uniqueDistricts.length >= 2) {
    const from = uniqueDistricts[0];
    const to = uniqueDistricts[1];

    // Delegate to the robust Intercity Service
    const routeData = getOfflineIntercityData(from, to, 'en');
    return routeData.result;
  }

  // General Intercity Info
  if (lowerQuery.includes("train") || lowerQuery.includes("intercity") || lowerQuery.includes("flight") || lowerQuery.includes("plane")) {
    return "🚂 **Intercity Info:** I can help you with **Train**, **Bus**, **Flight**, and **Launch** routes for all 64 districts! Just tell me where you want to go (e.g., 'Dhaka to Barishal' or 'Flight to Cox's Bazar').";
  }

  return "";
};

const findLocalBusInfo = (query: string): string => {
  const lowerQuery = normalize(query);
  // Search for a specific bus name
  const bus = BUS_DATA.find(b => lowerQuery.includes(normalize(b.name)));
  if (bus) {
    return `🚌 **${bus.name}**: Route is ${bus.routeString}.\n**Stops:** ${bus.stops.join(', ')}.`;
  }
  return "";
}

// --- MAIN AI LOGIC ---

export const askGeminiRoute = async (userQuery: string, _userApiKey?: string, chatHistory: ChatMessage[] = []): Promise<string> => {

  // Separate actual query from context if present
  const [actualQueryPart] = userQuery.split('[Context:');
  const query = actualQueryPart.trim();
  const lowerQuery = normalize(query);
  let responseParts: string[] = [];

  // 0. Greeting / General
  if (lowerQuery.match(/^(hi|hello|hey|salam|help)/)) {
    return "👋 Hello! I am your Offline Transport Assistant. I can help you with:\n- 🚌 **Local Bus Routes** (e.g., 'Bus from Farmgate to Mirpur')\n- 🚇 **Metro Rail Info** (e.g., 'Metro from Uttara to Motijheel')\n- 🚂 **Intercity (Bus/Train/Air/Launch)** (e.g., 'Dhaka to Barishal')\n\nHow can I help you today?";
  }

  // 1. Check for specific Bus Route (A to B)
  if (lowerQuery.includes(" to ") || lowerQuery.includes(" from ")) {
    // Extract potential locations?
    // Since we don't have NLP, we iterate known stations
    const stationNames = Object.values(STATIONS).map(s => s.name);
    const foundStations = stationNames.filter(name => lowerQuery.includes(normalize(name)));

    if (foundStations.length >= 2) {
      const busRes = findBusRoute(foundStations[0], foundStations[1]);
      if (busRes) responseParts.push(busRes);
    }
  }

  // 2. Check Metro
  if (lowerQuery.includes("metro") || lowerQuery.includes("mrt") || lowerQuery.includes("rail")) {
    const metroRes = findMetroRoute(query);
    if (metroRes) responseParts.push(metroRes);
  }

  // 3. Check Specific Bus Details
  const busInfo = findLocalBusInfo(query);
  if (busInfo) responseParts.push(busInfo);

  // 4. Check Intercity
  // Check against our comprehensive list
  const isIntercityQuery = MAJOR_LOCATIONS.some(loc => lowerQuery.includes(normalize(loc))) ||
    lowerQuery.includes("train") ||
    lowerQuery.includes("flight") ||
    lowerQuery.includes("air") ||
    lowerQuery.includes("launch") ||
    lowerQuery.includes("intercity");

  if (isIntercityQuery) {
    const intercityRes = findIntercityRoute(query);
    if (intercityRes) responseParts.push(intercityRes);
  }

  // Fallback if no specific match but query exists
  if (responseParts.length === 0) {
    // Try to find ANY station mentioned
    const stationNames = Object.values(STATIONS).map(s => s.name);
    const mentionedStations = stationNames.filter(name => lowerQuery.includes(normalize(name)));

    if (mentionedStations.length > 0) {
      // Logic to detect "How to go" intent
      const isNavIntent = lowerQuery.match(/(jabo|kivabe|jawa|go to|reach|direction|jite|kemne|route)/);
      const targetStation = mentionedStations[0];

      responseParts.push(`📍 **Locations Found:** I see you mentioned **${targetStation}**.`);

      if (isNavIntent) {
        // Assume user wants to GO TO this station
        const busesToTarget = BUS_DATA.filter(b => b.stops.some(s => normalize(s).includes(normalize(targetStation))));

        if (busesToTarget.length > 0) {
          responseParts.push(`🚌 **To reach ${targetStation}:**\nYou can take these buses from various locations:\n`);

          // Show distinct routes (max 5)
          busesToTarget.slice(0, 5).forEach(bus => {
            const start = bus.stops[0];
            const end = bus.stops[bus.stops.length - 1];
            responseParts.push(`- **${bus.name}**: Runs between ${bus.routeString}`);
          });

          responseParts.push(`\n❓ **Tip:** To get a specific route, tell me your starting point! (e.g. "From Mirpur to ${targetStation}")`);
        } else {
          responseParts.push(`⚠️ I know where **${targetStation}** is, but I can't find direct local buses in my current database. Try finding a connection via a major hub like Farmgate or Mohakhali.`);
        }

      } else {
        // Original logic: Just list buses passing
        const busPassEx = BUS_DATA.filter(b => b.stops.some(s => normalize(s).includes(normalize(targetStation)))).slice(0, 3).map(b => b.name);
        if (busPassEx.length > 0) {
          responseParts.push(`🚌 **Buses passing here:** ${busPassEx.join(", ")}...`);
        }
      }
    } else {
      return "🤔 I couldn't understand that location. Please try mentioning specific stations like 'Farmgate', 'Mirpur', 'Gulshan' or district names for intercity travel.";
    }
  }

  return responseParts.join("\n\n");
};

// Keeping these for compatibility but making them no-ops or always true
export const canUseAiChat = () => true;
export const trackAiChatUsage = () => { };
