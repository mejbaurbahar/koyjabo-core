import GlobalFooter from './GlobalFooter';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SponsoredAdSlot from './SponsoredAdSlot';

const ReleaseNotes: React.FC = () => {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  type TagType = 'NEW' | 'FIX' | 'IMP' | 'PERF';

  const tagMeta: Record<TagType, { color: string; label: string }> = {
    NEW:  { color: '#06b6d4', label: 'NEW' },
    FIX:  { color: '#f59e0b', label: 'FIX' },
    IMP:  { color: '#f59e0b', label: 'IMP' },
    PERF: { color: 'var(--kj-accent, #a855f7)', label: 'PERF' },
  };

  const Tag: React.FC<{ type: TagType }> = ({ type }) => {
    const m = tagMeta[type];
    return (
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0"
        style={{ fontSize: 9, background: m.color + '22', color: m.color }}
      >
        {m.label}
      </span>
    );
  };

  const versions: Array<{
    ver: string;
    date: string;
    latest?: boolean;
    items: Array<{ tag: TagType; text: string }>;
  }> = [
    {
      ver: 'v1.4.2',
      date: lbl('Dec 28, 2025', '২৮ ডিসেম্বর ২০২৫'),
      latest: true,
      items: [
        { tag: 'NEW',  text: lbl("AI Assistant answers in both languages", "এআই অ্যাসিস্ট্যান্ট দুই ভাষায় উত্তর দেয়") },
        { tag: 'NEW',  text: lbl("Live tracking — Cox's Bazar Express", "লাইভ ট্র্যাকিং — কক্সবাজার এক্সপ্রেস") },
        { tag: 'FIX',  text: lbl("Offline route caching bug fixed", "অফলাইন রুট ক্যাশিং বাগ ঠিক হয়েছে") },
        { tag: 'PERF', text: lbl("40% faster startup", "৪০% দ্রুত স্টার্টআপ") },
      ],
    },
    {
      ver: 'v1.4.0',
      date: lbl('Dec 15, 2025', '১৫ ডিসেম্বর ২০২৫'),
      items: [
        { tag: 'NEW',  text: lbl("Fare calculator", "ভাড়া ক্যালকুলেটর") },
        { tag: 'NEW',  text: lbl("Seat booking", "সিট বুকিং") },
        { tag: 'IMP',  text: lbl("Metro rail schedule updated", "মেট্রো রেল সময়সূচি আপডেট") },
      ],
    },
    {
      ver: 'v1.3.5',
      date: lbl('Nov 20, 2025', '২০ নভেম্বর ২০২৫'),
      items: [
        { tag: 'NEW',  text: lbl("Dark mode", "ডার্ক মোড") },
        { tag: 'FIX',  text: lbl("Bangla font rendering fixed", "বাংলা ফন্ট রেন্ডারিং ঠিক হয়েছে") },
      ],
    },
  ];

  return (
    <div
      className="flex flex-col bg-kj-panel w-full relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-kj-panel/80 backdrop-blur-md border-b border-kj-line shadow-sm">
        <span className="font-black text-kj-text text-sm tracking-tight">
          {lbl('Release Notes', 'রিলিজ নোট')}
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-8 w-full space-y-6">

        {/* Eyebrow + hero */}
        <div className="pt-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-kj-text-faint mb-2">
            {lbl('Changelog / পরিবর্তনের ইতিহাস', 'পরিবর্তনের ইতিহাস / Changelog')}
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-kj-text leading-tight">
            {lbl("What's new", 'কী নতুন')}
          </h1>
        </div>

        <SponsoredAdSlot language={language} size="728x90" compact />

        {/* Version cards */}
        {versions.map(v => (
          <div key={v.ver} className="dc-card p-5 sm:p-6 rounded-2xl border border-kj-line">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-lg font-black text-kj-text">{v.ver}</span>
              {v.latest && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{ background: 'var(--kj-primary)22', color: 'var(--kj-primary)' }}
                >
                  {lbl('Latest', 'সর্বশেষ')}
                </span>
              )}
              <span className="ml-auto text-xs text-kj-text-faint font-semibold">{v.date}</span>
            </div>

            {/* Items */}
            <ul className="space-y-3">
              {v.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Tag type={item.tag} />
                  <span className="text-sm text-kj-text-dim leading-snug">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReleaseNotes;
