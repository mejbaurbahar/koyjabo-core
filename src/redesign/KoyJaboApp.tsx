import React, { useState, useEffect, useRef, useCallback } from 'react';
import { KJ_TOKENS, Theme, Lang, Device, T, SANS, BEN } from './tokens';
import { injectGlobalStyles } from './globalStyles';
import { SplashScreen } from './SplashScreen';
import { getAuthUser } from '../../services/communityDataService';

// Lazy imports — all screens
import { HomePage } from './screens/HomePage';
import { LocalBusPage } from './screens/LocalBusPage';
import { MetroPage } from './screens/MetroPage';
import { TrainPage } from './screens/TrainPage';
import { LaunchPage } from './screens/LaunchPage';
import { FlightsPage } from './screens/FlightsPage';
import { AIChatPage } from './screens/AIChatPage';
import { IntercityPage } from './screens/IntercityPage';
import { RouteResultsV2Page } from './screens/RouteResultsV2Page';
import { FareCalcPage } from './screens/FareCalcPage';
import { IntercityDetailPage } from './screens/IntercityDetailPage';
import { BusDetailPage } from './screens/BusDetailPage';
import { MetroDetailPage } from './screens/MetroDetailPage';
import { TrainDetailPage } from './screens/TrainDetailPage';
import { VehicleDetailPage } from './screens/VehicleDetailPage';
import { RateReviewPage } from './screens/RateReviewPage';
import { MetroTokenPage } from './screens/MetroTokenPage';
import { MetroPassPage } from './screens/MetroPassPage';
import { ProfilePage } from './screens/ProfilePage';
import { FavoritesPage } from './screens/FavoritesPage';
import { HistoryPage } from './screens/HistoryPage';
import { SettingsPage } from './screens/SettingsPage';
import { EditProfilePage } from './screens/EditProfilePage';
import { PasswordPage } from './screens/PasswordPage';
import { DevicesPage } from './screens/DevicesPage';
import { SignInPage } from './screens/SignInPage';
import { SignUpPage } from './screens/SignUpPage';
import { WhyPage } from './screens/WhyPage';
import { AboutPage } from './screens/AboutPage';
import { BlogsPage } from './screens/BlogsPage';
import { BlogDetailPage } from './screens/BlogDetailPage';
import { QAPage } from './screens/QAPage';
import { ContactPage } from './screens/ContactPage';
import { ReleasePage } from './screens/ReleasePage';
import { PrivacyPage } from './screens/PrivacyPage';
import { TermsPage } from './screens/TermsPage';
import { InstallPage } from './screens/InstallPage';
import { PageShell } from './screens/PageShell';
import { ErrorPage404, ErrorPage500, OfflinePage, MaintenancePage } from './screens/SystemStatesPage';
import { NavDrawer } from './components/NavDrawer';
// FloatingControls removed per user request
import { AIFab } from './components/AIFab';
import { TopBar } from './components/TopBar';
import { MobileTabBar } from './components/MobileTabBar';
import { SideRailAd, AnchorAd, VignetteAd } from './components/AdComponents';
import { AdBlockGate } from './components/AdBlockGate';
import { BUS_DATA } from '../../constants';

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
  'password', 'devices', 'results', 'install',
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
  blogs: '/blog',
  qa: '/qa',
  contact: '/contact',
  release: '/release',
  privacy: '/privacy',
  terms: '/terms',
  install: '/install',
  offline: '/offline',
  '500': '/500',
  maintenance: '/maintenance',
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
  if (route === 'bus-detail') return `/bus/${busSlug(params.busId)}${suffix}`;
  if (route === 'metro-detail') return `/metro/${slugify(params.stationId || params.id || 'detail')}${suffix}`;
  if (route === 'train-detail') return `/train/${slugify(params.trainId || params.id || 'detail')}${suffix}`;
  if (route === 'intercity-detail') return `/intercity/${slugify(params.id || params.operator || 'detail')}${suffix}`;
  if (route === 'vehicle') return `/launch/${slugify(params.id || params.name || 'detail')}${suffix}`;
  if (route === 'blog-detail') return `/blog/${slugify(params.slug || params.id || 'post')}`;
  return ROUTE_PATHS[route] || '/';
}

function pathForEntry(entry: StackEntry) {
  if (['bus-detail', 'metro-detail', 'train-detail', 'intercity-detail', 'vehicle', 'blog-detail'].includes(entry.route)) {
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
  if (path.startsWith('/blog/') && path !== '/blog') return { route: 'blog-detail', params: { ...params, slug: path.split('/')[2] || '' } };
  if (path === '/blogs') return { route: 'blogs' };
  const match = Object.entries(ROUTE_PATHS).find(([, routePath]) => routePath === path);
  return { route: match?.[0] || 'home' };
}

function AuthRequiredPage(props: any) {
  const { theme, device, lang, onNav } = props;
  const tk = KJ_TOKENS[theme as Theme];
  const isMobile = device === 'mobile';
  return (
    <PageShell {...props} canBack>
      <div style={{ minHeight: '58vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '28px 16px 96px' : '56px 24px 96px' }}>
        <div style={{ width: '100%', maxWidth: 460, background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 20, padding: isMobile ? 22 : 30, boxShadow: tk.shadowLg, textAlign: 'center' }}>
          <div style={{ width: 62, height: 62, borderRadius: 18, background: tk.accentSoft, color: tk.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: SANS, fontSize: 28, fontWeight: 800 }}>
            !
          </div>
          <h1 style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 22, fontWeight: 800, color: tk.text, margin: '0 0 8px' }}>
            {T(lang, 'লগইন প্রয়োজন', 'Login required')}
          </h1>
          <p style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14, color: tk.textDim, lineHeight: 1.6, margin: '0 0 20px' }}>
            {T(lang, 'সার্চ রেজাল্ট দেখতে আগে সাইন ইন করুন।', 'Please sign in before viewing search results.')}
          </p>
          <button
            onClick={() => onNav('signin')}
            style={{ background: tk.primary, color: tk.primaryInk, border: 0, borderRadius: 12, padding: '12px 20px', fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14, fontWeight: 800, cursor: 'pointer', width: '100%' }}
          >
            {T(lang, 'সাইন ইন করুন', 'Sign in')}
          </button>
        </div>
      </div>
    </PageShell>
  );
}

