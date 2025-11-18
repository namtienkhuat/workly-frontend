import { useMemo } from 'react';
import { useChatStore } from '../store';

/**
 * Hook to get total unread message count across all conversations
 */
export function useUnreadCount() {
    const { conversations, currentUserId } = useChatStore();

    const totalUnreadCount = useMemo(() => {
        if (!currentUserId) return 0;

        return Object.values(conversations).reduce((total, conversation) => {
            const unreadForUser = conversation.unreadCount[currentUserId] || 0;
            return total + unreadForUser;
        }, 0);
    }, [conversations, currentUserId]);

    const hasUnread = totalUnreadCount > 0;

    return {
        totalUnreadCount,
        hasUnread,
    };
}

