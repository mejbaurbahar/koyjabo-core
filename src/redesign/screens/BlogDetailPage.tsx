import React from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Pill } from '../components/Pill';
import { BLOG_POSTS } from '../../../data/blogPosts';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

function renderMarkdown(text: string, tk: Record<string, string>, isbn: boolean) {
  if (!text) return null;
  const font = isbn ? BEN : SANS;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  const inlineStyles = (line: string): React.ReactNode => {
    // Strip inline backtick code, then bold/italic
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, pi) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={pi} style={{ color: tk.text }}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*'))
        return <em key={pi}>{part.slice(1, -1)}</em>;
      if (part.startsWith('`') && part.endsWith('`'))
        return <code key={pi} style={{ fontFamily: 'monospace', background: tk.panelMuted, padding: '1px 5px', borderRadius: 4, fontSize: 13 }}>{part.slice(1, -1)}</code>;
      // Inline links [text](url)
      const linkRe = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
      const segs: React.ReactNode[] = [];
      let last = 0, m;
      linkRe.lastIndex = 0;
      while ((m = linkRe.exec(part)) !== null) {
        if (m.index > last) segs.push(part.slice(last, m.index));
        segs.push(<a key={m.index} href={m[2]} target="_blank" rel="noopener noreferrer" style={{ color: tk.primary, textDecoration: 'underline' }}>{m[1]}</a>);
        last = m.index + m[0].length;
      }
      if (last < part.length) segs.push(part.slice(last));
      return segs.length > 1 ? segs : part;
    });
  };

  const isTableRow = (l: string) => l.trim().startsWith('|') && l.trim().endsWith('|');
  const isSeparator = (l: string) => /^\s*\|[\s|:-]+\|\s*$/.test(l);
  const parseRow = (l: string) => l.trim().slice(1, -1).split('|').map(c => c.trim());

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip horizontal rules
    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) { i++; continue; }

    // Empty line
    if (!trimmed) { i++; continue; }

    // Table
    if (isTableRow(line) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const headers = parseRow(line);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      elements.push(
        <div key={`tbl-${i}`} style={{ overflowX: 'auto', margin: '16px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font, fontSize: 13 }}>
            <thead>
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} style={{ background: tk.primarySoft, color: tk.primary, padding: '8px 12px', textAlign: 'left', borderBottom: `2px solid ${tk.primary}44`, whiteSpace: 'nowrap', fontWeight: 700 }}>
                    {inlineStyles(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? tk.panel : tk.panelMuted }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '8px 12px', borderBottom: `1px solid ${tk.line}`, color: ci === 0 ? tk.text : tk.textDim, fontWeight: ci === 0 ? 700 : 400 }}>
                      {inlineStyles(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const qlines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        qlines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <blockquote key={`bq-${i}`} style={{ borderLeft: `3px solid ${tk.primary}`, paddingLeft: 14, margin: '12px 0', color: tk.textDim, fontFamily: font, fontSize: 13, lineHeight: 1.7 }}>
          {qlines.map((ql, qi) => <div key={qi}>{inlineStyles(ql)}</div>)}
        </blockquote>
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontFamily: font, fontSize: 22, fontWeight: 800, color: tk.text, margin: '20px 0 10px' }}>{inlineStyles(line.slice(2))}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontFamily: font, fontSize: 18, fontWeight: 700, color: tk.text, margin: '18px 0 8px' }}>{inlineStyles(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontFamily: font, fontSize: 15, fontWeight: 700, color: tk.text, margin: '14px 0 6px' }}>{inlineStyles(line.slice(4))}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={i} style={{ marginBottom: 4 }}>{inlineStyles(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} style={{ fontFamily: font, fontSize: 14, color: tk.textDim, lineHeight: 1.7, paddingLeft: 20, margin: '8px 0' }}>{items}</ul>);
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i} style={{ marginBottom: 4 }}>{inlineStyles(lines[i].replace(/^\d+\. /, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} style={{ fontFamily: font, fontSize: 14, color: tk.textDim, lineHeight: 1.7, paddingLeft: 20, margin: '8px 0' }}>{items}</ol>);
      continue;
    } else {
      elements.push(<p key={i} style={{ fontFamily: font, fontSize: 14, color: tk.textDim, lineHeight: 1.8, margin: '10px 0' }}>{inlineStyles(line)}</p>);
    }
    i++;
  }
  return elements;
}

