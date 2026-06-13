import React, { useState, useMemo } from 'react';
import { Clock, Tag, Calendar, ArrowRight, Search, X } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { useLanguage } from '../contexts/LanguageContext';
import NewsletterBanner from './NewsletterBanner';

interface BlogProps {
    onBack: () => void;
    onSelectPost: (postSlug: string) => void;
    language: 'en' | 'bn';
}

const CATEGORIES = ['All', 'Travel Guide', 'Metro Rail', 'Bus & Transport', 'App Guide', 'Tips & Tricks'];

const Blog: React.FC<BlogProps> = ({ onBack, onSelectPost, language }) => {
    const { t } = useLanguage();
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
                {/* Header */}
                <div className="sticky top-0 z-10 bg-kj-panel/90 backdrop-blur-md border-b border-kj-line pt-safe">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-kj-text">
                                {t('blog.title')}
                            </h1>
                            <p className="text-sm text-kj-text-dim">
                                {t('blog.subtitle')}
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kj-text-faint" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={t('blog.searchPlaceholder')}
                                className="w-full pl-9 pr-9 py-2.5 bg-kj-chip-bg border border-kj-line rounded-xl text-sm text-kj-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X className="w-4 h-4 text-kj-text-faint hover:text-kj-text-dim" />
                                </button>
                            )}
                        </div>

                        {/* Category Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                        selectedCategory === cat
                                            ? 'bg-kj-primary text-white shadow-sm'
                                            : 'bg-kj-chip-bg text-kj-text-dim hover:bg-teal-50 dark:hover:bg-teal-900/20'
                                    }`}
                                >
                                    {cat === 'All' ? t('blog.allCategories') : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
                    {/* Top leaderboard — high visibility, above the fold */}
                    {/* <AdSenseAd adSlot="auto" adFormat="horizontal" className="w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" /> */}

                    {/* No results */}
                    {filteredPosts.length === 0 && (
                        <div className="text-center py-16">
                            <Search className="w-12 h-12 text-kj-text-faint mx-auto mb-3" />
                            <p className="text-kj-text-dim font-medium">{t('blog.noResults')}</p>
                            <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                className="mt-3 text-sm text-kj-primary underline">
                                {t('blog.clearFilters')}
                            </button>
                        </div>
                    )}

                    {/* Featured Post */}
                    {featuredPost && (
                        <div>
                            <h2 className="text-lg font-bold text-kj-primary mb-4 flex items-center gap-2">
                                <span className="bg-teal-100 dark:bg-teal-900/30 px-3 py-1 rounded-full text-sm">
                                    {searchQuery || selectedCategory !== 'All' ? `${filteredPosts.length} ${t('blog.results')}` : t('blog.featured')}
                                </span>
                            </h2>
                            <div
                                onClick={() => onSelectPost(featuredPost.slug)}
                                className="group bg-kj-panel rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-kj-line"
                            >
                                <div className="relative overflow-hidden bg-kj-chip-bg h-56 sm:h-72">
                                    <img
                                        src={featuredPost.coverImage}
                                        alt={language === 'bn' ? featuredPost.bnTitle : featuredPost.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 bg-kj-primary text-white rounded-full text-xs font-semibold shadow">
                                        <Tag className="w-3 h-3" />{featuredPost.category}
                                    </span>
                                </div>
                                <div className="p-5 sm:p-7">
                                    <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-kj-text-dim">
                                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{featuredPost.readTime}</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(featuredPost.publishDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-kj-text mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                        {language === 'bn' ? featuredPost.bnTitle : featuredPost.title}
                                    </h3>
                                    <p className="text-kj-text-dim mb-5 leading-relaxed text-sm sm:text-base line-clamp-3">
                                        {language === 'bn' ? featuredPost.bnExcerpt : featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-kj-text-dim">{t('blog.by')}: {featuredPost.author}</span>
                                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-kj-primary hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-all group-hover:gap-3">
                                            {t('blog.readMore')}<ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Regular Posts Grid — injected in-feed ad after every 6 posts */}
                    {regularPosts.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-kj-text mb-5">
                                {searchQuery || selectedCategory !== 'All' ? '' : t('blog.allPosts')}
                            </h2>
                            {Array.from({ length: Math.ceil(regularPosts.length / 6) }, (_, chunkIdx) => {
                                const chunk = regularPosts.slice(chunkIdx * 6, (chunkIdx + 1) * 6);
                                return (
                                    <React.Fragment key={chunkIdx}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                            {chunk.map((post) => (
                                                <div
                                                    key={post.id}
                                                    onClick={() => onSelectPost(post.slug)}
                                                    className="group bg-kj-panel rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-kj-line hover:-translate-y-1 flex flex-col"
                                                >
                                                    <div className="relative h-44 overflow-hidden bg-kj-chip-bg">
                                                        <img
                                                            src={post.coverImage}
                                                            alt={language === 'bn' ? post.bnTitle : post.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 bg-kj-panel/90 backdrop-blur-sm text-kj-primary rounded-lg text-xs font-semibold">
                                                            <Tag className="w-3 h-3" />{post.category}
                                                        </span>
                                                    </div>
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <div className="flex items-center gap-2 mb-2 text-xs text-kj-text-dim">
                                                            <Clock className="w-3 h-3" />{post.readTime}
                                                            <span className="ml-auto">{new Date(post.publishDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                        <h3 className="text-base font-bold text-kj-text mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                                                            {language === 'bn' ? post.bnTitle : post.title}
                                                        </h3>
                                                        <p className="text-sm text-kj-text-dim line-clamp-2 flex-1">
                                                            {language === 'bn' ? post.bnExcerpt : post.excerpt}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-kj-line text-xs text-kj-text-dim">
                                                            <span>{post.author}</span>
                                                            <span className="text-kj-primary font-semibold">{t('blog.readMore')} →</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}

                    {/* Newsletter */}
                    <NewsletterBanner className="mt-8" />

                    {/* SEO Footer */}
                    <div className="mt-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 text-center border border-teal-100 dark:border-teal-800">
                        <p className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-1">koyjabo.com</p>
                        <p className="text-xs text-kj-text-dim">
                            {language === 'bn'
                                ? 'বাংলাদেশের সেরা পাবলিক ট্রান্সপোর্ট গাইড — ঢাকার বাস, মেট্রোরেল, ট্রেন এবং আন্তঃনগর ভ্রমণ'
                                : "Bangladesh's best public transport guide — Dhaka buses, metro rail, trains & intercity travel"}
                        </p>
                    </div>
                    
                    {/* <AdSenseAd adSlot="auto" className="mt-8 w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" /> */}
                    <div className="h-4" />
                </div>
        </div>
    );
};

export default Blog;
