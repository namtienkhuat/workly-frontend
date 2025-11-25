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
    hiddenConversations: Set<string>; // conversationIds hidden by current user
    clearedConversations: Set<string>; // conversationIds with cleared history

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
    unhideConversation: (conversationId: string, keepUnreadCount?: boolean) => void;
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

// Helper to load hidden conversations from localStorage
function loadHiddenConversations(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
        const stored = localStorage.getItem('hiddenConversations');
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
        return new Set();
    }
}

// Helper to save hidden conversations to localStorage
function saveHiddenConversations(hidden: Set<string>) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('hiddenConversations', JSON.stringify([...hidden]));
    } catch (error) {
        console.error('Failed to save hidden conversations:', error);
    }
}

export const useChatStore = create<ChatStore>((set, get) => ({
    // ==================== INITIAL STATE ====================
    currentUserId: null,
    currentUserType: null,
    isSocketConnected: false,
    conversations: {},
    isLoadingConversations: false,
    hiddenConversations: loadHiddenConversations(),
    clearedConversations: new Set<string>(),
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
            set({ isSocketConnected: true });
            return;
        }

        set({ currentUserId: userId, currentUserType: userType });
        const socket = socketService.connect(token, userId, userType);

        // Setup connection handler
        socket.on('connect', () => {
            console.log('✅ Socket connected successfully');
            set({ isSocketConnected: true });
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            set({ isSocketConnected: false });
        });

        // Setup socket event listeners
        socketService.onNewMessage((data: NewMessageData) => {
            const { hiddenConversations, currentUserId, openChatWindows } = get();
            const isFromOther = data.message.sender.id !== currentUserId;
            const isConversationOpen = openChatWindows.includes(data.conversationId);

            console.log('📨 New message received:', {
                conversationId: data.conversationId,
                senderId: data.message.sender.id,
                currentUserId,
                isFromOther,
                isConversationOpen,
            });

            // If message is from another user and conversation is hidden, unhide it
            if (hiddenConversations.has(data.conversationId) && isFromOther) {
                console.log(
                    '📬 New message from hidden conversation, unhiding:',
                    data.conversationId
                );
                get().unhideConversation(data.conversationId);
            }

            get().addMessage(data.message);

            // Update conversation's lastMessage
            const conversation = get().conversations[data.conversationId];
            if (conversation) {
                // Only increment unread count if message is from another user
                // AND currentUserId is set (to avoid incrementing for own messages)
                let updatedUnreadCount = conversation.unreadCount;

                if (isFromOther && currentUserId) {
                    // If conversation is open (user is viewing it), auto-mark as read
                    if (isConversationOpen) {
                        // User is actively viewing this conversation - mark all messages as read immediately
                        updatedUnreadCount = {
                            ...conversation.unreadCount,
                            [currentUserId]: 0,
                        };

                        // Auto-mark all messages as read via API (async, don't wait)
                        messageApiService
                            .markAllMessagesAsRead(data.conversationId)
                            .catch((err) => {
                                console.error('Failed to auto-mark messages as read:', err);
                            });

                        // Also update all messages status in local state
                        const currentMessages = get().messages[data.conversationId] || [];
                        const updatedMessages = currentMessages.map((msg) => {
                            // Only update messages that are not from current user and not already read
                            if (
                                msg.sender.id !== currentUserId &&
                                msg.status !== MessageStatus.READ
                            ) {
                                const readByEntry = {
                                    participantId: currentUserId,
                                    readAt: new Date(),
                                };
                                return {
                                    ...msg,
                                    readBy: [...msg.readBy, readByEntry],
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

                        console.log(`👁️ Auto-marked all messages as read (conversation is open)`);
                    } else {
                        // Conversation is not open - increment unread count
                        updatedUnreadCount = {
                            ...conversation.unreadCount,
                            [currentUserId]: (conversation.unreadCount[currentUserId] || 0) + 1,
                        };
                        console.log(
                            `📈 Incremented unread count for user ${currentUserId}:`,
                            updatedUnreadCount[currentUserId]
                        );
                    }
                } else if (!isFromOther && currentUserId) {
                    // Message from current user - ensure unread count is 0 for sender
                    updatedUnreadCount = {
                        ...conversation.unreadCount,
                        [currentUserId]: 0,
                    };
                    console.log(`✅ Reset unread count for sender ${currentUserId} (own message)`);
                }

                get().updateConversation({
                    ...conversation,
                    lastMessage: data.message,
                    lastMessageAt: data.message.createdAt,
                    unreadCount: updatedUnreadCount,
                });
            } else {
                // Conversation not in store yet, reload conversations to get it
                console.log('New conversation detected, reloading conversations...');
                get().loadConversations();
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
    },

    disconnectSocket: () => {
        socketService.disconnect();
        set({ isSocketConnected: false });
    },

    // ==================== CONVERSATIONS ====================
    loadConversations: async () => {
        try {
            set({ isLoadingConversations: true });

            const { currentUserId, currentUserType } = get();
            console.log('📥 Loading conversations with identity:', {
                currentUserId,
                currentUserType,
                timestamp: new Date().toISOString(),
            });

            const response = await conversationApiService.getConversations({
                page: CHAT_CONSTANTS.DEFAULT_PAGE,
                limit: CHAT_CONSTANTS.DEFAULT_PAGE_SIZE,
            });

            console.log('📨 Received conversations from API:', {
                count: response.data.length,
                conversations: response.data.map((c) => ({
                    id: c._id,
                    participants: c.participants,
                })),
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

            // Auto-unhide conversations with new unread messages
            const { hiddenConversations } = get();
            const conversationsToUnhide: string[] = [];

            Object.entries(conversationsMap).forEach(([convId, conv]) => {
                if (hiddenConversations.has(convId)) {
                    // Check if there are unread messages for current user
                    const unreadCount = currentUserId ? conv.unreadCount[currentUserId] || 0 : 0;
                    if (unreadCount > 0) {
                        console.log(
                            `📬 Auto-unhiding conversation ${convId} with ${unreadCount} unread messages`
                        );
                        conversationsToUnhide.push(convId);
                    }
                }
            });

            // Unhide conversations with new messages (keep unread count from server)
            conversationsToUnhide.forEach((convId) => {
                get().unhideConversation(convId, true); // Keep unread count
            });

            // Join all conversation rooms to receive real-time messages
            Object.keys(conversationsMap).forEach((conversationId) => {
                // Skip joining hidden conversations (without new messages)
                if (
                    !hiddenConversations.has(conversationId) ||
                    conversationsToUnhide.includes(conversationId)
                ) {
                    socketService.joinConversation(conversationId);
                }
            });

            console.log('✅ Joined all conversation rooms');
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
            // Instead of deleting from server, just hide it locally
            // This way the conversation remains for the other participant
            const { hiddenConversations, clearedConversations, openChatWindows, messages } = get();

            // Add to hidden conversations
            const newHidden = new Set(hiddenConversations);
            newHidden.add(conversationId);

            // Mark as cleared to prevent loading old messages
            const newCleared = new Set(clearedConversations);
            newCleared.add(conversationId);

            // Save to localStorage for persistence
            saveHiddenConversations(newHidden);

            // Clear messages for this conversation locally
            // When unhidden, user will only see new messages
            const { [conversationId]: _, ...remainingMessages } = messages;

            // Leave the conversation room
            socketService.leaveConversation(conversationId);

            // Update state
            set({
                hiddenConversations: newHidden,
                clearedConversations: newCleared,
                messages: remainingMessages,
                openChatWindows: openChatWindows.filter((id) => id !== conversationId),
            });

            console.log('✅ Conversation hidden and messages cleared:', conversationId);
        } catch (error) {
            console.error('Failed to hide conversation:', error);
            throw error;
        }
    },

    unhideConversation: (conversationId: string, keepUnreadCount: boolean = false) => {
        const { hiddenConversations, conversations, currentUserId } = get();

        // Remove from hidden conversations
        const newHidden = new Set(hiddenConversations);
        newHidden.delete(conversationId);

        // Save to localStorage
        saveHiddenConversations(newHidden);

        // Rejoin the conversation room
        socketService.joinConversation(conversationId);

        // Optionally reset unread count for current user
        const conversation = conversations[conversationId];
        if (conversation && currentUserId && !keepUnreadCount) {
            // Reset unread count to 0 (for manual unhide via new message)
            const updatedConversation = {
                ...conversation,
                unreadCount: {
                    ...conversation.unreadCount,
                    [currentUserId]: 0,
                },
            };

            set({
                hiddenConversations: newHidden,
                conversations: {
                    ...conversations,
                    [conversationId]: updatedConversation,
                },
            });
        } else {
            // Keep unread count as is (for auto-unhide on reload)
            set({ hiddenConversations: newHidden });
        }

        console.log(
            '✅ Conversation unhidden:',
            conversationId,
            keepUnreadCount ? '(keeping unread count)' : '(fresh start)'
        );
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
            const { clearedConversations } = get();

            set({
                isLoadingMessages: {
                    ...get().isLoadingMessages,
                    [conversationId]: true,
                },
            });

            // Don't load old messages for cleared conversations
            // Only new real-time messages will appear
            if (clearedConversations.has(conversationId)) {
                console.log('⚠️ Skipping message load for cleared conversation:', conversationId);
                set({
                    messages: {
                        ...get().messages,
                        [conversationId]: [],
                    },
                });
                socketService.joinConversation(conversationId);
                return;
            }

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
            const currentUserId = get().currentUserId;
            const currentMessages = get().messages[conversationId] || [];

            if (conversation && currentUserId) {
                // Update unreadCount
                const updatedConversation = {
                    ...conversation,
                    unreadCount: {
                        ...conversation.unreadCount,
                        [currentUserId]: 0,
                    },
                };

                // Update all messages status to READ and add readBy
                const updatedMessages = currentMessages.map((msg) => {
                    // Only update messages that are not from current user and not already read
                    if (msg.sender.id !== currentUserId && msg.status !== MessageStatus.READ) {
                        const readByEntry = {
                            participantId: currentUserId,
                            readAt: new Date(),
                        };

                        // Check if already in readBy to avoid duplicates
                        const alreadyRead = msg.readBy.some(
                            (r) => r.participantId === currentUserId
                        );

                        return {
                            ...msg,
                            status: MessageStatus.READ,
                            readBy: alreadyRead ? msg.readBy : [...msg.readBy, readByEntry],
                        };
                    }
                    return msg;
                });

                set({
                    conversations: {
                        ...get().conversations,
                        [conversationId]: updatedConversation,
                    },
                    messages: {
                        ...get().messages,
                        [conversationId]: updatedMessages,
                    },
                });

                console.log(`✅ Marked all messages as read for conversation ${conversationId}`);
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
