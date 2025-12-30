import React, { useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Tag, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { BLOG_POSTS, BlogPost as BlogPostType } from '../data/blogPosts';
import ReactMarkdown from 'react-markdown';

interface BlogPostProps {
    postSlug: string;
    onBack: () => void;
    language: 'en' | 'bn';
}

const BlogPostDetail: React.FC<BlogPostProps> = ({ postSlug, onBack, language }) => {
    const post = BLOG_POSTS.find(p => p.slug === postSlug);

    // Set document title and meta tags for SEO
    useEffect(() => {
        if (post) {
            // Update page title
            document.title = `${language === 'bn' ? post.bnTitle : post.title} | কই যাবো Blog`;

            // Update meta description
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', post.excerpt);
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
                "description": post.excerpt,
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
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {language === 'bn' ? 'ব্লগে ফিরে যান' : 'Back to Blog'}
                    </button>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
                {/* Post Header */}
                <header className="mb-8">
                    {/* Category & Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
                            <Tag className="w-4 h-4" />
                            {post.category}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.publishDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                        {language === 'bn' ? post.bnTitle : post.title}
                    </h1>

                    {/* Author & Share */}
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold">
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{post.author}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {language === 'bn' ? 'লেখক' : 'Author'}
                                </p>
                            </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    const url = window.location.href;
                                    const text = language === 'bn' ? post.bnTitle : post.title;
                                    if (navigator.share) {
                                        navigator.share({ title: text, url });
                                    }
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                aria-label="Share"
                            >
                                <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* AdSense - Top of Post */}
                <div className="adsense-container my-8">
                    <ins
                        className="adsbygoogle"
                        style={{ display: 'block', textAlign: 'center' }}
                        data-ad-client="ca-pub-5648495168981727"
                        data-ad-slot="auto"
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                    ></ins>
                </div>

                {/* Post Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-2
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
          prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-bold
          prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
          prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
          prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:my-2
          prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
          prose-code:bg-gray-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-table:border-collapse prose-table:w-full
          prose-th:bg-gray-50 dark:prose-th:bg-slate-800 prose-th:p-3 prose-th:text-left prose-th:font-bold
          prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700 prose-td:p-3
        ">
                    <ReactMarkdown>{language === 'bn' ? post.bnContent : post.content}</ReactMarkdown>
                </div>

                {/* AdSense - Middle of Post */}
                <div className="adsense-container my-12">
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
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {language === 'bn' ? '🏷️ বিষয়সমূহ' : '🏷️ Topics'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {post.keywords.map((keyword, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Related Posts */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        {language === 'bn' ? '📚 আরও পড়ুন' : '📚 Read More'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {BLOG_POSTS.filter(p => p.id !== post.id && p.category === post.category)
                            .slice(0, 2)
                            .map(relatedPost => (
                                <div
                                    key={relatedPost.id}
                                    onClick={() => window.location.hash = `blog/${relatedPost.slug}`}
                                    className="group bg-gray-50 dark:bg-slate-800 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-1"
                                >
                                    <span className="inline-block px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded text-xs font-medium mb-3">
                                        {relatedPost.category}
                                    </span>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                        {language === 'bn' ? relatedPost.bnTitle : relatedPost.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {relatedPost.excerpt}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>

                {/* AdSense - Bottom of Post */}
                <div className="adsense-container my-12">
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
                <div className="mt-12 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 text-center border border-teal-100 dark:border-teal-800">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        {language === 'bn' ? '🚌 এখনই রুট খুঁজুন!' : '🚌 Find Your Route Now!'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        {language === 'bn'
                            ? 'কই যাবো অ্যাপ দিয়ে ঢাকার যেকোনো জায়গায় সহজে যান'
                            : 'Navigate Dhaka easily with the কই যাবো app'}
                    </p>
                    <button
                        onClick={onBack}
                        className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
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
