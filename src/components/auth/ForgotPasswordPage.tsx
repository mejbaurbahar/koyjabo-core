import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Clock, RefreshCw, ExternalLink } from 'lucide-react';
import { forgotPassword, checkResetStatus } from '../../services/githubAuthService';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

type Stage = 'form' | 'processing' | 'sent' | 'done';

export default function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('form');
  const [error, setError] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [fallbackLink, setFallbackLink] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Poll every 5s for reset completion (detects when user resets in another tab/browser)
  useEffect(() => {
    if (stage !== 'sent' || !sessionToken) return;

    const poll = async () => {
      const status = await checkResetStatus(sessionToken);
      if (status.used) {
        setStage('done');
        return;
      }
      if (status.expired) {
        setError(t('auth.forgotPasswordPage.resetLinkExpired'));
        setStage('form');
        return;
      }
      pollRef.current = setTimeout(poll, 5000);
    };

    pollRef.current = setTimeout(poll, 5000);
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [stage, sessionToken]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  // Auto-redirect to login after password is reset
  useEffect(() => {
    if (stage !== 'done') return;
    const id = setTimeout(onBack, 3000);
    return () => clearTimeout(id);
  }, [stage, onBack]);

  const sendLink = async (emailAddr: string) => {
    setError('');
    setStage('processing');
    try {
      const result = await forgotPassword(emailAddr);
      if (!result.success) {
        setError(result.error || t('auth.forgotPasswordPage.errorTryAgain'));
        setStage('form');
        return;
      }
      setSessionToken(result.sessionToken || '');
      setFallbackLink((result as any).resetLink || '');
      setResendCooldown(60);
      setStage('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.validation.somethingWentWrong'));
      setStage('form');
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    sendLink(email.trim().toLowerCase());
  };

  const handleResend = () => {
    if (resendCooldown > 0 || !email) return;
    sendLink(email.trim().toLowerCase());
  };

  // ── Done ──
  if (stage === 'done') {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="bg-kj-panel rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
          <CheckCircle2 size={52} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-kj-text mb-2">{t('auth.forgotPasswordPage.passwordReset')}</h2>
          <p className="text-kj-text-dim text-sm">{t('auth.forgotPasswordPage.passwordUpdated')}</p>
        </div>
      </div>
    );
  }

  // ── Processing ──
  if (stage === 'processing') {
    return (
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="bg-kj-panel rounded-2xl shadow-xl p-10 max-w-xs w-full text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-slate-600 animate-spin border-t-blue-600" />
            <Clock className="absolute inset-0 m-auto text-blue-600 dark:text-blue-400" size={18} />
          </div>
          <h2 className="text-lg font-bold text-kj-text mb-2">{t('auth.forgotPasswordPage.sendingLink')}</h2>
          <p className="text-sm text-kj-text-dim">{t('auth.forgotPasswordPage.maxWait')}</p>
        </div>
      </div>
    );
  }

  // ── Sent — waiting for user to click link ──
  if (stage === 'sent') {
    return (
      <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-y-contain touch-pan-y bg-kj-panel md:bg-gradient-to-br md:from-blue-50 md:via-white md:to-indigo-50 md:dark:from-slate-900 md:dark:via-slate-800 md:dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-28 md:pt-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-4">
              <Mail className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-kj-text">{t('auth.forgotPasswordPage.checkEmail')}</h1>
            <p className="text-kj-text-dim mt-1 text-sm">
              {t('auth.forgotPasswordPage.sentLinkTo')} <strong className="text-kj-text-dim">{email}</strong>
            </p>
          </div>

          <div className="md:bg-white md:dark:bg-kj-chip-bg md:rounded-2xl md:shadow-xl md:p-8 md:border md:border-kj-line md:dark:border-kj-line">
            {error && (
              <div className="mx-6 md:mx-0 mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="p-6 md:p-0 space-y-5">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-blue-400 animate-spin border-t-transparent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('auth.forgotPasswordPage.waitingForClick')}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{t('auth.forgotPasswordPage.pageUpdatesAuto')}</p>
                </div>
              </div>

              {fallbackLink && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-2">{t('auth.forgotPasswordPage.emailNotConfigured')}</p>
                  <a
                    href={fallbackLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline break-all"
                  >
                    <ExternalLink size={14} className="flex-shrink-0" />
                    {fallbackLink}
                  </a>
                </div>
              )}

              <div className="text-center pt-2">
                <p className="text-sm text-kj-text-dim mb-2">{t('auth.forgotPasswordPage.didntReceive')}</p>
                {resendCooldown > 0 ? (
                  <p className="text-sm text-kj-text-faint">{t('auth.forgotPasswordPage.resendIn', { seconds: resendCooldown })}</p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1 mx-auto"
                  >
                    <RefreshCw size={14} />
                    {t('auth.forgotPasswordPage.resendLink')}
                  </button>
                )}
              </div>

              <button
                onClick={onBack}
                className="w-full py-2.5 rounded-xl border border-kj-line dark:border-slate-600 text-kj-text-dim text-sm font-medium hover:bg-kj-chip-bg dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                {t('auth.forgotPasswordPage.returnToLogin')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-y-contain touch-pan-y bg-kj-panel md:bg-gradient-to-br md:from-blue-50 md:via-white md:to-indigo-50 md:dark:from-slate-900 md:dark:via-slate-800 md:dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-28 md:pt-4" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-2 text-kj-text-dim hover:text-kj-text-dim dark:text-kj-text-faint dark:hover:text-gray-200 mb-6 transition"
        >
          <ArrowLeft size={18} />
          {t('auth.forgotPasswordPage.returnToLogin')}
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-4">
            <Mail className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-kj-text">{t('auth.forgotPasswordPage.passwordReset')}</h1>
          <p className="text-kj-text-dim mt-1">{t('auth.forgotPasswordPage.description')}</p>
        </div>

        <div className="md:bg-white md:dark:bg-kj-chip-bg md:rounded-2xl md:shadow-xl md:p-8 md:border md:border-kj-line md:dark:border-kj-line">
          {error && (
            <div className="mx-6 md:mx-0 mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-5 p-6 md:p-0">
            <div>
              <label className="block text-sm font-medium text-kj-text-dim mb-1.5">
                {t('auth.forgotPasswordPage.registeredEmail')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-kj-line dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-kj-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Mail size={18} />
              {t('auth.forgotPasswordPage.sendLink')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
