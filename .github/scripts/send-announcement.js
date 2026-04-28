#!/usr/bin/env node
'use strict';

/**
 * KoyJabo Announcement Mailer
 *
 * Sends a newsletter / feature-announcement email to all registered users.
 * Run via GitHub Actions → send-announcement.yml
 *
 * Env vars (same secrets as auth-handler):
 *   DATA_GITHUB_TOKEN  — PAT with contents:read on the private koyjabo data repo
 *   SMTP_EMAIL         — Gmail address used as sender
 *   SMTP_PASSWORD      — Gmail App Password
 *   APP_URL            — https://koyjabo.com
 *
 * Inputs (workflow_dispatch):
 *   TEST_EMAIL   — if set, sends only to this address (test mode)
 *                  if empty, sends to every registered user
 */

const crypto    = require('crypto');
const { Octokit } = require('@octokit/rest');
const nodemailer  = require('nodemailer');

const DATA_TOKEN     = process.env.DATA_GITHUB_TOKEN || process.env.AUTH_GITHUB_TOKEN;
const SMTP_EMAIL     = process.env.SMTP_EMAIL     || '';
const SMTP_PASSWORD  = process.env.SMTP_PASSWORD  || '';
const APP_URL        = process.env.APP_URL        || 'https://koyjabo.com';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const TEST_EMAIL     = (process.env.INPUT_TEST_EMAIL || '').trim().toLowerCase();

const DATA_OWNER = 'mejbaurbahar';
const DATA_REPO  = 'koyjabo';

const octokit = new Octokit({ auth: DATA_TOKEN });

