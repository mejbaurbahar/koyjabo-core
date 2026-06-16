import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, ChevronRight, MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureUsage } from '../services/analyticsService';
import { STATIONS, METRO_STATIONS, RAILWAY_STATIONS } from '../constants';
import SponsoredAdSlot from './SponsoredAdSlot';



interface Props { onBack: () => void; }

interface Stop { id: string; name: string; }
interface Leg { from: string; to: string; suggestion: string; }

// Extra Dhaka city area stop names (Bangla + English pairs, same index)
const EXTRA_STOPS_BN = [
  'সাভার', 'গাজীপুর', 'নারায়ণগঞ্জ', 'আশুলিয়া', 'টঙ্গী', 'মানিকগঞ্জ',
  'ধানমন্ডি', 'গুলশান', 'বনানী', 'বারিধারা', 'খিলগাঁও', 'রামপুরা',
  'বাড্ডা', 'রায়েরবাগ', 'যাত্রাবাড়ী', 'পোস্তগোলা', 'আজিমপুর',
  'লালবাগ', 'চকবাজার', 'সদরঘাট', 'গুলিস্তান', 'পল্টন', 'শাহবাগ',
  'নিউমার্কেট', 'ধোলাইখাল', 'মহাখালী', 'তেজগাঁও', 'বিজয়নগর',
  'মগবাজার', 'মালিবাগ', 'শান্তিনগর', 'আরামবাগ', 'ফকিরাপুল',
  'আগারগাঁও', 'শ্যামলী', 'মোহাম্মদপুর', 'আসাদগেট', 'রিং রোড',
  'বসুন্ধরা', 'নোয়াপাড়া', 'আব্দুল্লাহপুর', 'টুরাগ', 'দিয়াবাড়ি',
  'ভাটারা', 'মেরুল বাড্ডা', 'নদ্দা', 'বারুইপাড়া', 'কালশী',
  'পীরেরবাগ', 'বেগম রোকেয়া সরণি', 'কচুক্ষেত', 'ইব্রাহিমপুর',
  'দারুস সালাম', 'বিমানবন্দর', 'কুর্মিটোলা', 'ক্যান্টনমেন্ট',
  'গেন্ডারিয়া', 'সূত্রাপুর', 'কমলাপুর', 'মুগদা', 'বাসাবো',
  'দনিয়া', 'শ্যামপুর', 'কদমতলী', 'সিদ্ধিরগঞ্জ', 'ফতুল্লা',
  'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'ময়মনসিংহ',
  'কক্সবাজার', 'কুমিল্লা', 'রংপুর', 'বগুড়া', 'যশোর',
];
const EXTRA_STOPS_EN = [
  'Savar', 'Gazipur', 'Narayanganj', 'Ashulia', 'Tongi', 'Manikganj',
  'Dhanmondi', 'Gulshan', 'Banani', 'Baridhara', 'Khilgaon', 'Rampura',
  'Badda', 'Rayerbagh', 'Jatrabari', 'Postogola', 'Azimpur',
  'Lalbagh', 'Chawkbazar', 'Sadarghat', 'Gulistan', 'Paltan', 'Shahbagh',
  'New Market', 'Dholaikhal', 'Mohakhali', 'Tejgaon', 'Bijoy Nagar',
  'Maghbazar', 'Malibagh', 'Shantinagar', 'Arambagh', 'Fakirapool',
  'Agargaon', 'Shyamoli', 'Mohammadpur', 'Asad Gate', 'Ring Road',
  'Bashundhara', 'Noapara', 'Abdullahpur', 'Turag', 'Diabari',
  'Bhatara', 'Merul Badda', 'Nadda', 'Baruipara', 'Kalshi',
  'Pirerbagh', 'Begum Rokeya Sarani', 'Kachukhet', 'Ibrahimpur',
  'Darus Salam', 'Airport', 'Kurmitola', 'Cantonment',
  'Gandaria', 'Sutrapur', 'Kamalapur', 'Mugda', 'Basabo',
  'Donia', 'Shyampur', 'Kadamtali', 'Siddhirganj', 'Fatullah',
  'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Mymensingh',
  "Cox's Bazar", 'Cumilla', 'Rangpur', 'Bogura', 'Jashore',
];

