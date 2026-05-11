import React, { useState } from 'react';
import { Mail, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    className?: string;
}

const STORAGE_KEY = 'kj_newsletter_v1';

export default function NewsletterBanner({ className = '' }: Props) {
    const { language } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(STORAGE_KEY));

    if (dismissed) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) return;
        setStatus('loading');
        try {
            const res = await fetch('https://formsubmit.co/ajax/mejbaur.bahar@gmail.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    email,
                    _subject: '🎉 New KoyJabo Newsletter Subscriber!',
                    _template: 'table',
                    source: 'KoyJabo Blog',
                }),
            });
            if (res.ok) {
                setStatus('success');
                localStorage.setItem(STORAGE_KEY, 'true');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(STORAGE_KEY, 'dismissed');
    };

    return (
        <div className={`relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 overflow-hidden ${className}`}>
            {/* background decoration */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/10 rounded-full pointer-events-none" />
            <div className="absolute -right-4 -bottom-6 w-20 h-20 bg-teal-400/10 rounded-full pointer-events-none" />

            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 z-10"
                aria-label="Dismiss"
            >
                <X className="w-3.5 h-3.5" />
            </button>

            {status === 'success' ? (
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-9 h-9 text-emerald-500 shrink-0" />
                    <div>
                        <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                            {lbl('You\'re subscribed! 🎉', 'সাবস্ক্রাইব হয়েছে! 🎉')}
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {lbl('Weekly Bangladesh travel tips coming to your inbox.', 'সাপ্তাহিক বাংলাদেশ ভ্রমণ টিপস আসবে।')}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                                {lbl('Get Free Weekly Travel Tips', 'সাপ্তাহিক ভ্রমণ টিপস পান বিনামূল্যে')}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                {lbl(
                                    'Bus routes, travel hacks & Bangladesh trip guides delivered free every week.',
                                    'বাস রুট, ভ্রমণ হ্যাক ও বাংলাদেশ ট্রিপ গাইড প্রতি সপ্তাহে বিনামূল্যে।'
                                )}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={lbl('your@email.com', 'আপনার@email.com')}
                            required
                            className="flex-1 min-w-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="shrink-0 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-sm font-bold disabled:opacity-60 transition-all shadow-sm"
                        >
                            {status === 'loading' ? '…' : lbl('Subscribe', 'সাবস্ক্রাইব')}
                        </button>
                    </form>

                    {status === 'error' && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <p className="text-xs text-red-500">
                                {lbl('Something went wrong. Please try again.', 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।')}
                            </p>
                        </div>
                    )}

                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2.5">
                        {lbl('No spam. Unsubscribe anytime. Completely free.', 'কোনো স্প্যাম নেই। যেকোনো সময় আনসাবস্ক্রাইব। বিনামূল্যে।')}
                    </p>
                </>
            )}
        </div>
    );
}
