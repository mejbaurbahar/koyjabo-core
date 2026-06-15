import React, { useState, useEffect } from 'react';
import { ArrowLeft, Train, CreditCard, MapPin, Clock, Zap, Calendar } from 'lucide-react';
import { Train3D } from './design/Vehicles3D';

interface Props {
  onBack: () => void;
  language: 'en' | 'bn';
}

const lbl = (language: 'en' | 'bn', en: string, bn: string) =>
  language === 'bn' ? bn : en;

const STATIONS = [
  { name: 'Uttara North', bn: 'উত্তরা উত্তর', fare: 20 },
  { name: 'Uttara Centre', bn: 'উত্তরা সেন্টার', fare: 20 },
  { name: 'Uttara South', bn: 'উত্তরা দক্ষিণ', fare: 20 },
  { name: 'Pallabi', bn: 'পল্লবী', fare: 30 },
  { name: 'Mirpur-11', bn: 'মিরপুর ১১', fare: 30 },
  { name: 'Mirpur-10', bn: 'মিরপুর ১০', fare: 40 },
  { name: 'Kazipara', bn: 'কাজীপাড়া', fare: 40 },
  { name: 'Sewrapara', bn: 'শেওড়াপাড়া', fare: 50 },
  { name: 'Agargaon', bn: 'আগারগাঁও', fare: 50 },
  { name: 'Bijoy Sarani', bn: 'বিজয় সরণি', fare: 60 },
  { name: 'Farmgate', bn: 'ফার্মগেট', fare: 60 },
  { name: 'Karwan Bazar', bn: 'কারওয়ান বাজার', fare: 70 },
  { name: 'Shahbag', bn: 'শাহবাগ', fare: 80 },
  { name: 'Dhaka University', bn: 'ঢাবি', fare: 80 },
  { name: 'Bangladesh Secretariat', bn: 'সচিবালয়', fare: 90 },
  { name: 'Motijheel', bn: 'মতিঝিল', fare: 100 },
  { name: 'Kamalapur', bn: 'কমলাপুর', fare: 100 },
];

const CURRENT_STATION_IDX = 10;

const UPCOMING_TRAINS = [
  { label: '2:15', minLabel: '2 min', pct: 35, crowdEn: 'Light', crowdBn: 'কম' },
  { label: '10:15', minLabel: '10 min', pct: 55, crowdEn: 'Moderate', crowdBn: 'মাঝামাঝি' },
  { label: '18:15', minLabel: '18 min', pct: 70, crowdEn: 'Crowded', crowdBn: 'ভিড়' },
];

function crowdColor(pct: number) {
  if (pct >= 65) return '#ef4444';
  if (pct >= 45) return '#f59e0b';
  return '#10b981';
}

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

