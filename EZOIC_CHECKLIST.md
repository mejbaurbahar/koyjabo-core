# ✅ Ezoic Implementation Checklist

Use this checklist to track your Ezoic integration progress for **koyjabo.com**.

---

## Phase 1: Initial Setup ✅ COMPLETE

### Step 1.1: Site Integration
- [x] ✅ Add Ezoic privacy scripts to `index.html`
- [x] ✅ Add Ezoic header script to `index.html`
- [x] ✅ Add scripts to `intercity/index.html`
- [x] ✅ Add scripts to `intercity-route-finder/index.html`
- [x] ✅ Add scripts to `dhaka-alive-landing/index.html`
- [x] ✅ Verify scripts load in correct order (privacy first)

### Step 1.2: ads.txt Configuration
- [x] ✅ Add ads.txt redirect to `vercel.json`
- [x] ✅ Create `.htaccess` file for Apache
- [x] ✅ Configure redirect to Ezoic's manager

### Step 1.3: Code Infrastructure
- [x] ✅ Create `services/ezoicService.ts`
- [x] ✅ Create `components/EzoicAd.tsx`
- [x] ✅ Create `components/EzoicAdScript.tsx`
- [x] ✅ Create `hooks/useEzoic.ts`
- [x] ✅ Create `types/ezoic.d.ts`
- [x] ✅ Create example files

### Step 1.4: Documentation
- [x] ✅ Create implementation guide
- [x] ✅ Create quick reference
- [x] ✅ Create summary document
- [x] ✅ Create README files
- [x] ✅ Create usage examples

---

## Phase 2: Ezoic Dashboard Setup ⏳ YOUR ACTION REQUIRED

### Step 2.1: Account Setup
- [ ] ⏳ Log into Ezoic Dashboard
- [ ] ⏳ Verify domain ownership
- [ ] ⏳ Complete account setup

### Step 2.2: Create Ad Placements
Go to **Ad Tester** → **Placeholders** and create:

#### Homepage Placements
- [ ] ⏳ **Placement 101** - Top Banner (728x90, 970x90)
- [ ] ⏳ **Placement 102** - Sidebar (300x250, 300x600)
- [ ] ⏳ **Placement 103** - In-Content (336x280, 300x250)
- [ ] ⏳ **Placement 104** - Footer (728x90, 320x50)

#### Blog/Article Placements
- [ ] ⏳ **Placement 201** - Top of Article (728x90, 970x90)
- [ ] ⏳ **Placement 202** - Mid-Article (336x280, 300x250)
- [ ] ⏳ **Placement 203** - End of Article (728x90, 300x250)
- [ ] ⏳ **Placement 204** - Sidebar (300x250, 300x600)

#### Search Results Placements
- [ ] ⏳ **Placement 301** - Above Results (728x90, 970x90)
- [ ] ⏳ **Placement 302** - Between Results (336x280, 300x250)
- [ ] ⏳ **Placement 303** - Below Results (728x90, 300x250)

#### Dynamic Content Placements (Optional)
- [ ] ⏳ **Placement 401-410** - Tabs, Modals, Popups
- [ ] ⏳ **Placement 501-600** - Infinite Scroll
- [ ] ⏳ **Placement 701-710** - Mobile-Specific

---

## Phase 3: Implementation ⏳ YOUR ACTION REQUIRED

### Step 3.1: Homepage Implementation
- [ ] ⏳ Open `App.tsx` or main homepage component
- [ ] ⏳ Import `EzoicAd` component
- [ ] ⏳ Add top banner ad (Placement 101)
- [ ] ⏳ Add sidebar ad (Placement 102)
- [ ] ⏳ Add in-content ad (Placement 103)
- [ ] ⏳ Add footer ad (Placement 104)
- [ ] ⏳ Test on local dev server

### Step 3.2: Blog/Article Pages
- [ ] ⏳ Open blog component file
- [ ] ⏳ Import `EzoicAd` component
- [ ] ⏳ Add top ad (Placement 201)
- [ ] ⏳ Add mid-article ad (Placement 202)
- [ ] ⏳ Add end ad (Placement 203)
- [ ] ⏳ Add sidebar ad (Placement 204)
- [ ] ⏳ Test on local dev server

