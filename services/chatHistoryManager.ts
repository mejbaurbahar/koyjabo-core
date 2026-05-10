import { ChatMessage, ChatSession } from '../types';

const STORAGE_KEY = 'dhaka_commute_chat_history';
const MAX_SESSIONS = 50; // Keep last 50 chat sessions

/**
 * Generate a unique session ID
 */
const generateSessionId = (): string => {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get all chat sessions from localStorage
 */
export const getAllSessions = (): ChatSession[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
};

/**
 * Get a specific session by ID
 */
export const getSession = (sessionId: string): ChatSession | null => {
    const sessions = getAllSessions();
    return sessions.find(s => s.id === sessionId) || null;
};

/**
 * Save a message to a session
 */
export const saveChatMessage = (message: ChatMessage, sessionId?: string | null): string => {
    const sessions = getAllSessions();
    const currentSessionId = sessionId || generateSessionId();

    let session = sessions.find(s => s.id === currentSessionId);

    if (!session) {
        session = {
            id: currentSessionId,
            messages: [],
            createdAt: Date.now(),
            lastUpdated: Date.now()
        };
        sessions.push(session);
    }

    session.messages.push(message);
    session.lastUpdated = Date.now();

    // Keep only last MAX_SESSIONS
    const trimmedSessions = sessions.slice(-MAX_SESSIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedSessions));
    return currentSessionId;
};

/**
 * Delete a specific session
 */
export const deleteSession = (sessionId: string): void => {
    const sessions = getAllSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Clear all chat history
 */
export const clearAllHistory = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * Format timestamp for display
 */
export const formatChatTimestamp = (timestamp: number, language: string = 'en'): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isBn = language === 'bn';

    const timeStr = date.toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === today.toDateString()) {
        return isBn ? `আজ ${timeStr}` : `Today ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return isBn ? `গতকাল ${timeStr}` : `Yesterday ${timeStr}`;
    } else {
        return date.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
    }
};
