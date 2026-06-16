import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, Clock, Tag, Copy, Check, ArrowUp } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SponsoredAdSlot from './SponsoredAdSlot';
import { useLanguage } from '../contexts/LanguageContext';

const CAT_COLORS: Record<string, [string, string]> = {
    'Travel Guide':    ['#10b981', '#006a4e'],
    'Metro Rail':      ['#3b82f6', '#1d4ed8'],
    'Bus & Transport': ['#10b981', '#006a4e'],
    'Tips & Tricks':   ['#0ea5e9', '#0369a1'],
    'App Guide':       ['#8b5cf6', '#5b21b6'],
};

function getCatColors(cat: string): [string, string] {
    return CAT_COLORS[cat] ?? ['#10b981', '#006a4e'];
}

interface BlogPostProps {
    postSlug: string;
    onBack: () => void;
    onGoHome: () => void;
    onSelectPost: (slug: string) => void;
    language: 'en' | 'bn';
}

const BlogPostDetail: React.FC<BlogPostProps> = ({ postSlug, onBack, onGoHome, onSelectPost, language }) => {
    const { t } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
    const post = BLOG_POSTS.find(p => p.slug === postSlug);
    const [copied, setCopied] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [readProgress, setReadProgress] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const scrollTop = el.scrollTop;
        const maxScroll = el.scrollHeight - el.clientHeight;
        setShowScrollTop(scrollTop > 400);
        setReadProgress(maxScroll > 0 ? Math.min(100, (scrollTop / maxScroll) * 100) : 0);
    }, []);

    const scrollToTop = () => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // SEO meta tags
    useEffect(() => {
        if (!post) return;
        const title = language === 'bn' ? post.bnTitle : post.title;
        const desc = language === 'bn' ? post.bnExcerpt : post.excerpt;

        document.title = `${title} | কই যাবো Blog`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', post.keywords.join(', '));
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', post.coverImage.startsWith('http') ? post.coverImage : `https://koyjabo.com${post.coverImage}`);

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'blog-post-ld';
        script.text = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: title,
            description: desc,
            image: post.coverImage.startsWith('http') ? post.coverImage : `https://koyjabo.com${post.coverImage}`,
            author: { '@type': 'Organization', name: 'KoyJabo Team', url: 'https://koyjabo.com' },
            publisher: { '@type': 'Organization', name: 'কই যাবো', logo: { '@type': 'ImageObject', url: 'https://koyjabo.com/logo.png' } },
            datePublished: post.publishDate,
            dateModified: post.publishDate,
            keywords: post.keywords.join(', '),
            articleSection: post.category,
            inLanguage: language === 'bn' ? 'bn-BD' : 'en-US',
            url: `https://koyjabo.com/blog/${post.slug}`,
            mainEntityOfPage: { '@type': 'WebPage', '@id': `https://koyjabo.com/blog/${post.slug}` },
        });
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
            document.title = 'কই যাবো - Dhaka Bus & Transport Guide';
        };
    }, [post, language, postSlug]);

    const postUrl = `${window.location.origin}/blog/${postSlug}`;
    const postTitle = post ? (language === 'bn' ? post.bnTitle : post.title) : '';

    const handleCopy = async () => {
        try { await navigator.clipboard.writeText(postUrl); } catch {
            const ta = document.createElement('textarea');
            ta.value = postUrl; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(postTitle + '\n' + postUrl)}`, '_blank', 'noopener,noreferrer');

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <h2 className="text-2xl font-bold text-kj-text mb-4">{t('blog.postNotFound')}</h2>
                <button onClick={onBack} className="px-6 py-3 bg-kj-primary text-white rounded-xl font-medium hover:bg-teal-700 transition-colors">
                    {t('blog.backToBlog')}
                </button>
            </div>
        );
    }

    const [c1, c2] = getCatColors(post.category);

    const relatedPosts = BLOG_POSTS
        .filter(p => p.id !== post.id)
        .sort((a, b) => {
            const aScore = a.category === post.category ? 1 : 0;
            const bScore = b.category === post.category ? 1 : 0;
            return bScore - aScore;
        })
        .slice(0, 2);

    return (
        <div className="absolute inset-0 z-10 overflow-hidden flex flex-col bg-kj-bg">
            {/* Reading progress bar */}
            <div className="h-0.5 w-full bg-kj-line shrink-0">
                <div
                    className="h-full transition-all duration-100"
                    style={{
                        width: `${readProgress}%`,
                        background: `linear-gradient(90deg, ${c1}, ${c2})`,
                    }}
                />
            </div>

            {/* Sticky back bar */}
            <div className="shrink-0 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3 z-20">
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="font-bengali font-bold text-base text-kj-text">
                    {lbl('Blog', 'ব্লগ')}
                </span>
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto overscroll-y-contain touch-pan-y pb-32"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">

                    {/* Hero image */}
                    <div
                        className="relative w-full rounded-2xl overflow-hidden"
                        style={{ height: '200px', background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    >
                        <svg viewBox="0 0 400 200" className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid slice">
                            <circle cx="60" cy="160" r="60" fill="rgba(255,255,255,0.12)" />
                            <circle cx="340" cy="40" r="80" fill="rgba(255,255,255,0.08)" />
                            <circle cx="200" cy="100" r="40" fill="rgba(255,255,255,0.06)" />
                        </svg>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                            style={{ background: `${c1}22`, color: c1 }}
                        >
                            <Tag className="w-3 h-3" />{post.category}
                        </span>
                        <span className="text-xs text-kj-text-faint flex items-center gap-1">
                            <Clock className="w-3 h-3" />{post.readTime}
                        </span>
                        <span className="text-xs text-kj-text-faint">
                            {new Date(post.publishDate).toLocaleDateString(
                                language === 'bn' ? 'bn-BD' : 'en-US',
                                { year: 'numeric', month: 'short', day: 'numeric' }
                            )}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="font-bengali font-bold text-kj-text leading-tight" style={{ fontSize: '24px' }}>
                        {language === 'bn' ? post.bnTitle : post.title}
                    </h1>

                    {/* Author card */}
                    <div className="dc-card rounded-2xl p-3.5 flex items-center gap-3 border border-kj-line">
                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
                            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                        >
                            {post.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bengali font-bold text-kj-text text-sm leading-none">{post.author}</p>
                            <p className="text-kj-text-faint text-[11px] mt-0.5">
                                {new Date(post.publishDate).toLocaleDateString(
                                    language === 'bn' ? 'bn-BD' : 'en-US',
                                    { year: 'numeric', month: 'long', day: 'numeric' }
                                )}
                            </p>
                        </div>
                        <button className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border border-kj-line bg-kj-chip-bg text-kj-text-dim hover:border-kj-primary hover:text-kj-primary transition-colors">
                            {lbl('Follow', 'ফলো')}
                        </button>
                    </div>

                    {/* Article body */}
                    <article
                        className="font-bengali text-kj-text-dim leading-relaxed"
                        style={{ fontSize: '15px' }}
                    >
                        <div className="
                            prose prose-sm max-w-none
                            prose-headings:font-bold prose-headings:text-kj-text prose-headings:font-bengali
                            prose-h2:text-base prose-h2:mt-8 prose-h2:mb-3
                            prose-h3:text-sm prose-h3:mt-6 prose-h3:mb-2
                            prose-p:text-kj-text-dim prose-p:leading-relaxed prose-p:mb-4
                            prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-kj-text-dim prose-blockquote:my-5
                            prose-strong:text-kj-text prose-strong:font-bold
                            prose-ul:pl-5 prose-ul:space-y-1 prose-li:text-kj-text-dim
                            prose-ol:pl-5 prose-ol:space-y-1
                        "
                            style={{
                                '--tw-prose-body': 'var(--kj-text-dim)',
                                '--tw-prose-headings': 'var(--kj-text)',
                                '--tw-prose-quotes': 'var(--kj-text-dim)',
                                '--tw-prose-bold': 'var(--kj-text)',
                            } as React.CSSProperties}
                        >
                            {(() => {
                                const content = language === 'bn' ? post.bnContent : post.content;
                                const paragraphs = content.split('\n\n');
                                const cut1 = Math.max(3, Math.floor(paragraphs.length * 0.25));
                                const cut2 = Math.max(cut1 + 3, Math.floor(paragraphs.length * 0.65));
                                const part1 = paragraphs.slice(0, cut1).join('\n\n');
                                const part2 = paragraphs.slice(cut1, cut2).join('\n\n');
                                const part3 = paragraphs.slice(cut2).join('\n\n');
                                return (
                                    <>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{part1}</ReactMarkdown>
                                        {part2 && <ReactMarkdown remarkPlugins={[remarkGfm]}>{part2}</ReactMarkdown>}
                                        {part3 && <ReactMarkdown remarkPlugins={[remarkGfm]}>{part3}</ReactMarkdown>}
                                    </>
                                );
                            })()}
                        </div>
                    </article>

                    {/* Ad */}
                    <SponsoredAdSlot language={language} size="300x250" compact />

                    {/* Action bar */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button className="dc-card border border-kj-line rounded-full px-3.5 py-1.5 text-xs font-bold text-kj-text hover:border-kj-primary transition-colors active:scale-95">
                            ❤️ 234
                        </button>
                        <button className="dc-card border border-kj-line rounded-full px-3.5 py-1.5 text-xs font-bold text-kj-text hover:border-kj-primary transition-colors active:scale-95">
                            💬 18
                        </button>
                        <button className="dc-card border border-kj-line rounded-full px-3.5 py-1.5 text-xs font-bold text-kj-text hover:border-kj-primary transition-colors active:scale-95">
                            🔖 {lbl('Save', 'সেভ')}
                        </button>
                        <button
                            onClick={shareWhatsApp}
                            className="dc-card border border-kj-line rounded-full px-3.5 py-1.5 text-xs font-bold text-kj-text hover:border-kj-primary transition-colors active:scale-95"
                        >
                            ↗ {lbl('Share', 'শেয়ার')}
                        </button>
                        <button
                            onClick={handleCopy}
                            className="dc-card border border-kj-line rounded-full px-3.5 py-1.5 text-xs font-bold text-kj-text hover:border-kj-primary transition-colors active:scale-95 flex items-center gap-1"
                        >
                            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            {copied ? t('blog.copied') : t('blog.copyLink')}
                        </button>
                    </div>

                    {/* Read next */}
                    {relatedPosts.length > 0 && (
                        <div className="pt-4 border-t border-kj-line space-y-3">
                            <h3 className="font-bengali font-bold text-kj-text text-base">
                                {lbl('Read next', 'আরও পড়ুন')}
                            </h3>
                            {relatedPosts.map(rp => {
                                const [rc1, rc2] = getCatColors(rp.category);
                                return (
                                    <div
                                        key={rp.id}
                                        onClick={() => onSelectPost(rp.slug)}
                                        className="dc-card rounded-xl cursor-pointer border border-kj-line p-3 flex items-center gap-3 active:scale-[0.99] transition-all hover:border-kj-primary/40"
                                    >
                                        <div
                                            className="shrink-0 w-16 h-16 rounded-xl overflow-hidden relative"
                                            style={{ background: `linear-gradient(135deg, ${rc1}, ${rc2})` }}
                                        >
                                            <svg viewBox="0 0 64 64" className="w-full h-full absolute inset-0">
                                                <circle cx="12" cy="52" r="18" fill="rgba(255,255,255,0.12)" />
                                                <circle cx="52" cy="12" r="22" fill="rgba(255,255,255,0.08)" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-wide"
                                                style={{ color: rc1 }}
                                            >
                                                {rp.category}
                                            </span>
                                            <h4 className="font-bengali font-bold text-kj-text text-sm leading-snug line-clamp-2 mt-0.5">
                                                {language === 'bn' ? rp.bnTitle : rp.title}
                                            </h4>
                                            <span className="text-[10px] text-kj-text-faint flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />{rp.readTime}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <SponsoredAdSlot language={language} size="728x90" compact />

                    {/* CTA */}
                    <button
                        onClick={onGoHome}
                        className="w-full h-12 font-bengali font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-kj-primary-ink"
                        style={{
                            background: `linear-gradient(135deg, ${c1}, ${c2})`,
                            boxShadow: `0 8px 22px -10px ${c1}`,
                        }}
                    >
                        {lbl('Open KoyJabo', 'হোমে যান')}
                    </button>

                    <div className="h-4" />
                </div>

                {/* Scroll to top */}
                <button
                    onClick={scrollToTop}
                    className={`fixed bottom-24 right-6 p-4 text-white rounded-full shadow-2xl transition-all duration-300 z-50 active:scale-95 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
                    aria-label="Scroll to top"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default BlogPostDetail;
