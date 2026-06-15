import React, { useState, useMemo, useEffect } from 'react';
import SponsoredAdSlot from './SponsoredAdSlot';
import {
  Train, Search, ArrowRight, Clock, CalendarX, Info,
  ArrowLeft, MapPin, Navigation,
  Coins, AlertCircle, X, CheckCircle2, SlidersHorizontal, Star, Heart, Ticket, Radio, Map
} from 'lucide-react';
import { Train3D } from './design/Vehicles3D';

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
    offDay: 'Tue',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    badgeBg: '#7c3aed',
    color: '#7c3aed',
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
    offDay: null,
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    badgeBg: '#059669',
    color: '#059669',
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
    offDay: 'Tue',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
    badgeBg: '#1d4ed8',
    color: '#1d4ed8',
  },
  {
    number: '729',
    name: 'Jahanabad Express',
    bnName: 'জাহানাবাদ এক্সপ্রেস',
    route: 'Dhaka → Khulna (Padma)',
    bnRoute: 'ঢাকা → খুলনা (পদ্মা)',
    depart: '06:00 AM',
    arrive: '09:45 AM',
    duration: '3h 45m',
    fare: '৳445–1,289',
    offDay: null,
    gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    badgeBg: '#b45309',
    color: '#b45309',
    badge: 'New',
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
    offDay: 'Wed',
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
    badgeBg: '#b91c1c',
    color: '#b91c1c',
  },
];

// Major stations grid
const MAJOR_STATIONS = [
  { emoji: '🏛', name: 'Kamalapur', bnName: 'কমলাপুর', city: 'Dhaka', cityBn: 'ঢাকা' },
  { emoji: '✈️', name: 'Airport', bnName: 'এয়ারপোর্ট', city: 'Dhaka', cityBn: 'ঢাকা' },
  { emoji: '🏞', name: 'Chittagong', bnName: 'চট্টগ্রাম', city: 'Chittagong', cityBn: 'চট্টগ্রাম' },
  { emoji: '🍵', name: 'Sylhet', bnName: 'সিলেট', city: 'Sylhet', cityBn: 'সিলেট' },
  { emoji: '🥭', name: 'Rajshahi', bnName: 'রাজশাহী', city: 'Rajshahi', cityBn: 'রাজশাহী' },
  { emoji: '🌳', name: 'Khulna', bnName: 'খুলনা', city: 'Khulna', cityBn: 'খুলনা' },
  { emoji: '🏖', name: "Cox's Bazar", bnName: 'কক্সবাজার', city: "Cox's Bazar", cityBn: 'কক্সবাজার' },
  { emoji: '🏭', name: 'Gazipur', bnName: 'গাজীপুর', city: 'Gazipur', cityBn: 'গাজীপুর' },
];

