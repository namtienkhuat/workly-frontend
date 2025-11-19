'use client';
import { CompanyProfile } from '@/types/global';
import Image from 'next/image';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CardContent, CardDescription, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { EditIcon, MessageSquareIcon, PlusIcon, UserCheck, UserRoundPlus } from 'lucide-react';
import clsx from 'clsx';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { CompanyFollowerModal } from './CompanyFollowerModal';
import {
    getFollowCompanyStatus,
    useFollowCompany,
    useUnfollowCompany,
} from '@/services/follow/followService';

interface CompanyHeaderProps {
    isEditable?: boolean;
    companyProfile: CompanyProfile;
    handleBannerClick?: () => void;
    handleLogoClick?: () => void;
}

const CompanyHeader = ({
    isEditable = false,
    companyProfile,
    handleBannerClick,
    handleLogoClick,
}: CompanyHeaderProps) => {
    const [isBannerError, setIsBannerError] = useState(false);
    const [isLogoError, setIsLogoError] = useState(false);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [isFollowerModalOpen, setIsFollowerModalOpen] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingActionRef = useRef<'follow' | 'unfollow' | null>(null);

    const followMutation = useFollowCompany({
        onSuccess: () => {
            setIsFollowing(true);
        },
        onError: (error) => {
            setIsFollowing(false);
            toast.error('Failed to follow company', {
                description: error.message,
            });
        },
    });

    const unfollowMutation = useUnfollowCompany({
        onSuccess: () => {
            setIsFollowing(false);
        },
        onError: (error) => {
            setIsFollowing(true);
            toast.error('Failed to unfollow company', {
                description: error.message,
            });
        },
    });

    useEffect(() => {
        if (isEditable) return setIsFollowing(false);

        const getIsFollowing = async () => {
            const { data } = await getFollowCompanyStatus(companyProfile.companyId);
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
                followMutation.mutate(companyProfile.companyId);
            } else if (action === 'unfollow') {
                unfollowMutation.mutate(companyProfile.companyId);
            }
            pendingActionRef.current = null;
        }, 500);
    }, [followMutation, unfollowMutation, companyProfile.companyId]);

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
                onClick={handleBannerClick}
            >
                {companyProfile.bannerUrl && !isBannerError ? (
                    <Image
                        src={companyProfile.bannerUrl}
                        alt={companyProfile.name}
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
                            {isBannerError || !companyProfile.bannerUrl ? (
                                <>
                                    <PlusIcon className="h-4 w-4" />
                                    Add Banner
                                </>
                            ) : (
                                <>
                                    <EditIcon className="h-4 w-4" />
                                    Edit Banner
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
                    onClick={handleLogoClick}
                >
                    {companyProfile.logoUrl && !isLogoError ? (
                        <Image
                            src={companyProfile.logoUrl}
                            alt={companyProfile.name}
                            loading="lazy"
                            fill
                            className="object-cover"
                            onError={() => setIsLogoError(true)}
                        />
                    ) : (
                        <div className="relative h-36 w-36 rounded-full border-muted bg-white" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {isLogoError ? 'Add Logo' : 'Edit'}
                        </span>
                    </div>
                </div>

                <div className="mt-2 flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="text-3xl">{companyProfile.name}</CardTitle>

                        <CardDescription className="flex gap-2 mt-2">
                            <Badge variant="outline">{companyProfile.industry.name}</Badge>
                            <Badge variant="outline">Employees: {companyProfile.size}</Badge>
                            {(companyProfile.followersCount || 0) > 0 && (
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                                    onClick={() => {
                                        setIsFollowerModalOpen(true);
                                    }}
                                >
                                    Followers: {companyProfile.followersCount}
                                </Badge>
                            )}
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditable ? (
                            <Button variant="outline" asChild>
                                <Link href={`/company/${companyProfile.companyId}`}>
                                    View Public Page
                                </Link>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    // onClick={}
                                >
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

            <CompanyFollowerModal
                companyId={companyProfile.companyId}
                open={isFollowerModalOpen}
                onOpenChange={setIsFollowerModalOpen}
                followersCount={companyProfile.followersCount || 0}
            />
        </>
    );
};

export default CompanyHeader;
