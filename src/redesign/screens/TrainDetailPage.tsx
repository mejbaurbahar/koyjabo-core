import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Pill } from '../components/Pill';
import { BD_TRAIN_ROUTES, TRAIN_STATIONS } from '../../../data/bangladeshTrainData';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const stationName = (id: string) => TRAIN_STATIONS[id]?.name ?? id.replace(/_/g, ' ');
const stationBnName = (id: string) => TRAIN_STATIONS[id]?.bnName ?? stationName(id);

function fmtTime(value?: string) {
  if (!value) return '—';
  return value;
}

export function TrainDetailPage(props: Props) {
  const { theme, device, lang, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const train = BD_TRAIN_ROUTES.find(item => item.id === params?.trainId) ?? BD_TRAIN_ROUTES.find(item => item.id === 'coxsbazar-express') ?? BD_TRAIN_ROUTES[0];
  const coaches = [
    { l:'Shuvan', bn:'শোভন', c:'#6b7280', f:`৳${train.fare.shuvan}` },
    { l:'Shuvan Chair', bn:'শোভন চেয়ার', c:'#f59e0b', f:`৳${train.fare.shuvanChair}` },
    { l:'Snigdha', bn:'স্নিগ্ধা', c:'#3b82f6', f:`৳${train.fare.snigdha}` },
    train.fare.firstClassBerth ? { l:'First Class Berth', bn:'প্রথম শ্রেণি বার্থ', c:'#10b981', f:`৳${train.fare.firstClassBerth}` } : null,
    train.fare.acBerth ? { l:'AC Berth', bn:'এসি বার্থ', c:'#7c3aed', f:`৳${train.fare.acBerth}` } : null,
  ].filter((item): item is { l:string; bn:string; c:string; f:string } => !!item);

  const stops = train.stops.map((id, index) => ({
    id,
    en: stationName(id),
    bn: stationBnName(id),
    boarding: index === 0,
    destination: index === train.stops.length - 1,
  }));

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:1000, margin:'0 auto' }}>
        <div style={{ background:`linear-gradient(135deg,${train.color || '#1e1b4b'},#4338ca)`, borderRadius:22, padding:isMobile?18:24, marginBottom:20, color:'#fff' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
            <span style={{ fontSize:28 }}>🚆</span>
            <div>
              <div style={{ fontFamily:SANS,fontWeight:700,fontSize:12,opacity:0.8,letterSpacing:1 }}>BANGLADESH RAILWAY · #{train.number}</div>
              <h2 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?20:26,margin:0 }}>{T(lang, train.bnName, train.name)}</h2>
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:14,flexWrap:'wrap' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:SANS,fontWeight:800,fontSize:18 }}>{T(lang, stationBnName(train.from), stationName(train.from))}</div>
              <div style={{ fontFamily:SANS,fontSize:12,opacity:0.8 }}>{fmtTime(train.dhakaDepart)}</div>
            </div>
            <div style={{ flex:1,textAlign:'center',minWidth:160 }}>
              <div style={{ fontFamily:SANS,fontSize:12,opacity:0.7 }}>{train.distanceKm} km</div>
              <div style={{ height:2,background:'rgba(255,255,255,0.35)',borderRadius:999,margin:'6px 0' }}/>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:SANS,fontWeight:800,fontSize:18 }}>{T(lang, stationBnName(train.to), stationName(train.to))}</div>
              <div style={{ fontFamily:SANS,fontSize:12,opacity:0.8 }}>{fmtTime(train.destinationArrive)}</div>
            </div>
          </div>
          <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
            {[`${train.distanceKm} km`, `${train.stops.length} ${T(lang,'স্টেশন','stations')}`, train.type, `${T(lang,'ছুটি','Off')}: ${train.offDay}`].map((s,i)=>(
              <span key={i} style={{ background:'rgba(255,255,255,0.15)',padding:'5px 10px',borderRadius:999,fontFamily:SANS,fontSize:12,fontWeight:600 }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr',gap:20 }}>
          <div>
            <div style={{ ...card(18),marginBottom:16 }}>
              <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:14 }}>{T(lang,'কোচ ক্লাস ও ভাড়া','Coach classes')}</div>
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                {coaches.map((c)=>(
                  <div key={c.l} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:12,background:tk.panelMuted,border:`1px solid ${tk.line}` }}>
                    <div style={{ width:12,height:12,borderRadius:3,background:c.c }}/>
                    <div style={{ flex:1 }}>
                      <span style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text }}>{T(lang,c.bn,c.l)}</span>
                    </div>
                    <span style={{ fontFamily:SANS,fontWeight:800,fontSize:15,color:c.c }}>{c.f}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12,padding:10,background:tk.amberSoft,borderRadius:10,fontFamily:BEN,fontSize:12,color:tk.amber }}>
                {T(lang,'ভাড়া তথ্য বাংলাদেশ রেলওয়ে ডেটা থেকে দেখানো হয়েছে।','Fare information is shown from Bangladesh Railway data.')}
              </div>
            </div>

            <div style={{ ...card(18),marginBottom:16 }}>
              <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:14 }}>{T(lang,'স্টেশনসমূহ','Stations')}</div>
              {stops.map((s,i)=>(
                <div key={s.id} style={{ display:'flex',gap:14,paddingBottom:i<stops.length-1?14:0,position:'relative' }}>
                  <div style={{ width:20,flexShrink:0,display:'flex',justifyContent:'center',position:'relative' }}>
                    {i<stops.length-1 && <div style={{ position:'absolute',top:16,bottom:-4,width:2,background:tk.primary,opacity:0.4 }}/>}
                    <div style={{ width:s.boarding||s.destination?18:12,height:s.boarding||s.destination?18:12,borderRadius:999,marginTop:4,background:s.boarding?tk.primary:s.destination?tk.accent:tk.panel,border:`2px solid ${s.boarding?tk.primary:s.destination?tk.accent:tk.primary}` }}/>
                  </div>
                  <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                      <span style={{ fontFamily:BEN,fontWeight:s.boarding||s.destination?700:500,fontSize:14,color:tk.text }}>{T(lang,s.bn,s.en)}</span>
                      {s.boarding && <Pill tk={tk} tone="primary">{T(lang,'বোর্ডিং','Boarding')}</Pill>}
                      {s.destination && <Pill tk={tk} tone="accent">{T(lang,'গন্তব্য','Destination')}</Pill>}
                    </div>
                    {(s.boarding || s.destination) && (
                      <span style={{ fontFamily:SANS,fontSize:12,color:tk.textFaint,flexShrink:0 }}>{s.boarding ? fmtTime(train.dhakaDepart) : fmtTime(train.destinationArrive)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
          </div>

          {!isMobile && (
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div style={{ ...card(16),background:'linear-gradient(135deg,#1e1b4b,#4338ca)',color:'#fff',border:'none' }}>
                <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,marginBottom:12 }}>{T(lang,'টিকেট কোথায় পাবেন','Where to buy ticket')}</div>
                {[{icon:'🌐',l:'eticket.railway.gov.bd'},{icon:'🏢',l:T(lang,'বাংলাদেশ রেলওয়ে কাউন্টার','Bangladesh Railway counter')},{icon:'📞',l:'131'}].map((d,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.12)' }}>
                    <span style={{ fontSize:16 }}>{d.icon}</span>
                    <span style={{ fontFamily:BEN,fontSize:13,opacity:0.9 }}>{d.l}</span>
                  </div>
                ))}
                <p style={{ fontFamily:BEN,fontSize:11,opacity:0.7,marginTop:10 }}>{T(lang,'কই যাবো টিকেট বিক্রি করে না — শুধু তথ্য।','KoyJabo shows info only — no sales.')}</p>
              </div>
              <AdSlot tk={tk} lang={lang} kind="mid-rect"/>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
