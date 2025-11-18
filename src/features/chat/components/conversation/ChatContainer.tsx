'use client';

import { useEffect } from 'react';
import { ConversationHeader } from './ConversationHeader';
import { MessageList, MessageInput } from '../message';
import { useConversation, useMessages } from '../../hooks';
import { EmptyState } from '../ui';
import { useChatStore } from '../../store';

interface ChatContainerProps {
    conversationId: string;
    onClose?: () => void;
    onMinimize?: () => void;
    showMinimize?: boolean;
    className?: string;
}

export function ChatContainer({
    conversationId,
    onClose,
    onMinimize,
    showMinimize = false,
    className = '',
}: ChatContainerProps) {
    const { otherParticipant } = useConversation(conversationId);
    const { messages, isLoading, send, markAsRead } = useMessages(conversationId);
    const currentUserId = useChatStore((state) => state.currentUserId);

    // Mark messages as read when viewing
    useEffect(() => {
        markAsRead();
    }, [markAsRead]);

    if (!otherParticipant) {
        return (
            <div className={`flex flex-col bg-white ${className}`}>
                <ConversationHeader onClose={onClose} onMinimize={onMinimize} showMinimize={showMinimize} />
                <div className="flex-1">
                    <EmptyState message="Không tìm thấy cuộc trò chuyện" />
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col bg-white ${className}`}>
            {/* Header */}
            <ConversationHeader
                user={otherParticipant}
                onClose={onClose}
                onMinimize={onMinimize}
                showMinimize={showMinimize}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                <MessageList
                    messages={messages}
                    currentUserId={currentUserId}
                    isLoading={isLoading}
                    isTyping={false}
                    emptyMessage={`Bắt đầu cuộc trò chuyện với ${otherParticipant.name}`}
                />
            </div>

            {/* Input */}
            <div className="border-t p-4">
                <MessageInput onSend={send} />
            </div>
        </div>
    );
}
