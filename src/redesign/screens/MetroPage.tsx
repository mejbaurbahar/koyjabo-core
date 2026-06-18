import React, { useState, useRef, useMemo, useEffect } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { SectionHeader } from '../components/SectionHeader';
import { Icon } from '../components/Icons';
import { ModeHero } from '../components/ModeHero';
import { METRO_STATIONS, METRO_LINES } from '../../../constants';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const DMTCL_BASE = 'https://dmtcl.gov.bd';
const DMTCL_UPDATED = '18 Jun 2026 · 16:05';
const DMTCL_LINKS = [
  { en: 'MRT-6 route alignment', bn: 'এমআরটি লাইন-৬ রুট এ্যালাইনমেন্ট', href: `${DMTCL_BASE}/pages/static-pages/6922de3c933eb65569e193a8` },
  { en: 'Fare list / fare collection guide', bn: 'ভাড়ার তালিকা / ভাড়া আদায় নির্দেশিকা', href: `${DMTCL_BASE}/pages/static-pages/6922df5a933eb65569e2169f` },
  { en: 'MRT Pass registration form', bn: 'MRT Pass নিবন্ধন ফরম', href: `${DMTCL_BASE}/pages/forms/6922d9b9933eb65569dffa82` },
  { en: 'MRT-6 FAQ', bn: 'এমআরটি লাইন-৬ সচরাচর জিজ্ঞাস্য', href: `${DMTCL_BASE}/pages/static-pages/6922e089933eb65569e27764` },
];
const DMTCL_NOTICES = [
  { en: 'Vehicle Tracking System (VTS) notice', bn: 'Vehicle Tracking System (VTS) স্থাপন সংক্রান্ত বিজ্ঞপ্তি', date: '09 Jun 2026', href: `${DMTCL_BASE}/pages/notices/vehicle-tracking-system-vts-স্থাপন-সংক্রান্ত-বিজ্ঞপ্তি-e48267fa-6a28011b0daa4cebedfbfa0c` },
  { en: 'Station visit duty distribution and checklist', bn: 'স্টেশন ভিজিট দায়িত্ব বন্টন এবং স্টেশন ভিজিট চেকলিস্ট', date: '27 May 2026', href: `${DMTCL_BASE}/pages/notices/স্টেশন-ভিজিট-দায়িত্ব-বন্টন-এবং-স্টেশন-ভিজিট-চেকলিস্ট-86838f8a-6a16addf8cecc6bec6d483a2` },
];

function metroFareFromDistance(distanceKm: number) {
  if (distanceKm <= 0) return 0;
  return Math.min(100, Math.max(20, Math.round((20 + distanceKm * 4.6) / 10) * 10));
}

// MRT-6 stations in official DMTCL route order.
const MRT6_LINE = METRO_LINES['mrt6'];
const STATIONS = MRT6_LINE
  ? MRT6_LINE.stations.map((id, i) => {
      const s = METRO_STATIONS[id];
      const fare = metroFareFromDistance(s?.distanceFromStart ?? 0);
      return { id, bn: s?.bnName ?? id, en: (s?.name ?? id).replace(' Metro Station',''), fare, distance: s?.distanceFromStart ?? 0, desc: s?.description ?? '', lat: s?.lat, lng: s?.lng, active: true };
    })
  : [
      {id:'uttara_north',bn:'উত্তরা উত্তর',en:'Uttara North',fare:0,distance:0,desc:'',lat:23.8693,lng:90.3675,active:true},
      {id:'motijheel',bn:'মতিঝিল',en:'Motijheel',fare:100,distance:17.5,desc:'',lat:23.7270,lng:90.4132,active:true},
    ];
