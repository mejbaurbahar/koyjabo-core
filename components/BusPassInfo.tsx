import React, { useEffect } from 'react';
import { ArrowLeft, CreditCard, CheckCircle2, ExternalLink, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureUsage } from '../services/analyticsService';



interface Props { onBack: () => void; }

const passes = [
  {
    name: 'Rapid Pass (MRT)',
    bnName: 'র‍্যাপিড পাস (মেট্রো)',
    color: 'from-blue-500 to-indigo-600',
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
  {
    step: '1',
    text: 'Visit your nearest BRTC or metro office',
    textbn: 'নিকটস্থ বিআরটিসি বা মেট্রো অফিসে যান',
  },
  {
    step: '2',
    text: 'Bring required documents (NID/ID card, photo)',
    textbn: 'প্রয়োজনীয় কাগজপত্র নিয়ে যান (NID/আইডি কার্ড, ছবি)',
  },
  {
    step: '3',
    text: 'Fill out the form and pay the required fee',
    textbn: 'ফর্ম পূরণ করুন ও নির্ধারিত ফি জমা দিন',
  },
  {
    step: '4',
    text: 'Collect your card or pass (3–7 working days)',
    textbn: 'কার্ড বা পাস সংগ্রহ করুন (৩–৭ কর্মদিবস)',
  },
  {
    step: '5',
    text: 'Board by showing or tapping your card',
    textbn: 'যাত্রার সময় কার্ড দেখিয়ে বা ট্যাপ করে বোর্ড করুন',
  },
];

export default function BusPassInfo({ onBack }: Props) {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  useEffect(() => { trackFeatureUsage('bus_pass_info'); }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{lbl('Bus Pass & Transit Cards', 'বাস পাস / কার্ড তথ্য')}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{lbl('Save money on daily commute', 'দৈনিক যাতায়াতে খরচ বাঁচান')}</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-4 space-y-4 pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {lbl(
                'Using a transit pass in Dhaka can save you ৳500–৳2,000 per month.',
                'ঢাকায় পরিবহন পাস ব্যবহার করে প্রতি মাসে ৳500–৳2,000 পর্যন্ত সাশ্রয় করা সম্ভব।'
              )}
            </p>
          </div>
        </div>




        {passes.map((pass) => (
          <div key={pass.name} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
            <div className={`bg-gradient-to-r ${pass.color} p-4 text-white`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{pass.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{language === 'bn' ? pass.bnName : pass.name}</h3>
                  <p className="text-white/80 text-sm">{language === 'bn' ? pass.name : pass.bnName}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5 w-fit">
                <CreditCard className="w-4 h-4" />
                <span className="font-bold text-sm">{pass.price}{pass.priceNote ? ` · ${pass.priceNote}` : ''}</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  {lbl('Benefits', 'সুবিধাসমূহ')}
                </p>
                <ul className="space-y-1.5">
                  {(language === 'bn' ? pass.benefitsbn : pass.benefits).map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{lbl('Where to get it', 'কোথায় পাবেন')}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{language === 'bn' ? pass.wherebn : pass.where}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">{lbl('Eligibility', 'যোগ্যতা')}</p>
                <p className="text-sm text-amber-800 dark:text-amber-300">{language === 'bn' ? pass.eligibilitybn : pass.eligibility}</p>
              </div>
              {pass.link && (
                <a href={pass.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  <ExternalLink className="w-4 h-4" />{pass.linkLabel}
                </a>
              )}
            </div>
          </div>
        ))}

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">{lbl('How to get a pass?', 'কীভাবে পাস পাবেন?')}</h3>
          <div className="space-y-3">
            {howToUse.map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0">{item.step}</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 pt-1">{language === 'bn' ? item.textbn : item.text}</p>
              </div>
            ))}
          </div>
        </div>


        <div className="h-4" />

      </div>
    </div>
  );
}
