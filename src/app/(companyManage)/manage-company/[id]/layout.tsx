'use client';

import React, { useMemo } from 'react';
import { Card, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { CompanyProfile } from '@/types/global';
import LayoutSkeleton from '../_components/LayoutSkeleton';
import { cn } from '@/lib/utils';

interface TabConfig {
    label: string;
    path: string;
    exact?: boolean;
}

const ManageCompanyLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const { id } = useParams<{ id: string }>();
    const basePath = `/manage-company/${id}`;

    const { data: companyProfileData, isLoading } = useGetCompanyProfile(id);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company;

    const tabs: TabConfig[] = useMemo(
        () => [
            { label: 'Overview', path: basePath, exact: true },
            { label: 'Edit Information', path: `${basePath}/edit` },
            { label: 'Admins', path: `${basePath}/admins` },
            { label: 'Posts', path: `${basePath}/posts` },
            { label: 'Hiring', path: `${basePath}/hiring` },
            { label: 'Candidates', path: `${basePath}/candidates` },
        ],
        [basePath]
    );

    const isTabActive = (tab: TabConfig): boolean => {
        if (!pathname) return false;
        if (tab.exact) return pathname === tab.path;
        return pathname === tab.path || pathname.startsWith(`${tab.path}/`);
    };

    if (isLoading) {
        return <LayoutSkeleton />;
    }

    if (!companyProfile) return <div>Company not found</div>;

    return (
        <div className="flex flex-col my-10">
            <div>
                <Card className="mx-auto max-w-5xl">
                    <div className="w-full h-40 bg-muted" />

                    <CardContent className="-mt-12">
                        <div className="h-24 w-24 rounded-md border bg-background" />
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <CardTitle className="text-3xl">{companyProfile.name}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={`/company/${id}`}>View Public Page</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="px-2 py-1">
                        <div className="w-full border-t">
                            <nav className="flex gap-4 font-bold text-base py-2">
                                {tabs.map((tab) => {
                                    const isActive = isTabActive(tab);
                                    return (
                                        <Link
                                            key={tab.path}
                                            href={tab.path}
                                            className={cn(
                                                'px-2 py-1 border-b-2 rounded-t-md transition-colors',
                                                isActive
                                                    ? 'border-primary text-primary hover:bg-primary/10'
                                                    : 'border-transparent text-muted-foreground hover:bg-primary/10'
                                            )}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            {tab.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Page content */}
            <div className="mt-4">
                <div className="mx-auto max-w-5xl">{children}</div>
            </div>
        </div>
    );
};

export default ManageCompanyLayout;
