import { EnhancedIntercityResponse, BusOption, TrainOption, FlightOption, DrivingInfo, TravelTips } from './types';
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
    // --- FROM DHAKA ---
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
    { from: "Dhaka", to: "Bogura", buses: ["Hanif", "SR Travels", "Shyamoli", "Nabil", "National Travels"], fare: "500-1000" },
    { from: "Dhaka", to: "Dinajpur", buses: ["Hanif", "Nabil", "SR Travels", "Dipjol"], fare: "600-1200" },
    { from: "Dhaka", to: "Faridpur", buses: ["Shohagh", "Hanif", "Local buses (Gulistan)"], fare: "300-600" },
    { from: "Dhaka", to: "Cumilla", buses: ["Hanif", "Shyamoli", "Ena", "Tisha", "Sonar Bangla"], fare: "250-500" },
    { from: "Dhaka", to: "Noakhali", buses: ["Hanif", "Shyamoli", "Ena"], fare: "350-600" },
    { from: "Dhaka", to: "Feni", buses: ["Hanif", "Shyamoli", "Ena", "Green Line"], fare: "300-550" },
    { from: "Dhaka", to: "Jashore", buses: ["Shohagh", "Hanif", "Green Line", "Shyamoli"], fare: "600-1200" },
    { from: "Dhaka", to: "Mymensingh", buses: ["Shohagh", "Ena", "Local buses (Mohakhali)"], fare: "200-400" },
    { from: "Dhaka", to: "Tangail", buses: ["Shohagh", "Local buses (Mohakhali/Kalyanpur)"], fare: "150-300" },
    { from: "Dhaka", to: "Narayanganj", buses: ["Local buses (Gulistan)"], fare: "50-100" },
    // --- FROM CHATTOGRAM ---
    { from: "Chattogram", to: "Cox's Bazar", buses: ["S.Alam", "Shohagh", "Green Line", "Desh Travels", "Hanif", "Modern Line", "Soudia"], fare: "300-700" },
    { from: "Chattogram", to: "Bandarban", buses: ["Purbani", "Purabi", "Dolphin", "Local buses (Dampara Terminal)"], fare: "180-350" },
    { from: "Chattogram", to: "Rangamati", buses: ["BRTC", "Local buses (New Bridge Terminal)", "Dolphin"], fare: "200-400" },
    { from: "Chattogram", to: "Khagrachari", buses: ["Shanti Paribahan", "Local buses (New Bridge Terminal)"], fare: "150-300" },
    { from: "Chattogram", to: "Cumilla", buses: ["Hanif", "Shyamoli", "Green Line", "Ena", "Tisha"], fare: "200-400" },
    { from: "Chattogram", to: "Feni", buses: ["Hanif", "Shyamoli", "Local buses"], fare: "100-200" },
    { from: "Chattogram", to: "Noakhali", buses: ["Local buses", "BRTC"], fare: "120-250" },
    { from: "Chattogram", to: "Sylhet", buses: ["Hanif", "Shyamoli", "Green Line", "Ena"], fare: "500-1000" },
    // --- CHITTAGONG HILL TRACTS INTERNAL ---
    { from: "Bandarban", to: "Cox's Bazar", buses: ["Local buses (via Chokoria)", "Shared Jeep/Microbus (চাঁদের গাড়ি)"], fare: "150-300" },
    { from: "Bandarban", to: "Chattogram", buses: ["Purbani", "Purabi", "Dolphin", "Local buses"], fare: "180-350" },
    { from: "Rangamati", to: "Chattogram", buses: ["BRTC", "Local buses (New Bridge Terminal)"], fare: "200-400" },
    { from: "Khagrachari", to: "Chattogram", buses: ["Shanti Paribahan", "Local buses"], fare: "150-300" },
    // --- COX'S BAZAR AREA ---
    { from: "Cox's Bazar", to: "Teknaf", buses: ["Local buses", "Shared transport"], fare: "80-150" },
    { from: "Cox's Bazar", to: "Chattogram", buses: ["S.Alam", "Shohagh", "Green Line", "Hanif", "Modern Line"], fare: "300-700" },
    // --- KHULNA DIVISION ---
    { from: "Khulna", to: "Barishal", buses: ["Shohagh", "Hanif", "Local buses"], fare: "300-500" },
    { from: "Khulna", to: "Satkhira", buses: ["Shohagh", "Local buses"], fare: "150-300" },
    { from: "Khulna", to: "Jashore", buses: ["Shohagh", "Hanif", "Local buses"], fare: "100-200" },
    { from: "Jashore", to: "Benapole", buses: ["Local buses", "BRTC"], fare: "50-100" },
    // --- SYLHET DIVISION ---
    { from: "Sylhet", to: "Sunamganj", buses: ["Local buses"], fare: "80-180" },
    { from: "Sylhet", to: "Habiganj", buses: ["Local buses", "Hanif"], fare: "100-200" },
    { from: "Sylhet", to: "Moulvibazar", buses: ["Local buses", "Hanif"], fare: "100-200" },
    { from: "Sylhet", to: "Brahmanbaria", buses: ["Hanif", "Shyamoli", "Local buses"], fare: "250-450" },
    // --- RAJSHAHI DIVISION ---
    { from: "Rajshahi", to: "Chapainawabganj", buses: ["Local buses", "BRTC"], fare: "80-150" },
    { from: "Rajshahi", to: "Naogaon", buses: ["Local buses"], fare: "100-200" },
    { from: "Rajshahi", to: "Bogura", buses: ["Hanif", "Local buses"], fare: "200-400" },
    { from: "Rajshahi", to: "Pabna", buses: ["Local buses"], fare: "150-250" },
    // --- RANGPUR DIVISION ---
    { from: "Rangpur", to: "Dinajpur", buses: ["Hanif", "Local buses"], fare: "150-250" },
    { from: "Rangpur", to: "Bogura", buses: ["Nabil", "SR Travels", "Local buses"], fare: "200-350" },
    { from: "Bogura", to: "Dinajpur", buses: ["Local buses", "Hanif"], fare: "200-350" },
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
        (r.origin.toLowerCase() === from.toLowerCase() && r.destination.toLowerCase() === to.toLowerCase()) ||
        (r.origin.toLowerCase() === to.toLowerCase() && r.destination.toLowerCase() === from.toLowerCase())
    );

    // Fallback search if exact match fails
    const partialRoutes = comprehensiveRoutes.length > 0 ? [] : (COMPREHENSIVE_ROUTES as any).routes.filter((r: any) =>
        (r.origin.toLowerCase().includes(from.toLowerCase()) && r.destination.toLowerCase().includes(to.toLowerCase())) ||
        (r.origin.toLowerCase().includes(to.toLowerCase()) && r.destination.toLowerCase().includes(from.toLowerCase()))
    );

    const routesToDisplay = comprehensiveRoutes.length > 0 ? comprehensiveRoutes : partialRoutes;

    let result = '';

    // Boarding terminal lookup helper
    const getBoardingTerminal = (origin: string, dest: string, bn: boolean): string => {
        if (origin !== 'Dhaka') return bn ? `${origin} বাস টার্মিনাল` : `${origin} Bus Terminal`;
        const gabtoli = ['Rajshahi', 'Chapainawabganj', 'Pabna', 'Kushtia', 'Jashore', 'Khulna', 'Satkhira', 'Benapole', 'Faridpur', 'Gopalganj', 'Madaripur', 'Rajbari'];
        const sayedabad = ['Barishal', 'Patuakhali', 'Bhola', 'Chandpur', 'Lakshmipur', 'Noakhali', 'Feni', 'Cumilla', 'Chattogram', "Cox's Bazar", 'Bandarban', 'Rangamati', 'Khagrachari', 'Teknaf'];
        const mohakhaliN = ['Rangpur', 'Dinajpur', 'Bogura', 'Gaibandha', 'Kurigram', 'Nilphamari', 'Lalmonirhat', 'Saidpur', 'Panchagarh', 'Thakurgaon', 'Joypurhat', 'Naogaon'];
        const mohakhali = ['Sylhet', 'Brahmanbaria', 'Habiganj', 'Moulvibazar', 'Sunamganj', 'Kishoreganj', 'Narsingdi', 'Mymensingh', 'Netrokona', 'Sherpur', 'Jamalpur', 'Tangail', 'Gazipur'];
        if (gabtoli.includes(dest)) return bn ? 'গাবতলী বাস টার্মিনাল, ঢাকা' : 'Gabtoli Bus Terminal, Dhaka';
        if (sayedabad.includes(dest)) return bn ? 'সায়েদাবাদ বাস টার্মিনাল, ঢাকা' : 'Sayedabad Bus Terminal, Dhaka';
        if (mohakhaliN.includes(dest)) return bn ? 'কল্যাণপুর / মহাখালী বাস টার্মিনাল, ঢাকা' : 'Kalyanpur / Mohakhali Bus Terminal, Dhaka';
        if (mohakhali.includes(dest)) return bn ? 'মহাখালী বাস টার্মিনাল, ঢাকা' : 'Mohakhali Bus Terminal, Dhaka';
        return bn ? 'নিকটস্থ বাস টার্মিনাল' : 'Nearest Bus Terminal';
    };

    // Available modes
    const availableModesArr: string[] = [];
    if (connTo.bus) availableModesArr.push(isBn ? 'বাস' : 'Bus');
    if (connTo.train) availableModesArr.push(isBn ? 'ট্রেন' : 'Train');
    if (connTo.plane) availableModesArr.push(isBn ? 'ফ্লাইট' : 'Flight');
    if (connTo.boat) availableModesArr.push(isBn ? 'লঞ্চ' : 'Launch');
    const modesStr = availableModesArr.join('/');

    // Time estimates
    const busTimeH = distance > 0 ? Math.max(1, Math.ceil(distance / 50)) : 3;
    const trainTimeH = distance > 0 ? Math.max(2, Math.ceil(distance / 55)) : 4;

    if (isBn) {
        result = `**রুট: ${from} থেকে ${to}** — দূরত্ব: ${distance > 0 ? distance + ' কিমি' : 'অজানা'}\n\n`;

        // ── 1. বাস ──
        const busFareDisplay = busInfo?.fare || `${Math.max(150, Math.round(distance * 2.8))}-${Math.max(350, Math.round(distance * 5.2))}`;
        const terminal = getBoardingTerminal(from, to, true);
        result += `🚌 বাস – ${busTimeH}-${busTimeH + 1}h | ৳${busFareDisplay}\n`;
        result += `**বোর্ডিং পয়েন্ট:** ${terminal}  \n`;
        if (busInfo) {
            const fp = busInfo.fare.split('-');
            result += `**নন-এসি ভাড়া:** ৳${fp[0] || busInfo.fare}  \n`;
            if (fp[1]) result += `**এসি ভাড়া:** ৳${fp[1]}  \n`;
            result += `**অপারেটর:** ${busInfo.buses.join(' · ')}  \n`;
        }
        if (brtcRoutes.length > 0) {
            result += `**বিআরটিসি (সরকারি বাস):**  \n`;
            brtcRoutes.forEach(br => result += `- ${(br as any).bnName} (${(br as any).type}) — ${(br as any).hours}  \n`);
        }
        if (routesToDisplay.length > 0) {
            result += `**পাওয়া রুট (${routesToDisplay.length}টি):**  \n`;
            routesToDisplay.slice(0, 8).forEach((r: any) => {
                const price = r.prices?.[0]?.price ?? '—';
                const cls = r.prices?.[1] ? 'AC/Non-AC' : (r.prices?.[0]?.className ?? 'Non-AC');
                const dep = r.schedule?.[0]?.departureTime ? ` · ${r.schedule[0].departureTime}` : '';
                result += `- **${r.operatorName || 'বাস'}** (${cls}) — ৳${price}${dep}  \n`;
            });
        }
        if (!busInfo && brtcRoutes.length === 0 && routesToDisplay.length === 0) {
            const estNonAC = Math.max(100, Math.round(distance * 2.5));
            const estAC = Math.max(200, Math.round(distance * 4.5));
            result += `**আনুমানিক ভাড়া:** ৳${estNonAC} (লোকাল/নন-এসি) — ৳${estAC} (এসি/শীতাতপ)  \n`;
            const hillTracts = ['Bandarban', 'Rangamati', 'Khagrachari'];
            const isHillTract = hillTracts.includes(from) || hillTracts.includes(to);
            if (isHillTract) {
                const hub = hillTracts.includes(from) ? to : from;
                const hillCity = hillTracts.includes(from) ? from : to;
                result += `💡 **পাহাড়ি রুট নোট:** ${hillCity} থেকে সরাসরি দূরপাল্লার বাস সীমিত। সাধারণত **চট্টগ্রাম** হয়ে যাওয়া সহজ।  \n`;
                result += `লোকাল বাস বা শেয়ার্ড জিপ/মাইক্রোবাস পাওয়া যায় — স্থানীয় বাস টার্মিনালে খোঁজ নিন।  \n`;
            } else if (distance < 100) {
                result += `💡 এটি একটি স্বল্প দূরত্বের রুট। লোকাল বাস, সিএনজি বা অটোরিকশায় যাতায়াত করা যায়।  \n`;
            } else {
                result += `💡 ${from}-এর স্থানীয় বাস টার্মিনালে যোগাযোগ করুন। হানিফ, শ্যামলী, ইনা বা এনা পরিবহনের কাউন্টার পাওয়া যেতে পারে।  \n`;
            }
        }
        result += `**টিকেট:** shohoz.com থেকে অনলাইনে বুক করুন বা সরাসরি কাউন্টার থেকে সংগ্রহ করুন।  \n`;
        result += `\n`;

        // ── 2. ট্রেন ──
        if (trainInfo) {
            const stationNames: Record<string, string> = {
                'Dhaka': 'ঢাকা কমলাপুর রেলওয়ে স্টেশন',
                'Chattogram': 'চট্টগ্রাম রেলওয়ে স্টেশন',
                'Sylhet': 'সিলেট রেলওয়ে স্টেশন',
                'Rajshahi': 'রাজশাহী রেলওয়ে স্টেশন',
                'Khulna': 'খুলনা রেলওয়ে স্টেশন',
                'Mymensingh': 'ময়মনসিংহ রেলওয়ে স্টেশন',
                'Rangpur': 'রংপুর রেলওয়ে স্টেশন',
                'Dinajpur': 'দিনাজপুর রেলওয়ে স্টেশন',
                'Bogura': 'বগুড়া রেলওয়ে স্টেশন',
                'Cumilla': 'কুমিল্লা রেলওয়ে স্টেশন',
                'Noakhali': 'নোয়াখালী রেলওয়ে স্টেশন',
                "Cox's Bazar": "কক্সবাজার রেলওয়ে স্টেশন",
                'Benapole': 'বেনাপোল রেলওয়ে স্টেশন',
            };
            const fromStation = stationNames[from] || `${from} রেলওয়ে স্টেশন`;
            result += `🚂 ট্রেন – ${trainTimeH}h | ৳${trainInfo.fare}\n`;
            result += `**স্টেশন:** ${fromStation}  \n`;
            result += `**ট্রেনসমূহ:** ${trainInfo.trains.join(' · ')}  \n`;
            const tfp = trainInfo.fare.split('-');
            result += `**শোভন ভাড়া:** ৳${tfp[0] || trainInfo.fare}  \n`;
            if (tfp[1]) result += `**স্নিগ্ধা / এসি ভাড়া:** ৳${tfp[1]}  \n`;
            result += `**অনলাইন বুকিং:** eticket.railway.gov.bd  \n`;
            result += `**টিপস:** ৩-৫ দিন আগে টিকেট কেটে নিন, বিশেষত শুক্র-শনিবার ও ছুটির সময়।  \n`;
            result += `\n`;
        } else if (connFrom.train && connTo.train) {
            result += `🚂 ট্রেন – সংযোগ প্রয়োজন\n`;
            result += `এই রুটে সরাসরি ট্রেন নেই। ঢাকা কমলাপুর বা চট্টগ্রাম হয়ে সংযোগ ট্রেন নেওয়া যেতে পারে।  \n\n`;
        }

        // ── 3. বিমান ──
        if (airInfo) {
            result += `🛫 বিমান – ${airInfo.time} | ৳${airInfo.fare}\n`;
            result += `**বিমানবন্দর:** হজরত শাহজালাল আন্তর্জাতিক বিমানবন্দর, ঢাকা  \n`;
            result += `**এয়ারলাইন্স:** ${airInfo.airlines.join(' · ')}  \n`;
            const afp = airInfo.fare.split('-');
            result += `**সর্বনিম্ন ভাড়া:** ৳${afp[0] || airInfo.fare} (একমুখী, বেসিক)  \n`;
            if (afp[1]) result += `**সর্বোচ্চ ভাড়া:** ৳${afp[1]}  \n`;
            result += `**বুকিং:** biman.com.bd · us-bangla.com · novoair.com · airastra.com  \n`;
            result += `**টিপস:** ১-২ সপ্তাহ আগে বুক করলে সস্তায় পাওয়া যায়।  \n`;
            result += `\n`;
        }

        // ── 4. লঞ্চ ──
        if (launchInfo) {
            result += `🚢 লঞ্চ – ${launchInfo.time} | ৳${launchInfo.fare}\n`;
            result += `**টার্মিনাল:** সদরঘাট লঞ্চ টার্মিনাল, ঢাকা  \n`;
            result += `**লঞ্চসমূহ:** ${launchInfo.operators.join(' · ')}  \n`;
            const lfp = launchInfo.fare.split('-');
            result += `**ডেক ভাড়া:** ৳${lfp[0] || launchInfo.fare}  \n`;
            if (lfp[1]) result += `**কেবিন / ভিআইপি ভাড়া:** ৳${lfp[1]}  \n`;
            result += `**ছাড়ার সময়:** সাধারণত সন্ধ্যা ৬টা – রাত ৮টার মধ্যে  \n`;
            result += `**টিপস:** এসি কেবিন আগেই বুক করুন, বিশেষত ঈদ ও ছুটির মৌসুমে।  \n`;
            result += `\n`;
        } else if (connTo.boat && (from === 'Dhaka' || connFrom.boat)) {
            result += `🚢 নৌপথ – তথ্য সীমিত\n`;
            result += `এই রুটে নৌযান চলাচল করতে পারে। সদরঘাট টার্মিনালে খোঁজ নিন।  \n\n`;
        }

        if (!busInfo && !trainInfo && distance > 200 && from !== 'Dhaka' && to !== 'Dhaka') {
            result += `💡 **পরামর্শ:** সরাসরি সার্ভিস কম থাকলে **ঢাকা** হয়ে যাওয়া সুবিধাজনক (${modesStr} পাওয়া যায়)।  \n`;
        }
        if (from === 'Gazipur' || to === 'Gazipur') {
            result += `💡 **গাজীপুর নোট:** গাজীপুর চৌরাস্তা বা বোর্ড বাজার থেকে দূরপাল্লার বাসে উঠা যায়।  \n`;
        }

    } else {
        // ── ENGLISH ──
        result = `**Route: ${from} to ${to}** — Distance: ${distance > 0 ? distance + ' km' : 'N/A'}\n\n`;

        const busFareDisplay = busInfo?.fare || `${Math.max(150, Math.round(distance * 2.8))}-${Math.max(350, Math.round(distance * 5.2))}`;
        const terminal = getBoardingTerminal(from, to, false);

        // ── 1. Bus ──
        result += `🚌 By Bus – ${busTimeH}-${busTimeH + 1}h | ৳${busFareDisplay}\n`;
        result += `**Boarding Point:** ${terminal}  \n`;
        if (busInfo) {
            const fp = busInfo.fare.split('-');
            result += `**Non-AC Fare:** ৳${fp[0] || busInfo.fare}  \n`;
            if (fp[1]) result += `**AC Fare:** ৳${fp[1]}  \n`;
            result += `**Operators:** ${busInfo.buses.join(' · ')}  \n`;
        }
        if (brtcRoutes.length > 0) {
            result += `**BRTC (Government Bus):**  \n`;
            brtcRoutes.forEach(br => result += `- ${(br as any).name} (${(br as any).type}) — ${(br as any).hours}  \n`);
        }
        if (routesToDisplay.length > 0) {
            result += `**Found Routes (${routesToDisplay.length}):**  \n`;
            routesToDisplay.slice(0, 8).forEach((r: any) => {
                const price = r.prices?.[0]?.price ?? '—';
                const cls = r.prices?.[1] ? 'AC/Non-AC' : (r.prices?.[0]?.className ?? 'Non-AC');
                const dep = r.schedule?.[0]?.departureTime ? ` · ${r.schedule[0].departureTime}` : '';
                result += `- **${r.operatorName || 'Bus'}** (${cls}) — ৳${price}${dep}  \n`;
            });
        }
        if (!busInfo && brtcRoutes.length === 0 && routesToDisplay.length === 0) {
            const estNonAC = Math.max(100, Math.round(distance * 2.5));
            const estAC = Math.max(200, Math.round(distance * 4.5));
            result += `**Est. Fare:** ৳${estNonAC} (local/non-AC) — ৳${estAC} (AC)  \n`;
            const hillTracts = ['Bandarban', 'Rangamati', 'Khagrachari'];
            const isHillTract = hillTracts.includes(from) || hillTracts.includes(to);
            if (isHillTract) {
                const hillCity = hillTracts.includes(from) ? from : to;
                result += `💡 **Hill Tract Note:** Direct long-distance buses from ${hillCity} are limited. The most reliable option is to travel via **Chattogram** first.  \n`;
                result += `Local buses and shared jeeps/microbuses are available — check at the local bus stand.  \n`;
            } else if (distance < 100) {
                result += `💡 This is a short route. Local buses, CNGs, or auto-rickshaws are your best option.  \n`;
            } else {
                result += `💡 Check the local bus terminal in **${from}**. Operators like Hanif, Shyamoli, or Ena may have counters in this area.  \n`;
            }
        }
        result += `**Tickets:** Book online at shohoz.com or buy directly at the counter.  \n`;
        result += `\n`;

        // ── 2. Train ──
        if (trainInfo) {
            const stationNamesEn: Record<string, string> = {
                'Dhaka': 'Dhaka Kamalapur Railway Station',
                'Chattogram': 'Chattogram Railway Station',
                'Sylhet': 'Sylhet Railway Station',
                'Rajshahi': 'Rajshahi Railway Station',
                'Khulna': 'Khulna Railway Station',
                'Mymensingh': 'Mymensingh Railway Station',
                'Rangpur': 'Rangpur Railway Station',
                'Dinajpur': 'Dinajpur Railway Station',
                'Bogura': 'Bogura Railway Station',
                'Cumilla': 'Cumilla Railway Station',
                'Noakhali': 'Noakhali Railway Station',
                "Cox's Bazar": "Cox's Bazar Railway Station",
                'Benapole': 'Benapole Railway Station',
            };
            const fromStationEn = stationNamesEn[from] || `${from} Railway Station`;
            result += `🚂 By Train – ${trainTimeH}h | ৳${trainInfo.fare}\n`;
            result += `**Station:** ${fromStationEn}  \n`;
            result += `**Trains:** ${trainInfo.trains.join(' · ')}  \n`;
            const tfp = trainInfo.fare.split('-');
            result += `**Shovan (Economy) Fare:** ৳${tfp[0] || trainInfo.fare}  \n`;
            if (tfp[1]) result += `**Snigdha / AC Fare:** ৳${tfp[1]}  \n`;
            result += `**Online Booking:** eticket.railway.gov.bd  \n`;
            result += `**Tip:** Book 3–5 days ahead, especially for weekends and holidays.  \n`;
            result += `\n`;
        } else if (connFrom.train && connTo.train) {
            result += `🚂 By Train – Connection Required\n`;
            result += `No direct train. A connecting train via Dhaka Kamalapur may be available.  \n\n`;
        }

        // ── 3. Flight ──
        if (airInfo) {
            result += `🛫 By Flight – ${airInfo.time} | ৳${airInfo.fare}\n`;
            result += `**Airport:** Hazrat Shahjalal International Airport, Dhaka  \n`;
            result += `**Airlines:** ${airInfo.airlines.join(' · ')}  \n`;
            const afp = airInfo.fare.split('-');
            result += `**Lowest Fare:** ৳${afp[0] || airInfo.fare} (one-way, basic)  \n`;
            if (afp[1]) result += `**Highest Fare:** ৳${afp[1]}  \n`;
            result += `**Booking:** biman.com.bd · us-bangla.com · novoair.com · airastra.com  \n`;
            result += `**Tip:** Book 1–2 weeks ahead for best prices.  \n`;
            result += `\n`;
        }

        // ── 4. Launch ──
        if (launchInfo) {
            result += `🚢 By Launch – ${launchInfo.time} | ৳${launchInfo.fare}\n`;
            result += `**Terminal:** Sadarghat Launch Terminal, Dhaka  \n`;
            result += `**Operators:** ${launchInfo.operators.join(' · ')}  \n`;
            const lfp = launchInfo.fare.split('-');
            result += `**Deck Fare:** ৳${lfp[0] || launchInfo.fare}  \n`;
            if (lfp[1]) result += `**Cabin / VIP Fare:** ৳${lfp[1]}  \n`;
            result += `**Departure:** Usually 6 PM – 8 PM  \n`;
            result += `**Tip:** Book AC cabin in advance during Eid and holidays.  \n`;
            result += `\n`;
        } else if (connTo.boat && (from === 'Dhaka' || connFrom.boat)) {
            result += `🚢 By Launch – Limited Info\n`;
            result += `Waterway service may be available. Check at Sadarghat Terminal, Dhaka.  \n\n`;
        }

        if (!busInfo && !trainInfo && distance > 200 && from !== 'Dhaka' && to !== 'Dhaka') {
            result += `💡 **Tip:** If direct transport is limited, traveling via **Dhaka** is often the most reliable route (${modesStr} available).  \n`;
        }
        if (from === 'Gazipur' || to === 'Gazipur') {
            result += `💡 **Gazipur Note:** Most intercity buses pass through **Gazipur Chowrasta** or **Board Bazar** — you can board from there.  \n`;
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
