'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ChatView, ConversationList } from '@/features/chat/components';
import { CompanyChatInitializer } from '@/features/chat/components/CompanyChatInitializer';
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
        <>
            {/* Initialize chat with company identity */}
            <CompanyChatInitializer companyId={companyId} />

            <Card>
                <CardContent className="p-0">
                    <div className="flex h-[600px]">
                        {/* Conversation List - Left Side */}
                        <ConversationList
                            conversations={conversations}
                            currentUserId={currentUserId}
                            onSelectConversation={handleSelectConversation}
                            activeConversationId={fullChatId}
                            isLoading={isLoadingConversations}
                        />

                        {/* Chat View - Right Side */}
                        <div className="flex-1">
                            {isLoading ? (
                                <div className="flex h-full items-center justify-center bg-gray-50">
                                    <LoadingSpinner
                                        size="lg"
                                        message="Đang tải cuộc trò chuyện..."
                                    />
                                </div>
                            ) : fullChatId ? (
                                <ChatView conversationId={fullChatId} onClose={handleClose} />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-gray-50">
                                    <div className="text-center">
                                        <h2 className="mb-2 text-2xl font-semibold text-gray-700">
                                            Không thể tải cuộc trò chuyện
                                        </h2>
                                        <p className="text-gray-500">Vui lòng thử lại sau.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
