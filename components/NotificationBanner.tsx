import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, AlertTriangle, Info, CheckCircle, AlertOctagon, Megaphone } from 'lucide-react';

const NotificationBanner: React.FC = () => {
    const { notifications, dismissNotification } = useNotifications();
    const { language, t } = useLanguage();

    // Find the first active high-priority notification
    const highPriorityNotification = notifications.find(
        (n) => n.priority === 'high' && n.isActive
    );

    if (!highPriorityNotification) {
        return null;
    }

    const { type, link } = highPriorityNotification;
    const title = language === 'bn' ? highPriorityNotification.bnTitle || highPriorityNotification.title : highPriorityNotification.title;
    const message = language === 'bn' ? highPriorityNotification.bnMessage || highPriorityNotification.message : highPriorityNotification.message;

    // Determine colors and icon based on type
    const getStyles = () => {
        switch (type) {
            case 'warning':
                return {
                    bg: 'bg-gradient-to-r from-orange-500 to-red-500',
                    icon: <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                };
            case 'error':
                return {
                    bg: 'bg-gradient-to-r from-red-600 to-pink-600',
                    icon: <AlertOctagon className="w-6 h-6 text-white" />
                };
            case 'success':
                return {
                    bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
                    icon: <CheckCircle className="w-6 h-6 text-white" />
                };
            case 'announcement':
                return {
                    bg: 'bg-gradient-to-r from-purple-600 to-indigo-600',
                    icon: <Megaphone className="w-6 h-6 text-white animate-bounce" />
                };
            default: // info
                return {
                    bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
                    icon: <Info className="w-6 h-6 text-white" />
                };
        }
    };

    const styles = getStyles();

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        dismissNotification(highPriorityNotification.id);
    };

    const handleClick = () => {
        if (link && link !== '#') {
            window.open(link, '_blank');
        }
    };

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[9999] ${styles.bg} shadow-lg shadow-black/10 animate-in slide-in-from-top duration-300 cursor-pointer`}
            onClick={handleClick}
        >
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0 p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                        {styles.icon}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-white min-w-0">
                        <span className="font-bold whitespace-nowrap text-sm sm:text-base">{title}</span>
                        <span className="hidden sm:inline w-1 h-1 bg-white/50 rounded-full"></span>
                        <span className="text-xs sm:text-sm text-blue-50 truncate opacity-90">{message}</span>
                    </div>
                </div>

                <button
                    onClick={handleDismiss}
                    className="shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
                    aria-label={t('common.close')}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default NotificationBanner;
