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

    // Determine icon and tone color based on type
    const getStyles = () => {
        switch (type) {
            case 'warning':
                return {
                    borderColor: 'var(--kj-accent)',
                    iconBg: 'var(--kj-accent-soft)',
                    icon: <AlertTriangle className="w-5 h-5 animate-pulse" style={{ color: 'var(--kj-accent)' }} />
                };
            case 'error':
                return {
                    borderColor: 'var(--kj-accent)',
                    iconBg: 'var(--kj-accent-soft)',
                    icon: <AlertOctagon className="w-5 h-5" style={{ color: 'var(--kj-accent)' }} />
                };
            case 'success':
                return {
                    borderColor: 'var(--kj-amber)',
                    iconBg: 'var(--kj-amber-soft)',
                    icon: <CheckCircle className="w-5 h-5" style={{ color: 'var(--kj-amber)' }} />
                };
            case 'announcement':
                return {
                    borderColor: 'var(--kj-neon-violet)',
                    iconBg: 'rgba(162,89,255,0.12)',
                    icon: <Megaphone className="w-5 h-5 animate-bounce" style={{ color: 'var(--kj-neon-violet)' }} />
                };
            default: // info
                return {
                    borderColor: 'var(--kj-primary)',
                    iconBg: 'var(--kj-primary-soft)',
                    icon: <Info className="w-5 h-5" style={{ color: 'var(--kj-primary)' }} />
                };
        }
    };

    const styles = getStyles();

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        dismissNotification(highPriorityNotification.id);
    };

    const handleClick = () => {
        if (!link || link === '#') return;
        try {
            const url = new URL(link, window.location.origin);
            if (url.protocol === 'http:' || url.protocol === 'https:') {
                window.open(url.href, '_blank', 'noopener,noreferrer');
            }
        } catch { /* invalid URL — do nothing */ }
    };

    return (
        <div
            className="sticky top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300 cursor-pointer pt-safe"
            style={{
                background: 'var(--kj-panel)',
                borderBottom: `1px solid ${styles.borderColor}`,
                boxShadow: 'var(--kj-shadow)',
                backdropFilter: 'blur(12px)',
            }}
            onClick={handleClick}
        >
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0 p-1.5 rounded-full" style={{ background: styles.iconBg }}>
                        {styles.icon}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                        <span className="font-bold whitespace-nowrap text-sm sm:text-base" style={{ color: 'var(--kj-text)' }}>{title}</span>
                        <span className="hidden sm:inline w-1 h-1 rounded-full" style={{ background: 'var(--kj-line)' }}></span>
                        <span className="text-xs sm:text-sm truncate" style={{ color: 'var(--kj-text-dim)' }}>{message}</span>
                    </div>
                </div>

                <button
                    onClick={handleDismiss}
                    className="shrink-0 p-1 rounded-full transition-colors"
                    style={{ color: 'var(--kj-text-dim)' }}
                    aria-label={t('common.close')}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default NotificationBanner;
