import GlobalFooter from './GlobalFooter';
import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppView } from '../types';
import SponsoredAdSlot from './SponsoredAdSlot';

interface PrivacyPolicyProps {
    view: AppView;
    setView: (view: AppView) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ view, setView }) => {
    const { t, language } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

    const toc = [
        { num: '01', en: 'Information We Collect', bn: 'তথ্য সংগ্রহ' },
        { num: '02', en: 'How We Use Information', bn: 'তথ্য ব্যবহার' },
        { num: '03', en: 'Information Sharing', bn: 'তথ্য শেয়ারিং' },
        { num: '04', en: 'Location Data', bn: 'অবস্থান ডেটা' },
        { num: '05', en: 'Cookies & Advertising', bn: 'কুকিজ ও বিজ্ঞাপন' },
        { num: '06', en: 'Your Rights', bn: 'আপনার অধিকার' },
        { num: '07', en: 'Children\'s Privacy', bn: 'শিশুদের গোপনীয়তা' },
        { num: '08', en: 'Contact', bn: 'যোগাযোগ' },
    ];

    const sections = [
        {
            num: '01',
            en: 'Information We Collect',
            bn: 'তথ্য সংগ্রহ',
            body: lbl(
                'We collect information you provide directly (such as search queries and trip reminders) and data automatically gathered when you use the app, including device type, browser, and aggregate usage patterns. Location access is always optional and permission-gated.',
                'আপনি সরাসরি প্রদান করেন এমন তথ্য (যেমন অনুসন্ধান প্রশ্ন ও ট্রিপ রিমাইন্ডার) এবং অ্যাপ ব্যবহারের সময় স্বয়ংক্রিয়ভাবে সংগৃহীত ডেটা আমরা সংগ্রহ করি, যার মধ্যে ডিভাইসের ধরন, ব্রাউজার ও সামগ্রিক ব্যবহারের ধরন অন্তর্ভুক্ত। অবস্থান অ্যাক্সেস সর্বদা ঐচ্ছিক এবং অনুমতি-নিয়ন্ত্রিত।'
            ),
        },
        {
            num: '02',
            en: 'How We Use Information',
            bn: 'তথ্য ব্যবহার',
            body: lbl(
                'Collected data is used solely to improve route accuracy, personalise your experience, and fix bugs. We never sell your data to third parties or share it with advertisers in an identifiable form.',
                'সংগৃহীত ডেটা শুধুমাত্র রুটের নির্ভুলতা উন্নত করতে, আপনার অভিজ্ঞতা ব্যক্তিগতকৃত করতে এবং বাগ ঠিক করতে ব্যবহৃত হয়। আমরা কখনো আপনার ডেটা তৃতীয় পক্ষের কাছে বিক্রি করি না বা চিহ্নিতযোগ্য আকারে বিজ্ঞাপনদাতাদের সাথে শেয়ার করি না।'
            ),
        },
        {
            num: '03',
            en: 'Information Sharing',
            bn: 'তথ্য শেয়ারিং',
            body: lbl(
                'We do not sell, trade, or rent your personal information. Aggregated, anonymised analytics may be shared with service partners strictly for the purpose of improving KoyJabo.',
                'আমরা আপনার ব্যক্তিগত তথ্য বিক্রি, ব্যবসা বা ভাড়া দিই না। কেবলমাত্র কই যাবো উন্নত করার উদ্দেশ্যে সামগ্রিক, বেনামী বিশ্লেষণ পরিষেবা অংশীদারদের সাথে শেয়ার করা হতে পারে।'
            ),
        },
    ];

    return (
        <>
        <div
            className="flex flex-col flex-1 min-h-0 bg-kj-panel overflow-y-auto overscroll-y-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {/* Sticky back bar */}
            <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-kj-panel/80 backdrop-blur-md border-b border-kj-line shadow-sm">
                <button
                    onClick={() => setView('home' as AppView)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-kj-chip-bg hover:bg-kj-primary-soft text-kj-text-dim hover:text-kj-primary transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-black text-kj-text text-sm tracking-tight">
                    {lbl('Privacy Policy', 'গোপনীয়তা নীতি')}
                </span>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-8 w-full space-y-8">

                {/* Eyebrow + hero */}
                <div className="pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-kj-text-faint mb-2">
                        {lbl('Last updated · Dec 15, 2025', 'সর্বশেষ আপডেট · ১৫ ডিসেম্বর ২০২৫')}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-black text-kj-text mb-3 leading-tight">
                        {lbl('Privacy policy', 'গোপনীয়তা নীতি')}
                    </h1>
                    <p className="text-sm text-kj-text-dim">
                        {lbl(
                            'KoyJabo is committed to protecting your privacy. This policy explains what we collect, why, and how we keep it safe.',
                            'কই যাবো আপনার গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ। এই নীতিতে আমরা কী সংগ্রহ করি, কেন করি এবং কীভাবে সুরক্ষিত রাখি তা ব্যাখ্যা করা হয়েছে।'
                        )}
                    </p>
                </div>

                <SponsoredAdSlot language={language} size="728x90" compact />

                {/* TOC card */}
                <div className="dc-card p-5 rounded-2xl border border-kj-line">
                    <p className="text-[10px] font-black uppercase tracking-widest text-kj-text-faint mb-4">
                        {lbl('Contents', 'বিষয়সূচি')}
                    </p>
                    <ol className="space-y-2">
                        {toc.map(item => (
                            <li key={item.num} className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-kj-text-faint w-6 shrink-0">{item.num}</span>
                                <span className="text-sm font-semibold text-kj-primary hover:underline cursor-pointer">
                                    {lbl(item.en, item.bn)}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Content sections */}
                {sections.map(s => (
                    <div key={s.num} className="dc-card p-5 sm:p-6 rounded-2xl border border-kj-line">
                        <div className="flex items-start gap-4 mb-3">
                            <span
                                className="text-[10px] font-black px-2 py-1 rounded-lg shrink-0 mt-0.5"
                                style={{ background: 'var(--kj-primary)22', color: 'var(--kj-primary)' }}
                            >
                                {s.num}
                            </span>
                            <h2 className="text-base font-black text-kj-text">{lbl(s.en, s.bn)}</h2>
                        </div>
                        <p className="text-sm text-kj-text-dim leading-relaxed">{s.body}</p>
                    </div>
                ))}

                {/* Footer CTA */}
                <div className="dc-card p-5 rounded-2xl border border-kj-line flex items-center gap-4">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'var(--kj-primary)22', color: 'var(--kj-primary)' }}
                    >
                        <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-kj-text mb-0.5">
                            {lbl('Questions? Contact us', 'প্রশ্ন আছে? যোগাযোগ করুন')}
                        </p>
                        <a
                            href="mailto:koyjabo.bd@gmail.com"
                            className="text-xs text-kj-primary hover:underline font-semibold"
                        >
                            koyjabo.bd@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <GlobalFooter setView={setView} />
        </>
    );
};

export default PrivacyPolicy;
