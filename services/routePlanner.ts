import { BusRoute, UserLocation } from '../types';
import { BUS_DATA, STATIONS, METRO_STATIONS } from '../constants';
import { TRANSFER_POINTS, TransferPoint, findNearestTransferPoint } from './transferPoints';
import { getDistance, findNearestStation } from './locationService';

// --- Optimization: Cache for Station -> Buses lookup ---
const STATION_TO_BUSES_MAP: Record<string, BusRoute[]> = {};
let IS_MAP_INITIALIZED = false;

const initStationMap = () => {
    if (IS_MAP_INITIALIZED) return;

    // Build the map once
    BUS_DATA.forEach(bus => {
        bus.stops.forEach(stopId => {
            if (!STATION_TO_BUSES_MAP[stopId]) {
                STATION_TO_BUSES_MAP[stopId] = [];
            }
            STATION_TO_BUSES_MAP[stopId].push(bus);
        });
    });

    IS_MAP_INITIALIZED = true;
};


export interface RouteStep {
    type: 'walk' | 'bus' | 'metro' | 'railway';
    instruction: string;
    from: string;
    to: string;
    fromId?: string; // Station ID
    toId?: string;   // Station ID
    distance?: number;
    duration?: number; // in minutes
    busRoute?: BusRoute;
    metroLine?: string;
    fare?: number;
}

export interface SuggestedRoute {
    id: string;
    title: string;
    totalDuration: number; // minutes
    totalFare: number;
    totalDistance: number; // km
    transfers: number;
    steps: RouteStep[];
    routeType: 'fastest' | 'cheapest' | 'least-transfers' | 'direct';
}

// Calculate walking time (average 5 km/h)
const calculateWalkingTime = (distanceMeters: number): number => {
    return (distanceMeters / 1000) / 5 * 60; // minutes
};

// Calculate bus travel time (average 15 km/h in Dhaka traffic)
const calculateBusTime = (distanceKm: number): number => {
    return (distanceKm / 15) * 60; // minutes
};

// Calculate metro travel time (average 35 km/h)
const calculateMetroTime = (distanceKm: number): number => {
    return (distanceKm / 35) * 60; // minutes
};

// Find direct bus routes (Optimized)
const findDirectBuses = (fromStationId: string, toStationId: string): BusRoute[] => {
    if (!IS_MAP_INITIALIZED) initStationMap();

    // Get buses for both stations
    const fromBuses = STATION_TO_BUSES_MAP[fromStationId];
    const toBuses = STATION_TO_BUSES_MAP[toStationId];

    // Quick exit if either station has no buses
    if (!fromBuses || !toBuses) return [];

    // Optimization: Intersect the two lists. Loop over the smaller list.
    const [smaller, larger] = fromBuses.length < toBuses.length
        ? [fromBuses, toBuses]
        : [toBuses, fromBuses];

    // Create a Set for O(1) lookups of the larger list
    const largerSet = new Set(larger.map(b => b.id));

    return smaller.filter(bus => {
        // 1. Bus must be in both lists
        if (!largerSet.has(bus.id)) return false;

        // 2. Bus must go from A to B (direction check)
        // Note: strict direction check is safer for route planning
        const fromIdx = bus.stops.indexOf(fromStationId);
        const toIdx = bus.stops.indexOf(toStationId);

        return fromIdx !== -1 && toIdx !== -1;
    });
};

// Find buses passing through a station
const findBusesAtStation = (stationId: string): BusRoute[] => {
    if (!IS_MAP_INITIALIZED) initStationMap();
    return STATION_TO_BUSES_MAP[stationId] || [];
};

// Calculate fare for a bus route segment
const calculateBusFare = (bus: BusRoute, fromId: string, toId: string): number => {
    const fromIdx = bus.stops.indexOf(fromId);
    const toIdx = bus.stops.indexOf(toId);

    if (fromIdx === -1 || toIdx === -1) return 0;

    let distance = 0;
    const start = Math.min(fromIdx, toIdx);
    const end = Math.max(fromIdx, toIdx);

    for (let i = start; i < end; i++) {
        const s1 = STATIONS[bus.stops[i]];
        const s2 = STATIONS[bus.stops[i + 1]];
        if (s1 && s2) {
            distance += getDistance({ lat: s1.lat, lng: s1.lng }, { lat: s2.lat, lng: s2.lng });
        }
    }

    const distanceKm = distance / 1000;
    const fare = Math.max(10, Math.ceil(distanceKm * 2.42));
    return fare;
};

