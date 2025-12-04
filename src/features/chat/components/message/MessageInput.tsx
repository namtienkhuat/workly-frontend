'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
    onSend: (content: string) => void;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
    placeholder?: string;
    disabled?: boolean;
}

export function MessageInput({
    onSend,
    onTypingStart,
    onTypingStop,
    placeholder = 'Nhập tin nhắn...',
    disabled = false,
}: MessageInputProps) {
    const [messageInput, setMessageInput] = useState('');
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessageInput(value);

        // Typing indicator logic
        if (value.length > 0 && !isTypingRef.current) {
            isTypingRef.current = true;
            onTypingStart?.();
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                onTypingStop?.();
            }
        }, 2000);
    };

    const handleSend = () => {
        if (!messageInput.trim()) return;

        // Stop typing when sending
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (isTypingRef.current) {
            isTypingRef.current = false;
            onTypingStop?.();
        }

        onSend(messageInput);
        setMessageInput('');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (isTypingRef.current) {
                onTypingStop?.();
            }
        };
    }, [onTypingStop]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex gap-2">
            <Input
                type="text"
                placeholder={placeholder}
                value={messageInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={disabled}
                className="flex-1"
            />
            <Button
                onClick={handleSend}
                disabled={!messageInput.trim() || disabled}
                className="px-4"
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
}
