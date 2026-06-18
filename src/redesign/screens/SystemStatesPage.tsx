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
  return <SystemScreen theme={theme} lang={lang} tone={KJ_TOKENS[theme].primary} icon="📶" status="OFFLINE"
    titleBn="ইন্টারনেট নেই" titleEn="No Connection"
    bodyBn="আপনি অফলাইনে আছেন। সেভ করা রুট এখনও কাজ করছে!" bodyEn="You're offline. Saved routes still work!"
    buttons={[{labelBn:'আবার চেষ্টা',labelEn:'Try Again',primary:true},{labelBn:'অফলাইন ব্রাউজ করুন',labelEn:'Browse Offline'}]}/>;
}

export function MaintenancePage({ theme, lang }: SystemProps) {
  return <SystemScreen theme={theme} lang={lang} tone={KJ_TOKENS[theme].amber} icon="⚙️" status="503"
    titleBn="রক্ষণাবেক্ষণ চলছে" titleEn="Under Maintenance"
    bodyBn="কই যাবো এখন রক্ষণাবেক্ষণের জন্য বন্ধ। শীঘ্রই ফিরে আসছি।" bodyEn="KoyJabo is down for maintenance. Check back soon."
    buttons={[{labelBn:'00:45:00 পরে চেষ্টা করুন',labelEn:'Back in 00:45:00',primary:true}]}/>;
}
