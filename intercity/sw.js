const CACHE_NAME = 'intercity-go-v1';
const DYNAMIC_CACHE = 'intercity-go-dynamic-v1';

// Assets to pre-cache immediately
const PRE_CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/comprehensive-bangladesh-intercity-routes.json',
  '/data/bangladesh-intercity-routes.json'
];

// Install Event: Cache core static assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE_ASSETS);
    })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: The Core Caching Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Requests: Network Only (Let App.tsx handle offline errors)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. External CDNs (ESM, Tailwind, Leaflet, Fonts): Stale-While-Revalidate
  // This makes the app load instantly from cache, then update in background
  if (
    url.hostname.includes('esm.sh') ||
    url.hostname.includes('tailwindcss.com') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // Swallow errors for background updates if offline
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. General Strategy for local files: Cache First, fall back to Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache new local files visited
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});