import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Search, X } from 'lucide-react';
import AdSenseAd from './AdSenseAd';

type Language = 'en' | 'bn';

const lbl = (language: Language, en: string, bn: string) => (language === 'bn' ? bn : en);

export const AdLabel: React.FC<{ language: Language; light?: boolean }> = ({ language, light = false }) => (
  <span
    className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1.2px]"
    style={{
      color: light ? 'rgba(255,255,255,0.86)' : 'var(--kj-text-faint)',
      background: light ? 'rgba(255,255,255,0.18)' : 'var(--kj-bg)',
      borderColor: light ? 'rgba(255,255,255,0.3)' : 'var(--kj-line)',
    }}
  >
    {lbl(language, 'Sponsored', 'বিজ্ঞাপন')}
  </span>
);

export const AdIntentRow: React.FC<{ language: Language }> = ({ language }) => {
  const [open, setOpen] = useState(false);
  const chips = [
    lbl(language, 'Cheap flights', 'সস্তা ফ্লাইট'),
    lbl(language, 'Hotel deals', 'হোটেল ডিল'),
    lbl(language, 'Rent-a-car', 'রেন্ট-এ-কার'),
    lbl(language, 'Travel package', 'ট্রাভেল প্যাকেজ'),
  ];

  return (
    <div className="dc-card rounded-[18px] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-bengali text-sm font-bold text-kj-text">
          {lbl(language, 'Sponsored suggestions', 'স্পনসর্ড পরামর্শ')}
        </p>
        <AdLabel language={language} />
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-kj-line bg-kj-panel-muted px-3.5 py-2 font-bengali text-[13px] font-semibold text-kj-text transition-colors hover:border-kj-primary/40"
          >
            {chip}
          </button>
        ))}
      </div>
      {open && <AdIntentDialog language={language} onClose={() => setOpen(false)} />}
    </div>
  );
};

const AdIntentDialog: React.FC<{ language: Language; onClose: () => void }> = ({ language, onClose }) => (
  <div className="fixed inset-0 z-[10050] flex items-center justify-center p-5">
    <button
      type="button"
      aria-label={lbl(language, 'Close sponsored dialog', 'স্পনসর্ড ডায়ালগ বন্ধ করুন')}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative w-full max-w-[420px] overflow-hidden rounded-[20px] border border-kj-line bg-kj-bg shadow-kj-lg">
      <div className="relative flex h-[150px] items-center justify-center bg-gradient-to-br from-sky-500 to-sky-950">
        <div className="absolute left-3 top-3"><AdLabel language={language} light /></div>
        <button type="button" onClick={onClose} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/25 bg-white/15 text-white">
          <X className="h-4 w-4" />
        </button>
        <span className="text-5xl" aria-hidden="true">✈</span>
      </div>
      <div className="p-5">
        <h3 className="font-bengali text-lg font-bold text-kj-text">
          {lbl(language, 'Dhaka to Cox’s Bazar from ৳3,990', 'ঢাকা থেকে কক্সবাজার ৩,৯৯০৳ থেকে')}
        </h3>
        <p className="mt-2 font-bengali text-sm leading-relaxed text-kj-text-dim">
          {lbl(language, 'Limited-time domestic travel offer. Ads stay boxed so the app layout never shifts.', 'সীমিত সময়ের দেশীয় ভ্রমণ অফার। বিজ্ঞাপন নির্দিষ্ট বক্সে থাকে, তাই অ্যাপের লেআউট নড়ে না।')}
        </p>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-[14px] bg-gradient-to-br from-kj-primary to-kj-primary-deep px-4 py-3 text-sm font-bold text-kj-primary-ink">
          {lbl(language, 'View offer', 'অফার দেখুন')}
        </button>
      </div>
    </div>
  </div>
);

