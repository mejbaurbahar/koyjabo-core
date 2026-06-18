import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Pill } from '../components/Pill';
import { BLOG_POSTS } from '../../../data/blogPosts';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const CAT_COLORS: Record<string, [string, string]> = {
  'Travel Guide': ['#10b981', '#006a4e'],
  'Train & Railway': ['#5b21b6', '#8b5cf6'],
  'Metro Rail': ['#1e3a8a', '#3b82f6'],
  'Bus & Transport': ['#064e3b', '#10b981'],
  'App Guide': ['#7c3aed', '#a855f7'],
  'Tips & Tricks': ['#b45309', '#f59e0b'],
};

function colors(category: string): [string, string] {
  return CAT_COLORS[category] ?? ['#075985', '#0ea5e9'];
}

export function BlogDetailPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const post = BLOG_POSTS.find(item => item.slug === params?.slug) ?? BLOG_POSTS[0];
  const [from, to] = colors(post.category);
  const title = lang === 'bn' ? post.bnTitle : post.title;
  const excerpt = lang === 'bn' ? post.bnExcerpt : post.excerpt;
  const content = lang === 'bn' ? post.bnContent : post.content;
  const related = BLOG_POSTS.filter(item => item.slug !== post.slug).slice(0, 2);

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:820, margin:'0 auto' }}>
        <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:12,flexWrap:'wrap' }}>
          <Pill tk={tk} tone="primary">{post.category}</Pill>
          <span style={{ fontFamily:SANS,fontSize:12,color:tk.textFaint }}>
            {new Date(post.publishDate).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { year:'numeric', month:'short', day:'numeric' })} · {post.readTime}
          </span>
          <button
            onClick={() => navigator.clipboard?.writeText(`${location.origin}/blog/${post.slug}`).catch(() => {})}
            style={{ marginLeft:'auto',background:'none',border:0,color:tk.textFaint,cursor:'pointer',fontFamily:SANS,fontSize:12,display:'flex',alignItems:'center',gap:4 }}
          >
            {T(lang,'শেয়ার','Share')}
          </button>
        </div>

        <div style={{ minHeight:220,background:`linear-gradient(135deg,${from},${to})`,borderRadius:18,marginBottom:16,display:'flex',alignItems:'flex-end',padding:20,overflow:'hidden',position:'relative' }}>
          {post.coverImage && (
            <img src={post.coverImage} alt={title} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.28 }} />
          )}
          <div style={{ position:'relative',zIndex:1 }}>
            <h1 style={{ fontFamily:BEN,fontWeight:800,fontSize:isMobile?22:30,color:'#fff',margin:'0 0 8px',textShadow:'0 2px 8px rgba(0,0,0,0.45)',lineHeight:1.25 }}>
              {title}
            </h1>
            <p style={{ fontFamily:lang === 'bn' ? BEN : SANS,fontSize:14,color:'rgba(255,255,255,0.88)',margin:0,lineHeight:1.5 }}>
              {excerpt}
            </p>
          </div>
        </div>

        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
          <div style={{ width:36,height:36,borderRadius:999,background:`linear-gradient(135deg,${from},${to})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:SANS,fontWeight:700,fontSize:14 }}>KJ</div>
          <div>
            <div style={{ fontFamily:SANS,fontWeight:600,fontSize:13,color:tk.text }}>{post.author}</div>
            <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint }}>{post.publishDate}</div>
          </div>
        </div>

        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>

        <article
          className="kj-blog-markdown"
          style={{ fontFamily:lang === 'bn' ? BEN : SANS,fontSize:15,color:tk.textDim,lineHeight:1.85,marginTop:18 }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>

        <div style={{ display:'flex',gap:8,flexWrap:'wrap',margin:'22px 0' }}>
          {post.keywords.slice(0, 8).map(tag => (
            <span key={tag} style={{ background:tk.chipBg,padding:'4px 10px',borderRadius:999,fontFamily:SANS,fontSize:12,color:tk.chipText }}>#{tag}</span>
          ))}
        </div>

        <h3 style={{ fontFamily:BEN,fontWeight:700,fontSize:16,color:tk.text,marginBottom:12 }}>{T(lang,'সম্পর্কিত পোস্ট','Related posts')}</h3>
        <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12 }}>
          {related.map(item => {
            const [a, b] = colors(item.category);
            return (
              <button key={item.slug} onClick={() => onNav('blog-detail', { slug: item.slug })} style={{ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:14,padding:0,cursor:'pointer',textAlign:'left',overflow:'hidden' }}>
                <div style={{ height:78,background:`linear-gradient(135deg,${a},${b})` }}/>
                <div style={{ padding:12,fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text }}>{lang === 'bn' ? item.bnTitle : item.title}</div>
              </button>
            );
          })}
        </div>

        <AdSlot tk={tk} lang={lang} kind={isMobile?'mob-banner':'leaderboard'}/>
      </div>
    </PageShell>
  );
}
