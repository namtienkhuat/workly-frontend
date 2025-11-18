import { MessageStatus, Participant } from './base.types';

export interface ReadBy {
    participantId: string;
    readAt: Date;
}

export interface Message {
    _id: string;
    conversationId: string;
    sender: Participant;
    content: string;
    status: MessageStatus;
    readBy: ReadBy[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SendMessagePayload {
    conversationId: string;
    content: string;
}

export interface GetMessagesParams {
    page?: number;
    limit?: number;
}

