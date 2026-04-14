import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { signupUser } from '../../services/githubAuthService';
import { useAuth } from '../../contexts/AuthContext';

interface SignupPageProps {
  onLogin: () => void;
  onSuccess: () => void;
}

export default function SignupPage({ onLogin, onSuccess }: SignupPageProps) {
  const { login } = useAuth();
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'processing'>('form');

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = (): string => {
    if (!form.displayName.trim()) return 'পুরো নাম লিখুন।';
    if (!form.username.trim() || form.username.length < 3) return 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।';
    if (!/^[a-z0-9_.-]+$/i.test(form.username)) return 'ইউজারনেমে শুধু অক্ষর, সংখ্যা, _ ও . ব্যবহার করুন।';
    if (!form.email.includes('@')) return 'সঠিক ইমেইল দিন।';
    if (form.password.length < 8) return 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।';
    if (form.password !== form.confirmPassword) return 'পাসওয়ার্ড মিলছে না।';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError('');
    setLoading(true);
    setStep('processing');

    try {
      const result = await signupUser(form.email, form.password, form.username, form.displayName);
      if (!result.success) {
        setError(result.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
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
      setError(err instanceof Error ? err.message : 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-slate-600 animate-spin border-t-blue-600" />
            <Clock className="absolute inset-0 m-auto text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">অ্যাকাউন্ট তৈরি হচ্ছে</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            সুরক্ষিতভাবে প্রক্রিয়া করা হচ্ছে।<br />
            সর্বোচ্চ <strong>৯০ সেকেন্ড</strong> লাগতে পারে।<br />
            দয়া করে অপেক্ষা করুন…
          </p>
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-4">
            <UserPlus className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">অ্যাকাউন্ট খুলুন</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">কই যাবো — আপনার যাত্রা শুরু করুন</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">পুরো নাম</label>
              <input
                type="text"
                value={form.displayName}
                onChange={update('displayName')}
                placeholder="আপনার নাম"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ইউজারনেম</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 select-none">@</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={update('username')}
                  placeholder="username"
                  required
                  minLength={3}
                  pattern="[a-zA-Z0-9_.]+"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ইমেইল</label>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="কমপক্ষে ৮ অক্ষর"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">পাসওয়ার্ড নিশ্চিত করুন</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              <UserPlus size={18} />
              অ্যাকাউন্ট তৈরি করুন
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <button onClick={onLogin} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              লগইন করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
