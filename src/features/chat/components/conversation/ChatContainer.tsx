'use client';

import { useEffect, useState, useRef } from 'react';
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
    const startTyping = useChatStore((state) => state.startTyping);
    const stopTyping = useChatStore((state) => state.stopTyping);
    const isTyping = useChatStore((state) => state.isTyping(conversationId));
    
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [shouldAutoFocus, setShouldAutoFocus] = useState(true);
    const prevMessagesLengthRef = useRef(messages.length);
    const prevConversationIdRef = useRef(conversationId);

    useEffect(() => {
        if (prevConversationIdRef.current !== conversationId) {
            setShouldAutoFocus(true);
            prevConversationIdRef.current = conversationId;
        }
    }, [conversationId]);

    useEffect(() => {
        if (isInputFocused) {
            markAsRead();
        }
    }, [isInputFocused, markAsRead]);

    useEffect(() => {
        if (messages.length > prevMessagesLengthRef.current && isInputFocused) {
            markAsRead();
        }
        prevMessagesLengthRef.current = messages.length;
    }, [messages.length, isInputFocused, markAsRead]);

    if (!otherParticipant) {
        return (
            <div className={`flex flex-col ${className}`}>
                <ConversationHeader onClose={onClose} onMinimize={onMinimize} showMinimize={showMinimize} />
                <div className="flex-1">
                    <EmptyState message="Conversation not found" />
                </div>
            </div>
        );
    }

    const isDeleted = otherParticipant?.isDeleted || false;

    return (
        <div className={`flex flex-col ${className}`}>
            {/* Header */}
            <ConversationHeader
                user={otherParticipant}
                onClose={onClose}
                onMinimize={onMinimize}
                showMinimize={showMinimize}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
                <MessageList
                    messages={messages}
                    currentUserId={currentUserId}
                    isLoading={isLoading}
                    isTyping={isTyping}
                    emptyMessage={`Start a conversation with ${otherParticipant.name}`}
                />
            </div>

            {/* Input */}
            <div className="border-t p-4">
                {isDeleted ? (
                    <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg border border-muted">
                        <span className="text-sm text-muted-foreground italic">
                            Cannot send message. This {otherParticipant.type === 'COMPANY' ? 'company' : 'account'} no longer exists.
                        </span>
                    </div>
                ) : (
                    <MessageInput 
                        onSend={send}
                        onTypingStart={() => startTyping(conversationId)}
                        onTypingStop={() => stopTyping(conversationId)}
                        onFocus={() => {
                            setIsInputFocused(true);
                            setShouldAutoFocus(false);
                        }}
                        onBlur={() => setIsInputFocused(false)}
                        autoFocus={shouldAutoFocus}
                    />
                )}
            </div>
        </div>
    );
}
