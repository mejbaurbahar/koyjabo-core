import React from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens } from '../tokens';
import { PageShell, PageShellProps } from './PageShell';
import { AdSlot, NativeAdCard } from '../components/AdSlot';

const GREEN = '#10b981';

const PLACEMENTS = [
  { nameEn: 'Homepage Banner', nameBn: 'হোমপেজ ব্যানার', priceEn: '৳5,000–10,000/month', priceBn: '৳৫,০০০–১০,০০০/মাস', descEn: 'Top visibility on search results', descBn: 'অনুসন্ধান ফলাফলে শীর্ষ দৃশ্যমানতা' },
  { nameEn: 'Route Page Banner', nameBn: 'রুট পেজ ব্যানার', priceEn: '৳1,500–5,000/month', priceBn: '৳১,৫০০–৫,০০০/মাস', descEn: 'Show on specific bus route pages', descBn: 'নির্দিষ্ট বাস রুট পেজে প্রদর্শন' },
  { nameEn: 'Intercity Route Card', nameBn: 'আন্তঃনগর রুট কার্ড', priceEn: '৳2,000–6,000/month', priceBn: '৳২,০০০–৬,০০০/মাস', descEn: 'Featured card on intercity results', descBn: 'আন্তঃনগর ফলাফলে ফিচার্ড কার্ড' },
  { nameEn: 'Native Sponsored Card', nameBn: 'নেটিভ স্পনসর্ড কার্ড', priceEn: '৳3,000–8,000/month', priceBn: '৳৩,০০০–৮,০০০/মাস', descEn: 'Native card in route detail pages', descBn: 'রুট বিস্তারিত পেজে নেটিভ কার্ড' },
  { nameEn: 'Newsletter / Blog', nameBn: 'নিউজলেটার / ব্লগ', priceEn: '৳1,000–3,000/post', priceBn: '৳১,০০০–৩,০০০/পোস্ট', descEn: 'Sponsored content in blog posts', descBn: 'ব্লগ পোস্টে স্পনসর্ড কন্টেন্ট' },
];

const WHO = [
  { icon: '🚌', labelEn: 'Bus Counters', labelBn: 'বাস কাউন্টার' },
  { icon: '✈️', labelEn: 'Travel Agencies', labelBn: 'ট্রাভেল এজেন্সি' },
  { icon: '🏨', labelEn: 'Hotels', labelBn: 'হোটেল' },
  { icon: '📚', labelEn: 'Coaching Centers', labelBn: 'কোচিং সেন্টার' },
  { icon: '📱', labelEn: 'Mobile Banking', labelBn: 'মোবাইল ব্যাংকিং' },
  { icon: '📦', labelEn: 'Courier Services', labelBn: 'কুরিয়ার সার্ভিস' },
  { icon: '🌐', labelEn: 'ISPs', labelBn: 'ইন্টারনেট সেবা' },
];

const STATS = [
  { valueEn: '50,000+', valueBn: '৫০,০০০+', labelEn: 'Monthly Users', labelBn: 'মাসিক ব্যবহারকারী' },
  { valueEn: '200+', valueBn: '২০০+', labelEn: 'Bus Routes', labelBn: 'বাস রুট' },
  { valueEn: 'High-Intent', valueBn: 'হাই-ইন্টেন্ট', labelEn: 'Audience', labelBn: 'অডিয়েন্স' },
];

