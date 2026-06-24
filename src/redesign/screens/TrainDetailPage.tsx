import React from 'react';
import { KJ_TOKENS, T, SANS, BEN, N, Fare } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Pill } from '../components/Pill';
import { BD_TRAIN_ROUTES, TRAIN_STATIONS } from '../../../data/bangladeshTrainData';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const stationName = (id: string) => TRAIN_STATIONS[id]?.name ?? id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const stationBnName = (id: string) => TRAIN_STATIONS[id]?.bnName ?? stationName(id);

function fmtT(v?: string | null) {
  if (!v) return '';
  return v.replace(' BST', '').trim();
}

function fmtHalt(h: string) {
  if (!h || h === 'None' || h === 'undefined') return '';
  const n = parseInt(h);
  if (isNaN(n)) return h;
  return `${n} min`;
}

export function TrainDetailPage(props: Props) {
  const { theme, device, lang, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:r, padding:16 });

  const train = BD_TRAIN_ROUTES.find(t => t.id === params?.trainId) ?? BD_TRAIN_ROUTES[0];
  const stops = train.routeStops;

  const coaches = [
    { l:'Shuvan', bn:'শোভন', c:'#6b7280', f:Fare(train.fare.shuvan, lang) },
    { l:'Shuvan Chair', bn:'শোভন চেয়ার', c:'#f59e0b', f:Fare(train.fare.shuvanChair, lang) },
    { l:'Snigdha', bn:'স্নিগ্ধা', c:'#3b82f6', f:Fare(train.fare.snigdha, lang) },
    train.fare.firstClassBerth ? { l:'First Class Berth', bn:'প্রথম শ্রেণি বার্থ', c:'#10b981', f:Fare(train.fare.firstClassBerth, lang) } : null,
    train.fare.acBerth ? { l:'AC Berth', bn:'এসি বার্থ', c:'#7c3aed', f:Fare(train.fare.acBerth, lang) } : null,
  ].filter((x): x is {l:string;bn:string;c:string;f:string} => !!x);

  const depTime = stops[0]?.departure ? fmtT(stops[0].departure) : train.dhakaDepart;
  const arrTime = stops[stops.length-1]?.arrival ? fmtT(stops[stops.length-1].arrival) : train.destinationArrive;
  const fromLabel = stops[0]?.label || stationName(train.from);
  const toLabel = stops[stops.length-1]?.label || stationName(train.to);

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:1000, margin:'0 auto' }}>

        {/* Hero */}
        <div style={{ background:`linear-gradient(135deg,${train.color||'#1e1b4b'},#4338ca)`, borderRadius:22, padding:isMobile?18:24, marginBottom:20, color:'#fff' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:28 }}>🚆</span>
            <div>
              <div style={{ fontFamily:SANS, fontWeight:700, fontSize:12, opacity:0.8, letterSpacing:1 }}>
                BANGLADESH RAILWAY · #{train.number}
              </div>
              <h2 style={{ fontFamily:BEN, fontWeight:700, fontSize:isMobile?20:26, margin:0 }}>
                {T(lang, train.bnName, train.name)}
              </h2>
            </div>
          </div>

          {/* From → To */}
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14, flexWrap:'wrap' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:SANS, fontWeight:800, fontSize:18 }}>{fromLabel.replace(/_/g,' ')}</div>
              <div style={{ fontFamily:SANS, fontSize:12, opacity:0.8 }}>{depTime}</div>
            </div>
            <div style={{ flex:1, textAlign:'center', minWidth:120 }}>
              {train.totalDuration && <div style={{ fontFamily:SANS, fontSize:11, opacity:0.7 }}>⏱ {train.totalDuration}</div>}
              <div style={{ height:2, background:'rgba(255,255,255,0.35)', borderRadius:999, margin:'6px 0' }}/>
              <div style={{ fontFamily:SANS, fontSize:10, opacity:0.6 }}>{N(stops.length, lang)} stations</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:SANS, fontWeight:800, fontSize:18 }}>{toLabel.replace(/_/g,' ')}</div>
              <div style={{ fontFamily:SANS, fontSize:12, opacity:0.8 }}>{arrTime}</div>
            </div>
          </div>

          {/* Chips */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              train.type,
              train.totalDuration ? `⏱ ${train.totalDuration}` : `${train.distanceKm} km`,
              `${T(lang,'ছুটি','Off')}: ${train.offDay}`,
            ].map((s,i) => (
              <span key={i} style={{ background:'rgba(255,255,255,0.15)', padding:'5px 10px', borderRadius:999, fontFamily:SANS, fontSize:12, fontWeight:600 }}>{s}</span>
            ))}
            {train.runningDays?.length > 0 && (
              <span style={{ background:'rgba(255,255,255,0.15)', padding:'5px 10px', borderRadius:999, fontFamily:SANS, fontSize:12, fontWeight:600 }}>
                📅 {train.runningDays.join(', ')}
              </span>
            )}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr', gap:20 }}>
          <div>
            {/* Coach classes */}
            <div style={{ ...card(18), marginBottom:16 }}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:15, color:tk.text, marginBottom:14 }}>
                {T(lang,'কোচ ক্লাস ও ভাড়া','Coach classes')}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {coaches.map(c => (
                  <div key={c.l} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:12, background:tk.panelMuted, border:`1px solid ${tk.line}` }}>
                    <div style={{ width:12, height:12, borderRadius:3, background:c.c }}/>
                    <span style={{ flex:1, fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,c.bn,c.l)}</span>
                    <span style={{ fontFamily:SANS, fontWeight:800, fontSize:15, color:c.c }}>{c.f}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, padding:10, background:tk.amberSoft, borderRadius:10, fontFamily:BEN, fontSize:12, color:tk.amber }}>
                {T(lang,'ভাড়া বাংলাদেশ রেলওয়ে ডেটা থেকে। অতিরিক্ত: সার্ভিস চার্জ ৳২০ + ১৫% ভ্যাট।','Base fare from Bangladesh Railway. Add: ৳20 service charge + 15% VAT.')}
              </div>
            </div>

            <div style={{ margin: '16px 0' }}>
              <AdSlot tk={tk} lang={lang} kind="in-article" />
            </div>

            {/* Routes */}
            <div style={{ ...card(18), marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:15, color:tk.text }}>
                  {T(lang,'রুট','Routes')}
                  <span style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint, fontWeight:400, marginLeft:6 }}>({N(stops.length, lang)} {T(lang,'স্টেশন','stations')})</span>
                </div>
                {train.totalDuration && (
                  <span style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint }}>
                    {T(lang,'মোট সময়','Total Duration')}: <strong style={{ color:tk.primary }}>{train.totalDuration}</strong>
                  </span>
                )}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {stops.map((stop, i) => {
                  const isFirst = i === 0;
                  const isLast = i === stops.length - 1;
                  const label = stop.label || stop.city.replace(/_/g,' ');
                  const arrival = fmtT(stop.arrival);
                  const departure = fmtT(stop.departure);
                  const halt = fmtHalt(stop.halt);
                  const duration = stop.duration && stop.duration !== 'None' && stop.duration !== 'undefined' ? stop.duration : '';

                  return (
                    <div key={`${stop.city}-${i}`} style={{ display:'flex', gap:14, position:'relative', paddingBottom:16 }}>
                      {/* Timeline dot + line */}
                      <div style={{ width:20, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div style={{
                          width: isFirst||isLast ? 18 : 12,
                          height: isFirst||isLast ? 18 : 12,
                          borderRadius: 999,
                          background: isFirst ? tk.primary : isLast ? tk.accent : tk.panelMuted,
                          border: `2px solid ${isFirst ? tk.primary : isLast ? tk.accent : tk.primary}`,
                          marginTop: 3,
                          flexShrink: 0,
                          boxShadow: isFirst||isLast ? `0 0 0 3px ${isFirst?tk.primarySoft:tk.accentSoft}` : 'none',
                        }}/>
                        {!isLast && (
                          <div style={{ width:2, flex:1, background:tk.primary, opacity:0.25, marginTop:3 }}/>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex:1, minWidth:0, paddingBottom:isLast?0:4 }}>
                        {/* Station name + pills */}
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                          <span style={{ fontFamily:SANS, fontWeight:isFirst||isLast?700:600, fontSize:14, color:tk.text }}>
                            {label}
                          </span>
                          {isFirst && <Pill tk={tk} tone="primary">{T(lang,'বোর্ডিং','BOARDING')}</Pill>}
                          {isLast && <Pill tk={tk} tone="accent">{T(lang,'গন্তব্য','DESTINATION')}</Pill>}
                        </div>

                        {/* Detail row — always show for all stops */}
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'4px 16px', background:tk.panelMuted, borderRadius:10, padding:'8px 12px' }}>
                          <div>
                            <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint, display:'block' }}>
                              {T(lang,'আসে','Arrival')}
                            </span>
                            <span style={{ fontFamily:SANS, fontSize:12, fontWeight:600, color:arrival ? tk.text : tk.textFaint }}>
                              {arrival || '—'}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint, display:'block' }}>
                              {T(lang,'বিরতি','Halt')}
                            </span>
                            <span style={{ fontFamily:SANS, fontSize:12, fontWeight:600, color:halt ? tk.text : tk.textFaint }}>
                              {halt || '—'}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint, display:'block' }}>
                              {T(lang,'ছাড়ে','Departure')}
                            </span>
                            <span style={{ fontFamily:SANS, fontSize:12, fontWeight:600, color:departure ? tk.text : tk.textFaint }}>
                              {departure || '—'}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint, display:'block' }}>
                              {T(lang,'সময়','Duration')}
                            </span>
                            <span style={{ fontFamily:SANS, fontSize:12, fontWeight:600, color:duration ? tk.primary : tk.textFaint }}>
                              {duration || '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total duration footer */}
              {train.totalDuration && (
                <div style={{ marginTop:8, padding:'10px 14px', background:`${tk.primary}15`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint }}>{T(lang,'মোট যাত্রা সময়','Total journey time')}</span>
                  <span style={{ fontFamily:SANS, fontWeight:800, fontSize:15, color:tk.primary }}>{train.totalDuration}</span>
                </div>
              )}
            </div>

            <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
            <div style={{ margin: '20px 0' }}>
              <AdSlot tk={tk} lang={lang} kind="multiplex" />
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ ...card(16), background:'linear-gradient(135deg,#1e1b4b,#4338ca)', color:'#fff', border:'none' }}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:15, marginBottom:12 }}>
                {T(lang,'টিকেট কোথায় পাবেন','Where to buy ticket')}
              </div>
              {[
                { icon:'🌐', l:'eticket.railway.gov.bd', url:'https://eticket.railway.gov.bd' },
                { icon:'🏢', l:T(lang,'রেলওয়ে কাউন্টার','Railway counter'), url:'' },
                { icon:'📞', l:'131', url:'' },
              ].map((d,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.12)' }}>
                  <span style={{ fontSize:16 }}>{d.icon}</span>
                  {d.url
                    ? <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily:BEN, fontSize:13, opacity:0.9, color:'#fff', textDecoration:'underline' }}>{d.l}</a>
                    : <span style={{ fontFamily:BEN, fontSize:13, opacity:0.9 }}>{d.l}</span>
                  }
                </div>
              ))}
              <p style={{ fontFamily:BEN, fontSize:11, opacity:0.7, marginTop:10 }}>
                {T(lang,'কই যাবো টিকেট বিক্রি করে না — শুধু তথ্য।','KoyJabo shows info only — no sales.')}
              </p>
            </div>

            <button
              onClick={() => window.open('https://eticket.railway.gov.bd', '_blank')}
              style={{ background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', border:0, borderRadius:14, padding:'14px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 8px 22px -10px #7c3aed' }}
            >
              🎫 {T(lang,'অনলাইনে টিকেট বুক করুন','Book Ticket Online')}
            </button>

            {/* Senior citizen discount */}
            <div style={{ ...card(14), background:'linear-gradient(135deg,#065f4622,#10b98122)', borderColor:'#10b98144' }}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:13, color:tk.text, marginBottom:8 }}>
                👴 {T(lang,'প্রবীণ নাগরিক ছাড়','Senior Citizen Discount')}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[
                  [T(lang,'বয়স','Age'), N(65, lang)+'+'],
                  [T(lang,'ছাড়','Discount'), N(25, lang)+'%'],
                  [T(lang,'সাপ্তাহিক সীমা','Weekly limit'), T(lang,'২ যাত্রা',`${N(2,lang)} trips`)],
                  [T(lang,'সহযাত্রী','Co-passenger'), N(1, lang)],
                ].map(([l,v],i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontFamily:SANS, fontSize:12 }}>
                    <span style={{ color:tk.textFaint }}>{l}</span>
                    <span style={{ color:tk.text, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fees + Payment methods */}
            <div style={{ ...card(14) }}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:13, color:tk.text, marginBottom:8 }}>
                💳 {T(lang,'ফি ও পেমেন্ট','Fees & Payment')}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:10 }}>
                {[
                  [T(lang,'সার্ভিস চার্জ','Service charge'), Fare(20, lang)],
                  [T(lang,'ভ্যাট','VAT'), N(15, lang)+'%'],
                  [T(lang,'বিছানা ফি','Bedding fee'), Fare(50, lang)],
                  [T(lang,'সর্বোচ্চ টিকেট','Max tickets'), N(4, lang)],
                ].map(([l,v],i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontFamily:SANS, fontSize:12 }}>
                    <span style={{ color:tk.textFaint }}>{l}</span>
                    <span style={{ color:tk.text, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint, marginBottom:6 }}>{T(lang,'পেমেন্ট পদ্ধতি','Payment methods')}:</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {['bKash','Nagad','Rocket','Visa','MasterCard','DBBL Nexus'].map(m => (
                  <span key={m} style={{ background:tk.panelMuted, border:`1px solid ${tk.line}`, borderRadius:6, padding:'3px 8px', fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textDim }}>{m}</span>
                ))}
              </div>
            </div>

            {!isMobile && <AdSlot tk={tk} lang={lang} kind="mid-rect"/>}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
