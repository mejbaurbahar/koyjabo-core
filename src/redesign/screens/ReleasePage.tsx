import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const releases = [
  { v:'v1.5.5', date:'Jun 19, 2026', items:[
    { bn:'মেট্রো লাইভ দাবির বদলে বাস্তব MRT-6 সার্ভিস গাইড দেখানো হয়েছে।', en:'Replaced fake Metro Live claims with a real MRT-6 service guide.' },
    { bn:'সেভ করা রুটে ডেমো ডেটা সরিয়ে বাস্তব সেভ ডেটা বা খালি বার্তা দেখানো হয়েছে।', en:'Removed demo saved routes and now shows real saved data or an empty message.' },
    { bn:'প্রোফাইল ছবির PNG/JPG, ২MB এবং নিরাপদ ইমেজ যাচাই যোগ হয়েছে।', en:'Added PNG/JPG, 2MB, and safe-image validation for profile photos.' },
  ] },
  { v:'v1.5.4', date:'Jun 19, 2026', items:[
    { bn:'বাস লাইভ ম্যাপ এবং রিভিউ/ফটো পেজের ডিজাইন ঠিক করা হয়েছে।', en:'Fixed bus live map and review/photo page styling.' },
    { bn:'বাংলা/ইংরেজি ভাষা বদলালে প্রতিষ্ঠাতা সেকশন অনুবাদ হয়।', en:'Founder section now follows Bangla/English language selection.' },
  ] },
  { v:'v1.5.3', date:'Jun 18, 2026', items:[
    { bn:'লগইন, সাইনআপ, প্রোফাইল এবং সাইনআউট ফ্লো উন্নত করা হয়েছে।', en:'Improved login, signup, profile, and sign-out flows.' },
    { bn:'ফেভারিট, ইতিহাস এবং সাম্প্রতিক কথোপকথনে ডেমো ডেটা সরানো হয়েছে।', en:'Removed demo data from favorites, history, and recent conversations.' },
  ] },
];

export function ReleasePage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:760, margin:'0 auto' }}>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?22:28,color:tk.text,marginBottom:6 }}>{T(lang,'রিলিজ নোট','Release Notes')}</h1>
        <p style={{ fontFamily:BEN,fontSize:14,color:tk.textDim,marginBottom:24 }}>{T(lang,'কই যাবো কী নতুন আনলো','What\'s new in KoyJabo')}</p>

        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          {releases.map((r,i)=>(
            <div key={i} style={{ display:'flex',gap:16 }}>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0 }}>
                <div style={{ width:12,height:12,borderRadius:999,background:i===0?tk.primary:tk.line,marginTop:4,boxShadow:i===0?`0 0 0 4px ${tk.primarySoft}`:'' }}/>
                {i<releases.length-1 && <div style={{ width:2,flex:1,background:tk.line,marginTop:6 }}/>}
              </div>
              <div style={{ flex:1,paddingBottom:i<releases.length-1?16:0 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                  <span style={{ background:i===0?tk.primary:tk.panelMuted,color:i===0?tk.primaryInk:tk.textDim,fontFamily:SANS,fontWeight:800,fontSize:12,padding:'4px 10px',borderRadius:999 }}>{r.v}</span>
                  <span style={{ fontFamily:SANS,fontSize:12,color:tk.textFaint }}>{r.date}</span>
                </div>
                <ul style={{ margin:0,padding:'0 0 0 14px' }}>
                  {r.items.map((item,j)=>(
                    <li key={j} style={{ fontFamily:BEN,fontSize:13,color:tk.textDim,lineHeight:1.7,marginBottom:2 }}>{T(lang,item.bn,item.en)}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
