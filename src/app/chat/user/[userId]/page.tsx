'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ChatView, ConversationList } from '@/features/chat/components';
import { useChat } from '@/features/chat/hooks/useChat';
import { ParticipantType } from '@/features/chat/types';
import { LoadingSpinner } from '@/features/chat/components/ui';
import { getUserById } from '@/features/chat';
import { useAuth } from '@/hooks/useAuth';

export default function ChatUserPage() {
    const params = useParams();
    const router = useRouter();

    const userId = params.userId as string;

    const { isLoading: isLoadingAuth } = useAuth();

    const {
        fullChatId,
        startConversation,
        setFullChat,
        conversations,
        isLoadingConversations,
        currentUserId,
        isSocketConnected,
    } = useChat();

    const [isLoading, setIsLoading] = useState(false);

    const handleCallAPI = async () => {
        if (!userId) return;

        if (!isSocketConnected) return;
        const { data } = await getUserById(userId);
        if (!data) return;
        setIsLoading(true);

        startConversation(userId, ParticipantType.USER, true)
            .catch((err) => {
                toast.error(err.message || 'Không thể tạo cuộc trò chuyện.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        handleCallAPI();
    }, [userId, isSocketConnected, startConversation]);

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

    const handleClose = () => {
        setFullChat(null);
        router.push('/chat');
    };

    if (isLoadingAuth) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" message="Đang tải..." />
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <ConversationList
                conversations={conversations}
                currentUserId={currentUserId}
                onSelectConversation={handleSelectConversation}
                activeConversationId={fullChatId}
                isLoading={isLoadingConversations}
            />

            <div className="flex-1">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center bg-gray-50">
                        <LoadingSpinner size="lg" message="Đang tải cuộc trò chuyện..." />
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
    );
}
