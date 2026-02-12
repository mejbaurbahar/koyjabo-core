import { useEffect, useCallback, useRef } from 'react';
import { ezoicService } from '../services/ezoicService';

/**
 * useEzoic Hook
 * 
 * React hook for advanced Ezoic ad integration.
 * Handles SPA navigation, dynamic content, and lifecycle management.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showAd, destroyAd, refreshAds } = useEzoic();
 *   
 *   const loadNewContent = () => {
 *     // When loading new content with ads
 *     showAd(104, 105);
 *   };
 *   
 *   return <div>...</div>;
 * }
 * ```
 */

export interface UseEzoicOptions {
    /** Auto-refresh ads on component mount */
    autoRefresh?: boolean;

    /** Placement IDs to auto-load on mount */
    autoLoadPlacements?: number[];

    /** Callback when page changes (for SPA routing) */
    onPageChange?: () => void;
}

export const useEzoic = (options: UseEzoicOptions = {}) => {
    const {
        autoRefresh = false,
        autoLoadPlacements = [],
        onPageChange
    } = options;

    const mountedRef = useRef(false);
    const loadedPlacementsRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        // Initialize Ezoic service
        ezoicService.init();
        mountedRef.current = true;

        // Auto-load placements if specified
        if (autoLoadPlacements.length > 0) {
            showAd(...autoLoadPlacements);
        }

        // Auto-refresh all ads if enabled
        if (autoRefresh) {
            refreshAds();
        }

        return () => {
            mountedRef.current = false;
        };
    }, []);

    /**
     * Show one or more ads
     */
    const showAd = useCallback((...placementIds: number[]) => {
        if (!mountedRef.current) return;

        ezoicService.showAds(...placementIds);
        placementIds.forEach(id => loadedPlacementsRef.current.add(id));
    }, []);

    /**
     * Destroy one or more ads (for dynamic content)
     */
    const destroyAd = useCallback((...placementIds: number[]) => {
        if (!mountedRef.current) return;

        ezoicService.destroyPlaceholders(...placementIds);
        placementIds.forEach(id => loadedPlacementsRef.current.delete(id));
    }, []);

    /**
     * Destroy all ads on the page
     */
    const destroyAll = useCallback(() => {
        if (!mountedRef.current) return;

        ezoicService.destroyAll();
        loadedPlacementsRef.current.clear();
    }, []);

    /**
     * Refresh all ads (for SPA page changes)
     */
    const refreshAds = useCallback(() => {
        if (!mountedRef.current) return;

        ezoicService.refreshForPageChange();

        if (onPageChange) {
            onPageChange();
        }
    }, [onPageChange]);

    /**
     * Check if Ezoic is ready
     */
    const isReady = useCallback(() => {
        return ezoicService.isReady();
    }, []);

    /**
     * Wait for Ezoic to be ready
     */
    const waitForReady = useCallback(async (timeout?: number) => {
        return await ezoicService.waitForReady(timeout);
    }, []);

    /**
     * Get placement status
     */
    const getPlacementStatus = useCallback((placementId: number) => {
        return ezoicService.getPlacementStatus(placementId);
    }, []);

    return {
        showAd,
        destroyAd,
        destroyAll,
        refreshAds,
        isReady,
        waitForReady,
        getPlacementStatus,
        loadedPlacements: Array.from(loadedPlacementsRef.current)
    };
};

/**
 * useEzoicPageChange Hook
 * 
 * Automatically refreshes ads when navigating between pages in SPA.
 * Use with React Router or similar routing libraries.
 * 
 * @example
 * ```tsx
 * function App() {
 *   const location = useLocation();
 *   useEzoicPageChange(location.pathname);
 *   
 *   return <Routes>...</Routes>;
 * }
 * ```
 */
export const useEzoicPageChange = (dependency: any) => {
    const { refreshAds } = useEzoic();

    useEffect(() => {
        // Refresh ads when dependency changes (e.g., route path)
        refreshAds();
    }, [dependency, refreshAds]);
};

export default useEzoic;