const MetroRailHub: React.FC<Props> = ({ onBack, language }) => {
  const t = (en: string, bn: string) => lbl(language, en, bn);

  const [countdown, setCountdown] = useState({ m: 2, s: 15 });
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(15);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { m: prev.m - 1, s: 59 };
        return { m: 8, s: 0 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const calculatedFare = calcFare(fromIdx, toIdx);

  return (
    <div className="w-full bg-kj-bg text-kj-text pb-32">

      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg border-b border-kj-line px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-kj-text-dim hover:text-kj-text hover:bg-kj-panel-muted transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="font-semibold text-base text-kj-text">
          {t('Metro Rail', 'মেট্রো রেল')}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Hero */}
        <div
          className="rounded-3xl overflow-hidden relative text-white"
          style={{
            background: 'linear-gradient(135deg,#00130e 0%,#00543c 50%,#10b981 100%)',
            minHeight: 220,
            padding: '20px 20px 0',
          }}
        >
          <div
            className="absolute -right-10 -top-12 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.12)', animation: 'pulse 3s infinite' }}
          />
          <div
            className="absolute left-1/3 -bottom-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[1.6px] opacity-75">✦ KoyJabo · metro</span>
              <h1
                className="font-bengali font-bold text-white leading-tight mt-1.5 mb-2"
                style={{ fontSize: 24 }}
              >
                {t('Dhaka Metro · MRT-6 live', 'ঢাকা মেট্রো · MRT-6 লাইভ')}
              </h1>
              <p className="font-bengali text-[12px] opacity-85 leading-relaxed max-w-sm">
                {t(
                  '17 stations Uttara to Kamalapur · trains every 8 min · 45 min end-to-end.',
                  'উত্তরা থেকে কমলাপুর পর্যন্ত ১৭টি স্টেশন · প্রতি ৮ মিনিটে ট্রেন · ৪৫ মিনিটে পুরো লাইন।'
                )}
              </p>
              <div className="flex gap-4 mt-4 flex-wrap pb-4">
                {[
                  { v: '17', l: t('Stations', 'স্টেশন') },
                  { v: '8 min', l: t('Frequency', 'বিরতি') },
                  { v: '৳20-100', l: t('Fare', 'ভাড়া') },
                  { v: '7am-9pm', l: t('Operating', 'সময়') },
                ].map(s => (
                  <div key={s.l}>
                    <div className="font-sans font-extrabold text-[17px] tracking-tight leading-none">{s.v}</div>
                    <div className="font-sans text-[9px] font-bold uppercase tracking-[1.2px] opacity-75 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 self-end" style={{ marginBottom: -10 }}>
              <Train3D size={148} palette={['#ffffff', 'rgba(255,255,255,0.4)', '#fbbf24']} />
            </div>
          </div>
        </div>

        {/* Next train + ticket/fare grid */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: '1.4fr 1fr' }}
        >
          {/* LEFT: countdown card */}
          <div
            className="rounded-2xl p-4 text-white flex flex-col"
            style={{ background: 'linear-gradient(160deg,#00130e 0%,#00543c 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.25)', color: '#10b981' }}
              >
                MRT-6
              </span>
            </div>
            <div className="text-[11px] opacity-60 mb-3 leading-tight">
              {t('Farmgate Station · Towards Motijheel', 'ফার্মগেট স্টেশন · মতিঝিলের দিকে')}
            </div>

            {/* Pulsing circle bg + countdown */}
            <div className="relative flex items-center justify-center mb-3" style={{ minHeight: 80 }}>
              <div
                className="absolute rounded-full"
                style={{
                  width: 100, height: 100,
                  background: 'rgba(16,185,129,0.08)',
                  animation: 'pulse 2s infinite',
                }}
              />
              <div className="text-center relative z-10">
                <div
                  className="font-bold tabular-nums leading-none"
                  style={{ fontSize: 60, color: '#10b981' }}
                >
                  {String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
                </div>
                <div className="text-[11px] opacity-50 mt-0.5">{t('minutes away', 'মিনিট বাকি')}</div>
              </div>
            </div>

            {/* Upcoming trains */}
            <div className="space-y-2 mt-auto">
              {UPCOMING_TRAINS.map((tr, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="tabular-nums opacity-70">{tr.minLabel}</span>
                    <span style={{ color: crowdColor(tr.pct) }}>
                      {t(tr.crowdEn, tr.crowdBn)} {tr.pct}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${tr.pct}%`, background: crowdColor(tr.pct) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: buy ticket + fare calc stacked */}
          <div className="flex flex-col gap-3">
            {/* Buy ticket */}
            <div
              className="rounded-2xl p-4 text-white"
              style={{ background: 'linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%)' }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <CreditCard size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wide">
                  {t('Buy Ticket', 'টিকিট কিনুন')}
                </span>
              </div>
              <div className="space-y-2">
                <button
                  className="w-full rounded-xl py-1.5 text-[11px] font-semibold text-center transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(0,0,0,0.18)' }}
                >
                  {t('Single Journey', 'একক যাত্রা')}
                </button>
                <button
                  className="w-full rounded-xl py-1.5 text-[11px] font-semibold text-center transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(0,0,0,0.18)' }}
                >
                  {t('MRT Pass', 'র‍্যাপিড পাস')}
                </button>
              </div>
            </div>

            {/* Fare calculator */}
            <div className="dc-card rounded-2xl p-3 flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={13} className="text-kj-primary" />
                <span className="text-[11px] font-semibold">{t('Fare Calc', 'ভাড়া হিসাব')}</span>
              </div>
              <div className="space-y-1.5 mb-2">
                <select
                  value={fromIdx}
                  onChange={e => setFromIdx(Number(e.target.value))}
                  className="w-full bg-kj-panel-muted border border-kj-line rounded-lg px-2 py-1 text-[11px] text-kj-text focus:outline-none focus:border-kj-primary"
                >
                  {STATIONS.map((s, i) => (
                    <option key={i} value={i}>{language === 'bn' ? s.bn : s.name}</option>
                  ))}
                </select>
                <select
                  value={toIdx}
                  onChange={e => setToIdx(Number(e.target.value))}
                  className="w-full bg-kj-panel-muted border border-kj-line rounded-lg px-2 py-1 text-[11px] text-kj-text focus:outline-none focus:border-kj-primary"
                >
                  {STATIONS.map((s, i) => (
                    <option key={i} value={i}>{language === 'bn' ? s.bn : s.name}</option>
                  ))}
                </select>
              </div>
              <div className="bg-kj-primary-soft rounded-xl py-2 text-center mt-auto">
                {fromIdx === toIdx
                  ? <span className="text-kj-text-faint text-[11px]">{t('Pick stations', 'স্টেশন বেছে নিন')}</span>
                  : <span className="text-kj-primary font-bold text-lg">৳{calculatedFare}</span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* MRT-6 Line map */}
        <div className="dc-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Train size={15} className="text-kj-primary" />
            <span className="font-semibold text-sm">{t('MRT-6 Line Map', 'MRT-৬ লাইন মানচিত্র')}</span>
          </div>
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <div className="flex items-start" style={{ width: 'max-content' }}>
              {STATIONS.map((s, i) => {
                const isCurrent = i === CURRENT_STATION_IDX;
                const segColor = i < CURRENT_STATION_IDX ? '#10b981' : '#00543c';
                return (
                  <div key={i} className="flex flex-col items-center" style={{ width: 68 }}>
                    {/* Track + dot */}
                    <div className="flex items-center w-full" style={{ height: 24 }}>
                      <div
                        className="flex-1 h-0.5"
                        style={{ background: i === 0 ? 'transparent' : segColor }}
                      />
                      {isCurrent ? (
                        <div className="relative shrink-0" style={{ width: 18, height: 18 }}>
                          <div
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ background: '#10b981', opacity: 0.5 }}
                          />
                          <div
                            className="absolute rounded-full"
                            style={{ inset: 3, background: '#10b981' }}
                          />
                        </div>
                      ) : (
                        <div
                          className="rounded-full shrink-0 border-2"
                          style={{
                            width: 10,
                            height: 10,
                            borderColor: i < CURRENT_STATION_IDX ? '#10b981' : '#00543c',
                            background: '#00130e',
                          }}
                        />
                      )}
                      <div
                        className="flex-1 h-0.5"
                        style={{ background: i === STATIONS.length - 1 ? 'transparent' : '#00543c' }}
                      />
                    </div>

                    {/* Station name (vertical-ish, small) */}
                    <div
                      className="text-center leading-tight mt-1 px-0.5"
                      style={{ fontSize: 9 }}
                    >
                      <span className={isCurrent ? 'text-emerald-400 font-bold' : 'text-kj-text-dim'}>
                        {language === 'bn' ? s.bn : s.name}
                        {isCurrent ? ' ★' : ''}
                      </span>
                    </div>

                    {/* Fare */}
                    <div
                      className="mt-0.5"
                      style={{ fontSize: 9, color: isCurrent ? '#10b981' : '#6b7280' }}
                    >
                      ৳{s.fare}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info grid – 4 tiles */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: <Clock size={16} />,
              label: t('Operating', 'পরিচালনার সময়'),
              value: '7:10AM – 9:40PM',
              color: '#10b981',
            },
            {
              icon: <Calendar size={16} />,
              label: t('Closed', 'বন্ধ'),
              value: t('Friday', 'শুক্রবার'),
              color: '#ef4444',
            },
            {
              icon: <CreditCard size={16} />,
              label: t('Fare', 'ভাড়া'),
              value: '৳20 – 100',
              color: '#f59e0b',
            },
            {
              icon: <Zap size={16} />,
              label: t('Top Speed', 'সর্বোচ্চ গতি'),
              value: '100 km/h',
              color: '#3b82f6',
            },
          ].map((item, i) => (
            <div key={i} className="dc-card rounded-2xl p-3 flex items-center gap-3">
              <div
                className="rounded-xl p-2 shrink-0"
                style={{ background: item.color + '22', color: item.color }}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-kj-text-dim leading-tight">{item.label}</div>
                <div className="text-sm font-semibold text-kj-text mt-0.5">{item.value}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MetroRailHub;
