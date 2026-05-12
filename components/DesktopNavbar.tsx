import React from 'react';
import { Home, Map, Bot, Heart, Info, Train, Menu, Sparkles, Navigation, Clock, MapPin, User, LogIn, Bus, BookOpen, Rocket } from 'lucide-react';
import { AppView } from '../types';
import ThemeToggle from './ThemeToggle';
import { AnimatedLogo } from './AnimatedLogo';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../src/contexts/AuthContext';

interface DesktopNavbarProps {
    view: AppView;
    setView: (view: AppView) => void;
    primarySearch: 'LOCAL' | 'INTERCITY';
    setPrimarySearch: (mode: 'LOCAL' | 'INTERCITY') => void;
    listFilter: 'ALL' | 'FAVORITES';
    setListFilter: (filter: 'ALL' | 'FAVORITES') => void;
    onOpenMenu: () => void;
    onOpenLiveMap?: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
    isInDhaka: boolean;
}

export const DesktopNavbar: React.FC<DesktopNavbarProps> = ({
    view,
    setView,
    primarySearch,
    setPrimarySearch,
    listFilter,
    setListFilter,
    onOpenMenu,
    onOpenLiveMap,

    isDarkMode,
    toggleTheme,
    isInDhaka
}) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();

    // Navbar should be visible on all views for desktop now
    // if (view === AppView.BUS_DETAILS || view === AppView.LIVE_NAV) {
    //   return null;
    // }

    const navItems = [
        {
            label: isInDhaka ? t('nav.home') : t('nav.home'),
            icon: Home,
            isActive: view === AppView.HOME && primarySearch === 'LOCAL' && listFilter !== 'FAVORITES',
            onClick: () => {
                setView(AppView.HOME);
                setPrimarySearch('LOCAL');
                setListFilter('ALL');
            }
        },
        {
            label: t('intercity.title'),
            icon: Bus,
            // Active when outside Dhaka and in intercity search mode (main app intercity view)
            isActive: !isInDhaka && view === AppView.HOME && primarySearch === 'INTERCITY',
            onClick: () => {
                if (!isInDhaka) {
                    // Outside Dhaka: show intercity search within the main app
                    setView(AppView.HOME);
                    setPrimarySearch('INTERCITY');
                } else {
                    // Inside Dhaka: navigate to the dedicated intercity app
                    window.location.href = '/intercity';
                }
            }
        },
        {
            label: t('nav.train'),
            icon: Train,
            isActive: view === AppView.TRAIN_LIST || view === AppView.TRAIN_DETAILS,
            onClick: () => setView(AppView.TRAIN_LIST)
        },
        {
            label: t('ai.title'),
            icon: Sparkles,
            isActive: view === AppView.AI_ASSISTANT,
            onClick: () => setView(AppView.AI_ASSISTANT)
        },

        {
            label: t('nav.blog') || 'Blog',
            icon: BookOpen,
            isActive: view === AppView.BLOG,
            onClick: () => setView(AppView.BLOG)
        },
        {
            label: t('nav.about'),
            icon: Info,
            isActive: view === AppView.ABOUT,
            onClick: () => setView(AppView.ABOUT)
        },
        {
            label: t('releaseNotes.title') || (language === 'bn' ? 'রিলিজ নোটস' : 'Release Notes'),
            icon: Rocket,
            isActive: view === AppView.RELEASE_NOTES,
            onClick: () => setView(AppView.RELEASE_NOTES)
        }
    ];

    return (
        <nav className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-kj-panel/90 backdrop-blur-md border-b border-kj-line z-[100] px-8 items-center justify-between transition-all duration-300">
            {/* Logo Section */}
            <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => {
                    setView(AppView.HOME);
                    setPrimarySearch('LOCAL');
                }}
            >
                <div className="w-9 h-9 rounded-[11px] bg-kj-primary flex items-center justify-center relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform" style={{ boxShadow: 'inset 0 -2px 0 var(--kj-accent)' }}>
                    <span className="font-bengali font-bold text-kj-primary-ink text-[19px] leading-none">ক</span>
                </div>
                <div className="flex flex-col leading-none gap-0.5">
                    <span className="font-bengali font-bold text-kj-text text-[18px] leading-tight tracking-tight">কই যাবো</span>
                    <span className="font-sans font-medium text-kj-text-faint text-[9px] tracking-[0.14em] uppercase">KoyJabo · BD</span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1 bg-kj-chip-bg p-1.5 rounded-2xl border border-kj-line">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={item.onClick}
                        className={`relative px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${item.isActive ? 'bg-kj-panel text-kj-primary shadow-sm' : 'text-kj-text-dim hover:text-kj-text hover:bg-kj-panel/60'}`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                {user ? (
                    <button
                        onClick={() => setView(AppView.PROFILE)}
                        title={user.displayName}
                        className="w-9 h-9 rounded-full overflow-hidden bg-kj-primary flex items-center justify-center text-kj-primary-ink text-sm font-bold hover:ring-2 hover:ring-kj-primary/40 hover:scale-105 transition-all"
                    >
                        {user.avatarUrl
                            ? <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                            : user.displayName.charAt(0).toUpperCase()
                        }
                    </button>
                ) : (
                    <button
                        onClick={() => setView(AppView.LOGIN)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kj-text text-kj-bg text-sm font-semibold transition-colors hover:opacity-90"
                    >
                        <LogIn className="w-4 h-4" />
                        {t('nav.login')}
                    </button>
                )}
                <button
                    onClick={onOpenMenu}
                    className="p-2 hover:bg-kj-chip-bg rounded-xl transition-colors text-kj-text-dim hover:text-kj-text"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>
        </nav>
    );
};
