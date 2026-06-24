const PROXY = import.meta.env.VITE_API_PROXY as string | undefined;

const CACHE_PREFIX = 'kj_private_data_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  value: T;
  expires: number;
}

function readCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry || typeof entry.expires !== 'number' || entry.expires < Date.now()) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = { value, expires: Date.now() + CACHE_TTL };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // ignore storage quota issues
  }
}

async function fetchRepoJson<T>(repoPath: string): Promise<T | null> {
  if (!PROXY) return null;
  try {
    const url = `${PROXY}/gh?r=d&p=${encodeURIComponent(repoPath)}`;
    const res = await fetch(url, { credentials: 'omit' });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function loadPrivateData<T>(repoPath: string, cacheKey: string): Promise<T | null> {
  const cached = readCache<T>(cacheKey);
  if (cached) return cached;

  const remote = await fetchRepoJson<T>(repoPath);
  if (!remote) return null;

  writeCache(cacheKey, remote);
  return remote;
}
