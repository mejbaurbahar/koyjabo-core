import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function ContactPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const [subject, setSubject] = useState('General');
  const subjects = ['General','Bug Report','Feature Request','Content Error'];

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:700, margin:'0 auto' }}>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?22:28,color:tk.text,marginBottom:6 }}>{T(lang,'যোগাযোগ করুন','Contact Us')}</h1>
        <p style={{ fontFamily:BEN,fontSize:14,color:tk.textDim,marginBottom:24 }}>{T(lang,'আমরা ২৪-৪৮ ঘণ্টার মধ্যে উত্তর দিই।','We respond within 24-48 hours.')}</p>

        <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12,marginBottom:24 }}>
          {[
            { e:'📧', l:'Email', v:'koyjabo.bd@gmail.com', c:tk.primarySoft, fc:tk.primary },
            { e:'📘', l:'Facebook', v:'facebook.com/koyjabo', c:'#1877f22a', fc:'#1877f2' },
            { e:'💼', l:'LinkedIn', v:'linkedin.com/company/koy-jabo', c:tk.chipBg, fc:tk.text },
            { e:'📝', l:T(lang,'ভুল তথ্য জানান','Report issue'), v:'Contact form', c:tk.accentSoft, fc:tk.accent },
          ].map((c,i)=>(
            <div key={i} style={{ ...card(14),background:c.c,borderColor:c.fc+'33',display:'flex',alignItems:'center',gap:12,cursor:'pointer' }}>
              <span style={{ fontSize:24 }}>{c.e}</span>
              <div>
                <div style={{ fontFamily:SANS,fontWeight:700,fontSize:13,color:c.fc }}>{c.l}</div>
                <div style={{ fontFamily:SANS,fontSize:12,color:tk.textDim }}>{c.v}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ ...card(20) }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:16,color:tk.text,marginBottom:16 }}>{T(lang,'বার্তা পাঠান','Send a message')}</div>
          <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
            <div>
              <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>{T(lang,'নাম','Name')}</label>
              <input placeholder={T(lang,'আপনার নাম','Your name')} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:BEN,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
            </div>
            <div>
              <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>Email</label>
              <input type="email" placeholder="your@email.com" style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}/>
            </div>
            <div>
              <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>{T(lang,'বিষয়','Subject')}</label>
              <select value={subject} onChange={e=>setSubject(e.target.value)} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:SANS,fontSize:14,outline:'none',boxSizing:'border-box' }}>
                {subjects.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>{T(lang,'বার্তা','Message')}</label>
              <textarea placeholder={T(lang,'আপনার বার্তা লিখুন...','Write your message...')} style={{ width:'100%',minHeight:120,background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:BEN,fontSize:14,outline:'none',resize:'vertical',boxSizing:'border-box' }}/>
            </div>
            <button style={{ background:tk.primary,color:tk.primaryInk,border:0,borderRadius:12,padding:'13px 20px',fontFamily:SANS,fontWeight:700,fontSize:14,cursor:'pointer' }}>
              {T(lang,'পাঠান','Send message')} →
            </button>
          </div>
        </div>

        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
