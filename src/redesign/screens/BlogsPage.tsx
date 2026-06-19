import React from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens, Lang } from '../tokens';
import { PageShell, PageShellProps } from './PageShell';
import { AdSlot } from '../components/AdSlot';

const BLOGS = [
  {
    id: 'mrt6',
    titleEn: 'MRT-6 Complete Guide 2026',
    titleBn: 'মেট্রো রেল সম্পূর্ণ গাইড ২০২৬',
    date: 'Jun 10',
    category: 'Metro',
    readTime: '8 min',
    tags: ['metro', 'guide'],
    from: '#1e3a8a',
    to: '#3b82f6',
  },
  {
    id: 'coxsbazar-bus',
    titleEn: "Cox's Bazar Bus Guide",
    titleBn: 'কক্সবাজার বাস গাইড',
    date: 'Jun 8',
    category: 'Intercity',
    readTime: '6 min',
    tags: ['intercity', 'bus'],
    from: '#064e3b',
    to: '#10b981',
  },
  {
    id: 'sadarghat',
    titleEn: 'Sadarghat Launch Terminal',
    titleBn: 'সদরঘাট লঞ্চ টার্মিনাল',
    date: 'Jun 5',
    category: 'Launch',
    readTime: '5 min',
    tags: ['launch', 'terminal'],
    from: '#075985',
    to: '#0ea5e9',
  },
  {
    id: 'dhaka-traffic',
    titleEn: 'Dhaka Traffic Tips 2026',
    titleBn: 'ঢাকা ট্রাফিক টিপস',
    date: 'Jun 3',
    category: 'Tips',
    readTime: '4 min',
    tags: ['tips', 'traffic'],
    from: '#b45309',
    to: '#f59e0b',
  },
  {
    id: 'train-eticket',
    titleEn: 'Bangladesh Railway E-ticket',
    titleBn: 'বাংলাদেশ রেলওয়ে ই-টিকেট',
    date: 'Jun 1',
    category: 'Train',
    readTime: '7 min',
    tags: ['train', 'eticket'],
    from: '#5b21b6',
    to: '#8b5cf6',
  },
  {
    id: 'airport-city',
    titleEn: 'Airport to City Guide',
    titleBn: 'বিমানবন্দর থেকে শহর',
    date: 'May 28',
    category: 'Flights',
    readTime: '5 min',
    tags: ['flights', 'airport'],
    from: '#b91c1c',
    to: '#ef4444',
  },
];

function BlogCard({
  blog,
  tk,
  lang,
  onNav,
}: {
  blog: typeof BLOGS[0];
  tk: Tokens;
  lang: Lang;
  onNav: (r: string) => void;
}) {
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  return (
    <div
      onClick={() => onNav('blog-detail')}
      style={{
        background: tk.panel,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${tk.line}`,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onNav('blog-detail')}
    >
      {/* Gradient hero thumbnail */}
      <div
        style={{
          background: `linear-gradient(135deg, ${blog.from} 0%, ${blog.to} 100%)`,
          height: 120,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '12px 14px',
        }}
      >
        <span
          style={{
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            borderRadius: 6,
            padding: '3px 9px',
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 600,
            color: '#fff',
            letterSpacing: 0.3,
          }}
        >
          {blog.category}
        </span>
      </div>

      <div style={{ padding: '16px 16px 18px' }}>
        <h3
          style={{
            fontFamily: lang === 'bn' ? BEN : SANS,
            fontSize: 14,
            fontWeight: 700,
            color: tk.text,
            margin: '0 0 8px',
            lineHeight: 1.45,
          }}
        >
          {lbl(blog.titleEn, blog.titleBn)}
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: 11,
              color: tk.textFaint,
            }}
          >
            {blog.date}
          </span>
          <span style={{ color: tk.line, fontSize: 10 }}>·</span>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 11,
              color: tk.textFaint,
            }}
          >
            {blog.readTime} {lbl('read', 'পড়া')}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {blog.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: tk.chipBg,
                borderRadius: 6,
                padding: '2px 8px',
                fontFamily: SANS,
                fontSize: 10,
                fontWeight: 500,
                color: tk.chipText,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogsPage(props: PageShellProps) {
  const { theme, lang, device } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const firstRow = BLOGS.slice(0, 3);
  const secondRow = BLOGS.slice(3, 6);

  return (
    <PageShell {...props}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 16px 80px' : '0 40px 80px' }}>

        {/* Header */}
        <div style={{ paddingTop: 32, marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: BEN,
              fontSize: isMobile ? 24 : 32,
              fontWeight: 800,
              color: tk.text,
              margin: '0 0 8px',
            }}
          >
            {lbl('Blog', 'ব্লগ')}
          </h1>
          <p
            style={{
              fontFamily: lang === 'bn' ? BEN : SANS,
              fontSize: 14,
              color: tk.textDim,
              margin: 0,
            }}
          >
            {lbl('Guides, tips and transport news', 'গাইড, টিপস এবং পরিবহন সংবাদ')}
          </p>
        </div>

        {/* First row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {firstRow.map((b) => (
            <BlogCard key={b.id} blog={b} tk={tk} lang={lang} onNav={props.onNav} />
          ))}
        </div>

        {/* Native ad between rows */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'mid-rect'} />
        </div>

        {/* Second row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {secondRow.map((b) => (
            <BlogCard key={b.id} blog={b} tk={tk} lang={lang} onNav={props.onNav} />
          ))}
        </div>

        {/* Footer ad */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>
      </div>
    </PageShell>
  );
}
