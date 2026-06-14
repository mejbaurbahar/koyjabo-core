import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, TrendingUp, Calendar, Users, Eye, Trash2, Bus, MapPin, ArrowRight, Activity, Train, Zap, Leaf, ChevronRight } from 'lucide-react';
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
import SponsoredAdSlot from './SponsoredAdSlot';

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

// --- Inline SVG chart components ---

// Weekly stacked bar chart (Mon-Sun)
const WeeklyBarChart: React.FC = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [
        { bus: 60, metro: 40, ride: 20 },
        { bus: 80, metro: 30, ride: 10 },
        { bus: 50, metro: 60, ride: 30 },
        { bus: 90, metro: 50, ride: 15 },
        { bus: 70, metro: 45, ride: 25 },
        { bus: 40, metro: 20, ride: 10 },
        { bus: 55, metro: 35, ride: 5 },
    ];
    const maxVal = 160;
    const chartH = 120;
    const barW = 22;
    const gap = 16;
    const totalW = days.length * (barW + gap) - gap;

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${totalW + 8} ${chartH + 28}`} className="w-full h-auto">
                {data.map((d, i) => {
                    const x = i * (barW + gap);
                    const busH = (d.bus / maxVal) * chartH;
                    const metroH = (d.metro / maxVal) * chartH;
                    const rideH = (d.ride / maxVal) * chartH;
                    const totalH = busH + metroH + rideH;
                    const yBase = chartH;
                    return (
                        <g key={i}>
                            {/* rideshare */}
                            <rect x={x} y={yBase - totalH} width={barW} height={rideH} rx={2} fill="#8b5cf6" opacity={0.85} />
                            {/* metro */}
                            <rect x={x} y={yBase - busH - metroH} width={barW} height={metroH} rx={2} fill="#3b82f6" opacity={0.85} />
                            {/* bus */}
                            <rect x={x} y={yBase - busH} width={barW} height={busH} rx={4} fill="#10b981" opacity={0.9} />
                            <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="9" fill="var(--kj-text-dim)">{days[i]}</text>
                        </g>
                    );
                })}
            </svg>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-kj-text-dim"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#10b981' }} />Bus</span>
                <span className="flex items-center gap-1 text-[11px] text-kj-text-dim"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#3b82f6' }} />Metro</span>
                <span className="flex items-center gap-1 text-[11px] text-kj-text-dim"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#8b5cf6' }} />Rideshare</span>
            </div>
        </div>
    );
};

// Donut chart — transport mode split
const DonutChart: React.FC = () => {
    const segments = [
        { label: 'Bus', pct: 50, color: '#10b981' },
        { label: 'Metro', pct: 30, color: '#3b82f6' },
        { label: 'Rideshare', pct: 12, color: '#8b5cf6' },
        { label: 'Walking', pct: 8, color: '#f59e0b' },
    ];
    const r = 46;
    const cx = 60;
    const cy = 60;
    const stroke = 18;
    let cumulative = 0;
    const circumference = 2 * Math.PI * r;

    return (
        <div className="flex flex-col items-center gap-3">
            <svg viewBox="0 0 120 120" className="w-28 h-28">
                {segments.map((seg, i) => {
                    const offset = circumference * (1 - cumulative / 100);
                    const dash = circumference * seg.pct / 100;
                    cumulative += seg.pct;
                    return (
                        <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={stroke}
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={offset}
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
                            opacity={0.9}
                        />
                    );
                })}
                <circle cx={cx} cy={cy} r={r - stroke / 2 - 1} fill="var(--kj-panel)" />
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--kj-text)">Mode</text>
                <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="var(--kj-text-dim)">Split</text>
            </svg>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                        <span className="text-[11px] text-kj-text-dim">{seg.label}</span>
                        <span className="text-[11px] font-bold text-kj-text ml-auto">{seg.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Monthly line chart — 12 months
const MonthlyLineChart: React.FC = () => {
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const values = [120, 145, 160, 138, 172, 190, 210, 185, 220, 240, 210, 251];
    const maxV = 260;
    const minV = 100;
    const W = 260;
    const H = 100;
    const stepX = W / (values.length - 1);

    const toY = (v: number) => H - ((v - minV) / (maxV - minV)) * H;
    const points = values.map((v, i) => `${i * stepX},${toY(v)}`).join(' ');
    const areaPoints = `0,${H} ${points} ${(values.length - 1) * stepX},${H}`;

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-auto overflow-visible">
                <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                <polygon points={areaPoints} fill="url(#lineGrad)" />
                <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {values.map((v, i) => (
                    <circle key={i} cx={i * stepX} cy={toY(v)} r={i === values.length - 1 ? 4 : 2.5} fill={i === values.length - 1 ? '#10b981' : 'var(--kj-panel)'} stroke="#10b981" strokeWidth="1.5" />
                ))}
                {months.map((m, i) => (
                    <text key={i} x={i * stepX} y={H + 15} textAnchor="middle" fontSize="8" fill="var(--kj-text-dim)">{m}</text>
                ))}
            </svg>
        </div>
    );
};

// Busy hours heatmap
const HeatmapGrid: React.FC = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const hours = ['6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p'];
    const heatData: number[][] = [
        [3, 8, 4, 2, 3, 7, 9, 5],
        [4, 9, 3, 2, 4, 8, 9, 4],
        [3, 8, 5, 3, 3, 7, 8, 3],
        [4, 9, 4, 2, 4, 8, 9, 4],
        [5, 9, 3, 2, 3, 7, 10, 6],
        [2, 4, 5, 6, 5, 4, 3, 2],
        [1, 2, 3, 4, 3, 2, 2, 1],
    ];
    const colors = ['#1a3a2a', '#1d5c3b', '#1e7a4e', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
    const getColor = (v: number) => colors[Math.min(Math.floor(v * 0.8), colors.length - 1)];

    return (
        <div className="w-full overflow-x-auto">
            <div className="flex gap-0.5 mb-1">
                <div className="w-4" />
                {hours.map((h, i) => (
                    <div key={i} className="flex-1 text-center text-[9px] text-kj-text-dim">{h}</div>
                ))}
            </div>
            {heatData.map((row, di) => (
                <div key={di} className="flex gap-0.5 mb-0.5">
                    <div className="w-4 text-[9px] text-kj-text-dim flex items-center">{days[di]}</div>
                    {row.map((val, hi) => (
                        <div
                            key={hi}
                            className="flex-1 rounded-sm"
                            style={{ background: getColor(val), height: '18px' }}
                            title={`${days[di]} ${hours[hi]}: intensity ${val}`}
                        />
                    ))}
                </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] text-kj-text-faint">Low</span>
                <div className="flex gap-0.5 flex-1">
                    {colors.map((c, i) => (
                        <div key={i} className="flex-1 h-2 rounded-sm" style={{ background: c }} />
                    ))}
                </div>
                <span className="text-[9px] text-kj-text-faint">High</span>
            </div>
        </div>
    );
};

const HistoryView: React.FC<HistoryViewProps> = ({ onBack, onBusSelect, onTrainSelect, onViewJourney, embedded = false }) => {
    const { t, formatNumber, language } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
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

    useEffect(() => {
        fetchGlobalStats();
        refreshHistoryData();

        const unsubscribe = subscribeToGlobalStats((stats) => {
            setGlobalStats(stats);
        });

        const unsubscribeStorage = initStorageListener(() => {
            setGlobalStats(getGlobalStats());
            refreshHistoryData();
        });

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchGlobalStats();
                refreshHistoryData();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        const handleFocus = () => {
            fetchGlobalStats();
            refreshHistoryData();
        };
        window.addEventListener('focus', handleFocus);

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

    const handleClearHistory = () => setShowClearConfirm(true);

    const confirmClearHistory = () => {
        clearUserHistory();
        refreshHistoryData();
        setShowClearConfirm(false);
    };

    const getBusById = (busId: string): BusRoute | undefined =>
        BUS_DATA.find(bus => bus.id === busId);

    const getStationName = (stationId: string): string =>
        STATIONS[stationId]?.name || stationId;

    const getTrainById = (trainId: string): BDTrainRoute | undefined =>
        BD_TRAIN_ROUTES.find(t => t.id === trainId);

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

    const hasPersonalData =
        recentBusSearches.length > 0 ||
        recentRouteSearches.length > 0 ||
        recentIntercitySearches.length > 0 ||
        recentTrainSearches.length > 0;

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full max-w-full overflow-hidden bg-kj-bg relative">
            {/* Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-kj-panel rounded-2xl p-6 w-full max-w-sm shadow-kj-lg border border-kj-line scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-kj-text text-center mb-2">{t('history.clearHistory')}</h3>
                        <p className="text-kj-text-dim text-center text-sm mb-6">{t('history.clearConfirm')}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-kj-text-dim bg-kj-chip-bg hover:opacity-80 transition-opacity"
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
            <div className={`shrink-0 bg-kj-panel border-b border-kj-line px-4 md:px-6 pb-4 ${embedded ? 'pt-4' : 'pt-6'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-2xl font-bold text-kj-text flex items-center gap-2">
                        <Activity className="w-6 h-6 text-kj-neon-cyan" />
                        {t('history.title')}
                    </h1>
                </div>
                {/* Tabs */}
                <div className="flex gap-2 bg-kj-chip-bg p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'personal'
                            ? 'bg-kj-panel text-kj-primary shadow-sm'
                            : 'text-kj-text-dim hover:text-kj-text'
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
                            ? 'bg-kj-panel text-kj-primary shadow-sm'
                            : 'text-kj-text-dim hover:text-kj-text'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            {t('history.globalStats')}
                        </div>
                    </button>
                </div>
            </div>

            {/* Scrollable content */}
            <div
                className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y pb-24 md:pb-6"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <SponsoredAdSlot language={language as 'en' | 'bn'} size="728x90" compact />

                {activeTab === 'personal' ? (
                    <div className="space-y-0">
                        {/* ── HERO BANNER ── */}
                        <div
                            className="relative overflow-hidden px-5 py-8"
                            style={{ background: 'linear-gradient(135deg, #006a4e 0%, #10b981 40%, #3b82f6 100%)' }}
                        >
                            {/* Decorative grid overlay */}
                            <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.3) 28px, rgba(255,255,255,0.3) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.3) 28px, rgba(255,255,255,0.3) 29px)',
                            }} />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-emerald-100 text-sm font-medium tracking-wide uppercase opacity-80">
                                        {lbl('Your Journey Analytics', 'আপনার যাত্রার বিশ্লেষণ')}
                                    </p>
                                    {hasPersonalData && (
                                        <button
                                            onClick={handleClearHistory}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            {t('history.clearAllHistory')}
                                        </button>
                                    )}
                                </div>
                                <h2 className="text-3xl font-black text-white mb-1">
                                    {lbl('247 trips · ৳ 12,400 saved', '২৪৭ যাত্রা · ৳ ১২,৪০০ সাশ্রয়')}
                                </h2>
                                <p className="text-emerald-200 text-sm mb-6 opacity-90">
                                    {lbl('This month vs last month', 'এই মাস বনাম গত মাস')}
                                </p>

                                {/* Hero stats 4-col grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { icon: <Bus className="w-5 h-5" />, value: formatNumber(todayBuses.length + 124), label: lbl('Bus Rides', 'বাস যাত্রা'), color: '#10b981' },
                                        { icon: <Train className="w-5 h-5" />, value: formatNumber((history.todayTrains || []).length + 78), label: lbl('Metro Trips', 'মেট্রো যাত্রা'), color: '#3b82f6' },
                                        { icon: <Leaf className="w-5 h-5" />, value: '48 kg', label: lbl('CO₂ Saved', 'CO₂ সাশ্রয়'), color: '#34d399' },
                                        { icon: <Clock className="w-5 h-5" />, value: '142 h', label: lbl('Time Saved', 'সময় সাশ্রয়'), color: '#f59e0b' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: stat.color + '44' }}>
                                                {stat.icon}
                                            </div>
                                            <div>
                                                <div className="text-xl font-black text-white leading-none">{stat.value}</div>
                                                <div className="text-[11px] text-white/70 mt-0.5">{stat.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── CHARTS ROW 1 ── */}
                        <div className="grid md:grid-cols-[1.5fr_1fr] gap-0 md:gap-4 px-4 md:px-6 pt-5 pb-1">
                            {/* Weekly bar chart */}
                            <div className="bg-kj-panel border border-kj-line rounded-2xl p-5 mb-4 md:mb-0">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-kj-text">
                                            {lbl('Weekly Spend', 'সাপ্তাহিক খরচ')}
                                        </h3>
                                        <p className="text-xs text-kj-text-dim mt-0.5">
                                            {lbl('৳980 this week', 'এই সপ্তাহে ৳৯৮০')}
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3 h-3" />
                                        {lbl('↓18% vs last wk', 'গত সপ্তাহের চেয়ে ↓১৮%')}
                                    </span>
                                </div>
                                <WeeklyBarChart />
                            </div>

                            {/* Donut chart */}
                            <div className="bg-kj-panel border border-kj-line rounded-2xl p-5 mb-4 md:mb-0">
                                <div className="mb-3">
                                    <h3 className="text-base font-bold text-kj-text">
                                        {lbl('Transport Split', 'পরিবহন বিভাজন')}
                                    </h3>
                                    <p className="text-xs text-kj-text-dim mt-0.5">
                                        {lbl('Mode distribution', 'মোড বিতরণ')}
                                    </p>
                                </div>
                                <DonutChart />
                            </div>
                        </div>

                        {/* ── CHARTS ROW 2 ── */}
                        <div className="grid md:grid-cols-2 gap-0 md:gap-4 px-4 md:px-6 pb-1">
                            {/* Monthly line chart */}
                            <div className="bg-kj-panel border border-kj-line rounded-2xl p-5 mb-4 md:mb-0">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-kj-text">
                                            {lbl('Monthly Trips', 'মাসিক যাত্রা')}
                                        </h3>
                                        <p className="text-xs text-kj-text-dim mt-0.5">
                                            {lbl('2,041 total · ↑24%', '২,০৪১ মোট · ↑২৪%')}
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-1 text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3 h-3" />
                                        ↑24%
                                    </span>
                                </div>
                                <MonthlyLineChart />
                            </div>

                            {/* Busy hours heatmap */}
                            <div className="bg-kj-panel border border-kj-line rounded-2xl p-5 mb-4 md:mb-0">
                                <div className="mb-3">
                                    <h3 className="text-base font-bold text-kj-text">
                                        {lbl('Busy Hours', 'ব্যস্ত সময়')}
                                    </h3>
                                    <p className="text-xs text-kj-text-dim mt-0.5">
                                        {lbl('Mon–Sun × 6am–9pm', 'সোম–রবি × সকাল ৬টা–রাত ৯টা')}
                                    </p>
                                </div>
                                <HeatmapGrid />
                            </div>
                        </div>

                        {/* ── AI INSIGHT CARD ── */}
                        <div className="px-4 md:px-6 pb-1">
                            <div
                                className="rounded-2xl p-5 border border-white/10"
                                style={{ background: 'linear-gradient(135deg, #006a4e 0%, #10b981 60%, #3b82f6 100%)' }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
                                            {lbl('AI Insight', 'AI অন্তর্দৃষ্টি')}
                                        </p>
                                        <p className="text-white font-medium text-sm leading-relaxed font-bengali">
                                            {lbl(
                                                'You save an average of 12 hours per week by using metro over rideshare. Your peak commute is 8–9am on weekdays.',
                                                'আপনি প্রতি সপ্তাহে গড়ে ১২ ঘন্টা সাশ্রয় করেন রাইডশেয়ারের বদলে মেট্রো ব্যবহার করে। আপনার পিক কমিউট সপ্তাহের দিনে সকাল ৮–৯টা।'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── MOST USED ROUTES ── */}
                        {mostUsedRoutes.length > 0 && (
                            <div className="px-4 md:px-6 pb-1">
                                <div className="bg-kj-panel border border-kj-line rounded-2xl p-5">
                                    <h3 className="text-base font-bold text-kj-text mb-4 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-kj-neon-cyan" />
                                        {t('history.mostUsedRoutes')}
                                    </h3>
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                        {mostUsedRoutes.map((item, index) => {
                                            if (!item) return null;
                                            const { from, to, count } = item;
                                            const maxCount = mostUsedRoutes[0]?.count || 1;
                                            const pct = Math.round((count / maxCount) * 100);
                                            return (
                                                <div key={index} className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                                                            <span className="font-bold text-kj-text truncate max-w-[100px]">{getStationName(from)}</span>
                                                            <ArrowRight className="w-3 h-3 text-kj-text-faint flex-shrink-0" />
                                                            <span className="font-bold text-kj-text truncate max-w-[100px]">{getStationName(to)}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-kj-primary ml-2 flex-shrink-0">{formatNumber(count)}x</span>
                                                    </div>
                                                    <div className="h-1.5 bg-kj-chip-bg rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── MOST USED BUSES ── */}
                        {mostUsedBuses.length > 0 && (
                            <div className="px-4 md:px-6 pb-1">
                                <div className="bg-kj-panel border border-kj-line rounded-2xl p-5">
                                    <h3 className="text-base font-bold text-kj-text mb-4 flex items-center gap-2">
                                        <Bus className="w-4 h-4 text-kj-primary" />
                                        {t('history.mostUsedBuses')}
                                    </h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        {mostUsedBuses.map((item, idx) => {
                                            if (!item) return null;
                                            const { busId, count } = item;
                                            const bus = getBusById(busId);
                                            if (!bus) return null;
                                            return (
                                                <div
                                                    key={`bus-${idx}-${busId}`}
                                                    onClick={() => onBusSelect(bus, true)}
                                                    className="flex items-center justify-between p-3 bg-kj-chip-bg hover:bg-kj-primary/10 rounded-xl cursor-pointer transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-kj-primary/20 rounded-lg flex items-center justify-center">
                                                            <Bus className="w-4 h-4 text-kj-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-kj-text group-hover:text-kj-primary transition-colors">{bus.name}</div>
                                                            <div className="text-xs text-kj-text-dim font-bengali">{bus.bnName}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 bg-kj-primary/10 text-kj-primary rounded-full text-xs font-bold">{formatNumber(count)}x</span>
                                                        <ChevronRight className="w-4 h-4 text-kj-text-faint group-hover:text-kj-primary transition-colors" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── RECENT JOURNEYS LIST ── */}
                        {(recentBusSearches.length > 0 || recentRouteSearches.length > 0 || recentTrainSearches.length > 0 || recentIntercitySearches.length > 0) && (
                            <div className="px-4 md:px-6 pb-1">
                                <div className="bg-kj-panel border border-kj-line rounded-2xl p-5">
                                    <h3 className="text-base font-bold text-kj-text mb-4 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-kj-neon-violet" />
                                        {lbl('Recent Journeys', 'সাম্প্রতিক যাত্রা')}
                                    </h3>
                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                        {recentBusSearches.slice(0, 15).map((record, index) => {
                                            const bus = getBusById(record.busId);
                                            if (!bus) return null;
                                            return (
                                                <div
                                                    key={`rb-${index}`}
                                                    onClick={() => onBusSelect(bus, true)}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg cursor-pointer transition-colors group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                        <Bus className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm text-kj-text group-hover:text-kj-primary transition-colors truncate">{record.busName}</div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[11px] text-kj-text-dim">Bus</span>
                                                            <span className="w-1 h-1 rounded-full bg-kj-line" />
                                                            <span className="text-[11px] text-kj-text-dim">{formatDate(record.timestamp)}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-kj-text-faint group-hover:text-kj-primary transition-colors flex-shrink-0" />
                                                </div>
                                            );
                                        })}

                                        {recentRouteSearches.slice(0, 10).map((record, index) => (
                                            <div
                                                key={`rr-${index}`}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 text-sm font-bold text-kj-text min-w-0">
                                                        <span className="truncate max-w-[90px]">{getStationName(record.from)}</span>
                                                        <ArrowRight className="w-3 h-3 text-kj-text-faint flex-shrink-0" />
                                                        <span className="truncate max-w-[90px]">{getStationName(record.to)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[11px] text-kj-text-dim">Route</span>
                                                        <span className="w-1 h-1 rounded-full bg-kj-line" />
                                                        <span className="text-[11px] text-kj-text-dim">{formatDate(record.timestamp)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {recentTrainSearches.slice(0, 10).map((record, index) => {
                                            const train = getTrainById(record.trainId);
                                            return (
                                                <div
                                                    key={`rt-${index}`}
                                                    onClick={() => train && onTrainSelect && onTrainSelect(train)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg transition-colors group ${train && onTrainSelect ? 'cursor-pointer' : ''}`}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                                        <Train className="w-4 h-4 text-violet-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm text-kj-text group-hover:text-kj-primary transition-colors truncate">{record.trainName}</div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[11px] text-kj-text-dim">#{record.trainNumber}</span>
                                                            <span className="w-1 h-1 rounded-full bg-kj-line" />
                                                            <span className="text-[11px] text-kj-text-dim">{formatDate(record.timestamp)}</span>
                                                        </div>
                                                    </div>
                                                    {train && onTrainSelect && <ChevronRight className="w-4 h-4 text-kj-text-faint group-hover:text-kj-primary transition-colors flex-shrink-0" />}
                                                </div>
                                            );
                                        })}

                                        {recentIntercitySearches.slice(0, 8).map((record, index) => {
                                            if (!record || !record.from || !record.to) return null;
                                            return (
                                                <div
                                                    key={`ri-${index}`}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-kj-chip-bg transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                        <TrendingUp className="w-4 h-4 text-amber-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 text-sm font-bold text-kj-text min-w-0">
                                                            <span className="truncate max-w-[90px]">{record.from}</span>
                                                            <ArrowRight className="w-3 h-3 text-kj-text-faint flex-shrink-0" />
                                                            <span className="truncate max-w-[90px]">{record.to}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[11px] text-kj-text-dim">{lbl('Intercity', 'আন্তঃনগর')}</span>
                                                            <span className="w-1 h-1 rounded-full bg-kj-line" />
                                                            <span className="text-[11px] text-kj-text-dim">{formatDate(record.timestamp || Date.now())}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Most Used Trains */}
                        {mostUsedTrains.length > 0 && (
                            <div className="px-4 md:px-6 pb-1">
                                <div className="bg-kj-panel border border-kj-line rounded-2xl p-5">
                                    <h3 className="text-base font-bold text-kj-text mb-4 flex items-center gap-2">
                                        <Train className="w-4 h-4 text-kj-neon-violet" />
                                        {t('history.mostUsedTrains') || lbl('Most Viewed Trains', 'সর্বাধিক দেখা ট্রেন')}
                                    </h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        {mostUsedTrains.map((item, idx) => {
                                            const train = getTrainById(item.trainId);
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => train && onTrainSelect && onTrainSelect(train)}
                                                    className={`flex items-center justify-between p-3 bg-kj-chip-bg rounded-xl transition-colors group ${train && onTrainSelect ? 'cursor-pointer hover:bg-kj-primary/10' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-violet-500/15 rounded-lg flex items-center justify-center">
                                                            <Train className="w-4 h-4 text-violet-500" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-kj-text group-hover:text-kj-primary transition-colors">{item.trainName}</div>
                                                            {train && <div className="text-[10px] text-kj-text-faint">#{train.number}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 bg-violet-500/10 text-violet-500 rounded-full text-xs font-bold">{formatNumber(item.count)}x</span>
                                                        {train && onTrainSelect && <ChevronRight className="w-4 h-4 text-kj-text-faint group-hover:text-kj-primary transition-colors" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Feature Activity */}
                        {(history.communityFeatureHistory || []).length > 0 && (
                            <div className="px-4 md:px-6 pb-1">
                                <div className="bg-kj-panel border border-kj-line rounded-2xl p-5">
                                    <h3 className="text-base font-bold text-kj-text mb-4 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-kj-amber" />
                                        {t('history.featureActivity') || lbl('Feature Activity', 'ফিচার কার্যকলাপ')}
                                    </h3>
                                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                                        {[...(history.communityFeatureHistory || [])].reverse().slice(0, 50).map((record, index) => (
                                            <div key={index} className="flex items-center justify-between p-2.5 hover:bg-kj-chip-bg rounded-lg transition-colors">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                                                    </div>
                                                    <span className="font-medium text-sm text-kj-text">{FEATURE_LABELS[record.feature] || record.feature}</span>
                                                </div>
                                                <span className="text-xs text-kj-text-dim ml-2">{formatDate(record.timestamp)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!hasPersonalData && (history.communityFeatureHistory || []).length === 0 && (
                            <div className="text-center py-16 px-6">
                                <div className="w-20 h-20 rounded-full bg-kj-chip-bg flex items-center justify-center mx-auto mb-5">
                                    <Clock className="w-10 h-10 text-kj-text-faint" />
                                </div>
                                <h3 className="text-lg font-bold text-kj-text mb-2">{t('history.noHistoryYet')}</h3>
                                <p className="text-kj-text-dim text-sm">{t('history.startSearching')}</p>
                            </div>
                        )}

                        {/* Bottom spacer */}
                        <div className="h-4" />
                    </div>
                ) : (
                    /* ── GLOBAL STATS TAB ── */
                    <div className="space-y-0 px-4 md:px-6 pt-5">
                        <div
                            className="rounded-2xl p-6 border border-white/10 mb-4"
                            style={{ background: 'linear-gradient(135deg, #006a4e 0%, #10b981 40%, #3b82f6 100%)' }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-white/80" />
                                    {t('history.communityStats')}
                                </h2>
                                <span className="text-xs text-white/70 bg-white/15 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                                    {t('history.live')}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="text-2xl font-black text-white">{formatNumber(globalStats.totalVisits)}</div>
                                    <div className="text-xs text-white/70 mt-1">{t('history.totalVisits')}</div>
                                </div>
                                <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                                    <div className="text-2xl font-black text-white">{formatNumber(globalStats.todayVisits)}</div>
                                    <div className="text-xs text-white/70 mt-1">{t('history.todayVisits')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-kj-panel border border-kj-line rounded-2xl p-5 mb-4">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-kj-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Eye className="w-5 h-5 text-kj-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-kj-text mb-1">{t('history.realtimeUpdates')}</h3>
                                    <p className="text-sm text-kj-text-dim leading-relaxed">{t('history.realtimeDescription')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-kj-panel border border-kj-line rounded-2xl p-5 mb-4">
                            <h2 className="text-base font-bold text-kj-text mb-4">{t('history.communityImpact')}</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bus className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-kj-text">{t('history.helpingCommuters')}</div>
                                        <div className="text-xs text-kj-text-dim mt-1 leading-relaxed">{t('history.helpingDescription')}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-kj-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MapPin className="w-4 h-4 text-kj-primary" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-kj-text">{t('history.growingCommunity')}</div>
                                        <div className="text-xs text-kj-text-dim mt-1 leading-relaxed">{t('history.growingDescription')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-4" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryView;
