const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  
  const errors = [];
  page.on('response', async resp => {
    if (resp.status() >= 400) {
      const url = resp.url();
      try {
        const txt = await resp.text();
        // Extract JSON error message
        const m = txt.match(/"message":"([^"]+)"/);
        errors.push({ url, status: resp.status(), msg: m ? m[1].slice(0,200) : txt.slice(0,200) });
      } catch(e) {
        errors.push({ url, status: resp.status() });
      }
    }
  });
  
  await page.goto('http://localhost:3001/', { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(5000);
  
  console.log(JSON.stringify(errors, null, 2));
  await browser.close();
}
main().catch(console.error);
