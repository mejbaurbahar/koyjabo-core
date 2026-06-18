import React from 'react';
import { Tokens } from '../tokens';

export function Logo({ tk, size = 36 }: { tk: Tokens; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        background: tk.panel,
        border: `1px solid ${tk.line}`,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src="/logo.png"
        alt="KoyJabo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}
