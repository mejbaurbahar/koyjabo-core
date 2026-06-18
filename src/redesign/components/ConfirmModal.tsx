import React, { useEffect } from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';

interface ConfirmModalProps {
  tk: Tokens;
  lang: Lang;
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  tk,
  lang,
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const cancelLabel = T(lang, 'বাতিল', 'Cancel');
  const confirmText = confirmLabel ?? T(lang, 'নিশ্চিত করুন', 'Confirm');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: tk.panel,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${tk.line}`,
          borderRadius: 16,
          padding: '28px 24px 24px',
          maxWidth: 400,
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: tk.shadowLg,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h3
          style={{
            margin: '0 0 10px',
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 17,
            fontWeight: 700,
            color: tk.text,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          style={{
            margin: '0 0 24px',
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 14,
            color: tk.textDim,
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: tk.panelMuted,
              border: `1px solid ${tk.line}`,
              borderRadius: 999,
              padding: '9px 18px',
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 600,
              color: tk.textDim,
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: tk.accentSoft,
              border: `1px solid ${tk.accent}`,
              borderRadius: 999,
              padding: '9px 18px',
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 700,
              color: tk.accent,
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
