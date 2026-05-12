import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    X, Layers, Navigation, Map as MapIcon, Globe, Wifi, WifiOff,
    Lock, ChevronUp, ChevronDown, Bus, MapPin, Zap, Target,
    Compass, AlertTriangle, CheckCircle2, Maximize
} from 'lucide-react';
import { UserLocation, BusRoute, Station } from '../types';
import { STATIONS, METRO_STATIONS, RAILWAY_STATIONS, AIRPORTS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { liveBusService, LiveBus } from '../services/liveBusService';


// Suppress Cesium default token warning

import StationDigitalTwin from './StationDigitalTwin';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
    iconUrl: '/images/leaflet/marker-icon.png',
    shadowUrl: '/images/leaflet/marker-shadow.png',
});

interface LiveLocationMapProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation: UserLocation | null;
    selectedRoute?: BusRoute | null;
    currentStation?: Station | null;
    tripPlan?: any;
}

// Deterministic color per route
const ROUTE_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'
];

function getRouteColor(routeId: string): string {
    const hash = routeId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return ROUTE_COLORS[hash % ROUTE_COLORS.length];
}

function getStation(id: string): Station | null {
    return (STATIONS[id] || METRO_STATIONS[id] || RAILWAY_STATIONS[id] || AIRPORTS[id]) as Station || null;
}

type MapLayer = 'standard' | 'satellite' | 'terrain' | 'traffic' | 'dark';

const LAYERS: { id: MapLayer; label: string; icon: React.ElementType; online?: boolean }[] = [
    { id: 'standard',  label: 'Standard',  icon: MapIcon },
    { id: 'dark',      label: 'Dark',      icon: MapIcon },
    { id: 'satellite', label: 'Satellite', icon: Globe, online: true },
    { id: 'terrain',   label: 'Terrain',   icon: MapIcon, online: true },
    { id: 'traffic',   label: 'Traffic',   icon: Zap, online: true },
];

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
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.code !== 'Ok' || !data.routes?.[0]) return null;
        
        return {
            path: (data.routes[0].geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]),
            waypoints: (data.waypoints || []).map((wp: any) => [wp.location[1], wp.location[0]])
        };
    } catch { return null; }
}

