import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  ArrowLeftRight,
  MapPin,
  Zap,
  Users,
  Star,
  Bus,
  Navigation,
  Info,
  LogIn,
  Loader2,
} from 'lucide-react';
import { BUS_DATA, STATIONS, METRO_STATIONS } from '../constants';
import { useAuth } from '../src/contexts/AuthContext';

interface LocalBusHubProps {
  onBack: () => void;
  language: 'en' | 'bn';
  initialFromId?: string;
  initialToId?: string;
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

const POPULAR_ROUTES = [
  {
    id: 1,
    operator: 'Green Line',
    initials: 'GL',
    logoGradient: 'linear-gradient(135deg, #10b981, #059669)',
    route: 'Route 6',
    from: 'Gulshan',
    to: 'Motijheel',
    fromBn: 'গুলশান',
    toBn: 'মতিঝিল',
    fare: 60,
    duration: '42min',
    durationBn: '৪২ মিনিট',
    stops: 9,
    rating: 4.6,
    reviews: 312,
    tags: ['AC'],
  },
  {
    id: 2,
    operator: 'Hanif',
    initials: 'HF',
    logoGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    route: 'Route 11',
    from: 'Uttara',
    to: 'Paltan',
    fromBn: 'উত্তরা',
    toBn: 'পল্টন',
    fare: 50,
    duration: '1h 10m',
    durationBn: '১ ঘণ্টা ১০ মিনিট',
    stops: 18,
    rating: 4.1,
    reviews: 189,
    tags: [],
  },
  {
    id: 3,
    operator: 'BRTC',
    initials: 'BR',
    logoGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    route: 'Double Decker',
    from: 'Motijheel',
    to: 'Gabtoli',
    fromBn: 'মতিঝিল',
    toBn: 'গাবতলী',
    fare: 45,
    duration: '52min',
    durationBn: '৫২ মিনিট',
    stops: 14,
    rating: 4.3,
    reviews: 241,
    tags: ['AC'],
  },
  {
    id: 4,
    operator: 'Projapoti',
    initials: 'PR',
    logoGradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    route: '',
    from: 'Mirpur',
    to: 'Sadarghat',
    fromBn: 'মিরপুর',
    toBn: 'সদরঘাট',
    fare: 30,
    duration: '45min',
    durationBn: '৪৫ মিনিট',
    stops: 12,
    rating: 3.9,
    reviews: 97,
    tags: [],
  },
  {
    id: 5,
    operator: 'Anabil Super',
    initials: 'AB',
    logoGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    route: '',
    from: 'Gulistan',
    to: 'Savar',
    fromBn: 'গুলিস্তান',
    toBn: 'সাভার',
    fare: 70,
    duration: '1h 30m',
    durationBn: '১ ঘণ্টা ৩০ মিনিট',
    stops: 8,
    rating: 3.8,
    reviews: 74,
    tags: [],
  },
];

const NEARBY_BUSES: NearbyBus[] = [
  { name: 'GL #6', mins: 2, dist: '400m', status: 'green' },
  { name: 'BRTC Double', mins: 5, dist: '900m', status: 'green' },
  { name: 'Hanif #11', mins: 8, dist: '1.4km', status: 'yellow' },
  { name: 'Projapoti', mins: 12, dist: '2.1km', status: 'red' },
];

const OPERATORS = ['Green Line', 'Hanif', 'BRTC', 'Projapoti', 'Anabil', 'Unique'];

const BUS_TYPES = [
  {
    en: 'Local',
    bn: 'লোকাল',
    icon: '🚌',
    fare: '৳15–40',
    desc: 'All stops · high frequency',
    descBn: 'সব স্টপে থামে · বেশি ফ্রিকোয়েন্সি',
    blob: '#10b981',
  },
  {
    en: 'AC Seating',
    bn: 'এসি সিটিং',
    icon: '❄️',
    fare: '৳40–80',
    desc: 'Air conditioned comfort',
    descBn: 'শীতাতপ নিয়ন্ত্রিত আরামদায়ক',
    blob: '#3b82f6',
  },
  {
    en: 'Double Decker',
    bn: 'ডাবল ডেকার',
    icon: '🚍',
    fare: '৳35–60',
    desc: 'Two floors · scenic upper deck',
    descBn: 'দ্বিতল · উপরের ডেকে দৃশ্য উপভোগ',
    blob: '#f59e0b',
  },
  {
    en: 'Gulshan Chaka',
    bn: 'গুলশান চাকা',
    icon: '🔄',
    fare: '৳20–30',
    desc: 'Circular · frequent loops',
    descBn: 'বৃত্তাকার রুট · ঘন ঘন লুপ',
    blob: '#8b5cf6',
  },
];

const SORT_CHIPS = [
  { id: 'fastest', en: 'Fastest', bn: 'দ্রুততম', icon: '⚡' },
  { id: 'cheapest', en: 'Cheapest', bn: 'সস্তা', icon: '৳' },
  { id: 'ac', en: 'AC', bn: 'এসি', icon: '❄️' },
  { id: 'toilet', en: 'Toilet', bn: 'টয়লেট', icon: '🚻' },
  { id: 'less_crowd', en: 'Less crowd', bn: 'কম ভিড়', icon: '👥' },
];

const FILTER_CHIPS = [
  { id: 'name', en: 'Name', bn: 'নাম' },
  { id: 'route', en: 'Route', bn: 'রুট' },
  { id: 'operator', en: 'Operator', bn: 'অপারেটর' },
];

function StarRating({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="flex items-center gap-0.5 text-kj-amber text-xs font-semibold">
      <Star size={11} fill="currentColor" />
      {rating.toFixed(1)}
      {reviews !== undefined && (
        <span className="text-kj-text-faint font-normal ml-0.5">({reviews})</span>
      )}
    </span>
  );
}

const LocalBusHub: React.FC<LocalBusHubProps> = ({ onBack, language, initialFromId, initialToId }) => {
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

  // Real geolocation for nearby buses
  const [nearbyBuses, setNearbyBuses] = useState<NearbyBus[]>(NEARBY_BUSES);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: userLat, longitude: userLng } = pos.coords;
        // Find nearest stations within 3km
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