// Calculate distance between stations
const calculateRouteDistance = (stops: string[]): number => {
    let totalDistance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
        const s1 = STATIONS[stops[i]];
        const s2 = STATIONS[stops[i + 1]];
        if (s1 && s2) {
            totalDistance += getDistance({ lat: s1.lat, lng: s1.lng }, { lat: s2.lat, lng: s2.lng });
        }
    }
    return totalDistance / 1000; // km
};

// Main intelligent route planner
// Core routing logic: Find routes between two specific stations
export const findRoutesBetweenStations = (
    startStationId: string,
    destStationId: string
): SuggestedRoute[] => {
    const routes: SuggestedRoute[] = [];

    // Validate stations
    const startStation = STATIONS[startStationId];
    const destStation = STATIONS[destStationId];
    if (!startStation || !destStation) return routes;

    // Strategy 1: Direct Bus Routes
    const directBuses = findDirectBuses(startStationId, destStationId);
    directBuses.slice(0, 5).forEach((bus, idx) => {
        const distance = calculateRouteDistance([startStation.id, destStation.id]);
        const duration = calculateBusTime(distance);
        const fare = calculateBusFare(bus, startStation.id, destStation.id);

        routes.push({
            id: `direct-${idx}`,
            title: 'Direct Bus',
            totalDuration: duration,
            totalFare: fare,
            totalDistance: distance,
            transfers: 0,
            routeType: 'direct',
            steps: [
                {
                    type: 'bus',
                    instruction: `Take ${bus.name} (${bus.bnName}) from ${startStation.name} to ${destStation.name}`,
                    from: startStation.name,
                    to: destStation.name,
                    fromId: startStation.id,
                    toId: destStation.id,
                    distance: distance,
                    duration: duration,
                    busRoute: bus,
                    fare: fare
                }
            ]
        });
    });

    // Strategy 2: Metro + Bus Combination (if metro nearby)
    // Find nearest transfer point to start station
    const startTransferPoint = findNearestTransferPoint(startStation.lat, startStation.lng);

    if (startTransferPoint && startTransferPoint.metroStations && startTransferPoint.metroStations.length > 0) {
        const metroStation = METRO_STATIONS[startTransferPoint.metroStations[0]];

        if (metroStation) {
            // Find a good metro destination
            const metroDestinations = ['mirpur_10', 'uttara_south', 'agargaon', 'motijheel', 'farmgate'];

            metroDestinations.forEach((metroDestId, idx) => {
                const metroDest = METRO_STATIONS[metroDestId];
                if (!metroDest) return;

                // Find transfer point near metro destination
                const destTransfer = Object.values(TRANSFER_POINTS).find(tp =>
                    tp.metroStations?.includes(metroDestId)
                );

                if (!destTransfer) return;

                // Find buses from metro destination to final destination
                const connectingBuses = destTransfer.nearbyStations
                    .flatMap(stId => findDirectBuses(stId, destStation.id))
                    .filter((bus, index, self) =>
                        index === self.findIndex(b => b.id === bus.id)
                    );

                if (connectingBuses.length > 0) {
                    const bus = connectingBuses[0];
                    const busStartStation = STATIONS[destTransfer.nearbyStations[0]];

                    if (!busStartStation) return;

                    const walkToMetro = getDistance(
                        { lat: startStation.lat, lng: startStation.lng },
                        { lat: metroStation.lat, lng: metroStation.lng }
                    );

                    const metroDistance = getDistance(
                        { lat: metroStation.lat, lng: metroStation.lng },
                        { lat: metroDest.lat, lng: metroDest.lng }
                    ) / 1000;

                    const busDistance = calculateRouteDistance([busStartStation.id, destStation.id]);

                    const walkTime = calculateWalkingTime(walkToMetro);
                    const metroTime = calculateMetroTime(metroDistance);
                    const busTime = calculateBusTime(busDistance);

                    const totalDuration = walkTime + metroTime + busTime + 10; // 10 min transfer time
                    const totalFare = 60 + calculateBusFare(bus, busStartStation.id, destStation.id); // Metro fare + bus fare

                    routes.push({
                        id: `metro-bus-${idx}`,
                        title: 'Fastest Route (Metro + Bus)',
                        totalDuration: totalDuration,
                        totalFare: totalFare,
                        totalDistance: (walkToMetro / 1000) + metroDistance + busDistance,
                        transfers: 2,
                        routeType: 'fastest',
                        steps: [
                            {
                                type: 'walk',
                                instruction: `Walk to ${metroStation.name}`,
                                from: startStation.name,
                                to: metroStation.name,
                                fromId: startStation.id,
                                toId: metroStation.id,
                                distance: walkToMetro / 1000,
                                duration: walkTime
                            },
                            {
                                type: 'metro',
                                instruction: `Take MRT Line 6 from ${metroStation.name} to ${metroDest.name}`,
                                from: metroStation.name,
                                to: metroDest.name,
                                fromId: metroStation.id,
                                toId: metroDest.id,
                                distance: metroDistance,
                                duration: metroTime,
                                metroLine: 'MRT Line 6',
                                fare: 60
                            },
                            {
                                type: 'walk',
                                instruction: `Walk to ${busStartStation.name}`,
                                from: metroDest.name,
                                to: busStartStation.name,
                                fromId: metroDest.id,
                                toId: busStartStation.id,
                                distance: 0.2,
                                duration: 3
                            },
                            {
                                type: 'bus',
                                instruction: `Take ${bus.name} (${bus.bnName}) to ${destStation.name}`,
                                from: busStartStation.name,
                                to: destStation.name,
                                fromId: busStartStation.id,
                                toId: destStation.id,
                                distance: busDistance,
                                duration: busTime,
                                busRoute: bus,
                                fare: calculateBusFare(bus, busStartStation.id, destStation.id)
                            }
                        ]
                    });
                }
            });
        }
    } else {
        // Fallback if no transfer point found, but maybe direct walk?
        // Check "Direct Metro" Strategy below
    }


    // Strategy 1.5: Direct Metro Route (Walk -> Metro -> Walk)
    // Useful if both source and destination are near Metro stations
    // We already have startStation and destStation
    let nearestStartMetro: { id: string, dist: number } | null = null;
    let nearestEndMetro: { id: string, dist: number } | null = null;
    let minStartDist = Infinity;
    let minEndDist = Infinity;

    Object.values(METRO_STATIONS).forEach(m => {
        const dStart = getDistance({ lat: startStation.lat, lng: startStation.lng }, { lat: m.lat, lng: m.lng });
        if (dStart < minStartDist) {
            minStartDist = dStart;
            nearestStartMetro = { id: m.id, dist: dStart };
        }
        const dEnd = getDistance({ lat: destStation.lat, lng: destStation.lng }, { lat: m.lat, lng: m.lng });
        if (dEnd < minEndDist) {
            minEndDist = dEnd;
            nearestEndMetro = { id: m.id, dist: dEnd };
        }
    });

    // If both are within walking distance (e.g. 2km max walk to station)
    if (nearestStartMetro && nearestEndMetro && minStartDist < 2000 && minEndDist < 2000) {
        const mStart = METRO_STATIONS[nearestStartMetro.id];
        const mEnd = METRO_STATIONS[nearestEndMetro.id];

        // Ensure they are different stations
        if (mStart.id !== mEnd.id) {
            const walkStartKm = minStartDist / 1000;
            const walkEndKm = minEndDist / 1000;
            const metroDistKm = getDistance({ lat: mStart.lat, lng: mStart.lng }, { lat: mEnd.lat, lng: mEnd.lng }) / 1000;

            const timeWalkStart = calculateWalkingTime(minStartDist);
            const timeMetro = calculateMetroTime(metroDistKm);
            const timeWalkEnd = calculateWalkingTime(minEndDist);
            const totalTime = timeWalkStart + timeMetro + timeWalkEnd + 5; // 5 min buffer

            // Calculate Fare (Approximate)
            let metroFare = 0;
            if (metroDistKm <= 5) metroFare = 20;
            else if (metroDistKm <= 10) metroFare = 40;
            else if (metroDistKm <= 16) metroFare = 70;
            else metroFare = 100;

            routes.push({
                id: `metro-direct`,
                title: 'Metro Rail (Direct)',
                totalDuration: totalTime,
                totalFare: metroFare,
                totalDistance: walkStartKm + metroDistKm + walkEndKm,
                transfers: 0,
                routeType: 'fastest',
                steps: [
                    {
                        type: 'walk',
                        instruction: `Walk to ${mStart.name}`,
                        from: startStation.name,
                        to: mStart.name,
                        fromId: startStation.id,
                        toId: mStart.id,
                        distance: walkStartKm,
                        duration: timeWalkStart
                    },
                    {
                        type: 'metro',
                        instruction: `Take MRT Line 6 from ${mStart.name} to ${mEnd.name}`,
                        from: mStart.name,
                        to: mEnd.name,
                        fromId: mStart.id,
                        toId: mEnd.id,
                        distance: metroDistKm,
                        duration: timeMetro,
                        metroLine: 'MRT Line 6',
                        fare: metroFare
                    },
                    {
                        type: 'walk',
                        instruction: `Walk to ${destStation.name}`,
                        from: mEnd.name,
                        to: destStation.name,
                        fromId: mEnd.id,
                        toId: destStation.id,
                        distance: walkEndKm,
                        duration: timeWalkEnd
                    }
                ]
            });
        }
    }



    // Strategy 3: Transfer via major hub (Bus to Bus)
    const majorHubs = ['mogbazar', 'gabtoli', 'gulistan', 'farmgate', 'mohammadpur', 'mirpur_10', 'mirpur_1', 'notun_bazar', 'science_lab', 'shyamoli', 'technical', 'mohakhali', 'shahbag', 'kakrail', 'malibagh', 'rampura', 'badda_link_road', 'kuril', 'airport', 'uttara_house_building', 'abdullahpur', 'board_bazar', 'gazipur_chowrasta', 'jatrabari', 'sayedabad', 'komlapur', 'mouchak'];

    majorHubs.forEach((hubId, idx) => {
        const hub = STATIONS[hubId];
        if (!hub) return;

        // Skip if hub is start or end
        if (hubId === startStationId || hubId === destStationId) return;

        // Find buses from start to hub
        const busesToHub = findDirectBuses(startStation.id, hubId);
        // Find buses from hub to destination
        const busesFromHub = findDirectBuses(hubId, destStation.id);

        if (busesToHub.length > 0 && busesFromHub.length > 0) {
            const bus1 = busesToHub[0];
            const bus2 = busesFromHub[0]; // TODO: Check if it's the same bus (direct usually covers this, but good to check)

            if (bus1.id === bus2.id) return; // Already covered by direct routes

            const dist1 = calculateRouteDistance([startStation.id, hubId]);
            const dist2 = calculateRouteDistance([hubId, destStation.id]);

            const time1 = calculateBusTime(dist1);
            const time2 = calculateBusTime(dist2);

            const fare1 = calculateBusFare(bus1, startStation.id, hubId);
            const fare2 = calculateBusFare(bus2, hubId, destStation.id);

            routes.push({
                id: `transfer-${idx}`,
                title: `Via ${hub.name}`,
                totalDuration: time1 + time2 + 10, // 10 min transfer/wait buffer
                totalFare: fare1 + fare2,
                totalDistance: dist1 + dist2,
                transfers: 1,
                routeType: 'least-transfers',
                steps: [
                    {
                        type: 'bus',
                        instruction: `Take ${bus1.name} (${bus1.bnName}) from ${startStation.name} to ${hub.name}`,
                        from: startStation.name,
                        to: hub.name,
                        fromId: startStation.id,
                        toId: hub.id,
                        distance: dist1,
                        duration: time1,
                        busRoute: bus1,
                        fare: fare1
                    },
                    {
                        type: 'walk',
                        instruction: `Transit at ${hub.name}`,
                        from: hub.name,
                        to: hub.name,
                        fromId: hub.id,
                        toId: hub.id,
                        distance: 0.1,
                        duration: 5
                    },
                    {
                        type: 'bus',
                        instruction: `Take ${bus2.name} (${bus2.bnName}) from ${hub.name} to ${destStation.name}`,
                        from: hub.name,
                        to: destStation.name,
                        fromId: hub.id,
                        toId: destStation.id,
                        distance: dist2,
                        duration: time2,
                        busRoute: bus2,
                        fare: fare2
                    }
                ]
            });
        }
    });

    // Sort routes: Fastest first (Simple numeric sort)
    return routes.sort((a, b) => a.totalDuration - b.totalDuration);
};

// Main intelligent route planner (Legacy Wrapper)
export const planRoutes = (
    userLocation: UserLocation | null,
    destinationQuery: string
): SuggestedRoute[] => {
    // Find destination station
    const destStation = Object.values(STATIONS).find(s =>
        s.name.toLowerCase().includes(destinationQuery.toLowerCase()) ||
        (s.bnName && s.bnName.includes(destinationQuery))
    );

    if (!destStation) return [];

    // Find user's current location station
    let startStationId = 'motijheel'; // Fallback

    if (userLocation) {
        const nearestResult = findNearestStation(userLocation, Object.keys(STATIONS));
        if (nearestResult) {
            startStationId = nearestResult.station.id;
        }
    }

    return findRoutesBetweenStations(startStationId, destStation.id).slice(0, 3);
};
