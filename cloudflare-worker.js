/**
 * KoyJabo Auth Proxy — Cloudflare Worker
 *
 * Deploy at: api.koyjabo.com
 * Environment variables (set in Cloudflare dashboard):
 *   GH_TOKEN    — fine-grained PAT: actions:write on Dhaka-Commute + contents:read on koyjabo
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
  'http://localhost:5173',
  'http://localhost:3000',
];

const ALLOWED_ACTIONS = new Set([
  'signup', 'login', 'change-password', 'forgot-password', 'reset-password',
  'update-profile', 'save-history', 'record-device', 'logout-device',
  'upload-avatar', 'record-visit', 'save-data', 'record-query',
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
                      origin.startsWith('https://www.koyjabo.com');
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
    const APP_OWNER = env.APP_OWNER || 'mejbaurbahar';
    const APP_REPO  = env.APP_REPO  || 'koyjabo-core';
    const DATA_OWNER = env.DATA_OWNER || 'mejbaurbahar';
    const DATA_REPO  = env.DATA_REPO  || 'koyjabo';

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
      const upstream = await fetch(ghUrl, { headers: ghHeaders(TOKEN) });

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
      let decoded;
      try {
        const clean = data.content.replace(/\n/g, '');
        const text = atob(clean);
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

      // Workflow dispatches MUST go to koyjabo-core where the actions are running
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
