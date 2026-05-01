import { useEffect } from 'react';

const AntiScraping = () => {
  useEffect(() => {
    // 1. Disable Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+C)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Shift+I (DevTools)
        if (e.shiftKey && (e.key === 'I' || e.key === 'i')) {
          e.preventDefault();
        }
        // Ctrl+Shift+J (DevTools Console)
        if (e.shiftKey && (e.key === 'J' || e.key === 'j')) {
          e.preventDefault();
        }
        // Ctrl+U (View Source)
        if (e.key === 'U' || e.key === 'u') {
          e.preventDefault();
        }
        // Ctrl+S (Save Page)
        if (e.key === 'S' || e.key === 's') {
          e.preventDefault();
        }
        // Ctrl+C / Cmd+C (Copy - uncomment if you want to completely block copying text)
        // if (e.key === 'C' || e.key === 'c') {
        //   e.preventDefault();
        // }
      }
    };

    // 3. Disable Dragging (to prevent dragging images/text)
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 4. Disable Text Selection (SelectStart)
    const handleSelectStart = (e: Event) => {
      // Allow selection on input/textarea elements so users can type
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
    };

    // Attach listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    // Optional: Basic DevTools debugger loop
    // This makes the browser pause execution if DevTools is open.
    // Uncomment if you want to be extremely aggressive (can cause performance issues)
    /*
    const devToolsInterval = setInterval(() => {
      const before = new Date().getTime();
      debugger; // Will pause here if DevTools is open
      const after = new Date().getTime();
      if (after - before > 100) {
        // DevTools might be open
        document.body.innerHTML = 'Scraping is prohibited.';
      }
    }, 1000);
    */

    // Apply global CSS to disable selection visually
    const style = document.createElement('style');
    style.id = 'anti-scraping-style';
    style.innerHTML = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      input, textarea {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      
      const injectedStyle = document.getElementById('anti-scraping-style');
      if (injectedStyle) {
        injectedStyle.remove();
      }
      // clearInterval(devToolsInterval);
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default AntiScraping;
