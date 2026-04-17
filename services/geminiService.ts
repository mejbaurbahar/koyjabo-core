import { BUS_DATA, METRO_STATIONS, STATIONS } from '../constants';
import { BD_TRAIN_ROUTES, TRAIN_STATIONS } from '../data/bangladeshTrainData';
import { getOfflineIntercityData } from '../intercity/offlineService';
import { findRoutesBetweenStations, SuggestedRoute } from './routePlanner';
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
  "Narsingdi", "Bandarban", "Rangamati", "Khagrachari", "Panchagarh", "Thakurgaon",
  "Munshiganj", "Manikganj", "Maowa", "Paturia", "Aricha", "Gopalganj", "Madaripur",
  "Shariatpur", "Lakshmipur", "Bhola", "Patuakhali", "Barguna", "Pirojpur", "Jhalokati",
  "Bagerhat", "Narail", "Meherpur", "Chuadanga", "Magura", "Jhenaidah", "Rajbari",
  "Jamalpur", "Sherpur", "Netrokona", "Kishoreganj", "Sunamganj", "Habiganj", "Moulvibazar",
  "Nilphamari", "Gaibandha", "Kurigram", "Lalmonirhat", "Joypurhat"
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
  "Khagrachari": "খাগড়াছড়ি", "Panchagarh": "পঞ্চগড়", "Thakurgaon": "ঠাকুরগাঁও",
  "Munshiganj": "মুন্সীগঞ্জ", "Manikganj": "মানিকগঞ্জ", "Maowa": "মাওয়া", "Paturia": "পাটুরিয়া",
  "Aricha": "আরিচা", "Gopalganj": "গোপালগঞ্জ", "Madaripur": "মাদারীপুর", "Shariatpur": "শরীয়তপুর",
  "Lakshmipur": "লক্ষ্মীপুর", "Bhola": "ভোলা", "Patuakhali": "পটুয়াখালী", "Barguna": "বরগুনা",
  "Pirojpur": "পিরোজপুর", "Jhalokati": "ঝালকাঠি", "Bagerhat": "বাগেরহাট", "Narail": "নড়াইল",
  "Meherpur": "মেহেরপুর", "Chuadanga": "চুয়াডাঙ্গা", "Magura": "মাগুরা", "Jhenaidah": "ঝিনাইদহ",
  "Rajbari": "রাজবাড়ী", "Jamalpur": "জামালপুর", "Sherpur": "শেরপুর", "Netrokona": "নেত্রকোণা",
  "Kishoreganj": "কিশোরগঞ্জ", "Sunamganj": "সুনামগঞ্জ", "Habiganj": "হবিগঞ্জ", "Moulvibazar": "মৌলভীবাজার",
  "Nilphamari": "নীলফামারী", "Gaibandha": "গাইবান্ধা", "Kurigram": "কুড়িগ্রাম", "Lalmonirhat": "লালমনিরহাট",
  "Joypurhat": "জয়পুরহাট"
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

