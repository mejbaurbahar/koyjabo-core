import React from 'react';
import { Settings as SettingsIcon, Sun, Moon, Monitor, Globe, Mail, ChevronRight, Rocket } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsPageProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    onContactClick: () => void;
    embedded?: boolean;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isDarkMode, toggleTheme, onContactClick, embedded = false }) => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div
            className={`flex flex-col flex-1 min-h-0 w-full max-h-full bg-transparent px-4 sm:px-6 md:px-12 py-4 pb-24 md:pb-12 overflow-y-auto overscroll-y-contain touch-pan-y ${embedded ? '' : 'sm:pb-12 md:pt-8'}`}
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            <div className="max-w-3xl mx-auto w-full">
                <h1 className="text-2xl md:text-3xl font-bold mb-3 text-kj-text flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-kj-text-dim" />
                    {t('settings.title')}
                </h1>
                <p className="text-kj-text-dim mb-8">{t('settings.subtitle')}</p>

                <div className="space-y-6">
                    {/* Language Settings */}
                    <div className="dc-card kj-glass border border-kj-line rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-kj-text mb-4">
                            {t('settings.languagePreference')}
                        </h2>
                        <p className="text-sm text-kj-text-dim mb-4">
                            {t('settings.languageDescription')}
                        </p>

                        {/* Language Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Bangla */}
                            <button
                                onClick={() => setLanguage('bn')}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${language === 'bn'
                                    ? 'border-kj-primary bg-kj-primary-soft'
                                    : 'border-kj-line hover:border-kj-primary/30'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${language === 'bn' ? 'bg-kj-primary' : 'bg-kj-chip-bg'}`}>
                                    <Globe className={`w-5 h-5 ${language === 'bn' ? 'text-white' : 'text-kj-text-dim'}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <div className={`font-bold text-sm ${language === 'bn' ? 'text-kj-primary' : 'text-kj-text'}`}>
                                        বাংলা
                                    </div>
                                    <div className="text-xs text-kj-text-dim">
                                        Bangla
                                    </div>
                                </div>
                                {language === 'bn' && (
                                    <div className="w-5 h-5 bg-kj-primary rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </button>

                            {/* English */}
                            <button
                                onClick={() => setLanguage('en')}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${language === 'en'
                                    ? 'border-kj-primary bg-kj-primary-soft'
                                    : 'border-kj-line hover:border-kj-primary/30'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${language === 'en' ? 'bg-kj-primary' : 'bg-kj-chip-bg'}`}>
                                    <Globe className={`w-5 h-5 ${language === 'en' ? 'text-kj-primary-ink' : 'text-kj-text-dim'}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <div className={`font-bold text-sm ${language === 'en' ? 'text-kj-primary' : 'text-kj-text'}`}>
                                        English
                                    </div>
                                    <div className="text-xs text-kj-text-dim">
                                        ইংরেজি
                                    </div>
                                </div>
                                {language === 'en' && (
                                    <div className="w-5 h-5 bg-kj-primary rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-kj-primary-ink rounded-full"></div>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Current Status */}
                        <div className="mt-4 p-3 bg-kj-chip-bg rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-kj-text-dim" />
                                <span className="text-kj-text-dim">
                                    {t('settings.currentLanguage')}: <span className="font-bold text-kj-text">{language === 'bn' ? 'বাংলা (Bangla)' : 'English (ইংরেজি)'}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Theme Settings */}
                    <div className="dc-card kj-glass border border-kj-line rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-kj-text mb-4">
                            {t('settings.themePreference')}
                        </h2>
                        <p className="text-sm text-kj-text-dim mb-4">
                            {t('settings.themeDescription')}
                        </p>

                        {/* Theme Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Light Mode */}
                            <button
                                onClick={() => {
                                    if (isDarkMode) toggleTheme();
                                }}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${!isDarkMode
                                    ? 'border-kj-amber bg-kj-amber-soft'
                                    : 'border-kj-line hover:border-kj-amber/30'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${!isDarkMode ? 'bg-kj-amber' : 'bg-kj-chip-bg'}`}>
                                    <Sun className={`w-5 h-5 ${!isDarkMode ? 'text-white' : 'text-kj-text-dim'}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <div className={`font-bold text-sm ${!isDarkMode ? 'text-kj-amber' : 'text-kj-text'}`}>
                                        {t('settings.lightMode')}
                                    </div>
                                    <div className="text-xs text-kj-text-dim">
                                        {t('settings.brightTheme')}
                                    </div>
                                </div>
                                {!isDarkMode && (
                                    <div className="w-5 h-5 bg-kj-amber rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </button>

                            {/* Dark Mode */}
                            <button
                                onClick={() => {
                                    if (!isDarkMode) toggleTheme();
                                }}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${isDarkMode
                                    ? 'border-kj-neon-violet bg-kj-primary-soft'
                                    : 'border-kj-line hover:border-kj-neon-violet/30'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-kj-neon-violet/20' : 'bg-kj-chip-bg'}`}>
                                    <Moon className={`w-5 h-5 ${isDarkMode ? 'text-kj-neon-violet' : 'text-kj-text-dim'}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <div className={`font-bold text-sm ${isDarkMode ? 'text-kj-neon-violet' : 'text-kj-text'}`}>
                                        {t('settings.darkMode')}
                                    </div>
                                    <div className="text-xs text-kj-text-dim">
                                        {t('settings.easyOnEyes')}
                                    </div>
                                </div>
                                {isDarkMode && (
                                    <div className="w-5 h-5 bg-kj-neon-violet/30 rounded-full flex items-center justify-center border border-kj-neon-violet">
                                        <div className="w-2 h-2 bg-kj-neon-violet rounded-full"></div>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Current Status */}
                        <div className="mt-4 p-3 bg-kj-chip-bg rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                                <Monitor className="w-4 h-4 text-kj-text-dim" />
                                <span className="text-kj-text-dim">
                                    {t('settings.currentTheme')}: <span className="font-bold text-kj-text">{isDarkMode ? t('settings.dark') : t('settings.light')}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Support & Contact */}
                    <div className="dc-card kj-glass border border-kj-line rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-kj-text mb-4">
                            {t('settings.supportFeedback')}
                        </h2>

                        <button
                            onClick={onContactClick}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-kj-line hover:border-kj-primary/40 hover:bg-kj-primary-soft transition-all text-left group"
                        >
                            <div className="p-3 bg-kj-primary-soft rounded-xl text-kj-primary group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-kj-text group-hover:text-kj-primary transition-colors">{t('settings.contactUsBtn')}</h3>
                                <p className="text-sm text-kj-text-dim">{t('settings.contactUsDesc')}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-kj-text-faint group-hover:text-kj-primary group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>

                    {/* App Info */}
                    <div className="bg-kj-chip-bg border border-kj-line rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-kj-text mb-2">
                            {t('settings.appInfo')}
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-kj-text-dim">{t('settings.version')}</span>
                                <span className="font-medium text-kj-text">1.0.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-kj-text-dim">{t('settings.lastUpdated')}</span>
                                <span className="font-medium text-kj-text">January 2026</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
