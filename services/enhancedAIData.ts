/**
 * Enhanced Data Repository for AI Assistant
 * This file contains comprehensive, regularly updated data for intelligent responses
 */

// Comprehensive fare information
export const FARE_DATA = {
    bus: {
        dhaka: {
            minimumFare: 10,
            ratePerKm: 2.42,
            acBusMultiplier: 2.5,
            luxuryMultiplier: 3,
            averageShortTrip: 20,
            averageLongTrip: 40
        },
        intercity: {
            minimumFare: 100,
            economyRatePerKm: 1.8,
            businessClassMultiplier: 1.5,
            acMultiplier: 2
        }
    },
    metro: {
        minimumFare: 20,
        maximumFare: 100,
        ratePerKm: 5,
        fareTiers: [20, 30, 40, 50, 60, 70, 80, 90, 100]
    },
    train: {
        classes: {
            'Shovan': { baseRate: 0.8, multiplier: 1 },
            'Shovan Chair': { baseRate: 1.2, multiplier: 1.5 },
            'First Class': { baseRate: 1.5, multiplier: 1.8 },
            'AC Chair': { baseRate: 2, multiplier: 2.2 },
            'AC Berth': { baseRate: 2.5, multiplier: 2.8 },
            'Snigdha': { baseRate: 2.2, multiplier: 2.5 }
        }
    }
};

// Traffic patterns and timing
export const TRAFFIC_PATTERNS = {
    dhaka: {
        peakHours: {
            morning: { start: '8:00', end: '10:30', congestion: 'heavy', delayFactor: 2 },
            evening: { start: '17:00', end: '20:30', congestion: 'very heavy', delayFactor: 2.5 }
        },
        offPeakHours: {
            morning: { start: '6:00', end: '8:00', congestion: 'moderate', delayFactor: 1 },
            midday: { start: '10:30', end: '17:00', congestion: 'light', delayFactor: 1.2 },
            night: { start: '21:00', end: '23:30', congestion: 'very light', delayFactor: 0.8 }
        },
        specialDays: {
            friday: { congestion: 'light', note: 'Metro closed, fewer buses' },
            thursday: { congestion: 'heavy', note: 'Weekly market day' },
            hartals: { congestion: 'minimal', note: 'Limited public transport' }
        }
    }
};

// Enhanced bus types and features
export const BUS_TYPES = {
    'AC': {
        fullName: 'Air Conditioned Bus',
        bnName: 'এসি বাস',
        features: ['AC', 'Comfortable seats', 'WiFi (some)', 'Cleaner'],
        avgFare: '50-100',
        comfort: 5
    },
    'Sitting': {
        fullName: 'Sitting Service',
        bnName: 'সিটিং সার্ভিস',
        features: ['Reserved seats', 'No standing', 'Moderate comfort'],
        avgFare: '30-60',
        comfort: 4
    },
    'Semi-Sitting': {
        fullName: 'Semi-Sitting Service',
        bnName: 'সেমি-সিটিং',
        features: ['Some standing allowed', 'Affordable'],
        avgFare: '20-40',
        comfort: 3
    },
    'Local': {
        fullName: 'Local Service',
        bnName: 'লোকাল সার্ভিস',
        features: ['Frequent stops', 'Standing allowed', 'Most affordable'],
        avgFare: '10-30',
        comfort: 2
    },
    'Double-Decker': {
        fullName: 'Double Decker Bus',
        bnName: 'ডাবল ডেকার বাস',
        features: ['Two floors', 'Great view from top', 'Spacious'],
        avgFare: '30-50',
        comfort: 4
    },
    'Metro Shuttle': {
        fullName: 'Metro Shuttle Bus',
        bnName: 'মেট্রো শাটল বাস',
        features: ['Connects to Metro stations', 'Frequent service'],
        avgFare: '20-40',
        comfort: 3
    }
};

