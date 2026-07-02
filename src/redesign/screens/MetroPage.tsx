import React, { useState, useRef, useMemo, useEffect } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn, N, Fare } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot, NativeAdCard, AdCluster } from '../components/AdSlot';
import { PromoBanner } from '../components/PromoBanner';
import { SectionHeader } from '../components/SectionHeader';
import { Icon } from '../components/Icons';
import { ModeHero } from '../components/ModeHero';
import { METRO_STATIONS, METRO_LINES } from '../../../constants';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

// MRT-6 stations in order with fare from Uttara North
const MRT6_LINE = METRO_LINES['mrt_6'];
const STATIONS = MRT6_LINE
  ? MRT6_LINE.stations.map((id, i) => {
      const s = METRO_STATIONS[id];
      const fare = i === 0 ? 0 : Math.min(20 + Math.floor(i / 2) * 10, 100);
      return { id, bn: s?.bnName ?? id, en: (s?.name ?? id).replace(' Metro Station',''), fare, desc: s?.description ?? '', lat: s?.lat, lng: s?.lng };
    })
  : [
      {id:'uttara-north',bn:'উত্তরা উত্তর',en:'Uttara North',fare:0,desc:'',lat:23.8759,lng:90.3795},{id:'uttara-center',bn:'উত্তরা কেন্দ্র',en:'Uttara Center',fare:20,desc:'',lat:23.8706,lng:90.3842},
      {id:'uttara-south',bn:'উত্তরা দক্ষিণ',en:'Uttara South',fare:20,desc:'',lat:23.8631,lng:90.3891},{id:'pallabi',bn:'পল্লবী',en:'Pallabi',fare:30,desc:'',lat:23.8268,lng:90.3654},
      {id:'mirpur-11',bn:'মিরপুর ১১',en:'Mirpur 11',fare:40,desc:'',lat:23.8190,lng:90.3659},{id:'mirpur-10',bn:'মিরপুর ১০',en:'Mirpur 10',fare:50,desc:'',lat:23.8067,lng:90.3686},
      {id:'kazipara',bn:'কাজীপাড়া',en:'Kazipara',fare:60,desc:'',lat:23.7981,lng:90.3712},{id:'shewrapara',bn:'শেওড়াপাড়া',en:'Shewrapara',fare:60,desc:'',lat:23.7904,lng:90.3752},
      {id:'agargaon',bn:'আগারগাঁও',en:'Agargaon',fare:70,desc:'',lat:23.7783,lng:90.3808},{id:'bijoy-sarani',bn:'বিজয় সরণি',en:'Bijoy Sarani',fare:80,desc:'',lat:23.7668,lng:90.3869},
      {id:'farmgate',bn:'ফার্মগেট',en:'Farmgate',fare:80,desc:'',lat:23.7573,lng:90.3896},{id:'karwan-bazar',bn:'কারওয়ান বাজার',en:'Karwan Bazar',fare:90,desc:'',lat:23.7516,lng:90.3930},
      {id:'shahbagh',bn:'শাহবাগ',en:'Shahbagh',fare:90,desc:'',lat:23.7384,lng:90.3957},{id:'du',bn:'ঢাবি',en:'DU',fare:90,desc:'',lat:23.7337,lng:90.3939},
      {id:'secretariat',bn:'সচিবালয়',en:'Secretariat',fare:100,desc:'',lat:23.7297,lng:90.4069},{id:'motijheel',bn:'মতিঝিল',en:'Motijheel',fare:100,desc:'',lat:23.7330,lng:90.4172},
      {id:'kamalapur',bn:'কমলাপুর',en:'Kamalapur',fare:100,desc:'',lat:23.7320,lng:90.4262},
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
  const [hasSearched, setHasSearched] = useState(false);
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
    if (localStorage.getItem('kj-location-consent') !== 'yes') return;
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
    return STATIONS
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
    const diff = Math.abs(fi - ti);
    const fare = Math.min(20 + Math.floor(diff / 2) * 10, 100);
    return { fare, stops: diff };
  }, [fareFrom, fareTo]);

  const nearestName = nearestMetro ? T(lang, nearestMetro.bn, nearestMetro.en) : T(lang, 'নিকটতম স্টেশন', 'nearest station');
  const nearestDistance = nearestMetro ? (nearestMetro.distance < 1 ? `${Math.round(nearestMetro.distance * 1000)} m` : `${nearestMetro.distance.toFixed(1)} km`) : '';

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'0 0 80px':'0 0 48px' }}>
        <ModeHero tk={tk} isMobile={isMobile} lang={lang} kind="train"
          gradient="linear-gradient(135deg, #00130e 0%, #00543c 50%, #10b981 100%)"
          title={T(lang,'ঢাকা মেট্রো · MRT-6 লাইভ','Dhaka Metro · MRT-6 live')}
          subtitle={T(lang,'উত্তরা থেকে কমলাপুর পর্যন্ত ১৭টি স্টেশন · প্রতি ৮ মিনিটে ট্রেন · ৪৫ মিনিটে পুরো লাইন।','17 stations from Uttara to Kamalapur · trains every 8 min · 45 min end-to-end.')}
          stats={[{v:N(17,lang),l:T(lang,'স্টেশন','Stations')},{v:N(8,lang)+' min',l:T(lang,'ফ্রিকোয়েন্সি','Frequency')},{v:'৳ '+N('20',lang)+'-'+N(100,lang),l:T(lang,'ভাড়া','Fare range')},{v:N('7',lang)+'am–'+N(9,lang)+'pm',l:T(lang,'চলমান','Operating')}]}
        />

        <div style={{ padding:isMobile?'0 16px':'0 40px' }}>
          {/* Next train + ticket cards */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.4fr 1fr', gap:14, marginBottom:18 }}>
            <div style={{ background:'linear-gradient(135deg,#00130e,#00543c)', borderRadius:18, padding:20, color:'#fff', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', right:-40, top:-40, width:160, height:160, borderRadius:999, background:'rgba(16,185,129,0.25)' }} className="kj-anim-pulse"/>
              <div style={{ fontFamily:SANS, fontSize:11, fontWeight:700, letterSpacing:1.4, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', marginBottom:8 }}>{T(lang,'পরবর্তী ট্রেন','Next train')} · {nearestName}</div>
              <div style={{ fontFamily:SANS, fontWeight:800, fontSize:isMobile?48:56, color:'#fff', letterSpacing:-2, lineHeight:1 }}>{N('2:15', lang)}</div>
              <div style={{ fontFamily:BEN, fontSize:13, color:'rgba(255,255,255,0.7)', marginTop:6 }}>{T(lang,'উত্তরা উত্তর → মতিঝিল','Uttara North → Motijheel')}</div>
              <div style={{ display:'flex', gap:12, marginTop:14 }}>
                {[{l:T(lang,'পরের ট্রেন','After'),v:N('10:08',lang)},{l:T(lang,'তার পর','Then'),v:N('10:16',lang)}].map((t,i)=>(
                  <div key={i} style={{ background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'8px 12px' }}>
                    <div style={{ fontFamily:SANS, fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:1 }}>{t.l}</div>
                    <div style={{ fontFamily:SANS, fontWeight:800, fontSize:14, color:'#fff' }}>{t.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { bg:`linear-gradient(135deg,${tk.primary},${tk.primaryDeep})`, ink:tk.primaryInk, label:T(lang,'একক যাত্রা টোকেন','Single journey token'), route:'metro-token', sub:T(lang,'৳ ২০ – ১০০','৳ '+N(20,lang)+' – '+N(100,lang)) },
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
            <div style={{ display:'flex', alignItems:'flex-start', gap:0, minWidth:isMobile?600:'auto', paddingBottom:8 }}>
              {STATIONS.map((s,i)=>{
                const nearestIndex = nearestMetro?.index ?? -1;
                const isPast = nearestIndex >= 0 && i < nearestIndex;
                const isCurrent = i === nearestIndex;
                return (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, minWidth:0, position:'relative' }}>
                    {i < STATIONS.length-1 && (
                      <div style={{ position:'absolute', top:8, left:'50%', right:'-50%', height:3, background:isPast||isCurrent?tk.primary:'rgba(255,255,255,0.1)', zIndex:0 }}/>
                    )}
                    <div style={{ width:isCurrent?20:12, height:isCurrent?20:12, borderRadius:999, background:isCurrent?'#fff':isPast?tk.primary:'rgba(255,255,255,0.2)', border:isCurrent?`3px solid ${tk.primary}`:'none', boxShadow:isCurrent?`0 0 0 6px ${tk.primary}44`:'none', zIndex:1, marginBottom:8, flexShrink:0 }}/>
                    <div style={{ fontFamily:BEN, fontSize:9, fontWeight:isCurrent?700:500, color:isCurrent?tk.text:tk.textFaint, textAlign:'center', transform:'rotate(-35deg)', transformOrigin:'top center', whiteSpace:'nowrap', marginTop:4 }}>
                      {T(lang,s.bn,s.en)}
                    </div>
                    {isCurrent && <div style={{ fontFamily:SANS, fontSize:8, color:tk.primary, fontWeight:800, marginTop:18, whiteSpace:'nowrap' }}>{T(lang,'নিকটতম','NEAREST')} · {nearestDistance}</div>}
                    <div style={{ fontFamily:SANS, fontSize:8, color:tk.primary, fontWeight:700, marginTop:20 }}>{Fare(s.fare, lang)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <NativeAdCard
            tk={tk}
            lang={lang}
            kind={isMobile?'mob-banner':'leaderboard'}
            title={T(lang, 'মেট্রো যাত্রীদের জন্য অফার', 'Offers for metro riders')}
            icon="🚇"
          />

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
              {hasSearched && calcFare ? (
                <div style={{ background:`linear-gradient(135deg,${tk.primary},${tk.primaryDeep})`, color:tk.primaryInk, borderRadius:14, padding:'10px 18px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minWidth:100 }}>
                  <div style={{ fontFamily:SANS, fontWeight:800, fontSize:22, letterSpacing:-0.5 }}>{Fare(calcFare.fare, lang)}</div>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, opacity:0.8, letterSpacing:1 }}>{N(calcFare.stops, lang)} {T(lang,'স্টেশন','STOPS')}</div>
                </div>
              ) : (
                <button disabled={!(fareFrom && fareTo)} onClick={()=>{ if (fareFrom && fareTo) setHasSearched(true); }}
                  style={{ background: fareFrom && fareTo ? `linear-gradient(135deg,${tk.primary},${tk.primaryDeep})` : tk.panelMuted, border: fareFrom && fareTo ? 'none' : `1px solid ${tk.line}`, borderRadius:14, padding:'10px 18px', cursor: fareFrom && fareTo ? 'pointer' : 'not-allowed', minWidth:100, color: fareFrom && fareTo ? tk.primaryInk : tk.textFaint, fontFamily:SANS, fontSize:12, fontWeight:700, textAlign:'center', opacity: fareFrom && fareTo ? 1 : 0.6 }}>
                  {T(lang,'ভাড়া দেখুন','Check Fare')}
                </button>
              )}
            </div>
            {fromFocus && <SuggestionDropdown suggestions={filterStations(fareFrom)} onSelect={s=>{setFareFrom(s.label);setFromFocus(false);setHasSearched(false);}} onDismiss={()=>setFromFocus(false)} tk={tk} lang={lang} anchorRef={fromRef}/>}
            {toFocus && <SuggestionDropdown suggestions={filterStations(fareTo)} onSelect={s=>{setFareTo(s.label);setToFocus(false);setHasSearched(false);}} onDismiss={()=>setToFocus(false)} tk={tk} lang={lang} anchorRef={toRef}/>}
          </div>

          <NativeAdCard
            tk={tk}
            lang={lang}
            kind="in-article"
            title={T(lang, 'সংশ্লিষ্ট বিষয়বস্তু', 'Related content')}
            subtitle={T(lang, 'মেট্রো ও গণপরিবহন', 'Metro & public transit')}
            icon="📰"
          />

          {/* Info grid */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)', gap:10, marginBottom:18 }}>
            {[
              {ic:'⏰',t:T(lang,'অপারেটিং','Operating'),v:N('7:10',lang)+' AM – '+N('9:40',lang)+' PM'},
              {ic:'🗓',t:T(lang,'ছুটির দিন','Off day'),v:T(lang,'শুক্রবার সকাল','Fri morning')},
              {ic:'🎫',t:T(lang,'ভাড়া','Fare'),v:'৳ '+N(20,lang)+' – '+N(100,lang)},
              {ic:'⚡',t:T(lang,'সর্বোচ্চ গতি','Top speed'),v:N(100,lang)+' km/h'},
            ].map((s,i)=>(
              <div key={i} style={card(14)}>
                <div style={{ fontSize:22 }}>{s.ic}</div>
                <div style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color:tk.textFaint, letterSpacing:1.2, textTransform:'uppercase', marginTop:6 }}>{s.t}</div>
                <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginTop:2 }}>{s.v}</div>
              </div>
            ))}
          </div>

          <PromoBanner tk={tk} lang={lang} page="metro" onNav={onNav}/>
          <NativeAdCard
            tk={tk}
            lang={lang}
            kind="multiplex"
            title={T(lang, 'আরও দেখুন', 'You might also like')}
            subtitle={T(lang, 'সম্পর্কিত ভ্রমণ ও পরিবহন', 'Related travel & transport')}
            icon="🧭"
          />
        </div>
      </div>
          <AdCluster tk={tk} lang={lang} count={2} isMobile={isMobile}/>
    </PageShell>
  );
}
