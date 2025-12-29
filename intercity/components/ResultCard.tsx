












import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RouteResponse } from '../types';
import {
  Zap, Bot, Calendar, Navigation, Clock, Banknote,
  ChevronRight, ArrowLeft, Info, Map as MapIcon,
  Share2, ExternalLink, AlertTriangle, Route, Locate, Compass
} from 'lucide-react';
import { parseRouteMarkdown } from '../helpers';
import MapComponent from './MapComponent';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultCardProps {
  data: RouteResponse;
}

const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  const { t, formatNumber } = useLanguage();
  const parsedData = useMemo(() => parseRouteMarkdown(data.result || ''), [data.result]);

  // State for selected mode
  const [selectedModeId, setSelectedModeId] = useState<number>(0);

  // Initialize selected mode when parsedData changes
  useEffect(() => {
    if (parsedData.modes.length > 0) {
      setSelectedModeId(parsedData.modes[0].id);
    }
  }, [parsedData]);

  const selectedMode = useMemo(() => {
    return parsedData.modes.find(m => m.id === selectedModeId);
  }, [parsedData.modes, selectedModeId]);

  // Intelligent Stop detection for the map
  const currentModeStops = useMemo(() => {
    if (!selectedMode) return [];

    // Major transit points dictionary
    const potentialStops = [
      { name: "Teknaf", bnName: "টেকনাফ", lat: 20.8644, lng: 92.2985 },
      { name: "Cox's Bazar", bnName: "কক্সবাজার", lat: 21.4272, lng: 92.0058 },
      { name: "Chattogram", bnName: "চট্টগ্রাম", lat: 22.3569, lng: 91.7832 },
      { name: "Cumilla", bnName: "কুমিল্লা", lat: 23.4607, lng: 91.1809 },
      { name: "Feni", bnName: "ফেনী", lat: 23.0159, lng: 91.3976 },
      { name: "Bhairab", bnName: "ভৈরব", lat: 24.0514, lng: 90.9764 },
      { name: "Mawa", bnName: "মাওয়া", lat: 23.4425, lng: 90.2358 },
      { name: "Tongi", bnName: "টঙ্গী", lat: 23.8973, lng: 90.4030 },
      { name: "Joydebpur", bnName: "জয়দেবপুর", lat: 24.0023, lng: 90.4264 },
      { name: "Tangail", bnName: "টাঙ্গাইল", lat: 24.2513, lng: 89.9167 },
      { name: "Sirajganj", bnName: "সিরাজগঞ্জ", lat: 24.4533, lng: 89.7006 },
      { name: "Bogura", bnName: "বগুড়া", lat: 24.8465, lng: 89.3770 },
      { name: "Rajshahi", bnName: "রাজশাহী", lat: 24.3636, lng: 88.6241 },
      { name: "Sylhet", bnName: "সিলেট", lat: 24.8949, lng: 91.8687 },
      { name: "Barishal", bnName: "বরিশাল", lat: 22.7010, lng: 90.3535 }
    ];

    const content = selectedMode.fullContent || '';
    const matched = potentialStops.filter(stop =>
      (content.includes(stop.name) || content.includes(stop.bnName)) &&
      !data.from.includes(stop.name) && !data.to.includes(stop.name)
    );

    return Array.from(new Set(matched.map(s => s.name)));
  }, [selectedMode, data.from, data.to]);

  const getSummaryIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('time') || lower.includes('সময়') || lower.includes('h') || lower.includes('m') || lower.includes('ঘণ্টা')) return <Clock size={12} className="text-blue-500" />;
    if (lower.includes('fare') || lower.includes('price') || lower.includes('ভাড়া') || lower.includes('tk') || lower.includes('৳') || lower.includes('bdt')) return <Banknote size={12} className="text-emerald-500" />;
    return <Info size={12} className="text-slate-400" />;
  };

  const handleCopy = () => {
    const text = `Route: ${data.from} to ${data.to}\n\n${data.result}`;
    navigator.clipboard.writeText(text);
    alert('Route details copied!');
  };

  if (!data.result) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-700">

      {/* 1. TOP HEADER - GLASS OVERLAY STYLE */}
      <div className="p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/20 dark:from-slate-900 dark:via-slate-800/80 dark:to-blue-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-600/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20">
                <Calendar size={14} strokeWidth={3} /> {new Date(data.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${data.source === 'memory_cache'
                ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/40 dark:border-amber-800/50 dark:text-amber-400'
                : 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-400'
                }`}>
                {data.source === 'memory_cache' ? <Zap size={14} fill="currentColor" /> : <Bot size={14} fill="currentColor" />}
                {data.source === 'memory_cache' ? 'Verified Result' : 'AI Generated'}
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter text-slate-900 dark:text-white flex items-center gap-6 flex-wrap">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{data.from}</span>
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center border-2 border-blue-200 dark:border-blue-800 shadow-inner group">
                <Navigation className="text-blue-600 dark:text-blue-400 rotate-90 md:rotate-0 transition-transform group-hover:scale-110" size={28} strokeWidth={3} />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{data.to}</span>
            </h2>
          </div>
        </div>

        {/* 2. MODE SELECTOR - PREMIUM CHIPS */}
        {parsedData.modes.length > 0 && (
          <div className="flex flex-wrap gap-4 relative z-10 px-1 py-1">
            {parsedData.modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedModeId(mode.id)}
                className={`flex items-center gap-4 px-8 py-5 rounded-[28px] font-black transition-all duration-500 border-2 group
                  ${selectedModeId === mode.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] translate-y-[-4px] scale-105'
                    : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-transparent text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:translate-y-[-2px]'
                  }`}
              >
                <div className={`text-3xl transition-transform duration-500 ${selectedModeId === mode.id ? 'scale-125' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                  {mode.icon}
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1">{t('common.mode')}</span>
                  <span className="text-sm md:text-base whitespace-nowrap">{mode.title}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. MAIN CONTENT - TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-slate-100 dark:border-slate-800">

        {/* Detail Panel (Left) */}
        <div className="lg:col-span-8 p-8 md:p-14 bg-white dark:bg-slate-900">
          {selectedMode ? (
            <div className="max-w-3xl space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">

              {/* Highlight Card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-700/50 shadow-inner mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-[28px] flex items-center justify-center text-4xl shadow-xl shadow-blue-500/20 text-white">
                    {selectedMode.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white leading-tight mb-1">{selectedMode.title}</h3>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                      <Route size={16} />
                      <span>{t('intercity.suggestedModes')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedMode.summary && selectedMode.summary.split('|').map((s, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-105">
                      {getSummaryIcon(s)}
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">{formatNumber(s.trim())}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Markdown Content */}
              <div className="prose prose-slate lg:prose-lg dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:tracking-tight prose-headings:mb-6
                prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
                prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-li:mb-3
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-table:rounded-3xl prose-table:overflow-hidden prose-table:mb-8
                prose-th:bg-slate-100/50 dark:prose-th:bg-slate-800/50 prose-th:p-4
                prose-td:p-4 prose-td:border-slate-100 dark:prose-td:border-slate-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedMode.fullContent}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="prose prose-slate lg:prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.result}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sidebar (Right) */}
        <div className="lg:col-span-4 bg-slate-50/50 dark:bg-slate-900/50 border-l border-slate-100 dark:border-slate-800 p-8 md:p-12 space-y-12">

          {parsedData.footer && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ExternalLink size={20} strokeWidth={2.5} />
                </div>
                <h4 className="font-black text-lg uppercase tracking-wider">Resources</h4>
              </div>
              <div className="p-8 bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm prose prose-sm dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsedData.footer}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Quick Stats Overlay - Visual Flair */}
          <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white shadow-2xl shadow-blue-500/20 overflow-hidden relative group">
            <Compass className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12 transition-transform group-hover:scale-110" />
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('intercity.journeyInsightTitle') || 'Journey Insight'}</p>
            <h5 className="text-xl font-black mb-2 leading-tight">{t('intercity.journeyInsightHeading') || 'Ready to start your adventure?'}</h5>
            <p className="text-sm text-blue-100 opacity-80">{t('intercity.journeyInsightDescription') || 'Book your tickets early to secure the best seats and prices.'}</p>
          </div>
        </div>
      </div>

      {/* 4. MAP SECTION - FULL WIDTH INTERACTIVE */}
      <div className="h-[500px] md:h-[650px] relative group border-t border-slate-100 dark:border-slate-800">
        <MapComponent
          from={data.from}
          to={data.to}
          via={currentModeStops}
          modeTitle={selectedMode?.title || 'Route'}
        />

        {/* Floating Map Label */}
        <div className="absolute top-10 right-10 z-[1000]">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-6 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white/20 dark:border-slate-700/30 flex items-center gap-5 transition-transform hover:scale-105 active:scale-95 cursor-default group/map">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-all duration-500 ${selectedModeId ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              {selectedMode?.icon || <Locate size={24} />}
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1 leading-none">Interactive Path</p>
              <h6 className="text-lg font-black text-slate-800 dark:text-white leading-none tracking-tight">{selectedMode?.title || 'Map Overview'}</h6>
            </div>
          </div>
        </div>

        {/* Floating Map Bottom Tip */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <div className="px-6 py-3 bg-slate-900/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-white/10 shadow-2xl">
            <Compass size={14} className="animate-spin-slow" />
            <span>Simulating real-time path logic</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;