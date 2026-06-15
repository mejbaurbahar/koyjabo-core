import HowKoyJaboHelps from './HowKoyJaboHelps';
import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  ArrowLeftRight,
  MapPin,
  Zap,
  Star,
  Bus,
  Navigation,
  Info,
  LogIn,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { BUS_DATA, STATIONS, METRO_STATIONS } from '../constants';
import { useAuth } from '../src/contexts/AuthContext';
import { Bus3D } from './design/Vehicles3D';
import SponsoredAdSlot from './SponsoredAdSlot';

interface LocalBusHubProps {
  onBack: () => void;
  language: 'en' | 'bn';
  initialFromId?: string;
  initialToId?: string;
  onBusSelect?: (bus: import('../types').BusRoute) => void;
}

const lbl = (language: 'en' | 'bn', en: string, bn: string) =>
  language === 'bn' ? bn : en;

interface NearbyBus {
  name: string;
  mins: number;
  dist: string;
  status: 'green' | 'yellow' | 'red';
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const NEARBY_BUSES: NearbyBus[] = [
  { name: 'GL #6', mins: 2, dist: '400m', status: 'green' },
  { name: 'BRTC Double', mins: 5, dist: '900m', status: 'green' },
  { name: 'Hanif #11', mins: 8, dist: '1.4km', status: 'yellow' },
  { name: 'Projapoti', mins: 12, dist: '2.1km', status: 'red' },
];

const POPULAR_ROUTES = [
  { brand: ['#006a4e', '#10b981', 'GL'] as [string, string, string], name_en: 'Green Line · Route 6', name_bn: 'গ্রীন লাইন · রুট ৬', route_en: 'Gulshan ↔ Motijheel', route_bn: 'গুলশান ↔ মতিঝিল', fare: '60', dur: '42m', stops: 9, ac: true, rating: 4.6, reviews: 587 },
  { brand: ['#d92644', '#ff7a3a', 'HF'] as [string, string, string], name_en: 'Hanif · Route 11', name_bn: 'হানিফ · রুট ১১', route_en: 'Uttara ↔ Paltan', route_bn: 'উত্তরা ↔ পল্টন', fare: '50', dur: '1h 10m', stops: 18, ac: false, rating: 4.1, reviews: 412 },
  { brand: ['#0c8a62', '#1a3a8b', 'BR'] as [string, string, string], name_en: 'BRTC Double Decker', name_bn: 'বিআরটিসি দোতলা', route_en: 'Motijheel ↔ Gabtoli', route_bn: 'মতিঝিল ↔ গাবতলী', fare: '45', dur: '52m', stops: 14, ac: true, rating: 4.3, reviews: 298 },
  { brand: ['#2c5e1a', '#7eb344', 'PR'] as [string, string, string], name_en: 'Projapoti Paribahan', name_bn: 'প্রজাপতি পরিবহন', route_en: 'Mirpur ↔ Sadarghat', route_bn: 'মিরপুর ↔ সদরঘাট', fare: '30', dur: '45m', stops: 11, ac: false, rating: 3.9, reviews: 187 },
  { brand: ['#7c2d12', '#f59e0b', 'AB'] as [string, string, string], name_en: 'Anabil Super', name_bn: 'অনাবিল সুপার', route_en: 'Gulistan ↔ Savar', route_bn: 'গুলিস্তান ↔ সাভার', fare: '70', dur: '1h 30m', stops: 22, ac: false, rating: 3.8, reviews: 134 },
];

const OPERATORS = [
  { op: 'Green Line', init: 'GL', grad: ['#006a4e', '#10b981'] as [string, string] },
  { op: 'BRTC', init: 'BR', grad: ['#1a3a8b', '#0c8a62'] as [string, string] },
  { op: 'Hanif', init: 'HF', grad: ['#d92644', '#ff7a3a'] as [string, string] },
  { op: 'Shyamoli', init: 'SH', grad: ['#b46a13', '#f7b955'] as [string, string] },
  { op: 'Projapoti', init: 'PR', grad: ['#2c5e1a', '#7eb344'] as [string, string] },
  { op: 'Anabil', init: 'AB', grad: ['#7c2d12', '#f59e0b'] as [string, string] },
];

const BUS_TYPES = [
  { en: 'Local', bn: 'লোকাল', icon: '🚌', fare: '৳10–30', desc: 'Non-AC · all stops', descBn: 'নন-এসি · সব স্টপে থামে', blob: '#10b981' },
  { en: 'AC Seating', bn: 'এসি সিটিং', icon: '❄️', fare: '৳40–80', desc: 'Comfortable · fewer stops', descBn: 'আরামদায়ক · কম স্টপ', blob: '#3b82f6' },
  { en: 'Double Decker', bn: 'ডাবল ডেকার', icon: '🚍', fare: '৳30–60', desc: 'Upper deck view', descBn: 'উপরের ডেকে দৃশ্য', blob: '#f59e0b' },
  { en: 'Gulshan Chaka', bn: 'গুলশান চাকা', icon: '⚡', fare: '৳25', desc: 'Express · woman-friendly', descBn: 'এক্সপ্রেস · নারীবান্ধব', blob: '#ec4899' },
];

const SORT_CHIPS = [
  { id: 'fastest', en: 'Fastest', bn: 'দ্রুততম', icon: '⚡' },
  { id: 'cheapest', en: 'Cheapest', bn: 'সস্তা', icon: '৳' },
  { id: 'ac', en: 'AC', bn: 'এসি', icon: '❄️' },
  { id: 'toilet', en: 'Toilet', bn: 'টয়লেট', icon: '🚻' },
  { id: 'less_crowd', en: 'Less crowd', bn: 'কম ভিড়', icon: '👥' },
];

const FILTER_CHIPS = [
  { id: 'name', en: 'Name', bn: 'নাম', color: '#10b981' },
  { id: 'route', en: 'Route', bn: 'রুট', color: '#3b82f6' },
  { id: 'operator', en: 'Operator', bn: 'অপারেটর', color: '#8b5cf6' },
];

const LocalBusHub: React.FC<LocalBusHubProps> = ({ onBack, language, initialFromId, initialToId, onBusSelect }) => {
  const L = (en: string, bn: string) => lbl(language, en, bn);
  const { user } = useAuth();

  const getStationName = (id: string) => {
    const s = (STATIONS as any)[id] || (METRO_STATIONS as any)[id];
    return language === 'bn' ? (s?.bnName || s?.name || id) : (s?.name || id);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [fromField, setFromField] = useState(() => initialFromId ? getStationName(initialFromId) : '');
  const [toField, setToField] = useState(() => initialToId ? getStationName(initialToId) : '');
  const [activeFilter, setActiveFilter] = useState<string>('name');
  const [activeSort, setActiveSort] = useState<string | null>(null);

  const [nearbyBuses, setNearbyBuses] = useState<NearbyBus[]>(NEARBY_BUSES);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: userLat, longitude: userLng } = pos.coords;
        const nearStations: { id: string; dist: number }[] = [];
        const allStations = STATIONS as Record<string, { id: string; lat?: number; lng?: number; name: string }>;
        for (const sid of Object.keys(allStations)) {
          const st = allStations[sid];
          if (!st.lat || !st.lng) continue;
          const d = getDistanceKm(userLat, userLng, st.lat, st.lng);
          if (d < 3) nearStations.push({ id: sid, dist: d });
        }
        nearStations.sort((a, b) => a.dist - b.dist);
        const nearIds = new Set(nearStations.slice(0, 5).map(s => s.id));

        const busMap: Map<string, number> = new Map();
        for (const bus of BUS_DATA as any[]) {
          if (!bus.stops) continue;
          let minDist = Infinity;
          for (const stop of bus.stops) {
            if (nearIds.has(stop)) {
              const st = allStations[stop];
              if (st?.lat && st?.lng) {
                const d = getDistanceKm(userLat, userLng, st.lat, st.lng);
                if (d < minDist) minDist = d;
              }
            }
          }
          if (minDist < Infinity) busMap.set(bus.name || bus.id, minDist);
        }

        const sorted = Array.from(busMap.entries()).sort((a, b) => a[1] - b[1]).slice(0, 4);
        if (sorted.length > 0) {
          setNearbyBuses(sorted.map(([name, dist]) => ({
            name,
            mins: Math.max(1, Math.round(dist * 3)),
            dist: dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`,
            status: dist < 0.5 ? 'green' : dist < 1.5 ? 'yellow' : 'red',
          })));
        }
        setLocationLoading(false);
      },
      () => {
        setLocationError(L('Location unavailable', 'লোকেশন পাওয়া যায়নি'));
        setLocationLoading(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const hasFromTo = !!(initialFromId && initialToId);
    const hasQuery = q.length >= 1;

    if (!hasFromTo && !hasQuery) return null;

    return (BUS_DATA as any[]).filter(bus => {
      // Name / route-string / bnName search
      const nameMatch = !hasQuery ||
        (bus.name || '').toLowerCase().includes(q) ||
        (bus.bnName || '').toLowerCase().includes(q) ||
        (bus.routeString || '').toLowerCase().includes(q) ||
        (bus.id || '').toLowerCase().includes(q);

      // Stop-to-stop route filter
      const routeMatch = !hasFromTo || (() => {
        const fromIdx = (bus.stops as string[]).indexOf(initialFromId!);
        const toIdx   = (bus.stops as string[]).indexOf(initialToId!);
        return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
      })();

      return nameMatch && routeMatch;
    }) as typeof BUS_DATA;
  }, [initialFromId, initialToId, searchQuery]);

  const handleSwap = () => {
    setFromField(toField);
    setToField(fromField);
  };

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">

      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="font-bengali font-bold text-base text-kj-text">
            {L('Local Bus', 'লোকাল বাস')}
          </span>
          <p className="text-[11px] text-kj-text-faint leading-tight font-sans">
            {L('Dhaka city bus network', 'ঢাকা সিটি বাস নেটওয়ার্ক')}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 py-5 space-y-5 w-full max-w-[1200px] mx-auto">

        {/* Hero section */}
        <div
          className="rounded-[24px] overflow-hidden relative text-white shadow-kj-lg"
          style={{
            background: 'linear-gradient(135deg, #006a4e 0%, #10b981 60%, #fbbf24 100%)',
            minHeight: 240,
            padding: '20px 20px 0',
          }}
        >
          <div className="absolute -right-12 -top-14 w-64 h-64 rounded-full pointer-events-none kj-anim-pulse" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="absolute left-1/3 -bottom-20 w-52 h-52 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="font-sans text-[11px] font-bold uppercase tracking-[1.4px] opacity-85">✦ KoyJabo · bus</span>
              <h1 className="font-bengali font-bold text-white leading-[1.1] tracking-tight text-balance mt-1.5 mb-2" style={{ fontSize: 26 }}>
                {L('Every Dhaka bus · in one app', 'ঢাকার সব বাস · এক অ্যাপে')}
              </h1>
              <p className="font-bengali text-[13px] opacity-90 leading-relaxed max-w-[380px]">
                {L('2,412 live routes, 1,000+ stops, 140+ operators — works offline too.', '২,৪১২টি লাইভ রুট, ১,০০০+ স্টপ, ১৪০+ অপারেটর — অফলাইনেও কাজ করে।')}
              </p>
              {/* Stat strip */}
              <div className="flex gap-4 mt-4 flex-wrap">
                {[
                  { v: '2,412', l: L('Routes', 'রুট') },
                  { v: '1,043', l: L('Stops', 'স্টপ') },
                  { v: '140+', l: L('Operators', 'অপারেটর') },
                  { v: '★ 4.4', l: L('Avg rating', 'গড় রেটিং') },
                ].map(s => (
                  <div key={s.l} style={{ minWidth: 60 }}>
                    <div className="font-sans font-extrabold text-[18px] tracking-tight leading-none">{s.v}</div>
                    <div className="font-sans text-[9px] font-bold uppercase tracking-[1.2px] opacity-85 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 self-end" style={{ marginBottom: -10 }}>
              <Bus3D size={160} palette={['#ffffff', 'rgba(255,255,255,0.45)', '#04130d', '#fbbf24']} />
            </div>
          </div>
        </div>

        {/* Search card */}
        <div className="dc-card rounded-[22px] p-5 space-y-4">

          {/* Name search row */}
          <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-3 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white shrink-0 kj-anim-glow"
              style={{ background: 'linear-gradient(135deg, #006a4e, #10b981)' }}
            >
              <Search className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
                {L('Search by name or number', 'নাম বা নম্বর দিয়ে খুঁজুন')}
              </p>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={L(
                  'e.g. Green Line, Raida #7, BRTC Double, Route 6…',
                  'যেমন: গ্রিন লাইন, রাইদা #৭, বিআরটিসি ডাবল, রুট ৬…'
                )}
                className="w-full bg-transparent text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none mt-0.5 font-bengali"
              />
            </div>
            <div className="hidden sm:flex gap-1 shrink-0">
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id)}
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide font-sans transition-all"
                  style={{
                    background: activeFilter === chip.id ? `${chip.color}33` : `${chip.color}18`,
                    color: chip.color,
                    outline: activeFilter === chip.id ? `1px solid ${chip.color}55` : 'none',
                  }}
                >
                  {L(chip.en, chip.bn)}
                </button>
              ))}
            </div>
          </div>

          {/* From / To grid */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--kj-primary-soft)' }}>
                  <MapPin className="w-3 h-3 text-kj-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
                  {L('From', 'কোথা থেকে')}
                </span>
              </div>
              <input
                type="text"
                value={fromField}
                onChange={(e) => setFromField(e.target.value)}
                placeholder={L('Gulshan 1', 'গুলশান ১')}
                className="w-full bg-transparent text-sm font-semibold text-kj-text placeholder:text-kj-text-faint focus:outline-none font-bengali"
              />
            </div>

            <button
              onClick={handleSwap}
              className="w-9 h-9 rounded-full border border-kj-line bg-kj-panel flex items-center justify-center text-kj-text-dim hover:border-kj-primary/50 hover:text-kj-primary active:scale-90 transition-all mx-auto shrink-0"
              aria-label={L('Swap from and to', 'অদলবদল করুন')}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--kj-accent-soft)' }}>
                  <MapPin className="w-3 h-3 text-kj-accent" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
                  {L('To', 'কোথায়')}
                </span>
              </div>
              <input
                type="text"
                value={toField}
                onChange={(e) => setToField(e.target.value)}
                placeholder={L('Motijheel', 'মতিঝিল')}
                className="w-full bg-transparent text-sm font-semibold text-kj-text placeholder:text-kj-text-faint focus:outline-none font-bengali"
              />
            </div>
          </div>

          {/* Find Bus button */}
          <button
            className="w-full h-12 font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all font-bengali text-kj-primary-ink"
            style={{
              background: 'linear-gradient(135deg, #006a4e, #10b981)',
              boxShadow: '0 8px 22px -10px #10b981',
            }}
          >
            <Search className="w-4 h-4" />
            {L('Find Bus', 'বাস খুঁজুন')}
          </button>

          {/* Filter sort chips */}
          <div className="flex gap-2 flex-wrap">
            {SORT_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveSort(activeSort === chip.id ? null : chip.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all font-sans border ${
                  activeSort === chip.id
                    ? 'text-kj-primary-ink border-kj-primary'
                    : 'bg-kj-chip-bg text-kj-chip-text border-kj-line hover:border-kj-primary/40'
                }`}
                style={activeSort === chip.id ? {
                  background: 'linear-gradient(135deg, #006a4e, #10b981)',
                  boxShadow: '0 4px 12px -4px #10b981',
                } : undefined}
              >
                <span>{chip.icon}</span>
                {L(chip.en, chip.bn)}
              </button>
            ))}
          </div>
        </div>

        {/* Search results — shown when from/to provided from home search */}
        {searchResults !== null && (
          <section>
            {!user ? (
              <div className="dc-card rounded-2xl p-6 text-center border border-kj-primary/30">
                <LogIn size={32} className="mx-auto text-kj-primary mb-3" />
                <p className="font-bengali font-bold text-[15px] text-kj-text mb-1">
                  {L('Login required', 'লগইন প্রয়োজন')}
                </p>
                <p className="font-bengali text-sm text-kj-text-dim mb-4">
                  {L('Please login to search bus routes', 'বাস রুট খুঁজতে প্রথমে লগইন করুন')}
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-kj-primary text-kj-primary-ink rounded-xl text-sm font-bold active:scale-95 transition-all"
                  onClick={(e) => { e.preventDefault(); window.location.hash = 'login'; }}
                >
                  <LogIn size={14} />
                  {L('Login now', 'এখনই লগইন করুন')}
                </a>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bengali font-bold text-[15px] text-kj-text">
                    {searchResults.length > 0
                      ? L(`${searchResults.length} buses found`, `${searchResults.length}টি বাস পাওয়া গেছে`)
                      : L('No buses found', 'কোনো বাস পাওয়া যায়নি')}
                  </h3>
                  <span className="text-[11px] text-kj-text-faint font-sans">
                    {searchQuery.trim() ? (L('Search: ', 'খুঁজছেন: ') + searchQuery) : ((fromField || L('From', 'থেকে')) + ' → ' + (toField || L('To', 'পর্যন্ত')))}
                  </span>
                </div>
                {searchResults.length === 0 ? (
                  <div className="dc-card rounded-2xl p-6 text-center">
                    <Bus size={32} className="mx-auto text-kj-text-faint mb-2" />
                    <p className="font-bengali text-sm text-kj-text-dim">
                      {L('No direct buses between these stops. Try different stations.', 'এই স্টপের মধ্যে কোনো সরাসরি বাস নেই। অন্য স্টেশন চেষ্টা করুন।')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.slice(0, 15).map((bus) => {
                      const initials = bus.name.slice(0, 2).toUpperCase();
                      const fromIdx = bus.stops.indexOf(initialFromId!);
                      const toIdx = bus.stops.indexOf(initialToId!);
                      const stopsCount = Math.max(1, toIdx - fromIdx);
                      return (
                        <button
                          key={bus.id}
                          type="button"
                          onClick={() => onBusSelect?.(bus)}
                          className="dc-card rounded-2xl p-3.5 flex items-center gap-3 border border-kj-primary/20 w-full text-left hover:border-kj-primary/60 active:scale-[0.99] transition-all cursor-pointer"
                          style={{ boxShadow: '0 0 0 1px rgba(0,245,255,0.08)' }}
                        >
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: bus.color ? `linear-gradient(135deg, ${bus.color}, #0070ad)` : 'linear-gradient(135deg, #006a4e, #10b981)' }}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bengali font-semibold text-[14px] text-kj-text truncate">
                                {language === 'bn' ? (bus.bnName || bus.name) : bus.name}
                              </span>
                              {bus.type === 'AC' && <span className="px-1.5 py-0.5 bg-kj-primary-soft text-kj-primary-deep text-[10px] rounded-full font-semibold shrink-0">AC</span>}
                            </div>
                            <p className="text-[11px] text-kj-text-faint mt-0.5">
                              {stopsCount} {L('stops between', 'স্টপ মাঝে')} · {bus.type}
                            </p>
                          </div>
                          <div className="text-right shrink-0 flex items-center gap-2">
                            <div>
                              <div className="font-sans font-bold text-[14px] text-kj-primary">
                                ৳ {Math.max(10, Math.round(stopsCount * 3.5))}
                              </div>
                              <div className="text-[10px] text-kj-text-faint">{L('approx', 'আনু.')}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-kj-text-faint shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Main two-column layout — shown when no search results mode */}
        {searchResults === null && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">

            {/* LEFT COLUMN — Popular routes */}
            <div className="space-y-4">
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-kj-amber" fill="currentColor" />
                    <h2 className="font-bengali font-bold text-[15px] text-kj-text">
                      {L('Popular bus routes', 'জনপ্রিয় বাস রুট')}
                    </h2>
                  </div>
                  <button className="flex items-center gap-0.5 text-xs font-semibold text-kj-primary font-bengali">
                    {L('See all', 'সব দেখুন')}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {POPULAR_ROUTES.map((r) => (
                    <div
                      key={r.name_en}
                      className="dc-card rounded-2xl p-3.5 flex items-center gap-3 border border-kj-line hover:border-kj-primary/40 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      {/* Brand badge */}
                      <div
                        className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${r.brand[0]}, ${r.brand[1]})` }}
                      >
                        {r.brand[2]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bengali text-sm font-semibold text-kj-text truncate">
                            {L(r.name_en, r.name_bn)}
                          </span>
                          {r.ac && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold font-sans shrink-0" style={{ background: '#3b82f622', color: '#3b82f6' }}>
                              ❄️ AC
                            </span>
                          )}
                        </div>
                        <p className="font-bengali text-xs text-kj-text-dim mt-0.5">{L(r.route_en, r.route_bn)}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-0.5 text-kj-amber text-xs font-bold">
                            ★ {r.rating.toFixed(1)}
                            <span className="text-kj-text-faint font-normal ml-0.5 text-[10px]">({r.reviews})</span>
                          </span>
                          <span className="text-kj-text-faint text-xs">·</span>
                          <span className="text-xs text-kj-text-dim">🕐 {r.dur}</span>
                          <span className="text-kj-text-faint text-xs">·</span>
                          <span className="text-xs text-kj-text-faint">{r.stops} {L('stops', 'স্টপ')}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="font-sans font-bold text-[18px] text-kj-primary leading-tight">৳{r.fare}</span>
                        <ChevronRight className="w-4 h-4 text-kj-text-faint" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">

              {/* Live nearby card */}
              <section className="dc-card rounded-2xl p-4 border border-kj-line">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <h3 className="text-sm font-semibold text-kj-text flex-1 font-bengali">
                    {L('Buses near you · live', 'আপনার কাছের বাস · লাইভ')}
                  </h3>
                  {locationLoading && <Loader2 size={12} className="animate-spin text-kj-text-faint" />}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <MapPin size={11} className="text-kj-text-faint" />
                  <span className="font-bengali text-[11px] text-kj-text-faint">
                    {L('Your area', 'ফার্মগেট')}
                  </span>
                </div>
                {locationError && (
                  <p className="text-xs text-kj-text-faint mb-2">{locationError}</p>
                )}
                <div className="space-y-0">
                  {nearbyBuses.map((bus) => (
                    <div key={bus.name} className="flex items-center justify-between py-2.5 border-b border-kj-line last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            background:
                              bus.status === 'green' ? '#10b981' :
                              bus.status === 'yellow' ? '#f59e0b' : '#ef4444',
                          }}
                        />
                        <span className="text-sm font-medium text-kj-text font-bengali">{bus.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-kj-primary text-sm font-sans">
                          ~{bus.mins} {L('min', 'মি')}
                        </span>
                        <span className="text-kj-text-faint font-sans">{bus.dist}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] border border-kj-line text-xs font-semibold text-kj-primary hover:bg-kj-primary-soft active:scale-[0.98] transition-all font-bengali">
                  <Navigation size={12} />
                  {L('View all on map →', 'ম্যাপে সব দেখুন →')}
                </button>
              </section>

              {/* Ad slot */}
              <SponsoredAdSlot language={language} size="300x250" compact />

              {/* Top operators */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bengali font-bold text-[14px] text-kj-text">
                    {L('Top operators', 'শীর্ষ অপারেটর')}
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {OPERATORS.map((item) => (
                    <div
                      key={item.op}
                      className="dc-card rounded-xl p-3 flex flex-col items-center gap-1.5 border border-kj-line hover:border-kj-primary/40 transition-all cursor-pointer"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: `linear-gradient(135deg, ${item.grad[0]}, ${item.grad[1]})` }}
                      >
                        {item.init}
                      </div>
                      <span className="text-[11px] font-semibold text-kj-text-dim text-center truncate w-full text-center font-sans">{item.op}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Bus types section */}
        <section>
          <h3 className="font-bengali font-bold text-[14px] text-kj-text mb-3">
            {L('Bus types', 'বাসের ধরন')}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {BUS_TYPES.map((type) => (
              <div key={type.en} className="dc-card rounded-2xl p-3.5 relative overflow-hidden border border-kj-line hover:border-kj-primary/40 transition-all cursor-pointer">
                <div
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 blur-xl pointer-events-none"
                  style={{ background: type.blob }}
                />
                <span className="text-2xl leading-none">{type.icon}</span>
                <div className="mt-2.5">
                  <div className="font-bengali text-sm font-semibold text-kj-text">{L(type.en, type.bn)}</div>
                  <div className="text-xs font-bold mt-0.5 font-sans" style={{ color: type.blob }}>{type.fare}</div>
                  <div className="font-bengali text-xs text-kj-text-dim mt-1 leading-tight">{L(type.desc, type.descBn)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Info notice */}
        <div className="flex items-start gap-2.5 bg-kj-panel-muted border border-kj-line rounded-xl p-3.5">
          <Info size={14} className="text-kj-text-faint mt-0.5 shrink-0" />
          <p className="font-bengali text-xs text-kj-text-faint leading-relaxed">
            {L(
              'KoyJabo shows info only · visit operator counters to purchase tickets',
              'কয়জাবো শুধু তথ্য দেখায় · টিকিট কিনতে অপারেটর কাউন্টারে যান'
            )}
          </p>
        </div>

        <HowKoyJaboHelps />
      </div>
    </div>
  );
};

export default LocalBusHub;
