import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, Zap, CreditCard, Info, ChevronRight, Train } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: 'en' | 'bn';
}

const lbl = (language: 'en' | 'bn', en: string, bn: string) =>
  language === 'bn' ? bn : en;

const STATIONS = [
  { name: 'Uttara North', bn: 'উত্তরা নর্থ', fare: 20 },
  { name: 'Uttara Centre', bn: 'উত্তরা সেন্টার', fare: 20 },
  { name: 'Uttara South', bn: 'উত্তরা সাউথ', fare: 20 },
  { name: 'Pallabi', bn: 'পল্লবী', fare: 30 },
  { name: 'Mirpur-11', bn: 'মিরপুর-১১', fare: 30 },
  { name: 'Mirpur-10', bn: 'মিরপুর-১০', fare: 40 },
  { name: 'Kazipara', bn: 'কাজীপাড়া', fare: 40 },
  { name: 'Sewrapara', bn: 'শেওড়াপাড়া', fare: 50 },
  { name: 'Agargaon', bn: 'আগারগাঁও', fare: 50 },
  { name: 'Bijoy Sarani', bn: 'বিজয় সরণি', fare: 60 },
  { name: 'Farmgate', bn: 'ফার্মগেট', fare: 60 },
  { name: 'Karwan Bazar', bn: 'কারওয়ান বাজার', fare: 70 },
  { name: 'Shahbag', bn: 'শাহবাগ', fare: 80 },
  { name: 'Dhaka University', bn: 'ঢাকা বিশ্ববিদ্যালয়', fare: 80 },
  { name: 'Bangladesh Secretariat', bn: 'বাংলাদেশ সচিবালয়', fare: 90 },
  { name: 'Motijheel', bn: 'মতিঝিল', fare: 100 },
  { name: 'Kamalapur', bn: 'কমলাপুর', fare: 100 },
];

const UPCOMING_TRAINS = [
  { time: '2:15', crowd: 80, crowdLabel: { en: 'Crowded', bn: 'ভিড়' } },
  { time: '12:15', crowd: 45, crowdLabel: { en: 'Moderate', bn: 'মাঝামাঝি' } },
  { time: '22:15', crowd: 20, crowdLabel: { en: 'Light', bn: 'কম' } },
];

const POPULAR_FARES = [
  { from: 'Uttara North', fromBn: 'উত্তরা নর্থ', to: 'Motijheel', toBn: 'মতিঝিল', fare: 100 },
  { from: 'Mirpur-10', fromBn: 'মিরপুর-১০', to: 'Farmgate', toBn: 'ফার্মগেট', fare: 30 },
  { from: 'Agargaon', fromBn: 'আগারগাঁও', to: 'Shahbag', toBn: 'শাহবাগ', fare: 30 },
  { from: 'Pallabi', fromBn: 'পল্লবী', to: 'Dhaka University', toBn: 'ঢাকা বিশ্ববিদ্যালয়', fare: 60 },
];

function calcFare(fromIdx: number, toIdx: number): number {
  const diff = Math.abs(fromIdx - toIdx);
  if (diff === 0) return 0;
  if (diff <= 2) return 20;
  if (diff <= 4) return 30;
  if (diff <= 6) return 40;
  if (diff <= 8) return 60;
  if (diff <= 11) return 80;
  return 100;
}

function CrowdBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full bg-kj-panel-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function crowdColor(pct: number) {
  if (pct >= 70) return 'bg-red-500';
  if (pct >= 40) return 'bg-kj-amber';
  return 'bg-green-500';
}

