import React, { useEffect, useRef } from 'react';
import { Tokens, Lang, SANS, T } from '../tokens';

type AdKind = 'leaderboard' | 'mid-rect' | 'mob-banner' | 'anchor';

const DIMS: Record<AdKind, { w: number; h: number; format: string; slot: string }> = {
  leaderboard:  { w: 728, h: 90,  format: 'horizontal', slot: '7294303750' },
  'mid-rect':   { w: 300, h: 250, format: 'rectangle',  slot: '7294303750' },
  'mob-banner': { w: 320, h: 100, format: 'horizontal', slot: '7294303750' },
  anchor:       { w: 320, h: 50,  format: 'horizontal', slot: '7294303750' },
};

function RealAd({ format, slot }: { format: string; slot: string }) {
  const insRef = useRef<HTMLElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    pushed.current = false;
    const tryPush = () => {
      const ins = insRef.current;
      if (!ins || pushed.current) return;
      const status = ins.getAttribute('data-adsbygoogle-status');
      if (status === 'done' || status === 'filled') return;
      if (typeof (window as any).adsbygoogle === 'undefined') {
        setTimeout(tryPush, 2000);
        return;
      }
      pushed.current = true;
      try { ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({}); } catch { pushed.current = false; }
    };
    tryPush();
  }, [slot]);

  return (
    <ins
      ref={insRef as any}
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', minWidth: 0 }}
      data-ad-client="ca-pub-8425219156685369"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

export function AdSlot({
  tk,
  lang,
  kind = 'leaderboard',
  sticky,
}: {
  tk: Tokens;
  lang: Lang;
  kind?: AdKind;
  sticky?: boolean;
}) {
  const { w, h, format, slot } = DIMS[kind];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: w,
        background: tk.panelMuted,
        border: `1px solid ${tk.line}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxSizing: 'border-box',
        position: sticky ? 'sticky' : 'relative',
        bottom: sticky ? 0 : undefined,
        zIndex: sticky ? 10 : undefined,
        flexShrink: 0,
        margin: '0 auto',
      }}
    >
      {/* Sponsored label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', borderBottom: `1px solid ${tk.line}` }}>
        <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: tk.textFaint }}>
          {T(lang, 'বিজ্ঞাপন', 'Sponsored')}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 9, color: tk.textFaint, opacity: 0.6 }}>Google AdSense</span>
      </div>
      {/* Real ad container */}
      <div style={{ minHeight: h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RealAd format={format} slot={slot} />
      </div>
    </div>
  );
}
