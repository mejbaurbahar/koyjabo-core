import React from 'react';
import type { Tokens } from '../tokens';

// ─── Bus3D ────────────────────────────────────────────────────────────────────

export function Bus3D({
  size = 200,
  palette = ['#10b981', '#006a4e', '#04130d', '#f59e0b'],
}: {
  size?: number;
  palette?: string[];
}) {
  const [body, dark, shadow, accent] = palette;
  const scale = size / 200;
  const w = 220;
  const h = 150;

  return (
    <svg
      width={size}
      height={size * (h / w)}
      viewBox={`0 0 ${w} ${h}`}
      overflow="visible"
      role="img"
      aria-label="3D bus"
    >
      <defs>
        <linearGradient id="bus-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="30%" stopColor={body} />
          <stop offset="80%" stopColor={dark} />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        <linearGradient id="bus-front" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={shadow} />
          <stop offset="100%" stopColor={body} />
        </linearGradient>
        <linearGradient id="bus-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dff6ff" stopOpacity="0.82" />
          <stop offset="55%" stopColor="#7fc4e6" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#27506e" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="bus-head" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe066" stopOpacity="1" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="bus-shadow-rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Speed streaks */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={30 + i * 18}
          y={82 + i * 4}
          width={28 + i * 6}
          height={2}
          rx={1}
          fill={body}
          opacity={0.22}
          className="kj-anim-streak"
          style={{ animationDelay: `${i * 0.18}s`, animationName: 'kj-streak', animationDuration: '1.4s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}
        />
      ))}

      {/* Ground shadow */}
      <ellipse cx={120} cy={143} rx={72} ry={6} fill="url(#bus-shadow-rg)" />

      {/* Bus body group with suspend animation */}
      <g className="kj-anim-suspend">
        {/* Roof top face (perspective parallelogram) */}
        <path
          d="M62 44 L176 44 L180 52 L58 52 Z"
          fill={dark}
          opacity={0.7}
        />
        {/* Roof AC unit */}
        <rect x={110} y={38} width={28} height={8} rx={2} fill={dark} opacity={0.85} />
        <rect x={113} y={36} width={22} height={4} rx={1} fill={shadow} />

        {/* Main side body */}
        <path
          d="M58 52 L180 52 L180 128 Q180 134 174 134 L64 134 Q58 134 58 128 Z"
          fill="url(#bus-body)"
        />

        {/* Front face shading */}
        <path
          d="M180 52 L196 58 L196 128 Q196 134 190 134 L180 134 L180 52 Z"
          fill="url(#bus-front)"
          opacity={0.9}
        />

        {/* Belt line white */}
        <rect x={58} y={84} width={122} height={4} rx={1} fill="#ffffff" opacity={0.22} />

        {/* Accent livery stripe */}
        <rect x={58} y={88} width={122} height={6} rx={0} fill={accent} opacity={0.82} />

        {/* Windows — 5 on side */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect
              x={66 + i * 22}
              y={57}
              width={17}
              height={22}
              rx={3}
              fill="url(#bus-glass)"
            />
            {/* reflection */}
            <rect
              x={67 + i * 22}
              y={58}
              width={5}
              height={10}
              rx={1}
              fill="#ffffff"
              opacity={0.28}
            />
          </g>
        ))}

        {/* Destination LED panel */}
        <rect x={66} y={108} width={64} height={16} rx={2} fill="#0a0a0a" />
        <text
          x={98}
          y={120}
          textAnchor="middle"
          fontSize={7}
          fontFamily="'Inter',system-ui,monospace"
          fontWeight="700"
          fill="#ffd24a"
          letterSpacing="0.5"
        >
          MOTIJHEEL · 6
        </text>

        {/* Door — two glass panels */}
        <rect x={144} y={96} width={8} height={34} rx={1} fill="url(#bus-glass)" opacity={0.75} />
        <rect x={153} y={96} width={8} height={34} rx={1} fill="url(#bus-glass)" opacity={0.75} />
        <line x1={148} y1={96} x2={148} y2={130} stroke="#ffffff" strokeWidth={0.8} strokeOpacity={0.35} />

        {/* Front headlight cluster */}
        <circle cx={190} cy={100} r={7} fill="url(#bus-head)" className="kj-anim-pulse" />
        <circle cx={190} cy={100} r={4} fill="#ffe066" opacity={0.7} />

        {/* Mirror */}
        <rect x={183} y={62} width={10} height={6} rx={1} fill={dark} opacity={0.8} />
        <line x1={183} y1={65} x2={196} y2={65} stroke={dark} strokeWidth={1.5} />

        {/* Wheel arches */}
        <ellipse cx={86} cy={134} rx={18} ry={7} fill={shadow} />
        <ellipse cx={158} cy={134} rx={18} ry={7} fill={shadow} />

        {/* Wheels */}
        {[86, 158].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={134} r={13} fill="#1a1a1a" />
            <circle cx={cx} cy={134} r={9} fill="#2a2a2a" />
            <circle cx={cx} cy={134} r={4} fill="#3a3a3a" />
            {/* Spokes */}
            <g
              className="kj-anim-spin"
              style={{ transformOrigin: `${cx}px 134px` }}
            >
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <line
                  key={deg}
                  x1={cx}
                  y1={134}
                  x2={cx + Math.cos((deg * Math.PI) / 180) * 8}
                  y2={134 + Math.sin((deg * Math.PI) / 180) * 8}
                  stroke="#555"
                  strokeWidth={1.5}
                />
              ))}
            </g>
            <circle cx={cx} cy={134} r={2.5} fill="#888" />
          </g>
        ))}

        {/* Gloss sweep */}
        <rect
          x={58}
          y={52}
          width={30}
          height={82}
          rx={4}
          fill="#ffffff"
          opacity={0.1}
          style={{
            animation: 'kj-shine 6s ease-in-out infinite',
            transformOrigin: '50% 50%',
          }}
        />
      </g>
    </svg>
  );
}