const MetroRailHub: React.FC<Props> = ({ onBack, language }) => {
  const t = (en: string, bn: string) => lbl(language, en, bn);

  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(15);
  const [countdown, setCountdown] = useState({ m: 2, s: 15 });

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { m: prev.m - 1, s: 59 };
        return { m: 12, s: 15 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const calculatedFare = calcFare(fromIdx, toIdx);

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text pb-20">
      {/* Back button row */}
      <div className="sticky top-0 z-10 bg-kj-bg border-b border-kj-line px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-kj-text-dim hover:text-kj-text transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-base">{t('Metro Rail', 'মেট্রো রেল')}</span>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Hero card */}
        <div className="bg-gradient-to-br from-slate-900 to-green-900 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Train size={18} className="opacity-80" />
            <span className="text-xs font-medium tracking-wide uppercase opacity-70">MRT Line 6</span>
          </div>
          <h1 className="text-xl font-bold mb-1">
            {t('Dhaka Metro Rail', 'ঢাকা মেট্রো')}
          </h1>
          <p className="text-sm opacity-70 mb-4">
            {t('Uttara North → Kamalapur', 'উত্তরা নর্থ → কমলাপুর')}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: '17', label: t('Stations', 'স্টেশন') },
              { val: '20.1', label: t('km', 'কিমি') },
              { val: '40', label: t('km/h avg', 'কিমি/ঘন্টা') },
              { val: '৳20–100', label: t('Fare', 'ভাড়া') },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl p-2 text-center">
                <div className="text-base font-bold">{item.val}</div>
                <div className="text-xs opacity-70">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next train countdown */}
        <div className="dc-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-kj-primary" />
            <span className="font-semibold text-sm">{t('Next Train', 'পরবর্তী ট্রেন')}</span>
          </div>

          {/* Big countdown */}
          <div className="text-center mb-4">
            <div className="text-kj-primary text-6xl font-bold tabular-nums leading-none">
              {String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
            </div>
            <div className="text-kj-text-dim text-sm mt-2">
              {t('Next Uttara-bound train', 'পরবর্তী উত্তরা গামী ট্রেন')}
            </div>
          </div>

          {/* Upcoming trains list */}
          <div className="space-y-2">
            {UPCOMING_TRAINS.map((train, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-kj-text font-medium text-sm w-12 tabular-nums">{train.time}</span>
                <div className="flex-1">
                  <CrowdBar pct={train.crowd} color={crowdColor(train.crowd)} />
                </div>
                <span className="text-kj-text-dim text-xs w-16 text-right">
                  {t(train.crowdLabel.en, train.crowdLabel.bn)} {train.crowd}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket info card */}
        <div className="dc-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-kj-accent" />
            <span className="font-semibold text-sm">{t('Tickets & Passes', 'টিকিট ও পাস')}</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">{t('Single Journey', 'একক যাত্রা')}</div>
                <div className="text-xs text-kj-text-dim">{t('Distance-based pricing', 'দূরত্ব অনুযায়ী মূল্য')}</div>
              </div>
              <span className="text-kj-primary font-semibold text-sm">৳20–100</span>
            </div>

            <div className="border-t border-kj-line" />

            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">{t('MRT Pass (Rapid Pass)', 'র‍্যাপিড পাস')}</div>
                <div className="text-xs text-kj-text-dim">{t('Rechargeable, 10% discount', 'রিচার্জযোগ্য, ১০% ছাড়')}</div>
              </div>
              <span className="text-kj-primary font-semibold text-sm">৳200</span>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 bg-kj-accent-soft rounded-xl p-3">
            <Info size={14} className="text-kj-accent mt-0.5 shrink-0" />
            <p className="text-xs text-kj-text-dim">
              {t(
                'Buy tickets at station counters or token vending machines. No online booking available.',
                'স্টেশন কাউন্টার বা টোকেন ভেন্ডিং মেশিনে টিকিট কিনুন। অনলাইন বুকিং নেই।'
              )}
            </p>
          </div>
        </div>

        {/* Fare calculator */}
        <div className="dc-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-kj-primary" />
            <span className="font-semibold text-sm">{t('Fare Calculator', 'ভাড়া হিসাব')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-kj-text-dim mb-1 block">{t('From', 'থেকে')}</label>
              <select
                value={fromIdx}
                onChange={e => setFromIdx(Number(e.target.value))}
                className="w-full bg-kj-panel-muted border border-kj-line rounded-xl px-3 py-2 text-sm text-kj-text focus:outline-none focus:border-kj-primary"
              >
                {STATIONS.map((s, i) => (
                  <option key={i} value={i}>
                    {language === 'bn' ? s.bn : s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-kj-text-dim mb-1 block">{t('To', 'পর্যন্ত')}</label>
              <select
                value={toIdx}
                onChange={e => setToIdx(Number(e.target.value))}
                className="w-full bg-kj-panel-muted border border-kj-line rounded-xl px-3 py-2 text-sm text-kj-text focus:outline-none focus:border-kj-primary"
              >
                {STATIONS.map((s, i) => (
                  <option key={i} value={i}>
                    {language === 'bn' ? s.bn : s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {fromIdx === toIdx ? (
            <div className="text-center text-kj-text-faint text-sm py-2">
              {t('Select different stations', 'ভিন্ন স্টেশন বেছে নিন')}
            </div>
          ) : (
            <div className="bg-kj-primary-soft rounded-xl p-3 text-center">
              <span className="text-kj-text-dim text-sm">{t('Estimated fare', 'আনুমানিক ভাড়া')} </span>
              <span className="text-kj-primary font-bold text-xl">৳{calculatedFare}</span>
            </div>
          )}

          {/* Popular fare examples */}
          <div className="mt-3">
            <div className="text-xs text-kj-text-faint mb-2">{t('Popular routes', 'জনপ্রিয় রুট')}</div>
            <div className="space-y-1.5">
              {POPULAR_FARES.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-kj-text-dim">
                    {language === 'bn' ? r.fromBn : r.from}
                    <ChevronRight size={10} className="inline mx-0.5 opacity-50" />
                    {language === 'bn' ? r.toBn : r.to}
                  </span>
                  <span className="text-kj-text font-medium">৳{r.fare}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 17 stations horizontal scroll */}
        <div className="dc-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Train size={16} className="text-kj-primary" />
            <span className="font-semibold text-sm">
              {t('All 17 Stations', 'সব ১৭টি স্টেশন')}
            </span>
          </div>
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
              {STATIONS.map((s, i) => (
                <div
                  key={i}
                  className="bg-kj-panel-muted border border-kj-line rounded-xl px-3 py-2 text-center shrink-0"
                  style={{ minWidth: '90px' }}
                >
                  <div className="text-xs font-medium text-kj-text leading-tight">
                    {language === 'bn' ? s.bn : s.name}
                  </div>
                  <div className="text-kj-primary text-xs font-semibold mt-1">৳{s.fare}</div>
                  <div className="text-kj-text-faint text-xs">{t('from start', 'শুরু থেকে')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key info tiles */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: <Clock size={18} />,
              label: t('Operating Hours', 'পরিচালনার সময়'),
              value: '7am – 8pm',
              color: 'text-kj-primary',
              bg: 'bg-kj-primary-soft',
            },
            {
              icon: <Zap size={18} />,
              label: t('Frequency', 'ট্রেন বিরতি'),
              value: t('Every 10 min', 'প্রতি ১০ মিনিট'),
              color: 'text-kj-accent',
              bg: 'bg-kj-accent-soft',
            },
            {
              icon: <MapPin size={18} />,
              label: t('Total Stations', 'মোট স্টেশন'),
              value: '17',
              color: 'text-kj-primary',
              bg: 'bg-kj-primary-soft',
            },
            {
              icon: <CreditCard size={18} />,
              label: t('Payment', 'পেমেন্ট'),
              value: t('Cashless preferred', 'কার্ড পেমেন্ট'),
              color: 'text-kj-accent',
              bg: 'bg-kj-accent-soft',
            },
          ].map((tile, i) => (
            <div key={i} className="dc-card rounded-2xl p-3 flex items-start gap-3">
              <div className={`${tile.bg} ${tile.color} rounded-xl p-2 shrink-0`}>
                {tile.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-kj-text-dim leading-tight">{tile.label}</div>
                <div className="text-sm font-semibold text-kj-text mt-0.5 leading-tight">{tile.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* News/updates card */}
        <div className="bg-kj-amber-soft border border-kj-line rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-kj-amber rounded-xl p-2 shrink-0">
              <Info size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-kj-text-faint mb-1 uppercase tracking-wide font-medium">
                {t('Latest Update', 'সর্বশেষ আপডেট')}
              </div>
              <div className="text-sm font-semibold text-kj-text">
                {t('MRT Line 6 extended to Kamalapur', 'মেট্রো রেল লাইন ৬ কমলাপুর পর্যন্ত বিস্তৃত')}
              </div>
              <div className="text-xs text-kj-text-dim mt-1">
                {t(
                  'The full 20.1 km corridor from Uttara North to Kamalapur is now operational.',
                  'উত্তরা নর্থ থেকে কমলাপুর পর্যন্ত পুরো ২০.১ কিমি করিডোর এখন চালু আছে।'
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MetroRailHub;
