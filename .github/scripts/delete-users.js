#!/usr/bin/env node
'use strict';

/**
 * One-time admin script: delete specific test accounts from the koyjabo private repo.
 * Triggered via GitHub Actions workflow_dispatch.
 */

const { Octokit } = require('@octokit/rest');

const DATA_OWNER = 'mejbaurbahar';
const DATA_REPO  = 'koyjabo';
const DATA_TOKEN = process.env.DATA_GITHUB_TOKEN;

const octokitData = new Octokit({ auth: DATA_TOKEN });

// ── Usernames to delete ────────────────────────────────────────────────────────
const USERNAMES_TO_DELETE = ['tester', 'fguntest', 'wivabe1697sixopluscom', 'kepoj', 'ralak81779'];

// ── File helpers ───────────────────────────────────────────────────────────────
async function readFile(path) {
  try {
    const res = await octokitData.repos.getContent({ owner: DATA_OWNER, repo: DATA_REPO, path });
    if (res.data.type !== 'file') return null;
    const content = JSON.parse(Buffer.from(res.data.content, 'base64').toString('utf8'));
    return { content, sha: res.data.sha };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function writeFile(path, content, sha, message) {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const params = {
    owner: DATA_OWNER, repo: DATA_REPO, path, message,
    content: encoded,
    committer: { name: 'KoyJabo Admin Bot', email: 'noreply@koyjabo.com' }
  };
  if (sha) params.sha = sha;
  await octokitData.repos.createOrUpdateFileContents(params);
}

async function deleteFile(path, sha) {
  try {
    await octokitData.repos.deleteFile({
      owner: DATA_OWNER, repo: DATA_REPO, path,
      message: `Delete test account file: ${path}`,
      sha,
      committer: { name: 'KoyJabo Admin Bot', email: 'noreply@koyjabo.com' }
    });
    console.log(`  Deleted: ${path}`);
  } catch (err) {
    if (err.status === 404) {
      console.log(`  Not found (skip): ${path}`);
    } else {
      console.warn(`  Failed to delete ${path}: ${err.message}`);
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  if (!DATA_TOKEN) {
    console.error('DATA_GITHUB_TOKEN is not set.');
    process.exit(1);
  }

  console.log('Reading username index...');
  const usernameIndexFile = await readFile('data/users/username_index.json');
  const usernameIndex = usernameIndexFile?.content || {};

  console.log('Reading email index...');
  const emailIndexFile = await readFile('data/users/index.json');
  const emailIndex = emailIndexFile?.content || {};

  const userIdsToDelete = [];

  for (const username of USERNAMES_TO_DELETE) {
    const userId = usernameIndex[username];
    if (!userId) {
      console.log(`Username @${username} not found in index — skipping.`);
      continue;
    }
    userIdsToDelete.push({ username, userId });
    console.log(`Found @${username} → userId: ${userId}`);
  }

  if (userIdsToDelete.length === 0) {
    console.log('No matching users found. Nothing to delete.');
    return;
  }

  // Delete all associated files for each user
  for (const { username, userId } of userIdsToDelete) {
    console.log(`\nDeleting @${username} (${userId})...`);

    const userFile     = await readFile(`data/users/${userId}.json`);
    const deviceFile   = await readFile(`data/devices/${userId}.json`);
    const historyFile  = await readFile(`data/history/${userId}.json`);
    const avatarFile   = await readFile(`data/avatars/${userId}.json`);

    if (userFile)    await deleteFile(`data/users/${userId}.json`,   userFile.sha);
    if (deviceFile)  await deleteFile(`data/devices/${userId}.json`, deviceFile.sha);
    if (historyFile) await deleteFile(`data/history/${userId}.json`, historyFile.sha);
    if (avatarFile)  await deleteFile(`data/avatars/${userId}.json`, avatarFile.sha);
  }

  // Update username_index.json — remove deleted usernames
  const deletedUsernames = new Set(userIdsToDelete.map(u => u.username));
  const updatedUsernameIndex = {};
  for (const [k, v] of Object.entries(usernameIndex)) {
    if (!deletedUsernames.has(k)) updatedUsernameIndex[k] = v;
  }
  const freshUsernameIndex = await readFile('data/users/username_index.json');
  await writeFile('data/users/username_index.json', updatedUsernameIndex, freshUsernameIndex?.sha, 'Remove test accounts from username index');
  console.log('\nUpdated username_index.json');

  // Update index.json (email hash → userId) — remove deleted userIds
  const deletedUserIds = new Set(userIdsToDelete.map(u => u.userId));
  const updatedEmailIndex = {};
  for (const [k, v] of Object.entries(emailIndex)) {
    if (!deletedUserIds.has(v)) updatedEmailIndex[k] = v;
  }
  const freshEmailIndex = await readFile('data/users/index.json');
  await writeFile('data/users/index.json', updatedEmailIndex, freshEmailIndex?.sha, 'Remove test accounts from email index');
  console.log('Updated index.json');

  console.log(`\nDone. Deleted ${userIdsToDelete.length} test account(s):`);
  for (const { username, userId } of userIdsToDelete) {
    console.log(`  @${username} (${userId})`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
