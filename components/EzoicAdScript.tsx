import { useEffect } from 'react';

/**
 * EzoicAdScript Component
 * 
 * Loads Ezoic privacy and header scripts at the top of your React app.
 * This should be included once in your root App component.
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <>
 *       <EzoicAdScript />
 *       <YourContent />
 *     </>
 *   );
 * }
 * ```
 */

export const EzoicAdScript: React.FC = () => {
    useEffect(() => {
        // Initialize ezstandalone on window
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
            console.log('[Ezoic] Scripts initialized');
        }
    }, []);

    // Scripts are loaded via HTML, this component just ensures initialization
    return null;
};

export default EzoicAdScript;
