import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, MapPin, Bus, Search, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import AdSenseAd from './AdSenseAd';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureUsage } from '../services/analyticsService';



interface Props { onBack: () => void; }

type GuideEntry = {
  area: string;
  areaEn: string;
  division: string;
  description: string;
  descriptionEn: string;
  metroAccess: string[];
  metroAccessEn: string[];
  buses: string[];
  busesEn: string[];
  tips: string[];
  tipsEn: string[];
  landmarks: string[];
  landmarksEn: string[];
  icon: string;
};

const GUIDES = [
  // ─── Dhaka ──────────────────────────────────────────────────────────────────
  {
    area: 'মিরপুর', areaEn: 'Mirpur', division: 'Dhaka',
    description: 'ঢাকার উত্তর-পশ্চিমের ঘনবসতিপূর্ণ এলাকা। MRT-6 মেট্রো সুবিধা ও অনেক লোকাল বাস আছে।',
    descriptionEn: 'A densely populated area in northwest Dhaka. Well connected by MRT-6 metro and many local buses.',
    metroAccess: ['মিরপুর-১০ (MRT-6)', 'মিরপুর-১১ (MRT-6)', 'কাজীপাড়া (MRT-6)', 'শেওড়াপাড়া (MRT-6)', 'পল্লবী (MRT-6)'],
    metroAccessEn: ['Mirpur-10 (MRT-6)', 'Mirpur-11 (MRT-6)', 'Kazipara (MRT-6)', 'Sheorapara (MRT-6)', 'Pallabi (MRT-6)'],
    buses: ['০১', '১৩', '৩৫', '৫৫', '৬০', 'ভার্সিটি এক্সপ্রেস'],
    busesEn: ['01', '13', '35', '55', '60', 'Varsity Express'],
    tips: ['মিরপুর-১০ বা মিরপুর-১১ থেকে MRT-6 মেট্রো নিন মতিঝিল বা উত্তরা যেতে', 'সকাল ৮-১০টা ভীষণ ভিড় থাকে', 'শাহবাগ বা ফার্মগেট যেতে বাস সুবিধাজনক'],
    tipsEn: ['Take MRT-6 from Mirpur-10 or Mirpur-11 for Motijheel or Uttara', 'Very crowded 8–10 AM', 'Bus is convenient for Shahbagh or Farmgate'],
    landmarks: ['মিরপুর চিড়িয়াখানা', 'শহীদ বুদ্ধিজীবী স্মৃতিসৌধ', 'বাংলাদেশ ক্রিকেট স্টেডিয়াম'],
    landmarksEn: ['Mirpur Zoo', 'Martyred Intellectuals Memorial', 'Bangladesh Cricket Stadium'],
    icon: '🏘️',
  },
  {
    area: 'ধানমন্ডি', areaEn: 'Dhanmondi', division: 'Dhaka',
    description: 'আবাসিক ও বাণিজ্যিক মিশ্রিত এলাকা। শিক্ষা প্রতিষ্ঠান ও শপিং মলে ভরপুর।',
    descriptionEn: 'A mixed residential and commercial area. Full of educational institutions and shopping malls.',
    metroAccess: ['বিজয় সরণি (MRT-6, কাছাকাছি)'],
    metroAccessEn: ['Bijoy Sarani (MRT-6, nearby)'],
    buses: ['সিটি বাস রুট ৮', '২৮', 'গুলিস্তান-ধানমন্ডি'],
    busesEn: ['City Bus Route 8', '28', 'Gulistan-Dhanmondi'],
    tips: ['ধানমন্ডি-২৭ থেকে বাস বেশি পাওয়া যায়', 'শুক্রবার রাস্তা অপেক্ষাকৃত ফাঁকা থাকে', 'রিকশা কম দূরত্বের জন্য ভালো'],
    tipsEn: ['More buses available from Dhanmondi-27', 'Roads are relatively quiet on Fridays', 'Rickshaw is good for short distances'],
    landmarks: ['রবীন্দ্র সরোবর', '৩২ নম্বর বঙ্গবন্ধু জাদুঘর', 'ধানমন্ডি লেক'],
    landmarksEn: ['Rabindra Sarobar', 'Bangabandhu Museum (Road 32)', 'Dhanmondi Lake'],
    icon: '🌳',
  },
  {
    area: 'মতিঝিল', areaEn: 'Motijheel', division: 'Dhaka',
    description: 'ঢাকার প্রধান বাণিজ্যিক কেন্দ্র। ব্যাংক, সরকারি অফিস এখানে অবস্থিত।',
    descriptionEn: "Dhaka's main commercial hub. Banks and government offices are located here.",
    metroAccess: ['মতিঝিল (MRT-6)', 'বাংলাদেশ সচিবালয় (MRT-6)'],
    metroAccessEn: ['Motijheel (MRT-6)', 'Bangladesh Secretariat (MRT-6)'],
    buses: ['প্রায় সব রুটের টার্মিনাল এখানে'],
    busesEn: ['Terminal for almost all routes'],
    tips: ['মেট্রো সবচেয়ে দ্রুত বিকল্প', 'অফিস সময়ে (৮-১০টা, ৫-৭টা) ভীষণ যানজট', 'শাপলা চত্বরে যানজট এড়াতে বিকল্প রাস্তা ব্যবহার করুন'],
    tipsEn: ['Metro is the fastest option', 'Severe traffic during office hours (8–10 AM, 5–7 PM)', 'Use alternate roads to avoid Shapla Chattar traffic'],
    landmarks: ['শাপলা চত্বর', 'বাংলাদেশ ব্যাংক ভবন', 'জনতা ব্যাংক ভবন'],
    landmarksEn: ['Shapla Chattar', 'Bangladesh Bank Building', 'Janata Bank Building'],
    icon: '🏦',
  },
  {
    area: 'উত্তরা', areaEn: 'Uttara', division: 'Dhaka',
    description: 'ঢাকার উত্তরে আধুনিক আবাসিক এলাকা। এয়ারপোর্টের কাছে এবং MRT-6 শেষ প্রান্ত।',
    descriptionEn: "A modern residential area north of Dhaka. Close to the airport and the northern end of MRT-6.",
    metroAccess: ['উত্তরা উত্তর (MRT-6)', 'উত্তরা সেন্টার (MRT-6)', 'উত্তরা দক্ষিণ (MRT-6)'],
    metroAccessEn: ['Uttara North (MRT-6)', 'Uttara Center (MRT-6)', 'Uttara South (MRT-6)'],
    buses: ['বিআরটিসি এয়ারপোর্ট বাস', 'গাজীপুর রুট'],
    busesEn: ['BRTC Airport Bus', 'Gazipur Route'],
    tips: ['এয়ারপোর্ট যেতে মেট্রো + হাঁটা সুবিধাজনক', 'সেক্টর ৩, ৭, ১১ থেকে মেট্রো সহজ', 'গাজীপুর যেতে বিআরটিসি বাস ব্যবহার করুন'],
    tipsEn: ['Metro + walking is convenient for the airport', 'Easy metro access from Sectors 3, 7, 11', 'Use BRTC bus for Gazipur'],
    landmarks: ['হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর', 'উত্তরা মডেল টাউন', 'জামে মসজিদ'],
    landmarksEn: ['Hazrat Shahjalal International Airport', 'Uttara Model Town', 'Jame Masjid'],
    icon: '✈️',
  },
  {
    area: 'গুলশান-বনানী', areaEn: 'Gulshan-Banani', division: 'Dhaka',
    description: 'অভিজাত কূটনৈতিক এলাকা। দূতাবাস, আন্তর্জাতিক রেস্তোরাঁ ও অফিস।',
    descriptionEn: 'Upscale diplomatic zone. Embassies, international restaurants, and offices.',
    metroAccess: ['নিকটস্থ: বিজয় সরণি (MRT-6)'],
    metroAccessEn: ['Nearest: Bijoy Sarani (MRT-6)'],
    buses: ['গুলশান-মতিঝিল সার্ভিস', 'বিআরটিসি স্পেশাল'],
    busesEn: ['Gulshan-Motijheel Service', 'BRTC Special'],
    tips: ['গুলশান ২ চত্বর থেকে বাস পাওয়া যায়', 'সিএনজি ও উবার সহজলভ্য', 'ভিড় কম কিন্তু ভাড়া বেশি'],
    tipsEn: ['Buses available from Gulshan 2 roundabout', 'CNG and Uber easily available', 'Less crowded but fares are higher'],
    landmarks: ['গুলশান লেক', 'বনানী কবরস্থান', 'ওয়েস্টিন হোটেল'],
    landmarksEn: ['Gulshan Lake', 'Banani Cemetery', 'Westin Hotel'],
    icon: '🏢',
  },
  {
    area: 'পুরান ঢাকা', areaEn: 'Old Dhaka', division: 'Dhaka',
    description: 'ঐতিহাসিক ঢাকার কেন্দ্র। সরু গলি, ঐতিহ্যবাহী ব্যবসা ও স্থাপত্য।',
    descriptionEn: 'The historic heart of Dhaka. Narrow lanes, traditional trades, and heritage architecture.',
    metroAccess: ['বাংলাদেশ সচিবালয় (MRT-6, পায়ে হেঁটে)'],
    metroAccessEn: ['Bangladesh Secretariat (MRT-6, walkable)'],
    buses: ['গুলিস্তান-সদরঘাট', 'পুরান ঢাকা সার্ভিস'],
    busesEn: ['Gulistan-Sadarghat', 'Old Dhaka Service'],
    tips: ['রিকশা ও ইজিবাইক মূল যান', 'সদরঘাট থেকে লঞ্চে বরিশাল যাওয়া যায়', 'সন্ধ্যায় ইফতার বাজারে ভিড় থাকে'],
    tipsEn: ['Rickshaw and easy-bike are the main vehicles', 'Ferries to Barisal depart from Sadarghat', 'Crowded near iftar markets in the evening'],
    landmarks: ['আহসান মঞ্জিল', 'লালবাগ কেল্লা', 'বুড়িগঙ্গা নদী', 'সদরঘাট লঞ্চ টার্মিনাল'],
    landmarksEn: ['Ahsan Manzil', 'Lalbagh Fort', 'Buriganga River', 'Sadarghat Launch Terminal'],
    icon: '🏛️',
  },
  {
    area: 'ফার্মগেট-কারওয়ান বাজার', areaEn: 'Farmgate-Karwan Bazar', division: 'Dhaka',
    description: 'ঢাকার কেন্দ্রীয় সংযোগস্থল। মিডিয়া অফিস, কিচেন মার্কেট এখানে।',
    descriptionEn: "Dhaka's central interchange. Media offices and kitchen markets here.",
    metroAccess: ['ফার্মগেট (MRT-6)', 'কারওয়ান বাজার (MRT-6)'],
    metroAccessEn: ['Farmgate (MRT-6)', 'Karwan Bazar (MRT-6)'],
    buses: ['প্রায় সব রুটের সংযোগস্থল'],
    busesEn: ['Hub for almost all routes'],
    tips: ['মেট্রো সবচেয়ে দ্রুত যাতায়াতের মাধ্যম', 'বাজার সময়ে প্রচুর ভিড় থাকে', 'রাত ১০টার পর বাস কম থাকে'],
    tipsEn: ['Metro is the fastest mode of transport', 'Very crowded during market hours', 'Fewer buses after 10 PM'],
    landmarks: ['সোনারগাঁও হোটেল', 'কারওয়ান বাজার', 'বিটিভি ভবন'],
    landmarksEn: ['Sonargaon Hotel', 'Karwan Bazar', 'BTV Building'],
    icon: '🔁',
  },
  {
    area: 'যাত্রাবাড়ী-সায়েদাবাদ', areaEn: 'Jatrabari-Sayedabad', division: 'Dhaka',
    description: 'দক্ষিণ-পূর্ব ঢাকার ব্যস্ত প্রবেশদ্বার। দেশের প্রধান বাস টার্মিনাল।',
    descriptionEn: 'Busy southeastern gateway of Dhaka. The main intercity bus terminal.',
    metroAccess: ['পরিকল্পনাধীন MRT-2 (ভবিষ্যতে)'],
    metroAccessEn: ['Planned MRT-2 (future)'],
    buses: ['সায়েদাবাদ থেকে সারা দেশে ইন্টারসিটি বাস'],
    busesEn: ['Intercity buses to all parts of the country from Sayedabad'],
    tips: ['ইন্টারসিটি বাসের জন্য আগে টিকিট কাটুন', 'সায়েদাবাদ বাস টার্মিনাল থেকে ঢাকার বাইরে যান', 'ভোরে ও বিকালে সবচেয়ে বেশি বাস থাকে'],
    tipsEn: ['Buy tickets in advance for intercity buses', 'Use Sayedabad Bus Terminal to go outside Dhaka', 'Most buses in early morning and afternoon'],
    landmarks: ['সায়েদাবাদ বাস টার্মিনাল', 'যাত্রাবাড়ী চৌরাস্তা'],
    landmarksEn: ['Sayedabad Bus Terminal', 'Jatrabari Intersection'],
    icon: '🚍',
  },
  {
    area: 'সাভার', areaEn: 'Savar', division: 'Dhaka',
    description: 'ঢাকার পশ্চিমে শিল্প ও আবাসিক এলাকা। গার্মেন্টস শিল্পের কেন্দ্র।',
    descriptionEn: 'Industrial and residential area west of Dhaka. Centre of the garments industry.',
    metroAccess: ['কোনো মেট্রো নেই (BRT পরিকল্পনাধীন)'],
    metroAccessEn: ['No metro (BRT planned)'],
    buses: ['সাভার পরিবহন', 'বোয়ালখালী', 'ট্রান্সিলভা', 'ঢাকা-সাভার গণপরিবহন'],
    busesEn: ['Savar Paribahan', 'Bawakhali', 'Transsilva', 'Dhaka-Savar Public Bus'],
    tips: ['ঢাকা থেকে আসতে গাবতলী বাস টার্মিনাল ব্যবহার করুন', 'সকাল ৭-৯টায় প্রচুর ভিড় থাকে', 'উবার/পাঠাও সহজলভ্য'],
    tipsEn: ['Use Gabtoli Bus Terminal from Dhaka', 'Very crowded 7–9 AM', 'Uber/Pathao easily available'],
    landmarks: ['জাতীয় স্মৃতিসৌধ', 'ঢাকা ইপিজেড', 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়'],
    landmarksEn: ['National Martyrs Memorial', 'Dhaka EPZ', 'Jahangirnagar University'],
    icon: '🏗️',
  },
  {
    area: 'নারায়ণগঞ্জ', areaEn: 'Narayanganj', division: 'Dhaka',
    description: 'শীতলক্ষ্যার তীরে শিল্পনগরী। পুরনো বন্দর ও টেক্সটাইল শিল্প।',
    descriptionEn: 'Industrial city on the Shitalakshya river. Old port and textile industry.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-নারায়ণগঞ্জ সিটি সার্ভিস', 'গণপরিবহন লোকাল বাস'],
    busesEn: ['Dhaka-Narayanganj City Service', 'Local public buses'],
    tips: ['মেঘনা-শীতলক্ষ্যা নৌপথে ফেরি চলে', 'ঢাকা থেকে ৩০-৪৫ মিনিটের পথ', 'যানজট এড়াতে ট্রেনে যান'],
    tipsEn: ['Ferries run on the Meghna-Shitalakshya waterway', '30–45 minutes from Dhaka', 'Take the train to avoid traffic'],
    landmarks: ['সোনারগাঁও লোক ও কারুশিল্প জাদুঘর', 'পানাম নগর', 'হাজীগঞ্জ কেল্লা'],
    landmarksEn: ['Sonargaon Folk Arts Museum', 'Panam Nagar', 'Hajiganj Fort'],
    icon: '🏭',
  },
  {
    area: 'গাজীপুর', areaEn: 'Gazipur', division: 'Dhaka',
    description: 'ঢাকার উত্তরে শিল্পনগর। বিআরটি করিডোর সংযুক্ত।',
    descriptionEn: 'Industrial city north of Dhaka. Connected by the BRT corridor.',
    metroAccess: ['BRT (গাজীপুর-ঢাকা করিডোর)'],
    metroAccessEn: ['BRT (Gazipur-Dhaka Corridor)'],
    buses: ['প্রভাতী', 'বলাকা', 'গাজীপুর পরিবহন', 'বিআরটিসি'],
    busesEn: ['Provhati', 'Balaka', 'Gazipur Paribahan', 'BRTC'],
    tips: ['সকাল ৭-৯টায় BRT ব্যবহার করুন', 'ভাওয়াল জাতীয় উদ্যান পরিদর্শনে যানবাহন পাওয়া যায়', 'উবার/পাঠাও পাওয়া যায়'],
    tipsEn: ['Use BRT 7–9 AM', 'Vehicles available to visit Bhawal National Park', 'Uber/Pathao available'],
    landmarks: ['ভাওয়াল জাতীয় উদ্যান', 'গাজীপুর সিটি কর্পোরেশন', 'শ্রীপুর শিল্পাঞ্চল'],
    landmarksEn: ['Bhawal National Park', 'Gazipur City Corporation', 'Sreepur Industrial Area'],
    icon: '🌲',
  },
  // ─── Chittagong ─────────────────────────────────────────────────────────────
  {
    area: 'চট্টগ্রাম', areaEn: 'Chattogram', division: 'Chittagong',
    description: 'বন্দর নগরী চট্টগ্রাম। ব্যস্ত বাণিজ্যিক বন্দর ও ঐতিহাসিক এলাকা।',
    descriptionEn: 'The port city of Chittagong. Busy commercial port and historic areas.',
    metroAccess: ['কোনো মেট্রো নেই (পরিকল্পনাধীন)'],
    metroAccessEn: ['No metro (planned)'],
    buses: ['বিআরটিসি সিটি বাস', 'মিনিবাস', 'টেম্পো'],
    busesEn: ['BRTC City Bus', 'Minibus', 'Tempo'],
    tips: ['সিএনজি সহজলভ্য ও সাশ্রয়ী', 'বন্দর এলাকায় সকালে যানজট বেশি', 'আগ্রাবাদ থেকে সিটি সেন্টারে বাস পাওয়া যায়'],
    tipsEn: ['CNG is easily available and affordable', 'Heavy traffic near the port in the morning', 'Buses from Agrabad to City Centre'],
    landmarks: ['চট্টগ্রাম বন্দর', 'পতেঙ্গা সমুদ্র সৈকত', 'ফয়স লেক', 'জাতিতাত্ত্বিক জাদুঘর'],
    landmarksEn: ["Chittagong Port", "Patenga Sea Beach", "Foy's Lake", "Ethnological Museum"],
    icon: '⚓',
  },
  {
    area: 'কক্সবাজার', areaEn: "Cox's Bazar", division: 'Chittagong',
    description: 'বিশ্বের দীর্ঘতম সমুদ্র সৈকত। পর্যটন কেন্দ্র।',
    descriptionEn: "The world's longest sea beach. Tourism hub.",
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা থেকে ইন্টারসিটি বাস', 'চট্টগ্রাম-কক্সবাজার লোকাল বাস'],
    busesEn: ["Intercity bus from Dhaka", "Chittagong–Cox's Bazar local bus"],
    tips: ['ঢাকা থেকে সরাসরি রাতের বাস যায়', 'পিক সিজনে আগে বুকিং দিন', 'বিচে অটোরিকশা সহজলভ্য'],
    tipsEn: ['Direct overnight buses from Dhaka', 'Book in advance during peak season', 'Auto-rickshaw easily available at the beach'],
    landmarks: ['কক্সবাজার সমুদ্র সৈকত', 'ইনানী বিচ', 'হিমছড়ি', 'সেন্ট মার্টিন দ্বীপ'],
    landmarksEn: ["Cox's Bazar Sea Beach", "Inani Beach", "Himchhari", "Saint Martin Island"],
    icon: '🏖️',
  },
  {
    area: 'রাঙামাটি', areaEn: 'Rangamati', division: 'Chittagong',
    description: 'পার্বত্য চট্টগ্রামের প্রাকৃতিক সৌন্দর্যের শহর। কাপ্তাই লেকের পাড়ে।',
    descriptionEn: 'A city of natural beauty in the Chittagong Hill Tracts. On the banks of Kaptai Lake.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['চট্টগ্রাম-রাঙামাটি বাস', 'লোকাল সিএনজি ও নৌকা'],
    busesEn: ['Chittagong-Rangamati Bus', 'Local CNG and boat'],
    tips: ['চট্টগ্রাম থেকে ২-৩ ঘণ্টার পথ', 'নৌকায় কাপ্তাই লেক ভ্রমণ করুন', 'আদিবাসী তাঁতশিল্প কিনতে পারেন'],
    tipsEn: ['2–3 hours from Chittagong', 'Boat tour of Kaptai Lake', 'Buy indigenous weaving crafts'],
    landmarks: ['কাপ্তাই লেক', 'রাজবন বৌদ্ধ বিহার', 'ঝুলন্ত সেতু', 'উপজাতীয় জাদুঘর'],
    landmarksEn: ['Kaptai Lake', 'Rajban Buddhist Monastery', 'Hanging Bridge', 'Tribal Museum'],
    icon: '🏔️',
  },
  {
    area: 'বান্দরবান', areaEn: 'Bandarban', division: 'Chittagong',
    description: 'পাহাড়, ঝরনা ও আদিবাসী সংস্কৃতির দেশ।',
    descriptionEn: 'A land of hills, waterfalls, and indigenous culture.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['চট্টগ্রাম থেকে পূর্বাণী ও পূর্বানী বাস', 'লোকাল জীপ ও সিএনজি'],
    busesEn: ['Purbani bus from Chittagong', 'Local jeep and CNG'],
    tips: ['বর্ষায় যেতে সতর্ক থাকুন', 'চট্টগ্রাম থেকে ৩ ঘণ্টার পথ', 'নীলাচল, মেঘলা দর্শনীয় স্থান'],
    tipsEn: ['Be cautious during the monsoon', '3 hours from Chittagong', 'Nilachal and Meghla are must-see spots'],
    landmarks: ['নীলাচল', 'মেঘলা পর্যটন কমপ্লেক্স', 'নাফাখুম ঝরনা', 'বগা লেক'],
    landmarksEn: ['Nilachal', 'Meghla Tourism Complex', 'Nafakhum Waterfall', 'Boga Lake'],
    icon: '⛰️',
  },
  {
    area: 'কুমিল্লা', areaEn: 'Comilla', division: 'Chittagong',
    description: 'ঐতিহাসিক শহর। ঢাকা-চট্টগ্রাম হাইওয়ের মাঝে অবস্থিত।',
    descriptionEn: 'A historic city on the Dhaka-Chittagong highway.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-কুমিল্লা পরিবহন', 'চট্টগ্রামগামী বাস', 'লোকাল বাস ও সিএনজি'],
    busesEn: ['Dhaka-Comilla Transport', 'Chittagong-bound bus', 'Local bus and CNG'],
    tips: ['ঢাকা থেকে মাত্র ১.৫-২ ঘণ্টা', 'কুমিল্লার রসমালাই বিখ্যাত', 'ময়নামতি ঘুরে আসুন'],
    tipsEn: ['Only 1.5–2 hours from Dhaka', 'Comilla Rasmalai is famous', 'Visit Mainamati'],
    landmarks: ['শালবন বৌদ্ধ বিহার', 'ময়নামতি জাদুঘর', 'ওয়ার সেমেট্রি'],
    landmarksEn: ['Shalban Buddhist Monastery', 'Mainamati Museum', 'War Cemetery'],
    icon: '🏺',
  },
  // ─── Sylhet ─────────────────────────────────────────────────────────────────
  {
    area: 'সিলেট', areaEn: 'Sylhet', division: 'Sylhet',
    description: 'চা বাগান ও হজরত শাহজালাল (র.) মাজারের শহর।',
    descriptionEn: 'City of tea gardens and the shrine of Hazrat Shahjalal (R).',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-সিলেট ইন্টারসিটি বাস', 'লোকাল সিএনজি ও বাস'],
    busesEn: ['Dhaka-Sylhet intercity bus', 'Local CNG and bus'],
    tips: ['সিলেট কেন্দ্র থেকে সিএনজিতে মাজার যাওয়া যায়', 'চা বাগান দেখতে শ্রীমঙ্গল যান', 'ট্রেনে সিলেট যাওয়াটা সুন্দর'],
    tipsEn: ['CNG from Sylhet centre to the shrine', 'Visit Srimangal for tea gardens', 'Train journey to Sylhet is scenic'],
    landmarks: ['হযরত শাহজালাল (র.) মাজার', 'জাফলং', 'রাতারগুল', 'বিছানাকান্দি'],
    landmarksEn: ['Shrine of Hazrat Shahjalal (R)', 'Jaflong', 'Ratargul Swamp Forest', 'Bichanakandi'],
    icon: '🍃',
  },
  {
    area: 'শ্রীমঙ্গল', areaEn: 'Srimangal', division: 'Sylhet',
    description: 'চা বাগানের রাজধানী। সুন্দর প্রকৃতি ও পর্যটন।',
    descriptionEn: 'Capital of tea gardens. Beautiful nature and tourism.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা থেকে ট্রেন বা বাস', 'সিলেট থেকে লোকাল বাস'],
    busesEn: ['Train or bus from Dhaka', 'Local bus from Sylhet'],
    tips: ['ট্রেনে যাওয়া সবচেয়ে সুন্দর', 'সিজন: অক্টোবর-মার্চ ভালো', 'সিএনজিতে চা বাগান ঘোরা যায়'],
    tipsEn: ['Train journey is most scenic', 'Best season: October–March', 'Visit tea gardens by CNG'],
    landmarks: ['চা বাগান', 'নিসর্গ ইকো পার্ক', 'মাধবপুর লেক'],
    landmarksEn: ['Tea Gardens', 'Nishorgo Eco Park', 'Madhobpur Lake'],
    icon: '🌿',
  },
  {
    area: 'সুনামগঞ্জ', areaEn: 'Sunamganj', division: 'Sylhet',
    description: 'হাওর অঞ্চলের শহর। বর্ষায় অপূর্ব সুন্দর হাওর দর্শন।',
    descriptionEn: 'A haor (wetland) district. Spectacular haor views during the monsoon.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['সিলেট থেকে লোকাল বাস', 'ঢাকা থেকে সরাসরি বাস'],
    busesEn: ['Local bus from Sylhet', 'Direct bus from Dhaka'],
    tips: ['বর্ষায় নৌকায় হাওর ভ্রমণ করুন', 'টাঙ্গুয়ার হাওর পরিদর্শনে আগে বুকিং দিন', 'ভোরে রওনা দিলে বেশি সুবিধা'],
    tipsEn: ['Boat trip in the haor during monsoon', 'Book in advance for Tanguar Haor', 'Start early for best experience'],
    landmarks: ['টাঙ্গুয়ার হাওর', 'শিমুল বাগান', 'হাসন রাজা যাদুঘর'],
    landmarksEn: ['Tanguar Haor', 'Shimul Garden', 'Hashan Raja Museum'],
    icon: '🌊',
  },
  {
    area: 'মৌলভীবাজার', areaEn: 'Moulvibazar', division: 'Sylhet',
    description: 'চা বাগান ও বাউল সংস্কৃতির জেলা। লাউয়াছড়া জাতীয় উদ্যান।',
    descriptionEn: 'District of tea gardens and Baul culture. Lawachara National Park.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['সিলেট বা ঢাকা থেকে বাস', 'লোকাল সিএনজি'],
    busesEn: ['Bus from Sylhet or Dhaka', 'Local CNG'],
    tips: ['লাউয়াছড়া বনে গাইড নিন', 'শ্রীমঙ্গল থেকে কাছে', 'সকালে রওনা দিন'],
    tipsEn: ['Take a guide in Lawachara forest', 'Close to Srimangal', 'Start early'],
    landmarks: ['লাউয়াছড়া জাতীয় উদ্যান', 'বাইক্কার বিল', 'চা গবেষণা কেন্দ্র'],
    landmarksEn: ['Lawachara National Park', 'Baikka Beel', 'Tea Research Station'],
    icon: '🦋',
  },
  // ─── Rajshahi ───────────────────────────────────────────────────────────────
  {
    area: 'রাজশাহী', areaEn: 'Rajshahi', division: 'Rajshahi',
    description: 'শিক্ষা ও আম নগরী। শান্ত ও পরিকল্পিত শহর।',
    descriptionEn: 'City of education and mangoes. A calm, well-planned city.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-রাজশাহী ইন্টারসিটি বাস ও ট্রেন', 'শহরে সিএনজি ও রিকশা'],
    busesEn: ['Dhaka-Rajshahi intercity bus and train', 'CNG and rickshaw in city'],
    tips: ['ট্রেন বা বিমানে যাওয়া ভালো', 'পদ্মা নদীর পাড়ে বিকালে হাঁটা যায়', 'সাতক্ষীরা-বগুড়ার রুটও সহজ'],
    tipsEn: ['Train or flight is recommended', 'Evening walk by the Padma River', 'Satkhira-Bogra route also easy'],
    landmarks: ['বরেন্দ্র গবেষণা জাদুঘর', 'পদ্মা রিভার ফ্রন্ট', 'রাজশাহী বিশ্ববিদ্যালয়'],
    landmarksEn: ['Barendra Research Museum', 'Padma River Front', 'University of Rajshahi'],
    icon: '🍋',
  },
  {
    area: 'বগুড়া', areaEn: 'Bogra', division: 'Rajshahi',
    description: 'উত্তরবঙ্গের ব্যবসায়িক কেন্দ্র। মহাস্থানগড়ের ঐতিহাসিক শহর।',
    descriptionEn: 'Commercial hub of northern Bangladesh. Historic city near Mahasthangarh.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-বগুড়া ইন্টারসিটি বাস', 'লোকাল বাস ও অটো'],
    busesEn: ['Dhaka-Bogra intercity bus', 'Local bus and auto'],
    tips: ['ঢাকা থেকে রাতের বাসে যান', 'মহাস্থানগড় পরিদর্শনে ভোরে রওনা দিন', 'দই ও চমচম খেতে ভুলবেন না'],
    tipsEn: ["Take overnight bus from Dhaka", "Leave early to visit Mahasthangarh", "Don't miss Bogra doi (yoghurt) and chamcham"],
    landmarks: ['মহাস্থানগড়', 'গোবিন্দভিটা', 'বগুড়া জাদুঘর'],
    landmarksEn: ['Mahasthangarh', 'Govinda Bhita', 'Bogra Museum'],
    icon: '🏯',
  },
  {
    area: 'রংপুর', areaEn: 'Rangpur', division: 'Rangpur',
    description: 'উত্তরের শহর। শীতকালীন সবজির জন্য বিখ্যাত।',
    descriptionEn: 'Northern city. Famous for winter vegetables.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-রংপুর ইন্টারসিটি বাস ও ট্রেন', 'লোকাল অটো ও রিকশা'],
    busesEn: ['Dhaka-Rangpur intercity bus and train', 'Local auto and rickshaw'],
    tips: ['ঢাকা থেকে সরাসরি ট্রেনে যান', 'তাজহাট জমিদার বাড়ি দেখুন', 'হাজির হাটের খাবার বিখ্যাত'],
    tipsEn: ['Take direct train from Dhaka', 'Visit Tajhat Zamindar Palace', 'Hazir Hat food is famous'],
    landmarks: ['তাজহাট জমিদার বাড়ি', 'রংপুর চিড়িয়াখানা', 'ঘাঘট নদী'],
    landmarksEn: ['Tajhat Zamindar Palace', 'Rangpur Zoo', 'Ghaghat River'],
    icon: '🌾',
  },
  {
    area: 'নওগাঁ', areaEn: 'Naogaon', division: 'Rajshahi',
    description: 'আমের রাজধানী ও বৌদ্ধ ঐতিহ্যের শহর। সোমপুর মহাবিহার।',
    descriptionEn: 'Mango capital and city of Buddhist heritage. Somapura Mahavihara.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['রাজশাহী থেকে লোকাল বাস', 'ঢাকা থেকে সরাসরি বাস'],
    busesEn: ['Local bus from Rajshahi', 'Direct bus from Dhaka'],
    tips: ['আম মৌসুমে (মে-জুলাই) যান', 'পাহাড়পুর পরিদর্শনে সকালে যান', 'ট্রেনে যাওয়া যায়'],
    tipsEn: ['Visit during mango season (May–July)', 'Go to Paharpur in the morning', 'Train is available'],
    landmarks: ['সোমপুর মহাবিহার (পাহাড়পুর)', 'দিব্যক জয়স্তম্ভ', 'আলতাদীঘি জাতীয় উদ্যান'],
    landmarksEn: ['Somapura Mahavihara (Paharpur)', 'Dibya Jaya Pillar', 'Altadighi National Park'],
    icon: '🍊',
  },
  // ─── Khulna ─────────────────────────────────────────────────────────────────
  {
    area: 'খুলনা', areaEn: 'Khulna', division: 'Khulna',
    description: 'শিল্প নগরী ও সুন্দরবনের প্রবেশদ্বার।',
    descriptionEn: 'Industrial city and gateway to the Sundarbans.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-খুলনা ইন্টারসিটি বাস ও ট্রেন', 'সুন্দরবন লঞ্চ'],
    busesEn: ['Dhaka-Khulna intercity bus and train', 'Sundarbans launch'],
    tips: ['সুন্দরবন যেতে মংলা থেকে লঞ্চ নিন', 'ট্রেন সবচেয়ে আরামদায়ক', 'শীতকালে সুন্দরবন ভ্রমণ সেরা'],
    tipsEn: ['Take a launch from Mongla for Sundarbans', 'Train is most comfortable', 'Winter is best for Sundarbans'],
    landmarks: ['সুন্দরবন', 'খুলনা শিপইয়ার্ড', 'রূপসা নদী'],
    landmarksEn: ['Sundarbans', 'Khulna Shipyard', 'Rupsha River'],
    icon: '🌴',
  },
  {
    area: 'যশোর', areaEn: 'Jessore', division: 'Khulna',
    description: 'ফুলের শহর। বেনাপোল স্থলবন্দরের নিকটবর্তী।',
    descriptionEn: 'City of flowers. Close to Benapole land port.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-যশোর বাস ও ট্রেন', 'লোকাল অটো ও রিকশা'],
    busesEn: ['Dhaka-Jessore bus and train', 'Local auto and rickshaw'],
    tips: ['ঢাকা থেকে ট্রেনে যাওয়া ভালো', 'বেনাপোল সীমান্ত দিয়ে ভারত যাওয়া যায়', 'ফুলের হাট থেকে সতেজ ফুল কিনুন'],
    tipsEn: ['Train from Dhaka is recommended', 'Cross to India via Benapole border', 'Buy fresh flowers from the flower market'],
    landmarks: ['মাইকেল মধুসূদন দত্তের বাড়ি', 'বেনাপোল স্থলবন্দর', 'যশোর বিমানবন্দর'],
    landmarksEn: ["Michael Madhusudan Datta's House", 'Benapole Land Port', 'Jessore Airport'],
    icon: '🌸',
  },
  {
    area: 'সাতক্ষীরা', areaEn: 'Satkhira', division: 'Khulna',
    description: 'সুন্দরবনের পাশের জেলা। সুন্দর ম্যানগ্রোভ বন।',
    descriptionEn: 'District beside the Sundarbans. Beautiful mangrove forest.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-সাতক্ষীরা বাস', 'খুলনা থেকে লোকাল বাস'],
    busesEn: ['Dhaka-Satkhira bus', 'Local bus from Khulna'],
    tips: ['সুন্দরবনের শ্যামনগর পয়েন্ট থেকে নৌকায় যান', 'শীতে সুন্দরবন পরিদর্শন উপভোগ্য', 'রাস্তাঘাট ভালো'],
    tipsEn: ['Take boat from Shyamnagar point to the Sundarbans', 'Sundarbans visit is enjoyable in winter', 'Good roads'],
    landmarks: ['সুন্দরবন (শ্যামনগর)', 'যশোরেশ্বরী মন্দির', 'ঈশ্বরীপুর'],
    landmarksEn: ['Sundarbans (Shyamnagar)', 'Yashoreshari Temple', 'Ishwaripur'],
    icon: '🦁',
  },
  {
    area: 'কুষ্টিয়া', areaEn: 'Kushtia', division: 'Khulna',
    description: 'রবীন্দ্রনাথ ও লালনের স্মৃতিবিজড়িত শহর।',
    descriptionEn: 'City associated with Rabindranath Tagore and Lalon Shah.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা থেকে বাস ও ট্রেন', 'লোকাল সিএনজি ও রিকশা'],
    busesEn: ['Bus and train from Dhaka', 'Local CNG and rickshaw'],
    tips: ['শিলাইদহ কুঠিবাড়ি সকালে যান', 'লালন শাহের মাজারে সন্ধ্যা সুন্দর', 'কুষ্টিয়ার তিল খাজা বিখ্যাত'],
    tipsEn: ['Visit Shilaidah Kuthibari in the morning', "Lalon Shah's shrine is beautiful in the evening", 'Kushtia til khaja (sesame candy) is famous'],
    landmarks: ['শিলাইদহ রবীন্দ্র কুঠিবাড়ি', 'লালন শাহের মাজার', 'আড়পাড়া মিলনায়তন'],
    landmarksEn: ['Shilaidah Rabindra Kuthibari', 'Shrine of Lalon Shah', 'Aarpara Milonayatan'],
    icon: '🎶',
  },
  // ─── Barisal ────────────────────────────────────────────────────────────────
  {
    area: 'বরিশাল', areaEn: 'Barisal', division: 'Barisal',
    description: 'ভাটির দেশ। নদীপথে চলাচল বিখ্যাত।',
    descriptionEn: 'Land of rivers. Famous for water transport.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-বরিশাল লঞ্চ ও বাস', 'লোকাল সিএনজি ও রিকশা'],
    busesEn: ['Dhaka-Barisal launch and bus', 'Local CNG and rickshaw'],
    tips: ['রাতের লঞ্চে সদরঘাট থেকে বরিশাল যান', 'সকালের লঞ্চের দৃশ্য অসাধারণ', 'নৌকায় খালবিল দেখুন'],
    tipsEn: ['Take the overnight launch from Sadarghat to Barisal', 'Morning launch views are spectacular', 'Boat tour of canals'],
    landmarks: ['দুর্গাসাগর দিঘি', 'মুক্তিযোদ্ধা স্মৃতিসৌধ', 'অক্সফোর্ড মিশন চার্চ'],
    landmarksEn: ['Durgasagar Dighi', 'Liberation War Memorial', 'Oxford Mission Church'],
    icon: '🚢',
  },
  {
    area: 'পটুয়াখালী', areaEn: 'Patuakhali', division: 'Barisal',
    description: 'কুয়াকাটা সমুদ্র সৈকতের জেলা। সূর্যোদয় ও সূর্যাস্ত একসাথে দেখা যায়।',
    descriptionEn: 'District of Kuakata sea beach. Can see both sunrise and sunset.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা থেকে লঞ্চ ও বাস', 'বরিশাল থেকে লোকাল বাস'],
    busesEn: ['Launch and bus from Dhaka', 'Local bus from Barisal'],
    tips: ['কুয়াকাটায় সূর্যোদয়-সূর্যাস্ত দেখুন', 'রাতের লঞ্চে ঢাকা থেকে যান', 'সামুদ্রিক মাছ খেতে ভুলবেন না'],
    tipsEn: ['Watch sunrise and sunset at Kuakata', 'Take overnight launch from Dhaka', "Don't miss fresh seafood"],
    landmarks: ['কুয়াকাটা সমুদ্র সৈকত', 'মিষ্টিপানির হ্রদ', 'রাখাইন পল্লী'],
    landmarksEn: ['Kuakata Sea Beach', 'Freshwater Lake', 'Rakhain Village'],
    icon: '🌅',
  },
  {
    area: 'ভোলা', areaEn: 'Bhola', division: 'Barisal',
    description: 'বাংলাদেশের বৃহত্তম দ্বীপ জেলা। মেঘনা নদীবেষ্টিত।',
    descriptionEn: "Bangladesh's largest island district. Surrounded by the Meghna river.",
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা থেকে লঞ্চ বা বাস', 'বরিশাল থেকে ফেরি'],
    busesEn: ['Launch or bus from Dhaka', 'Ferry from Barisal'],
    tips: ['লঞ্চে যাওয়া সবচেয়ে সুবিধাজনক', 'দ্বীপের গ্রামগুলো সুন্দর', 'শীতে পাখির মেলা'],
    tipsEn: ['Launch is most convenient', 'Villages on the island are beautiful', 'Bird watching in winter'],
    landmarks: ['চর ফ্যাশন', 'মনপুরা দ্বীপ', 'ভোলা সদর'],
    landmarksEn: ['Char Fashion', 'Manpura Island', 'Bhola Sadar'],
    icon: '🏝️',
  },
  // ─── Mymensingh ─────────────────────────────────────────────────────────────
  {
    area: 'ময়মনসিংহ', areaEn: 'Mymensingh', division: 'Mymensingh',
    description: 'কৃষি বিশ্ববিদ্যালয় ও ব্রহ্মপুত্র নদের শহর।',
    descriptionEn: 'City of Agricultural University and the Brahmaputra River.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা-ময়মনসিংহ ট্রেন ও বাস', 'শহরে সিএনজি ও রিকশা'],
    busesEn: ['Dhaka-Mymensingh train and bus', 'CNG and rickshaw in city'],
    tips: ['ট্রেনে ময়মনসিংহ যাওয়া ভালো', 'ব্রহ্মপুত্র নদের পাড়ে ঘুরুন', 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয় ক্যাম্পাস সুন্দর'],
    tipsEn: ['Train to Mymensingh is recommended', 'Walk by the Brahmaputra River', 'Bangladesh Agricultural University campus is beautiful'],
    landmarks: ['বাংলাদেশ কৃষি বিশ্ববিদ্যালয়', 'শশী লজ', 'ব্রহ্মপুত্র নদ'],
    landmarksEn: ['Bangladesh Agricultural University', 'Shashi Lodge', 'Brahmaputra River'],
    icon: '🌾',
  },
  {
    area: 'নেত্রকোনা', areaEn: 'Netrokona', division: 'Mymensingh',
    description: 'হাওর ও মাছের জেলা। সোমেশ্বরীর স্বচ্ছ পানি।',
    descriptionEn: 'District of haors and fish. Crystal clear water of Someshwari.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ময়মনসিংহ থেকে লোকাল বাস', 'ঢাকা থেকে সরাসরি বাস'],
    busesEn: ['Local bus from Mymensingh', 'Direct bus from Dhaka'],
    tips: ['কলমাকান্দার পাহাড়ে যান', 'বিরিশিরি কালচারাল একাডেমি দেখুন', 'হাওরে নৌকায় ভ্রমণ করুন'],
    tipsEn: ['Visit the hills of Kalmakanda', 'See Birishiri Cultural Academy', 'Boat trip in the haor'],
    landmarks: ['বিরিশিরি', 'সোমেশ্বরী নদী', 'দুর্গাপুর হাওর'],
    landmarksEn: ['Birishiri', 'Someshwari River', 'Durgapur Haor'],
    icon: '🏞️',
  },
  {
    area: 'কিশোরগঞ্জ', areaEn: 'Kishoreganj', division: 'Mymensingh',
    description: 'হাওরের প্রবেশদ্বার ও ঐতিহ্যবাহী শহর।',
    descriptionEn: 'Gateway to the haor and a heritage city.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা থেকে ট্রেন ও বাস', 'লোকাল বাস ও নৌকা'],
    busesEn: ['Train and bus from Dhaka', 'Local bus and boat'],
    tips: ['ইটনা হাওরে নৌকায় যান', 'হোসেনী দালান দেখুন', 'কিশোরগঞ্জের মিষ্টি বিখ্যাত'],
    tipsEn: ['Boat trip to Itna Haor', 'Visit Hossaini Dalan', 'Kishoreganj sweets are famous'],
    landmarks: ['অষ্টগ্রাম হাওর', 'হোসেনী দালান', 'এগারোসিন্দুর'],
    landmarksEn: ['Astagram Haor', 'Hossaini Dalan', 'Egarosindhur'],
    icon: '🚣',
  },
  // ─── Rangpur ────────────────────────────────────────────────────────────────

  {
    area: 'দিনাজপুর', areaEn: 'Dinajpur', division: 'Rangpur',
    description: 'লিচু ও ধানের জেলা। ঐতিহাসিক কান্তজিউ মন্দির।',
    descriptionEn: 'District of litchi and paddy. Historic Kantaji Temple.',
    metroAccess: ['কোনো মেট্রো নেই'],
    metroAccessEn: ['No metro'],
    buses: ['ঢাকা থেকে বাস ও ট্রেন', 'লোকাল রিকশা ও অটো'],
    busesEn: ['Bus and train from Dhaka', 'Local rickshaw and auto'],
    tips: ['লিচু মৌসুমে (মে-জুন) যান', 'কান্তজিউ মন্দির সকালে দেখুন', 'রামসাগর দিঘিতে সূর্যোদয় সুন্দর'],
    tipsEn: ['Visit during litchi season (May–June)', 'See Kantaji Temple in the morning', 'Sunrise at Ramsagar Dighi is beautiful'],
    landmarks: ['কান্তজিউ মন্দির', 'রামসাগর জাতীয় উদ্যান', 'দিনাজপুর রাজবাড়ি'],
    landmarksEn: ['Kantaji Temple', 'Ramsagar National Park', 'Dinajpur Rajbari'],
    icon: '🍈',
  },
];

