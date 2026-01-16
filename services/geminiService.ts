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

// Popular tourist destinations with travel info
const TOURIST_DESTINATIONS: Record<string, { en: string; bn: string; howToReach: { en: string; bn: string } }> = {
  "Cox's Bazar": {
    en: "Cox's Bazar - World's Longest Sea Beach",
    bn: "কক্সবাজার - বিশ্বের দীর্ঘতম সমুদ্র সৈকত",
    howToReach: {
      en: "🏖️ **Cox's Bazar:**\n✈️ **Flight:** Dhaka to Cox's Bazar (1 hour) - Daily flights by Biman, US-Bangla, Novoair\n🚌 **Bus:** Green Line, Hanif, Shyamoli, Soudia, TR Travels (10-12 hours from Dhaka)\n🚂 **Train:** Cox's Bazar Express from Dhaka (Night journey)\n💰 **Cost:** Bus ৳1200-2500, Flight ৳4000-8000",
      bn: "🏖️ **কক্সবাজার:**\n✈️ **ফ্লাইট:** ঢাকা থেকে কক্সবাজার (১ ঘন্টা) - বিমান, ইউএস-বাংলা, নভোএয়ার দৈনিক\n🚌 **বাস:** গ্রীন লাইন, হানিফ, শ্যামলী, সৌদিয়া, টিআর ট্রাভেলস (ঢাকা থেকে ১০-১২ ঘন্টা)\n🚂 **ট্রেন:** ঢাকা থেকে কক্সবাজার এক্সপ্রেস (রাত্রিকালীন যাত্রা)\n💰 **খরচ:** বাস ৳১২০০-২৫০০, ফ্লাইট ৳৪০০০-৮০০০"
    }
  },
  "Sundarbans": {
    en: "Sundarbans - World's Largest Mangrove Forest",
    bn: "সুন্দরবন - বিশ্বের বৃহত্তম ম্যানগ্রোভ বন",
    howToReach: {
      en: "🌳 **Sundarbans:**\n🚌 **Via Khulna:** Bus to Khulna (6-7 hours), then boat from Mongla/Khulna\n🚂 **Train:** Sundarban Express to Khulna\n🚢 **Launch:** Dhaka (Sadarghat) to Khulna (10-12 hours overnight)\n**Tour Packages:** 2-3 days packages available from Dhaka (৳8000-15000 per person)",
      bn: "🌳 **সুন্দরবন:**\n🚌 **খুলনা হয়ে:** খুলনায় বাস (৬-৭ ঘন্টা), তারপর মংলা/খুলনা থেকে নৌকা\n🚂 **ট্রেন:** খুলনায় সুন্দরবন এক্সপ্রেস\n🚢 **লঞ্চ:** ঢাকা (সদরঘাট) থেকে খুলনা (১০-১২ ঘন্টা রাত্রিকালীন)\n**ট্যুর প্যাকেজ:** ঢাকা থেকে ২-৩ দিনের পযাকেজ পাওয়া যায় (৳৮০০০-১৫০০০ প্রতি জন)"
    }
  },
  "Saint Martin": {
    en: "Saint Martin - Bangladesh's Only Coral Island",
    bn: "সেন্ট মার্টিন - বাংলাদেশের একমাত্র প্রবাল দ্বীপ",
    howToReach: {
      en: "🏝️ **Saint Martin:**\n**Route:** Dhaka → Cox's Bazar → Teknaf → Saint Martin\n🚢 **Ship:** From Teknaf jetty (3-4 hours), ships leave 9 AM daily\nShips: Keari Sindbad, Kutubdia, Eagle, Sea Truck\n💰 **Cost:** Ship ৳500-1500 one way\n⚠️ **Season:** Best Nov-March, often closed May-September",
      bn: "🏝️ **সেন্ট মার্টিন:**\n**রুট:** ঢাকা → কক্সবাজার → টেকনাফ → সেন্ট মার্টিন\n🚢 **জাহাজ:** টেকনাফ জেটি থেকে (৩-৪ ঘন্টা), প্রতিদিন সকাল ৯টায় ছাড়ে\nজাহাজ: কেয়ারী সিন্দবাদ, কুতুবদিয়া, ঈগল, সি ট্রাক\n💰 **খরচ:** জাহাজ ৳৫০০-১৫০০ একমুখী\n⚠️ **মৌসুম:** নভেম্বর-মার্চ সেরা, মে-সেপ্টেম্বর প্রায়ই বন্ধ"
    }
  },
  "Sylhet": {
    en: "Sylhet - Land of Tea Gardens",
    bn: "সিলেট - চা বাগানের দেশ",
    howToReach: {
      en: "🍃 **Sylhet (Jaflong, Ratargul, Srimangal):**\n✈️ **Flight:** Multiple daily flights (45 mins)\n🚂 **Train:** Upaban Express, Jayantika Express, Parabat Express (6-8 hours)\n🚌 **Bus:** Shyamoli, Hanif, Green Line, Ena (6-7 hours)\n💰 **Cost:** Bus ৳600-1200, Train ৳300-800, Flight ৳3000-6000",
      bn: "🍃 **সিলেট (জাফলং, রাতারগুল, শ্রীমঙ্গল):**\n✈️ **ফ্লাইট:** একাধিক দৈনিক ফ্লাইট (৪৫ মিনিট)\n🚂 **ট্রেন:** উপবন এক্সপ্রেস, জয়ন্তিকা এক্সপ্রেস, পারাবত এক্সপ্রেস (৬-৮ ঘন্টা)\n🚌 **বাস:** শ্যামলী, হানিফ, গ্রীন লাইন, ইনা (৬-৭ ঘন্টা)\n💰 **খরচ:** বাস ৳৬০০-১২০০, ট্রেন ৳৩০০-৮০০, ফ্লাইট ৳৩০০০-৬০০০"
    }
  },
  "Bandarban": {
    en: "Bandarban - Hill Tracts Paradise",
    bn: "বান্দরবান - পাহাড়ি স্বর্গ",
    howToReach: {
      en: "⛰️ **Bandarban (Nilgiri, Nafakum, Thanchi):**\n**Route:** Dhaka → Chattogram → Bandarban\n🚌 **Bus:** Shyamoli, Hanif, S Alam, Unique (10-12 hours direct)\n**Local:** From Chattogram, local buses every 30 mins\n💰 **Cost:** Dhaka-Bandarban ৳800-1500\n⚠️ **Permit Required** for some areas (Ruma, Thanchi)",
      bn: "⛰️ **বান্দরবান (নীলগিরি, নাফাকুম, থানচি):**\n**রুট:** ঢাকা → চট্টগ্রাম → বান্দরবান\n🚌 **বাস:** শ্যামলী, হানিফ, এস আলম, ইউনিক (১০-১২ ঘন্টা সরাসরি)\n**লোকাল:** চট্টগ্রাম থেকে, প্রতি ৩০ মিনিটে স্থানীয় বাস\n💰 **খরচ:** ঢাকা-বান্দরবান ৳৮০০-১৫০০\n⚠️ **পারমিট প্রয়োজন** কিছু এলাকার জন্য (রুমা, থানচি)"
    }
  },
  "Kuakata": {
    en: "Kuakata - Daughter of the Sea",
    bn: "কুয়াকাটা - সাগর কন্যা",
    howToReach: {
      en: "🌅 **Kuakata:**\n🚢 **Launch:** Dhaka (Sadarghat) to Patuakhali (8-10 hours), then bus\n🚌 **Bus:** Sakura, Sohagh, Suravi (10-12 hours from Dhaka)\n**Route:** Via Barishal or direct\n💰 **Cost:** Launch ৳400-800, Bus ৳600-1000\n**Special:** Only beach to see both sunrise and sunset!",
      bn: "🌅 **কুয়াকাটা:**\n🚢 **লঞ্চ:** ঢাকা (সদরঘাট) থেকে পটুয়াখালী (৮-১০ ঘন্টা), তারপর বাস\n🚌 **বাস:** সাকুরা, সোহাগ, সুরভি (ঢাকা থেকে ১০-১২ ঘন্টা)\n**রুট:** বরিশাল হয়ে বা সরাসরি\n💰 **খরচ:** লঞ্চ ৳৪০০-৮০০, বাস ৳৬০০-১০০০\n**বিশেষত্ব:** একমাত্র সৈকত যেখানে সূর্যোদয় এবং সূর্যাস্ত দুটোই দেখা যায়!"
    }
  }
};

