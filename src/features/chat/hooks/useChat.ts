// useChat.ts
import { useCallback, useMemo } from 'react';
import { useChatStore } from '../store';
import { ParticipantType } from '../types';

export function useChat() {
    // Subscribe to specific slices for better reactivity
    const currentUserId = useChatStore((state) => state.currentUserId);
    const currentUserType = useChatStore((state) => state.currentUserType);
    const isUserSocketConnected = useChatStore((state) => state.isUserSocketConnected);
    const conversations = useChatStore((state) => state.conversations);
    const hiddenConversations = useChatStore((state) => state.hiddenConversations);
    const personalUserId = useChatStore((state) => state.personalUserId);
    const isLoadingConversations = useChatStore((state) => state.isLoadingConversations);
    const fullChatId = useChatStore((state) => state.fullChatId);
    const openChatWindows = useChatStore((state) => state.openChatWindows);

    // Actions
    const setCurrentUser = useChatStore((state) => state.setCurrentUser);
    const initializeUserSocket = useChatStore((state) => state.initializeUserSocket);
    const disconnectSocket = useChatStore((state) => state.disconnectSocket);
    const loadConversations = useChatStore((state) => state.loadConversations);
    const createOrGetConversation = useChatStore((state) => state.createOrGetConversation);
    const deleteConversation = useChatStore((state) => state.deleteConversation);
    const openChat = useChatStore((state) => state.openChat);
    const closeChat = useChatStore((state) => state.closeChat);
    const setFullChat = useChatStore((state) => state.setFullChat);

    // Initialize socket one time
    const initialize = useCallback(
        (userId: string, userType: ParticipantType, token: string) => {
            setCurrentUser(userId, userType);
            initializeUserSocket(userId, token);
        },
        [setCurrentUser, initializeUserSocket]
    );

    // Start conversation stable
    const startConversation = useCallback(
        async (participantId: string, participantType: ParticipantType, isFullView = false) => {
            const conversation = await createOrGetConversation(participantId, participantType);
            openChat(conversation._id, isFullView);
            return conversation;
        },
        [createOrGetConversation, openChat]
    );

    // Filter out hidden conversations and only show user's personal conversations (not company conversations)
    const visibleConversations = useMemo(() => {
        const visible = Object.values(conversations).filter((conv) => {
            if (hiddenConversations.has(conv._id)) return false;

            // Only show conversations where personalUserId is a participant with type USER
            if (personalUserId) {
                const hasUser = conv.participants.some(
                    (p) => p.id === personalUserId && p.type === ParticipantType.USER
                );
                return hasUser;
            }

            return false;
        });

        return visible;
    }, [conversations, hiddenConversations, personalUserId]);

    return {
        // State
        currentUserId,
        currentUserType,
        isUserSocketConnected,
        conversations: visibleConversations,
        isLoadingConversations,
        fullChatId,
        openChatWindows,

        // Actions
        initialize,
        disconnect: disconnectSocket,
        loadConversations,
        startConversation,
        deleteConversation,
        openChat,
        closeChat,
        setFullChat,
    };
}
