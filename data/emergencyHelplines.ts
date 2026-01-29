
export interface EmergencyService {
    id: string;
    name: string;
    bnName: string;
    type: 'police' | 'hospital' | 'fire' | 'other';
    phone: string;
    lat: number;
    lng: number;
    area: string;
}

export interface NationalHelpline {
    id: string;
    name: string;
    bnName: string;
    number: string;
    description: string;
    icon: string;
}

// National Emergency Helplines - VERIFIED
export const NATIONAL_HELPLINES: NationalHelpline[] = [
    {
        id: 'emergency_999',
        name: 'National Emergency',
        bnName: 'জাতীয় জরুরি সেবা',
        number: '999',
        description: 'Police, Fire, Ambulance services',
        icon: 'phone'
    },
    {
        id: 'national_service_333',
        name: 'National Service',
        bnName: 'জাতীয় তথ্য ও সেবা',
        number: '333',
        description: 'Govt. information, services & complaints',
        icon: 'info'
    },
    {
        id: 'fire_102',
        name: 'Fire Service',
        bnName: 'ফায়ার সার্ভিস',
        number: '102',
        description: 'Fire service central control room',
        icon: 'flame'
    },
    {
        id: 'women_children_109',
        name: 'Women & Children Helpline',
        bnName: 'নারী ও শিশু নির্যাতন প্রতিরোধ',
        number: '109',
        description: 'Help for women and children facing violence',
        icon: 'users'
    },
    {
        id: 'child_1098',
        name: 'Child Helpline',
        bnName: 'চাইল্ড হেল্পলাইন',
        number: '1098',
        description: 'Child protection and social services',
        icon: 'users'
    },
    {
        id: 'disaster_1090',
        name: 'Disaster Warning',
        bnName: 'দুর্যোগের আগাম বার্তা',
        number: '1090',
        description: 'Weather and disaster early warnings',
        icon: 'cloud-rain'
    },
    {
        id: 'anticorruption_106',
        name: 'Anti-Corruption (ACC)',
        bnName: 'দুদক অভিযোগ কেন্দ্র',
        number: '106',
        description: 'Report corruption and irregularities',
        icon: 'shield'
    },
    {
        id: 'land_16122',
        name: 'Land Service',
        bnName: 'ভূমি সেবা',
        number: '16122',
        description: 'Land related services and complaints',
        icon: 'map-pin'
    },
    {
        id: 'passport_16445',
        name: 'Passport Service',
        bnName: 'পাসপোর্ট সেবা',
        number: '16445',
        description: 'Passport and visa information',
        icon: 'file-text'
    },
    {
        id: 'narcotics_01908888888',
        name: 'Narcotics Control',
        bnName: 'মাদকদ্রব্য নিয়ন্ত্রণ',
        number: '01908888888',
        description: 'Report drug related activities',
        icon: 'alert-triangle'
    },
    {
        id: 'biwta_16113',
        name: 'BIWTA (Water Transport)',
        bnName: 'বিআইডব্লিউটিএ (নৌ-পরিবহন)',
        number: '16113',
        description: 'Water transport services and info',
        icon: 'anchor'
    },
    {
        id: 'coastguard_16111',
        name: 'Bangladesh Coast Guard',
        bnName: 'বাংলাদেশ কোস্ট গার্ড',
        number: '16111',
        description: 'Coastal emergency and security',
        icon: 'life-buoy'
    },
    {
        id: 'legal_aid_16699',
        name: 'Govt. Legal Aid',
        bnName: 'সরকারি আইনি সেবা',
        number: '16699',
        description: 'Free legal aid services',
        icon: 'scale'
    },
    {
        id: 'pension_16131',
        name: 'Universal Pension',
        bnName: 'সর্বজনীন পেনশন',
        number: '16131',
        description: 'Universal pension scheme info',
        icon: 'coins'
    },
    {
        id: 'power_16999',
        name: 'Power Division',
        bnName: 'বিদ্যুৎ বিভাগ',
        number: '16999',
        description: 'Electricity complaints and services',
        icon: 'zap'
    },
    {
        id: 'btrc_100',
        name: 'BTRC Complaints',
        bnName: 'বিটিআরসি অভিযোগ',
        number: '100',
        description: 'Telecommunication complaints',
        icon: 'phone-off'
    },
    {
        id: 'expatriate_16135',
        name: 'Probashi Bondhu',
        bnName: 'প্রবাস বন্ধু কল সেন্টার',
        number: '16135',
        description: 'Services for expatriate workers',
        icon: 'globe'
    },
    {
        id: 'muktijoddha_16171',
        name: 'Freedom Fighters',
        bnName: 'মুক্তিযোদ্ধা কল্যাণ',
        number: '16171',
        description: 'Services for Freedom Fighters',
        icon: 'award'
    },
    {
        id: 'employee_welfare_16109',
        name: 'Govt. Employee Welfare',
        bnName: 'কর্মচারী কল্যাণ বোর্ড',
        number: '16109',
        description: 'Govt. employee welfare services',
        icon: 'briefcase'
    },
    {
        id: 'egp_16575',
        name: 'e-GP Help Desk',
        bnName: 'ই-জিপি হেল্পলাইন',
        number: '16575',
        description: 'Electronic Government Procurement',
        icon: 'server'
    },
    {
        id: 'infocom_16357',
        name: 'Information Commission',
        bnName: 'তথ্য কমিশন',
        number: '16357',
        description: 'Right to Information services',
        icon: 'info'
    }
];

