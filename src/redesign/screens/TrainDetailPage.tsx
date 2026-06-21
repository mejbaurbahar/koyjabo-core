import React, { useEffect, useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Pill } from '../components/Pill';
import { BD_TRAIN_ROUTES, TRAIN_STATIONS } from '../../../data/bangladeshTrainData';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

interface RouteStop {
  city: string;
  arrival_time: string | null;
  departure_time: string | null;
  halt: string | null;
  duration: string | null;
}

interface RouteData {
  train_name: string;
  days: string[];
  routes: RouteStop[];
  total_duration: string;
}

const stationName = (id: string) => TRAIN_STATIONS[id]?.name ?? id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const stationBnName = (id: string) => TRAIN_STATIONS[id]?.bnName ?? stationName(id);

function cityLabel(city: string): string {
  return city.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function fmtTime(v?: string | null) {
  if (!v) return '—';
  return v.replace(' BST', '');
}

export function TrainDetailPage(props: Props) {
  const { theme, device, lang, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:r, padding:16 });

  const train = BD_TRAIN_ROUTES.find(item => item.id === params?.trainId) ?? BD_TRAIN_ROUTES[0];

  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('https://railspaapi.shohoz.com/v1.0/web/train-routes', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'https://eticket.railway.gov.bd',
      },
      body: JSON.stringify({ model: train.number }),
    })
      .then(r => r.json())
      .then(d => {
        if (d?.data?.routes?.length) setRouteData(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [train.number]);

  const coaches = [
    { l:'Shuvan', bn:'শোভন', c:'#6b7280', f:`৳${train.fare.shuvan}` },
    { l:'Shuvan Chair', bn:'শোভন চেয়ার', c:'#f59e0b', f:`৳${train.fare.shuvanChair}` },
    { l:'Snigdha', bn:'স্নিগ্ধা', c:'#3b82f6', f:`৳${train.fare.snigdha}` },
    train.fare.firstClassBerth ? { l:'First Class Berth', bn:'প্রথম শ্রেণি বার্থ', c:'#10b981', f:`৳${train.fare.firstClassBerth}` } : null,
    train.fare.acBerth ? { l:'AC Berth', bn:'এসি বার্থ', c:'#7c3aed', f:`৳${train.fare.acBerth}` } : null,
  ].filter((item): item is { l:string; bn:string; c:string; f:string } => !!item);

  // Use API route stops if available, fall back to stored stops
  const stops: RouteStop[] = routeData?.routes?.length
    ? routeData.routes
    : train.stops.map((id, i) => ({
        city: stationName(id),
        arrival_time: i === train.stops.length - 1 ? train.destinationArrive : null,
        departure_time: i === 0 ? train.dhakaDepart : null,
        halt: null,
        duration: null,
      }));

  const totalDuration = routeData?.total_duration || '—';
  const runningDays = routeData?.days || [];

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:1000, margin:'0 auto' }}>
        {/* Hero */}
        <div style={{ background:`linear-gradient(135deg,${train.color || '#1e1b4b'},#4338ca)`, borderRadius:22, padding:isMobile?18:24, marginBottom:20, color:'#fff' }}>
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
              <div style={{ fontFamily:SANS, fontWeight:800, fontSize:18 }}>{stops[0] ? cityLabel(stops[0].city) : stationName(train.from)}</div>
              <div style={{ fontFamily:SANS, fontSize:12, opacity:0.8 }}>{fmtTime(stops[0]?.departure_time)}</div>
            </div>
            <div style={{ flex:1, textAlign:'center', minWidth:160 }}>
              <div style={{ fontFamily:SANS, fontSize:11, opacity:0.7 }}>{totalDuration ? `⏱ ${totalDuration}` : `${train.distanceKm} km`}</div>
              <div style={{ height:2, background:'rgba(255,255,255,0.35)', borderRadius:999, margin:'6px 0' }}/>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:SANS, fontWeight:800, fontSize:18 }}>{stops.length > 0 ? cityLabel(stops[stops.length-1].city) : stationName(train.to)}</div>
              <div style={{ fontFamily:SANS, fontSize:12, opacity:0.8 }}>{fmtTime(stops[stops.length-1]?.arrival_time)}</div>
            </div>
          </div>

          {/* Chips */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              `${stops.length} ${T(lang,'স্টেশন','stations')}`,
              train.type,
              totalDuration !== '—' ? `⏱ ${totalDuration}` : `${train.distanceKm} km`,
              `${T(lang,'ছুটি','Off')}: ${train.offDay}`,
            ].map((s,i) => (
              <span key={i} style={{ background:'rgba(255,255,255,0.15)', padding:'5px 10px', borderRadius:999, fontFamily:SANS, fontSize:12, fontWeight:600 }}>{s}</span>
            ))}
            {runningDays.length > 0 && (
              <span style={{ background:'rgba(255,255,255,0.15)', padding:'5px 10px', borderRadius:999, fontFamily:SANS, fontSize:12, fontWeight:600 }}>
                📅 {runningDays.join(', ')}
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
                    <div style={{ flex:1 }}>
                      <span style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,c.bn,c.l)}</span>
                    </div>
                    <span style={{ fontFamily:SANS, fontWeight:800, fontSize:15, color:c.c }}>{c.f}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:12, padding:10, background:tk.amberSoft, borderRadius:10, fontFamily:BEN, fontSize:12, color:tk.amber }}>
                {T(lang,'ভাড়া তথ্য বাংলাদেশ রেলওয়ে ডেটা থেকে দেখানো হয়েছে।','Fare information is shown from Bangladesh Railway data.')}
              </div>
            </div>

            {/* Route / Stations */}
            <div style={{ ...card(18), marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:15, color:tk.text }}>
                  {T(lang,'রুট ও স্টেশন','Routes')}
                  <span style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint, fontWeight:400, marginLeft:6 }}>({stops.length})</span>
                </div>
                {loading && (
                  <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${tk.primary}`, borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}/>
                )}
                {totalDuration !== '—' && (
                  <span style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint }}>
                    {T(lang,'মোট সময়','Total Duration')}: <strong style={{ color:tk.text }}>{totalDuration}</strong>
                  </span>
                )}
              </div>

              {stops.map((stop, i) => {
                const isFirst = i === 0;
                const isLast = i === stops.length - 1;
                const label = cityLabel(stop.city);
                const hasDetail = stop.arrival_time || stop.departure_time || stop.halt || stop.duration;

                return (
                  <div key={`${stop.city}-${i}`} style={{ display:'flex', gap:14, paddingBottom: isLast ? 0 : 16, position:'relative' }}>
                    {/* Timeline */}
                    <div style={{ width:20, flexShrink:0, display:'flex', justifyContent:'center', position:'relative' }}>
                      {!isLast && (
                        <div style={{ position:'absolute', top:18, bottom:-4, width:2, background:tk.primary, opacity:0.3 }}/>
                      )}
                      <div style={{
                        width: isFirst||isLast ? 18 : 12,
                        height: isFirst||isLast ? 18 : 12,
                        borderRadius: 999,
                        marginTop: 4,
                        background: isFirst ? tk.primary : isLast ? tk.accent : tk.panelMuted,
                        border: `2px solid ${isFirst ? tk.primary : isLast ? tk.accent : tk.primary}`,
                        flexShrink: 0,
                      }}/>
                    </div>

                    {/* Stop content */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom: hasDetail ? 6 : 0 }}>
                        <span style={{ fontFamily:SANS, fontWeight: isFirst||isLast ? 700 : 500, fontSize:14, color:tk.text }}>
                          {label}
                        </span>
                        {isFirst && <Pill tk={tk} tone="primary">{T(lang,'বোর্ডিং','Boarding')}</Pill>}
                        {isLast && <Pill tk={tk} tone="accent">{T(lang,'গন্তব্য','Destination')}</Pill>}
                        {stop.departure_time && isFirst && (
                          <span style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint, marginLeft:'auto' }}>{fmtTime(stop.departure_time)}</span>
                        )}
                        {stop.arrival_time && isLast && (
                          <span style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint, marginLeft:'auto' }}>{fmtTime(stop.arrival_time)}</span>
                        )}
                      </div>

                      {/* Detail row */}
                      {hasDetail && (
                        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                          {stop.arrival_time && (
                            <span style={{ fontFamily:SANS, fontSize:11, color:tk.textDim }}>
                              <span style={{ color:tk.textFaint }}>{T(lang,'আসে','Arrival')}: </span>
                              {fmtTime(stop.arrival_time)}
                            </span>
                          )}
                          {stop.halt && stop.halt !== '00min' && stop.halt !== '0' && (
                            <span style={{ fontFamily:SANS, fontSize:11, color:tk.textDim }}>
                              <span style={{ color:tk.textFaint }}>{T(lang,'বিরতি','Halt')}: </span>
                              {stop.halt}
                            </span>
                          )}
                          {stop.departure_time && !isFirst && (
                            <span style={{ fontFamily:SANS, fontSize:11, color:tk.textDim }}>
                              <span style={{ color:tk.textFaint }}>{T(lang,'ছাড়ে','Dep')}: </span>
                              {fmtTime(stop.departure_time)}
                            </span>
                          )}
                          {stop.duration && stop.duration !== '00h' && (
                            <span style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint }}>⏱ {stop.duration}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {stops.length === 0 && !loading && (
                <div style={{ fontFamily:BEN, fontSize:13, color:tk.textFaint, textAlign:'center', padding:'16px 0' }}>
                  {T(lang,'রুট তথ্য পাওয়া যায়নি','Route data unavailable')}
                </div>
              )}
            </div>

            <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ ...card(16), background:'linear-gradient(135deg,#1e1b4b,#4338ca)', color:'#fff', border:'none' }}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:15, marginBottom:12 }}>
                {T(lang,'টিকেট কোথায় পাবেন','Where to buy ticket')}
              </div>
              {[
                { icon:'🌐', l:'eticket.railway.gov.bd', url:'https://eticket.railway.gov.bd' },
                { icon:'🏢', l:T(lang,'বাংলাদেশ রেলওয়ে কাউন্টার','Bangladesh Railway counter'), url:'' },
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

            {/* Book online button */}
            <button
              onClick={() => window.open('https://eticket.railway.gov.bd', '_blank')}
              style={{ background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', border:0, borderRadius:14, padding:'14px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 8px 22px -10px #7c3aed' }}
            >
              🎫 {T(lang,'অনলাইনে টিকেট বুক করুন','Book Ticket Online')}
            </button>

            {!isMobile && <AdSlot tk={tk} lang={lang} kind="mid-rect"/>}
          </div>
        </div>

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </PageShell>
  );
}
