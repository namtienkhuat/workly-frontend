'use client';

import React, { useState } from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { CompanyProfile } from '@/types/global';
import { toast } from 'sonner';
import { patchCompanyMedia } from '@/services/apiServices';
import CompanyHeader from '@/components/company/CompanyHeader';
import CompanyTabNav from '@/components/company/CompanyTabNav';
import CompanySkeletonHeader from '@/components/company/CompanySkeletonHeader';
import EditImageDialog from '@/components/Avatar/EditImageDialog';
import { CompanyChatInitializer } from '@/features/chat/components/CompanyChatInitializer';

const ManageCompanyLayout = ({ children }: { children: React.ReactNode }) => {
    const { id } = useParams<{ id: string }>();
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
    const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        data: companyProfileData,
        isLoading,
        refetch: refetchCompanyProfile,
    } = useGetCompanyProfile(id);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company;

    const handleLogoCropComplete = async (blob: Blob) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('logo', blob, 'logo.png');

        const { success, message } = await patchCompanyMedia(id, formData);
        setIsSubmitting(false);
        setIsAvatarDialogOpen(false);

        if (success) {
            toast.success('Logo updated successfully!');
            await refetchCompanyProfile();
        } else {
            toast.error('Failed to update logo', {
                description: message,
            });
        }
    };

    const handleBannerCropComplete = async (blob: Blob) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('banner', blob, 'banner.png');

        const { success, message } = await patchCompanyMedia(id, formData);
        setIsSubmitting(false);
        setIsBannerDialogOpen(false);

        if (success) {
            toast.success('Banner updated successfully!');
            await refetchCompanyProfile();
        } else {
            toast.error('Failed to update banner', {
                description: message,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col mt-5 mb-20">
                <CompanySkeletonHeader />
            </div>
        );
    }

    if (!companyProfile) return <div>Company not found</div>;

    return (
        <>
            {/* Initialize company chat for unread count badge */}
            <CompanyChatInitializer companyId={id} />
            
            <div className="flex flex-col mt-5 mb-20">
                <div>
                    <Card className="mx-auto max-w-5xl">
                    <CompanyHeader
                        companyProfile={companyProfile}
                        isEditable={true}
                        handleBannerClick={() => setIsBannerDialogOpen(true)}
                        handleLogoClick={() => setIsAvatarDialogOpen(true)}
                    />

                    <CardFooter className="px-2 py-1">
                        <CompanyTabNav isAdmin={true} companyId={id} />
                    </CardFooter>
                </Card>
            </div>

            {/* Page content */}
            <div className="mt-4">
                <div className="mx-auto max-w-5xl">{children}</div>
            </div>

            {/* Avatar Cropper Dialog */}
            <EditImageDialog
                open={isAvatarDialogOpen}
                onOpenChange={setIsAvatarDialogOpen}
                initialImageUrl={companyProfile?.logoUrl ? companyProfile.logoUrl : undefined}
                onCropComplete={handleLogoCropComplete}
                isSubmitting={isSubmitting}
            />
            <EditImageDialog
                open={isBannerDialogOpen}
                onOpenChange={setIsBannerDialogOpen}
                initialImageUrl={companyProfile?.bannerUrl ? companyProfile.bannerUrl : undefined}
                aspectRatio={4 / 1}
                onCropComplete={handleBannerCropComplete}
                isSubmitting={isSubmitting}
            />
            </div>
        </>
    );
};

export default ManageCompanyLayout;
