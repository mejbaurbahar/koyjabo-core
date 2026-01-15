import { DistrictMap, RouteResponse } from './types';

// [Latitude, Longitude] - Covering all 64 Districts + Major Spots
export const DISTRICT_COORDINATES: { [key: string]: [number, number] } = {
  // Dhaka Division (13)
  "Dhaka": [23.8103, 90.4125],
  "Gazipur": [24.0958, 90.4125],
  "Kishoreganj": [24.4260, 90.9821],
  "Manikganj": [23.8644, 90.0047],
  "Munshiganj": [23.5422, 90.5305],
  "Narayanganj": [23.6238, 90.5000],
  "Narsingdi": [23.9193, 90.7202],
  "Tangail": [24.2513, 89.9167],
  "Faridpur": [23.6071, 89.8429],
  "Gopalganj": [23.0051, 89.8258],
  "Madaripur": [23.1641, 90.1897],
  "Rajbari": [23.7574, 89.6445],
  "Shariatpur": [23.2423, 90.4348],

  // Chattogram Division (11)
  "Chattogram": [22.3569, 91.7832],
  "Brahmanbaria": [23.9513, 91.1147],
  "Chandpur": [23.2321, 90.6631],
  "Cumilla": [23.4607, 91.1809],
  "Cox's Bazar": [21.4272, 92.0058],
  "Feni": [23.0186, 91.3966],
  "Khagrachari": [23.1116, 91.9906],
  "Lakshmipur": [22.9447, 90.8282],
  "Noakhali": [22.8724, 91.0973],
  "Rangamati": [22.6533, 92.1789],
  "Bandarban": [22.1953, 92.2184],

  // Rajshahi Division (8)
  "Rajshahi": [24.3636, 88.6241],
  "Bogura": [24.8465, 89.3775],
  "Joypurhat": [25.0968, 89.0227],
  "Naogaon": [24.7936, 88.9318],
  "Natore": [24.4206, 89.0006],
  "Chapainawabganj": [24.5965, 88.2775],
  "Pabna": [24.0063, 89.2372],
  "Sirajganj": [24.4534, 89.7008],

  // Khulna Division (10)
  "Khulna": [22.8456, 89.5403],
  "Bagerhat": [22.6516, 89.7859],
  "Chuadanga": [23.6402, 88.8418],
  "Jashore": [23.1634, 89.2182],
  "Jhenaidah": [23.5450, 89.1726],
  "Kushtia": [23.9013, 89.1204],
  "Magura": [23.4873, 89.4198],
  "Meherpur": [23.7622, 88.6318],
  "Narail": [23.1725, 89.5127],
  "Satkhira": [22.7185, 89.0705],

  // Barishal Division (6)
  "Barishal": [22.7010, 90.3535],
  "Barguna": [22.1520, 90.1181],
  "Bhola": [22.6859, 90.6482],
  "Jhalokati": [22.6406, 90.1987],
  "Patuakhali": [22.3596, 90.3299],
  "Pirojpur": [22.5841, 89.9720],

  // Sylhet Division (4)
  "Sylhet": [24.8949, 91.8687],
  "Habiganj": [24.3749, 91.4155],
  "Moulvibazar": [24.4829, 91.7649],
  "Sunamganj": [25.0662, 91.4073],

  // Rangpur Division (8)
  "Rangpur": [25.7439, 89.2752],
  "Dinajpur": [25.6217, 88.6355],
  "Gaibandha": [25.3288, 89.5281],
  "Kurigram": [25.8054, 89.6362],
  "Lalmonirhat": [25.9165, 89.4532],
  "Nilphamari": [25.9318, 88.8561],
  "Panchagarh": [26.3373, 88.5537],
  "Thakurgaon": [26.0337, 88.4617],

  // Mymensingh Division (4)
  "Mymensingh": [24.7471, 90.4203],
  "Jamalpur": [24.9375, 89.9378],
  "Netrokona": [24.8710, 90.7277],
  "Sherpur": [25.0205, 90.0153],

  // Famous Tourist Spots & Borders
  "Saint Martin's Island": [20.6237, 92.3234],
  "Sajek Valley": [23.3820, 92.2938],
  "Kuakata": [21.8218, 90.1174],
  "Sreemangal": [24.3065, 91.7296],
  "Sundarbans": [21.9497, 89.1833],
  "Teknaf": [20.8700, 92.2900],
  "Benapole": [23.0381, 88.8976],
  "Jaflong": [25.1633, 92.0175],
  "Bichnakandi": [25.1783, 91.8797],
  "Tanguar Haor": [25.1481, 91.0772],
  "Nijhum Dwip": [22.0538, 91.0028],

  // Additional Major Cities & Important Locations
  "Savar": [23.8583, 90.2667],
  "Tongi": [23.8973, 90.4030],
  "Comilla": [23.4607, 91.1809],
  "Bhairab": [24.0500, 90.9667],
  "Ashuganj": [24.0333, 90.9833],
  "Mawa": [23.4532, 90.2487],
  "Aricha": [23.7697, 89.7989],
  "Paturia": [23.7833, 89.5167],
  "Daulatdia": [23.6333, 89.5833],
  "Hatirjheel": [23.7522, 90.4069],

  // Important Upazilas & Towns
  "Feni Town": [23.0186, 91.3966],
  "Brahmanbaria Town": [23.9513, 91.1147],
  "Narail Town": [23.1725, 89.5127],
  "Satkhira Town": [22.7185, 89.0705],
  "Kushtia Town": [23.9013, 89.1204],
  "Munshiganj Town": [23.5422, 90.5305],
  "Manikganj Town": [23.8644, 90.0047],
  "Mirsarai": [22.7500, 91.6167],
  "Sitakunda": [22.6333, 91.6667],
  "Hathazari": [22.4833, 91.7833],
  "Raozan": [22.5333, 91.9833],
  "Laksam": [23.2388, 91.1267],

  // Border & Port Towns
  "Mongla": [22.4920, 89.6000],
  "Payra Port": [21.8333, 90.0667],
  "Bhomra": [23.0333, 88.8667],
  "Burimari": [26.2333, 88.9667],
  "Tamabil": [25.1500, 92.2833],
  "Hili": [25.4167, 88.8000],

  // Historic & Cultural Sites
  "Mahasthangarh": [24.9667, 89.3500],
  "Paharpur": [25.0333, 88.9833],
  "Mainamati": [23.4167, 91.1833],
  "Lalbagh Fort": [23.7197, 90.3875],
  "Sonargaon": [23.6500, 90.6000],
  "Bagerhat Historic Mosque City": [22.6516, 89.7859],

  // Hill Tracts & Nature
  "Ruma": [21.8500, 92.5167],
  "Thanchi": [21.7667, 92.5833],
  "Alikadam": [21.6333, 92.4500],
  "Lama": [21.7333, 92.2167],
  "Remakri": [22.1833, 92.3500],
  "Khagrachhari Town": [23.1116, 91.9906],
  "Rangamati Town": [22.6533, 92.1789],

  // Tea Gardens & Natural Attractions
  "Srimangal Tea Garden": [24.3065, 91.7296],
  "Lawachara Forest": [24.3333, 91.7500],
  "Ratargul Swamp Forest": [25.0333, 91.8833],
  "Madhabkunda Waterfall": [24.6167, 91.9667],

  // Coastal & Island Destinations
  "Maheshkhali": [21.4667, 91.9833],
  "Sonadia Island": [21.4167, 91.8667],
  "Parki Beach": [21.7833, 91.8333],
  "Inani Beach": [21.2333, 92.0500],
  "Himchari": [21.3500, 92.0000]
};

