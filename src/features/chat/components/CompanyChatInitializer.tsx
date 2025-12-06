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

    const loadConversations = useChatStore((state) => state.loadConversations);
    const currentUserId = useChatStore((state) => state.currentUserId);
    const isCompanySocketConnected = useChatStore((state) => state.isCompanySocketConnected);
    const setCurrentUser = useChatStore((state) => state.setCurrentUser);
    const initializeCompanySocket = useChatStore((state) => state.initializeCompanySocket);
    const personalUserId = useChatStore((state) => state.personalUserId);

    const lastCompanyId = useRef<string | null>(null);
    const loadedOnce = useRef(false);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated || !user) return;
        if (!companyId) return;

        if (lastCompanyId.current === companyId && currentUserId === companyId) {
            return;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        if (!token) return;

        setCurrentUser(companyId, ParticipantType.COMPANY);
        initializeCompanySocket(companyId, token);
        lastCompanyId.current = companyId;
        loadedOnce.current = false;

        // Delay loadConversations to ensure state is updated and API interceptor gets correct identity
        setTimeout(() => {
            loadConversations();
        }, 100);
    }, [
        isLoading,
        isAuthenticated,
        user,
        companyId,
        currentUserId,
        setCurrentUser,
        initializeCompanySocket,
        loadConversations,
    ]);

    useEffect(() => {
        if (isCompanySocketConnected && currentUserId === companyId && !loadedOnce.current) {
            loadConversations();
            loadedOnce.current = true;
        }
    }, [isCompanySocketConnected, currentUserId, companyId, loadConversations]);

    useEffect(() => {
        loadedOnce.current = false;
    }, [companyId]);

    useEffect(() => {
        return () => {
            if (personalUserId) {
                const token =
                    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
                if (token) {
                    setCurrentUser(personalUserId, ParticipantType.USER);
                }
            }
            lastCompanyId.current = null;
            loadedOnce.current = false;
        };
    }, [personalUserId, setCurrentUser, companyId]);

    return null;
}
