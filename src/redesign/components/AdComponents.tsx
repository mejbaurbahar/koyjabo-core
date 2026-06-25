import React, { useState, useEffect, useRef } from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';

function AdsenseUnit({ slot, format = 'auto', layout, onFillResult }: { slot: string; format?: string; layout?: string; onFillResult?: (filled: boolean) => void }) {
  const insRef = useRef<HTMLElement>(null);
  const pushed = useRef(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    pushed.current = false;
    const ins = insRef.current;
    if (!ins) return;

    const checkFill = () => {
      const status = ins.getAttribute('data-adsbygoogle-status');
      if (status === 'unfilled') { onFillResult?.(false); return; }
      // Require iframe with real src — ins height alone is unreliable (set even when unfilled)
      const iframe = ins.querySelector('iframe');
      if (iframe && iframe.src && !iframe.src.startsWith('about:') && iframe.src.length > 10) {
        onFillResult?.(true); return;
      }
    };

    const doPush = () => {
      if (pushed.current) return;
      const status = ins.getAttribute('data-adsbygoogle-status');
      if (status === 'unfilled') { onFillResult?.(false); return; }
      if (status === 'done' || status === 'filled') { checkFill(); return; }
      const asg = (window as any).adsbygoogle;
      if (!asg || typeof asg.push !== 'function') {
        timer.current = window.setTimeout(doPush, 1000);
        return;
      }
      pushed.current = true;
      try { asg.push({}); }
      catch { pushed.current = false; onFillResult?.(false); return; }
      // First check at 3.5s, final decision at 7s total
      timer.current = window.setTimeout(() => {
        checkFill();
        timer.current = window.setTimeout(() => {
          const iframe = ins.querySelector('iframe');
          onFillResult?.(!!(iframe && iframe.src && !iframe.src.startsWith('about:') && iframe.src.length > 10));
        }, 3500);
      }, 3500);
    };

    const blockTimeout = window.setTimeout(() => {
      if (!pushed.current) onFillResult?.(false);
    }, 10000);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { observer.disconnect(); doPush(); } },
        { rootMargin: '400px 0px' }
      );
      observer.observe(ins);
      return () => { observer.disconnect(); clearTimeout(timer.current); clearTimeout(blockTimeout); };
    }
    doPush();
    return () => { clearTimeout(timer.current); clearTimeout(blockTimeout); };
  }, [slot, format]);

  return (
    <ins
      ref={insRef as any}
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', minWidth: 0 }}
      data-ad-client="ca-pub-8425219156685369"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
      {...(layout ? { 'data-ad-layout': layout } : {})}
    />
  );
}

// ── SideRailAd: fixed skyscraper (desktop ≥1500px gutters)
export function SideRailAd({ tk, lang, side }: { tk: Tokens; lang: Lang; side: 'left' | 'right' }) {
  const [filled, setFilled] = useState<boolean | null>(null);

  if (filled === false) return null;

  // Keep ad at real viewport position so AdSense/auto-ads can process it.
  // visibility:hidden + pointerEvents:none while detecting — invisible but valid placement.
  return (
    <div style={{
      position: 'fixed', top: '50%', transform: 'translateY(-50%)',
      [side]: 8, width: 160, zIndex: 80,
      visibility: filled === true ? 'visible' : 'hidden',
      pointerEvents: filled === true ? 'auto' : 'none',
      background: filled === true ? tk.panelMuted : 'transparent',
      border: filled === true ? `1px solid ${tk.line}` : 'none',
      borderRadius: 12, minHeight: 600,
      display: 'flex', flexDirection: 'column', alignItems: 'stretch',
      justifyContent: 'flex-start', padding: 8, overflow: 'hidden',
    }}>
      <AdsenseUnit slot="3797668998" onFillResult={setFilled}/>
    </div>
  );
}

