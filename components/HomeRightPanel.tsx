import React, { useState, useEffect } from 'react';
import HomeHeroStrip from './HomeHeroStrip';
import { Wifi, ChevronRight, Clock, Zap, Bot, Shield } from 'lucide-react';

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

const AdSlot: React.FC<{ language: 'en' | 'bn'; size: string }> = ({ language, size }) => (
  <div className="mx-4 my-3 rounded-2xl border border-dashed border-kj-line/80 bg-kj-panel-muted/40 p-3 flex flex-col items-center justify-center min-h-[72px]">
    <span className="text-[9px] font-bold text-kj-text-faint uppercase tracking-widest mb-0.5">
      {language === 'bn' ? 'বিজ্ঞাপন' : 'Sponsored'}
    </span>
    <span className="text-[10px] text-kj-text-faint">Google AdSense · {size}</span>
    <span className="text-[9px] text-kj-text-faint/70 mt-0.5">{language === 'bn' ? 'রিজার্ভড স্পেস' : 'reserved'}</span>
  </div>
);

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
  { en: 'Dhaka University', bn: 'ঢাকা বিশ্ববিদ্যালয়' },
  { en: 'Secretariat', bn: 'বাংলাদেশ সচিবালয়' },
  { en: 'Motijheel', bn: 'মতিঝিল' },
];

const savedRoutes = [
  { label: { en: 'HOME → WORK', bn: 'বাসা → অফিস' }, route: { en: 'Banani → Karwan Bazar', bn: 'বনানী → কারওয়ান বাজার' }, meta: { en: '28 min · ৳ 40', bn: '২৮ মিনিট · ৳ ৪০' } },
  { label: { en: 'WORK → HOME', bn: 'অফিস → বাসা' }, route: { en: 'Karwan Bazar → Banani', bn: 'কারওয়ান বাজার → বনানী' }, meta: { en: '35 min · ৳ 40', bn: '৩৫ মিনিট · ৳ ৪০' } },
  { label: { en: 'WEEKENDS', bn: 'সাপ্তাহান্তে' }, route: { en: 'Banani → Dhanmondi 32', bn: 'বনানী → ধানমন্ডি ৩২' }, meta: { en: '42 min · ৳ 60', bn: '৪২ মিনিট · ৳ ৬০' } },
  { label: { en: "DAD'S HOUSE", bn: 'বাবার বাসা' }, route: { en: 'Banani → Mirpur DOHS', bn: 'বনানী → মিরপুর ডিওএইচএস' }, meta: { en: '55 min · ৳ 75', bn: '৫৫ মিনিট · ৳ ৭৫' } },
];

const trendingRoutes = [
  { code: 'GL', gradient: 'linear-gradient(135deg, #0c8a62, #00b8d9)', name: { en: 'Green Line Paribahan', bn: 'গ্রীন লাইন পরিবহন' }, ac: true, intercity: false, route: { en: 'Gulshan 2 → Badda → Rampura → Malibagh → Motijheel', bn: 'গুলশান ২ → বাড্ডা → রামপুরা → মালিবাগ → মতিঝিল' }, fare: '৬০', meta: { en: '48 min · 12 stops', bn: '৪৮ মি · ১২ স্টপ' } },
  { code: 'HF', gradient: 'linear-gradient(135deg, #b91c1c, #f97316)', name: { en: 'Hanif Enterprise', bn: 'হানিফ এন্টারপ্রাইজ' }, ac: false, intercity: false, route: { en: 'Uttara Sector 7 → Airport → Banani → Farmgate → Paltan', bn: 'উত্তরা সেক্টর ৭ → এয়ারপোর্ট → বনানী → ফার্মগেট → পল্টন' }, fare: '৭৫', meta: { en: '1h 15 min · 18 stops', bn: '১ ঘ ১৫ মি · ১৮ স্টপ' } },
  { code: 'SH', gradient: 'linear-gradient(135deg, #7c3aed, #3b82f6)', name: { en: 'Shyamoli NR Travels', bn: 'শ্যামলী এনআর ট্রাভেলস' }, ac: true, intercity: true, route: { en: 'Sayedabad → Jatrabari → Kanchpur → Chittagong', bn: 'সায়েদাবাদ → যাত্রাবাড়ি → কাঁচপুর → চট্টগ্রাম' }, fare: '৬৮০', meta: { en: '6h 30 min · 4 stops', bn: '৬ ঘ ৩০ মি · ৪ স্টপ' } },
  { code: 'BR', gradient: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)', name: { en: 'BRTC Articulated', bn: 'বিআরটিসি আর্টিকুলেটেড' }, ac: false, intercity: false, route: { en: 'Motijheel → Shahbag → Farmgate → Mohakhali → Abdullahpur', bn: 'মতিঝিল → শাহবাগ → ফার্মগেট → মহাখালী → আবদুল্লাহপুর' }, fare: '৪৫', meta: { en: '52 min · 14 stops', bn: '৫২ মি · ১৪ স্টপ' } },
  { code: 'PR', gradient: 'linear-gradient(135deg, #15803d, #ca8a04)', name: { en: 'Projapoti Paribahan', bn: 'প্রজাপতি পরিবহন' }, ac: false, intercity: false, route: { en: 'Mirpur 12 → Shyamoli → College Gate → Azimpur → Sadarghat', bn: 'মিরপুর ১২ → শ্যামলী → কলেজ গেট → আজিমপুর → সদরঘাট' }, fare: '৩০', meta: { en: '45 min · 11 stops', bn: '৪৫ মি · ১১ স্টপ' } },
];

