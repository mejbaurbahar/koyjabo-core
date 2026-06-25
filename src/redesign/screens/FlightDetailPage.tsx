import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Stars } from '../components/Stars';
import { isAdFree } from '../utils/koyCoinService';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const AIRLINES: Record<string, {
  name:{bn:string;en:string}; dep:string; arr:string; dur:string; stop:string; fare:string; seats:number;
  col:[string,string]; rating:number; reviews:number; aircraft:string;
  website:string; phone:string; baggage:{bn:string;en:string};
  amenities:{e:string;bn:string;en:string}[];
  cabins:{cls:{bn:string;en:string};fare:string;col:string}[];
  note?:{bn:string;en:string};
}> = {
  BG: {
    name:{bn:'বিমান বাংলাদেশ',en:'Biman Bangladesh'},
    dep:'07:15',arr:'08:15',dur:'1h 0m',stop:'Nonstop',fare:'4,499',seats:9,
    col:['#006a4e','#10b981'],rating:4.2,reviews:1240,
    aircraft:'Boeing 737-800',
    website:'biman.com.bd',phone:'13600',
    baggage:{bn:'20kg চেকড + 7kg কেবিন',en:'20kg checked + 7kg cabin'},
    amenities:[{e:'🍽️',bn:'খাবার',en:'Meal'},{e:'❄️',bn:'AC',en:'AC'},{e:'🔌',bn:'USB চার্জার',en:'USB charger'},{e:'🎬',bn:'বিনোদন',en:'IFE'},{e:'🛟',bn:'লাইফ জ্যাকেট',en:'Life jacket'}],
    cabins:[{cls:{bn:'বিজনেস',en:'Business'},fare:'12,500',col:'#7c3aed'},{cls:{bn:'ইকোনমি',en:'Economy'},fare:'4,499',col:'#10b981'}],
  },
  BS: {
    name:{bn:'ইউএস-বাংলা',en:'US-Bangla'},
    dep:'09:40',arr:'10:45',dur:'1h 5m',stop:'Nonstop',fare:'4,199',seats:14,
    col:['#0c4a6e','#0ea5e9'],rating:4.5,reviews:2310,
    aircraft:'ATR 72-600',
    website:'us-bangla.com',phone:'09612-333111',
    baggage:{bn:'20kg চেকড + 7kg কেবিন',en:'20kg checked + 7kg cabin'},
    amenities:[{e:'🍿',bn:'স্ন্যাকস',en:'Snacks'},{e:'❄️',bn:'AC',en:'AC'},{e:'🔌',bn:'USB চার্জার',en:'USB charger'},{e:'📶',bn:'WiFi',en:'WiFi'},{e:'🛟',bn:'লাইফ জ্যাকেট',en:'Life jacket'}],
    cabins:[{cls:{bn:'বিজনেস',en:'Business'},fare:'11,500',col:'#7c3aed'},{cls:{bn:'ইকোনমি প্লাস',en:'Economy Plus'},fare:'6,500',col:'#0ea5e9'},{cls:{bn:'ইকোনমি',en:'Economy'},fare:'4,199',col:'#10b981'}],
    note:{bn:'সর্বোচ্চ রেটিং · সবচেয়ে বেশি যাত্রী বেছে নেন',en:'Highest rated · most passengers choose'},
  },
  VQ: {
    name:{bn:'নোভোএয়ার',en:'NOVOAIR'},
    dep:'12:20',arr:'13:25',dur:'1h 5m',stop:'Nonstop',fare:'4,650',seats:6,
    col:['#b45309','#f59e0b'],rating:4.3,reviews:980,
    aircraft:'ATR 72-500',
    website:'flynovoair.com',phone:'01777-700700',
    baggage:{bn:'20kg চেকড + 5kg কেবিন',en:'20kg checked + 5kg cabin'},
    amenities:[{e:'🍿',bn:'স্ন্যাকস',en:'Snacks'},{e:'❄️',bn:'AC',en:'AC'},{e:'🔌',bn:'USB চার্জার',en:'USB charger'},{e:'🛟',bn:'লাইফ জ্যাকেট',en:'Life jacket'}],
    cabins:[{cls:{bn:'বিজনেস',en:'Business'},fare:'12,000',col:'#7c3aed'},{cls:{bn:'ইকোনমি',en:'Economy'},fare:'4,650',col:'#f59e0b'}],
  },
  '2A': {
    name:{bn:'এয়ার আস্ট্রা',en:'Air Astra'},
    dep:'16:05',arr:'17:10',dur:'1h 5m',stop:'Nonstop',fare:'3,990',seats:3,
    col:['#7c3aed','#a855f7'],rating:4.1,reviews:410,
    aircraft:'ATR 72-600',
    website:'airastra.com',phone:'16578',
    baggage:{bn:'15kg চেকড + 5kg কেবিন',en:'15kg checked + 5kg cabin'},
    amenities:[{e:'🍿',bn:'স্ন্যাকস',en:'Snacks'},{e:'❄️',bn:'AC',en:'AC'},{e:'🛟',bn:'লাইফ জ্যাকেট',en:'Life jacket'}],
    cabins:[{cls:{bn:'সেভার',en:'Saver'},fare:'3,990',col:'#a855f7'},{cls:{bn:'ইকোনমি',en:'Economy'},fare:'4,500',col:'#7c3aed'}],
    note:{bn:'সবচেয়ে সস্তা ভাড়া · নতুন এয়ারলাইন',en:'Cheapest fare · newest airline'},
  },
};

