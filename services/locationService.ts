import { UserLocation, Station } from '../types';
import { STATIONS, METRO_STATIONS, RAILWAY_STATIONS, AIRPORTS } from '../constants';

// IP-based geolocation fallback for when browser GPS is unavailable or denied
export const getLocationByIP = async (): Promise<UserLocation | null> => {
  // Skip network call immediately when offline — avoids 5s hang waiting for abort
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      return { lat: data.latitude, lng: data.longitude };
    }
    return null;
  } catch {
    return null;
  }
};

export const getCurrentLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      if (import.meta.env.DEV) {
      }

      // If first attempt fails, try with even more relaxed settings
      if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
        if (import.meta.env.DEV) {
        }
        navigator.geolocation.getCurrentPosition(
          successHandler,
          (err) => {
            if (import.meta.env.DEV) {
            }
            // Custom error messages for better user experience
            if (err.code === err.TIMEOUT) {
              reject(new Error("Location request timed out. Please ensure GPS is enabled."));
            } else if (err.code === err.PERMISSION_DENIED) {
              reject(new Error("Location permission denied. Please allow location access in your browser settings."));
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              reject(new Error("Location unavailable. Your device cannot determine its position right now."));
            } else {
              reject(new Error(`Location error: ${err.message}`));
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 3000, // Very fast timeout for fallback
            maximumAge: 300000 // Accept cached positions up to 5 minutes old for speed
          }
        );
      } else {
        // Immediate failure (like Permission Denied)
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission denied. Please allow location access in your browser settings."));
        } else {
          reject(error);
        }
      }
    };

    // Force High Accuracy for Real-Time Location
    // Users reported issues with low-accuracy IP based location
    // Optimized for Speed: user requested faster location detection
    // 1. Allow cached positions up to 30 seconds old (Instant result if available)
    // 2. Timeout reduced to 5s (don't hang for too long)
    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      {
        enableHighAccuracy: true, // Try GPS first
        timeout: 5000,            // Faster timeout
        maximumAge: 30000         // Accept results from last 30s
      }
    );
  });
};

// Calculate Haversine distance in meters
export const getDistance = (loc1: UserLocation, loc2: UserLocation): number => {
  const R = 6371e3; // metres
  const φ1 = (loc1.lat * Math.PI) / 180;
  const φ2 = (loc2.lat * Math.PI) / 180;
  const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const findNearestStation = (
  userLoc: UserLocation,
  routeStationIds: string[]
): { station: Station; index: number; distance: number } | null => {
  let nearest: { station: Station; index: number; distance: number } | null = null;
  let minDistance = Infinity;

  routeStationIds.forEach((sid, index) => {
    const station = STATIONS[sid] || METRO_STATIONS[sid] || RAILWAY_STATIONS[sid] || AIRPORTS[sid];
    if (station) {
      const dist = getDistance(userLoc, { lat: station.lat, lng: station.lng });
      // Consider "at the station" if within reasonable range, but for tracking just find absolute nearest
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { station, index, distance: dist };
      }
    }
  });

  return nearest;
};