### Step 3.3: Search/Route Results
- [ ] ⏳ Open search results component
- [ ] ⏳ Import `EzoicAd` component
- [ ] ⏳ Add top ad (Placement 301)
- [ ] ⏳ Add ad between results (Placement 302)
- [ ] ⏳ Add bottom ad (Placement 303)
- [ ] ⏳ Test with different result counts

### Step 3.4: SPA Navigation (if applicable)
- [ ] ⏳ Import `useEzoicPageChange` hook
- [ ] ⏳ Add to App.tsx or root component
- [ ] ⏳ Pass route dependency (e.g., `location.pathname`)
- [ ] ⏳ Test route changes
- [ ] ⏳ Verify ads refresh on navigation

---

## Phase 4: Testing ⏳ YOUR ACTION REQUIRED

### Step 4.1: Local Testing
- [ ] ⏳ Run dev server: `npm run dev`
- [ ] ⏳ Check browser console for errors
- [ ] ⏳ Verify `window.ezstandalone` exists
- [ ] ⏳ Check Network tab for Ezoic scripts
- [ ] ⏳ Confirm all scripts load successfully

### Step 4.2: ads.txt Verification
- [ ] ⏳ Deploy to staging/production
- [ ] ⏳ Visit `https://koyjabo.com/ads.txt`
- [ ] ⏳ Verify redirect to Ezoic server
- [ ] ⏳ Confirm authorized sellers list appears

### Step 4.3: Ad Display Testing
- [ ] ⏳ Wait 24-48 hours for Ezoic approval
- [ ] ⏳ Enable Ezoic testing mode
- [ ] ⏳ Verify ads appear on homepage
- [ ] ⏳ Verify ads appear on blog pages
- [ ] ⏳ Verify ads appear on search pages
- [ ] ⏳ Test on mobile devices
- [ ] ⏳ Test on different browsers

### Step 4.4: Responsive Testing
- [ ] ⏳ Test on mobile (320px - 767px)
- [ ] ⏳ Test on tablet (768px - 1023px)
- [ ] ⏳ Test on desktop (1024px+)
- [ ] ⏳ Verify ad sizes are appropriate
- [ ] ⏳ Check page layout doesn't break

---

## Phase 5: Deployment ⏳ YOUR ACTION REQUIRED

### Step 5.1: Staging Deployment
- [ ] ⏳ Deploy to staging environment
- [ ] ⏳ Run full test suite
- [ ] ⏳ Verify all ads load correctly
- [ ] ⏳ Check performance metrics
- [ ] ⏳ Test user experience

### Step 5.2: Production Deployment
- [ ] ⏳ Review all changes
- [ ] ⏳ Build production bundle: `npm run build`
- [ ] ⏳ Deploy to production: `vercel --prod`
- [ ] ⏳ Verify deployment successful
- [ ] ⏳ Monitor error logs

### Step 5.3: Post-Deployment Verification
- [ ] ⏳ Visit live site: https://koyjabo.com
- [ ] ⏳ Check ads.txt: https://koyjabo.com/ads.txt
- [ ] ⏳ Verify ads loading on live site
- [ ] ⏳ Test all major pages
- [ ] ⏳ Check mobile version

---

## Phase 6: Monitoring & Optimization ⏳ ONGOING

### Step 6.1: Initial Monitoring (First Week)
- [ ] ⏳ Check Ezoic Dashboard daily
- [ ] ⏳ Monitor ad viewability metrics
- [ ] ⏳ Track EPMV (earnings per 1000 visits)
- [ ] ⏳ Watch for error reports
- [ ] ⏳ Review user feedback

### Step 6.2: Performance Monitoring
- [ ] ⏳ Check Core Web Vitals
- [ ] ⏳ Monitor page load times
- [ ] ⏳ Track user engagement metrics
- [ ] ⏳ Analyze bounce rate changes
- [ ] ⏳ Review session duration

