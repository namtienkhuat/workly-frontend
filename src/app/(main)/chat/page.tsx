'use client';

import { useRouter } from 'next/navigation';
import { ConversationList } from '@/features/chat/components';
import { useChat } from '@/features/chat/hooks/useChat';
import { LoadingSpinner } from '@/features/chat/components/ui';
import { ParticipantType } from '@/features/chat/types';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ChatPage() {
    const router = useRouter();
    const { isLoading } = useAuth();

    const { 
        conversations, 
        isLoadingConversations, 
        currentUserId, 
        deleteConversation 
    } = useChat();
    console.log('Conversations:', conversations);

    const handleSelectConversation = (conversationId: string) => {
        const conversation = conversations.find((c) => c._id === conversationId);

        if (conversation?.otherParticipant) {
            if (conversation.otherParticipant.type === ParticipantType.COMPANY) {
                router.push(`/chat/company/${conversation.otherParticipant.id}`);
            } else {
                router.push(`/chat/user/${conversation.otherParticipant.id}`);
            }
        }
    };

    const handleDeleteConversation = async (conversationId: string) => {
        try {
            await deleteConversation(conversationId);
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const handleViewProfile = (participantId: string, participantType: ParticipantType) => {
        if (participantType === ParticipantType.COMPANY) {
            router.push(`/company/${participantId}`);
        } else {
            router.push(`/profile/${participantId}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <LoadingSpinner size="lg" message="Đang tải..." />
            </div>
        );
    }

    return (
        <div className="flex h-full">
            <ConversationList
                conversations={conversations}
                currentUserId={currentUserId}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                onViewProfile={handleViewProfile}
                activeConversationId={null}
                isLoading={isLoadingConversations}
            />

            <div className="flex flex-1 items-center justify-center">
                <div className="text-center px-6">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-primary/10 p-8">
                            <MessageCircle className="h-20 w-20 text-primary" />
                        </div>
                    </div>
                    <h2 className="mb-3 text-2xl font-semibold">Tin nhắn của bạn</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin hoặc tạo cuộc trò chuyện mới
                    </p>
                </div>
            </div>
        </div>
    );
}
