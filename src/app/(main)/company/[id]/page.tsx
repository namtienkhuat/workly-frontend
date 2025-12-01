'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCompanyProfile } from '@/hooks/useQueryData';
import { useParams } from 'next/navigation';
import { CompanyProfile } from '@/types/global';
import CompanyInfoSkeleton from '@/components/company/CompanyInfoSkeleton';
import {
    Building2Icon,
    GlobeIcon,
    TrendingUpIcon,
    UsersIcon,
    CalendarIcon,
    ExternalLinkIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CompanyProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const { data: companyProfileData, isLoading } = useGetCompanyProfile(id);
    const companyProfile: CompanyProfile = companyProfileData?.data?.company;

    if (isLoading) return <CompanyInfoSkeleton />;
    if (!companyProfile) return <div>Company not found</div>;

    return (
        <div className="space-y-6">
            {/* About Section */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Building2Icon className="h-5 w-5 text-primary" />
                            About {companyProfile.name}
                        </CardTitle>
                    </CardHeader>
                </div>
                <CardContent className="pt-6">
                    {companyProfile.description ? (
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                            {companyProfile.description}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No description available
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Company Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Industry Card */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                                Industry
                            </CardTitle>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-4">
                        {companyProfile.industry ? (
                            <Badge
                                variant="outline"
                                className="px-3 py-1.5 text-sm hover:bg-blue-500/10 transition-colors cursor-default"
                            >
                                <TrendingUpIcon className="h-3 w-3 mr-1.5" />
                                {companyProfile.industry.name}
                            </Badge>
                        ) : (
                            <p className="text-sm text-muted-foreground">Not specified</p>
                        )}
                    </CardContent>
                </Card>

                {/* Company Size Card */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-background">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <UsersIcon className="h-5 w-5 text-purple-600" />
                                Company Size
                            </CardTitle>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-4">
                        {companyProfile.size ? (
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className="px-3 py-1.5 text-sm cursor-default"
                                >
                                    <UsersIcon className="h-3 w-3 mr-1.5" />
                                    {companyProfile.size} employees
                                </Badge>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Not specified</p>
                        )}
                    </CardContent>
                </Card>

                {/* Founded Year Card */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarIcon className="h-5 w-5 text-amber-600" />
                                Founded Year
                            </CardTitle>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-4">
                        {companyProfile.foundedYear ? (
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="px-3 py-1.5 text-sm hover:bg-amber-500/10 transition-colors cursor-default"
                                >
                                    <CalendarIcon className="h-3 w-3 mr-1.5" />
                                    {companyProfile.foundedYear}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date().getFullYear() - companyProfile.foundedYear} years old
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Not specified</p>
                        )}
                    </CardContent>
                </Card>

                {/* Website Card */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-background">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <GlobeIcon className="h-5 w-5 text-green-600" />
                                Website
                            </CardTitle>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-4">
                        {companyProfile.website ? (
                            <a
                                href={companyProfile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-md transition-colors group"
                            >
                                <GlobeIcon className="h-3.5 w-3.5" />
                                <span className="font-medium">Visit Website</span>
                                <ExternalLinkIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ) : (
                            <p className="text-sm text-muted-foreground">Not specified</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CompanyProfilePage;
