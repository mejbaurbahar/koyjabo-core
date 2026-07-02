/**
 * KoyJabo Auth Service
 *
 * All operations go through the Cloudflare Worker proxy:
 *  - login / google-lookup use a POST /gh action where bcrypt runs server-side
 *    and the bcryptHash never reaches the browser
 *  - signup / change-password / forgot-password / reset-password are
 *    dispatched to a GitHub Actions workflow (~30–90 s)
 *
 * The legacy direct-GitHub-API fallback (with a browser-side VITE_GITHUB_TOKEN)
 * has been removed — that path leaked a PAT into the JS bundle.
 */

import type { AuthResult, Device } from '../types/auth';

const PROXY = (import.meta.env.VITE_API_PROXY as string | undefined)
  || 'https://koyjabo-auth-proxy.mejbaur-bahar.workers.dev';

const SESSION_TOKEN_LS_KEY = 'koyjabo_session_token';

export function getSessionToken(): string {
  try { return localStorage.getItem(SESSION_TOKEN_LS_KEY) || ''; } catch { return ''; }
}

export function setSessionToken(token: string): void {
  try {
    if (token) localStorage.setItem(SESSION_TOKEN_LS_KEY, token);
    else       localStorage.removeItem(SESSION_TOKEN_LS_KEY);
  } catch { /* quota */ }
}

export function clearSessionToken(): void { setSessionToken(''); }

function friendlyHttpError(status: number): string {
  if (status === 401) return 'Service authentication failed. Please try again later.';
  if (status === 403) return 'Service temporarily unavailable. Please try again in a few minutes.';
  if (status === 404) return 'Account service connection failed.';
  if (status === 422) return 'Request could not be processed. Please try again.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'Server error. Please try again in a moment.';
  return 'Account service connection failed.';
}

function friendlyNetworkError(err: unknown): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Connection failed. Please check your internet and try again.';
  }
  if (err instanceof Error) return err.message;
  return 'Connection failed. Please check your internet and try again.';
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
  // Resolve via the worker — keeps the lookup inside the Cloudflare boundary
  // and avoids leaking a per-user IP to an unrelated third party.
  try {
    const r = await fetch(`${PROXY}/ip`, { credentials: 'omit', signal: AbortSignal.timeout(3000) });
    if (!r.ok) return 'Unknown';
    const j = await r.json();
    return j.ip || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

// ── Proxy read helpers ───────────────────────────────────────────────────────

const inFlight = new Map<string, Promise<unknown>>();

async function fetchRepo<T = unknown>(repo: 'd' | 'a', path: string): Promise<T | null> {
  const url = `${PROXY}/gh?r=${repo}&p=${encodeURIComponent(path)}`;
  let res: Response;
  let attempt = 0;
  while (true) {
    try {
      res = await fetch(url, { credentials: 'omit' });
    } catch (err) {
      throw new Error(friendlyNetworkError(err));
    }
    if (res.status === 429 && attempt < 3) {
      await new Promise(r => setTimeout(r, 2000 * (2 ** attempt)));
      attempt++;
      continue;
    }
    break;
  }

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(friendlyHttpError(res.status));
  return res.json() as Promise<T>;
}

async function fetchDataFile<T = unknown>(path: string): Promise<T | null> {
  const cacheKey = `d:${path}`;
  if (inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey) as Promise<T | null>;
  }
  const promise = fetchRepo<T>('d', path).finally(() => inFlight.delete(cacheKey));
  inFlight.set(cacheKey, promise);
  return promise;
}

function fetchAppFile<T = unknown>(path: string): Promise<T | null> {
  return fetchRepo<T>('a', path);
}

