import React, { useState, useMemo, useRef } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { SectionHeader } from '../components/SectionHeader';
import { Pill } from '../components/Pill';
import { Icon } from '../components/Icons';
import { ModeHero } from '../components/ModeHero';
import { Stars } from '../components/Stars';
import { BUS_DATA, STATIONS } from '../../../constants';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';
import { trackBusSearch, trackRouteSearch } from '../../../services/analyticsService';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

function routeColor(type: string): string {
  if (type === 'AC') return '#7c3aed';
  if (type === 'Local') return '#10b981';
  if (type === 'Double-Decker') return '#3b82f6';
  return '#f59e0b';
}

const OPERATORS = [
  { l:'GL', n:'Green Line', c:'#10b981' },{ l:'BR', n:'BRTC', c:'#3b82f6' },
  { l:'HF', n:'Hanif', c:'#ef4444' },{ l:'SH', n:'Shyamoli', c:'#f59e0b' },
  { l:'PR', n:'Projapoti', c:'#7eb344' },{ l:'AB', n:'Anabil', c:'#a855f7' },
];

const BRTA_FARE_LINKS = [
  { en:'Dhaka metro bus fare list · part 1', bn:'ঢাকা মেট্রো বাস ভাড়া · খণ্ড ১', href:'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2026/3/fb94d969-9720-4dc6-9589-64d61937f43e.pdf' },
  { en:'Dhaka metro bus fare list · part 2', bn:'ঢাকা মেট্রো বাস ভাড়া · খণ্ড ২', href:'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2026/3/c3b78cbd-92d8-4d04-97af-9d84c9d73398.pdf' },
  { en:'Dhaka metro bus fare list · part 3', bn:'ঢাকা মেট্রো বাস ভাড়া · খণ্ড ৩', href:'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2026/3/6b32beff-652f-4bf1-b773-905d1c184356.pdf' },
  { en:'Dhaka metro bus fare list · part 4', bn:'ঢাকা মেট্রো বাস ভাড়া · খণ্ড ৪', href:'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2026/3/ffa4f3a5-f2e8-4af9-831b-b3d848cadf12.pdf' },
  { en:'Inter-district fares from Gabtoli', bn:'গাবতলী থেকে আন্তঃজেলা ভাড়া', href:'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2026/3/e7ead280-5072-460b-aca2-f00205282cb9.pdf' },
  { en:'Inter-district fares from Mohakhali', bn:'মহাখালী থেকে আন্তঃজেলা ভাড়া', href:'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2026/3/01a6adca-d30c-43ee-951d-e5e2fd438285.pdf' },
  { en:'Inter-district fares from Sayedabad', bn:'সায়েদাবাদ থেকে আন্তঃজেলা ভাড়া', href:'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2026/3/57f7168d-54b0-430b-ae6d-ed6dd0581ad5.pdf' },
  { en:'Division-to-division fares', bn:'বিভাগ থেকে বিভাগ ভাড়া', href:'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2026/3/8aa4c1d2-6594-461c-8f43-7438b8be112f.pdf' },
];

const BRTA_SERVICE_LINKS = [
  { en:'BRTA official portal', bn:'বিআরটিএ অফিসিয়াল পোর্টাল', href:'https://brta.gov.bd/' },
  { en:'BRTA service portal', bn:'বিআরটিএ সার্ভিস পোর্টাল', href:'https://bsp.brta.gov.bd/' },
  { en:'Fee calculator', bn:'ফি ক্যালকুলেটর', href:'https://bsp.brta.gov.bd/feeCalculator' },
  { en:'Motor vehicle tax', bn:'এমভি ট্যাক্স', href:'https://brta.cnsbd.com/mvtax_brta' },
  { en:'Route permit renewal', bn:'রুট পারমিট নবায়ন', href:'https://brta.gov.bd/pages/static-pages/6922df7a933eb65569e2240e' },
  { en:'Fitness renewal', bn:'ফিটনেস নবায়ন', href:'https://brta.gov.bd/pages/static-pages/6922db91933eb65569e0af12' },
];

const BRTA_NOTES = [
  { en:'BRTA published Dhaka metro and inter-district bus fare PDFs, last updated 23 Apr 2026.', bn:'বিআরটিএ ঢাকা মেট্রো ও আন্তঃজেলা বাস ভাড়ার PDF প্রকাশ করেছে, সর্বশেষ হালনাগাদ ২৩ এপ্রিল ২০২৬।' },
  { en:'Route permit applications use BRTA head office, divisional office, or circle office depending on route scope.', bn:'রুটের ধরন অনুযায়ী রুট পারমিট আবেদন বিআরটিএ সদর, বিভাগীয় অফিস বা সার্কেল অফিসে জমা দিতে হয়।' },
  { en:'Fitness renewal requires vehicle inspection; Dhaka and Chattogram circles use online appointment.', bn:'ফিটনেস নবায়নে মোটরযান পরিদর্শন লাগে; ঢাকা ও চট্টগ্রাম সার্কেলে অনলাইন অ্যাপয়েন্টমেন্ট লাগে।' },
  { en:'BRTA Service Portal hotline: 16107.', bn:'বিআরটিএ সার্ভিস পোর্টাল হেল্পলাইন: ১৬১০৭।' },
];

