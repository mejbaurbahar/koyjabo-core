import React, { useState, useMemo, useRef } from 'react';
import { KJ_TOKENS, SANS, BEN, T, Tokens, Lang, N, Fare } from '../tokens';
import { AdSlot } from '../components/AdSlot';
import { PromoBanner } from '../components/PromoBanner';
import { PageShell } from './PageShell';
import { Plane3D } from '../components/Vehicles3D';
import { INTERCITY_BUS_ROUTES, BUS_OPERATORS, MAJOR_TRANSPORT_HUBS } from '../../../data/intercityData';
import { LOCATIONS_DATA } from '../../../intercity/constants';
import { BD_TRAIN_ROUTES } from '../../../data/bangladeshTrainData';
import { DOMESTIC_ROUTES, AIRPORTS_DATA } from '../../../data/bangladeshFlightData';
import { LAUNCH_ROUTES, LAUNCH_TERMINALS } from '../../../data/bangladeshLaunchData';
import { SuggestionDropdown, Suggestion } from '../components/SuggestionDropdown';
import { useLocationSearch } from '../../../hooks/useLocationSearch';
import { earnCoins } from '../utils/koyCoinService';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:Lang; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const OPERATORS = [
  {
    code: 'GL', name: 'Green Line Paribahan', nameBn: 'গ্রীন লাইন পরিবহন',
    from: 'Dhaka', fromBn: 'ঢাকা', to: "Cox's Bazar", toBn: 'কক্সবাজার',
    fare: '৳900–2500', duration: '10-12h', type: 'AC sleeper', typeBn: 'এসি স্লিপার',
    rating: 4.2, depart: '9PM', departBn: 'রাত ৯টা',
    g1: '#006a4e', g2: '#10b981',
  },
  {
    code: 'HF', name: 'Hanif Enterprise', nameBn: 'হানিফ এন্টারপ্রাইজ',
    from: 'Dhaka', fromBn: 'ঢাকা', to: 'Chittagong', toBn: 'চট্টগ্রাম',
    fare: '৳680', duration: '6h', type: 'AC', typeBn: 'এসি',
    rating: 4.0, depart: '8PM', departBn: 'রাত ৮টা',
    g1: '#d92644', g2: '#ff7a3a',
  },
  {
    code: 'SH', name: 'Shyamoli Paribahan', nameBn: 'শ্যামলী পরিবহন',
    from: 'Multiple', fromBn: 'একাধিক রুট', to: 'routes', toBn: '',
    fare: '৳600–3000', duration: 'varies', type: 'AC/Non-AC', typeBn: 'এসি/নন-এসি',
    rating: 4.1, depart: 'Various', departBn: 'বিভিন্ন সময়',
    g1: '#b46a13', g2: '#f7b955',
  },
  {
    code: 'RC', name: 'Royal Coach', nameBn: 'রয়্যাল কোচ',
    from: 'Dhaka', fromBn: 'ঢাকা', to: "Cox's Bazar", toBn: 'কক্সবাজার',
    fare: '৳1200', duration: '10h', type: 'Luxury AC', typeBn: 'লাক্সারি এসি',
    rating: 4.5, depart: '10PM', departBn: 'রাত ১০টা',
    g1: '#7c3aed', g2: '#5b21b6',
  },
];

const CHIPS = [
  { label: 'Bus', labelBn: 'বাস', icon: '🚌' },
  { label: 'Train', labelBn: 'ট্রেন', icon: '🚆' },
  { label: 'Flight', labelBn: 'ফ্লাইট', icon: '✈️' },
  { label: 'Launch', labelBn: 'লঞ্চ', icon: '⛴️' },
];

const STATS = [
  { val: '64', label: 'Districts', labelBn: 'জেলা' },
  { val: '4', label: 'Modes', labelBn: 'পরিবহন' },
  { val: 'Live', label: 'Schedules', labelBn: 'শিডিউল' },
  { val: '50+', label: 'Operators', labelBn: 'অপারেটর' },
];
// Note: STATS vals converted to Bengali at render time via N()

const ALL_INTERCITY_LOCATIONS = [...INTERCITY_BUS_ROUTES, ...MAJOR_TRANSPORT_HUBS];

