import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { ConfirmModal } from '../components/ConfirmModal';
import { Icon } from '../components/Icons';
import { signOutUser } from '../utils/auth';
import { clearUserHistory } from '../../../services/analyticsService';
import { deleteAccount } from '../../services/githubAuthService';

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

function Toggle({ on, onChange, tk, disabled = false }: { on: boolean; onChange: () => void; tk: Tokens; disabled?: boolean }) {
  return (
    <div onClick={disabled ? undefined : onChange} style={{ width: 44, height: 24, borderRadius: 999, cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0, background: on ? tk.primary : tk.panelMuted, border: `1px solid ${on ? tk.primary : tk.line}`, position: 'relative', transition: 'background 0.2s', opacity: disabled ? 0.45 : 1 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 16, height: 16, borderRadius: '50%', background: on ? tk.primaryInk : tk.textFaint, transition: 'left 0.2s' }} />
    </div>
  );
}

function getCurrentUserId(): string {
  try {
    const raw = localStorage.getItem('koyjabo_auth_session');
    return raw ? JSON.parse(raw)?.user?.id || '' : '';
  } catch {
    return '';
  }
}

export function SettingsPage(props: ScreenProps) {
  const { theme, device, lang, onNav, onTheme, onLang } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const font = lang === 'bn' ? BEN : SANS;

  const [notifs, setNotifs] = useState({ reminders: true, alerts: false, news: false, email: false });
  const [privacy, setPrivacy] = useState(() => {
    try {
      return { stats: false, location: localStorage.getItem('koyjabo_share_location') === 'true' };
    } catch {
      return { stats: false, location: false };
    }
  });
  const [status, setStatus] = useState('');
  const [busyDelete, setBusyDelete] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const card: React.CSSProperties = { background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16, overflow: 'hidden', marginBottom: 4 };

  const SectionLabel = ({ label }: { label: string }) => (
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, color: tk.textFaint, padding: '16px 4px 8px', textTransform: 'uppercase', letterSpacing: 1.4 }}>{label}</div>
  );

  const ComingSoon = () => (
    <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 10, color: '#f59e0b', background: 'rgba(245,158,11,.14)', border: '1px solid rgba(245,158,11,.35)', borderRadius: 999, padding: '4px 8px', whiteSpace: 'nowrap' }}>
      {lbl('Coming soon', 'শীঘ্রই আসছে')}
    </span>
  );

  const RowItem = ({ icon, label, sub, right, onClick, danger, disabled }: { icon: string; label: string; sub?: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean; disabled?: boolean }) => (
    <div onClick={disabled ? undefined : onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderTop: `1px solid ${tk.line}`, cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default', opacity: disabled ? 0.62 : 1 }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: danger ? tk.accent : tk.text }}>{label}</div>
        {sub && <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 2 }}>{sub}</div>}
      </div>
      {right ?? <Icon.arrowR s={14} />}
    </div>
  );

  const handleShareLocation = () => {
    const next = !privacy.location;
    if (!next) {
      localStorage.removeItem('koyjabo_last_location');
      localStorage.setItem('koyjabo_share_location', 'false');
      setPrivacy(p => ({ ...p, location: false }));
      setStatus(lbl('Location sharing turned off.', 'লোকেশন শেয়ার বন্ধ হয়েছে।'));
      return;
    }

    if (!navigator.geolocation) {
      setStatus(lbl('Location is not supported on this device.', 'এই ডিভাইসে লোকেশন সাপোর্ট নেই।'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        localStorage.setItem('koyjabo_share_location', 'true');
        localStorage.setItem('koyjabo_last_location', JSON.stringify({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          updatedAt: Date.now(),
        }));
        setPrivacy(p => ({ ...p, location: true }));
        setStatus(lbl('Location sharing turned on.', 'লোকেশন শেয়ার চালু হয়েছে।'));
      },
      () => setStatus(lbl('Location permission denied.', 'লোকেশন অনুমতি দেওয়া হয়নি।')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleClearHistory = () => {
    clearUserHistory();
    setConfirmClear(false);
    setStatus(lbl('Search history cleared.', 'অনুসন্ধান ইতিহাস মুছে ফেলা হয়েছে।'));
  };

  const removeLocalAccountData = (userId: string) => {
    Object.keys(localStorage).forEach(key => {
      if (
        key.includes(userId) ||
        key === 'koyjabo_auth_session' ||
        key === 'koyjabo_share_location' ||
        key === 'koyjabo_last_location'
      ) localStorage.removeItem(key);
    });
  };

  const handleDeleteAccount = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      signOutUser();
      onNav('signin');
      return;
    }
    setBusyDelete(true);
    try {
      const result = await deleteAccount(userId);
      if (!result.success) throw new Error(result.error || lbl('Delete failed.', 'মুছতে ব্যর্থ হয়েছে।'));
      removeLocalAccountData(userId);
      signOutUser();
      setConfirmDelete(false);
      onNav('signin');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : lbl('Delete failed.', 'মুছতে ব্যর্থ হয়েছে।'));
    } finally {
      setBusyDelete(false);
    }
  };

  const groups = [
    {
      title: lbl('Account', 'অ্যাকাউন্ট'),
      items: [
        { icon: '👤', label: lbl('Edit profile', 'প্রোফাইল সম্পাদনা'), sub: lbl('Name, email, phone', 'নাম, ইমেইল, ফোন'), onClick: () => onNav('edit-profile') },
        { icon: '🔐', label: lbl('Password & security', 'পাসওয়ার্ড ও নিরাপত্তা'), sub: lbl('2FA coming soon', '2FA শীঘ্রই আসছে'), onClick: () => onNav('password') },
        { icon: '📱', label: lbl('Devices', 'ডিভাইস'), sub: lbl('1 active', '১টি সক্রিয়'), onClick: () => onNav('devices') },
      ],
    },
    {
      title: lbl('Appearance', 'চেহারা'),
      items: [
        { icon: '🎨', label: lbl('Theme', 'থিম'), sub: theme === 'dark' ? lbl('Dark', 'অন্ধকার') : lbl('Light', 'আলো'), right: <Toggle on={theme === 'dark'} onChange={onTheme} tk={tk} />, onClick: undefined },
        { icon: '🌐', label: lbl('Language', 'ভাষা'), sub: lang === 'bn' ? 'বাংলা' : 'English', right: <Toggle on={lang === 'bn'} onChange={onLang} tk={tk} />, onClick: undefined },
      ],
    },
    {
      title: lbl('Notifications', 'নোটিফিকেশন'),
      items: [
        { icon: '⏰', label: lbl('Trip reminders', 'ট্রিপ রিমাইন্ডার'), right: <Toggle on={notifs.reminders} onChange={() => setNotifs(p => ({ ...p, reminders: !p.reminders }))} tk={tk} />, onClick: undefined },
        { icon: '🚨', label: lbl('Service alerts', 'সেবা সতর্কতা'), sub: lbl('Live alerts are coming soon', 'লাইভ সতর্কতা শীঘ্রই আসছে'), right: <ComingSoon />, disabled: true },
        { icon: '📰', label: lbl('News & updates', 'সংবাদ ও আপডেট'), sub: lbl('Transport news feed is coming soon', 'যাতায়াত সংবাদ ফিড শীঘ্রই আসছে'), right: <ComingSoon />, disabled: true },
        { icon: '✉️', label: lbl('Email notifications', 'ইমেইল নোটিফিকেশন'), sub: lbl('Email preferences are coming soon', 'ইমেইল সেটিংস শীঘ্রই আসছে'), right: <ComingSoon />, disabled: true },
      ],
    },
    {
      title: lbl('Privacy & Data', 'গোপনীয়তা ও ডেটা'),
      items: [
        { icon: '📊', label: lbl('Anonymous usage stats', 'বেনামী ব্যবহার পরিসংখ্যান'), sub: lbl('Privacy controls are coming soon', 'প্রাইভেসি কন্ট্রোল শীঘ্রই আসছে'), right: <ComingSoon />, disabled: true },
        { icon: '📍', label: lbl('Share location', 'অবস্থান শেয়ার'), sub: privacy.location ? lbl('Enabled for nearby stops', 'নিকটবর্তী স্টপের জন্য চালু') : lbl('Off', 'বন্ধ'), right: <Toggle on={privacy.location} onChange={handleShareLocation} tk={tk} />, onClick: handleShareLocation },
        { icon: '🗑', label: lbl('Clear search history', 'অনুসন্ধান ইতিহাস মুছুন'), right: null, onClick: () => setConfirmClear(true) },
        { icon: '⚠️', label: lbl('Delete account', 'অ্যাকাউন্ট মুছুন'), danger: true, right: null, onClick: () => setConfirmDelete(true) },
      ],
    },
    {
      title: lbl('Support', 'সহায়তা'),
      items: [
        { icon: '❓', label: lbl('Q & A', 'প্রশ্নোত্তর'), onClick: () => onNav('qa') },
        { icon: '✉', label: lbl('Contact us', 'যোগাযোগ'), onClick: () => onNav('contact') },
        { icon: '📄', label: lbl('Privacy Policy', 'গোপনীয়তা নীতি'), onClick: () => onNav('privacy') },
        { icon: '🛡', label: lbl('Terms of Service', 'সেবার শর্ত'), onClick: () => onNav('terms') },
        { icon: 'ℹ️', label: lbl('About KoyJabo', 'KoyJabo সম্পর্কে'), onClick: () => onNav('about') },
        { icon: '🆕', label: lbl('Release Notes', 'রিলিজ নোট'), sub: 'v1.5.2', onClick: () => onNav('release') },
      ],
    },
  ];

  return (
    <PageShell {...props} canBack>
      <div style={{ maxWidth: isMobile ? '100%' : 720, margin: '0 auto', padding: isMobile ? '16px 12px 100px' : '24px 40px 60px' }}>

        <h1 style={{ margin: '0 0 4px', fontFamily: font, fontWeight: 700, fontSize: 26, color: tk.text, letterSpacing: -0.5 }}>{lbl('Settings', 'সেটিংস')}</h1>
        <p style={{ margin: '0 0 20px', fontFamily: SANS, fontSize: 13, color: tk.textDim }}>{lbl('Manage your preferences and account', 'আপনার পছন্দ এবং অ্যাকাউন্ট পরিচালনা করুন')}</p>

        {groups.map((g, gi) => (
          <div key={gi}>
            <SectionLabel label={g.title} />
            <div style={card}>
              {g.items.map((item, i) => (
                <RowItem
                  key={i}
                  icon={item.icon}
                  label={item.label}
                  sub={'sub' in item ? item.sub : undefined}
                  right={'right' in item ? item.right : undefined}
                  onClick={'onClick' in item ? item.onClick : undefined}
                  danger={'danger' in item ? item.danger : false}
                  disabled={'disabled' in item ? item.disabled : false}
                />
              ))}
            </div>
          </div>
        ))}

        <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />

        {status && (
          <div style={{ marginTop: 14, background: tk.primarySoft, border: `1px solid ${tk.primary}55`, color: tk.primary, borderRadius: 12, padding: '10px 12px', fontFamily: font, fontSize: 13 }}>
            {status}
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={() => setConfirmSignOut(true)}
          style={{ marginTop: 20, width: '100%', background: tk.accentSoft, color: tk.accent, border: `1px solid ${tk.accent}44`, borderRadius: 12, padding: '14px', fontFamily: font, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          {lbl('Sign out', 'সাইন আউট')}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: SANS, fontSize: 11, color: tk.textFaint }}>
          KoyJabo · v1.5.2 · Build 2026.06.18
        </div>
      </div>

      <ConfirmModal tk={tk} lang={lang} open={confirmClear} title={lbl('Clear search history?', 'অনুসন্ধান ইতিহাস মুছবেন?')} message={lbl('All your search history will be permanently deleted.', 'আপনার সমস্ত অনুসন্ধান ইতিহাস স্থায়ীভাবে মুছে যাবে।')} confirmLabel={lbl('Clear', 'মুছুন')} onConfirm={handleClearHistory} onClose={() => setConfirmClear(false)} />
      <ConfirmModal tk={tk} lang={lang} open={confirmDelete} title={lbl('Delete account?', 'অ্যাকাউন্ট মুছবেন?')} message={lbl('This action is irreversible. Your profile, history, devices and avatar data will be deleted.', 'এই পদক্ষেপ অপরিবর্তনীয়। আপনার প্রোফাইল, ইতিহাস, ডিভাইস ও ছবি ডেটা মুছে যাবে।')} confirmLabel={busyDelete ? lbl('Deleting...', 'মুছে ফেলা হচ্ছে...') : lbl('Delete', 'মুছুন')} onConfirm={handleDeleteAccount} onClose={() => setConfirmDelete(false)} />
      <ConfirmModal tk={tk} lang={lang} open={confirmSignOut} title={lbl('Sign out?', 'সাইন আউট করবেন?')} message={lbl('You will be signed out of your account.', 'আপনি সাইন আউট হয়ে যাবেন।')} confirmLabel={lbl('Sign out', 'সাইন আউট')} onConfirm={() => { signOutUser(); setConfirmSignOut(false); onNav('signin'); }} onClose={() => setConfirmSignOut(false)} />
    </PageShell>
  );
}
