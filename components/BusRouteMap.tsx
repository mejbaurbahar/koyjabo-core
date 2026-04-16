import React, { useEffect, useRef, useState } from 'react';
import type { BusRoute, UserLocation } from '../types';
import { STATIONS } from '../constants';
import { Maximize2, MapPin, Navigation } from 'lucide-react';

interface BusRouteMapProps {
  route: BusRoute;
  userLocation?: UserLocation | null;
  highlightStartIdx?: number;
  highlightEndIdx?: number;
  isReversed?: boolean;
  onOpenFullMap?: () => void;
}

// Deterministic color from route id
function getRouteColor(id: string): string {
  const palette = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#14b8a6'];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

const BusRouteMap: React.FC<BusRouteMapProps> = ({
  route,
  userLocation,
  highlightStartIdx = -1,
  highlightEndIdx = -1,
  isReversed = false,
  onOpenFullMap,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const routeColor = getRouteColor(route.id);

  const stops = isReversed ? [...route.stops].reverse() : route.stops;

  // Compute stop coords
  const stopCoords: [number, number][] = stops
    .map(id => STATIONS[id])
    .filter(Boolean)
    .map(s => [s.lat, s.lng]);

  useEffect(() => {
    if (!mapRef.current || stopCoords.length === 0) return;

    // Lazy-load Leaflet
    import('leaflet').then(L => {
      // Inject Leaflet CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
      });

      // OSM tile layer (free, offline-cacheable)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        crossOrigin: true,
      }).addTo(map);

      // Zoom control bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const group = L.layerGroup().addTo(map);
      layerGroupRef.current = group;

      // Glow polyline (wider, semi-transparent)
      L.polyline(stopCoords, {
        color: routeColor,
        weight: 8,
        opacity: 0.18,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      // Main polyline
      L.polyline(stopCoords, {
        color: routeColor,
        weight: 3.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      // Highlighted segment
      if (highlightStartIdx >= 0 && highlightEndIdx >= 0 && highlightEndIdx > highlightStartIdx) {
        const hiCoords = stopCoords.slice(highlightStartIdx, highlightEndIdx + 1);
        if (hiCoords.length >= 2) {
          L.polyline(hiCoords, {
            color: '#f59e0b',
            weight: 4.5,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(group);
        }
      }

      // Stop markers
      stops.forEach((id, idx) => {
        const station = STATIONS[id];
        if (!station) return;
        const isFirst = idx === 0;
        const isLast = idx === stops.length - 1;
        const isHighlighted = idx === highlightStartIdx || idx === highlightEndIdx;

        let bg = '#fff';
        let border = routeColor;
        let textColor = routeColor;
        let label = String(idx + 1);

        if (isFirst) { bg = routeColor; border = routeColor; textColor = '#fff'; label = 'A'; }
        else if (isLast) { bg = '#1e293b'; border = '#1e293b'; textColor = '#fff'; label = 'B'; }
        else if (isHighlighted) { bg = '#f59e0b'; border = '#f59e0b'; textColor = '#fff'; }

        const size = isFirst || isLast ? 26 : isHighlighted ? 22 : 16;
        const fontSize = isFirst || isLast ? 10 : 8;

        const icon = L.divIcon({
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;font-weight:700;color:${textColor};box-shadow:0 1px 4px rgba(0,0,0,0.25);font-family:sans-serif;">${label}</div>`,
        });

        L.marker([station.lat, station.lng], { icon })
          .bindTooltip(`<b>${station.name}</b><br><small>${station.bnName}</small>`, {
            direction: 'top',
            offset: [0, -size / 2 - 4],
            className: 'leaflet-tooltip-bus',
          })
          .addTo(group);
      });

      // User location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 2px #3b82f6,0 2px 6px rgba(0,0,0,0.3);"></div>`,
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .bindTooltip('আপনি এখানে', { direction: 'top' })
          .addTo(group);
      }

      // Fit map to route bounds with padding
      if (stopCoords.length > 0) {
        const bounds = L.latLngBounds(stopCoords);
        map.fitBounds(bounds, { padding: [24, 24] });
      }

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  // Only re-create on route change
  }, [route.id, isReversed]);

  // Update highlighted segment without full recreate
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !mapReady) return;
    import('leaflet').then(L => {
      // Remove only the highlight layer (last added polyline)
      layerGroupRef.current.eachLayer((layer: any) => {
        if (layer._highlightLayer) layerGroupRef.current.removeLayer(layer);
      });
      if (highlightStartIdx >= 0 && highlightEndIdx >= 0 && highlightEndIdx > highlightStartIdx) {
        const hiCoords = stopCoords.slice(highlightStartIdx, highlightEndIdx + 1);
        if (hiCoords.length >= 2) {
          const hl = L.polyline(hiCoords, {
            color: '#f59e0b',
            weight: 4.5,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
          });
          (hl as any)._highlightLayer = true;
          hl.addTo(layerGroupRef.current);
        }
      }
    });
  }, [highlightStartIdx, highlightEndIdx, mapReady]);

  return (
    <div className="relative w-full rounded-b-2xl overflow-hidden" style={{ height: 300 }}>
      {/* Leaflet map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Route label badge */}
      <div className="absolute top-3 left-3 z-[500] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-lg" style={{ background: routeColor }}>
        <MapPin className="w-3.5 h-3.5" />
        {route.name}
      </div>

      {/* Stop count badge */}
      <div className="absolute top-3 right-3 z-[500] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-lg border border-gray-100 dark:border-gray-700">
        {stops.length} stops
      </div>

      {/* Open full map button */}
      {onOpenFullMap && (
        <button
          onClick={onOpenFullMap}
          className="absolute bottom-10 right-3 z-[500] flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          title="Full screen map"
        >
          <Navigation className="w-3.5 h-3.5" />
          Live Navigate
        </button>
      )}

      {/* Offline-ready note */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <MapPin className="w-8 h-8 animate-pulse" />
            <span className="text-xs">Loading map…</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusRouteMap;
