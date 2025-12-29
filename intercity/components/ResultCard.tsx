import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RouteResponse } from '../types';
import { Zap, Bot, Calendar, Navigation, Clock, Banknote, ChevronRight, ArrowLeft } from 'lucide-react';
import { parseRouteMarkdown } from '../helpers';
import MapComponent from './MapComponent';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultCardProps {
  data: RouteResponse;
}

const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  const { t, formatNumber } = useLanguage();
  const parsedData = useMemo(() => parseRouteMarkdown(data.result || ''), [data.result]);
  const [selectedModeId, setSelectedModeId] = useState<number>(parsedData.modes.length > 0 ? 1 : 0);

  const selectedMode = useMemo(() => {
    return parsedData.modes.find(m => m.id === selectedModeId);
  }, [parsedData.modes, selectedModeId]);

  // Intelligent Stop detection with Geographic Filtering
  const currentModeStops = useMemo(() => {
    if (!selectedMode) return [];

    // List of known major transit points in Bangladesh with coordinates
    const potentialStops = [
      { name: "Teknaf", bnName: "টেকনাফ", lat: 20.8644, lng: 92.2985 },
      { name: "Cox's Bazar", bnName: "কক্সবাজার", lat: 21.4272, lng: 92.0058 },
      { name: "Chattogram", bnName: "চট্টগ্রাম", lat: 22.3569, lng: 91.7832 },
      { name: "Cumilla", bnName: "কুমিল্লা", lat: 23.4607, lng: 91.1809 },
      { name: "Brahmanbaria", bnName: "ব্রাহ্মণবাড়িয়া", lat: 23.9571, lng: 91.1119 },
      { name: "Bhairab", bnName: "ভৈরব", lat: 24.0514, lng: 90.9764 },
      { name: "Ashuganj", bnName: "আশুগঞ্জ", lat: 23.9897, lng: 91.0996 },
      { name: "Mawa", bnName: "মাওয়া", lat: 23.4425, lng: 90.2358 },
      { name: "Padma Bridge", bnName: "পদ্মা সেতু", lat: 23.4425, lng: 90.2358 },
      { name: "Barishal", bnName: "বরিশাল", lat: 22.7010, lng: 90.3535 },
      { name: "Khulna", bnName: "খুলনা", lat: 22.8456, lng: 89.5403 },
      { name: "Jashore", bnName: "যশোর", lat: 23.1634, lng: 89.2182 },
      { name: "Sylhet", bnName: "সিলেট", lat: 24.8949, lng: 91.8687 },
      { name: "Sreemangal", bnName: "শ্রীমঙ্গল", lat: 24.3113, lng: 91.7299 },
      { name: "Tangail", bnName: "টাঙ্গাইল", lat: 24.2513, lng: 89.9167 },
      { name: "Sirajganj", bnName: "সিরাজগঞ্জ", lat: 24.4533, lng: 89.7006 },
      { name: "Bogura", bnName: "বগুড়া", lat: 24.8465, lng: 89.3770 },
      { name: "Rangpur", bnName: "রংপুর", lat: 25.7439, lng: 89.2752 },
      { name: "Aricha", bnName: "আরিচা", lat: 23.7593, lng: 89.7858 },
      { name: "Paturia", bnName: "পাটুরিয়া", lat: 23.7842, lng: 89.8444 },
      { name: "Daulatdia", bnName: "দৌলতদিয়া", lat: 23.4350, lng: 89.8589 },
      { name: "Hatiya", bnName: "হাতিয়া", lat: 22.4439, lng: 91.1064 },
      { name: "Sandwip", bnName: "সন্দ্বীপ", lat: 22.4851, lng: 91.4416 },
      { name: "Bhola", bnName: "ভোলা", lat: 22.6859, lng: 90.6482 }
    ];

    // Find matches in the text
    const content = selectedMode.fullContent || '';
    const fromVal = data.from || '';
    const toVal = data.to || '';

    const matchedStops = potentialStops.filter(stop =>
      (content.includes(stop.name) || content.includes(stop.bnName)) &&
      !fromVal.includes(stop.name) && !fromVal.includes(stop.bnName) &&
      !toVal.includes(stop.name) && !toVal.includes(stop.bnName)
    );

    // Get FROM and TO coordinates from the same list
    const fromStop = potentialStops.find(s => fromVal.includes(s.name) || fromVal.includes(s.bnName));
    const toStop = potentialStops.find(s => toVal.includes(s.name) || toVal.includes(s.bnName));

    // If we have coordinates for both endpoints, filter waypoints geographically
    // This requires a mock 'map' or coordinate logic. Since we don't have L here, 
    // we use a simple distance logic
    if (fromStop && toStop && matchedStops.length > 0) {
      const filteredStops = matchedStops.filter(waypoint => {
        const dLat_FT = toStop.lat - fromStop.lat;
        const dLng_FT = toStop.lng - fromStop.lng;
        const totalDist_FT = Math.sqrt(dLat_FT * dLat_FT + dLng_FT * dLng_FT);

        const dLat_FW = waypoint.lat - fromStop.lat;
        const dLng_FW = waypoint.lng - fromStop.lng;

        const dotProduct = (dLat_FT * dLat_FW + dLng_FT * dLng_FW);
        const projection = dotProduct / (totalDist_FT * totalDist_FT);

        if (projection <= 0 || projection >= 1.2) return false;

        const perpDist = Math.abs((dLng_FT * dLat_FW - dLat_FT * dLng_FW) / totalDist_FT);
        return perpDist < 1.0;
      });

      return Array.from(new Set(filteredStops.map(s => s.name)));
    }

    return Array.from(new Set(matchedStops.map(s => s.name)));
  }, [selectedMode, data.from, data.to]);

  const getSummaryIcon = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('time') || lowerText.includes('সময়') || lowerText.includes('h') || lowerText.includes('m') || lowerText.includes('ঘন্টা') || lowerText.includes('মিনিট')) {
      return <Clock size={12} className="text-blue-500 dark:text-blue-400" />;
    }
    if (lowerText.includes('price') || lowerText.includes('ভাড়া') || lowerText.includes('tk') || lowerText.includes('টাকা') || lowerText.includes('৳')) {
      return <Banknote size={12} className="text-green-500 dark:text-green-400" />;
    }
    return null;
  };

  const handleCopy = () => {
    const text = `${data.from} to ${data.to}\nDate: ${data.date}\n\n${data.result}`;
    navigator.clipboard.writeText(text);
    alert('Result copied to clipboard!');
  };


  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">

      {/* 1. Content Section */}
      {/* 1. Content Section */}
      <div className="p-6 md:p-8">
        {parsedData.modes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Info Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <Calendar size={14} />
                  <span>{new Date(data.date).toLocaleDateString('bn-BD', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <div className="flex items-center gap-1">
                    {data.source === 'memory_cache' ? <Zap size={12} className="text-yellow-500" /> : <Bot size={12} className="text-green-500" />}
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {data.source === 'memory_cache' ? t('intercity.instant') : t('intercity.ai')}
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 flex-wrap">
                  <span>{data.from}</span>
                  <Navigation className="text-blue-500 fill-blue-50 dark:fill-blue-900/20 rotate-90 md:rotate-0" size={24} />
                  <span>{data.to}</span>
                </h2>
              </div>

              {/* Mode Selection Chips */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('intercity.suggestedModes')}</p>
                <div className="flex flex-wrap gap-2">
                  {parsedData.modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedModeId(mode.id)}
                      className={`px-4 py-2.5 rounded-full border-2 transition-all flex items-center gap-2 text-sm font-bold
                        ${selectedModeId === mode.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 shadow-md transform scale-105'
                          : 'border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-blue-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }
                      `}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{mode.icon}</span>
                      <span>{mode.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 overflow-x-auto custom-scrollbar">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsedData.intro}</ReactMarkdown>
              </div>
            </div>

            {/* Right Content Panel (7 cols) */}
            <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-700 overflow-x-auto custom-scrollbar">
              {selectedMode ? (
                <div className="space-y-6 animate-fade-in">
                  {/* Mode Header with Summary Chips */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedMode.icon}</span>
                      <h3 className="text-xl font-bold dark:text-white">{selectedMode.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedMode.summary && selectedMode.summary.split('|').map((part, i) => (
                        <span key={i} className="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md transition-shadow">
                          {getSummaryIcon(part)}
                          {formatNumber(part.trim())}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Main Markdown Detail */}
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedMode.fullContent}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="opacity-70 prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.result}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SINGLE COLUMN FALLBACK - For non-structured AI responses */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 flex-wrap">
                <span>{data.from}</span>
                <Navigation className="text-blue-500 fill-blue-50 dark:fill-blue-900/20 rotate-90 md:rotate-0" size={24} />
                <span>{data.to}</span>
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={14} />
                <span>{new Date(data.date).toLocaleDateString('bn-BD', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 prose prose-sm md:prose-base dark:prose-invert max-w-none overflow-x-auto custom-scrollbar">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* 2. Map Section (Bottom) */}
      <div className="h-[350px] md:h-[450px] relative border-t border-gray-100 dark:border-slate-700">
        <MapComponent
          from={data.from}
          to={data.to}
          via={currentModeStops}
          modeTitle={selectedMode?.title || 'Route Map'}
        />

        {/* Map Label Overlay */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-white/50 dark:border-slate-700/50">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">{t('intercity.routeMap')}</p>
            <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedMode?.title || 'Overview'}</p>
          </div>

          <button
            onClick={handleCopy}
            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-white/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors"
            title="Copy Results"
          >
            <Zap size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;