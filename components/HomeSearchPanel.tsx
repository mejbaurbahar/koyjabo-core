import React from 'react';
import { Search, X, ArrowRightLeft } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { AppView } from '../types';
import type { SearchSuggestion } from '../services/searchService';

interface StationOption {
  id: string;
  name: string;
  bnName?: string;
}

export interface HomeSearchPanelProps {
  language: 'en' | 'bn';
  t: (key: string) => string;
  user: { displayName: string } | null;
  isInDhaka: boolean;
  view: AppView;
  searchMode: 'TEXT' | 'ROUTE';
  setSearchMode: (m: 'TEXT' | 'ROUTE') => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  fromStation: string;
  setFromStation: (v: string) => void;
  toStation: string;
  setToStation: (v: string) => void;
  busRouteSort: 'DEFAULT' | 'FASTEST' | 'CHEAPEST';
  setBusRouteSort: (v: 'DEFAULT' | 'FASTEST' | 'CHEAPEST') => void;
  nonAcOnly: boolean;
  setNonAcOnly: (v: boolean) => void;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  searchSuggestions: SearchSuggestion[];
  isIntercityRedirecting: boolean;
  globalNearestStationName: string | null;
  stationOptions: StationOption[];
  setView: (v: AppView) => void;
  setSuggestedRoutes: (routes: []) => void;
  setSearchContext: (ctx: string | undefined) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onSearchCommit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onInputChange: (value: string) => void;
  onIntercityRedirect: (dest: string) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  formatBusName: (name: string) => string;
  formatNumber: (n: string | number) => string;
}

