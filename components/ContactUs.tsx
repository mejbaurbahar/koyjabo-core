import React from 'react';
import { Mail, Linkedin, Facebook, MapPin, Send, MessageSquare, Bug, Lightbulb, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ContactUs: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto w-full relative">
            <div className="max-w-4xl mx-auto p-6 md:p-12 pt-24 md:pt-32 pb-32 md:pb-12 w-full">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-dhaka-red/10 text-dhaka-red rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                        <MessageSquare className="w-4 h-4" /> Get In Touch
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 text-gray-900 dark:text-gray-100 italic">
                        Let's Talk!
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Have questions, feedback, or found a missing route? We're here to help you navigate Bangladesh better.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {/* Bug Report */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Bug className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Report a Bug</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Found an incorrect route or a technical glitch? Let us know.</p>
                        <a href="https://github.com/mejbaurbahar/Dhaka-Commute/issues" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-bold hover:underline">
                            Open Issue <Send className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Feedback */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Lightbulb className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Share Ideas</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Have an idea to make KoyJabo better? We'd love to hear it!</p>
                        <a href="mailto:mejbaurbaharfagun@gmail.com" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                            Send Email <Send className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Partnership */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Share2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Partnership</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Interested in integrating with KoyJabo? Let's connect.</p>
                        <a href="https://linkedin.com/company/koy-jabo" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                            LinkedIn <Send className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-dhaka-green/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-dhaka-red/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                    <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                        <div className="shrink-0">
                            <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-tr from-dhaka-green to-emerald-400 rounded-[2.5rem] flex items-center justify-center text-white text-4xl md:text-7xl font-black shadow-2xl rotate-3">
                                MBF
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">Mejbaur Bahar Fagun</h2>
                            <p className="text-dhaka-green dark:text-emerald-400 font-bold mb-6 text-lg tracking-wide uppercase">Founder & Lead Developer</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                                <a href="mailto:mejbaurbaharfagun@gmail.com" className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group border border-transparent hover:border-emerald-200">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm text-emerald-600">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 uppercase font-black">Email</div>
                                        <div className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">mejbaurbaharfagun@gmail.com</div>
                                    </div>
                                </a>
                                <a href="https://linkedin.com/in/mejbaur/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group border border-transparent hover:border-blue-200">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                                        <Linkedin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 uppercase font-black">LinkedIn</div>
                                        <div className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">in/mejbaur</div>
                                    </div>
                                </a>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl sm:col-span-2 border border-transparent">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm text-dhaka-red">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 uppercase font-black">Location</div>
                                        <div className="text-sm font-bold text-gray-700 dark:text-gray-200">Dhaka, Bangladesh (Available Worldwide)</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center md:justify-start gap-4">
                                <a href="https://facebook.com/koyjabo" target="_blank" rel="noreferrer" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                                    <Facebook className="w-5 h-5" /> <span>Facebook Page</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-400 text-sm font-bold italic">
                        © 2024-2026 KoyJabo (কই যাবো). Developed with ❤️ for the people of Bangladesh.
                    </p>
                </div>

                {/* Mobile Bottom Spacer */}
                <div className="h-24 md:hidden"></div>
            </div>
        </div>
    );
};

export default ContactUs;
