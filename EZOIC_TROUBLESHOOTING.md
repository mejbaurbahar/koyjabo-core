# 🔧 Ezoic Troubleshooting Guide

Quick solutions to common issues when implementing Ezoic ads on koyjabo.com.

---

## 🚨 Common Issues & Solutions

### Issue 1: Ads Not Showing

#### Symptom
Ad placeholders are visible but no ads appear.

#### Possible Causes & Solutions

**1. Scripts Not Loaded**
```javascript
// Check in browser console:
console.log(window.ezstandalone);

// ✅ Should return:
// { cmd: [], showAds: function, destroyPlaceholders: function, destroyAll: function }

// ❌ If undefined or different, scripts didn't load
```

**Solution:**
- Check Network tab in DevTools
- Look for `sa.min.js` from `www.ezojs.com`
- Verify no ad blockers are running
- Clear browser cache and hard refresh (`Ctrl+Shift+R`)

**2. Placement IDs Don't Exist**
```typescript
// Verify placement exists in Ezoic dashboard
// Dashboard → Ad Tester → Placeholders

// Check your code matches dashboard:
<EzoicAd placementId={101} />  // Must match dashboard ID
```

**Solution:**
- Create placements in Ezoic Dashboard first
- Use exact same IDs in your code
- Wait 5-10 minutes after creating placements

**3. Site Not Approved**
```
// Ads may not show immediately after integration
// Ezoic needs 24-48 hours to review and approve
```

**Solution:**
- Wait 24-48 hours after initial setup
- Check Ezoic Dashboard for approval status
- Enable "Testing Mode" in dashboard to see test ads

**4. Placeholder Not Found**
```javascript
// Check if placeholder div exists
const placeholder = document.getElementById('ezoic-pub-ad-placeholder-101');
console.log(placeholder);  // Should not be null
```

**Solution:**
```tsx
// Make sure placeholder div is rendered
<div id="ezoic-pub-ad-placeholder-101"></div>

// If using React component, verify it's mounted
<EzoicAd placementId={101} />
```

---

### Issue 2: ads.txt Not Working

#### Symptom
Visiting `koyjabo.com/ads.txt` shows 404 or doesn't redirect.

#### Solutions

**1. Vercel Deployment**
```json
// Verify in vercel.json:
{
  "rewrites": [
    {
      "source": "/ads.txt",
      "destination": "https://srv.adstxtmanager.com/19390/koyjabo.com"
    }
  ]
}
```

**Steps:**
1. Commit changes to `vercel.json`
2. Deploy: `vercel --prod`
3. Wait 2-5 minutes for deployment
4. Test: `https://koyjabo.com/ads.txt`

**2. Apache Server**
```apache
# Check .htaccess file:
Redirect 301 /ads.txt https://srv.adstxtmanager.com/19390/koyjabo.com

# Verify .htaccess is being read:
# Add this temporarily to test:
RewriteEngine On
```

**Steps:**
1. Upload `.htaccess` to root directory
2. Verify file permissions (644)
3. Check if mod_rewrite is enabled
4. Test redirect

**3. DNS Propagation**
```bash
# Check if domain resolves correctly
nslookup koyjabo.com

# May take 24-48 hours for DNS to propagate
```

**Solution:**
- Wait 24-48 hours
- Clear DNS cache: `ipconfig /flushdns` (Windows)
- Try from different network/device

---

### Issue 3: TypeScript Errors

#### Error 1: Cannot find module 'react-helmet-async'

```
Cannot find module 'react-helmet-async' or its corresponding type declarations.
```

**Solution:**
This is expected! We don't use `react-helmet-async`. The scripts are loaded via HTML.

```tsx
// ❌ Don't do this:
import { Helmet } from 'react-helmet-async';

// ✅ Do this instead:
// Scripts are in HTML, just initialize in component:
import { EzoicAdScript } from './components/EzoicAdScript';
```

#### Error 2: Type '{}' is missing properties

```
Type '{}' is missing the following properties from type '{ cmd: ..., showAds: ..., ... }'
```

