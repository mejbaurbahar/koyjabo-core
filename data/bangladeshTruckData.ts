// Bangladesh truck / freight booking data
// Sources scraped 2026-06-26:
//   - https://www.lalamove.com/bn/  (Lalamove BD — on-demand intra-city)
//   - https://trucklagbe.com/en/home/  (TruckLagbe — nationwide truck rental & bidding)

export type TruckSize = 'pickup' | 'medium' | 'large' | 'trailer' | 'motorcycle' | 'car';
export type TruckBody = 'open' | 'covered' | 'flatbed' | 'lowbed';
export type ProviderId = 'lalamove' | 'trucklagbe';

export interface TruckCategory {
  id: string;
  size: TruckSize;
  body: TruckBody;
  name: { en: string; bn: string };
  lengthFt?: number;        // body length in feet (TruckLagbe)
  capacityKg: number;       // weight limit
  capacityTon: number;
  dimsCm?: { l: number; w: number; h: number }; // Lalamove L×W×H
  startFareBdt?: number;    // base fare floor where published
  bestFor: { en: string; bn: string };
  providers: ProviderId[];
  emoji: string;
  color: string;
}

export interface TruckProvider {
  id: ProviderId;
  name: string;
  bnName: string;
  url: string;
  phone?: string;
  email?: string;
  coverage: { en: string; bn: string };
  bookingModel: { en: string; bn: string };
  highlights: { en: string; bn: string }[];
  appAndroid?: string;
  appIOS?: string;
  stats?: { v: string; en: string; bn: string }[];
  color: string;
}

export const TRUCK_PROVIDERS: TruckProvider[] = [
  {
    id: 'lalamove',
    name: 'Lalamove Bangladesh',
    bnName: 'লালামুভ বাংলাদেশ',
    url: 'https://www.lalamove.com/bn/',
    coverage: {
      en: 'On-demand within major cities (Dhaka, Chattogram). Select pickup in app for availability.',
      bn: 'বড় শহরে অন-ডিমান্ড (ঢাকা, চট্টগ্রাম)। অ্যাপে লোকেশন বাছুন।',
    },
    bookingModel: {
      en: 'Instant fixed-price booking. Driver dispatched within minutes.',
      bn: 'তাৎক্ষণিক ফিক্সড-প্রাইস বুকিং। মিনিটের মধ্যে ড্রাইভার।',
    },
    highlights: [
      { en: 'Real-time GPS tracking', bn: 'রিয়েল-টাইম জিপিএস ট্র্যাকিং' },
      { en: 'Multi-stop delivery', bn: 'মাল্টি-স্টপ ডেলিভারি' },
      { en: 'Hourly rental (5-hour blocks)', bn: 'ঘন্টা-ভিত্তিক ভাড়া (৫ ঘন্টা ব্লক)' },
      { en: 'House moving with optional labor', bn: 'বাড়ি সরানো (লেবার অপশনাল)' },
      { en: 'E-commerce / business pickups', bn: 'ই-কমার্স / ব্যবসায়িক পিকআপ' },
    ],
    appAndroid: 'https://play.google.com/store/apps/details?id=com.deliverygroup.app',
    appIOS: 'https://apps.apple.com/app/lalamove/id857740019',
    stats: [
      { v: '24/7', en: 'Available', bn: 'উপলভ্য' },
      { v: '99', en: 'From ৳ (motorcycle)', bn: '৳ থেকে (মোটরসাইকেল)' },
      { v: '5', en: 'Vehicle types', bn: 'যানবাহন টাইপ' },
    ],
    color: '#f97316',
  },
  {
    id: 'trucklagbe',
    name: 'Truck Lagbe',
    bnName: 'ট্রাক লাগবে',
    url: 'https://trucklagbe.com/en/home/',
    phone: '+880 9638 000 245',
    email: 'customercare@trucklagbe.com',
    coverage: {
      en: 'Nationwide. Intercity + in-city. 64 districts covered.',
      bn: 'সারাদেশ। আন্তঃজেলা + শহরের মধ্যে। ৬৪ জেলা।',
    },
    bookingModel: {
      en: 'Reverse-bidding marketplace. Post a trip → vendors bid for 30 min → pick best price.',
      bn: 'রিভার্স-বিডিং মার্কেটপ্লেস। ট্রিপ পোস্ট → ৩০ মিনিট বিড → সেরা দাম বেছে নিন।',
    },
    highlights: [
      { en: 'Full-day truck rental', bn: 'পুরো দিনের ট্রাক ভাড়া' },
      { en: 'Home/office/bachelor shifting', bn: 'বাসা/অফিস/ব্যাচেলর শিফটিং' },
      { en: 'Corporate logistics (up to 17% off)', bn: 'কর্পোরেট লজিস্টিক্স (১৭% পর্যন্ত ছাড়)' },
      { en: 'Verified trucks + trained drivers', bn: 'যাচাইকৃত ট্রাক + প্রশিক্ষিত ড্রাইভার' },
      { en: 'Skilled labor for loading/unloading', bn: 'লোডিং/আনলোডিং-এর জন্য দক্ষ লেবার' },
      { en: 'Round-trip + multi-stop trips', bn: 'রাউন্ড-ট্রিপ + মাল্টি-স্টপ' },
    ],
    appAndroid: 'https://play.google.com/store/apps/details?id=com.shovon.trucklagbe',
    appIOS: 'https://apps.apple.com/app/truck-lagbe/id1466808697',
    stats: [
      { v: '11K+', en: 'Businesses served', bn: 'ব্যবসা সেবা' },
      { v: '1.8M', en: 'App downloads', bn: 'অ্যাপ ডাউনলোড' },
      { v: '700K+', en: 'Successful trips', bn: 'সফল ট্রিপ' },
      { v: '30s', en: 'Booking time', bn: 'বুকিং সময়' },
    ],
    color: '#ef4444',
  },
];