const modeCards = [
  { tag: { en: 'Popular', bn: 'জনপ্রিয়' }, title: { en: 'Local bus', bn: 'লোকাল বাস' }, sub: { en: '200+ routes', bn: '২০০+ রুট' }, emoji: '🚌', bg: 'linear-gradient(135deg, #0c8a62, #00b8d9)', view: 'LOCAL_BUS_HUB' },
  { tag: { en: 'Live', bn: 'লাইভ' }, title: { en: 'Metro Rail', bn: 'মেট্রো রেল' }, sub: { en: 'MRT-6 · 15 stations', bn: 'MRT-6 · ১৫ স্টেশন' }, emoji: 'M6', bg: 'linear-gradient(135deg, #1e3a8a, #0ea5e9)', view: 'METRO_HUB', emojiClass: 'text-2xl font-black text-white/25' },
  { tag: { en: 'BD Railway · all routes', bn: 'BD রেলওয়ে · সব রুট' }, title: { en: 'Train', bn: 'ট্রেন' }, sub: { en: 'Schedule & fares', bn: 'সময়সূচি ও ভাড়া' }, emoji: '🚆', bg: 'linear-gradient(135deg, #7c3aed, #f59e0b)', view: 'TRAIN_LIST' },
  { tag: { en: '64 districts', bn: '৬৪ জেলা' }, title: { en: 'Intercity', bn: 'আন্তঃজেলা' }, sub: { en: 'Bus/train/flight', bn: 'বাস/ট্রেন/ফ্লাইট' }, emoji: '✈️', bg: 'linear-gradient(135deg, #b45309, #fbbf24)', intercity: true },
  { tag: { en: 'River route', bn: 'নদীপথ' }, title: { en: 'Launch & Steamer', bn: 'লঞ্চ ও স্টিমার' }, sub: { en: 'Sadarghat → Barisal', bn: 'সদরঘাট → বরিশাল' }, emoji: '⛵', bg: 'linear-gradient(135deg, #0c4a6e, #38bdf8)', view: 'LAUNCH_HUB' },
  { tag: { en: 'New', bn: 'নতুন' }, title: { en: 'AI Assistant', bn: 'AI সহায়ক' }, sub: { en: 'Ask in Bangla', bn: 'বাংলায় জিজ্ঞেস করুন' }, emoji: '🤖', bg: 'linear-gradient(135deg, #6d28d9, #ff2a6d)', view: 'AI_ASSISTANT', ai: true },
];

