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

export function TermsPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const lbl = (en: string, bn: string) => lang === 'bn' ? bn : en;

  const sections: Section[] = [
    {
      h: lbl('1. Acceptance of terms', '১. শর্তাবলি গ্রহণ'),
      body: lbl('By accessing KoyJabo at koyjabo.com or via our mobile PWA, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please discontinue use immediately.', 'koyjabo.com-এ বা আমাদের মোবাইল PWA-এর মাধ্যমে কই যাবো ব্যবহার করে আপনি এই সেবার শর্তাবলি ও গোপনীয়তা নীতি মেনে চলতে সম্মত হন। সম্মত না হলে অবিলম্বে ব্যবহার বন্ধ করুন।'),
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
      body: lbl('You agree NOT to do any of the following:', 'আপনি নিচের কোনোটি করতে সম্মত নন:'),
      bullets: [
        lbl('Scrape, crawl, copy, mirror, republish, redistribute, or commercially exploit ANY data, content, code, design, or asset from KoyJabo without prior written permission. Personal viewing in a browser is the only permitted use.', 'প্রিয় লিখিত অনুমতি ছাড়া কই যাবোর কোনো ডেটা, কনটেন্ট, কোড, ডিজাইন, বা অ্যাসেট স্ক্র্যাপ, ক্রল, কপি, মিরর, পুনঃপ্রকাশ, পুনঃবিতরণ, বা বাণিজ্যিকভাবে ব্যবহার করা যাবে না। কেবল ব্রাউজারে ব্যক্তিগত দেখাই অনুমোদিত।'),
        lbl('Train, fine-tune, or build AI/ML models on KoyJabo content without prior written permission. Standard AI search-engine crawling for indexing is the only exception.', 'লিখিত অনুমতি ছাড়া কই যাবো কনটেন্টে AI/ML মডেল প্রশিক্ষণ, ফাইন-টিউন, বা তৈরি নিষিদ্ধ। শুধু স্বাভাবিক AI সার্চ-ইঞ্জিন ইনডেক্সিং ব্যতিক্রম।'),
        lbl('No hacking, penetration testing, exploit attempts, or security research without prior written authorization. Unauthorized access, denial-of-service attempts, SQL injection, XSS, brute-force, or any intrusion will be reported to law enforcement.', 'লিখিত অনুমতি ছাড়া হ্যাকিং, পেনিট্রেশন টেস্টিং, এক্সপ্লয়েট চেষ্টা, বা নিরাপত্তা গবেষণা নিষিদ্ধ। অননুমোদিত প্রবেশ, DoS চেষ্টা, SQL ইনজেকশন, XSS, ব্রুট-ফোর্স, বা যেকোনো অনুপ্রবেশ আইন প্রয়োগকারী সংস্থার কাছে রিপোর্ট করা হবে।'),
        lbl('Submit false route or fare reviews intended to mislead other users.', 'অন্য ব্যবহারকারীদের বিভ্রান্ত করার জন্য মিথ্যা রুট বা ভাড়া রিভিউ জমা দেওয়া।'),
        lbl('Reverse-engineer, decompile, deobfuscate, or attempt to bypass any security measure (Turnstile, rate limits, auth gates, CSP).', 'যেকোনো নিরাপত্তা ব্যবস্থা (Turnstile, রেট লিমিট, auth গেট, CSP) রিভার্স-ইঞ্জিনিয়ার, ডিকম্পাইল, ডিঅবফাস্কেট, বা বাইপাস চেষ্টা।'),
        lbl('Use automated tools (bots, scrapers, headless browsers) to access the service in bulk or at high frequency.', 'বাল্কে বা উচ্চ ফ্রিকোয়েন্সিতে সেবা অ্যাক্সেসে স্বয়ংক্রিয় টুল (বট, স্ক্র্যাপার, headless ব্রাউজার) ব্যবহার।'),
        lbl('Upload illegal, defamatory, harassing, hateful, or harmful content to community features.', 'কমিউনিটি ফিচারে অবৈধ, মানহানিকর, হয়রানিমূলক, ঘৃণাত্মক, বা ক্ষতিকর সামগ্রী আপলোড।'),
        lbl('Use KoyJabo, its data, or its design for any commercial purpose without prior written approval.', 'আগে লিখিত অনুমোদন ছাড়া কই যাবো, এর ডেটা, বা ডিজাইন বাণিজ্যিক উদ্দেশ্যে ব্যবহার।'),
      ],
    },
    {
      h: lbl('6. Intellectual property', '৬. মেধাস্বত্ব'),
      body: lbl('All content, code, data, designs, brand assets, and accumulated route information on KoyJabo are PROPRIETARY and protected. KoyJabo is NOT open source. You may not reuse, copy, redistribute, or repurpose anything from this platform without prior written permission from the owner.', 'কই যাবোর সব কনটেন্ট, কোড, ডেটা, ডিজাইন, ব্র্যান্ড অ্যাসেট, এবং সংগৃহীত রুট তথ্য মালিকানাধীন এবং সুরক্ষিত। কই যাবো ওপেন সোর্স নয়। মালিকের আগে লিখিত অনুমতি ছাড়া এই প্ল্যাটফর্ম থেকে কিছু পুনঃব্যবহার, কপি, পুনঃবিতরণ, বা পুনঃউদ্দেশ্যে ব্যবহার করা যাবে না।'),
      bullets: [
        lbl('Source code, repository contents, build artifacts: ALL RIGHTS RESERVED — Mejbaur Bahar Fagun. No license is granted to third parties.', 'সোর্স কোড, রিপোজিটরি কনটেন্ট, বিল্ড আর্টিফ্যাক্ট: সমস্ত অধিকার সংরক্ষিত — Mejbaur Bahar Fagun। তৃতীয় পক্ষকে কোনো লাইসেন্স প্রদান করা হয়নি।'),
        lbl('Transport route data, fare tables, district maps, AI training datasets: PROPRIETARY. Compiled with significant effort; redistribution prohibited.', 'পরিবহন রুট ডেটা, ভাড়ার টেবিল, জেলা ম্যাপ, AI প্রশিক্ষণ ডেটাসেট: মালিকানাধীন। উল্লেখযোগ্য পরিশ্রমে সংকলিত; পুনঃবিতরণ নিষিদ্ধ।'),
        lbl('Logo, brand name "KoyJabo / কই যাবো", visual identity: registered trademarks of Mejbaur Bahar Fagun.', 'লোগো, ব্র্যান্ড নাম "KoyJabo / কই যাবো", ভিজ্যুয়াল আইডেন্টিটি: Mejbaur Bahar Fagun-এর নিবন্ধিত ট্রেডমার্ক।'),
        lbl('User-submitted content (reviews/photos): you retain ownership, but you grant KoyJabo a worldwide, perpetual, royalty-free license to display, store, and moderate that content.', 'ইউজার-জমা দেওয়া কনটেন্ট (রিভিউ/ফটো): মালিকানা আপনার, তবে কই যাবোকে এই কনটেন্ট প্রদর্শন, সংরক্ষণ, ও মডারেশনের বিশ্বব্যাপী, স্থায়ী, রয়্যালটি-ফ্রি লাইসেন্স প্রদান করেন।'),
        lbl('To request any usage license, email the address in section 16 with the specific data/asset and intended use. Unauthorized use will be enforced through DMCA notices and legal action under Bangladeshi copyright law.', 'যেকোনো ব্যবহার লাইসেন্সের জন্য, সেকশন ১৬-এ থাকা ঠিকানায় নির্দিষ্ট ডেটা/অ্যাসেট ও উদ্দেশ্য জানিয়ে ইমেইল করুন। অননুমোদিত ব্যবহার DMCA নোটিশ ও বাংলাদেশি কপিরাইট আইনের অধীনে আইনি ব্যবস্থা নেওয়া হবে।'),
      ],
    },
    {
      h: lbl('6a. Security & responsible disclosure', '৬ক. নিরাপত্তা ও দায়িত্বশীল প্রকাশ'),
      body: lbl('Unauthorized hacking or attack attempts against KoyJabo, its infrastructure, partners, or users are STRICTLY PROHIBITED and may constitute criminal offenses under the Bangladesh Digital Security Act, 2018 (and successor laws), as well as international computer-misuse statutes.', 'কই যাবো, এর অবকাঠামো, অংশীদার, বা ব্যবহারকারীদের বিরুদ্ধে অননুমোদিত হ্যাকিং বা আক্রমণ চেষ্টা কঠোরভাবে নিষিদ্ধ এবং বাংলাদেশ ডিজিটাল নিরাপত্তা আইন ২০১৮ (ও পরবর্তী আইন) এবং আন্তর্জাতিক কম্পিউটার-অপব্যবহার আইনের অধীনে অপরাধ হতে পারে।'),
      bullets: [
        lbl('No port scanning, vulnerability scanning, fuzzing, or automated probing without written authorization.', 'লিখিত অনুমোদন ছাড়া কোনো পোর্ট স্ক্যানিং, vulnerability স্ক্যানিং, fuzzing, বা স্বয়ংক্রিয় probing নয়।'),
        lbl('No DoS, DDoS, or any traffic flood designed to degrade the service.', 'সেবা ব্যাহত করার জন্য কোনো DoS, DDoS, বা ট্রাফিক ফ্লাড নয়।'),
        lbl('No credential stuffing, brute force, password spraying, or auth bypass attempts.', 'কোনো credential stuffing, brute force, password spraying, বা auth bypass চেষ্টা নয়।'),
        lbl('No exploit attempts against XSS, SQLi, SSRF, CSRF, deserialization, or any other vulnerability class.', 'XSS, SQLi, SSRF, CSRF, deserialization, বা অন্য কোনো vulnerability ক্লাসের বিরুদ্ধে কোনো exploit চেষ্টা নয়।'),
        lbl('If you find a security issue, report it responsibly to the contact email in section 16. We respond within 7 days. Public disclosure before we patch is grounds for legal action.', 'নিরাপত্তা সমস্যা খুঁজে পেলে, সেকশন ১৬-এর কন্টাক্ট ইমেইলে দায়িত্বশীলভাবে রিপোর্ট করুন। ৭ দিনের মধ্যে সাড়া দেই। প্যাচের আগে পাবলিক প্রকাশ আইনি ব্যবস্থার ভিত্তি।'),
        lbl('Violators may face account ban, IP block, civil liability, and criminal referral.', 'লঙ্ঘনকারীরা অ্যাকাউন্ট ব্যান, IP ব্লক, দেওয়ানি দায়, ও ফৌজদারি referral-এর মুখোমুখি হতে পারেন।'),
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
        'Email: koyjabo.bd@gmail.com',
        lbl('Mailing: Dhaka, Bangladesh', 'মেইলিং: ঢাকা, বাংলাদেশ'),
        lbl('Response time: within 7 business days.', 'রেসপন্স সময়: ৭ কার্যদিবসের মধ্যে।'),
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
            {i === 7 && (
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

        <div style={{ ...card(14),background:tk.amberSoft,borderColor:tk.amber, marginTop:20 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.amber,marginBottom:6 }}>{T(lang,'প্রশ্ন আছে?','Have questions?')}</div>
          <div style={{ fontFamily:BEN,fontSize:13,color:tk.textDim }}>koyjabo.bd@gmail.com</div>
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
