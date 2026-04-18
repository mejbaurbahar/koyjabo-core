import { Station } from '../types';
import { STATIONS } from '../constants';
import { getDistance } from './locationService';

/**
 * Mapping of major stations to their nearby alternative stations
 * This helps when a user searches for a place that might not have direct bus service
 */
export const NEARBY_STATIONS_MAP: Record<string, string[]> = {
    // Dhaka University Area
    'dhaka_university': ['shahbag', 'nilkhet', 'newmarket', 'tsc', 'science_lab', 'azimpur'],
    'tsc': ['dhaka_university', 'shahbag', 'nilkhet'],

    // Shopping Areas
    'newmarket': ['azimpur', 'nilkhet', 'shahbag', 'elephant_road'],
    'bashundhara_city': ['panthapath', 'karwan_bazar', 'farmgate'],
    'jamuna_future_park': ['kuril', 'baridhara_dohs'],

    // Residential/Office Areas
    'banani': ['mohakhali', 'gulshan_1', 'kakoli'],
    'gulshan_1': ['mohakhali', 'banani', 'badda_link_road'],
    'gulshan_2': ['mohakhali', 'banani', 'gulshan_1'],
    'dhanmondi': ['science_lab', 'asad_gate', 'kalabagan', 'jigatola'],
    'uttara': ['abdullahpur', 'rajlakshmi', 'azampur', 'jashimuddin'],

    // ── Uttara Sectors (all map to nearby served stops) ──────────────────────
    'uttara_sector1':  ['abdullahpur', 'uttara', 'rajlakshmi'],
    'uttara_sector3':  ['uttara', 'abdullahpur', 'rajlakshmi'],
    'uttara_sector5':  ['uttara', 'rajlakshmi', 'azampur'],
    'uttara_sector7':  ['uttara', 'rajlakshmi', 'azampur'],
    'uttara_sector10': ['uttara', 'jashimuddin', 'rajlakshmi'],
    'uttara_sector11': ['uttara', 'rajlakshmi', 'jashimuddin'],
    'uttara_sector12': ['uttara', 'jashimuddin', 'azampur'],
    'uttara_sector13': ['uttara', 'jashimuddin', 'airport'],
    'uttara_sector14': ['jashimuddin', 'uttara', 'airport'],
    'uttara_university': ['uttara', 'abdullahpur', 'rajlakshmi'],
    'uttara_adhunik':    ['uttara', 'azampur', 'rajlakshmi'],
    'uttara_west_thana': ['uttara', 'abdullahpur', 'rajlakshmi'],
    'uttara_east_thana': ['rajlakshmi', 'uttara', 'azampur'],
    'uttara_fire_station':['uttara', 'abdullahpur', 'rajlakshmi'],

    // ── Badda / Rampura / East Dhaka ─────────────────────────────────────────
    'badda':           ['rampura', 'khilkhet', 'kuril'],
    'north_badda':     ['badda', 'kuril', 'rampura'],
    'south_badda':     ['badda', 'rampura', 'malibagh'],
    'aftab_nagar':     ['rampura', 'badda', 'khilgaon'],
    'banasree':        ['rampura', 'badda', 'malibagh'],
    'merul_badda':     ['badda', 'rampura', 'malibagh'],
    'vatara':          ['badda', 'kuril', 'khilkhet'],
    'natun_bazar':     ['badda', 'kuril', 'khilkhet'],
    'kalachadpur':     ['badda', 'gulshan_1', 'rampura'],
    'pragati_sarani':  ['badda', 'rampura', 'malibagh'],
    'hatirjheel':      ['rampura', 'mohakhali', 'malibagh'],
    'nikunja':         ['khilkhet', 'kuril', 'airport'],
    'nikunja2':        ['khilkhet', 'kuril', 'airport'],

    // ── Motijheel / Paltan / Gulistan ────────────────────────────────────────
    'motijheel':       ['paltan', 'gulistan', 'shahbag'],
    'naya_paltan':     ['paltan', 'motijheel', 'kakrail'],
    'bijoynagar':      ['paltan', 'motijheel', 'shahbag'],
    'dilkusha':        ['motijheel', 'paltan', 'gulistan'],
    'segunbagicha':    ['secretariat', 'paltan', 'motijheel'],
    'kakrail':         ['paltan', 'shantinagar', 'mogbazar'],

    // ── Jatrabari / South Dhaka ──────────────────────────────────────────────
    'tikatuli':        ['sayedabad', 'jatrabari', 'demra'],
    'dholpur':         ['jatrabari', 'sayedabad', 'demra'],
    'kadamtali':       ['jatrabari', 'sayedabad', 'demra'],
    'shyampur':        ['sayedabad', 'postogola', 'jatrabari'],
    'katherpool':      ['jatrabari', 'demra', 'sayedabad'],
    'demra':           ['jatrabari', 'sayedabad', 'demra'],
    'donia':           ['jatrabari', 'demra', 'sayedabad'],
    'matuail':         ['jatrabari', 'demra', 'sayedabad'],
    'mandail':         ['jatrabari', 'demra', 'sayedabad'],
    'dolaipar':        ['jatrabari', 'sayedabad', 'demra'],
    'rayerbag':        ['sayedabad', 'jatrabari', 'demra'],
    'bashabo':         ['jatrabari', 'khilgaon', 'malibagh'],
    'manda':           ['jatrabari', 'khilgaon', 'malibagh'],
    'mugda':           ['malibagh', 'khilgaon', 'rampura'],
    'meradia':         ['badda', 'khilgaon', 'malibagh'],
    'shiberbari':      ['jatrabari', 'sayedabad', 'demra'],

    // ── Farmgate / Tejgaon area ───────────────────────────────────────────────
    'tejturi_bazar':   ['farmgate', 'tejgaon', 'karwan_bazar'],
    'nakhalpara':      ['tejgaon', 'farmgate', 'karwan_bazar'],
    'begunbari':       ['tejgaon', 'karwan_bazar', 'farmgate'],
    'wasa':            ['karwan_bazar', 'farmgate', 'bijoy_sarani'],
    'moghbazar':       ['mogbazar', 'malibagh', 'shantinagar'],
    'modhubag':        ['malibagh', 'mogbazar', 'shantinagar'],
    'chairman_bari':   ['mohakhali', 'banani', 'gulshan_1'],

    // ── Old Dhaka ─────────────────────────────────────────────────────────────
    'hazaribagh':      ['lalbagh', 'mohammadpur', 'jigatola'],
    'islambagh':       ['lalbagh', 'jinjira', 'hazaribagh'],
    'kuratuli':        ['postogola', 'jatrabari', 'sayedabad'],

    // Educational Institutions
    'buet': ['shahbag', 'science_lab', 'palashi'],
    'medical_college': ['shahbag', 'science_lab', 'dhaka_university'],

    // Hospitals
    'dmch': ['medical_college', 'shahbag', 'secretariat'],
    'square_hospital': ['panthapath', 'mohammadpur', 'dhanmondi'],
    'labaid': ['dhanmondi', 'mohammadpur'],

    // Markets
    'karwan_bazar': ['farmgate', 'bijoy_sarani', 'mohakhali'],
    'kawran_bazar': ['farmgate', 'bijoy_sarani', 'mohakhali'],
    'gulistan': ['paltan', 'motijheel', 'dhaka_stadium'],
};

