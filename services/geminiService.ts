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

const MAJOR_LOCATIONS_BN: Record<string, string> = {
  "Dhaka": "ঢাকা", "Chattogram": "চট্টগ্রাম", "Sylhet": "সিলেট", "Rajshahi": "রাজশাহী",
  "Khulna": "খুলনা", "Barishal": "বরিশাল", "Rangpur": "রংপুর", "Mymensingh": "ময়মনসিংহ",
  "Cox's Bazar": "কক্সবাজার", "Cumilla": "কুমিল্লা", "Feni": "ফেনী", "Bogura": "বগুড়া",
  "Jashore": "যশোর", "Benapole": "বেনাপোল", "Kushtia": "কুষ্টিয়া", "Satkhira": "সাতক্ষীরা",
  "Dinajpur": "দিনাজপুর", "Pabna": "পাবনা", "Faridpur": "ফরিদপুর", "Noakhali": "নোয়াখালী",
  "Chandpur": "চাঁদপুর", "Brahmanbaria": "ব্রাহ্মণবাড়িয়া", "Natore": "নাটোর",
  "Tangail": "টাঙ্গাইল", "Sirajganj": "সিরাজগঞ্জ", "Naogaon": "নওগাঁ",
  "Chapainawabganj": "চাঁপাইনবাবগঞ্জ", "Gazipur": "গাজীপুর", "Narayanganj": "নারায়ণগঞ্জ",
  "Narsingdi": "নরসিংদী", "Bandarban": "বান্দরবান", "Rangamati": "রাঙ্গামাটি",
  "Khagrachari": "খাগড়াছড়ি", "Panchagarh": "পঞ্চগড়", "Thakurgaon": "ঠাকুরগাঁও"
};

const TRAIN_ROUTES = [
  { from: "Dhaka", to: "Chattogram", trains: ["Subarna Express", "Sonar Bangla Express", "Turna Express", "Mohanagar Goduli", "Chattala Express"] },
  { from: "Dhaka", to: "Sylhet", trains: ["Upaban Express", "Jayantika Express", "Kalni Express", "Parabat Express", "Surma Mail"] },
  { from: "Dhaka", to: "Cox's Bazar", trains: ["Cox's Bazar Express", "Parjatak Express"] },
  { from: "Dhaka", to: "Rajshahi", trains: ["Silk City", "Padma Express", "Dhumketu Express", "Banalata Express"] },
  { from: "Dhaka", to: "Khulna", trains: ["Sundarban Express", "Chitra Express"] },
  { from: "Dhaka", to: "Mymensingh", trains: ["Tista Express", "Agnibina Express", "Brahmaputra Express", "Jamuna Express"] },
  { from: "Dhaka", to: "Barishal", trains: ["No Direct Train (Use Launch/Bus)"] },
  { from: "Dhaka", to: "Benapole", trains: ["Benapole Express", "Rupashi Bangla Express"] },
  { from: "Benapole", to: "Mongla", trains: ["Mongla Commuter"] },
  { from: "Dhaka", to: "Noakhali", trains: ["Upakul Express", "Noakhali Express"] },
  { from: "Dhaka", to: "Chilahati", trains: ["Nilsagar Express", "Chilahati Express"] },
  { from: "Dhaka", to: "Panchagarh", trains: ["Ekota Express", "Drutojan Express", "Panchagarh Express"] },
  { from: "Dhaka", to: "Rangpur", trains: ["Rangpur Express", "Kurigram Express"] },
];

// --- HELPER FUNCTIONS ---

// Normalize text for search
const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s\u0980-\u09FF]/g, '').trim();

const findBusRoute = (start: string, end: string): string => {
  const s = normalize(start);
  const e = normalize(end);

  const foundBuses = BUS_DATA.filter(bus => {
    const stops = bus.stops.map(st => {
      const station = STATIONS[st];
      return {
        en: normalize(station?.name || st),
        bn: normalize(station?.bnName || '')
      };
    });

    const startIdx = stops.findIndex(stop =>
      stop.en.includes(s) || s.includes(stop.en) ||
      (stop.bn && (stop.bn.includes(s) || s.includes(stop.bn)))
    );
    const endIdx = stops.findIndex(stop =>
      stop.en.includes(e) || e.includes(stop.en) ||
      (stop.bn && (stop.bn.includes(e) || e.includes(stop.bn)))
    );
    return startIdx !== -1 && endIdx !== -1;
  });

  if (foundBuses.length === 0) return "";

  const busNames = foundBuses.map(b => b.name).slice(0, 3).join(", ");
  return `🚌 **Bus Route:** You can take **${busNames}** to go from ${start} to ${end}.`;
};

