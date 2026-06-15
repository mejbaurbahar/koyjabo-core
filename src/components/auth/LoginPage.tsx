import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, X, Lock } from 'lucide-react';
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
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center bg-kj-bg p-4">
        <div className="dc-card kj-glass rounded-2xl p-10 max-w-xs w-full text-center border border-kj-line">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="w-16 h-16 rounded-full border-4 border-kj-line animate-spin border-t-kj-primary" />
            <Lock className="absolute inset-0 m-auto text-kj-primary" size={20} />
          </div>
          <h2 className="text-lg font-bold text-kj-text mb-1">{t('auth.verifying')}</h2>
          <p className="text-kj-text-dim text-sm">{t('auth.processingWait')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 min-h-0 w-full overflow-y-auto overscroll-y-contain touch-pan-y bg-kj-bg flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-28 md:pt-safe md:pb-safe relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-kj-chip-bg hover:bg-kj-panel text-kj-text-dim shadow-sm transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      )}

      <div className="w-full max-w-sm mx-auto">
        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-[15px] bg-gradient-to-br from-kj-primary to-kj-primary-deep flex items-center justify-center mb-4 shadow-lg kj-glow">
            <span className="text-white text-2xl font-bold font-bengali leading-none">ক</span>
          </div>
          <h1 className="text-[26px] font-bold text-kj-text font-bengali leading-tight text-center">
            আবার স্বাগতম / Welcome back
          </h1>
          <p className="text-kj-text-faint text-sm mt-1.5 text-center font-sans">
            কই যাবোতে সাইন ইন করুন / Sign in to continue with KoyJabo
          </p>
        </div>

        {/* Card */}
        <div className="dc-card kj-glass rounded-2xl p-6 border border-kj-line">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-kj-accent-soft border border-kj-accent/30 flex items-start gap-2">
              <AlertCircle size={16} className="text-kj-accent mt-0.5 shrink-0" />
              <p className="text-sm text-kj-accent">{error}</p>
            </div>
          )}

          {/* Social buttons */}
          {false /* Google/Facebook/Apple temporarily hidden — enabled on dev */ && (
            <div className="space-y-3 mb-5">
              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-kj-line bg-white hover:bg-gray-50 text-gray-700 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed font-sans"
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  {googleLoading ? (
                    <Loader2 size={18} className="animate-spin text-gray-400" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                  )}
                </span>
                <span className="flex-1 text-left text-sm">{t('auth.continueWithGoogle')}</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0866ff] hover:brightness-110 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed font-sans"
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </span>
                <span className="flex-1 text-left text-sm">Continue with Facebook</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#000000] hover:bg-gray-900 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed font-sans"
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  <svg width="16" height="18" viewBox="0 0 814 1000" fill="white">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                  </svg>
                </span>
                <span className="flex-1 text-left text-sm">Continue with Apple</span>
              </button>
            </div>
          )}

          {false && (
            <div className="mb-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-kj-line" />
              <span className="text-[11px] text-kj-text-faint font-sans uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-kj-line" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-[9px] font-semibold text-kj-text-faint uppercase tracking-widest mb-1.5 font-sans">
                ইমেইল / EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder={t('auth.emailPlaceholder')}
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl border bg-kj-input-bg text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:ring-2 focus:ring-kj-primary/40 focus:border-kj-primary transition font-sans text-sm ${
                  emailError ? 'border-kj-accent' : 'border-kj-line'
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-kj-accent flex items-center gap-1 font-sans">
                  <AlertCircle size={12} /> {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[9px] font-semibold text-kj-text-faint uppercase tracking-widest mb-1.5 font-sans">
                পাসওয়ার্ড / PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border bg-kj-input-bg text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:ring-2 focus:ring-kj-primary/40 focus:border-kj-primary transition font-sans text-sm ${
                    passwordError ? 'border-kj-accent' : 'border-kj-line'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kj-text-faint hover:text-kj-text-dim p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-between items-center mt-1.5">
                {passwordError
                  ? <p className="text-xs text-kj-accent flex items-center gap-1 font-sans"><AlertCircle size={12} /> {passwordError}</p>
                  : <span />
                }
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-kj-primary hover:underline font-sans ml-auto"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full py-3 px-6 rounded-xl font-bold text-[15px] text-kj-primary-ink bg-gradient-to-r from-kj-primary to-kj-primary-deep hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg kj-glow font-sans mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('auth.verifying')}
                </>
              ) : (
                t('auth.loginButton')
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-5 text-center text-sm text-kj-text-faint font-sans">
            {t('auth.noAccount')}{' '}
            <button
              onClick={onSignup}
              className="text-kj-primary font-semibold hover:underline"
            >
              {t('auth.register')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
