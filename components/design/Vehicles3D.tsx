import React from 'react';

export type VehicleKind = 'bus' | 'plane' | 'train' | 'launch' | 'cng' | 'chatbot';

export interface TravelHeroSceneProps {
  isDarkMode: boolean;
  height?: number;
}

export interface MiniVehicleProps {
  kind: VehicleKind;
  palette?: string[];
}

function Bus3D({ size = 200, palette = ['#10b981', '#006a4e', '#04130d', '#f59e0b'] }) {
  const [body, dark, shadow, accent] = palette;
  return (
    <svg viewBox="0 0 200 140" width={size} height={size * 0.7} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="bus3d-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={body}/>
          <stop offset="1" stopColor={dark}/>
        </linearGradient>
        <linearGradient id="bus3d-side" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={dark}/>
          <stop offset="1" stopColor={body}/>
        </linearGradient>
        <linearGradient id="bus3d-win" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#bef0ff"/>
          <stop offset="1" stopColor="#3a83b8"/>
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="100" cy="128" rx="80" ry="6" fill={shadow} opacity="0.25"/>
      {/* isometric body — front face */}
      <g className="kj-anim-bob-sm" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* back/side face (right) */}
        <path d="M170 40 L188 32 L188 96 L170 104 Z" fill="url(#bus3d-side)"/>
        {/* top face */}
        <path d="M22 40 L40 32 L188 32 L170 40 Z" fill={body} opacity="0.85"/>
        {/* main face */}
        <rect x="22" y="40" width="148" height="64" rx="10" fill="url(#bus3d-body)"/>
        {/* accent stripe */}
        <rect x="22" y="68" width="148" height="3" fill={accent}/>
        {/* windows */}
        <rect x="32" y="48" width="22" height="14" rx="3" fill="url(#bus3d-win)"/>
        <rect x="58" y="48" width="22" height="14" rx="3" fill="url(#bus3d-win)"/>
        <rect x="84" y="48" width="22" height="14" rx="3" fill="url(#bus3d-win)"/>
        <rect x="110" y="48" width="22" height="14" rx="3" fill="url(#bus3d-win)"/>
        <rect x="136" y="48" width="28" height="14" rx="3" fill="url(#bus3d-win)"/>
        {/* door frame */}
        <rect x="120" y="74" width="18" height="26" rx="2" fill={dark} opacity="0.6"/>
        <line x1="129" y1="74" x2="129" y2="100" stroke={accent} strokeWidth="1.2"/>
        {/* headlight + grille */}
        <circle cx="166" cy="86" r="3" fill="#fff8d8" className="kj-anim-blink"/>
        <rect x="155" y="92" width="12" height="3" rx="1" fill={dark} opacity="0.5"/>
        {/* roof unit */}
        <rect x="60" y="32" width="80" height="6" rx="2" fill={dark} opacity="0.4"/>
        {/* route panel */}
        <rect x="30" y="42" width="40" height="4" rx="1" fill="#fff"/>
        <text x="50" y="46" textAnchor="middle" fontSize="3.5" fontWeight="700" fill={dark} fontFamily="Inter">MOTIJHEEL</text>
        {/* wheels */}
        <g>
          <circle cx="48" cy="106" r="11" fill={dark}/>
          <circle cx="48" cy="106" r="6" fill="#3a3a3a"/>
          <circle cx="48" cy="106" r="2.5" fill="#999" className="kj-anim-spin"/>
        </g>
        <g>
          <circle cx="150" cy="106" r="11" fill={dark}/>
          <circle cx="150" cy="106" r="6" fill="#3a3a3a"/>
          <circle cx="150" cy="106" r="2.5" fill="#999" className="kj-anim-spin"/>
        </g>
      </g>
    </svg>
  );
}

