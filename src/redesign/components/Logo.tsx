import React from 'react';
import { Tokens } from '../tokens';

export function Logo({ tk, size = 36 }: { tk: Tokens; size?: number }) {
  const r = size * 0.32;
  const inner = size - 4;
  const innerR = r - 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        padding: 2,
        background:
          'conic-gradient(from 0deg, #00f5ff, #a855f7, #ec4899, #ffb800, #00f5ff)',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: inner,
          height: inner,
          borderRadius: innerR,
          background: tk.panel,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow inset */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: innerR,
            background:
              'radial-gradient(circle at 50% 60%, rgba(0,245,255,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <span
          style={{
            fontFamily: "'Hind Siliguri', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: size * 0.52,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #00f5ff 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative',
            zIndex: 1,
          }}
        >
          ক
        </span>
      </div>
    </div>
  );
}
