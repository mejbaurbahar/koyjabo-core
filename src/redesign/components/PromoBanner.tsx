import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';

export type PromoPage = 'home' | 'bus' | 'train' | 'metro' | 'flight' | 'intercity' | 'launch' | 'blog';

interface Deal {
  id: string;
  page: PromoPage[];
  emoji: string;
  tag: { bn: string; en: string };
  title: { bn: string; en: string };
  price: string;
  originalPrice: string | null;
  sub: { bn: string; en: string };
  badge: { bn: string; en: string } | null;
  promoCode?: string | null;
  expiresAt?: string | null;
  nav?: string;
  params?: Record<string, string>;
}

function isExpired(deal: Deal): boolean {
  if (!deal.expiresAt) return false;
  return new Date(deal.expiresAt) < new Date(new Date().toDateString());
}

interface DealsFile {
  _updated: string;
  deals: Deal[];
}

let _dealsCache: Deal[] | null = null;
let _dealsPromise: Promise<Deal[]> | null = null;

function fetchDeals(): Promise<Deal[]> {
  if (_dealsCache) return Promise.resolve(_dealsCache);
  if (_dealsPromise) return _dealsPromise;
  _dealsPromise = fetch('/deals.json?v=' + Date.now())
    .then(r => r.json())
    .then((data: DealsFile) => {
      _dealsCache = data.deals || [];
      return _dealsCache;
    })
    .catch(() => {
      _dealsPromise = null;
      return [] as Deal[];
    });
  return _dealsPromise;
}

interface PromoBannerProps {
  tk: Tokens;
  lang: Lang;
  page: PromoPage;
  onNav: (route: string, params?: Record<string, string>) => void;
}

// ── Scroll arrow button ─────────────────────────────────────────────────────
function ScrollArrow({
  dir,
  onClick,
  visible,
  tk,
}: {
  dir: 'left' | 'right';
  onClick: () => void;
  visible: boolean;
  tk: Tokens;
}) {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'left' ? 'Scroll left' : 'Scroll right'}
      className="kj-scroll-arrow"
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [dir]: 0,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: `1.5px solid ${tk.primary}66`,
        background: tk.panel,
        boxShadow: `0 2px 12px rgba(0,0,0,0.35), 0 0 0 2px ${tk.primary}22`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        color: tk.primary,
        fontWeight: 800,
        transition: 'opacity 0.2s',
        animation: 'kj-arrow-pulse 1.8s ease-in-out infinite',
      }}
    >
      {dir === 'left' ? '‹' : '›'}
    </button>
  );
}

