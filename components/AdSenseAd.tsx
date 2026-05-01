import React from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  responsive?: boolean;
  layoutKey?: string;
}

const AdSenseAd: React.FC<AdSenseAdProps> = () => {
  // Temporarily disabled globally because it breaks the UI flexbox/scroll layouts.
  return null;
};

export default AdSenseAd;
