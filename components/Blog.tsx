import React, { useState, useMemo } from 'react';
import { Clock, Search, X, ArrowLeft } from 'lucide-react';
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
    'Travel Guide':   ['#10b981', '#006a4e'],
    'Metro Rail':     ['#3b82f6', '#1d4ed8'],
    'Bus & Transport':['#10b981', '#006a4e'],
    'Tips & Tricks':  ['#0ea5e9', '#0369a1'],
    'App Guide':      ['#8b5cf6', '#5b21b6'],
    'All':            ['#ef4444', '#b91c1c'],
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
        <div className="w-full pb-nav-safe bg-kj-bg">
            <div className="max-w-2xl mx-auto px-4 pt-safe">

                {/* Back button row */}
                <div className="flex items-center gap-2 py-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-kj-text-dim hover:text-kj-text transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-semibold">{lbl('Back', 'ফিরে যান')}</span>
                    </button>
                    <h1 className="ml-auto text-base font-bold text-kj-text">
                        {t('blog.title')}
                    </h1>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kj-text-faint" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t('blog.searchPlaceholder')}
                        className="w-full pl-9 pr-9 py-2.5 bg-kj-chip-bg border border-kj-line rounded-xl text-sm text-kj-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kj-primary/40"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="w-4 h-4 text-kj-text-faint hover:text-kj-text-dim" />
                        </button>
                    )}
                </div>

                {/* Category filter chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                selectedCategory === cat
                                    ? 'bg-kj-text text-kj-bg border-kj-text'
                                    : 'bg-kj-panel border-kj-line text-kj-text-dim hover:border-kj-text-dim'
                            }`}
                        >
                            {cat === 'All' ? t('blog.allCategories') : cat}
                        </button>
                    ))}
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

                {/* Featured post card */}
                {featuredPost && (() => {
                    const [gradColor1, gradColor2] = getCatColors(featuredPost.category);
                    return (
                        <div
                            onClick={() => onSelectPost(featuredPost.slug)}
                            className="dc-card rounded-2xl overflow-hidden cursor-pointer mb-4 border border-kj-line"
                        >
                            {/* Gradient banner with SVG */}
                            <div
                                className="relative h-40 w-full overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${gradColor1}, ${gradColor2})` }}
                            >
                                <svg viewBox="0 0 400 160" className="w-full h-full absolute inset-0">
                                    <circle cx="80" cy="120" r="40" fill="rgba(255,255,255,0.15)"/>
                                    <circle cx="320" cy="40" r="60" fill="rgba(255,255,255,0.1)"/>
                                    <g transform="translate(160, 60) scale(0.5)">
                                        <rect width="180" height="80" rx="14" fill="rgba(255,255,255,0.9)"/>
                                        <rect x="20" y="20" width="40" height="30" rx="4" fill={gradColor1}/>
                                        <rect x="120" y="20" width="40" height="30" rx="4" fill={gradColor1}/>
                                        <circle cx="40" cy="90" r="14" fill="rgba(0,0,0,0.3)"/>
                                        <circle cx="140" cy="90" r="14" fill="rgba(0,0,0,0.3)"/>
                                    </g>
                                </svg>
                                {/* Featured badge */}
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-white">
                                    ★ {lbl('Featured', 'ফিচার্ড')}
                                </span>
                            </div>

                            {/* Card content */}
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-kj-primary-soft text-kj-primary-deep dark:text-kj-primary">
                                        {featuredPost.category}
                                    </span>
                                    <span className="text-xs text-kj-text-faint flex items-center gap-1">
                                        <Clock className="w-3 h-3" />{featuredPost.readTime}
                                    </span>
                                    <span className="text-xs text-kj-text-faint ml-auto">
                                        {new Date(featuredPost.publishDate).toLocaleDateString(
                                            language === 'bn' ? 'bn-BD' : 'en-US',
                                            { year: 'numeric', month: 'short', day: 'numeric' }
                                        )}
                                    </span>
                                </div>
                                <h2 className="font-bengali font-bold text-kj-text leading-snug"
                                    style={{ fontSize: '17px' }}>
                                    {language === 'bn' ? featuredPost.bnTitle : featuredPost.title}
                                </h2>
                            </div>
                        </div>
                    );
                })()}

                {/* Ad between featured and list */}
                <SponsoredAdSlot language={language} size="728x90" compact />

                {/* List of remaining posts */}
                {regularPosts.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {regularPosts.map(post => {
                            const [gradColor1, gradColor2] = getCatColors(post.category);
                            return (
                                <div
                                    key={post.id}
                                    onClick={() => onSelectPost(post.slug)}
                                    className="dc-card rounded-xl cursor-pointer border border-kj-line p-3 flex items-center gap-3"
                                >
                                    {/* Thumbnail */}
                                    <div
                                        className="shrink-0 w-20 h-20 rounded-xl overflow-hidden"
                                        style={{ background: `linear-gradient(135deg, ${gradColor1}, ${gradColor2})` }}
                                    >
                                        <svg viewBox="0 0 80 80" className="w-full h-full">
                                            <circle cx="15" cy="60" r="18" fill="rgba(255,255,255,0.15)"/>
                                            <circle cx="65" cy="20" r="24" fill="rgba(255,255,255,0.1)"/>
                                            <g transform="translate(18, 24) scale(0.24)">
                                                <rect width="180" height="80" rx="14" fill="rgba(255,255,255,0.9)"/>
                                                <rect x="20" y="20" width="40" height="30" rx="4" fill={gradColor1}/>
                                                <rect x="120" y="20" width="40" height="30" rx="4" fill={gradColor1}/>
                                                <circle cx="40" cy="90" r="14" fill="rgba(0,0,0,0.3)"/>
                                                <circle cx="140" cy="90" r="14" fill="rgba(0,0,0,0.3)"/>
                                            </g>
                                        </svg>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span
                                                className="text-xs font-bold uppercase tracking-wide text-kj-primary"
                                            >
                                                {post.category}
                                            </span>
                                            <span className="text-xs text-kj-text-faint ml-auto">
                                                {new Date(post.publishDate).toLocaleDateString(
                                                    language === 'bn' ? 'bn-BD' : 'en-US',
                                                    { month: 'short', day: 'numeric' }
                                                )}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-kj-text text-sm leading-snug line-clamp-2">
                                            {language === 'bn' ? post.bnTitle : post.title}
                                        </h3>
                                        <span className="text-xs text-kj-text-faint flex items-center gap-1 mt-1">
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
                <div className="mt-6 mb-4 bg-kj-panel rounded-2xl p-5 text-center border border-kj-line">
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