// Complete tour plans for popular destinations
const TOUR_PLANS: Record<string, { en: string; bn: string }> = {
  "Cox's Bazar": {
    en: `🏖️ **Complete Cox's Bazar Tour Plan (3 Days/2 Nights)**

📅 **DAY 1: Arrival & Beach Exploration**
🕐 Morning: Depart Dhaka (Night bus at 10 PM or early morning flight)
🕐 Arrival: Check-in hotel (Book near Laboni/Sugandha Beach)
🍽️ Lunch: Fresh seafood at beach restaurants (৳300-500)
🌊 Afternoon: Laboni Beach, Marine Drive (world's longest sea drive 80km)
🌅 Evening: Sunset at Laboni Point
🍽️ Dinner: Hotel or beach-side BBQ
**Accommodation:** Budget ৳1500-2500, Mid-range ৳3000-5000, Luxury ৳8000+

📅 **DAY 2: Himchari & Inani Beach**
🕐 Morning: Breakfast, hire CNG/car for day (৳2000-3000)
🏞️ Visit: Himchari National Park, Waterfall
🏖️ Inani Beach: Most beautiful beach, clear water, perfect for photos
🍽️ Lunch: Local restaurants
🌊 Optional: Paragliding at Inani (৳1500-2500)
🌅 Return: Hotel, sunset at hotel beach
🍽️ Dinner: Try dried fish, local curry

📅 **DAY 3: Local Sightseeing & Departure**
🕐 Morning: Visit Aggmeda Khyang (Buddhist Temple)
🐟 Fishery Ghat: Watch boats, buy dried fish
🛍️ Shopping: Burmese Market, seashells, pearls
🍽️ Lunch: Hotel checkout
🚌 Departure: Bus/Flight to Dhaka

💰 **BUDGET BREAKDOWN (Per Person):**
🚌 Transport: Bus ৳2000-2500, Flight ৳8000-12000
🏨 Accommodation: ৳3000-10000 (2 nights)
🍽️ Food: ৳1500-3000 (3 days)
🚗 Local transport: ৳1000-2000
🎯 Activities: ৳1000-3000
**TOTAL: ৳8500-20000** (Budget to Comfortable)

📝 **TIPS:**
✅ Best season: Nov-March (avoid monsoon)
✅ Book hotels in advance during peak season
✅ Carry sunscreen, hats, swimwear
✅ Don't swim during high tide warnings
✅ Bargain at markets (30-40% off initial price)

🎁 **BONUS:** Add Saint Martin (+2 days, +৳5000-8000)`,

    bn: `🏖️ **সম্পূর্ণ কক্সবাজার ট্যুর প্ল্যান (৩ দিন/২ রাত)**

📅 **১ম দিন: আগমন ও সৈকত ভ্রমণ**
🕐 সকাল: ঢাকা থেকে出发 (রাত ১০টার বাস বা ভোরের ফ্লাইট)
🕐 পৌঁছানো: হোটেল চেক-ইন (লাবনি/সুগন্ধা বিচের কাছে বুক করুন)
🍽️ দুপুর: সমুদ্র সৈকতের রেস্তোরাঁয় তাজা সামুদ্রিক খাবার (৳৩০০-৫০০)
🌊 বিকাল: লাবনি বিচ, মেরিন ড্রাইভ (বিশ্বের দীর্ঘতম সমুদ্র সড়ক ৮০ কিমি)
🌅 সন্ধ্যা: লাবনি পয়েন্টে সূর্যাস্ত
🍽️ রাতের খাবার: হোটেল বা বিচ-সাইড বারবিকিউ
**থাকা:** বাজেট ৳১৫০০-২৫০০, মিড-রেঞ্জ ৳৩০০০-৫০০০, লাক্সারি ৳৮০০০+

📅 **২য় দিন: হিমছড়ি ও ইনানী বিচ**
🕐 সকাল: নাশতা, দিনের জন্য সিএনজি/গাড়ি ভাড়া (৳২০০০-৩০০০)
🏞️ দর্শন: হিমছড়ি জাতীয় উদ্যান, ঝর্ণা
🏖️ ইনানী বিচ: সবচেয়ে সুন্দর সৈকত, স্বচ্ছ পানি, ফটোর জন্য পারফেক্ট
🍽️ দুপুর: স্থানীয় রেস্তোরাঁ
🌊 অপশনাল: ইনানীতে প্যারাগ্লাইডিং (৳১৫০০-২৫০০)
🌅 ফিরুন: হোটেল, হোটেল বিচে সূর্যাস্ত
🍽️ রাতের খাবার: শুঁটকি, স্থানীয় তরকারি ট্রাই করুন

📅 **৩য় দিন: স্থানীয় দর্শনীয় স্থান ও প্রস্থান**
🕐 সকাল: আগমেডা খিয়াং (বৌদ্ধ মন্দির) পরিদর্শন
🐟 ফিশারি ঘাট: নৌকা দেখুন, শুঁটকি কিনুন
🛍️ কেনাকাটা: বার্মিজ মার্কেট, ঝিনুক, মুক্তা
🍽️ দুপুর: হোটেল চেক-আউট
🚌 প্রস্থান: ঢাকায় বাস/ফ্লাইট

💰 **বাজেট ব্রেকডাউন (প্রতি ব্যক্তি):**
🚌 যাতায়াত: বাস ৳২০০০-২৫০০, ফ্লাইট ৳৮০০০-১২০০০
🏨 থাকা: ৳৩০০০-১০০০০ (২ রাত)
🍽️ খাবার: ৳১৫০০-৩০০০ (৩ দিন)
🚗 স্থানীয় যাতায়াত: ৳১০০০-২০০০
🎯 কার্যক্রম: ৳১০০০-৩০০০
**সর্বমোট: ৳৮৫০০-২০০০০** (বাজেট থেকে আরামদায়ক)

📝 **টিপস:**
✅ সেরা মৌসুম: নভেম্বর-মার্চ (বর্ষা এড়িয়ে চলুন)
✅ পিক সিজনে আগে থেকে হোটেল বুক করুন
✅ সানস্ক্রিন, টুপি, সাঁতারের পোশাক নিন
✅ উচ্চ ঢেউয়ের সতর্কতার সময় সাঁতার কাটবেন না
✅ বাজারে দরদাম করুন (প্রথম দামের ৩০-৪০% ছাড়)

🎁 **বোনাস:** সেন্ট মার্টিন যোগ করুন (+২ দিন, +৳৫০০০-৮০০০)`
  },

  "Sylhet": {
    en: `🍃 **Complete Sylhet Tour Plan (4 Days/3 Nights)**

📅 **DAY 1: Arrival & Sylhet City**
✈️ Morning: Flight to Sylhet (45 mins) or Night train
🏨 Check-in: Hotel near Zindabazar/Amberkhana
🍽️ Lunch: Try Shahi Egg, local cuisine
🕌 Visit: Hazrat Shah Jalal Mazar, Keane Bridge
🏞️ Tamabil Border (if time permits)
🌅 Evening: Tea at Akhalia Tea Garden nearby
**Accommodation:** ৳2000-5000

📅 **DAY 2: Jaflong & Bichnakandi**
🚗 Early morning: Hire car for the day (৳3000-4000)
🏞️ Jaflong: Stone collection, Dawki River view, Zero Point
⛰️ Bichnakandi: Must-visit! Hills & streams
🍽️ Lunch: Local restaurants in Jaflong
🛶 Optional: Boat ride in Piyain River
🌅 Return: Sylhet city, riverside walk
**Cost:** ৳1500-3000 (transport + food)

📅 **DAY 3: Ratargul Swamp Forest**
🌳 Morning: Ratargul (30km from Sylhet)
🚣 Boat ride: Through the swamp forest (৳500-800)
📸 Amazing photography spot! (Visit monsoon for best exp)
🍽️ Lunch: Return to Sylhet
🏛️ Visit: Lalakhal (Blue water), if time
🌃 Evening: Shopping at Zindabazar, try street food

📅 **DAY 4: Srimangal Tea Capital**
🚂 Morning: Train/Bus to Srimangal (2-3 hours)
🍃 Visit: Lawachara National Park (rare hoolock gibbons!)
☕ Tea Garden Tour: Learn tea processing, fresh tea
🏞️ Madhobpur Lake (if time)
🍽️ Lunch: Seven-layer tea at Nilkantha Tea Cabin
🚂 Return: Sylhet → Dhaka (evening train/bus)

💰 **BUDGET (Per Person):**
✈️ Transport: Flight ৳6000-10000, Train ৳600-1500
🏨 Stay: ৳6000-15000 (3 nights)
🍽️ Food: ৳2000-4000
🚗 Local: ৳2000-4000
**TOTAL: ৳16000-35000**

📝 **TIPS:**
✅ Visit Ratargul in monsoon (Jun-Oct) for water
✅ Book Lawachara guide (৳300-500)
✅ Try 7-layer tea, pineapple, orange juice
✅ Bargain at stone markets in Jaflong`,

    bn: `🍃 **সম্পূর্ণ সিলেট ট্যুর প্ল্যান (৪ দিন/৩ রাত)**

📅 **১ম দিন: আগমন ও সিলেট শহর**
✈️ সকাল: সিলেটে ফ্লাইট (৪৫ মিনিট) বা রাতের ট্রেন
🏨 চেক-ইন: জিন্দাবাজার/আম্বরখানার কাছে হোটেল
🍽️ দুপুর: শাহী ডিম, স্থানীয় খাবার ট্রাই করুন
🕌 দর্শন: হযরত শাহ জালাল মাজার, কিন ব্রিজ
🏞️ তামাবিল বর্ডার (সময় থাকলে)
🌅 সন্ধ্যা: কাছের আখালিয়া চা বাগানে চা
**থাকা:** ৳২০০০-৫০০০

📅 **২য় দিন: জাফলং ও বিছনাকান্দি**
🚗 ভোর: দিনের জন্য গাড়ি ভাড়া (৳৩০০০-৪০০০)
🏞️ জাফলং: পাথর সংগ্রহ, ডাউকি নদীর দৃশ্য, জিরো পয়েন্ট
⛰️ বিছনাকান্দি: অবশ্যই যেতে হবে! পাহাড় ও স্রোতধারা
🍽️ দুপুর: জাফলংয়ের স্থানীয় রেস্তোরাঁ
🛶 অপশনাল: পিয়াইন নদীতে নৌকা ভ্রমণ
🌅 ফিরুন: সিলেট শহর, নদীর ধারে হাঁটা
**খরচ:** ৳১৫০০-৩০০০ (যাতায়াত + খাবার)

📅 **৩য় দিন: রাতারগুল জলাবন**
🌳 সকাল: রাতারগুল (সিলেট থেকে ৩০ কিমি)
🚣 নৌকা ভ্রমণ: জলাবনের মধ্য দিয়ে (৳৫০০-৮০০)
📸 দুর্দান্ত ফটোগ্রাফি স্পট! (সেরা অভিজ্ঞতার জন্য বর্ষায় যান)
🍽️ দুপুর: সিলেটে ফিরুন
🏛️ দর্শন: লালাখাল (নীল পানি), সময় থাকলে
🌃 সন্ধ্যা: জিন্দাবাজারে কেনাকাটা, রাস্তার খাবার ট্রাই করুন

📅 **৪র্থ দিন: শ্রীমঙ্গল চা রাজধানী**
🚂 সকাল: শ্রীমঙ্গলে ট্রেন/বাস (২-৩ ঘন্টা)
🍃 দর্শন: লাউয়াছড়া জাতীয় উদ্যান (বিরল হুলক গিবন!)
☕ চা বাগান ট্যুর: চা প্রক্রিয়াকরণ শিখুন, তাজা চা
🏞️ মাধবপুর লেক (সময় থাকলে)
🍽️ দুপুর: নীলকণ্ঠ চা কেবিনে সাত স্তরের চা
🚂 ফিরুন: সিলেট → ঢাকা (সন্ধ্যার ট্রেন/বাস)

💰 **বাজেট (প্রতি ব্যক্তি):**
✈️ যাতায়াত: ফ্লাইট ৳৬০০০-১০০০০, ট্রেন ৳৬০০-১৫০০
🏨 থাকা: ৳৬০০০-১৫০০০ (৩ রাত)
🍽️ খাবার: ৳২০০০-৪০০০
🚗 স্থানীয়: ৳২০০০-৪০০০
**সর্বমোট: ৳১৬০০০-৩৫০০০**

📝 **টিপস:**
✅ পানির জন্য বর্ষায় (জুন-অক্টোবর) রাতারগুল যান
✅ লাউয়াছড়া গাইড বুক করুন (৳৩০০-৫০০)
✅ ৭ স্তরের চা, আনারস, কমলার রস ট্রাই করুন
✅ জাফলংয়ের পাথরের বাজারে দরদাম করুন`
  },

  "Bandarban": {
    en: `⛰️ **Complete Bandarban Adventure Plan (3-4 Days)**

📅 **DAY 1: Arrival & Nilgiri**
🚌 Night bus from Dhaka (arrive morning)
🏨 Check-in: Hotel in Bandarban town
🍽️ Breakfast: Try tribal bamboo chicken
🚗 Hire jeep/chander gari for Nilgiri (৳4000-6000 round trip)
⛰️ Nilgiri: Highest peak tour spot, cloud touching!
☁️ Walk on sky bridge, military check post
🌅 Sunset view (if weather permits)
🏨 Stay: Nilgiri resort or return to Bandarban
**Permit:** Required, arranged by driver

📅 **DAY 2: Thanchi & Remakri Waterfall**
🚙 Very early start (5 AM)
🏞️ Drive to Thanchi (4-5 hours, adventurous road!)
💦 Remakri/Nafakum Waterfall: Trek 30 mins
🏊 Swimming in natural pool (bring swimwear!)
🍽️ Packed lunch (no restaurants)
🌄 Return: Long journey back
**Cost:** Jeep ৳8000-12000, Permit ৳500
**Note:** Need army permission for Thanchi!

📅 **DAY 3: Shoilo Propat & Golden Temple**
🌄 Morning: Shoilo Propat (waterfall) - easy access
🏔️ Chimbuk: 2nd highest peak, beautiful view
🛕 Buddha Dhatu Jadi (Golden Temple): Must-visit!
🏞️ Meghla: Tourist complex, hanging bridge
🛍️ Shopping: Tribal handicrafts, traditional wear
🍽️ Try: Bamboo chicken, rice wine (check legality)

📅 **DAY 4: Departure** (Optional)
🌅 Sunrise from hotel
🏞️ Quick visit: Sangu River
🚌 Return to Dhaka/Chattogram

💰 **BUDGET (Per Person):**
🚌 Transport: ৳1600-3000
🏨 Stay: ৳1500-4000/night
🍽️ Food: ৳1500-2500
🚗 Local jeep/CNG: ৳3000-6000
📋 Permits: ৳500-1000
**TOTAL: ৳12000-25000**

⚠️ **IMPORTANT:**
🔐 Keep original NID/Passport for permits
👮 Army checkpoints - be cooperative
🥾 Wear trekking shoes, carry water
📵 Limited network in remote areas
🚫 Some areas restricted (Ruma, deep Thanchi)

📝 **BEST TIME:** Oct-March (avoid monsoon)`,

    bn: `⛰️ **সম্পূর্ণ বান্দরবান অ্যাডভেঞ্চার প্ল্যান (৩-৪ দিন)**

📅 **১ম দিন: আগমন ও নীলগিরি**
🚌 ঢাকা থেকে রাতের বাস (সকালে পৌঁছান)
🏨 চেক-ইন: বান্দরবান শহরে হোটেল
🍽️ নাশতা: ট্রাইবাল বাঁশের মুরগি ট্রাই করুন
🚗 নীলগিরির জন্য জিপ/চাঁদের গাড়ি ভাড়া (৳৪০০০-৬০০০ রাউন্ড ট্রিপ)
⛰️ নীলগিরি: সর্বোচ্চ শিখর ট্যুর স্পট, মেঘ ছোঁয়া!
☁️ স্কাই ব্রিজে হাঁটুন, সামরিক চেক পোস্ট
🌅 সূর্যাস্তের দৃশ্য (আবহাওয়া অনুমতি দিলে)
🏨 থাকুন: নীলগিরি রিসোর্ট বা বান্দরবানে ফিরুন
**পারমিট:** প্রয়োজন, ড্রাইভার দ্বারা ব্যবস্থা করা হবে

📅 **২য় দিন: থানচি ও রেমাক্রি ঝর্ণা**
🚙 খুব ভোরে শুরু (সকাল ৫টা)
🏞️ থানচিতে ড্রাইভ (৪-৫ ঘন্টা, রোমাঞ্চকর রাস্তা!)
💦 রেমাক্রি/নাফাকুম ঝর্ণা: ৩০ মিনিট ট্রেক
🏊 প্রাকৃতিক পুলে সাঁতার (সাঁতারের পোশাক আনুন!)
🍽️ প্যাকড লাঞ্চ (কোন রেস্তোরাঁ নেই)
🌄 ফিরুন: দীর্ঘ যাত্রা ফিরে
**খরচ:** জিপ ৳৮০০০-১২০০০, পারমিট ৳৫০০
**নোট:** থানচির জন্য সেনা অনুমতি প্রয়োজন!

📅 **৩য় দিন: শৈলপ্রপাত ও গোল্ডেন টেম্পল**
🌄 সকাল: শৈলপ্রপাত (ঝর্ণা) - সহজ অ্যাক্সেস
🏔️ চিম্বুক: ২য় সর্বোচ্চ শিখর, সুন্দর দৃশ্য
🛕 বুদ্ধ ধাতু জাদি (গোল্ডেন টেম্পল): অবশ্যই দেখতে হবে!
🏞️ মেঘলা: পর্যটন কমপ্লেক্স, ঝুলন্ত সেতু
🛍️ কেনাকাটা: উপজাতীয় হস্তশিল্প, ঐতিহ্যবাহী পোশাক
🍽️ ট্রাই করুন: বাঁশের মুরগি, রাইস ওয়াইন (আইনি কিনা চেক করুন)

📅 **৪র্থ দিন: প্রস্থান** (ঐচ্ছিক)
🌅 হোটেল থেকে সূর্যোদয়
🏞️ দ্রুত ভিজিট: সাঙ্গু নদী
🚌 ঢাকা/চট্টগ্রামে ফিরুন

💰 **বাজেট (প্রতি ব্যক্তি):**
🚌 যাতায়াত: ৳১৬০০-৩০০০
🏨 থাকা: ৳১৫০০-৪০০০/রাত
🍽️ খাবার: ৳১৫০০-২৫০০
🚗 স্থানীয় জিপ/সিএনজি: ৳৩০০০-৬০০০
📋 পারমিট: ৳৫০০-১০০০
**সর্বমোট: ৳১২০০০-২৫০০০**

⚠️ **গুরুত্বপূর্ণ:**
🔐 পারমিটের জন্য মূল NID/পাসপোর্ট রাখুন
👮 সেনা চেকপয়েন্ট - সহযোগিতা করুন
🥾 ট্রেকিং জুতা পরুন, পানি বহন করুন
📵 দূরবর্তী এলাকায় সীমিত নেটওয়ার্ক
🚫 কিছু এলাকা নিষিদ্ধ (রুমা, গভীর থানচি)

📝 **সেরা সময়:** অক্টোবর-মার্চ (বর্ষা এড়িয়ে চলুন)`
  }
};



