import React, { useEffect, useMemo, useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { ConfirmModal } from '../components/ConfirmModal';
import { BUS_DATA } from '../../../constants';
import { getFavoriteBusIds, setFavoriteBusIds } from '../utils/favorites';

interface ScreenProps {
  theme: 'dark' | 'light';
  device: 'desktop' | 'mobile';
  lang: 'bn' | 'en';
  route: string;
  canBack: boolean;
  onNav: (r: string, p?: Record<string, string>) => void;
  onBack: () => void;
  onLang: () => void;
  onTheme: () => void;
  onMenu: () => void;
}

type FilterMode = 'All' | 'Bus';

export function FavoritesPage(props: ScreenProps) {
  const { theme, device, lang, onNav } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const font = lang === 'bn' ? BEN : SANS;
  const card: React.CSSProperties = { background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16, padding: 16 };

  const [filter, setFilter] = useState<FilterMode>('All');
  const [favoriteIds, setFavoriteIdsState] = useState<string[]>(() => getFavoriteBusIds());
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setFavoriteIdsState(getFavoriteBusIds());
    window.addEventListener('koyjabo:favorites-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('koyjabo:favorites-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const favorites = useMemo(
    () => favoriteIds.map(id => BUS_DATA.find(bus => bus.id === id)).filter((bus): bus is typeof BUS_DATA[number] => !!bus),
    [favoriteIds],
  );
  const visible = filter === 'Bus' ? favorites : favorites;

  const removeFavorite = (id: string) => {
    const next = favoriteIds.filter(item => item !== id);
    setFavoriteBusIds(next);
    setFavoriteIdsState(next);
    setRemoveTarget(null);
  };

  return (
    <PageShell {...props} canBack>
      <div style={{ maxWidth: isMobile ? '100%' : 760, margin: '0 auto', padding: isMobile ? '16px 12px 100px' : '32px 16px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontFamily: font, fontWeight: 700, fontSize: 24, color: tk.text }}>
            {lbl('Favorites', 'প্রিয়')}
          </h1>
          <div style={{ background: tk.primarySoft, border: `1px solid ${tk.primary}44`, borderRadius: 999, padding: '2px 10px', fontFamily: SANS, fontWeight: 700, fontSize: 13, color: tk.primary }}>
            {favorites.length}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['All', 'Bus'] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? tk.primarySoft : tk.panelMuted,
                border: `1px solid ${filter === f ? tk.primary : tk.line}`,
                borderRadius: 999,
                padding: '6px 14px',
                fontFamily: font,
                fontWeight: 600,
                fontSize: 12,
                color: filter === f ? tk.primary : tk.textDim,
                cursor: 'pointer',
              }}
            >
              {lbl(f, f === 'All' ? 'সব' : 'বাস')}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visible.map((bus) => {
              const initials = bus.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={bus.id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
                  <button
                    onClick={() => onNav('bus-detail', { busId: bus.id })}
                    style={{ width: '100%', padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 0, textAlign: 'left', cursor: 'pointer' }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: tk.primarySoft, border: `1px solid ${tk.primary}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 13, color: tk.primary, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: font, fontWeight: 700, fontSize: 14, color: tk.text }}>{lang === 'bn' ? bus.bnName : bus.name}</div>
                      <div style={{ fontFamily: BEN, fontSize: 12, color: tk.textDim, marginTop: 2 }}>{bus.routeString}</div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 4 }}>{bus.type} · {bus.hours}</div>
                    </div>
                  </button>
                  <div style={{ borderTop: `1px solid ${tk.line}`, padding: '10px 16px', display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setRemoveTarget(bus.id)}
                      style={{ background: tk.accentSoft, border: `1px solid ${tk.accent}44`, borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: tk.accent, fontFamily: font, fontSize: 12, fontWeight: 700 }}
                    >
                      ♥ {lbl('Remove', 'সরান')}
                    </button>
                    <button
                      onClick={() => onNav('bus-detail', { busId: bus.id })}
                      style={{ flex: 1, background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: tk.text, fontFamily: font, fontSize: 12, fontWeight: 700 }}
                    >
                      {lbl('View details', 'বিস্তারিত')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', gap: 12, textAlign: 'center' }}>
            <div style={{ fontFamily: font, fontWeight: 700, fontSize: 18, color: tk.textDim }}>{lbl('No favorites yet', 'এখনো কোনো প্রিয় নেই')}</div>
            <div style={{ fontFamily: font, fontSize: 14, color: tk.textFaint, maxWidth: 300, lineHeight: 1.5 }}>
              {lbl('Tap the heart on a real bus route to save it here.', 'বাস রুটের হার্ট চাপলে এখানে সেভ হবে।')}
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
        message={lbl('This bus will be removed from your favorites.', 'এই বাসটি আপনার প্রিয় থেকে মুছে যাবে।')}
        confirmLabel={lbl('Remove', 'সরান')}
        onConfirm={() => removeTarget && removeFavorite(removeTarget)}
        onClose={() => setRemoveTarget(null)}
      />
    </PageShell>
  );
}
