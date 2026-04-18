import { BusRoute } from '../types';

// Types for Live Bus Tracking
export interface LiveBus {
    id: string; // Unique ID (e.g. device ID or session ID)
    busName: string; // e.g. "Baishakhi"
    lat: number;
    lng: number;
    speed: number;
    heading?: number;
    timestamp: number;
    isUser?: boolean; // Is this the current user?
}

// Live-bus backend was decommissioned. WS_URL intentionally empty —
// local tracking still works but cross-device broadcast is disabled.
const WS_URL = '';
let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let subscribers: ((buses: LiveBus[]) => void)[] = [];
let activeBroadcasting = false;
let currentBusName: string | null = null;
let lastLocation: { lat: number, lng: number, speed: number } | null = null;
let watchId: number | null = null;

// Stable device ID so server can identify this client across reconnects
const DEVICE_ID_KEY = 'koyjabo_device_id';
const getDeviceId = (): string => {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
};

// Store latest state of all buses
let liveBuses: Map<string, LiveBus> = new Map();

export const liveBusService = {
    // Start broadcasting location for a specific bus
    startBroadcasting: (busName: string) => {
        if (activeBroadcasting) return; // Already running

        activeBroadcasting = true;
        currentBusName = busName;
        connect();

        // Start persistent background watcher
        if ('geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude, speed } = pos.coords;
                    const speedKmh = speed ? speed * 3.6 : 0;
                    liveBusService.updateLocation(latitude, longitude, speedKmh);
                },
                (err) => console.error('Broadcasting GPS Error:', err),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            );
        }

        console.log(`📡 Started broadcasting as ${busName}`);
    },

    // Stop broadcasting
    stopBroadcasting: () => {
        activeBroadcasting = false;
        currentBusName = null;
        console.log('🔕 Stopped broadcasting');

        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }

        // Remove self from local map immediately
        const selfId = getDeviceId();
        if (liveBuses.has(selfId)) {
            liveBuses.delete(selfId);
            subscribers.forEach(cb => cb(Array.from(liveBuses.values())));
        }

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'stop_broadcast'
            }));
        }
    },

    // Check if currently broadcasting (for UI state)
    isBroadcasting: () => activeBroadcasting,

    // Update current location (called by internal watcher)
    updateLocation: (lat: number, lng: number, speed: number) => {
        if (!activeBroadcasting || !currentBusName) return;

        lastLocation = { lat, lng, speed };

        // 1. IMMEDIATE LOCAL UPDATE (So user sees themselves instantly)
        // Use the same device ID as sent to server to avoid duplicate marker
        const selfId = getDeviceId();
        const selfBus: LiveBus = {
            id: selfId,
            busName: currentBusName,
            lat,
            lng,
            speed,
            timestamp: Date.now(),
            isUser: true // Mark as self
        };

        liveBuses.set(selfId, selfBus);
        // Notify subscribers immediately
        console.log('📡 Broadcasting self as:', selfBus);
        console.log('👥 Total subscribers:', subscribers.length);
        subscribers.forEach(cb => cb(Array.from(liveBuses.values())));


        // 2. SEND TO SERVER
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            connect(); // Try to reconnect if dropped
            return;
        }

        // Send update to server — include device ID so server tracks this broadcaster
        ws.send(JSON.stringify({
            type: 'bus_location_update',
            id: getDeviceId(),
            busName: currentBusName,
            lat,
            lng,
            speed,
            timestamp: Date.now()
        }));
    },

    // Subscribe to updates of OTHER buses
    subscribe: (callback: (buses: LiveBus[]) => void) => {
        subscribers.push(callback);
        // Immediately return current state
        callback(Array.from(liveBuses.values()));

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            connect();
        }

        return () => {
            subscribers = subscribers.filter(s => s !== callback);
        };
    },

    // Get current active buses
    getBuses: (): LiveBus[] => {
        return Array.from(liveBuses.values());
    },

    // Get the current broadcasting bus name (or null if not broadcasting)
    getCurrentBusName: (): string | null => {
        return currentBusName;
    }
};

// Internal: Connect to WebSocket
const connect = () => {
    if (!WS_URL) return; // Backend decommissioned — local-only mode
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('✅ Connected to Bus Tracking Server');
            if (activeBroadcasting && currentBusName && lastLocation) {
                // Resend last known location immediately
                liveBusService.updateLocation(lastLocation.lat, lastLocation.lng, lastLocation.speed);
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Handle Broadcast from Server
                if (data.type === 'bus_locations_broadcast') {
                    // data.buses should be an array of LiveBus
                    const buses: LiveBus[] = data.buses || [];

                    // Update local map
                    buses.forEach(bus => {
                        liveBuses.set(bus.id, bus);
                    });

                    // Cleanup stale buses (older than 5 mins)
                    const now = Date.now();
                    Array.from(liveBuses.entries()).forEach(([id, bus]) => {
                        if (now - bus.timestamp > 5 * 60 * 1000) {
                            liveBuses.delete(id);
                        }
                    });

                    // Notify subscribers
                    const currentList = Array.from(liveBuses.values());
                    subscribers.forEach(cb => cb(currentList));
                }
            } catch (e) {
                console.error('Error parsing bus data:', e);
            }
        };

        ws.onclose = () => {
            ws = null;
            if (!WS_URL) return; // No backend — don't reconnect
            if ((activeBroadcasting || subscribers.length > 0) && !reconnectTimer) {
                reconnectTimer = setTimeout(() => {
                    reconnectTimer = null;
                    connect();
                }, 3000);
            }
        };

        ws.onerror = (err) => {
            console.error('Bus WS Error:', err);
        };

    } catch (e) {
        console.error('Failed to connect to Bus Service:', e);
    }
};