type TabKey = 'info' | 'cabins' | 'amenities' | 'book';

export function FlightDetailPage(props: Props) {
  const { theme, device, lang, params, onNav } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const code = params?.code ?? 'BS';
  const a = AIRLINES[code] ?? AIRLINES['BS'];

  // Use passed flight data if available, fall back to airline defaults
  const flightNo = params?.flightNo || `${code}001`;
  const depTime = params?.dep || a.dep;
  const arrTime = params?.arr || a.arr;
  const durText = params?.dur || a.dur;
  const fromCode = params?.fromIATA || 'DAC';
  const toCode = params?.toIATA || 'CXB';
  const fromName = params?.fromName || 'Dhaka (Shahjalal)';
  const toName = params?.toName || "Cox's Bazar";
  const flightFare = params?.fare ? parseInt(params.fare).toLocaleString() : a.fare;
  const adFree = isAdFree();

  const [tab, setTab] = useState<TabKey>('info');
  const card = (p=16): React.CSSProperties => ({ background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:16, padding:p });

  const TABS: {key:TabKey; bn:string; en:string}[] = [
    {key:'info',bn:'ফ্লাইট তথ্য',en:'Flight info'},
    {key:'cabins',bn:'কেবিন ক্লাস',en:'Cabin classes'},
    {key:'amenities',bn:'সুবিধা',en:'Amenities'},
    {key:'book',bn:'টিকিট কিনুন',en:'Book ticket'},
  ];

  const heroGrad = `linear-gradient(135deg,${a.col[0]},${a.col[1]})`;

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'0 0 80px':'0 0 48px' }}>
        {/* Hero */}
        <div style={{ background:heroGrad, padding:isMobile?'24px 20px':'32px 48px', color:'#fff' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SANS, fontWeight:800, fontSize:18 }}>{code}</div>
            <div>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:isMobile?20:26 }}>{T(lang,a.name.bn,a.name.en)}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                <Stars value={a.rating} size={11}/>
                <span style={{ fontFamily:SANS, fontWeight:700, fontSize:12 }}>{a.rating}</span>
                <span style={{ fontFamily:SANS, fontSize:11, opacity:0.75 }}>({a.reviews} {T(lang,'রিভিউ','reviews')})</span>
              </div>
            </div>
          </div>

          {/* Route timeline */}
          <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontFamily:SANS, fontWeight:800, fontSize:22 }}>{depTime}</div>
              <div style={{ fontFamily:SANS, fontSize:12, opacity:0.9, fontWeight:700 }}>{fromCode}</div>
              <div style={{ fontFamily:SANS, fontSize:11, opacity:0.7 }}>{fromName.split('(')[0].trim()}</div>
            </div>
            <div style={{ flexShrink:0, textAlign:'center' }}>
              <div style={{ height:2, background:'rgba(255,255,255,0.5)', borderRadius:999, margin:'8px 0', width:40 }}/>
              <div style={{ fontFamily:SANS, fontSize:11, opacity:0.9, fontWeight:700 }}>{durText} · {a.stop}</div>
              <div style={{ fontSize:16, marginTop:2 }}>✈️</div>
            </div>
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ fontFamily:SANS, fontWeight:800, fontSize:22 }}>{arrTime}</div>
              <div style={{ fontFamily:SANS, fontSize:12, opacity:0.9, fontWeight:700 }}>{toCode}</div>
              <div style={{ fontFamily:SANS, fontSize:11, opacity:0.7 }}>{toName.split('(')[0].trim()}</div>
            </div>
          </div>

          {a.note && (
            <div style={{ marginTop:10, fontFamily:BEN, fontSize:12, background:'rgba(255,255,255,0.18)', borderRadius:999, padding:'5px 14px', display:'inline-block' }}>
              ★ {T(lang,a.note.bn,a.note.en)}
            </div>
          )}
        </div>

        <div style={{ padding:isMobile?'16px 16px':'24px 48px' }}>
          {/* Fare badge */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div>
              <span style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint }}>{T(lang,'শুরু থেকে','Starts from')} </span>
              <span style={{ fontFamily:SANS, fontWeight:800, fontSize:26, color:tk.text }}>৳ {flightFare}</span>
              <div style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint }}>{T(lang,'অফিসিয়াল সাইটে যাচাই করুন','verify on official site')}</div>
            </div>
            <div style={{ background:a.seats <= 5 ? '#ff2a6d22' : tk.primarySoft, border:`1px solid ${a.seats <= 5 ? '#ff2a6d' : tk.primary}`, borderRadius:999, padding:'6px 14px', fontFamily:SANS, fontWeight:700, fontSize:12, color:a.seats <= 5 ? '#ff2a6d' : tk.primary }}>
              {a.seats} {T(lang,'আসন বাকি','seats left')}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:6, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
            {TABS.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)} style={{ ...chipBtn(tk), whiteSpace:'nowrap', background:tab===t.key?tk.primary:tk.panelMuted, color:tab===t.key?tk.primaryInk:tk.text, borderColor:tab===t.key?tk.primary:tk.line, fontWeight:tab===t.key?700:500 }}>
                {T(lang,t.bn,t.en)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'info' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={card()}>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:12 }}>{T(lang,'ফ্লাইট বিস্তারিত','Flight details')}</div>
                {[
                  {l:T(lang,'ফ্লাইট নম্বর','Flight No'), v:flightNo},
                  {l:T(lang,'রুট','Route'), v:`${fromCode} → ${toCode} · ${fromName.split('(')[0].trim()} → ${toName.split('(')[0].trim()}`},
                  {l:T(lang,'ছাড়বে','Departs'), v:`${depTime} · ${fromName}`},
                  {l:T(lang,'পৌঁছাবে','Arrives'), v:`${arrTime} · ${toName}`},
                  {l:T(lang,'সময়','Duration'), v:`${durText} · ${T(lang,a.stop,a.stop)}`},
                  {l:T(lang,'বিমান','Aircraft'), v:a.aircraft},
                  {l:T(lang,'লাগেজ','Baggage'), v:T(lang,a.baggage.bn,a.baggage.en)},
                ].map((row,i)=>(
                  <div key={i} style={{ display:'flex', gap:12, padding:'9px 0', borderTop:i?`1px dashed ${tk.line}`:'' }}>
                    <div style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint, minWidth:90 }}>{row.l}</div>
                    <div style={{ fontFamily:BEN, fontSize:13, color:tk.text, fontWeight:600 }}>{row.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'cabins' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {a.cabins.map((c,i)=>(
                <div key={i} style={{ ...card(14), display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:`${c.col}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>💺</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,c.cls.bn,c.cls.en)}</div>
                  </div>
                  <div style={{ fontFamily:SANS, fontWeight:800, fontSize:16, color:c.col }}>৳ {c.fare}</div>
                </div>
              ))}
              <div style={{ ...card(12), background:tk.amberSoft, borderColor:tk.amber }}>
                <div style={{ fontFamily:BEN, fontSize:12, color:tk.amber }}>ℹ️ {T(lang,'চূড়ান্ত ভাড়া এয়ারলাইনের অফিসিয়াল সাইটে যাচাই করুন। ভাড়া পরিবর্তন হতে পারে।','Final fares vary — always verify on the official airline website.')}</div>
              </div>
            </div>
          )}

          {tab === 'amenities' && (
            <div style={card()}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:12 }}>{T(lang,'বিমানের সুবিধাসমূহ','In-flight amenities')}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))', gap:10 }}>
                {a.amenities.map((am,i)=>(
                  <div key={i} style={{ background:tk.panelMuted, border:`1px solid ${tk.line}`, borderRadius:12, padding:'12px 10px', textAlign:'center' }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{am.e}</div>
                    <div style={{ fontFamily:BEN, fontSize:12, color:tk.text, fontWeight:600 }}>{T(lang,am.bn,am.en)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'book' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={card()}>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:12 }}>{T(lang,'টিকিট কোথায় পাবেন','Where to buy tickets')}</div>
                {[
                  {e:'🌐', l:T(lang,'অফিসিয়াল ওয়েবসাইট','Official website'), v:a.website},
                  {e:'📞', l:T(lang,'হেল্পলাইন','Helpline'), v:a.phone},
                  {e:'🏢', l:T(lang,'বিমানবন্দর কাউন্টার','Airport counter'), v:T(lang,'শাহজালাল বিমানবন্দর, ঢাকা','Shahjalal Airport, Dhaka')},
                ].map((row,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderTop:i?`1px dashed ${tk.line}`:'' }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:tk.primarySoft, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{row.e}</div>
                    <div>
                      <div style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint }}>{row.l}</div>
                      <div style={{ fontFamily:BEN, fontWeight:600, fontSize:13, color:tk.text }}>{row.v}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>onNav('flights-hub')} style={{ background:heroGrad, color:'#fff', border:0, borderRadius:14, padding:'14px 20px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                ✈️ {T(lang,'সব ফ্লাইট দেখুন','View all flights')}
              </button>
            </div>
          )}

          {!adFree && <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'mid-rect'} />}
          {!adFree && (
            <div style={{ margin: '20px 0' }}>
              <AdSlot tk={tk} lang={lang} kind="multiplex" />
            </div>
          )}
          {!adFree && <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'} />}
        </div>
      </div>
    </PageShell>
  );
}
