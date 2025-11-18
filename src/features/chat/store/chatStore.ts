import { create } from 'zustand';
import {
    Conversation,
    Message,
    ParticipantType,
    ConversationWithUserInfo,
    MessageStatus,
    NewMessageData,
    TypingData,
    MessageReadData,
    UserInfo,
} from '../types';
import {
    conversationApiService,
    messageApiService,
    socketService,
    userApiService,
    ParticipantProfile,
} from '../services';
import {
    sortMessagesByTime,
    generateTempMessageId,
    convertParticipantProfileToUserInfo,
} from '../utils';
import { CHAT_CONSTANTS } from '../constants/chat.constants';

interface ChatStore {
    // ==================== STATE ====================
    // User
    currentUserId: string | null;
    currentUserType: ParticipantType | null;

    // Socket
    isSocketConnected: boolean;

    // Conversations
    conversations: Record<string, ConversationWithUserInfo>;
    isLoadingConversations: boolean;

    // Messages
    messages: Record<string, Message[]>; // conversationId -> messages[]
    isLoadingMessages: Record<string, boolean>;

    // User Info Cache
    userInfoCache: Record<string, UserInfo>; // participantId -> UserInfo

    // UI State
    openChatWindows: string[]; // conversationId[]
    fullChatId: string | null;

    // Typing indicators
    typingUsers: Record<string, string[]>; // conversationId -> userId[]

    // ==================== ACTIONS ====================
    // Initialization
    setCurrentUser: (userId: string, userType: ParticipantType) => void;
    initializeSocket: (userId: string, userType: ParticipantType, token: string) => void;
    disconnectSocket: () => void;

    // Conversations
    loadConversations: () => Promise<void>;
    createOrGetConversation: (
        participantId: string,
        participantType: ParticipantType
    ) => Promise<Conversation>;
    deleteConversation: (conversationId: string) => Promise<void>;
    updateConversation: (conversation: Conversation) => void;
    updateConversationUserInfo: (conversationId: string, userInfo: Partial<any>) => void;

    // Messages
    loadMessages: (conversationId: string, page?: number) => Promise<void>;
    sendMessage: (conversationId: string, content: string) => Promise<void>;
    addMessage: (message: Message) => void;
    markMessagesAsRead: (conversationId: string) => Promise<void>;

    // Chat Windows
    openChat: (conversationId: string, isFullView?: boolean) => void;
    closeChat: (conversationId: string) => void;
    setFullChat: (conversationId: string | null) => void;

    // Typing
    startTyping: (conversationId: string) => void;
    stopTyping: (conversationId: string) => void;
    setUserTyping: (conversationId: string, userId: string, isTyping: boolean) => void;

    // User Info
    fetchParticipantInfo: (
        participantId: string,
        participantType: ParticipantType
    ) => Promise<UserInfo | null>;
    getUserInfo: (participantId: string) => UserInfo | undefined;

    // Helpers
    getConversation: (conversationId: string) => ConversationWithUserInfo | undefined;
    getMessages: (conversationId: string) => Message[];
    getUnreadCount: (conversationId: string) => number;
    isTyping: (conversationId: string) => boolean;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    // ==================== INITIAL STATE ====================
    currentUserId: null,
    currentUserType: null,
    isSocketConnected: false,
    conversations: {},
    isLoadingConversations: false,
    messages: {},
    isLoadingMessages: {},
    userInfoCache: {},
    openChatWindows: [],
    fullChatId: null,
    typingUsers: {},

    // ==================== INITIALIZATION ====================
    setCurrentUser: (userId: string, userType: ParticipantType) => {
        set({ currentUserId: userId, currentUserType: userType });

        if (typeof window !== 'undefined') {
            localStorage.setItem('userId', userId);
            localStorage.setItem('userType', userType);
        }
    },

    initializeSocket: (userId: string, userType: ParticipantType, token: string) => {
        const { currentUserId } = get();
        if (currentUserId === userId && socketService.isConnected()) {
            return;
        }

        set({ currentUserId: userId, currentUserType: userType });
        socketService.connect(token);

        // Setup socket event listeners
        socketService.onNewMessage((data: NewMessageData) => {
            get().addMessage(data.message);

            // Update conversation's lastMessage
            const conversation = get().conversations[data.conversationId];
            if (conversation) {
                get().updateConversation({
                    ...conversation,
                    lastMessage: data.message,
                    lastMessageAt: data.message.createdAt,
                });
            }
        });

        socketService.onUserTyping((data: TypingData) => {
            get().setUserTyping(data.conversationId, data.userId, data.isTyping);
        });

        socketService.onMessageRead((data: MessageReadData) => {
            const messages = get().messages[data.conversationId] || [];
            const updatedMessages = messages.map((msg) => {
                if (msg._id === data.messageId) {
                    return {
                        ...msg,
                        readBy: [
                            ...msg.readBy,
                            { participantId: data.userId, readAt: data.readAt },
                        ],
                        status: MessageStatus.READ,
                    };
                }
                return msg;
            });

            set({
                messages: {
                    ...get().messages,
                    [data.conversationId]: updatedMessages,
                },
            });
        });

        socketService.onUserOnline((data) => {
            get().updateConversationUserInfo(data.userId, { isOnline: true });
        });

        socketService.onUserOffline((data) => {
            get().updateConversationUserInfo(data.userId, { isOnline: false });
        });

        set({ isSocketConnected: true });
    },

