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

export interface TrainRoute {
    trainName: string;
    trainNo: string;
    offDay: string;
    dhakaDepart: string;
    destinationDepart: string;
    route: string;
    routeNotes?: string;
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
export const TRAIN_ROUTES: TrainRoute[] = [
    // Chattogram Division
    { trainName: "Subarna Express", trainNo: "701/702", offDay: "Mon (from Ctg), Fri (from Dhk)", dhakaDepart: "16:30", destinationDepart: "07:00", route: "Dhaka ⇄ Chattogram", routeNotes: "Non-stop (Stops only at Airport)" },
    { trainName: "Sonar Bangla", trainNo: "787/788", offDay: "Tue (from Ctg), Wed (from Dhk)", dhakaDepart: "07:00", destinationDepart: "16:45", route: "Dhaka ⇄ Chattogram", routeNotes: "Non-stop (Stops only at Airport)" },
    { trainName: "Mahanagar Provati", trainNo: "703/722", offDay: "No Off Day", dhakaDepart: "07:45", destinationDepart: "12:30", route: "Dhaka ⇄ Chattogram", routeNotes: "Stops at Feni, Cumilla, B.Baria, Bhairab" },
    { trainName: "Turna Express", trainNo: "741/742", offDay: "No Off Day", dhakaDepart: "23:30", destinationDepart: "23:00", route: "Dhaka ⇄ Chattogram", routeNotes: "Stops at Feni, Cumilla, B.Baria" },
    { trainName: "Cox's Bazar Express", trainNo: "813/814", offDay: "Mon (from Dhk), Tue (from CXB)", dhakaDepart: "22:30", destinationDepart: "12:30", route: "Dhaka ⇄ Cox's Bazar" },
    { trainName: "Upakul Express", trainNo: "711/712", offDay: "Tue (from Dhk), Wed (from Noakhali)", dhakaDepart: "15:20", destinationDepart: "06:00", route: "Dhaka ⇄ Noakhali" },

    // Sylhet Division
    { trainName: "Parabat Express", trainNo: "709/710", offDay: "Tue", dhakaDepart: "06:20", destinationDepart: "15:00", route: "Dhaka ⇄ Sylhet" },
    { trainName: "Jayantika Express", trainNo: "717/718", offDay: "Tue (from Sylhet)", dhakaDepart: "11:15", destinationDepart: "11:15", route: "Dhaka ⇄ Sylhet" },
    { trainName: "Kalni Express", trainNo: "773/774", offDay: "Fri", dhakaDepart: "13:00", destinationDepart: "06:15", route: "Dhaka ⇄ Sylhet" },
    { trainName: "Upaban Express", trainNo: "739/740", offDay: "Wed (from Sylhet), Thu (from Dhk)", dhakaDepart: "20:30", destinationDepart: "23:30", route: "Dhaka ⇄ Sylhet" },

    // Rajshahi Division
    { trainName: "Banalata Express", trainNo: "791/792", offDay: "Fri", dhakaDepart: "13:30", destinationDepart: "07:00", route: "Dhaka ⇄ Rajshahi" },
    { trainName: "Silk City Express", trainNo: "753/754", offDay: "Sun", dhakaDepart: "14:45", destinationDepart: "07:40", route: "Dhaka ⇄ Rajshahi" },
    { trainName: "Padma Express", trainNo: "759/760", offDay: "Tue", dhakaDepart: "23:00", destinationDepart: "16:00", route: "Dhaka ⇄ Rajshahi" },
    { trainName: "Dhumketu Express", trainNo: "769/770", offDay: "Thu (from Raj), Sat (from Dhk)", dhakaDepart: "06:00", destinationDepart: "23:20", route: "Dhaka ⇄ Rajshahi" },

    // Khulna Division
    { trainName: "Chitra Express", trainNo: "763/764", offDay: "Mon", dhakaDepart: "19:00", destinationDepart: "09:00", route: "Dhaka ⇄ Khulna" },
    { trainName: "Sundarban Express", trainNo: "725/726", offDay: "Tue (from Dhk), Wed (from Khulna)", dhakaDepart: "08:15", destinationDepart: "22:15", route: "Dhaka ⇄ Khulna" },
    { trainName: "Benapole Express", trainNo: "795/796", offDay: "Wed", dhakaDepart: "23:45", destinationDepart: "13:00", route: "Dhaka ⇄ Benapole" },

    // Rangpur Division
    { trainName: "Panchagarh Express", trainNo: "793/794", offDay: "No Off", dhakaDepart: "22:45", destinationDepart: "08:30", route: "Dhaka ⇄ Panchagarh" },
    { trainName: "Ekota Express", trainNo: "705/706", offDay: "Tue (from Dhk), Mon (from Pan)", dhakaDepart: "10:10", destinationDepart: "21:10", route: "Dhaka ⇄ Panchagarh" },
    { trainName: "Drutojan Express", trainNo: "757/758", offDay: "No Off", dhakaDepart: "20:00", destinationDepart: "08:10", route: "Dhaka ⇄ Panchagarh" },
    { trainName: "Rangpur Express", trainNo: "771/772", offDay: "Sun (from Dhk), Mon (from Rng)", dhakaDepart: "09:10", destinationDepart: "20:10", route: "Dhaka ⇄ Rangpur" },
    { trainName: "Kurigram Express", trainNo: "797/798", offDay: "Wed", dhakaDepart: "20:45", destinationDepart: "06:15", route: "Dhaka ⇄ Kurigram" },
    { trainName: "Lalmoni Express", trainNo: "751/752", offDay: "Fri", dhakaDepart: "21:45", destinationDepart: "10:20", route: "Dhaka ⇄ Lalmonirhat" },

    // Mymensingh Division
    { trainName: "Teesta Express", trainNo: "707/708", offDay: "Mon", dhakaDepart: "07:30", destinationDepart: "15:00", route: "Dhaka ⇄ Dewanganj" },
    { trainName: "Agnibina Express", trainNo: "735/736", offDay: "No Off", dhakaDepart: "11:00", destinationDepart: "16:50", route: "Dhaka ⇄ Tarakandi" },
    { trainName: "Jamuna Express", trainNo: "745/746", offDay: "No Off", dhakaDepart: "16:45", destinationDepart: "02:00", route: "Dhaka ⇄ Tarakandi" },
    { trainName: "Brahmaputra Express", trainNo: "743/744", offDay: "No Off", dhakaDepart: "18:15", destinationDepart: "06:40", route: "Dhaka ⇄ Dewanganj" },
    { trainName: "Mohanganj Express", trainNo: "789/790", offDay: "Mon (from Dhk), Tue (from Moh)", dhakaDepart: "13:15", destinationDepart: "23:00", route: "Dhaka ⇄ Mohanganj" },

    // Kishoreganj & Haor Region
    { trainName: "Egarosindhur Provati", trainNo: "737/738", offDay: "Wed", dhakaDepart: "07:15", destinationDepart: "06:30", route: "Dhaka ⇄ Kishoreganj" },
    { trainName: "Egarosindhur Godhuli", trainNo: "749/750", offDay: "No Off", dhakaDepart: "18:40", destinationDepart: "12:50", route: "Dhaka ⇄ Kishoreganj" },
    { trainName: "Kishoreganj Express", trainNo: "781/782", offDay: "Fri", dhakaDepart: "10:45", destinationDepart: "16:00", route: "Dhaka ⇄ Kishoreganj" },
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
