/**
 * Bangladesh Intercity Bus Operators — Routes, Stops & Policies
 * Source: Operator websites, Shohoz.com, eticket.railway.gov.bd, field knowledge
 * Last updated: 2026-06
 */

export interface BusStop {
  name: string;
  bnName: string;
  arrivalTime?: string;   // HH:MM from Dhaka departure reference
  type: 'origin' | 'major' | 'stop' | 'destination';
}

export interface OperatorRoute {
  id: string;
  from: string;          // origin city
  to: string;            // destination city
  fromBn: string;
  toBn: string;
  dhakaCounters: string[]; // Dhaka pickup points
  destCounters: string[];  // destination pickup/drop points
  stops: BusStop[];
  distanceKm: number;
  durationHrs: string;   // e.g. "6-7h"
  fareNonAC: string;     // e.g. "৳680"
  fareAC?: string;
  departureTimes: string[];  // HH:MM from Dhaka
  returnTimes: string[];     // HH:MM from destination
  busType: string[];
}

export interface OperatorPolicy {
  cancellation: string;
  refund: string;
  luggage: string;
  boarding: string;
  idRequired: boolean;
  childPolicy: string;
  specialNotes: string[];
}

export interface BusOperatorDetail {
  id: string;
  name: string;
  bnName: string;
  shortName: string;
  logo: string;          // color for avatar
  rating: number;
  website: string;
  phone: string[];
  email?: string;
  headquarters: string;
  established?: number;
  fleetSize: string;
  busTypes: string[];
  coverage: string;      // e.g. "All 64 districts"
  routes: OperatorRoute[];
  policy: OperatorPolicy;
}

// ── Standard Policies (base, each operator may override) ─────────────────────

const STD_POLICY: OperatorPolicy = {
  cancellation: 'Cancel 24h+ before: 10% fee. Cancel 12–24h: 25% fee. Cancel <12h: 50% fee. No refund after bus departure.',
  refund: 'Refund in 5–7 working days for mobile payment. 7–10 days for card/net banking. Counter tickets: cash refund same day.',
  luggage: '20kg free per passenger. Excess luggage: ৳5 per kg. No animals or hazardous items. Luggage goes in lower compartment only.',
  boarding: 'Arrive at counter 20–30 minutes before departure. Seat forfeited if not boarded 5 min before scheduled departure.',
  idRequired: false,
  childPolicy: 'Children under 3 travel free (no seat). Children 3–12: 50% fare with seat.',
  specialNotes: [
    'Verify fares at counter or on Shohoz.com — fares may change on holidays.',
    'During Eid, Puja and other holidays advance booking strongly recommended.',
  ],
};

// ── Operators ─────────────────────────────────────────────────────────────────

