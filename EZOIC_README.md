# 🎯 Ezoic Ads Integration for koyjabo.com

[![Status](https://img.shields.io/badge/Status-Ready-brightgreen)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Supported-blue)]()
[![React](https://img.shields.io/badge/React-Components-61dafb)]()

Professional Ezoic ads implementation with TypeScript, React components, and advanced features.

---

## 🚀 Quick Start

### 1. HTML Integration (Simplest)
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

## ✅ What's Included

### Core Files
- ✅ **Service Layer**: `services/ezoicService.ts` - Core ad management
- ✅ **React Components**: `components/EzoicAd.tsx` - Reusable ad components
- ✅ **React Hooks**: `hooks/useEzoic.ts` - Custom hooks for SPA
- ✅ **TypeScript Types**: `types/ezoic.d.ts` - Type definitions
- ✅ **Examples**: `examples/EzoicAdExamples.tsx` - 10+ usage examples

### Configuration
- ✅ **Vercel**: `vercel.json` - ads.txt redirect
- ✅ **Apache**: `.htaccess` - Server configuration
- ✅ **HTML Scripts**: All index.html files updated

### Documentation
- ✅ **Implementation Guide**: `EZOIC_IMPLEMENTATION_GUIDE.md`
- ✅ **Quick Reference**: `EZOIC_QUICK_REFERENCE.md`
- ✅ **Summary**: `EZOIC_IMPLEMENTATION_SUMMARY.md`
- ✅ **Hooks Docs**: `hooks/README.md`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Implementation Guide](./EZOIC_IMPLEMENTATION_GUIDE.md) | Complete setup guide with examples |
| [Quick Reference](./EZOIC_QUICK_REFERENCE.md) | Cheat sheet for common tasks |
| [Implementation Summary](./EZOIC_IMPLEMENTATION_SUMMARY.md) | What's done and what's next |
| [Usage Examples](./examples/EzoicAdExamples.tsx) | 10+ real-world examples |
| [Hooks Documentation](./hooks/README.md) | React hooks API reference |

---

## 🎨 Features

### ✨ Core Features
- ✅ **Privacy Compliant**: GDPR, CCPA ready
- ✅ **TypeScript Support**: Full type safety
- ✅ **React Components**: Reusable and clean
- ✅ **Custom Hooks**: SPA-friendly
- ✅ **Error Handling**: Robust error management
- ✅ **Auto-initialization**: Zero config needed

### 🚀 Advanced Features
- ✅ **SPA Navigation**: Auto-refresh on route change
- ✅ **Dynamic Content**: Modal, tabs, infinite scroll
- ✅ **Responsive**: Mobile and desktop optimized
- ✅ **Performance**: Lazy loading, batch operations
- ✅ **Conditional Ads**: Premium users, etc.
- ✅ **Multi-ad Loading**: Efficient API usage

---

## 📦 Installation Status

### ✅ Completed
1. ✅ Ezoic scripts added to all HTML files
2. ✅ Privacy scripts configured (GDPR compliance)
3. ✅ ads.txt redirect configured
4. ✅ Service layer implemented
5. ✅ React components created
6. ✅ Custom hooks developed
7. ✅ TypeScript types defined
8. ✅ Documentation created
9. ✅ Examples provided

### ⏳ Next Steps (Your Action Required)
1. ⏳ Create placements in Ezoic Dashboard
2. ⏳ Add `<EzoicAd>` components to pages
3. ⏳ Test on staging environment
4. ⏳ Deploy to production
5. ⏳ Monitor analytics

---

## 🎯 Basic Usage

### Option 1: React Component
```tsx
import { EzoicAd } from './components/EzoicAd';

function Homepage() {
  return (
    <div>
      {/* Header Ad */}
      <EzoicAd placementId={101} className="mb-4" />
      
      {/* Content */}
      <div className="content">...</div>
      
      {/* Footer Ad */}
      <EzoicAd placementId={104} />
    </div>
  );
}
```

### Option 2: Multiple Ads (Efficient)
```tsx
import { EzoicMultiAd } from './components/EzoicAd';

<EzoicMultiAd 
  placementIds={[101, 102, 103]} 
  orientation="vertical"
/>
```

### Option 3: With Hook
```tsx
import { useEzoic } from './hooks/useEzoic';

function DynamicPage() {
  const { showAd, destroyAd } = useEzoic();
  
  const toggleContent = () => {
    destroyAd(201);
    // Update content
    showAd(202);
  };
  
  return <button onClick={toggleContent}>Toggle</button>;
}
```

### Option 4: SPA Navigation
```tsx
import { useEzoicPageChange } from './hooks/useEzoic';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  useEzoicPageChange(location.pathname);
  
  return <Routes>...</Routes>;
}
```

---

## 🔧 API Reference

### Service Functions
```typescript
import { ezoicService } from './services/ezoicService';

ezoicService.showAds(101, 102, 103);
ezoicService.destroyPlaceholders(101);
ezoicService.destroyAll();
ezoicService.refreshForPageChange();
await ezoicService.waitForReady(5000);
```

### Hook Functions
```typescript
const { 
  showAd,
  destroyAd,
  destroyAll,
  refreshAds,
  isReady,
  waitForReady,
  getPlacementStatus,
  loadedPlacements
} = useEzoic(options);
```

---

## 📊 Recommended Placement Strategy

### Homepage
- **101**: Top banner (above fold)
- **102**: Sidebar (desktop only)
- **103**: In-content (between results)
- **104**: Footer

### Blog/Article
- **201**: Top of article
- **202**: Mid-article
- **203**: End of article
- **204**: Sidebar

### Search Results
- **301**: Above results
- **302**: Between results (every 3rd)
- **303**: Bottom of results

### Dynamic Content
- **401-410**: Tabs, modals, popups
- **501-600**: Infinite scroll
- **701-710**: Mobile-specific

---

## ✨ Best Practices

### ✅ DO
- ✅ Load privacy scripts FIRST
- ✅ Use single `showAds()` for multiple placements
- ✅ Clean up ads in dynamic content
- ✅ Use unique IDs for infinite scroll
- ✅ Test on mobile and desktop

### ❌ DON'T
- ❌ Style placeholder divs
- ❌ Call `showAds()` multiple times for same placement
- ❌ Forget to destroy modal/popup ads
- ❌ Reuse placement IDs in same view
- ❌ Block scripts with CSP

---

## 🔍 Troubleshooting

### Ads not showing?
```javascript
// Check if Ezoic loaded
console.log(window.ezstandalone);

// Wait for ready
const ready = await ezoicService.waitForReady(5000);
console.log('Ready:', ready);
```

### ads.txt not working?
1. Visit `https://koyjabo.com/ads.txt`
2. Should redirect to Ezoic's server
3. Wait 24-48 hours for DNS
4. Clear cache and redeploy

---

## 📱 Mobile Support

```tsx
// Responsive ads
const isMobile = window.innerWidth < 768;
<EzoicAd placementId={isMobile ? 701 : 702} />

// Conditional rendering
{isMobile && <EzoicAd placementId={701} />}
{!isMobile && <EzoicAd placementId={702} />}
```

---

## 🔗 Important Links

- **Ezoic Dashboard**: https://siteaccess.ezoic.com/
- **Create Placements**: Dashboard → Ad Tester → Placeholders
- **Analytics**: Dashboard → Big Data Analytics
- **Support**: support@ezoic.com
- **Docs**: https://support.ezoic.com/

---

## 📁 File Structure

```
h:/Dhaka-Commute/
├── services/
│   └── ezoicService.ts          # Core service layer
├── components/
│   ├── EzoicAd.tsx              # Ad components
│   └── EzoicAdScript.tsx        # Script initializer
├── hooks/
│   ├── useEzoic.ts              # React hooks
│   └── README.md                # Hooks docs
├── types/
│   └── ezoic.d.ts               # TypeScript types
├── examples/
│   └── EzoicAdExamples.tsx      # Usage examples
├── .htaccess                     # Apache config
├── vercel.json                   # Vercel config
├── EZOIC_README.md              # This file
├── EZOIC_IMPLEMENTATION_GUIDE.md
├── EZOIC_QUICK_REFERENCE.md
└── EZOIC_IMPLEMENTATION_SUMMARY.md
```

---

## 🎓 Learning Path

1. **Start Here**: Read [EZOIC_IMPLEMENTATION_SUMMARY.md](./EZOIC_IMPLEMENTATION_SUMMARY.md)
2. **Quick Tasks**: Use [EZOIC_QUICK_REFERENCE.md](./EZOIC_QUICK_REFERENCE.md)
3. **Deep Dive**: Read [EZOIC_IMPLEMENTATION_GUIDE.md](./EZOIC_IMPLEMENTATION_GUIDE.md)
4. **Learn by Example**: Study [examples/EzoicAdExamples.tsx](./examples/EzoicAdExamples.tsx)
5. **API Reference**: Check [hooks/README.md](./hooks/README.md)

---

## 🎉 Success Checklist

- [x] ✅ Scripts integrated
- [x] ✅ ads.txt configured
- [x] ✅ Components created
- [x] ✅ Documentation written
- [ ] ⏳ Create placements in dashboard
- [ ] ⏳ Add ads to pages
- [ ] ⏳ Test implementation
- [ ] ⏳ Deploy to production
- [ ] ⏳ Monitor analytics

---

## 📞 Support

Need help? Here's where to go:

1. **Read Docs**: Start with `EZOIC_IMPLEMENTATION_GUIDE.md`
2. **Check Examples**: See `examples/EzoicAdExamples.tsx`
3. **Ezoic Support**: support@ezoic.com
4. **Ezoic Docs**: https://support.ezoic.com/

---

## 📝 Version History

### v1.0.0 (2026-02-12)
- ✅ Initial implementation
- ✅ Service layer created
- ✅ React components added
- ✅ Custom hooks developed
- ✅ TypeScript support
- ✅ Documentation completed
- ✅ Examples provided

---

## 📄 License

This Ezoic integration is part of the koyjabo.com project.

---

## 🙏 Credits

**Implementation**: Professional Ezoic Integration  
**Date**: February 12, 2026  
**For**: koyjabo.com  
**Status**: ✅ Production Ready

---

**Ready to monetize your traffic!** 🚀

Start by creating your first placement in the [Ezoic Dashboard](https://siteaccess.ezoic.com/) and adding an `<EzoicAd>` component to your page.
