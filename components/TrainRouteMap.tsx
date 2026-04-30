import React, { useEffect, useRef, useState } from 'react';
import { BDTrainRoute, TRAIN_STATIONS } from '../data/bangladeshTrainData';
import { UserLocation } from '../types';
import { Layers, Train, X } from 'lucide-react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

interface TrainRouteMapProps {
  route: BDTrainRoute;
  userLocation?: UserLocation | null;
  highlightFromId?: string;
  highlightToId?: string;
  language?: string;
  currentStopId?: string;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

const TrainRouteMap: React.FC<TrainRouteMapProps> = ({
  route,
  userLocation,
  highlightFromId,
  highlightToId,
  language,
  currentStopId,
}) => {
  const bn = language === 'bn';
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const overlayLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const userToStationLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [routeSnapped, setRouteSnapped] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const cesiumViewerRef = useRef<Cesium.Viewer | null>(null);

  const drawableStops = route.stops.filter(id => !!TRAIN_STATIONS[id]);
  const stopCoords: [number, number][] = drawableStops.map(id => [TRAIN_STATIONS[id].lat, TRAIN_STATIONS[id].lng]);

  // ── Effect 1: Map init + stop markers (only re-runs when route changes) ──────
  useEffect(() => {
    if (!mapRef.current || stopCoords.length === 0) return;
    let cancelled = false;

    import('leaflet').then(async (L) => {
      if (cancelled) return;
      leafletRef.current = L;

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
          // tap: false suppresses iOS double-tap zoom (cast needed — not in @types/leaflet yet)
          ...({ tap: false } as any),
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(mapInstanceRef.current);
        L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
        mapInstanceRef.current.fitBounds(bounds.pad(0.12));
        // Critical for mobile: call after the container has laid out
        setTimeout(() => {
          if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
        }, 100);
      } else {
        const bounds = L.latLngBounds(stopCoords.map(([lat, lng]) => [lat, lng]));
        mapInstanceRef.current.fitBounds(bounds.pad(0.12));
        mapInstanceRef.current.invalidateSize();
      }

      if (cancelled) return;

      // ── Draw route polyline ──────────────────────────────────────────────────
      if (routeLayerRef.current) { mapInstanceRef.current.removeLayer(routeLayerRef.current); }

      setRouteSnapped(false);
      const snappedData = await fetchRoadRoute(stopCoords);
      if (cancelled) return;

      routeLayerRef.current = L.layerGroup();
      const linePath = snappedData?.path || stopCoords;
      const snappedWaypoints = snappedData?.waypoints || null;

      // 1. Glow Layer
      L.polyline(linePath, { 
        color: route.color, 
        weight: 12, 
        opacity: 0.15, 
        lineCap: 'round', 
        lineJoin: 'round' 
      }).addTo(routeLayerRef.current);

      // 2. Main Line
      L.polyline(linePath, { 
        color: route.color, 
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

      routeLayerRef.current.addTo(mapInstanceRef.current);

      // ── Draw stop markers ────────────────────────────────────────────────────
      if (overlayLayerRef.current) { mapInstanceRef.current.removeLayer(overlayLayerRef.current); }
      overlayLayerRef.current = L.layerGroup();

      drawableStops.forEach((id, idx) => {
        const station = TRAIN_STATIONS[id];
        const rawLatLng: [number, number] = [station.lat, station.lng];
        const latLng: [number, number] = (snappedWaypoints && snappedWaypoints[idx]) ? snappedWaypoints[idx] : rawLatLng;
        
        const isFirst = idx === 0;
        const isLast = idx === drawableStops.length - 1;
        const isCurrent = id === currentStopId;

        let html: string;
        let w: number, h: number, ax: number, ay: number;

        if (isCurrent) {
          // "Nearest Station" pulsing indicator
          const nearestLabel = bn ? 'নিকটস্থ স্টেশন' : 'Nearest Station';
          w = 110; h = 42; ax = 55; ay = 38;
          html = `
            <div class="relative flex flex-col items-center gap-1" style="transition: transform 0.7s ease-in-out; transform: ${is3D ? 'rotateX(-50deg)' : 'none'};">
              <div class="absolute w-[30px] h-[30px] bg-amber-400/30 rounded-full animate-ping top-[24px]"></div>
              <div style="width:110px;padding:3px 6px;border-radius:12px;background:#f59e0b;border:2px solid #d97706;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;box-shadow:${is3D ? '0 10px 20px rgba(0,0,0,0.4)' : '0 2px 8px rgba(245,158,11,0.5)'};font-family:sans-serif;box-sizing:border-box;gap:4px;position:relative;z-index:2;">
                <span style="width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;animation:pulse 1s infinite;"></span>${nearestLabel}
              </div>
              <div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);box-sizing:border-box;position:relative;z-index:2;"></div>
            </div>`;
        } else if (isFirst) {
          // Green pill — Start (matches BusRouteMap)
          const startLabel = bn ? 'শুরু' : 'Start';
          w = 52; h = 34; ax = 26; ay = 30;
          html = `
            <div class="relative flex flex-col items-center gap-1" style="transition: transform 0.7s ease-in-out; transform: ${is3D ? 'rotateX(-50deg)' : 'none'};">
              <div class="absolute w-[24px] h-[24px] bg-emerald-400/30 rounded-full animate-ping top-[18px]"></div>
              <div style="width:52px;height:24px;border-radius:12px;background:#10b981;border:2px solid #059669;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;box-shadow:${is3D ? '0 10px 20px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.35)'};font-family:sans-serif;box-sizing:border-box;position:relative;z-index:2;">${startLabel}</div>
              <div style="width:8px;height:8px;border-radius:50%;background:#10b981;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);box-sizing:border-box;position:relative;z-index:2;"></div>
            </div>`;
        } else if (isLast) {
          // Dark pill — Destination (matches BusRouteMap)
          const destLabel = bn ? 'গন্তব্য' : 'Destination';
          w = 76; h = 34; ax = 38; ay = 30;
          html = `
            <div class="relative flex flex-col items-center gap-1" style="transition: transform 0.7s ease-in-out; transform: ${is3D ? 'rotateX(-50deg)' : 'none'};">
              <div class="absolute w-[24px] h-[24px] bg-slate-400/30 rounded-full animate-ping top-[18px]"></div>
              <div style="width:76px;height:24px;border-radius:12px;background:#1e293b;border:2px solid #0f172a;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;box-shadow:${is3D ? '0 10px 20px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.35)'};font-family:sans-serif;box-sizing:border-box;position:relative;z-index:2;">${destLabel}</div>
              <div style="width:8px;height:8px;border-radius:50%;background:#1e293b;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);box-sizing:border-box;position:relative;z-index:2;"></div>
            </div>`;
        } else {
          // Intermediate: small dot + name label floating below
          // iconSize matches ONLY the dot so anchor is stable on mobile
          const dot = 10;
          w = dot; h = dot; ax = dot / 2; ay = dot / 2;
        const stLabel = bn ? station.bnName : station.name;
          html = `<div style="position:relative;width:${dot}px;height:${dot}px; transition: transform 0.7s ease-in-out; transform: ${is3D ? 'rotateX(-50deg)' : 'none'};">` +
            `<div style="width:${dot}px;height:${dot}px;border-radius:50%;background:#fff;border:2px solid ${route.color};box-shadow:${is3D ? '0 6px 12px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.25)'};box-sizing:border-box;"></div>` +
            `<div style="position:absolute;top:${dot + 2}px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.95);color:#1e293b;padding:1px 5px;border-radius:4px;font-size:9px;font-weight:600;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2);line-height:1.5;pointer-events:none;">${stLabel}</div>` +
            `</div>`;
      }

      const icon = L.divIcon({
        className: '',
        iconSize: [w, h],
        iconAnchor: [ax, ay],
        html,
      });

      const marker = L.marker(latLng, {
        icon,
        zIndexOffset: isCurrent ? 2000 : (isFirst || isLast ? 1000 : 0),
      });
      marker.bindPopup(`<b>${station.name}</b><br/><span style="font-size:11px;color:#64748b">${station.bnName}</span>`);
      marker.addTo(overlayLayerRef.current);
      });

      overlayLayerRef.current.addTo(mapInstanceRef.current);
      setMapReady(true);
    });

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 700);
    }
  }, [is3D]);

