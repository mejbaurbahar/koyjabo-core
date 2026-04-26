import React, { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, Bus, Search, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props { onBack: () => void; }

const GUIDES = [
  // ─── Dhaka ──────────────────────────────────────────────────────────────────
  {
    area: 'মিরপুর', areaEn: 'Mirpur', division: 'Dhaka',
    description: 'ঢাকার উত্তর-পশ্চিমের ঘনবসতিপূর্ণ এলাকা। MRT-6 মেট্রো সুবিধা ও অনেক লোকাল বাস আছে।',
    metroAccess: ['মিরপুর-১০ (MRT-6)', 'মিরপুর-১১ (MRT-6)', 'কাজীপাড়া (MRT-6)', 'শেওড়াপাড়া (MRT-6)', 'পল্লবী (MRT-6)'],
    buses: ['০১', '১৩', '৩৫', '৫৫', '৬০', 'ভার্সিটি এক্সপ্রেস'],
    tips: ['মিরপুর-১০ বা মিরপুর-১১ থেকে MRT-6 মেট্রো নিন মতিঝিল বা উত্তরা যেতে', 'সকাল ৮-১০টা ভীষণ ভিড় থাকে', 'শাহবাগ বা ফার্মগেট যেতে বাস সুবিধাজনক'],
    landmarks: ['মিরপুর চিড়িয়াখানা', 'শহীদ বুদ্ধিজীবী স্মৃতিসৌধ', 'বাংলাদেশ ক্রিকেট স্টেডিয়াম'],
    icon: '🏘️',
  },
  {
    area: 'ধানমন্ডি', areaEn: 'Dhanmondi', division: 'Dhaka',
    description: 'আবাসিক ও বাণিজ্যিক মিশ্রিত এলাকা। শিক্ষা প্রতিষ্ঠান ও শপিং মলে ভরপুর।',
    metroAccess: ['বিজয় সরণি (MRT-6, কাছাকাছি)'],
    buses: ['সিটি বাস রুট ৮', '২৮', 'গুলিস্তান-ধানমন্ডি'],
    tips: ['ধানমন্ডি-২৭ থেকে বাস বেশি পাওয়া যায়', 'শুক্রবার রাস্তা অপেক্ষাকৃত ফাঁকা থাকে', 'রিকশা কম দূরত্বের জন্য ভালো'],
    landmarks: ['রবীন্দ্র সরোবর', '৩২ নম্বর বঙ্গবন্ধু জাদুঘর', 'ধানমন্ডি লেক'],
    icon: '🌳',
  },
  {
    area: 'মতিঝিল', areaEn: 'Motijheel', division: 'Dhaka',
    description: 'ঢাকার প্রধান বাণিজ্যিক কেন্দ্র। ব্যাংক, সরকারি অফিস এখানে অবস্থিত।',
    metroAccess: ['মতিঝিল (MRT-6)', 'বাংলাদেশ সচিবালয় (MRT-6)'],
    buses: ['প্রায় সব রুটের টার্মিনাল এখানে'],
    tips: ['মেট্রো সবচেয়ে দ্রুত বিকল্প', 'অফিস সময়ে (৮-১০টা, ৫-৭টা) ভীষণ যানজট', 'শাপলা চত্বরে যানজট এড়াতে বিকল্প রাস্তা ব্যবহার করুন'],
    landmarks: ['শাপলা চত্বর', 'বাংলাদেশ ব্যাংক ভবন', 'জনতা ব্যাংক ভবন'],
    icon: '🏦',
  },
  {
    area: 'উত্তরা', areaEn: 'Uttara', division: 'Dhaka',
    description: 'ঢাকার উত্তরে আধুনিক আবাসিক এলাকা। এয়ারপোর্টের কাছে এবং MRT-6 শেষ প্রান্ত।',
    metroAccess: ['উত্তরা উত্তর (MRT-6)', 'উত্তরা সেন্টার (MRT-6)', 'উত্তরা দক্ষিণ (MRT-6)'],
    buses: ['বিআরটিসি এয়ারপোর্ট বাস', 'গাজীপুর রুট'],
    tips: ['এয়ারপোর্ট যেতে মেট্রো + হাঁটা সুবিধাজনক', 'সেক্টর ৩, ৭, ১১ থেকে মেট্রো সহজ', 'গাজীপুর যেতে বিআরটিসি বাস ব্যবহার করুন'],
    landmarks: ['হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর', 'উত্তরা মডেল টাউন', 'জামে মসজিদ'],
    icon: '✈️',
  },
  {
    area: 'গুলশান-বনানী', areaEn: 'Gulshan-Banani', division: 'Dhaka',
    description: 'অভিজাত কূটনৈতিক এলাকা। দূতাবাস, আন্তর্জাতিক রেস্তোরাঁ ও অফিস।',
    metroAccess: ['নিকটস্থ: বিজয় সরণি (MRT-6)'],
    buses: ['গুলশান-মতিঝিল সার্ভিস', 'বিআরটিসি স্পেশাল'],
    tips: ['গুলশান ২ চত্বর থেকে বাস পাওয়া যায়', 'সিএনজি ও উবার সহজলভ্য', 'ভিড় কম কিন্তু ভাড়া বেশি'],
    landmarks: ['গুলশান লেক', 'বনানী কবরস্থান', 'ওয়েস্টিন হোটেল'],
    icon: '🏢',
  },
  {
    area: 'পুরান ঢাকা', areaEn: 'Old Dhaka', division: 'Dhaka',
    description: 'ঐতিহাসিক ঢাকার কেন্দ্র। সরু গলি, ঐতিহ্যবাহী ব্যবসা ও স্থাপত্য।',
    metroAccess: ['বাংলাদেশ সচিবালয় (MRT-6, পায়ে হেঁটে)'],
    buses: ['গুলিস্তান-সদরঘাট', 'পুরান ঢাকা সার্ভিস'],
    tips: ['রিকশা ও ইজিবাইক মূল যান', 'সদরঘাট থেকে লঞ্চে বরিশাল যাওয়া যায়', 'সন্ধ্যায় ইফতার বাজারে ভিড় থাকে'],
    landmarks: ['আহসান মঞ্জিল', 'লালবাগ কেল্লা', 'বুড়িগঙ্গা নদী', 'সদরঘাট লঞ্চ টার্মিনাল'],
    icon: '🏛️',
  },
  {
    area: 'ফার্মগেট-কারওয়ান বাজার', areaEn: 'Farmgate-Karwan Bazar', division: 'Dhaka',
    description: 'ঢাকার কেন্দ্রীয় সংযোগস্থল। মিডিয়া অফিস, কিচেন মার্কেট এখানে।',
    metroAccess: ['ফার্মগেট (MRT-6)', 'কারওয়ান বাজার (MRT-6)'],
    buses: ['প্রায় সব রুটের সংযোগস্থল'],
    tips: ['মেট্রো সবচেয়ে দ্রুত যাতায়াতের মাধ্যম', 'বাজার সময়ে প্রচুর ভিড় থাকে', 'রাত ১০টার পর বাস কম থাকে'],
    landmarks: ['সোনারগাঁও হোটেল', 'কারওয়ান বাজার', 'বিটিভি ভবন'],
    icon: '🔁',
  },
  {
    area: 'যাত্রাবাড়ী-সায়েদাবাদ', areaEn: 'Jatrabari-Sayedabad', division: 'Dhaka',
    description: 'দক্ষিণ-পূর্ব ঢাকার ব্যস্ত প্রবেশদ্বার। দেশের প্রধান বাস টার্মিনাল।',
    metroAccess: ['পরিকল্পনাধীন MRT-2 (ভবিষ্যতে)'],
    buses: ['সায়েদাবাদ থেকে সারা দেশে ইন্টারসিটি বাস'],
    tips: ['ইন্টারসিটি বাসের জন্য আগে টিকিট কাটুন', 'সায়েদাবাদ বাস টার্মিনাল থেকে ঢাকার বাইরে যান', 'ভোরে ও বিকালে সবচেয়ে বেশি বাস থাকে'],
    landmarks: ['সায়েদাবাদ বাস টার্মিনাল', 'যাত্রাবাড়ী চৌরাস্তা'],
    icon: '🚍',
  },
  {
    area: 'সাভার', areaEn: 'Savar', division: 'Dhaka',
    description: 'ঢাকার পশ্চিমে শিল্প ও আবাসিক এলাকা। গার্মেন্টস শিল্পের কেন্দ্র।',
    metroAccess: ['কোনো মেট্রো নেই (BRT পরিকল্পনাধীন)'],
    buses: ['সাভার পরিবহন', 'বোয়ালখালী', 'ট্রান্সিলভা', 'ঢাকা-সাভার গণপরিবহন'],
    tips: ['ঢাকা থেকে আসতে গাবতলী বাস টার্মিনাল ব্যবহার করুন', 'সকাল ৭-৯টায় প্রচুর ভিড় থাকে', 'উবার/পাঠাও সহজলভ্য'],
    landmarks: ['জাতীয় স্মৃতিসৌধ', 'ঢাকা ইপিজেড', 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়'],
    icon: '🏗️',
  },
  {
    area: 'নারায়ণগঞ্জ', areaEn: 'Narayanganj', division: 'Dhaka',
    description: 'শীতলক্ষ্যার তীরে শিল্পনগরী। পুরনো বন্দর ও টেক্সটাইল শিল্প।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-নারায়ণগঞ্জ সিটি সার্ভিস', 'গণপরিবহন লোকাল বাস'],
    tips: ['মেঘনা-শীতলক্ষ্যা নৌপথে ফেরি চলে', 'ঢাকা থেকে ৩০-৪৫ মিনিটের পথ', 'যানজট এড়াতে ট্রেনে যান'],
    landmarks: ['সোনারগাঁও লোক ও কারুশিল্প জাদুঘর', 'পানাম নগর', 'হাজীগঞ্জ কেল্লা'],
    icon: '🏭',
  },
  {
    area: 'গাজীপুর', areaEn: 'Gazipur', division: 'Dhaka',
    description: 'ঢাকার উত্তরে শিল্পনগর। বিআরটি করিডোর সংযুক্ত।',
    metroAccess: ['BRT (গাজীপুর-ঢাকা করিডোর)'],
    buses: ['প্রভাতী', 'বলাকা', 'গাজীপুর পরিবহন', 'বিআরটিসি'],
    tips: ['সকাল ৭-৯টায় BRT ব্যবহার করুন', 'ভাওয়াল জাতীয় উদ্যান পরিদর্শনে যানবাহন পাওয়া যায়', 'উবার/পাঠাও পাওয়া যায়'],
    landmarks: ['ভাওয়াল জাতীয় উদ্যান', 'গাজীপুর সিটি কর্পোরেশন', 'শ্রীপুর শিল্পাঞ্চল'],
    icon: '🌲',
  },
  // ─── Chittagong ─────────────────────────────────────────────────────────────
  {
    area: 'চট্টগ্রাম নগর', areaEn: 'Chattogram City', division: 'Chittagong',
    description: 'বন্দর নগরী চট্টগ্রাম। ব্যস্ত বাণিজ্যিক বন্দর ও ঐতিহাসিক এলাকা।',
    metroAccess: ['কোনো মেট্রো নেই (পরিকল্পনাধীন)'],
    buses: ['বিআরটিসি সিটি বাস', 'মিনিবাস', 'টেম্পো'],
    tips: ['সিএনজি সহজলভ্য ও সাশ্রয়ী', 'বন্দর এলাকায় সকালে যানজট বেশি', 'আগ্রাবাদ থেকে সিটি সেন্টারে বাস পাওয়া যায়'],
    landmarks: ['চট্টগ্রাম বন্দর', 'পতেঙ্গা সমুদ্র সৈকত', 'ফয়স লেক', 'জাতিতাত্ত্বিক জাদুঘর'],
    icon: '⚓',
  },
  {
    area: 'কক্সবাজার', areaEn: "Cox's Bazar", division: 'Chittagong',
    description: 'বিশ্বের দীর্ঘতম সমুদ্র সৈকত। পর্যটন কেন্দ্র।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা থেকে ইন্টারসিটি বাস', 'চট্টগ্রাম-কক্সবাজার লোকাল বাস'],
    tips: ['ঢাকা থেকে সরাসরি রাতের বাস যায়', 'পিক সিজনে আগে বুকিং দিন', 'বিচে অটোরিকশা সহজলভ্য'],
    landmarks: ['কক্সবাজার সমুদ্র সৈকত', 'ইনানী বিচ', 'হিমছড়ি', 'সেন্ট মার্টিন দ্বীপ'],
    icon: '🏖️',
  },
  {
    area: 'রাঙামাটি', areaEn: 'Rangamati', division: 'Chittagong',
    description: 'পার্বত্য চট্টগ্রামের প্রাকৃতিক সৌন্দর্যের শহর। কাপ্তাই লেকের পাড়ে।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['চট্টগ্রাম-রাঙামাটি বাস', 'লোকাল সিএনজি ও নৌকা'],
    tips: ['চট্টগ্রাম থেকে ২-৩ ঘণ্টার পথ', 'নৌকায় কাপ্তাই লেক ভ্রমণ করুন', 'আদিবাসী তাঁতশিল্প কিনতে পারেন'],
    landmarks: ['কাপ্তাই লেক', 'রাজবন বৌদ্ধ বিহার', 'ঝুলন্ত সেতু', 'উপজাতীয় জাদুঘর'],
    icon: '🏔️',
  },
  {
    area: 'বান্দরবান', areaEn: 'Bandarban', division: 'Chittagong',
    description: 'পাহাড়, ঝরনা ও আদিবাসী সংস্কৃতির দেশ।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['চট্টগ্রাম থেকে পূর্বাণী ও পূর্বানী বাস', 'লোকাল জীপ ও সিএনজি'],
    tips: ['বর্ষায় যেতে সতর্ক থাকুন', 'চট্টগ্রাম থেকে ৩ ঘণ্টার পথ', 'নীলাচল, মেঘলা দর্শনীয় স্থান'],
    landmarks: ['নীলাচল', 'মেঘলা পর্যটন কমপ্লেক্স', 'নাফাখুম ঝরনা', 'বগা লেক'],
    icon: '⛰️',
  },
  {
    area: 'কুমিল্লা', areaEn: 'Comilla', division: 'Chittagong',
    description: 'ঐতিহাসিক শহর। ঢাকা-চট্টগ্রাম হাইওয়ের মাঝে অবস্থিত।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-কুমিল্লা পরিবহন', 'চট্টগ্রামগামী বাস', 'লোকাল বাস ও সিএনজি'],
    tips: ['ঢাকা থেকে মাত্র ১.৫-২ ঘণ্টা', 'কুমিল্লার রসমালাই বিখ্যাত', 'ময়নামতি ঘুরে আসুন'],
    landmarks: ['শালবন বৌদ্ধ বিহার', 'ময়নামতি জাদুঘর', 'ওয়ার সেমেট্রি'],
    icon: '🏺',
  },
  // ─── Sylhet ─────────────────────────────────────────────────────────────────
  {
    area: 'সিলেট', areaEn: 'Sylhet', division: 'Sylhet',
    description: 'চা বাগান ও হজরত শাহজালাল (র.) মাজারের শহর।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-সিলেট ইন্টারসিটি বাস', 'লোকাল সিএনজি ও বাস'],
    tips: ['সিলেট কেন্দ্র থেকে সিএনজিতে মাজার যাওয়া যায়', 'চা বাগান দেখতে শ্রীমঙ্গল যান', 'ট্রেনে সিলেট যাওয়াটা সুন্দর'],
    landmarks: ['হযরত শাহজালাল (র.) মাজার', 'জাফলং', 'রাতারগুল', 'বিছানাকান্দি'],
    icon: '🍃',
  },
  {
    area: 'শ্রীমঙ্গল', areaEn: 'Srimangal', division: 'Sylhet',
    description: 'চা বাগানের রাজধানী। সুন্দর প্রকৃতি ও পর্যটন।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা থেকে ট্রেন বা বাস', 'সিলেট থেকে লোকাল বাস'],
    tips: ['ট্রেনে যাওয়া সবচেয়ে সুন্দর', 'সিজন: অক্টোবর-মার্চ ভালো', 'সিএনজিতে চা বাগান ঘোরা যায়'],
    landmarks: ['চা বাগান', 'নিসর্গ ইকো পার্ক', 'মাধবপুর লেক'],
    icon: '🌿',
  },
  {
    area: 'সুনামগঞ্জ', areaEn: 'Sunamganj', division: 'Sylhet',
    description: 'হাওর অঞ্চলের শহর। বর্ষায় অপূর্ব সুন্দর হাওর দর্শন।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['সিলেট থেকে লোকাল বাস', 'ঢাকা থেকে সরাসরি বাস'],
    tips: ['বর্ষায় নৌকায় হাওর ভ্রমণ করুন', 'টাঙ্গুয়ার হাওর পরিদর্শনে আগে বুকিং দিন', 'ভোরে রওনা দিলে বেশি সুবিধা'],
    landmarks: ['টাঙ্গুয়ার হাওর', 'শিমুল বাগান', 'হাসন রাজা যাদুঘর'],
    icon: '🌊',
  },
  {
    area: 'মৌলভীবাজার', areaEn: 'Moulvibazar', division: 'Sylhet',
    description: 'চা বাগান ও বাউল সংস্কৃতির জেলা। লাউয়াছড়া জাতীয় উদ্যান।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['সিলেট বা ঢাকা থেকে বাস', 'লোকাল সিএনজি'],
    tips: ['লাউয়াছড়া বনে গাইড নিন', 'শ্রীমঙ্গল থেকে কাছে', 'সকালে রওনা দিন'],
    landmarks: ['লাউয়াছড়া জাতীয় উদ্যান', 'বাইক্কার বিল', 'চা গবেষণা কেন্দ্র'],
    icon: '🦋',
  },
  // ─── Rajshahi ───────────────────────────────────────────────────────────────
  {
    area: 'রাজশাহী', areaEn: 'Rajshahi', division: 'Rajshahi',
    description: 'শিক্ষা ও আম নগরী। শান্ত ও পরিকল্পিত শহর।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-রাজশাহী ইন্টারসিটি বাস ও ট্রেন', 'শহরে সিএনজি ও রিকশা'],
    tips: ['ট্রেন বা বিমানে যাওয়া ভালো', 'পদ্মা নদীর পাড়ে বিকালে হাঁটা যায়', 'সাতক্ষীরা-বগুড়ার রুটও সহজ'],
    landmarks: ['বরেন্দ্র গবেষণা জাদুঘর', 'পদ্মা রিভার ফ্রন্ট', 'রাজশাহী বিশ্ববিদ্যালয়'],
    icon: '🍋',
  },
  {
    area: 'বগুড়া', areaEn: 'Bogra', division: 'Rajshahi',
    description: 'উত্তরবঙ্গের ব্যবসায়িক কেন্দ্র। মহাস্থানগড়ের ঐতিহাসিক শহর।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-বগুড়া ইন্টারসিটি বাস', 'লোকাল বাস ও অটো'],
    tips: ['ঢাকা থেকে রাতের বাসে যান', 'মহাস্থানগড় পরিদর্শনে ভোরে রওনা দিন', 'দই ও চমচম খেতে ভুলবেন না'],
    landmarks: ['মহাস্থানগড়', 'গোবিন্দভিটা', 'বগুড়া জাদুঘর'],
    icon: '🏯',
  },
  {
    area: 'রংপুর', areaEn: 'Rangpur', division: 'Rajshahi',
    description: 'উত্তরের শহর। শীতকালীন সবজির জন্য বিখ্যাত।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-রংপুর ইন্টারসিটি বাস ও ট্রেন', 'লোকাল অটো ও রিকশা'],
    tips: ['ঢাকা থেকে সরাসরি ট্রেনে যান', 'তাজহাট জমিদার বাড়ি দেখুন', 'হাজির হাটের খাবার বিখ্যাত'],
    landmarks: ['তাজহাট জমিদার বাড়ি', 'রংপুর চিড়িয়াখানা', 'ঘাঘট নদী'],
    icon: '🌾',
  },
  {
    area: 'নওগাঁ', areaEn: 'Naogaon', division: 'Rajshahi',
    description: 'আমের রাজধানী ও বৌদ্ধ ঐতিহ্যের শহর। সোমপুর মহাবিহার।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['রাজশাহী থেকে লোকাল বাস', 'ঢাকা থেকে সরাসরি বাস'],
    tips: ['আম মৌসুমে (মে-জুলাই) যান', 'পাহাড়পুর পরিদর্শনে সকালে যান', 'ট্রেনে যাওয়া যায়'],
    landmarks: ['সোমপুর মহাবিহার (পাহাড়পুর)', 'দিব্যক জয়স্তম্ভ', 'আলতাদীঘি জাতীয় উদ্যান'],
    icon: '🍊',
  },
  // ─── Khulna ─────────────────────────────────────────────────────────────────
  {
    area: 'খুলনা', areaEn: 'Khulna', division: 'Khulna',
    description: 'শিল্প নগরী ও সুন্দরবনের প্রবেশদ্বার।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-খুলনা ইন্টারসিটি বাস ও ট্রেন', 'সুন্দরবন লঞ্চ'],
    tips: ['সুন্দরবন যেতে মংলা থেকে লঞ্চ নিন', 'ট্রেন সবচেয়ে আরামদায়ক', 'শীতকালে সুন্দরবন ভ্রমণ সেরা'],
    landmarks: ['সুন্দরবন', 'খুলনা শিপইয়ার্ড', 'রূপসা নদী'],
    icon: '🌴',
  },
  {
    area: 'যশোর', areaEn: 'Jessore', division: 'Khulna',
    description: 'ফুলের শহর। বেনাপোল স্থলবন্দরের নিকটবর্তী।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-যশোর বাস ও ট্রেন', 'লোকাল অটো ও রিকশা'],
    tips: ['ঢাকা থেকে ট্রেনে যাওয়া ভালো', 'বেনাপোল সীমান্ত দিয়ে ভারত যাওয়া যায়', 'ফুলের হাট থেকে সতেজ ফুল কিনুন'],
    landmarks: ['মাইকেল মধুসূদন দত্তের বাড়ি', 'বেনাপোল স্থলবন্দর', 'যশোর বিমানবন্দর'],
    icon: '🌸',
  },
  {
    area: 'সাতক্ষীরা', areaEn: 'Satkhira', division: 'Khulna',
    description: 'সুন্দরবনের পাশের জেলা। সুন্দর ম্যানগ্রোভ বন।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-সাতক্ষীরা বাস', 'খুলনা থেকে লোকাল বাস'],
    tips: ['সুন্দরবনের শ্যামনগর পয়েন্ট থেকে নৌকায় যান', 'শীতে সুন্দরবন পরিদর্শন উপভোগ্য', 'রাস্তাঘাট ভালো'],
    landmarks: ['সুন্দরবন (শ্যামনগর)', 'যশোরেশ্বরী মন্দির', 'ঈশ্বরীপুর'],
    icon: '🦁',
  },
  {
    area: 'কুষ্টিয়া', areaEn: 'Kushtia', division: 'Khulna',
    description: 'রবীন্দ্রনাথ ও লালনের স্মৃতিবিজড়িত শহর।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা থেকে বাস ও ট্রেন', 'লোকাল সিএনজি ও রিকশা'],
    tips: ['শিলাইদহ কুঠিবাড়ি সকালে যান', 'লালন শাহের মাজারে সন্ধ্যা সুন্দর', 'কুষ্টিয়ার তিল খাজা বিখ্যাত'],
    landmarks: ['শিলাইদহ রবীন্দ্র কুঠিবাড়ি', 'লালন শাহের মাজার', 'আড়পাড়া মিলনায়তন'],
    icon: '🎶',
  },
  // ─── Barisal ────────────────────────────────────────────────────────────────
  {
    area: 'বরিশাল', areaEn: 'Barisal', division: 'Barisal',
    description: 'ভাটির দেশ। নদীপথে চলাচল বিখ্যাত।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-বরিশাল লঞ্চ ও বাস', 'লোকাল সিএনজি ও রিকশা'],
    tips: ['রাতের লঞ্চে সদরঘাট থেকে বরিশাল যান', 'সকালের লঞ্চের দৃশ্য অসাধারণ', 'নৌকায় খালবিল দেখুন'],
    landmarks: ['দুর্গাসাগর দিঘি', 'মুক্তিযোদ্ধা স্মৃতিসৌধ', 'অক্সফোর্ড মিশন চার্চ'],
    icon: '🚢',
  },
  {
    area: 'পটুয়াখালী', areaEn: 'Patuakhali', division: 'Barisal',
    description: 'কুয়াকাটা সমুদ্র সৈকতের জেলা। সূর্যোদয় ও সূর্যাস্ত একসাথে দেখা যায়।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা থেকে লঞ্চ ও বাস', 'বরিশাল থেকে লোকাল বাস'],
    tips: ['কুয়াকাটায় সূর্যোদয়-সূর্যাস্ত দেখুন', 'রাতের লঞ্চে ঢাকা থেকে যান', 'সামুদ্রিক মাছ খেতে ভুলবেন না'],
    landmarks: ['কুয়াকাটা সমুদ্র সৈকত', 'মিষ্টিপানির হ্রদ', 'রাখাইন পল্লী'],
    icon: '🌅',
  },
  {
    area: 'ভোলা', areaEn: 'Bhola', division: 'Barisal',
    description: 'বাংলাদেশের বৃহত্তম দ্বীপ জেলা। মেঘনা নদীবেষ্টিত।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা থেকে লঞ্চ বা বাস', 'বরিশাল থেকে ফেরি'],
    tips: ['লঞ্চে যাওয়া সবচেয়ে সুবিধাজনক', 'দ্বীপের গ্রামগুলো সুন্দর', 'শীতে পাখির মেলা'],
    landmarks: ['চর ফ্যাশন', 'মনপুরা দ্বীপ', 'ভোলা সদর'],
    icon: '🏝️',
  },
  // ─── Mymensingh ─────────────────────────────────────────────────────────────
  {
    area: 'ময়মনসিংহ', areaEn: 'Mymensingh', division: 'Mymensingh',
    description: 'কৃষি বিশ্ববিদ্যালয় ও ব্রহ্মপুত্র নদের শহর।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-ময়মনসিংহ ট্রেন ও বাস', 'শহরে সিএনজি ও রিকশা'],
    tips: ['ট্রেনে ময়মনসিংহ যাওয়া ভালো', 'ব্রহ্মপুত্র নদের পাড়ে ঘুরুন', 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয় ক্যাম্পাস সুন্দর'],
    landmarks: ['বাংলাদেশ কৃষি বিশ্ববিদ্যালয়', 'শশী লজ', 'ব্রহ্মপুত্র নদ'],
    icon: '🌾',
  },
  {
    area: 'নেত্রকোনা', areaEn: 'Netrokona', division: 'Mymensingh',
    description: 'হাওর ও মাছের জেলা। সোমেশ্বরীর স্বচ্ছ পানি।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ময়মনসিংহ থেকে লোকাল বাস', 'ঢাকা থেকে সরাসরি বাস'],
    tips: ['কলমাকান্দার পাহাড়ে যান', 'বিরিশিরি কালচারাল একাডেমি দেখুন', 'হাওরে নৌকায় ভ্রমণ করুন'],
    landmarks: ['বিরিশিরি', 'সোমেশ্বরী নদী', 'দুর্গাপুর হাওর'],
    icon: '🏞️',
  },
  {
    area: 'কিশোরগঞ্জ', areaEn: 'Kishoreganj', division: 'Mymensingh',
    description: 'হাওরের প্রবেশদ্বার ও ঐতিহ্যবাহী শহর।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা থেকে ট্রেন ও বাস', 'লোকাল বাস ও নৌকা'],
    tips: ['ইটনা হাওরে নৌকায় যান', 'হোসেনী দালান দেখুন', 'কিশোরগঞ্জের মিষ্টি বিখ্যাত'],
    landmarks: ['অষ্টগ্রাম হাওর', 'হোসেনী দালান', 'এগারোসিন্দুর'],
    icon: '🚣',
  },
  // ─── Rangpur ────────────────────────────────────────────────────────────────
  {
    area: 'রংপুর বিভাগ', areaEn: 'Rangpur Division', division: 'Rangpur',
    description: 'উত্তরবঙ্গের শীতলতম বিভাগ। চা ও সবজি উৎপাদনে সমৃদ্ধ।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা-রংপুর ইন্টারসিটি বাস ও ট্রেন', 'লোকাল বাস ও সিএনজি'],
    tips: ['শীতকালে পর্যটনের জন্য সেরা', 'কুড়িগ্রাম হয়ে তিস্তার পাড়ে যান', 'দিনাজপুরের সুপারি মিষ্টান্ন বিখ্যাত'],
    landmarks: ['কান্তজিউ মন্দির (দিনাজপুর)', 'তিস্তা নদী', 'রামসাগর দিঘি'],
    icon: '❄️',
  },
  {
    area: 'দিনাজপুর', areaEn: 'Dinajpur', division: 'Rangpur',
    description: 'লিচু ও ধানের জেলা। ঐতিহাসিক কান্তজিউ মন্দির।',
    metroAccess: ['কোনো মেট্রো নেই'],
    buses: ['ঢাকা থেকে বাস ও ট্রেন', 'লোকাল রিকশা ও অটো'],
    tips: ['লিচু মৌসুমে (মে-জুন) যান', 'কান্তজিউ মন্দির সকালে দেখুন', 'রামসাগর দিঘিতে সূর্যোদয় সুন্দর'],
    landmarks: ['কান্তজিউ মন্দির', 'রামসাগর জাতীয় উদ্যান', 'দিনাজপুর রাজবাড়ি'],
    icon: '🍈',
  },
];