const DISPLAY_STATIONS = [
  ...STATIONS,
  { id:'kamalapur_extension', bn:'কমলাপুর', en:'Kamalapur', fare:null, distance:18.66, desc:'Motijheel to Kamalapur extension under construction', lat:23.7333, lng:90.4265, active:false },
];

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function MetroPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (p=16): React.CSSProperties => ({ background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:16, padding:p });

  const [fareFrom, setFareFrom] = useState('');
  const [fareTo, setFareTo] = useState('');
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'ready' | 'blocked' | 'unsupported'>('checking');
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const stationSuggestions: Suggestion[] = useMemo(() =>
    STATIONS.map(s => ({ id: s.en, label: s.en, sub: s.bn + (s.fare > 0 ? ` · ৳${s.fare}` : ' · Start') })), []
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('ready');
      },
      () => setLocationStatus('blocked'),
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 300000 }
    );
  }, []);

  const nearestMetro = useMemo(() => {
    if (!userLocation) return null;
    return DISPLAY_STATIONS
      .filter(s => typeof s.lat === 'number' && typeof s.lng === 'number')
      .map((s, index) => ({ ...s, index, distance: distanceKm(userLocation, { lat: s.lat as number, lng: s.lng as number }) }))
      .sort((a, b) => a.distance - b.distance)[0] ?? null;
  }, [userLocation]);

  const filterStations = (q: string) => {
    if (!q.trim()) return stationSuggestions;
    const lq = q.toLowerCase();
    return stationSuggestions.filter(s => s.label.toLowerCase().includes(lq) || (s.sub ?? '').toLowerCase().includes(lq));
  };

  // Calculate fare between two stations
  const calcFare = useMemo(() => {
    const fi = STATIONS.findIndex(s => s.en.toLowerCase() === fareFrom.toLowerCase());
    const ti = STATIONS.findIndex(s => s.en.toLowerCase() === fareTo.toLowerCase());
    if (fi < 0 || ti < 0 || fi === ti) return null;
    const diff = Math.abs((STATIONS[fi]?.distance ?? fi) - (STATIONS[ti]?.distance ?? ti));
    const fare = metroFareFromDistance(diff);
    return { fare, stops: diff };
  }, [fareFrom, fareTo]);

  const nearestName = nearestMetro ? T(lang, nearestMetro.bn, nearestMetro.en) : T(lang, 'নিকটতম স্টেশন', 'nearest station');
  const nearestDistance = nearestMetro ? (nearestMetro.distance < 1 ? `${Math.round(nearestMetro.distance * 1000)} m` : `${nearestMetro.distance.toFixed(1)} km`) : '';

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'0 0 80px':'0 0 48px' }}>
        <ModeHero tk={tk} isMobile={isMobile} lang={lang} kind="train"
          gradient="linear-gradient(135deg, #00130e 0%, #00543c 50%, #10b981 100%)"
          title={T(lang,'ঢাকা মেট্রো · MRT-6 অফিসিয়াল গাইড','Dhaka Metro · MRT-6 official guide')}
          subtitle={T(lang,'DMTCL তথ্য অনুযায়ী ১৬টি সক্রিয় স্টেশন · মতিঝিল-কমলাপুর বর্ধিতাংশ নির্মাণাধীন।','DMTCL data: 16 active stations · Motijheel-Kamalapur extension under construction.')}
          stats={[{v:'16 + 1',l:T(lang,'স্টেশন','Stations')},{v:'06:30',l:T(lang,'উত্তরা থেকে','From Uttara')},{v:'22:10',l:T(lang,'শেষ দিক','Latest service')},{v:'৳ 20-100',l:T(lang,'ভাড়া','Fare range')}]}
        />

        <div style={{ padding:isMobile?'0 16px':'0 40px' }}>
          {/* Next train + ticket cards */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr', gap:14, marginBottom:18 }}>
            <div style={{ background:'linear-gradient(135deg,#00130e,#00543c)', borderRadius:18, padding:20, color:'#fff', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', right:-40, top:-40, width:160, height:160, borderRadius:999, background:'rgba(16,185,129,0.25)' }} className="kj-anim-pulse"/>
              <div style={{ fontFamily:SANS, fontSize:11, fontWeight:700, letterSpacing:1.4, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', marginBottom:8 }}>{T(lang,'অফিসিয়াল অপারেশন','Official operation')} · {nearestName}</div>
              <div style={{ fontFamily:SANS, fontWeight:800, fontSize:isMobile?36:44, color:'#fff', letterSpacing:-1.5, lineHeight:1 }}>06:30-22:10</div>
              <div style={{ fontFamily:BEN, fontSize:13, color:'rgba(255,255,255,0.7)', marginTop:6 }}>{T(lang,'উত্তরা উত্তর ↔ মতিঝিল · DMTCL FAQ, ৭ এপ্রিল ২০২৬','Uttara North ↔ Motijheel · DMTCL FAQ, 7 Apr 2026')}</div>
              <div style={{ display:'flex', gap:12, marginTop:14 }}>
                {[{l:T(lang,'উত্তরা থেকে','From Uttara'),v:'06:30-21:30'},{l:T(lang,'মতিঝিল থেকে','From Motijheel'),v:'07:15-22:10'}].map((t,i)=>(
                  <div key={i} style={{ background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'8px 12px' }}>
                    <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:1 }}>{t.l}</div>
                    <div style={{ fontFamily:SANS, fontWeight:800, fontSize:14, color:'#fff' }}>{t.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { bg:`linear-gradient(135deg,${tk.primary},${tk.primaryDeep})`, ink:tk.primaryInk, label:T(lang,'একক যাত্রা টোকেন','Single journey token'), route:'metro-token', sub:T(lang,'৳ ২০ – ১০০','৳ 20 – 100') },
                { bg:`linear-gradient(135deg,#7c3aed,#5b21b6)`, ink:'#fff', label:T(lang,'র‍্যাপিড পাস','MRT Rapid Pass'), route:'metro-pass', sub:T(lang,'১০% ছাড়','10% discount') },
              ].map((c,i)=>(
                <button key={i} onClick={()=>onNav(c.route)} style={{ background:c.bg, color:c.ink, border:0, borderRadius:14, padding:'14px 18px', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14 }}>{c.label}</div>
                    <div style={{ fontFamily:SANS, fontSize:12, opacity:0.85, marginTop:2 }}>{c.sub}</div>
                  </div>
                  <Icon.arrowR s={18}/>
                </button>
              ))}
            </div>
          </div>

          {/* Station line map */}
          <div style={{ ...card(18), marginBottom:18, overflowX:'auto' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:14, flexWrap:'wrap' }}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,'স্টেশন মানচিত্র','Station map')} · MRT-6</div>
              <div style={{ fontFamily:BEN, fontSize:12, color: nearestMetro ? tk.primary : tk.textFaint, background: nearestMetro ? tk.primarySoft : tk.panelMuted, border:`1px solid ${nearestMetro ? tk.primary : tk.line}`, borderRadius:999, padding:'5px 10px', whiteSpace:'nowrap' }}>
                {nearestMetro
                  ? T(lang, `নিকটতম: ${nearestMetro.bn} · ${nearestDistance}`, `Nearest: ${nearestMetro.en} · ${nearestDistance}`)
                  : locationStatus === 'checking'
                    ? T(lang, 'লোকেশন দেখা হচ্ছে...', 'Checking location...')
                    : locationStatus === 'unsupported'
                      ? T(lang, 'এই ব্রাউজারে লোকেশন নেই', 'Location is not supported')
                      : T(lang, 'লোকেশন অনুমতি দিলে নিকটতম স্টেশন দেখাবে', 'Allow location to mark nearest station')}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'flex-start', gap:0, minWidth:isMobile?680:'auto', paddingBottom:8 }}>
              {DISPLAY_STATIONS.map((s,i)=>{
                const nearestIndex = nearestMetro?.index ?? -1;
                const isPast = nearestIndex >= 0 && i < nearestIndex;
                const isCurrent = i === nearestIndex;
                const isExtension = !s.active;
                return (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, minWidth:0, position:'relative' }}>
                    {i < DISPLAY_STATIONS.length-1 && (
                      <div style={{ position:'absolute', top:8, left:'50%', right:'-50%', height:3, background:isPast||isCurrent?tk.primary:isExtension?'rgba(245,158,11,0.45)':'rgba(255,255,255,0.1)', zIndex:0, borderTop:isExtension?'1px dashed #f59e0b':undefined }}/>
                    )}
                    <div style={{ width:isCurrent?20:12, height:isCurrent?20:12, borderRadius:999, background:isCurrent?'#fff':isExtension?'#f59e0b':isPast?tk.primary:'rgba(255,255,255,0.2)', border:isCurrent?`3px solid ${tk.primary}`:isExtension?'2px dashed #fff':'none', boxShadow:isCurrent?`0 0 0 6px ${tk.primary}44`:'none', zIndex:1, marginBottom:8, flexShrink:0 }}/>
                    <div style={{ fontFamily:BEN, fontSize:9, fontWeight:isCurrent?700:500, color:isCurrent?tk.text:tk.textFaint, textAlign:'center', transform:'rotate(-35deg)', transformOrigin:'top center', whiteSpace:'nowrap', marginTop:4 }}>
                      {T(lang,s.bn,s.en)}
                    </div>
                    {isCurrent && <div style={{ fontFamily:SANS, fontSize:8, color:tk.primary, fontWeight:800, marginTop:18, whiteSpace:'nowrap' }}>{T(lang,'নিকটতম','NEAREST')} · {nearestDistance}</div>}
                    <div style={{ fontFamily:SANS, fontSize:8, color:isExtension?'#f59e0b':tk.primary, fontWeight:700, marginTop:20 }}>{s.fare === null ? T(lang,'নির্মাণাধীন','Extension') : `৳${s.fare}`}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily:BEN,fontSize:11,color:tk.textFaint,marginTop:8 }}>
              {T(lang,'কমলাপুর DMTCL রুট এ্যালাইনমেন্টে আছে, কিন্তু বর্ধিতাংশ নির্মাণাধীন। সক্রিয় ভাড়া ক্যালকুলেটর উত্তরা উত্তর-মতিঝিল পর্যন্ত।','Kamalapur appears in DMTCL route alignment, but the extension is under construction. Fare calculator covers active Uttara North-Motijheel service.')}
            </div>
          </div>

          {/* Fare calculator with real station picker */}
          <div style={{ ...card(16), marginBottom:18 }}>
            <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:14 }}>{T(lang,'ভাড়া ক্যালকুলেটর','Fare Calculator')} 🎫</div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr auto', gap:10 }}>
              <div ref={fromRef} style={{ background:tk.inputBg, border:`1px solid ${fromFocus?tk.primary:tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, transition:'border-color 0.15s' }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.primarySoft, color:tk.primaryDeep, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>🚇</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'থেকে','From station')}</div>
                  <input value={fareFrom} onChange={e=>setFareFrom(e.target.value)} onFocus={()=>setFromFocus(true)} onBlur={()=>setTimeout(()=>setFromFocus(false),150)} placeholder={T(lang,'উত্তরা উত্তর','Uttara North')} style={{ background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text, width:'100%', marginTop:2 }}/>
                </div>
              </div>
              <div ref={toRef} style={{ background:tk.inputBg, border:`1px solid ${toFocus?tk.accent:tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, transition:'border-color 0.15s' }}>
                <div style={{ width:28, height:28, borderRadius:8, background:tk.accentSoft, color:tk.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>📍</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'পর্যন্ত','To station')}</div>
                  <input value={fareTo} onChange={e=>setFareTo(e.target.value)} onFocus={()=>setToFocus(true)} onBlur={()=>setTimeout(()=>setToFocus(false),150)} placeholder={T(lang,'মতিঝিল','Motijheel')} style={{ background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text, width:'100%', marginTop:2 }}/>
                </div>
              </div>
              {calcFare ? (
                <div style={{ background:`linear-gradient(135deg,${tk.primary},${tk.primaryDeep})`, color:tk.primaryInk, borderRadius:14, padding:'10px 18px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minWidth:100 }}>
                  <div style={{ fontFamily:SANS, fontWeight:800, fontSize:22, letterSpacing:-0.5 }}>৳ {calcFare.fare}</div>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, opacity:0.8, letterSpacing:1 }}>{calcFare.stops.toFixed(1)} km</div>
                </div>
              ) : (
                <div style={{ background:tk.panelMuted, border:`1px solid ${tk.line}`, borderRadius:14, padding:'10px 18px', display:'flex', alignItems:'center', justifyContent:'center', minWidth:100, color:tk.textFaint, fontFamily:SANS, fontSize:12, textAlign:'center' }}>
                  {T(lang,'২টি স্টেশন বেছে নিন','Select 2 stations')}
                </div>
              )}
            </div>
            {fromFocus && <SuggestionDropdown suggestions={filterStations(fareFrom)} onSelect={s=>{setFareFrom(s.label);setFromFocus(false);}} onDismiss={()=>setFromFocus(false)} tk={tk} lang={lang} anchorRef={fromRef}/>}
            {toFocus && <SuggestionDropdown suggestions={filterStations(fareTo)} onSelect={s=>{setFareTo(s.label);setToFocus(false);}} onDismiss={()=>setToFocus(false)} tk={tk} lang={lang} anchorRef={toRef}/>}
          </div>

          {/* Info grid */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:10, marginBottom:18 }}>
            {[
              {ic:'⏰',t:T(lang,'অপারেটিং','Operating'),v:'06:30-22:10'},
              {ic:'🧭',t:T(lang,'সক্রিয় রুট','Active route'),v:T(lang,'উত্তরা উত্তর-মতিঝিল','Uttara North-Motijheel')},
              {ic:'🎫',t:T(lang,'ভাড়া','Fare'),v:'৳ 20 – 100'},
              {ic:'👥',t:T(lang,'গড় যাত্রী','Avg. riders'),v:'318,162/day'},
            ].map((s,i)=>(
              <div key={i} style={card(14)}>
                <div style={{ fontSize:22 }}>{s.ic}</div>
                <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color:tk.textFaint, letterSpacing:1.2, textTransform:'uppercase', marginTop:6 }}>{s.t}</div>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginTop:2 }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:14, marginBottom:18 }}>
            <div style={card(16)}>
              <div style={{ fontFamily:BEN,fontWeight:800,fontSize:15,color:tk.text,marginBottom:10 }}>{T(lang,'DMTCL অফিসিয়াল তথ্য','DMTCL official information')}</div>
              {[
                T(lang,'MRT Line-6 উত্তরা উত্তর থেকে মতিঝিল পর্যন্ত ২০.১০ কিমি, ১৬টি সক্রিয় স্টেশন।','MRT Line-6 operates 20.10 km from Uttara North to Motijheel with 16 active stations.'),
                T(lang,'মতিঝিল-কমলাপুর ১.১৬ কিমি বর্ধিতাংশ ৩১ মার্চ ২০২৬ পর্যন্ত ৭৩.২৫% সম্পন্ন।','Motijheel-Kamalapur 1.16 km extension was 73.25% complete as of 31 Mar 2026.'),
                T(lang,'জানুয়ারি-মার্চ ২০২৬: প্রতিদিন গড়ে ৩,১৮,১৬২ যাত্রী।','Jan-Mar 2026: 318,162 average daily riders.'),
                T(lang,`DMTCL সাইট শেষ হালনাগাদ: ${DMTCL_UPDATED}`,`DMTCL site last updated: ${DMTCL_UPDATED}`),
              ].map((line,i)=>(
                <div key={i} style={{ display:'flex',gap:9,padding:'7px 0',borderTop:i?`1px solid ${tk.line}`:0 }}>
                  <span style={{ color:tk.primary,fontWeight:900 }}>•</span>
                  <span style={{ fontFamily:BEN,fontSize:12,color:tk.textDim,lineHeight:1.55 }}>{line}</span>
                </div>
              ))}
            </div>
            <div style={card(16)}>
              <div style={{ fontFamily:BEN,fontWeight:800,fontSize:15,color:tk.text,marginBottom:10 }}>{T(lang,'DMTCL লিংক ও নোটিশ','DMTCL links & notices')}</div>
              {DMTCL_LINKS.map(link=>(
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,padding:'8px 0',borderTop:`1px solid ${tk.line}`,fontFamily:BEN,fontSize:12,color:tk.primary,textDecoration:'none' }}>
                  {T(lang,link.bn,link.en)}
                  <Icon.arrowR s={13}/>
                </a>
              ))}
              <div style={{ height:8 }} />
              {DMTCL_NOTICES.map(n=>(
                <a key={n.href} href={n.href} target="_blank" rel="noreferrer" style={{ display:'block',padding:'8px 0',borderTop:`1px solid ${tk.line}`,fontFamily:BEN,fontSize:12,color:tk.textDim,textDecoration:'none' }}>
                  <strong style={{ color:tk.text }}>{n.date}</strong> · {T(lang,n.bn,n.en)}
                </a>
              ))}
              <div style={{ marginTop:8,fontFamily:BEN,fontSize:11,color:tk.textFaint }}>
                {T(lang,'DMTCL খবর পেজে বর্তমানে কোনো প্রকাশিত খবর পাওয়া যায়নি।','DMTCL news page currently shows no published news.')}
              </div>
            </div>
          </div>

          <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
        </div>
      </div>
    </PageShell>
  );
}
