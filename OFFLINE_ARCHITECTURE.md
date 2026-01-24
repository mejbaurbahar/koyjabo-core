# 🏗️ Offline Architecture - Technical Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         KOY JABO APP                             │
│                     (Progressive Web App)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼────────┐  ┌──────▼───────┐
            │  Online Mode   │  │ Offline Mode │
            │  (Internet ✓)  │  │ (No Internet)│
            └───────┬────────┘  └──────┬───────┘
                    │                   │
     ┌──────────────┴─────────┬────────┴──────────────┐
     │                        │                        │
┌────▼─────┐          ┌──────▼──────┐         ┌──────▼──────┐
│  Fetch   │          │    Cache    │         │  Retrieve   │
│  Fresh   │──────────│    Data     │◄────────│  from Cache │
│  Data    │          │             │         │             │
└──────────┘          └─────────────┘         └─────────────┘
```

---

## Data Flow Diagram

### 🌐 First Visit (Online)

```
User Visits koyjabo.live
         │
         ▼
    ┌────────────────────────────────────────┐
    │   Enhanced Offline Support Initializes │
    └────────────┬───────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │  Fetch & Cache Data:    │
    └────────────┬────────────┘
                 │
    ┌────────────┼────────────────────────┬──────────────┐
    │            │                        │              │
    ▼            ▼                        ▼              ▼
┌─────────┐ ┌─────────┐            ┌──────────┐  ┌──────────┐
│  Buses  │ │  Metro  │            │Intercity │  │ Stations │
│  200+   │ │  Data   │            │ Routes   │  │  300+    │
└────┬────┘ └────┬────┘            └────┬─────┘  └────┬─────┘
     │           │                      │             │
     │           │                      │             │
     └───────────┴──────────┬───────────┴─────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   localStorage +      │
                │   Service Worker      │
                │   Cache Storage       │
                └───────────┬───────────┘
                            │
                            ▼
                    ✅ Ready for Offline!
```

### 📴 Subsequent Visits (Offline)

```
User Opens App (Offline)
         │
         ▼
┌─────────────────────┐
│ Check Cache Status  │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │ Cache Found?│
    └──────┬──────┘
           │
    ┌──────┴──────────────────┐
    │  YES               NO   │
    │                         │
    ▼                         ▼
┌─────────────────┐   ┌─────────────┐
│ Load from Cache │   │ Show Warning│
│ Instantly! ⚡   │   │ "Visit once"│
└────────┬────────┘   └─────────────┘
         │
         ▼
┌──────────────────────────┐
│  Check Cache Freshness   │
└────────┬─────────────────┘
         │
    ┌────┴──────┐
    │ < 7 days? │
    └────┬──────┘
         │
┌────────┴───────────┐
│  YES          NO   │
│                    │
▼                    ▼
Show:                Show:
"✅ All OK"          "⚠️ Data old"
                     (Still works!)
         │
         │
         ▼
┌─────────────────────┐
│  Render Full App    │
│  All Features Work! │
└─────────────────────┘
```

---

## Cache Strategy Flowchart

```
┌────────────────────┐
│  Request Resource  │
└─────────┬──────────┘
          │
    ┌─────▼──────────────────────────┐
    │  What type of resource?        │
    └─────┬──────────────────────────┘
          │
┌─────────┼────────────────────┬────────────────┐
│         │                    │                │
▼         ▼                    ▼                ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Image/  │  │   HTML   │  │   API    │  │   Map    │
│  Font    │  │   JS/CSS │  │   Call   │  │   Tiles  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │
     ▼             ▼             ▼             ▼
CacheFirst   NetworkFirst   NetworkFirst   CacheFirst
(Forever)    (2s timeout)   (10s timeout)   (1 year)
     │             │             │             │
     └─────────────┴─────────────┴─────────────┘
                   │
                   ▼
        ┌──────────────────┐
        │ Return to User   │
        └──────────────────┘
```

---

## Storage Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Browser Storage                       │
└──────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────────┐   ┌──────────────────┐
│  localStorage     │   │ Service Worker   │
│  (~4 MB)          │   │ Cache Storage    │
└───────┬───────────┘   └────────┬─────────┘
        │                        │
        │                        │
┌───────┴────────────────┬───────┴─────────────┐
│                        │                      │
▼                        ▼                      ▼
┌──────────────┐  ┌────────────┐      ┌────────────┐
│ Bus Data     │  │ HTML/JS/CSS│      │ Map Tiles  │
│ ~500 KB      │  │ ~1 MB      │      │ Variable   │
├──────────────┤  ├────────────┤      ├────────────┤
│ Metro Data   │  │ Images     │      │ 100-10000  │
│ ~50 KB       │  │ ~500 KB    │      │ tiles      │
├──────────────┤  ├────────────┤      │            │
│ Intercity    │  │ Fonts      │      │ ~5-50 MB   │
│ ~2 MB        │  │ ~200 KB    │      │            │
├──────────────┤  └────────────┘      └────────────┘
│ Stations     │
│ ~200 KB      │
└──────────────┘

Total: ~4-6 MB base + map tiles
```

---

## Component Interaction

