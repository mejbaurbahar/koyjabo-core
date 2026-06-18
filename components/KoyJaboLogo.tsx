import React from 'react';

interface KoyJaboLogoProps {
  size?: number;
  isDarkMode?: boolean;
  className?: string;
}

const KoyJaboLogo: React.FC<KoyJaboLogoProps> = ({ size = 36, isDarkMode = true, className = '' }) => {
  const r = Math.round(size * 0.32);

  return (
    <div
      className={`shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        position: 'relative',
        background: isDarkMode
          ? 'linear-gradient(150deg, #22f5ff 0%, #00b8d9 55%, #0a82a8 100%)'
          : 'linear-gradient(150deg, #18d9f2 0%, #00b8d9 55%, #0070ad 100%)',
        color: '#04222b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: '0 12px 28px -14px rgba(0,184,217,0.72), inset 0 1px 0 rgba(255,255,255,0.42)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'Hind Siliguri', 'Inter', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: size * 0.52,
          lineHeight: 1,
          letterSpacing: 0,
          marginTop: size * 0.03,
        }}
      >ক</span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: size * 0.2,
          width: size * 0.46,
          height: Math.max(2, size * 0.06),
          borderRadius: 999,
          background: '#ff2a6d',
        }}
      />
    </div>
  );
};

export default KoyJaboLogo;