// Build BN↔EN translation maps from station constants + extra stops
const BN_TO_EN = new Map<string, string>();
const EN_TO_BN = new Map<string, string>();
[METRO_STATIONS, RAILWAY_STATIONS, STATIONS].forEach(src =>
  Object.values(src).forEach((s: any) => {
    if (s.name && s.bnName) { BN_TO_EN.set(s.bnName, s.name); EN_TO_BN.set(s.name, s.bnName); }
  })
);
EXTRA_STOPS_BN.forEach((bn, i) => {
  const en = EXTRA_STOPS_EN[i];
  BN_TO_EN.set(bn, en); EN_TO_BN.set(en, bn);
});

// Build deduplicated stop name lists for both languages
const { ALL_STOP_NAMES_BN, ALL_STOP_NAMES_EN } = (() => {
  const seenBn = new Set<string>(); const seenEn = new Set<string>();
  const bn: string[] = []; const en: string[] = [];
  const add = (bnName: string, enName: string) => {
    if (bnName && !seenBn.has(bnName)) { seenBn.add(bnName); bn.push(bnName); }
    if (enName && !seenEn.has(enName)) { seenEn.add(enName); en.push(enName); }
  };
  Object.values(METRO_STATIONS).forEach((s: any) => add(s.bnName, s.name));
  Object.values(RAILWAY_STATIONS).forEach((s: any) => add(s.bnName, s.name));
  Object.values(STATIONS).forEach((s: any) => { if (s.bnName) add(s.bnName, s.name || BN_TO_EN.get(s.bnName) || s.bnName); });
  EXTRA_STOPS_BN.forEach((bnS, i) => add(bnS, EXTRA_STOPS_EN[i]));
  return { ALL_STOP_NAMES_BN: bn.slice(0, 800), ALL_STOP_NAMES_EN: en.slice(0, 800) };
})();

const METRO_BN_NAMES = new Set(Object.values(METRO_STATIONS).map((s: any) => s.bnName));

