/**
 * Bangladesh Intercity Route Data Collector
 * 
 * This script helps collect intercity route data from official sources:
 * - Bangladesh Railway (train routes)
 * - BRTC (bus routes)
 * - Major bus operators (Shyamoli, Green Line, etc.)
 * - Airline routes
 * 
 * Data Sources:
 * - eticket.railway.gov.bd (Bangladesh Railway official site)
 * - brtc.gov.bd (Bangladesh Road Transport Corporation)
 * - Individual bus operator websites
 * - Public transit APIs
 */

interface IntercityRoute {
    id: string;
    origin: string;
    destination: string;
    transportMode: 'train' | 'bus' | 'air' | 'ferry';
    operatorName: string;
    operatorCode?: string;
    duration: number; // in minutes
    distance: number; // in kilometers
    frequency?: number; // departures per day
    operatingDays?: string[]; // ['Mon', 'Tue', ...]
    prices: {
        className: string;
        currency: string;
        price: number;
        nativePrice?: number;
        nativeCurrency?: string;
    }[];
    schedule?: {
        departureTime: string;
        arrivalTime: string;
    }[];
    stopover?: string[];
    externalLinks?: {
        booking?: string;
        schedules?: string;
        operator?: string;
    };
}

/**
 * Major cities and districts in Bangladesh to collect route data for
 */
export const bangladeshCities = [
    // Divisions
    { name: 'Dhaka', lat: 23.8103, lng: 90.4125, type: 'capital' },
    { name: 'Chittagong', lat: 22.3569, lng: 91.7832, type: 'city' },
    { name: 'Sylhet', lat: 24.8949, lng: 91.8687, type: 'city' },
    { name: 'Rajshahi', lat: 24.3745, lng: 88.6042, type: 'city' },
    { name: 'Khulna', lat: 22.8456, lng: 89.5403, type: 'city' },
    { name: 'Barisal', lat: 22.7010, lng: 90.3535, type: 'city' },
    { name: 'Rangpur', lat: 25.7439, lng: 89.2752, type: 'city' },
    { name: 'Mymensingh', lat: 24.7471, lng: 90.4203, type: 'city' },

    // Major tourist/commercial destinations
    { name: "Cox's Bazar", lat: 21.4272, lng: 92.0058, type: 'tourist' },
    { name: 'Bandarban', lat: 22.1953, lng: 92.2184, type: 'tourist' },
    { name: 'Sundarbans', lat: 21.9497, lng: 89.1833, type: 'tourist' },
    { name: 'Kuakata', lat: 21.8175, lng: 90.1166, type: 'tourist' },
    { name: 'Srimangal', lat: 24.3065, lng: 91.7296, type: 'tourist' },

    // Important transit hubs
    { name: 'Comilla', lat: 23.4607, lng: 91.1809, type: 'city' },
    { name: 'Jessore', lat: 23.1634, lng: 89.2182, type: 'city' },
    { name: 'Bogra', lat: 24.8465, lng: 89.3770, type: 'city' },
    { name: 'Dinajpur', lat: 25.6279, lng: 88.6332, type: 'city' },
    { name: 'Tangail', lat: 24.2513, lng: 89.9167, type: 'city' },
    { name: 'Narayanganj', lat: 23.6238, lng: 90.5000, type: 'city' },
];

/**
 * Bangladesh Railway routes - data from official eticket.railway.gov.bd
 */
export const trainRoutes: IntercityRoute[] = [
    {
        id: 'bd-train-001',
        origin: 'Dhaka',
        destination: "Cox's Bazar",
        transportMode: 'train',
        operatorName: 'Bangladesh Railway',
        operatorCode: '_BANGLADESH_RAILWAY',
        duration: 510, // 8.5 hours
        distance: 418,
        frequency: 2, // Parjotak Express, Cox's Bazar Express
        operatingDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        prices: [
            { className: 'Shovan chair (S_CHAIR)', currency: 'USD', price: 3, nativePrice: 390, nativeCurrency: 'BDT' },
            { className: '1st class seat (F_SEAT)', currency: 'USD', price: 4, nativePrice: 460, nativeCurrency: 'BDT' },
            { className: 'Snigdha', currency: 'USD', price: 6, nativePrice: 750, nativeCurrency: 'BDT' },
            { className: 'AC class seat (AC_S)', currency: 'USD', price: 8, nativePrice: 1000, nativeCurrency: 'BDT' },
            { className: '1st class berth (F_BERTH)', currency: 'USD', price: 10, nativePrice: 1300, nativeCurrency: 'BDT' },
            { className: 'AC class berth (AC_B)', currency: 'USD', price: 18, nativePrice: 2100, nativeCurrency: 'BDT' },
        ],
        schedule: [
            { departureTime: '19:50', arrivalTime: '04:20+1' },
            { departureTime: '20:10', arrivalTime: '04:40+1' },
        ],
        externalLinks: {
            booking: 'https://eticket.railway.gov.bd/',
            operator: 'https://railway.gov.bd/',
        }
    },
    // Add more train routes here based on Bangladesh Railway data
];

