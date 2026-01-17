import { RouteResponse } from './types';
import { BRTC_DHAKA_INTERCITY, BRTC_REGIONAL_INTERCITY } from '../BRTC_INTERCITY_ROUTES_DATA';
import { DISTRICT_COORDINATES } from './constants';
import COMPREHENSIVE_ROUTES from '../data/comprehensive-bangladesh-intercity-routes.json';

interface Connectivity {
    bus: boolean;
    train: boolean;
    plane: boolean;
    boat: boolean;
}

const DISTRICT_CONNECTIVITY: { [key: string]: Connectivity } = {
    // Divisional Capitals & Major Hubs
    "Dhaka": { bus: true, train: true, plane: true, boat: true },
    "Chattogram": { bus: true, train: true, plane: true, boat: false },
    "Sylhet": { bus: true, train: true, plane: true, boat: false },
    "Rajshahi": { bus: true, train: true, plane: true, boat: false },
    "Khulna": { bus: true, train: true, plane: false, boat: true },
    "Barishal": { bus: true, train: false, plane: true, boat: true },
    "Rangpur": { bus: true, train: true, plane: false, boat: false },
    "Mymensingh": { bus: true, train: true, plane: false, boat: false },
    "Cox's Bazar": { bus: true, train: true, plane: true, boat: true },
    "Saidpur": { bus: true, train: true, plane: true, boat: false },
    "Jashore": { bus: true, train: true, plane: true, boat: false },
    "Bogura": { bus: true, train: true, plane: false, boat: false },
    "Chandpur": { bus: true, train: true, plane: false, boat: true },
    "Bhola": { bus: true, train: false, plane: false, boat: true },
    "Patuakhali": { bus: true, train: false, plane: false, boat: true }, // For Kuakata
    "Kuakata": { bus: true, train: false, plane: false, boat: true }, // Added Kuakata
    "Pirojpur": { bus: true, train: false, plane: false, boat: true },
    "Barguna": { bus: true, train: false, plane: false, boat: true },
    "Jhalokati": { bus: true, train: false, plane: false, boat: true },
    "Noakhali": { bus: true, train: true, plane: false, boat: false },
    "Cumilla": { bus: true, train: true, plane: false, boat: false },
    "Feni": { bus: true, train: true, plane: false, boat: false },
    "Brahmanbaria": { bus: true, train: true, plane: false, boat: true }, // Launch via trawler sometimes/train main
    "Kushtia": { bus: true, train: true, plane: false, boat: false }, // Bus via bridge
    "Pabna": { bus: true, train: true, plane: true, boat: false }, // Ishwardi Airport nearby
    "Dinajpur": { bus: true, train: true, plane: false, boat: false },
    "Jamalpur": { bus: true, train: true, plane: false, boat: false },
    "Kishoreganj": { bus: true, train: true, plane: false, boat: false },
    "Tangail": { bus: true, train: true, plane: false, boat: false },
    "Natore": { bus: true, train: true, plane: false, boat: false },
    "Gaibandha": { bus: true, train: true, plane: false, boat: false },
    "Kurigram": { bus: true, train: true, plane: false, boat: false },
    "Panchagarh": { bus: true, train: true, plane: false, boat: false },
    "Thakurgaon": { bus: true, train: true, plane: false, boat: false },
    "Saint Martin's Island": { bus: false, train: false, plane: false, boat: true },
    "Benapole": { bus: true, train: true, plane: false, boat: false },
    "Rajbari": { bus: true, train: true, plane: false, boat: false },
    "Paturia": { bus: true, train: false, plane: false, boat: true },
    "Aricha": { bus: true, train: false, plane: false, boat: true },
    "Faridpur": { bus: true, train: true, plane: false, boat: false },
    "Gopalganj": { bus: true, train: true, plane: false, boat: false },
    "Madaripur": { bus: true, train: false, plane: false, boat: true },
    "Shariatpur": { bus: true, train: false, plane: false, boat: true },
    "Munshiganj": { bus: true, train: false, plane: false, boat: true },
    "Manikganj": { bus: true, train: false, plane: false, boat: false },
    "Gazipur": { bus: true, train: true, plane: false, boat: false },
    "Narayanganj": { bus: true, train: true, plane: false, boat: true },
    "Narsingdi": { bus: true, train: true, plane: false, boat: false },
    "Sirajganj": { bus: true, train: true, plane: false, boat: false },
    "Chapainawabganj": { bus: true, train: true, plane: false, boat: false },
    "Naogaon": { bus: true, train: true, plane: false, boat: false },
    "Joypurhat": { bus: true, train: true, plane: false, boat: false },
    "Nilphamari": { bus: true, train: true, plane: true, boat: false }, // Saidpur is here
    "Lalmonirhat": { bus: true, train: true, plane: false, boat: false },
    "Habiganj": { bus: true, train: true, plane: false, boat: false },
    "Moulvibazar": { bus: true, train: true, plane: false, boat: false }, // Srimangal
    "Sunamganj": { bus: true, train: false, plane: false, boat: false }, // Boat in haor but not launch to Dhaka per se
    "Lakshmipur": { bus: true, train: false, plane: false, boat: true },
    "Khagrachari": { bus: true, train: false, plane: false, boat: false },
    "Rangamati": { bus: true, train: false, plane: false, boat: true }, // Boat within
    "Bandarban": { bus: true, train: false, plane: false, boat: false },
    "Netrokona": { bus: true, train: true, plane: false, boat: false },
    "Sherpur": { bus: true, train: false, plane: false, boat: false },
    "Satkhira": { bus: true, train: false, plane: false, boat: false },
    "Bagerhat": { bus: true, train: false, plane: false, boat: false },
    "Narail": { bus: true, train: false, plane: false, boat: false },
    "Meherpur": { bus: true, train: false, plane: false, boat: false },
    "Chuadanga": { bus: true, train: true, plane: false, boat: false },
    "Magura": { bus: true, train: false, plane: false, boat: false },
    "Jhenaidah": { bus: true, train: false, plane: false, boat: false },
};
const DEFAULT_CONNECTIVITY: Connectivity = { bus: true, train: false, plane: false, boat: false };

