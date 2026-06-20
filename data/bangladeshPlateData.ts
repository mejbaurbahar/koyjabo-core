// Bangladesh vehicle number plate reference data
// Format: [Location Prefix] [Category Letter] [2-digit series]-[4-digit number]
// Example: ঢাকা মেট্রো ক ১১-১২৩৪

export interface PlateLocation {
  bn: string;
  en: string;
  division: string;
  type: 'metro' | 'district';
}

export interface PlateCategory {
  letter: string;
  bn: string;
  en: string;
  kind: 'private' | 'goods' | 'public' | 'special' | 'twowheeler' | 'threewheeler';
}

export interface DecodedPlate {
  location: PlateLocation | null;
  category: PlateCategory | null;
  series: string;
  number: string;
  raw: string;
}

// 11 metro areas
export const PLATE_METROS: PlateLocation[] = [
  { bn: 'ঢাকা মেট্রো',         en: 'Dhaka Metro',         division: 'Dhaka',       type: 'metro' },
  { bn: 'চট্টগ্রাম মেট্রো',     en: 'Chattogram Metro',    division: 'Chattogram',  type: 'metro' },
  { bn: 'রাজশাহী মেট্রো',       en: 'Rajshahi Metro',      division: 'Rajshahi',    type: 'metro' },
  { bn: 'খুলনা মেট্রো',         en: 'Khulna Metro',        division: 'Khulna',      type: 'metro' },
  { bn: 'সিলেট মেট্রো',         en: 'Sylhet Metro',        division: 'Sylhet',      type: 'metro' },
  { bn: 'বরিশাল মেট্রো',        en: 'Barisal Metro',       division: 'Barisal',     type: 'metro' },
  { bn: 'ময়মনসিংহ মেট্রো',     en: 'Mymensingh Metro',    division: 'Mymensingh',  type: 'metro' },
  { bn: 'রংপুর মেট্রো',         en: 'Rangpur Metro',       division: 'Rangpur',     type: 'metro' },
  { bn: 'নারায়ণগঞ্জ মেট্রো',   en: 'Narayanganj Metro',   division: 'Dhaka',       type: 'metro' },
  { bn: 'গাজীপুর মেট্রো',       en: 'Gazipur Metro',       division: 'Dhaka',       type: 'metro' },
  { bn: 'কুমিল্লা মেট্রো',      en: 'Comilla Metro',       division: 'Chattogram',  type: 'metro' },
];

