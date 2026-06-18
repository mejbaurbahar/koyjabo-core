import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function PrivacyPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const sections = [
    { h:T(lang,'আমরা কী তথ্য সংগ্রহ করি','Data we collect'), body:T(lang,'আপনার অনুমতিতে অবস্থান, অ্যাকাউন্ট প্রোফাইল, সার্চ ইতিহাস, সেভ করা রুট, রিভিউ এবং আপলোড করা ছবি সংগ্রহ করা হতে পারে।','With your permission, we may collect location, account profile, search history, saved routes, reviews, and uploaded photos.') },
    { h:T(lang,'কীভাবে ব্যবহার করি','How we use it'), body:T(lang,'এই তথ্য রুট সাজেশন, প্রোফাইল সিঙ্ক, কমিউনিটি কনটেন্ট, নিরাপত্তা এবং অফলাইন অভিজ্ঞতা উন্নত করতে ব্যবহার করা হয়।','This data is used for route suggestions, profile sync, community content, safety, and improving the offline experience.') },
    { h:T(lang,'তৃতীয় পক্ষ ও নিয়ন্ত্রণ','Third parties and controls'), body:T(lang,'কমিউনিটি ডেটা Cloudflare/GitHub proxy দিয়ে সিঙ্ক হয় এবং বিজ্ঞাপনের জন্য Google AdSense ব্যবহার হতে পারে। আপনি ইতিহাস পরিষ্কার, প্রোফাইল আপডেট বা অ্যাকাউন্ট মুছে ফেলতে পারেন।','Community data syncs through the Cloudflare/GitHub proxy and Google AdSense may be used for ads. You can clear history, update your profile, or delete your account.') },
  ];

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:760, margin:'0 auto' }}>
        <div style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:8 }}>
          {T(lang,'আপডেট করা হয়েছে জুন ২০২৬','Updated June 2026')}
        </div>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?22:28,color:tk.text,marginBottom:8 }}>{T(lang,'গোপনীয়তা নীতি','Privacy Policy')}</h1>
        <p style={{ fontFamily:BEN,fontSize:14,color:tk.textDim,lineHeight:1.7,marginBottom:20 }}>
          {T(lang,'কই যাবো আপনার গোপনীয়তাকে গুরুত্ব দেয়। এই নীতি ব্যাখ্যা করে আমরা কোন তথ্য সংগ্রহ করি, কেন করি, এবং কীভাবে রক্ষা করি।','KoyJabo takes your privacy seriously. This policy explains what we collect, why, and how we keep it safe.')}
        </p>

        {/* TOC */}
        <div style={{ ...card(14),marginBottom:20 }}>
          <div style={{ fontFamily:SANS,fontSize:10,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:10 }}>{T(lang,'বিষয়সূচি','On this page')}</div>
          {sections.map((s,i)=>(
            <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'6px 0' }}>
              <span style={{ fontFamily:SANS,fontSize:11,fontWeight:600,color:tk.textFaint }}>{String(i+1).padStart(2,'0')}</span>
              <span style={{ fontFamily:BEN,fontSize:13,color:tk.primary,fontWeight:600 }}>{s.h}</span>
            </div>
          ))}
        </div>

        {sections.map((s,i)=>(
          <section key={i} style={{ marginBottom:20 }}>
            <h2 style={{ fontFamily:BEN,fontWeight:700,fontSize:17,color:tk.text,margin:'0 0 10px',display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ width:24,height:24,borderRadius:8,background:tk.primarySoft,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:SANS,fontWeight:700,fontSize:12,color:tk.primary }}>0{i+1}</span>
              {s.h}
            </h2>
            <p style={{ fontFamily:BEN,fontSize:14,color:tk.textDim,lineHeight:1.7,margin:0 }}>{s.body}</p>
          </section>
        ))}

        <div style={{ ...card(14),background:tk.primarySoft,borderColor:tk.primary }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.primary,marginBottom:6 }}>{T(lang,'আরও পড়ুন','Read full policy')}</div>
          <div style={{ fontFamily:BEN,fontSize:13,color:tk.textDim }}>{T(lang,'সম্পূর্ণ নীতির জন্য আমাদের সাথে যোগাযোগ করুন: koyjabo@gmail.com','For the full policy contact us at: koyjabo@gmail.com')}</div>
        </div>

        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
