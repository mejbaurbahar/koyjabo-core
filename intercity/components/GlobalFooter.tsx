import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const GlobalFooter: React.FC = () => {
    const { t } = useLanguage();

    return (
        <footer className="hidden md:block py-10 px-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 text-center w-full mt-auto">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                        <span className="font-bold text-gray-900 dark:text-gray-100 italic">
                            কই<span className="text-dhaka-red ml-1">যাবো</span> - Smart Transport Finder
                        </span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        <a
                            href="/"
                            className="text-sm font-medium text-gray-500 hover:text-dhaka-green dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                        >
                            {t('nav.home') || 'Home'}
                        </a>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <a
                            href="/intercity"
                            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-colors"
                        >
                            {t('intercity.title') || 'Intercity'}
                        </a>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <a
                            href="/about.html"
                            className="text-sm font-medium text-gray-500 hover:text-dhaka-green dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                        >
                            {t('nav.about') || 'About'}
                        </a>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <a
                            href="/contact.html"
                            className="text-sm font-medium text-gray-500 hover:text-dhaka-green dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                        >
                            {t('nav.contact') || 'Contact'}
                        </a>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <a
                            href="/privacy-policy.html"
                            className="text-sm font-medium text-gray-500 hover:text-dhaka-green dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                        >
                            {t('nav.privacy') || 'Privacy'}
                        </a>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <a
                            href="/terms-of-service.html"
                            className="text-sm font-medium text-gray-500 hover:text-dhaka-green dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                        >
                            {t('nav.terms') || 'Terms'}
                        </a>
                    </nav>

                    <div className="text-xs text-gray-400 dark:text-gray-500">
                        © 2024-2026 KoyJabo (কই যাবো). All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default GlobalFooter;
