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

  // When not filled, render nothing visible — no border, no background, no height
  return (
    <div
      className={`adsense-wrapper flex justify-center shrink-0 ${compact ? 'my-2' : 'my-4 md:my-6'} ${className}`}
      style={{ display: filled ? 'flex' : 'none' }}
    >
      <div className="w-full max-w-[728px]">
        {filled && (
          <div className="flex items-center justify-center mb-1">
            <span className="text-[8px] font-medium text-kj-text-faint uppercase tracking-widest opacity-40">
              {lbl('Ad', 'বিজ্ঞাপন')}
            </span>
          </div>
        )}
        <div
          className="w-full mx-auto overflow-hidden rounded-xl"
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
