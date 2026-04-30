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
