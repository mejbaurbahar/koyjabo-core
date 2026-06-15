import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowLeftRight, Search,
  Star, Clock, MapPin, Flag, Calendar, Users, ChevronRight, Zap,
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
  },
  {
    id: 'hanif', gradient: ['#d92644', '#ff7a3a'], abbr: 'HF',
    name: 'Hanif Enterprise', nameBn: 'হানিফ এন্টারপ্রাইজ',
    type: 'Scania AC · 36 seats', typeBn: 'স্কানিয়া এসি · ৩৬ আসন',
    dep: '09:15 PM', arr: '07:30 AM', dur: '10h 15m', durBn: '১০ঘ ১৫মি',
    fare: '১,২৫০', seats: '23 seats', seatsBn: '২৩ আসন',
    rating: 4.4, premium: false,
  },
  {
    id: 'shyamoli', gradient: ['#b46a13', '#f7b955'], abbr: 'SH',
    name: 'Shyamoli NR', nameBn: 'শ্যামলী এনআর',
    type: 'Non-AC · 40 seats', typeBn: 'নন-এসি · ৪০ আসন',
    dep: '08:00 PM', arr: '07:00 AM', dur: '11h', durBn: '১১ঘ',
    fare: '৮৫০', seats: 'Few seats', seatsBn: 'কয়েকটি বাকি',
    rating: 4.1, premium: false,
  },
  {
    id: 'royal', gradient: ['#0c8a62', '#1a3a8b'], abbr: 'RY',
    name: 'Royal Coach', nameBn: 'রয়্যাল কোচ',
    type: 'Hino AC Sleeper · 24 seats', typeBn: 'হিনো এসি স্লিপার · ২৪ আসন',
    dep: '11:00 PM', arr: '08:30 AM', dur: '9h 30m', durBn: '৯ঘ ৩০মি',
    fare: '২,১০০', seats: '4 seats', seatsBn: '৪ আসন বাকি',
    rating: 4.8, premium: true,
  },
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

      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bengali font-bold text-base text-kj-text">
          {L('Intercity', 'আন্তঃজেলা')}
        </span>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">

        {/* Page title */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
            {L('✦ KoyJabo · Intercity · 64 districts', '✦ কই যাবো · আন্তঃজেলা · ৬৪ জেলা কভার')}
          </span>
          <h1 className="font-bengali font-bold leading-tight tracking-tight text-balance mt-1.5 text-kj-text" style={{ fontSize: 26 }}>
            {L('Travel anywhere in Bangladesh', 'বাংলাদেশের যেকোনো প্রান্তে যান')}
          </h1>
          <p className="font-bengali text-[13px] text-kj-text-dim leading-relaxed mt-1">
            {L('64 districts · bus, train, flight & launch — all in one search.', '৬৪ জেলা · বাস, ট্রেন, ফ্লাইট ও লঞ্চ — একটি খোঁজেই।')}
          </p>

          {/* Stat strip */}
          <div className="flex gap-5 mt-3 flex-wrap">
            {[
              { v: '64', l: L('Districts', 'জেলা') },
              { v: '4', l: L('Modes', 'মাধ্যম') },
              { v: '500+', l: L('Routes', 'রুট') },
              { v: '✦', l: L('All year', 'সারাবছর') },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-sans font-extrabold text-[18px] tracking-tight leading-none text-kj-primary">{s.v}</div>
                <div className="font-sans text-[9px] font-bold uppercase tracking-[1.2px] text-kj-text-faint mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search card */}
        <div className="dc-card rounded-[22px] p-5 space-y-4">

          {/* Name search */}
          <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-3 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center text-kj-primary-ink shrink-0 kj-anim-glow"
              style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}
            >
              <Search className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
                {L('Search by name or number', 'নাম বা নম্বর দিয়ে খুঁজুন')}
              </p>
              <input
                type="text"
                value={nameQuery}
                onChange={e => setNameQuery(e.target.value)}
                placeholder={L("e.g. Green Line, Cox's Bazar Express, BG-437, Sundarban-12...", "যেমন: গ্রীন লাইন, কক্সবাজার এক্সপ্রেস, BG-৪৩৭, সুন্দরবন-১২...")}
                className="w-full bg-transparent text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none mt-0.5 font-bengali"
              />
            </div>
            <div className="hidden sm:flex gap-1 shrink-0">
              {[
                { l: L('Bus', 'বাস'), c: '#10b981' },
                { l: L('Train', 'ট্রেন'), c: '#7c3aed' },
                { l: L('Flight', 'ফ্লাইট'), c: '#3b82f6' },
                { l: L('Launch', 'লঞ্চ'), c: '#0ea5e9' },
              ].map((chip) => (
                <span
                  key={chip.l}
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide font-sans"
                  style={{ background: `${chip.c}22`, color: chip.c }}
                >
                  {chip.l}
                </span>
              ))}
            </div>
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-kj-line" />
            <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border font-bengali ${
                  activeMode === m.key
                    ? 'text-kj-primary-ink border-kj-primary'
                    : 'bg-kj-panel-muted text-kj-text border-kj-line hover:border-kj-primary/40'
                }`}
                style={activeMode === m.key ? {
                  background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
                  boxShadow: '0 4px 12px -4px var(--kj-primary)',
                } : undefined}
              >
                <span>{m.icon}</span>
                <span>{L(m.labelEn, m.labelBn)}</span>
              </button>
            ))}
          </div>

          {/* From / Swap / To */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--kj-primary-soft)' }}>
                  <MapPin className="w-3 h-3 text-kj-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
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
              onClick={() => { const tmp = from; setFrom(to || from); setTo(tmp); }}
              className="w-9 h-9 rounded-full border border-kj-line bg-kj-panel flex items-center justify-center text-kj-text-dim hover:border-kj-primary/50 hover:text-kj-primary active:scale-90 transition-all mx-auto shrink-0"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--kj-accent-soft)' }}>
                  <Flag className="w-3 h-3 text-kj-accent" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
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

          {/* Date + Passengers */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 flex items-center gap-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--kj-amber-soft)' }}>
                <Calendar className="w-3.5 h-3.5 text-kj-amber" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
                  {L('Departure', 'যাত্রার তারিখ')}
                </p>
                <p className="text-sm font-bengali font-semibold text-kj-text truncate">
                  {L('Today', 'আজকে')}
                </p>
              </div>
            </div>
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 flex items-center gap-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-kj-chip-bg flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 text-kj-text-dim" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
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
            className="w-full h-12 font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all font-bengali text-kj-primary-ink"
            style={{
              background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
              boxShadow: '0 8px 22px -10px var(--kj-primary)',
            }}
          >
            <Search className="w-4 h-4" />
            {L('Search Routes', 'রুট খুঁজুন')}
          </button>
        </div>

        {/* Featured operators */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
              {L("Dhaka → Cox's Bazar · Today", 'ঢাকা → কক্সবাজার · আজকে')}
            </p>
            <h2 className="font-bengali font-bold text-base text-kj-text mt-0.5">
              {L('Popular Operators', 'জনপ্রিয় পরিবহন')}
            </h2>
          </div>
          <button className="flex items-center gap-1 text-xs text-kj-primary font-semibold font-bengali">
            {L('Filter', 'ফিল্টার')} <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Operator cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURED_OPERATORS.map((b) => (
            <div
              key={b.id}
              className="dc-card rounded-2xl p-4 flex flex-col gap-3 relative"
              style={b.premium ? { borderColor: 'var(--kj-amber)' } : undefined}
            >
              {b.premium && (
                <div className="absolute top-3 right-3">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans"
                    style={{ background: 'var(--kj-amber-soft)', color: 'var(--kj-amber)' }}
                  >
                    ★ {L('Premium', 'প্রিমিয়াম')}
                  </span>
                </div>
              )}

              {/* Brand row */}
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-[12px] flex items-center justify-center font-bold text-sm text-white shrink-0 font-sans"
                  style={{ background: `linear-gradient(135deg, ${b.gradient[0]}, ${b.gradient[1]})` }}
                >
                  {b.abbr}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bengali font-bold text-kj-text text-sm truncate">{L(b.name, b.nameBn)}</p>
                  <p className="font-bengali text-[12px] text-kj-text-dim truncate">{L(b.type, b.typeBn)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 text-kj-amber" fill="currentColor" />
                  <span className="text-[12px] font-bold text-kj-text font-sans">{b.rating}</span>
                </div>
              </div>

              {/* Journey timeline */}
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="font-sans font-bold text-[17px] text-kj-text leading-none">{b.dep}</p>
                  <p className="font-bengali text-[11px] text-kj-text-faint mt-0.5">{L('Sayedabad', 'সায়েদাবাদ')}</p>
                </div>
                <div className="flex-1 relative">
                  <div className="h-px bg-kj-line" />
                  <span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-[10px] font-bold text-kj-text-faint uppercase tracking-[1px] font-sans"
                    style={{ background: 'var(--kj-panel)' }}
                  >
                    {L(b.dur, b.durBn)}
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-sans font-bold text-[17px] text-kj-text leading-none">{b.arr}</p>
                  <p className="font-bengali text-[11px] text-kj-text-faint mt-0.5">{L('Kolatoli', 'কলাতলী')}</p>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center gap-2 pt-2.5 border-t border-dashed border-kj-line">
                <span className="text-[11px] text-kj-primary font-semibold font-bengali flex-1">
                  {L(b.seats, b.seatsBn)}
                </span>
                <span className="font-sans font-bold text-[20px] text-kj-text leading-none tracking-tight">৳ {b.fare}</span>
                <button
                  onClick={() => onSearch('Dhaka', "Cox's Bazar")}
                  className="px-3 py-2 rounded-[10px] text-[12px] font-bold transition-all active:scale-95 text-kj-primary-ink font-sans"
                  style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}
                >
                  {L('Details', 'বিস্তারিত')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ad slot */}
        <SponsoredAdSlot language={language} size="300x250" compact />

        {/* Popular routes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-kj-amber" fill="currentColor" />
              <h2 className="text-sm font-bold text-kj-text font-bengali">{L('Popular Routes', 'জনপ্রিয় রুট')}</h2>
            </div>
            <button className="flex items-center gap-1 text-xs text-kj-primary font-semibold font-bengali">
              {L('See all', 'সব দেখুন')} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {POPULAR.map((r) => (
              <button
                key={`${r.from}-${r.to}`}
                onClick={() => onSearch(r.from, r.to)}
                className="dc-card rounded-2xl p-3.5 text-left hover:border-kj-primary/40 active:scale-[0.98] transition-all group"
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
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-bold font-sans"
                            style={{ background: 'var(--kj-primary-soft)', color: 'var(--kj-primary)' }}
                          >
                            {L(r.tag, r.tagBn)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-kj-primary font-bold text-base font-sans">{r.fare}</div>
                    <div className="text-[9px] text-kj-text-faint font-bengali">{L('from', 'থেকে')}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Info disclaimer */}
        <div className="flex items-start gap-2.5 bg-kj-panel-muted border border-kj-line rounded-xl p-3.5">
          <Zap className="w-4 h-4 text-kj-amber shrink-0 mt-0.5" />
          <p className="text-xs text-kj-text-faint leading-relaxed font-bengali">
            {L(
              'KoyJabo shows routes & fares only · purchase tickets at operator counters or official websites',
              'কয়জাবো শুধু রুট ও ভাড়া দেখায় · টিকিট কিনতে অপারেটর কাউন্টারে বা অফিশিয়াল সাইটে যান',
            )}
          </p>
        </div>

      </div>
    </div>
  );
};

export default IntercityHub;