export const BUS_OPERATOR_DETAILS: BusOperatorDetail[] = [

  // ── GREEN LINE ──────────────────────────────────────────────────────────────
  {
    id: 'green_line',
    name: 'Green Line Paribahan',
    bnName: 'গ্রীন লাইন পরিবহন',
    shortName: 'GL',
    logo: '#006a4e',
    rating: 4.2,
    website: 'greenlinebd.com',
    phone: ['09613316557', '16557', '01886-776586'],
    email: 'greenline2009@gmail.com',
    headquarters: '9/2 Outer Circular Rd, Momen Bagh, Rajarbagh, Dhaka-1217',
    established: 1990,
    fleetSize: '60+ Volvo/Scania buses',
    busTypes: ['AC Sleeper (Volvo)', 'AC Sleeper (Scania)', 'Premium AC (MAN)'],
    coverage: 'Nationwide + Kolkata (India)',
    routes: [
      {
        id: 'gl_dhaka_chittagong',
        from: 'Dhaka', to: 'Chattogram', fromBn: 'ঢাকা', toBn: 'চট্টগ্রাম',
        dhakaCounters: ['Arambagh (Motijheel)', 'Kalyanpur', 'Mohakhali'],
        destCounters: ['Oxygen More (Chattogram City)', 'Agrabad', 'GEC Circle'],
        distanceKm: 242, durationHrs: '5-6h',
        fareNonAC: '৳680', fareAC: '৳1200',
        departureTimes: ['22:00', '23:00', '23:30', '07:00', '08:00'],
        returnTimes: ['22:00', '23:00', '07:00'],
        busType: ['AC Sleeper', 'AC'],
        stops: [
          { name: 'Dhaka (Arambagh)', bnName: 'ঢাকা (আরামবাগ)', type: 'origin' },
          { name: 'Kanchpur Bridge', bnName: 'কাঁচপুর ব্রিজ', arrivalTime: '01:00', type: 'stop' },
          { name: 'Cumilla (Cantonment)', bnName: 'কুমিল্লা (ক্যান্টনমেন্ট)', arrivalTime: '01:30', type: 'major' },
          { name: 'Feni', bnName: 'ফেনী', arrivalTime: '02:30', type: 'major' },
          { name: 'Sitakunda', bnName: 'সীতাকুণ্ড', arrivalTime: '03:30', type: 'stop' },
          { name: 'Chattogram (Oxygen More)', bnName: 'চট্টগ্রাম (অক্সিজেন মোড়)', arrivalTime: '04:00', type: 'destination' },
        ],
      },
      {
        id: 'gl_dhaka_coxsbazar',
        from: 'Dhaka', to: "Cox's Bazar", fromBn: 'ঢাকা', toBn: 'কক্সবাজার',
        dhakaCounters: ['Arambagh (Motijheel)', 'Kalyanpur', 'Mohakhali'],
        destCounters: ['Kolatoli', "Cox's Bazar Bus Terminal"],
        distanceKm: 430, durationHrs: '10-12h',
        fareNonAC: '৳900', fareAC: '৳1800',
        departureTimes: ['21:00', '22:00', '23:00'],
        returnTimes: ['21:00', '22:00'],
        busType: ['AC Sleeper', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Arambagh)', bnName: 'ঢাকা (আরামবাগ)', type: 'origin' },
          { name: 'Cumilla (Cantonment)', bnName: 'কুমিল্লা', arrivalTime: '23:30', type: 'major' },
          { name: 'Feni', bnName: 'ফেনী', arrivalTime: '00:30', type: 'major' },
          { name: 'Chattogram (Oxygen)', bnName: 'চট্টগ্রাম', arrivalTime: '02:00', type: 'major' },
          { name: 'Patiya', bnName: 'পটিয়া', arrivalTime: '02:45', type: 'stop' },
          { name: 'Chakaria', bnName: 'চকরিয়া', arrivalTime: '05:00', type: 'stop' },
          { name: "Cox's Bazar", bnName: 'কক্সবাজার', arrivalTime: '07:00', type: 'destination' },
        ],
      },
      {
        id: 'gl_dhaka_sylhet',
        from: 'Dhaka', to: 'Sylhet', fromBn: 'ঢাকা', toBn: 'সিলেট',
        dhakaCounters: ['Mohakhali', 'Arambagh'],
        destCounters: ['Sylhet Ambarkha', 'Sylhet City'],
        distanceKm: 240, durationHrs: '4-5h',
        fareNonAC: '৳570', fareAC: '৳1200',
        departureTimes: ['06:00', '08:00', '21:00', '22:00', '23:00'],
        returnTimes: ['06:00', '08:00', '21:00', '22:00'],
        busType: ['AC Sleeper', 'AC'],
        stops: [
          { name: 'Dhaka (Mohakhali)', bnName: 'ঢাকা (মহাখালী)', type: 'origin' },
          { name: 'Narsingdi', bnName: 'নরসিংদী', arrivalTime: '01:00', type: 'stop' },
          { name: 'Bhairab Bazar', bnName: 'ভৈরব বাজার', arrivalTime: '01:30', type: 'major' },
          { name: 'Brahmanbaria', bnName: 'ব্রাহ্মণবাড়িয়া', arrivalTime: '02:00', type: 'stop' },
          { name: 'Sylhet', bnName: 'সিলেট', arrivalTime: '05:00', type: 'destination' },
        ],
      },
      {
        id: 'gl_dhaka_khulna',
        from: 'Dhaka', to: 'Khulna', fromBn: 'ঢাকা', toBn: 'খুলনা',
        dhakaCounters: ['Kalyanpur', 'Gabtoli'],
        destCounters: ['Khulna Sonadanga Bus Terminal', 'Rupsha'],
        distanceKm: 270, durationHrs: '4-5h',
        fareNonAC: '৳650', fareAC: '৳1200',
        departureTimes: ['07:00', '08:30', '21:00', '22:00'],
        returnTimes: ['07:00', '21:00'],
        busType: ['AC Sleeper', 'AC'],
        stops: [
          { name: 'Dhaka (Kalyanpur)', bnName: 'ঢাকা (কল্যাণপুর)', type: 'origin' },
          { name: 'Mawa Ghat', bnName: 'মাওয়া ঘাট', arrivalTime: '01:00', type: 'stop' },
          { name: 'Bhanga (Padma Bridge)', bnName: 'ভাঙ্গা (পদ্মা সেতু)', arrivalTime: '01:15', type: 'major' },
          { name: 'Faridpur', bnName: 'ফরিদপুর', arrivalTime: '01:45', type: 'stop' },
          { name: 'Jessore (Notun Bus Stand)', bnName: 'যশোর', arrivalTime: '03:00', type: 'major' },
          { name: 'Khulna', bnName: 'খুলনা', arrivalTime: '04:30', type: 'destination' },
        ],
      },
      {
        id: 'gl_dhaka_benapole',
        from: 'Dhaka', to: 'Benapole', fromBn: 'ঢাকা', toBn: 'বেনাপোল',
        dhakaCounters: ['Gabtoli', 'Kalyanpur'],
        destCounters: ['Benapole Zero Point', 'Benapole Land Port'],
        distanceKm: 215, durationHrs: '3.5-4.5h',
        fareNonAC: '৳700', fareAC: '৳1200',
        departureTimes: ['07:00', '08:00', '09:00', '10:00'],
        returnTimes: ['07:00', '08:00', '12:00'],
        busType: ['AC', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Bhanga (Padma Bridge)', bnName: 'ভাঙ্গা', arrivalTime: '01:15', type: 'major' },
          { name: 'Jessore', bnName: 'যশোর', arrivalTime: '03:00', type: 'major' },
          { name: 'Benapole (Zero Point)', bnName: 'বেনাপোল (জিরো পয়েন্ট)', arrivalTime: '04:00', type: 'destination' },
        ],
      },
    ],
    policy: {
      ...STD_POLICY,
      cancellation: 'Cancel 24h+: 10% fee. Cancel 12–24h: 20% fee. Cancel <12h: 50% fee. Counter tickets: non-refundable after departure.',
      luggage: '20kg free. Extra ৳5/kg. No food items in premium sleepers.',
      idRequired: true,
      specialNotes: [
        'Premium Volvo/Scania sleeper — bring NID/passport for identity verification.',
        'Online booking via greenlinebd.com or Shohoz.com.',
        'International route (Kolkata) requires passport.',
      ],
    },
  },

  // ── SHOHAG ─────────────────────────────────────────────────────────────────
  {
    id: 'shohag',
    name: 'Shohag Paribahan',
    bnName: 'সোহাগ পরিবহন',
    shortName: 'SH',
    logo: '#1e40af',
    rating: 4.3,
    website: 'shohagparibahan.com',
    phone: ['01711-612433', '09614-000777'],
    headquarters: 'Malibagh, Dhaka',
    fleetSize: '100+ buses',
    busTypes: ['AC (Double Decker)', 'AC Coach', 'Semi-Sleeper AC', 'Non-AC'],
    coverage: 'Southern & Western Bangladesh',
    routes: [
      {
        id: 'sh_dhaka_khulna',
        from: 'Dhaka', to: 'Khulna', fromBn: 'ঢাকা', toBn: 'খুলনা',
        dhakaCounters: ['Malibagh', 'Gabtoli', 'Jigatola'],
        destCounters: ['Khulna Sonadanga Terminal', 'Shibbari More'],
        distanceKm: 270, durationHrs: '4-5h',
        fareNonAC: '৳650', fareAC: '৳1100',
        departureTimes: ['06:30', '07:30', '08:30', '09:30', '14:00', '15:00', '21:00', '22:00', '23:00'],
        returnTimes: ['06:30', '07:30', '14:00', '21:00', '22:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Malibagh)', bnName: 'ঢাকা (মালিবাগ)', type: 'origin' },
          { name: 'Postogola Bridge', bnName: 'পোস্তগোলা ব্রিজ', arrivalTime: '00:20', type: 'stop' },
          { name: 'Mawa Ghat', bnName: 'মাওয়া ঘাট', arrivalTime: '01:00', type: 'stop' },
          { name: 'Bhanga (Padma Bridge)', bnName: 'ভাঙ্গা (পদ্মা সেতু)', arrivalTime: '01:20', type: 'major' },
          { name: 'Faridpur', bnName: 'ফরিদপুর', arrivalTime: '01:50', type: 'stop' },
          { name: 'Jessore', bnName: 'যশোর', arrivalTime: '03:00', type: 'major' },
          { name: 'Khulna', bnName: 'খুলনা', arrivalTime: '04:30', type: 'destination' },
        ],
      },
      {
        id: 'sh_dhaka_barisal',
        from: 'Dhaka', to: 'Barishal', fromBn: 'ঢাকা', toBn: 'বরিশাল',
        dhakaCounters: ['Malibagh', 'Gabtoli', 'Gulistan'],
        destCounters: ['Barishal Natullabad Bus Stand', 'Barishal City'],
        distanceKm: 185, durationHrs: '3-4h',
        fareNonAC: '৳500', fareAC: '৳900',
        departureTimes: ['07:00', '08:00', '09:00', '12:00', '14:00', '15:00', '21:00', '22:00'],
        returnTimes: ['07:00', '08:00', '14:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Malibagh)', bnName: 'ঢাকা (মালিবাগ)', type: 'origin' },
          { name: 'Bhanga (Padma Bridge)', bnName: 'ভাঙ্গা (পদ্মা সেতু)', arrivalTime: '01:20', type: 'major' },
          { name: 'Faridpur', bnName: 'ফরিদপুর', arrivalTime: '01:50', type: 'stop' },
          { name: 'Madaripur', bnName: 'মাদারীপুর', arrivalTime: '02:15', type: 'stop' },
          { name: 'Barishal (Natullabad)', bnName: 'বরিশাল (নথুল্লাবাদ)', arrivalTime: '03:30', type: 'destination' },
        ],
      },
      {
        id: 'sh_dhaka_jessore',
        from: 'Dhaka', to: 'Jashore', fromBn: 'ঢাকা', toBn: 'যশোর',
        dhakaCounters: ['Malibagh', 'Gabtoli'],
        destCounters: ['Jessore Notun Bus Stand'],
        distanceKm: 210, durationHrs: '3-4h',
        fareNonAC: '৳600', fareAC: '৳1000',
        departureTimes: ['07:00', '08:00', '10:00', '14:00', '21:00', '22:00'],
        returnTimes: ['07:00', '14:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Malibagh)', bnName: 'ঢাকা (মালিবাগ)', type: 'origin' },
          { name: 'Bhanga (Padma Bridge)', bnName: 'ভাঙ্গা', arrivalTime: '01:20', type: 'major' },
          { name: 'Jessore', bnName: 'যশোর', arrivalTime: '03:00', type: 'destination' },
        ],
      },
      {
        id: 'sh_dhaka_satkhira',
        from: 'Dhaka', to: 'Satkhira', fromBn: 'ঢাকা', toBn: 'সাতক্ষীরা',
        dhakaCounters: ['Malibagh', 'Gabtoli'],
        destCounters: ['Satkhira Bus Terminal'],
        distanceKm: 290, durationHrs: '5-6h',
        fareNonAC: '৳700', fareAC: '৳1200',
        departureTimes: ['07:00', '21:00', '22:00'],
        returnTimes: ['07:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Malibagh)', bnName: 'ঢাকা (মালিবাগ)', type: 'origin' },
          { name: 'Bhanga', bnName: 'ভাঙ্গা', arrivalTime: '01:20', type: 'major' },
          { name: 'Jessore', bnName: 'যশোর', arrivalTime: '03:00', type: 'major' },
          { name: 'Satkhira', bnName: 'সাতক্ষীরা', arrivalTime: '05:00', type: 'destination' },
        ],
      },
    ],
    policy: {
      ...STD_POLICY,
      specialNotes: [
        'Book via Shohoz.com or counter at Malibagh/Gabtoli.',
        'Double Decker AC service on Dhaka–Khulna corridor.',
        'Padma Bridge routes: no ferry crossing, consistent schedules.',
      ],
    },
  },

  // ── HANIF ──────────────────────────────────────────────────────────────────
  {
    id: 'hanif',
    name: 'Hanif Enterprise',
    bnName: 'হানিফ এন্টারপ্রাইজ',
    shortName: 'HF',
    logo: '#b91c1c',
    rating: 4.0,
    website: 'hanifenterprise.com',
    phone: ['01713-402641', '01713-402673', '16374'],
    headquarters: 'Panthapath, Dhaka',
    established: 1984,
    fleetSize: '200+ buses',
    busTypes: ['AC Sleeper', 'AC Coach', 'Non-AC', 'Double Decker'],
    coverage: 'All 64 districts',
    routes: [
      {
        id: 'hf_dhaka_chittagong',
        from: 'Dhaka', to: 'Chattogram', fromBn: 'ঢাকা', toBn: 'চট্টগ্রাম',
        dhakaCounters: ['Sayedabad', 'Arambagh', 'Kalyanpur'],
        destCounters: ['Chittagong Dampara', 'Agrabad'],
        distanceKm: 242, durationHrs: '5-6h',
        fareNonAC: '৳680', fareAC: '৳1100',
        departureTimes: ['06:00', '07:00', '22:00', '23:00'],
        returnTimes: ['06:00', '22:00'],
        busType: ['AC Sleeper', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Sayedabad)', bnName: 'ঢাকা (সায়েদাবাদ)', type: 'origin' },
          { name: 'Kanchpur', bnName: 'কাঁচপুর', arrivalTime: '00:40', type: 'stop' },
          { name: 'Cumilla', bnName: 'কুমিল্লা', arrivalTime: '01:30', type: 'major' },
          { name: 'Feni', bnName: 'ফেনী', arrivalTime: '02:30', type: 'major' },
          { name: 'Chattogram', bnName: 'চট্টগ্রাম', arrivalTime: '04:00', type: 'destination' },
        ],
      },
      {
        id: 'hf_dhaka_coxsbazar',
        from: 'Dhaka', to: "Cox's Bazar", fromBn: 'ঢাকা', toBn: 'কক্সবাজার',
        dhakaCounters: ['Sayedabad', 'Arambagh'],
        destCounters: ["Cox's Bazar Terminal", 'Kolatoli'],
        distanceKm: 430, durationHrs: '10-12h',
        fareNonAC: '৳900', fareAC: '৳1600',
        departureTimes: ['21:00', '22:00', '23:00'],
        returnTimes: ['21:00', '22:00'],
        busType: ['AC Sleeper', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Sayedabad)', bnName: 'ঢাকা (সায়েদাবাদ)', type: 'origin' },
          { name: 'Cumilla', bnName: 'কুমিল্লা', arrivalTime: '23:30', type: 'major' },
          { name: 'Feni', bnName: 'ফেনী', arrivalTime: '00:30', type: 'major' },
          { name: 'Chattogram', bnName: 'চট্টগ্রাম', arrivalTime: '02:00', type: 'major' },
          { name: 'Chakaria', bnName: 'চকরিয়া', arrivalTime: '05:00', type: 'stop' },
          { name: "Cox's Bazar", bnName: 'কক্সবাজার', arrivalTime: '07:00', type: 'destination' },
        ],
      },
      {
        id: 'hf_dhaka_sylhet',
        from: 'Dhaka', to: 'Sylhet', fromBn: 'ঢাকা', toBn: 'সিলেট',
        dhakaCounters: ['Mohakhali', 'Sayedabad'],
        destCounters: ['Sylhet Ambarkha', 'Amberkhana'],
        distanceKm: 240, durationHrs: '4-5h',
        fareNonAC: '৳570', fareAC: '৳1000',
        departureTimes: ['07:00', '08:00', '22:00', '23:00'],
        returnTimes: ['07:00', '22:00'],
        busType: ['AC', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Mohakhali)', bnName: 'ঢাকা (মহাখালী)', type: 'origin' },
          { name: 'Narsingdi', bnName: 'নরসিংদী', arrivalTime: '01:00', type: 'stop' },
          { name: 'Bhairab', bnName: 'ভৈরব', arrivalTime: '01:30', type: 'major' },
          { name: 'Brahmanbaria', bnName: 'ব্রাহ্মণবাড়িয়া', arrivalTime: '02:00', type: 'stop' },
          { name: 'Sylhet', bnName: 'সিলেট', arrivalTime: '05:00', type: 'destination' },
        ],
      },
      {
        id: 'hf_dhaka_rajshahi',
        from: 'Dhaka', to: 'Rajshahi', fromBn: 'ঢাকা', toBn: 'রাজশাহী',
        dhakaCounters: ['Gabtoli', 'Kalyanpur'],
        destCounters: ['Rajshahi Shaheb Bazar', 'Rajshahi Bus Terminal'],
        distanceKm: 265, durationHrs: '5-6h',
        fareNonAC: '৳650', fareAC: '৳1100',
        departureTimes: ['07:00', '08:00', '09:00', '21:00', '22:00'],
        returnTimes: ['07:00', '08:00', '21:00'],
        busType: ['AC', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Aricha Ghat / Paturia', bnName: 'আরিচা / পাটুরিয়া', arrivalTime: '01:30', type: 'major' },
          { name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', arrivalTime: '02:30', type: 'major' },
          { name: 'Natore', bnName: 'নাটোর', arrivalTime: '04:00', type: 'stop' },
          { name: 'Rajshahi', bnName: 'রাজশাহী', arrivalTime: '05:30', type: 'destination' },
        ],
      },
    ],
    policy: {
      ...STD_POLICY,
      specialNotes: [
        'Nationwide coverage — 64 districts served.',
        'Book online via Shohoz.com or call 16374.',
        'Hanif has been operating since 1984 — one of oldest operators.',
      ],
    },
  },

  // ── NABIL ──────────────────────────────────────────────────────────────────
  {
    id: 'nabil',
    name: 'Nabil Paribahan',
    bnName: 'নাবিল পরিবহন',
    shortName: 'NB',
    logo: '#0369a1',
    rating: 4.1,
    website: 'nabilparibahan.com',
    phone: ['01985-555554', '01193-106611', '09613655555'],
    headquarters: 'Gabtoli, Dhaka',
    established: 1996,
    fleetSize: '80+ buses',
    busTypes: ['AC Coach', 'AC Sleeper', 'Non-AC'],
    coverage: 'Northern Bangladesh',
    routes: [
      {
        id: 'nb_dhaka_rangpur',
        from: 'Dhaka', to: 'Rangpur', fromBn: 'ঢাকা', toBn: 'রংপুর',
        dhakaCounters: ['Gabtoli', 'Kalyanpur', 'Uttara (Mazar Road)'],
        destCounters: ['Rangpur Modern Mor', 'Rangpur Bus Terminal'],
        distanceKm: 320, durationHrs: '6-7h',
        fareNonAC: '৳800', fareAC: '৳1300',
        departureTimes: ['07:00', '08:00', '09:00', '21:00', '22:00', '23:00'],
        returnTimes: ['07:00', '08:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Tangail', bnName: 'টাঙ্গাইল', arrivalTime: '01:30', type: 'major' },
          { name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', arrivalTime: '02:30', type: 'major' },
          { name: 'Bogura', bnName: 'বগুড়া', arrivalTime: '03:30', type: 'major' },
          { name: 'Gaibandha', bnName: 'গাইবান্ধা', arrivalTime: '04:30', type: 'stop' },
          { name: 'Rangpur', bnName: 'রংপুর', arrivalTime: '06:00', type: 'destination' },
        ],
      },
      {
        id: 'nb_dhaka_dinajpur',
        from: 'Dhaka', to: 'Dinajpur', fromBn: 'ঢাকা', toBn: 'দিনাজপুর',
        dhakaCounters: ['Gabtoli', 'Kalyanpur', 'Uttara'],
        destCounters: ['Dinajpur Town', 'Dinajpur Bus Stand'],
        distanceKm: 430, durationHrs: '7-8h',
        fareNonAC: '৳850', fareAC: '৳1400',
        departureTimes: ['07:00', '08:00', '21:00', '22:00'],
        returnTimes: ['07:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Tangail', bnName: 'টাঙ্গাইল', arrivalTime: '01:30', type: 'major' },
          { name: 'Bogura', bnName: 'বগুড়া', arrivalTime: '03:30', type: 'major' },
          { name: 'Rangpur', bnName: 'রংপুর', arrivalTime: '05:30', type: 'major' },
          { name: 'Saidpur', bnName: 'সৈয়দপুর', arrivalTime: '06:30', type: 'stop' },
          { name: 'Dinajpur', bnName: 'দিনাজপুর', arrivalTime: '07:30', type: 'destination' },
        ],
      },
      {
        id: 'nb_dhaka_thakurgaon',
        from: 'Dhaka', to: 'Thakurgaon', fromBn: 'ঢাকা', toBn: 'ঠাকুরগাঁও',
        dhakaCounters: ['Gabtoli', 'Uttara'],
        destCounters: ['Thakurgaon Bus Terminal'],
        distanceKm: 480, durationHrs: '8-9h',
        fareNonAC: '৳950', fareAC: '৳1600',
        departureTimes: ['07:00', '21:00'],
        returnTimes: ['07:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Bogura', bnName: 'বগুড়া', arrivalTime: '03:30', type: 'major' },
          { name: 'Rangpur', bnName: 'রংপুর', arrivalTime: '05:30', type: 'major' },
          { name: 'Dinajpur', bnName: 'দিনাজপুর', arrivalTime: '07:30', type: 'major' },
          { name: 'Thakurgaon', bnName: 'ঠাকুরগাঁও', arrivalTime: '08:30', type: 'destination' },
        ],
      },
    ],
    policy: {
      ...STD_POLICY,
      specialNotes: [
        'Specialist in northern Bangladesh routes.',
        'Earliest morning departures from Gabtoli 7 AM.',
        'Book via Shohoz.com, call 09613655555.',
      ],
    },
  },

  // ── ENA TRANSPORT ──────────────────────────────────────────────────────────
  {
    id: 'ena',
    name: 'Ena Transport',
    bnName: 'এনা পরিবহন',
    shortName: 'EN',
    logo: '#7c3aed',
    rating: 4.1,
    website: 'enatransport.com',
    phone: ['01712-069722', '16353'],
    headquarters: 'Mohakhali, Dhaka',
    fleetSize: '150+ buses',
    busTypes: ['AC Coach', 'Non-AC', 'Mini Coach'],
    coverage: 'Dhaka Metro + Central Bangladesh',
    routes: [
      {
        id: 'en_dhaka_mymensingh',
        from: 'Dhaka', to: 'Mymensingh', fromBn: 'ঢাকা', toBn: 'ময়মনসিংহ',
        dhakaCounters: ['Mohakhali', 'Rampura'],
        destCounters: ['Mymensingh Town Hall', 'Circuit House Mor'],
        distanceKm: 120, durationHrs: '2-2.5h',
        fareNonAC: '৳350', fareAC: '৳500',
        departureTimes: ['07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
        returnTimes: ['07:00', '09:00', '14:00', '16:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Mohakhali)', bnName: 'ঢাকা (মহাখালী)', type: 'origin' },
          { name: 'Tongi', bnName: 'টঙ্গী', arrivalTime: '00:30', type: 'stop' },
          { name: 'Mymensingh', bnName: 'ময়মনসিংহ', arrivalTime: '02:00', type: 'destination' },
        ],
      },
      {
        id: 'en_dhaka_sylhet',
        from: 'Dhaka', to: 'Sylhet', fromBn: 'ঢাকা', toBn: 'সিলেট',
        dhakaCounters: ['Mohakhali'],
        destCounters: ['Sylhet Ambarkha'],
        distanceKm: 240, durationHrs: '4-5h',
        fareNonAC: '৳570', fareAC: '৳900',
        departureTimes: ['07:00', '08:00', '22:00', '23:00'],
        returnTimes: ['07:00', '22:00'],
        busType: ['AC', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Mohakhali)', bnName: 'ঢাকা (মহাখালী)', type: 'origin' },
          { name: 'Narsingdi', bnName: 'নরসিংদী', arrivalTime: '01:00', type: 'stop' },
          { name: 'Bhairab', bnName: 'ভৈরব', arrivalTime: '01:30', type: 'major' },
          { name: 'Sylhet', bnName: 'সিলেট', arrivalTime: '05:00', type: 'destination' },
        ],
      },
      {
        id: 'en_dhaka_kishoreganj',
        from: 'Dhaka', to: 'Kishoreganj', fromBn: 'ঢাকা', toBn: 'কিশোরগঞ্জ',
        dhakaCounters: ['Mohakhali'],
        destCounters: ['Kishoreganj Town'],
        distanceKm: 100, durationHrs: '2h',
        fareNonAC: '৳400', fareAC: '৳600',
        departureTimes: ['07:00', '08:00', '09:00', '14:00'],
        returnTimes: ['07:00', '09:00', '14:00'],
        busType: ['AC', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Mohakhali)', bnName: 'ঢাকা (মহাখালী)', type: 'origin' },
          { name: 'Bhairab', bnName: 'ভৈরব', arrivalTime: '01:30', type: 'stop' },
          { name: 'Kishoreganj', bnName: 'কিশোরগঞ্জ', arrivalTime: '02:00', type: 'destination' },
        ],
      },
    ],
    policy: STD_POLICY,
  },

  // ── SR TRAVELS ─────────────────────────────────────────────────────────────
  {
    id: 'sr_travels',
    name: 'SR Travels',
    bnName: 'এসআর ট্রাভেলস',
    shortName: 'SR',
    logo: '#b45309',
    rating: 4.0,
    website: 'srtravels.com.bd',
    phone: ['01716-560641', '01711-356616'],
    headquarters: 'Gabtoli, Dhaka',
    fleetSize: '60+ buses',
    busTypes: ['AC Coach', 'Non-AC'],
    coverage: 'Northern & Rajshahi Division',
    routes: [
      {
        id: 'sr_dhaka_bogura',
        from: 'Dhaka', to: 'Bogura', fromBn: 'ঢাকা', toBn: 'বগুড়া',
        dhakaCounters: ['Gabtoli', 'Kalyanpur'],
        destCounters: ['Bogura Tinmatha', 'Satmatha'],
        distanceKm: 250, durationHrs: '4-5h',
        fareNonAC: '৳500', fareAC: '৳900',
        departureTimes: ['07:00', '08:00', '09:00', '14:00', '21:00', '22:00'],
        returnTimes: ['07:00', '09:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Tangail', bnName: 'টাঙ্গাইল', arrivalTime: '01:30', type: 'major' },
          { name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', arrivalTime: '02:30', type: 'major' },
          { name: 'Bogura', bnName: 'বগুড়া', arrivalTime: '04:00', type: 'destination' },
        ],
      },
      {
        id: 'sr_dhaka_rajshahi',
        from: 'Dhaka', to: 'Rajshahi', fromBn: 'ঢাকা', toBn: 'রাজশাহী',
        dhakaCounters: ['Gabtoli', 'Kalyanpur'],
        destCounters: ['Rajshahi Shaheb Bazar'],
        distanceKm: 265, durationHrs: '5h',
        fareNonAC: '৳650', fareAC: '৳1000',
        departureTimes: ['07:00', '08:00', '21:00', '22:00'],
        returnTimes: ['07:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Tangail', bnName: 'টাঙ্গাইল', arrivalTime: '01:30', type: 'major' },
          { name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', arrivalTime: '02:30', type: 'major' },
          { name: 'Bogura', bnName: 'বগুড়া', arrivalTime: '04:00', type: 'major' },
          { name: 'Natore', bnName: 'নাটোর', arrivalTime: '04:45', type: 'stop' },
          { name: 'Rajshahi', bnName: 'রাজশাহী', arrivalTime: '05:30', type: 'destination' },
        ],
      },
    ],
    policy: STD_POLICY,
  },

  // ── SAKURA ─────────────────────────────────────────────────────────────────
  {
    id: 'sakura',
    name: 'Sakura Paribahan',
    bnName: 'সাকুরা পরিবহন',
    shortName: 'SK',
    logo: '#be185d',
    rating: 4.0,
    website: 'sakuraparibahan.com',
    phone: ['01729-556677', '01711-4022341'],
    headquarters: 'Gabtoli / Sayedabad, Dhaka',
    fleetSize: '80+ buses',
    busTypes: ['AC Coach', 'Non-AC'],
    coverage: 'Barishal Division + Kuakata',
    routes: [
      {
        id: 'sk_dhaka_barisal',
        from: 'Dhaka', to: 'Barishal', fromBn: 'ঢাকা', toBn: 'বরিশাল',
        dhakaCounters: ['Gabtoli', 'Sayedabad', 'Gulistan'],
        destCounters: ['Barishal Natullabad Bus Stand'],
        distanceKm: 185, durationHrs: '3-4h',
        fareNonAC: '৳500', fareAC: '৳900',
        departureTimes: ['07:00', '08:00', '09:00', '14:00', '21:00', '22:00'],
        returnTimes: ['07:00', '14:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Padma Bridge (Bhanga)', bnName: 'পদ্মা সেতু (ভাঙ্গা)', arrivalTime: '01:20', type: 'major' },
          { name: 'Faridpur', bnName: 'ফরিদপুর', arrivalTime: '01:50', type: 'stop' },
          { name: 'Madaripur', bnName: 'মাদারীপুর', arrivalTime: '02:20', type: 'stop' },
          { name: 'Barishal', bnName: 'বরিশাল', arrivalTime: '03:30', type: 'destination' },
        ],
      },
      {
        id: 'sk_dhaka_kuakata',
        from: 'Dhaka', to: 'Kuakata', fromBn: 'ঢাকা', toBn: 'কুয়াকাটা',
        dhakaCounters: ['Gabtoli', 'Sayedabad'],
        destCounters: ['Kuakata Beach', 'Patuakhali Bus Terminal'],
        distanceKm: 330, durationHrs: '6-7h',
        fareNonAC: '৳850', fareAC: '৳1500',
        departureTimes: ['07:00', '21:00', '22:00'],
        returnTimes: ['07:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Padma Bridge', bnName: 'পদ্মা সেতু', arrivalTime: '01:20', type: 'major' },
          { name: 'Barishal', bnName: 'বরিশাল', arrivalTime: '03:30', type: 'major' },
          { name: 'Patuakhali', bnName: 'পটুয়াখালী', arrivalTime: '04:30', type: 'major' },
          { name: 'Kuakata', bnName: 'কুয়াকাটা', arrivalTime: '06:30', type: 'destination' },
        ],
      },
    ],
    policy: STD_POLICY,
  },

  // ── SAUDIA ─────────────────────────────────────────────────────────────────
  {
    id: 'saudia',
    name: 'Saudia Paribahan',
    bnName: 'সৌদিয়া পরিবহন',
    shortName: 'SD',
    logo: '#166534',
    rating: 4.1,
    website: 'saudiaparibahan.com',
    phone: ['01711-629960', '09613316161'],
    headquarters: 'Arambagh / Kalyanpur, Dhaka',
    fleetSize: '70+ buses',
    busTypes: ['AC Sleeper', 'AC Coach', 'Non-AC'],
    coverage: 'Chittagong Division + Cox\'s Bazar corridor',
    routes: [
      {
        id: 'sd_dhaka_chittagong',
        from: 'Dhaka', to: 'Chattogram', fromBn: 'ঢাকা', toBn: 'চট্টগ্রাম',
        dhakaCounters: ['Arambagh', 'Kalyanpur', 'Fakirapool'],
        destCounters: ['Chattogram Oxygen More', 'Kazir Dewri'],
        distanceKm: 242, durationHrs: '5-6h',
        fareNonAC: '৳680', fareAC: '৳1200',
        departureTimes: ['07:00', '08:00', '22:00', '23:00'],
        returnTimes: ['07:00', '22:00'],
        busType: ['AC Sleeper', 'AC'],
        stops: [
          { name: 'Dhaka (Arambagh)', bnName: 'ঢাকা (আরামবাগ)', type: 'origin' },
          { name: 'Kanchpur', bnName: 'কাঁচপুর', arrivalTime: '00:40', type: 'stop' },
          { name: 'Cumilla', bnName: 'কুমিল্লা', arrivalTime: '01:30', type: 'major' },
          { name: 'Feni', bnName: 'ফেনী', arrivalTime: '02:30', type: 'major' },
          { name: 'Chattogram', bnName: 'চট্টগ্রাম', arrivalTime: '04:00', type: 'destination' },
        ],
      },
      {
        id: 'sd_dhaka_coxsbazar',
        from: 'Dhaka', to: "Cox's Bazar", fromBn: 'ঢাকা', toBn: 'কক্সবাজার',
        dhakaCounters: ['Arambagh', 'Fakirapool', 'Sayedabad'],
        destCounters: ["Cox's Bazar Kolatoli", "Cox's Bazar Bus Terminal"],
        distanceKm: 430, durationHrs: '10-12h',
        fareNonAC: '৳900', fareAC: '৳1800',
        departureTimes: ['21:00', '22:00', '23:00'],
        returnTimes: ['21:00', '22:00'],
        busType: ['AC Sleeper', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Arambagh)', bnName: 'ঢাকা (আরামবাগ)', type: 'origin' },
          { name: 'Cumilla', bnName: 'কুমিল্লা', arrivalTime: '23:30', type: 'major' },
          { name: 'Feni', bnName: 'ফেনী', arrivalTime: '00:30', type: 'major' },
          { name: 'Chattogram', bnName: 'চট্টগ্রাম', arrivalTime: '02:00', type: 'major' },
          { name: 'Chakaria', bnName: 'চকরিয়া', arrivalTime: '05:00', type: 'stop' },
          { name: "Cox's Bazar", bnName: 'কক্সবাজার', arrivalTime: '07:00', type: 'destination' },
        ],
      },
    ],
    policy: STD_POLICY,
  },

  // ── DESH TRAVELS ────────────────────────────────────────────────────────────
  {
    id: 'desh_travels',
    name: 'Desh Travels',
    bnName: 'দেশ ট্রাভেলস',
    shortName: 'DT',
    logo: '#92400e',
    rating: 3.9,
    website: 'deshtravels.com.bd',
    phone: ['01762-684433', '01762-684405'],
    headquarters: 'Kalyanpur / Arambagh, Dhaka',
    fleetSize: '50+ buses',
    busTypes: ['AC Coach', 'Non-AC'],
    coverage: 'Rajshahi Division',
    routes: [
      {
        id: 'dt_dhaka_rajshahi',
        from: 'Dhaka', to: 'Rajshahi', fromBn: 'ঢাকা', toBn: 'রাজশাহী',
        dhakaCounters: ['Kalyanpur', 'Arambagh'],
        destCounters: ['Rajshahi Shaheb Bazar', 'Rajshahi Bus Terminal'],
        distanceKm: 265, durationHrs: '5-6h',
        fareNonAC: '৳650', fareAC: '৳1100',
        departureTimes: ['07:00', '08:00', '09:00', '21:00', '22:00'],
        returnTimes: ['07:00', '08:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Kalyanpur)', bnName: 'ঢাকা (কল্যাণপুর)', type: 'origin' },
          { name: 'Aricha Ghat', bnName: 'আরিচা ঘাট', arrivalTime: '01:30', type: 'major' },
          { name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', arrivalTime: '02:30', type: 'major' },
          { name: 'Natore', bnName: 'নাটোর', arrivalTime: '04:00', type: 'stop' },
          { name: 'Rajshahi', bnName: 'রাজশাহী', arrivalTime: '05:30', type: 'destination' },
        ],
      },
      {
        id: 'dt_dhaka_chapai',
        from: 'Dhaka', to: 'Chapainawabganj', fromBn: 'ঢাকা', toBn: 'চাঁপাইনবাবগঞ্জ',
        dhakaCounters: ['Kalyanpur', 'Arambagh'],
        destCounters: ['Chapainawabganj Bus Terminal'],
        distanceKm: 310, durationHrs: '6-7h',
        fareNonAC: '৳800', fareAC: '৳1300',
        departureTimes: ['07:00', '21:00'],
        returnTimes: ['07:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Kalyanpur)', bnName: 'ঢাকা (কল্যাণপুর)', type: 'origin' },
          { name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', arrivalTime: '02:30', type: 'major' },
          { name: 'Rajshahi', bnName: 'রাজশাহী', arrivalTime: '05:30', type: 'major' },
          { name: 'Chapainawabganj', bnName: 'চাঁপাইনবাবগঞ্জ', arrivalTime: '06:30', type: 'destination' },
        ],
      },
    ],
    policy: STD_POLICY,
  },

  // ── EAGLE ──────────────────────────────────────────────────────────────────
  {
    id: 'eagle',
    name: 'Eagle Paribahan',
    bnName: 'ঈগল পরিবহন',
    shortName: 'EG',
    logo: '#1d4ed8',
    rating: 4.0,
    website: 'eagleparibahan.com',
    phone: ['+8802477763501', '01750038855'],
    headquarters: 'Jess Tower, M.K. Road, Jessore-7400',
    fleetSize: '80+ buses',
    busTypes: ['AC Coach', 'Non-AC'],
    coverage: 'Southern Bangladesh + Jessore corridor',
    routes: [
      {
        id: 'eg_dhaka_jessore',
        from: 'Dhaka', to: 'Jashore', fromBn: 'ঢাকা', toBn: 'যশোর',
        dhakaCounters: ['Gabtoli', 'Kalyanpur'],
        destCounters: ['Jessore Notun Bus Stand', 'Jessore Circuit House'],
        distanceKm: 210, durationHrs: '3.5-4.5h',
        fareNonAC: '৳600', fareAC: '৳1000',
        departureTimes: ['07:00', '08:00', '09:00', '14:00', '21:00', '22:00'],
        returnTimes: ['07:00', '09:00', '21:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Padma Bridge (Bhanga)', bnName: 'পদ্মা সেতু (ভাঙ্গা)', arrivalTime: '01:20', type: 'major' },
          { name: 'Faridpur', bnName: 'ফরিদপুর', arrivalTime: '01:50', type: 'stop' },
          { name: 'Jessore', bnName: 'যশোর', arrivalTime: '03:30', type: 'destination' },
        ],
      },
      {
        id: 'eg_dhaka_benapole',
        from: 'Dhaka', to: 'Benapole', fromBn: 'ঢাকা', toBn: 'বেনাপোল',
        dhakaCounters: ['Gabtoli', 'Kalyanpur'],
        destCounters: ['Benapole Zero Point', 'Benapole Land Port Gate'],
        distanceKm: 215, durationHrs: '3.5-4.5h',
        fareNonAC: '৳700', fareAC: '৳1100',
        departureTimes: ['07:00', '08:00', '09:00', '10:00', '11:00'],
        returnTimes: ['08:00', '09:00', '10:00', '11:00', '12:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Padma Bridge (Bhanga)', bnName: 'পদ্মা সেতু (ভাঙ্গা)', arrivalTime: '01:20', type: 'major' },
          { name: 'Jessore', bnName: 'যশোর', arrivalTime: '03:00', type: 'major' },
          { name: 'Benapole', bnName: 'বেনাপোল', arrivalTime: '04:00', type: 'destination' },
        ],
      },
      {
        id: 'eg_dhaka_narail',
        from: 'Dhaka', to: 'Narail', fromBn: 'ঢাকা', toBn: 'নড়াইল',
        dhakaCounters: ['Gabtoli'],
        destCounters: ['Narail Bus Terminal'],
        distanceKm: 190, durationHrs: '4h',
        fareNonAC: '৳550', fareAC: '৳900',
        departureTimes: ['07:00', '08:00', '14:00'],
        returnTimes: ['07:00', '14:00'],
        busType: ['Non-AC'],
        stops: [
          { name: 'Dhaka (Gabtoli)', bnName: 'ঢাকা (গাবতলী)', type: 'origin' },
          { name: 'Padma Bridge', bnName: 'পদ্মা সেতু', arrivalTime: '01:20', type: 'major' },
          { name: 'Narail', bnName: 'নড়াইল', arrivalTime: '04:00', type: 'destination' },
        ],
      },
    ],
    policy: STD_POLICY,
  },

  // ── TISHA ──────────────────────────────────────────────────────────────────
  {
    id: 'tisha',
    name: 'Tisha Paribahan',
    bnName: 'তিশা পরিবহন',
    shortName: 'TP',
    logo: '#065f46',
    rating: 3.9,
    website: 'tishaparibahan.com',
    phone: ['01711-386408'],
    headquarters: 'Sayedabad / Arambagh, Dhaka',
    fleetSize: '60+ buses',
    busTypes: ['AC Coach', 'Non-AC'],
    coverage: 'Chattogram Division + Brahmanbaria',
    routes: [
      {
        id: 'tp_dhaka_chittagong',
        from: 'Dhaka', to: 'Chattogram', fromBn: 'ঢাকা', toBn: 'চট্টগ্রাম',
        dhakaCounters: ['Sayedabad', 'Arambagh'],
        destCounters: ['Chattogram Dampara', 'Oxygen More'],
        distanceKm: 242, durationHrs: '5-6h',
        fareNonAC: '৳680', fareAC: '৳1100',
        departureTimes: ['07:00', '08:00', '22:00', '23:00'],
        returnTimes: ['07:00', '22:00'],
        busType: ['AC Coach', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Sayedabad)', bnName: 'ঢাকা (সায়েদাবাদ)', type: 'origin' },
          { name: 'Cumilla', bnName: 'কুমিল্লা', arrivalTime: '01:30', type: 'major' },
          { name: 'Feni', bnName: 'ফেনী', arrivalTime: '02:30', type: 'major' },
          { name: 'Chattogram', bnName: 'চট্টগ্রাম', arrivalTime: '04:00', type: 'destination' },
        ],
      },
      {
        id: 'tp_dhaka_brahmanbaria',
        from: 'Dhaka', to: 'Brahmanbaria', fromBn: 'ঢাকা', toBn: 'ব্রাহ্মণবাড়িয়া',
        dhakaCounters: ['Sayedabad', 'Mohakhali'],
        destCounters: ['Brahmanbaria Bus Terminal'],
        distanceKm: 100, durationHrs: '2-2.5h',
        fareNonAC: '৳350', fareAC: '৳500',
        departureTimes: ['07:00', '08:00', '09:00', '14:00', '16:00'],
        returnTimes: ['07:00', '09:00', '14:00'],
        busType: ['AC', 'Non-AC'],
        stops: [
          { name: 'Dhaka (Sayedabad)', bnName: 'ঢাকা (সায়েদাবাদ)', type: 'origin' },
          { name: 'Brahmanbaria', bnName: 'ব্রাহ্মণবাড়িয়া', arrivalTime: '02:00', type: 'destination' },
        ],
      },
    ],
    policy: STD_POLICY,
  },
];

// ── Lookup helpers ─────────────────────────────────────────────────────────────

export function findOperator(name: string): BusOperatorDetail | undefined {
  const n = name.toLowerCase();
  return BUS_OPERATOR_DETAILS.find(op =>
    op.name.toLowerCase().includes(n) ||
    op.shortName.toLowerCase() === n ||
    op.id === n.replace(/\s+/g, '_')
  );
}

export function findRoutesByFromTo(from: string, to: string): { operator: BusOperatorDetail; route: OperatorRoute }[] {
  const f = from.toLowerCase().trim();
  const t = to.toLowerCase().trim();
  const results: { operator: BusOperatorDetail; route: OperatorRoute }[] = [];

  for (const op of BUS_OPERATOR_DETAILS) {
    for (const route of op.routes) {
      const routeFrom = route.from.toLowerCase();
      const routeTo = route.to.toLowerCase();
      const fromOk = !f || routeFrom.includes(f) || f.includes(routeFrom.split(' ')[0]);
      const toOk = !t || routeTo.includes(t) || t.includes(routeTo.replace("'", '').split(' ')[0]);
      if (fromOk && toOk) {
        results.push({ operator: op, route });
      }
    }
  }
  return results;
}
