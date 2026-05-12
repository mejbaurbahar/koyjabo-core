import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle, X, Lock } from 'lucide-react';
import { loginUser, loginWithGoogle, getAuthErrorKey, fetchAvatar } from '../../services/githubAuthService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';

interface LoginPageProps {
  onSignup: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
  onClose?: () => void;
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function LoginPage({ onSignup, onForgotPassword, onSuccess, onClose }: LoginPageProps) {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const emailError = emailTouched && !isValidEmail(email) ? t('auth.validation.invalidEmail') : undefined;
  const passwordError = passwordTouched && !password ? t('auth.validation.passwordRequired') : undefined;
  const canSubmit = isValidEmail(email) && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!canSubmit) return;
    setError('');
    setLoading(true);

    try {
      const { userId, username, displayName, email: normalizedEmail } = await loginUser(email, password);

      // Fetch avatar in background
      const avatarUrl = await fetchAvatar(userId).catch(() => null);

      login({
        id: userId,
        email: normalizedEmail,
        username,
        displayName,
        avatarUrl: avatarUrl ?? undefined,
        createdAt: Date.now()
      });

      showToast(t('auth.validation.loginSuccess'), 'success');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const key = getAuthErrorKey(msg);
      setError(key ? t(key) : msg || t('auth.validation.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { userId, username, displayName, email: normalizedEmail, provider, hasPassword, googlePhotoUrl } = await loginWithGoogle();
      const avatarUrl = googlePhotoUrl ?? await fetchAvatar(userId).catch(() => null);
      login({
        id: userId,
        email: normalizedEmail,
        username,
        displayName,
        avatarUrl: avatarUrl ?? undefined,
        createdAt: Date.now(),
        provider,
        hasPassword,
      });
      showToast(t('auth.validation.loginSuccess'), 'success');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const key = getAuthErrorKey(msg);
      setError(key ? t(key) : msg || t('auth.validation.googleLoginFailed'));
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="bg-kj-panel rounded-2xl shadow-xl p-10 max-w-xs w-full text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-slate-600 animate-spin border-t-blue-600" />
            <Lock className="absolute inset-0 m-auto text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-bold text-kj-text mb-1">{t('auth.verifying')}</h2>
          <p className="text-kj-text-dim text-sm">{t('auth.processingWait')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-y-contain touch-pan-y bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-28 md:pt-safe md:pb-safe relative" style={{ WebkitOverflowScrolling: 'touch' }}>
      {onClose && (
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-kj-chip-bg/80 hover:bg-white dark:hover:bg-slate-700 text-kj-text-dim shadow-sm transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      )}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-4">
            <LogIn className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-kj-text">{t('auth.welcome')}</h1>
          <p className="text-kj-text-dim mt-1">{t('auth.loginToAccount')}</p>
        </div>

        {/* Card */}
        <div className="bg-kj-panel rounded-2xl shadow-xl p-8 border border-kj-line">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-kj-text-dim mb-1.5">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder={t('auth.emailPlaceholder')}
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-700 text-kj-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  emailError ? 'border-red-400 dark:border-red-500' : 'border-kj-line dark:border-slate-600'
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {emailError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-kj-text-dim mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border bg-gray-50 dark:bg-slate-700 text-kj-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    passwordError ? 'border-red-400 dark:border-red-500' : 'border-kj-line dark:border-slate-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kj-text-faint hover:text-kj-text-dim dark:hover:text-kj-text-faint p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-between items-center mt-1.5">
                {passwordError
                  ? <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {passwordError}</p>
                  : <span />
                }
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('auth.verifying')}
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  {t('auth.loginButton')}
                </>
              )}
            </button>
          </form>

          {false /* Google sign-in temporarily hidden on production — enabled on dev */ && (
          <><div className="mt-5 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-kj-line dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-kj-panel text-kj-text-faint">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-kj-line dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-kj-chip-bg dark:hover:bg-slate-600 text-kj-text-dim font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {t('auth.continueWithGoogle')}
          </button></>)}

          <div className="mt-5 text-center text-sm text-kj-text-dim">
            {t('auth.noAccount')}{' '}
            <button
              onClick={onSignup}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {t('auth.register')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
