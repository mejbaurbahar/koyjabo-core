import React, { useEffect } from 'react';
import { ArrowLeft, CreditCard, CheckCircle2, ExternalLink, Info, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureUsage } from '../services/analyticsService';
import SponsoredAdSlot from './SponsoredAdSlot';

interface Props { onBack: () => void; }

const passes = [
  {
    name: 'Rapid Pass (MRT)',
    bnName: 'র‍্যাপিড পাস (মেট্রো)',
    color: 'from-kj-primary to-kj-neon-violet',
    icon: '🚇',
    price: '৳200',
    priceNote: 'Rechargeable / রিচার্জযোগ্য',
    where: 'Metro Station Counters',
    wherebn: 'মেট্রো স্টেশন কাউন্টার',
    benefits: [
      '10% discount on Dhaka Metro Rail (MRT-6)',
      'Fast gate entry — no queues',
      'Minimum balance of ৳50 required',
      'Recharge up to ৳2,000',
      'Replacement card available if lost',
    ],
    benefitsbn: [
      'ঢাকা মেট্রো রেল (MRT-6) এ 10% ছাড়',
      'দ্রুত গেট পার হওয়া — কোনো লাইন নেই',
      'মিনিমাম ব্যালেন্স ৳50 থাকতে হবে',
      'সর্বোচ্চ ৳2,000 পর্যন্ত রিচার্জ করা যায়',
      'হারিয়ে গেলে রিপ্লেসমেন্ট পাওয়া যায়',
    ],
    eligibility: 'Open to all — special discounts for seniors and people with disabilities',
    eligibilitybn: 'সবার জন্য — বিশেষ প্রতিবন্ধী ও প্রবীণ ছাড় আছে',
    link: 'https://dmtcl.gov.bd',
    linkLabel: 'DMTCL Official Site',
  },
  {
    name: 'BRTC Monthly Pass',
    bnName: 'বিআরটিসি মাসিক পাস',
    color: 'from-green-500 to-teal-600',
    icon: '🚌',
    price: '৳500–৳1,200',
    priceNote: 'By route / রুট অনুযায়ী',
    where: 'BRTC Offices & Bus Terminals',
    wherebn: 'বিআরটিসি অফিস, বাস টার্মিনাল',
    benefits: [
      'Unlimited rides on designated routes',
      'Saves 30–50% vs daily fares',
      'Special discount for government employees',
      'Student half-pass available',
    ],
    benefitsbn: [
      'নির্দিষ্ট রুটে আনলিমিটেড যাত্রা',
      'প্রতিদিন ভাড়া বাঁচায় (৩০–৫০%)',
      'সরকারি চাকরিজীবীদের বিশেষ ছাড়',
      'শিক্ষার্থীদের জন্য হাফ পাস পাওয়া যায়',
    ],
    eligibility: 'Open to all — students require a valid ID card',
    eligibilitybn: 'সবার জন্য, শিক্ষার্থীদের আইডি কার্ড লাগবে',
    link: 'https://brtc.gov.bd',
    linkLabel: 'BRTC Official Site',
  },
  {
    name: 'Student Half Pass',
    bnName: 'শিক্ষার্থী হাফ পাস',
    color: 'from-orange-500 to-amber-600',
    icon: '🎓',
    price: '50% of full fare',
    priceNote: '50% discount / মূল ভাড়ার ৫০%',
    where: 'Local Transport Office or Bus Counter',
    wherebn: 'স্থানীয় পরিবহন অফিস বা বাস কাউন্টার',
    benefits: [
      '50% discount on all government buses',
      'Metro discount with Student Rapid Pass',
      'Available monthly or annually',
    ],
    benefitsbn: [
      'সব সরকারি বাসে ৫০% ছাড়',
      'মেট্রোতে স্টুডেন্ট Rapid Pass দিয়ে ছাড়',
      'বাৎসরিক বা মাসিক ভিত্তিতে নেওয়া যায়',
    ],
    eligibility: 'School / College / University students (valid ID mandatory)',
    eligibilitybn: 'স্কুল / কলেজ / বিশ্ববিদ্যালয়ের শিক্ষার্থী (আইডি কার্ড বাধ্যতামূলক)',
    link: null,
    linkLabel: '',
  },
  {
    name: 'Freedom Fighter Pass',
    bnName: 'মুক্তিযোদ্ধা পাস',
    color: 'from-red-500 to-rose-600',
    icon: '🏅',
    price: 'Free / বিনামূল্যে',
    priceNote: '',
    where: 'Muktijoddha Sangshad / Related Office',
    wherebn: 'মুক্তিযোদ্ধা সংসদ / সংশ্লিষ্ট অফিস',
    benefits: [
      'Free travel on all government buses',
      'Special discount on metro rail',
      'Free travel in some train classes',
    ],
    benefitsbn: [
      'সব সরকারি বাসে বিনামূল্যে যাত্রা',
      'মেট্রো রেলে বিশেষ ছাড়',
      'রেলেও বিনামূল্যে কিছু শ্রেণিতে যাত্রা',
    ],
    eligibility: 'Registered freedom fighters and their families',
    eligibilitybn: 'তালিকাভুক্ত মুক্তিযোদ্ধা ও তাদের পরিবার',
    link: null,
    linkLabel: '',
  },
];