const getConnectivity = (district: string): Connectivity => {
    return DISTRICT_CONNECTIVITY[district] || DEFAULT_CONNECTIVITY;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};

const findBrtcRoutes = (from: string, to: string) => {
    const allBrtc = [...BRTC_DHAKA_INTERCITY, ...BRTC_REGIONAL_INTERCITY];
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();

    return allBrtc.filter(route => {
        const text = (route.name + ' ' + route.routeString + ' ' + route.stops.join(' ')).toLowerCase();
        return text.includes(fromLower) && text.includes(toLower);
    });
};

const MAJOR_HUBS = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Jashore", "Bogura", "Cumilla", "Feni", "Bhairab", "Dinajpur", "Panchagarh"];

// --- DETAILED ROUTE DATA ---

const TRAIN_ROUTES = [
    // --- MAJOR INTERCITY & FAST TRAINS ---
    { from: "Dhaka", to: "Chattogram", trains: ["Subarna Express", "Sonar Bangla Express (Non-Stop)", "Turna Express (Night)", "Mohanagar Goduli", "Chattala Express", "Cox's Bazar Express", "Parjatak Express", "Dhaka Mail", "Karnaphuli Express", "Chittagong Mail"], fare: "400-1500" },
    { from: "Dhaka", to: "Sylhet", trains: ["Upaban Express", "Jayantika Express", "Kalni Express", "Parabat Express", "Surma Mail", "Jalalabad Express"], fare: "350-1200" },
    { from: "Dhaka", to: "Rajshahi", trains: ["Silk City", "Padma Express", "Dhumketu Express", "Banalata Express (Non-Stop)", "Modhumati Express"], fare: "350-1200" },
    { from: "Dhaka", to: "Khulna", trains: ["Sundarban Express", "Chitra Express", "Nakshikantha Express"], fare: "505-1500" },
    { from: "Dhaka", to: "Rangpur", trains: ["Rangpur Express", "Kurigram Express", "Burimari Express"], fare: "500-1500" },
    { from: "Dhaka", to: "Cox's Bazar", trains: ["Cox's Bazar Express", "Parjatak Express"], fare: "700-2400" },
    { from: "Dhaka", to: "Panchagarh", trains: ["Ekota Express", "Drutojan Express", "Panchagarh Express (Non-Stop)"], fare: "600-1800" },
    { from: "Dhaka", to: "Noakhali", trains: ["Upakul Express", "Noakhali Express", "Dhaka Express"], fare: "350-1100" },
    { from: "Dhaka", to: "Kishoreganj", trains: ["Egarosindhur Provati", "Egarosindhur Godhuli", "Kishoreganj Express", "Isha Khan Express"], fare: "150-500" },
    { from: "Dhaka", to: "Mymensingh", trains: ["Tista Express", "Agnibina Express", "Brahmaputra Express", "Jamuna Express", "Mohanganj Express", "Haor Express", "Balaka Commuter", "Vawall Express", "Mymensingh Express"], fare: "150-600" },
    { from: "Dhaka", to: "Netrokona", trains: ["Haor Express", "Mohanganj Express", "Mahua Express"], fare: "250-800" },
    { from: "Dhaka", to: "Dinajpur", trains: ["Ekota Express", "Drutojan Express", "Nilsagar Express"], fare: "500-1500" },
    { from: "Dhaka", to: "Lalmonirhat", trains: ["Lalmoni Express", "Burimari Express"], fare: "500-1500" },
    { from: "Dhaka", to: "Chandpur", trains: ["Meghna Express"], fare: "200-600" },
    { from: "Dhaka", to: "Brahmanbaria", trains: ["Titas Commuter", "Mahanagar Express", "Sylhet/Ctg Bound Trains"], fare: "120-600" },
    { from: "Dhaka", to: "Jamalpur", trains: ["Tista Express", "Jamuna Express", "Agnibina Express", "Jamalpur Express", "Brahmaputra Express"], fare: "200-600" },
    { from: "Dhaka", to: "Faridpur", trains: ["Madhumati Express", "Rupashi Bangla Express (Fast)"], fare: "300-800" },
    { from: "Dhaka", to: "Chilahati", trains: ["Nilsagar Express", "Chilahati Express"], fare: "500-1600" },
    { from: "Dhaka", to: "Sirajganj", trains: ["Sirajganj Express"], fare: "250-700" },
    { from: "Dhaka", to: "Chapainawabganj", trains: ["Banalata Express", "Mahananda Express"], fare: "400-1300" },
    { from: "Dhaka", to: "Burimari", trains: ["Burimari Express (Direct/Shuttle via Lalmonirhat)"], fare: "600-1600" },
    { from: "Dhaka", to: "Gopalganj", trains: ["Tungipara Express"], fare: "300-900" },
    { from: "Dhaka", to: "Dewanganj", trains: ["Tista Express", "Dewanganj Commuter"], fare: "200-700" },
    { from: "Dhaka", to: "Nilphamari", trains: ["Nilsagar Express", "Chilahati Express"], fare: "500-1500" },
    { from: "Dhaka", to: "Natore", trains: ["Lalmoni Express", "Rangpur Express", "Burimari Express", "Drutojan Express"], fare: "300-900" },
    { from: "Dhaka", to: "Pabna", trains: ["Dhaka-Pabna Express"], fare: "350-1000" },
    { from: "Dhaka", to: "Kushtia", trains: ["Sundarban Express", "Chitra Express (Nearby Poradaha)"], fare: "400-1200" },
    // --- REGIONAL & LOCAL CONNECTIONS ---
    { from: "Chattogram", to: "Sylhet", trains: ["Paharika Express", "Udayan Express", "Jalalabad Express"], fare: "400-1200" },
    { from: "Chattogram", to: "Chandpur", trains: ["Meghna Express", "Sagarika Express"], fare: "150-500" },
    { from: "Chattogram", to: "Mymensingh", trains: ["Bijoy Express"], fare: "400-1000" },
    { from: "Chattogram", to: "Jamalpur", trains: ["Bijoy Express"], fare: "450-1100" },
    { from: "Chattogram", to: "Noakhali", trains: ["Sagarika Express"], fare: "100-400" },
    { from: "Chattogram", to: "Cumilla", trains: ["Paharika/Udayan/Mahanagar/Turna"], fare: "150-500" },
    { from: "Khulna", to: "Rajshahi", trains: ["Kapotaksha Express", "Sagardari Express", "Mahananda Express"], fare: "300-800" },
    { from: "Khulna", to: "Saidpur", trains: ["Rupsha Express", "Simanta Express"], fare: "400-1200" },
    { from: "Khulna", to: "Goalanda Ghat", trains: ["Nakshikantha Express"], fare: "150-500" },
    { from: "Benapole", to: "Mongla", trains: ["Mongla Commuter"], fare: "100-300" },
    { from: "Benapole", to: "Dhaka", trains: ["Benapole Express", "Rupashi Bangla Express (via Padma Bridge)"], fare: "455-1500" },
    { from: "Rajshahi", to: "Panchagarh", trains: ["Banglabandha Express"], fare: "300-1000" },
    { from: "Rajshahi", to: "Chilahati", trains: ["Barendra Express", "Titumir Express"], fare: "250-800" },
    { from: "Sylhet", to: "Akhaura", trains: ["Jalalabad Express", "Surma Mail", "Sylhet Bound Intercity"], fare: "100-400" },
    { from: "Mymensingh", to: "Bhairab", trains: ["Isha Khan Express", "Local Trains"], fare: "50-150" },
    { from: "Mymensingh", to: "Mohanganj", trains: ["Mymensingh Express", "Local Trains"], fare: "40-120" },
    { from: "Parbatipur", to: "Panchagarh", trains: ["Kanchan Express", "Ramsagor Express"], fare: "50-150" },
    { from: "Santahar", to: "Burimari", trains: ["Korotoa Express"], fare: "150-400" },
    // --- CROSS BORDER (INDIA) ---
    { from: "Dhaka", to: "Kolkata", trains: ["Maitree Express"], fare: "2500+" },
    { from: "Khulna", to: "Kolkata", trains: ["Bandhan Express"], fare: "1500+" },
    { from: "Dhaka", to: "New Jalpaiguri", trains: ["Mitali Express"], fare: "3000+" },
];

