import { useChatStore } from '../store';

export function useUnreadCount(forPersonalUser: boolean = true) {
    const personalUserId = useChatStore((state) => state.personalUserId);
    const currentUserId = useChatStore((state) => state.currentUserId);

    const userId = forPersonalUser ? personalUserId : currentUserId;

    // Subscribe to conversationsVersion to force re-render when conversations are updated
    const conversationsVersion = useChatStore((state) => state.conversationsVersion);

    // Subscribe to a computed value directly in the selector
    // This ensures re-render when any conversation's unreadCount changes
    const totalUnreadCount = useChatStore((state) => {
        if (!userId) return 0;

        const { conversations, hiddenConversations } = state;

        // Calculate total - this will re-run whenever conversations object reference changes
        return Object.values(conversations).reduce((total, conversation) => {
            if (hiddenConversations.has(conversation._id)) return total;
            const unreadForUser = conversation.unreadCount[userId] || 0;
            return total + unreadForUser;
        }, 0);
    });

    // Use conversationsVersion to ensure re-render (even if computed value is the same)
    // This is a workaround for Zustand's shallow comparison
    const _ = conversationsVersion;

    const hasUnread = totalUnreadCount > 0;

    return {
        totalUnreadCount,
        hasUnread,
    };
}
