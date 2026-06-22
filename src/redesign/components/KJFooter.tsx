import React from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';
import { Logo } from './Logo';

const COLS = [
  {
    h: { bn: 'এক্সপ্লোর', en: 'Explore' },
    items: [
      { bn: 'লোকাল বাস', en: 'Local bus', route: 'bus-hub' },
      { bn: 'মেট্রো রেল', en: 'Metro Rail', route: 'metro-hub' },
      { bn: 'ট্রেন', en: 'Train', route: 'train-hub' },
      { bn: 'ফ্লাইট', en: 'Flights', route: 'flights-hub' },
      { bn: 'লঞ্চ', en: 'Launch', route: 'launch-hub' },
      { bn: 'ভাড়া ক্যালকুলেটর', en: 'Fare calculator', route: 'fare' },
    ],
  },
  {
    h: { bn: 'অ্যাকাউন্ট', en: 'Account' },
    items: [
      { bn: 'প্রোফাইল', en: 'Profile', route: 'profile' },
      { bn: 'প্রিয়', en: 'Favorites', route: 'favorites' },
      { bn: 'যাত্রার ইতিহাস', en: 'Trip history', route: 'history' },
      { bn: 'সেটিংস', en: 'Settings', route: 'settings' },
      { bn: 'সাইন ইন', en: 'Sign in', route: 'signin' },
    ],
  },
  {
    h: { bn: 'কোম্পানি', en: 'Company' },
    items: [
      { bn: 'কেন কই যাবো', en: 'Why KoyJabo', route: 'why' },
      { bn: 'আমাদের সম্পর্কে', en: 'About', route: 'about' },
      { bn: 'ব্লগ', en: 'Blog', route: 'blogs' },
      { bn: 'প্রশ্নোত্তর', en: 'Q & A', route: 'qa' },
      { bn: 'যোগাযোগ', en: 'Contact', route: 'contact' },
    ],
  },
  {
    h: { bn: 'আইনি', en: 'Legal' },
    items: [
      { bn: 'গোপনীয়তা', en: 'Privacy', route: 'privacy' },
      { bn: 'শর্তাবলি', en: 'Terms', route: 'terms' },
      { bn: 'রিলিজ নোট', en: 'Release notes', route: 'release' },
    ],
  },
];

const SOCIAL = [
  { label: 'f', title: 'Facebook', href: 'https://www.facebook.com/koyjabo/' },
  { label: 'in', title: 'LinkedIn', href: 'https://www.linkedin.com/company/koy-jabo/' },
];

interface KJFooterProps {
  tk: Tokens;
  lang: Lang;
  isMobile: boolean;
  onNav: (route: string) => void;
}

export function KJFooter({ tk, lang, isMobile, onNav }: KJFooterProps) {
  return (
    <footer
      style={{
        marginTop: 28,
        background: tk.panelMuted,
        borderTop: `1px solid ${tk.line}`,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative blob — top-right, pulsing glow */}
      <div
        className="kj-anim-pulse"
        style={{
          position: 'absolute',
          right: -60,
          top: -60,
          width: 260,
          height: 260,
          borderRadius: 999,
          background: `radial-gradient(circle, ${tk.primary}28 0%, ${tk.primary}08 60%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />
      {/* Decorative blob — bottom-left, offset phase */}
      <div
        className="kj-anim-glow"
        style={{
          position: 'absolute',
          left: -80,
          bottom: -80,
          width: 200,
          height: 200,
          borderRadius: 999,
          background: `radial-gradient(circle, ${tk.accent}18 0%, ${tk.accent}06 60%, transparent 100%)`,
          pointerEvents: 'none',
          animationDelay: '1.2s',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: 1120,
          margin: '0 auto',
          padding: isMobile ? '28px 18px 18px' : '40px 40px 22px',
          display: 'grid',
          gap: isMobile ? 26 : 32,
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1.5fr repeat(4, 1fr)',
        }}
      >
        {/* Brand block */}
        <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer' }}
            onClick={() => onNav('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNav('home')}
          >
            <Logo tk={tk} size={40} />
            <div>
              <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 19, color: tk.text, lineHeight: 1 }}>
                কই যাবো
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, letterSpacing: 2, color: tk.textFaint, marginTop: 4 }}>
                KOYJABO · BD
              </div>
            </div>
          </div>
          <p style={{ fontFamily: BEN, fontSize: 13, color: tk.textDim, lineHeight: 1.6, margin: '0 0 16px', maxWidth: 320 }}>
            {T(
              lang,
              'বাংলাদেশের সব গণপরিবহন — বাস, মেট্রো, ট্রেন, লঞ্চ ও ফ্লাইট — এক অ্যাপে। অফলাইনেও কাজ করে।',
              "All of Bangladesh's public transport — bus, metro, train, launch & flights — in one app. Works offline.",
            )}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SOCIAL.map((s) => (
              <a
                key={s.title}
                title={s.title}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: tk.panel,
                  border: `1px solid ${tk.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 13,
                  color: tk.textDim,
                  textDecoration: 'none',
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {COLS.map((col, i) => (
          <div key={i}>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 10,
                fontWeight: 700,
                color: tk.textFaint,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              {T(lang, col.h.bn, col.h.en)}
            </div>
            {col.items.map((item) => (
              <FooterLink key={item.route} tk={tk} lang={lang} item={item} onNav={onNav} />
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: 'relative',
          borderTop: `1px solid ${tk.line}`,
          padding: isMobile ? '14px 18px' : '16px 40px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: SANS,
          fontSize: 11,
          color: tk.textFaint,
        }}
      >
        <span>
          {T(lang, '© ২০২৬ KoyJabo · সর্বস্বত্ব সংরক্ষিত', '© 2026 KoyJabo · All rights reserved')}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            className="kj-anim-blink"
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: tk.primary,
              display: 'inline-block',
            }}
          />
          {T(lang, 'সব সিস্টেম সচল', 'All systems operational')}
        </span>
      </div>
    </footer>
  );
}

function FooterLink({
  tk,
  lang,
  item,
  onNav,
}: {
  tk: Tokens;
  lang: Lang;
  item: { bn: string; en: string; route: string };
  onNav: (route: string) => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={() => onNav(item.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        background: 'none',
        border: 0,
        padding: '4px 0',
        textAlign: 'left',
        fontFamily: BEN,
        fontSize: 13,
        color: hovered ? tk.primary : tk.textDim,
        cursor: 'pointer',
        transition: 'color .15s ease',
        width: '100%',
      }}
    >
      {T(lang, item.bn, item.en)}
    </button>
  );
}
