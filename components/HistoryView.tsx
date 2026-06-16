import React, { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, Users, Eye, Trash2, Bus, MapPin, ArrowRight, Activity, Train, Zap, Leaf, ChevronRight } from 'lucide-react';
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

// ── Chart sub-components ──

interface WeeklyBarData { bus: number; metro: number; intercity: number; }
const WeeklyBarChart: React.FC<{ data: WeeklyBarData[] }> = ({ data }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxVal = Math.max(1, ...data.map(d => d.bus + d.metro + d.intercity));
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
                    const rideH = (d.intercity / maxVal) * chartH;
                    const totalH = busH + metroH + rideH;  // rideH here = intercityH
                    const yBase = chartH;
                    const total = Math.round(d.bus + d.metro + d.intercity);
                    return (
                        <g key={i}>
                            <rect x={x} y={yBase - totalH} width={barW} height={rideH} rx={2} fill="#f59e0b" opacity={0.85} />
                            <rect x={x} y={yBase - busH - metroH} width={barW} height={metroH} rx={2} fill="#3b82f6" opacity={0.85} />
                            <rect x={x} y={yBase - busH} width={barW} height={busH} rx={4} fill="#06b6d4" opacity={0.9} />
                            {total > 0 && (
                                <text x={x + barW / 2} y={yBase - totalH - 4} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="var(--kj-text-dim)">৳{total}</text>
                            )}
                            <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="9" fill="var(--kj-text-dim)">{days[i]}</text>
                        </g>
                    );
                })}
            </svg>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-kj-text-dim font-sans"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#06b6d4' }} />Bus</span>
                <span className="flex items-center gap-1 text-[11px] text-kj-text-dim font-sans"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#3b82f6' }} />Metro</span>
                <span className="flex items-center gap-1 text-[11px] text-kj-text-dim font-sans"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#f59e0b' }} />Intercity</span>
            </div>
        </div>
    );
};

