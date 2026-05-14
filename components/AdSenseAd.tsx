import React, { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  responsive?: boolean;
  layoutKey?: string;
  native?: boolean; // accepted for API compat, no visual effect
}

const isValidSlot = (slot: string) => slot === 'auto' || /^\d{9,11}$/.test(slot);
const DEFAULT_SLOT = '7294303750';

const AdSenseAd: React.FC<AdSenseAdProps> = React.memo(({
  adSlot,
  adFormat = 'auto',
  className = '',
  responsive = true,
  layoutKey,
}) => {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => { pushed.current = false; }, [adSlot]);

  useEffect(() => {
    if (!navigator.onLine) return;
    if (!isValidSlot(adSlot)) return;
    const ins = insRef.current;
    if (!ins || pushed.current) return;
    const status = ins.getAttribute('data-adsbygoogle-status');
    if (status === 'done' || status === 'filled') return;
    pushed.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      pushed.current = false;
    }
  }, [adSlot]);

  if (!navigator.onLine || !isValidSlot(adSlot)) return null;

  return (
    <div
      className={`w-full shrink-0 overflow-x-hidden ${className}`}
      style={{ minHeight: 0 }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minWidth: 0 }}
        data-ad-client="ca-pub-8425219156685369"
        data-ad-slot={adSlot === 'auto' ? DEFAULT_SLOT : adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
});

export default AdSenseAd;
