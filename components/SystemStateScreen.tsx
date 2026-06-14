import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type Tone = 'primary' | 'accent' | 'amber';

interface SystemStateConfig {
  code?: string;
  tone: Tone;
  icon: React.ReactNode;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  chips?: Array<{ en: string; bn: string }>;
  primaryLabel: { en: string; bn: string };
  primaryIcon?: React.ReactNode;
  onPrimary: () => void;
  secondaryLabel?: { en: string; bn: string };
  secondaryIcon?: React.ReactNode;
  onSecondary?: () => void;
  footerBn?: string;
  footerEn?: string;
  footerLinkBn?: string;
  footerLinkEn?: string;
  onFooterLink?: () => void;
}

// SVG icons matching design's 1.9-stroke line icons
const Icons = {
  pinOff: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s-7-7.5-7-13a7 7 0 0 1 11.4-5.4"/><path d="M18.6 7.2A7 7 0 0 1 19 9c0 2-1 4.3-2.4 6.3"/><path d="m3 3 18 18"/>
    </svg>
  ),
  alertTriangle: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 4.3 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  ),
  lock: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/><circle cx="12" cy="15.5" r="1.3"/>
    </svg>
  ),
  wifiOff: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 3 18 18"/><path d="M10.7 6.1A12.9 12.9 0 0 1 22 8.8"/><path d="M2 8.8a13 13 0 0 1 4.2-2.6"/><path d="M5 12.5a8.5 8.5 0 0 1 3-2"/><path d="M16.7 11.2A8.5 8.5 0 0 1 19 12.5"/><path d="M8.5 16a4 4 0 0 1 5.5-.4"/><path d="M12 20h.01"/>
    </svg>
  ),
  wrench: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3 18v3h3l6.5-6.5a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.2-.4-.4-2.2 2.6-2.6Z"/>
    </svg>
  ),
  search: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
    </svg>
  ),
};

const BtnIcons = {
  home: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>,
  refresh: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v5h-5"/></svg>,
  search: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  user: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  bookmark: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12v18l-6-4-6 4Z"/></svg>,
};

export { Icons, BtnIcons };

const SystemStateScreen: React.FC<SystemStateConfig> = ({
  code, tone, icon, titleBn, titleEn, descBn, descEn, chips,
  primaryLabel, primaryIcon, onPrimary,
  secondaryLabel, secondaryIcon, onSecondary,
  footerBn, footerEn, footerLinkBn, footerLinkEn, onFooterLink,
}) => {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  // Tone → CSS variable
  const toneVar = tone === 'accent' ? 'var(--kj-accent)' : tone === 'amber' ? 'var(--kj-amber)' : 'var(--kj-primary)';
  const toneSoftVar = tone === 'accent' ? 'var(--kj-accent-soft)' : tone === 'amber' ? 'var(--kj-amber-soft)' : 'var(--kj-primary-soft)';

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-kj-bg items-center justify-between">
      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center max-w-sm mx-auto w-full">

        {/* Hero illustration — glow + dashed ring + icon disc + code */}
        <div className="relative flex flex-col items-center mb-8">
          {/* Radial glow */}
          <div className="absolute w-[210px] h-[210px] rounded-full pointer-events-none animate-[kjpulse_3.4s_ease-in-out_infinite]"
            style={{ background: `radial-gradient(circle, ${toneSoftVar} 0%, transparent 68%)`, filter: 'blur(4px)', top: -8 }} />
          {/* Dashed ring SVG */}
          <svg width="150" height="150" viewBox="0 0 150 150" className="relative animate-[kjbobsm_3.8s_ease-in-out_infinite]">
            <circle cx="75" cy="75" r="62" fill="none" stroke="var(--kj-line)" strokeWidth="1.5" />
            <circle cx="75" cy="75" r="62" fill="none" stroke={toneVar} strokeWidth="2.4"
              strokeLinecap="round" strokeDasharray="3 25" opacity="0.85"
              style={{ animation: 'kjdash 1.1s linear infinite' }} />
            <circle cx="75" cy="13" r="4.5" fill={toneVar} />
          </svg>
          {/* Icon disc */}
          <div className="absolute dc-card kj-glass rounded-[22px] flex items-center justify-center" style={{ width: 72, height: 72, top: 39, color: toneVar }}>
            {icon}
          </div>
          {/* Status code pill */}
          {code && (
            <div className="mt-4 font-sans font-black text-[13px] tracking-[3px] px-3.5 py-1.5 rounded-full" style={{ color: toneVar, background: toneSoftVar }}>
              {code}
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="font-bengali font-bold text-[22px] md:text-[26px] text-kj-text leading-snug mb-3 text-balance">
          {lbl(titleEn, titleBn)}
        </h1>

        {/* Description */}
        <p className="font-bengali text-[13px] text-kj-text-dim leading-[1.65] mb-5 text-pretty max-w-[280px] mx-auto">
          {lbl(descEn, descBn)}
        </p>

        {/* Chips */}
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {chips.map((chip, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-[12px] font-semibold font-bengali border border-kj-line bg-kj-chip-bg text-kj-chip-text">
                {lbl(chip.en, chip.bn)}
              </span>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-[9px] w-full">
          <button
            onClick={onPrimary}
            className="w-full flex items-center justify-center gap-2.5 py-[14px] px-[18px] rounded-[14px] font-bengali font-bold text-[15px] transition-all hover:-translate-y-px active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))`, color: 'var(--kj-primary-ink)', boxShadow: `0 8px 22px -12px var(--kj-primary)` }}
          >
            {primaryIcon}
            <span>{lbl(primaryLabel.en, primaryLabel.bn)}</span>
          </button>
          {secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              className="w-full flex items-center justify-center gap-2.5 py-[13px] px-[18px] rounded-[14px] font-bengali font-semibold text-[14.5px] bg-kj-panel-muted border border-kj-line text-kj-text transition-colors hover:bg-kj-chip-bg active:scale-[0.98]"
            >
              {secondaryIcon}
              <span>{lbl(secondaryLabel.en, secondaryLabel.bn)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      {(footerEn || footerBn) && (
        <div className="w-full border-t border-kj-line py-4 px-6 text-center">
          <p className="font-sans text-[12px] text-kj-text-dim">
            {lbl(footerEn || '', footerBn || '')}
            {footerLinkEn && onFooterLink && (
              <> <button onClick={onFooterLink} className="font-semibold" style={{ color: 'var(--kj-primary)' }}>
                {lbl(footerLinkEn, footerLinkBn || footerLinkEn)}
              </button></>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemStateScreen;