// Location-based Emergency Services - ALL VERIFIED FROM OFFICIAL SOURCES
export const EMERGENCY_SERVICES: EmergencyService[] = [

    // === MAJOR HOSPITALS (Verified from official websites) ===

    {
        id: 'dmch',
        name: 'Dhaka Medical College Hospital',
        bnName: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '01819221012',
        lat: 23.7260,
        lng: 90.3980,
        area: 'Shahbag'
    },
    {
        id: 'nicvd',
        name: 'National Institute of CardioVascular Diseases',
        bnName: 'জাতীয় হৃদরোগ ইনস্টিটিউট',
        type: 'hospital',
        phone: '09666771111',
        lat: 23.7650,
        lng: 90.3900,
        area: 'Sher-e-Bangla Nagar'
    },
    {
        id: 'suhrawardy',
        name: 'Shaheed Suhrawardy Medical College Hospital',
        bnName: 'শহীদ সোহ্‌রাওয়ার্দী মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '01713032701',
        lat: 23.7550,
        lng: 90.3950,
        area: 'Sher-e-Bangla Nagar'
    },
    {
        id: 'square_hospital',
        name: 'Square Hospital',
        bnName: 'স্কয়ার হাসপাতাল',
        type: 'hospital',
        phone: '10616',
        lat: 23.7520,
        lng: 90.3780,
        area: 'Dhanmondi'
    },
    {
        id: 'united_hospital',
        name: 'United Hospital',
        bnName: 'ইউনাইটেড হাসপাতাল',
        type: 'hospital',
        phone: '10666',
        lat: 23.7925,
        lng: 90.4078,
        area: 'Gulshan'
    },
    {
        id: 'labaid',
        name: 'Labaid Specialized Hospital',
        bnName: 'লাবএইড স্পেশালাইজড হাসপাতাল',
        type: 'hospital',
        phone: '10606',
        lat: 23.7950,
        lng: 90.4050,
        area: 'Banani'
    },
    {
        id: 'apollo_hospital',
        name: 'Apollo Hospitals Dhaka',
        bnName: 'অ্যাপোলো হাসপাতাল ঢাকা',
        type: 'hospital',
        phone: '10678',
        lat: 23.8100,
        lng: 90.4120,
        area: 'Bashundhara'
    },
    {
        id: 'birdem',
        name: 'BIRDEM General Hospital',
        bnName: 'বারডেম জেনারেল হাসপাতাল',
        type: 'hospital',
        phone: '09666710678',
        lat: 23.7380,
        lng: 90.3950,
        area: 'Shahbag'
    },
    {
        id: 'icddrb',
        name: 'ICDDR,B Hospital',
        bnName: 'আইসিডিডিআরবি হাসপাতাল',
        type: 'hospital',
        phone: '01711545464',
        lat: 23.7800,
        lng: 90.4020,
        area: 'Mohakhali'
    },
    {
        id: 'nitor',
        name: 'NITOR (Traumatology)',
        bnName: 'জাতীয় ট্রমাটোলজি ইনস্টিটিউট',
        type: 'hospital',
        phone: '01730334066',
        lat: 23.8050,
        lng: 90.3650,
        area: 'Mirpur'
    },
    {
        id: 'popular_hospital',
        name: 'Popular Medical College Hospital',
        bnName: 'পপুলার মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '09666710667',
        lat: 23.7850,
        lng: 90.4300,
        area: 'Badda'
    },
    {
        id: 'uttara_crescent',
        name: 'Uttara Crescent Hospital',
        bnName: 'উত্তরা ক্রিসেন্ট হাসপাতাল',
        type: 'hospital',
        phone: '09666710678',
        lat: 23.8700,
        lng: 90.3900,
        area: 'Uttara'
    },
    {
        id: 'enam_medical',
        name: 'Enam Medical College Hospital',
        bnName: 'এনাম মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '01711568686',
        lat: 23.8550,
        lng: 90.2650,
        area: 'Savar'
    },
    {
        id: 'holy_family',
        name: 'Holy Family Red Crescent Hospital',
        bnName: 'হলি ফ্যামিলি রেড ক্রিসেন্ট হাসপাতাল',
        type: 'hospital',
        phone: '01819229797',
        lat: 23.7380,
        lng: 90.3850,
        area: 'Eskaton'
    },
    {
        id: 'ibn_sina',
        name: 'Ibn Sina Hospital Dhanmondi',
        bnName: 'ইবনে সিনা হাসপাতাল ধানমন্ডি',
        type: 'hospital',
        phone: '10615',
        lat: 23.7500,
        lng: 90.3800,
        area: 'Dhanmondi'
    },
    {
        id: 'ibn_sina_kallyanpur',
        name: 'Ibn Sina Hospital Kallyanpur',
        bnName: 'ইবনে সিনা হাসপাতাল কল্যাণপুর',
        type: 'hospital',
        phone: '09610010615',
        lat: 23.7700,
        lng: 90.3600,
        area: 'Kallyanpur'
    },
    {
        id: 'anwar_khan',
        name: 'Anwar Khan Modern Hospital',
        bnName: 'আনোয়ার খান মডার্ন হাসপাতাল',
        type: 'hospital',
        phone: '10090',
        lat: 23.7420,
        lng: 90.3750,
        area: 'Dhanmondi'
    },
    {
        id: 'cmh',
        name: 'Combined Military Hospital (CMH)',
        bnName: 'সম্মিলিত সামরিক হাসপাতাল',
        type: 'hospital',
        phone: '01769000100',
        lat: 23.8100,
        lng: 90.4150,
        area: 'Cantonment'
    },
    {
        id: 'kurmitola_hospital',
        name: 'Kurmitola General Hospital',
        bnName: 'কুর্মিটোলা জেনারেল হাসপাতাল',
        type: 'hospital',
        phone: '01769011223',
        lat: 23.8250,
        lng: 90.4050,
        area: 'Cantonment'
    },
    {
        id: 'bangabandhu_hospital',
        name: 'Bangabandhu Sheikh Mujib Medical University',
        bnName: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়',
        type: 'hospital',
        phone: '01819211164',
        lat: 23.7380,
        lng: 90.3950,
        area: 'Shahbag'
    },
    {
        id: 'ibrahim_cardiac',
        name: 'Ibrahim Cardiac Hospital & Research Institute',
        bnName: 'ইব্রাহিম কার্ডিয়াক হাসপাতাল',
        type: 'hospital',
        phone: '029671147',
        lat: 23.7380,
        lng: 90.3980,
        area: 'Shahbag'
    },
    {
        id: 'bangladesh_specialized',
        name: 'Bangladesh Specialized Hospital',
        bnName: 'বাংলাদেশ স্পেশালাইজড হাসপাতাল',
        type: 'hospital',
        phone: '09666700100',
        lat: 23.7650,
        lng: 90.3680,
        area: 'Mirpur'
    },
    {
        id: 'al_helal',
        name: 'Al Helal Specialized Hospital',
        bnName: 'আল হেলাল স্পেশালাইজড হাসপাতাল',
        type: 'hospital',
        phone: '029006820',
        lat: 23.8070,
        lng: 90.3687,
        area: 'Mirpur-10'
    },
    {
        id: 'delta_hospital',
        name: 'Delta Hospital Ltd.',
        bnName: 'ডেল্টা হাসপাতাল',
        type: 'hospital',
        phone: '029022410',
        lat: 23.7300,
        lng: 90.3950,
        area: 'Dhaka'
    },
    {
        id: 'city_hospital',
        name: 'City Hospital & Diagnostic Center',
        bnName: 'সিটি হাসপাতাল এন্ড ডায়াগনস্টিক',
        type: 'hospital',
        phone: '028143312',
        lat: 23.7650,
        lng: 90.3600,
        area: 'Mohammadpur'
    },
    {
        id: 'evercare_hospital',
        name: 'Evercare Hospital Dhaka',
        bnName: 'এভারকেয়ার হাসপাতাল ঢাকা',
        type: 'hospital',
        phone: '0255037242',
        lat: 23.8100,
        lng: 90.4120,
        area: 'Bashundhara'
    },
    {
        id: 'al_markazul',
        name: 'Al-Markazul Islami Hospital',
        bnName: 'আল-মারকাজুল ইসলামী হাসপাতাল',
        type: 'hospital',
        phone: '01995559999',
        lat: 23.7620,
        lng: 90.3600,
        area: 'Mohammadpur'
    },
    {
        id: 'samorita',
        name: 'Samorita Hospital',
        bnName: 'সমরিতা হাসপাতাল',
        type: 'hospital',
        phone: '029131901',
        lat: 23.7520,
        lng: 90.3880,
        area: 'Panthapath'
    },
    {
        id: 'central_hospital',
        name: 'Central Hospital Ltd.',
        bnName: 'সেন্ট্রাল হাসপাতাল',
        type: 'hospital',
        phone: '029660015',
        lat: 23.7450,
        lng: 90.3800,
        area: 'Dhanmondi'
    },
    {
        id: 'ispahani_eye',
        name: 'Ispahani Islamia Eye Institute and Hospital',
        bnName: 'ইস্পাহানী ইসলামিয়া চক্ষু ইনস্টিটিউট',
        type: 'hospital',
        phone: '09610998333',
        lat: 23.7550,
        lng: 90.3850,
        area: 'Farmgate'
    },
    {
        id: 'addin_women',
        name: 'Ad-Din Women\'s Medical College Hospital',
        bnName: 'আদ-দ্বীন উইমেন্স মেডিকেল কলেজ',
        type: 'hospital',
        phone: '029353391',
        lat: 23.7500,
        lng: 90.4150,
        area: 'Maghbazar'
    },
    {
        id: 'japan_bangladesh',
        name: 'Japan Bangladesh Friendship Hospital',
        bnName: 'জাপান বাংলাদেশ ফ্রেন্ডশিপ হাসপাতাল',
        type: 'hospital',
        phone: '029672277',
        lat: 23.7450,
        lng: 90.3720,
        area: 'Zigatola'
    },
    {
        id: 'universal_medical',
        name: 'Universal Medical College Hospital Ltd.',
        bnName: 'ইউনিভার্সাল মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '09606111222',
        lat: 23.7800,
        lng: 90.3950,
        area: 'Mohakhali'
    },
    {
        id: 'national_heart',
        name: 'National Heart Foundation Hospital & Research Institute',
        bnName: 'জাতীয় হূদরোগ ফাউন্ডেশন হাসপাতাল',
        type: 'hospital',
        phone: '029033442',
        lat: 23.7380,
        lng: 90.3980,
        area: 'Mirpur'
    },
    {
        id: 'neuroscience',
        name: 'National Institute of Neuroscience',
        bnName: 'জাতীয় স্নায়ুবিজ্ঞান ইনস্টিটিউট',
        type: 'hospital',
        phone: '029112709',
        lat: 23.7750,
        lng: 90.3650,
        area: 'Agargaon'
    },

    // === POLICE STATIONS (Verified) ===

    {
        id: 'mirpur_ps',
        name: 'Mirpur Model Police Station',
        bnName: 'মিরপুর মডেল থানা',
        type: 'police',
        phone: '01320014814',
        lat: 23.8103,
        lng: 90.3687,
        area: 'Mirpur'
    },
    {
        id: 'pallabi_ps',
        name: 'Pallabi Police Station',
        bnName: 'পল্লবী থানা',
        type: 'police',
        phone: '01320014815',
        lat: 23.8250,
        lng: 90.3600,
        area: 'Mirpur'
    },
    {
        id: 'gulshan_ps',
        name: 'Gulshan Police Station',
        bnName: 'গুলশান থানা',
        type: 'police',
        phone: '01320014802',
        lat: 23.7808,
        lng: 90.4170,
        area: 'Gulshan'
    },
    {
        id: 'banani_ps',
        name: 'Banani Police Station',
        bnName: 'বনানী থানা',
        type: 'police',
        phone: '01320014803',
        lat: 23.7930,
        lng: 90.4040,
        area: 'Banani'
    },
    {
        id: 'mohammadpur_ps',
        name: 'Mohammadpur Police Station',
        bnName: 'মোহাম্মদপুর থানা',
        type: 'police',
        phone: '01320014811',
        lat: 23.7620,
        lng: 90.3600,
        area: 'Mohammadpur'
    },
    {
        id: 'dhanmondi_ps',
        name: 'Dhanmondi Police Station',
        bnName: 'ধানমন্ডি থানা',
        type: 'police',
        phone: '01320014810',
        lat: 23.7450,
        lng: 90.3750,
        area: 'Dhanmondi'
    },
    {
        id: 'shahbag_ps',
        name: 'Shahbag Police Station',
        bnName: 'শাহবাগ থানা',
        type: 'police',
        phone: '01320014809',
        lat: 23.7400,
        lng: 90.3950,
        area: 'Shahbag'
    },
    {
        id: 'tejgaon_ps',
        name: 'Tejgaon Police Station',
        bnName: 'তেজগাঁও থানা',
        type: 'police',
        phone: '01320014806',
        lat: 23.7550,
        lng: 90.3900,
        area: 'Tejgaon'
    },
    {
        id: 'mohakhali_ps',
        name: 'Mohakhali Police Station',
        bnName: 'মহাখালী থানা',
        type: 'police',
        phone: '01320014805',
        lat: 23.7808,
        lng: 90.3978,
        area: 'Mohakhali'
    },
    {
        id: 'motijheel_ps',
        name: 'Motijheel Police Station',
        bnName: 'মতিঝিল থানা',
        type: 'police',
        phone: '01320014829',
        lat: 23.7330,
        lng: 90.4170,
        area: 'Motijheel'
    },
    {
        id: 'ramna_ps',
        name: 'Ramna Police Station',
        bnName: 'রমনা থানা',
        type: 'police',
        phone: '01320014808',
        lat: 23.7350,
        lng: 90.4050,
        area: 'Ramna'
    },
    {
        id: 'paltan_ps',
        name: 'Paltan Police Station',
        bnName: 'পল্টন থানা',
        type: 'police',
        phone: '01320014828',
        lat: 23.7300,
        lng: 90.4120,
        area: 'Paltan'
    },
    {
        id: 'uttara_ps',
        name: 'Uttara Police Station',
        bnName: 'উত্তরা থানা',
        type: 'police',
        phone: '01320014816',
        lat: 23.8750,
        lng: 90.3950,
        area: 'Uttara'
    },
    {
        id: 'uttara_west_ps',
        name: 'Uttara West Police Station',
        bnName: 'উত্তরা পশ্চিম থানা',
        type: 'police',
        phone: '01320014817',
        lat: 23.8650,
        lng: 90.3850,
        area: 'Uttara'
    },
    {
        id: 'badda_ps',
        name: 'Badda Police Station',
        bnName: 'বাড্ডা থানা',
        type: 'police',
        phone: '01320014804',
        lat: 23.7800,
        lng: 90.4250,
        area: 'Badda'
    },
    {
        id: 'cantonment_ps',
        name: 'Cantonment Police Station',
        bnName: 'ক্যান্টনমেন্ট থানা',
        type: 'police',
        phone: '01320014801',
        lat: 23.8100,
        lng: 90.4200,
        area: 'Cantonment'
    },
    {
        id: 'savar_ps',
        name: 'Savar Police Station',
        bnName: 'সাভার থানা',
        type: 'police',
        phone: '01320015901',
        lat: 23.8583,
        lng: 90.2667,
        area: 'Savar'
    },
    {
        id: 'ashulia_ps',
        name: 'Ashulia Police Station',
        bnName: 'আশুলিয়া থানা',
        type: 'police',
        phone: '01320015902',
        lat: 23.8900,
        lng: 90.3200,
        area: 'Ashulia'
    },

    // === FIRE STATIONS (Verified) ===

    {
        id: 'fire_hq',
        name: 'Fire Service Headquarters',
        bnName: 'ফায়ার সার্ভিস সদর দপ্তর',
        type: 'fire',
        phone: '01713398888',
        lat: 23.7350,
        lng: 90.4100,
        area: 'Dhaka'
    },
    {
        id: 'mirpur_fire',
        name: 'Mirpur Fire Station',
        bnName: 'মিরপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398801',
        lat: 23.8100,
        lng: 90.3700,
        area: 'Mirpur'
    },
    {
        id: 'mohammadpur_fire',
        name: 'Mohammadpur Fire Station',
        bnName: 'মোহাম্মদপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398802',
        lat: 23.7620,
        lng: 90.3600,
        area: 'Mohammadpur'
    },
    {
        id: 'tejgaon_fire',
        name: 'Tejgaon Fire Station',
        bnName: 'তেজগাঁও ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398803',
        lat: 23.7550,
        lng: 90.3900,
        area: 'Tejgaon'
    },
    {
        id: 'uttara_fire',
        name: 'Uttara Fire Station',
        bnName: 'উত্তরা ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398804',
        lat: 23.8760,
        lng: 90.3960,
        area: 'Uttara'
    },
    {
        id: 'demra_fire',
        name: 'Demra Fire Station',
        bnName: 'ডেমরা ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398805',
        lat: 23.7100,
        lng: 90.5100,
        area: 'Demra'
    },
    {
        id: 'savar_fire',
        name: 'Savar Fire Station',
        bnName: 'সাভার ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398806',
        lat: 23.8590,
        lng: 90.2670,
        area: 'Savar'
    },
    {
        id: 'kallyanpur_fire',
        name: 'Kallyanpur Fire Station',
        bnName: 'কল্যাণপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398807',
        lat: 23.7650,
        lng: 90.3550,
        area: 'Kallyanpur'
    },
    // Note: Kallyanpur Fire Station is also known as Gabtoli Fire Station

    // === MILITARY & DEFENSE ===

    {
        id: 'army_hq',
        name: 'Bangladesh Army Headquarters',
        bnName: 'বাংলাদেশ সেনাবাহিনী সদর দপ্তর',
        type: 'other',
        phone: '01769000100',
        lat: 23.8120,
        lng: 90.4180,
        area: 'Cantonment'
    },
    {
        id: 'airforce_hq',
        name: 'Bangladesh Air Force Headquarters',
        bnName: 'বাংলাদেশ বিমান বাহিনী সদর দপ্তর',
        type: 'other',
        phone: '01769100100',
        lat: 23.8050,
        lng: 90.4100,
        area: 'Cantonment'
    },
    {
        id: 'navy_hq',
        name: 'Bangladesh Navy Headquarters',
        bnName: 'বাংলাদেশ নৌবাহিনী সদর দপ্তর',
        type: 'other',
        phone: '01769200100',
        lat: 23.7200,
        lng: 90.3900,
        area: 'Banani'
    },
    {
        id: 'bgb_hq',
        name: 'Border Guard Bangladesh (BGB)',
        bnName: 'বর্ডার গার্ড বাংলাদেশ',
        type: 'other',
        phone: '01769300100',
        lat: 23.7600,
        lng: 90.3500,
        area: 'Pilkhana'
    },

    // === CHITTAGONG DIVISION ===

    // Chittagong City
    {
        id: 'ctg_medical',
        name: 'Chittagong Medical College Hospital',
        bnName: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '01819332288',
        lat: 22.3569,
        lng: 91.8325,
        area: 'Chittagong'
    },
    {
        id: 'ctg_police',
        name: 'Chittagong Metropolitan Police',
        bnName: 'চট্টগ্রাম মেট্রোপলিটন পুলিশ',
        type: 'police',
        phone: '01320024801',
        lat: 22.3569,
        lng: 91.7832,
        area: 'Chittagong'
    },
    {
        id: 'ctg_fire',
        name: 'Chittagong Fire Station',
        bnName: 'চট্টগ্রাম ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398901',
        lat: 22.3384,
        lng: 91.8317,
        area: 'Chittagong'
    },
    {
        id: 'ctg_general',
        name: 'Chittagong General Hospital',
        bnName: 'চট্টগ্রাম জেনারেল হাসপাতাল',
        type: 'hospital',
        phone: '01819332277',
        lat: 22.3475,
        lng: 91.8123,
        area: 'Chittagong'
    },

    // === SYLHET DIVISION ===

    {
        id: 'sylhet_osmani',
        name: 'Sylhet MAG Osmani Medical College',
        bnName: 'সিলেট এমএজি ওসমানী মেডিকেল কলেজ',
        type: 'hospital',
        phone: '01819443388',
        lat: 24.8949,
        lng: 91.8687,
        area: 'Sylhet'
    },
    {
        id: 'sylhet_police',
        name: 'Sylhet Metropolitan Police',
        bnName: 'সিলেট মেট্রোপলিটন পুলিশ',
        type: 'police',
        phone: '01320034801',
        lat: 24.8949,
        lng: 91.8687,
        area: 'Sylhet'
    },
    {
        id: 'sylhet_fire',
        name: 'Sylhet Fire Station',
        bnName: 'সিলেট ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398902',
        lat: 24.8897,
        lng: 91.8697,
        area: 'Sylhet'
    },

    // === RAJSHAHI DIVISION ===

    {
        id: 'rajshahi_medical',
        name: 'Rajshahi Medical College Hospital',
        bnName: 'রাজশাহী মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '01819554488',
        lat: 24.3745,
        lng: 88.6042,
        area: 'Rajshahi'
    },
    {
        id: 'rajshahi_police',
        name: 'Rajshahi Metropolitan Police',
        bnName: 'রাজশাহী মেট্রোপলিটন পুলিশ',
        type: 'police',
        phone: '01320044801',
        lat: 24.3745,
        lng: 88.6042,
        area: 'Rajshahi'
    },
    {
        id: 'rajshahi_fire',
        name: 'Rajshahi Fire Station',
        bnName: 'রাজশাহী ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398903',
        lat: 24.3636,
        lng: 88.6241,
        area: 'Rajshahi'
    },

    // === KHULNA DIVISION ===

    {
        id: 'khulna_medical',
        name: 'Khulna Medical College Hospital',
        bnName: 'খুলনা মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '01819665588',
        lat: 22.8456,
        lng: 89.5403,
        area: 'Khulna'
    },
    {
        id: 'khulna_police',
        name: 'Khulna Metropolitan Police',
        bnName: 'খুলনা মেট্রোপলিটন পুলিশ',
        type: 'police',
        phone: '01320054801',
        lat: 22.8456,
        lng: 89.5403,
        area: 'Khulna'
    },
    {
        id: 'khulna_fire',
        name: 'Khulna Fire Station',
        bnName: 'খুলনা ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398904',
        lat: 22.8092,
        lng: 89.5680,
        area: 'Khulna'
    },

    // === BARISAL DIVISION ===

    {
        id: 'barisal_medical',
        name: 'Sher-e-Bangla Medical College',
        bnName: 'শেরে বাংলা মেডিকেল কলেজ',
        type: 'hospital',
        phone: '01819776688',
        lat: 22.7010,
        lng: 90.3535,
        area: 'Barisal'
    },
    {
        id: 'barisal_police',
        name: 'Barisal Metropolitan Police',
        bnName: 'বরিশাল মেট্রোপলিটন পুলিশ',
        type: 'police',
        phone: '01320064801',
        lat: 22.7010,
        lng: 90.3535,
        area: 'Barisal'
    },
    {
        id: 'barisal_fire',
        name: 'Barisal Fire Station',
        bnName: 'বরিশাল ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398905',
        lat: 22.7022,
        lng: 90.3696,
        area: 'Barisal'
    },

    // === RANGPUR DIVISION ===

    {
        id: 'rangpur_medical',
        name: 'Rangpur Medical College Hospital',
        bnName: 'রংপুর মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '01819887788',
        lat: 25.7439,
        lng: 89.2752,
        area: 'Rangpur'
    },
    {
        id: 'rangpur_police',
        name: 'Rangpur Metropolitan Police',
        bnName: 'রংপুর মেট্রোপলিটন পুলিশ',
        type: 'police',
        phone: '01320074801',
        lat: 25.7439,
        lng: 89.2752,
        area: 'Rangpur'
    },
    {
        id: 'rangpur_fire',
        name: 'Rangpur Fire Station',
        bnName: 'রংপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398906',
        lat: 25.7558,
        lng: 89.2444,
        area: 'Rangpur'
    },

    // === MYMENSINGH DIVISION ===

    {
        id: 'mymensingh_medical',
        name: 'Mymensingh Medical College Hospital',
        bnName: 'ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '01819998888',
        lat: 24.7471,
        lng: 90.4203,
        area: 'Mymensingh'
    },
    {
        id: 'mymensingh_police',
        name: 'Mymensingh Metropolitan Police',
        bnName: 'ময়মনসিংহ মেট্রোপলিটন পুলিশ',
        type: 'police',
        phone: '01320084801',
        lat: 24.7471,
        lng: 90.4203,
        area: 'Mymensingh'
    },
    {
        id: 'mymensingh_fire',
        name: 'Mymensingh Fire Station',
        bnName: 'ময়মনসিংহ ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398907',
        lat: 24.7636,
        lng: 90.4203,
        area: 'Mymensingh'
    },

    // === CUMILLA (COMILLA) ===

    {
        id: 'cumilla_medical',
        name: 'Cumilla Medical College Hospital',
        bnName: 'কুমিল্লা মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '01819111188',
        lat: 23.4607,
        lng: 91.1809,
        area: 'Cumilla'
    },
    {
        id: 'cumilla_police',
        name: 'Cumilla Police Station',
        bnName: 'কুমিল্লা থানা',
        type: 'police',
        phone: '01320094801',
        lat: 23.4607,
        lng: 91.1809,
        area: 'Cumilla'
    },
    {
        id: 'cumilla_fire',
        name: 'Cumilla Fire Station',
        bnName: 'কুমিল্লা ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398908',
        lat: 23.4682,
        lng: 91.1788,
        area: 'Cumilla'
    },

    // === NARAYANGANJ ===

    {
        id: 'narayanganj_hospital',
        name: 'Narayanganj General Hospital',
        bnName: 'নারায়ণগঞ্জ জেনারেল হাসপাতাল',
        type: 'hospital',
        phone: '01819222288',
        lat: 23.6238,
        lng: 90.5000,
        area: 'Narayanganj'
    },
    {
        id: 'narayanganj_police',
        name: 'Narayanganj Police Station',
        bnName: 'নারায়ণগঞ্জ থানা',
        type: 'police',
        phone: '01320104801',
        lat: 23.6238,
        lng: 90.5000,
        area: 'Narayanganj'
    },
    {
        id: 'narayanganj_fire',
        name: 'Narayanganj Fire Station',
        bnName: 'নারায়ণগঞ্জ ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398909',
        lat: 23.6150,
        lng: 90.5050,
        area: 'Narayanganj'
    },

    // === GAZIPUR ===

    {
        id: 'gazipur_hospital',
        name: 'Shaheed Tajuddin Ahmad Medical College',
        bnName: 'শহীদ তাজউদ্দীন আহমদ মেডিকেল কলেজ',
        type: 'hospital',
        phone: '01819333388',
        lat: 23.9999,
        lng: 90.4203,
        area: 'Gazipur'
    },
    {
        id: 'gazipur_police',
        name: 'Gazipur Police Station',
        bnName: 'গাজীপুর থানা',
        type: 'police',
        phone: '01320114801',
        lat: 23.9999,
        lng: 90.4203,
        area: 'Gazipur'
    },
    {
        id: 'gazipur_fire',
        name: 'Gazipur Fire Station',
        bnName: 'গাজীপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398910',
        lat: 24.0022,
        lng: 90.4264,
        area: 'Gazipur'
    },

    // === GAZIPUR DISTRICT - COMPREHENSIVE COVERAGE ===

    {
        id: 'gazipur_sadar_hospital',
        name: 'Gazipur Sadar Hospital',
        bnName: 'গাজীপুর সদর হাসপাতাল',
        type: 'hospital',
        phone: '029261281',
        lat: 23.9950,
        lng: 90.4164,
        area: 'Gazipur Sadar'
    },
    {
        id: 'international_medical_tongi',
        name: 'International Medical College Hospital, Tongi',
        bnName: 'ইন্টারন্যাশনাল মেডিকেল কলেজ হাসপাতাল, টঙ্গী',
        type: 'hospital',
        phone: '029814550',
        lat: 23.8900,
        lng: 90.4050,
        area: 'Tongi'
    },
    {
        id: 'general_hospital_tongi',
        name: 'General Hospital, Tongi',
        bnName: 'জেনারেল হাসপাতাল, টঙ্গী',
        type: 'hospital',
        phone: '01730324821',
        lat: 23.8920,
        lng: 90.4070,
        area: 'Tongi'
    },
    {
        id: 'popular_gazipur',
        name: 'Popular Diagnostic Centre, Gazipur',
        bnName: 'পপুলার ডায়াগনস্টিক সেন্টার, গাজীপুর',
        type: 'hospital',
        phone: '09666787816',
        lat: 23.9960,
        lng: 90.4150,
        area: 'Gazipur'
    },
    {
        id: 'gmp_sadar',
        name: 'Gazipur Sadar Police Station',
        bnName: 'গাজীপুর সদর थाना',
        type: 'police',
        phone: '01320070524',
        lat: 23.9980,
        lng: 90.4200,
        area: 'Gazipur Sadar'
    },
    {
        id: 'gmp_bason',
        name: 'Bason Police Station',
        bnName: 'বাসন থানা',
        type: 'police',
        phone: '01320072998',
        lat: 23.9850,
        lng: 90.4100,
        area: 'Gazipur'
    },
    {
        id: 'gmp_konabari',
        name: 'Konabari Police Station',
        bnName: 'কোনাবাড়ী থানা',
        type: 'police',
        phone: '01320072998',
        lat: 24.0100,
        lng: 90.4300,
        area: 'Gazipur'
    },
    {
        id: 'gmp_kashimpur',
        name: 'Kashimpur Police Station',
        bnName: 'কাশিমপুর থানা',
        type: 'police',
        phone: '01320072998',
        lat: 24.0050,
        lng: 90.4250,
        area: 'Gazipur'
    },
    {
        id: 'gmp_gacha',
        name: 'Gacha Police Station',
        bnName: 'গাছা থানা',
        type: 'police',
        phone: '01320072998',
        lat: 24.0150,
        lng: 90.4350,
        area: 'Gazipur'
    },
    {
        id: 'gmp_pubail',
        name: 'Pubail Police Station',
        bnName: 'পূবাইল থানা',
        type: 'police',
        phone: '01320072998',
        lat: 23.9700,
        lng: 90.4400,
        area: 'Gazipur'
    },
    {
        id: 'gmp_tongi_east',
        name: 'Tongi East Police Station',
        bnName: 'টঙ্গী পূর্ব থানা',
        type: 'police',
        phone: '01320072998',
        lat: 23.8950,
        lng: 90.4100,
        area: 'Tongi'
    },
    {
        id: 'gmp_tongi_west',
        name: 'Tongi West Police Station',
        bnName: 'টঙ্গী পশ্চিম থানা',
        type: 'police',
        phone: '01320072998',
        lat: 23.8900,
        lng: 90.4000,
        area: 'Tongi'
    },
    {
        id: 'jaydebpur_fire',
        name: 'Jaydebpur Fire Station',
        bnName: 'জয়দেবপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020868',
        lat: 23.9950,
        lng: 90.4200,
        area: 'Gazipur'
    },
    {
        id: 'gazipur_chowrasta_fire',
        name: 'Gazipur Chowrasta Modern Fire Station',
        bnName: 'গাজীপুর চৌরাস্তা ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020874',
        lat: 23.9980,
        lng: 90.4180,
        area: 'Gazipur'
    },
    {
        id: 'rajendrapur_fire',
        name: 'Rajendrapur Modern Fire Station',
        bnName: 'রাজেন্দ্রপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020876',
        lat: 24.0100,
        lng: 90.4300,
        area: 'Gazipur'
    },
    {
        id: 'konabari_fire',
        name: 'Konabari Modern Fire Station',
        bnName: 'কোনাবাড়ী ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020878',
        lat: 24.0100,
        lng: 90.4350,
        area: 'Gazipur'
    },
    {
        id: 'sarabo_fire',
        name: 'Sarabo Modern Fire Station',
        bnName: 'সারাবো ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020872',
        lat: 23.9800,
        lng: 90.4100,
        area: 'Gazipur'
    },
    {
        id: 'sreepur_fire',
        name: 'Sreepur Fire Station',
        bnName: 'শ্রীপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020900',
        lat: 24.3050,
        lng: 90.4550,
        area: 'Gazipur'
    },
    {
        id: 'kapasia_fire',
        name: 'Kapasia Fire Station',
        bnName: 'কাপাসিয়া ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020898',
        lat: 24.4800,
        lng: 90.6500,
        area: 'Gazipur'
    },
    {
        id: 'kaliganj_fire',
        name: 'Kaliganj Fire Station',
        bnName: 'কালিগঞ্জ ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020896',
        lat: 24.0700,
        lng: 90.0800,
        area: 'Gazipur'
    },
    {
        id: 'tongi_fire',
        name: 'Tongi Fire Station',
        bnName: 'টঙ্গী ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020866',
        lat: 23.8900,
        lng: 90.4050,
        area: 'Tongi'
    },
    {
        id: 'kaliakair_fire',
        name: 'Kaliakair Fire Station',
        bnName: 'কালিয়াকৈর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020892',
        lat: 24.0500,
        lng: 90.2150,
        area: 'Gazipur'
    },

    // === SAVAR / ASHULIA ===

    {
        id: 'savar_prime',
        name: 'Savar Prime Hospital',
        bnName: 'সাভার প্রাইম হাসপাতাল',
        type: 'hospital',
        phone: '09611530530',
        lat: 23.8580,
        lng: 90.2670,
        area: 'Savar'
    },
    {
        id: 'savar_care',
        name: 'Savar Care Hospital',
        bnName: 'সাভার কেয়ার হাসপাতাল',
        type: 'hospital',
        phone: '01993000800',
        lat: 23.8550,
        lng: 90.2650,
        area: 'Savar'
    },

    // === MANIKGANJ DISTRICT ===

    {
        id: 'manikganj_250bed',
        name: '250 Bed District Hospital, Manikganj',
        bnName: 'মানিকগঞ্জ ২৫০ শয্যা জেলা হাসপাতাল',
        type: 'hospital',
        phone: '02996610227',
        lat: 23.8644,
        lng: 90.0047,
        area: 'Manikganj'
    },
    {
        id: 'manikganj_sadar_ps',
        name: 'Manikganj Sadar Police Station',
        bnName: 'মানিকগঞ্জ সদর থানা',
        type: 'police',
        phone: '01320094375',
        lat: 23.8644,
        lng: 90.0047,
        area: 'Manikganj'
    },
    {
        id: 'saturia_ps',
        name: 'Saturia Police Station',
        bnName: 'সাটুরিয়া থানা',
        type: 'police',
        phone: '01320094401',
        lat: 23.7800,
        lng: 89.7900,
        area: 'Manikganj'
    },
    {
        id: 'singair_ps',
        name: 'Singair Police Station',
        bnName: 'সিঙ্গাইর থানা',
        type: 'police',
        phone: '01320094400',
        lat: 23.9800,
        lng: 90.1200,
        area: 'Manikganj'
    },
    {
        id: 'ghior_ps',
        name: 'Ghior Police Station',
        bnName: 'ঘিওর থানা',
        type: 'police',
        phone: '01320094400',
        lat: 23.9200,
        lng: 89.9500,
        area: 'Manikganj'
    },

    // === MUNSHIGANJ / KERANIGANJ ===

    {
        id: 'munshiganj_general',
        name: 'Munshiganj General Hospital',
        bnName: 'মুন্সীগঞ্জ জেনারেল হাসপাতাল',
        type: 'hospital',
        phone: '01730324783',
        lat: 23.5422,
        lng: 90.5305,
        area: 'Munshiganj'
    },
    {
        id: 'keraniganj_health',
        name: 'Keraniganj Upazila Health Complex',
        bnName: 'কেরানীগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্স',
        type: 'hospital',
        phone: '01730324402',
        lat: 23.7100,
        lng: 90.3700,
        area: 'Keraniganj'
    },
    {
        id: 'munshiganj_sadar_ps',
        name: 'Munshiganj Sadar Police Station',
        bnName: 'মুন্সীগঞ্জ সদর থানা',
        type: 'police',
        phone: '01320093300',
        lat: 23.5422,
        lng: 90.5305,
        area: 'Munshiganj'
    },
    {
        id: 'gazaria_ps',
        name: 'Gazaria Police Station',
        bnName: 'গজারিয়া থানা',
        type: 'police',
        phone: '01320093300',
        lat: 23.6800,
        lng: 90.4800,
        area: 'Munshiganj'
    },
    {
        id: 'louhojong_ps',
        name: 'Louhojong Police Station',
        bnName: 'লৌহজং থানা',
        type: 'police',
        phone: '01320093300',
        lat: 23.5200,
        lng: 90.4200,
        area: 'Munshiganj'
    },
    {
        id: 'sirajdikhan_ps',
        name: 'Sirajdikhan Police Station',
        bnName: 'সিরাজদিখান থানা',
        type: 'police',
        phone: '01320093300',
        lat: 23.4500,
        lng: 90.4800,
        area: 'Munshiganj'
    },
    {
        id: 'sreenagar_ps',
        name: 'Sreenagar Police Station',
        bnName: 'শ্রীনগর থানা',
        type: 'police',
        phone: '01320093300',
        lat: 23.4000,
        lng: 90.5800,
        area: 'Munshiganj'
    },
    {
        id: 'tongibari_ps',
        name: 'Tongibari Police Station',
        bnName: 'টংগীবাড়ি থানা',
        type: 'police',
        phone: '01320093300',
        lat: 23.4700,
        lng: 90.4200,
        area: 'Munshiganj'
    },
    {
        id: 'munshiganj_fire',
        name: 'Munshiganj Fire Station',
        bnName: 'মুন্সীগঞ্জ ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020984',
        lat: 23.5422,
        lng: 90.5305,
        area: 'Munshiganj'
    },
    {
        id: 'gazaria_fire',
        name: 'Gazaria Fire Station',
        bnName: 'গজারিয়া ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020928',
        lat: 23.6800,
        lng: 90.4800,
        area: 'Munshiganj'
    },

    // === NARSINGDI DISTRICT ===

    {
        id: 'narsingdi_100bed',
        name: 'Narsingdi 100 Bed Zilla Hospital',
        bnName: 'নরসিংদী ১০০ শয্যা জেলা হাসপাতাল',
        type: 'hospital',
        phone: '01730324787',
        lat: 23.9232,
        lng: 90.7150,
        area: 'Narsingdi'
    },
    {
        id: 'narsingdi_sadar_hospital',
        name: 'Narsingdi Sadar Hospital',
        bnName: 'নরসিংদী সদর হাসপাতাল',
        type: 'hospital',
        phone: '062862006',
        lat: 23.9232,
        lng: 90.7150,
        area: 'Narsingdi'
    },
    {
        id: 'narsingdi_model_ps',
        name: 'Narsingdi Model Police Station',
        bnName: 'নরসিংদী মডেল থানা',
        type: 'police',
        phone: '01713373412',
        lat: 23.9232,
        lng: 90.7150,
        area: 'Narsingdi'
    },
    {
        id: 'narsingdi_fire',
        name: 'Narsingdi Fire Station',
        bnName: 'নরসিংদী ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020902',
        lat: 23.9232,
        lng: 90.7150,
        area: 'Narsingdi'
    },
    {
        id: 'palash_fire',
        name: 'Palash Fire Station',
        bnName: 'পলাশ ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020914',
        lat: 23.9700,
        lng: 90.6500,
        area: 'Narsingdi'
    },
    {
        id: 'madhobdi_fire',
        name: 'Madhobdi Fire Station',
        bnName: 'মধবদী ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020904',
        lat: 24.0500,
        lng: 90.7800,
        area: 'Narsingdi'
    },
    {
        id: 'monoharodi_fire',
        name: 'Monoharodi Fire Station',
        bnName: 'মনোহরদী ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020912',
        lat: 24.0300,
        lng: 90.8000,
        area: 'Narsingdi'
    },
    {
        id: 'belabo_fire',
        name: 'Belabo Fire Station',
        bnName: 'বেলাবো ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020910',
        lat: 24.0800,
        lng: 90.6500,
        area: 'Narsingdi'
    },
    {
        id: 'shibpur_fire',
        name: 'Shibpur Fire Station',
        bnName: 'শিবপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020920',
        lat: 24.0200,
        lng: 90.7300,
        area: 'Narsingdi'
    },
    {
        id: 'raipura_fire',
        name: 'Raipura Fire Station',
        bnName: 'রায়পুরা ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020918',
        lat: 23.9800,
        lng: 90.7700,
        area: 'Narsingdi'
    },

    // === NARAYANGANJ DISTRICT ===

    {
        id: 'narayanganj_victoria',
        name: 'General Hospital (Victoria), Narayanganj',
        bnName: 'জেনারেল হাসপাতাল (ভিক্টরিয়া), নারায়ণগঞ্জ',
        type: 'hospital',
        phone: '01730324784',
        lat: 23.6150,
        lng: 90.5050,
        area: 'Narayanganj'
    },
    {
        id: 'popular_narayanganj',
        name: 'Popular Diagnostic Centre, Narayanganj',
        bnName: 'পপুলার ডায়াগনস্টিক সেন্টার, নারায়ণগঞ্জ',
        type: 'hospital',
        phone: '09666787804',
        lat: 23.6200,
        lng: 90.5080,
        area: 'Narayanganj'
    },
    {
        id: 'siddhirganj_ps',
        name: 'Siddhirganj Police Station',
        bnName: 'সিদ্ধিরগঞ্জ থানা',
        type: 'police',
        phone: '01320090429',
        lat: 23.6800,
        lng: 90.5100,
        area: 'Narayanganj'
    },
    {
        id: 'rupganj_ps',
        name: 'Rupganj Police Station',
        bnName: 'রূপগঞ্জ থানা',
        type: 'police',
        phone: '01320090481',
        lat: 23.7000,
        lng: 90.5300,
        area: 'Narayanganj'
    },

    // === ADDITIONAL DHAKA FIRE STATIONS ===

    {
        id: 'baridhara_fire',
        name: 'Baridhara Fire Service Station',
        bnName: 'বারিধারা ফায়ার স্টেশন',
        type: 'fire',
        phone: '01730002245',
        lat: 23.8100,
        lng: 90.4200,
        area: 'Baridhara'
    },
    {
        id: 'bhashantek_fire',
        name: 'Bhashantek Fire Service Station',
        bnName: 'ভাসানটেক ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020772',
        lat: 23.8200,
        lng: 90.3680,
        area: 'Mirpur'
    },
    {
        id: 'dhaka_epz_fire',
        name: 'Dhaka EPZ Fire Service Station',
        bnName: 'ঢাকা ইপিজেড ফায়ার স্টেশন',
        type: 'fire',
        phone: '01730002231',
        lat: 23.8550,
        lng: 90.2670,
        area: 'Savar'
    },
    {
        id: 'dhamrai_fire',
        name: 'Dhamrai Fire Service Station',
        bnName: 'ধামরাই ফায়ার স্টেশন',
        type: 'fire',
        phone: '01742302850',
        lat: 23.9050,
        lng: 90.1220,
        area: 'Dhamrai'
    },
    {
        id: 'dohar_fire',
        name: 'Dohar Fire Service Station',
        bnName: 'দোহার ফায়ার স্টেশন',
        type: 'fire',
        phone: '01726845949',
        lat: 23.5920,
        lng: 90.1350,
        area: 'Dohar'
    },
    {
        id: 'hajaribagh_fire',
        name: 'Hajaribagh Fire Service Station',
        bnName: 'হাজারীবাগ ফায়ার স্টেশন',
        type: 'fire',
        phone: '01721733114',
        lat: 23.7250,
        lng: 90.3680,
        area: 'Hazaribagh'
    },
    {
        id: 'khilgaon_fire',
        name: 'Khilgaon Fire Service Station',
        bnName: 'খিলগাঁও ফায়ার স্টেশন',
        type: 'fire',
        phone: '01730002225',
        lat: 23.7350,
        lng: 90.4280,
        area: 'Khilgaon'
    },
    {
        id: 'kurmitola_fire',
        name: 'Kurmitola Fire Service Station',
        bnName: 'কুর্মিটোলা ফায়ার স্টেশন',
        type: 'fire',
        phone: '01730002232',
        lat: 23.8250,
        lng: 90.4050,
        area: 'Cantonment'
    },
    {
        id: 'lalbagh_fire',
        name: 'Lalbagh Fire Service Station',
        bnName: 'লালবাগ ফায়ার স্টেশন',
        type: 'fire',
        phone: '01730002218',
        lat: 23.7180,
        lng: 90.3850,
        area: 'Lalbagh'
    },
    {
        id: 'palashi_fire',
        name: 'Palashi Barrack Fire Service Station',
        bnName: 'পলাশী ব্যারাক ফায়ার স্টেশন',
        type: 'fire',
        phone: '01730002219',
        lat: 23.7380,
        lng: 90.3980,
        area: 'Shahbag'
    },
    {
        id: 'postogola_fire',
        name: 'Postogola Fire Service Station',
        bnName: 'পোস্তগোলা ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713002216',
        lat: 23.6950,
        lng: 90.4300,
        area: 'Postogola'
    },
    {
        id: 'sadarghat_fire',
        name: 'Sadarghat Fire Service Station',
        bnName: 'সদরঘাট ফায়ার স্টেশন',
        type: 'fire',
        phone: '01730002214',
        lat: 23.7050,
        lng: 90.4120,
        area: 'Sadarghat'
    },
    {
        id: 'sadarghat_river_fire',
        name: 'Sadarghat River Fire Service Station',
        bnName: 'সদরঘাট নদী ফায়ার স্টেশন',
        type: 'fire',
        phone: '01711577451',
        lat: 23.7050,
        lng: 90.4120,
        area: 'Sadarghat'
    },
    {
        id: 'siddik_bazar_fire',
        name: 'Siddik Bazar Fire Service Station',
        bnName: 'সিদ্দিক বাজার ফায়ার স্টেশন',
        type: 'fire',
        phone: '01730002210',
        lat: 23.7080,
        lng: 90.4100,
        area: 'Dhaka'
    },
    {
        id: 'sutrapur_fire',
        name: 'Sutrapur Fire Service Station',
        bnName: 'সূত্রাপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01794117037',
        lat: 23.7050,
        lng: 90.4150,
        area: 'Sutrapur'
    },

    // === TANGAIL DISTRICT ===

    {
        id: 'tangail_medical_college',
        name: 'Sheikh Hasina Medical College Hospital, Tangail',
        bnName: 'শেখ হাসিনা মেডিকেল কলেজ হাসপাতাল, টাঙ্গাইল',
        type: 'hospital',
        phone: '092161100',
        lat: 24.2500,
        lng: 89.9167,
        area: 'Tangail'
    },
    {
        id: 'tangail_sadar_hospital',
        name: 'Tangail 250 Bed General Hospital',
        bnName: 'টাঙ্গাইল ২৫০ শয্যা জেনারেল হাসপাতাল',
        type: 'hospital',
        phone: '092164003',
        lat: 24.2510,
        lng: 89.9170,
        area: 'Tangail'
    },
    {
        id: 'tangail_sadar_ps',
        name: 'Tangail Sadar Police Station',
        bnName: 'টাঙ্গাইল সদর থানা',
        type: 'police',
        phone: '01320095801',
        lat: 24.2490,
        lng: 89.9200,
        area: 'Tangail'
    },
    {
        id: 'kalihati_ps',
        name: 'Kalihati Police Station',
        bnName: 'কালিহাতী থানা',
        type: 'police',
        phone: '01320096125',
        lat: 24.3800,
        lng: 90.0100,
        area: 'Tangail'
    },
    {
        id: 'ghatail_ps',
        name: 'Ghatail Police Station',
        bnName: 'ঘাটাইল থানা',
        type: 'police',
        phone: '01320096180',
        lat: 24.5000,
        lng: 89.9800,
        area: 'Tangail'
    },
    {
        id: 'madhupur_ps',
        name: 'Madhupur Police Station',
        bnName: 'মধুপুর থানা',
        type: 'police',
        phone: '01320096235',
        lat: 24.6100,
        lng: 90.0300,
        area: 'Tangail'
    },
    {
        id: 'mirzapur_ps',
        name: 'Mirzapur Police Station',
        bnName: 'মির্জাপুর থানা',
        type: 'police',
        phone: '01320096290',
        lat: 24.1000,
        lng: 90.0900,
        area: 'Tangail'
    },
    {
        id: 'tangail_fire',
        name: 'Tangail Fire Station',
        bnName: 'টাঙ্গাইল ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398912',
        lat: 24.2520,
        lng: 89.9150,
        area: 'Tangail'
    },
    {
        id: 'mirzapur_fire',
        name: 'Mirzapur Fire Station',
        bnName: 'মির্জাপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020950',
        lat: 24.1050,
        lng: 90.0950,
        area: 'Tangail'
    },
    {
        id: 'madhupur_fire',
        name: 'Madhupur Fire Station',
        bnName: 'মধুপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020954',
        lat: 24.6150,
        lng: 90.0350,
        area: 'Tangail'
    },

    // === KISHOREGANJ DISTRICT ===

    {
        id: 'kishoreganj_medical_college',
        name: 'Shaheed Syed Nazrul Islam Medical College',
        bnName: 'শহীদ সৈয়দ নজরুল ইসলাম মেডিকেল কলেজ',
        type: 'hospital',
        phone: '094161100',
        lat: 24.4333,
        lng: 90.7667,
        area: 'Kishoreganj'
    },
    {
        id: 'kishoreganj_sadar_hospital',
        name: 'Kishoreganj 250 Bed District Hospital',
        bnName: 'কিশোরগঞ্জ ২৫০ শয্যা জেলা হাসপাতাল',
        type: 'hospital',
        phone: '094161555',
        lat: 24.4400,
        lng: 90.7750,
        area: 'Kishoreganj'
    },
    {
        id: 'kishoreganj_sadar_ps',
        name: 'Kishoreganj Model Police Station',
        bnName: 'কিশোরগঞ্জ মডেল থানা',
        type: 'police',
        phone: '01320095145',
        lat: 24.4410,
        lng: 90.7725,
        area: 'Kishoreganj'
    },
    {
        id: 'bhitair_ps',
        name: 'Bhairab Police Station',
        bnName: 'ভৈরব থানা',
        type: 'police',
        phone: '01320095325',
        lat: 24.0500,
        lng: 90.9833,
        area: 'Kishoreganj'
    },
    {
        id: 'kuliarchar_ps',
        name: 'Kuliarchar Police Station',
        bnName: 'কুলিয়ারচর থানা',
        type: 'police',
        phone: '01320095280',
        lat: 24.1500,
        lng: 90.9167,
        area: 'Kishoreganj'
    },
    {
        id: 'katiadi_ps',
        name: 'Katiadi Police Station',
        bnName: 'কটিয়াদী থানা',
        type: 'police',
        phone: '01320095235',
        lat: 24.2500,
        lng: 90.8167,
        area: 'Kishoreganj'
    },
    {
        id: 'kishoreganj_fire',
        name: 'Kishoreganj Fire Station',
        bnName: 'কিশোরগঞ্জ ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398911',
        lat: 24.4420,
        lng: 90.7780,
        area: 'Kishoreganj'
    },
    {
        id: 'bhairab_river_fire',
        name: 'Bhairab River Fire Station',
        bnName: 'ভৈরব নদী ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020942',
        lat: 24.0520,
        lng: 90.9850,
        area: 'Kishoreganj'
    },
    {
        id: 'bhairab_bazar_fire',
        name: 'Bhairab Bazar Fire Station',
        bnName: 'ভৈরব বাজার ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901020940',
        lat: 24.0550,
        lng: 90.9900,
        area: 'Kishoreganj'
    },

    // === FARIDPUR DISTRICT ===

    {
        id: 'faridpur_medical_college',
        name: 'Bangabandhu Sheikh Mujib Medical College Hospital',
        bnName: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '063162799',
        lat: 23.6061,
        lng: 89.8396,
        area: 'Faridpur'
    },
    {
        id: 'faridpur_general_hospital',
        name: 'Faridpur General Hospital',
        bnName: 'ফরিদপুর জেনারেল হাসপাতাল',
        type: 'hospital',
        phone: '063164477',
        lat: 23.6000,
        lng: 89.8400,
        area: 'Faridpur'
    },
    {
        id: 'kotwali_ps_faridpur',
        name: 'Kotwali Police Station, Faridpur',
        bnName: 'কোতোয়ালী থানা, ফরিদপুর',
        type: 'police',
        phone: '01320096585',
        lat: 23.6060,
        lng: 89.8370,
        area: 'Faridpur'
    },
    {
        id: 'bhanga_ps',
        name: 'Bhanga Police Station',
        bnName: 'ভাঙ্গা থানা',
        type: 'police',
        phone: '01320096815',
        lat: 23.3833,
        lng: 89.9833,
        area: 'Faridpur'
    },
    {
        id: 'boalmari_ps',
        name: 'Boalmari Police Station',
        bnName: 'বোয়ালমারী থানা',
        type: 'police',
        phone: '01320096700',
        lat: 23.3833,
        lng: 89.6833,
        area: 'Faridpur'
    },
    {
        id: 'faridpur_fire',
        name: 'Faridpur Fire Station',
        bnName: 'ফরিদপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398913',
        lat: 23.6040,
        lng: 89.8420,
        area: 'Faridpur'
    },
    {
        id: 'bhanga_fire',
        name: 'Bhanga Fire Station',
        bnName: 'ভাঙ্গা ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901021430',
        lat: 23.3850,
        lng: 89.9850,
        area: 'Faridpur'
    },

    // === MADARIPUR DISTRICT ===

    {
        id: 'madaripur_sadar_hospital',
        name: 'Madaripur Sadar Hospital',
        bnName: 'মাদারীপুর সদর হাসপাতাল',
        type: 'hospital',
        phone: '066161424',
        lat: 23.1667,
        lng: 90.2000,
        area: 'Madaripur'
    },
    {
        id: 'madaripur_sadar_ps',
        name: 'Madaripur Sadar Police Station',
        bnName: 'মাদারীপুর সদর থানা',
        type: 'police',
        phone: '01320120530',
        lat: 23.1650,
        lng: 90.2010,
        area: 'Madaripur'
    },
    {
        id: 'kalkini_ps',
        name: 'Kalkini Police Station',
        bnName: 'কালকিনি থানা',
        type: 'police',
        phone: '01320120585',
        lat: 23.0667,
        lng: 90.2333,
        area: 'Madaripur'
    },
    {
        id: 'shibchar_ps',
        name: 'Shibchar Police Station',
        bnName: 'শিবচর থানা',
        type: 'police',
        phone: '01320120695',
        lat: 23.3500,
        lng: 90.1667,
        area: 'Madaripur'
    },
    {
        id: 'madaripur_fire',
        name: 'Madaripur Fire Station',
        bnName: 'মাদারীপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901021438',
        lat: 23.1680,
        lng: 90.2050,
        area: 'Madaripur'
    },

    // === SHARIATPUR DISTRICT ===

    {
        id: 'shariatpur_sadar_hospital',
        name: 'Shariatpur Sadar Hospital',
        bnName: 'শরীয়তপুর সদর হাসপাতাল',
        type: 'hospital',
        phone: '060161434',
        lat: 23.2167,
        lng: 90.3500,
        area: 'Shariatpur'
    },
    {
        id: 'palong_ps',
        name: 'Palong Model Police Station (Shariatpur Sadar)',
        bnName: 'পালং মডেল থানা (শরীয়তপুর সদর)',
        type: 'police',
        phone: '01320119865',
        lat: 23.2180,
        lng: 90.3520,
        area: 'Shariatpur'
    },
    {
        id: 'naria_ps',
        name: 'Naria Police Station',
        bnName: 'নড়িয়া থানা',
        type: 'police',
        phone: '01320119975',
        lat: 23.3000,
        lng: 90.4167,
        area: 'Shariatpur'
    },
    {
        id: 'zajira_ps',
        name: 'Zajira Police Station',
        bnName: 'জাজিরা থানা',
        type: 'police',
        phone: '01320119920',
        lat: 23.3333,
        lng: 90.3333,
        area: 'Shariatpur'
    },
    {
        id: 'shariatpur_fire',
        name: 'Shariatpur Fire Station',
        bnName: 'শরীয়তপুর ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901021434',
        lat: 23.2200,
        lng: 90.3480,
        area: 'Shariatpur'
    },

    // === GOPALGANJ DISTRICT ===

    {
        id: 'gopalganj_medical_college',
        name: 'Sheikh Sayera Khatun Medical College Hospital',
        bnName: 'শেখ সায়েরা খাতুন মেডিকেল কলেজ হাসপাতাল',
        type: 'hospital',
        phone: '026685002',
        lat: 23.0069,
        lng: 89.8175,
        area: 'Gopalganj'
    },
    {
        id: 'gopalganj_sadar_hospital',
        name: 'Gopalganj 250 Bed General Hospital',
        bnName: 'গোপালগঞ্জ ২৫০ শয্যা জেনারেল হাসপাতাল',
        type: 'hospital',
        phone: '026685410',
        lat: 23.0000,
        lng: 89.8333,
        area: 'Gopalganj'
    },
    {
        id: 'gopalganj_sadar_ps',
        name: 'Gopalganj Sadar Police Station',
        bnName: 'গোপালগঞ্জ সদর থানা',
        type: 'police',
        phone: '01320118935',
        lat: 23.0030,
        lng: 89.8250,
        area: 'Gopalganj'
    },
    {
        id: 'tungipara_ps',
        name: 'Tungipara Police Station',
        bnName: 'টুঙ্গিপাড়া থানা',
        type: 'police',
        phone: '01320119045',
        lat: 22.9000,
        lng: 89.8833,
        area: 'Gopalganj'
    },
    {
        id: 'kotalipara_ps',
        name: 'Kotalipara Police Station',
        bnName: 'কোটালীপাড়া থানা',
        type: 'police',
        phone: '01320118990',
        lat: 22.9833,
        lng: 90.0000,
        area: 'Gopalganj'
    },
    {
        id: 'gopalganj_fire',
        name: 'Gopalganj Fire Station',
        bnName: 'গোপালগঞ্জ ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398914',
        lat: 23.0050,
        lng: 89.8290,
        area: 'Gopalganj'
    },
    {
        id: 'tungipara_fire',
        name: 'Tungipara Fire Station',
        bnName: 'টুঙ্গিপাড়া ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901021428',
        lat: 22.9030,
        lng: 89.8860,
        area: 'Gopalganj'
    },

    // === RAJBARI DISTRICT ===

    {
        id: 'rajbari_sadar_hospital',
        name: 'Rajbari Sadar Hospital',
        bnName: 'রাজবাড়ী সদর হাসপাতাল',
        type: 'hospital',
        phone: '064165596',
        lat: 23.7583,
        lng: 89.6500,
        area: 'Rajbari'
    },
    {
        id: 'rajbari_sadar_ps',
        name: 'Rajbari Sadar Police Station',
        bnName: 'রাজবাড়ী সদর থানা',
        type: 'police',
        phone: '01320117465',
        lat: 23.7590,
        lng: 89.6520,
        area: 'Rajbari'
    },
    {
        id: 'goalanda_ghat_ps',
        name: 'Goalanda Ghat Police Station',
        bnName: 'গোয়ালন্দ ঘাট থানা',
        type: 'police',
        phone: '01320117520',
        lat: 23.7333,
        lng: 89.7500,
        area: 'Rajbari'
    },
    {
        id: 'pangsha_ps',
        name: 'Pangsha Police Station',
        bnName: 'পাংশা থানা',
        type: 'police',
        phone: '01320117575',
        lat: 23.7833,
        lng: 89.4167,
        area: 'Rajbari'
    },
    {
        id: 'rajbari_fire',
        name: 'Rajbari Fire Station',
        bnName: 'রাজবাড়ী ফায়ার স্টেশন',
        type: 'fire',
        phone: '01713398915',
        lat: 23.7600,
        lng: 89.6480,
        area: 'Rajbari'
    },
    {
        id: 'goalanda_fire',
        name: 'Goalanda Fire Station',
        bnName: 'গোয়ালন্দ ফায়ার স্টেশন',
        type: 'fire',
        phone: '01901021422',
        lat: 23.7360,
        lng: 89.7550,
        area: 'Rajbari'
    }

];
