import React, { useEffect, useState } from 'react';

interface AdSenseAdProps {
    adSlot: string;
    adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
    className?: string;
    responsive?: boolean;
    layoutKey?: string;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({
    adSlot,
    adFormat = 'auto',
    className = '',
    responsive = true,
    layoutKey
}) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [adBlocked, setAdBlocked] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!isOnline) return;
        // Check if AdSense script was blocked by ad blocker
        const adScript = document.querySelector('script[src*="adsbygoogle.js"]');
        const adsbygoogle = (window as any).adsbygoogle;
        if (!adScript && !adsbygoogle) {
            setAdBlocked(true);
            return;
        }
        try {
            if (typeof window !== 'undefined' && (adScript || adsbygoogle)) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
        } catch {
            // Silently handle AdSense init errors (e.g., ad blocker interference)
        }
    }, [isOnline]);

    // Don't render when offline or ad blocked
    if (!isOnline || adBlocked) return null;

    return (
        <div className={`adsense-container hidden md:block ${className}`} style={{ maxHeight: '280px', overflow: 'hidden' }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center', maxHeight: '280px', overflow: 'hidden' }}
                data-ad-client="ca-pub-6933713424631305"
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={responsive ? 'true' : 'false'}
                data-ad-layout-key={layoutKey}
            />
        </div>
    );
};

export default AdSenseAd;
