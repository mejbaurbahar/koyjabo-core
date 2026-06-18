import React from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens, Lang, chipBtn } from '../tokens';
import { TopBar } from '../components/TopBar';
import { MobileTabBar } from '../components/MobileTabBar';
import { KJFooter } from '../components/KJFooter';
// AIFab rendered by KoyJaboApp shell

export interface PageShellProps {
  theme: 'dark' | 'light';
  device: 'desktop' | 'mobile';
  lang: 'bn' | 'en';
  route: string;
  canBack: boolean;
  onNav: (r: string) => void;
  onBack: () => void;
  onLang: () => void;
  onTheme: () => void;
  onMenu: () => void;
  children: React.ReactNode;
  backLabel?: string;
}

export function PageShell({
  theme,
  device,
  lang,
  route,
  canBack,
  onNav,
  onBack,
  onLang,
  onTheme,
  onMenu,
  children,
}: PageShellProps) {
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: tk.bg,
        color: tk.text,
        fontFamily: lang === 'bn' ? BEN : SANS,
        // No overflowX: hidden here — it breaks position:sticky on TopBar
        // Overflow is handled by the app scroller in KoyJaboApp
      }}
    >
      {/* Futuristic background layer */}
      <div
        className="kj-future-bg"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            theme === 'dark'
              ? `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,245,255,0.07) 0%, transparent 70%),
                 radial-gradient(ellipse 60% 40% at 90% 80%, rgba(168,85,247,0.06) 0%, transparent 60%),
                 radial-gradient(ellipse 40% 50% at 10% 90%, rgba(255,42,109,0.04) 0%, transparent 60%)`
              : `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,184,217,0.06) 0%, transparent 70%),
                 radial-gradient(ellipse 60% 40% at 90% 80%, rgba(168,85,247,0.04) 0%, transparent 60%)`,
        }}
      />

      {/* Single spacer to offset the fixed TopBar */}
      <div style={{ height: isMobile ? 52 : 60, flexShrink: 0 }}/>

      {/* Back bar — shown on detail/inner pages when user can go back */}
      {canBack && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', background: tk.bg,
          borderBottom: `1px solid ${tk.line}`,
          position: 'sticky', top: isMobile ? 52 : 60, zIndex: 10,
        }}>
          <button onClick={onBack} style={{
            width: 36, height: 36, borderRadius: 10,
            border: `1px solid ${tk.line}`, background: tk.panel,
            color: tk.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span style={{ fontFamily: BEN, fontWeight: 600, fontSize: 15, color: tk.text, flex: 1 }}>
            {T(lang, 'পিছনে যান', 'Go back')}
          </span>
        </div>
      )}

      {/* Scrollable main content */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>

      {/* Footer — hidden on AI chat page on mobile (chat needs full height) */}
      {!(isMobile && route === 'ai') && (
        <KJFooter tk={tk} lang={lang} isMobile={isMobile} onNav={onNav} />
      )}

      {/* MobileTabBar rendered in KoyJaboApp */}

      {/* AIFab rendered by KoyJaboApp shell — not here */}
    </div>
  );
}
