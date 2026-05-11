import React, { useState, useMemo, useEffect } from 'react';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Clock, X, Check, Loader2 } from 'lucide-react';
import { signupUser, loginWithGoogle, getAuthErrorKey, fetchAvatar } from '../../services/githubAuthService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { isTempMailEmail } from '../../utils/tempMailDomains';

interface SignupPageProps {
  onLogin: () => void;
  onSuccess: () => void;
  onClose?: () => void;
}

interface FieldErrors {
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordRule {
  label: string;
  met: boolean;
}

// ── Animated processing screen shown during 30-90s signup wait ───────────────
function SignupProcessingScreen({
  serverError, t, language
}: { serverError: string; t: (k: string) => string; language: string }) {
  const bnMessages = [
    'সুরক্ষিতভাবে অ্যাকাউন্ট তৈরি হচ্ছে…',
    'আপনার তথ্য এনক্রিপ্ট করা হচ্ছে…',
    'অ্যাকাউন্ট সক্রিয় করা হচ্ছে…',
    'প্রায় শেষ, একটু অপেক্ষা করুন…',
    'স্বাগত ইমেইল পাঠানো হচ্ছে…',
  ];
  const enMessages = [
    'Creating your account securely…',
    'Encrypting your information…',
    'Activating your account…',
    'Almost done, please wait…',
    'Sending welcome email…',
  ];
  const messages = language === 'bn' ? bnMessages : enMessages;
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 3500);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
        {/* Outer ring + inner ring animation */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-slate-600 animate-spin border-t-blue-500" />
          <div className="absolute inset-2 rounded-full border-4 border-indigo-100 dark:border-slate-700 animate-spin border-b-indigo-500 [animation-direction:reverse] [animation-duration:1.4s]" />
          <Clock className="absolute inset-0 m-auto text-blue-600 dark:text-blue-400" size={22} />
        </div>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('auth.creatingAccountTitle')}</h2>

        {/* Cycling status message */}
        <p key={msgIdx} className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4 animate-in fade-in duration-500">
          {messages[msgIdx]}
        </p>

