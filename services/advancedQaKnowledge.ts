import { EXPANDED_FAQ_DATA } from '../data/expandedFaqData';

export interface AdvancedQAItem {
  id: string;
  category: string;
  question_en: string;
  question_bn: string;
  answer_en: string;
  answer_bn: string;
  keywords?: string[];
  last_verified_at?: string;
}

export interface KnowledgeMatchResult {
  answer: string;
  confidence: number;
  language: 'en' | 'bn';
  matchedQuestion: string;
  category: string;
  needsVerificationNote: boolean;
}

const RANGE_HINT_PATTERN =
  /(\d+\s*[-–]\s*\d+)|\b(fare|price|tk|taka|minutes?|hours?|last train|schedule|time|cost)\b/i;

const BN_CHAR_PATTERN = /[\u0980-\u09FF]/;

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value: string): string[] =>
  normalizeText(value)
    .split(' ')
    .filter((t) => t.length > 1);

const detectLanguage = (query: string): 'en' | 'bn' => {
  return BN_CHAR_PATTERN.test(query) ? 'bn' : 'en';
};

const baseKnowledge: AdvancedQAItem[] = EXPANDED_FAQ_DATA.map((faq) => ({
  id: faq.id,
  category: faq.category,
  question_en: faq.question.en,
  question_bn: faq.question.bn,
  answer_en: faq.answer.en,
  answer_bn: faq.answer.bn,
  keywords: faq.keywords,
}));

let extraKnowledge: AdvancedQAItem[] = [];

export const setExtraKnowledgeData = (items: AdvancedQAItem[]): void => {
  extraKnowledge = items;
};

const scoreItem = (query: string, item: AdvancedQAItem, lang: 'en' | 'bn'): number => {
  const q = normalizeText(query);
  const question = normalizeText(lang === 'bn' ? item.question_bn : item.question_en);
  const answer = normalizeText(lang === 'bn' ? item.answer_bn : item.answer_en);
  const keywords = (item.keywords || []).map(normalizeText);

  const queryTokens = new Set(tokenize(q));
  const questionTokens = new Set(tokenize(question));
  const keywordTokens = new Set(tokenize(keywords.join(' ')));

  let overlap = 0;
  for (const t of queryTokens) {
    if (questionTokens.has(t) || keywordTokens.has(t)) overlap += 1;
  }

  const tokenScore = queryTokens.size ? overlap / queryTokens.size : 0;
  const substringBoost = question.includes(q) ? 0.35 : 0;
  const answerHintBoost = answer.includes(q) ? 0.1 : 0;
  const keywordBoost = keywords.some((k) => q.includes(k) || k.includes(q)) ? 0.15 : 0;

  return tokenScore + substringBoost + answerHintBoost + keywordBoost;
};

export const getAdvancedKnowledgeAnswer = (query: string): KnowledgeMatchResult | null => {
  const lang = detectLanguage(query);
  const allKnowledge = [...extraKnowledge, ...baseKnowledge];

  if (!allKnowledge.length) return null;

  const ranked = allKnowledge
    .map((item) => ({
      item,
      score: scoreItem(query, item, lang),
    }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  if (!top || top.score < 0.45) return null;

  const isTimeSensitive =
    RANGE_HINT_PATTERN.test(top.item.answer_en) ||
    RANGE_HINT_PATTERN.test(top.item.answer_bn) ||
    RANGE_HINT_PATTERN.test(top.item.question_en) ||
    RANGE_HINT_PATTERN.test(top.item.question_bn);

  const answer = lang === 'bn' ? top.item.answer_bn : top.item.answer_en;
  const verificationNote = isTimeSensitive
    ? lang === 'bn'
      ? '\n\nℹ️ ভাড়া/সময়সূচী পরিবর্তন হতে পারে, সর্বশেষ তথ্য যাচাই করে নিন।'
      : '\n\nℹ️ Fare/schedule can change, please verify latest official updates.'
    : '';

  return {
    answer: `${answer}${verificationNote}`,
    confidence: top.score,
    language: lang,
    matchedQuestion: lang === 'bn' ? top.item.question_bn : top.item.question_en,
    category: top.item.category,
    needsVerificationNote: isTimeSensitive,
  };
};
