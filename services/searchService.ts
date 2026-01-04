import { BusRoute, Station } from '../types';
import { BUS_DATA, STATIONS } from '../constants';
import { findNearbyStations, getNearbyStationNames } from './nearbyStationsService';

/**
 * Enhanced Search Service for Bus & Station Search
 * Supports Bengali text, station names, and bus names/numbers
 */

// Custom Cache to avoid Object.values repetition
let CACHED_STATIONS_LIST: Station[] | null = null;
const getStationsList = () => {
    if (!CACHED_STATIONS_LIST) {
        CACHED_STATIONS_LIST = Object.values(STATIONS);
    }
    return CACHED_STATIONS_LIST;
};


export interface SearchSuggestion {
    type: 'bus' | 'station';
    id: string;
    name: string;
    bnName?: string;
    subtitle?: string;
}

export interface SearchResult {
    buses: BusRoute[];
    matchType: 'bus_name' | 'destination' | 'fuzzy';
    searchContext?: string;
    destinationStationIds?: string[]; // Station IDs for the searched destination
}

/**
 * Generate autocomplete suggestions based on user input
 */
export const generateSearchSuggestions = (query: string): SearchSuggestion[] => {
    if (!query || query.trim().length < 1) return [];

    const lowerQuery = query.toLowerCase().trim();
    const suggestions: SearchSuggestion[] = [];

    // Search stations (both English and Bengali names)
    const stationsList = getStationsList();
    for (let i = 0; i < stationsList.length; i++) {
        const station = stationsList[i];
        const englishMatch = station.name.toLowerCase().includes(lowerQuery);
        const bengaliMatch = station.bnName?.includes(query.trim());

        if (englishMatch || bengaliMatch) {
            suggestions.push({
                type: 'station',
                id: station.id,
                name: station.name,
                bnName: station.bnName,
                subtitle: station.bnName || station.name
            });
            // Optimization: Limit internal collection if we have enough
            if (suggestions.length > 20) break;
        }
    }


    // Search bus names/numbers
    BUS_DATA.forEach(bus => {
        const nameMatch = bus.name.toLowerCase().includes(lowerQuery);
        const bnNameMatch = bus.bnName?.includes(query.trim());
        const idMatch = bus.id.toLowerCase().includes(lowerQuery);

        if (nameMatch || bnNameMatch || idMatch) {
            suggestions.push({
                type: 'bus',
                id: bus.id,
                name: bus.name,
                bnName: bus.bnName,
                subtitle: bus.routeString
            });
        }
    });

    // Return top 10 suggestions (5 stations + 5 buses preferred)
    const stationSuggestions = suggestions.filter(s => s.type === 'station').slice(0, 6);
    const busSuggestions = suggestions.filter(s => s.type === 'bus').slice(0, 4);

    return [...stationSuggestions, ...busSuggestions];
};

/**
 * Location aliases - maps common search terms to actual station names
 */
const LOCATION_ALIASES: Record<string, string[]> = {
    'dhaka university': ['shahbag', 'nilkhet', 'newmarket', 'science_lab'],
    'du': ['shahbag', 'nilkhet', 'newmarket'],
    'buet': ['shahbag', 'science_lab', 'newmarket'],
    'medical college': ['shahbag', 'science_lab'],
    'tsc': ['shahbag'],
    'curzon hall': ['shahbag'],
};

/**
 * Expand query with aliases
 */
const expandWithAliases = (query: string): string[] => {
    const queryLower = query.toLowerCase().trim();
    const expanded = [query]; // Always include original

    // Check if query matches any alias
    for (const [alias, stations] of Object.entries(LOCATION_ALIASES)) {
        if (queryLower.includes(alias)) {
            // Add station names from alias
            stations.forEach(station => {
                const stationObj = STATIONS[station]; // Direct lookup instead of Object.values().find()
                if (stationObj) {
                    expanded.push(stationObj.name);
                }
            });
        }
    }

    return expanded;
};

/**
 * Enhanced search that handles:
 * 1. Bus name/number search
 * 2. Destination/station search (finds buses going to that station)
 * 3. Bengali text search
 */
