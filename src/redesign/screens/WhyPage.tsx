import React from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens, Lang } from '../tokens';
import { PageShell, PageShellProps } from './PageShell';
import { AdSlot } from '../components/AdSlot';

const FEATURES = [
  {
    icon: '🗺',
    titleEn: 'Free & Offline',
    titleBn: 'বিনামূল্যে ও অফলাইন',
    descEn: 'Works without internet · PWA installable',
    descBn: 'ইন্টারনেট ছাড়াই চলে · PWA ইনস্টলযোগ্য',
    from: '#064e3b',
    to: '#10b981',
  },
  {
    icon: '🚌',
    titleEn: 'All Transport',
    titleBn: 'সব পরিবহন',
    descEn: 'Bus, Metro, Train, Launch, Flights',
    descBn: 'বাস, মেট্রো, ট্রেন, লঞ্চ, ফ্লাইট',
    from: '#1e3a8a',
    to: '#3b82f6',
  },
  {
    icon: '🌐',
    titleEn: 'Bilingual',
    titleBn: 'দ্বিভাষিক',
    descEn: 'বাংলা এবং English — seamlessly switch',
    descBn: 'বাংলা এবং English — অনায়াসে বদলান',
    from: '#4c1d95',
    to: '#a855f7',
  },
  {
    icon: '🔒',
    titleEn: 'No Ads BS',
    titleBn: 'বিজ্ঞাপন জঞ্জাল নেই',
    descEn: 'Clean UI, not cluttered — ads are non-intrusive',
    descBn: 'পরিষ্কার ইন্টারফেস — বিজ্ঞাপন বিরক্তিকর নয়',
    from: '#92400e',
    to: '#f59e0b',
  },
];

const STATS = [
  { valueEn: '50,000+', valueBn: '৫০,০০০+', labelEn: 'Users', labelBn: 'ব্যবহারকারী' },
  { valueEn: '2,400+', valueBn: '২,৪০০+', labelEn: 'Routes', labelBn: 'রুট' },
  { valueEn: '64', valueBn: '৬৪', labelEn: 'Districts', labelBn: 'জেলা' },
  { valueEn: '99.9%', valueBn: '৯৯.৯%', labelEn: 'Uptime', labelBn: 'আপটাইম' },
];

