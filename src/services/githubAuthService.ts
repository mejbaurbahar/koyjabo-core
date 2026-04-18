/**
 * KoyJabo Auth Service
 *
 * Architecture:
 *  - READ  operations → /api/gh proxy (server-side token, hides repo names)
 *  - WRITE operations → /api/gh POST triggers GitHub Actions workflow, poll for result (~30-90s)
 */

import bcrypt from 'bcryptjs';
import type { AuthResult, Device } from '../types/auth';

// All GitHub calls go through our server-side proxy.
// Token and repo names never reach the browser.
const PROXY = '/api/gh';

function friendlyHttpError(status: number, context: 'workflow' | 'read' = 'workflow'): string {
  if (status === 401 || status === 403) {
    if (context === 'workflow') return 'Account service connection failed. Please try again later.';
    return 'Failed to read data. Please check your connection and try again.';
  }
  if (status === 404) return 'Service not found. Please try again later.';
  if (status === 422) return 'Request could not be processed. Please try again.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'Server error. Please try again in a moment.';
  return 'An unexpected error occurred. Please try again.';
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

function friendlyNetworkError(err: unknown): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Connection failed. Please check your internet and try again.';
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred. Please try again.';
}

// Read from data repo (r=d) or app repo (r=a) via server-side proxy.
async function fetchFile<T = unknown>(repo: 'd' | 'a', path: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${PROXY}?r=${repo}&p=${encodeURIComponent(path)}`, {
      credentials: 'same-origin',
    });
  } catch (err) {
    throw new Error(friendlyNetworkError(err));
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(friendlyHttpError(res.status, 'read'));
  return res.json() as Promise<T>;
}

function fetchDataFile<T = unknown>(path: string): Promise<T | null> {
  return fetchFile<T>('d', path);
}

function fetchAppFile<T = unknown>(path: string): Promise<T | null> {
  return fetchFile<T>('a', path);
}

// ── Workflow trigger via proxy ────────────────────────────────────────────────
async function triggerWorkflow(
  requestId: string,
  action: string,
  inputs: Record<string, string>
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(PROXY, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        action,
        email:        inputs.email        || '',
        passwordHash: inputs.passwordHash || '',
        userId:       inputs.userId       || '',
        data:         inputs.data         || '{}',
      }),
    });
  } catch (err) {
    throw new Error(friendlyNetworkError(err));
  }

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

  throw new Error('Request is taking too long. Please check your connection and try again.');
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
    throw new Error('Invalid email or password.');
  }

  const userId = index[emailHashKey];

  // 2. Fetch user profile
  interface UserProfile { bcryptHash: string; username: string; displayName: string; }
  const user = await fetchDataFile<UserProfile>(`data/users/${userId}.json`);
  if (!user) throw new Error('Account not found. Please contact support.');

  // 3. Verify: SHA-256(password) vs stored bcrypt hash
  const passwordSha = await sha256(password);
  const valid = await bcrypt.compare(passwordSha, user.bcryptHash);
  if (!valid) throw new Error('Invalid email or password.');

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
    data: JSON.stringify({ oldPasswordHash, userAgent: navigator.userAgent })
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

/**
 * FETCH USER HISTORY — direct GitHub API read from private koyjabo repo.
 */
export interface StoredHistory {
  busSearches?: unknown[];
  routeSearches?: unknown[];
  intercitySearches?: unknown[];
  trainSearches?: unknown[];
  mostUsedBuses?: Record<string, number>;
  mostUsedRoutes?: Record<string, number>;
  mostUsedIntercity?: Record<string, number>;
  mostUsedTrains?: Record<string, number>;
}

export async function fetchUserHistoryFromGitHub(userId: string): Promise<StoredHistory | null> {
  return fetchDataFile<StoredHistory>(`data/history/${userId}.json`).catch(() => null);
}

/**
 * SYNC HISTORY TO GITHUB — fire-and-forget via GitHub Actions.
 * Trims to last 50 entries per category to stay within input size limits.
 */
export function syncHistoryToGitHub(userId: string, history: {
  busSearches: unknown[];
  routeSearches: unknown[];
  intercitySearches: unknown[];
  trainSearches?: unknown[];
  mostUsedBuses: Record<string, number>;
  mostUsedRoutes: Record<string, number>;
  mostUsedIntercity: Record<string, number>;
  mostUsedTrains?: Record<string, number>;
}): void {
  const trimmed = {
    busSearches: history.busSearches.slice(-50),
    routeSearches: history.routeSearches.slice(-50),
    intercitySearches: history.intercitySearches.slice(-50),
    trainSearches: (history.trainSearches || []).slice(-50),
    mostUsedBuses: history.mostUsedBuses,
    mostUsedRoutes: history.mostUsedRoutes,
    mostUsedIntercity: history.mostUsedIntercity,
    mostUsedTrains: history.mostUsedTrains || {},
  };
  triggerAndWait('save-history', {
    userId,
    data: JSON.stringify(trimmed)
  }).catch(() => { /* non-critical, ignore silently */ });
}

// ── Auth error → i18n key mapping ────────────────────────────────────────────
// Maps known backend/network error messages to translation keys so auth pages
// can display errors in the user's chosen language.
const AUTH_ERROR_KEY_MAP: Record<string, string> = {
  'Invalid email or password.':                                       'auth.validation.invalidCredentials',
  'Account not found. Please contact support.':                       'auth.validation.accountNotFound',
  'This email is already registered. Please log in.':                 'auth.validation.emailAlreadyRegistered',
  'Connection failed. Please check your internet and try again.':     'auth.validation.connectionFailed',
  'Request is taking too long. Please check your connection and try again.': 'auth.validation.requestTimedOut',
  'Current password is incorrect.':                                   'auth.validation.currentPasswordIncorrect',
  'User not found.':                                                  'auth.validation.userNotFound',
};

// Partial-match patterns for dynamic messages (e.g. username taken includes the username)
const AUTH_ERROR_PATTERNS: Array<[RegExp, string]> = [
  [/username.*already taken/i,   'auth.validation.usernameTaken'],
  [/email.*already registered/i, 'auth.validation.emailAlreadyRegistered'],
  [/taking too long/i,           'auth.validation.requestTimedOut'],
  [/connection failed/i,         'auth.validation.connectionFailed'],
];

/**
 * Returns the i18n translation key for a known auth error message, or null if unknown.
 * Usage: const key = getAuthErrorKey(err.message); setError(key ? t(key) : err.message);
 */
export function getAuthErrorKey(message: string): string | null {
  if (AUTH_ERROR_KEY_MAP[message]) return AUTH_ERROR_KEY_MAP[message];
  for (const [pattern, key] of AUTH_ERROR_PATTERNS) {
    if (pattern.test(message)) return key;
  }
  return null;
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
