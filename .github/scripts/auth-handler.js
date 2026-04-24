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
// Result files — written here, Cloudflare Worker reads this repo FIRST (public)
const APP_OWNER  = 'mejbaurbahar';
const APP_REPO   = 'Dhaka-Commute';

// User data — all written here (users, avatars, devices, history, stats)
const DATA_OWNER = 'mejbaurbahar';
const DATA_REPO  = 'koyjabo';

// GITHUB_TOKEN: auto per-run token (write access to koyjabo-core only)
const CORE_TOKEN = process.env.AUTH_GITHUB_TOKEN;
// DATA_GITHUB_TOKEN: classic PAT — write access to koyjabo + Dhaka-Commute
const DATA_TOKEN = process.env.DATA_GITHUB_TOKEN || CORE_TOKEN;

const JWT_SECRET     = process.env.JWT_SECRET     || '';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const SMTP_EMAIL     = process.env.SMTP_EMAIL     || '';
const SMTP_PASSWORD  = process.env.SMTP_PASSWORD  || '';
const APP_URL        = process.env.APP_URL        || 'https://koyjabo.com';

// octokitData: user data    → koyjabo (PAT has write access)
// octokitApp:  result files → Dhaka-Commute (PAT has write access)
const octokitData   = new Octokit({ auth: DATA_TOKEN });
const octokitApp    = new Octokit({ auth: DATA_TOKEN });
const octokitLegacy = new Octokit({ auth: DATA_TOKEN });

// ── Disposable / temp-mail domain blocklist ───────────────────────────────────
const TEMP_MAIL_DOMAINS = new Set([
  '10minutemail.com','10minutemail.net','10minutemail.org','10minutemail.de',
  '10minutemail.co.uk','10minutemail.cf','10minutemail.ga','10minutemail.gq',
  '10minutemail.ml','10minutemail.tk','10minemail.com','10mails.net',
  'minutemailbox.com','20minutemail.com','20minutemail.it','throwam.com',
  'throwam.net','trashmail.com','trashmail.at','trashmail.io','trashmail.me',
  'trashmail.net','trashmail.org','trashmail.xyz','trashmail.de','trashmail.eu',
  'trashmail.app','trashmailer.com','trash-mail.at','tempinbox.com',
  'tempr.email','tempmail.com','tempmail.net','tempmail.org','tempmail.de',
  'tempmail.us','tempmail.eu','tempmail.it','tempmail.co','tempmail.biz',
  'tempmail.io','temp-mail.org','temp-mail.ru','temp-mail.io','tempm.com',
  'temp-inbox.com','temporary-mail.com','temporaryemail.com','temporaryemail.net',
  'temporaryinbox.com','mytemp.email','mytempemail.com','mytempmail.com',
  'tempe.email','tempsky.com',
  'mailinator.com','mailinator.net','mailinator.org','mailinator2.com',
  'mailinater.com','mailinator.gq','suremail.info','tradermail.info',
  'dispostable.com','tempan.com','spam4.me','sharklasers.com',
  'guerrillamail.com','guerrillamail.net','guerrillamail.org','guerrillamail.biz',
  'guerrillamail.de','guerrillamail.info','guerrillamailblock.com','grr.la',
  'spam.la','spam.org.es',
  'yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf','nospam.ze.tc',
  'nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf',
  'moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf',
  'jetable.org','jetable.net','jetable.pp.ua','jetable.com',
  'spamgourmet.com','spamgourmet.net','spamgourmet.org',
  'spamfree24.org','spamfree.eu','spam.su',
  'maildrop.cc','mailnull.com','discard.email','discardmail.com',
  'discardmail.de','spamcorpse.com','nospam4.us','nospamfor.us',
  'nospammail.net','no-spam.ws','nobulk.com',
  'fakeinbox.com','fakeinbox.net','fakeinbox.org','fakeinboxemail.com',
  'fake-email.pp.ua','spamex.com','spamevader.net','mailnesia.com','mailnew.com',
  'throwaway.email','filzmail.com','filzmail.de',
  'getairmail.com','getnada.com','getnada.co','nada.email',
  'mohmal.com','owlymail.com','einrot.com',
  'dispostable.com','incognitomail.com','incognitomail.net','incognitomail.org',
  'inboxalias.com','inboxclean.com','inboxclean.org',
  'spamhole.com','anonymbox.com','mailexpire.com','killmail.com','killmail.net',
  'wegwerfmail.de','wegwerfmail.net','wegwerfmail.org',
  'mailbucket.org','mailcat.biz','mailcatch.com','mailfall.com',
  'mailforspam.com','maileater.com','mailsucker.net','mailzilla.com','mailzilla.org',
  'deadaddress.com','sneakemail.com','bouncr.com','emailondeck.com',
  'mintemail.com','gishpuppy.com','hatespam.org','h8s.org','herp.in',
  'mailtemp.net','mailrock.biz','trashdevil.com','trashdevil.de',
  'ihateyoualot.info','iheartspam.org','fleckens.hu','meltmail.com',
  'netmails.com','netmails.net','hmamail.com','destroyemailaddress.com',
  'e4ward.com','kaspop.com','kasmail.com','nowmymail.com',
  'lortemail.dk','lovemeleaveme.com','lroid.com',
  'spamab.com','spamcon.org','spam.care','spamdecoy.net',
  'spamfree24.com','spamfree24.de','spamfree24.eu','spamfree24.info',
  'spamfree24.net','tempalias.com','tempail.com','tempinbox.me',
  'trashcanmail.com','trashinbox.com','trashinbox.net',
  'mt2014.com','mt2015.com','mt2016.com','mailnull.com','mailpick.biz',
  'mailtothis.com','mailtrash.net','mailtv.net','mailtv.tv','mailworks.org',
  'zehnminutenmail.de','zoemail.com','zoemail.net','zoemail.org',
  'bugmenot.com','shiftmail.com','willhackforfood.biz','willselfdestruct.com',
  'ieh-mail.de','ieatspam.eu','ieatspam.info','insorg.org',
  'notmailinator.com','noref.in','nowhere.org','nullbox.info',
  'spamgob.com','spamslicer.com','spamspot.com','spamstack.net',
  'spamthis.co.uk','spamthisplease.com','spamtroll.net',
  'receivemail.com','safetypost.de','secure-mail.biz',
  'uroid.com','veryrealemail.com','whyspam.me','wuzupmail.net',
  'xagloo.co','xagloo.com','xemaps.com','xents.com',
  'yep.it','yomail.info','yopweb.com','zc.com',
]);

