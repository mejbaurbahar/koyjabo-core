// Frontend security utilities — sanitization, rate limiting, validation

// ── Console killer (production only) ────────────────────────────────────────
export function killConsoleInProd(): void {
  if (import.meta.env.PROD) {
    const noop = () => {};
    (window as any).console = {
      log: noop, warn: noop, info: noop, debug: noop, trace: noop,
      error: noop, group: noop, groupEnd: noop, table: noop, dir: noop,
    };
  }
}

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

// ── Anti-devtools ─────────────────────────────────────────────────────────────
export function installAntiDevtools(): void {
  if (!import.meta.env.PROD) return;

  // Disable right-click
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (view source)
  document.addEventListener('keydown', e => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key)) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // Clear console if devtools detected
  const threshold = 160;
  setInterval(() => {
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    if (performance.now() - start > threshold) {
      // DevTools open — clear any exposed data
      try { (window as any).console.clear?.(); } catch {}
    }
  }, 3000);
}

// ── Sanitize form field (SQL injection + XSS) ────────────────────────────────
const SQL_PATTERNS = /('|--|;|\/\*|\*\/|xp_|exec|select|insert|update|delete|drop|union|cast|convert|char|nchar|varchar)/gi;

export function sanitizeFormField(value: string, type: 'text' | 'email' | 'search' = 'text'): string {
  if (!value || typeof value !== 'string') return '';
  let clean = value.trim().slice(0, 1000);
  clean = clean.replace(/[<>]/g, '');
  if (type === 'email') clean = clean.replace(/[^a-zA-Z0-9.@_+-]/g, '');
  if (type === 'search') clean = clean.replace(SQL_PATTERNS, '');
  return clean;
}
