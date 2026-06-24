import React, { useState, useEffect, useRef } from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';


// Anchor house-ad fallback (shown when AdSense blocked/unfilled in AnchorAd)
const ANCHOR_HOUSE = [
  { text: '🚌 200+ Dhaka bus routes — Free & offline forever', textBn: '🚌 ২০০+ ঢাকা বাস রুট — বিনামূল্যে ও অফলাইনে', href: '/', color: '#10b981' },
  { text: '🗺️ Plan Bangladesh intercity trips with KoyJabo', textBn: '🗺️ KoyJabo দিয়ে আন্তঃজেলা ভ্রমণ পরিকল্পনা করুন', href: '/intercity', color: '#60a5fa' },
  { text: '🤖 Ask KoyJabo AI — bus, train & travel answers instantly', textBn: '🤖 KoyJabo AI-কে জিজ্ঞেস করুন — বাস, ট্রেন ও ভ্রমণ তথ্য', href: '/ai', color: '#a78bfa' },
];
let anchorHouseIdx = 0;

function isAdSenseAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const asg = (window as any).adsbygoogle;
  if (!asg) return false;
  const scripts = document.querySelectorAll('script[src*="pagead2.googlesyndication"]');
  return scripts.length > 0;
}

function AdsenseUnit({ slot, format = 'auto', layout, onFillResult }: { slot: string; format?: string; layout?: string; onFillResult?: (filled: boolean) => void }) {
  const insRef = useRef<HTMLElement>(null);
  const pushed = useRef(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    pushed.current = false;
    const ins = insRef.current;
    if (!ins) return;

    if (!isAdSenseAvailable()) {
      onFillResult?.(false);
      return;
    }

    const checkFill = () => {
      const h = ins.clientHeight || (ins as HTMLElement).offsetHeight;
      const iframe = ins.querySelector('iframe');
      const ok = h > 5 || !!(iframe && (iframe.src || iframe.srcdoc));
      onFillResult?.(ok);
    };

    const doPush = () => {
      if (pushed.current) return;
      const status = ins.getAttribute('data-adsbygoogle-status');
      if (status === 'done' || status === 'filled') { checkFill(); return; }
      const asg = (window as any).adsbygoogle;
      // Not ready yet — retry (script may still be loading)
      if (!asg || typeof asg.push !== 'function') {
        timer.current = window.setTimeout(doPush, 1000);
        return;
      }
      pushed.current = true;
      try { asg.push({}); }
      catch { pushed.current = false; onFillResult?.(false); return; }
      timer.current = window.setTimeout(() => { checkFill(); }, 3500);
    };

    // Hard timeout — if never pushed after 7s → blocked
    const blockTimeout = window.setTimeout(() => {
      if (!pushed.current) onFillResult?.(false);
    }, 7000);

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

  const handleRailClick = () => {
    window.history.pushState({}, '', '/ai');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div style={{
      position: 'fixed', top: '50%', transform: 'translateY(-50%)',
      [side]: 8, width: 160, zIndex: 80,
      background: filled === false ? 'linear-gradient(180deg,#064e3b,#022c22)' : filled === null ? 'transparent' : tk.panelMuted,
      border: filled === false ? '1px solid #10b98133' : `1px solid ${tk.line}`,
      borderRadius: 12,
      minHeight: filled !== null ? 220 : 0,
      display: 'flex', flexDirection: 'column', alignItems: 'stretch',
      justifyContent: 'flex-start', padding: 8, overflow: 'hidden',
      transition: 'min-height 0.3s',
    }}>
      <div style={{ display: filled === false ? 'none' : 'block', minHeight: filled === true ? 560 : 0 }}>
        <div style={{ minHeight: filled === true ? 560 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AdsenseUnit slot="3797668998" onFillResult={setFilled}/>
        </div>
      </div>
      {filled === false && (
        <div
          onClick={handleRailClick}
          style={{ cursor: 'pointer', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}
        >
          <span style={{ fontSize: 32 }}>🤖</span>
          <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
            {T(lang, 'KoyJabo AI সহায়ক', 'KoyJabo AI Assistant')}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
            {T(lang, 'বাস, ট্রেন ও ভ্রমণ প্রশ্ন করুন', 'Ask transport questions')}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
            {T(lang, 'চেষ্টা করুন →', 'Try it →')}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>PROMOTED</div>
        </div>
      )}
    </div>
  );
}

// ── AnchorAd: sticky bottom bar
export function AnchorAd({ tk, lang, onClose }: { tk: Tokens; lang: Lang; onClose: () => void }) {
  const [filled, setFilled] = useState<boolean | null>(null);
  const houseAd = ANCHOR_HOUSE[anchorHouseIdx % ANCHOR_HOUSE.length];

  const handleHouseClick = () => {
    if (houseAd.href.startsWith('/')) {
      window.history.pushState({}, '', houseAd.href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    onClose();
  };

  if (filled === false) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
        background: 'linear-gradient(135deg,#064e3b,#065f46)',
        borderTop: '1px solid #10b98133',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
        minHeight: 56,
      }}>
        <div
          onClick={handleHouseClick}
          style={{ flex: 1, cursor: 'pointer', fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: 600, color: '#fff' }}
        >
          {T(lang, houseAd.textBn, houseAd.text)}
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999, color: '#fff', cursor: 'pointer', fontSize: 16, width: 32, height: 32, lineHeight: 1, flexShrink: 0, marginLeft: 12 }}>×</button>
      </div>
    );
  }

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
        {(() => {
          const VignetteAdInner = () => {
            const [vFilled, setVFilled] = React.useState<boolean | null>(null);
            const vAds = [
              { icon:'🤖', title:'KoyJabo AI ট্রাভেল সহায়ক', titleEn:'KoyJabo AI Travel Assistant', sub:'যেকোনো ট্রান্সপোর্ট প্রশ্ন করুন বিনামূলে', subEn:'Ask transport questions free — Bengali & English', href:'/ai', bg:'linear-gradient(135deg,#064e3b,#065f46)', accent:'#10b981' },
              { icon:'🗺️', title:'আন্তঃজেলা ভ্রমণ পরিকল্পনা', titleEn:'Intercity Travel Planner', sub:'বাস, ট্রেন, লঞ্চ ও বিমান এক জায়গায়', subEn:'Bus, train, launch & flights in one app', href:'/intercity', bg:'linear-gradient(135deg,#1e3a5f,#1d4ed8)', accent:'#60a5fa' },
            ];
            const va = vAds[Math.floor(Math.random() * vAds.length)];
            const nav = () => { onClose(); window.history.pushState({}, '', va.href); window.dispatchEvent(new PopStateEvent('popstate')); };
            return (
              <>
                <div style={{ display: vFilled === false ? 'none' : 'block', minHeight: vFilled === true ? 300 : 0 }}>
                  <div style={{ minHeight: vFilled === true ? 300 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                    <AdsenseUnit slot="9568870428" format="fluid" layout="in-article" onFillResult={setVFilled}/>
                  </div>
                </div>
                {vFilled === false && (
                  <div onClick={nav} style={{ cursor:'pointer', padding:'32px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:16, textAlign:'center', background:va.bg, flex:1, minHeight:300 }}>
                    <span style={{ fontSize:56 }}>{va.icon}</span>
                    <div style={{ fontFamily:lang==='bn'?BEN:SANS, fontSize:20, fontWeight:800, color:'#fff' }}>{T(lang,va.title,va.titleEn)}</div>
                    <div style={{ fontFamily:lang==='bn'?BEN:SANS, fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.5 }}>{T(lang,va.sub,va.subEn)}</div>
                    <div style={{ marginTop:8, background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'12px 24px', fontFamily:SANS, fontWeight:700, fontSize:14, color:va.accent }}>
                      {T(lang,'চেষ্টা করুন →','Try it →')}
                    </div>
                    <div style={{ fontFamily:SANS, fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:4 }}>PROMOTED</div>
                  </div>
                )}
              </>
            );
          };
          return <VignetteAdInner />;
        })()}
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

// Native house ad cards shown when AdSense doesn't fill in NativeAdSection
const NATIVE_HOUSE_ADS = [
  {
    icon: '🤖', color: '#10b981', bg: '#06402522',
    title: 'KoyJabo AI Travel Assistant', titleBn: 'KoyJabo AI ট্রাভেল সহায়ক',
    sub: 'Ask any transport question in Bengali or English — free', subBn: 'যেকোনো ট্রান্সপোর্ট প্রশ্ন করুন বাংলায় বা ইংরেজিতে — বিনামূল্যে',
    href: '/ai',
  },
  {
    icon: '🏖️', color: '#3b82f6', bg: '#1e3a5f22',
    title: "Cox's Bazar Tour Packages", titleBn: 'কক্সবাজার ট্যুর প্যাকেজ',
    sub: 'Book 3N/4D packages · starting ৳8,500', subBn: '৩ রাত ৪ দিন প্যাকেজ · ৳৮,৫০০ থেকে',
    href: '/intercity',
  },
  {
    icon: '💼', color: '#8b5cf6', bg: '#312e8122',
    title: 'KoyJabo API for Developers', titleBn: 'ডেভেলপারদের জন্য API',
    sub: 'Bus, train & intercity data · ৳300/month', subBn: 'বাস, ট্রেন ও আন্তঃজেলা ডেটা · ৳৩০০/মাস',
    href: '/api-access',
  },
];
let nativeHouseIdx = 0;

// ── NativeAdSection: multiplex grid + related searches
export function NativeAdSection({ tk, lang, isMobile }: { tk: Tokens; lang: Lang; isMobile: boolean }) {
  const [filled, setFilled] = useState<boolean | null>(null);
  const h = isMobile ? 120 : 100;

  const houseAd = NATIVE_HOUSE_ADS[nativeHouseIdx % NATIVE_HOUSE_ADS.length];

  const handleHouseNav = () => {
    if (houseAd.href.startsWith('/')) {
      window.history.pushState({}, '', houseAd.href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const related = [
    T(lang, 'ঢাকা থেকে চট্টগ্রাম বাস', 'Dhaka to Chittagong bus'),
    T(lang, 'আজকের মেট্রো সময়সূচি', 'Metro schedule today'),
    T(lang, 'সদরঘাট লঞ্চ সময়', 'Sadarghat launch time'),
    T(lang, 'বিমান কক্সবাজার ফ্লাইট', "Biman flight Dhaka Cox's Bazar"),
  ];

  return (
    <div>
      {/* AdSense unit — hidden once confirmed unfilled */}
      <div style={{ display: filled === false ? 'none' : 'block', marginBottom: filled === true ? 16 : 0 }}>
        <div style={{
          background: 'transparent',
          borderRadius: 14, overflow: 'hidden',
          minHeight: filled === true ? h : 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AdsenseUnit slot="2707948607" format="autorelaxed" onFillResult={setFilled}/>
        </div>
      </div>

      {/* House ad fallback */}
      {filled === false && (
        <div
          onClick={handleHouseNav}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleHouseNav()}
          style={{
            marginBottom: 16, borderRadius: 14, padding: '16px 20px',
            background: `linear-gradient(135deg, ${houseAd.bg}, transparent)`,
            border: `1px solid ${houseAd.color}33`,
            display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
            minHeight: h,
          }}
        >
          <span style={{ fontSize: 36, flexShrink: 0 }}>{houseAd.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 15, fontWeight: 700, color: tk.text, marginBottom: 4 }}>
              {T(lang, houseAd.titleBn, houseAd.title)}
            </div>
            <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, color: tk.textDim, lineHeight: 1.4 }}>
              {T(lang, houseAd.subBn, houseAd.sub)}
            </div>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: houseAd.color, flexShrink: 0 }}>
            {T(lang, 'দেখুন →', 'View →')}
          </div>
          <div style={{ position: 'absolute' as const, top: 0, right: 8, fontFamily: SANS, fontSize: 9, color: tk.textFaint, letterSpacing: 0.5 }}>PROMOTED</div>
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
