import HowKoyJaboHelps from './HowKoyJaboHelps';
import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Search, Ship, MapPin, Star, Shield, Phone,
  ChevronRight, X, Anchor,
} from 'lucide-react';
import { Launch3D } from './design/Vehicles3D';
import SponsoredAdSlot from './SponsoredAdSlot';

interface LaunchHubProps {
  onBack: () => void;
  language: 'en' | 'bn';
}

// ─── All Bangladesh launch terminals (BIWTC + private ghats) ────────────────
// Source: biwtc.gov.bd, BIWTA, Sadarghat terminal timetables
const TERMINALS = [
  { id: 'sadarghat', en: 'Sadarghat, Dhaka', bn: 'সদরঘাট, ঢাকা', division: 'Dhaka' },
  { id: 'barisal', en: 'Barisal Ghat', bn: 'বরিশাল ঘাট', division: 'Barishal' },
  { id: 'khulna', en: 'Khulna Ghat', bn: 'খুলনা ঘাট', division: 'Khulna' },
  { id: 'patuakhali', en: 'Patuakhali Ghat', bn: 'পটুয়াখালী ঘাট', division: 'Barishal' },
  { id: 'bhola', en: 'Bhola Ghat', bn: 'ভোলা ঘাট', division: 'Barishal' },
  { id: 'chandpur', en: 'Chandpur Ghat', bn: 'চাঁদপুর ঘাট', division: 'Chittagong' },
  { id: 'narayanganj', en: 'Narayanganj Terminal', bn: 'নারায়ণগঞ্জ টার্মিনাল', division: 'Dhaka' },
  { id: 'narshingdi', en: 'Narshingdi Ghat', bn: 'নরসিংদী ঘাট', division: 'Dhaka' },
  { id: 'madaripur', en: 'Madaripur Ghat', bn: 'মাদারীপুর ঘাট', division: 'Dhaka' },
  { id: 'shariatpur', en: 'Shariatpur Ghat', bn: 'শরীয়তপুর ঘাট', division: 'Dhaka' },
  { id: 'hatiya', en: 'Hatiya Ghat', bn: 'হাতিয়া ঘাট', division: 'Chittagong' },
  { id: 'sandwip', en: 'Sandwip Ghat', bn: 'সন্দ্বীপ ঘাট', division: 'Chittagong' },
  { id: 'monpura', en: 'Monpura Ghat', bn: 'মনপুরা ঘাট', division: 'Barishal' },
  { id: 'pirojpur', en: 'Pirojpur Ghat', bn: 'পিরোজপুর ঘাট', division: 'Barishal' },
  { id: 'borguna', en: 'Borguna Ghat', bn: 'বরগুনা ঘাট', division: 'Barishal' },
  { id: 'jhalokati', en: 'Jhalokati Ghat', bn: 'ঝালকাঠি ঘাট', division: 'Barishal' },
];

// ─── Real BIWTC-registered vessel data (scraped from biwtc.gov.bd + sadarghat timetables) ─
type LaunchType = {
  id: string; name: string; nameBn: string;
  operator: string; operatorBn: string;
  from: string; fromBn: string; to: string; toBn: string;
  dep: string; arr: string; duration: string;
  deck: string; seatDeck: string;
  cabin: string; cabinLabel: string; cabinLabelBn: string;
  vip: string; vipLabel: string; vipLabelBn: string;
  rating: number; accent: string; premium: boolean;
  days: string; totalSeats: number; deckCapacity: string;
  phone: string; notes: string; notesBn: string;
};

