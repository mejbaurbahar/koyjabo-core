import { BUS_DATA } from '../constants'; // Assuming BUS_DATA is exported from constants.ts

// Helper function to normalize bus names for consistent mapping
const normalizeBusName = (name: string): string => {
    return name
        .replace(/\(.*\)/g, '') // Remove anything in parentheses
        .replace(/Paribahan/gi, '')
        .replace(/Transport/gi, '')
        .replace(/Service/gi, '')
        .replace(/Enterprise/gi, '')
        .replace(/Bus/gi, '')
        .replace(/No\./gi, 'নং')
        .trim();
};

// Map of bus names to their corresponding image filenames (without extension)
// This map is crucial for ensuring correct image loading.
const busImageMap: Record<string, string> = {
    // Numbers - map both English and Bengali formats
    '4 নং Alike': '৪নং বাস',
    '4 No Alike': '৪নং বাস',
    '6 নং': '৬নং বাস',
    '6 No': '৬নং বাস',
    '7 নং': '৭নং বাস',
    '7 No': '৭নং বাস',
    '8 নং': '৮নং বাস',
    '8 No': '৮নং বাস',
    '9 নং': '৯নং বাস',
    '9 No': '৯নং বাস',

    // Named buses (using Bengali names from folder)
    'Agradut': 'অগ্রদূত',
    'Anabil Super': 'অনাবিল',
    'Arnob': 'অরনব বাস',
    'Akash': 'আকাশ বাস',
    'Akik': 'আকিক ',
    'Achim': 'আছিম পরিবহন',
    'Ajmeri Glory': 'আজমেরী গ্লোর',
    'Al Makka': 'আল মক্কা বাস',
    'Al Madina Plus One': 'আল মনিদা প্লাস',
    'Alif': 'আলিফ বাস',
    'Ashirbad': 'আশীর্বাদ পরিবহন',
    'Ashulia Classic': 'আশুলিয়া ক্লাসিক বাস',
    'Asmani': 'আসমানী বাস',
    'Ayath': 'আয়াত বাস',
    'ETC': 'ইটিসি বাস',
    'Winner': 'উইনার বাস',
    'ATCL': 'এটিসিএল বাস',
    'FTCL': 'এফটিসিএল বাস',
    'Everest': 'এভারেস্ট পরিবহন বাস',
    'MM Lovely': 'এম এম লাভলী বাস',
    'MTCL 2': 'এমটিসিএল ২ বাস',
    'Airport Bangabandhu Avenue': 'এয়ারপোর্ট বঙ্গবন্ধু এভিনিউ ট্রান্',
    'Omama International': 'ওমামা ইন্টারন্যাশনাল বাস',
    'Welcome': 'ওয়েলকাম বাস',
    'Konak': 'কনক বাস',
    'Kamal Plus': 'কামাল প্লাস পরিবহন বাস',
    'Kiranmala': 'কিরণমালা বাস',
    'Cantonment': 'ক্যান্টনমেন্ট বাস',
    'Cantonment Mini Service': 'ক্যান্টনমেন্ট মিনি সার্ভিস',
    'Khaja Baba': 'খাজা বাবা বাস',
    'Gazipur': 'গাজীপুর পরিবহন বাস',
    'Gulshan Chaka': 'গুলশান চাকা বাস',
    'Gramin': 'গ্রামীণ বাস',
    'Green Anabil': 'গ্রীন অনাবিল বাস',
    'Green Dhaka': 'গ্রীন ঢাকা বাস',
    'Champion': 'চ্যাম্পিয়ন বাস',
    'Shalsabil': 'ছালছাবিল বাস',
    'Salsabil': 'ছালছাবিল বাস',
    'Jabale Nur': 'জাবালে নুর পরিবহন বাস',
    'Trans Silva': 'ট্রান্স সিলভা বাস',
    'Transilva': 'ট্রান্স সিলভা বাস',
    'Trust AC': 'ট্রাষ্ট ট্রান্সপোর্ট বাস এসি',
    'Trust': 'ট্রাষ্ট ট্রান্সপোর্ট বাস',
    'Thikana': 'ঠিকানা বাস',
    'D One': 'ডি ওয়ান বাস',
    'D Link': 'ডি লিংক বাস',
    'Dhakar Chaka': 'ঢাকার চাকা বাস',
    'Taranga Plus': 'তরঙ্গ প্লাস বাস',
    'Tanjil': 'তানজিল পরিবহন বাস',
    'Talukdar': 'তালুকদার বাস',
    'Titas': 'তিতাস বাস',
    'Tetulia': 'তেতুলিয়া বাস',
    'Dishari': 'দিসারি বাস',
    'Deepan': 'দীপন বাস',
    'Dewan': 'দেওয়ান বাস',
    'Desh Bangla': 'দেশ বাংলা বাস',
    'Dip': 'দ্বীপ পরিবহন বাস',
    'New Vision': 'নিউ ভিশন বাস',
    'Nilachal': 'নিলাচল বাস',
    'Noor E Makka': 'নূর এ মক্কা বাস',
    'Paristhan': 'পরিস্থান বাস',
    'Pallabi Super': 'পল্লবী সুপার',
    'Purbachal Logistics': 'পূর্বাচল লজিস্টিকস বাস',
    'Prochesta': 'প্রচেষ্টা বাস',
    'Projapoti': 'প্রজাপতি বাস',
    'Protoy': 'প্রত্যয় বাস',
    'Prabhati Bonshree': 'প্রভাতী বনশ্রী',
    'First Ten': 'ফার্স্ট টেন',
    'Bondhu': 'বন্ধু পরিবহন বাস',
    'Balaka': 'বলাকা বাস',
    'Basumati': 'বাসুমতি বাস',
    'Bahon': 'বাহন বাস',
    'BRTC Articulated': 'বি আর টিসি আরটিকুলেটেড বাস',
    'BRTC': 'বি আর টিসি বাস',
    'Bikalpa Bus Auto Service': 'বিকল্প বাস অটো সার্ভিস',
    'Bikalpa Bus City Super Service': 'বিকল্প বাস সিটি সুপার সার্ভিস',
    'Bikash': 'বিকাশ বাস',
    'Bihanga': 'বিহাঙ্গা বাস',
    'Best': 'বেষ্ট ট্রান্সপোর্ট',
    'Best Satabdi AC': 'বেষ্ট শতাব্দী এসি বাস',
    'Baishakhi': 'বৈশাখী বাস',
    'Borak': 'বোরাক বাস',
    'VIP 27': 'ভিআইপি ২৭ বাস',
    'Victor Classic': 'ভিক্টর ক্লাসিক বাস',
    'Victor': 'ভিক্টর পরিবহন বাস',
    'Bhuiyan': 'ভূঁইয়া পরিবহন',
    'Madhumoti': 'মধুমতি বাস',
    'Manjil Express': 'মাঞ্জিল এক্সপ্রেস',
    'Malancha': 'মালঞ্চ বাস',
    'Midline': 'মিডলাইন বাস',
    'Mirpur United Service': 'মিরপুর ইউনাইটেড সার্ভিস',
    'Mirpur Mission': 'মিরপুর মিশন বাস',
    'Mirpur Metro Service': 'মিরপুর মেট্রো সার্ভিস',
    'Mirpur Link': 'মিরপুর লিংক বাস',
    'Meghla': 'মেঘলা ট্রান্সপোর্ট',
    'Meskat': 'মেসকাত বাস',
    'Maitri': 'মৈত্রী বাস',
    'Mohona': 'মোহনা বাস',
    'Maumita': 'মৌমিতা বাস',
    'Rajanigandha': 'রজনীগন্ধা বাস',
    'Robrob': 'রবরব বাস',
    'Ramjan': 'রমযান বাস',
    'Raida': 'রাইদা বাস',
    'Rajdhani': 'রাজধানী বাস',
    'Raja City': 'রাজা সিটি বাস',
    'Rupa': 'রুপা পরিবহন বাস',
    'Labbaik': 'লাব্বাইক বাস',
    'Lal Sobuj': 'লাল সবুজ',
    'LAMS': 'ল্যামস পরিবহন বাস',
    'Shatabdi': 'শতাব্দি বাস',
    'Shahriya Enterprise': 'শাহরিয়া এন্টারপ্রাইজ বাস',
    'Shikor': 'শিকড় পরিবহন বাস',
    'Shikor Paribahan': 'শিকড় পরিবহন বাস',
    'Shubhojatra': 'শুভযাত্রা বাস',
    'Shubhechcha': 'শুভেচ্ছা বাস',
    'Savar': 'সাভার পরিবহন বাস',
    'City Link': 'সিটি লিংক বাস',
    'Siam': 'সিয়াম ট্রান্সপোর্ট বাস',
    'Super': 'সুপার বাস',
    'Suprobhat': 'সুপ্রভাত বাস',
    'Safety Druti': 'সেফটি দ্রুতি বাস',
    'Skyline': 'স্কাই লাইন বাস',
    'Shokolpo': 'স্বকল্প ট্রান্সপোর্ট',
    'Shojon': 'স্বজন পরিবহন বাস',
    'Shadhin Express': 'স্বাধীন এক্সপ্রেস বাস',
    'Shadhin': 'স্বাধীন বাস',
    'Haji': 'হাজি ট্রান্সপোর্ট',
    'Himachal': 'হিমাচল বাস',
    'Himaloy': 'হিমালয় বাস',
    'Modhumoti': 'মধুমতি বাস',
    'Moumita': 'মৌমিতা বাস',
    'Himalay': 'হিমালয় বাস',
    'Itihash': 'ইতিহাস বাস',
    'Lams': 'ল্যামস পরিবহন বাস',
    'Rob Rob': 'রবরব বাস',
    'Prajapati': 'প্রজাপতি বাস',
    'Kanak': 'কনক বাস',
    'Sakalpa Transport': 'স্বকল্প ট্রান্সপোর্ট',
    'Swajan Paribahan': 'স্বজন পরিবহন বাস',
    'Suveccha': 'শুভেচ্ছা বাস',
    'Suvojatri': 'শুভযাত্রা বাস',
    'Lal Sabuj': 'লাল সবুজ',
    'Nur E Makka': 'নূর এ মক্কা বাস',
    '9 No.': '৯নং বাস',
    'Shahria': 'শাহরিয়া এন্টারপ্রাইজ বাস',
    'Shahriya': 'শাহরিয়া এন্টারপ্রাইজ বাস',
};

