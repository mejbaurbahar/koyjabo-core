import { useEffect, useRef } from 'react';
import { ezoicService } from '../services/ezoicService';

/**
 * EzoicAd Component
 * 
 * Reusable component for displaying Ezoic ads at specific placements.
 * Automatically handles mounting, unmounting, and updates.
 * 
 * @example
 * ```tsx
 * <EzoicAd placementId={101} />
 * <EzoicAd placementId={102} className="my-4" />
 * ```
 */

export interface EzoicAdProps {
    /** Ezoic placement ID from your dashboard */
    placementId: number;

    /** Additional CSS classes for the container */
    className?: string;

    /** Whether to automatically load the ad on mount (default: true) */
    autoLoad?: boolean;

    /** Callback when ad is loaded */
    onAdLoaded?: () => void;

    /** Callback when ad fails to load */
    onAdError?: (error: Error) => void;
}

/**
 * Ezoic Ad Component
 * Professional implementation with lifecycle management
 */
export const EzoicAd: React.FC<EzoicAdProps> = ({
    placementId,
    className = '',
    autoLoad = true,
    onAdLoaded,
    onAdError
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        // Initialize Ezoic service
        ezoicService.init();

        // Register the placement
        if (containerRef.current) {
            ezoicService.registerPlacement(placementId, containerRef.current);
        }

        // Auto-load ad if enabled
        if (autoLoad && !loadedRef.current) {
            loadAd();
        }

        // Cleanup on unmount
        return () => {
            try {
                ezoicService.destroyPlaceholders(placementId);
            } catch (error) {
                console.error(`[EzoicAd] Failed to destroy placement ${placementId}:`, error);
            }
        };
    }, [placementId, autoLoad]);

    /**
     * Load the ad
     */
    const loadAd = async () => {
        try {
            // Wait for Ezoic to be ready
            const ready = await ezoicService.waitForReady();

            if (!ready) {
                throw new Error('Ezoic failed to initialize');
            }

            // Show the ad
            ezoicService.showAds(placementId);
            loadedRef.current = true;

            // Call success callback
            if (onAdLoaded) {
                onAdLoaded();
            }
        } catch (error) {
            console.error(`[EzoicAd] Failed to load ad for placement ${placementId}:`, error);

            // Call error callback
            if (onAdError) {
                onAdError(error as Error);
            }
        }
    };

    return (
        <div
            id={`ezoic-pub-ad-placeholder-${placementId}`}
            ref={containerRef}
            className={`ezoic-ad-container ${className}`}
            data-placement-id={placementId}
            aria-label="Advertisement"
        />
    );
};

/**
 * Multiple Ad Placements Component
 * Efficiently loads multiple ads in a single call
 */
export interface EzoicMultiAdProps {
    placementIds: number[];
    className?: string;
    orientation?: 'horizontal' | 'vertical';
}

export const EzoicMultiAd: React.FC<EzoicMultiAdProps> = ({
    placementIds,
    className = '',
    orientation = 'vertical'
}) => {
    useEffect(() => {
        ezoicService.init();

        // Load all ads in a single call (more efficient)
        const loadAds = async () => {
            const ready = await ezoicService.waitForReady();
            if (ready) {
                ezoicService.showAds(...placementIds);
            }
        };

        loadAds();

        return () => {
            ezoicService.destroyPlaceholders(...placementIds);
        };
    }, [placementIds.join(',')]);

    return (
        <div
            className={`ezoic-multi-ad ${orientation === 'horizontal' ? 'flex flex-row gap-4' : 'flex flex-col gap-4'} ${className}`}
        >
            {placementIds.map(id => (
                <div
                    key={id}
                    id={`ezoic-pub-ad-placeholder-${id}`}
                    data-placement-id={id}
                    aria-label="Advertisement"
                />
            ))}
        </div>
    );
};

export default EzoicAd;
