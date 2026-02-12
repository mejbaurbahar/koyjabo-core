/**
 * Ezoic Ad Management Service
 * Professional implementation for ezoic ads integration
 * Handles ad loading, display, and dynamic content updates
 */

export interface EzoicAdPlacement {
    id: number;
    element?: HTMLElement;
    loaded: boolean;
}

class EzoicAdService {
    private placeholders: Map<number, EzoicAdPlacement> = new Map();
    private initialized: boolean = false;
    private pageviewTracked: boolean = false;

    /**
     * Initialize Ezoic if not already done
     */
    init(): void {
        if (this.initialized) return;

        // Ensure window.ezstandalone is available
        if (typeof window !== 'undefined') {
            if (!window.ezstandalone) {
                window.ezstandalone = {
                    cmd: [],
                    showAds: () => { },
                    destroyPlaceholders: () => { },
                    destroyAll: () => { }
                };
            }
            if (!window.ezstandalone.cmd) {
                window.ezstandalone.cmd = [];
            }
            this.initialized = true;
            console.log('[Ezoic] Service initialized');
        }
    }

    /**
     * Show one or more ad placements
     * @param placementIds - Array of placement IDs to display
     */
    showAds(...placementIds: number[]): void {
        if (!this.initialized) {
            this.init();
        }

        if (placementIds.length === 0) {
            // Show all placeholders
            this.showAllAds();
            return;
        }

        // Track placements
        placementIds.forEach(id => {
            if (!this.placeholders.has(id)) {
                this.placeholders.set(id, { id, loaded: false });
            }
        });

        // Call Ezoic to show ads
        if (window.ezstandalone && window.ezstandalone.cmd) {
            window.ezstandalone.cmd.push(() => {
                window.ezstandalone.showAds(...placementIds);
                placementIds.forEach(id => {
                    const placement = this.placeholders.get(id);
                    if (placement) {
                        placement.loaded = true;
                    }
                });
                console.log(`[Ezoic] Ads loaded for placements: ${placementIds.join(', ')}`);
            });
        }
    }

    /**
     * Show all ad placeholders on the page
     */
    showAllAds(): void {
        if (!this.initialized) {
            this.init();
        }

        if (window.ezstandalone && window.ezstandalone.cmd) {
            window.ezstandalone.cmd.push(() => {
                window.ezstandalone.showAds();
                console.log('[Ezoic] All ads reloaded');
            });
        }
    }

    /**
     * Destroy specific ad placeholders (for dynamic content)
     * @param placementIds - Array of placement IDs to destroy
     */
    destroyPlaceholders(...placementIds: number[]): void {
        if (window.ezstandalone && window.ezstandalone.cmd) {
            window.ezstandalone.cmd.push(() => {
                window.ezstandalone.destroyPlaceholders(...placementIds);
                placementIds.forEach(id => {
                    const placement = this.placeholders.get(id);
                    if (placement) {
                        placement.loaded = false;
                    }
                });
                console.log(`[Ezoic] Ads destroyed for placements: ${placementIds.join(', ')}`);
            });
        }
    }

    /**
     * Destroy all ad placeholders on the page
     */
    destroyAll(): void {
        if (window.ezstandalone && window.ezstandalone.cmd) {
            window.ezstandalone.cmd.push(() => {
                window.ezstandalone.destroyAll();
                this.placeholders.forEach(placement => {
                    placement.loaded = false;
                });
                console.log('[Ezoic] All ads destroyed');
            });
        }
    }

    /**
     * Refresh ads when navigating to a new page (SPA)
     * Automatically calls all placeholders
     */
    refreshForPageChange(): void {
        this.pageviewTracked = false;
        this.showAllAds();
    }

    /**
     * Register a new placement
     */
    registerPlacement(id: number, element?: HTMLElement): void {
        this.placeholders.set(id, {
            id,
            element,
            loaded: false
        });
    }

    /**
     * Get placement status
     */
    getPlacementStatus(id: number): EzoicAdPlacement | undefined {
        return this.placeholders.get(id);
    }

    /**
     * Check if Ezoic is loaded and ready
     */
    isReady(): boolean {
        return !!(window.ezstandalone && window.ezstandalone.cmd);
    }

    /**
     * Wait for Ezoic to be ready
     */
    async waitForReady(timeout: number = 5000): Promise<boolean> {
        const start = Date.now();

        return new Promise((resolve) => {
            const check = () => {
                if (this.isReady()) {
                    resolve(true);
                    return;
                }

                if (Date.now() - start > timeout) {
                    console.warn('[Ezoic] Timeout waiting for Ezoic to load');
                    resolve(false);
                    return;
                }

                setTimeout(check, 100);
            };

            check();
        });
    }
}

// Export singleton instance
export const ezoicService = new EzoicAdService();

// TypeScript declarations for window.ezstandalone
declare global {
    interface Window {
        ezstandalone: {
            cmd: Array<() => void>;
            showAds: (...placementIds: number[]) => void;
            destroyPlaceholders: (...placementIds: number[]) => void;
            destroyAll: () => void;
        };
    }
}
