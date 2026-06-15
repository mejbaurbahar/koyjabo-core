import React from 'react';
import { Bus, Heart, Wifi } from 'lucide-react';
import HomeSearchPanel, { HomeSearchPanelProps } from './HomeSearchPanel';
import HomeRightPanel from './HomeRightPanel';
import TravelHeroScene from './design/Vehicles3D';
import SponsoredAdSlot from './SponsoredAdSlot';
import { BusRoute } from '../types';

interface HomePageProps extends Omit<HomeSearchPanelProps, 'onSuggestionSelect'> {
  isDarkMode: boolean;
  isInDhaka: boolean;
  favorites: string[];
  filteredBuses: BusRoute[];
  busRatingsMap: Record<string, { averageRating?: number; recommendPercent?: number } | null>;
  listFilter: 'ALL' | 'FAVORITES';
  selectedBus: BusRoute | null;
  searchQuery: string;
  onNavigate: (view: string) => void;
  onIntercity: () => void;
  onEmergency: () => void;
  onBusSelect: (bus: BusRoute) => void;
  onToggleFavorite: (e: React.MouseEvent, busId: string) => void;
  onFilterChange: (filter: 'ALL' | 'FAVORITES') => void;
  onSuggestionSelect: (suggestion: Parameters<HomeSearchPanelProps['onSuggestionSelect']>[0]) => void;
  getStationSlug: (id: string) => string;
}

const PWABanner: React.FC<{ language: 'en' | 'bn'; onInstall: () => void }> = ({ language, onInstall }) => {
  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    setShow(!window.matchMedia('(display-mode: standalone)').matches);
  }, []);
  if (!show) return null;
  return (
    <div className="dc-card kj-glass rounded-[18px] p-4 flex items-center gap-3.5 border border-kj-line">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-kj-primary to-kj-primary-deep text-white flex items-center justify-center shrink-0 kj-anim-glow">
        <Wifi className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bengali font-bold text-[15px] text-kj-text leading-snug">{lbl('No internet? No problem.', 'নেট নেই? সমস্যা নেই।')}</p>
        <p className="text-kj-text-dim text-xs mt-0.5 leading-relaxed">{lbl('Install as PWA · every route works offline', 'PWA ইনস্টল করুন · সব রুট অফলাইনে কাজ করে')}</p>
      </div>
      <button type="button" onClick={onInstall} className="shrink-0 bg-kj-text text-kj-bg text-xs font-semibold px-3.5 py-2 rounded-[10px] hover:opacity-90 transition-opacity">
        {lbl('Install', 'ইনস্টল')}
      </button>
    </div>
  );
};

const MODE_TILES = [
  {
    key: 'local-bus',
    grad: 'linear-gradient(135deg, #006a4e 0%, #10b981 100%)',
    icon: '🚌',
    titleEn: 'Local bus', titleBn: 'লোকাল বাস',
    subEn: '200+ routes', subBn: '২০০+ রুট',
    badgeEn: 'Popular', badgeBn: 'জনপ্রিয়',
    nav: 'LOCAL_BUS_HUB',
  },
  {
    key: 'metro',
    grad: 'linear-gradient(135deg, #00130e 0%, #00543c 100%)',
    icon: '🚇',
    titleEn: 'Metro Rail', titleBn: 'মেট্রো রেল',
    subEn: 'MRT-6 · 15 stations', subBn: 'MRT-6 · ১৫ স্টেশন',
    badgeEn: '', badgeBn: '',
    nav: 'METRO_HUB',
  },
  {
    key: 'train',
    grad: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
    icon: '🚆',
    titleEn: 'Train', titleBn: 'ট্রেন',
    subEn: 'BD Railway · all routes', subBn: 'BD রেলওয়ে · সব রুট',
    badgeEn: '', badgeBn: '',
    nav: 'TRAIN_LIST',
  },
  {
    key: 'intercity',
    grad: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
    icon: '🚌',
    titleEn: 'Intercity', titleBn: 'আন্তঃজেলা',
    subEn: '64 districts', subBn: '৬৪ জেলা',
    badgeEn: '', badgeBn: '',
    nav: 'INTERCITY',
  },
  {
    key: 'launch',
    grad: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)',
    icon: '⛴',
    titleEn: 'Launch & Steamer', titleBn: 'লঞ্চ ও স্টিমার',
    subEn: 'Sadarghat → Barisal', subBn: 'সদরঘাট → বরিশাল',
    badgeEn: '', badgeBn: '',
    nav: 'LAUNCH_HUB',
  },
  {
    key: 'ai',
    grad: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    icon: '✨',
    titleEn: 'AI Assistant', titleBn: 'AI সহায়ক',
    subEn: 'Ask in Bangla', subBn: 'বাংলায় জিজ্ঞেস করুন',
    badgeEn: 'New', badgeBn: 'নতুন',
    nav: 'AI_ASSISTANT',
  },
];

