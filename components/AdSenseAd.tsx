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

const AdSenseAd: React.FC<AdSenseAdProps> = ({
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
    if (!navigator.onLine || isMobile) return;
    if (!isValidSlot(adSlot)) return;
    if (pushed.current) return;
    pushed.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // ad blocker or script not loaded
    }
  }, [adSlot, isMobile]);

  // Do not render if offline, slot ID is not valid, or user is on mobile
  if (!navigator.onLine || !isValidSlot(adSlot) || isMobile) return null;

  return (
    <div className={`adsense-container hidden md:flex w-full justify-center flex-shrink-0 overflow-hidden ${className}`} style={{ minHeight: '90px', maxHeight: '100px' }}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '100%', maxWidth: '970px', height: '90px' }}
        data-ad-client="ca-pub-8425219156685369"
        data-ad-slot={adSlot === 'auto' ? DEFAULT_SLOT : adSlot}
        // Force fixed horizontal banner to prevent layout blowout
        // Removed data-ad-format="auto" and data-full-width-responsive
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
};

export default AdSenseAd;
