import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle, X, Lock } from 'lucide-react';
import { loginUser, getAuthErrorKey, fetchAvatar } from '../../services/githubAuthService';
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

  if (loading) {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 max-w-xs w-full text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-slate-600 animate-spin border-t-blue-600" />
            <Lock className="absolute inset-0 m-auto text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('auth.verifying')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('auth.processingWait')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-y-contain touch-pan-y bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-28 md:pt-safe md:pb-safe relative" style={{ WebkitOverflowScrolling: 'touch' }}>
      {onClose && (
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 shadow-sm transition-colors z-10"
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.welcome')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('auth.loginToAccount')}</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder={t('auth.emailPlaceholder')}
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  emailError ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {emailError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                  className={`w-full px-4 py-3 pr-12 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    passwordError ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
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

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
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