// --- HELPER FUNCTIONS ---

// Normalize text for search
const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s\u0980-\u09FF]/g, '').trim();

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-LANGUAGE SUPPORT: English · বাংলা · Banglish
// ─────────────────────────────────────────────────────────────────────────────

// Comprehensive Banglish → English keyword map (longest first matching)
const BANGLISH_MAP: Array<[string, string]> = [
  // Multi-word navigation phrases — matched before single words
  ['ki vabe jabo', 'how to go to'], ['kivabe jabo', 'how to go to'],
  ['kibhabe jabo', 'how to go to'], ['kemne jabo', 'how to go to'],
  ['kemon kore jabo', 'how to go to'], ['koi vabe jabo', 'how to go to'],
  ['ki kore jabo', 'how to go to'],
  ['jete chai', 'want to go'], ['jete hobe', 'need to go'],
  ['jete parbo', 'can go to'], ['jete pari', 'can go to'],
  ['ami jabo', 'i want to go'], ['ami jete chai', 'i want to go'],
  ['apni jaben', 'you want to go'],
  ['koi jabo', 'where go'], ['kothay jabo', 'where go'],
  ['kothay jaben', 'where go'], ['kothay jai', 'where go'],
  ['koto shomoy lage', 'how long travel time'],
  ['koto shomoy lagbe', 'how long travel time'],
  ['koto taka lage', 'how much fare'], ['koto poisha lage', 'how much fare'],
  ['koto taka', 'how much fare'], ['koto pora', 'how much fare'],
  ['ticket dam koto', 'how much ticket price'], ['ticket price koto', 'how much ticket price'],
  ['bhara koto', 'how much fare'], ['pora koto', 'how much fare'],
  ['bus ache ki', 'bus available'], ['bus pabo ki', 'bus available'],
  ['train ache ki', 'train available'], ['train pabo ki', 'train available'],
  ['metro ache ki', 'metro available'],
  ['launch ache ki', 'launch available'],
  ['bus ache', 'bus available'], ['bus pabo', 'bus available'],
  ['train ache', 'train available'], ['train pabo', 'train available'],
  ['metro ache', 'metro available'],
  ['kono bus ache', 'any bus available'], ['kono train ache', 'any train available'],
  ['shoja rasta', 'direct route'], ['shoja poth', 'direct route'],
  ['theke shuru', 'starting from'], ['theke jabo', 'from go to'],
  ['theke jete', 'from going to'],
  // Prepositions / connectors
  ['theke', 'from'], ['thekay', 'from'], ['thekey', 'from'],
  ['porjonto', 'to'], ['porzonto', 'to'], ['obodhi', 'to'],
  ['te jabo', 'go to'], ['e jabo', 'go to'], ['te jaben', 'go to'],
  ['e jaben', 'go to'], ['te jete', 'go to'], ['e jete', 'go to'],
  // How/where/what
  ['ki vabe', 'how'], ['kivabe', 'how'], ['kibhabe', 'how'],
  ['kemne', 'how'], ['kemon kore', 'how'],
  ['kothay', 'where'], ['kothai', 'where'], ['kothae', 'where'], ['koi', 'where'],
  ['ki', 'what'], ['kon', 'which'], ['konta', 'which'], ['kono', 'any'],
  ['koto', 'how much'], ['kotokhon', 'how long'],
  // Availability
  ['ache', 'available'], ['achhe', 'available'], ['nai', 'not available'],
  ['pabo', 'will find'], ['paben', 'will find'], ['pawa jabe', 'available'],
  // People
  ['ami', 'i'], ['amake', 'me'], ['amar', 'my'], ['amra', 'we'], ['amader', 'our'],
  ['apni', 'you'], ['apnar', 'your'], ['apnara', 'you all'],
  ['se', 'he she'], ['tara', 'they'],
  // Instructions
  ['bolo', 'tell me'], ['bolun', 'tell me'], ['bolen', 'tell me'],
  ['dekhao', 'show me'], ['dekhun', 'show me'], ['janao', 'let me know'],
  ['janun', 'let me know'], ['doro', 'show me'],
  // Transport modes
  ['bas', 'bus'], ['gari', 'vehicle'], ['cng', 'auto cng'],
  ['riksha', 'rickshaw'], ['ubhar', 'uber ride'],
  ['pathao', 'pathao ride'], ['shohor', 'city'],
  // Time
  ['sokale', 'morning'], ['shokale', 'morning'],
  ['bikel', 'afternoon'], ['bikele', 'afternoon'],
  ['raat', 'night'], ['raate', 'night'], ['ratey', 'night'],
  ['dupure', 'noon'], ['dupur', 'noon'],
  ['aaj', 'today'], ['kal', 'tomorrow'], ['poroshhu', 'day after tomorrow'],
  // Journey-related
  ['jawa', 'going'], ['asha', 'coming'],
  ['porjonto', 'up to'], ['pothe', 'on the way'], ['rasta', 'route road'],
  ['shomoy', 'time'], ['lagbe', 'will take'], ['lage', 'takes'],
  ['dur', 'distance far'], ['dure', 'far away'], ['kache', 'near'], ['kachhe', 'near'],
  ['direct', 'direct'], ['shoja', 'direct straight'],
  // Location common Banglish spellings
  ['dhaka', 'dhaka'], ['dhakay', 'dhaka'], ['dhakar', 'dhaka'],
  ['chittagong', 'chattogram'], ['ctg', 'chattogram'], ['chottogram', 'chattogram'],
  ['sylhet', 'sylhet'], ['sylhete', 'sylhet'], ['sylheter', 'sylhet'],
  ['rajshahi', 'rajshahi'], ['khulna', 'khulna'], ['khulnay', 'khulna'],
  ['barishal', 'barishal'], ['barisal', 'barishal'], ['barshale', 'barishal'],
  ['rangpur', 'rangpur'], ['mymensingh', 'mymensingh'], ['mymensing', 'mymensingh'],
  ['coxsbazar', "cox's bazar"], ['coxs bazar', "cox's bazar"], ['coxbazar', "cox's bazar"],
  ['cox bazar', "cox's bazar"], ['koksbajar', "cox's bazar"], ['coxbajar', "cox's bazar"],
  ['comilla', 'cumilla'], ['comila', 'cumilla'], ['komilla', 'cumilla'],
  ['feni', 'feni'], ['noakhali', 'noakhali'], ['lakshmipur', 'lakshmipur'],
  ['laxmipur', 'lakshmipur'], ['chandpur', 'chandpur'],
  ['brahmanbaria', 'brahmanbaria'], ['b baria', 'brahmanbaria'],
  ['habiganj', 'habiganj'], ['moulvibazar', 'moulvibazar'], ['moulvi bazar', 'moulvibazar'],
  ['sunamganj', 'sunamganj'], ['kishoreganj', 'kishoreganj'],
  ['netrokona', 'netrokona'], ['sherpur', 'sherpur'], ['jamalpur', 'jamalpur'],
  ['tangail', 'tangail'], ['gazipur', 'gazipur'], ['gajipur', 'gazipur'],
  ['narayanganj', 'narayanganj'], ['narsingdi', 'narsingdi'],
  ['munshiganj', 'munshiganj'], ['manikganj', 'manikganj'], ['faridpur', 'faridpur'],
  ['gopalganj', 'gopalganj'], ['madaripur', 'madaripur'], ['shariatpur', 'shariatpur'],
  ['rajbari', 'rajbari'], ['bogura', 'bogura'], ['bogra', 'bogura'],
  ['joypurhat', 'joypurhat'], ['naogaon', 'naogaon'], ['natore', 'natore'],
  ['chapai', 'chapainawabganj'], ['chapainawabganj', 'chapainawabganj'],
  ['pabna', 'pabna'], ['sirajganj', 'sirajganj'],
  ['dinajpur', 'dinajpur'], ['thakurgaon', 'thakurgaon'],
  ['panchagarh', 'panchagarh'], ['nilphamari', 'nilphamari'],
  ['lalmonirhat', 'lalmonirhat'], ['kurigram', 'kurigram'], ['gaibandha', 'gaibandha'],
  ['jashore', 'jashore'], ['jessore', 'jashore'], ['narail', 'narail'],
  ['kushtia', 'kushtia'], ['meherpur', 'meherpur'], ['chuadanga', 'chuadanga'],
  ['jhenaidah', 'jhenaidah'], ['magura', 'magura'], ['satkhira', 'satkhira'],
  ['bagerhat', 'bagerhat'], ['khulnay', 'khulna'],
  ['pirojpur', 'pirojpur'], ['barguna', 'barguna'], ['patuakhali', 'patuakhali'],
  ['bhola', 'bhola'], ['jhalokati', 'jhalokati'],
  ['bandarban', 'bandarban'], ['rangamati', 'rangamati'], ['khagrachhari', 'khagrachari'],
  // Dhaka area Banglish names
  ['farmgate', 'farmgate'], ['farmget', 'farmgate'], ['farm gate', 'farmgate'],
  ['mohakhali', 'mohakhali'], ['mohakkhali', 'mohakhali'],
  ['gulshan', 'gulshan'], ['banani', 'banani'],
  ['dhanmondi', 'dhanmondi'], ['dhানmondi', 'dhanmondi'],
  ['mirpur', 'mirpur'], ['mirpure', 'mirpur'], ['mirpoor', 'mirpur'],
  ['uttara', 'uttara'], ['uttora', 'uttara'], ['uttra', 'uttara'],
  ['motijheel', 'motijheel'], ['motizheel', 'motijheel'],
  ['shahbag', 'shahbagh'], ['shabag', 'shahbagh'],
  ['kamalapur', 'kamalapur'], ['kamlapur', 'kamalapur'],
  ['savar', 'savar'], ['shawar', 'savar'],
  ['tongi', 'tongi'], ['gabtoli', 'gabtoli'], ['sadarghat', 'sadarghat'],
  ['kallyanpur', 'kallyanpur'], ['kalyanpur', 'kallyanpur'],
  ['badda', 'badda'], ['rampura', 'rampura'], ['khilgaon', 'khilgaon'],
  ['demra', 'demra'], ['jatrabari', 'jatrabari'], ['postogola', 'postogola'],
  ['azimpur', 'azimpur'], ['nilkhet', 'nilkhet'], ['paltan', 'paltan'],
  ['press club', 'press club'], ['mouchak', 'mouchak'],
  ['malibagh', 'malibagh'], ['khilkhet', 'khilkhet'],
  // Train station Banglish names
  ['comilla', 'cumilla'], ['akhaura', 'akhaura'], ['laksham', 'laksham'],
  ['feni', 'feni'], ['chittagong', 'chattogram'],
  ['tongi', 'tongi'], ['joydebpur', 'joydebpur'], ['ghorashal', 'ghorashal'],
  ['bhairab', 'bhairab'], ['kishoreganj', 'kishoreganj'],
  ['mymensingh', 'mymensingh'], ['jamalpur', 'jamalpur'],
  ['dewanganj', 'dewanganj'], ['bahadurabad', 'bahadurabad'],
  ['rajshahi', 'rajshahi'], ['ishwardi', 'ishwardi'], ['parbatipur', 'parbatipur'],
  ['chilahati', 'chilahati'], ['santahar', 'santahar'],
  ['benapole', 'benapole'], ['jessore', 'jashore'], ['khulna', 'khulna'],
  ['mongla', 'mongla'], ['rupsha', 'rupsha'],
  ['upaban', 'upaban'], ['jayantika', 'jayantika'], ['parabat', 'parabat'],
  ['surma', 'surma'], ['kalni', 'kalni'], ['jalalabad', 'jalalabad'],
  ['subarna', 'subarna'], ['sonar bangla', 'sonar bangla'], ['turna', 'turna'],
  ['mohanagar', 'mohanagar'], ['chattala', 'chattala'],
  ['silk city', 'silk city'], ['padma', 'padma'], ['dhumketu', 'dhumketu'],
  ['banalata', 'banalata'], ['sundarban', 'sundarban'],
  ['tista', 'tista'], ['rangpur express', 'rangpur express'],
  ['ekota', 'ekota'], ['panchagarh', 'panchagarh'],
  ['drutojan', 'drutojan'], ['nilsagar', 'nilsagar'],
];