const AIR_ROUTES = [
    { from: "Dhaka", to: "Chattogram", airlines: ["Biman", "US-Bangla", "Novoair", "Air Astra"], time: "45m", fare: "3500-8000" },
    { from: "Dhaka", to: "Cox's Bazar", airlines: ["Biman", "US-Bangla", "Novoair", "Air Astra"], time: "1h", fare: "4500-12000" },
    { from: "Dhaka", to: "Sylhet", airlines: ["Biman", "US-Bangla", "Novoair", "Air Astra"], time: "45m", fare: "3500-7500" },
    { from: "Dhaka", to: "Saidpur", airlines: ["Biman", "US-Bangla", "Novoair", "Air Astra"], time: "50m", fare: "3800-8500" },
    { from: "Dhaka", to: "Jashore", airlines: ["Biman", "US-Bangla", "Novoair"], time: "40m", fare: "3200-7000" },
    { from: "Dhaka", to: "Barishal", airlines: ["Biman", "US-Bangla", "Novoair"], time: "30m", fare: "3000-6000" },
    { from: "Dhaka", to: "Rajshahi", airlines: ["Biman", "US-Bangla", "Novoair"], time: "40m", fare: "3500-7500" },
    { from: "Chattogram", to: "Dhaka", airlines: ["Biman", "US-Bangla", "Novoair"], time: "45m", fare: "3500-8000" },
    { from: "Sylhet", to: "Dhaka", airlines: ["Biman", "US-Bangla", "Novoair"], time: "45m", fare: "3500-7500" },
    { from: "Cox's Bazar", to: "Dhaka", airlines: ["Biman", "US-Bangla", "Novoair"], time: "1h", fare: "4500-12000" }
];