// ── AnchorAd: sticky bottom bar — hidden when AdSense doesn't fill
export function AnchorAd({ tk, lang, onClose }: { tk: Tokens; lang: Lang; onClose: () => void }) {
  const [filled, setFilled] = useState<boolean | null>(null);

  // Auto-close if AdSense doesn't fill — no house ad
  useEffect(() => {
    if (filled === false) onClose();
  }, [filled]);

  if (filled === false || filled === null) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
      background: tk.panel, borderTop: `1px solid ${tk.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px', minHeight: 64, backdropFilter: 'blur(12px)',
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ flex: 1, minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AdsenseUnit slot="3797668998" format="horizontal" onFillResult={setFilled}/>
      </div>
      <button onClick={onClose} style={{ background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 999, color: tk.textFaint, cursor: 'pointer', fontSize: 16, width: 32, height: 32, lineHeight: 1 }}>×</button>
    </div>
  );
}

// ── VignetteAd: full-screen interstitial — closes automatically if unfilled
export function VignetteAd({ tk, lang, open, onClose }: { tk: Tokens; lang: Lang; open: boolean; onClose: () => void }) {
  const [count, setCount] = useState(5);
  const [filled, setFilled] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) { setCount(5); setFilled(null); return; }
    const id = setInterval(() => setCount(c => c <= 1 ? (clearInterval(id), 0) : c - 1), 1000);
    return () => clearInterval(id);
  }, [open]);

  // Auto-close vignette if AdSense doesn't fill — no house ad
  useEffect(() => {
    if (filled === false) onClose();
  }, [filled]);

  if (!open || filled === false) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10080, background: 'rgba(3,5,12,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <button onClick={count === 0 ? onClose : undefined} style={{
        position: 'absolute', top: 14, right: 14, padding: '8px 14px', borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: '#fff',
        cursor: count === 0 ? 'pointer' : 'default', fontFamily: SANS, fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'center', gap: 8, opacity: count === 0 ? 1 : 0.7,
      }}>
        {count === 0 ? T(lang, 'বন্ধ করুন', 'Skip ad') : T(lang, `${count}s`, `Skip in ${count}s`)}
        {count === 0 && <span>✕</span>}
      </button>
      <div style={{ width: 'min(420px,100%)', minHeight: filled === true ? 360 : 0, maxHeight: '76vh', borderRadius: 18, overflow: 'hidden', background: tk.bg, border: `1px solid ${tk.line}`, boxShadow: tk.shadowLg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ minHeight: filled === true ? 300 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
          <AdsenseUnit slot="9568870428" format="fluid" layout="in-article" onFillResult={setFilled}/>
        </div>
      </div>
    </div>
  );
}

// ── AdIntentRow: sponsored intent chips
export function AdIntentRow({ tk, lang }: { tk: Tokens; lang: Lang }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const chips = [
    { label: T(lang, 'ভ্রমণ বিজ্ঞাপন', 'Travel ad') },
    { label: T(lang, 'ফ্লাইট বিজ্ঞাপন', 'Flight ad') },
    { label: T(lang, 'টিকিট বিজ্ঞাপন', 'Ticket ad') },
    { label: T(lang, 'হোটেল বিজ্ঞাপন', 'Hotel ad') },
  ];
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {chips.map((c, i) => (
          <button key={i} onClick={() => setDialogOpen(true)} style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 999, padding: '8px 14px', fontFamily: BEN, fontSize: 13, color: tk.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {c.label}
          </button>
        ))}
      </div>
      {dialogOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setDialogOpen(false)}>
          <div style={{ background: tk.bg, border: `1px solid ${tk.line}`, borderRadius: 20, padding: 24, maxWidth: 360, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ minHeight: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <AdsenseUnit slot="3797668998"/>
            </div>
            <button onClick={() => setDialogOpen(false)} style={{ background: tk.primary, color: tk.primaryInk, border: 0, borderRadius: 12, padding: '10px 20px', fontFamily: SANS, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {T(lang, 'বন্ধ করুন', 'Close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NativeAdSection: multiplex + related search chips
export function NativeAdSection({ tk, lang, isMobile }: { tk: Tokens; lang: Lang; isMobile: boolean }) {
  const [filled, setFilled] = useState<boolean | null>(null);

  const related = [
    T(lang, 'ঢাকা থেকে চট্টগ্রাম বাস', 'Dhaka to Chittagong bus'),
    T(lang, 'আজকের মেট্রো সময়সূচি', 'Metro schedule today'),
    T(lang, 'সদরঘাট লঞ্চ সময়', 'Sadarghat launch time'),
    T(lang, 'বিমান কক্সবাজার ফ্লাইট', "Biman flight Dhaka Cox's Bazar"),
  ];

  return (
    <div>
      {/* AdSense multiplex — collapses silently when unfilled */}
      {filled !== false && (
        <div style={{
          borderRadius: 14, overflow: 'hidden', marginBottom: filled === true ? 16 : 0,
          minHeight: filled === true ? (isMobile ? 120 : 100) : 0,
        }}>
          <AdsenseUnit slot="2707948607" format="autorelaxed" onFillResult={setFilled}/>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {related.map((r, i) => (
          <button key={i} style={{ background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 999, padding: '6px 12px', fontFamily: BEN, fontSize: 12, color: tk.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10 }}>🔍</span>{r}
          </button>
        ))}
      </div>
    </div>
  );
}
