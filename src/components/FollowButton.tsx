import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { useToggleFollow } from '@/hooks/useToggleFollow';
import { useAuth } from '@/hooks/useAuth';
import { AuthRequiredModal } from './auth/AuthRequiredModal';

interface FollowButtonProps {
    id: string;
    isFollowing: boolean;
    type: 'user' | 'company';
    debounceMs?: number;
}

const FollowButton = ({
    id,
    isFollowing: initialIsFollowing,
    type,
    debounceMs = 1000,
}: FollowButtonProps) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const toggleFollow = useToggleFollow();
    const { user: currentUser } = useAuth();
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingActionRef = useRef<{
        previousState: boolean;
        id: string;
        type: 'user' | 'company';
    } | null>(null);

    // Sync local state with prop changes
    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const executeFollowAction = useCallback(() => {
        const action = pendingActionRef.current;
        if (!action) return;

        toggleFollow.mutate(
            {
                id: action.id,
                isFollowing: action.previousState,
                type: action.type,
            },
            {
                onError: () => {
                    setIsFollowing(action.previousState);
                },
            }
        );
        pendingActionRef.current = null;
    }, [toggleFollow]);

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Check if user is authenticated
        if (!currentUser?.userId) {
            setAuthModalOpen(true);
            return;
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        const previousState = isFollowing;

        setIsFollowing(!isFollowing);

        pendingActionRef.current = {
            previousState,
            id,
            type,
        };

        debounceTimerRef.current = setTimeout(() => {
            executeFollowAction();
        }, debounceMs);
    };

    return (
        <>
            <Button
                size="sm"
                variant={isFollowing ? 'outline' : 'default'}
                className="h-8 px-3 text-xs"
                onClick={handleFollow}
                disabled={toggleFollow.isPending}
            >
                {isFollowing ? 'Following' : 'Follow'}
            </Button>
            <AuthRequiredModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
                featureName={type === 'user' ? 'follow users' : 'follow companies'}
            />
        </>
    );
};

export default FollowButton;
