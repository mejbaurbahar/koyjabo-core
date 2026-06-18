import React, { useState, useRef, useMemo } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { SectionHeader } from '../components/SectionHeader';
import { Icon } from '../components/Icons';
import { ModeHero } from '../components/ModeHero';
import { Stars } from '../components/Stars';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const TERMINALS = [
  { id:'sadarghat', en:'Sadarghat', bn:'সদরঘাট' },
  { id:'barisal', en:'Barisal Ghat', bn:'বরিশাল ঘাট' },
  { id:'khulna', en:'Khulna Ghat', bn:'খুলনা ঘাট' },
  { id:'patuakhali', en:'Patuakhali Ghat', bn:'পটুয়াখালী ঘাট' },
  { id:'bhola', en:'Bhola Ghat', bn:'ভোলা ঘাট' },
  { id:'chandpur', en:'Chandpur Ghat', bn:'চাঁদপুর ঘাট' },
  { id:'narayanganj', en:'Narayanganj Terminal', bn:'নারায়ণগঞ্জ টার্মিনাল' },
  { id:'madaripur', en:'Madaripur Ghat', bn:'মাদারীপুর ঘাট' },
  { id:'hatiya', en:'Hatiya Ghat', bn:'হাতিয়া ঘাট' },
  { id:'borguna', en:'Borguna Ghat', bn:'বরগুনা ঘাট' },
];

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

const BIWTA_LINKS = [
  { en:'Official BIWTA portal', bn:'বিআইডব্লিউটিএ অফিসিয়াল পোর্টাল', href:'https://biwta.gov.bd/' },
  { en:'Notices', bn:'নোটিশ', href:'https://biwta.gov.bd/pages/notices' },
  { en:'Waterway information', bn:'নৌ-পথ সংক্রান্ত তথ্য', href:'https://biwta.gov.bd/pages/static-pages/6922e036933eb65569e26049' },
  { en:'Port and transport', bn:'বন্দর ও পরিবহন', href:'https://biwta.gov.bd/pages/static-pages/6922dce3933eb65569e12937' },
  { en:'Safety and traffic', bn:'নৌ-নিরাপত্তা ও ট্রাফিক ব্যবস্থাপনা', href:'https://biwta.gov.bd/pages/static-pages/6922db63933eb65569e09dde' },
  { en:'Realtime tidal data', bn:'টাইডাল ডাটা (রিয়েল টাইম)', href:'http://biwta.port-log.net/live/display.php' },
];

