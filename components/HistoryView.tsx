import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, TrendingUp, Calendar, Users, Eye, Trash2, Bus, MapPin, ArrowRight, Activity, Train, Zap } from 'lucide-react';
import {
    getUserHistory,
    getGlobalStats,
    getMostUsedBuses,
    getMostUsedRoutes,
    getMostUsedTrains,
    getTodayBusSearches,
    getTodayRouteSearches,
    getRecentBusSearches,
    getRecentRouteSearches,
    getRecentIntercitySearches,
    getRecentTrainSearches,
    clearUserHistory,
    subscribeToGlobalStats,
    initStorageListener,
    fetchGlobalStats,
    GlobalStats
} from '../services/analyticsService';
import { BUS_DATA, STATIONS } from '../constants';
import { BusRoute } from '../types';
import { BD_TRAIN_ROUTES, BDTrainRoute } from '../data/bangladeshTrainData';
import { useLanguage } from '../contexts/LanguageContext';
import AdSenseAd from './AdSenseAd';

interface HistoryViewProps {
    onBack: () => void;
    onBusSelect: (bus: BusRoute, fromHistory?: boolean) => void;
    onTrainSelect?: (train: BDTrainRoute) => void;
    onViewJourney?: () => void;
    embedded?: boolean;
}

const FEATURE_LABELS: Record<string, string> = {
    ai_assistant: 'AI Assistant',
    trip_reminders: 'Trip Reminders',
    cost_calculator: 'Commute Cost Calculator',
    multi_stop_planner: 'Multi-Stop Planner',
    area_guides: 'Area Guides',
    road_alerts: 'Road Alerts',
    seat_availability: 'Seat Availability',
    bus_pass_info: 'Bus Pass Info',
    bus_rating: 'Bus Rating',
    bus_live_tracking: 'Bus Live Tracking',
    bus_photos: 'Bus Photos',
    train_list: 'Train Routes',
};

