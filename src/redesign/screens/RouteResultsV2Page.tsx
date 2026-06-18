import React, { useState, useMemo } from 'react';
import { KJ_TOKENS, SANS, BEN, T, Tokens, Lang } from '../tokens';
import { AdSlot } from '../components/AdSlot';
import { PageShell } from './PageShell';
import { BUS_DATA, STATIONS } from '../../../constants';
import { trackBusSearch } from '../../../services/analyticsService';
import { getFavoriteBusIds, toggleFavoriteBus } from '../utils/favorites';
import { buildLocalBusLocationSuggestions, isSameLocationValue, matchesBusStation, planLocalBusTransit } from '../utils/localBusRouting';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:Lang; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const TYPE_COLOR: Record<string, string> = {
  'AC': '#006a4e', 'Local': '#1e3a8a', 'Double-Decker': '#7c3aed',
  'Semi-Sitting': '#0c4a6e', 'Sitting': '#b45309', 'Metro Rail': '#00543c',
};
const STAT_CHIPS = [
  { icon: '🚌', label: 'Matching buses', labelBn: 'মিলেছে', key: 'count' },
  { icon: '📍', label: 'From', labelBn: 'শুরু', key: 'from' },
  { icon: '🏁', label: 'To', labelBn: 'গন্তব্য', key: 'to' },
];

