import React from 'react';
import { Theme, Tokens, SANS } from '../tokens';
import { KJ_TOKENS } from '../tokens';
import { Icon } from './Icons';

type DeviceMode = 'auto' | 'mobile' | 'desktop';

const MODE_LABELS: { mode: DeviceMode; label: string }[] = [
  { mode: 'auto', label: 'Auto' },
  { mode: 'mobile', label: 'Phone' },
  { mode: 'desktop', label: 'Web' },
];

interface FloatingControlsProps {
  canBack: boolean;
  onBack: () => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  theme: Theme;
  liftBottom?: number;
}

export function FloatingControls({
  canBack,
  onBack,
  deviceMode,
  setDeviceMode,
  theme,
  liftBottom = 24,
}: FloatingControlsProps) {
  const tk = KJ_TOKENS[theme] as Tokens;

  const pillBase: React.CSSProperties = {
    background: tk.panel,
    border: `1px solid ${tk.line}`,
    borderRadius: 999,
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow: tk.shadow,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        bottom: liftBottom,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Back button */}
      {canBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          style={{
            ...pillBase,
            width: 40,
            height: 40,
            justifyContent: 'center',
            cursor: 'pointer',
            color: tk.textDim,
            flexShrink: 0,
            padding: 0,
          }}
        >
          <Icon.arrowL s={18} />
        </button>
      )}

      {/* Mode toggle */}
      <div style={{ ...pillBase, padding: '3px' }}>
        {MODE_LABELS.map(({ mode, label }) => {
          const active = deviceMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setDeviceMode(mode)}
              style={{
                background: active ? tk.primarySoft : 'none',
                border: 'none',
                borderRadius: 999,
                padding: '5px 10px',
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? tk.primary : tk.textFaint,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
