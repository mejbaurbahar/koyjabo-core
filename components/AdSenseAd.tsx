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
        try {
            if (typeof window !== 'undefined') {
                const adScript = document.querySelector('script[src*="adsbygoogle.js"]');
                if (adScript || (window as any).adsbygoogle) {
                    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                }
            }
        } catch (error) {
            console.debug('AdSense initialization suppressed:', error);
        }
    }, [isOnline]);

    // Don't render ads when offline — no network = no ad content
    if (!isOnline) return null;

    return (
        <div className={`adsense-container ${className}`} style={{ maxHeight: '280px', overflow: 'hidden' }}>
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