// ─── Plane3D ──────────────────────────────────────────────────────────────────

export function Plane3D({
  size = 200,
  palette = ['#3b82f6', '#1e40af', '#ef4444'],
}: {
  size?: number;
  palette?: string[];
}) {
  const [body, dark, navRed] = palette;
  const w = 220;
  const h = 150;

  return (
    <svg
      width={size}
      height={size * (h / w)}
      viewBox={`0 0 ${w} ${h}`}
      overflow="visible"
      role="img"
      aria-label="3D airplane"
    >
      <defs>
        <linearGradient id="pl-fuse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8f4ff" />
          <stop offset="40%" stopColor={body} stopOpacity="0.85" />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <radialGradient id="pl-shadow-rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Contrail dashes */}
      <line
        x1={10}
        y1={68}
        x2={200}
        y2={68}
        stroke="#ffffff"
        strokeWidth={2}
        strokeOpacity={0.3}
        className="kj-anim-dash"
      />
      <line
        x1={10}
        y1={74}
        x2={180}
        y2={74}
        stroke="#ffffff"
        strokeWidth={1.2}
        strokeOpacity={0.18}
        className="kj-anim-dash"
        style={{ animationDelay: '0.4s' }}
      />

      {/* Ground shadow */}
      <ellipse cx={110} cy={140} rx={65} ry={5} fill="url(#pl-shadow-rg)" />

      {/* Plane group with banking animation */}
      <g className="kj-anim-bank" style={{ transformOrigin: '110px 80px' }}>
        {/* Far wing (under fuselage) */}
        <path
          d="M95 82 L30 106 L38 112 L100 90 Z"
          fill={dark}
          opacity={0.65}
        />

        {/* Horizontal tail */}
        <path
          d="M168 76 L196 68 L196 72 L170 82 Z"
          fill={dark}
          opacity={0.8}
        />
        <path
          d="M168 84 L196 92 L196 88 L170 82 Z"
          fill={dark}
          opacity={0.55}
        />

        {/* Vertical stabilizer */}
        <path
          d="M168 62 L178 44 L182 44 L172 62 Z"
          fill={dark}
          opacity={0.75}
        />
        {/* Accent stripe on tail */}
        <rect x={170} y={50} width={8} height={4} rx={1} fill={navRed} opacity={0.9} />

        {/* Fuselage */}
        <path
          d="M42 76 Q55 66 80 68 L168 68 Q180 68 184 76 Q180 86 168 86 L80 86 Q55 88 42 76 Z"
          fill="url(#pl-fuse)"
        />

        {/* Cheat line (blue stripe along fuselage) */}
        <path
          d="M55 72 L168 72 Q176 72 178 76"
          stroke={body}
          strokeWidth={3}
          strokeOpacity={0.6}
          fill="none"
        />

        {/* Nose cone */}
        <path
          d="M42 76 Q28 76 18 76 Q22 73 42 73 Z"
          fill="#e8f4ff"
          opacity={0.9}
        />

        {/* Porthole windows — 10 circles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <circle
            key={i}
            cx={92 + i * 8}
            cy={74}
            r={2.8}
            fill="#c8e8ff"
            opacity={0.88}
          />
        ))}

        {/* Cockpit glass */}
        <path
          d="M42 73 Q52 66 62 68 L62 76 Q52 74 42 76 Z"
          fill="#1e3a5f"
          opacity={0.85}
        />

        {/* Near wing (over fuselage) */}
        <path
          d="M96 78 L32 116 L44 120 L104 84 Z"
          fill={body}
          opacity={0.88}
        />
        {/* Winglet */}
        <path
          d="M32 116 L28 108 L36 114 Z"
          fill={dark}
          opacity={0.9}
        />

        {/* Engine nacelle */}
        <ellipse cx={78} cy={90} rx={10} ry={5} fill={dark} opacity={0.85} />
        <ellipse cx={74} cy={90} rx={5} ry={5} fill="#111" />
        {/* Spinning fan */}
        <g className="kj-anim-prop" style={{ transformOrigin: '74px 90px' }}>
          <ellipse cx={74} cy={90} rx={4.5} ry={1.2} fill="#555" />
        </g>
        <circle cx={74} cy={90} r={1.8} fill="#888" />

        {/* Nav lights */}
        <circle
          cx={32}
          cy={118}
          r={2.5}
          fill={navRed}
          className="kj-anim-blink"
        />
        <circle
          cx={196}
          cy={70}
          r={2}
          fill="#ffffff"
          className="kj-anim-blink"
          style={{ animationDelay: '0.65s' }}
        />
      </g>
    </svg>
  );
}