type DistrictSeed = {
  area: string;
  areaEn: string;
  division: string;
  icon?: string;
  landmarks: string[];
  landmarksEn: string[];
};

// Complete 64-district baseline (adds districts not explicitly covered above).
const ALL_64_DISTRICTS: DistrictSeed[] = [
  // Dhaka Division
  { area: 'ঢাকা', areaEn: 'Dhaka', division: 'Dhaka', icon: '🏙️', landmarks: ['লালবাগ কেল্লা', 'আহসান মঞ্জিল', 'জাতীয় সংসদ ভবন'], landmarksEn: ['Lalbagh Fort', 'Ahsan Manzil', 'National Parliament'] },
  { area: 'গাজীপুর', areaEn: 'Gazipur', division: 'Dhaka', icon: '🌲', landmarks: ['ভাওয়াল জাতীয় উদ্যান', 'শ্রীপুর'], landmarksEn: ['Bhawal National Park', 'Sreepur'] },
  { area: 'নারায়ণগঞ্জ', areaEn: 'Narayanganj', division: 'Dhaka', icon: '🏭', landmarks: ['পানাম নগর', 'সোনারগাঁ'], landmarksEn: ['Panam Nagar', 'Sonargaon'] },
  { area: 'নরসিংদী', areaEn: 'Narsingdi', division: 'Dhaka', icon: '🧵', landmarks: ['মনোহরদী', 'শিবপুর', 'উয়ারী-বটেশ্বর'], landmarksEn: ['Monohardi', 'Shibpur', 'Wari-Bateshwar'] },
  { area: 'মুন্সীগঞ্জ', areaEn: 'Munshiganj', division: 'Dhaka', icon: '🏞️', landmarks: ['ইদ্রাকপুর দুর্গ', 'বিক্রমপুর', 'পদ্মা সেতু ভিউ'], landmarksEn: ['Idrakpur Fort', 'Bikrampur', 'Padma Bridge View'] },
  { area: 'মানিকগঞ্জ', areaEn: 'Manikganj', division: 'Dhaka', icon: '🌊', landmarks: ['আরিচা ঘাট', 'বালিয়াটি জমিদার বাড়ি', 'তেউতা জমিদার বাড়ি'], landmarksEn: ['Aricha Ghat', 'Baliati Zamindar Bari', 'Teota Zamindar Bari'] },
  { area: 'টাঙ্গাইল', areaEn: 'Tangail', division: 'Dhaka', icon: '🧣', landmarks: ['মধুপুর গড়', 'আতিয়া মসজিদ', 'মহেড়া জমিদার বাড়ি'], landmarksEn: ['Madhupur Forest', 'Atia Mosque', 'Mohera Jomidar Bari'] },
  { area: 'কিশোরগঞ্জ', areaEn: 'Kishoreganj', division: 'Dhaka', icon: '🚣', landmarks: ['ইটনা হাওর', 'এগারসিন্দুর', 'নিকলী হাওর'], landmarksEn: ['Itna Haor', 'Egarosindur', 'Nikli Haor'] },
  { area: 'ফরিদপুর', areaEn: 'Faridpur', division: 'Dhaka', icon: '🌾', landmarks: ['গোয়ালন্দ ঘাট', 'পল্লী কবি জসীমউদ্‌দীনের বাড়ি'], landmarksEn: ['Goalanda Ghat', 'Palli Kabi Jasimuddin House'] },
  { area: 'গোপালগঞ্জ', areaEn: 'Gopalganj', division: 'Dhaka', icon: '🛶', landmarks: ['টুঙ্গিপাড়া', 'বঙ্গবন্ধুর সমাধি', 'ওড়াকান্দি'], landmarksEn: ['Tungipara', 'Bangabandhu Mausoleum', 'Orakandi'] },
  { area: 'মাদারীপুর', areaEn: 'Madaripur', division: 'Dhaka', icon: '🌿', landmarks: ['আড়িয়াল খাঁ নদী', 'শিবচর', 'শকুনি লেক'], landmarksEn: ['Arial Kha River', 'Shibchar', 'Shakuni Lake'] },
  { area: 'রাজবাড়ী', areaEn: 'Rajbari', division: 'Dhaka', icon: '🏛️', landmarks: ['রাজবাড়ী জমিদার বাড়ি', 'দৌলতদিয়া ঘাট'], landmarksEn: ['Rajbari Zamindar Bari', 'Daulatdia Ghat'] },
  { area: 'শরীয়তপুর', areaEn: 'Shariatpur', division: 'Dhaka', icon: '⛴️', landmarks: ['পদ্মা নদী', 'নড়িয়া', 'ফতেজংপুর কেল্লা'], landmarksEn: ['Padma River', 'Naria', 'Fatehjangpur Fort'] },

  // Chittagong Division
  { area: 'চট্টগ্রাম', areaEn: 'Chattogram', division: 'Chittagong', icon: '⚓', landmarks: ['পতেঙ্গা', 'চট্টগ্রাম বন্দর', 'ফয়স লেক'], landmarksEn: ['Patenga', 'Chattogram Port', "Foy's Lake"] },
  { area: 'কুমিল্লা', areaEn: 'Comilla', division: 'Chittagong', icon: '🏺', landmarks: ['ময়নামতি', 'শালবন বিহার', 'ধর্মসাগর'], landmarksEn: ['Mainamati', 'Shalban Vihara', 'Dharmasagar'] },
  { area: 'ব্রাহ্মণবাড়িয়া', areaEn: 'Brahmanbaria', division: 'Chittagong', icon: '🎵', landmarks: ['আখাউড়া স্থলবন্দর', 'তিতাস নদী'], landmarksEn: ['Akhaura Land Port', 'Titas River'] },
  { area: 'চাঁদপুর', areaEn: 'Chandpur', division: 'Chittagong', icon: '🐟', landmarks: ['তিন নদীর মোহনা', 'হিলশা ঘাট'], landmarksEn: ['Meghna Estuary', 'Hilsa Landing Point'] },
  { area: 'নোয়াখালী', areaEn: 'Noakhali', division: 'Chittagong', icon: '🌊', landmarks: ['নিঝুম দ্বীপ', 'বজলরা জামে মসজিদ'], landmarksEn: ['Nijhum Dwip', 'Bajra Shahi Mosque'] },
  { area: 'ফেনী', areaEn: 'Feni', division: 'Chittagong', icon: '🚉', landmarks: ['মহিপাল', 'ফেনী নদী', 'মুহুরী প্রজেক্ট'], landmarksEn: ['Mohipal', 'Feni River', 'Muhuri Project'] },
  { area: 'লক্ষ্মীপুর', areaEn: 'Lakshmipur', division: 'Chittagong', icon: '🌴', landmarks: ['রামগতি', 'মেঘনা তীর', 'দালাল বাজার জমিদার বাড়ি'], landmarksEn: ['Ramgati', 'Meghna Riverside', 'Dalal Bazar Zamindar Bari'] },
  { area: 'কক্সবাজার', areaEn: "Cox's Bazar", division: 'Chittagong', icon: '🏖️', landmarks: ['কক্সবাজার সমুদ্র সৈকত', 'ইনানী', 'হিমছড়ি', 'সেন্ট মার্টিন'], landmarksEn: ["Cox's Bazar Beach", 'Inani', 'Himchhari', 'Saint Martin'] },
  { area: 'খাগড়াছড়ি', areaEn: 'Khagrachhari', division: 'Chittagong', icon: '⛰️', landmarks: ['আলুটিলা গুহা', 'রিসাং ঝরনা', 'সাজেক ভ্যালি'], landmarksEn: ['Alutila Cave', 'Risang Waterfall', 'Sajek Valley'] },
  { area: 'রাঙামাটি', areaEn: 'Rangamati', division: 'Chittagong', icon: '🏔️', landmarks: ['কাপ্তাই লেক', 'ঝুলন্ত সেতু', 'সুবলং ঝরনা'], landmarksEn: ['Kaptai Lake', 'Hanging Bridge', 'Shuvalong Waterfall'] },
  { area: 'বান্দরবান', areaEn: 'Bandarban', division: 'Chittagong', icon: '🗻', landmarks: ['নীলাচল', 'বগা লেক', 'নাফাখুম'], landmarksEn: ['Nilachal', 'Boga Lake', 'Nafakhum'] },

  // Rajshahi Division
  { area: 'রাজশাহী', areaEn: 'Rajshahi', division: 'Rajshahi', icon: '🍋', landmarks: ['পদ্মা পাড়', 'বরেন্দ্র জাদুঘর', 'পুঠিয়া রাজবাড়ী'], landmarksEn: ['Padma Riverside', 'Barendra Museum', 'Puthia Rajbari'] },
  { area: 'নাটোর', areaEn: 'Natore', division: 'Rajshahi', icon: '🏰', landmarks: ['উত্তরা গণভবন', 'নাটোর রাজবাড়ী', 'চলন বিল'], landmarksEn: ['Uttara Ganabhaban', 'Natore Rajbari', 'Chalan Beel'] },
  { area: 'নওগাঁ', areaEn: 'Naogaon', division: 'Rajshahi', icon: '🛕', landmarks: ['পাহাড়পুর', 'আলতাদীঘি', 'কুসুম্বা মসজিদ'], landmarksEn: ['Paharpur', 'Altadighi', 'Kusumba Mosque'] },
  { area: 'চাঁপাইনবাবগঞ্জ', areaEn: 'Chapai Nawabganj', division: 'Rajshahi', icon: '🥭', landmarks: ['ছোট সোনা মসজিদ', 'আমবাগান', 'সোনা মসজিদ স্থলবন্দর'], landmarksEn: ['Choto Sona Mosque', 'Mango Orchards', 'Sona Mosque Land Port'] },
  { area: 'পাবনা', areaEn: 'Pabna', division: 'Rajshahi', icon: '🏞️', landmarks: ['হার্ডিঞ্জ ব্রিজ', 'লালন শাহ সেতু', 'ঈশ্বরদী'], landmarksEn: ['Hardinge Bridge', 'Lalon Shah Bridge', 'Ishwardi'] },
  { area: 'সিরাজগঞ্জ', areaEn: 'Sirajganj', division: 'Rajshahi', icon: '🌉', landmarks: ['যমুনা সেতু', 'এনায়েতপুর', 'রবীন্দ্র কাচারী বাড়ি'], landmarksEn: ['Jamuna Bridge', 'Enayetpur', 'Rabindra Kachari Bari'] },
  { area: 'বগুড়া', areaEn: 'Bogra', division: 'Rajshahi', icon: '🏯', landmarks: ['মহাস্থানগড়', 'বগুড়া জাদুঘর', 'গোকুল মেধ'], landmarksEn: ['Mahasthangarh', 'Bogura Museum', 'Gokul Medh'] },
  { area: 'জয়পুরহাট', areaEn: 'Joypurhat', division: 'Rajshahi', icon: '🌾', landmarks: ['হিন্ডা কসবা শাহী মসজিদ', 'বারো শিবালয় মন্দির'], landmarksEn: ['Hinda Kasba Shahi Mosque', 'Baro Shibaloy Temple'] },

  // Khulna Division
  { area: 'খুলনা', areaEn: 'Khulna', division: 'Khulna', icon: '🌴', landmarks: ['রূপসা নদী', 'সুন্দরবন প্রবেশপথ', 'খুলনা শিপইয়ার্ড'], landmarksEn: ['Rupsha River', 'Sundarbans Gateway', 'Khulna Shipyard'] },
  { area: 'বাগেরহাট', areaEn: 'Bagerhat', division: 'Khulna', icon: '🕌', landmarks: ['ষাট গম্বুজ মসজিদ', 'সুন্দরবন (মংলা)'], landmarksEn: ['Sixty Dome Mosque', 'Sundarbans (Mongla)'] },
  { area: 'সাতক্ষীরা', areaEn: 'Satkhira', division: 'Khulna', icon: '🦁', landmarks: ['শ্যামনগর', 'সুন্দরবন', 'যশোরেশ্বরী কালী মন্দির'], landmarksEn: ['Shyamnagar', 'Sundarbans', 'Jeshoreswari Kali Temple'] },
  { area: 'যশোর', areaEn: 'Jessore', division: 'Khulna', icon: '🌸', landmarks: ['বেনাপোল স্থলবন্দর', 'যশোর বিমানবন্দর', 'গদখালি ফুলের বাজার'], landmarksEn: ['Benapole Land Port', 'Jashore Airport', 'Godkhali Flower Market'] },
  { area: 'নড়াইল', areaEn: 'Narail', division: 'Khulna', icon: '🏞️', landmarks: ['চিত্রা নদী', 'এস এম সুলতান কমপ্লেক্স'], landmarksEn: ['Chitra River', 'SM Sultan Complex'] },
  { area: 'মাগুরা', areaEn: 'Magura', division: 'Khulna', icon: '🌿', landmarks: ['মাগুরা সদর', 'শালিখা'], landmarksEn: ['Magura Sadar', 'Salikha'] },
  { area: 'ঝিনাইদহ', areaEn: 'Jhenaidah', division: 'Khulna', icon: '🧵', landmarks: ['শৈলকুপা শাহী মসজিদ', 'নলডাঙ্গা রাজবাড়ী'], landmarksEn: ['Shailkupa Shahi Mosque', 'Naldanga Rajbari'] },
  { area: 'কুষ্টিয়া', areaEn: 'Kushtia', division: 'Khulna', icon: '🎶', landmarks: ['লালন শাহ মাজার', 'শিলাইদহ কুঠিবাড়ি', 'হার্ডিঞ্জ ব্রিজ'], landmarksEn: ['Lalon Shah Shrine', 'Shilaidah Kuthibari', 'Hardinge Bridge'] },
  { area: 'চুয়াডাঙ্গা', areaEn: 'Chuadanga', division: 'Khulna', icon: '🍃', landmarks: ['দর্শনা স্থলবন্দর', 'কেরু অ্যান্ড কোং'], landmarksEn: ['Darshana Land Port', 'Carew & Co'] },
  { area: 'মেহেরপুর', areaEn: 'Meherpur', division: 'Khulna', icon: '🏛️', landmarks: ['মুজিবনগর স্মৃতিসৌধ', 'আমঝুপি নীলকুঠি'], landmarksEn: ['Mujibnagar Memorial', 'Amjhupi Nilkuthi'] },

  // Barisal Division
  { area: 'বরিশাল', areaEn: 'Barisal', division: 'Barisal', icon: '🚢', landmarks: ['দুর্গাসাগর', 'কীর্তনখোলা', 'গুঠিয়া মসজিদ'], landmarksEn: ['Durgasagar', 'Kirtankhola', 'Guthia Mosque'] },
  { area: 'ভোলা', areaEn: 'Bhola', division: 'Barisal', icon: '🏝️', landmarks: ['মনপুরা দ্বীপ', 'চর ফ্যাশন', 'জ্যাকব টাওয়ার'], landmarksEn: ['Monpura Island', 'Char Fasson', 'Jacob Tower'] },
  { area: 'ঝালকাঠি', areaEn: 'Jhalokathi', division: 'Barisal', icon: '⛵', landmarks: ['সুগন্ধা নদী', 'পেয়ারা বাগান (ভীমরুলী)'], landmarksEn: ['Sugandha River', 'Guava Orchard (Bhimruli)'] },
  { area: 'পিরোজপুর', areaEn: 'Pirojpur', division: 'Barisal', icon: '🌳', landmarks: ['স্বরূপকাঠি ভাসমান বাজার', 'বলেশ্বর নদী'], landmarksEn: ['Swarupkathi Floating Market', 'Baleshwar River'] },
  { area: 'পটুয়াখালী', areaEn: 'Patuakhali', division: 'Barisal', icon: '🌅', landmarks: ['কুয়াকাটা সমুদ্র সৈকত', 'রাখাইন পল্লী', 'ফাতরার চর'], landmarksEn: ['Kuakata Sea Beach', 'Rakhain Village', 'Fatrar Char'] },
  { area: 'বরগুনা', areaEn: 'Barguna', division: 'Barisal', icon: '🏖️', landmarks: ['পাথরঘাটা', 'শুভসন্ধ্যা সমুদ্র সৈকত', 'হরিণঘাটা বন'], landmarksEn: ['Patharghata', 'Shubhashandhya Beach', 'Haringhata Forest'] },

  // Sylhet Division
  { area: 'সিলেট', areaEn: 'Sylhet', division: 'Sylhet', icon: '🍃', landmarks: ['শাহজালাল মাজার', 'জাফলং', 'রাতারগুল'], landmarksEn: ['Shahjalal Shrine', 'Jaflong', 'Ratargul'] },
  { area: 'মৌলভীবাজার', areaEn: 'Moulvibazar', division: 'Sylhet', icon: '🌿', landmarks: ['লাউয়াছড়া', 'মাধবকুণ্ড জলপ্রপাত', 'শ্রীমঙ্গল চা-বাগান'], landmarksEn: ['Lawachara', 'Madhabkunda Waterfall', 'Srimangal Tea Gardens'] },
  { area: 'হবিগঞ্জ', areaEn: 'Habiganj', division: 'Sylhet', icon: '🦋', landmarks: ['সাতছড়ি জাতীয় উদ্যান', 'রেমা-কালেঙ্গা বন্যপ্রাণী অভয়ারণ্য'], landmarksEn: ['Satchari National Park', 'Rema-Kalenga Wildlife Sanctuary'] },
  { area: 'সুনামগঞ্জ', areaEn: 'Sunamganj', division: 'Sylhet', icon: '🌊', landmarks: ['টাঙ্গুয়ার হাওর', 'বিছনাকান্দি', 'যাদুকাটা নদী', 'শিমুল বাগান'], landmarksEn: ['Tanguar Haor', 'Bichanakandi', 'Jadukata River', 'Shimul Garden'] },

  // Rangpur Division
  { area: 'রংপুর', areaEn: 'Rangpur', division: 'Rangpur', icon: '❄️', landmarks: ['তাজহাট জমিদার বাড়ি', 'ভিন্নজগত', 'পায়রাবন্দ'], landmarksEn: ['Tajhat Palace', 'Vinnojogot', 'Pairabondh'] },
  { area: 'দিনাজপুর', areaEn: 'Dinajpur', division: 'Rangpur', icon: '🛕', landmarks: ['কান্তজিউ মন্দির', 'রামসাগর', 'নয়াবাদ মসজিদ'], landmarksEn: ['Kantaji Temple', 'Ramsagar', 'Nayabad Mosque'] },
  { area: 'ঠাকুরগাঁও', areaEn: 'Thakurgaon', division: 'Rangpur', icon: '🌾', landmarks: ['বালিয়াডাঙ্গী সূর্যপুরী আমগাছ', 'টাঙ্গন নদী'], landmarksEn: ['Baliadangi Suryapuri Mango Tree', 'Tangon River'] },
  { area: 'পঞ্চগড়', areaEn: 'Panchagarh', division: 'Rangpur', icon: '🏔️', landmarks: ['তেঁতুলিয়া', 'কাঞ্চনজঙ্ঘা ভিউ পয়েন্ট', 'মহারাজার দিঘি'], landmarksEn: ['Tetulia', 'Kanchenjunga Viewpoint', 'Moharajar Dighi'] },
  { area: 'নীলফামারী', areaEn: 'Nilphamari', division: 'Rangpur', icon: '✈️', landmarks: ['সৈয়দপুর রেলওয়ে কারখানা', 'নীলসাগর', 'তিস্তা ব্যারাজ'], landmarksEn: ['Saidpur Railway Workshop', 'Nilsagar', 'Teesta Barrage'] },
  { area: 'লালমনিরহাট', areaEn: 'Lalmonirhat', division: 'Rangpur', icon: '🚂', landmarks: ['তিস্তা ব্যারেজ', 'তিন বিঘা করিডোর', 'বুড়িমারী স্থলবন্দর'], landmarksEn: ['Teesta Barrage', 'Tin Bigha Corridor', 'Burimari Land Port'] },
  { area: 'কুড়িগ্রাম', areaEn: 'Kurigram', division: 'Rangpur', icon: '🌊', landmarks: ['ধরলা ব্রিজ', 'চিলমারী বন্দর', 'দাসীয়ারছড়া'], landmarksEn: ['Dharla Bridge', 'Chilmari Port', 'Dasiarchhara'] },
  { area: 'গাইবান্ধা', areaEn: 'Gaibandha', division: 'Rangpur', icon: '🚣', landmarks: ['বালাসী ঘাট', 'ফ্রেন্ডশিপ সেন্টার'], landmarksEn: ['Balasi Ghat', 'Friendship Centre'] },

  // Mymensingh Division
  { area: 'ময়মনসিংহ', areaEn: 'Mymensingh', division: 'Mymensingh', icon: '🌾', landmarks: ['ব্রহ্মপুত্র পাড়', 'কৃষি বিশ্ববিদ্যালয়', 'মুক্তাগাছা জমিদার বাড়ি'], landmarksEn: ['Brahmaputra Riverside', 'Agricultural University', 'Muktagacha Zamindar Bari'] },
  { area: 'জামালপুর', areaEn: 'Jamalpur', division: 'Mymensingh', icon: '🧺', landmarks: ['গান্ধী আশ্রম', 'যমুনা সার কারখানা', 'লুইস ভিলেজ'], landmarksEn: ['Gandhi Ashram', 'Jamuna Fertilizer Factory', 'Luis Village'] },
  { area: 'শেরপুর', areaEn: 'Sherpur', division: 'Mymensingh', icon: '🌲', landmarks: ['গারো পাহাড়', 'গজনী অবকাশ কেন্দ্র', 'মধুটিলা ইকো পার্ক'], landmarksEn: ['Garo Hills', 'Ghazni Vacation Center', 'Madhutila Eco Park'] },
  { area: 'নেত্রকোনা', areaEn: 'Netrokona', division: 'Mymensingh', icon: '🏞️', landmarks: ['বিরিশিরি (চিনামাটির পাহাড়)', 'সোমেশ্বরী নদী', 'হাওর অঞ্চল'], landmarksEn: ['Birishiri (Ceramic Hill)', 'Someshwari River', 'Haor Region'] },
];

