import { chromium, devices } from 'playwright';

async function testAds() {
  const browser = await chromium.launch();
  
  // Desktop
  console.log('Testing Desktop...');
  const desktopContext = await browser.newContext();
  const desktopPage = await desktopContext.newPage();
  await desktopPage.setViewportSize({ width: 1280, height: 800 });
  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'load' });
  await desktopPage.waitForTimeout(3000);
  await desktopPage.screenshot({ path: 'scratch/desktop_homepage.png', fullPage: true });
  await desktopContext.close();
  
  // Mobile
  console.log('Testing Mobile...');
  const mobileContext = await browser.newContext({
    ...devices['iPhone 13']
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'load' });
  await mobilePage.waitForTimeout(3000);
  await mobilePage.screenshot({ path: 'scratch/mobile_homepage.png', fullPage: true });
  await mobileContext.close();

  console.log('Screenshots saved to scratch directory.');
  await browser.close();
}

testAds().catch(console.error);
