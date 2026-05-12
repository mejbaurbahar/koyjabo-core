import React from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  responsive?: boolean;
  layoutKey?: string;
  native?: boolean;
}

// Ads disabled app-wide — this stub lets imports compile without errors.
// To re-enable: restore the full implementation from git history.
const AdSenseAd: React.FC<AdSenseAdProps> = (_props) => null;

export default AdSenseAd;
