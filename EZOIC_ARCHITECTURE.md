# 🏗️ Ezoic Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        koyjabo.com                              │
│                     Ezoic Integration                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      HTML Layer (Static)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  index.html, intercity/index.html, etc.                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │ <head>                                          │          │
│  │   <!-- 1. Privacy Scripts (FIRST) -->           │          │
│  │   <script src="cmp.gatekeeperconsent.com">     │          │
│  │                                                 │          │
│  │   <!-- 2. Ezoic Header Script -->              │          │
│  │   <script src="www.ezojs.com/sa.min.js">       │          │
│  │                                                 │          │
│  │   <!-- 3. Initialize ezstandalone -->          │          │
│  │   window.ezstandalone = { cmd: [] }            │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   TypeScript Service Layer                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  services/ezoicService.ts                                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │ class EzoicAdService {                          │          │
│  │   ├─ init()                                     │          │
│  │   ├─ showAds(...ids)                            │          │
│  │   ├─ destroyPlaceholders(...ids)                │          │
│  │   ├─ destroyAll()                                │          │
│  │   ├─ refreshForPageChange()                     │          │
│  │   ├─ waitForReady(timeout)                      │          │
│  │   └─ getPlacementStatus(id)                     │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
│  Export: ezoicService (singleton)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    React Component Layer                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  components/EzoicAd.tsx                                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │ <EzoicAd>                                       │          │
│  │   Props:                                        │          │
│  │   - placementId: number                         │          │
│  │   - className?: string                          │          │
│  │   - autoLoad?: boolean                          │          │
│  │   - onAdLoaded?: () => void                     │          │
│  │   - onAdError?: (Error) => void                 │          │
│  │                                                 │          │
│  │   Lifecycle:                                    │          │
│  │   1. Mount → Register placement                 │          │
│  │   2. Mount → Load ad (if autoLoad)              │          │
│  │   3. Unmount → Destroy ad                       │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │ <EzoicMultiAd>                                  │          │
│  │   Props:                                        │          │
│  │   - placementIds: number[]                      │          │
│  │   - orientation: 'vertical' | 'horizontal'      │          │
│  │   - className?: string                          │          │
│  │                                                 │          │
│  │   Loads multiple ads efficiently               │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      React Hooks Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  hooks/useEzoic.ts                                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │ useEzoic(options)                               │          │
│  │                                                 │          │
│  │ Options:                                        │          │
│  │   - autoRefresh?: boolean                       │          │
│  │   - autoLoadPlacements?: number[]               │          │
│  │   - onPageChange?: () => void                   │          │
│  │                                                 │          │
│  │ Returns:                                        │          │
│  │   - showAd(...ids)                              │          │
│  │   - destroyAd(...ids)                           │          │
│  │   - destroyAll()                                │          │
│  │   - refreshAds()                                │          │
│  │   - isReady()                                   │          │
│  │   - waitForReady(timeout)                       │          │
│  │   - getPlacementStatus(id)                      │          │
│  │   - loadedPlacements: number[]                  │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │ useEzoicPageChange(dependency)                  │          │
│  │                                                 │          │
│  │ For SPA route changes                           │          │
│  │ Auto-refreshes ads when dependency changes      │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Browser Window                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  window.ezstandalone                                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │ {                                               │          │
│  │   cmd: [() => void],                            │          │
│  │   showAds: (...ids: number[]) => void,          │          │
│  │   destroyPlaceholders: (...ids) => void,        │          │
│  │   destroyAll: () => void                        │          │
│  │ }                                               │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Ezoic Ad Server                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  www.ezojs.com                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐          │
│  │ Ad Selection Engine                             │          │
│  │   ├─ User profiling                              │          │
│  │   ├─ Ad bidding                                  │          │
│  │   ├─ Placement optimization                      │          │
│  │   └─ Revenue maximization                        │          │
│  └─────────────────────────────────────────────────┘          │
│                                                                 │
│  Returns: Ad creative + tracking                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Page Load
```
User visits page
      ↓
HTML loads privacy scripts (GDPR)
      ↓
HTML loads Ezoic header script
      ↓
window.ezstandalone initialized
      ↓
React app mounts
      ↓
Components/Hooks initialize
      ↓
Service layer ready
```

### 2. Ad Display
```
Component mounts
      ↓
Register placement with service
      ↓
Service calls ezstandalone.cmd.push()
      ↓
Ezoic processes request
      ↓
Ad server selects best ad
      ↓
Ad rendered in placeholder
      ↓
onAdLoaded callback fired (if provided)
```

### 3. Dynamic Content
```
User action (tab switch, load more, etc.)
      ↓
Component/Hook calls destroyAd()
      ↓
Service destroys old placements
      ↓
Content updated
      ↓
Component/Hook calls showAd()
      ↓
Service loads new ads
```

### 4. SPA Navigation
```
Route changes
      ↓
useEzoicPageChange hook triggered
      ↓
Service calls destroyAll()
      ↓
New page renders
      ↓
Service calls showAds()
      ↓
All ads refresh
```

## File Dependencies

```
index.html
  └─ Loads Ezoic scripts
       ↓
App.tsx
  └─ Imports EzoicAd component
       ↓
EzoicAd.tsx
  └─ Uses ezoicService
       ↓
ezoicService.ts
  └─ Interacts with window.ezstandalone
       ↓
window.ezstandalone
  └─ Communicates with Ezoic servers
```

## TypeScript Type Flow

```
types/ezoic.d.ts
  ├─ EzoicAdPlacement
  ├─ UseEzoicOptions
  ├─ UseEzoicReturn
  ├─ EzoicAdProps
  └─ EzoicMultiAdProps
       ↓
services/ezoicService.ts
  └─ Implements types
       ↓
components/EzoicAd.tsx
  └─ Uses typed props
       ↓
hooks/useEzoic.ts
  └─ Returns typed interface
```

## Deployment Flow

```
Local Development
  └─ npm run dev
       ↓
Build Process
  └─ npm run build
       ↓
Vercel Deployment
  └─ vercel --prod
       ↓
DNS Resolution
  └─ koyjabo.com
       ↓
ads.txt Redirect
  └─ Vercel rewrites rule
       ↓
Ezoic Manager
  └─ srv.adstxtmanager.com/19390/koyjabo.com
```

## Component Hierarchy

```
App
├── Homepage
│   ├── <EzoicAd placementId={101} />  ← Top Banner
│   ├── Content
│   │   └── <EzoicAd placementId={103} />  ← In-content
│   ├── Sidebar
│   │   └── <EzoicAd placementId={102} />  ← Sidebar
│   └── <EzoicAd placementId={104} />  ← Footer
│
├── BlogPage
│   ├── <EzoicAd placementId={201} />  ← Top
│   ├── Article
│   │   └── <EzoicAd placementId={202} />  ← Mid-content
│   └── <EzoicAd placementId={203} />  ← Bottom
│
└── SearchResults
    ├── <EzoicAd placementId={301} />  ← Above results
    ├── Results[]
    │   └── <EzoicAd placementId={302} />  ← Every 3rd
    └── <EzoicAd placementId={303} />  ← Below results
```

## Error Handling Flow

```
Component Error
      ↓
Try/Catch in component
      ↓
onAdError callback (if provided)
      ↓
Logged to console
      ↓
Service continues (graceful degradation)
```

## Performance Optimization

```
Multiple Ads
      ↓
Batched in single showAds() call
      ↓
Reduces server requests
      ↓
Faster page load
      ↓
Better user experience
```

---

## Key Integration Points

### 1. HTML Integration
- Privacy scripts load FIRST
- Header script loads async
- Scripts in correct order

### 2. Service Layer
- Singleton pattern
- Manages all ad operations
- Handles errors gracefully

### 3. Component Layer
- Clean React API
- Auto cleanup
- TypeScript support

### 4. Hook Layer
- SPA-friendly
- Auto-refresh
- Dynamic content support

### 5. Server Configuration
- ads.txt redirect
- Vercel/Apache config
- DNS setup

---

## Security & Privacy

```
User visits site
      ↓
Privacy scripts load (GDPR)
      ↓
User consent collected
      ↓
Consent passed to Ezoic
      ↓
Personalized ads (if consented)
      ↓
OR generic ads (if not consented)
```

---

**This architecture ensures:**
- ✅ Privacy compliance
- ✅ Clean separation of concerns
- ✅ Type safety
- ✅ Reusability
- ✅ Performance
- ✅ Maintainability
