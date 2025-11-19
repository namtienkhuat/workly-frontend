'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserInfo from '@/components/user/UserInfo';
import CompanyInfo from '@/components/company/CompanyInfo';

// Fake data for suggested users
const suggestedUsers = [
    {
        userId: '1',
        name: 'John Smith',
        headline: 'Senior Software Engineer at Tech Corp',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
    {
        userId: '2',
        name: 'Sarah Johnson',
        headline: 'Product Manager | Startup Enthusiast',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
        userId: '3',
        name: 'Michael Chen',
        headline: 'UX Designer specializing in mobile apps',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    },
    {
        userId: '4',
        name: 'Emily Davis',
        headline: 'Data Scientist | Machine Learning Expert',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    },
    {
        userId: '5',
        name: 'David Wilson',
        headline: 'Full Stack Developer | Open Source Contributor',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
];

// Fake data for suggested companies
const suggestedCompanies = [
    {
        companyId: '1',
        name: 'TechVision Inc.',
        industry: 'Technology',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=TechVision',
    },
    {
        companyId: '2',
        name: 'Digital Solutions Co. Solutions Co.',
        industry: 'Digital',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Digital',
    },
    {
        companyId: '3',
        name: 'Innovation Labs',
        industry: 'Technology',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Innovation',
    },
];

const FollowButton = () => {
    const [isFollowing, setIsFollowing] = useState(false);

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFollowing(!isFollowing);
    };

    return (
        <Button
            size="sm"
            variant={isFollowing ? 'outline' : 'default'}
            className="h-8 px-3 text-xs"
            onClick={handleFollow}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
};

const RightSidebar = () => {
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* People you may know */}
            <Card className="pb-2">
                <CardHeader className="py-2 pt-4">
                    <CardTitle className="text-base font-semibold">People you may know</CardTitle>
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
                            actionButton={<FollowButton />}
                        />
                    ))}
                </CardContent>
            </Card>

            {/* Companies you may know */}
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
                            description={company.industry}
                            avatarUrl={company.avatarUrl}
                            showHover
                            onClick={() => router.push(`/company/${company.companyId}`)}
                            actionButton={<FollowButton />}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default RightSidebar;