/**
 * Bus routes - data from BRTC and major operators
 */
export const busRoutes: IntercityRoute[] = [
    {
        id: 'bd-bus-001',
        origin: "Cox's Bazar",
        destination: 'Dhaka',
        transportMode: 'bus',
        operatorName: 'Shyamoli NR Travels',
        operatorCode: '_SHYAMOLI_NR_TRAVELS_202301061846',
        duration: 600, // 10 hours
        distance: 375,
        frequency: 8, // Multiple departures throughout the day
        operatingDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        prices: [
            { className: 'Non AC (E Class)', currency: 'USD', price: 9, nativePrice: 1150, nativeCurrency: 'BDT' },
            { className: 'AC (B Class)', currency: 'USD', price: 18, nativePrice: 2300, nativeCurrency: 'BDT' },
            { className: 'Seater', currency: 'USD', price: 16, nativePrice: 2000, nativeCurrency: 'BDT' },
        ],
        schedule: [
            { departureTime: '11:00', arrivalTime: '21:00' },
            { departureTime: '14:00', arrivalTime: '00:00+1' },
            { departureTime: '17:30', arrivalTime: '03:30+1' },
            { departureTime: '23:10', arrivalTime: '09:10+1' },
        ],
        externalLinks: {
            booking: 'https://www.shyamoliparibahan-bd.com/',
            operator: 'https://www.shyamoliparibahan-bd.com/',
        }
    },
    // Add more bus routes
];

/**
 * Data collection guidelines from official sources
 */
export const dataCollectionSources = {
    trains: {
        primary: 'https://eticket.railway.gov.bd/',
        notes: 'Official Bangladesh Railway e-ticketing portal - publicly accessible route and price information',
    },
    buses: {
        brtc: 'https://brtc.gov.bd/',
        shyamoli: 'https://www.shyamoliparibahan-bd.com/',
        greenLine: 'https://www.greenlinebd.com/',
        hanif: 'https://www.hanifenterprise.com/',
        notes: 'Data from official operator websites - route schedules and fares are publicly listed',
    },
    airlines: {
        biman: 'https://www.biman-airlines.com/',
        usb: 'http://www.usbair.com/',
        novo: 'https://flynovoair.com/',
        notes: 'Domestic flight routes and approximate fares',
    },
    ferries: {
        biwtc: 'http://www.biwtc.gov.bd/',
        notes: 'Bangladesh Inland Water Transport Corporation',
    }
};

/**
 * Example: How to structure collected data for your app
 */
export function createIntercityRouteEntry(data: Partial<IntercityRoute>): IntercityRoute {
    return {
        id: data.id || `bd-${data.transportMode}-${Date.now()}`,
        origin: data.origin || '',
        destination: data.destination || '',
        transportMode: data.transportMode || 'bus',
        operatorName: data.operatorName || '',
        operatorCode: data.operatorCode,
        duration: data.duration || 0,
        distance: data.distance || 0,
        frequency: data.frequency,
        operatingDays: data.operatingDays || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        prices: data.prices || [],
        schedule: data.schedule,
        stopover: data.stopover,
        externalLinks: data.externalLinks,
    };
}

/**
 * Save collected data to JSON file
 */
export async function saveIntercityData(routes: IntercityRoute[], filename: string) {
    const fs = require('fs');
    const path = require('path');

    const dataPath = path.join(__dirname, '..', 'data', filename);
    const jsonData = JSON.stringify({
        lastUpdated: new Date().toISOString(),
        totalRoutes: routes.length,
        routes: routes,
    }, null, 2);

    fs.writeFileSync(dataPath, jsonData, 'utf-8');
    console.log(`✅ Saved ${routes.length} routes to ${dataPath}`);
}

// Example usage:
if (require.main === module) {
    const allRoutes = [...trainRoutes, ...busRoutes];
    console.log(`📊 Total intercity routes collected: ${allRoutes.length}`);
    console.log(`\n📋 Data sources to manually collect from:`);
    console.log(JSON.stringify(dataCollectionSources, null, 2));
}
