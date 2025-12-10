'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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
        isUserSocketConnected,
        initialize,
        loadConversations,
        deleteConversation,
    } = useChat();

    const [isLoading, setIsLoading] = useState(false);
    const loadedUserRef = useRef<string | null>(null);

    useEffect(() => {
        if (!user?.userId) return;

        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            return;
        }

        initialize(user.userId, ParticipantType.USER, token);
        loadConversations();
    }, [user?.userId, initialize, loadConversations]);

    useEffect(() => {
        if (!userId || !isUserSocketConnected || loadedUserRef.current === userId) return;

        const handleStartConversation = async () => {
            try {
                const { data } = await getUserById(userId);
                if (!data || data.user?.isDeleted) {
                    toast.error('User not found or account has been deleted.');
                    router.push('/chat');
                    return;
                }

                setIsLoading(true);
                await startConversation(userId, ParticipantType.USER, true);
                loadedUserRef.current = userId;
            } catch (err: any) {
                // If user not found or deleted, redirect to /chat
                if (err.response?.status === 404 || err.message?.includes('not found')) {
                    toast.error('User not found.');
                    router.push('/chat');
                } else {
                    toast.error(err.message || 'Unable to create conversation.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        handleStartConversation();
    }, [userId, isUserSocketConnected, startConversation]);

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
            setFullChat(null);
            loadedUserRef.current = null;
            router.push('/chat');
        } catch (error) {
            // Error handled silently
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
                <LoadingSpinner size="lg" message="Loading..." />
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
                        <LoadingSpinner size="lg" message="Loading conversation..." />
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
                                    <svg
                                        className="w-16 h-16 text-destructive"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="mb-2 text-2xl font-bold text-foreground/90">
                                Unable to load conversation
                            </h2>
                            <p className="text-muted-foreground">Please try again later.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