const LAUNCH_ROUTES = [
    { from: "Dhaka", to: "Barishal", operators: ["Sundarban", "Surovi", "Parabat", "Manami", "Kirtonkhola"], time: "Overnight/6-8h", fare: "300 (Deck) - 5000 (VIP Room)" },
    { from: "Dhaka", to: "Bhola", operators: ["Karnaphuli", "Crystal", "Prince Awlad", "Green Line (Water Bus)"], time: "5-6h", fare: "300-1500" },
    { from: "Dhaka", to: "Patuakhali", operators: ["Sundarban", "Kamal Khan", "Sattar Khan"], time: "10-12h", fare: "400-3000" },
    { from: "Dhaka", to: "Chandpur", operators: ["Mayur", "Sonartori", "Bogdad", "Imam Hasan"], time: "3-4h", fare: "150-500" },
    { from: "Dhaka", to: "Hatiya", operators: ["Farhan", "Tasrif"], time: "12h+", fare: "500-3000" },
    { from: "Dhaka", to: "Shariatpur", operators: ["Sureshwar Launch"], time: "4-5h", fare: "150-400" },
    { from: "Dhaka", to: "Kuakata", operators: ["Sundarban (Direct) - Seasonal"], time: "12-14h", fare: "500-3000" },
];

const BUS_ROUTES_MAJOR = [
    { from: "Dhaka", to: "Cox's Bazar", buses: ["Green Line (Scania/Double Decker)", "Shohagh", "Hanif", "Shyamoli", "Desh Travels", "Saintmartin Paribahan", "Relax Transport"], fare: "900-2500" },
    { from: "Dhaka", to: "Chattogram", buses: ["Green Line", "Saudia", "Hanif", "Shyamoli", "Ena", "Shohagh", "Tisha"], fare: "680-1500" },
    { from: "Dhaka", to: "Sylhet", buses: ["Green Line", "Ena", "London Express", "Hanif", "Shyamoli", "Al-Mobaraka"], fare: "570-1400" },
    { from: "Dhaka", to: "Khulna", buses: ["Shohagh", "Hanif", "Green Line", "Tungipara Express", "Falguni"], fare: "700-1400" },
    { from: "Dhaka", to: "Rajshahi", buses: ["Desh Travels", "National Travels", "Hanif", "Shyamoli", "Grameen Travels"], fare: "600-1300" },
    { from: "Dhaka", to: "Barishal", buses: ["Sakura", "Hanif", "Shyamoli", "Drutish"], fare: "500-1000" },
    { from: "Dhaka", to: "Rangpur", buses: ["Nabil", "SR Travels", "Hanif", "Agomony", "Dipjol"], fare: "700-1400" },
    { from: "Dhaka", to: "Benapole", buses: ["Green Line", "Shohagh", "Hanif", "Shyamoli", "Royal"], fare: "600-1400" },
    { from: "Dhaka", to: "Kolkata", buses: ["Green Line", "Shohagh", "Shyamoli", "Maitree (BRTC)"], fare: "1800-2400 (Direct)" },
    { from: "Dhaka", to: "Bandarban", buses: ["Hanif", "Shyamoli", "Saintmartin Paribahan", "Dolphin"], fare: "900-1800" },
    { from: "Dhaka", to: "Rangamati", buses: ["Hanif", "Shyamoli", "Dolphin", "S.Alam"], fare: "900-1800" },
    { from: "Dhaka", to: "Khagrachari", buses: ["Shanti Paribahan", "S.Alam", "Shyamoli", "Hanif"], fare: "850-1600" },
    { from: "Dhaka", to: "Kushtia", buses: ["SB Super Deluxe", "Hanif", "Shyamoli"], fare: "600-1000" },
];

