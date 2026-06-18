import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { Logo } from '../components/Logo';
import { forgotPassword, resetPassword } from '../../services/githubAuthService';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function ForgotPasswordPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const resetToken = params?.token || params?.resetToken || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setError(T(lang, 'ইমেইল দিন।', 'Enter your email.'));
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const result = await forgotPassword(email);
      if (!result.success) throw new Error(result.error || T(lang, 'রিকভারি ইমেইল পাঠানো যায়নি।', 'Could not send recovery email.'));
      setMessage(result.resetUrl
        ? T(lang, 'রিকভারি লিংক তৈরি হয়েছে। ইমেইল চেক করুন বা নিচের লিংক ব্যবহার করুন।', 'Recovery link created. Check email or use the link below.')
        : T(lang, 'রিকভারি নির্দেশনা ইমেইলে পাঠানো হয়েছে।', 'Recovery instructions sent to your email.'));
      if (result.resetUrl) setMessage(`${result.resetUrl}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : T(lang, 'রিকভারি ইমেইল পাঠানো যায়নি।', 'Could not send recovery email.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || !confirmPassword) {
      setError(T(lang, 'নতুন পাসওয়ার্ড দিন।', 'Enter new password.'));
      return;
    }
    if (password !== confirmPassword) {
      setError(T(lang, 'পাসওয়ার্ড মেলেনি।', 'Passwords do not match.'));
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const result = await resetPassword(resetToken, password);
      if (!result.success) throw new Error(result.error || T(lang, 'পাসওয়ার্ড রিসেট হয়নি।', 'Password reset failed.'));
      setMessage(T(lang, 'পাসওয়ার্ড রিসেট হয়েছে। এখন সাইন ইন করুন।', 'Password reset complete. Sign in now.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : T(lang, 'পাসওয়ার্ড রিসেট হয়নি।', 'Password reset failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell {...props} canBack={false}>
      <div style={{ minHeight:'64vh',display:'flex',alignItems:'center',justifyContent:'center',padding:isMobile?'24px 16px':'48px 24px' }}>
        <form onSubmit={resetToken ? handleResetPassword : handleRequestReset} style={{ width:'100%',maxWidth:440,background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:24,padding:isMobile?24:32,boxShadow:tk.shadowLg }}>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24,textAlign:'center' }}>
            <Logo tk={tk} size={52}/>
            <h1 style={{ fontFamily:BEN,fontWeight:800,fontSize:22,color:tk.text,margin:'14px 0 6px' }}>
              {resetToken ? T(lang,'নতুন পাসওয়ার্ড দিন','Set new password') : T(lang,'পাসওয়ার্ড রিকভার করুন','Recover password')}
            </h1>
            <p style={{ fontFamily:BEN,fontSize:13,color:tk.textDim,margin:0,lineHeight:1.55 }}>
              {resetToken
                ? T(lang,'নতুন পাসওয়ার্ড দিয়ে অ্যাকাউন্ট সুরক্ষিত করুন।','Secure your account with a new password.')
                : T(lang,'আপনার ইমেইল দিন। আমরা রিসেট নির্দেশনা পাঠাবো।','Enter your email. We will send reset instructions.')}
            </p>
          </div>

          {!resetToken ? (
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="Email" style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:14 }}/>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:14 }}>
              <div style={{ position:'relative' }}>
                <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" placeholder={T(lang,'নতুন পাসওয়ার্ড','New password')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 44px 12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
                <button type="button" onClick={()=>setShowPassword(p=>!p)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:0,color:tk.textFaint,cursor:'pointer',fontSize:16 }}>
                  {showPassword?'👁️':'👁'}
                </button>
              </div>
              <input type={showPassword?'text':'password'} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder={T(lang,'পাসওয়ার্ড নিশ্চিত করুন','Confirm password')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
            </div>
          )}

          {error && <div style={{ background:tk.accentSoft,border:`1px solid ${tk.accent}55`,color:tk.accent,borderRadius:12,padding:'10px 12px',fontFamily:BEN,fontSize:13,marginBottom:14 }}>{error}</div>}
          {message && <div style={{ background:tk.primarySoft,border:`1px solid ${tk.primary}55`,color:tk.primary,borderRadius:12,padding:'10px 12px',fontFamily:BEN,fontSize:13,marginBottom:14,wordBreak:'break-word' }}>{message}</div>}

          <button type="submit" disabled={submitting} style={{ width:'100%',background:tk.primary,color:tk.primaryInk,border:0,borderRadius:14,padding:'13px 20px',fontFamily:SANS,fontWeight:800,fontSize:15,cursor:submitting?'wait':'pointer',boxShadow:`0 6px 16px -6px ${tk.primary}`,opacity:submitting?0.72:1 }}>
            {submitting ? T(lang,'প্রসেস হচ্ছে...','Processing...') : resetToken ? T(lang,'পাসওয়ার্ড রিসেট করুন','Reset password') : T(lang,'রিকভারি ইমেইল পাঠান','Send recovery email')}
          </button>

          <button type="button" onClick={()=>onNav('signin')} style={{ width:'100%',marginTop:14,background:'none',border:0,color:tk.primary,fontFamily:BEN,fontSize:13,fontWeight:800,cursor:'pointer' }}>
            {T(lang,'সাইন ইনে ফিরুন','Back to sign in')}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
