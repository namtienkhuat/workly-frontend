'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Follower } from '@/types/global';
import { useGetCompanyFollowers } from '@/hooks/useQueryData';

interface CompanyFollowerModalProps {
    companyId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    followersCount: number;
}

const FollowerSkeleton = () => (
    <div className="flex items-start gap-3 p-3 rounded-lg">
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-20 flex-shrink-0" />
            </div>
        </div>
    </div>
);

export const CompanyFollowerModal: React.FC<CompanyFollowerModalProps> = ({
    companyId,
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
    } = useGetCompanyFollowers(
        companyId,
        pagination,
        // Enable fetching only when modal is open AND not using fake data
        open
    );

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setFollowers([]);
            setPagination({ page: 1, limit: 10 });
            setHasNextPage(true);
        }
    }, [open]);

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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Followers</DialogTitle>
                    <DialogDescription>
                        {followersCount.toLocaleString()}{' '}
                        {followersCount === 1 ? 'person' : 'people'} following this company
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {isLoading && followers.length === 0 ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <FollowerSkeleton key={index} />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {followers.map((follower) => (
                                    <div
                                        key={follower.userId}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <Avatar className="h-12 w-12 flex-shrink-0">
                                            <AvatarImage
                                                src={follower.avatarUrl}
                                                alt={follower.name}
                                            />
                                            <AvatarFallback>
                                                {getInitials(follower.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm truncate">
                                                        {follower.name}
                                                    </h4>
                                                    {follower.headline && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                            {follower.headline}
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-shrink-0"
                                                    onClick={() => handleView(follower.userId)}
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
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
