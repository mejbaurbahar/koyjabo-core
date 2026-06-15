import GlobalFooter from './GlobalFooter';
import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppView } from '../types';
import SponsoredAdSlot from './SponsoredAdSlot';

interface TermsOfServiceProps {
    view: AppView;
    setView: (view: AppView) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ view, setView }) => {
    const { t, language } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

    const toc = [
        { num: '01', en: 'Acceptance', bn: 'গ্রহণযোগ্যতা' },
        { num: '02', en: 'Account', bn: 'অ্যাকাউন্ট' },
        { num: '03', en: 'Intellectual Property', bn: 'বুদ্ধিবৃত্তিক সম্পত্তি' },
        { num: '04', en: 'User Conduct', bn: 'ব্যবহারকারীর আচরণ' },
        { num: '05', en: 'Tickets & Payment', bn: 'টিকেট ও পেমেন্ট' },
        { num: '06', en: 'Limitation of Liability', bn: 'দায়বদ্ধতা সীমাবদ্ধতা' },
        { num: '07', en: 'Changes', bn: 'পরিবর্তন' },
        { num: '08', en: 'Governing Law', bn: 'আইন' },
    ];

    const sections = [
        {
            num: '01',
            en: 'Acceptance',
            bn: 'গ্রহণযোগ্যতা',
            body: lbl(
                'By accessing or using KoyJabo, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, please discontinue use of the service immediately.',
                'কই যাবো অ্যাক্সেস বা ব্যবহার করে আপনি এই সেবার শর্তাবলী এবং প্রযোজ্য সকল আইন ও বিধিমালা মেনে নিতে সম্মত হন। সম্মত না হলে অনুগ্রহ করে অবিলম্বে সেবা ব্যবহার বন্ধ করুন।'
            ),
        },
        {
            num: '02',
            en: 'Account',
            bn: 'অ্যাকাউন্ট',
            body: lbl(
                'Creating an account is optional. If you choose to register, you are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.',
                'অ্যাকাউন্ট তৈরি করা ঐচ্ছিক। নিবন্ধন করলে আপনি আপনার পরিচয়পত্রের গোপনীয়তা এবং আপনার অ্যাকাউন্টের অধীনে সংঘটিত সমস্ত কার্যকলাপের জন্য দায়বদ্ধ।'
            ),
        },
        {
            num: '03',
            en: 'Intellectual Property',
            bn: 'বুদ্ধিবৃত্তিক সম্পত্তি',
            body: lbl(
                'All content, trademarks, and code within KoyJabo are the property of Mejbaur Bahar Fagun unless otherwise noted. You may not reproduce or redistribute any part without explicit written permission.',
                'কই যাবোর সমস্ত কন্টেন্ট, ট্রেডমার্ক ও কোড মেজবাউর বাহার ফাগুনের সম্পত্তি। স্পষ্ট লিখিত অনুমতি ছাড়া কোনো অংশ পুনরুৎপাদন বা পুনর্বিতরণ করা যাবে না।'
            ),
        },
    ];

    return (
        <div
            className="flex flex-col flex-1 min-h-0 bg-kj-panel overflow-x-hidden w-full relative max-w-full"
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
                    {lbl('Terms of service', 'সেবার শর্তাবলি')}
                </span>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-8 w-full space-y-8">

                {/* Eyebrow + hero */}
                <div className="pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-kj-text-faint mb-2">
                        {lbl('Last updated · Dec 15, 2025', 'সর্বশেষ আপডেট · ১৫ ডিসেম্বর ২০২৫')}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-black text-kj-text mb-3 leading-tight">
                        {lbl('Terms of service', 'সেবার শর্তাবলি')}
                    </h1>
                    <p className="text-sm text-kj-text-dim">
                        {lbl(
                            'Please read these terms carefully before using KoyJabo. They govern your access to and use of our transport route-finding services.',
                            'কই যাবো ব্যবহার করার আগে এই শর্তাবলী মনোযোগ দিয়ে পড়ুন। এগুলো আমাদের পরিবহন রুট-খোঁজার পরিষেবাগুলোতে আপনার প্রবেশাধিকার ও ব্যবহার নিয়ন্ত্রণ করে।'
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
    );
};

export default TermsOfService;