// Popular routes with detailed information
export const POPULAR_ROUTES = {
    dhaka: [
        {
            name: 'Uttara to Motijheel',
            bnName: 'উত্তরা থেকে মতিঝিল',
            distance: 25,
            options: [
                { type: 'Metro', time: '40 min', fare: '100', frequency: 'Every 10 min' },
                { type: 'Bus', time: '90-120 min', fare: '30-50', frequency: 'Every 5 min' }
            ],
            tips: 'Metro is fastest during peak hours'
        },
        {
            name: 'Gabtoli to Mohakhali',
            bnName: 'গাবতলী থেকে মহাখালী',
            distance: 18,
            options: [
                { type: 'Bus', time: '45-70 min', fare: '25-40', frequency: 'Every 3 min' }
            ],
            tips: 'Very busy route, use Ring Road buses for faster travel'
        }
    ]
};

// Seasonal travel information
export const SEASONAL_INFO = {
    summer: {
        months: ['April', 'May', 'June', 'July', 'August'],
        considerations: [
            'Carry water and sunscreen',
            'Avoid midday travel (12 PM - 3 PM)',
            'AC buses recommended',
            'Rain possibility in monsoon (June-August)'
        ],
        bestDestinations: ['Bandarban', 'Rangamati', 'Cox\'s Bazar (less crowded)']
    },
    winter: {
        months: ['November', 'December', 'January', 'February'],
        considerations: [
            'Best time for beach destinations',
            'Pleasant weather for sightseeing',
            'Peak tourist season - book in advance',
            'Bring light jacket for evenings'
        ],
        bestDestinations: ['Cox\'s Bazar', 'Saint Martin', 'Sundarbans', 'Kuakata']
    },
    monsoon: {
        months: ['June', 'July', 'August', 'September'],
        considerations: [
            'Heavy rain expected',
            'Road conditions may deteriorate',
            'Some areas flood-prone',
            'Ratargul swamp forest best in this season'
        ],
        bestDestinations: ['Ratargul', 'Sylhet tea gardens', 'Srimangal']
    }
};

// Emergency and safety information
export const EMERGENCY_INFO = {
    numbers: {
        police: '999',
        ambulance: '999',
        fire: '999',
        trafficPolice: '09611140000',
        railway: '09617016101',
        brtcHelpline: '02-9133973'
    },
    hospitals: {
        dhaka: [
            'Dhaka Medical College Hospital',
            'Square Hospital',
            'United Hospital',
            'Lab Aid Hospital',
            'Apollo Hospital'
        ]
    },
    safetyTips: [
        'Keep valuables secure',
        'Avoid overcrowded buses late at night',
        'Use registered taxis/rideshares',
        'Keep emergency numbers handy',
        'Inform someone of your travel plans'
    ]
};

// Tips and tricks for better travel
export const TRAVEL_TIPS = {
    general: {
        en: [
            'Download offline maps before traveling',
            'Keep small change for bus fare',
            'Peak hours: 8-10 AM, 5-8 PM - expect delays',
            'Metro is fastest for Uttara-Motijheel route',
            'Night buses are cheaper but less frequent',
            'Book intercity tickets 2-3 days in advance',
            'Friday has less traffic (Metro closed)',
            'Avoid traveling during hartals if possible'
        ],
        bn: [
            'ভ্রমণের আগে অফলাইন ম্যাপ ডাউনলোড করুন',
            'বাস ভাড়ার জন্য খুচরা টাকা রাখুন',
            'পিক আওয়ার: সকাল ৮-১০ টা, সন্ধ্যা ৫-৮ টা - বিলম্ব আশা করুন',
            'উত্তরা-মতিঝিল রুটে মেট্রো দ্রুততম',
            'রাতের বাস সস্তা কিন্তু কম পাওয়া যায়',
            'আন্তঃজেলা টিকিট ২-৩ দিন আগে বুক করুন',
            'শুক্রবার কম ট্রাফিক (মেট্রো বন্ধ)',
            'সম্ভব হলে হরতালের সময় ভ্রমণ এড়িয়ে চলুন'
        ]
    },
    intercity: {
        en: [
            'Book online for better prices and guaranteed seats',
            'Green Line, Hanif, Shyamoli are most reliable',
            'Night buses for long distances (Cox\'s Bazar, Sylhet)',
            'Train is slower but more comfortable than bus',
            'Check weather before hill area travel',
            'Carry ID for train/bus booking',
            'Keep printed tickets as backup'
        ],
        bn: [
            'ভালো দাম এবং নিশ্চিত সিটের জন্য অনলাইনে বুক করুন',
            'গ্রীন লাইন, হানিফ, শ্যামলী সবচেয়ে নির্ভরযোগ্য',
            'দূরত্বের জন্য রাতের বাস (কক্সবাজার, সিলেট)',
            'ট্রেন বাসের চেয়ে ধীর কিন্তু আরামদায়ক',
            'পাহাড়ি এলাকায় ভ্রমণের আগে আবহাওয়া চেক করুন',
            'ট্রেন/বাস বুকিংয়ের জন্য আইডি নিয়ে যান',
            'ব্যাকআপ হিসেবে প্রিন্টেড টিকিট রাখুন'
        ]
    }
};

