import React, { useState, useMemo, useRef } from 'react';
import { KJ_TOKENS, T, SANS, BEN, N, Fare, Tokens } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { PromoBanner } from '../components/PromoBanner';
import { SectionHeader } from '../components/SectionHeader';
import { Icon } from '../components/Icons';
import { ModeHero } from '../components/ModeHero';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';
import { earnCoins } from '../utils/koyCoinService';
import {
  TRUCK_CATEGORIES,
  TRUCK_PROVIDERS,
  TRUCK_CITIES,
  TruckCategory,
  TruckSize,
  ProviderId,
  estimateIntercityFare,
} from '../../../data/bangladeshTruckData';

interface Props {
  theme: 'dark' | 'light';
  device: 'desktop' | 'mobile';
  lang: 'bn' | 'en';
  route: string;
  canBack: boolean;
  onNav: (r: string, p?: Record<string, string>) => void;
  onNavTab?: (r: string) => void;
  onBack: () => void;
  onLang: () => void;
  onTheme: () => void;
  onMenu: () => void;
  params?: Record<string, string>;
}

const SIZE_FILTERS: { id: 'all' | TruckSize; en: string; bn: string; emoji: string }[] = [
  { id: 'all',        en: 'All',        bn: 'সব',          emoji: '🚛' },
  { id: 'motorcycle', en: 'Motorcycle', bn: 'মোটরসাইকেল', emoji: '🏍️' },
  { id: 'car',        en: 'Car',        bn: 'কার',          emoji: '🚗' },
  { id: 'pickup',     en: 'Pickup',     bn: 'পিকআপ',       emoji: '🛻' },
  { id: 'medium',     en: 'Medium',     bn: 'মাঝারি',       emoji: '🚚' },
  { id: 'large',      en: 'Large',      bn: 'বড়',           emoji: '🚛' },
  { id: 'trailer',    en: 'Trailer',    bn: 'ট্রেইলার',     emoji: '🚜' },
];

