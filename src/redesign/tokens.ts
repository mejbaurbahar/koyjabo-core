// KoyJabo Design Tokens — exact values from KoyJabo App Standalone.html
export const KJ_TOKENS = {
  light: {
    bg: '#eef3f7',
    pageBg: '#dde6ee',
    panel: 'rgba(255,255,255,0.72)',
    panelSolid: '#ffffff',
    panelMuted: 'rgba(232,240,247,0.6)',
    line: 'rgba(56,89,122,0.18)',
    text: '#0a1626',
    textDim: '#4a607a',
    textFaint: '#7e93ab',
    chipBg: 'rgba(56,100,160,0.08)',
    chipText: '#1e3a5f',
    inputBg: 'rgba(255,255,255,0.65)',
    primary: '#00b8d9',
    primaryInk: '#02161c',
    primarySoft: 'rgba(0,184,217,0.12)',
    primaryDeep: '#0070ad',
    accent: '#ff3d77',
    accentSoft: 'rgba(255,61,119,0.12)',
    amber: '#ff8a00',
    amberSoft: 'rgba(255,138,0,0.12)',
    metroBg: '#001b2e',
    shadow: '0 2px 4px rgba(0,32,64,0.04), 0 18px 40px -20px rgba(0,184,217,0.18)',
    shadowLg: '0 4px 12px rgba(0,32,64,0.06), 0 32px 80px -30px rgba(0,184,217,0.35)',
  },
  dark: {
    bg: '#040814',
    pageBg: '#05060b',
    panel: 'rgba(13,22,42,0.72)',
    panelSolid: '#0d162a',
    panelMuted: 'rgba(7,14,28,0.6)',
    line: 'rgba(0,245,255,0.14)',
    text: '#e0f7ff',
    textDim: '#8da4c4',
    textFaint: '#5a7090',
    chipBg: 'rgba(0,245,255,0.08)',
    chipText: '#bde6ff',
    inputBg: 'rgba(5,12,24,0.6)',
    primary: '#00f5ff',
    primaryInk: '#001218',
    primarySoft: 'rgba(0,245,255,0.14)',
    primaryDeep: '#00d4e6',
    accent: '#ff2a6d',
    accentSoft: 'rgba(255,42,109,0.14)',
    amber: '#ffb800',
    amberSoft: 'rgba(255,184,0,0.14)',
    metroBg: '#000814',
    shadow: '0 2px 4px rgba(0,0,0,0.5), 0 18px 50px -20px rgba(0,245,255,0.25)',
    shadowLg: '0 4px 12px rgba(0,0,0,0.6), 0 30px 90px -25px rgba(0,245,255,0.45)',
  },
} as const;

export type Theme = 'dark' | 'light';
export type Lang = 'bn' | 'en';
export type Device = 'auto' | 'mobile' | 'desktop';
// Wide type: accepts both light and dark themes
export type Tokens = { [K in keyof typeof KJ_TOKENS.dark]: string };

export const SANS = "'Inter', system-ui, -apple-system, sans-serif";
export const BEN = "'Hind Siliguri', 'Inter', system-ui, sans-serif";

export const T = (lang: Lang, bn: string, en: string): string => lang === 'bn' ? bn : en;

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
/** Convert digits to Bengali numerals when lang === 'bn' */
export const N = (value: string | number, lang: Lang): string => {
  if (lang !== 'bn') return String(value);
  return String(value).replace(/[0-9]/g, d => BN_DIGITS[+d]);
};
/** Format fare with Bengali numerals: ৳405 or ৳৪০৫ */
export const Fare = (amount: string | number, lang: Lang): string =>
  '৳' + N(String(amount).replace(/^৳/, ''), lang);

export const chipBtn = (tk: Tokens): React.CSSProperties => ({
  background: tk.panelMuted,
  border: `1px solid ${tk.line}`,
  borderRadius: 999,
  padding: '6px 12px',
  fontFamily: SANS,
  fontWeight: 500,
  fontSize: 12,
  color: tk.text,
  display: 'inline-flex' as const,
  alignItems: 'center',
  gap: 6,
  cursor: 'pointer',
});
