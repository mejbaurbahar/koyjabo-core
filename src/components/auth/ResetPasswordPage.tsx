import React, { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';
import { resetPassword, getAuthErrorKey } from '../../services/githubAuthService';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ResetPasswordPageProps {
  token: string;
  onSuccess: () => void;
}

export default function ResetPasswordPage({ token, onSuccess }: ResetPasswordPageProps) {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [stage, setStage] = useState<'form' | 'processing' | 'done'>('form');
  const [error, setError] = useState('');

  // Auto-clear success after 3s and redirect
  useEffect(() => {
    if (stage === 'done') {
      const timer = setTimeout(onSuccess, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError(t('auth.validation.passwordTooWeak')); return; }
    if (password !== confirm) { setError(t('auth.validation.passwordsDoNotMatch')); return; }
    if (!token) { setError(t('auth.tokenNotFound')); return; }

    setError('');
    setStage('processing');

    try {
      const result = await resetPassword(token, password);
      if (!result.success) {
        const errMsg = result.error || '';
        const errKey = getAuthErrorKey(errMsg);
        setError(errKey ? t(errKey) : errMsg || t('auth.validation.somethingWentWrong'));
        setStage('form');
        return;
      }
      setStage('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const key = getAuthErrorKey(msg);
      setError(key ? t(key) : msg || t('auth.validation.somethingWentWrong'));
      setStage('form');
    }
  };

  if (stage === 'processing') {
    return (
      <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-y-contain touch-pan-y bg-kj-bg flex flex-col items-center justify-start md:justify-center p-4 pt-10" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="bg-kj-panel rounded-2xl shadow-xl p-10 max-w-sm w-full text-center mt-12 md:mt-0">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-kj-line animate-spin border-t-blue-600" />
            <Clock className="absolute inset-0 m-auto text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-bold text-kj-text mb-2">{t('auth.resettingPassword')}</h2>
          <p className="text-kj-text-dim text-sm">{t('auth.forgotPasswordPage.maxWait')}</p>
        </div>
      </div>
    );
  }

  if (stage === 'done') {
    return (
      <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-y-contain touch-pan-y bg-kj-bg flex flex-col items-center justify-start md:justify-center p-4 pt-10" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="bg-kj-panel rounded-2xl shadow-xl p-10 max-w-sm w-full text-center mt-12 md:mt-0">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-kj-text mb-2">{t('profile.passwordChanged')}</h2>
          <p className="text-kj-text-dim text-sm">{t('auth.redirectingToLogin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-y-contain touch-pan-y bg-kj-bg flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-28 md:pt-4" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-kj-primary to-kj-primary-deep kj-glow mb-4">
            <KeyRound className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-kj-text">{t('auth.resetPasswordTitle')}</h1>
        </div>

        <div className="dc-card kj-glass rounded-2xl p-8 border border-kj-line">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-kj-accent-soft border border-kj-accent/30 flex items-start gap-2">
              <AlertCircle size={16} className="text-kj-accent mt-0.5 shrink-0" />
              <p className="text-sm text-kj-accent">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-kj-text-dim mb-1.5">{t('profile.newPassword')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('auth.passPlaceholder')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-kj-line border-kj-line bg-kj-input-bg text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:ring-2 focus:ring-kj-primary/40 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-kj-text-faint hover:text-kj-text-dim p-1">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-kj-text-dim mb-1.5">{t('profile.confirmNewPassword')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder={t('auth.confirmPassPlaceholder')}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-kj-line border-kj-line bg-kj-input-bg text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:ring-2 focus:ring-kj-primary/40 focus:border-transparent transition"
                />
                {confirm && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {password === confirm
                      ? <CheckCircle2 size={18} className="text-green-500" />
                      : <AlertCircle size={18} className="text-red-400" />}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-kj-primary hover:brightness-110 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <KeyRound size={18} />
              {t('auth.setPasswordBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
