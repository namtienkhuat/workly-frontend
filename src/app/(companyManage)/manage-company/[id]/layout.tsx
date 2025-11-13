'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { CompanyProfile } from '@/types/global';
import LayoutSkeleton from '../_components/LayoutSkeleton';
import Image from 'next/image';
import TabSwitch from '../_components/TabSwitch';
import { EditIcon, PlusIcon } from 'lucide-react';
import EditLogoDialog from '../_components/EditLogoDialog';
import { toast } from 'sonner';
import { patchCompanyMedia } from '@/services/apiServices';

const ManageCompanyLayout = ({ children }: { children: React.ReactNode }) => {
    const { id } = useParams<{ id: string }>();
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
    const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
    const [isBannerError, setIsBannerError] = useState(false);
    const [isLogoError, setIsLogoError] = useState(false);

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
        return <LayoutSkeleton />;
    }

    if (!companyProfile) return <div>Company not found</div>;

    return (
        <div className="flex flex-col my-10">
            <div>
                <Card className="mx-auto max-w-5xl">
                    {/* BANNER */}
                    <div
                        className="relative w-full h-40 bg-muted overflow-hidden rounded-t-lg cursor-pointer hover:opacity-80 transition-opacity group"
                        onClick={() => setIsBannerDialogOpen(true)}
                    >
                        {companyProfile.bannerUrl && !isBannerError ? (
                            <Image
                                src={companyProfile.bannerUrl}
                                alt={companyProfile.name}
                                fill
                                className="object-cover rounded-t-lg"
                                loading="lazy"
                                onError={() => setIsBannerError(true)}
                            />
                        ) : (
                            <div className="w-full h-40 bg-gradient-to-r from-muted to-muted/80 rounded-t-lg" />
                        )}
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
                    </div>

                    <CardContent className="relative -mt-12">
                        {/* LOGO */}
                        <div
                            className="h-36 w-36 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group border-2 border-muted"
                            onClick={() => setIsAvatarDialogOpen(true)}
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
                                <div className="h-36 w-36 rounded-full border-muted bg-white" />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isLogoError ? 'Add Logo' : 'Edit'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <CardTitle className="text-3xl">{companyProfile.name}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={`/company/${id}`}>View Public Page</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="px-2 py-1">
                        <TabSwitch />
                    </CardFooter>
                </Card>
            </div>

            {/* Page content */}
            <div className="mt-4">
                <div className="mx-auto max-w-5xl">{children}</div>
            </div>

            {/* Avatar Cropper Dialog */}
            <EditLogoDialog
                open={isAvatarDialogOpen}
                onOpenChange={setIsAvatarDialogOpen}
                initialImageUrl={
                    companyProfile.logoUrl && !isLogoError ? companyProfile.logoUrl : undefined
                }
                onCropComplete={handleLogoCropComplete}
                isSubmitting={isSubmitting}
            />
            <EditLogoDialog
                open={isBannerDialogOpen}
                onOpenChange={setIsBannerDialogOpen}
                initialImageUrl={
                    companyProfile.bannerUrl && !isBannerError
                        ? companyProfile.bannerUrl
                        : undefined
                }
                aspectRatio={4 / 1}
                onCropComplete={handleBannerCropComplete}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default ManageCompanyLayout;