export default function NeighbourhoodGuides({ onBack }: Props) {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof GUIDES[0] | null>(null);
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return GUIDES;
    return GUIDES.filter(g =>
      g.area.includes(q) || g.areaEn.toLowerCase().includes(q) ||
      g.division.toLowerCase().includes(q) ||
      g.description.includes(q)
    );
  }, [search]);

  const divisions = [...new Set(GUIDES.map(g => g.division))];

  const toggleDivision = (div: string) => {
    setExpandedDivisions(prev => {
      const next = new Set(prev);
      if (next.has(div)) next.delete(div); else next.add(div);
      return next;
    });
  };

  if (selected) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 px-3 py-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-600 dark:text-gray-400 font-medium text-sm">
            <ChevronLeft className="w-5 h-5" />
            {lbl('Back', 'ফিরে যান')}
          </button>
          <span className="text-2xl">{selected.icon}</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{selected.area}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{selected.areaEn} · {selected.division}</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">{selected.description}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2"><span>🚇</span> {lbl('Metro / MRT Access', 'মেট্রো স্টেশন')}</h3>
            {selected.metroAccess.map(m => <p key={m} className="text-sm text-blue-800 dark:text-blue-200 py-0.5">• {m}</p>)}
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-800">
            <h3 className="font-bold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2"><Bus className="w-4 h-4" /> {lbl('Bus Routes', 'বাস রুট')}</h3>
            <div className="flex flex-wrap gap-2">
              {selected.buses.map(b => (
                <span key={b} className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-xs px-2.5 py-1 rounded-full font-medium">{b}</span>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-2">💡 {lbl('Travel Tips', 'ট্রাভেল টিপস')}</h3>
            {selected.tips.map((tip, i) => <p key={i} className="text-sm text-amber-800 dark:text-amber-200 py-0.5">• {tip}</p>)}
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-800">
            <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> {lbl('Landmarks', 'দর্শনীয় স্থান')}</h3>
            {selected.landmarks.map(l => <p key={l} className="text-sm text-purple-800 dark:text-purple-200 py-0.5">• {l}</p>)}
          </div>
          <div className="h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{lbl('Area Guides', 'এলাকাভিত্তিক গাইড')}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{lbl('Bangladesh Transport Guides', 'বাংলাদেশ পরিবহন গাইড')} · {GUIDES.length}</p>
        </div>
      </div>

      <div className="p-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={lbl('Search area or district...', 'এলাকা বা জেলা খুঁজুন...')}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white" />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        {search ? (
          <div className="grid grid-cols-2 gap-3 content-start">
            {filtered.map(g => (
              <button key={g.area} onClick={() => setSelected(g)}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-left shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors active:scale-95">
                <span className="text-3xl block mb-2">{g.icon}</span>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{g.area}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{g.areaEn}</p>
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
              const divGuides = GUIDES.filter(g => g.division === div);
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
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{g.area}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{g.areaEn}</p>
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
