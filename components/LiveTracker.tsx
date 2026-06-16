
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { BusRoute, UserLocation, Station } from '../types';
import { getCurrentLocation, findNearestStation, getDistance } from '../services/locationService';
import { liveBusService } from '../services/liveBusService';
import { STATIONS } from '../constants';
import { Navigation, Clock, MapPin, AlertCircle, RefreshCw, Compass, Gauge, Flag, Phone, Radio, Users, Search, X, ChevronDown, ChevronUp, ArrowLeft, Share2 } from 'lucide-react';
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
  const lbl = (en: string, bn: string) => en; // language hook available via t(); inline helper for new strings
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

  const effectiveNearestIndex = manualStopIndex !== null ? manualStopIndex : nearestIndex;
  const isManualMode = manualStopIndex !== null;

  const selectStop = (idx: number) => {
    setManualStopIndex(idx);
    setSearchQuery('');
    setShowSearch(false);
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
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-kj-bg">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-kj-text mb-6">{t('liveNav.locationNeeded')}</h3>
        <button onClick={() => { setLoading(true); window.location.reload(); }}
          className="px-6 py-3 bg-kj-primary text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
          {t('liveNav.enableLocation')}
        </button>
      </div>
    );
  }

  if (loading && !location && !isManualMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center bg-kj-bg">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-2 border-kj-line rounded-full"></div>
          <div className="absolute inset-0 border-2 border-kj-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-8 h-8 text-kj-primary animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-kj-text">{t('liveNav.findingSatellite')}</h3>
        <p className="text-sm text-kj-text-faint mt-2">{t('liveNav.detectingPosition')}</p>
        <button
          onClick={() => setShowSearch(true)}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-kj-input-bg border border-kj-line rounded-xl text-kj-primary font-semibold text-sm transition-colors hover:border-kj-primary/40"
        >
          <Search className="w-4 h-4" />
          {t('liveTracker.setManually')}
        </button>

        {showSearch && (
          <div className="mt-4 w-full max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kj-text-faint" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('liveTracker.typeStopName')}
                className="w-full pl-9 pr-4 py-2.5 bg-kj-input-bg border border-kj-line rounded-xl text-sm text-kj-text focus:outline-none focus:border-kj-primary/40"
              />
            </div>
            <div className="mt-1 bg-kj-panel border border-kj-line rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
              {filteredStops.slice(0, 10).map(s => (
                <button key={s.idx} onMouseDown={() => selectStop(s.idx)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-kj-input-bg border-b border-kj-line last:border-0 flex items-center gap-2 transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-kj-primary shrink-0" />
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
  const nextStation = nextStopId ? STATIONS[nextStopId] : null;
  const isAtStation = isManualMode ? true : distanceToStation < 1000;

  let distToNext = 0;
  if (nextStopId && location && !isManualMode) {
    const ns = STATIONS[nextStopId];
    distToNext = getDistance(location, { lat: ns.lat, lng: ns.lng });
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

  // Progress %: stops passed / total stops
  const progressPct = bus.stops.length > 1 && effectiveNearestIndex !== -1
    ? Math.round((effectiveNearestIndex / (bus.stops.length - 1)) * 100)
    : 0;

  // Remaining stops (after current)
  const remainingStops = effectiveNearestIndex !== -1
    ? routeStops.filter(s => s.idx > effectiveNearestIndex)
    : routeStops;

  // From / to names
  const firstStation = STATIONS[bus.stops[0]];
  const lastStation = STATIONS[bus.stops[bus.stops.length - 1]];

  // Estimated minutes to next stop
  const minsToNext = distToNext > 0
    ? Math.max(1, Math.round(distToNext / 1000 * 3 + 2))
    : isManualMode && nextStation ? 3 : 0;

  return (
    <div className="h-full flex flex-col bg-kj-bg relative overflow-hidden">

      {/* ── Sticky back bar ── */}
      <div className="sticky top-0 z-30 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3 shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
            নেভিগেশন / Navigation
          </p>
          <p className="font-bengali font-bold text-sm text-kj-text truncate leading-tight">{bus.name}</p>
        </div>
        {/* Pulsing live dot + label */}
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full shrink-0">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          লাইভ ট্র্যাকিং / Live Tracking
        </span>
        {/* Stop broadcast button */}
        {isBroadcasting && (
          <button
            onClick={toggleBroadcast}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-red-500 text-white active:scale-95 transition-all shrink-0"
          >
            Stop
          </button>
        )}
      </div>

      {/* ── Map area (placeholder — Leaflet mounts here via ref in parent) ── */}
      <div className="kj-map flex-1 min-h-0 relative bg-kj-panel">
        {/* Leaflet map is injected by parent into this area; children below overlay it */}
        <div id="live-tracker-map" className="absolute inset-0 w-full h-full" />
      </div>

      {/* ── Fixed bottom panel ── */}
      <div className="dc-card rounded-t-[24px] shrink-0 z-20 px-5 pt-4 pb-6 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.4)]">

        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-kj-line mx-auto mb-3" />

        {/* ── Current route: from → to + stats ── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans mb-1">
              {t('liveNav.routeTimeline')}
            </p>
            <p className="font-bengali font-bold text-base text-kj-text leading-tight truncate">
              {firstStation?.bnName || firstStation?.name || '—'} → {lastStation?.bnName || lastStation?.name || '—'}
            </p>
            <p className="font-sans text-xs text-kj-text-dim mt-0.5 truncate">
              {firstStation?.name} → {lastStation?.name}
            </p>
          </div>
          <div className="shrink-0 text-right">
            {hasDestination && !isManualMode ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-kj-text-faint font-sans">{t('liveNav.eta')}</p>
                <p className="font-sans font-bold text-base text-kj-primary">
                  {etaMinutes < 60
                    ? `${formatNumber(etaMinutes.toFixed(0))} ${t('liveNav.min')}`
                    : `${formatNumber(Math.floor(etaMinutes / 60))}${t('liveNav.h')} ${formatNumber(Math.round(etaMinutes % 60))}${t('liveNav.m')}`
                  }
                </p>
                <p className="text-[10px] text-kj-text-faint font-sans">{formatNumber((distToDest / 1000).toFixed(1))} km</p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-kj-text-faint font-sans">{t('liveNav.speed')}</p>
                <p className="font-sans font-bold text-base text-kj-primary">
                  {formatNumber((speed || 0).toFixed(0))} <span className="text-[10px] font-normal text-kj-text-faint">km/h</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Next stop card ── */}
        {nextStation && (
          <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3" style={{ background: 'var(--kj-primary-soft)' }}>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-primary font-sans mb-0.5">
                {t('liveNav.nextStopIn')}
              </p>
              <p className="font-bengali font-bold text-kj-text text-sm truncate">{nextStation.bnName || nextStation.name}</p>
              <p className="font-sans text-xs text-kj-text-dim truncate">{nextStation.name}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-sans font-bold text-xl text-kj-primary leading-none">
                {formatNumber(minsToNext.toString())}
              </p>
              <p className="text-[10px] text-kj-primary font-bold font-sans">{t('liveNav.min')}</p>
            </div>
          </div>
        )}

        {/* ── Progress bar ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
              {t('liveTracker.allStops')} · {effectiveNearestIndex + 1} / {bus.stops.length}
            </p>
            <p className="text-[10px] font-bold text-kj-primary font-sans">{progressPct}%</p>
          </div>
          <div className="h-1.5 rounded-full bg-kj-line overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, var(--kj-primary), var(--kj-primary-deep))',
              }}
            />
          </div>
        </div>

        {/* ── Remaining stops (collapsible) ── */}
        <div className="mb-4">
          <button
            onClick={() => setShowAllStops(v => !v)}
            className="flex items-center justify-between w-full mb-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
              {showAllStops ? 'লুকান / Hide stops' : `${remainingStops.length} ${t('liveTracker.allStops')} remaining`}
            </p>
            {showAllStops ? <ChevronUp className="w-3.5 h-3.5 text-kj-text-faint" /> : <ChevronDown className="w-3.5 h-3.5 text-kj-text-faint" />}
          </button>

          {showAllStops && (
            <div className="max-h-40 overflow-y-auto rounded-xl bg-kj-input-bg border border-kj-line">
              {remainingStops.slice(0, 30).map(s => (
                <button
                  key={s.idx}
                  onClick={() => { selectStop(s.idx); setShowAllStops(false); }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2.5 border-b border-kj-line last:border-0 hover:bg-kj-panel transition-colors"
                >
                  <div className="w-4 h-4 rounded-full bg-kj-line flex items-center justify-center text-[9px] font-bold text-kj-text-dim shrink-0 font-sans">
                    {s.idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bengali text-xs font-medium text-kj-text truncate">{s.station.bnName || s.station.name}</p>
                    {s.station.bnName && <p className="text-[10px] text-kj-text-faint truncate">{s.station.name}</p>}
                  </div>
                  {s.idx === bus.stops.length - 1 && (
                    <span className="ml-auto text-[9px] font-bold text-red-400 shrink-0">{t('liveTracker.end')}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Errors / warnings ── */}
        {!isOnline && (
          <div className="bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs font-bold text-red-400">
              {t('liveNav.offline') || 'Offline. Connect to use Live Tracking.'}
            </p>
          </div>
        )}
        {proximityError && (
          <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-2 rounded-xl flex items-start gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-orange-400 leading-tight">{proximityError}</p>
          </div>
        )}
        {isDesktop && (
          <div className="bg-kj-primary/10 border border-kj-primary/20 px-3 py-2 rounded-xl flex items-start gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-kj-primary shrink-0 mt-0.5" />
            <div className="text-xs text-kj-primary">
              <p className="font-bold">{t('liveTracker.desktopMode')}</p>
              <p className="text-[10px] mt-0.5 leading-tight">{t('liveTracker.desktopWarning')}</p>
            </div>
          </div>
        )}

        {/* ── Action row ── */}
        <div className="flex gap-2">
          {/* Share location — ghost */}
          <button
            onClick={() => {
              if (location && navigator.share) {
                navigator.share({ title: bus.name, text: `Live tracking: ${currentStation?.name || ''}`, url: window.location.href });
              }
            }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border border-kj-line text-kj-text-dim hover:border-kj-primary/40 hover:text-kj-primary transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            {lbl('Share', 'শেয়ার')}
          </button>

          {/* Live map */}
          <button
            onClick={onViewLiveMap}
            className="flex-1 bg-kj-primary/10 border border-kj-primary/20 text-kj-primary px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-kj-primary/20 transition-colors active:scale-95"
          >
            <Users className="w-4 h-4" />
            {t('map.liveLocation') || 'Live Map'}
          </button>

          {/* Broadcast toggle */}
          <button
            onClick={toggleBroadcast}
            disabled={!isOnline && !isBroadcasting}
            className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              !isOnline && !isBroadcasting
                ? 'bg-kj-line text-kj-text-faint cursor-not-allowed opacity-50'
                : isBroadcasting
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-kj-primary-ink'
            }`}
            style={(!isOnline && !isBroadcasting) || isBroadcasting ? undefined : {
              background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
            }}
          >
            <Radio className={`w-4 h-4 ${isBroadcasting ? 'animate-ping' : ''}`} />
            {isBroadcasting ? t('liveNav.stopCasting') : t('liveNav.goLive')}
          </button>
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
