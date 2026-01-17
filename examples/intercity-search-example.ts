// Example Integration: Using the Complete Bangladesh Intercity Database

import intercityData from './data/comprehensive-bangladesh-intercity-routes.json';

// Type definition for routes
interface IntercityRoute {
    id: string;
    origin: string;
    destination: string;
    transportMode: 'train' | 'bus';
    operatorName: string;
    trainName?: string;
    duration: number;
    durationHuman: string;
    distance: number;
    frequency: number;
    prices: { className: string; currency: string; price: number; priceUSD: number }[];
    schedule: { departureTime: string; arrivalTime: string }[];
    externalLinks: { booking?: string; operator?: string };
}

// 1. Search routes between two cities
export function searchIntercityRoutes(origin: string, destination: string): IntercityRoute[] {
    return intercityData.routes.filter(
        (route: IntercityRoute) => route.origin === origin && route.destination === destination
    );
}

// 2. Filter by transport mode
export function getTrainRoutes(origin: string, destination: string): IntercityRoute[] {
    return searchIntercityRoutes(origin, destination).filter(r => r.transportMode === 'train');
}

export function getBusRoutes(origin: string, destination: string): IntercityRoute[] {
    return searchIntercityRoutes(origin, destination).filter(r => r.transportMode === 'bus');
}

// 3. Find cheapest route
export function getCheapestRoute(origin: string, destination: string): IntercityRoute | null {
    const routes = searchIntercityRoutes(origin, destination);
    if (routes.length === 0) return null;

    return routes.reduce((cheapest, route) => {
        const routeMinPrice = Math.min(...route.prices.map(p => p.price));
        const cheapestMinPrice = Math.min(...cheapest.prices.map(p => p.price));
        return routeMinPrice < cheapestMinPrice ? route : cheapest;
    });
}

// 4. Find fastest route
export function getFastestRoute(origin: string, destination: string): IntercityRoute | null {
    const routes = searchIntercityRoutes(origin, destination);
    if (routes.length === 0) return null;

    return routes.reduce((fastest, route) =>
        route.duration < fastest.duration ? route : fastest
    );
}

// 5. Get all available cities
export function getAllCities(): string[] {
    const cities = new Set<string>();
    intercityData.routes.forEach((route: IntercityRoute) => {
        cities.add(route.origin);
        cities.add(route.destination);
    });
    return Array.from(cities).sort();
}

// 6. Get routes from a city
export function getRoutesFromCity(city: string): IntercityRoute[] {
    return intercityData.routes.filter((route: IntercityRoute) => route.origin === city);
}

// 7. Get all operators
export function getAllOperators(): string[] {
    const operators = new Set<string>();
    intercityData.routes.forEach((route: IntercityRoute) => {
        operators.add(route.operatorName);
    });
    return Array.from(operators).sort();
}

// 8. Compare routes by price
export function compareRoutesByPrice(origin: string, destination: string) {
    const routes = searchIntercityRoutes(origin, destination);

    return routes.map(route => ({
        operator: route.operatorName,
        trainName: route.trainName,
        mode: route.transportMode,
        minPrice: Math.min(...route.prices.map(p => p.price)),
        maxPrice: Math.max(...route.prices.map(p => p.price)),
        duration: route.durationHuman,
        link: route.externalLinks.booking || route.externalLinks.operator
    })).sort((a, b) => a.minPrice - b.minPrice);
}

// EXAMPLE USAGE:

console.log('=== Bangladesh IntercityRoute Finder ===\n');

// Example 1: Search Dhaka to Cox's Bazar
console.log('1. Routes from Dhaka to Cox\'s Bazar:');
const dhakaToCoxs = searchIntercityRoutes('Dhaka', "Cox's Bazar");
console.log(`   Found ${dhakaToCoxs.length} routes`);
console.log(`   - Trains: ${getTrainRoutes('Dhaka', "Cox's Bazar").length}`);
console.log(`   - Buses: ${getBusRoutes('Dhaka', "Cox's Bazar").length}\n`);

// Example 2: Find cheapest option
const cheapest = getCheapestRoute('Dhaka', "Cox's Bazar");
if (cheapest) {
    const minPrice = Math.min(...cheapest.prices.map(p => p.price));
    console.log(`2. Cheapest option: ${cheapest.operatorName} (৳${minPrice})\n`);
}

// Example 3: Find fastest option
const fastest = getFastestRoute('Dhaka', "Cox's Bazar");
if (fastest) {
    console.log(`3. Fastest option: ${fastest.trainName || fastest.operatorName} (${fastest.durationHuman})\n`);
}

// Example 4: Show all cities covered
const allCities = getAllCities();
console.log(`4. Total cities covered: ${allCities.length}`);
console.log(`   ${allCities.slice(0, 10).join(', ')}...\n`);

// Example 5: Price comparison
console.log('5. Price comparison (Dhaka → Chittagong):');
const comp = compareRoutesByPrice('Dhaka', 'Chittagong');
comp.slice(0, 5).forEach(c => {
    console.log(`   ${c.operator}: ৳${c.minPrice}-${c.maxPrice} (${c.duration})`);
});

export default {
    searchIntercityRoutes,
    getTrainRoutes,
    getBusRoutes,
    getCheapestRoute,
    getFastestRoute,
    getAllCities,
    getRoutesFromCity,
    getAllOperators,
    compareRoutesByPrice
};
