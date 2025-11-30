'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { useParams } from 'next/navigation';
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
    const { isLoading: isLoadingAuth, user: currentUser } = useAuth();
    const [isCurrentUser, setIsCurrentUser] = useState(false);

    const { data: userProfileData, isLoading } = useGetUserBasicInfo(id);
    const userProfile: UserProfile = {
        ...userProfileData?.data?.user,
        location: userProfileData?.data?.relationships?.location,
    };

    useEffect(() => {
        setIsCurrentUser(currentUser?.userId === id);
    }, [currentUser, id]);

    if (isLoading || isLoadingAuth) return <ProfileSkeleton />;
    if (!userProfile) return <div>User not found</div>;

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
                            <ProfileTabNav isOwner={false} userId={id} />
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