export function WhyPage(props: PageShellProps) {
  const { theme, lang, device } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);

  return (
    <PageShell {...props}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '0 16px 80px' : '0 32px 80px' }}>

        {/* Hero */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            borderRadius: 20,
            padding: isMobile ? '48px 24px' : '72px 64px',
            marginBottom: 40,
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
              background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(16,185,129,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <h1
            style={{
              fontFamily: BEN,
              fontSize: isMobile ? 28 : 40,
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 12px',
              position: 'relative',
            }}
          >
            {lbl('Why KoyJabo?', 'কেন কই যাবো?')}
          </h1>
          <p
            style={{
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: isMobile ? 14 : 17,
              color: 'rgba(255,255,255,0.8)',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 560,
              marginLeft: 'auto',
              marginRight: 'auto',
              position: 'relative',
            }}
          >
            {lbl(
              'Bangladesh\'s smartest transit companion — free, offline-first, covering every mode of transport across all 64 districts.',
              'বাংলাদেশের সবচেয়ে স্মার্ট যানবাহন সঙ্গী — বিনামূল্যে, অফলাইন-প্রথম, সকল ৬৪ জেলায় সব ধরনের পরিবহন কভার করে।',
            )}
          </p>
        </div>

        {/* Feature Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.titleEn}
              style={{
                background: `linear-gradient(135deg, ${f.from} 0%, ${f.to} 100%)`,
                borderRadius: 16,
                padding: '28px 24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.15)',
                  pointerEvents: 'none',
                  borderRadius: 16,
                }}
              />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3
                  style={{
                    fontFamily: lang === 'bn' ? BEN : SANS,
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 0 8px',
                  }}
                >
                  {lbl(f.titleEn, f.titleBn)}
                </h3>
                <p
                  style={{
                    fontFamily: lang === 'bn' ? BEN : SANS,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.85)',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {lbl(f.descEn, f.descBn)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div
          style={{
            background: tk.panel,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${tk.line}`,
            borderRadius: 16,
            padding: '28px 24px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: 24,
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          {STATS.map((s) => (
            <div key={s.labelEn}>
              <div
                style={{
                  fontFamily: BEN,
                  fontSize: isMobile ? 24 : 32,
                  fontWeight: 800,
                  color: tk.primary,
                  lineHeight: 1.1,
                  marginBottom: 4,
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

        {/* How it started */}
        <div
          style={{
            background: tk.panel,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${tk.line}`,
            borderRadius: 16,
            padding: '28px 28px',
            marginBottom: 40,
          }}
        >
          <h2
            style={{
              fontFamily: BEN,
              fontSize: 20,
              fontWeight: 700,
              color: tk.text,
              margin: '0 0 14px',
            }}
          >
            {lbl('How it started', 'যেভাবে শুরু হয়েছিল')}
          </h2>
          <p
            style={{
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: 14,
              color: tk.textDim,
              margin: '0 0 12px',
              lineHeight: 1.75,
            }}
          >
            {lbl(
              'KoyJabo was born out of daily frustration — trying to navigate Dhaka\'s chaotic public transport with no reliable guide. We built the app we wished existed: one that works offline, covers every mode of transport, speaks your language, and never sells your data.',
              'KoyJabo জন্ম নিয়েছে দৈনন্দিন হতাশা থেকে — কোনো নির্ভরযোগ্য গাইড ছাড়া ঢাকার বিশৃঙ্খল গণপরিবহনে নেভিগেট করার চেষ্টা করতে গিয়ে। আমরা সেই অ্যাপটি তৈরি করেছি যা আমরা চেয়েছিলাম: একটি যা অফলাইনে কাজ করে, সব ধরনের পরিবহন কভার করে, আপনার ভাষায় কথা বলে এবং কখনো আপনার ডেটা বিক্রি করে না।',
            )}
          </p>
          <p
            style={{
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: 14,
              color: tk.textDim,
              margin: 0,
              lineHeight: 1.75,
            }}
          >
            {lbl(
              'Today KoyJabo serves over 50,000 commuters daily across Bangladesh — from metro passengers in Dhaka to ferry travellers heading to Barisal.',
              'আজ KoyJabo বাংলাদেশ জুড়ে প্রতিদিন ৫০,০০০ এরও বেশি যাত্রীদের সেবা দেয় — ঢাকার মেট্রো যাত্রী থেকে বরিশালগামী ফেরি যাত্রী পর্যন্ত।',
            )}
          </p>
        </div>

        {/* Install PWA card */}
        <div
          style={{
            background: `linear-gradient(135deg, ${tk.primary} 0%, #a855f7 100%)`,
            borderRadius: 20,
            padding: isMobile ? '32px 24px' : '40px 48px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: BEN,
                fontSize: 20,
                fontWeight: 800,
                color: '#001218',
                margin: '0 0 6px',
              }}
            >
              {lbl('Install KoyJabo App', 'KoyJabo অ্যাপ ইনস্টল করুন')}
            </h3>
            <p
              style={{
                fontFamily: lang === 'bn' ? BEN : SANS,
                fontSize: 13,
                color: 'rgba(0,18,24,0.75)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {lbl('Works offline · No app store needed · Add to home screen', 'অফলাইনে কাজ করে · অ্যাপ স্টোর লাগবে না · হোম স্ক্রিনে যোগ করুন')}
            </p>
          </div>
          <button
            onClick={() => props.onNav('install')}
            style={{
              background: '#001218',
              color: tk.primary,
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {lbl('Download App', 'অ্যাপ ডাউনলোড করুন')}
          </button>
        </div>

        {/* Ads */}
          <AdSlot tk={tk} lang={lang} kind="multiplex" />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>
      </div>
    </PageShell>
  );
}