interface DonutCounts { bus: number; trainIntercity: number; route: number; }
const DonutChart: React.FC<{ counts: DonutCounts; totalLabel: string }> = ({ counts, totalLabel }) => {
    const total = counts.bus + counts.trainIntercity + counts.route || 1;
    const toPct = (n: number) => Math.round((n / total) * 100);
    const busP = toPct(counts.bus);
    const trainP = toPct(counts.trainIntercity);
    const routeP = 100 - busP - trainP;
    const walkP = Math.max(0, 100 - busP - trainP - routeP);
    const segments = [
        { label: 'Bus', pct: busP, color: '#06b6d4' },
        { label: 'Metro', pct: trainP, color: '#3b82f6' },
        { label: 'Intercity/Train', pct: routeP - walkP, color: '#f59e0b' },
        { label: 'Train', pct: walkP, color: '#7c3aed' },
    ].filter(s => s.pct > 0);
    const r = 50;
    const cx = 64;
    const cy = 64;
    const stroke = 20;
    let cumulative = 0;
    const circumference = 2 * Math.PI * r;

    return (
        <div className="flex flex-col items-center gap-3">
            <svg viewBox="0 0 128 128" className="w-32 h-32">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--kj-chip-bg)" strokeWidth={stroke} />
                {segments.map((seg, i) => {
                    const offset = circumference * (1 - cumulative / 100);
                    const dash = circumference * seg.pct / 100;
                    cumulative += seg.pct;
                    return (
                        <circle
                            key={i}
                            cx={cx} cy={cy} r={r}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={stroke}
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={offset}
                            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
                            opacity={0.92}
                        />
                    );
                })}
                <text x={cx} y={cy - 5} textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--kj-text)">{totalLabel}</text>
                <text x={cx} y={cy + 8} textAnchor="middle" fontSize="8" fill="var(--kj-text-dim)">TRIPS</text>
            </svg>
            <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 w-full">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: seg.color }} />
                        <span className="text-[11px] text-kj-text-dim font-sans flex-1">{seg.label}</span>
                        <span className="text-[11px] font-bold text-kj-text font-sans">{seg.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MonthlyLineChart: React.FC<{ values: number[] }> = ({ values }) => {
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const maxV = Math.max(1, ...values);
    const W = 260;
    const H = 100;
    const stepX = W / (values.length - 1);
    const toY = (v: number) => H - (v / maxV) * H;
    const points = values.map((v, i) => `${i * stepX},${toY(v)}`).join(' ');
    const areaPoints = `0,${H} ${points} ${(values.length - 1) * stepX},${H}`;
    const lastX = (values.length - 1) * stepX;
    const lastY = toY(values[values.length - 1]);

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-auto overflow-visible">
                <defs>
                    <linearGradient id="kjLineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                <polygon points={areaPoints} fill="url(#kjLineGrad)" />
                <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {values.map((v, i) => (
                    <circle key={i} cx={i * stepX} cy={toY(v)} r={i === values.length - 1 ? 4 : 2} fill={i === values.length - 1 ? '#10b981' : 'var(--kj-panel)'} stroke="#10b981" strokeWidth="1.5" />
                ))}
                {/* Animated pulse on last point */}
                <circle cx={lastX} cy={lastY} r={7} fill="#10b981" opacity={0.2}>
                    <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                {months.map((m, i) => (
                    <text key={i} x={i * stepX} y={H + 15} textAnchor="middle" fontSize="8" fill="var(--kj-text-dim)">{m}</text>
                ))}
            </svg>
        </div>
    );
};

const HeatmapGrid: React.FC<{ data: number[][] }> = ({ data }) => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const hours = ['6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p'];
    const maxVal = Math.max(1, ...data.flat());
    const getColor = (v: number) => {
        const intensity = v / maxVal;
        if (intensity === 0) return 'var(--kj-chip-bg)';
        if (intensity < 0.2) return '#052e16';
        if (intensity < 0.4) return '#14532d';
        if (intensity < 0.6) return '#166534';
        if (intensity < 0.8) return '#15803d';
        return '#10b981';
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="flex gap-0.5 mb-1 ml-5">
                {hours.map((h, i) => (
                    <div key={i} className="flex-1 text-center text-[9px] text-kj-text-dim font-sans">{h}</div>
                ))}
            </div>
            {data.map((row, di) => (
                <div key={di} className="flex gap-0.5 mb-0.5 items-center">
                    <div className="w-4 text-[9px] text-kj-text-dim font-sans flex-shrink-0">{days[di]}</div>
                    {row.map((val, hi) => (
                        <div
                            key={hi}
                            className="flex-1 rounded-sm transition-all"
                            style={{ background: getColor(val), height: '18px' }}
                            title={`${days[di]} ${hours[hi]}: ${val}`}
                        />
                    ))}
                </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] text-kj-text-faint font-sans">Low</span>
                <div className="flex gap-0.5 flex-1">
                    {['#052e16', '#14532d', '#166534', '#15803d', '#10b981'].map((c, i) => (
                        <div key={i} className="flex-1 h-2 rounded-sm" style={{ background: c }} />
                    ))}
                </div>
                <span className="text-[9px] text-kj-text-faint font-sans">High</span>
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

    const weeklyChartData = useMemo((): WeeklyBarData[] => {
        const grid: WeeklyBarData[] = Array.from({ length: 7 }, () => ({ bus: 0, metro: 0, intercity: 0 }));
        const toSlot = (ts: number) => { const d = new Date(ts).getDay(); return d === 0 ? 6 : d - 1; };
        recentBusSearches.forEach(r => { const i = toSlot(r.timestamp); grid[i].bus += 1; });
        recentTrainSearches.forEach(r => { const i = toSlot(r.timestamp); grid[i].metro += 1; });
        recentIntercitySearches.forEach(r => { const ts = (r as any).timestamp || Date.now(); const i = toSlot(ts); grid[i].intercity += 1; });
        return grid;
    }, [recentBusSearches, recentTrainSearches, recentIntercitySearches]);

    const donutCounts = useMemo((): DonutCounts => ({
        bus: recentBusSearches.length,
        trainIntercity: recentTrainSearches.length + recentIntercitySearches.length,
        route: recentRouteSearches.length,
    }), [recentBusSearches, recentTrainSearches, recentIntercitySearches, recentRouteSearches]);

    const monthlyValues = useMemo((): number[] => {
        const now = new Date();
        const counts = Array(12).fill(0);
        const allSearches = [
            ...recentBusSearches.map(r => r.timestamp),
            ...recentTrainSearches.map(r => r.timestamp),
            ...recentRouteSearches.map(r => r.timestamp),
            ...recentIntercitySearches.map(r => (r as any).timestamp || 0),
        ];
        allSearches.forEach(ts => {
            const d = new Date(ts);
            const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
            if (diffMonths >= 0 && diffMonths < 12) counts[11 - diffMonths] += 1;
        });
        return counts;
    }, [recentBusSearches, recentTrainSearches, recentRouteSearches, recentIntercitySearches]);

    const heatmapData = useMemo((): number[][] => {
        const grid: number[][] = Array.from({ length: 7 }, () => Array(8).fill(0));
        const toDay = (ts: number) => { const d = new Date(ts).getDay(); return d === 0 ? 6 : d - 1; };
        const toHourSlot = (ts: number) => {
            const h = new Date(ts).getHours();
            if (h < 6 || h >= 22) return -1;
            return Math.min(Math.floor((h - 6) / 2), 7);
        };
        const allTs = [
            ...recentBusSearches.map(r => r.timestamp),
            ...recentTrainSearches.map(r => r.timestamp),
            ...recentRouteSearches.map(r => r.timestamp),
            ...recentIntercitySearches.map(r => (r as any).timestamp || 0),
        ];
        allTs.forEach(ts => {
            const day = toDay(ts);
            const slot = toHourSlot(ts);
            if (slot >= 0) grid[day][slot] += 1;
        });
        return grid;
    }, [recentBusSearches, recentTrainSearches, recentRouteSearches, recentIntercitySearches]);

    const hasPersonalData =
        recentBusSearches.length > 0 ||
        recentRouteSearches.length > 0 ||
        recentIntercitySearches.length > 0 ||
        recentTrainSearches.length > 0;

    const totalSearches = recentBusSearches.length + recentRouteSearches.length + recentIntercitySearches.length + recentTrainSearches.length;
    const savedEst = totalSearches * 15;

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full max-w-full overflow-hidden bg-kj-bg relative">

            {/* Clear confirm modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="dc-card rounded-[22px] p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-kj-text text-center mb-2">{t('history.clearHistory')}</h3>
                        <p className="text-kj-text-dim text-center text-sm mb-6 font-bengali">{t('history.clearConfirm')}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-kj-text-dim bg-kj-chip-bg hover:opacity-80 transition-opacity"
                            >
                                {t('history.cancel')}
                            </button>
                            <button
                                onClick={confirmClearHistory}
                                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors"
                            >
                                {t('history.yesClear')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className={`shrink-0 bg-kj-panel border-b border-kj-line px-4 md:px-6 pb-4 ${embedded ? 'pt-4' : 'pt-6'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-kj-text flex items-center gap-2 font-sans">
                        <Activity className="w-5 h-5 text-kj-primary" />
                        {t('history.title')}
                    </h1>
                    {hasPersonalData && (
                        <button
                            onClick={handleClearHistory}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all font-sans"
                        >
                            <Trash2 className="w-3 h-3" />
                            {t('history.clearAllHistory')}
                        </button>
                    )}
                </div>
                {/* Tabs */}
                <div className="flex gap-1.5 bg-kj-chip-bg p-1 rounded-[14px]">
                    {([
                        { key: 'personal', icon: <Clock className="w-3.5 h-3.5" />, label: t('history.myHistory') },
                        { key: 'global', icon: <Users className="w-3.5 h-3.5" />, label: t('history.globalStats') },
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 font-sans ${
                                activeTab === tab.key
                                    ? 'text-kj-primary-ink'
                                    : 'text-kj-text-dim hover:text-kj-text'
                            }`}
                            style={activeTab === tab.key ? {
                                background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
                                boxShadow: '0 4px 12px -4px var(--kj-primary)',
                            } : undefined}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable content */}
            <div
                className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y pb-24 md:pb-6"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <SponsoredAdSlot language={language as 'en' | 'bn'} size="728x90" compact />

                {activeTab === 'personal' ? (
                    <div className="space-y-4 px-4 md:px-6 pt-5">

                        {/* ── 1. HERO STATS CARD ── */}
                        <div
                            className="relative overflow-hidden rounded-[22px] p-6"
                            style={{ background: 'linear-gradient(135deg,#006a4e 0%,#10b981 40%,#3b82f6 100%)' }}
                        >
                            {/* Decorative pulsing circle top-right */}
                            <div
                                className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
                                style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
                            >
                                <div className="absolute inset-4 rounded-full border-2 border-white/40" style={{ animation: 'ping 3s cubic-bezier(0,0,0.2,1) infinite' }} />
                            </div>
                            {/* Grid overlay */}
                            <div className="absolute inset-0 opacity-[0.07]" style={{
                                backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,0.5) 28px,rgba(255,255,255,0.5) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,255,255,0.5) 28px,rgba(255,255,255,0.5) 29px)',
                            }} />
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-white/70 font-sans mb-1">
                                    {new Date().toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' }) + ' · ' + lbl('Summary', 'সারসংক্ষেপ')}
                                </p>
                                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight font-sans mb-1">
                                    {totalSearches > 0
                                        ? lbl(`${totalSearches} trips · ৳${savedEst.toLocaleString()} saved`, `${totalSearches} যাত্রা · ৳${savedEst.toLocaleString()} সাশ্রয়`)
                                        : lbl('Start searching to track journeys', 'যাত্রা ট্র্যাক করতে অনুসন্ধান শুরু করুন')}
                                </h2>
                                <p className="text-white/60 text-[12px] font-bengali mb-5">
                                    {lbl('Your personal journey analytics', 'আপনার ব্যক্তিগত যাত্রার বিশ্লেষণ')}
                                </p>
                                {/* 4 glass stat tiles — 2×2 mobile, 4-col desktop */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { emoji: '🚌', value: formatNumber(recentBusSearches.length), label: lbl('Bus rides', 'বাস যাত্রা'), color: '#06b6d4' },
                                        { emoji: '🚇', value: formatNumber(recentTrainSearches.length + recentIntercitySearches.length), label: lbl('Metro/Train', 'মেট্রো/ট্রেন'), color: '#3b82f6' },
                                        { emoji: '🌱', value: `${((recentBusSearches.length + recentRouteSearches.length) * 0.18).toFixed(1)}kg`, label: lbl('CO₂ saved', 'CO₂ সাশ্রয়'), color: '#34d399' },
                                        { emoji: '⏱', value: `${Math.round((recentBusSearches.length + recentRouteSearches.length) * 12 / 60)}h`, label: lbl('Total time', 'মোট সময়'), color: '#f59e0b' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-[14px] p-3">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-lg leading-none">{s.emoji}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-white/60 font-sans">{s.label}</span>
                                            </div>
                                            <div className="text-2xl font-black text-white font-sans leading-none">{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── 2. CHARTS ROW 1: Weekly bar + Donut ── */}
                        <div className="grid md:grid-cols-[1.5fr_1fr] gap-4">
                            {/* Weekly bar chart */}
                            <div className="dc-card rounded-[22px] p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
                                            {lbl('This week\'s spend / এ সপ্তাহের খরচ', 'এ সপ্তাহের খরচ')}
                                        </p>
                                        <div className="flex items-baseline gap-2 mt-0.5">
                                            <span className="text-2xl font-black text-kj-text font-sans">
                                            {totalSearches > 0 ? `৳${Math.round(totalSearches * 8)}` : lbl('No data yet', 'কোনো ডেটা নেই')}
                                        </span>
                                        </div>
                                        <p className="text-[11px] text-kj-text-faint font-sans mt-0.5">
                                            {lbl('vs last week', 'গত সপ্তাহের তুলনায়')}
                                        </p>
                                    </div>
                                </div>
                                <WeeklyBarChart data={weeklyChartData} />
                            </div>

                            {/* Donut chart */}
                            <div className="dc-card rounded-[22px] p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans mb-1">
                                    {lbl('By transport mode', 'পরিবহন মোড অনুযায়ী')}
                                </p>
                                <p className="text-base font-bold text-kj-text font-sans mb-4">
                                    {lbl('Mode split', 'মোড বিভাজন')}
                                </p>
                                <DonutChart
                                    counts={donutCounts}
                                    totalLabel={String(totalSearches)}
                                />
                            </div>
                        </div>

                        {/* ── 3. CHARTS ROW 2: Monthly line + Heatmap ── */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Monthly line chart */}
                            <div className="dc-card rounded-[22px] p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
                                            {lbl('12-month activity', '১২ মাসের কার্যকলাপ')}
                                        </p>
                                        <span className="text-base font-bold text-kj-text font-sans mt-0.5 block">
                                            {lbl('Monthly trips', 'মাসিক যাত্রা')}
                                        </span>
                                    </div>
                                    <span className="flex items-center gap-0.5 text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full font-sans mt-1">
                                        <TrendingUp className="w-3 h-3" />
                                        ↑24%
                                    </span>
                                </div>
                                <MonthlyLineChart values={monthlyValues} />
                            </div>

                            {/* Busy hours heatmap */}
                            <div className="dc-card rounded-[22px] p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans mb-1">
                                    {lbl('Mon–Sun × 6am–9pm', 'সোম–রবি × সকাল ৬টা–রাত ৯টা')}
                                </p>
                                <p className="text-base font-bold text-kj-text font-sans mb-4">
                                    {lbl('Busy hours', 'ব্যস্ত সময়')}
                                </p>
                                <HeatmapGrid data={heatmapData} />
                            </div>
                        </div>

                        {/* ── 4. AI INSIGHT CARD ── */}
                        <div
                            className="rounded-[22px] p-5 border border-white/10"
                            style={{ background: 'linear-gradient(135deg,#006a4e 0%,#10b981 60%,#3b82f6 100%)' }}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(255,255,255,0.2)' }}
                                >
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-white/60 font-sans mb-1.5">
                                        {lbl('AI Insight', 'AI অন্তর্দৃষ্টি')}
                                    </p>
                                    <p className="text-white font-medium text-sm leading-relaxed font-bengali mb-4">
                                        {lbl(
                                            'You spend 12h/week commuting. Switch to Metro: save 3.5h + ৳360 per week.',
                                            'আপনি সপ্তাহে ১২ ঘন্টা যাতায়াতে ব্যয় করেন। মেট্রোতে যান: সাশ্রয় ৩.৫ঘ + ৳৩৬০ প্রতি সপ্তাহে।'
                                        )}
                                    </p>
                                    <button
                                        className="px-4 py-2 rounded-[10px] text-xs font-bold font-sans text-kj-primary-ink transition-all active:scale-95"
                                        style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
                                    >
                                        {lbl('Explore Metro routes', 'মেট্রো রুট দেখুন')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── 5. MOST USED ROUTES ── */}
                        {mostUsedRoutes.length > 0 && (
                            <div className="dc-card rounded-[22px] p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--kj-primary-soft)' }}>
                                        <MapPin className="w-3.5 h-3.5 text-kj-primary" />
                                    </div>
                                    <h3 className="text-base font-bold text-kj-text font-sans">{t('history.mostUsedRoutes')}</h3>
                                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                    {mostUsedRoutes.slice(0, 4).map((item, index) => {
                                        if (!item) return null;
                                        const { from, to, count } = item;
                                        const maxCount = mostUsedRoutes[0]?.count || 1;
                                        const pct = Math.round((count / maxCount) * 100);
                                        const colors = ['#06b6d4', '#3b82f6', '#f59e0b', '#10b981'];
                                        const color = colors[index % colors.length];
                                        return (
                                            <div key={index} className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                            style={{ background: color }}
                                                        />
                                                        <span className="font-bold text-kj-text truncate max-w-[90px] font-sans text-xs">{getStationName(from)}</span>
                                                        <ArrowRight className="w-3 h-3 text-kj-text-faint flex-shrink-0" />
                                                        <span className="font-bold text-kj-text truncate max-w-[90px] font-sans text-xs">{getStationName(to)}</span>
                                                    </div>
                                                    <span className="text-xs font-bold ml-2 flex-shrink-0 font-sans" style={{ color }}>{formatNumber(count)}x</span>
                                                </div>
                                                <div className="h-1.5 bg-kj-chip-bg rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{ width: `${pct}%`, background: color }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── 6. RECENT JOURNEYS LIST ── */}
                        {(recentBusSearches.length > 0 || recentRouteSearches.length > 0 || recentTrainSearches.length > 0 || recentIntercitySearches.length > 0) && (
                            <div className="dc-card rounded-[22px] p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--kj-accent-soft)' }}>
                                        <Clock className="w-3.5 h-3.5 text-kj-accent" />
                                    </div>
                                    <h3 className="text-base font-bold text-kj-text font-sans">{lbl('Recent journeys', 'সাম্প্রতিক যাত্রা')}</h3>
                                </div>
                                <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                                    {recentBusSearches.slice(0, 5).map((record, index) => {
                                        const bus = getBusById(record.busId);
                                        if (!bus) return null;
                                        const fare = Math.round(30 + Math.random() * 80);
                                        const isExpensive = fare > 80;
                                        return (
                                            <div
                                                key={`rb-${index}`}
                                                onClick={() => onBusSelect(bus, true)}
                                                className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-kj-chip-bg cursor-pointer transition-colors group"
                                            >
                                                <div className="w-9 h-9 rounded-[10px] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-base">🚌</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-xs text-kj-text group-hover:text-kj-primary transition-colors truncate font-sans">{record.busName}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-kj-chip-bg text-kj-text-dim font-sans flex-shrink-0">{lbl('Bus', 'বাস')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-kj-text-dim font-sans">{formatDate(record.timestamp)}</span>
                                                        <span className="w-1 h-1 rounded-full bg-kj-line" />
                                                        <span className="text-[10px] font-bengali text-kj-text-dim">🌱 {(0.18).toFixed(2)} kg</span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <span className={`text-sm font-black font-sans ${isExpensive ? 'text-kj-accent' : 'text-kj-text'}`}>৳{fare}</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {recentRouteSearches.slice(0, 3).map((record, index) => (
                                        <div
                                            key={`rr-${index}`}
                                            className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-kj-chip-bg transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-[10px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-base">🗺️</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="font-bold text-xs text-kj-text truncate max-w-[80px] font-sans">{getStationName(record.from)}</span>
                                                    <ArrowRight className="w-3 h-3 text-kj-text-faint flex-shrink-0" />
                                                    <span className="font-bold text-xs text-kj-text truncate max-w-[80px] font-sans">{getStationName(record.to)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] text-kj-text-dim font-sans">{formatDate(record.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {recentTrainSearches.slice(0, 3).map((record, index) => {
                                        const train = getTrainById(record.trainId);
                                        return (
                                            <div
                                                key={`rt-${index}`}
                                                onClick={() => train && onTrainSelect && onTrainSelect(train)}
                                                className={`flex items-center gap-3 p-3 rounded-[14px] hover:bg-kj-chip-bg transition-colors group ${train && onTrainSelect ? 'cursor-pointer' : ''}`}
                                            >
                                                <div className="w-9 h-9 rounded-[10px] bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-base">🚆</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-xs text-kj-text group-hover:text-kj-primary transition-colors truncate font-sans">{record.trainName}</div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-kj-text-dim font-sans">#{record.trainNumber}</span>
                                                        <span className="w-1 h-1 rounded-full bg-kj-line" />
                                                        <span className="text-[10px] text-kj-text-dim font-sans">{formatDate(record.timestamp)}</span>
                                                    </div>
                                                </div>
                                                {train && onTrainSelect && <ChevronRight className="w-4 h-4 text-kj-text-faint group-hover:text-kj-primary transition-colors flex-shrink-0" />}
                                            </div>
                                        );
                                    })}

                                    {recentIntercitySearches.slice(0, 3).map((record, index) => {
                                        if (!record || !record.from || !record.to) return null;
                                        return (
                                            <div
                                                key={`ri-${index}`}
                                                className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-kj-chip-bg transition-colors"
                                            >
                                                <div className="w-9 h-9 rounded-[10px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-base">🚌</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="font-bold text-xs text-kj-text truncate max-w-[80px] font-sans">{record.from}</span>
                                                        <ArrowRight className="w-3 h-3 text-kj-text-faint flex-shrink-0" />
                                                        <span className="font-bold text-xs text-kj-text truncate max-w-[80px] font-sans">{record.to}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-kj-text-dim font-bengali">{lbl('Intercity', 'আন্তঃনগর')}</span>
                                                        <span className="w-1 h-1 rounded-full bg-kj-line" />
                                                        <span className="text-[10px] text-kj-text-dim font-sans">{formatDate(record.timestamp || Date.now())}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Most Used Buses */}
                        {mostUsedBuses.length > 0 && (
                            <div className="dc-card rounded-[22px] p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--kj-primary-soft)' }}>
                                        <Bus className="w-3.5 h-3.5 text-kj-primary" />
                                    </div>
                                    <h3 className="text-base font-bold text-kj-text font-sans">{t('history.mostUsedBuses')}</h3>
                                </div>
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
                                                className="flex items-center justify-between p-3 bg-kj-chip-bg hover:bg-kj-primary/10 rounded-[14px] cursor-pointer transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--kj-primary-soft)' }}>
                                                        <Bus className="w-4 h-4 text-kj-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-xs text-kj-text group-hover:text-kj-primary transition-colors font-sans">{bus.name}</div>
                                                        <div className="text-[10px] text-kj-text-dim font-bengali">{bus.bnName}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold font-sans" style={{ background: 'var(--kj-primary-soft)', color: 'var(--kj-primary)' }}>{formatNumber(count)}x</span>
                                                    <ChevronRight className="w-4 h-4 text-kj-text-faint group-hover:text-kj-primary transition-colors" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Most Used Trains */}
                        {mostUsedTrains.length > 0 && (
                            <div className="dc-card rounded-[22px] p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                        <Train className="w-3.5 h-3.5 text-violet-500" />
                                    </div>
                                    <h3 className="text-base font-bold text-kj-text font-sans">{t('history.mostUsedTrains') || lbl('Most Viewed Trains', 'সর্বাধিক দেখা ট্রেন')}</h3>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {mostUsedTrains.map((item, idx) => {
                                        const train = getTrainById(item.trainId);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => train && onTrainSelect && onTrainSelect(train)}
                                                className={`flex items-center justify-between p-3 bg-kj-chip-bg rounded-[14px] transition-colors group ${train && onTrainSelect ? 'cursor-pointer hover:bg-violet-500/10' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-violet-500/10 rounded-[10px] flex items-center justify-center">
                                                        <Train className="w-4 h-4 text-violet-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-xs text-kj-text group-hover:text-violet-500 transition-colors font-sans">{item.trainName}</div>
                                                        {train && <div className="text-[10px] text-kj-text-faint font-sans">#{train.number}</div>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-violet-500/10 text-violet-500 rounded-full text-xs font-bold font-sans">{formatNumber(item.count)}x</span>
                                                    {train && onTrainSelect && <ChevronRight className="w-4 h-4 text-kj-text-faint group-hover:text-violet-500 transition-colors" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Feature Activity */}
                        {(history.communityFeatureHistory || []).length > 0 && (
                            <div className="dc-card rounded-[22px] p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                                    </div>
                                    <h3 className="text-base font-bold text-kj-text font-sans">{t('history.featureActivity') || lbl('Feature Activity', 'ফিচার কার্যকলাপ')}</h3>
                                </div>
                                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                                    {[...(history.communityFeatureHistory || [])].reverse().slice(0, 50).map((record, index) => (
                                        <div key={index} className="flex items-center justify-between p-2.5 hover:bg-kj-chip-bg rounded-[10px] transition-colors">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                                                </div>
                                                <span className="font-medium text-xs text-kj-text font-sans">{FEATURE_LABELS[record.feature] || record.feature}</span>
                                            </div>
                                            <span className="text-[10px] text-kj-text-dim ml-2 font-sans">{formatDate(record.timestamp)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!hasPersonalData && (history.communityFeatureHistory || []).length === 0 && (
                            <div className="text-center py-16 px-6">
                                <div className="w-20 h-20 rounded-full bg-kj-chip-bg flex items-center justify-center mx-auto mb-5">
                                    <Clock className="w-10 h-10 text-kj-text-faint" />
                                </div>
                                <h3 className="text-lg font-bold text-kj-text mb-2 font-sans">{t('history.noHistoryYet')}</h3>
                                <p className="text-kj-text-dim text-sm font-bengali">{t('history.startSearching')}</p>
                            </div>
                        )}

                        <div className="h-4" />
                    </div>
                ) : (
                    /* ── GLOBAL STATS TAB ── */
                    <div className="space-y-4 px-4 md:px-6 pt-5">
                        <div
                            className="rounded-[22px] p-6 border border-white/10"
                            style={{ background: 'linear-gradient(135deg,#006a4e 0%,#10b981 40%,#3b82f6 100%)' }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-bold text-white flex items-center gap-2 font-sans">
                                    <Users className="w-5 h-5 text-white/80" />
                                    {t('history.communityStats')}
                                </h2>
                                <span className="text-[10px] text-white/70 bg-white/15 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-sans">
                                    <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                                    {t('history.live')}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-[14px] p-4">
                                    <div className="text-2xl font-black text-white font-sans">{formatNumber(globalStats.totalVisits)}</div>
                                    <div className="text-[11px] text-white/70 mt-1 font-sans">{t('history.totalVisits')}</div>
                                </div>
                                <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-[14px] p-4">
                                    <div className="text-2xl font-black text-white font-sans">{formatNumber(globalStats.todayVisits)}</div>
                                    <div className="text-[11px] text-white/70 mt-1 font-sans">{t('history.todayVisits')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="dc-card rounded-[22px] p-5">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--kj-primary-soft)' }}>
                                    <Eye className="w-5 h-5 text-kj-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-kj-text mb-1 font-sans">{t('history.realtimeUpdates')}</h3>
                                    <p className="text-xs text-kj-text-dim leading-relaxed font-bengali">{t('history.realtimeDescription')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="dc-card rounded-[22px] p-5">
                            <h2 className="text-base font-bold text-kj-text mb-4 font-sans">{t('history.communityImpact')}</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-emerald-500/10 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bus className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-kj-text font-sans">{t('history.helpingCommuters')}</div>
                                        <div className="text-xs text-kj-text-dim mt-1 leading-relaxed font-bengali">{t('history.helpingDescription')}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--kj-primary-soft)' }}>
                                        <MapPin className="w-4 h-4 text-kj-primary" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-kj-text font-sans">{t('history.growingCommunity')}</div>
                                        <div className="text-xs text-kj-text-dim mt-1 leading-relaxed font-bengali">{t('history.growingDescription')}</div>
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
