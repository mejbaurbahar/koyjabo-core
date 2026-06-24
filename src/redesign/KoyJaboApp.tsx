import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { KJ_TOKENS, Theme, Lang, Device } from './tokens';
import { injectGlobalStyles } from './globalStyles';
import { SplashScreen } from './SplashScreen';
import { LocationConsentModal } from './components/LocationConsentModal';

// HomePage is eager — it's always the landing screen
import { HomePage } from './screens/HomePage';
// System state pages are eager — needed for error boundaries and 404 handling
import { ErrorPage404, ErrorPage500, OfflinePage, MaintenancePage } from './screens/SystemStatesPage';

// All other screens are lazy — only loaded when the user navigates there
const LocalBusPage = React.lazy(() => import('./screens/LocalBusPage').then(m => ({ default: m.LocalBusPage })));
const MetroPage = React.lazy(() => import('./screens/MetroPage').then(m => ({ default: m.MetroPage })));
const TrainPage = React.lazy(() => import('./screens/TrainPage').then(m => ({ default: m.TrainPage })));
const LaunchPage = React.lazy(() => import('./screens/LaunchPage').then(m => ({ default: m.LaunchPage })));
const FlightsPage = React.lazy(() => import('./screens/FlightsPage').then(m => ({ default: m.FlightsPage })));
const AIChatPage = React.lazy(() => import('./screens/AIChatPage').then(m => ({ default: m.AIChatPage })));
const IntercityPage = React.lazy(() => import('./screens/IntercityPage').then(m => ({ default: m.IntercityPage })));
const RouteResultsV2Page = React.lazy(() => import('./screens/RouteResultsV2Page').then(m => ({ default: m.RouteResultsV2Page })));
const FareCalcPage = React.lazy(() => import('./screens/FareCalcPage').then(m => ({ default: m.FareCalcPage })));
const IntercityDetailPage = React.lazy(() => import('./screens/IntercityDetailPage').then(m => ({ default: m.IntercityDetailPage })));
const BusDetailPage = React.lazy(() => import('./screens/BusDetailPage').then(m => ({ default: m.BusDetailPage })));
const MetroDetailPage = React.lazy(() => import('./screens/MetroDetailPage').then(m => ({ default: m.MetroDetailPage })));
const TrainDetailPage = React.lazy(() => import('./screens/TrainDetailPage').then(m => ({ default: m.TrainDetailPage })));
const VehicleDetailPage = React.lazy(() => import('./screens/VehicleDetailPage').then(m => ({ default: m.VehicleDetailPage })));
const FlightDetailPage = React.lazy(() => import('./screens/FlightDetailPage').then(m => ({ default: m.FlightDetailPage })));
const RateReviewPage = React.lazy(() => import('./screens/RateReviewPage').then(m => ({ default: m.RateReviewPage })));
const MetroTokenPage = React.lazy(() => import('./screens/MetroTokenPage').then(m => ({ default: m.MetroTokenPage })));
const MetroPassPage = React.lazy(() => import('./screens/MetroPassPage').then(m => ({ default: m.MetroPassPage })));
const ProfilePage = React.lazy(() => import('./screens/ProfilePage').then(m => ({ default: m.ProfilePage })));
const FavoritesPage = React.lazy(() => import('./screens/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const HistoryPage = React.lazy(() => import('./screens/HistoryPage').then(m => ({ default: m.HistoryPage })));
const SettingsPage = React.lazy(() => import('./screens/SettingsPage').then(m => ({ default: m.SettingsPage })));
const EditProfilePage = React.lazy(() => import('./screens/EditProfilePage').then(m => ({ default: m.EditProfilePage })));
const PasswordPage = React.lazy(() => import('./screens/PasswordPage').then(m => ({ default: m.PasswordPage })));
const DevicesPage = React.lazy(() => import('./screens/DevicesPage').then(m => ({ default: m.DevicesPage })));
const SignInPage = React.lazy(() => import('./screens/SignInPage').then(m => ({ default: m.SignInPage })));
const SignUpPage = React.lazy(() => import('./screens/SignUpPage').then(m => ({ default: m.SignUpPage })));
const WhyPage = React.lazy(() => import('./screens/WhyPage').then(m => ({ default: m.WhyPage })));
const AboutPage = React.lazy(() => import('./screens/AboutPage').then(m => ({ default: m.AboutPage })));
const BlogsPage = React.lazy(() => import('./screens/BlogsPage').then(m => ({ default: m.BlogsPage })));
const BlogDetailPage = React.lazy(() => import('./screens/BlogDetailPage').then(m => ({ default: m.BlogDetailPage })));
const QAPage = React.lazy(() => import('./screens/QAPage').then(m => ({ default: m.QAPage })));
const ContactPage = React.lazy(() => import('./screens/ContactPage').then(m => ({ default: m.ContactPage })));
const ReleasePage = React.lazy(() => import('./screens/ReleasePage').then(m => ({ default: m.ReleasePage })));
const PrivacyPage = React.lazy(() => import('./screens/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./screens/TermsPage').then(m => ({ default: m.TermsPage })));
const InstallPage = React.lazy(() => import('./screens/InstallPage').then(m => ({ default: m.InstallPage })));

const LazyFallback = () => <div style={{ minHeight: '60vh' }} />;
import { claimDailyBonus } from './utils/koyCoinService';
import { NavDrawer } from './components/NavDrawer';
// FloatingControls removed per user request
import { AIFab } from './components/AIFab';
import { TopBar } from './components/TopBar';
import { MobileTabBar } from './components/MobileTabBar';
import { SideRailAd, AnchorAd, VignetteAd } from './components/AdComponents';
import { BUS_DATA, STATIONS } from '../../constants';
import { useAuth } from '../contexts/AuthContext';

type Route = string;

interface StackEntry {
  route: Route;
  params?: Record<string, string>;
}

const SECTION_MAP: Record<string, string> = {
  home: 'home', 'bus-hub': 'search', 'metro-hub': 'search', 'train-hub': 'search',
  'launch-hub': 'search', 'flights-hub': 'search', intercity: 'search',
  ai: 'ai', favorites: 'saved', profile: 'you', history: 'you', settings: 'you',
};

// Routes that show a back button (detail / leaf pages reached from search results)
const SHOW_BACK_ROUTES = new Set([
  'bus-detail', 'train-detail', 'metro-detail', 'intercity-detail', 'vehicle',
  'rate-review', 'metro-token', 'metro-pass', 'blog-detail', 'edit-profile',
  'password', 'devices', 'results', 'install', 'flight-detail',
]);

const ROUTE_PATHS: Record<string, string> = {
  home: '/',
  'bus-hub': '/local-bus',
  'metro-hub': '/metro',
  'train-hub': '/train',
  'launch-hub': '/launch',
  'flights-hub': '/air',
  intercity: '/intercity',
  fare: '/fare',
  ai: '/ai',
  favorites: '/favorites',
  history: '/history',
  profile: '/profile',
  settings: '/settings',
  signin: '/signin',
  signup: '/signup',
  why: '/why',
  about: '/about',
  blogs: '/blogs',
  qa: '/qa',
  contact: '/contact',
  release: '/release',
  privacy: '/privacy',
  terms: '/terms',
  install: '/install',
};

const slugify = (value: string) => value.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function busSlug(busId?: string) {
  const bus = BUS_DATA.find(item => item.id === busId);
  return slugify(bus?.name || busId || 'bus');
}

function detailPath(route: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams();
  if (params.from) query.set('from', slugify(params.from));
  if (params.to) query.set('to', slugify(params.to));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  if (route === 'blog-detail') return `/blogs/${params.slug || 'post'}`;
  if (route === 'bus-detail') return `/bus/${busSlug(params.busId)}${suffix}`;
  if (route === 'metro-detail') return `/metro/${slugify(params.stationId || params.id || 'detail')}${suffix}`;
  if (route === 'train-detail') return `/train/${slugify(params.trainId || params.id || 'detail')}${suffix}`;
  if (route === 'intercity-detail') {
    const base = slugify(params.operator || params.id || 'detail');
    const q = new URLSearchParams();
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return `/intercity/${base}${qs}`;
  }
  if (route === 'vehicle') return `/launch/${slugify(params.id || params.name || 'detail')}${suffix}`;
  if (route === 'flight-detail') {
    const base = (params.flightNo || params.code || 'flight').toLowerCase();
    const q = new URLSearchParams();
    if (params.fromIATA) q.set('from', params.fromIATA);
    if (params.toIATA) q.set('to', params.toIATA);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return `/air/${base}${qs}`;
  }
  return ROUTE_PATHS[route] || '/';
}

function pathForEntry(entry: StackEntry) {
  if (['bus-detail', 'metro-detail', 'train-detail', 'intercity-detail', 'vehicle', 'flight-detail', 'blog-detail'].includes(entry.route)) {
    return detailPath(entry.route, entry.params || {});
  }
  if (entry.route === 'results') {
    const query = new URLSearchParams();
    if (entry.params?.from) query.set('from', entry.params.from);
    if (entry.params?.to) query.set('to', entry.params.to);
    if (entry.params?.search) query.set('search', entry.params.search);
    return `/local-bus/results${query.toString() ? `?${query.toString()}` : ''}`;
  }
  return ROUTE_PATHS[entry.route] || '/';
}

function entryFromLocation(): StackEntry {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const search = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(search.entries()) as Record<string, string>;
  if (path.startsWith('/bus/')) {
    const slug = path.split('/')[2] || '';
    const bus = BUS_DATA.find(item => slugify(item.name) === slug || slugify(item.id) === slug);
    return { route: 'bus-detail', params: { ...params, busId: bus?.id || slug } };
  }
  if (path.startsWith('/local-bus/results')) return { route: 'results', params };
  if (path.startsWith('/metro/') && path !== '/metro') return { route: 'metro-detail', params: { ...params, stationId: path.split('/')[2] || '' } };
  if (path.startsWith('/train/') && path !== '/train') return { route: 'train-detail', params: { ...params, trainId: path.split('/')[2] || '' } };
  if (path.startsWith('/intercity/') && path !== '/intercity') return { route: 'intercity-detail', params: { ...params, id: path.split('/')[2] || '' } };
  if (path.startsWith('/launch/') && path !== '/launch') return { route: 'vehicle', params: { ...params, id: path.split('/')[2] || '' } };
  if (path.startsWith('/air/') && path !== '/air') return { route: 'flight-detail', params: { ...params, code: (path.split('/')[2] || '').toUpperCase() } };
  if (path.startsWith('/blogs/') && path !== '/blogs') return { route: 'blog-detail', params: { ...params, slug: path.split('/')[2] || '' } };
  const match = Object.entries(ROUTE_PATHS).find(([, routePath]) => routePath === path);
  return { route: match?.[0] || 'home' };
}

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'bn';
  const stored = localStorage.getItem('kj-language');
  return stored === 'en' ? 'en' : 'bn';
}

export function KoyJaboApp() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [forceDesktop, setForceDesktop] = useState(false); // phone user can request desktop view
  const [stack, setStack] = useState<StackEntry[]>(() => [entryFromLocation()]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [splash, setSplash] = useState(true);
  const [vignette, setVignette] = useState(false);
  const [anchorOn, setAnchorOn] = useState(true);
  const [vw, setVw] = useState(window.innerWidth);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const vignetteTimer = useRef<number>(0);

  // Inject global styles once
  useEffect(() => { injectGlobalStyles(); }, []);

  // Daily login bonus
  useEffect(() => { claimDailyBonus(); }, []);

  // Dismiss both splash screens after 1.4s, then show consent modal on first visit
  useEffect(() => {
    const t = setTimeout(() => {
      setSplash(false);
      const el = document.getElementById('kj-splash');
      if (el) { el.style.opacity = '0'; el.style.visibility = 'hidden'; setTimeout(() => el.remove(), 600); }
      // Show consent modal only if user hasn't decided yet
      if (!localStorage.getItem('kj-location-consent')) {
        setShowConsentModal(true);
      }
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  // Show vignette ad after 3 minutes of use
  useEffect(() => {
    vignetteTimer.current = window.setTimeout(() => setVignette(true), 180000);
    return () => clearTimeout(vignetteTimer.current);
  }, []);

  // Track vw for rail ads
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const top = stack[stack.length - 1];
  const canBack = stack.length > 1;
  const tk = KJ_TOKENS[theme];

  const pushUrl = useCallback((entry: StackEntry, replace = false) => {
    const nextPath = pathForEntry(entry);
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath === currentPath) return;
    if (replace) window.history.replaceState(entry, '', nextPath);
    else window.history.pushState(entry, '', nextPath);
  }, []);

  useEffect(() => {
    pushUrl(stack[stack.length - 1], true);
    const onPop = () => {
      setDir('back');
      setStack([entryFromLocation()]);
      if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Resolve actual device — forceDesktop lets phone users request web layout
  const resolvedDevice: 'desktop' | 'mobile' = (vw < 1024 && !forceDesktop) ? 'mobile' : 'desktop';

  const nav = useCallback((route: Route, params?: Record<string, string>) => {
    const entry = { route, params };
    setDir('fwd');
    setShowSkeleton(true);
    pushUrl(entry);
    if (['results', 'bus-hub', 'metro-hub', 'train-hub', 'flights-hub', 'intercity', 'launch-hub'].includes(route)) {
    }
    setTimeout(() => {
      setStack(s => [...s, entry]);
      setShowSkeleton(false);
      if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    }, 160);
  }, [pushUrl]);

  const navTab = useCallback((route: Route) => {
    const entry = { route };
    setDir('fwd');
    pushUrl(entry);
    setStack([entry]);
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
  }, [pushUrl]);

  const back = useCallback(() => {
    if (stack.length <= 1) return;
    const previous = stack[stack.length - 2];
    setDir('back');
    setStack(s => s.slice(0, -1));
    pushUrl(previous);
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
  }, [stack, pushUrl]);

  // Keyboard back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === 'Backspace') &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) &&
        !(e.target as HTMLElement).isContentEditable) {
        if (canBack) { e.preventDefault(); back(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canBack, back]);

  // Back button only on detail/leaf pages, not on hub/main pages
  const showBack = canBack && SHOW_BACK_ROUTES.has(top.route);

  const toggleLang = useCallback(() => {
    setLang(l => {
      const next = l === 'bn' ? 'en' : 'bn';
      localStorage.setItem('kj-language', next);
      return next;
    });
  }, []);

  const sharedProps = {
    theme, device: resolvedDevice, lang,
    route: top.route, params: top.params ?? {},
    canBack: showBack, onBack: back, onNav: nav, onNavTab: navTab,
    onLang: toggleLang,
    onTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
    onMenu: () => setMenuOpen(true),
  } as any; // typed via each screen's Props interface

  const section = SECTION_MAP[top.route] || 'home';
  const showRails = resolvedDevice === 'desktop' && vw >= 1500;
  const showAnchor = anchorOn && resolvedDevice === 'desktop';
  const isPhone = resolvedDevice === 'mobile';
  const showFrame = false; // no phone frame mode — always full responsive

  function renderScreen(route: Route, params?: Record<string, string>) {
    const p = { ...sharedProps, params };
    switch (route) {
      case 'home': return <HomePage {...p}/>;
      case 'bus-hub': return <LocalBusPage {...p}/>;
      case 'metro-hub': return <MetroPage {...p}/>;
      case 'train-hub': return <TrainPage {...p}/>;
      case 'launch-hub': return <LaunchPage {...p}/>;
      case 'flights-hub': return <FlightsPage {...p}/>;
      case 'ai': return <AIChatPage {...p}/>;
      case 'intercity': return <IntercityPage {...p}/>;
      case 'results': return <RouteResultsV2Page {...p}/>;
      case 'fare': return <FareCalcPage {...p}/>;
      case 'intercity-detail': return <IntercityDetailPage {...p}/>;
      case 'bus-detail': return <BusDetailPage {...p}/>;
      case 'metro-detail': return <MetroDetailPage {...p}/>;
      case 'train-detail': return <TrainDetailPage {...p}/>;
      case 'vehicle': return <VehicleDetailPage {...p}/>;
      case 'flight-detail': return <FlightDetailPage {...p}/>;
      case 'rate-review': return <RateReviewPage {...p}/>;
      case 'metro-token': return <MetroTokenPage {...p}/>;
      case 'metro-pass': return <MetroPassPage {...p}/>;
      case 'profile': return <ProfilePage {...p}/>;
      case 'favorites': return <FavoritesPage {...p}/>;
      case 'history': return <HistoryPage {...p}/>;
      case 'settings': return <SettingsPage {...p}/>;
      case 'edit-profile': return <EditProfilePage {...p}/>;
      case 'password': return <PasswordPage {...p}/>;
      case 'devices': return <DevicesPage {...p}/>;
      case 'signin': return <SignInPage {...p}/>;
      case 'signup': return <SignUpPage {...p}/>;
      case 'why': return <WhyPage {...p}/>;
      case 'about': return <AboutPage {...p}/>;
      case 'blogs': return <BlogsPage {...p}/>;
      case 'blog-detail': return <BlogDetailPage {...p}/>;
      case 'qa': return <QAPage {...p}/>;
      case 'contact': return <ContactPage {...p}/>;
      case 'release': return <ReleasePage {...p}/>;
      case 'privacy': return <PrivacyPage {...p}/>;
      case 'terms': return <TermsPage {...p}/>;
      case 'install': return <InstallPage {...p}/>;
      case '500': return <ErrorPage500 theme={theme} lang={lang}/>;
      case 'offline': return <OfflinePage theme={theme} lang={lang}/>;
      case 'maintenance': return <MaintenancePage theme={theme} lang={lang}/>;
      default: return <ErrorPage404 theme={theme} lang={lang} onHome={() => navTab('home')}/>;
    }
  }

  const screenKey = `${stack.length}:${top.route}`;

  const screenContent = (
    <div key={screenKey} className={`kj-screen kj-${dir}`} style={{ minHeight: '100%' }}>
      <Suspense fallback={<LazyFallback />}>
        {renderScreen(top.route, top.params)}
      </Suspense>
    </div>
  );

  // AI FAB — sticky inside scroller so it pins to phone screen too
  // Hidden on the AI page itself
  // AIFab — fixed so it always shows regardless of scroll/overflow context
  const aiFab = top.route !== 'ai' ? (
    <div style={{
      position: 'fixed', right: 16,
      bottom: isPhone ? 'calc(92px + env(safe-area-inset-bottom))' : (showAnchor ? 'calc(96px + env(safe-area-inset-bottom))' : 24),
      zIndex: 9200, pointerEvents: 'auto',
    }}>
      <AIFab tk={tk} lang={lang} onNav={() => nav('ai')}/>
    </div>
  ) : null;

  let stage: React.ReactNode;
  if (showFrame) {
    const fh = Math.min(window.innerHeight - 48, 880);
    stage = (
      <div style={{
        width: '100%', minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: theme === 'dark' ? '#05060b' : '#dde6ee',
        padding: 24, boxSizing: 'border-box',
      }}>
        <div style={{
          width: 414, height: fh, borderRadius: 52, padding: 12,
          background: 'linear-gradient(160deg,#23252c,#0c0d11)',
          boxShadow: '0 40px 100px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}>
          <div ref={scrollerRef} data-app-scroller="true" style={{
            width: '100%', height: '100%', borderRadius: 40,
            overflow: 'hidden auto', background: tk.bg,
            position: 'relative', WebkitOverflowScrolling: 'touch',
          }}>
            {screenContent}
            {aiFab}
          </div>
        </div>
      </div>
    );
  } else {
    stage = (
      <div ref={scrollerRef} data-app-scroller="true" style={{
        width: '100%', height: '100vh',
        overflowX: forceDesktop ? 'auto' : 'hidden', // allow h-scroll in desktop-on-phone mode
        overflowY: 'auto',
        background: tk.bg, position: 'relative',
        WebkitOverflowScrolling: 'touch',
        paddingLeft: showRails ? 184 : 0,
        paddingRight: showRails ? 184 : 0,
        paddingBottom: showAnchor ? 96 : 0,
        boxSizing: 'border-box',
      }}>
        {/* When forcing desktop on phone, content needs min-width to render properly */}
        <div style={{ minWidth: forceDesktop ? 1280 : 'auto' }}>
        {screenContent}
        </div>
      </div>
    );
  }

  const liftBottom = showAnchor ? 88 : 16;

  return (
    <>
      {splash && <SplashScreen/>}
      {/* TopBar rendered here — outside the animated .kj-screen wrapper */}
      {/* This avoids CSS transform containment block issue that breaks position:fixed */}
      <TopBar
        tk={tk} lang={lang} theme={theme}
        device={resolvedDevice}
        activeRoute={top.route}
        canBack={canBack} onBack={back}
        onNav={nav} onLang={toggleLang}
        onTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onMenu={() => setMenuOpen(true)}
        user={user}
      />
      {/* Mobile tab bar — outside scroller too */}
      {isPhone && (
        <MobileTabBar
          tk={tk} lang={lang}
          activeRoute={top.route}
          onNav={navTab}
        />
      )}
      {stage}
      {aiFab}
      {/* Desktop view toggle removed — mobile users always get mobile layout */}
      <NavDrawer
        open={menuOpen} theme={theme} lang={lang}
        activeRoute={top.route}
        isLoggedIn={!!user}
        onClose={() => setMenuOpen(false)}
        onNav={(r) => { setMenuOpen(false); nav(r); }}
      />
      {showRails && (
        <>
          <SideRailAd tk={tk} lang={lang} side="left"/>
          <SideRailAd tk={tk} lang={lang} side="right"/>
        </>
      )}
      {showAnchor && <AnchorAd tk={tk} lang={lang} onClose={() => setAnchorOn(false)}/>}
      <VignetteAd tk={tk} lang={lang} open={vignette} onClose={() => setVignette(false)}/>
      <LocationConsentModal
        tk={tk} lang={lang} open={showConsentModal}
        onNav={(r) => { setShowConsentModal(false); nav(r); }}
        onAllow={() => {
          localStorage.setItem('kj-location-consent', 'yes');
          setShowConsentModal(false);
          navigator.geolocation?.getCurrentPosition(
            pos => {
              const {latitude:lat,longitude:lng} = pos.coords;
              const stList = Object.values(STATIONS).filter((s:any)=>s.lat&&s.lng);
              let best:any=stList[0],bestD=Infinity;
              for(const s of stList as any[]){const d=(s.lat-lat)**2+(s.lng-lng)**2;if(d<bestD){bestD=d;best=s;}}
              localStorage.setItem('kj-location-area', best?.name||'Dhaka');
            },
            () => {},
            { timeout: 8000, maximumAge: 0 }
          );
        }}
        onDeny={() => {
          localStorage.setItem('kj-location-consent', 'no');
          setShowConsentModal(false);
        }}
      />
    </>
  );
}
