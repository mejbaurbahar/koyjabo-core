const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'H:/koyjabo/koyjabo-core/scroll-screenshots';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // About page - scroll test
  console.log('=== ABOUT PAGE DETAIL ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  // Click About nav button (text: পরিচয়)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const about = btns.find(b => b.textContent.trim() === 'পরিচয়');
    if (about) about.click();
  });
  await page.waitForTimeout(1500);
  console.log('URL:', page.url());

  const aboutInfo = await page.evaluate(() => {
    const body = document.body;
    const s = window.getComputedStyle(body);
    const main = document.querySelector('main') || document.querySelector('[class*="main"]');
    const mainS = main ? window.getComputedStyle(main) : null;
    
    // Find the actual content area
    const contentDivs = Array.from(document.querySelectorAll('div')).filter(el => {
      const r = el.getBoundingClientRect();
      const s2 = window.getComputedStyle(el);
      return r.width > 600 && r.height > 300 && r.top >= 0 && r.top < 200;
    }).map(el => {
      const s2 = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { cls: (el.className||'').toString().slice(0, 100), overflowY: s2.overflowY, scrollH: el.scrollHeight, clientH: el.clientH || el.clientHeight, top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) };
    }).slice(0, 8);

    return {
      bodyOverflow: s.overflow,
      bodyOverflowY: s.overflowY,
      bodyScrollH: body.scrollHeight,
      bodyClientH: body.clientHeight,
      viewH: window.innerHeight,
      contentDivs
    };
  });
  console.log(JSON.stringify(aboutInfo, null, 2));
  
  // Try to scroll on about page
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(300);
  const scrollY = await page.evaluate(() => window.scrollY);
  console.log('Scrolled to:', scrollY, '(expected 500)');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'About_scrolled.png') });
  
  // Back to top screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'About_top.png') });

  // Train page detail
  console.log('\n=== TRAIN PAGE DETAIL ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const train = btns.find(b => b.textContent.trim() === 'ট্রেন');
    if (train) train.click();
  });
  await page.waitForTimeout(1500);
  console.log('URL:', page.url());

  const trainInfo = await page.evaluate(() => {
    const body = document.body;
    const s = window.getComputedStyle(body);
    
    // Try to scroll
    const initScrollY = window.scrollY;
    window.scrollTo(0, 300);
    const afterScrollY = window.scrollY;
    window.scrollTo(0, 0);
    
    const allEls = Array.from(document.querySelectorAll('*'));
    const scrollableInTrain = allEls.filter(el => {
      const s2 = window.getComputedStyle(el);
      const oy = s2.overflowY;
      const r = el.getBoundingClientRect();
      return el.scrollHeight > el.clientHeight + 5 &&
             (oy === 'auto' || oy === 'scroll') &&
             r.height > 100 && r.width > 100 && r.top >= 0;
    }).map(el => {
      const r = el.getBoundingClientRect();
      const s2 = window.getComputedStyle(el);
      return { tag: el.tagName, cls: (el.className||'').toString().slice(0,120), overflowY: s2.overflowY, scrollH: el.scrollHeight, clientH: el.clientHeight, top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) };
    });

    return {
      bodyOverflowY: s.overflowY,
      bodyScrollH: body.scrollHeight,
      viewH: window.innerHeight,
      canScrollBody: afterScrollY > initScrollY,
      scrollableInTrain: scrollableInTrain.slice(0, 5)
    };
  });
  console.log(JSON.stringify(trainInfo, null, 2));
  
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Train_detail.png') });
  // Scroll train list
  await page.evaluate(() => {
    const list = document.querySelector('[class*="overflow-y-auto"]');
    if (list) list.scrollTop = 400;
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Train_scrolled.png') });

  // Find Road Alerts and Trip Reminders
  console.log('\n=== FINDING ROAD ALERTS & TRIP REMINDERS ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  // Look for hamburger
  const hamburgers = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.map((b, i) => ({ i, text: b.textContent.trim().slice(0, 30), cls: (b.className||'').toString().slice(0,50), aria: b.getAttribute('aria-label') })).slice(-5);
  });
  console.log('Last 5 buttons (looking for hamburger):', JSON.stringify(hamburgers));
  
  // Click hamburger (the last button with menu icon)
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const hamburger = btns.find(b => {
      const cls = (b.className||'').toString().toLowerCase();
      const aria = (b.getAttribute('aria-label')||'').toLowerCase();
      return cls.includes('hamburger') || aria.includes('menu') || 
             (b.innerHTML.includes('svg') && b.textContent.trim() === '');
    }) || btns[btns.length - 1]; // last button
    if (hamburger) { hamburger.click(); return hamburger.textContent.trim(); }
    return 'not found';
  });
  console.log('Hamburger clicked:', clicked);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Hamburger_menu.png') });
  
  // Get all visible menu items
  const menuItems = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, li, [role="menuitem"]'))
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.top > 0;
      })
      .map(el => ({ text: el.textContent.trim().slice(0, 30), tag: el.tagName, visible: true }))
      .filter(i => i.text.length > 0)
      .slice(0, 50);
  });
  console.log('Visible menu items after hamburger:', JSON.stringify(menuItems.slice(0, 30)));

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
