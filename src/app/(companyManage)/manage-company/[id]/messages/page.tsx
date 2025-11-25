'use client';

import { useParams, useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

import { ConversationList } from '@/features/chat/components';
import { CompanyChatInitializer } from '@/features/chat/components/CompanyChatInitializer';
import { useCompanyChat } from '@/features/chat/hooks/useCompanyChat';
import { LoadingSpinner } from '@/features/chat/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function CompanyMessagesPage() {
    const router = useRouter();
    const { id: companyId } = useParams<{ id: string }>();
    const { isLoading } = useAuth();
    const { conversations, currentUserId, isLoadingConversations, isSocketConnected } =
        useCompanyChat(companyId);
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

    if (status === 'loading') {
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
                            activeConversationId={null}
                            isLoading={isLoadingConversations}
                        />

                        {/* Empty State - Right Side */}
                        <div className="flex flex-1 items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="rounded-full bg-blue-100 p-6">
                                        <MessageCircle className="h-16 w-16 text-blue-500" />
                                    </div>
                                </div>
                                <h2 className="mb-2 text-2xl font-semibold text-gray-700">
                                    Tin nhắn của công ty
                                </h2>
                                <p className="text-gray-500">
                                    {isSocketConnected
                                        ? 'Chọn một cuộc trò chuyện từ danh sách bên trái'
                                        : 'Đang kết nối...'}
                                </p>
                                {conversations.length === 0 && !isLoadingConversations && (
                                    <p className="mt-2 text-sm text-gray-400">
                                        Chưa có tin nhắn nào từ ứng viên
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
