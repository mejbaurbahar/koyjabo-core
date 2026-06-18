import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Icon } from '../components/Icons';
import { Pill } from '../components/Pill';
import { BUS_DATA, STATIONS } from '../../../constants';
import BusRouteMap from '../../../components/BusRouteMap';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const TYPE_COLOR: Record<string, [string,string]> = {
  'AC': ['#006a4e','#10b981'], 'Local': ['#1e3a8a','#3b82f6'],
  'Double-Decker': ['#5b21b6','#7c3aed'], 'Semi-Sitting': ['#0c4a6e','#0ea5e9'],
  'Sitting': ['#92400e','#f59e0b'], 'Metro Rail': ['#00543c','#10b981'],
};

export function BusDetailPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const [fav, setFav] = useState(false);
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });

  // Find real bus from BUS_DATA
  const busId = params?.busId ?? '';
  const fromId = params?.from ?? '';
  const toId = params?.to ?? '';
  const bus = BUS_DATA.find(b => b.id === busId) ?? BUS_DATA[0];

  // Build real stop list with names + rough times
  const realStops = bus.stops.map((sid, i) => {
    const st = STATIONS[sid];
    const fromStation = STATIONS[fromId?.toLowerCase()] ?? STATIONS[bus.stops[0]];
    return {
      id: sid,
      en: st?.name ?? sid.replace(/_/g,' '),
      bn: st?.bnName ?? sid,
      t: `${4 + Math.floor(i * 8 / bus.stops.length)}:${(22 + i * 7) % 60 < 10 ? '0' : ''}${(22 + i * 7) % 60} ${i < 6 ? 'PM' : 'PM'}`,
      isFrom: sid === fromId?.toLowerCase() || (!fromId && i === 0),
      isTo: sid === toId?.toLowerCase() || (!toId && i === bus.stops.length - 1),
    };
  });

  const colPair = TYPE_COLOR[bus.type] ?? ['#1e3a8a','#3b82f6'];
  const badge = bus.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const fareAmt = bus.type==='AC'?60:bus.type==='Double-Decker'?50:30;

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 100px':'28px 40px 145px', maxWidth:1100, margin:'0 auto' }}>

        {/* Real Leaflet Map */}
        <div style={{ height:280,borderRadius:20,overflow:'hidden',position:'relative',marginBottom:18,background:'#0a1f14' }}>
          <BusRouteMap
            route={bus}
            highlightStartId={fromId || bus.stops[0]}
            highlightEndId={toId || bus.stops[bus.stops.length-1]}
          />
          <div style={{ position:'absolute',top:12,left:12,background:'rgba(16,185,129,0.9)',padding:'5px 12px',borderRadius:999,fontFamily:SANS,fontWeight:700,fontSize:11,color:'#fff',display:'flex',alignItems:'center',gap:6,pointerEvents:'none' }}>
            <span className="kj-anim-pulse" style={{ width:6,height:6,borderRadius:999,background:'#fff',display:'inline-block' }}/>
            {T(lang,'লাইভ ট্র্যাকিং','Live tracking')}
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr',gap:20 }}>
          <div>
            {/* Info card — real data */}
            <div style={{ ...card(18),marginBottom:16 }}>
              <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:14 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${colPair[0]},${colPair[1]})`,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:SANS,fontWeight:800,fontSize:15 }}>{badge}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:BEN,fontWeight:700,fontSize:16,color:tk.text }}>{lang==='bn'?bus.bnName:bus.name}</div>
                  <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:2 }}>
                    <span style={{ color:'#f59e0b',fontSize:12 }}>★ 4.2</span>
                    <span style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint }}>324 reviews</span>
                    <Pill tk={tk} tone={bus.type==='AC'?'primary':'mute'}>{bus.type}</Pill>
                  </div>
                </div>
              </div>
              <div style={{ fontFamily:BEN,fontSize:13,color:tk.textDim,marginBottom:12 }}>{bus.routeString}</div>
              <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,marginBottom:12 }}>🕐 {bus.hours}</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8 }}>
                {[
                  {v:String(bus.stops.length),l:T(lang,'স্টপ','stops')},
                  {v:`${30+bus.stops.length*3}m`,l:T(lang,'সময়','time')},
                  {v:`৳${fareAmt}`,l:T(lang,'ভাড়া','fare')},
                  {v:bus.type,l:T(lang,'ধরন','type')},
                ].map((s,i)=>(
                  <div key={i} style={{ background:tk.panelMuted,borderRadius:10,padding:'8px 6px',textAlign:'center' }}>
                    <div style={{ fontFamily:SANS,fontWeight:800,fontSize:14,color:tk.text }}>{s.v}</div>
                    <div style={{ fontFamily:SANS,fontSize:10,color:tk.textFaint }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Stops from STATIONS */}
            <div style={{ ...card(18),marginBottom:16 }}>
              <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:14 }}>{T(lang,'স্টপসমূহ','Stops')} <span style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint }}>({realStops.length})</span></div>
              {realStops.map((s,i)=>(
                <div key={i} style={{ display:'flex',gap:14,paddingBottom:i<realStops.length-1?12:0,position:'relative' }}>
                  <div style={{ width:20,flexShrink:0,position:'relative',display:'flex',justifyContent:'center' }}>
                    {i<realStops.length-1 && <div style={{ position:'absolute',top:16,bottom:-4,width:2,background:tk.primary,opacity:0.3 }}/>}
                    <div style={{ width:s.isFrom||s.isTo?18:12,height:s.isFrom||s.isTo?18:12,borderRadius:999,marginTop:4,background:s.isFrom?tk.primary:s.isTo?tk.accent:tk.panel,border:`2px solid ${s.isFrom?tk.primary:s.isTo?tk.accent:tk.primary}` }}/>
                  </div>
                  <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
                      <span style={{ fontFamily:BEN,fontWeight:s.isFrom||s.isTo?700:500,fontSize:14,color:tk.text }}>{lang==='bn'?s.bn:s.en}</span>
                      {s.isFrom && <Pill tk={tk} tone="primary">{T(lang,'বোর্ডিং','Boarding')}</Pill>}
                      {s.isTo && <Pill tk={tk} tone="accent">{T(lang,'গন্তব্য','Destination')}</Pill>}
                    </div>
                    <span style={{ fontFamily:SANS,fontSize:12,color:tk.textFaint,flexShrink:0 }}>{s.t}</span>
                  </div>
                </div>
              ))}
            </div>

            <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>

            {/* Ratings */}
            <div style={{ ...card(18),marginBottom:16 }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
                <div>
                  <span style={{ fontFamily:SANS,fontWeight:800,fontSize:28,color:tk.text }}>4.2</span>
                  <span style={{ color:'#f59e0b',fontSize:18,marginLeft:6 }}>★★★★☆</span>
                  <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,marginTop:2 }}>324 {T(lang,'রিভিউ','reviews')}</div>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                  {[5,4,3,2,1].map(star=>(
                    <div key={star} style={{ display:'flex',alignItems:'center',gap:6 }}>
                      <span style={{ fontFamily:SANS,fontSize:10,color:tk.textFaint,width:8 }}>{star}</span>
                      <div style={{ width:80,height:6,borderRadius:999,background:tk.line,overflow:'hidden' }}>
                        <div style={{ height:'100%',borderRadius:999,background:'#f59e0b',width:`${star===5?65:star===4?20:star===3?10:3}%` }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:14 }}>
                {[T(lang,'পরিষ্কার','Clean'),T(lang,'AC ভালো','AC works'),T(lang,'সময়মতো','On-time'),T(lang,'নিরাপদ','Safe')].map((t,i)=>(
                  <span key={i} style={{ background:tk.chipBg,padding:'4px 10px',borderRadius:999,fontFamily:BEN,fontSize:12,color:tk.chipText }}>{t}</span>
                ))}
              </div>
              <button onClick={()=>onNav('rate-review')} style={{ marginTop:14,background:tk.primarySoft,color:tk.primary,border:0,borderRadius:10,padding:'10px 16px',fontFamily:SANS,fontWeight:700,fontSize:13,cursor:'pointer',width:'100%' }}>
                ⭐ {T(lang,'রিভিউ দিন','Write a review')}
              </button>
            </div>
          </div>

          {!isMobile && (
            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div style={{ ...card(16),background:`linear-gradient(135deg,${colPair[0]},${colPair[1]})`,color:'#fff',border:'none' }}>
                <div style={{ fontFamily:BEN,fontWeight:700,fontSize:16,marginBottom:12 }}>{T(lang,'বাস তথ্য','Bus info')}</div>
                {[
                  {l:T(lang,'অপারেটর','Operator'),v:bus.name},
                  {l:T(lang,'বাস আইডি','Bus ID'),v:bus.id},
                  {l:T(lang,'ভাড়া','Fare'),v:`৳ ${fareAmt}`},
                  {l:T(lang,'বাসের ধরন','Type'),v:bus.type},
                  {l:T(lang,'সময়সূচি','Hours'),v:bus.hours},
                ].map((d,i)=>(
                  <div key={i} style={{ display:'flex',justifyContent:'space-between',paddingBottom:8,borderBottom:'1px solid rgba(255,255,255,0.12)',marginBottom:8 }}>
                    <span style={{ fontFamily:BEN,fontSize:13,opacity:0.8 }}>{d.l}</span>
                    <span style={{ fontFamily:SANS,fontWeight:700,fontSize:13 }}>{d.v}</span>
                  </div>
                ))}
                <p style={{ fontFamily:BEN,fontSize:11,opacity:0.7,marginTop:8 }}>ℹ️ {T(lang,'কই যাবো টিকেট বিক্রি করে না — শুধু তথ্য দেয়।','KoyJabo shows info only — no ticket sales.')}</p>
              </div>
              <AdSlot tk={tk} lang={lang} kind="mid-rect"/>
            </div>
          )}
        </div>
      </div>

      <div style={{ position:'fixed', bottom: isMobile ? 0 : 60, left:0, right:0, background:tk.panel, backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)', borderTop:`1px solid ${tk.line}`, padding:'12px 16px', display:'flex', gap:10, zIndex:9100 }}>
        <button onClick={()=>setFav(f=>!f)} style={{ ...chipBtn(tk),borderRadius:12,padding:'10px 16px' }}>
          {fav?'❤️':'🤍'} {T(lang,'সেভ','Save')}
        </button>
        <button onClick={()=>onNav('rate-review')} style={{ ...chipBtn(tk),borderRadius:12,padding:'10px 16px' }}>
          ⭐ {T(lang,'রেট','Rate')}
        </button>
        <button style={{ flex:1,background:tk.primary,color:tk.primaryInk,border:0,borderRadius:12,padding:'12px 20px',fontFamily:SANS,fontWeight:700,fontSize:14,cursor:'pointer' }}>
          🗺 {T(lang,'নেভিগেট করুন','Start navigation')}
        </button>
      </div>
    </PageShell>
  );
}
