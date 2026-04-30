import React from 'react';
import { ArrowLeft, Rocket, CheckCircle, Tool, Zap, Calendar, ChevronRight } from 'lucide-react';
import { RELEASE_NOTES } from '../data/releaseNotes';
import { useLanguage } from '../contexts/LanguageContext';

interface ReleaseNotesProps {
  onBack: () => void;
}

const ReleaseNotes: React.FC<ReleaseNotesProps> = ({ onBack }) => {
  const { language, t } = useLanguage();

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-safe px-4 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {language === 'bn' ? 'রিলিজ নোটস' : 'Release Notes'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'bn' ? 'কই যাবো অ্যাপের নতুন সব আপডেট' : 'Latest updates and improvements to KoyJabo'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-12">
          {RELEASE_NOTES.map((note, index) => (
            <div key={note.version} className="relative">
              {/* Vertical line connecting notes */}
              {index !== RELEASE_NOTES.length - 1 && (
                <div className="absolute left-[21px] top-12 bottom-[-48px] w-0.5 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              )}

              <div className="flex flex-col sm:flex-row gap-6">
                {/* Version Badge & Date */}
                <div className="shrink-0 flex sm:flex-col items-center sm:items-start gap-4 sm:w-32">
                  <div className={`
                    w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3
                    ${note.type === 'major' ? 'bg-teal-600 text-white' : 
                      note.type === 'minor' ? 'bg-cyan-600 text-white' : 
                      'bg-slate-600 text-white'}
                  `}>
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                      v{note.version}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                {/* Details Card */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                  {/* Features */}
                  {note.features.length > 0 && (
                    <div className="mb-8 last:mb-0">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                          <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">
                          {language === 'bn' ? 'নতুন কী আছে' : "What's New"}
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {(language === 'bn' ? note.bnFeatures : note.features).map((feat, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            <ChevronRight className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {note.improvements.length > 0 && (
                    <div className="mb-8 last:mb-0">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                          <Rocket className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">
                          {language === 'bn' ? 'উন্নতি' : 'Improvements'}
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {(language === 'bn' ? note.bnImprovements : note.improvements).map((imp, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fixes */}
                  {note.fixes.length > 0 && (
                    <div className="mb-0">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Tool className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">
                          {language === 'bn' ? 'ফিক্সড' : 'Fixed'}
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {(language === 'bn' ? note.bnFixes : note.fixes).map((fix, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                            <CheckCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            {fix}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-8 opacity-50">
          <p className="text-xs text-slate-500">
            © 2026 KoyJabo. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotes;