        {/* Animated dots progress */}
        <div className="flex justify-center gap-2 mb-4">
          {messages.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === msgIdx ? 'bg-blue-600 scale-125' : i < msgIdx ? 'bg-blue-300' : 'bg-gray-200 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <p className="text-gray-400 dark:text-gray-500 text-xs">{t('auth.forgotPasswordPage.maxWait')}</p>

        {serverError && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignupPage({ onLogin, onSuccess, onClose }: SignupPageProps) {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const getPasswordRules = (password: string): PasswordRule[] => [
    { label: t('auth.passwordRules.minChars'), met: password.length >= 8 },
    { label: t('auth.passwordRules.uppercase'), met: /[A-Z]/.test(password) },
    { label: t('auth.passwordRules.lowercase'), met: /[a-z]/.test(password) },
    { label: t('auth.passwordRules.number'), met: /[0-9]/.test(password) },
    { label: t('auth.passwordRules.specialChar'), met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const passwordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' };
    const rules = getPasswordRules(password);
    const met = rules.filter(r => r.met).length;
    if (met <= 2) return { score: met, label: t('auth.passwordStrength.weak'), color: 'bg-red-500' };
    if (met === 3) return { score: met, label: t('auth.passwordStrength.average'), color: 'bg-yellow-500' };
    if (met === 4) return { score: met, label: t('auth.passwordStrength.good'), color: 'bg-blue-500' };
    return { score: met, label: t('auth.passwordStrength.strong'), color: 'bg-green-500' };
  };

  const validateField = (name: keyof FieldErrors, value: string, form: Record<string, string>): string => {
    switch (name) {
      case 'displayName':
        if (!value.trim()) return t('auth.validation.fullNameRequired');
        if (value.trim().length < 2) return t('auth.validation.nameTooShort');
        if (value.length > 50) return t('auth.validation.nameTooLong');
        return '';
      case 'username':
        if (!value.trim()) return t('auth.validation.usernameRequired');
        if (value.length < 3) return t('auth.validation.usernameTooShort');
        if (value.length > 30) return t('auth.validation.usernameTooLong');
        if (!/^[a-z0-9_]+$/.test(value)) return t('auth.validation.usernameInvalid');
        return '';
      case 'email':
        if (!value.trim()) return t('auth.validation.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('auth.validation.invalidEmail');
        if (isTempMailEmail(value)) return t('auth.validation.tempMailBlocked');
        return '';
      case 'password': {
        const rules = getPasswordRules(value);
        const unmet = rules.filter(r => !r.met);
        if (unmet.length > 0) return t('auth.validation.passwordTooWeak');
        return '';
      }
      case 'confirmPassword':
        if (!value) return t('auth.validation.confirmPasswordRequired');
        if (value !== form.password) return t('auth.validation.passwordsDoNotMatch');
        return '';
      default:
        return '';
    }
  };

  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FieldErrors, boolean>>>({});
  const [showPass, setShowPass] = useState(false);
  const [showPassRules, setShowPassRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState<'form' | 'processing'>('form');
  const [emailApiError, setEmailApiError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);

  const errors = useMemo<FieldErrors>(() => ({
    displayName: validateField('displayName', form.displayName, form),
    username: validateField('username', form.username, form),
    email: validateField('email', form.email, form),
    password: validateField('password', form.password, form),
    confirmPassword: validateField('confirmPassword', form.confirmPassword, form),
  }), [form, t]);

  const isFormValid = Object.values(errors).every(e => !e) && !emailApiError && !emailChecking;

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
    if (field === 'email') setEmailApiError('');
  };

  const touch = (field: keyof FieldErrors) => () =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const handleEmailBlur = () => {
    touch('email')();
  };

  const showError = (field: keyof FieldErrors) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  const passwordRules = getPasswordRules(form.password);
  const strength = passwordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ displayName: true, username: true, email: true, password: true, confirmPassword: true });
    if (emailChecking) return;
    if (emailApiError) return;
    if (!isFormValid) return;

    setServerError('');
    setLoading(true);
    setStep('processing');

    try {
      const result = await signupUser(form.email, form.password, form.username, form.displayName);
      if (!result.success) {
        const errMsg = result.error || '';
        const errKey = getAuthErrorKey(errMsg);
        setServerError(errKey ? t(errKey) : errMsg || t('auth.validation.signupFailed'));
        setStep('form');
        return;
      }

      login({
        id: result.userId!,
        email: result.email!,
        username: result.username!,
        displayName: result.displayName!,
        avatarUrl: undefined,
        createdAt: Date.now()
      });
      showToast(t('auth.validation.signupSuccess'), 'success');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const key = getAuthErrorKey(msg);
      setServerError(key ? t(key) : msg || t('auth.validation.signupFailed'));
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setServerError('');
    setGoogleLoading(true);
    setStep('processing');
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
      showToast(t('auth.validation.signupSuccess'), 'success');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const key = getAuthErrorKey(msg);
      setServerError(key ? t(key) : msg || t('auth.validation.googleLoginFailed'));
      setStep('form');
    } finally {
      setGoogleLoading(false);
    }
  };

  if (step === 'processing') {
    return <SignupProcessingScreen serverError={serverError} t={t} language={language} />;
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-y-contain touch-pan-y bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-36 md:pt-safe md:pb-safe relative" style={{ WebkitOverflowScrolling: 'touch' }}>
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
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-4">
            <UserPlus className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.createAccount')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('auth.startJourney')}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
          {serverError && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Display Name */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.fullName')}</label>
                <span className={`text-xs ${form.displayName.length > 45 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {form.displayName.length}/50
                </span>
              </div>
              <input
                type="text"
                value={form.displayName}
                onChange={update('displayName')}
                onBlur={touch('displayName')}
                placeholder={t('auth.namePlaceholder')}
                maxLength={50}
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  showError('displayName') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'
                }`}
              />
              {showError('displayName') && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {showError('displayName')}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('auth.username')}
                  <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400 font-normal">({t('auth.usernameCannotChange')})</span>
                </label>
                <span className={`text-xs ${form.username.length > 27 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {form.username.length}/30
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 select-none">@</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => {
                    // Auto-lowercase, strip disallowed chars
                    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setForm(prev => ({ ...prev, username: cleaned }));
                  }}
                  onBlur={touch('username')}
                  placeholder={t('auth.usernamePlaceholder')}
                  maxLength={30}
                  autoComplete="username"
                  className={`w-full pl-8 pr-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    showError('username') ? 'border-red-400 dark:border-red-500' : touched.username && !errors.username ? 'border-green-400 dark:border-green-500' : 'border-gray-200 dark:border-slate-600'
                  }`}
                />
                {touched.username && !errors.username && form.username.length >= 3 && (
                  <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {showError('username') ? (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {showError('username')}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-400">{t('auth.usernameHint')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  onBlur={handleEmailBlur}
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                  className={`w-full px-4 py-3 pr-10 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    (showError('email') || emailApiError) ? 'border-red-400 dark:border-red-500' :
                    touched.email && !errors.email && !emailApiError && !emailChecking && form.email ? 'border-green-400 dark:border-green-500' :
                    'border-gray-200 dark:border-slate-600'
                  }`}
                />
                {emailChecking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                {!emailChecking && touched.email && !errors.email && !emailApiError && form.email && (
                  <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {(showError('email') || emailApiError) && (
                <p className="mt-1 text-xs text-red-500 flex items-start gap-1">
                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                  {showError('email') || emailApiError}
                </p>
              )}
              {emailChecking && (
                <p className="mt-1 text-xs text-blue-500">{t('auth.emailVerifying')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  onBlur={touch('password')}
                  onFocus={() => setShowPassRules(true)}
                  placeholder={t('auth.passPlaceholder')}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    showError('password') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'
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

              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-gray-200 dark:bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className={`text-xs font-medium ${
                      strength.score <= 2 ? 'text-red-500' :
                      strength.score === 3 ? 'text-yellow-600' :
                      strength.score === 4 ? 'text-blue-600' : 'text-green-600'
                    }`}>{t('auth.passwordStrength.label')} {strength.label}</p>
                  )}
                </div>
              )}

              {/* Password rules checklist */}
              {(showPassRules || form.password) && (
                <div className="mt-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 space-y-1">
                  {passwordRules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {rule.met
                        ? <Check size={12} className="text-green-500 shrink-0" />
                        : <X size={12} className="text-gray-400 shrink-0" />
                      }
                      <span className={rule.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.confirmPass')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  onBlur={touch('confirmPassword')}
                  placeholder={t('auth.confirmPassPlaceholder')}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    showError('confirmPassword') ? 'border-red-400 dark:border-red-500' :
                    form.confirmPassword && form.password === form.confirmPassword ? 'border-green-400 dark:border-green-500' :
                    'border-gray-200 dark:border-slate-600'
                  }`}
                />
                {form.confirmPassword && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {form.password === form.confirmPassword
                      ? <CheckCircle2 size={18} className="text-green-500" />
                      : <AlertCircle size={18} className="text-red-400" />
                    }
                  </span>
                )}
              </div>
              {showError('confirmPassword') && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {showError('confirmPassword')}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              <UserPlus size={18} />
              {t('auth.signupButton')}
            </button>
          </form>

          {false /* Google sign-in temporarily hidden on production — enabled on dev */ && (
          <><div className="mt-5 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-slate-800 text-gray-400">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
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

          <div className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('auth.hasAccount')}{' '}
            <button onClick={onLogin} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              {t('auth.loginButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
