import React from 'react';
import { Mail, Linkedin, Facebook, MapPin, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ContactUs: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto w-full">
            <div className="max-w-3xl mx-auto p-6 md:p-12 pt-24 md:pt-24 w-full">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">Contact Us</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Have questions, feedback, or found a missing route? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">

                    {/* Social Cards */}
                    <a href="https://linkedin.com/in/mejbaur/" target="_blank" rel="noopener noreferrer"
                        className="block p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all group">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                            <Linkedin className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">LinkedIn</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Connect with the developer for professional inquiries or direct messaging.
                        </p>
                        <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                            Visit Profile <Send className="w-4 h-4" />
                        </div>
                    </a>

                    <a href="https://www.facebook.com/koyjabo" target="_blank" rel="noopener noreferrer"
                        className="block p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                            <Facebook className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Facebook Page</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Follow us for updates, new features, and community discussions.
                        </p>
                        <div className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                            Follow Us <Send className="w-4 h-4" />
                        </div>
                    </a>

                    <div className="block p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl md:col-span-2">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Email Support</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    For general queries, bug reports, or partnership opportunities.
                                </p>
                                <a href="mailto:contact@koyjabo.com" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors">
                                    <Mail className="w-4 h-4" /> Send Email
                                </a>
                                <p className="text-xs text-gray-400 mt-2">
                                    (Currently redirects to developer's inbox)
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Location</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Dhaka, Bangladesh
                    </p>
                </div>

                {/* Bottom padding */}
                <div className="h-20"></div>
            </div>
        </div>
    );
};

export default ContactUs;
