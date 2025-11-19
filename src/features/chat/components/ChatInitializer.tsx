'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useChat } from '../hooks/useChat';
import { ParticipantType } from '../types';

/**
 * ChatInitializer - Initialize chat socket and load conversations
 * Place this component in your main layout to enable chat across all pages
 * Automatically skips initialization in company management routes
 */
export function ChatInitializer() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const { initialize, isSocketConnected, loadConversations, currentUserId, conversations } =
        useChat();
    const loadedOnce = useRef(false);

    // Skip initialization in company management routes
    const isCompanyRoute = pathname?.startsWith('/manage-company');

    console.log('👤 ChatInitializer:', {
        status,
        userId: session?.user?.id,
        isSocketConnected,
        currentUserId,
        conversationsCount: conversations.length,
        pathname,
        isCompanyRoute,
        willSkip: isCompanyRoute,
    });

    // Initialize socket when user is authenticated (skip in company routes)
    useEffect(() => {
        if (status !== 'authenticated') return;
        if (isCompanyRoute) {
            console.log('👤 Skipping ChatInitializer - in company management route');
            return;
        }

        //     const uid = session?.user?.id;
        //     const token = session?.apiToken;

        //     if (!uid || !token) return;

        console.log('👤 Initializing personal chat socket...', { uid });
        initialize(uid, ParticipantType.USER, token);
    }, [status, session, initialize, isCompanyRoute]);

    // Load conversations when socket connected (only once)
    useEffect(() => {
        if (isCompanyRoute) return; // Skip loading in company routes

        if (isSocketConnected && !loadedOnce.current) {
            console.log('👤 Loading personal conversations...');
            loadConversations();
            loadedOnce.current = true;
        }
    }, [isSocketConnected, loadConversations, isCompanyRoute]);

    // Cleanup when navigating to company routes
    useEffect(() => {
        if (isCompanyRoute && isSocketConnected) {
            console.log(
                '👤 Navigating to company route, will let CompanyChatInitializer take over'
            );
        }
    }, [isCompanyRoute, isSocketConnected]);

    // This component doesn't render anything
    return null;
}
