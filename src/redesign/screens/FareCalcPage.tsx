import React, { useState } from 'react';
import { KJ_TOKENS, SANS, BEN, T, Tokens, Lang } from '../tokens';
import { AdSlot, NativeAdCard, AdCluster } from '../components/AdSlot';
import { PageShell } from './PageShell';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:Lang; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const MRT_STATIONS = [
  'Uttara North', 'Uttara Center', 'Uttara South', 'Pallabi',
  'Mirpur 11', 'Mirpur 10', 'Kazipara', 'Shewrapara',
  'Agargaon', 'Bijoy Sarani', 'Farmgate', 'Karwan Bazar',
  'Shahbag', 'Dhaka University', 'Secretariat', 'Motijheel', 'Kamalapur',
];

const MRT_STATIONS_BN = [
  'উত্তরা উত্তর', 'উত্তরা সেন্টার', 'উত্তরা দক্ষিণ', 'পল্লবী',
  'মিরপুর ১১', 'মিরপুর ১০', 'কাজীপাড়া', 'শেওড়াপাড়া',
  'আগারগাঁও', 'বিজয় সরণি', 'ফার্মগেট', 'কারওয়ান বাজার',
  'শাহবাগ', 'ঢাকা বিশ্ববিদ্যালয়', 'সচিবালয়', 'মতিঝিল', 'কমলাপুর',
];

type Mode = 'bus' | 'metro' | 'cng' | 'rideshare';

const MODE_META: Record<Mode, { label: string; labelBn: string; icon: string; color: string }> = {
  metro:     { label: 'Metro',     labelBn: 'মেট্রো',     icon: '🚇', color: '#3b82f6' },
  bus:       { label: 'Bus',       labelBn: 'বাস',       icon: '🚌', color: '#10b981' },
  cng:       { label: 'CNG',       labelBn: 'সিএনজি',    icon: '🛺', color: '#f59e0b' },
  rideshare: { label: 'Rideshare', labelBn: 'রাইডশেয়ার', icon: '🚕', color: '#a855f7' },
};

function calcMetroFare(stationsApart: number): number {
  const table: Record<number, number> = { 1: 20, 2: 30, 3: 40, 4: 50, 5: 60, 6: 70, 7: 80, 8: 90 };
  return stationsApart >= 9 ? 100 : (table[stationsApart] ?? 20);
}

function calcFare(mode: Mode, stationsApart: number): number {
  const km = stationsApart;
  switch (mode) {
    case 'metro':     return calcMetroFare(stationsApart);
    case 'bus':       return 20 + 5 * km;
    case 'cng':       return 80 + 15 * km;
    case 'rideshare': return 100 + 20 * km;
  }
}

