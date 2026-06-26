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
      'New Truck & Freight transport mode — book pickups, trucks, trailers across Bangladesh',
      'Real BD market rates baked in: per-km pricing, route tolls (Padma, Meghna, Bhairab), surcharges',
      'Auto road-distance calculation when both cities selected (Haversine × 1.30 road factor)',
      'Inline quote panel with full fare breakdown — Base + km × rate + tolls × 2',
      'No external redirects — call-to-book CTA shows partner hotline directly'
    ],
    bnFeatures: [
      'নতুন ট্রাক ও পণ্য পরিবহন মোড — পিকআপ, ট্রাক, ট্রেইলার সারাদেশে বুক করুন',
      'প্রকৃত বাংলাদেশি মার্কেট রেট: প্রতি-কিমি প্রাইসিং, রুট টোল (পদ্মা, মেঘনা, ভৈরব), সারচার্জ',
      'দুটি শহর বাছার সাথে সাথে স্বয়ংক্রিয় সড়ক-দূরত্ব হিসাব (Haversine × ১.৩০ সড়ক ফ্যাক্টর)',
      'ইনলাইন কোট প্যানেল — বেস + কিমি × রেট + টোল × ২ এর পূর্ণ ভাড়া ব্রেকডাউন',
      'কোনো এক্সটার্নাল রিডাইরেক্ট নেই — কল-টু-বুক CTA সরাসরি পার্টনার হটলাইন দেখায়'
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
    version: '1.2.13',
    date: '2026-06-25',
    type: 'patch',
    features: [
      'Locked canonical home title across <title>, og:title, twitter:title',
      'Per-route titles + rel=canonical on bus / train / intercity / blog detail',
      'Cloudflare Turnstile on signin / signup with server-side verification'
    ],
    bnFeatures: [
      '<title>, og:title, twitter:title-এ একক canonical হোম টাইটেল',
      'বাস / ট্রেন / আন্তঃজেলা / ব্লগ বিস্তারিত পেজে আলাদা টাইটেল + rel=canonical',
      'সাইন ইন / সাইন আপে Cloudflare Turnstile + সার্ভার-সাইড যাচাই'
    ],
    fixes: [
      'AdSense CSP — frame-src additions, aux domains, resilient fill detection',
      'SideRailAd + responsive iframe height detection',
      '/blog vs /blogs URL mismatch + orphan /advertise route'
    ],
    bnFixes: [
      'AdSense CSP — frame-src সংযোজন, aux ডোমেইন, ফিল ডিটেকশন',
      'SideRailAd ও রেসপন্সিভ iframe হাইট ডিটেকশন',
      '/blog বনাম /blogs URL মিসম্যাচ + অরফান /advertise রুট'
    ],
    improvements: [
      'Footer spans full viewport on wide screens; no dark side boxes when AdSense unfilled',
      'AdSlot placements added across all hub pages'
    ],
    bnImprovements: [
      'বড় স্ক্রিনে ফুটার পূর্ণ ভিউপোর্ট; AdSense না দেখালে পাশে অন্ধকার বক্স নেই',
      'সব হাব পেজে AdSlot যুক্ত'
    ]
  },
  {
    version: '1.2.12',
    date: '2026-06-24',
    type: 'minor',
    features: [
      'Ticket affiliate links + travel packages',
      'Native in-article + multiplex ad slots across all key pages',
      'Default language set to Bangla; selection persisted'
    ],
    bnFeatures: [
      'টিকিট অ্যাফিলিয়েট লিংক + ট্রাভেল প্যাকেজ',
      'সব মূল পেজে in-article + multiplex নেটিভ অ্যাড স্লট',
      'ডিফল্ট ভাষা বাংলা; সিলেকশন সংরক্ষিত'
    ],
    fixes: [
      'Intercity refresh loop — sessionStorage redirect pattern',
      'House ads when AdSense blocked or unfilled (later removed in 1.2.13)'
    ],
    bnFixes: [
      'আন্তঃজেলা রিফ্রেশ লুপ — sessionStorage রিডাইরেক্ট প্যাটার্ন',
      'AdSense ব্লকড/unfilled হলে house ad (পরে 1.2.13-এ সরানো)'
    ],
    improvements: [
      'Auth backend moved out of public repo; PWA precache tightened',
      'AEO / GEO / LLMO scores improved per Leadstore audit'
    ],
    bnImprovements: [
      'Auth ব্যাকএন্ড পাবলিক রেপো থেকে সরানো; PWA precache আঁটো',
      'Leadstore অডিট অনুযায়ী AEO / GEO / LLMO স্কোর উন্নয়ন'
    ]
  },
  {
    version: '1.2.11',
    date: '2026-06-22',
    type: 'minor',
    features: [
      '13 verified GoZayaan promo codes + auto-hide of expired codes',
      'Blog deal ads + table / blockquote / ordered-list rendering',
      'Massive Shohoz intercity dataset (Dhaka↔Khulna, Pabna, Bandarban, Benapole etc)',
      'Domestic flight data complete with all return routes',
      'KoyJabo Deals promo banner on all 7 transport pages'
    ],
    bnFeatures: [
      '১৩টি যাচাইকৃত GoZayaan প্রোমো + এক্সপায়ার্ড কোড স্বয়ংক্রিয় হাইড',
      'ব্লগ ডিল অ্যাড + টেবিল / উদ্ধৃতি / ক্রমিক তালিকা রেন্ডার',
      'বিশাল Shohoz আন্তঃজেলা ডেটা (ঢাকা↔খুলনা, পাবনা, বান্দরবান, বেনাপোল)',
      'অভ্যন্তরীণ ফ্লাইট ডেটা সম্পূর্ণ — সব রিটার্ন রুটসহ',
      '৭টি পরিবহন পেজে KoyJabo Deals প্রোমো ব্যানার'
    ],
    fixes: [
      'Highway emergency number → BD Highway Police (01769-693333)',
      'Route planner — find direct buses both directions',
      'Local-bus operators replaced hardcoded list with real data',
      'Train route map shown inside platform — no external redirect',
      'Footer Sign-in hidden when user already logged in'
    ],
    bnFixes: [
      'হাইওয়ে জরুরি নম্বর → বিডি হাইওয়ে পুলিশ (০১৭৬৯-৬৯৩৩৩৩)',
      'রুট প্ল্যানার — দু-দিকেই সরাসরি বাস',
      'লোকাল-বাস অপারেটরে হার্ডকোডের জায়গায় আসল ডেটা',
      'ট্রেন রুট ম্যাপ প্ল্যাটফর্মেই — বাইরে রিডাইরেক্ট নেই',
      'লগইন থাকলে ফুটারে সাইন ইন লুকানো'
    ],
    improvements: [
      'Lazy-load all screens; deferred location data',
      'Weekly auto-refresh of deals.json via GitHub Actions'
    ],
    bnImprovements: [
      'সব স্ক্রিন lazy-load; লোকেশন ডেটা defer',
      'GitHub Actions দিয়ে deals.json সাপ্তাহিক রিফ্রেশ'
    ]
  },
  {
    version: '1.2.10',
    date: '2026-06-21',
    type: 'minor',
    features: [
      'Bengali numeral support platform-wide via N() + Fare() helpers',
      'Real Bangladesh Railway eticket-scraped train data + 4 missing trains',
      'AI-generated cover images for all blog posts',
      'External platform presence + SEO/INP improvements'
    ],
    bnFeatures: [
      'প্ল্যাটফর্ম-জুড়ে N() + Fare() দিয়ে বাংলা সংখ্যা',
      'eticket.railway.gov.bd থেকে স্ক্র্যাপড ট্রেন ডেটা + ৪টি অনুপস্থিত ট্রেন',
      'সব ব্লগ পোস্টে AI-জেনারেটেড কভার ইমেজ',
      'বাহ্যিক প্ল্যাটফর্ম উপস্থিতি + SEO/INP উন্নয়ন'
    ],
    fixes: [
      'AI direction reversal when user says "I want to go X"',
      'Train direction picks outbound; mixed Bengali/English halt text cleaned',
      'Helpline modal — portal render + scroll lock + centered',
      'Bus map respects user From→To direction',
      '/intercity trailing-slash redirect + SW cache bust'
    ],
    bnFixes: [
      '"X যেতে চাই" বললে AI ডিরেকশন উল্টে যাওয়া',
      'ট্রেন ডিরেকশন আউটবাউন্ড; বাংলা/ইংরেজি মিশ্রিত হল্ট টেক্সট পরিষ্কার',
      'হেল্পলাইন মডাল — পোর্টাল রেন্ডার + স্ক্রল লক + সেন্টার',
      'বাস ম্যাপ ইউজারের From→To মেনে চলে',
      '/intercity trailing-slash রিডাইরেক্ট + SW ক্যাশ বাস্ট'
    ],
    improvements: [
      'Results only show after Search click on all transport pages',
      'Mode pills icons-only on desktop + mobile',
      'Saved routes + popular routes show real data, not demo'
    ],
    bnImprovements: [
      'সব পরিবহন পেজে Search-এ চাপ দিলেই রেজাল্ট',
      'মোড পিল ডেস্কটপ + মোবাইলে শুধু আইকন',
      'সেভড + জনপ্রিয় রুট আসল ডেটা দেখায়'
    ]
  },
  {
    version: '1.2.9',
    date: '2026-06-20',
    type: 'minor',
    features: [
      'Cloudflare Workers AI (Llama 3.3 70B) chat integration',
      'Comprehensive Bangladesh transport knowledge layer + confidence labels',
      'Location consent modal + settings toggle with real GPS detection',
      '600+ Bangladesh locations + routing-engine overhaul'
    ],
    bnFeatures: [
      'Cloudflare Workers AI (Llama 3.3 70B) চ্যাট ইন্টিগ্রেশন',
      'ব্যাপক বাংলাদেশ পরিবহন নলেজ লেয়ার + কনফিডেন্স লেবেল',
      'লোকেশন কনসেন্ট মডাল + আসল GPS ডিটেকশন সহ সেটিংস টগল',
      '৬০০+ বাংলাদেশ লোকেশন + রাউটিং-ইঞ্জিন পুনঃনির্মাণ'
    ],
    fixes: [
      'Route direction reversal + direct routes shown first',
      'TopBar / ProfilePage real user avatar',
      'Wrap app in AuthProvider to resolve useAuth crash',
      'LaunchPage + FlightsPage use real data files'
    ],
    bnFixes: [
      'রুট ডিরেকশন উল্টানো + সরাসরি রুট আগে',
      'TopBar / ProfilePage-এ আসল ইউজার অবতার',
      'AuthProvider দিয়ে অ্যাপ র‍্যাপ — useAuth ক্র্যাশ সমাধান',
      'LaunchPage + FlightsPage আসল ডেটা ফাইল'
    ],
    improvements: [
      'Better route section spacing + smarter Workers AI system prompt',
      'Animated metro train running on Metro Live strip (no layout jump)'
    ],
    bnImprovements: [
      'রুট সেকশনে ভালো স্পেসিং + Workers AI সিস্টেম প্রম্পট',
      'মেট্রো লাইভ স্ট্রিপে অ্যানিমেটেড ট্রেন (লেআউট জাম্প নেই)'
    ]
  },
  {
    version: '1.2.8',
    date: '2026-06-19',
    type: 'minor',
    features: [
      'KoyCoins reward system',
      'Flight detail page',
      'Transit planner — suggests transit routes for bus search'
    ],
    bnFeatures: [
      'KoyCoins রিওয়ার্ড সিস্টেম',
      'ফ্লাইট বিস্তারিত পেজ',
      'ট্রানজিট প্ল্যানার — বাস সার্চে ট্রানজিট রুট সুপারিশ'
    ],
    fixes: [
      'BRTA bus info + guarded searches',
      'Removed fake home labels + restored real map / review styling',
      'Added DMTCL metro data + live bus map'
    ],
    bnFixes: [
      'BRTA বাসের তথ্য + সুরক্ষিত সার্চ',
      'ভুয়া হোম লেবেল সরানো + আসল ম্যাপ / রিভিউ স্টাইল ফিরে',
      'DMTCL মেট্রো ডেটা + লাইভ বাস ম্যাপ'
    ],
    improvements: [
      'Official travel source panels added'
    ],
    bnImprovements: [
      'অফিসিয়াল ট্রাভেল সোর্স প্যানেল যুক্ত'
    ]
  },
  {
    version: '1.2.7',
    date: '2026-06-18',
    type: 'major',
    features: [
      'Full KoyJabo redesign shipped to dev',
      'Auth required across account forms',
      'Mobile offline community flow'
    ],
    bnFeatures: [
      'সম্পূর্ণ KoyJabo রিডিজাইন dev-এ ',
      'অ্যাকাউন্ট ফর্মে auth বাধ্যতামূলক',
      'মোবাইল অফলাইন কমিউনিটি ফ্লো'
    ],
    fixes: [
      'Settings auth + home polish',
      'Hardened ads-auth + community modals',
      'Removed fake redesign UI data; real KoyJabo data surfaces'
    ],
    bnFixes: [
      'সেটিংস auth + হোম পরিমার্জন',
      'অ্যাড auth + কমিউনিটি মডাল hardened',
      'ভুয়া রিডিজাইন UI ডেটা সরানো; আসল KoyJabo ডেটা'
    ],
    improvements: [
      'Polish redesign page flows; finish redesign ads and route polish'
    ],
    bnImprovements: [
      'রিডিজাইন পেজ ফ্লো পরিমার্জন; অ্যাড ও রুট পরিমার্জন সম্পন্ন'
    ]
  },
  {
    version: '1.2.6',
    date: '2026-06-16',
    type: 'patch',
    features: [
      'BRTA April 2026 fare update for local + intercity buses',
      'Real GPS-based fare / duration / distance data on local bus'
    ],
    bnFeatures: [
      'লোকাল + আন্তঃজেলা বাসে BRTA এপ্রিল ২০২৬ ভাড়া',
      'লোকাল বাসে আসল GPS-ভিত্তিক ভাড়া / সময় / দূরত্ব'
    ],
    fixes: [
      'Train page full-width on mobile; search validation',
      'Footer overlap on install app page (mobile)',
      'Blog post URL routing on direct navigation',
      'All TypeScript errors resolved'
    ],
    bnFixes: [
      'মোবাইলে ট্রেন পেজ পূর্ণ-প্রস্থ; সার্চ যাচাই',
      'ইনস্টল অ্যাপ পেজে ফুটার ওভারল্যাপ (মোবাইল)',
      'সরাসরি ব্লগ URL রাউটিং',
      'সব TypeScript ত্রুটি সমাধান'
    ],
    improvements: [
      'Removed live chat / hotline / GitHub issues from Contact page'
    ],
    bnImprovements: [
      'কন্টাক্ট পেজ থেকে লাইভ চ্যাট / হটলাইন / GitHub issues সরানো'
    ]
  },
  {
    version: '1.2.5',
    date: '2026-06-15',
    type: 'minor',
    features: [
      'Transit routing launch + Metro real-schedule info',
      'HowKoyJaboHelps section added on About / FAQ / WhyUse',
      'LaunchHub rebuilt with functional search and full details page'
    ],
    bnFeatures: [
      'ট্রানজিট রাউটিং চালু + মেট্রো আসল সময়সূচি',
      'About / FAQ / WhyUse-এ HowKoyJaboHelps যুক্ত',
      'LaunchHub পুনঃনির্মাণ — কার্যকরী সার্চ ও বিস্তারিত পেজ'
    ],
    fixes: [
      'NaN fares; Metro full ticket pages; train search with auto-location',
      'Footer width on legal pages',
      'History rideshare; mobile nav tabs; ads header displacement'
    ],
    bnFixes: [
      'NaN ভাড়া; মেট্রো পূর্ণ টিকেট পেজ; অটো-লোকেশন সহ ট্রেন সার্চ',
      'লিগ্যাল পেজে ফুটার প্রস্থ',
      'হিস্টরি রাইডশেয়ার; মোবাইল নেভ ট্যাব; অ্যাড হেডার বিচ্যুতি'
    ],
    improvements: [
      'Native-looking ad cards on legal pages',
      'Real intercity data; MRT ticket details'
    ],
    bnImprovements: [
      'লিগ্যাল পেজে নেটিভ-স্টাইল অ্যাড কার্ড',
      'আসল আন্তঃজেলা ডেটা; MRT টিকেট বিস্তারিত'
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
