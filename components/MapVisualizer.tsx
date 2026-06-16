import React, { useEffect, useState, useRef } from 'react';
import { BusRoute, UserLocation } from '../types';
import { STATIONS, METRO_STATIONS, RAILWAY_STATIONS, AIRPORTS } from '../constants';
import { findNearestStation, getDistance } from '../services/locationService';
import { getTrafficColor, TrafficLevel } from '../services/trafficSimulator';
import { liveBusService } from '../services/liveBusService';
import { MapPin, Bus, Plus, Minus, Navigation, AlertCircle, Grip, ArrowUpRight, Train, Plane, Layers, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MapVisualizerProps {
  route: BusRoute | null;
  userStationIndex?: number;
  userDistance?: number;
  highlightStartIdx?: number;
  highlightEndIdx?: number;
  userLocation?: UserLocation | null;
  tripOrigin?: string; // ID of the original start point
  tripDestination?: string; // ID of the final destination station if different from route end
  tripTransferPoint?: string; // ID of the transfer point station
  isReversed?: boolean;
}

const MapVisualizer: React.FC<MapVisualizerProps> = ({
  route,
  userStationIndex = -1,
  userDistance = Infinity,
  highlightStartIdx = -1,
  highlightEndIdx = -1,
  isReversed = false,
  userLocation,
  tripOrigin,
  tripDestination,
  tripTransferPoint
}) => {
  const { t, language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
  const [simulationStep, setSimulationStep] = useState(0);

  // Layer visibility toggles - Metro off by default, others off
  const [showMetro, setShowMetro] = useState(false);
  const [showRailway, setShowRailway] = useState(false);
  const [showAirport, setShowAirport] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  // Responsive initial zoom: smaller on mobile for better overview
  const [zoom, setZoom] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 0.5 : 0.8; // Mobile: 0.5, Desktop: 0.8
    }
    return 0.8;
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mouse Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Pinch-to-zoom state for mobile
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 0.5 : 0.8;
    }
    return 0.8;
  });

  const isUserFar = userDistance > 1000; // 1km threshold for "Far" connection line
  const showUserOnNode = userStationIndex !== -1 && !isUserFar;
  const hasHighlight = highlightStartIdx !== -1 && highlightEndIdx !== -1 && highlightStartIdx < highlightEndIdx;

  // Calculate global nearest station for display
  const globalNearestName = React.useMemo(() => {
    if (!userLocation) return null;
    const allStationIds = Object.keys(STATIONS);
    const nearest = findNearestStation(userLocation, allStationIds);
    return nearest ? nearest.station.name : null;
  }, [userLocation]);

  /*
    DATA PREPARATION
    Resolve station IDs to actual station objects from all available sources
  */
  const stations = React.useMemo(() => {
    if (!route) return [];
    return route.stops
      .map(id => STATIONS[id] || METRO_STATIONS[id] || RAILWAY_STATIONS[id] || AIRPORTS[id])
      .filter(Boolean); // Filter out any undefined stations
  }, [route]);

  // Track if we've already auto-scrolled (only do it once on mount)
  const hasAutoScrolled = useRef(false);

  // Auto-scroll to user location or start of highlight - ONLY ONCE on initial load
  useEffect(() => {
    // Only auto-scroll if we haven't done it yet
    if (scrollContainerRef.current && route && !hasAutoScrolled.current) {
      const baseWidth = Math.max(stations.length * 100, 1000);
      const padding = 60;

      let targetIndex = -1;

      if (hasHighlight) {
        targetIndex = isReversed ? highlightEndIdx : highlightStartIdx;
      } else if (userStationIndex !== -1) {
        targetIndex = userStationIndex;
      }

      if (targetIndex !== -1) {
        const x = (targetIndex / (stations.length - 1)) * (baseWidth - (padding * 2)) + padding;
        const containerWidth = scrollContainerRef.current.clientWidth;
        const containerHeight = scrollContainerRef.current.clientHeight;
        const scaledX = x * zoom;

        // Center Horizontally
        const scrollX = scaledX - (containerWidth / 2);

        // Center Vertically
        const scrollY = (600 * zoom - containerHeight) / 2;

        scrollContainerRef.current.scrollTo({
          left: scrollX,
          top: scrollY,
          behavior: 'smooth'
        });

        // Mark that we've done the initial auto-scroll
        hasAutoScrolled.current = true;
      }
    }
  }, [userStationIndex, hasHighlight, highlightStartIdx, route]);
  // Removed zoom and userLocation from dependencies so map doesn't reset on GPS updates


  if (!route) return (
    <div className="w-full h-40 bg-kj-panel-muted flex items-center justify-center text-kj-text-faint text-sm">
      <p>{lbl('No route data available', 'রুটের তথ্য পাওয়া যাচ্ছে না')}</p>
    </div>
  );



  // Simulation Logic (Visual effect only)
  useEffect(() => {
    if (stations.length < 2 || !hasHighlight) return;
    const interval = setInterval(() => {
      setSimulationStep((prev) => {
        const next = prev + 0.002; // Speed of bus
        return next > 1 ? 0 : next; // Loop for demo
      });
    }, 50);
    return () => clearInterval(interval);
  }, [stations.length, hasHighlight]);

  // Drag Handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setStartY(e.pageY - scrollContainerRef.current.offsetTop);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setScrollTop(scrollContainerRef.current.scrollTop);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const y = e.pageY - scrollContainerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
    scrollContainerRef.current.scrollTop = scrollTop - walkY;
  };

  if (stations.length === 0) return <div>{lbl('No station data', 'স্টেশনের তথ্য নেই')}</div>;

  // Calculate normalized Latitudes (Schematic View - Vertical Variation Only)
  const latData = React.useMemo(() => {
    if (stations.length === 0) return { minLat: 0, maxLat: 0, normalizeLat: (_: number) => 0 };
    const lats = stations.map(s => s.lat);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    return {
      minLat,
      maxLat,
      normalizeLat: (val: number) => (val - minLat) / (maxLat - minLat || 1)
    };
  }, [stations]);

  // Base Dimensions
  const height = 600;
  const padding = 180;
  // Use fixed spacing per station to guarantee no overlap (Increased to 160px for Metro labels)
  const baseWidth = Math.max(stations.length * 160, 1000);

  // Memoize Node Positions - SCHEMATIC PROJECTION
  const nodePositions = React.useMemo(() => {
    return stations.map((s, i) => {
      // Evenly spaced X axis
      const x = (i / (stations.length - 1)) * (baseWidth - (padding * 2)) + padding;

      // Latitude-based Y axis (Visual interest)
      const mapContentHeight = 200;
      const y = (height - mapContentHeight) / 2 + (mapContentHeight - (latData.normalizeLat(s.lat) * mapContentHeight));

      return { x, y };
    });
  }, [stations, baseWidth, padding, latData, height]);

  // Path Generator for Smooth Curves
  const generateSmoothPath = (points: { x: number, y: number }[]) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];

      // Smoother curve tension
      const cp1x = p1.x + (p2.x - p0.x) * 0.15; // 0.15 tension for schematic
      const cp1y = p1.y + (p2.y - p0.y) * 0.15;
      const cp2x = p2.x - (p3.x - p1.x) * 0.15;
      const cp2y = p2.y - (p3.y - p1.y) * 0.15;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  // Calculate User Position and Dynamic Map Bounds
  const { userPos, layout, nearestStationPosForLine } = React.useMemo(() => {
    let uPos: { x: number, y: number } | null = null;
    let lay = { width: baseWidth, height: height, shiftX: 0, shiftY: 0 };
    let nearestPos: { x: number, y: number } | null = null;

    if (userLocation && stations.length > 0) {
      if (userStationIndex >= 0 && userStationIndex < nodePositions.length) {
        nearestPos = nodePositions[userStationIndex];
      } else {
        // Fallback to first station if index invalid
        nearestPos = nodePositions[0];
      }

      // Default: User is AT the nearest station
      uPos = { ...nearestPos };

      if (isUserFar) {
        // VISUAL OFFSET LOGIC
        // We want to show the user "near" the station, but not ON it.
        // We calculate a visual offset based on real lat/lng difference,
        // but clamped tightly so it fits on screen.

        const station = stations[userStationIndex >= 0 ? userStationIndex : 0];

        // Calculate relative direction vectors (normalized 0-1 generally)
        // Note: Longitude difference is sensitive, so we scale it
        const dLng = (userLocation.lng - station.lng) * 20000; // Fake scale for visual X
        const dLat = -(userLocation.lat - station.lat) * 20000; // Fake scale for visual Y (Negate because Y is down)

        let dx = dLng;
        let dy = dLat;

        // CLAMP DISTANCE (Pixel Space)
        // User requested "reduce gap so that i can see both".
        // We set a very tight visual limit.
        const maxVisualDistance = 80; // Pixels
        const currentDistance = Math.hypot(dx, dy);

        if (currentDistance > maxVisualDistance || currentDistance === 0) {
          // Normalize and scale to maxVisualDistance
          // If distance is 0 (rare overlap), assume slight offset
          const safeDist = currentDistance || 1;
          const ratio = maxVisualDistance / safeDist;
          dx = dx * ratio;
          dy = dy * ratio;
        }

        // Apply offset to schematic station position
        uPos = {
          x: nearestPos.x + dx,
          y: nearestPos.y + dy
        };

        // Calculate Bounds to include user
        const contentMinX = Math.min(0, uPos.x - padding);
        const contentMaxX = Math.max(baseWidth, uPos.x + padding);
        const contentMinY = Math.min(0, uPos.y - padding);
        const contentMaxY = Math.max(height, uPos.y + padding);

        lay = {
          width: contentMaxX - contentMinX,
          height: contentMaxY - contentMinY,
          shiftX: -contentMinX,
          shiftY: -contentMinY
        };
      }
    }
    return { userPos: uPos, layout: lay, nearestStationPosForLine: nearestPos };
  }, [userLocation, stations, baseWidth, padding, nodePositions, userStationIndex, isUserFar, height]);

  // LIVE BUS TRACKING INTEGRATION
  const [liveBuses, setLiveBuses] = useState<any[]>([]);
  useEffect(() => {
    // Only subscribe if we have a valid route
    if (!route) return;

    // Normalize name for robust matching (e.g. "Baishakhi" vs "Baishakhi Paribahan")
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
    const routeName = normalize(route.name);

    // Subscribe to live bus updates
    const unsubscribe = liveBusService.subscribe((allBuses) => {
      const matches = allBuses.filter(b => normalize(b.busName).includes(routeName) || routeName.includes(normalize(b.busName)));
      setLiveBuses(matches);
    });

    return unsubscribe;
  }, [route]);

  // Calculate positions of live buses on the schematic map
  const liveBusPositions = React.useMemo(() => {
    return liveBuses.map(bus => {
      // Find nearest station from the VISUAL list 'stations'
      let minDst = Infinity;
      let closestIdx = -1;

      stations.forEach((s, idx) => {
        const d = getDistance({ lat: bus.lat, lng: bus.lng }, { lat: s.lat, lng: s.lng });
        if (d < minDst) {
          minDst = d;
          closestIdx = idx;
        }
      });

      if (closestIdx === -1) return null;

      const pos = nodePositions[closestIdx];
      // OLD LOGIC STARTS HERE (To be removed)
      /*
      // Find nearest station on THIS route for the bus
      const nearest = findNearestStation({ lat: bus.lat, lng: bus.lng }, route!.stops);
      if (!nearest) return null;

      // Find the index in our *filtered* visual station list
      // Note: `stations` prop is filtered valid stations. `route.stops` contains all IDs.
      const visualIndex = stations.findIndex(s => s.id === route!.stops[nearest.index]);

      if (visualIndex === -1) return null;

      */
      // Slight random jitter or interpolation could be added here for multiple buses at same stop
      // For now, basic station snapping
      return {
        ...pos,
        busId: bus.id,
        speed: bus.speed,
        isSelf: bus.isUser
      };
    }).filter(Boolean) as { x: number, y: number, busId: string, speed: number, isSelf?: boolean }[];
  }, [liveBuses, stations, nodePositions]);



  // Adjusted dimensions for Zoom
  const zoomedWidth = layout.width * zoom;
  const zoomedHeight = layout.height * zoom;
  const metroConnections = React.useMemo(() => {
    const connections: Array<{
      metroStation: typeof METRO_STATIONS[keyof typeof METRO_STATIONS],
      busStopIndex: number,
      distance: number,
      metroX: number,
      metroY: number
    }> = [];

    Object.values(METRO_STATIONS).forEach(metro => {
      let minDistance = Infinity;
      let nearestBusStopIndex = -1;

      stations.forEach((station, idx) => {
        const d = Math.hypot(station.lat - metro.lat, station.lng - metro.lng);
        if (d < minDistance) {
          minDistance = d;
          nearestBusStopIndex = idx;
        }
      });

      // Show connection if reasonably close (< 2km approx check)
      if (minDistance < 0.02 && nearestBusStopIndex !== -1) {
        const busStopPos = nodePositions[nearestBusStopIndex];

        // SMART PLACEMENT LOGIC needed here to avoid overlapping
        // 1. Alternating Bus Labels use: idx % 2 === 0 ? "Bottom" : "Top"
        // 2. We should place Metro Label on the OPPOOSITE side.

        const isBusLabelBottom = nearestBusStopIndex % 2 === 0;

        // If Bus Label is Bottom, Metro goes Top (-Y).
        // If Bus Label is Top, Metro goes Bottom (+Y).
        const offsetY = isBusLabelBottom ? -80 : 80;

        // Slight X offset to separate from vertical bus line
        // Use 'metro.lng' to decide Left/Right side of station if possible, or just fixed
        const offsetX = 0; // Keep centered on X for cleanliness

        connections.push({
          metroStation: metro,
          busStopIndex: nearestBusStopIndex,
          distance: minDistance,
          metroX: busStopPos.x + offsetX,
          metroY: busStopPos.y + offsetY
        });
      }
    });

    return connections;
  }, [stations, nodePositions]);

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  // Destination Logic

  const destStation = tripDestination ? (STATIONS[tripDestination] || METRO_STATIONS[tripDestination] || RAILWAY_STATIONS[tripDestination] || AIRPORTS[tripDestination]) : null;
  const isDestOnRoute = destStation && stations.some(s => s.id === tripDestination);

  const originStation = tripOrigin ? (STATIONS[tripOrigin] || METRO_STATIONS[tripOrigin] || RAILWAY_STATIONS[tripOrigin] || AIRPORTS[tripOrigin]) : null;
  const isOriginOnRoute = originStation && stations.some(s => s.id === tripOrigin);

  const alightIdx = hasHighlight
    ? (isReversed ? highlightStartIdx : highlightEndIdx)
    : (isReversed ? 0 : (stations.length - 1));
  const alightPos = (alightIdx >= 0 && alightIdx < nodePositions.length) ? nodePositions[alightIdx] : null;

  const startIdx = hasHighlight
    ? (isReversed ? highlightEndIdx : highlightStartIdx)
    : (isReversed ? (stations.length - 1) : 0);
  const startPos = (startIdx >= 0 && startIdx < nodePositions.length) ? nodePositions[startIdx] : null;

  return (
    <div className="w-full h-64 xs:h-72 sm:h-[380px] md:h-[500px] bg-kj-bg border-t border-b border-kj-line relative group overflow-hidden">

      {/* Connection Line Info Badge */}
      {isUserFar && (userStationIndex !== -1 || hasHighlight) && (
        <div className="absolute top-4 left-4 z-20 bg-orange-50/90 backdrop-blur border border-orange-200 px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-pulse max-w-[200px]">
          <ArrowUpRight className="w-5 h-5 text-orange-600 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-orange-800 uppercase">{lbl('Outside Route', 'রুটের বাইরে')}</p>
            <p className="text-xs font-medium text-orange-900 leading-tight">
              {lbl('Go', 'যান')} {
                hasHighlight && highlightStartIdx !== -1 && userLocation && nodePositions[isReversed ? highlightEndIdx : highlightStartIdx]
                  ? (getDistance(userLocation, stations[isReversed ? highlightEndIdx : highlightStartIdx]) / 1000).toFixed(1)
                  : (userDistance / 1000).toFixed(1)
              }km {lbl('to', '-এ')} {
                hasHighlight && highlightStartIdx !== -1 && stations[isReversed ? highlightEndIdx : highlightStartIdx].id === tripTransferPoint
                  ? lbl('transit at', 'ট্রান্সফার')
                  : lbl('start at', 'শুরু করুন')
              } <b>{hasHighlight && highlightStartIdx !== -1 ? stations[isReversed ? highlightEndIdx : highlightStartIdx].name : stations[userStationIndex].name}</b>
            </p>
            {globalNearestName && (
              <p className="text-[10px] text-orange-800 mt-1 border-t border-orange-200 pt-1">
                {lbl('Near:', 'কাছাকাছি:')} <b>{globalNearestName}</b>
              </p>
            )}
          </div>
        </div>
      )}



      {/* Bottom Left - Layer Toggles */}
      < div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 items-start" >

        {/* Collapsible Panel */}
        {showLayers && (
          <div className="bg-white/95 dark:bg-kj-chip-bg/95 backdrop-blur rounded-xl border border-kj-line shadow-xl p-3 w-[180px] mb-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-kj-line">
              <p className="text-[10px] font-bold text-kj-text-dim uppercase tracking-wider">{t('liveNav.layers')}</p>
              <button onClick={() => setShowLayers(false)} className="text-kj-text-faint hover:text-kj-text-dim dark:hover:text-kj-text-faint p-1 hover:bg-kj-chip-bg rounded-full transition-colors flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer hover:bg-kj-chip-bg hover:bg-kj-chip-bg p-1.5 rounded-lg transition-colors group">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${showMetro ? 'bg-gradient-to-br from-kj-primary to-kj-neon-violet border-kj-primary shadow-lg shadow-kj-primary/30' : 'border-kj-line bg-white dark:bg-slate-700'}`}>
                  {showMetro && <Train className="w-3 h-3 text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={showMetro}
                  onChange={(e) => setShowMetro(e.target.checked)}
                  className="hidden"
                />
                <span className="text-xs font-semibold text-kj-text group-hover:text-kj-text dark:group-hover:text-white">{t('home.metroRail')}</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer hover:bg-kj-chip-bg hover:bg-kj-chip-bg p-1.5 rounded-lg transition-colors group">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${showRailway ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 shadow-lg shadow-green-500/30' : 'border-kj-line bg-white dark:bg-slate-700'}`}>
                  {showRailway && <Train className="w-3 h-3 text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={showRailway}
                  onChange={(e) => setShowRailway(e.target.checked)}
                  className="hidden"
                />
                <span className="text-xs font-semibold text-kj-text group-hover:text-kj-text dark:group-hover:text-white">{t('intercity.byTrain')}</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer hover:bg-kj-chip-bg hover:bg-kj-chip-bg p-1.5 rounded-lg transition-colors group">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${showAirport ? 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-500 shadow-lg shadow-orange-500/30' : 'border-kj-line bg-white dark:bg-slate-700'}`}>
                  {showAirport && <Plane className="w-3 h-3 text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={showAirport}
                  onChange={(e) => setShowAirport(e.target.checked)}
                  className="hidden"
                />
                <span className="text-xs font-semibold text-kj-text group-hover:text-kj-text dark:group-hover:text-white">{t('intercity.byAir')}</span>
              </label>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setShowLayers(!showLayers)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg transition-all duration-300 group ${showLayers
            ? 'bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-white text-white dark:text-kj-text'
            : 'bg-white/95 dark:bg-kj-chip-bg/95 backdrop-blur border-kj-line text-kj-text-dim hover:bg-kj-chip-bg hover:bg-kj-chip-bg hover:border-kj-line dark:hover:border-slate-600'
            }`}
        >
          <Layers className={`w-4 h-4 ${!showLayers && 'group-hover:scale-110 transition-transform'}`} />
          <span className="text-xs font-bold">{t('liveNav.layers')}</span>
        </button>
      </div >

      {/* Scrollable Container */}
      < div
        ref={scrollContainerRef}
        className={`w-full h-full overflow-auto no-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        // Touch events for mobile drag and pinch-to-zoom
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            // Single touch - drag
            const touch = e.touches[0];
            setStartX(touch.pageX - scrollContainerRef.current!.offsetLeft);
            setStartY(touch.pageY - scrollContainerRef.current!.offsetTop);
            setScrollLeft(scrollContainerRef.current!.scrollLeft);
            setScrollTop(scrollContainerRef.current!.scrollTop);
          } else if (e.touches.length === 2) {
            // Two fingers - pinch to zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
              touch2.pageX - touch1.pageX,
              touch2.pageY - touch1.pageY
            );
            setInitialPinchDistance(distance);
            setInitialZoom(zoom);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1 && initialPinchDistance === null) {
            // Single touch - drag
            const touch = e.touches[0];
            const x = touch.pageX - scrollContainerRef.current!.offsetLeft;
            const y = touch.pageY - scrollContainerRef.current!.offsetTop;
            const walkX = (x - startX) * 1.5;
            const walkY = (y - startY) * 1.5;
            scrollContainerRef.current!.scrollLeft = scrollLeft - walkX;
            scrollContainerRef.current!.scrollTop = scrollTop - walkY;
          } else if (e.touches.length === 2 && initialPinchDistance !== null) {
            // Two fingers - pinch to zoom
            e.preventDefault(); // Prevent default pinch behavior
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
              touch2.pageX - touch1.pageX,
              touch2.pageY - touch1.pageY
            );
            const scale = currentDistance / initialPinchDistance;
            const newZoom = Math.max(0.5, Math.min(2.5, initialZoom * scale));
            setZoom(newZoom);
          }
        }}
        onTouchEnd={() => {
          setInitialPinchDistance(null);
        }}
      >
        <div style={{ width: `${zoomedWidth}px`, height: `${zoomedHeight}px` }} className="relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] transition-all duration-500 ease-out origin-top-left min-w-full">
          <svg className="w-full h-full block select-none pointer-events-none" viewBox={`0 0 ${layout.width} ${layout.height}`} preserveAspectRatio="xMinYMid meet">

            <g transform={`translate(${layout.shiftX}, ${layout.shiftY})`}>

              {/* Connection Line layer - Render Highlight FIRST (Below Route) */}
              {userPos && ((nearestStationPosForLine && isUserFar) || (hasHighlight && highlightStartIdx !== -1 && nodePositions[highlightStartIdx])) && (
                <g className="animate-in fade-in duration-700">
                  {/* Actual Dashed Line - Thinner and cleaner to avoid overlap */}
                  <line
                    x1={userPos.x}
                    y1={userPos.y}
                    x2={hasHighlight && highlightStartIdx !== -1 ? nodePositions[isReversed ? highlightEndIdx : highlightStartIdx].x : nearestStationPosForLine!.x}
                    y2={hasHighlight && highlightStartIdx !== -1 ? nodePositions[isReversed ? highlightEndIdx : highlightStartIdx].y : nearestStationPosForLine!.y}
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    className="opacity-60"
                  />
                </g>
              )}

             {/* 1. Base Glow Path (Triple Layer Layer 1) */}
            <path
              d={generateSmoothPath(nodePositions)}
              fill="none"
              stroke={route.color ?? '#006a4e'}
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.12}
              style={{ transition: 'all 0.5s ease' }}
            />

            {/* 2. Main Route Path (Triple Layer Layer 2) */}
            <path
              d={generateSmoothPath(nodePositions)}
              fill="none"
              stroke={route.color ?? '#006a4e'}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
              style={{ transition: 'all 0.5s ease' }}
            />

            {/* 3. Animated Flow Path (Triple Layer Layer 3) */}
            <path
              d={generateSmoothPath(nodePositions)}
              fill="none"
              stroke="white"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="10, 20"
              opacity={0.6}
              className="route-line-flow"
              style={{ transition: 'all 0.5s ease' }}
            />

            {/* Fare Highlight Segment (Animated Glow) */}
            {hasHighlight && (
              <g>
                <path
                  d={generateSmoothPath(nodePositions.slice(highlightStartIdx, highlightEndIdx + 1))}
                  fill="none"
                  stroke="#006a4e"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-20 blur-[4px]"
                />
                <path
                  d={generateSmoothPath(nodePositions.slice(highlightStartIdx, highlightEndIdx + 1))}
                  fill="none"
                  stroke="#006a4e"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={generateSmoothPath(nodePositions.slice(highlightStartIdx, highlightEndIdx + 1))}
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="12,24"
                  className="route-line-flow opacity-80"
                />
              </g>
            )}

              {/* Past Path (Greyed Out) */}
              {showUserOnNode && !hasHighlight && (
                <path
                  d={generateSmoothPath(nodePositions.slice(0, userStationIndex + 1))}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-100"
                />
              )}

              {/* Stations */}
              {stations.map((s, idx) => {
                const { x, y } = nodePositions[idx];

                const isPassed = showUserOnNode && idx < userStationIndex;
                const isCurrent = showUserOnNode && idx === userStationIndex;
                const isNearestButFar = isUserFar && idx === userStationIndex;
                const isStart = idx === 0;
                const isEnd = idx === stations.length - 1;
                const isHighlighted = hasHighlight && idx >= highlightStartIdx && idx <= highlightEndIdx;

                const isHighlightStart = hasHighlight && idx === highlightStartIdx;
                const isHighlightEnd = hasHighlight && idx === highlightEndIdx;

                // Reversed-aware start/end stations for specific logic
                const isRealStart = hasHighlight && idx === (isReversed ? highlightEndIdx : highlightStartIdx);
                const isRealEnd = hasHighlight && idx === (isReversed ? highlightStartIdx : highlightEndIdx);

                // "Start Here" suggestion when user is far
                // We show this if the user is far from the nearest station (if no highlight) 
                // OR if they are far from the REAL start of the highlighted route
                const isUserConnectionStart = isUserFar && idx === (hasHighlight ? (isReversed ? highlightEndIdx : highlightStartIdx) : userStationIndex);

                // Target for starting ripple (Real Start OR User's connection point)
                const isStartHereTarget = isRealStart || isUserConnectionStart;

                let fill = "white";
                let stroke = hasHighlight ? "#e5e7eb" : "#006a4e";
                let r = 5;

                if (isHighlighted) {
                  fill = "white";
                  stroke = "#006a4e";
                  r = 6;
                  if (idx === highlightStartIdx || idx === highlightEndIdx) {
                    fill = "#006a4e";
                    stroke = "white";
                    r = 8;
                  }
                } else if (!hasHighlight) {
                  if (isCurrent) {
                    fill = "#f42a41";
                    stroke = "#f42a41";
                    r = 8;
                  } else if (isNearestButFar) {
                    fill = "#fb923c";
                    stroke = "#c2410c";
                    r = 8;
                  } else if (isPassed) {
                    fill = "#e2e8f0";
                    stroke = "#cbd5e1";
                  } else if (isStart || isEnd) {
                    r = 7;
                    stroke = "#1f2937";
                  }
                }

                return (
                  <g key={s.id} className={`cursor-pointer group/node pointer-events-auto ${isHighlighted || !hasHighlight ? 'opacity-100' : 'opacity-50'}`}>
                    {/* Hover Hit Area */}
                    <circle cx={x} cy={y} r={25} fill="transparent" />

                    {/* Advanced Station Node Rendering */}
                    {(() => {
                      const isMetroStation = !!METRO_STATIONS[s.id];
                      const isRailwayStation = !!RAILWAY_STATIONS[s.id];
                      const isAirport = !!AIRPORTS[s.id];
                      const primaryColor = isMetroStation ? "#2563eb" : (isRailwayStation ? "#059669" : (isAirport ? "#ea580c" : "#006a4e"));
                      const iconSize = 12;

                      return (
                        <>
                          {/* Current Location Ripple */}
                          {isCurrent && !hasHighlight && (
                            <circle cx={x} cy={y} r={20} fill="#f42a41" opacity="0.2">
                              <animate attributeName="r" from="8" to="30" dur="1.5s" repeatCount="indefinite" />
                              <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                          )}

                          {/* Connect target ripple (START or START HERE) */}
                          {isStartHereTarget && (
                            <circle cx={x} cy={y} r={20} fill={isUserConnectionStart ? "#f97316" : "#16a34a"} opacity="0.2">
                              <animate attributeName="r" from="8" to="25" dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                            </circle>
                          )}

                          {/* Visible Node */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isCurrent || isStartHereTarget ? 10 : (isStart || isEnd ? 8 : 6)}
                            fill={isCurrent ? "#f42a41" : (isStartHereTarget ? "#f97316" : "white")}
                            stroke={isCurrent ? "white" : primaryColor}
                            strokeWidth="2.5"
                            className="transition-all duration-300 group-hover/node:r-12 shadow-md"
                          />

                          {/* Icon Overlay for special stations */}
                          {(isMetroStation || isRailwayStation || isAirport) && (
                            <g transform={`translate(${x - iconSize/2}, ${y - iconSize/2})`}>
                              {isAirport ? (
                                <Plane className={isCurrent || isStartHereTarget ? "text-white" : "text-orange-600"} size={iconSize} strokeWidth={3} />
                              ) : (
                                <Train className={isCurrent || isStartHereTarget ? "text-white" : "text-kj-primary"} size={iconSize} strokeWidth={3} />
                              )}
                            </g>
                          )}

                          {/* Stop Number for Bus Routes */}
                          {!isMetroStation && !isRailwayStation && !isAirport && (
                            <text 
                              x={x} 
                              y={y + 1} 
                              textAnchor="middle" 
                              dominantBaseline="middle" 
                              fontSize="8" 
                              fontWeight="900" 
                              fill={isCurrent || isStartHereTarget ? "white" : primaryColor}
                              className="pointer-events-none font-sans"
                            >
                              {idx + 1}
                            </text>
                          )}
                        </>
                      );
                    })()}

                    {/* Label */}
                    {/* SVG Label */}
                    <g className="transition-all duration-300 opacity-100">
                      {/* Background Pill */}
                      <rect
                        x={x - (s.name.length * 3 + 10)}
                        y={idx % 2 === 0 ? y + 14 : y - 34}
                        width={s.name.length * 6 + 20}
                        height="20"
                        rx="4"
                        fill={undefined}
                        stroke={isCurrent ? "#ef4444" : isUserConnectionStart ? "#f97316" : isRealStart ? "#16a34a" : isRealEnd ? "#ef4444" : isHighlighted ? "#e5e7eb" : "#f1f5f9"}
                        strokeWidth="1"
                        className={`drop-shadow-sm fill-white dark:fill-slate-800`}
                      />

                      {/* Text Name */}
                      <text
                        x={x}
                        y={idx % 2 === 0 ? y + 28 : y - 20}
                        textAnchor="middle"
                        className={`text-[10px] font-bold fill-gray-700 dark:fill-gray-200 pointer-events-none select-none`}
                        style={{ fontSize: '10px' }}
                      >
                        {s.name}
                      </text>

                      {/* Status Badge (You/Dest) */}
                      {isCurrent && (
                        <g transform={`translate(${x}, ${idx % 2 === 0 ? y + 42 : y - 48})`}>
                          <rect x="-18" y="-7" width="36" height="14" rx="3" fill="#ef4444" />
                          <text x="0" y="3" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{t('busDetails.you')}</text>
                        </g>
                      )}

                      {/* TRANSIT Badge logic - HIGHEST PRIORITY */}
                      {tripTransferPoint === s.id ? (
                        <g transform={`translate(${x}, ${idx % 2 === 0 ? y + 42 : y - 48})`}>
                          <rect x="-30" y="-7" width="60" height="14" rx="3" fill="#6366f1" />
                          <text x="0" y="3" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">TRANSIT</text>
                        </g>
                      ) : (
                        <>
                          {/* Destination Badge Logic */}
                          {(tripDestination === s.id || isRealEnd) && (
                            <g transform={`translate(${x}, ${idx % 2 === 0 ? y + 42 : y - 48})`}>
                              <rect x="-38" y="-7" width="76" height="14" rx="3" fill="#ef4444" />
                              <text x="0" y="3" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{t('busDetails.destination')}</text>
                            </g>
                          )}

                          {/* Start/Origin Badge Logic */}
                          {((isRealStart && !isUserConnectionStart) || tripOrigin === s.id) && (
                            <g transform={`translate(${x}, ${idx % 2 === 0 ? y + 42 : y - 48})`}>
                              <rect x="-26" y="-7" width="52" height="14" rx="3" fill={s.id === tripOrigin ? "#475569" : "#16a34a"} />
                              <text x="0" y="3" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{s.id === tripOrigin ? "ORIGIN" : t('busDetails.start')}</text>
                            </g>
                          )}
                        </>
                      )}

                      {isUserConnectionStart && (
                        <g transform={`translate(${x}, ${idx % 2 === 0 ? y + 42 : y - 48})`}>
                          <rect x="-35" y="-7" width="70" height="14" rx="3" fill="#f97316" />
                          <text x="0" y="3" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{t('busDetails.startHere').toUpperCase()}</text>
                        </g>
                      )}
                    </g>


                  </g>
                );
              })}

              {/* Off-Route Origin Visualization */}
              {!isOriginOnRoute && originStation && startPos && (
                <g className="animate-in fade-in zoom-in duration-700">
                  {/* Dashed Line from Origin to First Stop of Leg */}
                  <line
                    x1={startPos.x}
                    y1={startPos.y}
                    x2={startPos.x + (isReversed ? 120 : -120)}
                    y2={startPos.y}
                    stroke="#475569"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                    className="opacity-60"
                  />
                  {/* Arrow head (backwards) */}
                  <path
                    d={isReversed
                      ? `M${startPos.x + 10},${startPos.y - 4} L${startPos.x},${startPos.y} L${startPos.x + 10},${startPos.y + 4}`
                      : `M${startPos.x - 10},${startPos.y - 4} L${startPos.x},${startPos.y} L${startPos.x - 10},${startPos.y + 4}`
                    }
                    fill="#475569"
                    opacity="0.6"
                  />

                  {/* Origin Node */}
                  <g className="cursor-pointer group/origin">
                    <circle
                      cx={startPos.x + (isReversed ? 120 : -120)}
                      cy={startPos.y}
                      r={10}
                      fill="#475569"
                      stroke="white"
                      strokeWidth="3"
                      className="shadow-lg"
                    />
                    <foreignObject
                      x={startPos.x + (isReversed ? 120 : -120) - 60}
                      y={startPos.y + 18}
                      width="120"
                      height="60"
                      className="overflow-visible"
                    >
                      <div className="flex flex-col items-center">
                        <div className="px-3 py-1.5 rounded-lg shadow-md bg-slate-600 text-white border border-kj-line text-xs font-bold whitespace-nowrap mb-1">
                          {originStation.name}
                        </div>
                        <div className="text-[9px] font-bold text-kj-text-dim bg-white/90 px-1.5 rounded-full border border-slate-100 shadow-sm">
                          ORIGINAL START
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                </g>
              )}

              {/* Off-Route Destination Visualization */}
              {!isDestOnRoute && destStation && alightPos && (
                <g className="animate-in fade-in zoom-in duration-700">
                  {/* Dashed Line from Alight Stop to Destination */}
                  <line
                    x1={alightPos.x}
                    y1={alightPos.y}
                    x2={alightPos.x + (isReversed ? -120 : 120)}
                    y2={alightPos.y}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                    className="opacity-60"
                  />
                  {/* Arrow head */}
                  <path
                    d={isReversed
                      ? `M${alightPos.x - 110},${alightPos.y - 4} L${alightPos.x - 120},${alightPos.y} L${alightPos.x - 110},${alightPos.y + 4}`
                      : `M${alightPos.x + 110},${alightPos.y - 4} L${alightPos.x + 120},${alightPos.y} L${alightPos.x + 110},${alightPos.y + 4}`
                    }
                    fill="#ef4444"
                    opacity="0.6"
                  />

                  {/* Destination Node */}
                  <g className="cursor-pointer group/dest">
                    <circle
                      cx={alightPos.x + (isReversed ? -120 : 120)}
                      cy={alightPos.y}
                      r={10}
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="3"
                      className="shadow-lg"
                    />
                    <foreignObject
                      x={alightPos.x + (isReversed ? -120 : 120) - 60}
                      y={alightPos.y + 18}
                      width="120"
                      height="60"
                      className="overflow-visible"
                    >
                      <div className="flex flex-col items-center">
                        <div className="px-3 py-1.5 rounded-lg shadow-md bg-kj-accent text-white border border-red-600 text-xs font-bold whitespace-nowrap mb-1">
                          {destStation.name}
                        </div>
                        <div className="text-[9px] font-bold text-red-600 bg-white/90 px-1.5 rounded-full border border-red-100 shadow-sm">
                          FINAL STOP
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                </g>
              )}

              {/* Metro Stations */}
              {showMetro && metroConnections.map((connection, idx) => {
                const { metroStation, busStopIndex, distance, metroX, metroY } = connection;
                const busStopPos = nodePositions[busStopIndex];

                return (
                  <g key={metroStation.id} className="pointer-events-auto">
                    {/* Connection Line to Bus Stop */}
                    <line
                      x1={busStopPos.x}
                      y1={busStopPos.y}
                      x2={metroX}
                      y2={metroY}
                      stroke="#9333ea"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="opacity-60"
                    />

                    {/* Metro Station Node */}
                    <circle
                      cx={metroX}
                      cy={metroY}
                      r="18"
                      fill="#f3e8ff"
                      className="opacity-30"
                    >
                      <animate attributeName="r" from="18" to="25" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>

                    <circle
                      cx={metroX}
                      cy={metroY}
                      r="10"
                      fill="#9333ea"
                      stroke="white"
                      strokeWidth="2.5"
                      className="cursor-pointer hover:r-12 transition-all"
                    />

                    {/* Train Icon */}
                    <foreignObject x={metroX - 6} y={metroY - 6} width="12" height="12" className="pointer-events-none">
                      <Train className="w-3 h-3 text-white" />
                    </foreignObject>

                    {/* Metro Station Label */}
                    <foreignObject
                      x={metroX - 100}
                      y={metroY + 15}
                      width="200"
                      height="40"
                      className="pointer-events-none"
                    >
                      <div className="text-center flex flex-col items-center justify-center h-full">
                        <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold shadow-sm">
                          {metroStation.name}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* Railway Stations (Fix Issue #6) */}
              {showRailway && Object.values(RAILWAY_STATIONS).map(station => {
                // Find nearest bus stop for positioning
                let minDist = Infinity;
                let nearestIdx = 0;
                stations.forEach((s, idx) => {
                  const d = Math.hypot(s.lat - station.lat, s.lng - station.lng);
                  if (d < minDist) {
                    minDist = d;
                    nearestIdx = idx;
                  }
                });

                if (minDist > 0.05) return null; // Too far from route

                const busPos = nodePositions[nearestIdx];
                const offsetX = (station.lng > stations[nearestIdx].lng ? 1 : -1) * 70;
                const offsetY = (station.lat > stations[nearestIdx].lat ? -1 : 1) * 70;
                const railX = busPos.x + offsetX;
                const railY = busPos.y + offsetY;

                return (
                  <g key={station.id} className="pointer-events-auto">
                    {/* Connection Line */}
                    <line
                      x1={busPos.x}
                      y1={busPos.y}
                      x2={railX}
                      y2={railY}
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="opacity-60"
                    />

                    {/* Railway Station Ripple */}
                    <circle cx={railX} cy={railY} r="18" fill="#dcfce7" className="opacity-30">
                      <animate attributeName="r" from="18" to="25" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>

                    {/* Railway Station Node */}
                    <circle
                      cx={railX}
                      cy={railY}
                      r="10"
                      fill="#22c55e"
                      stroke="white"
                      strokeWidth="2.5"
                      className="cursor-pointer hover:r-12 transition-all"
                    />

                    {/* Train Icon */}
                    <foreignObject x={railX - 6} y={railY - 6} width="12" height="12" className="pointer-events-none">
                      <Train className="w-3 h-3 text-white" />
                    </foreignObject>

                    {/* Label */}
                    <foreignObject x={railX - 100} y={railY + 15} width="200" height="40" className="pointer-events-none">
                      <div className="text-center flex flex-col items-center justify-center h-full">
                        <span className="px-2 py-0.5 rounded bg-green-50 border border-green-100 text-green-700 text-[10px] font-bold shadow-sm">
                          {station.name}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* Airports (Fix Issue #6) */}
              {showAirport && Object.values(AIRPORTS).map(airport => {
                // Find nearest bus stop for positioning
                let minDist = Infinity;
                let nearestIdx = 0;
                stations.forEach((s, idx) => {
                  const d = Math.hypot(s.lat - airport.lat, s.lng - airport.lng);
                  if (d < minDist) {
                    minDist = d;
                    nearestIdx = idx;
                  }
                });

                if (minDist > 0.1) return null; // Too far from route

                const busPos = nodePositions[nearestIdx];
                const offsetX = (airport.lng > stations[nearestIdx].lng ? 1 : -1) * 80;
                const offsetY = (airport.lat > stations[nearestIdx].lat ? -1 : 1) * 80;
                const airX = busPos.x + offsetX;
                const airY = busPos.y + offsetY;

                return (
                  <g key={airport.id} className="pointer-events-auto">
                    {/* Connection Line */}
                    <line
                      x1={busPos.x}
                      y1={busPos.y}
                      x2={airX}
                      y2={airY}
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="opacity-60"
                    />

                    {/* Airport Ripple */}
                    <circle cx={airX} cy={airY} r="18" fill="#ffedd5" className="opacity-30">
                      <animate attributeName="r" from="18" to="25" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>

                    {/* Airport Node */}
                    <circle
                      cx={airX}
                      cy={airY}
                      r="10"
                      fill="#f97316"
                      stroke="white"
                      strokeWidth="2.5"
                      className="cursor-pointer hover:r-12 transition-all"
                    />

                    {/* Plane Icon */}
                    <foreignObject x={airX - 6} y={airY - 6} width="12" height="12" className="pointer-events-none">
                      <Plane className="w-3 h-3 text-white" />
                    </foreignObject>

                    {/* Label */}
                    <foreignObject x={airX - 100} y={airY + 15} width="200" height="40" className="pointer-events-none">
                      <div className="text-center flex flex-col items-center justify-center h-full">
                        <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold shadow-sm">
                          {airport.name}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* Simulation Bus */}
              {hasHighlight && (
                <g transform={`translate(${
                  // Interpolate position along the highlighted path
                  (() => {
                    const totalSegments = highlightEndIdx - highlightStartIdx;
                    const segmentIndex = Math.floor(simulationStep * totalSegments);
                    const segmentProgress = (simulationStep * totalSegments) % 1;

                    if (!isReversed) {
                      const currentIdx = highlightStartIdx + segmentIndex;
                      if (currentIdx >= highlightEndIdx) return nodePositions[highlightEndIdx].x;
                      const p1 = nodePositions[currentIdx];
                      const p2 = nodePositions[currentIdx + 1];
                      return p1.x + (p2.x - p1.x) * segmentProgress;
                    } else {
                      const currentIdx = highlightEndIdx - segmentIndex;
                      if (currentIdx <= highlightStartIdx) return nodePositions[highlightStartIdx].x;
                      const p1 = nodePositions[currentIdx];
                      const p2 = nodePositions[currentIdx - 1];
                      return p1.x + (p2.x - p1.x) * segmentProgress;
                    }
                  })()
                  }, ${(() => {
                    const totalSegments = highlightEndIdx - highlightStartIdx;
                    const segmentIndex = Math.floor(simulationStep * totalSegments);
                    const segmentProgress = (simulationStep * totalSegments) % 1;

                    if (!isReversed) {
                      const currentIdx = highlightStartIdx + segmentIndex;
                      if (currentIdx >= highlightEndIdx) return nodePositions[highlightEndIdx].y;
                      const p1 = nodePositions[currentIdx];
                      const p2 = nodePositions[currentIdx + 1];
                      return p1.y + (p2.y - p1.y) * segmentProgress;
                    } else {
                      const currentIdx = highlightEndIdx - segmentIndex;
                      if (currentIdx <= highlightStartIdx) return nodePositions[highlightStartIdx].y;
                      const p1 = nodePositions[currentIdx];
                      const p2 = nodePositions[currentIdx - 1];
                      return p1.y + (p2.y - p1.y) * segmentProgress;
                    }
                  })()
                  })`}>
                  <circle r="12" fill="#006a4e" className="animate-pulse opacity-50" />
                  <circle r="8" fill="#006a4e" stroke="white" strokeWidth="2" />
                  <foreignObject x="-6" y="-6" width="12" height="12">
                    <Bus className="w-3 h-3 text-white" />
                  </foreignObject>
                </g>
              )}

              {/* User GPS Marker: Only show if user is FAR from any station on the route (>1km) */}
              {userLocation && isUserFar && userPos && (() => {
                // Only render this separate GPS marker if user is far from route
                // If they're at a station, the red marker on the station is enough

                return (
                  <g>
                    {/* Pulsing Circle Animation */}
                    <circle cx={userPos?.x || 0} cy={userPos?.y || 0} r="15" fill="#3b82f6" className="opacity-30">
                      <animate attributeName="r" from="15" to="25" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>

                    {/* User Location Marker */}
                    <circle
                      cx={userPos?.x || 0}
                      cy={userPos?.y || 0}
                      r="8"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="3"
                      className="cursor-pointer"
                    />

                    {/* Inner dot */}
                    <circle
                      cx={userPos?.x || 0}
                      cy={userPos?.y || 0}
                      r="3"
                      fill="white"
                    />

                    {/* Label */}
                    <foreignObject
                      x={(userPos?.x || 0) - 80}
                      y={(userPos?.y || 0) + 15}
                      width="160"
                      height="40"
                      className="pointer-events-none"
                    >
                      <div className="text-center flex flex-col items-center justify-center h-full">
                        <span className="px-2 py-0.5 rounded bg-kj-primary text-kj-primary-ink text-[10px] font-bold shadow-lg truncate max-w-full">
                          {globalNearestName || "You are here"}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })()}

              {/* Render Live Buses - Must be LAST for top layer visibility */}
              {liveBusPositions.map((bus, i) => (
                <g key={bus.busId} transform={`translate(${bus.x}, ${bus.y})`} className="live-bus-marker">
                  {/* Bus Icon Marker */}
                  <g transform="translate(-14, -40)"> {/* Lift above station */}

                    {/* Pulse Ring */}
                    <circle cx="14" cy="14" r="20" fill="#22c55e" opacity="0.3">
                      <animate attributeName="r" from="10" to="25" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>

                    {/* Bus Body */}
                    <rect x="0" y="0" width="28" height="28" rx="6" fill="#16a34a" stroke="white" strokeWidth="2" />

                    {/* Bus Icon SVG */}
                    <path d="M8 6v6 M15 6v6 M2 12h19.6 M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3 M9 18h5"
                      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(2.5, 2.5) scale(0.8)" />

                    {/* Tail of marker */}
                    <path d="M7 26 L14 34 L21 26 Z" fill="#16a34a" stroke="white" strokeWidth="1" />
                  </g>

                  {/* Speed Label */}
                  <rect x="-18" y="-55" width="36" height="12" rx="3" fill="#22c55e" />
                  <text x="0" y="-46" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{Math.round(bus.speed)} km/h</text>
                </g>
              ))}

            </g>
          </svg>
        </div>
      </div >
    </div >
  );
};

export default MapVisualizer;
