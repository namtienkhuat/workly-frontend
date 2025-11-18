import { useCallback, useRef, useEffect } from 'react';
import { useChatStore } from '../store';
import { CHAT_CONSTANTS } from '../constants/chat.constants';

/**
 * Hook for managing typing indicators
 */
export function useTyping(conversationId: string | null) {
    const { isTyping: isOtherUserTyping, startTyping, stopTyping } = useChatStore();
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isTyping = conversationId ? isOtherUserTyping(conversationId) : false;

    const handleStartTyping = useCallback(() => {
        if (!conversationId) return;

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Start typing
        startTyping(conversationId);

        // Auto-stop after timeout
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(conversationId);
        }, CHAT_CONSTANTS.TYPING_TIMEOUT);
    }, [conversationId, startTyping, stopTyping]);

    const handleStopTyping = useCallback(() => {
        if (!conversationId) return;

        // Clear timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        stopTyping(conversationId);
    }, [conversationId, stopTyping]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return {
        isTyping,
        startTyping: handleStartTyping,
        stopTyping: handleStopTyping,
    };
}