// Major launch routes
const LAUNCH_ROUTES = [
  { from: "Dhaka", to: "Barishal", launches: ["MV Sundarban", "MV Parabat", "MV Farhan", "MV Kirtankhola"], timing: "9-10 hours overnight", fare: "৳400-1200" },
  { from: "Dhaka", to: "Khulna", launches: ["MV Sundarban routes"], timing: "10-12 hours", fare: "৳500-1500" },
  { from: "Dhaka", to: "Patuakhali", launches: ["MV Suravi", "MV Kawsar"], timing: "8-10 hours", fare: "৳400-800" },
  { from: "Dhaka", to: "Bhola", launches: ["MV Green Line Water Craft"], timing: "6-8 hours", fare: "৳300-600" }
];

// Airport information
const AIRPORTS = {
  "Dhaka": { name: "Hazrat Shahjalal International Airport", domestic: true, international: true },
  "Chattogram": { name: "Shah Amanat International Airport", domestic: true, international: true },
  "Sylhet": { name: "Osmani International Airport", domestic: true, international: true },
  "Cox's Bazar": { name: "Cox's Bazar Airport", domestic: true, international: false },
  "Jashore": { name: "Jashore Airport", domestic: true, international: false },
  "Saidpur": { name: "Saidpur Airport", domestic: true, international: false },
  "Barishal": { name: "Barishal Airport", domestic: true, international: false },
  "Rajshahi": { name: "Shah Makhdum Airport", domestic: true, international: false }
};

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
};