function stopLabelFromId(id: string) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function buildBusLocationSuggestions(): Suggestion[] {
  const map = new Map<string, Suggestion>();
  Object.values(STATIONS).forEach(s => map.set(s.name.toLowerCase(), { id: s.id, label: s.name, sub: s.bnName }));
  BUS_DATA.forEach(bus => {
    bus.routeString.split(/[⇄→-]/).map(part => part.trim()).filter(Boolean).forEach(part => {
      if (!map.has(part.toLowerCase())) map.set(part.toLowerCase(), { id: part.toLowerCase().replace(/\s+/g, '_'), label: part, sub: bus.name });
    });
    bus.stops.forEach(stopId => {
      if (STATIONS[stopId]) return;
      const label = stopLabelFromId(stopId);
      if (!map.has(label.toLowerCase())) map.set(label.toLowerCase(), { id: stopId, label, sub: bus.name });
    });
  });
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function LocalBusPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (p=16): React.CSSProperties => ({ background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:16, padding:p });

  const [searchQuery, setSearchQuery] = useState(props.params?.search ?? '');
  const [fromInput, setFromInput] = useState(props.params?.from ?? '');
  const [toInput, setToInput] = useState(props.params?.to ?? '');
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Station suggestions from real STATIONS data
  const stationList: Suggestion[] = useMemo(buildBusLocationSuggestions, []);

  const filterStations = (q: string) => {
    if (!q.trim()) return stationList;
    const lq = q.toLowerCase();
    return stationList.filter(s =>
      s.label.toLowerCase().includes(lq) || (s.sub ?? '').toLowerCase().includes(lq)
    );
  };

  // Normalize station name for matching (remove spaces/punctuation for stop ID matching)
  const norm = (s: string) => s.toLowerCase().replace(/[\s\-\.]/g, '');

  const matchesStation = (r: typeof BUS_DATA[0], query: string) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const qNorm = norm(query);
    return r.routeString.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.bnName.includes(q) ||
      r.stops.some(s => s.toLowerCase().includes(qNorm) || s.toLowerCase().includes(q));
  };

  // Real bus route filtering
  const filteredRoutes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const f = fromInput.trim();
    const t = toInput.trim();

    if (q) {
      return BUS_DATA.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.bnName.toLowerCase().includes(q) ||
        r.routeString.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.stops.some(s => s.toLowerCase().includes(norm(q)))
      ).slice(0, 20);
    }
    if (f && t) {
      const results = BUS_DATA.filter(r => matchesStation(r, f) && matchesStation(r, t)).slice(0, 20);
      if (results.length) return results;
    }
    if (f) return BUS_DATA.filter(r => matchesStation(r, f)).slice(0, 15);
    if (t) return BUS_DATA.filter(r => matchesStation(r, t)).slice(0, 15);
    // Default: popular named routes
    return BUS_DATA.filter(r => r.active !== false && r.name.length > 3).slice(0, 10);
  }, [searchQuery, fromInput, toInput]);
  const canFindBus = Boolean(fromInput.trim() && toInput.trim());

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'0 0 80px':'0 0 48px' }}>
        <ModeHero tk={tk} isMobile={isMobile} lang={lang} kind="bus"
          gradient="linear-gradient(135deg, #006a4e 0%, #10b981 60%, #fbbf24 100%)"
          title={T(lang,'ঢাকার সব বাস · এক অ্যাপে','Every Dhaka bus · in one app')}
          subtitle={T(lang,'বাস রুট, স্টপ, বিআরটিএ ভাড়া তালিকা ও অফিসিয়াল সেবা লিংক — অফলাইনেও কাজ করে।','Bus routes, stops, BRTA fare lists, and official service links — works offline too.')}
          stats={[{v:String(BUS_DATA.length),l:T(lang,'রুট','Routes')},{v:String(stationList.length),l:T(lang,'লোকেশন','Locations')},{v:'BRTA',l:T(lang,'ভাড়া সূত্র','Fare source')},{v:'16107',l:T(lang,'হেল্পলাইন','Helpline')}]}
        />

        <div style={{ padding:isMobile?'0 16px':'0 40px' }}>
          {/* Search card */}
          <div style={{ ...card(16), marginBottom:18, boxShadow:tk.shadow }}>
            <div style={{ background:tk.inputBg, border:`1px solid ${tk.line}`, borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${tk.primary},${tk.primaryDeep})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }} className="kj-anim-glow">
                <Icon.search s={14}/>
              </div>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder={T(lang,'যেমন: গ্রীন লাইন, রাইদা ৭, BRTC দোতলা, রুট ৬...','e.g. Green Line, Raida #7, BRTC Double, Route 6...')} style={{ flex:1, background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:14, color:tk.text }}/>
            </div>
            <div style={{ display:'flex', gap:6, marginBottom:12 }}>
              {[{l:T(lang,'নাম','Name'),on:true},{l:T(lang,'রুট','Route')},{l:T(lang,'অপারেটর','Operator')}].map((c,i)=>(
                <button key={i} style={{ ...chipBtn(tk), background:c.on?tk.primarySoft:tk.panelMuted, color:c.on?tk.primary:tk.textDim, borderColor:c.on?tk.primary:tk.line, fontWeight:c.on?700:500 }}>{c.l}</button>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr auto', gap:10 }}>
              {/* FROM field with suggestions via portal */}
              <div ref={fromRef} style={{ background:tk.inputBg, border:`1px solid ${fromFocus?tk.primary:tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:12, transition:'border-color 0.15s' }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.primarySoft, color:tk.primaryDeep, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.pin s={16}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'কোথা থেকে','From')}</div>
                  <input value={fromInput} onChange={e=>setFromInput(e.target.value)} onFocus={()=>setFromFocus(true)} onBlur={()=>setTimeout(()=>setFromFocus(false),150)} placeholder={T(lang,'গুলশান ১','Gulshan 1')} style={{ background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:15, fontWeight:600, color:tk.text, marginTop:2, width:'100%' }}/>
                </div>
              </div>
              {fromFocus && <SuggestionDropdown suggestions={filterStations(fromInput)} maxItems={stationList.length} onSelect={s=>{setFromInput(s.label);setFromFocus(false);}} onDismiss={()=>setFromFocus(false)} tk={tk} lang={lang} anchorRef={fromRef}/>}
              {/* TO field with suggestions via portal */}
              <div ref={toRef} style={{ background:tk.inputBg, border:`1px solid ${toFocus?tk.accent:tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:12, transition:'border-color 0.15s' }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.accentSoft, color:tk.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.flag s={16}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'কোথায়','To')}</div>
                  <input value={toInput} onChange={e=>setToInput(e.target.value)} onFocus={()=>setToFocus(true)} onBlur={()=>setTimeout(()=>setToFocus(false),150)} placeholder={T(lang,'মতিঝিল','Motijheel')} style={{ background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:15, fontWeight:600, color:tk.text, marginTop:2, width:'100%' }}/>
                </div>
              </div>
              {toFocus && <SuggestionDropdown suggestions={filterStations(toInput)} maxItems={stationList.length} onSelect={s=>{setToInput(s.label);setToFocus(false);}} onDismiss={()=>setToFocus(false)} tk={tk} lang={lang} anchorRef={toRef}/>}
              <button disabled={!canFindBus} onClick={()=>{ if (!canFindBus) return; trackRouteSearch(fromInput, toInput); onNav('results', { from: fromInput, to: toInput, search: searchQuery }); }} style={{ background:`linear-gradient(135deg,${tk.primary},${tk.primaryDeep})`, color:tk.primaryInk, border:0, borderRadius:14, padding:isMobile?'12px 16px':'0 22px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor:canFindBus?'pointer':'not-allowed', opacity:canFindBus?1:0.5, display:'flex', alignItems:'center', justifyContent:'center', gap:8, minHeight:isMobile?48:'auto', boxShadow:`0 8px 22px -10px ${tk.primary}` }}>
                <Icon.search s={16}/>{T(lang,'বাস খুঁজুন','Find bus')}
              </button>
            </div>
            <div style={{ display:'flex', gap:6, marginTop:12, flexWrap:'wrap' }}>
              {[{l:'⚡ '+T(lang,'দ্রুততম','Fastest'),on:true},{l:'৳ '+T(lang,'সস্তা','Cheapest')},{l:'❄️ AC'},{l:'🚻 '+T(lang,'টয়লেট','Toilet')},{l:'👥 '+T(lang,'কম ভিড়','Less crowd')}].map((c,i)=>(
                <button key={i} style={{ ...chipBtn(tk), background:c.on?tk.text:tk.panelMuted, color:c.on?tk.bg:tk.text, borderColor:c.on?tk.text:tk.line, fontWeight:c.on?700:500 }}>{c.l}</button>
              ))}
            </div>
          </div>

          <div style={{ ...card(16), marginBottom:18 }}>
            <SectionHeader tk={tk} lang={lang} title={T(lang,'বিআরটিএ অফিসিয়াল বাস তথ্য','BRTA official bus information')}/>
            <div style={{ fontFamily:SANS, fontSize:11, fontWeight:700, color:tk.textFaint, margin:'4px 0 12px' }}>{T(lang,'সূত্র: brta.gov.bd','Source: brta.gov.bd')}</div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.05fr 0.95fr', gap:14 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {BRTA_NOTES.map((note,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', background:tk.panelMuted, border:`1px solid ${tk.line}`, borderRadius:12, padding:12 }}>
                    <span style={{ width:24, height:24, flexShrink:0, borderRadius:999, display:'inline-flex', alignItems:'center', justifyContent:'center', background:tk.primarySoft, color:tk.primary, fontFamily:SANS, fontWeight:900, fontSize:12 }}>{i+1}</span>
                    <span style={{ fontFamily:lang==='bn'?BEN:SANS, fontSize:13, color:tk.textDim, lineHeight:1.6 }}>{T(lang,note.bn,note.en)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:8, alignContent:'start' }}>
                {[...BRTA_SERVICE_LINKS, ...BRTA_FARE_LINKS].map(link=>(
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer" style={{ textDecoration:'none', color:tk.text, background:tk.inputBg, border:`1px solid ${tk.line}`, borderRadius:12, padding:'10px 12px', fontFamily:lang==='bn'?BEN:SANS, fontWeight:800, fontSize:12, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                    <span>{T(lang,link.bn,link.en)}</span>
                    <span style={{ color:tk.primary }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr', gap:isMobile?18:24 }}>
            {/* Popular routes */}
            <div>
              <SectionHeader tk={tk} lang={lang}
                title={(searchQuery || fromInput || toInput)
                  ? T(lang, `${filteredRoutes.length}টি রুট পাওয়া গেছে`, `${filteredRoutes.length} routes found`)
                  : T(lang,'জনপ্রিয় বাস রুট','Popular bus routes')}
                action={T(lang,'সব দেখুন','See all')}/>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {filteredRoutes.length === 0 && (
                  <div style={{ fontFamily:BEN, fontSize:13, color:tk.textFaint, padding:'12px 0', textAlign:'center' }}>{T(lang,'কোনো রুট পাওয়া যায়নি','No routes found')}</div>
                )}
                {filteredRoutes.map((r,i)=>{
                  const col = routeColor(r.type);
                  const initials = r.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
                  return (
                    <div key={r.id||i} onClick={()=>{ trackBusSearch(r.id, r.name); onNav('bus-detail', { busId: r.id, from: fromInput, to: toInput }); }} style={{ ...card(14), display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
                      <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, background:`linear-gradient(135deg,${col}cc,${col})`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SANS, fontWeight:800, fontSize:13 }}>{initials}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                          <span style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{lang==='bn'?r.bnName:r.name}</span>
                          {r.type==='AC' && <Pill tk={tk} tone="primary">AC</Pill>}
                        </div>
                        <div style={{ fontFamily:BEN, fontSize:12, color:tk.textDim, marginTop:2 }}>{r.routeString}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                          <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>{r.type}</span>
                          {r.hours && <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>· {r.hours}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <Icon.arrowR s={14}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={card(16)}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ width:10, height:10, borderRadius:999, background:tk.primary }} className="kj-anim-pulse"/>
                  <span style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, flex:1 }}>{T(lang,'বিআরটিএ জরুরি তথ্য','BRTA essentials')}</span>
                </div>
                {BRTA_NOTES.map((note,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0', borderTop:i?`1px dashed ${tk.line}`:'' }}>
                    <span style={{ width:20, height:20, borderRadius:999, background:tk.primarySoft, color:tk.primary, display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily:SANS, fontWeight:900, fontSize:10, flexShrink:0 }}>{i+1}</span>
                    <span style={{ fontFamily:lang==='bn'?BEN:SANS, fontSize:12, color:tk.textDim, lineHeight:1.55 }}>{T(lang,note.bn,note.en)}</span>
                  </div>
                ))}
              </div>
              <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'mid-rect'}/>
              <div style={card(14)}>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:13, color:tk.text, marginBottom:10 }}>{T(lang,'শীর্ষ অপারেটর','Top operators')}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                  {OPERATORS.map((o,i)=>(
                    <div key={i} style={{ background:`${o.c}22`, borderRadius:10, padding:'10px 8px', textAlign:'center', cursor:'pointer' }}>
                      <div style={{ fontFamily:SANS, fontWeight:800, fontSize:13, color:o.c }}>{o.l}</div>
                      <div style={{ fontFamily:SANS, fontSize:9, color:tk.textFaint, marginTop:2, fontWeight:600 }}>{o.n}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
        </div>
      </div>
    </PageShell>
  );
}
