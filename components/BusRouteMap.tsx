import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { BusRoute, UserLocation } from '../types';
import { STATIONS, METRO_STATIONS, RAILWAY_STATIONS, AIRPORTS } from '../constants';
import { Navigation, Layers, Train, Plane, X } from 'lucide-react';

interface BusRouteMapProps {
  route: BusRoute;
  userLocation?: UserLocation | null;
  /** Station ID of the fare-start stop (e.g. 'jigatola') */
  highlightStartId?: string;
  /** Station ID of the fare-end stop (e.g. 'azimpur') */
  highlightEndId?: string;
  isReversed?: boolean;
  onOpenFullMap?: () => void;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getRouteColor(id: string): string {
  const palette = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#14b8a6'];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

// Fetch road-snapped route from OSRM (free, no API key)
// Fetch road-snapped route and waypoints from OSRM
async function fetchRoadRoute(coords: [number, number][]): Promise<{ path: [number, number][], waypoints: [number, number][] } | null> {
  if (coords.length < 2) return null;
  try {
    const MAX_WP = 100;
    let waypoints = coords;
    if (coords.length > MAX_WP) {
      const step = (coords.length - 1) / (MAX_WP - 1);
      waypoints = Array.from({ length: MAX_WP }, (_, i) => coords[Math.round(i * step)]);
    }
    const coordStr = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const radiuses = waypoints.map(() => 50).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&radiuses=${radiuses}`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;
    
    return {
      path: (data.routes[0].geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]),
      waypoints: (data.waypoints || []).map((wp: any) => [wp.location[1], wp.location[0]])
    };
  } catch {
    return null;
  }
}

const BusRouteMap: React.FC<BusRouteMapProps> = ({
  route,
  userLocation,
  highlightStartId,
  highlightEndId,
  isReversed = false,
  onOpenFullMap,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const overlayLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const roadCoordsRef = useRef<[number, number][] | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showMetro, setShowMetro] = useState(false);
  const [showRailway, setShowRailway] = useState(false);
  const [showAirport, setShowAirport] = useState(false);
  const [routeSnapped, setRouteSnapped] = useState(false);
  const [is3D, setIs3D] = useState(false);

  const routeColor = getRouteColor(route.id);

  // Only use stops that exist in STATIONS (drawable on map)
  const stops = isReversed ? [...route.stops].reverse() : route.stops;
  const drawableStops = stops.filter(id => !!STATIONS[id]);
  const stopCoords: [number, number][] = drawableStops.map(id => [STATIONS[id].lat, STATIONS[id].lng]);

  // Compute highlight indices against the drawable stops array (not validStopIds)
  let highlightStartIdx = -1;
  let highlightEndIdx = -1;
  if (highlightStartId && highlightEndId) {
    const si = drawableStops.indexOf(highlightStartId);
    const ei = drawableStops.indexOf(highlightEndId);
    if (si !== -1 && ei !== -1) {
      highlightStartIdx = Math.min(si, ei);
      highlightEndIdx = Math.max(si, ei);
    }
  }

  // Nearest stop to user's current location
  let nearestStopIdx = -1;
  let nearestStopDistKm = Infinity;
  if (userLocation && stopCoords.length > 0) {
    stopCoords.forEach(([lat, lng], idx) => {
      const d = haversineKm(userLocation.lat, userLocation.lng, lat, lng);
      if (d < nearestStopDistKm) { nearestStopDistKm = d; nearestStopIdx = idx; }
    });
  }

  // Build and draw the map
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

      const isTouchDevice =
        typeof window !== 'undefined' &&
        (
          ('ontouchstart' in window) ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia('(pointer: coarse)').matches
        );
      const map = L.map(mapRef.current!, {
        zoomControl: !isTouchDevice,
        attributionControl: false,
        scrollWheelZoom: !isTouchDevice,
        dragging: !isTouchDevice,
        touchZoom: false,
        tap: false,
      });

      // On touch devices: disable all interactions so page scroll works smoothly
      if (isTouchDevice) {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.touchZoom.enable();
        if (mapRef.current) {
          mapRef.current.style.touchAction = 'pan-y pinch-zoom';
          mapRef.current.style.pointerEvents = 'auto';

          // Prevent browser page zoom while pinching on the map area.
          const blockPagePinchZoom = (event: TouchEvent) => {
            if (event.touches.length > 1) {
              event.preventDefault();
            }
          };
          mapRef.current.addEventListener('touchmove', blockPagePinchZoom, { passive: false });
          map.once('unload', () => {
            mapRef.current?.removeEventListener('touchmove', blockPagePinchZoom);
          });
        }
      }

      if (!isTouchDevice) {
        map.touchZoom.disable();
      }
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 19,
        crossOrigin: true,
      }).addTo(map);

      // Zoom control handled by custom React buttons below

      mapInstanceRef.current = map;
      routeLayerRef.current = L.layerGroup().addTo(map);
      overlayLayerRef.current = L.layerGroup().addTo(map);

      // Fit to straight-line bounds; include user location so walking line is visible
      const allPoints: [number, number][] = [...stopCoords];
      if (userLocation) allPoints.push([userLocation.lat, userLocation.lng]);
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [32, 32] });

      // Draw straight-line route immediately (fallback)
      drawRoute(L, stopCoords, null, false);

      setMapReady(true);

      // Try to fetch road-snapped route
      const snappedData = await fetchRoadRoute(stopCoords);
      if (cancelled || !mapInstanceRef.current) return;
      if (snappedData) {
        roadCoordsRef.current = snappedData.path;
        drawRoute(L, stopCoords, snappedData.path, true, snappedData.waypoints);
        setRouteSnapped(true);
      } else {
        roadCoordsRef.current = null;
      }
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        roadCoordsRef.current = null;
        setMapReady(false);
        setRouteSnapped(false);
      }
    };
  }, [route.id, isReversed]);

  // Draw route lines + stop markers
  const drawRoute = useCallback((L: any, coords: [number, number][], roadCoords: [number, number][] | null, snapped: boolean, snappedWaypoints: [number, number][] | null = null) => {
    if (!routeLayerRef.current) return;
    routeLayerRef.current.clearLayers();

    const linePath = roadCoords ?? coords;

    // 1. Glow Layer
    L.polyline(linePath, { 
      color: routeColor, 
      weight: 12, 
      opacity: 0.15, 
      lineCap: 'round', 
      lineJoin: 'round' 
    }).addTo(routeLayerRef.current);

    // 2. Main Line
    L.polyline(linePath, { 
      color: routeColor, 
      weight: 4, 
      opacity: 0.95, 
      lineCap: 'round', 
      lineJoin: 'round' 
    }).addTo(routeLayerRef.current);

    // 3. Flow Layer (Animated)
    L.polyline(linePath, {
      color: '#ffffff',
      weight: 1.5,
      opacity: 0.5,
      dashArray: '10, 20',
      lineCap: 'round',
      className: 'route-line-flow'
    }).addTo(routeLayerRef.current);

    // Highlight segment
    if (highlightStartIdx >= 0 && highlightEndIdx >= 0 && highlightEndIdx > highlightStartIdx) {
      const hi = coords.slice(highlightStartIdx, highlightEndIdx + 1);
      if (hi.length >= 2) {
        L.polyline(hi, { color: '#f59e0b', weight: 6, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(routeLayerRef.current);
      }
    }

    // Stop markers
    const hasFare = highlightStartIdx >= 0 && highlightEndIdx >= 0;
    const startMarkerIdx = hasFare ? highlightStartIdx : 0;
    const endMarkerIdx   = hasFare ? highlightEndIdx   : coords.length - 1;

    coords.forEach((coord, idx) => {
      const station = STATIONS[drawableStops[idx]];
      if (!station) return;
      const isStart = idx === startMarkerIdx;
      const isEnd   = idx === endMarkerIdx;
      const isNearest = idx === nearestStopIdx;

      let bg = '#fff';
      let border = routeColor;
      let textColor = routeColor;
      let label = '';
      let size = 14;
      let fontSize = 8;

      if (isStart) {
        bg = '#10b981'; border = '#059669'; textColor = '#fff';
        label = 'Start'; size = 52; fontSize = 10;
      } else if (isEnd) {
        bg = '#1e293b'; border = '#0f172a'; textColor = '#fff';
        label = 'Destination'; size = 76; fontSize = 10;
      } else if (isNearest) {
        bg = '#6366f1'; border = '#4f46e5'; textColor = '#fff';
        label = 'Nearest'; size = 58; fontSize = 9;
      } else {
        label = '●'; size = 12; fontSize = 8;
      }

      const h = isStart || isEnd || isNearest ? 24 : 14;
      const w = isStart || isEnd || isNearest ? size : 14;
      const br = isStart || isEnd || isNearest ? 12 : '50%';

      const displayCoord = (snapped && snappedWaypoints && snappedWaypoints[idx]) ? snappedWaypoints[idx] : coord;
      const icon = L.divIcon({
        className: 'custom-bus-marker',
        iconSize: [w, h],
        iconAnchor: [w / 2, h / 2],
        html: `
          <div class="relative flex items-center justify-center" style="transition: transform 0.7s ease-in-out; transform: ${is3D ? 'rotateX(-50deg)' : 'none'};">
            ${(isStart || isEnd || isNearest) ? `<div class="absolute w-full h-full bg-${isStart ? 'green' : isEnd ? 'slate' : 'indigo'}-400/30 rounded-full animate-ping" style="padding: 10px;"></div>` : ''}
            <div style="width:${w}px;height:${h}px;border-radius:${br}px;background:${bg};border:2px solid ${border};display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;font-weight:700;color:${textColor};box-shadow:${is3D ? '0 8px 16px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.3)'};white-space:nowrap;padding:0 8px;font-family:sans-serif;position:relative;z-index:1;">${label}</div>
          </div>
        `,
      });

      L.marker(displayCoord, { icon, zIndexOffset: (isStart || isEnd || isNearest) ? 1000 : 500 })
        .bindTooltip(`<b>${station.name}</b><br><small>${station.bnName}</small>`, {
          direction: 'top',
          offset: [0, -h / 2 - 4],
          className: 'leaflet-tooltip-bus',
        })
        .addTo(routeLayerRef.current);
    });

    // User location + walk-to-nearest-stop line
    if (userLocation) {
      if (userMarkerRef.current) { userMarkerRef.current.remove(); }

      // Dashed walking line: user → nearest bus stop
      if (nearestStopIdx >= 0) {
        const nearestCoord = (snapped && snappedWaypoints && snappedWaypoints[nearestStopIdx]) ? snappedWaypoints[nearestStopIdx] : coords[nearestStopIdx];
        const distM = Math.round(nearestStopDistKm * 1000);
        const distLabel = distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${distM} m`;

        // Dashed line
        L.polyline(
          [[userLocation.lat, userLocation.lng], nearestCoord],
          { color: '#6366f1', weight: 2.5, opacity: 0.85, dashArray: '6 5', lineCap: 'round' }
        ).addTo(routeLayerRef.current);

        // Nearest stop special marker (overrides the regular dot drawn above)
        const nearestStation = STATIONS[drawableStops[nearestStopIdx]];
        if (nearestStation) {
          const nearestIcon = L.divIcon({
            className: '',
            iconSize: [72, 24],
            iconAnchor: [36, 12],
            html: `<div style="width:72px;height:24px;border-radius:12px;background:#6366f1;border:2px solid #4f46e5;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;box-shadow:0 2px 8px rgba(99,102,241,0.5);white-space:nowrap;padding:0 8px;font-family:sans-serif;">📍 Nearest</div>`,
          });
          L.marker(nearestCoord, { icon: nearestIcon, zIndexOffset: 900 })
            .bindTooltip(
              `<b>📍 ${nearestStation.name}</b><br><small>নিকটতম বাস স্টপ · ${distLabel} দূরে</small>`,
              { direction: 'top', offset: [0, -16], className: 'leaflet-tooltip-bus' }
            )
            .addTo(routeLayerRef.current);
        }

        // Walking distance badge midpoint label
        const midLat = (userLocation.lat + nearestCoord[0]) / 2;
        const midLng = (userLocation.lng + nearestCoord[1]) / 2;
        const midIcon = L.divIcon({
          className: '',
          iconSize: [60, 18],
          iconAnchor: [30, 9],
          html: `<div style="background:rgba(99,102,241,0.9);color:#fff;border-radius:8px;font-size:9px;font-weight:700;padding:2px 7px;white-space:nowrap;font-family:sans-serif;">🚶 ${distLabel}</div>`,
        });
        L.marker([midLat, midLng], { icon: midIcon, interactive: false }).addTo(routeLayerRef.current);
      }

      // Blue pulsing dot for user position
      const userIcon = L.divIcon({
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 2px #3b82f6,0 2px 6px rgba(0,0,0,0.3);"></div>`,
      });
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
        .bindTooltip('📍 আপনি এখানে', { direction: 'top', className: 'leaflet-tooltip-bus' })
        .addTo(routeLayerRef.current);
    }
  }, [route.id, isReversed, highlightStartIdx, highlightEndIdx, userLocation, routeColor, nearestStopIdx, nearestStopDistKm]);

  // Redraw markers+segment whenever fare selection changes (highlight indices change)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    import('leaflet').then(L => {
      if (!routeLayerRef.current) return;
      drawRoute(L, stopCoords, roadCoordsRef.current, roadCoordsRef.current !== null);
    });
  // drawRoute reference changes when highlightStartIdx/EndIdx change (useCallback dep)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawRoute, mapReady]);

  // Update overlay layers (metro/railway/airport)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    import('leaflet').then(L => {
      if (!overlayLayerRef.current) return;
      overlayLayerRef.current.clearLayers();

      if (showMetro) {
        Object.values(METRO_STATIONS).forEach((station: any) => {
          const icon = L.divIcon({
            className: '',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
            html: `<div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#6366f1);border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(59,130,246,0.5);" title="${station.name}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="9" y1="6" x2="15" y2="6"/><circle cx="9" cy="14" r="1.5" fill="white"/><circle cx="15" cy="14" r="1.5" fill="white"/></svg></div>`,
          });
          L.marker([station.lat, station.lng], { icon })
            .bindTooltip(`<b>🚇 ${station.name}</b><br><small>${station.bnName || ''}</small>`, { direction: 'top', className: 'leaflet-tooltip-bus' })
            .addTo(overlayLayerRef.current);
        });
      }

      if (showRailway) {
        Object.values(RAILWAY_STATIONS).forEach((station: any) => {
          const icon = L.divIcon({
            className: '',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
            html: `<div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(16,185,129,0.5);" title="${station.name}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="4" y="3" width="16" height="15" rx="3"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="7" y2="21"/><line x1="15" y1="18" x2="17" y2="21"/></svg></div>`,
          });
          L.marker([station.lat, station.lng], { icon })
            .bindTooltip(`<b>🚂 ${station.name}</b><br><small>${station.bnName || ''}</small>`, { direction: 'top', className: 'leaflet-tooltip-bus' })
            .addTo(overlayLayerRef.current);
        });
      }

      if (showAirport) {
        Object.values(AIRPORTS).forEach((airport: any) => {
          const icon = L.divIcon({
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            html: `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ef4444);border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(249,115,22,0.5);" title="${airport.name}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 1 16.5 2.5L13 6 4.8 4.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 5.7 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg></div>`,
          });
          L.marker([airport.lat, airport.lng], { icon })
            .bindTooltip(`<b>✈️ ${airport.name}</b><br><small>${airport.bnName || ''}</small>`, { direction: 'top', className: 'leaflet-tooltip-bus' })
            .addTo(overlayLayerRef.current);
        });
      }
    });
  }, [showMetro, showRailway, showAirport, mapReady]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 700);
    }
  }, [is3D]);

  // When Metro layer is enabled, include the full MRT line in viewport
  // so Uttara North / Center / South are visible.
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !showMetro) return;
    import('leaflet').then(L => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const metroPoints: [number, number][] = Object.values(METRO_STATIONS).map((station: any) => [station.lat, station.lng]);
      const routePoints: [number, number][] = [...stopCoords];
      if (userLocation) routePoints.push([userLocation.lat, userLocation.lng]);
      const allPoints = [...routePoints, ...metroPoints];
      if (allPoints.length < 2) return;

      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [30, 30] });
    });
  }, [showMetro, mapReady, userLocation, route.id, isReversed]);

  // Update user location marker live
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !userLocation) return;
    import('leaflet').then(L => {
      if (!routeLayerRef.current) return;
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 2px #3b82f6,0 2px 6px rgba(0,0,0,0.3); transition: transform 0.7s ease-in-out; transform: ${is3D ? 'rotateX(-50deg)' : 'none'};"></div>`,
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
          .bindTooltip('আপনি এখানে', { direction: 'top', className: 'leaflet-tooltip-bus' })
          .addTo(routeLayerRef.current);
      }
    });
  }, [userLocation, mapReady]);

  return (
    <div className="relative z-0 isolate w-full rounded-b-2xl overflow-hidden bg-slate-100 dark:bg-slate-800" style={{ height: 310, perspective: '1000px' }}>
      <div 
        className={`w-full h-full transition-all duration-700 ease-in-out ${is3D ? 'scale-[1.4] origin-bottom' : 'scale-100'}`} 
        style={is3D ? {
          transform: 'rotateX(45deg) translateY(-15%)',
        } : {}}
      >
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* 3D Fog Effect - more subtle */}
      {is3D && (
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white dark:from-slate-900 via-white/40 dark:via-slate-900/40 to-transparent z-[300] pointer-events-none" />
      )}

      {/* Route badge */}
      <div
        className="absolute top-3 left-3 z-[500] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-lg"
        style={{ background: routeColor }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80 inline-block" />
        {route.name}
      </div>

      {/* Road-snapped badge */}
      <div className="absolute top-3 right-[90px] z-[500]">
        {routeSnapped ? (
          <div className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
            🛣 Road route
          </div>
        ) : mapReady ? (
          <div className="bg-amber-400/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
            Straight line
          </div>
        ) : null}
      </div>

      {/* Stop count */}
      <div className="absolute top-3 right-3 z-[500] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-semibold text-gray-600 dark:text-gray-300 shadow border border-gray-100 dark:border-gray-700">
        {stops.length} stops
      </div>

      {/* Layer toggle panel */}
      <div className="absolute bottom-10 left-3 z-[500] flex flex-col items-start gap-1.5">
        {showLayers && (
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-600 shadow-xl p-3 w-44 mb-1 animate-in slide-in-from-bottom-2 fade-in duration-150">
            <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-gray-100 dark:border-slate-600">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Layers</span>
              <button
                onClick={() => setShowLayers(false)}
                className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                aria-label="Close layers panel"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
            <div className="space-y-1.5">
              {[
                { key: 'metro', label: 'Metro Rail', active: showMetro, set: setShowMetro, color: 'from-blue-500 to-indigo-600', Icon: Train },
                { key: 'railway', label: 'Railway', active: showRailway, set: setShowRailway, color: 'from-green-500 to-emerald-600', Icon: Train },
                { key: 'airport', label: 'Airport', active: showAirport, set: setShowAirport, color: 'from-orange-500 to-red-500', Icon: Plane },
              ].map(({ key, label, active, set, color, Icon }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${active ? `bg-gradient-to-br ${color} border-transparent shadow-sm` : 'border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700'}`}>
                    {active && <Icon className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" checked={active} onChange={e => set(e.target.checked)} className="hidden" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => setShowLayers(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border transition-all ${showLayers ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-600 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          Layers
        </button>

        <button
          onClick={() => setIs3D(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border transition-all ${is3D ? 'bg-blue-500 text-white border-blue-500 scale-105' : 'bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-600 backdrop-blur-sm'}`}
        >
          <span className="relative flex h-2 w-2">
            {is3D && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${is3D ? 'bg-white' : 'bg-blue-500'}`}></span>
          </span>
          3D View
        </button>
      </div>

      {/* Custom zoom buttons — positioned above Live Nav to avoid overlap */}
      {mapReady && (
        <div className="absolute bottom-[72px] right-3 z-[600] flex flex-col gap-1">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-7 h-7 bg-white/95 dark:bg-slate-800/95 border border-gray-200 dark:border-slate-600 rounded-lg shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 text-base font-bold leading-none transition-colors"
            aria-label="Zoom in"
          >+</button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-7 h-7 bg-white/95 dark:bg-slate-800/95 border border-gray-200 dark:border-slate-600 rounded-lg shadow-md flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 text-base font-bold leading-none transition-colors"
            aria-label="Zoom out"
          >−</button>
        </div>
      )}

      {/* Live navigate button */}
      {onOpenFullMap && (
        <button
          onClick={onOpenFullMap}
          className="absolute bottom-10 right-3 z-[500] flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white w-9 h-9 rounded-full shadow-lg transition-colors"
          aria-label="Open live navigation"
        >
          <Navigation className="w-4 h-4" />
        </button>
      )}

      {/* Loading state */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading map…</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusRouteMap;
