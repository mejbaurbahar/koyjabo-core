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
  const [ticketPage, setTicketPage] = useState<null|'single'|'pass'>(null);

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

  // ── Sub-pages: Single Journey or MRT Pass ────────────────────────────────
  if (ticketPage) {
    const isSingle = ticketPage === 'single';
    return (
      <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">
        {/* Back bar */}
        <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
          <button onClick={() => setTicketPage(null)} className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-green-400/60 hover:text-green-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-bengali font-bold text-base text-kj-text">
            {isSingle ? t('Single Journey Ticket', 'একক যাত্রার টিকিট') : t('MRT Pass', 'এমআরটি র‍্যাপিড পাস')}
          </span>
          <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full font-sans" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>MRT-6</span>
        </div>

        {/* Hero */}
        <div className="mx-4 mt-4 rounded-[22px] p-5 relative overflow-hidden text-white" style={{ background: isSingle ? 'linear-gradient(135deg,#00130e 0%,#00543c 100%)' : 'linear-gradient(135deg,#fbbf24 0%,#f59e0b 100%)' }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative">
            <span className="text-5xl mb-3 block">{isSingle ? '🎫' : '💳'}</span>
            <h1 className="font-bengali font-bold text-2xl leading-tight mb-1" style={{ color: isSingle ? '#fff' : '#1c1000' }}>
              {isSingle ? t('Single Journey Ticket', 'একক যাত্রার টিকিট') : t('MRT Rapid Pass', 'এমআরটি র‍্যাপিড পাস')}
            </h1>
            <p className="font-bengali text-sm opacity-80" style={{ color: isSingle ? '#fff' : '#3d2600' }}>
              {isSingle
                ? t('Pay per trip · exact distance-based fare · token valid 2 hours', 'প্রতি যাত্রায় পে · দূরত্ব অনুযায়ী ভাড়া · টোকেন ২ ঘণ্টা বৈধ')
                : t('Reusable NFC card · 10% discount · no queue at machines', 'পুনর্ব্যবহারযোগ্য NFC কার্ড · ১০% ছাড় · মেশিনে লাইন নেই')}
            </p>
          </div>
        </div>

        <div className="px-4 py-5 space-y-4 max-w-3xl mx-auto w-full">
          {isSingle ? (
            <>
              {/* Fare table */}
              <div className="dc-card rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-kj-line flex items-center gap-2">
                  <Zap className="w-4 h-4 text-kj-primary" />
                  <h2 className="font-bold text-kj-text text-sm">{t('Fare by distance (2025)', 'দূরত্ব অনুযায়ী ভাড়া (২০২৫)')}</h2>
                </div>
                <div className="divide-y divide-kj-line">
                  {[
                    { range: t('1–2 stations', '১–২ স্টেশন'), fare: '৳20', example: t('e.g. Uttara North → Uttara Centre', 'যেমন: উত্তরা উত্তর → উত্তরা সেন্টার') },
                    { range: t('3–4 stations', '৩–৪ স্টেশন'), fare: '৳30', example: t('e.g. Uttara → Pallabi', 'যেমন: উত্তরা → পল্লবী') },
                    { range: t('5–6 stations', '৫–৬ স্টেশন'), fare: '৳40', example: t('e.g. Uttara → Mirpur-10', 'যেমন: উত্তরা → মিরপুর-১০') },
                    { range: t('7–8 stations', '৭–৮ স্টেশন'), fare: '৳60', example: t('e.g. Uttara → Agargaon', 'যেমন: উত্তরা → আগারগাঁও') },
                    { range: t('9–11 stations', '৯–১১ স্টেশন'), fare: '৳80', example: t('e.g. Uttara → Shahbag', 'যেমন: উত্তরা → শাহবাগ') },
                    { range: t('12–16 stations', '১২–১৬ স্টেশন'), fare: '৳100', example: t('e.g. Uttara → Kamalapur (full line)', 'যেমন: উত্তরা → কমলাপুর (সম্পূর্ণ লাইন)') },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-kj-chip-bg/30 transition-colors">
                      <div className="flex-1">
                        <p className="font-bengali font-semibold text-kj-text text-sm">{r.range}</p>
                        <p className="font-bengali text-[11px] text-kj-text-faint mt-0.5">{r.example}</p>
                      </div>
                      <span className="font-sans font-black text-kj-primary text-lg shrink-0">{r.fare}</span>
                    </div>
                  ))}
                </div>
              </div>

              <SponsoredAdSlot language={language as 'en' | 'bn'} size="728x90" compact />

              {/* How to buy */}
              <div className="dc-card rounded-2xl p-4 space-y-3">
                <h2 className="font-bold text-kj-text text-sm">{t('How to buy a token', 'কীভাবে টোকেন কিনবেন')}</h2>
                {[
                  { num: '1', en: 'Enter the station and go to the Token Vending Machine (TVM)', bn: 'স্টেশনে ঢুকুন এবং টোকেন ভেন্ডিং মেশিনে (TVM) যান' },
                  { num: '2', en: 'Select your destination station on the touchscreen', bn: 'টাচস্ক্রিনে আপনার গন্তব্য স্টেশন বেছে নিন' },
                  { num: '3', en: 'Insert cash (৳20–100) or tap your card to pay', bn: 'নগদ (৳২০–১০০) দিন বা কার্ড ট্যাপ করুন' },
                  { num: '4', en: 'Collect your round token — tap it at the turnstile to enter', bn: 'গোলাকার টোকেন নিন — প্রবেশের জন্য টার্নস্টাইলে ট্যাপ করুন' },
                  { num: '5', en: 'At destination: tap token at exit turnstile to drop it', bn: 'গন্তব্যে: বাইরে যাওয়ার টার্নস্টাইলে ট্যাপ করুন — টোকেন পড়ে যাবে' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-kj-primary-ink text-[11px] font-black shrink-0 mt-0.5 font-sans" style={{ background: 'linear-gradient(135deg,var(--kj-primary),var(--kj-primary-deep))' }}>{step.num}</span>
                    <p className="font-bengali text-sm text-kj-text-dim leading-relaxed">{t(step.en, step.bn)}</p>
                  </div>
                ))}
              </div>

              <SponsoredAdSlot language={language as 'en' | 'bn'} size="300x250" compact />

              {/* Important notes */}
              <div className="dc-card rounded-2xl p-4 space-y-2">
                <h2 className="font-bold text-kj-text text-sm mb-3">{t('Important to know', 'জানা দরকার')}</h2>
                {[
                  { icon: '⏰', en: 'Token valid for 2 hours from purchase — must exit within this time', bn: 'টোকেন ক্রয়ের ২ ঘণ্টার মধ্যে বের হতে হবে' },
                  { icon: '💵', en: 'Accepts: Cash (৳10–500 notes), MRT Pass, debit/credit cards', bn: 'গ্রহণযোগ্য: নগদ (৳১০–৫০০), এমআরটি পাস, ডেবিট/ক্রেডিট কার্ড' },
                  { icon: '🔄', en: 'No refund on purchased tokens — plan your journey first', bn: 'কেনা টোকেন ফেরত হয় না — আগে পরিকল্পনা করুন' },
                  { icon: '📱', en: 'MRT app available: scan QR code instead of physical token', bn: 'এমআরটি অ্যাপ: ফিজিক্যাল টোকেনের বদলে QR কোড স্ক্যান করুন' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <p className="font-bengali text-sm text-kj-text-dim">{t(item.en, item.bn)}</p>
                  </div>
                ))}
              </div>

              <a href="https://mrt.com.bd/" target="_blank" rel="noopener noreferrer"
                className="block w-full py-3 rounded-[14px] font-bold text-sm font-bengali text-kj-primary-ink text-center"
                style={{ background: 'linear-gradient(135deg,var(--kj-primary),var(--kj-primary-deep))' }}>
                {t('Buy ticket online at mrt.com.bd ↗', 'অনলাইনে টিকিট কিনুন · mrt.com.bd ↗')}
              </a>
            </>
          ) : (
            <>
              {/* Pass types */}
              <div className="dc-card rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-kj-line flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-kj-amber" />
                  <h2 className="font-bold text-kj-text text-sm">{t('MRT Pass types (2025)', 'এমআরটি পাসের ধরন (২০২৫)')}</h2>
                </div>
                {[
                  {
                    name: t('Rapid Pass (NFC)', 'র‍্যাপিড পাস (NFC)'),
                    price: '৳200',
                    desc: t('Reusable contactless card. Load any amount. Never expires. 10% discount on all trips.', 'পুনর্ব্যবহারযোগ্য কন্ট্যাক্টলেস কার্ড। যেকোনো পরিমাণ লোড করুন। মেয়াদ শেষ হয় না। সব যাত্রায় ১০% ছাড়।'),
                    best: true,
                  },
                  {
                    name: t('MRT Pass (20 trips)', 'এমআরটি পাস (২০ যাত্রা)'),
                    price: '৳500',
                    desc: t('20 pre-paid single journeys valid for 30 days from activation. Save ৳50 vs buying 20 tokens.', '৩০ দিনের মধ্যে ২০টি একক যাত্রা। ২০টি আলাদা টোকেনের চেয়ে ৳৫০ সাশ্রয়।'),
                    best: false,
                  },
                ].map((pass, i) => (
                  <div key={i} className={`p-4 ${i > 0 ? 'border-t border-kj-line' : ''} ${pass.best ? 'bg-kj-primary-soft' : ''}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bengali font-bold text-kj-text">{pass.name}</p>
                          {pass.best && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans text-kj-primary-ink" style={{ background: 'var(--kj-primary)' }}>Best Value</span>}
                        </div>
                        <p className="font-bengali text-[12px] text-kj-text-dim mt-1 leading-relaxed">{pass.desc}</p>
                      </div>
                      <span className="font-sans font-black text-kj-primary text-xl shrink-0">{pass.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <SponsoredAdSlot language={language as 'en' | 'bn'} size="728x90" compact />

              {/* How to get a pass */}
              <div className="dc-card rounded-2xl p-4 space-y-3">
                <h2 className="font-bold text-kj-text text-sm">{t('How to get your MRT Pass', 'কীভাবে এমআরটি পাস পাবেন')}</h2>
                {[
                  { num: '1', en: 'Visit the Customer Service Centre at any MRT-6 station', bn: 'যেকোনো MRT-6 স্টেশনের কাস্টমার সার্ভিস সেন্টারে যান' },
                  { num: '2', en: 'Show your NID/passport — the pass is personalized', bn: 'জাতীয় পরিচয়পত্র/পাসপোর্ট দেখান — পাস ব্যক্তিগতকৃত' },
                  { num: '3', en: 'Pay ৳200 for Rapid Pass card (refundable deposit ৳100 + ৳100 pre-load)', bn: '৳২০০ দিন (৳১০০ ফেরতযোগ্য জামানত + ৳১০০ প্রি-লোড)' },
                  { num: '4', en: 'To recharge: any station TVM or mrt.com.bd app', bn: 'রিচার্জ: যেকোনো স্টেশনের TVM বা mrt.com.bd অ্যাপে' },
                  { num: '5', en: 'Tap your pass at the turnstile — auto-deducts correct fare', bn: 'টার্নস্টাইলে পাস ট্যাপ করুন — সঠিক ভাড়া স্বয়ংক্রিয়ভাবে কাটা হবে' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 font-sans" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#1c1000' }}>{step.num}</span>
                    <p className="font-bengali text-sm text-kj-text-dim leading-relaxed">{t(step.en, step.bn)}</p>
                  </div>
                ))}
              </div>

              <SponsoredAdSlot language={language as 'en' | 'bn'} size="300x250" compact />

              {/* Benefits */}
              <div className="dc-card rounded-2xl p-4 space-y-2">
                <h2 className="font-bold text-kj-text text-sm mb-3">{t('Benefits of MRT Pass', 'এমআরটি পাসের সুবিধা')}</h2>
                {[
                  { icon: '💰', en: '10% discount on every single journey fare', bn: 'প্রতিটি একক যাত্রায় ১০% ছাড়' },
                  { icon: '⚡', en: 'Skip the queue — tap & go directly at turnstile', bn: 'লাইন এড়িয়ে যান — সরাসরি ট্যাপ করে ঢুকুন' },
                  { icon: '🔄', en: 'Reload at any station TVM, online, or mobile banking', bn: 'যেকোনো স্টেশন TVM, অনলাইন বা মোবাইল ব্যাংকিংয়ে রিলোড করুন' },
                  { icon: '📊', en: 'Check balance & trip history on MRT app or website', bn: 'MRT অ্যাপ বা ওয়েবসাইটে ব্যালেন্স ও যাত্রার ইতিহাস দেখুন' },
                  { icon: '♻️', en: 'Card deposit ৳100 — fully refunded when you return it', bn: 'কার্ড জামানত ৳১০০ — ফেরত দিলে পুরো টাকা ফেরত' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <p className="font-bengali text-sm text-kj-text-dim">{t(item.en, item.bn)}</p>
                  </div>
                ))}
              </div>

              <a href="https://dmtcl.gov.bd/pages/static-pages/6922df35933eb65569e20980" target="_blank" rel="noopener noreferrer"
                className="block w-full py-3 rounded-[14px] font-bold text-sm font-bengali text-center"
                style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#1c1000' }}>
                {t('More info from DMTCL (official) ↗', 'DMTCL অফিসিয়াল ওয়েবসাইট থেকে আরও তথ্য ↗')}
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

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
                  onClick={() => setTicketPage('single')}
                  className="w-full rounded-xl py-1.5 text-[11px] font-semibold text-center transition-opacity hover:opacity-80 cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.18)' }}
                >
                  🎫 {t('Single Journey', 'একক যাত্রা')} →
                </button>
                <button
                  onClick={() => setTicketPage('pass')}
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

        <SponsoredAdSlot language={language as 'en' | 'bn'} size="728x90" compact />
        <HowKoyJaboHelps />

      </div>
    </div>
  );
};

export default MetroRailHub;
