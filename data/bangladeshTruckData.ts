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
  /** Neutral category label shown in UI (no brand name) */
  displayLabel: { en: string; bn: string };
  /** Short neutral tagline shown in UI (no brand name) */
  tagline: { en: string; bn: string };
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
    displayLabel: { en: 'On-demand service', bn: 'অন-ডিমান্ড সার্ভিস' },
    tagline: { en: 'Fixed price · instant dispatch', bn: 'ফিক্সড প্রাইস · তাৎক্ষণিক ডিসপ্যাচ' },
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
      { v: '৳60', en: 'Motorcycle from', bn: 'মোটরসাইকেল থেকে' },
      { v: '৳640', en: '1-Ton truck from', bn: '১-টন ট্রাক থেকে' },
      { v: '4', en: 'Cities · Dhaka/Savar/N.ganj/Gazipur', bn: 'শহর · ঢাকা/সাভার/নঃগঞ্জ/গাজীপুর' },
    ],
    color: '#f97316',
  },
  {
    id: 'trucklagbe',
    name: 'Truck Lagbe',
    bnName: 'ট্রাক লাগবে',
    displayLabel: { en: 'Bidding marketplace', bn: 'বিডিং মার্কেটপ্লেস' },
    tagline: { en: 'Vendors bid · best price wins', bn: 'ভেন্ডররা বিড করে · সেরা দাম জেতে' },
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

// Real published rates (verified Jun 2026):
//   Lalamove BD pricing page: motorcycle 60, car 196, 1T 640, 1T-rental 2750, 2T 1280
//   TruckLagbe blog "guideline to truck & pickup rental within Dhaka":
//     1T 9ft pickup 800–2200, 1T 9ft covered 1000–2500, 2T 12ft 1200–2700,
//     2T 12ft covered 1200–3000, 3.5T 14ft 1500–2800, 3.5T 14ft covered 1500–3200,
//     7.5T 16ft open 2500–4500, 7.5T 16ft covered 3000–5000,
//     15T 18ft open 3500–5000, 15T 23ft covered 3500–5500, 25T 23ft open 5000–6000
//   covervan.world: 4-5T covered van base 4000 + 100/km Dhaka, 45/km outside + tolls×2 + ferry×2

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
    startFareBdt: 60,
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
    startFareBdt: 640,
    bestFor: { en: 'Appliances · electronics · multiple items', bn: 'যন্ত্রপাতি · ইলেকট্রনিক্স · একাধিক জিনিস' },
    providers: ['lalamove', 'trucklagbe'],
    emoji: '🛻',
    color: '#10b981',
  },
  {
    id: 'pickup-9ft-1t-covered',
    size: 'pickup',
    body: 'covered',
    name: { en: 'Pickup · 9 ft · 1 Ton (Covered)', bn: 'পিকআপ · ৯ ফুট · ১ টন (ঢাকা)' },
    lengthFt: 9,
    capacityKg: 1000,
    capacityTon: 1,
    dimsCm: { l: 188, w: 133, h: 108 },
    startFareBdt: 1000,
    bestFor: { en: 'Weather-protected transport', bn: 'আবহাওয়া-সুরক্ষিত পরিবহন' },
    providers: ['lalamove', 'trucklagbe'],
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
    startFareBdt: 800,
    bestFor: { en: 'Mid-size moves · light cargo', bn: 'মাঝারি মুভ · হালকা কার্গো' },
    providers: ['trucklagbe'],
    emoji: '🛻',
    color: '#16a34a',
  },
  // ── Medium category ──────────────────────────────────────────────────────
  {
    id: 'medium-12ft-2t-open',
    size: 'medium',
    body: 'open',
    name: { en: 'Truck · 12 ft · 2 Ton (Open)', bn: 'ট্রাক · ১২ ফুট · ২ টন (খোলা)' },
    lengthFt: 12,
    capacityKg: 2000,
    capacityTon: 2,
    dimsCm: { l: 370, w: 190, h: 210 },
    startFareBdt: 1200,
    bestFor: { en: 'Heavy equipment · construction', bn: 'ভারী সরঞ্জাম · নির্মাণ' },
    providers: ['lalamove', 'trucklagbe'],
    emoji: '🚛',
    color: '#0ea5e9',
  },
  {
    id: 'medium-12ft-2t-covered',
    size: 'medium',
    body: 'covered',
    name: { en: 'Truck · 12 ft · 2 Ton (Covered)', bn: 'ট্রাক · ১২ ফুট · ২ টন (ঢাকা)' },
    lengthFt: 12,
    capacityKg: 2000,
    capacityTon: 2,
    dimsCm: { l: 370, w: 190, h: 210 },
    startFareBdt: 1200,
    bestFor: { en: 'Sensitive cargo · electronics', bn: 'সংবেদনশীল কার্গো · ইলেকট্রনিক্স' },
    providers: ['trucklagbe'],
    emoji: '🚛',
    color: '#0284c7',
  },
  {
    id: 'medium-3.5t-open',
    size: 'medium',
    body: 'open',
    name: { en: 'Truck · 14 ft · 3.5 Ton (Open)', bn: 'ট্রাক · ১৪ ফুট · ৩.৫ টন (খোলা)' },
    lengthFt: 14,
    capacityKg: 3500,
    capacityTon: 3.5,
    startFareBdt: 1500,
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
    startFareBdt: 1500,
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
    startFareBdt: 2500,
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
    startFareBdt: 3000,
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
    startFareBdt: 3500,
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
    startFareBdt: 4000,
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
    startFareBdt: 3500,
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
    startFareBdt: 5000,
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
    startFareBdt: 8000,
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
    startFareBdt: 12000,
    bestFor: { en: 'Excavators · oversized loads', bn: 'এক্সক্যাভেটর · ওভারসাইজড লোড' },
    providers: ['trucklagbe'],
    emoji: '🚜',
    color: '#3f3f46',
  },
];

