const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  
  await page.goto('http://localhost:3001/', { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  // Get full DOM
  const html = await page.content();
  const bodyText = await page.evaluate(() => document.body.innerHTML.slice(0, 3000));
  
  console.log('ERRORS:', errors.slice(0, 5).join('\n'));
  console.log('\nBODY HTML (first 3000 chars):\n', bodyText);
  
  await browser.close();
}

main().catch(console.error);