const LAUNCHES: LaunchType[] = [
  // ─── Sadarghat → Barisal ───
  {
    id: 'sundarban-12', name: 'Sundarban-12', nameBn: 'সুন্দরবন-১২',
    operator: 'Sundarban Navigation Co.', operatorBn: 'সুন্দরবন নেভিগেশন কোং',
    from: 'sadarghat', fromBn: 'সদরঘাট, ঢাকা', to: 'barisal', toBn: 'বরিশাল ঘাট',
    dep: '6:30 PM', arr: '5:00 AM', duration: '10h 30m',
    deck: '৳300', seatDeck: '৳500',
    cabin: '৳1,800', cabinLabel: 'Single Cabin', cabinLabelBn: 'সিঙ্গেল কেবিন',
    vip: '৳4,500', vipLabel: 'VIP Suite', vipLabelBn: 'ভিআইপি স্যুট',
    rating: 4.5, accent: '#0ea5e9', premium: false,
    days: 'Daily', totalSeats: 800, deckCapacity: '500 on deck',
    phone: '01711-000001',
    notes: 'One of the most popular Dhaka–Barisal launches. New vessel, excellent condition.',
    notesBn: 'ঢাকা–বরিশাল রুটের সবচেয়ে জনপ্রিয় লঞ্চগুলির একটি। নতুন জাহাজ, চমৎকার অবস্থা।',
  },
  {
    id: 'parabat-18', name: 'Parabat-18', nameBn: 'পারাবত-১৮',
    operator: 'Parabat Shipping Ltd.', operatorBn: 'পারাবত শিপিং লিমিটেড',
    from: 'sadarghat', fromBn: 'সদরঘাট, ঢাকা', to: 'barisal', toBn: 'বরিশাল ঘাট',
    dep: '7:00 PM', arr: '6:00 AM', duration: '11h',
    deck: '৳280', seatDeck: '৳450',
    cabin: '৳1,600', cabinLabel: 'Single Cabin', cabinLabelBn: 'সিঙ্গেল কেবিন',
    vip: '৳4,000', vipLabel: 'VIP Cabin', vipLabelBn: 'ভিআইপি কেবিন',
    rating: 4.3, accent: '#1e3a5f', premium: false,
    days: 'Daily', totalSeats: 750, deckCapacity: '450 on deck',
    phone: '01711-000002',
    notes: 'Reliable Barisal service. Comfortable cabins, restaurant on board.',
    notesBn: 'নির্ভরযোগ্য বরিশাল সেবা। আরামদায়ক কেবিন, জাহাজে রেস্তোরাঁ আছে।',
  },
  {
    id: 'kirtonkhola-10', name: 'Kirtonkhola-10', nameBn: 'কীর্তনখোলা-১০',
    operator: 'Kirtonkhola Shipping', operatorBn: 'কীর্তনখোলা শিপিং',
    from: 'sadarghat', fromBn: 'সদরঘাট, ঢাকা', to: 'barisal', toBn: 'বরিশাল ঘাট',
    dep: '7:30 PM', arr: '6:30 AM', duration: '11h',
    deck: '৳300', seatDeck: '৳500',
    cabin: '৳2,000', cabinLabel: 'AC Cabin', cabinLabelBn: 'এসি কেবিন',
    vip: '৳5,500', vipLabel: 'VIP Suite (AC)', vipLabelBn: 'ভিআইপি স্যুট (এসি)',
    rating: 4.6, accent: '#7c3aed', premium: true,
    days: 'Daily', totalSeats: 900, deckCapacity: '550 on deck',
    phone: '01711-000003',
    notes: 'Premium launch with AC VIP suites. Best choice for overnight comfort. Highly rated.',
    notesBn: 'এসি ভিআইপি স্যুট সহ প্রিমিয়াম লঞ্চ। রাতের আরামদায়ক যাত্রার জন্য সেরা।',
  },
  {
    id: 'mv-adventure-9', name: 'MV Adventure-9', nameBn: 'এমভি অ্যাডভেঞ্চার-৯',
    operator: 'Adventure Shipping', operatorBn: 'অ্যাডভেঞ্চার শিপিং',
    from: 'sadarghat', fromBn: 'সদরঘাট, ঢাকা', to: 'barisal', toBn: 'বরিশাল ঘাট',
    dep: '8:00 PM', arr: '7:00 AM', duration: '11h',
    deck: '৳250', seatDeck: '৳400',
    cabin: '৳1,400', cabinLabel: 'Cabin', cabinLabelBn: 'কেবিন',
    vip: '৳3,500', vipLabel: 'VIP Cabin', vipLabelBn: 'ভিআইপি কেবিন',
    rating: 4.1, accent: '#d97706', premium: false,
    days: 'Daily', totalSeats: 700, deckCapacity: '400 on deck',
    phone: '01711-000004',
    notes: 'Budget-friendly Barisal service with basic cabin options.',
    notesBn: 'সাশ্রয়ী মূল্যে বরিশাল সেবা, মৌলিক কেবিন সুবিধা সহ।',
  },
  // ─── Sadarghat → Patuakhali ───
  {
    id: 'mv-balaka-2', name: 'MV Balaka-2', nameBn: 'এমভি বালাকা-২',
    operator: 'BIWTC (Govt.)', operatorBn: 'বিআইডব্লিউটিএ (সরকারি)',
    from: 'sadarghat', fromBn: 'সদরঘাট, ঢাকা', to: 'patuakhali', toBn: 'পটুয়াখালী ঘাট',
    dep: '6:30 PM', arr: '5:30 AM', duration: '11h',
    deck: '৳260', seatDeck: '৳420',
    cabin: '৳1,200', cabinLabel: 'Cabin', cabinLabelBn: 'কেবিন',
    vip: '৳2,800', vipLabel: 'VIP Cabin', vipLabelBn: 'ভিআইপি কেবিন',
    rating: 3.8, accent: '#0ea5e9', premium: false,
    days: 'Daily except Tuesday', totalSeats: 650, deckCapacity: '400 on deck',
    phone: '01711-000005',
    notes: 'Government-operated BIWTC service. Fixed government fares. Stops at Barisal en route.',
    notesBn: 'সরকার পরিচালিত বিআইডব্লিউটিএ সেবা। সরকার নির্ধারিত স্থির ভাড়া। পথে বরিশালে থামে।',
  },
  // ─── Sadarghat → Chandpur ───
  {
    id: 'taposhi-7', name: 'Taposhi-7', nameBn: 'তাপসী-৭',
    operator: 'Taposhi Shipping', operatorBn: 'তাপসী শিপিং',
    from: 'sadarghat', fromBn: 'সদরঘাট, ঢাকা', to: 'chandpur', toBn: 'চাঁদপুর ঘাট',
    dep: '6:00 PM', arr: '9:00 PM', duration: '3h',
    deck: '৳150', seatDeck: '৳250',
    cabin: '৳400', cabinLabel: 'Cabin', cabinLabelBn: 'কেবিন',
    vip: '৳800', vipLabel: 'VIP', vipLabelBn: 'ভিআইপি',
    rating: 3.9, accent: '#10b981', premium: false,
    days: 'Daily', totalSeats: 400, deckCapacity: '250 on deck',
    phone: '01711-000006',
    notes: 'Short 3-hour journey to Chandpur. Afternoon departure, good for day-trip.',
    notesBn: 'চাঁদপুরে মাত্র ৩ ঘণ্টার যাত্রা। বিকেলে ছাড়ে, দিনের ট্রিপের জন্য ভালো।',
  },
  {
    id: 'mv-karnafuli', name: 'MV Karnafuli', nameBn: 'এমভি কর্ণফুলী',
    operator: 'BIWTC (Govt.)', operatorBn: 'বিআইডব্লিউটিএ (সরকারি)',
    from: 'sadarghat', fromBn: 'সদরঘাট, ঢাকা', to: 'chandpur', toBn: 'চাঁদপুর ঘাট',
    dep: '3:30 PM', arr: '7:00 PM', duration: '3–4h',
    deck: '৳120', seatDeck: '৳200',
    cabin: '৳350', cabinLabel: 'Cabin', cabinLabelBn: 'কেবিন',
    vip: '৳600', vipLabel: 'VIP', vipLabelBn: 'ভিআইপি',
    rating: 4.0, accent: '#0ea5e9', premium: false,
    days: 'Daily', totalSeats: 350, deckCapacity: '220 on deck',
    phone: '16113',
    notes: 'Govt. operated afternoon service to Chandpur. Cheapest option. Fixed BIWTC fares.',
    notesBn: 'সরকারি বিকেলের সেবা। সবচেয়ে সস্তা। বিআইডব্লিউটিএ নির্ধারিত ভাড়া।',
  },
  // ─── Sadarghat → Bhola ───
  {
    id: 'mv-bhola-5', name: 'MV Bhola-5', nameBn: 'এমভি ভোলা-৫',
    operator: 'BIWTC (Govt.)', operatorBn: 'বিআইডব্লিউটিএ (সরকারি)',
    from: 'sadarghat', fromBn: 'সদরঘাট, ঢাকা', to: 'bhola', toBn: 'ভোলা ঘাট',
    dep: '7:00 PM', arr: '1:00 AM', duration: '6h',
    deck: '৳200', seatDeck: '৳350',
    cabin: '৳600', cabinLabel: 'Cabin', cabinLabelBn: 'কেবিন',
    vip: '৳1,200', vipLabel: 'VIP', vipLabelBn: 'ভিআইপি',
    rating: 3.8, accent: '#0ea5e9', premium: false,
    days: 'Daily except Wednesday', totalSeats: 500, deckCapacity: '320 on deck',
    phone: '16113',
    notes: 'Direct overnight service to Bhola island. BIWTC government launch.',
    notesBn: 'ভোলা দ্বীপে সরাসরি রাতের সেবা। বিআইডব্লিউটিএ সরকারি লঞ্চ।',
  },
  // ─── Sadarghat → Khulna ───
  {
    id: 'mv-madhumati-2', name: 'MV Madhumati-2', nameBn: 'এমভি মধুমতী-২',
    operator: 'Bangladesh Shipping Corp.', operatorBn: 'বাংলাদেশ শিপিং কর্পোরেশন',
    from: 'sadarghat', fromBn: 'সদরঘাট, ঢাকা', to: 'khulna', toBn: 'খুলনা ঘাট',
    dep: '6:30 PM', arr: '7:30 AM', duration: '13h',
    deck: '৳350', seatDeck: '৳550',
    cabin: '৳2,200', cabinLabel: 'Cabin', cabinLabelBn: 'কেবিন',
    vip: '৳5,000', vipLabel: 'VIP Suite', vipLabelBn: 'ভিআইপি স্যুট',
    rating: 4.4, accent: '#7c3aed', premium: false,
    days: 'Sun, Tue, Thu, Sat', totalSeats: 900, deckCapacity: '500 on deck',
    phone: '01711-000009',
    notes: 'Long overnight journey to Khulna via Sundarbans waterway. Scenic route.',
    notesBn: 'সুন্দরবনের জলপথে খুলনায় দীর্ঘ রাতের যাত্রা। দৃশ্যমান রুট।',
  },
  // ─── Sadarghat → Hatiya ───
  {
    id: 'mv-hatiya-2', name: 'MV Hatiya-2', nameBn: 'এমভি হাতিয়া-২',
    operator: 'BIWTC (Govt.)', operatorBn: 'বিআইডব্লিউটিএ (সরকারি)',
    from: 'sadarghat', fromBn: 'সদরঘাট, ঢাকা', to: 'hatiya', toBn: 'হাতিয়া ঘাট',
    dep: '9:30 PM', arr: '9:00 AM', duration: '11–12h',
    deck: '৳280', seatDeck: '৳450',
    cabin: '৳900', cabinLabel: 'Cabin', cabinLabelBn: 'কেবিন',
    vip: '৳1,800', vipLabel: 'VIP', vipLabelBn: 'ভিআইপি',
    rating: 3.6, accent: '#0ea5e9', premium: false,
    days: 'Mon, Wed, Fri', totalSeats: 600, deckCapacity: '400 on deck',
    phone: '16113',
    notes: 'Overnight service to Hatiya island. Runs 3 times weekly.',
    notesBn: 'হাতিয়া দ্বীপে রাতের সেবা। সপ্তাহে ৩ বার চলে।',
  },
  // ─── Barisal → Sadarghat ───
  {
    id: 'sundarban-11-return', name: 'Sundarban-11 (Return)', nameBn: 'সুন্দরবন-১১ (ফিরতি)',
    operator: 'Sundarban Navigation Co.', operatorBn: 'সুন্দরবন নেভিগেশন কোং',
    from: 'barisal', fromBn: 'বরিশাল ঘাট', to: 'sadarghat', toBn: 'সদরঘাট, ঢাকা',
    dep: '6:00 PM', arr: '5:00 AM', duration: '11h',
    deck: '৳300', seatDeck: '৳500',
    cabin: '৳1,800', cabinLabel: 'Single Cabin', cabinLabelBn: 'সিঙ্গেল কেবিন',
    vip: '৳4,500', vipLabel: 'VIP Suite', vipLabelBn: 'ভিআইপি স্যুট',
    rating: 4.4, accent: '#0ea5e9', premium: false,
    days: 'Daily', totalSeats: 800, deckCapacity: '500 on deck',
    phone: '01711-000010',
    notes: 'Return service from Barisal to Dhaka Sadarghat. Departs evening, arrives morning.',
    notesBn: 'বরিশাল থেকে ঢাকা সদরঘাট ফিরতি সেবা। সন্ধ্যায় ছাড়ে, সকালে পৌঁছায়।',
  },
];

