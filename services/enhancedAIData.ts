/**
 * Enhanced Data Repository for AI Assistant
 * This file contains comprehensive, regularly updated data for intelligent responses
 */

// Comprehensive fare information
export const FARE_DATA = {
    bus: {
        dhaka: {
            minimumFare: 10,
            ratePerKm: 2.53,
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
        brtcHelpline: '02-9133973',
        electionCommission: '02-9898989'
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
    electionRestrictions: {
        date: 'February 12, 2026',
        event: '13th National Parliamentary Election and Referendum',
        vehicleRestrictions: {
            taxi: {
                bn: 'ট্যাক্সি',
                start: 'February 11, 2026 12:00 AM',
                end: 'February 12, 2026 12:00 AM',
                duration: '24 hours'
            },
            pickup: {
                bn: 'পিকআপ',
                start: 'February 11, 2026 12:00 AM',
                end: 'February 12, 2026 12:00 AM',
                duration: '24 hours'
            },
            microbus: {
                bn: 'মাইক্রোবাস',
                start: 'February 11, 2026 12:00 AM',
                end: 'February 12, 2026 12:00 AM',
                duration: '24 hours'
            },
            truck: {
                bn: 'ট্রাক',
                start: 'February 11, 2026 12:00 AM',
                end: 'February 12, 2026 12:00 AM',
                duration: '24 hours'
            },
            motorcycle: {
                bn: 'মোটরসাইকেল',
                start: 'February 10, 2026 12:00 AM',
                end: 'February 13, 2026 12:00 AM',
                duration: '72 hours'
            },
            watercraft: {
                bn: 'নৌযান',
                start: 'February 11, 2026 12:00 AM',
                end: 'February 12, 2026 12:00 AM',
                duration: '24 hours',
                note: 'Except fixed route vessels'
            }
        },
        exemptions: {
            en: [
                'Law enforcement and armed forces',
                'Administration officials and approved election observers',
                'Emergency services (ambulances, fire services)',
                'Vehicles transporting medicines, health supplies, and newspapers',
                'Airport transport with valid tickets/proof',
                'Long-distance passenger vehicles',
                'One vehicle per candidate and election agent (with EC sticker)',
                'Journalists and observers with EC approval',
                'Election duty officials',
                'Telecom operators licensed by BTRC'
            ],
            bn: [
                'আইন প্রয়োগকারী সংস্থা এবং সশস্ত্র বাহিনী',
                'প্রশাসনিক কর্মকর্তা এবং অনুমোদিত নির্বাচন পর্যবেক্ষক',
                'জরুরি সেবা (অ্যাম্বুলেন্স, ফায়ার সার্ভিস)',
                'ওষুধ, স্বাস্থ্য সরবরাহ এবং সংবাদপত্র পরিবহনকারী যানবাহন',
                'বৈধ টিকিট/প্রমাণসহ বিমানবন্দর পরিবহন',
                'দূরপাল্লার যাত্রীবাহী যানবাহন',
                'প্রার্থী ও নির্বাচন এজেন্টের জন্য একটি যানবাহন (ইসি স্টিকার সহ)',
                'ইসি অনুমোদন সহ সাংবাদিক এবং পর্যবেক্ষক',
                'নির্বাচনী দায়িত্বরত কর্মকর্তা',
                'বিটিআরসি লাইসেন্সপ্রাপ্ত টেলিকম অপারেটর'
            ]
        },
        announcement: {
            en: '🗳️ **ELECTION ALERT:** Bangladesh Election Commission has imposed vehicle restrictions for the 13th National Parliamentary Election on February 12, 2026. Taxis, pickups, microbuses, and trucks will be restricted from 12 AM Feb 11 to 12 AM Feb 12. Motorcycles from 12 AM Feb 10 to 12 AM Feb 13. Plan your travel accordingly.',
            bn: '🗳️ **নির্বাচন সতর্কতা:** বাংলাদেশ নির্বাচন কমিশন ১২ফেব্রুয়ারি ২০২৬ তারিখে অনুষ্ঠিতব্য ১৩তম জাতীয় সংসদ নির্বাচনের জন্য যানবাহনের উপর বিধিনিষেধ আরোপ করেছে। ট্যাক্সি, পিকআপ, মাইক্রোবাস এবং ট্রাক ১১ ফেব্রুয়ারি রাত ১২টা থেকে ১২ ফেব্রুয়ারি রাত ১২টা পর্যন্ত নিষিদ্ধ থাকবে। মোটরসাইকেল ১০ ফেব্রুয়ারি রাত ১২টা থেকে ১৩ ফেব্রুয়ারি রাত ১২টা পর্যন্ত। সেই অনুযায়ী আপনার ভ্রমণ পরিকল্পনা করুন।'
        },
        source: 'Bangladesh Election Commission Official Announcement',
        lastUpdated: 'February 2, 2026'
    },
    safetyTips: [
        'Keep valuables secure',
        'Avoid overcrowded buses late at night',
        'Use registered taxis/rideshares',
        'Keep emergency numbers handy',
        'Inform someone of your travel plans',
        'Check for election-related transport restrictions before traveling'
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

// Metro Rail Detailed Schedule Data
export const METRO_RAIL_SCHEDULE = {
    weekday: {
        uttaraNorthToMotijheel: {
            firstTrain: '06:30',
            lastTrain: '21:30',
            schedule: [
                { from: '06:30', to: '07:10', headway: 20 },
                { from: '07:11', to: '07:30', headway: 10 },
                { from: '07:31', to: '08:10', headway: 8 },
                { from: '08:11', to: '10:52', headway: 6 },
                { from: '10:53', to: '16:20', headway: 8 },
                { from: '16:21', to: '19:14', headway: 6 },
                { from: '19:15', to: '20:00', headway: 8 },
                { from: '20:01', to: '21:00', headway: 10 },
                { from: '21:01', to: '21:30', headway: 15 }
            ]
        },
        motijheelToUttaraNorth: {
            firstTrain: '07:15',
            lastTrain: '22:10',
            schedule: [
                { from: '07:15', to: '07:30', headway: 15 },
                { from: '07:31', to: '08:10', headway: 10 },
                { from: '08:11', to: '08:49', headway: 8 },
                { from: '08:50', to: '11:31', headway: 6 },
                { from: '11:32', to: '16:58', headway: 8 },
                { from: '16:59', to: '19:52', headway: 6 },
                { from: '19:53', to: '20:39', headway: 8 },
                { from: '20:40', to: '21:40', headway: 10 },
                { from: '21:41', to: '22:10', headway: 15 }
            ]
        }
    },
    saturdayAndHolidays: {
        uttaraNorthToMotijheel: {
            firstTrain: '06:30',
            lastTrain: '21:30',
            schedule: [
                { from: '06:30', to: '07:10', headway: 20 },
                { from: '07:11', to: '07:25', headway: 15 },
                { from: '07:26', to: '10:37', headway: 12 },
                { from: '10:38', to: '21:00', headway: 10 },
                { from: '21:01', to: '21:30', headway: 15 }
            ]
        },
        motijheelToUttaraNorth: {
            firstTrain: '07:15',
            lastTrain: '22:10',
            schedule: [
                { from: '07:15', to: '07:30', headway: 15 },
                { from: '07:31', to: '11:17', headway: 12 },
                { from: '11:18', to: '21:40', headway: 8 },
                { from: '21:41', to: '22:10', headway: 15 }
            ]
        }
    },
    friday: {
        uttaraNorthToMotijheel: {
            firstTrain: '15:00',
            lastTrain: '21:00',
            schedule: [
                { from: '15:00', to: '21:00', headway: 10 }
            ]
        },
        motijheelToUttaraNorth: {
            firstTrain: '15:20',
            lastTrain: '21:40',
            schedule: [
                { from: '15:20', to: '21:40', headway: 10 }
            ]
        }
    },
    ticketInformation: {
        weekdayTicketSales: {
            start: '06:40',
            end: '21:20',
            services: ['Single Journey Ticket', 'MRT/Rapid Pass Top-up']
        },
        fridayTicketSales: {
            uttaraNorth: {
                start: '14:45',
                end: '20:50',
                services: ['Single Journey Ticket', 'Rapid Pass Purchase', 'MRT/Rapid Pass Top-up']
            },
            motijheel: {
                start: '15:05',
                end: '20:50',
                services: ['Single Journey Ticket', 'Rapid Pass Purchase', 'MRT/Rapid Pass Top-up']
            }
        },
        closureTime: '21:20',
        note: 'All ticket counters and vending machines close after 21:20'
    }
};

// Common questions and smart answers
export const FAQ_DATABASE = {
    'metro timing': {
        en: `🚇 **Metro Rail Schedule**

📅 **WEEKDAY Schedule (Saturday-Thursday)**

🔵 **Uttara North → Motijheel**
- First Train: 6:30 AM
- Last Train: 9:30 PM
- Peak Hours (7:31-8:10 AM & 4:21-7:14 PM): Every 6-8 minutes
- Off-Peak: Every 10-20 minutes

🔵 **Motijheel → Uttara North**
- First Train: 7:15 AM
- Last Train: 10:10 PM
- Peak Hours (8:11-8:49 AM & 4:59-7:52 PM): Every 6-8 minutes
- Off-Peak: Every 10-15 minutes

📅 **SATURDAY & HOLIDAYS Schedule**

🔵 **Uttara North → Motijheel**
- First Train: 6:30 AM
- Last Train: 9:30 PM
- Frequency: Every 10-20 minutes

🔵 **Motijheel → Uttara North**
- First Train: 7:15 AM
- Last Train: 10:10 PM
- Frequency: Every 8-15 minutes

📅 **FRIDAY Schedule**

🔵 **Uttara North → Motijheel**
- First Train: 3:00 PM
- Last Train: 9:00 PM
- Frequency: Every 10 minutes

🔵 **Motijheel → Uttara North**
- First Train: 3:20 PM
- Last Train: 9:40 PM
- Frequency: Every 10 minutes

🎫 **Ticket Purchase Times:**
- Weekdays: 6:40 AM - 9:20 PM
- Friday: 2:45 PM - 8:50 PM
- All counters close after 9:20 PM`,

        bn: `🚇 **মেট্রোরেল সময়সূচী**

📅 **সাপ্তাহিক কর্মদিবসের সময়সূচী (শনিবার-বৃহস্পতিবার)**

🔵 **উত্তরা উত্তর → মতিঝিল**
- প্রথম ট্রেন: সকাল ০৬:৩০ ঘটিকা
- সর্বশেষ ট্রেন: রাত ০৯:৩০ ঘটিকা
- পিক আওয়ার (সকাল ৭:৩১-৮:১০ ও বিকাল ৪:২১-সন্ধ্যা ৭:১৪): প্রতি ৬-৮ মিনিট
- অফ-পিক: প্রতি ১০-২০ মিনিট

🔵 **মতিঝিল → উত্তরা উত্তর**
- প্রথম ট্রেন: সকাল ০৭:১৫ ঘটিকা
- সর্বশেষ ট্রেন: রাত ১০:১০ ঘটিকা
- পিক আওয়ার (সকাল ৮:১১-৮:৪৯ ও বিকাল ৪:৫৯-সন্ধ্যা ৭:৫২): প্রতি ৬-৮ মিনিট
- অফ-পিক: প্রতি ১০-১৫ মিনিট

📅 **শনিবার ও অন্যান্য সকল সরকারী ছুটির দিনের সময়সূচী**

🔵 **উত্তরা উত্তর → মতিঝিল**
- প্রথম ট্রেন: সকাল ০৬:৩০ ঘটিকা
- সর্বশেষ ট্রেন: রাত ০৯:৩০ ঘটিকা
- হেডওয়ে: প্রতি ১০-২০ মিনিট

🔵 **মতিঝিল → উত্তরা উত্তর**
- প্রথম ট্রেন: সকাল ০৭:১৫ ঘটিকা
- সর্বশেষ ট্রেন: রাত ১০:১০ ঘটিকা
- হেডওয়ে: প্রতি ৮-১৫ মিনিট

📅 **শুক্রবারের সময়সূচী**

🔵 **উত্তরা উত্তর → মতিঝিল**
- প্রথম ট্রেন: দুপুর ০৩:০০ ঘটিকা
- সর্বশেষ ট্রেন: রাত ০৯:০০ ঘটিকা
- হেডওয়ে: প্রতি ১০ মিনিট

🔵 **মতিঝিল → উত্তরা উত্তর**
- প্রথম ট্রেন: দুপুর ০৩:২০ মিনিট
- সর্বশেষ ট্রেন: রাত ০৯:৪০ মিনিট
- হেডওয়ে: প্রতি ১০ মিনিট

🎫 **টিকিট ক্রয়ের সময়:**
- সাপ্তাহিক কর্মদিবস: সকাল ০৬:৪০ - রাত ০৯:২০
- শুক্রবার: বিকাল ০২:৪৫ - রাত ০৮:৫০
- রাত ০৯:২০ এর পর সকল টিকিট বিক্রয় অফিস বন্ধ

📝 **বিশেষ নোট:**
শুক্রবার ব্যতিত অন্যান্য দিন সকাল ০৬:৪০ থেকে রাত ০৯:২০ পর্যন্ত Single Journey Ticket ক্রয় ও MRT/Rapid Pass Top up করা যাবে। উত্তরা উত্তর স্টেশন থেকে শুক্রবার বিকাল ০২:৪৫ মিনিট হতে এবং মতিঝিল স্টেশন হতে শুক্রবার বিকাল ০৩:০৫ মিনিট হতে টিকিট ক্রয় ও Rapid Pass ক্রয় করা যাবে।`
    },
    'bus fare': {
        en: '💰 **Bus Fare Calculation:**\n- Minimum fare: ৳10\n- Rate: ৳2.53 per km\n- AC buses: 2-3x regular fare\n- Average short trip: ৳20-30\n- Average long trip: ৳40-60',
        bn: '💰 **বাস ভাড়া হিসাব:**\n- সর্বনিম্ন ভাড়া: ৳১০\n- রেট: প্রতি কিমি ৳২.৫৩\n- এসি বাস: নিয়মিত ভাড়ার ২-৩ গুণ\n- গড় ছোট ট্রিপ: ৳২০-৩০\n- গড় লম্বা ট্রিপ: ৳৪০-৬০'
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
    ONLINE_DATA_SOURCES,
    METRO_RAIL_SCHEDULE
};
