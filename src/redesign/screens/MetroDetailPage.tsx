import React, { useState, useEffect } from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens, Lang, N, Fare } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot, NativeAdCard, AdCluster } from '../components/AdSlot';
import { Train3D } from '../components/Vehicles3D';

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
  params?: Record<string, string>;
}

const STATIONS = [
  { name: 'Uttara North', nameBn: 'উত্তরা উত্তর', fare: 0, fareLabel: '৳0' },
  { name: 'Uttara Center', nameBn: 'উত্তরা সেন্টার', fare: 20, fareLabel: '৳20' },
  { name: 'Uttara South', nameBn: 'উত্তরা দক্ষিণ', fare: 20, fareLabel: '৳20' },
  { name: 'Pallabi', nameBn: 'পল্লবী', fare: 30, fareLabel: '৳30' },
  { name: 'Mirpur 11', nameBn: 'মিরপুর ১১', fare: 40, fareLabel: '৳40' },
  { name: 'Mirpur 10', nameBn: 'মিরপুর ১০', fare: 50, fareLabel: '৳50' },
  { name: 'Kazipara', nameBn: 'কাজীপাড়া', fare: 60, fareLabel: '৳60' },
  { name: 'Shewrapara', nameBn: 'শেওড়াপাড়া', fare: 60, fareLabel: '৳60' },
  { name: 'Agargaon', nameBn: 'আগারগাঁও', fare: 70, fareLabel: '৳70' },
  { name: 'Bijoy Sarani', nameBn: 'বিজয় সরণি', fare: 80, fareLabel: '৳80' },
  { name: 'Farmgate', nameBn: 'ফার্মগেট', fare: 80, fareLabel: '৳80', current: true },
  { name: 'Karwan Bazar', nameBn: 'কারওয়ান বাজার', fare: 90, fareLabel: '৳90' },
  { name: 'Shahbag', nameBn: 'শাহবাগ', fare: 90, fareLabel: '৳90' },
  { name: 'Dhaka University', nameBn: 'ঢাকা বিশ্ববিদ্যালয়', fare: 90, fareLabel: '৳90' },
  { name: 'Secretariat', nameBn: 'সচিবালয়', fare: 100, fareLabel: '৳100' },
  { name: 'Motijheel', nameBn: 'মতিঝিল', fare: 100, fareLabel: '৳100' },
  { name: 'Kamalapur', nameBn: 'কমলাপুর', fare: 100, fareLabel: '৳100' },
];

const HOW_TO_STEPS = [
  { icon: '🎫', en: 'Buy token at station counter or vending machine', bn: 'স্টেশন কাউন্টার বা ভেন্ডিং মেশিনে টোকেন কিনুন' },
  { icon: '📱', en: 'Tap contactless card or token at gate', bn: 'গেটে কার্ড বা টোকেন ট্যাপ করুন' },
  { icon: '🚇', en: 'Board at the correct platform', bn: 'সঠিক প্ল্যাটফর্মে উঠুন' },
  { icon: '🔄', en: 'Tap again on exit to pay fare', bn: 'বের হওয়ার সময় আবার ট্যাপ করুন' },
];

const TAGS = ['Fast', 'Clean', 'AC', 'On-time', 'Affordable'];
const TAGS_BN = ['দ্রুত', 'পরিষ্কার', 'এসি', 'সময়মতো', 'সাশ্রয়ী'];

const HISTOGRAM = [
  { stars: 5, pct: 72 },
  { stars: 4, pct: 18 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 2 },
];

