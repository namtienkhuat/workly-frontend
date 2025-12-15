'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { useGetUserBasicInfo } from '@/hooks/useQueryData';
import { UserProfile } from '@/types/global';
import { useAuth } from '@/hooks/useAuth';
import ProfileSkeleton from '../edit/_components/ProfileSkeleton';
import ProfileTabNav from '../_components/ProfileTabNav';
import ProfleHeader from '../_components/ProfleHeader';
import { SetSidebar } from '@/components/layout/SetSideBar';
import RightSidebar from '../_components/RightSidebar';

const PublicProfileLayout = ({ children }: { children: React.ReactNode }) => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [isCurrentUser, setIsCurrentUser] = useState(false);

    const RESERVED_ROUTES = ['edit'];
    const isReservedRoute = RESERVED_ROUTES.includes(id);

    const { data: userProfileData, isLoading } = useGetUserBasicInfo(id);

    useEffect(() => {
        setIsCurrentUser(currentUser?.userId === id);
    }, [currentUser, id]);

    if (isReservedRoute) {
        return <>{children}</>;
    }

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (!userProfileData?.data?.user?.userId) {
        return (
            <div className="w-full">
                <div className="min-h-[calc(100vh-300px)] flex items-center justify-center px-4 py-6">
                    <div className="max-w-3xl w-full">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20 shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                            <div
                                className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-pulse"
                                style={{ animationDelay: '1s' }}
                            />

                            <div className="relative p-12 text-center space-y-6">
                                <div className="flex justify-center mb-6">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                                            <svg
                                                className="h-16 w-16 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/70 bg-clip-text text-transparent">
                                        Profile Not Found
                                    </h2>
                                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                                        The profile you&apos;re looking for doesn&apos;t exist or is
                                        temporarily unavailable.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 max-w-md mx-auto">
                                    <div
                                        onClick={() => router.push('/home')}
                                        className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group cursor-pointer"
                                    >
                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                            🏠
                                        </div>
                                        <div className="text-sm font-semibold mb-1">Go Home</div>
                                        <div className="text-xs text-muted-foreground">
                                            Back to feed
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => router.push('/jobs')}
                                        className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group cursor-pointer"
                                    >
                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                            💼
                                        </div>
                                        <div className="text-sm font-semibold mb-1">
                                            Explore Jobs
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Find opportunities
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 pb-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                                        <svg
                                            className="h-4 w-4 text-primary"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-sm font-medium text-primary">
                                            Double-check the profile URL
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Try searching for the person or explore other profiles
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                        <div
                                            className="h-1 w-1 rounded-full bg-primary animate-pulse"
                                            style={{ animationDelay: '0.2s' }}
                                        />
                                        <div
                                            className="h-1 w-1 rounded-full bg-primary animate-pulse"
                                            style={{ animationDelay: '0.4s' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const userProfile: UserProfile = {
        ...userProfileData.data.user,
        location: userProfileData?.data?.relationships?.location,
    };

    return (
        <>
            <SetSidebar position="right">
                <RightSidebar />
            </SetSidebar>

            <div className="flex flex-col">
                <div>
                    <Card className="mx-auto max-w-5xl">
                        <ProfleHeader
                            userProfile={userProfile}
                            isEditable={false}
                            isCurrentUser={isCurrentUser}
                        />

                        <CardFooter className="px-2 py-1">
                            <ProfileTabNav isOwner={isCurrentUser} userId={id} />
                        </CardFooter>
                    </Card>
                </div>

                <div className="mt-4">
                    <div className="mx-auto max-w-5xl">{children}</div>
                </div>
            </div>
        </>
    );
};

export default PublicProfileLayout;
