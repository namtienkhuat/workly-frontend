import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import {
    getFollowUserStatus,
    useFollowUser,
    useUnfollowUser,
} from '@/services/follow/followService';
import { UserProfile } from '@/types/global';
import { getInitials } from '@/utils/helpers';
import clsx from 'clsx';
import { EditIcon, MessageSquareIcon, PlusIcon, UserCheck, UserRoundPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { UserFollowerModal } from './UserFollowerModal';

interface ProfleHeaderProps {
    userProfile: UserProfile;
    isEditable?: boolean;
    isCurrentUser?: boolean;
    handleBgCoverClick?: () => void;
    handleAvatarClick?: () => void;
}

const ProfleHeader = ({
    userProfile,
    isEditable,
    isCurrentUser,
    handleBgCoverClick,
    handleAvatarClick,
}: ProfleHeaderProps) => {
    const [isBannerError, setIsBannerError] = useState(false);
    const [isLogoError, setIsLogoError] = useState(false);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [isFollowerModalOpen, setIsFollowerModalOpen] = useState(false);

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingActionRef = useRef<'follow' | 'unfollow' | null>(null);

    const followMutation = useFollowUser({
        onSuccess: () => {
            setIsFollowing(true);
        },
        onError: (error) => {
            setIsFollowing(false);
            toast.error('Failed to follow user', {
                description: error.message,
            });
        },
    });

    const unfollowMutation = useUnfollowUser({
        onSuccess: () => {
            setIsFollowing(false);
        },
        onError: (error) => {
            setIsFollowing(true);
            toast.error('Failed to unfollow user', {
                description: error.message,
            });
        },
    });

    useEffect(() => {
        if (isEditable || isCurrentUser) return setIsFollowing(false);

        const getIsFollowing = async () => {
            const { data } = await getFollowUserStatus(userProfile.userId);
            setIsFollowing(data?.isFollowing ?? false);
        };
        getIsFollowing();
    }, []);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const debouncedFollowAction = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            const action = pendingActionRef.current;
            if (action === 'follow') {
                followMutation.mutate(userProfile.userId);
            } else if (action === 'unfollow') {
                unfollowMutation.mutate(userProfile.userId);
            }
            pendingActionRef.current = null;
        }, 500);
    }, [followMutation, unfollowMutation, userProfile.userId]);

    const handleFollowToggle = () => {
        setIsFollowing((prev) => !prev);

        pendingActionRef.current = isFollowing ? 'unfollow' : 'follow';
        debouncedFollowAction();
    };

    return (
        <>
            <div
                className={clsx(
                    'relative w-full h-40 overflow-hidden rounded-t-lg',
                    isEditable && 'cursor-pointer hover:opacity-80 transition-opacity group'
                )}
                onClick={handleBgCoverClick}
            >
                {userProfile.bgCoverUrl && !isBannerError ? (
                    <Image
                        src={userProfile.bgCoverUrl}
                        alt={userProfile.name}
                        fill
                        className="object-cover"
                        loading="lazy"
                        onError={() => setIsBannerError(true)}
                    />
                ) : (
                    <div className="relative w-full h-40 bg-gradient-to-r from-muted to-muted/80 rounded-t-lg" />
                )}

                {isEditable && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center rounded-t-lg">
                        <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                            {isBannerError || !userProfile.bgCoverUrl ? (
                                <>
                                    <PlusIcon className="h-4 w-4" />
                                    Add Background Cover
                                </>
                            ) : (
                                <>
                                    <EditIcon className="h-4 w-4" />
                                    Edit Background Cover
                                </>
                            )}
                        </span>
                    </div>
                )}
            </div>

            <CardContent className="relative -mt-12">
                {/* LOGO */}
                <div
                    className={clsx(
                        'relative h-36 w-36 rounded-full overflow-hidden border-2 border-muted shadow-lg',
                        isEditable && 'cursor-pointer hover:opacity-80 transition-opacity group'
                    )}
                    onClick={handleAvatarClick}
                >
                    {userProfile.avatarUrl && !isLogoError ? (
                        <Image
                            src={userProfile.avatarUrl}
                            alt={userProfile.name}
                            loading="lazy"
                            fill
                            className="object-cover"
                            onError={() => setIsLogoError(true)}
                        />
                    ) : (
                        <Avatar className="h-36 w-36 rounded-full border-muted bg-white text-2xl">
                            <AvatarFallback className="text-2xl bg-white">
                                {getInitials(userProfile.name)}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {isLogoError ? 'Add Avatar' : 'Edit'}
                        </span>
                    </div>
                </div>

                <div className="mt-2 flex items-start justify-between gap-16">
                    <div className="flex flex-col">
                        <CardTitle className="text-3xl">{userProfile.name}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                            {userProfile?.headline}
                        </CardDescription>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                            {(userProfile.followersCount || 0) > 0 && (
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                                    onClick={() => {
                                        setIsFollowerModalOpen(true);
                                    }}
                                >
                                    Followers: {userProfile.followersCount}
                                </Badge>
                            )}
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        {isCurrentUser ? (
                            <Button variant="outline" asChild>
                                <Link href={`/profile/edit`}>Edit Profile</Link>
                            </Button>
                        ) : isEditable ? (
                            <Button variant="outline" asChild>
                                <Link href={`/profile/${userProfile.userId}`}>View Profile</Link>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="outline">
                                    <MessageSquareIcon className="w-4 h-4" />
                                    Message
                                </Button>
                                <Button
                                    variant="outline"
                                    className={clsx(
                                        isFollowing &&
                                            'bg-primary text-primary-foreground hover:bg-primary/90'
                                    )}
                                    onClick={handleFollowToggle}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserCheck className="w-4 h-4" />
                                            Following
                                        </>
                                    ) : (
                                        <>
                                            <UserRoundPlus className="w-4 h-4" />
                                            Follow
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <UserFollowerModal
                userId={userProfile.userId}
                open={isFollowerModalOpen}
                onOpenChange={setIsFollowerModalOpen}
                followersCount={userProfile.followersCount || 0}
            />
        </>
    );
};

export default ProfleHeader;
