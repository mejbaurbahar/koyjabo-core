#!/usr/bin/env node
'use strict';

/**
 * KoyJabo Auth Handler
 *
 * Security split:
 *   - User data (users, devices, avatars, password_resets) → private repo: mejbaurbahar/koyjabo
 *   - Temp results (polled by frontend, auto-deleted after 1h) → app repo: mejbaurbahar/Dhaka-Commute
 *
 * This means even if someone browses the public Dhaka-Commute repo they see nothing sensitive.
 * All personal data lives in the private koyjabo repo, invisible to the public.
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Octokit } = require('@octokit/rest');

// ── Config ────────────────────────────────────────────────────────────────────
const [APP_OWNER, APP_REPO] = (process.env.GITHUB_REPOSITORY || '/').split('/');

// Private data repo — all user data stored here, invisible to public
const DATA_OWNER = 'mejbaurbahar';
const DATA_REPO  = 'koyjabo';

// GITHUB_TOKEN: automatic per-run token, has write access to the app repo (Dhaka-Commute)
const APP_TOKEN  = process.env.AUTH_GITHUB_TOKEN;
// DATA_GITHUB_TOKEN: classic PAT with repo access to koyjabo (set as a repo secret)
const DATA_TOKEN = process.env.DATA_GITHUB_TOKEN;

const JWT_SECRET     = process.env.JWT_SECRET     || '';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const SMTP_EMAIL     = process.env.SMTP_EMAIL     || '';
const SMTP_PASSWORD  = process.env.SMTP_PASSWORD  || '';
const APP_URL        = process.env.APP_URL        || 'https://mejbaurbahar.github.io/Dhaka-Commute';

// Two separate API clients
const octokitApp  = new Octokit({ auth: APP_TOKEN });   // writes results to public Dhaka-Commute
const octokitData = new Octokit({ auth: DATA_TOKEN });  // reads/writes all user data in private koyjabo

// ── Crypto Utilities ──────────────────────────────────────────────────────────
function getEncKey() {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

function sha256hex(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
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

// ── Email helper ──────────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  if (!SMTP_EMAIL || !SMTP_PASSWORD) {
    console.log('Email skipped: SMTP_EMAIL or SMTP_PASSWORD not configured.');
    return false;
  }
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD }
    });
    await transporter.sendMail({
      from: `"কই যাবো KoyJabo" <${SMTP_EMAIL}>`,
      to, subject, html
    });
    console.log(`Email sent OK → ${to} | ${subject}`);
    return true;
  } catch (err) {
    console.error(`Email send failed → ${to} | ${err.message}`);
    return false;
  }
}

// ── User-Agent Parser ─────────────────────────────────────────────────────────
function parseUserAgent(ua = '') {
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let deviceType = 'desktop';

  if (/Android/i.test(ua)) {
    os = `Android ${(ua.match(/Android ([0-9.]+)/) || [])[1] || ''}`.trim();
    deviceType = 'mobile';
  } else if (/iPad/i.test(ua)) {
    os = `iPadOS ${((ua.match(/OS ([0-9_]+)/) || [])[1] || '').replace(/_/g, '.')}`.trim();
    deviceType = 'tablet';
  } else if (/iPhone|iPod/i.test(ua)) {
    os = `iOS ${((ua.match(/OS ([0-9_]+)/) || [])[1] || '').replace(/_/g, '.')}`.trim();
    deviceType = 'mobile';
  } else if (/Windows NT/i.test(ua)) {
    const ver = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
    const nt = (ua.match(/Windows NT ([0-9.]+)/) || [])[1] || '';
    os = `Windows ${ver[nt] || nt}`.trim();
  } else if (/Mac OS X/i.test(ua)) {
    os = `macOS ${((ua.match(/Mac OS X ([0-9_]+)/) || [])[1] || '').replace(/_/g, '.')}`.trim();
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  if (/Edg\//i.test(ua)) {
    browser = `Edge ${(ua.match(/Edg\/([0-9.]+)/) || [])[1] || ''}`.trim();
  } else if (/OPR\//i.test(ua)) {
    browser = `Opera ${(ua.match(/OPR\/([0-9.]+)/) || [])[1] || ''}`.trim();
  } else if (/SamsungBrowser/i.test(ua)) {
    browser = `Samsung Browser ${(ua.match(/SamsungBrowser\/([0-9.]+)/) || [])[1] || ''}`.trim();
  } else if (/Chrome\/[0-9]/i.test(ua) && !/Chromium/i.test(ua)) {
    browser = `Chrome ${(ua.match(/Chrome\/([0-9.]+)/) || [])[1] || ''}`.trim();
  } else if (/Firefox\//i.test(ua)) {
    browser = `Firefox ${(ua.match(/Firefox\/([0-9.]+)/) || [])[1] || ''}`.trim();
  } else if (/Safari\//i.test(ua)) {
    browser = `Safari ${(ua.match(/Version\/([0-9.]+)/) || [])[1] || ''}`.trim();
  }

  const name = `${browser.split(' ')[0]} on ${os.split(' ')[0]}`;
  return { os, browser, deviceType, name };
}

// ── Data Repo File Operations (private koyjabo) ───────────────────────────────
async function readDataFile(path) {
  try {
    const res = await octokitData.repos.getContent({ owner: DATA_OWNER, repo: DATA_REPO, path });
    if (res.data.type !== 'file') return null;
    const content = JSON.parse(Buffer.from(res.data.content, 'base64').toString('utf8'));
    return { content, sha: res.data.sha };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function writeDataFile(path, content, sha, message = 'Auth system update') {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const params = {
    owner: DATA_OWNER, repo: DATA_REPO, path, message,
    content: encoded,
    committer: { name: 'KoyJabo Auth Bot', email: 'noreply@koyjabo.com' }
  };
  if (sha) params.sha = sha;
  await octokitData.repos.createOrUpdateFileContents(params);
}

async function deleteDataFile(path, sha) {
  try {
    await octokitData.repos.deleteFile({
      owner: DATA_OWNER, repo: DATA_REPO, path,
      message: 'Cleanup auth file',
      sha,
      committer: { name: 'KoyJabo Auth Bot', email: 'noreply@koyjabo.com' }
    });
  } catch (_) { /* ignore */ }
}

