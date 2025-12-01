'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ChatView, ConversationList } from '@/features/chat/components';
import { useCompanyChat } from '@/features/chat/hooks/useCompanyChat';
import { ParticipantType } from '@/features/chat/types';
import { LoadingSpinner } from '@/features/chat/components/ui';
import { userApiService } from '@/features/chat/services';
import { Card, CardContent } from '@/components/ui/card';

export default function CompanyUserChatPage() {
    const router = useRouter();
    const { id: companyId, userId } = useParams<{ id: string; userId: string }>();
    const { isLoading: isAuthLoading } = useAuth();

    const {
        fullChatId,
        startConversation,
        setFullChat,
        conversations,
        isLoadingConversations,
        currentUserId,
        isSocketConnected,
    } = useCompanyChat(companyId);

    const [isLoading, setIsLoading] = useState(false);

    const handleCallAPI = async () => {
        if (!userId || !companyId) return;
        if (!isSocketConnected) return;

        try {
            // Verify user exists
            const { data } = await userApiService.getUserById(userId);
            if (!data) {
                toast.error('Không tìm thấy người dùng');
                router.push(`/manage-company/${companyId}/messages`);
                return;
            }

            setIsLoading(true);

            // Start conversation with user (from company perspective)
            await startConversation(userId, ParticipantType.USER, true);
        } catch (err: any) {
            console.error('Error starting conversation:', err);
            toast.error(err.message || 'Không thể tạo cuộc trò chuyện.');
        } finally {
            setIsLoading(false);
        }
    };

    // Open conversation for the specific userId (when socket is ready)
    useEffect(() => {
        handleCallAPI();
    }, [userId, companyId, isSocketConnected]);

    const handleSelectConversation = (conversationId: string) => {
        const conversation = conversations.find((c) => c._id === conversationId);

        if (conversation?.otherParticipant) {
            // Navigate based on participant type
            if (conversation.otherParticipant.type === ParticipantType.COMPANY) {
                router.push(`/chat/company/${conversation.otherParticipant.id}`);
            } else {
                router.push(
                    `/manage-company/${companyId}/messages/user/${conversation.otherParticipant.id}`
                );
            }
        }
    };

    const handleClose = () => {
        setFullChat(null);
        router.push(`/manage-company/${companyId}/messages`);
    };

    if (isAuthLoading) {
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
                        activeConversationId={fullChatId}
                        isLoading={isLoadingConversations}
                    />

                    {/* Chat View - Right Side */}
                    <div className="flex-1 relative">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <LoadingSpinner
                                    size="lg"
                                    message="Đang tải cuộc trò chuyện..."
                                />
                            </div>
                        ) : fullChatId ? (
                            <ChatView conversationId={fullChatId} onClose={handleClose} />
                        ) : (
                            <div className="flex h-full items-center justify-center relative overflow-hidden">
                                {/* Animated background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5 opacity-50" />
                                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-destructive/10 rounded-full blur-3xl" />
                                
                                <div className="text-center px-6 relative z-10 animate-in fade-in duration-500">
                                    <div className="mb-6 flex justify-center">
                                        <div className="rounded-full bg-destructive/10 p-6 border-2 border-destructive/20">
                                            <svg className="w-16 h-16 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h2 className="mb-2 text-2xl font-bold text-foreground/90">
                                        Không thể tải cuộc trò chuyện
                                    </h2>
                                    <p className="text-muted-foreground">Vui lòng thử lại sau.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
