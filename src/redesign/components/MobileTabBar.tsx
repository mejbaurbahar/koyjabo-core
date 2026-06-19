import React from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';
import { Icon } from './Icons';

const TABS = [
  { bn: 'হোম', en: 'Home', route: 'home', icon: 'home' as const },
  { bn: 'খুঁজুন', en: 'Search', route: 'intercity', icon: 'search' as const },
  { bn: 'সেভড', en: 'Saved', route: 'favorites', icon: 'star' as const },
  { bn: 'AI', en: 'AI', route: 'ai', icon: 'spark' as const },
  { bn: 'আপনি', en: 'You', route: 'profile', icon: 'user' as const },
] as const;

interface MobileTabBarProps {
  tk: Tokens;
  lang: Lang;
  activeRoute?: string;
  onNav: (route: string) => void;
}

export function MobileTabBar({ tk, lang, activeRoute, onNav }: MobileTabBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        background: tk.panel,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: `1px solid ${tk.line}`,
        padding: '8px 10px 14px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {TABS.map((tab) => {
        const active = activeRoute === tab.route;
        const IconComp = Icon[tab.icon];

        return (
          <button
            key={tab.route}
            onClick={() => onNav(tab.route)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '4px 0 0',
              color: active ? tk.primary : tk.textFaint,
              position: 'relative',
            }}
            aria-label={T(lang, tab.bn, tab.en)}
          >
            {/* Active indicator bar */}
            {active && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 3,
                  borderRadius: 999,
                  background: tk.primary,
                }}
              />
            )}
            <IconComp s={20} />
            <span
              style={{
                fontFamily: lang === 'bn' ? BEN : SANS,
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                lineHeight: 1,
              }}
            >
              {T(lang, tab.bn, tab.en)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
