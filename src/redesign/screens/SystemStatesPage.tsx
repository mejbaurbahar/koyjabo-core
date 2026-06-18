import React from 'react';
import { KJ_TOKENS, T, SANS, BEN, Theme, Lang } from '../tokens';

interface SystemProps { theme: Theme; lang: Lang; onHome?: () => void; }

function RouteRing({ tone, status, icon }: { tone: string; status: string; icon: string }) {
  return (
    <div style={{ position:'relative',width:210,height:210,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto' }}>
      {/* Radial glow */}
      <div style={{ position:'absolute',inset:0,borderRadius:999,background:`radial-gradient(circle, ${tone}33 0%, transparent 68%)`,animation:'kjpulse 3.4s ease-in-out infinite' }}/>
      {/* Dashed route ring */}
      <svg viewBox="0 0 210 210" width="210" height="210" style={{ position:'absolute',inset:0 }}>
        <circle cx="105" cy="105" r="80" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none"/>
        <circle cx="105" cy="105" r="80" stroke={tone} strokeWidth="2.5" fill="none" strokeDasharray="3 25" strokeLinecap="round" style={{ animation:'kj-dash 1.1s linear infinite' }}/>
        <circle cx="105" cy="25" r="5" fill={tone}/>
      </svg>
      {/* Icon disc */}
      <div style={{ width:72,height:72,borderRadius:22,background:'rgba(13,22,42,0.72)',border:`1px solid rgba(255,255,255,0.08)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,animation:'kjFloatY 3.8s ease-in-out infinite',position:'relative',zIndex:1 }}>
        {icon}
      </div>
      {/* Status pill */}
      <div style={{ position:'absolute',top:'18%',background:tone+'22',color:tone,fontFamily:SANS,fontWeight:800,fontSize:11,letterSpacing:3,textTransform:'uppercase',padding:'4px 12px',borderRadius:999 }}>{status}</div>
    </div>
  );
}

function SystemScreen({ theme, lang, tone, icon, status, titleBn, titleEn, bodyBn, bodyEn, buttons }: {
  theme:Theme; lang:Lang; tone:string; icon:string; status:string;
  titleBn:string; titleEn:string; bodyBn:string; bodyEn:string;
  buttons: { labelBn:string; labelEn:string; primary?:boolean; onClick?:()=>void }[];
}) {
  const tk = KJ_TOKENS[theme];
  return (
    <div style={{ minHeight:'100vh',background:tk.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 20px',flexDirection:'column',gap:0,position:'relative',overflow:'hidden' }}>
      {/* Future bg */}
      <div className="kj-future-bg" style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:0 }}/>
      <div style={{ position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',maxWidth:400 }}>
        <RouteRing tone={tone} status={status} icon={icon}/>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:28,color:tk.text,margin:'24px 0 12px',letterSpacing:-0.4,textWrap:'balance' as any }}>
          {T(lang,titleBn,titleEn)}
        </h1>
        <p style={{ fontFamily:BEN,fontSize:15,color:tk.textDim,lineHeight:1.65,margin:'0 0 28px',maxWidth:280,textWrap:'pretty' as any }}>
          {T(lang,bodyBn,bodyEn)}
        </p>
        <div style={{ display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center' }}>
          {buttons.map((b,i)=>(
            <button key={i} onClick={b.onClick} style={{
              background:b.primary?tone:'transparent',
              color:b.primary?'#fff':tone,
              border:`1px solid ${tone}`,
              borderRadius:14,padding:'13px 22px',
              fontFamily:SANS,fontWeight:700,fontSize:14,cursor:'pointer',
              ...(b.primary?{ boxShadow:`0 6px 20px -8px ${tone}` }:{})
            }}>
              {T(lang,b.labelBn,b.labelEn)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorPage404({ theme, lang, onHome }: SystemProps) {
  return <SystemScreen theme={theme} lang={lang} tone={KJ_TOKENS[theme].primary} icon="🔍" status="404"
    titleBn="পেজ পাওয়া যায়নি" titleEn="Page Not Found"
    bodyBn="আপনি যে রুটটি খুঁজছেন সেটি বিদ্যমান নেই।" bodyEn="The route you're looking for doesn't exist."
    buttons={[{labelBn:'হোমে যান',labelEn:'Go Home',primary:true,onClick:onHome},{labelBn:'পিছনে',labelEn:'Go Back'}]}/>;
}

export function ErrorPage500({ theme, lang }: SystemProps) {
  return <SystemScreen theme={theme} lang={lang} tone={KJ_TOKENS[theme].accent} icon="⚡" status="500"
    titleBn="সার্ভার ত্রুটি" titleEn="Server Error"
    bodyBn="আমাদের পাশ থেকে কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।" bodyEn="Something went wrong on our end. Try again."
    buttons={[{labelBn:'আবার চেষ্টা',labelEn:'Retry',primary:true},{labelBn:'হোমে যান',labelEn:'Go Home'}]}/>;
}

export function ErrorPage403({ theme, lang }: SystemProps) {
  return <SystemScreen theme={theme} lang={lang} tone={KJ_TOKENS[theme].amber} icon="🔒" status="403"
    titleBn="প্রবেশাধিকার নেই" titleEn="Access Denied"
    bodyBn="এই পেজে প্রবেশের অনুমতি আপনার নেই।" bodyEn="You don't have permission for this page."
    buttons={[{labelBn:'সাইন ইন করুন',labelEn:'Sign In',primary:true},{labelBn:'হোমে যান',labelEn:'Go Home'}]}/>;
}

export function OfflinePage({ theme, lang }: SystemProps) {
  const tk = KJ_TOKENS[theme];
  const features = [
    { icon:'🚌', bn:'লোকাল বাস রুট', en:'Local bus routes', ok:true },
    { icon:'🚆', bn:'ট্রেন ও মেট্রো গাইড', en:'Train and metro guides', ok:true },
    { icon:'⭐', bn:'হিস্ট্রি ও ফেভারিট', en:'History and favorites', ok:true },
    { icon:'🤖', bn:'লাইভ AI উত্তর', en:'Live AI answers', ok:false },
    { icon:'🚦', bn:'রিয়েলটাইম ট্রাফিক', en:'Realtime traffic', ok:false },
  ];

  return (
    <div style={{ minHeight:'100vh',background:tk.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 18px',position:'relative',overflow:'hidden' }}>
      <div className="kj-future-bg" style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:0 }}/>
      <div style={{ position:'relative',zIndex:1,width:'100%',maxWidth:460,background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:28,padding:24,boxShadow:tk.shadowLg }}>
        <RouteRing tone={tk.primary} status="OFFLINE" icon="📶"/>
        <h1 style={{ fontFamily:BEN,fontWeight:800,fontSize:28,color:tk.text,margin:'18px 0 10px',textAlign:'center' }}>
          {T(lang,'অফলাইন মোড চালু','Offline mode ready')}
        </h1>
        <p style={{ fontFamily:BEN,fontSize:15,color:tk.textDim,lineHeight:1.65,margin:'0 0 18px',textAlign:'center' }}>
          {T(lang,'ইন্টারনেট নেই, কিন্তু সেভ করা রুট, ভাড়া, স্টেশন ও ফেভারিট ব্যবহার করতে পারবেন। লাইভ AI ও ট্রাফিক অনলাইনে ফিরলে চালু হবে।','No internet, but saved routes, fares, stations and favorites still work. Live AI and traffic resume when you are online.')}
        </p>
        <div style={{ display:'grid',gap:8,marginBottom:20 }}>
          {features.map(item => (
            <div key={item.en} style={{ display:'flex',alignItems:'center',gap:10,background:tk.panelMuted,border:`1px solid ${tk.line}`,borderRadius:14,padding:'10px 12px' }}>
              <span style={{ fontSize:18 }}>{item.icon}</span>
              <span style={{ flex:1,fontFamily:BEN,fontSize:13,fontWeight:700,color:tk.text }}>{T(lang,item.bn,item.en)}</span>
              <span style={{ fontFamily:SANS,fontSize:11,fontWeight:800,color:item.ok?tk.primary:tk.accent }}>
                {item.ok ? T(lang,'চালু','Ready') : T(lang,'অনলাইন দরকার','Online')}
              </span>
            </div>
          ))}
        </div>
        <button onClick={()=>window.location.reload()} style={{ width:'100%',background:tk.primary,color:tk.primaryInk,border:0,borderRadius:16,padding:'13px 18px',fontFamily:BEN,fontWeight:900,fontSize:14,cursor:'pointer' }}>
          {T(lang,'আবার চেষ্টা করুন','Try again')}
        </button>
      </div>
    </div>
  );
}

export function MaintenancePage({ theme, lang }: SystemProps) {
  return <SystemScreen theme={theme} lang={lang} tone={KJ_TOKENS[theme].amber} icon="⚙️" status="503"
    titleBn="রক্ষণাবেক্ষণ চলছে" titleEn="Under Maintenance"
    bodyBn="কই যাবো এখন রক্ষণাবেক্ষণের জন্য বন্ধ। শীঘ্রই ফিরে আসছি।" bodyEn="KoyJabo is down for maintenance. Check back soon."
    buttons={[{labelBn:'00:45:00 পরে চেষ্টা করুন',labelEn:'Back in 00:45:00',primary:true}]}/>;
}