**Solution:**
Already fixed in `services/ezoicService.ts`:

```typescript
// ✅ Correct initialization:
if (!window.ezstandalone) {
  window.ezstandalone = {
    cmd: [],
    showAds: () => {},
    destroyPlaceholders: () => {},
    destroyAll: () => {}
  };
}
```

---

### Issue 4: Ads Don't Refresh on Route Change (SPA)

#### Symptom
Ads show on first page but not after navigating in single-page app.

#### Solution

```tsx
// Add the useEzoicPageChange hook:
import { useEzoicPageChange } from './hooks/useEzoic';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  
  // This auto-refreshes ads on route change
  useEzoicPageChange(location.pathname);
  
  return <Routes>...</Routes>;
}
```

**Alternative:**
```tsx
// Manually refresh ads on route change:
const { refreshAds } = useEzoic();

useEffect(() => {
  refreshAds();
}, [location.pathname]);
```

---

### Issue 5: Memory Leaks with Dynamic Content

#### Symptom
App becomes slow after loading/unloading content multiple times.

#### Cause
Ads not properly cleaned up when content is removed.

#### Solution

```tsx
// ❌ Bad: Ads not destroyed
function Modal({ isOpen }) {
  if (!isOpen) return null;
  
  return (
    <div>
      <EzoicAd placementId={601} />
    </div>
  );
}

// ✅ Good: Proper cleanup
function Modal({ isOpen }) {
  const { showAd, destroyAd } = useEzoic();
  
  useEffect(() => {
    if (isOpen) {
      showAd(601);
    } else {
      destroyAd(601);  // Clean up!
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div>
      <div id="ezoic-pub-ad-placeholder-601"></div>
    </div>
  );
}
```

---

### Issue 6: Duplicate Placement IDs

#### Symptom
Ads show inconsistently or in wrong locations.

#### Cause
Same placement ID used multiple times on same page.

#### Solution

```tsx
// ❌ Bad: Duplicate IDs
<EzoicAd placementId={101} />
<SomeContent />
<EzoicAd placementId={101} />  // ❌ Same ID!

// ✅ Good: Unique IDs
<EzoicAd placementId={101} />
<SomeContent />
<EzoicAd placementId={102} />  // ✅ Different ID
```

**For infinite scroll:**
```tsx
{articles.map((article, index) => (
  <div key={article.id}>
    <Article data={article} />
    {/* Use unique ID for each article */}
    <EzoicAd placementId={501 + index} />
  </div>
))}
```

---

### Issue 7: Ads Blocked by Ad Blocker

#### Symptom
Ads work in incognito but not in normal browsing.

#### Detection

```typescript
// Detect if Ezoic is blocked
const checkAdBlock = async () => {
  const ready = await ezoicService.waitForReady(3000);
  
  if (!ready) {
    console.warn('Ezoic may be blocked by ad blocker');
    // Optionally show message to user
  }
};
```

#### Solution
Can't prevent ad blockers, but you can:
1. Politely ask users to whitelist your site
2. Offer ad-free premium subscription
3. Accept reduced revenue

---

### Issue 8: Page Performance Issues

#### Symptom
Page loads slowly after adding ads.

#### Solutions

**1. Lazy Load Ads**
```tsx
import { lazy, Suspense } from 'react';

const EzoicAd = lazy(() => import('./components/EzoicAd'));

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EzoicAd placementId={101} />
    </Suspense>
  );
}
```

**2. Limit Ad Density**
```tsx
// ❌ Too many ads
<EzoicAd placementId={101} />
<EzoicAd placementId={102} />
<EzoicAd placementId={103} />
<EzoicAd placementId={104} />
<EzoicAd placementId={105} />

// ✅ Reasonable spacing
<EzoicAd placementId={101} />
<Content />
<EzoicAd placementId={102} />
<MoreContent />
<EzoicAd placementId={103} />
```

**3. Monitor Core Web Vitals**
```javascript
// Check in browser:
// DevTools → Lighthouse → Performance

// Target metrics:
// LCP (Largest Contentful Paint): < 2.5s
// FID (First Input Delay): < 100ms
// CLS (Cumulative Layout Shift): < 0.1
```

