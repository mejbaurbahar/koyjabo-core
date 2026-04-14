import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Clock, X, Check } from 'lucide-react';
import { signupUser } from '../../services/githubAuthService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SignupPageProps {
  onLogin: () => void;
  onSuccess: () => void;
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

function getPasswordRules(password: string): PasswordRule[] {
  return [
    { label: 'কমপক্ষে ৮ অক্ষর', met: password.length >= 8 },
    { label: 'একটি বড় হাতের অক্ষর (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'একটি ছোট হাতের অক্ষর (a-z)', met: /[a-z]/.test(password) },
    { label: 'একটি সংখ্যা (0-9)', met: /[0-9]/.test(password) },
    { label: 'একটি বিশেষ চিহ্ন (!@#$%...)', met: /[^a-zA-Z0-9]/.test(password) },
  ];
}

function passwordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  const rules = getPasswordRules(password);
  const met = rules.filter(r => r.met).length;
  if (met <= 2) return { score: met, label: 'দুর্বল', color: 'bg-red-500' };
  if (met === 3) return { score: met, label: 'মাঝারি', color: 'bg-yellow-500' };
  if (met === 4) return { score: met, label: 'ভালো', color: 'bg-blue-500' };
  return { score: met, label: 'শক্তিশালী', color: 'bg-green-500' };
}

function validateField(name: keyof FieldErrors, value: string, form: Record<string, string>): string {
  switch (name) {
    case 'displayName':
      if (!value.trim()) return 'পুরো নাম লিখুন।';
      if (value.trim().length < 2) return 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।';
      if (value.length > 50) return 'নাম সর্বোচ্চ ৫০ অক্ষরের হতে পারে।';
      return '';
    case 'username':
      if (!value.trim()) return 'ইউজারনেম লিখুন।';
      if (value.length < 3) return 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।';
      if (value.length > 20) return 'ইউজারনেম সর্বোচ্চ ২০ অক্ষরের হতে পারে।';
      if (!/^[a-zA-Z0-9_.]+$/.test(value)) return 'শুধু অক্ষর, সংখ্যা, _ ও . ব্যবহার করুন।';
      return '';
    case 'email':
      if (!value.trim()) return 'ইমেইল লিখুন।';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'সঠিক ইমেইল দিন।';
      return '';
    case 'password': {
      const rules = getPasswordRules(value);
      const unmet = rules.filter(r => !r.met);
      if (unmet.length > 0) return 'পাসওয়ার্ড শক্তিশালী করুন (নিচের শর্তগুলো পূরণ করুন)।';
      return '';
    }
    case 'confirmPassword':
      if (!value) return 'পাসওয়ার্ড নিশ্চিত করুন।';
      if (value !== form.password) return 'পাসওয়ার্ড মিলছে না।';
      return '';
    default:
      return '';
  }
}

export default function SignupPage({ onLogin, onSuccess }: SignupPageProps) {
  const { login } = useAuth();
  const { t } = useLanguage();
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
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState<'form' | 'processing'>('form');

  const errors = useMemo<FieldErrors>(() => ({
    displayName: validateField('displayName', form.displayName, form),
    username: validateField('username', form.username, form),
    email: validateField('email', form.email, form),
    password: validateField('password', form.password, form),
    confirmPassword: validateField('confirmPassword', form.confirmPassword, form),
  }), [form]);

  const isFormValid = Object.values(errors).every(e => !e);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const touch = (field: keyof FieldErrors) => () =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const showError = (field: keyof FieldErrors) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  const passwordRules = getPasswordRules(form.password);
  const strength = passwordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields to show errors
    setTouched({ displayName: true, username: true, email: true, password: true, confirmPassword: true });
    if (!isFormValid) return;

    setServerError('');
    setLoading(true);
    setStep('processing');

    try {
      const result = await signupUser(form.email, form.password, form.username, form.displayName);
      if (!result.success) {
        setServerError(result.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
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
      onSuccess();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen h-screen overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-4 pt-safe pb-safe">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-slate-600 animate-spin border-t-blue-600" />
            <Clock className="absolute inset-0 m-auto text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('auth.creatingAccountTitle')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
            {t('auth.processingWait')}
          </p>
          {serverError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-4 pt-safe pb-safe">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.username')}</label>
                <span className={`text-xs ${form.username.length > 17 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {form.username.length}/20
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 select-none">@</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={update('username')}
                  onBlur={touch('username')}
                  placeholder="username"
                  maxLength={20}
                  className={`w-full pl-8 pr-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    showError('username') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'
                  }`}
                />
              </div>
              {showError('username') && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {showError('username')}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                onBlur={touch('email')}
                placeholder="your@email.com"
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  showError('email') ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-slate-600'
                }`}
              />
              {showError('email') && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {showError('email')}
                </p>
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
                    }`}>পাসওয়ার্ড: {strength.label}</p>
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

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
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
