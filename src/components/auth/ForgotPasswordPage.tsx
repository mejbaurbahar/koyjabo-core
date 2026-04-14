import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Clock, Copy, ExternalLink } from 'lucide-react';
import { forgotPassword } from '../../services/githubAuthService';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onResetPassword: (token: string) => void;
}

export default function ForgotPasswordPage({ onBack, onResetPassword }: ForgotPasswordPageProps) {
  const { t } = useLanguage();
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
        setError(result.error || t('auth.validation.somethingWentWrong'));
        setStage('form');
        return;
      }
      if (result.resetUrl) {
        setResetUrl(result.resetUrl);
        setResetToken(result.resetToken || '');
      }
      setStage('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.validation.somethingWentWrong'));
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
      <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-16 pb-24 md:pt-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 max-w-sm w-full text-center mt-12 md:mt-0">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-slate-600 animate-spin border-t-blue-600" />
            <Clock className="absolute inset-0 m-auto text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('auth.forgotPasswordPage.processing')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('auth.forgotPasswordPage.maxWait')}</p>
        </div>
      </div>
    );
  }

  if (stage === 'done') {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-16 pb-24 md:pt-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center mt-8 md:mt-0">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.forgotPasswordPage.resetLinkCreated')}</h2>

          {resetUrl ? (
            <>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {t('auth.forgotPasswordPage.useLinkBelow')}
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
                  {copied ? t('auth.forgotPasswordPage.copied') : t('auth.forgotPasswordPage.copyLink')}
                </button>
                <button
                  onClick={() => resetToken && onResetPassword(resetToken)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  {t('auth.forgotPasswordPage.resetNow')}
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {t('auth.forgotPasswordPage.emailSentInfo')}
            </p>
          )}

          <button
            onClick={onBack}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm"
          >
            {t('auth.forgotPasswordPage.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-28 md:pt-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition"
        >
          <ArrowLeft size={18} />
          {t('auth.forgotPasswordPage.returnToLogin')}
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-4">
            <Mail className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.forgotPasswordPage.passwordReset')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('auth.forgotPasswordPage.getResetLink')}</p>
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
                {t('auth.forgotPasswordPage.registeredEmail')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {stage === 'processing' ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
              {t('auth.forgotPasswordPage.sendResetLink')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
