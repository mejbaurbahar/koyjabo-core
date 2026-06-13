import React from 'react';
import { Search, X, ArrowLeftRight, MapPin, Flag, Clock, Zap, Banknote } from 'lucide-react';
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
    language, view, searchMode, setSearchMode,
    inputValue, setInputValue, searchQuery, setSearchQuery,
    fromStation, setFromStation, toStation, setToStation,
    busRouteSort, setBusRouteSort, nonAcOnly, setNonAcOnly,
    showSuggestions, setShowSuggestions, searchSuggestions, isIntercityRedirecting,
    globalNearestStationName, stationOptions, setView, setSuggestedRoutes,
    setSearchContext, scrollContainerRef, onSearchCommit, onKeyDown, onInputChange,
    onSuggestionSelect, formatBusName, formatNumber,
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

  const chipBtn = (active: boolean) =>
    `inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-medium transition-colors ${
      active ? 'bg-kj-primary text-kj-primary-ink border-kj-primary' : 'bg-kj-panel-muted border-kj-line text-kj-text hover:border-kj-primary/40'
    }`;

  return (
    <div className="dc-card kj-glass rounded-[24px] border border-kj-line shadow-[0_4px_12px_rgba(0,0,0,0.6),0_30px_90px_-25px_rgba(0,245,255,0.25)] overflow-visible shrink-0">
      <div className="p-4 md:p-[22px]">
        {/* Mode chips + search anything pill */}
        <div className="flex items-center gap-2 flex-wrap mb-3.5">
          {modeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onClick}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 border transition-all ${
                chip.active
                  ? 'bg-kj-primary-soft text-kj-primary-deep border-kj-primary/30'
                  : 'bg-kj-chip-bg text-kj-chip-text border-transparent hover:border-kj-line'
              }`}
            >
              {chip.active && <span className="w-1.5 h-1.5 rounded-full bg-kj-primary shrink-0" />}
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
          <div className="relative bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-3 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-kj-primary to-kj-primary-deep text-white flex items-center justify-center shrink-0 kj-anim-glow">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              data-kj-universal-search
              type="text"
              placeholder={lbl('Search bus, train, stop, place, district...', 'বাস, ট্রেন, স্টপ বা স্থান লিখুন...')}
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
                <button key={q.icon} type="button" onClick={q.action} className="w-[26px] h-[26px] rounded-lg bg-kj-chip-bg flex items-center justify-center text-[13px] hover:bg-kj-primary-soft transition-colors">
                  {q.icon}
                </button>
              ))}
            </div>
            <kbd className="hidden lg:inline-flex h-6 px-1.5 rounded-md border border-kj-line bg-kj-panel text-[10px] font-bold text-kj-text-faint items-center shrink-0">⌘ K</kbd>
            {(inputValue || searchQuery) ? (
              <button type="button" onClick={() => { setInputValue(''); setSearchQuery(''); setSuggestedRoutes([]); setSearchContext(undefined); setShowSuggestions(false); }}
                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button type="button" onClick={onSearchCommit} disabled={isIntercityRedirecting}
                className="p-1.5 rounded-lg bg-kj-primary-soft text-kj-primary shrink-0 sm:hidden">
                <Search className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
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

        {/* Divider */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="h-px flex-1 bg-kj-line" />
          <span className="text-[10px] font-bold text-kj-text-faint tracking-[1.4px] uppercase whitespace-nowrap">
            {lbl('Or · plan a route', 'অথবা · রুট প্ল্যান করুন')}
          </span>
          <span className="h-px flex-1 bg-kj-line" />
        </div>

        {/* Route planner grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 md:gap-2.5 items-stretch">
          <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-kj-primary-soft text-kj-primary-deep flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-kj-text-faint uppercase tracking-[1.2px]">{lbl('From', 'কোথা থেকে')}</div>
              <SearchableSelect
                variant="embedded"
                placeholder={lbl('Gulshan 1', 'গুলশান ১')}
                value={fromStation}
                onChange={setFromStation}
                options={stationOptions}
              />
              {globalNearestStationName && (
                <p className="text-[10px] text-kj-text-faint mt-0.5">· {lbl('Current location', 'বর্তমান অবস্থান')}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => { const tmp = fromStation; setFromStation(toStation); setToStation(tmp); }}
            className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-kj-line bg-kj-panel items-center justify-center text-kj-text z-10 shadow-sm hover:border-kj-primary/50"
            aria-label={lbl('Swap stations', 'স্টেশন অদলবদল')}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-kj-accent-soft text-kj-accent flex items-center justify-center shrink-0">
              <Flag className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-kj-text-faint uppercase tracking-[1.2px]">{lbl('To', 'কোথায়')}</div>
              <SearchableSelect
                variant="embedded"
                placeholder={lbl('Motijheel', 'মতিঝিল')}
                value={toStation}
                onChange={setToStation}
                options={stationOptions}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleFindRoute}
            disabled={!fromStation || !toStation}
            className="md:w-auto md:px-5 h-12 md:h-auto md:min-h-[72px] bg-kj-primary text-kj-primary-ink font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_6px_16px_-6px_rgba(0,245,255,0.6)] hover:brightness-105 transition-all"
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
            {lbl('2,412 routes live', '২,৪১২ রুট লাইভ')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomeSearchPanel;
