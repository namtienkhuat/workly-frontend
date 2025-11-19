'use client';

import React from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { CompanyProfile } from '@/types/global';
import CompanyHeader from '@/components/company/CompanyHeader';
import CompanyTabNav from '@/components/company/CompanyTabNav';
import CompanySkeletonHeader from '@/components/company/CompanySkeletonHeader';
import { SetSidebar } from '@/components/layout/SetSideBar';
import RightSidebar from '../_components/RightSidebar';

const CompanyProfileLayout = ({ children }: { children: React.ReactNode }) => {
    const { id } = useParams<{ id: string }>();

    const { data: companyProfileData, isLoading } = useGetCompanyProfile(id);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company;

    if (isLoading) return <CompanySkeletonHeader />;
    if (!companyProfile) return <div>Company not found</div>;

    return (
        <>
            <SetSidebar position="right">
                <RightSidebar />
            </SetSidebar>

            <div className="flex flex-col mb-20">
                <div>
                    <Card className="mx-auto max-w-5xl ">
                        <CompanyHeader companyProfile={companyProfile} />

                        <CardFooter className="px-2 py-1">
                            <CompanyTabNav companyId={id} />
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

export default CompanyProfileLayout;
