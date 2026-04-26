const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'H:/koyjabo/koyjabo-core/scroll-screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function dismissOverlays(page) {
  // Try to dismiss Vite error overlay
  await page.evaluate(() => {
    const overlay = document.querySelector('vite-error-overlay');
    if (overlay) overlay.remove();
    
    const loader = document.querySelector('.loader-wrapper');
    if (loader) {
      loader.style.display = 'none';
      loader.remove();
    }
  }).catch(() => {});
  
  // Press Escape to close overlays
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  
  // Check for close button on error overlay
  const closeBtn = await page.$('vite-error-overlay button, [class*="close"], [aria-label*="close" i]');
  if (closeBtn) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }
}

async function getPageInfo(page) {
  return page.evaluate(() => {
    // Get the actual rendered content after removing overlays
    const allEls = Array.from(document.querySelectorAll('*'));
    
    // Page title or main heading
    const h1 = document.querySelector('h1, h2');
    const title = h1?.textContent?.trim().slice(0, 60) || document.title || 'unknown';
    
    // Scrollable containers (overflowY auto/scroll with content)
    const scrollables = allEls
      .filter(el => {
        const s = window.getComputedStyle(el);
        const oy = s.overflowY;
        return el.scrollHeight > el.clientHeight + 5 &&
               (oy === 'auto' || oy === 'scroll' || oy === 'overlay');
      })
      .map(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: el.className?.toString().slice(0, 100),
          id: el.id,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          canScroll: el.scrollHeight - el.clientHeight,
          overflowY: s.overflowY,
          top: Math.round(r.top),
          left: Math.round(r.left),
          height: Math.round(r.height),
          width: Math.round(r.width)
        };
      });
    
    // Hidden/clipped content (overflow:hidden but has more content)
    const clipped = allEls
      .filter(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return el.scrollHeight > el.clientHeight + 20 &&
               (s.overflowY === 'hidden' || s.overflowY === 'clip') &&
               r.height > 100 && r.width > 200;
      })
      .map(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: el.className?.toString().slice(0, 100),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          hidden: el.scrollHeight - el.clientHeight,
          height: Math.round(r.height),
          width: Math.round(r.width),
          top: Math.round(r.top)
        };
      });
    
    // Fixed/sticky elements at top
    const fixedTop = allEls
      .filter(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return (s.position === 'fixed' || s.position === 'sticky') &&
               r.height > 20 && r.height < 200 && r.width > 300 && r.top <= 5;
      })
      .map(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, cls: el.className?.toString().slice(0, 80), height: Math.round(r.height), top: Math.round(r.top) };
      });
    
    const bodyH = document.body.scrollHeight;
    const viewH = window.innerHeight;
    const bodyCanScroll = bodyH > viewH;
    const htmlOvf = window.getComputedStyle(document.documentElement).overflow;
    const bodyOvf = window.getComputedStyle(document.body).overflow;
    
    // What's visible on screen
    const visibleText = document.body.innerText?.slice(0, 200).replace(/\n+/g, ' ');
    
    return {
      title,
      bodyH,
      viewH,
      bodyCanScroll,
      htmlOvf,
      bodyOvf,
      fixedTop,
      scrollables: scrollables.slice(0, 10),
      clipped: clipped.slice(0, 5),
      visibleText
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  
  const pages = [
    { name: 'Home', url: 'http://localhost:3001/' },
    { name: 'Blog', url: 'http://localhost:3001/#blog' },
    { name: 'About', url: 'http://localhost:3001/#about' },
    { name: 'Train', url: 'http://localhost:3001/#train' },
  ];

  // First visit home to see what the app looks like
  await page.goto('http://localhost:3001/', { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(2000);
  
  await dismissOverlays(page);
  await page.waitForTimeout(500);
  
  const homeInfo = await getPageInfo(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Home_clean.png') });
  
  console.log('=== HOME PAGE INFO ===');
  console.log(JSON.stringify(homeInfo, null, 2));
  
  // Check what nav items exist
  const navItems = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('nav a, nav button, header a, header button'));
    return links.map(l => ({ text: l.textContent?.trim().slice(0,30), tag: l.tagName, href: l.getAttribute('href') }));
  });
  console.log('NAV ITEMS:', JSON.stringify(navItems));
  
  // Check hamburger/menu buttons
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim().slice(0,30),
      aria: b.getAttribute('aria-label'),
      cls: b.className?.toString().slice(0,60)
    }));
  });
  console.log('BUTTONS:', JSON.stringify(btns.slice(0, 20)));
}

main().catch(err => { console.error(err); process.exit(1); });
