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
const isValidSlot = (slot: string) => slot === 'auto' || /^\d{9,11}$/.test(slot);
const DEFAULT_SLOT = '7294303750'; // From intercity/index.html

const AdSenseAd: React.FC<AdSenseAdProps> = React.memo(({
  adSlot,
  adFormat = 'auto',
  className = '',
  responsive = true,
  layoutKey,
}) => {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    // Check if device is mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!navigator.onLine) return;
    if (!isValidSlot(adSlot)) return;
    
    // Check if there are un-filled adsbygoogle elements
    const unFilledAds = document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status="done"])');
    
    if (pushed.current || unFilledAds.length === 0) return;
    pushed.current = true;
    
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [adSlot]);

  // Do not render if offline or slot ID is not valid
  if (!navigator.onLine || !isValidSlot(adSlot)) return null;

  return (
    <div className={`adsense-container w-full flex justify-center overflow-hidden ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '100px', width: '100%' }}
        data-ad-client="ca-pub-8425219156685369"
        data-ad-slot={adSlot === 'auto' ? DEFAULT_SLOT : adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
});

export default AdSenseAd;
