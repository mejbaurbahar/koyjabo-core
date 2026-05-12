import React from 'react';
import { Info, CheckCircle, AlertTriangle, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { Notification } from '../types/notification';
import { useNotifications } from '../contexts/NotificationContext';
import { getReadNotifications } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationItemProps {
    notification: Notification;
    onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
    const { markAsRead } = useNotifications();
    const { t, language, formatNumber } = useLanguage();
    const isRead = getReadNotifications().includes(notification.id);

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    icon: <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />,
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                    icon: <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />,
                };
            case 'error':
                return {
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    icon: <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />,
                };
            case 'announcement':
                return {
                    bg: 'bg-purple-50 dark:bg-purple-900/20',
                    icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
                };
            default: // info
                return {
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
                };
        }
    };

    const styles = getTypeStyles(notification.type);

    // Extract domain from URL for display
    const getSourceDomain = (url?: string): string | null => {
        if (!url) return null;
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return domain;
        } catch {
            return null;
        }
    };

    const handleClick = () => {
        // Mark as read
        if (!isRead) {
            markAsRead(notification.id);
        }

        // Open link if available
        if (notification.link) {
            window.open(notification.link, '_blank', 'noopener,noreferrer');
            onClose?.();
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return t('notifications.justNow');
            if (diffMins < 60) return `${formatNumber(diffMins)}${t('notifications.m')} ${t('notifications.ago')}`;
            if (diffHours < 24) return `${formatNumber(diffHours)}${t('notifications.h')} ${t('notifications.ago')}`;
            if (diffDays < 7) return `${formatNumber(diffDays)}${t('notifications.d')} ${t('notifications.ago')}`;
            return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    const sourceDomain = getSourceDomain(notification.link);
    const displayTitle = language === 'bn' && notification.bnTitle ? notification.bnTitle : notification.title;
    const displayMessage = language === 'bn' && notification.bnMessage ? notification.bnMessage : notification.message;

    return (
        <div
            onClick={handleClick}
            className={`px-4 py-3 transition-colors cursor-pointer group ${!isRead
                ? 'bg-blue-50/30 dark:bg-blue-900/10 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                : 'hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Icon/Emoji and Unread Indicator */}
                <div className="relative shrink-0 mt-0.5">
                    <div className={`p-2 rounded-lg ${styles.bg} group-hover:scale-105 transition-transform`}>
                        {notification.icon ? (
                            <span className="text-lg leading-none">{notification.icon}</span>
                        ) : (
                            styles.icon
                        )}
                    </div>
                    {!isRead && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4
                            className={`text-sm leading-tight ${isRead
                                ? 'text-kj-text-dim'
                                : 'text-kj-text font-bold'
                                }`}
                        >
                            {displayTitle}
                        </h4>
                        {notification.link && (
                            <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>
                    <p className="text-xs text-kj-text-dim leading-relaxed line-clamp-2 mb-2">
                        {displayMessage}
                    </p>

                    {/* Footer with time and source */}
                    <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-kj-text-faint">
                            {formatTime(notification.createdAt)}
                        </span>
                        {sourceDomain && (
                            <>
                                <span className="text-kj-text-faint">•</span>
                                <span className="text-blue-500 dark:text-blue-400 font-medium flex items-center gap-1">
                                    {sourceDomain}
                                    <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
