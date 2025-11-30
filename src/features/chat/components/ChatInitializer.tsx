'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '../hooks/useChat';
import { ParticipantType } from '../types';
import { useAuth } from '@/hooks/useAuth';
import { TOKEN_KEY } from '@/constants';
import { useChatStore } from '../store';

/**
 * ChatInitializer - Initialize chat socket and load conversations
 * Place this component in your main layout to enable chat across all pages
 * Automatically skips initialization in company management routes
 */
export function ChatInitializer() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const pathname = usePathname();
    const { initialize, isSocketConnected, loadConversations, currentUserId, conversations } =
        useChat();
    const setPersonalUserId = useChatStore((state) => state.setPersonalUserId);
    const loadedOnce = useRef(false);

    // Skip initialization in company management routes
    const isCompanyRoute = pathname?.startsWith('/manage-company');

    console.log('👤 ChatInitializer:', {
        isLoading,
        isAuthenticated,
        userId: user?.userId,
        isSocketConnected,
        currentUserId,
        conversationsCount: conversations.length,
        pathname,
        isCompanyRoute,
        willSkip: isCompanyRoute,
    });

    // Initialize socket when user is authenticated (skip in company routes)
    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated || !user) return;
        if (isCompanyRoute) {
            console.log('👤 Skipping ChatInitializer - in company management route');
            return;
        }

        const uid = user.userId;
        const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

        if (!uid || !token) {
            console.warn('👤 Missing uid or token for chat initialization');
            return;
        }

        console.log('👤 Initializing personal chat socket...', { uid });
        // Set personalUserId first so Header badge always shows user's unread count
        setPersonalUserId(uid);
        initialize(uid, ParticipantType.USER, token);
    }, [isLoading, isAuthenticated, user, initialize, isCompanyRoute, setPersonalUserId]);

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
