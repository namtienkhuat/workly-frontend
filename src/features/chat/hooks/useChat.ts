// useChat.ts
import { useCallback } from 'react';
import { useChatStore } from '../store';
import { ParticipantType } from '../types';

export function useChat() {
    // Lấy toàn bộ store 1 lần để tránh re-render thừa
    const store = useChatStore();

    const {
        currentUserId,
        currentUserType,
        isSocketConnected,
        conversations,
        isLoadingConversations,
        fullChatId,
        openChatWindows,

        // actions
        setCurrentUser,
        initializeSocket,
        disconnectSocket,
        loadConversations,
        createOrGetConversation,
        deleteConversation,
        openChat,
        closeChat,
        setFullChat,
    } = store;

    // Initialize socket one time
    const initialize = useCallback(
        (userId: string, userType: ParticipantType, token: string) => {
            setCurrentUser(userId, userType);
            initializeSocket(userId, userType, token);
        },
        [] // Zustand guarantees stable functions ⇒ safe to remove deps
    );

    // Start conversation stable
    const startConversation = useCallback(
        async (participantId: string, participantType: ParticipantType, isFullView = false) => {
            const conversation = await createOrGetConversation(participantId, participantType);
            openChat(conversation._id, isFullView);
            return conversation;
        },
        [] // stable vì action từ Zustand luôn stable
    );

    return {
        // State
        currentUserId,
        currentUserType,
        isSocketConnected,
        conversations: Object.values(conversations),
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
