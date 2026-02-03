import { BusRoute, UserLocation } from '../types';
import { BUS_DATA, STATIONS, METRO_STATIONS, RAILWAY_STATIONS, AIRPORTS } from '../constants';
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
        const s1 = STATIONS[bus.stops[i]] || METRO_STATIONS[bus.stops[i]] || RAILWAY_STATIONS[bus.stops[i]] || AIRPORTS[bus.stops[i]];
        const s2 = STATIONS[bus.stops[i + 1]] || METRO_STATIONS[bus.stops[i + 1]] || RAILWAY_STATIONS[bus.stops[i + 1]] || AIRPORTS[bus.stops[i + 1]];
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
        const s1 = STATIONS[stops[i]] || METRO_STATIONS[stops[i]] || RAILWAY_STATIONS[stops[i]] || AIRPORTS[stops[i]];
        const s2 = STATIONS[stops[i + 1]] || METRO_STATIONS[stops[i + 1]] || RAILWAY_STATIONS[stops[i + 1]] || AIRPORTS[stops[i + 1]];
        if (s1 && s2) {
            totalDistance += getDistance({ lat: s1.lat, lng: s1.lng }, { lat: s2.lat, lng: s2.lng });
        }
    }
    return totalDistance / 1000; // km
};

// Find nearby stations within a certain distance (meters)
const findNearbyStations = (stationId: string, maxMeters: number = 1000): string[] => {
    const source = STATIONS[stationId] || METRO_STATIONS[stationId] || RAILWAY_STATIONS[stationId] || AIRPORTS[stationId];
    if (!source) return [stationId];

    const nearby = [stationId];
    Object.values(STATIONS).forEach(s => {
        if (s.id === stationId) return;
        const dist = getDistance({ lat: source.lat, lng: source.lng }, { lat: s.lat, lng: s.lng });
        if (dist <= maxMeters) {
            nearby.push(s.id);
        }
    });

    return nearby;
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

    // Nearby stations for flexibility (e.g. 300 feet vs Bashundhara 300 feet)
    const nearbyStarts = findNearbyStations(startStationId, 500);
    const nearbyDests = findNearbyStations(destStationId, 500);

    // Strategy 1: Direct Bus Routes (Including extremely nearby stations)
    const directBuses: { bus: BusRoute, sId: string, dId: string }[] = [];
    nearbyStarts.forEach(sId => {
        nearbyDests.forEach(dId => {
            const found = findDirectBuses(sId, dId);
            found.forEach(bus => {
                if (!directBuses.find(db => db.bus.id === bus.id)) {
                    directBuses.push({ bus, sId, dId });
                }
            });
        });
    });

    directBuses.slice(0, 5).forEach((item, idx) => {
        const { bus, sId, dId } = item;
        const curStart = STATIONS[sId];
        const curDest = STATIONS[dId];
        const distance = calculateRouteDistance([sId, dId]);
        const duration = calculateBusTime(distance);
        const fare = calculateBusFare(bus, sId, dId);

        const steps: RouteStep[] = [];

        // Add walk if start station is different
        if (sId !== startStationId) {
            const walkDist = getDistance(
                { lat: startStation.lat, lng: startStation.lng },
                { lat: curStart.lat, lng: curStart.lng }
            );
            steps.push({
                type: 'walk',
                instruction: `Walk to ${curStart.name}`,
                from: startStation.name,
                to: curStart.name,
                fromId: startStation.id,
                toId: curStart.id,
                distance: walkDist / 1000,
                duration: calculateWalkingTime(walkDist)
            });
        }

        steps.push({
            type: 'bus',
            instruction: `Take ${bus.name} (${bus.bnName}) from ${curStart.name} to ${curDest.name}`,
            from: curStart.name,
            to: curDest.name,
            fromId: curStart.id,
            toId: curDest.id,
            distance: distance,
            duration: duration,
            busRoute: bus,
            fare: fare
        });

        // Add walk if dest station is different
        if (dId !== destStationId) {
            const walkDist = getDistance(
                { lat: curDest.lat, lng: curDest.lng },
                { lat: destStation.lat, lng: destStation.lng }
            );
            steps.push({
                type: 'walk',
                instruction: `Walk to ${destStation.name}`,
                from: curDest.name,
                to: destStation.name,
                fromId: curDest.id,
                toId: destStation.id,
                distance: walkDist / 1000,
                duration: calculateWalkingTime(walkDist)
            });
        }

        const totalDist = steps.reduce((sum, s) => sum + (s.distance || 0), 0);
        const totalDur = steps.reduce((sum, s) => sum + (s.duration || 0), 0);

        routes.push({
            id: `direct-${idx}`,
            title: sId === startStationId && dId === destStationId ? 'Direct Bus' : 'Bus (Nearby)',
            totalDuration: totalDur,
            totalFare: fare,
            totalDistance: totalDist,
            transfers: 0,
            routeType: 'direct',
            steps
        });
    });

    // Strategy 2: Metro + Bus Combination (if metro nearby)
    // Find nearest transfer point to start station
    const startTransferPoint = findNearestTransferPoint(startStation.lat, startStation.lng);

    if (startTransferPoint && startTransferPoint.metroStations && startTransferPoint.metroStations.length > 0) {
        const metroStation = METRO_STATIONS[startTransferPoint.metroStations[0]];

        if (metroStation) {
            // Strategy 2: Metro + Bus Combination (Dynamic)
            // Try all metro stations as potential transfer points
            Object.values(METRO_STATIONS).forEach((metroDest, mIdx) => {
                const metroDestId = metroDest.id;
                if (metroDestId === metroStation.id) return; // Skip same station

                // Find transfer point near this metro destination
                const destTransfer = Object.values(TRANSFER_POINTS).find(tp =>
                    tp.metroStations?.includes(metroDestId) || tp.nearbyStations.some(ns => ns.includes(metroDestId))
                );

                if (!destTransfer) return;

                // Find buses from this transfer hub (or nearby) to final destination (or nearby)
                let connectingBus: { bus: BusRoute, hubSt: string, finalSt: string } | null = null;

                for (const hubSt of destTransfer.nearbyStations) {
                    for (const finalSt of nearbyDests) {
                        const buses = findDirectBuses(hubSt, finalSt);
                        if (buses.length > 0) {
                            connectingBus = { bus: buses[0], hubSt, finalSt };
                            break;
                        }
                    }
                    if (connectingBus) break;
                }

                if (connectingBus) {
                    const { bus, hubSt, finalSt } = connectingBus;
                    const busStartStation = STATIONS[hubSt] || METRO_STATIONS[hubSt] || RAILWAY_STATIONS[hubSt] || AIRPORTS[hubSt];
                    const finalDestStation = STATIONS[finalSt] || METRO_STATIONS[finalSt] || RAILWAY_STATIONS[finalSt] || AIRPORTS[finalSt];

                    if (!busStartStation || !finalDestStation) return;

                    const walkToMetro = getDistance(
                        { lat: startStation.lat, lng: startStation.lng },
                        { lat: metroStation.lat, lng: metroStation.lng }
                    );

                    const metroDistance = getDistance(
                        { lat: metroStation.lat, lng: metroStation.lng },
                        { lat: metroDest.lat, lng: metroDest.lng }
                    ) / 1000;

                    const busDistance = calculateRouteDistance([hubSt, finalSt]);

                    const walkTime = calculateWalkingTime(walkToMetro);
                    const metroTime = calculateMetroTime(metroDistance);
                    const busTime = calculateBusTime(busDistance);

                    const totalDuration = walkTime + metroTime + busTime + 10;
                    const totalFare = 60 + calculateBusFare(bus, hubSt, finalSt);

                    routes.push({
                        id: `metro-bus-${mIdx}`,
                        title: 'Fastest (Metro + Bus)',
                        totalDuration: totalDuration,
                        totalFare: totalFare,
                        totalDistance: (walkToMetro / 1000) + metroDistance + busDistance,
                        transfers: 2,
                        routeType: 'fastest',
                        steps: [
                            {
                                type: 'walk', instruction: `Walk to ${metroStation.name}`,
                                from: startStation.name, to: metroStation.name, fromId: startStation.id, toId: metroStation.id,
                                distance: walkToMetro / 1000, duration: walkTime
                            },
                            {
                                type: 'metro', instruction: `Take MRT Line 6 from ${metroStation.name} to ${metroDest.name}`,
                                from: metroStation.name, to: metroDest.name, fromId: metroStation.id, toId: metroDest.id,
                                distance: metroDistance, duration: metroTime, metroLine: 'MRT Line 6', fare: 60
                            },
                            {
                                type: 'walk', instruction: `Transfer at ${destTransfer.name}`,
                                from: metroDest.name, to: busStartStation.name, fromId: metroDest.id, toId: busStartStation.id,
                                distance: 0.1, duration: 5
                            },
                            {
                                type: 'bus', instruction: `Take ${bus.name} (${bus.bnName}) to ${finalDestStation.name}`,
                                from: busStartStation.name, to: finalDestStation.name, fromId: busStartStation.id, toId: finalDestStation.id,
                                distance: busDistance, duration: busTime, busRoute: bus, fare: calculateBusFare(bus, hubSt, finalSt)
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



    // Strategy 3: Transfer via Transfer Point Hubs (Improved)
    Object.values(TRANSFER_POINTS).forEach((tp, tpIdx) => {
        // Skip if transfer point is extremely close to start or end (already handled by direct or 100m walk)
        const distStart = getDistance({ lat: startStation.lat, lng: startStation.lng }, { lat: tp.lat, lng: tp.lng });
        const distEnd = getDistance({ lat: destStation.lat, lng: destStation.lng }, { lat: tp.lat, lng: tp.lng });
        if (distStart < 500 || distEnd < 500) return;

        // Try combinations of nearby stations at this hub
        let hubFound = false;

        tp.nearbyStations.forEach(stA => {
            if (hubFound) return; // Limit to one good combination per hub for performance

            tp.nearbyStations.forEach(stB => {
                if (hubFound) return;

                // Find buses from start (or nearby start) to stA
                let busLeg1: { bus: BusRoute, sId: string } | null = null;
                for (const ns of nearbyStarts) {
                    const buses = findDirectBuses(ns, stA);
                    if (buses.length > 0) {
                        busLeg1 = { bus: buses[0], sId: ns };
                        break;
                    }
                }

                if (!busLeg1) return;

                // Find buses from stB to destination (or nearby dest)
                let busLeg2: { bus: BusRoute, dId: string } | null = null;
                for (const nd of nearbyDests) {
                    const buses = findDirectBuses(stB, nd);
                    if (buses.length > 0) {
                        busLeg2 = { bus: buses[0], dId: nd };
                        break;
                    }
                }

                if (!busLeg2) return;

                // We found a connection!
                hubFound = true;
                const bus1 = busLeg1.bus;
                const bus2 = busLeg2.bus;
                const sId = busLeg1.sId;
                const dId = busLeg2.dId;

                const curStart = STATIONS[sId];
                const curDest = STATIONS[dId];
                const stAStation = STATIONS[stA];
                const stBStation = STATIONS[stB];

                const steps: RouteStep[] = [];

                // 1. Walk to start station if needed
                if (sId !== startStationId) {
                    const d = getDistance({ lat: startStation.lat, lng: startStation.lng }, { lat: curStart.lat, lng: curStart.lng });
                    steps.push({
                        type: 'walk', instruction: `Walk to ${curStart.name}`,
                        from: startStation.name, to: curStart.name, fromId: startStation.id, toId: curStart.id,
                        distance: d / 1000, duration: calculateWalkingTime(d)
                    });
                }

                // 2. Bus Leg 1
                const dist1 = calculateRouteDistance([sId, stA]);
                const time1 = calculateBusTime(dist1);
                const fare1 = calculateBusFare(bus1, sId, stA);
                steps.push({
                    type: 'bus', instruction: `Take ${bus1.name} to ${stAStation.name}`,
                    from: curStart.name, to: stAStation.name, fromId: curStart.id, toId: stAStation.id,
                    distance: dist1, duration: time1, busRoute: bus1, fare: fare1
                });

                // 3. Transfer Walk at Hub
                const walkHubDist = getDistance({ lat: stAStation.lat, lng: stAStation.lng }, { lat: stBStation.lat, lng: stBStation.lng });
                steps.push({
                    type: 'walk', instruction: stA === stB ? `Transfer at ${stAStation.name}` : `Walk to ${stBStation.name} for transfer`,
                    from: stAStation.name, to: stBStation.name, fromId: stAStation.id, toId: stBStation.id,
                    distance: walkHubDist / 1000, duration: calculateWalkingTime(walkHubDist) + 5 // 5 min buffer
                });

                // 4. Bus Leg 2
                const dist2 = calculateRouteDistance([stB, dId]);
                const time2 = calculateBusTime(dist2);
                const fare2 = calculateBusFare(bus2, stB, dId);
                steps.push({
                    type: 'bus', instruction: `Take ${bus2.name} to ${curDest.name}`,
                    from: stBStation.name, to: curDest.name, fromId: stBStation.id, toId: curDest.id,
                    distance: dist2, duration: time2, busRoute: bus2, fare: fare2
                });

                // 5. Walk to final destination if needed
                if (dId !== destStationId) {
                    const d = getDistance({ lat: curDest.lat, lng: curDest.lng }, { lat: destStation.lat, lng: destStation.lng });
                    steps.push({
                        type: 'walk', instruction: `Walk to ${destStation.name}`,
                        from: curDest.name, to: destStation.name, fromId: curDest.id, toId: destStation.id,
                        distance: d / 1000, duration: calculateWalkingTime(d)
                    });
                }

                const totalDist = steps.reduce((sum, s) => sum + (s.distance || 0), 0);
                const totalDur = steps.reduce((sum, s) => sum + (s.duration || 0), 0);
                const totalFare = fare1 + fare2;

                routes.push({
                    id: `transfer-${tp.id}-${tpIdx}`,
                    title: `Via ${tp.name}`,
                    totalDuration: totalDur,
                    totalFare: totalFare,
                    totalDistance: totalDist,
                    transfers: 1,
                    routeType: 'least-transfers',
                    steps
                });
            });
        });
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
