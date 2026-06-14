import React from 'react';
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
  const slotClass = isLeaderboard ? 'adsense-slot-leaderboard' : 'adsense-slot-rectangle';
  const adHeight = isLeaderboard ? 90 : 250;

  return (
    <div className={`adsense-wrapper flex justify-center shrink-0 ${compact ? 'my-2' : 'my-6 md:my-8'} ${className}`}>
      <div className={`w-full max-w-[728px] rounded-xl border border-kj-line/60 bg-kj-panel-muted/30 p-2 adsense-container ${slotClass}`}>
        <div className="adsense-label flex items-center justify-center gap-2 mb-1.5">
          <span className="text-[9px] font-bold text-kj-text-faint uppercase tracking-widest">
            {lbl('Sponsored', 'বিজ্ঞাপন')}
          </span>
          <span className="text-[9px] text-kj-text-faint">
            Google AdSense · {size.replace('x', ' × ')}
          </span>
        </div>
        <div
          className="w-full mx-auto flex items-center justify-center"
          style={{ height: adHeight, maxHeight: adHeight, overflow: 'hidden', contain: 'strict' }}
        >
          <AdSenseAd
            adSlot="auto"
            adFormat={isLeaderboard ? 'horizontal' : 'rectangle'}
            responsive={isLeaderboard}
            className="w-full max-w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default SponsoredAdSlot;
