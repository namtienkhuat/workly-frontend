'use client';

import { UserAvatar } from '../ui';
import { ConversationWithUserInfo } from '../../types';
import { formatConversationTime, formatUnreadCount } from '../../utils';
import { getUserById } from '@/features/chat/services';
import { useChatStore } from '@/features/chat/store';

interface ConversationItemProps {
    conversation: ConversationWithUserInfo;
    currentUserId: string | null;
    onClick: (conversationId: string) => void;
    isActive?: boolean;
}

export function ConversationItem({
    conversation,
    currentUserId,
    onClick,
    isActive = false,
}: ConversationItemProps) {
    const { otherParticipant, lastMessage, lastMessageAt, unreadCount } = conversation;
    const myUnreadCount = currentUserId ? unreadCount[currentUserId] || 0 : 0;
    const userInfoCache = useChatStore((state) => state.userInfoCache);
    if (!otherParticipant) return null;

    const otherUserInfo = userInfoCache[otherParticipant.id];

    return (
        <button
            onClick={() => onClick(conversation._id)}
            className={`flex w-full items-center gap-3 border-b p-4 transition-colors ${
                isActive ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
            }`}
        >
            {/* Avatar */}
            <UserAvatar
                avatar={otherUserInfo?.avatar || ''}
                name={otherUserInfo?.name || ''}
                size="lg"
                showOnlineIndicator
                isOnline={otherParticipant.isOnline}
            />

            {/* Info */}
            <div className="flex-1 overflow-hidden text-left">
                <div className="flex items-center justify-between">
                    <h3
                        className={`truncate font-medium ${
                            myUnreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-900'
                        }`}
                    >
                        {otherParticipant.name}
                    </h3>
                    {lastMessageAt && (
                        <span className="ml-2 text-xs text-gray-500">
                            {formatConversationTime(lastMessageAt)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <p
                        className={`truncate text-sm ${
                            myUnreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                        }`}
                    >
                        {lastMessage?.content || 'Chưa có tin nhắn'}
                    </p>

                    {myUnreadCount > 0 && (
                        <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-bold text-white">
                            {formatUnreadCount(myUnreadCount)}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
