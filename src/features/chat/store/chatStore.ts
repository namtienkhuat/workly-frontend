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
} from '../services';
import {
    sortMessagesByTime,
    generateTempMessageId,
    convertParticipantProfileToUserInfo,
} from '../utils';
import { CHAT_CONSTANTS } from '../constants/chat.constants';

interface ChatStore {
    // ==================== STATE ====================
    // Version counter to force re-renders when conversations change
    conversationsVersion: number;
    // User
    currentUserId: string | null;
    currentUserType: ParticipantType | null;
    personalUserId: string | null; // Always stores the logged-in user's ID (for Header badge)

    // Socket
    isUserSocketConnected: boolean;
    isCompanySocketConnected: boolean;

    // Conversations
    conversations: Record<string, ConversationWithUserInfo>;
    isLoadingConversations: boolean;
    hiddenConversations: Set<string>;
    clearedConversations: Record<string, number>;
    pendingConversationRequests: Record<string, Promise<Conversation>>; // Track ongoing requests

    // Messages
    messages: Record<string, Message[]>; // conversationId -> messages[]
    isLoadingMessages: Record<string, boolean>;

    // User Info Cache
    userInfoCache: Record<string, UserInfo>; // participantId -> UserInfo

    // Company context
    currentCompanyId: string | null;

    // UI State
    openChatWindows: string[]; // conversationId[]
    fullChatId: string | null;

    // Typing indicators
    typingUsers: Record<string, string[]>; // conversationId -> userId[]

    // ==================== ACTIONS ====================
    // Initialization
    setCurrentUser: (userId: string, userType: ParticipantType) => void;
    setPersonalUserId: (userId: string) => void;
    initializeUserSocket: (userId: string, token: string) => void;
    initializeCompanySocket: (companyId: string, token: string) => void;
    disconnectSocket: () => void;

    // Conversations
    loadConversations: () => Promise<void>;
    createOrGetConversation: (
        participantId: string,
        participantType: ParticipantType
    ) => Promise<Conversation>;
    deleteConversation: (conversationId: string) => Promise<void>;
    unhideConversation: (conversationId: string) => Promise<void>;
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
        // Failed to save
    }
}

function loadClearedConversations(): Record<string, number> {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem('clearedConversations');
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function saveClearedConversations(cleared: Record<string, number>) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('clearedConversations', JSON.stringify(cleared));
    } catch (error) {}
}

