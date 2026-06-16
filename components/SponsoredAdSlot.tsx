import React, { useEffect, useRef } from 'react';
import AdSenseAd from './AdSenseAd';

interface SponsoredAdSlotProps {
  language: 'en' | 'bn';
  size?: '728x90' | '300x250';
  className?: string;
  compact?: boolean;
}

const SponsoredAdSlot: React.FC<SponsoredAdSlotProps> = ({
  language,
  size = '728x90',
  className = '',
  compact = false,
}) => {
  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const isLeaderboard = size === '728x90';
  const adHeight = isLeaderboard ? 90 : 250;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setImportant = (el: HTMLElement | null, prop: string, value: string) => {
      if (!el) return;
      if (el.style.getPropertyValue(prop) === value && el.style.getPropertyPriority(prop) === 'important') return;
      el.style.setProperty(prop, value, 'important');
    };

    const applyReservedSize = () => {
      setImportant(wrapperRef.current, 'display', 'block');
      setImportant(cardRef.current, 'min-height', `${adHeight + 30}px`);
      setImportant(shellRef.current, 'height', `${adHeight}px`);
      setImportant(shellRef.current, 'min-height', `${adHeight}px`);
      setImportant(shellRef.current, 'max-height', `${adHeight}px`);
    };

    applyReservedSize();
    const observer = new MutationObserver(applyReservedSize);
    [wrapperRef.current, cardRef.current, shellRef.current].forEach((el) => {
      if (el) observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    });
    return () => observer.disconnect();
  }, [adHeight]);

  return (
    <div
      ref={wrapperRef}
      className={`adsense-wrapper kj-ad-reserved w-full ${compact ? 'my-3' : 'my-5 md:my-6'} ${className}`}
    >
      {/* Card wrapper — matches dc-card style so ad looks like content */}
      <div
        ref={cardRef}
        className="kj-ad-card w-full rounded-2xl overflow-hidden"
        style={{
          ['--kj-ad-card-height' as string]: `${adHeight + 30}px`,
          ['--kj-ad-height' as string]: `${adHeight}px`,
          background: 'var(--kj-panel)',
          border: '1px solid var(--kj-line)',
          boxShadow: 'var(--kj-shadow)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          maxWidth: isLeaderboard ? 728 : 400,
          margin: '0 auto',
        }}
      >
        {/* Sponsored label — minimal, blends in */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <span
            className="text-[9px] font-bold uppercase tracking-[1.2px]"
            style={{ color: 'var(--kj-text-faint)', opacity: 0.55 }}
          >
            {lbl('Sponsored', 'স্পনসরড')}
          </span>
          <span
            className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--kj-chip-bg)', color: 'var(--kj-text-faint)', opacity: 0.5 }}
          >
            Ad
          </span>
        </div>

        {/* Single ad instance — always mounted, card shows/hides via parent display */}
        <div
          ref={shellRef}
          className="kj-ad-shell relative w-full overflow-hidden"
          style={{ height: adHeight, minHeight: adHeight, maxHeight: adHeight, contain: 'strict' }}
        >
          <div
            className="absolute inset-0 flex items-center justify-between gap-3 px-4 pointer-events-none"
            style={{
              border: '1px dashed var(--kj-line)',
              background: 'var(--kj-panel-muted)',
              color: 'var(--kj-text-faint)',
              opacity: 0.65,
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[1.2px]">
              {lbl('Google AdSense', 'গুগল অ্যাডসেন্স')} · {size}
            </span>
            <span className="text-[10px] font-semibold">
              {lbl('reserved', 'রিজার্ভড')}
            </span>
          </div>
          <AdSenseAd
            adSlot="auto"
            adFormat={isLeaderboard ? 'horizontal' : 'rectangle'}
            responsive={isLeaderboard}
            className="relative z-10 w-full max-w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default SponsoredAdSlot;
