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
    // Universities / campuses
    'dhaka university': ['shahbag', 'nilkhet', 'newmarket', 'science_lab'],
    'ঢাকা বিশ্ববিদ্যালয়': ['shahbag', 'nilkhet', 'newmarket', 'science_lab'],
    'du': ['shahbag', 'nilkhet', 'newmarket'],
    'buet': ['shahbag', 'science_lab', 'newmarket'],
    'বুয়েট': ['shahbag', 'science_lab', 'newmarket'],
    'tsc': ['shahbag'],
    'curzon hall': ['shahbag'],
    'nsu': ['nsu', 'bashundhara', 'notun_bazar'],
    'north south': ['nsu', 'bashundhara', 'notun_bazar'],
    'নর্থ সাউথ': ['nsu', 'bashundhara', 'notun_bazar'],
    'brac university': ['brac_university', 'badda', 'notun_bazar'],
    'ব্র্যাক': ['brac_university', 'badda', 'notun_bazar'],
    'iub': ['iub', 'bashundhara', 'notun_bazar'],
    'aiub': ['aiub', 'shahbag', 'science_lab'],
    'jahangirnagar': ['jahangirnagar_university', 'savar'],
    'জাহাঙ্গীরনগর': ['jahangirnagar_university', 'savar'],
    'ju': ['jahangirnagar_university', 'savar'],
    'uttara university': ['uttara_university', 'uttara', 'abdullahpur'],
    'উত্তরা বিশ্ববিদ্যালয়': ['uttara_university', 'uttara', 'abdullahpur'],
    'bsmmu': ['bsmmu', 'shahbag'],
    'pg hospital': ['bsmmu', 'shahbag'],
    'পিজি হাসপাতাল': ['bsmmu', 'shahbag'],
    // Hospitals / medical
    'medical college': ['shahbag', 'science_lab'],
    'dmch': ['dmch', 'gulistan', 'sadarghat'],
    'dhaka medical': ['dmch', 'gulistan', 'sadarghat'],
    'ঢাকা মেডিকেল': ['dmch', 'gulistan', 'sadarghat'],
    'birdem': ['bir_dem', 'shahbag'],
    'বারডেম': ['bir_dem', 'shahbag'],
    'square hospital': ['square_hospital', 'dhanmondi27', 'dhanmondi32'],
    'স্কয়ার': ['square_hospital', 'dhanmondi27', 'dhanmondi32'],
    'labaid': ['labaid_hospital', 'dhanmondi27'],
    'united hospital': ['united_hospital', 'bashundhara', 'nsu'],
    'evercare': ['evercare_hospital', 'bashundhara', 'nsu'],
    'kurmitola': ['kurmitola_hospital', 'airport', 'uttara'],
    'holy family': ['holy_family', 'mogbazar', 'shantinagar'],
    'ssmc': ['ssmc', 'sadarghat', 'gulistan'],
    'সলিমুল্লাহ': ['ssmc', 'sadarghat', 'gulistan'],
    'suhrawardy': ['suhrawardy_hospital', 'shyamoli', 'kallyanpur'],
    'সোহরাওয়ার্দী': ['suhrawardy_hospital', 'shyamoli', 'kallyanpur'],
    'pangu hospital': ['pangu_hospital', 'shyamoli', 'kallyanpur'],
    'পঙ্গু': ['pangu_hospital', 'shyamoli', 'kallyanpur'],
    'nitor': ['pangu_hospital', 'shyamoli'],
    'shishu hospital': ['shishu_hospital', 'shyamoli'],
    'শিশু হাসপাতাল': ['shishu_hospital', 'shyamoli'],
    'nicvd': ['nicvd', 'shyamoli'],
    'হৃদরোগ': ['nicvd', 'shyamoli'],
    'cancer hospital': ['cancer_hospital', 'agargaon'],
    'ক্যান্সার': ['cancer_hospital', 'agargaon'],
    'chest hospital': ['chest_hospital', 'agargaon'],
    'nidch': ['chest_hospital', 'agargaon'],
    'মানসিক': ['mental_hospital', 'shyamoli'],
    'nimh': ['mental_hospital', 'shyamoli'],
    'eye hospital': ['eye_hospital', 'shyamoli'],
    'চক্ষু': ['eye_hospital', 'shyamoli'],
    'kidney hospital': ['nikdu', 'shyamoli'],
    'কিডনি': ['nikdu', 'kidney_foundation', 'shyamoli'],
    'kidney foundation': ['kidney_foundation', 'mirpur2'],
    'national heart': ['national_heart_foundation', 'mirpur2'],
    'হার্ট ফাউন্ডেশন': ['national_heart_foundation', 'mirpur2'],
    'mugda': ['mugda_medical', 'malibagh', 'rampura'],
    'মুগদা': ['mugda_medical', 'malibagh', 'rampura'],
    'cmh': ['cmh_dhaka', 'airport', 'khilkhet'],
    'icddrb': ['icddrb', 'mohakhali'],
    'কলেরা': ['icddrb', 'mohakhali'],
    // Shopping / malls
    'bashundhara city': ['kawran_bazar', 'farmgate'],
    'বসুন্ধরা সিটি': ['kawran_bazar', 'farmgate'],
    'jamuna future park': ['notun_bazar', 'badda', 'kuril'],
    'যমুনা ফিউচার পার্ক': ['notun_bazar', 'badda', 'kuril'],
    'jamuna': ['notun_bazar', 'badda', 'kuril'],
    'dhanmondi': ['dhanmondi27', 'dhanmondi32', 'dhanmondi15', 'science_lab'],
    'ধানমন্ডি': ['dhanmondi27', 'dhanmondi32', 'dhanmondi15', 'science_lab'],
    'gulshan': ['gulshan1', 'gulshan2', 'banani'],
    'গুলশান': ['gulshan1', 'gulshan2', 'banani'],
    'banani': ['banani', 'gulshan1'],
    'বনানী': ['banani', 'gulshan1'],
    'wills little flower': ['nilkhet', 'shahbag'],
    // Transport hubs
    'airport': ['airport', 'uttara', 'kurmitola_hospital'],
    'বিমানবন্দর': ['airport', 'uttara'],
    'hazrat shahjalal': ['airport', 'uttara'],
    'hsia': ['airport', 'uttara'],
    'kamalapur': ['gulistan', 'motijheel'],
    'কমলাপুর': ['gulistan', 'motijheel'],
    'railway station': ['gulistan', 'motijheel'],
    'rail station': ['gulistan', 'motijheel'],
    'gabtoli': ['gabtoli'],
    'গাবতলী': ['gabtoli'],
    'sayedabad': ['sayedabad'],
    'সায়েদাবাদ': ['sayedabad'],
    'mohakhali': ['mohakhali'],
    'মহাখালী': ['mohakhali'],
    'sadarghat': ['sadarghat'],
    'সদরঘাট': ['sadarghat'],
    // Key areas
    'mirpur': ['mirpur1', 'mirpur2', 'mirpur10', 'mirpur12', 'pallabi'],
    'মিরপুর': ['mirpur1', 'mirpur2', 'mirpur10', 'mirpur12', 'pallabi'],
    'uttara': ['uttara', 'abdullahpur', 'uttara_university'],
    'উত্তরা': ['uttara', 'abdullahpur'],
    'motijheel': ['motijheel', 'paltan', 'gulistan'],
    'মতিঝিল': ['motijheel', 'paltan', 'gulistan'],
    'paltan': ['paltan', 'motijheel', 'press_club'],
    'পল্টন': ['paltan', 'motijheel', 'press_club'],
    'old dhaka': ['sadarghat', 'gulistan', 'fulbaria'],
    'পুরান ঢাকা': ['sadarghat', 'gulistan', 'fulbaria'],
    'farmgate': ['farmgate', 'bijoy_sarani', 'kawran_bazar'],
    'ফার্মগেট': ['farmgate', 'bijoy_sarani', 'kawran_bazar'],
    'mohammadpur': ['mohammadpur', 'shia_masjid', 'ring_road'],
    'মোহাম্মদপুর': ['mohammadpur', 'shia_masjid', 'ring_road'],
    'badda': ['badda', 'uttar_badda', 'madhya_badda', 'merul'],
    'বাড্ডা': ['badda', 'uttar_badda', 'madhya_badda', 'merul'],
    'rampura': ['rampura', 'rampura_bazar', 'banasree'],
    'রামপুরা': ['rampura', 'rampura_bazar', 'banasree'],
    'jatrabari': ['jatrabari', 'sayedabad', 'signboard'],
    'যাত্রাবাড়ী': ['jatrabari', 'sayedabad', 'signboard'],
    'savar': ['savar', 'hemayetpur', 'jahangirnagar_university'],
    'সাভার': ['savar', 'hemayetpur'],
    'tongi': ['tongi', 'gazipur'],
    'টঙ্গী': ['tongi', 'gazipur'],
    'gazipur': ['gazipur', 'tongi', 'gazipur_bypass'],
    'গাজীপুর': ['gazipur', 'tongi', 'gazipur_bypass'],
    // Landmarks / areas
    'shyamoli': ['shyamoli', 'kallyanpur', 'agargaon'],
    'শ্যামলী': ['shyamoli', 'kallyanpur', 'agargaon'],
    'agargaon': ['agargaon', 'shyamoli', 'kallyanpur'],
    'আগারগাঁও': ['agargaon', 'shyamoli'],
    'bijoy sarani': ['bijoy_sarani', 'farmgate', 'kawran_bazar'],
    'বিজয় সরণি': ['bijoy_sarani', 'farmgate', 'kawran_bazar'],
    'kawran bazar': ['kawran_bazar', 'farmgate', 'bijoy_sarani'],
    'কাওরান বাজার': ['kawran_bazar', 'farmgate', 'bijoy_sarani'],
    'malibagh': ['malibagh', 'malibagh_railgate', 'mouchak', 'mogbazar'],
    'মালিবাগ': ['malibagh', 'malibagh_railgate', 'mouchak'],
    'mogbazar': ['mogbazar', 'malibagh', 'mouchak'],
    'মগবাজার': ['mogbazar', 'malibagh', 'mouchak'],
    'shahbag': ['shahbag', 'science_lab', 'newmarket'],
    'শাহবাগ': ['shahbag', 'science_lab', 'newmarket'],
    'science lab': ['science_lab', 'shahbag', 'newmarket'],
    'সায়েন্স ল্যাব': ['science_lab', 'shahbag', 'newmarket'],
    'new market': ['newmarket', 'nilkhet', 'science_lab'],
    'নিউ মার্কেট': ['newmarket', 'nilkhet', 'science_lab'],
    'azimpur': ['azimpur', 'nilkhet', 'newmarket'],
    'আজিমপুর': ['azimpur', 'nilkhet', 'newmarket'],
    'press club': ['press_club', 'paltan', 'motijheel'],
    'প্রেস ক্লাব': ['press_club', 'paltan', 'motijheel'],
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
    // STEP 1: Search for exact bus name matches first
    const exactNameMatch = BUS_DATA.filter(bus => 
        bus.name.toLowerCase() === lowerQuery || 
        bus.bnName === queryTrimmed ||
        bus.id.toLowerCase() === lowerQuery
    );

    if (exactNameMatch.length > 0) {
        return {
            buses: exactNameMatch,
            matchType: 'bus_name',
            searchContext: `Exact match for "${query}"`
        };
    }

    const busByName = BUS_DATA.filter(bus => {
        const nameMatch = bus.name.toLowerCase().includes(lowerQuery);
        const bnNameMatch = bus.bnName?.includes(queryTrimmed);
        const routeMatch = bus.routeString?.toLowerCase().includes(lowerQuery);

        return nameMatch || bnNameMatch || routeMatch;
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
