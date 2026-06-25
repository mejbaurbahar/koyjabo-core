import React from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens } from '../tokens';
import { PageShell, PageShellProps } from './PageShell';
import { AdSlot } from '../components/AdSlot';

const PRODUCTS = [
  {
    icon: '🚌',
    titleEn: 'Bus Route API',
    titleBn: 'বাস রুট API',
    descEn: 'Search 200+ Dhaka bus routes by origin/destination',
    descBn: 'উৎপত্তিস্থল/গন্তব্য দিয়ে ২০০+ ঢাকা বাস রুট অনুসন্ধান করুন',
    priceEn: '৳500/month',
    priceBn: '৳৫০০/মাস',
    limitEn: '1,000 req/day',
    limitBn: '১,০০০ রিকোয়েস্ট/দিন',
    from: '#1e3a8a',
    to: '#3b82f6',
  },
  {
    icon: '💰',
    titleEn: 'Fare Calculator API',
    titleBn: 'ভাড়া ক্যালকুলেটর API',
    descEn: 'BRTA-rate fare calculation endpoint',
    descBn: 'BRTA-রেট ভাড়া গণনার এন্ডপয়েন্ট',
    priceEn: '৳300/month',
    priceBn: '৳৩০০/মাস',
    limitEn: '500 req/day',
    limitBn: '৫০০ রিকোয়েস্ট/দিন',
    from: '#4c1d95',
    to: '#7c3aed',
  },
  {
    icon: '🗺️',
    titleEn: 'Intercity Data API',
    titleBn: 'আন্তঃনগর ডেটা API',
    descEn: 'All intercity bus/train/launch routes',
    descBn: 'সব আন্তঃনগর বাস/ট্রেন/লঞ্চ রুট',
    priceEn: '৳800/month',
    priceBn: '৳৮০০/মাস',
    limitEn: '2,000 req/day',
    limitBn: '২,০০০ রিকোয়েস্ট/দিন',
    from: '#1e4076',
    to: '#0284c7',
  },
];

const WHO = [
  { icon: '📱', labelEn: 'Travel Apps', labelBn: 'ট্রাভেল অ্যাপ' },
  { icon: '🎓', labelEn: 'Student Projects', labelBn: 'ছাত্র প্রজেক্ট' },
  { icon: '🏭', labelEn: 'Logistics Companies', labelBn: 'লজিস্টিক্স কোম্পানি' },
  { icon: '🔬', labelEn: 'University Research', labelBn: 'বিশ্ববিদ্যালয় গবেষণা' },
];

const SAMPLE_JSON = `{
  "route": "Dhaka → Cox's Bazar",
  "fare_non_ac": 900,
  "fare_ac": 1500,
  "duration_hrs": 11,
  "operators": ["SR Travels", "Soudia", "GreenLine"]
}`;

