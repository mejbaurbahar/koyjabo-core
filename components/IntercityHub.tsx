import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Bus, Plane, Search, Ship, Train, Star, Clock, MapPin, Zap, TrendingUp } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { INTERCITY_BUS_ROUTES } from '../data/intercityData';

interface IntercityHubProps {
  onBack: () => void;
  language: 'en' | 'bn';
  onSearch: (from: string, to: string) => void;
}

const POPULAR = [
  { from: 'Dhaka', to: "Cox's Bazar", fromBn: 'ঢাকা', toBn: 'কক্সবাজার', fare: '৳900', duration: '10–12h', icon: '🏖️', tag: 'popular' },
  { from: 'Dhaka', to: 'Chattogram', fromBn: 'ঢাকা', toBn: 'চট্টগ্রাম', fare: '৳680', duration: '5–6h', icon: '🚢', tag: 'frequent' },
  { from: 'Dhaka', to: 'Sylhet', fromBn: 'ঢাকা', toBn: 'সিলেট', fare: '৳650', duration: '4–5h', icon: '🍃', tag: 'scenic' },
  { from: 'Dhaka', to: 'Rajshahi', fromBn: 'ঢাকা', toBn: 'রাজশাহী', fare: '৳650', duration: '5h', icon: '🍇', tag: 'popular' },
  { from: 'Dhaka', to: 'Khulna', fromBn: 'ঢাকা', toBn: 'খুলনা', fare: '৳700', duration: '7h', icon: '🐯', tag: '' },
  { from: 'Dhaka', to: 'Rangpur', fromBn: 'ঢাকা', toBn: 'রংপুর', fare: '৳750', duration: '6–7h', icon: '🌾', tag: '' },
];

