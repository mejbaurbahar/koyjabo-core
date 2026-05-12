import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LoadingState: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 p-8 bg-kj-panel rounded-3xl shadow-lg border border-kj-line animate-pulse transition-colors">
      <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
      <div className="space-y-4">
        <div className="h-4 bg-kj-chip-bg/50 rounded w-full"></div>
        <div className="h-4 bg-kj-chip-bg/50 rounded w-5/6"></div>
        <div className="h-4 bg-kj-chip-bg/50 rounded w-4/6"></div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-kj-chip-bg/50 rounded-xl"></div>
        <div className="h-32 bg-kj-chip-bg/50 rounded-xl"></div>
        <div className="h-32 bg-kj-chip-bg/50 rounded-xl"></div>
      </div>

      <div className="mt-8 flex justify-center items-center text-kj-text-faint text-sm gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span>{t('intercity.analyzingRoute')}</span>
      </div>
    </div>
  );
};

export default LoadingState;