export const TRUCK_CATEGORIES: TruckCategory[] = [
  // ── Last-mile / small parcel (Lalamove) ─────────────────────────────────
  {
    id: 'motorcycle',
    size: 'motorcycle',
    body: 'open',
    name: { en: 'Motorcycle', bn: 'মোটরসাইকেল' },
    capacityKg: 20,
    capacityTon: 0.02,
    dimsCm: { l: 35, w: 40, h: 30 },
    startFareBdt: 99,
    bestFor: { en: 'Documents · food · small parcels', bn: 'নথিপত্র · খাদ্য · ছোট পার্সেল' },
    providers: ['lalamove'],
    emoji: '🏍️',
    color: '#f97316',
  },
  {
    id: 'car',
    size: 'car',
    body: 'covered',
    name: { en: 'Car (sedan)', bn: 'কার' },
    capacityKg: 400,
    capacityTon: 0.4,
    dimsCm: { l: 125, w: 80, h: 60 },
    startFareBdt: 196,
    bestFor: { en: 'Small parcels & boxed goods', bn: 'ছোট পার্সেল ও বক্সড পণ্য' },
    providers: ['lalamove'],
    emoji: '🚗',
    color: '#0ea5e9',
  },
  // ── Pickup category ──────────────────────────────────────────────────────
  {
    id: 'pickup-7ft-1t-open',
    size: 'pickup',
    body: 'open',
    name: { en: 'Pickup · 7 ft · 1 Ton (Open)', bn: 'পিকআপ · ৭ ফুট · ১ টন (খোলা)' },
    lengthFt: 7,
    capacityKg: 1000,
    capacityTon: 1,
    dimsCm: { l: 188, w: 133, h: 108 },
    startFareBdt: 840,
    bestFor: { en: 'Appliances · electronics · multiple items', bn: 'যন্ত্রপাতি · ইলেকট্রনিক্স · একাধিক জিনিস' },
    providers: ['lalamove', 'trucklagbe'],
    emoji: '🛻',
    color: '#10b981',
  },
  {
    id: 'pickup-1t-covered',
    size: 'pickup',
    body: 'covered',
    name: { en: 'Pickup · 1 Ton (Covered)', bn: 'পিকআপ · ১ টন (ঢাকা)' },
    lengthFt: 7,
    capacityKg: 1000,
    capacityTon: 1,
    dimsCm: { l: 188, w: 133, h: 108 },
    startFareBdt: 950,
    bestFor: { en: 'Weather-protected transport', bn: 'আবহাওয়া-সুরক্ষিত পরিবহন' },
    providers: ['lalamove'],
    emoji: '🚚',
    color: '#059669',
  },
  {
    id: 'pickup-9ft-1.5t',
    size: 'pickup',
    body: 'open',
    name: { en: 'Pickup · 9 ft · 1.5 Ton (Open)', bn: 'পিকআপ · ৯ ফুট · ১.৫ টন (খোলা)' },
    lengthFt: 9,
    capacityKg: 1500,
    capacityTon: 1.5,
    bestFor: { en: 'Mid-size moves · light cargo', bn: 'মাঝারি মুভ · হালকা কার্গো' },
    providers: ['trucklagbe'],
    emoji: '🛻',
    color: '#16a34a',
  },
  // ── Medium category ──────────────────────────────────────────────────────
  {
    id: 'medium-2t',
    size: 'medium',
    body: 'open',
    name: { en: 'Truck · 2 Ton (Open)', bn: 'ট্রাক · ২ টন (খোলা)' },
    lengthFt: 12,
    capacityKg: 2000,
    capacityTon: 2,
    dimsCm: { l: 370, w: 190, h: 210 },
    bestFor: { en: 'Heavy equipment · construction', bn: 'ভারী সরঞ্জাম · নির্মাণ' },
    providers: ['lalamove', 'trucklagbe'],
    emoji: '🚛',
    color: '#0ea5e9',
  },
  {
    id: 'medium-3.5t-open',
    size: 'medium',
    body: 'open',
    name: { en: 'Truck · 14 ft · 3.5 Ton (Open)', bn: 'ট্রাক · ১৪ ফুট · ৩.৫ টন (খোলা)' },
    lengthFt: 14,
    capacityKg: 3500,
    capacityTon: 3.5,
    bestFor: { en: 'Office shifting · bulk cargo', bn: 'অফিস শিফটিং · বাল্ক কার্গো' },
    providers: ['trucklagbe'],
    emoji: '🚛',
    color: '#2563eb',
  },
  {
    id: 'medium-3.5t-covered',
    size: 'medium',
    body: 'covered',
    name: { en: 'Truck · 14 ft · 3.5 Ton (Covered)', bn: 'ট্রাক · ১৪ ফুট · ৩.৫ টন (ঢাকা)' },
    lengthFt: 14,
    capacityKg: 3500,
    capacityTon: 3.5,
    bestFor: { en: 'Furniture · sensitive cargo', bn: 'ফার্নিচার · সংবেদনশীল কার্গো' },
    providers: ['trucklagbe'],
    emoji: '🚛',
    color: '#1d4ed8',
  },
  {
    id: 'medium-7.5t-open',
    size: 'medium',
    body: 'open',
    name: { en: 'Truck · 16 ft · 7.5 Ton (Open)', bn: 'ট্রাক · ১৬ ফুট · ৭.৫ টন (খোলা)' },
    lengthFt: 16,
    capacityKg: 7500,
    capacityTon: 7.5,
    bestFor: { en: 'Industrial moves · large machinery', bn: 'শিল্প মুভ · বড় যন্ত্রপাতি' },
    providers: ['trucklagbe'],
    emoji: '🚛',
    color: '#7c3aed',
  },
  {
    id: 'medium-7.5t-covered',
    size: 'medium',
    body: 'covered',
    name: { en: 'Truck · 16 ft · 7.5 Ton (Covered)', bn: 'ট্রাক · ১৬ ফুট · ৭.৫ টন (ঢাকা)' },
    lengthFt: 16,
    capacityKg: 7500,
    capacityTon: 7.5,
    bestFor: { en: 'FMCG · packaged goods', bn: 'এফএমসিজি · প্যাকেজড পণ্য' },
    providers: ['trucklagbe'],
    emoji: '🚛',
    color: '#6d28d9',
  },
  // ── Large category ───────────────────────────────────────────────────────
  {
    id: 'large-18ft-15t',
    size: 'large',
    body: 'open',
    name: { en: 'Truck · 18 ft · 15 Ton (Open)', bn: 'ট্রাক · ১৮ ফুট · ১৫ টন (খোলা)' },
    lengthFt: 18,
    capacityKg: 15000,
    capacityTon: 15,
    bestFor: { en: 'Bulk freight · intercity', bn: 'বাল্ক ফ্রেইট · আন্তঃজেলা' },
    providers: ['trucklagbe'],
    emoji: '🚛',
    color: '#dc2626',
  },
  {
    id: 'large-20ft-15t',
    size: 'large',
    body: 'open',
    name: { en: 'Truck · 20 ft · 15 Ton (Open)', bn: 'ট্রাক · ২০ ফুট · ১৫ টন (খোলা)' },
    lengthFt: 20,
    capacityKg: 15000,
    capacityTon: 15,
    bestFor: { en: 'Container loads · port runs', bn: 'কন্টেইনার লোড · বন্দর' },
    providers: ['trucklagbe'],
    emoji: '🚛',
    color: '#b91c1c',
  },
  {
    id: 'large-23ft-15t-covered',
    size: 'large',
    body: 'covered',
    name: { en: 'Truck · 23 ft · 15 Ton (Covered)', bn: 'ট্রাক · ২৩ ফুট · ১৫ টন (ঢাকা)' },
    lengthFt: 23,
    capacityKg: 15000,
    capacityTon: 15,
    bestFor: { en: 'Long-haul packaged goods', bn: 'লং-হল প্যাকেজড পণ্য' },
    providers: ['trucklagbe'],
    emoji: '🚛',
    color: '#991b1b',
  },
  {
    id: 'large-23ft-25t',
    size: 'large',
    body: 'open',
    name: { en: 'Truck · 23 ft · 25 Ton (Open)', bn: 'ট্রাক · ২৩ ফুট · ২৫ টন (খোলা)' },
    lengthFt: 23,
    capacityKg: 25000,
    capacityTon: 25,
    bestFor: { en: 'Heavy industrial freight', bn: 'ভারী শিল্প ফ্রেইট' },
    providers: ['trucklagbe'],
    emoji: '🚛',
    color: '#7f1d1d',
  },
  // ── Trailer category ─────────────────────────────────────────────────────
  {
    id: 'trailer-flatbed',
    size: 'trailer',
    body: 'flatbed',
    name: { en: 'Flat-bed Trailer', bn: 'ফ্ল্যাট-বেড ট্রেইলার' },
    capacityKg: 30000,
    capacityTon: 30,
    bestFor: { en: 'Containers · steel · machinery', bn: 'কন্টেইনার · ইস্পাত · যন্ত্রপাতি' },
    providers: ['trucklagbe'],
    emoji: '🚜',
    color: '#52525b',
  },
  {
    id: 'trailer-lowbed',
    size: 'trailer',
    body: 'lowbed',
    name: { en: 'Low-bed Trailer', bn: 'লো-বেড ট্রেইলার' },
    capacityKg: 40000,
    capacityTon: 40,
    bestFor: { en: 'Excavators · oversized loads', bn: 'এক্সক্যাভেটর · ওভারসাইজড লোড' },
    providers: ['trucklagbe'],
    emoji: '🚜',
    color: '#3f3f46',
  },
];

