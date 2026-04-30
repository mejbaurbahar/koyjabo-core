import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteStep, TransportMode } from '../types';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Suppress Cesium default token warning
Cesium.Ion.defaultAccessToken = '';

interface RouteMapProps {
  steps: RouteStep[];
  userLocation?: { lat: number; lng: number } | null;
}

// Major Bangladesh cities coordinates (fallback if coordinates not provided)
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Dhaka': { lat: 23.7500, lng: 90.4000 },
  'Chittagong': { lat: 22.3337, lng: 91.8246 },
  'Sylhet': { lat: 24.8949, lng: 91.8687 },
  'Khulna': { lat: 22.8150, lng: 89.5500 },
  'Rajshahi': { lat: 24.3740, lng: 88.6011 },
  'Barisal': { lat: 22.7010, lng: 90.3535 },
  'Rangpur': { lat: 25.7439, lng: 89.2752 },
  'Mymensingh': { lat: 24.7471, lng: 90.4203 },
  'Comilla': { lat: 23.4607, lng: 91.1809 },
  'Cox\'s Bazar': { lat: 21.4272, lng: 92.0058 },
  'Jessore': { lat: 23.1697, lng: 89.2132 },
  'Bogra': { lat: 24.8465, lng: 89.3776 },
  'Dinajpur': { lat: 25.6279, lng: 88.6332 },
  'Kushtia': { lat: 23.9011, lng: 89.1099 },
  'Tangail': { lat: 24.2513, lng: 89.9167 },
  'Narayanganj': { lat: 23.6238, lng: 90.5000 },
  'Gazipur': { lat: 24.0022, lng: 90.4264 },
  'Jamalpur': { lat: 25.0831, lng: 89.9371 },
  'Benapole': { lat: 23.0431, lng: 88.9028 },
  'Feni': { lat: 23.0155, lng: 91.4075 },
  'Noakhali': { lat: 22.8696, lng: 91.0995 },
  'Kuakata': { lat: 21.8167, lng: 90.1167 },
  'Bandarban': { lat: 22.1953, lng: 92.2183 },
  'Rangamati': { lat: 22.6533, lng: 92.1751 },
  'Sreemangal': { lat: 24.3065, lng: 91.7296 },
};

// Get coordinates from city name
const getCityCoordinates = (cityName: string): { lat: number; lng: number } | null => {
  if (!cityName) return null;

  // Try exact match first
  if (CITY_COORDINATES[cityName]) {
    return CITY_COORDINATES[cityName];
  }

  // Try partial match (case insensitive)
  const normalizedName = cityName.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (city.toLowerCase().includes(normalizedName) || normalizedName.includes(city.toLowerCase())) {
      return coords;
    }
  }

  return null;
};

// Get color based on transport mode
const getTransportColor = (mode: TransportMode): string => {
  switch (mode) {
    case TransportMode.BUS:
      return '#10b981'; // Emerald green
    case TransportMode.TRAIN:
      return '#f97316'; // Orange
    case TransportMode.AIR:
      return '#3b82f6'; // Blue
    case TransportMode.FERRY:
      return '#06b6d4'; // Cyan
    case TransportMode.LOCAL_BUS:
      return '#14b8a6'; // Teal
    case TransportMode.METRO_RAIL:
      return '#ef4444'; // Red
    case TransportMode.CNG:
      return '#84cc16'; // Lime
    default:
      return '#6b7280'; // Gray
  }
};

// Get transport mode display name
const getTransportName = (mode: TransportMode): string => {
  switch (mode) {
    case TransportMode.BUS: return 'Bus';
    case TransportMode.TRAIN: return 'Train';
    case TransportMode.AIR: return 'Flight';
    case TransportMode.FERRY: return 'Ferry';
    case TransportMode.LOCAL_BUS: return 'Local Bus';
    case TransportMode.METRO_RAIL: return 'Metro';
    case TransportMode.CNG: return 'CNG/Drive';
    default: return 'Route';
  }
};

