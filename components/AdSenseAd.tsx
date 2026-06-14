import React, { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  responsive?: boolean;
  layoutKey?: string;
  native?: boolean; // accepted for API compat, no visual effect
  style?: React.CSSProperties;
}

const isValidSlot = (slot: string) => slot === 'auto' || /^\d{9,11}$/.test(slot);
const DEFAULT_SLOT = '7294303750';

const AdSenseAd: React.FC<AdSenseAdProps> = React.memo(({
  adSlot,
  adFormat = 'auto',
  className = '',
  responsive = true,
  layoutKey,
  style,
}) => {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tryPush = () => {
    if (!navigator.onLine) return;
    if (!isValidSlot(adSlot)) return;
    const ins = insRef.current;
    if (!ins || pushed.current) return;
    const status = ins.getAttribute('data-adsbygoogle-status');
    if (status === 'done' || status === 'filled') return;

    // If the AdSense script hasn't loaded yet, retry after 2 s
    if (typeof (window as any).adsbygoogle === 'undefined') {
      if (!retryTimer.current) {
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          tryPush();
        }, 2000);
      }
      return;
    }

    pushed.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      pushed.current = false;
    }
  };

  useEffect(() => {
    pushed.current = false;
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
  }, [adSlot]);

  useEffect(() => {
    tryPush();

    // Re-try when the browser comes back online (PWA offline → online transition)
    const handleOnline = () => { pushed.current = false; tryPush(); };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [adSlot]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isValidSlot(adSlot)) return null;

  return (
    <div
      className={`w-full shrink-0 overflow-hidden ${className}`}
      style={{ minHeight: 0, maxHeight: style?.maxHeight, height: style?.height, ...style }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minWidth: 0, maxHeight: style?.maxHeight || 'none', overflow: 'hidden' }}
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
