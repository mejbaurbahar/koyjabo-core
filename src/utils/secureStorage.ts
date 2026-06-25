// Obfuscated localStorage — prevents casual DevTools inspection of auth data
// NOT cryptographically secure; for true security use httpOnly cookies on backend

const KEY_PREFIX = '__kj_';
const SALT = 'k9j3x2p1m8';

function obfuscate(data: string): string {
  const b = btoa(encodeURIComponent(data));
  return b.split('').map((c, i) => {
    const k = SALT.charCodeAt(i % SALT.length);
    return String.fromCharCode(c.charCodeAt(0) ^ (k % 31));
  }).join('');
}

function deobfuscate(data: string): string {
  try {
    const raw = data.split('').map((c, i) => {
      const k = SALT.charCodeAt(i % SALT.length);
      return String.fromCharCode(c.charCodeAt(0) ^ (k % 31));
    }).join('');
    return decodeURIComponent(atob(raw));
  } catch {
    return '';
  }
}

export const secureStorage = {
  setItem(key: string, value: string): void {
    try { localStorage.setItem(KEY_PREFIX + key, obfuscate(value)); } catch {}
  },
  getItem(key: string): string | null {
    try {
      const raw = localStorage.getItem(KEY_PREFIX + key);
      if (!raw) return null;
      const dec = deobfuscate(raw);
      return dec || null;
    } catch { return null; }
  },
  removeItem(key: string): void {
    try { localStorage.removeItem(KEY_PREFIX + key); } catch {}
  },
};
