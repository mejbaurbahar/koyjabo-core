import React from 'react';
import { Tokens, Lang, SANS, BEN } from '../tokens';

export function SectionHeader({
  tk,
  lang,
  title,
  action,
  onAction,
}: {
  tk: Tokens;
  lang: Lang;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: BEN,
          fontSize: 18,
          fontWeight: 700,
          color: tk.text,
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            background: 'none',
            border: 'none',
            padding: '2px 0',
            cursor: 'pointer',
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            color: tk.primary,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
