import React, { useState, useEffect } from 'react';
import { Bus, Zap, Bot, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { MiniVehicle, type VehicleKind } from './design/Vehicles3D';
import SponsoredAdSlot from './SponsoredAdSlot';
import { BUS_DATA } from '../constants';
import { getRecentBusSearches } from '../services/analyticsService';
import type { BusRoute } from '../types';

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

const metroStops = [
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
const METRO_CURRENT_IDX = 9;


interface ModeTileDef {
  title: { en: string; bn: string };
  sub: { en: string; bn: string };
  badge?: { en: string; bn: string };
  grad: string;
  vehicle: VehicleKind;
  palette: string[];
  icon: React.ReactNode;
  action: () => void;
}

const SectionHeader: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({ title, action, onAction }) => (
  <div className="flex items-baseline justify-between mb-3">
    <h2 className="font-bengali font-bold text-lg text-kj-text tracking-tight">{title}</h2>
    {action && (
      <button type="button" onClick={onAction} className="text-kj-primary text-xs font-semibold inline-flex items-center gap-1 hover:opacity-80">
        {action}<ArrowRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

const HomeRightPanel: React.FC<HomeRightPanelProps> = ({
  language, isDarkMode, onNavigate, onIntercity, onEmergency, favorites,
}) => {
  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);

  // Real favorites — buses the user has saved
  const favoriteBuses: BusRoute[] = React.useMemo(
    () => favorites.map(id => BUS_DATA.find(b => b.id === id)).filter((b): b is BusRoute => !!b).slice(0, 8),
    [favorites]
  );

  // Real trending — most searched buses from analytics, fall back to popular static list
  const [recentSearches] = React.useState(() => getRecentBusSearches(200));
  const trendingBuses: Array<{ bus: BusRoute; count: number }> = React.useMemo(() => {
    // Count searches per bus
    const counts: Record<string, number> = {};
    recentSearches.forEach(r => { counts[r.busId] = (counts[r.busId] || 0) + 1; });
    // Sort by count
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([busId, count]) => ({ bus: BUS_DATA.find(b => b.id === busId) as BusRoute, count }))
      .filter(x => x.bus);
    // Fallback to popular static buses if analytics is empty
    if (sorted.length === 0) {
      const fallback = ['green-line-ac', 'hanif-paribahan', 'brtc-double-decker', 'projapoti', 'shyamoli-nr'];
      return fallback
        .map(id => BUS_DATA.find(b => b.id === id))
        .filter((b): b is BusRoute => !!b)
        .slice(0, 5)
        .map(bus => ({ bus, count: 0 }));
    }
    return sorted;
  }, [recentSearches]);

  const modeTiles: ModeTileDef[] = [
    { title: { en: 'Local bus', bn: 'লোকাল বাস' }, sub: { en: '200+ routes', bn: '২০০+ রুট' }, badge: { en: 'Popular', bn: 'জনপ্রিয়' }, grad: 'linear-gradient(135deg, var(--kj-primary) 0%, var(--kj-primary-deep) 100%)', vehicle: 'bus', palette: ['#ffffff', 'rgba(255,255,255,0.45)', '#04130d', '#fbbf24'], icon: <Bus className="w-5 h-5" />, action: () => onNavigate('LOCAL_BUS_HUB') },
    { title: { en: 'Metro Rail', bn: 'মেট্রো রেল' }, sub: { en: 'MRT-6 · 15 stations', bn: 'MRT-6 · ১৫ স্টেশন' }, grad: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)', vehicle: 'train', palette: ['#ffffff', 'rgba(255,255,255,0.4)', '#fbbf24'], icon: <span className="text-xs font-black">M6</span>, action: () => onNavigate('METRO_HUB') },
    { title: { en: 'Train', bn: 'ট্রেন' }, sub: { en: 'BD Railway · all routes', bn: 'BD রেলওয়ে · সব রুট' }, grad: 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)', vehicle: 'train', palette: ['#ffffff', 'rgba(255,255,255,0.4)', '#fef3c7'], icon: <span className="text-lg">🚆</span>, action: () => onNavigate('TRAIN_LIST') },
    { title: { en: 'Intercity', bn: 'আন্তঃজেলা' }, sub: { en: '64 districts · bus/train/flight', bn: '৬৪ জেলা · বাস/ট্রেন/ফ্লাইট' }, grad: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', vehicle: 'plane', palette: ['#ffffff', '#3b82f6', '#ef4444'], icon: <span className="text-lg">✈️</span>, action: onIntercity },
    { title: { en: 'Launch & Steamer', bn: 'লঞ্চ ও স্টিমার' }, sub: { en: 'Sadarghat → Barisal', bn: 'সদরঘাট → বরিশাল' }, grad: 'linear-gradient(135deg, #0ea5e9 0%, #075985 100%)', vehicle: 'launch', palette: ['#ffffff', 'rgba(255,255,255,0.4)', '#fbbf24'], icon: <span className="text-lg">⛵</span>, action: () => onNavigate('LAUNCH_HUB') },
    { title: { en: 'AI Assistant', bn: 'AI সহায়ক' }, sub: { en: 'Ask in Bangla', bn: 'বাংলায় জিজ্ঞেস করুন' }, badge: { en: 'New', bn: 'নতুন' }, grad: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', vehicle: 'chatbot', palette: ['#ffffff', '#ef4444', '#fbbf24'], icon: <Sparkles className="w-5 h-5" />, action: () => onNavigate('AI_ASSISTANT') },
  ];

  return (
    <div className="pb-28 md:pb-8">
      <div className="mb-6 md:mb-8">
        <SectionHeader title={lbl('How are you traveling?', 'কী খুঁজছেন?')} />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 md:gap-3">
          {modeTiles.map((tile) => (
            <button
              key={tile.title.en}
              type="button"
              onClick={tile.action}
              className="relative overflow-hidden rounded-[18px] p-4 text-left text-white min-h-[180px] flex flex-col gap-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.5),0_18px_50px_-20px_rgba(0,245,255,0.25)] border border-kj-line/30 hover:brightness-105 transition-all"
              style={{ background: tile.grad }}
            >
              <div className="absolute -right-8 -top-8 w-[110px] h-[110px] rounded-full bg-white/18 pointer-events-none kj-anim-pulse" />
              <div className="relative flex items-center justify-between">
                <div className="w-[38px] h-[38px] rounded-xl bg-white/18 backdrop-blur-sm flex items-center justify-center">{tile.icon}</div>
                {tile.badge && (
                  <span className="bg-black/25 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                    {lbl(tile.badge.en, tile.badge.bn)}
                  </span>
                )}
              </div>
              <div className="relative">
                <p className="font-bengali font-bold text-base leading-tight">{lbl(tile.title.en, tile.title.bn)}</p>
                <p className="text-white/80 text-xs mt-0.5">{lbl(tile.sub.en, tile.sub.bn)}</p>
              </div>
              <div className="absolute left-0 right-0 bottom-[-10px] h-[86px] pointer-events-none overflow-hidden">
                <MiniVehicle kind={tile.vehicle} palette={tile.palette} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ad slot — after mode tiles */}
      <div className="mb-6 md:mb-8 flex justify-center">
        <SponsoredAdSlot language={language} size="728x90" compact />
      </div>

      {/* How KoyJabo helps — 4-scene story animation (replaced Metro Live) */}
      <div className="mb-6 md:mb-8">
        <SectionHeader
          title={lbl('How KoyJabo helps', 'কই যাবো কীভাবে সাহায্য করে')}
          action={lbl('Try it now', 'এখনি চেষ্টা করুন')}
          onAction={() => onNavigate('LOCAL_BUS_HUB')}
        />
        <KoyJaboStory language={language} onNavigate={onNavigate} isDarkMode={isDarkMode} />
      </div>

      {/* Ad slot — after story, before saved routes */}
      <div className="mb-6 md:mb-8 flex justify-center">
        <SponsoredAdSlot language={language} size="728x90" compact />
      </div>

      {/* OLD Metro Live — now moved to Metro Hub page */}
      <div className="mb-6 md:mb-8 hidden">
        <SectionHeader title={lbl('Metro · Live', 'মেট্রো · লাইভ')} action={lbl('See all stations', 'সব স্টেশন দেখুন')} onAction={() => onNavigate('METRO_HUB')} />
        <div className="rounded-[22px] p-5 md:p-[22px] text-[#e9f3ed] relative overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.5),0_18px_50px_-20px_rgba(0,245,255,0.25)]" style={{ background: isDarkMode ? '#000814' : '#001b2e' }}>
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_80%_-20%,rgba(0,245,255,0.6)_0%,transparent_60%)]" />
          <div className="relative flex items-center gap-3 mb-4">
            <div className="w-[42px] h-[42px] rounded-xl bg-kj-primary text-white flex items-center justify-center font-extrabold text-[13px] tracking-wide shrink-0">M6</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold tracking-[1.3px] text-[#7fb89c] uppercase">{lbl('Live · MRT Line 6', 'লাইভ · মেট্রো রেল')}</div>
              <div className="font-bengali font-bold text-[17px] text-white mt-0.5">{lbl('Uttara North → Motijheel', 'উত্তরা উত্তর → মতিঝিল')}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-[#7fb89c] font-semibold">{lbl('Next train', 'পরবর্তী ট্রেন')}</div>
              <div className="text-[22px] font-extrabold text-white tracking-tight">{lbl('2 min', '২ মিনিট')}</div>
            </div>
          </div>

          <div className="relative pt-3.5 pb-1 overflow-x-auto no-scrollbar">
            <div className="absolute left-2 right-2 top-[18px] h-[3px] rounded-full bg-gradient-to-r from-emerald-500 from-60% to-white/15 to-60%" />
            <div className="flex justify-between relative min-w-[640px] md:min-w-0">
              {metroStops.map((s, i) => {
                const passed = i < METRO_CURRENT_IDX;
                const current = i === METRO_CURRENT_IDX;
                return (
                  <div key={s.en} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <div className={`rounded-full shrink-0 ${current ? 'w-4 h-4 bg-white border-[3px] border-kj-primary shadow-[0_0_0_6px_rgba(0,245,255,0.2)] -mt-0.5' : passed ? 'w-2.5 h-2.5 bg-kj-primary mt-0.5' : 'w-2.5 h-2.5 bg-white/15 mt-0.5'}`} />
                    <div className={`font-bengali text-[10px] text-center truncate max-w-[60px] ${current ? 'font-bold text-white' : passed ? 'text-white/55 font-medium' : 'text-white/40 font-medium'}`}>
                      {lbl(s.en, s.bn)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex flex-wrap gap-4 mt-3.5 text-xs text-white/70">
            <span><span className="text-white font-bold">৳ ২০-১০০</span> · {lbl('Fare', 'ভাড়া')}</span>
            <span><span className="text-white font-bold">৭:১০ AM – ৯:৪০ PM</span> · {lbl('Operating', 'চলমান')}</span>
            <span className="text-[#7fb89c]">● {lbl('On time, no delays', 'কোনো বিলম্ব নেই')}</span>
          </div>
        </div>
      </div>
      {/* end hidden old Metro Live */}

      <div className="mb-6 md:mb-8">
        <SectionHeader
          title={favoriteBuses.length > 0
            ? lbl('Your saved routes', 'আপনার সেভ করা রুট')
            : lbl('Saved buses', 'সেভ করা বাস')}
          action={favoriteBuses.length > 0 ? lbl('View all', 'সব দেখুন') : undefined}
        />
        {favoriteBuses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {favoriteBuses.map((bus) => {
              const colors = ['var(--kj-primary)', 'var(--kj-accent)', 'var(--kj-amber)', 'var(--kj-primary-deep)'];
              const idx = favoriteBuses.indexOf(bus) % colors.length;
              return (
                <div key={bus.id} className="dc-card rounded-2xl p-3.5 flex flex-col gap-2 cursor-pointer hover:border-kj-primary/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded shrink-0" style={{ background: bus.color || colors[idx] }} />
                    <span className="text-[10px] font-bold text-kj-text-faint uppercase tracking-wider truncate">{bus.bnName || bus.name}</span>
                  </div>
                  <p className="font-bengali font-bold text-sm text-kj-text leading-snug truncate">
                    {language === 'bn' ? (bus.bnName || bus.name) : bus.name}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-kj-text-faint">
                    <Heart className="w-3 h-3 fill-pink-500 text-pink-500 shrink-0" />
                    <span className="truncate">{bus.stops.length} {lbl('stops', 'স্টপ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dc-card rounded-2xl p-6 text-center">
            <Heart className="w-8 h-8 text-kj-text-faint mx-auto mb-2" />
            <p className="font-bengali text-sm text-kj-text-dim">{lbl('No saved routes yet. Tap ❤ on any bus to save it here.', 'এখনো কোনো রুট সেভ হয়নি। যেকোনো বাসে ❤ চাপলে এখানে সেভ হবে।')}</p>
          </div>
        )}
      </div>

      {/* Ad slot — before trending routes */}
      <div className="mb-6 md:mb-8 flex justify-center">
        <SponsoredAdSlot language={language} size="728x90" compact />
      </div>

      {/* Trending + AI sidebar grid (desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 md:gap-8 mb-6 md:mb-8">
        <div>
          <SectionHeader
            title={lbl('Trending routes today', 'ট্রেন্ডিং রুট আজ')}
            action={lbl('View all', 'সব দেখুন')}
            onAction={() => onNavigate('LOCAL_BUS_HUB')}
          />
          <div className="flex flex-col gap-2">
            {trendingBuses.length === 0 ? (
              <div className="dc-card rounded-xl p-5 text-center">
                <Bus className="w-8 h-8 text-kj-text-faint mx-auto mb-2 opacity-40" />
                <p className="font-bengali text-sm text-kj-text-dim">
                  {lbl('No trending data yet. Search for buses to build your trends.', 'এখনো কোনো ট্রেন্ডিং ডেটা নেই। বাস খুঁজলে ট্রেন্ড তৈরি হবে।')}
                </p>
              </div>
            ) : trendingBuses.map(({ bus, count }) => {
              const initials = bus.name.slice(0, 2).toUpperCase();
              return (
                <div key={bus.id} className="dc-card rounded-[14px] p-3.5 md:p-4 flex items-center gap-3.5 cursor-pointer hover:border-kj-primary/30 transition-colors">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 text-white font-bold text-xs"
                    style={{ background: bus.color ? `linear-gradient(135deg, ${bus.color}, #0070ad)` : 'linear-gradient(135deg, #006a4e, #10b981)' }}
                  >{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bengali font-bold text-[15px] text-kj-text truncate">{language === 'bn' ? (bus.bnName || bus.name) : bus.name}</p>
                      {bus.type === 'AC' && <span className="bg-kj-primary-soft text-kj-primary-deep text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0">AC</span>}
                      {count > 0 && <span className="bg-kj-amber-soft text-kj-amber text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">{count}× {lbl('today', 'আজ')}</span>}
                    </div>
                    <p className="text-kj-text-dim text-xs truncate mt-0.5">{bus.stops.length} {lbl('stops', 'স্টপ')} · {bus.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <ArrowRight className="w-4 h-4 text-kj-text-faint" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div
            onClick={() => onNavigate('AI_ASSISTANT')}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('AI_ASSISTANT')}
            role="button"
            tabIndex={0}
            className="rounded-[20px] p-5 text-white relative overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.6),0_30px_90px_-25px_rgba(162,89,255,0.35)]"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 52%, #4338ca 100%)' }}
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/8" />
            <div className="absolute right-8 -bottom-10 w-30 h-30 rounded-full bg-white/5" />
            <div className="relative flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-[10px] bg-white/15 backdrop-blur-sm flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase opacity-85">{lbl('AI Assistant', 'AI সহায়ক')}</span>
              <span className="bg-white/20 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">Beta</span>
            </div>
            <p className="relative font-bengali font-bold text-lg md:text-[22px] leading-snug mb-2.5 max-w-md">
              {lbl('Ask in Bangla or English — "Which bus goes from Gulshan to Motijheel?"', 'বাংলায় জিজ্ঞেস করুন — "কোন বাস গুলশান থেকে মতিঝিল যায়?"')}
            </p>
            <div className="relative flex flex-wrap gap-1.5 mb-3.5">
              {[
                { en: "How much to Cox's Bazar?", bn: 'কক্সবাজার যেতে কত খরচ?' },
                { en: 'Airport → Farmgate', bn: 'বিমানবন্দর থেকে ফার্মগেট' },
                { en: 'Sadarghat launch times', bn: 'সদরঘাট লঞ্চ সময়সূচী' },
              ].map((q) => (
                <span key={q.en} className="px-2.5 py-1.5 rounded-full bg-white/12 border border-white/15 font-bengali text-[11.5px]">{lbl(q.en, q.bn)}</span>
              ))}
            </div>
            <div className="relative bg-black/20 rounded-[14px] px-3.5 py-2.5 flex items-center gap-2.5 border border-white/10">
              <Bot className="w-4 h-4 shrink-0 opacity-80" />
              <span className="flex-1 font-bengali text-sm opacity-70">{lbl('Type your question...', 'আপনার প্রশ্ন লিখুন...')}</span>
              <button type="button" className="w-8 h-8 rounded-lg bg-white text-[#5b21b6] flex items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <SponsoredAdSlot language={language} size="300x250" />
          </div>

          <div className="dc-card rounded-[20px] p-[18px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-[10px] bg-kj-accent-soft text-kj-accent flex items-center justify-center shrink-0">
                <Zap className="w-[18px] h-[18px]" />
              </div>
              <div>
                <h2 className="font-bengali font-bold text-[15px] text-kj-text">{lbl('Emergency help', 'জরুরি সহায়তা')}</h2>
                <p className="text-xs text-kj-text-dim">{lbl('80+ verified contacts', '৮০+ যাচাইকৃত নম্বর')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: { en: 'Police', bn: 'পুলিশ' }, num: '999', tone: 'accent' as const },
                { label: { en: 'Ambulance', bn: 'অ্যাম্বুলেন্স' }, num: '199', tone: 'accent' as const },
                { label: { en: 'Fire service', bn: 'ফায়ার' }, num: '102', tone: 'amber' as const },
                { label: { en: 'Highway', bn: 'হাইওয়ে' }, num: '+880-2', tone: 'primary' as const },
              ].map((e) => (
                <button key={e.num} type="button" onClick={onEmergency} className="bg-kj-panel-muted border border-kj-line rounded-xl px-3 py-2.5 text-left hover:border-kj-primary/30 transition-colors">
                  <p className="font-bengali font-semibold text-xs text-kj-text">{lbl(e.label.en, e.label.bn)}</p>
                  <p className={`text-[15px] font-extrabold tracking-tight ${e.tone === 'accent' ? 'text-kj-accent' : e.tone === 'amber' ? 'text-kj-amber' : 'text-kj-primary'}`}>{e.num}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// ── KoyJabo Story — "How KoyJabo helps" animated 4-scene section ──────────────
const KoyJaboStory: React.FC<{ language: 'en' | 'bn'; onNavigate: (v: string) => void; isDarkMode: boolean }> = ({ language, onNavigate, isDarkMode }) => {
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setScene(s => (s + 1) % 4), 3600);
    return () => clearInterval(id);
  }, []);

  const captions = [
    { bn: 'লোকাল বাসস্ট্যান্ডে — কোন বাসে উঠবো? সব তো একরকম! 😕', en: 'At the bus stand — which bus do I take? They all look the same! 😕' },
    { bn: 'ফোনে koyjabo.com খুলে গন্তব্য লিখুন', en: 'Open koyjabo.com and type your destination' },
    { bn: 'সঠিক বাস, ভাড়া আর সময় — সাথে সাথে ✅', en: 'The right bus, fare & time — instantly ✅' },
    { bn: 'নিশ্চিন্তে সঠিক বাসে উঠে যাত্রা শুরু! 🎉', en: 'Hop on the right bus, stress-free! 🎉' },
  ];

  const sceneContent = () => {
    if (scene === 0) return (
      <>
        <div className="absolute right-[9%] bottom-14 flex flex-col items-center">
          <div className="bg-kj-primary text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md">🚏 BUS</div>
          <div className="w-1 h-11 bg-[#9aa3b2]" />
        </div>
        <div className="absolute left-[11%] bottom-12 flex flex-col items-center">
          <div className="animate-[kjFloatY_2.2s_ease-in-out_infinite] bg-white rounded-xl px-2.5 py-1.5 shadow-lg font-black text-base text-[#0a1626] mb-1.5">🤔 ?</div>
          <span className="text-4xl">🧑</span>
        </div>
        <div className="absolute bottom-4 left-0 animate-[kjDriveBy_3.4s_linear]">
          <div className="text-5xl">🚌</div>
        </div>
        <div className="absolute bottom-3 left-0 animate-[kjDriveBy_3.4s_linear_1.6s_both]">
          <div className="text-5xl opacity-70">🚌</div>
        </div>
      </>
    );
    if (scene === 1) return (
      <>
        <div className="absolute left-[8%] bottom-12"><span className="text-4xl">🧑</span></div>
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 animate-[kjPopIn_.55s_cubic-bezier(.2,.8,.3,1)_both]">
          <div className="bg-white rounded-2xl p-3 shadow-xl border border-gray-100 w-36">
            <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 text-[9px] text-gray-500 mb-2 border">🔒 koyjabo.com</div>
            <div className="font-bold text-[12px] text-[#0a1626] mb-2">কই যাবো</div>
            <div className="border rounded-lg overflow-hidden text-[10px]">
              <div className="px-2 py-1.5 border-b flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-kj-primary shrink-0"/><span className="text-[#0a1626]">Gulshan 1</span></div>
              <div className="px-2 py-1.5 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-kj-accent shrink-0"/><span className="text-[#0a1626]">Motijheel</span></div>
            </div>
            <div className="mt-2 bg-gradient-to-br from-kj-primary to-kj-primary-deep text-white text-[11px] font-bold rounded-lg py-1.5 text-center animate-[kjBobY_1.4s_ease-in-out_infinite]">🔍 Find bus</div>
          </div>
        </div>
      </>
    );
    if (scene === 2) return (
      <>
        <div className="absolute right-[9%] bottom-12"><span className="text-4xl">🧑</span></div>
        <div className="absolute left-[8%] top-1/2 -translate-y-1/2 animate-[kjPopIn_.5s_cubic-bezier(.2,.8,.3,1)_both]">
          <div className="bg-white rounded-2xl p-3 shadow-xl border border-gray-100 w-36">
            <div className="text-[10px] font-bold text-gray-500 mb-2">Gulshan → Motijheel · 3</div>
            {[{l:'GL',n:'Green Line · 6',m:'৳60 · 42m',c:'#10b981',hi:true},{l:'HF',n:'Hanif',m:'৳35 · 58m',c:'#9aa3b2'},{l:'BR',n:'BRTC',m:'৳45 · 52m',c:'#9aa3b2'}].map((r,i)=>(
              <div key={i} className={`flex items-center gap-1.5 p-1.5 rounded-lg border mb-1.5 ${r.hi ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200 opacity-60'}`}>
                <span className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-black shrink-0" style={{background:r.c}}>{r.l}</span>
                <span className="flex-1 min-w-0"><span className="block text-[10px] font-bold text-[#0a1626]">{r.n}</span><span className="text-[9px] text-gray-500">{r.m}</span></span>
                {r.hi && <span className="text-green-500 font-bold text-xs">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </>
    );
    return (
      <>
        {[['18%',40,0],['78%',80,0.5],['60%',30,1],['30%',70,0.8]].map((s,i)=>(
          <span key={i} className="absolute text-xl animate-[kjSpark_1.6s_ease-in-out_infinite]" style={{left:s[0] as string, bottom:s[1] as number, animationDelay:`${s[2]}s`}}>✨</span>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-[kjRollIn_1s_cubic-bezier(.2,.8,.3,1)_both] flex items-end gap-1">
          <span className="text-5xl">🚌</span>
          <div className="bg-kj-primary text-white text-[10px] font-black px-2 py-0.5 rounded-lg mb-1">Motijheel ✓</div>
        </div>
        <div className="absolute bottom-10 left-1/2 translate-x-4 animate-[kjBobY_1.2s_ease-in-out_infinite]"><span className="text-3xl">🧑</span></div>
      </>
    );
  };

  return (
    <div className="rounded-[22px] overflow-hidden border border-kj-line shadow-kj">
      {/* Stage */}
      <div className="relative h-[220px] overflow-hidden" style={{ background: 'linear-gradient(180deg,#bfe6ff 0%, #e6f5ff 58%, #b9e3c6 58%, #a3d6b2 100%)' }}>
        <div className="absolute top-4 right-6 w-10 h-10 rounded-full" style={{ background: 'radial-gradient(circle,#fff4c2,#ffd34d)', boxShadow: '0 0 30px rgba(255,211,77,0.6)' }} />
        <div className="absolute top-7 left-[20%] w-14 h-4 rounded-full bg-white/85" />
        <div className="absolute top-12 left-[46%] w-10 h-3 rounded-full bg-white/70" />
        <div className="absolute left-0 right-0 bottom-0 h-12" style={{ background: 'linear-gradient(180deg,#5b6472,#4a525e)' }}>
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#ffd34d 0 20px,transparent 20px 40px)' }} />
        </div>
        <div key={scene} className="kj-story-scene absolute inset-0">{sceneContent()}</div>
        <div className="absolute top-2.5 left-2.5 text-white text-[10px] font-black tracking-wide px-2.5 py-1 rounded-full backdrop-blur-md" style={{ background: 'rgba(10,22,38,0.55)', letterSpacing: 1 }}>
          {lbl('HOW KOYJABO WORKS', 'কই যাবো কীভাবে কাজ করে')} · {scene + 1}/4
        </div>
      </div>
      {/* Caption bar */}
      <div className="p-4" style={{ background: isDarkMode ? '#000814' : '#001b2e' }}>
        <div className="flex gap-1.5 mb-2.5">
          {[0,1,2,3].map(i => (
            <div key={i} className="flex-1 h-1 rounded-full transition-colors duration-300" style={{ background: i <= scene ? '#10b981' : 'rgba(255,255,255,0.18)' }} />
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bengali font-semibold text-sm text-white leading-snug flex-1 min-w-[200px]">{lbl(captions[scene].en, captions[scene].bn)}</span>
          <button type="button" onClick={() => onNavigate('LOCAL_BUS_HUB')} className="bg-kj-primary text-kj-primary-ink font-bold text-xs px-4 py-2 rounded-full whitespace-nowrap hover:brightness-105 transition-all shrink-0">
            {lbl('Try it now', 'এখনি চেষ্টা করুন')} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeRightPanel;
