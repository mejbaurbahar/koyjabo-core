import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Pill } from '../components/Pill';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function BlogDetailPage(props: Props) {
  const { theme, device, lang, onNav } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:800, margin:'0 auto' }}>
        {/* Meta */}
        <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:12,flexWrap:'wrap' }}>
          <Pill tk={tk} tone="primary">Metro</Pill>
          <span style={{ fontFamily:SANS,fontSize:12,color:tk.textFaint }}>Jun 10, 2026 · 8 min read</span>
          <button style={{ marginLeft:'auto',background:'none',border:0,color:tk.textFaint,cursor:'pointer',fontFamily:SANS,fontSize:12,display:'flex',alignItems:'center',gap:4 }}>🔗 {T(lang,'শেয়ার','Share')}</button>
        </div>

        {/* Hero image */}
        <div style={{ height:200,background:'linear-gradient(135deg,#1e3a8a,#4338ca)',borderRadius:18,marginBottom:16,display:'flex',alignItems:'flex-end',padding:20 }}>
          <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?22:28,color:'#fff',margin:0,textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
            {T(lang,'মেট্রো রেল সম্পূর্ণ গাইড ২০২৬','MRT-6 Complete Guide 2026')}
          </h1>
        </div>

        {/* Author */}
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
          <div style={{ width:36,height:36,borderRadius:999,background:`linear-gradient(135deg,${tk.primary},${tk.primaryDeep})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:SANS,fontWeight:700,fontSize:14 }}>KJ</div>
          <div>
            <div style={{ fontFamily:SANS,fontWeight:600,fontSize:13,color:tk.text }}>KoyJabo Team</div>
            <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint }}>Jun 10, 2026</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ fontFamily:BEN,fontSize:15,color:tk.textDim,lineHeight:1.8,marginBottom:16 }}>
          {T(lang,
            'ঢাকা মেট্রো রেল (MRT Line 6) বাংলাদেশের প্রথম গণপরিবহন মেট্রো সিস্টেম। উত্তরা থেকে কমলাপুর পর্যন্ত বিস্তৃত এই লাইনে মোট ১৭টি স্টেশন রয়েছে।',
            'Dhaka Metro Rail (MRT Line 6) is Bangladesh\'s first rapid transit system. It runs from Uttara to Kamalapur with 17 stations.'
          )}
        </div>

        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>

        <h2 style={{ fontFamily:BEN,fontWeight:700,fontSize:18,color:tk.text,margin:'20px 0 12px' }}>{T(lang,'সকল ১৭ স্টেশন ও ভাড়া','All 17 Stations & Fares')}</h2>
        <div style={{ ...card(14),marginBottom:16,overflowX:'auto' }}>
          <table style={{ width:'100%',borderCollapse:'collapse',fontFamily:SANS,fontSize:13 }}>
            <thead><tr style={{ background:tk.primarySoft }}>
              {[T(lang,'স্টেশন','Station'),'Code',T(lang,'ভাড়া','Fare')].map((h,i)=>(<th key={i} style={{ padding:'8px 10px',textAlign:'left',color:tk.text,fontWeight:700 }}>{h}</th>))}
            </tr></thead>
            <tbody>
              {[['Uttara North','UNS','৳0'],['Uttara Center','UTC','৳20'],['Uttara South','UTS','৳20'],['Pallabi','PAL','৳30'],['Mirpur 11','M11','৳40'],['Mirpur 10','M10','৳50'],['Kazipara','KAZ','৳60'],['Shewrapara','SHW','৳60'],['Agargaon','AGA','৳70'],['Bijoy Sarani','BJS','৳80'],['Farmgate','FGT','৳80'],['Karwan Bazar','KBZ','৳90'],['Shahbag','SHB','৳90'],['Dhaka University','DHU','৳90'],['Secretariat','SEC','৳100'],['Motijheel','MOT','৳100'],['Kamalapur','KMP','৳100']].map(([s,c,f],i)=>(
                <tr key={i} style={{ borderTop:`1px solid ${tk.line}` }}>
                  <td style={{ padding:'8px 10px',color:tk.text,fontFamily:BEN,fontWeight:i===0||i===16?700:400 }}>{s}</td>
                  <td style={{ padding:'8px 10px',color:tk.textFaint,fontFamily:SANS,fontSize:11 }}>{c}</td>
                  <td style={{ padding:'8px 10px',color:tk.primary,fontWeight:700 }}>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ fontFamily:BEN,fontWeight:700,fontSize:18,color:tk.text,margin:'20px 0 12px' }}>{T(lang,'চলাচলের সময়','Operating Hours')}</h2>
        <div style={{ ...card(14),marginBottom:16 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            {[{l:T(lang,'প্রথম ট্রেন','First train'),v:'7:10 AM'},{l:T(lang,'শেষ ট্রেন','Last train'),v:'9:40 PM'},{l:T(lang,'ব্যবধান','Headway'),v:'10 min'},{l:T(lang,'সক্ষমতা','Capacity'),v:'2,308 pax'}].map((d,i)=>(
              <div key={i} style={{ background:tk.panelMuted,borderRadius:10,padding:12 }}>
                <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint }}>{d.l}</div>
                <div style={{ fontFamily:SANS,fontWeight:800,fontSize:16,color:tk.text,marginTop:2 }}>{d.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20 }}>
          {['metro','guide','MRT-6','Dhaka'].map(t=>(<span key={t} style={{ background:tk.chipBg,padding:'4px 10px',borderRadius:999,fontFamily:SANS,fontSize:12,color:tk.chipText }}>#{t}</span>))}
        </div>

        {/* Related */}
        <h3 style={{ fontFamily:BEN,fontWeight:700,fontSize:16,color:tk.text,marginBottom:12 }}>{T(lang,'সম্পর্কিত পোস্ট','Related posts')}</h3>
        <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12 }}>
          {[{t:T(lang,'MRT Rapid Pass গাইড','MRT Rapid Pass Guide'),c:'#3b82f6→#1e3a8a'},{t:T(lang,'মেট্রো টিকেট কীভাবে কিনবেন','How to Buy Metro Ticket'),c:'#10b981→#064e3b'}].map((r,i)=>(
            <div key={i} onClick={()=>onNav('blog-detail')} style={{ ...card(14),cursor:'pointer' }}>
              <div style={{ height:80,background:`linear-gradient(135deg,${r.c.split('→')[0]},${r.c.split('→')[1]})`,borderRadius:10,marginBottom:10 }}/>
              <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text }}>{r.t}</div>
            </div>
          ))}
        </div>

        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