// ───────────────────────────────────────────────
// 3D Plane — angled with motion trails
// ───────────────────────────────────────────────
function Plane3D({ size = 200, palette = ['#3b82f6', '#1e40af', '#ef4444'] }) {
  const [body, dark, accent] = palette;
  return (
    <svg viewBox="0 0 200 140" width={size} height={size * 0.7}>
      <defs>
        <linearGradient id="pl-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff"/>
          <stop offset="1" stopColor="#dbe5ec"/>
        </linearGradient>
        <linearGradient id="pl-stripe" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={body}/>
          <stop offset="1" stopColor={dark}/>
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="124" rx="60" ry="5" fill="#000" opacity="0.18"/>
      <g className="kj-anim-bob" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* contrail */}
        <path d="M-10 78 Q 30 76 60 80" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" fill="none" strokeLinecap="round" className="kj-anim-dash"/>
        <path d="M-30 84 Q 10 82 50 86" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" fill="none" strokeLinecap="round" className="kj-anim-dash"/>
        {/* tail */}
        <path d="M55 50 L70 35 L78 35 L72 60 Z" fill={dark}/>
        <path d="M55 50 L72 60 L70 70 L50 60 Z" fill={body}/>
        {/* fuselage */}
        <path d="M40 70 Q 60 50 130 56 L170 70 Q 175 72 175 76 Q 175 80 170 82 L130 96 Q 60 102 40 82 Q 35 76 40 70 Z" fill="url(#pl-body)"/>
        {/* stripe */}
        <path d="M48 78 L165 78 Q 168 78 168 80 Q 168 82 165 82 L48 84 Z" fill="url(#pl-stripe)"/>
        {/* windows */}
        {[60,70,80,90,100,110,120,130].map((x, i) => (
          <circle key={i} cx={x} cy="70" r="2.2" fill="#1f2937"/>
        ))}
        {/* cockpit */}
        <path d="M155 64 Q 168 64 174 72 L170 78 L160 72 Z" fill="#1f2937"/>
        {/* wing top */}
        <path d="M75 76 Q 95 60 125 60 L120 80 L80 82 Z" fill={dark}/>
        <path d="M125 60 L155 50 L160 55 L130 65 Z" fill={accent}/>
        {/* wing bottom */}
        <path d="M75 84 Q 95 100 130 100 L130 92 L80 88 Z" fill={dark} opacity="0.8"/>
        {/* engine */}
        <ellipse cx="102" cy="92" rx="9" ry="5" fill={dark}/>
        <ellipse cx="93" cy="92" rx="2.2" ry="3.5" fill="#fff8d8" className="kj-anim-pulse"/>
      </g>
    </svg>
  );
}

