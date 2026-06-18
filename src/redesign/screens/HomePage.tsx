import React, { useState, useEffect, useRef, useMemo } from 'react';
import { KJ_TOKENS, Tokens, Lang, SANS, BEN, T } from '../tokens';
import { TopBar } from '../components/TopBar';
import { MobileTabBar } from '../components/MobileTabBar';
import { AdSlot } from '../components/AdSlot';
import { Icon } from '../components/Icons';
import { Pill } from '../components/Pill';
import { Bus3D, MiniVehicle, TravelHeroScene } from '../components/Vehicles3D';
import { KJFooter as KJFooterComponent } from '../components/KJFooter';
import { NativeAdSection as NativeAdSectionReal } from '../components/AdComponents';
import { STATIONS, BUS_DATA, METRO_STATIONS as REAL_METRO_STATIONS, AIRPORTS } from '../../../constants';
import { BD_TRAIN_ROUTES, TRAIN_STATIONS } from '../../../data/bangladeshTrainData';
import { INTERCITY_BUS_ROUTES, MAJOR_TRANSPORT_HUBS } from '../../../data/intercityData';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HomePageProps {
  theme: 'dark' | 'light';
  device: 'desktop' | 'mobile';
  lang: 'bn' | 'en';
  route: string;
  onNav: (route: string) => void;
  onBack: () => void;
  canBack: boolean;
  onLang: () => void;
  onTheme: () => void;
  onMenu: () => void;
}

// ─── Inline 3D-style SVG Vehicles ────────────────────────────────────────────

// Vehicles imported from Vehicles3D — no inline SVGs needed here

// ─── SearchPanel ──────────────────────────────────────────────────────────────

const SEARCH_MODES = [
  { bn: 'লোকাল বাস', en: 'Local Bus', shortBn: 'বাস', shortEn: 'Bus', icon: '🚌', id: 'bus' },
  { bn: 'মেট্রো', en: 'Metro', shortBn: 'মেট্রো', shortEn: 'Metro', icon: '🚇', id: 'metro' },
  { bn: 'আন্তঃজেলা', en: 'Intercity', shortBn: 'জেলা', shortEn: 'City', icon: '🧭', id: 'intercity' },
  { bn: 'ট্রেন', en: 'Train', shortBn: 'ট্রেন', shortEn: 'Train', icon: '🚆', id: 'train' },
  { bn: 'লঞ্চ', en: 'Launch', shortBn: 'লঞ্চ', shortEn: 'Launch', icon: '⛴️', id: 'launch' },
  { bn: 'বিমান', en: 'Air', shortBn: 'বিমান', shortEn: 'Air', icon: '✈️', id: 'flights' },
] as const;

type SearchModeId = typeof SEARCH_MODES[number]['id'];

const LAUNCH_TERMINALS = [
  { id:'sadarghat', label:'Sadarghat', sub:'সদরঘাট' },
  { id:'barisal', label:'Barisal Ghat', sub:'বরিশাল ঘাট' },
  { id:'khulna', label:'Khulna Ghat', sub:'খুলনা ঘাট' },
  { id:'patuakhali', label:'Patuakhali Ghat', sub:'পটুয়াখালী ঘাট' },
  { id:'bhola', label:'Bhola Ghat', sub:'ভোলা ঘাট' },
  { id:'chandpur', label:'Chandpur Ghat', sub:'চাঁদপুর ঘাট' },
  { id:'narayanganj', label:'Narayanganj Terminal', sub:'নারায়ণগঞ্জ টার্মিনাল' },
  { id:'madaripur', label:'Madaripur Ghat', sub:'মাদারীপুর ঘাট' },
  { id:'hatiya', label:'Hatiya Ghat', sub:'হাতিয়া ঘাট' },
  { id:'borguna', label:'Borguna Ghat', sub:'বরগুনা ঘাট' },
];