const findMetroRoute = (query: string, isBn: boolean): string => {
  const lowerQuery = normalize(query);
  const stations = Object.values(METRO_STATIONS || {}) as any[]; // Assuming structure

  // If constants.ts structure is different, we fallback to hardcoded list for safety
  const MRT_STATIONS = [
    { en: "Uttara North", bn: "উত্তরা উত্তর" }, { en: "Uttara Center", bn: "উত্তরা সেন্টার" },
    { en: "Uttara South", bn: "উত্তরা দক্ষিণ" }, { en: "Pallabi", bn: "পল্লবী" },
    { en: "Mirpur 11", bn: "মিরপুর ১১" }, { en: "Mirpur 10", bn: "মিরপুর ১০" },
    { en: "Kazipara", bn: "কাজীপাড়া" }, { en: "Shewrapara", bn: "শেওড়াপাড়া" },
    { en: "Agargaon", bn: "আগারগাঁও" }, { en: "Bijoy Sarani", bn: "বিজয় সরণি" },
    { en: "Farmgate", bn: "ফার্মগেট" }, { en: "Karwan Bazar", bn: "কাওরান বাজার" },
    { en: "Shahbag", bn: "শাহবাগ" }, { en: "Dhaka University", bn: "ঢাকা বিশ্ববিদ্যালয়" },
    { en: "Secretariat", bn: "সচিবালয়" }, { en: "Motijheel", bn: "মতিঝিল" }
  ];

  const foundStations = MRT_STATIONS.filter(st =>
    lowerQuery.includes(normalize(st.en)) || lowerQuery.includes(normalize(st.bn))
  );

  if (foundStations.length >= 2) {
    const s1 = isBn ? foundStations[0].bn : foundStations[0].en;
    const s2 = isBn ? foundStations[1].bn : foundStations[1].en;
    return isBn
      ? `🚇 **মেট্রোরেল:** হ্যাঁ, আপনি MRT Line 6 ব্যবহার করে **${s1}** এবং **${s2}** এর মধ্যে যাতায়াত করতে পারেন। সময়: সকাল ৭:১০ - রাত ৮:৪০ (শুক্রবার বন্ধ)।`
      : `🚇 **Metro Rail:** Yes, you can travel between **${s1}** and **${s2}** using MRT Line 6. Timing: 7:10 AM - 8:40 PM (Friday Closed).`;
  }

  const stationList = isBn ? MRT_STATIONS.map(s => s.bn).join(", ") : MRT_STATIONS.map(s => s.en).join(", ");
  return isBn
    ? `🚇 **মেট্রোরেল (MRT Line 6):** উত্তরা উত্তর থেকে মতিঝিল পর্যন্ত চলাচল করে।\n\n**স্টেশনসমূহ:** ${stationList}.\n**সময়:** সকাল ৭:১০ - রাত ৮:৪০।`
    : `🚇 **Metro Rail (MRT Line 6):** Runs from Uttara North to Motijheel.\n\n**Stations:** ${stationList}.\n**Timing:** 7:10 AM - 8:40 PM.`;
};

