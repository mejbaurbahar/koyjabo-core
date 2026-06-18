import React from 'react';

export function SplashScreen() {
  return (
    <div
      id="kj-splash-react"
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'radial-gradient(circle at 50% 38%, #0b1733 0%, #05060b 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Spinning ring + logo */}
        <div style={{
          position: 'relative', width: 132, height: 132,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26,
        }}>
          <svg viewBox="0 0 132 132" width="132" height="132" fill="none" aria-hidden="true"
            style={{ position: 'absolute', inset: 0, animation: 'kjWheel 2.6s linear infinite' }}>
            <circle cx="66" cy="66" r="60" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
            <circle cx="66" cy="66" r="60" stroke="#22f5ff" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 320"/>
            <circle cx="126" cy="66" r="4" fill="#ff2a6d"/>
          </svg>
          <div style={{
            width: 68, height: 68, borderRadius: 18,
            background: '#05060b',
            boxShadow: '0 14px 40px -10px rgba(0,200,230,0.65), inset 0 0 0 1px rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
            animation: 'kjFloatY 2.2s ease-in-out infinite',
          }}>
            <img src="/logo.png" alt="KoyJabo" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
        <div style={{
          fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 700,
          fontSize: 30, color: '#eafcff', letterSpacing: -0.5,
        }}>কই যাবো</div>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 700,
          fontSize: 11, letterSpacing: 4, color: '#4ad6ee', marginTop: 4,
        }}>KOYJABO</div>
        <div style={{
          width: 168, height: 4, borderRadius: 999,
          background: 'rgba(255,255,255,0.1)', marginTop: 22, overflow: 'hidden',
        }}>
          <div style={{
            display: 'block', height: '100%', width: '42%', borderRadius: 999,
            background: 'linear-gradient(90deg, #22f5ff, #ff2a6d)',
            animation: 'kjLoadBar 1.2s ease-in-out infinite',
          }}/>
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          color: '#6b7a91', marginTop: 14,
        }}>Loading your routes…</div>
      </div>
    </div>
  );
}