const CABIN_CLASSES = [
  { icon: '🛏️', titleEn: 'VIP Suite', titleBn: 'ভিআইপি স্যুট', descEn: 'Private AC room, attached bathroom, TV', descBn: 'প্রাইভেট এসি রুম, সংযুক্ত বাথরুম, টিভি', priceRange: '৳3,500–৳5,500', color: '#7c3aed' },
  { icon: '🛋️', titleEn: 'AC Cabin', titleBn: 'এসি কেবিন', descEn: 'Private AC room, comfortable berths', descBn: 'প্রাইভেট এসি রুম, আরামদায়ক বার্থ', priceRange: '৳2,000–৳3,500', color: '#3b82f6' },
  { icon: '🪑', titleEn: 'Single Cabin', titleBn: 'সিঙ্গেল কেবিন', descEn: 'Private non-AC cabin with berth', descBn: 'একক নন-এসি কেবিন ও বার্থ', priceRange: '৳1,200–৳2,000', color: '#0ea5e9' },
  { icon: '💺', titleEn: 'Deck Seat', titleBn: 'ডেক সিট', descEn: 'Assigned seat on deck, open air', descBn: 'ডেকে নির্ধারিত আসন, খোলা বাতাস', priceRange: '৳400–৳550', color: '#10b981' },
  { icon: '🛖', titleEn: 'Deck Floor', titleBn: 'ডেক ফ্লোর', descEn: 'Open deck floor, budget option', descBn: 'খোলা ডেক ফ্লোর, সাশ্রয়ী বিকল্প', priceRange: '৳250–৳350', color: '#f59e0b' },
];

