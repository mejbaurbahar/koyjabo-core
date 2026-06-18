import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const QA = (lang:'bn'|'en') => [
  { q: T(lang,'গুলশান থেকে মতিঝিল কোন বাসে যাবো?','Which bus goes from Gulshan to Motijheel?'), a: T(lang,'গ্রীন লাইন, হানিফ, বিআরটিসি এই রুটে চলে। গ্রীন লাইন দ্রুততম — ৪৮ মিনিট, ভাড়া ৳৬০। গুলশান ২ বাস স্টপ থেকে উঠুন।','Green Line, Hanif, BRTC go this route. Green Line is fastest at 48 min, fare ৳60. Take from Gulshan 2 bus stop.') },
  { q: T(lang,'উত্তরা থেকে মতিঝিল মেট্রো ভাড়া কত?','How much is Metro fare from Uttara to Motijheel?'), a: T(lang,'পুরো যাত্রায় ৳১০০। কন্টাক্টলেস কার্ড বা টোকেন। স্টেশনে কিনুন।','৳100 for full journey. Contactless card or token. Buy at station.') },
  { q: T(lang,'ঢাকা থেকে কক্সবাজার কীভাবে যাবো?','How to go Cox\'s Bazar from Dhaka?'), a: T(lang,'বাস (গ্রীন লাইন/হানিফ): ৳৯০০–২৫০০, রাতের বাস, ১০–১২ ঘণ্টা। ট্রেন (কক্সবাজার এক্সপ্রেস): ৳২০০–১২০০, ৯ ঘণ্টা। ফ্লাইট (বিমান/ইউএস বাংলা): ৳৪৫০০+, ৫৫ মিনিট।','Bus (Green Line/Hanif): ৳900–2500, overnight, 10–12h. Train (Cox\'s Bazar Express): ৳200–1200, 9h. Flight (Biman/US-Bangla): ৳4500+, 55 min.') },
  { q: T(lang,'সদরঘাট লঞ্চের সময়সূচি কী?','What is Sadarghat launch schedule?'), a: T(lang,'বরিশাল, ভোলা, পটুয়াখালীর লঞ্চ সন্ধ্যা ৭–১০টায় ছাড়ে। পরদিন ভোরে পৌঁছায়।','Launches for Barisal, Bhola, Patuakhali depart 7–10PM. Arrive next morning.') },
  { q: T(lang,'ট্রেনের টিকেট অনলাইনে কীভাবে কিনবো?','How to buy train ticket online?'), a: T(lang,'eticket.railway.gov.bd ভিজিট করুন। কই যাবো শুধু তথ্য দেখায় — টিকেট বিক্রি করে না।','Visit eticket.railway.gov.bd. KoyJabo shows info only — purchase from official site.') },
  { q: T(lang,'কই যাবো কি অফলাইনে কাজ করে?','Does KoyJabo work offline?'), a: T(lang,'হ্যাঁ! PWA হিসেবে ইনস্টল করুন। রুট, ভাড়া, সময়সূচি ইন্টারনেট ছাড়াও কাজ করে।','Yes! Install as PWA. Routes, fares, schedules work without internet.') },
  { q: T(lang,'কই যাবো কি বিনামূল্যে?','Is KoyJabo free?'), a: T(lang,'১০০% বিনামূল্যে চিরকালের জন্য। অ-হস্তক্ষেপকারী বিজ্ঞাপন দ্বারা সমর্থিত।','100% free forever. Supported by non-intrusive ads.') },
  { q: T(lang,'ভুল তথ্য কীভাবে জানাবো?','How do I report wrong information?'), a: T(lang,'আমাদের সাথে koyjabo.com/contact পেজে যোগাযোগ করুন বা GitHub Issues ব্যবহার করুন।','Contact us at koyjabo.com/contact or via our GitHub Issues page.') },
];

export function QAPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const [open, setOpen] = useState<number|null>(null);
  const [search, setSearch] = useState('');
  const items = QA(lang).filter(q=>!search||q.q.toLowerCase().includes(search.toLowerCase())||q.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:760, margin:'0 auto' }}>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?22:28,color:tk.text,marginBottom:6 }}>{T(lang,'প্রশ্নোত্তর','Q & A')}</h1>
        <p style={{ fontFamily:BEN,fontSize:14,color:tk.textDim,marginBottom:20 }}>{T(lang,'সাধারণ প্রশ্নের উত্তর','Answers to common questions')}</p>

        {/* Search */}
        <div style={{ background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:14,padding:'12px 14px',display:'flex',gap:10,marginBottom:20 }}>
          <span style={{ fontSize:16 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={T(lang,'প্রশ্ন খুঁজুন...','Search questions...')}
            style={{ flex:1,background:'transparent',border:0,color:tk.text,fontFamily:BEN,fontSize:14,outline:'none' }}/>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {items.map((item,i)=>(
            <div key={i} style={{ background:tk.panel,border:`1px solid ${open===i?tk.primary:tk.line}`,borderRadius:14,overflow:'hidden',transition:'border-color .2s' }}>
              <button onClick={()=>setOpen(o=>o===i?null:i)} style={{ width:'100%',background:'transparent',border:0,padding:'16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,cursor:'pointer',textAlign:'left' }}>
                <span style={{ fontFamily:BEN,fontWeight:600,fontSize:15,color:tk.text,flex:1 }}>{item.q}</span>
                <span style={{ fontFamily:SANS,fontWeight:700,fontSize:18,color:open===i?tk.primary:tk.textFaint,transition:'color .2s,transform .2s',display:'inline-block',transform:open===i?'rotate(45deg)':'none' }}>+</span>
              </button>
              {open===i && (
                <div style={{ padding:'0 18px 16px',fontFamily:BEN,fontSize:14,color:tk.textDim,lineHeight:1.7,borderTop:`1px solid ${tk.line}`,paddingTop:12 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {items.length===0 && <div style={{ textAlign:'center',padding:40,color:tk.textFaint,fontFamily:BEN }}>{T(lang,'কোনো ফলাফল নেই।','No results found.')}</div>}

        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
