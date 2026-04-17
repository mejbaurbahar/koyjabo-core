import React, { useState, useMemo } from 'react';
import {
  Train, Search, ArrowRight, Clock, CalendarX, Info,
  ArrowLeft, MapPin, Navigation,
  Coins, AlertCircle, X
} from 'lucide-react';
import {
  BD_TRAIN_ROUTES, TRAIN_STATIONS, BDTrainRoute,
  calcTrainFare, routeDistanceBetween
} from '../data/bangladeshTrainData';
import { SearchableSelect } from './SearchableSelect';
import TrainRouteMap from './TrainRouteMap';
import { UserLocation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TrainListPageProps {
  userLocation?: UserLocation | null;
  onBack?: () => void;
  embedded?: boolean;
  onSelectTrain?: (route: BDTrainRoute) => void;
}

const DIVISIONS = ['All', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Rangpur', 'Mymensingh'];

const TYPE_COLORS: Record<string, string> = {
  Express:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  Mail:      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  Intercity: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  Local:     'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

function formatNumber(n: number): string {
  return n.toLocaleString('en-BD');
}

// ── Train Detail View ─────────────────────────────────────────────────────────
export function TrainDetail({
  route,
  userLocation,
  onBack,
  language,
}: {
  route: BDTrainRoute;
  userLocation?: UserLocation | null;
  onBack: () => void;
  language: string;
}) {
  const [fromId, setFromId] = useState<string>('');
  const [toId, setToId] = useState<string>('');

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

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364] overflow-hidden">
      {/* Sub-header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
        <button
          onClick={onBack}
          className="p-2 -ml-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-white truncate">{route.name}</h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-white/15 text-white/80 rounded-full">
              #{route.number}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
              {route.type}
            </span>
          </div>
          <p className="text-xs text-white/55 mt-0.5">
            {TRAIN_STATIONS[route.from]?.name} → {TRAIN_STATIONS[route.to]?.name}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Map */}
        <div className="h-[280px] md:h-[340px] bg-slate-900 relative">
          <TrainRouteMap
            route={route}
            userLocation={userLocation}
            highlightFromId={fromId || undefined}
            highlightToId={toId || undefined}
          />
        </div>

        <div className="p-4 space-y-4">
          {/* Schedule Info */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              {bn ? 'সময়সূচি' : 'Schedule'}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-white/55">{bn ? 'ঢাকা ছাড়ে' : 'Departs Dhaka'}</p>
                <p className="font-bold text-white text-base">{route.dhakaDepart}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/55">{bn ? 'গন্তব্যে পৌঁছায়' : 'Arrives Destination'}</p>
                <p className="font-bold text-white text-base">{route.destinationArrive}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/55">{bn ? 'ফিরতি ছাড়ে' : 'Return Departs'}</p>
                <p className="font-bold text-white text-base">{route.returnDepart}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/55">{bn ? 'ঢাকায় ফেরে' : 'Returns Dhaka'}</p>
                <p className="font-bold text-white text-base">{route.dhakaArrive}</p>
              </div>
            </div>
            {route.offDay !== 'No Off Day' && route.offDay !== 'No Off' && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-amber-400/15 rounded-lg border border-amber-400/25">
                <CalendarX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-300">
                  <span className="font-bold">{bn ? 'সাপ্তাহিক ছুটি:' : 'Off Day:'}</span> {route.offDay}
                </span>
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span>{bn ? `মোট দূরত্ব: ~${route.distanceKm} কিমি` : `Total distance: ~${route.distanceKm} km`}</span>
            </div>
          </div>

          {/* Stops list — improved timeline */}
          <div className="bg-white/10 rounded-2xl border border-white/15 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {bn ? `স্টেশন (${route.stops.length}টি)` : `Stations (${route.stops.length})`}
              </h3>
            </div>
            <div className="px-4 py-4">
              {route.stops.map((id, idx) => {
                const st = TRAIN_STATIONS[id];
                if (!st) return null;
                const isFirst = idx === 0;
                const isLast = idx === route.stops.length - 1;
                const isMid = !isFirst && !isLast;
                return (
                  <div key={id} className="flex gap-3">
                    {/* Timeline column */}
                    <div className="flex flex-col items-center" style={{ width: 20 }}>
                      {/* Top connector */}
                      <div className={`w-px flex-none ${isFirst ? 'h-2 bg-transparent' : 'h-2'} ${!isFirst ? (isLast ? 'bg-gradient-to-b from-white/25 to-transparent' : 'bg-white/25') : ''}`} />
                      {/* Dot */}
                      {isFirst ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-emerald-300 shadow-lg shadow-emerald-500/40 shrink-0 z-10" />
                      ) : isLast ? (
                        <div className="w-4 h-4 rounded-full bg-white/80 border-2 border-white/50 shadow shrink-0 z-10" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/35 shrink-0 z-10 mt-0.5" />
                      )}
                      {/* Bottom connector */}
                      {!isLast && (
                        <div className={`w-px flex-1 min-h-[18px] ${isFirst ? 'bg-gradient-to-b from-emerald-400/80 to-white/25' : 'bg-white/25'}`} />
                      )}
                    </div>
                    {/* Stop name */}
                    <div className={`pb-3 flex-1 min-w-0 ${isFirst ? 'pt-0' : isMid ? 'pt-0.5' : 'pt-0'}`}>
                      <span className={`${isFirst || isLast ? 'text-sm font-bold text-white' : 'text-xs text-white/60'}`}>
                        {bn ? st.bnName : st.name}
                      </span>
                      {(isFirst || isLast) && (
                        <p className="text-[10px] text-white/40 mt-0.5">
                          {isFirst ? (bn ? 'যাত্রা শুরু' : 'Departure') : (bn ? 'চূড়ান্ত গন্তব্য' : 'Final Destination')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fare Calculator — no overflow-hidden so dropdowns aren't clipped */}
          <div className="bg-white/10 rounded-2xl border border-white/15">
            <div className="px-4 py-3 border-b border-white/10 rounded-t-2xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                {bn ? 'ভাড়া ও সময় ক্যালকুলেটর' : 'Fare & Time Calculator'}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* From / To stacked for more dropdown space */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-white/60 mb-1 block">
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
                  <label className="text-xs font-medium text-white/60 mb-1 block">
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
                <div className="mt-2 space-y-3 animate-in fade-in duration-200">
                  {/* Journey summary */}
                  <div className="flex items-center justify-between p-3 bg-emerald-400/15 rounded-xl border border-emerald-400/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium text-white/80">
                        ~{Math.round(journeyInfo.distKm)} km
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-teal-400" />
                      <span className="font-medium text-white/80">{journeyInfo.travelTime}</span>
                    </div>
                  </div>

                  {/* Fare table */}
                  <div className="overflow-hidden rounded-xl border border-white/15">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/10 text-xs text-white/60">
                          <th className="text-left px-3 py-2 font-medium">{bn ? 'শ্রেণী' : 'Class'}</th>
                          <th className="text-right px-3 py-2 font-medium">{bn ? 'ভাড়া' : 'Fare'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {[
                          { label: bn ? 'শুভন' : 'Shuvan', val: journeyInfo.fare.shuvan },
                          { label: bn ? 'শুভন চেয়ার' : 'Shuvan Chair', val: journeyInfo.fare.shuvanChair },
                          { label: bn ? 'স্নিগ্ধা (এসি চেয়ার)' : 'Snigdha (AC Chair)', val: journeyInfo.fare.snigdha },
                          { label: bn ? '১ম শ্রেণী বার্থ' : '1st Class Berth', val: journeyInfo.fare.firstClassBerth! },
                          { label: bn ? 'এসি বার্থ' : 'AC Berth', val: journeyInfo.fare.acBerth! },
                        ].map(row => (
                          <tr key={row.label} className="hover:bg-white/5 transition-colors">
                            <td className="px-3 py-2.5 text-white/75">{row.label}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-emerald-400">
                              ৳{formatNumber(row.val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-white/40 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    {bn
                      ? 'ভাড়া আনুমানিক। সঠিক ভাড়ার জন্য বাংলাদেশ রেলওয়ে ওয়েবসাইট দেখুন।'
                      : 'Fare is approximate. Check official Bangladesh Railway website for exact fares.'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-white/40 text-center py-2">
                  {bn ? 'দুটি স্টেশন সিলেক্ট করুন' : 'Select two stations to calculate fare'}
                </p>
              )}
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

// ── Train Card ────────────────────────────────────────────────────────────────
function TrainCard({ route, onClick, language }: { route: BDTrainRoute; onClick: () => void; language: string }) {
  const bn = language === 'bn';
  const fromStation = TRAIN_STATIONS[route.from];
  const toStation   = TRAIN_STATIONS[route.to];

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{bn ? route.bnName : route.name}</h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded shrink-0">
              #{route.number}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[route.type] || TYPE_COLORS.Local}`}>
              {route.type}
            </span>
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: route.color + '20', color: route.color }}
        >
          <Train className="w-4 h-4" />
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

      {/* Times + off day */}
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
      <div className="mt-2 flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg w-fit">
        <Coins className="w-3 h-3 shrink-0" />
        <span>৳{route.fare.shuvan} – ৳{route.fare.acBerth?.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
const TrainListPage: React.FC<TrainListPageProps> = ({ userLocation, onBack, embedded = false, onSelectTrain }) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrain, setSelectedTrain] = useState<BDTrainRoute | null>(null);

  const filtered = useMemo(() => {
    let list = BD_TRAIN_ROUTES;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.bnName.includes(q) ||
        r.number.includes(q) ||
        TRAIN_STATIONS[r.from]?.name.toLowerCase().includes(q) ||
        TRAIN_STATIONS[r.to]?.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery]);

  // If no external handler, render detail inline (fallback)
  if (!onSelectTrain && selectedTrain) {
    return (
      <TrainDetail
        route={selectedTrain}
        userLocation={userLocation}
        onBack={() => setSelectedTrain(null)}
        language={language}
      />
    );
  }

  const bn = language === 'bn';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header — green/red theme matching the app */}
      <div className="shrink-0 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-xl shadow-emerald-500/30">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative z-10 px-4 pt-4 pb-4">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-xl leading-tight drop-shadow-md">
                {bn ? 'বাংলাদেশ রেলওয়ে' : 'Bangladesh Railway'}
              </h1>
              <p className="text-white/80 text-xs">
                {bn ? `${BD_TRAIN_ROUTES.length}টি আন্তঃনগর ট্রেন` : `${BD_TRAIN_ROUTES.length} Intercity Trains`}
              </p>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={bn ? 'ট্রেন বা গন্তব্য খুঁজুন...' : 'Search train or destination...'}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/15 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Count row */}
      <div className="shrink-0 flex items-center justify-between px-5 py-2 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
          {bn ? 'ট্রেনের তালিকা' : 'Train List'}
        </h3>
        <span className="text-[10px] bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300 font-bold">
          {filtered.length}
        </span>
      </div>

      {/* Train list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-28 md:pb-4">
        {/* Schedule note */}
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
          filtered.map(route => (
            <TrainCard
              key={route.id}
              route={route}
              onClick={() => onSelectTrain ? onSelectTrain(route) : setSelectedTrain(route)}
              language={language}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TrainListPage;
