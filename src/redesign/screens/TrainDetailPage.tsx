import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Pill } from '../components/Pill';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const trainStops = [
  { bn:'ঢাকা কমলাপুর',en:'Dhaka Kamalapur',t:'10:00 PM',boarding:true },
  { bn:'নরসিংদী',en:'Narsingdi',t:'11:15 PM' },
  { bn:'কুমিল্লা',en:'Comilla',t:'12:30 AM' },
  { bn:'ফেনী',en:'Feni',t:'2:00 AM' },
  { bn:'চট্টগ্রাম',en:'Chittagong',t:'3:30 AM',rest:true },
  { bn:'কক্সবাজার',en:"Cox's Bazar",t:'7:00 AM',destination:true },
];

export function TrainDetailPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const coaches = [
    { l:'AC Berth', bn:'এসি বার্থ', c:'#7c3aed', f:'৳1,200', n:'36 berths' },
    { l:'Snigdha', bn:'স্নিগ্ধা', c:'#3b82f6', f:'৳800', n:'44 seats' },
    { l:'AC Chair', bn:'এসি চেয়ার', c:'#10b981', f:'৳600', n:'72 seats' },
    { l:'Shovon Chair', bn:'শোভন চেয়ার', c:'#f59e0b', f:'৳350', n:'100 seats' },
    { l:'Shovon', bn:'শোভন', c:'#6b7280', f:'৳200', n:'150 seats' },
  ];

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:1000, margin:'0 auto' }}>
        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#1e1b4b,#4338ca,#6d28d9)', borderRadius:22, padding:isMobile?18:24, marginBottom:20, color:'#fff' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
            <span style={{ fontSize:28 }}>🚆</span>
            <div>
              <div style={{ fontFamily:SANS,fontWeight:700,fontSize:12,opacity:0.8,letterSpacing:1 }}>BANGLADESH RAILWAY · #801/802</div>
              <h2 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?20:26,margin:0 }}>{T(lang,'কক্সবাজার এক্সপ্রেস','Cox\'s Bazar Express')}</h2>
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:14,flexWrap:'wrap' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:SANS,fontWeight:800,fontSize:18 }}>{T(lang,'ঢাকা','DHAKA')}</div>
              <div style={{ fontFamily:SANS,fontSize:12,opacity:0.8 }}>10:00 PM</div>
            </div>
            <div style={{ flex:1,textAlign:'center' }}>
              <div style={{ fontFamily:SANS,fontSize:12,opacity:0.7 }}>9h · {T(lang,'৩৯০ কিমি','390 km')}</div>
              <div style={{ height:2,background:'rgba(255,255,255,0.35)',borderRadius:999,margin:'6px 0' }}/>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:SANS,fontWeight:800,fontSize:18 }}>{T(lang,'কক্সবাজার',"COX'S BAZAR")}</div>
              <div style={{ fontFamily:SANS,fontSize:12,opacity:0.8 }}>7:00 AM</div>
            </div>
          </div>
          <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
            {[T(lang,'৩৯০ কিমি','390 km'),T(lang,'৬ স্টেশন','6 stations'),T(lang,'এসি বার্থ ৳১২০০','AC Berth ৳1,200'),T(lang,'আন্তনগর','Intercity Express')].map((s,i)=>(
              <span key={i} style={{ background:'rgba(255,255,255,0.15)',padding:'5px 10px',borderRadius:999,fontFamily:SANS,fontSize:12,fontWeight:600 }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr',gap:20 }}>
          <div>
            {/* Coach classes */}
            <div style={{ ...card(18),marginBottom:16 }}>
              <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:14 }}>{T(lang,'কোচ ক্লাস ও ভাড়া','Coach classes')}</div>
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                {coaches.map((c,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:12,background:tk.panelMuted,border:`1px solid ${tk.line}` }}>
                    <div style={{ width:12,height:12,borderRadius:3,background:c.c }}/>
                    <div style={{ flex:1 }}>
                      <span style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text }}>{T(lang,c.bn,c.l)}</span>
                      <span style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,marginLeft:8 }}>{c.n}</span>
                    </div>
                    <span style={{ fontFamily:SANS,fontWeight:800,fontSize:15,color:c.c }}>{c.f}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12,padding:10,background:tk.amberSoft,borderRadius:10,fontFamily:BEN,fontSize:12,color:tk.amber }}>
                ℹ️ {T(lang,'আসন দেখানো হচ্ছে তথ্যের জন্য · eticket.railway.gov.bd বা কাউন্টারে কিনুন','Seats shown for info · buy at eticket.railway.gov.bd or counter')}
              </div>
            </div>

            {/* Stops */}
            <div style={{ ...card(18),marginBottom:16 }}>
              <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:14 }}>{T(lang,'স্টেশনসমূহ','Stations')}</div>
              {trainStops.map((s,i)=>(
                <div key={i} style={{ display:'flex',gap:14,paddingBottom:i<trainStops.length-1?14:0,position:'relative' }}>
                  <div style={{ width:20,flexShrink:0,display:'flex',justifyContent:'center',position:'relative' }}>
                    {i<trainStops.length-1 && <div style={{ position:'absolute',top:16,bottom:-4,width:2,background:s.rest?tk.amber:tk.primary,opacity:0.4 }}/>}
                    <div style={{ width:s.boarding||s.destination?18:12,height:s.boarding||s.destination?18:12,borderRadius:999,marginTop:4,background:s.boarding?tk.primary:s.destination?tk.accent:s.rest?tk.amber:tk.panel,border:`2px solid ${s.boarding?tk.primary:s.destination?tk.accent:s.rest?tk.amber:tk.primary}` }}/>
                  </div>
                  <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                      <span style={{ fontFamily:BEN,fontWeight:s.boarding||s.destination?700:500,fontSize:14,color:tk.text }}>{T(lang,s.bn,s.en)}</span>
                      {s.boarding && <Pill tk={tk} tone="primary">{T(lang,'বোর্ডিং','Boarding')}</Pill>}
                      {s.destination && <Pill tk={tk} tone="accent">{T(lang,'গন্তব্য','Destination')}</Pill>}
                      {s.rest && <Pill tk={tk} tone="amber">{T(lang,'বিরতি','Rest')}</Pill>}
                    </div>
                    <span style={{ fontFamily:SANS,fontSize:12,color:tk.textFaint,flexShrink:0 }}>{s.t}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div style={{ ...card(18),marginBottom:16 }}>
              <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:12 }}>{T(lang,'সুবিধাসমূহ','Amenities')}</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8 }}>
                {[{e:'❄️',l:'AC'},{e:'🍽️',l:'Pantry'},{e:'🔌',l:'Charging'},{e:'🚻',l:'Toilet'},{e:'🛏️',l:'Bedding'},{e:'📶',l:'WiFi'},{e:'♿',l:'Wheelchair'},{e:'🕌',l:'Prayer room'}].map((a,i)=>(
                  <div key={i} style={{ background:tk.panelMuted,borderRadius:12,padding:10,display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
                    <span style={{ fontSize:20 }}>{a.e}</span>
                    <span style={{ fontFamily:SANS,fontSize:10,color:tk.textDim,textAlign:'center' }}>{a.l}</span>
                  </div>
                ))}
              </div>
            </div>

            <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
          </div>

          {!isMobile && (
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div style={{ ...card(16),background:'linear-gradient(135deg,#1e1b4b,#4338ca)',color:'#fff',border:'none' }}>
                <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,marginBottom:12 }}>{T(lang,'টিকেট কোথায় পাবেন','Where to buy ticket')}</div>
                {[{icon:'🌐',l:'eticket.railway.gov.bd'},{icon:'🏢',l:T(lang,'কমলাপুর রেলস্টেশন','Kamalapur Station')},{icon:'📞',l:'131'}].map((d,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.12)' }}>
                    <span style={{ fontSize:16 }}>{d.icon}</span>
                    <span style={{ fontFamily:BEN,fontSize:13,opacity:0.9 }}>{d.l}</span>
                  </div>
                ))}
                <p style={{ fontFamily:BEN,fontSize:11,opacity:0.7,marginTop:10 }}>ℹ️ {T(lang,'কই যাবো টিকেট বিক্রি করে না — শুধু তথ্য।','KoyJabo shows info only — no sales.')}</p>
              </div>
              <AdSlot tk={tk} lang={lang} kind="mid-rect"/>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
