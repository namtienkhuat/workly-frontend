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
import { TOKEN_KEY } from '@/constants';

export default function ChatUserPage() {
    const params = useParams();
    const router = useRouter();

    const userId = params.userId as string;

    const { isLoading: isLoadingAuth, user } = useAuth();

    const {
        fullChatId,
        startConversation,
        setFullChat,
        conversations,
        isLoadingConversations,
        currentUserId,
        isSocketConnected,
        initialize,
        loadConversations,
        deleteConversation,
    } = useChat();

    const [isLoading, setIsLoading] = useState(false);

    // Initialize socket and load conversations
    useEffect(() => {
        if (!user?.userId) return;

        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            console.error('No token found');
            return;
        }

        // Initialize socket connection
        initialize(user.userId, ParticipantType.USER, token);

        // Load conversations
        loadConversations();
    }, [user?.userId, initialize, loadConversations]);

    // Create or get conversation with user
    useEffect(() => {
        if (!userId || !isSocketConnected) return;

        const handleStartConversation = async () => {
            try {
                const { data } = await getUserById(userId);
                if (!data) {
                    toast.error('Không tìm thấy người dùng.');
                    return;
                }

                setIsLoading(true);
                await startConversation(userId, ParticipantType.USER, true);
            } catch (err: any) {
                console.error('Error starting conversation:', err);
                toast.error(err.message || 'Không thể tạo cuộc trò chuyện.');
            } finally {
                setIsLoading(false);
            }
        };

        handleStartConversation();
    }, [userId, isSocketConnected]);

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
            // If deleted conversation is the current one, go back to chat list
            if (conversationId === fullChatId) {
                router.push('/chat');
            }
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

    const handleClose = () => {
        setFullChat(null);
        router.push('/chat');
    };

    if (isLoadingAuth) {
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
                activeConversationId={fullChatId}
                isLoading={isLoadingConversations}
            />

            <div className="flex-1">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <LoadingSpinner size="lg" message="Đang tải cuộc trò chuyện..." />
                    </div>
                ) : fullChatId ? (
                    <ChatView conversationId={fullChatId} onClose={handleClose} />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center px-6">
                            <h2 className="mb-2 text-2xl font-semibold">
                                Không thể tải cuộc trò chuyện
                            </h2>
                            <p className="text-muted-foreground">Vui lòng thử lại sau.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