// Detect Banglish: romanized Bengali (not Bangla script, but has Bengali-style words)
function detectBanglish(q: string): boolean {
  if (/[\u0980-\u09FF]/.test(q)) return false; // Real Bengali script
  return /\b(jabo|theke|kivabe|ki vabe|kemne|koto|ache|jete|ami|apni|bas|bhara|pora|lage|lagbe|pabo|kothay|koi|bolo|bolun|shoja|shomoy|theke|porjonto|mirpure|uttora|farmget|gulshan|banani|mohakhali|kamalapur|ctg|barishal|barisal|coxs|sylhete|kemon kore|jawa|asha|dur|kache)\b/i.test(q);
}

// Normalize Banglish query: inject English equivalents for all known Banglish words
function normalizeBanglish(query: string): string {
  let q = ' ' + query.toLowerCase() + ' ';
  // Sort by source length descending (longest first to prevent partial overrides)
  const sorted = [...BANGLISH_MAP].sort((a, b) => b[0].length - a[0].length);
  for (const [bl, en] of sorted) {
    const escaped = bl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    q = q.replace(new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'gi'), ` ${en} `);
  }
  return q.replace(/\s+/g, ' ').trim();
}

// Detect response language: Bangla script → bn, Banglish → en (they can read English)
function detectLang(query: string): 'bn' | 'en' | 'banglish' {
  if (/[\u0980-\u09FF]/.test(query)) return 'bn';
  if (detectBanglish(query)) return 'banglish';
  return 'en';
}