// Popular city/route preset suggestions
export const TRUCK_CITIES = [
  { id: 'dhaka',       en: 'Dhaka',       bn: 'ঢাকা' },
  { id: 'chattogram',  en: 'Chattogram',  bn: 'চট্টগ্রাম' },
  { id: 'sylhet',      en: 'Sylhet',      bn: 'সিলেট' },
  { id: 'khulna',      en: 'Khulna',      bn: 'খুলনা' },
  { id: 'rajshahi',    en: 'Rajshahi',    bn: 'রাজশাহী' },
  { id: 'barishal',    en: 'Barishal',    bn: 'বরিশাল' },
  { id: 'rangpur',     en: 'Rangpur',     bn: 'রংপুর' },
  { id: 'mymensingh',  en: 'Mymensingh',  bn: 'ময়মনসিংহ' },
  { id: 'cumilla',     en: 'Cumilla',     bn: 'কুমিল্লা' },
  { id: 'narayanganj', en: 'Narayanganj', bn: 'নারায়ণগঞ্জ' },
  { id: 'gazipur',     en: 'Gazipur',     bn: 'গাজীপুর' },
  { id: 'jashore',     en: 'Jashore',     bn: 'যশোর' },
];

// Rough per-km rate band for intercity truck rental (BDT). Used only for
// fare-estimate hint — actual price depends on bidding outcome.
export const TRUCK_INTERCITY_RATE_PER_KM: Record<TruckSize, [number, number]> = {
  motorcycle: [15, 25],
  car:        [25, 40],
  pickup:     [40, 70],
  medium:     [70, 130],
  large:      [130, 200],
  trailer:    [200, 350],
};

export function estimateIntercityFare(size: TruckSize, km: number): { low: number; high: number } {
  const [a, b] = TRUCK_INTERCITY_RATE_PER_KM[size] ?? [50, 100];
  // floor (driver minimum) is around 1500 BDT for any intercity trip
  return { low: Math.max(1500, Math.round(a * km)), high: Math.max(2000, Math.round(b * km)) };
}
