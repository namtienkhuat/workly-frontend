'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetUserProfile } from '@/hooks/useQueryData';
import { useParams } from 'next/navigation';
import { Skill, UserProfile } from '@/types/global';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const AboutPageSkeleton = () => {
    return (
        <Card>
            <CardHeader className="py-0 pt-4">
                <Skeleton className="h-8 w-32 rounded" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <Skeleton className="h-24 w-full rounded" />
                <Skeleton className="h-24 w-full rounded" />
            </CardContent>
        </Card>
    );
};

const UserProfilePage = () => {
    const { id } = useParams<{ id: string }>();

    const { data: userProfileData, isLoading } = useGetUserProfile(id);
    const userProfile: UserProfile = userProfileData?.data;
    const skillsFromProfile = userProfileData?.data?.relationships?.skills || [];

    if (isLoading) return <AboutPageSkeleton />;
    if (!userProfile) return <div>User not found</div>;

    return (
        <Card>
            <CardHeader className="py-0 pt-4">
                <CardTitle className="text-2xl">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                {/*
                <div>
                    <h3 className="text-lg font-semibold">Bio</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {userProfile.bio || 'No bio provided.'}
                    </p>
                </div>
                */}

                <div>
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {skillsFromProfile?.length > 0 ? (
                            skillsFromProfile.map((skill: Skill) => (
                                <Badge key={skill.skillId} variant="secondary">
                                    {skill.name}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Add your skills.</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold">Education</h3>
                    <div className="space-y-4 pt-2">
                        {userProfile.educations?.length > 0 ? (
                            userProfile.educations.map((edu: any) => (
                                <div key={edu.educationId || edu.schoolId} className="flex">
                                    <div>
                                        <p className="font-semibold">{edu.school.name}</p>
                                        <p className="text-sm text-gray-700">{edu.degree}</p>
                                        <p className="text-sm text-gray-500">{edu.major}</p>
                                        <p className="text-sm text-gray-500">
                                            {edu.startDate} - {edu.endDate || 'Present'}
                                        </p>
                                        <p className="text-sm text-gray-500">{edu.major}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No education listed.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserProfilePage;