const BIWTA_NOTES = [
  { en:'BIWTA is the official authority for inland waterway services, ports, traffic and safety information.', bn:'অভ্যন্তরীণ নৌপথ, বন্দর, ট্রাফিক ও নিরাপত্তা তথ্যের অফিসিয়াল কর্তৃপক্ষ বিআইডব্লিউটিএ।' },
  { en:'Before launch travel, check BIWTA notices and realtime tidal data when weather or river conditions may affect trips.', bn:'লঞ্চ যাত্রার আগে আবহাওয়া বা নদীর অবস্থার প্রভাব থাকলে বিআইডব্লিউটিএ নোটিশ ও রিয়েলটাইম টাইডাল ডাটা দেখুন।' },
  { en:'For emergencies, BIWTA links Bangladesh public emergency services such as 999, 333 and Fire Service 102.', bn:'জরুরি প্রয়োজনে বিআইডব্লিউটিএ বাংলাদেশ সরকারি জরুরি সেবা ৯৯৯, ৩৩৩ এবং ফায়ার সার্ভিস ১০২ যুক্ত করেছে।' },
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
      ? TERMINALS.filter(t => t.en.toLowerCase().includes(lower) || t.bn.includes(q))
      : TERMINALS;
    return matched.map(t => ({ id: t.id, label: lang === 'bn' ? t.bn : t.en }));
  };

  const fromSuggestions = useMemo(() => filterTerminals(fromTerminal), [fromTerminal, lang]);
  const toSuggestions = useMemo(() => filterTerminals(toTerminal), [toTerminal, lang]);

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
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 0.8fr auto', gap:10 }}>
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
              <div style={{ background:tk.inputBg, border:`1px solid ${tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.amberSoft, color:tk.amber, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.clock s={14}/></div>
                <div><div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'তারিখ','Date')}</div><div style={{ fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text }}>15 May</div></div>
              </div>
              <button onClick={()=>onNav('results')} style={{ background:'linear-gradient(135deg,#0ea5e9,#075985)', color:'#fff', border:0, borderRadius:14, padding:isMobile?'12px 16px':'0 22px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, minHeight:isMobile?48:'auto', boxShadow:'0 8px 22px -10px #0ea5e9' }}>
                <Icon.search s={16}/>{T(lang,'লঞ্চ খুঁজুন','Find launch')}
              </button>
            </div>
            {fromFocus && <SuggestionDropdown suggestions={fromSuggestions} onSelect={s => { setFromTerminal(s.label); setFromFocus(false); }} onDismiss={() => setFromFocus(false)} tk={tk} lang={lang} anchorRef={fromRef as React.RefObject<HTMLElement>}/>}
            {toFocus && <SuggestionDropdown suggestions={toSuggestions} onSelect={s => { setToTerminal(s.label); setToFocus(false); }} onDismiss={() => setToFocus(false)} tk={tk} lang={lang} anchorRef={toRef as React.RefObject<HTMLElement>}/>}
          </div>

          <div style={{ ...card(16), marginBottom:18 }}>
            <SectionHeader tk={tk} lang={lang} title={T(lang,'বিআইডব্লিউটিএ অফিসিয়াল তথ্য','BIWTA official information')}/>
            <div style={{ fontFamily:SANS, fontSize:11, fontWeight:700, color:tk.textFaint, margin:'4px 0 12px' }}>{T(lang,'সূত্র: biwta.gov.bd','Source: biwta.gov.bd')}</div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.05fr 0.95fr', gap:14 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {BIWTA_NOTES.map((note,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', background:tk.panelMuted, border:`1px solid ${tk.line}`, borderRadius:12, padding:12 }}>
                    <span style={{ width:24, height:24, flexShrink:0, borderRadius:999, display:'inline-flex', alignItems:'center', justifyContent:'center', background:'#0ea5e922', color:'#0ea5e9', fontFamily:SANS, fontWeight:900, fontSize:12 }}>{i+1}</span>
                    <span style={{ fontFamily:lang==='bn'?BEN:SANS, fontSize:13, color:tk.textDim, lineHeight:1.6 }}>{T(lang,note.bn,note.en)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:8, alignContent:'start' }}>
                {BIWTA_LINKS.map(link=>(
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer" style={{ textDecoration:'none', color:tk.text, background:tk.inputBg, border:`1px solid ${tk.line}`, borderRadius:12, padding:'10px 12px', fontFamily:lang==='bn'?BEN:SANS, fontWeight:800, fontSize:12, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                    <span>{T(lang,link.bn,link.en)}</span>
                    <span style={{ color:'#0ea5e9' }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.5fr 1fr', gap:18 }}>
            {/* Launches list */}
            <div>
              <SectionHeader tk={tk} lang={lang} title={T(lang,'আজকের লঞ্চ · সদরঘাট → বরিশাল','Tonight\'s launches · Sadarghat → Barisal')} action={T(lang,'সব দেখুন','All')}/>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {LAUNCHES.map((l,i)=>(
                  <div key={i} onClick={()=>onNav('vehicle')} style={{ ...card(14), position:'relative', overflow:'hidden', cursor:'pointer' }}>
                    {l.premium && <div style={{ position:'absolute', top:0, right:0, background:'linear-gradient(90deg,#f59e0b,#fbbf24)', color:'#04130d', padding:'3px 10px', borderRadius:'0 16px 0 10px', fontFamily:SANS, fontWeight:800, fontSize:9, letterSpacing:1 }}>★ PREMIUM</div>}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <div style={{ width:56, height:44, borderRadius:10, background:`linear-gradient(135deg,${l.col},${l.col}cc)`, flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>⛴️</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,l.n.bn,l.n.en)}</div>
                        <div style={{ fontFamily:BEN, fontSize:11, color:tk.textDim, marginTop:2 }}>{T(lang,l.op.bn,l.op.en)}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                          <Stars value={l.rating} size={10}/>
                          <span style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color:tk.text }}>{l.rating}</span>
                          <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>({l.reviews})</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderTop:`1px dashed ${tk.line}`, borderBottom:`1px dashed ${tk.line}`, marginBottom:10 }}>
                      <div><div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:tk.text }}>{l.dep}</div><div style={{ fontFamily:BEN, fontSize:10, color:tk.textFaint }}>{T(lang,'সদরঘাট','Sadarghat')}</div></div>
                      <div style={{ flex:1, height:1, background:tk.line, position:'relative' }}>
                        <span style={{ position:'absolute', left:'50%', top:-8, transform:'translateX(-50%)', background:tk.panel, padding:'0 6px', fontFamily:SANS, fontSize:10, fontWeight:700, color:tk.textFaint, whiteSpace:'nowrap' }}>{l.dur} · ⛴</span>
                      </div>
                      <div style={{ textAlign:'right' }}><div style={{ fontFamily:SANS, fontWeight:700, fontSize:14, color:tk.text }}>{l.arr}</div><div style={{ fontFamily:BEN, fontSize:10, color:tk.textFaint }}>{T(lang,'বরিশাল','Barisal')}</div></div>
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
