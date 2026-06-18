import React from 'react';
import { Tokens } from '../tokens';

const SHIMMER_STYLE = `
@keyframes kjShimmer {
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
`;

let shimmerInjected = false;
function injectShimmer() {
  if (shimmerInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = SHIMMER_STYLE;
  document.head.appendChild(el);
  shimmerInjected = true;
}

function shimmerBg(tk: Tokens): React.CSSProperties {
  injectShimmer();
  const base = tk.panelMuted;
  const highlight =
    tk.primary === '#00f5ff'
      ? 'rgba(0,245,255,0.07)'
      : 'rgba(0,184,217,0.07)';
  return {
    background: `linear-gradient(90deg, ${base} 0px, ${highlight} 300px, ${base} 600px)`,
    backgroundSize: '600px 100%',
    animation: 'kjShimmer 1.6s infinite linear',
  };
}

export function Skeleton({
  tk,
  w,
  h = 16,
  r = 8,
  style,
}: {
  tk: Tokens;
  w?: string | number;
  h?: number;
  r?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: w ?? '100%',
        height: h,
        borderRadius: r,
        ...shimmerBg(tk),
        ...style,
      }}
    />
  );
}

export function SkeletonRow({ tk }: { tk: Tokens }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
      {/* Avatar circle */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          flexShrink: 0,
          ...shimmerBg(tk),
        }}
      />
      {/* Two text lines */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton tk={tk} w="60%" h={14} r={6} />
        <Skeleton tk={tk} w="40%" h={11} r={6} />
      </div>
    </div>
  );
}

export function PageSkeleton({ tk, isMobile }: { tk: Tokens; isMobile: boolean }) {
  return (
    <div
      style={{
        padding: isMobile ? '16px' : '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Top bar placeholder */}
      <Skeleton tk={tk} w="100%" h={isMobile ? 52 : 60} r={12} />

      {/* Hero / search area */}
      <Skeleton tk={tk} w="100%" h={isMobile ? 120 : 160} r={16} />

      {/* Row of chips */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[80, 100, 72, 90].map((w, i) => (
          <Skeleton key={i} tk={tk} w={w} h={28} r={999} />
        ))}
      </div>

      {/* Content rows */}
      {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => (
        <SkeletonRow key={i} tk={tk} />
      ))}

      {/* Bottom card */}
      <Skeleton tk={tk} w="100%" h={isMobile ? 80 : 100} r={14} />
    </div>
  );
}
