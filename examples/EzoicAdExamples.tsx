/**
 * ============================================================
 * EZOIC AD PLACEMENT EXAMPLES
 * ============================================================
 * 
 * This file contains real-world examples of how to use
 * Ezoic ads in your React application.
 */

import React, { useState, useEffect } from 'react';
import { EzoicAd, EzoicMultiAd } from '../components/EzoicAd';
import { useEzoic, useEzoicPageChange } from '../hooks/useEzoic';

// ============================================================
// Example 1: Basic Homepage with Multiple Ads
// ============================================================
export function Homepage() {
    return (
        <div className="homepage">
            {/* Top Banner Ad */}
            <EzoicAd placementId={101} className="mb-6" />

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Left Content */}
                <main className="flex-1">
                    <h1>Welcome to KoyJabo</h1>
                    <p>Find bus routes easily...</p>

                    {/* Mid-content Ad */}
                    <EzoicAd placementId={103} className="my-8" />

                    {/* More Content */}
                    <div className="content">...</div>
                </main>

                {/* Sidebar Ad (Desktop) */}
                <aside className="w-80 hidden lg:block">
                    <EzoicAd placementId={102} />
                </aside>
            </div>

            {/* Footer Ad */}
            <EzoicAd placementId={104} className="mt-12" />
        </div>
    );
}

// ============================================================
// Example 2: Blog Article with In-Content Ads
// ============================================================
export function BlogArticle({ article }) {
    return (
        <article className="max-w-4xl mx-auto">
            {/* Top of Article Ad */}
            <EzoicAd placementId={201} className="mb-8" />

            <h1>{article.title}</h1>

            {/* First few paragraphs */}
            <div dangerouslySetInnerHTML={{ __html: article.intro }} />

            {/* Mid-article Ad */}
            <EzoicAd placementId={202} className="my-8" />

            {/* Rest of content */}
            <div dangerouslySetInnerHTML={{ __html: article.body }} />

            {/* End of Article Ad */}
            <EzoicAd placementId={203} className="mt-8" />

            {/* Related Articles */}
            <div className="related-articles mt-12">
                <h3>Related Articles</h3>
                {/* ... */}
            </div>
        </article>
    );
}

// ============================================================
// Example 3: Search Results with Ads Between Results
// ============================================================
export function SearchResults({ results }) {
    return (
        <div className="search-results">
            {/* Top Ad */}
            <EzoicAd placementId={301} className="mb-6" />

            {results.map((result, index) => (
                <React.Fragment key={result.id}>
                    {/* Search Result */}
                    <div className="result-card">
                        <h3>{result.title}</h3>
                        <p>{result.description}</p>
                    </div>

                    {/* Ad every 3 results */}
                    {(index + 1) % 3 === 0 && (
                        <EzoicAd
                            placementId={302}
                            className="my-6"
                        />
                    )}
                </React.Fragment>
            ))}

            {/* Bottom Ad */}
            <EzoicAd placementId={303} className="mt-8" />
        </div>
    );
}

// ============================================================
// Example 4: Dynamic Content with Tabs
// ============================================================
export function TabbedContent() {
    const [activeTab, setActiveTab] = useState('buses');
    const { showAd, destroyAd } = useEzoic();

    useEffect(() => {
        // Destroy old ads when tab changes
        destroyAd(401, 402, 403);

        // Show new ads for the active tab
        if (activeTab === 'buses') {
            showAd(401);
        } else if (activeTab === 'trains') {
            showAd(402);
        } else if (activeTab === 'flights') {
            showAd(403);
        }
    }, [activeTab, showAd, destroyAd]);

    return (
        <div>
            {/* Tabs */}
            <div className="tabs">
                <button onClick={() => setActiveTab('buses')}>Buses</button>
                <button onClick={() => setActiveTab('trains')}>Trains</button>
                <button onClick={() => setActiveTab('flights')}>Flights</button>
            </div>

            {/* Content */}
            {activeTab === 'buses' && (
                <div>
                    <BusContent />
                    <EzoicAd placementId={401} />
                </div>
            )}
            {activeTab === 'trains' && (
                <div>
                    <TrainContent />
                    <EzoicAd placementId={402} />
                </div>
            )}
            {activeTab === 'flights' && (
                <div>
                    <FlightContent />
                    <EzoicAd placementId={403} />
                </div>
            )}
        </div>
    );
}

