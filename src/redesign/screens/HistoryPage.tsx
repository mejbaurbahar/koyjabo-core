import React from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens, Lang } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';

interface ScreenProps {
  theme: 'dark' | 'light';
  device: 'desktop' | 'mobile';
  lang: 'bn' | 'en';
  route: string;
  canBack: boolean;
  onNav: (r: string) => void;
  onBack: () => void;
  onLang: () => void;
  onTheme: () => void;
  onMenu: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_BN = ['সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি', 'রবি'];
const BAR_DATA = [
  { bus: 5, metro: 3, rideshare: 1 },
  { bus: 8, metro: 4, rideshare: 2 },
  { bus: 6, metro: 5, rideshare: 1 },
  { bus: 9, metro: 4, rideshare: 0 },
  { bus: 7, metro: 3, rideshare: 2 },
  { bus: 4, metro: 2, rideshare: 1 },
  { bus: 3, metro: 1, rideshare: 0 },
];

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const LINE_DATA = [18, 22, 25, 19, 28, 32, 24, 30, 26, 22, 27, 21];

const HEAT_HOURS = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];
const HEAT_DATA = [
  [1, 4, 2, 1, 3, 1],
  [2, 5, 3, 2, 4, 2],
  [1, 4, 2, 1, 3, 0],
  [2, 5, 3, 2, 4, 1],
  [1, 4, 2, 1, 3, 1],
  [0, 2, 1, 1, 2, 1],
  [0, 1, 1, 0, 2, 1],
];

const JOURNEYS = [
  { from: 'Banani', to: 'Karwan Bazar', fromBn: 'বনানী', toBn: 'কারওয়ান বাজার', date: 'Jun 16', dateBn: 'জুন ১৬', mode: '🚌', fare: 40, co2: 0.8, expensive: false },
  { from: 'Gulshan', to: 'Motijheel', fromBn: 'গুলশান', toBn: 'মতিঝিল', date: 'Jun 15', dateBn: 'জুন ১৫', mode: '🚇', fare: 60, co2: 0.3, expensive: false },
  { from: 'Airport', to: 'Farmgate', fromBn: 'এয়ারপোর্ট', toBn: 'ফার্মগেট', date: 'Jun 14', dateBn: 'জুন ১৪', mode: '🚌', fare: 75, co2: 1.2, expensive: true },
  { from: 'Mirpur', to: 'Shahbag', fromBn: 'মিরপুর', toBn: 'শাহবাগ', date: 'Jun 13', dateBn: 'জুন ১৩', mode: '🚆', fare: 35, co2: 0.5, expensive: false },
  { from: 'Uttara', to: 'Motijheel', fromBn: 'উত্তরা', toBn: 'মতিঝিল', date: 'Jun 12', dateBn: 'জুন ১২', mode: '🚇', fare: 80, co2: 0.4, expensive: true },
];

const TOP_ROUTES = [
  { from: 'Banani', to: 'Karwan Bazar', pct: 89, color: '#00f5ff' },
  { from: 'Gulshan', to: 'Motijheel', pct: 72, color: '#818cf8' },
  { from: 'Airport', to: 'Farmgate', pct: 45, color: '#34d399' },
  { from: 'Mirpur', to: 'Shahbag', pct: 31, color: '#fb923c' },
];

function heatColor(val: number, theme: 'dark' | 'light'): string {
  const steps =
    theme === 'dark'
      ? ['#1a2b1a', '#166534', '#16a34a', '#22c55e', '#4ade80']
      : ['#f0fdf4', '#bbf7d0', '#86efac', '#4ade80', '#16a34a'];
  return steps[Math.min(val, 4)];
}

