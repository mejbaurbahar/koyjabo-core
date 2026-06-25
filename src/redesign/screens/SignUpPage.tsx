import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { Logo } from '../components/Logo';
import { Turnstile } from '../components/Turnstile';
import { signupUser } from '../../services/githubAuthService';
import { useAuth } from '../../contexts/AuthContext';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function SignUpPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cfToken, setCfToken] = useState('');

  const strength = pw.length > 12 ? 5 : pw.length > 8 ? 4 : pw.length > 5 ? 3 : pw.length > 2 ? 2 : pw.length > 0 ? 1 : 0;
  const strengthLabel = ['','Weak','Fair','Good','Strong','Excellent'][strength];
  const strengthColor = ['',tk.accent,'#f59e0b','#f59e0b','#10b981','#10b981'][strength];

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && pw.length >= 6 && pw === confirmPw && agreed && !loading && cfToken.length > 0;

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (pw !== confirmPw) { setError(T(lang, 'পাসওয়ার্ড মিলছে না', 'Passwords do not match')); return; }
    setLoading(true);
    setError('');
    try {
      const username = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const result = await signupUser(email, pw, username || 'user', name.trim(), cfToken);
      if (!result.success) throw new Error(result.error || T(lang, 'সাইন আপ ব্যর্থ হয়েছে', 'Sign up failed'));
      login({
        id: result.userId!,
        email: result.email || email,
        username: result.username || username,
        displayName: result.displayName || name.trim(),
        createdAt: Date.now(),
        provider: 'manual',
        hasPassword: true,
      });
      onNav('profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : T(lang, 'সাইন আপ ব্যর্থ হয়েছে', 'Sign up failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell {...props}>
      <div style={{ minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:isMobile?'24px 16px':'48px 24px' }}>
        <form onSubmit={handleSignUp} style={{ width:'100%',maxWidth:420,background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:24,padding:isMobile?24:32,boxShadow:tk.shadowLg }}>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24 }}>
            <Logo tk={tk} size={52}/>
            <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:22,color:tk.text,margin:'14px 0 4px' }}>{T(lang,'অ্যাকাউন্ট তৈরি করুন','Create account')}</h1>
          </div>

          {loading && (
            <div style={{ background:`${tk.primary}18`,border:`1px solid ${tk.primary}44`,borderRadius:10,padding:'10px 14px',marginBottom:16,fontFamily:SANS,fontSize:13,color:tk.primary,display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ width:14,height:14,borderRadius:'50%',border:`2px solid ${tk.primary}44`,borderTopColor:tk.primary,display:'inline-block',animation:'kj-spin 0.7s linear infinite',flexShrink:0 }}/>
              {T(lang,'অ্যাকাউন্ট তৈরি হচ্ছে… ৩০–৯০ সেকেন্ড লাগতে পারে।','Creating account… this may take 30–90 seconds.')}
            </div>
          )}

          {error && (
            <div style={{ background:`${tk.accent}18`,border:`1px solid ${tk.accent}44`,borderRadius:10,padding:'10px 14px',marginBottom:16,fontFamily:SANS,fontSize:13,color:tk.accent }}>
              {error}
            </div>
          )}

          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:20 }}>
            <input
              placeholder={T(lang,'পূর্ণ নাম','Full name')}
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              required
              style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:BEN,fontSize:14,outline:'none',boxSizing:'border-box',opacity:loading?0.6:1 }}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
              style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box',opacity:loading?0.6:1 }}
            />
            <div>
              <input
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder={T(lang,'পাসওয়ার্ড','Password')}
                disabled={loading}
                required
                style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box',opacity:loading?0.6:1 }}
              />
              {pw.length > 0 && (
                <div style={{ display:'flex',gap:4,marginTop:8,alignItems:'center' }}>
                  {[1,2,3,4,5].map(n=><div key={n} style={{ flex:1,height:4,borderRadius:999,background:n<=strength?strengthColor:tk.line,transition:'background .2s' }}/>)}
                  <span style={{ fontFamily:SANS,fontSize:11,color:strengthColor,fontWeight:700,marginLeft:6,flexShrink:0 }}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <input
              type="password"
              placeholder={T(lang,'পাসওয়ার্ড নিশ্চিত করুন','Confirm password')}
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              disabled={loading}
              required
              style={{ width:'100%',background:tk.inputBg,border:`1px solid ${confirmPw&&confirmPw!==pw?tk.accent:tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box',opacity:loading?0.6:1 }}
            />
            {confirmPw && confirmPw !== pw && (
              <span style={{ fontFamily:SANS,fontSize:11,color:tk.accent,marginTop:-6 }}>
                {T(lang,'পাসওয়ার্ড মিলছে না','Passwords do not match')}
              </span>
            )}
          </div>

          <div style={{ display:'flex',alignItems:'flex-start',gap:10,marginBottom:20,cursor:loading?'not-allowed':'pointer' }} onClick={()=>!loading&&setAgreed(a=>!a)}>
            <div style={{ width:18,height:18,borderRadius:5,border:`2px solid ${agreed?tk.primary:tk.line}`,background:agreed?tk.primary:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1,opacity:loading?0.6:1 }}>
              {agreed && <span style={{ color:tk.primaryInk,fontSize:12,fontWeight:900 }}>✓</span>}
            </div>
            <span style={{ fontFamily:BEN,fontSize:12,color:tk.textDim,lineHeight:1.5 }}>
              {T(lang,'আমি ','I agree to the ')}<span style={{ color:tk.primary }}>{T(lang,'গোপনীয়তা নীতি','Privacy Policy')}</span>{T(lang,' এবং ','  and ')}<span style={{ color:tk.primary }}>{T(lang,'সেবার শর্তাবলি','Terms of Service')}</span>{T(lang,'-তে সম্মত আছি','')}
            </span>
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
              <span style={{ width:16,height:16,borderRadius:'50%',border:`2px solid ${tk.primaryInk}44`,borderTopColor:tk.primaryInk,display:'inline-block',animation:'kj-spin 0.7s linear infinite',flexShrink:0 }}/>
            )}
            {loading ? T(lang,'তৈরি হচ্ছে…','Creating…') : T(lang,'অ্যাকাউন্ট তৈরি করুন','Create account')}
          </button>

          <div style={{ textAlign:'center',fontFamily:BEN,fontSize:13,color:tk.textDim }}>
            {T(lang,'ইতিমধ্যে অ্যাকাউন্ট আছে?','Already have an account?')}{' '}
            <button type="button" onClick={()=>onNav('signin')} style={{ background:'none',border:0,color:tk.primary,fontFamily:BEN,fontSize:13,fontWeight:700,cursor:'pointer',padding:0 }}>
              {T(lang,'সাইন ইন করুন','Sign in')}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes kj-spin{to{transform:rotate(360deg)}}`}</style>
    </PageShell>
  );
}
