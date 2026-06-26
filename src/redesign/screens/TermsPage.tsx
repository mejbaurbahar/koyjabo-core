import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

interface Section {
  h: string;
  body: string;
  bullets?: string[];
}

export function TermsPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const lbl = (en: string, bn: string) => lang === 'bn' ? bn : en;

  const sections: Section[] = [
    {
      h: lbl('1. Acceptance of terms', '১. শর্তাবলি গ্রহণ'),
      body: lbl('By accessing KoyJabo via koyjabo.com, dev.koyjabo.com, our mobile PWA, or any subdomain, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please discontinue use immediately.', 'koyjabo.com, dev.koyjabo.com, আমাদের মোবাইল PWA, বা যেকোনো সাবডোমেইনের মাধ্যমে কই যাবো ব্যবহার করে আপনি এই সেবার শর্তাবলি ও গোপনীয়তা নীতি মেনে চলতে সম্মত হন। সম্মত না হলে অবিলম্বে ব্যবহার বন্ধ করুন।'),
    },
    {
      h: lbl('2. Information-only service', '২. শুধুমাত্র তথ্য সেবা'),
      body: lbl('KoyJabo provides transport route information, fare estimates, and trip planning tools — nothing more.', 'কই যাবো পরিবহন রুট তথ্য, ভাড়া অনুমান, ও ট্রিপ প্ল্যানিং টুল প্রদান করে — এর বেশি কিছু নয়।'),
      bullets: [
        lbl('We do NOT sell tickets — purchase directly from operator counters or apps.', 'আমরা টিকেট বিক্রি করি না — অপারেটর কাউন্টার বা অ্যাপ থেকে সরাসরি কিনুন।'),
        lbl('We do NOT operate any vehicles — buses, trains, flights, launches, and trucks are run by their respective operators.', 'আমরা কোনো যানবাহন চালাই না — বাস, ট্রেন, ফ্লাইট, লঞ্চ, ও ট্রাক সংশ্লিষ্ট অপারেটররা চালায়।'),
        lbl('We do NOT process payments — booking happens via the operator\'s own channel.', 'আমরা পেমেন্ট প্রসেস করি না — বুকিং অপারেটরের নিজস্ব চ্যানেলে হয়।'),
        lbl('We are NOT liable for service quality of third-party operators.', 'তৃতীয়-পক্ষ অপারেটরের সেবা মানের জন্য আমরা দায়ী নই।'),
      ],
    },
    {
      h: lbl('3. Accuracy & disclaimer', '৩. নির্ভুলতা ও দাবিত্যাগ'),
      body: lbl('We make best-effort to provide accurate, up-to-date route and fare information. However:', 'নির্ভুল ও সাম্প্রতিক রুট ও ভাড়া তথ্য প্রদানের সর্বোচ্চ চেষ্টা করি। তবে:'),
      bullets: [
        lbl('Fares may change without notice (BRTA, fuel prices, seasonal surcharges).', 'ভাড়া নোটিশ ছাড়াই বদলাতে পারে (BRTA, জ্বালানির দাম, মৌসুমি সারচার্জ)।'),
        lbl('Routes may be diverted due to traffic, weather, or road works.', 'ট্রাফিক, আবহাওয়া, বা রাস্তার কাজের কারণে রুট বদলাতে পারে।'),
        lbl('Schedules are approximate — always verify with the operator before traveling.', 'সময়সূচি আনুমানিক — যাত্রার আগে অপারেটরের সাথে যাচাই করুন।'),
        lbl('Truck fare estimates are market rates from public sources, not binding quotes.', 'ট্রাক ভাড়া অনুমান পাবলিক সোর্স থেকে মার্কেট রেট, বাধ্যতামূলক কোট নয়।'),
        lbl('AI Assistant responses are best-effort suggestions — verify critical info independently.', 'AI সহায়ক উত্তর সর্বোচ্চ চেষ্টায় সুপারিশ — গুরুত্বপূর্ণ তথ্য আলাদাভাবে যাচাই করুন।'),
      ],
    },
    {
      h: lbl('4. User accounts', '৪. ইউজার অ্যাকাউন্ট'),
      body: lbl('Account features are optional. If you create an account:', 'অ্যাকাউন্ট ফিচার ঐচ্ছিক। অ্যাকাউন্ট তৈরি করলে:'),
      bullets: [
        lbl('You are responsible for keeping your password secure.', 'আপনার পাসওয়ার্ড নিরাপদ রাখার দায়িত্ব আপনার।'),
        lbl('Provide accurate email and display name; no impersonation.', 'সঠিক ইমেইল ও ডিসপ্লে নাম দিন; অন্যের পরিচয়ে নয়।'),
        lbl('One account per person; sharing accounts may lead to suspension.', 'প্রতি ব্যক্তি একটি অ্যাকাউন্ট; শেয়ার করলে স্থগিত হতে পারে।'),
        lbl('We may suspend accounts for spam, abuse, or breach of these terms.', 'স্প্যাম, অপব্যবহার, বা শর্ত লঙ্ঘনের জন্য অ্যাকাউন্ট স্থগিত করতে পারি।'),
        lbl('Delete your account anytime: Settings → Sign out → contact support to fully purge.', 'যেকোনো সময় অ্যাকাউন্ট মুছুন: Settings → Sign out → পূর্ণ মুছতে সাপোর্টে যোগাযোগ।'),
      ],
    },
    {
      h: lbl('5. Acceptable use', '৫. গ্রহণযোগ্য ব্যবহার'),
      body: lbl('You agree NOT to:', 'আপনি সম্মত হন NOT to:'),
      bullets: [
        lbl('Scrape, mirror, or republish KoyJabo data without written permission (community/personal use OK).', 'লিখিত অনুমতি ছাড়া কই যাবো ডেটা স্ক্র্যাপ, মিরর, বা পুনঃপ্রকাশ করা (কমিউনিটি/ব্যক্তিগত ব্যবহার ঠিক)।'),
        lbl('Submit false route or fare reviews intended to mislead.', 'বিভ্রান্ত করার জন্য মিথ্যা রুট বা ভাড়া রিভিউ জমা দেওয়া।'),
        lbl('Reverse-engineer or attempt to bypass security measures (Turnstile, rate limits).', 'রিভার্স-ইঞ্জিনিয়ার বা সিকিউরিটি ব্যবস্থা (Turnstile, রেট লিমিট) বাইপাস চেষ্টা।'),
        lbl('Use automated tools (bots, scrapers) to access the service in bulk.', 'বাল্কে সেবা অ্যাক্সেসে স্বয়ংক্রিয় টুল (বট, স্ক্র্যাপার) ব্যবহার।'),
        lbl('Upload illegal, defamatory, harassing, or harmful content to community features.', 'কমিউনিটি ফিচারে অবৈধ, মানহানিকর, হয়রানিমূলক, বা ক্ষতিকর সামগ্রী আপলোড।'),
        lbl('Use KoyJabo for any commercial purpose without prior written approval.', 'আগে লিখিত অনুমোদন ছাড়া বাণিজ্যিক উদ্দেশ্যে কই যাবো ব্যবহার।'),
      ],
    },
    {
      h: lbl('6. Intellectual property', '৬. মেধাস্বত্ব'),
      body: lbl('All content on KoyJabo is protected:', 'কই যাবোর সব সামগ্রী সুরক্ষিত:'),
      bullets: [
        lbl('Source code: MIT License — open source at github.com/mejbaurbahar/koyjabo-core.', 'সোর্স কোড: MIT লাইসেন্স — github.com/mejbaurbahar/koyjabo-core-এ ওপেন সোর্স।'),
        lbl('Transport route data: CC-BY-4.0 — free to use with attribution.', 'পরিবহন রুট ডেটা: CC-BY-4.0 — অ্যাট্রিবিউশনসহ ফ্রি ব্যবহার।'),
        lbl('Logo, brand name "KoyJabo / কই যাবো": trademarks of Mejbaur Bahar Fagun.', 'লোগো, ব্র্যান্ড নাম "KoyJabo / কই যাবো": Mejbaur Bahar Fagun-এর ট্রেডমার্ক।'),
        lbl('AI-generated blog cover images: CC0 (public domain).', 'AI-জেনারেটেড ব্লগ কভার ইমেজ: CC0 (পাবলিক ডোমেইন)।'),
        lbl('User-submitted reviews/photos: you retain ownership, grant us a worldwide royalty-free license to display.', 'ইউজার-জমা দেওয়া রিভিউ/ফটো: মালিকানা আপনার, প্রদর্শনের জন্য আমাদের বিশ্বব্যাপী রয়্যালটি-ফ্রি লাইসেন্স দেন।'),
      ],
    },
    {
      h: lbl('7. Advertising', '৭. বিজ্ঞাপন'),
      body: lbl('KoyJabo is free and supported by ads via Google AdSense. Ads are displayed in clearly marked slots. We do not endorse advertised products. Ad personalization can be controlled via Google\'s ad settings: adssettings.google.com.', 'কই যাবো ফ্রি এবং Google AdSense-এর মাধ্যমে বিজ্ঞাপন-সমর্থিত। বিজ্ঞাপন স্পষ্টভাবে চিহ্নিত স্লটে দেখানো হয়। আমরা বিজ্ঞাপিত পণ্য অনুমোদন করি না। বিজ্ঞাপন ব্যক্তিগতকরণ Google-এর ad settings-এ নিয়ন্ত্রণ করুন: adssettings.google.com।'),
    },
    {
      h: lbl('8. Truck & freight bookings', '৮. ট্রাক ও পণ্য বুকিং'),
      body: lbl('The Truck & Freight feature is a fare-estimator and partner-directory only.', 'ট্রাক ও পণ্য ফিচার শুধু ভাড়া-অনুমানক ও পার্টনার-ডিরেক্টরি।'),
      bullets: [
        lbl('We do not book on your behalf. Calls placed via "Call to book" go directly to the partner.', 'আমরা আপনার পক্ষে বুক করি না। "Call to book"-এ দেওয়া কল সরাসরি পার্টনারের কাছে যায়।'),
        lbl('Fare estimates are market-rate calculations, not binding quotes. Actual price depends on bidding, traffic, and partner pricing.', 'ভাড়া অনুমান মার্কেট-রেট গণনা, বাধ্যতামূলক কোট নয়। আসল দাম বিডিং, ট্রাফিক, ও পার্টনার প্রাইসিং-এর উপর নির্ভর করে।'),
        lbl('We are not party to any contract between you and the freight partner.', 'আপনি ও ফ্রেইট পার্টনারের মধ্যে কোনো চুক্তিতে আমরা পক্ষ নই।'),
        lbl('Damage, loss, delay, or dispute: resolve directly with the partner using your booking record.', 'ক্ষতি, হ্রাস, বিলম্ব, বা বিতর্ক: পার্টনারের সাথে আপনার বুকিং রেকর্ড দিয়ে সরাসরি সমাধান।'),
      ],
    },
    {
      h: lbl('9. KoyCoins reward program', '৯. KoyCoins রিওয়ার্ড প্রোগ্রাম'),
      body: lbl('KoyCoins are loyalty points earned by using KoyJabo features (searches, AI chat, sign-up). They:', 'KoyCoins হল কই যাবোর ফিচার ব্যবহার করে অর্জিত লয়্যালটি পয়েন্ট (সার্চ, AI চ্যাট, সাইন-আপ)। এগুলো:'),
      bullets: [
        lbl('Have no monetary value and cannot be redeemed for cash.', 'আর্থিক মূল্য নেই এবং নগদে রিডিম করা যায় না।'),
        lbl('Are non-transferable between accounts.', 'অ্যাকাউন্টের মধ্যে স্থানান্তরযোগ্য নয়।'),
        lbl('Expire after 12 months of account inactivity.', 'অ্যাকাউন্ট ১২ মাস নিষ্ক্রিয় থাকলে মেয়াদ শেষ।'),
        lbl('Can be revoked for fraud or terms violations.', 'জালিয়াতি বা শর্ত লঙ্ঘনের জন্য বাতিল করা যেতে পারে।'),
      ],
    },
    {
      h: lbl('10. Limitation of liability', '১০. দায়বদ্ধতা সীমাবদ্ধতা'),
      body: lbl('To the maximum extent permitted by law, KoyJabo and Mejbaur Bahar Fagun are NOT liable for:', 'আইনি অনুমতির সর্বোচ্চ সীমায়, কই যাবো ও Mejbaur Bahar Fagun দায়ী নন:'),
      bullets: [
        lbl('Indirect, incidental, or consequential damages from using the service.', 'সেবা ব্যবহারের পরোক্ষ, আনুষঙ্গিক, বা পরিণতিগত ক্ষতির জন্য।'),
        lbl('Missed connections, financial loss, or trip disruption due to inaccurate data.', 'ভুল ডেটার কারণে মিসড কানেকশন, আর্থিক ক্ষতি, বা ট্রিপ ব্যাঘাত।'),
        lbl('Loss of locally stored data (browser localStorage may clear).', 'লোকাল-স্টোরড ডেটার হ্রাস (ব্রাউজার localStorage মুছে যেতে পারে)।'),
        lbl('Third-party operator service failures, accidents, or delays.', 'তৃতীয়-পক্ষ অপারেটরের সেবা ব্যর্থতা, দুর্ঘটনা, বা বিলম্ব।'),
        lbl('Total liability capped at BDT 1,000 (or equivalent) per claim.', 'প্রতি দাবিতে মোট দায়বদ্ধতা ১,০০০ টাকা (বা সমতুল্য) সীমিত।'),
      ],
    },
    {
      h: lbl('11. Indemnification', '১১. ক্ষতিপূরণ'),
      body: lbl('You agree to indemnify and hold harmless KoyJabo, its operators, and contributors from any claim, loss, or liability arising from your violation of these terms, your misuse of the service, or your infringement of any third-party right.', 'কই যাবো, এর অপারেটর, ও অবদানকারীদের আপনার শর্ত লঙ্ঘন, সেবার অপব্যবহার, বা তৃতীয়-পক্ষ অধিকারের লঙ্ঘন থেকে উদ্ভূত যেকোনো দাবি, ক্ষতি, বা দায় থেকে ক্ষতিপূরণ ও অক্ষত রাখতে সম্মত হন।'),
    },
    {
      h: lbl('12. Governing law', '১২. প্রযোজ্য আইন'),
      body: lbl('These terms are governed by the laws of the People\'s Republic of Bangladesh. Disputes shall be resolved in the courts of Dhaka, Bangladesh. International users agree to this jurisdiction for any dispute related to KoyJabo.', 'এই শর্তাবলি বাংলাদেশ গণপ্রজাতন্ত্রের আইন দ্বারা পরিচালিত। বিতর্ক ঢাকা, বাংলাদেশের আদালতে সমাধান হবে। আন্তর্জাতিক ব্যবহারকারীরা কই যাবো সম্পর্কিত যেকোনো বিতর্কের জন্য এই এখতিয়ারে সম্মত হন।'),
    },
    {
      h: lbl('13. Termination', '১৩. সমাপ্তি'),
      body: lbl('We may suspend or terminate your access at any time, with or without notice, for breach of these terms. You may stop using KoyJabo at any time by closing your browser or deleting the PWA. Sections on Liability, IP, and Governing Law survive termination.', 'শর্ত লঙ্ঘনের জন্য আমরা যেকোনো সময়, নোটিশসহ বা ছাড়া, আপনার অ্যাক্সেস স্থগিত বা সমাপ্ত করতে পারি। আপনি যেকোনো সময় ব্রাউজার বন্ধ বা PWA মুছে ফেলে কই যাবো ব্যবহার বন্ধ করতে পারেন। দায়বদ্ধতা, IP, ও প্রযোজ্য আইন বিভাগ সমাপ্তির পরও কার্যকর থাকে।'),
    },
    {
      h: lbl('14. Changes to terms', '১৪. শর্তাবলিতে পরিবর্তন'),
      body: lbl('We may update these terms periodically. The "Updated" date at the top reflects the latest revision. Material changes will be announced via in-app banner. Continued use after changes constitutes acceptance of the new terms.', 'আমরা সময়ে সময়ে এই শর্তাবলি আপডেট করতে পারি। উপরের "Updated" তারিখ সর্বশেষ সংশোধন প্রতিফলিত করে। বড় পরিবর্তন ইন-অ্যাপ ব্যানারের মাধ্যমে ঘোষণা হবে। পরিবর্তনের পরে ব্যবহার চালিয়ে গেলে নতুন শর্ত গ্রহণ করা হয়।'),
    },
    {
      h: lbl('15. Severability', '১৫. বিচ্ছিন্নযোগ্যতা'),
      body: lbl('If any provision of these terms is held to be unenforceable or invalid, the remaining provisions shall continue in full force and effect.', 'এই শর্তাবলির কোনো বিধান অপ্রয়োগযোগ্য বা অবৈধ ঘোষিত হলে, বাকি বিধানগুলি পূর্ণ শক্তি ও প্রভাবে অব্যাহত থাকবে।'),
    },
    {
      h: lbl('16. Contact', '১৬. যোগাযোগ'),
      body: lbl('Questions about these terms?', 'এই শর্তাবলি সম্পর্কে প্রশ্ন?'),
      bullets: [
        'Email: koyjabo@gmail.com',
        'GitHub: github.com/mejbaurbahar/koyjabo-core',
        lbl('Mailing: Dhaka, Bangladesh', 'মেইলিং: ঢাকা, বাংলাদেশ'),
      ],
    },
  ];

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:760, margin:'0 auto' }}>
        <div style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:8 }}>
          {T(lang,'আপডেট: ২৬ জুন ২০২৬','Updated: June 26, 2026')}
        </div>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?22:28,color:tk.text,marginBottom:8 }}>{T(lang,'সেবার শর্তাবলি','Terms of Service')}</h1>
        <p style={{ fontFamily:BEN,fontSize:14,color:tk.textDim,lineHeight:1.7,marginBottom:20 }}>
          {T(lang,'কই যাবো ব্যবহার করে আপনি এই শর্তাবলিতে সম্মত হন। অনুগ্রহ করে মনোযোগ দিয়ে পড়ুন।','By using KoyJabo, you agree to these terms. Please read them carefully.')}
        </p>

        {/* TL;DR */}
        <details open className="kj-summary" style={{ ...card(14), background:tk.amberSoft, border:`1px solid ${tk.amber}55`, marginBottom:20 }}>
          <summary style={{ fontFamily:SANS,fontSize:11,fontWeight:800,color:tk.amber,letterSpacing:1.4,textTransform:'uppercase',cursor:'pointer' }}>
            {T(lang,'সংক্ষেপে','TL;DR')}
          </summary>
          <p style={{ fontFamily:BEN,fontSize:13,color:tk.text,lineHeight:1.7,margin:'8px 0 0' }}>
            {T(lang,'কই যাবো শুধু পরিবহন তথ্য দেয়। আমরা টিকেট বিক্রি করি না বা যান চালাই না। ভাড়া ও সময়সূচি অনুমানিক — যাত্রার আগে যাচাই করুন। ফ্রি ব্যবহার, বিজ্ঞাপন-সমর্থিত। আইনি প্রশ্নে: ঢাকার আদালতে এখতিয়ার।','KoyJabo provides transport info only. We do not sell tickets or operate vehicles. Fares and schedules are approximate — verify before travel. Free, ad-supported. Legal questions: Dhaka jurisdiction.')}
          </p>
        </details>

        {/* TOC */}
        <div style={{ ...card(14),marginBottom:20 }}>
          <div style={{ fontFamily:SANS,fontSize:10,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:10 }}>{T(lang,'বিষয়সূচি','On this page')}</div>
          {sections.map((s,i)=>(
            <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'5px 0' }}>
              <span style={{ fontFamily:SANS,fontSize:11,fontWeight:600,color:tk.textFaint }}>{String(i+1).padStart(2,'0')}</span>
              <span style={{ fontFamily:BEN,fontSize:13,color:tk.amber,fontWeight:600 }}>{s.h.replace(/^\d+\.\s*|^[০-৯]+\.\s*/, '')}</span>
            </div>
          ))}
        </div>

        {sections.map((s,i)=>(
          <section key={i} style={{ marginBottom:24 }}>
            <h2 style={{ fontFamily:BEN,fontWeight:700,fontSize:17,color:tk.text,margin:'0 0 10px',display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ width:28,height:28,borderRadius:8,background:tk.amberSoft,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:SANS,fontWeight:700,fontSize:12,color:tk.amber,flexShrink:0 }}>{i+1}</span>
              {s.h.replace(/^\d+\.\s*|^[০-৯]+\.\s*/, '')}
            </h2>
            <p style={{ fontFamily:BEN,fontSize:14,color:tk.textDim,lineHeight:1.7,margin:'0 0 8px' }}>{s.body}</p>
            {s.bullets && (
              <ul style={{ margin:0, padding:'0 0 0 18px', listStyleType:'disc' }}>
                {s.bullets.map((b,k)=>(
                  <li key={k} style={{ fontFamily:BEN, fontSize:13, color:tk.textDim, lineHeight:1.7, marginBottom:4 }}>{b}</li>
                ))}
              </ul>
            )}
            {i === 7 && <AdSlot tk={tk} lang={lang} kind="in-article" />}
          </section>
        ))}

        <div style={{ ...card(14),background:tk.amberSoft,borderColor:tk.amber, marginTop:20 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.amber,marginBottom:6 }}>{T(lang,'প্রশ্ন আছে?','Have questions?')}</div>
          <div style={{ fontFamily:BEN,fontSize:13,color:tk.textDim }}>koyjabo@gmail.com · github.com/mejbaurbahar/koyjabo-core</div>
        </div>

        <AdSlot tk={tk} lang={lang} kind="multiplex" />
        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
