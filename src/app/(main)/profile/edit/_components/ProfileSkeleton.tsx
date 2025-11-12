'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

const ProfileSkeleton = () => {
    return (
        <div className="flex flex-col">
            <div>
                <Card className="mx-auto max-w-5xl">
                    <Skeleton className="w-full h-40" />
                    <CardContent className="-mt-12">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-96" />
                            </div>
                            <div className="flex items-center gap-2 pb-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="px-2 py-1">
                        <div className="w-full border-t">
                            <nav className="flex gap-4 font-bold text-base py-2">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-16" />
                            </nav>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <div className="mt-4">
                <div className="mx-auto max-w-5xl">
                    <Card>
                        <CardContent className="p-4">
                            <Skeleton className="h-32 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
