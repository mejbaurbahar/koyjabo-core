import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Layers, Navigation, Map as MapIcon, Globe, Wifi, WifiOff, Lock, Box } from 'lucide-react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Suppress Cesium default token warning
Cesium.Ion.defaultAccessToken = '';
import { useLanguage } from '../contexts/LanguageContext';

// Interfaces
interface UserLocation {
    lat: number;
    lng: number;
    accuracy?: number;
}

interface LiveLocationMapProps {
    isOpen: boolean;
    onClose: () => void;
}

// Fix for default marker icons using local assets for offline support/production
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
    iconUrl: '/images/leaflet/marker-icon.png',
    shadowUrl: '/images/leaflet/marker-shadow.png',
});

const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
    isOpen,
    onClose,
}) => {
    const { t } = useLanguage();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const accuracyCircleRef = useRef<L.Circle | null>(null);

    const [activeLayer, setActiveLayer] = useState<string>('standard');
    const [showLayerMenu, setShowLayerMenu] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [hasCentered, setHasCentered] = useState(false);
    const [is3D, setIs3D] = useState(false);
    const cesiumContainerRef = useRef<HTMLDivElement>(null);
    const cesiumViewerRef = useRef<Cesium.Viewer | null>(null);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => {
            setIsOffline(true);
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

            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
                minZoom: 6,
                maxZoom: 18
            }).setView(dhakaCenter, 13);

            mapInstanceRef.current = map;

            L.control.zoom({ position: 'bottomright' }).addTo(map);
            L.control.attribution({ position: 'bottomright' }).addTo(map);

            setTimeout(() => {
                map.invalidateSize();
            }, 300);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            userMarkerRef.current = null;
            accuracyCircleRef.current = null;
        };
    }, [isOpen]);

    // Update Layers
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });

        let tileUrl = '';
        let attribution = '';
        const layerToUse = isOffline ? 'standard' : activeLayer;

        switch (layerToUse) {
            case 'satellite':
                tileUrl = 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}';
                attribution = '&copy; Google Maps';
                (L.TileLayer.prototype as any).options.subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
                break;
            case 'terrain':
                tileUrl = 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
                attribution = '&copy; Google Maps';
                (L.TileLayer.prototype as any).options.subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
                break;
            case 'traffic':
                tileUrl = 'https://mt1.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}';
                attribution = '&copy; Google Maps';
                break;
            case 'dark':
                tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
                attribution = '&copy; OpenStreetMap &copy; CARTO';
                (L.TileLayer.prototype as any).options.subdomains = ['a', 'b', 'c', 'd'];
                break;
            case 'standard':
            default:
                tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                attribution = '&copy; OpenStreetMap contributors';
                (L.TileLayer.prototype as any).options.subdomains = ['a', 'b', 'c'];
                break;
        }

        L.tileLayer(tileUrl, {
            maxZoom: 19,
            attribution,
            subdomains: (L.TileLayer.prototype as any).options.subdomains || ['a', 'b', 'c']
        }).addTo(map);

    }, [activeLayer, isOffline, isOpen]);

    // Cesium 3D Globe Logic
    useEffect(() => {
        if (!isOpen || !is3D || isOffline || !cesiumContainerRef.current) {
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
                    skyAtmosphere: new Cesium.SkyAtmosphere(),
                    msaaSamples: 4,
                });

                // High-end visuals
                viewer.scene.fog.enabled = true;
                viewer.scene.fog.density = 0.0001;
                viewer.scene.light = new Cesium.DirectionalLight({
                    direction: new Cesium.Cartesian3(0.5, -0.2, -1.0),
                    intensity: 2.0
                });

                // Add 3D Buildings
                const buildingTileset = await Cesium.createOsmBuildingsAsync({
                    defaultColor: Cesium.Color.fromCssColorString('#f1f5f9'),
                });
                viewer.scene.primitives.add(buildingTileset);
                
                cesiumViewerRef.current = viewer;

                // Initial location sync
                if (userLocation) {
                    const pos = Cesium.Cartesian3.fromDegrees(userLocation.lng, userLocation.lat);
                    viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(userLocation.lng, userLocation.lat, 1000),
                        orientation: {
                            pitch: Cesium.Math.toRadians(-45)
                        }
                    });

                    viewer.entities.add({
                        position: pos,
                        point: { pixelSize: 15, color: Cesium.Color.BLUE, outlineColor: Cesium.Color.WHITE, outlineWidth: 3, disableDepthTestDistance: Number.POSITIVE_INFINITY }
                    });
                }
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
    }, [isOpen, is3D, isOffline]);

    useEffect(() => {
        if (cesiumViewerRef.current && userLocation) {
            const viewer = cesiumViewerRef.current;
            const pos = Cesium.Cartesian3.fromDegrees(userLocation.lng, userLocation.lat);
            viewer.entities.removeAll();
            viewer.entities.add({
                position: pos,
                point: { pixelSize: 15, color: Cesium.Color.BLUE, outlineColor: Cesium.Color.WHITE, outlineWidth: 3, disableDepthTestDistance: Number.POSITIVE_INFINITY }
            });
        }
    }, [userLocation]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row">

                {/* Map Container */}
                <div className="flex-1 w-full h-full relative z-0 bg-gray-200">
                    {/* 2D Leaflet Map */}
                    <div 
                        className={`absolute inset-0 transition-opacity duration-500 ${is3D ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
                    >
                        <div ref={mapContainerRef} className="w-full h-full" />
                    </div>

                    {/* 3D Cesium Globe */}
                    {is3D && (
                        <div 
                            ref={cesiumContainerRef} 
                            className="absolute inset-0 z-[10] animate-in fade-in duration-700" 
                        />
                    )}
                </div>

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
                                <div className="flex items-center gap-2"><MapIcon className="w-4 h-4" /> {t('map.darkMode')}</div>
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

                {/* Recenter / 3D Button Group */}
                <div className="absolute bottom-8 right-4 z-[400] flex flex-col gap-3">
                    <button
                        onClick={() => setIs3D(!is3D)}
                        className={`p-3 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center ${is3D ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-blue-600'}`}
                    >
                        <Box className="w-6 h-6" />
                    </button>
                    
                    <button
                        onClick={() => {
                            if (userLocation) {
                                if (is3D && cesiumViewerRef.current) {
                                    cesiumViewerRef.current.camera.flyTo({
                                        destination: Cesium.Cartesian3.fromDegrees(userLocation.lng, userLocation.lat, 1000)
                                    });
                                } else if (mapInstanceRef.current) {
                                    mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.5 });
                                }
                            }
                        }}
                        className="bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center"
                    >
                        <Navigation className="w-6 h-6" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LiveLocationMap;
