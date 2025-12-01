import { useMemo } from 'react';
import { useChatStore } from '../store';

/**
 * Hook to get total unread message count across all conversations
 * @param forPersonalUser - If true, always uses personalUserId (for Header badge). Default: true
 */
export function useUnreadCount(forPersonalUser: boolean = true) {
    const { conversations, currentUserId, personalUserId } = useChatStore();

    // Use personalUserId for Header badge (always shows user's personal unread count)
    // Use currentUserId for context-specific unread count (user or company)
    const userId = forPersonalUser ? personalUserId : currentUserId;

    const totalUnreadCount = useMemo(() => {
        if (!userId) return 0;

        return Object.values(conversations).reduce((total, conversation) => {
            const unreadForUser = conversation.unreadCount[userId] || 0;
            return total + unreadForUser;
        }, 0);
    }, [conversations, userId]);

    const hasUnread = totalUnreadCount > 0;

    return {
        totalUnreadCount,
        hasUnread,
    };
}

