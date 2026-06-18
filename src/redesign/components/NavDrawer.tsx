import React from 'react';
import { Theme, Lang, Tokens, SANS, BEN, T } from '../tokens';
import { KJ_TOKENS } from '../tokens';
import { Logo } from './Logo';
import { Icon } from './Icons';

type DrawerLink = { bn: string; en: string; route: string };

const GROUPS: { heading: { bn: string; en: string }; links: DrawerLink[] }[] = [
  {
    heading: { bn: 'এক্সপ্লোর', en: 'Explore' },
    links: [
      { bn: 'হোম', en: 'Home', route: 'home' },
      { bn: 'লোকাল বাস', en: 'Local Bus', route: 'bus-hub' },
      { bn: 'মেট্রো', en: 'Metro', route: 'metro-hub' },
      { bn: 'ট্রেন', en: 'Train', route: 'train-hub' },
      { bn: 'আন্তঃজেলা', en: 'Intercity', route: 'intercity' },
      { bn: 'লঞ্চ', en: 'Launch', route: 'launch-hub' },
      { bn: 'ফ্লাইট', en: 'Flights', route: 'flights-hub' },
      { bn: 'ভাড়া', en: 'Fare', route: 'fare' },
      { bn: 'AI সহায়ক', en: 'AI Assistant', route: 'ai' },
    ],
  },
  {
    heading: { bn: 'অ্যাকাউন্ট', en: 'Account' },
    links: [
      { bn: 'প্রোফাইল', en: 'Profile', route: 'profile' },
      { bn: 'সেভড', en: 'Favorites', route: 'favorites' },
      { bn: 'ইতিহাস', en: 'History', route: 'history' },
      { bn: 'সেটিংস', en: 'Settings', route: 'settings' },
      { bn: 'সাইন ইন', en: 'Sign In', route: 'signin' },
    ],
  },
  {
    heading: { bn: 'কোম্পানি', en: 'Company' },
    links: [
      { bn: 'কেন KoyJabo', en: 'Why KoyJabo', route: 'why' },
      { bn: 'আমাদের সম্পর্কে', en: 'About', route: 'about' },
      { bn: 'ব্লগ', en: 'Blog', route: 'blogs' },
      { bn: 'QA', en: 'QA', route: 'qa' },
      { bn: 'যোগাযোগ', en: 'Contact', route: 'contact' },
      { bn: 'রিলিজ', en: 'Release', route: 'release' },
    ],
  },
  {
    heading: { bn: 'আইনি', en: 'Legal' },
    links: [
      { bn: 'গোপনীয়তা', en: 'Privacy', route: 'privacy' },
      { bn: 'শর্তাবলী', en: 'Terms', route: 'terms' },
    ],
  },
];

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  onNav: (route: string) => void;
  theme: Theme;
  lang: Lang;
  user?: { id?: string; displayName?: string; username?: string } | null;
  activeRoute?: string;
}

export function NavDrawer({ open, onClose, onNav, theme, lang, user, activeRoute }: NavDrawerProps) {
  const tk = KJ_TOKENS[theme] as Tokens;
  const groups = GROUPS.map(group => group.heading.en === 'Account'
    ? {
        ...group,
        links: user
          ? group.links.filter(link => link.route !== 'signin' && link.route !== 'signup')
          : group.links.filter(link => link.route === 'signin'),
      }
    : group);

  const handleNav = (route: string) => {
    onNav(route);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: open ? 'blur(4px)' : 'none',
          WebkitBackdropFilter: open ? 'blur(4px)' : 'none',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s cubic-bezier(.2,.8,.2,1)',
        }}
      />

      {/* Clipping wrapper — clips the translateX(105%) drawer to viewport */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden', overscrollBehavior: 'contain', pointerEvents: open ? 'auto' : 'none' }}
      >

      {/* Drawer panel */}
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(360px, 86vw)',
          background: tk.panel,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: `1px solid ${tk.line}`,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(105%)',
          transition: 'transform 0.3s cubic-bezier(.2,.8,.2,1)',
          height: '100dvh',
          maxHeight: '100dvh',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${tk.line}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo tk={tk} size={32} />
            <span
              style={{
                fontFamily: "'Hind Siliguri', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 18,
                background: `linear-gradient(135deg, ${tk.primary} 0%, #a855f7 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              KoyJabo
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: tk.panelMuted,
              border: `1px solid ${tk.line}`,
              borderRadius: 999,
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: tk.textDim,
              fontSize: 18,
              lineHeight: 1,
            }}
            aria-label={T(lang, 'মেনু বন্ধ করুন', 'Close menu')}
          >
            ×
          </button>
        </div>

        {/* Nav groups */}
        <div style={{ padding: '12px 0 28px', flex: '1 1 auto', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          {groups.map((group) => (
            <div key={group.heading.en} style={{ marginBottom: 8 }}>
              {/* Group heading */}
              <div
                style={{
                  padding: '8px 20px 4px',
                  fontFamily: SANS,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: tk.textFaint,
                }}
              >
                {T(lang, group.heading.bn, group.heading.en)}
              </div>

              {/* Links */}
              {group.links.map((link) => {
                const isActive = activeRoute === link.route;
                return (
                  <button
                    key={link.route}
                    onClick={() => handleNav(link.route)}
                    style={{
                      width: '100%',
                      background: isActive ? tk.primarySoft : 'none',
                      border: 'none',
                      borderLeft: isActive ? `3px solid ${tk.primary}` : '3px solid transparent',
                      padding: '11px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Bullet dot */}
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: isActive ? tk.primary : tk.line,
                        flexShrink: 0,
                        transition: 'background 0.15s',
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontFamily: lang === 'bn' ? BEN : SANS,
                        fontSize: 14,
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? tk.primary : tk.text,
                        transition: 'color 0.15s',
                      }}
                    >
                      {T(lang, link.bn, link.en)}
                    </span>
                    {/* Chevron right */}
                    <span style={{ color: isActive ? tk.primary : tk.textFaint, display: 'flex', alignItems: 'center' }}>
                      <Icon.arrowR s={14} />
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      </div>{/* end clipping wrapper */}
    </>
  );
}
