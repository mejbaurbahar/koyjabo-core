import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, Clock, Calendar, Tag, Copy, Check, ArrowUp, List } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SponsoredAdSlot from './SponsoredAdSlot';
import { useLanguage } from '../contexts/LanguageContext';

interface BlogPostProps {
    postSlug: string;
    onBack: () => void;
    onGoHome: () => void;
    language: 'en' | 'bn';
}

interface TocItem {
    id: string;
    text: string;
    level: number;
}

function extractToc(markdown: string): TocItem[] {
    const lines = markdown.split('\n');
    const items: TocItem[] = [];
    for (const line of lines) {
        const m2 = line.match(/^## (.+)/);
        const m3 = line.match(/^### (.+)/);
        const text = (m2?.[1] || m3?.[1] || '').replace(/[*_`#[\]()]/g, '').trim();
        if (!text) continue;
        items.push({
            id: text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            text,
            level: m2 ? 2 : 3,
        });
    }
    return items;
}

const BlogPostDetail: React.FC<BlogPostProps> = ({ postSlug, onBack, onGoHome, language }) => {
    const { t } = useLanguage();
    const post = BLOG_POSTS.find(p => p.slug === postSlug);
    const [copied, setCopied] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [readProgress, setReadProgress] = useState(0);
    const [showToc, setShowToc] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const toc = post ? extractToc(language === 'bn' ? post.bnContent : post.content) : [];

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
    const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank', 'noopener,noreferrer');
    const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}&via=koyjabo`, '_blank', 'noopener,noreferrer');

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

    const relatedPosts = BLOG_POSTS
        .filter(p => p.id !== post.id)
        .sort((a, b) => {
            // same category first
            const aScore = a.category === post.category ? 1 : 0;
            const bScore = b.category === post.category ? 1 : 0;
            return bScore - aScore;
        })
        .slice(0, 3);

    return (
        <div className="absolute inset-0 z-10 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-kj-bg dark:via-kj-bg dark:to-kj-bg">
            {/* Reading Progress Bar */}
            <div className="h-1 w-full bg-gray-200 dark:bg-kj-chip-bg shrink-0">
                <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-100"
                    style={{ width: `${readProgress}%` }}
                />
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto overscroll-y-contain touch-pan-y pb-32"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* Hero Image */}
                <div className="w-full bg-gradient-to-br from-teal-500 to-cyan-600">
                    <div className="max-w-5xl mx-auto">
                        <img
                            src={post.coverImage}
                            alt={language === 'bn' ? post.bnTitle : post.title}
                            className="w-full h-56 sm:h-72 md:h-96 object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                        />
                    </div>
                </div>

                <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10 w-full">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-kj-primary hover:text-teal-700 font-semibold transition-all bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 rounded-xl group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        {t('blog.backToBlog')}
                    </button>

                    <header className="mb-8">
                        <div className="flex flex-wrap items-center gap-3 mb-5">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-semibold shadow">
                                <Tag className="w-4 h-4" />{post.category}
                            </span>
                            <span className="inline-flex items-center gap-2 text-kj-text-dim text-sm">
                                <Clock className="w-4 h-4" />{post.readTime}
                            </span>
                            <span className="inline-flex items-center gap-2 text-kj-text-dim text-sm">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.publishDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-kj-text mb-5 leading-tight">
                            {language === 'bn' ? post.bnTitle : post.title}
                        </h1>

                        <p className="text-lg text-kj-text-dim mb-6 leading-relaxed">
                            {language === 'bn' ? post.bnExcerpt : post.excerpt}
                        </p>

                        {/* Author + Share row */}
                        <div className="flex items-center justify-between flex-wrap gap-3 pb-6 border-b-2 border-kj-line">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold">
                                    {post.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-kj-text">{post.author}</p>
                                    <p className="text-xs text-kj-text-dim">{t('blog.author')}</p>
                                </div>
                            </div>

                            {/* Social Share */}
                            <div className="flex items-center gap-2">
                                <button onClick={shareWhatsApp} aria-label="Share on WhatsApp"
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                </button>
                                <button onClick={shareFacebook} aria-label="Share on Facebook"
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-kj-primary hover:brightness-110 text-white transition-colors shadow-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </button>
                                <button onClick={shareTwitter} aria-label="Share on X"
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-900 hover:bg-black text-white transition-colors shadow-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </button>
                                <button onClick={handleCopy} aria-label="Copy link"
                                    className="flex items-center gap-1.5 px-3 py-2 bg-kj-chip-bg hover:bg-kj-chip-bg text-kj-text-dim rounded-xl text-xs font-semibold transition-colors">
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    {copied ? t('blog.copied') : t('blog.copyLink')}
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Table of Contents */}
                    {toc.length > 2 && (
                        <div className="mb-8 bg-teal-50 dark:bg-kj-chip-bg border border-teal-200 dark:border-teal-800 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setShowToc(v => !v)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left"
                            >
                                <span className="flex items-center gap-2 font-bold text-kj-text text-sm">
                                    <List className="w-4 h-4 text-teal-600" />
                                    {t('blog.toc')}
                                </span>
                                <span className="text-kj-primary text-xs">{showToc ? '▲' : '▼'}</span>
                            </button>
                            {showToc && (
                                <ul className="px-5 pb-4 space-y-1 border-t border-teal-200 dark:border-teal-800 pt-3">
                                    {toc.map((item, i) => (
                                        <li key={i} className={item.level === 3 ? 'pl-4' : ''}>
                                            <a
                                                href={`#${item.id}`}
                                                className="text-sm text-teal-700 dark:text-teal-400 hover:underline"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    scrollContainerRef.current?.querySelector(`#${item.id}`)?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                            >
                                                {item.level === 2 ? `${i + 1}. ` : '• '}{item.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="lg:grid lg:grid-cols-12 lg:gap-10">
                        <div className="lg:col-span-8">
                            {/* Content */}
                            <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none
                                prose-headings:font-black prose-headings:text-kj-text dark:prose-headings:text-gray-100 prose-headings:scroll-mt-20
                                prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b-4 prose-h2:border-teal-500
                                prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-5 prose-h3:text-teal-700 dark:prose-h3:text-teal-400
                                prose-p:text-kj-text-dim dark:prose-p:text-kj-text-faint prose-p:leading-loose prose-p:mb-6 prose-p:text-base md:prose-p:text-lg
                                prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-kj-text dark:prose-strong:text-gray-100 prose-strong:font-black
                                prose-ul:my-8 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-3
                                prose-ol:my-8 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-3
                                prose-li:text-kj-text-dim dark:prose-li:text-kj-text-faint prose-li:text-base md:prose-li:text-lg prose-li:leading-loose
                                prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-kj-text-dim dark:prose-blockquote:text-kj-text-faint prose-blockquote:bg-teal-50 dark:prose-blockquote:bg-kj-chip-bg/50 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:my-8
                                prose-code:bg-teal-100 dark:prose-code:bg-kj-chip-bg prose-code:text-teal-800 dark:prose-code:text-teal-300 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                prose-table:border-collapse prose-table:w-full prose-table:shadow prose-table:rounded-xl prose-table:overflow-hidden prose-table:my-8
                                prose-th:bg-kj-primary prose-th:text-white prose-th:p-4 prose-th:text-left prose-th:font-bold
                                prose-td:border prose-td:border-kj-line dark:prose-td:border-gray-700 prose-td:p-4 prose-td:bg-white dark:prose-td:bg-kj-chip-bg
                                prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-10
                            ">
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

                            {/* Tags */}
                            <div className="mt-12 pt-8 border-t-2 border-kj-line">
                                <h3 className="text-lg font-black text-kj-text mb-4 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-teal-600" />
                                    {language === 'bn' ? 'বিষয়সমূহ' : 'Topics'}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {post.keywords.map((keyword, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-teal-50 dark:bg-kj-chip-bg text-teal-700 dark:text-teal-300 rounded-lg text-xs font-semibold border border-teal-200 dark:border-teal-900/30">
                                            #{keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <SponsoredAdSlot language={language} size="728x90" compact />
                        </div>

                        {/* Sticky Sidebar (Desktop) */}
                        <aside className="hidden lg:block lg:col-span-4 space-y-8">
                            <div className="sticky top-24">
                                {toc.length > 2 && (
                                    <div className="bg-teal-50/50 dark:bg-kj-chip-bg/50 rounded-2xl p-6 border border-teal-100 dark:border-teal-800">
                                        <h4 className="font-bold text-teal-900 dark:text-teal-100 mb-4 flex items-center gap-2">
                                            <List className="w-4 h-4 text-teal-600" />
                                            {t('blog.toc')}
                                        </h4>
                                        <ul className="space-y-3">
                                            {toc.map((item, i) => (
                                                <li key={i} className={item.level === 3 ? 'pl-4' : ''}>
                                                    <a
                                                        href={`#${item.id}`}
                                                        className="text-sm text-teal-700 dark:text-teal-400 hover:underline line-clamp-1"
                                                        onClick={e => {
                                                            e.preventDefault();
                                                            scrollContainerRef.current?.querySelector(`#${item.id}`)?.scrollIntoView({ behavior: 'smooth' });
                                                        }}
                                                    >
                                                        {item.level === 2 ? `${i + 1}. ` : '• '}{item.text}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>


                    {/* Share again (bottom) */}
                    <div className="mt-8 p-5 bg-gray-50 dark:bg-kj-chip-bg rounded-2xl border border-kj-line">
                        <p className="text-sm font-bold text-kj-text-dim mb-3">{t('blog.sharePost')}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={shareWhatsApp} className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                WhatsApp
                            </button>
                            <button onClick={shareFacebook} className="flex items-center gap-1.5 px-3 py-2 bg-kj-primary hover:brightness-110 text-white text-xs font-semibold rounded-xl transition-colors">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                Facebook
                            </button>
                            <button onClick={shareTwitter} className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                X / Twitter
                            </button>
                            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-kj-text-dim text-xs font-semibold rounded-xl transition-colors">
                                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? t('blog.copied') : t('blog.copyLink')}
                            </button>
                        </div>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="mt-12 pt-8 border-t-2 border-kj-line">
                            <h3 className="text-2xl font-black text-kj-text mb-6">
                                {language === 'bn' ? 'আরও পড়ুন' : 'You Might Also Like'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {relatedPosts.map(rp => (
                                    <div
                                        key={rp.id}
                                        onClick={() => window.location.hash = `blog/${rp.slug}`}
                                        className="group bg-kj-panel rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all border border-kj-line hover:-translate-y-1 flex flex-col"
                                    >
                                        <div className="h-32 overflow-hidden bg-kj-chip-bg">
                                            <img
                                                src={rp.coverImage}
                                                alt={language === 'bn' ? rp.bnTitle : rp.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                                            />
                                        </div>
                                        <div className="p-3 flex-1">
                                            <span className="text-xs text-kj-primary font-semibold">{rp.category}</span>
                                            <h4 className="text-sm font-bold text-kj-text mt-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                                                {language === 'bn' ? rp.bnTitle : rp.title}
                                            </h4>
                                            <p className="text-xs text-kj-text-dim mt-1">{rp.readTime}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <SponsoredAdSlot language={language} size="728x90" compact />

                    {/* CTA */}
                    <div className="mt-12 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 rounded-3xl p-8 text-center shadow-2xl">
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                            {language === 'bn' ? 'এখনই রুট খুঁজুন!' : 'Find Your Route Now!'}
                        </h3>
                        <p className="text-white/90 text-base mb-6 max-w-xl mx-auto">
                            {language === 'bn'
                                ? 'কই যাবো — বাংলাদেশের সেরা ট্রান্সপোর্ট গাইড অ্যাপ'
                                : 'KoyJabo — Bangladesh\'s best transport guide. Free, offline-capable.'}
                        </p>
                        <button
                            onClick={onGoHome}
                            className="px-8 py-3 bg-white dark:bg-kj-chip-bg text-teal-600 dark:text-teal-300 rounded-xl font-black text-base hover:bg-kj-chip-bg dark:hover:bg-slate-600 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                        >
                            {language === 'bn' ? 'হোমে যান' : 'Open KoyJabo'}
                        </button>
                    </div>
                    <div className="h-4" />
                </article>

                {/* Scroll to Top */}
                <button
                    onClick={scrollToTop}
                    className={`fixed bottom-24 right-6 p-4 bg-kj-primary text-white rounded-full shadow-2xl transition-all duration-300 z-50 hover:bg-teal-700 hover:scale-110 active:scale-95 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default BlogPostDetail;
