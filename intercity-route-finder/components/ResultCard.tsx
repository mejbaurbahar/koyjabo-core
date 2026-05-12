import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { RouteResponse } from '../types';
import { Zap, Bot, Calendar, Navigation, ChevronRight, ArrowLeft, Users, Clock, Banknote, MapPin, Anchor, Plane, Train, Info } from 'lucide-react';
import { parseRouteMarkdown } from '../helpers';
import MapComponent from './MapComponent';

interface ResultCardProps {
  data: RouteResponse;
}

// Helper to extract structure from text
const extractSmartDetails = (text: string) => {
  const lines = text.split('\n');
  const details: { key: string; value: string; icon: any }[] = [];
  let description = '';

  const KEY_PATTERNS = [
    { regex: /^(Operators|Bus Operators|Airlines|Ships|Trains|Train Name|Services):\s*(.*)/i, icon: Users },
    { regex: /^(Terminals|Stations|Departing from|Arrival at):\s*(.*)/i, icon: MapPin },
    { regex: /^(Ships|Ferry|Launch):\s*(.*)/i, icon: Anchor },
    { regex: /^(Airlines|Flight):\s*(.*)/i, icon: Plane },
    { regex: /^(Train):\s*(.*)/i, icon: Train },
    { regex: /^(Notes|Note|Tips):\s*(.*)/i, icon: Info },
  ];

  // Also catch bold keys like "**Operators:**"
  const BOLD_KEY_REGEX = /^\*\*([^*]+)\*\*[:]?\s*(.*)/;

  lines.forEach(line => {
    let trimmed = line.trim();
    if (!trimmed) return;

    // CLEANUP: Remove markdown bold markers globally from the line for processing
    const cleanLine = trimmed.replace(/\*\*/g, '');

    // CHECK: Is this a header/title line? (contains Time/Price info usually found in summary)
    // If so, skip it to avoid duplication in the description body.
    // Matches "By Bus..." or lines starting with emojis
    if ((cleanLine.startsWith('By ') || cleanLine.match(/^[\p{Emoji}]/u)) && (cleanLine.includes('Time:') || cleanLine.includes('Price:'))) {
      return;
    }

    let matched = false;

    // 1. Try Specific Patterns
    for (const pattern of KEY_PATTERNS) {
      const match = trimmed.match(pattern.regex);
      if (match) {
        details.push({
          key: match[1].replace(':', '').replace(/\*\*/g, '').trim(),
          value: match[2].replace(/\*\*/g, '').trim(),
          icon: pattern.icon
        });
        matched = true;
        break;
      }
    }

    // 2. Try Generic Bold Keys if not matched
    if (!matched) {
      const boldMatch = trimmed.match(BOLD_KEY_REGEX);
      if (boldMatch) {
        const key = boldMatch[1].trim();
        // Ignore the Title line "By Bus" etc.
        if (!key.toLowerCase().startsWith('by ')) {
          details.push({
            key: key.replace(':', '').replace(/\*\*/g, ''),
            value: boldMatch[2].replace(/\*\*/g, '').trim(),
            icon: Info
          });
          matched = true;
        }
      }
    }

    // 3. Description (if not a key-value and not a title)
    if (!matched) {
      // Double check it's not a title line
      if (!cleanLine.startsWith('By ') && !cleanLine.startsWith('Route:')) {
        // Append cleaned text
        description += cleanLine + ' ';
      }
    }
  });

  return { description, details };
};