const HomePage: React.FC<HomePageProps> = (props) => {
  const {
    language, t, user, isInDhaka, filteredBuses, busRatingsMap, listFilter, selectedBus,
    searchMode, fromStation, toStation, searchQuery, favorites,
    onBusSelect, onToggleFavorite, onFilterChange, onNavigate, onIntercity,
    onEmergency, isDarkMode, getStationSlug, formatBusName, formatNumber,
    scrollContainerRef, ...searchProps
  } = props;

  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const hasSearch = Boolean(searchQuery || (searchMode === 'ROUTE' && fromStation && toStation));

  const greeting = user
    ? lbl(`Where are you headed, ${user.displayName?.split(' ')[0] || 'friend'}?`, `কোথায় যেতে চান, ${user.displayName?.split(' ')[0] || ''}?`)
    : (isInDhaka ? t('home.whereToGo') : t('home.whereToGoInDhaka'));

  const greetingSub = lbl(
    '2,400+ Dhaka bus routes, Metro Rail and intercity travel across all 64 districts — works offline too.',
    '২,৪০০+ ঢাকা লোকাল বাস, মেট্রো রেল ও বাংলাদেশের ৬৪ জেলার সব রুট — অফলাইনেও কাজ করে।'
  );

  return (
    <div className="w-full">
      <div className="w-full px-4 md:px-10 py-5 md:py-8">

        {/* ── Hero section ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] gap-5 md:gap-8 mb-6 md:mb-8 items-stretch">
          <div className="flex flex-col gap-4 md:gap-[18px]">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-kj-accent animate-[kjpulse_1.5s_ease-in-out_infinite]" />
                <span className="text-[11px] font-bold text-kj-text-faint tracking-[1.4px] uppercase">
                  {isInDhaka
                    ? lbl('Dhaka · 31°C · Moderate traffic', 'ঢাকা · ৩১°C · জ্যাম মাঝারি')
                    : lbl('Bangladesh', 'বাংলাদেশ')}
                </span>
              </div>
              <h1 className="font-bengali font-bold text-kj-text text-[26px] md:text-[38px] leading-[1.15] tracking-tight text-balance">
                {greeting}
              </h1>
              <p className="font-bengali text-kj-text-dim text-sm md:text-[15px] mt-2 leading-relaxed max-w-xl text-pretty">
                {greetingSub}
              </p>
            </div>
            <HomeSearchPanel
              {...searchProps}
              language={language}
              t={t}
              user={user}
              isInDhaka={isInDhaka}
              searchMode={searchMode}
              searchQuery={searchQuery}
              fromStation={fromStation}
              toStation={toStation}
              scrollContainerRef={scrollContainerRef}
              formatBusName={formatBusName}
              formatNumber={formatNumber}
            />
          </div>

          <div className="hidden md:flex flex-col gap-3.5">
            <TravelHeroScene isDarkMode={isDarkMode} height={300} />
            <PWABanner language={language} onInstall={() => onNavigate('INSTALL_APP')} />
          </div>
        </div>

        {/* Mobile hero scene */}
        <div className="md:hidden mb-5">
          <TravelHeroScene isDarkMode={isDarkMode} height={200} />
        </div>

        {/* ── Ad slot (hero) ────────────────────────────────────────── */}
        <div className="flex justify-center mb-6 md:mb-8">
          <SponsoredAdSlot language={language} size="728x90" compact />
        </div>

        {/* ── How are you traveling? — mode tiles ──────────────────── */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-bengali font-bold text-lg text-kj-text tracking-tight">
              {lbl('How are you traveling?', 'কীভাবে যাবেন?')}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 md:gap-3">
            {MODE_TILES.map((tile) => (
              <button
                key={tile.key}
                type="button"
                onClick={() => tile.key === 'intercity' ? onIntercity() : onNavigate(tile.nav)}
                className="relative overflow-hidden rounded-[20px] p-4 text-left text-white min-h-[130px] md:min-h-[160px] flex flex-col gap-2 border border-white/10 hover:brightness-110 active:scale-[0.97] transition-all shadow-[0_2px_4px_rgba(0,0,0,0.4),0_12px_36px_-16px_rgba(0,245,255,0.2)]"
                style={{ background: tile.grad }}
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="relative flex items-center justify-between">
                  <span className="text-[23px] leading-none">{tile.icon}</span>
                  {tile.badgeEn && (
                    <span className="bg-black/25 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                      {lbl(tile.badgeEn, tile.badgeBn)}
                    </span>
                  )}
                </div>
                <div className="relative mt-auto">
                  <p className="font-bengali font-bold text-[13px] md:text-sm leading-tight">{lbl(tile.titleEn, tile.titleBn)}</p>
                  <p className="text-white/75 text-[11px] mt-0.5 leading-snug">{lbl(tile.subEn, tile.subBn)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Ad slot (second) ─────────────────────────────────────── */}
        <div className="flex justify-center mb-6 md:mb-8">
          <SponsoredAdSlot language={language} size="728x90" compact />
        </div>

        {/* ── Search results ────────────────────────────────────────── */}
        {hasSearch && (
          <div ref={scrollContainerRef} className="mb-6 md:mb-8">
            <div className="dc-card kj-glass rounded-[20px] p-3 md:p-4 border border-kj-line">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bengali font-bold text-kj-text text-sm">{listFilter === 'FAVORITES' ? t('home.savedRoutes') : t('home.allBuses')}</h3>
                <span className="text-[10px] bg-kj-chip-bg px-2 py-0.5 rounded-full text-kj-text-dim font-bold">{formatNumber(filteredBuses.length)}</span>
              </div>
              <div className="flex p-1 bg-kj-chip-bg rounded-xl border border-kj-line mb-3">
                <button type="button" onClick={() => onFilterChange('ALL')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${listFilter === 'ALL' ? 'bg-kj-panel text-kj-text shadow-sm' : 'text-kj-text-dim'}`}>{t('home.allDhakaLocalBuses')}</button>
                <button type="button" onClick={() => onFilterChange('FAVORITES')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${listFilter === 'FAVORITES' ? 'bg-kj-panel text-kj-accent shadow-sm' : 'text-kj-text-dim'}`}>
                  <Heart className="w-4 h-4 fill-current" /> {t('home.favorites')}
                </button>
              </div>
              {filteredBuses.slice(0, 30).map((bus) => {
                const isFav = favorites.includes(bus.id);
                const rating = busRatingsMap[bus.id];
                const hasRating = rating != null;
                return (
                  <button key={bus.id} type="button" onClick={() => onBusSelect(bus)}
                    className={`w-full text-left dc-card rounded-2xl p-3 mb-2 flex items-center gap-3 transition-all ${selectedBus?.id === bus.id ? 'ring-1 ring-kj-primary border-kj-primary' : 'hover:border-kj-primary/30'}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ background: `linear-gradient(135deg, ${bus.color || '#00f5ff'}, #0070ad)` }}>
                      {(formatBusName(bus.name) || 'B').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold text-kj-text text-sm truncate">{formatBusName(bus.name)}</p>
                      <p className="text-xs text-kj-text-dim truncate">
                        {bus.stops.length > 0 ? `${getStationSlug(bus.stops[0])} → ${getStationSlug(bus.stops[bus.stops.length - 1])}` : ''}
                      </p>
                      {hasRating && <p className="text-[10px] text-kj-primary mt-0.5">★ {formatNumber((rating?.averageRating ?? 0).toFixed(1))}</p>}
                    </div>
                    <button type="button" onClick={(e) => onToggleFavorite(e, bus.id)} className="p-1 shrink-0">
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-pink-500 text-pink-500' : 'text-kj-text-faint'}`} />
                    </button>
                  </button>
                );
              })}
              {filteredBuses.length === 0 && (
                <div className="text-center py-10 text-kj-text-faint">
                  <Bus className="w-10 h-10 opacity-30 mx-auto mb-2" />
                  <p className="text-sm">{searchMode === 'ROUTE' ? t('home.noBusesBetweenStations') : `${t('home.noBusesMatching')} "${searchQuery}"`}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Feed sections — hidden on mobile while searching ──────── */}
        <div className={hasSearch ? 'hidden md:block' : 'block'}>
          <HomeRightPanel
            language={language}
            isDarkMode={isDarkMode}
            onNavigate={onNavigate}
            onIntercity={onIntercity}
            onEmergency={onEmergency}
            favorites={favorites}
            isInDhaka={isInDhaka}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