// ── Workflow trigger via GitHub Actions dispatch (through worker) ────────────
async function triggerWorkflow(
  requestId: string,
  action: string,
  inputs: Record<string, string>
): Promise<void> {
  const body: Record<string, string> = {
    requestId,
    action,
    email:        inputs.email        || '',
    passwordHash: inputs.passwordHash || '',
    userId:       inputs.userId       || '',
    data:         inputs.data         || '{}',
  };
  if (inputs.cfToken) body.cfToken = inputs.cfToken;
  const sessionToken = getSessionToken();
  if (sessionToken) body.sessionToken = sessionToken;
  let res: Response;
  try {
    res = await fetch(`${PROXY}/gh`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(friendlyNetworkError(err));
  }
  if (!res.ok) throw new Error(friendlyHttpError(res.status));
}

async function pollForResult(requestId: string, timeoutMs = 180_000): Promise<AuthResult> {
  const path = `data/results/${requestId}.json`;
  const deadline = Date.now() + timeoutMs;
  // Wait 20s before first poll — GitHub Actions can't finish faster than that
  await new Promise(r => setTimeout(r, 20_000));

  while (Date.now() < deadline) {
    const result = await fetchAppFile<AuthResult & { sessionToken?: string }>(path).catch(() => null);
    if (result) {
      // Worker mints a session token on successful result reads. Persist it so
      // subsequent user-bound writes (history, devices, avatar) authenticate.
      if (result.sessionToken) setSessionToken(result.sessionToken);
      return result;
    }
    // Poll every 8s — reduces GitHub API usage by ~60% vs 3s interval
    await new Promise(r => setTimeout(r, 8_000));
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
 * LOGIN — sends email-hash + password-SHA to the worker, which performs the
 * bcrypt comparison server-side. The bcryptHash never reaches the browser.
 */
export async function loginUser(
  email: string,
  password: string,
  cfToken = '',
): Promise<{ userId: string; username: string; displayName: string; email: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const emailHash  = await sha256(normalizedEmail);
  const passwordSha = await sha256(password);

  let res: Response;
  try {
    res = await fetch(`${PROXY}/gh`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        action: 'auth-login',
        emailHash,
        passwordSha,
        cfToken,
      }),
    });
  } catch (err) {
    throw new Error(friendlyNetworkError(err));
  }
  if (res.status === 401 || res.status === 400) {
    throw new Error('Invalid email or password.');
  }
  if (!res.ok) throw new Error(friendlyHttpError(res.status));
  const data = await res.json() as {
    success?: boolean; userId?: string; username?: string; displayName?: string;
    sessionToken?: string;
  };
  if (!data.success || !data.userId) throw new Error('Invalid email or password.');
  if (data.sessionToken) setSessionToken(data.sessionToken);
  return {
    userId:      data.userId,
    username:    data.username || '',
    displayName: data.displayName || '',
    email:       normalizedEmail,
  };
}

/**
 * SIGNUP — triggers GitHub Actions workflow. Takes 30–90 seconds.
 */
export async function signupUser(
  email: string,
  password: string,
  username: string,
  displayName: string,
  cfToken = ''
): Promise<AuthResult> {
  const passwordHash = await sha256(password);
  // triggerAndWait → pollForResult persists the session token returned by the
  // worker as soon as the workflow result file is readable, so no follow-up
  // login is needed.
  return triggerAndWait('signup', {
    email: email.toLowerCase().trim(),
    passwordHash,
    data: JSON.stringify({ username, displayName }),
    cfToken,
  });
}

/**
 * FORGOT PASSWORD — triggers workflow, sends OTP to email.
 * Returns sessionToken which is needed for verifyOtp + resetPassword.
 */
export async function forgotPassword(email: string): Promise<AuthResult> {
  return triggerAndWait('forgot-password', { email: email.toLowerCase().trim() });
}

/**
 * CHECK RESET STATUS — asks the worker whether a password reset link has been
 * used. The worker reads `data/password_resets/<tokenHash>.json` server-side
 * and returns only the three flags below — the raw blob never leaves Cloudflare.
 */
