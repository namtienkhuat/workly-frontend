import { io, Socket } from 'socket.io-client';
import { CHAT_CONSTANTS, SOCKET_EVENTS } from '../../constants/chat.constants';
import {
    NewMessageData,
    TypingData,
    MessageReadData,
    UserStatusData,
    ConversationJoinLeaveData,
} from '../../types';

export type SocketIdentity = 'user' | 'company';

class MultiSocketService {
    private sockets: Record<SocketIdentity, Socket | null> = { user: null, company: null };
    private reconnectAttempts: Record<SocketIdentity, number> = { user: 0, company: 0 };

    connect(identity: SocketIdentity, token: string, userId?: string, userType?: string): Socket {
        const existing = this.sockets[identity];
        if (existing) {
            existing.io.opts.reconnection = false;
            existing.disconnect();
            existing.removeAllListeners();
            this.sockets[identity] = null;
        }

        const auth: any = { token };
        if (userId && userType) {
            auth.userId = userId;
            auth.userType = userType;
        }

        const socket = io(CHAT_CONSTANTS.SOCKET_URL, {
            auth,
            reconnection: true,
            reconnectionDelay: CHAT_CONSTANTS.RECONNECT_DELAY,
            reconnectionDelayMax: CHAT_CONSTANTS.RECONNECT_DELAY_MAX,
            reconnectionAttempts: CHAT_CONSTANTS.MAX_RECONNECT_ATTEMPTS,
        });

        this.sockets[identity] = socket;
        this.setupConnectionHandlers(identity);
        return socket;
    }

    private setupConnectionHandlers(identity: SocketIdentity): void {
        const socket = this.sockets[identity];
        if (!socket) return;

        socket.on(SOCKET_EVENTS.CONNECT, () => {
            this.reconnectAttempts[identity] = 0;
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, () => {});

        socket.on(SOCKET_EVENTS.CONNECT_ERROR, () => {
            this.reconnectAttempts[identity]++;
        });

        socket.on(SOCKET_EVENTS.ERROR, () => {});
    }

    disconnect(identity: SocketIdentity): void {
        const socket = this.sockets[identity];
        if (socket) {
            socket.disconnect();
            this.sockets[identity] = null;
        }
    }

    isConnected(identity: SocketIdentity): boolean {
        return this.sockets[identity]?.connected || false;
    }

    getSocket(identity: SocketIdentity): Socket | null {
        return this.sockets[identity];
    }

    joinConversation(identity: SocketIdentity, conversationId: string): void {
        this.sockets[identity]?.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId });
    }

    leaveConversation(identity: SocketIdentity, conversationId: string): void {
        this.sockets[identity]?.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationId });
    }

    onUserJoinedConversation(
        identity: SocketIdentity,
        callback: (data: ConversationJoinLeaveData) => void
    ): void {
        this.sockets[identity]?.on(SOCKET_EVENTS.USER_JOINED_CONVERSATION, callback);
    }

    onUserLeftConversation(
        identity: SocketIdentity,
        callback: (data: ConversationJoinLeaveData) => void
    ): void {
        this.sockets[identity]?.on(SOCKET_EVENTS.USER_LEFT_CONVERSATION, callback);
    }

    offUserJoinedConversation(
        identity: SocketIdentity,
        callback?: (data: ConversationJoinLeaveData) => void
    ): void {
        this.sockets[identity]?.off(SOCKET_EVENTS.USER_JOINED_CONVERSATION, callback);
    }

    offUserLeftConversation(
        identity: SocketIdentity,
        callback?: (data: ConversationJoinLeaveData) => void
    ): void {
        this.sockets[identity]?.off(SOCKET_EVENTS.USER_LEFT_CONVERSATION, callback);
    }

    sendMessage(identity: SocketIdentity, conversationId: string, content: string): void {
        this.sockets[identity]?.emit(SOCKET_EVENTS.SEND_MESSAGE, { conversationId, content });
    }

    onNewMessage(identity: SocketIdentity, callback: (data: NewMessageData) => void): void {
        this.sockets[identity]?.on(SOCKET_EVENTS.NEW_MESSAGE, callback);
    }

    offNewMessage(identity: SocketIdentity, callback?: (data: NewMessageData) => void): void {
        this.sockets[identity]?.off(SOCKET_EVENTS.NEW_MESSAGE, callback);
    }

    markMessageRead(identity: SocketIdentity, conversationId: string, messageId: string): void {
        this.sockets[identity]?.emit(SOCKET_EVENTS.MARK_MESSAGE_READ, {
            conversationId,
            messageId,
        });
    }

    onMessageRead(identity: SocketIdentity, callback: (data: MessageReadData) => void): void {
        this.sockets[identity]?.on(SOCKET_EVENTS.MESSAGE_READ, callback);
    }

    offMessageRead(identity: SocketIdentity, callback?: (data: MessageReadData) => void): void {
        this.sockets[identity]?.off(SOCKET_EVENTS.MESSAGE_READ, callback);
    }

    startTyping(identity: SocketIdentity, conversationId: string): void {
        this.sockets[identity]?.emit(SOCKET_EVENTS.TYPING, { conversationId });
    }

    stopTyping(identity: SocketIdentity, conversationId: string): void {
        this.sockets[identity]?.emit(SOCKET_EVENTS.STOP_TYPING, { conversationId });
    }

    onUserTyping(identity: SocketIdentity, callback: (data: TypingData) => void): void {
        this.sockets[identity]?.on(SOCKET_EVENTS.USER_TYPING, callback);
    }

    offUserTyping(identity: SocketIdentity, callback?: (data: TypingData) => void): void {
        this.sockets[identity]?.off(SOCKET_EVENTS.USER_TYPING, callback);
    }

    onUserOnline(identity: SocketIdentity, callback: (data: UserStatusData) => void): void {
        this.sockets[identity]?.on(SOCKET_EVENTS.USER_ONLINE, callback);
    }

    onUserOffline(identity: SocketIdentity, callback: (data: UserStatusData) => void): void {
        this.sockets[identity]?.on(SOCKET_EVENTS.USER_OFFLINE, callback);
    }

    offUserOnline(identity: SocketIdentity, callback?: (data: UserStatusData) => void): void {
        this.sockets[identity]?.off(SOCKET_EVENTS.USER_ONLINE, callback);
    }

    offUserOffline(identity: SocketIdentity, callback?: (data: UserStatusData) => void): void {
        this.sockets[identity]?.off(SOCKET_EVENTS.USER_OFFLINE, callback);
    }
}

export const socketService = new MultiSocketService();
