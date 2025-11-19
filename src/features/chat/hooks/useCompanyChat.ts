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
    const store = useChatStore();

    const {
        currentUserType,
        isSocketConnected,
        conversations,
        isLoadingConversations,
        fullChatId,
        openChatWindows,

        // actions
        createOrGetConversation,
        deleteConversation,
        openChat,
        closeChat,
        setFullChat,
    } = store;

    // Filter conversations that belong to this company
    const companyConversations = useMemo(() => {
        console.log('🔍 [useCompanyChat] RAW store state:', {
            companyId,
            conversationsObjectType: typeof conversations,
            conversationsObjectKeys: Object.keys(conversations),
            conversationsObjectKeysLength: Object.keys(conversations).length,
        });

        const allConversations = Object.values(conversations);

        console.log('🔍 [useCompanyChat] After Object.values():', {
            allConversationsLength: allConversations.length,
            allConversationsSample: allConversations.slice(0, 2), // First 2 conversations
        });

        console.log('🔍 Filter Debug:', {
            companyId,
            totalConversations: allConversations.length,
            participantsList: allConversations.map((c) => ({
                convId: c._id,
                participants: c.participants,
                hasTargetCompanyId: c.participants.some((p) => p.id === companyId),
                hasTargetCompanyType: c.participants.some(
                    (p) => p.id === companyId && p.type === ParticipantType.COMPANY
                ),
            })),
        });

        const filtered = allConversations.filter((conv) => {
            // Check if this company is a participant in the conversation
            const hasCompany = conv.participants.some(
                (p) => p.id === companyId && p.type === ParticipantType.COMPANY
            );

            return hasCompany;
        });

        console.log('🔍 Filtered result:', filtered.length, 'conversations for company', companyId);

        return filtered;
    }, [conversations, companyId]);

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
        isSocketConnected,
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
