'use client';

import { ChatContainer } from './conversation';

interface ChatViewProps {
    conversationId: string;
    onClose?: () => void;
}

/**
 * Full page chat view
 */
export function ChatView({ conversationId, onClose }: ChatViewProps) {
    return (
        <div className="flex h-full flex-col">
            <ChatContainer
                conversationId={conversationId}
                onClose={onClose}
                className="h-full"
            />
        </div>
    );
}

