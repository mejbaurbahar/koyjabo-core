import React from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens, Lang } from '../tokens';
import { PageShell, PageShellProps } from './PageShell';
import { AdSlot } from '../components/AdSlot';

const TEAM = [
  { role: 'Developer', roleBn: 'ডেভেলপার', initials: 'MB', color: '#3b82f6', desc: 'Full-stack, PWA architecture', descBn: 'ফুল-স্ট্যাক, PWA আর্কিটেকচার' },
  { role: 'Designer', roleBn: 'ডিজাইনার', initials: 'RK', color: '#a855f7', desc: 'UI/UX, branding', descBn: 'ইউআই/ইউএক্স, ব্র্যান্ডিং' },
  { role: 'Data', roleBn: 'ডেটা', initials: 'SA', color: '#10b981', desc: 'Route data, schedules', descBn: 'রুট ডেটা, সময়সূচি' },
  { role: 'Community', roleBn: 'কমিউনিটি', initials: 'FH', color: '#f59e0b', desc: 'User research, QA', descBn: 'ব্যবহারকারী গবেষণা, QA' },
];

const STATS = [
  { valueEn: '2 years', valueBn: '২ বছর', labelEn: 'Building', labelBn: 'নির্মাণকাল' },
  { valueEn: '50K', valueBn: '৫০ হাজার', labelEn: 'Users', labelBn: 'ব্যবহারকারী' },
  { valueEn: '2,400', valueBn: '২,৪০০', labelEn: 'Routes', labelBn: 'রুট' },
  { valueEn: '64', valueBn: '৬৪', labelEn: 'Districts', labelBn: 'জেলা' },
];

const CONTACTS = [
  { icon: '💼', label: 'LinkedIn', href: 'https://www.linkedin.com/company/koy-jabo/', labelBn: 'লিংকডইন' },
  { icon: '📘', label: 'Facebook', href: 'https://www.facebook.com/koyjabo/', labelBn: 'ফেসবুক' },
  { icon: '✉️', label: 'koyjabo@gmail.com', href: 'mailto:koyjabo@gmail.com', labelBn: 'ইমেইল' },
];

export function AboutPage(props: PageShellProps) {
  const { theme, lang, device } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);

  return (
    <PageShell {...props}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 16px 80px' : '0 40px 80px' }}>

        {/* Hero */}
        <div
          style={{
            textAlign: 'center',
            padding: isMobile ? '48px 16px 32px' : '72px 48px 40px',
            marginBottom: 32,
          }}
        >
          {/* Logo */}
          <div style={{ margin: '0 auto 20px', width: 88, height: 88, borderRadius: 22, overflow: 'hidden', boxShadow: `0 0 40px ${tk.primary}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05060b' }}>
            <img src="/logo.png" alt="KoyJabo" width={88} height={88} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1
            style={{
              fontFamily: BEN,
              fontSize: isMobile ? 28 : 38,
              fontWeight: 800,
              color: tk.text,
              margin: '0 0 12px',
              background: `linear-gradient(135deg, ${tk.primary} 0%, #a855f7 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {lbl('About KoyJabo', 'আমাদের সম্পর্কে')}
          </h1>
          <p
            style={{
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: 16,
              color: tk.textDim,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {lbl("Bangladesh's transport companion", 'বাংলাদেশের যানবাহন সঙ্গী')}
          </p>
        </div>

        {/* Story */}
        <div
          style={{
            background: tk.panel,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${tk.line}`,
            borderRadius: 16,
            padding: '28px 28px',
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontFamily: BEN,
              fontSize: 18,
              fontWeight: 700,
              color: tk.primary,
              margin: '0 0 14px',
            }}
          >
            {lbl('Our Story', 'আমাদের গল্প')}
          </h2>
          <p
            style={{
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: 14,
              color: tk.textDim,
              margin: 0,
              lineHeight: 1.8,
            }}
          >
            {lbl(
              "KoyJabo (কই যাবো = 'Where are you going?') was created to solve the chaos of navigating Dhaka's public transport. We cover buses, metro, trains, launches and flights across all 64 districts. Our mission is simple: make every journey in Bangladesh stress-free and informed.",
              "KoyJabo (কই যাবো = 'কোথায় যাচ্ছেন?') তৈরি হয়েছে ঢাকার গণপরিবহনে নেভিগেট করার বিশৃঙ্খলা সমাধান করতে। আমরা সকল ৬৪ জেলায় বাস, মেট্রো, ট্রেন, লঞ্চ এবং ফ্লাইট কভার করি। আমাদের লক্ষ্য সহজ: বাংলাদেশে প্রতিটি যাত্রা চাপমুক্ত ও সচেতন করা।",
            )}
          </p>
        </div>

        {/* Team */}
        <h2
          style={{
            fontFamily: BEN,
            fontSize: 18,
            fontWeight: 700,
            color: tk.text,
            margin: '0 0 16px',
          }}
        >
          {lbl('Our Team', 'আমাদের দল')}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 32,
          }}
        >
          {TEAM.map((m) => (
            <div
              key={m.role}
              style={{
                background: tk.panel,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: `1px solid ${tk.line}`,
                borderRadius: 14,
                padding: '20px 16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${m.color}cc, ${m.color}66)`,
                  border: `2px solid ${m.color}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#fff',
                }}
              >
                {m.initials}
              </div>
              <div
                style={{
                  fontFamily: lang === 'bn' ? BEN : SANS,
                  fontSize: 14,
                  fontWeight: 600,
                  color: tk.text,
                  marginBottom: 4,
                }}
              >
                {lbl(m.role, m.roleBn)}
              </div>
              <div
                style={{
                  fontFamily: lang === 'bn' ? BEN : SANS,
                  fontSize: 11,
                  color: tk.textFaint,
                  lineHeight: 1.5,
                }}
              >
                {lbl(m.desc, m.descBn)}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          style={{
            background: `linear-gradient(135deg, ${tk.primary}22 0%, #a855f755 100%)`,
            border: `1px solid ${tk.primary}33`,
            borderRadius: 16,
            padding: '24px 24px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: 20,
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          {STATS.map((s) => (
            <div key={s.labelEn}>
              <div
                style={{
                  fontFamily: BEN,
                  fontSize: 26,
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
                  fontSize: 12,
                  color: tk.textDim,
                }}
              >
                {lbl(s.labelEn, s.labelBn)}
              </div>
            </div>
          ))}
        </div>

        {/* Contact links */}
        <h2
          style={{
            fontFamily: BEN,
            fontSize: 18,
            fontWeight: 700,
            color: tk.text,
            margin: '0 0 14px',
          }}
        >
          {lbl('Contact & Links', 'যোগাযোগ ও লিংক')}
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 12,
            marginBottom: 40,
          }}
        >
          {CONTACTS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: tk.panel,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: `1px solid ${tk.line}`,
                borderRadius: 12,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                color: tk.textDim,
                fontFamily: lang === 'bn' ? BEN : SANS,
                fontSize: 13,
                fontWeight: 500,
                flex: isMobile ? undefined : 1,
              }}
            >
              <span style={{ fontSize: 18 }}>{c.icon}</span>
              <span>{lbl(c.label, c.labelBn)}</span>
            </a>
          ))}
        </div>

        {/* Ads */}
          <AdSlot tk={tk} lang={lang} kind="in-article" />
          <AdSlot tk={tk} lang={lang} kind="multiplex" />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>
      </div>
    </PageShell>
  );
}