function isTempMail(email) {
  const domain = (email.split('@')[1] || '').toLowerCase().trim();
  return TEMP_MAIL_DOMAINS.has(domain);
}

async function isTempMailApi(domain) {
  return new Promise((resolve) => {
    const https = require('https');
    const url = `https://open.kickbox.com/v1/disposable/${encodeURIComponent(domain)}`;
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).disposable === true);
        } catch { resolve(false); }
      });
    });
    req.on('error', () => resolve(false));
    req.setTimeout(4000, () => { req.destroy(); resolve(false); });
  });
}

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

// ── Admin: send full user list as PDF after every new signup ─────────────────
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'koyjabo.bd@gmail.com';

async function fetchAllUsers() {
  // Merge user IDs from current repo (koyjabo-core) + legacy repo (koyjabo)
  const [indexFile, legacyIndexFile] = await Promise.all([
    readDataFile('data/users/index.json'),
    readLegacyFile('data/users/index.json'),
  ]);
  const index       = indexFile?.content       || {};
  const legacyIndex = legacyIndexFile?.content || {};

  // Build a map: userId → which repo has it (prefer current over legacy)
  const userRepoMap = new Map();
  for (const uid of Object.values(legacyIndex)) userRepoMap.set(uid, 'legacy');
  for (const uid of Object.values(index))       userRepoMap.set(uid, 'current');

  const userIds = [...userRepoMap.keys()];

  // Batch-fetch user files in groups of 10 to stay within rate limits
  const users = [];
  for (let i = 0; i < userIds.length; i += 10) {
    const batch = userIds.slice(i, i + 10);
    const results = await Promise.all(
      batch.map(uid => {
        const repo = userRepoMap.get(uid);
        const fn = repo === 'legacy'
          ? readLegacyFile(`data/users/${uid}.json`)
          : readDataFile(`data/users/${uid}.json`);
        return fn.catch(() => null);
      })
    );
    for (const r of results) {
      if (r?.content) users.push(r.content);
    }
  }

  // Sort by createdAt ascending so serial numbers are stable
  users.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return users;
}


