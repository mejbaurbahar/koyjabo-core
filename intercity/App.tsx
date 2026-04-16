import React, { useState, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { Search, ArrowRightLeft, AlertCircle, PlayCircle, WifiOff, Activity, Home, Train, Sparkles, Clock, Info, Sun, Moon, Menu, Navigation, Map, X, Bot, FileText, Settings, Shield, Download, Calendar, HelpCircle, BookOpen, LogIn, UserPlus, LogOut, User, Phone } from 'lucide-react';
import { AnimatedLogo } from './components/AnimatedLogo';
import ThemeToggle from './components/ThemeToggle';
import DistrictSelect from './components/DistrictSelect';
import ResultCard from './components/ResultCard';
import LoadingState from './components/LoadingState';
import LiveLocationMap from './components/LiveLocationMap';
import { POPULAR_ROUTES, DEMO_RESPONSE, DEMO_RESPONSE_BN } from './constants';
import { getOfflineIntercityData } from './offlineService';
import { RouteResponse, ErrorResponse } from './types';
import GlobalFooter from './components/GlobalFooter';

// Read auth session from localStorage (written by main app's AuthContext)
interface StoredUser { id: string; email: string; username: string; displayName: string; avatarUrl?: string; }
function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('koyjabo_auth_session');
    if (!raw) return null;
    const session = JSON.parse(raw) as { user: StoredUser; expiresAt: number };
    if (session.expiresAt && Date.now() > session.expiresAt) return null;
    return session.user ?? null;
  } catch {
    return null;
  }
}

