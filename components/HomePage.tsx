import React from 'react';
import { Bus, Heart } from 'lucide-react';
import HomeSearchPanel, { HomeSearchPanelProps } from './HomeSearchPanel';
import HomeRightPanel from './HomeRightPanel';
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

const HomePage: React.FC<HomePageProps> = (props) => {
  const {
    language, t, filteredBuses, busRatingsMap, listFilter, selectedBus,
    searchMode, fromStation, toStation, searchQuery, favorites,
    onBusSelect, onToggleFavorite, onFilterChange, onNavigate, onIntercity,
    onEmergency, isDarkMode, isInDhaka, user, getStationSlug, formatBusName, formatNumber,
    scrollContainerRef, ...searchProps
  } = props;

  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const hasSearch = Boolean(searchQuery || (searchMode === 'ROUTE' && fromStation && toStation));

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden">
      {/* Desktop + mobile: unified home shell */}
      <div className="flex flex-1 min-h-0 w-full md:gap-4 overflow-hidden">
        {/* Left: search card + results */}
        <div className={`flex flex-col min-h-0 shrink-0 w-full md:w-[420px] md:max-w-[420px] ${hasSearch ? 'md:overflow-hidden' : 'md:overflow-y-auto'} md:py-3 md:pl-0 md:pr-0`}>
          <div className="md:sticky md:top-0 z-20 px-4 pt-3 md:px-0 md:pt-0">
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

          {hasSearch && (
            <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 md:px-0 pb-4 mt-3">
              <div className="dc-card kj-glass rounded-[20px] p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-kj-text text-sm">{listFilter === 'FAVORITES' ? t('home.savedRoutes') : t('home.allBuses')}</h3>
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
        </div>

        {/* Right: feed (desktop always, mobile when not searching) */}
        <div className={`flex-1 min-h-0 overflow-y-auto ${hasSearch ? 'hidden md:block' : 'block'}`}>
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
