# 🚀 Ezoic Quick Reference - koyjabo.com

## ⚡ Quick Start

### 1. HTML Placement (Simplest)
```html
<div id="ezoic-pub-ad-placeholder-101"></div>
<script>
  ezstandalone.cmd.push(function() {
    ezstandalone.showAds(101);
  });
</script>
```

### 2. React Component (Recommended)
```tsx
import { EzoicAd } from './components/EzoicAd';

<EzoicAd placementId={101} className="my-4" />
```

### 3. React Hook (Advanced)
```tsx
import { useEzoic } from './hooks/useEzoic';

const { showAd, destroyAd } = useEzoic();
showAd(101, 102, 103);
```

---

## 📍 Placement ID Strategy

| Page Type | Placement IDs | Purpose |
|-----------|---------------|---------|
| Homepage | 101-110 | Main landing page ads |
| Blog/Articles | 201-210 | Content pages |
| Search Results | 301-310 | Search/route pages |
| Tabs/Dynamic | 401-410 | Dynamic content |
| Infinite Scroll | 501-600 | Feed/scroll content |
| Modals/Popups | 601-610 | Overlay content |
| Mobile-specific | 701-710 | Mobile-only ads |
| Multi-ads | 801-810 | Grouped ads |
| Conditional | 901-910 | Premium/conditional |

---

## 🎯 Common Patterns

### Pattern 1: Multiple Ads (Most Efficient)
```tsx
// ✅ GOOD - Single call
ezstandalone.showAds(101, 102, 103);

// ❌ BAD - Multiple calls
ezstandalone.showAds(101);
ezstandalone.showAds(102);
ezstandalone.showAds(103);
```

### Pattern 2: Dynamic Content
```tsx
// When content changes
destroyAd(104, 105);  // Clean up old ads
// Update content
showAd(106, 107);     // Load new ads
```

### Pattern 3: SPA Navigation
```tsx
import { useEzoicPageChange } from './hooks/useEzoic';
import { useLocation } from 'react-router-dom';

useEzoicPageChange(location.pathname); // Auto-refresh on route change
```

### Pattern 4: Conditional Ads
```tsx
{!user.isPremium && <EzoicAd placementId={101} />}
```

---

## 🛠️ Essential Functions

### Service Functions
```typescript
import { ezoicService } from './services/ezoicService';

// Show ads
ezoicService.showAds(101, 102);

// Show all ads on page
ezoicService.showAds();

// Destroy specific ads
ezoicService.destroyPlaceholders(101);

// Destroy all ads
ezoicService.destroyAll();

// For SPA page changes
ezoicService.refreshForPageChange();

// Check if ready
const ready = await ezoicService.waitForReady();
```

### Hook Functions
```typescript
const { 
  showAd,           // Show one or more ads
  destroyAd,        // Destroy specific ads
  destroyAll,       // Destroy all ads
  refreshAds,       // Refresh for page change
  isReady,          // Check if Ezoic loaded
  waitForReady      // Wait for Ezoic to load
} = useEzoic();
```

---

## ⚙️ Components

### EzoicAd (Single Ad)
```tsx
<EzoicAd 
  placementId={101}
  className="my-4"
  autoLoad={true}
  onAdLoaded={() => console.log('Loaded!')}
  onAdError={(err) => console.error(err)}
/>
```

### EzoicMultiAd (Multiple Ads)
```tsx
<EzoicMultiAd 
  placementIds={[101, 102, 103]}
  orientation="vertical" // or "horizontal"
  className="ad-container"
/>
```

---

## ✅ Best Practices

### DO ✅
- ✅ Load privacy scripts FIRST
- ✅ Use single `showAds()` call for multiple placements
- ✅ Clean up ads in dynamic content
- ✅ Use unique IDs for infinite scroll
- ✅ Test on mobile and desktop

### DON'T ❌
- ❌ Style placeholder divs
- ❌ Call `showAds()` multiple times for same placement
- ❌ Forget to destroy modal/popup ads
- ❌ Reuse placement IDs in same view
- ❌ Block scripts with CSP

---

## 🔍 Troubleshooting

### Ads not showing?
```javascript
// 1. Check if Ezoic loaded
console.log(window.ezstandalone);

// 2. Check placement status
const status = ezoicService.getPlacementStatus(101);
console.log(status);

// 3. Wait for ready
const ready = await ezoicService.waitForReady(5000);
console.log('Ready:', ready);
```

### ads.txt not working?
1. Visit: `https://koyjabo.com/ads.txt`
2. Should redirect to Ezoic's server
3. Wait 24-48 hours for DNS propagation
4. Clear cache and redeploy

---

## 📱 Responsive Ads

```tsx
// Method 1: Different placements
<EzoicAd placementId={isMobile ? 701 : 702} />

// Method 2: Conditional rendering
{isMobile && <EzoicAd placementId={701} />}
{!isMobile && <EzoicAd placementId={702} />}
```

---

## 🎨 Placement Examples

### Homepage
```tsx
<EzoicAd placementId={101} /> // Top banner
<EzoicAd placementId={102} /> // Sidebar
<EzoicAd placementId={103} /> // In-content
<EzoicAd placementId={104} /> // Footer
```

### Article
```tsx
<EzoicAd placementId={201} /> // Top
<EzoicAd placementId={202} /> // Mid-article
<EzoicAd placementId={203} /> // End
```

### Search Results
```tsx
<EzoicAd placementId={301} /> // Top
{results.map((result, i) => (
  <>
    <Result data={result} />
    {(i + 1) % 3 === 0 && <EzoicAd placementId={302} />}
  </>
))}
```

---

## 📊 Performance Tips

1. **Lazy Load Ads**: Only load ads when visible
2. **Batch Loading**: Load multiple ads in one call
3. **Clean Up**: Always destroy unused ads
4. **Optimize Placement**: Test different positions
5. **Monitor**: Use Ezoic Analytics

---

## 📂 File Structure

```
h:/Dhaka-Commute/
├── services/
│   └── ezoicService.ts          # Core service
├── components/
│   ├── EzoicAd.tsx              # Single ad component
│   └── EzoicAdScript.tsx        # Script initializer
├── hooks/
│   └── useEzoic.ts              # React hook
├── examples/
│   └── EzoicAdExamples.tsx      # Usage examples
├── .htaccess                     # Apache config
├── vercel.json                   # Vercel config (ads.txt)
├── index.html                    # Ezoic scripts added
├── intercity/index.html          # Ezoic scripts added
├── intercity-route-finder/index.html  # Ezoic scripts added
└── dhaka-alive-landing/index.html     # Ezoic scripts added
```

---

## 🔗 Important Links

- **Ezoic Dashboard**: https://siteaccess.ezoic.com/
- **Create Placements**: Dashboard → Ad Tester → Placeholders
- **Analytics**: Dashboard → Big Data Analytics
- **Support**: support@ezoic.com
- **Documentation**: https://support.ezoic.com/

---

## ✨ Implementation Status

✅ Step 1: Site Integration - **COMPLETE**  
✅ Step 2: Ads.txt Setup - **COMPLETE**  
⏳ Step 3: Ad Placements - **CREATE IN DASHBOARD**

### Next Actions:
1. Create placement IDs in Ezoic Dashboard
2. Add `<EzoicAd>` components to your pages
3. Test on staging environment
4. Deploy to production
5. Monitor in Ezoic Analytics

---

**Version**: 1.0.0  
**Last Updated**: February 12, 2026  
**For**: koyjabo.com