### Step 6.3: A/B Testing
- [ ] ⏳ Create placement variations in Ezoic
- [ ] ⏳ Run A/B tests on ad positions
- [ ] ⏳ Test different ad sizes
- [ ] ⏳ Analyze results
- [ ] ⏳ Implement winning variations

### Step 6.4: Optimization
- [ ] ⏳ Review top-performing placements
- [ ] ⏳ Disable low-performing placements
- [ ] ⏳ Test new placement positions
- [ ] ⏳ Optimize for mobile users
- [ ] ⏳ Fine-tune ad density

---

## Phase 7: Advanced Features ⏳ OPTIONAL

### Step 7.1: Dynamic Content
- [ ] ⏳ Implement infinite scroll ads
- [ ] ⏳ Add modal/popup ads
- [ ] ⏳ Create tab-based ad loading
- [ ] ⏳ Test dynamic ad refresh

### Step 7.2: Conditional Logic
- [ ] ⏳ Hide ads for premium users
- [ ] ⏳ Implement geo-targeting
- [ ] ⏳ Create time-based ad display
- [ ] ⏳ Add user-preference controls

### Step 7.3: Advanced Analytics
- [ ] ⏳ Set up custom events
- [ ] ⏳ Track ad interaction rates
- [ ] ⏳ Monitor revenue by page
- [ ] ⏳ Create custom reports

---

## 🎯 Quick Status Check

**Overall Progress**: ~40% Complete

| Phase | Status | Completion |
|-------|--------|------------|
| 1. Initial Setup | ✅ Complete | 100% |
| 2. Dashboard Setup | ⏳ Pending | 0% |
| 3. Implementation | ⏳ Pending | 0% |
| 4. Testing | ⏳ Pending | 0% |
| 5. Deployment | ⏳ Pending | 0% |
| 6. Monitoring | ⏳ Ongoing | - |
| 7. Advanced Features | ⏳ Optional | - |

---

## 📅 Recommended Timeline

| Day | Tasks |
|-----|-------|
| **Today** | ✅ Initial setup (DONE) |
| **Day 1** | ⏳ Dashboard setup, create placements |
| **Day 2** | ⏳ Implement ads on homepage |
| **Day 3** | ⏳ Implement ads on other pages |
| **Day 4** | ⏳ Testing and fixes |
| **Day 5** | ⏳ Deploy to staging |
| **Day 6-7** | ⏳ Final testing, production deployment |
| **Week 2+** | ⏳ Monitoring and optimization |

---

## 🚨 Critical Reminders

### Before Going Live
- [ ] ⚠️ Create at least 4 placements in dashboard
- [ ] ⚠️ Test ads.txt redirect works
- [ ] ⚠️ Verify scripts load correctly
- [ ] ⚠️ Test on mobile devices
- [ ] ⚠️ Check page performance
- [ ] ⚠️ Review user experience

### After Going Live
- [ ] ⚠️ Monitor for 48 hours
- [ ] ⚠️ Check error logs
- [ ] ⚠️ Review Ezoic analytics
- [ ] ⚠️ Gather user feedback
- [ ] ⚠️ Plan optimizations

---

## 📞 Getting Help

If you get stuck at any step:

1. **Documentation**: Check relevant guide in this repo
2. **Examples**: Review `examples/EzoicAdExamples.tsx`
3. **Ezoic Support**: support@ezoic.com
4. **Ezoic Community**: https://community.ezoic.com/

---

## ✨ Success Criteria

You'll know the implementation is successful when:

- ✅ ads.txt redirects correctly
- ✅ Ezoic scripts load without errors
- ✅ Ads display on your pages
- ✅ Page performance is acceptable (LCP < 2.5s)
- ✅ User experience is not degraded
- ✅ Revenue starts appearing in dashboard

---

**Last Updated**: February 12, 2026  
**Status**: Phase 1 Complete, Ready for Phase 2  
**Next Action**: Create placements in Ezoic Dashboard

---

Good luck with your monetization! 🚀