export async function checkResetStatus(sessionToken: string): Promise<{ used: boolean; expired: boolean; notFound: boolean }> {
  const tokenHash = await sha256(sessionToken);
  try {
    const resp = await fetch(`${PROXY}/gh`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        action: 'auth-reset-status',
        tokenHash,
      }),
    });
    if (!resp.ok) return { used: false, expired: false, notFound: false };
    const data = await resp.json();
    return {
      used:     data?.used === true,
      expired:  data?.expired === true,
      notFound: data?.notFound === true,
    };
  } catch {
    return { used: false, expired: false, notFound: false };
  }
}

/**
 * RESET PASSWORD — resets password using the reset link token.
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
 * DELETE ACCOUNT — removes user profile/index/history/device/avatar data.
 */
export async function deleteAccount(userId: string): Promise<AuthResult> {
  return triggerAndWait('delete-account', {
    userId,
    data: JSON.stringify({})
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
      deviceInfo: { deviceId, userAgent: navigator.userAgent, ip }
    })
  }).catch(() => { /* non-critical */ });
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
    busSearches:       history.busSearches.slice(-50),
    routeSearches:     history.routeSearches.slice(-50),
    intercitySearches: history.intercitySearches.slice(-50),
    trainSearches:     (history.trainSearches || []).slice(-50),
    mostUsedBuses:     history.mostUsedBuses,
    mostUsedRoutes:    history.mostUsedRoutes,
    mostUsedIntercity: history.mostUsedIntercity,
    mostUsedTrains:    history.mostUsedTrains || {},
  };
  triggerAndWait('save-history', {
    userId,
    data: JSON.stringify(trimmed)
  }).catch(() => { /* non-critical */ });
}

// ── Auth error → i18n key mapping ────────────────────────────────────────────
const AUTH_ERROR_KEY_MAP: Record<string, string> = {
  'Invalid email or password.':                                        'auth.validation.invalidCredentials',
  'Account not found. Please contact support.':                        'auth.validation.accountNotFound',
  'This email is already registered. Please log in.':                  'auth.validation.emailAlreadyRegistered',
  'Connection failed. Please check your internet and try again.':      'auth.validation.connectionFailed',
  'Request is taking too long. Please check your connection and try again.': 'auth.validation.requestTimedOut',
  'Current password is incorrect.':                                    'auth.validation.currentPasswordIncorrect',
  'User not found.':                                                   'auth.validation.userNotFound',
  'Account service connection failed.':                                'auth.validation.connectionFailed',
  'Request could not be processed. Please try again.':                 'auth.validation.somethingWentWrong',
  'Too many requests. Please wait a moment and try again.':            'auth.validation.requestTimedOut',
  'Server error. Please try again in a moment.':                       'auth.validation.somethingWentWrong',
  'An unexpected error occurred. Please try again.':                   'auth.validation.somethingWentWrong',
  'Service not found. Please try again later.':                        'auth.validation.connectionFailed',
  'Failed to read data. Please check your connection and try again.':  'auth.validation.connectionFailed',
  'Google sign-in was cancelled.':                                     'auth.validation.googleCancelled',
  'Popup was blocked. Please allow popups for this site and try again.': 'auth.validation.googlePopupBlocked',
  'Google sign-in is not configured. Please contact support.':         'auth.validation.googleLoginFailed',
};

const AUTH_ERROR_PATTERNS: Array<[RegExp, string]> = [
  [/username.*already taken/i,  'auth.validation.usernameTaken'],
  [/email.*already registered/i,'auth.validation.emailAlreadyRegistered'],
  [/taking too long/i,          'auth.validation.requestTimedOut'],
  [/connection failed/i,        'auth.validation.connectionFailed'],
  [/account service/i,          'auth.validation.connectionFailed'],
  [/service unavailable/i,      'auth.validation.connectionFailed'],
  [/unexpected error/i,         'auth.validation.somethingWentWrong'],
  [/server error/i,             'auth.validation.somethingWentWrong'],
  [/too many requests/i,        'auth.validation.requestTimedOut'],
];

export function getAuthErrorKey(message: string): string | null {
  if (AUTH_ERROR_KEY_MAP[message]) return AUTH_ERROR_KEY_MAP[message];
  for (const [pattern, key] of AUTH_ERROR_PATTERNS) {
    if (pattern.test(message)) return key;
  }
  return null;
}

