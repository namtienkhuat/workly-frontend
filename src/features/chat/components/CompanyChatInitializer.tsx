'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TOKEN_KEY } from '@/constants';
import { useChatStore } from '../store';
import { ParticipantType } from '../types';

interface CompanyChatInitializerProps {
    companyId: string;
}

export function CompanyChatInitializer({ companyId }: CompanyChatInitializerProps) {
    const { user, isLoading, isAuthenticated } = useAuth();

    const initializeSocket = useChatStore((state) => state.initializeSocket);
    const disconnectSocket = useChatStore((state) => state.disconnectSocket);
    const loadConversations = useChatStore((state) => state.loadConversations);
    const currentUserId = useChatStore((state) => state.currentUserId);
    const isSocketConnected = useChatStore((state) => state.isSocketConnected);
    const setCurrentUser = useChatStore((state) => state.setCurrentUser);

    const isInitialized = useRef(false);
    const lastCompanyId = useRef<string | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated || !user) return;
        
        const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        if (!companyId || !token) return;

        console.log('🏢 CompanyChatInitializer: Effect triggered', {
            companyId,
            currentUserId,
            isInitialized: isInitialized.current,
            lastCompanyId: lastCompanyId.current,
        });

        // Skip if already initialized for same company
        if (
            isInitialized.current &&
            lastCompanyId.current === companyId &&
            currentUserId === companyId
        ) {
            console.log('✅ Already initialized for this company, skipping');
            return;
        }

        // Disconnect old socket if switching company
        if (currentUserId !== companyId) {
            console.log('🔄 Switching identity, disconnecting first', {
                from: currentUserId,
                to: companyId,
            });
            disconnectSocket();
            isInitialized.current = false;
        }

        console.log('🔧 Setting current user to company:', {
            companyId,
            type: ParticipantType.COMPANY,
        });

        // 🔥 SET CURRENT USER FIRST (this was missing!)
        setCurrentUser(companyId, ParticipantType.COMPANY);

        // Now safely initialize socket
        console.log('🔌 Initializing socket for company');
        initializeSocket(companyId, ParticipantType.COMPANY, token);

        isInitialized.current = true;
        lastCompanyId.current = companyId;
    }, [
        isLoading,
        isAuthenticated,
        user,
        companyId,
        currentUserId,
        initializeSocket,
        disconnectSocket,
        setCurrentUser,
    ]);

    // Load conversations once socket is connected
    useEffect(() => {
        console.log('🔌 Socket connection state changed:', {
            isSocketConnected,
            currentUserId,
            companyId,
            matches: currentUserId === companyId,
        });

        if (isSocketConnected && currentUserId === companyId) {
            console.log('✅ Loading conversations for company');
            loadConversations();
        }
    }, [isSocketConnected, currentUserId, companyId, loadConversations]);

    // Cleanup
    useEffect(() => {
        return () => {
            disconnectSocket();
            isInitialized.current = false;
            lastCompanyId.current = null;
        };
    }, [disconnectSocket]);

    return null;
}
