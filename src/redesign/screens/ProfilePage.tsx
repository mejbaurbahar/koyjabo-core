import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens, Lang } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { ConfirmModal } from '../components/ConfirmModal';
import { Icon } from '../components/Icons';
import { SectionHeader } from '../components/SectionHeader';
import { getUserHistory } from '../../../services/analyticsService';
import { getAuthUser } from '../../../services/communityDataService';
import { getFavoriteBusIds } from '../utils/favorites';
import { signOutUser } from '../utils/auth';

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

const SETTINGS_SHORTCUTS = [
  { icon: <Icon.bell s={16}/>, label: 'Notifications', labelBn: 'নোটিফিকেশন', sub: 'Delays, deals', subBn: 'বিলম্ব, অফার', route: 'settings' },
  { icon: <Icon.globe s={16}/>, label: 'Language', labelBn: 'ভাষা', sub: 'English', subBn: 'বাংলা', route: 'settings' },
  { icon: <Icon.moon s={16}/>, label: 'Theme', labelBn: 'থিম', sub: 'Dark mode', subBn: 'ডার্ক মোড', route: 'settings' },
  { icon: <Icon.download s={16}/>, label: 'Offline data', labelBn: 'অফলাইন ডেটা', sub: '124 MB', subBn: '১২৪ এমবি', route: 'settings' },
  { icon: <Icon.user s={16}/>, label: 'Privacy', labelBn: 'গোপনীয়তা', sub: 'Location sharing', subBn: 'লোকেশন শেয়ার', route: 'settings' },
];