export const LOCATIONS_DATA: DistrictMap = {
  "Popular Tourist Spots": [
    "Bandarban", "Bichnakandi", "Cox's Bazar", "Himchari", "Inani Beach",
    "Jaflong", "Khagrachari", "Kuakata", "Maheshkhali", "Nijhum Dwip",
    "Rangamati", "Ruma", "Saint Martin's Island", "Sajek Valley",
    "Sreemangal", "Sundarbans", "Tanguar Haor", "Thanchi"
  ],
  "Dhaka Division": [
    "Aricha", "Ashuganj", "Basail", "Bhairab", "Dhaka", "Dhamrai",
    "Dohar", "Faridpur", "Gazipur", "Gopalganj", "Gopalpur", "Hatirjheel",
    "Kalihati", "Kapasia", "Keraniganj", "Kishoreganj", "Lohajang",
    "Madaripur", "Manikganj", "Mawa", "Mirzapur", "Munshiganj",
    "Narayanganj", "Narsingdi", "Nawabganj", "Paturia", "Rajbari",
    "Savar", "Shariatpur", "Sirajdikhan", "Sonargaon", "Sreenagar",
    "Tangail", "Tongi"
  ],
  "Chattogram Division": [
    "Alikadam", "Anowara", "Baghaichhari", "Bandarban", "Belaichhari",
    "Boalkhali", "Brahmanbaria", "Burichang", "Chakaria", "Chandpur",
    "Chattogram", "Comilla", "Cox's Bazar", "Daganbhuiyan", "Debidwar",
    "Dighinala", "Feni", "Feni Town", "Hajiganj", "Hathazari",
    "Homna", "Juraichhari", "Kachua", "Kaptai", "Kasba", "Khagrachari",
    "Kutubdia", "Laksam", "Lakshmipur", "Lama", "Langadu", "Lohagara",
    "Mainamati", "Manikchhari", "Matlab", "Mirsarai", "Muradnagar",
    "Nabinagar", "Noakhali", "Panchari", "Patiya", "Pekua", "Ramgarh",
    "Ramu", "Rangamati", "Raozan", "Rowangchhari", "Ruma", "Sarail",
    "Shahrasti", "Sitakunda", "Sonagazi", "Teknaf", "Thanchi", "Ukhia"
  ],
  "Rajshahi Division": [
    "Adamdighi", "Atgharia", "Badalgachhi", "Bagha", "Bagmara", "Bera",
    "Bholahat", "Bogura", "Chapainawabganj", "Charghat", "Chatmohar",
    "Dhamoirhat", "Dhunat", "Durgapur", "Faridpur", "Gabtali", "Godagari",
    "Gomastapur", "Gurudaspur", "Ishwardi", "Joypurhat", "Kahaloo",
    "Kamarkhand", "Kazipur", "Lalpur", "Mahasthangarh", "Mohanpur",
    "Nachole", "Naldanga", "Nandigram", "Naogaon", "Natore", "Paba",
    "Pabna", "Paharpur", "Patnitala", "Porsha", "Puthia", "Raiganj",
    "Rajshahi", "Sapahar", "Sariakandi", "Shahjadpur", "Shahjahanpur",
    "Shajahanpur", "Sherpur", "Shibganj", "Singra", "Sirajganj",
    "Sonatola", "Tanore", "Ullahpara"
  ],
  "Khulna Division": [
    "Abhaynagar", "Alamdanga", "Assasuni", "Bagerhat",
    "Bagerhat Historic Mosque City", "Bagherpara", "Batiaghata", "Benapole",
    "Bheramara", "Bhomra", "Chaugachha", "Chuadanga", "Dacope", "Damurhuda",
    "Daulatpur", "Debhata", "Dighalia", "Dumuria", "Harinakunda", "Jashore",
    "Jhenaidah", "Jhikargachha", "Jibannagar", "Kalaroa", "Kalia",
    "Kaliganj", "Keshabpur", "Khoksa", "Khulna", "Kotchandpur", "Koyra",
    "Kumarkhali", "Kushtia", "Lohagara", "Magura", "Manirampur", "Meherpur",
    "Mirpur", "Mohammadpur", "Mongla", "Narail", "Paikgachha", "Patkelghata",
    "Phultala", "Rupsa", "Satkhira", "Shailkupa", "Shalikha", "Sharsha",
    "Shyamnagar", "Sreepur", "Sundarbans", "Tala", "Terokhada"
  ],
  "Barishal Division": [
    "Agailjhara", "Amtali", "Babuganj", "Bakerganj", "Bamna", "Banaripara",
    "Barguna", "Barishal", "Bauphal", "Betagi", "Bhandaria", "Bhola",
    "Burhanuddin", "Charfasson", "Dashmina", "Daulatkhan", "Dumki",
    "Galachipa", "Gaurnadi", "Hizla", "Indurkani", "Jhalokati", "Kalapara",
    "Kathalia", "Kawkhali", "Kuakata", "Lalmohan", "Manpura", "Mathbaria",
    "Mehendiganj", "Mirzaganj", "Monpura", "Muladi", "Nalchity", "Nazirpur",
    "Nesarabad", "Nijhum Dwip", "Pathorghata", "Patuakhali", "Payra Port",
    "Pirojpur", "Rajapur", "Taltali", "Tazumuddin", "Wazirpur", "Zianagor"
  ],
  "Sylhet Division": [
    "Ajmiriganj", "Bahubal", "Balaganj", "Baniachang", "Barlekha",
    "Beani Bazar", "Bichnakandi", "Bishwanath", "Bishwambarpur", "Chhatak",
    "Chunarughat", "Companiganj", "Dakshin Surma", "Derai", "Dharamapasha",
    "Dowarabazar", "Fenchuganj", "Golapganj", "Gowainghat", "Habiganj",
    "Jaflong", "Jagannathpur", "Jamalganj", "Jointiapur", "Kamalganj",
    "Kanaighat", "Kulaura", "Lakhai", "Lawachara Forest",
    "Madhabkunda Waterfall", "Madhabpur", "Moulvibazar", "Nabiganj",
    "Osmaninagar", "Rajnagar", "Ratargul Swamp Forest", "Shaistaganj",
    "Sreemangal", "Srimangal Tea Garden", "Sullah", "Sunamganj", "Sylhet",
    "Tahirpur", "Tamabil", "Tanguar Haor", "Zakiganj"
  ],
  "Rangpur Division": [
    "Aditmari", "Atwari", "Badarganj", "Baliadangi", "Birampur", "Biral",
    "Birganj", "Bochaganj", "Boda", "Bhurungamari", "Burimari",
    "Char Rajibpur", "Chilmari", "Chirirbandar", "Debiganj", "Dimla",
    "Dinajpur", "Domar", "Fulbari", "Gaibandha", "Gangachara", "Ghoraghat",
    "Gobindaganj", "Hakimpur", "Haripur", "Hatibandha", "Hili", "Jaldhaka",
    "Kaharole", "Kaliganj", "Kaunia", "Khansama", "Kishoreganj", "Kurigram",
    "Lalmonirhat", "Mithapukur", "Nageshwari", "Nawabganj", "Nilphamari",
    "Palashbari", "Panchagarh", "Parbatipur", "Patgram", "Phulchhari",
    "Pirgachha", "Pirganj", "Rajarhat", "Rangpur", "Ranisankail", "Roumari",
    "Sadullapur", "Saghata", "Saidpur", "Sundarganj", "Taraganj", "Tetulia",
    "Thakurgaon", "Ulipur"
  ],
  "Mymensingh Division": [
    "Atpara", "Bakshiganj", "Barhatta", "Bhaluka", "Dewanganj", "Dhobaura",
    "Durgapur", "Fulbaria", "Gafargaon", "Gaffargaon", "Gauripur",
    "Haluaghat", "Ishwarganj", "Islampur", "Jamalpur", "Jhenaigati",
    "Kalmakanda", "Kendua", "Khaliajuri", "Madan", "Madarganj", "Melandaha",
    "Mohanganj", "Muktagachha", "Mymensingh", "Nakla", "Nalitabari",
    "Nandail", "Netrokona", "Phulpur", "Purbadhala", "Sarishabari",
    "Sherpur", "Sreebardi", "Sreebordi", "Tara Khanda", "Trishal"
  ],
  "Hill Tracts & Adventure": [
    "Alikadam", "Baghaichhari", "Bandarban", "Belaichhari", "Dighinala",
    "Juraichhari", "Kaptai", "Khagrachari", "Khagrachhari Town", "Lama",
    "Langadu", "Manikchhari", "Matiranga", "Naniarchar", "Panchhari",
    "Ramgarh", "Rangamati", "Rangamati Town", "Remakri", "Rowangchhari",
    "Ruma", "Sajek Valley", "Thanchi"
  ],
  "Beaches & Islands": [
    "Cox's Bazar", "Himchari", "Inani Beach", "Kolatoli Beach", "Kuakata",
    "Kutubdia", "Maheshkhali", "Nijhum Dwip", "Parki Beach", "Patenga",
    "Saint Martin's Island", "Sea Beach", "Sonadia Island", "Sugandha Beach",
    "Teknaf"
  ],
  "Historic & Cultural Sites": [
    "Ahsan Manzil", "Bagerhat Historic Mosque City", "Kantaji Temple",
    "Kantanagar Temple", "Khan Jahan Ali Mazar", "Lalbagh Fort",
    "Mahasthangarh", "Mainamati", "Paharpur", "Puthia Rajbari",
    "Shait Gumbad Mosque", "Somapura Mahavihara", "Sonargaon"
  ],
  "Border Crossings & Ports": [
    "Akhaura", "Banglabandha", "Benapole", "Bhomra", "Burimari",
    "Chittagong Port", "Hili", "Mongla", "Pangaon", "Payra Port",
    "Sona Masjid", "Sonahat", "Tamabil", "Teknaf"
  ],
  "Industrial & Economic Hubs": [
    "Ashulia", "Bogura", "Chattogram", "Comilla", "Gazipur", "Ishwardi",
    "Khulna", "Mongla", "Narayanganj", "Narsingdi", "Pabna", "Savar", "Tongi"
  ],
  "Major Transit Points": [
    "Abdullahpur", "Akhaura Junction", "Aricha", "Ashuganj", "Bhairab",
    "Bhairab Bazar", "Chandpur", "Daulatdia", "Goalundo", "Joydebpur",
    "Laksam Junction", "Mawa", "Paturia"
  ],
  "Tea Garden Regions": [
    "Fatikchhari", "Kamalganj", "Kulaura", "Lawachara Forest",
    "Moulvibazar", "Sreemangal", "Srimangal Tea Garden", "Sylhet"
  ]
};

