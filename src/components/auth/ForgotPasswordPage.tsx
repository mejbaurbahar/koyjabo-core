import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Clock, ShieldCheck, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { forgotPassword, verifyOtp, resetPassword, getAuthErrorKey } from '../../services/githubAuthService';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onResetPassword: (token: string) => void;
}

type Stage = 'form' | 'processing' | 'verify' | 'resetting' | 'reset' | 'done';

function ProcessingScreen({ stage, t, language }: { stage: Stage; t: (k: string) => string; language: string }) {
  const isResetting = stage === 'resetting';
  const bnMessages = isResetting
    ? ['নতুন পাসওয়ার্ড সেট করা হচ্ছে…', 'নিরাপত্তা যাচাই হচ্ছে…', 'প্রায় হয়ে গেছে…']
    : ['আপনার ইমেইল যাচাই করা হচ্ছে…', 'যাচাই কোড তৈরি হচ্ছে…', 'ইমেইল পাঠানো হচ্ছে…', 'প্রায় হয়ে গেছে…'];
  const enMessages = isResetting
    ? ['Setting new password…', 'Verifying security…', 'Almost done…']
    : ['Verifying your email…', 'Generating verification code…', 'Sending email…', 'Almost done…'];
  const messages = language === 'bn' ? bnMessages : enMessages;
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 3500);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 max-w-xs w-full text-center">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-slate-600 animate-spin border-t-blue-600" />
          <div className="absolute inset-2 rounded-full border-4 border-indigo-100 dark:border-slate-700 animate-spin border-b-indigo-500 [animation-direction:reverse] [animation-duration:1.4s]" />
          <Clock className="absolute inset-0 m-auto text-blue-600 dark:text-blue-400" size={18} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('auth.forgotPasswordPage.processing')}</h2>
        <p key={msgIdx} className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3 animate-in fade-in duration-500">
          {messages[msgIdx]}
        </p>
        <div className="flex justify-center gap-2">
          {messages.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === msgIdx ? 'bg-blue-600 scale-125' : i < msgIdx ? 'bg-blue-300' : 'bg-gray-200 dark:bg-slate-600'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('form');
  const [error, setError] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [fallbackOtp, setFallbackOtp] = useState('');

  // OTP verify stage
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password reset stage
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setStage('processing');
    try {
      const result = await forgotPassword(email);
      if (!result.success) {
        const key = getAuthErrorKey(result.error || '');
        setError(key ? t(key) : result.error || t('auth.validation.somethingWentWrong'));
        setStage('form');
        return;
      }
      if (result.sessionToken) setSessionToken(result.sessionToken);
      if (result.otp) setFallbackOtp(result.otp); // dev fallback when SMTP not set
      setResendCooldown(60);
      setStage('verify');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const key = getAuthErrorKey(msg);
      setError(key ? t(key) : msg || t('auth.validation.somethingWentWrong'));
      setStage('form');
    }
  };

  const handleOtpInput = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[i] = val.slice(-1);
    setOtpDigits(next);
    if (val && i < 5) otpRefs[i + 1].current?.focus();
    if (next.every(d => d !== '')) {
      verifyCode(next.join(''));
    }
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      otpRefs[i - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split('');
      setOtpDigits(next);
      otpRefs[5].current?.focus();
      verifyCode(pasted);
    }
  };

  const verifyCode = async (otp: string) => {
    if (!sessionToken) return;
    setError('');
    setStage('resetting'); // reuse the processing spinner
    try {
      const result = await verifyOtp(sessionToken, otp);
      if (!result.success) {
        setError(result.error || 'Incorrect code. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        setStage('verify');
        setTimeout(() => otpRefs[0].current?.focus(), 100);
        return;
      }
      setStage('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.validation.somethingWentWrong'));
      setOtpDigits(['', '', '', '', '', '']);
      setStage('verify');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setOtpDigits(['', '', '', '', '', '']);
    setStage('processing');
    try {
      const result = await forgotPassword(email);
      if (result.sessionToken) setSessionToken(result.sessionToken);
      if (result.otp) setFallbackOtp(result.otp);
      setResendCooldown(60);
      setStage('verify');
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch {
      setStage('verify');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError(t('auth.validation.passwordTooWeak'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('auth.validation.passwordMismatch') || 'Passwords do not match.');
      return;
    }
    setStage('resetting');
    try {
      const result = await resetPassword(sessionToken, newPassword);
      if (!result.success) {
        const key = getAuthErrorKey(result.error || '');
        setError(key ? t(key) : result.error || t('auth.validation.somethingWentWrong'));
        setStage('reset');
        return;
      }
      setStage('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(getAuthErrorKey(msg) ? t(getAuthErrorKey(msg)!) : msg || t('auth.validation.somethingWentWrong'));
      setStage('reset');
    }
  };

  if (stage === 'processing' || stage === 'resetting') {
    return <ProcessingScreen stage={stage} t={t} language={language} />;
  }

  if (stage === 'done') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
          <CheckCircle2 size={52} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Changed!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your password has been updated successfully. You can now log in with your new password.</p>
          <button onClick={onBack} className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'reset') {
    return (
      <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-blue-50 md:via-white md:to-indigo-50 md:dark:from-slate-900 md:dark:via-slate-800 md:dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-28 md:pt-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 shadow-lg shadow-green-200 dark:shadow-green-900 mb-4">
              <Lock className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Choose a strong password for your account</p>
          </div>

          <div className="md:bg-white md:dark:bg-slate-800 md:rounded-2xl md:shadow-xl md:p-8 md:border md:border-gray-100 md:dark:border-slate-700">
            {error && (
              <div className="mx-6 md:mx-0 mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
            <form onSubmit={handlePasswordReset} className="space-y-5 p-6 md:p-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck size={18} />
                Set New Password
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'verify') {
    const otp = otpDigits.join('');
    return (
      <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-blue-50 md:via-white md:to-indigo-50 md:dark:from-slate-900 md:dark:via-slate-800 md:dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-28 md:pt-4">
        <div className="w-full max-w-md">
          <button onClick={() => setStage('form')} className="md:hidden flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition">
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-4">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Verification Code</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              We sent a 6-digit code to <strong className="text-gray-700 dark:text-gray-300">{email}</strong>
            </p>
          </div>

          <div className="md:bg-white md:dark:bg-slate-800 md:rounded-2xl md:shadow-xl md:p-8 md:border md:border-gray-100 md:dark:border-slate-700">
            {error && (
              <div className="mx-6 md:mx-0 mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {fallbackOtp && (
              <div className="mx-6 md:mx-0 mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Email not configured — dev fallback:</p>
                <p className="text-2xl font-mono font-bold text-amber-800 dark:text-amber-300 tracking-widest text-center">{fallbackOtp}</p>
              </div>
            )}

            <div className="p-6 md:p-0">
              <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition"
                  />
                ))}
              </div>

              <button
                onClick={() => otp.length === 6 && verifyCode(otp)}
                disabled={otp.length !== 6}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm mb-4"
              >
                <ShieldCheck size={18} />
                Verify Code
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Didn't receive the code?</p>
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">Resend in {resendCooldown}s</p>
                ) : (
                  <button onClick={handleResend} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1 mx-auto">
                    <RefreshCw size={14} />
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">Code expires in 15 minutes</p>
        </div>
      </div>
    );
  }

  // Stage: 'form' — email input
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-blue-50 md:via-white md:to-indigo-50 md:dark:from-slate-900 md:dark:via-slate-800 md:dark:to-slate-900 flex flex-col items-center justify-start md:justify-center p-4 pt-10 pb-28 md:pt-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="md:hidden flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition">
          <ArrowLeft size={18} />
          {t('auth.forgotPasswordPage.returnToLogin')}
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900 mb-4">
            <Mail className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.forgotPasswordPage.passwordReset')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive a verification code</p>
        </div>

        <div className="md:bg-white md:dark:bg-slate-800 md:rounded-2xl md:shadow-xl md:p-8 md:border md:border-gray-100 md:dark:border-slate-700">
          {error && (
            <div className="mx-6 md:mx-0 mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-5 p-6 md:p-0">
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
              <Mail size={18} />
              Send Verification Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
