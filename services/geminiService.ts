import { BUS_DATA, METRO_STATIONS, STATIONS } from '../constants';

// --- OFFLINE DATASETS (Copied/Adapted for standalone service) ---

const TRAIN_ROUTES = [
  { from: "Dhaka", to: "Chattogram", trains: ["Subarna Express", "Sonar Bangla Express", "Turna Express", "Mohanagar Goduli"] },
  { from: "Dhaka", to: "Sylhet", trains: ["Upaban Express", "Jayantika Express", "Kalni Express", "Parabat Express"] },
  { from: "Dhaka", to: "Cox's Bazar", trains: ["Cox's Bazar Express", "Parjatak Express"] },
  { from: "Dhaka", to: "Rajshahi", trains: ["Silk City", "Padma Express", "Dhumketu Express"] },
  { from: "Dhaka", to: "Khulna", trains: ["Sundarban Express", "Chitra Express"] },
  { from: "Dhaka", to: "Mymensingh", trains: ["Tista Express", "Agnibina Express"] },
  { from: "Dhaka", to: "Barishal", trains: ["No Direct Train (Use Launch/Bus)"] },
];

const MAJOR_LOCATIONS = [
  "Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Cox's Bazar", "Cumilla", "Feni", "Bogura", "Jashore"
];

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

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
  const foundDistricts = MAJOR_LOCATIONS.filter(d => lowerQuery.includes(normalize(d)));

  if (foundDistricts.length >= 2) {
    const from = foundDistricts[0]; // Naive assumptions on direction
    const to = foundDistricts[1];

    // Check Train
    const train = TRAIN_ROUTES.find(r =>
      (normalize(r.from) === normalize(from) && normalize(r.to) === normalize(to)) ||
      (normalize(r.from) === normalize(to) && normalize(r.to) === normalize(from))
    );

    if (train) {
      return `🚂 **Intercity Train:** To travel between **${from}** and **${to}**, available trains are: ${train.trains.join(", ")}.`;
    }

    return `🚌 **Intercity:** For **${from}** to **${to}**, direct trains may not be available. Please check Bus options from major terminals (Gabtoli/Sayedabad).`;
  }

  // General Intercity Info
  if (lowerQuery.includes("train") || lowerQuery.includes("intercity")) {
    return "🚂 **Intercity Info:** I can help you with train routes for major districts like Dhaka, Chattogram, Sylhet, Cox's Bazar, etc. Just mention the city names!";
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

  const query = userQuery.trim();
  const lowerQuery = normalize(query);
  let responseParts: string[] = [];

  // 0. Greeting / General
  if (lowerQuery.match(/^(hi|hello|hey|salam|help)/)) {
    return "👋 Hello! I am your Offline Transport Assistant. I can help you with:\n- 🚌 **Local Bus Routes** (e.g., 'Bus from Farmgate to Mirpur')\n- 🚇 **Metro Rail Info** (e.g., 'Metro from Uttara to Motijheel')\n- 🚂 **Intercity Trains** (e.g., 'Train to Sylhet')\n\nHow can I help you today?";
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
  if (lowerQuery.includes("chattogram") || lowerQuery.includes("sylhet") || lowerQuery.includes("cox") || lowerQuery.includes("khulna") || lowerQuery.includes("train")) {
    const intercityRes = findIntercityRoute(query);
    if (intercityRes) responseParts.push(intercityRes);
  }

  // Fallback if no specific match but query exists
  if (responseParts.length === 0) {
    // Try to find ANY station mentioned
    const stationNames = Object.values(STATIONS).map(s => s.name);
    const mentionedStations = stationNames.filter(name => lowerQuery.includes(normalize(name)));

    if (mentionedStations.length > 0) {
      responseParts.push(`📍 **Locations Found:** I see you mentioned **${mentionedStations.join(", ")}**.`);

      // Find buses for this single station
      const busPassEx = BUS_DATA.filter(b => b.stops.some(s => normalize(s).includes(normalize(mentionedStations[0])))).slice(0, 3).map(b => b.name);
      if (busPassEx.length > 0) {
        responseParts.push(`🚌 **Buses passing here:** ${busPassEx.join(", ")}...`);
      }
    } else {
      return "🤔 I couldn't understand that location. Please try mentioning specific stations like 'Farmgate', 'Mirpur', 'Gulshan' or district names.";
    }
  }

  return responseParts.join("\n\n");
};

// Keeping these for compatibility but making them no-ops or always true
export const canUseAiChat = () => true;
export const trackAiChatUsage = () => { };