export const POPULAR_ROUTES = [
  { from: "Dhaka", to: "Cox's Bazar" },
  { from: "Dhaka", to: "Sylhet" },
  { from: "Dhaka", to: "Sajek Valley" },
  { from: "Chattogram", to: "Saint Martin's Island" }
];

export const DEMO_RESPONSE: RouteResponse = {
  from: "Dhaka",
  to: "Saint Martin's Island",
  date: new Date().toISOString().split('T')[0],
  source: "memory_cache",
  result: `**Route: Dhaka to Saint Martin's Island**  
**Approximate Distance:** ~350 km (Road) + 9 km (Sea)

**Recommended Modes:**

🚌 **By Bus + Ship** – Time: 10-12 hours | Price: 1800-4500 BDT  
Most popular option. Direct buses go to Teknaf, then you catch a ship.  
**Operators:** Hanif, Shyamoli, Saint Martin Paribahan, Desh Travels.  
**Ships:** Keari Sindbad, Atlantic Cruise, Bay One (from Chattogram).

✈️ **By Air + Road + Ship** – Time: 4-5 hours | Price: 4500-8000 BDT  
Fly to Cox's Bazar (45 min), then taxi/bus to Teknaf (2 hrs), then ship to island (2 hrs).  
**Airlines:** US-Bangla, Biman, Novoair.

🚂 **By Train + Bus + Ship** – Time: 14+ hours | Price: 800-2500 BDT  
Train (Cox's Bazar Express) to Cox's Bazar, then bus to Teknaf, then ship.  
**Train:** Dhaka to Cox's Bazar (Non-stop).
`
};
export const DEMO_RESPONSE_BN: RouteResponse = {
  from: "ঢাকা",
  to: "সেন্টমার্টিন",
  date: new Date().toISOString().split('T')[0],
  source: "memory_cache",
  result: `**রুট: ঢাকা থেকে সেন্টমার্টিন**  
**আনুমানিক দূরত্ব:** ~৩৫০ কিমি (সড়ক) + ৯ কিমি (নদী)

**প্রস্তাবিত যাতায়াত মাধ্যম:**

🚌 **বাস + জাহাজ** – সময়: ১০-১২ ঘণ্টা | ভাড়া: ১৮০০-৪৫০০ টাকা  
সবচেয়ে জনপ্রিয় উপায়। টেকনাফ পর্যন্ত সরাসরি বাস, তারপর জাহাজ।  
**অপারেটর:** হানিফ, শ্যামলী, সেন্টমার্টিন পরিবহন, দেশ ট্রাভেলস।  
**জাহাজ:** কেয়ারি সিন্দবাদ, আটলান্টিক ক্রুজ, বে ওয়ান (চট্টগ্রাম থেকে)।

✈️ **বিমান + সড়ক + জাহাজ** – সময়: ৪-৫ ঘণ্টা | ভাড়া: ৪৫০০-৮০০০ টাকা  
কক্সবাজার পর্যন্ত বিমান (৪৫ মিনিট), তারপর টেকনাফ পর্যন্ত ট্যাক্সি/বাস (২ ঘণ্টা), তারপর জাহাজ (২ ঘণ্টা)।  
**এয়ারলাইন্স:** ইউএস-বাংলা, বিমান, নভোএয়ার।

🚂 **ট্রেন + বাস + জাহাজ** – সময়: ১৪+ ঘণ্টা | ভাড়া: ৮০০-২৫০০ টাকা  
কক্সবাজার পর্যন্ত ট্রেন (কক্সবাজার এক্সপ্রেস), তারপর টেকনাফ পর্যন্ত বাস, তারপর জাহাজ।  
**ট্রেন:** ঢাকা থেকে কক্সবাজার (বিরতিহীন)।
`
};
