import React from 'react';
import { Bus, Heart, Wifi } from 'lucide-react';
import HomeSearchPanel, { HomeSearchPanelProps } from './HomeSearchPanel';
import HomeRightPanel from './HomeRightPanel';
import TravelHeroScene from './design/Vehicles3D';
import GlobalFooter from './GlobalFooter';
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

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-y-auto">
      <div className="flex-1 w-full px-4 md:px-10 py-5 md:py-8">
        {/* Hero grid — design layout */}
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
                {lbl(
                  '2,400+ Dhaka bus routes, Metro Rail and intercity travel across all 64 districts — works offline too.',
                  '২,৪০০+ ঢাকা লোকাল বাস, মেট্রো রেল ও বাংলাদেশের ৬৪ জেলার সব রুট — অফলাইনেও কাজ করে।'
                )}
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

        {/* Search results */}
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

        {/* Feed sections — hidden on mobile while searching */}
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

        <GlobalFooter setView={(v) => onNavigate(v)} />
      </div>
    </div>
  );
};

export default HomePage;