// Popular city/route preset suggestions with coords for Haversine distance calc
export interface TruckCity {
  id: string;
  en: string;
  bn: string;
  lat: number;
  lng: number;
}

export const TRUCK_CITIES: TruckCity[] = [
  { id: 'dhaka',       en: 'Dhaka',       bn: 'ঢাকা',         lat: 23.8103, lng: 90.4125 },
  { id: 'chattogram',  en: 'Chattogram',  bn: 'চট্টগ্রাম',   lat: 22.3569, lng: 91.7832 },
  { id: 'sylhet',      en: 'Sylhet',      bn: 'সিলেট',        lat: 24.8949, lng: 91.8687 },
  { id: 'khulna',      en: 'Khulna',      bn: 'খুলনা',        lat: 22.8456, lng: 89.5403 },
  { id: 'rajshahi',    en: 'Rajshahi',    bn: 'রাজশাহী',     lat: 24.3745, lng: 88.6042 },
  { id: 'barishal',    en: 'Barishal',    bn: 'বরিশাল',      lat: 22.7010, lng: 90.3535 },
  { id: 'rangpur',     en: 'Rangpur',     bn: 'রংপুর',       lat: 25.7439, lng: 89.2752 },
  { id: 'mymensingh',  en: 'Mymensingh',  bn: 'ময়মনসিংহ',   lat: 24.7471, lng: 90.4203 },
  { id: 'cumilla',     en: 'Cumilla',     bn: 'কুমিল্লা',    lat: 23.4607, lng: 91.1809 },
  { id: 'narayanganj', en: 'Narayanganj', bn: 'নারায়ণগঞ্জ',  lat: 23.6238, lng: 90.5000 },
  { id: 'gazipur',     en: 'Gazipur',     bn: 'গাজীপুর',     lat: 23.9999, lng: 90.4203 },
  { id: 'jashore',     en: 'Jashore',     bn: 'যশোর',        lat: 23.1697, lng: 89.2137 },
  { id: 'bogura',      en: 'Bogura',      bn: 'বগুড়া',       lat: 24.8465, lng: 89.3776 },
  { id: 'coxsbazar',   en: "Cox's Bazar", bn: 'কক্সবাজার',   lat: 21.4272, lng: 92.0058 },
  { id: 'jamalpur',    en: 'Jamalpur',    bn: 'জামালপুর',    lat: 24.9375, lng: 89.9372 },
  { id: 'tangail',     en: 'Tangail',     bn: 'টাঙ্গাইল',    lat: 24.2513, lng: 89.9167 },
  { id: 'dinajpur',    en: 'Dinajpur',    bn: 'দিনাজপুর',    lat: 25.6217, lng: 88.6354 },
  { id: 'pabna',       en: 'Pabna',       bn: 'পাবনা',        lat: 24.0064, lng: 89.2372 },
  { id: 'feni',        en: 'Feni',        bn: 'ফেনী',         lat: 23.0159, lng: 91.3976 },
  { id: 'noakhali',    en: 'Noakhali',    bn: 'নোয়াখালী',    lat: 22.8696, lng: 91.0996 },
];

export function findTruckCity(q: string): TruckCity | null {
  if (!q) return null;
  const lower = q.trim().toLowerCase();
  return TRUCK_CITIES.find(c =>
    c.en.toLowerCase() === lower ||
    c.bn === q.trim() ||
    c.id === lower ||
    c.en.toLowerCase().includes(lower) ||
    c.bn.includes(q.trim()),
  ) ?? null;
}

