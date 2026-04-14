#!/usr/bin/env node
'use strict';

/**
 * KoyJabo Auth Handler
 * Runs inside GitHub Actions as the secure backend for all auth operations.
 * Secrets (bcrypt, encryption key, JWT secret) never leave this environment.
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Octokit } = require('@octokit/rest');

// ── Config ────────────────────────────────────────────────────────────────────
const [OWNER, REPO_NAME] = (process.env.GITHUB_REPOSITORY || '/').split('/');
const TOKEN = process.env.AUTH_GITHUB_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_JWT_SECRET_IN_GITHUB_SECRETS';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'CHANGE_THIS_ENCRYPTION_KEY_32CHARS!!';
const SMTP_EMAIL = process.env.SMTP_EMAIL || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const APP_URL = process.env.APP_URL || 'https://mejbaurbahar.github.io/koyjabo';

const octokit = new Octokit({ auth: TOKEN });

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

  const osBrand = os.split(' ')[0];
  const browserBrand = browser.split(' ')[0];
  const name = `${browserBrand} on ${osBrand}`;

  return { os, browser, deviceType, name };
}

// ── GitHub File Operations ────────────────────────────────────────────────────
async function readFile(path) {
  try {
    const res = await octokit.repos.getContent({ owner: OWNER, repo: REPO_NAME, path });
    if (res.data.type !== 'file') return null;
    const content = JSON.parse(Buffer.from(res.data.content, 'base64').toString('utf8'));
    return { content, sha: res.data.sha };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function writeFile(path, content, sha, message = 'Auth system update') {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const params = {
    owner: OWNER,
    repo: REPO_NAME,
    path,
    message,
    content: encoded,
    committer: { name: 'KoyJabo Auth Bot', email: 'noreply@koyjabo.com' }
  };
  if (sha) params.sha = sha;
  await octokit.repos.createOrUpdateFileContents(params);
}

async function deleteFile(path, sha) {
  try {
    await octokit.repos.deleteFile({
      owner: OWNER, repo: REPO_NAME, path,
      message: 'Cleanup auth temp file',
      sha,
      committer: { name: 'KoyJabo Auth Bot', email: 'noreply@koyjabo.com' }
    });
  } catch (_) { /* ignore */ }
}

async function ensureIndexExists() {
  const f = await readFile('data/users/index.json');
  if (!f) {
    await writeFile('data/users/index.json', {}, null, 'Initialize user index');
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
    encryptedEmail,
    username: normalizedUsername,
    displayName: displayName.trim(),
    bcryptHash,
    createdAt: now,
    updatedAt: now
  };

  // Write user file first, then update index
  await writeFile(`data/users/${userId}.json`, user, null, `New user: ${userId}`);
  const freshIndex = await readFile('data/users/index.json');
  const updatedIndex = { ...(freshIndex?.content || {}), [emailHashKey]: userId };
  await writeFile('data/users/index.json', updatedIndex, freshIndex?.sha, 'Update user index');

  return {
    success: true,
    userId,
    username: user.username,
    displayName: user.displayName,
    email: normalizedEmail
  };
}

async function handleUpdateProfile({ userId, displayName, username }) {
  if (!userId) return { success: false, error: 'User ID required.' };

  const userFile = await readFile(`data/users/${userId}.json`);
  if (!userFile) return { success: false, error: 'User not found.' };

  const updated = {
    ...userFile.content,
    ...(displayName ? { displayName: displayName.trim() } : {}),
    ...(username ? { username: username.toLowerCase().trim() } : {}),
    updatedAt: Date.now()
  };

  await writeFile(`data/users/${userId}.json`, updated, userFile.sha, `Profile update: ${userId}`);
  return { success: true, userId, displayName: updated.displayName, username: updated.username };
}

async function handleChangePassword({ userId, newPasswordHash, oldPasswordHash }) {
  if (!userId || !newPasswordHash) return { success: false, error: 'User ID and new password required.' };

  const userFile = await readFile(`data/users/${userId}.json`);
  if (!userFile) return { success: false, error: 'User not found.' };

  if (oldPasswordHash) {
    const valid = await bcrypt.compare(oldPasswordHash, userFile.content.bcryptHash);
    if (!valid) return { success: false, error: 'Current password is incorrect.' };
  }

  const newBcryptHash = await bcrypt.hash(newPasswordHash, 12);
  const updated = { ...userFile.content, bcryptHash: newBcryptHash, updatedAt: Date.now() };
  await writeFile(`data/users/${userId}.json`, updated, userFile.sha, `Password changed: ${userId}`);
  return { success: true };
}

