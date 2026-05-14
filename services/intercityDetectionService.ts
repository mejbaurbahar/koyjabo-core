import { STATIONS } from '../constants';

// All Bangladesh places handled by the intercity app
const INTERCITY_PLACES: string[] = [
  // Divisions
  'Chattogram', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Barisal', 'Rangpur', 'Mymensingh',
  // Dhaka Division (non-Dhaka metro)
  'Faridpur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Mawa', 'Munshiganj',
  'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail', 'Aricha', 'Paturia', 'Bhairab', 'Ashuganj',
  // Chattogram Division
  'Bandarban', 'Brahmanbaria', 'Chandpur', 'Comilla', 'Cumilla', "Cox's Bazar", 'Cox Bazar',
  'Feni', 'Khagrachari', 'Lakshmipur', 'Noakhali', 'Rangamati', 'Teknaf', 'Sitakunda',
  'Mirsarai', 'Hathazari', 'Raozan', 'Laksam', 'Chandpur', 'Hajiganj',
  // Rajshahi Division
  'Bogura', 'Chapainawabganj', 'Joypurhat', 'Naogaon', 'Natore', 'Pabna', 'Sirajganj',
  'Ishwardi', 'Rajshahi',
  // Khulna Division
  'Bagerhat', 'Benapole', 'Chuadanga', 'Jashore', 'Jessore', 'Jhenaidah', 'Khulna', 'Kushtia',
  'Magura', 'Meherpur', 'Mongla', 'Narail', 'Satkhira', 'Daulatdia',
  // Barishal Division
  'Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Kuakata', 'Patuakhali', 'Pirojpur',
  // Sylhet Division
  'Habiganj', 'Moulvibazar', 'Sreemangal', 'Srimangal', 'Sunamganj', 'Sylhet', 'Jaflong',
  'Bichnakandi', 'Ratargul',
  // Rangpur Division
  'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon',
  // Mymensingh Division
  'Jamalpur', 'Netrokona', 'Sherpur',
  // Popular tourist spots
  "Saint Martin's Island", 'Saint Martin', 'Sajek', 'Sajek Valley', 'Tanguar Haor',
  'Nijhum Dwip', 'Sundarbans', 'Himchari', 'Inani Beach', 'Inani', 'Bandarban',
  'Mahasthangarh', 'Paharpur', 'Mainamati', 'Sonargaon', 'Lawachara',
];

// Build lowercase lookup for fast matching
const INTERCITY_LOWER = INTERCITY_PLACES.map(p => ({ name: p, lower: p.toLowerCase() }));

let localNamesCache: Array<{ name: string; lower: string }> | null = null;
const getLocalStationNames = () => {
  if (!localNamesCache) {
    localNamesCache = Object.values(STATIONS).map(s => ({
      name: s.name,
      lower: s.name.toLowerCase(),
    }));
  }
  return localNamesCache;
};

/**
 * Detects if a search query is an intercity destination (outside Dhaka's local bus network).
 * Returns the canonical destination name for use in the intercity app URL, or null if local.
 */
export const detectIntercityDestination = (query: string): string | null => {
  if (!query || query.trim().length < 3) return null;

  const lower = query.trim().toLowerCase();

  // First: if it closely matches a local Dhaka station, treat as local
  const localNames = getLocalStationNames();
  for (const { lower: sLower } of localNames) {
    // Exact or near-exact match to a Dhaka station → local
    if (sLower === lower || (sLower.includes(lower) && lower.length >= sLower.length * 0.75)) {
      return null;
    }
  }

  // Second: check against intercity destinations
  for (const { name, lower: placeLower } of INTERCITY_LOWER) {
    if (placeLower === lower || lower.includes(placeLower) || placeLower.includes(lower)) {
      return name;
    }
  }

  return null;
};

