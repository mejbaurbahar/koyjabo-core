import React, { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { KoyJaboApp } from './redesign/KoyJaboApp';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  declare props: Readonly<ErrorBoundaryProps>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-kj-line max-w-md">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-kj-text mb-2">Something went wrong</h1>
            <p className="text-kj-text-dim mb-6 text-sm">
              We encountered an unexpected error. Please try reloading the page.
            </p>
            <div className="bg-gray-100 p-3 rounded-lg text-left mb-6 overflow-auto max-h-32">
              <code className="text-xs text-red-600 font-mono break-all">
                {this.state.error?.message || "Unknown Error"}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-600 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import AntiScraping from '../components/AntiScraping';
import { ToastProvider } from '../contexts/ToastContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { killConsoleInProd, installAntiDevtools } from './utils/security';
killConsoleInProd();
installAntiDevtools();

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <KoyJaboApp />
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Register PWA Service Worker + auto-update on every deploy.
// Users never need to hard-refresh: the SW checks for new versions every 60s,
// on tab focus, and on visibility change; when a new SW takes over,
// the page silently reloads to pick up the latest chunks.
let reloadInFlight = false;
function silentReload() {
  if (reloadInFlight) return;
  reloadInFlight = true;
  window.location.reload();
}

async function registerPWAWorker() {
  try {
    const mod = await import(/* @vite-ignore */ 'virtual:pwa-register');
    const updateSW = mod.registerSW({
      immediate: true,
      onNeedRefresh() {
        // New SW waiting → ask it to skipWaiting (already configured in vite),
        // then reload once it takes control via the controllerchange listener.
        silentReload();
      },
      onOfflineReady() {
        window.dispatchEvent(new CustomEvent('pwa-offline-ready'));
      },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;
        // Poll for a new SW every 60s — Workbox by default only checks
        // on navigation, which doesn't fire inside a SPA. This makes
        // long-lived tabs pick up new deploys without manual refresh.
        const POLL_MS = 60_000;
        setInterval(() => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        }, POLL_MS);

        // Also check immediately on tab focus or visibility change —
        // user came back to the tab, probably the moment they expect
        // to see the freshest content.
        const checkNow = () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        };
        document.addEventListener('visibilitychange', checkNow);
        window.addEventListener('focus', checkNow);
      },
    });

    // Expose for manual triggering if needed (e.g. dev console)
    (window as any).__kjUpdateSW = updateSW;
  } catch {
    // PWA plugin not active for this runtime; continue without SW registration.
  }
}

void registerPWAWorker();

// Backup: if the SW controller changes (new SW took over), reload immediately.
// This catches the case where skipWaiting activates a new SW mid-session.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    silentReload();
  });

  // BUILD_VERSION fallback — if HTML refreshes but SW didn't update for any
  // reason, compare the build-time constant baked into the HTML with the
  // running JS. If a new version is detected on focus, force reload.
  const RUNNING_VERSION = __KJ_BUILD_VERSION__;
  const checkVersion = async () => {
    if (document.visibilityState !== 'visible') return;
    try {
      const r = await fetch(`/version.json?ts=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) return;
      const { version } = await r.json();
      if (version && version !== RUNNING_VERSION) {
        silentReload();
      }
    } catch { /* offline or missing — ignore */ }
  };
  setInterval(checkVersion, 120_000);
  document.addEventListener('visibilitychange', checkVersion);
  window.addEventListener('focus', checkVersion);
}
