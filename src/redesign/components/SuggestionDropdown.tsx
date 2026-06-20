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

export function SuggestionDropdown({ suggestions, onSelect, onDismiss, tk, lang, anchorRef, maxItems = 20 }: Props) {
  const font = lang === 'bn' ? BEN : SANS;
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, maxH: 320 });

  useEffect(() => {
    const update = () => {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const GAP = 6;
      const MIN_H = 120;
      const MAX_H = 320;
      // Always show below; cap height to available space
      const spaceBelow = vh - r.bottom - GAP;
      const maxH = Math.max(MIN_H, Math.min(MAX_H, spaceBelow));
      setCoords({ top: r.bottom + GAP, left: r.left, width: r.width, maxH });
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
        maxHeight: coords.maxH,
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
            <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: tk.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
            {s.sub && <div style={{ fontFamily: s.sub.match(/[ঀ-৿]/) ? BEN : SANS, fontSize: 11, color: tk.textFaint, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.sub}</div>}
          </div>
        </button>
      ))}
    </div>,
    document.body
  );
}
