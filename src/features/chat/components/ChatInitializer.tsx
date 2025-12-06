'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TOKEN_KEY } from '@/constants';
import { useChatStore } from '../store';
import { ParticipantType } from '../types';

export function ChatInitializer() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const setPersonalUserId = useChatStore((state) => state.setPersonalUserId);
    const initializeUserSocket = useChatStore((state) => state.initializeUserSocket);
    const isUserSocketConnected = useChatStore((state) => state.isUserSocketConnected);
    const loadConversations = useChatStore((state) => state.loadConversations);
    const personalUserId = useChatStore((state) => state.personalUserId);
    const loadedOnce = useRef(false);
    const initializedUserId = useRef<string | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated || !user) return;

        const uid = user.userId;
        if (!uid) return;

        setPersonalUserId(uid);

        const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        if (!token) return;

        if (initializedUserId.current !== uid) {
            initializeUserSocket(uid, token);
            initializedUserId.current = uid;
            loadedOnce.current = false;
        }
    }, [isLoading, isAuthenticated, user, initializeUserSocket, setPersonalUserId]);

    useEffect(() => {
        if (isUserSocketConnected && personalUserId) {
            if (!loadedOnce.current) {
                // Ensure we load conversations with user context
                const { currentUserId, currentUserType } = useChatStore.getState();
                if (currentUserId !== personalUserId || currentUserType !== ParticipantType.USER) {
                    useChatStore.getState().setCurrentUser(personalUserId, ParticipantType.USER);
                }
                loadConversations();
                loadedOnce.current = true;
            }
        }
    }, [isUserSocketConnected, personalUserId, loadConversations]);

    return null;
}