// Common questions and smart answers
export const FAQ_DATABASE = {
    'metro timing': {
        en: '🚇 **Metro Rail Timing:**\n- Weekdays: 7:10 AM - 8:40 PM\n- Friday: CLOSED\n- Frequency: Every 10-15 minutes\n- First train from Uttara North: 7:10 AM\n- Last train from Motijheel: 8:40 PM',
        bn: '🚇 **মেট্রোরেল সময়সূচী:**\n- সপ্তাহের দিন: সকাল ৭:১০ - রাত ৮:৪০\n- শুক্রবার: বন্ধ\n- ফ্রিকোয়েন্সি: প্রতি ১০-১৫ মিনিটে\n- উত্তরা উত্তর থেকে প্রথম ট্রেন: সকাল ৭:১০\n- মতিঝিল থেকে শেষ ট্রেন: রাত ৮:৪০'
    },
    'bus fare': {
        en: '💰 **Bus Fare Calculation:**\n- Minimum fare: ৳10\n- Rate: ৳2.42 per km\n- AC buses: 2-3x regular fare\n- Average short trip: ৳20-30\n- Average long trip: ৳40-60',
        bn: '💰 **বাস ভাড়া হিসাব:**\n- সর্বনিম্ন ভাড়া: ৳১০\n- রেট: প্রতি কিমি ৳২.৪২\n- এসি বাস: নিয়মিত ভাড়ার ২-৩ গুণ\n- গড় ছোট ট্রিপ: ৳২০-৩০\n- গড় লম্বা ট্রিপ: ৳৪০-৬০'
    },
    'best time to travel': {
        en: '⏰ **Best Time to Travel in Dhaka:**\n- Avoid: 8-10 AM, 5-8 PM (peak hours)\n- Best: 10:30 AM - 4 PM (less traffic)\n- Night: After 9 PM (very light traffic)\n- Friday: Less traffic overall (Metro closed)\n- Saturday & Sunday: Moderate traffic',
        bn: '⏰ **ঢাকায় ভ্রমণের সেরা সময়:**\n- এড়িয়ে চলুন: সকাল ৮-১০, সন্ধ্যা ৫-৮ (পিক আওয়ার)\n- সেরা: সকাল ১০:৩০ - বিকাল ৪টা (কম ট্রাফিক)\n- রাত: রাত ৯টার পর (খুবই কম ট্রাফিক)\n- শুক্রবার: সামগ্রিকভাবে কম ট্রাফিক (মেট্রো বন্ধ)\n- শনি ও রবিবার: মাঝারি ট্রাফিক'
    }
};

// Integration with online data sources (when available)
export const ONLINE_DATA_SOURCES = {
    weather: 'https://api.open-meteo.com/v1/forecast',
    traffic: {
        url: 'https://maps.googleapis.com/maps/api/directions/json',
        fallback: 'Use traffic patterns from TRAFFIC_PATTERNS'
    },
    news: {
        url: 'https://api.newsapi.org/v2/everything',
        topics: ['bangladesh transport', 'dhaka metro', 'road closure', 'hartal']
    }
};

export default {
    FARE_DATA,
    TRAFFIC_PATTERNS,
    BUS_TYPES,
    POPULAR_ROUTES,
    SEASONAL_INFO,
    EMERGENCY_INFO,
    TRAVEL_TIPS,
    FAQ_DATABASE,
    ONLINE_DATA_SOURCES
};
