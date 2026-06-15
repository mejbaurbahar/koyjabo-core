import React, { useState } from 'react';
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
  const [filled, setFilled] = useState(false);

  return (
    // Outer wrapper: zero size when not filled (no layout impact at all)
    <div
      className={`adsense-wrapper ${compact ? 'my-3' : 'my-5 md:my-6'} ${className}`}
      style={{ display: filled ? 'block' : 'none' }}
    >
      {/* Card wrapper — matches dc-card style so ad looks like content */}
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
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
          className="w-full overflow-hidden"
          style={{ height: adHeight, contain: 'strict' }}
        >
          <AdSenseAd
            adSlot="auto"
            adFormat={isLeaderboard ? 'horizontal' : 'rectangle'}
            responsive={isLeaderboard}
            className="w-full max-w-full"
            onFilled={setFilled}
          />
        </div>
      </div>
    </div>
  );
};

export default SponsoredAdSlot;
