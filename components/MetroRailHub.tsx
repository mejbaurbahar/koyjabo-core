import React, { useState, useEffect } from 'react';
import { ArrowLeft, Train, CreditCard, MapPin, Clock, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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

// Current station index (Farmgate = index 10)
const CURRENT_STATION_IDX = 10;

const UPCOMING_TRAINS = [
  { label: '2:15', pct: 35, crowdEn: 'Light', crowdBn: 'কম' },
  { label: '10:15', pct: 55, crowdEn: 'Moderate', crowdBn: 'মাঝামাঝি' },
  { label: '18:15', pct: 70, crowdEn: 'Crowded', crowdBn: 'ভিড়' },
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
  const { language: lang } = useLanguage();

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

      {/* Back nav */}
      <div className="sticky top-0 z-10 bg-kj-bg border-b border-kj-line px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-kj-text-dim hover:text-kj-text transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-base">{t('Metro Rail', 'মেট্রো রেল')}</span>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Hero */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #00130e 0%, #00543c 50%, #10b981 100%)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Train size={18} className="opacity-80" />
            <span className="text-xs font-medium tracking-widest uppercase opacity-70">MRT Line 6</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">{t('Dhaka Metro Rail', 'ঢাকা মেট্রো রেল')}</h1>
          <p className="text-sm opacity-70 mb-5">{t('Uttara North → Kamalapur', 'উত্তরা নর্থ → কমলাপুর')}</p>

          <div className="grid grid-cols-4 gap-2">
            {[
              { val: '17', label: t('Stations', 'স্টেশন') },
              { val: '8 min', label: t('Frequency', 'বিরতি') },
              { val: '৳20-100', label: t('Fare', 'ভাড়া') },
              { val: '7am-9pm', label: t('Operating', 'সময়') },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div className="text-sm font-bold leading-tight">{item.val}</div>
                <div className="text-xs opacity-70 leading-tight mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column: countdown LEFT + ticket/fare RIGHT */}
        <div className="grid grid-cols-2 gap-3">

          {/* Next train countdown card */}
          <div className="rounded-2xl p-4 text-white flex flex-col" style={{ background: 'linear-gradient(160deg, #00130e 0%, #00543c 100%)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">MRT-6</div>
            <div className="text-xs opacity-70 mb-3 leading-tight">
              {t('Farmgate → Motijheel', 'ফার্মগেট → মতিঝিল')}
            </div>

            {/* Big countdown */}
            <div className="text-center mb-3">
              <div
                className="font-bold tabular-nums leading-none"
                style={{ fontSize: '60px', color: '#10b981' }}
              >
                {String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
              </div>
              <div className="text-xs opacity-50 mt-1">{t('minutes away', 'মিনিট বাকি')}</div>
            </div>

            {/* Upcoming trains */}
            <div className="space-y-2 mt-auto">
              {UPCOMING_TRAINS.map((tr, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="tabular-nums opacity-80">{tr.label}</span>
                    <span style={{ color: crowdColor(tr.pct) }}>
                      {t(tr.crowdEn, tr.crowdBn)} {tr.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${tr.pct}%`, background: crowdColor(tr.pct) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Buy ticket + Fare calculator stacked */}
          <div className="flex flex-col gap-3">

            {/* Buy ticket card */}
            <div
              className="rounded-2xl p-4 text-white"
              style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <CreditCard size={15} />
                <span className="text-xs font-bold uppercase tracking-wide">{t('Buy Ticket', 'টিকিট কিনুন')}</span>
              </div>
              <div className="space-y-2">
                <button className="w-full rounded-xl py-1.5 text-xs font-semibold text-center" style={{ background: 'rgba(0,0,0,0.18)' }}>
                  {t('Single Journey', 'একক যাত্রা')}
                </button>
                <button className="w-full rounded-xl py-1.5 text-xs font-semibold text-center" style={{ background: 'rgba(0,0,0,0.18)' }}>
                  {t('MRT Pass', 'র‍্যাপিড পাস')}
                </button>
              </div>
            </div>

            {/* Fare calculator mini card */}
            <div className="dc-card rounded-2xl p-3 flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={13} className="text-kj-primary" />
                <span className="text-xs font-semibold">{t('Fare Calc', 'ভাড়া হিসাব')}</span>
              </div>
              <div className="space-y-1.5 mb-2">
                <select
                  value={fromIdx}
                  onChange={e => setFromIdx(Number(e.target.value))}
                  className="w-full bg-kj-panel-muted border border-kj-line rounded-lg px-2 py-1 text-xs text-kj-text focus:outline-none focus:border-kj-primary"
                >
                  {STATIONS.map((s, i) => (
                    <option key={i} value={i}>{language === 'bn' ? s.bn : s.name}</option>
                  ))}
                </select>
                <select
                  value={toIdx}
                  onChange={e => setToIdx(Number(e.target.value))}
                  className="w-full bg-kj-panel-muted border border-kj-line rounded-lg px-2 py-1 text-xs text-kj-text focus:outline-none focus:border-kj-primary"
                >
                  {STATIONS.map((s, i) => (
                    <option key={i} value={i}>{language === 'bn' ? s.bn : s.name}</option>
                  ))}
                </select>
              </div>
              <div className="bg-kj-primary-soft rounded-lg py-1.5 text-center">
                {fromIdx === toIdx
                  ? <span className="text-kj-text-faint text-xs">{t('Pick stations', 'স্টেশন বেছে নিন')}</span>
                  : <span className="text-kj-primary font-bold text-base">৳{calculatedFare}</span>
                }
              </div>
            </div>

          </div>
        </div>

        {/* MRT-6 Line map: horizontal scroll */}
        <div className="dc-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Train size={15} className="text-kj-primary" />
            <span className="font-semibold text-sm">{t('MRT-6 Line Map', 'MRT-৬ লাইন মানচিত্র')}</span>
          </div>
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="flex items-start gap-0 pb-2" style={{ width: 'max-content' }}>
              {STATIONS.map((s, i) => {
                const isCurrent = i === CURRENT_STATION_IDX;
                return (
                  <div key={i} className="flex flex-col items-center" style={{ width: '72px' }}>
                    {/* Connector line + dot row */}
                    <div className="flex items-center w-full" style={{ height: '24px' }}>
                      {/* Left line */}
                      <div
                        className="flex-1 h-0.5"
                        style={{ background: i === 0 ? 'transparent' : '#00543c' }}
                      />
                      {/* Dot */}
                      {isCurrent ? (
                        <div className="relative shrink-0" style={{ width: '16px', height: '16px' }}>
                          <div
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ background: '#10b981', opacity: 0.5 }}
                          />
                          <div
                            className="absolute inset-1 rounded-full"
                            style={{ background: '#10b981' }}
                          />
                        </div>
                      ) : (
                        <div
                          className="rounded-full shrink-0 border-2"
                          style={{
                            width: '10px',
                            height: '10px',
                            borderColor: '#00543c',
                            background: '#00130e',
                          }}
                        />
                      )}
                      {/* Right line */}
                      <div
                        className="flex-1 h-0.5"
                        style={{ background: i === STATIONS.length - 1 ? 'transparent' : '#00543c' }}
                      />
                    </div>

                    {/* Station name */}
                    <div
                      className="text-center leading-tight mt-1 px-0.5"
                      style={{
                        fontSize: '9px',
                        color: isCurrent ? '#10b981' : undefined,
                        fontWeight: isCurrent ? 700 : 400,
                      }}
                    >
                      <span className={isCurrent ? 'text-emerald-400' : 'text-kj-text-dim'}>
                        {language === 'bn' ? s.bn : s.name}
                      </span>
                    </div>

                    {/* Fare */}
                    <div
                      className="mt-0.5"
                      style={{ fontSize: '9px', color: isCurrent ? '#10b981' : '#6b7280' }}
                    >
                      ৳{s.fare}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Clock size={16} />, label: t('Operating Times', 'পরিচালনার সময়'), value: '7am – 9pm', color: '#10b981' },
            { icon: <Zap size={16} />, label: t('Closed', 'বন্ধ'), value: t('Friday', 'শুক্রবার'), color: '#ef4444' },
            { icon: <CreditCard size={16} />, label: t('Fare Range', 'ভাড়া পরিসীমা'), value: '৳20 – 100', color: '#f59e0b' },
            { icon: <Train size={16} />, label: t('Top Speed', 'সর্বোচ্চ গতি'), value: '100 km/h', color: '#3b82f6' },
          ].map((item, i) => (
            <div key={i} className="dc-card rounded-2xl p-3 flex items-center gap-3">
              <div
                className="rounded-xl p-2 shrink-0"
                style={{ background: item.color + '22', color: item.color }}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-kj-text-dim leading-tight">{item.label}</div>
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
