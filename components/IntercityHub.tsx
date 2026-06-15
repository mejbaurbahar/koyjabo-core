import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowLeftRight, Search, Star, Clock, MapPin, Flag,
  Calendar, Users, ChevronRight, Zap, Phone, X, Bus, Train, Plane, Ship,
} from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { INTERCITY_BUS_ROUTES } from '../data/intercityData';
import SponsoredAdSlot from './SponsoredAdSlot';

interface IntercityHubProps {
  onBack: () => void;
  language: 'en' | 'bn';
  onSearch: (from: string, to: string) => void;
}

const POPULAR = [
  { from: 'Dhaka', to: "Cox's Bazar", fromBn: 'ঢাকা', toBn: 'কক্সবাজার', fare: '৳900', dur: '10–12h', durBn: '১০–১২ঘ', icon: '🏖️', tag: 'popular', tagBn: 'জনপ্রিয়' },
  { from: 'Dhaka', to: 'Chattogram', fromBn: 'ঢাকা', toBn: 'চট্টগ্রাম', fare: '৳680', dur: '5–6h', durBn: '৫–৬ঘ', icon: '🚢', tag: 'frequent', tagBn: 'ঘন ঘন' },
  { from: 'Dhaka', to: 'Sylhet', fromBn: 'ঢাকা', toBn: 'সিলেট', fare: '৳650', dur: '4–5h', durBn: '৪–৫ঘ', icon: '🍃', tag: 'scenic', tagBn: 'সুন্দর' },
  { from: 'Dhaka', to: 'Rajshahi', fromBn: 'ঢাকা', toBn: 'রাজশাহী', fare: '৳650', dur: '5h', durBn: '৫ঘ', icon: '🍇', tag: 'popular', tagBn: 'জনপ্রিয়' },
  { from: 'Dhaka', to: 'Khulna', fromBn: 'ঢাকা', toBn: 'খুলনা', fare: '৳700', dur: '7h', durBn: '৭ঘ', icon: '🐯', tag: '', tagBn: '' },
  { from: 'Dhaka', to: 'Rangpur', fromBn: 'ঢাকা', toBn: 'রংপুর', fare: '৳750', dur: '6–7h', durBn: '৬–৭ঘ', icon: '🌾', tag: '', tagBn: '' },
];

