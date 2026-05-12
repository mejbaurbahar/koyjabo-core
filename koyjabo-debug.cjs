const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DIR = '/tmp/koyjabo-screenshots';
fs.mkdirSync(DIR, { recursive: true });
const APP = 'http://localhost:5174';

const shot = async (p, name) => { await p.screenshot({ path: path.join(DIR, `${name}.png`) }); console.log(`📸 ${name}`); };

// Deep diagnostic: find ALL overflow containers and test each one
const deepDiag = async (page) => page.evaluate(() => {
  const results = [];
  for (const el of document.querySelectorAll('*')) {
    const s = window.getComputedStyle(el);
    if (s.overflowY === 'auto' || s.overflowY === 'scroll') {
      const r = el.getBoundingClientRect();
      if (r.width < 50 || r.height < 30) continue;
      const before = el.scrollTop;
      el.scrollTop = 300;
      const after = el.scrollTop;
      el.scrollTop = before; // reset
      results.push({
        tag: el.tagName,
        cls: el.className.substring(0, 80),
        w: Math.round(r.width), h: Math.round(r.height),
        scrollH: el.scrollHeight,
        clientH: Math.round(el.clientHeight),
        canScroll: el.scrollHeight > el.clientHeight + 5,
        scrollWorked: after > 0,
        visibility: s.visibility,
        display: s.display,
        position: s.position,
      });
    }
  }
  return results;
});

// Wheel scroll test
const wheelScroll = async (page, x, y) => {
  const before = await page.evaluate(() => {
    let best = null;
    for (const el of document.querySelectorAll('*')) {
      const s = window.getComputedStyle(el);
      if (s.overflowY === 'auto' || s.overflowY === 'scroll') {
        const r = el.getBoundingClientRect();
        if (r.height > 100) { best = el; break; }
      }
    }
    return best ? best.scrollTop : -1;
  });
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => {
    let best = null;
    for (const el of document.querySelectorAll('*')) {
      const s = window.getComputedStyle(el);
      if (s.overflowY === 'auto' || s.overflowY === 'scroll') {
        const r = el.getBoundingClientRect();
        if (r.height > 100) { best = el; break; }
      }
    }
    return best ? best.scrollTop : -1;
  });
  return { before, after, moved: after > before };
};

