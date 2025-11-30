'use client';

import { useParams, useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

import { ConversationList } from '@/features/chat/components';
import { useCompanyChat } from '@/features/chat/hooks/useCompanyChat';
import { LoadingSpinner } from '@/features/chat/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { ParticipantType } from '@/features/chat/types';

export default function CompanyMessagesPage() {
    const router = useRouter();
    const { id: companyId } = useParams<{ id: string }>();
    const { isLoading } = useAuth();
    const { 
        conversations, 
        currentUserId, 
        isLoadingConversations, 
        isSocketConnected,
        deleteConversation 
    } = useCompanyChat(companyId);
    console.log('conversations11111111', conversations);
    const handleSelectConversation = (conversationId: string) => {
        const conversation = conversations.find((c) => c._id === conversationId);

        if (conversation?.otherParticipant) {
            // Navigate to chat detail page
            router.push(
                `/manage-company/${companyId}/messages/user/${conversation.otherParticipant.id}`
            );
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
        // Company xem profile của User
        if (participantType === ParticipantType.USER) {
            router.push(`/profile/${participantId}`);
        } else if (participantType === ParticipantType.COMPANY) {
            router.push(`/company/${participantId}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <LoadingSpinner size="lg" message="Đang tải..." />
            </div>
        );
    }

    return (
        <Card className="overflow-hidden border-border/50 shadow-lg">
            <CardContent className="p-0">
                <div className="flex h-[600px] bg-gradient-to-br from-background via-background to-muted/20">
                    {/* Conversation List - Left Side */}
                    <ConversationList
                        conversations={conversations}
                        currentUserId={currentUserId}
                        onSelectConversation={handleSelectConversation}
                        onDeleteConversation={handleDeleteConversation}
                        onViewProfile={handleViewProfile}
                        activeConversationId={null}
                        isLoading={isLoadingConversations}
                    />

                    {/* Modern Empty State - Right Side */}
                    <div className="flex flex-1 items-center justify-center relative overflow-hidden">
                        {/* Animated background effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-60" />
                        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
                        
                        <div className="text-center px-6 relative z-10 animate-in fade-in duration-700">
                            <div className="mb-8 flex justify-center">
                                <div className="relative">
                                    {/* Animated glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-2xl animate-pulse" />
                                    
                                    {/* Icon container with gradient border */}
                                    <div className="relative rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 border-2 border-primary/20 shadow-2xl backdrop-blur-sm">
                                        <MessageCircle className="h-20 w-20 text-primary" strokeWidth={1.5} />
                                    </div>
                                </div>
                            </div>
                            
                            <h2 className="mb-3 text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Tin nhắn của công ty
                            </h2>
                            
                            <p className="text-muted-foreground text-base mb-2">
                                {isSocketConnected
                                    ? 'Chọn một cuộc trò chuyện từ danh sách bên trái'
                                    : 'Đang kết nối...'}
                            </p>
                            
                            {conversations.length === 0 && !isLoadingConversations && (
                                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10 backdrop-blur-sm">
                                    <p className="text-sm text-muted-foreground">
                                        Chưa có tin nhắn nào từ ứng viên
                                    </p>
                                </div>
                            )}
                            
                            {/* Status indicator */}
                            {isSocketConnected && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-muted-foreground">Đã kết nối</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
