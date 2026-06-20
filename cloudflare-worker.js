/**
 * KoyJabo Auth Proxy — Cloudflare Worker
 *
 * Deploy at: api.koyjabo.com  (or koyjabo-auth-proxy.mejbaur-bahar.workers.dev)
 * Environment variables (set in Cloudflare dashboard):
 *   GH_TOKEN    — fine-grained PAT: actions:write on koyjabo-core + contents:read on koyjabo
 *   DATA_TOKEN  — classic PAT with contents:write on koyjabo (used for direct data writes)
 *   APP_OWNER   — mejbaurbahar
 *   APP_REPO    — Dhaka-Commute
 *   DATA_OWNER  — mejbaurbahar
 *   DATA_REPO   — koyjabo
 *
 * What this hides from browser DevTools:
 *   - Private repo name (koyjabo)
 *   - File paths inside the private repo
 *   - GitHub token (never reaches the browser)
 *   - Raw GitHub API metadata (sha, html_url, git_url, _links, etc.)
 *
 * Users see only: GET/POST https://api.koyjabo.com/gh (your domain)
 */

const ALLOWED_ORIGINS = [
  'https://koyjabo.com',
  'https://www.koyjabo.com',
  'https://dev.koyjabo.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

const ALLOWED_ACTIONS = new Set([
  'signup', 'login', 'change-password', 'forgot-password', 'verify-otp', 'reset-password',
  'update-profile', 'save-history', 'record-device', 'logout-device',
  'upload-avatar', 'record-visit', 'save-data', 'record-query', 'delete-data',
  'google-signup', 'set-google-password',
]);

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'koyjabo-proxy/1.0',
  };
}

// ── Rate limiter ──────────────────────────────────────────────────────────────
// Raised to 1800/min (30/sec): a single page load fires ~60 ratings requests.
// With the old 600/min limit, 10 simultaneous page loads from the same IP
// (common behind NAT/mobile carrier) would hit the ceiling.
const reqCount = new Map();
function isRateLimited(ip, limit = 1800, windowMs = 60_000) {
  const now = Date.now();
  const entry = reqCount.get(ip);
  if (!entry || now > entry.resetAt) {
    reqCount.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}

// ── ETag + SHA in-memory cache ────────────────────────────────────────────────
// Per-isolate, fast. Also stores `sha` so writeDataFile can skip a redundant
// GitHub API read-before-write call.
// key: "owner/repo:path" → { etag, decoded, sha, cachedAt }
const etagCache = new Map();
const ETAG_MAX_AGE = 10 * 60 * 1000; // serve stale for up to 10 min

// Result-polling files must never be cached (they transition 404 → exists)
function isCacheable(path) {
  return !path.startsWith('data/results/');
}

// Cloudflare distributed cache key (survives isolate restarts, shared globally)
function cfCacheKey(owner, repo, path) {
  return `https://koyjabo-auth-proxy.mejbaur-bahar.workers.dev/cached/${owner}/${repo}/${path}`;
}

// ── ghFetch — reads a file with 3-layer caching ───────────────────────────────
// Layer 1: Cloudflare Cache API (global, 5 min TTL, survives isolate cold starts)
// Layer 2: In-memory ETag cache (per-isolate, 10 min, sends 304 to GitHub)
// Layer 3: Fresh GitHub API call
async function ghFetch(token, owner, repo, path, ctx) {
  // Layer 1: Cloudflare distributed cache
  if (isCacheable(path)) {
    try {
      const hit = await caches.default.match(cfCacheKey(owner, repo, path));
      if (hit) {
        const decoded = await hit.json();
        return { status: 200, decoded };
      }
    } catch { /* cold cache or storage error — fall through */ }
  }

  // Layer 2: In-memory ETag cache (send conditional request to GitHub)
  const memKey = `${owner}/${repo}:${path}`;
  const cached = etagCache.get(memKey);
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'koyjabo-proxy/1.0',
  };
  if (cached?.etag && (Date.now() - cached.cachedAt) < ETAG_MAX_AGE) {
    headers['If-None-Match'] = cached.etag;
  }

  // Layer 3: GitHub API
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  );

  // 304 = not modified — return in-memory copy (free, no rate-limit cost)
  if (res.status === 304 && cached) {
    // Refresh CF cache from the still-valid in-memory copy
    if (isCacheable(path) && ctx) {
      ctx.waitUntil(_storeCfCache(owner, repo, path, cached.decoded));
    }
    return { status: 200, decoded: cached.decoded };
  }
  if (res.status === 404)  return { status: 404, decoded: null };
  // GitHub rate-limited but we have a stale copy — serve it rather than failing
  if ((res.status === 403 || res.status === 429) && cached) {
    return { status: 200, decoded: cached.decoded };
  }
  if (!res.ok) return { status: res.status, decoded: null };

  const data = await res.json();
  if (!data.content) return { status: 404, decoded: null };

  const clean = data.content.replace(/\n/g, '');
  const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
  const text  = new TextDecoder().decode(bytes);
  let decoded;
  try { decoded = JSON.parse(text); } catch { return { status: 500, decoded: null }; }

  // Store in both caches
  const etag = res.headers.get('ETag');
  if (isCacheable(path)) {
    if (etag) {
      // Store sha alongside so writeDataFile can skip a second GitHub fetch
      etagCache.set(memKey, { etag, decoded, sha: data.sha, cachedAt: Date.now() });
    }
    if (ctx) {
      ctx.waitUntil(_storeCfCache(owner, repo, path, decoded));
    }
  }

  return { status: 200, decoded };
}