// ─── Train3D ──────────────────────────────────────────────────────────────────

export function Train3D({
  size = 200,
  palette = ['#10b981', '#006a4e', '#fef3c7'],
}: {
  size?: number;
  palette?: string[];
}) {
  const [body, dark, cream] = palette;
  const w = 230;
  const h = 150;

  return (
    <svg
      width={size}
      height={size * (h / w)}
      viewBox={`0 0 ${w} ${h}`}
      overflow="visible"
      role="img"
      aria-label="3D metro train"
    >
      <defs>
        <linearGradient id="tr-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="35%" stopColor={body} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <linearGradient id="tr-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dff6ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#27506e" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="tr-head" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffde0" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
        </radialGradient>
        <radialGradient id="tr-shadow-rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Speed streaks */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={10 + i * 20}
          y={80 + i * 5}
          width={34 + i * 4}
          height={1.8}
          rx={0.9}
          fill={body}
          opacity={0.2}
          style={{
            animationName: 'kj-streak',
            animationDuration: '1.2s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}

      {/* Rails */}
      <line x1={0} y1={138} x2={230} y2={138} stroke="#555" strokeWidth={2.5} />
      <line x1={0} y1={142} x2={230} y2={142} stroke="#555" strokeWidth={2.5} />
      {/* Cross-ties */}
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x={i * 20}
          y={136}
          width={14}
          height={8}
          rx={1}
          fill="#4a3728"
          opacity={0.7}
        />
      ))}

      {/* Ground shadow */}
      <ellipse cx={115} cy={144} rx={88} ry={5} fill="url(#tr-shadow-rg)" />

      {/* Train group with suspend animation */}
      <g className="kj-anim-suspend">
        {/* Pantograph wire */}
        <line x1={80} y1={10} x2={220} y2={10} stroke="#aaa" strokeWidth={0.8} strokeOpacity={0.5} />
        <line x1={120} y1={36} x2={120} y2={10} stroke="#bbb" strokeWidth={1} />
        <line x1={140} y1={36} x2={130} y2={10} stroke="#bbb" strokeWidth={1} />
        {/* Spark */}
        <circle
          cx={128}
          cy={12}
          r={3}
          fill="#ffe066"
          style={{
            animationName: 'kj-spark',
            animationDuration: '1.8s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />

        {/* Trailing car body */}
        <rect x={10} y={48} width={94} height={84} rx={4} fill="url(#tr-body)" />
        {/* Trailing car livery */}
        <rect x={10} y={82} width={94} height={6} fill={body} opacity={0.5} />

        {/* Lead car body with aerodynamic nose */}
        <path
          d="M104 48 L198 48 Q214 48 218 66 L218 120 Q218 132 204 132 L104 132 Z"
          fill="url(#tr-body)"
        />

        {/* Livery accent stripe — lead car */}
        <path
          d="M104 82 L218 82 L218 88 L104 88 Z"
          fill={body}
          opacity={0.55}
        />

        {/* MRT plate */}
        <rect x={168} y={52} width={28} height={14} rx={2} fill="#0a0a0a" opacity={0.85} />
        <text
          x={182}
          y={63}
          textAnchor="middle"
          fontSize={7.5}
          fontFamily="'Inter',system-ui,monospace"
          fontWeight="800"
          fill="#ffb800"
        >
          M6
        </text>

        {/* Windows trailing car — 4 windows */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={16 + i * 22}
            y={54}
            width={16}
            height={22}
            rx={3}
            fill="url(#tr-glass)"
          />
        ))}

        {/* Windows lead car — 4 windows */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={108 + i * 22}
            y={54}
            width={16}
            height={22}
            rx={3}
            fill="url(#tr-glass)"
          />
        ))}

        {/* Cab windshield */}
        <path
          d="M200 54 Q212 56 214 70 L214 76 L200 76 Z"
          fill="url(#tr-glass)"
          opacity={0.88}
        />

        {/* Twin headlights */}
        <circle cx={214} cy={92} r={5} fill="url(#tr-head)" className="kj-anim-pulse" />
        <circle cx={214} cy={104} r={5} fill="url(#tr-head)" className="kj-anim-pulse" style={{ animationDelay: '0.3s' }} />

        {/* 4 bogie assemblies with spinning wheels */}
        {[30, 74, 126, 178].map((cx) => (
          <g key={cx}>
            {/* Bogie frame */}
            <rect x={cx - 14} y={128} width={28} height={8} rx={2} fill="#2a2a2a" />
            {/* Wheel left */}
            <circle cx={cx - 8} cy={136} r={6} fill="#1a1a1a" />
            <g className="kj-anim-spin" style={{ transformOrigin: `${cx - 8}px 136px` }}>
              <line x1={cx - 8} y1={130} x2={cx - 8} y2={142} stroke="#444" strokeWidth={1.5} />
              <line x1={cx - 14} y1={136} x2={cx - 2} y2={136} stroke="#444" strokeWidth={1.5} />
            </g>
            <circle cx={cx - 8} cy={136} r={2} fill="#666" />
            {/* Wheel right */}
            <circle cx={cx + 8} cy={136} r={6} fill="#1a1a1a" />
            <g className="kj-anim-spin" style={{ transformOrigin: `${cx + 8}px 136px`, animationDelay: '0.1s' }}>
              <line x1={cx + 8} y1={130} x2={cx + 8} y2={142} stroke="#444" strokeWidth={1.5} />
              <line x1={cx + 2} y1={136} x2={cx + 14} y2={136} stroke="#444" strokeWidth={1.5} />
            </g>
            <circle cx={cx + 8} cy={136} r={2} fill="#666" />
          </g>
        ))}

        {/* Gloss sweep */}
        <rect
          x={104}
          y={48}
          width={24}
          height={84}
          rx={4}
          fill="#ffffff"
          opacity={0.08}
          style={{
            animation: 'kj-shine 6s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
      </g>
    </svg>
  );
}