function suggestRoute(from: string, to: string, lang: string = 'bn'): string {
  const fromMetro = METRO_BN_NAMES.has(from);
  const toMetro = METRO_BN_NAMES.has(to);

  // Both stops on metro line — fastest option
  if (fromMetro && toMetro) {
    return lang === 'bn'
      ? '🚇 মেট্রো রেল (MRT-6) নিন — সবচেয়ে দ্রুত। ভাড়া ২০-১০০ টাকা। পিক আওয়ারেও সময়মতো পৌঁছাবেন।'
      : '🚇 Take MRT-6 Metro Rail — fastest option. Fare ৳20–100. On-time even during peak hours.';
  }

  // One is metro, walk to station
  if (fromMetro || toMetro) {
    const station = fromMetro ? from : to;
    return lang === 'bn'
      ? `🚇 ${station} মেট্রো স্টেশন পর্যন্ত হেঁটে বা রিকশায় যান, তারপর MRT-6 নিন। অথবা 🚌 লোকাল বাসে সরাসরি যান।`
      : `🚇 Walk or take a rickshaw to ${station} metro station, then take MRT-6. Or 🚌 take a local bus directly.`;
  }

  // Specific area routing
  if ((from.includes('সাভার') || from.includes('আশুলিয়া')) && (to.includes('মোহাম্মদপুর') || to.includes('ধানমন্ডি') || to.includes('আসাদগেট'))) {
    return lang === 'bn'
      ? '🚌 বিকল্প ১: সাভার পরিবহন বা বোয়ালখালী বাসে সরাসরি মোহাম্মদপুর যান। বিকল্প ২: বোয়ালখালী বাসে সায়মলী, তারপর পায়ে হেঁটে পার হয়ে আচিম বা অগ্রণী বাসে মোহাম্মদপুর।'
      : '🚌 Option 1: Savar Paribahan or Bawakhali bus directly to Mohammadpur. Option 2: Bawakhali bus to Shyamoli, then walk and take Achim/Agrani bus to Mohammadpur.';
  }

  if ((from.includes('সাভার') || from.includes('আশুলিয়া')) && to.includes('মতিঝিল')) {
    return lang === 'bn'
      ? '🚌 সাভার পরিবহন → গাবতলী → লোকাল বাস মতিঝিল। অথবা 🚇 গাবতলী থেকে মেট্রোতে মতিঝিল (কারওয়ান বাজার হয়ে)।'
      : '🚌 Savar Paribahan → Gabtoli → local bus to Motijheel. Or 🚇 Metro from Gabtoli to Motijheel (via Karwan Bazar).';
  }

  if ((from.includes('সাভার') || from.includes('আশুলিয়া')) && to.includes('গুলশান')) {
    return lang === 'bn'
      ? '🚌 সাভার পরিবহন → গাবতলী, তারপর সিএনজি বা উবারে গুলশান। অথবা 🚇 মেট্রোতে বিজয় সরণি → সিএনজি গুলশান।'
      : '🚌 Savar Paribahan → Gabtoli, then CNG or Uber to Gulshan. Or 🚇 Metro to Bijoy Sarani → CNG to Gulshan.';
  }

  if ((from.includes('মিরপুর') || from.includes('পল্লবী')) && to.includes('ধানমন্ডি')) {
    return lang === 'bn'
      ? '🚇 মিরপুর মেট্রো → ফার্মগেট/বিজয় সরণি, তারপর 🚌 লোকাল বাসে ধানমন্ডি। অথবা সরাসরি বাস রুট ৮ নিন।'
      : '🚇 Mirpur Metro → Farmgate/Bijoy Sarani, then 🚌 local bus to Dhanmondi. Or take bus route 8 directly.';
  }

  if ((from.includes('মিরপুর') || from.includes('পল্লবী')) && to.includes('মতিঝিল')) {
    return lang === 'bn'
      ? '🚇 মিরপুর-১০ বা মিরপুর-১১ মেট্রো স্টেশন → সরাসরি মতিঝিল। দ্রুততম পথ, ৩০-৩৫ মিনিট।'
      : '🚇 Mirpur-10 or Mirpur-11 Metro Station → direct to Motijheel. Fastest route, 30–35 minutes.';
  }

  if ((from.includes('উত্তরা') || from.includes('আব্দুল্লাহপুর')) && (to.includes('মতিঝিল') || to.includes('ধানমন্ডি'))) {
    return lang === 'bn'
      ? '🚇 উত্তরা মেট্রো স্টেশন থেকে সরাসরি MRT-6 নিন। ভাড়া ৬০-১০০ টাকা, সময় ৩০-৪০ মিনিট।'
      : '🚇 Take MRT-6 directly from Uttara Metro Station. Fare ৳60–100, journey time 30–40 minutes.';
  }

  if (from.includes('গাজীপুর') && to.includes('ঢাকা')) {
    return lang === 'bn'
      ? '🚌 BRT (বাস র‍্যাপিড ট্রানজিট) ব্যবহার করুন — গাজীপুর থেকে এয়ারপোর্ট পর্যন্ত দ্রুত। তারপর 🚇 মেট্রো নিন ঢাকার ভেতরে।'
      : '🚌 Use BRT (Bus Rapid Transit) — fast from Gazipur to Airport. Then 🚇 take Metro within Dhaka.';
  }

  if (from.includes('নারায়ণগঞ্জ') && to.includes('ঢাকা')) {
    return lang === 'bn'
      ? '🚌 নারায়ণগঞ্জ-গুলিস্তান সরাসরি বাস। অথবা 🚂 ট্রেনে কমলাপুর।'
      : '🚌 Direct Narayanganj–Gulistan bus. Or 🚂 train to Kamalapur.';
  }

  if (from.includes('যাত্রাবাড়ী') || from.includes('সায়েদাবাদ')) {
    return lang === 'bn'
      ? '🚌 গুলিস্তান হয়ে লোকাল বাসে যে কোনো গন্তব্য। পিক আওয়ারে ৩০+ মিনিট বেশি রাখুন।'
      : '🚌 Local bus via Gulistan to any destination. Allow 30+ extra minutes during peak hours.';
  }

  if (from.includes('কমলাপুর') || to.includes('কমলাপুর')) {
    return lang === 'bn'
      ? '🚂 ট্রেন ব্যবহার করুন — কমলাপুর থেকে সারা দেশে। অথবা 🚇 মেট্রো নিন ঢাকার ভেতরে।'
      : '🚂 Use train — Kamalapur connects to all parts of the country. Or 🚇 Metro for travel within Dhaka.';
  }

  if (from.includes('পুরান ঢাকা') || from.includes('সদরঘাট') || from.includes('লালবাগ') || from.includes('চকবাজার')) {
    return lang === 'bn'
      ? '🚌 গুলিস্তান বা নিউমার্কেট থেকে লোকাল বাস। 🛺 রিকশা বা ইজিবাইক ছোট দূরত্বে ভালো। সদরঘাট থেকে লঞ্চে বরিশাল।'
      : '🚌 Local bus from Gulistan or New Market. 🛺 Rickshaw or easy-bike for short distances. Sadarghat launch to Barisal.';
  }

  // Short distance hint (same general area keywords)
  const shortDistanceAreas = ['ধানমন্ডি', 'গুলশান', 'বনানী', 'মোহাম্মদপুর', 'আগারগাঁও', 'শ্যামলী'];
  const fromShort = shortDistanceAreas.some(a => from.includes(a));
  const toShort = shortDistanceAreas.some(a => to.includes(a));
  if (fromShort && toShort) {
    return lang === 'bn'
      ? '🚶 ২ কিমির কম হলে হেঁটে যান। ২-৫ কিমি হলে 🛺 রিকশা নিন। বেশি হলে 🚌 লোকাল বাস বা উবার/পাঠাও।'
      : '🚶 Walk for under 2 km. 🛺 Rickshaw for 2–5 km. 🚌 Local bus or Uber/Pathao for longer distances.';
  }

  return lang === 'bn'
    ? '🚌 লোকাল বাস বা সিএনজি নিন। পিক আওয়ার (৮-১০টা, ৫-৭টা) এড়িয়ে চলুন। 📱 উবার/পাঠাও অ্যাপে রাইড নিতে পারেন।'
    : '🚌 Take a local bus or CNG auto. Avoid peak hours (8–10 AM, 5–7 PM). 📱 Uber/Pathao app available for rides.';
}

