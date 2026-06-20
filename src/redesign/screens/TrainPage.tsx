import React, { useState, useMemo, useRef } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { SectionHeader } from '../components/SectionHeader';
import { Icon } from '../components/Icons';
import { ModeHero } from '../components/ModeHero';
import { Stars } from '../components/Stars';
import { BD_TRAIN_ROUTES, TRAIN_STATIONS } from '../../../data/bangladeshTrainData';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';
import { useLocationSearch } from '../../../hooks/useLocationSearch';
import { earnCoins } from '../utils/koyCoinService';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

// Map real BD_TRAIN_ROUTES to display format
const stationName = (id: string) => TRAIN_STATIONS[id]?.name ?? id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const stationBnName = (id: string) => TRAIN_STATIONS[id]?.bnName ?? stationName(id);
const routeIncludes = (r: typeof BD_TRAIN_ROUTES[number], q: string) => {
  const lq = q.toLowerCase().trim();
  if (!lq) return true;
  const routeText = [
    r.name, r.bnName, r.number, r.from, r.to, stationName(r.from), stationName(r.to), stationBnName(r.from), stationBnName(r.to),
    ...r.stops.flatMap(id => [id, stationName(id), stationBnName(id)]),
  ].join(' ').toLowerCase();
  return routeText.includes(lq);
};

const TRAINS = BD_TRAIN_ROUTES.map(r => ({
  source: r,
  num: r.number,
  bn: r.bnName,
  en: r.name,
  rbn: `${stationBnName(r.from)} → ${stationBnName(r.to)}`,
  ren: `${stationName(r.from)} → ${stationName(r.to)}`,
  dep: r.dhakaDepart ? r.dhakaDepart.replace(':', ':') + (parseInt(r.dhakaDepart) >= 12 ? ' PM' : ' AM') : '—',
  arr: r.destinationArrive ?? '—',
  dur: r.distanceKm ? `${r.distanceKm} km` : '—',
  fare: r.fare ? `${r.fare.shuvan}–${r.fare.acBerth ?? r.fare.snigdha}` : '—',
  off: r.offDay || 'নেই/None',
  col: [r.color ?? '#3b82f6', '#1e3a5f'] as [string, string],
  rating: 4.3,
  n: 0,
}));

const FEATURED_TRAIN_IDS = [
  'coxsbazar-express',
  'parjotak-express',
  'banalata-express',
  'jahanabad-express',
  'ruposhi-bangla',
];

const COACHES = [
  { l:'AC Berth', bn:'এসি বার্থ', c:'#7c3aed', fare:'৳ 2,656', n:'40 berths', e:'🛏️' },
  { l:'Snigdha', bn:'স্নিগ্ধা', c:'#3b82f6', fare:'৳ 1,591', n:'44 seats', e:'💺' },
  { l:'AC Chair', bn:'এসি চেয়ার', c:'#10b981', fare:'৳ 980', n:'54 seats', e:'🪑' },
  { l:'Shovon Chair', bn:'শোভন চেয়ার', c:'#f59e0b', fare:'৳ 535', n:'88 seats', e:'🎫' },
  { l:'Shovon', bn:'শোভন', c:'#6b7280', fare:'৳ 405', n:'120 seats', e:'🧳' },
];

const MAJOR_STATIONS = Object.values(TRAIN_STATIONS).slice(0, 12);

