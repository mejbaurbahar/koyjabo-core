import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AdSenseAd from './AdSenseAd';

interface FloatingAdBannerProps {
  bottomOffset?: number;
}

const DISMISSED_KEY = 'kj_float_ad_dismissed';
const FLOAT_AD_HEIGHT = 90; // px — hard cap so no ad can overflow

const FloatingAdBanner: React.FC<FloatingAdBannerProps> = ({ bottomOffset = 0 }) => {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!sessionStorage.getItem(DISMISSED_KEY)) {
        setVisible(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      }
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setEntered(false);
    setTimeout(() => setVisible(false), 400);
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setTimeout(() => sessionStorage.removeItem(DISMISSED_KEY), 5 * 60 * 1000);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed left-0 right-0 z-[150] flex items-end justify-center pointer-events-none
        transition-transform duration-500 ease-out ${entered ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ bottom: bottomOffset }}
    >
      {/* Gradient scrim above */}
      <div
        className="absolute left-0 right-0 h-10 pointer-events-none"
        style={{ bottom: '100%', background: 'linear-gradient(to top, rgba(4,8,20,0.5) 0%, transparent 100%)' }}
      />

      {/* Container — hard height so no ad can escape */}
      <div
        className="relative w-full pointer-events-auto"
        style={{
          background: 'var(--kj-panel)',
          borderTop: '1px solid var(--kj-line)',
          boxShadow: '0 -6px 28px -6px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          // Critical: hard ceiling so large AdSense creatives can't overflow
          maxHeight: FLOAT_AD_HEIGHT + 24,
          overflow: 'hidden',
        }}
      >
        {/* Top bar with label + dismiss */}
        <div className="flex items-center justify-between px-3 py-1" style={{ minHeight: 22 }}>
          <span className="text-[9px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--kj-text-faint)' }}>
            {language === 'bn' ? 'বিজ্ঞাপন' : 'Advertisement'}
          </span>
          <button
            onClick={dismiss}
            aria-label="Close advertisement"
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-kj-chip-bg active:scale-90 transition-all"
            style={{ color: 'var(--kj-text-faint)' }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Ad — constrained inside the container */}
        <div
          className="flex justify-center px-2 pb-1"
          style={{ height: FLOAT_AD_HEIGHT, maxHeight: FLOAT_AD_HEIGHT, overflow: 'hidden' }}
        >
          <div className="w-full max-w-[728px]" style={{ height: FLOAT_AD_HEIGHT, overflow: 'hidden' }}>
            <AdSenseAd
              adSlot="auto"
              adFormat="horizontal"
              responsive={true}
              style={{ height: FLOAT_AD_HEIGHT, maxHeight: FLOAT_AD_HEIGHT, overflow: 'hidden' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingAdBanner;