const makeDistrictGuide = (d: DistrictSeed): GuideEntry => ({
  area: d.area,
  areaEn: d.areaEn,
  division: d.division,
  description: `${d.area} জেলা ${d.division} বিভাগের গুরুত্বপূর্ণ অঞ্চল। জেলা শহর, বাস রুট ও দর্শনীয় স্থান সম্পর্কে এই গাইডে তথ্য পাবেন।`,
  descriptionEn: `${d.areaEn} district is an important area in ${d.division} division. This guide covers district travel basics, routes, and key attractions.`,
  metroAccess: ['কোনো মেট্রো নেই (স্থানীয় বাস/ট্রেন/নদীপথ ব্যবহার করুন)'],
  metroAccessEn: ['No metro access (use local bus/train/waterway)'],
  buses: ['জেলা আন্তঃজেলা বাস', 'লোকাল বাস/সিএনজি', 'প্রধান বাস টার্মিনাল সংযোগ'],
  busesEn: ['District intercity buses', 'Local bus/CNG', 'Main terminal connections'],
  tips: ['ভোর বা সকাল বেলা রওনা দিলে যানজট কম', 'জেলা শহরের টার্মিনাল থেকে লোকাল পরিবহন সহজে পাওয়া যায়', 'ভ্রমণের আগে আবহাওয়া ও রাস্তার অবস্থা দেখে নিন'],
  tipsEn: ['Start early morning for lower congestion', 'Local transport is easiest from district terminals', 'Check weather and road conditions before travel'],
  landmarks: d.landmarks,
  landmarksEn: d.landmarksEn,
  icon: d.icon || '📍',
});

