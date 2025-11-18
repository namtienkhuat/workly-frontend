import { useCallback, useMemo } from 'react';
import { useChatStore } from '../store';

/**
 * Hook for working with messages in a conversation
 */
export function useMessages(conversationId: string | null) {
    const {
        messages,
        isLoadingMessages,
        currentUserId,
        getMessages,
        loadMessages,
        sendMessage,
        markMessagesAsRead,
    } = useChatStore();

    const conversationMessages = useMemo(() => {
        return conversationId ? getMessages(conversationId) : [];
    }, [conversationId, messages, getMessages]);

    const isLoading = useMemo(() => {
        return conversationId ? isLoadingMessages[conversationId] || false : false;
    }, [conversationId, isLoadingMessages]);

    const send = useCallback(
        async (content: string) => {
            if (!conversationId) return;
            await sendMessage(conversationId, content);
        },
        [conversationId, sendMessage]
    );

    const loadMore = useCallback(
        async (page: number) => {
            if (!conversationId) return;
            await loadMessages(conversationId, page);
        },
        [conversationId, loadMessages]
    );

    const markAsRead = useCallback(async () => {
        if (!conversationId) return;
        await markMessagesAsRead(conversationId);
    }, [conversationId, markMessagesAsRead]);

    return {
        messages: conversationMessages,
        isLoading,
        currentUserId,
        send,
        loadMore,
        markAsRead,
    };
}

