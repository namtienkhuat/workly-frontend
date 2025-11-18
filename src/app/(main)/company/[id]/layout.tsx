'use client';

import React, { useMemo } from 'react';
import { Card, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MessageSquareIcon, UserIcon } from 'lucide-react';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { CompanyProfile } from '@/types/global';
import SkeletonLayout from '../_components/SkeletonLayout';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TabConfig {
    label: string;
    path: string;
    exact?: boolean;
}

const CompanyProfileLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const basePath = `/company/${id}`;

    const { data: companyProfileData, isLoading } = useGetCompanyProfile(id);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company;

    const tabs: TabConfig[] = useMemo(
        () => [
            { label: 'About', path: basePath, exact: true },
            { label: 'Posts', path: `${basePath}/post` },
            { label: 'Jobs', path: `${basePath}/job` },
        ],
        [basePath]
    );

    const isTabActive = (tab: TabConfig): boolean => {
        if (!pathname) return false;
        if (tab.exact) return pathname === tab.path;
        return pathname === tab.path || pathname.startsWith(`${tab.path}/`);
    };

    if (isLoading) return <SkeletonLayout />;
    if (!companyProfile) return <div>Company not found</div>;

    return (
        <div className="flex flex-col">
            <div>
                <Card className="mx-auto max-w-5xl ">
                    <div className="w-full h-40 bg-muted" />

                    <CardContent className="-mt-12">
                        <div className="h-24 w-24 rounded-md border bg-background" />
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <CardTitle className="text-3xl">{companyProfile.name}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/chat/company/${id}`)}
                                >
                                    <MessageSquareIcon className="w-4 h-4" />
                                    Message
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => toast.info('This feature is not available yet')}
                                >
                                    <UserIcon className="w-4 h-4" />
                                    Following
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

            <div className="mt-4">
                <div className="mx-auto max-w-5xl">{children}</div>
            </div>
        </div>
    );
};

export default CompanyProfileLayout;