export function IntercityPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const isMobile = device === 'mobile';
  const tk: Tokens = KJ_TOKENS[theme];
  const [activeChip, setActiveChip] = useState(params?.mode === 'flights' ? 'Flight' : 'Bus');
  const [nameSearch, setNameSearch] = useState(params?.search ?? '');
  const [from, setFrom] = useState(params?.from ?? '');
  const [to, setTo] = useState(params?.to ?? '');
  const [hasSearched, setHasSearched] = useState(!!(params?.from || params?.to || params?.search));

  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const [fromFocus, setFromFocus] = useState(false);
  const [toFocus, setToFocus] = useState(false);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  // All Bangladesh locations — 64 districts + major Dhaka areas + hubs + tourist spots
  const ALL_BD_LOCATIONS: Suggestion[] = useMemo(() => [
    // Major cities
    { id:'dhaka', label:'Dhaka', sub:'Dhaka Division' },
    { id:'chattogram', label:'Chattogram', sub:'Chattogram Division' },
    { id:'sylhet', label:'Sylhet', sub:'Sylhet Division' },
    { id:'rajshahi', label:'Rajshahi', sub:'Rajshahi Division' },
    { id:'khulna', label:'Khulna', sub:'Khulna Division' },
    { id:'barishal', label:'Barishal', sub:'Barishal Division' },
    { id:'rangpur', label:'Rangpur', sub:'Rangpur Division' },
    { id:'mymensingh', label:'Mymensingh', sub:'Mymensingh Division' },
    // Chattogram Division
    { id:"coxs_bazar", label:"Cox's Bazar", sub:'Chattogram Division' },
    { id:'cumilla', label:'Cumilla', sub:'Chattogram Division' },
    { id:'feni', label:'Feni', sub:'Chattogram Division' },
    { id:'noakhali', label:'Noakhali', sub:'Chattogram Division' },
    { id:'lakshmipur', label:'Lakshmipur', sub:'Chattogram Division' },
    { id:'chandpur', label:'Chandpur', sub:'Chattogram Division' },
    { id:'brahmanbaria', label:'Brahmanbaria', sub:'Chattogram Division' },
    { id:'bandarban', label:'Bandarban', sub:'Chattogram Division' },
    { id:'rangamati', label:'Rangamati', sub:'Chattogram Division' },
    { id:'khagrachhari', label:'Khagrachhari', sub:'Chattogram Division' },
    // Sylhet Division
    { id:'moulvibazar', label:'Moulvibazar', sub:'Sylhet Division' },
    { id:'habiganj', label:'Habiganj', sub:'Sylhet Division' },
    { id:'sunamganj', label:'Sunamganj', sub:'Sylhet Division' },
    // Rajshahi Division
    { id:'bogura', label:'Bogura', sub:'Rajshahi Division' },
    { id:'naogaon', label:'Naogaon', sub:'Rajshahi Division' },
    { id:'natore', label:'Natore', sub:'Rajshahi Division' },
    { id:'chapainawabganj', label:'Chapainawabganj', sub:'Rajshahi Division' },
    { id:'pabna', label:'Pabna', sub:'Rajshahi Division' },
    { id:'sirajganj', label:'Sirajganj', sub:'Rajshahi Division' },
    { id:'joypurhat', label:'Joypurhat', sub:'Rajshahi Division' },
    // Khulna Division
    { id:'jashore', label:'Jashore', sub:'Khulna Division' },
    { id:'benapole', label:'Benapole', sub:'Khulna Division' },
    { id:'satkhira', label:'Satkhira', sub:'Khulna Division' },
    { id:'bagerhat', label:'Bagerhat', sub:'Khulna Division' },
    { id:'narail', label:'Narail', sub:'Khulna Division' },
    { id:'chuadanga', label:'Chuadanga', sub:'Khulna Division' },
    { id:'jhenaidah', label:'Jhenaidah', sub:'Khulna Division' },
    { id:'magura', label:'Magura', sub:'Khulna Division' },
    { id:'meherpur', label:'Meherpur', sub:'Khulna Division' },
    { id:'kushtia', label:'Kushtia', sub:'Khulna Division' },
    // Barishal Division
    { id:'patuakhali', label:'Patuakhali', sub:'Barishal Division' },
    { id:'kuakata', label:'Kuakata', sub:'Barishal Division' },
    { id:'bhola', label:'Bhola', sub:'Barishal Division' },
    { id:'pirojpur', label:'Pirojpur', sub:'Barishal Division' },
    { id:'barguna', label:'Barguna', sub:'Barishal Division' },
    { id:'jhalokati', label:'Jhalokati', sub:'Barishal Division' },
    // Rangpur Division
    { id:'dinajpur', label:'Dinajpur', sub:'Rangpur Division' },
    { id:'thakurgaon', label:'Thakurgaon', sub:'Rangpur Division' },
    { id:'panchagarh', label:'Panchagarh', sub:'Rangpur Division' },
    { id:'nilphamari', label:'Nilphamari', sub:'Rangpur Division' },
    { id:'lalmonirhat', label:'Lalmonirhat', sub:'Rangpur Division' },
    { id:'kurigram', label:'Kurigram', sub:'Rangpur Division' },
    { id:'gaibandha', label:'Gaibandha', sub:'Rangpur Division' },
    // Mymensingh Division
    { id:'jamalpur', label:'Jamalpur', sub:'Mymensingh Division' },
    { id:'sherpur', label:'Sherpur', sub:'Mymensingh Division' },
    { id:'netrokona', label:'Netrokona', sub:'Mymensingh Division' },
    { id:'kishoreganj', label:'Kishoreganj', sub:'Mymensingh Division' },
    // Dhaka Division districts
    { id:'gazipur', label:'Gazipur', sub:'Dhaka Division' },
    { id:'narayanganj', label:'Narayanganj', sub:'Dhaka Division' },
    { id:'narsingdi', label:'Narsingdi', sub:'Dhaka Division' },
    { id:'manikganj', label:'Manikganj', sub:'Dhaka Division' },
    { id:'munshiganj', label:'Munshiganj', sub:'Dhaka Division' },
    { id:'faridpur', label:'Faridpur', sub:'Dhaka Division' },
    { id:'gopalganj', label:'Gopalganj', sub:'Dhaka Division' },
    { id:'madaripur', label:'Madaripur', sub:'Dhaka Division' },
    { id:'shariatpur', label:'Shariatpur', sub:'Dhaka Division' },
    { id:'rajbari', label:'Rajbari', sub:'Dhaka Division' },
    { id:'tangail', label:'Tangail', sub:'Dhaka Division' },
    // Major Dhaka areas
    { id:'gulshan', label:'Gulshan', sub:'Dhaka City' },
    { id:'banani', label:'Banani', sub:'Dhaka City' },
    { id:'uttara', label:'Uttara', sub:'Dhaka City' },
    { id:'mirpur', label:'Mirpur', sub:'Dhaka City' },
    { id:'dhanmondi', label:'Dhanmondi', sub:'Dhaka City' },
    { id:'mohammadpur', label:'Mohammadpur', sub:'Dhaka City' },
    { id:'farmgate', label:'Farmgate', sub:'Dhaka City' },
    { id:'motijheel', label:'Motijheel', sub:'Dhaka City' },
    { id:'old_dhaka', label:'Old Dhaka', sub:'Dhaka City' },
    { id:'badda', label:'Badda', sub:'Dhaka City' },
    { id:'khilgaon', label:'Khilgaon', sub:'Dhaka City' },
    { id:'rampura', label:'Rampura', sub:'Dhaka City' },
    { id:'mohakhali', label:'Mohakhali', sub:'Dhaka City' },
    { id:'tejgaon', label:'Tejgaon', sub:'Dhaka City' },
    { id:'shahbag', label:'Shahbag', sub:'Dhaka City' },
    { id:'savar', label:'Savar', sub:'Dhaka Division' },
    { id:'hemayetpur', label:'Hemayetpur', sub:'Savar, Dhaka' },
    { id:'gabtoli', label:'Gabtoli', sub:'Dhaka Bus Terminal' },
    { id:'sadarghat', label:'Sadarghat', sub:'Dhaka Launch Terminal' },
    { id:'kamalapur', label:'Kamalapur', sub:'Dhaka Railway Station' },
    { id:'airport', label:'Airport (HSIA)', sub:'Dhaka International Airport' },
    // Tourist destinations
    { id:'sundarbans', label:'Sundarbans', sub:'Khulna Division' },
    { id:'saint_martin', label:"Saint Martin Island", sub:'Teknaf, Cox\'s Bazar' },
    { id:'sajek', label:'Sajek Valley', sub:'Rangamati' },
    { id:'jaflong', label:'Jaflong', sub:'Sylhet' },
    { id:'ratargul', label:'Ratargul', sub:'Sylhet' },
    { id:'srimangal', label:'Srimangal', sub:'Moulvibazar' },
    { id:'nilgiri', label:'Nilgiri', sub:'Bandarban' },
    { id:'kaptai', label:'Kaptai Lake', sub:'Rangamati' },
    { id:'mongla', label:'Mongla', sub:'Bagerhat' },
    { id:'teknaf', label:'Teknaf', sub:"Cox's Bazar" },
    ...ALL_INTERCITY_LOCATIONS
      .filter(r => !['Dhaka','Chattogram','Sylhet','Rajshahi','Khulna','Barishal','Rangpur','Mymensingh'].includes(r.district))
      .map(r => ({ id: r.district.toLowerCase().replace(/\s/g,'_'), label: r.district, sub: r.division + ' Division' })),
  ].filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i), []);

  // Comprehensive location search: LOCATIONS_DATA (~600) + OSM database (14K)
  const { suggestions: fromSuggs } = useLocationSearch(from, { limit: 20 });
  const { suggestions: toSuggs } = useLocationSearch(to, { limit: 20 });

  const POPULAR_DEFAULTS: Suggestion[] = [
    "Dhaka","Cox's Bazar","Sylhet","Chattogram","Rajshahi","Khulna",
    "Barishal","Rangpur","Sajek Valley","Saint Martin's Island",
    "Kuakata","Sreemangal","Bandarban","Sundarbans",
  ].map(n => ({ id: n.toLowerCase().replace(/[\s']/g,'_'), label: n, sub: '' }));

  const filterDistricts = (q: string, side: 'from' | 'to'): Suggestion[] => {
    if (!q.trim()) return POPULAR_DEFAULTS;
    return (side === 'from' ? fromSuggs : toSuggs) as Suggestion[];
  };

  // ── Location aliases for smart matching ──────────────────────────────────────
  // City name → train station IDs / terminal IDs / IATA codes
  const CITY_TO_STATION: Record<string, string[]> = {
    dhaka: ['kamalapur', 'tejgaon', 'cantonment', 'airport_r', 'tongi'],
    chattogram: ['chattogram'], chittagong: ['chattogram'],
    'cox\'s bazar': ['coxsbazar'], coxsbazar: ['coxsbazar'], 'cox bazar': ['coxsbazar'],
    sylhet: ['sylhet'], rajshahi: ['rajshahi'], khulna: ['khulna'],
    mymensingh: ['mymensingh'], comilla: ['comilla'], cumilla: ['comilla'],
    bogra: ['bogra'], bogura: ['bogra'], dinajpur: ['dinajpur'],
    rangpur: ['rangpur'], jamalpur: ['jamalpur'], tangail: ['tangail'],
    barishal: ['barisal'], barisal: ['barisal'], faridpur: ['faridpur'],
    narayanganj: ['narayanganj'], narsingdi: ['narsingdi'],
    brahmanbaria: ['brahmanbaria'], feni: ['feni'], noakhali: ['chaumuhani'],
    srimangal: ['srimangal'], sreemangal: ['srimangal'],
    sirajganj: ['sirajganj'], pabna: ['paksey'],
    benapole: ['benapole'], jessore: ['jessore'], jashore: ['jessore'],
    kushtia: ['kushtia_court'],
  };

  // City/airport name → IATA code aliases
  const CITY_TO_IATA: Record<string, string> = {
    dhaka: 'DAC', 'hazrat shahjalal': 'DAC', hsia: 'DAC',
    chattogram: 'CGP', chittagong: 'CGP', ctg: 'CGP', 'shah amanat': 'CGP',
    sylhet: 'ZYL', osmani: 'ZYL',
    'cox\'s bazar': 'CXB', coxsbazar: 'CXB', 'cox bazar': 'CXB',
    jessore: 'JSR', jashore: 'JSR',
    saidpur: 'SPD',
    barishal: 'BZL', barisal: 'BZL',
    rajshahi: 'RJH',
  };

  // Terminal keyword → terminal id
  const CITY_TO_TERMINAL: Record<string, string> = {
    dhaka: 'sadarghat', sadarghat: 'sadarghat',
    barishal: 'barisal', barisal: 'barisal',
    khulna: 'khulna',
    patuakhali: 'patuakhali', kuakata: 'patuakhali',
    bhola: 'bhola',
    chandpur: 'chandpur',
    narayanganj: 'narayanganj',
    madaripur: 'madaripur',
    hatiya: 'hatiya',
    barguna: 'borguna', borguna: 'borguna',
    morrelganj: 'morrelganj',
    jhalkathi: 'jhalkathi', jhalokati: 'jhalkathi',
  };

  // Loose text match: also tries first significant word
  const loosematch = (text: string, q: string) => {
    if (!q.trim()) return true;
    const t = text.toLowerCase();
    const l = q.toLowerCase().trim();
    if (t.includes(l)) return true;
    const word = l.split(/\s+/).find(w => w.length >= 4);
    return word ? t.includes(word) : false;
  };

  // Resolve user input to station IDs (array for OR matching)
  const resolveStations = (q: string): string[] => {
    const l = q.toLowerCase().trim();
    return CITY_TO_STATION[l] || CITY_TO_STATION[l.split(/\s+/)[0]] || [];
  };

  // Resolve user input to IATA code
  const resolveIATA = (q: string): string | null => {
    const l = q.toLowerCase().trim();
    return CITY_TO_IATA[l] || CITY_TO_IATA[l.split(/\s+/)[0]] || null;
  };

  // Resolve user input to terminal ID
  const resolveTerminal = (q: string): string | null => {
    const l = q.toLowerCase().trim();
    return CITY_TO_TERMINAL[l] || CITY_TO_TERMINAL[l.split(/\s+/)[0]] || null;
  };

  const filteredResults = useMemo(() => {
    const fromQ = from.toLowerCase().trim();
    const toQ = to.toLowerCase().trim();
    const sq = nameSearch.toLowerCase().trim();

    // ── Train ───────────────────────────────────────────────────────────────────
    if (activeChip === 'Train') {
      // Show ALL trains if no search terms
      if (!fromQ && !toQ && !sq) return BD_TRAIN_ROUTES;
      const fromStations = fromQ ? resolveStations(fromQ) : [];
      const toStations = toQ ? resolveStations(toQ) : [];
      return BD_TRAIN_ROUTES.filter(r => {
        const allStopIds = [r.from, r.to, ...(r.stops || [])];
        const nameText = (r.name + ' ' + r.bnName).toLowerCase();
        // Search filter
        if (sq && !loosematch(nameText, sq)) return false;
        // From filter: station ID match OR loose name match in stops list
        const fromOk = !fromQ || (
          fromStations.length > 0
            ? fromStations.some(s => allStopIds.includes(s))
            : allStopIds.some(id => loosematch(id, fromQ)) || loosematch(nameText, fromQ)
        );
        // To filter
        const toOk = !toQ || (
          toStations.length > 0
            ? toStations.some(s => allStopIds.includes(s))
            : allStopIds.some(id => loosematch(id, toQ)) || loosematch(nameText, toQ)
        );
        return fromOk && toOk;
      });
    }

    // ── Flight ─────────────────────────────────────────────────────────────────
    if (activeChip === 'Flight') {
      // Show ALL flights if no search terms
      if (!fromQ && !toQ && !sq) return DOMESTIC_ROUTES;
      const fromIATA = fromQ ? (resolveIATA(fromQ) || fromQ.toUpperCase()) : null;
      const toIATA = toQ ? (resolveIATA(toQ) || toQ.toUpperCase()) : null;
      return DOMESTIC_ROUTES.filter(r => {
        const fromAp = AIRPORTS_DATA.find(a => a.iata === r.from);
        const toAp = AIRPORTS_DATA.find(a => a.iata === r.to);
        const fromText = ((fromAp?.en || '') + ' ' + (fromAp?.city || '') + ' ' + r.from).toLowerCase();
        const toText = ((toAp?.en || '') + ' ' + (toAp?.city || '') + ' ' + r.to).toLowerCase();
        const nameText = (r.flightNo + ' ' + r.airline).toLowerCase();
        if (sq && !loosematch(nameText + ' ' + fromText + ' ' + toText, sq)) return false;
        const fromOk = !fromQ || r.from === fromIATA || loosematch(fromText, fromQ);
        const toOk = !toQ || r.to === toIATA || loosematch(toText, toQ);
        return fromOk && toOk;
      });
    }

    // ── Launch ─────────────────────────────────────────────────────────────────
    if (activeChip === 'Launch') {
      // Show ALL launches if no search terms
      if (!fromQ && !toQ && !sq) return LAUNCH_ROUTES;
      const fromTermId = fromQ ? resolveTerminal(fromQ) : null;
      const toTermId = toQ ? resolveTerminal(toQ) : null;
      return LAUNCH_ROUTES.filter(r => {
        const fromT = LAUNCH_TERMINALS.find(t => t.id === r.from);
        const toT = LAUNCH_TERMINALS.find(t => t.id === r.to);
        const fromText = ((fromT?.en || '') + ' ' + (fromT?.bn || '') + ' ' + r.from).toLowerCase();
        const toText = ((toT?.en || '') + ' ' + (toT?.bn || '') + ' ' + r.to).toLowerCase();
        const nameText = (r.name.en + ' ' + r.name.bn + ' ' + r.operator.en).toLowerCase();
        if (sq && !loosematch(nameText, sq)) return false;
        const fromOk = !fromQ || r.from === fromTermId || loosematch(fromText, fromQ);
        const toOk = !toQ || r.to === toTermId || loosematch(toText, toQ);
        return fromOk && toOk;
      });
    }

    // ── Bus (default) ──────────────────────────────────────────────────────────
    const fq = (sq || fromQ);
    const tq = toQ;
    const allBus = [...INTERCITY_BUS_ROUTES, ...MAJOR_TRANSPORT_HUBS];
    if (!fq && !tq) return allBus.filter(r => r.district !== 'Dhaka');
    return allBus.filter(r => {
      const text = (r.district + ' ' + r.route + ' ' + r.busOperators.join(' ') + ' ' + r.division).toLowerCase();
      if (fq && tq) return loosematch(text, fq) && loosematch(text, tq);
      return loosematch(text, fq || tq);
    });
  }, [nameSearch, from, to, activeChip]);

  const DIVISION_COLORS: Record<string, string> = {
    Dhaka: '#3b82f6', Chattogram: '#10b981', Sylhet: '#a855f7',
    Khulna: '#06b6d4', Rajshahi: '#f59e0b', Barishal: '#ec4899',
    Mymensingh: '#14b8a6', Rangpur: '#f97316',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: tk.inputBg,
    border: `1px solid ${tk.line}`,
    borderRadius: 12,
    padding: '12px 14px',
    fontFamily: lang === 'bn' ? BEN : SANS,
    fontSize: 14,
    color: tk.text,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: tk.textFaint,
    marginBottom: 6,
    display: 'block',
  };

  return (
    <PageShell {...props}>
    <div style={{ color: tk.text }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 55%, #0ea5e9 100%)',
          padding: isMobile ? '40px 16px 32px' : '56px 32px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 80% at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)',
        }} />

        {/* Plane in top-right */}
        <div style={{ position: 'absolute', top: isMobile ? 12 : 20, right: isMobile ? 8 : 32, opacity: 0.85, zIndex: 1 }}>
          <Plane3D size={isMobile ? 120 : 160} palette={['#93c5fd', '#1e40af', '#ef4444']} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 999, padding: '4px 12px', marginBottom: 16,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} className="kj-anim-pulse" />
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>
              {lbl('LIVE SCHEDULES', 'লাইভ শিডিউল')}
            </span>
          </div>

          <h1 style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: isMobile ? 28 : 40, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.15 }}>
            {lbl('Intercity Travel', 'আন্তঃজেলা যাত্রা')}
          </h1>
          <p style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.8)', margin: '0 0 24px', lineHeight: 1.5 }}>
            {lbl('Bus · Train · Flight · Launch across Bangladesh', 'বাস · ট্রেন · ফ্লাইট · লঞ্চ — সারাদেশে')}
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {STATS.map((s) => (
              <div key={s.val} style={{
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12,
                padding: '10px 16px', textAlign: 'center', minWidth: 72,
              }}>
                <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: '#fff' }}>{N(s.val, lang)}</div>
                <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                  {lbl(s.label, s.labelBn)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad after hero */}
      <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>

      {/* Search section */}
      <div style={{ padding: isMobile ? '20px 16px' : '28px 40px' }}>
        {/* Mode chips */}
        <div style={{ marginBottom: 20 }}>
          {/* Mode chips */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {CHIPS.map((c) => (
              <button
                key={c.label}
                onClick={() => setActiveChip(c.label)}
                style={{
                  background: activeChip === c.label ? tk.primarySoft : tk.panelMuted,
                  border: `1px solid ${activeChip === c.label ? tk.primary : tk.line}`,
                  borderRadius: 999, padding: '6px 14px', cursor: 'pointer',
                  fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: 500,
                  color: activeChip === c.label ? tk.primary : tk.textDim,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 15 }}>{c.icon}</span>
                {lbl(c.label, c.labelBn)}
              </button>
            ))}
          </div>
        </div>

        {/* 4-field search grid */}
        <div style={{
          background: tk.panel, border: `1px solid ${tk.line}`,
          borderRadius: 20, padding: isMobile ? 16 : 24,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: tk.shadow,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
            gap: 16,
          }}>
            {/* FROM with district suggestions via portal */}
            <div>
              <label style={labelStyle}>{lbl('From', 'প্রেরণ')}</label>
              <input
                ref={fromRef}
                style={{ ...inputStyle, borderColor: fromFocus ? tk.primary : tk.line }}
                placeholder={lbl('Dhaka', 'ঢাকা')}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                onFocus={() => setFromFocus(true)}
                onBlur={() => setTimeout(() => setFromFocus(false), 150)}
              />
              {fromFocus && <SuggestionDropdown suggestions={filterDistricts(from, 'from')} onSelect={s => { setFrom(s.label); setFromFocus(false); }} onDismiss={() => setFromFocus(false)} tk={tk} lang={lang} anchorRef={fromRef}/>}
            </div>
            {/* TO with district suggestions via portal */}
            <div>
              <label style={labelStyle}>{lbl('To', 'গন্তব্য')}</label>
              <input
                ref={toRef}
                style={{ ...inputStyle, borderColor: toFocus ? tk.primary : tk.line }}
                placeholder={lbl("Cox's Bazar", 'কক্সবাজার')}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                onFocus={() => setToFocus(true)}
                onBlur={() => setTimeout(() => setToFocus(false), 150)}
              />
              {toFocus && <SuggestionDropdown suggestions={filterDistricts(to, 'to')} onSelect={s => { setTo(s.label); setToFocus(false); }} onDismiss={() => setToFocus(false)} tk={tk} lang={lang} anchorRef={toRef}/>}
            </div>
          </div>

          <button
            onClick={() => { earnCoins(5,'Intercity search'); setHasSearched(true); document.getElementById('intercity-results')?.scrollIntoView({ behavior:'smooth', block:'start' }); }}
            style={{
              marginTop: 16, width: '100%',
              background: `linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)`,
              border: 'none', borderRadius: 14,
              padding: '14px 24px',
              fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 15, fontWeight: 700, color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              letterSpacing: 0.3,
            }}
          >
            🔍 {lbl('Search Journeys', 'যাত্রা খুঁজুন')}
          </button>
        </div>

        {hasSearched && (
        <div id="intercity-results" style={{ marginTop: 32 }}>
          {/* For bus: expand into per-operator cards */}
          {activeChip === 'Bus' ? (() => {
            // Flatten all operators from all matched routes into individual cards
            const operatorCards: { opName: string; route: string; district: string; division: string; costNonAC: string; costAC: string; contact: string }[] = [];
            for (const r of filteredResults as any[]) {
              for (const opName of r.busOperators) {
                const opDetails = BUS_OPERATORS.find((b) => b.name.toLowerCase().includes(opName.toLowerCase()) || opName.toLowerCase().includes(b.name.split(' ')[0].toLowerCase()));
                operatorCards.push({
                  opName,
                  route: r.route,
                  district: r.district,
                  division: r.division,
                  costNonAC: r.costNonAC,
                  costAC: r.costAC,
                  contact: opDetails?.contactNumber || r.mainContactNumber || '',
                });
              }
            }
            return (
              <>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 16 }}>
                  {lbl(`${N(operatorCards.length,lang)} bus operators found`, `${N(operatorCards.length,lang)}টি বাস অপারেটর পাওয়া গেছে`)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {operatorCards.slice(0, 40).map((c, i) => {
                    const col = DIVISION_COLORS[c.division] || '#6b7280';
                    const hasAC = c.costAC && c.costAC !== '-';
                    const opDetails = BUS_OPERATORS.find((b) => b.name.toLowerCase().includes(c.opName.toLowerCase()) || c.opName.toLowerCase().includes(b.name.split(' ')[0].toLowerCase()));
                    return (
                      <button key={c.opName + i}
                        onClick={() => onNav('intercity-detail', { operator: c.opName, route: c.route, district: c.district, costNonAC: c.costNonAC, costAC: c.costAC, contact: c.contact, counter: opDetails?.mainCounterLocation || '', from: from || 'Dhaka', to: to || c.district })}
                        style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${col},${col}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🚌</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: tk.text }}>{c.opName}</div>
                          <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 3 }}>{c.route}</div>
                          {opDetails?.mainCounterLocation && <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textDim, marginTop: 2 }}>📍 {opDetails.mainCounterLocation}</div>}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: tk.text }}>{c.costNonAC}</div>
                          {hasAC && <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textDim }}>AC: {c.costAC}</div>}
                          {c.contact && <div style={{ fontFamily: SANS, fontSize: 10, color: tk.primary, marginTop: 4 }}>📞 {c.contact.split(',')[0]}</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {operatorCards.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: tk.textFaint, fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14 }}>
                    {lbl('No bus operators found. Try different locations.', 'কোনো বাস পাওয়া যায়নি।')}
                  </div>
                )}
              </>
            );
          })() : (
          <>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 16 }}>
            {lbl(`${N(filteredResults.length,lang)} ${activeChip} routes found`, `${N(filteredResults.length,lang)}টি ${activeChip} রুট পাওয়া গেছে`)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredResults.slice(0, 30).map((r: any, i: number) => {
              // ── Train card ─────────────────────────────────────────────────
              if (activeChip === 'Train') {
                return (
                  <button key={r.id + i} onClick={() => onNav('train-detail', { trainId: r.id })}
                    style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#5b21b6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🚆</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: tk.text }}>{r.name} <span style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint }}>#{r.number}</span></div>
                      <div style={{ fontFamily: BEN, fontSize: 12, color: tk.textDim, marginTop: 2 }}>{r.bnName}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 2 }}>Off day: {r.offDay}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text }}>{r.dhakaDepart}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textDim }}>৳{r.fare?.shuvan || '—'}</div>
                    </div>
                  </button>
                );
              }
              // ── Flight card ────────────────────────────────────────────────
              if (activeChip === 'Flight') {
                const fromAp = AIRPORTS_DATA.find((a: any) => a.iata === r.from);
                const toAp = AIRPORTS_DATA.find((a: any) => a.iata === r.to);
                return (
                  <button key={r.id + i} onClick={() => onNav('flight-detail', { code: r.airline, flightNo: r.flightNo, dep: r.dep, arr: r.arr, dur: r.dur, fromIATA: r.from, toIATA: r.to, fromName: fromAp?.en || r.from, toName: toAp?.en || r.to, fare: String(r.fareEco) })}
                    style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>✈️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: tk.text }}>{r.flightNo}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textDim, marginTop: 2 }}>{fromAp?.en || r.from} → {toAp?.en || r.to}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 2 }}>{r.dep} – {r.arr} · {r.dur} · {r.daysOp}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text }}>{Fare(r.fareEco.toLocaleString(), lang)}</div>
                      {r.fareBiz && <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textDim }}>Biz: {Fare(r.fareBiz.toLocaleString(), lang)}</div>}
                    </div>
                  </button>
                );
              }
              // ── Launch card ────────────────────────────────────────────────
              if (activeChip === 'Launch') {
                const fromT = LAUNCH_TERMINALS.find((t: any) => t.id === r.from);
                const toT = LAUNCH_TERMINALS.find((t: any) => t.id === r.to);
                return (
                  <button key={r.id + i} onClick={() => onNav('vehicle', { kind:'launch', id:r.id, name:r.name.en, nameBn:r.name.bn, from:fromT?.en||r.from, to:toT?.en||r.to, dep:r.dep, arr:r.arr, dur:r.dur, deck:String(r.deck), cabin:String(r.cabin), vip:String(r.vip), operator:r.operator.en, operatorBn:r.operator.bn, rating:String(r.rating), col:'#0369a1' })}
                    style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#0c1a2e,#0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>⛴️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: BEN, fontSize: 14, fontWeight: 700, color: tk.text }}>{lbl(r.name.en, r.name.bn)}</div>
                      <div style={{ fontFamily: BEN, fontSize: 11, color: tk.textDim, marginTop: 2 }}>{lbl(r.operator.en, r.operator.bn)}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 2 }}>{r.dep} → {r.arr} · {r.dur}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text }}>{Fare(r.deck, lang)}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textDim }}>Cabin: {Fare(r.cabin, lang)}</div>
                    </div>
                  </button>
                );
              }
              return null;
            })}
          </div>
          {filteredResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: tk.textFaint, fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14 }}>
              {lbl(`No ${activeChip} routes found. Try different locations.`, 'কোনো রুট পাওয়া যায়নি।')}
            </div>
          )}
          </>
          )}
        </div>
        )}

        {/* Ad between results and popular operators */}
        <AdSlot tk={tk} lang={lang} kind="in-article"/>

        {/* Popular Operators */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 14 }}>
            {lbl('Top Operators', 'শীর্ষ অপারেটর')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
            {BUS_OPERATORS.slice(0, 8).map((op) => (
              <button key={op.name} onClick={() => onNav('intercity-detail')} style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 4 }}>{op.name.split(' ')[0]}</div>
                <div style={{ fontFamily: SANS, fontSize: 10, color: tk.textDim, lineHeight: 1.3 }}>{op.primaryRoute.slice(0, 20)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Ad slot */}
        <AdSlot tk={tk} lang={lang} kind="in-article" />
        <PromoBanner tk={tk} lang={lang} page="intercity" onNav={onNav}/>
        <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
          <AdSlot tk={tk} lang={lang} kind="multiplex" />
      </div>

    </div>
    </PageShell>
  );
}
