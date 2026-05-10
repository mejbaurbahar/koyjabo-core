import { NotificationResponse } from '../types/notification';

// Backend decommissioned — notifications are served from localStorage cache only.

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
        
    }
    return { notifications: [] };
};

/**
 * Returns cached notifications (backend decommissioned).
 */
export const fetchActiveNotifications = async (): Promise<NotificationResponse> => {
    {
        // Return cached notifications or empty list
        const cached = getCachedNotifications();
        if (cached.notifications.length > 0) {
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
        
    }
};
