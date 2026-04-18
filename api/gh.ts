import type { VercelRequest, VercelResponse } from '@vercel/node';

// Repo config lives server-side only — never sent to the browser.
const REPOS: Record<string, { owner: string; repo: string }> = {
  d: { owner: process.env.DATA_OWNER ?? '', repo: process.env.DATA_REPO ?? '' },
  a: { owner: process.env.APP_OWNER  ?? '', repo: process.env.APP_REPO  ?? '' },
};

const TOKEN = process.env.GH_TOKEN ?? '';
const WORKFLOW_FILE = 'auth.yml';

function ghHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'koyjabo-server/1.0',
  };
}

// Rate limiting — very simple in-memory (resets on cold start).
// Vercel functions are short-lived per-instance so this is best-effort.
const reqCount = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = reqCount.get(ip);
  if (!entry || now > entry.resetAt) {
    reqCount.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Security headers on every response
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // Only allow requests from our own origin
  const origin = req.headers['origin'] ?? req.headers['referer'] ?? '';
  const allowed = !origin || origin.startsWith('https://koyjabo.com') ||
                  origin.startsWith('https://www.koyjabo.com') ||
                  origin.startsWith('http://localhost');
  if (!allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Rate limit by IP
  const ip = (req.headers['x-forwarded-for'] as string ?? '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (!TOKEN) {
    return res.status(503).json({ error: 'Service unavailable' });
  }

  // ── GET /api/gh?r=d|a&p=<path>  (read a file) ────────────────────────────
  if (req.method === 'GET') {
    const r = (req.query.r as string) ?? '';
    const p = (req.query.p as string) ?? '';
    const repo = REPOS[r];
    if (!repo || !p) return res.status(400).json({ error: 'Bad request' });

    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${p}`;
    const upstream = await fetch(url, { headers: ghHeaders() });

    if (upstream.status === 404) return res.status(404).json(null);
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'Upstream error' });

    const data = await upstream.json() as { content?: string };
    if (!data.content) return res.status(404).json(null);

    // Return only the decoded JSON content — never expose SHA, repo path, etc.
    try {
      const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(decoded);
    } catch {
      return res.status(500).json({ error: 'Parse error' });
    }
  }

  // ── POST /api/gh  (trigger workflow dispatch) ────────────────────────────
  if (req.method === 'POST') {
    const body = req.body as {
      requestId?: string;
      action?: string;
      email?: string;
      passwordHash?: string;
      userId?: string;
      data?: string;
    };

    if (!body?.requestId || !body?.action) {
      return res.status(400).json({ error: 'Bad request' });
    }

    const repo = REPOS['a'];
    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/workflows/${WORKFLOW_FILE}/dispatches`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers: ghHeaders(),
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          requestId: body.requestId,
          action:    body.action,
          email:     body.email     ?? '',
          passwordHash: body.passwordHash ?? '',
          userId:    body.userId    ?? '',
          data:      body.data      ?? '{}',
        },
      }),
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Upstream error' });
    }
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
