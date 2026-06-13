import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppView } from '../types';

interface GlobalFooterProps {
  setView: (view: AppView) => void;
}

const GlobalFooter: React.FC<GlobalFooterProps> = ({ setView }) => {
  const { t, language } = useLanguage();
  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);

  const links: { href: string; label: string; onClick?: (e: React.MouseEvent) => void }[] = [
    { href: '/', label: t('nav.home') || 'Home', onClick: (e) => { e.preventDefault(); setView(AppView.HOME); } },
    { href: '/about', label: t('nav.about') || 'About', onClick: (e) => { e.preventDefault(); setView(AppView.ABOUT); } },
    { href: '/faq', label: t('nav.faq') || 'FAQ', onClick: (e) => { e.preventDefault(); setView(AppView.FAQ); } },
    { href: '/install', label: lbl('Install app', 'অ্যাপ ইনস্টল'), onClick: (e) => { e.preventDefault(); setView(AppView.INSTALL_APP); } },
    { href: '/contact', label: t('nav.contact') || 'Contact', onClick: (e) => { e.preventDefault(); setView(AppView.CONTACT); } },
    { href: '/privacy', label: t('nav.privacy') || 'Privacy', onClick: (e) => { e.preventDefault(); setView(AppView.PRIVACY); } },
    { href: '/terms', label: t('nav.terms') || 'Terms', onClick: (e) => { e.preventDefault(); setView(AppView.TERMS); } },
    { href: '/release-notes', label: lbl('Release notes', 'রিলিজ নোট'), onClick: (e) => { e.preventDefault(); setView(AppView.RELEASE_NOTES); } },
    { href: '/intercity', label: t('intercity.title') || 'Intercity' },
  ];

  return (
    <footer className="shrink-0 py-6 sm:py-8 px-4 sm:px-6 md:px-10 border-t border-kj-line bg-kj-panel">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="KoyJabo" className="h-9 w-auto" />
            <span className="font-bold text-kj-text italic text-sm">
              কই<span className="text-kj-accent ml-1">যাবো</span>
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-3 gap-y-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={link.onClick}
                className="text-xs sm:text-sm font-medium text-kj-text-dim hover:text-kj-primary transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-xs text-kj-text-faint whitespace-nowrap">
            © 2024–2026 KoyJabo
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
