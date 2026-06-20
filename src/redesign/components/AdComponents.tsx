import React, { useState, useEffect, useRef } from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';


function AdsenseUnit({ slot, format = 'auto' }: { slot: string; format?: string }) {
  const insRef = useRef<HTMLElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    pushed.current = false;
    const pushAd = () => {
      const ins = insRef.current;
      if (!ins || pushed.current) return;
      const status = ins.getAttribute('data-adsbygoogle-status');
      if (status === 'done' || status === 'filled') return;
      if (typeof (window as any).adsbygoogle === 'undefined') {
        window.setTimeout(pushAd, 1600);
        return;
      }
      pushed.current = true;
      try { ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({}); }
      catch { pushed.current = false; }
    };
    pushAd();
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
    />
  );
}

// ── SideRailAd: fixed skyscraper (desktop ≥1500px gutters)
export function SideRailAd({ tk, lang, side }: { tk: Tokens; lang: Lang; side: 'left' | 'right' }) {
  return (
    <div style={{
      position: 'fixed', top: '50%', transform: 'translateY(-50%)',
      [side]: 8, width: 160, zIndex: 80,
      background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 12,
      minHeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'stretch',
      justifyContent: 'flex-start', padding: 8, overflow: 'hidden',
    }}>
      <div style={{ minHeight: 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AdsenseUnit slot="7294303750"/>
      </div>
    </div>
  );
}

// ── AnchorAd: sticky bottom bar
export function AnchorAd({ tk, lang, onClose }: { tk: Tokens; lang: Lang; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
      background: tk.panel, borderTop: `1px solid ${tk.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px', minHeight: 64, backdropFilter: 'blur(12px)',
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ flex: 1, minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AdsenseUnit slot="7294303750" format="horizontal"/>
      </div>
      <button onClick={onClose} style={{ background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 999, color: tk.textFaint, cursor: 'pointer', fontSize: 16, width: 32, height: 32, lineHeight: 1 }}>×</button>
    </div>
  );
}

// ── VignetteAd: full-screen interstitial with skip countdown
export function VignetteAd({ tk, lang, open, onClose }: { tk: Tokens; lang: Lang; open: boolean; onClose: () => void }) {
  const [count, setCount] = useState(5);
  useEffect(() => {
    if (!open) { setCount(5); return; }
    const id = setInterval(() => setCount(c => c <= 1 ? (clearInterval(id), 0) : c - 1), 1000);
    return () => clearInterval(id);
  }, [open]);
  if (!open) return null;
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
      <div style={{ width: 'min(420px,100%)', minHeight: 360, maxHeight: '76vh', borderRadius: 18, overflow: 'hidden', background: tk.bg, border: `1px solid ${tk.line}`, boxShadow: tk.shadowLg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
          <AdsenseUnit slot="7294303750"/>
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
              <AdsenseUnit slot="7294303750"/>
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

// ── NativeAdSection: multiplex grid + related searches
export function NativeAdSection({ tk, lang, isMobile }: { tk: Tokens; lang: Lang; isMobile: boolean }) {
  const related = [
    T(lang, 'ঢাকা থেকে চট্টগ্রাম বাস', 'Dhaka to Chittagong bus'),
    T(lang, 'আজকের মেট্রো সময়সূচি', 'Metro schedule today'),
    T(lang, 'সদরঘাট লঞ্চ সময়', 'Sadarghat launch time'),
    T(lang, 'বিমান কক্সবাজার ফ্লাইট', 'Biman flight Dhaka Cox\'s Bazar'),
  ];
  return (
    <div>
      <div style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14, padding: 10, minHeight: isMobile ? 120 : 100, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AdsenseUnit slot="7294303750" format={isMobile ? 'horizontal' : 'auto'}/>
      </div>
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
