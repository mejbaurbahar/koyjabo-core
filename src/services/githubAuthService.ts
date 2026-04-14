/**
 * KoyJabo GitHub Auth Service
 *
 * Architecture:
 *  - READ  operations (login check, profile fetch, device list) → direct GitHub API calls (fast, ~1s)
 *  - WRITE operations (signup, password change, etc.) → trigger GitHub Actions workflow, poll for result (~30-90s)
 *
 * The VITE_GITHUB_TOKEN env var has minimal scopes: actions:write + contents:read
 * on this specific private repo. Even if leaked, attackers cannot write data directly.
 */

import bcrypt from 'bcryptjs';
import type { AuthResult, Device } from '../types/auth';

// ── Environment config ────────────────────────────────────────────────────────
// App repo (public) — workflow dispatch + polling results
const APP_OWNER = import.meta.env.VITE_GITHUB_OWNER as string | undefined;
const APP_REPO  = import.meta.env.VITE_GITHUB_REPO  as string | undefined;
const TOKEN     = import.meta.env.VITE_GITHUB_TOKEN  as string | undefined;

// Data repo (private) — all user data lives here, unreadable by the public
const DATA_OWNER = 'mejbaurbahar';
const DATA_REPO  = 'koyjabo';

const WORKFLOW_FILE = 'auth.yml';

function getAppBase(): string {
  if (!APP_OWNER || !APP_REPO) throw new AuthConfigError();
  return `https://api.github.com/repos/${APP_OWNER}/${APP_REPO}`;
}

function getDataBase(): string {
  return `https://api.github.com/repos/${DATA_OWNER}/${DATA_REPO}`;
}

function getHeaders(): Record<string, string> {
  if (!TOKEN) throw new AuthConfigError();
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };
}

// ── Friendly error class ──────────────────────────────────────────────────────
class AuthConfigError extends Error {
  constructor() {
    super('Auth service is not configured. Please contact support.');
    this.name = 'AuthConfigError';
  }
}

function friendlyHttpError(status: number, context: 'workflow' | 'read' = 'workflow'): string {
  if (status === 401 || status === 403) {
    return context === 'workflow'
      ? 'অ্যাকাউন্ট সার্ভিস সংযোগ ব্যর্থ হয়েছে। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।'
      : 'তথ্য পড়তে সমস্যা হয়েছে। সংযোগ পরীক্ষা করুন।';
  }
  if (status === 404) {
    return 'সার্ভিস পাওয়া যাচ্ছে না। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।';
  }
  if (status === 422) {
    return 'অনুরোধটি প্রক্রিয়া করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।';
  }
  if (status >= 500) {
    return 'সার্ভারে সমস্যা হচ্ছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।';
  }
  return 'একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
}

// ── SHA-256 helper (Web Crypto — no extra package needed) ─────────────────────
export async function sha256(message: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Device fingerprint helpers ────────────────────────────────────────────────
export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem('koyjabo_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('koyjabo_device_id', id);
  }
  return id;
}

