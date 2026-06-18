import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppView } from '../types';
import KoyJaboLogo from './KoyJaboLogo';

interface GlobalFooterProps {
  setView: (view: AppView) => void;
}

const GlobalFooter: React.FC<GlobalFooterProps> = ({ setView }) => {
  const { t, language } = useLanguage();
  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const links: { href: string; label: string; onClick?: (e: React.MouseEvent) => void }[] = [
    { href: '/', label: t('nav.home') || 'Home', onClick: (e) => { e.preventDefault(); setView(AppView.HOME); } },
    { href: '/about', label: t('nav.about') || 'About', onClick: (e) => { e.preventDefault(); setView(AppView.ABOUT); } },
    { href: '/faq', label: t('nav.faq') || 'FAQ', onClick: (e) => { e.preventDefault(); setView(AppView.FAQ); } },
    { href: '/install', label: lbl('Install app', 'অ্যাপ ইনস্টল'), onClick: (e) => { e.preventDefault(); setView(AppView.INSTALL_APP); } },
    { href: '/contact', label: t('nav.contact') || 'Contact', onClick: (e) => { e.preventDefault(); setView(AppView.CONTACT); } },
    { href: '/privacy', label: t('nav.privacy') || 'Privacy', onClick: (e) => { e.preventDefault(); setView(AppView.PRIVACY); } },
    { href: '/terms', label: t('nav.terms') || 'Terms', onClick: (e) => { e.preventDefault(); setView(AppView.TERMS); } },
    { href: '/release-notes', label: lbl('Release notes', 'রিলিজ নোট'), onClick: (e) => { e.preventDefault(); setView(AppView.RELEASE_NOTES); } },
    { href: '/intercity-hub', label: t('intercity.title') || 'Intercity', onClick: (e) => { e.preventDefault(); setView(AppView.INTERCITY_HUB); } },
  ];

  // Split links into 3 columns
  const col1 = links.slice(0, 3);
  const col2 = links.slice(3, 6);
  const col3 = links.slice(6);

  return (
    <footer
      className="border-t border-kj-line"
      style={{ background: 'color-mix(in srgb, var(--kj-panel) 90%, transparent)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      {/* Main content */}
      <div className="w-full px-5 sm:px-8 md:px-10 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-6 md:justify-between md:items-start">

          {/* Left: Brand */}
          <div className="flex flex-col gap-2.5 min-w-[160px]">
            <div className="flex items-center gap-2.5">
              <KoyJaboLogo size={36} isDarkMode={isDarkMode} />
              <span className="font-bengali font-bold text-kj-text text-[17px] tracking-tight">
                কই<span style={{ color: 'var(--kj-accent)' }}>যাবো</span>
              </span>
            </div>
            <p className="font-bengali text-[12px] text-kj-text-dim leading-[1.55] max-w-[180px]">
              {lbl("Bangladesh's smart transport guide", "বাংলাদেশের স্মার্ট ট্রান্সপোর্ট গাইড")}
            </p>
            {/* Social row — LinkedIn + Facebook only */}
            <div className="flex items-center gap-2 mt-1">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/koy-jabo/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-kj-text-dim hover:text-kj-text transition-colors"
                style={{ background: 'var(--kj-panel-muted)', border: '1px solid var(--kj-line)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/koyjabo/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-kj-text-dim hover:text-kj-text transition-colors"
                style={{ background: 'var(--kj-panel-muted)', border: '1px solid var(--kj-line)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Center: Nav links grid 3 cols */}
          <nav className="grid grid-cols-3 gap-x-6 gap-y-2.5 sm:gap-x-10">
            {[col1, col2, col3].map((col, ci) => (
              <div key={ci} className="flex flex-col gap-2.5">
                {col.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={link.onClick}
                    className="text-[12.5px] font-medium text-kj-text-dim hover:text-kj-text transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </nav>

          {/* Right: Made in Dhaka + copyright */}
          <div className="flex flex-col gap-2 items-start md:items-end min-w-[160px]">
            <p className="font-bengali text-[12.5px] text-kj-text-dim leading-[1.5]">
              {lbl('Made in Dhaka for Bangladesh', 'বাংলাদেশের জন্য ঢাকায় তৈরি')}
            </p>
            <p className="text-[11.5px] text-kj-text-faint font-sans">
              © 2026 KoyJabo
            </p>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default GlobalFooter;
