import React from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';

export type PromoPage = 'home' | 'bus' | 'train' | 'metro' | 'flight' | 'intercity' | 'launch';

interface Deal {
  tag: { bn: string; en: string };
  title: { bn: string; en: string };
  price: string;
  sub: { bn: string; en: string };
  emoji: string;
  nav?: string; // route to navigate to on click
  params?: Record<string, string>;
}

const DEALS: Record<PromoPage, Deal[]> = {
  home: [
    {
      emoji: '✈️',
      tag: { bn: 'ফ্লাইট অফার', en: 'Flight Deal' },
      title: { bn: 'ঢাকা → কক্সবাজার', en: 'Dhaka → Cox\'s Bazar' },
      price: '৳২,৪৯৯',
      sub: { bn: 'সবচেয়ে কম ভাড়া', en: 'Lowest fare' },
      nav: 'flights-hub',
    },
    {
      emoji: '🚆',
      tag: { bn: 'ট্রেন ডিল', en: 'Train Deal' },
      title: { bn: 'ঢাকা → সিলেট', en: 'Dhaka → Sylhet' },
      price: '৳৩৭৫',
      sub: { bn: 'শোভন চেয়ার', en: 'Shovon Chair' },
      nav: 'train-hub',
    },
    {
      emoji: '🚌',
      tag: { bn: 'বাস অফার', en: 'Bus Offer' },
      title: { bn: 'ঢাকা → চট্টগ্রাম', en: 'Dhaka → Chittagong' },
      price: '৳৬৮০',
      sub: { bn: 'নন-এসি', en: 'Non-AC' },
      nav: 'intercity',
    },
    {
      emoji: '🚢',
      tag: { bn: 'লঞ্চ ডিল', en: 'Launch Deal' },
      title: { bn: 'সদরঘাট → বরিশাল', en: 'Sadarghat → Barisal' },
      price: '৳২৮০',
      sub: { bn: 'ডেক ক্লাস', en: 'Deck class' },
      nav: 'launch-hub',
    },
  ],
  bus: [
    {
      emoji: '🚌',
      tag: { bn: 'সেরা ভাড়া', en: 'Best fare' },
      title: { bn: 'ঢাকা → চট্টগ্রাম', en: 'Dhaka → Chittagong' },
      price: '৳৬৮০',
      sub: { bn: 'নন-এসি', en: 'Non-AC' },
      nav: 'intercity',
    },
    {
      emoji: '🛻',
      tag: { bn: 'এসি বাস', en: 'AC Bus' },
      title: { bn: 'ঢাকা → সিলেট', en: 'Dhaka → Sylhet' },
      price: '৳৯০০',
      sub: { bn: 'এসি সিটিং', en: 'AC Sitting' },
      nav: 'intercity',
    },
    {
      emoji: '🚌',
      tag: { bn: 'বাজেট রুট', en: 'Budget route' },
      title: { bn: 'ঢাকা → রাজশাহী', en: 'Dhaka → Rajshahi' },
      price: '৳৬০০',
      sub: { bn: 'নন-এসি', en: 'Non-AC' },
      nav: 'intercity',
    },
  ],
  train: [
    {
      emoji: '🚆',
      tag: { bn: 'সেরা দাম', en: 'Best price' },
      title: { bn: 'ঢাকা → চট্টগ্রাম', en: 'Dhaka → Chittagong' },
      price: '৳৪০৫',
      sub: { bn: 'শোভন চেয়ার', en: 'Shovon Chair' },
      nav: 'train-hub',
    },
    {
      emoji: '🚆',
      tag: { bn: 'ট্রেন ডিল', en: 'Train deal' },
      title: { bn: 'ঢাকা → সিলেট', en: 'Dhaka → Sylhet' },
      price: '৳৩৭৫',
      sub: { bn: 'শোভন চেয়ার', en: 'Shovon Chair' },
      nav: 'train-hub',
    },
    {
      emoji: '🚆',
      tag: { bn: 'কক্সবাজার এক্সপ্রেস', en: "Cox's Bazar Exp." },
      title: { bn: 'ঢাকা → কক্সবাজার', en: 'Dhaka → Cox\'s Bazar' },
      price: '৳৭৪৫',
      sub: { bn: 'শোভন চেয়ার', en: 'Shovon Chair' },
      nav: 'train-hub',
    },
    {
      emoji: '🚆',
      tag: { bn: 'খুলনা এক্সপ্রেস', en: 'Khulna Express' },
      title: { bn: 'ঢাকা → খুলনা', en: 'Dhaka → Khulna' },
      price: '৳৪৪৫',
      sub: { bn: 'পদ্মা সেতু হয়ে', en: 'Via Padma Bridge' },
      nav: 'train-hub',
    },
  ],
  metro: [
    {
      emoji: '🚇',
      tag: { bn: 'সিঙ্গেল রাইড', en: 'Single ride' },
      title: { bn: 'যেকোনো স্টেশন', en: 'Any station' },
      price: '৳২০',
      sub: { bn: 'সর্বনিম্ন ভাড়া', en: 'Minimum fare' },
      nav: 'metro-hub',
    },
    {
      emoji: '🚇',
      tag: { bn: 'পুরো রুট', en: 'Full route' },
      title: { bn: 'উত্তরা → মতিঝিল', en: 'Uttara → Motijheel' },
      price: '৳১০০',
      sub: { bn: '১৭ স্টেশন', en: '17 stations' },
      nav: 'metro-hub',
    },
    {
      emoji: '💳',
      tag: { bn: 'MRT পাস', en: 'MRT Pass' },
      title: { bn: 'বারবার ব্যবহার', en: 'Unlimited reload' },
      price: '৳২০০',
      sub: { bn: 'ডিপোজিট', en: 'Deposit' },
      nav: 'metro-hub',
    },
  ],
  flight: [
    {
      emoji: '✈️',
      tag: { bn: 'সেরা ভাড়া', en: 'Best fare' },
      title: { bn: 'ঢাকা → কক্সবাজার', en: 'Dhaka → Cox\'s Bazar' },
      price: '৳২,৪৯৯',
      sub: { bn: 'এক দিক', en: 'One way' },
      nav: 'flights-hub',
    },
    {
      emoji: '✈️',
      tag: { bn: 'ফ্লাইট অফার', en: 'Flight offer' },
      title: { bn: 'ঢাকা → সিলেট', en: 'Dhaka → Sylhet' },
      price: '৳২,২৯৯',
      sub: { bn: 'এক দিক', en: 'One way' },
      nav: 'flights-hub',
    },
    {
      emoji: '✈️',
      tag: { bn: 'বাজেট ফ্লাইট', en: 'Budget flight' },
      title: { bn: 'ঢাকা → চট্টগ্রাম', en: 'Dhaka → Chittagong' },
      price: '৳১,৯৯৯',
      sub: { bn: 'এক দিক', en: 'One way' },
      nav: 'flights-hub',
    },
    {
      emoji: '✈️',
      tag: { bn: 'উত্তর রুট', en: 'North route' },
      title: { bn: 'ঢাকা → রাজশাহী', en: 'Dhaka → Rajshahi' },
      price: '৳২,১৯৯',
      sub: { bn: 'এক দিক', en: 'One way' },
      nav: 'flights-hub',
    },
  ],
  intercity: [
    {
      emoji: '🚌',
      tag: { bn: 'বাস অফার', en: 'Bus offer' },
      title: { bn: 'ঢাকা → চট্টগ্রাম', en: 'Dhaka → Chittagong' },
      price: '৳৬৮০',
      sub: { bn: 'নন-এসি', en: 'Non-AC' },
      nav: 'intercity',
    },
    {
      emoji: '✈️',
      tag: { bn: 'ফ্লাইট ডিল', en: 'Flight deal' },
      title: { bn: 'ঢাকা → কক্সবাজার', en: 'Dhaka → Cox\'s Bazar' },
      price: '৳২,৪৯৯',
      sub: { bn: 'এক দিক', en: 'One way' },
      nav: 'flights-hub',
    },
    {
      emoji: '🚆',
      tag: { bn: 'ট্রেন', en: 'Train' },
      title: { bn: 'ঢাকা → খুলনা', en: 'Dhaka → Khulna' },
      price: '৳৪৪৫',
      sub: { bn: 'পদ্মা সেতু হয়ে', en: 'Via Padma Bridge' },
      nav: 'train-hub',
    },
    {
      emoji: '🚢',
      tag: { bn: 'লঞ্চ', en: 'Launch' },
      title: { bn: 'সদরঘাট → বরিশাল', en: 'Sadarghat → Barisal' },
      price: '৳২৮০',
      sub: { bn: 'ডেক ক্লাস', en: 'Deck class' },
      nav: 'launch-hub',
    },
  ],
  launch: [
    {
      emoji: '🚢',
      tag: { bn: 'ডেক ক্লাস', en: 'Deck class' },
      title: { bn: 'সদরঘাট → বরিশাল', en: 'Sadarghat → Barisal' },
      price: '৳২৮০',
      sub: { bn: '৮-১০ ঘণ্টা', en: '8-10 hours' },
      nav: 'launch-hub',
    },
    {
      emoji: '🛳️',
      tag: { bn: 'ভিআইপি কেবিন', en: 'VIP cabin' },
      title: { bn: 'সদরঘাট → বরিশাল', en: 'Sadarghat → Barisal' },
      price: '৳১,৫০০',
      sub: { bn: 'আরামদায়ক কেবিন', en: 'Comfortable cabin' },
      nav: 'launch-hub',
    },
    {
      emoji: '🚢',
      tag: { bn: 'লঞ্চ ডিল', en: 'Launch deal' },
      title: { bn: 'সদরঘাট → খুলনা', en: 'Sadarghat → Khulna' },
      price: '৳৩৫০',
      sub: { bn: 'ডেক ক্লাস', en: 'Deck class' },
      nav: 'launch-hub',
    },
    {
      emoji: '🛳️',
      tag: { bn: 'চাঁদপুর রুট', en: 'Chandpur route' },
      title: { bn: 'সদরঘাট → চাঁদপুর', en: 'Sadarghat → Chandpur' },
      price: '৳১৫০',
      sub: { bn: '৩-৪ ঘণ্টা', en: '3-4 hours' },
      nav: 'launch-hub',
    },
  ],
};

