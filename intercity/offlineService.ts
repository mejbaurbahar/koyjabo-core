import { RouteResponse } from './types';
import { BRTC_DHAKA_INTERCITY, BRTC_REGIONAL_INTERCITY } from '../BRTC_INTERCITY_ROUTES_DATA';
import { DISTRICT_COORDINATES } from './constants';

interface Connectivity {
    bus: boolean;
    train: boolean;
    plane: boolean;
    boat: boolean;
}

const DISTRICT_CONNECTIVITY: { [key: string]: Connectivity } = {
    // Divisional Capitals
    "Dhaka": { bus: true, train: true, plane: true, boat: true },
    "Chattogram": { bus: true, train: true, plane: true, boat: false },
    "Sylhet": { bus: true, train: true, plane: true, boat: false },
    "Rajshahi": { bus: true, train: true, plane: true, boat: false },
    "Khulna": { bus: true, train: true, plane: false, boat: true },
    "Barishal": { bus: true, train: false, plane: true, boat: true },
    "Rangpur": { bus: true, train: true, plane: false, boat: false },
    "Mymensingh": { bus: true, train: true, plane: false, boat: false },

    // Major Transport Hubs & Districts
    "Cox's Bazar": { bus: true, train: true, plane: true, boat: true },
    "Saidpur": { bus: true, train: true, plane: true, boat: false },
    "Jashore": { bus: true, train: true, plane: true, boat: false },
    "Bogura": { bus: true, train: true, plane: false, boat: false },
    "Chandpur": { bus: true, train: false, plane: false, boat: true },
    "Bhola": { bus: true, train: false, plane: false, boat: true },
    "Patuakhali": { bus: true, train: false, plane: false, boat: true },
    "Pirojpur": { bus: true, train: false, plane: false, boat: true },
    "Barguna": { bus: true, train: false, plane: false, boat: true },
    "Jhalokati": { bus: true, train: false, plane: false, boat: true },
    "Noakhali": { bus: true, train: true, plane: false, boat: false },
    "Cumilla": { bus: true, train: true, plane: false, boat: false },
    "Feni": { bus: true, train: true, plane: false, boat: false },
    "Brahmanbaria": { bus: true, train: true, plane: false, boat: false },
    "Kushtia": { bus: true, train: true, plane: false, boat: false },
    "Pabna": { bus: true, train: true, plane: false, boat: false },
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
    "Nilphamari": { bus: true, train: true, plane: false, boat: false },
    "Lalmonirhat": { bus: true, train: true, plane: false, boat: false },
    "Habiganj": { bus: true, train: true, plane: false, boat: false },
    "Moulvibazar": { bus: true, train: true, plane: false, boat: false },
    "Sunamganj": { bus: true, train: false, plane: false, boat: false },
    "Lakshmipur": { bus: true, train: false, plane: false, boat: true },
    "Khagrachari": { bus: true, train: false, plane: false, boat: false },
    "Rangamati": { bus: true, train: false, plane: false, boat: true },
    "Bandarban": { bus: true, train: false, plane: false, boat: false },
    "Netrokona": { bus: true, train: true, plane: false, boat: false },
    "Sherpur": { bus: true, train: false, plane: false, boat: false },
    "Satkhira": { bus: true, train: false, plane: false, boat: false },
    "Bagerhat": { bus: true, train: false, plane: false, boat: true },
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

const MAJOR_HUBS = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Jashore", "Bogura", "Comilla", "Feni", "Bhairab", "Dinajpur", "Panchagarh"];

const TRAIN_ROUTES = [
    { from: "Dhaka", to: "Chattogram", trains: ["Subarna Express", "Sonar Bangla Express", "Turna Express", "Mohanagar Goduli", "Chattala Express"], fare: "400-1500" },
    { from: "Dhaka", to: "Sylhet", trains: ["Upaban Express", "Jayantika Express", "Kalni Express", "Parabat Express"], fare: "350-1200" },
    { from: "Dhaka", to: "Rajshahi", trains: ["Silk City", "Padma Express", "Dhumketu Express", "Banalata Express"], fare: "350-1200" },
    { from: "Dhaka", to: "Khulna", trains: ["Sundarban Express", "Chitra Express"], fare: "500-1500" },
    { from: "Dhaka", to: "Rangpur", trains: ["Rangpur Express", "Kurigram Express"], fare: "500-1500" },
    { from: "Dhaka", to: "Cox's Bazar", trains: ["Cox's Bazar Express", "Parjatak Express"], fare: "700-2000" },
    { from: "Dhaka", to: "Panchagarh", trains: ["Ekota Express", "Drutojan Express", "Panchagarh Express"], fare: "600-1800" },
    { from: "Dhaka", to: "Noakhali", trains: ["Upakul Express"], fare: "300-1000" },
    { from: "Dhaka", to: "Kishoreganj", trains: ["Egarosindhur Express", "Kishoreganj Express"], fare: "150-500" },
    { from: "Dhaka", to: "Mymensingh", trains: ["Tista Express", "Agnibina Express", "Brahmaputra Express"], fare: "150-500" },
    { from: "Dhaka", to: "Netrokona", trains: ["Haor Express", "Mohanganj Express"], fare: "200-800" },
    { from: "Dhaka", to: "Dinajpur", trains: ["Ekota Express", "Drutojan Express"], fare: "500-1500" },
    { from: "Dhaka", to: "Lalmonirhat", trains: ["Lalmoni Express"], fare: "500-1500" },
    { from: "Dhaka", to: "Chandpur", trains: ["Meghna Express"], fare: "200-600" },
    { from: "Chattogram", to: "Sylhet", trains: ["Paharika Express", "Udayan Express"], fare: "400-1200" },
    { from: "Chattogram", to: "Chandpur", trains: ["Meghna Express"], fare: "150-500" },
    { from: "Chattogram", to: "Mymensingh", trains: ["Bijoy Express"], fare: "400-1000" },
    { from: "Khulna", to: "Rajshahi", trains: ["Kapotaksha Express", "Sagardari Express"], fare: "300-800" },
    { from: "Khulna", to: "Saidpur", trains: ["Rupsha Express", "Simanta Express"], fare: "400-1200" },
    { from: "Rajshahi", to: "Panchagarh", trains: ["Banglabandha Express"], fare: "300-1000" },
    { from: "Rajshahi", to: "Chilahati", trains: ["Barendra Express", "Titumir Express"], fare: "250-800" },
    { from: "Benapole", to: "Khulna", trains: ["Betna Express (Local)"], fare: "45-100" },
    { from: "Benapole", to: "Dhaka", trains: ["Benapole Express"], fare: "535-1500" },
];

const getTrainInfo = (from: string, to: string) => {
    return TRAIN_ROUTES.find(r =>
        (r.from === from && r.to === to) || (r.from === to && r.to === from)
    );
};

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
    const isBn = lang === 'bn';

    let result = '';

    if (isBn) {
        result = `**রুট: ${from} থেকে ${to}**  \n`;
        result += `**দূরত্ব:** ${distance > 0 ? distance + ' কিমি (আকাশপথ)' : 'তথ্য নেই'}  \n\n`;

        if (brtcRoutes.length > 0) {
            result += `### 🚌 বিআরটিসি (BRTC) বাস সার্ভিস:  \n`;
            brtcRoutes.forEach(br => {
                result += `- **${br.bnName}** (${br.type})  \n  রুট: ${br.routeString}  \n  ছাড়ার সময়: ${br.hours}  \n`;
            });
            result += `\n`;
        }

        result += `### প্রস্তাবিত যাতায়াত মাধ্যম:  \n\n`;

        // Plane (Only suggest via Dhaka if distance is > 250km)
        if (connFrom.plane && connTo.plane) {
            result += `✈️ **বিমানে** – সময়: ৪৫-৬০ মিনিট | ভাড়া: ৩,৫০০-৮,০০০ টাকা  \nসরাসরি ফ্লাইট উপলব্ধ। এয়ারলাইন্স: ইউএস-বাংলা, বিমান বাংলাদেশ, নভোএয়ার।  \n\n`;
        } else if (from !== 'Dhaka' && to !== 'Dhaka' && connTo.plane && distance > 250) {
            result += `✈️ **বিমানে (ঢাকা হয়ে)** – সময়: ৩-৪ ঘণ্টা | ভাড়া: ৫,০০০-১০,০০০ টাকা  \nপ্রথমে ঢাকা যান, তারপর সেখান থেকে কানেক্টিং ফ্লাইট।  \n\n`;
        }

        // Train
        if (trainInfo) {
            result += `🚂 **ট্রেনে (${trainInfo.trains.length > 1 ? 'আন্তঃনগর' : 'লোকাল/এক্সপ্রেস'})** – সময়: ${Math.max(2, Math.ceil(distance / 55))} ঘণ্টা (আনুমানিক) | ভাড়া: ${trainInfo.fare} টাকা  \n**ট্রেনের নাম:** ${trainInfo.trains.join(', ')}।  \n\n`;
        } else if (connFrom.train && connTo.train) {
            result += `🚂 **ট্রেনে (আন্তঃনগর)** – সময়: ${Math.max(4, Math.ceil(distance / 45))} ঘণ্টা (আনুমানিক) | ভাড়া: ৪০০-২,০০০ টাকা  \nআরামদায়ক এবং সাশ্রয়ী যাত্রা। আন্তঃনগর এক্সপ্রেস সার্ভিস।  \n\n`;
        }

        // Boat / Launch
        if (connTo.boat && (from === 'Dhaka' || connFrom.boat)) {
            result += `🚢 **লঞ্চ/জাহাজ** – সময়: ৮-১২ ঘণ্টা | ভাড়া: ৩০০-৩,০০০ টাকা  \nনদীমাতৃক বাংলার সৌন্দর্য উপভোগের সেরা মাধ্যম। টার্মিনাল: সদরঘাট (ঢাকা) বা স্থানীয় ঘাট।  \n\n`;
        }

        // Private Car / Jeep / Local Bus (For short distances or Hill tracks)
        if (distance < 120 || from === "Bandarban" || to === "Bandarban" || from === "Rangamati" || to === "Rangamati") {
            result += `🚗 **প্রাইভেট কার / জিপ / লোকাল বাস:**  \nস্বল্প দূরত্বের জন্য লোকাল বাস অথবা রিজার্ভ কার/মাইক্রোবাস সুবিধাজনক।  \n`;
            if (from.includes("Bandarban") || to.includes("Bandarban") || from.includes("Rangamati") || to.includes("Rangamati")) {
                result += `পাহাড়ি এলাকায় (যেমন: বান্দরবান/রাঙ্গামাটি) "চান্দের গাড়ি" (Jeep) রিজার্ভ করে ঘুরে দেখা সবচেয়ে জনপ্রিয়।  \n`;
            }
            // Specific: Bandarban <-> Cox's Bazar
            if ((from === "Bandarban" && to === "Cox's Bazar") || (from === "Cox's Bazar" && to === "Bandarban")) {
                result += `💡 **বিশেষ টিপ:** বান্দরবান ও কক্সবাজারের মধ্যে সরাসরি **"পূর্বানী"** বা **"মারশা"** বাস চলে। ভাড়া ২০০-৩০০ টাকা। সময় লাগে ২.৫ - ৩ ঘণ্টা। এছাড়া প্রাইভেট কার বা জিপ রিজার্ভ করা যায়।  \n`;
            }
            result += `\n`;
        }

        // Bus
        result += `🚌 **বাস (সরাসরি)** – সময়: ${Math.max(2, Math.ceil(distance / 35))} ঘণ্টা (আনুমানিক) | ভাড়া: ${Math.max(150, Math.ceil(distance * 3))}-৩,০০০ টাকা  \nসবচেয়ে সহজলভ্য মাধ্যম। এসি, নন-এসি এবং স্লিপার কোচ পাওয়া যায়।  \n**জনপ্রিয় অপারেটর:** হানিফ, শ্যামলী, এনা, গ্রিন লাইন, দেশ ট্রাভেলস, এস.আলম, সউদিয়া।  \n\n`;


        // Via Hub Suggestion logic
        let hubResult = '';
        if (distance > 150 && brtcRoutes.length === 0) {
            // Find if both can connect to a common high-tier hub (Dhaka or Divisional Capital)
            const possibleHubs = MAJOR_HUBS.filter(h => h !== from && h !== to);
            let selectedHub = "";

            if (from !== "Dhaka" && to !== "Dhaka") {
                selectedHub = "Dhaka"; // Dhaka is the primary hub for almost everything
            } else if (from === "Dhaka") {
                // If going from Dhaka to somewhere obscure, maybe suggest a regional hub
                if (distance > 300) {
                    if (to.includes('Khulna') || to.includes('Jashore')) selectedHub = "Jashore";
                    else if (to.includes('Rangpur') || to.includes('Bogura')) selectedHub = "Bogura";
                }
            }

            if (selectedHub) {
                hubResult = `🔍 **বিকল্প যাতায়াত (ভায়া ${selectedHub}):**  \nসরাসরি ভালো সার্ভিস না পেলে আপনি প্রথমে **${selectedHub}** যেতে পারেন, তারপর সেখান থেকে **${to}** এর বাস বা ট্রেনে যাতায়াত করতে পারেন। এটি সাধারণত বেশি আরামদায়ক হয়।  \n\n`;
            }
        }
        result += hubResult;

        // Specific logic for Benapole to Khulna (Via Jashore)
        if (from === "Benapole" && to === "Khulna") {
            result += `💡 **পরামর্শ:** বেনাপোল থেকে খুলনা যাওয়ার জন্য সরাসরি বাসের পাশাপাশি আপনি প্রথমে লোকাল বাসে **যশোর** যেতে পারেন (ভাড়া ৪০-৫০ টাকা), তারপর যশোর থেকে খুলনা যাওয়ার জন্য প্রতি ১৫-২০ মিনিট অন্তর বাস এবং দিনে একাধিক ট্রেন পাবেন।  \n\n`;
        }

        if (to === "Saint Martin's Island") {
            result += `⚠️ **বিশেষ দ্রষ্টব্য:** সেন্টমার্টিন যাওয়ার জন্য আপনাকে অবশ্যই প্রথমে টেকনাফ বা কক্সবাজার পৌঁছাতে হবে, তারপর সেখান থেকে জাহাজে উঠতে হবে। সরাসরি বাস টেকনাফ পর্যন্ত যায়।  \n\n`;
        }

    } else {
        result = `**Route: ${from} to ${to}**  \n`;
        result += `**Distance:** ${distance > 0 ? distance + ' km (Great-circle distance)' : 'N/A'}  \n\n`;

        if (brtcRoutes.length > 0) {
            result += `### 🚌 BRTC Bus Services:  \n`;
            brtcRoutes.forEach(br => {
                result += `- **${br.name}** (${br.type})  \n  Route: ${br.routeString}  \n  Schedules: ${br.hours}  \n`;
            });
            result += '\n';
        }

        result += `### Recommended Modes:  \n\n`;

        // Plane (Distance check)
        if (connFrom.plane && connTo.plane) {
            result += `✈️ **By Air** – Time: 45-60 min | Price: 3,500-8,000 BDT  \nDirect flights are available. Airlines: US-Bangla, Biman Bangladesh, Novoair.  \n\n`;
        } else if (from !== 'Dhaka' && to !== 'Dhaka' && connTo.plane && distance > 250) {
            result += `✈️ **By Air (via Dhaka)** – Time: 3-4 hours | Price: 5,000-10,000 BDT  \nTake a connecting flight via Dhaka.  \n\n`;
        }

        // Train
        if (trainInfo) {
            result += `🚂 **By Train (${trainInfo.trains.length > 1 ? 'Intercity' : 'Local/Express'})** – Time: ${Math.max(2, Math.ceil(distance / 55))} hours (Est.) | Price: ${trainInfo.fare} BDT  \n**Trains:** ${trainInfo.trains.join(', ')}.  \n\n`;
        } else if (connFrom.train && connTo.train) {
            result += `🚂 **By Train (Intercity)** – Time: ${Math.max(4, Math.ceil(distance / 45))} hours (Est.) | Price: 400-2,000 BDT  \nGreat journey through Bangladesh via Intercity Express.  \n\n`;
        }

        // Boat
        if (connTo.boat && (from === 'Dhaka' || connFrom.boat)) {
            result += `🚢 **By Launch / Ship** – Time: 8-12 hours | Price: 300-3,000 BDT  \nBest way to travel to Southern districts. Terminal: Sadarghat or local ports.  \n\n`;
        }

        // Short Distance / Car / Jeep
        if (distance < 120 || from === "Bandarban" || to === "Bandarban" || from === "Rangamati" || to === "Rangamati") {
            result += `🚗 **Private Car / Jeep / Local Bus:**  \nFor short distances, local buses or Rent-a-Car services are convenient.  \n`;
            if (from.includes("Bandarban") || to.includes("Bandarban") || from.includes("Rangamati") || to.includes("Rangamati")) {
                result += `In Hill Tracts (e.g. Bandarban), "Chander Gari" (Jeep) is the most popular way to travel.  \n`;
            }
            // Specific: Bandarban <-> Cox's Bazar
            if ((from === "Bandarban" && to === "Cox's Bazar") || (from === "Cox's Bazar" && to === "Bandarban")) {
                result += `💡 **Tip:** Direct **"Purbani"** or **"Marsa"** buses run between local terminals. Fare: 200-300 BDT. Time: 2.5 - 3 Hours. You can also hire a private car/jeep.  \n`;
            }
            result += `\n`;
        }

        // Bus General (Always show)
        result += `🚌 **Bus (Direct)** – Time: ${Math.max(2, Math.ceil(distance / 35))} hours (Est.) | Price: ${Math.max(150, Math.ceil(distance * 3))}-3,000 BDT  \nMost flexible option. AC, Non-AC, and Sleeper coaches available.  \n**Operators:** Hanif, Shyamoli, Ena, Green Line, Desh Travels, S.Alam.  \n\n`;


        if (distance > 150 && brtcRoutes.length === 0) {
            let selectedHub = "";
            if (from !== "Dhaka" && to !== "Dhaka") selectedHub = "Dhaka";
            else if (from === "Dhaka" && distance > 300) {
                if (to.includes('Khulna') || to.includes('Jashore')) selectedHub = "Jashore";
                else if (to.includes('Rangpur') || to.includes('Bogura')) selectedHub = "Bogura";
            }

            if (selectedHub) {
                result += `🔍 **Alternative Route (via ${selectedHub}):**  \nIf direct service is poor, first travel to **${selectedHub}** and then find frequent transport to **${to}**.  \n\n`;
            }
        }

        if (from === "Benapole" && to === "Khulna") {
            result += `💡 **Tip:** Instead of a direct bus, you can take a local bus to **Jashore** (40-50 BDT), then find frequent buses or trains to Khulna.  \n\n`;
        }

        if (to === "Saint Martin's Island") {
            result += `⚠️ **Note:** To reach Saint Martin's, first reach Teknaf/Cox's Bazar, then take a ship.  \n\n`;
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
