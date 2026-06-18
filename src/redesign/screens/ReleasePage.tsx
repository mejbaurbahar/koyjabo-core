import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const releases = [
  { v:'v1.5.2', date:'Jun 17, 2026', items:[T('en','Fixed footer overlap on install app page for mobile devices','Fixed footer overlap on install app page for mobile devices'),T('en','Removed live chat, hotline, and GitHub issues from contact page','Removed live chat, hotline, and GitHub issues from contact page')] },
  { v:'v1.5.1', date:'Jun 15, 2026', items:[T('en','Fixed blog post URL routing to show detail page on direct navigation','Fixed blog post URL routing to show detail page on direct navigation'),T('en','Fix blog navigation and remove ad placeholder text','Fix blog navigation and remove ad placeholder text')] },
  { v:'v1.5.0', date:'Jun 12, 2026', items:[T('en','Full futuristic UI redesign with glassmorphism and neon animations','Full futuristic UI redesign with glassmorphism and neon animations'),T('en','Added 3D animated vehicle illustrations','Added 3D animated vehicle illustrations'),T('en','Improved ad system across all pages','Improved ad system across all pages')] },
  { v:'v1.4.0', date:'May 28, 2026', items:[T('en','New: Domestic Flights hub (4 airlines, 8 airports)','New: Domestic Flights hub (4 airlines, 8 airports)'),T('en','Flight info for Biman, US-Bangla, Novoair, Air Astra','Flight info for Biman, US-Bangla, Novoair, Air Astra')] },
  { v:'v1.3.0', date:'May 15, 2026', items:[T('en','New: Launch & Steamer hub (Sadarghat terminal)','New: Launch & Steamer hub (Sadarghat terminal)'),T('en','Cabin class info and tonight\'s launches','Cabin class info and tonight\'s launches')] },
  { v:'v1.2.0', date:'May 1, 2026', items:[T('en','New: Train hub (Bangladesh Railway, 5 classes, PNR check)','New: Train hub (Bangladesh Railway, 5 classes, PNR check)'),T('en','Added Cox\'s Bazar Express and popular trains','Added Cox\'s Bazar Express and popular trains')] },
  { v:'v1.1.0', date:'Apr 15, 2026', items:[T('en','New: Metro Rail MRT-6 full hub (17 stations)','New: Metro Rail MRT-6 full hub (17 stations)'),T('en','Station map, fares, tokens, Rapid Pass info','Station map, fares, tokens, Rapid Pass info')] },
  { v:'v1.0.0', date:'Apr 1, 2026', items:[T('en','Initial launch — Local Bus routes + AI Assistant','Initial launch — Local Bus routes + AI Assistant'),T('en','Bilingual (বাংলা/English) support from day one','Bilingual (বাংলা/English) support from day one'),T('en','PWA offline support','PWA offline support')] },
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
                    <li key={j} style={{ fontFamily:BEN,fontSize:13,color:tk.textDim,lineHeight:1.7,marginBottom:2 }}>{item}</li>
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
