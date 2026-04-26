const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  
  const errors500 = [];
  page.on('response', async resp => {
    if (resp.status() >= 400) {
      try {
        const body = await resp.text();
        errors500.push({ url: resp.url(), status: resp.status(), error: body.slice(0, 300) });
      } catch(e) {
        errors500.push({ url: resp.url(), status: resp.status() });
      }
    }
  });
  
  const consoleErrs = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrs.push(msg.text()); });
  
  await page.goto('http://localhost:3001/', { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(6000);
  
  console.log('500 ERRORS:');
  errors500.forEach(e => console.log(e.url, e.status));
  
  const rootH = await page.evaluate(() => {
    const r = document.getElementById('root');
    return { innerH: r ? r.innerHTML.length : 0, bodyH: document.body.scrollHeight, children: r ? r.children.length : 0 };
  });
  console.log('\nRoot:', JSON.stringify(rootH));
  console.log('\nConsole errors:', consoleErrs.slice(0, 5).join('\n'));
  
  await page.screenshot({ path: 'H:/koyjabo/koyjabo-core/scroll-screenshots/current_state.png' });
  await browser.close();
}

main().catch(console.error);
