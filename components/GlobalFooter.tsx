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
    { href: '/intercity-hub', label: t('intercity.title') || 'Intercity', onClick: (e) => { e.preventDefault(); setView(AppView.INTERCITY_HUB); } },
  ];

  // Split links into 3 columns
  const col1 = links.slice(0, 3);
  const col2 = links.slice(3, 6);
  const col3 = links.slice(6);

  return (
    <footer
      className="border-t border-kj-line mt-auto"
      style={{ background: 'color-mix(in srgb, var(--kj-panel) 90%, transparent)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      {/* Main content */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-10 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-6 md:justify-between md:items-start">

          {/* Left: Brand */}
          <div className="flex flex-col gap-2.5 min-w-[160px]">
            <div className="flex items-center gap-2.5">
              {/* ক logo square */}
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center font-bengali font-black text-[20px] shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
                  color: 'var(--kj-primary-ink)',
                  boxShadow: '0 4px 14px -4px var(--kj-primary)',
                }}
              >
                ক
              </div>
              <span className="font-bengali font-bold text-kj-text text-[17px] tracking-tight">
                কই<span style={{ color: 'var(--kj-accent)' }}>যাবো</span>
              </span>
            </div>
            <p className="font-bengali text-[12px] text-kj-text-dim leading-[1.55] max-w-[180px]">
              {lbl("Bangladesh's smart transport guide", "বাংলাদেশের স্মার্ট ট্রান্সপোর্ট গাইড")}
            </p>
            {/* Social row */}
            <div className="flex items-center gap-2 mt-1">
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-kj-text-dim hover:text-kj-text transition-colors"
                style={{ background: 'var(--kj-panel-muted)', border: '1px solid var(--kj-line)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/>
                </svg>
              </a>
              {/* Twitter/X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-kj-text-dim hover:text-kj-text transition-colors"
                style={{ background: 'var(--kj-panel-muted)', border: '1px solid var(--kj-line)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.74-8.855L2.25 2.25h6.961l4.263 5.634 5.77-5.634Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://facebook.com"
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
              {lbl('Made in Dhaka', 'ঢাকায় তৈরি')}
              {' '}
              <span aria-label="love" role="img">❤️</span>
              {' '}
              {lbl('for Bangladesh', 'বাংলাদেশের জন্য')}
            </p>
            <p className="text-[11.5px] text-kj-text-faint font-sans">
              © 2024–2026 KoyJabo
            </p>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="border-t border-kj-line px-5 sm:px-8 py-2.5 flex items-center justify-center"
        style={{ background: 'color-mix(in srgb, var(--kj-panel-muted) 80%, transparent)' }}
      >
        <p className="text-[10.5px] text-kj-text-faint font-sans tracking-wide opacity-60">
          {lbl('v2.0 · Open source · PWA ready', 'v2.0 · ওপেন সোর্স · PWA প্রস্তুত')}
        </p>
      </div>
    </footer>
  );
};

export default GlobalFooter;