// ───────────────────────────────────────────────
// 3D Train (metro / intercity) — front-quarter view
// ───────────────────────────────────────────────
function Train3D({ size = 200, palette = ['#10b981', '#006a4e', '#fef3c7'] }) {
  const [body, dark, accent] = palette;
  return (
    <svg viewBox="0 0 220 140" width={size} height={size * 0.64}>
      <defs>
        <linearGradient id="tr-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={body}/>
          <stop offset="1" stopColor={dark}/>
        </linearGradient>
        <linearGradient id="tr-front" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={dark}/>
          <stop offset="1" stopColor={body}/>
        </linearGradient>
        <linearGradient id="tr-window" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#cfeaff"/>
          <stop offset="1" stopColor="#1e3a5f"/>
        </linearGradient>
      </defs>
      {/* rails */}
      <line x1="0" y1="118" x2="220" y2="118" stroke="#6b7280" strokeWidth="2"/>
      <line x1="0" y1="124" x2="220" y2="124" stroke="#6b7280" strokeWidth="2"/>
      {/* ties */}
      <g fill="#5b4636">
        {[10, 50, 90, 130, 170, 210].map((x, i) => <rect key={i} x={x-5} y="120" width="10" height="6"/>)}
      </g>
      <ellipse cx="110" cy="130" rx="80" ry="3" fill="#000" opacity="0.18"/>

      <g className="kj-anim-shake" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* rear cars */}
        <rect x="6" y="46" width="70" height="64" rx="10" fill="url(#tr-body)"/>
        <rect x="14" y="56" width="22" height="22" rx="3" fill="url(#tr-window)"/>
        <rect x="42" y="56" width="22" height="22" rx="3" fill="url(#tr-window)"/>

        {/* coupler */}
        <rect x="76" y="80" width="6" height="6" fill={dark}/>

        {/* front engine angled */}
        <path d="M82 46 L160 46 L196 70 Q 200 80 196 90 L160 110 L82 110 Z" fill="url(#tr-body)"/>
        {/* front face highlight */}
        <path d="M160 46 L196 70 Q 200 80 196 90 L160 110 L168 90 L168 70 Z" fill="url(#tr-front)" opacity="0.7"/>
        {/* roof */}
        <rect x="82" y="42" width="78" height="6" rx="2" fill={dark}/>
        {/* MRT-6 plate */}
        <rect x="90" y="52" width="14" height="14" rx="3" fill={accent}/>
        <text x="97" y="63" textAnchor="middle" fontSize="6" fontWeight="800" fill={dark} fontFamily="Inter">M6</text>
        {/* windows */}
        <rect x="110" y="56" width="20" height="14" rx="3" fill="url(#tr-window)"/>
        <rect x="134" y="56" width="20" height="14" rx="3" fill="url(#tr-window)"/>
        {/* headlights */}
        <circle cx="186" cy="74" r="3.2" fill="#fff8d8" className="kj-anim-pulse"/>
        <circle cx="186" cy="86" r="3.2" fill="#fff8d8" className="kj-anim-pulse" style={{ animationDelay: '0.5s' }}/>
        {/* stripe */}
        <rect x="6" y="92" width="190" height="3" fill={accent}/>
        {/* wheel bogies */}
        {[26, 56, 106, 144].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy="112" r="6" fill={dark}/>
            <circle cx={x} cy="112" r="3" fill="#444"/>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ───────────────────────────────────────────────
// 3D Launch / River boat (Sadarghat)
// ───────────────────────────────────────────────
function Launch3D({ size = 200, palette = ['#0ea5e9', '#075985', '#f5d76e'] }) {
  const [body, dark, accent] = palette;
  return (
    <svg viewBox="0 0 220 140" width={size} height={size * 0.64}>
      <defs>
        <linearGradient id="ln-hull" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff"/>
          <stop offset="1" stopColor="#cbd5e1"/>
        </linearGradient>
      </defs>
      {/* water */}
      <g>
        <path d="M0 110 Q 55 105 110 110 T 220 110 L220 140 L0 140 Z" fill={body} opacity="0.7"/>
        <path d="M0 118 Q 55 113 110 118 T 220 118" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.6" className="kj-anim-dash"/>
      </g>
      <g className="kj-anim-bob" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* hull */}
        <path d="M30 96 L40 110 L180 110 L194 96 L172 92 L52 92 Z" fill={dark}/>
        {/* deck */}
        <rect x="40" y="70" width="140" height="24" rx="4" fill="url(#ln-hull)"/>
        {/* upper deck */}
        <rect x="60" y="50" width="100" height="22" rx="4" fill="url(#ln-hull)"/>
        {/* roof */}
        <rect x="68" y="42" width="84" height="10" rx="2" fill={accent}/>
        {/* stack */}
        <rect x="146" y="28" width="10" height="22" fill={dark}/>
        <rect x="144" y="26" width="14" height="4" fill="#475569"/>
        <g className="kj-anim-smoke" style={{ transformBox: 'fill-box', transformOrigin: '151px 26px' }}>
          <circle cx="151" cy="22" r="4" fill="#fff" opacity="0.7"/>
        </g>
        {/* windows row */}
        {[44, 60, 76, 92, 108, 124, 140, 156, 168].map((x, i) => (
          <rect key={i} x={x} y="76" width="10" height="10" rx="1" fill="#3b82f6" opacity="0.65"/>
        ))}
        {[68, 82, 96, 110, 124, 138, 152].map((x, i) => (
          <rect key={i} x={x} y="56" width="10" height="10" rx="1" fill="#3b82f6" opacity="0.65"/>
        ))}
        {/* stripe */}
        <rect x="32" y="88" width="156" height="3" fill={accent}/>
        {/* flag */}
        <line x1="110" y1="20" x2="110" y2="42" stroke={dark} strokeWidth="1.2"/>
        <path d="M110 22 L122 24 L122 32 L110 30 Z" fill={accent}/>
      </g>
    </svg>
  );
}

// ───────────────────────────────────────────────
// 3D Chatbot — animated AI assistant avatar
// ───────────────────────────────────────────────
function Chatbot3D({ size = 140, palette = ['#ffffff', '#ef4444', '#fbbf24'] }) {
  const [face, accent, eyeC] = palette;
  return (
    <svg viewBox="0 0 160 140" width={size} height={size * 0.875}>
      <defs>
        <linearGradient id="cb-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={face}/>
          <stop offset="1" stopColor="rgba(255,255,255,0.7)"/>
        </linearGradient>
        <radialGradient id="cb-eye" cx="50%" cy="40%">
          <stop offset="0" stopColor="#fff"/>
          <stop offset="1" stopColor={accent}/>
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="128" rx="44" ry="4" fill="#000" opacity="0.18"/>
      <g className="kj-anim-bob" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* antenna */}
        <line x1="80" y1="14" x2="80" y2="32" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="80" cy="12" r="5" fill={accent} className="kj-anim-pulse"/>
        <circle cx="80" cy="12" r="8" fill={accent} opacity="0.4" className="kj-anim-pulse"/>
        {/* head */}
        <rect x="34" y="30" width="92" height="74" rx="22" fill="url(#cb-body)" stroke={accent} strokeWidth="2"/>
        {/* face panel */}
        <rect x="44" y="44" width="72" height="44" rx="14" fill="#0e1a1f"/>
        {/* eyes */}
        <circle cx="64" cy="64" r="8" fill="url(#cb-eye)"/>
        <circle cx="64" cy="62" r="2.5" fill="#fff" className="kj-anim-blink"/>
        <circle cx="96" cy="64" r="8" fill="url(#cb-eye)"/>
        <circle cx="96" cy="62" r="2.5" fill="#fff" className="kj-anim-blink" style={{ animationDelay: '0.3s' }}/>
        {/* smile */}
        <path d="M68 78 Q 80 86 92 78" stroke={eyeC} strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* ear / side speakers */}
        <rect x="28" y="56" width="8" height="18" rx="3" fill={accent}/>
        <rect x="124" y="56" width="8" height="18" rx="3" fill={accent}/>
        {/* sparkle chat bubble */}
        <g transform="translate(110, 14)" className="kj-anim-pulse">
          <circle r="11" fill={eyeC}/>
          <path d="M-4 -1 L0 -5 L4 -1 L0 3 Z M-2 4 L0 6 L2 4 L0 2 Z" fill="#0e1a1f"/>
        </g>
        {/* body lights */}
        <g transform="translate(0, 96)">
          <rect x="56" y="0" width="6" height="6" rx="1.5" fill="#10b981" className="kj-anim-blink"/>
          <rect x="68" y="0" width="6" height="6" rx="1.5" fill="#fbbf24" className="kj-anim-blink" style={{ animationDelay: '0.2s' }}/>
          <rect x="80" y="0" width="6" height="6" rx="1.5" fill={accent} className="kj-anim-blink" style={{ animationDelay: '0.4s' }}/>
          <rect x="92" y="0" width="6" height="6" rx="1.5" fill="#3b82f6" className="kj-anim-blink" style={{ animationDelay: '0.6s' }}/>
        </g>
      </g>
    </svg>
  );
}

