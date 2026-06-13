import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Bus, Plane, Search, Ship, Train } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { INTERCITY_BUS_ROUTES } from '../data/intercityData';

interface IntercityHubProps {
  onBack: () => void;
  language: 'en' | 'bn';
  onSearch: (from: string, to: string) => void;
}

const POPULAR = [
  { from: 'Dhaka', to: "Cox's Bazar", fromBn: 'ঢাকা', toBn: 'কক্সবাজার', fare: '৳900' },
  { from: 'Dhaka', to: 'Chattogram', fromBn: 'ঢাকা', toBn: 'চট্টগ্রাম', fare: '৳680' },
  { from: 'Dhaka', to: 'Sylhet', fromBn: 'ঢাকা', toBn: 'সিলেট', fare: '৳650' },
  { from: 'Dhaka', to: 'Rajshahi', fromBn: 'ঢাকা', toBn: 'রাজশাহী', fare: '৳650' },
  { from: 'Dhaka', to: 'Khulna', fromBn: 'ঢাকা', toBn: 'খুলনা', fare: '৳700' },
  { from: 'Dhaka', to: 'Rangpur', fromBn: 'ঢাকা', toBn: 'রংপুর', fare: '৳750' },
];

const IntercityHub: React.FC<IntercityHubProps> = ({ onBack, language, onSearch }) => {
  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const [from, setFrom] = useState('Dhaka');
  const [to, setTo] = useState('');

  const districtOptions = useMemo(
    () => [...new Set(INTERCITY_BUS_ROUTES.map((r) => r.district))]
      .sort()
      .map((d) => ({ id: d, name: d })),
    [],
  );

  const modes = [
    { icon: Bus, label: lbl('Bus', 'বাস'), color: 'text-kj-primary' },
    { icon: Train, label: lbl('Train', 'ট্রেন'), color: 'text-purple-500' },
    { icon: Plane, label: lbl('Flight', 'ফ্লাইট'), color: 'text-sky-500' },
    { icon: Ship, label: lbl('Launch', 'লঞ্চ'), color: 'text-cyan-500' },
  ];

  return (
    <div className="w-full bg-kj-bg">
      <div className="px-4 md:px-10 py-5 md:py-8 max-w-4xl mx-auto">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-kj-text-dim hover:text-kj-text mb-5 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          {lbl('Back to home', 'হোমে ফিরুন')}
        </button>

        <div className="mb-6">
          <h1 className="font-bengali font-bold text-2xl md:text-3xl text-kj-text">{lbl('Intercity travel', 'আন্তঃজেলা ভ্রমণ')}</h1>
          <p className="text-kj-text-dim text-sm mt-1">{lbl('Bus, train, flight and launch across all 64 districts', '৬৪ জেলায় বাস, ট্রেন, ফ্লাইট ও লঞ্চ')}</p>
        </div>

        <div className="dc-card kj-glass rounded-[24px] border border-kj-line p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-2.5 md:gap-3 md:items-stretch">
            <div className="flex-1 bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5">
              <div className="text-[10px] font-semibold text-kj-text-faint uppercase tracking-[1.2px] mb-1">{lbl('From', 'কোথা থেকে')}</div>
              <SearchableSelect variant="embedded" placeholder={lbl('Dhaka', 'ঢাকা')} value={from} onChange={setFrom} options={districtOptions} />
            </div>

            <div className="flex items-center justify-center shrink-0 py-0.5 md:py-0 md:px-1">
              <button
                type="button"
                onClick={() => { const tmp = from; setFrom(to || from); setTo(tmp); }}
                className="w-9 h-9 rounded-full border border-kj-line bg-kj-panel flex items-center justify-center text-kj-text shadow-sm hover:border-kj-primary/50 transition-colors"
                aria-label={lbl('Swap', 'অদলবদল')}
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5">
              <div className="text-[10px] font-semibold text-kj-text-faint uppercase tracking-[1.2px] mb-1">{lbl('To', 'কোথায়')}</div>
              <SearchableSelect variant="embedded" placeholder={lbl('Select district', 'জেলা বেছে নিন')} value={to} onChange={setTo} options={districtOptions} />
            </div>
          </div>

          <button
            type="button"
            disabled={!from || !to}
            onClick={() => onSearch(from, to)}
            className="w-full mt-4 h-12 bg-kj-primary text-kj-primary-ink font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_6px_16px_-6px_rgba(0,245,255,0.6)] hover:brightness-105 transition-all"
          >
            <Search className="w-4 h-4" />
            {lbl('Search routes', 'রুট খুঁজুন')}
          </button>

          <div className="flex flex-wrap gap-2 mt-4">
            {modes.map((m) => (
              <span key={m.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-kj-chip-bg border border-kj-line text-xs font-medium text-kj-text-dim">
                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                {m.label}
              </span>
            ))}
          </div>
        </div>

        <h2 className="font-bengali font-bold text-lg text-kj-text mb-3">{lbl('Popular routes', 'জনপ্রিয় রুট')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {POPULAR.map((r) => (
            <button
              key={`${r.from}-${r.to}`}
              type="button"
              onClick={() => onSearch(r.from, r.to)}
              className="dc-card rounded-2xl p-4 text-left hover:border-kj-primary/30 transition-colors border border-kj-line"
            >
              <p className="font-bengali font-bold text-kj-text text-sm">{lbl(`${r.from} → ${r.to}`, `${r.fromBn} → ${r.toBn}`)}</p>
              <p className="text-kj-primary text-xs mt-1 font-semibold">{lbl('From', 'শুরু')} {r.fare}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntercityHub;
