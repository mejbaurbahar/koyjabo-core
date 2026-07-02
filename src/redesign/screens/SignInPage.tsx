import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdCluster } from '../components/AdSlot';
import { Logo } from '../components/Logo';
import { Turnstile } from '../components/Turnstile';
import { loginUser } from '../../services/githubAuthService';
import { useAuth } from '../../contexts/AuthContext';
import { checkRateLimit, getRateLimitRemainingMs, sanitizeFormField } from '../../utils/security';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function SignInPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cfToken, setCfToken] = useState('');

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const allowed = checkRateLimit('signin:' + email.trim(), 5, 15 * 60 * 1000);
    if (!allowed) {
      const wait = Math.ceil(getRateLimitRemainingMs('signin:' + email.trim()) / 60000);
      setError(T(lang, `অনেকবার চেষ্টা করা হয়েছে। ${wait} মিনিট পরে চেষ্টা করুন।`, `Too many attempts. Try again in ${wait} minute(s).`));
      return;
    }
    if (!email.trim() || !password) return;
    if (!cfToken) { setError(T(lang, 'নিরাপত্তা যাচাই সম্পন্ন করুন', 'Please complete the security check')); return; }
    setLoading(true);
    setError('');
    try {
      const result = await loginUser(sanitizeFormField(email, 'email'), password);
      login({
        id: result.userId,
        email: result.email,
        username: result.username,
        displayName: result.displayName,
        createdAt: Date.now(),
        provider: 'manual',
        hasPassword: true,
      });
      onNav('profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : T(lang, 'সাইন ইন ব্যর্থ হয়েছে', 'Sign in failed'));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading && cfToken.length > 0;

  return (
    <PageShell {...props}>
      <div style={{ minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:isMobile?'24px 16px':'48px 24px' }}>
        <form onSubmit={handleSignIn} style={{ width:'100%',maxWidth:420,background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:24,padding:isMobile?24:32,boxShadow:tk.shadowLg }}>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24 }}>
            <Logo tk={tk} size={52}/>
            <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:22,color:tk.text,margin:'14px 0 4px' }}>{T(lang,'সাইন ইন করুন','Sign in to KoyJabo')}</h1>
            <p style={{ fontFamily:BEN,fontSize:13,color:tk.textDim,margin:0 }}>{T(lang,'আপনার যাত্রা শুরু হোক','Start your journey')}</p>
          </div>

          {error && (
            <div style={{ background:`${tk.accent}18`,border:`1px solid ${tk.accent}44`,borderRadius:10,padding:'10px 14px',marginBottom:16,fontFamily:SANS,fontSize:13,color:tk.accent }}>
              {error}
            </div>
          )}

          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:20 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
              style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box',opacity:loading?0.6:1 }}
            />
            <div style={{ position:'relative' }}>
              <input
                type={showPw?'text':'password'}
                placeholder={T(lang,'পাসওয়ার্ড','Password')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
                style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box',opacity:loading?0.6:1 }}
              />
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

          <Turnstile theme={theme} onVerify={setCfToken} onExpire={() => setCfToken('')} />

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width:'100%',background:canSubmit?tk.primary:tk.panelMuted,color:canSubmit?tk.primaryInk:tk.textFaint,
              border:0,borderRadius:14,padding:'13px 20px',fontFamily:SANS,fontWeight:700,fontSize:15,
              cursor:canSubmit?'pointer':'not-allowed',marginBottom:16,
              boxShadow:canSubmit?`0 6px 16px -6px ${tk.primary}`:'none',
              transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:10
            }}
          >
            {loading && (
              <span style={{
                width:16,height:16,borderRadius:'50%',
                border:`2px solid ${tk.primaryInk}44`,borderTopColor:tk.primaryInk,
                display:'inline-block',animation:'kj-spin 0.7s linear infinite',flexShrink:0
              }}/>
            )}
            {loading ? T(lang,'সাইন ইন হচ্ছে…','Signing in…') : T(lang,'সাইন ইন করুন','Sign in')}
          </button>

          <div style={{ textAlign:'center',fontFamily:BEN,fontSize:13,color:tk.textDim }}>
            {T(lang,'অ্যাকাউন্ট নেই?','Don\'t have an account?')}{' '}
            <button type="button" onClick={()=>onNav('signup')} style={{ background:'none',border:0,color:tk.primary,fontFamily:BEN,fontSize:13,fontWeight:700,cursor:'pointer',padding:0 }}>
              {T(lang,'সাইন আপ করুন','Sign up')}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes kj-spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AdCluster tk={tk} lang={lang} count={5} isMobile={isMobile}/>
        </div>
    </PageShell>
  );
}
