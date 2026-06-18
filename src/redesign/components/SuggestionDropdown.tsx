import React, { useEffect, useRef, useState } from 'react';
import { Tokens, SANS, BEN, Lang } from '../tokens';
import { createPortal } from 'react-dom';

export interface Suggestion {
  id: string;
  label: string;
  sub?: string;
}

interface Props {
  suggestions: Suggestion[];
  onSelect: (s: Suggestion) => void;
  onDismiss: () => void;
  tk: Tokens;
  lang: Lang;
  anchorRef: React.RefObject<HTMLElement>;
  maxItems?: number;
}

export function SuggestionDropdown({ suggestions, onSelect, onDismiss, tk, lang, anchorRef, maxItems = 8 }: Props) {
  const font = lang === 'bn' ? BEN : SANS;
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const update = () => {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setCoords({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) onDismiss();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onDismiss, anchorRef]);

  if (!suggestions.length || coords.width === 0) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: 99999,
        background: tk.panel,
        border: `1px solid ${tk.line}`,
        borderRadius: 14,
        overflow: 'hidden auto',
        boxShadow: tk.shadowLg,
        maxHeight: 280,
      }}
    >
      {suggestions.slice(0, maxItems).map((s, i) => (
        <button
          key={s.id}
          onMouseDown={(e) => { e.preventDefault(); onSelect(s); }}
          style={{
            width: '100%', background: 'none', border: 'none',
            borderTop: i ? `1px solid ${tk.line}` : '', padding: '11px 14px',
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            textAlign: 'left',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = tk.chipBg)}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ fontSize: 14, flexShrink: 0 }}>📍</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: tk.text }}>{s.label}</div>
            {s.sub && <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 1 }}>{s.sub}</div>}
          </div>
        </button>
      ))}
    </div>,
    document.body
  );
}