interface PromoBannerProps {
  tk: Tokens;
  lang: Lang;
  page: PromoPage;
  onNav: (route: string, params?: Record<string, string>) => void;
}

export function PromoBanner({ tk, lang, page, onNav }: PromoBannerProps) {
  const deals = DEALS[page] ?? DEALS.home;

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
          letterSpacing: 1.2, textTransform: 'uppercase', color: tk.primary,
        }}>
          <span className="kj-anim-blink" style={{ width: 5, height: 5, borderRadius: 999, background: tk.primary, display: 'inline-block' }}/>
          {T(lang, 'কই যাবো ডিলস', 'KoyJabo Deals')}
        </span>
        <span style={{ fontFamily: BEN, fontSize: 11, color: tk.textFaint }}>
          {T(lang, 'আজকের সেরা ভাড়া', 'Today\'s best fares')}
        </span>
      </div>

      {/* Horizontally scrollable deal cards */}
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      } as React.CSSProperties}>
        {deals.map((deal, i) => (
          <DealCard key={i} deal={deal} tk={tk} lang={lang} onNav={onNav} />
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

  return (
    <div
      onClick={() => deal.nav && onNav(deal.nav, deal.params)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: 140,
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
      {/* Subtle glow top-right */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 60, height: 60, borderRadius: 999,
        background: `${tk.primary}12`, pointerEvents: 'none',
      }}/>

      {/* Tag badge */}
      <div style={{
        display: 'inline-block',
        background: `${tk.primary}20`,
        borderRadius: 6, padding: '2px 7px', marginBottom: 7,
        fontFamily: SANS, fontWeight: 700, fontSize: 9,
        color: tk.primary, letterSpacing: 0.3,
      }}>
        {T(lang, deal.tag.bn, deal.tag.en)}
      </div>

      {/* Emoji + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 5 }}>
        <span style={{ fontSize: 16, lineHeight: 1.2, flexShrink: 0 }}>{deal.emoji}</span>
        <div style={{
          fontFamily: BEN, fontWeight: 700, fontSize: 12,
          color: tk.text, lineHeight: 1.3,
        }}>
          {T(lang, deal.title.bn, deal.title.en)}
        </div>
      </div>

      {/* Price */}
      <div style={{
        fontFamily: SANS, fontWeight: 900, fontSize: 17,
        color: tk.primary, lineHeight: 1, marginBottom: 3,
      }}>
        {deal.price}
      </div>

      {/* Sub-label */}
      <div style={{
        fontFamily: BEN, fontSize: 10, color: tk.textFaint, fontWeight: 500,
      }}>
        {T(lang, deal.sub.bn, deal.sub.en)}
      </div>

      {/* Arrow if navigable */}
      {deal.nav && (
        <div style={{
          position: 'absolute', bottom: 9, right: 10,
          fontFamily: SANS, fontSize: 12, color: tk.primary, fontWeight: 700,
          opacity: hovered ? 1 : 0.4, transition: 'opacity .15s',
        }}>→</div>
      )}
    </div>
  );
}
