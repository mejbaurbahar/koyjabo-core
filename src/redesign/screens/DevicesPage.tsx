import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { ConfirmModal } from '../components/ConfirmModal';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function DevicesPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const [confirm, setConfirm] = useState<{open:boolean,title:string,msg:string}>({open:false,title:'',msg:''});
  const devices = [
    { icon:'📱', name:'iPhone 14 Pro', os:'iOS 17', loc:T(lang,'ঢাকা','Dhaka'), last:T(lang,'এখনই','Just now'), current:true, suspicious:false },
    { icon:'💻', name:'Chrome on Windows', os:'Windows 11', loc:T(lang,'ঢাকা','Dhaka'), last:T(lang,'২ ঘণ্টা আগে','2h ago'), current:false, suspicious:false },
    { icon:'📱', name:'Samsung Galaxy S23', os:'Android 14', loc:T(lang,'চট্টগ্রাম','Chittagong'), last:'Jun 15', current:false, suspicious:true },
  ];

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:600, margin:'0 auto' }}>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?20:26,color:tk.text,marginBottom:20 }}>{T(lang,'ডিভাইস','Devices')}</h1>

        {/* Suspicious login warning */}
        <div style={{ background:tk.amberSoft,border:`1px solid ${tk.amber}`,borderRadius:16,padding:16,marginBottom:20,display:'flex',gap:12,alignItems:'flex-start' }}>
          <span style={{ fontSize:24,flexShrink:0 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.amber,marginBottom:4 }}>{T(lang,'নতুন সাইন-ইন শনাক্ত হয়েছে','New sign-in detected')}</div>
            <div style={{ fontFamily:BEN,fontSize:12,color:tk.amber,opacity:0.85,marginBottom:10 }}>{T(lang,'চট্টগ্রাম থেকে · ১৫ জুন · Chrome on Windows','From Chittagong · Jun 15 · Chrome on Windows')}</div>
            <div style={{ display:'flex',gap:8 }}>
              <button style={{ background:tk.amber,color:'#fff',border:0,borderRadius:10,padding:'7px 14px',fontFamily:SANS,fontWeight:700,fontSize:12,cursor:'pointer' }}>{T(lang,'এটা আমি','This is me')}</button>
              <button onClick={()=>setConfirm({open:true,title:T(lang,'ডিভাইস সরান','Remove device'),msg:T(lang,'এই ডিভাইস সাইন আউট করা হবে।','This device will be signed out.')})}
                style={{ background:'transparent',border:`1px solid ${tk.amber}`,borderRadius:10,padding:'7px 14px',fontFamily:SANS,fontWeight:700,fontSize:12,color:tk.amber,cursor:'pointer' }}>{T(lang,'সরিয়ে দিন','Remove')}</button>
            </div>
          </div>
        </div>

        {/* Device list */}
        <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:20 }}>
          {devices.map((d,i)=>(
            <div key={i} style={{ ...card(16),display:'flex',gap:14,alignItems:'center',borderColor:d.suspicious?tk.amber:tk.line,background:d.suspicious?tk.amberSoft:tk.panel }}>
              <span style={{ fontSize:28,flexShrink:0 }}>{d.icon}</span>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                  <span style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text }}>{d.name}</span>
                  {d.current && <span style={{ background:tk.primarySoft,color:tk.primary,fontFamily:SANS,fontWeight:700,fontSize:10,padding:'2px 7px',borderRadius:999 }}>{T(lang,'এই ডিভাইস','This device')}</span>}
                  {d.suspicious && <span style={{ background:tk.amberSoft,color:tk.amber,fontFamily:SANS,fontWeight:700,fontSize:10,padding:'2px 7px',borderRadius:999 }}>⚠️</span>}
                </div>
                <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,marginTop:3 }}>{d.os} · {d.loc} · {d.last}</div>
              </div>
              {!d.current && (
                <button onClick={()=>setConfirm({open:true,title:T(lang,'ডিভাইস সরান','Remove device'),msg:T(lang,'এই ডিভাইস সাইন আউট হবে।','This device will be signed out.')})}
                  style={{ background:tk.panelMuted,border:`1px solid ${tk.line}`,borderRadius:10,padding:'7px 12px',fontFamily:SANS,fontWeight:600,fontSize:12,color:tk.accent,cursor:'pointer',flexShrink:0 }}>
                  {T(lang,'সরান','Remove')}
                </button>
              )}
            </div>
          ))}
        </div>

        <button onClick={()=>setConfirm({open:true,title:T(lang,'সব ডিভাইস থেকে সাইন আউট','Sign out all devices'),msg:T(lang,'আপনি সব ডিভাইস থেকে সাইন আউট হয়ে যাবেন।','You will be signed out of all devices.')})}
          style={{ width:'100%',background:tk.accentSoft,border:`1px solid ${tk.accent}`,borderRadius:14,padding:'13px 20px',fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.accent,cursor:'pointer' }}>
          {T(lang,'সব ডিভাইস থেকে সাইন আউট করুন','Sign out all devices')}
        </button>

        <ConfirmModal tk={tk} lang={lang} open={confirm.open} title={confirm.title} message={confirm.msg}
          confirmLabel={T(lang,'হ্যাঁ, সরান','Yes, remove')}
          onClose={()=>setConfirm(c=>({...c,open:false}))}
          onConfirm={()=>setConfirm(c=>({...c,open:false}))}/>
      </div>
    </PageShell>
  );
}
