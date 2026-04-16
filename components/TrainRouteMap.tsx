import React, { useEffect, useRef, useState } from 'react';
import { BDTrainRoute, TRAIN_STATIONS } from '../data/bangladeshTrainData';
import { UserLocation } from '../types';
import { Layers, Train, X } from 'lucide-react';

interface TrainRouteMapProps {
  route: BDTrainRoute;
  userLocation?: UserLocation | null;
  highlightFromId?: string;
  highlightToId?: string;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchRoadRoute(coords: [number, number][]): Promise<[number, number][] | null> {
  if (coords.length < 2) return null;
  try {
    const MAX_WP = 18;
    let waypoints = coords;
    if (coords.length > MAX_WP) {
      const step = (coords.length - 1) / (MAX_WP - 1);
      waypoints = Array.from({ length: MAX_WP }, (_, i) => coords[Math.round(i * step)]);
    }
    const coordStr = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;
    return (data.routes[0].geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]);
  } catch {
    return null;
  }
}

const TrainRouteMap: React.FC<TrainRouteMapProps> = ({
  route,
  userLocation,
  highlightFromId,
  highlightToId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const overlayLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [routeSnapped, setRouteSnapped] = useState(false);

  const drawableStops = route.stops.filter(id => !!TRAIN_STATIONS[id]);
  const stopCoords: [number, number][] = drawableStops.map(id => [TRAIN_STATIONS[id].lat, TRAIN_STATIONS[id].lng]);

  let hlStartIdx = -1;
  let hlEndIdx = -1;
  if (highlightFromId && highlightToId) {
    const si = drawableStops.indexOf(highlightFromId);
    const ei = drawableStops.indexOf(highlightToId);
    if (si !== -1 && ei !== -1) {
      hlStartIdx = Math.min(si, ei);
      hlEndIdx = Math.max(si, ei);
    }
  }

  let nearestStopIdx = -1;
  let nearestDist = Infinity;
  if (userLocation && stopCoords.length > 0) {
    stopCoords.forEach(([lat, lng], idx) => {
      const d = haversineKm(userLocation.lat, userLocation.lng, lat, lng);
      if (d < nearestDist) { nearestDist = d; nearestStopIdx = idx; }
    });
  }

  useEffect(() => {
    if (!mapRef.current || stopCoords.length === 0) return;
    let cancelled = false;

    import('leaflet').then(async L => {
      if (cancelled) return;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Init or reuse map
      if (!mapInstanceRef.current) {
        const bounds = L.latLngBounds(stopCoords.map(([lat, lng]) => [lat, lng]));
        mapInstanceRef.current = L.map(mapRef.current!, {
          zoomControl: false,
          attributionControl: false,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(mapInstanceRef.current);
        L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
        mapInstanceRef.current.fitBounds(bounds.pad(0.12));
      } else {
        const bounds = L.latLngBounds(stopCoords.map(([lat, lng]) => [lat, lng]));
        mapInstanceRef.current.fitBounds(bounds.pad(0.12));
      }

      if (cancelled) return;

      // Draw route
      if (routeLayerRef.current) { mapInstanceRef.current.removeLayer(routeLayerRef.current); }
      if (overlayLayerRef.current) { mapInstanceRef.current.removeLayer(overlayLayerRef.current); }

      const roadCoords = await fetchRoadRoute(stopCoords);
      if (cancelled) return;

      if (roadCoords) {
        setRouteSnapped(true);
        routeLayerRef.current = L.layerGroup();
        // Full route dim
        L.polyline(roadCoords, { color: route.color, weight: 4, opacity: 0.35, dashArray: undefined }).addTo(routeLayerRef.current);
        // Highlighted segment
        if (hlStartIdx !== -1 && hlEndIdx !== -1) {
          const hlCoords = stopCoords.slice(hlStartIdx, hlEndIdx + 1);
          const hlRoad = await fetchRoadRoute(hlCoords);
          if (!cancelled && hlRoad) {
            L.polyline(hlRoad, { color: route.color, weight: 6, opacity: 1 }).addTo(routeLayerRef.current);
          } else if (!cancelled) {
            L.polyline(hlCoords, { color: route.color, weight: 6, opacity: 1 }).addTo(routeLayerRef.current);
          }
        }
        routeLayerRef.current.addTo(mapInstanceRef.current);
      } else {
        routeLayerRef.current = L.layerGroup();
        L.polyline(stopCoords, { color: route.color, weight: 5, opacity: 0.45, dashArray: '6 4' }).addTo(routeLayerRef.current);
        if (hlStartIdx !== -1 && hlEndIdx !== -1) {
          L.polyline(stopCoords.slice(hlStartIdx, hlEndIdx + 1), { color: route.color, weight: 6, opacity: 1 }).addTo(routeLayerRef.current);
        }
        routeLayerRef.current.addTo(mapInstanceRef.current);
      }

      // Station markers — bus-style pill for start/end, dot+label for intermediates
      overlayLayerRef.current = L.layerGroup();
      drawableStops.forEach((id, idx) => {
        const st = TRAIN_STATIONS[id];
        const isFirst = idx === 0;
        const isLast = idx === drawableStops.length - 1;
        const isHlStart = idx === hlStartIdx;
        const isHlEnd = idx === hlEndIdx;
        const isNearest = idx === nearestStopIdx;

        let iconHtml: string;
        let iconW: number;
        let iconH: number;
        let anchorX: number;
        let anchorY: number;

        if (isFirst) {
          // Green pill — Start
          iconW = 52; iconH = 24; anchorX = 26; anchorY = 12;
          iconHtml = `<div style="width:52px;height:24px;border-radius:12px;background:#10b981;border:2px solid #059669;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);white-space:nowrap;font-family:sans-serif;">Start</div>`;
        } else if (isLast) {
          // Dark pill — Destination
          iconW = 76; iconH = 24; anchorX = 38; anchorY = 12;
          iconHtml = `<div style="width:76px;height:24px;border-radius:12px;background:#1e293b;border:2px solid #0f172a;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);white-space:nowrap;font-family:sans-serif;">Destination</div>`;
        } else {
          // Intermediate: dot with always-visible name label
          const dotColor = isNearest ? '#f97316' : (isHlStart || isHlEnd ? route.color : '#94a3b8');
          const dotBorder = isNearest ? '#ea580c' : (isHlStart || isHlEnd ? route.color : '#cbd5e1');
          const dotSize = isHlStart || isHlEnd || isNearest ? 12 : 9;
          const label = st.name;
          iconW = 120; iconH = dotSize + 20;
          anchorX = dotSize / 2; anchorY = dotSize / 2;
          iconHtml = `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;pointer-events:none">` +
            `<div style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${dotColor};border:2px solid ${dotBorder};box-shadow:0 1px 4px rgba(0,0,0,0.3);flex-shrink:0"></div>` +
            `<div style="background:rgba(255,255,255,0.93);color:#1e293b;padding:1px 5px;border-radius:4px;font-size:9px;font-weight:600;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.22);line-height:1.5;max-width:110px;overflow:hidden;text-overflow:ellipsis">${label}</div>` +
            `</div>`;
        }

        const icon = L.divIcon({
          className: '',
          iconSize: [iconW, iconH],
          iconAnchor: [anchorX, anchorY],
          html: iconHtml,
        });

        const marker = L.marker([st.lat, st.lng], { icon, zIndexOffset: isFirst || isLast ? 1000 : 0 });
        marker.bindPopup(`<b>${st.name}</b><br/><span style="font-size:11px;color:#64748b">${st.bnName}</span>`);
        marker.addTo(overlayLayerRef.current);
      });
      overlayLayerRef.current.addTo(mapInstanceRef.current);

      // User location
      if (userMarkerRef.current) { mapInstanceRef.current.removeLayer(userMarkerRef.current); }
      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.25)"></div>`,
          className: '',
          iconAnchor: [7, 7],
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .bindPopup('<b>আপনার অবস্থান</b><br/>Your Location')
          .addTo(mapInstanceRef.current);
      }

      setMapReady(true);
    });

    return () => { cancelled = true; };
  }, [route.id, highlightFromId, highlightToId, userLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      routeLayerRef.current = null;
      overlayLayerRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">ম্যাপ লোড হচ্ছে...</p>
          </div>
        </div>
      )}

      {/* Snapped indicator */}
      {routeSnapped && (
        <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-800/90 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full shadow flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
          Road-Snapped
        </div>
      )}

      {/* Layers toggle */}
      <button
        onClick={() => setShowLayers(v => !v)}
        className="absolute top-2 right-2 z-[500] p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
      >
        <Layers className="w-4 h-4" />
      </button>
      {showLayers && (
        <div className="absolute top-12 right-2 z-[500] bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 w-40 text-xs font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Train className="w-3.5 h-3.5 text-blue-500" />
            <span>Rail Route Map</span>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] leading-tight mt-1">
            Showing {drawableStops.length} stations on this route
          </p>
          <button onClick={() => setShowLayers(false)} className="absolute top-1 right-1 p-0.5 text-gray-400 hover:text-gray-600">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TrainRouteMap;