async function _storeCfCache(owner, repo, path, decoded) {
  try {
    const resp = new Response(JSON.stringify(decoded), {
      headers: {
        'Content-Type': 'application/json',
        // 5-min TTL in Cloudflare's distributed cache
        'Cache-Control': 'public, max-age=300',
      },
    });
    await caches.default.put(cfCacheKey(owner, repo, path), resp);
  } catch { /* non-fatal */ }
}

async function _purgeCfCache(owner, repo, path) {
  try {
    await caches.default.delete(cfCacheKey(owner, repo, path));
  } catch { /* non-fatal */ }
}

// ── GitHub direct read/write helpers ─────────────────────────────────────────

async function readDataFile(token, owner, repo, path) {
  // Check ETag cache first — if sha is stored, skip the GitHub fetch
  const memKey = `${owner}/${repo}:${path}`;
  const cached = etagCache.get(memKey);
  if (cached?.sha && cached.decoded !== undefined) {
    return { content: cached.decoded, sha: cached.sha };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'koyjabo-proxy/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;
    const clean = data.content.replace(/\n/g, '');
    const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes);
    const content = JSON.parse(text);
    // Cache the sha for future writes
    const etag = res.headers.get('ETag');
    if (etag) {
      etagCache.set(memKey, { etag, decoded: content, sha: data.sha, cachedAt: Date.now() });
    }
    return { content, sha: data.sha };
  } catch { return null; }
}

async function writeDataFile(token, owner, repo, path, content, message, ctx) {
  try {
    const existing = await readDataFile(token, owner, repo, path);
    const json = JSON.stringify(content, null, 2);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const body = { message: message || `Sync: ${path}`, content: encoded };
    if (existing?.sha) body.sha = existing.sha;
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'koyjabo-proxy/1.0' },
      body: JSON.stringify(body),
    });
    if (res.ok || res.status === 201) {
      // Invalidate both caches so next read returns fresh data
      const memKey = `${owner}/${repo}:${path}`;
      etagCache.delete(memKey);
      if (ctx) ctx.waitUntil(_purgeCfCache(owner, repo, path));
      return { ok: true };
    }
    const errBody = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, message: errBody?.message || 'GitHub write failed' };
  } catch (e) { return { ok: false, status: 500, message: String(e) }; }
}

