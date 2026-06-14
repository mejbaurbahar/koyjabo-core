import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowLeftRight, Bus, Plane, Search, Ship, Train,
  Star, Clock, MapPin, Flag, Calendar, Users, ChevronRight,
} from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { INTERCITY_BUS_ROUTES } from '../data/intercityData';

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

const MODES = [
  { key: 'bus', icon: '🚌', labelEn: 'Bus', labelBn: 'বাস' },
  { key: 'train', icon: '🚆', labelEn: 'Train', labelBn: 'ট্রেন' },
  { key: 'plane', icon: '✈️', labelEn: 'Flight', labelBn: 'ফ্লাইট' },
  { key: 'launch', icon: '⛴', labelEn: 'Launch', labelBn: 'লঞ্চ' },
];

const IntercityHub: React.FC<IntercityHubProps> = ({ onBack, language, onSearch }) => {
  const L = (en: string, bn: string) => language === 'bn' ? bn : en;
  const [from, setFrom] = useState('Dhaka');
  const [to, setTo] = useState('');
  const [activeMode, setActiveMode] = useState('bus');
  const [nameQuery, setNameQuery] = useState('');

  const districtOptions = useMemo(
    () => [...new Set(INTERCITY_BUS_ROUTES.map((r) => r.district))]
      .sort()
      .map((d) => ({ id: d, name: d })),
    [],
  );

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">

      {/* Sticky back header */}
      <div className="sticky top-0 z-10 bg-kj-bg/90 backdrop-blur-sm border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint">
            {L('INTERCITY · 64 DISTRICTS', 'আন্তঃজেলা · ৬৪ জেলা')}
          </p>
          <h1 className="text-base font-bold text-kj-text leading-none mt-0.5">
            {L('Travel anywhere in Bangladesh', 'বাংলাদেশের যেকোনো প্রান্তে যান')}
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto w-full">

        {/* Search card */}
        <div className="dc-card rounded-[22px] p-4 space-y-3 border border-kj-line shadow-kj-lg">

          {/* Name search */}
          <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-kj-primary-ink shrink-0 kj-anim-glow"
              style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep, #005a3d))' }}>
              <Search className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint">
                {L('Search by name or number', 'নাম বা নম্বর দিয়ে খুঁজুন')}
              </p>
              <input
                type="text"
                value={nameQuery}
                onChange={e => setNameQuery(e.target.value)}
                placeholder={L("e.g. Green Line, Cox's Bazar Express, BG-437...", "যেমন: গ্রীন লাইন, কক্সবাজার এক্সপ্রেস, BG-৪৩৭...")}
                className="w-full bg-transparent text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none mt-0.5 font-bengali"
              />
            </div>
            <div className="flex gap-1 shrink-0">
              {[
                { l: L('Bus', 'বাস'), c: '#10b981' },
                { l: L('Train', 'ট্রেন'), c: '#7c3aed' },
                { l: L('Flight', 'ফ্লাইট'), c: '#3b82f6' },
              ].map((t) => (
                <span key={t.l} className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                  style={{ background: `${t.c}22`, color: t.c }}>
                  {t.l}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-kj-line" />
            <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint">
              {L('Or · search by route', 'অথবা · রুট দিয়ে খুঁজুন')}
            </span>
            <span className="h-px flex-1 bg-kj-line" />
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2 flex-wrap">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMode(m.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                  activeMode === m.key
                    ? 'bg-kj-primary text-kj-primary-ink border-kj-primary'
                    : 'bg-kj-panel-muted text-kj-text border-kj-line hover:border-kj-primary/40'
                }`}
              >
                <span>{m.icon}</span>
                <span className="font-bengali">{L(m.labelEn, m.labelBn)}</span>
              </button>
            ))}
          </div>

          {/* From / Swap / To */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-kj-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint">
                  {L('From', 'কোথা থেকে')}
                </span>
              </div>
              <SearchableSelect
                variant="embedded"
                placeholder={L('Dhaka', 'ঢাকা')}
                value={from}
                onChange={setFrom}
                options={districtOptions}
              />
            </div>

            <button
              onClick={() => { const t = from; setFrom(to || from); setTo(t); }}
              className="w-9 h-9 rounded-full border border-kj-line bg-kj-panel flex items-center justify-center text-kj-text-dim hover:border-kj-primary/50 hover:text-kj-primary active:scale-90 transition-all mx-auto shrink-0"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Flag className="w-3 h-3 text-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint">
                  {L('To', 'কোথায়')}
                </span>
              </div>
              <SearchableSelect
                variant="embedded"
                placeholder={L('Select destination', 'গন্তব্য বেছে নিন')}
                value={to}
                onChange={setTo}
                options={districtOptions}
              />
            </div>
          </div>

          {/* Date + passengers row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3 py-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-kj-accent-soft flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5 text-kj-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint">
                  {L('Departure', 'যাত্রার তারিখ')}
                </p>
                <p className="text-sm font-bengali font-semibold text-kj-text truncate">
                  {L('Today', 'আজকে')}
                </p>
              </div>
            </div>
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3 py-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-kj-chip-bg flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 text-kj-text-dim" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint">
                  {L('Passengers', 'যাত্রী')}
                </p>
                <p className="text-sm font-bengali font-semibold text-kj-text truncate">
                  {L('1 adult', '১ জন')}
                </p>
              </div>
            </div>
          </div>

          {/* Search button */}
          <button
            disabled={!from || !to}
            onClick={() => onSearch(from, to)}
            className="w-full h-12 bg-kj-primary text-kj-primary-ink font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all"
            style={{ boxShadow: '0 8px 22px -10px var(--kj-primary)' }}
          >
            <Search className="w-4 h-4" />
            {L('Search Routes', 'রুট খুঁজুন')}
          </button>
        </div>

        {/* Popular routes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-kj-amber" fill="currentColor" />
              <h2 className="text-sm font-bold text-kj-text">{L('Popular Routes', 'জনপ্রিয় রুট')}</h2>
            </div>
            <button className="flex items-center gap-1 text-xs text-kj-primary font-semibold">
              {L('See all', 'সব দেখুন')} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {POPULAR.map((r) => (
              <button
                key={`${r.from}-${r.to}`}
                onClick={() => onSearch(r.from, r.to)}
                className="dc-card rounded-2xl p-3.5 text-left border border-kj-line hover:border-kj-primary/40 active:scale-[0.98] transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">{r.icon}</span>
                    <div>
                      <p className="font-bengali font-bold text-kj-text text-sm group-hover:text-kj-primary transition-colors">
                        {L(`${r.from} → ${r.to}`, `${r.fromBn} → ${r.toBn}`)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[10px] text-kj-text-faint font-bengali">
                          <Clock className="w-3 h-3" /> {L(r.dur, r.durBn)}
                        </span>
                        {r.tag && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: 'rgba(0,245,255,0.12)', color: 'var(--kj-primary)' }}>
                            {L(r.tag, r.tagBn)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-kj-primary font-bold text-base">{r.fare}</div>
                    <div className="text-[9px] text-kj-text-faint">{L('from', 'থেকে')}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Info */}
        <div className="flex items-start gap-2 bg-kj-panel-muted border border-kj-line rounded-xl p-3">
          <span className="text-kj-amber text-sm shrink-0">⚡</span>
          <p className="text-xs text-kj-text-faint leading-relaxed font-bengali">
            {L(
              'KoyJabo shows routes & fares only · purchase tickets at operator counters or official websites',
              'কয়জাবো শুধু রুট ও ভাড়া দেখায় · টিকিট কিনতে অপারেটর কাউন্টারে বা অফিশিয়াল সাইটে যান'
            )}
          </p>
        </div>

      </div>
    </div>
  );
};

export default IntercityHub;
