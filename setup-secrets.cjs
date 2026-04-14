#!/usr/bin/env node
/**
 * KoyJabo Auth — One-time secrets setup
 *
 * Usage:
 *   node setup-secrets.js <GITHUB_CLASSIC_PAT>
 *
 * Get the token: https://github.com/settings/tokens
 *   → "Generate new token (classic)" → tick "repo" → Generate → copy
 */
'use strict';

const https = require('https');
const crypto = require('crypto');
const sodium = require('libsodium-wrappers');

const SETUP_TOKEN = process.argv[2];
const OWNER = 'mejbaurbahar';
const REPO  = 'Dhaka-Commute';
const APP_URL = 'https://mejbaurbahar.github.io/Dhaka-Commute';

if (!SETUP_TOKEN) {
  console.error('\nUsage: node setup-secrets.js <GITHUB_CLASSIC_PAT>\n');
  console.error('Get it at: https://github.com/settings/tokens');
  console.error('Required scope: repo\n');
  process.exit(1);
}

const JWT_SECRET     = crypto.randomBytes(32).toString('hex');
const ENCRYPTION_KEY = crypto.randomBytes(16).toString('hex');

const SECRETS = { JWT_SECRET, ENCRYPTION_KEY, APP_URL };

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path, method,
      headers: {
        Authorization: `Bearer ${SETUP_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'KoyJabo-Setup/1.0',
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function encryptSecret(publicKeyB64, value) {
  await sodium.ready;
  const keyBytes    = sodium.from_base64(publicKeyB64, sodium.base64_variants.ORIGINAL);
  const valueBytes  = sodium.from_string(value);
  const encrypted   = sodium.crypto_box_seal(valueBytes, keyBytes);
  return sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL);
}

async function setSecret(keyId, publicKey, name, value) {
  const encrypted_value = await encryptSecret(publicKey, value);
  const res = await request('PUT', `/repos/${OWNER}/${REPO}/actions/secrets/${name}`, { encrypted_value, key_id: keyId });
  if (res.status !== 201 && res.status !== 204) throw new Error(`HTTP ${res.status}: ${JSON.stringify(res.body)}`);
}

async function main() {
  console.log('\n KoyJabo Auth — Secrets Setup');
  console.log('==============================\n');

  const pk = await request('GET', `/repos/${OWNER}/${REPO}/actions/secrets/public-key`);

  if (pk.status === 401) { console.error('Token invalid or expired.'); process.exit(1); }
  if (pk.status === 404) {
    console.error('Cannot access secrets. Does the token have "repo" scope?');
    console.error('Get one at: https://github.com/settings/tokens');
    process.exit(1);
  }
  if (pk.status !== 200) { console.error('GitHub error:', pk.status, pk.body); process.exit(1); }

  const { key_id, key } = pk.body;
  console.log('Connected to GitHub repo\n');

  for (const [name, value] of Object.entries(SECRETS)) {
    process.stdout.write(`  Setting ${name} ... `);
    try {
      await setSecret(key_id, key, name, value);
      console.log('done');
    } catch (err) {
      console.log('FAILED:', err.message);
    }
  }

  console.log('\nAll secrets set!\n');
  console.log('Save these somewhere safe:');
  console.log(`  JWT_SECRET      = ${JWT_SECRET}`);
  console.log(`  ENCRYPTION_KEY  = ${ENCRYPTION_KEY}`);
  console.log(`  APP_URL         = ${APP_URL}`);
  console.log('\nAuth system is ready.\n');
}

main().catch(err => { console.error('Setup failed:', err.message); process.exit(1); });
