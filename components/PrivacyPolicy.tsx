import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Lock, Eye, Clock, Mail, ExternalLink } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto overflow-x-hidden w-full relative max-w-full">
            <div className="max-w-4xl mx-auto p-6 md:p-12 pt-20 md:pt-28 pb-32 md:pb-12">

                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-dhaka-green/10 text-dhaka-green rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dhaka-green/20">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">🔒 {t('privacy.title') || 'Privacy Policy'}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">কই যাবো (KoyJabo) - Bangladesh's Smart Transport Route Finder</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-6 rounded-r-xl mb-10 shadow-sm">
                    <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200 font-bold mb-2">
                        <Clock className="w-5 h-5" />
                        <span>Effective Date: January 1, 2024</span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">Last Updated: January 26, 2026</p>
                </div>

                <div className="space-y-12 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-dhaka-green dark:text-emerald-400 border-b border-gray-100 dark:border-gray-800 pb-2">1. Introduction</h2>
                        <p>
                            Welcome to <strong>কই যাবো (KoyJabo)</strong>. We are committed to protecting your privacy and ensuring a safe online experience.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website
                            <a href="https://koyjabo.com" className="text-dhaka-green hover:underline mx-1">koyjabo.com</a> and our Progressive Web Application (PWA).
                        </p>
                        <p className="mt-4">
                            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
                        </p>
                    </section>

                    <section className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            <Eye className="w-6 h-6 text-blue-500" /> 2. Information We Collect
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">2.1 Automatically Collected Information</h3>
                                <p className="text-sm mb-3">When you visit our website, we may automatically collect certain information about your device, including:</p>
                                <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                                    <li><strong>Log Data:</strong> IP address, browser type, operating system, referring URLs, pages viewed, and timestamps</li>
                                    <li><strong>Device Information:</strong> Device type, screen resolution, and browser settings</li>
                                    <li><strong>Usage Data:</strong> Search queries (bus routes, destinations), feature usage patterns, and interaction with the app</li>
                                    <li><strong>Location Data:</strong> Approximate location based on IP address (we do NOT track precise GPS location without your explicit permission)</li>
                                </ul>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-emerald-500" /> 2.2 Location Information (Optional)
                                </h3>
                                <p className="text-sm">
                                    If you choose to use our "Use My Location" feature, we request access to your device's GPS location <strong>only with your explicit consent</strong>.
                                    This information is used solely to find nearby bus stops and provide navigation.
                                </p>
                                <p className="mt-3 text-sm font-bold text-dhaka-green">Important: Location data is processed locally on your device and is NOT stored on our servers.</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">2.3 Cookies and Local Storage</h3>
                                <p className="text-sm">We use cookies and browser local storage to remember your preferences (language, theme, favorite routes) and enable offline functionality.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-dhaka-green dark:text-emerald-400 border-b border-gray-100 dark:border-gray-800 pb-2">3. How We Use Your Information</h2>
                        <ol className="list-decimal list-inside space-y-3 mt-4">
                            <li><strong>To Provide Services:</strong> Display bus routes, maps, and transport information based on your search queries</li>
                            <li><strong>To Improve User Experience:</strong> Analyze usage patterns to optimize app performance and add new features</li>
                            <li><strong>To Enable Offline Access:</strong> Cache route data locally so you can use the app without an internet connection</li>
                            <li><strong>To Serve Relevant Ads:</strong> Display advertisements via Google AdSense (which helps keep the app free)</li>
                            <li><strong>To Comply with Legal Obligations:</strong> Respond to legal requests or prevent fraudulent activity</li>
                        </ol>
                    </section>

                    <section className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-blue-500" /> 4. Third-Party Services
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                We use third-party services like <strong>Google Analytics</strong>, <strong>Google AdSense</strong>, and <strong>Google Gemini AI</strong>. Each of these services has their own privacy policies regarding data handling.
                            </p>
                        </div>
                        <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Privacy Commitment
                            </h3>
                            <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed text-left">
                                KoyJabo is designed to be privacy-first. We do NOT require an account, and we do NOT collect personal information like your name, email, or phone number unless you explicitly contact us for support.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2">Contact Us</h2>
                        <p className="mb-6">If you have any questions or concerns about this Privacy Policy, please reach out:</p>
                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-20 h-20 bg-dhaka-green rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0">MBF</div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mejbaur Bahar Fagun</h4>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Developer & Owner, KoyJabo</p>
                                    <div className="flex flex-col gap-2">
                                        <a href="mailto:mejbaurbaharfagun@gmail.com" className="flex items-center justify-center md:justify-start gap-2 text-dhaka-green hover:underline font-medium">
                                            <Mail className="w-4 h-4" /> mejbaurbaharfagun@gmail.com
                                        </a>
                                        <a href="https://linkedin.com/in/mejbaur/" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-600 text-sm flex items-center justify-center md:justify-start gap-1">
                                            LinkedIn Profile <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <footer className="text-center pt-10 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">© 2024-2026 KoyJabo (কই যাবো). All rights reserved.</p>
                        <p className="text-xs text-gray-400 italic">By using KoyJabo, you hereby consent to our Privacy Policy and agree to its terms.</p>
                    </footer>
                </div>

                {/* Bottom padding for mobile footer */}
                <div className="h-24 md:hidden"></div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
