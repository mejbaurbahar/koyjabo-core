/**
 * KoyJabo Auth End-to-End Test
 * Tests: signup → login → upload avatar → forgot password (OTP) → logout → change password
 * Run: node test-auth.js
 */
const { chromium } = require('playwright');

const BASE_URL = 'https://koyjabo.com';
const TEST_EMAIL = `test_${Date.now()}@gmail.com`;
const TEST_PASSWORD = 'Test@1234';
const TEST_NEW_PASSWORD = 'NewTest@5678';
const TEST_USERNAME = `tester${Date.now()}`.slice(0, 20);
const TEST_DISPLAY = 'Test User';

const TIMEOUT = 200_000; // 200s per step (workflow can take up to 90s + queue)
const STEP_TIMEOUT = 10_000;

let pass = 0, fail = 0;
const results = [];

function log(step, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
  const line = `${icon} ${step}${detail ? ': ' + detail : ''}`;
  console.log(line);
  results.push({ step, status, detail });
  if (status === 'PASS') pass++;
  if (status === 'FAIL') fail++;
}

async function waitForText(page, text, timeout = TIMEOUT) {
  await page.waitForFunction(
    (t) => document.body.innerText.includes(t),
    text,
    { timeout }
  );
}

async function waitForNoText(page, text, timeout = TIMEOUT) {
  await page.waitForFunction(
    (t) => !document.body.innerText.includes(t),
    text,
    { timeout }
  );
}

async function clickText(page, text) {
  await page.getByText(text, { exact: false }).first().click();
}

async function findAndClick(page, selectors) {
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 3000 })) {
        await el.click();
        return true;
      }
    } catch { }
  }
  return false;
}