export function RouteResultsV2Page(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const isMobile = device === 'mobile';
  const tk: Tokens = KJ_TOKENS[theme];
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteBusIds());
  const lbl = (en: string, bn: string) => T(lang, bn, en);

  const fromQ = params?.from ?? '';
  const toQ = params?.to ?? '';
  const searchQ = params?.search ?? '';
  const pref = params?.pref ?? 'fastest';
  const stationSuggestions = useMemo(buildLocalBusLocationSuggestions, []);
  const sameLocation = isSameLocationValue(fromQ, toQ, stationSuggestions);

  // Real filtered results from BUS_DATA
  const RESULTS = useMemo(() => {
    if (sameLocation) return [];
    let filtered = BUS_DATA.filter(r => r.active !== false);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || r.bnName.toLowerCase().includes(q) || r.routeString.toLowerCase().includes(q));
    } else if (fromQ || toQ) {
      filtered = filtered.filter(r => matchesBusStation(r, fromQ) && matchesBusStation(r, toQ));
    }
    if (pref === 'non-ac') {
      filtered = filtered.filter(r => r.type !== 'AC');
    }
    const fareOf = (r: typeof BUS_DATA[0]) => r.type === 'AC' ? 60 : r.type === 'Double-Decker' ? 50 : 30;
    filtered = filtered.slice().sort((a, b) => {
      if (pref === 'cheapest' || pref === 'non-ac') return fareOf(a) - fareOf(b);
      return a.stops.length - b.stops.length;
    });
    return filtered.slice(0, 20).map((r) => {
      // Get real stop names
      const stopNames = r.stops.map(sid => STATIONS[sid]?.name ?? sid.replace(/_/g,' ')).slice(0, 6);
      return {
        busId: r.id,
        badge: r.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
        name: r.name,
        nameBn: r.bnName,
        route: r.routeString,
        routeBn: r.routeString,
        fare: `৳${fareOf(r)}`,
        fareOld: '',
        type: r.type,
        typeBn: r.type,
        badgeColor: TYPE_COLOR[r.type] ?? '#1e3a8a',
        ai: r.type === 'AC',
        stops: stopNames,
        hours: r.hours,
      };
    });
  }, [fromQ, toQ, searchQ, pref, sameLocation]);

  const transitRoutes = useMemo(() => {
    if (sameLocation || searchQ || !fromQ || !toQ || RESULTS.length > 0) return [];
    return planLocalBusTransit(fromQ, toQ, pref === 'cheapest' ? 6 : 4);
  }, [fromQ, toQ, searchQ, pref, sameLocation, RESULTS.length]);

  const fareValues = RESULTS
    .map(result => Number(result.fare.replace(/[^\d]/g, '')))
    .filter(value => Number.isFinite(value) && value > 0);
  const fareMin = fareValues.length ? Math.min(...fareValues) : 0;
  const fareMax = fareValues.length ? Math.max(...fareValues) : 0;
  const busTypes = Array.from(new Set(RESULTS.map(result => result.type).filter(Boolean)));
  const operators = Array.from(new Set(RESULTS.map(result => result.name).filter(Boolean))).slice(0, 10);

  const FilterSidebar = () => (
    <div style={{
      width: 260, flexShrink: 0,
      background: tk.panel, border: `1px solid ${tk.line}`,
      borderRadius: 16, padding: 20,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      boxShadow: tk.shadow,
      position: 'sticky', top: 76, alignSelf: 'flex-start',
      height: 'fit-content',
    }}>
      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 20 }}>
        {lbl('Filters', 'ফিল্টার')}
      </div>

      {fareValues.length > 0 && (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          {lbl('Available Fare', 'উপলব্ধ ভাড়া')}
        </div>
        <div style={{ background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 12, padding: 12, fontFamily: SANS, fontSize: 13, color: tk.text }}>
          {fareMin === fareMax ? `৳${fareMin}` : `৳${fareMin} - ৳${fareMax}`}
        </div>
      </div>
      )}

      {busTypes.length > 0 && (
        <FilterGroup tk={tk} lang={lang} heading={lbl('Bus Type', 'বাসের ধরন')} items={busTypes.map(type => ({ label: type }))} />
      )}

      {operators.length > 0 && (
        <FilterGroup tk={tk} lang={lang} heading={lbl('Operator', 'অপারেটর')} items={operators.map(name => ({ label: name }))} />
      )}
    </div>
  );

  return (
    <PageShell {...props}>
    <div style={{ color: tk.text }}>
      {/* Hero bar */}
      <div style={{
        background: tk.panel, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${tk.line}`, padding: isMobile ? '16px' : '16px 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* From → distance → To */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}>
            <input
              defaultValue={fromQ}
              style={{
                background: tk.inputBg, border: `1px solid ${tk.line}`, borderRadius: 10,
                padding: '8px 12px', fontFamily: SANS, fontSize: 14, fontWeight: 600, color: tk.text,
                outline: 'none', minWidth: 120,
              }}
            />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: SANS, fontSize: 12, color: tk.textFaint, whiteSpace: 'nowrap',
            }}>
              <div style={{ width: 28, height: 1, background: tk.line }} />
              <span>{lbl('Route', 'রুট')}</span>
              <div style={{ width: 28, height: 1, background: tk.line }} />
            </div>
            <input
              defaultValue={toQ}
              style={{
                background: tk.inputBg, border: `1px solid ${tk.line}`, borderRadius: 10,
                padding: '8px 12px', fontFamily: SANS, fontSize: 14, fontWeight: 600, color: tk.text,
                outline: 'none', minWidth: 120,
              }}
            />
            <button style={{
              background: tk.primarySoft, border: `1px solid ${tk.primary}`,
              borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontFamily: SANS, fontSize: 14, color: tk.primary,
            }}>⇄</button>
          </div>

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STAT_CHIPS.map((chip) => {
              const value = chip.key === 'count'
                ? String(RESULTS.length)
                : chip.key === 'from'
                  ? (fromQ || lbl('Any', 'যেকোনো'))
                  : (toQ || lbl('Any', 'যেকোনো'));
              return (
              <div key={chip.label} style={{
                background: tk.panelMuted, border: `1px solid ${tk.line}`,
                borderRadius: 999, padding: '6px 14px',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: SANS, fontSize: 12,
              }}>
                <span style={{ fontSize: 14 }}>{chip.icon}</span>
                <span style={{ color: tk.textDim }}>{lbl(chip.label, chip.labelBn)}</span>
                <span style={{ color: tk.text, fontWeight: 700 }}>{value}</span>
              </div>
            );})}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px' : '24px 32px',
        display: 'flex', gap: 24, alignItems: 'flex-start',
      }}>
        {/* Filter sidebar — desktop only */}
        {!isMobile && <FilterSidebar />}

        {/* Results list */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {RESULTS.map((r, idx) => (
            <React.Fragment key={r.busId}>
              {/* Inline ad after card 2 */}
              {idx === 2 && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
                </div>
              )}

              <div style={{
                background: tk.panel, border: `1px solid ${r.ai ? '#10b981' : tk.line}`,
                borderRadius: 18, overflow: 'hidden', boxShadow: tk.shadow,
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              }}>
                {/* AI recommended header */}
                {r.ai && (
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 14 }}>⚡</span>
                    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>
                      {lbl('AI Recommended', 'AI সুপারিশ')}
                    </span>
                    <span style={{
                      marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', borderRadius: 4,
                      padding: '2px 8px', fontFamily: SANS, fontSize: 11, color: '#fff',
                    }}>
                      {lbl('Best match', 'সেরা মিল')}
                    </span>
                  </div>
                )}

                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Badge */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: `linear-gradient(135deg, ${r.badgeColor} 0%, ${r.badgeColor}bb 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: SANS, fontSize: 13, fontWeight: 800, color: '#fff',
                    }}>
                      {r.badge}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 15, fontWeight: 700, color: tk.text }}>
                          {lbl(r.name, r.nameBn)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {r.fareOld && (
                            <span style={{ fontFamily: SANS, fontSize: 12, color: tk.textFaint, textDecoration: 'line-through' }}>
                              {r.fareOld}
                            </span>
                          )}
                          <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: '#10b981' }}>
                            {r.fare}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, color: tk.textDim, marginTop: 2 }}>
                        {lbl(r.route, r.routeBn)}
                      </div>

                      {/* Route bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, overflowX: 'auto' }}>
                        {r.stops.map((stop, si) => (
                          <React.Fragment key={stop}>
                            <div style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0,
                            }}>
                              <div style={{
                                width: si === 0 || si === r.stops.length - 1 ? 10 : 7,
                                height: si === 0 || si === r.stops.length - 1 ? 10 : 7,
                                borderRadius: '50%',
                                background: si === 0 || si === r.stops.length - 1 ? r.badgeColor : tk.primary,
                                border: `2px solid ${tk.bg}`,
                                boxShadow: `0 0 0 1px ${si === 0 || si === r.stops.length - 1 ? r.badgeColor : tk.primary}`,
                              }} />
                              {!isMobile && (
                                <span style={{ fontFamily: SANS, fontSize: 9, color: tk.textFaint, whiteSpace: 'nowrap' }}>
                                  {stop}
                                </span>
                              )}
                            </div>
                            {si < r.stops.length - 1 && (
                              <div style={{ flex: 1, height: 2, background: tk.line, minWidth: 16, flexShrink: 1 }} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Bottom row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{
                            background: tk.panelMuted, border: `1px solid ${tk.line}`,
                            borderRadius: 6, padding: '3px 8px',
                            fontFamily: SANS, fontSize: 12, color: tk.textDim,
                          }}>
                            {lbl(r.type, r.typeBn)}
                          </span>
                          {r.ai && (
                            <span style={{ fontFamily: SANS, fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                              🌿 Eco
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button
                            onClick={() => setFavoriteIds(toggleFavoriteBus(r.busId))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: favoriteIds.includes(r.busId) ? tk.accent : tk.textFaint }}
                            title={lbl('Favorite bus', 'প্রিয় বাস')}
                          >
                            {favoriteIds.includes(r.busId) ? '♥' : '♡'}
                          </button>
                          <button
                            onClick={() => { trackBusSearch(r.busId, r.name); onNav('bus-detail', { busId: (r as any).busId, from: fromQ, to: toQ }); }}
                            style={{
                              background: tk.primarySoft, border: `1px solid ${tk.primary}`,
                              borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                              fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, fontWeight: 600, color: tk.primary,
                            }}
                          >
                            {lbl('View details', 'বিস্তারিত')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}

          {RESULTS.length === 0 && (
            <div style={{
              background: tk.panel, border: `1px solid ${tk.line}`,
              borderRadius: 18, padding: isMobile ? 16 : 20, boxShadow: tk.shadow,
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ width:34, height:34, borderRadius:10, display:'inline-flex', alignItems:'center', justifyContent:'center', background:tk.primarySoft, color:tk.primary, fontSize:18 }}>⇄</span>
                <div>
                  <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize:17, fontWeight:800, color:tk.text }}>
                    {sameLocation ? lbl('Pick two different locations', 'দুটি আলাদা লোকেশন বাছুন') : lbl('No direct bus found', 'সরাসরি বাস পাওয়া যায়নি')}
                  </div>
                  <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize:13, color:tk.textDim, lineHeight:1.5, marginTop:2 }}>
                    {sameLocation
                      ? lbl('From and To cannot be same. Change one location and search again.', 'শুরু ও গন্তব্য একই হতে পারে না। একটি লোকেশন বদলে আবার সার্চ করুন।')
                      : lbl('Try these transit routes. Suggestions use real KoyJabo bus routes and nearest available stops.', 'এই ট্রানজিট রুটগুলো চেষ্টা করুন। সুপারিশগুলো কই যাবোর আসল বাস রুট ও কাছের স্টপ থেকে তৈরি।')}
                  </div>
                </div>
              </div>

              {!sameLocation && transitRoutes.length === 0 && (
                <div style={{ marginTop:14, background:tk.panelMuted, border:`1px solid ${tk.line}`, borderRadius:12, padding:14, fontFamily:lang==='bn'?BEN:SANS, fontSize:13, color:tk.textDim, lineHeight:1.6 }}>
                  {lbl('No safe transit combination found from current bus data. Try a nearby main road or landmark.', 'বর্তমান বাস ডেটা থেকে নিরাপদ ট্রানজিট কম্বিনেশন পাওয়া যায়নি। কাছের প্রধান সড়ক বা ল্যান্ডমার্ক দিয়ে চেষ্টা করুন।')}
                </div>
              )}

              {transitRoutes.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:16 }}>
                  {transitRoutes.map((route, routeIdx) => {
                    const firstBusLeg = route.legs.find(leg => leg.kind === 'bus');
                    const firstBus = firstBusLeg?.kind === 'bus' ? firstBusLeg.bus : undefined;
                    return (
                      <div key={route.id} style={{ background:tk.panelMuted, border:`1px solid ${routeIdx === 0 ? tk.primary : tk.line}`, borderRadius:14, padding:14 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:10 }}>
                          <div>
                            <div style={{ fontFamily:lang==='bn'?BEN:SANS, fontSize:14, fontWeight:800, color:tk.text }}>
                              {routeIdx === 0 ? lbl('Best transit route', 'সেরা ট্রানজিট রুট') : route.title}
                            </div>
                            <div style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint, marginTop:3 }}>
                              {lbl(`${route.transfers} transfer`, `${route.transfers}টি ট্রান্সফার`)} · {Math.round(route.totalDuration)} min · ৳{route.totalFare} · {route.totalDistance.toFixed(1)} km
                            </div>
                          </div>
                          {firstBus && (
                            <button
                              onClick={() => { trackBusSearch(firstBus.id, firstBus.name); onNav('bus-detail', { busId: firstBus.id, from: fromQ, to: toQ }); }}
                              style={{ background:tk.primarySoft, border:`1px solid ${tk.primary}`, borderRadius:10, padding:'8px 12px', color:tk.primary, fontFamily:lang==='bn'?BEN:SANS, fontSize:12, fontWeight:800, cursor:'pointer' }}
                            >
                              {lbl('Open first bus', 'প্রথম বাস দেখুন')}
                            </button>
                          )}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                          {route.legs.map((leg, legIdx) => (
                            <div key={`${route.id}-${legIdx}`} style={{ display:'grid', gridTemplateColumns:'28px 1fr auto', gap:10, alignItems:'start' }}>
                              <span style={{ width:28, height:28, borderRadius:999, display:'inline-flex', alignItems:'center', justifyContent:'center', background:leg.kind === 'bus' ? tk.primarySoft : tk.inputBg, color:leg.kind === 'bus' ? tk.primary : tk.textDim, fontSize:14 }}>
                                {leg.kind === 'bus' ? '🚌' : '🚶'}
                              </span>
                              <div>
                                <div style={{ fontFamily:lang==='bn'?BEN:SANS, fontSize:13, fontWeight:700, color:tk.text }}>
                                  {leg.kind === 'bus'
                                    ? lbl(`Take ${leg.bus.name}`, `${leg.bus.bnName} ধরুন`)
                                    : lbl('Walk', 'হেঁটে যান')}
                                </div>
                                <div style={{ fontFamily:SANS, fontSize:12, color:tk.textDim, marginTop:2 }}>
                                  {leg.from} → {leg.to}
                                </div>
                              </div>
                              <div style={{ textAlign:'right', fontFamily:SANS, fontSize:11, color:tk.textFaint, whiteSpace:'nowrap' }}>
                                {Math.round(leg.durationMin)} min
                                {leg.kind === 'bus' && <div>৳{leg.fare}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bottom ad */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
          </div>
        </div>
      </div>

    </div>
    </PageShell>
  );
}

function FilterGroup({ tk, lang, heading, items }: { tk: Tokens; lang: Lang; heading: string; items: { label: string }[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        {heading}
      </div>
      {items.map((item) => (
        <label key={item.label} style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, cursor: 'pointer',
          fontFamily: SANS, fontSize: 13, color: tk.textDim,
        }}>
          <input
            type="checkbox"
            checked={!!checked[item.label]}
            onChange={(e) => setChecked((p) => ({ ...p, [item.label]: e.target.checked }))}
            style={{ accentColor: tk.primary, width: 14, height: 14 }}
          />
          {item.label}
        </label>
      ))}
    </div>
  );
}
