
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { BusRoute, UserLocation, Station } from '../types';
import { getCurrentLocation, findNearestStation, getDistance } from '../services/locationService';
import { liveBusService } from '../services/liveBusService';
import { STATIONS } from '../constants';
import { Navigation, Clock, MapPin, AlertCircle, RefreshCw, Compass, Gauge, Flag, Phone, Radio, Users, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import EmergencyHelplineModal from './EmergencyHelplineModal';
import { useLanguage } from '../contexts/LanguageContext';

interface LiveTrackerProps {
  bus: BusRoute;
  highlightStartIdx?: number;
  highlightEndIdx?: number;
  userLocation?: UserLocation | null;
  speed?: number | null;
  onBack?: () => void;
  onViewLiveMap?: () => void;
}

const LiveTracker: React.FC<LiveTrackerProps> = ({ bus, highlightStartIdx, highlightEndIdx, userLocation: propUserLocation, speed: propSpeed, onBack, onViewLiveMap }) => {
  const { t, formatNumber } = useLanguage();
  const location = propUserLocation;
  const speed = propSpeed;
  const [error, setError] = useState<string | null>(null);
  const [nearestIndex, setNearestIndex] = useState<number>(-1);
  const [distanceToStation, setDistanceToStation] = useState<number>(Infinity);
  const [globalNearest, setGlobalNearest] = useState<{ station: Station, distance: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(liveBusService.isBroadcasting());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [proximityError, setProximityError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Manual location override
  const [manualStopIndex, setManualStopIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAllStops, setShowAllStops] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Build route stop list with names for search
  const routeStops = useMemo(() =>
    bus.stops.map((id, idx) => ({ id, idx, station: STATIONS[id] })).filter(s => s.station),
    [bus.stops]
  );

  const filteredStops = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return routeStops;
    return routeStops.filter(s =>
      s.station.name.toLowerCase().includes(q) ||
      (s.station.bnName || '').includes(q)
    );
  }, [searchQuery, routeStops]);

  // Effective current index: manual override takes priority over GPS
  const effectiveNearestIndex = manualStopIndex !== null ? manualStopIndex : nearestIndex;
  const isManualMode = manualStopIndex !== null;

  const selectStop = (idx: number) => {
    setManualStopIndex(idx);
    setSearchQuery('');
    setShowSearch(false);
    // Scroll to the stop in timeline
    setTimeout(() => {
      const el = document.getElementById(`stop-${idx}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const clearManual = () => {
    setManualStopIndex(null);
    setSearchQuery('');
    setShowSearch(false);
  };

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsDesktop(!isMobile);
    };
    checkDevice();
  }, []);

  useEffect(() => {
    if (!location) {
      setLoading(true);
      return;
    }
    const nearest = findNearestStation(location, bus.stops);
    if (nearest) {
      setNearestIndex(nearest.index);
      setDistanceToStation(nearest.distance);
    }
    const allStationIds = Object.keys(STATIONS);
    const gNearest = findNearestStation(location, allStationIds);
    if (gNearest) {
      setGlobalNearest({ station: gNearest.station, distance: gNearest.distance });
    }
    setLoading(false);
    setError(null);
  }, [location, bus.stops]);

  useEffect(() => {
    const isGenerallyBroadcasting = liveBusService.isBroadcasting();
    const currentBroadcastingBus = liveBusService.getCurrentBusName();
    const isThisBusBroadcasting = isGenerallyBroadcasting && currentBroadcastingBus === bus.name;
    setIsBroadcasting(isThisBusBroadcasting);
  }, [bus.name]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  const toggleBroadcast = () => {
    setProximityError(null);
    if (isBroadcasting) {
      liveBusService.stopBroadcasting();
      setIsBroadcasting(false);
    } else {
      if (!isOnline) {
        setProximityError(t('liveNav.offlineError') || 'You are offline. Please connect to the internet to use Live Tracking.');
        return;
      }
      if (!location && !isManualMode) {
        setProximityError(t('liveNav.locationNeeded') || 'Location not available. Enable GPS or set your stop manually.');
        return;
      }
      if (!isManualMode) {
        const MAX_DISTANCE_KM = 2.0;
        if (distanceToStation > MAX_DISTANCE_KM * 1000) {
          const nearestStation = nearestIndex !== -1 ? STATIONS[bus.stops[nearestIndex]] : null;
          setProximityError(
            `You are ${(distanceToStation / 1000).toFixed(1)}km away from the nearest station${nearestStation ? ` (${nearestStation.name})` : ''}. You must be within ${MAX_DISTANCE_KM}km to go live.`
          );
          return;
        }
      }
      liveBusService.startBroadcasting(bus.name);
      setIsBroadcasting(true);
      if (location) liveBusService.updateLocation(location.lat, location.lng, speed || 0);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-kj-text-dim">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-kj-text mb-6">{t('liveNav.locationNeeded')}</h3>
        <button onClick={() => { setLoading(true); window.location.reload(); }}
          className="px-6 py-3 bg-kj-primary text-white rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-green-900/40 active:scale-95 transition-transform">
          {t('liveNav.enableLocation')}
        </button>
      </div>
    );
  }

  if (loading && !location && !isManualMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center bg-kj-panel">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-kj-line rounded-full"></div>
          <div className="absolute inset-0 border-4 border-kj-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-8 h-8 text-kj-primary animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-kj-text">{t('liveNav.findingSatellite')}</h3>
        <p className="text-sm text-kj-text-faint mt-2">{t('liveNav.detectingPosition')}</p>
        <button
          onClick={() => setShowSearch(true)}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-xl text-teal-700 dark:text-teal-400 font-semibold text-sm transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/40"
        >
          <Search className="w-4 h-4" />
          {t('liveTracker.setManually')}
        </button>

        {/* Loading state search panel */}
        {showSearch && (
          <div className="mt-4 w-full max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kj-text-faint" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('liveTracker.typeStopName')}
                className="w-full pl-9 pr-4 py-2.5 bg-kj-panel border border-kj-line rounded-xl text-sm dark:text-white"
              />
            </div>
            <div className="mt-1 bg-kj-panel border border-kj-line rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
              {filteredStops.slice(0, 10).map(s => (
                <button key={s.idx} onMouseDown={() => selectStop(s.idx)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 border-b border-gray-50 dark:border-kj-line last:border-0 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <div>
                    <p className="font-medium text-kj-text">{s.station.name}</p>
                    {s.station.bnName && <p className="text-xs text-kj-text-faint">{s.station.bnName}</p>}
                  </div>
                </button>
              ))}
              {filteredStops.length === 0 && (
                <p className="text-sm text-kj-text-faint text-center py-4">{t('liveTracker.noStopsFound')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentStation = effectiveNearestIndex !== -1 ? STATIONS[bus.stops[effectiveNearestIndex]] : null;
  const nextStopId = effectiveNearestIndex !== -1 && effectiveNearestIndex < bus.stops.length - 1 ? bus.stops[effectiveNearestIndex + 1] : null;
  const isAtStation = isManualMode ? true : distanceToStation < 1000;

  let distToNext = 0;
  if (nextStopId && location && !isManualMode) {
    const nextStation = STATIONS[nextStopId];
    distToNext = getDistance(location, { lat: nextStation.lat, lng: nextStation.lng });
  }

  let distToDest = 0;
  let etaMinutes = 0;
  let hasDestination = highlightEndIdx !== undefined && highlightEndIdx !== -1;
  let destStationName = '';

  if (hasDestination && location && !isManualMode && highlightEndIdx !== undefined) {
    const destStation = STATIONS[bus.stops[highlightEndIdx]];
    if (destStation) {
      destStationName = destStation.name;
      distToDest = getDistance(location, { lat: destStation.lat, lng: destStation.lng });
      const calcSpeed = (speed && speed > 5) ? speed : 20;
      etaMinutes = (distToDest / 1000) / calcSpeed * 60;
    }
  }

  return (
    <div className="h-full flex flex-col bg-kj-bg relative">
      {/* Status Card */}
      <div className="bg-kj-panel rounded-b-3xl shadow-sm border-b border-kj-line p-5 z-20 shrink-0">
        {/* Desktop back */}
        {onBack && (
          <button onClick={onBack}
            className="hidden md:flex mb-3 items-center gap-2 text-kj-text-dim hover:text-kj-primary dark:hover:text-kj-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm">{t('common.back')}</span>
          </button>
        )}

        {/* ─── Location Search Input ─── */}
        <div className="mb-3">
          {showSearch ? (
            <div className="relative">
              <div className="relative flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('liveTracker.searchStop')}
                    className="w-full pl-9 pr-4 py-2.5 bg-teal-50 dark:bg-slate-700 border border-teal-200 dark:border-teal-700 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-300 dark:focus:ring-teal-600"
                  />
                </div>
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                  className="p-2 text-kj-text-faint hover:text-kj-text-dim dark:hover:text-kj-text-faint hover:bg-kj-chip-bg rounded-xl transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dropdown suggestions */}
              {(searchQuery || !searchQuery) && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-kj-panel border border-kj-line rounded-xl overflow-hidden shadow-xl max-h-56 overflow-y-auto">
                  {filteredStops.length === 0 ? (
                    <p className="text-sm text-kj-text-faint text-center py-4">{t('liveTracker.noStopsFound')}</p>
                  ) : (
                    filteredStops.slice(0, 12).map(s => (
                      <button key={s.idx}
                        onMouseDown={() => selectStop(s.idx)}
                        className="w-full text-left px-3 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-900/20 border-b border-gray-50 dark:border-kj-line last:border-0 flex items-center gap-3 group transition-colors">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${s.idx === 0 ? 'bg-green-500 text-white' : s.idx === bus.stops.length - 1 ? 'bg-red-500 text-white' : 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400'}`}>
                          {s.idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-kj-text text-sm truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">{s.station.name}</p>
                          {s.station.bnName && <p className="text-xs text-kj-text-faint">{s.station.bnName}</p>}
                        </div>
                        {s.idx === effectiveNearestIndex && (
                          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full shrink-0">Current</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(true)}
                className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-kj-line border-kj-line rounded-xl text-sm text-kj-text-dim hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
              >
                <Search className="w-4 h-4 text-teal-500 shrink-0" />
                <span className="flex-1 text-left truncate">
                  {isManualMode && currentStation ? currentStation.name : t('liveTracker.searchStop')}
                </span>
                {isManualMode && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full shrink-0">{t('liveTracker.manual')}</span>
                )}
              </button>
              {isManualMode && (
                <button onClick={clearManual}
                  className="p-2 text-kj-text-faint hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  title="Use GPS location">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowAllStops(v => !v)}
                className="p-2 bg-gray-50 dark:bg-slate-700 border border-kj-line border-kj-line rounded-xl text-kj-text-dim hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                title="Show all stops"
              >
                {showAllStops ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* All stops panel */}
          {showAllStops && !showSearch && (
            <div className="mt-2 bg-gray-50 bg-kj-chip-bg border border-kj-line border-kj-line rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <div className="sticky top-0 bg-kj-chip-bg px-3 py-1.5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-kj-text-dim uppercase tracking-wider">
                  {t('liveTracker.allStops')} · {bus.stops.length}
                </p>
              </div>
              {routeStops.map(s => (
                <button key={s.idx} onClick={() => { selectStop(s.idx); setShowAllStops(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 border-b border-kj-line border-kj-line last:border-0 transition-colors
                    ${s.idx === effectiveNearestIndex ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-white dark:hover:bg-slate-700'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0
                    ${s.idx === 0 ? 'bg-green-500 text-white' : s.idx === bus.stops.length - 1 ? 'bg-red-500 text-white' : s.idx === effectiveNearestIndex ? 'bg-kj-primary text-white' : 'bg-gray-200 dark:bg-slate-600 text-kj-text-dim'}`}>
                    {s.idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${s.idx === effectiveNearestIndex ? 'text-teal-700 dark:text-teal-400 font-bold' : 'text-kj-text-dim'}`}>{s.station.name}</p>
                  </div>
                  {s.idx === effectiveNearestIndex && (
                    <span className="text-[10px] font-bold text-kj-primary shrink-0">
                      {isManualMode ? `📍 ${t('liveTracker.manual')}` : '📍 You'}
                    </span>
                  )}
                  {s.idx === 0 && <span className="text-[10px] text-green-600 dark:text-green-400 font-bold shrink-0">{t('liveTracker.start')}</span>}
                  {s.idx === bus.stops.length - 1 && <span className="text-[10px] text-red-600 dark:text-red-400 font-bold shrink-0">{t('liveTracker.end')}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Manual mode banner */}
        {isManualMode && (
          <div className="mb-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-kj-primary shrink-0" />
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 truncate">
                {t('liveTracker.manualStop')} {effectiveNearestIndex + 1} {t('liveTracker.of')} {bus.stops.length}
              </p>
            </div>
            <button onClick={clearManual} className="text-[10px] font-bold text-kj-primary hover:underline shrink-0">
              {t('liveTracker.useGPS')}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isAtStation
            ? 'text-kj-accent bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full'
            : 'text-kj-text-faint'
            }`}>
            <MapPin className={`w-3 h-3 ${isAtStation ? 'animate-bounce' : ''}`} />
            {isManualMode ? t('liveTracker.selectedStop') : (isAtStation ? t('liveNav.currentStop') : t('liveNav.nearestStop'))}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-kj-primary bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800">
            <RefreshCw className="w-3 h-3 animate-spin" /> Live
          </span>
        </div>

        <h2 className={`text-2xl font-bold flex items-center gap-2 ${isAtStation
          ? 'text-kj-accent dark:text-red-400'
          : 'text-kj-text'
          }`}>
          {currentStation?.name || 'Unknown Location'}
          {isAtStation && <span className="inline-block w-2 h-2 bg-kj-accent rounded-full animate-pulse"></span>}
        </h2>
        {!isAtStation && !isManualMode && (
          <p className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 inline-block px-2 py-0.5 rounded mt-1">
            {t('liveNav.youAre')} {formatNumber((distanceToStation / 1000).toFixed(1))} km {t('emergency.away')}
          </p>
        )}
        <p className="text-xs text-kj-text-dim font-bengali mt-1 mb-3 ml-0.5">{currentStation?.bnName}</p>

        {/* Live Tracking Controls */}
        <div className="space-y-2">
          {!isOnline && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-xs font-bold text-red-600 dark:text-red-400">
                {t('liveNav.offline') || 'You are offline. Connect to internet to use Live Tracking.'}
              </p>
            </div>
          )}
          {proximityError && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-3 py-2 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 leading-tight">{proximityError}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={onViewLiveMap}
              className="flex-1 bg-kj-primary-soft text-kj-primary px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-kj-primary-soft dark:hover:bg-blue-900/40 transition-colors">
              <Users className="w-4 h-4" />
              {t('map.liveLocation') || 'Live Map'}
            </button>
            <button onClick={toggleBroadcast}
              disabled={!isOnline && !isBroadcasting}
              className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${!isOnline && !isBroadcasting
                ? 'bg-gray-300 bg-kj-panel-muted text-kj-text-dim cursor-not-allowed opacity-50'
                : isBroadcasting
                  ? 'bg-red-500 text-white animate-pulse shadow-red-200'
                  : 'bg-kj-primary text-white shadow-green-200 dark:shadow-green-900/30 hover:bg-green-700'
                }`}>
              <Radio className={`w-4 h-4 ${isBroadcasting ? 'animate-ping' : ''}`} />
              {isBroadcasting ? t('liveNav.stopCasting') : t('liveNav.goLive')}
            </button>
          </div>
          {isDesktop && (
            <div className="bg-kj-primary-soft border border-kj-primary/20 px-3 py-2 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-kj-primary shrink-0 mt-0.5" />
              <div className="text-xs text-kj-primary">
                <p className="font-bold">{t('liveTracker.desktopMode')}</p>
                <p className="text-[10px] mt-0.5 leading-tight">{t('liveTracker.desktopWarning')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Trip Stats */}
        {hasDestination && !isManualMode ? (
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-kj-line">
            <div className="bg-kj-primary-soft p-2 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-kj-primary mb-1">
                <Gauge className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">{t('liveNav.speed')}</span>
              </div>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{formatNumber((speed || 0).toFixed(0))} <span className="text-[10px] font-normal text-kj-primary">km/h</span></p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 mb-1">
                <Flag className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">{t('liveNav.dist')}</span>
              </div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{formatNumber((distToDest / 1000).toFixed(1))} <span className="text-[10px] font-normal text-purple-600 dark:text-purple-400">km</span></p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">{t('liveNav.eta')}</span>
              </div>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                {etaMinutes < 60
                  ? `${formatNumber(etaMinutes.toFixed(0))} ${t('liveNav.min')}`
                  : `${formatNumber(Math.floor(etaMinutes / 60))}${t('liveNav.h')} ${formatNumber(Math.round(etaMinutes % 60))}${t('liveNav.m')}`
                }
              </p>
            </div>
          </div>
        ) : (
          !isManualMode && nextStopId ? (
            <div className="pt-3 border-t border-kj-line flex items-center gap-4">
              <div className="w-10 h-10 bg-kj-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200 dark:shadow-green-900/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-kj-text-faint font-bold uppercase tracking-wide">{t('liveNav.nextStopIn')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-kj-text">{formatNumber((distToNext / 1000 * 3 + 2).toFixed(0))} {t('liveNav.min')}</span>
                  <span className="text-xs text-kj-text-faint">({formatNumber((distToNext / 1000).toFixed(1))} km)</span>
                </div>
              </div>
            </div>
          ) : (
            !isManualMode && (
              <div className="pt-3 border-t border-kj-line text-sm text-green-600 dark:text-green-400 font-bold">
                {t('liveNav.arrivedDestination')}
              </div>
            )
          )
        )}
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
        <h4 className="text-xs font-bold text-kj-text-faint mb-6 uppercase tracking-wider ml-11">
          {t('liveNav.routeTimeline')} · {bus.stops.length} stops
        </h4>
        <div className="relative ml-3 space-y-0 pb-20">
          {bus.stops.map((stopId, idx) => {
            const station = STATIONS[stopId];
            if (!station) return null;

            const isPassed = effectiveNearestIndex !== -1 && idx < effectiveNearestIndex && isAtStation;
            const isCurrent = effectiveNearestIndex !== -1 && idx === effectiveNearestIndex;

            const isStart = highlightStartIdx !== undefined && idx === highlightStartIdx;
            const isEnd = highlightEndIdx !== undefined && idx === highlightEndIdx;
            const isInRange = highlightStartIdx !== undefined && highlightEndIdx !== undefined && idx >= highlightStartIdx && idx <= highlightEndIdx;

            return (
              <div id={`stop-${idx}`} key={stopId} className={`relative pb-10 ${isPassed ? 'opacity-40 grayscale blur-[0.5px]' : 'opacity-100'}`}>
                {idx < bus.stops.length - 1 && (
                  <div className="absolute left-[-2px] top-0 bottom-0 w-1 border-l-2 border-dashed border-kj-line z-0"></div>
                )}
                {isInRange && idx < highlightEndIdx! && (
                  <div className="absolute left-[-2px] top-0 bottom-[-40px] w-1 bg-green-500 z-0"></div>
                )}

                <div className={`absolute -left-[9px] top-0 rounded-full transition-all duration-500
                    ${isCurrent && isAtStation
                      ? 'bg-kj-accent border-4 border-white shadow-[0_0_0_4px_rgba(244,42,65,0.2)] w-7 h-7 -left-[13px] z-10 animate-pulse'
                      : isCurrent
                        ? 'bg-orange-500 border-4 border-white w-6 h-6 -left-[11px] z-10 shadow-[0_0_12px_rgba(249,115,22,0.5)]'
                        : isStart
                          ? 'bg-green-600 border-4 border-white w-5 h-5 -left-[9px] z-10 ring-2 ring-green-200'
                          : isEnd
                            ? 'bg-red-600 border-4 border-white w-5 h-5 -left-[9px] z-10 ring-2 ring-red-200'
                            : isInRange
                              ? 'bg-green-400 border-4 border-white w-4 h-4 -left-[7px] z-0'
                              : isPassed
                                ? 'bg-gray-400 w-4 h-4 border-2 border-white'
                                : 'bg-white border-4 border-kj-primary w-5 h-5 -left-[9px]'
                    }`}>
                  {isCurrent && <div className="absolute -inset-2 border-2 border-current rounded-full opacity-75 animate-ping"></div>}
                </div>

                <div className={`${isCurrent ? '-mt-1.5' : '-mt-1'} pl-12`}>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => selectStop(idx)}
                      className={`font-medium text-left hover:text-teal-600 dark:hover:text-teal-400 transition-colors ${isCurrent ? 'text-kj-text text-xl font-bold' : isInRange ? 'text-green-800 dark:text-green-400 font-bold' : 'text-kj-text-dim dark:text-kj-text-faint'}`}
                    >
                      {station.name}
                    </button>
                    {isCurrent && location && (
                      <button onClick={() => setShowEmergencyModal(true)}
                        className="shrink-0 bg-kj-accent hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {t('liveNav.help')}
                      </button>
                    )}
                  </div>
                  {isCurrent && isAtStation && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-kj-accent text-white text-[10px] rounded font-bold uppercase tracking-wide shadow-sm">
                      {isManualMode ? '📍 Selected' : t('busDetails.you')}
                    </span>
                  )}
                  {isStart && <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-bold uppercase tracking-wide shadow-sm mr-2">{t('busDetails.start')}</span>}
                  {isEnd && <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded font-bold uppercase tracking-wide shadow-sm">{t('busDetails.destination')}</span>}
                  {isCurrent && !isAtStation && !isManualMode && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded font-bold uppercase tracking-wide shadow-sm">
                      {t('liveNav.nearestStop')} ({formatNumber((distanceToStation / 1000).toFixed(1))} km)
                    </span>
                  )}
                  {!isCurrent && <p className="text-xs text-kj-text-faint mt-0.5">{station.bnName}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EmergencyHelplineModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        userLocation={location}
        currentLocationName={currentStation?.name}
      />
    </div>
  );
};

export default LiveTracker;
