import { Participant, ParticipantType, UserInfo } from './base.types';
import { Message } from './message.types';

export interface Conversation {
    _id: string;
    participants: Participant[];
    lastMessage?: Message;
    lastMessageAt?: Date;
    unreadCount: Record<string, number>;
    deletedParticipants?: Record<string, string>; // participantId -> deletedAt timestamp (ISO string)
    createdAt: Date;
    updatedAt: Date;
}

export interface ConversationWithUserInfo extends Conversation {
    otherParticipant?: UserInfo;
}

export interface CreateConversationPayload {
    participantId: string;
    participantType: ParticipantType;
}

export interface GetConversationsParams {
    page?: number;
    limit?: number;
}

