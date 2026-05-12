
import React, { useState } from 'react';
import { RouteStep, TransportMode, TravelOption, Schedule } from '../types';
import { Bus, Plane, Train, MapPin, Navigation, Phone, ChevronDown, ChevronUp, Ticket, Clock, Car, Bike, Flag, ArrowRight, Camera, Mountain, Waves, TreePalm, History, X, Sparkles, Ship, Sun, Cloud, CloudRain, Wind } from 'lucide-react';
import { RouteMap } from './RouteMap';
import { EnhancedTransportDetails } from './EnhancedTransportDetails';

interface RouteDetailProps {
  option: TravelOption;
}

// --- Tourist Spots Database (Expanded for All Districts) ---
const TOURIST_SPOTS: Record<string, Array<{ name: string; type: string; desc: string }>> = {
  // --- CHATTOGRAM DIVISION ---
  "Cox's Bazar": [
    { name: "Longest Sea Beach", type: "Nature", desc: "World's longest natural sandy sea beach (120km)." },
    { name: "Himchari National Park", type: "Nature", desc: "Famous for its hill views, waterfalls, and wildlife." },
    { name: "Inani Beach", type: "Nature", desc: "Coral beach with calm waters and golden stones." },
    { name: "Marine Drive Road", type: "Attraction", desc: "Scenic 80km road sandwiched between hills and sea." },
    { name: "Radiant Fish World", type: "Attraction", desc: "Large live fish aquarium complex." },
    { name: "Maheshkhali Island", type: "History", desc: "Home to the ancient Adinath Temple and hilltop views." },
    { name: "Sonadia Island", type: "Nature", desc: "Secluded island famous for red crabs and turtles." },
    { name: "Ramu Buddhist Temple", type: "History", desc: "Historical Buddhist monasteries and statues." },
    { name: "Dulahazra Safari Park", type: "Nature", desc: "Drive-through safari park with diverse animals." },
    { name: "100 Feet Buddha", type: "History", desc: "A massive golden reclining Buddha statue." }
  ],
  "Chattogram": [
    { name: "Patenga Beach", type: "Water", desc: "Popular beach near the Karnaphuli River mouth." },
    { name: "Foy's Lake", type: "Attraction", desc: "Man-made lake with amusement park and zoo." },
    { name: "Ethnological Museum", type: "History", desc: "Showcasing the lifestyles of ethnic tribes." },
    { name: "War Cemetery", type: "History", desc: "Commonwealth War Graves Commission cemetery." },
    { name: "Bhatiyari Lakes", type: "Nature", desc: "Peaceful lakes surrounded by hills and golf course." },
    { name: "Naval Beach", type: "Water", desc: "Clean and secure beach area managed by the Navy." },
    { name: "Zia Memorial Museum", type: "History", desc: "Historic building turned museum." },
    { name: "Bayezid Bostami Shrine", type: "History", desc: "Shrine famous for its ancient turtles." },
    { name: "Chattogram Zoo", type: "Attraction", desc: "Hillside zoo with a variety of animals." }
  ],
  "Bandarban": [
    { name: "Nilgiri", type: "Nature", desc: "Hill resort famous for touching the clouds." },
    { name: "Nafakhum Waterfall", type: "Water", desc: "Beautiful waterfall deep in the hills." },
    { name: "Boga Lake", type: "Water", desc: "Natural deep lake at high altitude." },
    { name: "Nilachal", type: "Nature", desc: "Viewpoint offering panoramic views of the hills." },
    { name: "Chimbuk Hill", type: "Nature", desc: "Known as the Darjeeling of Bengal." },
    { name: "Buddha Dhatu Jadi", type: "History", desc: "Golden Temple, largest Theravada Buddhist temple." },
    { name: "Keokradong", type: "Nature", desc: "One of the highest peaks, popular for trekking." },
    { name: "Sangu River", type: "Water", desc: "Scenic river flowing through the hills." },
    { name: "Meghla Tourist Complex", type: "Attraction", desc: "Park with lake, cable car, and zoo." },
    { name: "Shoilo Propat", type: "Water", desc: "Waterfall near Chimbuk road." }
  ],
  "Rangamati": [
    { name: "Kaptai Lake", type: "Water", desc: "Largest man-made lake in Bangladesh." },
    { name: "Hanging Bridge", type: "Attraction", desc: "Iconic suspension bridge over the lake." },
    { name: "Shuvolong Waterfall", type: "Water", desc: "Accessible by boat through the lake canyon." },
    { name: "Paulwel Park", type: "Attraction", desc: "Modern park with lake views and rides." },
    { name: "Rajban Vihara", type: "History", desc: "Famous Buddhist monastery." },
    { name: "Polwel Nature Park", type: "Attraction", desc: "Scenic park with cottages." },
    { name: "Sajek Valley", type: "Nature", desc: "Valley of clouds (accessed via Khagrachari)." }
  ],
  "Khagrachari": [
    { name: "Alutila Cave", type: "Nature", desc: "Mysterious natural cave." },
    { name: "Risang Waterfall", type: "Water", desc: "Waterfall with a natural slide." },
    { name: "Horticulture Park", type: "Nature", desc: "Beautiful park with suspension bridge." },
    { name: "Richhang Waterfall", type: "Water", desc: "Scenic waterfall." },
    { name: "Tareng", type: "Nature", desc: "Hilltop viewpoint." },
    { name: "Debota Pukur", type: "Water", desc: "High altitude pond." },
    { name: "Shantipur Aranya Kutir", type: "History", desc: "Large Buddha statue in forest." }
  ],
  "Cumilla": [
    { name: "Shalban Vihara", type: "History", desc: "Ancient Buddhist monastery ruins in Mainamati." },
    { name: "Mainamati Museum", type: "History", desc: "Displays artifacts found in Shalban Vihara." },
    { name: "Dharmasagar Dighi", type: "Water", desc: "Large historic pond ideal for boat rides." },
    { name: "War Cemetery", type: "History", desc: "World War II cemetery." },
    { name: "Cumilla BARD", type: "Attraction", desc: "Rural development academy with beautiful grounds." },
    { name: "Chandi Mura Temple", type: "History", desc: "Temple located on a hill top." },
    { name: "Rupban Mura", type: "History", desc: "Archaeological site." },
    { name: "Itakhola Mura", type: "History", desc: "Ancient Buddhist temple site." }
  ],
  "Feni": [
    { name: "Bijoy Singh Dighi", type: "Water", desc: "Large historic pond with legends." },
    { name: "Muhuri Project", type: "Attraction", desc: "Irrigation project and popular picnic spot." },
    { name: "Chandgazi Mosque", type: "History", desc: "Mughal era mosque." },
    { name: "Bhasha Shohid Salam Museum", type: "History", desc: "Museum dedicated to language martyr Salam." },
    { name: "Shilua Temple", type: "History", desc: "Ancient archaeological site." }
  ],
  "Noakhali": [
    { name: "Nijhum Dwip", type: "Nature", desc: "Island famous for deer and mangroves." },
    { name: "Bajra Shahi Mosque", type: "History", desc: "Mughal style historic mosque." },
    { name: "Gandhi Ashram", type: "History", desc: "Historical site visited by Mahatma Gandhi." },
    { name: "Musapur Closure", type: "Water", desc: "Scenic riverside spot." },
    { name: "Queen Lourd's Church", type: "History", desc: "Old Catholic church." }
  ],
  "Brahmanbaria": [
    { name: "Arifil Mosque", type: "History", desc: "Ancient mosque in Sarail." },
    { name: "Kal Bhairab Temple", type: "History", desc: "Famous Hindu temple with giant statue." },
    { name: "Ulchapara Mosque", type: "History", desc: "Historic mosque." },
    { name: "Titas River", type: "Water", desc: "River famous from Advaita Mallabarman's novel." },
    { name: "Anderson Memorial", type: "History", desc: "British era memorial." }
  ],
  "Chandpur": [
    { name: "Mohona (Estuary)", type: "Water", desc: "Meeting point of Padma, Meghna, and Dakatia rivers." },
    { name: "Raktakkho Kella", type: "History", desc: "Legendary fortress site." },
    { name: "Mini Cox's Bazar", type: "Water", desc: "River beach area." },
    { name: "Hajiganj Boro Masjid", type: "History", desc: "One of the largest mosques in the region." },
    { name: "Lohagara Moth", type: "History", desc: "Ancient temple structure." }
  ],
  "Lakshmipur": [
    { name: "Dalal Bazar Zamindar Bari", type: "History", desc: "Historic landlord palace." },
    { name: "Khoa Sagar Dighi", type: "Water", desc: "Large pond with legends." },
    { name: "Ramganj Sreerampur Rajbari", type: "History", desc: "Old palace." },
    { name: "Matin Saheb's Mosque", type: "History", desc: "Historic mosque." }
  ],

  // --- SYLHET DIVISION ---
  "Sylhet": [
    { name: "Ratargul Swamp Forest", type: "Nature", desc: "Freshwater swamp forest, best visited by boat." },
    { name: "Jaflong", type: "Nature", desc: "Zero point famous for its rolling stones and hill views." },
    { name: "Bisnakandi", type: "Nature", desc: "Where the Khasi mountains meet the river bed." },
    { name: "Shahjalal Mazar", type: "History", desc: "Shrine of the great Sufi saint Shah Jalal." },
    { name: "Lalakhal", type: "Water", desc: "Blue water canal popular for boat rides." },
    { name: "Malnicherra Tea Garden", type: "Nature", desc: "The oldest tea garden in Bangladesh." },
    { name: "Pangthumai Waterfall", type: "Nature", desc: "Breathtaking waterfall near the border." },
    { name: "Sadapathar (Bholaganj)", type: "Nature", desc: "Known as the 'white stone' paradise." },
    { name: "Keane Bridge", type: "History", desc: "Historic bridge over the Surma river." }
  ],
  "Moulvibazar": [
    { name: "Lawachara National Park", type: "Nature", desc: "Tropical rainforest rich in biodiversity." },
    { name: "Madhabpur Lake", type: "Water", desc: "Lotus-filled lake surrounded by tea hills." },
    { name: "Madhabkunda Waterfall", type: "Water", desc: "One of the largest waterfalls in Bangladesh." },
    { name: "Ham Ham Waterfall", type: "Water", desc: "Trek to a hidden waterfall." },
    { name: "Baikka Beel", type: "Nature", desc: "Sanctuary for migratory birds." },
    { name: "Finlay's Tea Estate", type: "Nature", desc: "Massive tea estate." }
  ],
  "Sreemangal": [
    { name: "Seven Layer Tea Cabin", type: "Culture", desc: "Famous for unique multi-layered tea." },
    { name: "Tea Museum", type: "History", desc: "Showcasing history of tea." },
    { name: "Lawachara Forest", type: "Nature", desc: "Nearby rainforest." },
    { name: "Bteshwer Badhyabhumi", type: "History", desc: "War memorial." }
  ],
  "Habiganj": [
    { name: "Satchari National Park", type: "Nature", desc: "Wildlife sanctuary." },
    { name: "Rema-Kalenga Wildlife Sanctuary", type: "Nature", desc: "Deep forest sanctuary." },
    { name: "Shankhanidhi Architecture", type: "History", desc: "Old architectural heritage." },
    { name: "Bibiyana Gas Field", type: "Attraction", desc: "Major gas field area." }
  ],
  "Sunamganj": [
    { name: "Tanguar Haor", type: "Water", desc: "World famous wetland ecosystem." },
    { name: "Niladri Lake", type: "Water", desc: "Scenic limestone lake (Tekerghat)." },
    { name: "Shimul Bagan", type: "Nature", desc: "Largest silk cotton tree garden." },
    { name: "Jadukata River", type: "Water", desc: "Beautiful blue river." },
    { name: "Hason Raja Museum", type: "History", desc: "Home of the mystic poet." },
    { name: "Bareker Tila", type: "Nature", desc: "Hilltop with river views." }
  ],

  // --- DHAKA DIVISION ---
  "Dhaka": [
    { name: "Lalbagh Fort", type: "History", desc: "17th-century Mughal fort complex." },
    { name: "Ahsan Manzil", type: "History", desc: "Pink Palace, seat of the Nawab of Dhaka." },
    { name: "Jatiya Sangsad Bhaban", type: "Architecture", desc: "National Parliament masterpiece." },
    { name: "Dhakeshwari Temple", type: "History", desc: "National temple of Bangladesh." },
    { name: "National Martyrs' Memorial", type: "History", desc: "Monument in Savar honoring war heroes." },
    { name: "National Zoo", type: "Attraction", desc: "Large zoo in Mirpur." },
    { name: "Botanical Garden", type: "Nature", desc: "Lush garden adjacent to the zoo." },
    { name: "Hatirjheel", type: "Attraction", desc: "Scenic lake area popular for evening walks." },
    { name: "Liberation War Museum", type: "History", desc: "Museum documenting the 1971 war." },
    { name: "Curzon Hall", type: "Architecture", desc: "Historic building of Dhaka University." }
  ],
  "Narayanganj": [
    { name: "Sonargaon (Panam City)", type: "History", desc: "Ancient ghost city with colonial architecture." },
    { name: "Folk Art Museum", type: "History", desc: "Sadarbari museum in Sonargaon." },
    { name: "Goaldi Mosque", type: "History", desc: "Pre-Mughal mosque." },
    { name: "Murapara Zamindar Bari", type: "History", desc: "Grand palace near Rupganj." },
    { name: "Mary Anderson Floating Restaurant", type: "Attraction", desc: "Unique dining on a ship." }
  ],
  "Gazipur": [
    { name: "Bhawal National Park", type: "Nature", desc: "Sal forest park." },
    { name: "Safari Park", type: "Nature", desc: "Bangabandhu Sheikh Mujib Safari Park." },
    { name: "Nuhash Polli", type: "Attraction", desc: "Humayun Ahmed's famous retreat." },
    { name: "Turag River", type: "Water", desc: "River banks popular for boating." },
    { name: "Baliati Zamindar Bari", type: "History", desc: "Located nearby in Manikganj." }
  ],
  "Manikganj": [
    { name: "Baliati Palace", type: "History", desc: "One of the finest zamindar palaces." },
    { name: "Teota Zamindar Bari", type: "History", desc: "Birthplace of Promila Devi." },
    { name: "Aricha Ghat", type: "Water", desc: "Major river port." }
  ],
  "Munshiganj": [
    { name: "Idrakpur Fort", type: "History", desc: "River fort built to stop pirates." },
    { name: "Baba Adam's Mosque", type: "History", desc: "Ancient mosque." },
    { name: "Atish Dipankar's Home", type: "History", desc: "Site related to the Buddhist scholar." },
    { name: "Mawa Ghat", type: "Water", desc: "Famous for Hilsa fish dining." },
    { name: "Padma Bridge View", type: "Attraction", desc: "View of the massive bridge." }
  ],
  "Narsingdi": [
    { name: "Wari-Bateshwar", type: "History", desc: "Ancient archaeological site." },
    { name: "Dream Holiday Park", type: "Attraction", desc: "Popular theme park." },
    { name: "Ghorashal Power Plant", type: "Attraction", desc: "Industrial landmark." }
  ],
  "Tangail": [
    { name: "Mohera Zamindar Bari", type: "History", desc: "Beautifully preserved palace." },
    { name: "Atia Mosque", type: "History", desc: "Historic mosque depicted on currency." },
    { name: "Madhupur National Park", type: "Nature", desc: "Sal forest reserve." },
    { name: "Pirgacha Rubber Garden", type: "Nature", desc: "Scenic rubber plantation." },
    { name: "Jamuna Bridge", type: "Attraction", desc: "Massive bridge over Jamuna river." }
  ],
  "Kishoreganj": [
    { name: "Nikli Haor", type: "Water", desc: "Beautiful wetland area." },
    { name: "Jangalbari Fort", type: "History", desc: "Fort of Isha Khan." },
    { name: "Pagla Mosque", type: "History", desc: "Historic mosque by the river." },
    { name: "Egarosindur", type: "History", desc: "Historical site." }
  ],
  "Faridpur": [
    { name: "River Research Institute", type: "Attraction", desc: "Green campus." },
    { name: "Kanaipur Zamindar Bari", type: "History", desc: "Old palace ruins." },
    { name: "Polli Kobi Jasimuddin's House", type: "History", desc: "Home of the poet." }
  ],
  "Gopalganj": [
    { name: "Mausoleum of Father of the Nation", type: "History", desc: "Tomb of Bangabandhu Sheikh Mujibur Rahman in Tungipara." },
    { name: "Tungipara River View", type: "Water", desc: "Scenic river banks." },
    { name: "Orakandi Thakur Bari", type: "Culture", desc: "Sacred site for Matua community." }
  ],
  "Madaripur": [
    { name: "Shakuni Lake", type: "Water", desc: "Scenic lake in the town." },
    { name: "Senapati Dighi", type: "Water", desc: "Historical pond." }
  ],
  "Rajbari": [
    { name: "Goalanda Ghat", type: "Water", desc: "Historic river port." },
    { name: "Rajbari Rail Station", type: "History", desc: "Old railway heritage." }
  ],
  "Shariatpur": [
    { name: "Burir Hat Mosque", type: "History", desc: "Ancient mosque." },
    { name: "Fatehjangpur Fort", type: "History", desc: "Historical fort site." }
  ],

  // --- BARISHAL DIVISION ---
  "Barishal": [
    { name: "Durga Sagar Dighi", type: "Water", desc: "Large historic pond with an island." },
    { name: "Guthia Mosque", type: "History", desc: "Beautiful mosque complex with stunning architecture." },
    { name: "Oxford Mission Church", type: "History", desc: "Red brick church with unique style." },
    { name: "Floating Guava Market", type: "Culture", desc: "Unique floating market in Bhimruli." },
    { name: "Jibanananda Das House", type: "History", desc: "Ancestral home of the famous poet." },
    { name: "Bell's Park", type: "Attraction", desc: "Oldest park in Barishal city." }
  ],
  "Kuakata": [
    { name: "Kuakata Beach", type: "Water", desc: "Rare spot to see both sunrise and sunset." },
    { name: "Gangamati Forest", type: "Nature", desc: "Mangrove forest." },
    { name: "Misripara Buddhist Temple", type: "History", desc: "Contains a massive Buddha statue." },
    { name: "Fatrar Char", type: "Nature", desc: "Mangrove island." },
    { name: "Lal Kakrar Char", type: "Nature", desc: "Red crab beach." }
  ],
  "Bhola": [
    { name: "Monpura Island", type: "Nature", desc: "Isolated and scenic island." },
    { name: "Char Kukri Mukri", type: "Nature", desc: "Wildlife sanctuary island." },
    { name: "Jacob Tower", type: "Attraction", desc: "Tall watchtower in Char Fasson." }
  ],
  "Patuakhali": [
    { name: "Kuakata", type: "Attraction", desc: "See Kuakata section." },
    { name: "Payra Port", type: "Attraction", desc: "Major seaport area." },
    { name: "Sonar Char", type: "Nature", desc: "Beautiful beach island." }
  ],
  "Pirojpur": [
    { name: "Swarupkathi Floating Market", type: "Culture", desc: "Famous guava market." },
    { name: "Rayerkathi Zamindar Bari", type: "History", desc: "Historic palace." }
  ],
  "Jhalokathi": [
    { name: "Kirtipasha Zamindar Bari", type: "History", desc: "Old landlord house." },
    { name: "Gabkhan Bridge", type: "Attraction", desc: "Scenic bridge over river." }
  ],
  "Barguna": [
    { name: "Bibi Chini Mosque", type: "History", desc: "Ancient Mughal mosque." },
    { name: "Haringhata Forest", type: "Nature", desc: "Mangrove forest near the sea." },
    { name: "Shubhonatar Char", type: "Nature", desc: "Scenic island." }
  ],

  // --- KHULNA DIVISION ---
  "Khulna": [
    { name: "Sundarbans (Karamjal)", type: "Nature", desc: "Gateway to the largest mangrove forest." },
    { name: "Sixty Dome Mosque", type: "History", desc: "UNESCO World Heritage site in Bagerhat." },
    { name: "Khan Jahan Ali Mazar", type: "History", desc: "Shrine of the famous Sufi saint." },
    { name: "Rupsha Bridge", type: "Attraction", desc: "Iconic bridge over the Rupsha river." },
    { name: "UN Park", type: "Attraction", desc: "Recreational park." },
    { name: "Dakshina Dighi", type: "Water", desc: "Scenic pond." }
  ],
  "Bagerhat": [
    { name: "Shat Gombuj Masjid", type: "History", desc: "Sixty Dome Mosque (UNESCO Site)." },
    { name: "Khan Jahan Ali Dighi", type: "Water", desc: "Pond with crocodiles." },
    { name: "Nine Dome Mosque", type: "History", desc: "Historic mosque." },
    { name: "Sundarbans", type: "Nature", desc: "Mangrove forest access." }
  ],
  "Satkhira": [
    { name: "Mandarbariya Sea Beach", type: "Nature", desc: "Secluded beach near Sundarbans." },
    { name: "Nalta Sharif", type: "History", desc: "Shrine of Khan Bahadur Ahsanullah." },
    { name: "Mozaffar Garden", type: "Attraction", desc: "Resort and park." }
  ],
  "Jashore": [
    { name: "Michael Madhusudan Bari", type: "History", desc: "Ancestral home of the poet." },
    { name: "Benapole Land Port", type: "Attraction", desc: "Major border crossing." },
    { name: "Gadkhali Flower Market", type: "Culture", desc: "Flower capital of Bangladesh." },
    { name: "Chachra Shiv Temple", type: "History", desc: "Ancient temple." },
    { name: "Jess Garden Park", type: "Attraction", desc: "Family park." }
  ],
  "Benapole": [
    { name: "Border Gate", type: "Attraction", desc: "Flag lowering ceremony." },
    { name: "Checkpost", type: "Attraction", desc: "Bustling border area." }
  ],
  "Kushtia": [
    { name: "Lalon Akhra", type: "Culture", desc: "Shrine of Lalon Fakir." },
    { name: "Shilaidaha Kuthibari", type: "History", desc: "Rabindranath Tagore's country house." },
    { name: "Hardinge Bridge", type: "History", desc: "Historic railway bridge." }
  ],
  "Jhenaidah": [
    { name: "Johan Dream Valley Park", type: "Attraction", desc: "Amusement park." },
    { name: "Naldanga Temple", type: "History", desc: "Historical temple complex." },
    { name: "Miar Dalan", type: "History", desc: "Ancient landlord house." }
  ],
  "Magura": [
    { name: "Raja Sitaram Palace", type: "History", desc: "Ruins of an old palace." },
    { name: "Siddheshwari Moth", type: "History", desc: "Ancient temple." }
  ],
  "Narail": [
    { name: "SM Sultan Complex", type: "Culture", desc: "Art gallery of SM Sultan." },
    { name: "Niribili Picnic Spot", type: "Attraction", desc: "Local park." }
  ],
  "Meherpur": [
    { name: "Mujibnagar Memorial", type: "History", desc: "Site of first provisional government." },
    { name: "Amjhupi Nilkuthi", type: "History", desc: "Historic indigo factory." }
  ],
  "Chuadanga": [
    { name: "Gholdari Mosque", type: "History", desc: "Ancient mosque." },
    { name: "Carew & Co", type: "History", desc: "Famous sugar mill and distillery." }
  ],

  // --- RAJSHAHI DIVISION ---
  "Rajshahi": [
    { name: "Varendra Museum", type: "History", desc: "Oldest museum in Bangladesh." },
    { name: "Bagha Mosque", type: "History", desc: "Historical mosque with terracotta." },
    { name: "Puthia Temple Complex", type: "History", desc: "Cluster of ancient Hindu temples." },
    { name: "Padma Garden", type: "Nature", desc: "Riverside park." },
    { name: "Central Park & Zoo", type: "Attraction", desc: "City zoo." },
    { name: "Rajshahi University", type: "Attraction", desc: "Green campus." }
  ],
  "Bogura": [
    { name: "Mahasthangarh", type: "History", desc: "Oldest archaeological site." },
    { name: "Behular Bashor Ghor", type: "History", desc: "Legendary site." },
    { name: "Mom Inn Park", type: "Attraction", desc: "Amusement park and resort." },
    { name: "Kherua Mosque", type: "History", desc: "Mughal mosque." }
  ],
  "Pabna": [
    { name: "Hardinge Bridge", type: "History", desc: "Iconic steel railway bridge." },
    { name: "Pabna Mental Hospital", type: "History", desc: "Famous historical institution." },
    { name: "Jor Bangla Temple", type: "History", desc: "Terracotta temple." },
    { name: "Tarash Bhaban", type: "History", desc: "Old zamindar house." }
  ],
  "Sirajganj": [
    { name: "Bangabandhu Bridge", type: "Attraction", desc: "Gateway to North Bengal." },
    { name: "Rabindra Kacharibari", type: "History", desc: "Tagore's administrative house." },
    { name: "Navaratna Temple", type: "History", desc: "Ancient temple." }
  ],
  "Naogaon": [
    { name: "Paharpur (Somapura Mahavihara)", type: "History", desc: "UNESCO World Heritage Buddhist vihara." },
    { name: "Kusumba Mosque", type: "History", desc: "Stone mosque on 5 taka note." },
    { name: "Alta Dighi", type: "Water", desc: "Large historic pond." }
  ],
  "Natore": [
    { name: "Natore Rajbari", type: "History", desc: "Rani Bhabani's palace." },
    { name: "Uttara Ganabhaban", type: "History", desc: "Prime Minister's northern residence." },
    { name: "Chalan Beel", type: "Water", desc: "Largest wetland area." }
  ],
  "Chapainawabganj": [
    { name: "Choto Sona Mosque", type: "History", desc: "Historical mosque." },
    { name: "Tohan Khana", type: "History", desc: "Ancient palace complex." },
    { name: "Rohanpur Octagonal Tomb", type: "History", desc: "Historic tomb." }
  ],
  "Joypurhat": [
    { name: "Baro Shibalaya", type: "History", desc: "12 Shiva temples." },
    { name: "Lockma Rajbari", type: "History", desc: "Ruins of a palace." }
  ],

  // --- RANGPUR DIVISION ---
  "Rangpur": [
    { name: "Tajhat Palace", type: "History", desc: "Baroque style palace museum." },
    { name: "Vinnya Jagat", type: "Attraction", desc: "Amusement park." },
    { name: "Carmichael College", type: "History", desc: "Heritage campus." },
    { name: "Chikli Vata", type: "Water", desc: "Lake park." },
    { name: "Teesta Barrage", type: "Attraction", desc: "Irrigation project." }
  ],
  "Dinajpur": [
    { name: "Kantajew Temple", type: "History", desc: "Famous terracotta temple." },
    { name: "Ramsagar Dighi", type: "Water", desc: "Largest man-made pond." },
    { name: "Nayabad Mosque", type: "History", desc: "Ancient mosque." },
    { name: "Swapnapuri", type: "Attraction", desc: "Theme park." }
  ],
  "Panchagarh": [
    { name: "Tetulia Tea Gardens", type: "Nature", desc: "Plain land tea gardens." },
    { name: "Banglabandha Zero Point", type: "Attraction", desc: "Northernmost border point." },
    { name: "Kanchenjunga View", type: "Nature", desc: "View of Himalayas in winter." },
    { name: "Maharaja's Dighi", type: "Water", desc: "Large pond." }
  ],
  "Thakurgaon": [
    { name: "Baliadangi Mango Tree", type: "Nature", desc: "Asia's largest mango tree." },
    { name: "Fun City", type: "Attraction", desc: "Amusement park." },
    { name: "Jagdal Rajbari", type: "History", desc: "Palace ruins." }
  ],
  "Nilphamari": [
    { name: "Nilsagar", type: "Water", desc: "Historical pond and bird sanctuary." },
    { name: "Teesta Barrage", type: "Attraction", desc: "Scenic barrage area." },
    { name: "Chini Mosque", type: "History", desc: "Mosque decorated with china clay." }
  ],
  "Kurigram": [
    { name: "Dharla Bridge", type: "Attraction", desc: " scenic bridge." },
    { name: "Chilmari Port", type: "Water", desc: "River port." }
  ],
  "Lalmonirhat": [
    { name: "Tin Bigha Corridor", type: "History", desc: "Historical border corridor." },
    { name: "Teesta Railway Bridge", type: "History", desc: "Old bridge." }
  ],
  "Gaibandha": [
    { name: "Balashi Ghat", type: "Water", desc: "Scenic river bank." },
    { name: "Dreamland", type: "Attraction", desc: "Park." }
  ],

  // --- MYMENSINGH DIVISION ---
  "Mymensingh": [
    { name: "Shashi Lodge", type: "History", desc: "Maharaja's palace." },
    { name: "Alexander Castle", type: "History", desc: "Iron cottage." },
    { name: "Botanical Garden", type: "Nature", desc: "Agricultural university garden." },
    { name: "Muktagacha Rajbari", type: "History", desc: "Ancient palace." },
    { name: "Zainul Abedin Museum", type: "History", desc: "Art gallery." },
    { name: "Brahmaputra River", type: "Water", desc: "Riverside park." }
  ],
  "Netrokona": [
    { name: "Birishiri (Susang Durgapur)", type: "Nature", desc: "Ceramic hills and blue lake." },
    { name: "Bijoypur", type: "Nature", desc: "Blue water lake." },
    { name: "Hazrat Shah Sultan Shrine", type: "History", desc: "Religious site." }
  ],
  "Sherpur": [
    { name: "Gozni Abokash", type: "Nature", desc: "Hilltop picnic spot." },
    { name: "Modhutila Ecopark", type: "Nature", desc: "Forest park near border." }
  ],
  "Jamalpur": [
    { name: "Lauchapra", type: "Nature", desc: "Hill area." },
    { name: "Gandhi Ashram", type: "History", desc: "Historical site." }
  ]
};