export const enhancedBusSearch = (query: string): SearchResult => {
    if (!query || query.trim().length === 0) {
        return {
            buses: BUS_DATA,
            matchType: 'fuzzy'
        };
    }

    const lowerQuery = query.toLowerCase().trim();
    const queryTrimmed = query.trim();

    // STEP 0: Check if query is in "X to Y" format (e.g., "Jahangirnagar University to Dhaka University")
    const toPattern = /(.+?)\s+(?:to|থেকে)\s+(.+)/i;
    const toMatch = queryTrimmed.match(toPattern);

    if (toMatch) {
        const fromQuery = toMatch[1].trim();
        const toQuery = toMatch[2].trim();

        // Expand queries with aliases for better matching
        const expandedFromQueries = expandWithAliases(fromQuery);
        const expandedToQueries = expandWithAliases(toQuery);

        // Find matching stations for "from" and "to" - trim station names for better matching
        const fromStations = getStationsList().filter(station => {
            const stationName = station.name.trim().toLowerCase();

            // Check against all expanded queries
            return expandedFromQueries.some(query => {
                const queryLower = query.toLowerCase();
                const englishMatch = stationName.includes(queryLower) || queryLower.includes(stationName);
                const bengaliMatch = station.bnName?.includes(query);
                return englishMatch || bengaliMatch;
            });
        });

        const toStations = getStationsList().filter(station => {
            const stationName = station.name.trim().toLowerCase();

            // Check against all expanded queries
            return expandedToQueries.some(query => {
                const queryLower = query.toLowerCase();
                const englishMatch = stationName.includes(queryLower) || queryLower.includes(stationName);
                const bengaliMatch = station.bnName?.includes(query);
                return englishMatch || bengaliMatch;
            });
        });


        if (fromStations.length > 0 && toStations.length > 0) {
            // Find buses that connect these stations
            const fromStationIds = fromStations.map(s => s.id);
            const toStationIds = toStations.map(s => s.id);

            const connectingBuses: BusRoute[] = [];

            BUS_DATA.forEach(bus => {
                const hasFromStop = bus.stops.some(stopId => fromStationIds.includes(stopId));
                const hasToStop = bus.stops.some(stopId => toStationIds.includes(stopId));

                if (hasFromStop && hasToStop) {
                    // Check if the route goes from "from" to "to" in the correct order
                    const fromIndices = bus.stops
                        .map((stopId, idx) => fromStationIds.includes(stopId) ? idx : -1)
                        .filter(idx => idx !== -1);
                    const toIndices = bus.stops
                        .map((stopId, idx) => toStationIds.includes(stopId) ? idx : -1)
                        .filter(idx => idx !== -1);

                    // Check if any "from" stop comes before any "to" stop
                    const validRoute = fromIndices.some(fromIdx =>
                        toIndices.some(toIdx => fromIdx < toIdx)
                    );

                    if (validRoute) {
                        connectingBuses.push(bus);
                    }
                }
            });

            // If direct buses found, return them
            if (connectingBuses.length > 0) {
                const fromName = fromStations[0].bnName || fromStations[0].name;
                const toName = toStations[0].bnName || toStations[0].name;

                return {
                    buses: connectingBuses,
                    matchType: 'destination',
                    searchContext: `Routes from ${fromName} to ${toName}`,
                    destinationStationIds: toStationIds
                };
            }

            // FALLBACK: No direct buses, search for nearby stations to destination
            const toStation = toStations[0];
            const nearbyToStations = findNearbyStations(toStation.id, 2000); // Within 2km of destination

            if (nearbyToStations.length > 0) {
                const allDestinationIds = [...toStationIds, ...nearbyToStations];
                const nearbyConnectingBuses: BusRoute[] = [];

                BUS_DATA.forEach(bus => {
                    const hasFromStop = bus.stops.some(stopId => fromStationIds.includes(stopId));
                    const hasNearbyToStop = bus.stops.some(stopId => allDestinationIds.includes(stopId));

                    if (hasFromStop && hasNearbyToStop) {
                        // Check route direction
                        const fromIndices = bus.stops
                            .map((stopId, idx) => fromStationIds.includes(stopId) ? idx : -1)
                            .filter(idx => idx !== -1);
                        const toIndices = bus.stops
                            .map((stopId, idx) => allDestinationIds.includes(stopId) ? idx : -1)
                            .filter(idx => idx !== -1);

                        const validRoute = fromIndices.some(fromIdx =>
                            toIndices.some(toIdx => fromIdx < toIdx)
                        );

                        if (validRoute) {
                            nearbyConnectingBuses.push(bus);
                        }
                    }
                });

                if (nearbyConnectingBuses.length > 0) {
                    const fromName = fromStations[0].bnName || fromStations[0].name;
                    const toName = toStations[0].bnName || toStations[0].name;
                    const nearbyNames = getNearbyStationNames(nearbyToStations, 3);

                    return {
                        buses: nearbyConnectingBuses,
                        matchType: 'destination',
                        searchContext: `Routes from ${fromName} to ${toName} (via nearby: ${nearbyNames})`,
                        destinationStationIds: allDestinationIds
                    };
                }
            }
        }

        // FINAL FALLBACK for "X to Y": Show buses mentioning either location in route or stops
        // This helps when station names don't match perfectly or stations exist but no buses stop there
        const routeMatchBuses = BUS_DATA.filter(bus => {
            const routeStr = (bus.routeString || '').toLowerCase();
            const busName = bus.name.toLowerCase();
            const fromQueryLower = fromQuery.toLowerCase();
            const toQueryLower = toQuery.toLowerCase();

            // Check if route string or bus name mentions either location
            const routeFromMatch = routeStr.includes(fromQueryLower) || busName.includes(fromQueryLower);
            const routeToMatch = routeStr.includes(toQueryLower) || busName.includes(toQueryLower);

            // Also check if any stop names contain the query
            const stopNames = bus.stops.map(stopId => {
                const station = STATIONS[stopId];
                return station ? station.name.toLowerCase() : '';
            }).join(' ');

            const stopFromMatch = stopNames.includes(fromQueryLower);
            const stopToMatch = stopNames.includes(toQueryLower);

            return (routeFromMatch || stopFromMatch) && (routeToMatch || stopToMatch);
        });

        if (routeMatchBuses.length > 0) {
            return {
                buses: routeMatchBuses,
                matchType: 'fuzzy',
                searchContext: `Buses with routes from "${fromQuery}" to "${toQuery}"`
            };
        }

        // ULTRA FALLBACK: Show any bus mentioning either location
        // Try with full query first, then try first significant word
        const anyMatch = BUS_DATA.filter(bus => {
            const routeStr = (bus.routeString || '').toLowerCase();
            const busName = bus.name.toLowerCase();
            const fromQueryLower = fromQuery.toLowerCase();
            const toQueryLower = toQuery.toLowerCase();

            // Try full query
            let matched = routeStr.includes(fromQueryLower) || busName.includes(fromQueryLower) ||
                routeStr.includes(toQueryLower) || busName.includes(toQueryLower);

            if (!matched) {
                // Try first significant word (min 4 chars) from each query
                const fromWords = fromQueryLower.split(/\s+/).filter(w => w.length >= 4);
                const toWords = toQueryLower.split(/\s+/).filter(w => w.length >= 4);

                matched = fromWords.some(word => routeStr.includes(word) || busName.includes(word)) ||
                    toWords.some(word => routeStr.includes(word) || busName.includes(word));
            }

            return matched;
        });

        if (anyMatch.length > 0) {
            return {
                buses: anyMatch,
                matchType: 'fuzzy',
                searchContext: `Buses mentioning "${fromQuery}" or "${toQuery}"`
            };
        }
    }

    // STEP 1: Search for bus by name/number/ID
    const busByName = BUS_DATA.filter(bus => {
        const nameMatch = bus.name.toLowerCase().includes(lowerQuery);
        const bnNameMatch = bus.bnName?.includes(queryTrimmed);
        const idMatch = bus.id.toLowerCase().includes(lowerQuery);
        const routeMatch = bus.routeString?.toLowerCase().includes(lowerQuery);

        return nameMatch || bnNameMatch || idMatch || routeMatch;
    });

    if (busByName.length > 0) {
        return {
            buses: busByName,
            matchType: 'bus_name',
            searchContext: `Bus matching "${query}"`
        };
    }

    // STEP 2: Search for stations matching the query
    const matchingStations = getStationsList().filter(station => {
        const englishMatch = station.name.toLowerCase().includes(lowerQuery);
        const bengaliMatch = station.bnName?.includes(queryTrimmed);

        return englishMatch || bengaliMatch;
    });


    if (matchingStations.length > 0) {
        // Find all buses that stop at any of these matching stations
        const busesGoingThere: BusRoute[] = [];
        const stationIds = matchingStations.map(s => s.id);

        BUS_DATA.forEach(bus => {
            const goesToStation = bus.stops.some(stopId => stationIds.includes(stopId));
            if (goesToStation) {
                busesGoingThere.push(bus);
            }
        });

        if (busesGoingThere.length > 0) {
            const stationName = matchingStations[0].bnName || matchingStations[0].name;
            return {
                buses: busesGoingThere,
                matchType: 'destination',
                searchContext: `Buses going to ${stationName}`,
                destinationStationIds: stationIds
            };
        }

        // STEP 2.5: If no direct buses found, search nearby stations
        // This helps when a place doesn't have direct bus service
        const firstStation = matchingStations[0];
        const nearbyStationIds = findNearbyStations(firstStation.id, 2000); // Within 2km

        if (nearbyStationIds.length > 0) {
            const busesGoingNearby: BusRoute[] = [];

            BUS_DATA.forEach(bus => {
                const goesToNearby = bus.stops.some(stopId => nearbyStationIds.includes(stopId));
                if (goesToNearby) {
                    busesGoingNearby.push(bus);
                }
            });

            if (busesGoingNearby.length > 0) {
                const stationName = firstStation.bnName || firstStation.name;
                const nearbyNames = getNearbyStationNames(nearbyStationIds, 3);

                return {
                    buses: busesGoingNearby,
                    matchType: 'destination',
                    searchContext: `Buses going near ${stationName} (via ${nearbyNames})`,
                    destinationStationIds: [...stationIds, ...nearbyStationIds]
                };
            }
        }
    }

    // STEP 3: Fuzzy search as fallback (search route descriptions, etc.)
    const fuzzyResults = BUS_DATA.filter(bus => {
        const routeMatch = bus.routeString?.toLowerCase().includes(lowerQuery);
        const typeMatch = bus.type?.toLowerCase().includes(lowerQuery);

        return routeMatch || typeMatch;
    });

    return {
        buses: fuzzyResults.length > 0 ? fuzzyResults : [],
        matchType: 'fuzzy',
        searchContext: fuzzyResults.length > 0 ? `Search results for "${query}"` : undefined
    };
};

