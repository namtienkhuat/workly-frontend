'use client';

import React, { useMemo } from 'react';
import { Card, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MessageSquareIcon, UserPlusIcon } from 'lucide-react';
import { useGetUserProfile } from '@/hooks/useQueryData';
import { UserProfile } from '@/types/global';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ProfileSkeleton from '@/app/(main)/profile/edit/_components/ProfileSkeleton';

interface TabConfig {
    label: string;
    path: string;
    exact?: boolean;
}

const PublicProfileLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const { id } = useParams<{ id: string }>();
    const basePath = `/profile/${id}`;

    const { data: userProfileData, isLoading } = useGetUserProfile(id);
    const userProfile: UserProfile = userProfileData?.data?.user;

    const tabs: TabConfig[] = useMemo(
        () => [
            { label: 'About', path: basePath, exact: true },
            { label: 'Posts', path: `${basePath}/post` },
            { label: 'Edit Profile', path: `/profile/edit` },
        ],
        [basePath]
    );

    const isTabActive = (tab: TabConfig): boolean => {
        if (!pathname) return false;
        if (tab.exact) return pathname === tab.path;
        return pathname === tab.path || pathname.startsWith(`${tab.path}/`);
    };

    if (isLoading) return <ProfileSkeleton />;
    if (!userProfile) return <div>User not found</div>;

    return (
        <div className="flex flex-col">
            <div>
                <Card className="mx-auto max-w-5xl">
                    <div className="w-full h-40 bg-muted" />
                    <CardContent className="-mt-12">
                        <div className="h-24 w-24 rounded-full border bg-background" />{' '}
                        {/* Avatar */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <CardTitle className="text-3xl">{userProfile.name}</CardTitle>
                                <p className="text-muted-foreground">{userProfile.username}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => toast.info('This feature is not available yet')}
                                >
                                    <MessageSquareIcon className="w-4 h-4 mr-2" />
                                    Message
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => toast.info('This feature is not available yet')}
                                >
                                    <UserPlusIcon className="w-4 h-4 mr-2" />
                                    Follow
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="px-2 py-1">
                        <div className="w-full border-t">
                            <nav className="flex gap-4 font-bold text-base py-2">
                                {tabs.map((tab) => {
                                    const isActive = isTabActive(tab);
                                    return (
                                        <Link
                                            key={tab.path}
                                            href={tab.path}
                                            className={cn(
                                                'px-2 py-1 border-b-2 rounded-t-md transition-colors',
                                                isActive
                                                    ? 'border-primary text-primary hover:bg-primary/10'
                                                    : 'border-transparent text-muted-foreground hover:bg-primary/10'
                                            )}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            {tab.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <div className="mt-4">
                <div className="mx-auto max-w-5xl">{children}</div>
            </div>
        </div>
    );
};

export default PublicProfileLayout;
