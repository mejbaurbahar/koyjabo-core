export interface ReleaseNote {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  features: string[];
  bnFeatures: string[];
  fixes: string[];
  bnFixes: string[];
  improvements: string[];
  bnImprovements: string[];
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '1.3.0',
    date: '2026-06-26',
    type: 'minor',
    features: [
      'New Truck & Freight transport mode — book pickups, trucks, trailers via Lalamove and TruckLagbe',
      'Real BD market rates baked in: per-km pricing, route tolls (Padma, Meghna, Bhairab), surcharges',
      'Auto road-distance calculation when both cities selected (Haversine × 1.30 road factor)',
      'Inline quote panel with full fare breakdown — Base + km × rate + tolls × 2',
      'No external redirects — call-to-book CTA shows TruckLagbe hotline directly'
    ],
    bnFeatures: [
      'নতুন ট্রাক ও পণ্য পরিবহন মোড — লালামুভ ও ট্রাকলাগবে-এর মাধ্যমে পিকআপ, ট্রাক, ট্রেইলার বুক করুন',
      'প্রকৃত বাংলাদেশি মার্কেট রেট: প্রতি-কিমি প্রাইসিং, রুট টোল (পদ্মা, মেঘনা, ভৈরব), সারচার্জ',
      'দুটি শহর বাছার সাথে সাথে স্বয়ংক্রিয় সড়ক-দূরত্ব হিসাব (Haversine × ১.৩০ সড়ক ফ্যাক্টর)',
      'ইনলাইন কোট প্যানেল — বেস + কিমি × রেট + টোল × ২ এর পূর্ণ ভাড়া ব্রেকডাউন',
      'কোনো এক্সটার্নাল রিডাইরেক্ট নেই — কল-টু-বুক CTA সরাসরি ট্রাকলাগবে হটলাইন দেখায়'
    ],
    fixes: [
      'Quote panel now scrolls into view when "Get Quote" tapped from scrolled-down state'
    ],
    bnFixes: [
      'স্ক্রল-ডাউন অবস্থা থেকে "Get Quote" চাপলে কোট প্যানেল এখন স্বয়ংক্রিয়ভাবে দৃশ্যে আসে'
    ],
    improvements: [
      'TruckPage gets 3 ad slots (in-article, sidebar mid-rect, bottom leaderboard) matching other hubs',
      'PWA cache bumped to v52 — fresh truck assets served immediately'
    ],
    bnImprovements: [
      'অন্যান্য হাবের সাথে মিল রেখে ট্রাকপেজে ৩টি অ্যাড স্লট (ইন-আর্টিকেল, সাইডবার, লিডারবোর্ড)',
      'PWA ক্যাশে v52-এ আপগ্রেড — নতুন ট্রাক অ্যাসেট সাথে সাথে লোড হয়'
    ]
  },
  {
    version: '1.2.0',
    date: '2026-04-30',
    type: 'minor',
    features: [
      'New AI-Driven Traffic Awareness Blog Post',
      'Global Multi-language Notification System (Toasts)',
      'Enhanced Community Gallery with instant deletion feedback'
    ],
    bnFeatures: [
      'নতুন AI-ভিত্তিক ট্রাফিক সচেতনতা বিষয়ক ব্লগ পোস্ট',
      'গ্লোবাল বহুভাষিক নোটিফিকেশন সিস্টেম (Toasts)',
      'উন্নত কমিউনিটি গ্যালারি ও তাৎক্ষণিক ডিলিট ফিডব্যাক'
    ],
    fixes: [
      'Resolved image deletion errors on specific browsers',
      'Fixed path resolution issues in build environment',
      'Standardized success messages across all forms'
    ],
    bnFixes: [
      'নির্দিষ্ট ব্রাউজারে ইমেজ ডিলিট করার সমস্যা সমাধান',
      'বিল্ড এনভায়রনমেন্টে পাথ রেজোলিউশন সমস্যা সমাধান',
      'সব ফর্মের জন্য একই মানের সাকসেস মেসেজ নিশ্চিতকরণ'
    ],
    improvements: [
      'Better mobile responsiveness for notification toasts',
      'Optimized image loading in blog sections',
      'Improved cross-language consistency for UI labels'
    ],
    bnImprovements: [
      'মোবাইল ডিভাইসে নোটিফিকেশন টোস্টের উন্নত রেসপন্সিভনেস',
      'ব্লগ সেকশনে ইমেজ লোডিং অপ্টিমাইজেশন',
      'ইউজার ইন্টারফেস লেবেলে ভাষার উন্নত সামঞ্জস্য'
    ]
  },
  {
    version: '1.1.5',
    date: '2026-04-28',
    type: 'patch',
    features: [
      'Integrated Train Photo Gallery',
      'Added Bus & Train ratings system'
    ],
    bnFeatures: [
      'ট্রেন ফটো গ্যালারি যুক্ত করা হয়েছে',
      'বাস ও ট্রেনের জন্য রেটিং সিস্টেম যুক্ত করা হয়েছে'
    ],
    fixes: [
      'Fixed minor UI glitches in mobile navigation',
      'Resolved search result duplication in intercity guide'
    ],
    bnFixes: [
      'মোবাইল নেভিগেশনে ছোটখাটো ইউআই সমস্যা সমাধান',
      'আন্তঃনগর গাইডে সার্চ রেজাল্ট ডুপ্লিকেট হওয়া সমাধান'
    ],
    improvements: [
      'Updated 64 district transport guides with better landmarks',
      'Enhanced search speed for bus routes'
    ],
    bnImprovements: [
      '৬৪ জেলার ট্রান্সপোর্ট গাইডে নতুন ল্যান্ডমার্ক যুক্ত করা হয়েছে',
      'বাস রুট খোঁজার গতি বৃদ্ধি করা হয়েছে'
    ]
  }
];
