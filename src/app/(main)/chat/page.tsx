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
        <div className="flex h-full bg-gradient-to-br from-background via-background to-muted/20">
            <ConversationList
                conversations={conversations}
                currentUserId={currentUserId}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                onViewProfile={handleViewProfile}
                activeConversationId={null}
                isLoading={isLoadingConversations}
            />

            {/* Modern Empty State */}
            <div className="flex flex-1 items-center justify-center relative overflow-hidden">
                {/* Animated background gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
                
                <div className="text-center px-6 relative z-10 animate-in fade-in duration-700">
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-2xl animate-pulse" />
                            
                            {/* Icon container with gradient */}
                            <div className="relative rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-background p-10 border-2 border-primary/20 shadow-2xl">
                                <MessageCircle className="h-24 w-24 text-primary" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                    
                    <h2 className="mb-4 text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Tin nhắn của bạn
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto text-base leading-relaxed">
                        Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin hoặc tạo cuộc trò chuyện mới
                    </p>
                    
                    {/* Decorative dots */}
                    <div className="flex justify-center gap-2 mt-8">
                        <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce delay-100" />
                        <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce delay-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}
