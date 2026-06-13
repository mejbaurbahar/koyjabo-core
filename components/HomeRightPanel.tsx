import React, { useState, useEffect } from 'react';
import DhakaAlive from './DhakaAlive';
import { Wifi, ChevronRight, MapPin, Clock, Zap, Bot, Phone, Shield } from 'lucide-react';

interface HomeRightPanelProps {
  language: 'en' | 'bn';
  isDarkMode: boolean;
  onNavigate: (view: string) => void;
  onIntercity: () => void;
  onEmergency?: () => void;
  favorites: string[];
  isInDhaka: boolean;
  user: { displayName: string; avatarUrl?: string } | null;
}

const metroStations = [
  { en: 'Uttara North', bn: 'উত্তরা উত্তর' },
  { en: 'Uttara Center', bn: 'উত্তরা সেন্টার' },
  { en: 'Pallabi', bn: 'পল্লবী' },
  { en: 'Mirpur 11', bn: 'মিরপুর ১১' },
  { en: 'Mirpur 10', bn: 'মিরপুর ১০' },
  { en: 'Kazipara', bn: 'কাজীপাড়া' },
  { en: 'Shewrapara', bn: 'শেওড়াপাড়া' },
  { en: 'Agargaon', bn: 'আগারগাঁও' },
  { en: 'Bijoy Sarani', bn: 'বিজয় সরণি' },
  { en: 'Farmgate', bn: 'ফার্মগেট' },
  { en: 'Karwan Bazar', bn: 'কারওয়ান বাজার' },
  { en: 'Shahbag', bn: 'শাহবাগ' },
  { en: 'Dhaka University', bn: 'ঢাবি' },
  { en: 'Secretariat', bn: 'সচিবালয়' },
  { en: 'Motijheel', bn: 'মতিঝিল' },
];

const savedRoutes = [
  { label: { en: 'HOME → WORK', bn: 'বাড়ি → অফিস' }, route: { en: 'Banani → Karwan Bazar', bn: 'বনানী → কারওয়ান বাজার' }, meta: '28 min · ৳ 40' },
  { label: { en: 'WORK → HOME', bn: 'অফিস → বাড়ি' }, route: { en: 'Karwan Bazar → Banani', bn: 'কারওয়ান বাজার → বনানী' }, meta: '35 min · ৳ 40' },
  { label: { en: 'WEEKENDS', bn: 'সাপ্তাহিক' }, route: { en: 'Banani → Dhanmondi 32', bn: 'বনানী → ধানমণ্ডি ৩২' }, meta: '42 min · ৳ 60' },
  { label: { en: "DAD'S HOUSE", bn: 'বাবার বাড়ি' }, route: { en: 'Banani → Mirpur DOHS', bn: 'বনানী → মিরপুর ডিওএইচএস' }, meta: '55 min · ৳ 75' },
];

