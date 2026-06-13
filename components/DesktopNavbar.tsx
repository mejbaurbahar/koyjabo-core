import React from 'react';
import { Home, Menu, Sparkles, LogIn, Bus, TramFront, Calculator, Sun, Moon } from 'lucide-react';
import { AppView } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../src/contexts/AuthContext';

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

    // Navbar should be visible on all views for desktop now
    // if (view === AppView.BUS_DETAILS || view === AppView.LIVE_NAV) {
    //   return null;
    // }

    const navItems = [
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
            label: language === 'bn' ? 'আন্তঃজেলা' : 'Intercity',
            icon: Bus,
            isActive: !isInDhaka && view === AppView.HOME && primarySearch === 'INTERCITY',
            onClick: () => {
                if (!isInDhaka) {
                    setView(AppView.HOME);
                    setPrimarySearch('INTERCITY');
                } else {
                    window.location.href = '/intercity';
                }
            }
        },
        {
            label: language === 'bn' ? 'ভাড়া হিসাব' : 'Fare',
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
        <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-[rgba(4,8,20,0.85)] backdrop-blur-xl border-b border-kj-line z-[100] px-6 items-center justify-between transition-all duration-300 kj-glass">
            {/* Logo Section */}
            <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => {
                    setView(AppView.HOME);
                    setPrimarySearch('LOCAL');
                }}
            >
                <img src="/logo.png" alt="KoyJabo" className="w-11 h-11 rounded-[11px] shrink-0 group-hover:scale-105 transition-transform" />
                <div className="flex flex-col leading-none gap-0.5">
                    <span className="font-bengali font-bold text-kj-text text-[18px] leading-tight tracking-tight">কই যাবো</span>
                    <span className="font-sans font-medium text-kj-text-faint text-[9px] tracking-[0.14em] uppercase">KoyJabo · BD</span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-0.5 bg-kj-chip-bg p-1 rounded-2xl border border-kj-line">
                {(navItems as NavItem[]).map((item) => (
                    <button
                        key={item.label}
                        onClick={item.onClick}
                        className={`relative px-3 py-1.5 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all duration-200 ${item.isActive ? 'bg-kj-panel text-kj-primary shadow-sm kj-glass' : 'text-kj-text-dim hover:text-kj-text hover:bg-kj-panel/60'}`}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                        {item.badge && (
                            <span className="ml-0.5 text-[8px] font-bold px-1 py-0.5 rounded-full bg-kj-accent text-white leading-none">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                    className="h-9 px-2.5 rounded-[10px] border border-kj-line bg-kj-panel-muted flex items-center gap-1.5 text-kj-text text-[12px] font-semibold tracking-[0.4px] hover:bg-kj-chip-bg transition-colors"
                    aria-label="Toggle language"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13.5 13.5 0 0 1 0 18"/><path d="M12 3a13.5 13.5 0 0 0 0 18"/></svg>
                    <span>{language === 'bn' ? 'বাং' : 'EN'}</span>
                </button>
                <button
                    onClick={() => setView(AppView.INSTALL_APP)}
                    className="hidden lg:flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-kj-line bg-kj-panel-muted text-kj-text text-[12px] font-semibold hover:bg-kj-chip-bg transition-colors"
                >
                    {language === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install app'}
                </button>
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-[10px] border border-kj-line bg-kj-panel-muted flex items-center justify-center text-kj-text hover:bg-kj-chip-bg transition-colors"
                    aria-label={language === 'bn' ? 'থিম পরিবর্তন' : 'Toggle theme'}
                >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
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
                    className="p-2 hover:bg-kj-chip-bg rounded-xl transition-colors text-kj-text-dim hover:text-kj-text xl:hidden"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>
        </nav>
    );
};
