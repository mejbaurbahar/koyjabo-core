import type { VercelRequest, VercelResponse } from '@vercel/node';

const reqCount = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = reqCount.get(ip);
  if (!entry || now > entry.resetAt) {
    reqCount.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 30; // 30 checks/min per IP is plenty
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const origin = req.headers['origin'] ?? req.headers['referer'] ?? '';
  const allowed = !origin || origin.startsWith('https://koyjabo.com') ||
                  origin.startsWith('https://www.koyjabo.com') ||
                  origin.startsWith('http://localhost');
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });

  const ip = (req.headers['x-forwarded-for'] as string ?? '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests' });

  const domain = (req.query.domain as string ?? '').toLowerCase().trim();
  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return res.status(400).json({ disposable: false });
  }

  try {
    const upstream = await fetch(
      `https://open.kickbox.com/v1/disposable/${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!upstream.ok) return res.status(200).json({ disposable: false });
    const data = await upstream.json() as { disposable?: boolean };
    return res.status(200).json({ disposable: data.disposable === true });
  } catch {
    return res.status(200).json({ disposable: false }); // fail open
  }
}
