'use client';

import { Clock } from 'lucide-react';
import { Message, MessageStatus } from '../../types';
import { formatMessageTime, isOwnMessage as checkIsOwnMessage } from '../../utils';

interface MessageItemProps {
    message: Message;
    currentUserId: string | null;
}

export function MessageItem({ message, currentUserId }: MessageItemProps) {
    const isOwnMessage = checkIsOwnMessage(message, currentUserId);

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                }`}
            >
                <p className="break-words">{message.content}</p>
                <div className="mt-1 flex items-center gap-2">
                    <span
                        className={`block text-xs ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}
                    >
                        {formatMessageTime(message.createdAt)}
                    </span>
                    {isOwnMessage && (
                        <>
                            {message.status === MessageStatus.SENDING && (
                                <Clock className="h-3 w-3 animate-pulse text-blue-100" />
                            )}
                            {message.status === MessageStatus.SENT && (
                                <span className="text-xs text-blue-100">✓</span>
                            )}
                            {message.status === MessageStatus.READ && message.readBy.length > 0 && (
                                <span className="text-xs text-blue-100">✓✓</span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

