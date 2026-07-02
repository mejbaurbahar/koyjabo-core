import React, { useRef, useMemo, useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn, N, Fare } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot, NativeAdCard, AdCluster } from '../components/AdSlot';
import { PromoBanner } from '../components/PromoBanner';
import { SectionHeader } from '../components/SectionHeader';
import { Icon } from '../components/Icons';
import { ModeHero } from '../components/ModeHero';
import { Stars } from '../components/Stars';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';
import { earnCoins } from '../utils/koyCoinService';
import { DOMESTIC_ROUTES, AIRPORTS_DATA } from '../../../data/bangladeshFlightData';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

// Airline display metadata (colors, ratings)
const AIRLINE_META: Record<string,{name:{bn:string;en:string};col:[string,string];rating:number;reviews:number}> = {
  BG: { name:{bn:'বিমান বাংলাদেশ',en:'Biman Bangladesh'}, col:['#006a4e','#10b981'], rating:4.2, reviews:1240 },
  BS: { name:{bn:'ইউএস-বাংলা',en:'US-Bangla'}, col:['#0c4a6e','#0ea5e9'], rating:4.5, reviews:2310 },
  VQ: { name:{bn:'নোভোএয়ার',en:'NOVOAIR'}, col:['#b45309','#f59e0b'], rating:4.3, reviews:980 },
  '2A':{ name:{bn:'এয়ার আস্ট্রা',en:'Air Astra'}, col:['#7c3aed','#a855f7'], rating:4.1, reviews:410 },
};

const CABINS = [
  { l:'Business', bn:'বিজনেস', c:'#7c3aed', p:'৳ 12,500', e:'🥂', desc:{bn:'প্রায়োরিটি · লাউঞ্জ',en:'Priority · lounge'} },
  { l:'Economy Plus', bn:'ইকোনমি প্লাস', c:'#0ea5e9', p:'৳ 6,200', e:'🪑', desc:{bn:'বাড়তি লেগরুম',en:'Extra legroom'} },
  { l:'Economy', bn:'ইকোনমি', c:'#10b981', p:'৳ 4,199', e:'💺', desc:{bn:'স্ট্যান্ডার্ড · ২০কেজি',en:'Standard · 20kg'} },
  { l:'Saver', bn:'সেভার', c:'#f59e0b', p:'৳ 3,990', e:'🎒', desc:{bn:'কেবিন ব্যাগ মাত্র',en:'Cabin bag only'} },
];