// ─── Launch3D ─────────────────────────────────────────────────────────────────

export function Launch3D({
  size = 200,
  palette = ['#0ea5e9', '#075985', '#f5d76e'],
}: {
  size?: number;
  palette?: string[];
}) {
  const [body, dark, accent] = palette;
  const w = 230;
  const h = 150;

  return (
    <svg
      width={size}
      height={size * (h / w)}
      viewBox={`0 0 ${w} ${h}`}
      overflow="visible"
      role="img"
      aria-label="3D river launch"
    >
      <defs>
        <linearGradient id="lc-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
        <linearGradient id="lc-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="lc-shadow-rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Water body */}
      <path
        d="M0 110 Q30 104 60 110 Q90 116 120 110 Q150 104 180 110 Q210 116 230 110 L230 150 L0 150 Z"
        fill="url(#lc-water)"
        opacity={0.88}
      />

      {/* Moving wake ripples */}
      <line
        x1={20}
        y1={122}
        x2={130}
        y2={122}
        stroke="#7dd3fc"
        strokeWidth={1.5}
        strokeOpacity={0.45}
        className="kj-anim-dash"
      />
      <line
        x1={10}
        y1={128}
        x2={110}
        y2={128}
        stroke="#7dd3fc"
        strokeWidth={1}
        strokeOpacity={0.28}
        className="kj-anim-dash"
        style={{ animationDelay: '0.5s' }}
      />

      {/* Wake ellipse */}
      <ellipse
        cx={55}
        cy={118}
        rx={40}
        ry={6}
        fill="none"
        stroke="#93c5fd"
        strokeWidth={1.5}
        strokeOpacity={0.35}
        style={{
          animation: 'kj-wake 2.4s ease-out infinite',
          transformOrigin: '55px 118px',
        }}
      />

      {/* Ground shadow */}
      <ellipse cx={120} cy={114} rx={75} ry={5} fill="url(#lc-shadow-rg)" />

      {/* Steamer group with rock animation */}
      <g className="kj-anim-rock" style={{ transformOrigin: '120px 100px' }}>
        {/* Smoke puffs */}
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={140 + i * 4}
            cy={52 - i * 6}
            r={5 + i * 2}
            fill="#c0c0c0"
            opacity={0.55}
            style={{
              animationName: 'kj-smoke',
              animationDuration: '2.2s',
              animationTimingFunction: 'ease-out',
              animationIterationCount: 'infinite',
              animationDelay: `${i * 0.55}s`,
            }}
          />
        ))}

        {/* Hull */}
        <path
          d="M30 104 Q38 98 56 96 L190 96 Q204 96 208 104 L210 112 Q160 116 70 116 Q40 116 28 112 Z"
          fill={dark}
        />

        {/* Main lower deck */}
        <rect x={50} y={78} width={148} height={20} rx={3} fill={body} opacity={0.92} />

        {/* Upper deck */}
        <rect x={66} y={56} width={108} height={24} rx={3} fill="#f0f9ff" opacity={0.9} />

        {/* Wheelhouse */}
        <rect x={110} y={42} width={52} height={16} rx={3} fill="#fef9c3" opacity={0.88} />
        {/* Wheelhouse windows */}
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={114 + i * 16}
            y={45}
            width={10}
            height={8}
            rx={2}
            fill="url(#lc-glass)"
          />
        ))}

        {/* Funnel */}
        <rect x={132} y={28} width={12} height={18} rx={2} fill={dark} />
        <rect x={130} y={26} width={16} height={4} rx={1} fill="#1a1a1a" />

        {/* Lower deck windows — 9 small rects */}
        {Array.from({ length: 9 }).map((_, i) => (
          <rect
            key={i}
            x={54 + i * 16}
            y={82}
            width={10}
            height={10}
            rx={2}
            fill="url(#lc-glass)"
            opacity={0.85}
          />
        ))}

        {/* Upper deck windows — 6 rects */}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={i}
            x={70 + i * 17}
            y={60}
            width={11}
            height={14}
            rx={2}
            fill="url(#lc-glass)"
            opacity={0.85}
          />
        ))}

        {/* Hull stripe */}
        <rect x={50} y={96} width={148} height={4} rx={0} fill={accent} opacity={0.75} />

        {/* Bow flag */}
        <line x1={56} y1={60} x2={56} y2={42} stroke="#888" strokeWidth={1} />
        <path
          d="M56 42 L68 46 L56 50 Z"
          fill={accent}
          className="kj-anim-blink"
        />

        {/* String lights */}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle
            key={i}
            cx={70 + i * 14}
            cy={58}
            r={2}
            fill={i % 2 === 0 ? '#ffe066' : '#ff6b6b'}
            className="kj-anim-blink"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

