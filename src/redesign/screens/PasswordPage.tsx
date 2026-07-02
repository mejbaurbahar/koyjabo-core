import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdCluster } from '../components/AdSlot';
import { ConfirmModal } from '../components/ConfirmModal';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function PasswordPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const [confirm, setConfirm] = useState(false);

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:500, margin:'0 auto' }}>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?20:24,color:tk.text,marginBottom:16 }}>{T(lang,'পাসওয়ার্ড ও নিরাপত্তা','Password & Security')}</h1>

        <div style={{ ...card(16),background:tk.primarySoft,borderColor:tk.primary,marginBottom:16,display:'flex',gap:12,alignItems:'center' }}>
          <span style={{ fontSize:28 }}>🛡️</span>
          <div>
            <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.primaryDeep }}>{T(lang,'আপনার অ্যাকাউন্ট সুরক্ষিত','Your account is secured')}</div>
            <div style={{ fontFamily:BEN,fontSize:12,color:tk.primaryDeep,opacity:0.85 }}>{T(lang,'২ ফ্যাক্টর প্রমাণীকরণ সক্রিয়','2FA is currently enabled')}</div>
          </div>
        </div>

        {/* Password change */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text,marginBottom:12 }}>{T(lang,'পাসওয়ার্ড পরিবর্তন','Change password')}</div>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {[{l:T(lang,'বর্তমান পাসওয়ার্ড','Current password'),v:'••••••••••'},{l:T(lang,'নতুন পাসওয়ার্ড','New password'),v:'••••••••••••',strength:true},{l:T(lang,'নতুন পাসওয়ার্ড নিশ্চিত করুন','Confirm new password'),v:'••••••••••••'}].map((f,i)=>(
              <div key={i}>
                <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:5 }}>{f.l}</label>
                <div style={{ background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'11px 14px',display:'flex',alignItems:'center',gap:10 }}>
                  <span style={{ fontSize:14,opacity:0.6 }}>🔒</span>
                  <span style={{ flex:1,fontFamily:SANS,fontSize:16,color:tk.textDim,letterSpacing:3 }}>{f.v}</span>
                  <span style={{ cursor:'pointer',color:tk.textFaint }}>👁</span>
                </div>
                {f.strength && (
                  <div style={{ display:'flex',gap:4,marginTop:6 }}>
                    {[1,2,3,4,5].map(n=><div key={n} style={{ flex:1,height:4,borderRadius:999,background:n<=4?'#10b981':tk.line }}/>)}
                    <span style={{ fontFamily:SANS,fontSize:11,color:'#10b981',fontWeight:700,marginLeft:6 }}>Strong</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2FA */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text,marginBottom:12 }}>{T(lang,'দুই-ফ্যাক্টর প্রমাণীকরণ','Two-Factor Authentication')}</div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div>
              <div style={{ fontFamily:BEN,fontSize:13,color:tk.text }}>{T(lang,'অথেনটিকেটর অ্যাপ','Authenticator app')}</div>
              <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint }}>{T(lang,'সক্রিয়','Active')}</div>
            </div>
            <span style={{ background:'#10b981',color:'#fff',fontFamily:SANS,fontWeight:700,fontSize:11,padding:'4px 10px',borderRadius:999 }}>ON</span>
          </div>
          <button style={{ marginTop:12,background:'transparent',border:0,color:tk.primary,fontFamily:SANS,fontWeight:600,fontSize:13,cursor:'pointer',padding:0 }}>
            {T(lang,'ব্যাকআপ কোড দেখুন','View backup codes')} →
          </button>
        </div>

        {/* Sessions */}
        <div style={{ ...card(18),marginBottom:20 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text,marginBottom:12 }}>{T(lang,'সক্রিয় সেশন','Active sessions')}</div>
          {[
            { n:'iPhone 14 Pro',t:T(lang,'এই ডিভাইস','This device'),cur:true },
            { n:'Chrome Windows',t:T(lang,'২ ঘণ্টা আগে','2h ago'),cur:false },
            { n:'iOS App',t:T(lang,'গতকাল','Yesterday'),cur:false },
          ].map((s,i)=>(
            <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:i<2?`1px solid ${tk.line}`:'none' }}>
              <div>
                <div style={{ fontFamily:BEN,fontSize:13,color:tk.text }}>{s.n}</div>
                <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint }}>{s.t}</div>
              </div>
              {s.cur ? <span style={{ background:tk.primarySoft,color:tk.primary,fontFamily:SANS,fontWeight:700,fontSize:10,padding:'3px 8px',borderRadius:999 }}>Current</span>
               : <button style={{ background:'transparent',border:0,color:tk.accent,fontFamily:SANS,fontSize:12,cursor:'pointer' }}>{T(lang,'সরান','Remove')}</button>}
            </div>
          ))}
          <button onClick={()=>setConfirm(true)} style={{ marginTop:12,width:'100%',background:tk.accentSoft,border:`1px solid ${tk.accent}`,borderRadius:12,padding:'10px',fontFamily:BEN,fontWeight:700,fontSize:13,color:tk.accent,cursor:'pointer' }}>
            {T(lang,'অন্য সব ডিভাইস সাইন আউট করুন','Sign out all other devices')}
          </button>
        </div>

        <button style={{ width:'100%',background:tk.primary,color:tk.primaryInk,border:0,borderRadius:14,padding:'13px 20px',fontFamily:SANS,fontWeight:700,fontSize:14,cursor:'pointer' }}>
          {T(lang,'পরিবর্তন সংরক্ষণ করুন','Save changes')}
        </button>

        <ConfirmModal tk={tk} lang={lang} open={confirm} title={T(lang,'সাইন আউট','Sign out all')} message={T(lang,'অন্য সব ডিভাইস সাইন আউট হবে।','All other devices will be signed out.')}
          confirmLabel={T(lang,'হ্যাঁ','Yes')} onClose={()=>setConfirm(false)} onConfirm={()=>setConfirm(false)}/>
      </div>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AdCluster tk={tk} lang={lang} count={5} isMobile={isMobile}/>
        </div>
    </PageShell>
  );
}
