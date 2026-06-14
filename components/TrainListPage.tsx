import React, { useState, useMemo, useEffect } from 'react';
import SponsoredAdSlot from './SponsoredAdSlot';
import {
  Train, Search, ArrowRight, Clock, CalendarX, Info,
  ArrowLeft, MapPin, Navigation,
  Coins, AlertCircle, X, CheckCircle2, SlidersHorizontal, Star, Heart, Ticket, Radio, Map
} from 'lucide-react';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
import {
  BD_TRAIN_ROUTES, TRAIN_STATIONS, BDTrainRoute,
  calcTrainFare, routeDistanceBetween
} from '../data/bangladeshTrainData';
import { SearchableSelect } from './SearchableSelect';
import TrainRouteMap from './TrainRouteMap';
import { UserLocation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureUsage } from '../services/analyticsService';
import { getTrainRatings, TrainRatingSummary } from '../services/communityDataService';
import TrainImageViewer from './TrainImageViewer';


interface TrainListPageProps {
  userLocation?: UserLocation | null;
  onBack?: () => void;
  embedded?: boolean;
  onSelectTrain?: (route: BDTrainRoute) => void;
  onRateTrain?: (route: BDTrainRoute) => void;
}

// Train type — colour chips (list view, light-mode-aware)
const TYPE_COLORS: Record<string, string> = {
  Express:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  Mail:      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  Intercity: 'bg-kj-primary-soft text-emerald-700 dark:text-kj-primary',
  Local:     'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
};

// Bengali type names
const TYPE_BN: Record<string, string> = {
  Express: 'এক্সপ্রেস',
  Mail: 'মেইল',
  Intercity: 'আন্তঃনগর',
  Local: 'লোকাল',
};

function formatNumber(n: number): string {
  return n.toLocaleString('en-BD');
}

const TRAIN_FAVORITES_KEY = 'koyjabo_train_favorites';

