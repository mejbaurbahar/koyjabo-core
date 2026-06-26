import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, AuthSession, AuthStatus } from '../types/auth';
import { fetchAvatar, getOrCreateDeviceId, recordDeviceLogin, fetchUserHistoryFromGitHub, syncHistoryToGitHub } from '../services/githubAuthService';
import { setHistoryUser, getUserHistory, loadHistoryData } from '../../services/analyticsService';
import { secureStorage } from '../utils/secureStorage';

// ── Session storage keys ──────────────────────────────────────────────────────
const SESSION_KEY = 'koyjabo_auth_session';
const SESSION_TTL_DAYS = 30;

function saveSession(user: AuthUser): void {
  const session: AuthSession = {
    user,
    deviceId: getOrCreateDeviceId(),
    expiresAt: Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  };
  const payload = JSON.stringify(session);
  secureStorage.setItem(SESSION_KEY, payload);
  // Mirror to plain localStorage so legacy readers (communityDataService
  // getAuthUser, etc.) keep seeing the same avatar + profile data.
  try { localStorage.setItem(SESSION_KEY, payload); } catch {}
}

function loadSession(): AuthSession | null {
  try {
    // Primary: obfuscated secure storage
    let raw = secureStorage.getItem(SESSION_KEY);

    // Fallback: legacy plain localStorage (pre-secureStorage migration).
    // Some flows (community data service) still write here, so accounts
    // created before the migration keep working — and the user's avatar
    // doesn't vanish from TopBar when only the plain key has the data.
    if (!raw) {
      try {
        const legacy = localStorage.getItem(SESSION_KEY);
        if (legacy) {
          raw = legacy;
          // Promote to secure storage on first read
          secureStorage.setItem(SESSION_KEY, legacy);
        }
      } catch { /* localStorage may throw in private mode */ }
    }

    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      secureStorage.removeItem(SESSION_KEY);
      try { localStorage.removeItem(SESSION_KEY); } catch {}
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

// ── Context types ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('idle');

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setUser(session.user);
      setStatus('authenticated');
      // Activate user-specific history slot immediately
      setHistoryUser(session.user.id);
      // Lazily refresh avatar (non-blocking)
      fetchAvatar(session.user.id)
        .then(avatarUrl => {
          if (avatarUrl && avatarUrl !== session.user.avatarUrl) {
            setUser(prev => prev ? { ...prev, avatarUrl } : prev);
            const fresh = loadSession();
            if (fresh) saveSession({ ...fresh.user, avatarUrl });
          }
        })
        .catch(() => { /* avatar fetch is best-effort */ });
      // Refresh history from GitHub in background
      fetchUserHistoryFromGitHub(session.user.id)
        .then(data => { if (data) loadHistoryData(data as any); })
        .catch(() => {});
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  const login = useCallback((newUser: AuthUser) => {
    saveSession(newUser);
    setUser(newUser);
    setStatus('authenticated');
    // Switch to user-specific history slot
    setHistoryUser(newUser.id);
    // Record device login in background
    recordDeviceLogin(newUser.id);
    // Load history from GitHub in background (overwrites any stale local data)
    fetchUserHistoryFromGitHub(newUser.id)
      .then(data => { if (data) loadHistoryData(data as any); })
      .catch(() => {});
  }, []);

  const logout = useCallback(() => {
    // Sync current history to GitHub before clearing (fire-and-forget)
    const currentUser = loadSession()?.user;
    if (currentUser) {
      const h = getUserHistory();
      syncHistoryToGitHub(currentUser.id, {
        busSearches: h.busSearches,
        routeSearches: h.routeSearches,
        intercitySearches: h.intercitySearches,
        trainSearches: h.trainSearches,
        mostUsedBuses: h.mostUsedBuses,
        mostUsedRoutes: h.mostUsedRoutes,
        mostUsedIntercity: h.mostUsedIntercity,
        mostUsedTrains: h.mostUsedTrains,
      });
    }
    secureStorage.removeItem(SESSION_KEY);
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    setHistoryUser(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      saveSession(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
