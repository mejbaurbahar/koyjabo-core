import React, { useState, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { Search, ArrowRightLeft, AlertCircle, PlayCircle, WifiOff, Activity, Home, Train, Sparkles, Clock, Info, Sun, Moon, Menu, Navigation, Map, X, Bot, FileText, Settings, Shield, Download, Calendar, HelpCircle, LogIn, LogOut, User, Phone, Bus, Plane, ChevronRight } from 'lucide-react';
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
  const { t, language, formatNumber } = useLanguage();
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

  const [selectedMode, setSelectedMode] = useState<'bus' | 'train' | 'plane' | 'launch' | null>(null);

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

  // Disable right-click and devtools keyboard shortcuts
  useEffect(() => {
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['U', 'u'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeys);
    };
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
      setError(t('intercity.signInPrefixError'));
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
            <Bus size={16} className="animate-pulse" />
            {t('nav.intercity')}
          </button>
          <a
            href="/train"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#train'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50"
          >
            <Train size={16} />
            {t('nav.train')}
          </a>
          <a
            href="/#ai-assistant"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#ai-assistant'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50"
          >
            <Sparkles size={16} />
            {t('nav.aiAssistant')}
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
            <button
              onClick={() => { window.location.href = '/#login'; }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold text-sm transition-colors"
            >
              <LogIn size={15} />
              {t('nav.login')}
            </button>
          )}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Fixed Header - Mobile */}
      <header className={`md:hidden fixed top-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-[100] px-4 flex items-center justify-between transition-all duration-300 pb-3 ${isOnline ? 'pt-safe' : 'pt-7'}`}>
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

      {/* MAIN CONTENT: Desktop two-panel, Mobile single-column */}
      <div className="flex flex-1 min-h-0 md:pt-20" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)' }}>

        {/* ═══ LEFT PANEL: Search card + list ═══ */}
        <div className="w-full flex flex-col min-h-0 md:w-[380px] md:min-w-[340px] md:max-w-md md:border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
          {/* Offline bar spacer */}
          {!isOnline && <div className="h-7 shrink-0" />}

          {/* ── Search Card with gradient background ── */}
          <div className="flex-none px-3 pt-2 pb-2 md:px-4 md:pt-3 md:pb-2 relative z-50">
            <div className="relative group">
              {/* Gradient background layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F788F] via-[#219E91] to-[#11B084] rounded-2xl md:rounded-[2rem] shadow-xl shadow-[#0F788F]/30 overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
              </div>
              {/* Content layer */}
              <div className="relative z-10 text-white rounded-2xl md:rounded-[2rem] px-4 pt-4 pb-3 md:px-6 md:pt-5 md:pb-4">
                <div className="mb-3 md:mb-4">
                  <h2 className="text-lg md:text-2xl font-extrabold leading-tight drop-shadow-sm">
                    {language === 'bn' ? <><span className="text-yellow-300">বাংলা</span>দেশ ভ্রমণ</> : <>Bangladesh <span className="text-yellow-300">Travel</span></>}
                  </h2>
                  <p className="text-white/75 text-xs md:text-sm mt-0.5">{t('intercity.onYourRoute')}</p>
                </div>
                <form onSubmit={handleSearch} className="space-y-1.5">
                  <DistrictSelect label={t('intercity.from')} name="from" value={from} onChange={setFrom} placeholder={t('intercity.startLocationPlaceholder')} />
                  <div className="flex items-center gap-2 -my-2 relative z-20">
                    <div className="flex-1 h-px bg-white/25" />
                    <button type="button" onClick={handleSwap} className="bg-white/20 hover:bg-white/35 text-white p-1.5 rounded-full border border-white/30 transition-all transform hover:rotate-180 hover:scale-110 active:scale-95 backdrop-blur-sm shadow-sm shrink-0">
                      <ArrowRightLeft size={14} />
                    </button>
                    <div className="flex-1 h-px bg-white/25" />
                  </div>
                  <DistrictSelect label={t('intercity.to')} name="to" value={to} onChange={setTo} placeholder={t('intercity.destinationPlaceholder')} />
                  <button
                    type="submit"
                    disabled={loading || !from || !to}
                    className={`w-full h-11 px-6 font-black rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-95 text-sm uppercase tracking-wider ${loading || !from || !to ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5'}`}
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /> : <><Search size={16} /><span>{t('intercity.search')}</span></>}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ── Scrollable list area ── */}
          <div className="flex-1 overflow-y-auto px-3 pb-nav-safe md:pb-4 space-y-2 min-h-0">

            {/* Error (mobile only) */}
            {error && (
              <div className="md:hidden pt-2">
                <div className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-center gap-3 border-b border-red-100 dark:border-red-800/50">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                    <p className="font-bold text-red-600 dark:text-red-400 text-sm">{language === 'bn' ? 'ত্রুটি' : 'Error'}</p>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{error}</p>
                    {!authUser && (
                      <button
                        onClick={() => { window.location.href = '/#login'; }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#006a4e] to-emerald-600 text-white font-semibold rounded-xl text-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                      >
                        <LogIn size={14} />
                        {language === 'bn' ? 'সাইন ইন করুন' : 'Sign In'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Loading (mobile only) */}
            {loading && <div className="md:hidden pt-2"><LoadingState /></div>}

            {/* Result card — mobile only, desktop shows in right panel */}
            {!loading && result && <div className="md:hidden pt-2"><ResultCard data={result} /></div>}

            {/* Demo option — shown when not logged in and no result */}
            {!authUser && !loading && !result && (
              <div className="pt-2">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/50">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-xl text-blue-500 shrink-0"><PlayCircle size={24} /></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{t('intercity.demoTitle')}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 leading-relaxed">{t('intercity.demoDesc')}</p>
                      <button onClick={handleDemoSearch} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 uppercase tracking-wider">
                        {t('intercity.viewDemo')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transport mode list — shown when logged in */}
            {authUser && (
              <div className="pt-2 space-y-2">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 pt-1">
                  {language === 'bn' ? 'যাতায়াত মাধ্যম' : 'Travel Modes'}
                </h3>
                {([
                  { id: 'bus', icon: <Bus size={18} />, label: t('intercity.byBus'), desc: language === 'bn' ? 'আন্তঃজেলা বাস রুট ও শিডিউল' : 'Intercity bus routes & schedules', sel: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' },
                  { id: 'train', icon: <Train size={18} />, label: t('intercity.byTrain'), desc: language === 'bn' ? 'বাংলাদেশ রেলওয়ে ট্রেন শিডিউল' : 'Bangladesh Railway schedules', sel: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' },
                  { id: 'plane', icon: <Plane size={18} />, label: t('intercity.byAir'), desc: language === 'bn' ? 'অভ্যন্তরীণ ফ্লাইট তথ্য' : 'Domestic flight info', sel: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400' },
                  { id: 'launch', icon: <span className="text-base">🛥️</span>, label: language === 'bn' ? 'লঞ্চে' : 'By Launch', desc: language === 'bn' ? 'নদীপথে লঞ্চ সার্ভিস' : 'River launch services', sel: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400' },
                ] as const).map(mode => {
                  const isSelected = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(isSelected ? null : mode.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected ? mode.sel : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? mode.sel : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                        {mode.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{mode.label}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{mode.desc}</p>
                      </div>
                      <ChevronRight size={15} className={`shrink-0 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="pt-4"><GlobalFooter /></div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL (desktop only) ═══ */}
        <div className="hidden md:flex flex-1 flex-col relative overflow-hidden">
          {/* Bangladesh sky/landscape background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#4ca1af] via-[#a8edea] to-[#E0F6FF] dark:from-[#0f2027] dark:via-[#203a43] dark:to-[#2c5364] transition-colors duration-1000">
            <div className="absolute top-10 right-16 w-14 h-14 bg-yellow-300/80 dark:bg-yellow-200/20 rounded-full shadow-[0_0_40px_20px_rgba(253,224,71,0.25)]" />
            <div className="absolute top-6 left-1/4 w-36 h-10 bg-white/70 dark:bg-white/10 rounded-full blur-sm" />
            <div className="absolute top-14 left-1/3 w-28 h-8 bg-white/50 dark:bg-white/5 rounded-full blur-sm" />
            <div className="absolute top-20 right-1/4 w-20 h-7 bg-white/60 dark:bg-white/8 rounded-full blur-sm" />
            <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-emerald-600/25 via-emerald-400/10 to-transparent dark:from-emerald-900/20" />
            <div className="absolute bottom-[18%] left-[-10%] right-[-10%] h-14 bg-gradient-to-r from-blue-400/30 via-cyan-300/25 to-blue-400/30 dark:from-blue-900/20 blur-sm" style={{ borderRadius: '50%' }} />
          </div>

          {/* Right panel content overlay */}
          <div className="relative z-10 flex-1 overflow-y-auto">

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl"><LoadingState /></div>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="flex items-center justify-center h-full min-h-[400px] p-8">
                <div className="max-w-sm w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-red-100 dark:border-red-900/30 text-center">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-red-100 dark:ring-red-900/20">
                    <AlertCircle size={30} className="text-red-500" />
                  </div>
                  <h3 className="font-extrabold text-xl text-gray-900 dark:text-white mb-2">{language === 'bn' ? 'ত্রুটি' : 'Error'}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 leading-relaxed">{error}</p>
                  {!authUser && (
                    <button
                      onClick={() => { window.location.href = '/#login'; }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#006a4e] to-emerald-600 hover:from-[#005a3e] hover:to-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
                    >
                      <LogIn size={18} />
                      {language === 'bn' ? 'সাইন ইন করুন' : 'Sign In'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Search result */}
            {!loading && result && (
              <div className="p-6 max-w-5xl mx-auto"><ResultCard data={result} /></div>
            )}

            {/* Empty state: transport mode detail or welcome */}
            {!loading && !result && !error && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
                {selectedMode === 'bus' && authUser && (
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-lg w-full text-left">
                    <div className="text-4xl mb-4 text-center">🚌</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t('intercity.byBus')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5 text-center">{language === 'bn' ? 'বাংলাদেশের সকল জেলায় আন্তঃজেলা বাস সার্ভিস পাওয়া যায়। AC ও Non-AC উভয় পরিষেবা উপলব্ধ।' : 'Intercity bus services connect all districts of Bangladesh. Both AC and Non-AC services available.'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ l: language === 'bn' ? 'এসি বাস' : 'AC Bus', d: language === 'bn' ? 'আরামদায়ক, শীতাতপ' : 'Air conditioned comfort' }, { l: language === 'bn' ? 'নন-এসি বাস' : 'Non-AC Bus', d: language === 'bn' ? 'সাশ্রয়ী মূল্যে' : 'Budget friendly' }, { l: language === 'bn' ? 'চেয়ার কোচ' : 'Chair Coach', d: language === 'bn' ? 'নির্ধারিত আসন' : 'Reserved seating' }, { l: language === 'bn' ? 'স্লিপার কোচ' : 'Sleeper Coach', d: language === 'bn' ? 'রাতের দীর্ঘ যাত্রা' : 'Overnight journeys' }].map(i => (
                        <div key={i.l} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3"><p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{i.l}</p><p className="text-gray-500 dark:text-gray-400 text-xs">{i.d}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMode === 'train' && authUser && (
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-lg w-full text-left">
                    <div className="text-4xl mb-4 text-center">🚂</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t('intercity.byTrain')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5 text-center">{language === 'bn' ? 'বাংলাদেশ রেলওয়ে দেশের প্রধান শহরগুলি সংযুক্ত করে। ট্রেনে ভ্রমণ নিরাপদ ও সুবিধাজনক।' : 'Bangladesh Railway connects major cities. Train travel is safe and comfortable.'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ l: 'শোভন', d: language === 'bn' ? 'সাধারণ আসন' : 'Regular seats' }, { l: 'শোভন চেয়ার', d: language === 'bn' ? 'আরামদায়ক চেয়ার' : 'Comfortable chairs' }, { l: 'AC চেয়ার', d: language === 'bn' ? 'শীতাতপ নিয়ন্ত্রিত' : 'Air conditioned' }, { l: 'AC বার্থ', d: language === 'bn' ? 'রাতের ঘুমের যাত্রা' : 'Overnight sleeper' }].map(i => (
                        <div key={i.l} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3"><p className="font-bold text-blue-700 dark:text-blue-400 text-sm">{i.l}</p><p className="text-gray-500 dark:text-gray-400 text-xs">{i.d}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMode === 'plane' && authUser && (
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-lg w-full text-left">
                    <div className="text-4xl mb-4 text-center">✈️</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">{t('intercity.byAir')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5 text-center">{language === 'bn' ? 'বিমান বাংলাদেশ ও নভো এয়ার অভ্যন্তরীণ ফ্লাইট পরিষেবা প্রদান করে।' : 'Biman Bangladesh & Novo Air operate domestic flights.'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ l: 'ঢাকা–চট্টগ্রাম', d: '~45 min' }, { l: 'ঢাকা–সিলেট', d: '~40 min' }, { l: 'ঢাকা–কক্সবাজার', d: '~1 hr' }, { l: 'ঢাকা–যশোর', d: '~45 min' }].map(i => (
                        <div key={i.l} className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3"><p className="font-bold text-sky-700 dark:text-sky-400 text-sm">{i.l}</p><p className="text-gray-500 dark:text-gray-400 text-xs">{i.d}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMode === 'launch' && authUser && (
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-lg w-full text-left">
                    <div className="text-4xl mb-4 text-center">🛥️</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">{language === 'bn' ? 'লঞ্চে যাত্রা' : 'By Launch/Ferry'}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5 text-center">{language === 'bn' ? 'সদরঘাট থেকে বিভিন্ন রুটে লঞ্চ সার্ভিস পাওয়া যায়।' : 'Launch services depart from Sadarghat to various destinations.'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ l: 'ঢাকা–বরিশাল', d: '~8-10 hrs' }, { l: 'ঢাকা–পটুয়াখালী', d: '~10-12 hrs' }, { l: 'ঢাকা–ভোলা', d: '~8-9 hrs' }, { l: 'ঢাকা–ঝালকাঠি', d: '~9-10 hrs' }].map(i => (
                        <div key={i.l} className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3"><p className="font-bold text-teal-700 dark:text-teal-400 text-sm">{i.l}</p><p className="text-gray-500 dark:text-gray-400 text-xs">{i.d}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {(!selectedMode || !authUser) && (
                  <div className="bg-white/85 dark:bg-slate-800/85 backdrop-blur-sm rounded-3xl p-10 shadow-xl max-w-sm w-full flex items-center justify-center">
                    <div className="pointer-events-none select-none">
                      <AnimatedLogo size="large" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>{/* END MAIN CONTENT */}
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
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center border-t-2 transition-all border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Home className="w-6 h-6" />
          </button>

          <button
            onClick={() => window.location.href = '/intercity/'}
            className="flex items-center justify-center border-t-2 transition-all border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
          >
            <Bus className="w-6 h-6 fill-emerald-100 dark:fill-emerald-900" />
          </button>

          <button
            onClick={() => window.location.href = '/#train'}
            className="flex items-center justify-center border-t-2 transition-all border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Train className="w-6 h-6" />
          </button>

          <button
            onClick={() => window.location.href = '/#ai-assistant'}
            className="flex items-center justify-center border-t-2 transition-all border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Sparkles className="w-6 h-6" />
          </button>

          <button
            onClick={() => window.location.href = '/#about'}
            className="flex items-center justify-center border-t-2 transition-all border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
