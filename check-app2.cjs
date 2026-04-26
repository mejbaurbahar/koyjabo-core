const { chromium } = require('playwright');
const fs = require('fs');

const SCREENSHOT_DIR = 'H:/koyjabo/koyjabo-core/scroll-screenshots';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  
  // Capture all network requests and errors
  const errors500 = [];
  page.on('response', async resp => {
    if (resp.status() >= 400) {
      errors500.push({ url: resp.url(), status: resp.status() });
    }
  });
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  await page.goto('http://localhost:3001/', { waitUntil: 'load', timeout: 20000 });
  
  // Wait for React to potentially load
  await page.waitForTimeout(5000);
  
  const viteOverlay = await page.$('vite-error-overlay');
  let overlayText = '';
  if (viteOverlay) {
    overlayText = await page.evaluate(() => {
      const overlay = document.querySelector('vite-error-overlay');
      return overlay ? overlay.shadowRoot?.innerHTML?.slice(0, 500) || overlay.innerHTML?.slice(0, 500) : '';
    });
  }
  
  // Get root div content
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? { innerHTML: root.innerHTML.slice(0, 500), childCount: root.childNodes.length } : null;
  });
  
  console.log('500 ERRORS:', JSON.stringify(errors500.slice(0, 10)));
  console.log('\nCONSOLE ERRORS:', consoleErrors.slice(0, 5).join('\n'));
  console.log('\nVITE OVERLAY:', overlayText.slice(0, 500));
  console.log('\nROOT CONTENT:', JSON.stringify(rootContent));
  
  // Take screenshot of what we see  
  await page.screenshot({ path: `${SCREENSHOT_DIR}/app_state.png`, fullPage: false });
  
  await browser.close();
}

main().catch(console.error);
