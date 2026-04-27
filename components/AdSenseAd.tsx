import React, { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  responsive?: boolean;
  layoutKey?: string;
}

// Valid slot IDs are 9-10 digit numeric strings.
// Passing "auto" as a slot ID is invalid; those placements rely on Google Auto Ads
// (enabled from the AdSense dashboard) injecting ads automatically.
const isValidSlot = (slot: string) => /^\d{9,11}$/.test(slot);

const AdSenseAd: React.FC<AdSenseAdProps> = ({
  adSlot,
  adFormat = 'auto',
  className = '',
  responsive = true,
  layoutKey,
}) => {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!navigator.onLine) return;
    if (!isValidSlot(adSlot)) return;
    if (pushed.current) return;
    pushed.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // ad blocker or script not loaded
    }
  }, [adSlot]);

  // Do not render if offline or slot ID is not valid
  if (!navigator.onLine || !isValidSlot(adSlot)) return null;

  return (
    <div className={`adsense-container overflow-hidden ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6933713424631305"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
};

export default AdSenseAd;
