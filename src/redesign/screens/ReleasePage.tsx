import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { RELEASE_NOTES } from '../../../data/releaseNotes';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

// Merge hardcoded UI releases with data/releaseNotes.ts entries
const UI_RELEASES = [
  { v:'v1.6.0', date:'Jun 20, 2026', items:['Cloudflare Workers AI (Llama 3.3 70B) — smarter answers','GPS-based location detection for AI routing','Route direction fix: destination always correctly detected','Direct buses shown first in route results','Human-friendly route format with 💡 reasoning','Transport knowledge layer with verified source labels','Location consent modal + Settings location toggle'] },
  { v:'v1.5.2', date:'Jun 17, 2026', items:['Fixed footer overlap on install app page for mobile devices','Removed live chat, hotline, and GitHub issues from contact page'] },
  { v:'v1.5.1', date:'Jun 15, 2026', items:['Fixed blog post URL routing to show detail page on direct navigation','Fix blog navigation and remove ad placeholder text'] },
  { v:'v1.5.0', date:'Jun 12, 2026', items:['Full futuristic UI redesign with glassmorphism and neon animations','Added 3D animated vehicle illustrations','Improved ad system across all pages'] },
  { v:'v1.4.0', date:'May 28, 2026', items:['New: Domestic Flights hub (4 airlines, 8 airports)','Flight info for Biman, US-Bangla, Novoair, Air Astra'] },
  { v:'v1.3.0', date:'May 15, 2026', items:["New: Launch & Steamer hub (Sadarghat terminal)","Cabin class info and tonight's launches"] },
  { v:'v1.2.0', date:'May 1, 2026', items:["New: Train hub (Bangladesh Railway, 5 classes, PNR check)","Added Cox's Bazar Express and popular trains"] },
  { v:'v1.1.0', date:'Apr 15, 2026', items:['New: Metro Rail MRT-6 full hub (17 stations)','Station map, fares, tokens, Rapid Pass info'] },
  { v:'v1.0.0', date:'Apr 1, 2026', items:['Initial launch — Local Bus routes + AI Assistant','Bilingual (বাংলা/English) support from day one','PWA offline support'] },
];

// Convert RELEASE_NOTES data format to display format
const DATA_RELEASES = RELEASE_NOTES.map(r => ({
  v: `v${r.version}`,
  date: new Date(r.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
  items: [...(r.features||[]), ...(r.fixes||[]), ...(r.improvements||[])],
  bnItems: [...(r.bnFeatures||[]), ...(r.bnFixes||[]), ...(r.bnImprovements||[])],
}));

const releases = [...UI_RELEASES, ...DATA_RELEASES];

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
                  {((lang === 'bn' && (r as any).bnItems?.length ? (r as any).bnItems : r.items)).map((item: string, j: number)=>(
                    <li key={j} style={{ fontFamily:BEN,fontSize:13,color:tk.textDim,lineHeight:1.7,marginBottom:2 }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
          <AdSlot tk={tk} lang={lang} kind="multiplex" />
        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
