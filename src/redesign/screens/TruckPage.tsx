import React, { useState, useMemo, useRef } from 'react';
import { KJ_TOKENS, T, SANS, BEN, N, Fare, Tokens } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot, NativeAdCard } from '../components/AdSlot';
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
  calcFare,
  findTruckCity,
  truckRoadKm,
  SURCHARGES,
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

const BODY_LABEL: Record<string, { en: string; bn: string }> = {
  open:    { en: 'Open',     bn: 'খোলা' },
  covered: { en: 'Covered',  bn: 'ঢাকা' },
  flatbed: { en: 'Flat-bed', bn: 'ফ্ল্যাট-বেড' },
  lowbed:  { en: 'Low-bed',  bn: 'লো-বেড' },
};

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
  const [selectedCat, setSelectedCat] = useState<TruckCategory | null>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Auto-resolved city from typed/selected text
  const fromCity = useMemo(() => findTruckCity(from), [from]);
  const toCity = useMemo(() => findTruckCity(to), [to]);

  // Auto-calculated road distance — no manual input needed
  const distanceKm = useMemo(() => {
    if (!fromCity || !toCity) return 0;
    return truckRoadKm(fromCity, toCity);
  }, [fromCity, toCity]);

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
            'মোটরসাইকেল থেকে ৪০ টন ট্রেইলার — সারাদেশে অন-ডিমান্ড পিকআপ ও বিড-ভিত্তিক ভাড়া। ৬৪ জেলায় কভারেজ।',
            'Motorcycle to 40-ton trailer — on-demand pickup + bid-based rental nationwide. Coverage across 64 districts.',
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
              <div style={{ background: distanceKm > 0 ? tk.primarySoft : tk.inputBg, border: `1px solid ${distanceKm > 0 ? tk.primary : tk.line}`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, minWidth: isMobile ? 0 : 140 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: tk.amberSoft, color: tk.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  📏
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                    {lbl('Road distance', 'সড়ক দূরত্ব')}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: distanceKm > 0 ? tk.primary : tk.textFaint }}>
                    {distanceKm > 0 ? `${N(distanceKm, lang)} ${lbl('km', 'কিমি')}` : lbl('Pick both cities', 'দুটি শহর বাছুন')}
                  </div>
                </div>
              </div>
              {(() => {
                const canSearch = !!(from.trim() && to.trim());
                return (
                  <button
                    disabled={!canSearch}
                    onClick={() => {
                      if (!canSearch) return;
                      earnCoins(5, 'Truck search');
                      document.getElementById('truck-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    style={{
                      background: canSearch ? 'linear-gradient(135deg,#ef4444,#7f1d1d)' : tk.panelMuted,
                      color: canSearch ? '#fff' : tk.textFaint, border: 0, borderRadius: 14,
                      padding: isMobile ? '12px 16px' : '0 22px',
                      fontFamily: SANS, fontWeight: 700, fontSize: 14,
                      cursor: canSearch ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      minHeight: isMobile ? 48 : 'auto',
                      boxShadow: canSearch ? '0 8px 22px -10px #ef4444' : 'none',
                      opacity: canSearch ? 1 : 0.6,
                    }}
                  >
                    <Icon.search s={16}/>{T(lang, 'ট্রাক দেখুন', 'Show trucks')}
                  </button>
                );
              })()}
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
                    {pid === 'all' ? lbl('All', 'সব') : (lang === 'bn' ? prov!.displayLabel.bn : prov!.displayLabel.en)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* In-article ad — between filters and results */}
          <div style={{ marginBottom: 18 }}>
            <NativeAdCard
              tk={tk}
              lang={lang}
              kind={isMobile ? 'mob-banner' : 'leaderboard'}
              title={T(lang, 'ট্রাক ও পণ্য অফার', 'Truck & freight offers')}
              icon="🚛"
            />
          </div>

          {/* Inline quote panel — shows full booking info on this platform */}
          {selectedCat && (
            <div id="truck-quote-panel">
              <QuotePanel
                c={selectedCat}
                tk={tk}
                lang={lang}
                fromCity={fromCity?.[lang === 'bn' ? 'bn' : 'en'] ?? from ?? '—'}
                toCity={toCity?.[lang === 'bn' ? 'bn' : 'en'] ?? to ?? '—'}
                fromCityId={fromCity?.id}
                toCityId={toCity?.id}
                distanceKm={distanceKm}
                onClose={() => setSelectedCat(null)}
              />
            </div>
          )}

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
                  filteredCats.map(c => (
                    <TruckCard
                      key={c.id}
                      c={c}
                      tk={tk}
                      lang={lang}
                      distanceKm={distanceKm}
                      isMobile={isMobile}
                      onSelect={() => {
                        earnCoins(3, 'Truck quote');
                        setSelectedCat(c);
                        // Scroll the freshly-rendered quote panel into view
                        setTimeout(() => {
                          document.getElementById('truck-quote-panel')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          });
                        }, 50);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Capacity guide — neutral, no brand names */}
              <div style={card(16)}>
                <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 14, color: tk.text, marginBottom: 10 }}>
                  {T(lang, '📦 ওজন অনুযায়ী ট্রাক বাছাই', '📦 Pick truck by load weight')}
                </div>
                {[
                  { range: lbl('< 20 kg', '< ২০ কেজি'),     pick: lbl('Motorcycle',         'মোটরসাইকেল'),       use: lbl('Documents, food, parcel',  'নথি, খাদ্য, পার্সেল') },
                  { range: lbl('< 400 kg', '< ৪০০ কেজি'),   pick: lbl('Car (sedan)',        'কার'),                use: lbl('Small boxed goods',       'ছোট বক্সড পণ্য') },
                  { range: lbl('1–1.5 ton', '১–১.৫ টন'),    pick: lbl('Pickup 7–9 ft',      'পিকআপ ৭–৯ ফুট'),     use: lbl('Appliances, electronics', 'যন্ত্রপাতি, ইলেকট্রনিক্স') },
                  { range: lbl('2–3.5 ton', '২–৩.৫ টন'),    pick: lbl('Truck 12–14 ft',     'ট্রাক ১২–১৪ ফুট'),    use: lbl('Office/home shifting',    'অফিস/বাসা শিফটিং') },
                  { range: lbl('7.5 ton',   '৭.৫ টন'),      pick: lbl('Truck 16 ft',        'ট্রাক ১৬ ফুট'),      use: lbl('FMCG, packaged goods',    'এফএমসিজি, প্যাকেজড') },
                  { range: lbl('15–25 ton', '১৫–২৫ টন'),    pick: lbl('Truck 18–23 ft',     'ট্রাক ১৮–২৩ ফুট'),   use: lbl('Industrial freight',      'শিল্প ফ্রেইট') },
                  { range: lbl('> 30 ton',  '> ৩০ টন'),     pick: lbl('Flat/Low-bed trailer','ফ্ল্যাট/লো-বেড ট্রেইলার'), use: lbl('Containers, machinery', 'কন্টেইনার, যন্ত্রপাতি') },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '10px 0', borderTop: i ? `1px dashed ${tk.line}` : '' }}>
                    <div style={{ flex: '0 0 80px', fontFamily: SANS, fontWeight: 800, fontSize: 12, color: tk.primary }}>{row.range}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 12, color: tk.text }}>{row.pick}</div>
                      <div style={{ fontFamily: BEN, fontSize: 11, color: tk.textFaint }}>{row.use}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Booking checklist */}
              <div style={card(16)}>
                <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 14, color: tk.text, marginBottom: 10 }}>
                  {T(lang, '✅ বুক করার আগে চেকলিস্ট', '✅ Pre-booking checklist')}
                </div>
                {[
                  { ic: '⚖️', t: lbl('Total weight estimated',         'মোট ওজন আনুমানিক করেছেন') },
                  { ic: '📏', t: lbl('Largest item dimension known',   'সবচেয়ে বড় আইটেমের মাপ জানেন') },
                  { ic: '🕒', t: lbl('Loading window confirmed',       'লোডিং সময় নিশ্চিত করেছেন') },
                  { ic: '👷', t: lbl('Need loaders? (extra ৳500-1500)', 'লেবার দরকার? (৳৫০০-১৫০০ অতিরিক্ত)') },
                  { ic: '🌉', t: lbl('Route tolls checked',            'রুটের টোল চেক করেছেন') },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderTop: i ? `1px dashed ${tk.line}` : '', alignItems: 'center' }}>
                    <span style={{ fontSize: 18 }}>{row.ic}</span>
                    <span style={{ fontFamily: BEN, fontSize: 12, color: tk.textDim, flex: 1 }}>{row.t}</span>
                  </div>
                ))}
              </div>

              <PromoBanner tk={tk} lang={lang} page="bus" onNav={onNav}/>
              <NativeAdCard
                tk={tk}
                lang={lang}
                kind={isMobile ? 'mob-banner' : 'mid-rect'}
                title={T(lang, 'পণ্য পরিবহন ডিল', 'Freight deals')}
                subtitle={T(lang, 'ট্রাক ও লেবার', 'Truck & labor')}
                icon="📦"
                compact
              />
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

          <NativeAdCard
            tk={tk}
            lang={lang}
            kind={isMobile ? 'mob-banner' : 'leaderboard'}
            title={T(lang, 'পণ্য পরিবহন টিপস', 'Freight tips')}
            icon="📋"
          />
        </div>
      </div>
    </PageShell>
  );
}

