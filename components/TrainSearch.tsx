import React, { useState, useEffect, useRef } from 'react';
import { Train, Search, Calendar, Clock, MapPin, Coins, ExternalLink, Loader2, AlertCircle, ArrowRight, X } from 'lucide-react';
import { trainService, Train as TrainType, getClassDisplay, getTrainTypeIcon, formatDate } from '../services/trainService';
import { useLanguage } from '../contexts/LanguageContext';

const TrainSearch: React.FC = () => {
    const { t, formatNumber } = useLanguage();
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [results, setResults] = useState<TrainType[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
    const [toSuggestions, setToSuggestions] = useState<string[]>([]);
    const [showFromSuggestions, setShowFromSuggestions] = useState(false);
    const [showToSuggestions, setShowToSuggestions] = useState(false);

    const fromInputRef = useRef<HTMLInputElement>(null);
    const toInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (from.length >= 2) {
                const data = await trainService.getSuggestions(from);
                setFromSuggestions(data.suggestions || []);
                setShowFromSuggestions(true);
            } else {
                setFromSuggestions([]);
                setShowFromSuggestions(false);
            }
        };
        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [from]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (to.length >= 2) {
                const data = await trainService.getSuggestions(to);
                setToSuggestions(data.suggestions || []);
                setShowToSuggestions(true);
            } else {
                setToSuggestions([]);
                setShowToSuggestions(false);
            }
        };
        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [to]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!from || !to) {
            setError(t('trainSearch.errorBothRequired'));
            return;
        }
        if (!navigator.onLine) {
            setError(t('trainSearch.errorOffline') || 'No internet connection. Train data requires an online connection.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await trainService.searchTrains(from, to, date || undefined);
            setResults(data.trains);
            if (data.totalResults === 0) {
                setError(`${t('trainSearch.errorNoTrains')} ${from} → ${to}`);
            }
        } catch (err: any) {
            setError(err.message || t('trainSearch.errorFailed'));
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFromSuggestion = (suggestion: string) => {
        setFrom(suggestion);
        setShowFromSuggestions(false);
    };

    const handleSelectToSuggestion = (suggestion: string) => {
        setTo(suggestion);
        setShowToSuggestions(false);
    };

    const handleSwapStations = () => {
        const temp = from;
        setFrom(to);
        setTo(temp);
    };

    const bookingURL = 'https://eticket.railway.gov.bd';

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                        <Train className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        {t('trainSearch.title')}
                    </h1>
                </div>
                <p className="text-kj-text-dim">
                    {t('trainSearch.subtitle')}
                </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-kj-panel rounded-3xl shadow-xl p-6 md:p-8 border border-kj-line mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* From Station */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-kj-text-dim mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {t('trainSearch.fromStation')}
                        </label>
                        <input
                            ref={fromInputRef}
                            type="text"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                            placeholder={t('trainSearch.fromPlaceholder')}
                            className="w-full px-4 py-3 rounded-xl border-2 border-kj-line border-kj-line bg-gray-50 dark:bg-slate-700 focus:border-kj-primary dark:focus:border-blue-400 focus:outline-none transition-colors"
                            required
                        />
                        {showFromSuggestions && fromSuggestions.length > 0 && (
                            <ul className="absolute z-50 w-full mt-2 bg-kj-panel border border-kj-line rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                {fromSuggestions.map((suggestion, i) => (
                                    <li
                                        key={i}
                                        onClick={() => handleSelectFromSuggestion(suggestion)}
                                        className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* To Station */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-kj-text-dim mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {t('trainSearch.toStation')}
                        </label>
                        <input
                            ref={toInputRef}
                            type="text"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                            placeholder={t('trainSearch.toPlaceholder')}
                            className="w-full px-4 py-3 rounded-xl border-2 border-kj-line border-kj-line bg-gray-50 dark:bg-slate-700 focus:border-kj-primary dark:focus:border-blue-400 focus:outline-none transition-colors"
                            required
                        />
                        {showToSuggestions && toSuggestions.length > 0 && (
                            <ul className="absolute z-50 w-full mt-2 bg-kj-panel border border-kj-line rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                {toSuggestions.map((suggestion, i) => (
                                    <li
                                        key={i}
                                        onClick={() => handleSelectToSuggestion(suggestion)}
                                        className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Date and Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-kj-text-dim mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {t('trainSearch.travelDate')}
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-kj-line border-kj-line bg-gray-50 dark:bg-slate-700 focus:border-kj-primary dark:focus:border-blue-400 focus:outline-none transition-colors"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleSwapStations}
                        className="px-4 py-3 rounded-xl bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                        title={t('trainSearch.swapStations')}
                    >
                        ⇄
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('trainSearch.searching')}
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                {t('trainSearch.searchButton')}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {/* Results */}
            {results && results.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-kj-text">
                            {t('trainSearch.found')} {formatNumber(results.length)} {t('trainSearch.train')}{results.length !== 1 ? 's' : ''}
                        </h2>
                        <a
                            href={bookingURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            {t('trainSearch.bookTickets')}
                        </a>
                    </div>

                    {results.map((train) => (
                        <div
                            key={train.trainNumber}
                            className="bg-kj-panel rounded-2xl shadow-lg border border-kj-line p-6 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">{getTrainTypeIcon(train.type)}</span>
                                        <h3 className="text-xl font-bold text-kj-text">
                                            {train.trainName}
                                        </h3>
                                        <span className="px-3 py-1 bg-kj-primary-soft dark:bg-blue-900/30 text-kj-primary text-kj-primary rounded-full text-sm font-semibold">
                                            {formatNumber(train.trainNumber)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-kj-text-dim">
                                        {train.type} • {train.route}
                                    </p>
                                </div>
                            </div>

                            {/* Journey Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-kj-text-dim" />
                                    <div>
                                        <p className="text-xs text-kj-text-dim">{t('trainSearch.departure')}</p>
                                        <p className="font-semibold text-kj-text">{formatNumber(train.departureTime)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ArrowRight className="w-5 h-5 text-kj-text-dim" />
                                    <div>
                                        <p className="text-xs text-kj-text-dim">{t('trainSearch.duration')}</p>
                                        <p className="font-semibold text-kj-text">{formatNumber(train.duration)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-kj-text-dim" />
                                    <div>
                                        <p className="text-xs text-kj-text-dim">{t('trainSearch.arrival')}</p>
                                        <p className="font-semibold text-kj-text">{formatNumber(train.arrivalTime)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Classes */}
                            <div className="mb-3">
                                <p className="text-sm text-kj-text-dim mb-2">{t('trainSearch.availableClasses')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {train.classes.map((cls, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium"
                                        >
                                            {getClassDisplay(cls)}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="flex flex-wrap gap-4 text-sm text-kj-text-dim">
                                <span>📅 {train.frequency}</span>
                                {train.offDays && train.offDays !== 'None' && (
                                    <span>🚫 {t('trainSearch.offDays')} {train.offDays}</span>
                                )}
                                {train.fare && (
                                    <span className="flex items-center gap-1">
                                        <Coins className="w-4 h-4" />
                                        ৳{formatNumber(train.fare)}
                                    </span>
                                )}
                            </div>

                            {/* Stops */}
                            {train.stops && train.stops.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-kj-line">
                                    <p className="text-sm font-semibold text-kj-text-dim mb-2">
                                        {t('trainSearch.stopsLabel')} ({formatNumber(train.stops.length)}):
                                    </p>
                                    <p className="text-sm text-kj-text-dim">
                                        {train.stops.join(' • ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {results && results.length === 0 && !error && (
                <div className="text-center py-12 bg-gray-50 dark:bg-kj-chip-bg rounded-2xl border-2 border-dashed border-kj-line dark:border-kj-line">
                    <Train className="w-16 h-16 text-kj-text-faint mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-kj-text-dim mb-2">
                        {t('trainSearch.noTrainsFound')}
                    </h3>
                    <p className="text-kj-text-dim">
                        {t('trainSearch.tryDifferentRoute')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TrainSearch;
