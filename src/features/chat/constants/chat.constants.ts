// Chat feature constants

export const CHAT_CONSTANTS = {
    // Socket
    SOCKET_URL: process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:3003',
    MAX_RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 1000,
    RECONNECT_DELAY_MAX: 5000,

    // API
    CHAT_API_URL: process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:3003/api',

    // Pagination
    DEFAULT_PAGE_SIZE: 50,
    DEFAULT_PAGE: 1,

    // Typing indicator
    TYPING_TIMEOUT: 2000, // 2 seconds of inactivity before stopping typing

    // Chat windows
    MAX_OPEN_WINDOWS: 3,
    WINDOW_WIDTH: 350,
    WINDOW_HEIGHT: 500,
    WINDOW_SPACING: 10,
    WINDOW_BOTTOM_OFFSET: 0,
    WINDOW_RIGHT_OFFSET: 20,

    // Popups
    POPUP_SIZE: 56, // 14 * 4 (h-14 w-14)
    POPUP_SPACING: 70,
    POPUP_BOTTOM_OFFSET: 20,
    POPUP_RIGHT_OFFSET: 20,

    // Messages
    MAX_MESSAGE_LENGTH: 5000,
    MESSAGE_LOAD_LIMIT: 50,
} as const;

export const SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    ERROR: 'error',

    // Conversation
    JOIN_CONVERSATION: 'join_conversation',
    LEAVE_CONVERSATION: 'leave_conversation',
    USER_JOINED_CONVERSATION: 'user_joined_conversation',
    USER_LEFT_CONVERSATION: 'user_left_conversation',

    // Messages
    SEND_MESSAGE: 'send_message',
    NEW_MESSAGE: 'new_message',
    MARK_MESSAGE_READ: 'mark_message_read',
    MESSAGE_READ: 'message_read',

    // Typing
    TYPING: 'typing',
    STOP_TYPING: 'stop_typing',
    USER_TYPING: 'user_typing',

    // User status
    USER_ONLINE: 'user_online',
    USER_OFFLINE: 'user_offline',
} as const;

export const API_ENDPOINTS = {
    // Conversations
    CONVERSATIONS: '/conversations',
    CONVERSATION_BY_ID: (id: string) => `/conversations/${id}`,

    // Messages
    MESSAGES: '/messages',
    MESSAGES_BY_CONVERSATION: (conversationId: string) => `/messages/${conversationId}`,
    MARK_MESSAGE_READ: (messageId: string) => `/messages/${messageId}/read`,
    MARK_ALL_READ: (conversationId: string) => `/messages/conversations/${conversationId}/read-all`,
} as const;