const findIntercityRoute = (query: string): string => {
  const lowerQuery = normalize(query);
  const isBn = /[\u0980-\u09FF]/.test(query);

  const foundDistricts = MAJOR_LOCATIONS.filter(d => {
    const enMatch = lowerQuery.includes(normalize(d));
    const bnMatch = MAJOR_LOCATIONS_BN[d] && lowerQuery.includes(normalize(MAJOR_LOCATIONS_BN[d]));
    return enMatch || bnMatch;
  });

  const uniqueDistricts = [...new Set(foundDistricts)];

  if (uniqueDistricts.length >= 2) {
    const from = uniqueDistricts[0];
    const to = uniqueDistricts[1];

    const routeData = getOfflineIntercityData(from, to, isBn ? 'bn' : 'en');
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

  // Special Detection: Dhaka International Trade Fair (DITF) / Banijyo Mela
  const isTradeFairQuery = lowerQuery.includes("trade fair") ||
    lowerQuery.includes("ditf") ||
    lowerQuery.includes("banijyo mela") ||
    lowerQuery.includes("purbachal fair") ||
    lowerQuery.includes("mela jabo") ||
    lowerQuery.includes("mela fare") ||
    lowerQuery.includes("বাণিজ্য মেলা") ||
    lowerQuery.includes("বাণিজ্যমেলা") ||
    lowerQuery.includes("ট্রেড ফেয়ার");

  if (isTradeFairQuery) {
    return `🎡 **ঢাকা আন্তর্জাতিক বাণিজ্য মেলা যাবেন? কই যাবো থাকলেই চিন্তা নাই!** 🎡\n\n` +
      `পূর্বাচলের **বাংলাদেশ-চায়না ফ্রেন্ডশিপ এক্সিবিশন সেন্টারে** যেতে এখন সহজ যাতায়াত।\n` +
      `কই যাবো অ্যাপে দেখুন সব শাটল বাস রুট, ভাড়া আর সময় এক ক্লিকেই 👇\n\n` +
      `**🚌 ডেডিকেটেড শাটল বাস রুটসমূহ:**\n` +
      `- **কুড়িল বিশ্বরোড → মেলা প্রাঙ্গণ**: ভাড়া ৪০ টাকা\n` +
      `- **ফার্মগেট (খামারবাড়ি/পুরনো বিমানবন্দর) → মেলা**: ভাড়া ৭০ টাকা\n` +
      `- **চাষাড়া (নারায়ণগঞ্জ) → মেলা**: ভাড়া ১২০ টাকা\n` +
      `- **মুক্তারপুর → মেলা**: ভাড়া ১৩০ টাকা\n` +
      `- **নরসিংদী → মেলা**: ভাড়া ১০০ টাকা\n` +
      `- **গাজীপুর (শিববাড়ী) → মেলা**: ভাড়া ৭৫ টাকা\n` +
      `- **মেলা প্রাঙ্গণ → সাইনবোর্ড**: ভাড়া ১০০ টাকা\n\n` +
      `**🕗 সময়:** সকাল ৮টা থেকে | শেষ ট্রিপ রাত ১১টা পর্যন্ত।\n\n` +
      `🎟️ **টিকিট মূল্য:** বড় ৫০ টাকা, ছোট ২৫ টাকা (৫ বছরের কম ফ্রি)।`;
  }

  // 0. Greeting / General
  if (lowerQuery.match(/^(hi|hello|hey|salam|help)/)) {
    return "👋 Hello! I am your Offline Transport Assistant. I can help you with:\n- 🚌 **Local Bus Routes** (e.g., 'Bus from Farmgate to Mirpur')\n- 🚇 **Metro Rail Info** (e.g., 'Metro from Uttara to Motijheel')\n- 🚂 **Intercity (Bus/Train/Air/Launch)** (e.g., 'Dhaka to Barishal')\n\nHow can I help you today?";
  }

  // 1. Check for specific Bus Route (A to B)
  if (lowerQuery.includes(" to ") || lowerQuery.includes(" from ")) {
    // Extract potential locations?
    // Since we don't have NLP, we iterate known stations
    const mentionedStations = Object.values(STATIONS).filter(s =>
      lowerQuery.includes(normalize(s.name)) || (s.bnName && lowerQuery.includes(normalize(s.bnName)))
    );

    if (mentionedStations.length >= 2) {
      const busRes = findBusRoute(mentionedStations[0].name, mentionedStations[1].name);
      if (busRes) responseParts.push(busRes);
    }
  }

  // 2. Check Metro
  if (lowerQuery.includes("metro") || lowerQuery.includes("mrt") || lowerQuery.includes("rail") || lowerQuery.includes("মেট্রো")) {
    const isBnUser = /[\u0980-\u09FF]/.test(query);
    const metroRes = findMetroRoute(query, isBnUser);
    if (metroRes) responseParts.push(metroRes);
  }

  // 3. Check Specific Bus Details
  const busInfo = findLocalBusInfo(query);
  if (busInfo) responseParts.push(busInfo);

  // 4. Check Intercity
  // Check against our comprehensive list
  const isIntercityQuery = MAJOR_LOCATIONS.some(loc => {
    const enMatch = lowerQuery.includes(normalize(loc));
    const bnMatch = MAJOR_LOCATIONS_BN[loc] && lowerQuery.includes(normalize(MAJOR_LOCATIONS_BN[loc]));
    return enMatch || bnMatch;
  }) ||
    lowerQuery.includes("train") ||
    lowerQuery.includes("flight") ||
    lowerQuery.includes("air") ||
    lowerQuery.includes("launch") ||
    lowerQuery.includes("intercity") ||
    lowerQuery.includes("ট্রেন") ||
    lowerQuery.includes("বিমান") ||
    lowerQuery.includes("লঞ্চ") ||
    lowerQuery.includes("বাস");

  if (isIntercityQuery) {
    const intercityRes = findIntercityRoute(query);
    if (intercityRes) responseParts.push(intercityRes);
  }

  // Fallback if no specific match but query exists
  if (responseParts.length === 0) {
    // Try to find ANY station mentioned
    const mentionedStations = Object.values(STATIONS).filter(s =>
      lowerQuery.includes(normalize(s.name)) || (s.bnName && lowerQuery.includes(normalize(s.bnName)))
    );

    if (mentionedStations.length > 0) {
      // Logic to detect "How to go" intent
      const isNavIntent = lowerQuery.match(/(jabo|kivabe|jawa|go to|reach|direction|jite|kemne|route|যাব|কিভাবে|জাব|কেমনে|path|পথ)/);
      const targetStation = mentionedStations[0];
      const isBn = /[\u0980-\u09FF]/.test(query);

      const displayName = isBn && targetStation.bnName ? targetStation.bnName : targetStation.name;
      responseParts.push(isBn ? `📍 **লোকেশন পাওয়া গেছে:** আপনি **${displayName}** এর কথা বলছেন।` : `📍 **Locations Found:** I see you mentioned **${displayName}**.`);

      if (isNavIntent) {
        // Assume user wants to GO TO this station
        const busesToTarget = BUS_DATA.filter(b => b.stops.some(s => s === targetStation.id || s === targetStation.name.toLowerCase()));

        if (busesToTarget.length > 0) {
          responseParts.push(isBn ? `🚌 **${displayName} পৌঁছাতে:**\nআপনি এই বাসগুলো ব্যবহার করতে পারেন:\n` : `🚌 **To reach ${displayName}:**\nYou can take these buses from various locations:\n`);

          // Show distinct routes (max 5)
          busesToTarget.slice(0, 5).forEach(bus => {
            const busDisplayName = isBn && bus.bnName ? bus.bnName : bus.name;
            responseParts.push(`- **${busDisplayName}**: ${bus.routeString}`);
          });

          responseParts.push(isBn ? `\n❓ **টিপ:** নির্দিষ্ট রুটের জন্য আপনার শুরুর স্থান বলুন! (যেমন: "মিরপুর থেকে ${displayName}")` : `\n❓ **Tip:** To get a specific route, tell me your starting point! (e.g. "From Mirpur to ${displayName}")`);
        } else {
          responseParts.push(isBn
            ? `⚠️ আমি জানি **${displayName}** কোথায়, কিন্তু আমার কাছে এই মূহূর্তে সরাসরি লোকাল বাসের তথ্য নেই। ফার্মগেট বা মহাখালীর মতো বড় হাব হয়ে চেষ্টা করুন।`
            : `⚠️ I know where **${displayName}** is, but I can't find direct local buses in my current database. Try finding a connection via a major hub like Farmgate or Mohakhali.`);
        }

      } else {
        // Original logic: Just list buses passing
        const busPassEx = BUS_DATA.filter(b => b.stops.some(s => {
          const station = STATIONS[s];
          return normalize(station?.name || s).includes(normalize(targetStation.name)) ||
            (station?.bnName && targetStation.bnName && normalize(station.bnName).includes(normalize(targetStation.bnName)));
        })).slice(0, 3).map(b => (isBn && b.bnName ? b.bnName : b.name));
        if (busPassEx.length > 0) {
          responseParts.push(isBn ? `🚌 **এখান দিয়ে চলাচলকারী বাসসমূহ:** ${busPassEx.join(", ")}...` : `🚌 **Buses passing here:** ${busPassEx.join(", ")}...`);
        }
      }
    } else {
      const isBnFinal = /[\u0980-\u09FF]/.test(query);
      return isBnFinal
        ? "🤔 আমি আপনার উল্লেখিত স্থানটি বুঝতে পারছি না। দয়া করে নির্দিষ্ট স্টেশনের নাম (যেমন: ‘ফার্মগেট’, ‘মিরপুর’, ‘গুলশান’) অথবা আন্তঃজেলা ভ্রমণের জন্য জেলার নাম উল্লেখ করুন।"
        : "🤔 I couldn't understand that location. Please try mentioning specific stations like 'Farmgate', 'Mirpur', 'Gulshan' or district names for intercity travel.";
    }
  }

  return responseParts.join("\n\n");
};

// Keeping these for compatibility but making them no-ops or always true
export const canUseAiChat = () => true;
export const trackAiChatUsage = () => { };
