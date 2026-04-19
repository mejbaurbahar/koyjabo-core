import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, UserCheck, Train, Bot } from 'lucide-react';
import { AppView } from '../types';

interface TermsOfServiceProps {
    view: AppView;
    setView: (view: AppView) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ view, setView }) => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto overflow-x-hidden w-full relative max-w-full">
            <div className="max-w-4xl mx-auto p-6 md:p-12 pt-6 md:pt-28 pb-32 md:pb-12">

                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">📜 {t('terms.title')}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">কই যাবো (KoyJabo) - Bangladesh's Smart Transport Route Finder</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-6 rounded-r-xl mb-10 shadow-sm">
                    <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200 font-bold mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Effective Date: January 1, 2024</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{t('terms.lastUpdated')}: April 17, 2026</p>
                </div>

                <div className="space-y-12 text-gray-700 dark:text-gray-300 leading-relaxed text-lg text-left">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 border-b border-gray-100 dark:border-gray-800 pb-2">{t('terms.acceptance')}</h2>
                        <p>
                            {t('terms.acceptanceText')}
                        </p>
                    </section>

                    <section className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{t('terms.serviceDesc')}</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                t('terms.busRouteInfo'),
                                t('terms.metroRailInfo'),
                                t('terms.intercityInfo'),
                                t('terms.aiAssistance'),
                                t('about.whoIsItForDesc'),
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-emerald-500" /> {t('terms.userAccountsTitle')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('terms.userAccountsDesc')}
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <Train className="w-5 h-5 text-blue-500" /> {t('terms.trainDataTitle')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('terms.trainDataDesc')}
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <Bot className="w-5 h-5 text-purple-500" /> {t('terms.aiAssistantTitle')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('terms.aiAssistantDesc')}
                            </p>
                        </div>
                    </section>

                    <section className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-8 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" /> {t('terms.disclaimer')}
                        </h2>
                        <p className="text-sm">
                            {t('terms.disclaimerText')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2">{t('terms.liability')}</h2>
                        <p className="text-sm mb-4">{t('terms.liabilityDesc')}</p>
                    </section>

                    <section className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" /> {t('terms.privacyTitle')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('terms.privacyDesc')}
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-blue-500" /> {t('terms.modificationsTitle')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('terms.modificationsDesc')}
                            </p>
                        </div>
                    </section>

                    <section className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('terms.contactUs')}</h2>
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg border-2 border-white dark:border-slate-700">
                                <img
                                    src="https://media.licdn.com/dms/image/v2/D5603AQEU8R2MLGhUlg/profile-displayphoto-scale_200_200/B56Zk6N_ckHcAY-/0/1757618372796?e=1777507200&v=beta&t=ATjuFSUVIoqhudnqT9ZVUjdmLMCr75XaIxz--WayDik"
                                    alt="Mejbaur Bahar Fagun"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mejbaur Bahar Fagun</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Founder, KoyJabo</p>
                                <div className="flex flex-col gap-2">
                                    <a href="https://linkedin.com/in/mejbaur/" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-start gap-2 text-blue-600 hover:underline font-bold">
                                        LinkedIn Profile <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <a href="https://facebook.com/koyjabo" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-600 text-sm flex items-center justify-center md:justify-start gap-1">
                                        Facebook Page <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                                <p className="text-xs text-gray-400 mt-4">Dhaka, Bangladesh</p>
                            </div>
                        </div>
                    </section>

                </div>

                <div className="h-24 md:hidden"></div>
            </div>
        </div>
    );
};

export default TermsOfService;