(async () => {
  const br = await chromium.launch({ headless: false, slowMo: 100 });

  // ── MOBILE ────────────────────────────────────────────────────────────────────
  const ctx = await br.newContext({ viewport: { width: 430, height: 932 } });
  const pg = await ctx.newPage();
  await pg.route('**/*.workers.dev/**', r => r.abort());
  await pg.route('**/ipapi.co/**', r => r.abort());
  pg.on('console', () => {});
  pg.on('pageerror', () => {});

  // ── ABOUT ─────────────────────────────────────────────────────────────────────
  console.log('\n=== ABOUT PAGE ===');
  await pg.goto(APP, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await pg.waitForTimeout(1500);
  await pg.locator('button').filter({ hasText: /পরিচয়|about/i }).last().click();
  await pg.waitForTimeout(1500);
  await shot(pg, 'about-before');

  // Parent chain diagnostics
  const parentChain = await pg.evaluate(() => {
    const results = [];
    // Find the absolute inset-0 about div
    for (const el of document.querySelectorAll('*')) {
      const s = window.getComputedStyle(el);
      if (s.position === 'absolute' && s.overflowY === 'auto') {
        const r = el.getBoundingClientRect();
        results.push({ tag: el.tagName, cls: el.className.substring(0, 80), h: Math.round(r.height), computedH: s.height, pos: s.position });
        // Walk up parent chain
        let parent = el.parentElement;
        for (let i = 0; i < 8 && parent; i++) {
          const ps = window.getComputedStyle(parent);
          const pr = parent.getBoundingClientRect();
          results.push({ tag: 'P'+i, cls: parent.className.substring(0, 80), h: Math.round(pr.height), computedH: ps.height, pos: ps.position, display: ps.display, flex: ps.flexDirection, align: ps.alignItems });
          parent = parent.parentElement;
        }
        results.push({ tag: 'WIN', h: window.innerHeight });
        break;
      }
    }
    return results;
  });
  console.log('Parent chain:');
  parentChain.forEach(p => console.log(`  ${p.tag} h:${p.h} cH:${p.computedH||'?'} pos:${p.pos||'?'} ${p.display||''} ${p.flex||''} align:${p.align||''} | ${(p.cls||'').substring(0, 60)}`));

  const aboutDiag = await deepDiag(pg);
  console.log(`Found ${aboutDiag.length} overflow-y containers on About page:`);
  aboutDiag.forEach((d, i) => {
    console.log(`  [${i}] ${d.tag} cls="${d.cls.substring(0,60)}" h:${d.h} scrollH:${d.scrollH} clientH:${d.clientH} scrollable:${d.canScroll} scrollWorked:${d.scrollWorked} vis:${d.visibility} pos:${d.position}`);
  });

  // Try wheel scroll — use center of about container
  const wResult = await wheelScroll(pg, 215, 200);
  console.log(`Wheel scroll: before=${wResult.before} after=${wResult.after} moved=${wResult.moved}`);
  await shot(pg, 'about-after-wheel');

  // Try keyboard scroll
  await pg.keyboard.press('PageDown');
  await pg.waitForTimeout(500);
  await shot(pg, 'about-after-pagedown');

  // ── TRAIN ─────────────────────────────────────────────────────────────────────
  console.log('\n=== TRAIN PAGE ===');
  await pg.goto(APP, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await pg.waitForTimeout(1500);
  await pg.locator('button').filter({ hasText: /ট্রেন|train/i }).last().click();
  await pg.waitForTimeout(1500);
  await shot(pg, 'train-before');

  const trainDiag = await deepDiag(pg);
  console.log(`Found ${trainDiag.length} overflow-y containers on Train page:`);
  trainDiag.forEach((d, i) => {
    console.log(`  [${i}] ${d.tag} cls="${d.cls.substring(0,60)}" h:${d.h} scrollH:${d.scrollH} clientH:${d.clientH} scrollable:${d.canScroll} scrollWorked:${d.scrollWorked} vis:${d.visibility} pos:${d.position}`);
  });
  const trainWheel = await wheelScroll(pg, 215, 400);
  console.log(`Train wheel: before=${trainWheel.before} after=${trainWheel.after} moved=${trainWheel.moved}`);
  await shot(pg, 'train-after-wheel');

  // ── BLOG ──────────────────────────────────────────────────────────────────────
  console.log('\n=== BLOG PAGE ===');
  await pg.goto(APP, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await pg.waitForTimeout(1500);
  await pg.locator('button[aria-label="Open menu"]').click();
  await pg.waitForTimeout(600);
  await pg.locator('button').filter({ hasText: /blog|ব্লগ/i }).first().click();
  await pg.waitForTimeout(1500);
  await shot(pg, 'blog-before');

  const blogDiag = await deepDiag(pg);
  console.log(`Found ${blogDiag.length} overflow-y containers on Blog:`);
  blogDiag.forEach((d, i) => {
    console.log(`  [${i}] ${d.tag} h:${d.h} scrollH:${d.scrollH} clientH:${d.clientH} scrollable:${d.canScroll} scrollWorked:${d.scrollWorked} | "${d.cls.substring(0,60)}"`);
  });
  const blogWheel = await wheelScroll(pg, 215, 400);
  console.log(`Blog wheel: before=${blogWheel.before} after=${blogWheel.after} moved=${blogWheel.moved}`);
  await shot(pg, 'blog-after-wheel');

  // ── HOME BUS LIST ─────────────────────────────────────────────────────────────
  console.log('\n=== HOME (BUS LIST) ===');
  await pg.goto(APP, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await pg.waitForTimeout(2000);
  await shot(pg, 'home-bus-before');

  const homeDiag = await deepDiag(pg);
  console.log(`Found ${homeDiag.length} overflow-y containers on Home:`);
  homeDiag.forEach((d, i) => {
    console.log(`  [${i}] ${d.tag} h:${d.h} scrollH:${d.scrollH} clientH:${d.clientH} scrollable:${d.canScroll} scrollWorked:${d.scrollWorked} | "${d.cls.substring(0,60)}"`);
  });
  const homeWheel = await wheelScroll(pg, 215, 500);
  console.log(`Home wheel: before=${homeWheel.before} after=${homeWheel.after} moved=${homeWheel.moved}`);
  await shot(pg, 'home-bus-after-wheel');

  await ctx.close();
  console.log(`\n✅ Done. Screenshots: ${DIR}`);
  await br.close();
})();