// ───────────────────────────────────────────────
// Spinning rickshaw wheel + CNG icons (small accents)
// ───────────────────────────────────────────────
function CNG3D({ size = 120, palette = ['#0ea5e9', '#fbbf24', '#0c4a6e'] }) {
  const [roof, body, dark] = palette;
  return (
    <svg viewBox="0 0 140 120" width={size} height={size * 0.86}>
      <ellipse cx="70" cy="108" rx="50" ry="4" fill="#000" opacity="0.2"/>
      <g className="kj-anim-bob-sm" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* roof */}
        <path d="M30 36 L60 22 L100 22 L120 36 Z" fill={roof}/>
        <rect x="30" y="34" width="90" height="6" fill={dark}/>
        {/* cabin */}
        <path d="M28 40 L120 40 L116 86 L34 86 Z" fill={body}/>
        {/* windows */}
        <rect x="40" y="46" width="32" height="22" rx="2" fill="#bee4f7"/>
        <rect x="78" y="46" width="32" height="22" rx="2" fill="#bee4f7"/>
        {/* divider */}
        <rect x="73" y="46" width="3" height="22" fill={dark}/>
        {/* base */}
        <rect x="30" y="86" width="90" height="8" rx="2" fill={dark}/>
        {/* wheels */}
        <g>
          <circle cx="48" cy="98" r="9" fill={dark}/>
          <circle cx="48" cy="98" r="4" fill="#666" className="kj-anim-spin"/>
        </g>
        <g>
          <circle cx="102" cy="98" r="9" fill={dark}/>
          <circle cx="102" cy="98" r="4" fill="#666" className="kj-anim-spin"/>
        </g>
      </g>
    </svg>
  );
}