  // Cesium 3D Globe Logic
  useEffect(() => {
    if (!is3D || !cesiumContainerRef.current) {
      if (cesiumViewerRef.current) {
        cesiumViewerRef.current.destroy();
        cesiumViewerRef.current = null;
      }
      return;
    }

    const initCesium = async () => {
      if (!cesiumContainerRef.current) return;
      
      try {
        const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
          terrain: Cesium.Terrain.fromWorldTerrain(),
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          fullscreenButton: false,
        });

        // Add 3D Buildings
        const buildingTileset = await Cesium.createOsmBuildingsAsync();
        viewer.scene.primitives.add(buildingTileset);

        // Draw route in 3D
        const positions = stopCoords.map(c => Cesium.Cartesian3.fromDegrees(c[1], c[0]));
        viewer.entities.add({
          polyline: {
            positions,
            width: 5,
            material: Cesium.Color.fromCssColorString(route.color || '#3b82f6'),
            clampToGround: true
          }
        });

        // Draw stops
        drawableStops.forEach((id, idx) => {
          const station = TRAIN_STATIONS[id];
          const pos = Cesium.Cartesian3.fromDegrees(station.lng, station.lat);
          const isStart = idx === 0;
          const isEnd = idx === drawableStops.length - 1;
          
          viewer.entities.add({
            position: pos,
            point: {
              pixelSize: isStart || isEnd ? 12 : 8,
              color: isStart ? Cesium.Color.fromCssColorString('#10b981') : (isEnd ? Cesium.Color.fromCssColorString('#1e293b') : Cesium.Color.WHITE),
              outlineColor: Cesium.Color.fromCssColorString(route.color || '#3b82f6'),
              outlineWidth: 2,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
              text: bn ? station.bnName : station.name,
              font: 'bold 12px sans-serif',
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -15),
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('rgba(0,0,0,0.5)'),
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
          });
        });

        viewer.zoomTo(viewer.entities);
        cesiumViewerRef.current = viewer;
      } catch (e) {
        console.error('Cesium init error:', e);
      }
    };

