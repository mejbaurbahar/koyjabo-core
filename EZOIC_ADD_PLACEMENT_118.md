# 🎉 Ad Placement Implementation Guide

## ✅ You Created Your First Placement!

**Placement ID:** 118 (Sidebar)

Now let's add it to your website properly.

---

## Option 1: Quick Test (Add to HTML) - RECOMMENDED FOR TESTING

This is fastest way to test if ads are working:

### **Add to `index.html`**

Open `h:\Dhaka-Commute\index.html` and add this code right after the `<div id="root"></div>` line:

```html
<!-- Find this line (around line 1100): -->
<div id="root"></div>

<!-- Add this RIGHT AFTER: -->
<!-- Ezoic - sidebar -->
<div id="ezoic-pub-ad-placeholder-118"></div>
<!-- End Ezoic - sidebar -->
<script>
  ezstandalone.cmd.push(function() {
    ezstandalone.showAds(118);
  });
</script>
```

---

## Option 2: React Component (Production Quality)

Use our pre-built EzoicAd component for a cleaner implementation:

### **Step 1: Import the component**

At the top of `App.tsx` (around line 62), add:

```tsx
import { EzoicAd } from './components/EzoicAd';
```

### **Step 2: Add the ad to your main content**

Find your main content area in `App.tsx` (search for "return (") and add:

```tsx
{/* Ezoic Sidebar Ad */}
<EzoicAd 
  placementId={118} 
  className="my-4 mx-auto max-w-md"
  onAdLoaded={() => console.log('Sidebar ad loaded!')}
/>
```

---

## 📍 Where to Place Ads

Based on your app structure, here are good locations:

### **1. In the Homepage (After Search Section)**
```tsx
<EzoicAd placementId={118} className="my-6" />
```

### **2. Between Content Sections**
```tsx
{/* Your content */}
<YourSearchResults />

{/* Ad */}
<EzoicAd placementId={118} className="my-8" />

{/* More content */}
<MoreContent />
```

### **3. In the Footer Area**
```tsx
{/* Before GlobalFooter */}
<EzoicAd placementId={118} className="mb-8" />
<GlobalFooter />
```

---

## 🎯 Create More Placements

Go back to Ezoic Dashboard and create at least 4 more placements:

| Placement Type | Suggested Sizes | When to Show |
|----------------|----------------|--------------|
| **Top Banner** | 728x90, 970x90, 320x50 | Above main content |
| **In-Content** | 336x280, 300x250 | Between search results |
| **Footer** | 728x90, 320x50 | Bottom of page |
| **Mobile Sticky** | 320x50, 320x100 | Mobile devices only |

After creating each, add them using the same method!

---

## ✅ Test Your Implementation

### **1. Local Test:**
```bash
npm run dev
```

Open browser and check console:
```javascript
console.log(window.ezstandalone);  // Should be an object
document.getElementById('ezoic-pub-ad-placeholder-118');  // Should exist
```

### **2. Deploy:**
```bash
npm run build
git add .
git commit -m "feat: Add Ezoic sidebar ad placement #118"
git push origin main
```

### **3. Verify on Live Site:**
After GitHub Pages deploys (1-2 min):
- Visit `koyjabo.com`
- Check if placeholder div exists in source
- Wait 24-48h for Ezoic to show actual ads

---

## 🚀 Complete the Integration

To finish Ezoic integration, you need:

- [x] ✅ Scripts in HTML (DONE)
- [x] ✅ Placement 118 created (DONE)
- [ ] ⏳ Add placeholder code to website (DO NOW)
- [ ] ⏳ Create 3-4 more placements
- [ ] ⏳ Deploy to production
- [ ] ⏳ Wait for Ezoic approval (18-48h)

---

## 📝 Quick Copy-Paste for index.html

```html
<!-- Add this after <div id="root"></div> -->

<!-- Ezoic Sidebar Ad -->
<div id="ezoic-pub-ad-placeholder-118"></div>
<script>
  ezstandalone.cmd.push(function() {
    ezstandalone.showAds(118);
  });
</script>
```

---

## 🎊 Next Steps

1. **Add placement 118 code** (above)
2. **Create 3 more placements** in Ezoic Dashboard
3. **Add their codes** too
4. **Deploy** to GitHub
5. **Wait** for Ezoic approval

You're almost done! 🚀

---

Last Updated: February 12, 2026  
Placement Created: #118 (Sidebar)
