import React, { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  responsive?: boolean;
  layoutKey?: string;
  native?: boolean;
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
  native = false,
}) => {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    pushed.current = false;
  }, [adSlot]);

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

  // Do not render if offline or slot ID is not valid
  if (!navigator.onLine || !isValidSlot(adSlot)) return null;

  const insEl = (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', maxWidth: '100%' }}
      data-ad-client="ca-pub-8425219156685369"
      data-ad-slot={adSlot === 'auto' ? DEFAULT_SLOT : adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={responsive ? 'true' : 'false'}
      {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
    />
  );

  if (native) {
    return (
      <div className={`bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm ${className}`}>
        <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/15 border-b border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Sponsored</span>
          </div>
          <span className="text-[9px] text-gray-400 dark:text-gray-500">Ad</span>
        </div>
        <div className="p-1 w-full flex justify-center overflow-x-hidden">
          {insEl}
        </div>
      </div>
    );
  }

  return (
    <div className={`adsense-container w-full flex justify-center max-w-full overflow-x-hidden ${className}`}>
      {insEl}
    </div>
  );
});

export default AdSenseAd;
