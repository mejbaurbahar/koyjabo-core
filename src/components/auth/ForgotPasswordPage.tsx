import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Clock, Copy, ExternalLink } from 'lucide-react';
import { forgotPassword } from '../../services/githubAuthService';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onResetPassword: (token: string) => void;
}

export default function ForgotPasswordPage({ onBack, onResetPassword }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<'form' | 'processing' | 'done'>('form');
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setStage('processing');

    try {
      const result = await forgotPassword(email);
      if (!result.success) {
        setError(result.error || 'কিছু সমস্যা হয়েছে।');
        setStage('form');
        return;
      }
      if (result.resetUrl) {
        setResetUrl(result.resetUrl);
        setResetToken(result.resetToken || '');
      }
      setStage('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'কিছু সমস্যা হয়েছে।');
      setStage('form');
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (stage === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-16 pb-24 md:pt-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 max-w-sm w-full text-center mt-12 md:mt-0">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-slate-600 animate-spin border-t-blue-600" />
            <Clock className="absolute inset-0 m-auto text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">প্রক্রিয়া করা হচ্ছে</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">সর্বোচ্চ ৯০ সেকেন্ড লাগতে পারে…</p>
        </div>
      </div>
    );
  }

  if (stage === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-16 pb-24 md:pt-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center mt-8 md:mt-0">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">রিসেট লিংক তৈরি!</h2>

          {resetUrl ? (
            <>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                ইমেইল সেবা সেট না থাকায় নিচের লিংক ব্যবহার করুন। এটি <strong>১ ঘন্টা</strong> পর মেয়াদোত্তীর্ণ হবে।
              </p>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-xs text-left font-mono text-gray-700 dark:text-gray-300 break-all mb-4">
                {resetUrl}
              </div>
              <div className="flex gap-2 mb-6">
                <button
                  onClick={copyLink}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-2"
                >
                  {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  {copied ? 'কপি হয়েছে!' : 'কপি করুন'}
                </button>
                <button
                  onClick={() => resetToken && onResetPassword(resetToken)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  রিসেট করুন
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              যদি ইমেইল রেজিস্টার্ড হয়ে থাকে, ইনবক্সে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।
              স্প্যাম ফোল্ডারও চেক করুন।
            </p>
          )}

          <button
            onClick={onBack}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm"
          >
            লগইন পেজে ফিরুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-12 pb-28 md:pt-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition"
        >
          <ArrowLeft size={18} />
          লগইনে ফিরুন
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-4">
            <Mail className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">পাসওয়ার্ড রিসেট</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">আপনার ইমেইল দিয়ে রিসেট লিংক পান</p>
        </div>

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
                রেজিস্টার্ড ইমেইল
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

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Loader2 size={18} className="hidden" />
              <Mail size={18} />
              রিসেট লিংক পাঠান
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
