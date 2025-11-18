'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ConversationItem } from './ConversationItem';
import { ConversationWithUserInfo } from '../../types';
import { EmptyState, LoadingSpinner } from '../ui';

interface ConversationListProps {
    conversations: ConversationWithUserInfo[];
    currentUserId: string | null;
    onSelectConversation: (conversationId: string) => void;
    activeConversationId?: string | null;
    isLoading?: boolean;
}

export function ConversationList({
    conversations,
    currentUserId,
    onSelectConversation,
    activeConversationId = null,
    isLoading = false,
}: ConversationListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter((conv) => {
        if (!conv.otherParticipant) return false;
        const searchLower = searchQuery.toLowerCase();
        return (
            conv.otherParticipant.name.toLowerCase().includes(searchLower) ||
            conv.otherParticipant.email.toLowerCase().includes(searchLower) ||
            conv.lastMessage?.content.toLowerCase().includes(searchLower)
        );
    });

    // Sort by lastMessageAt (newest first)
    const sortedConversations = [...filteredConversations].sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
    });

    return (
        <div className="flex h-full w-80 flex-col border-l bg-white">
            {/* Header */}
            <div className="border-b p-4">
                <h2 className="mb-3 text-xl font-semibold text-gray-900">Tin nhắn</h2>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <LoadingSpinner message="Đang tải cuộc trò chuyện..." />
                ) : sortedConversations.length === 0 ? (
                    <EmptyState
                        message={
                            searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có cuộc trò chuyện nào'
                        }
                    />
                ) : (
                    sortedConversations.map((conversation) => (
                        <ConversationItem
                            key={conversation._id}
                            conversation={conversation}
                            currentUserId={currentUserId}
                            onClick={onSelectConversation}
                            isActive={conversation._id === activeConversationId}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
