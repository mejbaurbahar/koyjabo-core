/**
 * Offline Map Tile Pre-Cacher
 * 
 * This utility pre-downloads OpenStreetMap tiles for the Dhaka area
 * so the map works perfectly offline.
 * 
 * Dhaka coordinates: 23.60 to 24.10 N, 90.20 to 90.60 E
 */

interface TileCoords {
    x: number;
    y: number;
    z: number;
}

// Convert lat/lng to tile coordinates
function latLngToTile(lat: number, lng: number, zoom: number): TileCoords {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x, y, z: zoom };
}

// Generate tile URLs for a bounding box
function getTilesInBounds(minLat: number, maxLat: number, minLng: number, maxLng: number, zoom: number): string[] {
    const topLeft = latLngToTile(maxLat, minLng, zoom);
    const bottomRight = latLngToTile(minLat, maxLng, zoom);

    const tiles: string[] = [];
    const subdomains = ['a', 'b', 'c'];

    for (let x = topLeft.x; x <= bottomRight.x; x++) {
        for (let y = topLeft.y; y <= bottomRight.y; y++) {
            const subdomain = subdomains[(x + y) % 3];
            tiles.push(`https://${subdomain}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`);
        }
    }

    return tiles;
}

// Dhaka bounds
const DHAKA_BOUNDS = {
    minLat: 23.60,
    maxLat: 24.10,
    minLng: 90.20,
    maxLng: 90.60
};

// Pre-cache tiles for Dhaka at multiple zoom levels
export async function precacheDhakaMapTiles(
    onProgress?: (current: number, total: number) => void
): Promise<void> {
    // Zoom levels to cache (11-15 covers Dhaka area well)
    // Lower zoom = fewer tiles but less detail
    // Higher zoom = more tiles but more detail
    const zoomLevels = [11, 12, 13, 14, 15];

    const allTiles: string[] = [];

    // Generate all tile URLs
    for (const zoom of zoomLevels) {
        const tiles = getTilesInBounds(
            DHAKA_BOUNDS.minLat,
            DHAKA_BOUNDS.maxLat,
            DHAKA_BOUNDS.minLng,
            DHAKA_BOUNDS.maxLng,
            zoom
        );
        allTiles.push(...tiles);
    }


    // Cache tiles in batches to avoid overwhelming the browser
    const batchSize = 50;
    let cached = 0;

    for (let i = 0; i < allTiles.length; i += batchSize) {
        const batch = allTiles.slice(i, i + batchSize);

        // Fetch and cache each tile in the batch
        await Promise.all(
            batch.map(async (url) => {
                try {
                    const response = await fetch(url, {
                        mode: 'cors',
                        cache: 'force-cache'
                    });

                    if (response.ok) {
                        // The service worker will automatically cache this
                        cached++;
                        if (onProgress) {
                            onProgress(cached, allTiles.length);
                        }
                    }
                } catch (error) {
                }
            })
        );

        // Small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

}

// Check if tiles are cached
export async function checkOfflineMapStatus(): Promise<{
    hasCachedTiles: boolean;
    cacheSize: number;
}> {
    try {
        if ('caches' in window) {
            const cache = await caches.open('map-tiles-cache');
            const keys = await cache.keys();
            const mapTiles = keys.filter(key => key.url.includes('tile.openstreetmap.org'));

            return {
                hasCachedTiles: mapTiles.length > 0,
                cacheSize: mapTiles.length
            };
        }
    } catch (error) {
    }

    return { hasCachedTiles: false, cacheSize: 0 };
}

// Auto-cache tiles when online (runs in background)
export function autoPreloadMapTiles() {
    if (!navigator.onLine) {
        return;
    }

    // Check if we've already preloaded recently
    const lastPreload = localStorage.getItem('map_tiles_preloaded');
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    if (lastPreload && parseInt(lastPreload) > oneWeekAgo) {
        return;
    }

    // Preload in the background
    setTimeout(() => {
        precacheDhakaMapTiles((current, total) => {
            if (current % 100 === 0) {
            }
        }).then(() => {
            localStorage.setItem('map_tiles_preloaded', Date.now().toString());
        });
    }, 5000); // Wait 5 seconds after page load to start
}

// Manual download button helper
export function startManualMapDownload(
    onProgress: (current: number, total: number, percent: number) => void,
    onComplete: () => void
) {
    precacheDhakaMapTiles((current, total) => {
        const percent = Math.round((current / total) * 100);
        onProgress(current, total, percent);
    }).then(() => {
        localStorage.setItem('map_tiles_preloaded', Date.now().toString());
        onComplete();
    });
}
