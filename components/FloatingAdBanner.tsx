import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FloatingAdBannerProps {
  /** Extra bottom offset in px — pass 64 on mobile to float above the bottom nav bar */
  bottomOffset?: number;
}

const DISMISSED_KEY = 'kj_float_ad_dismissed';

// Separate component so AdSense pushes on mount
const AdSlotInner: React.FC = () => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', textAlign: 'center', minHeight: 50 }}
      data-ad-client="ca-pub-8425219156685369"
      data-ad-slot="auto"
      data-ad-format="horizontal"
      data-full-width-responsive="true"
    />
  );
};

const FloatingAdBanner: React.FC<FloatingAdBannerProps> = ({ bottomOffset = 0 }) => {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      const dismissed = sessionStorage.getItem(DISMISSED_KEY);
      if (!dismissed) {
        setVisible(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      }
    }, 2000);
    return () => clearTimeout(showTimer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    // Re-show after 5 minutes in the same session
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setTimeout(() => {
      sessionStorage.removeItem(DISMISSED_KEY);
    }, 5 * 60 * 1000);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed left-0 right-0 z-[200] flex items-end justify-center pointer-events-none
        transition-transform duration-500 ease-out ${entered ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ bottom: bottomOffset }}
    >
      {/* Gradient fade above the banner — same trick Cricbuzz uses */}
      <div
        className="absolute left-0 right-0 h-12 pointer-events-none"
        style={{
          bottom: '100%',
          background: 'linear-gradient(to top, rgba(4,8,20,0.45) 0%, transparent 100%)',
        }}
      />

      <div
        className="relative w-full pointer-events-auto"
        style={{
          background: 'var(--kj-panel)',
          borderTop: '1px solid var(--kj-line)',
          boxShadow: '0 -4px 24px -4px rgba(0,0,0,0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Label row */}
        <div className="flex items-center justify-between px-3 pt-1.5 pb-0.5">
          <span
            className="text-[9px] font-bold uppercase tracking-[1.2px]"
            style={{ color: 'var(--kj-text-faint)' }}
          >
            {language === 'bn' ? 'বিজ্ঞাপন' : 'Advertisement'}
          </span>
          <button
            onClick={dismiss}
            aria-label="Close ad"
            className="w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-kj-chip-bg active:scale-90"
            style={{ color: 'var(--kj-text-faint)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ad slot — push after mount so AdSense can fill it */}
        <div className="flex justify-center pb-2 px-2">
          <div className="w-full max-w-[728px]">
            <AdSlotInner />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingAdBanner;
