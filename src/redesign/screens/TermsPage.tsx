import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function TermsPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const sections = [
    { h:T(lang,'তথ্য-মাত্র সেবা','Information only'), body:T(lang,'কই যাবো শুধুমাত্র তথ্য প্রদান করে — কোনো টিকেট বিক্রি করে না। টিকেটের জন্য সরাসরি অপারেটরের ওয়েবসাইট বা কাউন্টারে যান।','KoyJabo provides information only — no ticket sales. Purchase tickets directly at operator websites or counters.') },
    { h:T(lang,'ব্যবহারকারীর আচরণ','User conduct'), body:T(lang,'আপনি এই সেবা আইনি উদ্দেশ্যে ব্যবহার করতে সম্মত। স্প্যাম বা ক্ষতিকর বিষয়বস্তু নিষিদ্ধ।','You agree to use this service for lawful purposes. Spam or harmful content is prohibited.') },
    { h:T(lang,'মেধাস্বত্ব','Intellectual property'), body:T(lang,'কই যাবো এবং এর লোগো ট্রেডমার্ক। কোড MIT লাইসেন্সের অধীনে।','KoyJabo and its logo are trademarks. Code is under MIT license.') },
  ];

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:760, margin:'0 auto' }}>
        <div style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:8 }}>
          {T(lang,'আপডেট করা হয়েছে জুন ২০২৬','Updated June 2026')}
        </div>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?22:28,color:tk.text,marginBottom:8 }}>{T(lang,'সেবার শর্তাবলি','Terms of Service')}</h1>
        <p style={{ fontFamily:BEN,fontSize:14,color:tk.textDim,lineHeight:1.7,marginBottom:20 }}>
          {T(lang,'কই যাবো ব্যবহার করে আপনি এই শর্তাবলিতে সম্মত হন। অনুগ্রহ করে মনোযোগ দিয়ে পড়ুন।','By using KoyJabo, you agree to these terms. Please read them carefully.')}
        </p>

        <div style={{ ...card(14),marginBottom:20 }}>
          <div style={{ fontFamily:SANS,fontSize:10,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:10 }}>{T(lang,'বিষয়সূচি','On this page')}</div>
          {sections.map((s,i)=>(<div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'6px 0' }}><span style={{ fontFamily:SANS,fontSize:11,fontWeight:600,color:tk.textFaint }}>{String(i+1).padStart(2,'0')}</span><span style={{ fontFamily:BEN,fontSize:13,color:tk.primary,fontWeight:600 }}>{s.h}</span></div>))}
        </div>

        {sections.map((s,i)=>(
          <section key={i} style={{ marginBottom:20 }}>
            <h2 style={{ fontFamily:BEN,fontWeight:700,fontSize:17,color:tk.text,margin:'0 0 10px',display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ width:24,height:24,borderRadius:8,background:tk.amberSoft,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:SANS,fontWeight:700,fontSize:12,color:tk.amber }}>0{i+1}</span>{s.h}
            </h2>
            <p style={{ fontFamily:BEN,fontSize:14,color:tk.textDim,lineHeight:1.7,margin:0 }}>{s.body}</p>
          </section>
        ))}

        <div style={{ ...card(14),background:tk.amberSoft,borderColor:tk.amber }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.amber,marginBottom:6 }}>{T(lang,'প্রশ্ন আছে?','Have questions?')}</div>
          <div style={{ fontFamily:BEN,fontSize:13,color:tk.textDim }}>koyjabo@gmail.com</div>
        </div>

        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
