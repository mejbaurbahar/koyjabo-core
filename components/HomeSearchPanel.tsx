import React from 'react';
import { Search, X, ArrowLeftRight, MapPin, Flag, Clock, Zap, Banknote } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { AppView } from '../types';
import type { SearchSuggestion } from '../services/searchService';

export type TransportSearchMode = 'LOCAL' | 'METRO' | 'INTERCITY' | 'TRAIN' | 'LAUNCH' | 'AIR';

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
  transportMode: TransportSearchMode;
  setTransportMode: (m: TransportSearchMode) => void;
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
  routeOptions: StationOption[];
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
    language, view, searchMode, setSearchMode, transportMode, setTransportMode,
    inputValue, setInputValue, searchQuery, setSearchQuery,
    fromStation, setFromStation, toStation, setToStation,
    busRouteSort, setBusRouteSort, nonAcOnly, setNonAcOnly,
    showSuggestions, setShowSuggestions, searchSuggestions, isIntercityRedirecting,
    globalNearestStationName, stationOptions, routeOptions, setView, setSuggestedRoutes,
    setSearchContext, scrollContainerRef, onSearchCommit, onKeyDown, onInputChange,
    onSuggestionSelect, formatBusName, formatNumber,
  } = props;

  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const leaveTime = new Date().toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const setMode = (mode: TransportSearchMode) => {
    setTransportMode(mode);
    setSearchMode('TEXT');
    setInputValue('');
    setSearchQuery('');
    setFromStation('');
    setToStation('');
    setSuggestedRoutes([]);
    setSearchContext(undefined);
    setShowSuggestions(false);
    setBusRouteSort('DEFAULT');
  };

  const modeChips: Array<{ mode: TransportSearchMode; label: string }> = [
    { mode: 'LOCAL', label: lbl('Local bus', 'লোকাল বাস') },
    { mode: 'METRO', label: lbl('Metro', 'মেট্রো') },
    { mode: 'INTERCITY', label: lbl('Intercity', 'আন্তঃজেলা') },
    { mode: 'TRAIN', label: lbl('Train', 'ট্রেন') },
    { mode: 'LAUNCH', label: lbl('Launch', 'লঞ্চ') },
    { mode: 'AIR', label: lbl('Air', 'বিমান') },
  ];

  const quickIcons = [
    { icon: '🚌', action: () => setMode('LOCAL') },
    { icon: '🚇', action: () => setMode('METRO') },
    { icon: '🚆', action: () => setMode('TRAIN') },
    { icon: '⛴', action: () => setMode('LAUNCH') },
    { icon: '✈️', action: () => setMode('AIR') },
  ];

  const handleFindRoute = () => {
    if (!fromStation || !toStation) return;
    if (transportMode === 'LOCAL') {
      setSearchMode('ROUTE');
      setSearchQuery('');
      setSuggestedRoutes([]);
      scrollContainerRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    localStorage.setItem('koyjabo_prefill_from', fromStation);
    localStorage.setItem('koyjabo_prefill_to', toStation);
    localStorage.setItem('koyjabo_prefill_mode', transportMode.toLowerCase());
    const nextView =
      transportMode === 'METRO' ? AppView.METRO_HUB :
      transportMode === 'TRAIN' ? AppView.TRAIN_LIST :
      transportMode === 'LAUNCH' ? AppView.LAUNCH_HUB :
      AppView.INTERCITY_HUB;
    setView(nextView);
  };

  const searchPlaceholders: Record<TransportSearchMode, string> = {
    LOCAL: lbl('Search bus, stop, place...', 'বাস, স্টপ বা স্থান লিখুন...'),
    METRO: lbl('Search MRT station or fare...', 'মেট্রো স্টেশন বা ভাড়া লিখুন...'),
    INTERCITY: lbl('Search district or operator...', 'জেলা বা অপারেটর লিখুন...'),
    TRAIN: lbl('Search train, station, number...', 'ট্রেন, স্টেশন বা নম্বর লিখুন...'),
    LAUNCH: lbl('Search launch, terminal, route...', 'লঞ্চ, ঘাট বা রুট লিখুন...'),
    AIR: lbl('Search airport or flight route...', 'বিমানবন্দর বা ফ্লাইট রুট লিখুন...'),
  };
  const fromPlaceholders: Record<TransportSearchMode, string> = {
    LOCAL: lbl('Gulshan 1', 'গুলশান ১'),
    METRO: lbl('Uttara North', 'উত্তরা উত্তর'),
    INTERCITY: lbl('Dhaka', 'ঢাকা'),
    TRAIN: lbl('Dhaka (Kamalapur)', 'ঢাকা (কমলাপুর)'),
    LAUNCH: lbl('Sadarghat, Dhaka', 'সদরঘাট, ঢাকা'),
    AIR: lbl('Hazrat Shahjalal Airport', 'হযরত শাহজালাল বিমানবন্দর'),
  };
  const toPlaceholders: Record<TransportSearchMode, string> = {
    LOCAL: lbl('Motijheel', 'মতিঝিল'),
    METRO: lbl('Motijheel', 'মতিঝিল'),
    INTERCITY: lbl("Cox's Bazar", 'কক্সবাজার'),
    TRAIN: lbl('Chattogram', 'চট্টগ্রাম'),
    LAUNCH: lbl('Barisal Ghat', 'বরিশাল ঘাট'),
    AIR: lbl("Cox's Bazar Airport", 'কক্সবাজার বিমানবন্দর'),
  };
  const activeOptions = routeOptions.length ? routeOptions : stationOptions;

  const chipBtn = (active: boolean) =>
    `inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-medium transition-all ${
      active
        ? 'bg-gradient-to-r from-kj-primary to-kj-primary-deep text-kj-primary-ink border-transparent shadow-[0_2px_10px_rgba(0,245,255,0.35)]'
        : 'bg-kj-panel-muted border-kj-line text-kj-text hover:border-kj-primary/40 hover:text-kj-primary'
    }`;

  return (
    <div
      className="rounded-[24px] border border-kj-line overflow-visible shrink-0"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(0,245,255,0.03) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.6), 0 30px 90px -25px rgba(0,245,255,0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div className="p-4 md:p-[22px]">

        {/* Mode chips row */}
        <div className="flex items-center gap-2 flex-wrap mb-3.5">
          {modeChips.map((chip) => (
            <button
              key={chip.mode}
              type="button"
              onClick={() => setMode(chip.mode)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 border transition-all ${
                transportMode === chip.mode
                  ? 'bg-gradient-to-r from-kj-primary to-kj-primary-deep text-kj-primary-ink border-transparent shadow-[0_2px_8px_rgba(0,245,255,0.3)]'
                  : 'bg-kj-chip-bg text-kj-chip-text border-transparent hover:border-kj-line hover:text-kj-primary'
              }`}
            >
              {transportMode === chip.mode && <span className="w-1.5 h-1.5 rounded-full bg-kj-primary-ink/80 shrink-0" />}
              {chip.label}
            </button>
          ))}
          <div className="hidden md:block flex-1" />
          <button
            type="button"
            onClick={() => document.querySelector<HTMLInputElement>('[data-kj-universal-search]')?.focus()}
            className="hidden md:inline-flex items-center gap-1.5 bg-kj-text text-kj-bg border-0 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide hover:opacity-90 transition-opacity"
          >
            <Search className="w-3 h-3" />
            {lbl('Search anything', 'যেকোনো কিছু খুঁজুন')}
          </button>
        </div>

        {/* Universal search bar */}
        <div className="relative mb-2.5 isolate z-50">
          <div
            className="relative border border-kj-line rounded-[14px] px-3.5 py-3 flex items-center gap-3 transition-all focus-within:border-kj-primary/50 focus-within:shadow-[0_0_0_3px_rgba(0,245,255,0.08)]"
            style={{ background: 'var(--kj-input-bg)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 kj-anim-glow"
              style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}
            >
              <Search className="w-3.5 h-3.5 text-kj-primary-ink" />
            </div>
            <input
              data-kj-universal-search
              type="text"
              placeholder={searchPlaceholders[transportMode]}
              className="flex-1 min-w-0 bg-transparent text-kj-text text-sm font-bengali font-medium focus:outline-none placeholder:text-kj-text-dim"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                onInputChange(e.target.value);
              }}
              onKeyDown={onKeyDown}
              onFocus={() => { if (searchSuggestions.length > 0) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              {quickIcons.map((q) => (
                <button
                  key={q.icon}
                  type="button"
                  onClick={q.action}
                  className="w-[26px] h-[26px] rounded-lg bg-kj-chip-bg flex items-center justify-center text-[13px] hover:bg-kj-primary-soft transition-colors"
                >
                  {q.icon}
                </button>
              ))}
            </div>
            <kbd className="hidden lg:inline-flex h-6 px-1.5 rounded-md border border-kj-line bg-kj-panel text-[10px] font-bold text-kj-text-faint items-center shrink-0">⌘ K</kbd>
            {(inputValue || searchQuery) ? (
              <button
                type="button"
                onClick={() => { setInputValue(''); setSearchQuery(''); setSuggestedRoutes([]); setSearchContext(undefined); setShowSuggestions(false); }}
                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSearchCommit}
                disabled={isIntercityRedirecting}
                className="p-1.5 rounded-lg bg-kj-primary-soft text-kj-primary shrink-0 sm:hidden"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl shadow-2xl max-h-72 overflow-y-auto z-[9999] border border-kj-line" style={{ background: 'var(--kj-panel)' }}>
              {searchSuggestions.map((suggestion, idx) => (
                <div
                  key={`${suggestion.type}-${suggestion.id}-${idx}`}
                  className="px-4 py-3 hover:bg-kj-primary-soft cursor-pointer border-b border-kj-line last:border-b-0 transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); onSuggestionSelect(suggestion); }}
                >
                  <div className="font-semibold text-kj-text text-sm truncate">
                    {suggestion.type === 'bus' ? formatBusName(suggestion.name) : formatNumber(suggestion.name)}
                  </div>
                  {suggestion.bnName && <div className="text-xs text-kj-text-dim truncate">{suggestion.bnName}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="h-px flex-1 bg-kj-line" />
          <span className="text-[10px] font-bold text-kj-text-faint tracking-[1.4px] uppercase whitespace-nowrap">
            {lbl('Or · plan a route', 'অথবা · রুট প্ল্যান করুন')}
          </span>
          <span className="h-px flex-1 bg-kj-line" />
        </div>

        {/* Route planner */}
        <div className="flex flex-col md:flex-row gap-2.5 md:gap-3 md:items-stretch">

          {/* From field */}
          <div
            className="flex-1 border border-kj-line rounded-[14px] px-3.5 py-2.5 flex items-center gap-3 transition-all focus-within:border-kj-primary/50"
            style={{ background: 'var(--kj-input-bg)' }}
          >
            <div className="w-7 h-7 rounded-lg bg-kj-primary-soft text-kj-primary flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-kj-text-faint uppercase tracking-[1.2px]">{lbl('From', 'কোথা থেকে')}</div>
              <SearchableSelect
                variant="embedded"
                placeholder={fromPlaceholders[transportMode]}
                value={fromStation}
                onChange={setFromStation}
                options={activeOptions}
              />
              {globalNearestStationName && (
                <p className="text-[10px] text-kj-text-faint mt-0.5">· {lbl('Current location', 'বর্তমান অবস্থান')}</p>
              )}
            </div>
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center shrink-0 -my-1 md:my-0 md:px-0.5">
            <button
              type="button"
              onClick={() => { const tmp = fromStation; setFromStation(toStation); setToStation(tmp); }}
              className="w-9 h-9 rounded-full border border-kj-line bg-kj-panel flex items-center justify-center text-kj-text z-10 shadow-sm hover:border-kj-primary/50 hover:text-kj-primary hover:shadow-[0_0_0_4px_rgba(0,245,255,0.08)] transition-all"
              aria-label={lbl('Swap stations', 'স্টেশন অদলবদল')}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* To field */}
          <div
            className="flex-1 border border-kj-line rounded-[14px] px-3.5 py-2.5 flex items-center gap-3 transition-all focus-within:border-kj-primary/50"
            style={{ background: 'var(--kj-input-bg)' }}
          >
            <div className="w-7 h-7 rounded-lg bg-kj-accent-soft text-kj-accent flex items-center justify-center shrink-0">
              <Flag className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-kj-text-faint uppercase tracking-[1.2px]">{lbl('To', 'কোথায়')}</div>
              <SearchableSelect
                variant="embedded"
                placeholder={toPlaceholders[transportMode]}
                value={toStation}
                onChange={setToStation}
                options={activeOptions.filter(o => o.id !== fromStation)}
              />
            </div>
          </div>

          {/* Find route CTA */}
          <button
            type="button"
            onClick={handleFindRoute}
            disabled={!fromStation || !toStation}
            className="md:w-auto md:px-5 h-12 md:min-h-[72px] font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 disabled:opacity-40 transition-all shrink-0 text-kj-primary-ink"
            style={{
              background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
              boxShadow: '0 6px 16px -6px rgba(0,245,255,0.55)',
            }}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{lbl('Find routes', 'রুট খুঁজুন')}</span>
          </button>
        </div>

        {/* Sort / filter chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5">
          <button type="button" onClick={() => setBusRouteSort('DEFAULT')} className={chipBtn(busRouteSort === 'DEFAULT')}>
            <Clock className="w-3 h-3" />
            {lbl(`Leave now · ${leaveTime}`, `এখনই · ${leaveTime}`)}
          </button>
          <button type="button" onClick={() => setBusRouteSort(busRouteSort === 'FASTEST' ? 'DEFAULT' : 'FASTEST')} className={chipBtn(busRouteSort === 'FASTEST')}>
            <Zap className="w-3 h-3" />
            {lbl('Fastest', 'দ্রুততম')}
          </button>
          <button type="button" onClick={() => setBusRouteSort(busRouteSort === 'CHEAPEST' ? 'DEFAULT' : 'CHEAPEST')} className={chipBtn(busRouteSort === 'CHEAPEST')}>
            <Banknote className="w-3 h-3" />
            {lbl('Cheapest', 'সস্তা')}
          </button>
          <button type="button" onClick={() => setNonAcOnly(!nonAcOnly)} className={`hidden md:inline-flex ${chipBtn(nonAcOnly)}`}>
            {lbl('Non-AC only', 'AC ছাড়া')}
          </button>
          <div className="flex-1 hidden md:block" />
          <span className="inline-flex items-center gap-1.5 text-xs text-kj-text-faint ml-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-kj-primary shadow-[0_0_0_3px_rgba(0,245,255,0.14)]" />
            {transportMode === 'LOCAL'
              ? lbl('2,412 routes live', '২,৪১২ রুট লাইভ')
              : lbl('Real local dataset', 'বাস্তব লোকাল ডেটা')}
          </span>
        </div>

      </div>
    </div>
  );
};

export default HomeSearchPanel;
