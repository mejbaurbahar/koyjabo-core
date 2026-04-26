const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const SCREENSHOT_DIR = 'H:/koyjabo/koyjabo-core/scroll-screenshots';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(2000);

  // The last button in header (index 12, left=1204) should be the hamburger
  // Click button at index 12
  const btns = await page.$$('button');
  console.log('Total buttons:', btns.length);
  
  if (btns[12]) {
    const info = await btns[12].evaluate(b => ({ text: b.textContent.trim(), cls: (b.className||'').slice(0,80), aria: b.getAttribute('aria-label'), html: b.innerHTML.slice(0,100) }));
    console.log('Button 12:', JSON.stringify(info));
    await btns[12].click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Hamburger_btn12.png') });
    
    // Get newly visible items
    const newItems = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const r = el.getBoundingClientRect();
          const s = window.getComputedStyle(el);
          return r.top > 60 && r.left > 500 && r.width > 50 && r.height > 20 && s.display !== 'none';
        })
        .map(el => ({ tag: el.tagName, text: el.textContent.trim().slice(0, 40), cls: (el.className||'').toString().slice(0, 60) }))
        .filter(i => i.text && i.text.length > 2 && i.text.length < 50)
        .slice(0, 30);
    });
    console.log('Items visible after click:', JSON.stringify(newItems));
  }

  // Also check App.tsx for Road Alerts and Trip Reminders references
  await browser.close();
}
main().catch(console.error);
