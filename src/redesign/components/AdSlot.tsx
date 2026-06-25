import React, { useEffect, useRef, useState } from 'react';
import { Tokens, Lang } from '../tokens';

type AdKind = 'leaderboard' | 'mid-rect' | 'mob-banner' | 'anchor' | 'in-article' | 'multiplex';

// Ad unit slots — ca-pub-8425219156685369
// Display ad (koyjabo):    3797668998  — all banner/rect placements
// Multiplex ad:            2707948607  — native grid / related content
// In-article ad:           9568870428  — fluid in-article between content
const DIMS: Record<AdKind, { w: number; h: number; format: string; slot: string; layout?: string }> = {
  leaderboard:  { w: 728, h: 90,  format: 'auto',        slot: '3797668998' },
  'mid-rect':   { w: 300, h: 250, format: 'auto',        slot: '3797668998' },
  'mob-banner': { w: 320, h: 100, format: 'auto',        slot: '3797668998' },
  anchor:       { w: 320, h: 50,  format: 'auto',        slot: '3797668998' },
  'in-article': { w: 728, h: 280, format: 'fluid',       slot: '9568870428', layout: 'in-article' },
  multiplex:    { w: 728, h: 280, format: 'autorelaxed', slot: '2707948607' },
};

function RealAd({
  format,
  slot,
  layout,
  onFillResult,
}: {
  format: string;
  slot: string;
  layout?: string;
  onFillResult: (filled: boolean) => void;
}) {
  const insRef = useRef<HTMLElement>(null);
  const pushed = useRef(false);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    pushed.current = false;
    const ins = insRef.current;
    if (!ins) return;

    const checkFill = () => {
      const status = ins.getAttribute('data-adsbygoogle-status');
      // Explicitly unfilled by AdSense → collapse
      if (status === 'unfilled') { onFillResult(false); return; }
      // Only count as filled when iframe has actual rendered content
      // (AdSense sets height on ins even when unfilled, so height alone is unreliable)
      const iframe = ins.querySelector('iframe');
      if (iframe && iframe.offsetHeight > 5) { onFillResult(true); return; }
      // No iframe yet — ad still loading, let final timeout decide
    };

    const doPush = () => {
      if (pushed.current) return;
      const status = ins.getAttribute('data-adsbygoogle-status');
      if (status === 'done' || status === 'filled') { checkFill(); return; }

      const asg = (window as any).adsbygoogle;
      if (!asg || typeof asg.push !== 'function') {
        timerRef.current = window.setTimeout(doPush, 1000);
        return;
      }

      pushed.current = true;
      try { asg.push({}); }
      catch { pushed.current = false; onFillResult(false); return; }

      timerRef.current = window.setTimeout(() => {
        checkFill(); // resolves true (iframe present) or false (unfilled); otherwise waits
        timerRef.current = window.setTimeout(() => {
          // Final decision at 7s total — require real iframe content
          const iframe = ins.querySelector('iframe');
          onFillResult(!!(iframe && iframe.offsetHeight > 5));
        }, 3500);
      }, 3500);
    };

    const blockTimeout = window.setTimeout(() => {
      if (!pushed.current) onFillResult(false);
    }, 10000);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) { observer.disconnect(); doPush(); }
        },
        { rootMargin: '200px 0px' }
      );
      observer.observe(ins);
      return () => {
        observer.disconnect();
        clearTimeout(timerRef.current);
        clearTimeout(blockTimeout);
      };
    }
    doPush();
    return () => { clearTimeout(timerRef.current); clearTimeout(blockTimeout); };
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
      {...(layout ? { 'data-ad-layout': layout } : {})}
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
  const { w, h, format, slot, layout } = DIMS[kind];
  const [filled, setFilled] = useState<boolean | null>(null);

  // Collapsed when null (detecting) or false (unfilled) — no empty box, no house ad
  if (filled === false) return null;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: w,
        borderRadius: 12,
        overflow: 'hidden',
        boxSizing: 'border-box',
        position: sticky ? 'sticky' : 'relative',
        bottom: sticky ? 0 : undefined,
        zIndex: sticky ? 10 : undefined,
        flexShrink: 0,
        margin: '0 auto',
        minHeight: filled === true ? h : 0,
      }}
    >
      <RealAd format={format} slot={slot} layout={layout} onFillResult={setFilled} />
    </div>
  );
}
