import SponsoredAdSlot from "./SponsoredAdSlot";
import HowKoyJaboHelps from "./HowKoyJaboHelps";
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

function getUpcomingTrains() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMin = h * 60 + m;
  // MRT-6: 7:10 AM (430 min) to 9:40 PM (1300 min)
  const isPeak = (totalMin >= 420 && totalMin <= 540) || (totalMin >= 1020 && totalMin <= 1200);
  const freq = isPeak ? 8 : 12;
  const isOperating = totalMin >= 430 && totalMin <= 1300;
  if (!isOperating) return [
    { minLabel: t2('Not operating', 'চলছে না'), pct: 0, crowdEn: '', crowdBn: '' },
  ];
  const nextMin = freq - (m % freq);
  return [
    { minLabel: nextMin <= 1 ? t2('Arriving', 'আসছে') : `${nextMin} min`, pct: isPeak ? 75 : 35, crowdEn: isPeak ? 'Crowded' : 'Light', crowdBn: isPeak ? 'ভিড়' : 'কম' },
    { minLabel: `${nextMin + freq} min`, pct: isPeak ? 55 : 25, crowdEn: 'Moderate', crowdBn: 'মাঝামাঝি' },
    { minLabel: `${nextMin + freq * 2} min`, pct: isPeak ? 80 : 40, crowdEn: isPeak ? 'Very crowded' : 'Light', crowdBn: isPeak ? 'খুব ভিড়' : 'কম' },
  ];
}
function t2(en: string, bn: string) { return en; } // placeholder — real one in component scope
const UPCOMING_TRAINS = [
  { minLabel: '2 min', pct: 35, crowdEn: 'Light', crowdBn: 'কম' },
  { minLabel: '10 min', pct: 55, crowdEn: 'Moderate', crowdBn: 'মাঝামাঝি' },
  { minLabel: '18 min', pct: 70, crowdEn: 'Crowded', crowdBn: 'ভিড়' },
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
  const [showTicketDetails, setShowTicketDetails] = useState<'single'|'pass'|null>(null);

  useEffect(() => {
    const getNextTrainSecs = () => {
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
      const totalMin = h * 60 + m;
      const isOp = totalMin >= 430 && totalMin <= 1300;
      if (!isOp) return { m: 0, s: 0 };
      const isPeak = (totalMin >= 420 && totalMin <= 540) || (totalMin >= 1020 && totalMin <= 1200);
      const freq = isPeak ? 8 : 12; // minutes
      const secsIntoInterval = (m % freq) * 60 + s;
      const secsUntilNext = freq * 60 - secsIntoInterval;
      return { m: Math.floor(secsUntilNext / 60), s: secsUntilNext % 60 };
    };
    setCountdown(getNextTrainSecs());
    const id = setInterval(() => setCountdown(getNextTrainSecs()), 1000);
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
                  onClick={() => setShowTicketDetails('single')}
                  className="w-full rounded-xl py-1.5 text-[11px] font-semibold text-center transition-opacity hover:opacity-80 cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.18)' }}
                >
                  🎫 {t('Single Journey', 'একক যাত্রা')} →
                </button>
                <button
                  onClick={() => setShowTicketDetails('pass')}
                  className="w-full rounded-xl py-1.5 text-[11px] font-semibold text-center transition-opacity hover:opacity-80 cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.18)' }}
                >
                  💳 {t('MRT Pass', 'র‍্যাপিড পাস')} →
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

        <SponsoredAdSlot language={language as 'en' | 'bn'} size="728x90" compact />
        <HowKoyJaboHelps />

        {/* MRT Ticket Detail Modal */}
        {showTicketDetails && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="dc-card rounded-[22px] w-full max-w-md animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-kj-line">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00130e,#00543c)' }}>
                    <span className="text-xl">{showTicketDetails === 'single' ? '🎫' : '💳'}</span>
                  </div>
                  <div>
                    <p className="font-bengali font-bold text-kj-text">{showTicketDetails === 'single' ? t('Single Journey Ticket', 'একক যাত্রার টিকিট') : t('MRT Pass', 'এমআরটি র‍্যাপিড পাস')}</p>
                    <p className="text-[11px] text-kj-text-faint font-sans">MRT-6 · DMTCL</p>
                  </div>
                </div>
                <button onClick={() => setShowTicketDetails(null)} className="w-8 h-8 rounded-full bg-kj-chip-bg text-kj-text-dim flex items-center justify-center text-lg">✕</button>
              </div>

              <div className="p-5 space-y-4">
                {showTicketDetails === 'single' ? (
                  <>
                    <div className="dc-card rounded-2xl p-4 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">{t('Fares by distance (2025)', 'দূরত্ব অনুযায়ী ভাড়া (২০২৫)')}</p>
                      {[
                        { stops: '1–2', fare: '৳20' },
                        { stops: '3–4', fare: '৳30' },
                        { stops: '5–6', fare: '৳40' },
                        { stops: '7–8', fare: '৳60' },
                        { stops: '9–11', fare: '৳80' },
                        { stops: '12–16', fare: '৳100' },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-kj-line/50 last:border-0">
                          <span className="font-bengali text-sm text-kj-text-dim">{t(`${r.stops} stations`, `${r.stops} স্টেশন`)}</span>
                          <span className="font-sans font-black text-kj-primary">{r.fare}</span>
                        </div>
                      ))}
                    </div>
                    <div className="dc-card rounded-2xl p-4 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">{t('How to buy', 'কীভাবে কিনবেন')}</p>
                      {[
                        { icon: '🏧', en: 'Token vending machines at every station (cash & card)', bn: 'প্রতিটি স্টেশনে টোকেন ভেন্ডিং মেশিন (নগদ ও কার্ড)' },
                        { icon: '📱', en: 'MRT app (iOS & Android) — scan QR at turnstile', bn: 'এমআরটি অ্যাপ (iOS ও Android) — টার্নস্টাইলে কিউআর স্ক্যান করুন' },
                        { icon: '🪙', en: 'Token valid for 2 hours from purchase', bn: 'টোকেন ক্রয়ের ২ ঘণ্টার মধ্যে ব্যবহার করতে হবে' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="text-lg shrink-0">{item.icon}</span>
                          <p className="font-bengali text-sm text-kj-text-dim">{t(item.en, item.bn)}</p>
                        </div>
                      ))}
                    </div>
                    <a href="https://mrt.com.bd/" target="_blank" rel="noopener noreferrer" className="block w-full py-3 rounded-[14px] font-bold text-sm font-bengali text-kj-primary-ink text-center" style={{ background: 'linear-gradient(135deg,#00543c,#10b981)' }}>
                      {t('Buy ticket online at mrt.com.bd ↗', 'mrt.com.bd থেকে অনলাইনে টিকিট কিনুন ↗')}
                    </a>
                  </>
                ) : (
                  <>
                    <div className="dc-card rounded-2xl p-4 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">{t('MRT Pass types (2025)', 'এমআরটি পাসের ধরন (২০২৫)')}</p>
                      {[
                        { type: t('MRT Pass (20 trips)', 'এমআরটি পাস (২০ যাত্রা)'), price: '৳500', detail: t('20 single-journey trips, valid 30 days', '২০টি একক যাত্রা, ৩০ দিন বৈধ') },
                        { type: t('Rapid Pass', 'র‍্যাপিড পাস'), price: '৳200+', detail: t('NFC rechargeable card, unlimited recharge', 'এনএফসি রিচার্জযোগ্য কার্ড, যেকোনো পরিমাণ রিচার্জ') },
                      ].map((r, i) => (
                        <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-kj-line/50 last:border-0">
                          <div>
                            <p className="font-bengali font-bold text-kj-text text-sm">{r.type}</p>
                            <p className="font-bengali text-[11px] text-kj-text-dim mt-0.5">{r.detail}</p>
                          </div>
                          <span className="font-sans font-black text-kj-primary shrink-0">{r.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="dc-card rounded-2xl p-4 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">{t('Pass benefits', 'পাসের সুবিধা')}</p>
                      {[
                        { icon: '💰', en: '10% discount vs single journey tickets', bn: 'একক যাত্রার চেয়ে ১০% ছাড়' },
                        { icon: '⚡', en: 'No queue at vending machines — tap & go', bn: 'ভেন্ডিং মেশিনে লাইন নেই — ট্যাপ করুন ও যান' },
                        { icon: '📍', en: 'Buy at customer service centres (any MRT station)', bn: 'যেকোনো মেট্রো স্টেশনের কাস্টমার সার্ভিস সেন্টারে কিনুন' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="text-lg shrink-0">{item.icon}</span>
                          <p className="font-bengali text-sm text-kj-text-dim">{t(item.en, item.bn)}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-kj-text-faint text-center font-bengali">{t('Source: DMTCL (dmtcl.gov.bd) · 2025', 'সূত্র: DMTCL (dmtcl.gov.bd) · ২০২৫')}</p>
                    <a href="https://dmtcl.gov.bd/pages/static-pages/6922df35933eb65569e20980" target="_blank" rel="noopener noreferrer" className="block w-full py-3 rounded-[14px] font-bold text-sm font-bengali text-white text-center" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
                      {t('More info at DMTCL website ↗', 'DMTCL ওয়েবসাইটে বিস্তারিত দেখুন ↗')}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default MetroRailHub;
