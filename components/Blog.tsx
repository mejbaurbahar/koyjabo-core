import React from 'react';
import { ArrowLeft, Clock, Tag, Calendar, ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';

interface BlogProps {
    onBack: () => void;
    onSelectPost: (postSlug: string) => void;
    language: 'en' | 'bn';
}

const Blog: React.FC<BlogProps> = ({ onBack, onSelectPost, language }) => {
    // Get featured post (first one)
    const featuredPost = BLOG_POSTS[0];
    const regularPosts = BLOG_POSTS.slice(1);

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {language === 'bn' ? '📝 ব্লগ' : '📝 Blog'}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {language === 'bn'
                                    ? 'ঢাকা এবং বাংলাদেশের যাতায়াত সম্পর্কে গাইড এবং টিপস'
                                    : 'Guides and tips about Dhaka and Bangladesh transport'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Featured Post */}
                {featuredPost && (
                    <div className="mb-12">
                        <h2 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-4 flex items-center gap-2">
                            <span className="bg-teal-100 dark:bg-teal-900/30 px-3 py-1 rounded-full text-sm">
                                {language === 'bn' ? '⭐ ফিচার্ড' : '⭐ Featured'}
                            </span>
                        </h2>
                        <div
                            onClick={() => onSelectPost(featuredPost.slug)}
                            className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
                        >
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
                                        <Tag className="w-3 h-3" />
                                        {featuredPost.category}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
                                        <Clock className="w-3 h-3" />
                                        {featuredPost.readTime}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(featuredPost.publishDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                    {language === 'bn' ? featuredPost.bnTitle : featuredPost.title}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                    {featuredPost.excerpt}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {language === 'bn' ? 'লেখক' : 'By'}: {featuredPost.author}
                                    </span>
                                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-all group-hover:gap-3">
                                        {language === 'bn' ? 'পড়ুন' : 'Read More'}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Regular Posts Grid */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        {language === 'bn' ? '📚 সকল পোস্ট' : '📚 All Posts'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularPosts.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => onSelectPost(post.slug)}
                                className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-medium">
                                            <Tag className="w-3 h-3" />
                                            {post.category}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                                            <Clock className="w-3 h-3" />
                                            {post.readTime}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                                        {language === 'bn' ? post.bnTitle : post.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{post.author}</span>
                                        <span>{new Date(post.publishDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coming Soon Section */}
                <div className="mt-12 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 text-center border border-teal-100 dark:border-teal-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {language === 'bn' ? '🚀 আরও আসছে শীঘ্রই!' : '🚀 More Coming Soon!'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        {language === 'bn'
                            ? 'আমরা নিয়মিত নতুন গাইড এবং টিপস যুক্ত করছি। পরবর্তী আপডেটের জন্য থাকুন!'
                            : 'We\'re regularly adding new guides and tips. Stay tuned for the next update!'}
                    </p>
                </div>

                {/* Bottom Spacing */}
                <div className="h-20"></div>
            </div>
        </div>
    );
};

export default Blog;