// --- HELPERS ---

const getTrainInfo = (from: string, to: string) => TRAIN_ROUTES.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));
const getAirInfo = (from: string, to: string) => AIR_ROUTES.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));
const getLaunchInfo = (from: string, to: string) => LAUNCH_ROUTES.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));
const getBusInfo = (from: string, to: string) => BUS_ROUTES_MAJOR.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));

export const getOfflineIntercityData = (from: string, to: string, lang: 'en' | 'bn' = 'en'): RouteResponse => {
    const connFrom = getConnectivity(from);
    const connTo = getConnectivity(to);
    const coordFrom = DISTRICT_COORDINATES[from];
    const coordTo = DISTRICT_COORDINATES[to];

    let distance = 0;
    if (coordFrom && coordTo) {
        distance = calculateDistance(coordFrom[0], coordFrom[1], coordTo[0], coordTo[1]);
    }

    const brtcRoutes = findBrtcRoutes(from, to);
    const trainInfo = getTrainInfo(from, to);
    const airInfo = getAirInfo(from, to);
    const launchInfo = getLaunchInfo(from, to);
    const busInfo = getBusInfo(from, to);
    const isBn = lang === 'bn';

    // Get comprehensive data
    const comprehensiveRoutes = (COMPREHENSIVE_ROUTES as any).routes.filter((r: any) =>
        (r.origin.toLowerCase().includes(from.toLowerCase()) && r.destination.toLowerCase().includes(to.toLowerCase())) ||
        (r.origin.toLowerCase().includes(to.toLowerCase()) && r.destination.toLowerCase().includes(from.toLowerCase()))
    );

    let result = '';

    if (isBn) {
        result = `**রুট: ${from} থেকে ${to}**  \n`;
        result += `**দূরত্ব:** ${distance > 0 ? distance + ' কিমি (আকাশপথ)' : 'তথ্য নেই'}  \n\n`;

        // 1. Bus (BRTC + Private)
        result += `### 🚌 বাস সার্ভিস:  \n`;
        if (busInfo) {
            result += `**জনপ্রিয় অপারেটর:** ${busInfo.buses.join(', ')}।  \n**ভাড়া:** ${busInfo.fare} টাকা।  \n`;
        }
        if (brtcRoutes.length > 0) {
            result += `**বিআরটিসি (BRTC):**  \n`;
            brtcRoutes.forEach(br => {
                result += `- ${br.bnName} (${br.type}) - ${br.hours}  \n`;
            });
        }
        if (!busInfo && brtcRoutes.length === 0 && comprehensiveRoutes.length === 0) {
            result += `ভাড়া: ${Math.max(150, Math.ceil(distance * 3))}-১,২০০ টাকা (আনুমানিক)।  \nলোকাল এবং আন্তঃজেলা বাস টার্মিনাল থেকে নিয়মিত বাস পাওয়া যায়।  \n`;
        } else if (comprehensiveRoutes.length > 0) {
            result += `**উপলব্ধ রুট:** ${comprehensiveRoutes.length}টি রুট পাওয়া গেছে।  \n`;
            comprehensiveRoutes.slice(0, 3).forEach((r: any) => {
                result += `- ${r.operator || 'বাস'} (${r.type || 'Non-AC'}) - ৳${r.fare || 'তথ্য নেই'}  \n`;
            });
        }
        result += `\n`;

        // 2. Train
        if (trainInfo) {
            result += `### 🚂 রেলওয়ে (ট্রেন):  \n`;
            result += `**ট্রেনের নাম:** ${trainInfo.trains.join(', ')}।  \n**ভাড়া:** ${trainInfo.fare} টাকা।  \nসময়: ${Math.max(2, Math.ceil(distance / 55))} ঘণ্টা (আনুমানিক)।  \n\n`;
        } else if (connFrom.train && connTo.train) {
            result += `### 🚂 রেলওয়ে (ট্রেন):  \n`;
            result += `সরাসরি ট্রেন নেই তবে সংযোগ ট্রেন ব্যবহার করে যাওয়া সম্ভব হতে পারে।  \n\n`;
        }

        // 3. Air
        if (airInfo) {
            result += `### ✈️ আকাশপথ (ফ্লাইট):  \n`;
            result += `**এয়ারলাইন্স:** ${airInfo.airlines.join(', ')}।  \n**সময়:** ${airInfo.time}। **ভাড়া:** ${airInfo.fare} টাকা।  \n\n`;
        } else if (connFrom.plane && connTo.plane) {
            result += `### ✈️ আকাশপথ (ফ্লাইট):  \n`;
            result += `সরাসরি ফ্লাইট নেই। ঢাকা হয়ে কানেক্টিং ফ্লাইট চেক করুন।  \n\n`;
        }

        // 4. Boat/Launch
        if (launchInfo) {
            result += `### 🚢 নৌপথ (লঞ্চ/জাহাজ):  \n`;
            result += `**টার্মিনাল:** সদরঘাট (ঢাকা) বা স্থানীয় ঘাট।  \n**লঞ্চসমূহ:** ${launchInfo.operators.join(', ')}।  \n**সময়:** ${launchInfo.time}। **ভাড়া:** ${launchInfo.fare} টাকা।  \n\n`;
        } else if (connTo.boat && (from === 'Dhaka' || connFrom.boat)) {
            result += `### 🚢 নৌপথ:  \nএই রুটে নৌযান চলাচল করতে পারে। স্থানীয় ঘাটে খোঁজ নিন।  \n\n`;
        }

        // Via Hub Logic
        if (!busInfo && !trainInfo && distance > 200 && from !== "Dhaka" && to !== "Dhaka") {
            result += `💡 **পরামর্শ (ভায়া ঢাকা):** সরাসরি ভালো সার্ভিস না থাকলে, প্রথমে **ঢাকা** এসে তারপর **${to}** এর বাস/ট্রেন/ফ্লাইট নেওয়া সুবিধাজনক হতে পারে।  \n\n`;
        }

    } else {
        // ENGLISH
        result = `**Route: ${from} to ${to}**  \n`;
        result += `**Distance:** ${distance > 0 ? distance + ' km (Great-circle)' : 'N/A'}  \n\n`;

        // 1. Bus
        result += `### 🚌 Bus Services:  \n`;
        if (busInfo) {
            result += `**Operators:** ${busInfo.buses.join(', ')}.  \n**Fare:** ${busInfo.fare} BDT.  \n`;
        }
        if (brtcRoutes.length > 0) {
            result += `**BRTC:**  \n`;
            brtcRoutes.forEach(br => {
                result += `- ${br.name} (${br.type}) - ${br.hours}  \n`;
            });
        }
        if (!busInfo && brtcRoutes.length === 0 && comprehensiveRoutes.length === 0) {
            result += `**Fare:** ${Math.max(150, Math.ceil(distance * 3))}-1,200 BDT (Est).  \nAvailable from regional terminals.  \n`;
        } else if (comprehensiveRoutes.length > 0) {
            result += `**Available Routes:** Found ${comprehensiveRoutes.length} specific routes.  \n`;
            comprehensiveRoutes.slice(0, 3).forEach((r: any) => {
                result += `- ${r.operator || 'Bus'} (${r.type || 'Non-AC'}) - ৳${r.fare || 'N/A'}  \n`;
            });
        }
        result += `\n`;

        // 2. Train
        if (trainInfo) {
            result += `### 🚂 Railway (Train):  \n`;
            result += `**Trains:** ${trainInfo.trains.join(', ')}.  \n**Fare:** ${trainInfo.fare} BDT.  \n**Time:** ${Math.max(2, Math.ceil(distance / 55))} h (Approx).  \n\n`;
        }

        // 3. Air
        if (airInfo) {
            result += `### ✈️ Air (Flight):  \n`;
            result += `**Airlines:** ${airInfo.airlines.join(', ')}.  \n**Time:** ${airInfo.time}. **Fare:** ${airInfo.fare} BDT.  \n\n`;
        }

        // 4. Boat
        if (launchInfo) {
            result += `### 🚢 Waterway (Launch/Ship):  \n`;
            result += `**Terminal:** Sadarghat (Dhaka) or local.  \n**Operators:** ${launchInfo.operators.join(', ')}.  \n**Time:** ${launchInfo.time}. **Fare:** ${launchInfo.fare} BDT.  \n\n`;
        }

        // Special Tips
        if (!busInfo && !trainInfo && distance > 200 && from !== "Dhaka" && to !== "Dhaka") {
            result += `💡 **Tip:** If direct transport is rare, travel via **Dhaka** for better connectivity.  \n\n`;
        }
    }

    return {
        from,
        to,
        date: new Date().toISOString().split('T')[0],
        source: 'local_search',
        result
    };
};