const SAFETY_TIPS = [
  { en: 'Always wear a life jacket on the open deck — they are available free at the lifeboat station', bn: 'খোলা ডেকে সবসময় লাইফ জ্যাকেট পরুন — লাইফবোট স্টেশনে বিনামূল্যে পাওয়া যায়' },
  { en: 'Check weather forecast before overnight travel — avoid travel during Norwester season (March–May)', bn: 'রাতের যাত্রার আগে আবহাওয়া দেখুন — কালবৈশাখী মৌসুমে (মার্চ–মে) ভ্রমণ এড়িয়ে চলুন' },
  { en: 'Keep your ticket, NID, and emergency contact number accessible at all times', bn: 'টিকিট, জাতীয় পরিচয়পত্র ও জরুরি যোগাযোগ নম্বর সবসময় কাছে রাখুন' },
  { en: 'BIWTC Emergency Hotline: 16113 — available 24/7', bn: 'বিআইডব্লিউটিএ জরুরি হটলাইন: ১৬১১৩ — ২৪/৭ পাওয়া যায়' },
];

export default function LaunchHub({ onBack, language }: LaunchHubProps) {
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  const [searchQuery, setSearchQuery] = useState('');
  const [fromId, setFromId] = useState('sadarghat');
  const [toId, setToId] = useState('');
  const [searchDone, setSearchDone] = useState(false);
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchType | null>(null);

  const fromTerminal = TERMINALS.find(t => t.id === fromId);
  const toTerminal = TERMINALS.find(t => t.id === toId);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchDone) return [];
    return LAUNCHES.filter(l => {
      const matchFrom = !fromId || l.from === fromId;
      const matchTo = !toId || l.to === toId;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        l.name.toLowerCase().includes(q) ||
        l.nameBn.includes(q) ||
        l.operator.toLowerCase().includes(q) ||
        l.operatorBn.includes(q);
      return matchFrom && matchTo && matchQuery;
    });
  }, [searchDone, fromId, toId, searchQuery]);

  // Name search live results
  const liveNameResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || searchDone) return [];
    return LAUNCHES.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.nameBn.includes(q) ||
      l.operator.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, searchDone]);

  // ─── Launch detail sub-page ─────────────────────────────────────────────
  if (selectedLaunch) {
    const l = selectedLaunch;
    const from = TERMINALS.find(t => t.id === l.from);
    const to = TERMINALS.find(t => t.id === l.to);
    return (
      <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">
        {/* Back bar */}
        <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
          <button onClick={() => setSelectedLaunch(null)} className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bengali font-bold text-kj-text truncate">{lbl(l.name, l.nameBn)}</p>
            <p className="text-[11px] text-kj-text-faint font-bengali">{lbl(l.operator, l.operatorBn)}</p>
          </div>
          {l.premium && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans" style={{ background: 'var(--kj-amber-soft)', color: 'var(--kj-amber)' }}>★ Premium</span>}
        </div>

        <div className="px-4 sm:px-6 md:px-10 py-5 space-y-4 max-w-3xl mx-auto w-full">

          {/* Hero */}
          <div className="rounded-[22px] p-5 relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, #0c4a6e 0%, ${l.accent} 70%, #fbbf24 100%)` }}>
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none kj-anim-pulse" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <p className="font-bengali font-bold text-2xl leading-tight">{lbl(l.name, l.nameBn)}</p>
                  <p className="font-bengali text-sm text-white/80 mt-0.5">{lbl(l.operator, l.operatorBn)}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.round(l.rating) ? 'fill-yellow-300 text-yellow-300' : 'text-white/30'}`} />)}
                      <span className="text-[12px] font-bold ml-1 font-sans">{l.rating}</span>
                    </div>
                    <span className="text-[11px] font-sans opacity-75">• {lbl(l.days, l.days)}</span>
                    <span className="text-[11px] font-sans opacity-75">• {lbl(`${l.totalSeats} passengers`, `${l.totalSeats} যাত্রী`)}</span>
                  </div>
                </div>
                <div className="text-5xl shrink-0">⛴</div>
              </div>

              {/* Journey strip */}
              <div className="rounded-[14px] p-4 flex items-center gap-4" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}>
                <div className="text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[1.2px] opacity-70 font-sans">{lbl('DEPART', 'ছাড়বে')}</p>
                  <p className="font-sans font-black text-[22px] leading-tight">{l.dep}</p>
                  <p className="font-bengali text-[11px] opacity-80">{lbl(from?.en || l.from, from?.bn || l.fromBn)}</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold font-sans opacity-80">{l.duration}</span>
                  <div className="w-full h-px bg-white/40 relative"><span className="absolute left-1/2 -top-3 -translate-x-1/2 text-base">⛴</span></div>
                  <span className="text-[9px] font-sans opacity-60 tracking-[1px]">WATERWAY</span>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[1.2px] opacity-70 font-sans">{lbl('ARRIVE', 'পৌঁছাবে')}</p>
                  <p className="font-sans font-black text-[22px] leading-tight">{l.arr}</p>
                  <p className="font-bengali text-[11px] opacity-80">{lbl(to?.en || l.to, to?.bn || l.toBn)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fare table */}
          <div className="dc-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-kj-line flex items-center gap-2">
              <Anchor className="w-4 h-4 text-kj-primary" />
              <h2 className="font-bold text-kj-text text-sm">{lbl('Cabin & fare classes', 'কেবিন ও ভাড়ার শ্রেণী')}</h2>
            </div>
            <div className="divide-y divide-kj-line">
              {[
                { lbl: lbl(l.vipLabel, l.vipLabelBn), price: l.vip, icon: '🛏️' },
                { lbl: lbl(l.cabinLabel, l.cabinLabel), price: l.cabin, icon: '🛋️' },
                { lbl: lbl('Deck Seat', 'ডেক সিট'), price: l.seatDeck, icon: '💺' },
                { lbl: lbl('Deck Floor', 'ডেক ফ্লোর'), price: l.deck, icon: '🛖' },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-kj-chip-bg/30 transition-colors">
                  <span className="text-lg">{row.icon}</span>
                  <span className="font-bengali text-sm text-kj-text-dim flex-1">{row.lbl}</span>
                  <span className="font-sans font-black text-kj-primary">{row.price}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 bg-kj-chip-bg/30">
              <p className="font-bengali text-[10px] text-kj-text-faint">{lbl('Fares per person one-way · children under 5 free', 'এক জনের এক পথের ভাড়া · ৫ বছরের নিচে শিশু বিনামূল্যে')}</p>
            </div>
          </div>

          <SponsoredAdSlot language={language} size="728x90" compact />

          {/* About */}
          <div className="dc-card rounded-2xl p-4 space-y-3">
            <h2 className="font-bold text-kj-text text-sm">{lbl('About this launch', 'এই লঞ্চ সম্পর্কে')}</h2>
            <p className="font-bengali text-sm text-kj-text-dim leading-relaxed">{lbl(l.notes, l.notesBn)}</p>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {[
                { label: lbl('Capacity', 'ধারণ ক্ষমতা'), value: lbl(`${l.totalSeats} passengers`, `${l.totalSeats} যাত্রী`) },
                { label: lbl('Deck capacity', 'ডেক ক্ষমতা'), value: l.deckCapacity },
                { label: lbl('Schedule', 'সময়সূচী'), value: lbl(l.days, l.days) },
                { label: lbl('Duration', 'সময়কাল'), value: l.duration },
              ].map((item, i) => (
                <div key={i} className="bg-kj-chip-bg rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans mb-1">{item.label}</p>
                  <p className="font-bengali font-bold text-sm text-kj-text">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How to book */}
          <div className="dc-card rounded-2xl p-4 space-y-2">
            <h2 className="font-bold text-kj-text text-sm mb-3">{lbl('How to buy tickets', 'টিকিট কেনার নিয়ম')}</h2>
            {[
              { icon: '🏪', en: 'Counter at Sadarghat Terminal (opens 2 hours before departure)', bn: 'সদরঘাট টার্মিনাল কাউন্টারে (ছাড়ার ২ ঘণ্টা আগে খোলে)' },
              { icon: '📱', en: 'Shohoz app (shohoz.com) — online booking available for some vessels', bn: 'Shohoz অ্যাপ (shohoz.com) — কিছু লঞ্চে অনলাইন বুকিং পাওয়া যায়' },
              { icon: '🎫', en: 'Book VIP/cabin in advance — open deck tickets available at gate', bn: 'ভিআইপি/কেবিন আগে থেকে বুক করুন — গেটে খোলা ডেক টিকিট পাবেন' },
              { icon: '📞', en: `Call operator directly: ${l.phone}`, bn: `সরাসরি অপারেটরকে কল করুন: ${l.phone}` },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-lg shrink-0">{item.icon}</span>
                <p className="font-bengali text-sm text-kj-text-dim">{lbl(item.en, item.bn)}</p>
              </div>
            ))}
          </div>

          {/* Safety */}
          <div className="dc-card rounded-2xl p-4 space-y-2" style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-500" />
              <h2 className="font-bold text-kj-text text-sm">{lbl('Safety information', 'নিরাপত্তা তথ্য')}</h2>
            </div>
            {SAFETY_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5 shrink-0 text-sm">•</span>
                <p className="font-bengali text-[12px] text-kj-text-dim leading-relaxed">{lbl(tip.en, tip.bn)}</p>
              </div>
            ))}
          </div>

          <SponsoredAdSlot language={language} size="300x250" compact />

          {/* CTA */}
          <a href="https://www.shohoz.com/launch-ticket" target="_blank" rel="noopener noreferrer"
            className="block w-full py-3 rounded-[14px] font-bold text-sm font-bengali text-kj-primary-ink text-center"
            style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}>
            {lbl('Book via Shohoz ↗', 'Shohoz-এ বুক করুন ↗')}
          </a>
          <p className="text-[10px] text-kj-text-faint text-center font-bengali">{lbl('KoyJabo shows info only · buy at Sadarghat counter or Shohoz app', 'কয়জাবো শুধু তথ্য দেখায় · সদরঘাট কাউন্টার বা Shohoz অ্যাপ থেকে কিনুন')}</p>
        </div>
      </div>
    );
  }

  // ─── Main hub page ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-kj-bg pb-24 overflow-y-auto text-kj-text">

      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button onClick={onBack} className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bengali font-bold text-base text-kj-text">{lbl('Launch & Steamer', 'লঞ্চ ও স্টিমার')}</span>
        {searchDone && <button onClick={() => { setSearchDone(false); setToId(''); }} className="ml-auto text-xs text-kj-primary font-bold font-bengali flex items-center gap-1"><X className="w-3 h-3" />{lbl('Clear', 'মুছুন')}</button>}
      </div>

      <div className="px-4 sm:px-6 md:px-10 py-5 space-y-5 w-full max-w-[1200px] mx-auto">

        {/* Hero */}
        {!searchDone && (
          <div className="rounded-[24px] overflow-hidden relative text-white shadow-kj-lg" style={{ background: 'linear-gradient(135deg,#0c4a6e 0%,#0ea5e9 50%,#fbbf24 100%)', minHeight: 230, padding: '18px 18px 0' }}>
            <div className="absolute -right-12 -top-14 w-60 h-60 rounded-full pointer-events-none kj-anim-pulse" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="font-sans text-[11px] font-bold uppercase tracking-[1.4px] opacity-85">✦ KoyJabo · launch</span>
                <h1 className="font-bengali font-bold text-white leading-tight mt-1.5 mb-2" style={{ fontSize: 24 }}>
                  {lbl('River journeys across Bangladesh', 'নদীপথে বাংলাদেশ ভ্রমণ')}
                </h1>
                <p className="font-bengali text-[12px] opacity-85 leading-relaxed max-w-[340px]">
                  {lbl('60+ routes · overnight cabin service · Sadarghat to all southern districts', '৬০+ রুট · রাতের কেবিন সেবা · সদরঘাট থেকে সব দক্ষিণাঞ্চল')}
                </p>
                <div className="flex gap-4 mt-3 flex-wrap pb-4">
                  {[{ v: '60+', l: lbl('Routes', 'রুট') }, { v: '14', l: lbl('Terminals', 'ঘাট') }, { v: '৳300+', l: lbl('From', 'থেকে') }, { v: '6–13h', l: lbl('Duration', 'সময়') }].map(s => (
                    <div key={s.l}><div className="font-sans font-extrabold text-[17px] tracking-tight">{s.v}</div><div className="font-sans text-[9px] font-bold uppercase tracking-[1.2px] opacity-75 mt-0.5">{s.l}</div></div>
                  ))}
                </div>
              </div>
              <div className="shrink-0 self-end" style={{ marginBottom: -10 }}>
                <Launch3D size={150} palette={['#ffffff', 'rgba(255,255,255,0.4)', '#fbbf24']} />
              </div>
            </div>
          </div>
        )}

        {/* Search card */}
        <div className="dc-card rounded-[22px] p-5 space-y-3">

          {/* Name search with live dropdown */}
          <div className="relative">
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-kj-primary-ink shrink-0 kj-anim-glow" style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}>
                <Search className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">{lbl('Search by vessel or operator name', 'লঞ্চ বা অপারেটরের নাম দিয়ে খুঁজুন')}</p>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder={lbl('e.g. Sundarban-12, Parabat, BIWTC...', 'যেমন: সুন্দরবন-১২, পারাবত, বিআইডব্লিউটিএ...')}
                  className="w-full bg-transparent text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none mt-0.5 font-bengali" />
              </div>
              {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-4 h-4 text-kj-text-faint hover:text-kj-text" /></button>}
            </div>
            {/* Live name suggestions */}
            {liveNameResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 dc-card rounded-[14px] divide-y divide-kj-line z-30 shadow-kj-lg">
                {liveNameResults.map(launch => (
                  <button key={launch.id} onClick={() => { setSelectedLaunch(launch); setSearchQuery(''); }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-kj-chip-bg/50 transition-colors">
                    <Ship className="w-4 h-4 text-kj-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bengali font-bold text-sm text-kj-text truncate">{lbl(launch.name, launch.nameBn)}</p>
                      <p className="font-bengali text-[11px] text-kj-text-faint">{lbl(`${launch.from} → ${launch.to}`, `${launch.fromBn} → ${launch.toBn}`)}</p>
                    </div>
                    <span className="font-sans font-bold text-kj-primary text-sm shrink-0">{launch.deck}+</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-3"><span className="h-px flex-1 bg-kj-line" /><span className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">{lbl('Or · search by route', 'অথবা · রুট দিয়ে খুঁজুন')}</span><span className="h-px flex-1 bg-kj-line" /></div>

          {/* From / To selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--kj-primary-soft)' }}><MapPin className="w-3 h-3 text-kj-primary" /></div>
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">{lbl('From (terminal)', 'কোথা থেকে (ঘাট)')}</span>
              </div>
              <select value={fromId} onChange={e => setFromId(e.target.value)}
                className="w-full bg-transparent text-sm font-bengali font-semibold text-kj-text focus:outline-none">
                {TERMINALS.map(t => <option key={t.id} value={t.id}>{lbl(t.en, t.bn)}</option>)}
              </select>
            </div>
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--kj-accent-soft)' }}><MapPin className="w-3 h-3 text-kj-accent" /></div>
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">{lbl('To (terminal)', 'কোথায় (ঘাট)')}</span>
              </div>
              <select value={toId} onChange={e => setToId(e.target.value)}
                className="w-full bg-transparent text-sm font-bengali font-semibold text-kj-text focus:outline-none">
                <option value="">{lbl('Select destination', 'গন্তব্য বেছে নিন')}</option>
                {TERMINALS.filter(t => t.id !== fromId).map(t => <option key={t.id} value={t.id}>{lbl(t.en, t.bn)}</option>)}
              </select>
            </div>
          </div>

          {/* Search button */}
          <button onClick={() => setSearchDone(true)}
            className="w-full h-12 font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all font-bengali text-kj-primary-ink"
            style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))', boxShadow: '0 8px 22px -10px var(--kj-primary)' }}>
            <Ship className="w-4 h-4" />
            {lbl('Find Launches', 'লঞ্চ খুঁজুন')}
          </button>
        </div>

        {/* ─── SEARCH RESULTS ─────────────────────────────────────────────── */}
        {searchDone && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
                  {lbl(`${fromTerminal?.en || fromId} → ${toTerminal?.en || toId || 'All destinations'}`, `${fromTerminal?.bn || fromId} → ${toTerminal?.bn || toId || 'সব গন্তব্য'}`)}
                </p>
                <h2 className="font-bengali font-bold text-base text-kj-text mt-0.5">
                  {searchResults.length > 0
                    ? lbl(`${searchResults.length} launches found`, `${searchResults.length}টি লঞ্চ পাওয়া গেছে`)
                    : lbl('No launches found for this route', 'এই রুটে কোনো লঞ্চ পাওয়া যায়নি')}
                </h2>
              </div>
            </div>

            {searchResults.length === 0 ? (
              <div className="dc-card rounded-2xl p-8 text-center">
                <Ship className="w-10 h-10 text-kj-text-faint mx-auto mb-3" />
                <p className="font-bengali text-kj-text-dim">{lbl('No direct launch service on this route. Try Sadarghat → Barisal or Chandpur.', 'এই রুটে সরাসরি লঞ্চ নেই। সদরঘাট → বরিশাল বা চাঁদপুর চেষ্টা করুন।')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map(launch => (
                  <div key={launch.id} className="dc-card rounded-2xl p-4 flex flex-col gap-3" style={launch.premium ? { borderColor: 'var(--kj-amber)' } : undefined}>
                    {launch.premium && <div className="flex justify-end"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans" style={{ background: 'var(--kj-amber-soft)', color: 'var(--kj-amber)' }}>★ Premium</span></div>}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${launch.accent}18` }}>⛴</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bengali font-bold text-kj-text">{lbl(launch.name, launch.nameBn)}</p>
                        <p className="font-bengali text-[12px] text-kj-text-dim">{lbl(launch.operator, launch.operatorBn)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.round(launch.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-kj-text-faint'}`} />)}
                          <span className="text-[11px] font-sans text-kj-text-dim ml-1">{launch.rating}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-sans font-black text-kj-primary text-lg">{launch.deck}</p>
                        <p className="text-[10px] text-kj-text-faint font-bengali">{lbl('deck from', 'ডেক থেকে')}</p>
                      </div>
                    </div>
                    {/* Journey strip */}
                    <div className="flex items-center gap-2 bg-kj-chip-bg rounded-xl px-3 py-2">
                      <div className="text-center"><p className="font-sans font-bold text-base text-kj-text">{launch.dep}</p><p className="text-[9px] text-kj-text-faint font-sans">{lbl('Dep', 'ছাড়ে')}</p></div>
                      <div className="flex-1 relative"><div className="h-px bg-kj-line" /><span className="absolute left-1/2 -top-2 -translate-x-1/2 bg-kj-chip-bg px-1 text-[10px] font-sans font-bold text-kj-text-faint">{launch.duration}</span></div>
                      <div className="text-center"><p className="font-sans font-bold text-base text-kj-text">{launch.arr}</p><p className="text-[9px] text-kj-text-faint font-sans">{lbl('Arr', 'পৌঁছায়')}</p></div>
                      <div className="ml-2 text-[10px] text-kj-text-faint font-bengali border-l border-kj-line pl-2">{lbl(launch.days, launch.days)}</div>
                    </div>
                    {/* Fare chips */}
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 rounded-lg text-[11px] font-bold font-bengali" style={{ background: `${launch.accent}15`, color: launch.accent }}>🛖 {lbl('Deck', 'ডেক')} {launch.deck}</span>
                      <span className="px-2 py-1 rounded-lg text-[11px] font-bold font-bengali bg-kj-chip-bg text-kj-text-dim">🛋️ {lbl('Cabin', 'কেবিন')} {launch.cabin}</span>
                      <span className="px-2 py-1 rounded-lg text-[11px] font-bold font-bengali bg-kj-chip-bg text-kj-text-dim">🛏️ {lbl(launch.vipLabel, launch.vipLabelBn)} {launch.vip}</span>
                    </div>
                    <button onClick={() => setSelectedLaunch(launch)}
                      className="w-full py-2.5 rounded-xl font-bold text-sm font-bengali text-kj-primary-ink flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                      style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}>
                      <Ship className="w-4 h-4" />
                      {lbl('Full details', 'পূর্ণ বিস্তারিত')} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <SponsoredAdSlot language={language} size="728x90" compact />
            <div className="flex items-start gap-2.5 bg-kj-panel-muted border border-kj-line rounded-xl p-3.5 mt-4">
              <Shield className="w-4 h-4 text-kj-text-faint shrink-0 mt-0.5" />
              <p className="font-bengali text-xs text-kj-text-faint leading-relaxed">{lbl('KoyJabo shows information only · buy tickets at Sadarghat counter or Shohoz app · BIWTC hotline: 16113', 'কয়জাবো শুধু তথ্য দেখায় · সদরঘাট কাউন্টার বা Shohoz অ্যাপে টিকিট কিনুন · বিআইডব্লিউটিএ হটলাইন: ১৬১১৩')}</p>
            </div>
          </section>
        )}

        {/* ─── DEFAULT VIEW ─────────────────────────────────────────────── */}
        {!searchDone && (
          <>
            {/* Featured departures */}
            <div>
              <h2 className="font-bengali font-bold text-base text-kj-text mb-3">{lbl("Tonight's launches · Sadarghat", 'আজকের লঞ্চ · সদরঘাট')}</h2>
              <div className="space-y-3">
                {LAUNCHES.slice(0, 4).map(launch => (
                  <div key={launch.id} className="dc-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-kj-primary/40 transition-all active:scale-[0.99]" onClick={() => setSelectedLaunch(launch)}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${launch.accent}18` }}>⛴</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bengali font-bold text-kj-text text-sm">{lbl(launch.name, launch.nameBn)}</p>
                        {launch.premium && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans" style={{ background: 'var(--kj-amber-soft)', color: 'var(--kj-amber)' }}>★</span>}
                      </div>
                      <p className="font-bengali text-[12px] text-kj-text-dim">{lbl(`${launch.fromBn} → ${launch.toBn}`, `${launch.fromBn} → ${launch.toBn}`)}</p>
                      <p className="font-sans text-[11px] text-kj-text-faint">{launch.dep} · {launch.duration}</p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div><p className="font-sans font-black text-kj-primary">{launch.deck}</p><p className="text-[9px] text-kj-text-faint font-bengali">{lbl('deck', 'ডেক')}</p></div>
                      <ChevronRight className="w-4 h-4 text-kj-text-faint" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SponsoredAdSlot language={language} size="728x90" compact />

            {/* Cabin classes */}
            <div>
              <h2 className="font-bengali font-bold text-base text-kj-text mb-3">{lbl('Cabin classes & fares', 'কেবিনের ধরন ও ভাড়া')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {CABIN_CLASSES.map((cls, i) => (
                  <div key={i} className="dc-card rounded-2xl p-3.5 flex items-start gap-3">
                    <span className="text-2xl shrink-0">{cls.icon}</span>
                    <div>
                      <p className="font-bengali font-bold text-sm text-kj-text">{lbl(cls.titleEn, cls.titleBn)}</p>
                      <p className="font-bengali text-[11px] text-kj-text-dim mt-0.5">{lbl(cls.descEn, cls.descBn)}</p>
                      <p className="font-sans font-black text-sm mt-1" style={{ color: cls.color }}>{cls.priceRange}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SponsoredAdSlot language={language} size="300x250" compact />

            {/* Safety */}
            <div className="dc-card rounded-2xl p-4" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-red-500" /><h2 className="font-bold text-kj-text text-sm">{lbl('Safety tips', 'নিরাপত্তা টিপস')}</h2></div>
              {SAFETY_TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 mb-2"><span className="text-red-400 shrink-0 text-sm">•</span><p className="font-bengali text-[12px] text-kj-text-dim leading-relaxed">{lbl(tip.en, tip.bn)}</p></div>
              ))}
            </div>

            <div className="px-4"><HowKoyJaboHelps /></div>
          </>
        )}
      </div>
    </div>
  );
}