export function APIPage(props: PageShellProps) {
  const { theme, lang, device } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);

  return (
    <PageShell {...props}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '0 16px 80px' : '0 40px 80px' }}>

        {/* Hero */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            borderRadius: 20,
            padding: isMobile ? '48px 24px' : '72px 64px',
            marginBottom: 36,
            marginTop: 24,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(139,92,246,0.2)',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: 8,
              padding: '4px 12px',
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              color: '#c4b5fd',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 16,
              position: 'relative',
            }}
          >
            {lbl('Developer API', 'ডেভেলপার API')}
          </div>
          <h1
            style={{
              fontFamily: BEN,
              fontSize: isMobile ? 26 : 38,
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 12px',
              position: 'relative',
            }}
          >
            {lbl('KoyJabo Transport API', 'KoyJabo ট্রান্সপোর্ট API')}
          </h1>
          <p
            style={{
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: isMobile ? 14 : 16,
              color: 'rgba(255,255,255,0.8)',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 520,
              marginLeft: 'auto',
              marginRight: 'auto',
              position: 'relative',
            }}
          >
            {lbl(
              'Integrate Bangladesh transport data into your app. Real-time routes, fares, and schedules via simple REST endpoints.',
              'আপনার অ্যাপে বাংলাদেশের পরিবহন ডেটা ইন্টিগ্রেট করুন। সহজ REST এন্ডপয়েন্টের মাধ্যমে রিয়েল-টাইম রুট, ভাড়া এবং সময়সূচি।',
            )}
          </p>
        </div>

        {/* API Product Cards */}
        <h2
          style={{
            fontFamily: BEN,
            fontSize: 18,
            fontWeight: 700,
            color: tk.text,
            margin: '0 0 14px',
          }}
        >
          {lbl('API Products', 'API পণ্য')}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 14,
            marginBottom: 36,
          }}
        >
          {PRODUCTS.map((p) => (
            <div
              key={p.titleEn}
              style={{
                background: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)`,
                borderRadius: 16,
                padding: '24px 20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.18)',
                  pointerEvents: 'none',
                  borderRadius: 16,
                }}
              />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
                <div
                  style={{
                    fontFamily: lang === 'bn' ? BEN : SANS,
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 8,
                  }}
                >
                  {lbl(p.titleEn, p.titleBn)}
                </div>
                <p
                  style={{
                    fontFamily: lang === 'bn' ? BEN : SANS,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.82)',
                    margin: '0 0 16px',
                    lineHeight: 1.6,
                  }}
                >
                  {lbl(p.descEn, p.descBn)}
                </p>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#fff',
                    }}
                  >
                    {lbl(p.priceEn, p.priceBn)}
                  </span>
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.65)',
                    }}
                  >
                    {lbl(p.limitEn, p.limitBn)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sample JSON */}
        <h2
          style={{
            fontFamily: BEN,
            fontSize: 18,
            fontWeight: 700,
            color: tk.text,
            margin: '0 0 14px',
          }}
        >
          {lbl('Sample Response', 'স্যাম্পল রেসপন্স')}
        </h2>
        <div
          style={{
            background: '#0d1117',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 14,
            padding: '20px 24px',
            marginBottom: 36,
            overflow: 'auto',
          }}
        >
          <pre
            style={{
              fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
              fontSize: 13,
              color: '#e6edf3',
              margin: 0,
              lineHeight: 1.7,
              whiteSpace: 'pre',
            }}
          >
            {SAMPLE_JSON}
          </pre>
        </div>

        {/* Who can use it */}
        <h2
          style={{
            fontFamily: BEN,
            fontSize: 18,
            fontWeight: 700,
            color: tk.text,
            margin: '0 0 14px',
          }}
        >
          {lbl('Who Can Use It?', 'কে ব্যবহার করতে পারবেন?')}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 36,
          }}
        >
          {WHO.map((w) => (
            <div
              key={w.labelEn}
              style={{
                background: tk.panel,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: `1px solid ${tk.line}`,
                borderRadius: 12,
                padding: '16px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>{w.icon}</span>
              <span
                style={{
                  fontFamily: lang === 'bn' ? BEN : SANS,
                  fontSize: 13,
                  fontWeight: 500,
                  color: tk.text,
                }}
              >
                {lbl(w.labelEn, w.labelBn)}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.12) 100%)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 20,
            padding: isMobile ? '32px 24px' : '40px 48px',
            textAlign: 'center',
            marginBottom: 36,
          }}
        >
          <h3
            style={{
              fontFamily: BEN,
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              color: tk.text,
              margin: '0 0 10px',
            }}
          >
            {lbl('Request API Access', 'API অ্যাক্সেস অনুরোধ করুন')}
          </h3>
          <p
            style={{
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: 14,
              color: tk.textDim,
              margin: '0 0 24px',
              lineHeight: 1.6,
            }}
          >
            {lbl(
              'Email us with your use case and we will get you set up with the right plan.',
              'আপনার ব্যবহারের উদ্দেশ্য সহ আমাদের ইমেইল করুন এবং আমরা আপনাকে সঠিক প্ল্যানে সেটআপ করে দেব।',
            )}
          </p>
          <a
            href="mailto:mejbaur@markopolo.ai?subject=KoyJabo%20API%20Access"
            style={{
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '13px 32px',
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {lbl('Get API Access', 'API অ্যাক্সেস পান')}
          </a>
        </div>

        {/* Ads */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind="mid-rect" />
        </div>
        <div style={{ margin: '20px 0' }}>
          <AdSlot tk={tk} lang={lang} kind="multiplex" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>
      </div>
    </PageShell>
  );
}
