import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, AuthSession, AuthStatus } from '../types/auth';
import { fetchAvatar, getOrCreateDeviceId, recordDeviceLogin } from '../services/githubAuthService';

// ── Session storage keys ──────────────────────────────────────────────────────
const SESSION_KEY = 'koyjabo_auth_session';
const SESSION_TTL_DAYS = 30;

function saveSession(user: AuthUser): void {
  const session: AuthSession = {
    user,
    deviceId: getOrCreateDeviceId(),
    expiresAt: Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
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
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  const login = useCallback((newUser: AuthUser) => {
    saveSession(newUser);
    setUser(newUser);
    setStatus('authenticated');
    // Record device login in background (non-blocking, ~30-90s to complete)
    recordDeviceLogin(newUser.id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
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