// Map bus names to their image filenames in the buses-image folder
export const getBusImagePath = (busName: string, busBnName?: string): string | null => {
    // Normalize bus name - remove "Paribahan", "Transport", etc. and trim
    const normalized = busName
        .replace(/\(.*\)/g, '') // Remove anything in parentheses
        .replace(/Paribahan/gi, '')
        .replace(/Transport/gi, '')
        .replace(/Service/gi, '')
        .replace(/Enterprise/gi, '')
        .replace(/Bus/gi, '')
        .replace(/No\./gi, 'নং')
        .replace(/Co\./gi, '')
        .replace(/Ltd\./gi, '')
        .trim();

    // Try to get image by bus name
    let imageName = busImageMap[normalized] || busImageMap[busName] || busBnName;

    if (!imageName) {
        // Return default cartoon bus image if no specific image is found
        return '/default-bus.svg';
    }

    // Return the full path to the image
    // Handle specific extensions for known files
    const pngBuses = ['ডি লিংক বাস', 'পল্লবী সুপার', 'শিকড় পরিবহন বাস'];
    const jpegBuses = ['বিকল্প বাস সিটি সুপার সার্ভিস'];

    if (pngBuses.includes(imageName)) {
        return `/buses-image/${imageName}.png`;
    }
    if (jpegBuses.includes(imageName)) {
        return `/buses-image/${imageName}.jpeg`;
    }

    return `/buses-image/${imageName}.jpg`;
};
