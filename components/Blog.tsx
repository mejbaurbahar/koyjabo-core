import React, { useState, useMemo } from 'react';
import { Clock, ArrowLeft, Search, X } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { useLanguage } from '../contexts/LanguageContext';
import SponsoredAdSlot from './SponsoredAdSlot';

interface BlogProps {
    onBack: () => void;
    onSelectPost: (postSlug: string) => void;
    language: 'en' | 'bn';
}

const CATEGORIES = ['All', 'Travel Guide', 'Metro Rail', 'Bus & Transport', 'App Guide', 'Tips & Tricks'];

const CAT_COLORS: Record<string, [string, string]> = {
    'Travel Guide':    ['#10b981', '#006a4e'],
    'Metro Rail':      ['#3b82f6', '#1d4ed8'],
    'Bus & Transport': ['#10b981', '#006a4e'],
    'Tips & Tricks':   ['#0ea5e9', '#0369a1'],
    'App Guide':       ['#8b5cf6', '#5b21b6'],
    'All':             ['#ef4444', '#b91c1c'],
};

const CAT_LABEL: Record<string, [string, string]> = {
    'All':             ['All', 'সব'],
    'Travel Guide':    ['Guides', 'গাইড'],
    'Metro Rail':      ['Metro', 'মেট্রো'],
    'Bus & Transport': ['Tips', 'টিপস'],
    'App Guide':       ['Reviews', 'রিভিউ'],
    'Tips & Tricks':   ['News', 'খবর'],
};

function getCatColors(cat: string): [string, string] {
    return CAT_COLORS[cat] ?? CAT_COLORS['All'];
}