/**
 * Find nearby stations for a given station
 * @param stationId Station ID to find nearby stations for
 * @param maxDistance Maximum distance in meters (default: 2000m = 2km)
 * @returns Array of nearby station IDs sorted by distance
 */
export const findNearbyStations = (stationId: string, maxDistance: number = 2000): string[] => {
    // First, check if we have a predefined mapping
    if (NEARBY_STATIONS_MAP[stationId]) {
        return NEARBY_STATIONS_MAP[stationId];
    }

    // Otherwise, calculate based on distance
    const station = STATIONS[stationId];
    if (!station) return [];

    const nearby: { id: string; distance: number }[] = [];

    Object.values(STATIONS).forEach(otherStation => {
        if (otherStation.id === stationId) return; // Skip same station

        const distance = getDistance(
            { lat: station.lat, lng: station.lng },
            { lat: otherStation.lat, lng: otherStation.lng }
        );

        if (distance <= maxDistance) {
            nearby.push({ id: otherStation.id, distance });
        }
    });

    // Sort by distance and return IDs
    return nearby
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10) // Return top 10 nearest
        .map(item => item.id);
};

/**
 * Get display names for nearby stations (for showing to user)
 * @param stationIds Array of station IDs
 * @param maxCount Maximum number of names to return
 * @returns Formatted string of station names
 */
export const getNearbyStationNames = (stationIds: string[], maxCount: number = 3): string => {
    const names = stationIds
        .slice(0, maxCount)
        .map(id => STATIONS[id]?.name || id)
        .filter(Boolean);

    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;

    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
};
