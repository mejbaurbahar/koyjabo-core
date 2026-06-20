import React, { useState, useRef, useMemo } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { SectionHeader } from '../components/SectionHeader';
import { Icon } from '../components/Icons';
import { ModeHero } from '../components/ModeHero';
import { Stars } from '../components/Stars';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';
import { earnCoins } from '../utils/koyCoinService';
import { LAUNCH_ROUTES, LAUNCH_TERMINALS } from '../../../data/bangladeshLaunchData';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

// Use real LAUNCH_TERMINALS from data file (12 terminals)

const LAUNCHES = [
  { n:{bn:'সুন্দরবন-১২',en:'Sundarban-12'}, op:{bn:'সুন্দরবন নেভিগেশন',en:'Sundarban Navigation'}, dep:'6:30 PM', arr:'5:00 AM', dur:'10h 30m', deck:300, vip:4500, rating:4.5, reviews:0, col:'#0ea5e9' },
  { n:{bn:'পারাবত-১৮',en:'Parabat-18'}, op:{bn:'পারাবত শিপিং',en:'Parabat Shipping'}, dep:'7:00 PM', arr:'6:00 AM', dur:'11h 0m', deck:280, vip:4000, rating:4.3, reviews:0, col:'#0c4a6e' },
  { n:{bn:'কীর্তনখোলা-১০',en:'Kirtonkhola-10'}, op:{bn:'কীর্তনখোলা শিপিং',en:'Kirtonkhola Shipping'}, dep:'7:30 PM', arr:'6:30 AM', dur:'11h 0m', deck:300, vip:5500, rating:4.6, reviews:521, premium:true, col:'#7c3aed' },
  { n:{bn:'এমভি অ্যাডভেঞ্চার-৯',en:'MV Adventure-9'}, op:{bn:'MV Adventure Lines',en:'MV Adventure Lines'}, dep:'8:00 PM', arr:'7:00 AM', dur:'11h 0m', deck:250, vip:3500, rating:4.1, reviews:0, col:'#f59e0b' },
];

const CABINS = [
  { l:'VIP Suite', bn:'ভিআইপি স্যুট', c:'#7c3aed', p:'৳ 5,500', e:'🛏️', desc:{bn:'টিভি · এসি · বাথ',en:'TV · AC · bath'} },
  { l:'Deluxe Cabin', bn:'ডিলাক্স', c:'#3b82f6', p:'৳ 3,500', e:'🚪', desc:{bn:'এসি · ডাবল বেড',en:'AC · double bed'} },
  { l:'Family Cabin', bn:'ফ্যামিলি', c:'#10b981', p:'৳ 2,200', e:'👪', desc:{bn:'৪ জন · ফ্যান',en:'For 4 · fan'} },
  { l:'Single Cabin', bn:'সিঙ্গেল', c:'#f59e0b', p:'৳ 1,200', e:'🛌', desc:{bn:'এক জন',en:'For 1'} },
  { l:'Deck Floor', bn:'ডেক', c:'#ef4444', p:'৳ 300', e:'🧳', desc:{bn:'খোলা ডেক',en:'Open deck'} },
];

