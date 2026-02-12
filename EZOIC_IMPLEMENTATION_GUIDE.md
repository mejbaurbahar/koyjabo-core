# 🎯 Ezoic Ads Implementation Guide for koyjabo.com

## 📋 Table of Contents
1. [Step 1: Site Integration](#step-1-site-integration)
2. [Step 2: Ads.txt Setup](#step-2-adstxt-setup)
3. [Step 3: Ad Placements](#step-3-ad-placements)
4. [Advanced Features](#advanced-features)
5. [Troubleshooting](#troubleshooting)

---

## ✅ Step 1: Site Integration

### Status: **COMPLETE** ✓

Ezoic scripts have been integrated into ALL your HTML files:
- ✓ `index.html` (Main app)
- ✓ `intercity/index.html` 
- ✓ `intercity-route-finder/index.html`
- ✓ `dhaka-alive-landing/index.html`

### What was added:
```html
<!-- Privacy Scripts (MUST load first) -->
<script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js"></script>
<script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js"></script>

<!-- Ezoic Header Script -->
<script async src="//www.ezojs.com/ezoic/sa.min.js"></script>
<script>
  window.ezstandalone = window.ezstandalone || {};
  ezstandalone.cmd = ezstandalone.cmd || [];
</script>
```

---

## ✅ Step 2: Ads.txt Setup

### Status: **COMPLETE** ✓

The ads.txt redirect has been configured for Vercel deployment:
- ✓ Added to `vercel.json` 
- ✓ Redirects to: `https://srv.adstxtmanager.com/19390/koyjabo.com`

### Verification Steps:
1. Deploy your site to Vercel
2. Visit: `https://koyjabo.com/ads.txt`
3. You should see Ezoic's authorized sellers list

### Alternative Setup (if not using Vercel):
- **Apache**: Use `.htaccess` file (already created)
- **Nginx**: Add server config (see `.htaccess` for example)
- **PHP**: Create `ads.txt.php` redirect

---

## 🎨 Step 3: Ad Placements

### Option A: React Components (Recommended)

#### 1. Basic Ad Placement
```tsx
import { EzoicAd } from './components/EzoicAd';

function MyComponent() {
  return (
    <div>
      {/* Header Ad */}
      <EzoicAd placementId={101} className="mb-4" />
      
      {/* Content */}
      <div className="content">...</div>
      
      {/* Footer Ad */}
      <EzoicAd placementId={102} />
    </div>
  );
}
```

#### 2. Multiple Ads (More Efficient)
```tsx
import { EzoicMultiAd } from './components/EzoicAd';

function ArticlePage() {
  return (
    <div>
      <article>...</article>
      
      {/* Load multiple ads in one call */}
      <EzoicMultiAd 
        placementIds={[101, 102, 103]} 
        orientation="vertical"
        className="my-8"
      />
    </div>
  );
}
```

#### 3. With React Hook (Advanced)
```tsx
import { useEzoic } from './hooks/useEzoic';

function DynamicContent() {
  const { showAd, destroyAd } = useEzoic();
  
  const loadMoreContent = () => {
    // Destroy old ads
    destroyAd(104, 105);
    
    // Load content
    loadContent();
    
    // Show new ads
    showAd(106, 107);
  };
  
  return <button onClick={loadMoreContent}>Load More</button>;
}
```

#### 4. SPA Page Changes
```tsx
import { useEzoicPageChange } from './hooks/useEzoic';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  
  // Auto-refresh ads on route change
  useEzoicPageChange(location.pathname);
  
  return <Routes>...</Routes>;
}
```

### Option B: HTML Placement (Simple)

Add this code wherever you want ads to appear:

```html
<!-- Placement 101 -->
<div id="ezoic-pub-ad-placeholder-101"></div>
<script>
  ezstandalone.cmd.push(function () {
    ezstandalone.showAds(101);
  });
</script>

<!-- Placement 102 -->
<div id="ezoic-pub-ad-placeholder-102"></div>
<script>
  ezstandalone.cmd.push(function () {
    ezstandalone.showAds(102);
  });
</script>
```

**For multiple ads (recommended):**
```html
<div id="ezoic-pub-ad-placeholder-101"></div>
<div id="ezoic-pub-ad-placeholder-102"></div>
<div id="ezoic-pub-ad-placeholder-103"></div>

<script>
  ezstandalone.cmd.push(function () {
    // Load all ads in one call (more efficient)
    ezstandalone.showAds(101, 102, 103);
  });
</script>
```

---

## 🚀 Advanced Features

### 1. Dynamic Content (Infinite Scroll)

```tsx
import { useEzoic } from './hooks/useEzoic';

function InfiniteScrollArticle() {
  const { showAd } = useEzoic();
  const [articles, setArticles] = useState([]);
  
  const loadMoreArticles = () => {
    const newArticles = fetchArticles();
    setArticles([...articles, ...newArticles]);
    
    // Show ads for new articles
    // Article 1: placements 102-104
    // Article 2: placements 105-107
    const startId = 105 + (articles.length * 3);
    showAd(startId, startId + 1, startId + 2);
  };
  
  return (
    <>
      {articles.map((article, idx) => (
        <div key={idx}>
          <Article data={article} />
          <EzoicAd placementId={102 + idx * 3} />
        </div>
      ))}
      <button onClick={loadMoreArticles}>Load More</button>
    </>
  );
}
```

### 2. Modal/Popup Content

```tsx
function Modal({ isOpen, onClose }) {
  const { showAd, destroyAd } = useEzoic();
  
  useEffect(() => {
    if (isOpen) {
      showAd(108); // Modal ad
    } else {
      destroyAd(108); // Clean up when closed
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal">
      <h2>Modal Content</h2>
      <EzoicAd placementId={108} />
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### 3. Removing All Ads (SPA Navigation)

```tsx
function PageTransition() {
  const { destroyAll, refreshAds } = useEzoic();
  
  const navigateToNewPage = () => {
    // Clean up all ads from previous page
    destroyAll();
    
    // Navigate
    router.push('/new-page');
    
    // Refresh ads for new page
    setTimeout(() => refreshAds(), 100);
  };
}
```

---

## 🎯 Recommended Placement Strategy

### Homepage (`/`)
- **Placement 101**: Top banner (above fold)
- **Placement 102**: Sidebar (desktop only)
- **Placement 103**: In-content (between search results)
- **Placement 104**: Footer

### Blog/Article Pages
- **Placement 201**: Top of article
- **Placement 202**: Mid-article (after 2-3 paragraphs)
- **Placement 203**: End of article
- **Placement 204**: Sidebar

### Intercity Page
- **Placement 301**: Above search form
- **Placement 302**: Between search results
- **Placement 303**: Bottom of results

---

## 📊 Creating Placements in Ezoic Dashboard

1. Log into your Ezoic Dashboard
2. Go to **Ad Tester** → **Placeholders**
3. Click **Create New Placeholder**
4. Note the Placement ID (e.g., 101)
5. Configure ad sizes and settings
6. Use that ID in your code

---

## ⚙️ Service Functions Reference

### `ezoicService.ts`

```typescript
import { ezoicService } from './services/ezoicService';

// Initialize (called automatically)
ezoicService.init();

// Show specific ads
ezoicService.showAds(101, 102, 103);

// Show all ads on page
ezoicService.showAds();

// Destroy specific ads
ezoicService.destroyPlaceholders(101, 102);

// Destroy all ads
ezoicService.destroyAll();

// Refresh for page change (SPA)
ezoicService.refreshForPageChange();

// Check if ready
const isReady = ezoicService.isReady();

// Wait for ready (async)
await ezoicService.waitForReady(5000);

// Get placement status
const status = ezoicService.getPlacementStatus(101);
```

---

## 🔧 Troubleshooting

### ❌ Ads not showing?

1. **Check Console:**
   ```javascript
   console.log(window.ezstandalone);
   // Should show: { cmd: [], showAds: function, ... }
   ```

2. **Verify Scripts Loaded:**
   - Open DevTools → Network → Filter by "ezojs"
   - Ensure `sa.min.js` is loaded successfully

3. **Check Placement IDs:**
   - Make sure IDs match your Ezoic dashboard
   - Verify placeholders exist in HTML

4. **Clear Cache:**
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Clear browser cache completely

### ❌ ads.txt not working?

1. **Verify Redirect:**
   - Visit: `https://koyjabo.com/ads.txt`
   - Check if it redirects correctly
   - Should show Ezoic's sellers list

2. **Check DNS:**
   - Ensure domain is properly configured
   - Wait 24-48 hours for DNS propagation

3. **Server Configuration:**
   - If using Apache: Check `.htaccess` is being read
   - If using Nginx: Verify server config is active
   - If using Vercel: Ensure latest `vercel.json` is deployed

### ⚠️ AdBlock Detection

Some users may have ad blockers. To detect:

```typescript
const checkAdBlock = async () => {
  const ready = await ezoicService.waitForReady(3000);
  if (!ready) {
    console.warn('Ezoic not loaded - possible ad blocker');
    // Show message to user
  }
};
```

---

## 📱 Mobile Optimization

Ads are automatically responsive, but you can customize:

```tsx
function ResponsiveAd() {
  const isMobile = window.innerWidth < 768;
  
  return (
    <EzoicAd 
      placementId={isMobile ? 105 : 101}
      className={isMobile ? 'my-2' : 'my-4'}
    />
  );
}
```

---

## ✨ Best Practices

### ✅ DO:
- Load privacy scripts FIRST (already configured)
- Use single `showAds()` call for multiple placements
- Clean up ads in dynamic content
- Use unique placement IDs for infinite scroll
- Test on mobile and desktop

### ❌ DON'T:
- Add styling to placeholder divs (let Ezoic handle it)
- Call `showAds()` multiple times for same placement
- Forget to destroy ads in modals/popups
- Reuse placement IDs in the same view
- Block Ezoic scripts with CSP policies

---

## 🎉 Implementation Complete!

Your site is now ready for Ezoic ads! Here's what's been set up:

✅ Ezoic scripts loaded on all pages  
✅ Privacy compliance (GDPR)  
✅ ads.txt redirect configured  
✅ React components created  
✅ Service layer implemented  
✅ TypeScript support added  
✅ Dynamic content handlers ready  

### Next Steps:

1. **Create Placements** in Ezoic Dashboard
2. **Add Ad Components** to your pages
3. **Test Thoroughly** on staging
4. **Monitor Performance** in Ezoic Analytics
5. **Optimize Placement** based on data

---

## 📞 Need Help?

- **Ezoic Support**: support@ezoic.com
- **Documentation**: https://support.ezoic.com/
- **Dashboard**: https://siteaccess.ezoic.com/

---

**Last Updated**: February 12, 2026  
**Version**: 1.0.0  
**Author**: Professional Ezoic Integration for koyjabo.com