function TruckCard({
  c, tk, lang, distanceKm, onSelect,
}: {
  c: TruckCategory;
  tk: Tokens;
  lang: 'bn' | 'en';
  distanceKm: number;
  isMobile: boolean;
  onSelect: () => void;
}) {
  const fareB = distanceKm > 0 ? calcFare(c, distanceKm) : null;
  const fare = fareB ? { low: fareB.estimateLow, high: fareB.estimateHigh } : null;
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
          ⚖️ {c.capacityKg < 1000
            ? `${N(c.capacityKg, lang)} ${lang === 'bn' ? 'কেজি' : 'kg'}`
            : `${N(c.capacityTon, lang)} ${lang === 'bn' ? 'টন' : 'ton'}`}
        </span>
        {c.lengthFt && (
          <span style={{ background: tk.panelMuted, borderRadius: 6, padding: '3px 8px', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: tk.text }}>
            📏 {N(c.lengthFt, lang)} {lang === 'bn' ? 'ফুট' : 'ft'}
          </span>
        )}
        {c.dimsCm && (
          <span style={{ background: tk.panelMuted, borderRadius: 6, padding: '3px 8px', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: tk.textDim }}>
            {N(c.dimsCm.l, lang)}×{N(c.dimsCm.w, lang)}×{N(c.dimsCm.h, lang)} {lang === 'bn' ? 'সেমি' : 'cm'}
          </span>
        )}
        <span style={{ background: `${c.color}22`, color: c.color, borderRadius: 6, padding: '3px 8px', fontFamily: SANS, fontSize: 11, fontWeight: 700 }}>
          {lang === 'bn' ? BODY_LABEL[c.body]?.bn : BODY_LABEL[c.body]?.en}
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
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {providers.map(p => (
              <span key={p.id} title={lang === 'bn' ? p.displayLabel.bn : p.displayLabel.en} style={{ width: 8, height: 8, borderRadius: 999, background: p.color, display: 'inline-block' }}/>
            ))}
          </div>
          <button
            onClick={onSelect}
            style={{
              background: `linear-gradient(135deg,${c.color},${c.color}cc)`,
              color: '#fff',
              border: 0,
              borderRadius: 10,
              padding: '8px 14px',
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {lang === 'bn' ? 'কোট নিন' : 'Get quote'} →
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline quote panel — shows full booking detail on KoyJabo, no external redirect
function QuotePanel({
  c, tk, lang, fromCity, toCity, fromCityId, toCityId, distanceKm, onClose,
}: {
  c: TruckCategory;
  tk: Tokens;
  lang: 'bn' | 'en';
  fromCity: string;
  toCity: string;
  fromCityId?: string;
  toCityId?: string;
  distanceKm: number;
  onClose: () => void;
}) {
  const fareB = distanceKm > 0 ? calcFare(c, distanceKm, fromCityId, toCityId) : null;
  const providers = TRUCK_PROVIDERS.filter(p => c.providers.includes(p.id));
  const mid = fareB ? fareB.estimate : null;
  // Avg intercity truck speed ~40km/h (Dhaka-Chattogram 250km in ~6h, 240km Dhaka-Sylhet ~6h)
  const driveHrs = distanceKm > 0 ? +(distanceKm / 40).toFixed(1) : 0;

  return (
    <div style={{
      background: tk.panel,
      border: `2px solid ${c.color}`,
      borderRadius: 18,
      padding: 18,
      marginBottom: 18,
      boxShadow: `0 18px 40px -20px ${c.color}80`,
      position: 'relative',
    }}>
      <button
        onClick={onClose}
        aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: tk.panelMuted, color: tk.text,
          border: `1px solid ${tk.line}`, borderRadius: 999,
          width: 30, height: 30, fontSize: 16, lineHeight: 1, cursor: 'pointer',
        }}
      >×</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 64, height: 50, borderRadius: 12,
          background: `linear-gradient(135deg,${c.color},${c.color}cc)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>{c.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: c.color, letterSpacing: 1.4, textTransform: 'uppercase' }}>
            {lang === 'bn' ? 'লাইভ কোট' : 'Live quote'}
          </div>
          <div style={{ fontFamily: BEN, fontWeight: 800, fontSize: 18, color: tk.text, lineHeight: 1.25 }}>
            {lang === 'bn' ? c.name.bn : c.name.en}
          </div>
          <div style={{ fontFamily: BEN, fontSize: 12, color: tk.textDim, marginTop: 2 }}>
            {fromCity} → {toCity}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
        <QuoteStat tk={tk} label={lang === 'bn' ? 'দূরত্ব' : 'Distance'} value={distanceKm > 0 ? `${N(distanceKm, lang)} ${lang === 'bn' ? 'কিমি' : 'km'}` : '—'} color={tk.primary}/>
        <QuoteStat tk={tk} label={lang === 'bn' ? 'অনুমিত সময়' : 'Drive time'} value={distanceKm > 0 ? `~${N(driveHrs, lang)}${lang === 'bn' ? 'ঘ' : 'h'}` : '—'} color={tk.amber}/>
        <QuoteStat tk={tk} label={lang === 'bn' ? 'ক্যাপাসিটি' : 'Capacity'} value={`${N(c.capacityTon, lang)} ${lang === 'bn' ? 'টন' : 'ton'}`} color={c.color}/>
        <QuoteStat tk={tk} label={lang === 'bn' ? 'বডি' : 'Body'} value={lang === 'bn' ? (BODY_LABEL[c.body]?.bn ?? c.body) : (BODY_LABEL[c.body]?.en ?? c.body)} color={tk.accent}/>
      </div>

      {fareB && mid !== null && (
        <div style={{
          background: `${c.color}18`,
          border: `1px solid ${c.color}55`,
          borderRadius: 14,
          padding: 14,
          marginBottom: 14,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: c.color, letterSpacing: 1.4, textTransform: 'uppercase' }}>
            {lang === 'bn' ? 'অনুমিত ভাড়া (মার্কেট রেট)' : 'Estimated fare (market rate)'}
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 28, color: tk.text, letterSpacing: -0.5 }}>
            {Fare(mid, lang)}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: tk.textDim, marginTop: 2 }}>
            {lang === 'bn' ? 'রেঞ্জ:' : 'Range:'} {Fare(fareB.estimateLow, lang)} – {Fare(fareB.estimateHigh, lang)}
          </div>

          {/* Breakdown — based on covervan.world formula: Base + (km × rate) + tolls×2 */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${c.color}55` }}>
            <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: c.color, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
              {lang === 'bn' ? 'ভাড়ার ব্রেকডাউন' : 'Fare breakdown'}
            </div>
            <BreakdownRow tk={tk} label={lang === 'bn' ? 'বেস ফেয়ার' : 'Base fare'} value={Fare(fareB.base, lang)}/>
            <BreakdownRow tk={tk} label={`${N(fareB.km, lang)} ${lang === 'bn' ? 'কিমি' : 'km'} × ৳${N(fareB.perKm, lang)}/${lang === 'bn' ? 'কিমি' : 'km'}`} value={Fare(fareB.distanceCharge, lang)}/>
            {fareB.tolls > 0 && (
              <BreakdownRow tk={tk} label={lang === 'bn' ? 'টোল (×2 রাউন্ড-ট্রিপ)' : 'Tolls (×2 round trip)'} value={Fare(fareB.tolls, lang)}/>
            )}
            <BreakdownRow tk={tk} label={lang === 'bn' ? 'মোট' : 'Total'} value={Fare(fareB.estimate, lang)} bold/>
          </div>

          <div style={{ fontFamily: BEN, fontSize: 11, color: tk.textFaint, marginTop: 8, lineHeight: 1.45 }}>
            {lang === 'bn'
              ? `নোট: বিডিং মার্কেটপ্লেসে চূড়ান্ত ভাড়া ভেন্ডর বিড করার পর; অন-ডিমান্ড সার্ভিসে রিয়েল-টাইম ফিক্সড প্রাইস। অতিরিক্ত: লোডার ৳${SURCHARGES.loaderPerPerson.low}-${SURCHARGES.loaderPerPerson.high}/জন, রাত ১০টার পর +৳${SURCHARGES.nightAfter10pm.low}।`
              : `Note: On the bidding marketplace, exact fare comes after vendor bids; the on-demand service shows real-time fixed price. Extras: loader ৳${SURCHARGES.loaderPerPerson.low}-${SURCHARGES.loaderPerPerson.high}/person, after-10pm +৳${SURCHARGES.nightAfter10pm.low}.`}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 13, color: tk.text, marginBottom: 8 }}>
          {lang === 'bn' ? 'বুক করতে কল করুন' : 'Call to book'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {providers.map(p => (
            <div key={p.id} style={{
              background: tk.inputBg,
              border: `1px solid ${tk.line}`,
              borderRadius: 12,
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${p.color}22`, color: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
              }}>🚛</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: BEN, fontWeight: 700, fontSize: 13, color: tk.text }}>
                  {lang === 'bn' ? p.displayLabel.bn : p.displayLabel.en}
                </div>
                <div style={{ fontFamily: BEN, fontSize: 11, color: tk.textFaint, lineHeight: 1.4 }}>
                  {lang === 'bn' ? p.tagline.bn : p.tagline.en}
                </div>
              </div>
              {p.phone && (
                <a
                  href={`tel:${p.phone.replace(/\s/g, '')}`}
                  style={{
                    background: p.color, color: '#fff',
                    borderRadius: 10, padding: '8px 14px',
                    fontFamily: SANS, fontWeight: 700, fontSize: 12,
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  📞 {lang === 'bn' ? 'কল' : 'Call'}
                </a>
              )}
              {!p.phone && (
                <span style={{
                  background: tk.panelMuted, color: tk.textDim,
                  borderRadius: 10, padding: '8px 14px',
                  fontFamily: SANS, fontWeight: 600, fontSize: 11,
                }}>
                  {lang === 'bn' ? 'অ্যাপ-অনলি বুকিং' : 'App-only booking'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuoteStat({ tk, label, value, color }: { tk: Tokens; label: string; value: string; color: string }) {
  return (
    <div style={{
      background: tk.panelMuted,
      border: `1px solid ${tk.line}`,
      borderRadius: 12,
      padding: '8px 10px',
    }}>
      <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: tk.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 16, color, marginTop: 2 }}>
        {value}
      </div>
    </div>
  );
}

function BreakdownRow({ tk, label, value, bold }: { tk: Tokens; label: string; value: string; bold?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '3px 0',
      fontFamily: SANS,
      fontSize: 12,
      color: bold ? tk.text : tk.textDim,
      fontWeight: bold ? 800 : 500,
    }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

