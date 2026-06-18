import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { Logo } from '../components/Logo';
import { loginUser } from '../../services/githubAuthService';
import { signInUser } from '../utils/auth';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function SignInPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError(T(lang, 'ইমেইল এবং পাসওয়ার্ড দিন।', 'Enter email and password.'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const user = await loginUser(email, password);
      signInUser({ id: user.userId, email: user.email, username: user.username, displayName: user.displayName });
      onNav('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : T(lang, 'সাইন ইন ব্যর্থ হয়েছে।', 'Sign in failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell {...props}>
      <div style={{ minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:isMobile?'24px 16px':'48px 24px' }}>
        <form onSubmit={handleSubmit} style={{ width:'100%',maxWidth:420,background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:24,padding:isMobile?24:32,boxShadow:tk.shadowLg }}>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24 }}>
            <Logo tk={tk} size={52}/>
            <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:22,color:tk.text,margin:'14px 0 4px' }}>{T(lang,'সাইন ইন করুন','Sign in to KoyJabo')}</h1>
            <p style={{ fontFamily:BEN,fontSize:13,color:tk.textDim,margin:0 }}>{T(lang,'আপনার যাত্রা শুরু হোক','Start your journey')}</p>
          </div>

          {/* Email form */}
          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:20 }}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="Email" style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
            <div style={{ position:'relative' }}>
              <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder={T(lang,'পাসওয়ার্ড','Password')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 44px 12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
              <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:0,color:tk.textFaint,cursor:'pointer',fontSize:16 }}>
                {showPw?'👁️':'👁'}
              </button>
            </div>
            <div style={{ textAlign:'right' }}>
              <button type="button" onClick={()=>onNav('forgot-password')} style={{ background:'none',border:0,color:tk.primary,fontFamily:SANS,fontSize:12,fontWeight:600,cursor:'pointer' }}>
                {T(lang,'পাসওয়ার্ড ভুলে গেছেন?','Forgot password?')}
              </button>
            </div>
          </div>

          {error && <div style={{ background:tk.accentSoft,border:`1px solid ${tk.accent}55`,color:tk.accent,borderRadius:12,padding:'10px 12px',fontFamily:BEN,fontSize:13,marginBottom:14 }}>{error}</div>}

          <button type="submit" disabled={submitting} style={{ width:'100%',background:tk.primary,color:tk.primaryInk,border:0,borderRadius:14,padding:'13px 20px',fontFamily:SANS,fontWeight:700,fontSize:15,cursor:submitting?'wait':'pointer',marginBottom:16,boxShadow:`0 6px 16px -6px ${tk.primary}`,opacity:submitting?0.72:1 }}>
            {submitting ? T(lang,'সাইন ইন হচ্ছে...','Signing in...') : T(lang,'সাইন ইন করুন','Sign in')}
          </button>

          <div style={{ textAlign:'center',fontFamily:BEN,fontSize:13,color:tk.textDim }}>
            {T(lang,'অ্যাকাউন্ট নেই?','Don\'t have an account?')}{' '}
            <button onClick={()=>onNav('signup')} style={{ background:'none',border:0,color:tk.primary,fontFamily:BEN,fontSize:13,fontWeight:700,cursor:'pointer',padding:0 }}>
              {T(lang,'সাইন আপ করুন','Sign up')}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
