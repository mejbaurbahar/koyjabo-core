import React from 'react';

export function BusBrandDot({ c1, c2, t }: { c1: string; c2: string; t: string }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: 12,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        flexShrink: 0,
        letterSpacing: -0.3,
      }}
    >
      {t}
    </div>
  );
}