export function TrainPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (p=16): React.CSSProperties => ({ background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:16, padding:p });

  const [fromStation, setFromStation] = useState(params?.from ?? '');
  const [toStation, setToStation] = useState(params?.to ?? params?.search ?? '');
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Comprehensive station search: 139 hardcoded + 490 OSM railway stations
  const { suggestions: fromStationSuggs } = useLocationSearch(fromStation, { limit: 20, categories: ['railway_station'] });
  const { suggestions: toStationSuggs } = useLocationSearch(toStation, { limit: 20, categories: ['railway_station'] });
  const filterStations = (q: string, side: 'from' | 'to') =>
    (side === 'from' ? fromStationSuggs : toStationSuggs) as Suggestion[];

  const filteredTrains = useMemo(() => {
    const fromQ = fromStation.toLowerCase();
    const toQ = toStation.toLowerCase();
    if (!fromQ && !toQ) {
      const featured = FEATURED_TRAIN_IDS
        .map(id => TRAINS.find(train => train.source.id === id))
        .filter((train): train is typeof TRAINS[number] => !!train);
      return featured.length ? featured : TRAINS.slice(0, 5);
    }
    return TRAINS.filter(r => routeIncludes(r.source, fromQ) && routeIncludes(r.source, toQ));
  }, [fromStation, toStation]);
  const hasTrainSearch = Boolean(fromStation.trim() || toStation.trim());

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'0 0 80px':'0 0 48px' }}>
        <ModeHero tk={tk} isMobile={isMobile} lang={lang} kind="train"
          gradient="linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #f59e0b 100%)"
          title={T(lang,'বাংলাদেশ রেলওয়ে · সকল রুট','Bangladesh Railway · all routes')}
          subtitle={T(lang,'৩৫০+ আন্তঃনগর ট্রেন, ই-টিকেট বুকিং, লাইভ অবস্থান ট্র্যাকিং — পদ্মা সেতু রুট সহ।','350+ intercity trains, e-ticket booking, live position tracking — including Padma Bridge route.')}
          stats={[{v:'350+',l:T(lang,'ট্রেন','Trains')},{v:'64',l:T(lang,'জেলা','Districts')},{v:'5 days',l:T(lang,'অগ্রিম বুকিং','Advance booking')},{v:'★ 4.5',l:T(lang,'গড় রেটিং','Avg rating')}]}
        />

        <div style={{ padding:isMobile?'0 16px':'0 40px' }}>
          {/* Search card */}
          <div style={{ ...card(18), marginBottom:18 }}>
            <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
              {[{l:'🚆 '+T(lang,'ই-টিকেট','E-ticket'),on:true},{l:'🔍 PNR'},{l:'📍 '+T(lang,'লাইভ','Live')},{l:'🛤 '+T(lang,'রুট ম্যাপ','Route map')}].map((c,i)=>(
                <button key={i} style={{ ...chipBtn(tk), background:c.on?tk.text:tk.panel, color:c.on?tk.bg:tk.text, borderColor:c.on?tk.text:tk.line, fontWeight:c.on?700:500 }}>{c.l}</button>
              ))}
            </div>
            <div style={{ background:tk.inputBg, border:`1px solid ${tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }} className="kj-anim-glow"><Icon.search s={16}/></div>
              <span style={{ flex:1, fontFamily:BEN, fontSize:14, color:tk.textFaint }}>{T(lang,'যেমন: কক্সবাজার এক্সপ্রেস, সোনার বাংলা, ৭৮৬...','e.g. Cox\'s Bazar Express, Sonar Bangla, #786...')}</span>
              <div style={{ display:'flex', gap:4 }}>
                {[{l:T(lang,'নাম','Name'),c:'#7c3aed'},{l:T(lang,'নম্বর','Number'),c:'#3b82f6'},{l:'PNR',c:'#10b981'}].map((c,i)=>(
                  <span key={i} style={{ padding:'4px 8px', borderRadius:6, fontFamily:SANS, fontSize:10, fontWeight:700, background:`${c.c}22`, color:c.c }}>{c.l}</span>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 0.8fr auto', gap:10 }}>
              {/* FROM with real station suggestions via portal */}
              <div ref={fromRef} style={{ background:tk.inputBg, border:`1px solid ${fromFocus?tk.primary:tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.primarySoft, color:tk.primaryDeep, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.pin s={14}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'থেকে','From')}</div>
                  <input value={fromStation} onChange={e=>setFromStation(e.target.value)} onFocus={()=>setFromFocus(true)} onBlur={()=>setTimeout(()=>setFromFocus(false),150)} placeholder={T(lang,'ঢাকা / Dhaka','Dhaka')} style={{ background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text, width:'100%' }}/>
                </div>
              </div>
              {fromFocus && <SuggestionDropdown suggestions={filterStations(fromStation, 'from')} onSelect={s=>{setFromStation(s.label);setFromFocus(false);}} onDismiss={()=>setFromFocus(false)} tk={tk} lang={lang} anchorRef={fromRef}/>}
              {/* TO with real station suggestions via portal */}
              <div ref={toRef} style={{ background:tk.inputBg, border:`1px solid ${toFocus?tk.accent:tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.accentSoft, color:tk.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.flag s={14}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'গন্তব্য','To')}</div>
                  <input value={toStation} onChange={e=>setToStation(e.target.value)} onFocus={()=>setToFocus(true)} onBlur={()=>setTimeout(()=>setToFocus(false),150)} placeholder={T(lang,"কক্সবাজার","Cox's Bazar")} style={{ background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text, width:'100%' }}/>
                </div>
              </div>
              {toFocus && <SuggestionDropdown suggestions={filterStations(toStation, 'to')} onSelect={s=>{setToStation(s.label);setToFocus(false);}} onDismiss={()=>setToFocus(false)} tk={tk} lang={lang} anchorRef={toRef}/>}
              <div style={{ background:tk.inputBg, border:`1px solid ${tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.amberSoft, color:tk.amber, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.clock s={14}/></div>
                <div><div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'তারিখ','Date')}</div><div style={{ fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text }}>15 May</div></div>
              </div>
              <button onClick={()=>{ earnCoins(5,'Train search'); onNav('results'); }} style={{ background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', border:0, borderRadius:14, padding:isMobile?'12px 16px':'0 22px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, minHeight:isMobile?48:'auto', boxShadow:'0 8px 22px -10px #7c3aed' }}>
                <Icon.search s={16}/>{T(lang,'খুঁজুন','Search')}
              </button>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.5fr 1fr', gap:18 }}>
            {/* Trains list */}
            <div>
              <SectionHeader tk={tk} lang={lang}
                title={hasTrainSearch
                  ? T(lang,`${filteredTrains.length}টি ট্রেন পাওয়া গেছে`,`${filteredTrains.length} trains found`)
                  : T(lang,'প্রিয় ট্রেন','Favorite trains')}
                action={T(lang,'প্রিয় ট্রেন','Favorite trains')}/>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {filteredTrains.length === 0 && <div style={{ fontFamily:BEN, fontSize:13, color:tk.textFaint, padding:'16px 0', textAlign:'center' }}>{T(lang,'কোনো ট্রেন পাওয়া যায়নি','No trains found for this route')}</div>}
                {filteredTrains.map((t,i)=>(
                  <div key={t.source.id} onClick={()=>onNav('train-detail', { trainId: t.source.id })} style={{ ...card(14), cursor:'pointer' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <div style={{ width:48, height:48, borderRadius:12, flexShrink:0, background:`linear-gradient(135deg,${t.col[0]},${t.col[1]})`, color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontFamily:SANS, fontWeight:800, fontSize:12 }}>{t.num}</span>
                        <span style={{ fontSize:14 }}>🚆</span>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                          <span style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,t.bn,t.en)}</span>
                          {(t as any).isNew && <span style={{ background:'#f59e0b22', color:'#f59e0b', fontFamily:SANS, fontWeight:700, fontSize:9, padding:'2px 7px', borderRadius:999, letterSpacing:1 }}>NEW</span>}
                        </div>
                        <div style={{ fontFamily:BEN, fontSize:12, color:tk.textDim, marginTop:2 }}>{T(lang,t.rbn,t.ren)}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                          <Stars value={t.rating} size={10}/>
                          <span style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color:tk.text }}>{t.rating}</span>
                          <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>({t.n}) · {T(lang,'ছুটি','Off')}: {t.off.includes('/') ? t.off.split('/')[lang==='bn'?0:1] : t.off}</span>
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontFamily:SANS, fontWeight:800, fontSize:14, color:tk.text }}>৳ {t.fare}</div>
                        <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>{t.dep} → {t.arr}</div>
                        <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>{t.dur}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Coach classes */}
              <div style={card(16)}>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:12 }}>{T(lang,'কোচ ক্লাস','Coach classes')}</div>
                {COACHES.map((c,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderTop:i?`1px dashed ${tk.line}`:'' }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:`${c.c}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{c.e}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:BEN, fontWeight:700, fontSize:13, color:tk.text }}>{T(lang,c.bn,c.l)}</div>
                      <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>{c.n}</div>
                    </div>
                    <div style={{ fontFamily:SANS, fontWeight:800, fontSize:14, color:c.c }}>{c.fare}</div>
                  </div>
                ))}
              </div>

              {/* Major stations */}
              <div style={card(14)}>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:10 }}>{T(lang,'প্রধান স্টেশন','Major stations')}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                  {MAJOR_STATIONS.map((s)=>(
                    <div key={s.id} onClick={()=>setToStation(s.name)} style={{ background:tk.panelMuted, borderRadius:10, padding:'8px 10px', fontFamily:BEN, fontSize:12, color:tk.text, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14 }}>🏛️</span>{T(lang, s.bnName, s.name)}
                    </div>
                  ))}
                </div>
              </div>

              <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'mid-rect'}/>
            </div>
          </div>

          <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
        </div>
      </div>
    </PageShell>
  );
}
