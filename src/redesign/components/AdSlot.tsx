import React, { useEffect, useRef, useState } from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';

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

// House ads rotate when AdSense is blocked or unfilled
const HOUSE_ADS = [
  {
    icon: '🗺️',
    headline: 'Intercity Travel Planner',
    headlineBn: 'আন্তঃজেলা ভ্রমণ পরিকল্পনা করুন',
    sub: 'Compare bus, train, launch & flights across Bangladesh',
    subBn: 'বাস, ট্রেন, লঞ্চ ও বিমান তুলনা করুন',
    cta: 'Explore →',
    ctaBn: 'এক্সপ্লোর করুন →',
    bg: 'linear-gradient(135deg,#064e3b,#065f46)',
    accent: '#10b981',
    href: '/intercity',
  },
  {
    icon: '🏖️',
    headline: "Cox's Bazar Tour Package",
    headlineBn: 'কক্সবাজার ট্যুর প্যাকেজ',
    sub: '3N/4D from ৳8,500 · Book via KoyJabo partners',
    subBn: '৩ রাত ৪ দিন ৳৮,৫০০ থেকে · KoyJabo পার্টনারে বুক করুন',
    cta: 'Coming soon →',
    ctaBn: 'শীঘ্রই আসছে →',
    bg: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)',
    accent: '#60a5fa',
    href: '/intercity',
  },
  {
    icon: '🚌',
    headline: 'Find Your Bus Route',
    headlineBn: 'আপনার বাস রুট খুঁজুন',
    sub: '200+ Dhaka routes · Offline · Free forever',
    subBn: '২০০+ ঢাকা রুট · অফলাইন · চিরতরে বিনামূল্যে',
    cta: 'Search now →',
    ctaBn: 'এখনই খুঁজুন →',
    bg: 'linear-gradient(135deg,#312e81,#5b21b6)',
    accent: '#a78bfa',
    href: '/',
  },
  {
    icon: '💼',
    headline: 'KoyJabo API for Developers',
    headlineBn: 'ডেভেলপারদের জন্য KoyJabo API',
    sub: 'Bus, train & intercity data API · ৳300/month',
    subBn: 'বাস, ট্রেন ও আন্তঃজেলা ডেটা API · ৳৩০০/মাস',
    cta: 'Learn more →',
    ctaBn: 'আরো জানুন →',
    bg: 'linear-gradient(135deg,#7c2d12,#c2410c)',
    accent: '#fb923c',
    href: '/api-access',
  },
];

let houseAdIndex = 0;

function HouseAd({
  tk,
  lang,
  h,
  kind,
}: {
  tk: Tokens;
  lang: Lang;
  h: number;
  kind: AdKind;
}) {
  const ad = HOUSE_ADS[houseAdIndex % HOUSE_ADS.length];
  houseAdIndex++;

  const isSmall = h <= 100;

  const handleClick = () => {
    if (ad.href.startsWith('/')) {
      // internal nav via pushState so the SPA router picks it up
      window.history.pushState({}, '', ad.href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      style={{
        width: '100%',
        minHeight: h,
        background: ad.bg,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: isSmall ? 10 : 14,
        padding: isSmall ? '0 14px' : '16px 20px',
        cursor: 'pointer',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: isSmall ? 'row' : 'column',
        justifyContent: isSmall ? 'flex-start' : 'center',
        textAlign: isSmall ? 'left' : 'center',
      }}
    >
      {/* subtle grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.06,
        backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 20px)',
      }} />
      <span style={{ fontSize: isSmall ? 22 : 32, flexShrink: 0, position: 'relative' }}>{ad.icon}</span>
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          fontFamily: lang === 'bn' ? BEN : SANS,
          fontSize: isSmall ? 13 : 15,
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.3,
        }}>
          {T(lang, ad.headlineBn, ad.headline)}
        </div>
        {!isSmall && (
          <div style={{
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 12,
            color: 'rgba(255,255,255,0.75)',
            marginTop: 4,
            lineHeight: 1.4,
          }}>
            {T(lang, ad.subBn, ad.sub)}
          </div>
        )}
      </div>
      <div style={{
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        color: ad.accent,
        flexShrink: 0,
        position: 'relative',
      }}>
        {T(lang, ad.ctaBn, ad.cta)}
      </div>
      {/* "Promoted" label */}
      <div style={{
        position: 'absolute', top: 4, right: 6,
        fontFamily: SANS, fontSize: 9, fontWeight: 700,
        color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5,
      }}>
        PROMOTED
      </div>
    </div>
  );
}

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
      const h = ins.clientHeight || (ins as HTMLElement).offsetHeight;
      if (status === 'done' || status === 'filled') {
        onFillResult(h > 5);
        return;
      }
      // Also check iframe child (ad filled = has iframe with src)
      const iframe = ins.querySelector('iframe');
      if (iframe && (iframe.src || iframe.srcdoc)) {
        onFillResult(true);
        return;
      }
    };

    const doPush = () => {
      if (pushed.current) return;
      const status = ins.getAttribute('data-adsbygoogle-status');
      if (status === 'done' || status === 'filled') { checkFill(); return; }

      const asg = (window as any).adsbygoogle;
      // adsbygoogle not ready yet — retry in 1s (script still loading, not necessarily blocked)
      if (!asg || typeof asg.push !== 'function') {
        timerRef.current = window.setTimeout(doPush, 1000);
        return;
      }

      pushed.current = true;
      try {
        asg.push({});
      } catch {
        pushed.current = false;
        onFillResult(false);
        return;
      }

      // Check fill after 3 seconds
      timerRef.current = window.setTimeout(() => {
        checkFill();
        // If still unknown after 5s, assume unfilled
        timerRef.current = window.setTimeout(() => {
          const h = ins.clientHeight || (ins as HTMLElement).offsetHeight;
          onFillResult(h > 5);
        }, 2000);
      }, 3000);
    };

    // Hard timeout: if adsbygoogle never available after 7s → assume blocked
    const blockTimeout = window.setTimeout(() => {
      if (!pushed.current) onFillResult(false);
    }, 7000);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            doPush();
          }
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
  // null = unknown (loading), true = adsense filled, false = show house ad
  const [filled, setFilled] = useState<boolean | null>(null);

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
        // Only show border/bg when we know what to show
        background: filled === null ? 'transparent' : filled ? 'transparent' : 'transparent',
      }}
    >
      {/* Real AdSense — hidden once we know it's unfilled, visible when filled */}
      <div style={{
        display: filled === false ? 'none' : 'block',
        minHeight: filled === true ? h : 0,
      }}>
        <RealAd format={format} slot={slot} layout={layout} onFillResult={setFilled} />
      </div>

      {/* House ad fallback — shown when AdSense blocked or unfilled */}
      {filled === false && (
        <HouseAd tk={tk} lang={lang} h={h} kind={kind} />
      )}
    </div>
  );
}
