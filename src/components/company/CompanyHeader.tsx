import { CompanyProfile } from '@/types/global';
import Image from 'next/image';
import React, { useState } from 'react';
import { CardContent, CardDescription, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import Link from 'next/link';
import { EditIcon, MessageSquareIcon, PlusIcon, UserIcon } from 'lucide-react';
import clsx from 'clsx';

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
                        <CardDescription className="text-sm text-muted-foreground">
                            {companyProfile.description}
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
                                    // onClick={() => toast.info('This feature is not available yet')}
                                >
                                    <MessageSquareIcon className="w-4 h-4" />
                                    Message
                                </Button>
                                <Button
                                    variant="outline"
                                    // onClick={() => toast.info('This feature is not available yet')}
                                >
                                    <UserIcon className="w-4 h-4" />
                                    Following
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </>
    );
};

export default CompanyHeader;
