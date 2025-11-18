import { io, Socket } from 'socket.io-client';
import { CHAT_CONSTANTS, SOCKET_EVENTS } from '../../constants/chat.constants';
import {
    NewMessageData,
    TypingData,
    MessageReadData,
    UserStatusData,
    ConversationJoinLeaveData,
} from '../../types';

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;

    /**
     * Connect to socket server
     */
    connect(token: string): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(CHAT_CONSTANTS.SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: CHAT_CONSTANTS.RECONNECT_DELAY,
            reconnectionDelayMax: CHAT_CONSTANTS.RECONNECT_DELAY_MAX,
            reconnectionAttempts: CHAT_CONSTANTS.MAX_RECONNECT_ATTEMPTS,
        });

        this.setupConnectionHandlers();
        return this.socket;
    }

    /**
     * Setup connection event handlers
     */
    private setupConnectionHandlers(): void {
        if (!this.socket) return;

        this.socket.on(SOCKET_EVENTS.CONNECT, () => {
            console.log('Socket connected:', this.socket?.id);
            this.reconnectAttempts = 0;
        });

        this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
            console.error('Socket connection error:', error);
            this.reconnectAttempts++;
        });

        this.socket.on(SOCKET_EVENTS.ERROR, (error) => {
            console.error('Socket error:', error);
        });
    }

    /**
     * Disconnect from socket server
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Get socket instance
     */
    getSocket(): Socket | null {
        return this.socket;
    }

    // ==================== CONVERSATION EVENTS ====================

    /**
     * Join a conversation room
     */
    joinConversation(conversationId: string): void {
        this.socket?.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId });
    }

    /**
     * Leave a conversation room
     */
    leaveConversation(conversationId: string): void {
        this.socket?.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationId });
    }

    /**
     * Listen for user joined conversation
     */
    onUserJoinedConversation(callback: (data: ConversationJoinLeaveData) => void): void {
        this.socket?.on(SOCKET_EVENTS.USER_JOINED_CONVERSATION, callback);
    }

    /**
     * Listen for user left conversation
     */
    onUserLeftConversation(callback: (data: ConversationJoinLeaveData) => void): void {
        this.socket?.on(SOCKET_EVENTS.USER_LEFT_CONVERSATION, callback);
    }

    /**
     * Remove user joined conversation listener
     */
    offUserJoinedConversation(callback?: (data: ConversationJoinLeaveData) => void): void {
        this.socket?.off(SOCKET_EVENTS.USER_JOINED_CONVERSATION, callback);
    }

    /**
     * Remove user left conversation listener
     */
    offUserLeftConversation(callback?: (data: ConversationJoinLeaveData) => void): void {
        this.socket?.off(SOCKET_EVENTS.USER_LEFT_CONVERSATION, callback);
    }

    // ==================== MESSAGE EVENTS ====================

    /**
     * Send a message
     */
    sendMessage(conversationId: string, content: string): void {
        this.socket?.emit(SOCKET_EVENTS.SEND_MESSAGE, { conversationId, content });
    }

    /**
     * Listen for new messages
     */
    onNewMessage(callback: (data: NewMessageData) => void): void {
        this.socket?.on(SOCKET_EVENTS.NEW_MESSAGE, callback);
    }

    /**
     * Remove new message listener
     */
    offNewMessage(callback?: (data: NewMessageData) => void): void {
        this.socket?.off(SOCKET_EVENTS.NEW_MESSAGE, callback);
    }

    /**
     * Mark message as read
     */
    markMessageRead(conversationId: string, messageId: string): void {
        this.socket?.emit(SOCKET_EVENTS.MARK_MESSAGE_READ, { conversationId, messageId });
    }

    /**
     * Listen for message read events
     */
    onMessageRead(callback: (data: MessageReadData) => void): void {
        this.socket?.on(SOCKET_EVENTS.MESSAGE_READ, callback);
    }

    /**
     * Remove message read listener
     */
    offMessageRead(callback?: (data: MessageReadData) => void): void {
        this.socket?.off(SOCKET_EVENTS.MESSAGE_READ, callback);
    }

    // ==================== TYPING EVENTS ====================

    /**
     * Start typing indicator
     */
    startTyping(conversationId: string): void {
        this.socket?.emit(SOCKET_EVENTS.TYPING, { conversationId });
    }

    /**
     * Stop typing indicator
     */
    stopTyping(conversationId: string): void {
        this.socket?.emit(SOCKET_EVENTS.STOP_TYPING, { conversationId });
    }

    /**
     * Listen for user typing
     */
    onUserTyping(callback: (data: TypingData) => void): void {
        this.socket?.on(SOCKET_EVENTS.USER_TYPING, callback);
    }

    /**
     * Remove user typing listener
     */
    offUserTyping(callback?: (data: TypingData) => void): void {
        this.socket?.off(SOCKET_EVENTS.USER_TYPING, callback);
    }

    // ==================== USER STATUS EVENTS ====================

    /**
     * Listen for user online status
     */
    onUserOnline(callback: (data: UserStatusData) => void): void {
        this.socket?.on(SOCKET_EVENTS.USER_ONLINE, callback);
    }

    /**
     * Listen for user offline status
     */
    onUserOffline(callback: (data: UserStatusData) => void): void {
        this.socket?.on(SOCKET_EVENTS.USER_OFFLINE, callback);
    }

    /**
     * Remove user online listener
     */
    offUserOnline(callback?: (data: UserStatusData) => void): void {
        this.socket?.off(SOCKET_EVENTS.USER_ONLINE, callback);
    }

    /**
     * Remove user offline listener
     */
    offUserOffline(callback?: (data: UserStatusData) => void): void {
        this.socket?.off(SOCKET_EVENTS.USER_OFFLINE, callback);
    }
}

// Export singleton instance
export const socketService = new SocketService();

