'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CompanyProfile } from '@/types/global';
import { useGetRecommendedCompanies } from '@/hooks/useQueryData';
import CompanyInfo from '@/components/company/CompanyInfo';

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
    const { id } = useParams<{ id: string }>();

    const [suggestedCompanies, setSuggestedCompanies] = useState<CompanyProfile[]>([]);
    const { data: recommendedCompanies } = useGetRecommendedCompanies({
        page: 1,
        limit: 10,
    });

    useEffect(() => {
        if (!recommendedCompanies) return;

        const companySuggested: CompanyProfile[] =
            recommendedCompanies?.data?.recommendations || [];
        const filteredCompanies = companySuggested.filter((company) => company.companyId !== id);
        const randomCompanies = filteredCompanies.slice().slice(0, 5);

        setSuggestedCompanies(randomCompanies);
    }, [recommendedCompanies, id]);

    return (
        <div className="space-y-6">
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
                                actionButton={<FollowButton />}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RightSidebar;