// ── App Repo File Operations (public Dhaka-Commute, results only) ─────────────
async function readAppFile(path) {
  try {
    const res = await octokitApp.repos.getContent({ owner: APP_OWNER, repo: APP_REPO, path });
    if (res.data.type !== 'file') return null;
    const content = JSON.parse(Buffer.from(res.data.content, 'base64').toString('utf8'));
    return { content, sha: res.data.sha };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function writeAppFile(path, content, sha, message = 'Auth result') {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const params = {
    owner: APP_OWNER, repo: APP_REPO, path, message,
    content: encoded,
    committer: { name: 'KoyJabo Auth Bot', email: 'noreply@koyjabo.com' }
  };
  if (sha) params.sha = sha;
  await octokitApp.repos.createOrUpdateFileContents(params);
}

async function ensureIndexExists() {
  const f = await readDataFile('data/users/index.json');
  if (!f) {
    await writeDataFile('data/users/index.json', {}, null, 'Initialize user index');
    return { content: {}, sha: null };
  }
  return f;
}

// ── Auth Handlers ─────────────────────────────────────────────────────────────
async function handleSignup({ email, passwordHash, username, displayName }) {
  if (!email || !passwordHash || !username || !displayName) {
    return { success: false, error: 'All fields (email, password, username, displayName) are required.' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();
  const emailHashKey = sha256hex(normalizedEmail);

  const indexFile = await ensureIndexExists();
  const index = indexFile.content || {};

  if (index[emailHashKey]) {
    return { success: false, error: 'This email is already registered. Please log in.' };
  }

  const userId = crypto.randomUUID();
  const bcryptHash = await bcrypt.hash(passwordHash, 12);
  const encryptedEmail = encrypt(normalizedEmail);
  const now = Date.now();

  const user = {
    id: userId,
    emailHash: emailHashKey,
    encryptedEmail,           // AES-256-GCM encrypted — unreadable even in the private repo
    username: normalizedUsername,
    displayName: displayName.trim(),
    bcryptHash,               // bcrypt(sha256(password)) — cannot be reversed
    createdAt: now,
    updatedAt: now
  };

  await writeDataFile(`data/users/${userId}.json`, user, null, `New user: ${userId}`);
  const freshIndex = await readDataFile('data/users/index.json');
  const updatedIndex = { ...(freshIndex?.content || {}), [emailHashKey]: userId };
  await writeDataFile('data/users/index.json', updatedIndex, freshIndex?.sha, 'Update user index');

  // Send welcome email (non-blocking)
  sendEmail({
    to: normalizedEmail,
    subject: '🎉 Welcome to কই যাবো KoyJabo!',
    html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f0fdf4;padding:24px;margin:0">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#059669,#0284c7);padding:32px 24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:-0.5px">কই যাবো 🚌</h1>
      <p style="color:#d1fae5;margin:6px 0 0;font-size:14px">Smart Transport Finder, Dhaka</p>
    </div>
    <div style="padding:32px 24px">
      <h2 style="color:#111827;margin:0 0 8px">Welcome, ${displayName.trim()}! 🎉</h2>
      <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 20px">
        Your account has been created successfully. You're now part of the KoyJabo community —
        Dhaka's smartest way to find bus routes, metro schedules, and intercity travel.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin:0 0 24px">
        <p style="margin:0;color:#065f46;font-size:14px;font-weight:600">Your account details</p>
        <p style="margin:8px 0 0;color:#047857;font-size:13px">👤 Name: <strong>${displayName.trim()}</strong></p>
        <p style="margin:4px 0 0;color:#047857;font-size:13px">🔖 Username: <strong>@${normalizedUsername}</strong></p>
        <p style="margin:4px 0 0;color:#047857;font-size:13px">📧 Email: <strong>${normalizedEmail}</strong></p>
      </div>
      <a href="${APP_URL}"
         style="display:block;text-align:center;background:linear-gradient(135deg,#059669,#0284c7);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px">
        Open KoyJabo →
      </a>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">
        If you didn't create this account, please ignore this email or
        <a href="mailto:${SMTP_EMAIL}" style="color:#059669">contact us</a>.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f3f4f6">
      <p style="color:#9ca3af;font-size:11px;margin:0">কই যাবো KoyJabo — Dhaka Transport Guide</p>
    </div>
  </div>
</body>
</html>`
  }).catch(() => {});

  return { success: true, userId, username: user.username, displayName: user.displayName, email: normalizedEmail };
}

async function handleUpdateProfile({ userId, displayName, username }) {
  if (!userId) return { success: false, error: 'User ID required.' };

  const userFile = await readDataFile(`data/users/${userId}.json`);
  if (!userFile) return { success: false, error: 'User not found.' };

  const updated = {
    ...userFile.content,
    ...(displayName ? { displayName: displayName.trim() } : {}),
    ...(username ? { username: username.toLowerCase().trim() } : {}),
    updatedAt: Date.now()
  };

  await writeDataFile(`data/users/${userId}.json`, updated, userFile.sha, `Profile update: ${userId}`);
  return { success: true, userId, displayName: updated.displayName, username: updated.username };
}

async function handleChangePassword({ userId, newPasswordHash, oldPasswordHash, userAgent }) {
  if (!userId || !newPasswordHash) return { success: false, error: 'User ID and new password required.' };

  const userFile = await readDataFile(`data/users/${userId}.json`);
  if (!userFile) return { success: false, error: 'User not found.' };

  if (oldPasswordHash) {
    const valid = await bcrypt.compare(oldPasswordHash, userFile.content.bcryptHash);
    if (!valid) return { success: false, error: 'Current password is incorrect.' };
  }

  const newBcryptHash = await bcrypt.hash(newPasswordHash, 12);
  const updated = { ...userFile.content, bcryptHash: newBcryptHash, updatedAt: Date.now() };
  await writeDataFile(`data/users/${userId}.json`, updated, userFile.sha, `Password changed: ${userId}`);

  // Send security alert email (non-blocking)
  if (userFile.content.encryptedEmail) {
    const userEmail = decrypt(userFile.content.encryptedEmail);
    if (userEmail) {
      const deviceInfo = parseUserAgent(userAgent || '');
      const changedAt = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short' });
      sendEmail({
        to: userEmail,
        subject: '🔐 Your KoyJabo password was changed',
        html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#fef2f2;padding:24px;margin:0">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#dc2626,#9333ea);padding:32px 24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">🔐 Password Changed</h1>
      <p style="color:#fecaca;margin:6px 0 0;font-size:14px">Security Alert — কই যাবো KoyJabo</p>
    </div>
    <div style="padding:32px 24px">
      <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 16px">
        Hello <strong>${userFile.content.displayName || 'User'}</strong>,<br><br>
        Your KoyJabo account password was <strong>successfully changed</strong>.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin:0 0 20px">
        <p style="margin:0;color:#991b1b;font-size:14px;font-weight:600">Change details</p>
        <p style="margin:8px 0 0;color:#b91c1c;font-size:13px">🕐 Time: <strong>${changedAt} (Dhaka)</strong></p>
        <p style="margin:4px 0 0;color:#b91c1c;font-size:13px">💻 Device: <strong>${deviceInfo.name}</strong></p>
        <p style="margin:4px 0 0;color:#b91c1c;font-size:13px">🖥️ OS: <strong>${deviceInfo.os}</strong></p>
        <p style="margin:4px 0 0;color:#b91c1c;font-size:13px">🌐 Browser: <strong>${deviceInfo.browser}</strong></p>
      </div>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin:0 0 24px">
        <p style="margin:0;color:#92400e;font-size:14px;font-weight:600">⚠️ Wasn't you?</p>
        <p style="margin:8px 0 0;color:#b45309;font-size:13px;line-height:1.5">
          If you didn't make this change, your account may be compromised.
          Log in immediately and change your password, or check your active devices.
        </p>
      </div>
      <a href="${APP_URL}?view=profile&section=devices"
         style="display:block;text-align:center;background:linear-gradient(135deg,#dc2626,#9333ea);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px">
        Review Active Devices →
      </a>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">
        This is an automated security notification from KoyJabo.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f3f4f6">
      <p style="color:#9ca3af;font-size:11px;margin:0">কই যাবো KoyJabo — Dhaka Transport Guide</p>
    </div>
  </div>
</body>
</html>`
      }).catch(() => {});
    }
  }

  return { success: true };
}

async function handleForgotPassword({ email }) {
  if (!email) return { success: false, error: 'Email required.' };

  const normalizedEmail = email.toLowerCase().trim();
  const emailHashKey = sha256hex(normalizedEmail);

  const indexFile = await readDataFile('data/users/index.json');
  const index = indexFile?.content || {};
  const userId = index[emailHashKey];

  // Always return success to prevent email enumeration attacks
  if (!userId) {
    return { success: true, message: 'If this email is registered, a reset link has been prepared.' };
  }

  const token = generateSecureToken();
  const tokenHash = sha256hex(token);
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  const resetFile = await readDataFile(`data/password_resets/${tokenHash}.json`);
  await writeDataFile(
    `data/password_resets/${tokenHash}.json`,
    { userId, expiresAt, used: false, createdAt: Date.now() },
    resetFile?.sha,
    'Create password reset token'
  );

  const resetUrl = `${APP_URL}?view=reset-password&token=${token}`;

  const userFile = await readDataFile(`data/users/${userId}.json`);
  const displayName = userFile?.content?.displayName || 'User';

  const sent = await sendEmail({
    to: normalizedEmail,
    subject: '🔑 Reset Your KoyJabo Password',
    html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f0f9ff;padding:24px;margin:0">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#0284c7,#7c3aed);padding:32px 24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">🔑 Password Reset</h1>
      <p style="color:#bae6fd;margin:6px 0 0;font-size:14px">কই যাবো KoyJabo</p>
    </div>
    <div style="padding:32px 24px">
      <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 20px">
        Hello <strong>${displayName}</strong>,<br><br>
        We received a request to reset your KoyJabo password. Click the button below to set a new one.
      </p>
      <a href="${resetUrl}"
         style="display:block;text-align:center;background:linear-gradient(135deg,#0284c7,#7c3aed);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px">
        Reset Password →
      </a>
      <p style="color:#6b7280;font-size:13px;text-align:center">This link expires in <strong>1 hour</strong>.</p>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">
        If you didn't request a reset, you can safely ignore this email.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f3f4f6">
      <p style="color:#9ca3af;font-size:11px;margin:0">কই যাবো KoyJabo — Dhaka Transport Guide</p>
    </div>
  </div>
</body>
</html>`
  });

  if (sent) {
    return { success: true, message: 'Password reset email sent. Check your inbox.' };
  }

  return {
    success: true,
    resetToken: token,
    resetUrl,
    message: 'Password reset link generated. (Email service not configured — copy the link below.)'
  };
}

async function handleResetPassword({ token, newPasswordHash }) {
  if (!token || !newPasswordHash) return { success: false, error: 'Reset token and new password required.' };

  const tokenHash = sha256hex(token);
  const resetFile = await readDataFile(`data/password_resets/${tokenHash}.json`);

  if (!resetFile) return { success: false, error: 'Invalid or expired reset link. Please request a new one.' };

  const { userId, expiresAt, used } = resetFile.content;
  if (used) return { success: false, error: 'This reset link has already been used.' };
  if (expiresAt < Date.now()) return { success: false, error: 'This reset link has expired. Please request a new one.' };

  const userFile = await readDataFile(`data/users/${userId}.json`);
  if (!userFile) return { success: false, error: 'User account not found.' };

  const newBcryptHash = await bcrypt.hash(newPasswordHash, 12);
  await writeDataFile(`data/users/${userId}.json`, { ...userFile.content, bcryptHash: newBcryptHash, updatedAt: Date.now() }, userFile.sha, `Password reset: ${userId}`);
  await writeDataFile(`data/password_resets/${tokenHash}.json`, { ...resetFile.content, used: true, usedAt: Date.now() }, resetFile.sha, 'Mark reset token used');

  return { success: true, userId };
}

async function handleSaveHistory({ userId, historyData }) {
  if (!userId) return { success: false, error: 'User ID required.' };

  // historyData is the parsed JSON from INPUT_DATA
  const safe = {
    busSearches:       Array.isArray(historyData.busSearches)       ? historyData.busSearches.slice(-50)       : [],
    routeSearches:     Array.isArray(historyData.routeSearches)     ? historyData.routeSearches.slice(-50)     : [],
    intercitySearches: Array.isArray(historyData.intercitySearches) ? historyData.intercitySearches.slice(-50) : [],
    mostUsedBuses:     (typeof historyData.mostUsedBuses === 'object' && historyData.mostUsedBuses)     ? historyData.mostUsedBuses     : {},
    mostUsedRoutes:    (typeof historyData.mostUsedRoutes === 'object' && historyData.mostUsedRoutes)    ? historyData.mostUsedRoutes    : {},
    mostUsedIntercity: (typeof historyData.mostUsedIntercity === 'object' && historyData.mostUsedIntercity) ? historyData.mostUsedIntercity : {},
    updatedAt: Date.now()
  };

  const existing = await readDataFile(`data/history/${userId}.json`);
  await writeDataFile(`data/history/${userId}.json`, safe, existing?.sha, `History sync: ${userId}`);
  return { success: true };
}

async function handleRecordVisit({ visitorId }) {
  const today = new Date().toISOString().split('T')[0];
  const statsFile = await readDataFile('data/stats/global.json');
  let stats = statsFile?.content || { totalVisits: 0, todayVisits: 0, todayDate: today, lastUpdated: 0 };

  // Reset today's count if it's a new day
  if (stats.todayDate !== today) {
    stats.todayVisits = 0;
    stats.todayDate = today;
  }

  stats.totalVisits = (stats.totalVisits || 0) + 1;
  stats.todayVisits = (stats.todayVisits || 0) + 1;
  stats.lastUpdated = Date.now();

  await writeDataFile('data/stats/global.json', stats, statsFile?.sha, `Visit: ${visitorId?.slice(0, 8) || 'anon'}`);
  return { success: true, totalVisits: stats.totalVisits, todayVisits: stats.todayVisits };
}

async function handleRecordDevice({ userId, deviceInfo }) {
  if (!userId || !deviceInfo) return { success: false, error: 'User ID and device info required.' };

  const devicesFile = await readDataFile(`data/devices/${userId}.json`);
  const devices = Array.isArray(devicesFile?.content) ? devicesFile.content : [];

  const now = Date.now();
  const existingIdx = devices.findIndex(d => d.id === deviceInfo.deviceId);

  let isNewDevice = false;
  let newDeviceInfo = null;

  if (existingIdx >= 0) {
    devices[existingIdx] = { ...devices[existingIdx], lastLogin: now, ip: deviceInfo.ip || devices[existingIdx].ip };
  } else {
    const parsed = parseUserAgent(deviceInfo.userAgent || '');
    const newDevice = {
      id: deviceInfo.deviceId || crypto.randomUUID(),
      name: parsed.name, os: parsed.os, browser: parsed.browser,
      deviceType: parsed.deviceType, ip: deviceInfo.ip || 'Unknown',
      firstLogin: now, lastLogin: now
    };
    if (devices.length >= 10) devices.splice(0, 1);
    devices.push(newDevice);
    isNewDevice = true;
    newDeviceInfo = { ...parsed, ip: newDevice.ip };
  }

  await writeDataFile(`data/devices/${userId}.json`, devices, devicesFile?.sha, `Device recorded: ${userId}`);

  // Send new device login alert (non-blocking)
  if (isNewDevice && newDeviceInfo) {
    const userFile = await readDataFile(`data/users/${userId}.json`).catch(() => null);
    if (userFile?.content?.encryptedEmail) {
      const userEmail = decrypt(userFile.content.encryptedEmail);
      if (userEmail) {
        const loginAt = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short' });
        sendEmail({
          to: userEmail,
          subject: '🔔 New device logged into your KoyJabo account',
          html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#eff6ff;padding:24px;margin:0">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:32px 24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">🔔 New Device Login</h1>
      <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px">Security Alert — কই যাবো KoyJabo</p>
    </div>
    <div style="padding:32px 24px">
      <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 16px">
        Hello <strong>${userFile.content.displayName || 'User'}</strong>,<br><br>
        A <strong>new device</strong> just signed in to your KoyJabo account.
      </p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin:0 0 20px">
        <p style="margin:0;color:#1e40af;font-size:14px;font-weight:600">New device details</p>
        <p style="margin:8px 0 0;color:#1d4ed8;font-size:13px">🕐 Time: <strong>${loginAt} (Dhaka)</strong></p>
        <p style="margin:4px 0 0;color:#1d4ed8;font-size:13px">💻 Device: <strong>${newDeviceInfo.name}</strong></p>
        <p style="margin:4px 0 0;color:#1d4ed8;font-size:13px">🖥️ OS: <strong>${newDeviceInfo.os}</strong></p>
        <p style="margin:4px 0 0;color:#1d4ed8;font-size:13px">🌐 Browser: <strong>${newDeviceInfo.browser}</strong></p>
        <p style="margin:4px 0 0;color:#1d4ed8;font-size:13px">📍 IP: <strong>${newDeviceInfo.ip}</strong></p>
      </div>
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin:0 0 24px">
        <p style="margin:0;color:#92400e;font-size:14px;font-weight:600">⚠️ Wasn't you?</p>
        <p style="margin:8px 0 0;color:#b45309;font-size:13px;line-height:1.5">
          If you didn't sign in from this device, change your password immediately and review your active devices.
        </p>
      </div>
      <a href="${APP_URL}?view=profile&section=devices"
         style="display:block;text-align:center;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px">
        Review Active Devices →
      </a>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f3f4f6">
      <p style="color:#9ca3af;font-size:11px;margin:0">কই যাবো KoyJabo — Dhaka Transport Guide</p>
    </div>
  </div>
</body>
</html>`
        }).catch(() => {});
      }
    }
  }

  return { success: true };
}

