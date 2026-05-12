// KJ Design System — color token migration script
// Replaces old gray/slate/white Tailwind classes with kj-* design tokens
// Run: node kj-color-migrate.mjs

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'fs';
import { execSync } from 'child_process';

const files = execSync(
  'find . -name "*.tsx" -not -path "*/node_modules/*" -not -path "*/.git/*"',
  { cwd: '/Users/mejbaurbaharfagun/Desktop/Office/koyjabo/koyjabo-core', encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

// Ordered replacements — longer/more-specific patterns first to avoid partial matches
const replacements = [
  // ── Paired bg + dark:bg ──────────────────────────────────────────────
  ['bg-white dark:bg-slate-950', 'bg-kj-bg'],
  ['bg-white dark:bg-slate-900', 'bg-kj-panel'],
  ['bg-white dark:bg-slate-800', 'bg-kj-panel'],
  ['bg-white/80 dark:bg-slate-900/80', 'bg-kj-panel/90'],
  ['bg-white/90 dark:bg-slate-900/90', 'bg-kj-panel/90'],
  ['bg-gray-50 dark:bg-slate-950', 'bg-kj-bg'],
  ['bg-gray-50 dark:bg-slate-900', 'bg-kj-bg'],
  ['bg-gray-50 dark:bg-gray-900', 'bg-kj-bg'],
  ['bg-gray-100 dark:bg-slate-900', 'bg-kj-chip-bg'],
  ['bg-gray-100 dark:bg-slate-800', 'bg-kj-chip-bg'],
  ['bg-gray-100 dark:bg-slate-700', 'bg-kj-chip-bg'],
  ['bg-gray-100 dark:bg-gray-800', 'bg-kj-chip-bg'],
  ['bg-gray-100 dark:bg-gray-700', 'bg-kj-chip-bg'],
  ['bg-gray-100/50 dark:bg-slate-800/50', 'bg-kj-chip-bg/60'],
  ['bg-slate-50 dark:bg-slate-950', 'bg-kj-bg'],
  ['bg-slate-50 dark:bg-slate-900', 'bg-kj-bg'],
  ['bg-slate-100 dark:bg-slate-800', 'bg-kj-chip-bg'],
  ['bg-slate-200 dark:bg-slate-700', 'bg-kj-chip-bg'],
  ['bg-slate-700 dark:bg-slate-600', 'bg-kj-chip-bg'],
  ['bg-slate-800 dark:bg-slate-700', 'bg-kj-chip-bg'],
  ['bg-slate-900 dark:bg-slate-800', 'bg-kj-panel'],
  ['bg-slate-900/80', 'bg-kj-panel/80'],
  ['bg-slate-900/90', 'bg-kj-panel/90'],
  // standalone bg
  ['bg-slate-950', 'bg-kj-bg'],
  ['bg-slate-900', 'bg-kj-panel'],
  ['bg-slate-800', 'bg-kj-chip-bg'],
  // ── Paired text + dark:text ───────────────────────────────────────────
  ['text-gray-900 dark:text-white', 'text-kj-text'],
  ['text-gray-900 dark:text-gray-100', 'text-kj-text'],
  ['text-gray-900 dark:text-gray-200', 'text-kj-text'],
  ['text-gray-800 dark:text-white', 'text-kj-text'],
  ['text-gray-800 dark:text-gray-100', 'text-kj-text'],
  ['text-gray-800 dark:text-gray-200', 'text-kj-text'],
  ['text-gray-700 dark:text-gray-300', 'text-kj-text-dim'],
  ['text-gray-700 dark:text-gray-200', 'text-kj-text-dim'],
  ['text-gray-600 dark:text-gray-300', 'text-kj-text-dim'],
  ['text-gray-600 dark:text-gray-400', 'text-kj-text-dim'],
  ['text-gray-500 dark:text-gray-300', 'text-kj-text-dim'],
  ['text-gray-500 dark:text-gray-400', 'text-kj-text-dim'],
  ['text-gray-500 dark:text-gray-500', 'text-kj-text-dim'],
  ['text-gray-400 dark:text-gray-500', 'text-kj-text-faint'],
  ['text-gray-400 dark:text-gray-400', 'text-kj-text-faint'],
  ['text-gray-300 dark:text-gray-600', 'text-kj-text-faint'],
  ['text-slate-900 dark:text-white', 'text-kj-text'],
  ['text-slate-900 dark:text-slate-100', 'text-kj-text'],
  ['text-slate-800 dark:text-slate-100', 'text-kj-text'],
  ['text-slate-800 dark:text-slate-200', 'text-kj-text'],
  ['text-slate-700 dark:text-slate-300', 'text-kj-text-dim'],
  ['text-slate-600 dark:text-slate-300', 'text-kj-text-dim'],
  ['text-slate-600 dark:text-slate-400', 'text-kj-text-dim'],
  ['text-slate-500 dark:text-slate-400', 'text-kj-text-dim'],
  ['text-slate-400 dark:text-slate-500', 'text-kj-text-faint'],
  ['text-dhaka-dark dark:text-gray-100', 'text-kj-text'],
  ['text-dhaka-dark dark:text-white', 'text-kj-text'],
  // standalone text
  ['text-gray-900', 'text-kj-text'],
  ['text-gray-800', 'text-kj-text'],
  ['text-gray-700', 'text-kj-text-dim'],
  ['text-gray-600', 'text-kj-text-dim'],
  ['text-gray-500', 'text-kj-text-dim'],
  ['text-gray-400', 'text-kj-text-faint'],
  ['text-gray-300', 'text-kj-text-faint'],
  ['text-slate-900', 'text-kj-text'],
  ['text-slate-800', 'text-kj-text'],
  ['text-slate-700', 'text-kj-text-dim'],
  ['text-slate-600', 'text-kj-text-dim'],
  ['text-slate-500', 'text-kj-text-dim'],
  ['text-slate-400', 'text-kj-text-faint'],
  ['text-slate-300', 'text-kj-text-faint'],
  ['text-dhaka-dark', 'text-kj-text'],
  // ── Paired border + dark:border ──────────────────────────────────────
  ['border-gray-200 dark:border-gray-700', 'border-kj-line'],
  ['border-gray-200 dark:border-gray-800', 'border-kj-line'],
  ['border-gray-200 dark:border-slate-700', 'border-kj-line'],
  ['border-gray-200 dark:border-slate-800', 'border-kj-line'],
  ['border-gray-100 dark:border-gray-700', 'border-kj-line'],
  ['border-gray-100 dark:border-gray-800', 'border-kj-line'],
  ['border-gray-100 dark:border-slate-700', 'border-kj-line'],
  ['border-gray-100 dark:border-slate-800', 'border-kj-line'],
  ['border-gray-300 dark:border-gray-600', 'border-kj-line'],
  ['border-slate-200 dark:border-slate-700', 'border-kj-line'],
  ['border-slate-200 dark:border-slate-800', 'border-kj-line'],
  ['border-slate-700 dark:border-slate-600', 'border-kj-line'],
  ['border-slate-800 dark:border-slate-700', 'border-kj-line'],
  // standalone border
  ['border-gray-200', 'border-kj-line'],
  ['border-gray-100', 'border-kj-line'],
  ['border-gray-300', 'border-kj-line'],
  ['border-slate-200', 'border-kj-line'],
  ['border-slate-700', 'border-kj-line'],
  ['border-slate-800', 'border-kj-line'],
  // ── Hover bg ─────────────────────────────────────────────────────────
  ['hover:bg-gray-100 dark:hover:bg-slate-800', 'hover:bg-kj-chip-bg'],
  ['hover:bg-gray-100 dark:hover:bg-slate-700', 'hover:bg-kj-chip-bg'],
  ['hover:bg-gray-50 dark:hover:bg-slate-800', 'hover:bg-kj-chip-bg'],
  ['hover:bg-gray-100 dark:hover:bg-gray-800', 'hover:bg-kj-chip-bg'],
  ['hover:bg-gray-200 dark:hover:bg-slate-700', 'hover:bg-kj-chip-bg'],
  ['hover:bg-slate-800', 'hover:bg-kj-chip-bg'],
  ['hover:bg-gray-100', 'hover:bg-kj-chip-bg'],
  ['hover:bg-gray-200', 'hover:bg-kj-chip-bg'],
  ['hover:bg-gray-50', 'hover:bg-kj-chip-bg'],
  // ── focus ring ───────────────────────────────────────────────────────
  ['focus:ring-emerald-500', 'focus:ring-kj-primary'],
  ['focus:ring-green-400/30 dark:focus:ring-green-500/30', 'focus:ring-kj-primary/30'],
  ['focus:ring-green-400/30', 'focus:ring-kj-primary/30'],
  // ── Emerald → kj-primary ─────────────────────────────────────────────
  ['bg-emerald-600 hover:bg-emerald-700', 'bg-kj-primary hover:bg-kj-primary-deep'],
  ['bg-emerald-500 hover:bg-emerald-600', 'bg-kj-primary hover:bg-kj-primary-deep'],
  ['bg-emerald-600', 'bg-kj-primary'],
  ['bg-emerald-500', 'bg-kj-primary'],
  ['text-emerald-600 dark:text-emerald-400', 'text-kj-primary'],
  ['text-emerald-500 dark:text-emerald-400', 'text-kj-primary'],
  ['text-emerald-600', 'text-kj-primary'],
  ['text-emerald-500', 'text-kj-primary'],
  ['text-emerald-400', 'text-kj-primary'],
  ['bg-emerald-50 dark:bg-emerald-900/30', 'bg-kj-primary-soft'],
  ['bg-emerald-100 dark:bg-emerald-900/30', 'bg-kj-primary-soft'],
  ['bg-emerald-50', 'bg-kj-primary-soft'],
  ['bg-emerald-100', 'bg-kj-primary-soft'],
  ['border-emerald-500 dark:border-emerald-700', 'border-kj-primary'],
  ['border-emerald-500', 'border-kj-primary'],
  ['border-emerald-200 dark:border-emerald-800', 'border-kj-primary/30'],
  ['border-emerald-200', 'border-kj-primary/30'],
  // ── Teal → kj-primary ────────────────────────────────────────────────
  ['text-teal-600 dark:text-teal-400', 'text-kj-primary'],
  ['text-teal-500 dark:text-teal-400', 'text-kj-primary'],
  ['bg-teal-600', 'bg-kj-primary'],
  ['bg-teal-500', 'bg-kj-primary'],
  // ── Dhaka colors ─────────────────────────────────────────────────────
  ['bg-dhaka-green', 'bg-kj-primary'],
  ['text-dhaka-green', 'text-kj-primary'],
  ['border-dhaka-green', 'border-kj-primary'],
  ['bg-dhaka-red', 'bg-kj-accent'],
  ['text-dhaka-red', 'text-kj-accent'],
];

let totalChanged = 0;

for (const file of files) {
  const fullPath = '/Users/mejbaurbaharfagun/Desktop/Office/koyjabo/koyjabo-core/' + file.replace('./', '');
  let content;
  try {
    content = readFileSync(fullPath, 'utf8');
  } catch {
    continue;
  }
  let changed = content;
  for (const [from, to] of replacements) {
    // escape special regex chars in the 'from' string
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'g');
    changed = changed.replace(re, to);
  }
  if (changed !== content) {
    writeFileSync(fullPath, changed, 'utf8');
    totalChanged++;
    console.log(`✓ ${file}`);
  }
}

// Also process App.tsx in project root
const appPath = '/Users/mejbaurbaharfagun/Desktop/Office/koyjabo/koyjabo-core/App.tsx';
let appContent = readFileSync(appPath, 'utf8');
let appChanged = appContent;
for (const [from, to] of replacements) {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'g');
  appChanged = appChanged.replace(re, to);
}
if (appChanged !== appContent) {
  writeFileSync(appPath, appChanged, 'utf8');
  totalChanged++;
  console.log(`✓ App.tsx`);
}

console.log(`\nDone. ${totalChanged} files updated.`);