const HistoryView: React.FC<HistoryViewProps> = ({ onBack, onBusSelect, onTrainSelect, onViewJourney, embedded = false }) => {
    const { t, formatNumber } = useLanguage();
    const [activeTab, setActiveTab] = useState<'personal' | 'global'>('personal');
    const [globalStats, setGlobalStats] = useState<GlobalStats>(getGlobalStats());
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [history, setHistory] = useState(getUserHistory());
    const [mostUsedBuses, setMostUsedBuses] = useState(getMostUsedBuses(50));
    const [mostUsedRoutes, setMostUsedRoutes] = useState(getMostUsedRoutes(50));
    const [mostUsedTrains, setMostUsedTrains] = useState(getMostUsedTrains(50));
    const [todayBuses, setTodayBuses] = useState(getTodayBusSearches());
    const [todayRoutes, setTodayRoutes] = useState(getTodayRouteSearches());
    const [recentBusSearches, setRecentBusSearches] = useState(getRecentBusSearches(50));
    const [recentRouteSearches, setRecentRouteSearches] = useState(getRecentRouteSearches(50));
    const [recentIntercitySearches, setRecentIntercitySearches] = useState(getRecentIntercitySearches(50));
    const [recentTrainSearches, setRecentTrainSearches] = useState(getRecentTrainSearches(50));

    // Subscribe to real-time updates
    useEffect(() => {
        // Immediate refresh on mount so data is always current
        fetchGlobalStats();
        refreshHistoryData();

        // Subscribe to custom events from same tab
        const unsubscribe = subscribeToGlobalStats((stats) => {
            setGlobalStats(stats);
        });

        // Listen for storage changes from other tabs / same-tab writes
        const unsubscribeStorage = initStorageListener(() => {
            setGlobalStats(getGlobalStats());
            refreshHistoryData();
        });

        // Refresh when the page becomes visible again (user switches back to this tab/page)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchGlobalStats();
                refreshHistoryData();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Also refresh on focus (covers app switching on mobile)
        const handleFocus = () => {
            fetchGlobalStats();
            refreshHistoryData();
        };
        window.addEventListener('focus', handleFocus);

        // Poll every 10s for live global stats
        const interval = setInterval(() => {
            fetchGlobalStats();
            refreshHistoryData();
        }, 10000);

        return () => {
            unsubscribe();
            unsubscribeStorage();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
    }, []);

    const refreshHistoryData = () => {
        setHistory(getUserHistory());
        setMostUsedBuses(getMostUsedBuses(50));
        setMostUsedRoutes(getMostUsedRoutes(50));
        setMostUsedTrains(getMostUsedTrains(50));
        setTodayBuses(getTodayBusSearches());
        setTodayRoutes(getTodayRouteSearches());
        setRecentBusSearches(getRecentBusSearches(50));
        setRecentRouteSearches(getRecentRouteSearches(50));
        setRecentIntercitySearches(getRecentIntercitySearches(50));
        setRecentTrainSearches(getRecentTrainSearches(50));
        setRefreshKey(prev => prev + 1);
    };

    const handleClearHistory = () => {
        setShowClearConfirm(true);
    };

    const confirmClearHistory = () => {
        clearUserHistory();
        refreshHistoryData();
        setShowClearConfirm(false);
    };

    const getBusById = (busId: string): BusRoute | undefined => {
        return BUS_DATA.find(bus => bus.id === busId);
    };

    const getStationName = (stationId: string): string => {
        return STATIONS[stationId]?.name || stationId;
    };

    const getTrainById = (trainId: string): BDTrainRoute | undefined => {
        return BD_TRAIN_ROUTES.find(t => t.id === trainId);
    };

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t('history.justNow');
        if (diffMins < 60) return `${formatNumber(diffMins)} ${t('history.minutesAgo')}`;
        if (diffHours < 24) return `${formatNumber(diffHours)} ${t('history.hoursAgo')}`;
        if (diffDays < 7) return `${formatNumber(diffDays)} ${t('history.daysAgo')}`;

        return formatNumber(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full max-w-full overflow-hidden bg-white dark:bg-slate-900 relative">
            {/* Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-2">{t('history.clearHistory')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
                            {t('history.clearConfirm')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                {t('history.cancel')}
                            </button>
                            <button
                                onClick={confirmClearHistory}
                                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                {t('history.yesClear')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className={`shrink-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 pb-4 ${embedded ? 'pt-4' : 'pt-6'}`}>
                <div>
                    <div className="flex items-center gap-3 mb-4">

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-dhaka-green" />
                            {t('history.title')}
                        </h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'personal'
                                ? 'bg-white dark:bg-slate-700 text-dhaka-green shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4" />
                                {t('history.myHistory')}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'global'
                                ? 'bg-white dark:bg-slate-700 text-dhaka-green shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Users className="w-4 h-4" />
                                {t('history.globalStats')}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            <div className="shrink-0 px-4 md:px-6">
              <AdSenseAd adSlot="auto" className="my-4 w-full max-w-[728px] mx-auto px-2 md:px-0" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-4 md:p-6 space-y-6 pb-24 md:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
                {activeTab === 'personal' ? (
                    <>
                        {/* Clear History Button */}
                        {(recentBusSearches.length > 0 || recentRouteSearches.length > 0 || recentIntercitySearches.length > 0 || recentTrainSearches.length > 0) && (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleClearHistory}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t('history.clearAllHistory')}
                                </button>
                            </div>
                        )}

                        {/* Today's Activity */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                {t('history.todayActivity')}
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(todayBuses.length)}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('history.busesSearched')}</div>
                                </div>
                                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl">
                                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatNumber(todayRoutes.length)}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('history.routesSearched')}</div>
                                </div>
                                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl">
                                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatNumber((history.todayTrains || []).length)}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('history.trainsViewed') || 'Trains'}</div>
                                </div>
                            </div>
                        </div>




                        {/* Most Used Buses */}
                        {mostUsedBuses.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-dhaka-green" />
                                    {t('history.mostUsedBuses')}
                                </h2>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {(mostUsedBuses || []).map((item, idx) => {
                                        if (!item) return null;
                                        const { busId, count } = item;
                                        const bus = getBusById(busId);
                                        if (!bus) return null;
                                        return (
                                            <div
                                                key={`bus-${idx}-${busId}`}
                                                onClick={() => onBusSelect(bus, true)}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-colors group flex-shrink-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-dhaka-green rounded-lg flex items-center justify-center">
                                                        <Bus className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-dhaka-green transition-colors">
                                                            {bus.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-bengali">{bus.bnName}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-dhaka-green/10 text-dhaka-green rounded-full text-sm font-bold">
                                                        {formatNumber(count)}x
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-dhaka-green transition-colors" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Most Used Routes */}
                        {mostUsedRoutes.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-dhaka-red" />
                                    {t('history.mostUsedRoutes')}
                                </h2>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {(mostUsedRoutes || []).map((item, index) => {
                                        if (!item) return null;
                                        const { from, to, count } = item;
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl flex-shrink-0"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-10 h-10 bg-dhaka-red rounded-lg flex items-center justify-center">
                                                        <MapPin className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 max-w-[calc(100%-100px)]">
                                                        <div className="flex items-center gap-2 text-sm flex-wrap">
                                                            <span className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{getStationName(from)}</span>
                                                            <ArrowRight className="w-4 h-4 text-dhaka-gray-400 flex-shrink-0" />
                                                            <span className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{getStationName(to)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-dhaka-red/10 text-dhaka-red rounded-full text-sm font-bold ml-2">
                                                    {formatNumber(count)}x
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Recent Bus Searches */}
                        {recentBusSearches.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    {t('history.recentBusSearches')}
                                </h2>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {recentBusSearches.map((record, index) => {
                                        const bus = getBusById(record.busId);
                                        if (!bus) return null;
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => onBusSelect(bus, true)}
                                                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors group flex-shrink-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Bus className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-dhaka-green transition-colors">
                                                            {record.busName}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(record.timestamp)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Recent Route Searches */}
                        {recentRouteSearches.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    {t('history.recentRouteSearches')}
                                </h2>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {recentRouteSearches.map((record, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div className="flex items-center gap-2 text-sm min-w-0">
                                                    <span className="font-bold text-gray-900 dark:text-gray-100 truncate">{getStationName(record.from)}</span>
                                                    <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                    <span className="font-bold text-gray-900 dark:text-gray-100 truncate">{getStationName(record.to)}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{formatDate(record.timestamp)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Intercity Searches */}
                        {(recentIntercitySearches || []).length > 0 && (
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                    {t('history.recentIntercityTrips')}
                                </h2>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {recentIntercitySearches.map((record, index) => {
                                        // Safely handle potentially incomplete records
                                        if (!record || !record.from || !record.to) return null;
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0"
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        {record.transportType === 'AIR' ? <TrendingUp className="w-4 h-4 text-purple-600" /> : <Bus className="w-4 h-4 text-purple-600" />}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm min-w-0">
                                                        <span className="font-bold text-gray-900 dark:text-gray-100 truncate">{record.from}</span>
                                                        <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                        <span className="font-bold text-gray-900 dark:text-gray-100 truncate">{record.to}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{formatDate(record.timestamp || Date.now())}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Most Used Trains */}
                        {mostUsedTrains.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    {t('history.mostUsedTrains') || 'Most Viewed Trains'}
                                </h2>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {(mostUsedTrains || []).map((item, idx) => {
                                        const train = getTrainById(item.trainId);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => train && onTrainSelect && onTrainSelect(train)}
                                                className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition-colors group ${train && onTrainSelect ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                                                        <Train className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className={`font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-emerald-500 transition-colors`}>{item.trainName}</div>
                                                        {train && <div className="text-[10px] text-gray-500 dark:text-gray-400">#{train.number}</div>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-bold">
                                                        {formatNumber(item.count)}x
                                                    </span>
                                                    {train && onTrainSelect && <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Recent Train Views */}
                        {recentTrainSearches.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <Train className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    {t('history.recentTrainViews') || 'Recent Train Views'}
                                </h2>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {recentTrainSearches.map((record, index) => {
                                        const train = getTrainById(record.trainId);
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => train && onTrainSelect && onTrainSelect(train)}
                                                className={`flex items-center justify-between p-3 rounded-lg transition-colors group ${train && onTrainSelect ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50' : ''}`}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <Train className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-500 transition-colors">
                                                            {record.trainName}
                                                        </div>
                                                        <div className="text-xs text-gray-400 dark:text-gray-500">#{record.trainNumber}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">{formatDate(record.timestamp)}</span>
                                                    {train && onTrainSelect && <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Feature Activity */}
                        {(history.communityFeatureHistory || []).length > 0 && (
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    {t('history.featureActivity') || 'Feature Activity'}
                                </h2>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {[...(history.communityFeatureHistory || [])].reverse().slice(0, 50).map((record, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                    {FEATURE_LABELS[record.feature] || record.feature}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{formatDate(record.timestamp)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {recentBusSearches.length === 0 && recentRouteSearches.length === 0 && recentIntercitySearches.length === 0 && recentTrainSearches.length === 0 && (history.communityFeatureHistory || []).length === 0 && (
                            <div className="text-center py-12">
                                <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{t('history.noHistoryYet')}</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t('history.startSearching')}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Global Statistics */}
                        <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-2xl border border-green-100 dark:border-slate-700 flex flex-col gap-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                                {t('history.communityStats')}
                                <span className="ml-auto text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    {t('history.live')}
                                </span>
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-700 p-5 rounded-xl">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                                            <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {formatNumber(globalStats.totalVisits)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{t('history.totalVisits')}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-700 p-5 rounded-xl">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {formatNumber(globalStats.todayVisits)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{t('history.todayVisits')}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <AdSenseAd adSlot="auto" className="my-6 w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" />

                        {/* Info Card */}
                        <div className="bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl p-6">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Eye className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('history.realtimeUpdates')}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {t('history.realtimeDescription')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Community Impact */}
                        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t('history.communityImpact')}</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bus className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-gray-100">{t('history.helpingCommuters')}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {t('history.helpingDescription')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-gray-100">{t('history.growingCommunity')}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {t('history.growingDescription')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HistoryView;
