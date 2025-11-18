import { Message } from './message.types';
import { ParticipantType } from './base.types';

export interface SocketAuthData {
    userId: string;
    userType: ParticipantType;
}

export interface NewMessageData {
    message: Message;
    conversationId: string;
}

export interface TypingData {
    conversationId: string;
    userId: string;
    isTyping: boolean;
}

export interface MessageReadData {
    conversationId: string;
    messageId: string;
    userId: string;
    readAt: Date;
}

export interface UserStatusData {
    userId: string;
    userType: ParticipantType;
}

export interface ConversationJoinLeaveData {
    conversationId: string;
    userId: string;
}

