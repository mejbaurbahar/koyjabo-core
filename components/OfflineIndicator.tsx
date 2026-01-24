import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2, AlertTriangle, X, Info, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    getOfflineStatusBanner,
    getOfflineFeaturesList,
    isOfflineCacheAvailable,
    getCacheAgeDays
} from '../services/enhancedOfflineSupport';

interface OfflineIndicatorProps {
    isOnline: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline }) => {
    const { t, language } = useLanguage();
    const [showDetails, setShowDetails] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [hasCache, setHasCache] = useState(false);
    const [cacheAge, setCacheAge] = useState(0);

    useEffect(() => {
        setHasCache(isOfflineCacheAvailable());
        setCacheAge(getCacheAgeDays());
    }, [isOnline]);

    // Don't show if online
    if (isOnline) return null;

    // Don't show if dismissed
    if (isDismissed) return null;

    const status = getOfflineStatusBanner(language);
    const features = getOfflineFeaturesList(language);

    const getIcon = () => {
        if (status.type === 'success') return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
        if (status.type === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
        return <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />;
    };

    const getBgColor = () => {
        if (status.type === 'success') return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        if (status.type === 'warning') return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    };

    const getTextColor = () => {
        if (status.type === 'success') return 'text-green-800 dark:text-green-200';
        if (status.type === 'warning') return 'text-amber-800 dark:text-amber-200';
        return 'text-red-800 dark:text-red-200';
    };

    return (
        <>
            {/* Top Banner */}
            <div className={`fixed top-0 left-0 right-0 z-50 ${getBgColor()} border-b shadow-sm`}>
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                            {getIcon()}
                            <p className={`text-sm font-medium ${getTextColor()}`}>
                                {status.message}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {hasCache && (
                                <button
                                    onClick={() => setShowDetails(true)}
                                    className={`text-xs px-3 py-1 rounded-full ${getTextColor()} hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-1`}
                                >
                                    <Info className="w-3 h-3" />
                                    {language === 'bn' ? 'বিস্তারিত' : 'Details'}
                                </button>
                            )}

                            <button
                                onClick={() => setIsDismissed(true)}
                                className={`${getTextColor()} hover:bg-white dark:hover:bg-gray-800 p-1 rounded transition-colors`}
                                aria-label="Dismiss"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {showDetails && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                                        <WifiOff className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {language === 'bn' ? 'অফলাইন মোড' : 'Offline Mode'}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {language === 'bn' ? 'ইন্টারনেট সংযোগ নেই' : 'No Internet Connection'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Cache Info */}
                            {hasCache && (
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                            {language === 'bn' ? 'ক্যাশ তথ্য' : 'Cached Data'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        {language === 'bn'
                                            ? `ডেটা ক্যাশ করা হয়েছে ${cacheAge} দিন আগে`
                                            : `Data cached ${cacheAge} days ago`}
                                    </p>
                                    {cacheAge > 7 && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            {language === 'bn'
                                                ? '⚠️ আপডেটের জন্য অনলাইনে সংযুক্ত হন'
                                                : '⚠️ Connect online to update data'}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Available Features */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    {language === 'bn' ? 'উপলব্ধ ফিচার' : 'Available Features'}
                                </h4>

                                <ul className="space-y-2">
                                    {features.map((feature, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Not Available */}
                            <div className="mt-6">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <X className="w-4 h-4 text-red-500" />
                                    {language === 'bn' ? 'অনলাইন প্রয়োজন' : 'Requires Online'}
                                </h4>

                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                        <span>{language === 'bn' ? '🚦 লাইভ ট্র্যাকিং' : '🚦 Live Tracking'}</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                        <span>{language === 'bn' ? '🌐 রিয়েল-টাইম আপডেট' : '🌐 Real-time Updates'}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Reassurance Message */}
                            <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                                    {language === 'bn'
                                        ? '💚 চিন্তা করবেন না! কই যাবো সম্পূর্ণভাবে অফলাইনে কাজ করার জন্য ডিজাইন করা হয়েছে। আপনি সকল মূল ফিচার ব্যবহার করতে পারবেন।'
                                        : '💚 No worries! Koy Jabo is designed to work fully offline. You can use all core features without internet.'}
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowDetails(false)}
                                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
                            >
                                {language === 'bn' ? 'বুঝেছি' : 'Got it'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OfflineIndicator;
