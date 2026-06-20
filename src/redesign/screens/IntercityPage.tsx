import React, { useState, useMemo, useRef } from 'react';
import { KJ_TOKENS, SANS, BEN, T, Tokens, Lang } from '../tokens';
import { AdSlot } from '../components/AdSlot';
import { PageShell } from './PageShell';
import { Plane3D } from '../components/Vehicles3D';
import { INTERCITY_BUS_ROUTES, BUS_OPERATORS, MAJOR_TRANSPORT_HUBS } from '../../../data/intercityData';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';
import { earnCoins } from '../utils/koyCoinService';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:Lang; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const OPERATORS = [
  {
    code: 'GL', name: 'Green Line Paribahan', nameBn: 'গ্রীন লাইন পরিবহন',
    from: 'Dhaka', fromBn: 'ঢাকা', to: "Cox's Bazar", toBn: 'কক্সবাজার',
    fare: '৳900–2500', duration: '10-12h', type: 'AC sleeper', typeBn: 'এসি স্লিপার',
    rating: 4.2, depart: '9PM', departBn: 'রাত ৯টা',
    g1: '#006a4e', g2: '#10b981',
  },
  {
    code: 'HF', name: 'Hanif Enterprise', nameBn: 'হানিফ এন্টারপ্রাইজ',
    from: 'Dhaka', fromBn: 'ঢাকা', to: 'Chittagong', toBn: 'চট্টগ্রাম',
    fare: '৳680', duration: '6h', type: 'AC', typeBn: 'এসি',
    rating: 4.0, depart: '8PM', departBn: 'রাত ৮টা',
    g1: '#d92644', g2: '#ff7a3a',
  },
  {
    code: 'SH', name: 'Shyamoli Paribahan', nameBn: 'শ্যামলী পরিবহন',
    from: 'Multiple', fromBn: 'একাধিক রুট', to: 'routes', toBn: '',
    fare: '৳600–3000', duration: 'varies', type: 'AC/Non-AC', typeBn: 'এসি/নন-এসি',
    rating: 4.1, depart: 'Various', departBn: 'বিভিন্ন সময়',
    g1: '#b46a13', g2: '#f7b955',
  },
  {
    code: 'RC', name: 'Royal Coach', nameBn: 'রয়্যাল কোচ',
    from: 'Dhaka', fromBn: 'ঢাকা', to: "Cox's Bazar", toBn: 'কক্সবাজার',
    fare: '৳1200', duration: '10h', type: 'Luxury AC', typeBn: 'লাক্সারি এসি',
    rating: 4.5, depart: '10PM', departBn: 'রাত ১০টা',
    g1: '#7c3aed', g2: '#5b21b6',
  },
];

const CHIPS = [
  { label: 'Bus', labelBn: 'বাস', icon: '🚌' },
  { label: 'Train', labelBn: 'ট্রেন', icon: '🚆' },
  { label: 'Flight', labelBn: 'ফ্লাইট', icon: '✈️' },
  { label: 'Launch', labelBn: 'লঞ্চ', icon: '⛴️' },
];

const STATS = [
  { val: '64', label: 'Districts', labelBn: 'জেলা' },
  { val: '4', label: 'Modes', labelBn: 'পরিবহন' },
  { val: 'Live', label: 'Schedules', labelBn: 'শিডিউল' },
  { val: '50+', label: 'Operators', labelBn: 'অপারেটর' },
];

const ALL_INTERCITY_LOCATIONS = [...INTERCITY_BUS_ROUTES, ...MAJOR_TRANSPORT_HUBS];