export function KoyJaboApp() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Lang>('en');
  const [stack, setStack] = useState<StackEntry[]>(() => [entryFromLocation()]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [splash, setSplash] = useState(true);
  const [vignette, setVignette] = useState(false);
  const [anchorOn, setAnchorOn] = useState(true);
  const [vw, setVw] = useState(window.innerWidth);
  const [authUser, setAuthUser] = useState(() => getAuthUser());
  const scrollerRef = useRef<HTMLDivElement>(null);
  const vignetteTimer = useRef<number>(0);

  // Inject global styles once
  useEffect(() => { injectGlobalStyles(); }, []);

  // Dismiss both splash screens after 1.4s
  useEffect(() => {
    const t = setTimeout(() => {
      setSplash(false);
      // Dismiss the index.html static splash too
      const el = document.getElementById('kj-splash');
      if (el) { el.style.opacity = '0'; el.style.visibility = 'hidden'; setTimeout(() => el.remove(), 600); }
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

  useEffect(() => {
    const refreshAuth = () => setAuthUser(getAuthUser());
    window.addEventListener('storage', refreshAuth);
    window.addEventListener('focus', refreshAuth);
    window.addEventListener('koyjabo-auth-changed', refreshAuth);
    return () => {
      window.removeEventListener('storage', refreshAuth);
      window.removeEventListener('focus', refreshAuth);
      window.removeEventListener('koyjabo-auth-changed', refreshAuth);
    };
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

  const resolvedDevice: 'desktop' | 'mobile' = vw < 1024 ? 'mobile' : 'desktop';

  const nav = useCallback((route: Route, params?: Record<string, string>) => {
    setAuthUser(getAuthUser());
    const entry = { route, params };
    setDir('fwd');
    setShowSkeleton(true);
    pushUrl(entry);
    setTimeout(() => {
      setStack(s => [...s, entry]);
      setShowSkeleton(false);
      if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    }, 160);
  }, [pushUrl]);

  const navTab = useCallback((route: Route) => {
    setAuthUser(getAuthUser());
    const entry = { route };
    setDir('fwd');
    pushUrl(entry);
    setStack([entry]);
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
  }, [pushUrl]);

  useEffect(() => {
    if (authUser && (top.route === 'signin' || top.route === 'signup')) {
      const entry = { route: 'profile' };
      setDir('fwd');
      pushUrl(entry, true);
      setStack([entry]);
    }
  }, [authUser, top.route, pushUrl]);

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

  const sharedProps = {
    theme, device: resolvedDevice, lang,
    route: top.route, params: top.params ?? {},
    authUser,
    canBack: showBack, onBack: back, onNav: nav, onNavTab: navTab,
    onLang: () => setLang(l => l === 'bn' ? 'en' : 'bn'),
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
      case 'results': return authUser ? <RouteResultsV2Page {...p}/> : <AuthRequiredPage {...p}/>;
      case 'fare': return <FareCalcPage {...p}/>;
      case 'intercity-detail': return <IntercityDetailPage {...p}/>;
      case 'bus-detail': return <BusDetailPage {...p}/>;
      case 'metro-detail': return <MetroDetailPage {...p}/>;
      case 'train-detail': return <TrainDetailPage {...p}/>;
      case 'vehicle': return <VehicleDetailPage {...p}/>;
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
      {renderScreen(top.route, top.params)}
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
          <div ref={scrollerRef} style={{
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
      <div ref={scrollerRef} style={{
        width: '100%', height: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        background: tk.bg, position: 'relative',
        WebkitOverflowScrolling: 'touch',
        paddingLeft: showRails ? 184 : 0,
        paddingRight: showRails ? 184 : 0,
        paddingBottom: showAnchor ? 96 : 0,
        boxSizing: 'border-box',
      }}>
        <div>
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
        user={authUser}
        activeRoute={top.route}
        canBack={canBack} onBack={back}
        onNav={nav} onLang={() => setLang(l => l === 'bn' ? 'en' : 'bn')}
        onTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onMenu={() => setMenuOpen(true)}
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
      <NavDrawer
        open={menuOpen} theme={theme} lang={lang}
        user={authUser}
        activeRoute={top.route}
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
      <AdBlockGate lang={lang} theme={theme}/>
    </>
  );
}
