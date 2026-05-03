import React, { useEffect, useState } from 'react';
import {
    Clock,
    MapPin,
    Navigation,
    TrendingUp,
    Calendar,
    Trash2,
    ChevronRight,
    Circle,
} from 'lucide-react';
import AdSenseAd from './AdSenseAd';
import {
    getTodayJourney,
    getJourneyHistory,
    clearTodayJourney,
    formatDuration,
    formatDistance,
    type DailyJourney,
    type JourneyStop,
} from '../services/journeyTrackerService';
import { useLanguage } from '../contexts/LanguageContext';


interface DailyJourneyViewProps {
    onBack: () => void;
}

const DailyJourneyView: React.FC<DailyJourneyViewProps> = ({ onBack }) => {
    const { t, formatNumber, language } = useLanguage();
    const [todayJourney, setTodayJourney] = useState<DailyJourney | null>(null);
    const [history, setHistory] = useState<DailyJourney[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Load journey data
    useEffect(() => {
        const loadData = () => {
            setTodayJourney(getTodayJourney());
            setHistory(getJourneyHistory());
        };
        loadData();

        // Refresh every minute
        const interval = setInterval(() => {
            loadData();
        }, 60000);

        return () => clearInterval(interval);
    }, [refreshKey]);

    const handleClearToday = () => {
        if (confirm(t('journey.clearConfirm'))) {
            clearTodayJourney();
            setRefreshKey((k) => k + 1);
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) {
            return t('journey.today');
        } else if (dateStr === yesterday.toISOString().split('T')[0]) {
            return t('journey.yesterday');
        } else {
            return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative w-full overflow-x-hidden max-w-full">
            {/* Unified Header */}
            <div className="flex-none bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 z-[60] px-4 py-3 shadow-md pt-safe">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-3 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center shrink-0"
                        aria-label="Go back"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180 text-gray-700 dark:text-gray-300 stroke-[3]" />
                    </button>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 shrink-0" />
                        {t('journey.title')}
                    </h1>
                    {todayJourney && todayJourney.points.length > 0 && (
                        <button
                            onClick={handleClearToday}
                            className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            aria-label="Clear today's journey"
                        >
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                    )}
                </div>
            </div>
            <AdSenseAd adSlot="auto" className="my-6" />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Today's Journey */}
                <div className="px-4 py-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        {formatDate(new Date().toISOString().split('T')[0])}
                    </h2>

                    {todayJourney && todayJourney.points.length > 0 ? (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {t('journey.distance')}
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(formatDistance(todayJourney.totalDistance))}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {t('journey.duration')}
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(formatDuration(todayJourney.totalDuration))}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {t('journey.stops')}
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {formatNumber(todayJourney.stops.filter((s) => s.isSignificant).length)}
                                    </div>
                                </div>
                            </div>


                            {/* Journey Timeline */}
                            <div className="space-y-3">
                                {todayJourney.stops.map((stop, index) => (
                                    <div
                                        key={stop.id}
                                        className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                                        {t('journey.stopNumber')} #{formatNumber(index + 1)}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatNumber(formatTime(stop.arrivalTime))}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {formatNumber(stop.location.latitude.toFixed(4))}, {formatNumber(stop.location.longitude.toFixed(4))}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{t('journey.stayed')} {formatNumber(formatDuration(stop.duration))}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Route to next stop */}
                                        {index < todayJourney.stops.length - 1 && (
                                            <div className="ml-5 mt-3 pl-5 border-l-2 border-dashed border-gray-200 dark:border-gray-700 py-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <Navigation className="w-3 h-3" />
                                                    <span>{t('journey.traveledToNext')}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Current Location (if still tracking) */}
                                {todayJourney.stops.length > 0 &&
                                    !todayJourney.stops[todayJourney.stops.length - 1].departureTime && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Circle className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                                                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                                    {t('journey.currentLocation')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                {t('journey.trackingActive')}
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MapPin className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                                {t('journey.noJourneyToday')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('journey.enableLocation')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Journey History */}
                {history.length > 0 && (
                    <div className="px-4 pb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            {t('journey.pastJourneys')}
                        </h2>
                        <div className="space-y-3">
                            {history.map((jour) => (
                                <div
                                    key={jour.date}
                                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                            {formatNumber(formatDate(jour.date))}
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatNumber(jour.stops.filter((s) => s.isSignificant).length)} {t('journey.stopsCount')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Navigation className="w-3 h-3" />
                                            {formatNumber(formatDistance(jour.totalDistance))}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatNumber(formatDuration(jour.totalDuration))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyJourneyView;
