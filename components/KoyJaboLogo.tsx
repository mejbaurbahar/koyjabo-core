import React from 'react';

interface KoyJaboLogoProps {
  size?: number;
  isDarkMode?: boolean;
  className?: string;
}

const KoyJaboLogo: React.FC<KoyJaboLogoProps> = ({ size = 36, isDarkMode = true, className = '' }) => {
  const inner = isDarkMode ? '#040814' : '#0a1626';
  const r = Math.round(size * 0.32);

  return (
    <div
      className={`shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        position: 'relative',
        background: 'conic-gradient(from 180deg, #00f5ff, #a259ff, #ff2a6d, #ffb800, #00f5ff)',
        padding: 2,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: r - 2,
          background: inner,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 18px rgba(0,245,255,0.4)',
        }}
      >
        <span
          style={{
            fontFamily: "'Hind Siliguri', 'Inter', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: size * 0.5,
            background: 'linear-gradient(135deg, #00f5ff, #a259ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
            letterSpacing: -0.5,
            position: 'relative',
            zIndex: 1,
          }}
        >ক</span>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 30% 30%, rgba(0,245,255,0.5), transparent 60%)',
          }}
        />
      </div>
    </div>
  );
};

export default KoyJaboLogo;
