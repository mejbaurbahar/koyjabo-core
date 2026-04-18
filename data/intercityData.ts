// Complete Inter-City Bus and Train Data for Bangladesh (All 64 Districts)
// This data includes bus operators, routes, costs, and train schedules

export interface IntercityBusRoute {
    district: string;
    division: string;
    busOperators: string[];
    mainContactNumber: string;
    route: string; //main route
    costNonAC: string;
    costAC: string;
}

export interface IntercityBusOperator {
    name: string;
    primaryRoute: string;
    mainCounterLocation: string;
    contactNumber: string;
}

export interface TrainFare {
    shuvan?: number;
    shuvanChair?: number;
    snigdha?: number;
    firstClassBerth?: number;
    acBerth?: number;
}

export interface TrainRoute {
    trainName: string;
    trainNo: string;
    offDay: string;
    dhakaDepart: string;
    destinationDepart: string;
    route: string;
    routeNotes?: string;
    destinationArrive?: string;
    dhakaArrive?: string;
    distanceKm?: number;
    fare?: TrainFare;
}

// Inter-City Bus Data for all 64 Districts
export const INTERCITY_BUS_ROUTES: IntercityBusRoute[] = [
    // Dhaka Division (13 Districts)
    { district: "Dhaka", division: "Dhaka", busOperators: ["Hub for all buses"], mainContactNumber: "-", route: "-", costNonAC: "-", costAC: "-" },
    { district: "Gazipur", division: "Dhaka", busOperators: ["Provati Banasree", "Soukhin", "Gazipur Paribahan"], mainContactNumber: "01712-965380", route: "Dhaka (Gulistan) ⇄ Gazipur", costNonAC: "৳100 - 150", costAC: "-" },
    { district: "Narayanganj", division: "Dhaka", busOperators: ["Bandhan", "Utsab", "Shital"], mainContactNumber: "01916-568326", route: "Dhaka (Gulistan) ⇄ Narayanganj", costNonAC: "৳55 - 80", costAC: "-" },
    { district: "Narsingdi", division: "Dhaka", busOperators: ["PPL", "Meghalaya Luxury", "Badsha"], mainContactNumber: "01711-163276", route: "Dhaka (Sayedabad) ⇄ Narsingdi", costNonAC: "৳250", costAC: "৳350" },
    { district: "Manikganj", division: "Dhaka", busOperators: ["Shubho Jatra", "Paturiagami", "Selfi"], mainContactNumber: "-", route: "Dhaka (Gabtoli) ⇄ Manikganj", costNonAC: "৳150", costAC: "৳250" },
    { district: "Munshiganj", division: "Dhaka", busOperators: ["Nayan", "Dighirpar Transport"], mainContactNumber: "-", route: "Dhaka (Gulistan) ⇄ Munshiganj", costNonAC: "৳100 - 150", costAC: "-" },
    { district: "Tangail", division: "Dhaka", busOperators: ["Nirala Super", "Dhaleshwari", "Jhatika"], mainContactNumber: "01711-356655", route: "Dhaka (Mohakhali) ⇄ Tangail", costNonAC: "৳300", costAC: "৳500" },
    { district: "Faridpur", division: "Dhaka", busOperators: ["Golden Line", "Hanif", "Sakura"], mainContactNumber: "01705-403333", route: "Dhaka (Gabtoli) ⇄ Faridpur", costNonAC: "৳400", costAC: "৳600" },
    { district: "Gopalganj", division: "Dhaka", busOperators: ["Tungipara Express", "Imad", "Dola"], mainContactNumber: "01711-266512", route: "Dhaka (Sayedabad) ⇄ Gopalganj", costNonAC: "৳500", costAC: "৳800" },
    { district: "Madaripur", division: "Dhaka", busOperators: ["Chandra Paribahan", "Sharbick"], mainContactNumber: "01716-249539", route: "Dhaka ⇄ Madaripur (via Padma Bridge)", costNonAC: "৳400", costAC: "৳600" },
    { district: "Rajbari", division: "Dhaka", busOperators: ["Rabeya", "Hanif", "Soudia"], mainContactNumber: "01713-402641", route: "Dhaka ⇄ Rajbari", costNonAC: "৳450", costAC: "৳700" },
    { district: "Shariatpur", division: "Dhaka", busOperators: ["Shariatpur Super", "Glory Express"], mainContactNumber: "01712-588339", route: "Dhaka ⇄ Shariatpur", costNonAC: "৳400", costAC: "৳600" },
    { district: "Kishoreganj", division: "Dhaka", busOperators: ["Ena Transport", "Anannya Classic", "Jalsiri"], mainContactNumber: "01712-069722", route: "Dhaka (Mohakhali) ⇄ Kishoreganj", costNonAC: "৳400", costAC: "৳600" },

    // Chattogram Division (11 Districts)
    { district: "Chattogram", division: "Chattogram", busOperators: ["Green Line", "Saudia", "Hanif", "Shyamoli"], mainContactNumber: "16557", route: "Dhaka ⇄ Chattogram", costNonAC: "৳680", costAC: "৳1000-1500" },
    { district: "Cox's Bazar", division: "Chattogram", busOperators: ["St. Martin", "Green Line", "Shyamoli"], mainContactNumber: "01762-691341", route: "Dhaka ⇄ Cox's Bazar", costNonAC: "৳900", costAC: "৳1600-2500" },
    { district: "Cumilla", division: "Chattogram", busOperators: ["Tisha Plus", "Asia Line", "Prince"], mainContactNumber: "01711-386408", route: "Dhaka (Sayedabad) ⇄ Cumilla", costNonAC: "৳350", costAC: "৳500" },
    { district: "Brahmanbaria", division: "Chattogram", busOperators: ["Tisha", "Ena", "Royal"], mainContactNumber: "01711-386408", route: "Dhaka ⇄ Brahmanbaria", costNonAC: "৳350", costAC: "৳500" },
    { district: "Chandpur", division: "Chattogram", busOperators: ["Padma Exclusive", "Al-Arafah"], mainContactNumber: "01915-467069", route: "Dhaka ⇄ Chandpur", costNonAC: "৳400", costAC: "৳600" },
    { district: "Feni", division: "Chattogram", busOperators: ["Star Line", "Ena", "Dream Line"], mainContactNumber: "01730-028006", route: "Dhaka ⇄ Feni", costNonAC: "৳450", costAC: "৳650" },
    { district: "Noakhali", division: "Chattogram", busOperators: ["Ekushey", "Himachal", "Ekhlas"], mainContactNumber: "01712-877797", route: "Dhaka ⇄ Noakhali", costNonAC: "৳500", costAC: "৳700" },
    { district: "Lakshmipur", division: "Chattogram", busOperators: ["Ekhlas", "Himachal", "Jonaki"], mainContactNumber: "01711-422477", route: "Dhaka ⇄ Lakshmipur", costNonAC: "৳550", costAC: "৳750" },
    { district: "Khagrachhari", division: "Chattogram", busOperators: ["Shyamoli", "Saintmartin", "Shanti"], mainContactNumber: "01970-060070", route: "Dhaka ⇄ Khagrachhari", costNonAC: "৳750", costAC: "৳1200" },
    { district: "Rangamati", division: "Chattogram", busOperators: ["Shyamoli", "Dolphin", "Saintmartin"], mainContactNumber: "01716-964648", route: "Dhaka ⇄ Rangamati", costNonAC: "৳850", costAC: "৳1200" },
    { district: "Bandarban", division: "Chattogram", busOperators: ["Shyamoli", "Saintmartin", "Dolphin"], mainContactNumber: "01762-691341", route: "Dhaka ⇄ Bandarban", costNonAC: "৳850", costAC: "৳1300" },

    // Rajshahi Division (8 Districts)
    { district: "Rajshahi", division: "Rajshahi", busOperators: ["Desh Travels", "National", "Grameen"], mainContactNumber: "01762-684433", route: "Dhaka ⇄ Rajshahi", costNonAC: "৳650", costAC: "৳1000-1400" },
    { district: "Chapai Nawabganj", division: "Rajshahi", busOperators: ["Desh Travels", "Modern", "Grameen"], mainContactNumber: "01762-684433", route: "Dhaka ⇄ Chapai Nawabganj", costNonAC: "৳800", costAC: "৳1300" },
    { district: "Natore", division: "Rajshahi", busOperators: ["Desh Travels", "Hanif", "National"], mainContactNumber: "01713-402641", route: "Dhaka ⇄ Natore", costNonAC: "৳600", costAC: "৳1000" },
    { district: "Naogaon", division: "Rajshahi", busOperators: ["SR Travels", "Agomony", "Hanif"], mainContactNumber: "01716-560641", route: "Dhaka ⇄ Naogaon", costNonAC: "৳650", costAC: "৳1000" },
    { district: "Pabna", division: "Rajshahi", busOperators: ["Pabna Express", "C-Line", "Sarkar"], mainContactNumber: "01750-143092", route: "Dhaka ⇄ Pabna", costNonAC: "৳550", costAC: "৳800" },
    { district: "Sirajganj", division: "Rajshahi", busOperators: ["SI Enterprise", "Sirajganj Express", "Hanif"], mainContactNumber: "01713-402641", route: "Dhaka ⇄ Sirajganj", costNonAC: "৳450", costAC: "৳700" },
    { district: "Bogura", division: "Rajshahi", busOperators: ["SR Travels", "Shah Fateh Ali", "One Travel"], mainContactNumber: "01716-560641", route: "Dhaka ⇄ Bogura", costNonAC: "৳500", costAC: "৳900" },
    { district: "Joypurhat", division: "Rajshahi", busOperators: ["Hanif", "SR Travels", "Shyamoli"], mainContactNumber: "01713-402641", route: "Dhaka ⇄ Joypurhat", costNonAC: "৳600", costAC: "৳1000" },

    // Khulna Division (10 Districts)
    { district: "Khulna", division: "Khulna", busOperators: ["Sohag", "Hanif", "Tungipara Express"], mainContactNumber: "01711-612433", route: "Dhaka ⇄ Khulna", costNonAC: "৳650", costAC: "৳1200" },
    { district: "Bagerhat", division: "Khulna", busOperators: ["Hanif", "Tungipara Express", "Falguni"], mainContactNumber: "01711-266512", route: "Dhaka ⇄ Bagerhat", costNonAC: "৳700", costAC: "৳1200" },
    { district: "Satkhira", division: "Khulna", busOperators: ["Satkhira Express", "SP Golden Line"], mainContactNumber: "01711-357833", route: "Dhaka ⇄ Satkhira", costNonAC: "৳700", costAC: "৳1200" },
    { district: "Jashore", division: "Khulna", busOperators: ["Green Line", "Eagle", "Sohag"], mainContactNumber: "16557", route: "Dhaka ⇄ Jashore", costNonAC: "৳600", costAC: "৳1100" },
    { district: "Jhenaidah", division: "Khulna", busOperators: ["Royal", "Purbasha", "Chuadanga Deluxe"], mainContactNumber: "01711-350616", route: "Dhaka ⇄ Jhenaidah", costNonAC: "৳650", costAC: "৳1000" },
    { district: "Magura", division: "Khulna", busOperators: ["Hanif", "Sohag", "Eagle"], mainContactNumber: "01713-402641", route: "Dhaka ⇄ Magura", costNonAC: "৳550", costAC: "৳900" },
    { district: "Narail", division: "Khulna", busOperators: ["Eagle Paribahan", "Hanif"], mainContactNumber: "01711-4022341", route: "Dhaka ⇄ Narail", costNonAC: "৳550", costAC: "৳900" },
    { district: "Kushtia", division: "Khulna", busOperators: ["SB Super Deluxe", "Shyamoli", "Hanif"], mainContactNumber: "01712-230983", route: "Dhaka ⇄ Kushtia", costNonAC: "৳600", costAC: "৳900+" },
    { district: "Chuadanga", division: "Khulna", busOperators: ["Purbasha", "Royal", "Darshana Deluxe"], mainContactNumber: "01711-350616", route: "Dhaka ⇄ Chuadanga", costNonAC: "৳700", costAC: "৳1100" },
    { district: "Meherpur", division: "Khulna", busOperators: ["Meherpur Deluxe", "JR Paribahan"], mainContactNumber: "01711-350616", route: "Dhaka ⇄ Meherpur", costNonAC: "৳700", costAC: "৳1100" },

    // Barishal Division (6 Districts)
    { district: "Barishal", division: "Barishal", busOperators: ["Sakura", "Hanif", "Surjomukhi"], mainContactNumber: "01729-556677", route: "Dhaka ⇄ Barishal", costNonAC: "৳500", costAC: "৳900" },
    { district: "Bhola", division: "Barishal", busOperators: ["Bhola Paribahan", "Green St. Martin"], mainContactNumber: "01762-691341", route: "Dhaka ⇄ Bhola (or via Launch)", costNonAC: "৳600", costAC: "৳800" },
    { district: "Jhalokathi", division: "Barishal", busOperators: ["Sakura", "Hanif", "Sugandha"], mainContactNumber: "01729-556677", route: "Dhaka ⇄ Jhalokathi", costNonAC: "৳600", costAC: "৳900" },
    { district: "Pirojpur", division: "Barishal", busOperators: ["Imad", "Dola", "Tungipara"], mainContactNumber: "01711-266512", route: "Dhaka ⇄ Pirojpur", costNonAC: "৳600", costAC: "৳900" },
    { district: "Patukhali", division: "Barishal", busOperators: ["Sakura", "Green Line", "Kuakata Express"], mainContactNumber: "16557", route: "Dhaka ⇄ Patuakhali", costNonAC: "৳650", costAC: "৳1000" },
    { district: "Barguna", division: "Barishal", busOperators: ["Sakura", "Hanif", "Abdullah"], mainContactNumber: "01729-556677", route: "Dhaka ⇄ Barguna", costNonAC: "৳700", costAC: "৳1000" },

    // Sylhet Division (4 Districts)
    { district: "Sylhet", division: "Sylhet", busOperators: ["Ena", "Green Line", "London Express"], mainContactNumber: "01713-100200", route: "Dhaka ⇄ Sylhet", costNonAC: "৳570", costAC: "৳1200-1400" },
    { district: "Moulvibazar", division: "Sylhet", busOperators: ["Ena", "Shyamoli", "Hanif"], mainContactNumber: "01712-069722", route: "Dhaka ⇄ Moulvibazar", costNonAC: "৳550", costAC: "৳900" },
    { district: "Habiganj", division: "Sylhet", busOperators: ["Ena", "Diganta", "Modern"], mainContactNumber: "01712-069722", route: "Dhaka ⇄ Habiganj", costNonAC: "৳450", costAC: "৳700" },
    { district: "Sunamganj", division: "Sylhet", busOperators: ["Shyamoli", "Mamun", "Ena"], mainContactNumber: "01716-964648", route: "Dhaka ⇄ Sunamganj", costNonAC: "৳700", costAC: "৳1100" },

    // Rangpur Division (8 Districts)
    { district: "Rangpur", division: "Rangpur", busOperators: ["Nabil", "SR Travels", "Ena", "Agomony"], mainContactNumber: "01985-555554", route: "Dhaka ⇄ Rangpur", costNonAC: "৳800", costAC: "৳1300" },
    { district: "Dinajpur", division: "Rangpur", busOperators: ["Nabil", "Hanif", "Bablu Enterprise"], mainContactNumber: "01193-106611", route: "Dhaka ⇄ Dinajpur", costNonAC: "৳850", costAC: "৳1400" },
    { district: "Thakurgaon", division: "Rangpur", busOperators: ["Nabil", "Hanif", "Karnaphuli"], mainContactNumber: "01193-106611", route: "Dhaka ⇄ Thakurgaon", costNonAC: "৳950", costAC: "৳1600" },
    { district: "Panchagarh", division: "Rangpur", busOperators: ["Nabil", "Hanif"], mainContactNumber: "01193-106611", route: "Dhaka ⇄ Panchagarh", costNonAC: "৳1000", costAC: "৳1600" },
    { district: "Nilphamari", division: "Rangpur", busOperators: ["Nabil", "Agomony", "SR Travels"], mainContactNumber: "01985-555554", route: "Dhaka ⇄ Nilphamari", costNonAC: "৳850", costAC: "৳1400" },
    { district: "Kurigram", division: "Rangpur", busOperators: ["Nabil", "Hanif", "SR Travels"], mainContactNumber: "01713-402641", route: "Dhaka ⇄ Kurigram", costNonAC: "৳850", costAC: "৳1300" },
    { district: "Lalmonirhat", division: "Rangpur", busOperators: ["Nabil", "SR Travels", "Hanif"], mainContactNumber: "01716-560641", route: "Dhaka ⇄ Lalmonirhat", costNonAC: "৳850", costAC: "৳1300" },
    { district: "Gaibandha", division: "Rangpur", busOperators: ["Al Hamra", "SR Travels", "Hanif"], mainContactNumber: "01716-560641", route: "Dhaka ⇄ Gaibandha", costNonAC: "৳700", costAC: "৳1100" },

    // Mymensingh Division (4 Districts)
    { district: "Mymensingh", division: "Mymensingh", busOperators: ["Ena Transport", "Soukhin", "Alam Asia"], mainContactNumber: "01712-069722", route: "Dhaka (Mohakhali) ⇄ Mymensingh", costNonAC: "৳350", costAC: "৳500" },
    { district: "Jamalpur", division: "Mymensingh", busOperators: ["Rajib", "Ena", "Mahanagar"], mainContactNumber: "01712-069722", route: "Dhaka ⇄ Jamalpur", costNonAC: "৳450", costAC: "৳700" },
    { district: "Sherpur", division: "Mymensingh", busOperators: ["Sonar Bangla", "Ena", "Dreamland"], mainContactNumber: "01712-069722", route: "Dhaka ⇄ Sherpur", costNonAC: "৳450", costAC: "৳700" },
    { district: "Netrokona", division: "Mymensingh", busOperators: ["Mohua", "Shahjalal", "Ena"], mainContactNumber: "01712-069722", route: "Dhaka ⇄ Netrokona", costNonAC: "৳450", costAC: "৳700" },
];