// --- Helper to find spots based on location string ---
const getSpotsForLocation = (location: string | undefined | null) => {
  if (!location) return { city: 'Unknown', spots: [] };
  const locLower = location.toLowerCase();

  // 1. Try to find specific curated spots
  for (const key of Object.keys(TOURIST_SPOTS)) {
    if (locLower.includes(key.toLowerCase())) {
      return { city: key, spots: TOURIST_SPOTS[key] };
    }
  }

  // 2. Fallback for unlisted cities (Just in case, but database covers most)
  const cleanCity = location.split(',')[0].trim();
  const genericSpots = [
    { name: `${cleanCity} Central Park`, type: "Attraction", desc: "The main recreational park of the city." },
    { name: "Central Shaheed Minar", type: "History", desc: "Monument dedicated to the Language Movement." },
    { name: `${cleanCity} Boro Bazar`, type: "Culture", desc: "The central market bustling with local life." },
    { name: "Circuit House", type: "History", desc: "Historical government building with gardens." },
    { name: `${cleanCity} Zilla School`, type: "History", desc: "One of the oldest educational institutions." },
    { name: "Central Jame Mosque", type: "History", desc: "The main mosque of the district." },
    { name: "Public Library", type: "Culture", desc: "Local hub for knowledge and history." },
    { name: "River/Lake View Point", type: "Water", desc: "Scenic spot near the local water body." },
    { name: "Upazila Parishad Park", type: "Nature", desc: "Green space for evening walks." },
    { name: "Local Museum", type: "History", desc: "Showcasing the heritage of the region." }
  ];

  return { city: cleanCity, spots: genericSpots };
};