const SmartDetailView: React.FC<{ content: string, summary: string }> = ({ content, summary }) => {
  const { description, details } = useMemo(() => extractSmartDetails(content), [content]);

  // Extract time and price from summary string "Time: X | Price: Y"
  const timeMatch = summary.match(/Time:\s*([^|]+)/i);
  const priceMatch = summary.match(/Price:\s*([^|]+)/i);
  const time = timeMatch ? timeMatch[1].trim() : '';
  const price = priceMatch ? priceMatch[1].trim() : '';

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Card */}
      <div className="grid grid-cols-2 gap-3">
        {time && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-3 rounded-2xl flex flex-col justify-center items-center text-center">
            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full mb-1 text-blue-600 dark:text-blue-300">
              <Clock size={18} />
            </div>
            <span className="text-xs text-blue-500 dark:text-blue-400 font-medium uppercase tracking-wider">আনুমানিক সময়</span>
            <span className="font-bold text-kj-text dark:text-white text-sm md:text-base">{time.replace(/\*\*/g, '')}</span>
          </div>
        )}
        {price && (
          <div className="bg-kj-primary-soft dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 p-3 rounded-2xl flex flex-col justify-center items-center text-center">
            <div className="bg-kj-primary-soft dark:bg-emerald-800 p-2 rounded-full mb-1 text-kj-primary dark:text-emerald-300">
              <Banknote size={18} />
            </div>
            <span className="text-xs text-kj-primary font-medium uppercase tracking-wider">আনুমানিক ভাড়া</span>
            <span className="font-bold text-kj-text dark:text-white text-sm md:text-base">{price.replace(/\*\*/g, '')}</span>
          </div>
        )}
      </div>

      {/* 2. Description Text */}
      {description && (
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
          <p className="text-kj-text-dim leading-relaxed text-sm md:text-[15px]">
            {description}
          </p>
        </div>
      )}

      {/* 3. Smart Details Grid */}
      {details.length > 0 && (
        <div className="space-y-3">
          {details.map((item, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-kj-chip-bg/80 border border-kj-line p-3.5 rounded-xl flex gap-3.5 items-start transition-colors hover:border-blue-200 dark:hover:border-blue-700/50">
              <div className="mt-0.5 bg-white dark:bg-slate-700 p-1.5 rounded-lg shadow-sm text-kj-text-dim shrink-0">
                <item.icon size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-kj-text-dim uppercase tracking-wide mb-0.5">
                  {item.key}
                </h5>
                <p className="text-sm font-medium text-kj-text dark:text-gray-100 leading-snug">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  const parsedData = useMemo(() => parseRouteMarkdown(data.result), [data.result]);
  const [selectedModeId, setSelectedModeId] = useState<number>(parsedData.modes.length > 0 ? 1 : 0);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const selectedMode = useMemo(() => {
    return parsedData.modes.find(m => m.id === selectedModeId);
  }, [parsedData.modes, selectedModeId]);

  // Intelligent Stop detection with Geographic Filtering
  const currentModeStops = useMemo(() => {
    if (!selectedMode) return [];

    // List of known major transit points in Bangladesh with coordinates
    const potentialStops = [
      { name: "Teknaf", lat: 20.8644, lng: 92.2985 },
      { name: "Cox's Bazar", lat: 21.4272, lng: 92.0058 },
      { name: "Chattogram", lat: 22.3569, lng: 91.7832 },
      { name: "Cumilla", lat: 23.4607, lng: 91.1809 },
      { name: "Brahmanbaria", lat: 23.9571, lng: 91.1119 },
      { name: "Bhairab", lat: 24.0514, lng: 90.9764 },
      { name: "Ashuganj", lat: 23.9897, lng: 91.0996 },
      { name: "Mawa", lat: 23.4425, lng: 90.2358 },
      { name: "Padma Bridge", lat: 23.4425, lng: 90.2358 },
      { name: "Barishal", lat: 22.7010, lng: 90.3535 },
      { name: "Khulna", lat: 22.8456, lng: 89.5403 },
      { name: "Jashore", lat: 23.1634, lng: 89.2182 },
      { name: "Sylhet", lat: 24.8949, lng: 91.8687 },
      { name: "Sreemangal", lat: 24.3113, lng: 91.7299 },
      { name: "Tangail", lat: 24.2513, lng: 89.9167 },
      { name: "Sirajganj", lat: 24.4533, lng: 89.7006 },
      { name: "Bogura", lat: 24.8465, lng: 89.3770 },
      { name: "Rangpur", lat: 25.7439, lng: 89.2752 },
      { name: "Aricha", lat: 23.7593, lng: 89.7858 },
      { name: "Paturia", lat: 23.7842, lng: 89.8444 },
      { name: "Daulatdia", lat: 23.4350, lng: 89.8589 },
      { name: "Hatiya", lat: 22.4439, lng: 91.1064 },
      { name: "Sandwip", lat: 22.4851, lng: 91.4416 },
      { name: "Bhola", lat: 22.6859, lng: 90.6482 }
    ];

    // Find matches in the text
    const content = selectedMode.fullContent;
    const matchedStops = potentialStops.filter(stop =>
      content.includes(stop.name) &&
      !data.from.includes(stop.name) &&
      !data.to.includes(stop.name)
    );

    // Get FROM and TO coordinates from the same list
    const fromStop = potentialStops.find(s => data.from.includes(s.name));
    const toStop = potentialStops.find(s => data.to.includes(s.name));

    // If we have coordinates for both endpoints, filter waypoints geographically
    if (fromStop && toStop && matchedStops.length > 0) {
      // Calculate if a waypoint is "on the way" (within a reasonable cone)
      const filteredStops = matchedStops.filter(waypoint => {
        // Vector from FROM to TO
        const dLat_FT = toStop.lat - fromStop.lat;
        const dLng_FT = toStop.lng - fromStop.lng;
        const totalDist_FT = Math.sqrt(dLat_FT * dLat_FT + dLng_FT * dLng_FT);

        // Vector from FROM to WAYPOINT
        const dLat_FW = waypoint.lat - fromStop.lat;
        const dLng_FW = waypoint.lng - fromStop.lng;
        const dist_FW = Math.sqrt(dLat_FW * dLat_FW + dLng_FW * dLng_FW);

        // Dot product to check if waypoint is in the right direction
        const dotProduct = (dLat_FT * dLat_FW + dLng_FT * dLng_FW);
        const projection = dotProduct / (totalDist_FT * totalDist_FT);

        // Filter: waypoint should be:
        // 1. In the forward direction (projection > 0)
        // 2. Not beyond the destination (projection < 1.2)
        // 3. Not too far off the direct path (perpendicular distance check)
        if (projection <= 0 || projection >= 1.2) {
          return false; // Wrong direction or past destination
        }

        // Check perpendicular distance from the direct line
        const perpDist = Math.abs(
          (dLng_FT * dLat_FW - dLat_FT * dLng_FW) / totalDist_FT
        );

        // Allow waypoints within ~1 degree (~110km) perpendicular distance
        return perpDist < 1.0;
      });

      return Array.from(new Set(filteredStops.map(s => s.name)));
    }

    // Fallback: if no coordinates, just return unique matches
    return Array.from(new Set(matchedStops.map(s => s.name)));
  }, [selectedMode, data.from, data.to]);

  const handleModeClick = (id: number) => {
    setSelectedModeId(id);
    // On mobile, trigger the detail view "new page" experience
    setShowMobileDetail(true);
  };

  const handleBackToResults = () => {
    setShowMobileDetail(false);
  };

  return (
    <div className="bg-kj-panel rounded-3xl shadow-xl border border-kj-line overflow-hidden animate-slide-up flex flex-col h-auto min-h-[600px] lg:h-[850px] transition-colors duration-300">

      {/* 1. Header (Visible on Desktop, hidden on Mobile Detail View) */}
      {!showMobileDetail && (
        <div className="bg-kj-panel border-b border-kj-line p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-20 shadow-sm transition-colors">
          <div>
            <div className="flex items-center space-x-2 text-sm text-kj-text-dim mb-1">
              <Calendar size={14} />
              <span>{new Date(data.date).toLocaleDateString('bn-BD', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="text-kj-text-faint">|</span>
              <div className="flex items-center space-x-1">
                {data.source === 'memory_cache' ? <Zap size={12} className="text-yellow-500" /> : <Bot size={12} className="text-green-500" />}
                <span className="text-xs font-medium bg-kj-chip-bg px-2 py-0.5 rounded-full dark:text-kj-text-faint">
                  {data.source === 'memory_cache' ? 'ইনস্ট্যান্ট' : 'এআই'}
                </span>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-kj-text flex-wrap">
              <span>{data.from}</span>
              <Navigation className="text-blue-500 fill-blue-50 dark:fill-blue-900/30 rotate-90 md:rotate-0" size={20} />
              <span>{data.to}</span>
            </h2>
          </div>

          {/* Intro Summary Markdown */}
          <div className="text-xs md:text-sm text-kj-text-dim bg-kj-bg/50 p-2 md:p-3 rounded-lg border border-slate-100 dark:border-kj-line w-full md:max-w-md transition-colors">
            <ReactMarkdown
              components={{ p: ({ node, ...props }) => <p className="m-0 leading-relaxed" {...props} /> }}
            >
              {parsedData.intro.replace(`**Route: ${data.from} to ${data.to}**`, '').replace(/\*\*/g, '').trim()}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* 2. Main Content */}
      <div className="flex flex-row flex-1 overflow-hidden relative">

        {/* Left Column: List (Visible on Desktop. Hidden on Mobile if Detail Open) */}
        <div className={`w-full lg:w-4/12 overflow-y-auto border-r border-kj-line bg-gray-50/50 dark:bg-kj-panel/30 p-4 custom-scrollbar h-full ${showMobileDetail ? 'hidden lg:block' : 'block'} transition-colors`}>
          <h3 className="text-xs font-bold text-kj-text-faint uppercase tracking-wider mb-4 px-2 hidden lg:block">প্রস্তাবিত যাতায়াত মাধ্যম</h3>

          <div className="space-y-4 pb-20 lg:pb-0">
            {parsedData.modes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => handleModeClick(mode.id)}
                className={`
                  relative group cursor-pointer rounded-2xl p-4 md:p-5 border transition-all duration-300
                  ${selectedModeId === mode.id
                    ? 'bg-white dark:bg-slate-700 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'bg-kj-panel border-kj-line hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md'
                  }
                `}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl md:text-3xl">{mode.icon}</div>
                    <div>
                      <h4 className={`font-bold text-base md:text-lg leading-tight transition-colors ${selectedModeId === mode.id ? 'text-kj-text' : 'text-kj-text dark:text-gray-200'}`}>{mode.title.replace(/\*\*/g, '')}</h4>
                      <span className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md mt-1 inline-block">
                        অপশন {mode.id}
                      </span>
                    </div>
                  </div>
                  {/* Arrow indicating action on mobile, or state on desktop */}
                  <div className={`p-1 rounded-full animate-fade-in shrink-0 ${selectedModeId === mode.id ? 'bg-blue-600 text-white' : 'bg-kj-chip-bg text-kj-text-faint'}`}>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* Summary Info (Chips) */}
                <div className="text-xs md:text-sm text-kj-text-dim mb-2 font-medium flex flex-wrap gap-2">
                  {mode.summary.split('|').map((part, idx) => (
                    <span key={idx} className="bg-kj-chip-bg/50 px-2 py-1 rounded text-kj-text-dim border border-transparent dark:border-slate-600">
                      {part.trim().replace(/\*\*/g, '')}
                    </span>
                  ))}
                </div>

                {/* Desktop: Expandable Details */}
                <div className="hidden lg:block">
                  <div className={`overflow-hidden transition-all duration-500 ${selectedModeId === mode.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-50'}`}>
                    <div className="pt-4 border-t border-kj-line dark:border-slate-600 mt-4">
                      {/* USE THE NEW SMART VIEW HERE */}
                      <SmartDetailView content={mode.fullContent} summary={mode.summary} />
                    </div>
                  </div>
                </div>

                {/* Mobile Hint */}
                <div className="lg:hidden text-[10px] text-kj-text-faint mt-2 flex items-center gap-1">
                  <span>ম্যাপ এবং বিস্তারিত দেখতে ট্যাপ করুন</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Desktop Map (Always visible on LG) */}
        <div className="hidden lg:block lg:w-8/12 relative bg-slate-100 dark:bg-kj-panel shadow-inner">
          <div className="absolute inset-0">
            <MapComponent
              from={data.from}
              to={data.to}
              via={currentModeStops}
              modeTitle={selectedMode?.title || 'Route'}
            />
          </div>
          <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
            <div className="bg-white/90 dark:bg-kj-chip-bg/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 dark:border-kj-line/50 flex items-center justify-between pointer-events-auto">
              <div>
                <p className="text-[10px] font-bold text-kj-text-faint uppercase tracking-wider">রুট ম্যাপ</p>
                <p className="font-semibold text-kj-text dark:text-white">{selectedMode?.title.replace(/\*\*/g, '') || 'Overview'}</p>
              </div>
              {currentModeStops.length > 0 && (
                <div className="text-xs text-right">
                  <p className="text-kj-text-faint text-[10px]">ভায়া</p>
                  <p className="font-medium text-kj-text-dim">{currentModeStops.slice(0, 3).join(', ')}{currentModeStops.length > 3 ? '...' : ''}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE FULL PAGE OVERLAY ("New Page") */}
        {showMobileDetail && (
          <div className="fixed inset-0 z-[100] bg-kj-panel flex flex-col lg:hidden animate-slide-up transition-colors">
            {/* Mobile Header with Back Button */}
            <div className="flex-none p-4 border-b border-kj-line flex items-center gap-3 bg-kj-panel shadow-sm z-20">
              <button
                onClick={handleBackToResults}
                className="p-2 -ml-2 hover:bg-kj-chip-bg rounded-full transition-colors text-kj-text dark:text-white"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-kj-text truncate">{selectedMode?.title.replace(/\*\*/g, '')}</h3>
                <div className="text-xs text-kj-text-dim truncate">{selectedMode?.summary.replace(/\*\*/g, '')}</div>
              </div>
            </div>

            {/* Top Map Section (40% height) */}
            <div className="h-[40%] bg-slate-100 dark:bg-kj-panel relative shrink-0 shadow-inner border-b border-kj-line">
              <MapComponent
                from={data.from}
                to={data.to}
                via={currentModeStops}
                modeTitle={selectedMode?.title || 'Route'}
              />
              {/* Map Overlay Badge */}
              <div className="absolute bottom-2 right-2 z-[400]">
                <span className="bg-black/60 dark:bg-black/80 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                  {currentModeStops.length > 0 ? `ভায়া ${currentModeStops[0]}` : 'সরাসরি'}
                </span>
              </div>
            </div>

            {/* Bottom Details Section (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 bg-kj-panel">
              {/* USE THE NEW SMART VIEW HERE AS WELL */}
              {selectedMode && <SmartDetailView content={selectedMode.fullContent} summary={selectedMode.summary} />}

              <div className="h-10"></div> {/* Spacer */}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResultCard;