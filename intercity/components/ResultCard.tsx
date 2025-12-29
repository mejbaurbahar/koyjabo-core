import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RouteResponse } from '../types';
import {
  Zap, Bot, Calendar, Navigation, Clock, Banknote,
  ChevronRight, ArrowLeft, Info, Map as MapIcon,
  Share2, ExternalLink, AlertTriangle
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
    if (lower.includes('fare') || lower.includes('price') || lower.includes('ভাড়া') || lower.includes('tk') || lower.includes('৳')) return <Banknote size={12} className="text-emerald-500" />;
    return <Info size={12} className="text-slate-400" />;
  };

  const handleCopy = () => {
    const text = `Route: ${data.from} to ${data.to}\n\n${data.result}`;
    navigator.clipboard.writeText(text);
    alert('Route details copied!');
  };

  if (!data.result) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-500">

      {/* 1. HEADER SECTION */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={12} /> {new Date(data.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${data.source === 'memory_cache' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300'
                }`}>
                {data.source === 'memory_cache' ? <Zap size={12} /> : <Bot size={12} />}
                {data.source === 'memory_cache' ? t('intercity.instant') : t('intercity.ai')}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-[900] text-slate-800 dark:text-white flex items-center gap-4 flex-wrap">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{data.from}</span>
              <Navigation className="text-blue-500 rotate-90 md:rotate-0" size={28} strokeWidth={3} />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{data.to}</span>
            </h2>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCopy} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* 2. MODE SELECTOR (TABS) */}
        {parsedData.modes.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-2">
            {parsedData.modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedModeId(mode.id)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 border-2
                  ${selectedModeId === mode.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] scale-105 z-10'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-200 dark:hover:border-blue-900 hover:scale-102'
                  }`}
              >
                <span className="text-2xl">{mode.icon}</span>
                <span className="text-sm whitespace-nowrap">{mode.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-slate-100 dark:border-slate-800">

        {/* Detail Panel */}
        <div className="lg:col-span-12 p-6 md:p-10 bg-white dark:bg-slate-900">
          {selectedMode ? (
            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* Summary Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl">
                    {selectedMode.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{selectedMode.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{t('intercity.suggestedModes')}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedMode.summary && selectedMode.summary.split('|').map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      {getSummaryIcon(s)}
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatNumber(s.trim())}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-8 space-y-8">
                  <div className="prose prose-slate dark:prose-invert max-w-none prose-table:rounded-xl prose-table:overflow-hidden prose-th:bg-slate-50 dark:prose-th:bg-slate-800 prose-td:border-slate-100 dark:prose-td:border-slate-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedMode.fullContent}</ReactMarkdown>
                  </div>
                </div>

                {/* Sidebar for this mode */}
                <div className="md:col-span-4 space-y-6">
                  {parsedData.intro && (
                    <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-900/20">
                      <h4 className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold mb-4 text-sm uppercase tracking-wider">
                        <Info size={16} /> Overview
                      </h4>
                      <div className="prose prose-sm dark:prose-invert">
                        <ReactMarkdown>{parsedData.intro}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {parsedData.footer && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700/50">
                      <h4 className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold mb-4 text-sm uppercase tracking-wider">
                        <ExternalLink size={16} /> Resources
                      </h4>
                      <div className="prose prose-sm dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsedData.footer}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.result}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* 4. MAP SECTION (INTERACTIVE) */}
      <div className="h-[400px] md:h-[500px] relative group">
        <MapComponent
          from={data.from}
          to={data.to}
          via={currentModeStops}
          modeTitle={selectedMode?.title || 'Route'}
        />

        {/* Floating Controls */}
        <div className="absolute top-6 right-6 z-[1000] space-y-3">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/30 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${selectedModeId ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              {selectedMode?.icon || <MapIcon size={24} />}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter mb-0.5">Active Route</p>
              <p className="text-sm font-black text-slate-800 dark:text-white">{selectedMode?.title || 'Map Overview'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;