// --- Tourist Modal Component ---
const TouristSpotsModal: React.FC<{ city: string; spots: any[]; onClose: () => void }> = ({ city, spots, onClose }) => {
  // Prevent body scrolling when modal is open
  React.useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-white/90 dark:bg-kj-chip-bg/90 backdrop-blur-xl w-full max-w-2xl rounded-[2rem] shadow-2xl border border-white dark:border-kj-line overflow-hidden flex flex-col max-h-[80vh] animate-fade-in-up" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-500 to-emerald-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-300 fill-current animate-pulse" />
              Discover {city}
            </h3>
            <p className="text-teal-100 text-sm mt-1">Famous attractions & hidden gems</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spots.map((spot, idx) => {
              let Icon = MapPin;
              let color = "text-kj-text-dim";
              let bg = "bg-gray-100";

              if (spot.type === "Nature") { Icon = Mountain; color = "text-kj-primary"; bg = "bg-kj-primary-soft"; }
              else if (spot.type === "Water") { Icon = Waves; color = "text-blue-600"; bg = "bg-blue-50"; }
              else if (spot.type === "History") { Icon = History; color = "text-amber-600"; bg = "bg-amber-50"; }
              else if (spot.type === "Attraction") { Icon = Camera; color = "text-purple-600"; bg = "bg-purple-50"; }
              else if (spot.type === "Culture") { Icon = Flag; color = "text-rose-600"; bg = "bg-rose-50"; }
              else if (spot.type === "Architecture") { Icon = Navigation; color = "text-indigo-600"; bg = "bg-indigo-50"; }

              return (
                <div key={idx} className="bg-white dark:bg-slate-700 p-4 rounded-2xl border border-kj-line dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-kj-text">{spot.name}</h4>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${bg} ${color} mb-1 inline-block`}>
                        {spot.type}
                      </span>
                      <p className="text-xs text-kj-text-dim leading-relaxed mt-1">{spot.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-700 border-t border-kj-line dark:border-gray-600 text-center text-xs text-kj-text-faint dark:text-kj-text-faint shrink-0">
          Explore these spots during your visit to {city}!
        </div>
      </div>
    </div>
  );
};


const StepIcon: React.FC<{ mode: TransportMode }> = ({ mode }) => {
  let bgClass = "bg-gray-400";
  let Icon = Navigation;

  switch (mode) {
    case TransportMode.AIR:
      bgClass = "bg-blue-500";
      Icon = Plane;
      break;
    case TransportMode.TRAIN:
      bgClass = "bg-orange-500";
      Icon = Train;
      break;
    case TransportMode.METRO_RAIL:
      bgClass = "bg-kj-accent";
      Icon = Train;
      break;
    case TransportMode.BUS:
      bgClass = "bg-kj-primary";
      Icon = Bus;
      break;
    case TransportMode.LOCAL_BUS:
      bgClass = "bg-kj-primary";
      Icon = Bus;
      break;
    case TransportMode.CNG:
      bgClass = "bg-green-600";
      Icon = Car;
      break;
    case TransportMode.RICKSHAW:
      bgClass = "bg-purple-500";
      Icon = Bike;
      break;
    case TransportMode.FERRY:
      bgClass = "bg-cyan-500";
      Icon = Ship;
      break;
    case TransportMode.WALK:
      bgClass = "bg-gray-400";
      Icon = MapPin;
      break;
  }

  return (
    <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl ${bgClass} shadow-lg shadow-${bgClass}/30 border-[3px] border-white z-10 transition-transform hover:scale-110 duration-200`}>
      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
    </div>
  );
};

const ScheduleList: React.FC<{ schedules: Schedule[], mode: TransportMode }> = ({ schedules, mode }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!schedules || schedules.length === 0) return null;

  const getLabel = () => {
    switch (mode) {
      case TransportMode.AIR: return 'Flights';
      case TransportMode.TRAIN: return 'Trains';
      case TransportMode.FERRY: return 'Ships';
      default: return 'Buses';
    }
  };

  const getThemeColor = () => {
    switch (mode) {
      case TransportMode.AIR: return 'blue';
      case TransportMode.TRAIN: return 'orange';
      case TransportMode.FERRY: return 'cyan';
      default: return 'teal';
    }
  };

  const label = getLabel();
  const color = getThemeColor();

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group w-full flex items-center justify-between p-3 bg-kj-panel border border-kj-line rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
      >
        <span className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full bg-${color}-50 flex items-center justify-center text-${color}-600`}>
            <Ticket size={16} />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-kj-text uppercase tracking-wider">Available {label}</div>
            <div className="text-[10px] text-kj-text-faint font-medium">{schedules.length} options found</div>
          </div>
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-gray-100 text-kj-text-dim' : 'bg-transparent text-kj-text-faint'}`}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 grid gap-3">
          {schedules.map((schedule, idx) => (
            <div key={idx} className="relative bg-kj-panel border border-kj-line rounded-xl p-0 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group/item">
              {/* Ticket Left Color Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-${color}-400 to-${color}-500`}></div>

              <div className="pl-5 pr-4 py-3 flex flex-col gap-2">
                {/* Top Row: Operator & Price */}
                <div className="flex justify-between items-center border-b border-dashed border-kj-line pb-2">
                  <span className="font-bold text-kj-text text-sm">{schedule.operator}</span>
                  <span className={`font-bold text-${color}-600 bg-${color}-50 px-2 py-0.5 rounded text-xs`}>
                    {schedule.price}
                  </span>
                </div>

                {/* Middle Row: Time & Type */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-kj-text-dim px-2 py-1 rounded font-medium">{schedule.type}</span>
                    <span className="flex items-center gap-1 text-kj-text-dim font-medium">
                      <Clock size={12} className="text-kj-text-faint" /> {schedule.departureTime}
                    </span>
                  </div>
                  {schedule.contactNumber && (
                    <a href={`tel:${schedule.contactNumber}`} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                      <Phone size={10} className="shrink-0" /> {schedule.contactNumber}
                    </a>
                  )}
                </div>

                {/* Bottom Row: Counter */}
                <div className="flex items-end justify-between pt-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin size={12} className="text-kj-text-faint mt-0.5 shrink-0" />
                    <span className="text-[11px] text-kj-text-dim leading-tight">{schedule.counter}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const RouteDetail: React.FC<RouteDetailProps> = ({ option }) => {
  const [showTouristModal, setShowTouristModal] = useState(false);

  // Find tourist spots for the final destination
  const lastStep = option.steps[option.steps.length - 1];
  const destination = lastStep ? lastStep.to : 'Unknown';
  const nearbySpots = getSpotsForLocation(destination);
  const weather = option.destinationWeather;

  return (
    <>
      <div className="bg-white/80 dark:bg-kj-chip-bg/80 backdrop-blur-xl rounded-[2.5rem] shadow-glass border border-white dark:border-kj-line overflow-hidden flex flex-col">

        {/* Header Info */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-white dark:from-slate-800 to-gray-50/50 dark:to-slate-900/50">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-2xl text-kj-text leading-tight">{option.title}</h3>
              <p className="text-sm text-kj-text-dim font-medium max-w-md leading-relaxed">{option.summary}</p>
            </div>
            <div className="flex md:flex-col items-center md:items-end gap-3 md:gap-1 bg-white dark:bg-slate-700 p-3 rounded-2xl shadow-sm border border-kj-line dark:border-gray-600">
              <div className="text-xl font-bold text-kj-primary">{option.totalCostRange}</div>
              <div className="text-xs font-bold text-kj-text-dim uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded-md">{option.totalDuration}</div>
            </div>
          </div>

          {/* Weather Forecast Widget (If available) */}
          {weather && (
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm text-2xl">
                  {weather.icon === 'SUN' ? <Sun size={24} className="text-amber-500" /> :
                    weather.icon === 'RAIN' ? <CloudRain size={24} className="text-blue-500" /> :
                      weather.icon === 'WIND' ? <Wind size={24} className="text-kj-text-dim" /> :
                        <Cloud size={24} className="text-kj-text-faint" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-kj-text text-lg">{weather.temperature}</span>
                    <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-md text-blue-600 border border-blue-100">{weather.condition}</span>
                  </div>
                  <p className="text-xs text-kj-text-dim leading-tight mt-0.5">{weather.advice}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-bold uppercase text-kj-text-faint tracking-wider">Destination</span>
                <div className="text-sm font-bold text-kj-text-dim">{destination}</div>
              </div>
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="w-full h-56 md:h-80 relative border-y border-kj-line">
          <RouteMap steps={option.steps} />
          {/* Gradients to blend map */}
          <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-white dark:from-slate-800 to-transparent pointer-events-none z-[400]"></div>
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none z-[400]"></div>

          {/* Live View Badge */}
          <div className="absolute top-4 left-4 z-[500] bg-kj-panel/90 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-kj-line shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-kj-primary"></span>
            </span>
            LIVE VIEW
          </div>
        </div>

        {/* Pros & Cons Section (Modern UI) */}
        {((option as any).enhancedData?.tips?.pros || (option as any).enhancedData?.tips?.cons) && (
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-kj-panel">

            {/* Why Choose This */}
            {(option as any).enhancedData?.tips?.pros && (option as any).enhancedData.tips.pros.length > 0 && (
              <div className="bg-kj-primary-soft/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-kj-primary-soft rounded-lg">
                    <Sparkles className="w-4 h-4 text-kj-primary" />
                  </div>
                  <h4 className="font-bold text-emerald-900 dark:text-kj-primary text-sm uppercase tracking-wide">Why Choose This</h4>
                </div>
                <ul className="space-y-3">
                  {(option as any).enhancedData.tips.pros.map((pro: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-kj-text-dim">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-kj-primary-soft flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5 text-kj-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="leading-relaxed">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Considerations */}
            {(option as any).enhancedData?.tips?.cons && (option as any).enhancedData.tips.cons.length > 0 && (
              <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Flag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm uppercase tracking-wide">Key Considerations</h4>
                </div>
                <ul className="space-y-3">
                  {(option as any).enhancedData.tips.cons.map((con: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-kj-text-dim">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px]">!</span>
                      </div>
                      <span className="leading-relaxed">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Transport Details Section */}
        {(option as any).enhancedData && !(option as any).enhancedData?.tips?.pros && (
          <div className="p-6 md:p-8 bg-gray-50 dark:bg-kj-chip-bg/50">
            <EnhancedTransportDetails
              enhancedData={(option as any).enhancedData}
              tips={(option as any).enhancedData?.tips}
            />
          </div>
        )}

        {/* Timeline Section */}
        <div className="p-6 md:p-8 bg-kj-panel">
          <div className="relative pl-4 md:pl-6 pb-4">

            {/* Continuous Vertical Line */}
            <div className="absolute left-[19px] md:left-[23px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-gray-200 dark:from-gray-700 via-gray-300 dark:via-gray-600 to-gray-200 dark:to-gray-700"></div>

            <div className="space-y-10 md:space-y-12">
              {option.steps.map((step, index) => (
                <div key={index} className="relative pl-12 md:pl-16">

                  {/* Step Icon */}
                  <div className="absolute left-0 top-0">
                    <StepIcon mode={step.mode as TransportMode} />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-3 group">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <h4 className="font-bold text-kj-text text-lg leading-tight group-hover:text-kj-primary transition-colors">{step.instruction}</h4>
                      {step.duration && (
                        <span className="text-[11px] font-bold bg-gray-50 px-2.5 py-1 rounded-lg text-kj-text-dim border border-kj-line whitespace-nowrap self-start">
                          {step.duration}
                        </span>
                      )}
                    </div>

                    {/* From -> To */}
                    <div className="flex items-center gap-2 text-sm text-kj-text-dim bg-gray-50/50 w-fit px-3 py-1.5 rounded-lg border border-kj-line/50">
                      <span className="font-semibold text-kj-text-dim">{step.from}</span>
                      <ArrowRight size={14} className="text-kj-text-faint" />
                      <span className="font-semibold text-kj-text-dim">{step.to}</span>
                    </div>

                    {/* Specific Details Cards */}
                    <div className="w-full">
                      {/* Local Bus Detail */}
                      {step.mode === TransportMode.LOCAL_BUS && step.details?.busName && (
                        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mt-2 shadow-sm flex items-center gap-4">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                            <Bus size={18} className="text-teal-700" />
                          </div>
                          <div>
                            <span className="block text-[10px] text-teal-600 font-bold uppercase tracking-wider mb-0.5">Recommended Bus</span>
                            <span className="font-bold text-teal-900 text-lg">{step.details.busName}</span>
                          </div>
                        </div>
                      )}

                      {/* Metro Rail Detail */}
                      {step.mode === TransportMode.METRO_RAIL && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mt-2 shadow-sm flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                            <Train size={18} className="text-red-700" />
                          </div>
                          <div>
                            <span className="block text-[10px] text-red-600 font-bold uppercase tracking-wider mb-0.5">Rapid Transit</span>
                            <span className="font-bold text-red-900 text-lg">MRT Line 6</span>
                          </div>
                        </div>
                      )}

                      {/* Intercity Bus / Train / Ferry Schedules List */}
                      {step.details?.schedules && step.details.schedules.length > 0 && (
                        <ScheduleList schedules={step.details.schedules} mode={step.mode as TransportMode} />
                      )}

                      {/* Fallback info */}
                      {!step.details?.schedules && (step.details?.flightName || step.details?.trainName || step.details?.operator) && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mt-2 text-sm">
                          <div className="font-bold text-blue-900 text-base mb-1">
                            {step.details.operator} {step.details.flightName} {step.details.trainName}
                          </div>
                          {step.details.busCounter && (
                            <div className="text-xs text-blue-700 flex items-center gap-1.5 opacity-80">
                              <MapPin size={12} /> Counter: {step.details.busCounter}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {step.cost && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-kj-text-faint uppercase tracking-wider">Est. Cost</span>
                        <span className="font-bold text-kj-text-dim text-xs bg-gray-100 px-2 py-0.5 rounded-md border border-kj-line">{step.cost}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Destination Marker with Discovery */}
              <div className="relative pl-12 md:pl-16">
                <div className="absolute left-0 top-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-kj-accent shadow-lg shadow-red-500/30 border-[3px] border-white z-10 animate-pulse-slow">
                  <Flag className="text-white w-5 h-5 md:w-6 md:h-6 fill-current" />
                </div>
                <div className="flex flex-col pt-1">
                  <h4 className="font-bold text-kj-text text-xl">Arrive at {destination}</h4>
                  <p className="text-sm text-kj-text-dim font-medium">Trip Completed</p>

                  {/* Discovery Button */}
                  {nearbySpots && (
                    <button
                      onClick={() => setShowTouristModal(true)}
                      className="mt-4 flex items-center gap-2 bg-gradient-to-r from-teal-400 to-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 w-fit group"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-200 fill-current animate-pulse" />
                      <span className="font-bold text-sm">Discover {nearbySpots.city}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tourist Modal */}
      {showTouristModal && nearbySpots && (
        <TouristSpotsModal
          city={nearbySpots.city}
          spots={nearbySpots.spots}
          onClose={() => setShowTouristModal(false)}
        />
      )}
    </>
  );
};
