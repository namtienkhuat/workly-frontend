'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { ParticipantType } from '../types';

/**
 * ChatInitializer - Initialize chat socket and load conversations
 * Place this component in your main layout to enable chat across all pages
 */
export function ChatInitializer() {
    // const { data: session, status } = useSession();
    const { initialize, isSocketConnected, loadConversations, currentUserId, conversations } =
        useChat();
    const loadedOnce = useRef(false);

    // console.log('ChatInitializer:', {
    //     status,
    //     userId: session?.user?.id,
    //     isSocketConnected,
    //     currentUserId,
    //     conversationsCount: conversations.length
    // });

    // // Initialize socket when user is authenticated
    // useEffect(() => {
    //     if (status !== 'authenticated') return;

    //     const uid = session?.user?.id;
    //     const token = session?.apiToken;

    //     if (!uid || !token) return;

    //     console.log('Initializing chat socket...', { uid });
    //     initialize(uid, ParticipantType.USER, token);
    // }, [status, session, initialize]);

    // Load conversations when socket connected (only once)
    useEffect(() => {
        if (isSocketConnected && !loadedOnce.current) {
            console.log('Loading conversations...');
            loadConversations();
            loadedOnce.current = true;
        }
    }, [isSocketConnected, loadConversations]);

    // This component doesn't render anything
    return null;
}
