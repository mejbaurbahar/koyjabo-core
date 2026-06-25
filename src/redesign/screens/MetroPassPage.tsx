import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function MetroPassPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const passes = [
    { l:'Standard', bn:'স্ট্যান্ডার্ড', c:'#3b82f6', dep:'৳100',min:'৳100',disc:T(lang,'১০% ছাড়','10% discount'),desc:T(lang,'সকলের জন্য','For everyone') },
    { l:'Student', bn:'স্টুডেন্ট', c:'#10b981', dep:'৳100',min:'৳50',disc:T(lang,'২৫% ছাড়','25% discount'),desc:T(lang,'ছাত্র আইডি প্রয়োজন','Student ID required') },
    { l:'Senior', bn:'সিনিয়র', c:'#f59e0b', dep:'৳100',min:'৳50',disc:T(lang,'৫০% ছাড়','50% discount'),desc:T(lang,'বয়স্ক আইডি প্রয়োজন','Senior ID required') },
  ];
  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:700, margin:'0 auto' }}>
        <div style={{ background:'linear-gradient(135deg,#000814,#0369a1)', borderRadius:22, padding:isMobile?18:24, marginBottom:20, color:'#fff' }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:22,marginBottom:6 }}>{T(lang,'এমআরটি র‍্যাপিড পাস','MRT Rapid Pass')}</div>
          <p style={{ fontFamily:BEN,fontSize:14,opacity:0.85,margin:0 }}>{T(lang,'প্রতিদিনের মেট্রো যাত্রায় সাশ্রয়ী','Save on your daily metro commute')}</p>
        </div>

        {/* Pass types */}
        <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:20 }}>
          {passes.map((p,i)=>(
            <div key={i} style={{ ...card(16),borderLeft:`4px solid ${p.c}` }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
                <div>
                  <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text }}>{T(lang,p.bn,p.l)} Pass</div>
                  <div style={{ fontFamily:BEN,fontSize:12,color:tk.textDim }}>{p.desc}</div>
                </div>
                <div style={{ background:p.c+'22',padding:'6px 12px',borderRadius:10,fontFamily:SANS,fontWeight:700,fontSize:13,color:p.c }}>{p.disc}</div>
              </div>
              <div style={{ display:'flex',gap:16 }}>
                <div><div style={{ fontFamily:SANS,fontSize:10,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1 }}>{T(lang,'ডিপোজিট','Deposit')}</div><div style={{ fontFamily:SANS,fontWeight:700,fontSize:15,color:tk.text }}>{p.dep}</div></div>
                <div><div style={{ fontFamily:SANS,fontSize:10,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1 }}>{T(lang,'সর্বনিম্ন ব্যালেন্স','Min balance')}</div><div style={{ fontFamily:SANS,fontWeight:700,fontSize:15,color:tk.text }}>{p.min}</div></div>
              </div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:14 }}>{T(lang,'কীভাবে পাবেন','How to get Rapid Pass')}</div>
          {[
            { e:'🚇', t:T(lang,'যেকোনো MRT-6 স্টেশনের কাউন্টারে যান','Visit any MRT-6 station counter') },
            { e:'🪪', t:T(lang,'বৈধ ছবি সহ আইডি দিন','Present valid photo ID') },
            { e:'💳', t:T(lang,'৳১০০ ডিপোজিট + সর্বনিম্ন ব্যালেন্স দিন','Pay ৳100 deposit + minimum balance') },
            { e:'✅', t:T(lang,'কার্ড তাৎক্ষণিকভাবে দেওয়া হবে','Card issued immediately') },
          ].map((s,i)=>(
            <div key={i} style={{ display:'flex',gap:12,alignItems:'center',padding:'10px 0',borderBottom:i<3?`1px solid ${tk.line}`:'none' }}>
              <div style={{ width:36,height:36,borderRadius:10,background:tk.primarySoft,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>{s.e}</div>
              <span style={{ fontFamily:BEN,fontSize:13,color:tk.text }}>{s.t}</span>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:12 }}>{T(lang,'সুবিধাসমূহ','Benefits')}</div>
          <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10 }}>
            {[{e:'💸',l:T(lang,'১০% ছাড়','10% discount')},{e:'⚡',l:T(lang,'লাইন নেই','No queuing')},{e:'📱',l:T(lang,'কন্টাক্টলেস','Contactless')},{e:'🔄',l:T(lang,'রিলোড করুন','Reloadable')}].map((b,i)=>(
              <div key={i} style={{ background:tk.panelMuted,borderRadius:12,padding:12,display:'flex',flexDirection:'column',alignItems:'center',gap:6,textAlign:'center' }}>
                <span style={{ fontSize:22 }}>{b.e}</span>
                <span style={{ fontFamily:BEN,fontSize:12,color:tk.textDim }}>{b.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reload */}
        <div style={{ ...card(16),marginBottom:20 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text,marginBottom:10 }}>{T(lang,'রিলোড করার উপায়','Reload options')}</div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            {[T(lang,'স্টেশন কাউন্টার','Station counter'),'bKash','Nagad',T(lang,'ব্যাংকিং অ্যাপ','Banking app')].map((r,i)=>(
              <span key={i} style={{ padding:'6px 12px',borderRadius:999,background:tk.chipBg,color:tk.chipText,fontFamily:SANS,fontWeight:600,fontSize:12 }}>{r}</span>
            ))}
          </div>
        </div>
          <AdSlot tk={tk} lang={lang} kind="multiplex" />
        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