    disconnectSocket: () => {
        socketService.disconnect();
        set({ isSocketConnected: false });
    },

    // ==================== CONVERSATIONS ====================
    loadConversations: async () => {
        try {
            set({ isLoadingConversations: true });
            const response = await conversationApiService.getConversations({
                page: CHAT_CONSTANTS.DEFAULT_PAGE,
                limit: CHAT_CONSTANTS.DEFAULT_PAGE_SIZE,
            });

            const conversationsMap: Record<string, ConversationWithUserInfo> = {};

            // Fetch all participant info in parallel
            await Promise.all(
                response.data.map(async (conv) => {
                    const otherParticipant = conv.participants.find(
                        (p) => p.id !== get().currentUserId
                    );

                    if (otherParticipant) {
                        const userInfo = await get().fetchParticipantInfo(
                            otherParticipant.id,
                            otherParticipant.type
                        );

                        conversationsMap[conv._id] = {
                            ...conv,
                            otherParticipant: userInfo || undefined,
                        };
                    } else {
                        conversationsMap[conv._id] = {
                            ...conv,
                            otherParticipant: undefined,
                        };
                    }
                })
            );

            set({ conversations: conversationsMap });
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            set({ isLoadingConversations: false });
        }
    },

    createOrGetConversation: async (participantId: string, participantType: ParticipantType) => {
        try {
            const response = await conversationApiService.createOrGetConversation({
                participantId,
                participantType,
            });

            const conversation = response.data;
            const otherParticipant = conversation.participants.find(
                (p) => p.id !== get().currentUserId
            );

            // Fetch real user info
            let userInfo: UserInfo | undefined;
            if (otherParticipant) {
                const fetchedInfo = await get().fetchParticipantInfo(
                    otherParticipant.id,
                    otherParticipant.type
                );
                userInfo = fetchedInfo || undefined;
            }

            const conversationWithInfo: ConversationWithUserInfo = {
                ...conversation,
                otherParticipant: userInfo,
            };

            set({
                conversations: {
                    ...get().conversations,
                    [conversation._id]: conversationWithInfo,
                },
            });

            socketService.joinConversation(conversation._id);
            await get().loadMessages(conversation._id);

            return conversation;
        } catch (error) {
            console.error('Failed to create conversation:', error);
            throw error;
        }
    },

    deleteConversation: async (conversationId: string) => {
        try {
            await conversationApiService.deleteConversation(conversationId);
            socketService.leaveConversation(conversationId);

            const { conversations, messages, openChatWindows } = get();
            const { [conversationId]: _, ...remainingConversations } = conversations;
            const { [conversationId]: __, ...remainingMessages } = messages;

            set({
                conversations: remainingConversations,
                messages: remainingMessages,
                openChatWindows: openChatWindows.filter((id) => id !== conversationId),
            });
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            throw error;
        }
    },

    updateConversation: (conversation: Conversation) => {
        const existing = get().conversations[conversation._id];
        set({
            conversations: {
                ...get().conversations,
                [conversation._id]: {
                    ...conversation,
                    otherParticipant: existing?.otherParticipant,
                },
            },
        });
    },

    updateConversationUserInfo: (userId: string, userInfo: Partial<any>) => {
        const conversations = get().conversations;
        Object.keys(conversations).forEach((convId) => {
            const conv = conversations[convId];
            if (conv?.otherParticipant?.id === userId) {
                set({
                    conversations: {
                        ...get().conversations,
                        [convId]: {
                            ...conv,
                            otherParticipant: conv.otherParticipant
                                ? {
                                      ...conv.otherParticipant,
                                      ...userInfo,
                                  }
                                : undefined,
                        },
                    },
                });
            }
        });
    },

    // ==================== MESSAGES ====================
    loadMessages: async (conversationId: string, page = 1) => {
        try {
            set({
                isLoadingMessages: {
                    ...get().isLoadingMessages,
                    [conversationId]: true,
                },
            });

            const response = await messageApiService.getMessages(conversationId, {
                page,
                limit: CHAT_CONSTANTS.MESSAGE_LOAD_LIMIT,
            });

            const existingMessages = get().messages[conversationId] || [];
            const fetched = sortMessagesByTime([...response.data]);

            let merged: Message[] = [];
            if (page === 1) {
                merged = fetched;
            } else {
                merged = [...fetched, ...existingMessages];
            }

            set({
                messages: {
                    ...get().messages,
                    [conversationId]: merged,
                },
            });

            socketService.joinConversation(conversationId);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            set({
                isLoadingMessages: {
                    ...get().isLoadingMessages,
                    [conversationId]: false,
                },
            });
        }
    },

