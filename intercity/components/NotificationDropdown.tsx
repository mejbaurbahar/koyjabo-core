import React from 'react';
import { Clock, CheckCheck } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationDropdownProps {
    onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    const { t, formatNumber } = useLanguage();

    // Show medium and high priority in dropdown (exclude low priority)
    const dropdownNotifications = notifications
        .filter((n) => n.priority === 'medium' || n.priority === 'high')
        .slice(0, 5); // Show max 5 recent

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    return (
        <div className="fixed md:absolute right-2 md:right-0 top-[4.5rem] md:top-full mt-0 md:mt-2 w-[calc(100vw-1rem)] max-w-96 md:max-w-96 bg-kj-panel rounded-2xl shadow-2xl border border-kj-line z-[6000] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-kj-line">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-kj-text text-sm">
                        {t('notifications.title')}
                        {unreadCount > 0 && (
                            <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                                {formatNumber(unreadCount)} {t('notifications.new')}
                            </span>
                        )}
                    </h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                            <CheckCheck className="w-3 h-3" />
                            {t('notifications.markAllRead')}
                        </button>
                    )}
                </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
                {dropdownNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {dropdownNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClose={onClose}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-12 text-center">
                        <div className="w-16 h-16 bg-kj-chip-bg rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-8 h-8 text-kj-text-faint" />
                        </div>
                        <p className="text-sm text-kj-text-dim font-medium">{t('notifications.noNotifications')}</p>
                        <p className="text-xs text-kj-text-faint mt-1">
                            {t('notifications.allCaughtUp')}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer - View All (Optional) */}
            {dropdownNotifications.length > 0 && (
                <div className="px-4 py-3 border-t border-kj-line">
                    <button
                        onClick={onClose}
                        className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                        {t('common.close')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