const DOT_COLORS = [
  'bg-kj-primary', 'bg-kj-accent', 'bg-kj-amber', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500',
];

export default function MultiStopPlanner({ onBack }: Props) {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  useEffect(() => { trackFeatureUsage('multi_stop_planner'); }, []);

  const [stops, setStops] = useState<Stop[]>([
    { id: '1', name: '' },
    { id: '2', name: '' },
  ]);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [planned, setPlanned] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [queries, setQueries] = useState<Record<string, string>>({});

  const allNames = language === 'bn' ? ALL_STOP_NAMES_BN : ALL_STOP_NAMES_EN;

  const filtered = useMemo(() => {
    if (!focusedId) return [];
    const q = (queries[focusedId] || '').toLowerCase().trim();
    if (!q) return allNames.slice(0, 8);
    return allNames.filter(n => n.toLowerCase().includes(q)).slice(0, 8);
  }, [focusedId, queries, allNames]);

  const addStop = () => {
    setStops(s => [...s, { id: crypto.randomUUID(), name: '' }]);
    setPlanned(false);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(s => s.filter(x => x.id !== id));
    setPlanned(false);
  };

  const updateStop = (id: string, name: string) => {
    setStops(s => s.map(x => x.id === id ? { ...x, name } : x));
    setQueries(q => ({ ...q, [id]: name }));
    setPlanned(false);
  };

  const selectSuggestion = (stopId: string, name: string) => {
    if (stops.some(x => x.id !== stopId && x.name === name)) return; // prevent duplicates
    setStops(s => s.map(x => x.id === stopId ? { ...x, name } : x));
    setQueries(q => ({ ...q, [stopId]: '' }));
    setFocusedId(null);
    setPlanned(false);
  };

  const plan = () => {
    const filled = stops.filter(s => s.name.trim());
    if (filled.length < 2) return;
    const newLegs: Leg[] = [];
    for (let i = 0; i < filled.length - 1; i++) {
      // Routing logic uses Bangla names internally; convert if in English mode
      const fromBn = language === 'en' ? (EN_TO_BN.get(filled[i].name) ?? filled[i].name) : filled[i].name;
      const toBn = language === 'en' ? (EN_TO_BN.get(filled[i + 1].name) ?? filled[i + 1].name) : filled[i + 1].name;
      newLegs.push({
        from: filled[i].name,
        to: filled[i + 1].name,
        suggestion: suggestRoute(fromBn, toBn, language),
      });
    }
    setLegs(newLegs);
    setPlanned(true);
    setFocusedId(null);
  };

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">

      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bengali font-bold text-base text-kj-text">
          {lbl('Multi-Stop Planner', 'মাল্টি-স্টপ প্ল্যানার')}
        </span>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">

        {/* Hero card */}
        <div
          className="rounded-[22px] p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Navigation className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-white/70 font-sans">
                {lbl('✦ KoyJabo · Tools', '✦ কই যাবো · টুলস')}
              </p>
              <h1 className="font-bengali font-bold text-xl text-white leading-tight mt-0.5">
                {lbl('Multi-Stop Planner', 'মাল্টি-স্টপ প্ল্যানার')}
              </h1>
              <p className="font-bengali text-[12px] text-white/70 mt-0.5">
                {lbl('Plan a multi-leg journey', 'বহু-পর্যায়ের যাত্রা পরিকল্পনা করুন')}
              </p>
            </div>
          </div>
        </div>

        {/* Stop entry cards */}
        <div className="dc-card rounded-[22px] p-5 space-y-3">
          <h2 className="font-bengali font-bold text-base text-kj-text">
            {lbl('Your stops', 'আপনার স্টপগুলো')}
          </h2>

          <div className="space-y-2">
            {stops.map((stop, i) => (
              <div key={stop.id} className="flex items-start gap-3">
                {/* Dot + connector */}
                <div className="flex flex-col items-center shrink-0 pt-3">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      i === 0
                        ? 'bg-kj-primary ring-4 ring-kj-primary/20'
                        : i === stops.length - 1
                        ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                        : DOT_COLORS[i % DOT_COLORS.length] + ' ring-4 ring-white/10'
                    }`}
                  />
                  {i < stops.length - 1 && (
                    <div className="w-px flex-1 min-h-[24px] bg-kj-line mt-1.5" />
                  )}
                </div>

                {/* Input card */}
                <div className="flex-1 relative">
                  <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors focus-within:border-kj-primary/60">
                    <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans mb-1">
                      {i === 0
                        ? lbl('From · Start', 'শুরু · যাত্রা শুরু')
                        : i === stops.length - 1
                        ? lbl('To · Destination', 'গন্তব্য')
                        : `${lbl('Stop', 'স্টপ')} ${i + 1}`}
                    </p>
                    <input
                      value={stop.name}
                      onChange={e => updateStop(stop.id, e.target.value)}
                      onFocus={() => setFocusedId(stop.id)}
                      onBlur={() => setTimeout(() => setFocusedId(prev => prev === stop.id ? null : prev), 200)}
                      placeholder={
                        i === 0
                          ? lbl('Search or type a location...', 'স্থান খুঁজুন...')
                          : i === stops.length - 1
                          ? lbl('Search destination...', 'গন্তব্য খুঁজুন...')
                          : lbl('Search stop...', 'স্টপ খুঁজুন...')
                      }
                      className="w-full bg-transparent text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none font-bengali"
                    />
                  </div>

                  {focusedId === stop.id && filtered.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-kj-panel border border-kj-line rounded-2xl overflow-hidden shadow-2xl max-h-52 overflow-y-auto">
                      {filtered.map(s => (
                        <button
                          key={s}
                          type="button"
                          onMouseDown={() => selectSuggestion(stop.id, s)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-kj-chip-bg text-kj-text flex items-center gap-2.5 border-b border-kj-line last:border-0 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-kj-text-faint shrink-0" />
                          <span className="font-bengali">{s}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {stops.length > 2 && (
                  <button
                    onClick={() => removeStop(stop.id)}
                    className="p-2 mt-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add stop button */}
          <button
            onClick={addStop}
            className="w-full py-3 border-2 border-dashed border-kj-line rounded-2xl text-kj-text-dim hover:border-kj-primary/60 hover:text-kj-primary transition-colors text-sm font-bengali flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {lbl('Add stop', 'স্টপ যোগ করুন')}
          </button>

          {/* Plan route button */}
          <button
            onClick={plan}
            disabled={stops.filter(s => s.name.trim()).length < 2}
            className="w-full h-12 font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all font-bengali text-kj-primary-ink"
            style={{
              background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
              boxShadow: '0 8px 22px -10px var(--kj-primary)',
            }}
          >
            <Navigation className="w-4 h-4" />
            {lbl('Plan Route', 'রুট পরিকল্পনা করুন')}
          </button>
        </div>

        {/* Results section */}
        {planned && legs.length > 0 && (
          <div className="space-y-3">
            {/* Route summary card */}
            <div className="dc-card rounded-[22px] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans mb-3">
                {lbl('Route summary', 'রুটের সারসংক্ষেপ')}
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="font-sans font-extrabold text-[28px] leading-none tracking-tight text-kj-primary">{legs.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-kj-text-faint font-sans mt-1">{lbl('Legs', 'পর্যায়')}</p>
                </div>
                <div className="h-8 w-px bg-kj-line" />
                <div className="text-center">
                  <p className="font-sans font-extrabold text-[28px] leading-none tracking-tight text-kj-primary">{stops.filter(s => s.name).length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-kj-text-faint font-sans mt-1">{lbl('Stops', 'স্টপ')}</p>
                </div>
                <div className="h-8 w-px bg-kj-line" />
                <div className="flex-1 text-right">
                  <p className="font-bengali text-sm font-semibold text-kj-text">
                    {stops.filter(s => s.name)[0]?.name}
                  </p>
                  <p className="text-[10px] text-kj-text-faint font-bengali mt-0.5">
                    {lbl('→', '→')} {stops.filter(s => s.name).at(-1)?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Leg-by-leg breakdown */}
            <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans px-1">
              {lbl('Leg-by-leg breakdown', 'পর্যায়ক্রম বিভাজন')}
            </p>
            {legs.map((leg, i) => (
              <div key={i} className="dc-card rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${DOT_COLORS[i % DOT_COLORS.length]}`} />
                  <span className="font-bengali font-bold text-sm text-kj-primary truncate max-w-[40%]">{leg.from}</span>
                  <ChevronRight className="w-4 h-4 text-kj-text-faint shrink-0" />
                  <span className="font-bengali font-bold text-sm text-emerald-600 dark:text-emerald-400 truncate max-w-[40%]">{leg.to}</span>
                </div>
                <div className="flex items-start gap-2.5 pt-1 border-t border-dashed border-kj-line">
                  <span className="text-lg leading-none mt-0.5">💡</span>
                  <p className="text-sm text-kj-text-dim font-bengali leading-relaxed">{leg.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ad slot */}
        <SponsoredAdSlot language={language} size="300x250" compact />

      </div>
    </div>
  );
}
