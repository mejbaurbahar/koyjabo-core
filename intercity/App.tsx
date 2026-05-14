import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { Search, ArrowRightLeft, AlertCircle, PlayCircle, WifiOff, Activity, Home, Train, Sparkles, Clock, Info, Sun, Moon, Menu, Navigation, Map, X, Bot, FileText, Settings, Shield, Download, Calendar, HelpCircle, LogIn, LogOut, User, Phone, Bus, Plane, ChevronRight, AlertTriangle, Calculator, Ticket, BookOpen, UserPlus, MapPin, Star, Rocket } from 'lucide-react';
import { AnimatedLogo } from './components/AnimatedLogo';
import AdUnit from './components/AdUnit';
import DhakaAlive from './components/DhakaAlive';
import ThemeToggle from './components/ThemeToggle';
import DistrictSelect from './components/DistrictSelect';
import ResultCard from './components/ResultCard';
import LoadingState from './components/LoadingState';
import LiveLocationMap from './components/LiveLocationMap';
import { POPULAR_ROUTES, DEMO_RESPONSE, DEMO_RESPONSE_BN } from './constants';
import { getOfflineIntercityData } from './offlineService';
import { RouteResponse, ErrorResponse } from './types';

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

const PROXY = (import.meta.env.VITE_API_PROXY as string | undefined)
  || 'https://koyjabo-auth-proxy.mejbaur-bahar.workers.dev';

interface UserLocation {
  lat: number;
  lng: number;
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
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const buildIntercityUrl = useCallback((fromVal?: string, toVal?: string) => {
    if (!fromVal || !toVal) return '/intercity/';
    const params = new URLSearchParams();
    params.set('from', fromVal);
    params.set('to', toVal);
    return `/intercity/?${params.toString()}`;
  }, []);

  // Intercity saved routes
  const [savedRoutes, setSavedRoutes] = useState<{from: string; to: string}[]>(() => {
    try { return JSON.parse(localStorage.getItem('intercity_saved_routes') || '[]'); } catch { return []; }
  });
  const isRouteSaved = (f: string, t: string) => savedRoutes.some(r => r.from === f && r.to === t);
  const toggleSavedRoute = (f: string, t: string) => {
    setSavedRoutes(prev => {
      const exists = prev.some(r => r.from === f && r.to === t);
      const next = exists ? prev.filter(r => !(r.from === f && r.to === t)) : [...prev, {from: f, to: t}];
      localStorage.setItem('intercity_saved_routes', JSON.stringify(next));
      return next;
    });
  };

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