// District centers for finding the nearest city to user's GPS position
const DISTRICT_CENTERS: Array<{ name: string; lat: number; lng: number }> = [
  { name: 'Dhaka', lat: 23.8103, lng: 90.4125 },
  { name: 'Narayanganj', lat: 23.6238, lng: 90.5000 },
  { name: 'Gazipur', lat: 24.0958, lng: 90.4125 },
  { name: 'Tangail', lat: 24.2513, lng: 89.9167 },
  { name: 'Munshiganj', lat: 23.5422, lng: 90.5305 },
  { name: 'Manikganj', lat: 23.8644, lng: 90.0047 },
  { name: 'Narsingdi', lat: 23.9193, lng: 90.7202 },
  { name: 'Kishoreganj', lat: 24.4260, lng: 90.9821 },
  { name: 'Faridpur', lat: 23.6071, lng: 89.8429 },
  { name: 'Gopalganj', lat: 23.0051, lng: 89.8258 },
  { name: 'Madaripur', lat: 23.1641, lng: 90.1897 },
  { name: 'Rajbari', lat: 23.7574, lng: 89.6445 },
  { name: 'Shariatpur', lat: 23.2423, lng: 90.4348 },
  { name: 'Chattogram', lat: 22.3569, lng: 91.7832 },
  { name: 'Comilla', lat: 23.4607, lng: 91.1809 },
  { name: "Cox's Bazar", lat: 21.4272, lng: 92.0058 },
  { name: 'Brahmanbaria', lat: 23.9513, lng: 91.1147 },
  { name: 'Chandpur', lat: 23.2321, lng: 90.6631 },
  { name: 'Feni', lat: 23.0186, lng: 91.3966 },
  { name: 'Khagrachari', lat: 23.1116, lng: 91.9906 },
  { name: 'Lakshmipur', lat: 22.9447, lng: 90.8282 },
  { name: 'Noakhali', lat: 22.8724, lng: 91.0973 },
  { name: 'Rangamati', lat: 22.6533, lng: 92.1789 },
  { name: 'Bandarban', lat: 22.1953, lng: 92.2184 },
  { name: 'Sylhet', lat: 24.8949, lng: 91.8687 },
  { name: 'Habiganj', lat: 24.3749, lng: 91.4155 },
  { name: 'Moulvibazar', lat: 24.4829, lng: 91.7649 },
  { name: 'Sunamganj', lat: 25.0662, lng: 91.4073 },
  { name: 'Rajshahi', lat: 24.3636, lng: 88.6241 },
  { name: 'Bogura', lat: 24.8465, lng: 89.3775 },
  { name: 'Joypurhat', lat: 25.0968, lng: 89.0227 },
  { name: 'Naogaon', lat: 24.7936, lng: 88.9318 },
  { name: 'Natore', lat: 24.4206, lng: 89.0006 },
  { name: 'Chapainawabganj', lat: 24.5965, lng: 88.2775 },
  { name: 'Pabna', lat: 24.0063, lng: 89.2372 },
  { name: 'Sirajganj', lat: 24.4534, lng: 89.7008 },
  { name: 'Khulna', lat: 22.8456, lng: 89.5403 },
  { name: 'Bagerhat', lat: 22.6516, lng: 89.7859 },
  { name: 'Chuadanga', lat: 23.6402, lng: 88.8418 },
  { name: 'Jashore', lat: 23.1634, lng: 89.2182 },
  { name: 'Jhenaidah', lat: 23.5450, lng: 89.1726 },
  { name: 'Kushtia', lat: 23.9013, lng: 89.1204 },
  { name: 'Magura', lat: 23.4873, lng: 89.4198 },
  { name: 'Meherpur', lat: 23.7622, lng: 88.6318 },
  { name: 'Narail', lat: 23.1725, lng: 89.5127 },
  { name: 'Satkhira', lat: 22.7185, lng: 89.0705 },
  { name: 'Barishal', lat: 22.7010, lng: 90.3535 },
  { name: 'Barguna', lat: 22.1520, lng: 90.1181 },
  { name: 'Bhola', lat: 22.6859, lng: 90.6482 },
  { name: 'Jhalokati', lat: 22.6406, lng: 90.1987 },
  { name: 'Patuakhali', lat: 22.3596, lng: 90.3299 },
  { name: 'Pirojpur', lat: 22.5841, lng: 89.9720 },
  { name: 'Rangpur', lat: 25.7439, lng: 89.2752 },
  { name: 'Dinajpur', lat: 25.6217, lng: 88.6317 },
  { name: 'Gaibandha', lat: 25.3288, lng: 89.5281 },
  { name: 'Kurigram', lat: 25.8054, lng: 89.6362 },
  { name: 'Lalmonirhat', lat: 25.9165, lng: 89.4532 },
  { name: 'Nilphamari', lat: 25.9318, lng: 88.8561 },
  { name: 'Panchagarh', lat: 26.3373, lng: 88.5537 },
  { name: 'Thakurgaon', lat: 26.0337, lng: 88.4617 },
  { name: 'Mymensingh', lat: 24.7471, lng: 90.4203 },
  { name: 'Jamalpur', lat: 24.9375, lng: 89.9378 },
  { name: 'Netrokona', lat: 24.8710, lng: 90.7277 },
  { name: 'Sherpur', lat: 25.0205, lng: 90.0153 },
];

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Returns the name of the nearest district to the given GPS coordinates.
 * Used to auto-fill the "From" field when redirecting to the intercity app.
 */
export const getNearestDistrictFromCoords = (lat: number, lng: number): string => {
  let nearest = 'Dhaka';
  let minDist = Infinity;

  for (const center of DISTRICT_CENTERS) {
    const dLat = toRad(center.lat - lat);
    const dLng = toRad(center.lng - lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) * Math.cos(toRad(center.lat)) * Math.sin(dLng / 2) ** 2;
    const dist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (dist < minDist) {
      minDist = dist;
      nearest = center.name;
    }
  }

  return nearest;
};
