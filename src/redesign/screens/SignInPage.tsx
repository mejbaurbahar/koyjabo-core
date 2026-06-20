import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { Logo } from '../components/Logo';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function SignInPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const [showPw, setShowPw] = useState(false);

  return (
    <PageShell {...props}>
      <div style={{ minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:isMobile?'24px 16px':'48px 24px' }}>
        <div style={{ width:'100%',maxWidth:420,background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:24,padding:isMobile?24:32,boxShadow:tk.shadowLg }}>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24 }}>
            <Logo tk={tk} size={52}/>
            <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:22,color:tk.text,margin:'14px 0 4px' }}>{T(lang,'সাইন ইন করুন','Sign in to KoyJabo')}</h1>
            <p style={{ fontFamily:BEN,fontSize:13,color:tk.textDim,margin:0 }}>{T(lang,'আপনার যাত্রা শুরু হোক','Start your journey')}</p>
          </div>

          {/* Social */}
          <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:20 }}>
            {[
              { icon:'G', name:'Google', bg:'#fff', fg:'#1f2937', border:'#e5e7eb' },
              { icon:'f', name:'Facebook', bg:'#1877f2', fg:'#fff', border:'#1877f2' },
            ].map((s,i)=>(
              <button key={i} style={{ width:'100%',background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'center',gap:10,fontFamily:SANS,fontWeight:700,fontSize:14,color:s.fg,cursor:'pointer' }}>
                <span style={{ fontWeight:900,fontSize:16,fontFamily:'serif' }}>{s.icon}</span>
                {T(lang,`${s.name} দিয়ে সাইন ইন`,`Continue with ${s.name}`)}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
            <div style={{ flex:1,height:1,background:tk.line }}/>
            <span style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1.4 }}>{T(lang,'অথবা','or')}</span>
            <div style={{ flex:1,height:1,background:tk.line }}/>
          </div>

          {/* Email form */}
          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:20 }}>
            <input type="email" placeholder="Email" style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
            <div style={{ position:'relative' }}>
              <input type={showPw?'text':'password'} placeholder={T(lang,'পাসওয়ার্ড','Password')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
              <button onClick={()=>setShowPw(p=>!p)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:0,color:tk.textFaint,cursor:'pointer',fontSize:16 }}>
                {showPw?'👁️':'👁'}
              </button>
            </div>
            <div style={{ textAlign:'right' }}>
              <button style={{ background:'none',border:0,color:tk.primary,fontFamily:SANS,fontSize:12,fontWeight:600,cursor:'pointer' }}>
                {T(lang,'পাসওয়ার্ড ভুলে গেছেন?','Forgot password?')}
              </button>
            </div>
          </div>

          <button style={{ width:'100%',background:tk.primary,color:tk.primaryInk,border:0,borderRadius:14,padding:'13px 20px',fontFamily:SANS,fontWeight:700,fontSize:15,cursor:'pointer',marginBottom:16,boxShadow:`0 6px 16px -6px ${tk.primary}` }}>
            {T(lang,'সাইন ইন করুন','Sign in')}
          </button>

          <div style={{ textAlign:'center',fontFamily:BEN,fontSize:13,color:tk.textDim }}>
            {T(lang,'অ্যাকাউন্ট নেই?','Don\'t have an account?')}{' '}
            <button onClick={()=>onNav('signup')} style={{ background:'none',border:0,color:tk.primary,fontFamily:BEN,fontSize:13,fontWeight:700,cursor:'pointer',padding:0 }}>
              {T(lang,'সাইন আপ করুন','Sign up')}
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
