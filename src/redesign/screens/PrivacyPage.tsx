import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot, NativeAdCard, AdCluster } from '../components/AdSlot';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

interface Section {
  h: string;
  body: string;
  bullets?: string[];
}

export function PrivacyPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const lbl = (en: string, bn: string) => lang === 'bn' ? bn : en;

  const sections: Section[] = [
    {
      h: lbl('1. Data we collect', '১. আমরা যে তথ্য সংগ্রহ করি'),
      body: lbl(
        'KoyJabo collects only the minimum data needed to provide transport guidance. We explicitly avoid collecting sensitive personal information unless you actively provide it.',
        'কই যাবো শুধু পরিবহন গাইড দিতে প্রয়োজনীয় ন্যূনতম তথ্য সংগ্রহ করে। সংবেদনশীল ব্যক্তিগত তথ্য আপনি সরাসরি না দিলে আমরা সংগ্রহ করি না।',
      ),
      bullets: [
        lbl('Location (only when you tap "Allow location") — used to suggest nearby stops, never stored on our servers.', 'লোকেশন (শুধু "Allow location" চাপলে) — কাছের স্টপ সুপারিশের জন্য, আমাদের সার্ভারে সংরক্ষিত হয় না।'),
        lbl('Search history (stored locally in your browser only) — to power favorites and recent routes.', 'সার্চ হিস্টরি (শুধু আপনার ব্রাউজারে লোকাল স্টোরেজে) — সেভড ও সাম্প্রতিক রুটের জন্য।'),
        lbl('Device info: browser type, OS, screen size — for compatibility, never linked to identity.', 'ডিভাইস তথ্য: ব্রাউজার, OS, স্ক্রিন সাইজ — কম্প্যাটিবিলিটির জন্য, পরিচয়ের সাথে যুক্ত করা হয় না।'),
        lbl('Account data (only if you sign in): email + display name from Google/Firebase Auth.', 'অ্যাকাউন্ট ডেটা (শুধু সাইন-ইন করলে): Google/Firebase Auth থেকে ইমেইল + ডিসপ্লে নাম।'),
        lbl('Usage analytics: anonymous page views via Google Analytics 4 (G-7L601M5G9R).', 'ব্যবহার অ্যানালিটিক্স: Google Analytics 4 (G-7L601M5G9R) দিয়ে বেনামী পেজ-ভিউ।'),
      ],
    },
    {
      h: lbl('2. How we use your data', '২. আমরা কীভাবে ব্যবহার করি'),
      body: lbl('Your data powers route suggestions, fare estimates, saved favorites, and offline functionality. We never sell data and never share personally identifiable information with third parties.', 'আপনার ডেটা রুট সুপারিশ, ভাড়া অনুমান, সেভড ফেভারিট ও অফলাইন কার্যকারিতার জন্য ব্যবহৃত হয়। আমরা ডেটা বিক্রি করি না এবং ব্যক্তিগতভাবে শনাক্তযোগ্য তথ্য তৃতীয় পক্ষের সাথে শেয়ার করি না।'),
      bullets: [
        lbl('Route planning & fare calculations (computed locally on your device when possible).', 'রুট প্ল্যানিং ও ভাড়া হিসাব (সম্ভব হলে ডিভাইসেই গণনা)।'),
        lbl('Personalizing UI language (Bangla/English) and theme (light/dark).', 'UI ভাষা (বাংলা/ইংরেজি) ও থিম (লাইট/ডার্ক) ব্যক্তিগতকরণ।'),
        lbl('Detecting service availability in your district.', 'আপনার জেলায় সেবার উপলভ্যতা শনাক্তকরণ।'),
        lbl('Aggregated analytics to improve our routes data and AI suggestions.', 'রুট ডেটা ও AI সুপারিশ উন্নত করতে সম্মিলিত অ্যানালিটিক্স।'),
      ],
    },
    {
      h: lbl('3. Cookies & local storage', '৩. কুকিজ ও লোকাল স্টোরেজ'),
      body: lbl('We use first-party cookies and browser localStorage to remember your preferences and offline cache. We do not use tracking cookies that profile you across other websites.', 'আমরা প্রথম-পক্ষ কুকিজ ও ব্রাউজার localStorage ব্যবহার করি আপনার পছন্দ ও অফলাইন ক্যাশ মনে রাখতে। অন্য ওয়েবসাইটে আপনাকে প্রোফাইল করার ট্র্যাকিং কুকি ব্যবহার করি না।'),
      bullets: [
        lbl('kj-language: your language preference (bn/en).', 'kj-language: আপনার ভাষা পছন্দ।'),
        lbl('kj-location-consent: yes/no toggle whether you allowed GPS.', 'kj-location-consent: GPS অনুমতি দিয়েছেন কি না।'),
        lbl('kj-favorites, kj-history: locally cached routes and search history.', 'kj-favorites, kj-history: লোকাল ক্যাশড রুট ও সার্চ হিস্টরি।'),
        lbl('Third-party: Google AdSense + Analytics may set their own cookies — see Google\'s policy.', 'তৃতীয়-পক্ষ: Google AdSense + Analytics তাদের নিজস্ব কুকি সেট করতে পারে — Google-এর নীতি দেখুন।'),
        lbl('Clear all KoyJabo data anytime via Settings → Clear cache.', 'যেকোনো সময় Settings → Clear cache দিয়ে সব KoyJabo ডেটা মুছে ফেলুন।'),
      ],
    },
    {
      h: lbl('4. Third-party services', '৪. তৃতীয় পক্ষের পরিষেবা'),
      body: lbl('We integrate carefully chosen third-party services. Each has its own privacy policy linked below.', 'আমরা সাবধানে বাছাই করা তৃতীয়-পক্ষ পরিষেবা ব্যবহার করি। প্রত্যেকের নিজস্ব গোপনীয়তা নীতি নিচে লিংক করা।'),
      bullets: [
        'Google Analytics 4 — anonymized traffic analysis · policies.google.com/privacy',
        'Google AdSense — relevant ads · policies.google.com/technologies/ads',
        'Cloudflare — CDN + DDoS protection · cloudflare.com/privacypolicy',
        'Firebase Authentication — sign-in (Google + Email/Password) · firebase.google.com/support/privacy',
        'Cloudflare Turnstile — bot protection on sign-in · cloudflare.com/privacypolicy',
        'Cloudflare Workers AI — AI assistant (Llama 3.3 70B) · cloudflare.com/privacypolicy',
      ],
    },
    {
      h: lbl('5. Your rights', '৫. আপনার অধিকার'),
      body: lbl('Following GDPR-style principles, you have the following rights regardless of where you live:', 'GDPR-ধাঁচের নীতি অনুসরণ করে, আপনি যেখানেই থাকুন এই অধিকারগুলি আছে:'),
      bullets: [
        lbl('Right to access: ask what data we have about you.', 'অ্যাক্সেসের অধিকার: আমরা আপনার সম্পর্কে কী ডেটা রাখি জানতে চাইতে পারেন।'),
        lbl('Right to deletion: request full deletion of your account + data.', 'মুছে ফেলার অধিকার: আপনার অ্যাকাউন্ট ও ডেটা মুছে ফেলার অনুরোধ।'),
        lbl('Right to portability: export your favorites + history as JSON.', 'পোর্টেবিলিটির অধিকার: ফেভারিট ও হিস্টরি JSON হিসেবে রপ্তানি।'),
        lbl('Right to correction: update or fix any data we hold.', 'সংশোধনের অধিকার: আমাদের কাছে থাকা ডেটা আপডেট বা ঠিক করুন।'),
        lbl('Right to object: opt out of analytics via browser Do-Not-Track.', 'আপত্তির অধিকার: ব্রাউজার Do-Not-Track দিয়ে অ্যানালিটিক্স থেকে অপ্ট-আউট।'),
        lbl('To exercise: email koyjabo.bd@gmail.com — we respond within 30 days.', 'প্রয়োগ করতে: koyjabo.bd@gmail.com-এ ইমেইল — ৩০ দিনে সাড়া দেই।'),
      ],
    },
    {
      h: lbl('6. Data retention', '৬. ডেটা সংরক্ষণ'),
      body: lbl('We keep data only as long as needed:', 'আমরা শুধু প্রয়োজনীয় সময় পর্যন্ত ডেটা রাখি:'),
      bullets: [
        lbl('Search history: locally only — never sent to our servers.', 'সার্চ হিস্টরি: শুধু লোকাল — আমাদের সার্ভারে পাঠানো হয় না।'),
        lbl('Analytics: aggregated for 26 months then deleted automatically (GA4 default).', 'অ্যানালিটিক্স: ২৬ মাস পর্যন্ত সম্মিলিত, পরে স্বয়ংক্রিয়ভাবে মুছে যায় (GA4 ডিফল্ট)।'),
        lbl('Account data: retained until you request deletion.', 'অ্যাকাউন্ট ডেটা: মুছে ফেলার অনুরোধ না করা পর্যন্ত রাখা হয়।'),
        lbl('Server logs: 7 days for security, then purged.', 'সার্ভার লগ: নিরাপত্তার জন্য ৭ দিন, পরে মুছে ফেলা হয়।'),
      ],
    },
    {
      h: lbl('7. Security', '৭. নিরাপত্তা'),
      body: lbl('We protect your data with industry-standard measures:', 'আমরা শিল্প-মান ব্যবস্থা দিয়ে আপনার ডেটা রক্ষা করি:'),
      bullets: [
        lbl('All traffic over HTTPS (TLS 1.3) — no plaintext.', 'সব ট্রাফিক HTTPS-এ (TLS 1.3) — কোনো প্লেইনটেক্সট নেই।'),
        lbl('Passwords hashed with bcrypt (cost factor 10).', 'পাসওয়ার্ড bcrypt দিয়ে হ্যাশড (কস্ট ফ্যাক্টর ১০)।'),
        lbl('CSP, X-Frame-Options, and other security headers via Cloudflare.', 'CSP, X-Frame-Options ও অন্যান্য সিকিউরিটি হেডার Cloudflare-এর মাধ্যমে।'),
        lbl('Cloudflare Turnstile blocks automated bot attacks on sign-in.', 'সাইন-ইনে স্বয়ংক্রিয় বট আক্রমণ Cloudflare Turnstile-এ ব্লক হয়।'),
        lbl('No payment data is collected — we do not process payments.', 'কোনো পেমেন্ট ডেটা সংগ্রহ করা হয় না — আমরা পেমেন্ট প্রসেস করি না।'),
      ],
    },
    {
      h: lbl('8. Children', '৮. শিশুদের গোপনীয়তা'),
      body: lbl('KoyJabo is rated General. We do not knowingly collect data from children under 13. If you are a parent and believe your child has provided us data, email koyjabo.bd@gmail.com and we will delete it promptly.', 'কই যাবো জেনারেল রেটেড। আমরা জেনেশুনে ১৩ বছরের কম বয়সী শিশুদের কাছ থেকে ডেটা সংগ্রহ করি না। অভিভাবক হিসাবে আপনার সন্তান ডেটা দিয়েছে মনে করলে koyjabo.bd@gmail.com-এ ইমেইল করুন, দ্রুত মুছে ফেলব।'),
    },
    {
      h: lbl('9. International transfers', '৯. আন্তর্জাতিক স্থানান্তর'),
      body: lbl('Our servers run on Cloudflare\'s global network. Your data may be processed in any Cloudflare data center, including the EU, US, and Asia. Cloudflare maintains GDPR-compliant data processing agreements.', 'আমাদের সার্ভার Cloudflare-এর বিশ্বব্যাপী নেটওয়ার্কে চলে। আপনার ডেটা EU, US, এশিয়াসহ যেকোনো Cloudflare ডেটা সেন্টারে প্রসেস হতে পারে। Cloudflare GDPR-অনুগত ডেটা প্রসেসিং চুক্তি বজায় রাখে।'),
    },
    {
      h: lbl('10. Truck & freight bookings', '১০. ট্রাক ও পণ্য বুকিং'),
      body: lbl('When you tap "Get Quote" on the Truck & Freight page, we calculate fares locally on your device. We do not transmit your pickup/drop locations or load details to our servers or to third-party logistics providers. Actual booking happens via the partner\'s phone hotline shown on screen.', '"ট্রাক ও পণ্য" পেজে "কোট নিন" চাপলে আমরা ভাড়া আপনার ডিভাইসেই গণনা করি। আপনার পিকআপ/ড্রপ লোকেশন বা লোড বিবরণ আমাদের সার্ভার বা তৃতীয়-পক্ষ লজিস্টিক্স প্রোভাইডারের কাছে পাঠানো হয় না। আসল বুকিং স্ক্রিনে দেখানো পার্টনার ফোন হটলাইনের মাধ্যমে হয়।'),
    },
    {
      h: lbl('11. Changes to this policy', '১১. এই নীতিতে পরিবর্তন'),
      body: lbl('We will update this policy as needed and post the new date at the top. Material changes (those that affect your rights) will be announced via in-app banner and email if you have an account. Continued use after a policy update means acceptance of the new terms.', 'প্রয়োজনে আমরা এই নীতি আপডেট করব এবং উপরে নতুন তারিখ পোস্ট করব। বড় পরিবর্তন (যা আপনার অধিকারে প্রভাব ফেলে) ইন-অ্যাপ ব্যানার ও অ্যাকাউন্ট থাকলে ইমেইলে ঘোষণা হবে। আপডেটের পরেও ব্যবহার চালিয়ে গেলে নতুন শর্তে সম্মতি ধরা হবে।'),
    },
    {
      h: lbl('12. Contact', '১২. যোগাযোগ'),
      body: lbl('Privacy questions or requests:', 'গোপনীয়তা সংক্রান্ত প্রশ্ন বা অনুরোধ:'),
      bullets: [
        'Email: koyjabo.bd@gmail.com',
        lbl('Mailing: Dhaka, Bangladesh', 'মেইলিং: ঢাকা, বাংলাদেশ'),
        lbl('Response time: within 30 days.', 'রেসপন্স সময়: ৩০ দিনের মধ্যে।'),
      ],
    },
  ];

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:760, margin:'0 auto' }}>
        <div style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:8 }}>
          {T(lang,'আপডেট: ২৬ জুন ২০২৬','Updated: June 26, 2026')}
        </div>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?22:28,color:tk.text,marginBottom:8 }}>{T(lang,'গোপনীয়তা নীতি','Privacy Policy')}</h1>
        <p style={{ fontFamily:BEN,fontSize:14,color:tk.textDim,lineHeight:1.7,marginBottom:20 }}>
          {T(lang,'কই যাবো আপনার গোপনীয়তাকে গুরুত্ব দেয়। এই নীতি ব্যাখ্যা করে আমরা কোন তথ্য সংগ্রহ করি, কেন করি, কীভাবে রক্ষা করি, এবং আপনার কী অধিকার আছে।','KoyJabo takes your privacy seriously. This policy explains what we collect, why, how we protect it, and what rights you have.')}
        </p>

        {/* TL;DR */}
        <details open className="kj-summary" style={{ ...card(14), background:tk.primarySoft, border:`1px solid ${tk.primary}55`, marginBottom:20 }}>
          <summary style={{ fontFamily:SANS,fontSize:11,fontWeight:800,color:tk.primary,letterSpacing:1.4,textTransform:'uppercase',cursor:'pointer' }}>
            {T(lang,'সংক্ষেপে','TL;DR')}
          </summary>
          <p style={{ fontFamily:BEN,fontSize:13,color:tk.text,lineHeight:1.7,margin:'8px 0 0' }}>
            {T(lang,'আমরা শুধু প্রয়োজনীয় তথ্য সংগ্রহ করি। ডেটা বিক্রি করি না। লোকেশন আপনার অনুমতিতে। হিস্টরি শুধু আপনার ব্রাউজারে। যেকোনো সময় মুছতে পারেন।','We collect only what we need. We never sell data. Location only with your permission. History stays in your browser only. You can delete everything anytime.')}
          </p>
        </details>

        {/* TOC */}
        <div style={{ ...card(14),marginBottom:20 }}>
          <div style={{ fontFamily:SANS,fontSize:10,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:10 }}>{T(lang,'বিষয়সূচি','On this page')}</div>
          {sections.map((s,i)=>(
            <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'5px 0' }}>
              <span style={{ fontFamily:SANS,fontSize:11,fontWeight:600,color:tk.textFaint }}>{String(i+1).padStart(2,'0')}</span>
              <span style={{ fontFamily:BEN,fontSize:13,color:tk.primary,fontWeight:600 }}>{s.h.replace(/^\d+\.\s*|^[০-৯]+\.\s*/, '')}</span>
            </div>
          ))}
        </div>

        {sections.map((s,i)=>(
          <section key={i} style={{ marginBottom:24 }}>
            <h2 style={{ fontFamily:BEN,fontWeight:700,fontSize:17,color:tk.text,margin:'0 0 10px',display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ width:28,height:28,borderRadius:8,background:tk.primarySoft,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:SANS,fontWeight:700,fontSize:12,color:tk.primary,flexShrink:0 }}>{i+1}</span>
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
            {i === 5 && (
              <NativeAdCard
                tk={tk}
                lang={lang}
                kind="in-article"
                title={T(lang, 'সংশ্লিষ্ট বিষয়বস্তু', 'Related content')}
                icon="📰"
              />
            )}
          </section>
        ))}

        <div style={{ ...card(14),background:tk.primarySoft,borderColor:tk.primary, marginTop:20 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.primary,marginBottom:6 }}>{T(lang,'প্রশ্ন আছে?','Questions?')}</div>
          <div style={{ fontFamily:BEN,fontSize:13,color:tk.textDim,lineHeight:1.6 }}>
            {T(lang,'যেকোনো গোপনীয়তা বা ডেটা সংক্রান্ত প্রশ্ন: koyjabo.bd@gmail.com। আমরা ৩০ দিনের মধ্যে সাড়া দেই।','For any privacy or data-related queries: koyjabo.bd@gmail.com. We respond within 30 days.')}
          </div>
        </div>

        <NativeAdCard
          tk={tk}
          lang={lang}
          kind="multiplex"
          title={T(lang, 'আরও দেখুন', 'More like this')}
          subtitle={T(lang, 'ভ্রমণ ও পরিবহন', 'Travel & transport')}
          icon="🧭"
        />
        <NativeAdCard
          tk={tk}
          lang={lang}
          kind={isMobile?'mob-banner':'leaderboard'}
          title={T(lang, 'পার্টনার অফার', 'Partner offers')}
          icon="🎯"
        />
      </div>
          <AdCluster tk={tk} lang={lang} count={2} isMobile={isMobile}/>
    </PageShell>
  );
}