    sendMessage: async (conversationId: string, content: string) => {
        try {
            const { currentUserId, currentUserType, isSocketConnected } = get();

            if (!currentUserId || !currentUserType) {
                throw new Error('User not authenticated');
            }

            // Optimistic update
            const tempMessage: Message = {
                _id: generateTempMessageId(),
                conversationId,
                sender: {
                    id: currentUserId,
                    type: currentUserType,
                },
                content,
                status: MessageStatus.SENDING,
                readBy: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            get().addMessage(tempMessage);

            // Send via Socket or API
            if (isSocketConnected) {
                socketService.sendMessage(conversationId, content);
            } else {
                await messageApiService.sendMessage({ conversationId, content });
            }

            get().stopTyping(conversationId);
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    },

    addMessage: (message: Message) => {
        const existingMessages = get().messages[message.conversationId] || [];

        // Remove temporary messages
        const filteredMessages = existingMessages.filter(
            (m) => !(m._id.startsWith('temp-') && m.status === MessageStatus.SENDING)
        );

        // Check if message already exists
        const messageExists = filteredMessages.some((m) => m._id === message._id);
        if (messageExists) return;

        const newList = sortMessagesByTime([...filteredMessages, message]);

        set({
            messages: {
                ...get().messages,
                [message.conversationId]: newList,
            },
        });
    },

    markMessagesAsRead: async (conversationId: string) => {
        try {
            await messageApiService.markAllMessagesAsRead(conversationId);

            const conversation = get().conversations[conversationId];
            if (conversation && get().currentUserId) {
                set({
                    conversations: {
                        ...get().conversations,
                        [conversationId]: {
                            ...conversation,
                            unreadCount: {
                                ...conversation.unreadCount,
                                [get().currentUserId!]: 0,
                            },
                        },
                    },
                });
            }
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    },

    // ==================== CHAT WINDOWS ====================
    openChat: (conversationId: string, isFullView = false) => {
        if (isFullView) {
            set({ fullChatId: conversationId });
        } else {
            const { openChatWindows } = get();
            if (!openChatWindows.includes(conversationId)) {
                set({
                    openChatWindows: [...openChatWindows, conversationId],
                });
            }
        }

        if (!get().messages[conversationId]) {
            get().loadMessages(conversationId);
        }
    },

    closeChat: (conversationId: string) => {
        const { openChatWindows } = get();
        set({
            openChatWindows: openChatWindows.filter((id) => id !== conversationId),
        });
        socketService.leaveConversation(conversationId);
    },

    setFullChat: (conversationId: string | null) => {
        set({ fullChatId: conversationId });

        if (conversationId && !get().messages[conversationId]) {
            get().loadMessages(conversationId);
        }
    },

    // ==================== TYPING ====================
    startTyping: (conversationId: string) => {
        socketService.startTyping(conversationId);
    },

    stopTyping: (conversationId: string) => {
        socketService.stopTyping(conversationId);
    },

    setUserTyping: (conversationId: string, userId: string, isTyping: boolean) => {
        const { typingUsers, currentUserId } = get();

        if (userId === currentUserId) return;

        const conversationTypingUsers = typingUsers[conversationId] || [];

        if (isTyping) {
            if (!conversationTypingUsers.includes(userId)) {
                set({
                    typingUsers: {
                        ...typingUsers,
                        [conversationId]: [...conversationTypingUsers, userId],
                    },
                });
            }
        } else {
            set({
                typingUsers: {
                    ...typingUsers,
                    [conversationId]: conversationTypingUsers.filter((id) => id !== userId),
                },
            });
        }
    },

    // ==================== USER INFO ====================
    fetchParticipantInfo: async (participantId: string, participantType: ParticipantType) => {
        try {
            // Check cache first
            const cached = get().userInfoCache[participantId];

            if (cached) {
                return cached;
            }

            // Fetch from API
            const profile = await userApiService.getParticipantInfo(participantId, participantType);
            if (!profile) return null;
            const userInfo = convertParticipantProfileToUserInfo(profile, participantType, false);

            // Cache it
            set({
                userInfoCache: {
                    ...get().userInfoCache,
                    [participantId]: userInfo,
                },
            });

            return userInfo;
        } catch (error) {
            console.error(`Failed to fetch participant info for ${participantId}:`, error);
            return null;
        }
    },

    getUserInfo: (participantId: string) => {
        return get().userInfoCache[participantId];
    },

    // ==================== HELPERS ====================
    getConversation: (conversationId: string) => {
        return get().conversations[conversationId];
    },

    getMessages: (conversationId: string) => {
        return get().messages[conversationId] || [];
    },

    getUnreadCount: (conversationId: string) => {
        const { conversations, currentUserId } = get();
        const conversation = conversations[conversationId];

        if (!conversation || !currentUserId) return 0;

        return conversation.unreadCount[currentUserId] || 0;
    },

    isTyping: (conversationId: string) => {
        const typingUsers = get().typingUsers[conversationId] || [];
        return typingUsers.length > 0;
    },
}));
