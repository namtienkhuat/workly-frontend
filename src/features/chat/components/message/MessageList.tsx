'use client';

import { useRef, useEffect } from 'react';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from '../ui';
import { Message } from '../../types';
import { LoadingSpinner, EmptyState } from '../ui';

interface MessageListProps {
    messages: Message[];
    currentUserId: string | null;
    isLoading?: boolean;
    isTyping?: boolean;
    emptyMessage?: string;
}

export function MessageList({
    messages,
    currentUserId,
    isLoading = false,
    isTyping = false,
    emptyMessage = 'Chưa có tin nhắn',
}: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom when new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (isLoading) {
        return <LoadingSpinner message="Đang tải tin nhắn..." />;
    }

    if (messages.length === 0) {
        return <EmptyState message={emptyMessage} />;
    }

    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <MessageItem key={message._id} message={message} currentUserId={currentUserId} />
            ))}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
        </div>
    );
}