// Check for tourist destination queries
const findTouristInfo = (query: string): string => {
  const lowerQuery = normalize(query);
  const isBn = /[\u0980-\u09FF]/.test(query);

  for (const [key, destination] of Object.entries(TOURIST_DESTINATIONS)) {
    if (lowerQuery.includes(normalize(key)) ||
      (destination.bn && lowerQuery.includes(normalize(destination.bn)))) {
      return isBn ? destination.howToReach.bn : destination.howToReach.en;
    }
  }

  // General tourist queries
  if (lowerQuery.includes("tourist") || lowerQuery.includes("tour") ||
    lowerQuery.includes("visit") || lowerQuery.includes("holiday") ||
    lowerQuery.includes("vacation") || lowerQuery.includes("ঘুরতে") ||
    lowerQuery.includes("ভ্রমণ") || lowerQuery.includes("পর্যটন")) {
    return isBn
      ? `🗺️ **জনপ্রিয় পর্যটন স্থান:**\n\n` +
      `🏖️ **কক্সবাজার** - বিশ্বের দীর্ঘতম সমুদ্র সৈকত\n` +
      `🏝️ **সেন্ট মার্টিন** - প্রবাল দ্বীপ\n` +
      `🌳 **সুন্দরবন** - ম্যানগ্রোভ বন ও রয়েল বেঙ্গল টাইগার\n` +
      `🍃 **সিলেট** - চা বাগান ও জাফলং\n` +
      `⛰️ **বান্দরবান** - নীলগিরি, নাফাকুম\n` +
      `🌅 **কুয়াকাটা** - সাগর কন্যা\n` +
      `🏛️ **পুরান ঢাকা** - লালবাগ কেল্লা, আহসান মঞ্জিল\n` +
      `🦌 **রাতারগুল** - সোয়াম্প ফরেস্ট\n\n` +
      `যেকোনো জায়গার বিস্তারিত জানতে নাম টাইপ করুন!`
      : `🗺️ **Popular Tourist Destinations:**\n\n` +
      `🏖️ **Cox's Bazar** - World's longest sea beach\n` +
      `🏝️ **Saint Martin** - Coral island\n` +
      `🌳 **Sundarbans** - Mangrove forest & Royal Bengal Tigers\n` +
      `🍃 **Sylhet** - Tea gardens & Jaflong\n` +
      `⛰️ **Bandarban** - Nilgiri, Nafakum waterfalls\n` +
      `🌅 **Kuakata** - Daughter of the sea\n` +
      `🏛️ **Old Dhaka** - Lalbagh Fort, Ahsan Manzil\n` +
      `🦌 **Ratargul** - Swamp forest\n\n` +
      `Type any destination name for detailed info!`;
  }

  return "";
};