```
┌────────────────────────────────────────────────┐
│                   App.tsx                      │
│  ┌──────────────────────────────────────────┐ │
│  │  Offline Detection (navigator.onLine)    │ │
│  └────────────┬─────────────────────────────┘ │
│               │                                │
│               ▼                                │
│  ┌──────────────────────────────────────────┐ │
│  │     Enhanced Offline Support Service     │ │
│  │  • initializeOfflineSupport()            │ │
│  │  • getOfflineFeatureStatus()             │ │
│  │  • cacheAllEssentialData()               │ │
│  └────────────┬─────────────────────────────┘ │
│               │                                │
└───────────────┼────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
┌───────────────┐    ┌─────────────────┐
│ Offline       │    │  Service Worker │
│ Indicator     │    │  (vite-pwa)     │
│ Component     │    │                 │
└───────┬───────┘    └────────┬────────┘
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌────────────────┐
│ Shows Status to  │  │ Handles Asset  │
│ User:            │  │ Caching        │
│ • ✅ All OK      │  │ • Preaching    │
│ • ⚠️ Stale       │  │ • Runtime      │
│ • ❌ No Cache    │  │ • Updates      │
└──────────────────┘  └────────────────┘
```

---

## Feature Availability Matrix

```
┌──────────────────────────────────────────────────────┐
│  Feature              Online    Offline    Requires  │
├──────────────────────────────────────────────────────┤
│  Bus Search            ✅        ✅         Cache    │
│  Metro Guide           ✅        ✅         Cache    │
│  Intercity Routes      ✅        ✅         Cache    │
│  Fare Calculator       ✅        ✅         Cache    │
│  Route Planner         ✅        ✅         Cache    │
│  AI Assistant          ✅        ✅         Cache    │
│  Maps                  ✅        ✅         Tiles    │
│  History               ✅        ✅         Local    │
│  Favorites             ✅        ✅         Local    │
│  Blog                  ✅        ✅         Cache    │
│  Settings              ✅        ✅         Local    │
├──────────────────────────────────────────────────────┤
│  Live Tracking         ✅        ❌         Internet │
│  Real-time Updates     ✅        ❌         Internet │
│  Weather               ✅        ❌         Internet │
└──────────────────────────────────────────────────────┘

Legend:
✅ = Fully Available
❌ = Not Available
```

---

## Offline State Machine

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌──────────────────┐      YES    ┌─────────────┐
│ navigator.onLine?├─────────────►│ ONLINE MODE │
└──────┬───────────┘              └──────┬──────┘
       │ NO                              │
       ▼                                 │
┌──────────────────┐                     │
│ Check Cache      │                     │
└──────┬───────────┘                     │
       │                                 │
   ┌───┴────┐                            │
   │ Exists?│                            │
   └───┬────┘                            │
       │                                 │
  ┌────┴─────┐                           │
  │YES    NO │                           │
  │          │                           │
  ▼          ▼                           │
┌────┐  ┌────────┐                       │
│ OK │  │WARNING │                       │
└─┬──┘  └───┬────┘                       │
  │         │                            │
  └─────────┴────────────────────────────┘
              │
              ▼
        ┌───────────┐
        │ SHOW APP  │
        └───────────┘
```

---

## Performance Metrics

```
┌────────────────────────────────────────────────┐
│           Load Performance                     │
├────────────────────────────────────────────────┤
│                                                │
│  Online (First Visit):                         │
│  │████████████████│ 2-3 seconds                │
│                                                │
│  Online (Repeat Visit - Cached):               │
│  │███│ 300-500ms                               │
│                                                │
│  Offline (Cached):                             │
│  │█│ 50-100ms                                  │
│                                                │
│  Speed Improvement: 20-30x faster! ⚡          │
│                                                │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│           Data Usage                           │
├────────────────────────────────────────────────┤
│                                                │
│  Online Mode (per session):                    │
│  Data: ~5 MB                                   │
│                                                │
│  Offline Mode (per session):                   │
│  Data: 0 MB (100% saved!)                      │
│                                                │
│  Monthly Savings (20 uses):                    │
│  ~100 MB saved! 💰                             │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌───────────────────────────────────────────────────┐
│                  Production                       │
└─────────────────────┬─────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
    ┌──────────┐          ┌──────────────┐
    │   CDN    │          │  Static Host │
    │(Vercel/  │          │ (GitHub Pages│
    │ Netlify) │          │  /Render)    │
    └────┬─────┘          └──────┬───────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────┐
│         User's Browser              │
│  ┌───────────────────────────────┐  │
│  │      Service Worker           │  │
│  │  • Intercepts All Requests    │  │
│  │  • Serves from Cache          │  │
│  │  • Falls back to Network      │  │
│  └───────────────────────────────┘  │
│                                     │
│  Cache Storage (Service Worker)     │
│  + localStorage (App Data)          │
└─────────────────────────────────────┘
         ▲
         │
         │ All requests go through SW
         │ Offline = Serve from Cache
         │ Online = Cache + Network
         │
    ┌────┴─────┐
    │   USER   │
    └──────────┘
```

---

**Technical Stack:**
- **PWA**: Vite + React + TypeScript
- **Caching**: Service Worker (Workbox) + localStorage
- **Offline**: Enhanced Offline Support Service
- **UI**: Tailwind CSS + Lucide Icons
- **Build**: Vite with PWA Plugin

**Browser Support:**
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox
- ✅ Safari (iOS & macOS)
- ✅ Edge
- ✅ Opera

**Storage Requirements:**
- Minimum: 10 MB available storage
- Recommended: 50 MB for full map caching

---

*Last Updated: January 24, 2026*
*Architecture Version: 3.0*