function getStoredTrainFavorites(): string[] {
  try {
    const stored = localStorage.getItem(TRAIN_FAVORITES_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

// Featured trains for the hero section
const FEATURED_TRAINS = [
  {
    number: '813',
    name: "Cox's Bazar Express",
    bnName: 'কক্সবাজার এক্সপ্রেস',
    route: 'Dhaka → Cox\'s Bazar',
    bnRoute: 'ঢাকা → কক্সবাজার',
    depart: '10:30 PM',
    arrive: '09:30 AM',
    duration: '11h',
    fare: '৳745–2,656',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    badgeBg: '#7c3aed',
  },
  {
    number: '786',
    name: 'Sonar Bangla Express',
    bnName: 'সোনার বাংলা এক্সপ্রেস',
    route: 'Dhaka → Chittagong',
    bnRoute: 'ঢাকা → চট্টগ্রাম',
    depart: '07:00 AM',
    arrive: '12:30 PM',
    duration: '5h 30m',
    fare: '৳405–1,591',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    badgeBg: '#059669',
  },
  {
    number: '709',
    name: 'Parabat Express',
    bnName: 'পারাবত এক্সপ্রেস',
    route: 'Dhaka → Sylhet',
    bnRoute: 'ঢাকা → সিলেট',
    depart: '06:30 AM',
    arrive: '01:00 PM',
    duration: '6h 30m',
    fare: '৳375–1,678',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
    badgeBg: '#1d4ed8',
  },
  {
    number: '729',
    name: 'Jahanabad Express',
    bnName: 'জাহানাবাদ এক্সপ্রেস',
    route: 'Dhaka → Khulna',
    bnRoute: 'ঢাকা → খুলনা',
    depart: '06:00 AM',
    arrive: '09:45 AM',
    duration: '3h 45m',
    fare: '৳310–1,450',
    gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    badgeBg: '#b45309',
    badge: 'Padma Bridge',
  },
  {
    number: '801',
    name: 'Upaban Express',
    bnName: 'উপবন এক্সপ্রেস',
    route: 'Dhaka → Sylhet',
    bnRoute: 'ঢাকা → সিলেট',
    depart: '10:00 PM',
    arrive: '05:00 AM',
    duration: '7h',
    fare: '৳375–1,678',
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
    badgeBg: '#b91c1c',
  },
];

// Popular stations for the bottom grid
const POPULAR_STATIONS = [
  { emoji: '🏙️', name: 'Dhaka', bnName: 'ঢাকা' },
  { emoji: '⚓', name: 'Chittagong', bnName: 'চট্টগ্রাম' },
  { emoji: '🌿', name: 'Sylhet', bnName: 'সিলেট' },
  { emoji: '🌊', name: 'Cox\'s Bazar', bnName: 'কক্সবাজার' },
  { emoji: '🏔️', name: 'Khulna', bnName: 'খুলনা' },
  { emoji: '🌾', name: 'Rajshahi', bnName: 'রাজশাহী' },
  { emoji: '🎋', name: 'Mymensingh', bnName: 'ময়মনসিংহ' },
  { emoji: '🌅', name: 'Comilla', bnName: 'কুমিল্লা' },
];

// Coach classes data
const COACH_CLASSES = [
  { name: 'AC Berth', bnName: 'এসি বার্থ', price: '৳2,656', color: '#7c3aed' },
  { name: 'Snigdha', bnName: 'স্নিগ্ধা', price: '৳1,591', color: '#059669' },
  { name: 'AC Chair', bnName: 'এসি চেয়ার', price: '৳1,200', color: '#1d4ed8' },
  { name: 'Shovon Chair', bnName: 'শোভন চেয়ার', price: '৳745', color: '#b45309' },
  { name: 'Shovon', bnName: 'শোভন', price: '৳405', color: '#6b7280' },
];

// ── Train Detail View ─────────────────────────────────────────────────────────
export function TrainDetail({
  route,
  userLocation,
  onBack,
  language,
  onOpenRating,
  isFavorite = false,
  onToggleFavorite,
}: {
  route: BDTrainRoute;
  userLocation?: UserLocation | null;
  onBack: () => void;
  language: string;
  onOpenRating?: () => void;
  onOpenPhotos?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const [fromId, setFromId] = useState<string>('');
  const [toId, setToId] = useState<string>('');
  const [ratingSummary, setRatingSummary] = useState<TrainRatingSummary | null>(null);

  const stopOptions = route.stops
    .filter(id => TRAIN_STATIONS[id])
    .map(id => ({ id, name: TRAIN_STATIONS[id].name, bnName: TRAIN_STATIONS[id].bnName }));

  const journeyInfo = useMemo(() => {
    if (!fromId || !toId || fromId === toId) return null;
    const distKm = routeDistanceBetween(route, fromId, toId);
    if (distKm < 1) return null;
    const fare = calcTrainFare(distKm);
    const avgSpeedKmh = 65;
    const travelMins = Math.round((distKm / avgSpeedKmh) * 60);
    const hours = Math.floor(travelMins / 60);
    const mins = travelMins % 60;
    return { distKm, fare, travelTime: hours > 0 ? `${hours}h ${mins}m` : `${mins}m` };
  }, [fromId, toId, route]);

  const bn = language === 'bn';
  useEffect(() => {
    getTrainRatings(route.id).then(setRatingSummary);
  }, [route.id]);

  const fromSt = TRAIN_STATIONS[route.from];
  const toSt   = TRAIN_STATIONS[route.to];

  // Nearest stop to user's current location (for progress display)
  const nearestStopResult = useMemo(() => {
    if (!userLocation) return { idx: -1, distKm: Infinity };
    let minDist = Infinity;
    let idx = -1;
    route.stops.forEach((id, i) => {
      const st = TRAIN_STATIONS[id];
      if (!st) return;
      const d = haversineKm(userLocation.lat, userLocation.lng, st.lat, st.lng);
      if (d < minDist) { minDist = d; idx = i; }
    });
    return minDist <= 35 ? { idx, distKm: minDist } : { idx: -1, distKm: Infinity };
  }, [userLocation, route.stops]);
  const nearestStopIdx = nearestStopResult.idx;
  const nearestStopDistKm = nearestStopResult.distKm;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-kj-bg overflow-hidden">

      {/* Sub-header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-kj-line dark:border-kj-line bg-kj-panel-muted">
        <button
          onClick={onBack}
          className="p-2 -ml-1 hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg rounded-full transition-colors"
          aria-label={bn ? 'ফিরুন' : 'Back'}
        >
          <ArrowLeft className="w-5 h-5 text-kj-text-dim" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-kj-text truncate">
              {bn ? route.bnName : route.name}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-kj-chip-bg text-kj-text-dim rounded-full">
              #{route.number}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[route.type] || TYPE_COLORS.Local}`}>
              {bn ? (TYPE_BN[route.type] ?? route.type) : route.type}
            </span>
          </div>
          <p className="text-xs text-kj-text-dim mt-0.5">
            {bn ? fromSt?.bnName : fromSt?.name}
            {' → '}
            {bn ? toSt?.bnName : toSt?.name}
          </p>
        </div>

        <button
          onClick={() => onOpenRating?.()}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40"
          aria-label={bn ? 'ট্রেন রেটিং' : 'Train rating'}
        >
          {ratingSummary?.count ? `★ ${ratingSummary.average.toFixed(1)}` : (bn ? '☆ রেটিং' : '☆ Rate')}
        </button>
        <button
          onClick={() => onToggleFavorite?.()}
          className="w-8 h-8 flex items-center justify-center leading-none rounded-full bg-kj-panel border border-kj-line hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg transition-colors shrink-0"
          aria-label={isFavorite ? (bn ? 'ফেভারিট থেকে সরান' : 'Remove from favorites') : (bn ? 'ফেভারিটে যোগ করুন' : 'Add to favorites')}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-kj-text-faint'}`} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y pb-nav-safe" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Map */}
        <div className="h-[220px] xs:h-[260px] sm:h-[280px] md:h-[340px] bg-kj-panel relative">
          <TrainRouteMap
            route={route}
            userLocation={userLocation}
            highlightFromId={fromId || undefined}
            highlightToId={toId || undefined}
            language={language}
            currentStopId={nearestStopIdx >= 0 ? route.stops[nearestStopIdx] : undefined}
          />
        </div>

        <div className="p-4 space-y-4">

          {/* Schedule */}
          <div className="bg-kj-chip-bg rounded-2xl p-4 border border-kj-line dark:border-kj-line">
            <h3 className="text-sm font-bold text-kj-text mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-kj-primary" />
              {bn ? 'সময়সূচি' : 'Schedule'}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-kj-text-dim">
                  {bn ? `${fromSt?.bnName || 'শুরু'} ছাড়ে` : `Departs ${fromSt?.name || 'Start'}`}
                </p>
                <p className="font-bold text-kj-text text-base">{route.dhakaDepart}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-kj-text-dim">{bn ? 'গন্তব্যে পৌঁছায়' : 'Arrives'}</p>
                <p className="font-bold text-kj-text text-base">{route.destinationArrive}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-kj-text-dim">{bn ? 'ফিরতি ছাড়ে' : 'Return Departs'}</p>
                <p className="font-bold text-kj-text text-base">{route.returnDepart}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-kj-text-dim">
                  {bn ? `${fromSt?.bnName || 'ঢাকা'} ফেরে` : `Returns ${fromSt?.name || 'Dhaka'}`}
                </p>
                <p className="font-bold text-kj-text text-base">{route.dhakaArrive}</p>
              </div>
            </div>
            {route.offDay !== 'No Off Day' && route.offDay !== 'No Off' && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-400/15 rounded-lg border border-amber-200 dark:border-amber-400/25">
                <CalendarX className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-bold">{bn ? 'সাপ্তাহিক ছুটি:' : 'Off Day:'}</span> {route.offDay}
                </span>
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-kj-text-dim">
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span>{bn ? `মোট দূরত্ব: ~${route.distanceKm} কিমি` : `Total distance: ~${route.distanceKm} km`}</span>
            </div>
          </div>

          {/* Station timeline */}
          <div className="bg-kj-chip-bg rounded-2xl border border-kj-line dark:border-kj-line overflow-hidden">
            <div className="px-4 py-3 border-b border-kj-line dark:border-kj-line">
              <h3 className="text-sm font-bold text-kj-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-kj-primary" />
                {bn ? `স্টেশন (${route.stops.length}টি)` : `Stations (${route.stops.length})`}
                {nearestStopIdx >= 0 && (
                  <span className="ml-auto text-[10px] font-semibold text-kj-primary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-kj-primary rounded-full animate-pulse inline-block" />
                    {bn ? 'লাইভ অবস্থান' : 'Live location'}
                  </span>
                )}
              </h3>
            </div>
            <div className="px-4 py-4">
              {route.stops.map((id, idx) => {
                const st = TRAIN_STATIONS[id];
                if (!st) return null;
                const isFirst    = idx === 0;
                const isLast     = idx === route.stops.length - 1;
                const isMid      = !isFirst && !isLast;
                const isNearUser = nearestStopIdx === idx;
                const isPassed   = nearestStopIdx >= 0 && idx < nearestStopIdx;
                const distLabel  = nearestStopDistKm < 1
                  ? `${Math.round(nearestStopDistKm * 1000)} m`
                  : `${nearestStopDistKm.toFixed(1)} km`;

                return (
                  <React.Fragment key={id}>
                    {isNearUser && userLocation && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center" style={{ width: 20 }}>
                          <div className={`w-px flex-none h-2 ${isPassed ? 'bg-emerald-400 dark:bg-kj-primary' : 'bg-gray-300 dark:bg-white/25'}`} />
                          <div className="relative shrink-0 z-10">
                            <div className="w-4 h-4 rounded-full bg-kj-primary border-2 border-kj-panel shadow-lg" />
                            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-60" />
                          </div>
                          <div className="flex-1 min-h-[24px] flex flex-col items-center gap-0.5 py-0.5">
                            {[0,1,2,3].map(i => (
                              <div key={i} className="w-px h-1.5 bg-kj-primary/60 rounded" />
                            ))}
                          </div>
                        </div>
                        <div className="pb-1 flex-1 min-w-0 pt-0">
                          <span className="text-sm font-bold text-kj-primary">
                            {bn ? 'আপনার বর্তমান অবস্থান' : 'Your current location'}
                          </span>
                          <p className="text-[10px] text-kj-primary font-semibold mt-0.5 flex items-center gap-1">
                            <span className="w-1 h-1 bg-kj-primary rounded-full animate-pulse inline-block" />
                            {bn ? 'আপনি এখানে আছেন' : 'You are here'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="flex flex-col items-center" style={{ width: 20 }}>
                        {!(isNearUser && userLocation) && (
                          <div className={`w-px flex-none h-2 ${
                            isFirst ? 'bg-transparent'
                            : isPassed ? 'bg-emerald-400 dark:bg-kj-primary'
                            : 'bg-gray-300 dark:bg-white/25'
                          }`} />
                        )}
                        {isNearUser && userLocation && <div className="flex-none h-0" />}
                        {isNearUser ? (
                          <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-300 shadow-md shadow-orange-500/40 shrink-0 z-10" />
                        ) : isPassed ? (
                          <div className="w-4 h-4 rounded-full bg-kj-primary dark:bg-emerald-400 border-2 border-emerald-300 flex items-center justify-center shrink-0 z-10">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        ) : isFirst ? (
                          <div className="w-4 h-4 rounded-full bg-kj-primary dark:bg-emerald-400 border-2 border-emerald-400 dark:border-emerald-300 shadow-lg shadow-emerald-500/30 shrink-0 z-10" />
                        ) : isLast ? (
                          <div className="w-4 h-4 rounded-full bg-slate-500 dark:bg-white/80 border-2 border-slate-400 dark:border-white/50 shadow shrink-0 z-10" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/20 border border-gray-400 dark:border-white/35 shrink-0 z-10 mt-0.5" />
                        )}
                        {!isLast && (
                          <div className={`w-px flex-1 min-h-[20px] ${
                            isPassed ? 'bg-emerald-400 dark:bg-kj-primary'
                            : isFirst ? 'bg-gradient-to-b from-emerald-500/70 dark:from-emerald-400/80 to-gray-300 dark:to-white/25'
                            : 'bg-gray-300 dark:bg-white/25'
                          }`} />
                        )}
                      </div>
                      <div className={`pb-3 flex-1 min-w-0 ${isMid && !isNearUser ? 'pt-0.5' : 'pt-0'}`}>
                        <span className={`leading-snug ${
                          isNearUser ? 'text-sm font-bold text-orange-600 dark:text-orange-400'
                          : isPassed ? 'text-xs text-kj-primary line-through opacity-60'
                          : isFirst || isLast ? 'text-sm font-bold text-kj-text'
                          : 'text-xs text-kj-text-dim'
                        }`}>
                          {bn ? st.bnName : st.name}
                        </span>
                        {isNearUser && (
                          <p className="text-[10px] text-orange-500 dark:text-orange-400 font-semibold mt-0.5 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            {bn ? `নিকটতম স্টেশন • ${distLabel} দূরে` : `Nearest station • ${distLabel} away`}
                          </p>
                        )}
                        {!isNearUser && (isFirst || isLast) && (
                          <p className="text-[10px] text-kj-text-faint mt-0.5">
                            {isFirst ? (bn ? 'যাত্রা শুরু' : 'Departure') : (bn ? 'চূড়ান্ত গন্তব্য' : 'Final Destination')}
                          </p>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <SponsoredAdSlot language={language as 'en' | 'bn'} size="728x90" compact />

          {/* Fare Calculator */}
          <div className="bg-kj-chip-bg rounded-2xl border border-kj-line dark:border-kj-line">
            <div className="px-4 py-3 border-b border-kj-line dark:border-kj-line rounded-t-2xl">
              <h3 className="text-sm font-bold text-kj-text flex items-center gap-2">
                <Coins className="w-4 h-4 text-kj-amber dark:text-amber-400" />
                {bn ? 'ভাড়া ও সময় ক্যালকুলেটর' : 'Fare & Time Calculator'}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-kj-text-dim mb-1 block">
                    {bn ? 'কোথায় থেকে' : 'From Station'}
                  </label>
                  <SearchableSelect
                    options={stopOptions}
                    value={fromId}
                    onChange={setFromId}
                    placeholder={bn ? 'স্টেশন বেছে নিন' : 'Select station'}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-kj-text-dim mb-1 block">
                    {bn ? 'কোথায় যাবেন' : 'To Station'}
                  </label>
                  <SearchableSelect
                    options={stopOptions.filter(o => o.id !== fromId)}
                    value={toId}
                    onChange={setToId}
                    placeholder={bn ? 'স্টেশন বেছে নিন' : 'Select station'}
                  />
                </div>
              </div>

              {journeyInfo ? (
                <>
                  <div className="mt-2 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between p-3 bg-kj-primary-soft dark:bg-emerald-400/15 rounded-xl border border-kj-primary/30 dark:border-emerald-400/20">
                      <div className="flex items-center gap-2 text-sm">
                        <Navigation className="w-4 h-4 text-kj-primary" />
                        <span className="font-medium text-kj-text-dim">
                          ~{Math.round(journeyInfo.distKm)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-kj-primary" />
                        <span className="font-medium text-kj-text-dim">{journeyInfo.travelTime}</span>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-kj-line dark:border-kj-line">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-kj-chip-bg text-xs text-kj-text-dim">
                            <th className="text-left px-3 py-2 font-medium">{bn ? 'শ্রেণী' : 'Class'}</th>
                            <th className="text-right px-3 py-2 font-medium">{bn ? 'ভাড়া' : 'Fare'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                          {[
                            { label: bn ? 'শুভন' : 'Shuvan', val: journeyInfo.fare.shuvan },
                            { label: bn ? 'শুভন চেয়ার' : 'Shuvan Chair', val: journeyInfo.fare.shuvanChair },
                            { label: bn ? 'স্নিগ্ধা (এসি চেয়ার)' : 'Snigdha (AC Chair)', val: journeyInfo.fare.snigdha },
                            { label: bn ? '১ম শ্রেণী বার্থ' : '1st Class Berth', val: journeyInfo.fare.firstClassBerth! },
                            { label: bn ? 'এসি বার্থ' : 'AC Berth', val: journeyInfo.fare.acBerth! },
                          ].map(row => (
                            <tr key={row.label} className="hover:bg-kj-chip-bg dark:hover:bg-white/5 transition-colors">
                              <td className="px-3 py-2.5 text-kj-text-dim dark:text-white/75">{row.label}</td>
                              <td className="px-3 py-2.5 text-right font-bold text-emerald-700 dark:text-kj-primary">
                                ৳{formatNumber(row.val)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-kj-text-faint flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      {bn
                        ? 'ভাড়া আনুমানিক। সঠিক ভাড়ার জন্য বাংলাদেশ রেলওয়ে ওয়েবসাইট দেখুন।'
                        : 'Fare is approximate. Check Bangladesh Railway website for exact fares.'}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-kj-text-faint text-center py-2">
                  {bn ? 'দুটি স্টেশন সিলেক্ট করুন' : 'Select two stations to calculate fare'}
                </p>
              )}
            </div>
          </div>

          <div className="h-24 md:h-4" />
        </div>
      </div>
    </div>
  );
}

// ── Featured Train Card (for the hero list) ───────────────────────────────────
function FeaturedTrainCard({
  train,
  language,
  onDetails,
}: {
  train: typeof FEATURED_TRAINS[number];
  language: string;
  onDetails: () => void;
}) {
  const bn = language === 'bn';
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-kj-panel" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}>
      {/* Gradient header strip */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: train.gradient }}>
        <span
          className="text-xs font-black px-2.5 py-1 rounded-lg text-white"
          style={{ background: 'rgba(0,0,0,0.25)', letterSpacing: '0.05em' }}
        >
          #{train.number}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-tight truncate">
            {bn ? train.bnName : train.name}
          </p>
          <p className="text-white/75 text-xs truncate">{bn ? train.bnRoute : train.route}</p>
        </div>
        {train.badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white shrink-0">
            {train.badge}
          </span>
        )}
      </div>
      {/* Body */}
      <div className="px-4 py-3">
        {/* Departure → Arrival */}
        <div className="flex items-center gap-2 mb-3">
          <div className="text-center">
            <p className="text-base font-black text-kj-text leading-none">{train.depart}</p>
            <p className="text-[10px] text-kj-text-faint mt-0.5">{bn ? 'ছাড়ে' : 'Dep'}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1 w-full">
              <div className="flex-1 h-px bg-kj-line" />
              <span className="text-[10px] font-semibold text-kj-text-dim px-1 shrink-0">{train.duration}</span>
              <div className="flex-1 h-px bg-kj-line" />
            </div>
            <ArrowRight className="w-3 h-3 text-kj-text-faint" />
          </div>
          <div className="text-center">
            <p className="text-base font-black text-kj-text leading-none">{train.arrive}</p>
            <p className="text-[10px] text-kj-text-faint mt-0.5">{bn ? 'পৌঁছায়' : 'Arr'}</p>
          </div>
        </div>
        {/* Fare + Details */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">
            {train.fare}
          </span>
          <button
            onClick={onDetails}
            className="text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-opacity hover:opacity-90 active:scale-95"
            style={{ background: train.gradient }}
          >
            {bn ? 'বিস্তারিত' : 'Details'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Deduplicated total (computed once)
const UNIQUE_TRAIN_COUNT = (() => {
  const seen = new Set<string>();
  return BD_TRAIN_ROUTES.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; }).length;
})();

// Unique divisions derived from data
const ALL_DIVISIONS = (() => {
  const seen = new Set<string>();
  const result: string[] = [];
  BD_TRAIN_ROUTES.forEach(r => {
    if (r.division && !seen.has(r.division)) { seen.add(r.division); result.push(r.division); }
  });
  return result.sort();
})();

// All unique station options for from/to selectors
const ALL_STATION_OPTIONS = (() => {
  const seen = new Set<string>();
  const result: { id: string; name: string; bnName: string }[] = [];
  BD_TRAIN_ROUTES.forEach(r => {
    r.stops.forEach(id => {
      const st = TRAIN_STATIONS[id];
      if (st && !seen.has(id)) { seen.add(id); result.push({ id, name: st.name, bnName: st.bnName }); }
    });
  });
  return result.sort((a, b) => a.name.localeCompare(b.name));
})();

type SearchTab = 'eticket' | 'pnr' | 'live' | 'routemap';
type SortOption = 'name' | 'depart' | 'distance';

// ── Main Export ───────────────────────────────────────────────────────────────
const TrainListPage: React.FC<TrainListPageProps> = ({ userLocation, onBack, embedded = false, onSelectTrain, onRateTrain }) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrain, setSelectedTrain] = useState<BDTrainRoute | null>(null);
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
  const [travelDate, setTravelDate] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('eticket');
  const [pnrInput, setPnrInput] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [trainRatingsMap, setTrainRatingsMap] = useState<Record<string, TrainRatingSummary | null>>({});
  const [favoriteTrainIds, setFavoriteTrainIds] = useState<string[]>(getStoredTrainFavorites);
  const bn = language === 'bn';

  const lbl = (en: string, bnStr: string) => language === 'bn' ? bnStr : en;

  useEffect(() => { trackFeatureUsage('train_list'); }, []);

  const filtered = useMemo(() => {
    const seen = new Set<string>();
    const unique = BD_TRAIN_ROUTES.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    let results = unique;

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      results = results.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.bnName.includes(q) ||
        r.number.includes(q) ||
        r.stops.some(id => {
          const st = TRAIN_STATIONS[id];
          return st && (st.name.toLowerCase().includes(q) || st.bnName.includes(q));
        })
      );
    }

    if (filterFrom) results = results.filter(r => r.stops.includes(filterFrom));

    if (filterTo) {
      results = results.filter(r => {
        if (!r.stops.includes(filterTo)) return false;
        if (filterFrom && r.stops.includes(filterFrom)) {
          return r.stops.indexOf(filterFrom) < r.stops.indexOf(filterTo);
        }
        return true;
      });
    }

    return [...results].sort((a, b) => {
      if (sortBy === 'depart') return a.dhakaDepart.localeCompare(b.dhakaDepart);
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, filterFrom, filterTo, sortBy]);

  useEffect(() => {
    let cancelled = false;
    const idsToFetch = filtered
      .map(r => r.id)
      .filter(id => trainRatingsMap[id] === undefined)
      .slice(0, 60);
    if (idsToFetch.length === 0) return;

    (async () => {
      const entries = await Promise.all(idsToFetch.map(async (id) => [id, await getTrainRatings(id)] as const));
      if (cancelled) return;
      setTrainRatingsMap(prev => {
        const next = { ...prev };
        for (const [id, summary] of entries) next[id] = summary;
        return next;
      });
    })();

    return () => { cancelled = true; };
  }, [filtered, trainRatingsMap]);

  const toggleFavoriteTrain = (trainId: string) => {
    setFavoriteTrainIds(prev => {
      const next = prev.includes(trainId) ? prev.filter(id => id !== trainId) : [...prev, trainId];
      localStorage.setItem(TRAIN_FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Inline detail fallback
  if (!onSelectTrain && selectedTrain) {
    return (
      <TrainDetail
        route={selectedTrain}
        userLocation={userLocation}
        onBack={() => setSelectedTrain(null)}
        language={language}
        onOpenRating={() => onRateTrain?.(selectedTrain)}
        onOpenPhotos={() => window.location.hash = 'train-photos'}
        isFavorite={favoriteTrainIds.includes(selectedTrain.id)}
        onToggleFavorite={() => toggleFavoriteTrain(selectedTrain.id)}
      />
    );
  }

  const SEARCH_TABS: { id: SearchTab; label: string; bnLabel: string; icon: React.ReactNode }[] = [
    { id: 'eticket',  label: 'E-ticket',      bnLabel: 'ই-টিকেট',    icon: <Ticket className="w-3 h-3" /> },
    { id: 'pnr',      label: 'PNR status',    bnLabel: 'PNR স্ট্যাটাস', icon: <Search className="w-3 h-3" /> },
    { id: 'live',     label: 'Live location', bnLabel: 'লাইভ অবস্থান', icon: <Radio className="w-3 h-3" /> },
    { id: 'routemap', label: 'Route map',     bnLabel: 'রুট ম্যাপ',   icon: <Map className="w-3 h-3" /> },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-kj-bg overflow-hidden">
      {/* ── Scrollable body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>

        {/* ── HERO ── */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #f59e0b 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-20 blur-3xl" style={{ background: '#f59e0b', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-15 blur-2xl" style={{ background: '#a855f7', transform: 'translate(-30%,30%)' }} />

          <div className="relative z-10 px-4 pt-5 pb-6">
            {/* Back button + title */}
            <div className="flex items-center gap-3 mb-5">
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors shrink-0"
                  aria-label={bn ? 'ফিরুন' : 'Back'}
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <div>
                <h1 className="font-black text-white text-xl leading-tight">
                  {bn ? 'বাংলাদেশ রেলওয়ে · সকল রুট' : 'Bangladesh Railway · all routes'}
                </h1>
                <p className="text-white/70 text-xs mt-0.5">
                  {bn ? 'সকল ট্রেন ও রুটের তথ্য' : 'Complete train & route information'}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { value: '350+', label: lbl('Trains', 'ট্রেন') },
                { value: '64',   label: lbl('Districts', 'জেলা') },
                { value: '5',    label: lbl('days Advance booking', 'দিন অগ্রিম বুকিং') },
                { value: '★ 4.5', label: lbl('Avg rating', 'গড় রেটিং') },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl px-2 py-2.5 text-center"
                  style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
                >
                  <p className="font-black text-white text-sm leading-none">{stat.value}</p>
                  <p className="text-white/65 text-[9px] mt-1 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Search card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {/* Tab chips */}
              <div className="flex gap-1.5 p-3 pb-0">
                {SEARCH_TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-white text-purple-700'
                        : 'text-white/80 hover:bg-white/15'
                    }`}
                  >
                    {tab.icon}
                    {bn ? tab.bnLabel : tab.label}
                  </button>
                ))}
              </div>

              <div className="p-3 space-y-2">
                {activeTab === 'eticket' && (
                  <>
                    {/* Name search */}
                    <div className="relative">
                      <div
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                      >
                        <Search className="w-3.5 h-3.5 text-white" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={bn ? 'ট্রেনের নাম বা নম্বর খুঁজুন...' : 'Search train name or number...'}
                        className="w-full pl-12 pr-9 py-2.5 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* From / To / Date row */}
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={filterFrom}
                        onChange={e => setFilterFrom(e.target.value)}
                        className="col-span-1 text-xs px-2.5 py-2.5 rounded-xl text-white focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
                      >
                        <option value="" className="text-kj-text">{bn ? 'কোথায় থেকে' : 'From'}</option>
                        {ALL_STATION_OPTIONS.map(st => (
                          <option key={st.id} value={st.id} className="text-kj-text">{bn ? st.bnName : st.name}</option>
                        ))}
                      </select>
                      <select
                        value={filterTo}
                        onChange={e => setFilterTo(e.target.value)}
                        className="col-span-1 text-xs px-2.5 py-2.5 rounded-xl text-white focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
                      >
                        <option value="" className="text-kj-text">{bn ? 'কোথায় যাবেন' : 'To'}</option>
                        {ALL_STATION_OPTIONS.map(st => (
                          <option key={st.id} value={st.id} className="text-kj-text">{bn ? st.bnName : st.name}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={e => setTravelDate(e.target.value)}
                        className="col-span-1 text-xs px-2.5 py-2.5 rounded-xl text-white/80 focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                    </div>

                    {/* Search button */}
                    <button
                      className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
                    >
                      {bn ? 'ট্রেন খুঁজুন' : 'Search Trains'}
                    </button>
                  </>
                )}

                {activeTab === 'pnr' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={pnrInput}
                      onChange={e => setPnrInput(e.target.value)}
                      placeholder={bn ? 'PNR নম্বর দিন...' : 'Enter PNR number...'}
                      className="w-full px-3 py-2.5 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
                    />
                    <button
                      className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
                    >
                      {bn ? 'স্ট্যাটাস দেখুন' : 'Check Status'}
                    </button>
                  </div>
                )}

                {(activeTab === 'live' || activeTab === 'routemap') && (
                  <div className="py-4 text-center">
                    <p className="text-white/70 text-sm">
                      {activeTab === 'live'
                        ? lbl('Select a train to view live location', 'লাইভ অবস্থান দেখতে ট্রেন বেছে নিন')
                        : lbl('Select a train to view route map', 'রুট ম্যাপ দেখতে ট্রেন বেছে নিন')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column content area ── */}
        <div className="px-4 py-5 grid gap-4 md:grid-cols-[1.5fr_1fr]">

          {/* ── LEFT: Popular trains list ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-black text-kj-text text-base">
                {bn ? 'জনপ্রিয় ট্রেনসমূহ' : 'Popular Trains'}
              </h2>
              <span className="text-[10px] bg-kj-chip-bg text-kj-text-dim font-bold px-2 py-0.5 rounded-full">
                {filtered.length} {bn ? 'টি' : 'total'}
              </span>
            </div>

            {/* Featured train cards */}
            {FEATURED_TRAINS.map(train => {
              const matchedRoute = BD_TRAIN_ROUTES.find(r => r.number === train.number);
              return (
                <FeaturedTrainCard
                  key={train.number}
                  train={train}
                  language={language}
                  onDetails={() => {
                    if (matchedRoute) {
                      onSelectTrain ? onSelectTrain(matchedRoute) : setSelectedTrain(matchedRoute);
                    }
                  }}
                />
              );
            })}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 bg-kj-primary-soft dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 mt-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-kj-primary" />
              <span>
                {bn
                  ? 'সময়সূচি পরিবর্তন হতে পারে। সর্বশেষ তথ্যের জন্য বাংলাদেশ রেলওয়ে ওয়েবসাইট দেখুন।'
                  : 'Schedules may change. Check Bangladesh Railway website for latest information.'}
              </span>
            </div>
          </div>

          {/* ── RIGHT: Coach classes + PNR card ── */}
          <div className="space-y-4">
            {/* Coach classes card */}
            <div className="rounded-2xl overflow-hidden border border-kj-line bg-kj-panel">
              <div
                className="px-4 py-3"
                style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)' }}
              >
                <h3 className="font-bold text-white text-sm">{bn ? 'কোচ শ্রেণী ও ভাড়া' : 'Coach Classes'}</h3>
                <p className="text-white/70 text-[11px] mt-0.5">{bn ? 'আনুমানিক ন্যূনতম ভাড়া' : 'Approximate minimum fares'}</p>
              </div>
              <div className="divide-y divide-kj-line">
                {COACH_CLASSES.map(cls => (
                  <div key={cls.name} className="flex items-center justify-between px-4 py-3 hover:bg-kj-chip-bg transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cls.color }} />
                      <span className="text-sm font-semibold text-kj-text">{bn ? cls.bnName : cls.name}</span>
                    </div>
                    <span className="text-sm font-black" style={{ color: cls.color }}>{cls.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PNR status card */}
            <div className="rounded-2xl border border-kj-line bg-kj-panel overflow-hidden">
              <div className="px-4 py-3 border-b border-kj-line">
                <h3 className="font-bold text-kj-text text-sm flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-600" />
                  {bn ? 'PNR স্ট্যাটাস চেক' : 'PNR Status Check'}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-kj-text-dim">
                  {bn
                    ? 'আপনার টিকিটের PNR নম্বর দিয়ে বুকিং স্ট্যাটাস জানুন।'
                    : 'Enter your ticket PNR number to check booking status.'}
                </p>
                <input
                  type="text"
                  placeholder={bn ? 'PNR নম্বর...' : 'PNR number...'}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-kj-chip-bg text-kj-text border border-kj-line focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
                <button
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
                >
                  {bn ? 'স্ট্যাটাস দেখুন' : 'Check Status'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stations grid ── */}
        <div className="px-4 pb-6">
          <h2 className="font-black text-kj-text text-base mb-3">
            {bn ? 'প্রধান স্টেশনসমূহ' : 'Major Stations'}
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {POPULAR_STATIONS.map(station => (
              <button
                key={station.name}
                onClick={() => {
                  setSearchQuery(bn ? station.bnName : station.name);
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-kj-line bg-kj-panel hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all active:scale-95"
              >
                <span className="text-2xl leading-none">{station.emoji}</span>
                <span className="text-[11px] font-bold text-kj-text text-center leading-tight">
                  {bn ? station.bnName : station.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-24 md:h-4" />
      </div>
    </div>
  );
};

export default TrainListPage;
