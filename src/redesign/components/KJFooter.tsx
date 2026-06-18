import React from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';
import { Logo } from './Logo';

type FooterLink = { bn: string; en: string; route: string };

const EXPLORE: FooterLink[] = [
  { bn: 'লোকাল বাস', en: 'Local Bus', route: 'bus-hub' },
  { bn: 'মেট্রো', en: 'Metro', route: 'metro-hub' },
  { bn: 'ট্রেন', en: 'Train', route: 'train-hub' },
  { bn: 'ফ্লাইট', en: 'Flights', route: 'flights-hub' },
  { bn: 'লঞ্চ', en: 'Launch', route: 'launch-hub' },
  { bn: 'ভাড়া', en: 'Fare', route: 'fare' },
];

const ACCOUNT: FooterLink[] = [
  { bn: 'প্রোফাইল', en: 'Profile', route: 'profile' },
  { bn: 'সেভড', en: 'Favorites', route: 'favorites' },
  { bn: 'ইতিহাস', en: 'History', route: 'history' },
  { bn: 'সেটিংস', en: 'Settings', route: 'settings' },
  { bn: 'সাইন ইন', en: 'Sign In', route: 'signin' },
];

const COMPANY: FooterLink[] = [
  { bn: 'কেন KoyJabo', en: 'Why KoyJabo', route: 'why' },
  { bn: 'আমাদের সম্পর্কে', en: 'About', route: 'about' },
  { bn: 'ব্লগ', en: 'Blog', route: 'blogs' },
  { bn: 'QA', en: 'QA', route: 'qa' },
  { bn: 'যোগাযোগ', en: 'Contact', route: 'contact' },
];

const LEGAL: FooterLink[] = [
  { bn: 'গোপনীয়তা', en: 'Privacy', route: 'privacy' },
  { bn: 'শর্তাবলী', en: 'Terms', route: 'terms' },
  { bn: 'রিলিজ', en: 'Release', route: 'release' },
];

const SOCIAL = [
  { label: 'f', title: 'Facebook', href: 'https://www.facebook.com/koyjabo/' },
  { label: 'in', title: 'LinkedIn', href: 'https://www.linkedin.com/company/koy-jabo/' },
];

function FooterCol({
  tk,
  lang,
  heading,
  links,
  onNav,
}: {
  tk: Tokens;
  lang: Lang;
  heading: { bn: string; en: string };
  links: FooterLink[];
  onNav: (route: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: tk.textFaint,
          marginBottom: 2,
        }}
      >
        {T(lang, heading.bn, heading.en)}
      </div>
      {links.map((link) => (
        <button
          key={link.route}
          onClick={() => onNav(link.route)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 13,
            color: tk.textDim,
            lineHeight: 1.4,
          }}
        >
          {T(lang, link.bn, link.en)}
        </button>
      ))}
    </div>
  );
}

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
        background: tk.panel,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: `1px solid ${tk.line}`,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '32px 16px 24px' : '48px 32px 32px',
        }}
      >
        {/* Main grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr 1fr',
            gap: isMobile ? '32px 20px' : 40,
            marginBottom: 40,
          }}
        >
          {/* Brand block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              gridColumn: isMobile ? '1 / -1' : undefined,
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              onClick={() => onNav('home')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onNav('home')}
            >
              <Logo tk={tk} size={36} />
              <span
                style={{
                  fontFamily: BEN,
                  fontWeight: 800,
                  fontSize: 20,
                  color: tk.text,
                }}
              >
                কই যাবো
              </span>
            </div>
            <p
              style={{
                fontFamily: lang === 'bn' ? BEN : SANS,
                fontSize: 13,
                color: tk.textDim,
                margin: 0,
                lineHeight: 1.6,
                maxWidth: 240,
              }}
            >
              {T(
                lang,
                'ঢাকার যাত্রীদের জন্য স্মার্ট পরিবহন গাইড',
                'Smart transit guide for Dhaka commuters',
              )}
            </p>
            {/* Social icons */}
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
                    borderRadius: 8,
                    background: tk.panelMuted,
                    border: `1px solid ${tk.line}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 12,
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
          <FooterCol
            tk={tk}
            lang={lang}
            heading={{ bn: 'এক্সপ্লোর', en: 'Explore' }}
            links={EXPLORE}
            onNav={onNav}
          />
          <FooterCol
            tk={tk}
            lang={lang}
            heading={{ bn: 'অ্যাকাউন্ট', en: 'Account' }}
            links={ACCOUNT}
            onNav={onNav}
          />
          <FooterCol
            tk={tk}
            lang={lang}
            heading={{ bn: 'কোম্পানি', en: 'Company' }}
            links={COMPANY}
            onNav={onNav}
          />
          <FooterCol
            tk={tk}
            lang={lang}
            heading={{ bn: 'আইনি', en: 'Legal' }}
            links={LEGAL}
            onNav={onNav}
          />
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: `1px solid ${tk.line}`,
            paddingTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: 12,
              color: tk.textFaint,
            }}
          >
            {T(lang, '© ২০২৬ KoyJabo · সর্বস্বত্ব সংরক্ষিত', '© 2026 KoyJabo · All rights reserved')}
          </span>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 12,
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: '#22c55e',
                display: 'inline-block',
              }}
            />
            {T(lang, 'সব সিস্টেম চালু', 'All systems operational')}
          </span>
        </div>
      </div>
    </footer>
  );
}
