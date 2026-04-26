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
          cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 100),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          extra: el.scrollHeight - el.clientHeight,
          overflowY: s.overflowY,
          top: Math.round(r.top),
          height: Math.round(r.height),
          width: Math.round(r.width)
        };
      });

    const clipped = allEls
      .filter(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return el.scrollHeight > el.clientHeight + 30 &&
               (s.overflowY === 'hidden' || s.overflowY === 'clip') &&
               r.height > 80 && r.width > 100 &&
               r.top >= 0 && r.top < window.innerHeight;
      })
      .map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 100),
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

    return {
      viewH: window.innerHeight,
      bodyScrollH: document.body.scrollHeight,
      bodyCanScroll: document.body.scrollHeight > window.innerHeight + 5,
      scrollables: scrollables.slice(0, 10),
      clipped: clipped.slice(0, 5),
      fixedNav
    };
  });
}

async function capture(page, name) {
  const ssPath = path.join(SCREENSHOT_DIR, name + '.png');
  await page.screenshot({ path: ssPath, fullPage: false });
  const data = await getScrollData(page);
  return { ssPath, ...data };
}

async function openMenuAndClick(page, keyword) {
  // Try clicking hamburger/menu button
  const btns = await page.$$('button');
  for (const btn of btns) {
    try {
      const aria = (await btn.getAttribute('aria-label') || '').toLowerCase();
      const cls = (await btn.getAttribute('class') || '').toLowerCase();
      const txt = (await btn.textContent() || '').trim();
      if (aria.includes('menu') || cls.includes('hamburger') || cls.includes('menu-toggle') || txt === 'Menu' || txt === 'menu') {
        await btn.click();
        await page.waitForTimeout(400);
        break;
      }
    } catch(e) {}
  }

  const allEls = await page.$$('a, button, [role="menuitem"], li');
  for (const el of allEls) {
    try {
      const txt = (await el.textContent() || '').toLowerCase().trim();
      if (txt.includes(keyword.toLowerCase())) {
        await el.click();
        await page.waitForTimeout(1500);
        return true;
      }
    } catch(e) {}
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const results = {};

  // HOME
  console.log('Testing Home...');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(2000);
  results.Home = await capture(page, 'Home');
  results.Home.url = page.url();

  // Get nav structure at home for debugging
  const navItems = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a, [role="button"]'))
      .map(el => ({
        text: (el.textContent || '').trim().slice(0, 30),
        tag: el.tagName,
        cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 50),
        aria: el.getAttribute('aria-label')
      }))
      .filter(i => i.text && i.text.length > 0)
      .slice(0, 30);
  });
  console.log('Nav items:', JSON.stringify(navItems));

  // BLOG
  console.log('Testing Blog...');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  await openMenuAndClick(page, 'blog');
  results.Blog = await capture(page, 'Blog');
  results.Blog.url = page.url();

  // ABOUT
  console.log('Testing About...');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  await openMenuAndClick(page, 'about');
  results.About = await capture(page, 'About');
  results.About.url = page.url();

  // TRAIN
  console.log('Testing Train...');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  await openMenuAndClick(page, 'train');
  results.Train = await capture(page, 'Train');
  results.Train.url = page.url();

  // ROAD ALERTS
  console.log('Testing Road Alerts...');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  const roadOk = await openMenuAndClick(page, 'road') || await openMenuAndClick(page, 'alert');
  results.Road_Alerts = await capture(page, 'Road_Alerts');
  results.Road_Alerts.url = page.url();

  // TRIP REMINDERS
  console.log('Testing Trip Reminders...');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  await openMenuAndClick(page, 'reminder') || await openMenuAndClick(page, 'trip');
  results.Trip_Reminders = await capture(page, 'Trip_Reminders');
  results.Trip_Reminders.url = page.url();

  // AI ASSISTANT
  console.log('Testing AI Assistant...');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1500);
  await openMenuAndClick(page, 'ai') || await openMenuAndClick(page, 'assistant');
  results.AI_Assistant = await capture(page, 'AI_Assistant');
  results.AI_Assistant.url = page.url();

  await browser.close();

  console.log('\n====== SCROLL REPORT ======');
  for (const [name, d] of Object.entries(results)) {
    const issues = [];
    if (d.clipped && d.clipped.length > 0) {
      d.clipped.forEach(c => issues.push('CLIPPED: ' + c.tag + ' hidden=' + c.hidden + 'px cls=' + c.cls.slice(0,50)));
    }
    const noScroll = !d.bodyCanScroll && (!d.scrollables || d.scrollables.length === 0);
    if (noScroll && d.bodyScrollH > d.viewH) {
      issues.push('Body taller than viewport but no scroll mechanism');
    }

    console.log('\n--- ' + name + ' ---');
    console.log('URL: ' + (d.url || 'N/A'));
    console.log('bodyScrollH=' + d.bodyScrollH + ', viewH=' + d.viewH + ', bodyCanScroll=' + d.bodyCanScroll);
    console.log('Scrollables: ' + (d.scrollables ? d.scrollables.length : 0) + ', Clipped: ' + (d.clipped ? d.clipped.length : 0) + ', FixedNav: ' + (d.fixedNav ? d.fixedNav.length : 0));
    if (d.fixedNav && d.fixedNav.length) console.log('Fixed nav height: ' + d.fixedNav[0].height + 'px');
    if (d.scrollables && d.scrollables.length) {
      d.scrollables.slice(0, 3).forEach(s => console.log('  Scrollable: ' + s.tag + ' extra=' + s.extra + 'px top=' + s.top + ' h=' + s.height + ' w=' + s.width));
    }
    if (issues.length) console.log('ISSUES: ' + issues.join(' | '));
    else console.log('STATUS: OK');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