export function MetroDetailPage(props: ScreenProps) {
  const { theme, device, lang, onNav } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const font = lang === 'bn' ? BEN : SANS;

  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    const id = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 120)), 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(countdown / 60);
  const secs = String(countdown % 60).padStart(2, '0');

  const card: React.CSSProperties = {
    background: tk.panel,
    border: `1px solid ${tk.line}`,
    borderRadius: 20,
    padding: isMobile ? 16 : 24,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: tk.shadow,
  };

  return (
    <PageShell {...props} canBack>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '32px 24px 60px' }}>

        {/* ── Hero Card ─────────────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, ${tk.metroBg} 0%, #001a2e 50%, #002a14 100%)`,
          border: `1px solid rgba(0,245,255,0.2)`,
          borderRadius: 24,
          padding: isMobile ? 20 : 32,
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(0,245,255,0.12)',
        }}>
          {/* Glow overlay */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 60% at 80% 50%, rgba(0,245,255,0.07) 0%, transparent 70%)' }} />

          {/* Train 3D */}
          <div style={{ position: 'absolute', right: isMobile ? -20 : 24, top: '50%', transform: 'translateY(-50%)', opacity: 0.65, pointerEvents: 'none' }}>
            <Train3D size={isMobile ? 130 : 180} palette={['#00b8d9', '#005080', '#fef3c7']} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* M6 Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                background: 'linear-gradient(135deg, #00b8d9, #0070ad)',
                borderRadius: 10,
                padding: '5px 12px',
                fontFamily: SANS, fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 1,
              }}>M6</div>
              <div style={{
                background: 'rgba(0,245,255,0.15)', border: '1px solid rgba(0,245,255,0.3)',
                borderRadius: 999, padding: '3px 10px',
                fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#00f5ff', letterSpacing: '0.06em',
              }}>MRT LINE 6</div>
            </div>

            <h1 style={{ fontFamily: font, fontSize: isMobile ? 22 : 30, fontWeight: 800, color: '#fff', margin: '0 0 4px', lineHeight: 1.2 }}>
              {lbl('Metro Rail MRT-6', 'মেট্রো রেল এমআরটি-৬')}
            </h1>
            <div style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 16 }}>
              Uttara North → Motijheel
            </div>

            {/* Current station + next train */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.25)',
                borderRadius: 14, padding: '10px 16px',
              }}>
                <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: '#00f5ff', marginBottom: 4 }}>
                  {lbl('Current Station', 'বর্তমান স্টেশন')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: font, fontSize: 16, fontWeight: 700, color: '#fff' }}>
                    {lbl('Farmgate', 'ফার্মগেট')}
                  </span>
                  <span style={{ background: '#22c55e', borderRadius: 999, padding: '2px 7px', fontFamily: SANS, fontSize: 10, fontWeight: 700, color: '#fff' }}>
                    {lbl('You are here', 'আপনি এখানে')}
                  </span>
                </div>
              </div>
              <div style={{
                background: 'rgba(255,184,0,0.12)', border: '1px solid rgba(255,184,0,0.25)',
                borderRadius: 14, padding: '10px 16px',
              }}>
                <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: '#ffb800', marginBottom: 4 }}>
                  {lbl('Next Train', 'পরবর্তী ট্রেন')}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: '#ffb800', fontVariantNumeric: 'tabular-nums' }}>
                  {N(mins, lang)}:{N(secs, lang)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Station Map ──────────────────────────────────────────────── */}
        <div style={{ ...card, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 16 }}>
            {lbl(`Full Route Map — ${N(17,lang)} Stations`, `সম্পূর্ণ রুট ম্যাপ — ${N(17,lang)} স্টেশন`)}
          </div>
          <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: STATIONS.length * 80, position: 'relative', paddingTop: 16 }}>
              {/* Connecting line */}
              <div style={{
                position: 'absolute',
                top: 31,
                left: 20,
                right: 20,
                height: 3,
                background: `linear-gradient(90deg, #00b8d9, #0070ad)`,
                borderRadius: 2,
                zIndex: 0,
              }} />

              {STATIONS.map((st, i) => (
                <div key={st.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80, flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  {/* Dot */}
                  <div style={{
                    width: st.current ? 20 : 12,
                    height: st.current ? 20 : 12,
                    borderRadius: '50%',
                    background: st.current ? '#00f5ff' : (i === 0 || i === STATIONS.length - 1 ? '#00b8d9' : tk.panel),
                    border: `3px solid ${st.current ? '#00f5ff' : '#00b8d9'}`,
                    boxShadow: st.current ? '0 0 12px rgba(0,245,255,0.8)' : undefined,
                    flexShrink: 0,
                    marginBottom: 6,
                  }} />
                  {/* Name (rotated) */}
                  <div style={{
                    transformOrigin: 'top center',
                    transform: 'rotate(45deg)',
                    whiteSpace: 'nowrap',
                    fontFamily: lang === 'bn' ? BEN : SANS,
                    fontSize: 10,
                    fontWeight: st.current ? 700 : 500,
                    color: st.current ? tk.primary : tk.textDim,
                    marginBottom: 28,
                    textAlign: 'left',
                  }}>
                    {lbl(st.name, st.nameBn)}
                  </div>
                  {/* Fare */}
                  <div style={{
                    fontFamily: SANS, fontSize: 10, fontWeight: 600,
                    color: st.fare === 0 ? '#22c55e' : tk.textFaint,
                    marginTop: 24,
                  }}>
                    {Fare(st.fare, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── How to Use ───────────────────────────────────────────────── */}
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 16 }}>
            {lbl('How to Use Metro', 'মেট্রো কীভাবে ব্যবহার করবেন')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12 }}>
            {HOW_TO_STEPS.map((step, i) => (
              <div key={i} style={{
                background: tk.panelMuted, border: `1px solid ${tk.line}`,
                borderRadius: 14, padding: '14px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: tk.primary, marginBottom: 4 }}>
                  {lbl(`Step ${N(i + 1, lang)}`, `ধাপ ${N(i + 1, lang)}`)}
                </div>
                <div style={{ fontFamily: font, fontSize: 12, color: tk.textDim, lineHeight: 1.4 }}>
                  {lbl(step.en, step.bn)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Fare Table ───────────────────────────────────────────────── */}
          <NativeAdCard
            tk={tk}
            lang={lang}
            kind="in-article"
            title={T(lang, 'মেট্রো যাত্রীদের জন্য', 'For metro riders')}
            icon="🚇"
          />
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 16 }}>
            {lbl('Fare Table (from Uttara North)', 'ভাড়ার তালিকা (উত্তরা উত্তর থেকে)')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 8 }}>
            {STATIONS.map((st) => (
              <div key={st.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: st.current ? tk.primarySoft : tk.panelMuted,
                border: `1px solid ${st.current ? tk.primary : tk.line}`,
                borderRadius: 10, padding: '8px 12px',
              }}>
                <span style={{ fontFamily: font, fontSize: 13, color: st.current ? tk.primary : tk.text, fontWeight: st.current ? 700 : 400 }}>
                  {lbl(st.name, st.nameBn)}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: st.fare === 0 ? '#22c55e' : tk.textDim }}>
                  {Fare(st.fare, lang)}
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 10, textAlign: 'center' }}>
            * {lbl('Uttara North is the free zone origin station', 'উত্তরা উত্তর ফ্রি জোন উৎস স্টেশন')}
          </div>
        </div>

        {/* ── Ratings ─────────────────────────────────────────────────── */}
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 16 }}>
            {lbl('Ratings & Reviews', 'রেটিং ও রিভিউ')}
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 16 : 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Big score */}
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontFamily: SANS, fontSize: 48, fontWeight: 900, color: tk.text, lineHeight: 1 }}>{N('4.8', lang)}</div>
              <div style={{ fontFamily: SANS, fontSize: 20, color: '#fbbf24', margin: '4px 0' }}>★★★★★</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint }}>{N('1,248', lang)} {lbl('reviews', 'রিভিউ')}</div>
            </div>
            {/* Histogram */}
            <div style={{ flex: 1, minWidth: 160 }}>
              {HISTOGRAM.map((row) => (
                <div key={row.stars} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: tk.textDim, width: 20, textAlign: 'right' }}>{N(row.stars, lang)}★</span>
                  <div style={{ flex: 1, height: 8, background: tk.panelMuted, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${row.pct}%`, height: '100%', background: '#fbbf24', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, width: 28 }}>{N(row.pct, lang)}%</span>
                </div>
              ))}
            </div>
          </div>
          {/* Tag cloud */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {TAGS.map((tag, i) => (
              <div key={tag} style={{
                background: tk.primarySoft, border: `1px solid ${tk.primary}`,
                borderRadius: 999, padding: '5px 12px',
                fontFamily: font, fontSize: 12, fontWeight: 600, color: tk.primary,
              }}>
                {lbl(tag, TAGS_BN[i])}
              </div>
            ))}
          </div>
        </div>

        {/* Ad Slot */}
        <div style={{ marginBottom: 24 }}>
          <NativeAdCard
            tk={tk}
            lang={lang}
            kind={isMobile ? 'mob-banner' : 'leaderboard'}
            title={T(lang, 'ঢাকা মেট্রো অফার', 'Dhaka metro offers')}
            icon="🎫"
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
          <AdCluster tk={tk} lang={lang} count={2} isMobile={isMobile}/>
    </PageShell>
  );
}