const DISTRICT_GUIDES: GuideEntry[] = ALL_64_DISTRICTS.map(makeDistrictGuide);
const DISTRICT_KEYS = new Set(DISTRICT_GUIDES.map(d => d.areaEn.toLowerCase()));
const MERGED_GUIDES: GuideEntry[] = [
  ...GUIDES,
  ...DISTRICT_GUIDES.filter(d => !GUIDES.some(g => g.areaEn.toLowerCase() === d.areaEn.toLowerCase())),
];

export default function NeighbourhoodGuides({ onBack }: Props) {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof GUIDES[0] | null>(null);
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());

  useEffect(() => { trackFeatureUsage('area_guides'); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return MERGED_GUIDES;
    return MERGED_GUIDES.filter(g =>
      g.area.includes(q) || g.areaEn.toLowerCase().includes(q) ||
      g.division.toLowerCase().includes(q) ||
      g.description.includes(q) || g.descriptionEn.toLowerCase().includes(q)
    );
  }, [search]);

  const divisions = [...new Set(MERGED_GUIDES.map(g => g.division))];

  const toggleDivision = (div: string) => {
    setExpandedDivisions(prev => {
      const next = new Set(prev);
      if (next.has(div)) next.delete(div); else next.add(div);
      return next;
    });
  };

  if (selected) {
    const desc = language === 'bn' ? selected.description : selected.descriptionEn;
    const metro = language === 'bn' ? selected.metroAccess : selected.metroAccessEn;
    const buses = language === 'bn' ? selected.buses : selected.busesEn;
    const tips = language === 'bn' ? selected.tips : selected.tipsEn;
    const landmarks = language === 'bn' ? selected.landmarks : selected.landmarksEn;

    return (
      <div className="flex flex-col flex-1 min-h-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 px-3 py-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-600 dark:text-gray-400 font-medium text-sm">
            <ChevronLeft className="w-5 h-5" />
            {lbl('Back', 'ফিরে যান')}
          </button>
          <span className="text-2xl">{selected.icon}</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{language === 'bn' ? selected.area : selected.areaEn}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'bn' ? selected.areaEn : selected.area} · {selected.division}</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-4 space-y-4 pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">{desc}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2"><span>🚇</span> {lbl('Metro / MRT Access', 'মেট্রো স্টেশন')}</h3>
            {metro.map(m => <p key={m} className="text-sm text-blue-800 dark:text-blue-200 py-0.5">• {m}</p>)}
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-800">
            <h3 className="font-bold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2"><Bus className="w-4 h-4" /> {lbl('Bus Routes', 'বাস রুট')}</h3>
            <div className="flex flex-wrap gap-2">
              {buses.map(b => (
                <span key={b} className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-xs px-2.5 py-1 rounded-full font-medium">{b}</span>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-2">💡 {lbl('Travel Tips', 'ট্রাভেল টিপস')}</h3>
            {tips.map((tip, i) => <p key={i} className="text-sm text-amber-800 dark:text-amber-200 py-0.5">• {tip}</p>)}
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-800">
            <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> {lbl('Landmarks', 'দর্শনীয় স্থান')}</h3>
            {landmarks.map(l => <p key={l} className="text-sm text-purple-800 dark:text-purple-200 py-0.5">• {l}</p>)}
          </div>

          <div className="h-4" />

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{lbl('Area Guides', 'এলাকাভিত্তিক গাইড')}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{lbl('Bangladesh Transport Guides', 'বাংলাদেশ পরিবহন গাইড')} · {MERGED_GUIDES.length}</p>
        </div>
      </div>


      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y px-4 pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        <AdSenseAd adSlot="auto" className="mt-2 mb-4 w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" />
        {search ? (
          <div className="grid grid-cols-2 gap-3 content-start">
            {filtered.map(g => (
              <button key={g.area} onClick={() => setSelected(g)}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-left shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors active:scale-95">
                <span className="text-3xl block mb-2">{g.icon}</span>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{language === 'bn' ? g.area : g.areaEn}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'bn' ? g.areaEn : g.area}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{g.division}</p>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400">
                <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>{lbl('No area found', 'কোনো এলাকা পাওয়া যায়নি')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {divisions.map(div => {
              const divGuides = MERGED_GUIDES.filter(g => g.division === div);
              const isExpanded = expandedDivisions.has(div);
              const visible = isExpanded ? divGuides : divGuides.slice(0, 4);
              return (
                <div key={div}>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{div}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {visible.map(g => (
                      <button key={g.area} onClick={() => setSelected(g)}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-left shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors active:scale-95">
                        <span className="text-3xl block mb-2">{g.icon}</span>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{language === 'bn' ? g.area : g.areaEn}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'bn' ? g.areaEn : g.area}</p>
                      </button>
                    ))}
                  </div>
                  {divGuides.length > 4 && (
                    <button
                      onClick={() => toggleDivision(div)}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
                    >
                      {isExpanded ? (
                        <><ChevronUp className="w-4 h-4" /> {lbl('Show less', 'কম দেখুন')}</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" /> {lbl(`See ${divGuides.length - 4} more`, `আরও ${divGuides.length - 4}টি দেখুন`)}</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
            <div className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
