import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

const CompanySkeletonHeader = () => {
    return (
        <Card className="mx-auto max-w-5xl">
            <Skeleton className="relative w-full h-40 rounded-t-lg" />

            <CardContent className="relative -mt-12">
                <Skeleton className="h-36 w-36 rounded-full border-2 border-muted shadow-lg" />

                <div className="mt-2 flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-9 w-64" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-96" />
                            <Skeleton className="h-4 w-80" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CompanySkeletonHeader;