async function handleForgotPassword({ email }) {
  if (!email) return { success: false, error: 'Email required.' };

  const normalizedEmail = email.toLowerCase().trim();
  const emailHashKey = sha256hex(normalizedEmail);

  const indexFile = await readFile('data/users/index.json');
  const index = indexFile?.content || {};
  const userId = index[emailHashKey];

  // Always return success to prevent email enumeration attacks
  if (!userId) {
    return { success: true, message: 'If this email is registered, a reset link has been prepared.' };
  }

  const token = generateSecureToken();
  const tokenHash = sha256hex(token);
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  const resetFile = await readFile(`data/password_resets/${tokenHash}.json`);
  await writeFile(
    `data/password_resets/${tokenHash}.json`,
    { userId, expiresAt, used: false, createdAt: Date.now() },
    resetFile?.sha,
    'Create password reset token'
  );

  const resetUrl = `${APP_URL}?view=reset-password&token=${token}`;

  // Try sending email via Gmail SMTP if configured
  if (SMTP_EMAIL && SMTP_PASSWORD) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD }
      });

      const userFile = await readFile(`data/users/${userId}.json`);
      const displayName = userFile?.content?.displayName || 'User';

      await transporter.sendMail({
        from: `"KoyJabo কই যাবো" <${SMTP_EMAIL}>`,
        to: normalizedEmail,
        subject: 'Reset Your KoyJabo Password',
        html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f3f4f6;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
    <h2 style="color:#1e40af;margin-top:0">Password Reset</h2>
    <p>Hello <strong>${displayName}</strong>,</p>
    <p>We received a request to reset your KoyJabo password. Click the button below to reset it:</p>
    <a href="${resetUrl}"
       style="display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
      Reset Password
    </a>
    <p style="color:#6b7280;font-size:14px">This link expires in <strong>1 hour</strong>.</p>
    <p style="color:#6b7280;font-size:14px">If you didn't request a password reset, ignore this email.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="color:#9ca3af;font-size:12px">KoyJabo — Smart Transport Finder, Dhaka</p>
  </div>
</body>
</html>`
      });

      return { success: true, message: 'Password reset email sent. Check your inbox.' };
    } catch (emailErr) {
      console.log('Email send failed (SMTP not configured or failed):', emailErr.message);
    }
  }

  // Fallback: return the reset URL in the result (visible only in the app UI, not in logs)
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
  const resetFile = await readFile(`data/password_resets/${tokenHash}.json`);

  if (!resetFile) return { success: false, error: 'Invalid or expired reset link. Please request a new one.' };

  const { userId, expiresAt, used } = resetFile.content;

  if (used) return { success: false, error: 'This reset link has already been used.' };
  if (expiresAt < Date.now()) return { success: false, error: 'This reset link has expired. Please request a new one.' };

  const userFile = await readFile(`data/users/${userId}.json`);
  if (!userFile) return { success: false, error: 'User account not found.' };

  const newBcryptHash = await bcrypt.hash(newPasswordHash, 12);
  const updated = { ...userFile.content, bcryptHash: newBcryptHash, updatedAt: Date.now() };

  await writeFile(`data/users/${userId}.json`, updated, userFile.sha, `Password reset applied: ${userId}`);
  await writeFile(
    `data/password_resets/${tokenHash}.json`,
    { ...resetFile.content, used: true, usedAt: Date.now() },
    resetFile.sha,
    'Mark reset token used'
  );

  return { success: true, userId };
}

async function handleRecordDevice({ userId, deviceInfo }) {
  if (!userId || !deviceInfo) return { success: false, error: 'User ID and device info required.' };

  const devicesFile = await readFile(`data/devices/${userId}.json`);
  const devices = Array.isArray(devicesFile?.content) ? devicesFile.content : [];

  const now = Date.now();
  const existingIdx = devices.findIndex(d => d.id === deviceInfo.deviceId);

  if (existingIdx >= 0) {
    devices[existingIdx] = { ...devices[existingIdx], lastLogin: now, ip: deviceInfo.ip || devices[existingIdx].ip };
  } else {
    const parsed = parseUserAgent(deviceInfo.userAgent || '');
    const newDevice = {
      id: deviceInfo.deviceId || crypto.randomUUID(),
      name: parsed.name,
      os: parsed.os,
      browser: parsed.browser,
      deviceType: parsed.deviceType,
      ip: deviceInfo.ip || 'Unknown',
      firstLogin: now,
      lastLogin: now
    };
    // Keep max 10 devices (oldest first out)
    if (devices.length >= 10) devices.splice(0, 1);
    devices.push(newDevice);
  }

  await writeFile(`data/devices/${userId}.json`, devices, devicesFile?.sha, `Device recorded: ${userId}`);
  return { success: true };
}

async function handleLogoutDevice({ userId, deviceId }) {
  if (!userId || !deviceId) return { success: false, error: 'User ID and device ID required.' };

  const devicesFile = await readFile(`data/devices/${userId}.json`);
  if (!devicesFile) return { success: true };

  const updated = devicesFile.content.filter(d => d.id !== deviceId);
  await writeFile(`data/devices/${userId}.json`, updated, devicesFile.sha, `Device logout: ${userId}`);
  return { success: true };
}

async function handleUploadAvatar({ userId, imageData }) {
  if (!userId || !imageData) return { success: false, error: 'User ID and image data required.' };

  // imageData is a data URL: "data:image/webp;base64,..."
  const sizeBytes = Math.round((imageData.length * 3) / 4);
  if (sizeBytes > 150000) return { success: false, error: 'Image too large. Maximum size is 150 KB.' };

  const avatarFile = await readFile(`data/avatars/${userId}.json`);
  await writeFile(
    `data/avatars/${userId}.json`,
    { userId, imageData, updatedAt: Date.now() },
    avatarFile?.sha,
    `Avatar update: ${userId}`
  );

  return { success: true, hasAvatar: true };
}

// ── Result Writer ─────────────────────────────────────────────────────────────
async function writeResult(requestId, result) {
  const existing = await readFile(`data/results/${requestId}.json`);
  await writeFile(
    `data/results/${requestId}.json`,
    { ...result, completedAt: Date.now() },
    existing?.sha,
    `Auth result: ${requestId}`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const requestId = process.env.INPUT_REQUESTID;
  const action = process.env.INPUT_ACTION;
  const email = process.env.INPUT_EMAIL || '';
  const passwordHash = process.env.INPUT_PASSWORDHASH || '';
  const userId = process.env.INPUT_USERID || '';

  let data = {};
  try { data = JSON.parse(process.env.INPUT_DATA || '{}'); } catch (_) {}

  // Mask sensitive inputs from GitHub Actions logs
  if (email) process.stdout.write(`::add-mask::${email}\n`);
  if (passwordHash) process.stdout.write(`::add-mask::${passwordHash}\n`);

  console.log(`Auth action: ${action} | requestId: ${requestId}`);

  if (!requestId || !action) {
    console.error('Missing requestId or action');
    process.exit(1);
  }

  let result;
  try {
    switch (action) {
      case 'signup':
        result = await handleSignup({ email, passwordHash, username: data.username, displayName: data.displayName });
        break;
      case 'update-profile':
        result = await handleUpdateProfile({ userId, displayName: data.displayName, username: data.username });
        break;
      case 'change-password':
        result = await handleChangePassword({ userId, newPasswordHash: passwordHash, oldPasswordHash: data.oldPasswordHash });
        break;
      case 'forgot-password':
        result = await handleForgotPassword({ email });
        break;
      case 'reset-password':
        result = await handleResetPassword({ token: data.token, newPasswordHash: passwordHash });
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
    result = { success: false, error: 'An internal error occurred. Please try again.' };
  }

  await writeResult(requestId, result);
  console.log(`Completed: ${action} → ${result.success ? 'OK' : 'FAIL: ' + result.error}`);
}

main().catch(err => {
  console.error('Fatal error in auth-handler:', err);
  process.exit(1);
});