async function handleLogoutDevice({ userId, deviceId }) {
  if (!userId || !deviceId) return { success: false, error: 'User ID and device ID required.' };

  const devicesFile = await readDataFile(`data/devices/${userId}.json`);
  if (!devicesFile) return { success: true };

  const updated = devicesFile.content.filter(d => d.id !== deviceId);
  await writeDataFile(`data/devices/${userId}.json`, updated, devicesFile.sha, `Device logout: ${userId}`);
  return { success: true };
}

async function handleUploadAvatar({ userId, imageData }) {
  if (!userId || !imageData) return { success: false, error: 'User ID and image data required.' };

  const sizeBytes = Math.round((imageData.length * 3) / 4);
  if (sizeBytes > 150000) return { success: false, error: 'Image too large. Maximum size is 150 KB.' };

  const avatarFile = await readDataFile(`data/avatars/${userId}.json`);
  await writeDataFile(`data/avatars/${userId}.json`, { userId, imageData, updatedAt: Date.now() }, avatarFile?.sha, `Avatar update: ${userId}`);
  return { success: true, hasAvatar: true };
}

// ── Result Writer (writes to public app repo — temp UUID file, auto-deleted) ──
async function writeResult(requestId, result) {
  const existing = await readAppFile(`data/results/${requestId}.json`);
  await writeAppFile(
    `data/results/${requestId}.json`,
    { ...result, completedAt: Date.now() },
    existing?.sha,
    `Auth result: ${requestId}`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const requestId   = process.env.INPUT_REQUESTID;
  const action      = process.env.INPUT_ACTION;
  const email       = process.env.INPUT_EMAIL || '';
  const passwordHash = process.env.INPUT_PASSWORDHASH || '';
  const userId      = process.env.INPUT_USERID || '';

  let data = {};
  try { data = JSON.parse(process.env.INPUT_DATA || '{}'); } catch (_) {}

  if (email)        process.stdout.write(`::add-mask::${email}\n`);
  if (passwordHash) process.stdout.write(`::add-mask::${passwordHash}\n`);

  console.log(`Auth action: ${action} | requestId: ${requestId}`);

  if (!requestId) {
    console.error('Fatal: Missing requestId. Cannot report results back to frontend.');
    process.exit(1);
  }

  let result;
  try {
    if (!DATA_TOKEN) {
      throw new Error('DATA_GITHUB_TOKEN secret is not set in GitHub repository secrets.');
    }
    if (!action) {
      throw new Error('Missing action in workflow input.');
    }

    switch (action) {
      case 'signup':
        result = await handleSignup({ email, passwordHash, username: data.username, displayName: data.displayName });
        break;
      case 'update-profile':
        result = await handleUpdateProfile({ userId, displayName: data.displayName, username: data.username });
        break;
      case 'change-password':
        result = await handleChangePassword({ userId, newPasswordHash: passwordHash, oldPasswordHash: data.oldPasswordHash, userAgent: data.userAgent });
        break;
      case 'forgot-password':
        result = await handleForgotPassword({ email });
        break;
      case 'reset-password':
        result = await handleResetPassword({ token: data.token, newPasswordHash: passwordHash });
        break;
      case 'save-history':
        result = await handleSaveHistory({ userId, historyData: data });
        break;
      case 'record-visit':
        result = await handleRecordVisit({ visitorId: data.visitorId });
        break;
      case 'record-device':
        result = await handleRecordDevice({ userId, deviceInfo: data.deviceInfo });
        break;
      case 'logout-device':
        result = await handleLogoutDevice({ userId, deviceId: data.deviceId });
        break;
      case 'upload-avatar':
        result = await handleUploadAvatar({ userId, imageData: data.imageData });
        break;
      default:
        result = { success: false, error: `Unknown action: ${action}` };
    }
  } catch (err) {
    console.error('Handler error:', err.message);
    result = { success: false, error: err.message || 'An internal error occurred. Please try again.' };
  }

  // Final step: Always write the result so the frontend stops polling
  try {
    await writeResult(requestId, result);
    console.log(`Result written for ${requestId}: ${result.success ? 'OK' : 'FAIL'}`);
  } catch (writeErr) {
    console.error('CRITICAL: Failed to write result file to repository:', writeErr.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected fatal crash:', err);
  process.exit(1);
});
