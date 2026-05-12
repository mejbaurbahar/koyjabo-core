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
        <footer className="py-10 px-6 border-t border-kj-line bg-kj-panel text-center">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                        <span className="font-bold text-kj-text italic">
                            কই<span className="text-kj-accent ml-1">যাবো</span> - Bangladesh Smart Transport Finder
                        </span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        <a
                            href="/"
                            onClick={(e) => { e.preventDefault(); setView(AppView.HOME); }}
                            className="text-sm font-medium text-kj-text-dim hover:text-kj-primary dark:text-kj-text-faint dark:hover:text-kj-primary transition-colors"
                        >
                            {t('nav.home') || 'Home'}
                        </a>
                        <span className="text-kj-text-faint dark:text-kj-text-dim">|</span>
                        <a
                            href="/intercity"
                            className="text-sm font-medium text-kj-text-dim hover:text-kj-primary dark:text-kj-text-faint dark:hover:text-kj-primary transition-colors"
                        >
                            {t('intercity.title') || 'Intercity'}
                        </a>
                        <span className="text-kj-text-faint dark:text-kj-text-dim">|</span>
                        <a
                            href="/about"
                            onClick={(e) => { e.preventDefault(); setView(AppView.ABOUT); }}
                            className="text-sm font-medium text-kj-text-dim hover:text-kj-primary dark:text-kj-text-faint dark:hover:text-kj-primary transition-colors"
                        >
                            {t('nav.about') || 'About'}
                        </a>
                        <span className="text-kj-text-faint dark:text-kj-text-dim">|</span>
                        <a
                            href="/contact"
                            onClick={(e) => { e.preventDefault(); setView(AppView.CONTACT); }}
                            className="text-sm font-medium text-kj-text-dim hover:text-kj-primary dark:text-kj-text-faint dark:hover:text-kj-primary transition-colors"
                        >
                            {t('nav.contact') || 'Contact'}
                        </a>
                        <span className="text-kj-text-faint dark:text-kj-text-dim">|</span>
                        <a
                            href="/privacy"
                            onClick={(e) => { e.preventDefault(); setView(AppView.PRIVACY); }}
                            className="text-sm font-medium text-kj-text-dim hover:text-kj-primary dark:text-kj-text-faint dark:hover:text-kj-primary transition-colors"
                        >
                            {t('nav.privacy') || 'Privacy'}
                        </a>
                        <span className="text-kj-text-faint dark:text-kj-text-dim">|</span>
                        <a
                            href="/terms"
                            onClick={(e) => { e.preventDefault(); setView(AppView.TERMS); }}
                            className="text-sm font-medium text-kj-text-dim hover:text-kj-primary dark:text-kj-text-faint dark:hover:text-kj-primary transition-colors"
                        >
                            {t('nav.terms') || 'Terms'}
                        </a>
                    </nav>

                    <div className="text-xs text-kj-text-faint">
                        © 2024-2026 KoyJabo (কই যাবো). All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default GlobalFooter;