// Haversine + 1.30 road factor (BD roads more winding than ~1.15)
export function truckRoadKm(a: TruckCity, b: TruckCity): number {
  if (a.id === b.id) return 0;
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const straight = R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return Math.round(straight * 1.30);
}

// Per-km rates by truck size (BDT/km). Sources:
//   - covervan.world: 4-5T covered = 100/km in Dhaka, 45/km outside
//   - market data via TruckLagbe blog: pickup ~15-25 outside, larger trucks 45-100 outside
//   - 16ft+ trucks intercity verified vs Dhaka-Chattogram 16-20K (250 km) → ~65-80/km
// In-Dhaka rate roughly 2× outside-Dhaka rate due to traffic delay charges.
export const TRUCK_RATE_PER_KM: Record<TruckSize, { dhaka: number; outside: number }> = {
  motorcycle: { dhaka: 12, outside: 8 },
  car:        { dhaka: 22, outside: 15 },
  pickup:     { dhaka: 55, outside: 25 },
  medium:     { dhaka: 100, outside: 45 },
  large:      { dhaka: 140, outside: 70 },
  trailer:    { dhaka: 220, outside: 120 },
};

// Toll cost (BDT, one-way) for major routes from/to Dhaka.
// Source: tollguru.com Bangladesh + BBA published rates 2025.
export const ROUTE_TOLLS: Record<string, number> = {
  // Padma Bridge truck toll: 2400 for medium/large, 1300 for small
  'dhaka-khulna':       1300,  // via Padma
  'dhaka-barishal':     1300,  // via Padma
  'dhaka-jashore':      1300,  // via Padma
  'dhaka-chattogram':   200,   // Meghna + Daudkandi
  'dhaka-coxsbazar':    200,
  'dhaka-feni':         200,
  'dhaka-noakhali':     200,
  'dhaka-cumilla':      100,   // Meghna only
  'dhaka-sylhet':       100,   // Bhairab
  // Other routes: minimal/none
};

function routeTollKey(fromId: string, toId: string): string {
  return [fromId, toId].sort().join('-');
}

export function tollBdt(fromId: string, toId: string): number {
  return ROUTE_TOLLS[routeTollKey(fromId, toId)] ?? 0;
}

export interface FareBreakdown {
  base: number;
  perKm: number;
  km: number;
  distanceCharge: number;
  tolls: number;       // already ×2 (round trip)
  estimateLow: number;
  estimateHigh: number;
  estimate: number;    // mid-point recommended quote
}

// Real fare formula (from covervan.world + TruckLagbe blog rates):
//   Rent = Base + (PerKm × km) + (Tolls × 2)
// Range = ±15% to reflect vendor bidding spread.
export function calcFare(
  category: TruckCategory,
  km: number,
  fromCityId?: string,
  toCityId?: string,
): FareBreakdown {
  const base = category.startFareBdt ?? 1500;
  const rates = TRUCK_RATE_PER_KM[category.size] ?? { dhaka: 50, outside: 30 };
  // First 10 km @ Dhaka rate (urban congestion), rest @ outside rate for intercity
  const isIntercity = km > 15;
  const perKm = isIntercity ? rates.outside : rates.dhaka;
  const distanceCharge = Math.round(perKm * km);
  const tolls = fromCityId && toCityId ? tollBdt(fromCityId, toCityId) * 2 : 0;
  const subtotal = base + distanceCharge + tolls;
  return {
    base,
    perKm,
    km,
    distanceCharge,
    tolls,
    estimate: subtotal,
    estimateLow: Math.round(subtotal * 0.85),
    estimateHigh: Math.round(subtotal * 1.15),
  };
}

// Standard surcharges (BDT). Source: packnmove.com.bd 2025 truck rental guide.
export const SURCHARGES = {
  loaderPerPerson: { low: 500, high: 1000 },
  overtimePerHour: { low: 300, high: 1000 },
  nightAfter10pm: { low: 500, high: 500 },
  damageDeposit: { low: 1000, high: 2000 },
};

// Lalamove multi-stop fees (BDT), published.
export const LALAMOVE_MULTISTOP_FEE: Record<string, number> = {
  motorcycle: 30,
  car: 100,
  'pickup-7ft-1t-open': 184,
  'pickup-9ft-1t-covered': 224,
  'medium-12ft-2t-open': 264,
};

// Lalamove 5-hour rental package prices (BDT).
export const LALAMOVE_RENTAL_5H: Record<string, number> = {
  'pickup-7ft-1t-open': 2750,
};
