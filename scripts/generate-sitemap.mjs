/**
 * Generates public/sitemap.xml with entries for every bus route and train route.
 * Run: node scripts/generate-sitemap.mjs
 * Integrated into the build via package.json "build" script.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const TODAY = new Date().toISOString().split('T')[0];
const BASE = 'https://koyjabo.com';

// Must mirror App.tsx slugify() exactly
function slugify(value) {
  return (value || '')
    .toLowerCase()
    .replace(/paribahan/g, '')
    .replace(/&/g, ' and ')
    .normalize('NFKD')
    .replace(/[^\w\sঀ-৿-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractBusSlugs() {
  const content = fs.readFileSync(path.join(root, 'constants.ts'), 'utf8');
  const start = content.indexOf('export const BUS_DATA');
  if (start === -1) return [];
  // Find the closing of the BUS_DATA array (next top-level export)
  const section = content.slice(start);
  const nextExport = section.indexOf('\nexport const ', 10);
  const bounded = nextExport !== -1 ? section.slice(0, nextExport) : section;

  const slugs = new Set();
  // Match id + name pairs within each bus object
  for (const m of bounded.matchAll(/id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'/g)) {
    const slug = slugify(m[2] || m[1]);
    if (slug) slugs.add(slug);
  }
  return [...slugs];
}

function extractTrainSlugs() {
  const content = fs.readFileSync(path.join(root, 'data', 'bangladeshTrainData.ts'), 'utf8');
  const start = content.indexOf('export const BD_TRAIN_ROUTES');
  if (start === -1) return [];
  const section = content.slice(start);
  const nextExport = section.indexOf('\nexport const ', 10);
  const bounded = nextExport !== -1 ? section.slice(0, nextExport) : section;

  const slugs = new Set();
  for (const m of bounded.matchAll(/id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'/g)) {
    const slug = slugify(m[2] || m[1]);
    if (slug) slugs.add(slug);
  }
  return [...slugs];
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const busSlugs = extractBusSlugs();
const trainSlugs = extractTrainSlugs();

console.log(`Extracted ${busSlugs.length} bus slugs, ${trainSlugs.length} train slugs`);

const staticPages = [
  urlEntry(`${BASE}/`, TODAY, 'daily', '1.0'),
  urlEntry(`${BASE}/intercity`, TODAY, 'daily', '0.9'),
  urlEntry(`${BASE}/ai`, TODAY, 'weekly', '0.8'),
  urlEntry(`${BASE}/blog`, TODAY, 'daily', '0.8'),
  urlEntry(`${BASE}/about`, TODAY, 'monthly', '0.7'),
  urlEntry(`${BASE}/faq`, TODAY, 'monthly', '0.7'),
  urlEntry(`${BASE}/privacy`, TODAY, 'monthly', '0.5'),
  urlEntry(`${BASE}/terms`, TODAY, 'monthly', '0.5'),
  urlEntry(`${BASE}/contact`, TODAY, 'monthly', '0.5'),
  urlEntry(`${BASE}/for-ai`, TODAY, 'monthly', '0.6'),
  urlEntry(`${BASE}/daily-journey`, TODAY, 'monthly', '0.4'),
  urlEntry(`${BASE}/history`, TODAY, 'monthly', '0.4'),
  urlEntry(`${BASE}/train`, TODAY, 'weekly', '0.8'),
];

const blogPages = [
  urlEntry(`${BASE}/blog/best-bus-routes-dhaka`, '2026-03-20', 'monthly', '0.8'),
  urlEntry(`${BASE}/blog/dhaka-metro-guide`, '2026-03-20', 'monthly', '0.8'),
  urlEntry(`${BASE}/blog/uttara-to-motijheel-bus-guide`, '2026-03-20', 'monthly', '0.8'),
];

const busPages = busSlugs.map(slug =>
  urlEntry(`${BASE}/bus/${slug}`, TODAY, 'monthly', '0.7')
);

const trainPages = trainSlugs.map(slug =>
  urlEntry(`${BASE}/train/${slug}`, TODAY, 'monthly', '0.7')
);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '',
  '  <!-- Main Pages -->',
  ...staticPages,
  '',
  '  <!-- Blog Posts -->',
  ...blogPages,
  '',
  `  <!-- Bus Routes (${busPages.length}) -->`,
  ...busPages,
  '',
  `  <!-- Train Routes (${trainPages.length}) -->`,
  ...trainPages,
  '',
  '</urlset>',
].join('\n');

const out = path.join(root, 'public', 'sitemap.xml');
fs.writeFileSync(out, xml, 'utf8');
console.log(`✅ sitemap.xml written — ${staticPages.length} static, ${blogPages.length} blog, ${busPages.length} bus, ${trainPages.length} train`);
