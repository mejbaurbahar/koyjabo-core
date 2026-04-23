import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = path.join(root, 'data', 'advanced-qa.raw.json');
const outputPath = path.join(root, 'data', 'advancedQaData.ts');

if (!fs.existsSync(inputPath)) {
  console.error(`Missing input file: ${inputPath}`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (!Array.isArray(raw)) {
  console.error('Input must be a JSON array.');
  process.exit(1);
}

const normalize = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const seen = new Set();
const cleaned = [];

for (const row of raw) {
  if (!row || typeof row !== 'object') continue;

  const item = {
    id: String(row.id ?? ''),
    category: String(row.category ?? 'General').trim() || 'General',
    question_en: String(row.question_en ?? '').trim(),
    question_bn: String(row.question_bn ?? '').trim(),
    answer_en: String(row.answer_en ?? '').trim(),
    answer_bn: String(row.answer_bn ?? '').trim(),
    keywords: [],
  };

  if (!item.question_en && !item.question_bn) continue;
  if (!item.answer_en && !item.answer_bn) continue;

  const dedupeKey = `${normalize(item.question_en)}|${normalize(item.question_bn)}`;
  if (seen.has(dedupeKey)) continue;
  seen.add(dedupeKey);

  item.keywords = [
    ...new Set(
      `${item.question_en} ${item.question_bn} ${item.category}`
        .split(/\s+/)
        .map((t) => normalize(t))
        .filter((t) => t.length > 2),
    ),
  ].slice(0, 18);

  cleaned.push(item);
}

const source = `import type { AdvancedQAItem } from '../services/advancedQaKnowledge';

export const ADVANCED_QA_DATA: AdvancedQAItem[] = ${JSON.stringify(cleaned, null, 2)};
`;

fs.writeFileSync(outputPath, source, 'utf8');
console.log(`Built ${cleaned.length} QA records -> ${outputPath}`);
