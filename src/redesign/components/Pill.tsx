import React from 'react';
import { Tokens, SANS } from '../tokens';

type Tone = 'mute' | 'primary' | 'accent' | 'amber';

const toneStyles = (tk: Tokens, tone: Tone): { background: string; color: string } => {
  switch (tone) {
    case 'primary':
      return { background: tk.primarySoft, color: tk.primary };
    case 'accent':
      return { background: tk.accentSoft, color: tk.accent };
    case 'amber':
      return { background: tk.amberSoft, color: tk.amber };
    case 'mute':
    default:
      return { background: tk.panelMuted, color: tk.textDim };
  }
};

export function Pill({
  tk,
  children,
  tone = 'mute',
}: {
  tk: Tokens;
  children: React.ReactNode;
  tone?: Tone;
}) {
  const { background, color } = toneStyles(tk, tone);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: 999,
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        background,
        color,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}
