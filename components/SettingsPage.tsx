import React from 'react';
import {
    Settings as SettingsIcon, Sun, Moon, Globe, Mail, ChevronRight,
    Bell, MapPin, Download, User, Shield, Smartphone, CreditCard,
    HelpCircle, MessageSquare, Bug, FileText, Info, Rocket
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
        <div className={`w-9 h-[22px] rounded-full relative transition-colors duration-200 ${on ? 'bg-kj-primary' : 'bg-kj-line'}`}>
            <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-200 ${on ? 'left-[18px]' : 'left-[2px]'}`} />
        </div>
    );
}

const SettingsPage: React.FC<SettingsPageProps> = ({
    isDarkMode, toggleTheme, onContactClick,
    onProfileClick, onPrivacyClick, onTermsClick, onAboutClick,
    onReleaseNotesClick, onInstallClick, embedded = false
}) => {
    const { language, setLanguage, t } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

    const groups = [
        {
            title: lbl('App', 'অ্যাপ'),
            items: [
                {
                    icon: <Globe className="w-4 h-4" />,
                    label: lbl('Language', 'ভাষা'),
                    sub: language === 'bn' ? 'বাংলা' : 'English',
                    action: () => setLanguage(language === 'bn' ? 'en' : 'bn'),
                    arrow: true,
                },
                {
                    icon: isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
                    label: lbl('Theme', 'থিম'),
                    sub: isDarkMode ? lbl('Dark', 'ডার্ক') : lbl('Light', 'লাইট'),
                    action: toggleTheme,
                    toggle: isDarkMode,
                },
                {
                    icon: <Bell className="w-4 h-4" />,
                    label: lbl('Notifications', 'নোটিফিকেশন'),
                    sub: lbl('Trip delays, deals', 'ট্রিপ বিলম্ব, অফার'),
                    toggle: true,
                },
                {
                    icon: <MapPin className="w-4 h-4" />,
                    label: lbl('Location', 'অবস্থান'),
                    sub: lbl('Always', 'সর্বদা'),
                    toggle: true,
                },
                {
                    icon: <Download className="w-4 h-4" />,
                    label: lbl('Offline data', 'অফলাইন ডেটা'),
                    sub: lbl('124 MB downloaded', '১২৪ MB ডাউনলোড করা'),
                    arrow: true,
                },
            ],
        },
        {
            title: lbl('Support', 'সহায়তা'),
            items: [
                {
                    icon: <HelpCircle className="w-4 h-4" />,
                    label: lbl('Q & A', 'প্রশ্নোত্তর'),
                    arrow: true,
                },
                {
                    icon: <Mail className="w-4 h-4" />,
                    label: lbl('Contact us', 'যোগাযোগ'),
                    action: onContactClick,
                    arrow: true,
                },
                {
                    icon: <MessageSquare className="w-4 h-4" />,
                    label: lbl('Send feedback', 'প্রতিক্রিয়া পাঠান'),
                    arrow: true,
                },
                {
                    icon: <Bug className="w-4 h-4" />,
                    label: lbl('Report a bug', 'বাগ রিপোর্ট'),
                    arrow: true,
                },
            ],
        },
        {
            title: lbl('Legal', 'আইনি'),
            items: [
                {
                    icon: <Shield className="w-4 h-4" />,
                    label: lbl('Privacy policy', 'গোপনীয়তা নীতি'),
                    action: onPrivacyClick,
                    arrow: true,
                },
                {
                    icon: <FileText className="w-4 h-4" />,
                    label: lbl('Terms of service', 'সেবার শর্তাবলি'),
                    action: onTermsClick,
                    arrow: true,
                },
                {
                    icon: <Info className="w-4 h-4" />,
                    label: lbl('About KoyJabo', 'অ্যাপ সম্পর্কে'),
                    action: onAboutClick,
                    arrow: true,
                },
                {
                    icon: <Rocket className="w-4 h-4" />,
                    label: lbl('Release notes', 'রিলিজ নোট'),
                    sub: 'v1.4.2',
                    action: onReleaseNotesClick,
                    arrow: true,
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
                <div className="mb-6">
                    <p className="text-[11px] font-bold text-kj-text-faint tracking-[1.4px] uppercase mb-1">{lbl('Settings', 'সেটিংস')}</p>
                    <h1 className="font-bengali font-bold text-[22px] md:text-[28px] text-kj-text tracking-tight">
                        {lbl('Preferences & Options', 'পছন্দ ও বিকল্প')}
                    </h1>
                </div>

                {/* Install PWA card */}
                {onInstallClick && (
                    <button
                        onClick={onInstallClick}
                        className="w-full dc-card kj-glass rounded-[18px] border border-kj-primary/30 p-4 flex items-center gap-3 mb-5 text-left group hover:border-kj-primary/60 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kj-primary to-kj-primary-deep flex items-center justify-center text-kj-primary-ink kj-anim-glow shrink-0">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bengali font-bold text-[14px] text-kj-text">{lbl('Install app', 'অ্যাপ ইনস্টল করুন')}</div>
                            <div className="text-[11px] text-kj-text-dim mt-0.5">{lbl('Works offline · all routes', 'অফলাইনে কাজ করে · সব রুট')}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-kj-text-faint group-hover:text-kj-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                )}

                {groups.map((group, gi) => (
                    <div key={gi} className="mb-5">
                        <p className="text-[10px] font-bold text-kj-text-faint tracking-[1.4px] uppercase mb-2 px-1">{group.title}</p>
                        <div className="dc-card kj-glass rounded-[16px] border border-kj-line overflow-hidden">
                            {group.items.map((item, ii) => (
                                <button
                                    key={ii}
                                    onClick={item.action || undefined}
                                    disabled={!item.action && item.toggle === undefined}
                                    className={`w-full flex items-center gap-3 px-[14px] py-[13px] text-left transition-colors ${ii > 0 ? 'border-t border-kj-line' : ''} ${item.action ? 'hover:bg-kj-chip-bg/60 cursor-pointer' : 'cursor-default'}`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-kj-chip-bg text-kj-text flex items-center justify-center shrink-0">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bengali font-semibold text-[14px] text-kj-text">{item.label}</div>
                                        {item.sub && <div className="text-[11px] text-kj-text-faint mt-0.5">{item.sub}</div>}
                                    </div>
                                    {item.toggle !== undefined ? (
                                        <ToggleSwitch on={item.toggle} />
                                    ) : item.arrow ? (
                                        <ChevronRight className="w-[14px] h-[14px] text-kj-text-faint shrink-0" />
                                    ) : null}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="text-center mt-4 mb-2 text-[11px] text-kj-text-faint font-sans">
                    KoyJabo · v1.4.2 · Build 2412.28
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
