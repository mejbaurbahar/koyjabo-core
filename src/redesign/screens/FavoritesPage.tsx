import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens, Lang } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { ConfirmModal } from '../components/ConfirmModal';

interface ScreenProps {
  theme: 'dark' | 'light';
  device: 'desktop' | 'mobile';
  lang: 'bn' | 'en';
  route: string;
  canBack: boolean;
  onNav: (r: string) => void;
  onBack: () => void;
  onLang: () => void;
  onTheme: () => void;
  onMenu: () => void;
}

type FilterMode = 'All' | 'Bus' | 'Metro' | 'Train' | 'Launch';

const ALL_FAVORITES = [
  { id: 1, name: 'Green Line', nameBn: 'গ্রিন লাইন', from: 'Gulshan', to: 'Motijheel', rating: 4.2, mode: 'Bus' as FilterMode, icon: '🚌' },
  { id: 2, name: 'Metro Line 6', nameBn: 'মেট্রো লাইন ৬', from: 'Uttara', to: 'Motijheel', rating: 5.0, mode: 'Metro' as FilterMode, icon: '🚇' },
  { id: 3, name: "Cox's Bazar Express", nameBn: 'কক্সবাজার এক্সপ্রেস', from: 'Dhaka', to: "Cox's Bazar", rating: 4.5, mode: 'Train' as FilterMode, icon: '🚆' },
  { id: 4, name: 'Sundarban-12', nameBn: 'সুন্দরবন-১২', from: 'Sadarghat', to: 'Barisal', rating: 4.3, mode: 'Launch' as FilterMode, icon: '⛴️' },
];

const MODE_COLOR: Record<FilterMode, string> = {
  All: '#00f5ff',
  Bus: '#00f5ff',
  Metro: '#818cf8',
  Train: '#34d399',
  Launch: '#60a5fa',
};

export function FavoritesPage(props: ScreenProps) {
  const { theme, device, lang, onNav } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const font = lang === 'bn' ? BEN : SANS;
  const card: React.CSSProperties = { background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16, padding: 16 };

  const [filter, setFilter] = useState<FilterMode>('All');
  const [favorites, setFavorites] = useState(ALL_FAVORITES.map((f) => f.id));
  const [removeTarget, setRemoveTarget] = useState<number | null>(null);

  const filters: FilterMode[] = ['All', 'Bus', 'Metro', 'Train', 'Launch'];
  const visible = ALL_FAVORITES.filter((f) => (filter === 'All' || f.mode === filter) && favorites.includes(f.id));

  return (
    <PageShell {...props} canBack>
      <div style={{ maxWidth: isMobile ? '100%' : 680, margin: '0 auto', padding: isMobile ? '16px 12px 100px' : '32px 16px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontFamily: font, fontWeight: 700, fontSize: 24, color: tk.text }}>
            {lbl('Favorites', 'প্রিয়')}
          </h1>
          <div style={{ background: tk.primarySoft, border: `1px solid ${tk.primary}44`, borderRadius: 999, padding: '2px 10px', fontFamily: SANS, fontWeight: 700, fontSize: 13, color: tk.primary }}>
            {favorites.length}
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? tk.primarySoft : tk.panelMuted,
                border: `1px solid ${filter === f ? tk.primary : tk.line}`,
                borderRadius: 999, padding: '6px 14px',
                fontFamily: font, fontWeight: 600, fontSize: 12,
                color: filter === f ? tk.primary : tk.textDim,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {lbl(f, f === 'All' ? 'সব' : f === 'Bus' ? 'বাস' : f === 'Metro' ? 'মেট্রো' : f === 'Train' ? 'ট্রেন' : 'লঞ্চ')}
            </button>
          ))}
        </div>

        {/* Favorite cards */}
        {visible.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visible.map((fav) => (
              <div key={fav.id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {/* Top row */}
                <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${MODE_COLOR[fav.mode]}18`, border: `1px solid ${MODE_COLOR[fav.mode]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {fav.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: font, fontWeight: 700, fontSize: 14, color: tk.text }}>{lbl(fav.name, fav.nameBn)}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: tk.textDim, marginTop: 2 }}>{fav.from} → {fav.to}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#fbbf24', fontSize: 14 }}>★</span>
                    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13, color: tk.text }}>{fav.rating.toFixed(1)}</span>
                  </div>
                  <button
                    onClick={() => setRemoveTarget(fav.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: tk.accent, flexShrink: 0, padding: '0 4px', lineHeight: 1 }}
                    title={lbl('Remove from favorites', 'প্রিয় থেকে সরান')}
                  >
                    ♥
                  </button>
                </div>
                {/* Mode badge */}
                <div style={{ padding: '0 16px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: `${MODE_COLOR[fav.mode]}18`, border: `1px solid ${MODE_COLOR[fav.mode]}40`, borderRadius: 999, padding: '2px 8px', fontFamily: SANS, fontSize: 10, fontWeight: 700, color: MODE_COLOR[fav.mode], textTransform: 'uppercase', letterSpacing: 0.3 }}>{fav.mode}</span>
                </div>
                {/* Quick actions */}
                <div style={{ borderTop: `1px solid ${tk.line}`, padding: '10px 16px', display: 'flex', gap: 8 }}>
                  {[
                    { icon: '🔔', label: lbl('Alerts', 'সতর্কতা') },
                    { icon: '⭐', label: lbl('Rate', 'রেটিং') },
                    { icon: '🗺', label: lbl('Navigate', 'নেভিগেট') },
                  ].map((a) => (
                    <button
                      key={a.label}
                      style={{ flex: 1, background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 10, padding: '7px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 14 }}>{a.icon}</span>
                      <span style={{ fontFamily: font, fontSize: 11, color: tk.textDim, fontWeight: 600 }}>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 64, opacity: 0.3 }}>🗺️</div>
            <div style={{ fontFamily: font, fontWeight: 700, fontSize: 18, color: tk.textDim }}>{lbl('No favorites yet', 'এখনো কোনো প্রিয় নেই')}</div>
            <div style={{ fontFamily: font, fontSize: 14, color: tk.textFaint, maxWidth: 260, lineHeight: 1.5 }}>
              {lbl('Tap ♥ on any route to save it here.', 'যেকোনো রুটে ♥ চাপুন এখানে সেভ করতে।')}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>
      </div>

      <ConfirmModal
        tk={tk} lang={lang} open={removeTarget !== null}
        title={lbl('Remove favorite?', 'প্রিয় থেকে সরাবেন?')}
        message={lbl('This route will be removed from your favorites.', 'এই রুটটি আপনার প্রিয় থেকে মুছে যাবে।')}
        confirmLabel={lbl('Remove', 'সরান')}
        onConfirm={() => { if (removeTarget !== null) setFavorites((prev) => prev.filter((id) => id !== removeTarget)); setRemoveTarget(null); }}
        onClose={() => setRemoveTarget(null)}
      />
    </PageShell>
  );
}
