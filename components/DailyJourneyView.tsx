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
    ArrowLeft,
    Bus,
    Train,
    Footprints,
} from 'lucide-react';
import {
    getTodayJourney,
    getJourneyHistory,
    clearTodayJourney,
    formatDuration,
    formatDistance,
    type DailyJourney,
} from '../services/journeyTrackerService';
import { useLanguage } from '../contexts/LanguageContext';
import SponsoredAdSlot from './SponsoredAdSlot';


interface DailyJourneyViewProps {
    onBack: () => void;
}

const TODAY_DATES = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
});

const DailyJourneyView: React.FC<DailyJourneyViewProps> = ({ onBack }) => {
    const { t, formatNumber, language } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
    const [todayJourney, setTodayJourney] = useState<DailyJourney | null>(null);
    const [history, setHistory] = useState<DailyJourney[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const loadData = () => {
            setTodayJourney(getTodayJourney());
            setHistory(getJourneyHistory());
        };
        loadData();
        const interval = setInterval(loadData, 60000);
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

    const formatDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (dateStr === today.toISOString().split('T')[0]) return t('journey.today');
        if (dateStr === yesterday.toISOString().split('T')[0]) return t('journey.yesterday');
        return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' });
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const activeJourney = selectedDate === todayStr ? todayJourney : history.find(h => h.date === selectedDate) || null;

    const modeDot = (index: number) => {
        const colors = ['bg-cyan-400', 'bg-emerald-400', 'bg-amber-400', 'bg-violet-400', 'bg-kj-primary'];
        return colors[index % colors.length];
    };

    return (
        <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">
            {/* Sticky back bar */}
            <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="font-bengali font-bold text-base text-kj-text">
                    {lbl("Today's Journey", 'আজকের যাত্রা')}
                </span>
                {todayJourney && todayJourney.points.length > 0 && selectedDate === todayStr && (
                    <button
                        onClick={handleClearToday}
                        className="ml-auto w-8 h-8 rounded-xl border border-kj-line bg-kj-panel flex items-center justify-center text-red-400 hover:text-red-500 hover:border-red-400/40 transition-all"
                        aria-label="Clear today's journey"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">

                {/* Page title */}
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
                        {lbl('✦ KoyJabo · Daily Journey Tracker', '✦ কই যাবো · দৈনিক যাত্রা ট্র্যাকার')}
                    </span>
                    <h1 className="font-bengali font-bold leading-tight tracking-tight mt-1.5 text-kj-text" style={{ fontSize: 26 }}>
                        {lbl('Your Daily Routes', 'আপনার দৈনিক যাত্রাপথ')}
                    </h1>
                    <p className="font-bengali text-[13px] text-kj-text-dim leading-relaxed mt-1">
                        {lbl('Automatic journey tracking — stops, routes, distances.', 'স্বয়ংক্রিয় যাত্রা রেকর্ড — স্টপ, রুট, দূরত্ব।')}
                    </p>
                </div>

                {/* Date selector strip */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                    {TODAY_DATES.map((d) => {
                        const iso = d.toISOString().split('T')[0];
                        const isActive = selectedDate === iso;
                        const dayName = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
                        const dayNum = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric' });
                        return (
                            <button
                                key={iso}
                                onClick={() => setSelectedDate(iso)}
                                className={`flex-none flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all font-bengali min-w-[52px] ${
                                    isActive
                                        ? 'bg-kj-primary text-white shadow-lg shadow-kj-primary/30'
                                        : 'bg-kj-panel border border-kj-line text-kj-text-dim hover:border-kj-primary/40'
                                }`}
                            >
                                <span className="text-[10px] font-semibold">{dayName}</span>
                                <span className="text-sm font-bold">{dayNum}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Summary stat row */}
                {activeJourney && activeJourney.points.length > 0 ? (
                    <>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                {
                                    label: lbl('Stops', 'স্টপ'),
                                    value: formatNumber(activeJourney.stops.filter(s => s.isSignificant).length),
                                    icon: <MapPin className="w-4 h-4" />,
                                },
                                {
                                    label: lbl('Duration', 'সময়'),
                                    value: formatNumber(formatDuration(activeJourney.totalDuration)),
                                    icon: <Clock className="w-4 h-4" />,
                                },
                                {
                                    label: lbl('Distance', 'দূরত্ব'),
                                    value: formatNumber(formatDistance(activeJourney.totalDistance)),
                                    icon: <Navigation className="w-4 h-4" />,
                                },
                            ].map((s) => (
                                <div key={s.label} className="dc-card flex flex-col gap-1 p-3">
                                    <div className="flex items-center gap-1.5 text-kj-primary">
                                        {s.icon}
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-kj-text-faint">{s.label}</span>
                                    </div>
                                    <div className="font-bold text-sm text-kj-text leading-tight">{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Journey timeline */}
                        <div className="dc-card p-4 space-y-0">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-4 h-4 text-kj-primary" />
                                <span className="text-xs font-bold uppercase tracking-wide text-kj-text-faint">
                                    {lbl('Journey Timeline', 'যাত্রার টাইমলাইন')}
                                </span>
                            </div>
                            {activeJourney.stops.map((stop, index) => (
                                <div key={stop.id} className="relative">
                                    <div className="flex items-start gap-3">
                                        {/* Dot + line */}
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ring-2 ring-kj-bg ${modeDot(index)}`} />
                                            {index < activeJourney.stops.length - 1 && (
                                                <div className="w-px flex-1 bg-kj-line mt-1 mb-1 min-h-[32px]" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-bold text-kj-text">
                                                        {t('journey.stopNumber')} #{formatNumber(index + 1)}
                                                    </p>
                                                    <p className="text-xs text-kj-text-dim">
                                                        {formatNumber(stop.location.latitude.toFixed(4))}, {formatNumber(stop.location.longitude.toFixed(4))}
                                                    </p>
                                                </div>
                                                <span className="text-[11px] text-kj-text-faint shrink-0">
                                                    {formatNumber(formatTime(stop.arrivalTime))}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-kj-text-faint">
                                                <Clock className="w-3 h-3" />
                                                {t('journey.stayed')} {formatNumber(formatDuration(stop.duration))}
                                            </div>
                                            {index < activeJourney.stops.length - 1 && (
                                                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-kj-primary">
                                                    <Navigation className="w-3 h-3" />
                                                    {t('journey.traveledToNext')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {activeJourney.stops.length > 0 &&
                                !activeJourney.stops[activeJourney.stops.length - 1].departureTime && (
                                    <div className="flex items-center gap-2 mt-2 p-3 rounded-xl bg-kj-primary-soft border border-kj-primary/20">
                                        <Circle className="w-3 h-3 text-kj-primary animate-pulse" />
                                        <div>
                                            <p className="text-xs font-bold text-blue-900 dark:text-blue-100">{t('journey.currentLocation')}</p>
                                            <p className="text-[11px] text-blue-700 dark:text-blue-300">{t('journey.trackingActive')}</p>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </>
                ) : (
                    <div className="dc-card p-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-kj-chip-bg flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-kj-text-faint" />
                        </div>
                        <p className="font-bold text-kj-text mb-1">{t('journey.noJourneyToday')}</p>
                        <p className="text-sm text-kj-text-dim">{t('journey.enableLocation')}</p>
                    </div>
                )}

                {/* Journey history */}
                {history.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-kj-primary" />
                            <span className="text-xs font-bold uppercase tracking-wide text-kj-text-faint">
                                {t('journey.pastJourneys')}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {history.map((jour) => (
                                <button
                                    key={jour.date}
                                    onClick={() => setSelectedDate(jour.date)}
                                    className={`dc-card p-4 w-full text-left transition-all hover:border-kj-primary/40 ${selectedDate === jour.date ? 'border-kj-primary' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-sm text-kj-text">{formatNumber(formatDateLabel(jour.date))}</p>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-kj-text-faint">
                                                <span className="flex items-center gap-1"><Navigation className="w-3 h-3" />{formatNumber(formatDistance(jour.totalDistance))}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatNumber(formatDuration(jour.totalDuration))}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[11px] font-bold text-kj-text-faint">
                                                {formatNumber(jour.stops.filter(s => s.isSignificant).length)} {t('journey.stopsCount')}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <SponsoredAdSlot language={language} size="300x250" compact />
            </div>
        </div>
    );
};

export default DailyJourneyView;
