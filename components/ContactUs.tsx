import React from 'react';
import { Mail, Linkedin, Facebook, MapPin, Send, MessageSquare, Bug, Lightbulb, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppView } from '../types';
// import AdSenseAd from './AdSenseAd';


interface ContactUsProps {
    view: AppView;
    setView: (view: AppView) => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ view, setView }) => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-kj-panel overflow-y-auto overscroll-y-contain touch-pan-y w-full relative" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="max-w-4xl mx-auto p-6 md:p-12 pt-6 md:pt-32 pb-32 md:pb-12 w-full">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-kj-accent/10 text-kj-accent rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                        <MessageSquare className="w-4 h-4" /> {t('contactUs.getInTouch')}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 text-kj-text italic">
                        {t('contactUs.subtitle')}
                    </h1>
                    <p className="text-xl text-kj-text-dim max-w-2xl mx-auto">
                        {t('contactUs.description')}
                    </p>
                </div>

                {/* <AdSenseAd adSlot="auto" className="mb-12 w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" /> */}


                <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-2xl mx-auto">
                    {/* Feedback */}
                    <div className="bg-slate-50 dark:bg-kj-chip-bg/50 p-8 rounded-3xl border border-kj-line text-center hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="w-16 h-16 bg-kj-primary-soft text-kj-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Lightbulb className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-kj-text mb-2">{t('contactUs.shareIdeas')}</h3>
                        <p className="text-sm text-kj-text-dim mb-6">{t('contactUs.shareIdeasDesc')}</p>
                        <div className="inline-flex items-center gap-2 text-kj-primary font-bold">
                            {t('common.ready') || 'Ready'} <Send className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Partnership */}
                    <div className="bg-slate-50 dark:bg-kj-chip-bg/50 p-8 rounded-3xl border border-kj-line text-center hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Share2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-kj-text mb-2">{t('contactUs.partnership')}</h3>
                        <p className="text-sm text-kj-text-dim mb-6">{t('contactUs.partnershipDesc')}</p>
                        <a href="https://linkedin.com/company/koy-jabo" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                            LinkedIn <Send className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <div className="bg-kj-panel border border-kj-line rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-kj-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-kj-accent/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                    <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                        <div className="shrink-0">
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-3 border-4 border-white dark:border-kj-line">
                                <img
                                    src="https://media.licdn.com/dms/image/v2/D5603AQEU8R2MLGhUlg/profile-displayphoto-scale_200_200/B56Zk6N_ckHcAY-/0/1757618372796?e=1777507200&v=beta&t=ATjuFSUVIoqhudnqT9ZVUjdmLMCr75XaIxz--WayDik"
                                    alt="Mejbaur Bahar Fagun"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-black text-kj-text mb-2">Mejbaur Bahar Fagun</h2>
                            <p className="text-kj-primary dark:text-kj-primary font-bold mb-6 text-lg tracking-wide uppercase">{t('contactUs.founder')}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                                <a href="https://linkedin.com/in/mejbaur/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-kj-chip-bg rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group border border-transparent hover:border-blue-200 sm:col-span-2">
                                    <div className="w-10 h-10 bg-kj-panel rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                                        <Linkedin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-kj-text-faint uppercase font-black">LinkedIn</div>
                                        <div className="text-sm font-bold text-kj-text-dim truncate">linkedin.com/in/mejbaur/</div>
                                    </div>
                                </a>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-kj-chip-bg rounded-2xl sm:col-span-2 border border-transparent">
                                    <div className="w-10 h-10 bg-kj-panel rounded-xl flex items-center justify-center shadow-sm text-kj-accent">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-kj-text-faint uppercase font-black">{t('contactUs.location')}</div>
                                        <div className="text-sm font-bold text-kj-text-dim">{t('contactUs.locationDesc')}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center md:justify-start gap-4">
                                <a href="https://facebook.com/koyjabo" target="_blank" rel="noreferrer" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                                    <Facebook className="w-5 h-5" /> <span>{t('contactUs.socialPage')}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <AdSenseAd adSlot="auto" className="mt-12 w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" /> */}

                {/* Mobile Bottom Spacer */}

                <div className="h-24 md:hidden"></div>
            </div>
        </div>
    );
};

export default ContactUs;
