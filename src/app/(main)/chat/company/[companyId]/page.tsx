'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ChatView, ConversationList } from '@/features/chat/components';
import { useChat } from '@/features/chat/hooks/useChat';
import { ParticipantType } from '@/features/chat/types';
import { LoadingSpinner } from '@/features/chat/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { TOKEN_KEY } from '@/constants';

export default function ChatCompanyPage() {
    const params = useParams();
    const router = useRouter();

    const companyId = params.companyId as string;

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

    // Create or get conversation with company
    useEffect(() => {
        if (!companyId || !isSocketConnected) return;

        setIsLoading(true);

        startConversation(companyId, ParticipantType.COMPANY, true)
            .catch((err) => {
                console.error('Error starting conversation:', err);
                toast.error(err.message || 'Không thể tạo cuộc trò chuyện.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [companyId, isSocketConnected]);

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
        <div className="flex h-full bg-gradient-to-br from-background via-background to-muted/20">
            <ConversationList
                conversations={conversations}
                currentUserId={currentUserId}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                onViewProfile={handleViewProfile}
                activeConversationId={fullChatId}
                isLoading={isLoadingConversations}
            />

            <div className="flex-1 relative">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <LoadingSpinner size="lg" message="Đang tải cuộc trò chuyện..." />
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
    );
}
