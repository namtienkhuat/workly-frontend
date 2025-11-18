// Re-export types from new chat feature for backward compatibility
// This file maintains backward compatibility with existing code
// New code should import from '@/features/chat/types' instead

export {
    // Base types
    ParticipantType,
    MessageStatus,
    Participant,
    UserInfo,

    // Message types
    ReadBy,
    Message,
    SendMessagePayload,
    GetMessagesParams,

    // Conversation types
    Conversation,
    ConversationWithUserInfo,
    CreateConversationPayload,
    GetConversationsParams,

    // Socket types
    SocketAuthData,
    NewMessageData,
    TypingData,
    MessageReadData,
    UserStatusData,
    ConversationJoinLeaveData,

    // UI types
    ChatPopupState,
    ChatViewMode,

    // API types
    ApiResponse,
    PaginatedResponse,
} from '@/features/chat/types';

// Legacy type aliases (deprecated, use new names instead)
export type { UserInfo as User } from '@/features/chat/types';