export function ProfilePage(props: ScreenProps) {
  const { theme, device, lang, onNav } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const font = lang === 'bn' ? BEN : SANS;
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const user = getAuthUser();
  const history = getUserHistory();
  const favoriteCount = getFavoriteBusIds().length;
  const recentRecords = [
    ...(history.routeSearches || []).map(item => ({ type: lbl('Route search', 'রুট সার্চ'), title: `${item.from || lbl('Any', 'যেকোনো')} → ${item.to || lbl('Any', 'যেকোনো')}`, time: item.timestamp })),
    ...(history.busSearches || []).map(item => ({ type: lbl('Bus opened', 'বাস দেখা'), title: item.busName, time: item.timestamp })),
    ...(history.trainSearches || []).map(item => ({ type: lbl('Train search', 'ট্রেন সার্চ'), title: `${item.trainName} · ${item.from} → ${item.to}`, time: item.timestamp })),
    ...(history.intercitySearches || []).map(item => ({ type: lbl('Intercity search', 'আন্তঃজেলা সার্চ'), title: `${item.from} → ${item.to}`, time: item.timestamp })),
  ].sort((a, b) => b.time - a.time).slice(0, 5);
  const totalSearches = (history.routeSearches || []).length + (history.busSearches || []).length + (history.trainSearches || []).length + (history.intercitySearches || []).length;

  const card: React.CSSProperties = { background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16, overflow: 'hidden' };

  const STATS = [
    { label: lbl('Searches', 'সার্চ'), value: String(totalSearches) },
    { label: lbl('Favorites', 'প্রিয়'), value: String(favoriteCount) },
    { label: lbl('Buses opened', 'বাস দেখা'), value: String((history.busSearches || []).length) },
    { label: lbl('Routes searched', 'রুট সার্চ'), value: String((history.routeSearches || []).length) },
  ];

  return (
    <PageShell {...props} canBack={false}>
      <div style={{ padding: isMobile ? '16px 12px 100px' : '24px 40px 60px' }}>

        {/* Hero card */}
        <div style={{
          background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 22,
          padding: isMobile ? 18 : 24, marginBottom: 24,
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center', gap: 18,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -40, width: 200, height: 200, borderRadius: 999, background: `radial-gradient(circle, ${tk.primarySoft}, transparent 70%)`, pointerEvents: 'none' }} />
          {/* Avatar */}
          <div style={{
            width: 76, height: 76, borderRadius: 999, flexShrink: 0,
            background: `linear-gradient(135deg, ${tk.primary}, ${tk.primaryDeep})`,
            color: tk.primaryInk, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: SANS, fontWeight: 800, fontSize: 28,
            boxShadow: `0 0 24px ${tk.primary}44`,
          }}>{(user?.displayName || user?.username || 'KJ').slice(0, 2).toUpperCase()}</div>
          {/* Info */}
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <div style={{ fontFamily: font, fontWeight: 700, fontSize: 22, color: tk.text, letterSpacing: -0.4 }}>
              {user?.displayName || user?.username || lbl('Guest user', 'অতিথি ব্যবহারকারী')}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: tk.textDim, marginTop: 4 }}>{user ? `@${user.username}` : lbl('Sign in to sync your profile data', 'প্রোফাইল ডেটা সিঙ্ক করতে সাইন ইন করুন')}</div>
            <div style={{ display: 'flex', gap: isMobile ? 16 : 28, marginTop: 14, flexWrap: 'wrap' }}>
              {STATS.map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20, color: tk.text, letterSpacing: -0.5 }}>{s.value}</div>
                  <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: tk.textFaint, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Edit button */}
          <button
            onClick={() => onNav('edit-profile')}
            style={{ background: tk.panelMuted, border: `1px solid ${tk.line}`, borderRadius: 10, padding: '10px 18px', fontFamily: SANS, fontWeight: 600, fontSize: 13, color: tk.text, cursor: 'pointer', flexShrink: 0 }}
          >
            {lbl('Edit profile', 'প্রোফাইল সম্পাদনা')}
          </button>
        </div>

        {/* Two-column content on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: 24 }}>

          {/* LEFT: Trip history */}
          <div>
            <SectionHeader tk={tk} lang={lang} title={lbl('Recent activity', 'সাম্প্রতিক কার্যকলাপ')} />
            <div style={card}>
              {recentRecords.length > 0 ? recentRecords.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderTop: i ? `1px solid ${tk.line}` : '' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: tk.panelMuted, border: `1px solid ${tk.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: tk.text, lineHeight: 1 }}>•</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: font, fontWeight: 600, fontSize: 14, color: tk.text }}>{item.title}</div>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 3 }}>{item.type}</div>
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint }}>{new Date(item.time).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</div>
                </div>
              )) : (
                <div style={{ padding: 24, textAlign: 'center', fontFamily: font, color: tk.textDim, fontSize: 14 }}>
                  {lbl('No real activity yet. Searches and saved buses will appear here.', 'এখনো কোনো আসল কার্যকলাপ নেই। সার্চ ও সেভ করা বাস এখানে দেখা যাবে।')}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 20 }}>
              {[
                { icon: '❤', label: lbl('Favorites', 'প্রিয়'), route: 'favorites' },
                { icon: '📊', label: lbl('History', 'ইতিহাস'), route: 'history' },
                { icon: '⚙', label: lbl('Settings', 'সেটিংস'), route: 'settings' },
                { icon: '🚪', label: lbl('Sign out', 'সাইন আউট'), route: '' },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => a.route ? onNav(a.route) : setConfirmSignOut(true)}
                  style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14, padding: '14px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <span style={{ fontFamily: font, fontSize: 11, color: tk.textDim, fontWeight: 600 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Settings shortcuts + account nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Settings shortcuts */}
            <div style={card}>
              {SETTINGS_SHORTCUTS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onNav(s.route)}
                  style={{ width: '100%', background: 'none', border: 'none', borderTop: i ? `1px solid ${tk.line}` : '', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: tk.chipBg, color: tk.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: font, fontWeight: 600, fontSize: 13, color: tk.text }}>{lbl(s.label, s.labelBn)}</div>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 1 }}>{lbl(s.sub, s.subBn)}</div>
                  </div>
                  <Icon.arrowR s={14}/>
                </button>
              ))}
            </div>

            {/* Account nav */}
            <div style={card}>
              {[
                { label: lbl('Edit profile', 'প্রোফাইল সম্পাদনা'), route: 'edit-profile', icon: '👤' },
                { label: lbl('Password & security', 'পাসওয়ার্ড ও নিরাপত্তা'), route: 'password', icon: '🔐' },
                { label: lbl('Devices', 'ডিভাইস'), route: 'devices', icon: '📱' },
                { label: lbl('Sign out', 'সাইন আউট'), route: '__signout', icon: '🚪', danger: true },
              ].map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => item.route === '__signout' ? setConfirmSignOut(true) : onNav(item.route)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'none', border: 'none', borderTop: i ? `1px solid ${tk.line}` : '', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontFamily: font, fontSize: 14, color: item.danger ? tk.accent : tk.text, fontWeight: 500 }}>{item.label}</span>
                  {!item.danger && <Icon.arrowR s={14}/>}
                </button>
              ))}
            </div>

            <AdSlot tk={tk} lang={lang} kind="mid-rect" />
          </div>
        </div>
      </div>

      <ConfirmModal
        tk={tk} lang={lang} open={confirmSignOut}
        title={lbl('Sign out?', 'সাইন আউট করবেন?')}
        message={lbl('You will be signed out of your account.', 'আপনি আপনার অ্যাকাউন্ট থেকে সাইন আউট হয়ে যাবেন।')}
        confirmLabel={lbl('Sign out', 'সাইন আউট')}
        onConfirm={() => { signOutUser(); setConfirmSignOut(false); onNav('signin'); }}
        onClose={() => setConfirmSignOut(false)}
      />
    </PageShell>
  );
}
