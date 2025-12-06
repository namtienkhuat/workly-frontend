import { useCallback, useMemo } from 'react';
import { useChatStore } from '../store';
import { ParticipantType } from '../types';

/**
 * useCompanyChat - Hook for company chat functionality
 * Filters conversations to show only those belonging to the specific company
 *
 * @param companyId - The ID of the company
 */
export function useCompanyChat(companyId: string) {
    // Subscribe to each state individually for proper re-renders
    const currentUserType = useChatStore((state) => state.currentUserType);
    const isCompanySocketConnected = useChatStore((state) => state.isCompanySocketConnected);
    const conversations = useChatStore((state) => state.conversations);
    const hiddenConversations = useChatStore((state) => state.hiddenConversations);
    const isLoadingConversations = useChatStore((state) => state.isLoadingConversations);
    const fullChatId = useChatStore((state) => state.fullChatId);
    const openChatWindows = useChatStore((state) => state.openChatWindows);

    const createOrGetConversation = useChatStore((state) => state.createOrGetConversation);
    const deleteConversation = useChatStore((state) => state.deleteConversation);
    const openChat = useChatStore((state) => state.openChat);
    const closeChat = useChatStore((state) => state.closeChat);
    const setFullChat = useChatStore((state) => state.setFullChat);

    const companyConversations = useMemo(() => {
        const allConversations = Object.values(conversations);

        const filtered = allConversations.filter((conv) => {
            const hasCompany = conv.participants.some(
                (p) => p.id === companyId && p.type === ParticipantType.COMPANY
            );
            const isHidden = hiddenConversations.has(conv._id);

            return hasCompany && !isHidden;
        });

        return filtered;
    }, [conversations, hiddenConversations, companyId]);

    // Start conversation with a user (from company perspective)
    const startConversation = useCallback(
        async (userId: string, userType: ParticipantType, isFullView = false) => {
            const conversation = await createOrGetConversation(userId, userType);
            openChat(conversation._id, isFullView);
            return conversation;
        },
        [createOrGetConversation, openChat]
    );

    return {
        // State
        currentUserId: companyId, // Company acts as currentUser
        currentUserType,
        isCompanySocketConnected,
        conversations: companyConversations, // Only this company's conversations
        isLoadingConversations,
        fullChatId,
        openChatWindows,

        // Actions
        startConversation,
        deleteConversation,
        openChat,
        closeChat,
        setFullChat,
    };
}
