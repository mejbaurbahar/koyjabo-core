import React from 'react';
import { Home, Menu, Sparkles, LogIn, Bus, TramFront, Calculator, Sun, Moon, Train } from 'lucide-react';
import { AppView } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../src/contexts/AuthContext';
import KoyJaboLogo from './KoyJaboLogo';

interface NavItem {
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
    badge?: string;
}

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
    const { t, language, setLanguage } = useLanguage();
    const { user } = useAuth();

    const navItems: NavItem[] = [
        {
            label: language === 'bn' ? 'হোম' : 'Home',
            icon: Home,
            isActive: view === AppView.HOME && primarySearch === 'LOCAL' && listFilter !== 'FAVORITES',
            onClick: () => { setView(AppView.HOME); setPrimarySearch('LOCAL'); setListFilter('ALL'); }
        },
        {
            label: language === 'bn' ? 'মেট্রো' : 'Metro',
            icon: TramFront,
            isActive: view === AppView.METRO_HUB,
            onClick: () => setView(AppView.METRO_HUB),
            badge: 'LIVE'
        },
        {
            label: language === 'bn' ? 'ট্রেন' : 'Train',
            icon: Train,
            isActive: view === AppView.TRAIN_LIST || view === AppView.TRAIN_DETAILS,
            onClick: () => setView(AppView.TRAIN_LIST),
        },
        {
            label: language === 'bn' ? 'আন্তঃজেলা' : 'Intercity',
            icon: Bus,
            isActive: view === AppView.INTERCITY_HUB,
            onClick: () => setView(AppView.INTERCITY_HUB),
        },
        {
            label: language === 'bn' ? 'ভাড়া হিসাব' : 'Fare Calc',
            icon: Calculator,
            isActive: view === AppView.COMMUTE_COST,
            onClick: () => setView(AppView.COMMUTE_COST)
        },
        {
            label: language === 'bn' ? 'AI সহায়ক' : 'AI Assistant',
            icon: Sparkles,
            isActive: view === AppView.AI_ASSISTANT,
            onClick: () => setView(AppView.AI_ASSISTANT),
            badge: 'NEW'
        },
    ];

    return (
        <nav
            className="hidden md:flex fixed top-0 left-0 right-0 h-[68px] z-[100] px-5 md:px-8 items-center justify-between transition-all duration-300"
            style={{
                background: 'color-mix(in srgb, var(--kj-bg) 90%, transparent)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                borderBottom: '1px solid var(--kj-line)',
            }}
        >
            {/* Logo */}
            <div
                className="flex items-center gap-2.5 cursor-pointer group shrink-0"
                onClick={() => { setView(AppView.HOME); setPrimarySearch('LOCAL'); }}
            >
                {/* KoyJabo logo */}
                <img
                    src="/logo.png"
                    alt="KoyJabo"
                    className="w-9 h-9 rounded-[10px] shrink-0 group-hover:scale-105 transition-transform object-cover"
                />
                <div className="flex flex-col leading-none gap-[3px]">
                    <span className="font-bengali font-bold text-kj-text text-[17px] leading-tight tracking-tight">
                        কই যাবো
                    </span>
                    <span className="font-sans font-semibold text-kj-text-faint text-[8.5px] tracking-[0.18em] uppercase">
                        KOYJABO
                    </span>
                </div>
            </div>

            {/* Nav links */}
            <div className="flex items-center gap-0.5 ml-6">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={item.onClick}
                        className="relative px-3.5 py-2 rounded-[10px] text-[13px] font-medium flex items-center gap-1.5 transition-all duration-200"
                        style={item.isActive ? {
                            color: 'var(--kj-primary)',
                            background: 'var(--kj-primary-soft)',
                        } : {
                            color: 'var(--kj-text-dim)',
                        }}
                        onMouseEnter={(e) => {
                            if (!item.isActive) {
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--kj-text)';
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--kj-chip-bg)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!item.isActive) {
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--kj-text-dim)';
                                (e.currentTarget as HTMLButtonElement).style.background = '';
                            }
                        }}
                    >
                        {/* Active dot indicator */}
                        {item.isActive && (
                            <span
                                className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                style={{ background: 'var(--kj-primary)' }}
                            />
                        )}
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                        {item.badge && (
                            <span
                                className="ml-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none"
                                style={{ background: item.badge === 'LIVE' ? 'var(--kj-accent)' : 'var(--kj-primary)' }}
                            >
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 ml-4">
                {/* Language toggle pill */}
                <button
                    onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                    className="h-9 px-3 rounded-[10px] flex items-center gap-1.5 text-kj-text text-[12px] font-semibold tracking-[0.3px] transition-colors"
                    style={{ background: 'var(--kj-panel-muted)', border: '1px solid var(--kj-line)' }}
                    aria-label="Toggle language"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13.5 13.5 0 0 1 0 18"/><path d="M12 3a13.5 13.5 0 0 0 0 18"/>
                    </svg>
                    <span>{language === 'bn' ? 'বাং' : 'EN'}</span>
                </button>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center text-kj-text transition-colors"
                    style={{ background: 'var(--kj-panel-muted)', border: '1px solid var(--kj-line)' }}
                    aria-label={language === 'bn' ? 'থিম পরিবর্তন' : 'Toggle theme'}
                >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Install button (lg+) */}
                <button
                    onClick={() => setView(AppView.INSTALL_APP)}
                    className="hidden lg:flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] text-[13px] font-semibold transition-opacity hover:opacity-90"
                    style={{ background: 'var(--kj-text)', color: 'var(--kj-bg)' }}
                >
                    {language === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install app'}
                </button>

                {/* User avatar or login */}
                {user ? (
                    <button
                        onClick={() => setView(AppView.PROFILE)}
                        title={user.displayName}
                        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold transition-all hover:scale-105"
                        style={{
                            background: 'var(--kj-primary)',
                            color: 'var(--kj-primary-ink)',
                            boxShadow: '0 0 0 0 var(--kj-primary)',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--kj-primary) 40%, transparent)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 0 var(--kj-primary)'; }}
                    >
                        {user.avatarUrl
                            ? <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                            : user.displayName.charAt(0).toUpperCase()
                        }
                    </button>
                ) : (
                    <button
                        onClick={() => setView(AppView.LOGIN)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-opacity hover:opacity-90"
                        style={{ background: 'var(--kj-text)', color: 'var(--kj-bg)' }}
                    >
                        <LogIn className="w-4 h-4" />
                        {t('nav.login')}
                    </button>
                )}

                {/* Hamburger menu */}
                <button
                    onClick={onOpenMenu}
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center text-kj-text-dim hover:text-kj-text transition-colors"
                    style={{ background: 'var(--kj-panel-muted)', border: '1px solid var(--kj-line)' }}
                    aria-label={language === 'bn' ? 'মেনু খুলুন' : 'Open menu'}
                >
                    <Menu className="w-4.5 h-4.5" />
                </button>
            </div>
        </nav>
    );
};
