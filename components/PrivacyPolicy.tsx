import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Lock, Eye, Clock, ExternalLink, UserCheck, WifiOff } from 'lucide-react';
import { AppView } from '../types';
import AdSenseAd from './AdSenseAd';

interface PrivacyPolicyProps {
    view: AppView;
    setView: (view: AppView) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ view, setView }) => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto overflow-x-hidden w-full relative max-w-full">
            <div className="max-w-4xl mx-auto p-6 md:p-12 pt-6 md:pt-28 pb-32 md:pb-12">

                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-dhaka-green/10 text-dhaka-green rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dhaka-green/20">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">🔒 {t('privacy.title')}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">কই যাবো (KoyJabo) - Bangladesh's Smart Transport Route Finder</p>
                    <AdSenseAd adSlot="auto" className="mt-8" />
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-6 rounded-r-xl mb-10 shadow-sm">
                    <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200 font-bold mb-2">
                        <Clock className="w-5 h-5" />
                        <span>{t('privacy.effectiveDate')}: January 1, 2024</span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{t('privacy.lastUpdated')}: April 17, 2026</p>
                </div>

                <div className="space-y-12 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-dhaka-green dark:text-emerald-400 border-b border-gray-100 dark:border-gray-800 pb-2">{t('privacy.introduction')}</h2>
                        <p>
                            {t('privacy.introText')}
                            <a href="https://koyjabo.com" className="text-dhaka-green hover:underline mx-1">koyjabo.com</a>
                        </p>
                    </section>

                    <section className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            <Eye className="w-6 h-6 text-blue-500" /> {t('privacy.collectInfo')}
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">{t('privacy.autoCollect')}</h3>
                                <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                                    <li>{t('privacy.logData')}</li>
                                    <li>{t('privacy.deviceInfo')}</li>
                                    <li>{t('privacy.usageData')}</li>
                                    <li>{t('privacy.locationData')}</li>
                                </ul>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-emerald-500" /> {t('privacy.locationConsent')}
                                </h3>
                                <p className="text-sm">
                                    {t('privacy.locationConsentText')}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-dhaka-green dark:text-emerald-400 border-b border-gray-100 dark:border-gray-800 pb-2">{t('privacy.howWeUse')}</h2>
                        <ol className="list-decimal list-inside space-y-3 mt-4">
                            <li>{t('privacy.howWeUse1')}</li>
                            <li>{t('privacy.howWeUse2')}</li>
                            <li>{t('privacy.howWeUse3')}</li>
                        </ol>
                    </section>

                    <section className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            <UserCheck className="w-6 h-6 text-emerald-500" /> {t('authInfo.title')}
                        </h2>
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <p>{t('authInfo.offersOptional')}</p>
                            <ul className="list-disc list-inside ml-4 space-y-2">
                                <li>{t('authInfo.githubProfile')}</li>
                                <li>{t('authInfo.emailIdentification')}</li>
                                <li>{t('authInfo.localSearchHistory')}</li>
                                <li>{t('authInfo.deviceSessions')}</li>
                            </ul>
                            <p className="mt-3">{t('authInfo.useWithoutAccount')}</p>
                        </div>
                    </section>

                    <section className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-8 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-4 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <WifiOff className="w-6 h-6" /> {t('donts.title')}
                        </h2>
                        <ul className="list-none space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-0.5">✓</span> {t('donts.noExternalAI')}</li>
                            <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-0.5">✓</span> {t('donts.noDataSelling')}</li>
                            <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-0.5">✓</span> {t('donts.noGPSTracking')}</li>
                            <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-0.5">✓</span> {t('donts.noRequiredRegistration')}</li>
                            <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-0.5">✓</span> {t('donts.noServerHistory')}</li>
                        </ul>
                    </section>

                    <section className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-blue-500" /> {t('privacy.thirdParty')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('privacy.thirdPartyText')}
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2">{t('privacy.contactUsTitle')}</h2>
                        <p className="mb-6">{t('privacy.contactUsDesc')}</p>
                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700">
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
                                        <a href="https://linkedin.com/in/mejbaur/" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-start gap-2 text-dhaka-green hover:underline font-medium">
                                            LinkedIn Profile <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <a href="https://facebook.com/koyjabo" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-600 text-sm flex items-center justify-center md:justify-start gap-1">
                                            Facebook Page <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Bottom padding for mobile footer */}
                <div className="h-24 md:hidden"></div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