// Major Transport Hubs (Non-District HQ)
export const MAJOR_TRANSPORT_HUBS: IntercityBusRoute[] = [
    { district: "Benapole", division: "Khulna", busOperators: ["Green Line", "Sohag", "Shyamoli", "SP Golden"], mainContactNumber: "16557", route: "Dhaka ⇄ Benapole (Land Port)", costNonAC: "৳700", costAC: "৳1200-1500" },
    { district: "Teknaf", division: "Chattogram", busOperators: ["Saintmartin", "Shyamoli", "Relax", "Soudia"], mainContactNumber: "01762-691341", route: "Dhaka ⇄ Teknaf", costNonAC: "৳1100", costAC: "৳1800+" },
    { district: "Kuakata", division: "Barishal", busOperators: ["Sakura", "Green Line", "Kuakata Express"], mainContactNumber: "01711-131742", route: "Dhaka ⇄ Kuakata (Beach)", costNonAC: "৳850", costAC: "৳1200-1600" },
    { district: "Sreemangal", division: "Sylhet", busOperators: ["Ena", "Shyamoli", "Hanif"], mainContactNumber: "01712-069722", route: "Dhaka ⇄ Sreemangal", costNonAC: "৳550", costAC: "৳900" },
    { district: "Bhairab", division: "Dhaka", busOperators: ["Ena", "Anannya", "Chalantika"], mainContactNumber: "01712-069722", route: "Dhaka ⇄ Bhairab", costNonAC: "৳300", costAC: "৳450" },
];

