import React, { useEffect, useRef, useState } from 'react';
import { Tokens, Lang, SANS, BEN } from '../tokens';

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

    let pollId = 0;
    let resolved = false;
    const resolve = (filled: boolean) => {
      if (resolved) return;
      resolved = true;
      onFillResult(filled);
    };

    const isFilled = () => {
      const iframe = ins.querySelector('iframe');
      return !!(iframe && iframe.src && !iframe.src.startsWith('about:') && iframe.src.length > 10);
    };

    const checkFill = () => {
      const status = ins.getAttribute('data-adsbygoogle-status');
      if (status === 'unfilled') { resolve(false); return true; }
      if (isFilled()) { resolve(true); return true; }
      return false;
    };

    // Poll every 1s for up to 20s — gives AdSense time to recover from transient
    // network/CSP errors and inject iframe even when initial push appears to fail
    const startPolling = () => {
      const startedAt = Date.now();
      const tick = () => {
        if (checkFill()) return;
        if (Date.now() - startedAt > 20000) { resolve(false); return; }
        pollId = window.setTimeout(tick, 1000);
      };
      tick();
    };

    const doPush = () => {
      if (pushed.current) return;
      const status = ins.getAttribute('data-adsbygoogle-status');
      if (status === 'done' || status === 'filled' || status === 'unfilled') {
        if (checkFill()) return;
        startPolling();
        return;
      }

      const asg = (window as any).adsbygoogle;
      if (!asg || typeof asg.push !== 'function') {
        timerRef.current = window.setTimeout(doPush, 500);
        return;
      }

      pushed.current = true;
      try { asg.push({}); }
      catch { pushed.current = false; resolve(false); return; }

      startPolling();
    };

    const blockTimeout = window.setTimeout(() => {
      if (!pushed.current) resolve(false);
    }, 25000);

    if ('IntersectionObserver' in window) {
      const scroller = ins.closest('[data-app-scroller]') as Element | null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) { observer.disconnect(); doPush(); }
        },
        { root: scroller || null, rootMargin: '400px 0px' }
      );
      observer.observe(ins);
      return () => {
        observer.disconnect();
        clearTimeout(timerRef.current);
        clearTimeout(blockTimeout);
        clearTimeout(pollId);
      };
    }
    doPush();
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(blockTimeout);
      clearTimeout(pollId);
    };
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

  // Reserve height during detection (filled === null) so AdSense sees valid slot
  // dimensions and actually fills. Collapsing to 0 before push was suppressing fills.
  const reservedHeight = filled === null ? h : (filled === true ? h : 0);

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
        minHeight: reservedHeight,
        visibility: filled === true ? 'visible' : 'hidden',
        pointerEvents: filled === true ? 'auto' : 'none',
      }}
    >
      <RealAd format={format} slot={slot} layout={layout} onFillResult={setFilled} />
    </div>
  );
}

// ─── NativeAdCard ────────────────────────────────────────────────────────────
// Panel-styled ad card: matches feature cards (tk.panel + tk.line + radius 18).
// Renders a subtle "Sponsored" pill (top-right) per AdSense policy.
// Collapses to null when unfilled — no empty box, no layout gap.
// Use in empty content states (no favorites/history/results) and in
// content columns where a bare AdSense iframe would clash with UI cards.
// ─── AdCluster ────────────────────────────────────────────────────────────────
// Renders a diverse block of N NativeAdCards. Used to top up pages that fall
// below the site-wide floor of 5 ad slots. Kinds rotate so each card fills a
// distinct AdSense unit (multiplex + in-article + leaderboard + mid-rect).
export function AdCluster({
  tk,
  lang,
  count,
  isMobile,
}: {
  tk: Tokens;
  lang: Lang;
  count: number;
  isMobile: boolean;
}) {
  if (count <= 0) return null;
  const bannerKind: AdKind = isMobile ? 'mob-banner' : 'leaderboard';
  const midKind: AdKind = isMobile ? 'mob-banner' : 'mid-rect';
  const preset: Array<{
    kind: AdKind;
    titleBn: string;
    titleEn: string;
    subBn?: string;
    subEn?: string;
    icon: string;
    compact?: boolean;
  }> = [
    { kind: 'in-article', titleBn: 'সংশ্লিষ্ট বিষয়বস্তু', titleEn: 'Related content', icon: '📰' },
    { kind: 'multiplex', titleBn: 'আরও দেখুন', titleEn: 'More like this', subBn: 'ভ্রমণ ও পরিবহন', subEn: 'Travel & transport', icon: '🧭' },
    { kind: bannerKind, titleBn: 'পার্টনার অফার', titleEn: 'Partner offers', icon: '🎯' },
    { kind: midKind, titleBn: 'আপনার জন্য প্রস্তাবিত', titleEn: 'Recommended for you', subBn: 'ট্রিপ ও ডিল', subEn: 'Trips & deals', icon: '🎁', compact: true },
    { kind: 'in-article', titleBn: 'ভ্রমণ ও যাত্রা টিপস', titleEn: 'Travel & journey tips', icon: '💡' },
  ];
  const slots = preset.slice(0, Math.min(count, preset.length));
  return (
    <>
      {slots.map((s, i) => (
        <NativeAdCard
          key={`ad-cluster-${i}`}
          tk={tk}
          lang={lang}
          kind={s.kind}
          title={lang === 'bn' ? s.titleBn : s.titleEn}
          subtitle={s.subBn ? (lang === 'bn' ? s.subBn : s.subEn) : undefined}
          icon={s.icon}
          compact={s.compact}
        />
      ))}
    </>
  );
}

export function NativeAdCard({
  tk,
  lang,
  kind = 'in-article',
  title,
  subtitle,
  icon,
  compact,
}: {
  tk: Tokens;
  lang: Lang;
  kind?: AdKind;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  compact?: boolean;
}) {
  const { w, h, format, slot, layout } = DIMS[kind];
  const [filled, setFilled] = useState<boolean | null>(null);
  const font = lang === 'bn' ? BEN : SANS;

  // Detecting: reserve height so AdSense measures a real slot (transparent — no ghost dark box).
  // Unfilled: collapse entirely — no ghost card in the layout.
  if (filled === false) return null;

  const reservedHeight = filled === null ? h : h;
  const padY = compact ? 10 : 14;
  const padX = compact ? 12 : 16;
  const isFilled = filled === true;

  return (
    <div
      style={{
        background: isFilled ? tk.panel : 'transparent',
        border: isFilled ? `1px solid ${tk.line}` : 'none',
        borderRadius: 18,
        padding: isFilled ? `${padY}px ${padX}px` : 0,
        boxShadow: isFilled ? tk.shadow : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        overflow: 'hidden',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
        visibility: isFilled ? 'visible' : 'hidden',
        pointerEvents: isFilled ? 'auto' : 'none',
      }}
    >
      {/* Header row: only shown when filled — don't show floating title with no ad */}
      {title && isFilled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, minHeight: 18 }}>
          {icon && (
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: tk.primarySoft,
                color: tk.primary,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 14,
              }}
            >
              {icon}
            </span>
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: font,
                fontSize: 13,
                fontWeight: 700,
                color: tk.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  color: tk.textFaint,
                  marginTop: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ad body — reserve height while detecting so AdSense can fill */}
      <div
        style={{
          width: '100%',
          minHeight: reservedHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 10,
        }}
      >
        <div style={{ width: '100%', maxWidth: w }}>
          <RealAd format={format} slot={slot} layout={layout} onFillResult={setFilled} />
        </div>
      </div>
    </div>
  );
}