/**
 * GOOGLE LOGIN / SIGNUP — fires Firebase OAuth popup, then asks the worker
 * whether the email is already registered. The worker performs the index +
 * user-record lookup server-side and only returns public fields + a session
 * token. The user index and bcryptHash never reach the browser.
 *
 * @param cfToken — Turnstile token; required by the worker's auth-google-lookup
 *                   action. UI should issue one before calling this.
 */
export async function loginWithGoogle(cfToken = ''): Promise<{
  userId: string;
  username: string;
  displayName: string;
  email: string;
  provider: 'google';
  hasPassword: boolean;
  googlePhotoUrl?: string;
}> {
  const { signInWithPopup } = await import('firebase/auth');
  const { auth, googleProvider, isFirebaseConfigured } = await import('./firebaseConfig');

  if (!isFirebaseConfigured) {
    throw new Error('Google sign-in is not configured. Please contact support.');
  }

  let result;
  try {
    result = await signInWithPopup(auth, googleProvider);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      throw new Error('Google sign-in was cancelled.');
    }
    if (code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site and try again.');
    }
    if (code === 'auth/network-request-failed') {
      throw new Error('Connection failed. Please check your internet and try again.');
    }
    if (code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    throw err;
  }

  const firebaseUser = result.user;
  if (!firebaseUser.email) throw new Error('Google account has no email address.');

  const normalizedEmail = firebaseUser.email.toLowerCase().trim();
  const emailHash       = await sha256(normalizedEmail);
  const googlePhotoUrl  = firebaseUser.photoURL ?? undefined;

  // Fast path: existing user. Worker does the lookup so the user index +
  // bcryptHash never reach the browser.
  let lookupRes: Response;
  try {
    lookupRes = await fetch(`${PROXY}/gh`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        action: 'auth-google-lookup',
        emailHash,
        cfToken,
      }),
    });
  } catch (err) {
    throw new Error(friendlyNetworkError(err));
  }
  if (!lookupRes.ok && lookupRes.status !== 403) {
    throw new Error(friendlyHttpError(lookupRes.status));
  }
  const lookup = lookupRes.ok ? await lookupRes.json() as {
    exists?: boolean; userId?: string; username?: string; displayName?: string;
    hasPassword?: boolean; sessionToken?: string;
  } : { exists: false };
  if (lookup?.exists && lookup.userId) {
    if (lookup.sessionToken) setSessionToken(lookup.sessionToken);
    return {
      userId:      lookup.userId,
      username:    lookup.username || '',
      displayName: lookup.displayName || '',
      email:       normalizedEmail,
      provider:    'google',
      hasPassword: !!lookup.hasPassword,
      googlePhotoUrl,
    };
  }

  // New user: trigger signup workflow (30-90 s)
  const signupResult = await triggerAndWait('google-signup', {
    email: normalizedEmail,
    data: JSON.stringify({
      displayName:    firebaseUser.displayName || 'Google User',
      googlePhotoUrl: googlePhotoUrl || '',
    }),
  });

  if (!signupResult.success) throw new Error(signupResult.error || 'Google signup failed.');

  return {
    userId:      signupResult.userId!,
    username:    signupResult.username!,
    displayName: signupResult.displayName!,
    email:       normalizedEmail,
    provider:    'google',
    hasPassword: false,
    googlePhotoUrl,
  };
}

/**
 * SET PASSWORD (Google users) — lets a Google-only user add a password.
 * Triggers a workflow that bcrypt-hashes and saves it.
 */
export async function setGoogleUserPassword(userId: string, newPassword: string): Promise<AuthResult> {
  const passwordHash = await sha256(newPassword);
  return triggerAndWait('set-google-password', { userId, passwordHash });
}

// ── Image resize helper ───────────────────────────────────────────────────────
export function resizeAndEncodeImage(file: File, maxDimension: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        canvas.width  = Math.round(img.width  * scale);
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
