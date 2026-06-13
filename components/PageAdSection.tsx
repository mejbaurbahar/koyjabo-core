import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SponsoredAdSlot from './SponsoredAdSlot';

/** Dedicated ad slot for non-home pages — one section per page view. */
const PageAdSection: React.FC = () => {
  const { language } = useLanguage();
  return (
    <div className="shrink-0 px-4 md:px-10 py-2 border-t border-kj-line/40 bg-kj-bg">
      <SponsoredAdSlot language={language} size="728x90" className="my-3 md:my-4" />
    </div>
  );
};

export default PageAdSection;
