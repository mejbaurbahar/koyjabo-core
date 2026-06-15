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
  const slotClass = isLeaderboard ? 'adsense-slot-leaderboard' : 'adsense-slot-rectangle';
  const adHeight = isLeaderboard ? 90 : 250;
  const [filled, setFilled] = useState(false);

  return (
    <div
      className={`adsense-wrapper flex justify-center shrink-0 ${compact ? 'my-2' : 'my-6 md:my-8'} ${className} ${filled ? '' : 'h-0 overflow-hidden'}`}
    >
      <div className={`w-full max-w-[728px] rounded-xl border border-kj-line/60 bg-kj-panel-muted/30 p-2 adsense-container ${slotClass}`}>
        {filled && (
          <div className="adsense-label flex items-center justify-center mb-1">
            <span className="text-[8px] font-medium text-kj-text-faint uppercase tracking-widest opacity-50">
              {lbl('Ad', 'বিজ্ঞাপন')}
            </span>
          </div>
        )}
        <div
          className="w-full mx-auto flex items-center justify-center"
          style={{ height: filled ? adHeight : 0, maxHeight: adHeight, overflow: 'hidden', contain: 'strict' }}
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
