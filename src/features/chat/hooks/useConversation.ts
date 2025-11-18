import { useMemo } from 'react';
import { useChatStore } from '../store';

/**
 * Hook for working with a specific conversation
 */
export function useConversation(conversationId: string | null) {
    const {
        conversations,
        currentUserId,
        getConversation,
        getUnreadCount,
        updateConversation,
    } = useChatStore();

    const conversation = useMemo(() => {
        return conversationId ? getConversation(conversationId) : null;
    }, [conversationId, conversations, getConversation]);

    const unreadCount = useMemo(() => {
        return conversationId ? getUnreadCount(conversationId) : 0;
    }, [conversationId, currentUserId, conversations, getUnreadCount]);

    const otherParticipant = useMemo(() => {
        return conversation?.otherParticipant;
    }, [conversation]);

    return {
        conversation,
        otherParticipant,
        unreadCount,
        updateConversation,
    };
}

