import React, { useEffect, useState } from 'react';
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
  expiresAt?: string | null;  // ISO date 'YYYY-MM-DD', null/absent = no expiry
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

// Module-level cache so deals.json is fetched once per session
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

export function PromoBanner({ tk, lang, page, onNav }: PromoBannerProps) {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    fetchDeals().then(all => {
      setDeals(all.filter(d => d.page.includes(page) && !isExpired(d)));
    });
  }, [page]);

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

      {/* Scrollable deal cards */}
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      } as React.CSSProperties}>
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} tk={tk} lang={lang} onNav={onNav} />
        ))}
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
      // fallback for older browsers
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
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 60, height: 60, borderRadius: 999,
        background: `${tk.primary}10`, pointerEvents: 'none',
      }} />

      {/* Discount badge — top-right */}
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

      {/* Tag */}
      <div style={{
        display: 'inline-block',
        background: `${tk.primary}20`, borderRadius: 6, padding: '2px 7px', marginBottom: 7,
        fontFamily: SANS, fontWeight: 700, fontSize: 9,
        color: tk.primary, letterSpacing: 0.3,
      }}>
        {T(lang, deal.tag.bn, deal.tag.en)}
      </div>

      {/* Emoji + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 5 }}>
        <span style={{ fontSize: 15, lineHeight: 1.2, flexShrink: 0 }}>{deal.emoji}</span>
        <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 12, color: tk.text, lineHeight: 1.3 }}>
          {T(lang, deal.title.bn, deal.title.en)}
        </div>
      </div>

      {/* Price row */}
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

      {/* Sub-label */}
      <div style={{ fontFamily: BEN, fontSize: 10, color: tk.textFaint, fontWeight: 500, marginBottom: deal.promoCode ? 7 : 0 }}>
        {T(lang, deal.sub.bn, deal.sub.en)}
      </div>

      {/* Promo code row with copy button */}
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

      {/* Arrow — only when no promo code (promo code replaces it) */}
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