// ─── Chatbot3D ────────────────────────────────────────────────────────────────

export function Chatbot3D({
  size = 140,
  palette = ['#ffffff', '#ef4444', '#fbbf24'],
}: {
  size?: number;
  palette?: string[];
}) {
  const [bodyCol, accentCol, eyeC] = palette;
  const w = 160;
  const h = 140;

  return (
    <svg
      width={size}
      height={size * (h / w)}
      viewBox={`0 0 ${w} ${h}`}
      overflow="visible"
      role="img"
      aria-label="AI chatbot"
    >
      <defs>
        <linearGradient id="cb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bodyCol} />
          <stop offset="100%" stopColor="#d5dde6" />
        </linearGradient>
        <radialGradient id="cb-eye" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#e0f7ff" />
          <stop offset="50%" stopColor={eyeC} />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
        <radialGradient id="cb-shadow-rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx={80} cy={132} rx={38} ry={5} fill="url(#cb-shadow-rg)" />

      {/* Bot group with bob animation */}
      <g className="kj-anim-bob">
        {/* Antenna */}
        <line x1={80} y1={30} x2={80} y2={14} stroke="#888" strokeWidth={2} />
        <circle
          cx={80}
          cy={11}
          r={4}
          fill={accentCol}
          className="kj-anim-pulse"
        />

        {/* Main head body */}
        <rect
          x={34}
          y={30}
          width={92}
          height={74}
          rx={24}
          fill="url(#cb-body)"
          stroke={accentCol}
          strokeWidth={2}
        />

        {/* Dark face screen */}
        <rect x={44} y={42} width={72} height={46} rx={14} fill="#111827" />

        {/* Eyes */}
        <circle cx={65} cy={62} r={8} fill="url(#cb-eye)" className="kj-ai-eye" />
        <circle cx={65} cy={62} r={3} fill="#1a1a1a" />
        <circle cx={67} cy={60} r={1.5} fill="#ffffff" opacity={0.7} />

        <circle cx={95} cy={62} r={8} fill="url(#cb-eye)" className="kj-ai-eye2" />
        <circle cx={95} cy={62} r={3} fill="#1a1a1a" />
        <circle cx={97} cy={60} r={1.5} fill="#ffffff" opacity={0.7} />

        {/* Smile */}
        <path
          d="M66 76 Q80 84 94 76"
          stroke={eyeC}
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />

        {/* Side ears */}
        <rect x={24} y={52} width={12} height={18} rx={4} fill={accentCol} opacity={0.8} />
        <rect x={124} y={52} width={12} height={18} rx={4} fill={accentCol} opacity={0.8} />

        {/* Sparkle icon top-right */}
        <g
          className="kj-anim-pulse"
          style={{ transformOrigin: '118px 38px' }}
        >
          <text
            x={118}
            y={42}
            textAnchor="middle"
            fontSize={12}
            fill={eyeC}
          >
            ✦
          </text>
        </g>

        {/* 4 status LEDs */}
        {[
          { cx: 52, fill: '#22c55e' },
          { cx: 66, fill: '#f59e0b' },
          { cx: 80, fill: accentCol },
          { cx: 94, fill: '#3b82f6' },
        ].map(({ cx, fill }, i) => (
          <circle
            key={i}
            cx={cx}
            cy={96}
            r={3}
            fill={fill}
            className="kj-anim-blink"
            style={{ animationDelay: `${i * 0.22}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

// ─── Truck3D ──────────────────────────────────────────────────────────────────

export function Truck3D({
  size = 200,
  palette = ['#ef4444', '#7f1d1d', '#0a0a0a', '#fbbf24'],
}: {
  size?: number;
  palette?: string[];
}) {
  const [body, dark, shadow, accent] = palette;
  const w = 240;
  const h = 150;

  return (
    <svg
      width={size}
      height={size * (h / w)}
      viewBox={`0 0 ${w} ${h}`}
      overflow="visible"
      role="img"
      aria-label="3D truck"
    >
      <defs>
        <linearGradient id="truck-cargo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="35%" stopColor={body} />
          <stop offset="85%" stopColor={dark} />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        <linearGradient id="truck-cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="45%" stopColor={body} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <linearGradient id="truck-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f3ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3a6a8c" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="truck-shadow-rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="truck-grille" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dark} />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
      </defs>

      {/* Speed streaks */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={4 + i * 14}
          y={86 + i * 4}
          width={26 + i * 4}
          height={2}
          rx={1}
          fill={body}
          opacity={0.22}
          className="kj-anim-streak"
          style={{ animationDelay: `${i * 0.18}s`, animationName: 'kj-streak', animationDuration: '1.4s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}
        />
      ))}

      {/* Ground shadow */}
      <ellipse cx={130} cy={140} rx={92} ry={6} fill="url(#truck-shadow-rg)" />

      <g className="kj-anim-suspend">
        {/* Cargo box (rear) */}
        <path
          d="M40 50 L150 50 L150 122 L40 122 Z"
          fill="url(#truck-cargo)"
        />
        {/* Cargo box top edge */}
        <path d="M40 50 L150 50 L154 56 L36 56 Z" fill={dark} opacity={0.55}/>
        {/* Cargo box side bars (corrugated panels) */}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={56 + i * 24}
            y1={58}
            x2={56 + i * 24}
            y2={120}
            stroke={dark}
            strokeWidth={1.2}
            opacity={0.4}
          />
        ))}
        {/* Accent stripe along bottom */}
        <rect x={40} y={106} width={110} height={5} fill={accent} opacity={0.85}/>
        {/* Logo plate */}
        <rect x={68} y={72} width={54} height={20} rx={2} fill="#ffffff" opacity={0.16}/>
        <text x={95} y={87} fill="#ffffff" opacity={0.85} fontSize={11} fontFamily="Inter, sans-serif" fontWeight={800} textAnchor="middle">CARGO</text>

        {/* Cab (front) */}
        <path
          d="M150 70 L186 70 L196 78 L196 122 L150 122 Z"
          fill="url(#truck-cab)"
        />
        {/* Cab top edge */}
        <path d="M150 70 L186 70 L190 76 L150 76 Z" fill={dark} opacity={0.6}/>
        {/* Windshield */}
        <path
          d="M154 78 L184 78 L188 95 L154 95 Z"
          fill="url(#truck-window)"
        />
        {/* Window reflection */}
        <path d="M156 80 L168 80 L168 90 L160 92 Z" fill="#ffffff" opacity={0.32}/>
        {/* Door line */}
        <line x1={170} y1={96} x2={170} y2={122} stroke={dark} strokeWidth={1.2} opacity={0.55}/>
        {/* Door handle */}
        <rect x={177} y={104} width={6} height={1.5} rx={0.5} fill={dark} opacity={0.7}/>
        {/* Grille + bumper */}
        <rect x={188} y={98} width={9} height={18} rx={1.2} fill="url(#truck-grille)"/>
        <line x1={189.5} y1={102} x2={196} y2={102} stroke={accent} strokeWidth={1.2} opacity={0.7}/>
        <line x1={189.5} y1={107} x2={196} y2={107} stroke={accent} strokeWidth={1.2} opacity={0.7}/>
        {/* Headlamp */}
        <circle cx={193} cy={92} r={3} fill="#fff7c4" opacity={0.95}/>
        <circle cx={193} cy={92} r={1.2} fill="#fff"/>

        {/* Wheels */}
        {[64, 116, 168].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={124} r={11} fill="#1a1a1a"/>
            <circle cx={cx} cy={124} r={5.5} fill="#3a3a3a"/>
            <circle cx={cx} cy={124} r={2.5} fill="#1a1a1a"/>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ─── TravelHeroScene ──────────────────────────────────────────────────────────

export function TravelHeroScene({
  tk,
  height = 300,
}: {
  tk: Tokens;
  height?: number;
}) {
  const isDark = tk.bg === '#040814' || tk.primary === '#00f5ff';
  const skyStart = isDark ? '#001a12' : '#c8f0e8';
  const skyEnd = isDark ? 'transparent' : '#eef9f4';
  const buildingFill = isDark ? '#1d3b30' : '#a9c9b6';
  const roadColor = isDark ? '#0a1a12' : '#2d4a38';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${skyStart} 0%, ${skyEnd} 100%)`,
      }}
    >
      {/* Sun */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 32,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fffde0 30%, #fbbf24 70%, transparent 100%)',
          opacity: 0.85,
        }}
      />

      {/* City skyline SVG */}
      <svg
        style={{ position: 'absolute', bottom: height * 0.22, left: 0, width: '100%' }}
        viewBox="0 0 800 100"
        preserveAspectRatio="none"
        height={Math.round(height * 0.35)}
      >
        {[
          { x: 20, w: 40, h: 80 },
          { x: 70, w: 55, h: 60 },
          { x: 134, w: 36, h: 90 },
          { x: 178, w: 48, h: 55 },
          { x: 580, w: 52, h: 75 },
          { x: 640, w: 38, h: 95 },
          { x: 686, w: 60, h: 65 },
          { x: 754, w: 44, h: 85 },
        ].map(({ x, w, h }, i) => (
          <rect key={i} x={x} y={100 - h} width={w} height={h} fill={buildingFill} opacity={0.88} rx={2} />
        ))}
      </svg>

      {/* Drifting clouds */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <ellipse
          cx={200}
          cy={55}
          rx={70}
          ry={22}
          fill="#ffffff"
          opacity={isDark ? 0.06 : 0.55}
          style={{ animation: 'kj-drive 28s linear infinite', animationDelay: '0s' }}
        />
        <ellipse
          cx={560}
          cy={38}
          rx={55}
          ry={16}
          fill="#ffffff"
          opacity={isDark ? 0.04 : 0.4}
          style={{ animation: 'kj-drive 44s linear infinite', animationDelay: '-12s' }}
        />
      </svg>

      {/* Animated road */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.22,
          background: roadColor,
          opacity: 0.9,
        }}
      >
        {/* Dashed center line */}
        <svg
          style={{ position: 'absolute', top: '40%', left: 0, width: '100%' }}
          height={4}
          viewBox="0 0 800 4"
          preserveAspectRatio="none"
        >
          <line
            x1={0}
            y1={2}
            x2={800}
            y2={2}
            stroke="#ffffff"
            strokeWidth={2.5}
            strokeOpacity={0.28}
            className="kj-anim-dash"
          />
        </svg>
      </div>

      {/* Bus driving across bottom */}
      <div
        className="kj-anim-drive"
        style={{
          position: 'absolute',
          bottom: height * 0.04,
          left: 0,
          display: 'inline-block',
        }}
      >
        <Bus3D size={160} />
      </div>

      {/* Plane flying across top */}
      <div
        className="kj-anim-fly"
        style={{
          position: 'absolute',
          top: height * 0.06,
          left: 0,
          display: 'inline-block',
        }}
      >
        <Plane3D size={120} />
      </div>

      {/* LIVE · DHAKA badge */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 16,
          background: isDark ? 'rgba(0,245,255,0.18)' : 'rgba(0,184,217,0.18)',
          border: `1px solid ${isDark ? 'rgba(0,245,255,0.4)' : 'rgba(0,184,217,0.4)'}`,
          borderRadius: 999,
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 11,
          color: isDark ? '#00f5ff' : '#0070ad',
          letterSpacing: '0.08em',
        }}
        className="kj-anim-blink"
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: isDark ? '#00f5ff' : '#0070ad',
            display: 'inline-block',
          }}
        />
        LIVE · DHAKA
      </div>
    </div>
  );
}

// ─── MiniVehicle ──────────────────────────────────────────────────────────────

export function MiniVehicle({
  kind,
  palette,
}: {
  kind: 'bus' | 'train' | 'plane' | 'launch' | 'chatbot' | 'truck';
  palette?: string[];
}) {
  switch (kind) {
    case 'bus':
      return <Bus3D size={80} palette={palette} />;
    case 'train':
      return <Train3D size={80} palette={palette} />;
    case 'plane':
      return <Plane3D size={100} palette={palette} />;
    case 'launch':
      return <Launch3D size={80} palette={palette} />;
    case 'chatbot':
      return <Chatbot3D size={70} palette={palette} />;
    case 'truck':
      return <Truck3D size={90} palette={palette} />;
    default:
      return null;
  }
}
