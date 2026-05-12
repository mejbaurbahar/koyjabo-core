import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const GlobalFooter: React.FC = () => {
    const { t } = useLanguage();

    return (
        <footer className="hidden md:block border-t border-kj-line bg-kj-panel w-full mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Brand */}
                    <div className="flex items-center gap-3 shrink-0">
                        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                        <span className="font-bold text-kj-text italic whitespace-nowrap">
                            কই<span className="text-kj-primary ml-1">যাবো</span>
                            <span className="text-kj-text-faint font-normal ml-2 text-sm">Bangladesh Smart Transport Finder</span>
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
                                        ? 'bg-kj-primary-soft text-emerald-700 dark:text-kj-primary'
                                        : 'text-kj-text-dim hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg hover:text-kj-text dark:hover:text-gray-200'
                                }`}
                            >
                                {label}
                            </a>
                        ))}
                    </nav>

                    {/* Copyright */}
                    <p className="text-xs text-kj-text-faint whitespace-nowrap shrink-0">
                        © 2024–2026 KoyJabo
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default GlobalFooter;
