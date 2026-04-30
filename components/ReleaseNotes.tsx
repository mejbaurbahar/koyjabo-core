import React, { useState } from 'react';
import { ArrowLeft, Rocket, CheckCircle, Wrench, Zap, Calendar, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import { RELEASE_NOTES } from '../data/releaseNotes';
import { useLanguage } from '../contexts/LanguageContext';

const ReleaseNotes: React.FC = () => {
  const { language, t } = useLanguage();
  const [expandedVersion, setExpandedVersion] = useState<string | null>(RELEASE_NOTES[0]?.version || null);

  const toggleVersion = (version: string) => {
    setExpandedVersion(expandedVersion === version ? null : version);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 overflow-hidden font-sans">
      {/* Premium Header */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-safe px-6 py-5 flex items-center gap-5 shadow-sm relative z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {t('releaseNotes.title')}
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t('releaseNotes.subtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          {RELEASE_NOTES.map((note, index) => {
            const isExpanded = expandedVersion === note.version;
            const isLatest = index === 0;

            return (
              <div 
                key={note.version} 
                className={`
                  group transition-all duration-300 rounded-[2rem] border overflow-hidden
                  ${isExpanded 
                    ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/50 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/10' 
                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/30'}
                `}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleVersion(note.version)}
                  className="w-full text-left px-6 py-6 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-5">
                    <div className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-6
                      ${note.type === 'major' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 
                        note.type === 'minor' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 
                        'bg-gradient-to-br from-slate-500 to-slate-700 text-white'}
                    `}>
                      {note.type === 'major' ? <Sparkles className="w-7 h-7" /> : <Rocket className="w-7 h-7" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-900 dark:text-white">v{note.version}</span>
                        {isLatest && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            Latest
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(note.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isExpanded ? 'bg-emerald-500 text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-500'}
                  `}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {/* Accordion Content */}
                <div className={`
                  transition-all duration-500 ease-in-out overflow-hidden
                  ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
                `}>
                  <div className="px-6 pb-8 space-y-8 border-t border-slate-50 dark:border-slate-800/50 pt-8">
                    {/* Features */}
                    {note.features.length > 0 && (
                      <div className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                        <div className="flex items-center gap-2.5 mb-5">
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h3 className="font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase text-xs">
                            {t('releaseNotes.whatsNew')}
                          </h3>
                        </div>
                        <ul className="space-y-4">
                          {(language === 'bn' ? note.bnFeatures : note.features).map((feat, i) => (
                            <li key={i} className="flex gap-4 text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed group/item">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              {feat}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {note.improvements.length > 0 && (
                      <div className="animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
                        <div className="flex items-center gap-2.5 mb-5">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                            <Rocket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase text-xs">
                            {t('releaseNotes.improvements')}
                          </h3>
                        </div>
                        <ul className="space-y-4">
                          {(language === 'bn' ? note.bnImprovements : note.improvements).map((imp, i) => (
                            <li key={i} className="flex gap-4 text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Fixes */}
                    {note.fixes.length > 0 && (
                      <div className="animate-in fade-in slide-in-from-top-4 duration-500 delay-300">
                        <div className="flex items-center gap-2.5 mb-5">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <Wrench className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <h3 className="font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase text-xs">
                            {t('releaseNotes.fixed')}
                          </h3>
                        </div>
                        <ul className="space-y-4">
                          {(language === 'bn' ? note.bnFixes : note.fixes).map((fix, i) => (
                            <li key={i} className="flex gap-4 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                              <CheckCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotes;