const HomeSearchPanel: React.FC<HomeSearchPanelProps> = (props) => {
  const {
    language, t, user, isInDhaka, view, searchMode, setSearchMode,
    inputValue, setInputValue, searchQuery, setSearchQuery,
    fromStation, setFromStation, toStation, setToStation,
    busRouteSort, setBusRouteSort, nonAcOnly, setNonAcOnly,
    showSuggestions, setShowSuggestions, searchSuggestions, isIntercityRedirecting,
    globalNearestStationName, stationOptions, setView, setSuggestedRoutes,
    setSearchContext, scrollContainerRef, onSearchCommit, onKeyDown, onInputChange,
    onIntercityRedirect, onSuggestionSelect, formatBusName, formatNumber,
  } = props;

  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const leaveTime = new Date().toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const modeChips = [
    { label: lbl('Local bus', 'লোকাল বাস'), active: searchMode === 'TEXT' || (searchMode === 'ROUTE' && view === AppView.HOME), onClick: () => { setSearchMode('TEXT'); setSuggestedRoutes([]); setBusRouteSort('DEFAULT'); } },
    { label: lbl('Metro', 'মেট্রো'), onClick: () => setView(AppView.METRO_HUB) },
    { label: lbl('Intercity', 'আন্তঃজেলা'), onClick: () => { localStorage.setItem('dhaka_commute_view', JSON.stringify(AppView.HOME)); window.location.href = '/intercity/'; } },
    { label: lbl('Train', 'ট্রেন'), onClick: () => setView(AppView.TRAIN_LIST) },
    { label: lbl('Launch', 'লঞ্চ'), onClick: () => setView(AppView.LAUNCH_HUB) },
  ];

  const quickIcons = [
    { icon: '🚌', action: () => setSearchMode('TEXT') },
    { icon: '🚇', action: () => setView(AppView.METRO_HUB) },
    { icon: '🚆', action: () => setView(AppView.TRAIN_LIST) },
    { icon: '✈️', action: () => { localStorage.setItem('dhaka_commute_view', JSON.stringify(AppView.HOME)); window.location.href = '/intercity/'; } },
    { icon: '📍', action: () => { if (globalNearestStationName) { setInputValue(globalNearestStationName); setSearchMode('TEXT'); } } },
  ];

  const handleFindRoute = () => {
    if (!fromStation || !toStation) return;
    setSearchQuery('');
    setInputValue('');
    setSearchMode('ROUTE');
    scrollContainerRef.current && (scrollContainerRef.current.scrollTop = 0);
  };

  return (
    <div className="dc-card kj-glass rounded-[24px] overflow-visible shrink-0">
      <div className="p-4 md:p-5">
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-kj-primary kj-live-dot relative shrink-0" />
            <span className="text-[10px] font-bold text-kj-text-faint tracking-[1.4px] uppercase">
              {isInDhaka
                ? lbl('Dhaka · 31°C · Moderate traffic', 'ঢাকা · ৩১°C · জ্যাম মাঝারি')
                : lbl('Bangladesh', 'বাংলাদেশ')}
            </span>
          </div>
          <h1 className="font-bengali font-bold text-kj-text text-[22px] md:text-[26px] leading-tight tracking-tight">
            {user
              ? lbl(`Where are you headed, ${user.displayName?.split(' ')[0] || 'friend'}?`, `কোথায় যেতে চান, ${user.displayName?.split(' ')[0] || ''}?`)
              : (isInDhaka ? t('home.whereToGo') : t('home.whereToGoInDhaka'))}
          </h1>
          <p className="text-kj-text-dim text-[12px] leading-relaxed mt-2">
            {lbl(
              '2,400+ Dhaka local buses, metro rail & routes across all 64 districts — works offline too.',
              '২,৪০০+ ঢাকা লোকাল বাস, মেট্রো রেল ও বাংলাদেশের ৬৪ জেলার সব রুট — অফলাইনেও কাজ করে।'
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {modeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onClick}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 border transition-all ${
                chip.active
                  ? 'bg-kj-primary text-kj-primary-ink border-kj-primary shadow-[0_0_14px_rgba(0,245,255,0.28)]'
                  : 'bg-kj-panel-muted text-kj-text-dim border-kj-line hover:border-kj-primary/40 hover:text-kj-text'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <p className="text-[10px] font-bold text-kj-text-faint tracking-[1.2px] uppercase mb-2">
          {lbl('Search anything', 'যেকোনো কিছু খুঁজুন')}
        </p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            {quickIcons.map((q) => (
              <button key={q.icon} type="button" onClick={q.action} className="w-7 h-7 rounded-lg bg-kj-chip-bg border border-kj-line flex items-center justify-center text-[13px] hover:border-kj-primary/50 transition-colors">
                {q.icon}
              </button>
            ))}
          </div>
          <kbd className="hidden sm:inline-flex h-6 px-2 rounded-md border border-kj-line bg-kj-panel-muted text-[10px] font-semibold text-kj-text-faint items-center">⌘ K</kbd>
        </div>

        <div className="relative mb-4 isolate z-50">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-kj-primary pointer-events-none" />
          <input
            type="text"
            placeholder={lbl('Search bus, train, stop, place, district...', 'বাস, ট্রেন, স্টপ বা স্থান লিখুন...')}
            className="w-full pl-9 pr-10 py-3 bg-kj-input-bg text-kj-text border border-kj-line rounded-xl focus:outline-none focus:ring-2 focus:ring-kj-primary/30 text-sm font-medium placeholder:text-kj-text-faint"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onInputChange(e.target.value);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => { if (searchSuggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {(inputValue || searchQuery) ? (
            <button type="button" onClick={() => { setInputValue(''); setSearchQuery(''); setSuggestedRoutes([]); setSearchContext(undefined); setShowSuggestions(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button type="button" onClick={onSearchCommit} disabled={isIntercityRedirecting}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-kj-primary-soft text-kj-primary">
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-kj-panel rounded-xl shadow-2xl max-h-72 overflow-y-auto z-[9999] border border-kj-line">
              {searchSuggestions.map((suggestion, idx) => (
                <div key={`${suggestion.type}-${suggestion.id}-${idx}`}
                  className="px-4 py-3 hover:bg-kj-primary-soft cursor-pointer border-b border-kj-line last:border-b-0"
                  onMouseDown={(e) => { e.preventDefault(); onSuggestionSelect(suggestion); }}>
                  <div className="font-semibold text-kj-text text-sm truncate">
                    {suggestion.type === 'bus' ? formatBusName(suggestion.name) : formatNumber(suggestion.name)}
                  </div>
                  {suggestion.bnName && <div className="text-xs text-kj-text-dim truncate">{suggestion.bnName}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-kj-panel-muted/80 border border-kj-line rounded-2xl p-3.5">
          <div className="text-[10px] font-bold text-kj-text-faint uppercase tracking-[1.2px] mb-3 flex items-center gap-1.5">
            <span className="w-1 h-3 rounded-full bg-kj-primary" />
            {lbl('Or · plan a route', 'অথবা · রুট প্ল্যান করুন')}
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-2.5 relative">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-2.5">
              <div className="relative">
                <p className="text-[10px] font-bold text-kj-text-faint uppercase tracking-wider mb-1">{lbl('From', 'কোথা থেকে')}</p>
                <SearchableSelect
                  placeholder={lbl('Gulshan 1', 'গুলশান ১')}
                  value={fromStation}
                  onChange={setFromStation}
                  options={stationOptions}
                />
                {globalNearestStationName && (
                  <p className="text-[10px] text-kj-text-faint mt-1">· {lbl('Current location', 'বর্তমান অবস্থান')}</p>
                )}
              </div>
              <div className="relative">
                <p className="text-[10px] font-bold text-kj-text-faint uppercase tracking-wider mb-1">{lbl('To', 'কোথায়')}</p>
                <SearchableSelect
                  placeholder={lbl('Motijheel', 'মতিঝিল')}
                  value={toStation}
                  onChange={setToStation}
                  options={stationOptions}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => { const tmp = fromStation; setFromStation(toStation); setToStation(tmp); }}
              className="hidden sm:flex absolute left-1/2 top-[calc(50%+6px)] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-kj-line bg-kj-panel items-center justify-center text-kj-text-dim z-10 hover:border-kj-primary/50"
              aria-label={lbl('Swap stations', 'স্টেশন অদলবদল')}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleFindRoute}
              disabled={!fromStation || !toStation}
              className="md:w-[108px] md:shrink-0 md:self-end h-[46px] md:h-[52px] bg-kj-primary text-kj-primary-ink font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(0,245,255,0.22)] hover:brightness-105 transition-all"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{lbl('Find routes', 'রুট খুঁজুন')}</span>
            </button>
          </div>

          {(fromStation || toStation) && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              {([
                ['DEFAULT', lbl(`Leave now · ${leaveTime}`, `এখনই · ${leaveTime}`)],
                ['FASTEST', lbl('Fastest', 'দ্রুততম')],
                ['CHEAPEST', lbl('Cheapest', 'সস্তা')],
              ] as const).map(([val, chipLbl]) => (
                <button key={val} type="button" onClick={() => setBusRouteSort(busRouteSort === val ? 'DEFAULT' : val)}
                  className={`h-7 px-2.5 rounded-full border text-[10px] font-medium ${busRouteSort === val ? 'bg-kj-primary text-kj-primary-ink border-kj-primary' : 'border-kj-line bg-kj-panel text-kj-text-dim'}`}>
                  {chipLbl}
                </button>
              ))}
              <button type="button" onClick={() => setNonAcOnly(!nonAcOnly)}
                className={`h-7 px-2.5 rounded-full border text-[10px] font-medium ${nonAcOnly ? 'bg-kj-primary text-kj-primary-ink border-kj-primary' : 'border-kj-line bg-kj-panel text-kj-text-dim'}`}>
                {lbl('Non-AC only', 'AC ছাড়া')}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-kj-primary animate-pulse" />
          <span className="text-[10px] font-bold text-kj-text-faint">
            {lbl('2,412 routes live', '২,৪১২ রুট লাইভ')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomeSearchPanel;
