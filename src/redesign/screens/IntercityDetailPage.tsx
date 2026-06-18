import React, { useState } from 'react';
import { KJ_TOKENS, SANS, BEN, T, Tokens, Lang } from '../tokens';
import { AdSlot } from '../components/AdSlot';
import { PageShell } from './PageShell';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:Lang; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

type TabId = 'seats' | 'route' | 'bus' | 'photos' | 'reviews' | 'policy';

const TABS: { id: TabId; en: string; bn: string }[] = [
  { id: 'seats', en: 'Seats', bn: 'সিট' },
  { id: 'route', en: 'Route & Stops', bn: 'রুট ও স্টপ' },
  { id: 'bus', en: 'Bus & Amenities', bn: 'বাস ও সুবিধা' },
  { id: 'photos', en: 'Photos', bn: 'ছবি' },
  { id: 'reviews', en: 'Reviews', bn: 'রিভিউ' },
  { id: 'policy', en: 'Policy', bn: 'নীতি' },
];

const STOPS = [
  { name: 'Sayedabad', nameBn: 'সায়েদাবাদ', time: '9:00 PM', kind: 'boarding' },
  { name: 'Kanchpur', nameBn: 'কাঁচপুর', time: '9:45 PM', kind: 'stop' },
  { name: 'Comilla', nameBn: 'কুমিল্লা', time: '11:30 PM', kind: 'rest' },
  { name: 'Chittagong', nameBn: 'চট্টগ্রাম', time: '2:30 AM', kind: 'stop' },
  { name: 'Kolatoli', nameBn: 'কলাতলী', time: '6:30 AM', kind: 'destination' },
];

const AMENITIES = [
  { label: 'AC', labelBn: 'এসি', icon: '❄️', available: true },
  { label: 'Recliner', labelBn: 'রিক্লাইনার', icon: '💺', available: true },
  { label: 'Charger', labelBn: 'চার্জার', icon: '🔌', available: true },
  { label: 'Toilet', labelBn: 'টয়লেট', icon: '🚻', available: true },
  { label: 'Snacks', labelBn: 'স্ন্যাকস', icon: '🍿', available: true },
  { label: 'Water', labelBn: 'পানি', icon: '💧', available: true },
  { label: 'WiFi', labelBn: 'ওয়াইফাই', icon: '📶', available: false },
  { label: 'TV', labelBn: 'টিভি', icon: '📺', available: true },
];

// Seat layout: 10 rows × 4 seats (2+2)
type SeatState = 'available' | 'booked' | 'selected' | 'ladies';
const INITIAL_SEATS: SeatState[][] = Array.from({ length: 10 }, (_, row) =>
  Array.from({ length: 4 }, (__, col) => {
    if ((row === 2 && col === 0) || (row === 2 && col === 1) || (row === 4 && col === 2)) return 'booked';
    if (row === 1 && col === 3) return 'ladies';
    if (row === 0 && col === 0) return 'selected';
    return 'available';
  })
);

const SEAT_COLORS: Record<SeatState, { bg: string; border: string; label: string }> = {
  available:  { bg: 'transparent',   border: '#10b981', label: 'Available' },
  booked:     { bg: '#374151',        border: '#374151', label: 'Booked' },
  selected:   { bg: '#10b981',        border: '#10b981', label: 'Selected' },
  ladies:     { bg: '#fce7f355',      border: '#ec4899', label: "Ladies'" },
};

const SPONSORED_CARDS = [
  {
    brand: 'bKash', brandColor: '#e2136e', icon: '💳',
    title: '10% cashback on bus tickets',
    titleBn: 'বাস টিকেটে ১০% ক্যাশব্যাক',
    sub: 'Pay with bKash · T&C apply',
    subBn: 'bKash দিয়ে পেমেন্ট করুন',
  },
  {
    brand: 'Travel Insurance', brandColor: '#0ea5e9', icon: '🛡️',
    title: 'Cover your intercity journey',
    titleBn: 'আপনার যাত্রা সুরক্ষিত রাখুন',
    sub: 'From ৳49 per trip',
    subBn: '৳৪৯ থেকে শুরু প্রতি ট্রিপে',
  },
  {
    brand: 'Uber', brandColor: '#000', icon: '🚗',
    title: '50% off your next ride',
    titleBn: 'পরের রাইডে ৫০% ছাড়',
    sub: 'Use code KOYJABO50',
    subBn: 'কোড KOYJABO50 ব্যবহার করুন',
  },
];