const CAT_GRAD: Record<string, [string, string]> = {
  Metro:     ['#1e3a8a', '#3b82f6'],
  Intercity: ['#064e3b', '#10b981'],
  Launch:    ['#075985', '#0ea5e9'],
  Tips:      ['#b45309', '#f59e0b'],
  Train:     ['#5b21b6', '#8b5cf6'],
  Flights:   ['#b91c1c', '#ef4444'],
  Guide:     ['#065f46', '#34d399'],
};

export function BlogDetailPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const slug = params?.slug ?? '';

  // Find the blog post
  const post = BLOG_POSTS.find(p => p.slug === slug || p.id === slug) ?? BLOG_POSTS[0];
  const [gradFrom, gradTo] = CAT_GRAD[post.category] ?? ['#1e3a8a', '#4338ca'];

  const title = lang === 'bn' && post.bnTitle ? post.bnTitle : post.title;
  const content = lang === 'bn' && post.bnContent ? post.bnContent : post.content;
  const excerpt = lang === 'bn' && post.bnExcerpt ? post.bnExcerpt : post.excerpt;
  const font = lang === 'bn' ? BEN : SANS;

  // Related posts (same category, excluding current)
  const related = BLOG_POSTS.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  return (
    <PageShell {...props}>
      <div style={{ padding: isMobile ? '16px 16px 48px' : '28px 40px 48px', maxWidth: 800, margin: '0 auto' }}>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <Pill tk={tk} tone="primary">{post.category}</Pill>
          <span style={{ fontFamily: SANS, fontSize: 12, color: tk.textFaint }}>
            {post.publishDate} · {post.readTime}
          </span>
          <button
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            style={{ marginLeft: 'auto', background: 'none', border: 0, color: tk.textFaint, cursor: 'pointer', fontFamily: SANS, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            🔗 {T(lang, 'শেয়ার', 'Share')}
          </button>
        </div>

        {/* Hero image or gradient */}
        <div style={{ height: isMobile ? 200 : 340, background: post.coverImage ? `url(${post.coverImage}) center/cover no-repeat, linear-gradient(135deg,${gradFrom},${gradTo})` : `linear-gradient(135deg,${gradFrom},${gradTo})`, borderRadius: 18, marginBottom: 16, display: 'flex', alignItems: 'flex-end', padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 40%, transparent 100%)', borderRadius: 18 }} />
          <h1 style={{ fontFamily: font, fontWeight: 700, fontSize: isMobile ? 20 : 26, color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.4)', lineHeight: 1.3, position: 'relative', zIndex: 1 }}>
            {title}
          </h1>
        </div>

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: `linear-gradient(135deg,${gradFrom},${gradTo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 14 }}>KJ</div>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, color: tk.text }}>{post.author}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint }}>{post.publishDate}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {post.keywords?.slice(0, 3).map(k => (
              <span key={k} style={{ background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 999, padding: '3px 8px', fontFamily: SANS, fontSize: 11, color: tk.textDim }}>{k}</span>
            ))}
          </div>
        </div>

        {/* Excerpt */}
        {excerpt && (
          <div style={{ background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontFamily: font, fontSize: 14, color: tk.textDim, lineHeight: 1.7, fontStyle: 'italic' }}>
            {excerpt}
          </div>
        )}

        <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />

        {/* Main content */}
        <div style={{ marginTop: 20 }}>
          {renderMarkdown(content, tk, lang === 'bn')}
        </div>

        <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />

        {/* Related posts */}
        {related.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
              {T(lang, 'আরও পড়ুন', 'Related posts')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {related.map(r => (
                <div key={r.id} onClick={() => onNav('blog-detail', { slug: r.slug })}
                  style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${CAT_GRAD[r.category]?.[0] ?? '#1e3a8a'},${CAT_GRAD[r.category]?.[1] ?? '#3b82f6'})`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: 600, color: tk.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang === 'bn' && r.bnTitle ? r.bnTitle : r.title}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 2 }}>{r.publishDate} · {r.readTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