// Train Routes from Dhaka (Kamalapur) to Major Stations
// Data sourced from eticket.railway.gov.bd — updated 2026
export const TRAIN_ROUTES: TrainRoute[] = [
    // ── Chattogram Division ──────────────────────────────────────────────────
    {
        trainName: "Suborna Express", trainNo: "701/702",
        offDay: "Mon (from Ctg), Fri (from Dhk)",
        dhakaDepart: "16:30", destinationDepart: "07:00",
        destinationArrive: "21:25", dhakaArrive: "12:30",
        route: "Dhaka ⇄ Chattogram", distanceKm: 321,
        routeNotes: "Premium express — stops at Airport only",
        fare: { shuvan: 340, shuvanChair: 495, snigdha: 820, firstClassBerth: 655, acBerth: 985 },
    },
    {
        trainName: "Sonar Bangla Express", trainNo: "787/788",
        offDay: "Tue (from Ctg), Wed (from Dhk)",
        dhakaDepart: "07:00", destinationDepart: "16:45",
        destinationArrive: "11:55", dhakaArrive: "22:00",
        route: "Dhaka ⇄ Chattogram", distanceKm: 321,
        routeNotes: "Premium express — stops at Airport only",
        fare: { shuvan: 365, shuvanChair: 545, snigdha: 1090, firstClassBerth: 840, acBerth: 1645 },
    },
    {
        trainName: "Mahanagar Provati", trainNo: "703/704",
        offDay: "No Off Day",
        dhakaDepart: "07:45", destinationDepart: "12:30",
        destinationArrive: "13:35", dhakaArrive: "19:00",
        route: "Dhaka ⇄ Chattogram", distanceKm: 321,
        routeNotes: "Stops at Bhairab, B.Baria, Cumilla, Feni",
        fare: { shuvan: 340, shuvanChair: 510, snigdha: 1000, firstClassBerth: 780, acBerth: 1580 },
    },
    {
        trainName: "Turna Nishita Express", trainNo: "741/742",
        offDay: "No Off Day",
        dhakaDepart: "23:15", destinationDepart: "23:00",
        destinationArrive: "05:15", dhakaArrive: "05:00",
        route: "Dhaka ⇄ Chattogram", distanceKm: 321,
        routeNotes: "Night express — stops at B.Baria, Cumilla, Feni",
        fare: { shuvan: 340, shuvanChair: 510, snigdha: 1000, firstClassBerth: 780, acBerth: 1580 },
    },
    {
        trainName: "Mahanagar Godhuli", trainNo: "705/706",
        offDay: "No Off Day",
        dhakaDepart: "14:40", destinationDepart: "06:30",
        destinationArrive: "21:00", dhakaArrive: "12:30",
        route: "Dhaka ⇄ Chattogram", distanceKm: 321,
        routeNotes: "Evening intercity — stops at B.Baria, Cumilla, Feni",
        fare: { shuvan: 340, shuvanChair: 510, snigdha: 1000, firstClassBerth: 780, acBerth: 1580 },
    },
    {
        trainName: "Mahanagar Express", trainNo: "721/722",
        offDay: "Sun",
        dhakaDepart: "21:20", destinationDepart: "12:30",
        destinationArrive: "03:30", dhakaArrive: "19:10",
        route: "Dhaka ⇄ Chattogram", distanceKm: 321,
        fare: { shuvan: 345, shuvanChair: 520, snigdha: 1040, firstClassBerth: 800, acBerth: 1560 },
    },
    {
        trainName: "Chattala Express", trainNo: "801/802",
        offDay: "Tue",
        dhakaDepart: "14:15", destinationDepart: "08:30",
        destinationArrive: "20:30", dhakaArrive: "15:15",
        route: "Dhaka ⇄ Chattogram", distanceKm: 321,
        fare: { shuvan: 265, shuvanChair: 400, snigdha: 800 },
    },
    {
        trainName: "Karnaphuli Express", trainNo: "799/800",
        offDay: "Wed (from Dhk), Thu (from Ctg)",
        dhakaDepart: "22:00", destinationDepart: "21:30",
        destinationArrive: "04:00", dhakaArrive: "03:30",
        route: "Dhaka ⇄ Chattogram", distanceKm: 321,
        fare: { shuvan: 340, shuvanChair: 510, snigdha: 1000, firstClassBerth: 780, acBerth: 1580 },
    },
    {
        trainName: "Cox's Bazar Express", trainNo: "813/814",
        offDay: "Mon (from Dhk), Tue (from CXB)",
        dhakaDepart: "23:00", destinationDepart: "12:30",
        destinationArrive: "07:20", dhakaArrive: "23:00",
        route: "Dhaka ⇄ Cox's Bazar", distanceKm: 420,
        fare: { shuvan: 505, shuvanChair: 755, snigdha: 1400, firstClassBerth: 1100, acBerth: 2100 },
    },
    {
        trainName: "Parjotak Express", trainNo: "815/816",
        offDay: "Wed",
        dhakaDepart: "06:15", destinationDepart: "19:45",
        destinationArrive: "14:40", dhakaArrive: "04:20",
        route: "Dhaka ⇄ Cox's Bazar", distanceKm: 420,
        fare: { shuvan: 505, shuvanChair: 755, snigdha: 1400, firstClassBerth: 1100, acBerth: 2100 },
    },
    {
        trainName: "Upakul Express", trainNo: "711/712",
        offDay: "Tue (from Dhk), Wed (from Noakhali)",
        dhakaDepart: "15:20", destinationDepart: "06:00",
        destinationArrive: "22:30", dhakaArrive: "12:30",
        route: "Dhaka ⇄ Noakhali", distanceKm: 250,
        fare: { shuvan: 250, shuvanChair: 375, snigdha: 730, firstClassBerth: 580, acBerth: 1090 },
    },
    {
        trainName: "Noakhali Express", trainNo: "785/786",
        offDay: "Fri (from Dhk), Sat (from Noakhali)",
        dhakaDepart: "09:00", destinationDepart: "16:30",
        destinationArrive: "15:30", dhakaArrive: "23:00",
        route: "Dhaka ⇄ Noakhali", distanceKm: 250,
        fare: { shuvan: 250, shuvanChair: 375, snigdha: 730, firstClassBerth: 580, acBerth: 1090 },
    },

    // ── Sylhet Division ──────────────────────────────────────────────────────
    {
        trainName: "Parabat Express", trainNo: "709/710",
        offDay: "Tue",
        dhakaDepart: "06:20", destinationDepart: "15:00",
        destinationArrive: "12:30", dhakaArrive: "21:30",
        route: "Dhaka ⇄ Sylhet", distanceKm: 258,
        fare: { shuvan: 270, shuvanChair: 405, snigdha: 795, firstClassBerth: 615, acBerth: 1195 },
    },
    {
        trainName: "Joyantika Express", trainNo: "717/718",
        offDay: "Tue (from Sylhet)",
        dhakaDepart: "11:15", destinationDepart: "11:15",
        destinationArrive: "17:30", dhakaArrive: "17:30",
        route: "Dhaka ⇄ Sylhet", distanceKm: 258,
        fare: { shuvan: 270, shuvanChair: 405, snigdha: 795, firstClassBerth: 615, acBerth: 1195 },
    },
    {
        trainName: "Kalni Express", trainNo: "773/774",
        offDay: "Fri",
        dhakaDepart: "13:00", destinationDepart: "06:15",
        destinationArrive: "19:30", dhakaArrive: "12:30",
        route: "Dhaka ⇄ Sylhet", distanceKm: 258,
        fare: { shuvan: 270, shuvanChair: 405, snigdha: 795, firstClassBerth: 615, acBerth: 1195 },
    },
    {
        trainName: "Upaban Express", trainNo: "739/740",
        offDay: "Wed (from Sylhet), Thu (from Dhk)",
        dhakaDepart: "20:30", destinationDepart: "23:30",
        destinationArrive: "03:30", dhakaArrive: "06:30",
        route: "Dhaka ⇄ Sylhet", distanceKm: 258,
        fare: { shuvan: 270, shuvanChair: 405, snigdha: 795, firstClassBerth: 615, acBerth: 1195 },
    },
    {
        trainName: "Udayan Express", trainNo: "719/720",
        offDay: "Tue (from Dhk), Wed (from Sylhet)",
        dhakaDepart: "21:30", destinationDepart: "21:30",
        destinationArrive: "06:30", dhakaArrive: "06:30",
        route: "Dhaka ⇄ Sylhet", distanceKm: 317,
        fare: { shuvan: 330, shuvanChair: 495, snigdha: 975, firstClassBerth: 750, acBerth: 1450 },
    },

    // ── Rajshahi Division ────────────────────────────────────────────────────
    {
        trainName: "Banalata Express", trainNo: "791/792",
        offDay: "Fri",
        dhakaDepart: "13:30", destinationDepart: "07:00",
        destinationArrive: "19:15", dhakaArrive: "13:00",
        route: "Dhaka ⇄ Chapainawabganj", distanceKm: 256,
        routeNotes: "Via Rajshahi",
        fare: { shuvan: 265, shuvanChair: 395, snigdha: 770, firstClassBerth: 600, acBerth: 1160 },
    },
    {
        trainName: "Silk City Express", trainNo: "753/754",
        offDay: "Sun",
        dhakaDepart: "14:30", destinationDepart: "07:40",
        destinationArrive: "20:20", dhakaArrive: "13:30",
        route: "Dhaka ⇄ Rajshahi", distanceKm: 256,
        fare: { shuvan: 265, shuvanChair: 395, snigdha: 770, firstClassBerth: 600, acBerth: 1160 },
    },
    {
        trainName: "Padma Express", trainNo: "759/760",
        offDay: "Tue",
        dhakaDepart: "23:00", destinationDepart: "16:00",
        destinationArrive: "05:30", dhakaArrive: "22:30",
        route: "Dhaka ⇄ Rajshahi", distanceKm: 256,
        fare: { shuvan: 265, shuvanChair: 395, snigdha: 770, firstClassBerth: 600, acBerth: 1160 },
    },
    {
        trainName: "Dhumketu Express", trainNo: "769/770",
        offDay: "Thu (from Raj), Sat (from Dhk)",
        dhakaDepart: "06:00", destinationDepart: "23:20",
        destinationArrive: "11:40", dhakaArrive: "05:00",
        route: "Dhaka ⇄ Rajshahi", distanceKm: 256,
        fare: { shuvan: 265, shuvanChair: 395, snigdha: 770, firstClassBerth: 600, acBerth: 1160 },
    },
    {
        trainName: "Mohananda Express", trainNo: "777/778",
        offDay: "Tue (from Dhk), Wed (from Chapai)",
        dhakaDepart: "07:40", destinationDepart: "16:30",
        destinationArrive: "15:30", dhakaArrive: "00:15",
        route: "Dhaka ⇄ Chapainawabganj", distanceKm: 310,
        fare: { shuvan: 325, shuvanChair: 485, snigdha: 955, firstClassBerth: 735, acBerth: 1430 },
    },

    // ── Khulna Division ──────────────────────────────────────────────────────
    {
        trainName: "Chitra Express", trainNo: "763/764",
        offDay: "Mon",
        dhakaDepart: "19:30", destinationDepart: "09:00",
        destinationArrive: "04:40", dhakaArrive: "17:00",
        route: "Dhaka ⇄ Khulna", distanceKm: 272,
        fare: { shuvan: 290, shuvanChair: 430, snigdha: 840, firstClassBerth: 655, acBerth: 1270 },
    },
    {
        trainName: "Sundarban Express", trainNo: "725/726",
        offDay: "Tue (from Dhk), Wed (from Khulna)",
        dhakaDepart: "08:00", destinationDepart: "21:45",
        destinationArrive: "15:40", dhakaArrive: "05:15",
        route: "Dhaka ⇄ Khulna", distanceKm: 272,
        fare: { shuvan: 290, shuvanChair: 430, snigdha: 840, firstClassBerth: 655, acBerth: 1270 },
    },
    {
        trainName: "Rupsha Express", trainNo: "747/748",
        offDay: "Sun (from Dhk), Mon (from Khulna)",
        dhakaDepart: "09:00", destinationDepart: "08:00",
        destinationArrive: "16:30", dhakaArrive: "16:00",
        route: "Dhaka ⇄ Khulna", distanceKm: 305,
        fare: { shuvan: 320, shuvanChair: 480, snigdha: 940, firstClassBerth: 725, acBerth: 1410 },
    },
    {
        trainName: "Jahanabad Express", trainNo: "825/826",
        offDay: "Mon",
        dhakaDepart: "20:00", destinationDepart: "06:00",
        destinationArrive: "23:45", dhakaArrive: "09:45",
        route: "Dhaka ⇄ Khulna", distanceKm: 210,
        routeNotes: "Via Padma Bridge (Bhanga–Narail)",
        fare: { shuvan: 220, shuvanChair: 330, snigdha: 650, firstClassBerth: 450, acBerth: 1050 },
    },
    {
        trainName: "Benapole Express", trainNo: "795/796",
        offDay: "Wed",
        dhakaDepart: "23:45", destinationDepart: "13:00",
        destinationArrive: "07:20", dhakaArrive: "20:45",
        route: "Dhaka ⇄ Benapole", distanceKm: 298,
        fare: { shuvan: 310, shuvanChair: 465, snigdha: 910, firstClassBerth: 710, acBerth: 1370 },
    },

    // ── Rangpur Division ─────────────────────────────────────────────────────
    {
        trainName: "Rangpur Express", trainNo: "771/772",
        offDay: "Sun (from Dhk), Mon (from Rng)",
        dhakaDepart: "09:10", destinationDepart: "20:10",
        destinationArrive: "17:30", dhakaArrive: "05:00",
        route: "Dhaka ⇄ Rangpur", distanceKm: 350,
        fare: { shuvan: 375, shuvanChair: 565, snigdha: 1110, firstClassBerth: 860, acBerth: 1660 },
    },
    {
        trainName: "Ekota Express", trainNo: "705/706",
        offDay: "Tue",
        dhakaDepart: "10:15", destinationDepart: "21:00",
        destinationArrive: "21:00", dhakaArrive: "08:10",
        route: "Dhaka ⇄ Panchagarh", distanceKm: 510,
        fare: { shuvan: 440, shuvanChair: 740, snigdha: 1421, firstClassBerth: 1100, acBerth: 2548 },
    },
    {
        trainName: "Drutojan Express", trainNo: "757/758",
        offDay: "Wed",
        dhakaDepart: "20:45", destinationDepart: "08:10",
        destinationArrive: "07:10", dhakaArrive: "18:50",
        route: "Dhaka ⇄ Panchagarh", distanceKm: 510,
        fare: { shuvan: 440, shuvanChair: 740, snigdha: 1421, firstClassBerth: 1100, acBerth: 2548 },
    },
    {
        trainName: "Panchagarh Express", trainNo: "793/794",
        offDay: "No Off",
        dhakaDepart: "23:30", destinationDepart: "13:00",
        destinationArrive: "09:50", dhakaArrive: "23:30",
        route: "Dhaka ⇄ Panchagarh", distanceKm: 510,
        fare: { shuvan: 440, shuvanChair: 740, snigdha: 1421, firstClassBerth: 1100, acBerth: 2548 },
    },
    {
        trainName: "Lalmoni Express", trainNo: "751/752",
        offDay: "Fri",
        dhakaDepart: "21:45", destinationDepart: "10:20",
        destinationArrive: "09:30", dhakaArrive: "22:30",
        route: "Dhaka ⇄ Lalmonirhat", distanceKm: 475,
        fare: { shuvan: 510, shuvanChair: 760, snigdha: 1490, firstClassBerth: 1155, acBerth: 2235 },
    },
    {
        trainName: "Kurigram Express", trainNo: "797/798",
        offDay: "Wed",
        dhakaDepart: "20:45", destinationDepart: "06:15",
        destinationArrive: "08:30", dhakaArrive: "17:30",
        route: "Dhaka ⇄ Kurigram", distanceKm: 460,
        fare: { shuvan: 490, shuvanChair: 735, snigdha: 1440, firstClassBerth: 1115, acBerth: 2155 },
    },
    {
        trainName: "Burimari Express", trainNo: "809/810",
        offDay: "Wed (to Burimari), Tue (to Dhaka)",
        dhakaDepart: "08:30", destinationDepart: "19:30",
        destinationArrive: "21:45", dhakaArrive: "08:50",
        route: "Dhaka ⇄ Burimari (India Border)", distanceKm: 450,
        fare: { shuvan: 480, shuvanChair: 720, snigdha: 1350, firstClassBerth: 1050, acBerth: 1950 },
    },

    // ── Mymensingh Division ──────────────────────────────────────────────────
    {
        trainName: "Tista Express", trainNo: "707/708",
        offDay: "Mon",
        dhakaDepart: "07:30", destinationDepart: "15:00",
        destinationArrive: "13:00", dhakaArrive: "20:30",
        route: "Dhaka ⇄ Dewanganj", distanceKm: 210,
        fare: { shuvan: 220, shuvanChair: 330, snigdha: 640, firstClassBerth: 500, acBerth: 970 },
    },
    {
        trainName: "Agnibina Express", trainNo: "735/736",
        offDay: "No Off",
        dhakaDepart: "11:00", destinationDepart: "16:50",
        destinationArrive: "16:30", dhakaArrive: "22:30",
        route: "Dhaka ⇄ Tarakandi", distanceKm: 200,
        fare: { shuvan: 215, shuvanChair: 320, snigdha: 625, firstClassBerth: 485, acBerth: 940 },
    },
    {
        trainName: "Jamuna Express", trainNo: "745/746",
        offDay: "No Off",
        dhakaDepart: "19:30", destinationDepart: "06:00",
        destinationArrive: "00:00", dhakaArrive: "10:30",
        route: "Dhaka ⇄ Jamalpur", distanceKm: 190,
        fare: { shuvan: 200, shuvanChair: 300, snigdha: 585, firstClassBerth: 450, acBerth: 880 },
    },
    {
        trainName: "Brahmaputra Express", trainNo: "245/246",
        offDay: "Wed (from Dhk), Thu (from Dewanganj)",
        dhakaDepart: "07:30", destinationDepart: "15:30",
        destinationArrive: "14:00", dhakaArrive: "22:00",
        route: "Dhaka ⇄ Dewanganj", distanceKm: 220,
        fare: { shuvan: 230, shuvanChair: 345, snigdha: 675, firstClassBerth: 520, acBerth: 1010 },
    },
    {
        trainName: "Mohanganj Express", trainNo: "789/790",
        offDay: "Mon (from Dhk), Tue (from Mohanganj)",
        dhakaDepart: "13:15", destinationDepart: "23:00",
        destinationArrive: "19:00", dhakaArrive: "05:30",
        route: "Dhaka ⇄ Mohanganj", distanceKm: 195,
        fare: { shuvan: 210, shuvanChair: 315, snigdha: 615, firstClassBerth: 475, acBerth: 920 },
    },

    // ── Kishoreganj & Haor Region ────────────────────────────────────────────
    {
        trainName: "Egarosindhur Provati", trainNo: "737/738",
        offDay: "Wed",
        dhakaDepart: "07:15", destinationDepart: "06:30",
        destinationArrive: "10:00", dhakaArrive: "10:00",
        route: "Dhaka ⇄ Kishoreganj", distanceKm: 99,
        fare: { shuvan: 130, shuvanChair: 195, snigdha: 380 },
    },
    {
        trainName: "Egarosindhur Godhuli", trainNo: "749/750",
        offDay: "No Off",
        dhakaDepart: "18:40", destinationDepart: "12:50",
        destinationArrive: "21:30", dhakaArrive: "15:30",
        route: "Dhaka ⇄ Kishoreganj", distanceKm: 99,
        fare: { shuvan: 130, shuvanChair: 195, snigdha: 380 },
    },
    {
        trainName: "Kishoreganj Express", trainNo: "781/782",
        offDay: "Fri",
        dhakaDepart: "10:45", destinationDepart: "16:00",
        destinationArrive: "13:30", dhakaArrive: "19:00",
        route: "Dhaka ⇄ Kishoreganj", distanceKm: 120,
        fare: { shuvan: 130, shuvanChair: 195, snigdha: 380, firstClassBerth: 295, acBerth: 570 },
    },
];

