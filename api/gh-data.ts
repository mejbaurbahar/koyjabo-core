import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATA_OWNER = process.env.DATA_OWNER ?? '';
const DATA_REPO = process.env.DATA_REPO ?? '';
const TOKEN = process.env.GH_TOKEN ?? '';

function ghHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'koyjabo-server/1.0',
  };
}

const reqCount = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = reqCount.get(ip);
  if (!entry || now > entry.resetAt) {
    reqCount.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 10; // stricter: 10 writes/min
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  const origin = req.headers['origin'] ?? req.headers['referer'] ?? '';
  const allowed = !origin || origin.startsWith('https://koyjabo.com') ||
    origin.startsWith('https://www.koyjabo.com') ||
    origin.startsWith('http://localhost');
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });

  const ip = (req.headers['x-forwarded-for'] as string ?? '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests' });

  if (!TOKEN || !DATA_OWNER || !DATA_REPO) {
    return res.status(503).json({ error: 'Service unavailable' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.headers['content-type']?.includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }

  const body = req.body as { path?: string; content?: unknown };
  if (!body?.path || body?.content === undefined) {
    return res.status(400).json({ error: 'Missing path or content' });
  }

  // Restrict to safe subdirectories only — prevent arbitrary writes
  const ALLOWED_PATH = /^data\/(transport|ai)\/[\w-]+\.json$|^data\/chat\/[\w-]{3,64}\/[\w-]+\.json$/;
  if (!ALLOWED_PATH.test(body.path) || body.path.includes('..')) {
    return res.status(400).json({ error: 'Invalid path — allowed: data/transport/, data/ai/, data/chat/{userId}/' });
  }

  const encoded = Buffer.from(JSON.stringify(body.content, null, 2)).toString('base64');
  const apiUrl = `https://api.github.com/repos/${DATA_OWNER}/${DATA_REPO}/contents/${body.path}`;

  // Check if file already exists (need SHA for updates)
  let sha: string | undefined;
  const getRes = await fetch(apiUrl, { headers: ghHeaders() });
  if (getRes.ok) {
    const existing = await getRes.json() as { sha?: string };
    sha = existing.sha;
  }

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify({
      message: `chore: update ${body.path} via koyjabo sync`,
      content: encoded,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    return res.status(putRes.status).json({ error: 'GitHub write failed', detail: err.slice(0, 200) });
  }

  return res.status(200).json({ success: true, path: body.path });
}