// ============================================================
// Example 5: Infinite Scroll with Unique Ads
// ============================================================
export function InfiniteScrollFeed() {
    const [articles, setArticles] = useState([]);
    const { showAd } = useEzoic();

    const loadMoreArticles = async () => {
        const newArticles = await fetchArticles();
        const currentCount = articles.length;

        setArticles([...articles, ...newArticles]);

        // Show ads for newly loaded articles
        // Each article gets 2 ads: one before and one after
        // Article 1: 501, 502
        // Article 2: 503, 504
        // Article 3: 505, 506
        const baseId = 501 + (currentCount * 2);
        newArticles.forEach((_, index) => {
            const adId = baseId + (index * 2);
            showAd(adId, adId + 1);
        });
    };

    return (
        <div className="feed">
            {articles.map((article, index) => {
                const adId = 501 + (index * 2);
                return (
                    <div key={article.id}>
                        {/* Ad before article */}
                        <EzoicAd placementId={adId} className="my-4" />

                        {/* Article Content */}
                        <ArticleCard article={article} />

                        {/* Ad after article */}
                        <EzoicAd placementId={adId + 1} className="my-4" />
                    </div>
                );
            })}

            <button onClick={loadMoreArticles} className="load-more">
                Load More
            </button>
        </div>
    );
}

// ============================================================
// Example 6: Modal/Popup with Ads
// ============================================================
export function ModalWithAd({ isOpen, onClose, content }) {
    const { showAd, destroyAd } = useEzoic();

    useEffect(() => {
        if (isOpen) {
            // Show ad when modal opens
            setTimeout(() => showAd(601), 300); // Small delay for animation
        } else {
            // Clean up ad when modal closes
            destroyAd(601);
        }
    }, [isOpen, showAd, destroyAd]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                {/* Modal Content */}
                <div className="modal-body">
                    <h2>{content.title}</h2>
                    <p>{content.description}</p>

                    {/* Ad in modal */}
                    <EzoicAd placementId={601} className="my-6" />

                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Example 7: Responsive Ads (Mobile vs Desktop)
// ============================================================
export function ResponsivePage() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="page">
            {/* Different ads for mobile and desktop */}
            <EzoicAd
                placementId={isMobile ? 701 : 702}
                className="header-ad"
            />

            <div className="content">
                {/* Content here */}
            </div>

            {/* Sidebar ad only on desktop */}
            {!isMobile && (
                <aside className="sidebar">
                    <EzoicAd placementId={703} />
                </aside>
            )}

            {/* Footer ad on both */}
            <EzoicAd
                placementId={isMobile ? 704 : 705}
                className="footer-ad"
            />
        </div>
    );
}

// ============================================================
// Example 8: SPA with React Router
// ============================================================
import { useLocation } from 'react-router-dom';

export function AppWithRouting() {
    const location = useLocation();

    // Auto-refresh ads when route changes
    useEzoicPageChange(location.pathname);

    return (
        <div className="app">
            {/* Your routes */}
        </div>
    );
}

// ============================================================
// Example 9: Efficient Multi-Ad Loading
// ============================================================
export function MultiAdPage() {
    return (
        <div className="page">
            {/* Load multiple ads in a single call (more efficient) */}
            <EzoicMultiAd
                placementIds={[801, 802, 803, 804]}
                orientation="vertical"
                className="ad-container"
            />

            <div className="content">
                {/* Your content */}
            </div>
        </div>
    );
}

// ============================================================
// Example 10: Conditional Ad Loading
// ============================================================
export function ConditionalAds({ user }) {
    // Don't show ads to premium users
    if (user?.isPremium) {
        return <div>Your content without ads</div>;
    }

    return (
        <div>
            <EzoicAd placementId={901} />
            <div>Your content</div>
            <EzoicAd placementId={902} />
        </div>
    );
}

// Helper components (stubs)
const BusContent = () => <div>Bus content...</div>;
const TrainContent = () => <div>Train content...</div>;
const FlightContent = () => <div>Flight content...</div>;
const ArticleCard = ({ article }) => <div>{article.title}</div>;
const fetchArticles = async () => [];

export default {
    Homepage,
    BlogArticle,
    SearchResults,
    TabbedContent,
    InfiniteScrollFeed,
    ModalWithAd,
    ResponsivePage,
    AppWithRouting,
    MultiAdPage,
    ConditionalAds
};