const howToUse = [
  { step: '1', text: 'Visit your nearest BRTC or metro office', textbn: 'নিকটস্থ বিআরটিসি বা মেট্রো অফিসে যান' },
  { step: '2', text: 'Bring required documents (NID/ID card, photo)', textbn: 'প্রয়োজনীয় কাগজপত্র নিয়ে যান (NID/আইডি কার্ড, ছবি)' },
  { step: '3', text: 'Fill out the form and pay the required fee', textbn: 'ফর্ম পূরণ করুন ও নির্ধারিত ফি জমা দিন' },
  { step: '4', text: 'Collect your card or pass (3–7 working days)', textbn: 'কার্ড বা পাস সংগ্রহ করুন (৩–৭ কর্মদিবস)' },
  { step: '5', text: 'Board by showing or tapping your card', textbn: 'যাত্রার সময় কার্ড দেখিয়ে বা ট্যাপ করে বোর্ড করুন' },
];

export default function BusPassInfo({ onBack }: Props) {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  useEffect(() => { trackFeatureUsage('bus_pass_info'); }, []);

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
          {lbl('Bus Pass Info', 'বাস পাসের তথ্য')}
        </span>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto w-full">
        {/* Hero card */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-5 shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-tight">{lbl('Bus Pass & Transit Cards', 'বাস পাস / কার্ড তথ্য')}</p>
              <p className="text-white/80 text-sm">{lbl('Save money on daily commute', 'দৈনিক যাতায়াতে খরচ বাঁচান')}</p>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 flex items-start gap-2">
            <Info className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <p className="text-white/90 text-xs leading-relaxed">
              {lbl(
                'Using a transit pass in Dhaka can save you ৳500–৳2,000 per month.',
                'ঢাকায় পরিবহন পাস ব্যবহার করে প্রতি মাসে ৳500–৳2,000 পর্যন্ত সাশ্রয় করা সম্ভব।'
              )}
            </p>
          </div>
        </div>

        {/* Pass type cards */}
        {passes.map((pass) => (
          <div key={pass.name} className="dc-card overflow-hidden">
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${pass.color} p-4 text-white`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{pass.icon}</span>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{language === 'bn' ? pass.bnName : pass.name}</h3>
                  <p className="text-white/75 text-sm">{language === 'bn' ? pass.name : pass.bnName}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5 w-fit">
                <CreditCard className="w-3.5 h-3.5" />
                <span className="font-bold text-sm">{pass.price}{pass.priceNote ? ` · ${pass.priceNote}` : ''}</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Benefits */}
              <div>
                <p className="text-[11px] font-bold text-kj-text-faint uppercase tracking-widest mb-2">
                  {lbl('Benefits', 'সুবিধাসমূহ')}
                </p>
                <ul className="space-y-1.5">
                  {(language === 'bn' ? pass.benefitsbn : pass.benefits).map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-kj-text-dim">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Where to get */}
              <div className="bg-kj-chip-bg rounded-xl p-3 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-kj-text-faint shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-kj-text-faint mb-0.5">{lbl('Where to get it', 'কোথায় পাবেন')}</p>
                  <p className="text-sm text-kj-text-dim">{language === 'bn' ? pass.wherebn : pass.where}</p>
                </div>
              </div>

              {/* Eligibility */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-0.5">{lbl('Eligibility', 'যোগ্যতা')}</p>
                <p className="text-sm text-amber-800 dark:text-amber-300">{language === 'bn' ? pass.eligibilitybn : pass.eligibility}</p>
              </div>

              {pass.link && (
                <a href={pass.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-kj-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />{pass.linkLabel}
                </a>
              )}
            </div>
          </div>
        ))}

        {/* How to get a pass */}
        <div className="dc-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-kj-primary" />
            <h3 className="font-bold text-kj-text">{lbl('How to get a pass?', 'কীভাবে পাস পাবেন?')}</h3>
          </div>
          <div className="space-y-3">
            {howToUse.map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-kj-primary to-kj-neon-violet text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {item.step}
                </span>
                <p className="text-sm text-kj-text-dim pt-1">{language === 'bn' ? item.textbn : item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ad slot */}
        <div className="flex justify-center">
          <SponsoredAdSlot language={language} size="300x250" />
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
