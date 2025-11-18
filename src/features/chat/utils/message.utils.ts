import { Message, MessageStatus } from '../types';

/**
 * Check if message is from current user
 */
export function isOwnMessage(message: Message, currentUserId: string | null): boolean {
    return message.sender.id === currentUserId;
}

/**
 * Check if message is read
 */
export function isMessageRead(message: Message): boolean {
    return message.status === MessageStatus.READ && message.readBy.length > 0;
}

/**
 * Check if message is sending
 */
export function isMessageSending(message: Message): boolean {
    return message.status === MessageStatus.SENDING;
}

/**
 * Check if message is sent
 */
export function isMessageSent(message: Message): boolean {
    return message.status === MessageStatus.SENT;
}

/**
 * Filter out temporary messages
 */
export function filterTempMessages(messages: Message[]): Message[] {
    return messages.filter(msg => !msg._id.startsWith('temp-') || msg.status !== MessageStatus.SENDING);
}

/**
 * Merge messages and remove duplicates
 */
export function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
    const messageMap = new Map<string, Message>();
    
    // Add existing messages
    existing.forEach(msg => {
        messageMap.set(msg._id, msg);
    });
    
    // Add/override with incoming messages
    incoming.forEach(msg => {
        messageMap.set(msg._id, msg);
    });
    
    // Convert back to array and sort
    return Array.from(messageMap.values()).sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

/**
 * Get last message preview text
 */
export function getLastMessagePreview(message: Message | undefined, maxLength: number = 50): string {
    if (!message) return 'Chưa có tin nhắn';
    
    const content = message.content.trim();
    if (content.length <= maxLength) return content;
    
    return content.slice(0, maxLength) + '...';
}

