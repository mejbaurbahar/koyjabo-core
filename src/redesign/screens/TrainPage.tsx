import React, { useState, useMemo, useRef } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn, N, Fare } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { PromoBanner } from '../components/PromoBanner';
import { SectionHeader } from '../components/SectionHeader';
import { Icon } from '../components/Icons';
import { ModeHero } from '../components/ModeHero';
import { Stars } from '../components/Stars';
import { BD_TRAIN_ROUTES, TRAIN_STATIONS } from '../../../data/bangladeshTrainData';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';
import { useLocationSearch } from '../../../hooks/useLocationSearch';
import { earnCoins } from '../utils/koyCoinService';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

type Tab = 'eticket' | 'pnr' | 'routemap';

const stationName = (id: string) => TRAIN_STATIONS[id]?.name ?? id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const stationBnName = (id: string) => TRAIN_STATIONS[id]?.bnName ?? stationName(id);

const routeIncludes = (r: typeof BD_TRAIN_ROUTES[number], q: string) => {
  const lq = q.toLowerCase().trim();
  if (!lq) return true;
  const routeText = [
    r.name, r.bnName, r.number, r.from, r.to, stationName(r.from), stationName(r.to), stationBnName(r.from), stationBnName(r.to),
    ...r.stops.flatMap(id => [id, stationName(id), stationBnName(id)]),
  ].join(' ').toLowerCase();
  return routeText.includes(lq);
};

const TRAINS = BD_TRAIN_ROUTES.map(r => ({
  source: r,
  num: r.number,
  bn: r.bnName,
  en: r.name,
  rbn: `${stationBnName(r.from)} → ${stationBnName(r.to)}`,
  ren: `${stationName(r.from)} → ${stationName(r.to)}`,
  dep: r.dhakaDepart ?? '—',
  arr: r.destinationArrive ?? '—',
  dur: r.distanceKm ? `${r.distanceKm} km` : '—',
  fare: r.fare ? `${r.fare.shuvan}–${r.fare.acBerth ?? r.fare.snigdha}` : '—',
  off: r.offDay || 'নেই/None',
  col: [r.color ?? '#3b82f6', '#1e3a5f'] as [string, string],
  rating: 4.3,
  n: 0,
}));

const FEATURED_TRAIN_IDS = [
  'coxs-bazar-express-813',
  'suborno-express-701',
  'sonar-bangla-express-787',
  'parabat-express-709',
  'jahanabad-express-825',
];

// Official seat classes from Bangladesh Railway API (handshake)
const COACHES = [
  { l:'AC Berth',      bn:'এসি বার্থ',   c:'#7c3aed', fare:'৳ 2,656', n:'AC_B', e:'🛏️' },
  { l:'AC Seat',       bn:'এসি সিট',     c:'#6366f1', fare:'৳ 1,980', n:'AC_S', e:'💺' },
  { l:'Snigdha',       bn:'স্নিগ্ধা',    c:'#3b82f6', fare:'৳ 1,591', n:'SNIGDHA', e:'🪑' },
  { l:'First Berth',   bn:'প্রথম বার্থ', c:'#10b981', fare:'৳ 1,200', n:'F_BERTH', e:'🛋️' },
  { l:'AC Chair',      bn:'এসি চেয়ার',  c:'#0ea5e9', fare:'৳ 980',   n:'AC_CHAIR', e:'🪑' },
  { l:'Shovon Chair',  bn:'শোভন চেয়ার', c:'#f59e0b', fare:'৳ 535',   n:'S_CHAIR', e:'🎫' },
  { l:'Shovon',        bn:'শোভন',        c:'#6b7280', fare:'৳ 405',   n:'SHOVAN', e:'🧳' },
  { l:'Shulov',        bn:'সুলভ',        c:'#84cc16', fare:'৳ 185',   n:'SHULOV', e:'🎟️' },
];

const MAJOR_STATIONS = Object.values(TRAIN_STATIONS).slice(0, 12);

