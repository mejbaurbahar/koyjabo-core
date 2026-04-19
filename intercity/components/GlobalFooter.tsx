import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const GlobalFooter: React.FC = () => {
    const { t } = useLanguage();

    return (
        <footer className="hidden md:block border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 w-full mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Brand */}
                    <div className="flex items-center gap-3 shrink-0">
                        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                        <span className="font-bold text-gray-900 dark:text-gray-100 italic whitespace-nowrap">
                            কই<span className="text-emerald-600 dark:text-emerald-400 ml-1">যাবো</span>
                            <span className="text-gray-400 dark:text-gray-500 font-normal ml-2 text-sm">Smart Transport Finder</span>
                        </span>
                    </div>

                    {/* Nav links */}
                    <nav className="flex items-center flex-wrap justify-center gap-1">
                        {[
                            { href: '/', label: t('nav.home') || 'Home' },
                            { href: '/intercity', label: t('intercity.title') || 'Intercity', active: true },
                            { href: '/about.html', label: t('nav.about') || 'About' },
                            { href: '/contact.html', label: t('nav.contact') || 'Contact' },
                            { href: '/privacy-policy.html', label: t('nav.privacy') || 'Privacy' },
                            { href: '/terms-of-service.html', label: t('nav.terms') || 'Terms' },
                        ].map(({ href, label, active }) => (
                            <a
                                key={href}
                                href={href}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                {label}
                            </a>
                        ))}
                    </nav>

                    {/* Copyright */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                        © 2024–2026 KoyJabo
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default GlobalFooter;
