import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';



export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/intercity': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          bypass(req) {
            if (req.url?.startsWith('/intercity-hub')) {
              return req.url;
            }
            // Let Vite handle TypeScript/JavaScript source file imports directly
            if (req.url && (req.url.endsWith('.ts') || req.url.endsWith('.tsx') || req.url.endsWith('.js'))) {
              return req.url;
            }
          }
        },
        '/api/ai': {
          target: 'https://koyjabo-backend.onrender.com',
          changeOrigin: true,
        },
        '/api/routes': {
          target: 'https://koyjabo-backend.onrender.com',
          changeOrigin: true,
        },
        '/api/trains': {
          target: 'https://koyjabo-backend.onrender.com',
          changeOrigin: true,
        },
        '/api/notifications': {
          target: 'https://koyjabo-backend.onrender.com',
          changeOrigin: true,
        },
        '/api/stats': {
          target: 'https://koyjabo-backend.onrender.com',
          changeOrigin: true,
        }
      }
    },
    plugins: [
      react(),

      viteStaticCopy({
        targets: [
          {
            src: 'intercity/dist/**/*',
            dest: 'intercity'
          }
        ]
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'logo.png', 'offline-styles.css', 'manifest.json'],
        injectRegister: 'auto',
        manifest: {
          id: '/',
          name: 'কই যাবো',
          short_name: 'কই যাবো',
          description: 'Find Dhaka bus routes instantly! 200+ buses, metro rail guide, AI assistant, and fare calculator.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          lang: 'bn',
          dir: 'ltr',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png'
            }
          ],
          screenshots: [
            {
              src: '/mobile-screenshot.png',
              sizes: '1170x2532',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Home Screen Mobile'
            },
            {
              src: '/og-image.png',
              sizes: '1200x630',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Home Screen Desktop'
            }
          ]
        },
        workbox: {

          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,json,woff,woff2,ttf,webmanifest,manifest,webp,jpg,jpeg,gif,txt,xml}',
            'intercity/**/*.{js,css,html,ico,png,svg,json,woff,woff2,ttf,webmanifest,manifest,txt,xml}',
            'data/**/*.json'  // Include all JSON data files for offline
          ],
          navigateFallback: 'index.html',  // Enable automatic fallback to index.html for SPA offline support
          navigateFallbackDenylist: [/^\/api/, /^\/intercity/, /^\/ads\.txt/, /^\/robots\.txt/, /^\/sitemap\.xml/],
          cleanupOutdatedCaches: true,
          // Inline the workbox runtime instead of loading from CDN
          mode: 'production',
          sourcemap: false,
          skipWaiting: true,
          clientsClaim: true,
          // Cache versioning for proper updates
          cacheId: 'dhaka-commute-v38',
          maximumFileSizeToCacheInBytes: 10485760, // 10 MB

          runtimeCaching: [
            // Google AdSense / DoubleClick — ALWAYS NetworkOnly; never cache ad scripts or impressions
            {
              urlPattern: /^https:\/\/(?:pagead2|adservice|partner|tpc)\.googlesyndication\.com\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/googlesyndication\.com\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/(?:googleads|doubleclick)\.(?:g\.doubleclick\.net|net)\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/www\.googletagservices\.com\/.*/i,
              handler: 'NetworkOnly',
            },

            // Cache Intercity App - StaleWhileRevalidate: serve from cache instantly, update in background
            {
              urlPattern: ({ request, url }) => {
                return request.destination === 'document' && url.pathname.startsWith('/intercity');
              },
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'intercity-pages',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 30 * 24 * 60 * 60
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Main App - StaleWhileRevalidate: serve from cache instantly, update in background
            {
              urlPattern: ({ request, url }) => {
                const isIntercity = url.pathname.startsWith('/intercity');
                const isApi = url.pathname.startsWith('/api');
                return request.destination === 'document' && !isIntercity && !isApi;
              },
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'main-pages',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 7 * 24 * 60 * 60
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Static Assets - Cache First (Offline First Strategy)
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Tailwind CSS CDN - Critical for offline styling
            {
              urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'tailwind-cdn-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Google Fonts Stylesheets
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Google Fonts Files
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // AI Studio CDN (React, Lucide, etc.)
            {
              urlPattern: /^https:\/\/aistudiocdn\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'aistudio-cdn-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Critical Offline Assets (Manifest, Offline CSS) - StaleWhileRevalidate for reliability
            {
              urlPattern: /^(?:.*\/)?(?:manifest\.json|offline-styles\.css)(?:\?.*)?$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'critical-offline-assets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 24 * 60 * 60 // 1 day
                }
              }
            },
            // Local Assets (Styles, Scripts, Data JSON) - CacheFirst for instant offline
            // Hashed filenames change on content change, so CacheFirst is safe
            {
              urlPattern: /\.(?:js|css|json)(?:\?.*)?$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'local-assets-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Vite Client & HMR - Attempt to cache to prevent console errors offline
            {
              urlPattern: /(?:@vite\/client|@react-refresh)/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'vite-client-cache',
                expiration: {
                  maxEntries: 5,
                  maxAgeSeconds: 24 * 60 * 60
                }
              }
            },
            // API Calls - Network First with Cache Fallback
            {
              urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 5 * 60, // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              }
            },
            // OSRM road routing - NetworkFirst, cache responses for offline fallback
            {
              urlPattern: /^https:\/\/router\.project-osrm\.org\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'osrm-route-cache',
                networkTimeoutSeconds: 8,
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              }
            },
            // GitHub API (user data reads) - NetworkFirst with long fallback cache
            {
              urlPattern: /^https:\/\/api\.github\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'github-api-cache',
                networkTimeoutSeconds: 8,
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 24 * 60 * 60, // 24 hours fallback
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              }
            },
            // Raw GitHub content (CDN) - StaleWhileRevalidate
            {
              urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'github-raw-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60, // 1 hour
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              }
            },
            // ipify (IP detection for device login) - NetworkFirst, short cache
            {
              urlPattern: /^https:\/\/api\.ipify\.org\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'ipify-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 5,
                  maxAgeSeconds: 5 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              }
            },
            // Map Tiles - Cache Heavy (Offline Maps)
            {
              urlPattern: /^https:\/\/(?:.*\.tile\.openstreetmap\.org|.*\.google\.com\/vt|.*\.basemaps\.cartocdn\.com)\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'map-tiles-cache',
                expiration: {
                  maxEntries: 10000, // Massive capacity for offline maps
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: 'index.html',
          suppressWarnings: true,
        }
      })
    ],
    publicDir: 'public',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      emptyOutDir: true,
        rollupOptions: {
          output: {
            assetFileNames: 'assets/[name]-[hash].[ext]',
            manualChunks: {
              leaflet: ['leaflet'],
              vendor: ['react', 'react-dom', 'lucide-react']
            }
          }
        },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY_1': JSON.stringify(env.GEMINI_API_KEY_1 || env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY_2': JSON.stringify(env.GEMINI_API_KEY_2 || ''),
      'process.env.GEMINI_API_KEY_3': JSON.stringify(env.GEMINI_API_KEY_3 || ''),
      'process.env.GEMINI_API_KEY_4': JSON.stringify(env.GEMINI_API_KEY_4 || ''),
      'process.env.GEMINI_API_KEY_5': JSON.stringify(env.GEMINI_API_KEY_5 || ''),
      // TomTom API keys for real-time traffic data
      'import.meta.env.VITE_TOMTOM_API_KEY_1': JSON.stringify(env.VITE_TOMTOM_API_KEY_1 || ''),
      'import.meta.env.VITE_TOMTOM_API_KEY_2': JSON.stringify(env.VITE_TOMTOM_API_KEY_2 || ''),
      // GitHub repo/token are server-side only — handled by api/gh.ts proxy
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom']
    }
  };
});
