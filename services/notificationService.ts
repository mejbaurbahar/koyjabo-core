import { NotificationResponse } from '../types/notification';

// Support both local development and production
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://koyjabo-backend.onrender.com/api';

/**
 * Save notifications to localStorage for offline access
 */
export const cacheNotifications = (notifications: NotificationResponse): void => {
    try {
        localStorage.setItem('dhaka_commute_cached_notifications', JSON.stringify({
            notifications: notifications.notifications,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.error('Error caching notifications:', e);
    }
};

/**
 * Get cached notifications from localStorage
 */
export const getCachedNotifications = (): NotificationResponse => {
    try {
        const cached = localStorage.getItem('dhaka_commute_cached_notifications');
        if (cached) {
            const data = JSON.parse(cached);
            return { notifications: data.notifications || [] };
        }
    } catch (e) {
        console.error('Error reading cached notifications:', e);
    }
    return { notifications: [] };
};

/**
 * Fetch active notifications from backend
 */
export const fetchActiveNotifications = async (): Promise<NotificationResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch notifications: ${response.statusText}`);
        }

        const data: NotificationResponse = await response.json();

        // Cache the notifications for offline use
        cacheNotifications(data);

        return data;
    } catch (error) {
        // Silence errors for cleaner console, as we have a graceful cache fallback
        if (import.meta.env.DEV) {
            console.debug('Notification fetch failed (expected if backend is blocking):', error);
        }

        // If offline or error, try to return cached notifications
        const cached = getCachedNotifications();
        if (cached.notifications.length > 0) {
            console.log('📴 Offline: Loading cached notifications');
            return cached;
        }

        // Return empty array if no cache available
        return { notifications: [] };
    }
};

/**
 * Get dismissed notification IDs from localStorage
 */
export const getDismissedNotifications = (): string[] => {
    try {
        const dismissed = localStorage.getItem('dhaka_commute_dismissed_notifications');
        return dismissed ? JSON.parse(dismissed) : [];
    } catch (e) {
        return [];
    }
};

/**
 * Add notification ID to dismissed list
 */
export const dismissNotification = (id: string): void => {
    try {
        const dismissed = getDismissedNotifications();
        if (!dismissed.includes(id)) {
            dismissed.push(id);
            localStorage.setItem('dhaka_commute_dismissed_notifications', JSON.stringify(dismissed));
        }
    } catch (e) {
        console.error('Error dismissing notification:', e);
    }
};

/**
 * Get read notification IDs from localStorage
 */
export const getReadNotifications = (): string[] => {
    try {
        const read = localStorage.getItem('dhaka_commute_read_notifications');
        return read ? JSON.parse(read) : [];
    } catch (e) {
        return [];
    }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = (id: string): void => {
    try {
        const read = getReadNotifications();
        if (!read.includes(id)) {
            read.push(id);
            localStorage.setItem('dhaka_commute_read_notifications', JSON.stringify(read));
        }
    } catch (e) {
        console.error('Error marking notification as read:', e);
    }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = (notificationIds: string[]): void => {
    try {
        const read = getReadNotifications();
        const allRead = [...new Set([...read, ...notificationIds])];
        localStorage.setItem('dhaka_commute_read_notifications', JSON.stringify(allRead));
    } catch (e) {
        console.error('Error marking all notifications as read:', e);
    }
};

/**
 * Clear old dismissed/read notifications (cleanup)
 */
export const cleanupOldNotifications = (activeIds: string[]): void => {
    try {
        // Remove dismissed notifications that are no longer active
        const dismissed = getDismissedNotifications();
        const validDismissed = dismissed.filter(id => activeIds.includes(id));
        localStorage.setItem('dhaka_commute_dismissed_notifications', JSON.stringify(validDismissed));

        // Remove read notifications that are no longer active
        const read = getReadNotifications();
        const validRead = read.filter(id => activeIds.includes(id));
        localStorage.setItem('dhaka_commute_read_notifications', JSON.stringify(validRead));
    } catch (e) {
        console.error('Error cleaning up notifications:', e);
    }
};
