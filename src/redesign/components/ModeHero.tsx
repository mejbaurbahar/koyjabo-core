import React from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';
import { Bus3D, Train3D, Plane3D, Launch3D } from './Vehicles3D';

type VehicleKind = 'bus' | 'train' | 'plane' | 'launch' | 'truck';

interface Stat { v: string; l: string; }

interface ModeHeroProps {
  tk: Tokens;
  isMobile: boolean;
  lang: Lang;
  kind: VehicleKind;
  gradient: string;
  title: string;
  subtitle: string;
  stats: Stat[];
}

function Vehicle3D({ kind, size }: { kind: VehicleKind; size: number }) {
  if (kind === 'bus') return <Bus3D size={size}/>;
  if (kind === 'train') return <Train3D size={size}/>;
  if (kind === 'plane') return <Plane3D size={size}/>;
  if (kind === 'truck') return <Bus3D size={size} palette={['#ef4444','#7f1d1d','#0a0a0a','#fbbf24']}/>;
  return <Launch3D size={size}/>;
}

export function ModeHero({ tk, isMobile, lang, kind, gradient, title, subtitle, stats }: ModeHeroProps) {
  return (
    <div style={{
      borderRadius: 24, overflow: 'hidden', position: 'relative',
      background: gradient, color: '#fff',
      padding: isMobile ? '18px 18px 0' : '32px 32px 0',
      marginBottom: 18, boxShadow: tk.shadowLg,
      minHeight: isMobile ? 240 : 280,
    }}>
      {/* decorative blobs */}
      <div style={{ position: 'absolute', right: -50, top: -60, width: 240, height: 240, borderRadius: 999, background: 'rgba(255,255,255,0.15)', animation: 'kjpulse 3s ease-in-out infinite' }}/>
      <div style={{ position: 'absolute', left: '40%', bottom: -80, width: 200, height: 200, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}/>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, opacity: 0.85, textTransform: 'uppercase' }}>
            ✦ KoyJabo · {kind}
          </span>
          <h1 style={{ fontFamily: BEN, fontSize: isMobile ? 26 : 38, fontWeight: 700, margin: '6px 0 8px', letterSpacing: -0.6, lineHeight: 1.1 }}>
            {title}
          </h1>
          <p style={{ fontFamily: BEN, fontSize: isMobile ? 13 : 14, opacity: 0.92, lineHeight: 1.55, margin: 0, maxWidth: 480 }}>
            {subtitle}
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ minWidth: 70, flexShrink: 0 }}>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: isMobile ? 18 : 22, letterSpacing: -0.4 }}>{s.v}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: 1.2, opacity: 0.85, textTransform: 'uppercase', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* 3D vehicle — bottom-right, peeking out */}
        <div style={{ flexShrink: 0, alignSelf: 'flex-end', marginBottom: isMobile ? -20 : -10, overflow: 'hidden' }}>
          <Vehicle3D kind={kind} size={isMobile ? 160 : 280}/>
        </div>
      </div>
    </div>
  );
}
