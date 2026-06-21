import React from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens, Lang } from '../tokens';
import { PageShell, PageShellProps } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { BLOG_POSTS } from '../../../data/blogPosts';

// Category → gradient colors
const CAT_COLORS: Record<string, [string, string]> = {
  Metro:     ['#1e3a8a', '#3b82f6'],
  Intercity: ['#064e3b', '#10b981'],
  Launch:    ['#075985', '#0ea5e9'],
  Tips:      ['#b45309', '#f59e0b'],
  Train:     ['#5b21b6', '#8b5cf6'],
  Flights:   ['#b91c1c', '#ef4444'],
  Guide:     ['#065f46', '#34d399'],
  News:      ['#1e3a8a', '#6366f1'],
};

function catColors(category: string): [string, string] {
  return CAT_COLORS[category] ?? ['#374151', '#6b7280'];
}

// Map BLOG_POSTS to the shape expected by BlogCard
const BLOGS = BLOG_POSTS.map(p => {
  const [from, to] = catColors(p.category);
  const dateObj = new Date(p.publishDate);
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return {
    id: p.slug,
    titleEn: p.title,
    titleBn: p.bnTitle || p.title,
    date: dateStr,
    category: p.category,
    readTime: p.readTime,
    tags: p.keywords?.slice(0, 3) ?? [],
    from,
    to,
    coverImage: p.coverImage || null,
  };
});

function BlogCard({
  blog,
  tk,
  lang,
  onNav,
}: {
  blog: typeof BLOGS[0];
  tk: Tokens;
  lang: Lang;
  onNav: (r: string, p?: Record<string, string>) => void;
}) {
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  return (
    <div
      onClick={() => onNav('blog-detail', { slug: blog.id })}
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
      onKeyDown={(e) => e.key === 'Enter' && onNav('blog-detail', { slug: blog.id })}
    >
      {/* Cover image or gradient hero thumbnail */}
      <div
        style={{
          background: blog.coverImage
            ? `url(${blog.coverImage}) center/cover no-repeat, linear-gradient(135deg, ${blog.from} 0%, ${blog.to} 100%)`
            : `linear-gradient(135deg, ${blog.from} 0%, ${blog.to} 100%)`,
          height: 140,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '12px 14px',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 30%, transparent 100%)' }} />
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
  const secondRow = BLOGS.slice(3);

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
