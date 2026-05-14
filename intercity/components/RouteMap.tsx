import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteStep, TransportMode } from '../types';

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
      html: '<div class="flex items-center justify-center w-full h-full"><div class="w-3 h-3 bg-kj-primary border-2 border-white rounded-full shadow-lg"></div></div>',
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
              className: 'font-bold text-emerald-700 bg-white border-2 border-kj-primary/30 shadow-lg px-3 py-1 rounded-lg text-sm',
              offset: [0, -15]
            });
        } else {
          // Intermediate stops
          L.marker(start, { icon: midIcon })
            .addTo(map)
            .bindTooltip(step.from, {
              direction: 'auto',
              className: 'text-kj-text-dim bg-white border border-kj-line px-2 py-0.5 rounded text-xs font-medium shadow'
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

  }, [steps]);

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
      <div className="w-full h-full">
        <div ref={mapRef} className="w-full h-full" />
      </div>
      <div className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] text-kj-text-dim shadow-sm border border-white">
        Scroll to Zoom · Drag to Pan
      </div>
    </div>
  );
};
