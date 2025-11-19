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

const UserSettingsLayout = ({ children }: { children: React.ReactNode }) => {
    const { user: currentUser, isLoading: isLoadingAuth } = useAuth();

    const {
        data: userProfileData,
        isLoading,
        refetch: refetchUserProfile,
    } = useGetUserBasicInfo(currentUser?.userId || '');
    const userProfile: UserProfile = userProfileData?.data;
    const userInfo = userProfileData?.data?.user || {};

    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
    const [isBgCoverDialogOpen, setIsBgCoverDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        return <div>User not found or session expired.</div>;
    }

    return (
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

            {/* DIALOG */}
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
    );
};

export default UserSettingsLayout;
