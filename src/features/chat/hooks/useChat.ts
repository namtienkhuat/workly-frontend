// useChat.ts
import { useCallback, useMemo } from 'react';
import { useChatStore } from '../store';
import { ParticipantType } from '../types';

export function useChat() {
    // Subscribe to specific slices for better reactivity
    const currentUserId = useChatStore((state) => state.currentUserId);
    const currentUserType = useChatStore((state) => state.currentUserType);
    const isSocketConnected = useChatStore((state) => state.isSocketConnected);
    const conversations = useChatStore((state) => state.conversations);
    const hiddenConversations = useChatStore((state) => state.hiddenConversations);
    const isLoadingConversations = useChatStore((state) => state.isLoadingConversations);
    const fullChatId = useChatStore((state) => state.fullChatId);
    const openChatWindows = useChatStore((state) => state.openChatWindows);

    // Actions
    const setCurrentUser = useChatStore((state) => state.setCurrentUser);
    const initializeSocket = useChatStore((state) => state.initializeSocket);
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
            initializeSocket(userId, userType, token);
        },
        [setCurrentUser, initializeSocket]
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

    // Filter out hidden conversations - recompute when conversations or hiddenConversations change
    const visibleConversations = useMemo(() => {
        const visible = Object.values(conversations).filter(
            (conv) => !hiddenConversations.has(conv._id)
        );

        return visible;
    }, [conversations, hiddenConversations]);

    return {
        // State
        currentUserId,
        currentUserType,
        isSocketConnected,
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