    initCesium();

    return () => {
      if (cesiumViewerRef.current) {
        cesiumViewerRef.current.destroy();
        cesiumViewerRef.current = null;
      }
    };
  }, [is3D, route.id, bn]);

  return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.id, currentStopId, is3D]);

  // ── Effect 2: Highlight segment (fare calc) ──────────────────────────────────
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const routeLayer = routeLayerRef.current;
    if (!L || !map || !routeLayer) return;
    if (!highlightFromId || !highlightToId) return;

    const si = drawableStops.indexOf(highlightFromId);
    const ei = drawableStops.indexOf(highlightToId);
    if (si === -1 || ei === -1) return;

    const [startIdx, endIdx] = si < ei ? [si, ei] : [ei, si];
    const hlCoords = stopCoords.slice(startIdx, endIdx + 1);
    if (hlCoords.length < 2) return;

    let cancelled = false;
    fetchRoadRoute(hlCoords).then(hlRoad => {
      if (cancelled || !mapInstanceRef.current) return;
      const seg = hlRoad || hlCoords;
      // Remove any previous highlight (stored as last layer in routeLayer)
      const layers: any[] = [];
      routeLayer.eachLayer((l: any) => layers.push(l));
      if (layers.length > 1) routeLayer.removeLayer(layers[layers.length - 1]);
      L.polyline(seg, { color: route.color, weight: 6, opacity: 1 }).addTo(routeLayer);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightFromId, highlightToId, route.id]);

  // ── Effect 3: User location marker (GPS updates — no re-draw of stops) ───────
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    if (userMarkerRef.current) { map.removeLayer(userMarkerRef.current); userMarkerRef.current = null; }
    if (userToStationLayerRef.current) { map.removeLayer(userToStationLayerRef.current); userToStationLayerRef.current = null; }

    if (userLocation) {
      const hereLabel = bn ? 'আপনি এখানে' : 'You are here';
      const userIcon = L.divIcon({
        className: '',
        iconSize: [90, 42],
        iconAnchor: [45, 38],
        html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px; transition: transform 0.7s ease-in-out; transform: ${is3D ? 'rotateX(-50deg)' : 'none'};">` +
          `<div style="width:90px;padding:3px 6px;border-radius:12px;background:#3b82f6;border:2px solid #2563eb;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;box-shadow:${is3D ? '0 10px 20px rgba(0,0,0,0.4)' : '0 2px 8px rgba(59,130,246,0.5)'};font-family:sans-serif;box-sizing:border-box;gap:4px;">` +
          `<span style="width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></span>${hereLabel}</div>` +
          `<div style="width:8px;height:8px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);box-sizing:border-box;"></div>` +
          `</div>`
      });
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { 
        icon: userIcon,
        zIndexOffset: 3000
      })
        .bindPopup('<b>আপনার অবস্থান</b><br/>Your Location')
        .addTo(map);

      // Draw red dashed line to nearest station
      if (currentStopId && TRAIN_STATIONS[currentStopId]) {
        const st = TRAIN_STATIONS[currentStopId];
        userToStationLayerRef.current = L.polyline(
          [[userLocation.lat, userLocation.lng], [st.lat, st.lng]],
          { color: '#ef4444', weight: 2, dashArray: '5, 5', opacity: 1 }
        ).addTo(map);
      }
    }
  }, [userLocation, currentStopId, is3D]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      routeLayerRef.current = null;
      overlayLayerRef.current = null;
      userMarkerRef.current = null;
      userToStationLayerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-slate-800" style={{ touchAction: 'none' }}>
      {/* 2D Leaflet Map */}
      <div 
        className={`w-full h-full transition-opacity duration-500 ${is3D ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
      >
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* 3D Cesium Globe */}
      {is3D && (
        <div 
          ref={cesiumContainerRef} 
          className="absolute inset-0 z-[10] animate-in fade-in duration-700" 
        />
      )}

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-white/70">{bn ? 'ম্যাপ লোড হচ্ছে...' : 'Loading map...'}</p>
          </div>
        </div>
      )}

      {routeSnapped && (
        <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-800/90 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full shadow flex items-center gap-1 z-[500]">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
          {bn ? 'রোড-স্ন্যাপড' : 'Road-Snapped'}
        </div>
      )}

      <div className="absolute top-2 right-2 z-[500] flex flex-col gap-2">
        <button
          onClick={() => setShowLayers(v => !v)}
          className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <Layers className="w-4 h-4" />
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
      
      {showLayers && (
        <div className="absolute top-20 right-2 z-[500] bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 w-40 text-xs font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2 mb-1">
            <Train className="w-3.5 h-3.5 text-blue-500" />
            <span>{bn ? 'রেল রুট ম্যাপ' : 'Rail Route Map'}</span>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-[10px] leading-tight mt-1">
            {bn ? `এই রুটে ${drawableStops.length}টি স্টেশন` : `Showing ${drawableStops.length} stations on this route`}
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