// Bus Operator Details
export const BUS_OPERATORS: IntercityBusOperator[] = [
    { name: "Green Line", primaryRoute: "All Major Routes", mainCounterLocation: "Rajarbagh (HQ)", contactNumber: "09613-316557, 16557" },
    { name: "Hanif Enterprise", primaryRoute: "All 64 Districts", mainCounterLocation: "Panthapath (HQ)", contactNumber: "01713-402641, 01713-402673" },
    { name: "Ena Transport", primaryRoute: "All Routes (Hub)", mainCounterLocation: "Mohakhali (Main)", contactNumber: "01712-069722, 16353" },
    { name: "Shyamoli N.R.", primaryRoute: "All Routes", mainCounterLocation: "Kalyanpur / Arambagh", contactNumber: "01711-350616, 16460" },
    { name: "Sohag Paribahan", primaryRoute: "Khulna/Ctg/Jashore", mainCounterLocation: "Malibagh / Gabtoli", contactNumber: "01711-612433, 02-9344477" },
    { name: "Sakura Paribahan", primaryRoute: "Barishal/Kuakata", mainCounterLocation: "Gabtoli / Sayedabad", contactNumber: "01711-4022341, 01729-556677" },
    { name: "Nabil Paribahan", primaryRoute: "North Bengal", mainCounterLocation: "Gabtoli / Mazar Rd", contactNumber: "01985-555554, 01193-106611" },
    { name: "SR Travels", primaryRoute: "North Bengal", mainCounterLocation: "Gabtoli / Kalyanpur", contactNumber: "01716-560641, 01711-356616" },
    { name: "Desh Travels", primaryRoute: "Rajshahi/Chapai", mainCounterLocation: "Kalyanpur / Arambagh", contactNumber: "01762-684433, 01762-684405" },
    { name: "Eagle Paribahan", primaryRoute: "Jashore/Khulna", mainCounterLocation: "Gabtoli / Kalyanpur", contactNumber: "01711-300898" },
    { name: "Soudia (Saudia)", primaryRoute: "Chattogram/Cox's Bazar/Teknaf", mainCounterLocation: "Arambagh / Kalyanpur", contactNumber: "01711-629960" },
    { name: "Agomoni Express", primaryRoute: "North Bengal (Rangpur/Dinajpur)", mainCounterLocation: "Gabtoli / Kalyanpur", contactNumber: "01985-555553" },
    { name: "Tisha Paribahan", primaryRoute: "Chattogram/Brahmanbaria", mainCounterLocation: "Sayedabad / Arambagh", contactNumber: "01711-386408" },
    { name: "Dolphin Paribahan", primaryRoute: "CHT (Rangamati/Bandarban)", mainCounterLocation: "Sayedabad", contactNumber: "01716-964648" },
    { name: "Tungipara Express", primaryRoute: "Khulna/Bagerhat/Faridpur", mainCounterLocation: "Gabtoli / Gulistan", contactNumber: "01711-266512" },
    { name: "Saintmartin Paribahan", primaryRoute: "Cox's Bazar/Teknaf/CHT", mainCounterLocation: "Fakirapool / Sayedabad", contactNumber: "01762-691341" },
];

// Helper functions to search intercity data
export const searchIntercityBus = (query: string): IntercityBusRoute[] => {
    const lowerQuery = query.toLowerCase();
    return INTERCITY_BUS_ROUTES.filter(route =>
        route.district.toLowerCase().includes(lowerQuery) ||
        route.division.toLowerCase().includes(lowerQuery) ||
        route.busOperators.some(op => op.toLowerCase().includes(lowerQuery)) ||
        route.route.toLowerCase().includes(lowerQuery)
    );
};

export const searchTrainRoute = (query: string): TrainRoute[] => {
    const lowerQuery = query.toLowerCase();
    return TRAIN_ROUTES.filter(train =>
        train.trainName.toLowerCase().includes(lowerQuery) ||
        train.route.toLowerCase().includes(lowerQuery) ||
        (train.routeNotes && train.routeNotes.toLowerCase().includes(lowerQuery))
    );
};

export const searchBusOperator = (query: string): IntercityBusOperator[] => {
    const lowerQuery = query.toLowerCase();
    return BUS_OPERATORS.filter(operator =>
        operator.name.toLowerCase().includes(lowerQuery) ||
        operator.primaryRoute.toLowerCase().includes(lowerQuery)
    );
};
