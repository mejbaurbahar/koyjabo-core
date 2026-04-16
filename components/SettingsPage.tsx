import React from 'react';
import { Settings as SettingsIcon, Sun, Moon, Monitor, Globe, Mail, ChevronRight } from 'lucide-react';
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
        <div className={`flex flex-col h-full bg-white dark:bg-slate-900 p-6 md:p-12 pb-28 md:pb-12 overflow-y-auto w-full ${embedded ? 'pt-4' : 'pt-4 md:pt-8'}`}>
            <div className="max-w-3xl mx-auto w-full">
                <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    {t('settings.title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">{t('settings.subtitle')}</p>

                <div className="space-y-6">
                    {/* Language Settings */}
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            {t('settings.languagePreference')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {t('settings.languageDescription')}
                        </p>

                        {/* Language Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Bangla */}
                            <button
                                onClick={() => setLanguage('bn')}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${language === 'bn'
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${language === 'bn' ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                    <Globe className={`w-5 h-5 ${language === 'bn' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <div className={`font-bold text-sm ${language === 'bn' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                        বাংলা
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Bangla
                                    </div>
                                </div>
                                {language === 'bn' && (
                                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </button>

                            {/* English */}
                            <button
                                onClick={() => setLanguage('en')}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${language === 'en'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${language === 'en' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                    <Globe className={`w-5 h-5 ${language === 'en' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <div className={`font-bold text-sm ${language === 'en' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                        English
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        ইংরেজি
                                    </div>
                                </div>
                                {language === 'en' && (
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Current Status */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">
                                    {t('settings.currentLanguage')}: <span className="font-bold text-gray-900 dark:text-gray-100">{language === 'bn' ? 'বাংলা (Bangla)' : 'English (ইংরেজি)'}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Theme Settings */}
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            {t('settings.themePreference')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${!isDarkMode ? 'bg-blue-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                    <Sun className={`w-5 h-5 ${!isDarkMode ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <div className={`font-bold text-sm ${!isDarkMode ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {t('settings.lightMode')}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('settings.brightTheme')}
                                    </div>
                                </div>
                                {!isDarkMode && (
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
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
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                    <Moon className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <div className={`font-bold text-sm ${isDarkMode ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {t('settings.darkMode')}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('settings.easyOnEyes')}
                                    </div>
                                </div>
                                {isDarkMode && (
                                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Current Status */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                                <Monitor className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">
                                    {t('settings.currentTheme')}: <span className="font-bold text-gray-900 dark:text-gray-100">{isDarkMode ? t('settings.dark') : t('settings.light')}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Support & Contact */}
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Support & Feedback
                        </h2>

                        <button
                            onClick={onContactClick}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                        >
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Contact Us</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Get help or report an issue</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>

                    {/* App Info */}
                    <div className="bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {t('settings.appInfo')}
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">{t('settings.version')}</span>
                                <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">{t('settings.lastUpdated')}</span>
                                <span className="font-medium text-gray-900 dark:text-white">January 2026</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
