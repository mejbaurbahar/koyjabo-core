import React, { useState, useMemo, useEffect } from 'react';
import {
  Train, Search, ArrowRight, Clock, CalendarX, Info,
  ArrowLeft, MapPin, Navigation,
  Coins, AlertCircle, X, CheckCircle2, SlidersHorizontal, ChevronDown, Star, Heart
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
import AdSenseAd from './AdSenseAd';



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
  Intercity: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
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
    /* Light: white bg — Dark: deep navy gradient */
    <div className="flex flex-col flex-1 min-h-0 w-full bg-[#0F172A] dark:bg-[#0F172A] overflow-hidden">

      {/* Sub-header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
        <button
          onClick={onBack}
          className="p-2 -ml-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
          aria-label={bn ? 'ফিরুন' : 'Back'}
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-white/80" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-gray-900 dark:text-white truncate">
              {bn ? route.bnName : route.name}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-white/15 text-gray-600 dark:text-white/80 rounded-full">
              #{route.number}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[route.type] || TYPE_COLORS.Local}`}>
              {bn ? (TYPE_BN[route.type] ?? route.type) : route.type}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-white/55 mt-0.5">
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
          className="w-8 h-8 flex items-center justify-center leading-none rounded-full bg-white/90 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shrink-0"
          aria-label={isFavorite ? (bn ? 'ফেভারিট থেকে সরান' : 'Remove from favorites') : (bn ? 'ফেভারিটে যোগ করুন' : 'Add to favorites')}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400 dark:text-gray-500'}`} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y pb-nav-safe" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Map */}
        <div className="h-[280px] md:h-[340px] bg-slate-100 dark:bg-slate-900 relative">
          <TrainRouteMap
            route={route}
            userLocation={userLocation}
            highlightFromId={fromId || undefined}
            highlightToId={toId || undefined}
            language={language}
            currentStopId={nearestStopIdx >= 0 ? route.stops[nearestStopIdx] : undefined}
          />
        </div>

        <AdSenseAd adSlot="auto" className="my-4 w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" />



        <div className="p-4 space-y-4">

          {/* ── Schedule ─────────────────────────────────────────────────── */}
          <div className="bg-gray-50 dark:bg-white/10 rounded-2xl p-4 border border-gray-200 dark:border-white/15">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {bn ? 'সময়সূচি' : 'Schedule'}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-white/55">
                  {bn ? `${fromSt?.bnName || 'শুরু'} ছাড়ে` : `Departs ${fromSt?.name || 'Start'}`}
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-base">{route.dhakaDepart}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-white/55">{bn ? 'গন্তব্যে পৌঁছায়' : 'Arrives'}</p>
                <p className="font-bold text-gray-900 dark:text-white text-base">{route.destinationArrive}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-white/55">{bn ? 'ফিরতি ছাড়ে' : 'Return Departs'}</p>
                <p className="font-bold text-gray-900 dark:text-white text-base">{route.returnDepart}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-white/55">
                  {bn ? `${fromSt?.bnName || 'ঢাকা'} ফেরে` : `Returns ${fromSt?.name || 'Dhaka'}`}
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-base">{route.dhakaArrive}</p>
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
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-white/55">
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span>{bn ? `মোট দূরত্ব: ~${route.distanceKm} কিমি` : `Total distance: ~${route.distanceKm} km`}</span>
            </div>
          </div>

          {/* ── Station timeline ──────────────────────────────────────────── */}
          <div className="bg-gray-50 dark:bg-white/10 rounded-2xl border border-gray-200 dark:border-white/15 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {bn ? `স্টেশন (${route.stops.length}টি)` : `Stations (${route.stops.length})`}
                {nearestStopIdx >= 0 && (
                  <span className="ml-auto text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse inline-block" />
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
                    {/* ── Virtual "You are here" row injected before nearest station ── */}
                    {isNearUser && userLocation && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center" style={{ width: 20 }}>
                          {/* Top connector into this virtual row (solid from above if passed, else gray) */}
                          <div className={`w-px flex-none h-2 ${isPassed ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-gray-300 dark:bg-white/25'}`} />
                          {/* Pulsing blue user dot */}
                          <div className="relative shrink-0 z-10">
                            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow-lg shadow-blue-500/50" />
                            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-60" />
                          </div>
                          {/* Dashed connector from user-dot down to nearest station */}
                          <div className="flex-1 min-h-[24px] flex flex-col items-center gap-0.5 py-0.5">
                            {[0,1,2,3].map(i => (
                              <div key={i} className="w-px h-1.5 bg-blue-400 dark:bg-blue-500 rounded" />
                            ))}
                          </div>
                        </div>
                        <div className="pb-1 flex-1 min-w-0 pt-0">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {bn ? 'আপনার বর্তমান অবস্থান' : 'Your current location'}
                          </span>
                          <p className="text-[10px] text-blue-500 dark:text-blue-400 font-semibold mt-0.5 flex items-center gap-1">
                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse inline-block" />
                            {bn ? 'আপনি এখানে আছেন' : 'You are here'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ── Actual stop row ── */}
                    <div className="flex gap-3">
                      {/* Timeline column */}
                      <div className="flex flex-col items-center" style={{ width: 20 }}>
                        {/* Top connector — hide it when the virtual row already drew the dashed line */}
                        {!(isNearUser && userLocation) && (
                          <div className={`w-px flex-none h-2 ${
                            isFirst ? 'bg-transparent'
                            : isPassed ? 'bg-emerald-400 dark:bg-emerald-500'
                            : 'bg-gray-300 dark:bg-white/25'
                          }`} />
                        )}
                        {isNearUser && userLocation && <div className="flex-none h-0" />}
                        {/* Dot */}
                        {isNearUser ? (
                          /* Nearest station: orange pin dot */
                          <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-300 shadow-md shadow-orange-500/40 shrink-0 z-10" />
                        ) : isPassed ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 dark:bg-emerald-400 border-2 border-emerald-300 flex items-center justify-center shrink-0 z-10">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        ) : isFirst ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 dark:bg-emerald-400 border-2 border-emerald-400 dark:border-emerald-300 shadow-lg shadow-emerald-500/30 shrink-0 z-10" />
                        ) : isLast ? (
                          <div className="w-4 h-4 rounded-full bg-slate-500 dark:bg-white/80 border-2 border-slate-400 dark:border-white/50 shadow shrink-0 z-10" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-white/20 border border-gray-400 dark:border-white/35 shrink-0 z-10 mt-0.5" />
                        )}
                        {/* Bottom connector */}
                        {!isLast && (
                          <div className={`w-px flex-1 min-h-[20px] ${
                            isPassed ? 'bg-emerald-400 dark:bg-emerald-500'
                            : isFirst ? 'bg-gradient-to-b from-emerald-500/70 dark:from-emerald-400/80 to-gray-300 dark:to-white/25'
                            : 'bg-gray-300 dark:bg-white/25'
                          }`} />
                        )}
                      </div>
                      {/* Stop name */}
                      <div className={`pb-3 flex-1 min-w-0 ${isMid && !isNearUser ? 'pt-0.5' : 'pt-0'}`}>
                        <span className={`leading-snug ${
                          isNearUser ? 'text-sm font-bold text-orange-600 dark:text-orange-400'
                          : isPassed ? 'text-xs text-emerald-600 dark:text-emerald-400 line-through opacity-60'
                          : isFirst || isLast ? 'text-sm font-bold text-gray-900 dark:text-white'
                          : 'text-xs text-gray-500 dark:text-white/60'
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
                          <p className="text-[10px] text-gray-400 dark:text-white/40 mt-0.5">
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

          <AdSenseAd adSlot="auto" className="my-2 w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" />



          {/* ── Fare Calculator ───────────────────────────────────────────── */}
          {/* No overflow-hidden so SearchableSelect dropdown isn't clipped */}
          <div className="bg-gray-50 dark:bg-white/10 rounded-2xl border border-gray-200 dark:border-white/15">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 rounded-t-2xl">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                {bn ? 'ভাড়া ও সময় ক্যালকুলেটর' : 'Fare & Time Calculator'}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-white/60 mb-1 block">
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
                  <label className="text-xs font-medium text-gray-500 dark:text-white/60 mb-1 block">
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
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-400/15 rounded-xl border border-emerald-200 dark:border-emerald-400/20">
                      <div className="flex items-center gap-2 text-sm">
                        <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium text-gray-700 dark:text-white/80">
                          ~{Math.round(journeyInfo.distKm)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="font-medium text-gray-700 dark:text-white/80">{journeyInfo.travelTime}</span>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/15">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-white/10 text-xs text-gray-500 dark:text-white/60">
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
                            <tr key={row.label} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="px-3 py-2.5 text-gray-700 dark:text-white/75">{row.label}</td>
                              <td className="px-3 py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                                ৳{formatNumber(row.val)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-white/40 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      {bn
                        ? 'ভাড়া আনুমানিক। সঠিক ভাড়ার জন্য বাংলাদেশ রেলওয়ে ওয়েবসাইট দেখুন।'
                        : 'Fare is approximate. Check Bangladesh Railway website for exact fares.'}
                    </p>
                  </div>

                  <AdSenseAd adSlot="auto" className="my-8 w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" />
                </>
              ) : (
                <p className="text-xs text-gray-400 dark:text-white/40 text-center py-2">
                  {bn ? 'দুটি স্টেশন সিলেক্ট করুন' : 'Select two stations to calculate fare'}
                </p>
              )}
            </div>
          </div>



          {/* Spacer for mobile bottom nav */}

          <div className="h-24 md:h-4" />
        </div>
      </div>
    </div>
  );
}

// ── Train Card ────────────────────────────────────────────────────────────────
function TrainCard({
  route, onClick, onRateClick, language, ratingSummary, isFavorite, onToggleFavorite
}: {
  route: BDTrainRoute;
  onClick: () => void;
  onRateClick?: () => void;
  language: string;
  ratingSummary?: TrainRatingSummary | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const bn = language === 'bn';
  const fromStation = TRAIN_STATIONS[route.from];
  const toStation   = TRAIN_STATIONS[route.to];

  const hasRating = (ratingSummary?.count ?? 0) > 0;
  const avgRating = ratingSummary?.average ?? 0;
  const ratingPercent = Math.round((avgRating / 5) * 100);

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
              {bn ? route.bnName : route.name}
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded shrink-0">
              #{route.number}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[route.type] || TYPE_COLORS.Local}`}>
            {bn ? (TYPE_BN[route.type] ?? route.type) : route.type}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className="w-8 h-8 flex items-center justify-center leading-none rounded-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors shrink-0"
            aria-label={isFavorite ? `Remove ${route.name} from favorites` : `Add ${route.name} to favorites`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400 dark:text-gray-500'}`} />
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: route.color + '20', color: route.color }}
          >
            <Train className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
            {bn ? fromStation?.bnName : fromStation?.name}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="flex-1 min-w-0 text-right">
          <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
            {bn ? toStation?.bnName : toStation?.name}
          </p>
        </div>
      </div>

      {/* Times */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-emerald-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">{route.dhakaDepart}</span>
          <span>→</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{route.destinationArrive}</span>
        </div>
        {route.offDay !== 'No Off Day' && route.offDay !== 'No Off' && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <CalendarX className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[100px]">{route.offDay.split(',')[0]}</span>
          </div>
        )}
      </div>

      {/* Fare range */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg w-fit">
          <Coins className="w-3 h-3 shrink-0" />
          <span>৳{route.fare.shuvan}{route.fare.acBerth ? ` – ৳${route.fare.acBerth.toLocaleString()}` : ''}</span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRateClick?.();
          }}
          className={`px-2 py-1 rounded-md border text-[10px] font-bold leading-none transition-colors ${hasRating
            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
          aria-label={hasRating ? `View rating for ${route.name}` : `Rate ${route.name}`}
        >
          {hasRating
            ? `★ ${avgRating.toFixed(1)} · ${ratingPercent}%`
            : (bn ? '☆ রেটিং' : '☆ Rate')}
        </button>
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

type SortOption = 'name' | 'depart' | 'distance';

// ── Main Export ───────────────────────────────────────────────────────────────
const TrainListPage: React.FC<TrainListPageProps> = ({ userLocation, onBack, embedded = false, onSelectTrain, onRateTrain }) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrain, setSelectedTrain] = useState<BDTrainRoute | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterDivision, setFilterDivision] = useState<string>('');
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [trainRatingsMap, setTrainRatingsMap] = useState<Record<string, TrainRatingSummary | null>>({});
  const [favoriteTrainIds, setFavoriteTrainIds] = useState<string[]>(getStoredTrainFavorites);
  const [listFilter, setListFilter] = useState<'ALL' | 'FAVORITES'>('ALL');
  const bn = language === 'bn';

  useEffect(() => { trackFeatureUsage('train_list'); }, []);

  const filtered = useMemo(() => {
    // Deduplicate by id (keep first occurrence)
    const seen = new Set<string>();
    const unique = BD_TRAIN_ROUTES.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    let results = unique;

    // Text search across name, number, bnName, all stop names
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

    // Type filter
    if (filterType) results = results.filter(r => r.type === filterType);

    // Division filter
    if (filterDivision) results = results.filter(r => r.division === filterDivision);

    // From station filter — train must stop at this station
    if (filterFrom) results = results.filter(r => r.stops.includes(filterFrom));

    // To station filter — train must stop at this station AND after filterFrom if both set
    if (filterTo) {
      results = results.filter(r => {
        if (!r.stops.includes(filterTo)) return false;
        if (filterFrom && r.stops.includes(filterFrom)) {
          return r.stops.indexOf(filterFrom) < r.stops.indexOf(filterTo);
        }
        return true;
      });
    }

    // Sort
    const sorted = [...results].sort((a, b) => {
      if (sortBy === 'depart') return a.dhakaDepart.localeCompare(b.dhakaDepart);
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      return a.name.localeCompare(b.name);
    });

    if (listFilter === 'FAVORITES') {
      return sorted.filter(r => favoriteTrainIds.includes(r.id));
    }

    return sorted;
  }, [searchQuery, filterType, filterDivision, filterFrom, filterTo, sortBy, listFilter, favoriteTrainIds]);

  const activeFilterCount = [filterType, filterDivision, filterFrom, filterTo].filter(Boolean).length;

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

  const nearestStation = useMemo(() => {
    if (!userLocation) return null;
    let minDist = Infinity;
    let nearest: { station: (typeof TRAIN_STATIONS)[string]; distKm: number } | null = null;
    Object.values(TRAIN_STATIONS).forEach(st => {
      const d = haversineKm(userLocation.lat, userLocation.lng, st.lat, st.lng);
      if (d < minDist) { minDist = d; nearest = { station: st, distKm: d }; }
    });
    return nearest;
  }, [userLocation]);

  const clearAllFilters = () => {
    setFilterType(''); setFilterDivision(''); setFilterFrom(''); setFilterTo(''); setSearchQuery('');
  };

  const toggleFavoriteTrain = (trainId: string) => {
    setFavoriteTrainIds(prev => {
      const next = prev.includes(trainId) ? prev.filter(id => id !== trainId) : [...prev, trainId];
      localStorage.setItem(TRAIN_FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Inline detail fallback (when no external handler)
  if (!onSelectTrain && selectedTrain) {
    return (
      <TrainDetail
        route={selectedTrain}
        userLocation={userLocation}
        onBack={() => setSelectedTrain(null)}
        language={language}
        onOpenRating={() => onRateTrain?.(selectedTrain)}
        onOpenPhotos={() => window.location.hash = `train-photos`}
        isFavorite={favoriteTrainIds.includes(selectedTrain.id)}
        onToggleFavorite={() => toggleFavoriteTrain(selectedTrain.id)}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-[#0F172A] dark:bg-[#0F172A] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-xl shadow-emerald-500/30">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative z-10 px-4 pt-4 pb-4">
          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-xl leading-tight drop-shadow-md">
                {bn ? 'বাংলাদেশ রেলওয়ে' : 'Bangladesh Railway'}
              </h1>
              <p className="text-white/80 text-xs">
                {bn ? `${UNIQUE_TRAIN_COUNT}টি ট্রেন` : `${UNIQUE_TRAIN_COUNT} Trains`}
              </p>
            </div>
          </div>
          {/* AdSense removed from fixed header to prevent blocking content */}




          {/* Search + filter toggle row */}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={bn ? 'ট্রেন বা স্টেশন খুঁজুন...' : 'Search train, station, number...'}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/15 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/10"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`relative px-3 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 transition-all ${showFilters ? 'bg-white text-emerald-700 border-white' : 'bg-white/15 text-white border-white/20 hover:bg-white/25'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {bn ? 'ফিল্টার' : 'Filter'}
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Expandable filter panel */}
          {showFilters && (
            <div className="mt-3 p-3 bg-white/15 rounded-xl border border-white/20 space-y-2 animate-in slide-in-from-top-2 duration-200">
              {/* Row 1: From → To */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">{bn ? 'কোথায় থেকে' : 'From'}</label>
                  <select
                    value={filterFrom}
                    onChange={e => setFilterFrom(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg bg-white/20 text-white border border-white/20 focus:outline-none"
                  >
                    <option value="" className="text-gray-800">{bn ? 'সব স্টেশন' : 'Any station'}</option>
                    {ALL_STATION_OPTIONS.map(st => (
                      <option key={st.id} value={st.id} className="text-gray-800">{bn ? st.bnName : st.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">{bn ? 'কোথায় যাবেন' : 'To'}</label>
                  <select
                    value={filterTo}
                    onChange={e => setFilterTo(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg bg-white/20 text-white border border-white/20 focus:outline-none"
                  >
                    <option value="" className="text-gray-800">{bn ? 'সব স্টেশন' : 'Any station'}</option>
                    {ALL_STATION_OPTIONS.map(st => (
                      <option key={st.id} value={st.id} className="text-gray-800">{bn ? st.bnName : st.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Row 2: Type + Division */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">{bn ? 'ট্রেনের ধরন' : 'Type'}</label>
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg bg-white/20 text-white border border-white/20 focus:outline-none"
                  >
                    <option value="" className="text-gray-800">{bn ? 'সব ধরন' : 'All types'}</option>
                    {(['Express', 'Intercity', 'Mail', 'Local'] as const).map(t => (
                      <option key={t} value={t} className="text-gray-800">{bn ? (TYPE_BN[t] ?? t) : t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">{bn ? 'বিভাগ' : 'Division'}</label>
                  <select
                    value={filterDivision}
                    onChange={e => setFilterDivision(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg bg-white/20 text-white border border-white/20 focus:outline-none"
                  >
                    <option value="" className="text-gray-800">{bn ? 'সব বিভাগ' : 'All divisions'}</option>
                    {ALL_DIVISIONS.map(d => (
                      <option key={d} value={d} className="text-gray-800">{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Row 3: Sort */}
              <div>
                <label className="text-[10px] font-bold text-white/70 block mb-1">{bn ? 'সাজানো' : 'Sort by'}</label>
                <div className="flex gap-1.5">
                  {([['name', bn ? 'নাম' : 'Name'], ['depart', bn ? 'সময়' : 'Depart'], ['distance', bn ? 'দূরত্ব' : 'Distance']] as [SortOption, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setSortBy(val)}
                      className={`flex-1 text-xs py-1 rounded-lg font-bold transition-colors ${sortBy === val ? 'bg-white text-emerald-700' : 'bg-white/20 text-white'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Clear */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="w-full text-xs py-1.5 rounded-lg text-white/80 hover:text-white font-bold border border-white/20 hover:border-white/40 transition-colors"
                >
                  {bn ? 'সব ফিল্টার মুছুন' : 'Clear all filters'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nearest station banner — only show when within Bangladesh (~500 km radius) */}
      {nearestStation && nearestStation.distKm < 500 && (
        <div className="shrink-0 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow-sm" />
              <div className="flex gap-0.5">
                {[0,1,2,3].map(i => (
                  <div key={i} className="w-1.5 h-px bg-blue-300 dark:bg-blue-600 rounded" />
                ))}
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                <Train className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate leading-tight">
                {bn ? nearestStation.station.bnName : nearestStation.station.name}
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-tight">
                {bn ? 'নিকটতম রেল স্টেশন' : 'Nearest train station'}
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full shrink-0">
              {nearestStation.distKm < 1
                ? `${Math.round(nearestStation.distKm * 1000)} m`
                : `${nearestStation.distKm.toFixed(1)} km`}
            </span>
          </div>
        </div>
      )}

      {/* Count row */}
      <div className="shrink-0 flex items-center justify-between px-5 py-2 bg-[#0F172A] border-b border-white/10">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
          {listFilter === 'FAVORITES' ? (bn ? 'সংরক্ষিত ট্রেন' : 'Saved Trains') : (bn ? 'ট্রেনের তালিকা' : 'Train List')}
        </h3>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-[10px] text-red-500 font-bold hover:underline">
              {bn ? 'ক্লিয়ার' : 'Clear'}
            </button>
          )}
          <span className="text-[10px] bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300 font-bold">
            {filtered.length}
          </span>
        </div>
      </div>

      <div className="shrink-0 px-4 py-2 bg-[#0F172A] border-b border-white/10">
        <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setListFilter('ALL')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${listFilter === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
          >
            {bn ? 'সব ট্রেন' : 'All Trains'}
          </button>
          <button
            onClick={() => setListFilter('FAVORITES')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${listFilter === 'FAVORITES' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500' : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
          >
            <Heart className="w-4 h-4 fill-current" />
            {bn ? 'প্রিয়' : 'Favorites'}
          </button>
        </div>
      </div>

      {/* Train list */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y px-4 py-3 space-y-3 pb-28 md:pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <span>
            {bn
              ? 'সময়সূচি পরিবর্তন হতে পারে। সর্বশেষ তথ্যের জন্য বাংলাদেশ রেলওয়ে ওয়েবসাইট দেখুন।'
              : 'Schedules may change. Check Bangladesh Railway website for latest information.'}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Train className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{bn ? 'কোনো ট্রেন পাওয়া যায়নি' : 'No trains found'}</p>
            <p className="text-sm mt-1">{bn ? 'অন্য কীওয়ার্ড দিয়ে খুঁজুন' : 'Try a different keyword'}</p>
          </div>
        ) : (
          filtered.map((route, idx) => (
            <React.Fragment key={route.id}>
              {idx > 0 && idx % 6 === 4 && (
                <AdSenseAd adSlot="auto" adFormat="fluid" className="my-3 w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" />
              )}
              <TrainCard
                route={route}
                onClick={() => onSelectTrain ? onSelectTrain(route) : setSelectedTrain(route)}
                onRateClick={() => onRateTrain ? onRateTrain(route) : setSelectedTrain(route)}
                ratingSummary={trainRatingsMap[route.id]}
                isFavorite={favoriteTrainIds.includes(route.id)}
                onToggleFavorite={() => toggleFavoriteTrain(route.id)}
                language={language}
              />
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default TrainListPage;
