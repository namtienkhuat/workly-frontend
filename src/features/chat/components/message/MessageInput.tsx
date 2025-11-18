'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
    };

    const handleSend = () => {
        if (!messageInput.trim()) return;

        onSend(messageInput);
        setMessageInput('');
    };

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
            <Button onClick={handleSend} disabled={!messageInput.trim() || disabled} className="px-4">
                <Send className="h-4 w-4" />
            </Button>
        </div>
    );
}