// Check for launch/ferry queries
const findLaunchInfo = (query: string): string => {
  const lowerQuery = normalize(query);
  const isBn = /[\u0980-\u09FF]/.test(query);

  if (lowerQuery.includes("launch") || lowerQuery.includes("লঞ্চ") ||
    lowerQuery.includes("ferry") || lowerQuery.includes("নৌকা")) {

    // Check for specific routes
    for (const route of LAUNCH_ROUTES) {
      if ((lowerQuery.includes(normalize(route.from)) && lowerQuery.includes(normalize(route.to))) ||
        (lowerQuery.includes(normalize(route.to)) && lowerQuery.includes(normalize(route.from)))) {

        return isBn
          ? `🚢 **লঞ্চ রুট: ${route.from} - ${route.to}**\n\n` +
          `**লঞ্চ:** ${route.launches.join(", ")}\n` +
          `**সময়:** ${route.timing}\n` +
          `**ভাড়া:** ${route.fare}\n` +
          `**ছাড়া:** সদরঘাট টার্মিনাল, সন্ধ্যা ৬-৮টা\n\n` +
          `💡 **টিপ:** অগ্রিম টিকিট নিন, VIP/AC কেবিন বুক করুন আরামের জন্য`
          : `🚢 **Launch Route: ${route.from} - ${route.to}**\n\n` +
          `**Launches:** ${route.launches.join(", ")}\n` +
          `**Duration:** ${route.timing}\n` +
          `**Fare:** ${route.fare}\n` +
          `**Departure:** Sadarghat Terminal, Evening 6-8 PM\n\n` +
          `💡 **Tip:** Book tickets in advance, get VIP/AC cabin for comfort`;
      }
    }

    // General launch info
    return isBn
      ? `🚢 **লঞ্চ সার্ভিস (সদরঘাট টার্মিনাল থেকে):**\n\n` +
      `🔹 **বরিশাল** - MV সুন্দরবন, MV পারাবত (৯-১০ ঘন্টা, ৳৪০০-১২০০)\n` +
      `🔹 **খুলনা** - বিভিন্ন লঞ্চ (১০-১২ ঘন্টা, ৳৫০০-১৫০০)\n` +
      `🔹 **পটুয়াখালী/কুয়াকাটা** - MV সুরভি (৮-১০ ঘন্টা, ৳৪০০-৮০০)\n` +
      `🔹 **ভোলা** - MV গ্রীন লাইন (৬-৮ ঘন্টা, ৳৩০০-৬০০)\n\n` +
      `**সময়সূচী:** সন্ধ্যা ৬-৮টায় ছাড়ে, সকালে পৌঁছায়`
      : `🚢 **Launch Services (from Sadarghat Terminal):**\n\n` +
      `🔹 **Barishal** - MV Sundarban, MV Parabat (9-10 hrs, ৳400-1200)\n` +
      `🔹 **Khulna** - Various launches (10-12 hrs, ৳500-1500)\n` +
      `🔹 **Patuakhali/Kuakata** - MV Suravi (8-10 hrs, ৳400-800)\n` +
      `🔹 **Bhola** - MV Green Line (6-8 hrs, ৳300-600)\n\n` +
      `**Timing:** Evening 6-8 PM departure, morning arrival`;
  }

  return "";
};

