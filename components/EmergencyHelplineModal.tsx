
import React, { useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, Shield, Activity, Flame, MapPin, Navigation2 } from 'lucide-react';
import { UserLocation } from '../types';
import { NATIONAL_HELPLINES } from '../data/emergencyHelplines';
import { findNearestEmergencyServicesByType, formatDistance, NearestEmergencyService } from '../services/emergencyService';
import { useLanguage } from '../contexts/LanguageContext';

interface EmergencyHelplineModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation: UserLocation | null;
    currentLocationName?: string;
}

const EmergencyHelplineModal: React.FC<EmergencyHelplineModalProps> = ({
    isOpen,
    onClose,
    userLocation,
    currentLocationName
}) => {
    const { t, formatNumber } = useLanguage();
    const nearestServices = useMemo(() => {
        if (!userLocation) return null;
        return findNearestEmergencyServicesByType(userLocation, 2);
    }, [userLocation]);

    // Lock ALL scrollable containers when modal is open
    useEffect(() => {
        if (!isOpen) return;
        // Lock html + body
        const htmlPrev = document.documentElement.style.overflow;
        const bodyPrev = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        // Also lock the app's custom scroller div (overflow:auto on the main container)
        const scrollers = document.querySelectorAll<HTMLElement>('[data-app-scroller]');
        const scrollerPrevValues: string[] = [];
        scrollers.forEach((el, i) => {
            scrollerPrevValues[i] = el.style.overflowY;
            el.style.overflowY = 'hidden';
        });
        return () => {
            document.documentElement.style.overflow = htmlPrev;
            document.body.style.overflow = bodyPrev;
            scrollers.forEach((el, i) => {
                el.style.overflowY = scrollerPrevValues[i];
            });
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'police':
                return <Shield className="w-5 h-5" />;
            case 'hospital':
                return <Activity className="w-5 h-5" />;
            case 'fire':
                return <Flame className="w-5 h-5" />;
            default:
                return <Phone className="w-5 h-5" />;
        }
    };

    const getServiceColor = (type: string) => {
        switch (type) {
            case 'police':
                return 'bg-blue-50 dark:bg-blue-900/30 text-kj-primary border-kj-primary/20';
            case 'hospital':
                return 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'fire':
                return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
            default:
                return 'bg-kj-panel text-kj-text-dim border-kj-line';
        }
    };

    const handleCall = (number: string) => {
        window.location.href = `tel:${number}`;
    };

    const renderServiceCard = (service: NearestEmergencyService) => {
        const colorClass = getServiceColor(service.type);

        return (
            <div
                key={service.id}
                className="dc-card rounded-xl p-4 hover:shadow-md transition-shadow"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`p-1.5 rounded-lg border ${colorClass}`}>
                                {getServiceIcon(service.type)}
                            </div>
                            <h4 className="font-bold text-kj-text text-sm">{service.name}</h4>
                        </div>
                        <p className="text-xs text-kj-text-dim mb-2">{service.bnName}</p>
                        <div className="flex items-center gap-2 text-xs text-kj-text-dim">
                            <MapPin className="w-3 h-3" />
                            <span>{service.area} • {formatNumber(formatDistance(service.distance))} {t('emergency.away')}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleCall(service.phone)}
                        className="shrink-0 bg-kj-primary hover:bg-green-600 text-white p-3 rounded-xl transition-colors shadow-sm active:scale-95"
                        aria-label={`Call ${service.name}`}
                    >
                        <Phone className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return createPortal(
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 99999 }}
            className="flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4"
            onClick={onClose}
        >
            <div
                className="bg-kj-panel w-full max-w-2xl rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 pt-[max(env(safe-area-inset-top),1rem)] border-b border-kj-line shrink-0 bg-kj-panel">
                    <div>
                        <h2 className="text-xl font-bold text-kj-text flex items-center gap-2">
                            <Phone className="w-5 h-5 text-kj-accent" />
                            {t('emergency.title')}
                        </h2>
                        {currentLocationName && (
                            <p className="text-xs text-kj-text-dim mt-1 flex items-center gap-1">
                                <Navigation2 className="w-3 h-3" />
                                {t('emergency.near')} {currentLocationName}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-kj-text-dim" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* National Helplines */}
                    <div>
                        <h3 className="text-sm font-bold text-kj-text-dim mb-3 uppercase tracking-wide flex items-center gap-2">
                            <Shield className="w-4 h-4 text-kj-accent" />
                            {t('emergency.nationalEmergencyNumbers')}
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {NATIONAL_HELPLINES.map((helpline) => (
                                <div
                                    key={helpline.id}
                                    className="bg-gradient-to-r from-dhaka-red/5 to-transparent border border-red-100 dark:border-red-900/30 rounded-xl p-3 flex items-center justify-between"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-bold text-kj-text text-sm">{helpline.name}</h4>
                                        <p className="text-xs text-kj-text-dim">{helpline.bnName}</p>
                                        <p className="text-xs text-kj-text-faint mt-0.5">{helpline.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleCall(helpline.number)}
                                        className="shrink-0 bg-kj-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm active:scale-95 flex items-center gap-2"
                                    >
                                        <Phone className="w-4 h-4" />
                                        {formatNumber(helpline.number)}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location-based Services */}
                    {userLocation && nearestServices && (
                        <>
                            {/* Police Stations */}
                            {nearestServices.police.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-kj-text-dim mb-3 uppercase tracking-wide flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-kj-primary" />
                                        {t('emergency.nearestPoliceStations')}
                                    </h3>
                                    <div className="space-y-2">
                                        {nearestServices.police.map(renderServiceCard)}
                                    </div>
                                </div>
                            )}

                            {/* Hospitals */}
                            {nearestServices.hospital.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-kj-text-dim mb-3 uppercase tracking-wide flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-green-600" />
                                        {t('emergency.nearestHospitals')}
                                    </h3>
                                    <div className="space-y-2">
                                        {nearestServices.hospital.map(renderServiceCard)}
                                    </div>
                                </div>
                            )}

                            {/* Fire Stations */}
                            {nearestServices.fire.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-kj-text-dim mb-3 uppercase tracking-wide flex items-center gap-2">
                                        <Flame className="w-4 h-4 text-red-600" />
                                        {t('emergency.nearestFireStations')}
                                    </h3>
                                    <div className="space-y-2">
                                        {nearestServices.fire.map(renderServiceCard)}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {!userLocation && (
                        <div className="text-center py-8 text-kj-text-dim">
                            <MapPin className="w-12 h-12 mx-auto mb-3 text-kj-text-faint" />
                            <p className="text-sm">{t('emergency.locationNotAvailable')}</p>
                            <p className="text-xs mt-1">{t('emergency.enableLocation')}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-kj-line bg-gray-50 dark:bg-kj-chip-bg shrink-0 rounded-b-2xl">
                    <p className="text-xs text-center text-kj-text-dim">
                        {t('emergency.emergencyFooter')} <span className="font-bold text-kj-accent">{formatNumber(999)}</span> {t('emergency.immediately')}
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EmergencyHelplineModal;
