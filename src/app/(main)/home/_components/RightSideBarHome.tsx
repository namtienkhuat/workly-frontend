'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserInfo from '@/components/user/UserInfo';
import CompanyInfo from '@/components/company/CompanyInfo';
import { useGetRecommendedCompanies, useGetRecommendedUsers } from '@/hooks/useQueryData';
import { CompanyProfile, UserProfile } from '@/types/global';
import FollowButton from '@/components/FollowButton';

const RightSidebarHome = () => {
    const router = useRouter();

    const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
    const [suggestedCompanies, setSuggestedCompanies] = useState<CompanyProfile[]>([]);
    const { data: recommendedUsers } = useGetRecommendedUsers({
        page: 1,
        limit: 5,
    });
    const { data: recommendedCompanies } = useGetRecommendedCompanies({
        page: 1,
        limit: 3,
    });

    useEffect(() => {
        if (recommendedUsers) {
            setSuggestedUsers(recommendedUsers?.data?.recommendations);
        }
    }, [recommendedUsers]);

    useEffect(() => {
        if (recommendedCompanies) {
            setSuggestedCompanies(recommendedCompanies?.data?.recommendations);
        }
    }, [recommendedCompanies]);

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
            {/* Companies you may know */}
            {suggestedCompanies.length > 0 && (
                <Card>
                    <CardHeader className="py-2 pt-4">
                        <CardTitle className="text-base font-semibold">
                            Companies you may know
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-2">
                        {suggestedCompanies.map((company) => (
                            <CompanyInfo
                                key={company.companyId}
                                companyId={company.companyId}
                                name={company.name}
                                description={company.industry?.name}
                                avatarUrl={company.logoUrl}
                                showHover
                                onClick={() => router.push(`/company/${company.companyId}`)}
                                actionButton={
                                    <FollowButton
                                        id={company.companyId}
                                        isFollowing={false}
                                        type="company"
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

export default RightSidebarHome;