// All 64 districts grouped by division
export const PLATE_DISTRICTS: PlateLocation[] = [
  // Dhaka Division (13)
  { bn: 'ঢাকা',          en: 'Dhaka',          division: 'Dhaka',      type: 'district' },
  { bn: 'গাজীপুর',       en: 'Gazipur',        division: 'Dhaka',      type: 'district' },
  { bn: 'নারায়ণগঞ্জ',   en: 'Narayanganj',    division: 'Dhaka',      type: 'district' },
  { bn: 'মানিকগঞ্জ',     en: 'Manikganj',      division: 'Dhaka',      type: 'district' },
  { bn: 'মুন্সীগঞ্জ',    en: 'Munshiganj',     division: 'Dhaka',      type: 'district' },
  { bn: 'নরসিংদী',       en: 'Narsingdi',      division: 'Dhaka',      type: 'district' },
  { bn: 'টাঙ্গাইল',      en: 'Tangail',        division: 'Dhaka',      type: 'district' },
  { bn: 'কিশোরগঞ্জ',     en: 'Kishoreganj',    division: 'Dhaka',      type: 'district' },
  { bn: 'ফরিদপুর',       en: 'Faridpur',       division: 'Dhaka',      type: 'district' },
  { bn: 'গোপালগঞ্জ',     en: 'Gopalganj',      division: 'Dhaka',      type: 'district' },
  { bn: 'মাদারীপুর',     en: 'Madaripur',      division: 'Dhaka',      type: 'district' },
  { bn: 'রাজবাড়ী',      en: 'Rajbari',        division: 'Dhaka',      type: 'district' },
  { bn: 'শরীয়তপুর',     en: 'Shariatpur',     division: 'Dhaka',      type: 'district' },
  // Mymensingh Division (4)
  { bn: 'ময়মনসিংহ',     en: 'Mymensingh',     division: 'Mymensingh', type: 'district' },
  { bn: 'জামালপুর',      en: 'Jamalpur',       division: 'Mymensingh', type: 'district' },
  { bn: 'শেরপুর',        en: 'Sherpur',        division: 'Mymensingh', type: 'district' },
  { bn: 'নেত্রকোণা',     en: 'Netrokona',      division: 'Mymensingh', type: 'district' },
  // Chattogram Division (11)
  { bn: 'চট্টগ্রাম',     en: 'Chattogram',     division: 'Chattogram', type: 'district' },
  { bn: 'কক্সবাজার',     en: "Cox's Bazar",    division: 'Chattogram', type: 'district' },
  { bn: 'কুমিল্লা',      en: 'Comilla',        division: 'Chattogram', type: 'district' },
  { bn: 'ব্রাহ্মণবাড়িয়া', en: 'Brahmanbaria', division: 'Chattogram', type: 'district' },
  { bn: 'চাঁদপুর',       en: 'Chandpur',       division: 'Chattogram', type: 'district' },
  { bn: 'লক্ষ্মীপুর',    en: 'Lakshmipur',     division: 'Chattogram', type: 'district' },
  { bn: 'নোয়াখালী',     en: 'Noakhali',       division: 'Chattogram', type: 'district' },
  { bn: 'ফেনী',          en: 'Feni',           division: 'Chattogram', type: 'district' },
  { bn: 'খাগড়াছড়ি',    en: 'Khagrachhari',   division: 'Chattogram', type: 'district' },
  { bn: 'রাঙ্গামাটি',    en: 'Rangamati',      division: 'Chattogram', type: 'district' },
  { bn: 'বান্দরবান',     en: 'Bandarban',      division: 'Chattogram', type: 'district' },
  // Sylhet Division (4)
  { bn: 'সিলেট',         en: 'Sylhet',         division: 'Sylhet',     type: 'district' },
  { bn: 'মৌলভীবাজার',   en: 'Moulvibazar',    division: 'Sylhet',     type: 'district' },
  { bn: 'হবিগঞ্জ',       en: 'Habiganj',       division: 'Sylhet',     type: 'district' },
  { bn: 'সুনামগঞ্জ',     en: 'Sunamganj',      division: 'Sylhet',     type: 'district' },
  // Rajshahi Division (8)
  { bn: 'রাজশাহী',       en: 'Rajshahi',       division: 'Rajshahi',   type: 'district' },
  { bn: 'চাঁপাইনবাবগঞ্জ', en: 'Chapai Nawabganj', division: 'Rajshahi', type: 'district' },
  { bn: 'নওগাঁ',         en: 'Naogaon',        division: 'Rajshahi',   type: 'district' },
  { bn: 'নাটোর',         en: 'Natore',         division: 'Rajshahi',   type: 'district' },
  { bn: 'সিরাজগঞ্জ',     en: 'Sirajganj',      division: 'Rajshahi',   type: 'district' },
  { bn: 'পাবনা',         en: 'Pabna',          division: 'Rajshahi',   type: 'district' },
  { bn: 'বগুড়া',        en: 'Bogura',         division: 'Rajshahi',   type: 'district' },
  { bn: 'জয়পুরহাট',     en: 'Joypurhat',      division: 'Rajshahi',   type: 'district' },
  // Rangpur Division (8)
  { bn: 'রংপুর',         en: 'Rangpur',        division: 'Rangpur',    type: 'district' },
  { bn: 'দিনাজপুর',      en: 'Dinajpur',       division: 'Rangpur',    type: 'district' },
  { bn: 'গাইবান্ধা',     en: 'Gaibandha',      division: 'Rangpur',    type: 'district' },
  { bn: 'কুড়িগ্রাম',    en: 'Kurigram',       division: 'Rangpur',    type: 'district' },
  { bn: 'লালমনিরহাট',   en: 'Lalmonirhat',    division: 'Rangpur',    type: 'district' },
  { bn: 'নীলফামারী',     en: 'Nilphamari',     division: 'Rangpur',    type: 'district' },
  { bn: 'পঞ্চগড়',       en: 'Panchagarh',     division: 'Rangpur',    type: 'district' },
  { bn: 'ঠাকুরগাঁও',    en: 'Thakurgaon',     division: 'Rangpur',    type: 'district' },
  // Khulna Division (10)
  { bn: 'খুলনা',         en: 'Khulna',         division: 'Khulna',     type: 'district' },
  { bn: 'বাগেরহাট',      en: 'Bagerhat',       division: 'Khulna',     type: 'district' },
  { bn: 'সাতক্ষীরা',     en: 'Satkhira',       division: 'Khulna',     type: 'district' },
  { bn: 'যশোর',          en: 'Jashore',        division: 'Khulna',     type: 'district' },
  { bn: 'নড়াইল',        en: 'Narail',         division: 'Khulna',     type: 'district' },
  { bn: 'মাগুরা',        en: 'Magura',         division: 'Khulna',     type: 'district' },
  { bn: 'ঝিনাইদহ',       en: 'Jhenaidah',      division: 'Khulna',     type: 'district' },
  { bn: 'কুষ্টিয়া',     en: 'Kushtia',        division: 'Khulna',     type: 'district' },
  { bn: 'চুয়াডাঙ্গা',   en: 'Chuadanga',      division: 'Khulna',     type: 'district' },
  { bn: 'মেহেরপুর',      en: 'Meherpur',       division: 'Khulna',     type: 'district' },
  // Barisal Division (6)
  { bn: 'বরিশাল',        en: 'Barisal',        division: 'Barisal',    type: 'district' },
  { bn: 'ভোলা',          en: 'Bhola',          division: 'Barisal',    type: 'district' },
  { bn: 'ঝালকাঠি',       en: 'Jhalokati',      division: 'Barisal',    type: 'district' },
  { bn: 'পটুয়াখালী',    en: 'Patuakhali',     division: 'Barisal',    type: 'district' },
  { bn: 'পিরোজপুর',      en: 'Pirojpur',       division: 'Barisal',    type: 'district' },
  { bn: 'বরগুনা',        en: 'Barguna',        division: 'Barisal',    type: 'district' },
];

