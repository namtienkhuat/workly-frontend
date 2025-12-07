'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserInfo from '@/components/user/UserInfo';
import { UserProfile } from '@/types/global';
import { useGetRecommendedUsers } from '@/hooks/useQueryData';
import FollowButton from '@/components/FollowButton';

const RightSidebar = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
    const { data: recommendedUsers } = useGetRecommendedUsers({
        page: 1,
        limit: 10,
    });

    useEffect(() => {
        if (!recommendedUsers) return;

        const userSuggested: UserProfile[] = recommendedUsers?.data?.recommendations || [];
        const filteredUsers = userSuggested.filter((user) => user.userId !== id);
        const randomUsers = filteredUsers.slice().slice(0, 5);

        setSuggestedUsers(randomUsers);
    }, [recommendedUsers, id]);

    return (
        <div className="space-y-6">
            {/* People you may know */}
            {suggestedUsers.length > 0 && (
                <Card className="pb-2">
                    <CardHeader className="py-2 pt-4">
                        <CardTitle className="text-base font-semibold">
                            People you may know
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-2">
                        {suggestedUsers.map((user) => (
                            <UserInfo
                                key={user.userId}
                                userId={user.userId}
                                name={user.name}
                                headline={user.headline}
                                avatarUrl={user.avatarUrl}
                                showHover
                                onClick={() => router.push(`/profile/${user.userId}`)}
                                actionButton={
                                    <FollowButton
                                        id={user.userId}
                                        isFollowing={false}
                                        type="user"
                                    />
                                }
                            />
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RightSidebar;