export function IntercityPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const isMobile = device === 'mobile';
  const tk: Tokens = KJ_TOKENS[theme];
  const [activeChip, setActiveChip] = useState(params?.mode === 'flights' ? 'Flight' : 'Bus');
  const [nameSearch, setNameSearch] = useState(params?.search ?? '');
  const [from, setFrom] = useState(params?.from ?? '');
  const [to, setTo] = useState(params?.to ?? '');

  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  // District suggestions from real data
  const districtSuggestions: Suggestion[] = useMemo(() =>
    ALL_INTERCITY_LOCATIONS.filter(r => r.district !== 'Dhaka').map(r => ({
      id: r.district, label: r.district, sub: r.division + ' Division'
    })), []
  );

  const filterDistricts = (q: string): Suggestion[] => {
    if (!q.trim()) return [{ id: 'dhaka', label: 'Dhaka', sub: 'Dhaka Division' }, ...districtSuggestions.slice(0, 7)];
    const lq = q.toLowerCase();
    return districtSuggestions.filter(s => s.label.toLowerCase().includes(lq)).slice(0, 8);
  };

  const filteredDistricts = useMemo(() => {
    const q = (nameSearch || from || to).toLowerCase().trim();
    if (!q) return ALL_INTERCITY_LOCATIONS.filter(r => r.district !== 'Dhaka');
    return ALL_INTERCITY_LOCATIONS.filter(r =>
      r.district.toLowerCase().includes(q) ||
      r.route.toLowerCase().includes(q) ||
      r.busOperators.some(op => op.toLowerCase().includes(q))
    );
  }, [nameSearch, from, to]);

  const DIVISION_COLORS: Record<string, string> = {
    Dhaka: '#3b82f6', Chattogram: '#10b981', Sylhet: '#a855f7',
    Khulna: '#06b6d4', Rajshahi: '#f59e0b', Barishal: '#ec4899',
    Mymensingh: '#14b8a6', Rangpur: '#f97316',
  };

  const inputStyle: React.CSSProperties = {
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
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: tk.textFaint,
    marginBottom: 6,
    display: 'block',
  };

  return (
    <PageShell {...props}>
    <div style={{ color: tk.text }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 55%, #0ea5e9 100%)',
          padding: isMobile ? '40px 16px 32px' : '56px 32px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 80% at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)',
        }} />

        {/* Plane in top-right */}
        <div style={{ position: 'absolute', top: isMobile ? 12 : 20, right: isMobile ? 8 : 32, opacity: 0.85, zIndex: 1 }}>
          <Plane3D size={isMobile ? 120 : 160} palette={['#93c5fd', '#1e40af', '#ef4444']} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 999, padding: '4px 12px', marginBottom: 16,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} className="kj-anim-pulse" />
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>
              {lbl('LIVE SCHEDULES', 'লাইভ শিডিউল')}
            </span>
          </div>

          <h1 style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: isMobile ? 28 : 40, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.15 }}>
            {lbl('Intercity Travel', 'আন্তঃজেলা যাত্রা')}
          </h1>
          <p style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.8)', margin: '0 0 24px', lineHeight: 1.5 }}>
            {lbl('Bus · Train · Flight · Launch across Bangladesh', 'বাস · ট্রেন · ফ্লাইট · লঞ্চ — সারাদেশে')}
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {STATS.map((s) => (
              <div key={s.val} style={{
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12,
                padding: '10px 16px', textAlign: 'center', minWidth: 72,
              }}>
                <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: '#fff' }}>{s.val}</div>
                <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                  {lbl(s.label, s.labelBn)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search section */}
      <div style={{ padding: isMobile ? '20px 16px' : '28px 40px' }}>
        {/* Name/operator search */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>{lbl('Search by name or route', 'নাম বা রুট দিয়ে খুঁজুন')}</label>
          <input
            style={{ ...inputStyle, fontSize: 14 }}
            placeholder={lbl('e.g. Green Line, Cox\'s Bazar Express, BG-437, Sundarban-12…', 'যেমন: গ্রীন লাইন, কক্সবাজার এক্সপ্রেস, BG-437…')}
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
          {/* Mode chips */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {CHIPS.map((c) => (
              <button
                key={c.label}
                onClick={() => setActiveChip(c.label)}
                style={{
                  background: activeChip === c.label ? tk.primarySoft : tk.panelMuted,
                  border: `1px solid ${activeChip === c.label ? tk.primary : tk.line}`,
                  borderRadius: 999, padding: '6px 14px', cursor: 'pointer',
                  fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: 500,
                  color: activeChip === c.label ? tk.primary : tk.textDim,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 15 }}>{c.icon}</span>
                {lbl(c.label, c.labelBn)}
              </button>
            ))}
          </div>
        </div>

        {/* 4-field search grid */}
        <div style={{
          background: tk.panel, border: `1px solid ${tk.line}`,
          borderRadius: 20, padding: isMobile ? 16 : 24,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: tk.shadow,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
            gap: 16,
          }}>
            {/* FROM with district suggestions via portal */}
            <div>
              <label style={labelStyle}>{lbl('From', 'প্রেরণ')}</label>
              <input
                ref={fromRef}
                style={{ ...inputStyle, borderColor: fromFocus ? tk.primary : tk.line }}
                placeholder={lbl('Dhaka', 'ঢাকা')}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                onFocus={() => setFromFocus(true)}
                onBlur={() => setTimeout(() => setFromFocus(false), 150)}
              />
              {fromFocus && <SuggestionDropdown suggestions={filterDistricts(from)} onSelect={s => { setFrom(s.label); setFromFocus(false); }} onDismiss={() => setFromFocus(false)} tk={tk} lang={lang} anchorRef={fromRef}/>}
            </div>
            {/* TO with district suggestions via portal */}
            <div>
              <label style={labelStyle}>{lbl('To', 'গন্তব্য')}</label>
              <input
                ref={toRef}
                style={{ ...inputStyle, borderColor: toFocus ? tk.primary : tk.line }}
                placeholder={lbl("Cox's Bazar", 'কক্সবাজার')}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                onFocus={() => setToFocus(true)}
                onBlur={() => setTimeout(() => setToFocus(false), 150)}
              />
              {toFocus && <SuggestionDropdown suggestions={filterDistricts(to)} onSelect={s => { setTo(s.label); setToFocus(false); }} onDismiss={() => setToFocus(false)} tk={tk} lang={lang} anchorRef={toRef}/>}
            </div>
            <div>
              <label style={labelStyle}>
                {lbl('Date', 'তারিখ')}
              </label>
              <input
                style={inputStyle}
                placeholder={lbl('Today, Jun 17', 'আজ, ১৭ জুন')}
                type="text"
                readOnly
              />
            </div>
            <div>
              <label style={labelStyle}>
                {lbl('Passengers', 'যাত্রী')}
              </label>
              <input
                style={inputStyle}
                placeholder={lbl('1 Adult', '১ যাত্রী')}
                type="text"
                readOnly
              />
            </div>
          </div>

          <button
            onClick={() => { earnCoins(5,'Intercity search'); onNav('results'); }}
            style={{
              marginTop: 16, width: '100%',
              background: `linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)`,
              border: 'none', borderRadius: 14,
              padding: '14px 24px',
              fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 15, fontWeight: 700, color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              letterSpacing: 0.3,
            }}
          >
            🔍 {lbl('Search Journeys', 'যাত্রা খুঁজুন')}
          </button>
        </div>

        {(nameSearch || from || to) && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 16 }}>
            {lbl(`${filteredDistricts.length} routes found`, `${filteredDistricts.length}টি রুট পাওয়া গেছে`)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {filteredDistricts.map((r) => {
              const col = DIVISION_COLORS[r.division] || '#6b7280';
              const initials = r.district.slice(0, 2).toUpperCase();
              const hasAC = r.costAC && r.costAC !== '-';
              return (
                <button
                  key={r.district}
                  onClick={() => onNav('intercity-detail')}
                  style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16, padding: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden', transition: 'box-shadow 0.15s' }}
                >
                  <div style={{ background: `linear-gradient(135deg, ${col}33, ${col}11)`, borderBottom: `1px solid ${tk.line}`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14, fontWeight: 700, color: tk.text }}>{r.district}</div>
                      <div style={{ fontFamily: SANS, fontSize: 10, color: col, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{r.division} Division</div>
                    </div>
                    {hasAC && <span style={{ background: col+'22', color: col, border: `1px solid ${col}44`, borderRadius: 999, padding: '3px 8px', fontFamily: SANS, fontSize: 10, fontWeight: 700 }}>AC</span>}
                  </div>
                  <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textDim, marginBottom: 3 }}>{r.route}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint }}>
                        {r.busOperators.slice(0, 2).join(' · ')}
                        {r.busOperators.length > 2 && ` +${r.busOperators.length - 2}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text }}>{r.costNonAC}</div>
                      {hasAC && <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textDim }}>AC: {r.costAC}</div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {filteredDistricts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: tk.textFaint, fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14 }}>
              {lbl('No routes found. Try a different search.', 'কোনো রুট পাওয়া যায়নি।')}
            </div>
          )}
        </div>
        )}

        {/* Popular Operators */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 14 }}>
            {lbl('Top Operators', 'শীর্ষ অপারেটর')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
            {BUS_OPERATORS.slice(0, 8).map((op) => (
              <button key={op.name} onClick={() => onNav('intercity-detail')} style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 4 }}>{op.name.split(' ')[0]}</div>
                <div style={{ fontFamily: SANS, fontSize: 10, color: tk.textDim, lineHeight: 1.3 }}>{op.primaryRoute.slice(0, 20)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Ad slot */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>
      </div>

    </div>
    </PageShell>
  );
}
