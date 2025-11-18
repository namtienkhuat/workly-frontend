'use client';

import React, { useMemo } from 'react';
import { Card, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useGetMe } from '@/hooks/useQueryData';
import { UserProfile } from '@/types/global';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface TabConfig {
    label: string;
    path: string;
    exact?: boolean;
}

const ProfileLayoutSkeleton = () => {
    return (
        <Card className="mx-auto max-w-5xl mt-10">
            <Skeleton className="w-full h-40" />
            <CardContent className="-mt-12">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="px-2 py-1">
                <div className="w-full border-t">
                    <nav className="flex gap-4 font-bold text-base py-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-24" />
                    </nav>
                </div>
            </CardFooter>
        </Card>
    );
};

const UserSettingsLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const basePath = '/profile/edit';

    const { data: userProfileData, isLoading } = useGetMe();
    const userProfile: UserProfile = userProfileData?.data;
    const userInfo = userProfileData?.data?.user || {};

    const tabs: TabConfig[] = useMemo(
        () => [
            { label: 'Edit Profile', path: basePath, exact: true },
            { label: 'Skills', path: `${basePath}/skills` },
            { label: 'Industries', path: `${basePath}/industries` },
            { label: 'Education', path: `${basePath}/education` },
            { label: 'Account', path: `${basePath}/account` },
        ],
        [basePath]
    );

    const isTabActive = (tab: TabConfig): boolean => {
        if (!pathname) return false;
        if (tab.exact) return pathname === tab.path;
        return pathname === tab.path || pathname.startsWith(`${tab.path}/`);
    };

    if (isLoading) {
        return <ProfileLayoutSkeleton />;
    }

    if (!userProfile) {
        return <div>User not found or session expired.</div>;
    }

    return (
        <div className="flex flex-col">
            <div>
                <Card className="mx-auto max-w-5xl">
                    <div className="w-full h-40 bg-muted" />
                    <CardContent className="-mt-12">
                        <div className="h-24 w-24 rounded-full border bg-background" />{' '}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <CardTitle className="text-3xl">{userInfo.name}</CardTitle>
                                <p className="text-muted-foreground">{userInfo.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={`/profile/${userInfo.userId}`}>
                                        View Public Page
                                    </Link>
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

export default UserSettingsLayout;