const MODES = [
  { key: 'bus', icon: Bus, labelEn: 'Bus', labelBn: 'বাস', color: 'text-kj-primary', bg: 'bg-kj-primary/10 border-kj-primary/30' },
  { key: 'train', icon: Train, labelEn: 'Train', labelBn: 'ট্রেন', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  { key: 'plane', icon: Plane, labelEn: 'Flight', labelBn: 'ফ্লাইট', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
  { key: 'launch', icon: Ship, labelEn: 'Launch', labelBn: 'লঞ্চ', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
];

const STATS = [
  { value: '64', labelEn: 'Districts', labelBn: 'জেলা' },
  { value: '500+', labelEn: 'Operators', labelBn: 'অপারেটর' },
  { value: '৳300', labelEn: 'Min Fare', labelBn: 'সর্বনিম্ন' },
  { value: '4 Modes', labelEn: 'Transport', labelBn: 'মাধ্যম' },
];

const IntercityHub: React.FC<IntercityHubProps> = ({ onBack, language, onSearch }) => {
  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const [from, setFrom] = useState('Dhaka');
  const [to, setTo] = useState('');
  const [activeMode, setActiveMode] = useState<string>('bus');

  const districtOptions = useMemo(
    () => [...new Set(INTERCITY_BUS_ROUTES.map((r) => r.district))]
      .sort()
      .map((d) => ({ id: d, name: d })),
    [],
  );

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">

      {/* Back button */}
      <div className="sticky top-0 z-10 bg-kj-bg/80 backdrop-blur-sm border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-kj-panel border border-kj-line text-kj-text-dim hover:text-kj-text active:scale-95 transition-all"
          aria-label={lbl('Back', 'ফিরুন')}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-kj-text leading-none">
            {lbl('Intercity Travel', 'আন্তঃজেলা ভ্রমণ')}
          </h1>
          <p className="text-[11px] text-kj-text-faint mt-0.5">
            {lbl('Bus · Train · Flight · Launch', 'বাস · ট্রেন · ফ্লাইট · লঞ্চ')}
          </p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">

        {/* Hero Banner */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden shadow-kj-lg"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #006a4e 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

          <div className="flex items-start gap-3 mb-4 relative z-10">
            <div className="p-2 bg-white/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                {lbl('Travel anywhere in Bangladesh', 'বাংলাদেশের যেকোনো জেলায় যান')}
              </h2>
              <p className="text-white/75 text-xs mt-0.5">
                {lbl('Compare bus, train, flight & launch in one place', 'এক জায়গায় বাস, ট্রেন, ফ্লাইট ও লঞ্চ তুলনা করুন')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 relative z-10">
            {STATS.map((s) => (
              <div key={s.value} className="bg-white/10 rounded-xl p-2 text-center">
                <div className="text-sm font-bold">{s.value}</div>
                <div className="text-white/70 text-[10px] mt-0.5">{lbl(s.labelEn, s.labelBn)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport Mode Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setActiveMode(m.key)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                activeMode === m.key ? m.bg : 'bg-kj-panel border-kj-line text-kj-text-dim'
              }`}
            >
              <m.icon className={`w-4 h-4 ${activeMode === m.key ? m.color : 'text-kj-text-faint'}`} />
              <span className={activeMode === m.key ? m.color : ''}>{lbl(m.labelEn, m.labelBn)}</span>
            </button>
          ))}
        </div>

        {/* Search Card */}
        <div className="dc-card kj-glass rounded-2xl p-4 space-y-3 border border-kj-line">
          {/* From field */}
          <div className="bg-kj-input-bg border border-kj-line rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-kj-text-faint uppercase tracking-wide">
                {lbl('From', 'কোথা থেকে')}
              </span>
            </div>
            <SearchableSelect
              variant="embedded"
              placeholder={lbl('Dhaka', 'ঢাকা')}
              value={from}
              onChange={setFrom}
              options={districtOptions}
            />
          </div>

          {/* Swap button */}
          <div className="flex justify-center -my-1">
            <button
              type="button"
              onClick={() => { const tmp = from; setFrom(to || from); setTo(tmp); }}
              className="w-9 h-9 rounded-full border border-kj-line bg-kj-panel flex items-center justify-center text-kj-text-dim hover:border-kj-primary/50 hover:text-kj-primary active:scale-90 transition-all shadow-sm"
              aria-label={lbl('Swap', 'অদলবদল')}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* To field */}
          <div className="bg-kj-input-bg border border-kj-line rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-rose-500" />
              <span className="text-[10px] font-bold text-kj-text-faint uppercase tracking-wide">
                {lbl('To', 'কোথায়')}
              </span>
            </div>
            <SearchableSelect
              variant="embedded"
              placeholder={lbl('Select destination', 'গন্তব্য বেছে নিন')}
              value={to}
              onChange={setTo}
              options={districtOptions}
            />
          </div>

          <button
            type="button"
            disabled={!from || !to}
            onClick={() => onSearch(from, to)}
            className="w-full h-12 bg-kj-primary text-kj-primary-ink font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all shadow-[0_4px_14px_-4px_rgba(0,245,255,0.5)]"
          >
            <Search className="w-4 h-4" />
            {lbl('Search Routes', 'রুট খুঁজুন')}
          </button>
        </div>

        {/* Quick tips */}
        <div className="flex gap-2 flex-wrap">
          {[
            { icon: '🌙', textEn: 'Night coaches available', textBn: 'রাতের কোচ পাওয়া যায়' },
            { icon: '❄️', textEn: 'AC buses on major routes', textBn: 'AC বাস আছে' },
            { icon: '🪑', textEn: 'Book seats in advance', textBn: 'আগে আসন বুক করুন' },
          ].map((tip, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-kj-chip-bg border border-kj-line text-xs text-kj-text-dim">
              {tip.icon} {lbl(tip.textEn, tip.textBn)}
            </span>
          ))}
        </div>

        {/* Popular Routes */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-kj-amber" fill="currentColor" />
            <h2 className="text-sm font-bold text-kj-text">{lbl('Popular Routes', 'জনপ্রিয় রুট')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {POPULAR.map((r) => (
              <button
                key={`${r.from}-${r.to}`}
                type="button"
                onClick={() => onSearch(r.from, r.to)}
                className="dc-card rounded-2xl p-3.5 text-left hover:border-kj-primary/40 transition-all border border-kj-line active:scale-[0.98] group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{r.icon}</span>
                    <div>
                      <p className="font-bengali font-bold text-kj-text text-sm group-hover:text-kj-primary transition-colors">
                        {lbl(`${r.from} → ${r.to}`, `${r.fromBn} → ${r.toBn}`)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[10px] text-kj-text-faint">
                          <Clock className="w-3 h-3" />{r.duration}
                        </span>
                        {r.tag && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-kj-primary/10 text-kj-primary font-semibold capitalize">
                            {r.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-kj-primary font-bold text-sm">{r.fare}</div>
                    <div className="text-[9px] text-kj-text-faint">{lbl('from', 'থেকে')}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Info notice */}
        <div className="flex items-start gap-2 bg-kj-panel-muted border border-kj-line rounded-xl p-3">
          <Zap className="w-3.5 h-3.5 text-kj-amber mt-0.5 shrink-0" />
          <p className="text-xs text-kj-text-faint leading-relaxed">
            {lbl(
              'KoyJabo shows routes and fares only · book tickets at operator counters or official websites',
              'কয়জাবো শুধু রুট ও ভাড়া দেখায় · টিকিট কিনতে অপারেটর কাউন্টারে বা অফিশিয়াল সাইটে যান'
            )}
          </p>
        </div>

      </div>
    </div>
  );
};

export default IntercityHub;