const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
    isOpen, onClose, userLocation, selectedRoute,
}) => {
    const { t } = useLanguage();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const accuracyCircleRef = useRef<L.Circle | null>(null);
    const routePolylineRef = useRef<L.Polyline | null>(null);
    const stopMarkersRef = useRef<L.LayerGroup | null>(null);
    const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
    const headingRef = useRef<number | null>(null);
    const hasCenteredRef = useRef(false);
    const followModeRef = useRef(true);

    const [activeLayer, setActiveLayer] = useState<MapLayer>('standard');
    const [showLayerMenu, setShowLayerMenu] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [liveBuses, setLiveBuses] = useState<LiveBus[]>([]);
    const [followMode, setFollowMode] = useState(true);
    const [gpsSpeed, setGpsSpeed] = useState<number | null>(null);
    const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
    const [sheetExpanded, setSheetExpanded] = useState(false);
    const [nearestStopIdx, setNearestStopIdx] = useState<number>(-1);
    const [showDigitalTwin, setShowDigitalTwin] = useState(false);
    const [twinStationName, setTwinStationName] = useState('');


    useEffect(() => {
        const handleOpenTwin = (e: any) => {
            setTwinStationName(e.detail.name);
            setShowDigitalTwin(true);
        };
        window.addEventListener('open-digital-twin', handleOpenTwin);
        return () => window.removeEventListener('open-digital-twin', handleOpenTwin);
    }, []);

    // ── Online/Offline ──────────────────────────────────────────────────────────
    useEffect(() => {
        const online = () => setIsOffline(false);
        const offline = () => { setIsOffline(true); setActiveLayer('standard'); };
        window.addEventListener('online', online);
        window.addEventListener('offline', offline);
        return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
    }, []);

    // ── Map init ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen || !mapContainerRef.current) return;

        const dhakaCenter: [number, number] = [23.8103, 90.4125];
        const center: [number, number] = userLocation
            ? [userLocation.lat, userLocation.lng]
            : dhakaCenter;

        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false,
            minZoom: 10,
            maxZoom: 19,
        }).setView(center, 14);

        mapRef.current = map;
        hasCenteredRef.current = false;
        stopMarkersRef.current = L.layerGroup().addTo(map);

        // Controls
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
        L.control.attribution({ position: 'bottomright', prefix: '© OSM' }).addTo(map);

        // Tap on map → turn off follow mode
        map.on('dragstart', () => {
            followModeRef.current = false;
            setFollowMode(false);
        });

        setTimeout(() => map.invalidateSize(), 300);

        return () => {
            map.remove();
            mapRef.current = null;
            userMarkerRef.current = null;
            accuracyCircleRef.current = null;
            routePolylineRef.current = null;
            stopMarkersRef.current = null;
            busMarkersRef.current.clear();
        };
    }, [isOpen]);

    // ── Tile layer ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        map.eachLayer(l => { if (l instanceof L.TileLayer) map.removeLayer(l); });

        let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        if (activeLayer === 'dark') url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        if (activeLayer === 'satellite') url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        if (activeLayer === 'terrain') url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';

        L.tileLayer(url, {
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }, [activeLayer, isOffline, isOpen]);




    // ── Route polyline + stop markers ───────────────────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        const stopGroup = stopMarkersRef.current;
        if (!map) return;

        // Clear previous route
        if (routePolylineRef.current) {
            map.removeLayer(routePolylineRef.current);
            routePolylineRef.current = null;
        }
        stopGroup?.clearLayers();

        if (!selectedRoute?.stops?.length) return;

        const color = getRouteColor(selectedRoute.id);
        const stopCoords: [number, number][] = [];

        selectedRoute.stops.forEach((stopId) => {
            const station = getStation(stopId);
            if (station) stopCoords.push([station.lat, station.lng]);
        });

        if (stopCoords.length < 2) return;

        // Try to fetch road-snapped route and markers
        fetchRoadRoute(stopCoords).then(snappedData => {
            if (!mapRef.current || !stopGroup) return;
            
            const linePath = snappedData?.path || stopCoords;
            const snappedWaypoints = snappedData?.waypoints || null;
            const isTrain = selectedRoute.type === 'Metro Rail' || selectedRoute.name.toLowerCase().includes('train');

            // Draw Markers (using snapped coordinates if available)
            selectedRoute.stops.forEach((stopId, idx) => {
                const station = getStation(stopId);
                if (!station) return;

                const rawLatLng: [number, number] = [station.lat, station.lng];
                const latLng: [number, number] = (snappedWaypoints && snappedWaypoints[idx]) ? snappedWaypoints[idx] : rawLatLng;

                const isFirst = idx === 0;
                const isLast = idx === selectedRoute.stops.length - 1;
                const isNearest = idx === nearestStopIdx;
                
                const size = isFirst || isLast ? 38 : 28;
                const stopIcon = L.divIcon({
                    className: 'bg-transparent border-none',
                    html: `<div style="position:relative; width:${size}px; height:${size}px; margin-left:-${size/2}px; margin-top:-${size/2}px;">
                        ${isNearest ? `<div class="absolute inset-0 bg-blue-500/30 rounded-full animate-pulse-ring"></div>` : ''}
                        <div style="
                            position:absolute; inset:0;
                            background:${isFirst || isLast ? color : (isNearest ? '#eff6ff' : '#fff')};
                            border:3px solid ${isNearest ? '#3b82f6' : color};
                            border-radius:50%;
                            display:flex;align-items:center;justify-content:center;
                            box-shadow:0 4px 12px rgba(0,0,0,0.15);
                            font-weight:800;
                            font-size:${isFirst || isLast ? 14 : 11}px;
                            color:${isFirst || isLast ? '#fff' : (isNearest ? '#3b82f6' : color)};
                            font-family:Inter, sans-serif;
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        " class="${isNearest ? 'animate-pulse-dot' : ''}">
                            ${isFirst ? 'A' : isLast ? 'B' : idx}
                        </div>
                    </div>`,

                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                });

                const marker = L.marker(latLng, { icon: stopIcon, zIndexOffset: isFirst || isLast ? 100 : (isNearest ? 200 : 0) })
                    .bindPopup(`
                        <div style="font-family:Inter, sans-serif;padding:6px;min-width:160px; border-radius:12px;">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                                <div style="width:8px; height:8px; border-radius:50%; background:${color}"></div>
                                <div style="font-weight:800;font-size:15px;color:#0f172a">${station.name}</div>
                            </div>
                            <div style="font-size:12px;color:#64748b;margin-left:16px">${station.bnName || ''}</div>
                            
                            <button 
                                onclick="window.dispatchEvent(new CustomEvent('open-digital-twin', {detail: {name: '${station.name}'}}))"
                                style="margin-top:10px; width:100%; padding:8px; background:linear-gradient(135deg, #10b981, #059669); color:white; border-radius:8px; font-weight:700; font-size:11px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                VIEW 3D SCAN
                            </button>

                            <div style="margin-top:8px;padding:6px 10px;background:${isNearest ? '#3b82f610' : (color + '10')};border-radius:8px;font-size:11px;font-weight:700;color:${isNearest ? '#3b82f6' : color}; display:flex; justify-content:between; align-items:center;">
                                <span>Stop ${idx + 1} of ${selectedRoute.stops.length}</span>
                                ${isNearest ? '<span style="background:#3b82f6; color:white; padding:1px 4px; border-radius:4px; font-size:9px; margin-left:auto;">NEAREST</span>' : ''}
                            </div>
                        </div>
                    `, { className: 'custom-popup', offset: [0, -10] });

                stopGroup.addLayer(marker);
            });

            // Draw Route Lines
            // 1. Shadow/Glow (Bottom)
            L.polyline(linePath, {
                color: color,
                weight: 12,
                opacity: 0.15,
                lineCap: 'round'
            }).addTo(map);

            // 2. Main Line (Middle)
            const mainPoly = L.polyline(linePath, {
                color: color,
                weight: isTrain ? 6 : 5,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round'
            }).addTo(map);

            // 3. Flow/Animated Pattern (Top)
            L.polyline(linePath, {
                color: '#ffffff',
                weight: 2,
                opacity: 0.6,
                dashArray: isTrain ? '8, 12' : '10, 20',
                lineCap: 'round',
                className: 'route-line-flow'
            }).addTo(map);

            routePolylineRef.current = mainPoly;
            
            if (!userLocation) {
                const bounds = L.latLngBounds(linePath);
                map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
            }
        });

        // Find nearest stop to user
        if (userLocation && selectedRoute.stops.length) {
            let minDist = Infinity;
            let nearestIdx = 0;
            selectedRoute.stops.forEach((stopId, idx) => {
                const s = getStation(stopId);
                if (!s) return;
                const dist = Math.hypot(s.lat - userLocation.lat, s.lng - userLocation.lng);
                if (dist < minDist) { minDist = dist; nearestIdx = idx; }
            });
            setNearestStopIdx(nearestIdx);
        }

    }, [selectedRoute, isOpen, nearestStopIdx]);

    // ── User location marker ────────────────────────────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !userLocation) return;

        const latLng: [number, number] = [userLocation.lat, userLocation.lng];
        const heading = headingRef.current;

        const userIcon = L.divIcon({
            className: 'bg-transparent border-none',
            html: `<div style="position:relative;width:28px;height:28px;margin-left:-14px;margin-top:-14px;">
                <div style="position:absolute;inset:0;background:#3b82f6;opacity:0.2;border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>
                <div style="position:absolute;inset:4px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow: 0 2px 8px rgba(59,130,246,0.5)"></div>
                ${heading !== null ? `<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%) rotate(${heading}deg);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:10px solid #3b82f6"></div>` : ''}
            </div>`,

            iconSize: [28, 28],
            iconAnchor: [14, 14],
        });

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(latLng);
            userMarkerRef.current.setIcon(userIcon);
        } else {
            userMarkerRef.current = L.marker(latLng, { icon: userIcon, zIndexOffset: 1000 })
                .bindPopup('<div style="font-family:sans-serif;font-weight:700;font-size:13px">📍 You are here</div>')
                .addTo(map);
        }

        const acc = (userLocation as any).accuracy ?? 50;
        setGpsAccuracy(Math.round(acc));

        if (accuracyCircleRef.current) {
            accuracyCircleRef.current.setLatLng(latLng).setRadius(acc);
        } else {
            accuracyCircleRef.current = L.circle(latLng, {
                radius: acc, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1,
            }).addTo(map);
        }

        if (followModeRef.current && !hasCenteredRef.current) {
            map.setView(latLng, 15);
            hasCenteredRef.current = true;
        } else if (followModeRef.current) {
            map.panTo(latLng, { animate: true, duration: 0.5 });
        }
    }, [userLocation]);

    // ── GPS watch ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen || !navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy, speed, heading } = pos.coords;
                const latLng: [number, number] = [latitude, longitude];
                setGpsAccuracy(Math.round(accuracy));
                if (speed !== null) setGpsSpeed(Math.round(speed * 3.6));
                if (heading !== null) headingRef.current = heading;

                if (userMarkerRef.current) userMarkerRef.current.setLatLng(latLng);
                if (accuracyCircleRef.current) {
                    accuracyCircleRef.current.setLatLng(latLng).setRadius(accuracy);
                }
                if (followModeRef.current && mapRef.current) {
                    mapRef.current.panTo(latLng, { animate: true, duration: 0.5 });
                }
            },
            () => { /* GPS watch unavailable */ },
            { enableHighAccuracy: true, maximumAge: isOffline ? 30000 : 2000, timeout: 15000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [isOpen, isOffline]);

    // ── Device orientation (compass heading) ────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: DeviceOrientationEvent) => {
            if (e.alpha !== null) headingRef.current = 360 - e.alpha;
        };
        window.addEventListener('deviceorientationabsolute', handler as EventListener, true);
        window.addEventListener('deviceorientation', handler as EventListener, true);
        return () => {
            window.removeEventListener('deviceorientationabsolute', handler as EventListener, true);
            window.removeEventListener('deviceorientation', handler as EventListener, true);
        };
    }, [isOpen]);

    // ── Live bus markers ────────────────────────────────────────────────────────
    useEffect(() => { if (!isOpen) return; return liveBusService.subscribe(setLiveBuses); }, [isOpen]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        const markers = busMarkersRef.current;

        liveBuses.forEach(bus => {
            const latLng: [number, number] = [bus.lat, bus.lng];
            if (markers.has(bus.id)) {
                markers.get(bus.id)!.setLatLng(latLng);
            } else {
                const busIcon = L.divIcon({
                    className: 'bg-transparent border-none',
                    html: `<div style="position:relative;width:36px;height:36px;margin:-18px 0 0 -18px;">
                        <div style="position:absolute;inset:0;background:#22c55e;opacity:0.2;border-radius:50%;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite"></div>
                        <div style="position:absolute;inset:4px;background:#fff;border:2.5px solid #16a34a;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow: 0 2px 8px rgba(0,0,0,0.2)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
                                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
                                <circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
                            </svg>
                        </div>
                    </div>`,

                    iconSize: [36, 36], iconAnchor: [18, 18],
                });
                markers.set(bus.id,
                    L.marker(latLng, { icon: busIcon })
                        .bindPopup(`<div style="font-family:sans-serif;padding:4px">
                            <div style="font-weight:700;font-size:13px">${bus.busName}</div>
                            <div style="font-size:11px;color:#64748b;margin-top:2px">Speed: ${Math.round(bus.speed)} km/h</div>
                            <span style="display:inline-block;margin-top:4px;padding:2px 6px;background:#dcfce7;color:#16a34a;font-size:10px;font-weight:700;border-radius:4px">LIVE</span>
                        </div>`)
                        .addTo(map)
                );
            }
        });

        const ids = new Set(liveBuses.map(b => b.id));
        markers.forEach((marker, id) => {
            if (!ids.has(id)) { marker.remove(); markers.delete(id); }
        });
    }, [liveBuses]);



    // ── Recenter ────────────────────────────────────────────────────────────────
    const recenter = useCallback(() => {
        if (!mapRef.current || !userLocation) return;
        mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.2 });
        followModeRef.current = true;
        setFollowMode(true);
    }, [userLocation]);

    const toggleFollowMode = useCallback(() => {
        const next = !followModeRef.current;
        followModeRef.current = next;
        setFollowMode(next);
        if (next) recenter();
    }, [recenter]);

    if (!isOpen) return null;

    const routeColor = selectedRoute ? getRouteColor(selectedRoute.id) : '#3b82f6';
    const routeStops = selectedRoute?.stops
        ?.map(id => STATIONS[id])
        .filter(Boolean) ?? [];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="relative w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-kj-panel rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-kj-line/20 dark:border-kj-line/50 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
            {/* Map wrapper */}
            <div className="absolute inset-0 z-0 bg-kj-chip-bg overflow-hidden">
                <div ref={mapContainerRef} className="w-full h-full" />
            </div>


            {/* ── Top status bar ── */}
            <div className="absolute top-0 left-0 right-0 z-[400] pointer-events-none px-3 pt-3 flex items-start justify-between gap-2">
                {/* GPS + route info */}
                <div className="pointer-events-auto bg-kj-panel/90 backdrop-blur-md rounded-2xl px-3 py-2.5 shadow-lg border border-white/30 dark:border-kj-line/50 flex items-center gap-2.5 max-w-[60vw]">
                    <div className="relative shrink-0">
                        {isOffline
                            ? <WifiOff className="w-4 h-4 text-red-500" />
                            : <Wifi className="w-4 h-4 text-kj-primary" />
                        }
                        {userLocation && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-kj-primary rounded-full border border-white animate-pulse" />
                        )}
                    </div>
                    <div className="min-w-0">
                        {selectedRoute ? (
                            <>
                                <p className="text-xs font-bold text-kj-text leading-tight truncate"
                                   style={{ color: routeColor }}>
                                    {selectedRoute.name}
                                </p>
                                <p className="text-[10px] text-kj-text-dim leading-tight">
                                    {routeStops.length} stops
                                    {gpsAccuracy ? ` · GPS ±${gpsAccuracy}m` : ''}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-xs font-bold text-kj-text leading-tight">
                                    {isOffline ? t('map.offlineMode') : t('map.liveLocation')}
                                </p>
                                <p className="text-[10px] text-kj-text-dim leading-tight">
                                    {userLocation
                                        ? `GPS ±${gpsAccuracy ?? '?'}m${gpsSpeed !== null && gpsSpeed > 0 ? ` · ${gpsSpeed} km/h` : ''}`
                                        : t('map.acquiringSignal')}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Right side: Layer + Close */}
                <div className="pointer-events-auto flex items-center gap-2">
                    {/* Layer switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLayerMenu(v => !v)}
                            className="bg-kj-panel/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white/30 dark:border-kj-line/50 text-kj-text-dim active:scale-95 transition-all relative"
                        >
                            <Layers className="w-5 h-5" />
                            {isOffline && (
                                <span className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-white">
                                    <Lock className="w-2 h-2 text-white" />
                                </span>
                            )}
                        </button>

                        {showLayerMenu && (
                            <div className="absolute top-12 right-0 bg-white/95 dark:bg-kj-panel/95 backdrop-blur-md rounded-2xl shadow-2xl border border-kj-line/50 dark:border-kj-line/50 p-2 w-40 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-150">
                                {isOffline && (
                                    <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-1">
                                        <WifiOff className="w-3 h-3" /> Offline Mode
                                    </div>
                                )}
                                {LAYERS.map(layer => (
                                    <button
                                        key={layer.id}
                                        onClick={() => { if (!isOffline || !layer.online) { setActiveLayer(layer.id); setShowLayerMenu(false); } }}
                                        disabled={isOffline && !!layer.online}
                                        className={`text-xs font-semibold px-3 py-2 rounded-xl text-left flex items-center gap-2 justify-between transition-all ${
                                            activeLayer === layer.id
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : isOffline && layer.online
                                                    ? 'text-kj-text-faint cursor-not-allowed'
                                                    : 'text-kj-text-dim hover:bg-kj-chip-bg'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <layer.icon className="w-3.5 h-3.5" />
                                            {layer.label}
                                        </span>
                                        {isOffline && layer.online && <Lock className="w-3 h-3" />}
                                        {activeLayer === layer.id && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>



                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="bg-kj-panel/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white/30 dark:border-kj-line/50 text-kj-text-dim hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 active:scale-95 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* ── Right side controls ── */}
            <div className="absolute right-3 bottom-[calc(var(--sheet-h,90px)+20px)] z-[400] flex flex-col gap-2 pointer-events-auto">
                {/* Follow mode */}
                <button
                    onClick={toggleFollowMode}
                    title={followMode ? 'Following you' : 'Click to follow'}
                    className={`p-2.5 rounded-xl shadow-lg border backdrop-blur-md active:scale-95 transition-all ${
                        followMode
                            ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/30'
                            : 'bg-kj-panel/90 border-white/30 dark:border-kj-line/50 text-kj-text-dim'
                    }`}
                >
                    <Navigation className={`w-5 h-5 ${followMode ? 'animate-pulse' : ''}`} />
                </button>

                {/* Fit Route */}
                {selectedRoute && routePolylineRef.current && (
                    <button
                        onClick={() => {
                            if (routePolylineRef.current) {
                                mapRef.current?.fitBounds(routePolylineRef.current.getBounds(), { padding: [60, 60] });
                                followModeRef.current = false;
                                setFollowMode(false);
                            }
                        }}
                        title="Fit Route"
                        className="bg-kj-panel/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white/30 dark:border-kj-line/50 text-kj-text-dim active:scale-95 transition-all"
                    >
                        <Maximize className="w-5 h-5" />
                    </button>
                )}

                {/* Recenter */}
                <button
                    onClick={recenter}
                    disabled={!userLocation}
                    className="bg-kj-panel/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white/30 dark:border-kj-line/50 text-kj-text-dim disabled:opacity-40 active:scale-95 transition-all"
                >
                    <Target className="w-5 h-5" />
                </button>

                {/* Live buses count */}
                {liveBuses.length > 0 && (
                    <div className="bg-kj-primary text-white px-2.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold">
                        <Bus className="w-3.5 h-3.5" />
                        {liveBuses.length}
                    </div>
                )}
            </div>

            {/* ── Bottom sheet — stops list ── */}
            {selectedRoute && routeStops.length > 0 && (
                <div
                    className="absolute left-0 right-0 bottom-0 z-[400] pointer-events-auto"
                    style={{ '--sheet-h': sheetExpanded ? '60vh' : '90px' } as React.CSSProperties}
                >
                    <div
                        className={`bg-white/95 dark:bg-kj-panel/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-white/30 dark:border-kj-line transition-all duration-300 ease-in-out overflow-hidden ${sheetExpanded ? 'h-[60vh]' : 'h-[90px]'}`}
                    >
                        {/* Handle + header */}
                        <button
                            onClick={() => setSheetExpanded(v => !v)}
                            className="w-full flex flex-col items-center pt-2 pb-3 px-4 cursor-pointer"
                        >
                            <div className="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full mb-2" />
                            <div className="w-full flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                                        style={{ background: routeColor }}
                                    >
                                        <Bus className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-kj-text leading-tight">{selectedRoute.name}</p>
                                        <p className="text-[10px] text-kj-text-dim">
                                            {routeStops[0]?.name} → {routeStops[routeStops.length - 1]?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-kj-text-dim font-medium">{routeStops.length} stops</span>
                                    {sheetExpanded ? <ChevronDown className="w-4 h-4 text-kj-text-faint" /> : <ChevronUp className="w-4 h-4 text-kj-text-faint" />}
                                </div>
                            </div>
                        </button>

                        {/* Stops list */}
                        {sheetExpanded && (
                            <div className="overflow-y-auto px-4 pb-8" style={{ maxHeight: 'calc(60vh - 80px)' }}>
                                {routeStops.map((stop, idx) => {
                                    const isFirst = idx === 0;
                                    const isLast = idx === routeStops.length - 1;
                                    const isNearest = idx === nearestStopIdx;

                                    return (
                                        <div
                                            key={stop.id}
                                            className={`flex items-center gap-3 py-2.5 cursor-pointer rounded-xl px-2 -mx-2 transition-colors ${isNearest ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg'}`}
                                            onClick={() => {
                                                mapRef.current?.flyTo([stop.lat, stop.lng], 16, { duration: 0.8 });
                                                followModeRef.current = false;
                                                setFollowMode(false);
                                            }}
                                        >
                                            {/* Line + dot */}
                                            <div className="flex flex-col items-center shrink-0" style={{ width: 28 }}>
                                                {!isFirst && <div className="w-0.5 h-3 -mb-1" style={{ background: routeColor }} />}
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shrink-0"
                                                    style={{
                                                        borderColor: routeColor,
                                                        background: isFirst || isLast ? routeColor : '#fff',
                                                        color: isFirst || isLast ? '#fff' : routeColor,
                                                    }}
                                                >
                                                    {isFirst ? 'A' : isLast ? 'B' : idx}
                                                </div>
                                                {!isLast && <div className="w-0.5 h-3 -mt-1" style={{ background: routeColor }} />}
                                            </div>

                                            {/* Name */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold leading-tight truncate ${isNearest ? 'text-blue-600 dark:text-blue-400' : 'text-kj-text'}`}>
                                                    {stop.name}
                                                    {isNearest && <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">Nearest</span>}
                                                </p>
                                                <p className="text-[10px] text-kj-text-faint">{stop.bnName}</p>
                                            </div>

                                            <MapPin className="w-3.5 h-3.5 text-kj-text-faint shrink-0" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── No route: recenter button at bottom ── */}
            {!selectedRoute && (
                <button
                    onClick={recenter}
                    disabled={!userLocation}
                    className="absolute bottom-6 right-4 z-[400] bg-blue-600 text-white p-3.5 rounded-full shadow-xl shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center"
                >
                    <Navigation className="w-6 h-6" />
                </button>
            )}

            {/* Click-away to close layer menu */}
            {showLayerMenu && (
                <div className="absolute inset-0 z-[399]" onClick={() => setShowLayerMenu(false)} />
            )}

            <style>{`
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                .leaflet-control-scale { margin-bottom: 24px !important; }
                .leaflet-control-zoom { margin-bottom: 24px !important; margin-right: 12px !important; }
                .leaflet-bottom.leaflet-right { bottom: 24px !important; }
            `}</style>
            </div>
            {/* Digital Twin Viewer */}
            <StationDigitalTwin 
                isOpen={showDigitalTwin}
                onClose={() => setShowDigitalTwin(false)}
                stationName={twinStationName}
            />
        </div>
    );
};

export default LiveLocationMap;
