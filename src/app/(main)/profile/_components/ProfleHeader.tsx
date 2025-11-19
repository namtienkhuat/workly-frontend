import { Button } from '@/components/ui/Button';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@/types/global';
import clsx from 'clsx';
import { EditIcon, MessageSquareIcon, PlusIcon, UserCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

interface ProfleHeaderProps {
    userProfile: UserProfile;
    isEditable?: boolean;
    isCurrentUser?: boolean;
    handleBgCoverClick?: () => void;
    handleAvatarClick?: () => void;
}

const ProfleHeader = ({
    userProfile,
    isEditable,
    isCurrentUser,
    handleBgCoverClick,
    handleAvatarClick,
}: ProfleHeaderProps) => {
    const [isBannerError, setIsBannerError] = useState(false);
    const [isLogoError, setIsLogoError] = useState(false);

    return (
        <>
            <div
                className={clsx(
                    'relative w-full h-40 overflow-hidden rounded-t-lg',
                    isEditable && 'cursor-pointer hover:opacity-80 transition-opacity group'
                )}
                onClick={handleBgCoverClick}
            >
                {userProfile.bgCoverUrl && !isBannerError ? (
                    <Image
                        src={userProfile.bgCoverUrl}
                        alt={userProfile.name}
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
                            {isBannerError || !userProfile.bgCoverUrl ? (
                                <>
                                    <PlusIcon className="h-4 w-4" />
                                    Add Background Cover
                                </>
                            ) : (
                                <>
                                    <EditIcon className="h-4 w-4" />
                                    Edit Background Cover
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
                    onClick={handleAvatarClick}
                >
                    {userProfile.avatarUrl && !isLogoError ? (
                        <Image
                            src={userProfile.avatarUrl}
                            alt={userProfile.name}
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
                            {isLogoError ? 'Add Avatar' : 'Edit'}
                        </span>
                    </div>
                </div>

                <div className="mt-2 flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="text-3xl">{userProfile.name}</CardTitle>
                        <CardDescription className="flex gap-2 mt-2">
                            {' '}
                            {userProfile.username}
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        {isCurrentUser ? (
                            <Button variant="outline" asChild>
                                <Link href={`/profile/edit`}>Edit Profile</Link>
                            </Button>
                        ) : isEditable ? (
                            <Button variant="outline" asChild>
                                <Link href={`/profile/${userProfile.userId}`}>View Profile</Link>
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
                                //     variant="outline"
                                //     className={clsx(
                                //         isFollowing &&
                                //             'bg-primary text-primary-foreground hover:bg-primary/90'
                                //     )}
                                //     onClick={isFollowing ? handleUnfollow : handleFollow}
                                >
                                    {/* {isFollowing ? ( */}
                                    <>
                                        <UserCheck className="w-4 h-4" />
                                        Following
                                    </>
                                    {/* ) : (
                                        <>
                                            <UserRoundPlus className="w-4 h-4" />
                                            Follow
                                        </>
                                    )} */}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            {/* <CompanyFollowerModal
                companyId={companyProfile.companyId}
                open={isFollowerModalOpen}
                onOpenChange={setIsFollowerModalOpen}
                followersCount={companyProfile.followersCount || 0}
            /> */}
        </>
    );
};

export default ProfleHeader;