const trendingRoutes = [
  {
    code: 'GL',
    gradient: 'linear-gradient(135deg, #0c8a62, #00b8d9)',
    name: { en: 'Green Line Paribahan', bn: 'গ্রিন লাইন পরিবহন' },
    ac: true,
    route: { en: 'Gulshan 2 → Badda → Rampura → Malibagh → Motijheel', bn: 'গুলশান ২ → বাড্ডা → রামপুরা → মালিবাগ → মতিঝিল' },
    meta: { en: '48 min · 12 stops', bn: '৪৮ মিনিট · ১২ স্টপ' },
  },
  {
    code: 'HF',
    gradient: 'linear-gradient(135deg, #b91c1c, #f97316)',
    name: { en: 'Hanif Enterprise', bn: 'হানিফ এন্টারপ্রাইজ' },
    ac: false,
    route: { en: 'Uttara 7 → Airport → Banani → Farmgate → Paltan', bn: 'উত্তরা ৭ → বিমানবন্দর → বনানী → ফার্মগেট → পল্টন' },
    meta: { en: '1h 15 min · 18 stops', bn: '১ ঘণ্টা ১৫ মিনিট · ১৮ স্টপ' },
  },
  {
    code: 'SH',
    gradient: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    name: { en: 'Shyamoli NR Travels', bn: 'শ্যামলী এনআর ট্রাভেলস' },
    ac: false,
    route: { en: 'Sayedabad → Jatrabari → Kachpur → Chittagong', bn: 'সায়েদাবাদ → যাত্রাবাড়ি → কাঁচপুর → চট্টগ্রাম' },
    meta: { en: '6h 30 min · 4 stops', bn: '৬ ঘণ্টা ৩০ মিনিট · ৪ স্টপ' },
  },
  {
    code: 'BR',
    gradient: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)',
    name: { en: 'BRTC Articulated', bn: 'বিআরটিসি আর্টিকুলেটেড' },
    ac: false,
    route: { en: 'Motijheel → Shahbag → Farmgate → Mohakhali → Abdullahpur', bn: 'মতিঝিল → শাহবাগ → ফার্মগেট → মহাখালী → আব্দুল্লাহপুর' },
    meta: { en: '52 min · 14 stops', bn: '৫২ মিনিট · ১৪ স্টপ' },
  },
  {
    code: 'PR',
    gradient: 'linear-gradient(135deg, #15803d, #ca8a04)',
    name: { en: 'Projapoti Paribahan', bn: 'প্রজাপতি পরিবহন' },
    ac: false,
    route: { en: 'Mirpur 12 → Shyamoli → College Gate → Azimpur → Sadarghat', bn: 'মিরপুর ১২ → শ্যামলী → কলেজ গেট → আজিমপুর → সদরঘাট' },
    meta: { en: '45 min · 11 stops', bn: '৪৫ মিনিট · ১১ স্টপ' },
  },
];

