import React, { useState } from 'react';
import { Tokens, Lang, Theme, SANS, BEN, T } from '../tokens';
import { Logo } from './Logo';
import { Icon } from './Icons';
import { signOutUser } from '../utils/auth';

type Device = 'auto' | 'mobile' | 'desktop';

const NAV_ITEMS = [
  { bn: 'হোম', en: 'Home', route: 'home', ic: '🏠' },
  { bn: 'লোকাল বাস', en: 'Local Bus', route: 'bus-hub', ic: '🚌' },
  { bn: 'মেট্রো', en: 'Metro', route: 'metro-hub', ic: '🚇' },
  { bn: 'ট্রেন', en: 'Train', route: 'train-hub', ic: '🚆' },
  { bn: 'আন্তঃজেলা', en: 'Intercity', route: 'intercity', ic: '🧭' },
  { bn: 'লঞ্চ', en: 'Launch', route: 'launch-hub', ic: '⛴️' },
  { bn: 'ফ্লাইট', en: 'Flights', route: 'flights-hub', ic: '✈️' },
] as const;

interface TopBarProps {
  tk: Tokens;
  lang: Lang;
  theme: Theme;
  device: Device;
  user?: { displayName?: string; username?: string } | null;
  activeRoute?: string;
  onNav: (route: string) => void;
  onLang: () => void;
  onTheme: () => void;
  onMenu: () => void;
  canBack?: boolean;
  onBack?: () => void;
}

export function TopBar({
  tk,
  lang,
  theme,
  device,
  user,
  activeRoute,
  onNav,
  onLang,
  onTheme,
  onMenu,
}: TopBarProps) {
  const isMobile = device === 'mobile';
  const [profileOpen, setProfileOpen] = useState(false);

  const controlBtn: React.CSSProperties = {
    background: tk.panelMuted,
    border: `1px solid ${tk.line}`,
    borderRadius: 999,
    padding: '5px 10px',
    fontFamily: SANS,
    fontSize: 12,
    fontWeight: 600,
    color: tk.text,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
  };

  const iconBtn: React.CSSProperties = {
    background: tk.panelMuted,
    border: `1px solid ${tk.line}`,
    borderRadius: 999,
    width: 36,
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: tk.text,
    flexShrink: 0,
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: tk.panel,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${tk.line}`,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          padding: isMobile ? '0 12px' : '0 24px',
          height: isMobile ? 52 : 60,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 16,
        }}
      >
        {/* Logo */}
        <button
          onClick={() => onNav('home')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
          aria-label="KoyJabo Home"
        >
          <Logo tk={tk} size={isMobile ? 32 : 36} />
          <span
            style={{
              fontFamily: BEN,
              fontWeight: 800,
              fontSize: isMobile ? 16 : 18,
              color: tk.text,
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            কই যাবো
          </span>
        </button>

        {/* Desktop nav */}
        {!isMobile && (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              marginLeft: 'auto',
              marginRight: 12,
              minWidth: 0,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              flexShrink: 1,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const active = activeRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNav(item.route)}
                  style={{
                    background: active ? tk.primarySoft : 'none',
                    border: `1px solid ${active ? tk.primary + '60' : 'transparent'}`,
                    borderRadius: 8,
                    padding: '6px 7px',
                    fontFamily: lang === 'bn' ? BEN : SANS,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    color: active ? tk.primary : tk.textDim,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.ic}</span>
                  {T(lang, item.bn, item.en)}
                </button>
              );
            })}
          </nav>
        )}

        {/* Spacer on mobile */}
        {isMobile && <div style={{ flex: 1 }} />}

        {/* Right controls — exact order from design: Menu | Lang | Theme | Install */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Menu button — desktop (left of lang) */}
          {!isMobile && user && (
            <button onClick={onMenu} style={iconBtn} title="Menu">
              <Icon.menu s={18} />
            </button>
          )}

          {!isMobile && !user && (
            <>
              <button
                onClick={() => onNav('signin')}
                style={{ ...controlBtn, borderRadius: 10, padding: '8px 12px' }}
              >
                {T(lang, 'সাইন ইন', 'Sign in')}
              </button>
              <button
                onClick={() => onNav('signup')}
                style={{ ...controlBtn, borderRadius: 10, padding: '8px 12px', background: tk.primary, color: tk.primaryInk, border: 'none' }}
              >
                {T(lang, 'সাইন আপ', 'Sign up')}
              </button>
            </>
          )}

          {/* Lang toggle */}
          <button onClick={onLang} style={controlBtn}>
            <Icon.globe s={14}/>
            <span>{lang === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Theme toggle */}
          <button onClick={onTheme} style={iconBtn} aria-label="Toggle theme">
            {theme === 'dark' ? <Icon.sun s={16} /> : <Icon.moon s={16} />}
          </button>

          {/* Install button for guests */}
          {!isMobile && !user && (
            <button
              onClick={() => onNav('install')}
              style={{
                ...iconBtn,
                background: tk.text,
                color: tk.bg,
                border: 'none',
              }}
              title={T(lang, 'অ্যাপ ইনস্টল', 'Install app')}
            >
              <Icon.download s={16} />
            </button>
          )}

          {/* Profile menu for signed-in desktop users */}
          {!isMobile && user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(open => !open)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  background: tk.primarySoft,
                  color: tk.primaryDeep,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: SANS,
                  fontWeight: 800,
                  fontSize: 12,
                  border: `1px solid ${tk.primary}55`,
                  cursor: 'pointer',
                }}
                aria-label={T(lang, 'প্রোফাইল', 'Profile')}
              >
                {(user.displayName || user.username || 'KJ').slice(0, 2).toUpperCase()}
              </button>
              {profileOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 46,
                  width: 180,
                  background: tk.panel,
                  border: `1px solid ${tk.line}`,
                  borderRadius: 14,
                  boxShadow: tk.shadowLg,
                  padding: 6,
                  zIndex: 500,
                }}>
                  <button
                    onClick={() => { setProfileOpen(false); onNav('profile'); }}
                    style={{ width: '100%', background: 'transparent', border: 0, color: tk.text, textAlign: 'left', padding: '10px 12px', borderRadius: 10, fontFamily: lang === 'bn' ? BEN : SANS, cursor: 'pointer' }}
                  >
                    {T(lang, 'প্রোফাইল', 'Profile')}
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); signOutUser(); onNav('signin'); }}
                    style={{ width: '100%', background: 'transparent', border: 0, color: tk.accent, textAlign: 'left', padding: '10px 12px', borderRadius: 10, fontFamily: lang === 'bn' ? BEN : SANS, cursor: 'pointer' }}
                  >
                    {T(lang, 'সাইন আউট', 'Sign out')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Avatar + menu — mobile only */}
          {isMobile && (
            <>
              <button
                onClick={() => onNav(user ? 'profile' : 'signin')}
                style={{
                  width: 36, height: 36, borderRadius: 999,
                  background: tk.primarySoft, color: tk.primaryDeep,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: SANS, fontWeight: 700, fontSize: 13, flexShrink: 0,
                  border: `1px solid ${tk.line}`,
                  cursor: 'pointer',
                }}
                aria-label={user ? T(lang, 'প্রোফাইল', 'Profile') : T(lang, 'সাইন ইন', 'Sign in')}
              >
                {user ? (user.displayName || user.username || 'KJ').slice(0, 2).toUpperCase() : <Icon.user s={18} />}
              </button>
              {user && (
                <button onClick={onMenu} style={iconBtn} aria-label="Open menu">
                  <Icon.menu s={20} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
