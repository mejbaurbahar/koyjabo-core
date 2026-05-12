import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { useLanguage } from '../contexts/LanguageContext';

const NotificationBell: React.FC = () => {
    const { unreadCount } = useNotifications();
    const { t, formatNumber } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg rounded-full transition-colors text-kj-text-dim flex items-center justify-center"
                aria-label={t('notifications.title')}
            >
                <Bell className="w-4 h-4" />

                {/* Unread Count Badge - Moved closer */}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full">
                        {unreadCount > 9 ? formatNumber(9) + '+' : formatNumber(unreadCount)}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
        </div>
    );
};

export default NotificationBell;