export const RouteMap: React.FC<RouteMapProps> = ({ steps, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [is3D, setIs3D] = React.useState(false);
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const cesiumViewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 1. Initialize Map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([23.8103, 90.4125], 7); // Default to Dhaka

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // 2. Clear existing layers (except tiles)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // 3. Define Icons
    const startIcon = L.divIcon({
      html: '<div class="flex items-center justify-center w-full h-full"><div class="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-lg"></div></div>',
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const endIcon = L.divIcon({
      html: '<div class="flex items-center justify-center w-full h-full"><div class="w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-lg"></div></div>',
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const midIcon = L.divIcon({
      html: '<div class="flex items-center justify-center w-full h-full"><div class="w-2 h-2 bg-gray-400 border border-white rounded-full shadow"></div></div>',
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    // 4. Process steps and build route
    const allLatLngs: L.LatLngExpression[] = [];
    const segments: Array<{ latLngs: L.LatLngExpression[]; color: string; mode: TransportMode }> = [];

    steps.forEach((step, index) => {
      // Get coordinates (from step or fallback to city database)
      let startCoords = step.startCoordinates || getCityCoordinates(step.from);
      let endCoords = step.endCoordinates || getCityCoordinates(step.to);

      if (startCoords && endCoords) {
        const start = [startCoords.lat, startCoords.lng] as L.LatLngExpression;
        const end = [endCoords.lat, endCoords.lng] as L.LatLngExpression;

        // Add to all coordinates for bounds
        allLatLngs.push(start);
        allLatLngs.push(end);

        // Store segment with its color
        segments.push({
          latLngs: [start, end],
          color: getTransportColor(step.mode as TransportMode),
          mode: step.mode as TransportMode
        });

        // Add marker for start of first step
        if (index === 0) {
          L.marker(start, { icon: startIcon })
            .addTo(map)
            .bindTooltip(step.from, {
              permanent: true,
              direction: 'top',
              className: 'font-bold text-emerald-700 bg-white border-2 border-emerald-200 shadow-lg px-3 py-1 rounded-lg text-sm',
              offset: [0, -15]
            });
        } else {
          // Intermediate stops
          L.marker(start, { icon: midIcon })
            .addTo(map)
            .bindTooltip(step.from, {
              direction: 'auto',
              className: 'text-gray-700 bg-white border border-gray-300 px-2 py-0.5 rounded text-xs font-medium shadow'
            });
        }

        // Add marker for end of last step
        if (index === steps.length - 1) {
          L.marker(end, { icon: endIcon })
            .addTo(map)
            .bindTooltip(step.to, {
              permanent: true,
              direction: 'bottom',
              className: 'font-bold text-red-700 bg-white border-2 border-red-200 shadow-lg px-3 py-1 rounded-lg text-sm',
              offset: [0, 15]
            });
        }
      }
    });

    // 5. Draw route segments with different colors
    segments.forEach((segment, idx) => {
      const polyline = L.polyline(segment.latLngs, {
        color: segment.color,
        weight: 5,
        opacity: 0.85,
        smoothFactor: 1
      }).addTo(map);

      // Add directional arrow in the middle of the line
      const midpoint = polyline.getCenter();
      L.circleMarker([midpoint.lat, midpoint.lng], {
        radius: 8,
        fillColor: segment.color,
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      })
        .addTo(map)
        .bindTooltip(`${getTransportName(segment.mode)}`, {
          permanent: false,
          direction: 'center',
          className: 'text-xs font-bold bg-white/90 px-2 py-1 rounded shadow-md border',
          offset: [0, 0]
        });
    });

    // 6. Fit map to show all points
    if (allLatLngs.length > 0) {
      try {
        const bounds = L.latLngBounds(allLatLngs);
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 10 });
      } catch (e) {
        console.warn('Could not fit bounds:', e);
      }
    }

  }, [steps, is3D]);

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

        // Draw routes in 3D
        steps.forEach((step) => {
          const startCoords = step.startCoordinates || getCityCoordinates(step.from);
          const endCoords = step.endCoordinates || getCityCoordinates(step.to);

          if (startCoords && endCoords) {
            viewer.entities.add({
              polyline: {
                positions: [
                  Cesium.Cartesian3.fromDegrees(startCoords.lng, startCoords.lat),
                  Cesium.Cartesian3.fromDegrees(endCoords.lng, endCoords.lat)
                ],
                width: 6,
                material: Cesium.Color.fromCssColorString(getTransportColor(step.mode as TransportMode)),
                clampToGround: true
              }
            });

            // Start marker
            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(startCoords.lng, startCoords.lat),
              point: { pixelSize: 10, color: Cesium.Color.WHITE, outlineColor: Cesium.Color.fromCssColorString(getTransportColor(step.mode as TransportMode)), outlineWidth: 2, disableDepthTestDistance: Number.POSITIVE_INFINITY },
              label: {
                text: step.from,
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
          }
        });

        if (userLocation) {
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(userLocation.lng, userLocation.lat, 20000),
            orientation: {
              pitch: Cesium.Math.toRadians(-35)
            },
            duration: 3
          });
        } else {
          viewer.zoomTo(viewer.entities);
        }
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
  }, [is3D, steps]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    }
  }, []);

  return (
    <div className="w-full h-full bg-gray-100 relative z-0">
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

      {/* 3D Toggle */}
      <button
        onClick={() => setIs3D(!is3D)}
        className="absolute bottom-10 right-4 z-[500] flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all"
      >
        <span className="text-xs font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
          {is3D ? '2D View' : '3D View'}
        </span>
        <div className={`w-2 h-2 rounded-full ${is3D ? 'bg-blue-500' : 'bg-emerald-500'}`} />
      </button>

      {/* Map Controls Info */}
      <div className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] text-gray-500 shadow-sm border border-white">
        {is3D ? 'Right Click to Orbit â€¢ Scroll to Zoom' : 'Scroll to Zoom â€¢ Drag to Pan'}
      </div>
    </div>
  );
};