export function HistoryPage(props: ScreenProps) {
  const { theme, device, lang } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const font = lang === 'bn' ? BEN : SANS;
  const card: React.CSSProperties = { background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16, padding: 16 };

  const BAR_MAX = 15;
  const barH = 120;
  const dayLblBn = (i: number) => lang === 'bn' ? DAYS_BN[i] : DAYS[i];

  /* Weekly bar chart SVG */
  const barW = 36;
  const barGap = 10;
  const totalW = DAYS.length * (barW + barGap) - barGap + 40;

  /* Donut */
  const total = 247;
  const donutData = [
    { label: 'Bus', labelBn: 'বাস', pct: 55, color: tk.primary },
    { label: 'Metro', labelBn: 'মেট্রো', pct: 31, color: '#818cf8' },
    { label: 'CNG', labelBn: 'সিএনজি', pct: 14, color: tk.amber },
  ];
  const circumference = 2 * Math.PI * 52;
  let donutOffset = 0;

  /* Line chart */
  const lineMax = Math.max(...LINE_DATA);
  const lineW = 320;
  const lineH = 100;
  const linePoints = LINE_DATA.map((v, i) => ({
    x: (i / (LINE_DATA.length - 1)) * (lineW - 32) + 16,
    y: lineH - 16 - ((v / lineMax) * (lineH - 32)),
  }));
  const linePath = linePoints.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaPath = `${linePath} L${linePoints[linePoints.length - 1].x},${lineH} L${linePoints[0].x},${lineH} Z`;

  return (
    <PageShell {...props} canBack>
      <div style={{ padding: isMobile ? '16px 12px 100px' : '24px 40px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero gradient banner */}
        <div style={{
          borderRadius: 22, padding: isMobile ? 18 : 28, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #006a4e 0%, #10b981 40%, #3b82f6 100%)',
          color: '#fff', boxShadow: tk.shadowLg,
        }}>
          <div style={{ position: 'absolute', right: -20, top: -30, width: 180, height: 180, borderRadius: 999, background: 'rgba(255,255,255,0.15)', pointerEvents: 'none' }} className="kj-anim-pulse" />
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, opacity: 0.85, textTransform: 'uppercase' }}>
            {lbl('June 2026 · Summary', 'জুন ২০২৬ · সারাংশ')}
          </span>
          <h1 style={{ fontFamily: font, fontSize: isMobile ? 22 : 30, fontWeight: 700, margin: '6px 0 18px', letterSpacing: -0.5, lineHeight: 1.2 }}>
            {lbl('247 trips · ৳ 12,400 saved', '২৪৭ ট্রিপ · ৳ ১২,৪০০ সাশ্রয়')}
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 10 }}>
            {[
              { label: lbl('Bus Trips', 'বাস ট্রিপ'), value: '124', icon: '🚌' },
              { label: lbl('Metro Trips', 'মেট্রো'), value: '78', icon: '🚇' },
              { label: lbl('CO₂ Saved', 'CO₂ সাশ্রয়'), value: '48 kg', icon: '🌿' },
              { label: lbl('Total Hours', 'মোট ঘণ্টা'), value: '142 h', icon: '⏱' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: isMobile ? 16 : 22, letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontFamily: font, fontSize: 10, fontWeight: 700, opacity: 0.85, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts: bar + donut side by side on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: 20 }}>
        {/* Weekly bar chart */}
        <div style={card}>
          <div style={{ fontFamily: font, fontWeight: 700, fontSize: 15, color: tk.text, marginBottom: 4 }}>{lbl('This Week', 'এই সপ্তাহ')}</div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: tk.textDim, marginBottom: 14 }}>
            ৳ 1,240 {lbl('this week', 'এই সপ্তাহ')} · ↑ 12% {lbl('vs last week', 'গত সপ্তাহের তুলনায়')}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <svg width={totalW} height={barH + 40} style={{ display: 'block' }}>
              {/* Y axis labels */}
              {[0, 5, 10, 15].map((v) => {
                const y = barH - (v / BAR_MAX) * barH;
                return (
                  <g key={v}>
                    <line x1={28} y1={y} x2={totalW} y2={y} stroke={tk.line} strokeWidth={1} />
                    <text x={24} y={y + 4} fontSize={9} fill={tk.textFaint} textAnchor="end" fontFamily={SANS}>{v}</text>
                  </g>
                );
              })}
              {BAR_DATA.map((d, i) => {
                const total = d.bus + d.metro + d.rideshare;
                const x = 32 + i * (barW + barGap);
                const busH = (d.bus / BAR_MAX) * barH;
                const metroH = (d.metro / BAR_MAX) * barH;
                const shareH = (d.rideshare / BAR_MAX) * barH;
                return (
                  <g key={i}>
                    <rect x={x} y={barH - busH} width={barW} height={busH} fill={tk.primary} rx={4} opacity={0.9} />
                    <rect x={x} y={barH - busH - metroH} width={barW} height={metroH} fill="#818cf8" rx={2} opacity={0.9} />
                    <rect x={x} y={barH - busH - metroH - shareH} width={barW} height={shareH} fill={tk.amber} rx={2} opacity={0.9} />
                    <text x={x + barW / 2} y={barH - (d.bus + d.metro + d.rideshare) / BAR_MAX * barH - 5} fontSize={9} fill={tk.textDim} textAnchor="middle" fontFamily={SANS}>{total}</text>
                    <text x={x + barW / 2} y={barH + 14} fontSize={10} fill={tk.textFaint} textAnchor="middle" fontFamily={SANS}>{dayLblBn(i)}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            {[{ color: tk.primary, label: lbl('Bus', 'বাস') }, { color: '#818cf8', label: lbl('Metro', 'মেট্রো') }, { color: tk.amber, label: lbl('Rideshare', 'রাইডশেয়ার') }].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                <span style={{ fontFamily: font, fontSize: 11, color: tk.textDim }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div style={card}>
          <div style={{ fontFamily: font, fontWeight: 700, fontSize: 15, color: tk.text, marginBottom: 14 }}>{lbl('Mode Split', 'মোড বিভাজন')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <svg width={140} height={140} style={{ flexShrink: 0 }}>
              <circle cx={70} cy={70} r={52} fill="none" stroke={tk.line} strokeWidth={18} />
              {donutData.map((d, i) => {
                const dashLen = (d.pct / 100) * circumference;
                const el = (
                  <circle
                    key={i}
                    cx={70} cy={70} r={52}
                    fill="none"
                    stroke={d.color}
                    strokeWidth={18}
                    strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                    strokeDashoffset={-(donutOffset / 100) * circumference + circumference / 4}
                    strokeLinecap="butt"
                  />
                );
                donutOffset += d.pct;
                return el;
              })}
              <text x={70} y={65} textAnchor="middle" fontSize={20} fontWeight={700} fill={tk.text} fontFamily={SANS}>{total}</text>
              <text x={70} y={82} textAnchor="middle" fontSize={10} fill={tk.textDim} fontFamily={font}>{lbl('trips', 'ট্রিপ')}</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 140 }}>
              {donutData.map((d) => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontFamily: font, fontSize: 13, color: tk.text }}>{lbl(d.label, d.labelBn)}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, color: d.color }}>{d.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        </div>{/* end charts grid */}

        {/* 12-month line chart */}
        <div style={card}>
          <div style={{ fontFamily: font, fontWeight: 700, fontSize: 15, color: tk.text, marginBottom: 14 }}>{lbl('12-Month Trend', '১২ মাসের প্রবণতা')}</div>
          <div style={{ overflowX: 'auto' }}>
            <svg width={lineW} height={lineH + 20} style={{ display: 'block', maxWidth: '100%' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tk.primary} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={tk.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              {[0, lineMax / 2, lineMax].map((v) => {
                const y = lineH - 16 - ((v / lineMax) * (lineH - 32));
                return (
                  <g key={v}>
                    <line x1={0} y1={y} x2={lineW} y2={y} stroke={tk.line} strokeWidth={1} />
                    <text x={6} y={y - 3} fontSize={8} fill={tk.textFaint} fontFamily={SANS}>{Math.round(v)}</text>
                  </g>
                );
              })}
              <path d={areaPath} fill="url(#lineGrad)" />
              <path d={linePath} stroke={tk.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {/* Pulsing endpoint */}
              <circle cx={linePoints[linePoints.length - 1].x} cy={linePoints[linePoints.length - 1].y} r={5} fill={tk.primary}>
                <animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
              {/* Month labels */}
              {MONTHS.map((m, i) => (
                <text key={m + i} x={linePoints[i].x} y={lineH + 16} fontSize={9} fill={tk.textFaint} textAnchor="middle" fontFamily={SANS}>{m}</text>
              ))}
            </svg>
          </div>
        </div>

        {/* Heatmap */}
        <div style={card}>
          <div style={{ fontFamily: font, fontWeight: 700, fontSize: 15, color: tk.text, marginBottom: 14 }}>{lbl('Busy Hours', 'ব্যস্ত সময়')}</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 4 }}>
              <thead>
                <tr>
                  <td style={{ width: 36 }} />
                  {HEAT_HOURS.map((h) => (
                    <td key={h} style={{ fontFamily: SANS, fontSize: 10, color: tk.textFaint, textAlign: 'center', paddingBottom: 4 }}>{h}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEAT_DATA.map((row, ri) => (
                  <tr key={ri}>
                    <td style={{ fontFamily: font, fontSize: 10, color: tk.textFaint, paddingRight: 6, whiteSpace: 'nowrap' }}>{dayLblBn(ri)}</td>
                    {row.map((val, ci) => (
                      <td key={ci} style={{ width: 36, height: 28, background: heatColor(val, theme), borderRadius: 6 }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{ fontFamily: font, fontSize: 11, color: tk.textFaint }}>{lbl('Less', 'কম')}</span>
            {[0, 1, 2, 3, 4].map((v) => (
              <div key={v} style={{ width: 14, height: 14, borderRadius: 3, background: heatColor(v, theme) }} />
            ))}
            <span style={{ fontFamily: font, fontSize: 11, color: tk.textFaint }}>{lbl('More', 'বেশি')}</span>
          </div>
        </div>

        {/* AI insight */}
        <div style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.18), rgba(168,85,247,0.12))', border: '1px solid rgba(168,85,247,0.35)', borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🤖</span>
          <div>
            <div style={{ fontFamily: font, fontWeight: 700, fontSize: 14, color: '#c084fc', marginBottom: 4 }}>{lbl('AI Insight', 'AI অন্তর্দৃষ্টি')}</div>
            <div style={{ fontFamily: font, fontSize: 13, color: tk.text, lineHeight: 1.5 }}>
              {lbl(
                'You travel mostly on weekdays, 6–9AM peak. Metro saves you 25 min vs bus on your daily route.',
                'আপনি বেশিরভাগ কর্মদিনে ভ্রমণ করেন, সকাল ৬-৯টায় সর্বোচ্চ। মেট্রো আপনার দৈনন্দিন রুটে বাসের তুলনায় ২৫ মিনিট সাশ্রয় করে।',
              )}
            </div>
          </div>
        </div>

        {/* Most-used routes */}
        <div style={card}>
          <div style={{ fontFamily: font, fontWeight: 700, fontSize: 15, color: tk.text, marginBottom: 14 }}>{lbl('Most-Used Routes', 'সর্বাধিক ব্যবহৃত রুট')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOP_ROUTES.map((r) => (
              <div key={r.from + r.to}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: tk.text }}>{r.from} → {r.to}</span>
                  <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, color: r.color }}>{r.pct}%</span>
                </div>
                <div style={{ height: 6, background: tk.panelMuted, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, background: r.color, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent journeys */}
        <div style={card}>
          <div style={{ fontFamily: font, fontWeight: 700, fontSize: 15, color: tk.text, marginBottom: 14 }}>{lbl('Recent Journeys', 'সাম্প্রতিক যাত্রা')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {JOURNEYS.map((j) => (
              <div key={j.from + j.date} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: j.expensive ? tk.amberSoft : tk.panelMuted, borderRadius: 12, border: `1px solid ${j.expensive ? tk.amber + '44' : tk.line}` }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{j.mode}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: tk.text }}>
                    {lbl(j.from, j.fromBn)} → {lbl(j.to, j.toBn)}
                  </div>
                  <div style={{ fontFamily: font, fontSize: 11, color: tk.textDim, marginTop: 2 }}>{lbl(j.date, j.dateBn)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, color: j.expensive ? tk.amber : tk.primary }}>৳{j.fare}</div>
                  <div style={{ fontFamily: SANS, fontSize: 10, color: tk.textFaint, marginTop: 2 }}>🌿 {j.co2} kg</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>
      </div>
    </PageShell>
  );
}