export function TruckPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (p = 16): React.CSSProperties => ({
    background: tk.panel,
    border: `1px solid ${tk.line}`,
    borderRadius: 16,
    padding: p,
  });
  const lbl = (en: string, bn: string) => (lang === 'bn' ? bn : en);

  const [from, setFrom] = useState(params?.from ?? '');
  const [to, setTo] = useState(params?.to ?? params?.search ?? '');
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const [sizeFilter, setSizeFilter] = useState<'all' | TruckSize>('all');
  const [providerFilter, setProviderFilter] = useState<'all' | ProviderId>('all');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const citySuggestions = (q: string): Suggestion[] => {
    const lower = q.toLowerCase();
    const list = q
      ? TRUCK_CITIES.filter(c => c.en.toLowerCase().includes(lower) || c.bn.includes(q))
      : TRUCK_CITIES;
    return list.map(c => ({ id: c.id, label: lang === 'bn' ? c.bn : c.en, sub: lang === 'bn' ? c.en : c.bn }));
  };

  const fromSuggestions = useMemo(() => citySuggestions(from), [from, lang]);
  const toSuggestions = useMemo(() => citySuggestions(to), [to, lang]);

  const filteredCats = useMemo(() => {
    return TRUCK_CATEGORIES.filter(c => {
      if (sizeFilter !== 'all' && c.size !== sizeFilter) return false;
      if (providerFilter !== 'all' && !c.providers.includes(providerFilter)) return false;
      return true;
    });
  }, [sizeFilter, providerFilter]);

  return (
    <PageShell {...props}>
      <div style={{ padding: isMobile ? '0 0 80px' : '0 0 48px' }}>
        <ModeHero
          tk={tk}
          isMobile={isMobile}
          lang={lang}
          kind="truck"
          gradient="linear-gradient(135deg, #7f1d1d 0%, #ef4444 50%, #fbbf24 100%)"
          title={T(lang, 'ট্রাক ও পণ্য পরিবহন · দেশজুড়ে', 'Truck & freight · nationwide')}
          subtitle={T(
            lang,
            'মোটরসাইকেল থেকে ৪০ টন ট্রেইলার — বুক করুন Lalamove বা TruckLagbe-এর মাধ্যমে। ৬৪ জেলায় কভারেজ।',
            'Motorcycle to 40-ton trailer — book via Lalamove or TruckLagbe. Coverage across 64 districts.',
          )}
          stats={[
            { v: N(TRUCK_CATEGORIES.length, lang), l: T(lang, 'যানবাহন', 'Vehicles') },
            { v: N(2, lang), l: T(lang, 'প্রোভাইডার', 'Providers') },
            { v: '৳' + N(99, lang) + '+', l: T(lang, 'শুরু থেকে', 'From') },
            { v: N(64, lang), l: T(lang, 'জেলা', 'Districts') },
          ]}
        />

        <div style={{ padding: isMobile ? '0 16px' : '0 40px' }}>
          {/* Search */}
          <div style={{ ...card(16), marginBottom: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto auto', gap: 10 }}>
              <div ref={fromRef} style={{ background: tk.inputBg, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: tk.primarySoft, color: tk.primaryDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon.pin s={14}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                    {lbl('Pickup city', 'পিকআপ শহর')}
                  </div>
                  <input
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    onFocus={() => setFromFocus(true)}
                    onBlur={() => setTimeout(() => setFromFocus(false), 150)}
                    placeholder={lbl('Dhaka', 'ঢাকা')}
                    style={{ fontFamily: BEN, fontSize: 14, fontWeight: 600, color: tk.text, background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: 0 }}
                  />
                </div>
              </div>
              <div ref={toRef} style={{ background: tk.inputBg, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: tk.accentSoft, color: tk.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon.flag s={14}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                    {lbl('Drop city', 'গন্তব্য')}
                  </div>
                  <input
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    onFocus={() => setToFocus(true)}
                    onBlur={() => setTimeout(() => setToFocus(false), 150)}
                    placeholder={lbl('Chattogram', 'চট্টগ্রাম')}
                    style={{ fontFamily: BEN, fontSize: 14, fontWeight: 600, color: tk.text, background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: 0 }}
                  />
                </div>
              </div>
              <div style={{ background: tk.inputBg, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, minWidth: isMobile ? 0 : 140 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: tk.amberSoft, color: tk.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  📏
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                    {lbl('Distance (km)', 'দূরত্ব (কিমি)')}
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={distanceKm || ''}
                    onChange={e => setDistanceKm(Number(e.target.value) || 0)}
                    placeholder={lbl('e.g. 260', 'যেমন ২৬০')}
                    style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: tk.text, background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: 0 }}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  earnCoins(5, 'Truck search');
                  document.getElementById('truck-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{
                  background: 'linear-gradient(135deg,#ef4444,#7f1d1d)',
                  color: '#fff', border: 0, borderRadius: 14,
                  padding: isMobile ? '12px 16px' : '0 22px',
                  fontFamily: SANS, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  minHeight: isMobile ? 48 : 'auto',
                  boxShadow: '0 8px 22px -10px #ef4444',
                }}
              >
                <Icon.search s={16}/>{T(lang, 'ট্রাক দেখুন', 'Show trucks')}
              </button>
            </div>
            {fromFocus && (
              <SuggestionDropdown
                suggestions={fromSuggestions}
                onSelect={s => { setFrom(s.label); setFromFocus(false); }}
                onDismiss={() => setFromFocus(false)}
                tk={tk} lang={lang}
                anchorRef={fromRef as React.RefObject<HTMLElement>}
              />
            )}
            {toFocus && (
              <SuggestionDropdown
                suggestions={toSuggestions}
                onSelect={s => { setTo(s.label); setToFocus(false); }}
                onDismiss={() => setToFocus(false)}
                tk={tk} lang={lang}
                anchorRef={toRef as React.RefObject<HTMLElement>}
              />
            )}
          </div>

          {/* Filters */}
          <div style={{ ...card(12), marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 1.2, marginRight: 4 }}>
                {lbl('Size', 'আকার')}
              </span>
              {SIZE_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSizeFilter(f.id)}
                  style={{
                    background: sizeFilter === f.id ? tk.primary : tk.panelMuted,
                    color: sizeFilter === f.id ? tk.primaryInk : tk.textDim,
                    border: sizeFilter === f.id ? 'none' : `1px solid ${tk.line}`,
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontFamily: lang === 'bn' ? BEN : SANS,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{f.emoji}</span>{lbl(f.en, f.bn)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 1.2, marginRight: 4 }}>
                {lbl('Provider', 'প্রোভাইডার')}
              </span>
              {(['all', ...TRUCK_PROVIDERS.map(p => p.id)] as const).map(pid => {
                const prov = pid === 'all' ? null : TRUCK_PROVIDERS.find(p => p.id === pid)!;
                const active = providerFilter === pid;
                return (
                  <button
                    key={pid}
                    onClick={() => setProviderFilter(pid)}
                    style={{
                      background: active ? (prov?.color ?? tk.primary) : tk.panelMuted,
                      color: active ? '#fff' : tk.textDim,
                      border: active ? 'none' : `1px solid ${tk.line}`,
                      borderRadius: 999,
                      padding: '6px 12px',
                      fontFamily: SANS,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {pid === 'all' ? lbl('All', 'সব') : lang === 'bn' ? prov!.bnName : prov!.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: 18 }}>
            {/* Results */}
            <div id="truck-results">
              <SectionHeader
                tk={tk}
                lang={lang}
                title={T(
                  lang,
                  `যানবাহন · ${N(filteredCats.length, lang)} টি অপশন`,
                  `Vehicles · ${filteredCats.length} options`,
                )}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {filteredCats.length === 0 ? (
                  <div style={{ ...card(14), fontFamily: BEN, fontSize: 13, color: tk.textFaint, textAlign: 'center' }}>
                    {T(lang, 'এই ফিল্টারে কোনো যানবাহন নেই।', 'No vehicles match these filters.')}
                  </div>
                ) : (
                  filteredCats.map(c => <TruckCard key={c.id} c={c} tk={tk} lang={lang} distanceKm={distanceKm} isMobile={isMobile} />)
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={card(16)}>
                <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 14, color: tk.text, marginBottom: 10 }}>
                  {T(lang, 'অংশীদার প্রোভাইডার', 'Partner providers')}
                </div>
                {TRUCK_PROVIDERS.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0', borderTop: i ? `1px dashed ${tk.line}` : '' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${p.color}22`, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        🚛
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 13, color: tk.text }}>{lang === 'bn' ? p.bnName : p.name}</div>
                        <div style={{ fontFamily: BEN, fontSize: 11, color: tk.textFaint, lineHeight: 1.35 }}>{lang === 'bn' ? p.bookingModel.bn : p.bookingModel.en}</div>
                      </div>
                    </div>
                    {p.stats && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {p.stats.map((s, k) => (
                          <span key={k} style={{ background: `${p.color}18`, color: p.color, borderRadius: 6, padding: '3px 8px', fontFamily: SANS, fontSize: 10, fontWeight: 700 }}>
                            {s.v} · {lang === 'bn' ? s.bn : s.en}
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ background: p.color, color: '#fff', borderRadius: 8, padding: '6px 12px', fontFamily: SANS, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                        {lbl('Open site', 'সাইট খুলুন')} ↗
                      </a>
                      {p.appAndroid && (
                        <a href={p.appAndroid} target="_blank" rel="noopener noreferrer" style={{ background: tk.panelMuted, color: tk.text, borderRadius: 8, padding: '6px 12px', fontFamily: SANS, fontSize: 11, fontWeight: 700, textDecoration: 'none', border: `1px solid ${tk.line}` }}>
                          Android
                        </a>
                      )}
                      {p.appIOS && (
                        <a href={p.appIOS} target="_blank" rel="noopener noreferrer" style={{ background: tk.panelMuted, color: tk.text, borderRadius: 8, padding: '6px 12px', fontFamily: SANS, fontSize: 11, fontWeight: 700, textDecoration: 'none', border: `1px solid ${tk.line}` }}>
                          iOS
                        </a>
                      )}
                    </div>
                    {p.phone && (
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textDim }}>
                        📞 <a href={`tel:${p.phone.replace(/\s/g, '')}`} style={{ color: tk.primary, textDecoration: 'none' }}>{p.phone}</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <PromoBanner tk={tk} lang={lang} page="bus" onNav={onNav}/>
              <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'mid-rect'}/>
            </div>
          </div>

          {/* Tips */}
          <div style={{ marginTop: 18 }}>
            <SectionHeader tk={tk} lang={lang} title={T(lang, '🚚 ট্রাক ভাড়া টিপস', '🚚 Truck booking tips')}/>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 10, marginTop: 8 }}>
              {[
                { ic: '🧮', bn: 'ওজন আগেই হিসাব করুন — ভুল আকার বাছলে রাইড বাতিল হতে পারে', en: 'Estimate weight first — wrong size = ride cancelled' },
                { ic: '🕒', bn: 'রাত ১২–৬: ট্রাক ঢাকায় ঢুকতে পারে; ট্রিপ পরিকল্পনা করুন', en: 'Trucks enter Dhaka 12–6am only; plan accordingly' },
                { ic: '💸', bn: 'লেবার আলাদা — ৫০০–১৫০০ টাকা অতিরিক্ত হতে পারে', en: 'Loaders extra: ৳500–1500 on top of fare' },
              ].map((t, i) => (
                <div key={i} style={{ ...card(14), display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{t.ic}</span>
                  <span style={{ fontFamily: BEN, fontWeight: 600, fontSize: 13, color: tk.text, flex: 1 }}>{T(lang, t.bn, t.en)}</span>
                </div>
              ))}
            </div>
          </div>

          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'}/>
        </div>
      </div>
    </PageShell>
  );
}

function TruckCard({
  c, tk, lang, distanceKm,
}: {
  c: TruckCategory;
  tk: Tokens;
  lang: 'bn' | 'en';
  distanceKm: number;
  isMobile: boolean;
}) {
  const fare = distanceKm > 0 ? estimateIntercityFare(c.size, distanceKm) : null;
  const providers = TRUCK_PROVIDERS.filter(p => c.providers.includes(p.id));
  const card = (p = 16): React.CSSProperties => ({
    background: tk.panel,
    border: `1px solid ${tk.line}`,
    borderRadius: 16,
    padding: p,
  });

  return (
    <div style={{ ...card(14), position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 56, height: 44, borderRadius: 10,
          background: `linear-gradient(135deg,${c.color},${c.color}cc)`,
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>
          {c.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 14, color: tk.text }}>
            {lang === 'bn' ? c.name.bn : c.name.en}
          </div>
          <div style={{ fontFamily: BEN, fontSize: 11, color: tk.textDim, marginTop: 2 }}>
            {lang === 'bn' ? c.bestFor.bn : c.bestFor.en}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: `1px dashed ${tk.line}`, borderBottom: `1px dashed ${tk.line}`, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ background: tk.panelMuted, borderRadius: 6, padding: '3px 8px', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: tk.text }}>
          ⚖️ {N(c.capacityKg < 1000 ? `${c.capacityKg} kg` : `${c.capacityTon} ton`, lang)}
        </span>
        {c.lengthFt && (
          <span style={{ background: tk.panelMuted, borderRadius: 6, padding: '3px 8px', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: tk.text }}>
            📏 {N(c.lengthFt, lang)} ft
          </span>
        )}
        {c.dimsCm && (
          <span style={{ background: tk.panelMuted, borderRadius: 6, padding: '3px 8px', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: tk.textDim }}>
            {N(c.dimsCm.l, lang)}×{N(c.dimsCm.w, lang)}×{N(c.dimsCm.h, lang)} cm
          </span>
        )}
        <span style={{ background: `${c.color}22`, color: c.color, borderRadius: 6, padding: '3px 8px', fontFamily: SANS, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
          {c.body}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {c.startFareBdt && (
          <div style={{ flex: '1 1 auto', background: tk.panelMuted, borderRadius: 10, padding: '8px 10px', minWidth: 110 }}>
            <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: tk.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>
              {lang === 'bn' ? 'শুরু থেকে' : 'Start from'}
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 14, color: tk.text }}>{Fare(c.startFareBdt, lang)}</div>
          </div>
        )}
        {fare && (
          <div style={{ flex: '1 1 auto', background: `${c.color}22`, borderRadius: 10, padding: '8px 10px', minWidth: 140 }}>
            <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: c.color, letterSpacing: 1, textTransform: 'uppercase' }}>
              {lang === 'bn' ? `${N(distanceKm, lang)} কিমি অনুমান` : `~${distanceKm} km estimate`}
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 14, color: c.color }}>
              {Fare(fare.low, lang)}–{Fare(fare.high, lang)}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {providers.map(p => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: p.color,
                color: '#fff',
                border: 0,
                borderRadius: 10,
                padding: '8px 12px',
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 11,
                cursor: 'pointer',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {p.name.split(' ')[0]} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