// Check for airport/flight queries
const findAirportInfo = (query: string): string => {
  const lowerQuery = normalize(query);
  const isBn = /[\u0980-\u09FF]/.test(query);

  if (lowerQuery.includes("flight") || lowerQuery.includes("plane") ||
    lowerQuery.includes("airport") || lowerQuery.includes("বিমান") ||
    lowerQuery.includes("ফ্লাইট") || lowerQuery.includes("এয়ারপোর্ট")) {

    // Check for specific airports
    for (const [city, info] of Object.entries(AIRPORTS)) {
      if (lowerQuery.includes(normalize(city))) {
        const services = info.domestic && info.international
          ? (isBn ? "দেশীয় ও আন্তর্জাতিক" : "Domestic & International")
          : (isBn ? "শুধু দেশীয়" : "Domestic only");

        return isBn
          ? `✈️ **${city} বিমানবন্দর:**\n**নাম:** ${info.name}\n**সেবা:** ${services}\n\n**এয়ারলাইন্স:** বিমান, ইউএস-বাংলা, নভো এয়ার, রিজেন্ট\n**বুকিং:** অনলাইন বা কাউন্টার থেকে`
          : `✈️ **${city} Airport:**\n**Name:** ${info.name}\n**Services:** ${services}\n\n**Airlines:** Biman, US-Bangla, Novoair, Regent\n**Booking:** Online or counter`;
      }
    }

    // General flight info
    return isBn
      ? `✈️ **দেশীয় ফ্লাইট তথ্য:**\n\n` +
      `**বিমানবন্দর:** ঢাকা, চট্টগ্রাম, সিলেট, কক্সবাজার, যশোর, সৈয়দপুর, বরিশাল, রাজশাহী\n` +
      `**এয়ারলাইন্স:** বিমান, ইউএস-বাংলা, নভো এয়ার, রিজেন্ট এয়ার\n` +
      `**জনপ্রিয় রুট:** ঢাকা-কক্স (৳৪০০০-৮০০০), ঢাকা-সিলেট (৳৩০০০-৬০০০)\n\n` +
      `💡 **টিপ:** অগ্রিম বুক করলে সস্তা, রবিবারে সাধারণত বেশি ভাড়া`
      : `✈️ **Domestic Flight Info:**\n\n` +
      `**Airports:** Dhaka, Chattogram, Sylhet, Cox's Bazar, Jashore, Saidpur, Barishal, Rajshahi\n` +
      `**Airlines:** Biman, US-Bangla, Novoair, Regent Air\n` +
      `**Popular Routes:** Dhaka-Cox's (৳4000-8000), Dhaka-Sylhet (৳3000-6000)\n\n` +
      `💡 **Tip:** Book in advance for better prices, Sundays usually costlier`;
  }

  return "";
};

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
      `পূর্বাচলের **বাংলাদেশ-চায়না ফ্রেন্ডশিপ এক্সিবিশন সেন্টারে** যেতে এখন সহজ যাতায়াত।\n` +
      `কই যাবো অ্যাপে দেখুন সব শাটল বাস রুট, ভাড়া আর সময় এক ক্লিকেই 👇\n\n` +
      `**🚌 ডেডিকেটেড শাটল বাস রুটসমূহ:**\n` +
      `- **কুড়িল বিশ্বরোড → মেলা প্রাঙ্গণ**: ভাড়া ৪০ টাকা\n` +
      `- **ফার্মগেট (খামারবাড়ি/পুরনো বিমানবন্দর) → মেলা**: ভাড়া ৭০ টাকা\n` +
      `- **চাষাড়া (নারায়ণগঞ্জ) → মেলা**: ভাড়া ১২০ টাকা\n` +
      `- **মুক্তারপুর → মেলা**: ভাড়া ১৩০ টাকা\n` +
      `- **নরসিংদী → মেলা**: ভাড়া ১০০ টাকা\n` +
      `- **গাজীপুর (শিববাড়ী) → মেলা**: ভাড়া ৭৫ টাকা\n` +
      `- **মেলা প্রাঙ্গণ → সাইনবোর্ড**: ভাড়া ১০০ টাকা\n\n` +
      `**🕗 সময়:** সকাল ৮টা থেকে | শেষ ট্রিপ রাত ১১টা পর্যন্ত।\n\n` +
      `🎟️ **টিকিট মূল্য:** বড় ৫০ টাকা, ছোট ২৫ টাকা (৫ বছরের কম ফ্রি)।`;
  }

  // 0. Greeting / General
  if (lowerQuery.match(/^(hi|hello|hey|salam|help|হাই|হেলো|সাহায্য)/)) {
    const isBn = /[\u0980-\u09FF]/.test(query);
    return isBn
      ? "👋 হ্যালো! আমি আপনার অফলাইন যাতায়াত সহায়ক। আমি আপনাকে সাহায্য করতে পারি:\n- 🚌 **ঢাকার স্থানীয় বাস রুট** (যেমন: 'ফার্মগেট থেকে মিরপুর যেতে বাস')\n- 🚇 **মেট্রো রেল তথ্য** (যেমন: 'উত্তরা থেকে মতিঝিল মেট্রো')\n- 🚂 **আন্তঃজেলা (বাস/ট্রেন/বিমান/লঞ্চ)** (যেমন: 'ঢাকা থেকে বরিশাল')\n- 🗺️ **পর্যটন গাইড** (যেমন: 'কক্সবাজার কিভাবে যাব')\n\nআজ আপনাকে কিভাবে সাহায্য করতে পারি?"
      : "👋 Hello! I am your Offline Transport Assistant. I can help you with:\n- 🚌 **Local Bus Routes** (e.g., 'Bus from Farmgate to Mirpur')\n- 🚇 **Metro Rail Info** (e.g., 'Metro from Uttara to Motijheel')\n- 🚂 **Intercity (Bus/Train/Air/Launch)** (e.g., 'Dhaka to Barishal')\n- 🗺️ **Tourist Guide** (e.g., 'How to reach Cox's Bazar')\n\nHow can I help you today?";
  }

  // Priority checks for specific info types
  const touristInfo = findTouristInfo(query);
  if (touristInfo) responseParts.push(touristInfo);

  const launchInfo = findLaunchInfo(query);
  if (launchInfo) responseParts.push(launchInfo);

  const airportInfo = findAirportInfo(query);
  if (airportInfo) responseParts.push(airportInfo);

  // 1. Check for specific Bus Route (A to B)
  if (lowerQuery.includes(" to ") || lowerQuery.includes(" from ") || lowerQuery.includes(" থেকে ")) {
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
