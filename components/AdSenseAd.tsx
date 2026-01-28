import React, { useEffect } from 'react';

interface AdSenseAdProps {
    /**
     * Ad slot ID from your AdSense account
     */
    adSlot: string;

    /**
     * Ad format: 'auto', 'fluid', 'rectangle', 'horizontal', 'vertical'
     */
    adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';

    /**
     * Custom className for styling
     */
    className?: string;

    /**
     * Responsive ad - will adapt to container size
     */
    responsive?: boolean;

    /**
     * Layout key for responsive ads (optional)
     */
    layoutKey?: string;
}

/**
 * Google AdSense Ad Component
 * 
 * This component handles the display of Google AdSense ads
 * with proper error handling and responsive design.
 * 
 * Usage:
 * <AdSenseAd adSlot="1234567890" adFormat="auto" responsive />
 */
const AdSenseAd: React.FC<AdSenseAdProps> = ({
    adSlot,
    adFormat = 'auto',
    className = '',
    responsive = true,
    layoutKey
}) => {
    useEffect(() => {
        try {
            // Check if adsbygoogle is loaded and available
            // If adblocker is active, this script might not be loaded or network requests might fail silently
            if (typeof window !== 'undefined') {
                // Check if the script exists in the document (simple check for ad blocker preventing script load)
                const adScript = document.querySelector('script[src*="adsbygoogle.js"]');

                if (adScript || (window as any).adsbygoogle) {
                    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                } else {
                    console.debug('AdSense script not found or blocked by client.');
                }
            }
        } catch (error) {
            // This catches errors during the push(), which might happen if the blocking mechanism is aggressive
            console.debug('AdSense initialization suppressed (likely ad blocker):', error);
        }
    }, []);

    return (
        <div className={`adsense-container ${className}`}>
            <ins
                className="adsbygoogle"
                style={{
                    display: 'block',
                    textAlign: 'center'
                }}
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