async function sendAdminUserListEmail(triggeringUser) {
  if (!SMTP_EMAIL || !SMTP_PASSWORD) {
    console.log('Admin email skipped: SMTP not configured.');
    return;
  }
  if (!ADMIN_EMAIL) {
    console.log('Admin email skipped: ADMIN_EMAIL secret not set.');
    return;
  }
  try {
    console.log('Admin email: fetching all users...');
    const users = await fetchAllUsers();
    console.log(`Admin email: fetched ${users.length} users, building email...`);

    const joinedAt = triggeringUser.createdAt
      ? new Date(triggeringUser.createdAt).toLocaleString('en-US', {
          timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short'
        })
      : 'just now';

    const generatedAt = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka', dateStyle: 'long', timeStyle: 'short'
    });

    const tableRows = users.map((u, i) => {
      const joined = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka', dateStyle: 'medium' })
        : 'N/A';
      const bg = i % 2 === 0 ? '#f0fdf4' : '#ffffff';
      return `<tr style="background:${bg}">
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;font-size:12px">${i + 1}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:13px">${u.displayName || '—'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#059669;font-size:13px;font-family:monospace">@${u.username || '—'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px">${joined}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f0fdf4;padding:24px;margin:0">
  <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#059669,#0284c7);padding:28px 24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">&#128100; New User Signup</h1>
      <p style="color:#d1fae5;margin:6px 0 0;font-size:13px">KoyJabo Admin Notification</p>
    </div>
    <div style="padding:28px 24px">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin:0 0 20px">
        <p style="margin:0;color:#065f46;font-size:14px;font-weight:600">New user details</p>
        <p style="margin:8px 0 0;color:#047857;font-size:13px">Name: <strong>${triggeringUser.displayName}</strong></p>
        <p style="margin:4px 0 0;color:#047857;font-size:13px">Username: <strong>@${triggeringUser.username}</strong></p>
        <p style="margin:4px 0 0;color:#047857;font-size:13px">Joined: <strong>${joinedAt} (Dhaka)</strong></p>
      </div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 20px;margin:0 0 24px">
        <p style="margin:0;color:#1e40af;font-size:13px">
          Total registered users: <strong>${users.length}</strong> &nbsp;|&nbsp; Report generated: ${generatedAt}
        </p>
      </div>
      <h3 style="margin:0 0 12px;color:#111827;font-size:15px">All Users</h3>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#065f46">
            <th style="padding:10px;color:#fff;font-size:12px;text-align:center;width:40px">#</th>
            <th style="padding:10px;color:#fff;font-size:12px;text-align:left">Full Name</th>
            <th style="padding:10px;color:#fff;font-size:12px;text-align:left">Username</th>
            <th style="padding:10px;color:#fff;font-size:12px;text-align:left">Joined</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <p style="color:#9ca3af;font-size:11px;text-align:center;margin:20px 0 0">
        Automated admin report — KoyJabo Dhaka Transport Guide
      </p>
    </div>
  </div>
</body>
</html>`;

    await sendEmail({ to: ADMIN_EMAIL, subject: `New signup: ${triggeringUser.displayName} (@${triggeringUser.username}) | Total: ${users.length} users`, html });
    console.log(`Admin user-list email sent OK → ${ADMIN_EMAIL} | ${users.length} users`);
  } catch (err) {
    console.error(`Admin user-list email FAILED: ${err.message}`);
    console.error(err.stack);
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

// ── Data Repo File Operations (koyjabo-core — user data, Cloudflare Worker reads here) ──
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

// Read → transform → write with up to 3 retries on SHA conflict (422).
// Prevents concurrent workflow runs from silently dropping stats updates.
async function updateDataFileWithRetry(path, updater, message, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const file = await readDataFile(path);
    const content = updater(file?.content ?? null);
    try {
      await writeDataFile(path, content, file?.sha, message);
      return content;
    } catch (err) {
      if (err.status === 422 && attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 150 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
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

// ── App Repo File Operations (Dhaka-Commute — result files, Cloudflare Worker reads here first) ──
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

// ── Legacy Repo File Operations (koyjabo — read old user data) ────────────────
async function readLegacyFile(path) {
  try {
    const res = await octokitLegacy.repos.getContent({ owner: LEGACY_OWNER, repo: LEGACY_REPO, path });
    if (res.data.type !== 'file') return null;
    const content = JSON.parse(Buffer.from(res.data.content, 'base64').toString('utf8'));
    return { content, sha: res.data.sha };
  } catch (_) { return null; }
}

async function ensureIndexExists() {
  const f = await readDataFile('data/users/index.json');
  if (!f) {
    await writeDataFile('data/users/index.json', {}, null, 'Initialize user index');
    return { content: {}, sha: null };
  }
  return f;
}

async function ensureUsernameIndexExists() {
  const f = await readDataFile('data/users/username_index.json');
  if (!f) {
    await writeDataFile('data/users/username_index.json', {}, null, 'Initialize username index');
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

  if (isTempMail(normalizedEmail)) {
    return { success: false, error: 'Temporary or disposable email addresses are not allowed. Please use a real email address (Gmail, Yahoo, Outlook, etc.).' };
  }

  const emailDomain = normalizedEmail.split('@')[1] || '';
  const disposableViaApi = await isTempMailApi(emailDomain);
  if (disposableViaApi) {
    return { success: false, error: 'Temporary or disposable email addresses are not allowed. Please use a real email address (Gmail, Yahoo, Outlook, etc.).' };
  }
  const normalizedUsername = username.toLowerCase().trim();
  const emailHashKey = sha256hex(normalizedEmail);

  // Check username format (3-30 chars, letters/numbers/underscores only)
  if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
    return { success: false, error: 'Username must be 3–30 characters and contain only letters, numbers, or underscores.' };
  }

  const [indexFile, usernameIndexFile] = await Promise.all([
    ensureIndexExists(),
    ensureUsernameIndexExists()
  ]);
  const index = indexFile.content || {};
  const usernameIndex = usernameIndexFile.content || {};

  if (index[emailHashKey]) {
    return { success: false, error: 'This email is already registered. Please log in.' };
  }
  if (usernameIndex[normalizedUsername]) {
    return { success: false, error: `The username "@${normalizedUsername}" is already taken. Please choose a different one.` };
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
  // Update email index
  const freshIndex = await readDataFile('data/users/index.json');
  const updatedIndex = { ...(freshIndex?.content || {}), [emailHashKey]: userId };
  await writeDataFile('data/users/index.json', updatedIndex, freshIndex?.sha, 'Update user index');
  // Update username index
  const freshUsernameIndex = await readDataFile('data/users/username_index.json');
  const updatedUsernameIndex = { ...(freshUsernameIndex?.content || {}), [normalizedUsername]: userId };
  await writeDataFile('data/users/username_index.json', updatedUsernameIndex, freshUsernameIndex?.sha, 'Update username index');

  // Send admin user-list email (non-blocking, fires after user is saved)
  sendAdminUserListEmail({ displayName: user.displayName, username: user.username, createdAt: now })
    .catch(err => console.error('sendAdminUserListEmail unexpected error:', err.message));

  // Send welcome email (non-blocking)
  sendEmail({
    to: normalizedEmail,
    subject: '🎉 Welcome to কই যাবো KoyJabo!',
    html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f0fdf4;padding:24px;margin:0">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#ffffff;padding:32px 24px;text-align:center;border-bottom:1px solid #e5e7eb">
      <img src="${APP_URL}/logo.png" alt="KoyJabo" style="width:64px;height:64px;border-radius:16px;background:#ffffff;padding:8px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;">
      <h1 style="color:#111827;margin:0;font-size:28px;letter-spacing:-0.5px">কই যাবো KoyJabo</h1>
      <p style="color:#4b5563;margin:6px 0 0;font-size:14px">Bangladesh's Smart Transport Finder</p>
    </div>
    <div style="padding:32px 24px">
      <h2 style="color:#111827;margin:0 0 8px">Welcome, ${displayName.trim()}! 🎉</h2>
      <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 20px">
        Your account has been created successfully. You're now part of the KoyJabo community —
        BANGLADESH's smartest way to find Dhaka city local bus routes, metro schedules, and intercity travel.
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

  // Update global stats: increment totalUsers (non-blocking, best-effort)
  updateDataFileWithRetry(
    'data/stats/global.json',
    (existing) => {
      const today = new Date().toISOString().split('T')[0];
      const s = existing || { totalVisits: 0, todayVisits: 0, totalUsers: 0, todayDate: today, lastUpdated: 0 };
      s.totalUsers = (s.totalUsers || 0) + 1;
      s.lastUpdated = Date.now();
      return s;
    },
    `New user: ${userId}`
  ).catch(() => {});

  return { success: true, userId, username: user.username, displayName: user.displayName, email: normalizedEmail };
}

async function handleUpdateProfile({ userId, displayName, username }) {
  if (!userId) return { success: false, error: 'User ID required.' };

  const userFile = await readDataFile(`data/users/${userId}.json`);
  if (!userFile) return { success: false, error: 'User not found.' };

  let newUsername = userFile.content.username;

  if (username) {
    newUsername = username.toLowerCase().trim();

    if (!/^[a-z0-9_]{3,30}$/.test(newUsername)) {
      return { success: false, error: 'Username must be 3–30 characters and contain only letters, numbers, or underscores.' };
    }

    // Check uniqueness only if username is changing
    if (newUsername !== userFile.content.username) {
      const usernameIndexFile = await readDataFile('data/users/username_index.json');
      const usernameIndex = usernameIndexFile?.content || {};
      const existingUserId = usernameIndex[newUsername];
      if (existingUserId && existingUserId !== userId) {
        return { success: false, error: `The username "@${newUsername}" is already taken. Please choose a different one.` };
      }

      // Update username index: remove old, add new (single atomic write)
      const oldUsername = userFile.content.username;
      const freshUsernameIndex = await readDataFile('data/users/username_index.json');
      const baseIndex = freshUsernameIndex?.content || {};
      const cleanIndex = {};
      for (const [k, v] of Object.entries(baseIndex)) {
        if (k !== oldUsername) cleanIndex[k] = v;
      }
      cleanIndex[newUsername] = userId;
      await writeDataFile('data/users/username_index.json', cleanIndex, freshUsernameIndex?.sha, 'Update username index');
    }
  }

  const updated = {
    ...userFile.content,
    ...(displayName ? { displayName: displayName.trim() } : {}),
    username: newUsername,
    updatedAt: Date.now()
  };

  await writeDataFile(`data/users/${userId}.json`, updated, userFile.sha, `Profile update: ${userId}`);
  return { success: true, userId, displayName: updated.displayName, username: updated.username };
}

async function handleChangePassword({ userId, newPasswordHash, oldPasswordHash, userAgent }) {
  if (!userId || !newPasswordHash || !oldPasswordHash) {
    return { success: false, error: 'Current password is required to change your password.' };
  }

  const userFile = await readDataFile(`data/users/${userId}.json`);
  if (!userFile) return { success: false, error: 'User not found.' };

  const valid = await bcrypt.compare(oldPasswordHash, userFile.content.bcryptHash);
  if (!valid) return { success: false, error: 'Current password is incorrect.' };

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
    <div style="background:#ffffff;padding:32px 24px;text-align:center;border-bottom:1px solid #e5e7eb">
      <img src="${APP_URL}/logo.png" alt="KoyJabo" style="width:48px;height:48px;border-radius:12px;background:#ffffff;padding:6px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;">
      <h1 style="color:#111827;margin:0;font-size:24px">🔐 Password Changed</h1>
      <p style="color:#4b5563;margin:6px 0 0;font-size:14px">Security Alert — কই যাবো KoyJabo</p>
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
    return { success: true, message: 'If this email is registered, a reset link has been sent.' };
  }

  // Generate a UUID session token used as the one-time reset link
  const sessionToken = crypto.randomUUID();
  const tokenHash = sha256hex(sessionToken);
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  await writeDataFile(
    `data/password_resets/${tokenHash}.json`,
    { userId, expiresAt, used: false, createdAt: Date.now() },
    null,
    'Create password reset session'
  );

  const userFile = await readDataFile(`data/users/${userId}.json`);
  const displayName = userFile?.content?.displayName || 'User';

  const resetLink = `${APP_URL}/reset-password?token=${sessionToken}`;

  const sent = await sendEmail({
    to: normalizedEmail,
    subject: 'Reset your KoyJabo password',
    html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f0f9ff;padding:24px;margin:0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#ffffff;padding:28px 24px;text-align:center;border-bottom:1px solid #e5e7eb">
      <img src="${APP_URL}/logo.png" alt="KoyJabo" style="width:48px;height:48px;border-radius:12px;background:#ffffff;padding:6px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;">
      <h1 style="color:#111827;margin:0;font-size:22px">🔐 Password Reset</h1>
      <p style="color:#4b5563;margin:6px 0 0;font-size:13px">কই যাবো KoyJabo</p>
    </div>
    <div style="padding:32px 24px;text-align:center">
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
        Hello <strong>${displayName}</strong>,<br>
        Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.
      </p>
      <a href="${resetLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700;margin-bottom:24px">Reset Password</a>
      <p style="color:#6b7280;font-size:13px;margin:16px 0 4px">Or copy this link:</p>
      <p style="color:#2563eb;font-size:12px;word-break:break-all;margin:0 0 24px">${resetLink}</p>
      <p style="color:#9ca3af;font-size:12px;margin:0">Do not share this link with anyone.</p>
    </div>
    <div style="background:#fef2f2;padding:16px 24px;text-align:center">
      <p style="color:#b91c1c;font-size:12px;margin:0">If you didn't request this, ignore this email. Your account is safe.</p>
    </div>
    <div style="background:#f9fafb;padding:12px 24px;text-align:center;border-top:1px solid #f3f4f6">
      <p style="color:#9ca3af;font-size:11px;margin:0">কই যাবো KoyJabo — Dhaka Transport Guide</p>
    </div>
  </div>
</body>
</html>`
  });

  if (sent) {
    return { success: true, sessionToken, message: 'Password reset link sent to your email. Check your inbox.' };
  }

  // SMTP not configured — return the reset link directly (dev fallback)
  console.log(`[forgot-password] SMTP not configured. Returning reset link in result (dev fallback).`);
  return {
    success: true,
    sessionToken,
    resetLink,
    message: `Email service not configured. Reset link: ${resetLink}`
  };
}

async function handleVerifyOtp({ sessionToken, otp }) {
  if (!sessionToken || !otp) return { success: false, error: 'Session token and verification code required.' };

  const tokenHash = sha256hex(sessionToken);
  const resetFile = await readDataFile(`data/password_resets/${tokenHash}.json`);

  if (!resetFile) return { success: false, error: 'Invalid or expired session. Please request a new code.' };

  const { otpHash, expiresAt, used, verified, attempts = 0 } = resetFile.content;

  if (used)              return { success: false, error: 'This session has already been used.' };
  if (expiresAt < Date.now()) return { success: false, error: 'This code has expired. Please request a new one.' };
  if (attempts >= 3)     return { success: false, error: 'Too many incorrect attempts. Please request a new code.' };
  if (verified)          return { success: true }; // already verified, idempotent

  const inputOtpHash = sha256hex(String(otp).trim());
  if (inputOtpHash !== otpHash) {
    const newAttempts = attempts + 1;
    await writeDataFile(
      `data/password_resets/${tokenHash}.json`,
      { ...resetFile.content, attempts: newAttempts },
      resetFile.sha,
      'OTP attempt failed'
    );
    const remaining = 3 - newAttempts;
    if (remaining <= 0) return { success: false, error: 'Too many incorrect attempts. Please request a new code.' };
    return { success: false, error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` };
  }

  await writeDataFile(
    `data/password_resets/${tokenHash}.json`,
    { ...resetFile.content, verified: true, verifiedAt: Date.now() },
    resetFile.sha,
    'OTP verified'
  );

  return { success: true };
}

async function handleResetPassword({ token, newPasswordHash }) {
  if (!token || !newPasswordHash) return { success: false, error: 'Session token and new password required.' };

  const tokenHash = sha256hex(token);
  const resetFile = await readDataFile(`data/password_resets/${tokenHash}.json`);

  if (!resetFile) return { success: false, error: 'Invalid or expired session. Please request a new code.' };

  const { userId, expiresAt, used } = resetFile.content;
  if (used)                    return { success: false, error: 'This reset link has already been used.' };
  if (expiresAt < Date.now())  return { success: false, error: 'This reset link has expired. Please request a new one.' };

  const userFile = await readDataFile(`data/users/${userId}.json`);
  if (!userFile) return { success: false, error: 'User account not found.' };

  const newBcryptHash = await bcrypt.hash(newPasswordHash, 12);
  await writeDataFile(`data/users/${userId}.json`, { ...userFile.content, bcryptHash: newBcryptHash, updatedAt: Date.now() }, userFile.sha, `Password reset: ${userId}`);
  await writeDataFile(`data/password_resets/${tokenHash}.json`, { ...resetFile.content, used: true, usedAt: Date.now() }, resetFile.sha, 'Mark reset token used');

  return { success: true, userId };
}

async function handleSaveHistory({ userId, historyData }) {
  if (!userId) return { success: false, error: 'User ID required.' };

  // Fetch user profile for identity tagging
  const userFile = await readDataFile(`data/users/${userId}.json`).catch(() => null);
  const userDisplayName = userFile?.content?.displayName || '';
  const userUsername = userFile?.content?.username || '';

  // historyData is the parsed JSON from INPUT_DATA
  const safe = {
    userId,
    displayName: userDisplayName,
    username: userUsername,
    busSearches:       Array.isArray(historyData.busSearches)       ? historyData.busSearches.slice(-50)       : [],
    routeSearches:     Array.isArray(historyData.routeSearches)     ? historyData.routeSearches.slice(-50)     : [],
    intercitySearches: Array.isArray(historyData.intercitySearches) ? historyData.intercitySearches.slice(-50) : [],
    trainSearches:     Array.isArray(historyData.trainSearches)     ? historyData.trainSearches.slice(-50)     : [],
    mostUsedBuses:     (typeof historyData.mostUsedBuses === 'object' && historyData.mostUsedBuses)     ? historyData.mostUsedBuses     : {},
    mostUsedRoutes:    (typeof historyData.mostUsedRoutes === 'object' && historyData.mostUsedRoutes)    ? historyData.mostUsedRoutes    : {},
    mostUsedIntercity: (typeof historyData.mostUsedIntercity === 'object' && historyData.mostUsedIntercity) ? historyData.mostUsedIntercity : {},
    mostUsedTrains:    (typeof historyData.mostUsedTrains === 'object' && historyData.mostUsedTrains)    ? historyData.mostUsedTrains    : {},
    updatedAt: Date.now()
  };

  const existing = await readDataFile(`data/history/${userId}.json`);
  await writeDataFile(`data/history/${userId}.json`, safe, existing?.sha, `History sync: ${userDisplayName || userId}`);
  return { success: true };
}

async function handleRecordVisit({ visitorId, userId }) {
  const today = new Date().toISOString().split('T')[0];
  const isLoggedIn = !!(userId && userId !== 'anonymous');
  const updated = await updateDataFileWithRetry(
    'data/stats/global.json',
    (existing) => {
      const s = existing || { totalVisits: 0, todayVisits: 0, totalUsers: 0, loggedInVisits: 0, anonymousVisits: 0, todayDate: today, lastUpdated: 0 };
      if (s.todayDate !== today) { s.todayVisits = 0; s.todayDate = today; }
      s.totalVisits = (s.totalVisits || 0) + 1;
      s.todayVisits = (s.todayVisits || 0) + 1;
      if (isLoggedIn) {
        s.loggedInVisits = (s.loggedInVisits || 0) + 1;
      } else {
        s.anonymousVisits = (s.anonymousVisits || 0) + 1;
      }
      s.lastUpdated = Date.now();
      return s;
    },
    `Visit: ${visitorId?.slice(0, 8) || 'anon'}`
  );
  return { success: true, totalVisits: updated.totalVisits, todayVisits: updated.todayVisits };
}

async function handleSaveData({ path, content, message }) {
  if (!path || !content) return { success: false, error: 'Path and content required.' };
  
  // Security: only allow writing to data/ directory
  if (!path.startsWith('data/')) {
    return { success: false, error: 'Access denied: can only write to data/ directory.' };
  }

  const file = await readDataFile(path);
  await writeDataFile(path, content, file?.sha, message || `Data sync: ${path}`);
  return { success: true };
}

async function handleRecordQuery({ query, response, intent, quality, lang, userId }) {
  const today = new Date().toISOString().split('T')[0];
  const path = `data/learning/queries/${today}.json`;
  
  const file = await readDataFile(path);
  const data = file?.content || { date: today, queries: [] };
  
  data.queries.push({
    query,
    responseLen: response?.length || 0,
    intent,
    quality,
    lang,
    userId: userId || 'anonymous',
    timestamp: Date.now()
  });
  
  // Keep daily file manageable (last 500 queries per day)
  if (data.queries.length > 500) {
    data.queries = data.queries.slice(-500);
  }
  
  await writeDataFile(path, data, file?.sha, `Query record: ${query.slice(0, 30)}...`);
  return { success: true };
}

async function handleRecordDevice({ userId, deviceInfo }) {
  if (!userId || !deviceInfo) return { success: false, error: 'User ID and device info required.' };

  // Fetch user profile to include displayName and username in device record
  const userFile = await readDataFile(`data/users/${userId}.json`).catch(() => null);
  const userDisplayName = userFile?.content?.displayName || '';
  const userUsername = userFile?.content?.username || '';

  const devicesFile = await readDataFile(`data/devices/${userId}.json`);
  const devices = Array.isArray(devicesFile?.content) ? devicesFile.content : [];

  const now = Date.now();
  const existingIdx = devices.findIndex(d => d.id === deviceInfo.deviceId);

  let isNewDevice = false;
  let newDeviceInfo = null;

  if (existingIdx >= 0) {
    devices[existingIdx] = {
      ...devices[existingIdx],
      lastLogin: now,
      ip: deviceInfo.ip || devices[existingIdx].ip,
      displayName: userDisplayName || devices[existingIdx].displayName,
      username: userUsername || devices[existingIdx].username,
    };
  } else {
    const parsed = parseUserAgent(deviceInfo.userAgent || '');
    const newDevice = {
      id: deviceInfo.deviceId || crypto.randomUUID(),
      userId,
      displayName: userDisplayName,
      username: userUsername,
      name: parsed.name, os: parsed.os, browser: parsed.browser,
      deviceType: parsed.deviceType, ip: deviceInfo.ip || 'Unknown',
      firstLogin: now, lastLogin: now
    };
    if (devices.length >= 10) devices.splice(0, 1);
    devices.push(newDevice);
    isNewDevice = true;
    newDeviceInfo = { ...parsed, ip: newDevice.ip };
  }

  await writeDataFile(`data/devices/${userId}.json`, devices, devicesFile?.sha, `Device recorded: ${userDisplayName || userId}`);

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
    <div style="background:#ffffff;padding:32px 24px;text-align:center;border-bottom:1px solid #e5e7eb">
      <img src="${APP_URL}/logo.png" alt="KoyJabo" style="width:48px;height:48px;border-radius:12px;background:#ffffff;padding:6px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;">
      <h1 style="color:#111827;margin:0;font-size:24px">🔔 New Device Login</h1>
      <p style="color:#4b5563;margin:6px 0 0;font-size:14px">Security Alert — কই যাবো KoyJabo</p>
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

  // Fetch user profile to include displayName and username in avatar record
  const userFile = await readDataFile(`data/users/${userId}.json`).catch(() => null);
  const userDisplayName = userFile?.content?.displayName || '';
  const userUsername = userFile?.content?.username || '';

  const avatarFile = await readDataFile(`data/avatars/${userId}.json`);
  await writeDataFile(
    `data/avatars/${userId}.json`,
    { userId, displayName: userDisplayName, username: userUsername, imageData, updatedAt: Date.now() },
    avatarFile?.sha,
    `Avatar update: ${userDisplayName || userId}`
  );
  return { success: true, hasAvatar: true };
}

// ── Result Writer ─────────────────────────────────────────────────────────────
// Primary: Dhaka-Commute (public repo — Cloudflare Worker reads this FIRST, no private-token needed)
// Fallback: koyjabo-core (Cloudflare Worker has a fallback for this)
async function writeResult(requestId, result) {
  const content = { ...result, completedAt: Date.now() };
  const path = `data/results/${requestId}.json`;

  // Try Dhaka-Commute first (DATA_TOKEN has write access)
  try {
    const existing = await readAppFile(path);
    await writeAppFile(path, content, existing?.sha, `Auth result: ${requestId}`);
    console.log(`Result written to ${APP_REPO}/${path}`);
    return;
  } catch (err) {
    console.warn(`[writeResult] ${APP_REPO} write failed (${err.message}), falling back to ${DATA_REPO}`);
  }

  // Fallback: koyjabo-core (GITHUB_TOKEN always has access here)
  const existing = await readDataFile(path);
  await writeDataFile(path, content, existing?.sha, `Auth result: ${requestId}`);
  console.log(`Result written to ${DATA_REPO}/${path}`);
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
      throw new Error('Account service configuration error. Please contact support.');
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
      case 'verify-otp':
        result = await handleVerifyOtp({ sessionToken: data.sessionToken, otp: data.otp });
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
      case 'save-data':
        result = await handleSaveData({ path: data.path, content: data.content, message: data.message });
        break;
      case 'record-query':
        result = await handleRecordQuery({ 
          query: data.query, 
          response: data.response, 
          intent: data.intent, 
          quality: data.quality, 
          lang: data.lang, 
          userId 
        });
        break;
      default:
        result = { success: false, error: `Unknown action: ${action}` };
    }
  } catch (err) {
    console.error('Handler error:', err.message);
    
    // Mask technical GitHub API errors from the end user
    let userFriendlyError = err.message || 'An internal error occurred. Please try again.';
    if (userFriendlyError.includes('docs.github.com/rest') || userFriendlyError.includes('Not Found') || userFriendlyError.includes('Bad credentials')) {
      userFriendlyError = 'Service configuration error or missing permissions. Please contact support.';
    }
    
    result = { success: false, error: userFriendlyError };
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
