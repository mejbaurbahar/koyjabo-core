import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Calendar, Tag, Share2, Check, Copy } from 'lucide-react';
import { BLOG_POSTS, BlogPost as BlogPostType } from '../data/blogPosts';
import ReactMarkdown from 'react-markdown';

interface BlogPostProps {
    postSlug: string;
    onBack: () => void;
    language: 'en' | 'bn';
}

const BlogPostDetail: React.FC<BlogPostProps> = ({ postSlug, onBack, language }) => {
    const post = BLOG_POSTS.find(p => p.slug === postSlug);
    const [copied, setCopied] = useState(false);

    // Set document title and meta tags for SEO
    useEffect(() => {
        if (post) {
            // Update page title
            document.title = `${language === 'bn' ? post.bnTitle : post.title} | কই যাবো Blog`;

            // Update meta description
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', language === 'bn' ? post.bnExcerpt : post.excerpt);
            }

            // Update meta keywords
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                metaKeywords.setAttribute('content', post.keywords.join(', '));
            }

            // Add JSON-LD structured data for SEO
            const scriptTag = document.createElement('script');
            scriptTag.type = 'application/ld+json';
            scriptTag.text = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": language === 'bn' ? post.bnTitle : post.title,
                "description": language === 'bn' ? post.bnExcerpt : post.excerpt,
                "image": post.coverImage,
                "author": {
                    "@type": "Organization",
                    "name": post.author
                },
                "datePublished": post.publishDate,
                "keywords": post.keywords.join(', '),
                "articleSection": post.category,
                "inLanguage": language === 'bn' ? 'bn-BD' : 'en-US'
            });
            document.head.appendChild(scriptTag);

            return () => {
                document.head.removeChild(scriptTag);
                document.title = 'কই যাবো - Dhaka Bus & Transport Guide';
            };
        }
    }, [post, language]);

    // Copy blog URL to clipboard
    const handleShare = async () => {
        // Create full URL with blog post path
        const baseUrl = window.location.origin; // e.g., https://koyjabo.com
        const blogPath = `/blog/${postSlug}`; // e.g., /blog/best-bus-routes-dhaka
        const fullUrl = `${baseUrl}${blogPath}`;

        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = fullUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {language === 'bn' ? 'পোস্ট পাওয়া যায়নি' : 'Post Not Found'}
                </h2>
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                >
                    {language === 'bn' ? 'ব্লগে ফিরে যান' : 'Back to Blog'}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-y-auto">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>{language === 'bn' ? 'ব্লগে ফিরে যান' : 'Back to Blog'}</span>
                    </button>
                </div>
            </div>

            {/* Hero Image */}
            <div className="w-full bg-gradient-to-br from-teal-500 to-cyan-600">
                <div className="max-w-5xl mx-auto">
                    <img
                        src={post.coverImage}
                        alt={language === 'bn' ? post.bnTitle : post.title}
                        className="w-full h-64 sm:h-80 md:h-96 object-cover"
                        onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                </div>
            </div>

            <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full">
                {/* Post Header */}
                <header className="mb-8">
                    {/* Category & Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-semibold shadow-lg">
                            <Tag className="w-4 h-4" />
                            {post.category}
                        </span>
                        <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </span>
                        <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-medium">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.publishDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-gray-100 mb-6 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text">
                        {language === 'bn' ? post.bnTitle : post.title}
                    </h1>

                    {/* Excerpt */}
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-medium">
                        {language === 'bn' ? post.bnExcerpt : post.excerpt}
                    </p>

                    {/* Author & Share */}
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{post.author}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {language === 'bn' ? 'লেখক' : 'Author'}
                                </p>
                            </div>
                        </div>

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            aria-label={language === 'bn' ? 'শেয়ার করুন' : 'Share'}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    <span>{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    <span>{language === 'bn' ? 'লিংক কপি করুন' : 'Copy Link'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* AdSense - Top of Post */}
                <div className="adsense-container my-10">
                    <ins
                        className="adsbygoogle"
                        style={{ display: 'block', textAlign: 'center' }}
                        data-ad-client="ca-pub-5648495168981727"
                        data-ad-slot="auto"
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                    ></ins>
                </div>

                {/* Post Content with Better Formatting */}
                <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none
          prose-headings:font-black prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:scroll-mt-20
          prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b-4 prose-h2:border-teal-500
          prose-h3:text-2xl md:prose-h3:text-3xl prose-h3:mt-12 prose-h3:mb-4 prose-h3:text-teal-700 dark:prose-h3:text-teal-400
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base md:prose-p:text-lg
          prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-teal-700
          prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-bold
          prose-ul:my-8 prose-ul:list-disc prose-ul:pl-8 prose-ul:space-y-3
          prose-ol:my-8 prose-ol:list-decimal prose-ol:pl-8 prose-ol:space-y-3
          prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:text-base md:prose-li:text-lg prose-li:leading-relaxed
          prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400 prose-blockquote:bg-teal-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
          prose-code:bg-teal-100 dark:prose-code:bg-slate-800 prose-code:text-teal-800 dark:prose-code:text-teal-300 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
          prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:rounded-xl prose-pre:shadow-xl
          prose-table:border-collapse prose-table:w-full prose-table:shadow-md prose-table:rounded-lg prose-table:overflow-hidden
          prose-th:bg-teal-600 prose-th:text-white prose-th:p-4 prose-th:text-left prose-th:font-bold prose-th:text-base
          prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700 prose-td:p-4 prose-td:bg-white dark:prose-td:bg-slate-800
          prose-img:rounded-xl prose-img:shadow-2xl prose-img:my-8
        ">
                    <ReactMarkdown>{language === 'bn' ? post.bnContent : post.content}</ReactMarkdown>
                </div>

                {/* AdSense - Middle of Post */}
                <div className="adsense-container my-16">
                    <ins
                        className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-format="fluid"
                        data-ad-layout-key="-6t+ed+2i-1n-4w"
                        data-ad-client="ca-pub-5648495168981727"
                        data-ad-slot="auto"
                    ></ins>
                </div>

                {/* Keywords/Tags Section */}
                <div className="mt-16 pt-10 border-t-2 border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Tag className="w-6 h-6 text-teal-600" />
                        {language === 'bn' ? 'বিষয়সমূহ' : 'Topics'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {post.keywords.map((keyword, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 text-teal-700 dark:text-teal-300 rounded-lg text-sm font-semibold hover:from-teal-100 hover:to-cyan-100 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all cursor-pointer border border-teal-200 dark:border-teal-900/30 shadow-sm hover:shadow-md"
                            >
                                #{keyword}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Related Posts */}
                <div className="mt-16 pt-10 border-t-2 border-gray-200 dark:border-gray-700">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-8">
                        {language === 'bn' ? '📚 আরও পড়ুন' : '📚 Read More'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {BLOG_POSTS.filter(p => p.id !== post.id && p.category === post.category)
                            .slice(0, 2)
                            .map(relatedPost => (
                                <div
                                    key={relatedPost.id}
                                    onClick={() => window.location.hash = `blog/${relatedPost.slug}`}
                                    className="group bg-white dark:bg-slate-800 rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-2 overflow-hidden"
                                >
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={relatedPost.coverImage}
                                            alt={language === 'bn' ? relatedPost.bnTitle : relatedPost.title}
                                            className="w-24 h-24 object-cover rounded-xl shadow-md"
                                        />
                                        <div className="flex-1">
                                            <span className="inline-block px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-semibold mb-3">
                                                {relatedPost.category}
                                            </span>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                                                {language === 'bn' ? relatedPost.bnTitle : relatedPost.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {language === 'bn' ? relatedPost.bnExcerpt : relatedPost.excerpt}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* AdSense - Bottom of Post */}
                <div className="adsense-container my-16">
                    <ins
                        className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-5648495168981727"
                        data-ad-slot="auto"
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                    ></ins>
                </div>

                {/* CTA */}
                <div className="mt-16 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
                    <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                        {language === 'bn' ? '🚌 এখনই রুট খুঁজুন!' : '🚌 Find Your Route Now!'}
                    </h3>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'কই যাবো অ্যাপ দিয়ে ঢাকার যেকোনো জায়গায় সহজে যান'
                            : 'Navigate Dhaka easily with the কই যাবো app'}
                    </p>
                    <button
                        onClick={onBack}
                        className="px-10 py-4 bg-white text-teal-600 rounded-xl font-black text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                        {language === 'bn' ? 'হোমে ফিরে যান' : 'Go to Home'}
                    </button>
                </div>

                {/* Bottom Spacing for Mobile */}
                <div className="h-20"></div>
            </article>

            {/* Initialize AdSense ads */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            if (typeof window !== 'undefined' && window.adsbygoogle) {
              (adsbygoogle = window.adsbygoogle || []).push({});
              (adsbygoogle = window.adsbygoogle || []).push({});
              (adsbygoogle = window.adsbygoogle || []).push({});
            }
          `
                }}
            />
        </div>
    );
};

export default BlogPostDetail;
