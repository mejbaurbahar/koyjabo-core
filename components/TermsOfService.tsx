import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, Mail, ExternalLink } from 'lucide-react';
import GlobalFooter from './GlobalFooter';
import { AppView } from '../types';

interface TermsOfServiceProps {
    view: AppView;
    setView: (view: AppView) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ view, setView }) => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto overflow-x-hidden w-full relative max-w-full">
            <div className="max-w-4xl mx-auto p-6 md:p-12 pt-20 md:pt-28 pb-32 md:pb-12">

                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">📜 {t('terms.title') || 'Terms of Service'}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">কই যাবো (KoyJabo) - Bangladesh's Smart Transport Route Finder</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-6 rounded-r-xl mb-10 shadow-sm">
                    <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200 font-bold mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Effective Date: January 1, 2024</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Last Reviewed: January 26, 2026</p>
                </div>

                <div className="space-y-12 text-gray-700 dark:text-gray-300 leading-relaxed text-lg text-left">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 border-b border-gray-100 dark:border-gray-800 pb-2">1. Acceptance of Terms</h2>
                        <p>
                            Welcome to <strong>কই যাবো (KoyJabo)</strong>. By accessing or using our website at
                            <a href="https://koyjabo.com" className="text-blue-600 hover:underline mx-1">koyjabo.com</a>,
                            our mobile Progressive Web Application (PWA), or any related services, you agree to be bound by these Terms of Service.
                        </p>
                        <p className="mt-4 font-bold text-red-500">
                            If you do not agree to these Terms, please do not use the Service.
                        </p>
                    </section>

                    <section className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">2. Service Description</h2>
                        <p className="mb-4">KoyJabo is a free, web-based transport route finder designed to help users navigate public transportation in Bangladesh. Our Service provides:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                'Bus route information for Dhaka and other cities',
                                'Metro Rail (MRT) schedules and fare information',
                                'Intercity bus, train, and flight information',
                                'Interactive maps and navigation',
                                'AI-powered travel assistance',
                                'Offline access to previously searched routes'
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-8 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" /> 7. Disclaimer of Warranties
                        </h2>
                        <p className="font-bold text-red-800 dark:text-red-300 mb-4 uppercase text-sm tracking-wide">The Service is provided "AS IS" and "AS AVAILABLE" without any warranties.</p>
                        <p className="text-sm">
                            We make every effort to ensure route data is accurate and up-to-date, but we <strong>do not guarantee</strong> the accuracy or reliability of information provided.
                            Bus routes, schedules, fares, and other transport information may change without notice. Always verify critical information with official sources.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2">8. Limitation of Liability</h2>
                        <p className="text-sm mb-4">TO THE FULLEST EXTENT PERMITTED BY LAW, KOYJABO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING BUT NOT LIMITED TO:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm ml-4 italic text-gray-600 dark:text-gray-400 text-left">
                            <li>Loss of time, money, or data</li>
                            <li>Missed appointments or connections due to inaccurate information</li>
                            <li>Personal injury or property damage resulting from use of the Service</li>
                        </ul>
                    </section>

                    <section className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" /> 10. Privacy
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your use is also governed by our Privacy Policy. We do NOT require account creation or personal information to use the Service.
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-blue-500" /> 13. Modifications
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                We reserve the right to modify or discontinue any aspect of the Service at any time without notice.
                            </p>
                        </div>
                    </section>

                    <section className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Contact & Support</h2>
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-lg">MBF</div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mejbaur Bahar Fagun</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Developer & Owner, KoyJabo</p>
                                <a href="mailto:mejbaurbaharfagun@gmail.com" className="flex items-center justify-center md:justify-start gap-2 text-blue-600 hover:underline font-bold">
                                    <Mail className="w-4 h-4" /> mejbaurbaharfagun@gmail.com
                                </a>
                                <p className="text-xs text-gray-400 mt-4">Dhaka, Bangladesh</p>
                            </div>
                        </div>
                    </section>

                    <GlobalFooter view={view} setView={setView} />
                </div>

                {/* Bottom padding for mobile footer */}
                <div className="h-24 md:hidden"></div>
            </div>
        </div>
    );
};

export default TermsOfService;