export const useChatStore = create<ChatStore>((set, get) => {
    // Debug: Expose store to window for debugging
    if (typeof window !== 'undefined') {
        (window as any).__chatStore__ = { get };
    }

    return {
        // ==================== INITIAL STATE ====================
        conversationsVersion: 0,
        currentUserId: null,
        currentUserType: null,
        personalUserId: null,
        currentCompanyId: null,
        isUserSocketConnected: false,
        isCompanySocketConnected: false,
        conversations: {},
        isLoadingConversations: false,
        hiddenConversations: loadHiddenConversations(),
        clearedConversations: loadClearedConversations(),
        pendingConversationRequests: {},
        messages: {},
        isLoadingMessages: {},
        userInfoCache: {},
        openChatWindows: [],
        fullChatId: null,
        typingUsers: {},

        // ==================== INITIALIZATION ====================
        setCurrentUser: (userId: string, userType: ParticipantType) => {
            set({
                currentUserId: userId,
                currentUserType: userType,
                currentCompanyId:
                    userType === ParticipantType.COMPANY ? userId : get().currentCompanyId,
            });

            if (typeof window !== 'undefined') {
                localStorage.setItem('userId', userId);
                localStorage.setItem('userType', userType);
            }
        },

        setPersonalUserId: (userId: string) => {
            set({ personalUserId: userId });
        },

        initializeUserSocket: (userId: string, token: string) => {
            const socket = socketService.connect('user', token, userId, ParticipantType.USER);

            socket.on('connect', () => {
                set({ isUserSocketConnected: true, personalUserId: userId });
            });

            socket.on('disconnect', () => {
                set({ isUserSocketConnected: false });
            });

            const register = () => {
                socketService.onNewMessage('user', async (data: NewMessageData) => {
                    const { hiddenConversations, personalUserId } = get();
                    const isFromOther = data.message.sender.id !== personalUserId;
                    const isHidden = hiddenConversations.has(data.conversationId);
                    const shouldUnhide = isHidden && isFromOther;

                    get().addMessage(data.message);

                    if (shouldUnhide) {
                        await get().unhideConversation(data.conversationId);
                        // After unhide, conversation will be reloaded with correct unreadCount from server
                        // Don't increment here to avoid double counting
                        return;
                    }

                    let conversation = get().conversations[data.conversationId];
                    if (conversation) {
                        const updatedUnreadCount = { ...conversation.unreadCount };
                        // Only update unreadCount for the current user (personalUserId) in user socket
                        // This prevents double counting when both user and company sockets receive the same message
                        if (personalUserId && personalUserId !== data.message.sender.id) {
                            updatedUnreadCount[personalUserId] =
                                (updatedUnreadCount[personalUserId] || 0) + 1;
                        }
                        // Reset unreadCount for sender
                        if (data.message.sender.id) {
                            updatedUnreadCount[data.message.sender.id] = 0;
                        }
                        const updatedConv = {
                            ...conversation,
                            lastMessage: data.message,
                            lastMessageAt: data.message.createdAt,
                            unreadCount: updatedUnreadCount,
                        };
                        get().updateConversation(updatedConv);
                    } else {
                        // Conversation not in store - fetch this specific conversation
                        try {
                            const response = await conversationApiService.getConversationById(
                                data.conversationId
                            );
                            const fetchedConv = response.data;

                            // Find the other participant
                            const { currentUserId, currentUserType } = get();
                            const otherParticipant = fetchedConv.participants.find(
                                (p) => !(p.id === currentUserId && p.type === currentUserType)
                            );

                            let userInfo;
                            if (otherParticipant) {
                                const isDeletedFromConversation =
                                    fetchedConv.deletedParticipants?.[otherParticipant.id];

                                if (isDeletedFromConversation) {
                                    userInfo = {
                                        id: otherParticipant.id,
                                        type: otherParticipant.type,
                                        name:
                                            otherParticipant.type === ParticipantType.COMPANY
                                                ? 'Company not found'
                                                : 'Account not found',
                                        email: '',
                                        avatar: '',
                                        isOnline: false,
                                        isDeleted: true,
                                    };
                                } else {
                                    const fetchedInfo = await get().fetchParticipantInfo(
                                        otherParticipant.id,
                                        otherParticipant.type
                                    );
                                    userInfo = fetchedInfo || undefined;
                                }
                            }

                            // Calculate unreadCount for new conversation
                            const updatedUnreadCount = { ...fetchedConv.unreadCount };
                            // Increment unreadCount for current user if message is from other user
                            if (personalUserId && personalUserId !== data.message.sender.id) {
                                updatedUnreadCount[personalUserId] =
                                    (updatedUnreadCount[personalUserId] || 0) + 1;
                            }
                            // Reset unreadCount for sender
                            if (data.message.sender.id) {
                                updatedUnreadCount[data.message.sender.id] = 0;
                            }

                            const conversationWithInfo = {
                                ...fetchedConv,
                                otherParticipant: userInfo,
                                lastMessage: data.message,
                                lastMessageAt: data.message.createdAt,
                                unreadCount: updatedUnreadCount,
                            };

                            // Add to store
                            set({
                                conversations: {
                                    ...get().conversations,
                                    [data.conversationId]: conversationWithInfo,
                                },
                                conversationsVersion: get().conversationsVersion + 1,
                            });

                            // Join conversation room
                            if (personalUserId) {
                                socketService.joinConversation('user', data.conversationId);
                            }
                        } catch (error) {
                            console.error('Failed to fetch conversation for new message:', error);
                        }
                    }
                });

                socketService.onUserTyping('user', (data: TypingData) => {
                    get().setUserTyping(data.conversationId, data.userId, data.isTyping);
                });

                socketService.onMessageRead('user', (data: MessageReadData) => {
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

                socketService.onUserOnline('user', (data) => {
                    get().updateConversationUserInfo(data.userId, { isOnline: true });
                });

                socketService.onUserOffline('user', (data) => {
                    get().updateConversationUserInfo(data.userId, { isOnline: false });
                });
            };

            register();
        },

        initializeCompanySocket: (companyId: string, token: string) => {
            const socket = socketService.connect(
                'company',
                token,
                companyId,
                ParticipantType.COMPANY
            );

            socket.on('connect', () => {
                set({ isCompanySocketConnected: true, currentCompanyId: companyId });
            });

            socket.on('disconnect', () => {
                set({ isCompanySocketConnected: false });
            });

            const register = () => {
                socketService.onNewMessage('company', async (data: NewMessageData) => {
                    const { hiddenConversations, currentUserId, currentCompanyId } = get();
                    const isFromOther = data.message.sender.id !== currentUserId;
                    const isHidden = hiddenConversations.has(data.conversationId);
                    const shouldUnhide = isHidden && isFromOther;

                    get().addMessage(data.message);

                    if (shouldUnhide) {
                        await get().unhideConversation(data.conversationId);
                        // After unhide, conversation will be reloaded with correct unreadCount from server
                        // Don't increment here to avoid double counting
                        return;
                    }

                    let conversation = get().conversations[data.conversationId];
                    if (conversation) {
                        const updatedUnreadCount = { ...conversation.unreadCount };
                        // Only update unreadCount for the current company (currentCompanyId) in company socket
                        // This prevents double counting when both user and company sockets receive the same message
                        if (currentCompanyId && currentCompanyId !== data.message.sender.id) {
                            updatedUnreadCount[currentCompanyId] =
                                (updatedUnreadCount[currentCompanyId] || 0) + 1;
                        }
                        // Reset unreadCount for sender
                        if (data.message.sender.id) {
                            updatedUnreadCount[data.message.sender.id] = 0;
                        }
                        const updatedConv = {
                            ...conversation,
                            lastMessage: data.message,
                            lastMessageAt: data.message.createdAt,
                            unreadCount: updatedUnreadCount,
                        };
                        get().updateConversation(updatedConv);
                    } else {
                        // Conversation not in store - fetch this specific conversation
                        try {
                            const response = await conversationApiService.getConversationById(
                                data.conversationId
                            );
                            const fetchedConv = response.data;

                            // Find the other participant
                            const { currentUserId, currentUserType } = get();
                            const otherParticipant = fetchedConv.participants.find(
                                (p) => !(p.id === currentUserId && p.type === currentUserType)
                            );

                            let userInfo;
                            if (otherParticipant) {
                                const isDeletedFromConversation =
                                    fetchedConv.deletedParticipants?.[otherParticipant.id];

                                if (isDeletedFromConversation) {
                                    userInfo = {
                                        id: otherParticipant.id,
                                        type: otherParticipant.type,
                                        name:
                                            otherParticipant.type === ParticipantType.COMPANY
                                                ? 'Company not found'
                                                : 'Account not found',
                                        email: '',
                                        avatar: '',
                                        isOnline: false,
                                        isDeleted: true,
                                    };
                                } else {
                                    const fetchedInfo = await get().fetchParticipantInfo(
                                        otherParticipant.id,
                                        otherParticipant.type
                                    );
                                    userInfo = fetchedInfo || undefined;
                                }
                            }

                            // Calculate unreadCount for new conversation
                            const updatedUnreadCount = { ...fetchedConv.unreadCount };
                            // Increment unreadCount for current company if message is from other user
                            if (currentCompanyId && currentCompanyId !== data.message.sender.id) {
                                updatedUnreadCount[currentCompanyId] =
                                    (updatedUnreadCount[currentCompanyId] || 0) + 1;
                            }
                            // Reset unreadCount for sender
                            if (data.message.sender.id) {
                                updatedUnreadCount[data.message.sender.id] = 0;
                            }

                            const conversationWithInfo = {
                                ...fetchedConv,
                                otherParticipant: userInfo,
                                lastMessage: data.message,
                                lastMessageAt: data.message.createdAt,
                                unreadCount: updatedUnreadCount,
                            };

                            // Add to store
                            set({
                                conversations: {
                                    ...get().conversations,
                                    [data.conversationId]: conversationWithInfo,
                                },
                                conversationsVersion: get().conversationsVersion + 1,
                            });

                            // Join conversation room
                            if (currentCompanyId) {
                                socketService.joinConversation('company', data.conversationId);
                            }
                        } catch (error) {
                            console.error('Failed to fetch conversation for new message:', error);
                        }
                    }
                });

                socketService.onUserTyping('company', (data: TypingData) => {
                    get().setUserTyping(data.conversationId, data.userId, data.isTyping);
                });

                socketService.onMessageRead('company', (data: MessageReadData) => {
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

                socketService.onUserOnline('company', (data) => {
                    get().updateConversationUserInfo(data.userId, { isOnline: true });
                });

                socketService.onUserOffline('company', (data) => {
                    get().updateConversationUserInfo(data.userId, { isOnline: false });
                });
            };

            register();
        },

        disconnectSocket: () => {
            socketService.disconnect('user');
            socketService.disconnect('company');
            set({ isUserSocketConnected: false, isCompanySocketConnected: false });
        },

        // ==================== CONVERSATIONS ====================
        loadConversations: async () => {
            try {
                set({ isLoadingConversations: true });

                const {
                    hiddenConversations,
                    personalUserId,
                    currentCompanyId,
                    currentUserId,
                    currentUserType,
                } = get();

                // Ensure we have a valid identity before loading
                if (!currentUserId || !currentUserType) {
                    set({ isLoadingConversations: false });
                    return;
                }

                const response = await conversationApiService.getConversations({
                    page: CHAT_CONSTANTS.DEFAULT_PAGE,
                    limit: CHAT_CONSTANTS.DEFAULT_PAGE_SIZE,
                });

                const conversationsMap: Record<string, ConversationWithUserInfo> = {};

                // Fetch all participant info in parallel
                await Promise.all(
                    response.data.map(async (conv) => {
                        const { currentUserId, currentUserType } = get();
                        // Find the participant that is NOT the current user
                        // Must check both id AND type to correctly identify the other participant
                        const otherParticipant = conv.participants.find(
                            (p) => !(p.id === currentUserId && p.type === currentUserType)
                        );

                        if (otherParticipant) {
                            // Check if participant is deleted from conversation's deletedParticipants
                            // MongoDB Map serializes to object: { "userId": "2024-01-15T10:30:00.000Z" }
                            const deletedParticipantsObj = conv.deletedParticipants || {};
                            const isDeletedFromConversation =
                                deletedParticipantsObj[otherParticipant.id] !== undefined;

                            // If marked as deleted in conversation, create placeholder without fetching
                            if (isDeletedFromConversation) {
                                conversationsMap[conv._id] = {
                                    ...conv,
                                    otherParticipant: {
                                        id: otherParticipant.id,
                                        type: otherParticipant.type,
                                        name:
                                            otherParticipant.type === ParticipantType.COMPANY
                                                ? 'Company not found'
                                                : 'Account not found',
                                        email: '',
                                        avatar: '',
                                        isOnline: false,
                                        isDeleted: true,
                                    },
                                };
                            } else {
                                // Fetch participant info normally
                                const userInfo = await get().fetchParticipantInfo(
                                    otherParticipant.id,
                                    otherParticipant.type
                                );

                                conversationsMap[conv._id] = {
                                    ...conv,
                                    otherParticipant: userInfo || undefined,
                                };
                            }
                        } else {
                            conversationsMap[conv._id] = {
                                ...conv,
                                otherParticipant: undefined,
                            };
                        }
                    })
                );

                // Hidden conversations should stay hidden when loading from API
                // They will only be unhidden when receiving NEW messages via socket (onNewMessage)
                const newHidden = new Set(hiddenConversations);

                // Merge with existing conversations instead of replacing
                const existingConversations = get().conversations;
                const mergedConversations: Record<string, ConversationWithUserInfo> = {
                    ...existingConversations,
                };

                // First, remove any hidden conversations from the merged result
                Object.keys(mergedConversations).forEach((id) => {
                    if (newHidden.has(id)) {
                        delete mergedConversations[id];
                    }
                });

                // Then, add/update non-hidden conversations from API
                Object.entries(conversationsMap).forEach(([id, newConv]) => {
                    // Skip hidden conversations completely
                    if (newHidden.has(id)) {
                        return;
                    }

                    // Merge with existing conversation if exists, otherwise add new
                    const existing = mergedConversations[id];
                    if (existing) {
                        // Update existing conversation
                        // Always use newConv.otherParticipant as it's calculated based on current currentUserId/currentUserType
                        // Don't preserve existing.otherParticipant as it might be from a different perspective (user vs company)
                        // This ensures correct otherParticipant when switching between user and company views
                        // Always use newConv.unreadCount from server to avoid double counting
                        // (socket handler already updates unreadCount, so merging would cause duplication)
                        mergedConversations[id] = {
                            ...existing,
                            ...newConv,
                            // Prioritize newConv.otherParticipant (calculated from current perspective)
                            otherParticipant: newConv.otherParticipant ?? existing.otherParticipant,
                            // Use server's unreadCount (authoritative source) to avoid double counting
                            unreadCount: newConv.unreadCount || existing.unreadCount,
                        };
                    } else {
                        // Add new conversation
                        mergedConversations[id] = newConv;
                    }
                });

                set({
                    conversations: mergedConversations,
                    hiddenConversations: newHidden,
                    conversationsVersion: get().conversationsVersion + 1,
                });

                // Join all non-hidden conversation rooms to receive real-time messages on both sockets
                Object.values(mergedConversations).forEach((conv) => {
                    if (newHidden.has(conv._id)) return;
                    const hasUser = personalUserId
                        ? conv.participants.some((p) => p.id === personalUserId)
                        : false;
                    const hasCompany = currentCompanyId
                        ? conv.participants.some(
                              (p) => p.id === currentCompanyId && p.type === ParticipantType.COMPANY
                          )
                        : false;
                    if (hasUser) {
                        socketService.joinConversation('user', conv._id);
                    }
                    if (hasCompany) {
                        socketService.joinConversation('company', conv._id);
                    }
                });
            } catch (error) {
                // Error loading conversations
            } finally {
                set({ isLoadingConversations: false });
            }
        },

        createOrGetConversation: async (
            participantId: string,
            participantType: ParticipantType
        ) => {
            // Create unique key for this participant pair to prevent duplicate requests
            const requestKey = `${participantId}_${participantType}`;

            // Check if there's already a pending request for this conversation
            const pendingRequest = get().pendingConversationRequests[requestKey];
            if (pendingRequest) {
                console.log(`[createOrGetConversation] Using pending request for ${requestKey}`);
                return pendingRequest;
            }

            // Create new request and store it
            const requestPromise = (async () => {
                try {
                    const response = await conversationApiService.createOrGetConversation({
                        participantId,
                        participantType,
                    });

                    const conversation = response.data;
                    const { currentUserId, currentUserType } = get();
                    // Find the participant that is NOT the current user
                    // Must check both id AND type to correctly identify the other participant
                    const otherParticipant = conversation.participants.find(
                        (p) => !(p.id === currentUserId && p.type === currentUserType)
                    );

                    // Fetch real user info
                    let userInfo: UserInfo | undefined;
                    if (otherParticipant) {
                        // Check if participant is deleted from conversation's deletedParticipants
                        const isDeletedFromConversation =
                            conversation.deletedParticipants?.[otherParticipant.id];

                        if (isDeletedFromConversation) {
                            // Create placeholder for deleted participant
                            userInfo = {
                                id: otherParticipant.id,
                                type: otherParticipant.type,
                                name:
                                    otherParticipant.type === ParticipantType.COMPANY
                                        ? 'Company not found'
                                        : 'Account not found',
                                email: '',
                                avatar: '',
                                isOnline: false,
                                isDeleted: true,
                            };
                        } else {
                            const fetchedInfo = await get().fetchParticipantInfo(
                                otherParticipant.id,
                                otherParticipant.type
                            );
                            userInfo = fetchedInfo || undefined;
                        }
                    }

                    const conversationWithInfo: ConversationWithUserInfo = {
                        ...conversation,
                        otherParticipant: userInfo,
                    };

                    // If this conversation was hidden, unhide it (user is intentionally starting it)
                    const { hiddenConversations, conversations: existingConversations } = get();
                    if (hiddenConversations.has(conversation._id)) {
                        await get().unhideConversation(conversation._id);
                    }

                    // Only add if conversation doesn't already exist to avoid duplicates
                    const existing = existingConversations[conversation._id];
                    if (!existing) {
                        set({
                            conversations: {
                                ...existingConversations,
                                [conversation._id]: conversationWithInfo,
                            },
                        });
                    } else {
                        // Update existing conversation if needed
                        // Always use conversationWithInfo.otherParticipant as it's calculated based on current currentUserId/currentUserType
                        // Don't preserve existing.otherParticipant as it might be from a different perspective (user vs company)
                        if (existing.otherParticipant !== conversationWithInfo.otherParticipant) {
                            set({
                                conversations: {
                                    ...existingConversations,
                                    [conversation._id]: {
                                        ...existing,
                                        ...conversationWithInfo,
                                        otherParticipant:
                                            conversationWithInfo.otherParticipant ||
                                            existing.otherParticipant,
                                    },
                                },
                            });
                        }
                    }

                    // Ensure socket is joined to conversation room
                    const personalUserId = get().personalUserId;
                    const currentCompanyId = get().currentCompanyId;
                    const hasUser = personalUserId
                        ? conversation.participants.some((p) => p.id === personalUserId)
                        : false;
                    const hasCompany = currentCompanyId
                        ? conversation.participants.some(
                              (p) => p.id === currentCompanyId && p.type === ParticipantType.COMPANY
                          )
                        : false;
                    if (hasUser) socketService.joinConversation('user', conversation._id);
                    if (hasCompany) socketService.joinConversation('company', conversation._id);
                    await get().loadMessages(conversation._id);

                    return conversation;
                } catch (error) {
                    throw error;
                } finally {
                    // Clean up pending request
                    const { pendingConversationRequests } = get();
                    const { [requestKey]: _, ...remainingRequests } = pendingConversationRequests;
                    set({ pendingConversationRequests: remainingRequests });
                }
            })();

            // Store the pending request
            set({
                pendingConversationRequests: {
                    ...get().pendingConversationRequests,
                    [requestKey]: requestPromise,
                },
            });

            return requestPromise;
        },

        deleteConversation: async (conversationId: string) => {
            try {
                const {
                    hiddenConversations,
                    clearedConversations,
                    openChatWindows,
                    messages,
                    conversations,
                    fullChatId,
                } = get();

                const conversation = conversations[conversationId];

                if (!conversation) {
                    return;
                }

                // Check if any participant has been deleted
                // Check both otherParticipant.isDeleted and deletedParticipants from conversation
                const otherParticipantId = conversation?.otherParticipant?.id;
                const isDeletedFromParticipant = conversation?.otherParticipant?.isDeleted || false;

                // Check deletedParticipants map from conversation
                const deletedParticipantsObj = conversation?.deletedParticipants || {};
                const isDeletedFromConversation = otherParticipantId
                    ? deletedParticipantsObj[otherParticipantId] !== undefined
                    : false;

                // Also check all participants in the conversation for deleted status
                const hasDeletedParticipantInParticipants =
                    conversation?.participants.some((p) => {
                        return deletedParticipantsObj[p.id] !== undefined;
                    }) || false;

                const hasDeletedParticipant =
                    isDeletedFromParticipant ||
                    isDeletedFromConversation ||
                    hasDeletedParticipantInParticipants;

                // CASE 1: Participant has been deleted → HARD DELETE
                if (hasDeletedParticipant) {
                    try {
                        await conversationApiService.deleteConversation(
                            conversationId,
                            hasDeletedParticipant
                        );

                        // After successful hard delete, remove from store
                        const { [conversationId]: _, ...remainingMessages } = messages;
                        const { [conversationId]: __, ...remainingConversations } = conversations;

                        set({
                            messages: remainingMessages,
                            conversations: remainingConversations,
                            openChatWindows: openChatWindows.filter((id) => id !== conversationId),
                            fullChatId: fullChatId === conversationId ? null : fullChatId,
                        });
                        return; // No longer doing soft delete
                    } catch (error) {
                        // Nếu API call fail, fallback về soft delete
                    }
                }

                // TRƯỜNG HỢP 2: Cả hai đều còn tồn tại → SOFT DELETE (ẩn ở client)

                const newHidden = new Set(hiddenConversations);
                newHidden.add(conversationId);

                const newCleared = {
                    ...clearedConversations,
                    [conversationId]: Date.now(),
                };

                saveHiddenConversations(newHidden);
                saveClearedConversations(newCleared);

                const { [conversationId]: _, ...remainingMessages } = messages;
                const { [conversationId]: __, ...remainingConversations } = conversations;

                set({
                    hiddenConversations: newHidden,
                    clearedConversations: newCleared,
                    messages: remainingMessages,
                    conversations: remainingConversations,
                    openChatWindows: openChatWindows.filter((id) => id !== conversationId),
                    fullChatId: fullChatId === conversationId ? null : fullChatId,
                });
            } catch (error) {
                throw error;
            }
        },

        unhideConversation: async (conversationId: string) => {
            const {
                hiddenConversations,
                conversations,
                personalUserId,
                currentCompanyId,
                currentUserId,
                currentUserType,
            } = get();

            const newHidden = new Set(hiddenConversations);
            newHidden.delete(conversationId);

            saveHiddenConversations(newHidden);

            const conv = conversations[conversationId];
            const hasUser = personalUserId
                ? conv?.participants.some((p) => p.id === personalUserId)
                : false;
            const hasCompany = currentCompanyId
                ? conv?.participants.some(
                      (p) => p.id === currentCompanyId && p.type === ParticipantType.COMPANY
                  )
                : false;
            if (hasUser) socketService.joinConversation('user', conversationId);
            if (hasCompany) socketService.joinConversation('company', conversationId);

            set({
                hiddenConversations: newHidden,
            });

            // Always reload conversation to get correct unreadCount from server
            // This ensures unreadCount is accurate after unhide
            if (currentUserId && currentUserType) {
                await get().loadConversations();
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
                conversationsVersion: get().conversationsVersion + 1,
            });
        },

        updateConversationUserInfo: (userId: string, userInfo: Partial<any>) => {
            const conversations = get().conversations;
            const userInfoCache = get().userInfoCache;
            const updatedConversations: Record<string, ConversationWithUserInfo> = {};
            let hasUpdates = false;

            Object.keys(conversations).forEach((convId) => {
                const conv = conversations[convId];
                if (!conv) return;

                // Check if userId is in participants and matches otherParticipant
                const isParticipant = conv.participants.some((p) => p.id === userId);
                const isOtherParticipant = conv.otherParticipant?.id === userId;

                if (isParticipant && isOtherParticipant) {
                    // Update otherParticipant if it matches
                    updatedConversations[convId] = {
                        ...conv,
                        otherParticipant: conv.otherParticipant
                            ? {
                                  ...conv.otherParticipant,
                                  ...userInfo,
                              }
                            : undefined,
                    };
                    hasUpdates = true;
                } else if (isParticipant && !conv.otherParticipant) {
                    // If participant exists but otherParticipant is not loaded yet,
                    // try to update from cache or create placeholder
                    const cachedInfo = userInfoCache[userId];
                    if (cachedInfo) {
                        updatedConversations[convId] = {
                            ...conv,
                            otherParticipant: {
                                ...cachedInfo,
                                ...userInfo,
                            },
                        };
                        hasUpdates = true;
                    } else {
                        updatedConversations[convId] = conv;
                    }
                } else {
                    updatedConversations[convId] = conv;
                }
            });

            // Also update userInfoCache to keep it in sync
            const updatedCache = userInfoCache[userId]
                ? {
                      ...userInfoCache,
                      [userId]: {
                          ...userInfoCache[userId],
                          ...userInfo,
                      },
                  }
                : userInfoCache;

            // Always update cache, and update conversations if there were changes
            if (hasUpdates) {
                set({
                    conversations: updatedConversations,
                    userInfoCache: updatedCache,
                });
            } else {
                // Even if no conversation updates, update cache
                set({
                    userInfoCache: updatedCache,
                });
            }
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

                const response = await messageApiService.getMessages(conversationId, {
                    page,
                    limit: CHAT_CONSTANTS.MESSAGE_LOAD_LIMIT,
                });

                const existingMessages = get().messages[conversationId] || [];
                let fetched = sortMessagesByTime([...response.data]);

                const clearedTimestamp = clearedConversations[conversationId];
                if (clearedTimestamp) {
                    fetched = fetched.filter((msg) => {
                        const msgTime = new Date(msg.createdAt).getTime();
                        return msgTime > clearedTimestamp;
                    });
                }

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

                const { personalUserId, currentCompanyId, conversations } = get();
                const conv = conversations[conversationId];
                const hasUser = personalUserId
                    ? conv?.participants.some((p) => p.id === personalUserId)
                    : false;
                const hasCompany = currentCompanyId
                    ? conv?.participants.some(
                          (p) => p.id === currentCompanyId && p.type === ParticipantType.COMPANY
                      )
                    : false;
                if (hasUser) socketService.joinConversation('user', conversationId);
                if (hasCompany) socketService.joinConversation('company', conversationId);
            } catch (error) {
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
                const {
                    currentUserId,
                    currentUserType,
                    isUserSocketConnected,
                    isCompanySocketConnected,
                } = get();

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
                const identity = currentUserType === ParticipantType.COMPANY ? 'company' : 'user';
                if (
                    (identity === 'company' && isCompanySocketConnected) ||
                    (identity === 'user' && isUserSocketConnected)
                ) {
                    socketService.sendMessage(identity, conversationId, content);
                } else {
                    await messageApiService.sendMessage({
                        conversationId,
                        content,
                    });
                }

                get().stopTyping(conversationId);
            } catch (error) {
                throw error;
            }
        },

        addMessage: (message: Message) => {
            const existingMessages = get().messages[message.conversationId] || [];
            const { currentUserId } = get();

            // Check if message already exists
            const messageExists = existingMessages.some((m) => m._id === message._id);
            if (messageExists) {
                return;
            }

            // If this is a real message from current user, remove matching temp message
            let filteredMessages = existingMessages;
            if (!message._id.startsWith('temp-') && message.sender.id === currentUserId) {
                // Find and remove temp message with same content and sender
                filteredMessages = existingMessages.filter((m) => {
                    if (m._id.startsWith('temp-') && m.status === MessageStatus.SENDING) {
                        // Remove temp message if content matches and created within last 10 seconds
                        const isSameContent = m.content === message.content;
                        const timeDiff = Math.abs(
                            new Date(message.createdAt).getTime() - new Date(m.createdAt).getTime()
                        );
                        const shouldRemove = isSameContent && timeDiff < 10000;
                        return !shouldRemove;
                    }
                    return true;
                });
            }

            const newList = sortMessagesByTime([...filteredMessages, message]);

            set({
                messages: {
                    ...get().messages,
                    [message.conversationId]: newList,
                },
            });
        },

        markMessagesAsRead: async (conversationId: string) => {
            const { currentUserType, currentUserId } = get();

            if (currentUserType === ParticipantType.COMPANY) {
                // For company, also call API to mark as read on server
                try {
                    await messageApiService.markAllMessagesAsRead(conversationId);
                } catch (error: any) {
                    // Silently handle 403 errors (permission issues)
                    if (error?.response?.status !== 403) {
                        // Error marking as read
                    }
                }

                const conversation = get().conversations[conversationId];
                const currentMessages = get().messages[conversationId] || [];

                if (conversation && currentUserId) {
                    const updatedConversation = {
                        ...conversation,
                        unreadCount: {
                            ...conversation.unreadCount,
                            [currentUserId]: 0,
                        },
                    };

                    // Update all messages status to READ and add readBy
                    const updatedMessages = currentMessages.map((msg) => {
                        if (msg.sender.id !== currentUserId && msg.status !== MessageStatus.READ) {
                            const readByEntry = {
                                participantId: currentUserId,
                                readAt: new Date(),
                            };

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
                        conversationsVersion: get().conversationsVersion + 1,
                    });
                }
                return;
            }

            try {
                await messageApiService.markAllMessagesAsRead(conversationId);

                const conversation = get().conversations[conversationId];
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
                        conversationsVersion: get().conversationsVersion + 1,
                    });
                }
            } catch (error: any) {
                // Silently handle 403 errors (permission issues)
                if (error?.response?.status !== 403) {
                    // Re-throw other errors
                    throw error;
                }
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
            const { openChatWindows, personalUserId, currentCompanyId, conversations } = get();
            set({
                openChatWindows: openChatWindows.filter((id) => id !== conversationId),
            });
            const conv = conversations[conversationId];
            const hasUser = personalUserId
                ? conv?.participants.some((p) => p.id === personalUserId)
                : false;
            const hasCompany = currentCompanyId
                ? conv?.participants.some(
                      (p) => p.id === currentCompanyId && p.type === ParticipantType.COMPANY
                  )
                : false;
            if (hasUser) socketService.leaveConversation('user', conversationId);
            if (hasCompany) socketService.leaveConversation('company', conversationId);
        },

        setFullChat: (conversationId: string | null) => {
            set({ fullChatId: conversationId });

            if (conversationId && !get().messages[conversationId]) {
                get().loadMessages(conversationId);
            }
        },

        // ==================== TYPING ====================
        startTyping: (conversationId: string) => {
            const { currentUserType } = get();
            const identity = currentUserType === ParticipantType.COMPANY ? 'company' : 'user';
            socketService.startTyping(identity, conversationId);
        },

        stopTyping: (conversationId: string) => {
            const { currentUserType } = get();
            const identity = currentUserType === ParticipantType.COMPANY ? 'company' : 'user';
            socketService.stopTyping(identity, conversationId);
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
                const profile = await userApiService.getParticipantInfo(
                    participantId,
                    participantType
                );
                if (!profile) return null;

                // Check if we have previous online status from cache (in case of refresh)
                const existingCached = get().userInfoCache[participantId];
                const isOnline = existingCached?.isOnline ?? false;

                const userInfo = convertParticipantProfileToUserInfo(
                    profile,
                    participantType,
                    isOnline
                );

                // Cache it
                set({
                    userInfoCache: {
                        ...get().userInfoCache,
                        [participantId]: userInfo,
                    },
                });

                return userInfo;
            } catch (error) {
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
    };
});
