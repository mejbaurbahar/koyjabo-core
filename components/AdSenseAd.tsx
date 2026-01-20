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
            // Push ad to AdSense queue
            if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('AdSense error:', error);
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
