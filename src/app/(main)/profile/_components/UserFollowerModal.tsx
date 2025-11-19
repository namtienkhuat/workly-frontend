'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Follower } from '@/types/global';
import { useGetUserFollowers } from '@/services/follow/followService';
import UserInfoSkeleton from '@/components/user/UserInfoSkeleton';
import UserInfo from '@/components/user/UserInfo';

interface UserFollowerModalProps {
    userId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    followersCount: number;
}

export const UserFollowerModal: React.FC<UserFollowerModalProps> = ({
    userId,
    open,
    onOpenChange,
    followersCount,
}) => {
    const router = useRouter();
    const observerTarget = useRef<HTMLDivElement>(null);

    const [followers, setFollowers] = useState<Follower[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    });
    const [hasNextPage, setHasNextPage] = useState(true);

    const {
        data: followersData,
        isLoading,
        isFetching,
    } = useGetUserFollowers(userId, pagination, open);

    useEffect(() => {
        if (followersData?.data?.followers) {
            const newFollowers = followersData.data.followers;

            if (pagination.page === 1) {
                setFollowers(newFollowers);
            } else {
                setFollowers((prev) => [...prev, ...newFollowers]);
            }

            if (followersData.data.pagination) {
                setHasNextPage(followersData.data.pagination.hasNextPage);
            }
        }
    }, [followersData, pagination.page]);

    const loadMore = useCallback(() => {
        if (!isFetching && hasNextPage) {
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
        }
    }, [isFetching, hasNextPage]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [loadMore]);

    const handleView = (userId: string) => {
        router.push(`/profile/${userId}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Followers</DialogTitle>
                    <DialogDescription>
                        {followersCount.toLocaleString()}{' '}
                        {followersCount === 1 ? 'person' : 'people'} following this user
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {isLoading && followers.length === 0 ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <UserInfoSkeleton key={index} />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {followers.map((follower) => (
                                    <div
                                        key={follower.userId}
                                        className="flex items-center justify-between rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <UserInfo
                                            userId={follower.userId}
                                            name={follower.name}
                                            headline={follower.headline}
                                            avatarUrl={follower.avatarUrl}
                                        />

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-shrink-0 mr-3"
                                            onClick={() => handleView(follower.userId)}
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {hasNextPage && (
                                <div ref={observerTarget} className="flex justify-center py-4">
                                    {isFetching && (
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