function App() {
  const { t, language, setLanguage, formatNumber } = useLanguage();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  // Default to today's date for API, but removed from UI
  const [date] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteResponse | null>(null);

  // Auth state from localStorage
  const [authUser, setAuthUser] = useState<StoredUser | null>(() => getStoredUser());

  const [error, setError] = useState<string | null>(null);

  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLiveMap, setShowLiveMap] = useState(false);

  // New States for Offline and Usage
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // Removed usage limit as requested

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
      // Don't set error here - let demo section remain visible
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync auth state when localStorage changes (e.g. user logs in/out in main app tab)
  useEffect(() => {
    const handleStorage = () => setAuthUser(getStoredUser());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Handle URL parameters for redirection from main app
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('from');
    const toParam = params.get('to');

    if (fromParam && toParam) {
      setFrom(fromParam);
      setTo(toParam);

      // Only auto-search if user is signed in
      if (!getStoredUser()) return;

      setLoading(true);
      setTimeout(() => {
        try {
          const resultData = getOfflineIntercityData(fromParam, toParam, language as 'en' | 'bn');
          setResult(resultData);
        } catch (err) {
          // silently ignore
        } finally {
          setLoading(false);
        }
      }, 500);
    }
  }, []);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const setRoute = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
  };

  const handleDemoSearch = () => {
    // Demo should work offline too
    setLoading(true);
    setError(null);
    setResult(null);

    // Simulate network delay for realistic feel
    setTimeout(() => {
      const demoData = language === 'bn' ? DEMO_RESPONSE_BN : DEMO_RESPONSE;
      setFrom(demoData.from);
      setTo(demoData.to);
      setResult(demoData);
      setLoading(false);
    }, 1500);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser) {
      setError(language === 'bn' ? 'ফলাফল দেখতে প্রথমে সাইন ইন করুন।' : 'Please sign in to view search results.');
      return;
    }

    if (!from || !to) {
      setError(t('intercity.selectStartEnd'));
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Simulate a brief loading for UX
    setTimeout(() => {
      try {
        const resultData = getOfflineIntercityData(from, to, language as 'en' | 'bn');

        setResult(resultData);
        localStorage.setItem('intercity_last_result', JSON.stringify(resultData));
      } catch (err: any) {
        setError(t('intercity.loadFailed'));
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  // Dynamic SEO Titles
  useEffect(() => {
    let title = 'কই যাবো - Intercity Bus, Train & Flight Finder';
    let description = 'Search intercity buses, trains, and flights across Bangladesh. Compare fares and schedules for Dhaka, Chittagong, Sylhet & more.';

    if (result) {
      title = `${result.from} to ${result.to} Route | কই যাবো Intercity`;
      description = `Find the best ways to travel from ${result.from} to ${result.to}. Bus schedules, train times, and flight options with price comparisons.`;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [result]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 overflow-hidden transition-colors duration-300">

      {/* Offline Status Bar */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 py-1.5 px-4 animate-in slide-in-from-top duration-300">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>অফলাইন মোড — আন্তঃজেলা রুট সম্পূর্ণ উপলব্ধ</span>
          <span className="opacity-60 hidden sm:inline">| Offline — Intercity routes fully available</span>
        </div>
      )}

      {/* Fixed Header - Desktop */}
      <header className={`hidden md:flex fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-[100] px-8 items-center justify-between transition-all duration-300 h-20 ${isOnline ? '' : 'pt-7'}`}>
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
            {t('nav.home')}
          </a>
          <button
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm transform scale-100"
          >
            <Train size={16} className="animate-pulse" />
            {t('nav.intercity')}
          </button>
          <a
            href="/#ai-assistant"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#ai-assistant'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50"
          >
            <Sparkles size={16} />
            {t('nav.aiAssistant')}
          </a>

          <a
            href="/#blog"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#blog'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50"
          >
            <BookOpen size={16} />
            {t('nav.blog')}
          </a>
          <a
            href="/#about"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#about'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50"
          >
            <Info size={16} />
            {t('nav.about')}
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLiveMap(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-100/50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full font-bold text-sm transition-all animate-pulse"
          >
            <Map size={16} />
            <span>{t('busDetails.liveView')}</span>
          </button>
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="px-3 py-1.5 text-sm font-semibold rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition-colors"
            title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>
          {/* Auth buttons - desktop header */}
          {authUser ? (
            <button
              onClick={() => { window.location.href = '/#profile'; }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-sm transition-all border border-blue-200 dark:border-blue-700"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {authUser.avatarUrl
                  ? <img src={authUser.avatarUrl} alt={authUser.displayName} className="w-full h-full object-cover" />
                  : authUser.displayName.charAt(0).toUpperCase()
                }
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { window.location.href = '/#login'; }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold text-sm transition-colors"
              >
                <LogIn size={15} />
                {t('nav.login')}
              </button>
              <button
                onClick={() => { window.location.href = '/#signup'; }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                <UserPlus size={15} />
                {t('nav.signup')}
              </button>
            </div>
          )}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Fixed Header - Mobile */}
      <header className={`md:hidden fixed top-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-[100] px-4 flex items-center justify-between transition-all duration-300 h-16 ${isOnline ? 'pt-safe' : 'pt-7'}`}>
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
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="px-2.5 py-1 text-xs font-semibold rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition-colors"
            aria-label="Toggle language"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>
          <button
            onClick={() => setShowLiveMap(true)}
            className="p-2 hover:bg-blue-50 bg-white border-2 border-blue-100 rounded-full text-blue-600 transition-colors shadow-lg shadow-blue-100 active:scale-95 animate-pulse flex items-center justify-center" aria-label="Live Location">
            <Navigation className="w-4 h-4" />
          </button>
          {/* Auth button - mobile header */}
          {authUser ? (
            <button
              onClick={() => { window.location.href = '/#profile'; }}
              className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 border-2 border-blue-200 dark:border-blue-700"
              aria-label="Profile"
            >
              {authUser.avatarUrl
                ? <img src={authUser.avatarUrl} alt={authUser.displayName} className="w-full h-full object-cover" />
                : authUser.displayName.charAt(0).toUpperCase()
              }
            </button>
          ) : (
            <button
              onClick={() => { window.location.href = '/#login'; }}
              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 transition-colors flex items-center justify-center"
              aria-label="Sign in"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors flex items-center justify-center" aria-label="Open menu">
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* FIXED TOP SECTION (Title + Search) - Add padding for fixed header */}
      <div className="flex-none relative overflow-visible bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-50 shadow-sm transition-colors duration-300 mt-16 md:mt-20">

        {/* Push content below offline bar when offline (bar overlaps top of header, header paddingTop pushes its content clear) */}
        {!isOnline && <div className="h-7" />}

        {/* === BACKGROUND ANIMATION LAYER === */}
        <div className="absolute inset-0 z-0">
          {/* 1. The Image (Beautiful Bangladesh - River/Greenery) */}
          {/* INCREASED OPACITY: from 30/20 to 60/40 */}
          {/* Background image only when online — degrades to gradient offline */}
          {isOnline && (
            <div
              className="absolute inset-0 bg-cover bg-center animate-kenburns opacity-60 dark:opacity-40"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1596799468498-842247b98d34?q=80&w=2000&auto=format&fit=crop')"
              }}
            ></div>
          )}

          {/* 2. Gradient Overlay */}
          {/* REDUCED OPACITY at top: from-white/90 to from-white/40 */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white dark:from-slate-900/50 dark:via-slate-900/80 dark:to-slate-900"></div>

          {/* 3. Subtle Dot Pattern for AI/Tech feel */}
          <div className="absolute inset-0 opacity-10 dark:opacity-5 bg-[radial-gradient(#444cf7_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        {/* Removed Usage Badge */}

        {/* Container - Content sits relative above background */}
        <div className="py-2 md:py-8 px-4 relative z-10">

          <div className="text-center mb-3 md:mb-6 animate-fade-in">
            <h1 className="text-2xl md:text-5xl font-extrabold mb-2 tracking-tight drop-shadow-sm flex flex-col items-center gap-1.5">
              <span className="text-xs md:text-lg text-gray-400 dark:text-gray-500 font-bold tracking-[0.2em] uppercase">
                {t('intercity.exploreMini')}
              </span>
              <span className="text-3xl md:text-6xl text-slate-900 dark:text-white leading-tight">
                {language === 'bn' ? (
                  <>
                    <span className="text-dhaka-red">বাংলা</span>
                    <span className="text-dhaka-green">দেশ</span>
                    <span> ঘুরে দেখুন</span>
                  </>
                ) : (
                  <>
                    <span>Whole </span>
                    <span className="text-dhaka-red">Bangla</span>
                    <span className="text-dhaka-green">desh</span>
                  </>
                )}
              </span>
              <span className="text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold mt-1">
                {t('intercity.onYourRoute')}
              </span>
            </h1>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-slate-700 p-1.5 md:p-2 relative z-10 transition-colors duration-300">
            {/* Removed Offline Banner as requested */}

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-end gap-1.5 md:gap-2 relative">

              {/* FROM */}
              <div className="flex-1 min-w-[140px]">
                <DistrictSelect
                  label={t('intercity.from')}
                  name="from"
                  value={from}
                  onChange={setFrom}
                  placeholder={t('intercity.startLocationPlaceholder')}
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
                  label={t('intercity.to')}
                  name="to"
                  value={to}
                  onChange={setTo}
                  placeholder={t('intercity.destinationPlaceholder')}
                />
              </div>

              <div className="w-full md:w-auto mt-1 md:mt-0">
                <button
                  type="submit"
                  disabled={loading || !from || !to}
                  className={`
                     w-full h-14 md:h-[50px] px-8 md:px-10 font-black rounded-2xl transition-all flex items-center justify-center gap-3 transform active:scale-95 text-base md:text-base uppercase tracking-widest
                     ${loading || !from || !to
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_30px_-10px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 group'
                    }
                   `}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search size={22} className="transition-transform group-hover:scale-110" />
                      <span className="font-black">{t('intercity.search')}</span>
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-8">

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

            {!loading && result && authUser && (
              <ResultCard data={result} />
            )}

            {!loading && result && !authUser && (
              <div className="max-w-md mx-auto mt-8 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm text-center animate-fade-in">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'bn' ? 'সাইন ইন প্রয়োজন' : 'Sign in Required'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  {language === 'bn' ? 'রুটের ফলাফল দেখতে আপনার অ্যাকাউন্টে সাইন ইন করুন।' : 'Sign in to your account to view route results.'}
                </p>
                <a
                  href="/"
                  onClick={(e) => { e.preventDefault(); window.location.href = '/#login'; }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  {language === 'bn' ? 'সাইন ইন করুন' : 'Sign In'}
                </a>
              </div>
            )}

            {/* Empty State / Popular Routes */}
            {!loading && !result && !error && (
              <div className="mt-2 md:mt-12 animate-slide-up max-w-4xl mx-auto">
                <div className="mt-8 md:mt-12 bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 max-w-2xl mx-auto border border-gray-100 dark:border-slate-700 shadow-sm text-center md:text-left transition-colors duration-300">
                  <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-full text-blue-500 dark:text-blue-400 animate-pulse">
                    <PlayCircle size={32} />
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-2">{t('intercity.demoTitle')}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t('intercity.demoDesc')}</p>
                    <button
                      onClick={handleDemoSearch}
                      // disabled={!isOnline} // Demo works offline now
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-black rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      {t('intercity.viewDemo')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <GlobalFooter />
        </main>
      </div>
      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('common.menu')}</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full" aria-label="Close menu">
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto hidden-scrollbar">
              {/* Auth Section */}
              {authUser ? (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {authUser.avatarUrl
                        ? <img src={authUser.avatarUrl} alt={authUser.displayName} className="w-full h-full object-cover" />
                        : authUser.displayName.charAt(0).toUpperCase()
                      }
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { window.location.href = '/#profile'; setIsMenuOpen(false); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                    >
                      <User className="w-3.5 h-3.5" /> {t('nav.profile') || 'Profile'}
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('koyjabo_auth_session');
                        setAuthUser(null);
                        setResult(null);
                        setIsMenuOpen(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> {t('common.logout') || 'Logout'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => { window.location.href = '/#login'; setIsMenuOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> {t('nav.login')}
                  </button>
                  <button
                    onClick={() => { window.location.href = '/#signup'; setIsMenuOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> {t('nav.signup')}
                  </button>
                </div>
              )}

              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> {t('nav.home')}
              </button>
              <button
                onClick={() => window.location.href = '/#ai-assistant'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" /> {t('nav.aiAssistant')}
              </button>
              <button
                onClick={() => window.location.href = '/#about'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Info className="w-5 h-5 text-blue-500" /> {t('nav.about')}
              </button>
              <button
                onClick={() => window.location.href = '/#why-use'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" /> {t('home.whyUse')}
              </button>
              <button
                onClick={() => window.location.href = '/#faq'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> {t('nav.faq')}
              </button>
              <button
                onClick={() => window.location.href = '/#blog'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" /> {t('nav.blog')}
              </button>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('settings.language')}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setLanguage('bn'); setIsMenuOpen(false); }}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${language === 'bn' ? 'bg-red-600 text-white shadow-sm' : 'bg-white dark:bg-slate-700 text-gray-500 border border-gray-200 dark:border-slate-600'}`}
                    >বাং</button>
                    <button
                      onClick={() => { setLanguage('en'); setIsMenuOpen(false); }}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${language === 'en' ? 'bg-red-600 text-white shadow-sm' : 'bg-white dark:bg-slate-700 text-gray-500 border border-gray-200 dark:border-slate-600'}`}
                    >EN</button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/#install-app'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> {t('home.installApp')}
              </button>
              <button
                onClick={() => window.location.href = '/#privacy'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> {t('nav.privacy')}
              </button>
              <button
                onClick={() => window.location.href = '/#terms'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" /> {t('nav.terms')}
              </button>
              <button
                onClick={() => window.location.href = '/#contact'}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                <Phone className="w-5 h-5 text-red-600 dark:text-red-400" /> {t('nav.contact') || 'Contact Us'}
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-center text-gray-400">
                {t('common.appName')} {t('settings.version')} {formatNumber('1.0.0')}
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
            <span className="text-[10px] font-bold uppercase tracking-wide">{t('nav.home')}</span>
          </button>

          <button
            onClick={() => window.location.href = '/#ai-assistant'}
            className="flex flex-col items-center justify-center gap-1 border-t-2 transition-all border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Sparkles className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-wide">{t('nav.aiAssistant')}</span>
          </button>

          <button
            onClick={() => window.location.href = '/intercity/'}
            className="flex flex-col items-center justify-center gap-1 border-t-2 transition-all border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
          >
            <Train className="w-6 h-6 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900" />
            <span className="text-[10px] font-bold uppercase tracking-wide">{t('nav.intercity')}</span>
          </button>

          <button
            onClick={() => window.location.href = '/#about'}
            className="flex flex-col items-center justify-center gap-1 border-t-2 transition-all border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Info className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-wide">{t('nav.about')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