function calcTime(mode: Mode, stationsApart: number): string {
  const base = { metro: 3, bus: 7, cng: 6, rideshare: 5 }[mode];
  const minutes = base * stationsApart;
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function FareCalcPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const isMobile = device === 'mobile';
  const tk: Tokens = KJ_TOKENS[theme];
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState<Mode>('metro');
  const lbl = (en: string, bn: string) => T(lang, bn, en);

  const fromIdx = MRT_STATIONS.indexOf(from);
  const toIdx = MRT_STATIONS.indexOf(to);
  const stationsApart = fromIdx >= 0 && toIdx >= 0 ? Math.abs(fromIdx - toIdx) : 0;
  const hasResult = fromIdx >= 0 && toIdx >= 0 && stationsApart > 0;
  const primaryFare = hasResult ? calcFare(mode, stationsApart) : 0;
  const studentFare = Math.round(primaryFare * 0.75);

  const selectStyle: React.CSSProperties = {
    width: '100%',
    background: tk.inputBg,
    border: `1px solid ${tk.line}`,
    borderRadius: 12,
    padding: '12px 14px',
    fontFamily: lang === 'bn' ? BEN : SANS,
    fontSize: 14,
    color: tk.text,
    outline: 'none',
    boxSizing: 'border-box',
    appearance: 'none' as const,
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
    textTransform: 'uppercase' as const, color: tk.textFaint, marginBottom: 6, display: 'block',
  };

  return (
    <PageShell {...props}>
    <div style={{ color: tk.text }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 60%, #38bdf8 100%)',
        padding: isMobile ? '32px 16px 28px' : '48px 32px 36px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 80% at 90% 50%, rgba(255,255,255,0.08), transparent)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: isMobile ? '0 16px' : '0 40px' }}>
          <div style={{ fontSize: isMobile ? 40 : 56, marginBottom: 8 }}>🧮</div>
          <h1 style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: isMobile ? 26 : 36, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
            {lbl('Fare Calculator', 'ভাড়া ক্যালকুলেটর')}
          </h1>
          <p style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            {lbl('Compare metro, bus, CNG, and rideshare fares instantly', 'মেট্রো, বাস, সিএনজি ও রাইডশেয়ার ভাড়া তুলনা করুন')}
          </p>
        </div>
      </div>

      <div style={{ padding: isMobile ? '20px 16px' : '28px 40px', maxWidth: 1000, margin: '0 auto' }}>
        {/* Input card */}
        <div style={{
          background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 20,
          padding: isMobile ? 18 : 28, boxShadow: tk.shadow,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          marginBottom: 24,
        }}>
          {/* Station selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end', marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>{lbl('From Station', 'প্রারম্ভিক স্টেশন')}</label>
              <select style={selectStyle} value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="">{lbl('Select station', 'স্টেশন বেছে নিন')}</option>
                {MRT_STATIONS.map((s, i) => (
                  <option key={s} value={s}>{lang === 'bn' ? MRT_STATIONS_BN[i] : s}</option>
                ))}
              </select>
            </div>

            {/* Swap button */}
            <button
              onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}
              style={{
                background: tk.primarySoft, border: `1px solid ${tk.primary}`,
                borderRadius: 10, width: 40, height: 44, cursor: 'pointer',
                fontFamily: SANS, fontSize: 18, color: tk.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ⇄
            </button>

            <div>
              <label style={labelStyle}>{lbl('To Station', 'গন্তব্য স্টেশন')}</label>
              <select style={selectStyle} value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="">{lbl('Select station', 'স্টেশন বেছে নিন')}</option>
                {MRT_STATIONS.map((s, i) => (
                  <option key={s} value={s}>{lang === 'bn' ? MRT_STATIONS_BN[i] : s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode selector */}
          <div>
            <label style={labelStyle}>{lbl('Transport Mode', 'পরিবহনের ধরন')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {(Object.keys(MODE_META) as Mode[]).map((m) => {
                const meta = MODE_META[m];
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      background: mode === m ? `${meta.color}22` : tk.panelMuted,
                      border: `1px solid ${mode === m ? meta.color : tk.line}`,
                      borderRadius: 10, padding: '10px 4px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{meta.icon}</span>
                    <span style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 11, fontWeight: 600, color: mode === m ? meta.color : tk.textDim }}>
                      {lbl(meta.label, meta.labelBn)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results card */}
        {hasResult && (
          <div style={{
            background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 20,
            padding: isMobile ? 18 : 28, boxShadow: tk.shadowLg,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            marginBottom: 24,
          }}>
            {/* Primary result */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontFamily: SANS, fontSize: 12, color: tk.textFaint, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {MODE_META[mode].icon} {lbl(MODE_META[mode].label, MODE_META[mode].labelBn)} · {lbl(`${stationsApart} stations`, `${stationsApart} স্টেশন`)} · ~{stationsApart} km
              </div>
              <div style={{ fontFamily: SANS, fontSize: 60, fontWeight: 900, color: MODE_META[mode].color, lineHeight: 1 }}>
                ৳{primaryFare}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: tk.textDim, marginTop: 6 }}>
                {lbl('Estimated travel time:', 'আনুমানিক সময়:')} <strong>{calcTime(mode, stationsApart)}</strong>
              </div>
            </div>

            {/* Comparison table */}
            <div style={{ borderTop: `1px solid ${tk.line}`, paddingTop: 20, marginBottom: 20 }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 12 }}>
                {lbl('All modes comparison', 'সব পরিবহন তুলনা')}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {[lbl('Mode', 'পরিবহন'), lbl('Fare', 'ভাড়া'), lbl('Time', 'সময়'), lbl('Notes', 'মন্তব্য')].map((h) => (
                      <th key={h} style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: tk.textFaint, textAlign: 'left', padding: '6px 8px', borderBottom: `1px solid ${tk.line}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(MODE_META) as Mode[]).map((m) => {
                    const meta = MODE_META[m];
                    const fare = calcFare(m, stationsApart);
                    const time = calcTime(m, stationsApart);
                    const notes: Record<Mode, { en: string; bn: string }> = {
                      metro: { en: 'Fastest, reliable', bn: 'দ্রুত, নির্ভরযোগ্য' },
                      bus: { en: 'Affordable', bn: 'সাশ্রয়ী' },
                      cng: { en: 'Door-to-door', bn: 'দরজা থেকে দরজা' },
                      rideshare: { en: 'Comfortable', bn: 'আরামদায়ক' },
                    };
                    return (
                      <tr key={m} style={{ background: m === mode ? `${meta.color}10` : 'transparent' }}>
                        <td style={{ padding: '10px 8px', borderBottom: `1px solid ${tk.line}` }}>
                          <span style={{ fontFamily: SANS, fontSize: 14 }}>{meta.icon}</span>
                          <span style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: m === mode ? 700 : 400, color: m === mode ? meta.color : tk.text, marginLeft: 6 }}>
                            {lbl(meta.label, meta.labelBn)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', borderBottom: `1px solid ${tk.line}`, fontFamily: SANS, fontSize: 14, fontWeight: 700, color: meta.color }}>
                          ৳{fare}
                        </td>
                        <td style={{ padding: '10px 8px', borderBottom: `1px solid ${tk.line}`, fontFamily: SANS, fontSize: 13, color: tk.textDim }}>
                          ~{time}
                        </td>
                        <td style={{ padding: '10px 8px', borderBottom: `1px solid ${tk.line}`, fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, color: tk.textFaint }}>
                          {lbl(notes[m].en, notes[m].bn)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Student discount */}
            <div style={{
              background: '#3b82f622', border: '1px solid #3b82f6', borderRadius: 12,
              padding: '10px 14px', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>🎓</span>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>
                  {lbl('Student Discount: 25% off metro', 'ছাত্র ছাড়: মেট্রোতে ২৫% ছাড়')}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: tk.textDim, marginTop: 2 }}>
                  {lbl(`Metro fare with student card: ৳${calcFare('metro', stationsApart)} → ৳${Math.round(calcFare('metro', stationsApart) * 0.75)}`,
                    `ছাত্র কার্ডে মেট্রো: ৳${calcFare('metro', stationsApart)} → ৳${Math.round(calcFare('metro', stationsApart) * 0.75)}`)}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{
              background: tk.amberSoft, border: `1px solid ${tk.amber}`, borderRadius: 10,
              padding: '8px 12px', fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, color: tk.textDim,
              display: 'flex', alignItems: 'flex-start', gap: 6,
            }}>
              <span>ℹ</span>
              {lbl('KoyJabo shows info only — fares may vary based on traffic, time of day, and operator.',
                'KoyJabo শুধু তথ্য প্রদান করে — ভাড়া ট্র্যাফিক, সময় ও অপারেটর ভেদে পরিবর্তন হতে পারে।')}
            </div>
          </div>
        )}

        {/* Empty state when no stations selected */}
        {!hasResult && from !== '' && to !== '' && (
          <div style={{
            background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16,
            padding: 24, textAlign: 'center', color: tk.textDim, fontFamily: SANS,
            marginBottom: 24,
          }}>
            {lbl('Please select two different stations to calculate fare.', 'ভাড়া হিসাব করতে দুটি আলাদা স্টেশন বেছে নিন।')}
          </div>
        )}

        {/* Ad slot */}
        <div style={{ margin: '12px 0' }}>
          <NativeAdCard
            tk={tk}
            lang={lang}
            kind="in-article"
            title={T(lang, 'ভ্রমণ ও রাইড অফার', 'Travel & ride offers')}
            icon="🎯"
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <NativeAdCard
            tk={tk}
            lang={lang}
            kind={isMobile ? 'mob-banner' : 'mid-rect'}
            title={T(lang, 'ভাড়া সাশ্রয়ের টিপস', 'Save on your fare')}
            icon="💰"
            compact
          />
        </div>
          <NativeAdCard
            tk={tk}
            lang={lang}
            kind="multiplex"
            title={T(lang, 'আরও দেখুন', 'More like this')}
            subtitle={T(lang, 'পরিবহন ও ভ্রমণ', 'Transport & travel')}
            icon="🧭"
          />
      </div>

    </div>
          <AdCluster tk={tk} lang={lang} count={2} isMobile={isMobile}/>
    </PageShell>
  );
}