        // Find buses passing through nearest stations
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

  // Filter real BUS_DATA when from/to IDs are provided from home search
  const searchResults = useMemo(() => {
    if (!initialFromId || !initialToId) return null;
    return BUS_DATA.filter(bus => {
      const fromIdx = bus.stops.indexOf(initialFromId);
      const toIdx = bus.stops.indexOf(initialToId);
      return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
    });
  }, [initialFromId, initialToId]);

  const handleSwap = () => {
    setFromField(toField);
    setToField(fromField);
  };

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">

      {/* Back button row */}
      <div className="sticky top-0 z-10 bg-kj-bg border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-kj-panel border border-kj-line text-kj-text-dim hover:text-kj-text active:scale-95 transition-all"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-semibold text-kj-text">
          {L('Local Bus', 'লোকাল বাস')}
        </h1>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Hero card */}
        <div className="rounded-2xl p-5 text-white relative overflow-hidden shadow-kj-lg" style={{ background: 'linear-gradient(135deg, #006a4e 0%, #10b981 60%, #fbbf24 100%)' }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Bus size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                {L('Every Dhaka bus · in one app', 'ঢাকার সব বাস · এক অ্যাপে')}
              </h2>
              <p className="text-white/80 text-xs mt-0.5">
                {L('Find, compare, and plan your bus journey', 'বাস খুঁজুন, তুলনা করুন, যাত্রা পরিকল্পনা করুন')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: '2,412', label: L('Routes', 'রুট') },
              { value: '1,043', label: L('Stops', 'স্টপ') },
              { value: '140+', label: L('Operators', 'অপারেটর') },
              { value: '★4.4', label: L('Avg rating', 'গড় রেটিং') },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/20 rounded-xl p-2 text-center">
                <div className="text-sm font-bold">{stat.value}</div>
                <div className="text-white/80 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search card */}
        <div className="dc-card rounded-2xl p-4 space-y-3">
          {/* Name search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kj-text-faint" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={L(
                'Green Line, Raida #7, BRTC Double, Route 6…',
                'গ্রিন লাইন, রাইদা #৭, বিআরটিসি ডাবল, রুট ৬…'
              )}
              className="w-full pl-9 pr-3 py-2.5 bg-kj-bg border border-kj-line rounded-xl text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:border-kj-primary"
            />
          </div>

          {/* Quick filter chips */}
          <div className="flex gap-2">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeFilter === chip.id
                    ? 'bg-kj-primary text-kj-primary-ink'
                    : 'bg-kj-chip-bg text-kj-chip-text'
                }`}
              >
                {L(chip.en, chip.bn)}
              </button>
            ))}
          </div>

          {/* From / To fields */}
          <div className="relative flex flex-col gap-2">
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input
                type="text"
                value={fromField}
                onChange={(e) => setFromField(e.target.value)}
                placeholder={L('From…', 'কোথা থেকে…')}
                className="w-full pl-8 pr-3 py-2.5 bg-kj-bg border border-kj-line rounded-xl text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:border-kj-primary"
              />
            </div>
            <button
              onClick={handleSwap}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-kj-panel border border-kj-line rounded-lg text-kj-text-dim hover:text-kj-primary active:scale-95 transition-all z-10"
              aria-label={L('Swap from and to', 'অদলবদল করুন')}
            >
              <ArrowLeftRight size={14} />
            </button>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" />
              <input
                type="text"
                value={toField}
                onChange={(e) => setToField(e.target.value)}
                placeholder={L('To…', 'কোথায় যাবেন…')}
                className="w-full pl-8 pr-3 py-2.5 bg-kj-bg border border-kj-line rounded-xl text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:border-kj-primary"
              />
            </div>
          </div>

          {/* Find button */}
          <button className="w-full bg-kj-primary text-kj-primary-ink font-semibold py-3 rounded-xl text-sm active:scale-[0.98] transition-all">
            {L('Find Bus', 'বাস খুঁজুন')}
          </button>

          {/* Sort chips */}
          <div className="flex gap-2 flex-wrap">
            {SORT_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveSort(activeSort === chip.id ? null : chip.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeSort === chip.id
                    ? 'bg-kj-accent-soft text-kj-accent'
                    : 'bg-kj-chip-bg text-kj-chip-text'
                }`}
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
                {fromField || L('From', 'থেকে')} → {toField || L('To', 'পর্যন্ত')}
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
                  const stopsCount = toIdx - fromIdx;
                  return (
                    <div key={bus.id} className="dc-card kj-glass rounded-2xl p-3.5 flex items-center gap-3 border border-kj-primary/20" style={{ boxShadow: '0 0 0 1px rgba(0,245,255,0.08)' }}>
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
                      <div className="text-right shrink-0">
                        <div className="font-sans font-bold text-[14px] text-kj-primary">
                          ৳ {Math.max(10, Math.round(stopsCount * 3.5))}
                        </div>
                        <div className="text-[10px] text-kj-text-faint">{L('approx', 'আনু.')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-3 border-t border-kj-line pt-3">
              <h3 className="text-sm font-semibold text-kj-text mb-2">{L('Popular Routes', 'জনপ্রিয় রুট')}</h3>
            </div>
            </>
            )}
          </section>
        )}

        {/* Popular routes — only when no from/to search active */}
        {searchResults === null && (<section>
          <h3 className="text-sm font-semibold text-kj-text mb-2">
            {L('Popular Routes', 'জনপ্রিয় রুট')}
          </h3>
          <div className="space-y-2">
            {POPULAR_ROUTES.map((r) => (
              <div
                key={r.id}
                className="dc-card rounded-2xl p-3 flex items-start gap-3"
              >
                {/* Brand logo — 44×44 rounded with gradient initials */}
                <div
                  className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ background: r.logoGradient }}
                >
                  {r.initials}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Top row: name + AC pill + fare right-aligned */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="text-sm font-semibold text-kj-text truncate">
                        {r.operator}
                        {r.route ? ` · ${r.route}` : ''}
                      </span>
                      {r.tags.includes('AC') && (
                        <span className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs rounded-full font-medium shrink-0">
                          ❄️ AC
                        </span>
                      )}
                    </div>
                    <span className="text-[18px] font-bold text-kj-primary leading-tight shrink-0">
                      ৳{r.fare}
                    </span>
                  </div>

                  {/* Route text */}
                  <div className="flex items-center gap-1 text-xs text-kj-text-dim mt-0.5">
                    <span>{L(r.from, r.fromBn)}</span>
                    <span className="text-kj-text-faint">↔</span>
                    <span>{L(r.to, r.toBn)}</span>
                  </div>

                  {/* Stars + reviews + duration + stops */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <StarRating rating={r.rating} reviews={r.reviews} />
                    <span className="text-kj-text-faint text-xs">·</span>
                    <span className="text-xs text-kj-text-dim">
                      🕐 {L(r.duration, r.durationBn)}
                    </span>
                    {r.stops > 0 && (
                      <>
                        <span className="text-kj-text-faint text-xs">·</span>
                        <span className="text-xs text-kj-text-faint">{r.stops} {L('stops', 'স্টপ')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>)}

        {/* Live buses nearby */}
        <section className="dc-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h3 className="text-sm font-semibold text-kj-text">
              {L('Buses near you · live', 'আপনার কাছের বাস · লাইভ')}
            </h3>
            {locationLoading && <Loader2 size={12} className="animate-spin text-kj-text-faint ml-auto" />}
          </div>
          {locationError && (
            <p className="text-xs text-kj-text-faint mb-2">{locationError}</p>
          )}
          <div className="space-y-1">
            {nearbyBuses.map((bus) => (
              <div key={bus.name} className="flex items-center justify-between py-2 border-b border-kj-line last:border-0">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      background:
                        bus.status === 'green' ? '#10b981' :
                        bus.status === 'yellow' ? '#f59e0b' : '#ef4444',
                    }}
                  />
                  <span className="text-sm font-medium text-kj-text">{bus.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-kj-primary text-sm">
                    ~{bus.mins} {L('min', 'মিনিট')}
                  </span>
                  <span className="text-kj-text-faint">{bus.dist}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-kj-line text-xs font-medium text-kj-primary hover:bg-kj-primary-soft active:scale-[0.98] transition-all">
            <Navigation size={12} />
            {L('View all on map', 'ম্যাপে সব দেখুন')}
          </button>
        </section>

        {/* Bus operators grid */}
        <section>
          <h3 className="text-sm font-semibold text-kj-text mb-2">
            {L('Bus Operators', 'বাস অপারেটর')}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {OPERATORS.map((op) => (
              <div
                key={op}
                className="dc-card rounded-xl p-3 flex items-center justify-center text-center"
              >
                <span className="text-xs font-medium text-kj-text-dim">{op}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bus types */}
        <section>
          <h3 className="text-sm font-semibold text-kj-text mb-2">
            {L('Bus Types', 'বাসের ধরন')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BUS_TYPES.map((type) => (
              <div
                key={type.en}
                className="dc-card rounded-2xl p-3 relative overflow-hidden"
              >
                {/* Colored accent blob */}
                <div
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-15 blur-xl"
                  style={{ background: type.blob }}
                />
                <span className="text-2xl">{type.icon}</span>
                <div className="mt-2">
                  <div className="text-sm font-semibold text-kj-text">{L(type.en, type.bn)}</div>
                  <div className="text-xs font-bold mt-0.5" style={{ color: type.blob }}>{type.fare}</div>
                  <div className="text-xs text-kj-text-dim mt-0.5 leading-tight">{L(type.desc, type.descBn)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Info notice */}
        <div className="flex items-start gap-2 bg-kj-panel-muted border border-kj-line rounded-xl p-3">
          <Info size={14} className="text-kj-text-faint mt-0.5 shrink-0" />
          <p className="text-xs text-kj-text-faint leading-relaxed">
            {L(
              'KoyJabo shows info only · visit operator counters to purchase tickets',
              'কয়জাবো শুধু তথ্য দেখায় · টিকিট কিনতে অপারেটর কাউন্টারে যান'
            )}
          </p>
        </div>

      </div>
    </div>
  );
};

export default LocalBusHub;
