import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification } from '../types/notification';
import {
    fetchActiveNotifications,
    getDismissedNotifications,
    getReadNotifications,
    dismissNotification as dismissNotificationStorage,
    markNotificationAsRead as markAsReadStorage,
    markAllNotificationsAsRead as markAllAsReadStorage,
    cleanupOldNotifications,
} from '../services/notificationService';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    dismissNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const POLLING_INTERVAL = 60000; // 60 seconds

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetchActiveNotifications();
            const dismissed = getDismissedNotifications();

            // Filter out dismissed notifications
            const visibleNotifications = response.notifications.filter(
                (notif) => !dismissed.includes(notif.id)
            );

            setNotifications(visibleNotifications);

            // Cleanup old localStorage entries
            const activeIds = response.notifications.map(n => n.id);
            cleanupOldNotifications(activeIds);
        } catch (err) {
            if (import.meta.env.DEV) {
                console.debug('Failed to refresh notifications (likely backend blocking):', err);
            }
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    // Polling - fetch notifications every minute
    useEffect(() => {
        const interval = setInterval(() => {
            // Only poll if tab is visible
            if (!document.hidden) {
                refreshNotifications();
            }
        }, POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, [refreshNotifications]);

    // Refresh when tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                refreshNotifications();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [refreshNotifications]);

    const dismissNotification = useCallback((id: string) => {
        dismissNotificationStorage(id);
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, []);

    const markAsRead = useCallback((id: string) => {
        markAsReadStorage(id);
        // Force re-render to update unread count
        setNotifications((prev) => [...prev]);
    }, []);

    const markAllAsRead = useCallback(() => {
        const ids = notifications.map((n) => n.id);
        markAllAsReadStorage(ids);
        // Force re-render to update unread count
        setNotifications((prev) => [...prev]);
    }, [notifications]);

    // Calculate unread count
    const unreadCount = notifications.filter((notif) => {
        const read = getReadNotifications();
        return !read.includes(notif.id);
    }).length;

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        loading,
        error,
        dismissNotification,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};