// Fuzzy station search: matches partial names (e.g. "gulshan" matches "Gulshan 1", "Gulshan 2")
function fuzzyFindStations(term: string): typeof Object extends never ? never : any[] {
  const t = normalize(term);
  return Object.values(STATIONS).filter(s =>
    normalize(s.name).includes(t) ||
    t.includes(normalize(s.name)) ||
    (s.bnName && (normalize(s.bnName).includes(t) || t.includes(normalize(s.bnName))))
  );
}

// Extract (from, to) pair from a banglish-normalized query string
function extractFromTo(text: string): { from: string | null; to: string | null } {
  // "[place] from [place]" after normalization of "theke"
  const m = text.match(/([a-z0-9'\s-]{2,25})\s+from\s+([a-z0-9'\s-]{2,25})/i);
  if (m) return { from: m[1].trim(), to: m[2].trim() };
  // "from [place]... go to [place]"
  const fromM = text.match(/\bfrom\s+([a-z0-9'\s-]{2,25})/i);
  const toM = text.match(/\b(?:go to|want to go|to)\s+([a-z0-9'\s-]{2,25})/i);
  return { from: fromM?.[1]?.trim() ?? null, to: toM?.[1]?.trim() ?? null };
}

const findBusRoute = (start: string, end: string, isBn: boolean): string => {
  const sMatches = Object.values(STATIONS).filter(st =>
    normalize(st.name).includes(normalize(start)) || (st.bnName && normalize(st.bnName).includes(normalize(start)))
  );
  const eMatches = Object.values(STATIONS).filter(st =>
    normalize(st.name).includes(normalize(end)) || (st.bnName && normalize(st.bnName).includes(normalize(end)))
  );

  if (sMatches.length === 0 || eMatches.length === 0) return "";

  const startStation = sMatches[0];
  const endStation = eMatches[0];

  const routes = findRoutesBetweenStations(startStation.id, endStation.id);

  if (routes.length === 0) return "";

  let response = isBn
    ? `🚌 **${startStation.bnName || startStation.name} থেকে ${endStation.bnName || endStation.name} যাওয়ার উপায়:**\n\n`
    : `🚌 **Routes from ${startStation.name} to ${endStation.name}:**\n\n`;

  routes.slice(0, 2).forEach((route, idx) => {
    const title = isBn ? (route.transfers === 0 ? "সরাসরি বাস" : `পরিবর্তন করে (ভায়া ${route.steps[idx === 0 ? 0 : 1]?.to || 'অন্য স্টেশন'})`) : route.title;
    response += `📍 **${isBn ? 'বিকল্প' : 'Option'} ${idx + 1}: ${title}**\n`;

    route.steps.forEach(step => {
      if (step.type === 'walk') {
        response += isBn ? `🚶‍♂️ ${step.instruction.replace('Walk to', 'হেঁটে যান')} (${Math.round(step.duration || 0)} মিনিট)\n` : `🚶‍♂️ ${step.instruction} (${Math.round(step.duration || 0)} min)\n`;
      } else if (step.type === 'bus') {
        const busName = isBn && step.busRoute?.bnName ? step.busRoute.bnName : step.busRoute?.name;
        response += `🚌 **${busName}** (${step.from} → ${step.to})\n`;
      } else if (step.type === 'metro') {
        response += isBn ? `🚇 **মেট্রোরেল** (${step.from} → ${step.to})\n` : `🚇 **Metro Rail** (${step.from} → ${step.to})\n`;
      }
    });

    response += isBn
      ? `💰 **ভাড়া:** ৳${route.totalFare} | ⏱️ **সময়:** ~${Math.round(route.totalDuration)} মিনিট\n\n`
      : `💰 **Fare:** ৳${route.totalFare} | ⏱️ **Time:** ~${Math.round(route.totalDuration)} min\n\n`;
  });

  return response;
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

  // Handle single location mention with navigation intent
  if (uniqueDistricts.length === 1) {
    const isNavIntent = lowerQuery.match(/(jabo|kivabe|jawa|go|reach|direction|jite|kemne|route|যাব|কিভাবে|জাব|কেমনে|পথ|how|ticket|fare|বাস|ট্রেন)/);
    if (isNavIntent) {
      const to = uniqueDistricts[0];
      const from = to === "Dhaka" ? "Chattogram" : "Dhaka"; // Default from Dhaka unless asking about Dhaka
      const routeData = getOfflineIntercityData(from, to, isBn ? 'bn' : 'en');
      return routeData.result;
    }
  }

  // General Intercity Info
  if (lowerQuery.includes("train") || lowerQuery.includes("intercity") || lowerQuery.includes("flight") || lowerQuery.includes("plane")) {
    return isBn
      ? "🚂 **আন্তঃজেলা তথ্য:** আমি আপনাকে ৬৪টি জেলার **ট্রেন**, **বাস**, **বিমান** এবং **লঞ্চ** রুট খুঁজে পেতে সাহায্য করতে পারি! শুধু বলুন আপনি কোথায় যেতে চান (যেমন: 'ঢাকা থেকে বরিশাল' বা 'কক্সবাজার যাওয়ার বিমান রুট')।"
      : "🚂 **Intercity Info:** I can help you with **Train**, **Bus**, **Flight**, and **Launch** routes for all 64 districts! Just tell me where you want to go (e.g., 'Dhaka to Barishal' or 'Flight to Cox's Bazar').";
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

// ── Train lookup using live BD_TRAIN_ROUTES data ────────────────────────────
const findTrainInfo = (query: string): string => {
  const lowerQuery = normalize(query);
  const isBn = /[\u0980-\u09FF]/.test(query);

  // Deduplicate routes (same logic as TrainListPage)
  const seen = new Set<string>();
  const uniqueRoutes = BD_TRAIN_ROUTES.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  // 1. Search by train name or number
  const byName = uniqueRoutes.filter(r =>
    lowerQuery.includes(normalize(r.name)) ||
    lowerQuery.includes(r.number.toLowerCase()) ||
    (r.bnName && lowerQuery.includes(normalize(r.bnName)))
  );
  if (byName.length > 0) {
    const r = byName[0];
    const from = TRAIN_STATIONS[r.from];
    const to = TRAIN_STATIONS[r.to];
    const fromName = isBn ? from?.bnName : from?.name;
    const toName = isBn ? to?.bnName : to?.name;
    const name = isBn ? r.bnName : r.name;
    const stopNames = r.stops.map(id => {
      const st = TRAIN_STATIONS[id];
      return st ? (isBn ? st.bnName : st.name) : id;
    }).join(' → ');
    return isBn
      ? `🚂 **${name}** (${r.number})\n📍 **রুট:** ${fromName} → ${toName}\n🛑 **স্টপ:** ${stopNames}\n🕐 **ঢাকা ছাড়ে:** ${r.dhakaDepart} | **ফেরার সময়:** ${r.returnDepart}\n💰 **ভাড়া:** শুভন ৳${r.fare.shuvan} | স্নিগ্ধা ৳${r.fare.snigdha}${r.fare.acBerth ? ` | এসি বার্থ ৳${r.fare.acBerth}` : ''}\n📏 **দূরত্ব:** ${r.distanceKm} কিমি | **বন্ধের দিন:** ${r.offDay}`
      : `🚂 **${name}** (${r.number})\n📍 **Route:** ${fromName} → ${toName}\n🛑 **Stops:** ${stopNames}\n🕐 **Depart:** ${r.dhakaDepart} | **Return:** ${r.returnDepart}\n💰 **Fare:** Shuvan ৳${r.fare.shuvan} | Snigdha ৳${r.fare.snigdha}${r.fare.acBerth ? ` | AC Berth ৳${r.fare.acBerth}` : ''}\n📏 **Distance:** ${r.distanceKm} km | **Off Day:** ${r.offDay}`;
  }

  // 2. Search by from/to station names
  const stationEntries = Object.values(TRAIN_STATIONS);
  const mentionedStations = stationEntries.filter(st =>
    lowerQuery.includes(normalize(st.name)) || lowerQuery.includes(normalize(st.bnName))
  );

  if (mentionedStations.length >= 2) {
    const fromSt = mentionedStations[0];
    const toSt = mentionedStations[1];
    const matchingRoutes = uniqueRoutes.filter(r => {
      const fi = r.stops.indexOf(fromSt.id);
      const ti = r.stops.indexOf(toSt.id);
      return fi !== -1 && ti !== -1 && fi < ti;
    });
    if (matchingRoutes.length > 0) {
      const header = isBn
        ? `🚂 **${isBn ? fromSt.bnName : fromSt.name} → ${isBn ? toSt.bnName : toSt.name}** রুটের ট্রেন:\n\n`
        : `🚂 **Trains from ${fromSt.name} → ${toSt.name}:**\n\n`;
      const lines = matchingRoutes.slice(0, 5).map(r => {
        const name = isBn ? r.bnName : r.name;
        return `• **${name}** (${r.number}) — ছাড়ে ${r.dhakaDepart} | ভাড়া ৳${r.fare.shuvan}+`;
      });
      return header + lines.join('\n');
    }
  } else if (mentionedStations.length === 1) {
    const st = mentionedStations[0];
    const isNavIntent = lowerQuery.match(/(jabo|train|ticket|যাব|ট্রেন|টিকিট|কিভাবে|route|রুট|কোন|which)/);
    if (isNavIntent) {
      const routes = uniqueRoutes.filter(r => r.stops.includes(st.id)).slice(0, 5);
      if (routes.length > 0) {
        const header = isBn
          ? `🚂 **${st.bnName}** স্টেশনে থামে এমন ট্রেন:\n\n`
          : `🚂 **Trains stopping at ${st.name}:**\n\n`;
        const lines = routes.map(r => {
          const from = TRAIN_STATIONS[r.from];
          const to = TRAIN_STATIONS[r.to];
          const name = isBn ? r.bnName : r.name;
          return `• **${name}** (${r.number}) — ${isBn ? from?.bnName : from?.name} → ${isBn ? to?.bnName : to?.name}`;
        });
        return header + lines.join('\n');
      }
    }
  }

  // 3. General train listing for a division/region
  const regionMap: Record<string, string> = {
    'sylhet': 'Sylhet', 'সিলেট': 'Sylhet',
    'chittagong': 'Chattogram', 'চট্টগ্রাম': 'Chattogram', 'chattogram': 'Chattogram',
    'rajshahi': 'Rajshahi', 'রাজশাহী': 'Rajshahi',
    'khulna': 'Khulna', 'খুলনা': 'Khulna',
    'mymensingh': 'Mymensingh', 'ময়মনসিংহ': 'Mymensingh',
    'rangpur': 'Rajshahi', 'রংপুর': 'Rajshahi',
  };
  for (const [keyword, division] of Object.entries(regionMap)) {
    if (lowerQuery.includes(keyword)) {
      const divRoutes = uniqueRoutes.filter(r => r.division === division).slice(0, 5);
      if (divRoutes.length > 0) {
        const header = isBn
          ? `🚂 **${division} বিভাগের ট্রেনসমূহ:**\n\n`
          : `🚂 **Trains for ${division} Division:**\n\n`;
        const lines = divRoutes.map(r => {
          const name = isBn ? r.bnName : r.name;
          return `• **${name}** (${r.number}) — ছাড়ে ${r.dhakaDepart}`;
        });
        return header + lines.join('\n') + (isBn ? '\n\n_Train অ্যাপে সব ট্রেনের বিস্তারিত দেখুন_' : '\n\n_See full details in the Train section_');
      }
    }
  }

  return '';
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

// Helper to detect destination from query and offer tour plan
const detectDestinationAndOfferPlan = (query: string): { destination: string | null; offerMessage: string } => {
  const lowerQuery = normalize(query);
  const isBn = /[\u0980-\u09FF]/.test(query);

  for (const [key, destination] of Object.entries(TOURIST_DESTINATIONS)) {
    if (lowerQuery.includes(normalize(key)) ||
      (destination.bn && lowerQuery.includes(normalize(destination.bn)))) {

      if (lowerQuery.includes("how") || lowerQuery.includes("jabo") || lowerQuery.includes("kivabe") ||
        lowerQuery.includes("যাব") || lowerQuery.includes("কিভাবে") || lowerQuery.includes("যেতে")) {

        const offerMsg = isBn
          ? `\n\n💡 **আরও সাহায্য চান?**\nআমি আপনার জন্য ${destination.bn} এর একটি **সম্পূর্ণ ট্যুর প্ল্যান** তৈরি করতে পারি - দিন-অনুযায়ী পরিকল্পনা, বাজেট, থাকার জায়গা এবং টিপস সহ!\n\n✨ **বলুন "হ্যাঁ", "নিশ্চিত", "ঠিক আছে" বা "প্ল্যান দিন"** এবং আমি আপনার জন্য বিস্তারিত প্ল্যান তৈরি করে দেব! 🗺️`
          : `\n\n💡 **Want more help?**\nI can create a **complete tour plan** for your ${key} trip - with day-by-day itinerary, budget breakdown, accommodation suggestions, and insider tips!\n\n✨ **Just say "yes", "sure", "okay", or "give me the plan"** and I'll prepare a detailed plan for you! 🗺️`;

        return { destination: key, offerMessage: offerMsg };
      }
    }
  }

  return { destination: null, offerMessage: "" };
};

const isAffirmativeResponse = (query: string, chatHistory: ChatMessage[]): { isAffirm: boolean; requestedDestination: string | null } => {
  const lowerQuery = normalize(query);

  const affirmatives = [
    'yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'perfect', 'fine', 'good',
    'great', 'awesome', 'please', 'give', 'plan', 'show', 'want',
    'হ্যাঁ', 'হা', 'ঠিক', 'আছে', 'পারফেক্ট', 'দিন', 'প্ল্যান', 'চাই', 'দেখান', 'নিশ্চিত'
  ];

  const isAffirm = affirmatives.some(keyword => lowerQuery.includes(keyword)) &&
    lowerQuery.split(' ').length <= 5;

  if (!isAffirm) return { isAffirm: false, requestedDestination: null };

  if (chatHistory.length >= 2) {
    const lastAssistantMessage = chatHistory[chatHistory.length - 2];

    if (lastAssistantMessage && lastAssistantMessage.role === 'assistant') {
      const lastMsg = lastAssistantMessage.text;

      if (lastMsg.includes("complete tour plan") || lastMsg.includes("সম্পূর্ণ ট্যুর প্ল্যান")) {
        for (const [key, destination] of Object.entries(TOURIST_DESTINATIONS)) {
          if (lastMsg.includes(key) || (destination.bn && lastMsg.includes(destination.bn))) {
            return { isAffirm: true, requestedDestination: key };
          }
        }
      }
    }
  }

  return { isAffirm, requestedDestination: null };
};

const getTourPlan = (destination: string, isBn: boolean): string => {
  const plan = TOUR_PLANS[destination];
  if (!plan) return "";

  return isBn ? plan.bn : plan.en;
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


// --- ENHANCEMENT HELPERS ---

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
      ? `\n\n🌆 **সন্ধ্যার পিক আওয়ার!** স্বাভাবিকের চেয়ে ${delay}x বেশি সময় লাগবে। মেট্রোরেল দ্রুততম।`
      : `\n\n🌆 **Evening Peak Hour!** Expect ${delay}x normal time. Metro is fastest.`;
  }

  // Friday
  if (day === 5) {
    response += isBn
      ? `\n\n🕌 **শুক্রবার:** মেট্রোরেল বন্ধ। শুধু বাস সার্ভিস চলছে।`
      : `\n\n🕌 **Friday:** Metro closed. Only bus services available.`;
  }

  return response;
}

function addBusTypeInfo(busType: string, isBn: boolean): string {
  const typeInfo = BUS_TYPES[busType as keyof typeof BUS_TYPES];
  if (!typeInfo) return '';

  return isBn
    ? `\n**ধরন:** ${typeInfo.bnName}\n**সুবিধা:** ${typeInfo.features.join(', ')}\n**ভাড়া রেঞ্জ:** ৳${typeInfo.avgFare}`
    : `\n**Type:** ${typeInfo.fullName}\n**Features:** ${typeInfo.features.join(', ')}\n**Fare Range:** ৳${typeInfo.avgFare}`;
}

function addSeasonalAdvice(destination: string, isBn: boolean): string {
  const month = new Date().getMonth();
  let season: keyof typeof SEASONAL_INFO = 'winter';

  if (month >= 3 && month <= 9) season = 'summer';
  else if (month >= 5 && month <= 8) season = 'monsoon';
  else season = 'winter';

  const info = SEASONAL_INFO[season];
  const tips = info.considerations.slice(0, 3).join('\n- ');

  return isBn
    ? `\n\n🌍 **${destination} ভ্রমণের জন্য কিছু পরামর্শ:**\n- ${tips}`
    : `\n\n🌍 **Seasonal Advice for ${destination}:**\n- ${tips}`;
}

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

// --- MAIN AI LOGIC ---
learningSystem.loadFromStorage();

export const askGeminiRoute = async (userQuery: string, _userApiKey?: string, chatHistory: ChatMessage[] = []): Promise<string> => {

  const [actualQueryPart, contextPart] = userQuery.split('[Context:');
  const isOffline = userQuery.includes('[OfflineMode]');
  const query = actualQueryPart.trim();
  const isBn = /[\u0980-\u09FF]/.test(query);
  const isBanglishQuery = detectBanglish(query);
  const searchQuery = isBanglishQuery ? query + ' ' + normalizeBanglish(query) : query;
  const lowerQuery = normalize(searchQuery);

  // === FAQ Database Check ===
  const faqChecks = {
    'metro timing': lowerQuery.includes('metro') && (lowerQuery.includes('time') || lowerQuery.includes('timing') || lowerQuery.includes('সময়')),
    'bus fare': (lowerQuery.includes('fare') || lowerQuery.includes('ভাড়া')) && !lowerQuery.includes('metro'),
    'best time to travel': lowerQuery.includes('best time') || lowerQuery.includes('peak') || lowerQuery.includes('সেরা সময়')
  };

  for (const [key, condition] of Object.entries(faqChecks)) {
    if (condition && FAQ_DATABASE[key as keyof typeof FAQ_DATABASE]) {
      const faqResponse = FAQ_DATABASE[key as keyof typeof FAQ_DATABASE][isBn ? 'bn' : 'en'];
      return faqResponse;
    }
  }

  // Election Restrictions Check
  if (lowerQuery.includes('election') || lowerQuery.includes('নির্বাচন') ||
    lowerQuery.includes('february 11') || lowerQuery.includes('february 12') ||
    lowerQuery.includes('ফেব্রুয়ারি 11') || lowerQuery.includes('ফেব্রুয়ারি 12') ||
    lowerQuery.includes('vehicle restriction') || lowerQuery.includes('যানবাহন নিষেধ') ||
    lowerQuery.includes('motorcycle ban') || lowerQuery.includes('মোটরসাইকেল নিষেধ')) {

    const electionResponse = isBn
      ? `${EMERGENCY_INFO.electionRestrictions.announcement.bn}\n\n` +
      `📅 **নির্বাচনের তারিখ:** ${EMERGENCY_INFO.electionRestrictions.date}\n` +
      `📰 **ইভেন্ট:** ${EMERGENCY_INFO.electionRestrictions.event}\n\n` +
      `🚫 **নিষিদ্ধ যানবাহন:**\n` +
      `- ট্যাক্সি: ১১ ফেব ০০:০০ - ১২ ফেব ০০:০০ (২৪ ঘন্টা)\n` +
      `- পিকআপ: ১১ ফেব ০০:০০ - ১২ ফেব ০০:০০ (২৪ ঘন্টা)\n` +
      `- মাইক্রোবাস: ১১ ফেব ০০:০০ - ১২ ফেব ০০:০০ (২৪ ঘন্টা)\n` +
      `- ট্রাক: ১১ ফেব ০০:০০ - ১২ ফেব ০০:০০ (২৪ ঘন্টা)\n` +
      `- মোটরসাইকেল: ১০ ফেব ০০:০০ - ১৩ ফেব ০০:০০ (৭২ ঘন্টা)\n` +
      `- নৌযান: ১১ ফেব ০০:০০ - ১২ ফেব ০০:০০ (নির্দিষ্ট রুট ছাড়া)\n\n` +
      `✅ **ছাড়পত্রপ্রাপ্ত যানবাহন:**\n` +
      EMERGENCY_INFO.electionRestrictions.exemptions.bn.map(ex => `- ${ex}`).join('\n') + '\n\n' +
      `📞 **নির্বাচন কমিশন হেল্পলাইন:** ${EMERGENCY_INFO.numbers.electionCommission}\n` +
      `📚 **সূত্র:** ${EMERGENCY_INFO.electionRestrictions.source}`
      : `${EMERGENCY_INFO.electionRestrictions.announcement.en}\n\n` +
      `📅 **Election Date:** ${EMERGENCY_INFO.electionRestrictions.date}\n` +
      `📰 **Event:** ${EMERGENCY_INFO.electionRestrictions.event}\n\n` +
      `🚫 **Restricted Vehicles:**\n` +
      `- Taxis: Feb 11 00:00 - Feb 12 00:00 (24 hours)\n` +
      `- Pickups: Feb 11 00:00 - Feb 12 00:00 (24 hours)\n` +
      `- Microbuses: Feb 11 00:00 - Feb 12 00:00 (24 hours)\n` +
      `- Trucks: Feb 11 00:00 - Feb 12 00:00 (24 hours)\n` +
      `- Motorcycles: Feb 10 00:00 - Feb 13 00:00 (72 hours)\n` +
      `- Watercraft: Feb 11 00:00 - Feb 12 00:00 (except fixed routes)\n\n` +
      `✅ **Exempted Vehicles:**\n` +
      EMERGENCY_INFO.electionRestrictions.exemptions.en.map(ex => `- ${ex}`).join('\n') + '\n\n' +
      `📞 **Election Commission Helpline:** ${EMERGENCY_INFO.numbers.electionCommission}\n` +
      `📚 **Source:** ${EMERGENCY_INFO.electionRestrictions.source}`;

    return electionResponse;
  }

  // Emergency Info Check
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
  let responseParts: string[] = [];

  // Parse location context if available
  let userNearbyStation: string | null = null;
  if (contextPart) {
    const match = contextPart.match(/near ([^(\[]+)/);
    if (match) userNearbyStation = match[1].trim();
  }

  if (isOffline) {
    responseParts.push(isBn
      ? "📡 **অফলাইন মোড:** আমি বর্তমানে আমার লোকাল ডাটাবেস ব্যবহার করছি। সকল তথ্য নির্ভুল।"
      : "📡 **Offline AI Mode:** I am using my local high-performance database. All transit data is verified.");
  }

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

  // 0. Check if user is responding affirmatively to a tour plan offer
  const { isAffirm, requestedDestination } = isAffirmativeResponse(query, chatHistory);
  if (isAffirm && requestedDestination) {
    const isBn = /[\u0980-\u09FF]/.test(query);
    const plan = getTourPlan(requestedDestination, isBn);
    if (plan) {
      return plan;
    }
  }

  // 0. Greeting / General
  if (lowerQuery.match(/^(hi|hello|hey|salam|help|assalamu|হাই|হেলো|সাহায্য|কি|কী)/)) {
    const isBn = /[\u0980-\u09FF]/.test(query);
    return isBn
      ? "👋 হ্যালো! আমি আপনার কই যাবো (Koy Jabo) এআই সহায়ক। আমি আপনাকে সাহায্য করতে পারি:\n- 🚌 **ঢাকার স্থানীয় বাস রুট** (যেমন: 'ফার্মগেট থেকে মিরপুর যেতে বাস')\n- 🚇 **মেট্রো রেল তথ্য** (যেমন: 'উত্তরা থেকে মতিঝিল মেট্রো')\n- 🚂 **আন্তঃজেলা (বাস/ট্রেন/বিমান/লঞ্চ)** (যেমন: 'ঢাকা থেকে বরিশাল')\n- 🗺️ **পর্যটন গাইড** (যেমন: 'কক্সবাজার কিভাবে যাব')\n\nআজ আপনাকে কিভাবে সাহায্য করতে পারি?"
      : "👋 Hello! I am your Koy Jabo Assistant. I can help you with:\n- 🚌 **Local Bus Routes** (e.g., 'Bus from Farmgate to Mirpur')\n- 🚇 **Metro Rail Info** (e.g., 'Metro from Uttara to Motijheel')\n- 🚂 **Intercity (Bus/Train/Air/Launch)** (e.g., 'Dhaka to Barishal')\n- 🗺️ **Tourist Guide** (e.g., 'How to reach Cox's Bazar')\n- 🗣️ **Banglish OK!** (e.g., 'farmgate theke mirpur bus ache?', 'ami gulshan jabo kivabe')\n\nHow can I help you today?";
  }

  // Priority checks for specific info types
  const touristInfo = findTouristInfo(query);
  if (touristInfo) {
    responseParts.push(touristInfo);

    // Check if we should offer a tour plan
    const { destination, offerMessage } = detectDestinationAndOfferPlan(query);
    if (destination && offerMessage) {
      responseParts.push(offerMessage);
    }
  }

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
      const busRes = findBusRoute(mentionedStations[0].name, mentionedStations[1].name, isBn);
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

  // 4. Check Train Info (Bangladesh Railway)
  const isTrainQuery = lowerQuery.includes('train') || lowerQuery.includes('ট্রেন') ||
    lowerQuery.includes('railway') || lowerQuery.includes('রেলওয়ে') ||
    lowerQuery.includes('express') || lowerQuery.includes('intercity') ||
    lowerQuery.includes('kamalapur') || lowerQuery.includes('কমলাপুর') ||
    Object.values(TRAIN_STATIONS).some(st =>
      lowerQuery.includes(normalize(st.name)) || lowerQuery.includes(normalize(st.bnName))
    );
  if (isTrainQuery) {
    const trainInfo = findTrainInfo(query);
    if (trainInfo) responseParts.push(trainInfo);
  }

  // 5. Check for Nearby / Current Location intent
  if (lowerQuery.includes("near me") || lowerQuery.includes("কাছে") || lowerQuery.includes("আশেপাশে") || lowerQuery.includes("nearby") || lowerQuery.includes("where am i")) {
    if (userNearbyStation) {
      responseParts.push(isBn
        ? `📍 আপনি বর্তমানে **${userNearbyStation}** এর কাছাকাছি আছেন। এখান থেকে আপনি ঢাকা শহরের প্রায় সব দিকেই বাস পাবেন।`
        : `📍 You are currently near **${userNearbyStation}**. This is a good spot to find buses to most parts of Dhaka.`);

      // Suggest buses from here
      const busesFromHere = BUS_DATA.filter(b => b.stops.some(s => s.toLowerCase().includes(userNearbyStation!.toLowerCase()))).slice(0, 5);
      if (busesFromHere.length > 0) {
        let busList = isBn ? `\n🚌 **এখানকার কিছু জনপ্রিয় বাস:**\n` : `\n🚌 **Popular buses from here:**\n`;
        busesFromHere.forEach(b => {
          busList += `- **${isBn && b.bnName ? b.bnName : b.name}**: ${b.routeString}\n`;
        });
        responseParts.push(busList);
      }
    } else {
      responseParts.push(isBn
        ? "📍 আপনার সঠিক অবস্থান জানতে পারছি না। কিন্তু আপনি 'মিরপুর', 'ফার্মগেট' বা 'বনানী' এর মতো এলাকার নাম লিখে সার্চ করতে পারেন।"
        : "📍 I couldn't determine your precise location. Try typing a nearby landmark like 'Mirpur', 'Farmgate', or 'Banani'.");
    }
  }

  // 6. Check Intercity
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
        // Assume user wants to GO TO this station. Use route planner if we have context.
        if (userNearbyStation) {
          const busRes = findBusRoute(userNearbyStation, targetStation.name, isBn);
          if (busRes) {
            responseParts.push(busRes);
          } else {
            // Fallback to simple listing if no route found
            const busesToTarget = BUS_DATA.filter(b => b.stops.some(s => s === targetStation.id || s === targetStation.name.toLowerCase()));
            if (busesToTarget.length > 0) {
              responseParts.push(isBn ? `🚌 **${displayName} পৌঁছাতে:**\nআপনি এই বাসগুলো ব্যবহার করতে পারেন:\n` : `🚌 **To reach ${displayName}:**\nYou can take these buses from various locations:\n`);
              busesToTarget.slice(0, 5).forEach(bus => {
                const busDisplayName = isBn && bus.bnName ? bus.bnName : bus.name;
                responseParts.push(`- **${busDisplayName}**: ${bus.routeString}`);
              });
            }
          }
        } else {
          // No user location context, just list buses
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
      // Check if it's an intercity location we recognize
      const mentionedIntercity = MAJOR_LOCATIONS.find(loc => {
        const enMatch = lowerQuery.includes(normalize(loc));
        const bnMatch = MAJOR_LOCATIONS_BN[loc] && lowerQuery.includes(normalize(MAJOR_LOCATIONS_BN[loc]));
        return enMatch || bnMatch;
      });

      const isBnFinal = /[\u0980-\u09FF]/.test(query);

      if (mentionedIntercity) {
        const displayName = isBnFinal && MAJOR_LOCATIONS_BN[mentionedIntercity] ? MAJOR_LOCATIONS_BN[mentionedIntercity] : mentionedIntercity;
        return isBnFinal
          ? `📍 **আন্তঃজেলা লোকেশন:** আমি বুঝতে পেরেছি আপনি **${displayName}** এর কথা বলছেন।\nরুট, সময় এবং ভাড়া জানতে লিখুন: "ঢাকা থেকে ${displayName}" বা "${displayName} যাতায়াত"।`
          : `📍 **Intercity Location:** I see you are asking about **${displayName}**. \nTo see available Bus, Train, and Flight routes, try: "Dhaka to ${displayName}" or "How to reach ${displayName}".`;
      }

      return isBnFinal
        ? "🤔 আমি আপনার উল্লেখিত স্থানটি বুঝতে পারছি না। দয়া করে নির্দিষ্ট স্টেশনের নাম (যেমন: ‘ফার্মগেট’, ‘মিরপুর’, ‘গুলশান’) অথবা আন্তঃজেলা ভ্রমণের জন্য জেলার নাম উল্লেখ করুন।"
        : "🤔 I couldn't understand that location. Please try mentioning specific stations like 'Farmgate', 'Mirpur', 'Gulshan' or district names for intercity travel.";
    }
  }

  let finalResponse = responseParts.join("\n\n");

  // Add traffic context
  finalResponse = addTrafficContext(finalResponse, isBn);

  // Add seasonal advice if destination mentioned
  for (const [key, destination] of Object.entries(TOURIST_DESTINATIONS)) {
    if (lowerQuery.includes(normalize(key)) || (destination.bn && lowerQuery.includes(normalize(destination.bn)))) {
      finalResponse += addSeasonalAdvice(isBn ? destination.bn : key, isBn);
      break;
    }
  }

  // Add random travel tip (33% chance)
  if (Math.random() < 0.33) {
    finalResponse += addTravelTips(query, isBn);
  }

  // === NEW: Smart Response Filtering ===
  finalResponse = filterSmartResponse(finalResponse, query, isBn);

  // Log query for learning
  learningSystem.logQuery(query, true);

  return finalResponse;
};

/**
 * Advanced filtering to provide more relevant and concise answers
 */
function filterSmartResponse(text: string, query: string, isBn: boolean): string {
    const lowerQuery = normalize(query);
    
    // 1. Detect Intent
    const isBus = lowerQuery.includes('bus') || lowerQuery.includes('বাস');
    const isTrain = lowerQuery.includes('train') || lowerQuery.includes('ট্রেন');
    const isFlight = lowerQuery.includes('flight') || lowerQuery.includes('plane') || lowerQuery.includes('বিমান');
    const isLaunch = lowerQuery.includes('launch') || lowerQuery.includes('লঞ্চ');
    const isFare = lowerQuery.includes('fare') || lowerQuery.includes('ভাড়া') || lowerQuery.includes('vara') || lowerQuery.includes('কত') || lowerQuery.includes('price');
    
    // Operators
    const operators = [
        { en: 'shohagh', bn: 'সোহাগ', name: 'Shohagh' },
        { en: 'hanif', bn: 'হানিফ', name: 'Hanif' },
        { en: 'shyamoli', bn: 'শ্যামলী', name: 'Shyamoli' },
        { en: 'green line', bn: 'গ্রীন লাইন', name: 'Green Line' },
        { en: 'eagle', bn: 'ঈগল', name: 'Eagle' },
        { en: 'ena', bn: 'এনা', name: 'Ena' },
        { en: 'london express', bn: 'লন্ডন এক্সপ্রেস', name: 'London Express' },
        { en: 'desh travels', bn: 'দেশ ট্রাভেলস', name: 'Desh Travels' }
    ];
    
    const requestedOperator = operators.find(op => lowerQuery.includes(op.en) || lowerQuery.includes(op.bn));
    const isNonAc = lowerQuery.includes('non ac') || lowerQuery.includes('নন এসি') || lowerQuery.includes('নন-এসি');
    const isAc = (lowerQuery.includes(' ac ') || lowerQuery.includes('এসি')) && !isNonAc;
    
    // 2. Slicing Logic
    const sections = text.split('\n\n');
    const routeHeader = sections[0]; // **Route: From to To**
    
    // Map icons to sections
    const busSection = sections.find(s => s.includes('🚌'));
    const trainSection = sections.find(s => s.includes('🚂'));
    const flightSection = sections.find(s => s.includes('🛫'));
    const launchSection = sections.find(s => s.includes('🚢'));
    const tipsSection = sections.find(s => s.includes('💡') || s.includes('🌆'));

    let filteredResponse = '';
    let foundSpecific = false;

    // Filter by mode
    if (isBus && busSection) {
        filteredResponse += (filteredResponse ? '\n\n' : '') + busSection;
        foundSpecific = true;
    }
    if (isTrain && trainSection) {
        filteredResponse += (filteredResponse ? '\n\n' : '') + trainSection;
        foundSpecific = true;
    }
    if (isFlight && flightSection) {
        filteredResponse += (filteredResponse ? '\n\n' : '') + flightSection;
        foundSpecific = true;
    }
    if (isLaunch && launchSection) {
        filteredResponse += (filteredResponse ? '\n\n' : '') + launchSection;
        foundSpecific = true;
    }

    // 3. Super-Specific Filtering (e.g. just a specific operator's fare)
    if (requestedOperator && isBus && busSection) {
        const fareLines = busSection.split('\n');
        const operatorMatch = fareLines.some(l => l.includes(requestedOperator.name));
        
        if (operatorMatch && isFare) {
            const nonAcFare = fareLines.find(l => l.includes('Non-AC') || l.includes('নন-এসি'));
            const acFare = fareLines.find(l => l.includes('AC Fare') || l.includes('এসি ভাড়া'));
            
            let specificAns = isBn 
                ? `🚌 **${requestedOperator.bn} পরিবহনের তথ্য:**\n`
                : `🚌 **${requestedOperator.name} Paribahan Info:**\n`;
                
            if (isNonAc && nonAcFare) specificAns += `${nonAcFare}\n`;
            else if (isAc && acFare) specificAns += `${acFare}\n`;
            else {
                if (nonAcFare) specificAns += `${nonAcFare}\n`;
                if (acFare) specificAns += `${acFare}\n`;
            }
            
            // Add operator list from section
            const opLine = fareLines.find(l => l.includes('Operators') || l.includes('অপারেটর'));
            if (opLine) specificAns += opLine;
            
            return `${routeHeader}\n\n${specificAns}${tipsSection ? '\n\n' + tipsSection : ''}`;
        }
    }

    // If we only found one specific mode, return just that + header
    if (foundSpecific) {
        const result = `${routeHeader}\n\n${filteredResponse}`;
        // Add tips if relevant
        return tipsSection ? `${result}\n\n${tipsSection}` : result;
    }

    return text; // Fallback to full response if not specific enough
}

// Keeping these for compatibility but making them no-ops or always true
export const canUseAiChat = () => true;
export const trackAiChatUsage = () => { };
