import { EnhancedIntercityResponse, BusOption, TrainOption, FlightOption, DrivingInfo, TravelTips, RouteResponse } from './types';
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

// Extended train route type with real fare breakdown and schedules
interface TrainRouteEntry {
    from: string; to: string;
    trains: string[];  // train name (departure time) format
    fare: string;      // "shovanChair-acBerth" for header summary
    time: string;      // actual journey duration
    shovan?: string;   // Shovan / Shovan Chair fare
    snigdha?: string;  // Snigdha (AC Chair) fare
    acSeat?: string;   // AC Seat fare
    acBerth?: string;  // AC Berth / 1st Class Berth fare
}

const TRAIN_ROUTES: TrainRouteEntry[] = [
    // ── DHAKA EASTERN ZONE ──
    {
        from: "Dhaka", to: "Chattogram",
        trains: ["Sonar Bangla Express (7:00AM, off Wed)", "Mahanagar Provati (7:45AM)", "Parjotak Express (6:15AM, off Sun)", "Suborno Express (4:30PM, off Mon)", "Chattala Express (1:45PM, off Fri)", "Mahanagar Express (9:20PM, off Sun)", "Turna Express (11:40PM)", "Cox's Bazar Express (10:30PM, off Mon)"],
        fare: "405-1591", time: "5-6.5h",
        shovan: "265", snigdha: "777", acSeat: "932", acBerth: "1591"
    },
    {
        from: "Dhaka", to: "Cox's Bazar",
        trains: ["Cox's Bazar Express (10:30PM, off Mon)", "Parjotak Express (6:15AM, off Sun)"],
        fare: "745-2656", time: "8-10h (via Chattogram)",
        shovan: "695", snigdha: "1449", acSeat: "1900", acBerth: "2656"
    },
    {
        from: "Dhaka", to: "Sylhet",
        trains: ["Parabat Express (6:30AM, off Tue)", "Joyontika Express (11:15AM, off Tue)", "Kalni Express (2:55PM, off Fri)", "Upaban Express (10:00PM, off Wed)", "Surma Mail (10:50PM, all days)"],
        fare: "375-1678", time: "6.5-8h",
        shovan: "375", snigdha: "719", acSeat: "1087", acBerth: "1678"
    },
    {
        from: "Dhaka", to: "Noakhali",
        trains: ["Upakul Express (6:30AM, off Thu)", "Dhaka-Noakhali Express (3:30PM, Thu only)"],
        fare: "350-700", time: "5.5-6h",
        shovan: "350", snigdha: "600", acSeat: "700", acBerth: "—"
    },
    {
        from: "Dhaka", to: "Kishoreganj",
        trains: ["Egarosindhur Provati (7:15AM)", "Egarosindhur Godhuli (4:00PM)", "Kishoreganj Express (2:00PM)", "Isha Khan Express (7:30PM)"],
        fare: "160-500", time: "2.5-3.5h",
        shovan: "160", snigdha: "305", acSeat: "—", acBerth: "500"
    },
    {
        from: "Dhaka", to: "Brahmanbaria",
        trains: ["Titas Commuter (multiple)", "Mahanagar Express (9:20PM)", "Turna Express (11:40PM)", "Upaban/Parabat/Kalni (pass-through)"],
        fare: "120-600", time: "2-3h",
        shovan: "120", snigdha: "230", acSeat: "275", acBerth: "—"
    },
    {
        from: "Dhaka", to: "Chandpur",
        trains: ["Meghna Express (7:00AM, off Tue)"],
        fare: "175-550", time: "3h",
        shovan: "175", snigdha: "335", acSeat: "400", acBerth: "550"
    },
    // ── DHAKA WESTERN ZONE ──
    {
        from: "Dhaka", to: "Rajshahi",
        trains: ["Dhumketu Express (6:00AM, off Thu)", "Bonolota Express (1:30PM, off Fri — fastest 4h40m)", "Silk City Express (2:40PM, off Sun)", "Madhumati Express (3:00PM, off Thu)", "Padma Express (10:45PM, off Tue)"],
        fare: "405-1386", time: "4.5-8h",
        shovan: "310", snigdha: "592", acSeat: "710", acBerth: "1065"
    },
    {
        from: "Dhaka", to: "Khulna",
        trains: ["Jahanabad Express (8:00PM via Padma Bridge, 3h45m, off Mon)", "Sundarban Express (8:15AM, 9h, off Wed)", "Chitra Express (7:00PM, 8h40m, off Mon)"],
        fare: "445-2168", time: "4-9h",
        shovan: "445", snigdha: "840", acSeat: "1005", acBerth: "1510"
    },
    {
        from: "Dhaka", to: "Rangpur",
        trains: ["Rangpur Express (9:10AM, 10h, off Mon)", "Kurigram Express (8:45PM, 8.5h, off Wed)"],
        fare: "420-1510", time: "8.5-10h",
        shovan: "420", snigdha: "800", acSeat: "960", acBerth: "1510"
    },
    {
        from: "Dhaka", to: "Dinajpur",
        trains: ["Ekota Express (10:15AM, 9h, off Tue)", "Drutojan Express (7:20PM, 8.5h, off Wed)", "Panchagarh Express (10:45PM, 8h, daily)"],
        fare: "465-1599", time: "8-9h",
        shovan: "465", snigdha: "892", acSeat: "—", acBerth: "1599"
    },
    {
        from: "Dhaka", to: "Panchagarh",
        trains: ["Ekota Express (10:15AM, off Tue)", "Drutojan Express (7:20PM, off Wed)", "Panchagarh Express (10:45PM, daily)"],
        fare: "560-1800", time: "9-10h",
        shovan: "560", snigdha: "1072", acSeat: "—", acBerth: "1800"
    },
    {
        from: "Dhaka", to: "Lalmonirhat",
        trains: ["Lalmoni Express (8:10PM, off Fri)", "Burimari Express (off Tue)"],
        fare: "500-1600", time: "9-10h",
        shovan: "500", snigdha: "957", acSeat: "—", acBerth: "1600"
    },
    {
        from: "Dhaka", to: "Nilphamari",
        trains: ["Nilsagar Express (10:30PM, off Thu)", "Chilahati Express"],
        fare: "500-1500", time: "9-10h",
        shovan: "500", snigdha: "957", acSeat: "—", acBerth: "1500"
    },
    {
        from: "Dhaka", to: "Chapainawabganj",
        trains: ["Banalata Express (Non-Stop, off Fri)", "Mahananda Express"],
        fare: "405-1386", time: "5.5-7h",
        shovan: "340", snigdha: "651", acSeat: "782", acBerth: "1173"
    },
    {
        from: "Dhaka", to: "Pabna",
        trains: ["Dhaka-Pabna Express (off Thu)"],
        fare: "265-900", time: "4-5h",
        shovan: "265", snigdha: "507", acSeat: "—", acBerth: "900"
    },
    {
        from: "Dhaka", to: "Kushtia",
        trains: ["Sundarban Express (8:15AM, passes via Poradaha)", "Chitra Express (7:00PM)"],
        fare: "330-1100", time: "5-6h",
        shovan: "330", snigdha: "632", acSeat: "—", acBerth: "1100"
    },
    {
        from: "Dhaka", to: "Sirajganj",
        trains: ["Sirajganj Express (off Wed)"],
        fare: "250-700", time: "3.5-4h",
        shovan: "250", snigdha: "480", acSeat: "—", acBerth: "700"
    },
    // ── DHAKA TO KHULNA DIVISION ──
    {
        from: "Dhaka", to: "Jashore",
        trains: ["Benapole Express (6:30AM, off Mon)", "Jahanabad Express (8:00PM, via Padma Bridge, off Mon)", "Sundarban Express (8:15AM, off Wed)", "Chitra Express (7:00PM, off Mon)"],
        fare: "350-1200", time: "4.5-6h",
        shovan: "350", snigdha: "670", acSeat: "804", acBerth: "1200"
    },
    {
        from: "Dhaka", to: "Jhenaidah",
        trains: ["Sundarban Express (8:15AM, off Wed)", "Chitra Express (7:00PM, off Mon)"],
        fare: "330-1100", time: "5-6h",
        shovan: "330", snigdha: "632", acSeat: "—", acBerth: "1100"
    },
    {
        from: "Dhaka", to: "Chuadanga",
        trains: ["Sundarban Express (8:15AM, off Wed)", "Chitra Express (7:00PM, off Mon)"],
        fare: "315-1050", time: "5-6.5h",
        shovan: "315", snigdha: "604", acSeat: "—", acBerth: "1050"
    },
    // ── DHAKA NORTH (RAJSHAHI / RANGPUR DIVISION) ──
    {
        from: "Dhaka", to: "Bogura",
        trains: ["Rangpur Express (9:10AM, off Mon)", "Kurigram Express (8:45PM, off Wed)", "Lalmoni Express (8:10PM, off Fri)", "Silk City Express (2:40PM, off Sun)"],
        fare: "395-1300", time: "5-6.5h",
        shovan: "395", snigdha: "756", acSeat: "—", acBerth: "1300"
    },
    {
        from: "Dhaka", to: "Naogaon",
        trains: ["Dhumketu Express (6:00AM, off Thu, via Santahar)"],
        fare: "395-1300", time: "6-7h",
        shovan: "395", snigdha: "756", acSeat: "—", acBerth: "1300"
    },
    {
        from: "Dhaka", to: "Joypurhat",
        trains: ["Barendra Express (off Tue, via Santahar)", "Titumir Express (off Fri, via Santahar)"],
        fare: "420-1400", time: "6.5-7.5h",
        shovan: "420", snigdha: "805", acSeat: "—", acBerth: "1400"
    },
    {
        from: "Dhaka", to: "Gaibandha",
        trains: ["Rangpur Express (9:10AM, off Mon)", "Kurigram Express (8:45PM, off Wed)"],
        fare: "450-1500", time: "7-9h",
        shovan: "450", snigdha: "862", acSeat: "—", acBerth: "1500"
    },
    {
        from: "Dhaka", to: "Thakurgaon",
        trains: ["Drutojan Express (7:20PM, off Wed)", "Panchagarh Express (10:45PM, daily)"],
        fare: "500-1700", time: "8.5-10h",
        shovan: "500", snigdha: "957", acSeat: "—", acBerth: "1700"
    },
    {
        from: "Dhaka", to: "Kurigram",
        trains: ["Kurigram Express (8:45PM, off Wed)"],
        fare: "550-1800", time: "9-10h",
        shovan: "550", snigdha: "1053", acSeat: "—", acBerth: "1800"
    },
    {
        from: "Dhaka", to: "Habiganj",
        trains: ["Parabat Express (6:30AM, off Tue)", "Joyontika Express (11:15AM, off Tue)", "Kalni Express (2:55PM, off Fri)", "Upaban Express (10:00PM, off Wed)"],
        fare: "250-950", time: "3.5-5h",
        shovan: "250", snigdha: "479", acSeat: "574", acBerth: "950"
    },
    {
        from: "Dhaka", to: "Moulvibazar",
        trains: ["Parabat Express (6:30AM, off Tue)", "Joyontika Express (11:15AM, off Tue)", "Kalni Express (2:55PM, off Fri)", "Upaban Express (10:00PM, off Wed)"],
        fare: "300-1100", time: "4.5-6h",
        shovan: "300", snigdha: "575", acSeat: "690", acBerth: "1100"
    },
    // ── CROSS-REGIONAL (KHULNA DIVISION) ──
    {
        from: "Khulna", to: "Jashore",
        trains: ["Jahanabad Express (via Padma Bridge)", "Sundarban Express", "Chitra Express", "Rupsha Express (off Sun)", "Simanta Express"],
        fare: "85-280", time: "1-1.5h",
        shovan: "85", snigdha: "163", acSeat: "—", acBerth: "280"
    },
    {
        from: "Jashore", to: "Benapole",
        trains: ["Benapole Express (pass-through, ~45min)"],
        fare: "50-165", time: "45m",
        shovan: "50", snigdha: "—", acSeat: "—", acBerth: "165"
    },
    {
        from: "Khulna", to: "Chuadanga",
        trains: ["Sundarban Express", "Chitra Express", "Kapotaksha Express (off Wed)", "Sagardari Express"],
        fare: "175-550", time: "2-3h",
        shovan: "175", snigdha: "335", acSeat: "—", acBerth: "550"
    },
    {
        from: "Khulna", to: "Jhenaidah",
        trains: ["Sundarban Express", "Chitra Express", "Kapotaksha Express (off Wed)"],
        fare: "120-400", time: "1.5-2h",
        shovan: "120", snigdha: "230", acSeat: "—", acBerth: "400"
    },
    // ── RAJSHAHI DIVISION ──
    {
        from: "Rajshahi", to: "Bogura",
        trains: ["Barendra Express (off Tue)", "Titumir Express (off Fri)"],
        fare: "150-480", time: "2-3h",
        shovan: "150", snigdha: "288", acSeat: "—", acBerth: "480"
    },
    {
        from: "Rajshahi", to: "Sirajganj",
        trains: ["Sirajganj Express (off Wed, via Ullapara)"],
        fare: "170-520", time: "2.5-3h",
        shovan: "170", snigdha: "326", acSeat: "—", acBerth: "520"
    },
    {
        from: "Rajshahi", to: "Joypurhat",
        trains: ["Barendra Express (via Santahar)", "Titumir Express (via Santahar)"],
        fare: "180-580", time: "2.5-3.5h",
        shovan: "180", snigdha: "345", acSeat: "—", acBerth: "580"
    },
    {
        from: "Rajshahi", to: "Naogaon",
        trains: ["Barendra Express (via Santahar)", "Titumir Express (via Santahar)", "Mahananda Express"],
        fare: "120-380", time: "1.5-2h",
        shovan: "120", snigdha: "230", acSeat: "—", acBerth: "380"
    },
    // ── RANGPUR DIVISION ──
    {
        from: "Bogura", to: "Rangpur",
        trains: ["Rangpur Express (pass-through)", "Kurigram Express (pass-through)", "Lalmoni Express (pass-through)"],
        fare: "130-420", time: "1.5-2h",
        shovan: "130", snigdha: "249", acSeat: "—", acBerth: "420"
    },
    {
        from: "Bogura", to: "Dinajpur",
        trains: ["Ekota Express (pass-through)", "Drutojan Express (pass-through)", "Panchagarh Express (pass-through)"],
        fare: "200-640", time: "2.5-3.5h",
        shovan: "200", snigdha: "384", acSeat: "—", acBerth: "640"
    },
    {
        from: "Rangpur", to: "Dinajpur",
        trains: ["Ekota Express (pass-through)", "Drutojan Express (pass-through)", "Panchagarh Express (pass-through)"],
        fare: "130-420", time: "1.5-2h",
        shovan: "130", snigdha: "249", acSeat: "—", acBerth: "420"
    },
    // ── CHATTOGRAM EXTENSION ──
    {
        from: "Chattogram", to: "Cox's Bazar",
        trains: ["Cox's Bazar Express (off Mon)", "Parjotak Express (pass-through, off Sun)"],
        fare: "265-950", time: "2-2.5h",
        shovan: "265", snigdha: "507", acSeat: "—", acBerth: "950"
    },
    {
        from: "Chattogram", to: "Brahmanbaria",
        trains: ["Paharika Express (7:00AM, off Wed)", "Udayan Express (9:45PM, off Tue)", "Titas Commuter (multiple)"],
        fare: "115-400", time: "2-3h",
        shovan: "115", snigdha: "220", acSeat: "264", acBerth: "400"
    },
    // ── MYMENSINGH DIVISION ──
    {
        from: "Dhaka", to: "Sherpur",
        trains: ["Haor Express (6:50AM, via Mymensingh)"],
        fare: "200-650", time: "4-5h",
        shovan: "200", snigdha: "384", acSeat: "—", acBerth: "650"
    },
    // ── DHAKA NORTH-CENTRAL ──
    {
        from: "Dhaka", to: "Mymensingh",
        trains: ["Tista Express (6:15AM)", "Agnibina Express (2:45PM)", "Brahmaputra Express (4:00PM)", "Jamuna Express (7:45AM)", "Haor Express (6:50AM)", "Balaka Commuter (multiple)"],
        fare: "145-550", time: "2.5-3.5h",
        shovan: "145", snigdha: "277", acSeat: "—", acBerth: "550"
    },
    {
        from: "Dhaka", to: "Jamalpur",
        trains: ["Tista Express (6:15AM)", "Jamuna Express (7:45AM)", "Agnibina Express (2:45PM)", "Brahmaputra Express (4:00PM)"],
        fare: "190-600", time: "3.5-4.5h",
        shovan: "190", snigdha: "364", acSeat: "—", acBerth: "600"
    },
    {
        from: "Dhaka", to: "Netrokona",
        trains: ["Haor Express (6:50AM)", "Mohanganj Express (3:15PM)", "Mahua Express"],
        fare: "250-800", time: "4-5h",
        shovan: "250", snigdha: "479", acSeat: "—", acBerth: "800"
    },
    {
        from: "Dhaka", to: "Gopalganj",
        trains: ["Tungipara Express (off Wed — via Padma Bridge)"],
        fare: "265-900", time: "3.5-4h",
        shovan: "265", snigdha: "507", acSeat: "—", acBerth: "900"
    },
    {
        from: "Dhaka", to: "Faridpur",
        trains: ["Madhumati Express (off Thu — via Padma Bridge)", "Rupashi Bangla Express"],
        fare: "265-800", time: "2.5-3h",
        shovan: "265", snigdha: "507", acSeat: "—", acBerth: "800"
    },
    {
        from: "Dhaka", to: "Chilahati",
        trains: ["Nilsagar Express (10:30PM, off Thu)", "Chilahati Express"],
        fare: "540-1700", time: "10-11h",
        shovan: "540", snigdha: "1034", acSeat: "—", acBerth: "1700"
    },
    {
        from: "Dhaka", to: "Burimari",
        trains: ["Burimari Express (via Lalmonirhat, off Tue)"],
        fare: "560-1800", time: "10-11h",
        shovan: "560", snigdha: "1072", acSeat: "—", acBerth: "1800"
    },
    {
        from: "Dhaka", to: "Natore",
        trains: ["Lalmoni Express (8:10PM)", "Rangpur Express (9:10AM)", "Drutojan Express (7:20PM)"],
        fare: "310-1050", time: "4.5-5.5h",
        shovan: "310", snigdha: "594", acSeat: "—", acBerth: "1050"
    },
    {
        from: "Dhaka", to: "Dewanganj",
        trains: ["Tista Express (6:15AM)", "Dewanganj Commuter"],
        fare: "180-550", time: "4-5h",
        shovan: "180", snigdha: "345", acSeat: "—", acBerth: "550"
    },
    // ── CROSS-REGIONAL ──
    {
        from: "Chattogram", to: "Sylhet",
        trains: ["Paharika Express (7:00AM, off Wed)", "Udayan Express (9:45PM, off Tue)"],
        fare: "395-1350", time: "7-8h",
        shovan: "395", snigdha: "757", acSeat: "907", acBerth: "1350"
    },
    {
        from: "Chattogram", to: "Cumilla",
        trains: ["Paharika Express", "Udayan Express", "Mahanagar Provati", "Turna Express (pass-through)"],
        fare: "115-400", time: "1.5-2h",
        shovan: "115", snigdha: "220", acSeat: "264", acBerth: "396"
    },
    {
        from: "Chattogram", to: "Noakhali",
        trains: ["Sagarika Express (off Thu)"],
        fare: "100-350", time: "2-2.5h",
        shovan: "100", snigdha: "192", acSeat: "—", acBerth: "350"
    },
    {
        from: "Chattogram", to: "Chandpur",
        trains: ["Meghna Express", "Sagarika Express"],
        fare: "130-450", time: "3-4h",
        shovan: "130", snigdha: "249", acSeat: "—", acBerth: "450"
    },
    {
        from: "Chattogram", to: "Mymensingh",
        trains: ["Bijoy Express (off Fri)"],
        fare: "360-1200", time: "8-9h",
        shovan: "360", snigdha: "689", acSeat: "827", acBerth: "1200"
    },
    {
        from: "Chattogram", to: "Jamalpur",
        trains: ["Bijoy Express (off Fri)"],
        fare: "400-1300", time: "9-10h",
        shovan: "400", snigdha: "766", acSeat: "919", acBerth: "1300"
    },
    {
        from: "Khulna", to: "Rajshahi",
        trains: ["Kapotaksha Express (off Wed)", "Sagardari Express"],
        fare: "265-850", time: "5-6h",
        shovan: "265", snigdha: "507", acSeat: "—", acBerth: "850"
    },
    {
        from: "Khulna", to: "Saidpur",
        trains: ["Rupsha Express (off Sun)", "Simanta Express"],
        fare: "400-1300", time: "8-10h",
        shovan: "400", snigdha: "766", acSeat: "—", acBerth: "1300"
    },
    {
        from: "Benapole", to: "Dhaka",
        trains: ["Benapole Express (6:30AM, off Mon)", "Rupashi Bangla Express (via Padma Bridge)"],
        fare: "455-1500", time: "5-6h",
        shovan: "455", snigdha: "871", acSeat: "1044", acBerth: "1500"
    },
    {
        from: "Rajshahi", to: "Chapainawabganj",
        trains: ["Barendra Express", "Titumir Express"],
        fare: "70-220", time: "1h",
        shovan: "70", snigdha: "—", acSeat: "—", acBerth: "220"
    },
    {
        from: "Rajshahi", to: "Chilahati",
        trains: ["Barendra Express (off Tue)", "Titumir Express (off Fri)"],
        fare: "250-800", time: "4-5h",
        shovan: "250", snigdha: "479", acSeat: "—", acBerth: "800"
    },
    {
        from: "Sylhet", to: "Akhaura",
        trains: ["Jalalabad Express", "Surma Mail", "Upaban/Parabat/Kalni (pass-through)"],
        fare: "80-300", time: "2-2.5h",
        shovan: "80", snigdha: "153", acSeat: "—", acBerth: "300"
    },
    {
        from: "Mymensingh", to: "Bhairab",
        trains: ["Isha Khan Express", "Brahmaputra Commuter"],
        fare: "60-180", time: "1.5h",
        shovan: "60", snigdha: "—", acSeat: "—", acBerth: "180"
    },
    {
        from: "Parbatipur", to: "Panchagarh",
        trains: ["Kanchan Express", "Ramsagor Express"],
        fare: "60-180", time: "1.5-2h",
        shovan: "60", snigdha: "—", acSeat: "—", acBerth: "180"
    },
    // ── CROSS BORDER (INDIA) ──
    {
        from: "Dhaka", to: "Kolkata",
        trains: ["Maitree Express (Dhaka Cantonment, Thu & Sun)"],
        fare: "2500+", time: "10-12h",
        shovan: "—", snigdha: "2500", acSeat: "3000", acBerth: "4500"
    },
    {
        from: "Khulna", to: "Kolkata",
        trains: ["Bandhan Express (Thu & Sun)"],
        fare: "1500+", time: "5h",
        shovan: "—", snigdha: "1500", acSeat: "—", acBerth: "—"
    },
    {
        from: "Dhaka", to: "New Jalpaiguri",
        trains: ["Mitali Express (Sun & Wed, from Dhaka Cantonment)"],
        fare: "3000+", time: "~18h",
        shovan: "—", snigdha: "3000", acSeat: "4000", acBerth: "5500"
    },
    // ── REGIONAL & LOCAL COMMUTER TRAINS ──
    {
        from: "Khulna", to: "Benapole",
        trains: ["Benapole Commuter (9:00AM, 6:30PM)", "Betna Express"],
        fare: "30-60", time: "2.5-3h",
        shovan: "30", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Benapole", to: "Jashore",
        trains: ["Benapole Commuter", "Betna Express"],
        fare: "20-40", time: "1h",
        shovan: "20", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Dhaka", to: "Narayanganj",
        trains: ["Narayanganj Commuter (Hourly Service)"],
        fare: "15-20", time: "45m-1h",
        shovan: "15", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Dhaka", to: "Gazipur",
        trains: ["Turag Express", "Kaliakoir Commuter", "Tangail Commuter"],
        fare: "20-45", time: "1h",
        shovan: "20", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Chattogram", to: "Feni",
        trains: ["Feni Commuter", "Jalalabad Express"],
        fare: "45-80", time: "1.5h",
        shovan: "45", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Rajshahi", to: "Chapainawabganj",
        trains: ["Ishwardi-Chapainawabganj Local", "Commuter Train"],
        fare: "25-50", time: "1.5h",
        shovan: "25", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Sylhet", to: "Akhaura",
        trains: ["Jalalabad Express", "Surma Mail", "Kushiara Express"],
        fare: "60-120", time: "3h",
        shovan: "60", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Mymensingh", to: "Jamalpur",
        trains: ["Mymensingh-Jamalpur Local", "Brahmaputra Commuter"],
        fare: "30-60", time: "1.5h",
        shovan: "30", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Mymensingh", to: "Bhairab",
        trains: ["Isha Khan Express", "Local Train"],
        fare: "40-80", time: "2h",
        shovan: "40", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Parbatipur", to: "Panchagarh",
        trains: ["Kanchan Express", "Ramsagor Express"],
        fare: "50-100", time: "2h",
        shovan: "50", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Ishwardi", to: "Khulna",
        trains: ["Ishwardi-Khulna Commuter", "Mahananda Express"],
        fare: "60-120", time: "3.5h",
        shovan: "60", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Dhaka", to: "Brahmanbaria",
        trains: ["Titas Commuter (multiple departures)", "Chattala Express"],
        fare: "100-200", time: "2.5-3h",
        shovan: "100", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Joydebpur", to: "Mymensingh",
        trains: ["Balaka Commuter", "Isha Khan Express", "Local Train"],
        fare: "45-90", time: "2-3h",
        shovan: "45", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Chattogram", to: "Dohazari",
        trains: ["Dohazari Commuter (Shuttle)"],
        fare: "20-40", time: "1.5h",
        shovan: "20", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Chattogram", to: "Nazirhat",
        trains: ["Nazirhat Commuter (Shuttle)"],
        fare: "15-30", time: "1h",
        shovan: "15", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Laksam", to: "Noakhali",
        trains: ["Noakhali Local", "Samartata Express"],
        fare: "30-60", time: "1.5h",
        shovan: "30", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Laksam", to: "Chandpur",
        trains: ["Chandpur Local", "Puffing Train"],
        fare: "25-50", time: "1.5h",
        shovan: "25", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Santahar", to: "Bogura",
        trains: ["Padma Local", "North Bihar Express"],
        fare: "25-50", time: "1h",
        shovan: "25", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Bogura", to: "Bonarpara",
        trains: ["College Train", "Local Service"],
        fare: "20-40", time: "1h",
        shovan: "20", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Khulna", to: "Goalanda Ghat",
        trains: ["Nakshikantha Express", "Local Train"],
        fare: "75-150", time: "4-5h",
        shovan: "75", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Rajshahi", to: "Ishwardi",
        trains: ["Ishwardi-Rajshahi Commuter", "Mahananda Express"],
        fare: "35-70", time: "1.5h",
        shovan: "35", snigdha: "—", acSeat: "—", acBerth: "—"
    },
    {
        from: "Mymensingh", to: "Netrokona",
        trains: ["Mohanganj Local", "Mahua Express"],
        fare: "40-80", time: "1.5-2h",
        shovan: "40", snigdha: "—", acSeat: "—", acBerth: "—"
    },
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

const AIRPORT_MAP: { [key: string]: { city: string, airport: string, bnAirport: string } } = {
    "Dhaka": { city: "Dhaka", airport: "Hazrat Shahjalal International Airport", bnAirport: "হজরত শাহজালাল আন্তর্জাতিক বিমানবন্দর" },
    "Chattogram": { city: "Chattogram", airport: "Shah Amanat International Airport", bnAirport: "শাহ আমানত আন্তর্জাতিক বিমানবন্দর" },
    "Sylhet": { city: "Sylhet", airport: "Osmani International Airport", bnAirport: "ওসমানী আন্তর্জাতিক বিমানবন্দর" },
    "Rajshahi": { city: "Rajshahi", airport: "Shah Makhdum Airport", bnAirport: "শাহ মখদুম বিমানবন্দর" },
    "Barishal": { city: "Barishal", airport: "Barishal Airport", bnAirport: "বরিশাল বিমানবন্দর" },
    "Jashore": { city: "Jashore", airport: "Jashore Airport", bnAirport: "যশোর বিমানবন্দর" },
    "Saidpur": { city: "Saidpur", airport: "Saidpur Airport", bnAirport: "সৈয়দপুর বিমানবন্দর" },
    "Cox's Bazar": { city: "Cox's Bazar", airport: "Cox's Bazar Airport", bnAirport: "কক্সবাজার বিমানবন্দর" },
    "Rangpur": { city: "Saidpur", airport: "Saidpur Airport", bnAirport: "সৈয়দপুর বিমানবন্দর" },
    "Dinajpur": { city: "Saidpur", airport: "Saidpur Airport", bnAirport: "সৈয়দপুর বিমানবন্দর" },
    "Nilphamari": { city: "Saidpur", airport: "Saidpur Airport", bnAirport: "সৈয়দপুর বিমানবন্দর" },
    "Benapole": { city: "Jashore", airport: "Jashore Airport", bnAirport: "যশোর বিমানবন্দর" },
    "Khulna": { city: "Jashore", airport: "Jashore Airport", bnAirport: "যশোর বিমানবন্দর" },
    "Satkhira": { city: "Jashore", airport: "Jashore Airport", bnAirport: "যশোর বিমানবন্দর" },
    "Chapainawabganj": { city: "Rajshahi", airport: "Shah Makhdum Airport", bnAirport: "শাহ মখদুম বিমানবন্দর" },
    "Naogaon": { city: "Rajshahi", airport: "Shah Makhdum Airport", bnAirport: "শাহ মখদুম বিমানবন্দর" },
    "Sunamganj": { city: "Sylhet", airport: "Osmani International Airport", bnAirport: "ওসমানী আন্তর্জাতিক বিমানবন্দর" },
    "Moulvibazar": { city: "Sylhet", airport: "Osmani International Airport", bnAirport: "ওসমানী আন্তর্জাতিক বিমানবন্দর" },
    "Habiganj": { city: "Sylhet", airport: "Osmani International Airport", bnAirport: "ওসমানী আন্তর্জাতিক বিমানবন্দর" },
    "Pabna": { city: "Rajshahi", airport: "Shah Makhdum Airport", bnAirport: "শাহ মখদুম বিমানবন্দর" },
    "Noakhali": { city: "Chattogram", airport: "Shah Amanat International Airport", bnAirport: "শাহ আমানত আন্তর্জাতিক বিমানবন্দর" },
    "Feni": { city: "Chattogram", airport: "Shah Amanat International Airport", bnAirport: "শাহ আমানত আন্তর্জাতিক বিমানবন্দর" },
    "Lalmonirhat": { city: "Saidpur", airport: "Saidpur Airport", bnAirport: "সৈয়দপুর বিমানবন্দর" },
    "Kurigram": { city: "Saidpur", airport: "Saidpur Airport", bnAirport: "সৈয়দপুর বিমানবন্দর" },
    "Thakurgaon": { city: "Saidpur", airport: "Saidpur Airport", bnAirport: "সৈয়দপুর বিমানবন্দর" },
    "Panchagarh": { city: "Saidpur", airport: "Saidpur Airport", bnAirport: "সৈয়দপুর বিমানবন্দর" },
};

const getTrainInfo = (from: string, to: string) => TRAIN_ROUTES.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));
const getAirInfo = (from: string, to: string) => {
    // 1. Try exact match
    const direct = AIR_ROUTES.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));
    if (direct) return direct;

    // 2. Try nearby airport logic
    const airportFrom = AIRPORT_MAP[from];
    const airportTo = AIRPORT_MAP[to];

    if (airportFrom && airportTo) {
        // Find flight between the hubs serving these districts
        const hubFlight = AIR_ROUTES.find(r =>
            (r.from === airportFrom.city && r.to === airportTo.city) ||
            (r.from === airportTo.city && r.to === airportFrom.city)
        );

        if (hubFlight) {
            return {
                ...hubFlight,
                isIndirect: true,
                fromNeedsRoad: airportFrom.city !== from,
                toNeedsRoad: airportTo.city !== to,
                fromHub: airportFrom.city,
                toHub: airportTo.city,
                fromAirport: airportFrom.airport,
                toAirport: airportTo.airport,
                bnFromAirport: airportFrom.bnAirport,
                bnToAirport: airportTo.bnAirport
            };
        }
    }
    return undefined;
};
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
                'Cumilla': 'কুমিল্লা রেলওয়ে স্টেশন',
                'Noakhali': 'নোয়াখালী রেলওয়ে স্টেশন',
                "Cox's Bazar": "কক্সবাজার রেলওয়ে স্টেশন",
                'Benapole': 'বেনাপোল রেলওয়ে স্টেশন',
                'Kishoreganj': 'ভৈরব / কিশোরগঞ্জ রেলওয়ে স্টেশন',
            };
            const fromStation = stationNames[from] || `${from} রেলওয়ে স্টেশন`;
            const trainDuration = (trainInfo as any).time || `${trainTimeH}h`;
            result += `🚂 ট্রেন – ${trainDuration} | ৳${trainInfo.shovan || trainInfo.fare.split('-')[0]}-${trainInfo.acBerth || trainInfo.fare.split('-')[1] || trainInfo.fare}\n`;
            result += `**স্টেশন:** ${fromStation}  \n`;
            result += `**ট্রেনসমূহ:**  \n`;
            trainInfo.trains.forEach(t => result += `- ${t}  \n`);
            if (trainInfo.shovan && trainInfo.shovan !== '—') result += `**শোভন চেয়ার:** ৳${trainInfo.shovan}  \n`;
            if (trainInfo.snigdha && trainInfo.snigdha !== '—') result += `**স্নিগ্ধা (এসি চেয়ার):** ৳${trainInfo.snigdha}  \n`;
            if (trainInfo.acSeat && trainInfo.acSeat !== '—') result += `**এসি সিট:** ৳${trainInfo.acSeat}  \n`;
            if (trainInfo.acBerth && trainInfo.acBerth !== '—') result += `**এসি বার্থ:** ৳${trainInfo.acBerth}  \n`;
            result += `**অনলাইন টিকেট:** eticket.railway.gov.bd বা Rail Sheba অ্যাপ  \n`;
            result += `**টিপস:** ৩-৫ দিন আগে টিকেট কেটে নিন, বিশেষত শুক্র-শনিবার ও ছুটির সময়।  \n`;
            result += `\n`;
        } else if (connFrom.train && connTo.train) {
            // Find nearest major hub for connection guidance
            const nearestHub = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna'].find(h => h !== from && h !== to) || 'Dhaka';
            result += `🚂 ট্রেন – সংযোগ প্রয়োজন\n`;
            result += `এই রুটে ${from} থেকে ${to} পর্যন্ত সরাসরি ট্রেন নেই। **${from}** থেকে ঢাকা কমলাপুর বা নিকটতম জংশনে এসে সংযোগ ট্রেন নেওয়া যেতে পারে।  \n`;
            result += `**বিকল্প:** eticket.railway.gov.bd-তে রুট সার্চ করুন অথবা রেলওয়ে হেল্পলাইন 131-এ কল করুন।  \n\n`;
        }

        // ── 3. বিমান ──
        if (airInfo) {
            const isIndirect = (airInfo as any).isIndirect;

            if (isIndirect) {
                const { fromNeedsRoad, toNeedsRoad, fromHub, toHub, bnFromAirport, bnToAirport } = airInfo as any;
                result += `🛫 বিমান – ${(airInfo as any).time} | ৳${(airInfo as any).fare}\n`;
                
                if (fromNeedsRoad && toNeedsRoad) {
                    result += `**নির্দেশনা:** সরাসরি ফ্লাইট নেই। প্রথমে সড়কপথে **${fromHub}** (${bnFromAirport}) গিয়ে, সেখান থেকে বিমানে **${toHub}** (${bnToAirport}) হয়ে সড়কপথে **${to}** পৌঁছাতে হবে।  \n`;
                } else if (fromNeedsRoad) {
                    result += `**নির্দেশনা:** সরাসরি ফ্লাইট নেই। প্রথমে **${from}** থেকে সড়কপথে **${fromHub}** (${bnFromAirport}) গিয়ে সেখান থেকে বিমানে **${to}** পৌঁছাতে হবে।  \n`;
                } else {
                    result += `**নির্দেশনা:** সরাসরি ফ্লাইট নেই। প্রথমে বিমানে **${toHub}** (${bnToAirport}) গিয়ে সেখান থেকে সড়কপথে **${to}** পৌঁছাতে হবে।  \n`;
                }
            } else {
                result += `🛫 বিমান – ${airInfo.time} | ৳${airInfo.fare}\n`;
                const airport = AIRPORT_MAP[from]?.bnAirport || (from === 'Dhaka' ? 'হজরত শাহজালাল আন্তর্জাতিক বিমানবন্দর, ঢাকা' : from + ' বিমানবন্দর');
                result += `**বিমানবন্দর:** ${airport}  \n`;
            }
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
                'Cumilla': 'Cumilla Railway Station',
                'Noakhali': 'Noakhali Railway Station',
                "Cox's Bazar": "Cox's Bazar Railway Station",
                'Benapole': 'Benapole Railway Station',
                'Kishoreganj': 'Bhairab / Kishoreganj Railway Station',
            };
            const fromStationEn = stationNamesEn[from] || `${from} Railway Station`;
            const trainDurationEn = (trainInfo as any).time || `${trainTimeH}h`;
            result += `🚂 By Train – ${trainDurationEn} | ৳${trainInfo.shovan || trainInfo.fare.split('-')[0]}-${trainInfo.acBerth || trainInfo.fare.split('-')[1] || trainInfo.fare}\n`;
            result += `**Station:** ${fromStationEn}  \n`;
            result += `**Trains:**  \n`;
            trainInfo.trains.forEach(t => result += `- ${t}  \n`);
            if (trainInfo.shovan && trainInfo.shovan !== '—') result += `**Shovon Chair:** ৳${trainInfo.shovan}  \n`;
            if (trainInfo.snigdha && trainInfo.snigdha !== '—') result += `**Snigdha (AC Chair):** ৳${trainInfo.snigdha}  \n`;
            if (trainInfo.acSeat && trainInfo.acSeat !== '—') result += `**AC Seat:** ৳${trainInfo.acSeat}  \n`;
            if (trainInfo.acBerth && trainInfo.acBerth !== '—') result += `**AC Berth:** ৳${trainInfo.acBerth}  \n`;
            result += `**Online Booking:** eticket.railway.gov.bd  \n`;
            result += `**Tip:** Book 3–5 days ahead, especially for weekends and holidays.  \n`;
            result += `\n`;
        } else if (connFrom.train && connTo.train) {
            result += `🚂 By Train – Connection Required\n`;
            result += `No direct train from **${from}** to **${to}**. Travel to the nearest major junction (Dhaka Kamalapur, Chattogram, or Rajshahi) and take a connecting train.  \n`;
            result += `**Alternative:** Search on eticket.railway.gov.bd or call Railway Helpline: 131.  \n\n`;
        }

        // ── 3. Flight ──
        if (airInfo) {
            const isIndirect = (airInfo as any).isIndirect;

            if (isIndirect) {
                const { fromNeedsRoad, toNeedsRoad, fromHub, toHub, fromAirport, toAirport } = airInfo as any;
                result += `🛫 By Flight – ${(airInfo as any).time} | ৳${(airInfo as any).fare}\n`;

                if (fromNeedsRoad && toNeedsRoad) {
                    result += `**Guidance:** No direct flight. Travel by road to **${fromHub}** (${fromAirport}), fly to **${toHub}** (${toAirport}), then take road transport to **${to}**.  \n`;
                } else if (fromNeedsRoad) {
                    result += `**Guidance:** No direct flight. Take road transport from **${from}** to **${fromHub}** (${fromAirport}) then fly to **${to}**.  \n`;
                } else {
                    result += `**Guidance:** No direct flight. Fly to **${toHub}** (${toAirport}) then take road transport to **${to}**.  \n`;
                }
            } else {
                result += `🛫 By Flight – ${airInfo.time} | ৳${airInfo.fare}\n`;
                const airport = AIRPORT_MAP[from]?.airport || (from === 'Dhaka' ? 'Hazrat Shahjalal International Airport, Dhaka' : from + ' Airport');
                result += `**Airport:** ${airport}  \n`;
            }
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
