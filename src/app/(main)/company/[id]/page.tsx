'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { useParams } from 'next/navigation';
import { CompanyProfile } from '@/types/global';
import CompanyInfoSkeleton from '@/components/company/CompanyInfoSkeleton';

const CompanyProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const { data: companyProfileData, isLoading } = useGetCompanyProfile(id);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company;

    if (isLoading) return <CompanyInfoSkeleton />;
    if (!companyProfile) return <div>Company not found</div>;

    return (
        <Card>
            <CardHeader className="py-0 pt-4">
                <CardTitle className="text-2xl">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="pt-2">
                    <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                        {companyProfile.description}
                    </p>
                </div>

                {companyProfile.website && (
                    <div>
                        <h3 className="text-lg font-semibold">Website</h3>
                        <a
                            href={companyProfile.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {companyProfile.website}
                        </a>
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-semibold">Industry</h3>
                    <p className="text-sm text-gray-700">{companyProfile.industry.name}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold">Company size</h3>
                    <p className="text-sm text-gray-700">
                        {companyProfile.size || 'Not specified'}
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold">Founded year</h3>
                    <p className="text-sm text-gray-700">{companyProfile.foundedYear}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default CompanyProfilePage;