// Coach classes data
const COACH_CLASSES = [
  { emoji: '🛏', name: 'AC Berth', bnName: 'এসি বার্থ', price: '৳2,656', desc: 'First class sleeper', descBn: 'প্রথম শ্রেণী ঘুমের আসন', color: '#7c3aed' },
  { emoji: '❄️', name: 'Snigdha', bnName: 'স্নিগ্ধা', price: '৳719', desc: 'AC chair', descBn: 'এসি চেয়ার', color: '#1d4ed8' },
  { emoji: '💺', name: 'AC Chair', bnName: 'এসি চেয়ার', price: '৳540', desc: 'AC daytime', descBn: 'এসি দিনের আসন', color: '#059669' },
  { emoji: '🪑', name: 'Shovon Chair', bnName: 'শোভন চেয়ার', price: '৳375', desc: 'Non-AC', descBn: 'নন-এসি', color: '#b45309' },
  { emoji: '👥', name: 'Shovon', bnName: 'শোভন', price: '৳265', desc: 'Bench basic', descBn: 'বেঞ্চ সাধারণ', color: '#dc2626' },
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

  const SEARCH_TABS: { id: SearchTab; label: string; bnLabel: string; icon: string }[] = [
    { id: 'eticket',  label: 'E-ticket',      bnLabel: 'ই-টিকেট',      icon: '🚆' },
    { id: 'pnr',      label: 'PNR status',    bnLabel: 'PNR স্ট্যাটাস', icon: '🔍' },
    { id: 'live',     label: 'Live location', bnLabel: 'লাইভ অবস্থান',  icon: '📍' },
    { id: 'routemap', label: 'Route map',     bnLabel: 'রুট ম্যাপ',     icon: '🛤' },
  ];

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">

      {/* ── Sticky back bar ── */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-purple-400/60 hover:text-purple-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <span className="font-bengali font-bold text-base text-kj-text">
          {lbl('Bangladesh Railway', 'বাংলাদেশ রেলওয়ে')}
        </span>
      </div>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden px-4 pt-6 pb-0"
        style={{ background: 'linear-gradient(135deg,#5b21b6 0%,#7c3aed 50%,#f59e0b 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -right-12 -top-14 w-60 h-60 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <div className="absolute left-1/3 -bottom-20 w-52 h-52 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.07)' }} />

        <div className="relative">
          {/* Eyebrow */}
          <span className="font-sans text-[11px] font-bold uppercase tracking-[1.4px] text-white/80">
            ✦ Bangladesh Railway · সকল রুট / all routes
          </span>

          {/* h1 */}
          <h1 className="font-bengali font-bold text-white leading-[1.1] tracking-tight text-balance mt-2 mb-2" style={{ fontSize: 24 }}>
            {lbl('Bangladesh Railway · all routes', 'বাংলাদেশ রেলওয়ে · সকল রুট')}
          </h1>

          {/* Subtitle */}
          <p className="font-bengali text-[13px] text-white/88 leading-relaxed max-w-[400px]">
            {lbl(
              '350+ intercity trains, e-ticket booking, live tracking — including Padma Bridge route.',
              '৩৫০+ আন্তঃনগর ট্রেন, ই-টিকেট বুকিং, লাইভ ট্র্যাকিং — পদ্মা সেতু রুট সহ।'
            )}
          </p>

          {/* Stat strip */}
          <div className="flex gap-5 mt-4 mb-5 flex-wrap">
            {[
              { v: '350+', l: lbl('Trains', 'ট্রেন') },
              { v: '64',   l: lbl('Districts', 'জেলা') },
              { v: '5 days', l: lbl('Advance', 'অগ্রিম') },
              { v: '★4.5', l: lbl('Rating', 'রেটিং') },
            ].map(s => (
              <div key={s.l}>
                <div className="font-sans font-extrabold text-[18px] tracking-tight leading-none text-white">{s.v}</div>
                <div className="font-sans text-[9px] font-bold uppercase tracking-[1.2px] text-white/80 mt-1">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Search card inside hero */}
          <div
            className="rounded-2xl overflow-hidden mb-0"
            style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.22)' }}
          >
            {/* Tab chips */}
            <div className="flex gap-1.5 p-3 pb-2 overflow-x-auto scrollbar-none">
              {SEARCH_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-700'
                      : 'text-white/80 hover:bg-white/15'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {bn ? tab.bnLabel : tab.label}
                </button>
              ))}
            </div>

            <div className="px-3 pb-3 space-y-2">
              {activeTab === 'eticket' && (
                <>
                  {/* Name search */}
                  <div className="relative">
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                    >
                      <Search className="w-3.5 h-3.5 text-white" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={lbl(
                        "e.g. Cox's Bazar Express, Sonar Bangla, #786...",
                        'যেমন: কক্সবাজার এক্সপ্রেস, সোনার বাংলা, #৭৮৬...'
                      )}
                      className="w-full pl-12 pr-9 py-2.5 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 font-bengali"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Name/Number/PNR chips */}
                  <div className="flex gap-1.5">
                    {[lbl('Name','নাম'), lbl('Number','নম্বর'), 'PNR'].map(chip => (
                      <span key={chip} className="px-2 py-0.5 rounded text-[9px] font-bold font-sans" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* To destination + Date row */}
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filterTo}
                      onChange={e => setFilterTo(e.target.value)}
                      className="text-xs px-2.5 py-2.5 rounded-xl text-white focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
                    >
                      <option value="" className="text-kj-text bg-kj-bg">{lbl('To destination','গন্তব্য বেছে নিন')}</option>
                      {ALL_STATION_OPTIONS.map(st => (
                        <option key={st.id} value={st.id} className="text-kj-text bg-kj-bg">{bn ? st.bnName : st.name}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={e => setTravelDate(e.target.value)}
                      className="text-xs px-2.5 py-2.5 rounded-xl text-white/80 focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
                    />
                  </div>

                  {/* Search button */}
                  <button
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 active:scale-[0.98] font-bengali"
                    style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)', boxShadow: '0 6px 20px -8px #7c3aed' }}
                  >
                    {lbl('Search Trains', 'ট্রেন খুঁজুন')}
                  </button>
                </>
              )}

              {activeTab === 'pnr' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={pnrInput}
                    onChange={e => setPnrInput(e.target.value)}
                    placeholder={lbl('Enter PNR number...', 'PNR নম্বর দিন...')}
                    className="w-full px-3 py-2.5 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
                  />
                  <button
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)', boxShadow: '0 6px 20px -8px #7c3aed' }}
                  >
                    {lbl('Check Status', 'স্ট্যাটাস দেখুন')}
                  </button>
                </div>
              )}

              {(activeTab === 'live' || activeTab === 'routemap') && (
                <div className="py-4 text-center">
                  <p className="text-white/70 text-sm font-bengali">
                    {activeTab === 'live'
                      ? lbl('Select a train below to view live location', 'লাইভ অবস্থান দেখতে নিচে ট্রেন বেছে নিন')
                      : lbl('Select a train below to view route map', 'রুট ম্যাপ দেখতে নিচে ট্রেন বেছে নিন')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="h-6" />
      </div>

      {/* ── Two-column content area ── */}
      <div className="px-4 py-5 grid gap-4 md:grid-cols-[1.5fr_1fr] max-w-5xl mx-auto w-full">

        {/* ── LEFT: Popular trains from Dhaka ── */}
        <div className="space-y-3">
          <div className="mb-1">
            <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
              {lbl('Popular trains · from Dhaka', 'জনপ্রিয় ট্রেন · ঢাকা থেকে')}
            </p>
            <div className="flex items-center justify-between mt-0.5">
              <h2 className="font-bengali font-bold text-base text-kj-text">
                {lbl('Popular Trains from Dhaka', 'জনপ্রিয় ট্রেন · ঢাকা থেকে')}
              </h2>
              <span className="text-[10px] bg-kj-chip-bg text-kj-text-dim font-bold px-2 py-0.5 rounded-full font-sans">
                {filtered.length} {lbl('total', 'টি')}
              </span>
            </div>
          </div>

          {FEATURED_TRAINS.map(train => {
            const matchedRoute = BD_TRAIN_ROUTES.find(r => r.number === train.number);
            return (
              <div key={train.number} className="dc-card rounded-2xl overflow-hidden">
                {/* Card top: gradient badge + name + route + fare */}
                <div className="p-4 flex items-start gap-3">
                  {/* 48×48 gradient badge */}
                  <div
                    className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 text-white"
                    style={{ background: train.gradient, minWidth: 48 }}
                  >
                    <span className="font-sans font-black text-[11px] leading-none">#{train.number}</span>
                    <span className="text-base leading-none mt-0.5">🚆</span>
                  </div>

                  {/* Name + route */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bengali font-bold text-kj-text text-sm leading-tight">
                        {bn ? train.bnName : train.name}
                      </p>
                      {train.badge && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans"
                          style={{ background: `${train.color}22`, color: train.color }}
                        >
                          {train.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-bengali text-[12px] text-kj-text-dim mt-0.5 truncate">
                      {bn ? train.bnRoute : train.route}
                    </p>
                  </div>

                  {/* Fare right-aligned */}
                  <div className="text-right shrink-0">
                    <p className="font-sans font-bold text-sm" style={{ color: train.color }}>{train.fare}</p>
                    <p className="text-[9px] text-kj-text-faint font-sans mt-0.5">{lbl('from', 'থেকে')}</p>
                  </div>
                </div>

                {/* Timeline bottom */}
                <div
                  className="px-4 py-3 flex items-center gap-3 border-t border-kj-line"
                  style={{ background: `${train.color}08` }}
                >
                  {/* Dep */}
                  <div className="text-center shrink-0">
                    <p className="font-sans font-black text-base text-kj-text leading-none">{train.depart}</p>
                    <p className="text-[9px] text-kj-text-faint mt-0.5">{lbl('Dep', 'ছাড়ে')}</p>
                  </div>

                  {/* Duration line */}
                  <div className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1 w-full">
                      <div className="flex-1 h-px bg-kj-line" />
                      <span className="text-[10px] font-semibold text-kj-text-dim px-1 shrink-0 font-sans">{train.duration}</span>
                      <div className="flex-1 h-px bg-kj-line" />
                    </div>
                    <ArrowRight className="w-3 h-3 text-kj-text-faint" />
                  </div>

                  {/* Arr */}
                  <div className="text-center shrink-0">
                    <p className="font-sans font-black text-base text-kj-text leading-none">{train.arrive}</p>
                    <p className="text-[9px] text-kj-text-faint mt-0.5">{lbl('Arr', 'পৌঁছায়')}</p>
                  </div>

                  {/* Off day + Details */}
                  <div className="flex items-center gap-2 shrink-0 ml-1">
                    {train.offDay && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-sans bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                        Off {train.offDay}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        if (matchedRoute) {
                          onSelectTrain ? onSelectTrain(matchedRoute) : setSelectedTrain(matchedRoute);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-opacity hover:opacity-90 active:scale-95 font-sans"
                      style={{ background: train.gradient }}
                    >
                      {lbl('Details', 'বিস্তারিত')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-kj-primary-soft dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 mt-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-kj-primary" />
            <span className="font-bengali">
              {lbl(
                'Schedules may change. Check Bangladesh Railway website for latest information.',
                'সময়সূচি পরিবর্তন হতে পারে। সর্বশেষ তথ্যের জন্য বাংলাদেশ রেলওয়ে ওয়েবসাইট দেখুন।'
              )}
            </span>
          </div>
        </div>

        {/* ── RIGHT: Coach classes + Ad + PNR ── */}
        <div className="space-y-4">

          {/* Coach classes card */}
          <div className="dc-card rounded-2xl overflow-hidden">
            <div
              className="px-4 py-3"
              style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)' }}
            >
              <h3 className="font-bengali font-bold text-white text-sm">
                {lbl('Coach Classes', 'কোচ শ্রেণী ও ভাড়া')}
              </h3>
              <p className="font-bengali text-white/70 text-[11px] mt-0.5">
                {lbl('Approximate minimum fares', 'আনুমানিক ন্যূনতম ভাড়া')}
              </p>
            </div>
            <div className="divide-y divide-kj-line">
              {COACH_CLASSES.map(cls => (
                <div key={cls.name} className="flex items-center gap-3 px-4 py-3 hover:bg-kj-chip-bg transition-colors">
                  <span className="text-xl leading-none shrink-0">{cls.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bengali font-semibold text-kj-text text-sm leading-tight">
                      {bn ? cls.bnName : cls.name}
                    </p>
                    <p className="font-bengali text-[11px] text-kj-text-faint">
                      {bn ? cls.descBn : cls.desc}
                    </p>
                  </div>
                  <span className="font-sans font-black text-sm shrink-0" style={{ color: cls.color }}>{cls.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ad slot */}
          <SponsoredAdSlot language={language as 'en' | 'bn'} size="300x250" compact />

          {/* PNR check card */}
          <div className="dc-card rounded-2xl overflow-hidden" style={{ background: 'var(--kj-primary-soft)' }}>
            <div className="px-4 py-3 border-b border-kj-line">
              <h3 className="font-bengali font-bold text-kj-text text-sm flex items-center gap-2">
                <span>🔍</span>
                {lbl('PNR Status Check', 'PNR স্ট্যাটাস চেক')}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                defaultValue="KJ72X9PQ"
                placeholder={lbl('PNR number...', 'PNR নম্বর...')}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-kj-chip-bg text-kj-text border border-kj-line focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-sans"
              />
              <button
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white font-bengali"
                style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)', boxShadow: '0 6px 20px -8px #7c3aed' }}
              >
                {lbl('Check Status', 'স্ট্যাটাস দেখুন')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Major stations grid ── */}
      <div className="px-4 pb-6 max-w-5xl mx-auto w-full">
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
            {lbl('Railway network · Bangladesh', 'রেলওয়ে নেটওয়ার্ক · বাংলাদেশ')}
          </p>
          <h2 className="font-bengali font-bold text-base text-kj-text mt-0.5">
            {lbl('Major Stations', 'প্রধান স্টেশনসমূহ')}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MAJOR_STATIONS.map(station => (
            <button
              key={station.name}
              onClick={() => setSearchQuery(bn ? station.bnName : station.name)}
              className="dc-card rounded-2xl p-3.5 flex flex-col items-center gap-2 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all active:scale-95 text-center"
            >
              <span className="text-2xl leading-none">{station.emoji}</span>
              <div>
                <p className="font-bengali font-bold text-kj-text text-[12px] leading-tight">
                  {bn ? station.bnName : station.name}
                </p>
                <p className="font-bengali text-[10px] text-kj-text-faint mt-0.5">
                  {bn ? station.cityBn : station.city}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
};

export default TrainListPage;