export function AdvertisePage(props: PageShellProps) {
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
            background: `linear-gradient(135deg, #064e3b 0%, #065f46 100%)`,
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
              background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(16,185,129,0.3) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
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
            {lbl('Advertise on KoyJabo', 'KoyJabo-তে বিজ্ঞাপন দিন')}
          </h1>
          <p
            style={{
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: isMobile ? 14 : 16,
              color: 'rgba(255,255,255,0.82)',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 520,
              marginLeft: 'auto',
              marginRight: 'auto',
              position: 'relative',
            }}
          >
            {lbl(
              'Reach 50,000+ high-intent transport users in Bangladesh every month. Target commuters searching for bus routes, fares, and intercity travel.',
              'প্রতি মাসে বাংলাদেশে ৫০,০০০+ হাই-ইন্টেন্ট পরিবহন ব্যবহারকারীর কাছে পৌঁছান। বাস রুট, ভাড়া এবং আন্তঃনগর ভ্রমণ খোঁজা যাত্রীদের টার্গেট করুন।',
            )}
          </p>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 14,
            marginBottom: 36,
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.labelEn}
              style={{
                background: tk.panel,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${GREEN}44`,
                borderRadius: 16,
                padding: '24px 20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: BEN,
                  fontSize: isMobile ? 22 : 28,
                  fontWeight: 800,
                  color: GREEN,
                  lineHeight: 1.1,
                  marginBottom: 6,
                }}
              >
                {lbl(s.valueEn, s.valueBn)}
              </div>
              <div
                style={{
                  fontFamily: lang === 'bn' ? BEN : SANS,
                  fontSize: 13,
                  color: tk.textDim,
                }}
              >
                {lbl(s.labelEn, s.labelBn)}
              </div>
            </div>
          ))}
        </div>

        {/* Ad Placements */}
        <h2
          style={{
            fontFamily: BEN,
            fontSize: 18,
            fontWeight: 700,
            color: tk.text,
            margin: '0 0 14px',
          }}
        >
          {lbl('Ad Placement Options', 'বিজ্ঞাপন প্লেসমেন্ট অপশন')}
        </h2>
        <div
          style={{
            background: tk.panel,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${tk.line}`,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 36,
          }}
        >
          {PLACEMENTS.map((p, i) => (
            <div
              key={p.nameEn}
              style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 4 : 0,
                padding: '16px 20px',
                borderBottom: i < PLACEMENTS.length - 1 ? `1px solid ${tk.line}` : undefined,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: lang === 'bn' ? BEN : SANS,
                    fontSize: 14,
                    fontWeight: 600,
                    color: tk.text,
                    marginBottom: 2,
                  }}
                >
                  {lbl(p.nameEn, p.nameBn)}
                </div>
                <div
                  style={{
                    fontFamily: lang === 'bn' ? BEN : SANS,
                    fontSize: 12,
                    color: tk.textDim,
                  }}
                >
                  {lbl(p.descEn, p.descBn)}
                </div>
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  fontWeight: 700,
                  color: GREEN,
                  whiteSpace: 'nowrap',
                  paddingLeft: isMobile ? 0 : 16,
                }}
              >
                {lbl(p.priceEn, p.priceBn)}
              </div>
            </div>
          ))}
        </div>

        {/* Who should advertise */}
        <h2
          style={{
            fontFamily: BEN,
            fontSize: 18,
            fontWeight: 700,
            color: tk.text,
            margin: '0 0 14px',
          }}
        >
          {lbl('Who Should Advertise?', 'কারা বিজ্ঞাপন দেবেন?')}
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
            background: `linear-gradient(135deg, ${GREEN}22 0%, ${GREEN}11 100%)`,
            border: `1px solid ${GREEN}44`,
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
            {lbl('Ready to Advertise?', 'বিজ্ঞাপন দিতে প্রস্তুত?')}
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
            {lbl('Contact us to discuss custom packages and placement options.', 'কাস্টম প্যাকেজ ও প্লেসমেন্ট অপশন নিয়ে আলোচনা করতে আমাদের সাথে যোগাযোগ করুন।')}
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 12,
              justifyContent: 'center',
            }}
          >
            <a
              href="mailto:mejbaur@markopolo.ai?subject=Advertise%20on%20KoyJabo"
              style={{
                background: GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '13px 28px',
                fontFamily: lang === 'bn' ? BEN : SANS,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              {lbl('Email Us', 'ইমেইল করুন')}
            </a>
            <a
              href="https://wa.me/8801XXXXXXXXX?text=I%20want%20to%20advertise%20on%20KoyJabo"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25d366',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '13px 28px',
                fontFamily: lang === 'bn' ? BEN : SANS,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              {lbl('WhatsApp', 'হোয়াটসঅ্যাপ')}
            </a>
          </div>
        </div>

        {/* Ads */}
        <NativeAdCard
          tk={tk}
          lang={lang}
          kind="mid-rect"
          title={T(lang, 'বিজ্ঞাপনদাতাদের উদাহরণ', 'Advertiser showcase')}
          icon="📣"
          compact
        />
        <NativeAdCard
          tk={tk}
          lang={lang}
          kind="multiplex"
          title={T(lang, 'আরও দেখুন', 'More like this')}
          subtitle={T(lang, 'পার্টনার ও অফার', 'Partners & offers')}
          icon="🎯"
        />
        <NativeAdCard
          tk={tk}
          lang={lang}
          kind={isMobile ? 'mob-banner' : 'leaderboard'}
          title={T(lang, 'সংশ্লিষ্ট প্রচার', 'Related promotions')}
          icon="📢"
        />
      </div>
    </PageShell>
  );
}
