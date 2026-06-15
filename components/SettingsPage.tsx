import React from 'react';
import { ChevronRight, LogOut, Smartphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SponsoredAdSlot from './SponsoredAdSlot';

interface SettingsPageProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    onContactClick: () => void;
    onProfileClick?: () => void;
    onPrivacyClick?: () => void;
    onTermsClick?: () => void;
    onAboutClick?: () => void;
    onReleaseNotesClick?: () => void;
    onInstallClick?: () => void;
    embedded?: boolean;
}

function ToggleSwitch({ on }: { on: boolean }) {
    return (
        <div className={`w-9 h-[22px] rounded-full relative transition-colors duration-200 shrink-0 ${on ? 'bg-kj-primary' : 'bg-kj-line'}`}>
            <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-200 ${on ? 'left-[18px]' : 'left-[2px]'}`} />
        </div>
    );
}

function Pill({ label }: { label: string }) {
    return (
        <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans shrink-0"
            style={{ background: 'var(--kj-primary-soft)', color: 'var(--kj-primary)' }}
        >
            {label}
        </span>
    );
}

const SettingsPage: React.FC<SettingsPageProps> = ({
    isDarkMode, toggleTheme, onContactClick,
    onProfileClick, onPrivacyClick, onTermsClick, onAboutClick,
    onReleaseNotesClick, onInstallClick, embedded = false
}) => {
    const { language, setLanguage } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

    type RowRight =
        | { kind: 'toggle'; on: boolean }
        | { kind: 'pill'; label: string }
        | { kind: 'arrow' }
        | { kind: 'none' };

    interface Row {
        emoji: string;
        label: string;
        sub?: string;
        action?: () => void;
        right: RowRight;
    }

    interface Group {
        title: string;
        rows: Row[];
    }

    const groups: Group[] = [
        {
            title: lbl('Account', 'অ্যাকাউন্ট'),
            rows: [
                {
                    emoji: '👤',
                    label: lbl('Profile', 'প্রোফাইল'),
                    sub: lbl('Mejbaur Bahar Fagun · mejbaur@markopolo.ai', 'মেজবাউর বাহার ফাগুন · +880 17XX-XXXXXX'),
                    action: onProfileClick,
                    right: { kind: 'arrow' },
                },
                {
                    emoji: '🔒',
                    label: lbl('Password & Security', 'পাসওয়ার্ড ও নিরাপত্তা'),
                    sub: lbl('Two-factor auth', 'দ্বি-স্তর যাচাইকরণ'),
                    right: { kind: 'pill', label: lbl('2FA On', '২এফএ চালু') },
                },
                {
                    emoji: '💻',
                    label: lbl('Devices', 'ডিভাইস'),
                    sub: lbl('3 active sessions', '৩টি সক্রিয় সেশন'),
                    right: { kind: 'arrow' },
                },
                {
                    emoji: '💳',
                    label: lbl('Payment Methods', 'পেমেন্ট পদ্ধতি'),
                    sub: lbl('bKash · Visa ··4521', 'বিকাশ · ভিসা ··৪৫২১'),
                    right: { kind: 'arrow' },
                },
            ],
        },
        {
            title: lbl('App', 'অ্যাপ'),
            rows: [
                {
                    emoji: '🌐',
                    label: lbl('Language', 'ভাষা'),
                    sub: language === 'bn' ? 'বাংলা' : 'English',
                    action: () => setLanguage(language === 'bn' ? 'en' : 'bn'),
                    right: { kind: 'arrow' },
                },
                {
                    emoji: '🎨',
                    label: lbl('Theme', 'থিম'),
                    sub: isDarkMode ? lbl('Dark mode', 'ডার্ক মোড') : lbl('Light mode', 'লাইট মোড'),
                    action: toggleTheme,
                    right: { kind: 'toggle', on: isDarkMode },
                },
                {
                    emoji: '🔔',
                    label: lbl('Notifications', 'নোটিফিকেশন'),
                    sub: lbl('Trip delays, deals & alerts', 'ট্রিপ বিলম্ব, অফার ও সতর্কতা'),
                    right: { kind: 'toggle', on: true },
                },
                {
                    emoji: '📍',
                    label: lbl('Location', 'অবস্থান'),
                    sub: lbl('Always · for route suggestions', 'সর্বদা · রুট পরামর্শের জন্য'),
                    right: { kind: 'toggle', on: true },
                },
                {
                    emoji: '📥',
                    label: lbl('Offline Data', 'অফলাইন ডেটা'),
                    sub: lbl('124 MB / 500 MB used', '১২৪ MB / ৫০০ MB ব্যবহৃত'),
                    right: { kind: 'arrow' },
                },
                {
                    emoji: '📊',
                    label: lbl('Data Saver', 'ডেটা সেভার'),
                    sub: lbl('Reduce image quality on mobile data', 'মোবাইল ডেটায় ছবির মান কমান'),
                    right: { kind: 'toggle', on: false },
                },
            ],
        },
        {
            title: lbl('Support', 'সহায়তা'),
            rows: [
                {
                    emoji: '❓',
                    label: lbl('Q & A', 'প্রশ্নোত্তর'),
                    sub: lbl('Frequently asked questions', 'সচরাচর জিজ্ঞাসা'),
                    right: { kind: 'arrow' },
                },
                {
                    emoji: '✉️',
                    label: lbl('Contact Us', 'যোগাযোগ করুন'),
                    sub: lbl('Email & phone support', 'ইমেইল ও ফোন সহায়তা'),
                    action: onContactClick,
                    right: { kind: 'arrow' },
                },
                {
                    emoji: '📝',
                    label: lbl('Send Feedback', 'প্রতিক্রিয়া পাঠান'),
                    sub: lbl('Help us improve KoyJabo', 'কয়জাবো উন্নত করতে সাহায্য করুন'),
                    right: { kind: 'arrow' },
                },
                {
                    emoji: '🐛',
                    label: lbl('Report a Bug', 'বাগ রিপোর্ট করুন'),
                    sub: lbl('Found something broken?', 'কিছু ভাঙা পেয়েছেন?'),
                    right: { kind: 'arrow' },
                },
            ],
        },
        {
            title: lbl('Legal', 'আইনি'),
            rows: [
                {
                    emoji: '🛡️',
                    label: lbl('Privacy Policy', 'গোপনীয়তা নীতি'),
                    action: onPrivacyClick,
                    right: { kind: 'arrow' },
                },
                {
                    emoji: '📄',
                    label: lbl('Terms of Service', 'সেবার শর্তাবলি'),
                    action: onTermsClick,
                    right: { kind: 'arrow' },
                },
                {
                    emoji: 'ℹ️',
                    label: lbl('About KoyJabo', 'কয়জাবো সম্পর্কে'),
                    action: onAboutClick,
                    right: { kind: 'arrow' },
                },
                {
                    emoji: '🆕',
                    label: lbl('Release Notes', 'রিলিজ নোট'),
                    sub: 'v1.4.2',
                    action: onReleaseNotesClick,
                    right: { kind: 'arrow' },
                },
            ],
        },
    ];

    return (
        <div
            className={`flex flex-col flex-1 min-h-0 w-full max-h-full bg-transparent px-4 sm:px-6 md:px-10 py-4 pb-24 md:pb-12 overflow-y-auto overscroll-y-contain touch-pan-y ${embedded ? '' : 'md:pt-8'}`}
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            <div className="max-w-2xl mx-auto w-full">

                {/* Page header */}
                <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans mb-1">
                        ✦ KoyJabo · {lbl('Preferences', 'পছন্দসমূহ')}
                    </p>
                    <h1 className="font-bengali font-bold leading-tight tracking-tight text-kj-text" style={{ fontSize: 26 }}>
                        <span className="font-bengali">সেটিংস</span>
                        <span className="text-kj-text-dim font-sans font-bold text-xl"> / </span>
                        <span className="font-sans">Settings</span>
                    </h1>
                </div>

                {/* Install PWA card */}
                {onInstallClick && (
                    <button
                        onClick={onInstallClick}
                        className="w-full dc-card rounded-[18px] border border-kj-primary/30 p-4 flex items-center gap-3 mb-5 text-left group hover:border-kj-primary/60 transition-colors"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-kj-primary-ink kj-anim-glow shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}
                        >
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bengali font-bold text-[14px] text-kj-text">
                                {lbl('Install App', 'অ্যাপ ইনস্টল করুন')}
                            </div>
                            <div className="text-[11px] text-kj-text-dim mt-0.5 font-bengali">
                                {lbl('Works offline · all routes', 'অফলাইনে কাজ করে · সব রুট')}
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-kj-text-faint group-hover:text-kj-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                )}

                {/* Account & App sections */}
                {groups.slice(0, 2).map((group, gi) => (
                    <div key={gi} className="mb-5">
                        <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans px-1 mb-2">
                            {group.title}
                        </p>
                        <div className="dc-card rounded-[16px] overflow-hidden divide-y divide-kj-line">
                            {group.rows.map((row, ri) => (
                                <button
                                    key={ri}
                                    onClick={row.action || undefined}
                                    disabled={!row.action && row.right.kind === 'none'}
                                    className={`w-full flex items-center gap-3 px-[14px] py-[13px] text-left transition-colors ${row.action ? 'hover:bg-kj-chip-bg/60 cursor-pointer active:bg-kj-chip-bg' : 'cursor-default'}`}
                                >
                                    <span className="text-xl shrink-0 leading-none">{row.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bengali font-semibold text-[14px] text-kj-text leading-snug">
                                            {row.label}
                                        </div>
                                        {row.sub && (
                                            <div className="text-[11px] text-kj-text-faint mt-0.5 font-bengali truncate">
                                                {row.sub}
                                            </div>
                                        )}
                                    </div>
                                    {row.right.kind === 'toggle' && <ToggleSwitch on={row.right.on} />}
                                    {row.right.kind === 'pill' && <Pill label={row.right.label} />}
                                    {row.right.kind === 'arrow' && (
                                        <ChevronRight className="w-[14px] h-[14px] text-kj-text-faint shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Ad slot in the middle */}
                <div className="mb-5">
                    <SponsoredAdSlot language={language} size="300x250" compact />
                </div>

                {/* Support & Legal sections */}
                {groups.slice(2).map((group, gi) => (
                    <div key={gi + 2} className="mb-5">
                        <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans px-1 mb-2">
                            {group.title}
                        </p>
                        <div className="dc-card rounded-[16px] overflow-hidden divide-y divide-kj-line">
                            {group.rows.map((row, ri) => (
                                <button
                                    key={ri}
                                    onClick={row.action || undefined}
                                    disabled={!row.action && row.right.kind === 'none'}
                                    className={`w-full flex items-center gap-3 px-[14px] py-[13px] text-left transition-colors ${row.action ? 'hover:bg-kj-chip-bg/60 cursor-pointer active:bg-kj-chip-bg' : 'cursor-default'}`}
                                >
                                    <span className="text-xl shrink-0 leading-none">{row.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bengali font-semibold text-[14px] text-kj-text leading-snug">
                                            {row.label}
                                        </div>
                                        {row.sub && (
                                            <div className="text-[11px] text-kj-text-faint mt-0.5 font-bengali truncate">
                                                {row.sub}
                                            </div>
                                        )}
                                    </div>
                                    {row.right.kind === 'toggle' && <ToggleSwitch on={row.right.on} />}
                                    {row.right.kind === 'pill' && <Pill label={row.right.label} />}
                                    {row.right.kind === 'arrow' && (
                                        <ChevronRight className="w-[14px] h-[14px] text-kj-text-faint shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Sign out */}
                <button className="w-full dc-card rounded-[16px] border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 py-3.5 mb-5">
                    <LogOut className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="font-bengali font-bold text-[14px] text-red-400">
                        {lbl('Sign Out', 'সাইন আউট')}
                    </span>
                </button>

                {/* Version footer */}
                <p className="text-center text-[11px] text-kj-text-faint font-sans mb-2">
                    KoyJabo · v2.5.0 · Build 2412.28
                </p>

            </div>
        </div>
    );
};

export default SettingsPage;