export const ALL_PLATE_LOCATIONS: PlateLocation[] = [...PLATE_METROS, ...PLATE_DISTRICTS];

// BRTA vehicle category codes (Bangla letters on physical plate)
export const PLATE_CATEGORIES: PlateCategory[] = [
  { letter: 'ক', bn: 'প্রাইভেট কার',       en: 'Private Car',             kind: 'private'     },
  { letter: 'খ', bn: 'জিপ / এসইউভি',       en: 'Jeep / SUV',              kind: 'private'     },
  { letter: 'গ', bn: 'সিএনজি অটোরিকশা',   en: 'CNG Auto-rickshaw',       kind: 'threewheeler' },
  { letter: 'ঘ', bn: 'ট্রাক / মালবাহী',    en: 'Truck / Goods Vehicle',   kind: 'goods'       },
  { letter: 'ঙ', bn: 'বড় বাস',            en: 'Bus (Large)',             kind: 'public'      },
  { letter: 'চ', bn: 'মিনিবাস',            en: 'Minibus',                 kind: 'public'      },
  { letter: 'ছ', bn: 'মাইক্রোবাস',         en: 'Microbus',                kind: 'public'      },
  { letter: 'জ', bn: 'হিউম্যান হলার / লেগুনা', en: 'Human Hauler / Leguna', kind: 'public'   },
  { letter: 'ঝ', bn: 'মোটরসাইকেল',        en: 'Motorcycle',              kind: 'twowheeler'  },
  { letter: 'ট', bn: 'ট্যাক্সি ক্যাব',    en: 'Taxi Cab',                kind: 'private'     },
  { letter: 'ঠ', bn: 'টেম্পো (মালবাহী)', en: 'Tempo (Goods Three-wheeler)', kind: 'goods'  },
  { letter: 'ড', bn: 'ট্রাক্টর',           en: 'Tractor',                 kind: 'goods'       },
  { letter: 'ত', bn: 'কভার্ড ভ্যান',       en: 'Covered Van',             kind: 'goods'       },
  { letter: 'থ', bn: 'পিকআপ ট্রাক',       en: 'Pickup Truck',            kind: 'goods'       },
  { letter: 'দ', bn: 'পাওয়ার টিলার',      en: 'Power Tiller',            kind: 'goods'       },
  { letter: 'ন', bn: 'অন্যান্য',           en: 'Others',                  kind: 'special'     },
  { letter: 'প', bn: 'প্রাইভেট কার (বিকল্প)', en: 'Private Car (Alt)',    kind: 'private'     },
  { letter: 'ফ', bn: 'ফায়ার ব্রিগেড',     en: 'Fire Brigade',            kind: 'special'     },
  { letter: 'ব', bn: 'সরকারি গাড়ি',       en: 'Government Vehicle',      kind: 'special'     },
  { letter: 'ম', bn: 'সামরিক বাহন',        en: 'Military Vehicle',        kind: 'special'     },
  { letter: 'স', bn: 'স্কুল বাস / ট্যুরিস্ট কোচ', en: 'School Bus / Tourist Coach', kind: 'public' },
  { letter: 'হ', bn: 'ভারী যন্ত্রপাতি',   en: 'Heavy Equipment',         kind: 'special'     },
];

const _locationMap = new Map(ALL_PLATE_LOCATIONS.map(l => [l.bn, l]));
const _categoryMap = new Map(PLATE_CATEGORIES.map(c => [c.letter, c]));

// Converts Bangla numerals to Arabic for parsing
function bnToAr(s: string): string {
  return s.replace(/[০-৯]/g, d => String(d.charCodeAt(0) - 0x09E6));
}

/**
 * Decode a Bangladesh vehicle number plate string.
 * Input: "ঢাকা মেট্রো ক ১১-১২৩৪" or "ঢাকা মেট্রো ক 11-1234"
 * Returns decoded location, category, series, and number.
 */
export function decodePlate(raw: string): DecodedPlate {
  const input = raw.trim();

  // Try to match longest location prefix first (metro names are longer)
  let location: PlateLocation | null = null;
  let rest = input;

  for (const loc of [...PLATE_METROS, ...PLATE_DISTRICTS]) {
    if (input.startsWith(loc.bn)) {
      location = loc;
      rest = input.slice(loc.bn.length).trim();
      break;
    }
  }

  // rest should now be: [letter] [series]-[number]
  const parts = rest.split(/\s+/);
  const letter = parts[0] || '';
  const category = _categoryMap.get(letter) ?? null;

  const seriesNum = parts[1] || '';
  const [series, number] = seriesNum.split('-').map(s => bnToAr(s));

  return { location, category, series: series || '', number: number || '', raw };
}

export function getLocationByBn(bn: string): PlateLocation | undefined {
  return _locationMap.get(bn);
}

export function getCategoryByLetter(letter: string): PlateCategory | undefined {
  return _categoryMap.get(letter);
}
