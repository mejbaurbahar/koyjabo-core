import React from 'react';
import { SuggestedRoute, RouteStep } from '../services/routePlanner';
import { Bus, Train, Navigation, Clock, Coins, ArrowRight, MapPin, TrendingUp, Zap, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RouteSuggestionsProps {
    routes: SuggestedRoute[];
    onSelectRoute: (route: SuggestedRoute) => void;
    currentLocation?: string;
}

const RouteStepIcon: React.FC<{ type: RouteStep['type'] }> = ({ type }) => {
    switch (type) {
        case 'bus':
            return <Bus className="w-4 h-4" />;
        case 'metro':
            return <Train className="w-4 h-4" />;
        case 'walk':
            return <Navigation className="w-4 h-4" />;
        case 'railway':
            return <Train className="w-4 h-4" />;
        default:
            return <MapPin className="w-4 h-4" />;
    }
};

const RouteTypeBadge: React.FC<{ type: SuggestedRoute['routeType'] }> = ({ type }) => {
    const { language } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
    const badges = {
        'fastest': { icon: Zap, text: lbl('Fastest', 'সবচেয়ে দ্রুত'), color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
        'direct': { icon: TrendingUp, text: lbl('Direct', 'সরাসরি'), color: 'bg-kj-primary-soft text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
        'cheapest': { icon: Coins, text: lbl('Cheapest', 'সবচেয়ে সাশ্রয়ী'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' },
        'least-transfers': { icon: Award, text: lbl('Easy', 'সহজ'), color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' }
    };

    const badge = badges[type];
    const Icon = badge.icon;

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}>
            <Icon className="w-3 h-3" />
            {badge.text}
        </div>
    );
};

const RouteSuggestions: React.FC<RouteSuggestionsProps> = ({ routes, onSelectRoute, currentLocation }) => {
    const { formatNumber, language } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
    if (routes.length === 0) {
        return (
            <div className="text-center py-8 text-kj-text-faint">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{lbl('No routes found', 'কোনো রুট পাওয়া যায়নি')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Current Location Badge */}
            {currentLocation && (
                <div className="bg-kj-primary-soft border border-kj-primary/20 rounded-xl p-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] text-kj-primary font-bold uppercase">{lbl('You are at', 'আপনি আছেন')}</p>
                        <p className="text-sm font-bold text-blue-900 text-kj-primary">{currentLocation}</p>
                    </div>
                </div>
            )}

            {/* Route Cards */}
            {routes.map((route, idx) => (
                <div
                    key={route.id}
                    className="bg-kj-panel rounded-2xl border-2 border-kj-line hover:border-kj-primary dark:hover:border-kj-primary transition-all shadow-sm hover:shadow-md overflow-hidden group cursor-pointer"
                    onClick={() => onSelectRoute(route)}
                >
                    {/* Route Header */}
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-kj-line">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg font-bold text-kj-text">{lbl('Route', 'রুট')} {formatNumber(idx + 1)}</span>
                                    <RouteTypeBadge type={route.routeType} />
                                </div>
                                <h3 className="text-sm font-semibold text-kj-text-dim">{route.title}</h3>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="bg-white dark:bg-slate-700 rounded-lg p-2 border border-kj-line border-kj-line">
                                <div className="flex items-center gap-1 text-kj-text-dim mb-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[9px] font-bold uppercase">{lbl('Time', 'সময়')}</span>
                                </div>
                                <p className="text-sm font-bold text-kj-text">{formatNumber(Math.round(route.totalDuration))} min</p>
                            </div>
                            <div className="bg-white dark:bg-slate-700 rounded-lg p-2 border border-kj-line border-kj-line">
                                <div className="flex items-center gap-1 text-kj-text-dim mb-1">
                                    <Coins className="w-3 h-3" />
                                    <span className="text-[9px] font-bold uppercase">{lbl('Fare', 'ভাড়া')}</span>
                                </div>
                                <p className="text-sm font-bold text-kj-text">৳{formatNumber(route.totalFare)}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-700 rounded-lg p-2 border border-kj-line border-kj-line">
                                <div className="flex items-center gap-1 text-kj-text-dim mb-1">
                                    <ArrowRight className="w-3 h-3" />
                                    <span className="text-[9px] font-bold uppercase">{lbl('Changes', 'পরিবর্তন')}</span>
                                </div>
                                <p className="text-sm font-bold text-kj-text">{formatNumber(route.transfers)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Route Steps */}
                    <div className="p-4 space-y-3">
                        {route.steps.map((step, stepIdx) => (
                            <div key={stepIdx} className="flex gap-3">
                                {/* Step Icon */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.type === 'bus' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                                        step.type === 'metro' ? 'bg-kj-primary-soft text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' :
                                            step.type === 'walk' ? 'bg-gray-100 text-kj-text-dim bg-kj-panel-muted dark:text-kj-text-faint' :
                                                'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400'
                                        }`}>
                                        <RouteStepIcon type={step.type} />
                                    </div>
                                    {stepIdx < route.steps.length - 1 && (
                                        <div className="w-0.5 h-full bg-gray-200 bg-kj-panel-muted my-1"></div>
                                    )}
                                </div>

                                {/* Step Details */}
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-kj-text leading-tight">{step.instruction}</p>

                                    {step.busRoute && (
                                        <div className="mt-1 inline-flex items-center gap-1 bg-green-50 border border-green-200 dark:bg-green-900/30 dark:border-green-800 px-2 py-0.5 rounded-md">
                                            <Bus className="w-3 h-3 text-green-700 dark:text-green-400" />
                                            <span className="text-[10px] font-bold text-green-700 dark:text-green-400">{step.busRoute.name}</span>
                                            <span className="text-[10px] text-green-600 dark:text-green-500">({step.busRoute.bnName})</span>
                                        </div>
                                    )}

                                    {step.metroLine && (
                                        <div className="mt-1 inline-flex items-center gap-1 bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 px-2 py-0.5 rounded-md">
                                            <Train className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">{step.metroLine}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-kj-text-dim">
                                        {step.duration && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatNumber(Math.round(step.duration))} min
                                            </span>
                                        )}
                                        {step.fare && (
                                            <span className="flex items-center gap-1">
                                                <Coins className="w-3 h-3" />
                                                ৳{formatNumber(step.fare)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Button */}
                    <div className="px-4 pb-4">
                        <button className="w-full bg-kj-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-800 transition-colors flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform">
                            <Navigation className="w-4 h-4" />
                            {lbl('Start This Route', 'এই রুট শুরু করুন')}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RouteSuggestions;