// Inject pulse animation once
if (typeof document !== 'undefined') {
  const id = '__kj-arrow-style';
  if (!document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes kj-arrow-pulse {
        0%,100% { box-shadow: 0 2px 12px rgba(0,0,0,0.35), 0 0 0 2px rgba(16,185,129,0.13); transform: translateY(-50%) scale(1); }
        50% { box-shadow: 0 2px 16px rgba(0,0,0,0.45), 0 0 0 5px rgba(16,185,129,0.22); transform: translateY(-50%) scale(1.08); }
      }
    `;
    document.head.appendChild(s);
  }
}

export function PromoBanner({ tk, lang, page, onNav }: PromoBannerProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Start canRight true when deals exist — correct after measurement
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    fetchDeals().then(all => {
      const valid = all.filter(d => d.page.includes(page) && !isExpired(d));
      valid.sort((a, b) => (b.promoCode ? 1 : 0) - (a.promoCode ? 1 : 0));
      setDeals(valid);
    });
  }, [page]);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    if (deals.length === 0) return;
    const el: HTMLDivElement | null = scrollRef.current;
    if (!el) return;

    // Measure immediately, then again after paint settles
    updateArrows();
    const t1 = setTimeout(updateArrows, 80);
    const t2 = setTimeout(updateArrows, 300);

    el.addEventListener('scroll', updateArrows, { passive: true });

    // ResizeObserver: fires when container size changes (mobile viewport, font load, etc.)
    // ResizeObserver detects container size changes (viewport change, font load, etc.)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateArrows) : null;
    ro?.observe(el);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      el.removeEventListener('scroll', updateArrows);
      ro?.disconnect();
    };
  }, [deals, updateArrows]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -440 : 440, behavior: 'smooth' });
  };

  if (deals.length === 0) return null;

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 2 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: `linear-gradient(90deg, ${tk.primary}22, ${tk.accent}18)`,
          border: `1px solid ${tk.primary}44`,
          borderRadius: 999, padding: '3px 10px',
          fontFamily: SANS, fontWeight: 800, fontSize: 10,
          letterSpacing: 1.2, textTransform: 'uppercase' as const, color: tk.primary,
        }}>
          <span
            className="kj-anim-blink"
            style={{ width: 5, height: 5, borderRadius: 999, background: tk.primary, display: 'inline-block' }}
          />
          {T(lang, 'কই যাবো ডিলস', 'KoyJabo Deals')}
        </span>
        <span style={{ fontFamily: BEN, fontSize: 11, color: tk.textFaint }}>
          {T(lang, 'আজকের সেরা ভাড়া', "Today's best fares")}
        </span>
      </div>

      {/* Scrollable row with arrow buttons */}
      <div style={{ position: 'relative' }}>
        <ScrollArrow dir="left"  onClick={() => scroll('left')}  visible={canLeft}  tk={tk} />
        <ScrollArrow dir="right" onClick={() => scroll('right')} visible={canRight} tk={tk} />

        <div
          ref={scrollRef}
          style={{
            display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6,
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            paddingLeft: canLeft ? 20 : 0,
            paddingRight: canRight ? 20 : 0,
          } as React.CSSProperties}
        >
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} tk={tk} lang={lang} onNav={onNav} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DealCard({
  deal, tk, lang, onNav,
}: {
  deal: Deal;
  tk: Tokens;
  lang: Lang;
  onNav: (route: string, params?: Record<string, string>) => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deal.promoCode) return;
    navigator.clipboard.writeText(deal.promoCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = deal.promoCode!;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      onClick={() => deal.nav && onNav(deal.nav, deal.params)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: 145,
        background: hovered ? tk.panel : tk.panelMuted,
        border: `1px solid ${hovered ? tk.primary + '66' : tk.line}`,
        borderRadius: 14,
        padding: '10px 11px 11px',
        cursor: deal.nav ? 'pointer' : 'default',
        transition: 'border-color .15s, background .15s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 60, height: 60, borderRadius: 999,
        background: `${tk.primary}10`, pointerEvents: 'none',
      }} />

      {deal.badge && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: tk.accent, borderRadius: 6, padding: '2px 6px',
          fontFamily: SANS, fontWeight: 800, fontSize: 9,
          color: '#fff', letterSpacing: 0.2, lineHeight: 1.3,
        }}>
          {T(lang, deal.badge.bn, deal.badge.en)}
        </div>
      )}

      <div style={{
        display: 'inline-block',
        background: `${tk.primary}20`, borderRadius: 6, padding: '2px 7px', marginBottom: 7,
        fontFamily: SANS, fontWeight: 700, fontSize: 9,
        color: tk.primary, letterSpacing: 0.3,
      }}>
        {T(lang, deal.tag.bn, deal.tag.en)}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 5 }}>
        <span style={{ fontSize: 15, lineHeight: 1.2, flexShrink: 0 }}>{deal.emoji}</span>
        <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 12, color: tk.text, lineHeight: 1.3 }}>
          {T(lang, deal.title.bn, deal.title.en)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 2 }}>
        <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 17, color: tk.primary, lineHeight: 1 }}>
          {deal.price}
        </span>
        {deal.originalPrice && (
          <span style={{ fontFamily: SANS, fontSize: 10, color: tk.textFaint, textDecoration: 'line-through' }}>
            {deal.originalPrice}
          </span>
        )}
      </div>

      <div style={{ fontFamily: BEN, fontSize: 10, color: tk.textFaint, fontWeight: 500, marginBottom: deal.promoCode ? 7 : 0 }}>
        {T(lang, deal.sub.bn, deal.sub.en)}
      </div>

      {deal.promoCode && (
        <div
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: copied ? `${tk.primary}22` : tk.panelMuted,
            border: `1px dashed ${copied ? tk.primary : tk.line}`,
            borderRadius: 7, padding: '4px 7px',
            cursor: 'pointer', transition: 'all .15s',
            marginTop: 2,
          }}
        >
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 11, color: tk.primary, letterSpacing: 1, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {deal.promoCode}
          </span>
          <span style={{ fontSize: 12, flexShrink: 0, transition: 'transform .15s', transform: copied ? 'scale(1.2)' : 'scale(1)' }}>
            {copied ? '✅' : '📋'}
          </span>
        </div>
      )}

      {deal.nav && !deal.promoCode && (
        <div style={{
          position: 'absolute', bottom: 9, right: 10,
          fontFamily: SANS, fontSize: 12, color: tk.primary, fontWeight: 700,
          opacity: hovered ? 1 : 0.35, transition: 'opacity .15s',
        }}>→</div>
      )}
    </div>
  );
}
