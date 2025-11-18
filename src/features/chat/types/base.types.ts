// Base types for chat feature

export enum ParticipantType {
    USER = 'USER',
    COMPANY = 'COMPANY',
}

export enum MessageStatus {
    SENDING = 'sending', // Temporary status for optimistic updates
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
}

export interface Participant {
    id: string;
    type: ParticipantType;
}

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    type: ParticipantType;
}