function SeatsTab({ tk, lang }: { tk: Tokens; lang: Lang }) {
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const [seats, setSeats] = useState<SeatState[][]>(INITIAL_SEATS);

  const toggleSeat = (row: number, col: number) => {
    setSeats((prev) => {
      const next = prev.map((r) => [...r]);
      const cur = next[row][col];
      if (cur === 'booked' || cur === 'ladies') return next;
      next[row][col] = cur === 'selected' ? 'available' : 'selected';
      return next;
    });
  };

  return (
    <div>
      <div style={{ fontFamily: SANS, fontSize: 12, color: tk.textFaint, marginBottom: 16, lineHeight: 1.5 }}>
        {lbl('Seats shown for reference · purchase at operator counter', 'সিট শুধু রেফারেন্সের জন্য · কাউন্টারে কিনুন')}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        {(Object.entries(SEAT_COLORS) as [SeatState, typeof SEAT_COLORS[SeatState]][]).map(([state, meta]) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              background: meta.bg, border: `2px solid ${meta.border}`,
            }} />
            <span style={{ fontFamily: SANS, fontSize: 12, color: tk.textDim }}>{meta.label}</span>
          </div>
        ))}
      </div>

      {/* Seat grid */}
      <div style={{
        background: tk.panelMuted, borderRadius: 16, padding: 20,
        border: `1px solid ${tk.line}`, display: 'inline-block',
      }}>
        {/* Front label */}
        <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, textAlign: 'center', marginBottom: 12 }}>
          {lbl('FRONT →', 'সামনে →')}
        </div>
        {seats.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, width: 18, textAlign: 'right', flexShrink: 0 }}>
              {ri + 1}
            </span>
            {row.map((state, ci) => (
              <React.Fragment key={ci}>
                {ci === 2 && (
                  <div style={{ width: 12, flexShrink: 0 }} />
                )}
                <button
                  onClick={() => toggleSeat(ri, ci)}
                  style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: SEAT_COLORS[state].bg,
                    border: `2px solid ${SEAT_COLORS[state].border}`,
                    cursor: state === 'booked' ? 'not-allowed' : 'pointer',
                    fontFamily: SANS, fontSize: 10, fontWeight: 600,
                    color: state === 'selected' ? '#fff' : state === 'booked' ? '#6b7280' : state === 'ladies' ? '#ec4899' : '#10b981',
                    transition: 'all 0.1s ease',
                  }}
                  title={`Row ${ri + 1} Seat ${ci + 1} — ${state}`}
                >
                  {`${ri + 1}${String.fromCharCode(65 + ci)}`}
                </button>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteTab({ tk, lang }: { tk: Tokens; lang: Lang }) {
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const kindColor: Record<string, string> = { boarding: '#10b981', stop: '#3b82f6', rest: '#f59e0b', destination: '#ef4444' };
  const kindLabel: Record<string, { en: string; bn: string }> = {
    boarding: { en: 'Boarding', bn: 'যাত্রা শুরু' },
    stop: { en: 'Stop', bn: 'স্টপ' },
    rest: { en: 'Rest Stop', bn: 'বিরতি' },
    destination: { en: 'Destination', bn: 'গন্তব্য' },
  };
  return (
    <div>
      {STOPS.map((stop, i) => (
        <div key={stop.name} style={{ display: 'flex', gap: 16, position: 'relative' }}>
          {/* Vertical line */}
          {i < STOPS.length - 1 && (
            <div style={{
              position: 'absolute', left: 14, top: 28, bottom: 0, width: 2,
              background: tk.line, zIndex: 0,
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: kindColor[stop.kind], border: `3px solid ${tk.bg}`,
              boxShadow: `0 0 0 2px ${kindColor[stop.kind]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {stop.kind === 'boarding' && <span style={{ fontSize: 11 }}>▶</span>}
              {stop.kind === 'destination' && <span style={{ fontSize: 11 }}>★</span>}
              {stop.kind === 'rest' && <span style={{ fontSize: 11 }}>☕</span>}
              {stop.kind === 'stop' && <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>•</span>}
            </div>
          </div>
          <div style={{ paddingBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 15, fontWeight: 600, color: tk.text }}>
                {lbl(stop.name, stop.nameBn)}
              </span>
              <span style={{
                background: `${kindColor[stop.kind]}22`, border: `1px solid ${kindColor[stop.kind]}`,
                borderRadius: 6, padding: '2px 8px',
                fontFamily: SANS, fontSize: 11, fontWeight: 600, color: kindColor[stop.kind],
              }}>
                {lbl(kindLabel[stop.kind].en, kindLabel[stop.kind].bn)}
              </span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: tk.textFaint, marginTop: 2 }}>
              🕐 {stop.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BusTab({ tk, lang }: { tk: Tokens; lang: Lang }) {
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {AMENITIES.map((a) => (
        <div key={a.label} style={{
          background: a.available ? '#10b98122' : tk.panelMuted,
          border: `1px solid ${a.available ? '#10b981' : tk.line}`,
          borderRadius: 14, padding: '16px 8px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 26, marginBottom: 6 }}>{a.icon}</div>
          <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, fontWeight: 600, color: a.available ? '#10b981' : tk.textFaint }}>
            {lbl(a.label, a.labelBn)}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 10, color: a.available ? '#10b981' : tk.textFaint, marginTop: 3 }}>
            {a.available ? lbl('✓ Available', '✓ আছে') : lbl('N/A', 'নেই')}
          </div>
        </div>
      ))}
    </div>
  );
}

export function IntercityDetailPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const isMobile = device === 'mobile';
  const tk: Tokens = KJ_TOKENS[theme];
  const [activeTab, setActiveTab] = useState<TabId>('seats');
  const lbl = (en: string, bn: string) => T(lang, bn, en);

  const tabContent = () => {
    switch (activeTab) {
      case 'seats': return <SeatsTab tk={tk} lang={lang} />;
      case 'route': return <RouteTab tk={tk} lang={lang} />;
      case 'bus': return <BusTab tk={tk} lang={lang} />;
      case 'photos': return (
        <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14, color: tk.textDim }}>
          {lbl('Photos will be added by the community.', 'কমিউনিটি ছবি যোগ করবে।')}
        </div>
      );
      case 'reviews': return (
        <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14, color: tk.textDim }}>
          {lbl('Reviews from fellow passengers.', 'অন্য যাত্রীদের রিভিউ।')}
        </div>
      );
      case 'policy': return (
        <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14, color: tk.textDim, lineHeight: 1.6 }}>
          {lbl('Cancellation and refund policy: No refund after boarding. Ticket transfer allowed 2h before departure.',
            'বাতিল ও রিফান্ড নীতি: বোর্ডিংয়ের পরে রিফান্ড নেই। ছাড়ার ২ ঘণ্টা আগে টিকেট স্থানান্তর সম্ভব।')}
        </div>
      );
    }
  };

  return (
    <PageShell {...props}>
    <div style={{ color: tk.text }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 55%, #022c22 100%)',
        padding: isMobile ? '28px 16px 24px' : '40px 32px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 80% 50%, rgba(16,185,129,0.12), transparent)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Brand row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #006a4e 0%, #10b981 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: SANS, fontSize: 16, fontWeight: 800, color: '#fff',
              flexShrink: 0,
            }}>
              GL
            </div>
            <div>
              <h1 style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: isMobile ? 20 : 26, fontWeight: 800, color: '#fff', margin: 0 }}>
                {lbl('Green Line Paribahan', 'গ্রীন লাইন পরিবহন')}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                  ⭐ 4.2 (324 {lbl('reviews', 'রিভিউ')})
                </span>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '3px 10px',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} className="kj-anim-pulse" />
                  <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.07em' }}>
                    {lbl('Live info', 'লাইভ তথ্য')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Journey strip */}
          <div style={{
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 16,
            padding: isMobile ? '14px 16px' : '16px 24px',
            display: 'flex', alignItems: 'center', gap: 16,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{lbl('Dhaka', 'ঢাকা')}</div>
              <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: '#fff' }}>9:00 PM</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Sayedabad</div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>9h 30m</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontSize: 16 }}>✈</span>
                <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.4)' }} />
              </div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{lbl("Cox's Bazar", 'কক্সবাজার')}</div>
              <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: '#fff' }}>6:30 AM</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Kolatoli</div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { val: '380km', label: lbl('Distance', 'দূরত্ব') },
              { val: '8', label: lbl('Stops', 'স্টপ') },
              { val: '46', label: lbl('Seats', 'সিট') },
              { val: '100km/h', label: lbl('Avg speed', 'গতি') },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 14px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: '#fff' }}>{s.val}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content + sidebar layout */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px' : '24px 32px',
        display: 'flex', gap: 28, alignItems: 'flex-start',
      }}>
        {/* Main panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', overflowX: 'auto', gap: 4,
            borderBottom: `1px solid ${tk.line}`, marginBottom: 24, paddingBottom: 0,
          }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 14px', whiteSpace: 'nowrap',
                  fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? tk.primary : tk.textDim,
                  borderBottom: `2px solid ${activeTab === tab.id ? tk.primary : 'transparent'}`,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {lbl(tab.en, tab.bn)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ marginBottom: 24 }}>{tabContent()}</div>

          {/* Inline ads */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', marginBottom: 24 }}>
            <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
            <AdSlot tk={tk} lang={lang} kind="mid-rect" />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SPONSORED_CARDS.map((card) => (
                <div key={card.brand} style={{
                  background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${card.brandColor}22`, border: `1px solid ${card.brandColor}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: card.brandColor, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      {card.brand}
                    </div>
                    <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14, fontWeight: 600, color: tk.text }}>
                      {lbl(card.title, card.titleBn)}
                    </div>
                    <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, color: tk.textDim }}>
                      {lbl(card.sub, card.subBn)}
                    </div>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 18, color: tk.textFaint }}>›</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
          </div>
        </div>

        {/* Right sidebar — desktop only */}
        {!isMobile && (
          <div style={{
            width: 280, flexShrink: 0,
            position: 'sticky', top: 76,
          }}>
            {/* Price info card */}
            <div style={{
              background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 18,
              padding: 20, boxShadow: tk.shadow,
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              marginBottom: 16,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 16 }}>
                {lbl('Price Info', 'মূল্য তথ্য')}
              </div>
              <div style={{ borderBottom: `1px solid ${tk.line}`, paddingBottom: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: tk.textDim }}>{lbl('AC Sleeper', 'এসি স্লিপার')}</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#10b981' }}>৳900–1200</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: tk.textDim }}>{lbl('Non-AC', 'নন-এসি')}</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#10b981' }}>৳700</span>
                </div>
              </div>

              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 10 }}>
                {lbl('Where to Buy', 'কোথায় কিনবেন')}
              </div>
              {[
                { icon: '🌐', label: 'greenlinebd.com' },
                { icon: '🏢', label: lbl('Sayedabad counter', 'সায়েদাবাদ কাউন্টার') },
                { icon: '📞', label: '01700-000000' },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                  fontFamily: SANS, fontSize: 13, color: tk.textDim,
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}

              <div style={{
                marginTop: 14, background: tk.amberSoft, border: `1px solid ${tk.amber}`,
                borderRadius: 10, padding: '8px 10px',
                fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 11, color: tk.textDim, lineHeight: 1.5,
              }}>
                ℹ {lbl("KoyJabo doesn't sell tickets · info only", 'KoyJabo টিকেট বিক্রি করে না · শুধু তথ্য')}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
    </PageShell>
  );
}
