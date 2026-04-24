#!/usr/bin/env node
'use strict';
/**
 * Cleanup old auth result files (koyjabo-core) and expired OTP/reset tokens (koyjabo).
 *
 * Uses two tokens:
 *   AUTH_GITHUB_TOKEN  — GITHUB_TOKEN, write access to koyjabo-core (result files)
 *   DATA_GITHUB_TOKEN  — classic PAT, write access to private koyjabo repo (reset tokens)
 */

const { Octokit } = require('@octokit/rest');

// Result files live in Dhaka-Commute (public, DATA_TOKEN can write/delete here)
const APP_OWNER = 'mejbaurbahar';
const APP_REPO  = 'Dhaka-Commute';

// User data + password_resets live in koyjabo-core (GITHUB_TOKEN can write here)
const [DATA_OWNER, DATA_REPO] = (process.env.GITHUB_REPOSITORY || 'mejbaurbahar/koyjabo-core').split('/');

const octokitApp  = new Octokit({ auth: process.env.DATA_GITHUB_TOKEN || process.env.AUTH_GITHUB_TOKEN });
const octokitData = new Octokit({ auth: process.env.AUTH_GITHUB_TOKEN });

async function listDir(octokit, owner, repo, path) {
  try {
    const res = await octokit.repos.getContent({ owner, repo, path });
    return Array.isArray(res.data) ? res.data : [];
  } catch (_) { return []; }
}

async function readJSON(octokit, owner, repo, path) {
  try {
    const res = await octokit.repos.getContent({ owner, repo, path });
    if (res.data.type !== 'file') return null;
    const content = JSON.parse(Buffer.from(res.data.content, 'base64').toString('utf8'));
    return { content, sha: res.data.sha };
  } catch (_) { return null; }
}

async function deleteFile(octokit, owner, repo, path, sha) {
  try {
    await octokit.repos.deleteFile({
      owner, repo, path, sha,
      message: 'Cleanup expired auth file',
      committer: { name: 'KoyJabo Auth Bot', email: 'noreply@koyjabo.com' }
    });
    console.log(`Deleted: ${owner}/${repo}/${path}`);
  } catch (err) {
    console.log(`Failed to delete ${path}: ${err.message}`);
  }
}

async function main() {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();

  // Clean result files older than 1 hour from Dhaka-Commute
  console.log(`Cleaning result files from ${APP_OWNER}/${APP_REPO}...`);
  const resultFiles = await listDir(octokitApp, APP_OWNER, APP_REPO, 'data/results');
  for (const file of resultFiles) {
    if (!file.name.endsWith('.json')) continue;
    const data = await readJSON(octokitApp, APP_OWNER, APP_REPO, file.path);
    if (data && data.content.completedAt && (now - data.content.completedAt) > ONE_HOUR) {
      await deleteFile(octokitApp, APP_OWNER, APP_REPO, file.path, file.sha);
    }
  }

  // Clean expired/used OTP reset tokens from koyjabo-core
  console.log(`Cleaning expired reset tokens from ${DATA_OWNER}/${DATA_REPO}...`);
  const resetFiles = await listDir(octokitData, DATA_OWNER, DATA_REPO, 'data/password_resets');
  for (const file of resetFiles) {
    if (!file.name.endsWith('.json')) continue;
    const data = await readJSON(octokitData, DATA_OWNER, DATA_REPO, file.path);
    if (data) {
      const { expiresAt, used } = data.content;
      if (used || (expiresAt && expiresAt < now)) {
        await deleteFile(octokitData, DATA_OWNER, DATA_REPO, file.path, data.sha);
      }
    }
  }

  console.log('Cleanup complete.');
}

main().catch(err => { console.error('Cleanup failed:', err); process.exit(1); });
