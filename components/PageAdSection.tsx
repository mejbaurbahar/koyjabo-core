import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SponsoredAdSlot from './SponsoredAdSlot';

/** Dedicated ad slot for non-home content pages — scrolls with page content. */
const PageAdSection: React.FC = () => {
  const { language } = useLanguage();
  return (
    <div className="shrink-0 px-4 md:px-10 py-1 border-t border-kj-line/40 bg-kj-bg">
      <SponsoredAdSlot language={language} size="728x90" compact className="my-2 md:my-3" />
    </div>
  );
};

export default PageAdSection;