export function FlightsPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (p=16): React.CSSProperties => ({ background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:16, padding:p });

  const [fromAirport, setFromAirport] = useState(params?.from ?? '');
  const [toAirport, setToAirport] = useState(params?.to ?? params?.search ?? '');
  const [hasSearched, setHasSearched] = useState(!!(params?.from || params?.to || params?.search));
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const filterAirports = (q: string): Suggestion[] => {
    const lq = q.toLowerCase();
    const list = q.trim() === ''
      ? AIRPORTS_DATA
      : AIRPORTS_DATA.filter(a =>
          a.iata.toLowerCase().includes(lq) ||
          a.en.toLowerCase().includes(lq) ||
          a.bn.includes(q)
        );
    return list.map(a => ({ id: a.iata, label: a.iata + ' · ' + a.en, sub: a.bn }));
  };

  const fromSuggestions = useMemo(() => filterAirports(fromAirport), [fromAirport]);
  const toSuggestions = useMemo(() => filterAirports(toAirport), [toAirport]);

  // Extract IATA code from display string like "DAC · Dhaka"
  const extractIATA = (s: string) => s.match(/^([A-Z]{3})/)?.[1] ?? s.toUpperCase().slice(0,3);
  const fromIATA = fromAirport ? extractIATA(fromAirport) : 'DAC';
  const toIATA = toAirport ? extractIATA(toAirport) : 'CXB';

  const filteredFlights = useMemo(() => {
    const routes = DOMESTIC_ROUTES.filter(r => r.from === fromIATA && r.to === toIATA);
    const minFare = routes.length ? Math.min(...routes.map(x => x.fareEco)) : 0;
    return routes.map(r => {
      const meta = AIRLINE_META[r.airline] ?? { name:{bn:r.airline,en:r.airline}, col:['#3b82f6','#60a5fa'] as [string,string], rating:4.0, reviews:0 };
      return {
        ...r, ...meta,
        fare: r.fareEco.toLocaleString(),
        stop: r.daysOp === 'Daily' ? 'Nonstop' : r.daysOp,
        best: r.airline === 'BS',
        cheap: routes.length > 1 && r.fareEco === minFare,
      };
    });
  }, [fromIATA, toIATA]);
  // Workaround: re-compute without circular ref
  const filteredFlights2 = useMemo(() => {
    const routes = DOMESTIC_ROUTES.filter(r => r.from === fromIATA && r.to === toIATA);
    const minFare = routes.length ? Math.min(...routes.map(r=>r.fareEco)) : 0;
    return routes.map(r => {
      const meta = AIRLINE_META[r.airline] ?? { name:{bn:r.airline,en:r.airline}, col:['#3b82f6','#60a5fa'] as [string,string], rating:4.0, reviews:0 };
      return {
        ...r, ...meta,
        fare: r.fareEco.toLocaleString(),
        stop: 'Nonstop',
        best: r.airline === 'BS',
        cheap: r.fareEco === minFare && routes.length > 1,
      };
    });
  }, [fromIATA, toIATA]);

  const fromAirportName = AIRPORTS_DATA.find(a=>a.iata===fromIATA)?.en ?? fromIATA;
  const toAirportName = AIRPORTS_DATA.find(a=>a.iata===toIATA)?.en ?? toIATA;

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'0 0 80px':'0 0 48px' }}>
        <ModeHero tk={tk} isMobile={isMobile} lang={lang} kind="plane"
          gradient="linear-gradient(135deg, #0a1d3a 0%, #1e5aa0 55%, #22d3ee 100%)"
          title={T(lang,'অভ্যন্তরীণ ফ্লাইট · এক সার্চে','Domestic flights · one search')}
          subtitle={T(lang,'৪টি এয়ারলাইন ও ৮টি বিমানবন্দরের রুট গাইড। চূড়ান্ত ভাড়া ও সিট এয়ারলাইনের অফিসিয়াল সাইটে যাচাই করুন।','Route guide for 4 airlines and 8 airports. Verify final fares and seats on official airline sites.')}
          stats={[{v:N(4,lang),l:T(lang,'এয়ারলাইন','Airlines')},{v:N(8,lang),l:T(lang,'বিমানবন্দর','Airports')},{v:'৳ '+N('3,990',lang),l:T(lang,'শুরু থেকে','From')},{v:'★ '+N('4.4',lang),l:T(lang,'গড় রেটিং','Avg rating')}]}
        />

        <div style={{ padding:isMobile?'0 16px':'0 40px' }}>
          {/* Search */}
          <div style={{ ...card(16), marginBottom:18 }}>
            <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
              {[{l:'↔ '+T(lang,'ওয়ান ওয়ে','One way'),on:true},{l:'⇄ '+T(lang,'রাউন্ড ট্রিপ','Round trip')},{l:'👥 '+T(lang,'১ যাত্রী','1 passenger')},{l:'💺 '+T(lang,'ইকোনমি','Economy')}].map((c,i)=>(
                <button key={i} style={{ ...chipBtn(tk), background:c.on?tk.text:tk.panelMuted, color:c.on?tk.bg:tk.text, borderColor:c.on?tk.text:tk.line, fontWeight:c.on?700:500 }}>{c.l}</button>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr auto', gap:10 }}>
              {/* From */}
              <div ref={fromRef} style={{ background:tk.inputBg, border:`1px solid ${fromFocus?tk.primary:tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.primarySoft, color:tk.primaryDeep, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.pin s={14}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'থেকে','From')}</div>
                  <input
                    value={fromAirport}
                    onChange={e => setFromAirport(e.target.value)}
                    onFocus={() => setFromFocus(true)}
                    onBlur={() => setTimeout(() => setFromFocus(false), 150)}
                    placeholder={T(lang,'ঢাকা (DAC)','Dhaka (DAC)')}
                    style={{ fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text, background:'transparent', border:'none', outline:'none', width:'100%', padding:0 }}
                  />
                </div>
              </div>
              {/* To */}
              <div ref={toRef} style={{ background:tk.inputBg, border:`1px solid ${toFocus?tk.accent:tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.accentSoft, color:tk.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.flag s={14}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'গন্তব্য','To')}</div>
                  <input
                    value={toAirport}
                    onChange={e => setToAirport(e.target.value)}
                    onFocus={() => setToFocus(true)}
                    onBlur={() => setTimeout(() => setToFocus(false), 150)}
                    placeholder={T(lang,"কক্সবাজার (CXB)","Cox's Bazar (CXB)")}
                    style={{ fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text, background:'transparent', border:'none', outline:'none', width:'100%', padding:0 }}
                  />
                </div>
              </div>
            </div>
            {fromFocus && (
              <SuggestionDropdown
                suggestions={fromSuggestions}
                onSelect={s => { setFromAirport(s.label); setFromFocus(false); }}
                onDismiss={() => setFromFocus(false)}
                tk={tk} lang={lang}
                anchorRef={fromRef as React.RefObject<HTMLElement>}
              />
            )}
            {toFocus && (
              <SuggestionDropdown
                suggestions={toSuggestions}
                onSelect={s => { setToAirport(s.label); setToFocus(false); }}
                onDismiss={() => setToFocus(false)}
                tk={tk} lang={lang}
                anchorRef={toRef as React.RefObject<HTMLElement>}
              />
            )}
            {(() => {
              const canSearch = !!(fromAirport.trim() || toAirport.trim());
              return (
                <button disabled={!canSearch} onClick={()=>{ if (!canSearch) return; earnCoins(5, 'Flight search'); setHasSearched(true); document.getElementById('flights-results')?.scrollIntoView({ behavior:'smooth', block:'start' }); }} style={{ background: canSearch?'linear-gradient(135deg,#1e5aa0,#0a1d3a)':tk.panelMuted, color: canSearch?'#fff':tk.textFaint, border:0, borderRadius:14, padding:isMobile?'12px 16px':'10px 22px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor: canSearch?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, minHeight:isMobile?48:'auto', boxShadow: canSearch?'0 8px 22px -10px #1e5aa0':'none', marginTop:10, opacity: canSearch?1:0.6 }}>
                  <Icon.search s={16}/>{T(lang,'ফ্লাইট খুঁজুন','Find flights')}
                </button>
              );
            })()}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.5fr 1fr', gap:18 }}>
            {/* Flights list */}
            <div id="flights-results">
              <SectionHeader tk={tk} lang={lang} title={T(lang,`এয়ারলাইন গাইড · ${fromIATA} → ${toIATA}`,`Airline guide · ${fromAirportName} → ${toAirportName}`)} action={T(lang,'সব দেখুন','See all')}/>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {!hasSearched
                  ? <div style={{ fontFamily:BEN, fontSize:13, color:tk.textFaint, padding:'16px 0', textAlign:'center' }}>{T(lang,'বিমানবন্দর বেছে ফ্লাইট খুঁজুন বোতাম চাপুন','Select airports and tap Find flights')}</div>
                  : filteredFlights2.length === 0
                  ? <div style={{ fontFamily:BEN, fontSize:13, color:tk.textFaint, padding:'16px 0' }}>{T(lang,'এই রুটে কোনো ফ্লাইট পাওয়া যায়নি।','No flights found for this route.')}</div>
                  : null}
                {(hasSearched && filteredFlights2.length > 0 ? filteredFlights2 : []).map((a,i)=>(
                  <div key={i} onClick={()=>{ earnCoins(2, 'View flight details'); onNav('flight-detail', { code: a.airline, flightNo: a.flightNo, dep: a.dep, arr: a.arr, dur: a.dur, fromIATA, toIATA, fromName: fromAirportName, toName: toAirportName, fare: String(a.fareEco) }); }} style={{ ...card(14), position:'relative', overflow:'hidden', cursor:'pointer' }}>
                    {a.best && <div style={{ position:'absolute', top:0, right:0, background:'linear-gradient(90deg,#0ea5e9,#22d3ee)', color:'#04130d', padding:'3px 10px', borderRadius:'0 16px 0 10px', fontFamily:SANS, fontWeight:800, fontSize:9, letterSpacing:1 }}>★ {T(lang,'সেরা','BEST')}</div>}
                    {a.cheap && <div style={{ position:'absolute', top:0, right:0, background:'linear-gradient(90deg,#a855f7,#7c3aed)', color:'#fff', padding:'3px 10px', borderRadius:'0 16px 0 10px', fontFamily:SANS, fontWeight:800, fontSize:9, letterSpacing:1 }}>৳ {T(lang,'সস্তা','CHEAPEST')}</div>}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, background:`linear-gradient(135deg,${a.col[0]},${a.col[1]})`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SANS, fontWeight:800, fontSize:14 }}>{a.airline}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,a.name.bn,a.name.en)}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:3 }}>
                          <Stars value={a.rating} size={10}/>
                          <span style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color:tk.text }}>{a.rating}</span>
                          <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>({a.reviews})</span>
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontFamily:SANS, fontWeight:800, fontSize:18, color:tk.text, letterSpacing:-0.3 }}>৳ {N(a.fare, lang)}</div>
                        <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint, fontWeight:600 }}>{T(lang,'অফিসিয়াল সাইটে যাচাই করুন','verify official site')}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:10, borderTop:`1px dashed ${tk.line}` }}>
                      <div><div style={{ fontFamily:SANS, fontWeight:700, fontSize:15, color:tk.text }}>{N(a.dep, lang)}</div><div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>DAC</div></div>
                      <div style={{ flex:1, position:'relative', height:14 }}>
                        <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1.5, background:tk.line }}/>
                        <span style={{ position:'absolute', left:'50%', top:-3, transform:'translateX(-50%)', fontSize:12 }}>✈️</span>
                        <span style={{ position:'absolute', left:'50%', bottom:-12, transform:'translateX(-50%)', fontFamily:SANS, fontSize:9, fontWeight:700, color:tk.textFaint, whiteSpace:'nowrap' }}>{a.dur} · {a.stop}</span>
                      </div>
                      <div style={{ textAlign:'right' }}><div style={{ fontFamily:SANS, fontWeight:700, fontSize:15, color:tk.text }}>{N(a.arr, lang)}</div><div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>CXB</div></div>
                      <button style={{ ...chipBtn(tk), padding:'7px 12px', fontSize:11, fontWeight:700, background:a.col[1], color:'#fff', borderColor:a.col[1], marginLeft:6 }}>{T(lang,'বিস্তারিত','Details')} →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={card(16)}>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:10 }}>{T(lang,'কেবিন ক্লাস','Cabin classes')}</div>
                {CABINS.map((c,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderTop:i?`1px dashed ${tk.line}`:'' }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:`${c.c}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{c.e}</div>
                    <div style={{ flex:1 }}><div style={{ fontFamily:BEN, fontWeight:700, fontSize:13, color:tk.text }}>{T(lang,c.bn,c.l)}</div><div style={{ fontFamily:BEN, fontSize:11, color:tk.textFaint }}>{T(lang,c.desc.bn,c.desc.en)}</div></div>
                    <div style={{ fontFamily:SANS, fontWeight:800, fontSize:13, color:c.c }}>{Fare(c.p.replace(/৳\s*/,''), lang)}</div>
                  </div>
                ))}
              </div>

              <PromoBanner tk={tk} lang={lang} page="flight" onNav={onNav}/>
              <NativeAdCard
                tk={tk}
                lang={lang}
                kind={isMobile?'mob-banner':'mid-rect'}
                title={T(lang, 'ফ্লাইট অফার ও ছাড়', 'Flight offers & discounts')}
                subtitle={T(lang, 'কার্ড ও এয়ারলাইন ডিল', 'Card & airline deals')}
                icon="✈️"
                compact
              />
            </div>
          </div>

          {/* Ad between results and tip */}
          <NativeAdCard
            tk={tk}
            lang={lang}
            kind="in-article"
            title={T(lang, 'সংশ্লিষ্ট ভ্রমণ অফার', 'Related travel offers')}
            icon="🎫"
          />

          <div style={{ ...card(14), background:tk.amberSoft, borderColor:tk.amber, marginBottom:18 }}>
            <div style={{ fontFamily:BEN, fontSize:13, color:tk.amber, lineHeight:1.6 }}>
              ℹ️ {T(lang,'কই যাবো শুধুমাত্র ফ্লাইট তথ্য দেখায় — টিকেট কিনতে সরাসরি এয়ারলাইন ওয়েবসাইট বা বিমানবন্দরে যান।','KoyJabo shows flight info only — purchase tickets at official airline websites or airports.')}
            </div>
          </div>

          <NativeAdCard
            tk={tk}
            lang={lang}
            kind="multiplex"
            title={T(lang, 'আরও দেখুন', 'You might also like')}
            subtitle={T(lang, 'সংশ্লিষ্ট গন্তব্য ও অফার', 'Related destinations & offers')}
            icon="🧭"
          />
          <NativeAdCard
            tk={tk}
            lang={lang}
            kind={isMobile?'mob-banner':'leaderboard'}
            title={T(lang, 'বাজেট ভ্রমণ টিপস', 'Budget travel tips')}
            icon="💰"
          />
        </div>
      </div>
          <AdCluster tk={tk} lang={lang} count={1} isMobile={isMobile}/>
    </PageShell>
  );
}
