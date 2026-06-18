import React, { useState } from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';

const FAB_STYLES = `
@keyframes kjAiFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes kjAiRing {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.7); opacity: 0; }
}
@keyframes kjAiThink {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}
@keyframes kj-ai-eye-blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}
@keyframes kj-ai-eye2-blink {
  0%, 85%, 100% { transform: scaleY(1); }
  90% { transform: scaleY(0.1); }
}
`;

let fabStylesInjected = false;
function injectFabStyles() {
  if (fabStylesInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = FAB_STYLES;
  document.head.appendChild(el);
  fabStylesInjected = true;
}

interface AIFabProps {
  tk: Tokens;
  lang: Lang;
  onNav: () => void;
}

export function AIFab({ tk, lang, onNav }: AIFabProps) {
  injectFabStyles();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        bottom: 90,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {/* Hover label */}
      <div
        style={{
          background: tk.panel,
          border: `1px solid ${tk.line}`,
          borderRadius: 10,
          padding: '7px 12px',
          fontFamily: lang === 'bn' ? BEN : SANS,
          fontSize: 12,
          fontWeight: 600,
          color: tk.text,
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: tk.shadow,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(8px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          pointerEvents: 'none',
        }}
      >
        {T(lang, 'AI সহায়ক · জিজ্ঞাসা করুন', 'AI Assistant · ask me')}
      </div>

      {/* FAB button */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {/* Pulsing rings */}
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 999,
            border: `2px solid ${tk.primary}`,
            animation: 'kjAiRing 2.4s ease-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 999,
            border: `2px solid ${tk.accent}`,
            animation: 'kjAiRing 2.4s ease-out infinite 1.2s',
            pointerEvents: 'none',
          }}
        />

        {/* Thinking bubble */}
        <div
          style={{
            position: 'absolute',
            top: -12,
            right: -6,
            display: 'flex',
            gap: 3,
            alignItems: 'flex-end',
            pointerEvents: 'none',
          }}
        >
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: 999,
                background: tk.primary,
                animation: `kjAiThink 1.4s ease-in-out infinite ${delay}s`,
              }}
            />
          ))}
        </div>

        {/* Main button */}
        <button
          onClick={onNav}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={T(lang, 'AI সহায়ক', 'AI Assistant')}
          style={{
            width: 62,
            height: 62,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            background: `linear-gradient(140deg, ${tk.primary}, ${tk.accent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'kjAiFloat 3.2s ease-in-out infinite',
            boxShadow: `0 8px 32px -8px ${tk.primary}80`,
            position: 'relative',
          }}
        >
          {/* Robot face SVG */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            {/* Antenna */}
            <line x1="18" y1="4" x2="18" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="3.5" r="2" fill="white" />

            {/* Head */}
            <rect x="8" y="10" width="20" height="16" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" />

            {/* Left eye */}
            <rect
              x="11"
              y="14"
              width="5"
              height="5"
              rx="1.5"
              fill="white"
              style={{
                transformOrigin: '13.5px 16.5px',
                animation: 'kj-ai-eye-blink 3s ease-in-out infinite',
              }}
            />

            {/* Right eye */}
            <rect
              x="20"
              y="14"
              width="5"
              height="5"
              rx="1.5"
              fill="white"
              style={{
                transformOrigin: '22.5px 16.5px',
                animation: 'kj-ai-eye2-blink 3.5s ease-in-out infinite 0.5s',
              }}
            />

            {/* Smile */}
            <path
              d="M13 22 Q18 26 23 22"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Side ears */}
            <rect x="5" y="14" width="3" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
            <rect x="28" y="14" width="3" height="6" rx="1.5" fill="white" fillOpacity="0.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
