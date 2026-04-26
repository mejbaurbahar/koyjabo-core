const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'H:/koyjabo/koyjabo-core/scroll-screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function getScrollData(page) {
  return page.evaluate(() => {
    const allEls = Array.from(document.querySelectorAll('*'));

    const scrollables = allEls
      .filter(el => {
        const s = window.getComputedStyle(el);
        const oy = s.overflowY;
        const r = el.getBoundingClientRect();
        return el.scrollHeight > el.clientHeight + 5 &&
               (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
               r.height > 50 && r.width > 50;
      })
      .map(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 120),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          extra: el.scrollHeight - el.clientHeight,
          top: Math.round(r.top),
          left: Math.round(r.left),
          height: Math.round(r.height),
          width: Math.round(r.width)
        };
      });

    const clipped = allEls
      .filter(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        // Only flag visible elements with significant clipping
        return el.scrollHeight > el.clientHeight + 30 &&
               (s.overflowY === 'hidden' || s.overflowY === 'clip') &&
               r.height > 100 && r.width > 200 &&
               r.top >= 0 && r.top < window.innerHeight &&
               // Exclude pure decorative absolute overlays
               !el.className.toString().includes('pointer-events-none') &&
               !el.className.toString().includes('absolute inset-0 bg-gradient');
      })
      .map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 120),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          hidden: el.scrollHeight - el.clientHeight,
          top: Math.round(r.top),
          height: Math.round(r.height),
          width: Math.round(r.width)
        };
      });

    const fixedNav = allEls
      .filter(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return s.position === 'fixed' &&
               r.height > 30 && r.height < 150 &&
               r.width > 500 && r.top <= 5;
      })
      .map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 80),
          height: Math.round(r.height)
        };
      });

    // Check if main content area fits inside viewport
    const mainEl = document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('#root > div');
    const mainInfo = mainEl ? {
      scrollH: mainEl.scrollHeight,
      clientH: mainEl.clientHeight,
      overflow: window.getComputedStyle(mainEl).overflow
    } : null;

    return {
      viewH: window.innerHeight,
      bodyScrollH: document.body.scrollHeight,
      bodyCanScroll: document.body.scrollHeight > window.innerHeight + 5,
      scrollables: scrollables.slice(0, 10),
      clipped: clipped.slice(0, 5),
      fixedNav,
      mainInfo,
      pageTitle: document.title.slice(0, 60),
      h1: (document.querySelector('h1, h2') || {}).textContent || ''
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const results = {};

  // Load home, get nav structure
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(2000);

  // Get nav buttons
  const navBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('nav button, header button, [role="navigation"] button'))
      .map(b => ({ text: b.textContent.trim(), idx: Array.from(document.querySelectorAll('button')).indexOf(b) }))
      .filter(b => b.text.length > 0 && b.text.length < 30);
  });
  console.log('Nav buttons:', JSON.stringify(navBtns));

  // HOME
  console.log('\nTesting Home...');
  const homeData = await getScrollData(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Home_v2.png') });
  results.Home = homeData;
  console.log('Home - scrollables:', homeData.scrollables.length, 'clipped:', homeData.clipped.length, 'fixedNav:', homeData.fixedNav.length);
  if (homeData.scrollables.length) homeData.scrollables.forEach(s => console.log('  scroll:', s.tag, 'extra='+s.extra+'px', 'top='+s.top, 'h='+s.height, 'w='+s.width));
  if (homeData.clipped.length) homeData.clipped.forEach(c => console.log('  CLIPPED:', c.tag, 'hidden='+c.hidden+'px', c.cls.slice(0,60)));
  if (homeData.fixedNav.length) console.log('  Fixed nav height:', homeData.fixedNav[0].height + 'px');

  // Test clicking each nav item and capturing state
  const navKeywords = [
    { name: 'Blog', texts: ['ব্লগ', 'blog', 'Blog'] },
    { name: 'About', texts: ['পরিচয়', 'about', 'About', 'আমাদের'] },
    { name: 'Train', texts: ['ট্রেন', 'train', 'Train'] },
    { name: 'AI_Assistant', texts: ['এআই সহায়ক', 'AI', 'assistant', 'সহায়ক'] },
  ];

  for (const nav of navKeywords) {
    console.log('\nTesting', nav.name + '...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(1500);

    let clicked = false;
    for (const keyword of nav.texts) {
      const btns = await page.$$('button, a, [role="button"]');
      for (const btn of btns) {
        try {
          const txt = (await btn.textContent() || '').trim();
          if (txt === keyword || txt.toLowerCase() === keyword.toLowerCase()) {
            await btn.click();
            await page.waitForTimeout(1000);
            clicked = true;
            break;
          }
        } catch(e) {}
      }
      if (clicked) break;
    }

    const data = await getScrollData(page);
    const url = page.url();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, nav.name + '_v2.png') });
    results[nav.name] = { ...data, url, navigated: clicked };
    console.log(nav.name, '- url:', url, 'scrollables:', data.scrollables.length, 'clipped:', data.clipped.length, 'navH:', data.fixedNav[0] ? data.fixedNav[0].height : 0);
    if (data.scrollables.length) data.scrollables.forEach(s => console.log('  scroll:', s.tag, 'extra='+s.extra+'px', 'top='+s.top, 'h='+s.height, 'w='+s.width));
    if (data.clipped.length) data.clipped.forEach(c => console.log('  CLIPPED:', c.tag, 'hidden='+c.hidden+'px', c.cls.slice(0, 80)));
  }

  // Hamburger menu items
  const hamburgerTests = [
    { name: 'Road_Alerts', texts: ['রোড অ্যালার্ট', 'Road Alert', 'road', 'সতর্ক', 'যানজট'] },
    { name: 'Trip_Reminders', texts: ['ট্রিপ রিমাইন্ডার', 'Trip Reminder', 'reminder', 'রিমাইন্ডার'] },
  ];

  for (const nav of hamburgerTests) {
    console.log('\nTesting', nav.name + '...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(1500);

    // Try to find hamburger
    let menuOpened = false;
    const allBtns = await page.$$('button');
    for (const btn of allBtns) {
      try {
        const cls = (await btn.getAttribute('class') || '').toLowerCase();
        const aria = (await btn.getAttribute('aria-label') || '').toLowerCase();
        const txt = (await btn.textContent() || '').trim();
        if (cls.includes('menu') || cls.includes('hamburger') || aria.includes('menu') || txt === '☰' || txt === 'Menu') {
          await btn.click();
          await page.waitForTimeout(500);
          menuOpened = true;
          break;
        }
      } catch(e) {}
    }

    // Try nav texts
    let clicked = false;
    for (const keyword of nav.texts) {
      const els = await page.$$('button, a, li, [role="menuitem"]');
      for (const el of els) {
        try {
          const txt = (await el.textContent() || '').toLowerCase().trim();
          if (txt.includes(keyword.toLowerCase())) {
            await el.click();
            await page.waitForTimeout(1000);
            clicked = true;
            break;
          }
        } catch(e) {}
      }
      if (clicked) break;
    }

    const data = await getScrollData(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, nav.name + '_v2.png') });
    results[nav.name] = { ...data, url: page.url(), navigated: clicked, menuOpened };
    console.log(nav.name, '- url:', page.url(), 'scrollables:', data.scrollables.length, 'clipped:', data.clipped.length);
    if (data.scrollables.length) data.scrollables.forEach(s => console.log('  scroll:', s.tag, 'extra='+s.extra+'px', 'top='+s.top, 'h='+s.height, 'w='+s.width));
    if (data.clipped.length) data.clipped.forEach(c => console.log('  CLIPPED:', c.tag, 'hidden='+c.hidden+'px', c.cls.slice(0,80)));
  }

  // Detailed home scroll analysis
  console.log('\n=== DETAILED HOME SCROLL ANALYSIS ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(2000);
  const homeDetailed = await page.evaluate(() => {
    const allEls = Array.from(document.querySelectorAll('*'));
    // Find the bus list sidebar
    const sidebarCandidates = allEls.filter(el => {
      const r = el.getBoundingClientRect();
      const s = window.getComputedStyle(el);
      return r.width > 200 && r.width < 600 && r.height > 200 && r.top > 50 && r.left < 50;
    }).map(el => {
      const r = el.getBoundingClientRect();
      const s = window.getComputedStyle(el);
      return { tag: el.tagName, cls: (el.className||'').toString().slice(0,100), overflowY: s.overflowY, scrollH: el.scrollHeight, clientH: el.clientHeight, top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left) };
    });

    return { sidebarCandidates: sidebarCandidates.slice(0, 10) };
  });
  console.log('Sidebar candidates:', JSON.stringify(homeDetailed.sidebarCandidates, null, 2));

  await browser.close();

  console.log('\n\n====== FINAL SCROLL ISSUE SUMMARY ======');
  for (const [name, data] of Object.entries(results)) {
    const issues = [];
    if (data.clipped && data.clipped.length > 0) {
      data.clipped.forEach(c => issues.push('CONTENT CLIPPED: ' + c.hidden + 'px hidden in ' + c.tag + ' (overflow:hidden)'));
    }
    if (!data.bodyCanScroll && (!data.scrollables || data.scrollables.length === 0)) {
      if (data.bodyScrollH > data.viewH) issues.push('No scroll mechanism for tall content');
    }

    const navH = data.fixedNav && data.fixedNav[0] ? data.fixedNav[0].height : 0;
    if (navH > 0 && data.scrollables && data.scrollables.length > 0) {
      const mainScrollable = data.scrollables.find(s => s.width > 300);
      if (mainScrollable && mainScrollable.top < navH) {
        issues.push('Fixed nav (' + navH + 'px) overlaps scrollable starting at top=' + mainScrollable.top + 'px');
      }
    }

    console.log(name + ': ' + (issues.length ? 'ISSUES: ' + issues.join('; ') : 'OK'));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