export function TrainPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (p=16): React.CSSProperties => ({ background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:16, padding:p });

  const [activeTab, setActiveTab] = useState<Tab>('eticket');
  const [fromStation, setFromStation] = useState(params?.from ?? '');
  const [toStation, setToStation] = useState(params?.to ?? params?.search ?? '');
  const [hasSearched, setHasSearched] = useState(!!(params?.from || params?.to || params?.search));
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // PNR tab state
  const [pnrInput, setPnrInput] = useState('');

  // Train name search (top bar) state
  const [trainSearch, setTrainSearch] = useState('');
  const [trainSearchFocused, setTrainSearchFocused] = useState(false);

  // Route map: selected train
  const [routeMapTrain, setRouteMapTrain] = useState<typeof TRAINS[0] | null>(null);
  const [routeMapSearch, setRouteMapSearch] = useState('');

  const { suggestions: fromStationSuggs } = useLocationSearch(fromStation, { limit: 20, categories: ['railway_station'] });
  const { suggestions: toStationSuggs } = useLocationSearch(toStation, { limit: 20, categories: ['railway_station'] });
  const filterStations = (q: string, side: 'from' | 'to') =>
    (side === 'from' ? fromStationSuggs : toStationSuggs) as Suggestion[];

  // E-ticket tab: filter by FROM/TO
  const filteredTrains = useMemo(() => {
    const fromQ = fromStation.toLowerCase();
    const toQ = toStation.toLowerCase();
    if (!hasSearched || (!fromQ && !toQ)) {
      const featured = FEATURED_TRAIN_IDS
        .map(id => TRAINS.find(t => t.source.id === id))
        .filter((t): t is typeof TRAINS[number] => !!t);
      return featured.length ? featured : TRAINS.slice(0, 5);
    }
    return TRAINS.filter(r => routeIncludes(r.source, fromQ) && routeIncludes(r.source, toQ));
  }, [fromStation, toStation, hasSearched]);

  // Top search bar: filter by name/number
  const trainSearchResults = useMemo(() => {
    const q = trainSearch.toLowerCase().trim();
    if (!q) return [];
    return TRAINS.filter(t =>
      t.en.toLowerCase().includes(q) ||
      t.bn.includes(q) ||
      t.num.toLowerCase().includes(q) ||
      t.ren.toLowerCase().includes(q) ||
      t.rbn.includes(q)
    ).slice(0, 8);
  }, [trainSearch]);

  // Route map search
  const routeMapResults = useMemo(() => {
    const q = routeMapSearch.toLowerCase().trim();
    if (!q) return TRAINS.slice(0, 15);
    return TRAINS.filter(t =>
      t.en.toLowerCase().includes(q) || t.bn.includes(q) || t.num.includes(q)
    ).slice(0, 15);
  }, [routeMapSearch]);

  const hasTrainSearch = hasSearched && Boolean(fromStation.trim() || toStation.trim());

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'eticket', label: T(lang,'ই-টিকেট','E-ticket'), icon: '🚆' },
    { id: 'pnr',     label: 'PNR',                          icon: '🔍' },
    { id: 'routemap',label: T(lang,'রুট ম্যাপ','Route map'), icon: '🛤' },
  ];

  const btnStyle = (active: boolean): React.CSSProperties => ({
    ...chipBtn(tk),
    background: active ? tk.text : tk.panel,
    color: active ? tk.bg : tk.text,
    borderColor: active ? tk.text : tk.line,
    fontWeight: active ? 700 : 500,
  });

  // ── Render tab content ──────────────────────────────────────────────────────

  // PNR tab
  const renderPNR = () => (
    <div style={card(20)}>
      <div style={{ fontFamily:BEN, fontWeight:700, fontSize:16, color:tk.text, marginBottom:6 }}>
        {T(lang,'পিএনআর যাচাই করুন','Verify your PNR')}
      </div>
      <div style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint, marginBottom:18 }}>
        {T(lang,'আপনার ই-টিকেটের PNR নম্বর দিন। বাংলাদেশ রেলওয়ের অফিসিয়াল সাইটে যাচাই হবে।',
          'Enter the PNR number from your e-ticket. Verification done on Bangladesh Railway official site.')}
      </div>
      <div style={{ background:tk.inputBg, border:`1.5px solid ${tk.primary}`, borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <span style={{ fontSize:20 }}>🎟️</span>
        <input
          value={pnrInput}
          onChange={e => setPnrInput(e.target.value.toUpperCase())}
          placeholder={T(lang,'PNR নম্বর লিখুন (যেমন: PNR1234567)','Enter PNR number (e.g. PNR1234567)')}
          style={{ flex:1, background:'transparent', border:'none', outline:'none', fontFamily:SANS, fontWeight:700, fontSize:16, color:tk.text, letterSpacing:2 }}
          maxLength={20}
          onKeyDown={e => {
            if (e.key === 'Enter' && pnrInput.trim()) {
              window.open('https://eticket.railway.gov.bd/verify-ticket', '_blank');
            }
          }}
        />
        {pnrInput && <button onClick={() => setPnrInput('')} style={{ background:'none', border:'none', color:tk.textFaint, cursor:'pointer', fontSize:16, padding:4 }}>✕</button>}
      </div>
      <button
        onClick={() => {
          if (!pnrInput.trim()) return;
          window.open('https://eticket.railway.gov.bd/verify-ticket', '_blank');
        }}
        style={{ width:'100%', background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', border:0, borderRadius:14, padding:'14px', fontFamily:SANS, fontWeight:700, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 8px 22px -10px #7c3aed', opacity: pnrInput.trim() ? 1 : 0.5 }}
      >
        🔍 {T(lang,'PNR যাচাই করুন','Verify PNR')}
      </button>
      <div style={{ marginTop:14, padding:'12px 14px', background:tk.panelMuted, borderRadius:12, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:18 }}>ℹ️</span>
        <div>
          <div style={{ fontFamily:SANS, fontWeight:600, fontSize:12, color:tk.textDim }}>{T(lang,'PNR কোথায় পাবেন?','Where to find PNR?')}</div>
          <div style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint, marginTop:2 }}>{T(lang,'ই-টিকেট বুকিং কনফার্মেশন SMS বা ইমেইলে PNR নম্বর থাকে।','PNR number is in your e-ticket booking confirmation SMS or email.')}</div>
        </div>
      </div>
      <div style={{ marginTop:12, textAlign:'center' }}>
        <a href="https://eticket.railway.gov.bd/verify-ticket" target="_blank" rel="noopener noreferrer" style={{ fontFamily:SANS, fontSize:12, color:tk.primary, textDecoration:'underline' }}>
          {T(lang,'সরাসরি সাইটে যান →','Go directly to site →')}
        </a>
      </div>
    </div>
  );

  // Live tab
  const renderLive = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={card(20)}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#ef4444,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>📍</div>
          <div>
            <div style={{ fontFamily:BEN, fontWeight:700, fontSize:16, color:tk.text }}>{T(lang,'লাইভ ট্রেন ট্র্যাকিং','Live Train Tracking')}</div>
            <div style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint, marginTop:2 }}>{T(lang,'বাংলাদেশ রেলওয়ে অফিসিয়াল লাইভ ট্র্যাকার','Bangladesh Railway official live tracker')}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#ef444422', borderRadius:10, padding:'8px 12px', marginBottom:14 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444', display:'inline-block', animation:'pulse 1.5s infinite' }}/>
          <span style={{ fontFamily:SANS, fontSize:12, color:'#ef4444', fontWeight:600 }}>{T(lang,'লাইভ ট্র্যাকিং চালু আছে','Live tracking is active')}</span>
        </div>
        <button
          onClick={() => window.open('https://eticket.railway.gov.bd/train-tracking', '_blank')}
          style={{ width:'100%', background:'linear-gradient(135deg,#ef4444,#f97316)', color:'#fff', border:0, borderRadius:14, padding:'14px', fontFamily:SANS, fontWeight:700, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 8px 22px -10px #ef4444', marginBottom:10 }}
        >
          📍 {T(lang,'লাইভ ট্র্যাকার খুলুন','Open Live Tracker')}
        </button>
        <div style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint, textAlign:'center' }}>
          {T(lang,'বাংলাদেশ রেলওয়ের অফিসিয়াল সাইটে লাইভ পজিশন দেখুন','View live position on Bangladesh Railway official site')}
        </div>
      </div>

      {/* Quick-track by train */}
      <div style={card(16)}>
        <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:12 }}>
          {T(lang,'দ্রুত ট্র্যাক করুন','Quick Track by Train')}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {TRAINS.slice(0, 8).map(t => (
            <div key={t.source.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:tk.panelMuted, borderRadius:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${t.col[0]},${t.col[1]})`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SANS, fontWeight:800, fontSize:11, flexShrink:0 }}>{t.num}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:BEN, fontWeight:600, fontSize:13, color:tk.text }}>{T(lang,t.bn,t.en)}</div>
                <div style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint }}>{T(lang,t.rbn,t.ren)}</div>
              </div>
              <button
                onClick={() => window.open(`https://eticket.railway.gov.bd/train-tracking`, '_blank')}
                style={{ background:`${t.col[0]}22`, color:t.col[0], border:`1px solid ${t.col[0]}44`, borderRadius:8, padding:'5px 12px', fontFamily:SANS, fontWeight:700, fontSize:11, cursor:'pointer', flexShrink:0 }}
              >
                {T(lang,'ট্র্যাক','Track')} →
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop:10, textAlign:'center' }}>
          <a href="https://eticket.railway.gov.bd/train-tracking" target="_blank" rel="noopener noreferrer" style={{ fontFamily:SANS, fontSize:12, color:tk.primary, textDecoration:'underline' }}>
            {T(lang,'সব ট্রেন ট্র্যাক করুন →','Track all trains →')}
          </a>
        </div>
      </div>
    </div>
  );

  // Route map tab — fully inline, no external redirects
  const renderRouteMap = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Search */}
      <div style={card(16)}>
        <div style={{ background:tk.inputBg, border:`1px solid ${tk.line}`, borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <Icon.search s={14}/>
          <input
            value={routeMapSearch}
            onChange={e => setRouteMapSearch(e.target.value)}
            placeholder={T(lang,'ট্রেন নাম বা নম্বর খুঁজুন...','Search train name or number...')}
            style={{ flex:1, background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:13, color:tk.text }}
          />
          {routeMapSearch && (
            <button onClick={() => setRouteMapSearch('')} style={{ background:'none', border:'none', color:tk.textFaint, cursor:'pointer', fontSize:14, lineHeight:1, padding:0 }}>✕</button>
          )}
        </div>

        {/* Train list */}
        <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:300, overflowY:'auto' }}>
          {routeMapResults.length === 0 && (
            <div style={{ textAlign:'center', padding:'24px 0', color:tk.textFaint, fontFamily:BEN, fontSize:13 }}>
              {T(lang,'কোনো ট্রেন পাওয়া যায়নি','No trains found')}
            </div>
          )}
          {routeMapResults.map(t => (
            <div
              key={t.source.id}
              onClick={() => setRouteMapTrain(routeMapTrain?.source.id === t.source.id ? null : t)}
              style={{ padding:'10px 12px', background: routeMapTrain?.source.id === t.source.id ? `${t.col[0]}22` : tk.panelMuted, border:`1.5px solid ${routeMapTrain?.source.id === t.source.id ? t.col[0] : 'transparent'}`, borderRadius:10, cursor:'pointer', transition:'all 0.15s' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${t.col[0]},${t.col[1]})`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SANS, fontWeight:800, fontSize:11, flexShrink:0 }}>{t.num}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:BEN, fontWeight:600, fontSize:13, color:tk.text }}>{T(lang,t.bn,t.en)}</div>
                  <div style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint }}>{T(lang,t.rbn,t.ren)}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:SANS, fontSize:10, color:t.col[0], fontWeight:700 }}>{N(t.source.stops.length, lang)} {T(lang,'স্টপ','stops')}</div>
                  <div style={{ fontFamily:SANS, fontSize:9, color:tk.textFaint }}>{t.dur}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full inline route map when a train is selected */}
      {routeMapTrain && (
        <div style={card(16)}>
          {/* Train header */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, paddingBottom:14, borderBottom:`1px solid ${tk.line}` }}>
            <div style={{ width:44, height:44, borderRadius:10, background:`linear-gradient(135deg,${routeMapTrain.col[0]},${routeMapTrain.col[1]})`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SANS, fontWeight:800, fontSize:14, flexShrink:0 }}>{routeMapTrain.num}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:15, color:tk.text }}>{T(lang,routeMapTrain.bn,routeMapTrain.en)}</div>
              <div style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint, marginTop:2 }}>{T(lang,routeMapTrain.rbn,routeMapTrain.ren)} · {routeMapTrain.dur} · {T(lang,'ছুটি','Off')}: {routeMapTrain.off}</div>
            </div>
          </div>

          {/* Key stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
            {[
              { l:T(lang,'ছাড়ে','Departs'), v:routeMapTrain.dep, icon:'🕐' },
              { l:T(lang,'পৌঁছায়','Arrives'), v:routeMapTrain.arr, icon:'🏁' },
              { l:T(lang,'ন্যূনতম ভাড়া','Min fare'), v:'৳'+N(routeMapTrain.fare,lang), icon:'💰' },
            ].map((s,i) => (
              <div key={i} style={{ background:tk.panelMuted, borderRadius:10, padding:'8px 10px', textAlign:'center' }}>
                <div style={{ fontSize:16, marginBottom:3 }}>{s.icon}</div>
                <div style={{ fontFamily:SANS, fontWeight:700, fontSize:12, color:tk.text }}>{s.v}</div>
                <div style={{ fontFamily:SANS, fontSize:9, color:tk.textFaint }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Full station timeline */}
          <div style={{ fontFamily:BEN, fontWeight:700, fontSize:13, color:tk.text, marginBottom:12 }}>
            🛤 {T(lang,'সম্পূর্ণ রুট','Full Route')} — {N(routeMapTrain.source.routeStops.length || routeMapTrain.source.stops.length, lang)} {T(lang,'স্টেশন','stations')}
          </div>
          <div style={{ maxHeight:480, overflowY:'auto', paddingRight:4 }}>
            {(routeMapTrain.source.routeStops.length > 0
              ? routeMapTrain.source.routeStops
              : routeMapTrain.source.stops.map(id => ({ city:id, label:stationName(id), arrival:'', departure:'', halt:'', duration:'' }))
            ).map((stop, idx, arr) => {
              const isFirst = idx === 0;
              const isLast = idx === arr.length - 1;
              const hasHalt = stop.halt && stop.halt !== '---' && stop.halt !== '';
              const timeToShow = isFirst ? stop.departure : isLast ? stop.arrival : (stop.arrival || stop.departure);
              const depTime = !isFirst && !isLast && stop.departure && stop.departure !== stop.arrival ? stop.departure : '';
              return (
                <div key={stop.city + idx} style={{ display:'flex', gap:12, paddingBottom: isLast ? 0 : 2, position:'relative', minHeight:42 }}>
                  {/* Left: dot + line */}
                  <div style={{ width:24, flexShrink:0, position:'relative', display:'flex', flexDirection:'column', alignItems:'center' }}>
                    {!isLast && (
                      <div style={{ position:'absolute', top:isFirst ? 20 : 16, bottom:0, width:2, background:`linear-gradient(${routeMapTrain.col[0]},${routeMapTrain.col[1]})`, opacity:0.25 }}/>
                    )}
                    <div style={{
                      width: isFirst||isLast ? 18 : hasHalt ? 12 : 8,
                      height: isFirst||isLast ? 18 : hasHalt ? 12 : 8,
                      borderRadius:999,
                      marginTop: isFirst ? 6 : 8,
                      background: isFirst ? routeMapTrain.col[0] : isLast ? routeMapTrain.col[1] : hasHalt ? `${routeMapTrain.col[0]}88` : tk.line,
                      border:`2px solid ${isFirst||isLast||hasHalt ? routeMapTrain.col[0] : tk.line}`,
                      flexShrink:0,
                      zIndex:1,
                    }}/>
                  </div>
                  {/* Right: station info */}
                  <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'space-between', paddingBottom:10, borderBottom: isLast ? 'none' : `1px dashed ${tk.line}22` }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        <span style={{ fontFamily:BEN, fontWeight: isFirst||isLast||hasHalt ? 700 : 400, fontSize: isFirst||isLast ? 14 : 13, color: isFirst||isLast ? tk.text : hasHalt ? tk.text : tk.textDim }}>
                          {stop.label || stationName(stop.city)}
                        </span>
                        {isFirst && <span style={{ background:`${routeMapTrain.col[0]}22`, color:routeMapTrain.col[0], fontFamily:SANS, fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:4 }}>START</span>}
                        {isLast && <span style={{ background:`${routeMapTrain.col[1]}22`, color:routeMapTrain.col[1], fontFamily:SANS, fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:4 }}>END</span>}
                        {hasHalt && !isFirst && !isLast && <span style={{ background:`${routeMapTrain.col[0]}18`, color:routeMapTrain.col[0], fontFamily:SANS, fontSize:9, fontWeight:600, padding:'1px 5px', borderRadius:4 }}>{stop.halt}m halt</span>}
                      </div>
                      {stop.duration && stop.duration !== '---' && !isFirst && (
                        <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint, marginTop:1 }}>
                          +{stop.duration} {T(lang,'পরে','from prev')}
                        </div>
                      )}
                    </div>
                    {/* Time column */}
                    <div style={{ textAlign:'right', flexShrink:0, minWidth:70 }}>
                      {timeToShow && (
                        <div style={{ fontFamily:SANS, fontWeight:700, fontSize:12, color: isFirst||isLast ? routeMapTrain.col[0] : tk.text }}>
                          {timeToShow.replace(' BST','').replace(' am',' AM').replace(' pm',' PM')}
                        </div>
                      )}
                      {depTime && (
                        <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>
                          dep {depTime.replace(' BST','').replace(' am',' AM').replace(' pm',' PM')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prompt when nothing selected */}
      {!routeMapTrain && (
        <div style={{ ...card(14), textAlign:'center', padding:'28px 16px', color:tk.textFaint }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🛤</div>
          <div style={{ fontFamily:BEN, fontSize:14, color:tk.textDim }}>{T(lang,'উপরের তালিকা থেকে একটি ট্রেন বেছে নিন','Select a train above to see full route')}</div>
          <div style={{ fontFamily:SANS, fontSize:11, marginTop:4 }}>{T(lang,'সমস্ত স্টেশন ও সময়সূচি দেখুন','View all stations with timing')}</div>
        </div>
      )}
    </div>
  );

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'0 0 80px':'0 0 48px' }}>
        <ModeHero tk={tk} isMobile={isMobile} lang={lang} kind="train"
          gradient="linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #f59e0b 100%)"
          title={T(lang,'বাংলাদেশ রেলওয়ে · সকল রুট','Bangladesh Railway · all routes')}
          subtitle={T(lang,'৩৫০+ আন্তঃনগর ট্রেন, ই-টিকেট বুকিং, লাইভ অবস্থান ট্র্যাকিং — পদ্মা সেতু রুট সহ।','350+ intercity trains, e-ticket booking, live position tracking — including Padma Bridge route.')}
          stats={[{v:N(132,lang),l:T(lang,'ট্রেন','Trains')},{v:N(260,lang),l:T(lang,'স্টেশন','Stations')},{v:N(10,lang)+' days',l:T(lang,'অগ্রিম বুকিং','Advance booking')},{v:'★ '+N('4.5',lang),l:T(lang,'গড় রেটিং','Avg rating')}]}
        />

        <div style={{ padding:isMobile?'0 16px':'0 40px' }}>
          {/* Search card */}
          <div style={{ ...card(18), marginBottom:18 }}>
            {/* Tabs */}
            <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={btnStyle(activeTab === tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Top train name/number search bar — works for all tabs */}
            <div style={{ position:'relative', marginBottom:12 }}>
              <div style={{ background:tk.inputBg, border:`1px solid ${trainSearchFocused ? tk.primary : tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }} className="kj-anim-glow">
                  <Icon.search s={16}/>
                </div>
                <input
                  value={trainSearch}
                  onChange={e => setTrainSearch(e.target.value)}
                  onFocus={() => setTrainSearchFocused(true)}
                  onBlur={() => setTimeout(() => setTrainSearchFocused(false), 150)}
                  placeholder={T(lang,'যেমন: কক্সবাজার এক্সপ্রেস, সোনার বাংলা, ৭৮৬...','e.g. Cox\'s Bazar Express, Sonar Bangla, #786...')}
                  style={{ flex:1, background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:14, color:tk.text }}
                />
                {trainSearch && (
                  <button onClick={() => setTrainSearch('')} style={{ background:'none', border:'none', color:tk.textFaint, cursor:'pointer', fontSize:16, padding:4 }}>✕</button>
                )}
                <div style={{ display:'flex', gap:4 }}>
                  {[{l:T(lang,'নাম','Name'),c:'#7c3aed'},{l:T(lang,'নম্বর','Number'),c:'#3b82f6'},{l:'PNR',c:'#10b981'}].map((c,i)=>(
                    <span key={i} style={{ padding:'4px 8px', borderRadius:6, fontFamily:SANS, fontSize:10, fontWeight:700, background:`${c.c}22`, color:c.c }}>{c.l}</span>
                  ))}
                </div>
              </div>

              {/* Train name search dropdown */}
              {trainSearch.trim() && trainSearchResults.length > 0 && trainSearchFocused && (
                <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:9999, background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:14, marginTop:4, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.15)' }}>
                  {trainSearchResults.map(t => (
                    <div
                      key={t.source.id}
                      onMouseDown={() => {
                        if (activeTab === 'pnr') {
                          window.open('https://eticket.railway.gov.bd/verify-ticket', '_blank');
                        } else if (activeTab === 'routemap') {
                          setRouteMapTrain(t);
                          setRouteMapSearch(t.en);
                          setTrainSearch('');
                        } else {
                          onNav('train-detail', { trainId: t.source.id });
                        }
                        setTrainSearch('');
                      }}
                      style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', cursor:'pointer', borderTop:`1px solid ${tk.line}` }}
                    >
                      <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${t.col[0]},${t.col[1]})`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:SANS, fontWeight:800, fontSize:11, flexShrink:0 }}>{t.num}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:BEN, fontWeight:600, fontSize:13, color:tk.text }}>{T(lang,t.bn,t.en)}</div>
                        <div style={{ fontFamily:SANS, fontSize:11, color:tk.textFaint }}>{T(lang,t.rbn,t.ren)}</div>
                      </div>
                      <span style={{ fontFamily:SANS, fontWeight:700, fontSize:12, color:tk.textFaint }}>৳ {N(t.fare, lang)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tab-specific content inside search card */}
            {activeTab === 'eticket' && (
              <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr auto', gap:10 }}>
                <div ref={fromRef} style={{ background:tk.inputBg, border:`1px solid ${fromFocus?tk.primary:tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:tk.primarySoft, color:tk.primaryDeep, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.pin s={14}/></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'থেকে','From')}</div>
                    <input value={fromStation} onChange={e=>setFromStation(e.target.value)} onFocus={()=>setFromFocus(true)} onBlur={()=>setTimeout(()=>setFromFocus(false),150)} placeholder={T(lang,'ঢাকা / Dhaka','Dhaka')} style={{ background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text, width:'100%' }}/>
                  </div>
                </div>
                {fromFocus && <SuggestionDropdown suggestions={filterStations(fromStation,'from')} onSelect={s=>{setFromStation(s.label);setFromFocus(false);}} onDismiss={()=>setFromFocus(false)} tk={tk} lang={lang} anchorRef={fromRef}/>}
                <div ref={toRef} style={{ background:tk.inputBg, border:`1px solid ${toFocus?tk.accent:tk.line}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:tk.accentSoft, color:tk.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon.flag s={14}/></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:tk.textFaint, textTransform:'uppercase', letterSpacing:1.2 }}>{T(lang,'গন্তব্য','To')}</div>
                    <input value={toStation} onChange={e=>setToStation(e.target.value)} onFocus={()=>setToFocus(true)} onBlur={()=>setTimeout(()=>setToFocus(false),150)} placeholder={T(lang,"কক্সবাজার","Cox's Bazar")} style={{ background:'transparent', border:'none', outline:'none', fontFamily:BEN, fontSize:14, fontWeight:600, color:tk.text, width:'100%' }}/>
                  </div>
                </div>
                {toFocus && <SuggestionDropdown suggestions={filterStations(toStation,'to')} onSelect={s=>{setToStation(s.label);setToFocus(false);}} onDismiss={()=>setToFocus(false)} tk={tk} lang={lang} anchorRef={toRef}/>}
                <button onClick={()=>{ earnCoins(5,'Train search'); setHasSearched(true); document.getElementById('train-results')?.scrollIntoView({ behavior:'smooth', block:'start' }); }} style={{ background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', border:0, borderRadius:14, padding:isMobile?'12px 16px':'0 22px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, minHeight:isMobile?48:'auto', boxShadow:'0 8px 22px -10px #7c3aed' }}>
                  <Icon.search s={16}/>{T(lang,'খুঁজুন','Search')}
                </button>
              </div>
            )}

            {activeTab === 'pnr' && (
              <div style={{ marginTop:4, padding:'4px 0 0' }}>
                <div style={{ background:tk.inputBg, border:`1.5px solid #10b981`, borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <span style={{ fontSize:20 }}>🎟️</span>
                  <input
                    value={pnrInput}
                    onChange={e => setPnrInput(e.target.value.toUpperCase())}
                    placeholder={T(lang,'PNR নম্বর লিখুন (যেমন: PNR1234567)','Enter PNR number (e.g. PNR1234567)')}
                    style={{ flex:1, background:'transparent', border:'none', outline:'none', fontFamily:SANS, fontWeight:700, fontSize:16, color:tk.text, letterSpacing:2 }}
                    maxLength={20}
                    onKeyDown={e => { if (e.key === 'Enter' && pnrInput.trim()) window.open('https://eticket.railway.gov.bd/verify-ticket', '_blank'); }}
                  />
                  {pnrInput && <button onClick={() => setPnrInput('')} style={{ background:'none', border:'none', color:tk.textFaint, cursor:'pointer', fontSize:16 }}>✕</button>}
                </div>
                <button
                  onClick={() => { if (pnrInput.trim()) window.open('https://eticket.railway.gov.bd/verify-ticket', '_blank'); }}
                  style={{ width:'100%', background: pnrInput.trim() ? 'linear-gradient(135deg,#059669,#10b981)' : tk.panelMuted, color: pnrInput.trim() ? '#fff' : tk.textFaint, border:0, borderRadius:14, padding:'13px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor: pnrInput.trim() ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                >
                  🔍 {T(lang,'PNR যাচাই করুন','Verify PNR')} →
                </button>
              </div>
            )}

            {activeTab === 'routemap' && (
              <div style={{ marginTop:4, display:'flex', gap:10, flexWrap:'wrap' }}>
                <button
                  onClick={() => window.open('https://eticket.railway.gov.bd/train-information', '_blank')}
                  style={{ flex:1, background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', border:0, borderRadius:14, padding:'13px 16px', fontFamily:SANS, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 8px 22px -10px #7c3aed' }}
                >
                  🛤 {T(lang,'অফিসিয়াল রুট ম্যাপ','Official Route Map')}
                </button>
              </div>
            )}
          </div>

          {/* Main content area — changes by tab */}
          {activeTab === 'eticket' && (
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1.5fr 1fr', gap:18 }}>
              <div id="train-results">
                <SectionHeader tk={tk} lang={lang}
                  title={hasTrainSearch
                    ? T(lang,`${N(filteredTrains.length,lang)}টি ট্রেন পাওয়া গেছে`,`${N(filteredTrains.length,lang)} trains found`)
                    : T(lang,'প্রিয় ট্রেন','Favorite trains')}
                  action={T(lang,'প্রিয় ট্রেন','Favorite trains')}/>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {filteredTrains.length === 0 && <div style={{ fontFamily:BEN, fontSize:13, color:tk.textFaint, padding:'16px 0', textAlign:'center' }}>{T(lang,'কোনো ট্রেন পাওয়া যায়নি','No trains found for this route')}</div>}
                  {filteredTrains.map((t,i)=>(
                    <React.Fragment key={t.source.id}>
                      {i === 5 && (
                        <div style={{ display:'flex', justifyContent:'center' }}>
                          <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
                        </div>
                      )}
                    <div onClick={()=>onNav('train-detail',{trainId:t.source.id})} style={{ ...card(14), cursor:'pointer' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                        <div style={{ width:48, height:48, borderRadius:12, flexShrink:0, background:`linear-gradient(135deg,${t.col[0]},${t.col[1]})`, color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ fontFamily:SANS, fontWeight:800, fontSize:12 }}>{t.num}</span>
                          <span style={{ fontSize:14 }}>🚆</span>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                            <span style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,t.bn,t.en)}</span>
                          </div>
                          <div style={{ fontFamily:BEN, fontSize:12, color:tk.textDim, marginTop:2 }}>{T(lang,t.rbn,t.ren)}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                            <Stars value={t.rating} size={10}/>
                            <span style={{ fontFamily:SANS, fontSize:10, fontWeight:700, color:tk.text }}>{t.rating}</span>
                            <span style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>· {T(lang,'ছুটি','Off')}: {t.off.includes('/') ? t.off.split('/')[lang==='bn'?0:1] : t.off}</span>
                          </div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ fontFamily:SANS, fontWeight:800, fontSize:14, color:tk.text }}>৳ {N(t.fare, lang)}</div>
                          <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>{N(t.dep, lang)} → {N(t.arr, lang)}</div>
                          <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>{t.dur}</div>
                        </div>
                      </div>
                    </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={card(16)}>
                  <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:12 }}>{T(lang,'কোচ ক্লাস','Coach classes')}</div>
                  {COACHES.map((c,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderTop:i?`1px dashed ${tk.line}`:'' }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:`${c.c}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{c.e}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:BEN, fontWeight:700, fontSize:13, color:tk.text }}>{T(lang,c.bn,c.l)}</div>
                        <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>{c.n}</div>
                      </div>
                      <div style={{ fontFamily:SANS, fontWeight:800, fontSize:14, color:c.c }}>{Fare(c.fare.replace(/৳\s*/,''), lang)}</div>
                    </div>
                  ))}
                </div>
                <div style={card(14)}>
                  <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text, marginBottom:10 }}>{T(lang,'প্রধান স্টেশন','Major stations')}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                    {MAJOR_STATIONS.map(s=>(
                      <div key={s.id} onClick={()=>setToStation(s.name)} style={{ background:tk.panelMuted, borderRadius:10, padding:'8px 10px', fontFamily:BEN, fontSize:12, color:tk.text, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontSize:14 }}>🏛️</span>{T(lang,s.bnName,s.name)}
                      </div>
                    ))}
                  </div>
                </div>
                <PromoBanner tk={tk} lang={lang} page="train" onNav={onNav}/>
                <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'mid-rect'}/>
              </div>
            </div>
          )}

          {activeTab === 'pnr' && renderPNR()}
          {activeTab === 'routemap' && renderRouteMap()}

          <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
            <AdSlot tk={tk} lang={lang} kind="multiplex" />
        </div>
      </div>
    </PageShell>
  );
}