export function LaunchPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (p=16): React.CSSProperties => ({ background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:16, padding:p });

  const lbl = (en: string, bn: string) => lang === 'bn' ? bn : en;

  const [fromTerminal, setFromTerminal] = useState(params?.from ?? '');
  const [toTerminal, setToTerminal] = useState(params?.to ?? params?.search ?? '');
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const filterTerminals = (q: string): Suggestion[] => {
    const lower = q.toLowerCase();
    const matched = q
      ? LAUNCH_TERMINALS.filter(t => t.en.toLowerCase().includes(lower) || t.bn.includes(q))
      : LAUNCH_TERMINALS;
    return matched.map(t => ({ id: t.id, label: lang === 'bn' ? t.bn : t.en }));
  };

  const fromSuggestions = useMemo(() => filterTerminals(fromTerminal), [fromTerminal, lang]);
  const toSuggestions = useMemo(() => filterTerminals(toTerminal), [toTerminal, lang]);

  // Filter real routes by selected terminals (match by name or id)
  const matchTerminalId = (q: string) => {
    if (!q) return null;
    const lower = q.toLowerCase();
    return LAUNCH_TERMINALS.find(t => t.en.toLowerCase().includes(lower) || t.bn.includes(q) || t.id === lower.replace(/\s/g,''))?.id ?? null;
  };
  const fromId = matchTerminalId(fromTerminal);
  const toId = matchTerminalId(toTerminal);
  const filteredLaunches = useMemo(() => {
    if (fromId && toId) return LAUNCH_ROUTES.filter(r => r.from === fromId && r.to === toId);
    if (fromId) return LAUNCH_ROUTES.filter(r => r.from === fromId);
    if (toId) return LAUNCH_ROUTES.filter(r => r.to === toId);
    // Default: Sadarghat → Barisal (most popular route)
    return LAUNCH_ROUTES.filter(r => r.from === 'sadarghat' && r.to === 'barisal');
  }, [fromId, toId]);
  const fromLabel = fromId ? LAUNCH_TERMINALS.find(t=>t.id===fromId)?.[lang==='bn'?'bn':'en'] ?? 'Sadarghat' : (lang==='bn'?'সদরঘাট':'Sadarghat');
  const toLabel = toId ? LAUNCH_TERMINALS.find(t=>t.id===toId)?.[lang==='bn'?'bn':'en'] ?? 'Barisal' : (lang==='bn'?'বরিশাল':'Barisal');

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'0 0 80px':'0 0 48px' }}>
        <ModeHero tk={tk} isMobile={isMobile} lang={lang} kind="launch"
          gradient="linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 50%, #fbbf24 100%)"
          title={T(lang,'নদীপথে যাত্রা · সদরঘাট থেকে সারাদেশে','River journeys · from Sadarghat to everywhere')}
          subtitle={T(lang,'৬০+ লঞ্চ রুট, রাতের কেবিন সার্ভিস, পদ্মা ও মেঘনা পার হয়ে — বরিশাল, ভোলা, পটুয়াখালী, চাঁদপুর।','60+ launch routes, overnight cabin service across Padma and Meghna — Barisal, Bhola, Patuakhali, Chandpur.')}
          stats={[{v:'60+',l:T(lang,'রুট','Routes')},{v:'14',l:T(lang,'ঘাট','Terminals')},{v:'৳ 300+',l:T(lang,'শুরু থেকে','From')},{v:'6–12h',l:T(lang,'যাত্রাকাল','Duration')}]}
        />

        <div style={{ padding:isMobile?'0 16px':'0 40px' }}>
          {/* Search */}
          <div style={{ ...card(16), marginBottom:18 }}>
            <div style={{ background:tk.inputBg, border:`1px solid ${tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#0ea5e9,#075985)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }} className="kj-anim-glow"><Icon.search s={16}/></div>
              <span style={{ flex:1, fontFamily:BEN, fontSize:14, color:tk.textFaint }}>{T(lang,'যেমন: সুন্দরবন-১২, কীর্তনখোলা-১০, পারাবত-১৮...','e.g. Sundarban-12, Kirtonkhola-10, Parabat-18...')}</span>
              <div style={{ display:'flex', gap:4 }}>
                {[{l:T(lang,'নাম','Name'),c:'#0ea5e9'},{l:T(lang,'নম্বর','Number'),c:'#0c4a6e'},{l:T(lang,'অপারেটর','Operator'),c:'#fbbf24'}].map((c,i)=>(
                  <span key={i} style={{ padding:'4px 8px', borderRadius:6, fontFamily:SANS, fontSize:10, fontWeight:700, background:`${c.c}22`, color:c.c }}>{c.l}</span>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr auto', gap:10 }}>
              <div ref={fromRef} style={{ background:tk.inputBg, border:`1px solid ${tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.primarySoft, color:tk.primaryDeep, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.pin s={14}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{lbl('From terminal','ঘাট')}</div>
                  <input
                    value={fromTerminal}
                    onChange={e => setFromTerminal(e.target.value)}
                    onFocus={() => setFromFocus(true)}
                    onBlur={() => setTimeout(() => setFromFocus(false), 150)}
                    placeholder={lbl('Sadarghat · Dhaka','সদরঘাট · ঢাকা')}
                    style={{ fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text, background:'transparent', border:'none', outline:'none', width:'100%', padding:0 }}
                  />
                </div>
              </div>
              <div ref={toRef} style={{ background:tk.inputBg, border:`1px solid ${tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.accentSoft, color:tk.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.flag s={14}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{lbl('To','গন্তব্য')}</div>
                  <input
                    value={toTerminal}
                    onChange={e => setToTerminal(e.target.value)}
                    onFocus={() => setToFocus(true)}
                    onBlur={() => setTimeout(() => setToFocus(false), 150)}
                    placeholder={lbl('Barisal','বরিশাল')}
                    style={{ fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text, background:'transparent', border:'none', outline:'none', width:'100%', padding:0 }}
                  />
                </div>
              </div>
              <button onClick={()=>{ earnCoins(5,'Launch search'); document.getElementById('launch-results')?.scrollIntoView({ behavior:'smooth', block:'start' }); }} style={{ background:'linear-gradient(135deg,#0ea5e9,#075985)', color:'#fff', border:0, borderRadius:14, padding:isMobile?'12px 16px':'0 22px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, minHeight:isMobile?48:'auto', boxShadow:'0 8px 22px -10px #0ea5e9' }}>
                <Icon.search s={16}/>{T(lang,'লঞ্চ খুঁজুন','Find launch')}
              </button>
            </div>
            {fromFocus && <SuggestionDropdown suggestions={fromSuggestions} onSelect={s => { setFromTerminal(s.label); setFromFocus(false); }} onDismiss={() => setFromFocus(false)} tk={tk} lang={lang} anchorRef={fromRef as React.RefObject<HTMLElement>}/>}
            {toFocus && <SuggestionDropdown suggestions={toSuggestions} onSelect={s => { setToTerminal(s.label); setToFocus(false); }} onDismiss={() => setToFocus(false)} tk={tk} lang={lang} anchorRef={toRef as React.RefObject<HTMLElement>}/>}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.5fr 1fr', gap:18 }}>
            {/* Launches list */}
            <div id="launch-results">
              <SectionHeader tk={tk} lang={lang} title={T(lang,`আজকের লঞ্চ · ${fromLabel} → ${toLabel}`,`Tonight's launches · ${fromLabel} → ${toLabel}`)} action={T(lang,'সব দেখুন','All')}/>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {filteredLaunches.length === 0
                  ? <div style={{ fontFamily:BEN, fontSize:13, color:tk.textFaint, padding:'16px 0' }}>{T(lang,'এই রুটে কোনো লঞ্চ পাওয়া যায়নি।','No launches found for this route.')}</div>
                  : filteredLaunches.map((l,i)=>(
                  <div key={l.id} onClick={()=>onNav('vehicle', { kind:'launch', id:l.id, name:l.name.en, nameBn:l.name.bn, from: fromLabel, to: toLabel, dep:l.dep, arr:l.arr, dur:l.dur, deck:String(l.deck), cabin:String(l.cabin), vip:String(l.vip), operator:l.operator.en, operatorBn:l.operator.bn, rating:String(l.rating), type:l.type, col:l.col })} style={{ ...card(14), position:'relative', overflow:'hidden', cursor:'pointer' }}>
                    {l.overnight && <div style={{ position:'absolute', top:0, right:0, background:'linear-gradient(90deg,#7c3aed,#a855f7)', color:'#fff', padding:'3px 10px', borderRadius:'0 16px 0 10px', fontFamily:SANS, fontWeight:800, fontSize:9, letterSpacing:1 }}>🌙 OVERNIGHT</div>}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <div style={{ width:56, height:44, borderRadius:10, background:`linear-gradient(135deg,${l.col},${l.col}cc)`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>⛴️</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,l.name.bn,l.name.en)}</div>
                        <div style={{ fontFamily:BEN, fontSize:11, color:tk.textDim, marginTop:2 }}>{T(lang,l.operator.bn,l.operator.en)}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                          <Stars value={l.rating} size={10}/>
                          <span style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color:tk.text }}>{l.rating}</span>
                          <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>{l.type}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderTop:`1px dashed ${tk.line}`, borderBottom:`1px dashed ${tk.line}`, marginBottom:10 }}>
                      <div><div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:tk.text }}>{l.dep}</div><div style={{ fontFamily:BEN, fontSize:10, color:tk.textFaint }}>{fromLabel}</div></div>
                      <div style={{ flex:1, height:1, background:tk.line, position:'relative' }}>
                        <span style={{ position:'absolute', left:'50%', top:-8, transform:'translateX(-50%)', background:tk.panel, padding:'0 6px', fontFamily:SANS, fontSize:10, fontWeight:700, color:tk.textFaint, whiteSpace:'nowrap' }}>{l.dur} · ⛴</span>
                      </div>
                      <div style={{ textAlign:'right' }}><div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:tk.text }}>{l.arr}</div><div style={{ fontFamily:BEN, fontSize:10, color:tk.textFaint }}>{toLabel}</div></div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <div style={{ flex:1, background:tk.panelMuted, borderRadius:10, padding:'8px 10px' }}>
                        <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, color:tk.textFaint, letterSpacing:1, textTransform:'uppercase' }}>{T(lang,'ডেক','Deck')}</div>
                        <div style={{ fontFamily:SANS, fontWeight:800, fontSize:14, color:tk.text }}>৳ {l.deck}</div>
                      </div>
                      <div style={{ flex:1, background:`${l.col}22`, borderRadius:10, padding:'8px 10px' }}>
                        <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, color:l.col, letterSpacing:1, textTransform:'uppercase' }}>VIP {T(lang,'কেবিন','Cabin')}</div>
                        <div style={{ fontFamily:SANS, fontWeight:800, fontSize:14, color:l.col }}>৳ {l.vip}</div>
                      </div>
                      <button style={{ background:l.col, color:'#fff', border:0, borderRadius:10, padding:'8px 14px', fontFamily:SANS, fontWeight:700, fontSize:12, cursor:'pointer' }}>{T(lang,'বিস্তারিত','Details')} →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={card(16)}>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:10 }}>{T(lang,'কেবিন ও ভাড়া','Cabin classes')}</div>
                {CABINS.map((c,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderTop:i?`1px dashed ${tk.line}`:'' }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:`${c.c}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{c.e}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:BEN, fontWeight:700, fontSize:13, color:tk.text }}>{T(lang,c.bn,c.l)}</div>
                      <div style={{ fontFamily:BEN, fontSize:11, color:tk.textFaint }}>{T(lang,c.desc.bn,c.desc.en)}</div>
                    </div>
                    <div style={{ fontFamily:SANS, fontWeight:800, fontSize:14, color:c.c }}>{c.p}</div>
                  </div>
                ))}
              </div>

              <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'mid-rect'}/>
            </div>
          </div>

          <div style={{ marginTop:18 }}>
            <SectionHeader tk={tk} lang={lang} title={T(lang,'🌊 নিরাপত্তা ও পরামর্শ','🌊 Safety & travel tips')}/>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:10 }}>
              {[{ic:'🧥',bn:'লাইফ জ্যাকেট পরিধান করুন',en:'Wear a life jacket'},{ic:'🌦',bn:'আবহাওয়া পূর্বাভাস দেখুন',en:'Check weather forecast'},{ic:'📞',bn:'হটলাইন: ১৬২২৩',en:'Hotline: 16223'}].map((s,i)=>(
                <div key={i} style={{ ...card(14), display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:28 }}>{s.ic}</span>
                  <span style={{ fontFamily:BEN, fontWeight:600, fontSize:13, color:tk.text, flex:1 }}>{T(lang,s.bn,s.en)}</span>
                </div>
              ))}
            </div>
          </div>

          <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
        </div>
      </div>
    </PageShell>
  );
}
