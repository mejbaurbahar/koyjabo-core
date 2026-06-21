/**
 * Seed intercity bus operator photos into the koyjabo data repo.
 *
 * Usage:
 *   GH_TOKEN=<your-pat> node scripts/seed-intercity-photos.mjs
 *
 * Requires: GitHub PAT with repo write access to mejbaurbahar/koyjabo
 * Images: sourced from public domain / CC-licensed sources on Wikimedia Commons
 * and operator websites. URLs are used directly as img src (no CORS issue for display).
 */

import { execSync } from 'child_process';

const REPO_OWNER = 'mejbaurbahar';
const REPO_NAME  = 'koyjabo';
const GH_TOKEN   = process.env.GH_TOKEN || execSync('gh auth token --user mejbaurbahar', { encoding: 'utf8' }).trim();

// ---------------------------------------------------------------------------
// Curated public-domain / CC-licensed photo sets for each intercity operator
// Sources: Wikimedia Commons (CC-BY/CC0), official operator press photos
// ---------------------------------------------------------------------------
// All URLs verified from Wikimedia Commons (CC-BY-SA 4.0 / CC-BY 2.0)
const OPERATOR_PHOTOS = {
  'Green Line Paribahan': [
    {
      caption: 'Green Line Paribahan MAN double-decker bus — Dhaka–Chittagong highway',
      captionBn: 'গ্রীন লাইন পরিবহন MAN ডাবল-ডেকার বাস — ঢাকা-চট্টগ্রাম মহাসড়ক',
      url: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Bangladeshi_Green_line_paribahan_MAN_branded_double_decker_bus_in_Dhaka-Chittagong_highway.jpg',
    },
    {
      caption: 'Green Line Paribahan double-decker bus service inauguration, Dhaka 2018',
      captionBn: 'গ্রীন লাইন পরিবহন ডাবল-ডেকার বাস সার্ভিস উদ্বোধন, ঢাকা ২০১৮',
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Double-decker_bus_service_inauguration%2C_Green_Line_Paribahan%2C_Dhaka%2C_2018-04-17_%28PID-0044585%29.jpg',
    },
  ],
  'Hanif Enterprise': [
    {
      caption: 'Hanif Enterprise Volvo B9R coach — Bangladesh (1)',
      captionBn: 'হানিফ এন্টারপ্রাইজ ভলভো B9R কোচ — বাংলাদেশ',
      url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Hanif_Enterprise_Volvo_B9R_coach%2C_Bangladesh_%2829907861176%29.jpg',
    },
    {
      caption: 'Hanif Enterprise Volvo B9R coach — Bangladesh (2)',
      captionBn: 'হানিফ এন্টারপ্রাইজ ভলভো B9R কোচ — বাংলাদেশ (২)',
      url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Hanif_Enterprise_Volvo_B9R_coach%2C_Bangladesh_%2829859035391%29.jpg',
    },
  ],
  // Shohag, Nabil, Ena — no verified CC photos found; seed empty
  'Shohag Paribahan': [],
  'Nabil Paribahan': [],
  'Ena Transport': [],
};

// ---------------------------------------------------------------------------
// Helper: check if URL returns a valid image (HEAD request)
// ---------------------------------------------------------------------------
async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    const ct = res.headers.get('content-type') || '';
    return res.ok && ct.startsWith('image/');
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Helper: download image and return base64 data URL
// ---------------------------------------------------------------------------
async function toDataUrl(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || 'image/jpeg';
    const buf = await res.arrayBuffer();
    const b64 = Buffer.from(buf).toString('base64');
    return `data:${ct};base64,${b64}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// GitHub API: get existing file SHA (needed for update)
// ---------------------------------------------------------------------------
async function getFileSha(path) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    { headers: { Authorization: `token ${GH_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json.sha || null;
}

// ---------------------------------------------------------------------------
// GitHub API: create or update file
// ---------------------------------------------------------------------------
async function pushFile(path, content, message) {
  const sha = await getFileSha(path);
  const body = {
    message,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GH_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${err.slice(0, 200)}`);
  }
  return await res.json();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\nSeed intercity operator photos → ${REPO_OWNER}/${REPO_NAME}\n`);

  for (const [operatorName, photos] of Object.entries(OPERATOR_PHOTOS)) {
    console.log(`\n📸 ${operatorName} (${photos.length} photo(s))`);
    const seedPhotos = [];

    for (const p of photos) {
      process.stdout.write(`  Checking: ${p.url.slice(0, 80)}... `);
      const valid = await checkUrl(p.url);

      if (!valid) {
        console.log('⚠️  URL unreachable — downloading anyway');
      }

      process.stdout.write('downloading... ');
      const dataUrl = await toDataUrl(p.url);

      if (!dataUrl) {
        console.log('❌ failed — skipping');
        continue;
      }

      const sizekb = Math.round(dataUrl.length / 1024);
      console.log(`✅ ${sizekb}KB`);

      seedPhotos.push({
        id: `seed_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: 'seed',
        displayName: 'KoyJabo Team',
        busId: operatorName,
        busName: operatorName,
        caption: p.caption,
        dataUrl,
        timestamp: Date.now(),
      });
    }

    if (seedPhotos.length === 0) {
      console.log(`  ⚠️  No photos collected for ${operatorName}`);
      continue;
    }

    const path = `data/photos/${operatorName}.json`;
    const payload = { busId: operatorName, photos: seedPhotos };

    process.stdout.write(`  Pushing to ${path}... `);
    try {
      await pushFile(path, payload, `seed: ${seedPhotos.length} photos for ${operatorName}`);
      console.log(`✅ ${seedPhotos.length} photo(s) pushed`);
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }
  }

  console.log('\n✅ Seed complete.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
