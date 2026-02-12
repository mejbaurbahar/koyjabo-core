/**
 * Type definitions for Ezoic JavaScript integration
 * This provides TypeScript support for the Ezoic window object
 */

declare global {
    interface Window {
        /**
         * Ezoic Standalone object for ad management
         */
        ezstandalone: {
            /**
             * Command queue for Ezoic operations
             * Push functions to this array to execute when Ezoic is ready
             */
            cmd: Array<() => void>;

            /**
             * Show one or more ad placements
             * @param placementIds - Placement IDs to display. If empty, shows all placements on the page.
             * @example
             * ```js
             * // Show specific placements
             * ezstandalone.showAds(101, 102, 103);
             * 
             * // Show all placements
             * ezstandalone.showAds();
             * ```
             */
            showAds: (...placementIds: number[]) => void;

            /**
             * Destroy specific ad placeholders
             * Use this when removing dynamic content to clean up ads
             * @param placementIds - Placement IDs to destroy
             * @example
             * ```js
             * ezstandalone.destroyPlaceholders(104, 105);
             * ```
             */
            destroyPlaceholders: (...placementIds: number[]) => void;

            /**
             * Destroy all ad placeholders on the page
             * @example
             * ```js
             * ezstandalone.destroyAll();
             * ```
             */
            destroyAll: () => void;
        };
    }
}

/**
 * Ezoic Ad Placement Interface
 */
export interface EzoicAdPlacement {
    /** Unique placement ID from Ezoic dashboard */
    id: number;
    /** Reference to the DOM element containing the ad */
    element?: HTMLElement;
    /** Whether the ad has been loaded */
    loaded: boolean;
}

/**
 * Options for useEzoic hook
 */
export interface UseEzoicOptions {
    /** Automatically refresh all ads when component mounts */
    autoRefresh?: boolean;
    /** Placement IDs to automatically load on mount */
    autoLoadPlacements?: number[];
    /** Callback when page changes (for SPA routing) */
    onPageChange?: () => void;
}

/**
 * Props for EzoicAd component
 */
export interface EzoicAdProps {
    /** Ezoic placement ID from your dashboard */
    placementId: number;
    /** Additional CSS classes for the container */
    className?: string;
    /** Whether to automatically load the ad on mount (default: true) */
    autoLoad?: boolean;
    /** Callback when ad is loaded successfully */
    onAdLoaded?: () => void;
    /** Callback when ad fails to load */
    onAdError?: (error: Error) => void;
}

/**
 * Props for EzoicMultiAd component
 */
export interface EzoicMultiAdProps {
    /** Array of placement IDs to display */
    placementIds: number[];
    /** Additional CSS classes for the container */
    className?: string;
    /** Layout orientation for the ads */
    orientation?: 'horizontal' | 'vertical';
}

/**
 * Return type of useEzoic hook
 */
export interface UseEzoicReturn {
    /** Show one or more ads */
    showAd: (...placementIds: number[]) => void;
    /** Destroy one or more ads */
    destroyAd: (...placementIds: number[]) => void;
    /** Destroy all ads on the page */
    destroyAll: () => void;
    /** Refresh all ads (for SPA page changes) */
    refreshAds: () => void;
    /** Check if Ezoic is ready */
    isReady: () => boolean;
    /** Wait for Ezoic to be ready */
    waitForReady: (timeout?: number) => Promise<boolean>;
    /** Get status of a specific placement */
    getPlacementStatus: (placementId: number) => EzoicAdPlacement | undefined;
    /** Array of currently loaded placement IDs */
    loadedPlacements: number[];
}

// Export empty object to make this a module
export { };
