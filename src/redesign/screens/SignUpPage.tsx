import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { Logo } from '../components/Logo';
import { signupUser } from '../../services/githubAuthService';
import { signInUser } from '../utils/auth';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function SignUpPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const strength = pw.length > 12 ? 5 : pw.length > 8 ? 4 : pw.length > 5 ? 3 : pw.length > 2 ? 2 : pw.length > 0 ? 1 : 0;
  const strengthLabel = ['','Weak','Fair','Good','Strong','Excellent'][strength];
  const strengthColor = ['',tk.accent,'#f59e0b','#f59e0b','#10b981','#10b981'][strength];
  const normalizedEmail = email.trim().toLowerCase();
  const emailLooksGmail = !normalizedEmail || /^[^\s@]+@gmail\.com$/.test(normalizedEmail);

  const username = normalizedEmail.split('@')[0]?.replace(/[^a-z0-9_]/gi, '').toLowerCase() || name.trim().replace(/\s+/g, '').toLowerCase();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !pw || !confirmPw) {
      setError(T(lang, 'সব তথ্য পূরণ করুন।', 'Fill all fields.'));
      return;
    }
    if (!/^[^\s@]+@gmail\.com$/.test(normalizedEmail)) {
      setError(T(lang, 'শুধু Gmail ঠিকানা গ্রহণ করা হবে।', 'Only Gmail addresses are accepted.'));
      return;
    }
    if (pw !== confirmPw) {
      setError(T(lang, 'পাসওয়ার্ড মেলেনি।', 'Passwords do not match.'));
      return;
    }
    if (!agreed) {
      setError(T(lang, 'গোপনীয়তা নীতি ও শর্তাবলিতে সম্মত হন।', 'Agree to privacy policy and terms.'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await signupUser(normalizedEmail, pw, username, name.trim());
      if (!result.success || !result.userId) throw new Error(result.error || T(lang, 'সাইন আপ ব্যর্থ হয়েছে।', 'Sign up failed.'));
      signInUser({
        id: result.userId,
        email: result.email || normalizedEmail,
        username: result.username || username,
        displayName: result.displayName || name.trim(),
      });
      onNav('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : T(lang, 'সাইন আপ ব্যর্থ হয়েছে।', 'Sign up failed.'));
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
            <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:22,color:tk.text,margin:'14px 0 4px' }}>{T(lang,'অ্যাকাউন্ট তৈরি করুন','Create account')}</h1>
          </div>

          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:20 }}>
            <input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder={T(lang,'পূর্ণ নাম','Full name')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:BEN,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
            <div>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                autoComplete="email"
                placeholder="yourname@gmail.com"
                title={T(lang, 'শুধু Gmail ঠিকানা গ্রহণ করা হবে', 'Only Gmail addresses are accepted')}
                style={{ width:'100%',background:tk.inputBg,border:`1px solid ${emailLooksGmail ? tk.line : tk.accent}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}
              />
              <div style={{ marginTop:6,fontFamily:BEN,fontSize:11,color:emailLooksGmail?tk.textFaint:tk.accent }}>
                {T(lang, 'শুধু Gmail অ্যাকাউন্ট দিয়ে সাইন আপ করা যাবে।', 'Only Gmail accounts can sign up.')}
              </div>
            </div>
            <div>
              <div style={{ position:'relative' }}>
                <input type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} autoComplete="new-password" placeholder={T(lang,'পাসওয়ার্ড','Password')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 44px 12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} aria-label={showPw ? T(lang,'পাসওয়ার্ড লুকান','Hide password') : T(lang,'পাসওয়ার্ড দেখুন','Show password')} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:0,color:tk.textFaint,cursor:'pointer',fontSize:16 }}>
                  {showPw?'👁️':'👁'}
                </button>
              </div>
              {pw.length > 0 && (
                <div style={{ display:'flex',gap:4,marginTop:8,alignItems:'center' }}>
                  {[1,2,3,4,5].map(n=><div key={n} style={{ flex:1,height:4,borderRadius:999,background:n<=strength?strengthColor:tk.line,transition:'background .2s' }}/>)}
                  <span style={{ fontFamily:SANS,fontSize:11,color:strengthColor,fontWeight:700,marginLeft:6,flexShrink:0 }}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <div style={{ position:'relative' }}>
              <input type={showConfirmPw?'text':'password'} value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} autoComplete="new-password" placeholder={T(lang,'পাসওয়ার্ড নিশ্চিত করুন','Confirm password')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 44px 12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
              <button type="button" onClick={()=>setShowConfirmPw(p=>!p)} aria-label={showConfirmPw ? T(lang,'পাসওয়ার্ড লুকান','Hide password') : T(lang,'পাসওয়ার্ড দেখুন','Show password')} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:0,color:tk.textFaint,cursor:'pointer',fontSize:16 }}>
                {showConfirmPw?'👁️':'👁'}
              </button>
            </div>
          </div>

          <div style={{ display:'flex',alignItems:'flex-start',gap:10,marginBottom:20,cursor:'pointer' }} onClick={()=>setAgreed(a=>!a)}>
            <div style={{ width:18,height:18,borderRadius:5,border:`2px solid ${agreed?tk.primary:tk.line}`,background:agreed?tk.primary:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}>
              {agreed && <span style={{ color:tk.primaryInk,fontSize:12,fontWeight:900 }}>✓</span>}
            </div>
            <span style={{ fontFamily:BEN,fontSize:12,color:tk.textDim,lineHeight:1.5 }}>
              {T(lang,'আমি ','I agree to the ')}<span style={{ color:tk.primary }}>{T(lang,'গোপনীয়তা নীতি','Privacy Policy')}</span>{T(lang,' এবং ','  and ')}<span style={{ color:tk.primary }}>{T(lang,'সেবার শর্তাবলি','Terms of Service')}</span>{T(lang,'-তে সম্মত আছি','')}
            </span>
          </div>

          {error && <div style={{ background:tk.accentSoft,border:`1px solid ${tk.accent}55`,color:tk.accent,borderRadius:12,padding:'10px 12px',fontFamily:BEN,fontSize:13,marginBottom:14 }}>{error}</div>}

          <button type="submit" disabled={!agreed || submitting} style={{ width:'100%',background:agreed?tk.primary:tk.panelMuted,color:agreed?tk.primaryInk:tk.textFaint,border:0,borderRadius:14,padding:'13px 20px',fontFamily:SANS,fontWeight:700,fontSize:15,cursor:agreed&&!submitting?'pointer':'not-allowed',marginBottom:16,boxShadow:agreed?`0 6px 16px -6px ${tk.primary}`:'none',transition:'all .2s',opacity:submitting?0.72:1 }}>
            {submitting ? T(lang,'অ্যাকাউন্ট তৈরি হচ্ছে...','Creating account...') : T(lang,'অ্যাকাউন্ট তৈরি করুন','Create account')}
          </button>

          <div style={{ textAlign:'center',fontFamily:BEN,fontSize:13,color:tk.textDim }}>
            {T(lang,'ইতিমধ্যে অ্যাকাউন্ট আছে?','Already have an account?')}{' '}
            <button onClick={()=>onNav('signin')} style={{ background:'none',border:0,color:tk.primary,fontFamily:BEN,fontSize:13,fontWeight:700,cursor:'pointer',padding:0 }}>
              {T(lang,'সাইন ইন করুন','Sign in')}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
