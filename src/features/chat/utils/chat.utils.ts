import { Conversation, UserInfo, ParticipantType, Participant } from '../types';
import { UserProfile, CompanyProfile, ParticipantProfile } from '../services/api/user.api';

/**
 * Convert UserProfile or CompanyProfile to UserInfo
 */
export function convertParticipantProfileToUserInfo(
    profile: ParticipantProfile,
    participantType: ParticipantType,
    isOnline: boolean = false
): UserInfo {
    if (participantType === ParticipantType.USER) {
        const userProfile = profile as UserProfile;
        return {
            id: userProfile.userId,
            type: ParticipantType.USER,
            name:
                userProfile.name ||
                `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() ||
                'Người dùng',
            email: userProfile.email,
            avatar: userProfile.avatar,
            isOnline,
        };
    } else {
        const companyProfile = profile as CompanyProfile;
        return {
            id: companyProfile.companyId,
            type: ParticipantType.COMPANY,
            name: companyProfile.name || 'Công ty',
            email: companyProfile.email || '',
            avatar: companyProfile.logo,
            isOnline,
        };
    }
}

/**
 * Get the other participant in a conversation
 * @deprecated Use chatStore's logic to fetch actual user info
 */
export function getOtherParticipant(
    conversation: Conversation,
    currentUserId: string
): Participant | null {
    const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId);
    return otherParticipant || null;
}

/**
 * Calculate chat window position
 */
export function calculateWindowPosition(
    index: number,
    windowWidth: number,
    spacing: number,
    rightOffset: number
) {
    return rightOffset + index * (windowWidth + spacing);
}

/**
 * Calculate popup position
 */
export function calculatePopupPosition(index: number, popupSpacing: number, rightOffset: number) {
    return rightOffset + index * popupSpacing;
}

/**
 * Format unread count for display
 */
export function formatUnreadCount(count: number): string {
    if (count === 0) return '';
    if (count > 9) return '9+';
    return count.toString();
}

/**
 * Check if user is current user
 */
export function isCurrentUser(userId: string, currentUserId: string | null): boolean {
    return userId === currentUserId;
}

/**
 * Sort messages by creation time (oldest first)
 */
export function sortMessagesByTime<T extends { createdAt: Date }>(messages: T[]): T[] {
    return [...messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

/**
 * Generate temporary message ID
 */
export function generateTempMessageId(): string {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if message ID is temporary
 */
export function isTempMessageId(messageId: string): boolean {
    return messageId.startsWith('temp-');
}

/**
 * Get user initials from name
 */
export function getUserInitials(name: string): string {
    const parts = name
        .trim()
        .split(' ')
        .filter((p) => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0]?.charAt(0).toUpperCase() || '?';
    return (
        ((parts[0]?.charAt(0) || '') + (parts[parts.length - 1]?.charAt(0) || '')).toUpperCase() ||
        '?'
    );
}

/**
 * Format message timestamp
 */
export function formatMessageTime(date: Date): string {
    return new Date(date).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format last message time for conversation list
 */
export function formatConversationTime(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
        return formatMessageTime(messageDate);
    } else if (diffInDays === 1) {
        return 'Hôm qua';
    } else if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
    } else {
        return messageDate.toLocaleDateString('vi-VN');
    }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}
