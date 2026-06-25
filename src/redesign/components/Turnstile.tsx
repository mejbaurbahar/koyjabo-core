import React, { useEffect, useRef } from 'react';

const SITE_KEY = '0x4AAAAAADqrYOUQASAcL2gU';

interface TurnstileProps {
  theme: 'dark' | 'light';
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function Turnstile({ theme, onVerify, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const render = () => {
      if (!containerRef.current) return;
      if (widgetId.current !== null) return;
      const t = (window as any).turnstile;
      if (!t) { setTimeout(render, 200); return; }

      widgetId.current = t.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme,
        callback: (token: string) => onVerify(token),
        'expired-callback': () => { onExpire?.(); onVerify(''); },
        'error-callback': () => onVerify(''),
        size: 'normal',
      });
    };

    render();

    return () => {
      const t = (window as any).turnstile;
      if (t && widgetId.current !== null) {
        try { t.remove(widgetId.current); } catch {}
        widgetId.current = null;
      }
    };
  }, [theme]);

  return (
    <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }} />
  );
}
