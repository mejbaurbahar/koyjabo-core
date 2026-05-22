import React from 'react';
import AdSenseAd from './AdSenseAd';

// Sticky banner ad that sits just above the mobile bottom nav bar.
// Positions at bottom: nav-height + safe-area so it never overlaps the nav.
const StickyBottomBannerAd: React.FC = () => (
  <div
    className="fixed left-0 right-0 z-40 md:hidden bg-kj-panel border-t border-kj-line shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
    style={{ bottom: 'calc(4.375rem + env(safe-area-inset-bottom, 0px))' }}
    aria-hidden="true"
  >
    <AdSenseAd adSlot="auto" adFormat="auto" responsive={true} />
  </div>
);

export default StickyBottomBannerAd;
