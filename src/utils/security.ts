// Frontend security utilities — sanitization, rate limiting, validation
//
// Note: real defenses live in the Cloudflare Worker (origin check, Turnstile,
// rate-limit, path whitelist, session-token verification). Everything here is
// belt-and-suspenders — input shaping that runs in the browser before a
// request goes out. Anything that depended on the user not opening DevTools
// (killConsoleInProd / installAntiDevtools) has been removed — it was easily
// bypassed and hurt legitimate users (right-click, copy, debug).

// Retained for binary backwards-compatibility with callers — no-op now.
export function killConsoleInProd(): void { /* removed: see file header */ }

// ── Input sanitizer — strips HTML tags and dangerous chars ───────────────────
const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;',
};

export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[&<>"'/]/g, ch => HTML_ESCAPE[ch] || ch)
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .slice(0, 10000);
}

export function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

// ── URL validator — prevent open redirect / LFI / RFI ───────────────────────
const ALLOWED_ORIGINS = ['koyjabo.com', 'www.koyjabo.com', 'dev.koyjabo.com', 'localhost'];

export function isSafeInternalUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  // Allow relative paths
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    const parsed = new URL(url, window.location.origin);
    return ALLOWED_ORIGINS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function sanitizeRedirect(url: string, fallback = '/'): string {
  return isSafeInternalUrl(url) ? url : fallback;
}

// ── Email validator ───────────────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(email.trim());
}

// ── Password strength ────────────────────────────────────────────────────────
export function isStrongPassword(pw: string): boolean {
  if (!pw || pw.length < 8) return false;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  return hasUpper && hasLower && hasDigit;
}

// ── In-memory rate limiter ───────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  if (entry.count >= maxAttempts) return false; // blocked
  entry.count++;
  return true; // allowed
}

export function getRateLimitRemainingMs(key: string): number {
  const entry = rateLimitMap.get(key);
  if (!entry) return 0;
  return Math.max(0, entry.resetAt - Date.now());
}

// Retained for callers — no-op. The previous implementation blocked F12 /
// Ctrl+Shift+I / right-click and ran a `debugger` busy-loop. It did not stop
// anyone determined (browser flags, devtools-protocol, view-source via curl)
// and broke legitimate copy + accessibility for everyone else.
export function installAntiDevtools(): void { /* removed */ }

// ── Sanitize form field (XSS only — there is no SQL backend) ────────────────
export function sanitizeFormField(value: string, type: 'text' | 'email' | 'search' = 'text'): string {
  if (!value || typeof value !== 'string') return '';
  let clean = value.trim().slice(0, 1000);
  // Strip the two angle brackets used to start an HTML tag — input never needs them.
  clean = clean.replace(/[<>]/g, '');
  if (type === 'email') clean = clean.replace(/[^a-zA-Z0-9.@_+-]/g, '');
  // The previous SQL-pattern strip mangled real search queries ("select bus to
  // Sylhet" → "  bus to Sylhet"). The data layer is GitHub JSON, not SQL — no
  // SQL injection surface exists, so the strip was both unnecessary and harmful.
  return clean;
}