async function navigateToView(page, view) {
  await page.goto(`${BASE_URL}?view=${view}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

(async () => {
  console.log('\n🧪 KoyJabo Auth Test Suite');
  console.log('═'.repeat(50));
  console.log(`📧 Test email: ${TEST_EMAIL}`);
  console.log(`👤 Username:   ${TEST_USERNAME}`);
  console.log(`🌐 URL:        ${BASE_URL}`);
  console.log('═'.repeat(50) + '\n');

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // ─── Collect network requests ──────────────────────────────────────────────
  const networkLog = [];
  page.on('request', req => {
    if (req.url().includes('koyjabo') || req.url().includes('github')) {
      networkLog.push({ type: 'REQ', method: req.method(), url: req.url().replace(/[?&]token=[^&]+/, '?token=***') });
    }
  });
  page.on('response', res => {
    if (res.url().includes('koyjabo') || res.url().includes('github')) {
      networkLog.push({ type: 'RES', status: res.status(), url: res.url().replace(/[?&]token=[^&]+/, '?token=***') });
    }
  });

  try {
    // ── STEP 1: Load site ──────────────────────────────────────────────────────
    console.log('STEP 1: Loading site...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const title = await page.title();
    log('Site loads', title ? 'PASS' : 'FAIL', title || 'No title');

    // ── STEP 2: Navigate to signup ─────────────────────────────────────────────
    console.log('\nSTEP 2: Signup...');
    await navigateToView(page, 'signup');
    await page.screenshot({ path: 'test-01-signup-page.png' });

    // Fill signup form
    const emailInput = page.locator('input[type="email"]').first();
    const passInput  = page.locator('input[type="password"]').first();

    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill(TEST_EMAIL);
      log('Email field found', 'PASS');
    } else {
      log('Email field found', 'FAIL', 'Not visible');
    }

    // Fill all signup fields
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const type  = await input.getAttribute('type');
      const ph    = await input.getAttribute('placeholder') || '';
      const auto  = await input.getAttribute('autocomplete') || '';
      if (type === 'email') await input.fill(TEST_EMAIL);
      else if (auto === 'username' || ph.toLowerCase().includes('username')) await input.fill(TEST_USERNAME);
      else if (auto === 'name' || ph.toLowerCase().includes('name') || ph.toLowerCase().includes('display')) await input.fill(TEST_DISPLAY);
      else if (type === 'password') await input.fill(TEST_PASSWORD);
    }

    await page.screenshot({ path: 'test-02-signup-filled.png' });

    // Submit signup
    const signupBtn = page.locator('button[type="submit"]').first();
    if (await signupBtn.isVisible({ timeout: 3000 })) {
      await signupBtn.click();
      log('Signup form submitted', 'PASS');
    }

    // Wait for workflow to complete (up to 3 minutes)
    console.log('   Waiting for signup workflow (up to 3 min)...');
    try {
      await page.waitForFunction(
        () => {
          const txt = document.body.innerText;
          return txt.includes('Welcome') || txt.includes('success') || txt.includes('logged in') ||
                 txt.includes('profile') || txt.includes('Profile') || txt.includes('avatar') ||
                 txt.includes('error') || txt.includes('Error') || txt.includes('already') ||
                 txt.includes('Dashboard') || txt.includes('Home');
        },
        { timeout: TIMEOUT }
      );
      await page.screenshot({ path: 'test-03-signup-result.png' });
      const body = await page.evaluate(() => document.body.innerText);
      const isSuccess = body.includes('Welcome') || body.includes('profile') || body.includes('Profile') || body.includes('Dashboard');
      const isError = body.includes('error') || body.includes('Error') || body.includes('already');
      log('Signup completes', isSuccess ? 'PASS' : 'FAIL', isError ? body.slice(0, 200) : 'Completed');
    } catch {
      await page.screenshot({ path: 'test-03-signup-timeout.png' });
      log('Signup completes', 'FAIL', 'Timed out after 3 min — workflow did not respond');
    }

    // ── STEP 3: Login ──────────────────────────────────────────────────────────
    console.log('\nSTEP 3: Login...');
    await navigateToView(page, 'login');
    await page.screenshot({ path: 'test-04-login-page.png' });

    const loginInputs = await page.locator('input').all();
    for (const input of loginInputs) {
      const type = await input.getAttribute('type');
      const auto = await input.getAttribute('autocomplete') || '';
      if (type === 'email' || auto === 'email') await input.fill(TEST_EMAIL);
      else if (type === 'password') await input.fill(TEST_PASSWORD);
    }

    const loginBtn = page.locator('button[type="submit"]').first();
    if (await loginBtn.isVisible({ timeout: 3000 })) {
      await loginBtn.click();
      log('Login form submitted', 'PASS');
    }

    console.log('   Waiting for login...');
    try {
      await page.waitForFunction(
        () => {
          const txt = document.body.innerText;
          return txt.includes('profile') || txt.includes('Profile') || txt.includes('Welcome') ||
                 txt.includes('Dashboard') || txt.includes('avatar') || txt.includes('logout') ||
                 txt.includes('error') || txt.includes('invalid') || txt.includes('Invalid');
        },
        { timeout: 30000 }
      );
      await page.screenshot({ path: 'test-05-login-result.png' });
      const body = await page.evaluate(() => document.body.innerText);
      const isSuccess = body.includes('profile') || body.includes('Profile') || body.includes('Welcome') || !body.includes('Login');
      log('Login succeeds', isSuccess ? 'PASS' : 'FAIL', isSuccess ? 'Logged in' : body.slice(0, 150));
    } catch {
      await page.screenshot({ path: 'test-05-login-timeout.png' });
      log('Login succeeds', 'FAIL', 'Timed out');
    }

    // ── STEP 4: View profile page ──────────────────────────────────────────────
    console.log('\nSTEP 4: Profile page...');
    await navigateToView(page, 'profile');
    await page.screenshot({ path: 'test-06-profile-page.png' });
    const profileBody = await page.evaluate(() => document.body.innerText);
    const hasProfile = profileBody.includes('Profile') || profileBody.includes('avatar') || profileBody.includes(TEST_DISPLAY);
    log('Profile page loads', hasProfile ? 'PASS' : 'FAIL', hasProfile ? 'Profile visible' : 'Redirected or empty');

    // ── STEP 5: Upload avatar ──────────────────────────────────────────────────
    console.log('\nSTEP 5: Upload avatar...');
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible({ timeout: 5000 }).catch(() => false) ||
        await page.locator('input[type="file"]').count() > 0) {
      // Create a small test image file
      const { execSync } = require('child_process');
      const fs = require('fs');
      const testImgPath = require('path').join(process.cwd(), 'test-avatar.png');

      // Create a minimal 10x10 PNG
      const { createCanvas } = (() => {
        try { return require('canvas'); } catch { return null; }
      })() || {};
      if (!fs.existsSync(testImgPath)) {
        // Write a minimal valid PNG (8x8 green square, base64)
        const minPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAARnQU5ErkJggg==', 'base64');
        fs.writeFileSync(testImgPath, minPng);
      }

      await fileInput.setInputFiles(testImgPath);
      log('Avatar file selected', 'PASS');
      console.log('   Waiting for avatar upload workflow...');

      try {
        await page.waitForFunction(
          () => {
            const txt = document.body.innerText;
            return txt.includes('upload') || txt.includes('updated') || txt.includes('avatar') ||
                   txt.includes('success') || txt.includes('error') || txt.includes('failed');
          },
          { timeout: TIMEOUT }
        );
        await page.screenshot({ path: 'test-07-avatar-result.png' });
        const body = await page.evaluate(() => document.body.innerText);
        const isError = body.includes('error') || body.includes('failed') || body.includes('Error');
        log('Avatar upload completes', !isError ? 'PASS' : 'FAIL', isError ? body.slice(0, 150) : 'Uploaded');
      } catch {
        await page.screenshot({ path: 'test-07-avatar-timeout.png' });
        log('Avatar upload completes', 'FAIL', 'Timed out');
      }
    } else {
      log('Avatar upload', 'INFO', 'File input not found — may need to be logged in first');
    }

    // ── STEP 6: Forgot password (OTP flow) ────────────────────────────────────
    console.log('\nSTEP 6: Forgot password (OTP flow)...');
    await navigateToView(page, 'forgot-password');
    await page.screenshot({ path: 'test-08-forgot-page.png' });

    const fpEmail = page.locator('input[type="email"]').first();
    if (await fpEmail.isVisible({ timeout: 5000 })) {
      await fpEmail.fill(TEST_EMAIL);
      const fpBtn = page.locator('button[type="submit"]').first();
      await fpBtn.click();
      log('Forgot password submitted', 'PASS');

      console.log('   Waiting for OTP code...');
      try {
        await page.waitForFunction(
          () => {
            const txt = document.body.innerText;
            return txt.includes('code') || txt.includes('Code') || txt.includes('sent') ||
                   txt.includes('verify') || txt.includes('Verify') || txt.includes('digit') || txt.includes('error');
          },
          { timeout: TIMEOUT }
        );
        await page.screenshot({ path: 'test-09-otp-screen.png' });
        const body = await page.evaluate(() => document.body.innerText);
        const hasOtp = body.includes('code') || body.includes('Code') || body.includes('Verify');
        const hasFallback = body.match(/\d{6}/); // 6-digit OTP shown as fallback

        log('OTP screen shown', hasOtp ? 'PASS' : 'FAIL', hasOtp ? 'OTP stage reached' : body.slice(0, 150));

        if (hasFallback) {
          const otpCode = hasFallback[0];
          log('OTP code visible (SMTP fallback)', 'PASS', `Code: ${otpCode}`);

          // Enter the OTP
          const otpInputs = await page.locator('input[maxlength="1"]').all();
          if (otpInputs.length === 6) {
            for (let i = 0; i < 6; i++) {
              await otpInputs[i].fill(otpCode[i]);
              await page.waitForTimeout(200);
            }
            log('OTP entered', 'PASS');

            console.log('   Waiting for OTP verify...');
            await page.waitForFunction(
              () => {
                const txt = document.body.innerText;
                return txt.includes('password') || txt.includes('Password') || txt.includes('new') ||
                       txt.includes('error') || txt.includes('incorrect');
              },
              { timeout: TIMEOUT }
            );
            await page.screenshot({ path: 'test-10-after-otp.png' });
            const afterOtp = await page.evaluate(() => document.body.innerText);
            const showsPasswordForm = afterOtp.toLowerCase().includes('new password') || afterOtp.toLowerCase().includes('set new');
            log('OTP verified, password form shown', showsPasswordForm ? 'PASS' : 'FAIL', afterOtp.slice(0, 100));

            if (showsPasswordForm) {
              // Enter new password
              const pwInputs = await page.locator('input[type="password"]').all();
              for (const pw of pwInputs) { await pw.fill(TEST_NEW_PASSWORD); }
              const setBtn = page.locator('button[type="submit"]').first();
              await setBtn.click();
              log('New password submitted', 'PASS');

              try {
                await page.waitForFunction(
                  () => document.body.innerText.includes('changed') || document.body.innerText.includes('success') || document.body.innerText.includes('login'),
                  { timeout: TIMEOUT }
                );
                await page.screenshot({ path: 'test-11-password-reset-done.png' });
                log('Password reset completes', 'PASS');
              } catch {
                log('Password reset completes', 'FAIL', 'Timed out');
              }
            }
          }
        } else {
          log('OTP code visible', 'INFO', 'SMTP configured — check email for code (skipping auto-fill)');
        }
      } catch {
        await page.screenshot({ path: 'test-09-otp-timeout.png' });
        log('OTP screen shown', 'FAIL', 'Timed out');
      }
    }

    // ── STEP 7: Login with original password (before reset used new pw) ────────
    console.log('\nSTEP 7: Login with new password...');
    await navigateToView(page, 'login');
    const li2 = await page.locator('input').all();
    for (const input of li2) {
      const type = await input.getAttribute('type');
      if (type === 'email') await input.fill(TEST_EMAIL);
      else if (type === 'password') await input.fill(TEST_NEW_PASSWORD);
    }
    const loginBtn2 = page.locator('button[type="submit"]').first();
    if (await loginBtn2.isVisible({ timeout: 3000 })) await loginBtn2.click();

    try {
      await page.waitForFunction(
        () => {
          const txt = document.body.innerText;
          return txt.includes('Profile') || txt.includes('profile') || txt.includes('Welcome') ||
                 txt.includes('error') || txt.includes('invalid');
        },
        { timeout: 30000 }
      );
      const body = await page.evaluate(() => document.body.innerText);
      const ok = !body.includes('invalid') && !body.includes('error');
      log('Login with new password', ok ? 'PASS' : 'FAIL', ok ? 'Logged in' : body.slice(0, 100));
    } catch {
      log('Login with new password', 'FAIL', 'Timed out');
    }

    // ── Network summary ────────────────────────────────────────────────────────
    console.log('\n📡 Network Requests Summary:');
    const authReqs = networkLog.filter(r => r.url.includes('koyjabo') || r.url.includes('results'));
    const proxyReqs = authReqs.filter(r => r.url.includes('workers.dev') || r.url.includes('api.koyjabo'));
    const ghReqs = authReqs.filter(r => r.url.includes('api.github.com'));

    console.log(`  Total captured: ${authReqs.length}`);
    console.log(`  → Cloudflare Worker: ${proxyReqs.length}`);
    console.log(`  → Direct GitHub:     ${ghReqs.length}`);

    const errors = authReqs.filter(r => r.type === 'RES' && r.status >= 400);
    if (errors.length) {
      console.log(`  ⚠️  Errors (${errors.length}):`);
      errors.forEach(e => console.log(`     ${e.status} ${e.url}`));
    }

    const polls = authReqs.filter(r => r.url.includes('results'));
    console.log(`  Polls for results: ${polls.length}`);
    polls.slice(-5).forEach(r => console.log(`     ${r.type === 'RES' ? r.status : r.method} ${r.url.split('/').slice(-1)[0]}`));

  } catch (err) {
    console.error('\n💥 Test crashed:', err.message);
  } finally {
    await page.screenshot({ path: 'test-final.png', fullPage: true });
    await browser.close();

    console.log('\n' + '═'.repeat(50));
    console.log(`📊 Results: ${pass} PASSED, ${fail} FAILED`);
    console.log('═'.repeat(50));
    results.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : 'ℹ️';
      console.log(`  ${icon} ${r.step}${r.detail ? ': ' + r.detail : ''}`);
    });

    if (fail > 0) process.exit(1);
  }
})();
