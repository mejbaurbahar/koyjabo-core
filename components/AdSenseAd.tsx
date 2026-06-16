import React, { useEffect, useRef, useState } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  responsive?: boolean;
  layoutKey?: string;
  native?: boolean;
  style?: React.CSSProperties;
  onFilled?: (filled: boolean) => void;
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
  onFilled,
}) => {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tryPush = () => {
    if (!navigator.onLine) return;
    if (!isValidSlot(adSlot)) return;
    const ins = insRef.current;
    if (!ins || pushed.current) return;
    const status = ins.getAttribute('data-adsbygoogle-status');
    if (status === 'done' || status === 'filled') return;

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

    // Check if ad actually filled — use only the status attribute, not height
    // (height can be >0 from a blank skeleton; status='filled' means real ad content)
    if (onFilled) {
      const check = (delay: number) => {
        checkTimer.current = setTimeout(() => {
          const ins = insRef.current;
          if (!ins) return;
          const status = ins.getAttribute('data-adsbygoogle-status');
          if (status === 'filled') { onFilled(true); return; }
          // Google sometimes sets 'done' without 'filled' for non-filled slots
          if (status === 'done') { onFilled(false); return; }
          // Still pending — check once more after 2s
          if (delay < 8000) check(2000);
        }, delay);
      };
      check(3000);
    }
  };

  useEffect(() => {
    pushed.current = false;
    if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }
    if (checkTimer.current) { clearTimeout(checkTimer.current); checkTimer.current = null; }
  }, [adSlot]);

  useEffect(() => {
    tryPush();

    const handleOnline = () => { pushed.current = false; tryPush(); };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (checkTimer.current) clearTimeout(checkTimer.current);
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
