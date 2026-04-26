const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = 'H:/koyjabo/koyjabo-core/scroll-screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function getScrollMetrics(page) {
  return page.evaluate(() => {
    const allEls = Array.from(document.querySelectorAll('*'));

    // Fixed/sticky nav bars
    const fixedBars = allEls
      .filter(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return (s.position === 'fixed' || s.position === 'sticky') &&
               r.height > 20 && r.width > 200 && r.top < 100;
      })
      .map(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, cls: el.className?.toString().slice(0, 80), pos: s.position, top: s.top, height: Math.round(r.height) };
      });

    // Scrollable containers
    const scrollables = allEls
      .filter(el => {
        const s = window.getComputedStyle(el);
        const oy = s.overflowY;
        return el.scrollHeight > el.clientHeight + 2 &&
               (oy === 'auto' || oy === 'scroll' || oy === 'overlay');
      })
      .map(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: el.className?.toString().slice(0, 100),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          overflowY: s.overflowY,
          top: Math.round(r.top),
          height: Math.round(r.height),
          width: Math.round(r.width)
        };
      });

    // Check if body/html is scrollable
    const bodyScrollable = document.body.scrollHeight > window.innerHeight;
    const htmlOverflow = window.getComputedStyle(document.documentElement).overflow;
    const bodyOverflow = window.getComputedStyle(document.body).overflow;

    // Check for content overflow (clipped without scroll)
    const clipped = allEls
      .filter(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const oy = s.overflowY;
        return el.scrollHeight > el.clientHeight + 10 &&
               (oy === 'hidden' || oy === 'clip') &&
               r.height > 50 && r.width > 100;
      })
      .slice(0, 5)
      .map(el => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, cls: el.className?.toString().slice(0, 100), scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
      });

    return {
      viewportH: window.innerHeight,
      bodyScrollable,
      htmlOverflow,
      bodyOverflow,
      fixedBars,
      scrollables: scrollables.slice(0, 8),
      clipped: clipped
    };
  });
}

async function navigateTo(page, label) {
  // Try clicking hamburger/menu button
  const hamburgerSelectors = [
    'button[aria-label*="menu" i]',
    'button[aria-label*="navigation" i]',
    '[class*="hamburger"]',
    '[class*="menu-toggle"]',
    '[class*="nav-toggle"]',
    'button svg[class*="menu"]',
    'button.menu',
    '[data-testid="hamburger"]',
  ];

  let opened = false;
  for (const sel of hamburgerSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.click();
        await page.waitForTimeout(600);
        opened = true;
        break;
      }
    } catch(e) {}
  }

  if (!opened) {
    // Try any button with menu icon
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await btn.textContent();
      const aria = await btn.getAttribute('aria-label') || '';
      if (text?.includes('☰') || aria.toLowerCase().includes('menu')) {
        await btn.click();
        await page.waitForTimeout(600);
        opened = true;
        break;
      }
    }
  }

  // Now find the menu item
  const links = await page.$$('a, button, [role="menuitem"], [role="link"]');
  for (const link of links) {
    const text = await link.textContent();
    if (text && text.trim().toLowerCase().includes(label.toLowerCase())) {
      await link.click();
      await page.waitForTimeout(1500);
      return true;
    }
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const report = [];

  async function testPage(name, action) {
    console.log(`\nTesting: ${name}`);
    try {
      await action();
      await page.waitForTimeout(1000);
      const metrics = await getScrollMetrics(page);
      const url = page.url();
      const ss = path.join(SCREENSHOT_DIR, `${name.replace(/\s+/g, '_')}.png`);
      await page.screenshot({ path: ss, fullPage: false });

      // Assess issues
      const issues = [];

      // Check if there are scrollable areas (good) vs totally locked
      const hasScrollable = metrics.scrollables.length > 0 || metrics.bodyScrollable;
      if (!hasScrollable) {
        // Check if page has significant content that should scroll
        const pageH = await page.evaluate(() => document.body.scrollHeight);
        if (pageH > 900) {
          issues.push(`Content height ${pageH}px but NO scrollable container found - content likely cut off`);
        }
      }

      // Check clipped content
      for (const c of metrics.clipped) {
        issues.push(`CLIPPED: ${c.tag}.${c.cls?.slice(0,40)} scrollH=${c.scrollHeight} clientH=${c.clientHeight} - overflow:hidden hides content`);
      }

      // Check if fixed nav overlaps content
      const topNavH = metrics.fixedBars.length > 0 ? metrics.fixedBars[0].height : 0;
      if (topNavH > 0) {
        // Check if any scrollable container starts below nav
        const topScrollable = metrics.scrollables.find(s => s.width > 400);
        if (topScrollable && topScrollable.top < topNavH) {
          issues.push(`Fixed nav (${topNavH}px) may overlap scrollable area starting at top=${topScrollable.top}px`);
        }
      }

      report.push({ name, url, issues, metrics: { fixedBars: metrics.fixedBars, scrollables: metrics.scrollables.length, clipped: metrics.clipped.length, bodyScrollable: metrics.bodyScrollable }, ss });
      console.log(`  Issues: ${issues.length ? issues.join(' | ') : 'None detected'}`);
      console.log(`  Scrollables: ${metrics.scrollables.length}, Clipped: ${metrics.clipped.length}, NavH: ${topNavH}`);
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      report.push({ name, error: err.message });
    }
  }

  // 1. Home page
  await testPage('Home', async () => {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 20000 });
  });

  // Also scroll down on home to see more
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Home_scrolled.png') });
  await page.evaluate(() => window.scrollTo(0, 0));

  // 2. Blog page
  await testPage('Blog', async () => {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(500);
    const found = await navigateTo(page, 'blog');
    if (!found) {
      // Try direct URL patterns
      await page.goto('http://localhost:3001/#/blog', { waitUntil: 'networkidle', timeout: 10000 });
    }
  });

  // 3. About page
  await testPage('About', async () => {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(500);
    const found = await navigateTo(page, 'about');
    if (!found) {
      await page.goto('http://localhost:3001/#/about', { waitUntil: 'networkidle', timeout: 10000 });
    }
  });

  // 4. Train search page
  await testPage('Train', async () => {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(500);
    const found = await navigateTo(page, 'train');
    if (!found) {
      await page.goto('http://localhost:3001/#/train', { waitUntil: 'networkidle', timeout: 10000 });
    }
  });

  // 5. Road Alerts
  await testPage('Road_Alerts', async () => {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(500);
    const found = await navigateTo(page, 'road alert');
    if (!found) {
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 20000 });
      await navigateTo(page, 'alert');
    }
  });

  // 6. Trip Reminders
  await testPage('Trip_Reminders', async () => {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(500);
    const found = await navigateTo(page, 'trip reminder');
    if (!found) {
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 20000 });
      await navigateTo(page, 'reminder');
    }
  });

  // 7. AI Assistant
  await testPage('AI_Assistant', async () => {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(500);
    const found = await navigateTo(page, 'ai assistant');
    if (!found) {
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 20000 });
      await navigateTo(page, 'assistant');
    }
  });

  await browser.close();

  console.log('\n\n===== FULL REPORT =====');
  console.log(JSON.stringify(report, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
