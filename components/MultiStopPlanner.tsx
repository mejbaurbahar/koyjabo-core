import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, ChevronRight, MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureUsage } from '../services/analyticsService';
import { STATIONS, METRO_STATIONS, RAILWAY_STATIONS } from '../constants';
import AdSenseAd from './AdSenseAd';


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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shrink-0">
          <Navigation className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{lbl('Multi-Stop Planner', 'মাল্টি-স্টপ প্ল্যানার')}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{lbl('Plan a multi-leg journey', 'বহু-পর্যায়ের যাত্রা পরিকল্পনা করুন')}</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-2">
          {stops.map((stop, i) => (
            <div key={stop.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-blue-500 text-white' : i === stops.length - 1 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'}`}>
                  {i + 1}
                </div>
                {i < stops.length - 1 && <div className="w-0.5 h-4 bg-gray-200 dark:bg-slate-600 my-0.5" />}
              </div>
              <div className="flex-1 relative">
                <input
                  value={stop.name}
                  onChange={e => updateStop(stop.id, e.target.value)}
                  onFocus={() => setFocusedId(stop.id)}
                  onBlur={() => setTimeout(() => setFocusedId(prev => prev === stop.id ? null : prev), 200)}
                  placeholder={i === 0 ? lbl('From (start)', 'যাত্রা শুরু') : i === stops.length - 1 ? lbl('To (destination)', 'গন্তব্য') : `${lbl('Stop', 'স্টপ')} ${i + 1}`}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm dark:text-white"
                />
                {focusedId === stop.id && filtered.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                    {filtered.map(s => (
                      <button key={s} type="button"
                        onMouseDown={() => selectSuggestion(stop.id, s)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" /> {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {stops.length > 2 && (
                <button onClick={() => removeStop(stop.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button onClick={addStop} className="flex items-center gap-1.5 px-3 py-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl">
              <Plus className="w-4 h-4" /> {lbl('Add stop', 'স্টপ যোগ করুন')}
            </button>
            <button onClick={plan}
              disabled={stops.filter(s => s.name.trim()).length < 2}
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-semibold text-sm rounded-xl">
              {lbl('Plan Route', 'রুট পরিকল্পনা করুন')}
            </button>
          </div>
        </div>

        <AdSenseAd adSlot="auto" className="my-6" />


        {planned && legs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm px-1">{lbl('Your journey plan', 'আপনার যাত্রা পরিকল্পনা')}</h3>
            {legs.map((leg, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white flex-wrap">
                  <span className="text-blue-600 dark:text-blue-400">{leg.from}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-green-600 dark:text-green-400">{leg.to}</span>
                </div>
                <div className="mt-2 flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{leg.suggestion}</p>
                </div>
              </div>
            ))}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">{lbl('Total journey', 'মোট যাত্রা')}</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {legs.length} {lbl('legs', 'পর্যায়')} · {stops.filter(s => s.name).length} {lbl('stops', 'স্টপ')}
              </p>
            </div>
          </div>
        )}
        <AdSenseAd adSlot="auto" className="my-8" />
        <div className="h-4" />

      </div>
    </div>
  );
}
