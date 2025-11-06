'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { CompanyProfile } from '@/types/global';

const ManageCompanyPage = () => {
    const { id } = useParams<{ id: string }>();
    const { data: companyProfileData, isLoading } = useGetCompanyProfile(id as string);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company;

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="py-0 pt-4">
                    <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-24 w-full bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    if (!companyProfile) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p>Company not found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="py-0 pt-4">
                <CardTitle className="text-2xl">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm leading-6 text-gray-700">
                        {companyProfile.description || 'No description available.'}
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold">Website</h3>
                    {companyProfile.website ? (
                        <a
                            href={companyProfile.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {companyProfile.website}
                        </a>
                    ) : (
                        <p className="text-sm text-gray-700">Not provided</p>
                    )}
                </div>

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
                    <h3 className="text-lg font-semibold">Location</h3>
                    <p className="text-sm text-gray-700">{companyProfile.location}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default ManageCompanyPage;
