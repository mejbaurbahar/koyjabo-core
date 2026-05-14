import React, { useEffect, useRef } from 'react';

const AdUnit: React.FC<{ className?: string }> = ({ className = '' }) => {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!navigator.onLine) return;
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
  }, []);

  if (!navigator.onLine) return null;

  return (
    <div className={`w-full shrink-0 overflow-x-hidden ${className}`} style={{ minHeight: 0 }}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minWidth: 0 }}
        data-ad-client="ca-pub-8425219156685369"
        data-ad-slot="7294303750"
        data-ad-format="fluid"
        data-full-width-responsive="true"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
      />
    </div>
  );
};

export default AdUnit;
