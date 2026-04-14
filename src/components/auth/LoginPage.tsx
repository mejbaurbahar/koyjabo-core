import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { loginUser } from '../../services/githubAuthService';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAvatar } from '../../services/githubAuthService';

interface LoginPageProps {
  onSignup: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
}

export default function LoginPage({ onSignup, onForgotPassword, onSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
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

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-4">
            <LogIn className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">স্বাগতম!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                ইমেইল
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  যাচাই করা হচ্ছে...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  লগইন করুন
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            অ্যাকাউন্ট নেই?{' '}
            <button
              onClick={onSignup}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              রেজিস্ট্রেশন করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
