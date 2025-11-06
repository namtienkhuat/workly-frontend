'use client';

import React from 'react';
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MessageSquareIcon, UserIcon } from 'lucide-react';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import SkeletonLayout from '../_components/SkeletonLayout';
import { CompanyProfile } from '@/types/global';

const CompanyProfileLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const { id } = useParams<{ id: string }>();
    const basePath = `/company/${id}`;

    const { data: companyProfileData, isLoading } = useGetCompanyProfile(id);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company;

    const isActive = (href: string, exact: boolean = false) => {
        if (!pathname) return false;
        if (exact) return pathname === href;
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const tabClass = (active: boolean) =>
        active
            ? 'px-2 py-1 border-b-2 border-primary text-primary hover:bg-primary/10 rounded-t-md'
            : 'px-2 py-1 border-b-2 border-transparent text-muted-foreground hover:bg-primary/10 rounded-t-md';

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
                                <CardDescription className="flex items-center gap-1 text-muted-foreground">
                                    <span>{companyProfile.industry.name}</span>
                                    <span>•</span>
                                    {companyProfile.location}
                                    <span>•</span>
                                    {1234} followers
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline">
                                    <MessageSquareIcon className="w-4 h-4" />
                                    Message
                                </Button>
                                <Button variant="outline">
                                    <UserIcon className="w-4 h-4" />
                                    Following
                                </Button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="px-2 py-1">
                        <div className="w-full border-t">
                            <nav className="flex gap-4 font-bold text-base py-2">
                                <Link
                                    href={basePath}
                                    className={tabClass(isActive(basePath, true))}
                                    aria-current={isActive(basePath, true) ? 'page' : undefined}
                                >
                                    About
                                </Link>
                                <Link
                                    href={`${basePath}/post`}
                                    className={tabClass(isActive(`${basePath}/post`))}
                                    aria-current={isActive(`${basePath}/post`) ? 'page' : undefined}
                                >
                                    Posts
                                </Link>
                                <Link
                                    href={`${basePath}/job`}
                                    className={tabClass(isActive(`${basePath}/job`))}
                                    aria-current={isActive(`${basePath}/job`) ? 'page' : undefined}
                                >
                                    Jobs
                                </Link>
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

export default CompanyProfileLayout;