/**
 * Get all stations sorted alphabetically for dropdowns
 */
export const getAllStationsSorted = (): Station[] => {
    return getStationsList().sort((a, b) => a.name.localeCompare(b.name));
};


/**
 * Get all buses sorted by name
 */
export const getAllBusesSorted = (): BusRoute[] => {
    return [...BUS_DATA].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Filter buses by area
 */
export const filterBusesByArea = (area: string): BusRoute[] => {
    const areaLower = area.toLowerCase();

    return BUS_DATA.filter(bus => {
        const routeMatch = bus.routeString?.toLowerCase().includes(areaLower);
        const stopsInArea = bus.stops.some(stopId => {
            const station = STATIONS[stopId];
            return station?.name.toLowerCase().includes(areaLower);
        });

        return routeMatch || stopsInArea;
    });
};

/**
 * Filter buses by type (AC, Non-AC, etc.)
 */
export const filterBusesByType = (type: string): BusRoute[] => {
    return BUS_DATA.filter(bus =>
        bus.type?.toLowerCase().includes(type.toLowerCase())
    );
};

/**
 * Get popular search suggestions (pre-defined)
 */
export const getPopularSearches = (): SearchSuggestion[] => {
    return [
        { type: 'station', id: 'dhaka_university', name: 'Dhaka University', bnName: 'ঢাকা বিশ্ববিদ্যালয়' },
        { type: 'station', id: 'shahbag', name: 'Shahbag', bnName: 'শাহবাগ' },
        { type: 'station', id: 'uttara', name: 'Uttara', bnName: 'উত্তরা' },
        { type: 'station', id: 'mohakhali', name: 'Mohakhali', bnName: 'মহাখালী' },
        { type: 'station', id: 'gulistan', name: 'Gulistan', bnName: 'গুলিস্তান' },
        { type: 'station', id: 'farmgate', name: 'Farmgate', bnName: 'ফার্মগেট' },
        { type: 'station', id: 'mirpur10', name: 'Mirpur 10', bnName: 'মিরপুর ১০' },
        { type: 'station', id: 'dhanmondi', name: 'Dhanmondi', bnName: 'ধানমন্ডি' },
    ];
};