async function getClientIP(): Promise<string> {
  try {
    const r = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    const j = await r.json();
    return j.ip || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

// ── GitHub API read helpers ───────────────────────────────────────────────────

// Read user data from private koyjabo repo
async function fetchDataFile<T = unknown>(path: string): Promise<T | null> {
  const res = await fetch(`${getDataBase()}/contents/${path}`, { headers: getHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(friendlyHttpError(res.status, 'read'));
  const data = await res.json();
  return JSON.parse(atob(data.content)) as T;
}

// Read result files from public Dhaka-Commute repo
async function fetchAppFile<T = unknown>(path: string): Promise<T | null> {
  const res = await fetch(`${getAppBase()}/contents/${path}`, { headers: getHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(friendlyHttpError(res.status, 'read'));
  const data = await res.json();
  return JSON.parse(atob(data.content)) as T;
}

// ── GitHub Actions trigger & poll ─────────────────────────────────────────────
async function triggerWorkflow(
  requestId: string,
  action: string,
  inputs: Record<string, string>
): Promise<void> {
  const body = {
    ref: 'main',
    inputs: {
      requestId,
      action,
      email: inputs.email || '',
      passwordHash: inputs.passwordHash || '',
      userId: inputs.userId || '',
      data: inputs.data || '{}'
    }
  };

  const res = await fetch(`${getAppBase()}/actions/workflows/${WORKFLOW_FILE}/dispatches`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(friendlyHttpError(res.status, 'workflow'));
  }
}

async function pollForResult(requestId: string, timeoutMs = 120_000): Promise<AuthResult> {
  const path = `data/results/${requestId}.json`;
  const deadline = Date.now() + timeoutMs;
  const INTERVAL = 4000;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, INTERVAL));
    const result = await fetchAppFile<AuthResult>(path).catch(() => null);
    if (result) return result;
  }

  throw new Error('অনুরোধটি সম্পন্ন হতে বেশি সময় লাগছে। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।');
}

async function triggerAndWait(
  action: string,
  inputs: Record<string, string>
): Promise<AuthResult> {
  const requestId = crypto.randomUUID();
  await triggerWorkflow(requestId, action, inputs);
  return pollForResult(requestId);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * LOGIN — fast path: read user data directly, verify bcrypt in browser.
 * No GitHub Actions needed. Returns in ~1-2 seconds.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ userId: string; username: string; displayName: string; email: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const emailHashKey = await sha256(normalizedEmail);

  // 1. Find userId from email hash index (reads from private koyjabo repo)
  const index = await fetchDataFile<Record<string, string>>('data/users/index.json');
  if (!index || !index[emailHashKey]) {
    throw new Error('ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
  }

  const userId = index[emailHashKey];

  // 2. Fetch user profile
  interface UserProfile { bcryptHash: string; username: string; displayName: string; }
  const user = await fetchDataFile<UserProfile>(`data/users/${userId}.json`);
  if (!user) throw new Error('অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। সাপোর্টে যোগাযোগ করুন।');

  // 3. Verify: SHA-256(password) vs stored bcrypt hash
  const passwordSha = await sha256(password);
  const valid = await bcrypt.compare(passwordSha, user.bcryptHash);
  if (!valid) throw new Error('ইমেইল বা পাসওয়ার্ড সঠিক নয়।');

  return { userId, username: user.username, displayName: user.displayName, email: normalizedEmail };
}

/**
 * SIGNUP — triggers GitHub Actions workflow. Takes 30–90 seconds.
 */
export async function signupUser(
  email: string,
  password: string,
  username: string,
  displayName: string
): Promise<AuthResult> {
  const passwordHash = await sha256(password);
  return triggerAndWait('signup', {
    email: email.toLowerCase().trim(),
    passwordHash,
    data: JSON.stringify({ username, displayName })
  });
}

/**
 * FORGOT PASSWORD — triggers workflow. User gets reset link via email or in result.
 */
export async function forgotPassword(email: string): Promise<AuthResult> {
  return triggerAndWait('forgot-password', { email: email.toLowerCase().trim() });
}

/**
 * RESET PASSWORD — triggers workflow with the reset token from email/UI.
 */
export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  const passwordHash = await sha256(newPassword);
  return triggerAndWait('reset-password', {
    passwordHash,
    data: JSON.stringify({ token })
  });
}

/**
 * UPDATE PROFILE — display name and/or username.
 */
export async function updateProfile(
  userId: string,
  displayName: string,
  username: string
): Promise<AuthResult> {
  return triggerAndWait('update-profile', {
    userId,
    data: JSON.stringify({ displayName, username })
  });
}

/**
 * CHANGE PASSWORD — verifies old password locally first, then triggers workflow.
 */
export async function changePassword(
  userId: string,
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<AuthResult> {
  // Verify current password before hitting the Action (saves time on failure)
  await loginUser(email, currentPassword);

  const oldPasswordHash = await sha256(currentPassword);
  const newPasswordHash = await sha256(newPassword);
  return triggerAndWait('change-password', {
    userId,
    passwordHash: newPasswordHash,
    data: JSON.stringify({ oldPasswordHash })
  });
}

/**
 * RECORD DEVICE LOGIN — fire-and-forget background action.
 */
export async function recordDeviceLogin(userId: string): Promise<void> {
  const deviceId = getOrCreateDeviceId();
  const ip = await getClientIP();

  triggerAndWait('record-device', {
    userId,
    data: JSON.stringify({
      deviceInfo: {
        deviceId,
        userAgent: navigator.userAgent,
        ip
      }
    })
  }).catch(() => { /* non-critical, ignore silently */ });
}

/**
 * FETCH DEVICES — direct GitHub API read.
 */
export async function fetchDevices(userId: string): Promise<Device[]> {
  const currentDeviceId = getOrCreateDeviceId();
  const devices = await fetchDataFile<Omit<Device, 'isCurrent'>[]>(`data/devices/${userId}.json`);
  if (!devices || !Array.isArray(devices)) return [];
  return devices.map(d => ({ ...d, isCurrent: d.id === currentDeviceId }));
}

/**
 * LOGOUT DEVICE — triggers workflow to remove a specific device.
 */
export async function logoutDevice(userId: string, deviceId: string): Promise<AuthResult> {
  return triggerAndWait('logout-device', {
    userId,
    data: JSON.stringify({ deviceId })
  });
}

/**
 * UPLOAD AVATAR — resizes image in browser, then triggers workflow.
 * Max upload: ~150 KB image.
 */
export async function uploadAvatar(userId: string, file: File): Promise<AuthResult> {
  const imageData = await resizeAndEncodeImage(file, 200);
  return triggerAndWait('upload-avatar', {
    userId,
    data: JSON.stringify({ imageData })
  });
}

/**
 * FETCH AVATAR — direct GitHub API read.
 */
export async function fetchAvatar(userId: string): Promise<string | null> {
  interface AvatarFile { imageData: string }
  const avatar = await fetchDataFile<AvatarFile>(`data/avatars/${userId}.json`).catch(() => null);
  return avatar?.imageData ?? null;
}

// ── Image resize helper ───────────────────────────────────────────────────────
function resizeAndEncodeImage(file: File, maxDimension: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
