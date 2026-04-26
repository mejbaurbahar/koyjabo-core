const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = 'H:/koyjabo/koyjabo-core/scroll-screenshots';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(2000);

  // Find the hamburger (last button in header/nav area)
  const allBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, [role="button"]')).map((b, i) => {
      const r = b.getBoundingClientRect();
      return {
        i,
        text: b.textContent.trim().slice(0, 20),
        cls: (b.className||'').toString().slice(0, 80),
        aria: b.getAttribute('aria-label'),
        top: Math.round(r.top),
        left: Math.round(r.left),
        w: Math.round(r.width),
        h: Math.round(r.height),
        hasInnerSVG: b.querySelector('svg') !== null
      };
    }).filter(b => b.h > 0 && b.w > 0);
  });
  
  // Find buttons in top nav area (top < 100)
  const topBtns = allBtns.filter(b => b.top < 100 && b.top > 0);
  console.log('Top nav buttons:', JSON.stringify(topBtns.map(b => ({i: b.i, text: b.text, left: b.left, hasIcon: b.hasInnerSVG}))));

  // Click the hamburger (button with no text but svg, or the rightmost button)
  const hamburgerBtn = topBtns.find(b => (b.text === '' || b.text.length < 3) && b.hasInnerSVG && b.left > 900);
  console.log('Hamburger candidate:', hamburgerBtn);
  
  if (hamburgerBtn) {
    const btns = await page.$$('button');
    await btns[hamburgerBtn.i].click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Hamburger_clicked.png') });
    
    // Now get menu items
    const menuItems = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a, li, [role="menuitem"], [role="option"]'))
        .map(el => {
          const r = el.getBoundingClientRect();
          return {
            text: el.textContent.trim().slice(0, 40),
            tag: el.tagName,
            top: Math.round(r.top),
            left: Math.round(r.left),
            visible: r.width > 0 && r.height > 0
          };
        })
        .filter(i => i.text && i.visible)
        .slice(0, 50);
    });
    console.log('\nMenu items after hamburger click:', JSON.stringify(menuItems));
    
    // Look for Road Alerts
    const roadAlert = menuItems.find(i => i.text.toLowerCase().includes('road') || i.text.includes('রোড') || i.text.includes('সতর্ক') || i.text.includes('ট্রাফিক'));
    console.log('Road Alert found:', roadAlert);
    
    const tripReminder = menuItems.find(i => i.text.toLowerCase().includes('trip') || i.text.toLowerCase().includes('reminder') || i.text.includes('রিমাইন্ডার') || i.text.includes('ট্রিপ'));
    console.log('Trip Reminder found:', tripReminder);
  }

  // Also check About page scroll in more detail
  console.log('\n=== ABOUT PAGE SCROLL ===');
  await page.goto('http://localhost:3001/about', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  
  const aboutScrollData = await page.evaluate(() => {
    // Can the page actually scroll?
    const before = window.scrollY;
    window.scrollTo(0, 300);
    const after = window.scrollY;
    window.scrollTo(0, 0);
    
    // Find the content container
    const allEls = Array.from(document.querySelectorAll('*'));
    const contentEl = allEls.find(el => {
      const s = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') &&
             el.scrollHeight > el.clientHeight + 50 &&
             r.width > 400 && r.top >= 70;
    });

    return {
      bodyOverflowY: window.getComputedStyle(document.body).overflowY,
      bodyScrollH: document.body.scrollHeight,
      canPageScroll: after > before,
      contentScrollable: contentEl ? { cls: (contentEl.className||'').toString().slice(0,100), scrollH: contentEl.scrollHeight, clientH: contentEl.clientHeight } : null
    };
  });
  console.log(JSON.stringify(aboutScrollData, null, 2));

  // Also check Train
  console.log('\n=== TRAIN PAGE SCROLL ===');
  await page.goto('http://localhost:3001/train', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  
  const trainScrollData = await page.evaluate(() => {
    const before = window.scrollY;
    window.scrollTo(0, 300);
    const after = window.scrollY;
    window.scrollTo(0, 0);
    
    const allEls = Array.from(document.querySelectorAll('*'));
    const trainList = allEls.find(el => {
      const s = window.getComputedStyle(el);
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') &&
             el.scrollHeight > el.clientHeight + 50;
    });

    return {
      bodyOverflowY: window.getComputedStyle(document.body).overflowY,
      bodyScrollH: document.body.scrollHeight,
      canPageScroll: after > before,
      trainListScrollable: trainList ? { cls: (trainList.className||'').toString().slice(0,100), scrollH: trainList.scrollHeight, clientH: trainList.clientHeight } : null
    };
  });
  console.log(JSON.stringify(trainScrollData, null, 2));

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
