#!/usr/bin/env node
'use strict';
/**
 * Cleanup old auth result files and expired password reset tokens.
 *
 * Both results and user data live in koyjabo-core (this repo).
 * The GITHUB_TOKEN auto-credential has write access here — no second PAT needed.
 */

const { Octokit } = require('@octokit/rest');

const [OWNER, REPO] = (process.env.GITHUB_REPOSITORY || '/').split('/');
const octokit = new Octokit({ auth: process.env.AUTH_GITHUB_TOKEN });

async function listDir(path) {
  try {
    const res = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
    return Array.isArray(res.data) ? res.data : [];
  } catch (_) { return []; }
}

async function readJSON(path) {
  try {
    const res = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
    if (res.data.type !== 'file') return null;
    const content = JSON.parse(Buffer.from(res.data.content, 'base64').toString('utf8'));
    return { content, sha: res.data.sha };
  } catch (_) { return null; }
}

async function deleteFile(path, sha) {
  try {
    await octokit.repos.deleteFile({
      owner: OWNER, repo: REPO, path, sha,
      message: 'Cleanup expired auth file',
      committer: { name: 'KoyJabo Auth Bot', email: 'noreply@koyjabo.com' }
    });
    console.log(`Deleted: ${path}`);
  } catch (err) {
    console.log(`Failed to delete ${path}: ${err.message}`);
  }
}

async function main() {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();

  // Clean result files older than 1 hour
  console.log('Cleaning result files...');
  const resultFiles = await listDir('data/results');
  for (const file of resultFiles) {
    if (!file.name.endsWith('.json')) continue;
    const data = await readJSON(file.path);
    if (data && data.content.completedAt && (now - data.content.completedAt) > ONE_HOUR) {
      await deleteFile(file.path, file.sha);
    }
  }

  // Clean expired/used password reset tokens
  console.log('Cleaning expired reset tokens...');
  const resetFiles = await listDir('data/password_resets');
  for (const file of resetFiles) {
    if (!file.name.endsWith('.json')) continue;
    const data = await readJSON(file.path);
    if (data) {
      const { expiresAt, used } = data.content;
      if (used || (expiresAt && expiresAt < now)) {
        await deleteFile(file.path, data.sha);
      }
    }
  }

  console.log('Cleanup complete.');
}

main().catch(err => { console.error('Cleanup failed:', err); process.exit(1); });