// ── Decrypt helper (same as auth-handler) ────────────────────────────────────
function getEncKey() {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

function decrypt(ciphertext) {
  try {
    const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', getEncKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch { return null; }
}

// ── GitHub data reader ────────────────────────────────────────────────────────
async function readDataFile(path) {
  try {
    const res = await octokit.repos.getContent({ owner: DATA_OWNER, repo: DATA_REPO, path });
    if (res.data.type !== 'file') return null;
    return JSON.parse(Buffer.from(res.data.content, 'base64').toString('utf8'));
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

// ── Fetch every registered user (email + displayName) ────────────────────────
async function getAllUsers() {
  const index = await readDataFile('data/users/index.json');
  if (!index) return [];

  const userIds = [...new Set(Object.values(index))];
  const users = [];

  for (let i = 0; i < userIds.length; i += 10) {
    const batch = userIds.slice(i, i + 10);
    const results = await Promise.all(
      batch.map(uid => readDataFile(`data/users/${uid}.json`).catch(() => null))
    );
    for (const u of results) {
      if (!u?.encryptedEmail) continue;
      const email = decrypt(u.encryptedEmail);
      if (email) users.push({ email, displayName: u.displayName || 'বন্ধু', username: u.username || '' });
    }
  }

  return users;
}

// ── Mailer ────────────────────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD }
  });
}

async function sendOne(transporter, { email, displayName }) {
  const html = `<!DOCTYPE html>
<html lang="bn">
<body style="font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:#f0fdf4;padding:24px;margin:0">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 28px rgba(0,0,0,0.09)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#059669 0%,#0284c7 100%);padding:34px 28px;text-align:center">
      <img src="${APP_URL}/logo.png" alt="কই যাবো" style="width:64px;height:64px;border-radius:16px;background:#fff;padding:8px;margin-bottom:14px;display:block;margin-left:auto;margin-right:auto">
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px">কই যাবো (KoyJabo)</h1>
      <p style="color:#d1fae5;margin:6px 0 0;font-size:13px">বাংলাদেশের স্মার্ট ট্রান্সপোর্ট গাইড</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 28px">

      <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 6px">প্রিয় ব্যবহারকারী, 👋</p>
      <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 28px">
        কই যাবো ব্যবহার করার জন্য আপনাকে আন্তরিক ধন্যবাদ। আপনার যাতায়াতকে আরও সহজ, দ্রুত এবং স্মার্ট করতে আমরা নিয়ে এসেছি বেশ কিছু নতুন ও উন্নত ফিচার।
      </p>

      <!-- New features -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px 22px;margin:0 0 20px">
        <p style="margin:0 0 14px;color:#065f46;font-size:15px;font-weight:700">🆕 নতুন যা যোগ হয়েছে</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;vertical-align:top;width:26px;font-size:16px">🚌</td><td style="padding:6px 0;color:#047857;font-size:14px;line-height:1.6"><strong>বিস্তৃত বাস রুট আপডেট</strong> — ঢাকার নতুন রুট ও স্টপেজ যুক্ত করা হয়েছে</td></tr>
          <tr><td style="padding:6px 0;vertical-align:top;font-size:16px">🤖</td><td style="padding:6px 0;color:#047857;font-size:14px;line-height:1.6"><strong>উন্নত AI ট্রাভেল অ্যাসিস্ট্যান্ট</strong> — বাংলাদেশের প্রথম স্মার্ট ট্রাভেল AI এখন আরও শক্তিশালী, নির্ভুল ও কনটেক্সট-অ্যাওয়ার রুট সাজেশন দেয়</td></tr>
          <tr><td style="padding:6px 0;vertical-align:top;font-size:16px">📍</td><td style="padding:6px 0;color:#047857;font-size:14px;line-height:1.6"><strong>নিকটস্থ স্টপেজ খুঁজুন</strong> — আপনার বর্তমান লোকেশন থেকে কাছের বাস/স্টেশন সহজে খুঁজুন</td></tr>
          <tr><td style="padding:6px 0;vertical-align:top;font-size:16px">🚂</td><td style="padding:6px 0;color:#047857;font-size:14px;line-height:1.6"><strong>আন্তঃনগর ট্রেন তথ্য</strong> — সারাদেশের ট্রেনের সময়সূচি ও রুট একসাথে</td></tr>
          <tr><td style="padding:6px 0;vertical-align:top;font-size:16px">🚇</td><td style="padding:6px 0;color:#047857;font-size:14px;line-height:1.6"><strong>মেট্রোরেল আপডেট</strong> — সর্বশেষ স্টেশন, ভাড়া ও সময়সূচি</td></tr>
        </table>
      </div>

      <!-- Smart features -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:20px 22px;margin:0 0 24px">
        <p style="margin:0 0 14px;color:#1e40af;font-size:15px;font-weight:700">🚀 নতুন স্মার্ট ফিচারসমূহ</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:5px 0;vertical-align:top;width:26px;font-size:16px">⭐</td><td style="padding:5px 0;color:#1d4ed8;font-size:14px;line-height:1.6"><strong>রেটিং সিস্টেম</strong> — যেকোনো লোকাল বাস ও ট্রেন সার্ভিস রেট করুন</td></tr>
          <tr><td style="padding:5px 0;vertical-align:top;font-size:16px">📸</td><td style="padding:5px 0;color:#1d4ed8;font-size:14px;line-height:1.6"><strong>ইমেজ আপলোড</strong> — ঢাকার বাস ও ট্রেনের বাস্তব ছবি শেয়ার করুন</td></tr>
          <tr><td style="padding:5px 0;vertical-align:top;font-size:16px">⏰</td><td style="padding:5px 0;color:#1d4ed8;font-size:14px;line-height:1.6"><strong>Trip Reminder</strong> — আপনার যাত্রার জন্য রিমাইন্ডার সেট করুন</td></tr>
          <tr><td style="padding:5px 0;vertical-align:top;font-size:16px">🚧</td><td style="padding:5px 0;color:#1d4ed8;font-size:14px;line-height:1.6"><strong>Road Alerts</strong> — রাস্তার অবস্থা, ট্রাফিক ও গুরুত্বপূর্ণ আপডেট পান</td></tr>
          <tr><td style="padding:5px 0;vertical-align:top;font-size:16px">🗺️</td><td style="padding:5px 0;color:#1d4ed8;font-size:14px;line-height:1.6"><strong>Area Guides</strong> — নতুন এলাকায় যাওয়ার আগে বিস্তারিত গাইড দেখুন</td></tr>
          <tr><td style="padding:5px 0;vertical-align:top;font-size:16px">🎫</td><td style="padding:5px 0;color:#1d4ed8;font-size:14px;line-height:1.6"><strong>Bus Pass Info</strong> — বাস পাস সংক্রান্ত তথ্য এক জায়গায়</td></tr>
          <tr><td style="padding:5px 0;vertical-align:top;font-size:16px">🛣️</td><td style="padding:5px 0;color:#1d4ed8;font-size:14px;line-height:1.6"><strong>Multi-stop Planner</strong> — একাধিক গন্তব্য নিয়ে স্মার্ট রুট প্ল্যান করুন</td></tr>
          <tr><td style="padding:5px 0;vertical-align:top;font-size:16px">💰</td><td style="padding:5px 0;color:#1d4ed8;font-size:14px;line-height:1.6"><strong>Cost Calculator</strong> — ভাড়া আগে থেকেই হিসাব করে নিন</td></tr>
          <tr><td style="padding:5px 0;vertical-align:top;font-size:16px">💺</td><td style="padding:5px 0;color:#1d4ed8;font-size:14px;line-height:1.6"><strong>Seat Availability</strong> — ট্রেন/বাসের সিট উপলব্ধতা চেক করুন</td></tr>
          <tr><td style="padding:5px 0;vertical-align:top;font-size:16px">📶</td><td style="padding:5px 0;color:#1d4ed8;font-size:14px;line-height:1.6"><strong>Offline Mode (PWA)</strong> — ইন্টারনেট ছাড়াও ব্যবহারযোগ্য</td></tr>
        </table>
      </div>

      <!-- CTA -->
      <a href="${APP_URL}" style="display:block;text-align:center;background:linear-gradient(135deg,#059669,#0284c7);color:#fff;padding:15px 28px;border-radius:11px;text-decoration:none;font-weight:700;font-size:16px;margin-bottom:28px">
        👉 এখনই এক্সপ্লোর করুন →
      </a>

      <!-- Share section -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:20px 22px;margin:0 0 24px">
        <p style="margin:0 0 10px;color:#92400e;font-size:15px;font-weight:700">📢 আপনার বন্ধুদের জানান!</p>
        <p style="color:#b45309;font-size:14px;line-height:1.8;margin:0 0 12px">
          কই যাবো সম্পূর্ণ বিনামূল্যে। এটি আরও বেশি মানুষের কাছে পৌঁছে দিতে আপনার সহযোগিতা আমাদের জন্য গুরুত্বপূর্ণ।
        </p>
        <p style="color:#b45309;font-size:14px;line-height:1.8;margin:0 0 10px">
          আপনার সোশ্যাল মিডিয়ায় (Facebook, LinkedIn, WhatsApp, Twitter/X) একটি পোস্ট বা রিভিউ শেয়ার করুন এবং বন্ধুদের জানান।
        </p>
        <p style="color:#92400e;font-size:13px;margin:0;font-style:italic">
          আপনার একটি শেয়ার আমাদের জন্য অনেক বড় অনুপ্রেরণা 💚
        </p>
      </div>

      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0 0 6px">
        এই ইমেইলটি কই যাবো-তে নিবন্ধিত ব্যবহারকারীদের জন্য প্রেরণ করা হয়েছে।<br>
        কোনো প্রশ্ন বা মতামত থাকলে <a href="mailto:${SMTP_EMAIL}" style="color:#059669">আমাদের সাথে যোগাযোগ করুন</a>।
      </p>
      <p style="color:#374151;font-size:13px;text-align:center;margin:8px 0 0;font-weight:600">
        ধন্যবাদান্তে,<br>KoyJabo টিম 🚀
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:16px 28px;text-align:center;border-top:1px solid #f3f4f6">
      <p style="color:#9ca3af;font-size:11px;margin:0">কই যাবো KoyJabo — বাংলাদেশের ট্রান্সপোর্ট গাইড · <a href="${APP_URL}" style="color:#9ca3af">koyjabo.com</a></p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"কই যাবো KoyJabo" <${SMTP_EMAIL}>`,
    to: email,
    subject: '🎉 কই যাবো-তে নতুন ফিচার এসেছে — একবার দেখুন!',
    html
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!SMTP_EMAIL || !SMTP_PASSWORD) {
    console.error('SMTP_EMAIL or SMTP_PASSWORD not configured. Aborting.');
    process.exit(1);
  }
  if (!DATA_TOKEN) {
    console.error('DATA_GITHUB_TOKEN not configured. Aborting.');
    process.exit(1);
  }
  if (!ENCRYPTION_KEY) {
    console.error('ENCRYPTION_KEY not configured. Aborting.');
    process.exit(1);
  }

  const transporter = createTransporter();

  // ── TEST MODE: single address ─────────────────────────────────────────────
  if (TEST_EMAIL) {
    console.log(`TEST MODE — sending only to: ${TEST_EMAIL}`);
    try {
      await sendOne(transporter, { email: TEST_EMAIL, displayName: 'টেস্ট ব্যবহারকারী' });
      console.log(`✅ Test email sent → ${TEST_EMAIL}`);
    } catch (err) {
      console.error(`❌ Failed → ${TEST_EMAIL}: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  // ── BROADCAST MODE: all registered users ─────────────────────────────────
  console.log('BROADCAST MODE — fetching all users...');
  const users = await getAllUsers();
  console.log(`Found ${users.length} users with decryptable emails.`);

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await sendOne(transporter, user);
      console.log(`✅ Sent → ${user.email}`);
      sent++;
      // Stay within Gmail rate limits (~100 emails/day for free accounts, ~500 for workspace)
      // 800ms delay keeps us well under 75/min
      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      console.error(`❌ Failed → ${user.email}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Sent: ${sent} | Failed: ${failed} | Total: ${users.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