const HomeRightPanel: React.FC<HomeRightPanelProps> = ({
  language, onNavigate, onIntercity, onEmergency, user,
}) => {
  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const [showPWABanner, setShowPWABanner] = useState(false);

  useEffect(() => {
    setShowPWABanner(!window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  return (
    <div className="overflow-y-auto pb-28 md:pb-6 h-full">
      <HomeHeroStrip language={language} />

      {showPWABanner && (
        <div className="dc-card kj-glass rounded-2xl p-4 mx-4 mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/15 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-kj-text text-sm font-semibold">{lbl('No internet? No problem.', 'নেট নেই? সমস্যা নেই।')}</p>
            <p className="text-kj-text-faint text-[11px] mt-0.5">{lbl('Install as PWA · every route works offline', 'PWA ইনস্টল করুন · সব রুট অফলাইনে কাজ করে')}</p>
          </div>
          <button type="button" onClick={() => onNavigate('INSTALL_APP')} className="shrink-0 bg-kj-primary text-kj-primary-ink text-xs font-bold px-3 py-1.5 rounded-full">
            {lbl('Install', 'ইনস্টল')}
          </button>
        </div>
      )}

      <AdSlot language={language} size="728 × 90" />

      <div className="px-4 mt-2">
        <h2 className="text-kj-text font-bold text-sm mb-3">{lbl('How are you traveling?', 'কী খুঁজছেন?')}</h2>
        <div className="grid grid-cols-2 gap-2">
          {modeCards.map((card) => (
            <button
              key={card.title.en}
              type="button"
              onClick={() => card.intercity ? onIntercity() : onNavigate(card.view!)}
              className="kj-mode-tile relative overflow-hidden rounded-2xl p-3.5 text-left text-white"
              style={{ background: card.bg }}
            >
              <div className="flex items-center gap-1">
                <p className="text-white/75 text-[9px] font-bold uppercase tracking-widest">{lbl(card.tag.en, card.tag.bn)}</p>
                {card.ai && <span className="bg-white/25 text-white text-[8px] font-bold px-1 rounded-full">AI</span>}
              </div>
              <p className="font-bold text-[13px] mt-0.5 leading-tight">{lbl(card.title.en, card.title.bn)}</p>
              <p className="text-white/65 text-[10px] mt-0.5">{lbl(card.sub.en, card.sub.bn)}</p>
              <span className={`kj-bob absolute right-2.5 bottom-2.5 ${card.emojiClass || 'text-xl'}`}>{card.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      <AdSlot language={language} size="728 × 90" />

      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-kj-text font-bold text-sm">{lbl('Metro · Live', 'মেট্রো · লাইভ')}</h2>
          <button type="button" onClick={() => onNavigate('METRO_HUB')} className="text-kj-primary text-xs font-semibold flex items-center gap-0.5">
            {lbl('See all stations', 'সব স্টেশন দেখুন')}<ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="dc-card kj-glass rounded-2xl p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-kj-primary">M6</span>
                <span className="w-2 h-2 rounded-full bg-kj-primary animate-pulse" />
                <span className="text-kj-text text-xs font-semibold">{lbl('Live · MRT Line 6', 'লাইভ · মেট্রো রেল')}</span>
              </div>
              <p className="text-kj-text-dim text-[11px] mt-1">{lbl('Uttara North → Motijheel', 'উত্তরা উত্তর → মতিঝিল')}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] text-kj-text-faint uppercase tracking-widest">{lbl('Next train', 'পরবর্তী ট্রেন')}</span>
              <p className="text-kj-primary text-xl font-bold leading-tight">{lbl('2 min', '২ মিনিট')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-kj-text-faint flex-wrap">
            <span className="text-kj-primary font-semibold">{lbl('৳ 20–100', '৳ ২০-১০০')}</span>
            <span>· {lbl('fare', 'ভাড়া')}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />৭:১০ AM – ৯:৪০ PM</span>
            <span>· {lbl('Operating', 'চলমান')}</span>
            <span className="text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />● {lbl('On time, no delays', 'কোনো বিলম্ব নেই')}</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto mt-3 pb-1 no-scrollbar">
            {metroStations.map((s) => (
              <span key={s.en} className="shrink-0 bg-kj-chip-bg text-kj-text text-[10px] px-2 py-1 rounded-full whitespace-nowrap">{lbl(s.en, s.bn)}</span>
            ))}
          </div>
        </div>
      </div>

      <AdSlot language={language} size="728 × 90" />

      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-kj-text font-bold text-sm">{lbl('Your saved routes', 'আপনার সেভ করা রুট')}</h2>
          <button type="button" className="text-kj-primary text-xs font-semibold">{lbl('Edit', 'সম্পাদনা')}</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {savedRoutes.map((r, i) => (
            <div key={i} className="dc-card rounded-xl p-3 shrink-0 w-[160px]">
              <p className="text-kj-text-faint text-[9px] uppercase tracking-wider">{lbl(r.label.en, r.label.bn)}</p>
              <p className="text-kj-text text-xs font-semibold mt-1 leading-tight">{lbl(r.route.en, r.route.bn)}</p>
              <p className="text-kj-primary text-[10px] mt-1">{lbl(r.meta.en, r.meta.bn)}</p>
            </div>
          ))}
        </div>
      </div>

      <AdSlot language={language} size="728 × 90" />

      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-kj-text font-bold text-sm">{lbl('Trending routes today', 'ট্রেন্ডিং রুট আজ')}</h2>
          <button type="button" onClick={() => onNavigate('LOCAL_BUS_HUB')} className="text-kj-primary text-xs font-semibold flex items-center gap-0.5">
            {lbl('View all', 'সব দেখুন')}<ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {trendingRoutes.map((r) => (
          <div key={r.code} className="dc-card kj-glass rounded-2xl p-3.5 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs" style={{ background: r.gradient }}>{r.code}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-kj-text font-bold text-sm">{lbl(r.name.en, r.name.bn)}</p>
                {r.ac && <span className="bg-cyan-500/15 text-cyan-400 text-[9px] font-semibold px-1.5 py-0.5 rounded-full">AC</span>}
                {r.intercity && <span className="bg-amber-500/15 text-amber-400 text-[9px] font-semibold px-1.5 py-0.5 rounded-full">{lbl('Intercity', 'আন্তঃজেলা')}</span>}
              </div>
              <p className="text-kj-text-dim text-xs truncate mt-0.5">{lbl(r.route.en, r.route.bn)}</p>
              <p className="text-kj-text-faint text-[10px] mt-0.5 flex items-center gap-1">
                <span className="text-kj-primary font-semibold">৳ {r.fare}</span>
                <span>·</span>
                <span>{lbl(r.meta.en, r.meta.bn)}</span>
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-kj-text-faint shrink-0" />
          </div>
        ))}
      </div>

      <div className="mx-4 mt-4 rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
        <span className="absolute top-3 right-3 bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Beta</span>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-white/80" />
          <p className="font-bold text-sm">{lbl('AI Assistant', 'AI সহায়ক')}</p>
        </div>
        <p className="text-white/70 text-xs mb-3">{lbl('Ask in Bangla — "Which bus goes from Gulshan to Motijheel?"', 'বাংলায় জিজ্ঞেস করুন — "কোন বাস গুলশান থেকে মতিঝিল যায়?"')}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { en: "How much to Cox's Bazar?", bn: 'কক্সবাজার যেতে কত খরচ?' },
            { en: 'Airport → Farmgate', bn: 'বিমানবন্দর থেকে ফার্মগেট' },
            { en: 'Sadarghat launch times', bn: 'সদরঘাট লঞ্চ সময়সূচী' },
          ].map((chip) => (
            <button key={chip.en} type="button" onClick={() => onNavigate('AI_ASSISTANT')} className="bg-white/15 text-white text-[11px] px-2.5 py-1 rounded-full">{lbl(chip.en, chip.bn)}</button>
          ))}
        </div>
        <button type="button" onClick={() => onNavigate('AI_ASSISTANT')} className="bg-white text-indigo-700 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />{lbl('Ask AI →', 'AI-কে জিজ্ঞেস করুন →')}
        </button>
      </div>

      <AdSlot language={language} size="300 × 250" />

      <div className="dc-card rounded-2xl mx-4 mt-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-kj-text font-bold text-sm">{lbl('Emergency help', 'জরুরি সহায়তা')}</h2>
            <p className="text-kj-text-faint text-[11px] mt-0.5">{lbl('80+ verified contacts', '৮০+ যাচাইকৃত নম্বর')}</p>
          </div>
          <Shield className="w-5 h-5 text-red-400 shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '🚔', label: { en: 'Police', bn: 'পুলিশ' }, num: '999' },
            { icon: '🚑', label: { en: 'Ambulance', bn: 'অ্যাম্বুলেন্স' }, num: '199' },
            { icon: '🚒', label: { en: 'Fire', bn: 'ফায়ার' }, num: '102' },
            { icon: '🛣️', label: { en: 'Highway', bn: 'হাইওয়ে' }, num: '+880-2' },
          ].map((chip) => (
            <button key={chip.num} type="button" onClick={onEmergency} className="bg-kj-chip-bg rounded-xl px-3 py-2 text-left flex items-center gap-2">
              <span>{chip.icon}</span>
              <div>
                <p className="text-xs font-semibold text-kj-text">{lbl(chip.label.en, chip.label.bn)}</p>
                <p className="text-[11px] text-kj-primary font-bold">{chip.num}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center mx-4 mt-6 mb-4">
        <p className="text-kj-text-faint text-[11px]">{lbl('KoyJabo · Open source · Free forever', 'কই যাবো · ওপেন সোর্স · বিনামূল্যে')}</p>
        <p className="text-kj-text-faint text-[11px] mt-0.5">{lbl('v 1.0.0 · Updated May 2026', 'v 1.0.0 · মে ২০২৬ আপডেট')}</p>
      </div>
    </div>
  );
};

export default HomeRightPanel;