const FEATURED_OPERATORS = [
  {
    id: 'green-line', gradient: ['#006a4e', '#10b981'], abbr: 'GL',
    name: 'Green Line', nameBn: 'গ্রীন লাইন',
    type: 'Volvo AC · Double Decker', typeBn: 'ভলভো এসি · দোতলা',
    dep: '10:30 PM', arr: '08:00 AM', dur: '9h 30m', durBn: '৯ঘ ৩০মি',
    fare: '১,৪০০', seats: '12 seats left', seatsBn: '১২ আসন বাকি',
    rating: 4.6, premium: false,
    phone: '01318-647474',
    counter: 'Sayedabad, Dhaka & all major districts',
    counterBn: 'সায়েদাবাদ, ঢাকা ও সকল জেলায়',
    routes: ["Dhaka → Cox's Bazar", 'Dhaka → Chittagong', 'Dhaka → Sylhet'],
    routesBn: ["ঢাকা → কক্সবাজার", 'ঢাকা → চট্টগ্রাম', 'ঢাকা → সিলেট'],
    amenities: ['AC', 'Double Decker', 'WiFi', 'Charging Port', 'Water'],
    info: 'Green Line is one of Bangladesh\'s premium bus operators with air-conditioned Volvo coaches.',
    infoBn: 'গ্রীন লাইন বাংলাদেশের প্রিমিয়াম বাস সেবা, ভলভো এসি কোচ সহ।',
  },
  {
    id: 'hanif', gradient: ['#d92644', '#ff7a3a'], abbr: 'HF',
    name: 'Hanif Enterprise', nameBn: 'হানিফ এন্টারপ্রাইজ',
    type: 'Scania AC · 36 seats', typeBn: 'স্কানিয়া এসি · ৩৬ আসন',
    dep: '09:15 PM', arr: '07:30 AM', dur: '10h 15m', durBn: '১০ঘ ১৫মি',
    fare: '১,২৫০', seats: '23 seats', seatsBn: '২৩ আসন',
    rating: 4.4, premium: false,
    phone: '02-7194271',
    counter: 'Sayedabad, Dhaka',
    counterBn: 'সায়েদাবাদ, ঢাকা',
    routes: ["Dhaka → Cox's Bazar", 'Dhaka → Chittagong', 'Dhaka → Khulna', 'Dhaka → Rajshahi'],
    routesBn: ["ঢাকা → কক্সবাজার", 'ঢাকা → চট্টগ্রাম', 'ঢাকা → খুলনা', 'ঢাকা → রাজশাহী'],
    amenities: ['AC', 'Scania Coach', 'Comfortable Seats'],
    info: 'Hanif Enterprise serves major routes with Scania AC coaches. One of the oldest operators.',
    infoBn: 'হানিফ এন্টারপ্রাইজ স্কানিয়া এসি কোচে প্রধান রুটে সেবা দেয়।',
  },
  {
    id: 'shyamoli', gradient: ['#b46a13', '#f7b955'], abbr: 'SH',
    name: 'Shyamoli NR', nameBn: 'শ্যামলী এনআর',
    type: 'Non-AC · 40 seats', typeBn: 'নন-এসি · ৪০ আসন',
    dep: '08:00 PM', arr: '07:00 AM', dur: '11h', durBn: '১১ঘ',
    fare: '৮৫০', seats: 'Few seats', seatsBn: 'কয়েকটি বাকি',
    rating: 4.1, premium: false,
    phone: '01711-012334',
    counter: 'Kalyanpur, Dhaka',
    counterBn: 'কল্যাণপুর, ঢাকা',
    routes: ["Dhaka → Cox's Bazar", 'Dhaka → Sylhet', 'Dhaka → Jessore'],
    routesBn: ["ঢাকা → কক্সবাজার", 'ঢাকা → সিলেট', 'ঢাকা → যশোর'],
    amenities: ['Non-AC', 'Budget Friendly', '40 Seats'],
    info: 'Shyamoli NR offers budget-friendly travel to major destinations across Bangladesh.',
    infoBn: 'শ্যামলী এনআর সাশ্রয়ী মূল্যে বাংলাদেশের প্রধান গন্তব্যে সেবা দেয়।',
  },
  {
    id: 'royal', gradient: ['#0c8a62', '#1a3a8b'], abbr: 'RY',
    name: 'Royal Coach', nameBn: 'রয়্যাল কোচ',
    type: 'Hino AC Sleeper · 24 seats', typeBn: 'হিনো এসি স্লিপার · ২৪ আসন',
    dep: '11:00 PM', arr: '08:30 AM', dur: '9h 30m', durBn: '৯ঘ ৩০মি',
    fare: '২,১০০', seats: '4 seats', seatsBn: '৪ আসন বাকি',
    rating: 4.8, premium: true,
    phone: '01885-000001',
    counter: 'Fakirapool, Dhaka',
    counterBn: 'ফকিরাপুল, ঢাকা',
    routes: ["Dhaka → Cox's Bazar", 'Dhaka → Chittagong'],
    routesBn: ["ঢাকা → কক্সবাজার", 'ঢাকা → চট্টগ্রাম'],
    amenities: ['AC Sleeper', 'Hino Coach', 'Blanket', 'Water', 'Snacks'],
    info: 'Royal Coach provides premium sleeper service with Hino coaches for long-distance travel.',
    infoBn: 'রয়্যাল কোচ দূরপাল্লার ভ্রমণে হিনো কোচে প্রিমিয়াম স্লিপার সেবা দেয়।',
  },
];

const MODES = [
  { key: 'bus', icon: '🚌', labelEn: 'Bus', labelBn: 'বাস' },
  { key: 'train', icon: '🚆', labelEn: 'Train', labelBn: 'ট্রেন' },
  { key: 'plane', icon: '✈️', labelEn: 'Flight', labelBn: 'ফ্লাইট' },
  { key: 'launch', icon: '⛴', labelEn: 'Launch', labelBn: 'লঞ্চ' },
];

type OperatorType = typeof FEATURED_OPERATORS[0];

