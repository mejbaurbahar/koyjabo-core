import React from 'react';
import AdSenseAd from './AdSenseAd';

interface SponsoredAdSlotProps {
  language: 'en' | 'bn';
  size?: '728x90' | '300x250';
  className?: string;
}

const SponsoredAdSlot: React.FC<SponsoredAdSlotProps> = ({
  language,
  size = '728x90',
  className = '',
}) => {
  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const isLeaderboard = size === '728x90';

  return (
    <div className={`flex justify-center my-6 md:my-8 ${className}`}>
      <div className="w-full max-w-[728px] rounded-2xl border border-kj-line/60 bg-kj-panel-muted/30 p-3 adsense-container">
        <div className="flex flex-col items-center mb-2">
          <span className="text-[9px] font-bold text-kj-text-faint uppercase tracking-widest">
            {lbl('Sponsored', 'বিজ্ঞাপন')}
          </span>
          <span className="text-[10px] text-kj-text-faint">
            Google AdSense · {size.replace('x', ' × ')}
          </span>
        </div>
        <AdSenseAd
          adSlot="auto"
          adFormat={isLeaderboard ? 'horizontal' : 'rectangle'}
          responsive={isLeaderboard}
          className={`w-full mx-auto ${isLeaderboard ? 'min-h-[90px]' : 'min-h-[250px] max-w-[300px]'}`}
        />
      </div>
    </div>
  );
};

export default SponsoredAdSlot;
