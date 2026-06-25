import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Logo } from '../components/Logo';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function InstallPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const [platform, setPlatform] = useState<'android'|'ios'|'desktop'>('android');

  const steps: Record<string, { icon:string; t:string }[]> = {
    android: [
      { icon:'🌐', t:T(lang,'Chrome-এ koyjabo.com খুলুন','Open koyjabo.com in Chrome') },
      { icon:'⋮', t:T(lang,'ডানে উপরে ⋮ মেনুতে ট্যাপ করুন','Tap ⋮ menu (top right)') },
      { icon:'➕', t:T(lang,'"হোম স্ক্রিনে যোগ করুন" ট্যাপ করুন','Tap "Add to Home Screen"') },
      { icon:'✅', t:T(lang,'"ইনস্টল" ট্যাপ করুন','Tap "Install"') },
    ],
    ios: [
      { icon:'🌐', t:T(lang,'Safari-এ koyjabo.com খুলুন','Open koyjabo.com in Safari') },
      { icon:'📤', t:T(lang,'নিচে শেয়ার বাটনে ট্যাপ করুন','Tap Share button (bottom center)') },
      { icon:'📱', t:T(lang,'"হোম স্ক্রিনে যোগ করুন" ট্যাপ করুন','Scroll down, tap "Add to Home Screen"') },
      { icon:'✅', t:T(lang,'"যোগ করুন" ট্যাপ করুন','Tap "Add"') },
    ],
    desktop: [
      { icon:'🌐', t:T(lang,'Chrome বা Edge-এ koyjabo.com খুলুন','Open koyjabo.com in Chrome or Edge') },
      { icon:'⊕', t:T(lang,'অ্যাড্রেস বারে ইনস্টল আইকনে ক্লিক করুন','Click install icon (⊕) in address bar') },
      { icon:'💾', t:T(lang,'"ইনস্টল করুন" ক্লিক করুন','Click "Install"') },
      { icon:'🖥️', t:T(lang,'অ্যাপ নিজস্ব উইন্ডোতে খুলবে','App opens in its own window') },
    ],
  };

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:700, margin:'0 auto' }}>
        {/* Hero */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',marginBottom:32,padding:'24px 20px' }}>
          <div style={{ animation:'kjFloatY 2.2s ease-in-out infinite', marginBottom:16 }}>
            <Logo tk={tk} size={72}/>
          </div>
          <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?24:32,color:tk.text,margin:'0 0 8px' }}>{T(lang,'কই যাবো ইনস্টল করুন','Install KoyJabo')}</h1>
          <p style={{ fontFamily:BEN,fontSize:15,color:tk.textDim,margin:0,maxWidth:400 }}>{T(lang,'কোনো অ্যাপ স্টোর নেই · সরাসরি ব্রাউজার থেকে ইনস্টল করুন','No app store needed · install directly from your browser')}</p>
        </div>

        {/* Platform tabs */}
        <div style={{ display:'flex',gap:4,background:tk.panelMuted,borderRadius:14,padding:4,marginBottom:24 }}>
          {(['android','ios','desktop'] as const).map(p=>(
            <button key={p} onClick={()=>setPlatform(p)} style={{ flex:1,padding:'10px',border:0,borderRadius:10,background:platform===p?tk.panel:'transparent',color:platform===p?tk.text:tk.textDim,fontFamily:SANS,fontWeight:600,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
              {p==='android'?'🤖':p==='ios'?'🍎':'💻'}
              {p==='android'?'Android':p==='ios'?'iPhone':'Desktop'}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div style={{ ...card(20),marginBottom:24 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:16 }}>{T(lang,'কীভাবে ইনস্টল করবেন','How to install')}</div>
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {steps[platform].map((s,i)=>(
              <div key={i} style={{ display:'flex',gap:14,alignItems:'flex-start' }}>
                <div style={{ width:40,height:40,borderRadius:12,background:tk.primarySoft,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>{s.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ width:20,height:20,borderRadius:999,background:tk.primary,color:tk.primaryInk,display:'inline-flex',alignItems:'center',justifyContent:'center',fontFamily:SANS,fontWeight:800,fontSize:11,marginBottom:4 }}>{i+1}</div>
                  <div style={{ fontFamily:BEN,fontSize:14,color:tk.text,lineHeight:1.5 }}>{s.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:12 }}>{T(lang,'ইনস্টলের সুবিধা','Why install?')}</div>
          <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10 }}>
            {[
              { e:'📶', t:T(lang,'অফলাইনে কাজ করে','Works offline') },
              { e:'⚡', t:T(lang,'দ্রুত লোড হয়','Faster loads') },
              { e:'📱', t:T(lang,'ফুলস্ক্রিন','Full-screen') },
              { e:'🔔', t:T(lang,'পুশ নোটিফিকেশন','Push notifications') },
            ].map((f,i)=>(
              <div key={i} style={{ ...card(14),display:'flex',flexDirection:'column',alignItems:'center',gap:8,textAlign:'center' }}>
                <span style={{ fontSize:28 }}>{f.e}</span>
                <span style={{ fontFamily:BEN,fontSize:12,color:tk.textDim }}>{f.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ ...card(14),background:tk.primarySoft,borderColor:tk.primary,marginBottom:24 }}>
          <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10 }}>
            {[T(lang,'অ্যাপ স্টোর নেই','No app store'),T(lang,'সবসময় আপডেট','Always updated'),T(lang,'সব ফিচার','Same features'),T(lang,'মাত্র ৫০০KB','Only 500KB')].map((f,i)=>(
              <div key={i} style={{ fontFamily:BEN,fontSize:12,color:tk.primary,display:'flex',alignItems:'center',gap:6 }}>✓ {f}</div>
            ))}
          </div>
        </div>
          <AdSlot tk={tk} lang={lang} kind="multiplex" />
        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