---

### Issue 9: Mobile Ads Not Showing

#### Symptom
Ads work on desktop but not on mobile.

#### Solutions

**1. Use Mobile-Specific Placements**
```tsx
const isMobile = window.innerWidth < 768;

<EzoicAd placementId={isMobile ? 701 : 101} />
```

**2. Check Ad Sizes**
```
// In Ezoic Dashboard, ensure mobile sizes are enabled:
// 320x50, 300x250, 336x280
```

**3. Verify Viewport Meta**
```html
<!-- Must be in <head> -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

### Issue 10: Console Errors

#### Error: "ezstandalone is not defined"

```javascript
Uncaught ReferenceError: ezstandalone is not defined
```

**Cause:** Scripts not loaded yet.

**Solution:**
```typescript
// Always use cmd queue:
ezstandalone.cmd.push(function() {
  ezstandalone.showAds(101);
});

// Or wait for ready:
await ezoicService.waitForReady();
```

#### Error: "Placeholder not found"

```javascript
Warning: Placeholder ezoic-pub-ad-placeholder-101 not found
```

**Solution:**
```tsx
// Make sure div exists in DOM:
<div id="ezoic-pub-ad-placeholder-101"></div>

// If using React component, ensure it mounts:
<EzoicAd placementId={101} />
```

---

## 🔍 Debugging Tools

### 1. Browser Console Checks

```javascript
// Check if Ezoic loaded
console.log(window.ezstandalone);

// Check specific placement
const status = ezoicService.getPlacementStatus(101);
console.log(status);

// Wait for Ezoic
const ready = await ezoicService.waitForReady(5000);
console.log('Ezoic ready:', ready);

// Check loaded placements
const { loadedPlacements } = useEzoic();
console.log('Loaded:', loadedPlacements);
```

### 2. Network Tab

```
DevTools → Network → Filter: "ezoic"

Look for:
✅ sa.min.js (200 OK)
✅ cmp.gatekeeperconsent.com (200 OK)
✅ the.gatekeeperconsent.com (200 OK)

❌ Any 404 or blocked requests
```

### 3. Ezoic Dashboard

```
Dashboard → Debugging Tools → Ad Tester

- Check "Show Test Ads"
- View placeholder activity
- Check error logs
```

---

## 📞 Getting Help

### 1. Check Documentation
- [Implementation Guide](./EZOIC_IMPLEMENTATION_GUIDE.md)
- [Quick Reference](./EZOIC_QUICK_REFERENCE.md)
- [Examples](./examples/EzoicAdExamples.tsx)

### 2. Ezoic Support
- Email: support@ezoic.com
- Community: https://community.ezoic.com/
- Documentation: https://support.ezoic.com/

### 3. Debug Checklist

Before contacting support:
- [ ] Check browser console for errors
- [ ] Verify scripts are loading (Network tab)
- [ ] Confirm placements exist in dashboard
- [ ] Test in incognito mode
- [ ] Try different browser
- [ ] Check mobile device
- [ ] Clear cache and cookies
- [ ] Wait 24-48 hours if just set up

---

## 🎯 Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| No ads showing | Wait 24-48h, check dashboard |
| ads.txt 404 | Redeploy, check vercel.json |
| TypeScript errors | Already fixed in code |
| SPA ads not refreshing | Add useEzoicPageChange hook |
| Memory leaks | Destroy ads when removing content |
| Duplicate IDs | Use unique ID per placement |
| Ad blocked | Can't fix, user's choice |
| Slow page load | Lazy load, limit ad density |
| Mobile issues | Use mobile-specific placements |
| Console errors | Wait for ezstandalone.cmd |

---

**Last Updated**: February 12, 2026  
**Version**: 1.0.0  
**For**: koyjabo.com

---

Still stuck? Check the full [Implementation Guide](./EZOIC_IMPLEMENTATION_GUIDE.md) or contact Ezoic support!
