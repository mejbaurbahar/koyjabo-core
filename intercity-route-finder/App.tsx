import React, { useState, useEffect } from 'react';
import { Search, ArrowRightLeft, AlertCircle, PlayCircle, WifiOff, Activity, Home, Train, Sparkles, Clock, Info, Sun, Moon, Menu, Navigation, Map, X, Bot, FileText, Settings, Shield } from 'lucide-react';
import { AnimatedLogo } from './components/AnimatedLogo';
import ThemeToggle from '../components/ThemeToggle';
import NotificationBell from '../components/NotificationBell';
import DistrictSelect from './components/DistrictSelect';
import ResultCard from './components/ResultCard';
import LoadingState from './components/LoadingState';
import LiveLocationMap from './components/LiveLocationMap';
import { API_ENDPOINT, POPULAR_ROUTES, DEMO_RESPONSE } from './constants';
import { RouteResponse, ErrorResponse } from './types';

function App() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  // Default to today's date for API, but removed from UI
  const [date] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLiveMap, setShowLiveMap] = useState(false);

  // New States for Offline and Usage
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [usageCount, setUsageCount] = useState(0);
  const DAILY_LIMIT = 2;

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to HTML element
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Handle Online/Offline Status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setError("আপনার ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে।");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Daily Usage Limit
  useEffect(() => {
    try {
      const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY format
      const saved = localStorage.getItem('intercity_usage');

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          setUsageCount(parsed.count);
        } else {
          // New day, reset
          const newUsage = { date: today, count: 0 };
          localStorage.setItem('intercity_usage', JSON.stringify(newUsage));
          setUsageCount(0);
        }
      } else {
        // Initialize
        const newUsage = { date: today, count: 0 };
        localStorage.setItem('intercity_usage', JSON.stringify(newUsage));
        setUsageCount(0);
      }
    } catch (e) {
      console.error("Failed to parse usage data", e);
    }
  }, []);

  const incrementUsage = () => {
    const today = new Date().toLocaleDateString('en-GB');
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('intercity_usage', JSON.stringify({ date: today, count: newCount }));
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const setRoute = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
  };

  const handleDemoSearch = () => {
    if (!isOnline) {
      setError("ডেমো দেখার জন্য ইন্টারনেট সংযোগ প্রয়োজন।");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    // Simulate network delay for realistic feel
    setTimeout(() => {
      setFrom(DEMO_RESPONSE.from);
      setTo(DEMO_RESPONSE.to);
      setResult(DEMO_RESPONSE);
      setLoading(false);
    }, 1500);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      setError("আপনি অফলাইনে আছেন। ইন্টারনেট সংযোগ পরীক্ষা করুন।");
      return;
    }

    if (!from || !to) {
      setError("অনুগ্রহ করে যাত্রা শুরু এবং গন্তব্যস্থল নির্বাচন করুন।");
      return;
    }

    // Check usage limit before calling API (Frontend Check)
    if (usageCount >= DAILY_LIMIT) {
      setError("আপনার আজকের দৈনিক সার্চ লিমিট (২/২) শেষ হয়েছে। অনুগ্রহ করে আগামীকাল চেষ্টা করুন।");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, date }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;

        if (response.status === 429) {
          // Backend limit reached
          throw new Error("দৈনিক সীমা অতিক্রান্ত হয়েছে। অনুগ্রহ করে অপেক্ষা করুন।");
        } else if (response.status === 503) {
          throw new Error("এআই সার্ভিস বর্তমানে ব্যস্ত। কিছুক্ষণ পর আবার চেষ্টা করুন।");
        } else {
          throw new Error(errorData.message || errorData.error || "অজানা ত্রুটি ঘটেছে।");
        }
      }

      setResult(data as RouteResponse);

      // Increment usage on success if it's not a cached response
      incrementUsage();

    } catch (err: any) {
      setError(err.message || "রুট তথ্য লোড করতে ব্যর্থ। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 overflow-hidden transition-colors duration-300">

      {/* Fixed Header - Desktop */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-[100] px-8 items-center justify-between transition-all duration-300">
        {/* Logo Section */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
          className="flex items-center gap-3 cursor-pointer group outline-none"
        >
          <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <AnimatedLogo size="small" />
          </div>
        </a>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50"
          >
            <Home size={16} />
            Home
          </a>
          <button
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm transform scale-100"
          >
            <Train size={16} className="animate-pulse" />
            Intercity
          </button>
          <a
            href="/#ai-assistant"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#ai-assistant'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50"
          >
            <Sparkles size={16} />
            AI Chat
          </a>
          <a
            href="/#history"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#history'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50"
          >
            <Clock size={16} />
            History
          </a>
          <a
            href="/#about"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#about'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50"
          >
            <Info size={16} />
            About
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLiveMap(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-100/50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full font-bold text-sm transition-all animate-pulse"
          >
            <Map size={16} />
            <span>Live Map</span>
          </button>
          <NotificationBell />
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Fixed Header - Mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-[100] px-4 flex items-center justify-between transition-all duration-300 pt-safe-top">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
          className="flex items-center gap-2 outline-none"
        >
          <AnimatedLogo size="small" />
        </a>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setShowLiveMap(true)}
            className="p-2 hover:bg-blue-50 bg-white border-2 border-blue-100 rounded-full text-blue-600 transition-colors shadow-lg shadow-blue-100 active:scale-95 animate-pulse flex items-center justify-center" aria-label="Live Location">
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center" aria-label="Open menu">
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* FIXED TOP SECTION (Title + Search) - Add padding for fixed header */}
      <div className="flex-none relative overflow-visible bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-50 shadow-sm transition-colors duration-300 mt-16 md:mt-20">

        {/* === BACKGROUND ANIMATION LAYER === */}
        <div className="absolute inset-0 z-0">
          {/* 1. The Image (Beautiful Bangladesh - River/Greenery) */}
          {/* INCREASED OPACITY: from 30/20 to 60/40 */}
          <div
            className="absolute inset-0 bg-cover bg-center animate-kenburns opacity-60 dark:opacity-40"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1596799468498-842247b98d34?q=80&w=2000&auto=format&fit=crop')"
            }}
          ></div>

          {/* 2. Gradient Overlay */}
          {/* REDUCED OPACITY at top: from-white/90 to from-white/40 */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white dark:from-slate-900/50 dark:via-slate-900/80 dark:to-slate-900"></div>

          {/* 3. Subtle Dot Pattern for AI/Tech feel */}
          <div className="absolute inset-0 opacity-10 dark:opacity-5 bg-[radial-gradient(#444cf7_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        {/* Top Right Usage Badge */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-50 flex items-center gap-2">
          <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 md:gap-1.5 border shadow-sm transition-all duration-300 backdrop-blur-md ${usageCount >= DAILY_LIMIT
            ? 'bg-red-50/90 text-red-600 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800'
            : 'bg-blue-50/90 text-blue-600 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800'
            }`}>
            <Activity size={14} />
            <span>সার্চ লিমিট: {usageCount}/{DAILY_LIMIT}</span>
          </div>
        </div>

        {/* Container - Content sits relative above background */}
        <div className="py-2 md:py-8 px-4 relative z-10">

          {/* Hero Title Section */}
          <div className="text-center mb-3 md:mb-6 animate-fade-in">
            <h1 className="text-2xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow-sm">
              <span className="text-dhaka-red">বাংলাদেশ</span>{' '}
              <span className="text-dhaka-green">ঘুরে দেখুন</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                আপনার পছন্দের রুটে
              </span>
            </h1>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-slate-700 p-1.5 md:p-2 relative z-10 transition-colors duration-300">
            {/* Offline Banner inside Search Box */}
            {!isOnline && (
              <div className="absolute -top-12 left-0 right-0 mx-auto w-max max-w-[90%] bg-red-500 text-white text-xs md:text-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2 justify-center animate-slide-up z-50">
                <WifiOff size={16} />
                <span className="font-semibold">আপনি অফলাইনে আছেন। ইন্টারনেট সংযোগ পরীক্ষা করুন।</span>
              </div>
            )}

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-end gap-1.5 md:gap-2 relative">

              {/* FROM */}
              <div className="flex-1 min-w-[140px]">
                <DistrictSelect
                  label="কোথা থেকে"
                  name="from"
                  value={from}
                  onChange={setFrom}
                  placeholder="শুরুর স্থান"
                />
              </div>

              {/* SWAP BUTTON - Absolutely positioned to center between inputs */}
              <div className="flex md:hidden items-center justify-center absolute left-1/2 -translate-x-1/2 top-[50%] -translate-y-1/2 z-30">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-slate-600 dark:hover:to-slate-500 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-3 rounded-full border-2 border-blue-200 dark:border-slate-600 ring-4 ring-white dark:ring-slate-800 transition-all transform hover:rotate-180 hover:scale-110 shadow-lg hover:shadow-xl active:scale-95"
                  title="অবস্থান পরিবর্তন করুন"
                >
                  <ArrowRightLeft size={18} />
                </button>
              </div>

              {/* SWAP BUTTON - Desktop version */}
              <div className="hidden md:flex items-center justify-center mb-2 relative z-20">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-slate-600 dark:hover:to-slate-500 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2.5 rounded-full border-2 border-blue-200 dark:border-slate-600 transition-all transform hover:rotate-180 hover:scale-110 shadow-md hover:shadow-lg active:scale-95"
                  title="অবস্থান পরিবর্তন করুন"
                >
                  <ArrowRightLeft size={20} />
                </button>
              </div>

              {/* TO */}
              <div className="flex-1 min-w-[140px]">
                <DistrictSelect
                  label="কোথায় যাবেন"
                  name="to"
                  value={to}
                  onChange={setTo}
                  placeholder="গন্তব্যের নাম"
                />
              </div>

              {/* SEARCH BUTTON */}
              <div className="w-full md:w-auto mt-1 md:mt-0">
                <button
                  type="submit"
                  disabled={loading || !isOnline || usageCount >= DAILY_LIMIT || !from || !to}
                  className={`
                    w-full h-10 md:h-[50px] px-6 md:px-8 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-95 text-sm md:text-base dark:shadow-blue-900/20
                    ${loading || !isOnline || usageCount >= DAILY_LIMIT || !from || !to
                      ? 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }
                  `}
                >
                  {loading ? (
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : !isOnline ? (
                    <>
                      <WifiOff size={16} className="md:w-[18px]" />
                      <span>অফলাইন</span>
                    </>
                  ) : usageCount >= DAILY_LIMIT ? (
                    <>
                      <Activity size={16} className="md:w-[18px]" />
                      <span>লিমিট শেষ</span>
                    </>
                  ) : (
                    <>
                      <Search size={16} className="md:w-[18px]" />
                      <span>খুঁজুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* SCROLLABLE BOTTOM SECTION (Results) */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 relative z-0">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">

          {/* Error Message */}
          {error && (
            <div className="max-w-3xl mx-auto mb-6 md:mb-8 animate-fade-in">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 md:px-6 py-3 md:py-4 rounded-2xl flex items-center gap-3 shadow-sm text-sm md:text-base">
                <AlertCircle size={20} className="flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Results Area */}
          <div className="max-w-7xl mx-auto min-h-[500px]">
            {loading && <LoadingState />}

            {!loading && result && (
              <ResultCard data={result} />
            )}

            {/* Empty State / Popular Routes */}
            {!loading && !result && !error && (
              <div className="mt-4 md:mt-12 animate-slide-up max-w-4xl mx-auto">
                <div className="mt-8 md:mt-12 bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 max-w-2xl mx-auto border border-gray-100 dark:border-slate-700 shadow-sm text-center md:text-left transition-colors duration-300">
                  <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-full text-blue-500 dark:text-blue-400 animate-pulse">
                    <PlayCircle size={32} />
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-2">কিভাবে কাজ করে দেখতে চান?</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">সার্চ না করেই রেজাল্ট কার্ডের ইন্টারফেস দেখতে ডেমো বাটনে ক্লিক করুন।</p>
                    <button
                      onClick={handleDemoSearch}
                      disabled={!isOnline}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ডেমো রেজাল্ট দেখুন
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full" aria-label="Close menu">
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto hidden-scrollbar">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Home
              </button>
              <button
                onClick={() => window.location.href = '/#ai-assistant'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" /> AI Assistant
              </button>
              <button
                onClick={() => window.location.href = '/#about'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Info className="w-5 h-5 text-blue-500" /> About
              </button>
              <button
                onClick={() => window.location.href = '/#history'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" /> History
              </button>
              <button
                onClick={() => window.location.href = '/#settings'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" /> Settings
              </button>
              <button
                onClick={() => window.location.href = '/#privacy'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Privacy Policy
              </button>
              <button
                onClick={() => window.location.href = '/#terms'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" /> Terms of Service
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-center text-gray-400">
                কই যাবো v1.0.0
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Location Map */}
      <LiveLocationMap
        isOpen={showLiveMap}
        onClose={() => setShowLiveMap(false)}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => window.location.href = '/'}
            className="flex flex-col items-center justify-center gap-1 border-t-2 transition-all border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Home className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Home</span>
          </button>

          <button
            onClick={() => window.location.href = '/#ai-assistant'}
            className="flex flex-col items-center justify-center gap-1 border-t-2 transition-all border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Sparkles className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-wide">AI Help</span>
          </button>

          <button
            className="flex flex-col items-center justify-center gap-1 border-t-2 transition-all border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
          >
            <Train className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Intercity</span>
          </button>

          <button
            onClick={() => window.location.href = '/#about'}
            className="flex flex-col items-center justify-center gap-1 border-t-2 transition-all border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Info className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-wide">About</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
