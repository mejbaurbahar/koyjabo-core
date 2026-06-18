import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { Logo } from '../components/Logo';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function SignUpPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const [agreed, setAgreed] = useState(false);
  const [pw, setPw] = useState('');
  const strength = pw.length > 12 ? 5 : pw.length > 8 ? 4 : pw.length > 5 ? 3 : pw.length > 2 ? 2 : pw.length > 0 ? 1 : 0;
  const strengthLabel = ['','Weak','Fair','Good','Strong','Excellent'][strength];
  const strengthColor = ['',tk.accent,'#f59e0b','#f59e0b','#10b981','#10b981'][strength];

  return (
    <PageShell {...props}>
      <div style={{ minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',padding:isMobile?'24px 16px':'48px 24px' }}>
        <div style={{ width:'100%',maxWidth:420,background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:24,padding:isMobile?24:32,boxShadow:tk.shadowLg }}>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24 }}>
            <Logo tk={tk} size={52}/>
            <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:22,color:tk.text,margin:'14px 0 4px' }}>{T(lang,'অ্যাকাউন্ট তৈরি করুন','Create account')}</h1>
          </div>

          <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:20 }}>
            <input placeholder={T(lang,'পূর্ণ নাম','Full name')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:BEN,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
            <input type="email" placeholder="Email" style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
            <div>
              <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder={T(lang,'পাসওয়ার্ড','Password')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
              {pw.length > 0 && (
                <div style={{ display:'flex',gap:4,marginTop:8,alignItems:'center' }}>
                  {[1,2,3,4,5].map(n=><div key={n} style={{ flex:1,height:4,borderRadius:999,background:n<=strength?strengthColor:tk.line,transition:'background .2s' }}/>)}
                  <span style={{ fontFamily:SANS,fontSize:11,color:strengthColor,fontWeight:700,marginLeft:6,flexShrink:0 }}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <input type="password" placeholder={T(lang,'পাসওয়ার্ড নিশ্চিত করুন','Confirm password')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
          </div>

          <div style={{ display:'flex',alignItems:'flex-start',gap:10,marginBottom:20,cursor:'pointer' }} onClick={()=>setAgreed(a=>!a)}>
            <div style={{ width:18,height:18,borderRadius:5,border:`2px solid ${agreed?tk.primary:tk.line}`,background:agreed?tk.primary:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}>
              {agreed && <span style={{ color:tk.primaryInk,fontSize:12,fontWeight:900 }}>✓</span>}
            </div>
            <span style={{ fontFamily:BEN,fontSize:12,color:tk.textDim,lineHeight:1.5 }}>
              {T(lang,'আমি ','I agree to the ')}<span style={{ color:tk.primary }}>{T(lang,'গোপনীয়তা নীতি','Privacy Policy')}</span>{T(lang,' এবং ','  and ')}<span style={{ color:tk.primary }}>{T(lang,'সেবার শর্তাবলি','Terms of Service')}</span>{T(lang,'-তে সম্মত আছি','')}
            </span>
          </div>

          <button disabled={!agreed} style={{ width:'100%',background:agreed?tk.primary:tk.panelMuted,color:agreed?tk.primaryInk:tk.textFaint,border:0,borderRadius:14,padding:'13px 20px',fontFamily:SANS,fontWeight:700,fontSize:15,cursor:agreed?'pointer':'not-allowed',marginBottom:16,boxShadow:agreed?`0 6px 16px -6px ${tk.primary}`:'none',transition:'all .2s' }}>
            {T(lang,'অ্যাকাউন্ট তৈরি করুন','Create account')}
          </button>

          <div style={{ textAlign:'center',fontFamily:BEN,fontSize:13,color:tk.textDim }}>
            {T(lang,'ইতিমধ্যে অ্যাকাউন্ট আছে?','Already have an account?')}{' '}
            <button onClick={()=>onNav('signin')} style={{ background:'none',border:0,color:tk.primary,fontFamily:BEN,fontSize:13,fontWeight:700,cursor:'pointer',padding:0 }}>
              {T(lang,'সাইন ইন করুন','Sign in')}
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