const Blog: React.FC<BlogProps> = ({ onBack, onSelectPost, language }) => {
    const { t } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredPosts = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return BLOG_POSTS.filter(post => {
            const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
            if (!q) return matchesCategory;
            const titleMatch = post.title.toLowerCase().includes(q) ||
                post.bnTitle.toLowerCase().includes(q) ||
                post.excerpt.toLowerCase().includes(q) ||
                post.keywords.some(k => k.toLowerCase().includes(q));
            return matchesCategory && titleMatch;
        });
    }, [searchQuery, selectedCategory]);

    const featuredPost = filteredPosts[0];
    const regularPosts = filteredPosts.slice(1);

    return (
        <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">

            {/* Sticky back bar */}
            <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="font-bengali font-bold text-base text-kj-text">
                    {lbl('KoyJabo Blog', 'কই যাবো ব্লগ')}
                </span>
            </div>

            <div className="px-4 sm:px-6 md:px-10 py-5 space-y-4 w-full max-w-3xl mx-auto">

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kj-text-faint" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t('blog.searchPlaceholder')}
                        className="w-full pl-9 pr-9 py-2.5 bg-kj-input-bg border border-kj-line rounded-xl text-sm text-kj-text placeholder-kj-text-faint focus:outline-none focus:border-kj-primary/50 transition-colors"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="w-4 h-4 text-kj-text-faint hover:text-kj-text-dim" />
                        </button>
                    )}
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {CATEGORIES.map(cat => {
                        const [en, bn] = CAT_LABEL[cat] ?? [cat, cat];
                        const isActive = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 font-bengali"
                                style={isActive ? {
                                    background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
                                    color: 'var(--kj-primary-ink)',
                                    borderColor: 'var(--kj-primary)',
                                } : {
                                    background: 'var(--kj-panel)',
                                    color: 'var(--kj-text-dim)',
                                    borderColor: 'var(--kj-line)',
                                }}
                            >
                                {lbl(en, bn)}
                            </button>
                        );
                    })}
                </div>

                {/* No results */}
                {filteredPosts.length === 0 && (
                    <div className="text-center py-16">
                        <Search className="w-12 h-12 text-kj-text-faint mx-auto mb-3" />
                        <p className="text-kj-text-dim font-medium">{t('blog.noResults')}</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            className="mt-3 text-sm text-kj-primary underline"
                        >
                            {t('blog.clearFilters')}
                        </button>
                    </div>
                )}

                {/* Featured post */}
                {featuredPost && (() => {
                    const [c1, c2] = getCatColors(featuredPost.category);
                    return (
                        <div
                            onClick={() => onSelectPost(featuredPost.slug)}
                            className="dc-card rounded-2xl overflow-hidden cursor-pointer border border-kj-line active:scale-[0.99] transition-all"
                        >
                            {/* Hero gradient */}
                            <div
                                className="relative h-40 w-full overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                            >
                                <svg viewBox="0 0 400 160" className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid slice">
                                    <circle cx="60" cy="130" r="50" fill="rgba(255,255,255,0.12)" />
                                    <circle cx="340" cy="30" r="70" fill="rgba(255,255,255,0.08)" />
                                    <circle cx="200" cy="80" r="30" fill="rgba(255,255,255,0.07)" />
                                </svg>
                                <span
                                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold"
                                    style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
                                >
                                    ★ {lbl('Featured', 'ফিচার্ড')}
                                </span>
                            </div>

                            {/* Card content */}
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span
                                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                                        style={{ background: `${c1}22`, color: c1 }}
                                    >
                                        {featuredPost.category}
                                    </span>
                                    <span className="text-[11px] text-kj-text-faint flex items-center gap-1">
                                        <Clock className="w-3 h-3" />{featuredPost.readTime}
                                    </span>
                                    <span className="text-[11px] text-kj-text-faint ml-auto">
                                        {new Date(featuredPost.publishDate).toLocaleDateString(
                                            language === 'bn' ? 'bn-BD' : 'en-US',
                                            { year: 'numeric', month: 'short', day: 'numeric' }
                                        )}
                                    </span>
                                </div>
                                <h2
                                    className="font-bengali font-bold text-kj-text leading-snug"
                                    style={{ fontSize: '17px' }}
                                >
                                    {language === 'bn' ? featuredPost.bnTitle : featuredPost.title}
                                </h2>
                            </div>
                        </div>
                    );
                })()}

                {/* Ad */}
                <SponsoredAdSlot language={language} size="300x250" compact />

                {/* Post list */}
                {regularPosts.length > 0 && (
                    <div className="space-y-3">
                        {regularPosts.map(post => {
                            const [c1, c2] = getCatColors(post.category);
                            return (
                                <div
                                    key={post.id}
                                    onClick={() => onSelectPost(post.slug)}
                                    className="dc-card rounded-xl cursor-pointer border border-kj-line p-3 flex items-center gap-3 active:scale-[0.99] transition-all hover:border-kj-primary/40"
                                >
                                    {/* Thumbnail */}
                                    <div
                                        className="shrink-0 w-20 h-20 rounded-xl overflow-hidden relative"
                                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                                    >
                                        <svg viewBox="0 0 80 80" className="w-full h-full absolute inset-0">
                                            <circle cx="15" cy="65" r="22" fill="rgba(255,255,255,0.12)" />
                                            <circle cx="65" cy="15" r="28" fill="rgba(255,255,255,0.08)" />
                                        </svg>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-wide"
                                                style={{ color: c1 }}
                                            >
                                                {post.category}
                                            </span>
                                            <span className="text-[10px] text-kj-text-faint ml-auto">
                                                {new Date(post.publishDate).toLocaleDateString(
                                                    language === 'bn' ? 'bn-BD' : 'en-US',
                                                    { month: 'short', day: 'numeric' }
                                                )}
                                            </span>
                                        </div>
                                        <h3 className="font-bengali font-bold text-kj-text text-sm leading-snug line-clamp-2">
                                            {language === 'bn' ? post.bnTitle : post.title}
                                        </h3>
                                        <span className="text-[10px] text-kj-text-faint flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" />{post.readTime}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <SponsoredAdSlot language={language} size="728x90" compact />

                {/* SEO Footer */}
                <div className="bg-kj-panel rounded-2xl p-5 text-center border border-kj-line">
                    <p className="text-sm font-semibold text-kj-primary mb-1">koyjabo.com</p>
                    <p className="text-xs text-kj-text-dim">
                        {lbl(
                            "Bangladesh's best public transport guide — Dhaka buses, metro rail, trains & intercity travel",
                            'বাংলাদেশের সেরা পাবলিক ট্রান্সপোর্ট গাইড — ঢাকার বাস, মেট্রোরেল, ট্রেন এবং আন্তঃনগর ভ্রমণ'
                        )}
                    </p>
                </div>

                <div className="h-4" />
            </div>
        </div>
    );
};

export default Blog;