// ───────────────────────────────────────────────
// Animated traveling clouds layer
// ───────────────────────────────────────────────
function CloudsLayer({ color = '#ffffff', density = 4 }) {
  const clouds = [];
  for (let i = 0; i < density; i++) {
    clouds.push({ x: (i * 240) % 1000, y: 20 + (i * 31) % 50, s: 0.6 + ((i * 7) % 6) * 0.1, slow: i % 2 === 0 });
  }
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div className="kj-anim-cloud" style={{ display: 'flex', gap: 100, position: 'absolute', top: 0, left: 0, width: '200%' }}>
        {[...clouds, ...clouds].map((c, i) => (
          <svg key={i} width={70 * c.s} height={40 * c.s} viewBox="0 0 70 40" style={{ marginTop: c.y, opacity: 0.65 }}>
            <ellipse cx="20" cy="26" rx="14" ry="10" fill={color}/>
            <ellipse cx="38" cy="22" rx="18" ry="12" fill={color}/>
            <ellipse cx="55" cy="28" rx="12" ry="8" fill={color}/>
          </svg>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Animated city skyline (parallax-feel)
// ───────────────────────────────────────────────
function CitySkyline({ isDarkMode }: { isDarkMode: boolean }) {
  const dark = isDarkMode;
  const c1 = dark ? '#1a3530' : '#a3c2af';
  const c2 = dark ? '#2a5a4d' : '#cee0d5';
  return (
    <svg viewBox="0 0 600 100" style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMax meet">
      {/* back row */}
      <g fill={c1} opacity="0.7">
        <rect x="0" y="50" width="30" height="50"/>
        <rect x="34" y="38" width="28" height="62"/>
        <rect x="66" y="46" width="38" height="54"/>
        <rect x="108" y="28" width="32" height="72"/>
        <rect x="144" y="42" width="40" height="58"/>
        <rect x="188" y="34" width="34" height="66"/>
        <rect x="226" y="48" width="44" height="52"/>
        <rect x="274" y="32" width="30" height="68"/>
        <rect x="308" y="44" width="38" height="56"/>
        <rect x="350" y="30" width="44" height="70"/>
        <rect x="398" y="40" width="32" height="60"/>
        <rect x="434" y="50" width="40" height="50"/>
        <rect x="478" y="34" width="36" height="66"/>
        <rect x="518" y="44" width="44" height="56"/>
        <rect x="566" y="38" width="30" height="62"/>
      </g>
      {/* front row */}
      <g fill={c2}>
        <rect x="12" y="62" width="22" height="38"/>
        <rect x="40" y="56" width="24" height="44"/>
        <rect x="70" y="68" width="30" height="32"/>
        <rect x="108" y="52" width="26" height="48"/>
        <rect x="140" y="60" width="32" height="40"/>
        <rect x="178" y="50" width="28" height="50"/>
        <rect x="212" y="64" width="34" height="36"/>
        <rect x="252" y="48" width="26" height="52"/>
        <rect x="284" y="58" width="32" height="42"/>
        <rect x="322" y="62" width="28" height="38"/>
        <rect x="356" y="54" width="34" height="46"/>
        <rect x="396" y="64" width="30" height="36"/>
        <rect x="432" y="50" width="28" height="50"/>
        <rect x="466" y="58" width="36" height="42"/>
        <rect x="508" y="62" width="28" height="38"/>
        <rect x="542" y="54" width="32" height="46"/>
      </g>
      {/* windows blinking */}
      {[[55,68],[88,76],[120,60],[150,72],[200,58],[240,76],[290,70],[340,74],[380,62],[420,76],[460,60],[500,72],[540,68]].map((p, i) => (
        <rect key={i} x={p[0]} y={p[1]} width="3" height="3" fill="#ffd86b" className="kj-anim-blink" style={{ animationDelay: `${i * 0.2}s` }}/>
      ))}
    </svg>
  );
}

// ───────────────────────────────────────────────
// HERO scene — combines sky + skyline + road + animated bus + plane
// ───────────────────────────────────────────────
function TravelHeroScene({ isDarkMode, height = 280 }: TravelHeroSceneProps) {
  const dark = isDarkMode;
  return (
    <div style={{
      position: 'relative', width: '100%', height,
      borderRadius: 22, overflow: 'hidden',
      background: dark
        ? 'linear-gradient(180deg, #06241d 0%, #0e3f33 40%, #082018 100%)'
        : 'linear-gradient(180deg, #cdeefb 0%, #b6e4d3 50%, #f3ebd6 100%)',
      boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.6), 0 30px 90px -25px rgba(0, 245, 255, 0.45)" : "0 4px 12px rgba(0, 32, 64, 0.06), 0 32px 80px -30px rgba(0, 184, 217, 0.35)",
    }}>
      {/* sun / moon */}
      <div style={{
        position: 'absolute', right: '12%', top: '14%',
        width: 60, height: 60, borderRadius: 999,
        background: dark
          ? 'radial-gradient(circle, #fef9c3 0%, #fde047 70%)'
          : 'radial-gradient(circle, #fff7c2 0%, #fcd34d 70%)',
        boxShadow: dark
          ? '0 0 60px 20px rgba(253, 224, 71, 0.35)'
          : '0 0 50px 14px rgba(252, 211, 77, 0.5)',
      }} className="kj-anim-pulse"/>

      {/* clouds */}
      <CloudsLayer color={dark ? '#7fb89c' : '#ffffff'} density={5}/>

      {/* plane */}
      <div style={{ position: 'absolute', top: '12%', left: 0, width: '100%' }}>
        <div className="kj-anim-fly" style={{ width: 120 }}>
          <Plane3D size={120}/>
        </div>
      </div>

      {/* skyline */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '32%', height: '40%' }}>
        <CitySkyline isDarkMode={isDarkMode} />
      </div>

      {/* road */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '32%',
        background: dark
          ? 'linear-gradient(180deg, #0a1417 0%, #050a0c 100%)'
          : 'linear-gradient(180deg, #c2b896 0%, #8a7e5c 100%)',
      }}>
        {/* dashed center line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '50%',
          height: 3, transform: 'translateY(-50%)',
          backgroundImage: `linear-gradient(90deg, ${isDarkMode ? '#ffb800' : '#ff8a00'} 50%, transparent 50%)`,
          backgroundSize: '40px 3px',
          animation: 'kj-track 0.7s linear infinite',
        }}/>
        {/* bus driving */}
        <div style={{ position: 'absolute', bottom: '18%', left: 0, width: '100%' }}>
          <div className="kj-anim-drive" style={{ width: 200 }}>
            <Bus3D size={200} palette={[isDarkMode ? '#00f5ff' : '#00b8d9', isDarkMode ? '#00d4e6' : '#0070ad', '#04130d', isDarkMode ? '#ffb800' : '#ff8a00']}/>
          </div>
        </div>
      </div>

      {/* live badge */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(8px)',
        padding: '5px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: '#ef4444' }} className="kj-anim-blink"/>
        LIVE · DHAKA
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Mini animated vehicle (for mode tiles)
// ───────────────────────────────────────────────
function MiniVehicle({ kind, palette }: MiniVehicleProps) {
  const components = { bus: Bus3D, plane: Plane3D, train: Train3D, launch: Launch3D, cng: CNG3D, chatbot: Chatbot3D };
  const Comp = components[kind] || Bus3D;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      paddingBottom: 4, overflow: 'hidden',
    }}>
      <Comp size={120} palette={palette}/>
    </div>
  );
}
export { TravelHeroScene, MiniVehicle, Bus3D, Train3D, Launch3D, Plane3D };
export default TravelHeroScene;
