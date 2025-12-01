'use client';

import { useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ConversationItem } from './ConversationItem';
import { ConversationWithUserInfo, ParticipantType } from '../../types';
import { EmptyState, LoadingSpinner } from '../ui';

interface ConversationListProps {
    conversations: ConversationWithUserInfo[];
    currentUserId: string | null;
    onSelectConversation: (conversationId: string) => void;
    onDeleteConversation: (conversationId: string) => void;
    onViewProfile: (participantId: string, participantType: ParticipantType) => void;
    activeConversationId?: string | null;
    isLoading?: boolean;
}

export function ConversationList({
    conversations,
    currentUserId,
    onSelectConversation,
    onDeleteConversation,
    onViewProfile,
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
        <div className="flex h-full w-80 flex-col border-r bg-gradient-to-b from-background to-muted/20">
            {/* Header with Gradient */}
            <div className="relative border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
                <div className="relative">
                    <div className="mb-3 flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Tin nhắn
                        </h2>
                    </div>

                    {/* Modern Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm cuộc trò chuyện..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 bg-background/80 backdrop-blur-sm border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 hover:border-primary/30 transition-all duration-200 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Conversations List with Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner message="Đang tải..." />
                    </div>
                ) : sortedConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                        <EmptyState
                            message={
                                searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có cuộc trò chuyện nào'
                            }
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {sortedConversations.map((conversation) => (
                            <ConversationItem
                                key={conversation._id}
                                conversation={conversation}
                                currentUserId={currentUserId}
                                onClick={onSelectConversation}
                                onDelete={onDeleteConversation}
                                onViewProfile={onViewProfile}
                                isActive={conversation._id === activeConversationId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
