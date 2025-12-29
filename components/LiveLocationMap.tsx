import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Layers, Navigation, Map as MapIcon, Globe, Wifi, WifiOff, Lock } from 'lucide-react';
import { UserLocation, BusRoute, Station } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { liveBusService, LiveBus } from '../services/liveBusService';
import { Bus } from 'lucide-react';

// Fix for default marker icons using local assets for offline support
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
// ... (rest of imports/interfaces same)

// ...


const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
    isOpen,
    onClose,
    userLocation,
    selectedRoute,
}) => {
    const { t } = useLanguage();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const accuracyCircleRef = useRef<L.Circle | null>(null);
    const routeLayerRef = useRef<L.LayerGroup | null>(null);
    const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());

    const [activeLayer, setActiveLayer] = useState<string>('standard');
    const [showLayerMenu, setShowLayerMenu] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [liveBuses, setLiveBuses] = useState<LiveBus[]>([]);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => {
            setIsOffline(true);
            // Revert to standard layer immediately when going offline to prevent blank map
            setActiveLayer('standard');
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!isOpen || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            // Default center: Dhaka
            const dhakaCenter: [number, number] = [23.8103, 90.4125];
            const initialCenter = userLocation
                ? [userLocation.lat, userLocation.lng] as [number, number]
                : dhakaCenter;

            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
                minZoom: 10, // Prevent zooming out too far where tiles might be missing
                maxZoom: 18
            }).setView(initialCenter, 13);

            mapInstanceRef.current = map;

            // Add Zoom Control at bottom right
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Add Attribution
            L.control.attribution({ position: 'bottomright' }).addTo(map);

            // Fix: Invalidate size after modal animation to ensure correct rendering
            setTimeout(() => {
                map.invalidateSize();
            }, 300);
        }

        // Cleanup on unmount (only if complete unmount, but here we usually keep instance if modal toggles? 
        // No, better to remove if modal closes to save resources, or keep hidden)
        // For now, we'll keep it simple and just init. 
        // If we want to destroy: 
        // return () => { mapInstanceRef.current?.remove(); mapInstanceRef.current = null; };
        // But tearing down Leaflet can be buggy with React strict mode. Let's see.
        // Given the modal nature, destroying might be safer for memory.

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            // Clear marker references
            userMarkerRef.current = null;
            accuracyCircleRef.current = null;
        };
    }, [isOpen]);


    // Update Layers
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const map = mapInstanceRef.current;

        // Clear existing tile layers
        map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });

        let tileUrl = '';
        let attribution = '';
        let maxZoom = 19;

        // If offline, FORCE Standard layer as others are likely not cached
        const layerToUse = isOffline ? 'standard' : activeLayer;

        switch (layerToUse) {
            case 'satellite':
                // Google Hybrid
                tileUrl = 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}';
                attribution = '&copy; Google Maps';
                // Subdomains for Google
                (L.TileLayer.prototype as any).options.subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
                break;
            case 'terrain':
                // Google Terrain
                tileUrl = 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
                attribution = '&copy; Google Maps';
                (L.TileLayer.prototype as any).options.subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
                break;
            case 'traffic':
                // Google Traffic
                tileUrl = 'https://mt1.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}';
                attribution = '&copy; Google Maps';
                break;
            case 'dark':
                // CartoDB Dark Matter
                tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
                attribution = '&copy; OpenStreetMap &copy; CARTO';
                (L.TileLayer.prototype as any).options.subdomains = ['a', 'b', 'c', 'd'];
                break;
            case 'standard':
            default:
                // OSM
                tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                attribution = '&copy; OpenStreetMap contributors';
                (L.TileLayer.prototype as any).options.subdomains = ['a', 'b', 'c'];
                break;
        }

        L.tileLayer(tileUrl, {
            maxZoom,
            attribution,
            subdomains: (L.TileLayer.prototype as any).options.subdomains || ['a', 'b', 'c']
        }).addTo(map);

    }, [activeLayer, isOffline, isOpen]);

    const [hasCentered, setHasCentered] = useState(false);

    // Reset hasCentered when modal opens
    useEffect(() => {
        if (isOpen) {
            setHasCentered(false);
        }
    }, [isOpen]);

    // Update User Location
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        if (userLocation) {
            const latLng: [number, number] = [userLocation.lat, userLocation.lng];

            // Initial Center on User
            if (!hasCentered) {
                map.setView(latLng, 15);
                setHasCentered(true);
            }

            // User Marker Icon
            const userIcon = L.divIcon({
                className: 'bg-transparent border-none',
                html: `<div class="relative w-6 h-6 flex items-center justify-center">
                 <div class="absolute w-full h-full bg-blue-500/50 rounded-full animate-ping"></div>
                 <div class="relative w-4 h-4 bg-blue-600 border-[3px] border-white rounded-full shadow-lg"></div>
               </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng(latLng);
                userMarkerRef.current.setIcon(userIcon);
            } else {
                userMarkerRef.current = L.marker(latLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
            }

            // Accuracy Circle
            const accuracy = (userLocation as any).accuracy || 50; // meters

            if (accuracyCircleRef.current) {
                accuracyCircleRef.current.setLatLng(latLng);
                accuracyCircleRef.current.setRadius(accuracy);
            } else {
                accuracyCircleRef.current = L.circle(latLng, {
                    radius: accuracy,
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.15,
                    weight: 1
                }).addTo(map);
            }

        }
    }, [userLocation, isOpen, hasCentered]);


    // Handle Geolocation Watch
    useEffect(() => {
        if (!isOpen || !navigator.geolocation) return;

        // Offline Optimization: Accept older cached positions when offline
        const geoOptions: PositionOptions = {
            enableHighAccuracy: true,
            maximumAge: isOffline ? Infinity : 2000,
            timeout: 15000
        };

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                if (mapInstanceRef.current) {
                    const { latitude, longitude, accuracy } = pos.coords;
                    const latLng: [number, number] = [latitude, longitude];

                    if (userMarkerRef.current) userMarkerRef.current.setLatLng(latLng);
                    if (accuracyCircleRef.current) {
                        accuracyCircleRef.current.setLatLng(latLng);
                        accuracyCircleRef.current.setRadius(accuracy);
                    }
                }
            },
            (err) => console.error("Watch Position Error", err),
            geoOptions
        );

        return () => navigator.geolocation.clearWatch(watchId);

    }, [isOpen, isOffline]);

    // Subscribe to Live Buses
    useEffect(() => {
        if (!isOpen) return;
        return liveBusService.subscribe(setLiveBuses);
    }, [isOpen]);

    // Render Bus Markers
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;
        const markers = busMarkersRef.current;

        liveBuses.forEach(bus => {
            const latLng: [number, number] = [bus.lat, bus.lng];

            if (markers.has(bus.id)) {
                const marker = markers.get(bus.id)!;
                marker.setLatLng(latLng);
            } else {
                const busIcon = L.divIcon({
                    className: 'bg-transparent border-none',
                    html: `<div class="relative w-8 h-8 flex items-center justify-center -ml-1 -mt-1">
                             <div class="absolute w-full h-full bg-green-500/30 rounded-full animate-pulse"></div>
                             <div class="relative w-6 h-6 bg-white border-2 border-green-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-green-700" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
                             </div>
                           </div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                const marker = L.marker(latLng, { icon: busIcon })
                    .bindPopup(`
                        <div class="p-2 min-w-[120px]">
                            <h3 class="font-bold text-sm text-gray-800">${bus.busName}</h3>
                            <p class="text-xs text-gray-500">Speed: ${Math.round(bus.speed)} km/h</p>
                            <span class="inline-block mt-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-bold uppercase">Live</span>
                        </div>
                    `)
                    .addTo(map);

                markers.set(bus.id, marker);
            }
        });

        // Cleanup removed buses
        const currentIds = new Set(liveBuses.map(b => b.id));
        markers.forEach((marker, id) => {
            if (!currentIds.has(id)) {
                marker.remove();
                markers.delete(id);
            }
        });

    }, [liveBuses, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row">

                {/* Map Container - Works offline with cached tiles! */}
                <div ref={mapContainerRef} className="flex-1 w-full h-full relative z-0 bg-gray-200" />

                {/* Floating Controls */}
                <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 relative">
                                {isOffline ? <WifiOff className="w-5 h-5 text-gray-400" /> : <Wifi className="w-5 h-5" />}
                                {userLocation && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full animate-bounce"></div>}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{t('map.liveLocation')}</h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                    {userLocation ? t('map.gpsSignalActive') : t('map.acquiringSignal')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layer Switcher */}
                <div className="absolute top-4 right-16 z-[400]">
                    <button
                        onClick={() => setShowLayerMenu(!showLayerMenu)}
                        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition-all active:scale-95 relative"
                    >
                        <Layers className="w-6 h-6" />
                        {isOffline && (
                            <div className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900">
                                <Lock className="w-2.5 h-2.5" />
                            </div>
                        )}
                    </button>

                    {showLayerMenu && (
                        <div className="absolute top-14 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 w-44 flex flex-col gap-1 animate-in slide-in-from-top-2">
                            {isOffline && (
                                <div className="px-3 py-2 text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/30 rounded-lg mb-1 flex items-center gap-2">
                                    <WifiOff className="w-3 h-3" /> {t('map.offlineMode')}
                                </div>
                            )}

                            <button onClick={() => setActiveLayer('standard')} className={`text-xs font-bold px-3 py-2 rounded-lg text-left flex items-center gap-2 ${activeLayer === 'standard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                                <MapIcon className="w-4 h-4" /> {t('map.standard')}
                            </button>

                            <button
                                onClick={() => !isOffline && setActiveLayer('satellite')}
                                disabled={isOffline}
                                className={`text-xs font-bold px-3 py-2 rounded-lg text-left flex items-center gap-2 justify-between ${activeLayer === 'satellite' ? 'bg-blue-50 text-blue-600' : isOffline ? 'text-gray-400 cursor-not-allowed opacity-60' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> {t('map.satellite')}</div>
                                {isOffline && <Lock className="w-3 h-3" />}
                            </button>

                            <button
                                onClick={() => !isOffline && setActiveLayer('terrain')}
                                disabled={isOffline}
                                className={`text-xs font-bold px-3 py-2 rounded-lg text-left flex items-center gap-2 justify-between ${activeLayer === 'terrain' ? 'bg-blue-50 text-blue-600' : isOffline ? 'text-gray-400 cursor-not-allowed opacity-60' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                <div className="flex items-center gap-2"><MapIcon className="w-4 h-4" /> {t('map.terrain')}</div>
                                {isOffline && <Lock className="w-3 h-3" />}
                            </button>

                            <button
                                onClick={() => !isOffline && setActiveLayer('traffic')}
                                disabled={isOffline}
                                className={`text-xs font-bold px-3 py-2 rounded-lg text-left flex items-center gap-2 justify-between ${activeLayer === 'traffic' ? 'bg-blue-50 text-blue-600' : isOffline ? 'text-gray-400 cursor-not-allowed opacity-60' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                <div className="flex items-center gap-2"><Navigation className="w-4 h-4" /> {t('map.traffic')}</div>
                                {isOffline && <Lock className="w-3 h-3" />}
                            </button>

                            <button
                                onClick={() => !isOffline && setActiveLayer('dark')}
                                disabled={isOffline}
                                className={`text-xs font-bold px-3 py-2 rounded-lg text-left flex items-center gap-2 justify-between ${activeLayer === 'dark' ? 'bg-blue-50 text-blue-600' : isOffline ? 'text-gray-400 cursor-not-allowed opacity-60' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                <div className="flex items-center  gap-2"><MapIcon className="w-4 h-4" /> {t('map.darkMode')}</div>
                                {isOffline && <Lock className="w-3 h-3" />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-200 hover:text-red-500 transition-all active:scale-95"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Recenter Button */}
                <button
                    onClick={() => {
                        if (userLocation && mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.5 });
                        }
                    }}
                    className="absolute bottom-8 right-4 z-[400] bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center"
                >
                    <Navigation className="w-6 h-6" />
                </button>

            </div>
        </div>
    );
};

export default LiveLocationMap;
