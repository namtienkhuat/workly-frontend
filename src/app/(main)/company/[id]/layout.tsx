'use client';

import React from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { CompanyProfile } from '@/types/global';
import CompanyHeader from '@/components/company/CompanyHeader';
import CompanyTabNav from '@/components/company/CompanyTabNav';
import CompanySkeletonHeader from '@/components/company/CompanySkeletonHeader';
import { SetSidebar } from '@/components/layout/SetSideBar';
import RightSidebar from '../_components/RightSidebar';

const CompanyProfileLayout = ({ children }: { children: React.ReactNode }) => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: companyProfileData, isLoading } = useGetCompanyProfile(id);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company;

    if (isLoading) return <CompanySkeletonHeader />;

    if (!companyProfile) {
        return (
            <div className="w-full">
                <div className="min-h-[calc(100vh-300px)] flex items-center justify-center px-4 py-6">
                    <div className="max-w-3xl w-full">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20 shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                            <div
                                className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-pulse"
                                style={{ animationDelay: '1s' }}
                            />

                            <div className="relative p-12 text-center space-y-6">
                                <div className="flex justify-center mb-6">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                                            <svg
                                                className="h-16 w-16 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/70 bg-clip-text text-transparent">
                                        Company Not Found
                                    </h2>
                                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                                        The company page you&apos;re looking for doesn&apos;t exist
                                        or is temporarily unavailable.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                                    <div
                                        onClick={() => router.push('/companies')}
                                        className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group cursor-pointer"
                                    >
                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                            🏢
                                        </div>
                                        <div className="text-sm font-semibold mb-1">
                                            Browse Companies
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Explore other companies
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => router.push('/home')}
                                        className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group cursor-pointer"
                                    >
                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                            🏠
                                        </div>
                                        <div className="text-sm font-semibold mb-1">Go Home</div>
                                        <div className="text-xs text-muted-foreground">
                                            Back to feed
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => router.push('/jobs')}
                                        className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg group cursor-pointer"
                                    >
                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                            💼
                                        </div>
                                        <div className="text-sm font-semibold mb-1">Find Jobs</div>
                                        <div className="text-xs text-muted-foreground">
                                            Discover opportunities
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 pb-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                                        <svg
                                            className="h-4 w-4 text-primary"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-sm font-medium text-primary">
                                            Verify the company URL or name
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Try searching for the company or explore featured employers
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                        <div
                                            className="h-1 w-1 rounded-full bg-primary animate-pulse"
                                            style={{ animationDelay: '0.2s' }}
                                        />
                                        <div
                                            className="h-1 w-1 rounded-full bg-primary animate-pulse"
                                            style={{ animationDelay: '0.4s' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
