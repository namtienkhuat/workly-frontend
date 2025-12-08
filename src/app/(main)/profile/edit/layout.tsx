'use client';

import React, { useState } from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { useGetUserBasicInfo } from '@/hooks/useQueryData';
import { UserProfile } from '@/types/global';
import { useAuth } from '@/hooks/useAuth';
import ProfileTabNav from '../_components/ProfileTabNav';
import ProfleHeader from '../_components/ProfleHeader';
import ProfileSkeleton from './_components/ProfileSkeleton';
import { toast } from 'sonner';
import EditImageDialog from '@/components/Avatar/EditImageDialog';
import { patchUserMedia } from '@/services/apiServices';
import { SetSidebar } from '@/components/layout/SetSideBar';
import RightSidebar from '../_components/RightSidebar';

const UserSettingsLayout = ({ children }: { children: React.ReactNode }) => {
    const { user: currentUser, isLoading: isLoadingAuth, isAuthenticated } = useAuth();

    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
    const [isBgCoverDialogOpen, setIsBgCoverDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        data: userProfileData,
        isLoading,
        refetch: refetchUserProfile,
    } = useGetUserBasicInfo(currentUser?.userId || '');

    const userProfile: UserProfile = userProfileData?.data;
    const userInfo = userProfileData?.data?.user
        ? {
              ...userProfileData.data.user,
              location: userProfileData.data.relationships?.location,
          }
        : ({} as UserProfile);

    if (!isLoadingAuth && !isAuthenticated) {
        return (
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6">
                <div className="max-w-2xl w-full">
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
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/70 bg-clip-text text-transparent animate-gradient">
                                    Edit Your Profile
                                </h2>
                                <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                                    Sign in to customize your profile and make it stand out to
                                    recruiters and connections.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                                <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group">
                                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                        ✨
                                    </div>
                                    <div className="text-sm font-semibold mb-1">Personalize</div>
                                    <div className="text-xs text-muted-foreground">
                                        Add your skills & experience
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group">
                                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                        🎨
                                    </div>
                                    <div className="text-sm font-semibold mb-1">Customize</div>
                                    <div className="text-xs text-muted-foreground">
                                        Upload photos & details
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group">
                                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                        🚀
                                    </div>
                                    <div className="text-sm font-semibold mb-1">Stand Out</div>
                                    <div className="text-xs text-muted-foreground">
                                        Get noticed by employers
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
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium text-primary">
                                        Complete profiles get 10x more views
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Please sign in to start editing your profile
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
        );
    }

    const handleAvatarCropComplete = async (blob: Blob) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.png');
        const { success, message } = await patchUserMedia(formData);
        setIsSubmitting(false);
        setIsAvatarDialogOpen(false);
        if (success) {
            toast.success('Avatar updated successfully!');
            refetchUserProfile();
        } else {
            toast.error('Failed to update avatar', {
                description: message,
            });
        }
    };

    const handleBgCoverCropComplete = async (blob: Blob) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('background', blob, 'background.png');
        const { success, message } = await patchUserMedia(formData);
        setIsSubmitting(false);
        setIsBgCoverDialogOpen(false);
        if (success) {
            toast.success('Background cover updated successfully!');
            refetchUserProfile();
        } else {
            toast.error('Failed to update background cover', {
                description: message,
            });
        }
    };

    if (isLoading || isLoadingAuth) {
        return <ProfileSkeleton />;
    }

    if (!userProfile) {
        return (
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-semibold">Unable to Load Profile</h2>
                    <p className="text-muted-foreground">
                        There was an error loading your profile data. Please try refreshing the
                        page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <SetSidebar position="right">
                <RightSidebar />
            </SetSidebar>

            <div className="flex flex-col">
                <div>
                    <Card className="mx-auto max-w-5xl">
                        <ProfleHeader
                            userProfile={userInfo}
                            isEditable={true}
                            handleBgCoverClick={() => setIsBgCoverDialogOpen(true)}
                            handleAvatarClick={() => setIsAvatarDialogOpen(true)}
                        />

                        <CardFooter className="px-2 py-1">
                            <ProfileTabNav isOwner={true} userId={userInfo.userId} />
                        </CardFooter>
                    </Card>
                </div>

                <div className="mt-4">
                    <div className="mx-auto max-w-5xl">{children}</div>
                </div>

                <EditImageDialog
                    open={isAvatarDialogOpen}
                    onOpenChange={setIsAvatarDialogOpen}
                    initialImageUrl={userProfile?.avatarUrl ? userProfile.avatarUrl : undefined}
                    onCropComplete={handleAvatarCropComplete}
                    isSubmitting={isSubmitting}
                />
                <EditImageDialog
                    open={isBgCoverDialogOpen}
                    onOpenChange={setIsBgCoverDialogOpen}
                    initialImageUrl={userProfile?.bgCoverUrl ? userProfile.bgCoverUrl : undefined}
                    onCropComplete={handleBgCoverCropComplete}
                    isSubmitting={isSubmitting}
                    aspectRatio={4 / 1}
                />
            </div>
        </>
    );
};

export default UserSettingsLayout;