function SearchPanel({
  tk,
  lang,
  isMobile,
  onNav,
  activeMode,
  setActiveMode,
}: {
  tk: Tokens;
  lang: Lang;
  isMobile: boolean;
  onNav: (r: string, params?: Record<string, string>) => void;
  activeMode: SearchModeId;
  setActiveMode: (m: SearchModeId) => void;
}) {
  const [searchQ, setSearchQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const stationList: Suggestion[] = useMemo(() =>
    Object.values(STATIONS).map(s => ({ id: s.id, label: s.name, sub: s.bnName })), []
  );
  const modeOptions: Suggestion[] = useMemo(() => {
    if (activeMode === 'metro') {
      return Object.values(REAL_METRO_STATIONS).map(s => ({ id: s.id, label: s.name, sub: s.bnName }));
    }
    if (activeMode === 'train') {
      return Object.values(TRAIN_STATIONS).map(s => ({ id: s.id, label: s.name, sub: s.bnName }));
    }
    if (activeMode === 'intercity') {
      const seen = new Set<string>();
      return [...INTERCITY_BUS_ROUTES, ...MAJOR_TRANSPORT_HUBS]
        .filter(r => {
          if (seen.has(r.district)) return false;
          seen.add(r.district);
          return true;
        })
        .sort((a, b) => a.district.localeCompare(b.district))
        .map(r => ({ id: r.district, label: r.district, sub: r.busOperators.slice(0, 3).join(', ') }));
    }
    if (activeMode === 'launch') return LAUNCH_TERMINALS;
    if (activeMode === 'flights') {
      return Object.values(AIRPORTS).map(a => ({ id: a.id, label: a.name, sub: a.bnName }));
    }
    return stationList;
  }, [activeMode, stationList]);
  const norm = (s: string) => s.toLowerCase().replace(/[\s\-\.]/g,'');
  const filterModeOptions = (q: string) => {
    if (!q.trim()) return modeOptions.slice(0, 8);
    const lq = q.toLowerCase();
    return modeOptions.filter(s => s.label.toLowerCase().includes(lq) || s.sub?.includes(q) || s.id.toLowerCase().includes(norm(q))).slice(0, 8);
  };

  const modeRoute = (mode = activeMode) =>
    mode === 'bus' ? 'bus-hub' :
    mode === 'metro' ? 'metro-hub' :
    mode === 'train' ? 'train-hub' :
    mode === 'launch' ? 'launch-hub' :
    mode === 'flights' ? 'flights-hub' :
    'intercity';

  const modeSearchPlaceholder = {
    bus: T(lang, 'বাস, স্টপ, এলাকা...', 'Search bus, stop, place...'),
    metro: T(lang, 'মেট্রো স্টেশন বা ভাড়া...', 'Search MRT station or fare...'),
    intercity: T(lang, 'জেলা বা অপারেটর...', 'Search district or operator...'),
    train: T(lang, 'ট্রেন, স্টেশন, নম্বর...', 'Search train, station, number...'),
    launch: T(lang, 'লঞ্চ, ঘাট, রুট...', 'Search launch, terminal, route...'),
    flights: T(lang, 'বিমানবন্দর বা ফ্লাইট রুট...', 'Search airport or flight route...'),
  } as Record<SearchModeId, string>;

  const fromPlaceholder = {
    bus: T(lang, 'গুলশান ১', 'Gulshan 1'),
    metro: T(lang, 'উত্তরা উত্তর', 'Uttara North'),
    intercity: T(lang, 'ঢাকা', 'Dhaka'),
    train: T(lang, 'ঢাকা (কমলাপুর)', 'Dhaka (Kamalapur)'),
    launch: T(lang, 'সদরঘাট', 'Sadarghat'),
    flights: T(lang, 'ঢাকা (DAC)', 'Dhaka (DAC)'),
  } as Record<SearchModeId, string>;

  const toPlaceholder = {
    bus: T(lang, 'মতিঝিল', 'Motijheel'),
    metro: T(lang, 'মতিঝিল', 'Motijheel'),
    intercity: T(lang, 'কক্সবাজার', "Cox's Bazar"),
    train: T(lang, 'চট্টগ্রাম', 'Chattogram'),
    launch: T(lang, 'বরিশাল ঘাট', 'Barisal Ghat'),
    flights: T(lang, 'কক্সবাজার (CXB)', "Cox's Bazar (CXB)"),
  } as Record<SearchModeId, string>;

  const submitSearch = (value = searchQ) => {
    const params = value.trim() ? { search: value.trim(), mode: activeMode } : { mode: activeMode };
    onNav(modeRoute(), params);
  };

  // Search results for the universal search
  const searchResults: Suggestion[] = useMemo(() => {
    if (!searchQ.trim()) return [];
    const q = searchQ.toLowerCase();
    if (activeMode === 'bus') {
      return BUS_DATA
        .filter(r => r.name.toLowerCase().includes(q) || r.bnName.toLowerCase().includes(q) || r.routeString.toLowerCase().includes(q))
        .slice(0, 6)
        .map(r => ({ id: r.id, label: r.name, sub: r.routeString }));
    }
    if (activeMode === 'train') {
      const trains = BD_TRAIN_ROUTES
        .filter(r => r.name.toLowerCase().includes(q) || r.bnName.includes(searchQ) || r.number.includes(q))
        .slice(0, 5)
        .map(r => ({ id: r.id, label: `${r.name} (${r.number})`, sub: r.bnName }));
      return [...trains, ...filterModeOptions(searchQ)].slice(0, 8);
    }
    return filterModeOptions(searchQ);
  }, [activeMode, searchQ, modeOptions]);

  const changeMode = (mode: SearchModeId) => {
    setActiveMode(mode);
    setSearchQ('');
    setFrom('');
    setTo('');
  };

  const pillBase: React.CSSProperties = {
    borderRadius: 999,
    padding: isMobile ? '7px 10px' : '5px 13px',
    fontFamily: lang === 'bn' ? BEN : SANS,
    fontSize: isMobile ? 11 : 12,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    whiteSpace: 'nowrap',
    transition: 'all 0.18s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  };

  const fieldCard: React.CSSProperties = {
    background: tk.inputBg,
    border: `1px solid ${tk.line}`,
    borderRadius: 14,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  };

  return (
    <div
      style={{
        borderRadius: 24,
        padding: 22,
        background: tk.panel,
        boxShadow: tk.shadowLg,
        border: `1px solid ${tk.line}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Mode pills — scroll horizontally on mobile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: isMobile ? 'hidden' : 'auto', scrollbarWidth: 'none', flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
        {SEARCH_MODES.map((m) => (
          <button
            key={m.id}
            data-kj-search-mode={m.id}
            onClick={() => changeMode(m.id)}
            style={{
              ...pillBase,
              background: activeMode === m.id ? tk.primary : tk.panelMuted,
              color: activeMode === m.id ? tk.primaryInk : tk.textDim,
              border: activeMode === m.id ? 'none' : `1px solid ${tk.line}`,
              flex: isMobile ? '1 1 0' : undefined,
              justifyContent: 'center',
              minWidth: 0,
            }}
            aria-label={T(lang, m.bn, m.en)}
          >
            <span aria-hidden="true">{m.icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isMobile ? T(lang, m.shortBn, m.shortEn) : T(lang, m.bn, m.en)}
            </span>
          </button>
        ))}
        {!isMobile && (
          <button
            onClick={() => onNav('intercity')}
            style={{
              ...pillBase,
              marginLeft: 'auto',
              background: tk.primarySoft,
              color: tk.primary,
              border: `1px solid ${tk.primary}`,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon.search s={13} />
            {T(lang, 'যেকোনো কিছু খুঁজুন', 'Search anything')}
          </button>
        )}
      </div>

      {/* Universal search field — real input */}
      <div
        ref={searchRef}
        style={{ background: tk.inputBg, border: `1px solid ${searchFocus ? tk.primary : tk.line}`, borderRadius: 14, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, transition: 'border-color 0.15s' }}
      >
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, rgba(0,245,255,0.25), rgba(162,89,255,0.25))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: tk.primary }}>
          <Icon.search s={15} />
        </div>
        <input
          data-kj-home-search
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
          onKeyDown={e => e.key === 'Enter' && searchQ.trim() && submitSearch()}
          placeholder={modeSearchPlaceholder[activeMode]}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, color: tk.text, minWidth: 0 }}
        />
        {!isMobile && (
          <span style={{ background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 6, padding: '2px 6px', fontFamily: SANS, fontSize: 10, fontWeight: 600, color: tk.textFaint, flexShrink: 0 }}>⌘K</span>
        )}
      </div>
      {searchFocus && searchResults.length > 0 && (
        <SuggestionDropdown suggestions={searchResults} onSelect={s => { setSearchQ(s.label); setSearchFocus(false); submitSearch(s.label); }} onDismiss={() => setSearchFocus(false)} tk={tk} lang={lang} anchorRef={searchRef} />
      )}

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: tk.line }} />
        <span
          style={{
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 11,
            color: tk.textFaint,
          }}
        >
          {T(lang, 'অথবা · রুট প্ল্যান করুন', 'Or · plan a route')}
        </span>
        <div style={{ flex: 1, height: 1, background: tk.line }} />
      </div>

      {/* From / To */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto',
          gap: 10,
          alignItems: 'center',
        }}
      >
        {/* From — real input with station suggestions */}
        <div ref={fromRef} style={{ ...fieldCard, borderColor: fromFocus ? tk.primary : tk.line, transition: 'border-color 0.15s' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: tk.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.primary, flexShrink: 0 }}>
            <Icon.pin s={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 0.5 }}>{T(lang, 'কোথা থেকে', 'From')}</div>
            <input
              data-kj-from-input
              value={from}
              onChange={e => setFrom(e.target.value)}
              onFocus={() => setFromFocus(true)}
              onBlur={() => setTimeout(() => setFromFocus(false), 150)}
              placeholder={fromPlaceholder[activeMode]}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: 600, color: tk.text, width: '100%', marginTop: 2 }}
            />
          </div>
        </div>
        {fromFocus && <SuggestionDropdown suggestions={filterModeOptions(from)} onSelect={s => { setFrom(s.label); setFromFocus(false); }} onDismiss={() => setFromFocus(false)} tk={tk} lang={lang} anchorRef={fromRef} />}

        {/* Swap (desktop only) */}
        {!isMobile && (
          <button
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: tk.primarySoft,
              border: `1px solid ${tk.primary}`,
              color: tk.primary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              order: 2,
            }}
            aria-label="Swap"
          >
            <Icon.swap s={16} />
          </button>
        )}

        {/* To — real input with station suggestions */}
        <div ref={toRef} style={{ ...fieldCard, order: isMobile ? 0 : 1, borderColor: toFocus ? tk.accent : tk.line, transition: 'border-color 0.15s' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: tk.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.accent, flexShrink: 0 }}>
            <Icon.flag s={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 0.5 }}>{T(lang, 'কোথায়', 'To')}</div>
            <input
              data-kj-to-input
              value={to}
              onChange={e => setTo(e.target.value)}
              onFocus={() => setToFocus(true)}
              onBlur={() => setTimeout(() => setToFocus(false), 150)}
              placeholder={toPlaceholder[activeMode]}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: 600, color: tk.text, width: '100%', marginTop: 2 }}
            />
          </div>
        </div>
        {toFocus && <SuggestionDropdown suggestions={filterModeOptions(to)} onSelect={s => { setTo(s.label); setToFocus(false); }} onDismiss={() => setToFocus(false)} tk={tk} lang={lang} anchorRef={toRef} />}

        {/* Find routes — navigates with real from/to */}
        <button
          data-kj-find-routes
          onClick={() => onNav(activeMode === 'bus' ? 'results' : modeRoute(), from || to ? { from, to, mode: activeMode } : { mode: activeMode })}
          style={{
            gridColumn: isMobile ? '1 / -1' : 'auto',
            order: isMobile ? 0 : 3,
            background: tk.primary,
            color: tk.primaryInk,
            border: 'none',
            borderRadius: 14,
            padding: '13px 22px',
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
          }}
        >
          {T(lang, 'রুট খুঁজুন', 'Find routes')}
          <Icon.arrowR s={16} />
        </button>
      </div>

      {/* Footer chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          T(lang, 'এখনই ছাড়ুন · ৪:২২ PM', 'Leave now · 4:22 PM'),
          T(lang, 'দ্রুততম', 'Fastest'),
          T(lang, 'সস্তাতম', 'Cheapest'),
          ...(!isMobile ? [T(lang, 'Non-AC only', 'Non-AC only')] : []),
        ].map((chip, i) => (
          <button
            key={i}
            style={{
              background: i === 0 ? tk.primarySoft : tk.panelMuted,
              border: `1px solid ${i === 0 ? tk.primary : tk.line}`,
              borderRadius: 999,
              padding: '5px 12px',
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: 11,
              fontWeight: 500,
              color: i === 0 ? tk.primary : tk.textDim,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {chip}
          </button>
        ))}
        <span
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 11,
            fontWeight: 600,
            color: '#22c55e',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#22c55e',
              animation: 'kjpulse 2s ease-in-out infinite',
              display: 'inline-block',
            }}
          />
          {activeMode === 'bus' ? T(lang, '২,৪১২ রুট লাইভ', '2,412 routes live') : T(lang, 'বাস্তব লোকাল ডেটা', 'Real local dataset')}
        </span>
      </div>
    </div>
  );
}

// ─── ModeTile ─────────────────────────────────────────────────────────────────

interface TileData {
  grad: string;
  label: { bn: string; en: string };
  sub: string;
  badge?: { bn: string; en: string };
  route: string;
  mode: SearchModeId;
  vehicleKind: 'bus' | 'train' | 'plane' | 'launch' | 'chatbot';
}

const TILES: TileData[] = [
  { grad: 'linear-gradient(135deg, #10b981, #006a4e)', label: { bn: 'লোকাল বাস', en: 'Local bus' }, sub: T('en', '২০০+ রুট', '200+ routes'), badge: { bn: 'জনপ্রিয়', en: 'Popular' }, route: 'bus-hub', mode: 'bus', vehicleKind: 'bus' },
  { grad: 'linear-gradient(135deg, #3b82f6, #1e3a8a)', label: { bn: 'মেট্রো রেল', en: 'Metro Rail' }, sub: 'MRT-6 · 15 stations', route: 'metro-hub', mode: 'metro', vehicleKind: 'train' },
  { grad: 'linear-gradient(135deg, #8b5cf6, #5b21b6)', label: { bn: 'ট্রেন', en: 'Train' }, sub: 'BD Railway · all routes', route: 'train-hub', mode: 'train', vehicleKind: 'train' },
  { grad: 'linear-gradient(135deg, #f59e0b, #b45309)', label: { bn: 'আন্তঃজেলা', en: 'Intercity' }, sub: '64 districts · bus/train/flight', route: 'intercity', mode: 'intercity', vehicleKind: 'plane' },
  { grad: 'linear-gradient(135deg, #0ea5e9, #075985)', label: { bn: 'লঞ্চ ও স্টিমার', en: 'Launch & Steamer' }, sub: 'Sadarghat → Barisal', route: 'launch-hub', mode: 'launch', vehicleKind: 'launch' },
  { grad: 'linear-gradient(135deg, #8b5cf6, #5b21b6)', label: { bn: 'অভ্যন্তরীণ ফ্লাইট', en: 'Flights' }, sub: '4 airlines · 8 airports', badge: { bn: 'নতুন', en: 'New' }, route: 'flights-hub', mode: 'flights', vehicleKind: 'plane' },
  { grad: 'linear-gradient(135deg, #ef4444, #b91c1c)', label: { bn: 'AI সহায়ক', en: 'AI Assistant' }, sub: 'Ask in Bangla', badge: { bn: 'নতুন', en: 'New' }, route: 'ai', mode: 'bus', vehicleKind: 'chatbot' },
];

function ModeTile({
  tile,
  lang,
  onClick,
}: {
  tile: TileData;
  lang: Lang;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: tile.grad,
        borderRadius: 18,
        padding: '16px 14px 96px 14px', // bottom padding reserves space for 3D vehicle
        minHeight: 180,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left',
        transform: hov ? 'translateY(-3px) scale(1.02)' : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Animated blob */}
      <div
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          top: -30,
          right: -30,
          animation: 'kjpulse 3s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          bottom: 30,
          left: -20,
          animation: 'kjpulse 4s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />

      {/* Top row: icon chip + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <span style={{ fontSize: tile.vehicleKind === 'bus' ? 20 : tile.vehicleKind === 'chatbot' ? 18 : 20 }}>
            {tile.vehicleKind === 'bus' ? '🚌' : tile.vehicleKind === 'train' ? '🚆' : tile.vehicleKind === 'plane' ? '✈️' : tile.vehicleKind === 'launch' ? '⛴️' : '🤖'}
          </span>
        </div>
        {tile.badge && (
          <span
            style={{
              background: 'rgba(255,255,255,0.22)',
              borderRadius: 999,
              padding: '3px 8px',
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: 10,
              fontWeight: 700,
              color: 'white',
              backdropFilter: 'blur(4px)',
            }}
          >
            {T(lang, tile.badge.bn, tile.badge.en)}
          </span>
        )}
      </div>

      {/* Bottom: label + sub (text only — vehicle is absolutely positioned below) */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 15,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          {T(lang, tile.label.bn, tile.label.en)}
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 11,
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.3,
          }}
        >
          {tile.sub}
        </div>
      </div>

      {/* 3D vehicle — absolutely positioned from tile bottom, OUTSIDE text flow */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: 90,
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        <MiniVehicle kind={tile.vehicleKind}/>
      </div>
    </button>
  );
}

// ─── KoyJaboStory ─────────────────────────────────────────────────────────────

const STORY_CAPTIONS = [
  {
    bn: 'লোকাল বাসস্ট্যান্ডে — কোন বাসে উঠবো? সব তো একরকম! 😕',
    en: 'At the bus stand — which bus do I take? They all look the same! 😕',
  },
  {
    bn: 'ফোনে koyjabo.com খুলে গন্তব্য লিখুন',
    en: 'Open koyjabo.com and type your destination',
  },
  {
    bn: 'সঠিক বাস, ভাড়া আর সময় — সাথে সাথে ✅',
    en: 'The right bus, fare & time — instantly ✅',
  },
  {
    bn: 'নিশ্চিন্তে সঠিক বাসে উঠে যাত্রা শুরু! 🎉',
    en: 'Hop on the right bus, stress-free! 🎉',
  },
];

function KoyJaboStory({
  tk,
  lang,
  onNav,
}: {
  tk: Tokens;
  lang: Lang;
  onNav: (r: string) => void;
}) {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % 4), 3600);
    return () => clearInterval(id);
  }, []);

  const sceneContent = [
    // Scene 0: confused boy at bus stop
    <div
      key="s0"
      className="kj-story-scene"
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      {/* Sky */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2d4a 60%, #1a3c2a 100%)' }} />
      {/* Road */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: '#1f2937' }} />
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: 0,
          right: 0,
          height: 3,
          background: 'repeating-linear-gradient(90deg, #fde68a 0, #fde68a 24px, transparent 24px, transparent 48px)',
          opacity: 0.5,
        }}
      />
      {/* Bus stop sign */}
      <div
        style={{
          position: 'absolute',
          bottom: 58,
          left: '38%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            background: '#1d4ed8',
            color: 'white',
            padding: '3px 8px',
            borderRadius: 4,
            fontFamily: BEN,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          BUS
        </div>
        <div style={{ width: 3, height: 40, background: '#9ca3af' }} />
      </div>
      {/* Confused boy emoji */}
      <div
        style={{
          position: 'absolute',
          bottom: 56,
          left: '48%',
          fontSize: 38,
          animation: 'kjBobY 1.8s ease-in-out infinite',
        }}
      >
        🧑
      </div>
      {/* Thought bubble */}
      <div
        style={{
          position: 'absolute',
          bottom: '55%',
          left: '54%',
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 12,
          padding: '5px 10px',
          fontFamily: BEN,
          fontSize: 12,
          color: '#1f2937',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}
      >
        কোন বাসে উঠবো? 😕
      </div>
      {/* Driving buses */}
      <div
        className="kj-anim-drive"
        style={{ position: 'absolute', bottom: 38, left: 0, width: '30%', animationDuration: '6s' }}
      >
        <Bus3D size={64} />
      </div>
      <div
        className="kj-anim-drive"
        style={{ position: 'absolute', bottom: 38, left: '-50%', width: '30%', animationDuration: '9s', animationDelay: '3s' }}
      >
        <Bus3D size={64} />
      </div>
    </div>,

    // Scene 1: boy with phone
    <div
      key="s1"
      className="kj-story-scene"
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2d4a 60%, #1a3c2a 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: '#1f2937' }} />
      <div
        style={{
          position: 'absolute',
          bottom: 56,
          left: '42%',
          fontSize: 34,
        }}
      >
        🧑
      </div>
      {/* Phone mockup */}
      <div
        style={{
          position: 'absolute',
          bottom: '32%',
          left: '50%',
          width: 80,
          borderRadius: 12,
          background: '#0d1b2e',
          border: '2px solid rgba(0,245,255,0.5)',
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0,245,255,0.3)',
          animation: 'kjBobY 2s ease-in-out infinite',
        }}
      >
        <div style={{ background: 'rgba(0,245,255,0.15)', padding: '5px 6px 3px' }}>
          <div style={{ fontFamily: BEN, fontSize: 7, fontWeight: 800, color: '#00f5ff', letterSpacing: 0.5 }}>KoyJabo</div>
        </div>
        <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 4,
              padding: '3px 5px',
              fontFamily: BEN,
              fontSize: 7,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            মতিঝিল...
          </div>
          <div style={{ background: 'rgba(0,245,255,0.12)', borderRadius: 4, padding: '4px 5px', fontFamily: BEN, fontSize: 7, fontWeight: 600, color: '#00f5ff' }}>
            🔍 খুঁজুন
          </div>
        </div>
      </div>
      {/* Sparkle */}
      <div style={{ position: 'absolute', bottom: '65%', left: '62%', fontSize: 18, animation: 'kjSpark 1.5s ease-in-out infinite' }}>✨</div>
    </div>,

    // Scene 2: results on phone
    <div
      key="s2"
      className="kj-story-scene"
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2d4a 60%, #1a3c2a 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: '#1f2937' }} />
      <div style={{ position: 'absolute', bottom: 56, left: '38%', fontSize: 34 }}>🧑</div>
      {/* Phone with results */}
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          left: '48%',
          width: 90,
          borderRadius: 12,
          background: '#0d1b2e',
          border: '2px solid rgba(0,245,255,0.5)',
          overflow: 'hidden',
          boxShadow: '0 0 24px rgba(0,245,255,0.35)',
        }}
      >
        <div style={{ background: 'rgba(0,245,255,0.15)', padding: '4px 6px' }}>
          <div style={{ fontFamily: BEN, fontSize: 7, fontWeight: 800, color: '#00f5ff' }}>৩টি রুট পাওয়া গেছে</div>
        </div>
        {[
          { route: 'গ্রীন লাইন', fare: '৳৬০', time: '৪৮ মিনিট', c: '#10b981' },
          { route: 'হানিফ', fare: '৳৭৫', time: '১ ঘন্টা', c: '#3b82f6' },
          { route: 'বিআরটিসি', fare: '৳৪৫', time: '৫২ মিনিট', c: '#8b5cf6' },
        ].map((r, i) => (
          <div key={i} style={{ padding: '3px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: BEN, fontSize: 7, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{r.route}</span>
            <div style={{ display: 'flex', gap: 3 }}>
              <span style={{ fontFamily: BEN, fontSize: 6, background: 'rgba(34,197,94,0.15)', color: '#4ade80', borderRadius: 3, padding: '1px 3px' }}>{r.fare}</span>
              <span style={{ fontFamily: BEN, fontSize: 6, color: 'rgba(255,255,255,0.4)' }}>{r.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Scene 3: correct bus rolling in
    <div
      key="s3"
      className="kj-story-scene"
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2d4a 60%, #1a3c2a 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: '#1f2937' }} />
      <div
        style={{
          position: 'absolute',
          bottom: 56,
          left: '55%',
          fontSize: 36,
          animation: 'kjBobY 1.5s ease-in-out infinite',
        }}
      >
        😊
      </div>
      {/* Rolling bus */}
      <div
        style={{ position: 'absolute', bottom: 38, left: '10%', animation: 'kjRollIn 1.2s cubic-bezier(.2,.7,.25,1) both' }}
      >
        <Bus3D size={90} />
      </div>
      {/* Green checkmark */}
      <div
        style={{
          position: 'absolute',
          bottom: '65%',
          left: '26%',
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          animation: 'kjPopIn 0.5s cubic-bezier(.2,.7,.25,1) both',
          animationDelay: '0.8s',
          opacity: 0,
        }}
      >
        ✓
      </div>
      {/* Sparkles */}
      {['✨', '🎉', '⭐'].map((e, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            fontSize: 20,
            top: `${20 + i * 15}%`,
            left: `${60 + i * 8}%`,
            animation: `kjSpark ${1 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          {e}
        </div>
      ))}
    </div>,
  ];

  return (
    <div
      style={{
        borderRadius: 22,
        overflow: 'hidden',
        border: `1px solid ${tk.line}`,
        background: tk.panel,
      }}
    >
      {/* Scene stage */}
      <div style={{ height: 260, position: 'relative', background: '#0d1b2e' }}>
        {sceneContent[scene]}
      </div>

      {/* Caption bar */}
      <div style={{ padding: '14px 18px', background: tk.panel }}>
        {/* Progress bars */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 999,
                background: i === scene ? tk.primary : tk.line,
                transition: 'background 0.4s ease',
                overflow: 'hidden',
              }}
            >
              {i === scene && (
                <div
                  style={{
                    height: '100%',
                    background: tk.primary,
                    animation: 'kjLoadBar 3.6s linear forwards',
                    borderRadius: 999,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p
            style={{
              margin: 0,
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: 13,
              color: tk.text,
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {lang === 'bn' ? STORY_CAPTIONS[scene].bn : STORY_CAPTIONS[scene].en}
          </p>
          {scene === 3 && (
            <button
              onClick={() => onNav('bus-hub')}
              style={{
                background: tk.primary,
                color: tk.primaryInk,
                border: 'none',
                borderRadius: 999,
                padding: '7px 16px',
                fontFamily: lang === 'bn' ? BEN : SANS,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {T(lang, 'এখনই চেষ্টা করুন', 'Try it now')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MetroLive strip ──────────────────────────────────────────────────────────

const METRO_STATIONS = [
  'উত্তরা উত্তর', 'উত্তরা সেন্টার', 'পল্লবী', 'মিরপুর ১১', 'মিরপুর ১০',
  'কাজীপাড়া', 'শেওড়াপাড়া', 'আগারগাঁও', 'বিজয় সরণি', 'ফার্মগেট',
  'কারওয়ান বাজার', 'শাহবাগ', 'ঢাকা বিশ্ববিদ্যালয়', 'বাংলাদেশ সচিবালয়', 'মতিঝিল',
];
const METRO_STATIONS_EN = [
  'Uttara North', 'Uttara Center', 'Pallabi', 'Mirpur 11', 'Mirpur 10',
  'Kazipara', 'Shewrapara', 'Agargaon', 'Bijoy Sarani', 'Farmgate',
  'Karwan Bazar', 'Shahbag', 'Dhaka University', 'Bangladesh Secretariat', 'Motijheel',
];
const CURRENT_STATION = 9; // Farmgate index

function MetroLiveStrip({ tk, lang, isMobile }: { tk: Tokens; lang: Lang; isMobile: boolean }) {
  return (
    <div
      style={{
        background: tk.metroBg,
        borderRadius: 18,
        padding: isMobile ? '14px 14px' : '18px 22px',
        border: `1px solid rgba(59,130,246,0.3)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          left: '30%',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1e3a8a)',
                borderRadius: 8,
                padding: '4px 10px',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 800,
                color: 'white',
                letterSpacing: 0.5,
              }}
            >
              M6
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#22c55e',
                    animation: 'kjpulse 1.5s ease-in-out infinite',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#93c5fd' }}>
                  {T(lang, 'লাইভ · এমআরটি লাইন ৬', 'Live · MRT Line 6')}
                </span>
              </div>
              <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>
                {T(lang, 'উত্তরা উত্তর → মতিঝিল', 'Uttara North → Motijheel')}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              {T(lang, 'পরের ট্রেন', 'Next train')}
            </div>
            <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 22, fontWeight: 800, color: '#60a5fa' }}>
              {T(lang, '২ মিনিট', '2 min')}
            </div>
          </div>
        </div>

        {/* Station dots */}
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ minWidth: isMobile ? 560 : '100%', position: 'relative', padding: '8px 0 12px' }}>
            {/* Progress line behind */}
            <div
              style={{
                position: 'absolute',
                top: 15,
                left: 8,
                right: 8,
                height: 4,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 15,
                left: 8,
                width: `${(CURRENT_STATION / (METRO_STATIONS.length - 1)) * 100}%`,
                height: 4,
                borderRadius: 999,
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              }}
            />

            {/* Station dots */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {METRO_STATIONS.map((sbn, i) => {
                const isPast = i < CURRENT_STATION;
                const isCurrent = i === CURRENT_STATION;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                    <div
                      style={{
                        width: isCurrent ? 14 : 9,
                        height: isCurrent ? 14 : 9,
                        borderRadius: '50%',
                        background: isCurrent ? '#60a5fa' : isPast ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                        border: isCurrent ? '3px solid white' : 'none',
                        boxShadow: isCurrent ? '0 0 12px rgba(96,165,250,0.8)' : 'none',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                      }}
                    />
                    {isCurrent && (
                      <span
                        style={{
                          fontFamily: lang === 'bn' ? BEN : SANS,
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#60a5fa',
                          whiteSpace: 'nowrap',
                          maxWidth: 60,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {lang === 'bn' ? sbn : METRO_STATIONS_EN[i]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 12 : 24,
            flexWrap: 'wrap',
            paddingTop: 8,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {[
            { label: T(lang, 'ভাড়া', 'Fare'), value: '৳২০–১০০' },
            { label: T(lang, 'সময়', 'Hours'), value: '7:10AM – 9:40PM' },
            { label: '', value: T(lang, 'সময়মতো চলছে', 'On time, no delays') },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {item.label && (
                <span style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                  {item.label}
                </span>
              )}
              {i === 2 && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              )}
              <span style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Saved Routes ─────────────────────────────────────────────────────────────

const SAVED = [
  { label: { bn: 'বাসা → অফিস', en: 'HOME → WORK' }, route: 'Banani → Karwan Bazar', time: '28 min · ৳ 40', colorKey: 'primary' as const },
  { label: { bn: 'অফিস → বাসা', en: 'WORK → HOME' }, route: 'Karwan Bazar → Banani', time: '35 min · ৳ 40', colorKey: 'accent' as const },
  { label: { bn: 'সপ্তাহান্তে', en: 'WEEKENDS' }, route: 'Banani → Dhanmondi 32', time: '42 min · ৳ 60', colorKey: 'amber' as const },
  { label: { bn: 'বাবার বাসা', en: "DAD'S HOUSE" }, route: 'Banani → Mirpur DOHS', time: '55 min · ৳ 75', colorKey: 'primaryDeep' as const },
];

function SavedRoutes({ tk, lang, isMobile }: { tk: Tokens; lang: Lang; isMobile: boolean }) {
  const getColor = (key: string) => (tk as Record<string, string>)[key] ?? tk.primary;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'none' : 'repeat(4, minmax(0, 1fr))',
        gap: 12,
        overflowX: isMobile ? 'auto' : 'hidden',
        paddingBottom: isMobile ? 4 : 0,
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        width: '100%',
      }}
    >
      {SAVED.map((s, i) => (
        <div
          key={i}
          style={{
            background: tk.panel,
            border: `1px solid ${tk.line}`,
            borderRadius: 16,
            padding: '14px 16px',
            minWidth: isMobile ? 180 : 0,
            flex: isMobile ? '0 0 auto' : undefined,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: getColor(s.colorKey),
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: SANS,
                fontSize: 10,
                fontWeight: 700,
                color: getColor(s.colorKey),
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              {T(lang, s.label.bn, s.label.en)}
            </span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: tk.text }}>
            {s.route}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint }}>
            {s.time}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Popular Routes ───────────────────────────────────────────────────────────

const POPULAR_ROUTES = [
  {
    code: 'GL',
    name: { en: 'Green Line', bn: 'গ্রীন লাইন পরিবহন' },
    path: 'Gulshan 2→Badda→Rampura→Malibagh→Motijheel',
    fare: '৳60',
    time: '48min',
    stops: '12 stops',
    tag: 'AC',
    dots: ['#006a4e', '#10b981'],
    route: 'bus-detail',
  },
  {
    code: 'HF',
    name: { en: 'Hanif Enterprise', bn: 'হানিফ এন্টারপ্রাইজ' },
    path: 'Uttara 7→Airport→Banani→Farmgate→Paltan',
    fare: '৳75',
    time: '1h15min',
    stops: '18 stops',
    tag: '',
    dots: ['#d92644', '#ff7a3a'],
    route: 'bus-detail',
  },
  {
    code: 'SH',
    name: { en: 'Shyamoli NR Travels', bn: 'শ্যামলী এনআর' },
    path: 'Sayedabad→Jatrabari→Kachpur→Chittagong',
    fare: '৳680',
    time: '6h30min',
    stops: '4 stops',
    tag: 'AC · Intercity',
    dots: ['#b46a13', '#f7b955'],
    route: 'bus-detail',
  },
  {
    code: 'BR',
    name: { en: 'BRTC Articulated', bn: 'বিআরটিসি' },
    path: 'Motijheel→Shahbag→Farmgate→Mohakhali→Abdullahpur',
    fare: '৳45',
    time: '52min',
    stops: '14 stops',
    tag: '',
    dots: ['#0c8a62', '#1a3a8b'],
    route: 'bus-detail',
  },
  {
    code: 'PR',
    name: { en: 'Projapoti Paribahan', bn: 'প্রজাপতি' },
    path: 'Mirpur 12→Shyamoli→College Gate→Azimpur→Sadarghat',
    fare: '৳30',
    time: '45min',
    stops: '11 stops',
    tag: '',
    dots: ['#2c5e1a', '#7eb344'],
    route: 'bus-detail',
  },
];

function PopularRoutes({
  tk,
  lang,
  onNav,
}: {
  tk: Tokens;
  lang: Lang;
  onNav: (r: string) => void;
}) {
  return (
    <div
      style={{
        background: tk.panel,
        border: `1px solid ${tk.line}`,
        borderRadius: 18,
        overflow: 'hidden',
      }}
    >
      {POPULAR_ROUTES.map((r, i) => (
        <div
          key={i}
          onClick={() => onNav(r.route)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '13px 16px',
            borderBottom: i < POPULAR_ROUTES.length - 1 ? `1px solid ${tk.line}` : 'none',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = tk.panelMuted;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }}
        >
          {/* Brand dot(s) */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${r.dots[0]}, ${r.dots[1]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 800,
              color: 'white',
              flexShrink: 0,
            }}
          >
            {r.code}
          </div>

          {/* Route info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span
                style={{
                  fontFamily: lang === 'bn' ? BEN : SANS,
                  fontSize: 13,
                  fontWeight: 600,
                  color: tk.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {lang === 'bn' ? r.name.bn : r.name.en}
              </span>
              {r.tag && (
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 10,
                    fontWeight: 600,
                    color: tk.amber,
                    background: tk.amberSoft,
                    borderRadius: 5,
                    padding: '1px 5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.tag}
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 11,
                color: tk.textFaint,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {r.path}
            </div>
          </div>

          {/* Meta */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: 700, color: tk.text }}>
              {r.fare}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 10, color: tk.textFaint }}>
              {r.time} · {r.stops}
            </div>
          </div>

          <Icon.arrowR s={16} />
        </div>
      ))}
    </div>
  );
}

// ─── AI Card ──────────────────────────────────────────────────────────────────

const AI_CHIPS = [
  "How much to Cox's Bazar?",
  'Airport → Farmgate',
  'Sadarghat launch times',
];

function AICard({ tk, lang, onNav }: { tk: Tokens; lang: Lang; onNav: (r: string) => void }) {
  return (
    <div
      onClick={() => onNav('ai')}
      style={{
        background: 'linear-gradient(135deg, #7c3aed, #5b21b6, #4338ca)',
        borderRadius: 18,
        padding: '18px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blob */}
      <div
        style={{
          position: 'absolute',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          top: -50,
          right: -40,
          animation: 'kjpulse 3.5s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Icon.spark s={18} />
        </div>
        <span style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 15, fontWeight: 700, color: 'white' }}>
          {T(lang, 'AI সহায়ক', 'AI Assistant')}
        </span>
        <span
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.9)',
            borderRadius: 999,
            padding: '2px 8px',
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          Beta
        </span>
      </div>

      <p
        style={{
          margin: '0 0 12px',
          fontFamily: lang === 'bn' ? BEN : SANS,
          fontSize: 13,
          color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.5,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {T(
          lang,
          "বাংলায় জিজ্ঞেস করুন — 'গুলশান থেকে মতিঝিল কোন বাস যায়?'",
          "Ask in Bangla or English — 'Which bus goes from Gulshan to Motijheel?'",
        )}
      </p>

      {/* Suggestion chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, position: 'relative', zIndex: 1 }}>
        {AI_CHIPS.map((c) => (
          <span
            key={c}
            style={{
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 999,
              padding: '5px 11px',
              fontFamily: SANS,
              fontSize: 11,
              color: 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* Input bar */}
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, color: 'rgba(255,255,255,0.4)', flex: 1 }}>
          {T(lang, 'যেকোনো প্রশ্ন করুন...', 'Ask anything...')}
        </span>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Icon.arrowR s={16} />
        </div>
      </div>
    </div>
  );
}

// ─── Emergency Grid ───────────────────────────────────────────────────────────

const EMERGENCY = [
  { label: { bn: 'পুলিশ', en: 'Police' }, number: '999', color: 'accent' as const },
  { label: { bn: 'অ্যাম্বুলেন্স', en: 'Ambulance' }, number: '199', color: 'accent' as const },
  { label: { bn: 'ফায়ার সার্ভিস', en: 'Fire service' }, number: '102', color: 'amber' as const },
  { label: { bn: 'হাইওয়ে', en: 'Highway' }, number: '+880-2', color: 'primary' as const },
];

function EmergencyGrid({ tk, lang }: { tk: Tokens; lang: Lang }) {
  const getColor = (c: 'accent' | 'amber' | 'primary') => {
    if (c === 'accent') return { bg: tk.accentSoft, fg: tk.accent };
    if (c === 'amber') return { bg: tk.amberSoft, fg: tk.amber };
    return { bg: tk.primarySoft, fg: tk.primary };
  };

  return (
    <div
      style={{
        background: tk.panel,
        border: `1px solid ${tk.line}`,
        borderRadius: 18,
        padding: 16,
      }}
    >
      <div
        style={{
          fontFamily: lang === 'bn' ? BEN : SANS,
          fontSize: 13,
          fontWeight: 700,
          color: tk.text,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Icon.sos s={16} />
        {T(lang, 'জরুরি নম্বর', 'Emergency Numbers')}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        {EMERGENCY.map((e, i) => {
          const { bg, fg } = getColor(e.color);
          return (
            <a
              key={i}
              href={`tel:${e.number}`}
              style={{
                background: bg,
                border: `1px solid ${fg}33`,
                borderRadius: 12,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontFamily: lang === 'bn' ? BEN : SANS,
                  fontSize: 11,
                  color: fg,
                  fontWeight: 600,
                }}
              >
                {T(lang, e.label.bn, e.label.en)}
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 18,
                  fontWeight: 800,
                  color: fg,
                }}
              >
                {e.number}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── AdIntentRow (sponsored chips) ───────────────────────────────────────────

function AdIntentRow({ tk, lang }: { tk: Tokens; lang: Lang }) {
  const chips = [
    T(lang, 'এয়ারপোর্ট থেকে বাস', 'Bus from Airport'),
    T(lang, 'মতিঝিল রুট', 'Motijheel routes'),
    T(lang, 'ঢাকা-চট্টগ্রাম', 'Dhaka-Chittagong'),
    T(lang, 'গুলশান → বনানী', 'Gulshan → Banani'),
    T(lang, 'কক্সবাজার বাস', 'Cox\'s Bazar bus'),
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 2,
      }}
    >
      <span
        style={{
          fontFamily: SANS,
          fontSize: 10,
          fontWeight: 600,
          color: tk.textFaint,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {T(lang, 'স্পনসর', 'Sponsored')}
      </span>
      {chips.map((c, i) => (
        <button
          key={i}
          style={{
            background: tk.panelMuted,
            border: `1px solid ${tk.line}`,
            borderRadius: 999,
            padding: '6px 13px',
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 12,
            fontWeight: 500,
            color: tk.textDim,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

// NativeAdSection and KJFooter imported from components above

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({
  tk,
  lang,
  title,
  sub,
  action,
  onAction,
}: {
  tk: Tokens;
  lang: Lang;
  title: string;
  sub?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <h2
          style={{
            margin: 0,
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 18,
            fontWeight: 800,
            color: tk.text,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>
        {sub && (
          <p style={{ margin: '2px 0 0', fontFamily: SANS, fontSize: 12, color: tk.textFaint }}>
            {sub}
          </p>
        )}
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            background: 'none',
            border: `1px solid ${tk.line}`,
            borderRadius: 999,
            padding: '5px 12px',
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 12,
            fontWeight: 500,
            color: tk.primary,
            cursor: 'pointer',
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

// ─── PWA Offline Card ─────────────────────────────────────────────────────────

function OfflinePWACard({ tk, lang }: { tk: Tokens; lang: Lang }) {
  return (
    <div
      style={{
        background: tk.panel,
        border: `1px solid ${tk.line}`,
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: tk.primarySoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: tk.primary,
          flexShrink: 0,
        }}
      >
        <Icon.wifi s={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 2 }}>
          {T(lang, 'অফলাইনেও কাজ করে', 'Works offline too')}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint }}>
          {T(lang, 'PWA হিসেবে ইনস্টল করুন', 'Install as PWA')}
        </div>
      </div>
      <button
        style={{
          background: tk.primary,
          color: tk.primaryInk,
          border: 'none',
          borderRadius: 10,
          padding: '6px 12px',
          fontFamily: lang === 'bn' ? BEN : SANS,
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flexShrink: 0,
        }}
      >
        <Icon.download s={13} />
        {T(lang, 'ইনস্টল', 'Install')}
      </button>
    </div>
  );
}

// ─── HomePage (main export) ───────────────────────────────────────────────────

export function HomePage({
  theme,
  device,
  lang,
  route,
  onNav,
  onBack,
  canBack,
  onLang,
  onTheme,
  onMenu,
}: HomePageProps) {
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const font = lang === 'bn' ? BEN : SANS;
  const [homeSearchMode, setHomeSearchMode] = useState<SearchModeId>('bus');

  const section: React.CSSProperties = {
    padding: isMobile ? '0 16px' : '0 40px',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',  // prevent any child from overflowing the section
  };

  return (
    <div
      className="kj-screen"
      style={{
        minHeight: '100vh',
        background: tk.pageBg,
        color: tk.text,
        fontFamily: font,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Futuristic background */}
      <div className="kj-future-bg" />

      {/* TopBar rendered in KoyJaboApp (outside .kj-screen transform) */}
      {/* Spacer for fixed TopBar */}
      <div style={{ height: isMobile ? 52 : 60, flexShrink: 0 }}/>

      {/* Scrollable content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: isMobile ? 80 : 32, paddingTop: 24, position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <div style={section}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1.3fr 0.7fr',
              gap: 20,
              alignItems: 'start',
            }}
          >
            {/* Left: greeting + SearchPanel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, overflow: 'hidden' }}>
              <div>
                {/* Location bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: tk.textFaint }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: tk.accent, animation: 'kjpulse 1.5s ease-in-out infinite', display: 'inline-block' }}/>
                    {T(lang, 'লাইভ আবহাওয়া ও ট্রাফিক চালু নেই', 'Live weather and traffic unavailable')}
                  </span>
                </div>
                <h1
                  style={{
                    margin: '0 0 8px',
                    fontFamily: BEN,
                    fontSize: isMobile ? 26 : 38,
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: lang === 'bn' ? -0.5 : -1,
                    color: tk.text,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    textWrap: 'balance' as any,
                  }}
                >
                  {T(lang, 'কোথায় যেতে চান, মেজবাউর?', 'Where are you headed, Mejbaur?')}
                </h1>
                <p
                  style={{
                    margin: '0 0 0',
                    fontFamily: BEN,
                    fontSize: isMobile ? 14 : 15,
                    color: tk.textDim,
                    lineHeight: 1.55,
                    maxWidth: 560,
                    wordBreak: 'break-word',
                    textWrap: 'pretty' as any,
                  }}
                >
                  {T(lang, '২,৪০০+ ঢাকা লোকাল বাস, মেট্রো রেল ও বাংলাদেশের ৬৪ জেলার সব রুট — অফলাইনেও কাজ করে।', '2,400+ Dhaka bus routes, Metro Rail and intercity travel across all 64 districts — works offline too.')}
                </p>
              </div>
              <SearchPanel
                tk={tk}
                lang={lang}
                isMobile={isMobile}
                onNav={onNav as (r: string, p?: Record<string, string>) => void}
                activeMode={homeSearchMode}
                setActiveMode={setHomeSearchMode}
              />
            </div>

            {/* Right: desktop only — minWidth:0 prevents grid overflow */}
            {!isMobile && (
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <TravelHeroScene tk={tk} height={280} />
                <OfflinePWACard tk={tk} lang={lang} />
              </div>
            )}
          </div>

          {/* Mobile hero scene */}
          {isMobile && (
            <div style={{ marginTop: 20 }}>
              <TravelHeroScene tk={tk} height={200} />
            </div>
          )}
        </div>

        {/* ── Ad: leaderboard/mob-banner ── */}
        <div style={{ ...section, display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>

        {/* ── Mode tiles ── */}
        <div style={section}>
          <SectionHeader
            tk={tk}
            lang={lang}
            title={T(lang, 'কী খুঁজছেন?', 'How are you traveling?')}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
              minWidth: 0,
              width: '100%',
            }}
          >
            {TILES.map((tile) => (
              <ModeTile
                key={tile.route}
                tile={tile}
                lang={lang}
                onClick={() => {
                  if (tile.route === 'ai') {
                    onNav(tile.route);
                    return;
                  }
                  setHomeSearchMode(tile.mode);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Ad strip ── */}
        <div style={{ ...section, display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>

        {/* ── AdIntentRow ── */}
        <div style={section}>
          <AdIntentRow tk={tk} lang={lang} />
        </div>

        {/* ── KoyJaboStory ── */}
        <div style={section}>
          <SectionHeader
            tk={tk}
            lang={lang}
            title={T(lang, 'KoyJabo কীভাবে কাজ করে?', 'How does KoyJabo work?')}
          />
          <KoyJaboStory tk={tk} lang={lang} onNav={onNav} />
        </div>

        {/* ── Ad strip ── */}
        <div style={{ ...section, display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>

        {/* ── Metro Live ── */}
        <div style={section}>
          <SectionHeader
            tk={tk}
            lang={lang}
            title={T(lang, 'মেট্রো লাইভ', 'Metro Live')}
            action={T(lang, 'সব স্টেশন', 'All stations')}
            onAction={() => onNav('metro-hub')}
          />
          <MetroLiveStrip tk={tk} lang={lang} isMobile={isMobile} />
        </div>

        {/* ── Saved Routes ── */}
        <div style={section}>
          <SectionHeader
            tk={tk}
            lang={lang}
            title={T(lang, 'সেভ করা রুট', 'Saved routes')}
            action={T(lang, 'সব দেখুন', 'See all')}
            onAction={() => onNav('favorites')}
          />
          <SavedRoutes tk={tk} lang={lang} isMobile={isMobile} />
        </div>

        {/* ── Ad strip ── */}
        <div style={{ ...section, display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>

        {/* ── Popular routes + AI card + mid-rect + Emergency (2-col desktop) ── */}
        <div style={section}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
              gap: 20,
              alignItems: 'start',
            }}
          >
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
              <div>
                <SectionHeader
                  tk={tk}
                  lang={lang}
                  title={T(lang, 'জনপ্রিয় রুট', 'Popular routes')}
                  action={T(lang, 'সব রুট', 'All routes')}
                  onAction={() => onNav('bus-hub')}
                />
                <PopularRoutes tk={tk} lang={lang} onNav={onNav} />
              </div>
              <AICard tk={tk} lang={lang} onNav={onNav} />
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AdSlot tk={tk} lang={lang} kind="mid-rect" />
              <EmergencyGrid tk={tk} lang={lang} />
            </div>
          </div>
        </div>

        {/* ── NativeAdSection ── */}
        <div style={section}>
          <NativeAdSectionReal tk={tk} lang={lang} isMobile={isMobile}/>
        </div>

        {/* ── Footer ── */}
        <KJFooterComponent tk={tk} lang={lang} isMobile={isMobile} onNav={onNav}/>
      </div>

      {/* Mobile: anchor ad above tab bar */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 64,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 6,
          }}
        >
          <AdSlot tk={tk} lang={lang} kind="anchor" sticky />
        </div>
      )}

      {/* MobileTabBar rendered in KoyJaboApp */}
    </div>
  );
}
