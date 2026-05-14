import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppView } from '../types';

interface GlobalFooterProps {
    view: AppView;
    setView: (view: AppView) => void;
}

const GlobalFooter: React.FC<GlobalFooterProps> = ({ setView }) => {
    const { t } = useLanguage();

    return (
        <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-kj-line bg-kj-panel text-center">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="h-9 sm:h-10 w-auto" />
                        <span className="font-bold text-kj-text italic text-sm sm:text-base">
                            কই<span className="text-kj-accent ml-1">যাবো</span>
                            <span className="hidden sm:inline"> - Bangladesh Smart Transport Finder</span>
                        </span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-3 sm:gap-x-4 gap-y-2">
                        {[
                            { href: '/', label: t('nav.home') || 'Home', onClick: (e: React.MouseEvent) => { e.preventDefault(); setView(AppView.HOME); } },
                            { href: '/intercity', label: t('intercity.title') || 'Intercity' },
                            { href: '/about', label: t('nav.about') || 'About', onClick: (e: React.MouseEvent) => { e.preventDefault(); setView(AppView.ABOUT); } },
                            { href: '/contact', label: t('nav.contact') || 'Contact', onClick: (e: React.MouseEvent) => { e.preventDefault(); setView(AppView.CONTACT); } },
                            { href: '/privacy', label: t('nav.privacy') || 'Privacy', onClick: (e: React.MouseEvent) => { e.preventDefault(); setView(AppView.PRIVACY); } },
                            { href: '/terms', label: t('nav.terms') || 'Terms', onClick: (e: React.MouseEvent) => { e.preventDefault(); setView(AppView.TERMS); } },
                        ].map((link, i, arr) => (
                            <React.Fragment key={link.href}>
                                <a
                                    href={link.href}
                                    onClick={link.onClick}
                                    className="text-xs sm:text-sm font-medium text-kj-text-dim hover:text-kj-primary dark:text-kj-text-faint dark:hover:text-kj-primary transition-colors py-1"
                                >
                                    {link.label}
                                </a>
                                {i < arr.length - 1 && <span className="text-kj-text-faint hidden sm:inline">·</span>}
                            </React.Fragment>
                        ))}
                    </nav>

                    <div className="text-xs text-kj-text-faint">
                        © 2024-2026 KoyJabo. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default GlobalFooter;
