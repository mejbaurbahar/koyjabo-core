import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SponsoredAdSlot from './SponsoredAdSlot';

/**
 * App-level ad section rendered below page content in the outer scroll container.
 * Only used on pages WITHOUT their own SponsoredAdSlot (About, WhyUse, FAQ, Intercity, Install).
 * Hard max-height prevents any ad creative from overflowing and covering page content.
 */
const PageAdSection: React.FC = () => {
  const { language } = useLanguage();
  return (
    <div
      className="px-4 md:px-10 py-3"
      style={{ maxHeight: 160, overflow: 'hidden' }}
    >
      <SponsoredAdSlot language={language} size="728x90" compact className="my-0" />
    </div>
  );
};

export default PageAdSection;
