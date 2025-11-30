'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetUserProfile } from '@/hooks/useQueryData';
import { useParams } from 'next/navigation';
import { Skill, Industry, WorkExperience, Education } from '@/types/global';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
    SparklesIcon,
    Building2Icon,
    GraduationCapIcon,
    BriefcaseIcon,
    CalendarIcon,
    MapPinIcon,
    AwardIcon,
    TrendingUpIcon,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const AboutPageSkeleton = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-32 rounded" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full rounded" />
                    <Skeleton className="h-24 w-full rounded" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-32 rounded" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full rounded" />
                </CardContent>
            </Card>
        </div>
    );
};

const formatYear = (dateString?: string): string => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}T/.test(dateString)) {
        return dateString.substring(0, 4);
    }
    return dateString;
};

const UserProfilePage = () => {
    const { id } = useParams<{ id: string }>();

    const { data: userProfileData, isLoading } = useGetUserProfile(id);
    const skillsFromProfile = (userProfileData?.data?.relationships?.skills || []) as Skill[];
    const industriesFromProfile = (userProfileData?.data?.relationships?.industries ||
        []) as Industry[];
    const educationsFromProfile = (userProfileData?.data?.relationships?.educations ||
        []) as Education[];
    const workExperiencesFromProfile = (userProfileData?.data?.relationships?.workExperiences ||
        []) as WorkExperience[];

    if (isLoading) return <AboutPageSkeleton />;
    if (!userProfileData?.data) return <div>User not found</div>;

    return (
        <div className="space-y-6">
            {/* Skills & Industries Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills Card */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <SparklesIcon className="h-5 w-5 text-primary" />
                                Skills
                                {skillsFromProfile.length > 0 && (
                                    <Badge variant="secondary" className="ml-auto">
                                        {skillsFromProfile.length}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-6">
                        {skillsFromProfile.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {skillsFromProfile.map((skill: Skill) => (
                                    <Badge
                                        key={skill.skillId}
                                        variant="secondary"
                                        className="px-3 py-1.5 text-sm hover:bg-primary/20 transition-colors cursor-default"
                                    >
                                        <SparklesIcon className="h-3 w-3 mr-1.5" />
                                        {skill.name}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No skills listed yet
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Industries Card */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Building2Icon className="h-5 w-5 text-blue-600" />
                                Industries
                                {industriesFromProfile.length > 0 && (
                                    <Badge variant="secondary" className="ml-auto">
                                        {industriesFromProfile.length}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                    </div>
                    <CardContent className="pt-6">
                        {industriesFromProfile.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {industriesFromProfile.map((industry: Industry) => (
                                    <Badge
                                        key={industry.industryId}
                                        variant="outline"
                                        className="px-3 py-1.5 text-sm hover:bg-blue-500/10 transition-colors cursor-default"
                                    >
                                        <TrendingUpIcon className="h-3 w-3 mr-1.5" />
                                        {industry.name}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No industries listed yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Work Experience Card */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <BriefcaseIcon className="h-5 w-5 text-amber-600" />
                            Work Experience
                            {workExperiencesFromProfile.length > 0 && (
                                <Badge variant="secondary" className="ml-auto">
                                    {workExperiencesFromProfile.length}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                </div>
                <CardContent className="pt-6">
                    {workExperiencesFromProfile.length > 0 ? (
                        <div className="space-y-6">
                            {workExperiencesFromProfile.map((exp: WorkExperience, index) => (
                                <div key={index} className="relative pl-8 pb-6 last:pb-0">
                                    {/* Timeline line */}
                                    {index < workExperiencesFromProfile.length - 1 && (
                                        <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/50 to-transparent" />
                                    )}

                                    {/* Timeline dot */}
                                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                                        <BriefcaseIcon className="h-3 w-3 text-amber-600" />
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <h3 className="font-semibold text-lg">{exp.title}</h3>
                                            <p className="text-base font-medium text-muted-foreground">
                                                {exp.companyName || 'Company'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            <span>
                                                {formatYear(exp.startDate)} -{' '}
                                                {exp.endDate ? formatYear(exp.endDate) : 'Present'}
                                            </span>
                                        </div>

                                        {exp.description && (
                                            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No work experience listed yet
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Education Card */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-background">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <GraduationCapIcon className="h-5 w-5 text-green-600" />
                            Education
                            {educationsFromProfile.length > 0 && (
                                <Badge variant="secondary" className="ml-auto">
                                    {educationsFromProfile.length}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                </div>
                <CardContent className="pt-6">
                    {educationsFromProfile.length > 0 ? (
                        <div className="space-y-6">
                            {educationsFromProfile.map((edu: any, index) => (
                                <div key={edu.schoolId || index} className="relative pl-8 pb-6 last:pb-0">
                                    {/* Timeline line */}
                                    {index < educationsFromProfile.length - 1 && (
                                        <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-green-500/50 to-transparent" />
                                    )}

                                    {/* Timeline dot */}
                                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                                        <GraduationCapIcon className="h-3 w-3 text-green-600" />
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <h3 className="font-semibold text-lg">{edu.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="font-normal">
                                                    <AwardIcon className="h-3 w-3 mr-1" />
                                                    {edu.degree}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    • {edu.major}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            <span>
                                                {formatYear(edu.startDate)} -{' '}
                                                {edu.endDate ? formatYear(edu.endDate) : 'Present'}
                                            </span>
                                        </div>

                                        {edu.description && (
                                            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                                                {edu.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No education listed yet
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfilePage;
