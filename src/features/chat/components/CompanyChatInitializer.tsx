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
    const loadedOnce = useRef(false);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated || !user) return;

        const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        if (!companyId || !token) return;

        // Skip if already initialized for same company
        if (
            isInitialized.current &&
            lastCompanyId.current === companyId &&
            currentUserId === companyId
        ) {
            return;
        }

        // Disconnect old socket if switching company
        if (currentUserId !== companyId) {
            disconnectSocket();
            isInitialized.current = false;
        }

        // 🔥 SET CURRENT USER FIRST (this was missing!)
        setCurrentUser(companyId, ParticipantType.COMPANY);

        // Now safely initialize socket
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

    // Load conversations once socket is connected (only once per company)
    useEffect(() => {
        if (isSocketConnected && currentUserId === companyId && !loadedOnce.current) {
            loadConversations();
            loadedOnce.current = true;
        }
    }, [isSocketConnected, currentUserId, companyId, loadConversations]);
    
    // Reset loadedOnce when company changes
    useEffect(() => {
        loadedOnce.current = false;
    }, [companyId]);

    // Cleanup
    useEffect(() => {
        return () => {
            disconnectSocket();
            isInitialized.current = false;
            lastCompanyId.current = null;
            loadedOnce.current = false;
        };
    }, [disconnectSocket]);

    return null;
}