async function deleteDataFile(token, owner, repo, path, message, ctx) {
  try {
    const existing = await readDataFile(token, owner, repo, path);
    if (!existing?.sha) return { ok: false, status: 404, message: 'File not found' };
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'koyjabo-proxy/1.0' },
      body: JSON.stringify({ message: message || `Delete: ${path}`, sha: existing.sha }),
    });
    if (res.ok) {
      const memKey = `${owner}/${repo}:${path}`;
      etagCache.delete(memKey);
      if (ctx) ctx.waitUntil(_purgeCfCache(owner, repo, path));
      return { ok: true };
    }
    const errBody = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, message: errBody?.message || 'GitHub delete failed' };
  } catch (e) { return { ok: false, status: 500, message: String(e) }; }
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Ignore cached/ sub-path (used as CF Cache API keys — not real routes)
    if (url.pathname.startsWith('/cached/')) {
      return new Response('Not found', { status: 404 });
    }

    // ── POST /ai  — Cloudflare Workers AI (no token needed) ─────────────────
    if ((url.pathname === '/ai' || url.pathname === '/ai/') && request.method === 'POST') {
      if (!env.AI) {
        return new Response(JSON.stringify({ error: 'AI binding not configured' }), {
          status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (isRateLimited(ip + ':ai', 20, 60_000)) {
        return new Response(JSON.stringify({ error: 'Too many AI requests' }), {
          status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      let body;
      try { body = await request.json(); } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      const message = String(body.message || '').slice(0, 500);
      const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
      if (!message) {
        return new Response(JSON.stringify({ error: 'Missing message' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      const SYSTEM_PROMPT = `You are KoyJabo AI (কই যাবো AI), Bangladesh's smartest transport assistant. Built by Mejbaur Bahar Fagun for koyjabo.com.

LANGUAGE: Respond in Bangla if user writes in Bangla script. English or Banglish otherwise.

CORE KNOWLEDGE:
**Dhaka Metro (MRT-6):** Uttara North → Motijheel (16 stations). Hours: 7:10AM–9:40PM (Fri closed). Fare: ৳20–100. Stations: Uttara North, Uttara Center, Uttara South, Pallabi, Mirpur-11, Mirpur-10, Kazipara, Shewrapara, Agargaon, Bijoy Sarani, Farmgate, Karwan Bazar, Shahbag, Dhaka University, Secretariat, Motijheel.

**Major Dhaka Bus Hubs:** Gabtoli (Savar/Mirpur corridor), Mohakhali (North Dhaka), Gulistan (South/Old Dhaka), Sayedabad (Chittagong/South route), Kamalapur (Railway), Mirpur-10 (Mirpur area), Farmgate (Central), Technical (Mirpur-Dhanmondi junction).

**Savar Corridor Buses:** Baishakhi Paribahan (Savar→Gulshan), Labbayk (Hemayetpur→Gabtoli), Nilachal (Savar→Motijheel), Moumita (Savar→Sadarghat), Savar Paribahan, Turag Paribahan. All start from Gabtoli/Savar area.

**Key Intercity Routes (from Dhaka):**
- Cox's Bazar: Green Line/Hanif/S.Alam bus (8-10h, ৳1200-2500) or Cox's Bazar Express train (night, ৳700-2600) or flight (1h, ৳4500+)
- Sylhet: Bus (6-7h, ৳600-1200) or Upaban/Jayantika train (6-8h, ৳300-800) or flight (45min)
- Chittagong: Bus (6-7h, ৳680-1500) or Subarna Express train (4-5h, ৳400-1500)
- Khulna: Sundarban Express train (9-10h) or bus via Padma Bridge (7-8h)
- Barishal: Launch from Sadarghat (7-8h, ৳400-1200) or bus
- Rajshahi: Silk City/Padma Express train (6-7h) or bus

**Route advice rules:**
1. Always check direct buses FIRST before suggesting transfers
2. Prefer routes locals actually use (Baishakhi/Labbayk for Savar corridor)
3. Metro is fastest for Uttara-Motijheel corridor, beats any bus
4. CNG/Rickshaw for short last-mile (<3km)
5. Avoid 3+ transfers — suggest simpler alternatives

**Format responses as:**
- Option 1 (Direct/Recommended): vehicle name, boarding point, drop point, time, fare
- Option 2 (Alternative): via [hub], vehicle names, time, fare
- Quick tip at end

If user mentions current location in [Context:...] tag, use it as their actual starting point.
If asked who built you: "Mejbaur Bahar Fagun, software engineer, Bangladesh."`;

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.text || '').slice(0, 400) })),
        { role: 'user', content: message },
      ];

      try {
        const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages,
          max_tokens: 800,
        });
        const text = result.response || '';
        return new Response(JSON.stringify({ text }), {
          status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'ai_failed', detail: String(e).slice(0, 100) }), {
          status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }
    }

    // ── POST /feedback — store route correction feedback ─────────────────────
    if ((url.pathname === '/feedback' || url.pathname === '/feedback/') && request.method === 'POST') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (isRateLimited(ip + ':fb', 10, 60_000)) {
        return new Response(JSON.stringify({ error: 'Rate limited' }), {
          status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }
      let body;
      try { body = await request.json(); } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }
      const feedback = {
        type: String(body.type || 'wrong_route').slice(0, 50),
        query: String(body.query || '').slice(0, 300),
        from: String(body.from || '').slice(0, 100),
        to: String(body.to || '').slice(0, 100),
        comment: String(body.comment || '').slice(0, 500),
        timestamp: Date.now(),
        ip: ip.slice(0, 15),
      };
      // Store in KV or write to data repo (currently: log to Cloudflare logs + return ok)
      console.log('[FEEDBACK]', JSON.stringify(feedback));
      // If DATA_TOKEN and DATA_REPO are set, store to GitHub data repo
      if (env.DATA_TOKEN) {
        try {
          const today = new Date().toISOString().split('T')[0];
          const path = `data/feedback/${today}.json`;
          const existing = await readDataFile(env.DATA_TOKEN, env.DATA_OWNER || 'mejbaurbahar', env.DATA_REPO || 'koyjabo', path);
          const record = existing?.content || { date: today, entries: [] };
          record.entries.push(feedback);
          if (record.entries.length > 200) record.entries = record.entries.slice(-200);
          await writeDataFile(env.DATA_TOKEN, env.DATA_OWNER || 'mejbaurbahar', env.DATA_REPO || 'koyjabo', path, record, `Feedback: ${feedback.type} ${today}`);
        } catch { /* non-fatal */ }
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    // Only serve /gh path
    if (url.pathname !== '/gh' && url.pathname !== '/gh/') {
      return new Response('Not found', { status: 404 });
    }

    // Block requests not from our domain (in production)
    const isLocalDev = origin.startsWith('http://localhost');
    const isOurSite = origin.startsWith('https://koyjabo.com') ||
                      origin.startsWith('https://www.koyjabo.com') ||
                      origin.startsWith('https://dev.koyjabo.com');
    if (!isLocalDev && !isOurSite && origin !== '') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders(origin) });
    }

    // Rate limit by IP
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60', ...corsHeaders(origin) } }
      );
    }

    const TOKEN = env.GH_TOKEN;
    const DATA_TOKEN = env.DATA_TOKEN || TOKEN;
    const APP_OWNER  = env.APP_OWNER  || 'mejbaurbahar';
    const APP_REPO   = env.APP_REPO   || 'Dhaka-Commute';
    const DATA_OWNER = env.DATA_OWNER || 'mejbaurbahar';
    const DATA_REPO  = env.DATA_REPO  || 'koyjabo';
    const CORE_REPO  = 'koyjabo-core';

    if (!TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Account service connection failed.' }),
        { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }

    const REPOS = {
      d: { owner: DATA_OWNER, repo: DATA_REPO },
      a: { owner: APP_OWNER,  repo: APP_REPO  },
    };

    // ── GET /gh?r=d|a&p=<path>  (read a file, return only decoded content) ──
    if (request.method === 'GET') {
      const r = url.searchParams.get('r') || '';
      const p = url.searchParams.get('p') || '';
      const repo = REPOS[r];

      if (!repo || !p) {
        return new Response(
          JSON.stringify({ error: 'Bad request' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      // Validate: only allow safe JSON paths, no traversal
      if (!/^[\w/.-]+\.json$/.test(p) || p.includes('..')) {
        return new Response(
          JSON.stringify({ error: 'Invalid path' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      // Primary fetch with 3-layer caching (CF cache → ETag → GitHub API)
      let result = await ghFetch(TOKEN, repo.owner, repo.repo, p, ctx);

      // Fallback: r=a (results) → try CORE_REPO if not in APP_REPO
      if (result.status === 404 && r === 'a') {
        result = await ghFetch(TOKEN, APP_OWNER, CORE_REPO, p, ctx);
      }

      // Fallback: r=d (user data) → try koyjabo-core for migrated users
      if (result.status === 404 && r === 'd') {
        result = await ghFetch(TOKEN, DATA_OWNER, CORE_REPO, p, ctx);
      }

      if (result.status === 404) {
        return new Response('null', {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      }

      if (result.status !== 200 || result.decoded === null) {
        return new Response(
          JSON.stringify({ error: 'Account service connection failed.' }),
          { status: result.status >= 400 ? result.status : 502, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      const isUserData = p.startsWith('data/users/') || p.startsWith('data/results/');
      return new Response(JSON.stringify(result.decoded), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': isUserData ? 'no-store' : 'public, max-age=300, stale-while-revalidate=60',
          ...corsHeaders(origin),
        },
      });
    }

    // ── POST /gh  ────────────────────────────────────────────────────────────
    if (request.method === 'POST') {
      const contentType = request.headers.get('Content-Type') || '';
      if (!contentType.includes('application/json')) {
        return new Response(
          JSON.stringify({ error: 'Content-Type must be application/json' }),
          { status: 415, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      if (!body?.requestId || !body?.action) {
        return new Response(
          JSON.stringify({ error: 'Bad request' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      if (!ALLOWED_ACTIONS.has(body.action)) {
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      if (!/^[0-9a-f-]{36}$/.test(body.requestId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid requestId' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      // ── Direct data writes (no GitHub Actions needed) ─────────────────────
      if (body.action === 'save-data') {
        let payload = {};
        try { payload = JSON.parse(body.data || '{}'); } catch { /* ignore */ }
        const { path, content, message } = payload;
        if (!path || content === undefined || !String(path).startsWith('data/')) {
          return new Response(
            JSON.stringify({ error: 'Invalid path or content for save-data' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
          );
        }
        const writeResult = await writeDataFile(DATA_TOKEN, DATA_OWNER, DATA_REPO, path, content, message, ctx);
        return new Response(
          JSON.stringify({ success: writeResult.ok, ...(writeResult.ok ? {} : { error: writeResult.message, status: writeResult.status }) }),
          { status: writeResult.ok ? 200 : (writeResult.status === 403 ? 403 : 500), headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      if (body.action === 'delete-data') {
        let payload = {};
        try { payload = JSON.parse(body.data || '{}'); } catch { /* ignore */ }
        const { path, message } = payload;
        if (!path || !String(path).startsWith('data/')) {
          return new Response(
            JSON.stringify({ error: 'Invalid path for delete-data' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
          );
        }
        const delResult = await deleteDataFile(DATA_TOKEN, DATA_OWNER, DATA_REPO, path, message, ctx);
        return new Response(
          JSON.stringify({ success: delResult.ok, ...(delResult.ok ? {} : { error: delResult.message }) }),
          { status: delResult.ok ? 200 : (delResult.status === 404 ? 404 : 500), headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      if (body.action === 'record-query') {
        let payload = {};
        try { payload = JSON.parse(body.data || '{}'); } catch { /* ignore */ }
        const today = new Date().toISOString().split('T')[0];
        const path = `data/learning/queries/${today}.json`;
        const existing = await readDataFile(TOKEN, DATA_OWNER, DATA_REPO, path);
        const record = existing?.content || { date: today, queries: [] };
        record.queries.push({
          query: (payload.query || '').slice(0, 300),
          responseLen: (payload.response || '').length,
          intent: payload.intent || 'unknown',
          quality: payload.quality || 'unknown',
          lang: payload.lang || 'en',
          userId: body.userId || 'anonymous',
          timestamp: Date.now(),
        });
        if (record.queries.length > 500) record.queries = record.queries.slice(-500);
        const writeOk = await writeDataFile(DATA_TOKEN, DATA_OWNER, DATA_REPO, path, record, `Query record: ${(payload.query || '').slice(0, 30)}`, ctx);
        return new Response(
          JSON.stringify({ success: writeOk.ok }),
          { status: writeOk.ok ? 200 : 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      // ── Auth actions → dispatch GitHub Actions workflow ───────────────────
      const ghUrl = `https://api.github.com/repos/${APP_OWNER}/koyjabo-core/actions/workflows/auth.yml/dispatches`;
      const upstream = await fetch(ghUrl, {
        method: 'POST',
        headers: ghHeaders(TOKEN),
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            requestId:    body.requestId,
            action:       body.action,
            email:        body.email        || '',
            passwordHash: body.passwordHash || '',
            userId:       body.userId       || '',
            data:         body.data         || '{}',
          },
        }),
      });

      if (!upstream.ok) {
        return new Response(
          JSON.stringify({ error: 'Account service connection failed.' }),
          { status: upstream.status, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
    );
  },
};
