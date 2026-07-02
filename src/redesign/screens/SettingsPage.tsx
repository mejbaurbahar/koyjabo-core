import React, { useState } from 'react';
import { STATIONS } from '../../../constants';
import { KJ_TOKENS, T, SANS, BEN, Tokens } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot, NativeAdCard } from '../components/AdSlot';
import { ConfirmModal } from '../components/ConfirmModal';
import { Icon } from '../components/Icons';

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

function Toggle({ on, onChange, tk }: { on: boolean; onChange: () => void; tk: Tokens }) {
  return (
    <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 999, cursor: 'pointer', flexShrink: 0, background: on ? tk.primary : tk.panelMuted, border: `1px solid ${on ? tk.primary : tk.line}`, position: 'relative', transition: 'background 0.2s' }}>
      <div style={{ position: 'absolute', top: 3, left: 3, width: 16, height: 16, borderRadius: '50%', background: on ? tk.primaryInk : tk.textFaint, transform: `translateX(${on ? 19 : 0}px)`, transition: 'transform 0.2s' }} />
    </div>
  );
}

export function SettingsPage(props: ScreenProps) {
  const { theme, device, lang, onNav, onTheme, onLang } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const font = lang === 'bn' ? BEN : SANS;

  const [notifs, setNotifs] = useState({ reminders: true, alerts: true, news: false, email: false });
  const [privacy, setPrivacy] = useState({
    stats: true,
    location: localStorage.getItem('kj-location-consent') === 'yes',
  });

  function handleLocationToggle() {
    const next = !privacy.location;
    setPrivacy(p => ({ ...p, location: next }));
    if (next) {
      localStorage.setItem('kj-location-consent', 'yes');
      navigator.geolocation?.getCurrentPosition(
        pos => {
          const {latitude:lat,longitude:lng} = pos.coords;
          const stList = Object.values(STATIONS).filter((s:any)=>s.lat&&s.lng);
          let best:any=stList[0],bestD=Infinity;
          for(const s of stList as any[]){const d=(s.lat-lat)**2+(s.lng-lng)**2;if(d<bestD){bestD=d;best=s;}}
          localStorage.setItem('kj-location-area', best?.name||'Dhaka');
        },
        () => {},
        { timeout: 8000, maximumAge: 0 }
      );
    } else {
      localStorage.setItem('kj-location-consent', 'no');
      localStorage.removeItem('kj-location-area');
    }
  }
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const card: React.CSSProperties = { background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16, overflow: 'hidden', marginBottom: 4 };

  const SectionLabel = ({ label }: { label: string }) => (
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, color: tk.textFaint, padding: '16px 4px 8px', textTransform: 'uppercase', letterSpacing: 1.4 }}>{label}</div>
  );

  const RowItem = ({ icon, label, sub, right, onClick, danger }: { icon: string; label: string; sub?: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderTop: `1px solid ${tk.line}`, cursor: onClick ? 'pointer' : 'default' }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: font, fontSize: 14, fontWeight: 500, color: danger ? tk.accent : tk.text }}>{label}</div>
        {sub && <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, marginTop: 2 }}>{sub}</div>}
      </div>
      {right ?? <Icon.arrowR s={14} />}
    </div>
  );

  const groups = [
    {
      title: lbl('Account', 'অ্যাকাউন্ট'),
      items: [
        { icon: '👤', label: lbl('Edit profile', 'প্রোফাইল সম্পাদনা'), sub: lbl('Name, email, phone', 'নাম, ইমেইল, ফোন'), onClick: () => onNav('edit-profile') },
        { icon: '🔐', label: lbl('Password & security', 'পাসওয়ার্ড ও নিরাপত্তা'), sub: lbl('2FA enabled', '2FA চালু'), onClick: () => onNav('password') },
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
        { icon: '🚨', label: lbl('Service alerts', 'সেবা সতর্কতা'), right: <Toggle on={notifs.alerts} onChange={() => setNotifs(p => ({ ...p, alerts: !p.alerts }))} tk={tk} />, onClick: undefined },
        { icon: '📰', label: lbl('News & updates', 'সংবাদ ও আপডেট'), right: <Toggle on={notifs.news} onChange={() => setNotifs(p => ({ ...p, news: !p.news }))} tk={tk} />, onClick: undefined },
        { icon: '✉️', label: lbl('Email notifications', 'ইমেইল নোটিফিকেশন'), right: <Toggle on={notifs.email} onChange={() => setNotifs(p => ({ ...p, email: !p.email }))} tk={tk} />, onClick: undefined },
      ],
    },
    {
      title: lbl('Privacy & Data', 'গোপনীয়তা ও ডেটা'),
      items: [
        { icon: '📊', label: lbl('Anonymous usage stats', 'বেনামী ব্যবহার পরিসংখ্যান'), right: <Toggle on={privacy.stats} onChange={() => setPrivacy(p => ({ ...p, stats: !p.stats }))} tk={tk} />, onClick: undefined },
        { icon: '📍', label: lbl('Location for AI & nearby buses', 'AI ও কাছের বাসের জন্য অবস্থান'), sub: privacy.location ? lbl('Active – detecting location', 'সক্রিয় – অবস্থান শনাক্ত হচ্ছে') : lbl('Off – enable for smarter results', 'বন্ধ – চালু করলে ভালো ফলাফল পাবেন'), right: <Toggle on={privacy.location} onChange={handleLocationToggle} tk={tk} />, onClick: undefined },
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
                />
              ))}
            </div>
          </div>
        ))}

        <NativeAdCard
          tk={tk}
          lang={lang}
          kind={isMobile ? 'mob-banner' : 'leaderboard'}
          title={lbl('Personalized offers', 'ব্যক্তিগত অফার')}
          icon="🎯"
        />

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
          <NativeAdCard
            tk={tk}
            lang={lang}
            kind="multiplex"
            title={lbl('More like this', 'আরও দেখুন')}
            subtitle={lbl('Travel & transport', 'ভ্রমণ ও পরিবহন')}
            icon="🧭"
          />
      </div>

      <ConfirmModal tk={tk} lang={lang} open={confirmClear} title={lbl('Clear search history?', 'অনুসন্ধান ইতিহাস মুছবেন?')} message={lbl('All your search history will be permanently deleted.', 'আপনার সমস্ত অনুসন্ধান ইতিহাস স্থায়ীভাবে মুছে যাবে।')} confirmLabel={lbl('Clear', 'মুছুন')} onConfirm={() => setConfirmClear(false)} onClose={() => setConfirmClear(false)} />
      <ConfirmModal tk={tk} lang={lang} open={confirmDelete} title={lbl('Delete account?', 'অ্যাকাউন্ট মুছবেন?')} message={lbl('This action is irreversible. All your data will be permanently deleted.', 'এই পদক্ষেপ অপরিবর্তনীয়।')} confirmLabel={lbl('Delete', 'মুছুন')} onConfirm={() => setConfirmDelete(false)} onClose={() => setConfirmDelete(false)} />
      <ConfirmModal tk={tk} lang={lang} open={confirmSignOut} title={lbl('Sign out?', 'সাইন আউট করবেন?')} message={lbl('You will be signed out of your account.', 'আপনি সাইন আউট হয়ে যাবেন।')} confirmLabel={lbl('Sign out', 'সাইন আউট')} onConfirm={() => { setConfirmSignOut(false); onNav('signin'); }} onClose={() => setConfirmSignOut(false)} />
    </PageShell>
  );
}