export const NativeAdSection: React.FC<{ language: Language }> = ({ language }) => {
  const items = [
    [lbl(language, 'Dhaka to Cox’s Bazar flight deals', 'ঢাকা-কক্সবাজার ফ্লাইট ডিল'), 'TravelBD', '#0ea5e9', '#0c4a6e'],
    [lbl(language, 'Safe ride sharing', 'নিরাপদ রাইড শেয়ারিং'), 'GoRide', '#10b981', '#006a4e'],
    [lbl(language, 'Hotel booking offers', 'হোটেল বুকিং অফার'), 'StayBD', '#f59e0b', '#b45309'],
    [lbl(language, 'Launch cabin booking', 'লঞ্চ কেবিন বুকিং'), 'RiverGo', '#06b6d4', '#075985'],
  ] as const;
  const searches = [
    lbl(language, 'Metro rail schedule', 'মেট্রো রেল সময়সূচি'),
    lbl(language, 'Dhaka bus counters', 'ঢাকা বাস কাউন্টার'),
    lbl(language, 'Cheap flight tickets', 'সস্তা বিমান টিকেট'),
    lbl(language, 'Cox’s Bazar hotels', 'কক্সবাজার হোটেল'),
  ];

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className="dc-card rounded-[18px] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bengali text-sm font-bold text-kj-text">{lbl(language, 'Recommended for you', 'আপনার জন্য')}</h2>
          <AdLabel language={language} />
        </div>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {items.map(([title, advertiser, c1, c2]) => (
            <div key={title} className="overflow-hidden rounded-[14px] border border-kj-line bg-kj-panel-muted">
              <div className="h-20" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />
              <div className="p-2.5">
                <p className="font-bengali text-xs font-semibold leading-snug text-kj-text">{title}</p>
                <p className="mt-1.5 text-[10px] text-kj-text-faint">{advertiser}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="dc-card rounded-[18px] p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="font-bengali text-sm font-bold text-kj-text">{lbl(language, 'Related searches', 'সম্পর্কিত খোঁজ')}</h2>
          <AdLabel language={language} />
        </div>
        {searches.map((term) => (
          <button key={term} type="button" className="flex w-full items-center gap-2 border-t border-dashed border-kj-line px-1 py-3 text-left font-bengali text-sm font-medium text-kj-text first:border-t-0">
            <Search className="h-4 w-4 shrink-0 text-kj-text-faint" />
            <span className="flex-1">{term}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export const SideRailAd: React.FC<{ language: Language; side: 'left' | 'right' }> = ({ language, side }) => (
  <aside
    className={`kj-side-rail-ad fixed top-1/2 z-[80] hidden h-[600px] w-[160px] -translate-y-1/2 flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-kj-line bg-kj-panel-muted p-3 text-center 2xl:flex ${side === 'left' ? 'left-3' : 'right-3'}`}
  >
    <AdLabel language={language} />
    <AdSenseAd adSlot="auto" adFormat="vertical" responsive={false} style={{ width: 136, height: 520, maxHeight: 520 }} />
    <span className="text-[10px] text-kj-text-faint">160 x 600</span>
  </aside>
);

export const VignetteAd: React.FC<{ language: Language; open: boolean; onClose: () => void }> = ({ language, open, onClose }) => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (!open) {
      setCount(5);
      return;
    }
    setCount(5);
    const timer = setInterval(() => {
      setCount((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  if (!open) return null;
  const canClose = count === 0;

  return (
    <div className="fixed inset-0 z-[10080] flex items-center justify-center bg-[#03050cef] p-5">
      <div className="absolute left-4 top-4"><AdLabel language={language} light /></div>
      <button
        type="button"
        onClick={canClose ? onClose : undefined}
        className="absolute right-4 top-4 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white"
      >
        {canClose ? lbl(language, 'Skip ad', 'বন্ধ করুন') : lbl(language, `Skip in ${count}s`, `${count} সেকেন্ডে বন্ধ করুন`)}
      </button>
      <div className="w-full max-w-[420px] overflow-hidden rounded-[24px] border border-kj-line bg-kj-bg shadow-kj-lg">
        <div className="flex h-60 items-center justify-center bg-gradient-to-br from-blue-800 to-slate-950">
          <span className="text-7xl" aria-hidden="true">🏝</span>
        </div>
        <div className="p-6">
          <h3 className="font-bengali text-2xl font-bold text-kj-text">
            {lbl(language, 'Visit Cox’s Bazar this Eid', 'এই ঈদে কক্সবাজার ঘুরে আসুন')}
          </h3>
          <p className="mt-2 font-bengali text-sm leading-relaxed text-kj-text-dim">
            {lbl(language, 'Flight and hotel packages from ৳9,999. This full-screen ad is capped and dismissible.', 'ফ্লাইট ও হোটেল প্যাকেজ ৯,৯৯৯৳ থেকে। এই ফুলস্ক্রিন বিজ্ঞাপন নির্দিষ্ট মাপের ও বন্ধ করা যায়।')}
          </p>
          <button type="button" onClick={canClose ? onClose : undefined} className="mt-5 w-full rounded-[14px] bg-gradient-to-br from-kj-primary to-kj-primary-deep px-4 py-3 font-bold text-kj-primary-ink">
            {lbl(language, 'See packages', 'প্যাকেজ দেখুন')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AiAssistantFab: React.FC<{ language: Language; onClick: () => void; hidden?: boolean }> = ({ language, onClick, hidden }) => {
  const label = useMemo(() => lbl(language, 'Open AI assistant', 'AI সহায়ক খুলুন'), [language]);
  if (hidden) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="kj-ai-fab fixed right-4 z-[120] flex h-[62px] w-[62px] items-center justify-center rounded-full border-0 bg-gradient-to-br from-kj-primary to-kj-accent text-white shadow-kj-lg md:right-6"
      style={{ bottom: 'calc(92px + env(safe-area-inset-bottom))' }}
    >
      <span className="kj-ai-fab-ring" />
      <Bot className="relative h-7 w-7" />
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-kj-line bg-kj-bg px-1 text-[9px] font-black text-kj-primary">AI</span>
    </button>
  );
};