  // Record visit so global stats stay accurate when users land on /intercity/ directly
  useEffect(() => {
    const SESSION_KEY = 'dhaka_commute_session_init';
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, 'true');
    const visitorKey = 'dhaka_commute_visitor_id';
    let visitorId = localStorage.getItem(visitorKey);
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(visitorKey, visitorId);
    }
    fetch(`${PROXY}/gh`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        action: 'record-visit',
        email: '',
        passwordHash: '',
        userId: authUser?.id ?? '',
        data: JSON.stringify({ visitorId }),
      }),
    }).catch(() => {});
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

  // Track User Location
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.debug('Location access denied or unavailable', err),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  const applyRouteFromUrl = useCallback((pushHistory: boolean = false) => {
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('from');
    const toParam = params.get('to');

    if (fromParam && toParam) {
      setFrom(fromParam);
      setTo(toParam);

      if (pushHistory) {
        window.history.pushState({}, '', buildIntercityUrl(fromParam, toParam));
      }

      // Only auto-search if user is signed in
      if (!getStoredUser()) {
        setResult(null);
        return;
      }

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
    } else {
      setResult(null);
    }
  }, [buildIntercityUrl, language]);

  // Handle URL parameters for redirection / deep links
  useEffect(() => {
    applyRouteFromUrl(false);
  }, [applyRouteFromUrl, authUser]);

  // Browser back/forward should restore URL-driven state
  useEffect(() => {
    const handlePopState = () => applyRouteFromUrl(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [applyRouteFromUrl]);

  // Auto-scroll to top when result appears on mobile
  useEffect(() => {
    if (result && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [result]);

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
      window.history.pushState({}, '', buildIntercityUrl(demoData.from, demoData.to));
      setLoading(false);
    }, 1500);
  };

  // Write intercity search into the shared analytics localStorage key
  // (mirrors trackIntercitySearch in main app's analyticsService.ts)
  const trackSearchInHistory = (fromVal: string, toVal: string, transportType: string) => {
    try {
      const session = localStorage.getItem('koyjabo_auth_session');
      const userId = session ? (JSON.parse(session) as { user: { id: string } }).user?.id : null;
      const historyKey = userId ? `koyjabo_history_${userId}` : 'dhaka_commute_user_history';
      const today = new Date().toISOString().split('T')[0];
      const raw = localStorage.getItem(historyKey);
      const history = raw ? JSON.parse(raw) : {
        busSearches: [], routeSearches: [], intercitySearches: [], trainSearches: [],
        mostUsedBuses: {}, mostUsedRoutes: {}, mostUsedIntercity: {}, mostUsedTrains: {},
        todayBuses: [], todayRoutes: [], todayIntercity: [], todayTrains: [],
        lastResetDate: today
      };
      if (!history.intercitySearches) history.intercitySearches = [];
      if (!history.mostUsedIntercity) history.mostUsedIntercity = {};
      if (!history.todayIntercity) history.todayIntercity = [];
      const routeKey = `${fromVal}-${toVal}`;
      history.intercitySearches.push({ from: fromVal, to: toVal, transportType, timestamp: Date.now(), date: today });
      history.mostUsedIntercity[routeKey] = (history.mostUsedIntercity[routeKey] || 0) + 1;
      if (!history.todayIntercity.includes(routeKey)) history.todayIntercity.push(routeKey);
      if (history.intercitySearches.length > 100) history.intercitySearches = history.intercitySearches.slice(-100);
      localStorage.setItem(historyKey, JSON.stringify(history));

      // Push history to GitHub repo (fire-and-forget)
      if (userId) {
        const trimmed = {
          busSearches: (history.busSearches || []).slice(-50),
          routeSearches: (history.routeSearches || []).slice(-50),
          intercitySearches: history.intercitySearches.slice(-50),
          trainSearches: (history.trainSearches || []).slice(-50),
          mostUsedBuses: history.mostUsedBuses || {},
          mostUsedRoutes: history.mostUsedRoutes || {},
          mostUsedIntercity: history.mostUsedIntercity,
          mostUsedTrains: history.mostUsedTrains || {},
        };
        fetch(`${PROXY}/gh`, {
          method: 'POST',
          credentials: 'omit',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: crypto.randomUUID(),
            action: 'save-history',
            email: '',
            passwordHash: '',
            userId,
            data: JSON.stringify(trimmed),
          }),
        }).catch(() => {});
      }
    } catch {
      // best-effort
    }
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
        window.history.pushState({}, '', buildIntercityUrl(from, to));
        localStorage.setItem('intercity_last_result', JSON.stringify(resultData));
        trackSearchInHistory(from, to, 'combined');
      } catch (err: any) {
        setError(isOnline ? t('intercity.loadFailed') : t('intercity.offlineCheck'));
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
    <div className="h-screen flex flex-col bg-kj-bg text-kj-text overflow-hidden transition-colors duration-300">

      {/* Offline Status Bar */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 py-1.5 px-4 animate-in slide-in-from-top duration-300">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>{language === 'bn' ? 'অফলাইন মোড — আন্তঃজেলা রুট সম্পূর্ণ উপলব্ধ' : 'Offline — Intercity routes fully available'}</span>
        </div>
      )}

      {/* Fixed Header - Desktop */}
      <header className={`hidden md:flex fixed top-0 left-0 right-0 bg-kj-panel/90 backdrop-blur-md border-b border-kj-line z-[100] px-8 items-center justify-between transition-all duration-300 h-20 ${isOnline ? '' : 'pt-7'}`}>
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
        <div className="flex items-center gap-2 bg-kj-chip-bg/60 p-1.5 rounded-2xl border border-kj-line">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-kj-text-dim hover:text-kj-text hover:bg-kj-chip-bg/50"
          >

            <Home size={16} />
            {t('nav.home')}
          </a>
          <button
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 bg-kj-chip-bg text-kj-primary shadow-sm transform scale-100"
          >
            <Bus size={16} className="animate-pulse" />
            {t('nav.intercity')}
          </button>
          <a
            href="/train"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#train'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-kj-text-dim hover:text-kj-text hover:bg-kj-chip-bg/50"
          >
            <Train size={16} />
            {t('nav.train')}
          </a>
          <a
            href="/#ai-assistant"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#ai-assistant'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-kj-text-dim hover:text-kj-text hover:bg-kj-chip-bg/50"
          >
            <Sparkles size={16} />
            {t('nav.aiAssistant')}
          </a>
          <a
            href="/#release-notes"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#release-notes'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-kj-primary hover:bg-kj-primary-soft/50 dark:hover:bg-emerald-900/20"
          >
            <Rocket size={16} />
            {t('nav.releaseNotes')}
          </a>
          <a
            href="/#about"
            onClick={(e) => { e.preventDefault(); window.location.href = '/#about'; }}
            className="relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 text-kj-text-dim hover:text-kj-text hover:bg-kj-chip-bg/50"
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
              className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 border-2 border-blue-200 dark:border-blue-700 hover:ring-2 hover:ring-blue-400 transition"
              title={authUser.displayName}
              aria-label="Profile"
            >
              {authUser.avatarUrl
                ? <img src={authUser.avatarUrl} alt={authUser.displayName} className="w-full h-full object-cover" />
                : authUser.displayName.charAt(0).toUpperCase()
              }</button>
          ) : (
            <button
              onClick={() => { window.location.href = '/#login'; }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-kj-line hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-semibold text-sm transition-colors"
            >
              <LogIn size={15} />
              {t('nav.login')}
            </button>
          )}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg rounded-full transition-colors text-kj-text-dim">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Fixed Header - Mobile */}
      <header className={`md:hidden fixed top-0 left-0 right-0 bg-kj-panel/90 backdrop-blur-md border-b border-kj-line z-[100] px-4 flex items-center justify-between transition-all duration-300 pb-3 ${isOnline ? 'pt-safe' : 'pt-7'}`}>
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
            className="p-2 hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg rounded-full text-kj-text-dim transition-colors flex items-center justify-center" aria-label="Open menu">
            <Menu className="w-5 h-5 text-kj-text-dim" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT: Desktop two-panel, Mobile single-column */}
      <div className="flex flex-1 min-h-0 md:pt-20" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)' }}>

        {/* ═══ LEFT PANEL: Search card + list ═══ */}
        <div className="w-full flex flex-col min-h-0 md:w-[380px] md:min-w-[340px] md:max-w-md md:border-r border-kj-line bg-kj-panel">
          {/* Offline bar spacer */}
          {!isOnline && <div className="h-7 shrink-0" />}

          {/* ── Search Card with gradient background ── */}
          <div className="flex-none px-2 pt-1.5 pb-1.5 md:px-4 md:pt-3 md:pb-2 relative z-50">
            <div className="relative group">
              {/* Gradient background layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F788F] via-[#219E91] to-[#11B084] dark:from-[#10181c] dark:via-[#16222a] dark:to-[#10181c] rounded-xl md:rounded-[2rem] shadow-lg shadow-[#0F788F]/20 dark:shadow-none overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              </div>
              {/* Content layer */}
              <div className="relative z-10 text-white rounded-xl md:rounded-[2rem] px-3 pt-2.5 pb-2 md:px-6 md:pt-5 md:pb-4">
                <div className="mb-1.5 md:mb-4">
                  <h2 className="text-xl md:text-2xl font-extrabold leading-tight drop-shadow-sm">
                    {language === 'bn' ? <><span className="text-yellow-300">বাংলা</span>দেশ ভ্রমণ</> : <>Bangladesh <span className="text-yellow-300">Travel</span></>}
                  </h2>
                  <p className="text-white/75 text-xs md:text-sm mt-0">{t('intercity.onYourRoute')}</p>
                </div>
                <form onSubmit={handleSearch} className="space-y-1">
                  <DistrictSelect label={t('intercity.from')} name="from" value={from} onChange={setFrom} placeholder={t('intercity.startLocationPlaceholder')} />
                  <div className="flex items-center gap-2 -my-1 relative z-20">
                    <div className="flex-1 h-px bg-white/25" />
                    <button type="button" onClick={handleSwap} className="bg-white/20 hover:bg-white/35 text-white p-1 md:p-1.5 rounded-full border border-white/30 transition-all transform hover:rotate-180 hover:scale-110 active:scale-95 backdrop-blur-sm shadow-sm shrink-0">
                      <ArrowRightLeft size={12} />
                    </button>
                    <div className="flex-1 h-px bg-white/25" />
                  </div>
                  <DistrictSelect label={t('intercity.to')} name="to" value={to} onChange={setTo} placeholder={t('intercity.destinationPlaceholder')} />
                  <button
                    type="submit"
                    disabled={loading || !from || !to}
                    className={`w-full h-9 md:h-11 px-6 font-black rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-95 text-sm uppercase tracking-wider ${loading || !from || !to ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5'}`}
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /> : <><Search size={16} /><span>{t('intercity.search')}</span></>}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ── Scrollable list area ── */}
          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-3 pb-20 md:pb-4 space-y-2 min-h-0">

            {/* Error (mobile only) */}
            {error && (
              <div className="md:hidden pt-2">
                <div className="bg-kj-panel border border-red-200 dark:border-red-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-center gap-3 border-b border-red-100 dark:border-red-800/50">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                    <p className="font-bold text-red-600 dark:text-red-400 text-sm">{language === 'bn' ? 'ত্রুটি' : 'Error'}</p>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    <p className="text-kj-text-dim text-sm">{error}</p>
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
            {!loading && result && (
              <div className="md:hidden pt-2 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-kj-text-dim">{result.from} → {result.to}</p>
                  <button
                    onClick={() => toggleSavedRoute(result.from, result.to)}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${isRouteSaved(result.from, result.to) ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-kj-chip-bg text-kj-text-dim hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
                  >
                    <Star className="w-3 h-3" fill={isRouteSaved(result.from, result.to) ? 'currentColor' : 'none'} />
                    {isRouteSaved(result.from, result.to) ? (language === 'bn' ? 'সেভ হয়েছে' : 'Saved') : (language === 'bn' ? 'সেভ করুন' : 'Save Route')}
                  </button>
                </div>
                <ResultCard data={result} />
                <AdUnit className="mt-3" />
              </div>
            )}

            {/* Demo option — shown when not logged in and no result */}
            {!authUser && !loading && !result && (
              <div className="pt-2">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/50">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-xl text-blue-500 shrink-0"><PlayCircle size={24} /></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-kj-text text-sm mb-1">{t('intercity.demoTitle')}</h4>
                      <p className="text-kj-text-dim text-xs mb-3 leading-relaxed">{t('intercity.demoDesc')}</p>
                      <button onClick={handleDemoSearch} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 uppercase tracking-wider">
                        {t('intercity.viewDemo')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <AdUnit className="my-2" />

            {/* Saved routes — shown when logged in and no result */}
            {authUser && !result && !loading && savedRoutes.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <h3 className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider px-1 pt-1 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {language === 'bn' ? 'সেভ করা রুট' : 'Saved Routes'}
                </h3>
                {savedRoutes.map((r, i) => (
                  <button key={i} onClick={() => { setFrom(r.from); setTo(r.to); }}
                    className="w-full flex items-center justify-between gap-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl px-3 py-2.5 text-left hover:border-yellow-400 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                      <span className="text-sm font-semibold text-kj-text truncate">{r.from}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-kj-text-faint shrink-0" />
                      <span className="text-sm font-semibold text-kj-text truncate">{r.to}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleSavedRoute(r.from, r.to); }}
                      className="p-1 text-kj-text-faint hover:text-red-400 transition-colors shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </button>
                ))}
              </div>
            )}

            {/* Transport mode list — shown when logged in and no result */}
            {authUser && !result && !loading && (
              <div className="pt-2 space-y-2">
                <h3 className="text-xs font-bold text-kj-text-dim uppercase tracking-wider px-1 pt-1">
                  {t('intercity.travelModes')}
                </h3>
                {([
                  {
                    id: 'bus' as const, icon: <Bus size={18} />, label: t('intercity.byBus'),
                    desc: t('intercity.busDesc'),
                    sel: 'bg-kj-primary-soft dark:bg-emerald-900/20 border-kj-primary/30 text-kj-primary',
                    details: [
                      { l: t('intercity.acBus'), d: t('intercity.acBusDesc'), color: 'bg-kj-primary-soft dark:bg-emerald-900/20 text-emerald-700 dark:text-kj-primary' },
                      { l: t('intercity.nonAcBus'), d: t('intercity.nonAcBusDesc'), color: 'bg-kj-primary-soft dark:bg-emerald-900/20 text-emerald-700 dark:text-kj-primary' },
                      { l: t('intercity.chairCoach'), d: t('intercity.chairCoachDesc'), color: 'bg-kj-primary-soft dark:bg-emerald-900/20 text-emerald-700 dark:text-kj-primary' },
                      { l: t('intercity.sleeperCoach'), d: t('intercity.sleeperCoachDesc'), color: 'bg-kj-primary-soft dark:bg-emerald-900/20 text-emerald-700 dark:text-kj-primary' },
                    ],
                    info: t('intercity.busInfo'),
                  },
                  {
                    id: 'train' as const, icon: <Train size={18} />, label: t('intercity.byTrain'),
                    desc: t('intercity.trainDesc'),
                    sel: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
                    details: [
                      { l: t('intercity.shovon'), d: t('intercity.shovonDesc'), color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
                      { l: t('intercity.shovonChair'), d: t('intercity.shovonChairDesc'), color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
                      { l: t('intercity.acChair'), d: t('intercity.acChairDesc'), color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
                      { l: t('intercity.acBerth'), d: t('intercity.acBerthDesc'), color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
                    ],
                    info: t('intercity.trainInfo'),
                  },
                  {
                    id: 'plane' as const, icon: <Plane size={18} />, label: t('intercity.byAir'),
                    desc: t('intercity.airDesc'),
                    sel: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400',
                    details: [
                      { l: 'ঢাকা–চট্টগ্রাম', d: '~45 min', color: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' },
                      { l: 'ঢাকা–সিলেট', d: '~40 min', color: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' },
                      { l: 'ঢাকা–কক্সবাজার', d: '~1 hr', color: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' },
                      { l: 'ঢাকা–যশোর', d: '~45 min', color: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' },
                    ],
                    info: t('intercity.airInfo'),
                  },
                  {
                    id: 'launch' as const, icon: <span className="text-base">🛥️</span>, label: t('intercity.byLaunch'),
                    desc: t('intercity.launchDesc'),
                    sel: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-kj-primary',
                    details: [
                      { l: 'ঢাকা–বরিশাল', d: '~8-10 hrs', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400' },
                      { l: 'ঢাকা–পটুয়াখালী', d: '~10-12 hrs', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400' },
                      { l: 'ঢাকা–ভোলা', d: '~8-9 hrs', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400' },
                      { l: 'ঢাকা–ঝালকাঠি', d: '~9-10 hrs', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400' },
                    ],
                    info: t('intercity.launchInfo'),
                  },
                ]).map(mode => {
                  const isSelected = selectedMode === mode.id;
                  return (
                    <div key={mode.id}>
                      <button
                        onClick={() => setSelectedMode(isSelected ? null : mode.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected ? mode.sel : 'bg-kj-panel border-kj-line hover:border-kj-line dark:hover:border-slate-600'}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? mode.sel : 'bg-kj-chip-bg text-kj-text-dim'}`}>
                          {mode.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-kj-text text-sm">{mode.label}</p>
                          <p className="text-kj-text-dim text-xs truncate">{mode.desc}</p>
                        </div>
                        <ChevronRight size={15} className={`shrink-0 text-kj-text-faint transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                      </button>
                      {/* Mobile expandable detail panel */}
                      {isSelected && (
                        <div className="md:hidden mx-1 -mt-1 bg-kj-panel border border-t-0 border-kj-line rounded-b-xl p-4 shadow-sm">
                          <p className="text-xs text-kj-text-dim mb-3 leading-relaxed">{mode.info}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {mode.details.map(item => (
                              <div key={item.l} className={`${item.color} rounded-xl p-2.5`}>
                                <p className="font-bold text-xs leading-tight text-kj-text">{item.l}</p>
                                <p className="text-kj-text-dim text-[10px] mt-0.5">{item.d}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* ═══ RIGHT PANEL (desktop only) ═══ */}
        <div className="hidden md:flex flex-1 flex-col relative overflow-hidden">
          {/* DhakaAlive full animated city scene — hidden when result is showing */}
          {!result && !loading && (
            <div className="absolute inset-0 z-0">
              <DhakaAlive hideIndicator />
            </div>
          )}

          {/* Right panel content overlay */}
          <div className="relative z-10 flex-1 overflow-y-auto">

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="bg-kj-panel/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl"><LoadingState /></div>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="flex items-center justify-center h-full min-h-[400px] p-8">
                <div className="max-w-sm w-full bg-white/95 dark:bg-kj-chip-bg/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-red-100 dark:border-red-900/30 text-center">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-red-100 dark:ring-red-900/20">
                    <AlertCircle size={30} className="text-red-500" />
                  </div>
                  <h3 className="font-extrabold text-xl text-kj-text mb-2">{language === 'bn' ? 'ত্রুটি' : 'Error'}</h3>
                  <p className="text-kj-text-dim text-sm mb-5 leading-relaxed">{error}</p>
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
              <div className="p-6 max-w-5xl mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-kj-text-dim">{result.from} → {result.to}</p>
                  <button
                    onClick={() => toggleSavedRoute(result.from, result.to)}
                    className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-colors ${isRouteSaved(result.from, result.to) ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-kj-chip-bg text-kj-text-dim hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
                  >
                    <Star className="w-4 h-4" fill={isRouteSaved(result.from, result.to) ? 'currentColor' : 'none'} />
                    {isRouteSaved(result.from, result.to) ? (language === 'bn' ? 'সেভ হয়েছে' : 'Saved') : (language === 'bn' ? 'রুট সেভ করুন' : 'Save Route')}
                  </button>
                </div>
                <ResultCard data={result} userLocation={userLocation} />
              </div>
            )}

            {/* Empty state: transport mode detail or welcome */}
            {!loading && !result && !error && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
                {selectedMode === 'bus' && authUser && (
                  <div className="bg-kj-panel/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-lg w-full text-left">
                    <div className="text-4xl mb-4 text-center">🚌</div>
                    <h3 className="text-xl font-bold text-kj-text mb-2 text-center">{t('intercity.byBus')}</h3>
                    <p className="text-kj-text-dim text-sm leading-relaxed mb-5 text-center">{t('intercity.busInfo')}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ l: t('intercity.acBus'), d: t('intercity.acBusDesc') }, { l: t('intercity.nonAcBus'), d: t('intercity.nonAcBusDesc') }, { l: t('intercity.chairCoach'), d: t('intercity.chairCoachDesc') }, { l: t('intercity.sleeperCoach'), d: t('intercity.sleeperCoachDesc') }].map(i => (
                        <div key={i.l} className="bg-kj-primary-soft dark:bg-emerald-900/20 rounded-xl p-3"><p className="font-bold text-emerald-700 dark:text-kj-primary text-sm">{i.l}</p><p className="text-kj-text-dim text-xs">{i.d}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMode === 'train' && authUser && (
                  <div className="bg-kj-panel/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-lg w-full text-left">
                    <div className="text-4xl mb-4 text-center">🚂</div>
                    <h3 className="text-xl font-bold text-kj-text mb-2 text-center">{t('intercity.byTrain')}</h3>
                    <p className="text-kj-text-dim text-sm leading-relaxed mb-5 text-center">{t('intercity.trainInfo')}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ l: t('intercity.shovon'), d: t('intercity.shovonDesc') }, { l: t('intercity.shovonChair'), d: t('intercity.shovonChairDesc') }, { l: t('intercity.acChair'), d: t('intercity.acChairDesc') }, { l: t('intercity.acBerth'), d: t('intercity.acBerthDesc') }].map(i => (
                        <div key={i.l} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3"><p className="font-bold text-blue-700 dark:text-blue-400 text-sm">{i.l}</p><p className="text-kj-text-dim text-xs">{i.d}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMode === 'plane' && authUser && (
                  <div className="bg-kj-panel/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-lg w-full text-left">
                    <div className="text-4xl mb-4 text-center">✈️</div>
                    <h3 className="text-xl font-bold text-kj-text mb-2 text-center">{t('intercity.byAir')}</h3>
                    <p className="text-kj-text-dim text-sm leading-relaxed mb-5 text-center">{t('intercity.airInfo')}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ l: 'ঢাকা–চট্টগ্রাম', d: '~45 min' }, { l: 'ঢাকা–সিলেট', d: '~40 min' }, { l: 'ঢাকা–কক্সবাজার', d: '~1 hr' }, { l: 'ঢাকা–যশোর', d: '~45 min' }].map(i => (
                        <div key={i.l} className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3"><p className="font-bold text-sky-700 dark:text-sky-400 text-sm">{i.l}</p><p className="text-kj-text-dim text-xs">{i.d}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMode === 'launch' && authUser && (
                  <div className="bg-kj-panel/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-lg w-full text-left">
                    <div className="text-4xl mb-4 text-center">🛥️</div>
                    <h3 className="text-xl font-bold text-kj-text mb-2 text-center">{t('intercity.launchTitle')}</h3>
                    <p className="text-kj-text-dim text-sm leading-relaxed mb-5 text-center">{t('intercity.launchInfo')}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ l: 'ঢাকা–বরিশাল', d: '~8-10 hrs' }, { l: 'ঢাকা–পটুয়াখালী', d: '~10-12 hrs' }, { l: 'ঢাকা–ভোলা', d: '~8-9 hrs' }, { l: 'ঢাকা–ঝালকাঠি', d: '~9-10 hrs' }].map(i => (
                        <div key={i.l} className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3"><p className="font-bold text-teal-700 dark:text-teal-400 text-sm">{i.l}</p><p className="text-kj-text-dim text-xs">{i.d}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {(!selectedMode || !authUser) && null}
              </div>
            )}
          </div>
        </div>

      </div>{/* END MAIN CONTENT */}
      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute top-0 right-0 bottom-0 w-3/4 max-w-xs bg-kj-panel shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-kj-text">{t('common.menu')}</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg rounded-full" aria-label="Close menu">
                <X className="w-6 h-6 text-kj-text-dim" />
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-kj-text truncate">{authUser.displayName}</p>
                      {authUser.username && <p className="text-xs text-kj-text-dim truncate">@{authUser.username}</p>}
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
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-kj-chip-bg hover:bg-kj-chip-bg text-kj-text-dim text-xs font-semibold transition-colors"
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
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-kj-primary hover:bg-kj-primary-deep text-white text-sm font-semibold transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> {t('nav.signup') || 'Sign Up'}
                  </button>
                </div>
              )}

              {/* History & Settings — only for logged-in users */}
              {authUser && (
                <>
                  <button
                    onClick={() => { window.location.href = '/#history'; setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
                  >
                    <Clock className="w-5 h-5 text-kj-primary" /> {t('nav.history') || 'History'}
                  </button>
                  <button
                    onClick={() => { window.location.href = '/#settings'; setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
                  >
                    <Settings className="w-5 h-5 text-kj-text-dim" /> {t('nav.settings') || 'Settings'}
                  </button>
                </>
              )}

              <button
                onClick={() => { window.location.href = '/#blog'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" /> {t('nav.blog') || 'Blog'}
              </button>

              {/* ── Community Features ── */}
              <div className="px-3 pt-2 pb-1">
                <p className="text-xs font-bold text-kj-text-faint uppercase tracking-wider">{language === 'bn' ? 'কমিউনিটি ফিচার' : 'Community'}</p>
              </div>
              <button
                onClick={() => { window.location.href = '/#trip-reminders'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <span className="w-5 h-5 text-center leading-5 text-violet-600">🔔</span> {language === 'bn' ? 'যাত্রা রিমাইন্ডার' : 'Trip Reminders'}
              </button>
              <button
                onClick={() => { window.location.href = '/#road-alerts'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-orange-500" /> {language === 'bn' ? 'রাস্তা সতর্কতা' : 'Road Alerts'}
              </button>
              <button
                onClick={() => { window.location.href = '/#neighbourhood-guides'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <MapPin className="w-5 h-5 text-purple-500" /> {language === 'bn' ? 'এলাকাভিত্তিক গাইড' : 'Area Guides'}
              </button>
              <button
                onClick={() => { window.location.href = '/#bus-pass-info'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <span className="w-5 h-5 text-center leading-5 text-blue-600">💳</span> {language === 'bn' ? 'বাস পাস তথ্য' : 'Bus Pass Info'}
              </button>
              <button
                onClick={() => { window.location.href = '/#multi-stop-planner'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <Navigation className="w-5 h-5 text-cyan-500" /> {language === 'bn' ? 'মাল্টি-স্টপ প্ল্যানার' : 'Multi-Stop Planner'}
              </button>
              <button
                onClick={() => { window.location.href = '/#commute-cost'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <Calculator className="w-5 h-5 text-kj-primary" /> {language === 'bn' ? 'খরচ ক্যালকুলেটর' : 'Cost Calculator'}
              </button>
              <button
                onClick={() => { window.location.href = '/#seat-availability'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <Ticket className="w-5 h-5 text-indigo-500" /> {language === 'bn' ? 'সিট প্রাপ্যতা' : 'Seat Availability'}
              </button>

              <button
                onClick={() => { window.location.href = '/#ai-assistant'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" /> {t('ai.title') || 'AI Assistant'}
              </button>
              <button
                onClick={() => { window.location.href = '/#about'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <Info className="w-5 h-5 text-blue-500" /> {t('nav.about')}
              </button>
              <button
                onClick={() => { window.location.href = '/#release-notes'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-primary-soft dark:hover:bg-emerald-900/20 text-kj-primary font-bold transition-colors"
              >
                <Rocket className="w-5 h-5" /> {t('nav.releaseNotes')}
              </button>
              <button
                onClick={() => { window.location.href = '/#why-use'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" /> {t('home.whyUse')}
              </button>
              <button
                onClick={() => { window.location.href = '/#faq'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> {t('nav.faq')}
              </button>
              <button
                onClick={() => { window.location.href = '/#install-app'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <Download className="w-5 h-5 text-kj-primary" /> {t('home.installApp')}
              </button>
              <button
                onClick={() => { window.location.href = '/#privacy'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> {t('nav.privacy')}
              </button>
              <button
                onClick={() => { window.location.href = '/#terms'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" /> {t('nav.terms')}
              </button>
              <button
                onClick={() => { window.location.href = '/#contact'; setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg text-kj-text-dim font-medium transition-colors"
              >
                <Phone className="w-5 h-5 text-red-600 dark:text-red-400" /> {t('nav.contact') || 'Contact Us'}
              </button>
            </div>

            <div className="pt-6 border-t border-kj-line">
              <p className="text-xs text-center text-kj-text-faint">
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
      <nav className="fixed bottom-0 left-0 right-0 bg-kj-panel border-t border-kj-line pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center border-t-2 transition-all border-transparent text-kj-text-faint hover:text-kj-text-dim dark:hover:text-kj-text-faint"
          >
            <Home className="w-6 h-6" />
          </button>

          <button
            onClick={() => window.location.href = '/intercity/'}
            className="flex items-center justify-center border-t-2 transition-all border-kj-primary text-kj-primary bg-kj-primary-soft/50 dark:bg-emerald-900/20"
          >
            <Bus className="w-6 h-6 fill-emerald-100 dark:fill-emerald-900" />
          </button>

          <button
            onClick={() => window.location.href = '/#train'}
            className="flex items-center justify-center border-t-2 transition-all border-transparent text-kj-text-faint hover:text-kj-text-dim dark:hover:text-kj-text-faint"
          >
            <Train className="w-6 h-6" />
          </button>

          <button
            onClick={() => window.location.href = '/#ai-assistant'}
            className="flex items-center justify-center border-t-2 transition-all border-transparent text-kj-text-faint hover:text-kj-text-dim dark:hover:text-kj-text-faint"
          >
            <Sparkles className="w-6 h-6" />
          </button>

          <button
            onClick={() => window.location.href = '/#about'}
            className="flex items-center justify-center border-t-2 transition-all border-transparent text-kj-text-faint hover:text-kj-text-dim dark:hover:text-kj-text-faint"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
