/**
 * KoyJabo Auth Proxy — Cloudflare Worker
 *
 * Deploy at: api.koyjabo.com
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

// Simple in-memory rate limit (resets on Worker restart — best-effort)
const reqCount = new Map();
function isRateLimited(ip, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const entry = reqCount.get(ip);
  if (!entry || now > entry.resetAt) {
    reqCount.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}

// ── GitHub direct read/write helpers ─────────────────────────────────────────

async function readDataFile(token, owner, repo, path) {
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
    return { content: JSON.parse(text), sha: data.sha };
  } catch { return null; }
}

async function writeDataFile(token, owner, repo, path, content, message) {
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
    if (res.ok || res.status === 201) return { ok: true };
    const errBody = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, message: errBody?.message || 'GitHub write failed' };
  } catch (e) { return { ok: false, status: 500, message: String(e) }; }
}

async function deleteDataFile(token, owner, repo, path, message) {
  try {
    const existing = await readDataFile(token, owner, repo, path);
    if (!existing?.sha) return { ok: false, status: 404, message: 'File not found' };
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'koyjabo-proxy/1.0' },
      body: JSON.stringify({ message: message || `Delete: ${path}`, sha: existing.sha }),
    });
    if (res.ok) return { ok: true };
    const errBody = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, message: errBody?.message || 'GitHub delete failed' };
  } catch (e) { return { ok: false, status: 500, message: String(e) }; }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Only serve /gh path
    if (url.pathname !== '/gh' && url.pathname !== '/gh/') {
      return new Response('Not found', { status: 404 });
    }

    // Block requests not from our domain (in production)
    const referer = request.headers.get('Referer') || '';
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
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }

    const TOKEN = env.GH_TOKEN;
    const DATA_TOKEN = env.DATA_TOKEN || TOKEN; // PAT with contents:write on koyjabo
    const APP_OWNER = env.APP_OWNER || 'mejbaurbahar';
    const APP_REPO  = env.APP_REPO  || 'Dhaka-Commute';
    const DATA_OWNER = env.DATA_OWNER || 'mejbaurbahar';
    const DATA_REPO  = env.DATA_REPO  || 'koyjabo';   // private data repo
    const CORE_REPO = 'koyjabo-core';                  // result files live here

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

      const ghUrl = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${p}`;
      let upstream = await fetch(ghUrl, { headers: ghHeaders(TOKEN) });

      // Fallback: If r=a (results) and not found in APP_REPO (Dhaka-Commute), try CORE_REPO (koyjabo-core)
      if (upstream.status === 404 && r === 'a') {
        const fallbackUrl = `https://api.github.com/repos/${APP_OWNER}/${CORE_REPO}/contents/${p}`;
        upstream = await fetch(fallbackUrl, { headers: ghHeaders(TOKEN) });
      }

      // Fallback: If r=d (user data) and not found in DATA_REPO (koyjabo), try koyjabo-core
      // This handles existing users stored in koyjabo-core during the repo migration
      if (upstream.status === 404 && r === 'd') {
        const fallbackUrl = `https://api.github.com/repos/${DATA_OWNER}/${CORE_REPO}/contents/${p}`;
        upstream = await fetch(fallbackUrl, { headers: ghHeaders(TOKEN) });
      }

      if (upstream.status === 404) {
        return new Response('null', {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      if (!upstream.ok) {
        return new Response(
          JSON.stringify({ error: 'Account service connection failed.' }),
          { status: upstream.status, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      const data = await upstream.json();
      if (!data.content) {
        return new Response('null', {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // Decode base64 content and return ONLY the parsed JSON — no sha, no URLs, no metadata
      // TextDecoder handles UTF-8 multi-byte chars (Bangla, Arabic, etc.) that atob() can't
      let decoded;
      try {
        const clean = data.content.replace(/\n/g, '');
        const bytes = Uint8Array.from(atob(clean), c => c.charCodeAt(0));
        const text = new TextDecoder().decode(bytes);
        decoded = JSON.parse(text);
      } catch {
        return new Response(
          JSON.stringify({ error: 'Parse error' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      return new Response(JSON.stringify(decoded), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          ...corsHeaders(origin),
        },
      });
    }

    // ── POST /gh  (trigger GitHub Actions workflow dispatch) ─────────────────
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

      // ── Direct data writes (no GitHub Actions needed) ────────────────────────
      // save-data and record-query write directly to the data repo via GitHub API.
      // This is faster (instant vs 1-3 min) and doesn't require DATA_GITHUB_TOKEN secret.

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
        const writeResult = await writeDataFile(DATA_TOKEN, DATA_OWNER, DATA_REPO, path, content, message);
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
        const delResult = await deleteDataFile(DATA_TOKEN, DATA_OWNER, DATA_REPO, path, message);
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
        const record = existing || { date: today, queries: [] };
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
        const writeOk = await writeDataFile(DATA_TOKEN, DATA_OWNER, DATA_REPO, path, record, `Query record: ${(payload.query || '').slice(0, 30)}`);
        return new Response(
          JSON.stringify({ success: writeOk }),
          { status: writeOk ? 200 : 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      // ── Auth actions → dispatch GitHub Actions workflow ───────────────────────
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