const HomeRightPanel: React.FC<HomeRightPanelProps> = ({
  language,
  isDarkMode,
  onNavigate,
  onIntercity,
  onEmergency,
  favorites,
  isInDhaka,
  user,
}) => {
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
  const [showPWABanner, setShowPWABanner] = useState(false);

  useEffect(() => {
    setShowPWABanner(!window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  return (
    <div className="overflow-y-auto pb-32 md:pb-16">

      {/* 1. DhakaAlive animation strip */}
      <div className="w-full h-[200px] relative overflow-hidden shrink-0">
        <DhakaAlive hideIndicator />
      </div>

      {/* 2. PWA Install banner */}
      {showPWABanner && (
        <div className="bg-kj-panel border border-kj-line rounded-2xl p-4 mx-4 mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-kj-text text-sm font-semibold leading-tight">
              {lbl('No internet? No problem.', 'নেট নেই? সমস্যা নেই.')}
            </p>
            <p className="text-kj-text-faint text-[11px] mt-0.5">
              {lbl('Install as PWA · every route works offline', 'PWA ইনস্টল করুন · সব রুট অফলাইনে')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('INSTALL_APP')}
            className="shrink-0 bg-kj-primary text-kj-primary-ink text-xs font-bold px-3 py-1.5 rounded-full"
          >
            {lbl('Install', 'ইনস্টল')}
          </button>
        </div>
      )}

      {/* 3. AdSense slot */}
      <div className="mx-4 mt-3 rounded-2xl border border-dashed border-kj-line p-3 flex items-center justify-center min-h-[60px]">
        <span className="text-kj-text-faint text-[10px]">
          {lbl('Sponsored · Google AdSense', 'স্পনসর্ড · গুগল অ্যাডসেন্স')}
        </span>
      </div>

      {/* 4. "How are you traveling?" 6 cards */}
      <div className="px-4 mt-4">
        <h2 className="text-kj-text font-bold text-sm mb-3">
          {lbl('How are you traveling?', 'কী খুঁজছেন?')}
        </h2>
        <div className="grid grid-cols-2 gap-2">

          {/* Local Bus */}
          <button
            onClick={() => onNavigate('LOCAL_BUS_HUB')}
            className="kj-mode-tile relative overflow-hidden rounded-2xl p-3.5 text-left text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #0c8a62, #00b8d9)' }}
          >
            <p className="text-white/75 text-[9px] uppercase tracking-widest">{lbl('Popular', 'জনপ্রিয়')}</p>
            <p className="font-bold text-[13px] mt-0.5">{lbl('Local bus', 'লোকাল বাস')}</p>
            <p className="text-white/65 text-[10px] mt-0.5">{lbl('200+ routes', '২০০+ রুট')}</p>
            <span className="kj-bob absolute right-2.5 bottom-2.5 text-xl">🚌</span>
          </button>

          {/* Metro Rail */}
          <button
            onClick={() => onNavigate('METRO_HUB')}
            className="kj-mode-tile relative overflow-hidden rounded-2xl p-3.5 text-left text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #0ea5e9)' }}
          >
            <p className="text-white/75 text-[9px] uppercase tracking-widest">{lbl('Live tracking', 'লাইভ')}</p>
            <p className="font-bold text-[13px] mt-0.5">{lbl('Metro Rail', 'মেট্রো রেল')}</p>
            <p className="text-white/65 text-[10px] mt-0.5">{lbl('MRT-6 · 17 stations', 'MRT-6 · ১৭ স্টেশন')}</p>
            <span className="kj-bob absolute right-2.5 bottom-2.5 text-xl font-extrabold text-white/30 text-2xl leading-none select-none">M6</span>
          </button>

          {/* BD Railway */}
          <button
            onClick={() => onNavigate('TRAIN_LIST')}
            className="kj-mode-tile relative overflow-hidden rounded-2xl p-3.5 text-left text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}
          >
            <p className="text-white/75 text-[9px] uppercase tracking-widest">{lbl('BD Railway', 'বাংলাদেশ রেলওয়ে')}</p>
            <p className="font-bold text-[13px] mt-0.5">{lbl('All routes', 'সব রুট')}</p>
            <p className="text-white/65 text-[10px] mt-0.5">{lbl('Schedule & fares', 'সময়সূচি ও ভাড়া')}</p>
            <span className="kj-bob absolute right-2.5 bottom-2.5 text-xl">🚆</span>
          </button>

          {/* Intercity */}
          <button
            onClick={onIntercity}
            className="kj-mode-tile relative overflow-hidden rounded-2xl p-3.5 text-left text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #b45309, #fbbf24)' }}
          >
            <p className="text-white/75 text-[9px] uppercase tracking-widest">{lbl('64 districts', '৬৪ জেলা')}</p>
            <p className="font-bold text-[13px] mt-0.5">{lbl('Bus/train/flight', 'বাস/ট্রেন/ফ্লাইট')}</p>
            <p className="text-white/65 text-[10px] mt-0.5">{lbl('All Bangladesh', 'সারা বাংলাদেশ')}</p>
            <span className="kj-bob absolute right-2.5 bottom-2.5 text-xl">✈️</span>
          </button>

          {/* Launch & Steamer */}
          <button
            onClick={() => onNavigate('LAUNCH_HUB')}
            className="kj-mode-tile relative overflow-hidden rounded-2xl p-3.5 text-left text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #0c4a6e, #38bdf8)' }}
          >
            <p className="text-white/75 text-[9px] uppercase tracking-widest">{lbl('River route', 'নদীপথ')}</p>
            <p className="font-bold text-[13px] mt-0.5">{lbl('Launch & Steamer', 'লঞ্চ ও স্টিমার')}</p>
            <p className="text-white/65 text-[10px] mt-0.5">{lbl('Sadarghat → Barisal', 'সদরঘাট → বরিশাল')}</p>
            <span className="kj-bob absolute right-2.5 bottom-2.5 text-xl">⛵</span>
          </button>

          {/* AI Assistant */}
          <button
            onClick={() => onNavigate('AI_ASSISTANT')}
            className="kj-mode-tile relative overflow-hidden rounded-2xl p-3.5 text-left text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #ff2a6d)' }}
          >
            <div className="flex items-center gap-1.5">
              <p className="text-white/75 text-[9px] uppercase tracking-widest">{lbl('New', 'নতুন')}</p>
              <span className="bg-white/25 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">AI</span>
            </div>
            <p className="font-bold text-[13px] mt-0.5">{lbl('AI Assistant', 'AI সহকারী')}</p>
            <p className="text-white/65 text-[10px] mt-0.5">{lbl('Ask in Bangla', 'বাংলায় জিজ্ঞেস করুন')}</p>
            <span className="kj-bob absolute right-2.5 bottom-2.5 text-xl">🤖</span>
          </button>

        </div>
      </div>

      {/* 5. Metro · Live section */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-kj-text font-bold text-sm">
            {lbl('Metro · Live', 'মেট্রো · লাইভ')}
          </h2>
          <button
            onClick={() => onNavigate('METRO_HUB')}
            className="text-kj-primary text-xs font-semibold flex items-center gap-0.5"
          >
            {lbl('See all stations', 'সব স্টেশন দেখুন')}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="bg-kj-panel border border-kj-line rounded-2xl p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                <span className="text-kj-text text-xs font-semibold">
                  {lbl('Live · MRT Line 6', 'লাইভ · মেট্রো রেল')}
                </span>
              </div>
              <p className="text-kj-text-dim text-[11px] mt-1">Uttara North → Motijheel</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] text-kj-text-faint uppercase tracking-widest">
                {lbl('Next train', 'পরবর্তী ট্রেন')}
              </span>
              <p className="text-cyan-400 text-xl font-bold leading-tight">2 min</p>
            </div>
          </div>
              <p className="text-kj-text-faint text-[11px] mt-2">
            {lbl('On time, no delays', 'কোনো বিলম্ব নেই')}
          </p>
          <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-kj-text-faint shrink-0" />
              <span className="text-kj-text-faint text-[11px]">৭:১০ AM – ৯:৪০ PM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-kj-primary text-[11px] font-semibold">{lbl('৳ 20–100', '৳ ২০–১০০')}</span>
              <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {lbl('Operating', 'চলমান')}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto mt-3 pb-1 no-scrollbar">
            {metroStations.map((s) => (
              <span
                key={s.en}
                className="shrink-0 bg-kj-chip-bg text-kj-text text-[10px] px-2 py-1 rounded-full whitespace-nowrap"
              >
                {lbl(s.en, s.bn)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Your saved routes */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-kj-text font-bold text-sm">
            {lbl('Your saved routes', 'আপনার সেভ করা রুট')}
          </h2>
          <button className="text-kj-primary text-xs font-semibold">
            {lbl('Edit', 'সম্পাদনা')}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {savedRoutes.map((r, i) => (
            <div
              key={i}
              className="bg-kj-panel border border-kj-line rounded-xl p-3 shrink-0 w-[160px]"
            >
              <p className="text-kj-text-faint text-[9px] uppercase tracking-wider">{lbl(r.label.en, r.label.bn)}</p>
              <p className="text-kj-text text-xs font-semibold mt-1 leading-tight">{lbl(r.route.en, r.route.bn)}</p>
              <p className="text-kj-primary text-[10px] mt-1">{r.meta}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Trending routes today */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-kj-text font-bold text-sm">
            {lbl('Trending routes today', 'ট্রেন্ডিং রুট আজ')}
          </h2>
          <button
            onClick={() => onNavigate('LOCAL_BUS_HUB')}
            className="text-kj-primary text-xs font-semibold flex items-center gap-0.5"
          >
            {lbl('View all', 'সব দেখুন')}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {trendingRoutes.map((r) => (
          <div
            key={r.code}
            className="bg-kj-panel border border-kj-line rounded-2xl p-3.5 mb-2 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs"
              style={{ background: r.gradient }}
            >
              {r.code}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-kj-text font-bold text-sm">{lbl(r.name.en, r.name.bn)}</p>
                {r.ac && (
                  <span className="bg-cyan-500/15 text-cyan-400 text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none">AC</span>
                )}
              </div>
              <p className="text-kj-text-dim text-xs truncate mt-0.5">{lbl(r.route.en, r.route.bn)}</p>
              <p className="text-kj-text-faint text-[10px] mt-0.5">{lbl(r.meta.en, r.meta.bn)}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-kj-text-faint shrink-0" />
          </div>
        ))}
      </div>

      {/* 8. AI Beta card */}
      <div
        className="mx-4 mt-4 rounded-2xl p-4 text-white relative"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
        <span className="absolute top-3 right-3 bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
          Beta
        </span>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-white/80" />
          <p className="font-bold text-sm">{lbl('Ask in Bangla or English', 'বাংলায় জিজ্ঞেস করুন')}</p>
        </div>
        <div className="bg-white/10 rounded-xl px-3 py-2 text-white/60 text-xs mb-3">
          {lbl('Which bus goes from Gulshan to Motijheel?', 'কোন বাস গুলশান থেকে মতিঝিল যায়?')}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { en: "How much to Cox's Bazar?", bn: 'কক্সবাজার কত?' },
            { en: 'Airport → Farmgate', bn: 'Airport → Farmgate' },
            { en: 'Sadarghat launch times', bn: 'সদরঘাট লঞ্চ' },
          ].map((chip) => (
            <button
              key={chip.en}
              onClick={() => onNavigate('AI_ASSISTANT')}
              className="bg-white/15 text-white text-[11px] px-2.5 py-1 rounded-full"
            >
              {lbl(chip.en, chip.bn)}
            </button>
          ))}
        </div>
        <button
          onClick={() => onNavigate('AI_ASSISTANT')}
          className="bg-white text-indigo-700 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1"
        >
          <Zap className="w-3.5 h-3.5" />
          {lbl('Ask AI →', 'AI-কে জিজ্ঞেস করুন →')}
        </button>
      </div>

      {/* 9. Emergency help card */}
      <div className="bg-kj-panel border border-kj-line rounded-2xl mx-4 mt-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-kj-text font-bold text-sm">{lbl('Emergency help', 'জরুরি সহায়তা')}</h2>
            <p className="text-kj-text-faint text-[11px] mt-0.5">
              {lbl('80+ verified contacts', '৮০+ যাচাইকৃত নম্বর')}
            </p>
          </div>
          <Shield className="w-5 h-5 text-red-400 shrink-0" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: '🚔', label: { en: 'Police', bn: 'পুলিশ' } },
            { icon: '🚑', label: { en: 'Ambulance', bn: 'অ্যাম্বুলেন্স' } },
            { icon: '🚒', label: { en: 'Fire service', bn: 'ফায়ার সার্ভিস' } },
            { icon: '🛣️', label: { en: 'Highway', bn: 'হাইওয়ে' } },
          ].map((chip) => (
            <button
              key={chip.label.en}
              onClick={onEmergency}
              className="bg-kj-chip-bg rounded-full px-3 py-1.5 text-xs font-semibold text-kj-text flex items-center gap-1.5"
            >
              <span>{chip.icon}</span>
              {lbl(chip.label.en, chip.label.bn)}
            </button>
          ))}
        </div>
      </div>

      {/* 10. Footer */}
      <div className="text-center mx-4 mt-6 mb-4">
        <p className="text-kj-text-faint text-[11px]">
          {lbl('KoyJabo · Open source · Free forever', 'কই যাবো · ওপেন সোর্স · বিনামূল্যে')}
        </p>
        <p className="text-kj-text-faint text-[11px] mt-0.5">v 1.0.0 · Updated May 2026</p>
      </div>

    </div>
  );
};

export default HomeRightPanel;
