import React from 'react';

export function Stars({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <path
            d="m12 2 2.9 6.4 7 .7-5.3 4.7 1.6 6.9L12 17.3 5.8 20.7l1.6-6.9L2 9.1l7-.7z"
            fill={i <= Math.round(value) ? '#f59e0b' : 'rgba(245,158,11,0.2)'}
          />
        </svg>
      ))}
    </span>
  );
}