const IntercityHub: React.FC<IntercityHubProps> = ({ onBack, language }) => {
  const L = (en: string, bn: string) => language === 'bn' ? bn : en;
  const [from, setFrom] = useState('Dhaka');
  const [to, setTo] = useState('');
  const [activeMode, setActiveMode] = useState('bus');
  const [nameQuery, setNameQuery] = useState('');
  const [searchDone, setSearchDone] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<OperatorType | null>(null);

  const districtOptions = useMemo(
    () => [...new Set(INTERCITY_BUS_ROUTES.map((r) => r.district))]
      .sort()
      .map((d) => ({ id: d, name: d })),
    [],
  );

  // Filter routes for search results
  const searchResults = useMemo(() => {
    if (!searchDone || !to) return [];
    return INTERCITY_BUS_ROUTES.filter(r =>
      r.district.toLowerCase() === to.toLowerCase() &&
      (r.busOperators.length > 0 && r.busOperators[0] !== 'Hub for all buses')
    );
  }, [searchDone, to]);

  // Name search results — filter operators by name query
  const nameResults = useMemo(() => {
    if (!nameQuery.trim()) return [];
    const q = nameQuery.toLowerCase();
    const hits: { district: string; operator: string; route: string; costNonAC: string; costAC: string; phone: string }[] = [];
    INTERCITY_BUS_ROUTES.forEach(r => {
      r.busOperators.forEach(op => {
        if (op.toLowerCase().includes(q) && op !== 'Hub for all buses') {
          hits.push({ district: r.district, operator: op, route: r.route, costNonAC: r.costNonAC, costAC: r.costAC, phone: r.mainContactNumber });
        }
      });
    });
    return hits.slice(0, 12);
  }, [nameQuery]);

  // Operator detail page — new UI matching design spec
  const [detailTab, setDetailTab] = React.useState<'route'|'amenities'|'info'>('route');
  if (selectedOperator) {
    const op = selectedOperator;

    const ROUTE_STOPS = [
      { en: 'Sayedabad Counter', bn: 'সায়েদাবাদ কাউন্টার', time: op.dep, kind: 'boarding' },
      { en: 'Jatrabari', bn: 'যাত্রাবাড়ী', time: '', kind: 'stop' },
      { en: 'Kanchpur Bridge', bn: 'কাঁচপুর সেতু', time: '', kind: 'stop' },
      { en: 'Comilla Cantonment', bn: 'কুমিল্লা ক্যান্টনমেন্ট', time: '2:30 AM', kind: 'rest' },
      { en: 'Feni', bn: 'ফেনী', time: '4:15 AM', kind: 'stop' },
      { en: 'Chittagong', bn: 'চট্টগ্রাম', time: '6:00 AM', kind: 'stop' },
      { en: 'Kolatoli Terminal', bn: 'কলাতলী টার্মিনাল', time: op.arr, kind: 'arrival' },
    ];
    const base = Number(op.fare.replace(',','')) * 2;
    const total = base + 50 + 40 - 150;

    return (
      <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">
        {/* Back bar */}
        <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
          <button onClick={() => setSelectedOperator(null)} className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-bengali font-bold text-base text-kj-text flex-1 truncate">{L(op.name, op.nameBn)}</span>
          {op.premium && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans" style={{ background: 'var(--kj-amber-soft)', color: 'var(--kj-amber)' }}>★ Premium</span>}
        </div>

        {/* Gradient hero banner */}
        <div className="mx-4 mt-4 rounded-[22px] p-5 relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${op.gradient[0]} 0%, ${op.gradient[1]} 75%)` }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none kj-anim-pulse" />
          <div className="absolute right-20 bottom-[-10px] w-28 h-28 rounded-full bg-white/07 pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            {/* Brand info */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-[14px] bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-base font-sans shrink-0">{op.abbr}</div>
                <div>
                  <p className="font-bengali font-bold text-lg leading-tight">{L(op.name, op.nameBn)}</p>
                  <p className="text-white/80 text-sm font-bengali">{L(op.type, op.typeBn)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(op.rating) ? 'fill-yellow-300 text-yellow-300' : 'text-white/30'}`} />)}
                  <span className="text-[12px] font-bold ml-1 font-sans">{op.rating}</span>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-sans font-bold" style={{ background: 'rgba(0,0,0,0.25)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 kj-anim-pulse inline-block" />
                  {L('Live info', 'লাইভ তথ্য')}
                </span>
              </div>
            </div>

            {/* Journey strip */}
            <div className="rounded-[14px] px-4 py-3 flex items-center gap-4 shrink-0" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}>
              <div className="text-center">
                <p className="font-sans text-[9px] font-bold uppercase tracking-[1.2px] opacity-70">{L('DEPART', 'ছাড়বে')}</p>
                <p className="font-sans font-black text-[22px] leading-tight tracking-tight">{op.dep}</p>
                <p className="font-bengali text-[11px] opacity-80">{L('Sayedabad', 'সায়েদাবাদ')}</p>
              </div>
              <div className="flex flex-col items-center gap-1 min-w-[70px]">
                <span className="font-sans text-[10px] font-bold opacity-80">{L(op.dur, op.durBn)}</span>
                <div className="w-full h-px bg-white/40 relative"><span className="absolute left-1/2 -top-3 -translate-x-1/2 text-base">🚌</span></div>
                <span className="font-sans text-[9px] font-bold opacity-60 tracking-[1px]">NONSTOP</span>
              </div>
              <div className="text-center">
                <p className="font-sans text-[9px] font-bold uppercase tracking-[1.2px] opacity-70">{L('ARRIVE', 'পৌঁছাবে')}</p>
                <p className="font-sans font-black text-[22px] leading-tight tracking-tight">{op.arr}</p>
                <p className="font-bengali text-[11px] opacity-80">{L('Kolatoli', 'কলাতলী')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="px-4 sm:px-6 py-5 grid md:grid-cols-[1.5fr_1fr] gap-5 max-w-[1100px] mx-auto w-full">

          {/* LEFT COLUMN */}
          <div className="space-y-4">

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {([
                { id: 'route', en: '🛣 Route & stops', bn: '🛣 রুট ও স্টপ' },
                { id: 'amenities', en: '🚌 Amenities', bn: '🚌 সুবিধাসমূহ' },
                { id: 'info', en: 'ℹ️ Info', bn: 'ℹ️ তথ্য' },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setDetailTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border font-bengali ${detailTab === tab.id ? 'text-kj-primary-ink border-kj-primary' : 'bg-kj-panel-muted text-kj-text border-kj-line hover:border-kj-primary/40'}`}
                  style={detailTab === tab.id ? { background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' } : undefined}>
                  {L(tab.en, tab.bn)}
                </button>
              ))}
            </div>

            {/* Route & stops tab */}
            {detailTab === 'route' && (
              <div className="dc-card rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans mb-4">{L('Boarding points & route', 'বোর্ডিং পয়েন্ট ও রুট')}</p>
                <div className="space-y-0">
                  {ROUTE_STOPS.map((s, i) => (
                    <div key={i} className="flex gap-3 relative" style={{ paddingBottom: i < ROUTE_STOPS.length - 1 ? 14 : 0 }}>
                      <div className="flex flex-col items-center shrink-0" style={{ width: 18 }}>
                        <div className={`rounded-full mt-1 z-10 ${
                          s.kind === 'boarding' ? 'w-4 h-4 border-2 border-kj-primary bg-kj-primary' :
                          s.kind === 'arrival'  ? 'w-4 h-4 border-2 border-kj-accent bg-kj-accent' :
                          s.kind === 'rest'     ? 'w-3.5 h-3.5 border-2 border-kj-amber bg-kj-amber' :
                          'w-2.5 h-2.5 border-2 border-kj-line bg-kj-panel'
                        }`} />
                        {i < ROUTE_STOPS.length - 1 && (
                          <div className={`w-0.5 flex-1 mt-1 ${s.kind === 'rest' ? 'bg-kj-amber/50' : 'bg-kj-primary/40'}`} style={{ minHeight: 20 }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bengali text-sm ${s.kind === 'boarding' || s.kind === 'arrival' ? 'font-bold text-kj-text' : 'font-medium text-kj-text-dim'}`}>{L(s.en, s.bn)}</span>
                          {s.kind === 'boarding' && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans" style={{ background: 'var(--kj-primary-soft)', color: 'var(--kj-primary)' }}>{L('Boarding', 'বোর্ডিং')}</span>}
                          {s.kind === 'arrival'  && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans" style={{ background: 'var(--kj-accent-soft)', color: 'var(--kj-accent)' }}>{L('Destination', 'গন্তব্য')}</span>}
                          {s.kind === 'rest'     && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans" style={{ background: 'var(--kj-amber-soft)', color: 'var(--kj-amber)' }}>{L('Rest · 20 min', 'বিরতি · ২০ মি')}</span>}
                        </div>
                        {s.time && <p className="text-[11px] text-kj-text-faint mt-0.5 font-sans">{s.time}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities tab */}
            {detailTab === 'amenities' && (
              <div className="dc-card rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans mb-4">{L('On-board amenities', 'বাসের সুবিধাসমূহ')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { ic: op.amenities.includes('AC') || op.amenities.includes('AC Sleeper') ? '❄️' : '🌡️', lbl: L('Air Conditioning', 'এয়ার কন্ডিশনিং'), ok: op.amenities.some(a => a.includes('AC')) },
                    { ic: '🪑', lbl: L('Recliner seats', 'রিক্লাইনার সিট'), ok: op.amenities.some(a => a.includes('Sleeper') || a.includes('Volvo')) },
                    { ic: '🔌', lbl: L('Charging port', 'চার্জার পোর্ট'), ok: op.amenities.some(a => a.includes('Charg') || a.includes('Volvo')) },
                    { ic: '💧', lbl: L('Water', 'পানি'), ok: op.amenities.includes('Water') },
                    { ic: '🍬', lbl: L('Snacks', 'স্ন্যাকস'), ok: op.amenities.includes('Snacks') },
                    { ic: '📶', lbl: L('WiFi', 'ওয়াইফাই'), ok: false },
                    { ic: '🚽', lbl: L('Toilet', 'টয়লেট'), ok: op.type.includes('Sleeper') },
                    { ic: '📺', lbl: L('Entertainment', 'বিনোদন'), ok: op.amenities.some(a => a.includes('Volvo') || a.includes('Hino')) },
                  ].map((item, i) => (
                    <div key={i} className={`dc-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-center ${!item.ok ? 'opacity-40' : ''}`}>
                      <span className="text-xl">{item.ic}</span>
                      <p className="font-bengali text-[11px] text-kj-text-dim leading-tight">{item.lbl}</p>
                      <span className={`text-[10px] font-bold font-sans ${item.ok ? 'text-kj-primary' : 'text-kj-text-faint'}`}>{item.ok ? L('✓ Available', '✓ আছে') : L('✗ N/A', '✗ নেই')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info tab */}
            {detailTab === 'info' && (
              <div className="dc-card rounded-2xl p-4 space-y-3">
                <div><p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans mb-2">{L('About operator', 'অপারেটর সম্পর্কে')}</p><p className="font-bengali text-sm text-kj-text-dim leading-relaxed">{L(op.info, op.infoBn)}</p></div>
                <div className="pt-3 border-t border-kj-line"><p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans mb-2">{L('Routes', 'রুটসমূহ')}</p>{op.routes.map((r, i) => (<div key={i} className="flex items-center gap-2 py-1.5 border-b border-kj-line/50 last:border-0"><Bus className="w-4 h-4 text-kj-primary shrink-0" /><span className="font-bengali text-sm text-kj-text">{L(r, op.routesBn[i])}</span></div>))}</div>
                <div className="pt-3 border-t border-kj-line flex items-center gap-3"><Phone className="w-4 h-4 text-kj-primary shrink-0" /><div><p className="text-[10px] font-bold uppercase text-kj-text-faint font-sans">{L('Phone', 'ফোন')}</p><p className="font-sans font-bold text-kj-text">{op.phone}</p></div></div>
                <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-kj-amber shrink-0 mt-0.5" /><div><p className="text-[10px] font-bold uppercase text-kj-text-faint font-sans">{L('Counter', 'কাউন্টার')}</p><p className="font-bengali text-sm text-kj-text">{L(op.counter, op.counterBn)}</p></div></div>
              </div>
            )}

            <SponsoredAdSlot language={language} size="728x90" compact />
          </div>

          {/* RIGHT COLUMN — Price & booking info */}
          <div className="space-y-4">
            {/* Price breakdown */}
            <div className="dc-card rounded-2xl p-4" style={{ background: `linear-gradient(150deg, ${op.gradient[0]}15, var(--kj-panel))` }}>
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans mb-4">{L('Price info', 'মূল্য তথ্য')}</p>
              <div className="space-y-2.5 mb-4">
                {[
                  { label: L('Base fare (×2)', 'মূল ভাড়া (×২)'), value: `৳ ${(Number(op.fare.replace(',','')) * 2).toLocaleString()}` },
                  { label: L('Service fee', 'সার্ভিস ফি'), value: '৳ 50' },
                  { label: L('Insurance', 'বীমা'), value: '৳ 40' },
                  { label: L('Discount', 'ছাড়'), value: '−৳ 150', accent: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-bengali text-kj-text-dim">{row.label}</span>
                    <span className={`font-sans font-bold ${row.accent ? 'text-emerald-500' : 'text-kj-text'}`}>{row.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-kj-line">
                  <span className="font-bengali font-bold text-kj-text">{L('Total (2 seats)', 'মোট (২ সিট)')}</span>
                  <span className="font-sans font-black text-2xl text-kj-primary">৳ {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment methods */}
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans mb-2">{L('Payment methods', 'পেমেন্ট পদ্ধতি')}</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {['bKash', 'Nagad', 'Rocket', 'Card'].map(m => (
                  <span key={m} className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-sans bg-kj-chip-bg text-kj-text border border-kj-line">{m}</span>
                ))}
              </div>

              {/* CTA */}
              <div className="rounded-xl p-4 text-center mb-3" style={{ background: `linear-gradient(135deg, ${op.gradient[0]}, ${op.gradient[1]})` }}>
                <p className="font-bengali text-white font-bold text-base mb-1">{L('Info only', 'শুধু তথ্য')}</p>
                <p className="font-bengali text-white/75 text-xs mb-3">{L('KoyJabo does not sell tickets', 'কয়জাবো টিকিট বিক্রি করে না')}</p>
                <a href={`https://www.google.com/search?q=${op.name}+bus+ticket+Bangladesh`} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-2.5 rounded-xl font-bold text-sm font-bengali text-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  {L('Visit operator site ↗', 'অপারেটর সাইটে যান ↗')}
                </a>
              </div>
            </div>

            {/* Operator stats */}
            <div className="dc-card rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans mb-3">{L('Operator facts', 'অপারেটর তথ্য')}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { v: '★ ' + op.rating, l: L('Rating', 'রেটিং') },
                  { v: op.routes.length + '+', l: L('Routes', 'রুট') },
                  { v: op.premium ? 'Premium' : 'Standard', l: L('Tier', 'শ্রেণী') },
                ].map((s, i) => (
                  <div key={i} className="bg-kj-chip-bg rounded-xl p-2.5">
                    <p className="font-sans font-black text-kj-primary text-base leading-tight">{s.v}</p>
                    <p className="text-[9px] font-bold uppercase tracking-[1px] text-kj-text-faint mt-0.5 font-sans">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 bg-kj-panel-muted border border-kj-line rounded-xl p-3.5">
              <Zap className="w-4 h-4 text-kj-amber shrink-0 mt-0.5" />
              <p className="text-xs text-kj-text-faint leading-relaxed font-bengali">{L('KoyJabo shows info only · buy tickets at operator counters or official websites', 'কয়জাবো শুধু তথ্য দেখায় · টিকিট কিনতে অপারেটর কাউন্টারে যান')}</p>
            </div>

            <SponsoredAdSlot language={language} size="300x250" compact />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">

      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button onClick={onBack} className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bengali font-bold text-base text-kj-text">{L('Intercity', 'আন্তঃজেলা')}</span>
        {searchDone && to && (
          <button onClick={() => { setSearchDone(false); setTo(''); }} className="ml-auto text-xs text-kj-primary font-bold font-bengali flex items-center gap-1">
            <X className="w-3 h-3" /> {L('Clear', 'মুছুন')}
          </button>
        )}
      </div>

      <div className="px-4 sm:px-6 md:px-10 py-5 space-y-5 w-full max-w-[1200px] mx-auto">

        {/* Page title */}
        {!searchDone && (
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
              {L('✦ KoyJabo · Intercity · 64 districts', '✦ কই যাবো · আন্তঃজেলা · ৬৪ জেলা কভার')}
            </span>
            <h1 className="font-bengali font-bold leading-tight tracking-tight text-balance mt-1.5 text-kj-text" style={{ fontSize: 26 }}>
              {L('Travel anywhere in Bangladesh', 'বাংলাদেশের যেকোনো প্রান্তে যান')}
            </h1>
            <div className="flex gap-5 mt-3 flex-wrap">
              {[{ v: '64', l: L('Districts', 'জেলা') }, { v: '4', l: L('Modes', 'মাধ্যম') }, { v: '500+', l: L('Routes', 'রুট') }, { v: '✦', l: L('All year', 'সারাবছর') }].map((s) => (
                <div key={s.l}>
                  <div className="font-sans font-extrabold text-[18px] tracking-tight leading-none text-kj-primary">{s.v}</div>
                  <div className="font-sans text-[9px] font-bold uppercase tracking-[1.2px] text-kj-text-faint mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search card */}
        <div className="dc-card rounded-[22px] p-5 space-y-4">
          {/* Name search with live results */}
          <div>
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-kj-primary-ink shrink-0 kj-anim-glow" style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}>
                <Search className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">{L('Search by name or number', 'নাম বা নম্বর দিয়ে খুঁজুন')}</p>
                <input type="text" value={nameQuery} onChange={e => setNameQuery(e.target.value)}
                  placeholder={L("e.g. Green Line, Hanif, Shyamoli...", "যেমন: গ্রীন লাইন, হানিফ, শ্যামলী...")}
                  className="w-full bg-transparent text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none mt-0.5 font-bengali" />
              </div>
              {nameQuery && <button onClick={() => setNameQuery('')} className="text-kj-text-faint hover:text-kj-text"><X className="w-4 h-4" /></button>}
            </div>

            {/* Live name search results */}
            {nameResults.length > 0 && (
              <div className="dc-card rounded-[14px] mt-2 divide-y divide-kj-line">
                {nameResults.map((r, i) => (
                  <div key={i} className="px-3.5 py-2.5 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-kj-primary-soft flex items-center justify-center shrink-0"><Bus className="w-3.5 h-3.5 text-kj-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bengali font-bold text-sm text-kj-text truncate">{r.operator}</p>
                      <p className="font-bengali text-[11px] text-kj-text-dim truncate">{r.route}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {r.costAC !== '-' && <p className="text-[11px] font-bold text-kj-primary font-sans">{r.costAC}</p>}
                      {r.costNonAC !== '-' && <p className="text-[10px] text-kj-text-faint font-sans">{r.costNonAC}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-kj-line" />
            <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">{L('Or · search by route', 'অথবা · রুট দিয়ে খুঁজুন')}</span>
            <span className="h-px flex-1 bg-kj-line" />
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2 flex-wrap">
            {MODES.map((m) => (
              <button key={m.key} onClick={() => setActiveMode(m.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border font-bengali ${activeMode === m.key ? 'text-kj-primary-ink border-kj-primary' : 'bg-kj-panel-muted text-kj-text border-kj-line hover:border-kj-primary/40'}`}
                style={activeMode === m.key ? { background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))', boxShadow: '0 4px 12px -4px var(--kj-primary)' } : undefined}>
                <span>{m.icon}</span><span>{L(m.labelEn, m.labelBn)}</span>
              </button>
            ))}
          </div>

          {/* From / Swap / To */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--kj-primary-soft)' }}><MapPin className="w-3 h-3 text-kj-primary" /></div>
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">{L('From', 'কোথা থেকে')}</span>
              </div>
              <SearchableSelect variant="embedded" placeholder={L('Dhaka', 'ঢাকা')} value={from} onChange={setFrom} options={districtOptions} />
            </div>
            <button onClick={() => { const tmp = from; setFrom(to || from); setTo(tmp); }} className="w-9 h-9 rounded-full border border-kj-line bg-kj-panel flex items-center justify-center text-kj-text-dim hover:border-kj-primary/50 hover:text-kj-primary active:scale-90 transition-all mx-auto shrink-0">
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--kj-accent-soft)' }}><Flag className="w-3 h-3 text-kj-accent" /></div>
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">{L('To', 'কোথায়')}</span>
              </div>
              <SearchableSelect variant="embedded" placeholder={L('Select destination', 'গন্তব্য বেছে নিন')} value={to} onChange={setTo} options={districtOptions} />
            </div>
          </div>

          {/* Date + Passengers */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 flex items-center gap-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--kj-amber-soft)' }}><Calendar className="w-3.5 h-3.5 text-kj-amber" /></div>
              <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">{L('Departure', 'যাত্রার তারিখ')}</p><p className="text-sm font-bengali font-semibold text-kj-text truncate">{L('Today', 'আজকে')}</p></div>
            </div>
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 flex items-center gap-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-kj-chip-bg flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-kj-text-dim" /></div>
              <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">{L('Passengers', 'যাত্রী')}</p><p className="text-sm font-bengali font-semibold text-kj-text truncate">{L('1 adult', '১ জন')}</p></div>
            </div>
          </div>

          {/* Search button */}
          <button disabled={!from || !to} onClick={() => { setSearchDone(true); }}
            className="w-full h-12 font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all font-bengali text-kj-primary-ink"
            style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))', boxShadow: '0 8px 22px -10px var(--kj-primary)' }}>
            <Search className="w-4 h-4" />
            {L('Search Routes', 'রুট খুঁজুন')}
          </button>
        </div>

        {/* ── SEARCH RESULTS (shown after search) ── */}
        {searchDone && to && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">{L(`${from} → ${to}`, `${from} → ${to}`)}</p>
                <h2 className="font-bengali font-bold text-base text-kj-text mt-0.5">{searchResults.length > 0 ? L(`${searchResults.length} operators found`, `${searchResults.length}টি অপারেটর পাওয়া গেছে`) : L('No operators found', 'কোনো অপারেটর পাওয়া যায়নি')}</h2>
              </div>
            </div>

            {searchResults.length === 0 ? (
              <div className="dc-card rounded-2xl p-8 text-center">
                <Bus className="w-10 h-10 text-kj-text-faint mx-auto mb-3" />
                <p className="font-bengali text-kj-text-dim">{L(`No direct bus found to ${to}. Try a nearby district.`, `${to}-এ সরাসরি বাস পাওয়া যায়নি। কাছের জেলা চেষ্টা করুন।`)}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((r, i) => (
                  <div key={i} className="dc-card rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bengali font-bold text-kj-text text-sm">{r.route || `${from} → ${r.district}`}</p>
                        <p className="text-[11px] text-kj-text-dim font-bengali mt-0.5">{r.division} Division</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        {r.costAC !== '-' && <p className="text-kj-primary font-bold text-sm font-sans">{r.costAC} <span className="text-[9px] font-normal">AC</span></p>}
                        {r.costNonAC !== '-' && <p className="text-kj-text-dim text-[11px] font-sans">{r.costNonAC} Non-AC</p>}
                      </div>
                    </div>

                    {/* Operators */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {r.busOperators.slice(0, 5).map((op, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-full text-[11px] font-medium font-bengali" style={{ background: 'var(--kj-chip-bg)', color: 'var(--kj-chip-text)' }}>{op}</span>
                      ))}
                      {r.busOperators.length > 5 && <span className="text-[11px] text-kj-text-faint font-sans">+{r.busOperators.length - 5} more</span>}
                    </div>

                    {r.mainContactNumber !== '-' && (
                      <div className="flex items-center gap-1.5 pt-2.5 border-t border-dashed border-kj-line">
                        <Phone className="w-3 h-3 text-kj-text-faint" />
                        <span className="text-[11px] text-kj-text-faint font-sans">{r.mainContactNumber}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <SponsoredAdSlot language={language} size="728x90" compact />

            <div className="flex items-start gap-2.5 bg-kj-panel-muted border border-kj-line rounded-xl p-3.5">
              <Zap className="w-4 h-4 text-kj-amber shrink-0 mt-0.5" />
              <p className="text-xs text-kj-text-faint leading-relaxed font-bengali">{L('KoyJabo shows info only · buy tickets at operator counters', 'কয়জাবো শুধু তথ্য দেখায় · অপারেটর কাউন্টারে টিকিট কিনুন')}</p>
            </div>
          </section>
        )}

        {/* ── DEFAULT VIEW (before search) ── */}
        {!searchDone && (
          <>
            {/* Featured operators */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">{L("Dhaka → Cox's Bazar · Today", 'ঢাকা → কক্সবাজার · আজকে')}</p>
                <h2 className="font-bengali font-bold text-base text-kj-text mt-0.5">{L('Popular Operators', 'জনপ্রিয় পরিবহন')}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURED_OPERATORS.map((b) => (
                <div key={b.id} className="dc-card rounded-2xl p-4 flex flex-col gap-3 relative" style={b.premium ? { borderColor: 'var(--kj-amber)' } : undefined}>
                  {b.premium && <div className="absolute top-3 right-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans" style={{ background: 'var(--kj-amber-soft)', color: 'var(--kj-amber)' }}>★ {L('Premium', 'প্রিমিয়াম')}</span></div>}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-[12px] flex items-center justify-center font-bold text-sm text-white shrink-0 font-sans" style={{ background: `linear-gradient(135deg, ${b.gradient[0]}, ${b.gradient[1]})` }}>{b.abbr}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bengali font-bold text-kj-text text-sm truncate">{L(b.name, b.nameBn)}</p>
                      <p className="font-bengali text-[12px] text-kj-text-dim truncate">{L(b.type, b.typeBn)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0"><Star className="w-3 h-3 text-kj-amber" fill="currentColor" /><span className="text-[12px] font-bold text-kj-text font-sans">{b.rating}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-center"><p className="font-sans font-bold text-[17px] text-kj-text leading-none">{b.dep}</p><p className="font-bengali text-[11px] text-kj-text-faint mt-0.5">{L('Sayedabad', 'সায়েদাবাদ')}</p></div>
                    <div className="flex-1 relative"><div className="h-px bg-kj-line" /><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-[10px] font-bold text-kj-text-faint uppercase tracking-[1px] font-sans" style={{ background: 'var(--kj-panel)' }}>{L(b.dur, b.durBn)}</span></div>
                    <div className="text-center"><p className="font-sans font-bold text-[17px] text-kj-text leading-none">{b.arr}</p><p className="font-bengali text-[11px] text-kj-text-faint mt-0.5">{L('Kolatoli', 'কলাতলী')}</p></div>
                  </div>
                  <div className="flex items-center gap-2 pt-2.5 border-t border-dashed border-kj-line">
                    <span className="text-[11px] text-kj-primary font-semibold font-bengali flex-1">{L(b.seats, b.seatsBn)}</span>
                    <span className="font-sans font-bold text-[20px] text-kj-text leading-none tracking-tight">৳ {b.fare}</span>
                    <button onClick={() => setSelectedOperator(b)}
                      className="px-3 py-2 rounded-[10px] text-[12px] font-bold transition-all active:scale-95 text-kj-primary-ink font-sans"
                      style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}>
                      {L('Details', 'বিস্তারিত')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <SponsoredAdSlot language={language} size="300x250" compact />

            {/* Popular routes */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-kj-amber" fill="currentColor" /><h2 className="text-sm font-bold text-kj-text font-bengali">{L('Popular Routes', 'জনপ্রিয় রুট')}</h2></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {POPULAR.map((r) => (
                  <button key={`${r.from}-${r.to}`} onClick={() => { setFrom(r.from); setTo(r.to); setSearchDone(true); }}
                    className="dc-card rounded-2xl p-3.5 text-left hover:border-kj-primary/40 active:scale-[0.98] transition-all group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl leading-none">{r.icon}</span>
                        <div>
                          <p className="font-bengali font-bold text-kj-text text-sm group-hover:text-kj-primary transition-colors">{L(`${r.from} → ${r.to}`, `${r.fromBn} → ${r.toBn}`)}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-0.5 text-[10px] text-kj-text-faint font-bengali"><Clock className="w-3 h-3" /> {L(r.dur, r.durBn)}</span>
                            {r.tag && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold font-sans" style={{ background: 'var(--kj-primary-soft)', color: 'var(--kj-primary)' }}>{L(r.tag, r.tagBn)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0"><div className="text-kj-primary font-bold text-base font-sans">{r.fare}</div><div className="text-[9px] text-kj-text-faint font-bengali">{L('from', 'থেকে')}</div></div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <SponsoredAdSlot language={language} size="728x90" compact />

            {/* Info disclaimer */}
            <div className="flex items-start gap-2.5 bg-kj-panel-muted border border-kj-line rounded-xl p-3.5">
              <Zap className="w-4 h-4 text-kj-amber shrink-0 mt-0.5" />
              <p className="text-xs text-kj-text-faint leading-relaxed font-bengali">{L('KoyJabo shows routes & fares only · purchase tickets at operator counters or official websites', 'কয়জাবো শুধু রুট ও ভাড়া দেখায় · টিকিট কিনতে অপারেটর কাউন্টারে বা অফিশিয়াল সাইটে যান')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IntercityHub;
